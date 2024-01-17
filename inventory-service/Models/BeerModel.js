const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BeerSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  style: {
    type: String,
    required: true,
  },
  alcohol: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    default: 10,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('BeerModel', BeerSchema);
