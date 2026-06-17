import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useCalculation } from '../context/CalculationContext';
import { useNewtonMethod } from '../hooks/useNewtonMethod';
import { useAutoInputs } from '../hooks/useAutoInputs';
import Graph from '../components/Graph';
import Header from '../components/Header';
import DownloadButton from '../components/DownloadButton';

const NewtonMethod = () => {
  const { changeTheme } = useTheme();
  const { calculate, loading, error } = useNewtonMethod();
  const { previousCalculation, nextCalculation } = useCalculation();
  
  const [calculation, setCalculation] = useState(null);
  const [message, setMessage] = useState('');
  
  // Reference to Graph component for capturing in DOCX reports
  const graphRef = useRef(null);
  
  // Use enhanced auto-inputs hook
  const {
    functionString,
    x0,
    tolerance,
    derivativeString,
    handleFunctionChange,
    handleInputChange,
    handleDerivativeChange,
    calculatedDerivative,
    calculatedInterval,
    manuallyEdited,
    updateFromCalculation
  } = useAutoInputs({
    functionString: 'x^2 - 3',
    x0: 2,
    tolerance: 0.001,
    derivativeString: '2*x'
  }, 'newton');
  
  // Change theme to match the current method
  useEffect(() => {
    changeTheme('newton');
    document.body.classList.add('loaded');
    
    return () => {
      document.body.classList.remove('loaded');
    };
  }, [changeTheme]);
  
  // Handle calculation
  const handleCalculate = () => {
    setMessage('');
    const result = calculate(functionString, derivativeString, x0, tolerance);
    if (result) {
      setCalculation(result);
    }
  };
  
  // Handle navigation through calculation history
  const handlePrevious = () => {
    const prev = previousCalculation('newton');
    if (prev) {
      setCalculation(prev);
      updateFromCalculation(prev);
    }
  };
  
  const handleNext = () => {
    const next = nextCalculation('newton');
    if (next) {
      setCalculation(next);
      updateFromCalculation(next);
    }
  };
  
  // Page animation variants
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        duration: 0.5, 
        staggerChildren: 0.1 
      }
    },
    exit: { opacity: 0 }
  };
  
  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };
  
  return (
    <motion.div 
      className="method-page newton-method"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Header title="Метод Ньютона" showHomeButton={true} />
      
      <div className="method-content">
        <motion.div className="form-section" variants={itemVariants}>
          <form onSubmit={(e) => { e.preventDefault(); handleCalculate(); }} className="method-form">
            <motion.div className="form-group" variants={itemVariants}>
              <label htmlFor="function">Функція:</label>
              <input
                type="text"
                id="function"
                value={functionString}
                onChange={(e) => handleFunctionChange(e.target.value)}
                placeholder="Напр.: x^2 - 4"
                required
              />
            </motion.div>

            <motion.div className="form-group" variants={itemVariants}>
              <label htmlFor="derivative">Похідна функції:</label>
              <div className="input-with-indicator">
                <input
                  type="text"
                  id="derivative"
                  value={derivativeString}
                  onChange={(e) => handleDerivativeChange(e)}
                  placeholder="Напр.: 2*x"
                  required
                />
                {calculatedDerivative && !manuallyEdited.derivative && (
                  <div className="auto-calculated-indicator">
                    Автоматично обчислено
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div className="form-group" variants={itemVariants}>
              <label htmlFor="x0">Початкове наближення (x0):</label>
              <div className="input-with-indicator">
                <input
                  type="number"
                  id="x0"
                  value={x0}
                  onChange={handleInputChange(setX0 => value => setX0(value), 'x0')}
                  step="any"
                  required
                />
                {calculatedInterval && !manuallyEdited.x0 && (
                  <div className="auto-calculated-indicator below-field">
                    Автоматично знайдено
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div className="form-group" variants={itemVariants}>
              <label htmlFor="tolerance">Точність:</label>
              <div className="input-with-tooltip">
                <input
                  type="number"
                  id="tolerance"
                  value={tolerance}
                  onChange={handleInputChange(setTolerance => value => setTolerance(value), 'tolerance')}
                  step="0.0000001"
                  min="0.0000001"
                  max="0.1"
                  required
                />
                <div className="tolerance-info">
                  <i className="info-icon">ℹ</i>
                  <div className="tolerance-tooltip">
                    Допустимі значення: від 0,0000001 до 0,1
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div className="button-group" variants={itemVariants}>
              <motion.button
                type="submit"
                className="calculate-button"
                disabled={loading}
              >
                {loading ? "Обчислення..." : "Обчислити"}
              </motion.button>
            </motion.div>

            {calculation && (
              <motion.div className="navigation-buttons" variants={itemVariants}>
                <motion.button
                  type="button"
                  onClick={handlePrevious}
                  className="nav-button"
                >
                  Попередній результат
                </motion.button>
                
                <motion.button
                  type="button"
                  onClick={handleNext}
                  className="nav-button"
                >
                  Наступний результат
                </motion.button>
              </motion.div>
            )}
          </form>
          
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
          
          {message && (
            <motion.div 
              className="info-message"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p>{message}</p>
            </motion.div>
          )}
          
          {calculation && (
            <div className="download-section">
              <DownloadButton 
                calculation={calculation} 
                method="newton" 
                filename="newton_calculation"
                graphRef={graphRef}
              />
            </div>
          )}
        </motion.div>
        
        {calculation && (
          <motion.div 
            className="results-section"
            variants={itemVariants}
          >
            <motion.div 
              className="result-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h2>Результати</h2>
              
              <div className="numerical-result">
                <p><strong>Корінь:</strong> {calculation.root.toFixed(8)}</p>
                <p><strong>Кількість ітерацій:</strong> {calculation.results.length}</p>
                <p><strong>Точність:</strong> {calculation.tolerance}</p>
                <p><strong>Похибка:</strong> {calculation.finalError.toExponential(4)}</p>
              </div>
              
              <div className="graph-result">
                <Graph 
                  ref={graphRef}
                  funcStr={calculation.funcStr}
                  results={calculation.results}
                  method="newton"
                  width={500}
                  height={400}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
      
      <motion.div className="additional-links" variants={itemVariants}>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link to="/videos/newton" className="video-link">
            Переглянути відео про метод
          </Link>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <a 
            href="/assets/information/Teoretichni_Vidomosti_dla_mtyody_NYTONA.pdf" 
            target="_blank"
            rel="noreferrer" 
            className="theory-link"
          >
            Теоретичні відомості
          </a>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default NewtonMethod;