import { useState } from 'react';
import * as math from 'mathjs';
import { useCalculation } from '../context/CalculationContext';

export const useSecantMethod = () => {
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
      const fa = func(a);
      const fb = func(b);
      
      if (fa * fb >= 0) {
        throw new Error("Функція повинна змінювати знак на кінцях інтервалу [a, b].");
      }
      
      // Initialize variables for calculation
      let x0 = a;
      let x1 = b;
      let x2;
      let results = [];
      let root = null;
      let iterations = 0;
      const maxIterations = 100;
      
      // Main secant algorithm
      do {
        const fx0 = func(x0);
        const fx1 = func(x1);
        
        // Calculate new approximation
        x2 = x1 - fx1 * (x1 - x0) / (fx1 - fx0);
        const fx2 = func(x2);
        
        results.push({ 
          x0, 
          x1, 
          x2, 
          fx0, 
          fx1, 
          fx2 
        });
        
        // Check if we've reached the desired tolerance
        if (Math.abs(x2 - x1) < tolerance || Math.abs(fx2) < tolerance) {
          root = x2;
          break;
        }
        
        // Update points for next iteration
        x0 = x1;
        x1 = x2;
        
        iterations++;
      } while (iterations < maxIterations);
      
      // Check if method converged
      const converged = iterations < maxIterations;
      
      if (!converged) {
        console.warn("Secant method did not converge within maximum iterations");
      }
      
      // Create calculation result object
      const calculation = {
        method: 'secant',
        funcStr,
        a,
        b,
        tolerance,
        results,
        root: root || x2,
        iterations,
        converged,
        finalError: Math.abs(func(root || x2))
      };
      
      // Add to calculation history
      addCalculation('secant', calculation);
      
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