import React from 'react';
import { motion } from 'framer-motion';
import { useCalculation } from '../context/CalculationContext';

const CalculationHistory = ({ method, onSelect }) => {
  const { calculationHistory } = useCalculation();
  const methodHistory = calculationHistory[method] || [];
  
  if (methodHistory.length <= 1) return null;
  
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
    hover: {
      scale: 1.05,
      boxShadow: "0px 3px 8px rgba(0, 0, 0, 0.15)",
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10
      }
    },
    tap: {
      scale: 0.95,
      boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)"
    }
  };
  
  return (
    <motion.div 
      className="calculation-history"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h3>Історія обчислень</h3>
      
      <motion.div className="history-list" variants={containerVariants}>
        {methodHistory.map((calc, index) => (
          <motion.div 
            key={index}
            className="history-item"
            variants={itemVariants}
          >
            <motion.button 
              className="history-button"
              onClick={() => onSelect(index)}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <span className="history-index">{index + 1}</span>
              <div className="history-details">
                <div className="history-function">{calc.funcStr}</div>
                <div className="history-result">
                  <span>Корінь: {calc.root.toFixed(6)}</span>
                  <span>• Ітерацій: {calc.results.length}</span>
                </div>
              </div>
            </motion.button>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default CalculationHistory;