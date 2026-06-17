import { useState, useEffect } from 'react';
import { calculateBisection, calculateSecant, calculateNewton } from '../utils/math';

/**
 * A generic hook for numerical method calculations
 * @param {string} method - Method name ('bisection', 'secant', 'newton')
 * @returns {Object} - Calculation state and functions
 */
const useMethodCalculation = (method) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [calculation, setCalculation] = useState(null);
  
  // Calculate root using selected method
  const calculate = (params) => {
    setLoading(true);
    setError(null);
    
    try {
      let result;
      
      switch (method) {
        case 'bisection':
          result = calculateBisection(
            params.functionString, 
            params.a, 
            params.b,
            params.tolerance
          );
          break;
          
        case 'secant':
          result = calculateSecant(
            params.functionString, 
            params.a, 
            params.b,
            params.tolerance
          );
          break;
          
        case 'newton':
          result = calculateNewton(
            params.functionString, 
            params.derivativeString,
            params.x0,
            params.tolerance
          );
          break;
          
        default:
          throw new Error(`Unknown method: ${method}`);
      }
      
      setCalculation(result);
      setLoading(false);
      return result;
    } catch (error) {
      setError(error.message);
      setLoading(false);
      return null;
    }
  };
  
  // Reset calculation state
  const reset = () => {
    setCalculation(null);
    setError(null);
  };
  
  return {
    loading,
    error,
    calculation,
    calculate,
    reset
  };
};

export default useMethodCalculation;