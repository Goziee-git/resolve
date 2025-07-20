import React, { useState } from 'react';
import '../styles/Calculator.css';

const Calculator = ({ onCalculate }) => {
  const [firstNumber, setFirstNumber] = useState('');
  const [secondNumber, setSecondNumber] = useState('');
  const [operation, setOperation] = useState('add');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (firstNumber && secondNumber) {
      onCalculate(firstNumber, secondNumber, operation);
      // Reset form after submission
      setFirstNumber('');
      setSecondNumber('');
    }
  };

  return (
    <div className="calculator">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="firstNumber">First Number:</label>
          <input
            type="number"
            id="firstNumber"
            value={firstNumber}
            onChange={(e) => setFirstNumber(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="operation">Operation:</label>
          <select
            id="operation"
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
          >
            <option value="add">Addition (+)</option>
            <option value="subtract">Subtraction (-)</option>
            <option value="multiply">Multiplication (×)</option>
            <option value="divide">Division (÷)</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="secondNumber">Second Number:</label>
          <input
            type="number"
            id="secondNumber"
            value={secondNumber}
            onChange={(e) => setSecondNumber(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" className="calculate-btn">Calculate</button>
      </form>
    </div>
  );
};

export default Calculator;
