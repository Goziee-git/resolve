import React from 'react';
import '../styles/CalculationHistory.css';

const CalculationHistory = ({ calculations, loading }) => {
  // Helper function to format operation for display
  const formatOperation = (op) => {
    switch (op) {
      case 'add': return '+';
      case 'subtract': return '-';
      case 'multiply': return '×';
      case 'divide': return '÷';
      default: return op;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return <div className="loading">Loading history...</div>;
  }

  return (
    <div className="history">
      <h2>Calculation History</h2>
      {calculations.length === 0 ? (
        <p>No calculations yet</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Calculation</th>
              <th>Result</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {calculations.map((calc) => (
              <tr key={calc._id}>
                <td>
                  {calc.firstNumber} {formatOperation(calc.operation)} {calc.secondNumber}
                </td>
                <td>{calc.result}</td>
                <td>{formatDate(calc.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CalculationHistory;
