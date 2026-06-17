import { useState } from 'react';
import * as math from 'mathjs';
import { useCalculation } from '../context/CalculationContext';

export const useBisectionMethod = () => {
  const { addCalculation } = useCalculation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculate = (funcStr, a, b, tolerance) => {
    setLoading(true);
    setError(null);
    
    try {
      // Parse the function
      const func = (x) => math.evaluate(funcStr, { x });
      
      // Validate inputs
      if (a === b) {
        throw new Error("Початок і кінець інтервалу не можуть бути однаковими.");
      }
      
      const fa = func(a);
      const fb = func(b);
      
      if (fa * fb > 0) {
        throw new Error("Функція повинна змінювати знак на кінцях інтервалу [a, b].");
      }
      
      // Initialize variables for calculation
      let left = a;
      let right = b;
      let mid;
      let results = [];
      let root = null;
      let iterations = 0;
      const maxIterations = 100;
      
      // Main bisection algorithm
      while ((right - left) / 2 > tolerance && iterations < maxIterations) {
        mid = (left + right) / 2;
        const fmid = func(mid);
        
        results.push({ 
          left, 
          right, 
          mid, 
          fmid,
          fleft: func(left),
          fright: func(right)
        });
        
        if (Math.abs(fmid) < tolerance) {
          root = mid;
          break;
        } else if (func(left) * fmid < 0) {
          right = mid;
        } else {
          left = mid;
        }
        
        iterations++;
      }
      
      // If we didn't break out early, use the midpoint as the root
      if (!root) {
        root = (left + right) / 2;
      }
      
      // Create calculation result object
      const calculation = {
        method: 'bisection',
        funcStr,
        a,
        b,
        tolerance,
        results,
        root,
        iterations,
        converged: true,
        finalError: Math.abs(func(root))
      };
      
      // Add to calculation history
      addCalculation('bisection', calculation);
      
      setLoading(false);
      return calculation;
      
    } catch (error) {
      setError(error.message);
      setLoading(false);
      return null;
    }
  };
  
  return { calculate, loading, error };
};