import React from 'react';
import { motion } from 'framer-motion';

const ResultDisplay = ({ calculation, method }) => {
  if (!calculation) return null;
  
  // Animation variants
  const resultVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
        delay: 0.1
      }
    }
  };
  
  return (
    <motion.div 
      className="result-card"
      variants={resultVariants}
      initial="hidden"
      animate="visible"
    >
      <h2>Результати</h2>
      
      <div className="numerical-result">
        <p><strong>Корінь:</strong> {calculation.root.toFixed(8)}</p>
        <p><strong>Кількість ітерацій:</strong> {calculation.results.length}</p>
        <p><strong>Точність:</strong> {calculation.tolerance}</p>
        <p><strong>Похибка:</strong> {calculation.finalError.toExponential(4)}</p>
        <p><strong>Збіжність:</strong> {calculation.converged ? 'Так' : 'Ні'}</p>
      </div>
      
      {method === 'bisection' && (
        <div className="method-specific-info">
          <p>
            <strong>Остання ітерація:</strong> Інтервал [{calculation.results[calculation.results.length - 1].left.toFixed(6)}, {calculation.results[calculation.results.length - 1].right.toFixed(6)}]
          </p>
        </div>
      )}
      
      {method === 'secant' && (
        <div className="method-specific-info">
          <p>
            <strong>Попередні наближення:</strong> x₀ = {calculation.results[calculation.results.length - 1].x0.toFixed(6)}, 
            x₁ = {calculation.results[calculation.results.length - 1].x1.toFixed(6)}
          </p>
        </div>
      )}
      
      {method === 'newton' && (
        <div className="method-specific-info">
          <p>
            <strong>Значення функції:</strong> f(x) = {calculation.results[calculation.results.length - 1].fx.toExponential(4)}
          </p>
          <p>
            <strong>Значення похідної:</strong> f'(x) = {calculation.results[calculation.results.length - 1].dfx.toExponential(4)}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default ResultDisplay;