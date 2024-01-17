const tracer = require('../../tracer');
tracer.init('Bar-Service');

const Router = require('express').Router;
const router = new Router();
const amqp = require('amqplib');

var channel, connection;

// RabbitMQ connection
async function connectToRabbitMQ() {
  const amqpServer = 'amqp://guest:guest@localhost:5672';
  connection = await amqp.connect(amqpServer);
  channel = await connection.createChannel();
  await channel.assertQueue('bar-service-queue');
}

connectToRabbitMQ();

// Fetch list of beers from inventory
router.get('/barMenu', async (req, res) => {
  try {
    channel.sendToQueue(
      'inventory-service-queue',
      Buffer.from('GetBeerListRequest')
    );

    const beerList = new Promise((resolve, reject) => {
      channel.consume('bar-service-queue', (data) => {
        console.log('Consumed from bar-service-queue');
        const apiData = JSON.parse(data.content);
        channel.ack(data);
        resolve(apiData);
        console.log('Beer menu received from inventory');
      });
    });

    if (await beerList.length === 0) {
      res
        .status(200)
        .json({
          message: 'Bar Menu empty',
        })
    } else {
      res
        .status(200)
        .json({
          message: 'Bar Menu fetched correctly',
          data: await beerList,
        })
    }

  } catch (error) {
    console.error(`Critical error ->`, error.message || error)
    res.status(error?.status || 500)
  }
});

module.exports = router;
