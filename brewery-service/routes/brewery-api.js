const tracer = require('../../tracer');
tracer.init('Brewery-Service');

const Router = require('express').Router;
const router = new Router();
const amqp = require('amqplib');
const axios = require('axios')

var channel, connection;

// RabbitMQ connection
async function connectToRabbitMQ() {
  const amqpServer = 'amqp://guest:guest@localhost:5672';
  connection = await amqp.connect(amqpServer);
  channel = await connection.createChannel();
  await channel.assertQueue('brewery-service-queue');
}

connectToRabbitMQ();

// Fetch new beer from external API
router.get('/newBeer', async (req, res) => {
  try {
    const apiResponse = await axios.get('https://random-data-api.com/api/v2/beers');
    const newBeer = apiResponse.data;

    if(!newBeer || Object.keys(newBeer).length === 0 || req.query.fail) {
      console.error('Failed to fetch data');
      return res.status(500);
    }

    // Send msg with new data to inventory queue on RabbitMQ
    channel.sendToQueue(
      'inventory-service-queue',
      Buffer.from(
        JSON.stringify(newBeer)
      )
    );

    // Consume from RabbitMQ and acknowledge
    const apiDataPromise = new Promise((resolve, reject) => {
      channel.consume('brewery-service-queue', (data) => {
        console.log('Consumed from brewery-service-queue');
        const apiData = JSON.parse(data.content);
        channel.ack(data);
        resolve(apiData);
        console.log('Beer created in inventory');
      });
    });
  
    res
      .status(201)
      .json({
        message: 'New beer saved successfully',
        newBeer: await apiDataPromise, 
      });

  } catch (error) {
    console.error(`Critical error ->`, error.message || error)
    res.status(error?.status || 500)
  }  
});

module.exports = router;
