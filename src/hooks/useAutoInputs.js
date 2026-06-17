// Path: src/hooks/useAutoInputs.js

import { useState, useEffect } from 'react';
import * as math from 'mathjs';
import { useDerivative, useIntervalFinder } from './useDerivative';

/**
 * A hook for managing automatic calculation of inputs for numerical methods
 * @param {Object} initialValues - Initial values for form
 * @param {string} method - Method name ('bisection', 'secant', 'newton')
 * @returns {Object} - Values, handlers, and state for the form
 */
export const useAutoInputs = (initialValues = {}, method) => {
  // Form state
  const [functionString, setFunctionString] = useState(initialValues.functionString || 'x^2 - 3');
  const [a, setA] = useState(() => Number(initialValues.a) || 1);
  const [b, setB] = useState(() => Number(initialValues.b) || 2);
  const [x0, setX0] = useState(() => Number(initialValues.x0) || 2);
  const [tolerance, setTolerance] = useState(() => Number(initialValues.tolerance) || 0.001);
  const [derivativeString, setDerivativeString] = useState(initialValues.derivativeString || '');
  
  // Use hooks for auto-calculation
  const calculatedDerivative = useDerivative(functionString);
  const calculatedInterval = useIntervalFinder(functionString);

  // Track if fields have been manually edited
  const [manuallyEdited, setManuallyEdited] = useState({
    a: !!initialValues.a,
    b: !!initialValues.b,
    x0: !!initialValues.x0,
    derivative: !!initialValues.derivativeString,
  });

  // Auto-update derivative when function changes
  useEffect(() => {
    if (method === 'newton' && calculatedDerivative && !manuallyEdited.derivative) {
      setDerivativeString(calculatedDerivative);
    }
  }, [calculatedDerivative, method, manuallyEdited.derivative]);

  // Auto-update interval values when auto-calculated
  useEffect(() => {
    if (calculatedInterval && functionString) {
      if (!manuallyEdited.a) {
        setA(Number(calculatedInterval.start) || 1);
      }
      if (!manuallyEdited.b) {
        setB(Number(calculatedInterval.end) || 3);
      }
      if (!manuallyEdited.x0 && method === 'newton') {
        // For Newton's method, set x0 as the middle of the interval
        const middle = (Number(calculatedInterval.start) + Number(calculatedInterval.end)) / 2;
        setX0(isNaN(middle) ? 2 : middle);
      }
    }
  }, [calculatedInterval, functionString, manuallyEdited, method]);

  // Handle function string change
  const handleFunctionChange = (newFunction) => {
    setFunctionString(newFunction);
    
    // Reset manually edited flags when function changes
    // This ensures values will be automatically calculated again
    if (newFunction !== functionString) {
      setManuallyEdited({
        a: false,
        b: false,
        x0: false,
        derivative: false
      });
    }
  };

  // Handle manual input changes
  const handleInputChange = (setter, field) => (e) => {
    const value = e.target.value.trim();
    
    if (value === '') {
      // Default values for empty inputs
      switch (field) {
        case 'a': setter(1); break;
        case 'b': setter(3); break;
        case 'x0': setter(2); break;
        case 'tolerance': setter(0.001); break;
        default: setter(0);
      }
    } else {
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) {
        setter(parsed);
      }
    }
    
    // Mark as manually edited
    if (['a', 'b', 'x0', 'derivative'].includes(field)) {
      setManuallyEdited(prev => ({...prev, [field]: true}));
    }
  };

  // Handle derivative change
  const handleDerivativeChange = (e) => {
    setDerivativeString(e.target.value);
    setManuallyEdited(prev => ({...prev, derivative: true}));
  };

  // Update values from calculation results
  const updateFromCalculation = (calculation) => {
    if (!calculation) return;

    // Update values without marking as manually edited
    setFunctionString(calculation.funcStr || functionString);
    
    if (method === 'bisection' || method === 'secant') {
      if (calculation.a !== undefined) setA(Number(calculation.a));
      if (calculation.b !== undefined) setB(Number(calculation.b));
    } else if (method === 'newton') {
      if (calculation.x0 !== undefined) setX0(Number(calculation.x0));
      if (calculation.derivativeStr) setDerivativeString(calculation.derivativeStr);
    }
    
    if (calculation.tolerance !== undefined) {
      setTolerance(Number(calculation.tolerance));
    }
    
    // Reset manually edited flags to enable auto-updates again
    setManuallyEdited({
      a: false,
      b: false,
      x0: false,
      derivative: false
    });
  };

  // Get current values for the form
  const getFormValues = () => {
    return {
      functionString,
      a,
      b,
      x0,
      tolerance,
      derivativeString
    };
  };

  return {
    // Form values
    functionString,
    a,
    b,
    x0,
    tolerance,
    derivativeString,
    
    // Setters
    setFunctionString: handleFunctionChange,
    setA,
    setB,
    setX0,
    setTolerance,
    setDerivativeString,
    
    // Change handlers
    handleFunctionChange,
    handleInputChange,
    handleDerivativeChange,
    
    // Auto-calculated values
    calculatedDerivative,
    calculatedInterval,
    
    // Manual edit state
    manuallyEdited,
    setManuallyEdited,
    
    // Update from calculation
    updateFromCalculation,
    
    // Get all values
    getFormValues
  };
};

export default useAutoInputs;