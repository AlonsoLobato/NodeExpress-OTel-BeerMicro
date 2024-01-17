const tracer = require('../tracer');
tracer.init('Inventory-Service');

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const mongoose = require('mongoose');
const amqp = require('amqplib');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
var channel, connection;

require('dotenv').config();

// DB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Inventory-Service Connected to MongoDB'))
  .catch((e) => console.log(e));

// Data access functions
const inventoryDB = require('./Models/DataAccess/InventoryRepository');

async function connectToRabbitMQ() {
  try {
    const amqpServer = 'amqp://guest:guest@localhost:5672';
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
    await channel.assertQueue('inventory-service-queue');

    channel.consume('inventory-service-queue', async (data) => {
      try {
        console.log('Consumed from inventory-service-queue');
        const requestType = data.content.toString();

        if (requestType === 'GetBeerListRequest') {
          // Fetch all beers from inventory
          const beerList = await inventoryDB.fetchBeersList();
          channel.sendToQueue(
            'bar-service-queue',
            Buffer.from(JSON.stringify(beerList))
          );
          console.log('Beer menu fetched from inventory and sent to bar-service queue');

        } else {
          // Create new beer with data from brewery-api
          const beerInfo = JSON.parse(data.content);
          const newBeer = inventoryDB.createBeer(beerInfo);
          channel.sendToQueue(
            'brewery-service-queue',
            Buffer.from(JSON.stringify(newBeer))
          );
          console.log('New beer added to inventory');
        }

        // Acknowledge the message
        channel.ack(data);
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });
  } catch (error) {
    console.error('Error connecting to RabbitMQ:', error);
  }
}

connectToRabbitMQ();

app.listen(PORT, () => {
  if (NODE_ENV === 'development') {
    console.log(`Inventory API listening on port ${PORT} (development mode)`);
  } else {
    console.log(`Inventory API listening on port ${PORT} (production mode)`);
  };
});

