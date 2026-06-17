import { useState } from 'react';
import * as math from 'mathjs';
import { useCalculation } from '../context/CalculationContext';

export const useNewtonMethod = () => {
  const { addCalculation } = useCalculation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculate = (funcStr, derivativeStr, x0, tolerance) => {
    setLoading(true);
    setError(null);
    
    try {
      // Parse the function and its derivative
      const func = (x) => math.evaluate(funcStr, { x });
      const derivative = (x) => math.evaluate(derivativeStr, { x });
      
      // Initialize variables for calculation
      let x = x0;
      let results = [];
      let root = null;
      let iterations = 0;
      const maxIterations = 100;
      
      // Main Newton's algorithm
      for (let i = 0; i < maxIterations; i++) {
        const fx = func(x);
        const dfx = derivative(x);
        
        // Check if derivative is zero (would cause division by zero)
        if (dfx === 0) {
          throw new Error("Похідна дорівнює нулю. Метод не може продовжити.");
        }
        
        // Calculate new approximation
        const x1 = x - fx / dfx;
        
        results.push({ 
          x0: x, 
          fx, 
          dfx,
          x1
        });
        
        // Check if we've reached the desired tolerance
        if (Math.abs(x1 - x) < tolerance || Math.abs(fx) < tolerance) {
          root = x1;
          break;
        }
        
        // Update x for next iteration
        x = x1;
        
        iterations++;
      }
      
      // Check if method converged
      const converged = iterations < maxIterations;
      
      if (!converged) {
        console.warn("Newton's method did not converge within maximum iterations");
      }
      
      // Create calculation result object
      const calculation = {
        method: 'newton',
        funcStr,
        derivativeStr,
        x0,
        tolerance,
        results,
        root: root || x,
        iterations,
        converged,
        finalError: Math.abs(func(root || x))
      };
      
      // Add to calculation history
      addCalculation('newton', calculation);
      
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