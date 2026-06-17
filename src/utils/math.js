import * as math from 'mathjs';

/**
 * Evaluates a mathematical function with a given x value
 * @param {string} funcStr - Mathematical function string
 * @param {number} x - x value
 * @returns {number} - Result of evaluation
 */
export const evaluateFunction = (funcStr, x) => {
  try {
    return math.evaluate(funcStr, { x });
  } catch (error) {
    console.error('Error evaluating function:', error);
    throw new Error(`Помилка обчислення функції: ${error.message}`);
  }
};

/**
 * Checks if a function changes sign within an interval
 * @param {string} funcStr - Mathematical function string
 * @param {number} a - Start of interval
 * @param {number} b - End of interval
 * @returns {boolean} - True if function changes sign
 */
export const checkSignChange = (funcStr, a, b) => {
  const fa = evaluateFunction(funcStr, a);
  const fb = evaluateFunction(funcStr, b);
  return fa * fb <= 0;
};

/**
 * Finds a suitable interval for root finding
 * @param {string} funcStr - Mathematical function string
 * @param {number} rangeStart - Start of search range
 * @param {number} rangeEnd - End of search range
 * @param {number} steps - Number of steps for searching
 * @returns {Object} - Interval with start and end properties
 */
export const findRootInterval = (funcStr, rangeStart = -10, rangeEnd = 10, steps = 100) => {
  try {
    const step = (rangeEnd - rangeStart) / steps;
    
    for (let i = 0; i < steps; i++) {
      const a = rangeStart + i * step;
      const b = a + step;
      
      if (checkSignChange(funcStr, a, b)) {
        return { start: a, end: b };
      }
    }
    
    // If no interval found, return default
    return { start: -2, end: 2 };
  } catch (error) {
    console.error('Error finding root interval:', error);
    return { start: -2, end: 2 };
  }
};

/**
 * Calculates the root using bisection method
 * @param {string} funcStr - Mathematical function string
 * @param {number} a - Start of interval
 * @param {number} b - End of interval
 * @param {number} tolerance - Calculation tolerance
 * @param {number} maxIterations - Maximum number of iterations
 * @returns {Object} - Calculation result
 */
export const calculateBisection = (funcStr, a, b, tolerance, maxIterations = 100) => {
  let left = a;
  let right = b;
  let results = [];
  let iterations = 0;
  
  // Check if function changes sign in the interval
  if (!checkSignChange(funcStr, left, right)) {
    throw new Error("Функція повинна змінювати знак на кінцях інтервалу [a, b].");
  }
  
  while ((right - left) / 2 > tolerance && iterations < maxIterations) {
    const mid = (left + right) / 2;
    const fmid = evaluateFunction(funcStr, mid);
    const fleft = evaluateFunction(funcStr, left);
    
    results.push({
      left,
      right,
      mid,
      fmid,
      fleft
    });
    
    if (Math.abs(fmid) < tolerance) {
      return {
        root: mid,
        iterations: iterations + 1,
        results,
        converged: true,
        finalError: Math.abs(fmid)
      };
    }
    
    if (fleft * fmid < 0) {
      right = mid;
    } else {
      left = mid;
    }
    
    iterations++;
  }
  
  // Final approximation
  const mid = (left + right) / 2;
  return {
    root: mid,
    iterations,
    results,
    converged: iterations < maxIterations,
    finalError: Math.abs(evaluateFunction(funcStr, mid))
  };
};

/**
 * Calculates the root using secant method
 * @param {string} funcStr - Mathematical function string
 * @param {number} a - First point
 * @param {number} b - Second point
 * @param {number} tolerance - Calculation tolerance
 * @param {number} maxIterations - Maximum number of iterations
 * @returns {Object} - Calculation result
 */
export const calculateSecant = (funcStr, a, b, tolerance, maxIterations = 100) => {
  let x0 = a;
  let x1 = b;
  let results = [];
  let iterations = 0;
  
  // Check if function changes sign in the interval
  if (!checkSignChange(funcStr, x0, x1)) {
    throw new Error("Функція повинна змінювати знак на кінцях інтервалу [a, b].");
  }
  
  do {
    const fx0 = evaluateFunction(funcStr, x0);
    const fx1 = evaluateFunction(funcStr, x1);
    
    // Calculate new approximation
    const x2 = x1 - fx1 * (x1 - x0) / (fx1 - fx0);
    const fx2 = evaluateFunction(funcStr, x2);
    
    results.push({
      x0,
      x1,
      x2,
      fx0,
      fx1,
      fx2
    });
    
    // Check convergence
    if (Math.abs(x2 - x1) < tolerance || Math.abs(fx2) < tolerance) {
      return {
        root: x2,
        iterations: iterations + 1,
        results,
        converged: true,
        finalError: Math.abs(fx2)
      };
    }
    
    // Update points for next iteration
    x0 = x1;
    x1 = x2;
    
    iterations++;
  } while (iterations < maxIterations);
  
  return {
    root: x1,
    iterations,
    results,
    converged: false,
    finalError: Math.abs(evaluateFunction(funcStr, x1))
  };
};

/**
 * Calculates the root using Newton's method
 * @param {string} funcStr - Mathematical function string
 * @param {string} derivativeStr - Function derivative string
 * @param {number} x0 - Initial approximation
 * @param {number} tolerance - Calculation tolerance
 * @param {number} maxIterations - Maximum number of iterations
 * @returns {Object} - Calculation result
 */
export const calculateNewton = (funcStr, derivativeStr, x0, tolerance, maxIterations = 100) => {
  let x = x0;
  let results = [];
  let iterations = 0;
  
  for (let i = 0; i < maxIterations; i++) {
    const fx = evaluateFunction(funcStr, x);
    const dfx = evaluateFunction(derivativeStr, x);
    
    // Check if derivative is too close to zero
    if (Math.abs(dfx) < 1e-10) {
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
    
    // Check convergence
    if (Math.abs(x1 - x) < tolerance || Math.abs(fx) < tolerance) {
      return {
        root: x1,
        iterations: iterations + 1,
        results,
        converged: true,
        finalError: Math.abs(evaluateFunction(funcStr, x1))
      };
    }
    
    // Update x for next iteration
    x = x1;
    iterations++;
  }
  
  return {
    root: x,
    iterations,
    results,
    converged: false,
    finalError: Math.abs(evaluateFunction(funcStr, x))
  };
};

export default {
  evaluateFunction,
  checkSignChange,
  findRootInterval,
  calculateBisection,
  calculateSecant,
  calculateNewton
};