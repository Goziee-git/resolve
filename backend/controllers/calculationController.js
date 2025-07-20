const Calculation = require('../models/Calculation');

// Calculate and save a new calculation
exports.calculate = async (req, res) => {
  try {
    const { firstNumber, secondNumber, operation } = req.body;
    
    let result;
    switch (operation) {
      case 'add':
        result = firstNumber + secondNumber;
        break;
      case 'subtract':
        result = firstNumber - secondNumber;
        break;
      case 'multiply':
        result = firstNumber * secondNumber;
        break;
      case 'divide':
        if (secondNumber === 0) {
          return res.status(400).json({ message: 'Cannot divide by zero' });
        }
        result = firstNumber / secondNumber;
        break;
      default:
        return res.status(400).json({ message: 'Invalid operation' });
    }

    const calculation = new Calculation({
      firstNumber,
      secondNumber,
      operation,
      result
    });

    const savedCalculation = await calculation.save();
    res.status(201).json(savedCalculation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get calculation history
exports.getHistory = async (req, res) => {
  try {
    const calculations = await Calculation.find().sort({ timestamp: -1 }).limit(10);
    res.status(200).json(calculations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
