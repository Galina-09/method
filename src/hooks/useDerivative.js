import { useState, useEffect } from 'react';
import * as math from 'mathjs';

/**
 * Hook for automatic derivative calculation with improved error handling
 * @param {string} functionString - Function string to differentiate
 * @returns {string} - Calculated derivative
 */
export const useDerivative = (functionString) => {
  const [derivative, setDerivative] = useState('');
  
  useEffect(() => {
    // Only calculate derivative if functionString is a valid string
    if (typeof functionString !== 'string' || !functionString.trim()) {
      return;
    }
    
    try {
      // First validate that the function can be evaluated
      math.evaluate(functionString, { x: 1 });
      
      // Then attempt to calculate the derivative
      try {
        const result = math.derivative(functionString, 'x').toString();
        setDerivative(result);
      } catch (error) {
        // If mathjs fails to calculate derivative, use fallback pattern matching
        const simpleDerivative = calculateSimpleDerivative(functionString);
        if (simpleDerivative) {
          setDerivative(simpleDerivative);
        } else {
          console.warn("Could not calculate derivative:", error.message);
        }
      }
    } catch (error) {
      // Invalid function - don't set derivative
      console.warn("Invalid function for derivative:", error);
    }
  }, [functionString]);
  
  return derivative;
};

/**
 * Helper function to calculate simple derivatives
 * @param {string} functionString - Function string
 * @returns {string|null} - Derivative or null if can't be calculated
 */
const calculateSimpleDerivative = (functionString) => {
  // Basic patterns for simple derivatives
  const patterns = [
    { regex: /^x$/i, derivative: '1' },
    { regex: /^x\^(\d+)$/i, derivative: (match) => {
      const power = parseInt(match[1]);
      return power > 1 ? `${power}*x^${power-1}` : '1';
    }},
    { regex: /^(\d+)$/i, derivative: '0' },
    { regex: /^(\d+)\*x$/i, derivative: (match) => match[1] },
    { regex: /^(\d+)\*x\^(\d+)$/i, derivative: (match) => {
      const coef = parseInt(match[1]);
      const power = parseInt(match[2]);
      return power > 1 ? `${coef*power}*x^${power-1}` : `${coef}`;
    }}
  ];
  
  // Try to match patterns
  for (const pattern of patterns) {
    const match = functionString.match(pattern.regex);
    if (match) {
      return typeof pattern.derivative === 'function' 
        ? pattern.derivative(match) 
        : pattern.derivative;
    }
  }
  
  return null;
};

/**
 * Hook for finding interval with sign change with improved error handling
 * @param {string} functionString - Function string
 * @returns {Object} - Interval with start and end properties
 */
export const useIntervalFinder = (functionString) => {
  const [interval, setInterval] = useState({ start: -2, end: 2 });
  
  useEffect(() => {
    // Only calculate interval if functionString is a valid string
    if (typeof functionString !== 'string' || !functionString.trim()) {
      return;
    }
    
    try {
      // Validate function first
      math.evaluate(functionString, { x: 1 });
      
      // Search for interval with sign change
      const foundInterval = findIntervalWithSignChange(functionString);
      if (foundInterval) {
        setInterval(foundInterval);
      }
    } catch (error) {
      console.warn("Invalid function for interval finding:", error);
    }
  }, [functionString]);
  
  return interval;
};

/**
 * Helper function to find interval with sign change
 * @param {string} functionString - Function string
 * @returns {Object|null} - Interval or null if can't be found
 */
const findIntervalWithSignChange = (functionString) => {
  try {
    const evaluateFunction = (x) => {
      try {
        return math.evaluate(functionString, { x });
      } catch (e) {
        return NaN;
      }
    };
    
    // Search for sign change in reasonable range
    const ranges = [
      { start: -5, end: 5, steps: 50 },
      { start: -20, end: 20, steps: 40 },
      { start: -100, end: 100, steps: 40 }
    ];
    
    for (const range of ranges) {
      const { start, end, steps } = range;
      const step = (end - start) / steps;
      
      for (let i = 0; i < steps; i++) {
        const x1 = start + i * step;
        const x2 = x1 + step;
        
        const y1 = evaluateFunction(x1);
        const y2 = evaluateFunction(x2);
        
        // Check for valid sign change
        if (!isNaN(y1) && !isNaN(y2) && y1 * y2 <= 0) {
          return { 
            start: Math.round(x1 * 100) / 100, 
            end: Math.round(x2 * 100) / 100 
          };
        }
      }
    }
    
    // Default interval if no sign change found
    return { start: -2, end: 2 };
  } catch (error) {
    console.error("Error finding interval:", error);
    return { start: -2, end: 2 };
  }
};

export default {
  useDerivative,
  useIntervalFinder
};