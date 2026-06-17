import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const Home = () => {
  const { changeTheme } = useTheme();
  
  useEffect(() => {
    // Set the theme to home when component mounts
    changeTheme('home');
    
    // Add loaded class to body for initial animations
    document.body.classList.add('loaded');
    
    return () => {
      // Clean up - remove loaded class when component unmounts
      document.body.classList.remove('loaded');
    };
  }, [changeTheme]);

  // Animation variants for staggered children animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12
      }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      y: -5,
      boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10
      }
    },
    tap: {
      scale: 0.95,
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    }
  };

  return (
    <div className="home-page">
      <motion.div 
        className="home-header"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1>Навчально-демонстраційний додаток "FIND ROOT"</h1>
      </motion.div>

      <motion.div 
        className="methods-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="method-card bisection" variants={itemVariants}>
          <h2>Метод Половинного Ділення</h2>
          <p>Простий метод пошуку коренів на основі послідовного зменшення інтервалу.</p>
          <div className="button-group">
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Link to="/bisection" className="method-btn">Почати</Link>
            </motion.div>
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Link to="/videos/bisection" className="video-btn">Відео</Link>
            </motion.div>
          </div>
        </motion.div>

        <motion.div className="method-card secant" variants={itemVariants}>
          <h2>Метод Хорд</h2>
          <p>Метод апроксимації функції хордами для знаходження коренів рівняння.</p>
          <div className="button-group">
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Link to="/secant" className="method-btn">Почати</Link>
            </motion.div>
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Link to="/videos/secant" className="video-btn">Відео</Link>
            </motion.div>
          </div>
        </motion.div>

        <motion.div className="method-card newton" variants={itemVariants}>
          <h2>Метод Ньютона</h2>
          <p>Ефективний метод знаходження кореня рівняння з використанням похідної.</p>
          <div className="button-group">
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Link to="/newton" className="method-btn">Почати</Link>
            </motion.div>
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Link to="/videos/newton" className="video-btn">Відео</Link>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

            <motion.div 
        className="comparison-section"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <motion.div 
          variants={buttonVariants} 
          whileHover="hover" 
          whileTap="tap"
        >
          <Link to="/compare" className="comparison-btn">
            Порівняння методів
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;