import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Calculator from './components/Calculator';
import CalculationHistory from './components/CalculationHistory';
import './styles/App.css';

function App() {
  const [calculations, setCalculations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch calculation history
  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/calculations/history');
      setCalculations(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch calculation history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Perform calculation
  const performCalculation = async (firstNumber, secondNumber, operation) => {
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/calculations', {
        firstNumber: parseFloat(firstNumber),
        secondNumber: parseFloat(secondNumber),
        operation
      });
      fetchHistory(); // Refresh history after new calculation
    } catch (err) {
      setError('Failed to perform calculation');
      console.error(err);
      setLoading(false);
    }
  };

  // Load calculation history on component mount
  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="app">
      <h1>MERN Calculator</h1>
      <Calculator onCalculate={performCalculation} />
      {error && <p className="error">{error}</p>}
      <CalculationHistory calculations={calculations} loading={loading} />
    </div>
  );
}

export default App;
