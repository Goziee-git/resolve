const mongoose = require('mongoose');

const calculationSchema = new mongoose.Schema({
  firstNumber: {
    type: Number,
    required: true
  },
  secondNumber: {
    type: Number,
    required: true
  },
  operation: {
    type: String,
    required: true,
    enum: ['add', 'subtract', 'multiply', 'divide']
  },
  result: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Calculation', calculationSchema);
