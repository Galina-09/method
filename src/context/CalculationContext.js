import React, { createContext, useState, useContext } from 'react';

// Create context
const CalculationContext = createContext();

// Custom hook to use the calculation context
export const useCalculation = () => useContext(CalculationContext);

export const CalculationProvider = ({ children }) => {
  // Shared state for all calculation methods
  const [calculationHistory, setCalculationHistory] = useState({
    bisection: [],
    secant: [],
    newton: []
  });
  
  const [currentCalculationIndex, setCurrentCalculationIndex] = useState({
    bisection: -1,
    secant: -1,
    newton: -1
  });

  // Function to add a calculation to history
  const addCalculation = (method, calculation) => {
    setCalculationHistory(prev => {
      const newHistory = { 
        ...prev, 
        [method]: [...prev[method], calculation] 
      };
      return newHistory;
    });
    
    setCurrentCalculationIndex(prev => ({
      ...prev,
      [method]: prev[method] + 1
    }));
  };

  // Navigate to previous calculation
  const previousCalculation = (method) => {
    if (currentCalculationIndex[method] > 0) {
      setCurrentCalculationIndex(prev => ({
        ...prev,
        [method]: prev[method] - 1
      }));
      return calculationHistory[method][currentCalculationIndex[method] - 1];
    }
    return null;
  };

  // Navigate to next calculation
  const nextCalculation = (method) => {
    if (currentCalculationIndex[method] < calculationHistory[method].length - 1) {
      setCurrentCalculationIndex(prev => ({
        ...prev,
        [method]: prev[method] + 1
      }));
      return calculationHistory[method][currentCalculationIndex[method] + 1];
    }
    return null;
  };

  // Get current calculation
  const getCurrentCalculation = (method) => {
    if (currentCalculationIndex[method] >= 0 && calculationHistory[method].length > 0) {
      return calculationHistory[method][currentCalculationIndex[method]];
    }
    return null;
  };

  // Export comparison data for all methods
  const getComparisonData = () => {
    return {
      bisection: getCurrentCalculation('bisection'),
      secant: getCurrentCalculation('secant'),
      newton: getCurrentCalculation('newton')
    };
  };

  // Clear history for a method
  const clearHistory = (method) => {
    setCalculationHistory(prev => ({
      ...prev,
      [method]: []
    }));
    
    setCurrentCalculationIndex(prev => ({
      ...prev,
      [method]: -1
    }));
  };

  const value = {
    calculationHistory,
    currentCalculationIndex,
    addCalculation,
    previousCalculation,
    nextCalculation,
    getCurrentCalculation,
    getComparisonData,
    clearHistory
  };

  return (
    <CalculationContext.Provider value={value}>
      {children}
    </CalculationContext.Provider>
  );
};