import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Header = ({ title, showHomeButton = true }) => {
  const { currentTheme } = useTheme();
  
  // Animations
  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  };
  
  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.2)",
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10
      }
    },
    tap: {
      scale: 0.95,
      boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)"
    }
  };
  
  return (
    <motion.div 
      className={`page-header ${currentTheme}-theme`}
      variants={headerVariants}
      initial="hidden"
      animate="visible"
    >
      <h1>{title}</h1>
      
      {showHomeButton && (
        <motion.div 
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <Link to="/" className="home-button">На головну</Link>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Header;