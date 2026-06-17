import { useState, useEffect } from 'react';
import * as math from 'mathjs';

// Rules for symbolic differentiation
const DERIVATIVE_RULES = {
  // Basic functions
  'x': '1',
  'x^n': 'n*x^(n-1)',
  'a*x': 'a',
  'a*x^n': 'a*n*x^(n-1)',
  
  // Trigonometric functions
  'sin(x)': 'cos(x)',
  'cos(x)': '-sin(x)',
  'tan(x)': 'sec(x)^2',
  'cot(x)': '-csc(x)^2',
  'sec(x)': 'sec(x)*tan(x)',
  'csc(x)': '-csc(x)*cot(x)',
  
  // Exponential and logarithmic
  'e^x': 'e^x',
  'a^x': 'a^x*ln(a)',
  'ln(x)': '1/x',
  'log10(x)': '1/(x*ln(10))',
  'log(a, x)': '1/(x*ln(a))'
};

// Function to tokenize a math expression
const tokenize = (expr) => {
  return expr.match(/(\d+\.\d+|\d+|[a-zA-Z]+|\S)/g) || [];
};

// Function to parse a simple expression and identify patterns
const identifyPattern = (expr) => {
  // Common patterns to check
  const patterns = [
    { regex: /^x$/, pattern: 'x' },
    { regex: /^x\^(\d+)$/, pattern: 'x^n' },
    { regex: /^(\d+|\d+\.\d+)\*x$/, pattern: 'a*x' },
    { regex: /^(\d+|\d+\.\d+)\*x\^(\d+)$/, pattern: 'a*x^n' },
    { regex: /^sin\(x\)$/, pattern: 'sin(x)' },
    { regex: /^cos\(x\)$/, pattern: 'cos(x)' },
    { regex: /^tan\(x\)$/, pattern: 'tan(x)' },
    { regex: /^e\^x$/, pattern: 'e^x' },
    { regex: /^(\d+|\d+\.\d+)\^x$/, pattern: 'a^x' },
    { regex: /^ln\(x\)$/, pattern: 'ln(x)' },
    { regex: /^log10\(x\)$/, pattern: 'log10(x)' }
  ];

  for (const {regex, pattern} of patterns) {
    if (regex.test(expr)) {
      return pattern;
    }
  }
  
  return null;
};

// Function to perform symbolic differentiation
const symbolicDifferentiation = (expr) => {
  try {
    // Try using mathjs symbolic differentiation if available
    return math.derivative(expr, 'x').toString();
  } catch (e) {
    // If mathjs fails, use pattern matching
    const pattern = identifyPattern(expr);
    if (pattern && DERIVATIVE_RULES[pattern]) {
      let derivative = DERIVATIVE_RULES[pattern];
      
      // Handle parametric cases
      if (pattern === 'x^n') {
        const match = expr.match(/x\^(\d+)/);
        const n = parseInt(match[1]);
        derivative = derivative.replace('n', n).replace('n-1', n-1);
      } else if (pattern === 'a*x') {
        const match = expr.match(/(\d+|\d+\.\d+)\*x/);
        const a = match[1];
        derivative = derivative.replace('a', a);
      } else if (pattern === 'a*x^n') {
        const match = expr.match(/(\d+|\d+\.\d+)\*x\^(\d+)/);
        const a = match[1];
        const n = parseInt(match[2]);
        derivative = derivative.replace('a', a).replace('n', n).replace('n-1', n-1);
      } else if (pattern === 'a^x') {
        const match = expr.match(/(\d+|\d+\.\d+)\^x/);
        const a = match[1];
        derivative = derivative.replace('a', a);
      }
      
      return derivative;
    }
    
    // Default fallback for unmatched patterns
    return null;
  }
};

// Function to find possible roots/intersections with x-axis for common functions
const findPossibleIntervals = (expr, rangeStart = -10, rangeEnd = 10, steps = 100) => {
  try {
    const parseFunction = (x) => math.evaluate(expr, { x });
    const step = (rangeEnd - rangeStart) / steps;
    const intervals = [];
    
    // Evaluate function at points throughout the range
    let prevY = parseFunction(rangeStart);
    
    for (let i = 1; i <= steps; i++) {
      const x = rangeStart + i * step;
      try {
        const y = parseFunction(x);
        
        // Check for sign change (potential root)
        if (prevY * y <= 0 && !isNaN(y) && isFinite(y) && !isNaN(prevY) && isFinite(prevY)) {
          intervals.push({
            start: rangeStart + (i - 1) * step,
            end: x
          });
        }
        
        prevY = y;
      } catch (e) {
        // Skip points where function evaluation fails (e.g., division by zero)
        continue;
      }
    }
    
    return intervals.length > 0 ? intervals : [{ start: -2, end: 2 }]; // Default if no intervals found
  } catch (e) {
    console.error("Error finding intervals:", e);
    return [{ start: -2, end: 2 }]; // Default interval on error
  }
};

// Hook for automatic derivative calculation
export const useDerivative = (functionString) => {
  const [derivative, setDerivative] = useState('');
  
  useEffect(() => {
    if (!functionString || functionString.trim() === '') return;
    
    try {
      // Validate function string before evaluating
      const testX = 1; // Use a test value
      const result = math.evaluate(functionString, { x: testX });
      
      if (result !== undefined) {
        // Calculate derivative
        const result = symbolicDifferentiation(functionString);
        setDerivative(result || '');
      }
    } catch (e) {
      // If function is invalid, don't update derivative
      console.warn("Invalid function for derivative:", e);
    }
  }, [functionString]);
  
  return derivative;
};

// Hook for automatic interval finding
export const useIntervalFinder = (functionString) => {
  const [interval, setInterval] = useState({ start: -2, end: 2 });
  
  useEffect(() => {
    if (!functionString || functionString.trim() === '') return;
    
    try {
      // Validate function string before evaluating
      const testX = 1; // Use a test value
      const result = math.evaluate(functionString, { x: testX });
      
      if (result !== undefined) {
        // Find potential root intervals
        const intervals = findPossibleIntervals(functionString);
        
        if (intervals.length > 0) {
          // Use the first interval by default
          setInterval({
            start: Math.floor(intervals[0].start),
            end: Math.ceil(intervals[0].end)
          });
        }
      }
    } catch (e) {
      // Keep default interval on error
      console.warn("Invalid function for interval finding:", e);
    }
  }, [functionString]);
  
  return interval;
};