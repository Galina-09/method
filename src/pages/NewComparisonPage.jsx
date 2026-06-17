import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as math from 'mathjs';
import { useTheme } from '../context/ThemeContext';
import Header from '../components/Header';

/**
 * A completely rewritten comparison page that doesn't rely on context
 * Using direct calculation instead of hooks for better stability
 */
const NewComparisonPage = () => {
  const { changeTheme } = useTheme();
  const canvasRef = useRef(null);
  
  // State variables
  const [functionString, setFunctionString] = useState('x^2 - 3');
  const [derivativeString, setDerivativeString] = useState('2*x');
  const [a, setA] = useState(1);
  const [b, setB] = useState(2);
  const [x0, setX0] = useState(2);
  const [tolerance, setTolerance] = useState(0.001);
  const [iterations, setIterations] = useState(50);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState({
    bisection: null,
    secant: null,
    newton: null
  });
  
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);

  // Debug state
  const [debug, setDebug] = useState({
    initialized: false,
    themeSet: false,
    canvasRendered: false
  });
  
  // Change theme and ensure proper initialization
  useEffect(() => {
    // Set the theme correctly
    changeTheme('comparison');
    
    // Add loaded class to body
    document.body.classList.add('loaded');
    setDebug(prev => ({ ...prev, themeSet: true }));
    
    // Initialize canvas with slight delay to ensure DOM is ready
    setTimeout(() => {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        // Draw basic coordinates
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, canvasRef.current.height/2);
        ctx.lineTo(canvasRef.current.width, canvasRef.current.height/2);
        ctx.moveTo(canvasRef.current.width/2, 0);
        ctx.lineTo(canvasRef.current.width/2, canvasRef.current.height);
        ctx.stroke();
        
        setDebug(prev => ({ ...prev, canvasRendered: true }));
      }
    }, 100);
    
    // Signal that the component has been initialized
    setDebug(prev => ({ ...prev, initialized: true }));
    
    return () => {
      document.body.classList.remove('loaded');
    };
  }, [changeTheme]);
  
  // Run all calculations directly when requested
  const runAllCalculations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate function
      try {
        math.evaluate(functionString, { x: 1 });
      } catch (error) {
        throw new Error(`Помилка в функції: ${error.message}`);
      }
      
      // Validate derivative
      try {
        math.evaluate(derivativeString, { x: 1 });
      } catch (error) {
        throw new Error(`Помилка в похідній: ${error.message}`);
      }
      
      // Calculate using all three methods
      const bisectionResult = await calculateBisection(functionString, a, b, tolerance, iterations);
      const secantResult = await calculateSecant(functionString, a, b, tolerance, iterations);
      const newtonResult = await calculateNewton(functionString, derivativeString, x0, tolerance, iterations);
      
      // Set results
      const newResults = {
        bisection: bisectionResult,
        secant: secantResult,
        newton: newtonResult
      };
      
      setResults(newResults);
      
      // Auto-select first successful method
      const methodToSelect = 
        bisectionResult.converged ? 'bisection' :
        secantResult.converged ? 'secant' :
        newtonResult.converged ? 'newton' : 'bisection';
      
      setSelectedMethod(methodToSelect);
      
      // Automatically generate comparison data
      compareResults(newResults);
      
      setLoading(false);
    } catch (error) {
      console.error("Error running calculations:", error);
      setError(`Помилка обчислення: ${error.message}`);
      setLoading(false);
    }
  };
  
  // Compare all calculation results
  const compareResults = (resultsToCompare = results) => {
    try {
      // Check if we have results to compare
      const hasResults = 
        resultsToCompare.bisection || 
        resultsToCompare.secant || 
        resultsToCompare.newton;
        
      if (!hasResults) {
        setError("Немає результатів для порівняння.");
        return;
      }
      
      // Create comparison data structure
      const comparisonData = {
        metrics: [
          {
            name: "Корінь",
            bisection: formatValue(resultsToCompare.bisection?.root),
            secant: formatValue(resultsToCompare.secant?.root),
            newton: formatValue(resultsToCompare.newton?.root),
            info: "Обчислене значення кореня"
          },
          {
            name: "Кількість ітерацій",
            bisection: formatValue(resultsToCompare.bisection?.results?.length),
            secant: formatValue(resultsToCompare.secant?.results?.length),
            newton: formatValue(resultsToCompare.newton?.results?.length),
            info: "Кількість виконаних ітерацій"
          },
          {
            name: "Похибка",
            bisection: formatError(resultsToCompare.bisection?.finalError),
            secant: formatError(resultsToCompare.secant?.finalError),
            newton: formatError(resultsToCompare.newton?.finalError),
            info: "Абсолютна похибка"
          },
          {
            name: "Збіжність",
            bisection: resultsToCompare.bisection?.converged ? "Так" : "Ні",
            secant: resultsToCompare.secant?.converged ? "Так" : "Ні", 
            newton: resultsToCompare.newton?.converged ? "Так" : "Ні",
            info: "Чи зійшовся метод"
          },
          {
            name: "Відносна похибка",
            bisection: calculateRelativeError(resultsToCompare.bisection?.root),
            secant: calculateRelativeError(resultsToCompare.secant?.root),
            newton: calculateRelativeError(resultsToCompare.newton?.root),
            info: "Похибка відносно точного значення"
          },
          {
            name: "Ефективність",
            bisection: rateEfficiency("bisection", resultsToCompare.bisection),
            secant: rateEfficiency("secant", resultsToCompare.secant),
            newton: rateEfficiency("newton", resultsToCompare.newton),
            info: "Оцінка ефективності методу"
          },
          {
            name: "Швидкість збіжності",
            bisection: rateConvergenceSpeed(resultsToCompare.bisection),
            secant: rateConvergenceSpeed(resultsToCompare.secant),
            newton: rateConvergenceSpeed(resultsToCompare.newton),
            info: "Оцінка швидкості збіжності"
          }
        ],
        summary: generateSummary(resultsToCompare)
      };
      
      setComparisonData(comparisonData);
      
      // Draw comparison graph
      setTimeout(() => {
        drawComparisonGraph(resultsToCompare);
      }, 100);
      
    } catch (error) {
      console.error("Error comparing results:", error);
      setError(`Помилка порівняння: ${error.message}`);
    }
  };
  
  // Generate summary of comparison
  const generateSummary = (resultsToCompare) => {
    // Get number of converged methods
    const convergedCount = [
      resultsToCompare.bisection?.converged,
      resultsToCompare.secant?.converged,
      resultsToCompare.newton?.converged
    ].filter(Boolean).length;
    
    // Get method with the best accuracy
    let bestAccuracyMethod = null;
    let bestAccuracy = Infinity;
    
    if (resultsToCompare.bisection?.converged && resultsToCompare.bisection.finalError < bestAccuracy) {
      bestAccuracyMethod = "Метод половинного ділення";
      bestAccuracy = resultsToCompare.bisection.finalError;
    }
    
    if (resultsToCompare.secant?.converged && resultsToCompare.secant.finalError < bestAccuracy) {
      bestAccuracyMethod = "Метод хорд";
      bestAccuracy = resultsToCompare.secant.finalError;
    }
    
    if (resultsToCompare.newton?.converged && resultsToCompare.newton.finalError < bestAccuracy) {
      bestAccuracyMethod = "Метод Ньютона";
      bestAccuracy = resultsToCompare.newton.finalError;
    }
    
    // Get method with the fewest iterations
    let fastestMethod = null;
    let lowestIterations = Infinity;
    
    if (resultsToCompare.bisection?.converged && resultsToCompare.bisection.results.length < lowestIterations) {
      fastestMethod = "Метод половинного ділення";
      lowestIterations = resultsToCompare.bisection.results.length;
    }
    
    if (resultsToCompare.secant?.converged && resultsToCompare.secant.results.length < lowestIterations) {
      fastestMethod = "Метод хорд";
      lowestIterations = resultsToCompare.secant.results.length;
    }
    
    if (resultsToCompare.newton?.converged && resultsToCompare.newton.results.length < lowestIterations) {
      fastestMethod = "Метод Ньютона";
      lowestIterations = resultsToCompare.newton.results.length;
    }
    
    // Create summary text
    let summary = `Досліджено ${convergedCount} з 3 методів.`;
    
    if (convergedCount === 0) {
      summary += " Жоден з методів не зійшовся для заданої функції та параметрів.";
    } else {
      if (bestAccuracyMethod) {
        summary += ` ${bestAccuracyMethod} має найкращу точність з похибкою ${formatError(bestAccuracy)}.`;
      }
      
      if (fastestMethod) {
        summary += ` ${fastestMethod} найшвидше зійшовся за ${lowestIterations} ітерацій.`;
      }
    }
    
    return summary;
  };
  
  // Draw comparison graph
  const drawComparisonGraph = (resultsToCompare) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("Canvas ref is null");
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error("Cannot get canvas context");
      return;
    }
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set up coordinate system
    const padding = 40;
    const graphWidth = width - 2 * padding;
    const graphHeight = height - 2 * padding;
    
    // Background
    ctx.fillStyle = 'rgba(240, 240, 255, 0.5)';
    ctx.fillRect(0, 0, width, height);
    
    // Find range for graph
    let minX = a;
    let maxX = b;
    let minY = -10;
    let maxY = 10;
    
    // Try to evaluate function at several points to get Y range
    try {
      const samples = 20;
      const step = (maxX - minX) / samples;
      const func = x => math.evaluate(functionString, { x });
      
      const yValues = [];
      for (let i = 0; i <= samples; i++) {
        const x = minX + i * step;
        try {
          const y = func(x);
          if (!isNaN(y) && isFinite(y)) {
            yValues.push(y);
          }
        } catch (e) {}
      }
      
      if (yValues.length > 0) {
        minY = Math.min(...yValues) - 1;
        maxY = Math.max(...yValues) + 1;
      }
    } catch (e) {
      console.error("Error evaluating function for Y range:", e);
    }
    
    // Map coordinates from data space to pixel space
    const mapX = x => padding + (x - minX) / (maxX - minX) * graphWidth;
    const mapY = y => height - padding - (y - minY) / (maxY - minY) * graphHeight;
    
    // Draw axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    // X axis
    ctx.beginPath();
    ctx.moveTo(padding, mapY(0));
    ctx.lineTo(width - padding, mapY(0));
    ctx.stroke();
    
    // Y axis
    ctx.beginPath();
    ctx.moveTo(mapX(0), height - padding);
    ctx.lineTo(mapX(0), padding);
    ctx.stroke();
    
    // Draw grid
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 0.5;
    
    // X grid
    const xStep = Math.pow(10, Math.floor(Math.log10((maxX - minX) / 10)));
    for (let x = Math.ceil(minX / xStep) * xStep; x <= maxX; x += xStep) {
      if (Math.abs(x) < 1e-10) continue; // Skip axis
      ctx.beginPath();
      ctx.moveTo(mapX(x), height - padding);
      ctx.lineTo(mapX(x), padding);
      ctx.stroke();
      
      // X label
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      ctx.fillText(x.toFixed(1), mapX(x), height - padding + 15);
    }
    
    // Y grid
    const yStep = Math.pow(10, Math.floor(Math.log10((maxY - minY) / 10)));
    for (let y = Math.ceil(minY / yStep) * yStep; y <= maxY; y += yStep) {
      if (Math.abs(y) < 1e-10) continue; // Skip axis
      ctx.beginPath();
      ctx.moveTo(padding, mapY(y));
      ctx.lineTo(width - padding, mapY(y));
      ctx.stroke();
      
      // Y label
      ctx.fillStyle = '#333';
      ctx.textAlign = 'right';
      ctx.fillText(y.toFixed(1), padding - 5, mapY(y) + 5);
    }
    
    // Draw function
    try {
      const samples = 200;
      const step = (maxX - minX) / samples;
      const func = x => math.evaluate(functionString, { x });
      
      ctx.strokeStyle = '#0066cc';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      let lastY;
      let firstPoint = true;
      
      for (let i = 0; i <= samples; i++) {
        const x = minX + i * step;
        try {
          const y = func(x);
          if (!isNaN(y) && isFinite(y) && y >= minY && y <= maxY) {
            if (firstPoint) {
              ctx.moveTo(mapX(x), mapY(y));
              firstPoint = false;
            } else {
              // Check for discontinuities
              if (lastY && Math.abs(y - lastY) > (maxY - minY) / 10) {
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(mapX(x), mapY(y));
              } else {
                ctx.lineTo(mapX(x), mapY(y));
              }
            }
            lastY = y;
          } else {
            firstPoint = true;
          }
        } catch (e) {
          firstPoint = true;
        }
      }
      
      ctx.stroke();
    } catch (e) {
      console.error("Error drawing function curve:", e);
    }
    
    // Draw solution points for each method
    const drawMethodPoint = (result, color) => {
      if (!result || !result.converged || typeof result.root !== 'number') return;
      
      const x = result.root;
      
      try {
        const func = x => math.evaluate(functionString, { x });
        const y = func(x);
        
        if (isNaN(y) || !isFinite(y) || y < minY || y > maxY || x < minX || x > maxX) return;
        
        // Draw point
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(mapX(x), mapY(y), 6, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw line to axis
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(mapX(x), mapY(y));
        ctx.lineTo(mapX(x), mapY(0));
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw label
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.fillText(x.toFixed(6), mapX(x), mapY(0) + 20);
      } catch (e) {
        console.error("Error drawing method point:", e);
      }
    };
    
    // Draw points for each method
    if (resultsToCompare.bisection?.converged) {
      drawMethodPoint(resultsToCompare.bisection, '#e65100');  // Orange for bisection
    }
    
    if (resultsToCompare.secant?.converged) {
      drawMethodPoint(resultsToCompare.secant, '#0277bd');     // Blue for secant
    }
    
    if (resultsToCompare.newton?.converged) {
      drawMethodPoint(resultsToCompare.newton, '#6a1b9a');     // Purple for newton
    }
    
    // Draw legend
    ctx.textAlign = 'left';
    ctx.font = '12px Arial';
    
    let legendY = padding;
    
    if (resultsToCompare.bisection?.converged) {
      ctx.fillStyle = '#e65100';
      ctx.fillRect(padding, legendY, 15, 15);
      ctx.fillStyle = '#000';
      ctx.fillText('Метод половинного ділення', padding + 20, legendY + 12);
      legendY += 25;
    }
    
    if (resultsToCompare.secant?.converged) {
      ctx.fillStyle = '#0277bd';
      ctx.fillRect(padding, legendY, 15, 15);
      ctx.fillStyle = '#000';
      ctx.fillText('Метод хорд', padding + 20, legendY + 12);
      legendY += 25;
    }
    
    if (resultsToCompare.newton?.converged) {
      ctx.fillStyle = '#6a1b9a';
      ctx.fillRect(padding, legendY, 15, 15);
      ctx.fillStyle = '#000';
      ctx.fillText('Метод Ньютона', padding + 20, legendY + 12);
    }
  };
  
  // Calculate relative error compared to reference solution
  const calculateRelativeError = (value) => {
    // Reference solution for sqrt(3)
    const REFERENCE_SOLUTION = 1.7320508;
    
    if (value === undefined || value === null) return "—";
    
    const relError = Math.abs((value - REFERENCE_SOLUTION) / REFERENCE_SOLUTION);
    
    if (relError < 1e-6) return "< 0.0001%";
    if (relError < 1e-2) return (relError * 100).toFixed(4) + "%";
    return (relError * 100).toFixed(2) + "%";
  };
  
  // Rate efficiency based on method and results
  const rateEfficiency = (method, result) => {
    if (!result || !result.converged) return "Низька";
    
    const iterations = result.results.length;
    
    if (method === "bisection") {
      if (iterations <= 10) return "Добра";
      if (iterations <= 20) return "Середня";
      return "Низька";
    }
    
    if (method === "secant") {
      if (iterations <= 5) return "Відмінна";
      if (iterations <= 10) return "Добра";
      if (iterations <= 15) return "Середня";
      return "Низька";
    }
    
    if (method === "newton") {
      if (iterations <= 3) return "Відмінна";
      if (iterations <= 7) return "Добра";
      if (iterations <= 12) return "Середня";
      return "Низька";
    }
    
    return "Невідомо";
  };
  
  // Rate convergence speed
  const rateConvergenceSpeed = (result) => {
    if (!result || !result.converged) return "Не зійшовся";
    
    const iterations = result.results.length;
    
    if (iterations <= 3) return "Дуже швидка";
    if (iterations <= 7) return "Швидка";
    if (iterations <= 15) return "Середня";
    if (iterations <= 30) return "Повільна";
    return "Дуже повільна";
  };
  
  // Format value for display
  const formatValue = (value) => {
    if (value === undefined || value === null) return "—";
    if (typeof value === 'number') {
      if (Math.abs(value) < 0.0001 || Math.abs(value) > 10000) {
        return value.toExponential(4);
      }
      return value.toFixed(6);
    }
    return value.toString();
  };
  
  // Format error for display
  const formatError = (error) => {
    if (error === undefined || error === null) return "—";
    return error.toExponential(4);
  };
  
  // Calculate using bisection method
  const calculateBisection = (funcStr, a, b, tolerance, maxIterations) => {
    try {
      // Create function from string
      const func = x => math.evaluate(funcStr, { x });
      
      // Check if function changes sign on the interval
      const fa = func(a);
      const fb = func(b);
      
      if (fa * fb > 0) {
        return {
          converged: false,
          error: "Функція не змінює знак на інтервалі",
          results: [],
          finalError: null,
          root: null,
          funcStr
        };
      }
      
      let left = a;
      let right = b;
      let results = [];
      let mid;
      
      for (let i = 0; i < maxIterations; i++) {
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
        
        // Check for convergence
        if (Math.abs(fmid) < tolerance || Math.abs(right - left) < tolerance) {
          return {
            converged: true,
            results,
            finalError: Math.abs(fmid),
            root: mid,
            funcStr,
            a,
            b,
            tolerance
          };
        }
        
        // Update interval
        if (func(left) * fmid < 0) {
          right = mid;
        } else {
          left = mid;
        }
      }
      
      // If we reach here, the method didn't converge
      return {
        converged: false,
        results,
        finalError: Math.abs(func(mid)),
        root: mid,
        funcStr,
        a,
        b,
        tolerance
      };
    } catch (error) {
      console.error("Error in bisection method:", error);
      return {
        converged: false,
        error: error.message,
        results: [],
        finalError: null,
        root: null,
        funcStr,
        a,
        b,
        tolerance
      };
    }
  };
  
  // Calculate using secant method
  const calculateSecant = (funcStr, a, b, tolerance, maxIterations) => {
    try {
      // Create function from string
      const func = x => math.evaluate(funcStr, { x });
      
      // Check if function changes sign on the interval
      const fa = func(a);
      const fb = func(b);
      
      if (fa * fb > 0) {
        return {
          converged: false,
          error: "Функція не змінює знак на інтервалі",
          results: [],
          finalError: null,
          root: null,
          funcStr,
          a,
          b,
          tolerance
        };
      }
      
      let x0 = a;
      let x1 = b;
      let results = [];
      
      for (let i = 0; i < maxIterations; i++) {
        const fx0 = func(x0);
        const fx1 = func(x1);
        
        // Calculate next approximation
        const x2 = x1 - fx1 * (x1 - x0) / (fx1 - fx0);
        const fx2 = func(x2);
        
        results.push({
          x0,
          x1,
          x2,
          fx0,
          fx1,
          fx2
        });
        
        // Check for convergence
        if (Math.abs(fx2) < tolerance || Math.abs(x2 - x1) < tolerance) {
          return {
            converged: true,
            results,
            finalError: Math.abs(fx2),
            root: x2,
            funcStr,
            a,
            b,
            tolerance
          };
        }
        
        // Update points
        x0 = x1;
        x1 = x2;
      }
      
      // If we reach here, the method didn't converge
      return {
        converged: false,
        results,
        finalError: Math.abs(func(x1)),
        root: x1,
        funcStr,
        a,
        b,
        tolerance
      };
    } catch (error) {
      console.error("Error in secant method:", error);
      return {
        converged: false,
        error: error.message,
        results: [],
        finalError: null,
        root: null,
        funcStr,
        a,
        b,
        tolerance
      };
    }
  };
  
  // Calculate using Newton's method
  const calculateNewton = (funcStr, derivStr, x0, tolerance, maxIterations) => {
    try {
      // Create function and derivative from strings
      const func = x => math.evaluate(funcStr, { x });
      const deriv = x => math.evaluate(derivStr, { x });
      
      let x = x0;
      let results = [];
      
      for (let i = 0; i < maxIterations; i++) {
        const fx = func(x);
        const dfx = deriv(x);
        
        // Check if derivative is zero
        if (Math.abs(dfx) < 1e-10) {
          return {
            converged: false,
            error: "Похідна близька до нуля",
            results,
            finalError: Math.abs(fx),
            root: x,
            funcStr,
            derivativeStr: derivStr,
            x0,
            tolerance
          };
        }
        
        // Calculate next approximation
        const x1 = x - fx / dfx;
        
        results.push({
          x0: x,
          x1,
          fx,
          dfx
        });
        
        // Check for convergence
        if (Math.abs(fx) < tolerance || Math.abs(x1 - x) < tolerance) {
          return {
            converged: true,
            results,
            finalError: Math.abs(fx),
            root: x1,
            funcStr,
            derivativeStr: derivStr,
            x0,
            tolerance
          };
        }
        
        // Update x
        x = x1;
      }
      
      // If we reach here, the method didn't converge
      return {
        converged: false,
        results,
        finalError: Math.abs(func(x)),
        root: x,
        funcStr,
        derivativeStr: derivStr,
        x0,
        tolerance
      };
    } catch (error) {
      console.error("Error in Newton's method:", error);
      return {
        converged: false,
        error: error.message,
        results: [],
        finalError: null,
        root: null,
        funcStr,
        derivativeStr: derivStr,
        x0,
        tolerance
      };
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 50,
        damping: 10
      }
    }
  };
  
  // Get class for result cell based on method and metric
  const getResultClass = (method, metric, value) => {
    // Skip styling for missing values
    if (value === '—' || value === 'Невідомо') return 'result-neutral';
    
    // Error styling
    if (metric === 'Похибка' || metric === 'Відносна похибка') {
      if (value.includes('e-') || value.startsWith('<')) return 'result-excellent';
      if (parseFloat(value) < 0.01) return 'result-good';
      return 'result-poor';
    }
    
    // Iterations styling
    if (metric === 'Кількість ітерацій') {
      const iterations = parseInt(value);
      if (method === 'bisection') {
        if (iterations < 10) return 'result-good';
        if (iterations < 20) return 'result-average';
        return 'result-poor';
      } else if (method === 'secant') {
        if (iterations < 6) return 'result-excellent';
        if (iterations < 12) return 'result-good';
        return 'result-average';
      } else if (method === 'newton') {
        if (iterations < 4) return 'result-excellent';
        if (iterations < 8) return 'result-good';
        return 'result-average';
      }
    }
    
    // Convergence styling
    if (metric === 'Збіжність') {
      return value === 'Так' ? 'result-excellent' : 'result-poor';
    }
    
    // Efficiency and speed styling
    if (metric === 'Ефективність' || metric === 'Швидкість збіжності') {
      if (value === 'Відмінна' || value === 'Дуже швидка') return 'result-excellent';
      if (value === 'Добра' || value === 'Швидка') return 'result-good';
      if (value === 'Середня') return 'result-average';
      if (value === 'Низька' || value === 'Повільна' || value === 'Дуже повільна') return 'result-poor';
      if (value === 'Не зійшовся') return 'result-poor';
    }
    
    return 'result-neutral';
  };
  
  // Handle detailed method view
  const showMethodDetails = (method) => {
    setSelectedMethod(method);
    
    // Focus on the detailed view
    const detailsElement = document.getElementById('method-details');
    if (detailsElement) {
      detailsElement.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Get debug info as string
  const getDebugInfo = () => {
    return JSON.stringify(debug, null, 2);
  };
  
  return (
    <motion.div 
      className="comparison-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Header title="Порівняння Чисельних Методів" />
      
      <motion.div className="comparison-controls" variants={itemVariants}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="function">Функція:</label>
            <input
              type="text"
              id="function"
              value={functionString}
              onChange={(e) => setFunctionString(e.target.value)}
              placeholder="Напр.: x^2 - 3"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="derivative">Похідна (для методу Ньютона):</label>
            <input
              type="text"
              id="derivative"
              value={derivativeString}
              onChange={(e) => setDerivativeString(e.target.value)}
              placeholder="Напр.: 2*x"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="a">Початок інтервалу (a):</label>
            <input
              type="number"
              id="a"
              value={a}
              onChange={(e) => setA(parseFloat(e.target.value))}
              step="any"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="b">Кінець інтервалу (b):</label>
            <input
              type="number"
              id="b"
              value={b}
              onChange={(e) => setB(parseFloat(e.target.value))}
              step="any"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="x0">Початкове наближення (x0):</label>
            <input
              type="number"
              id="x0"
              value={x0}
              onChange={(e) => setX0(parseFloat(e.target.value))}
              step="any"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="tolerance">Точність:</label>
            <input
              type="number"
              id="tolerance"
              value={tolerance}
              onChange={(e) => setTolerance(parseFloat(e.target.value))}
              step="0.0001"
              min="0.0000001"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="iterations">Макс. ітерацій:</label>
            <input
              type="number"
              id="iterations"
              value={iterations}
              onChange={(e) => setIterations(parseInt(e.target.value))}
              min="1"
              max="1000"
            />
          </div>
        </div>
        
        <div className="button-group">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={runAllCalculations}
            disabled={loading}
            className="calculate-button"
          >
            {loading ? "Обчислення..." : "Обчислити всі методи"}
          </motion.button>
        </div>
        
        {error && (
          <motion.div 
            className="error-message"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p>{error}</p>
          </motion.div>
        )}
      </motion.div>
      
      {comparisonData && (
        <motion.div 
          className="comparison-results"
          variants={itemVariants}
        >
          <motion.div className="comparison-graph" variants={itemVariants}>
            <h2>Графічне порівняння</h2>
            <canvas 
              ref={canvasRef} 
              width={800} 
              height={500}
              className="comparison-canvas"
            />
          </motion.div>
          
          <motion.div className="comparison-summary" variants={itemVariants}>
            <h2>Висновок</h2>
            <p>{comparisonData.summary}</p>
          </motion.div>
          
          <motion.div className="comparison-table" variants={itemVariants}>
            <h2>Порівняльна таблиця</h2>
            <table className="metrics-table">
              <thead>
                <tr>
                  <th>Метрика</th>
                  <th>Метод половинного ділення</th>
                  <th>Метод хорд</th>
                  <th>Метод Ньютона</th>
                  <th>Пояснення</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.metrics.map((metric, index) => (
                  <tr key={index}>
                    <td className="metric-name">{metric.name}</td>
                    <td className={getResultClass('bisection', metric.name, metric.bisection)}>
                      {metric.bisection}
                    </td>
                    <td className={getResultClass('secant', metric.name, metric.secant)}>
                      {metric.secant}
                    </td>
                    <td className={getResultClass('newton', metric.name, metric.newton)}>
                      {metric.newton}
                    </td>
                    <td className="metric-info">{metric.info}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
          
          <motion.div className="method-buttons" variants={itemVariants}>
            <h2>Детальний розгляд методів</h2>
            <div className="method-selection">
              <motion.button 
                className={`method-button bisection ${selectedMethod === 'bisection' ? 'active' : ''}`}
                onClick={() => showMethodDetails('bisection')}
                disabled={!results.bisection}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Метод половинного ділення
              </motion.button>
              
              <motion.button 
                className={`method-button secant ${selectedMethod === 'secant' ? 'active' : ''}`}
                onClick={() => showMethodDetails('secant')}
                disabled={!results.secant}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Метод хорд
              </motion.button>
              
              <motion.button 
                className={`method-button newton ${selectedMethod === 'newton' ? 'active' : ''}`}
                onClick={() => showMethodDetails('newton')}
                disabled={!results.newton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Метод Ньютона
              </motion.button>
            </div>
          </motion.div>
          
          {selectedMethod && results[selectedMethod] && (
            <motion.div 
              id="method-details"
              className="method-details"
              variants={itemVariants}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2>
                {selectedMethod === 'bisection' ? 'Метод половинного ділення' : 
                 selectedMethod === 'secant' ? 'Метод хорд' : 
                 'Метод Ньютона'}
              </h2>
              
              <div className="details-grid">
                <div className="details-section">
                  <h3>Результати</h3>
                  
                  <div className="details-results">
                    <div className="detail-item">
                      <div className="detail-label">Корінь:</div>
                      <div className="detail-value">{formatValue(results[selectedMethod].root)}</div>
                    </div>
                    
                    <div className="detail-item">
                      <div className="detail-label">Кількість ітерацій:</div>
                      <div className="detail-value">{results[selectedMethod].results.length}</div>
                    </div>
                    
                    <div className="detail-item">
                      <div className="detail-label">Похибка:</div>
                      <div className="detail-value">{formatError(results[selectedMethod].finalError)}</div>
                    </div>
                    
                    <div className="detail-item">
                      <div className="detail-label">Відносна похибка:</div>
                      <div className="detail-value">{calculateRelativeError(results[selectedMethod].root)}</div>
                    </div>
                    
                    <div className="detail-item">
                      <div className="detail-label">Збіжність:</div>
                      <div className="detail-value">{results[selectedMethod].converged ? "Так" : "Ні"}</div>
                    </div>
                  </div>
                </div>
                
                <div className="details-section iterations-table">
                  <h3>Таблиця ітерацій</h3>
                  
                  <div className="iteration-scroll">
                    {selectedMethod === 'bisection' && (
                      <table className="iteration-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Лівий кінець</th>
                            <th>Середина</th>
                            <th>Правий кінець</th>
                            <th>f(середина)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results[selectedMethod].results.map((iteration, index) => (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>{formatValue(iteration.left)}</td>
                              <td>{formatValue(iteration.mid)}</td>
                              <td>{formatValue(iteration.right)}</td>
                              <td>{formatValue(iteration.fmid)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                    
                    {selectedMethod === 'secant' && (
                      <table className="iteration-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>x₀</th>
                            <th>x₁</th>
                            <th>x₂</th>
                            <th>f(x₂)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results[selectedMethod].results.map((iteration, index) => (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>{formatValue(iteration.x0)}</td>
                              <td>{formatValue(iteration.x1)}</td>
                              <td>{formatValue(iteration.x2)}</td>
                              <td>{formatValue(iteration.fx2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                    
                    {selectedMethod === 'newton' && (
                      <table className="iteration-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>xₙ</th>
                            <th>f(xₙ)</th>
                            <th>f'(xₙ)</th>
                            <th>xₙ₊₁</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results[selectedMethod].results.map((iteration, index) => (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>{formatValue(iteration.x0)}</td>
                              <td>{formatValue(iteration.fx)}</td>
                              <td>{formatValue(iteration.dfx)}</td>
                              <td>{formatValue(iteration.x1)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default NewComparisonPage;