import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as math from 'mathjs';
import { useDerivative, useIntervalFinder } from '../hooks/useDerivative';
import validationUtils from '../utils/validationUtils';

const EnhancedMethodForm = ({ 
  method, 
  onCalculate, 
  initialValues = {}, 
  onPrevious, 
  onNext,
  hasResults,
  loading = false
}) => {
  // Form state for different methods
  const [functionString, setFunctionString] = useState(initialValues.functionString || 'x^2 - 3');
  
  // Initialize numeric values safely to prevent NaN
  const [a, setA] = useState(() => {
    return initialValues.a !== undefined ? Number(initialValues.a) : 1;
  });
  
  const [b, setB] = useState(() => {
    return initialValues.b !== undefined ? Number(initialValues.b) : 3;
  });
  
  const [x0, setX0] = useState(() => {
    return initialValues.x0 !== undefined ? Number(initialValues.x0) : 3;
  });
  
  const [tolerance, setTolerance] = useState(() => {
    return initialValues.tolerance !== undefined ? Number(initialValues.tolerance) : 0.001;
  });
  
  const [derivativeString, setDerivativeString] = useState(initialValues.derivativeString || '');
  
  // Validation errors
  const [errors, setErrors] = useState({});
  
  // Use hooks for auto-calculation
  const calculatedDerivative = useDerivative(functionString);
  const calculatedInterval = useIntervalFinder(functionString);

  // Track if fields have been manually edited by the user
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
        setA(Number(calculatedInterval.start) || 1); // Ensure it's a number
      }
      if (!manuallyEdited.b) {
        setB(Number(calculatedInterval.end) || 3); // Ensure it's a number
      }
      if (!manuallyEdited.x0 && method === 'newton') {
        // For Newton's method, set x0 as the middle of the interval
        const middle = (Number(calculatedInterval.start) + Number(calculatedInterval.end)) / 2;
        setX0(isNaN(middle) ? 2 : middle); // Default to 2 if calculation results in NaN
      }
    }
  }, [calculatedInterval, functionString, manuallyEdited, method]);

  // Update form values when initialValues change
  useEffect(() => {
    if (initialValues.functionString !== undefined) {
      setFunctionString(initialValues.functionString);
    }
    if (initialValues.a !== undefined) {
      setA(Number(initialValues.a));
      setManuallyEdited(prev => ({...prev, a: true}));
    }
    if (initialValues.b !== undefined) {
      setB(Number(initialValues.b));
      setManuallyEdited(prev => ({...prev, b: true}));
    }
    if (initialValues.x0 !== undefined) {
      setX0(Number(initialValues.x0));
      setManuallyEdited(prev => ({...prev, x0: true}));
    }
    if (initialValues.tolerance !== undefined) {
      setTolerance(Number(initialValues.tolerance));
    }
    if (initialValues.derivativeString !== undefined) {
      setDerivativeString(initialValues.derivativeString);
      setManuallyEdited(prev => ({...prev, derivative: true}));
    }
  }, [initialValues]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Validate function string
    const funcValidation = validationUtils.validateFunction(functionString, math);
    if (!funcValidation.isValid) {
      newErrors.functionString = funcValidation.message;
    }
    
    // Validate method-specific fields
    if (method === 'bisection' || method === 'secant') {
      // Validate interval bounds
      const aValidation = validationUtils.validateNumber(a);
      const bValidation = validationUtils.validateNumber(b);
      
      if (!aValidation.isValid) {
        newErrors.a = aValidation.message;
      }
      
      if (!bValidation.isValid) {
        newErrors.b = bValidation.message;
      }
      
      if (aValidation.isValid && bValidation.isValid) {
        const intervalValidation = validationUtils.validateInterval(a, b);
        if (!intervalValidation.isValid) {
          newErrors.b = intervalValidation.message;
        } else {
          // Check sign change
          try {
            const signChangeValidation = validationUtils.validateSignChange(functionString, a, b, math);
            if (!signChangeValidation.isValid) {
              newErrors.interval = signChangeValidation.message;
            }
          } catch (error) {
            newErrors.interval = "Помилка перевірки зміни знаку: " + error.message;
          }
        }
      }
    } else if (method === 'newton') {
      // Validate derivative and initial guess
      const derivativeValidation = validationUtils.validateDerivative(derivativeString, math);
      const x0Validation = validationUtils.validateNumber(x0);
      
      if (!derivativeValidation.isValid) {
        newErrors.derivativeString = derivativeValidation.message;
      }
      
      if (!x0Validation.isValid) {
        newErrors.x0 = x0Validation.message;
      }
    }
    
    // Validate tolerance
    const toleranceValidation = validationUtils.validateTolerance(tolerance);
    if (!toleranceValidation.isValid) {
      newErrors.tolerance = toleranceValidation.message;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Safe number string for input values
  const getSafeNumberString = (value) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '';
    }
    return String(value);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (method === 'bisection' || method === 'secant') {
        onCalculate(functionString, parseFloat(a), parseFloat(b), parseFloat(tolerance));
      } else if (method === 'newton') {
        onCalculate(functionString, derivativeString, parseFloat(x0), parseFloat(tolerance));
      }
    } catch (err) {
      console.error("Error during calculation:", err);
      setErrors(prev => ({...prev, calculation: err.message}));
    }
  };

  // Safe handlers for numeric inputs
  const handleNumberChange = (setter, field) => (e) => {
    const value = e.target.value.trim();
    
    if (value === '') {
      // For empty values, default to a reasonable value
      switch (field) {
        case 'a': setter(1); break;
        case 'b': setter(3); break;
        case 'x0': setter(2); break;
        case 'tolerance': setter(0.001); break;
        default: setter(0);
      }
    } else {
      const parsed = parseFloat(value);
      // Only update if it's a valid number
      if (!isNaN(parsed)) {
        setter(parsed);
      }
    }
    
    // Mark as manually edited
    if (['a', 'b', 'x0'].includes(field)) {
      setManuallyEdited(prev => ({...prev, [field]: true}));
    }
  };

  // Handle derivative change
  const handleDerivativeChange = (e) => {
    setDerivativeString(e.target.value);
    setManuallyEdited(prev => ({...prev, derivative: true}));
  };

  // Form variants for animations
  const formVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
        staggerChildren: 0.07
      }
    }
  };

  const inputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 15
      }
    },
    hover: { 
      scale: 1.05,
      boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.2)"
    },
    tap: { 
      scale: 0.95,
      boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)"
    }
  };

  return (
    <motion.form 
      onSubmit={handleSubmit}
      variants={formVariants}
      initial="hidden"
      animate="visible"
      className="method-form"
    >
      <motion.div className="form-group" variants={inputVariants}>
        <label htmlFor="function">Функція:</label>
        <input
          type="text"
          id="function"
          value={functionString}
          onChange={(e) => setFunctionString(e.target.value)}
          placeholder="Напр.: x^2 - 4"
          required
          className={errors.functionString ? "input-error" : ""}
        />
        {errors.functionString && (
          <div className="error-message">{errors.functionString}</div>
        )}
      </motion.div>

      {method === 'newton' ? (
        <motion.div className="form-group" variants={inputVariants}>
          <label htmlFor="derivative">Похідна функції:</label>
          <div className="input-with-indicator">
            <input
              type="text"
              id="derivative"
              value={derivativeString}
              onChange={handleDerivativeChange}
              placeholder="Напр.: 2*x"
              required
              className={errors.derivativeString ? "input-error" : ""}
            />
            {calculatedDerivative && !manuallyEdited.derivative && (
              <div className="auto-calculated-indicator">
                Автоматично обчислено
              </div>
            )}
          </div>
          {errors.derivativeString && (
            <div className="error-message">{errors.derivativeString}</div>
          )}
        </motion.div>
      ) : (
        <>
          <motion.div className="form-group" variants={inputVariants}>
            <label htmlFor="a">Початок інтервалу (a):</label>
            <div className="input-with-indicator">
              <input
                type="number"
                id="a"
                value={getSafeNumberString(a)}
                onChange={handleNumberChange(setA, 'a')}
                step="any"
                required
                className={errors.a ? "input-error" : ""}
              />
              {calculatedInterval && !manuallyEdited.a && (
                <div className="auto-calculated-indicator below-field">
                  Автоматично знайдено
                </div>
              )}
            </div>
            {errors.a && (
              <div className="error-message">{errors.a}</div>
            )}
          </motion.div>

          <motion.div className="form-group" variants={inputVariants}>
            <label htmlFor="b">Кінець інтервалу (b):</label>
            <div className="input-with-indicator">
              <input
                type="number"
                id="b"
                value={getSafeNumberString(b)}
                onChange={handleNumberChange(setB, 'b')}
                step="any"
                required
                className={errors.b ? "input-error" : ""}
              />
              {calculatedInterval && !manuallyEdited.b && (
                <div className="auto-calculated-indicator below-field">
                  Автоматично знайдено
                </div>
              )}
            </div>
            {errors.b && (
              <div className="error-message">{errors.b}</div>
            )}
          </motion.div>
          
          {errors.interval && (
            <motion.div className="error-message" variants={inputVariants}>
              {errors.interval}
            </motion.div>
          )}
        </>
      )}

      {method === 'newton' && (
        <motion.div className="form-group" variants={inputVariants}>
          <label htmlFor="x0">Початкове наближення (x0):</label>
          <div className="input-with-indicator">
            <input
              type="number"
              id="x0"
              value={getSafeNumberString(x0)}
              onChange={handleNumberChange(setX0, 'x0')}
              step="any"
              required
              className={errors.x0 ? "input-error" : ""}
            />
            {calculatedInterval && !manuallyEdited.x0 && (
              <div className="auto-calculated-indicator below-field">
                Автоматично знайдено
              </div>
            )}
          </div>
          {errors.x0 && (
            <div className="error-message">{errors.x0}</div>
          )}
        </motion.div>
      )}

      <motion.div className="form-group" variants={inputVariants}>
        <label htmlFor="tolerance">Точність:</label>
        <div className="input-with-tooltip">
          <input
            type="number"
            id="tolerance"
            value={getSafeNumberString(tolerance)}
            onChange={handleNumberChange(setTolerance, 'tolerance')}
            step="0.0000001"
            min="0.0000001"
            max="0.1"
            required
            className={errors.tolerance ? "input-error" : ""}
          />
          <div className="tolerance-info">
            <i className="info-icon">ℹ</i>
            <div className="tolerance-tooltip">
              Допустимі значення: від 0,0000001 до 0,1
            </div>
          </div>
        </div>
        {errors.tolerance && (
          <div className="error-message">{errors.tolerance}</div>
        )}
      </motion.div>

      {errors.calculation && (
        <motion.div 
          className="error-message" 
          variants={inputVariants}
          style={{ marginBottom: '15px' }}
        >
          {errors.calculation}
        </motion.div>
      )}

      <motion.div className="button-group" variants={inputVariants}>
        <motion.button
          type="submit"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          className="calculate-button"
          disabled={loading}
        >
          {loading ? "Обчислення..." : "Обчислити"}
        </motion.button>
      </motion.div>

      {hasResults && (
        <motion.div className="navigation-buttons" variants={inputVariants}>
          <motion.button
            type="button"
            onClick={onPrevious}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className="nav-button"
          >
            Попередній результат
          </motion.button>
          
          <motion.button
            type="button"
            onClick={onNext}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className="nav-button"
          >
            Наступний результат
          </motion.button>
        </motion.div>
      )}
    </motion.form>
  );
};

export default EnhancedMethodForm;