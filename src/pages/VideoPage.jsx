// Path: src/pages/VideoPage.jsx

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const VideoPage = ({ title, videoSrc, methodTheme, methodPath, pdfPath }) => {
  const { changeTheme } = useTheme();
  
  // Set theme based on method
  useEffect(() => {
    if (methodTheme) {
      changeTheme(methodTheme);
    }
    document.body.classList.add('loaded');
    
    return () => {
      document.body.classList.remove('loaded');
    };
  }, [changeTheme, methodTheme]);
  
  // Animation variants
  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.2
      }
    },
    exit: { opacity: 0 }
  };
  
  const itemVariants = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
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
      boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)",
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
      className="video-page"
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div className="page-header" variants={itemVariants}>
        <h1>{title}</h1>
        <motion.div 
          whileHover="hover"
          whileTap="tap"
          variants={buttonVariants}
        >
          <Link to="/" className="home-button">На головну</Link>
        </motion.div>
      </motion.div>
      
      <motion.div className="video-container" variants={itemVariants}>
        <video controls width="800">
          <source src={videoSrc} type="video/mp4" />
          Ваш браузер не підтримує відтворення відео.
        </video>
      </motion.div>
      
      <motion.div className="video-navigation" variants={itemVariants}>
        <div className="button-group">
          {methodPath && (
            <motion.div 
              whileHover="hover"
              whileTap="tap"
              variants={buttonVariants}
            >
              <Link to={methodPath} className="method-link">
                Перейти до методу
              </Link>
            </motion.div>
          )}
          
          {pdfPath && (
            <motion.div 
              whileHover="hover"
              whileTap="tap"
              variants={buttonVariants}
            >
              <a 
                href={pdfPath} 
                target="_blank" 
                rel="noreferrer" 
                className="theory-link"
              >
                Теоретичні відомості
              </a>
            </motion.div>
          )}
        </div>
      </motion.div>
      
      <motion.div className="video-description" variants={itemVariants}>
        <h2>Опис</h2>
        {methodTheme === 'bisection' && (
          <p>
            Метод половинного ділення - це простий і надійний метод знаходження коренів рівняння. 
            Він ґрунтується на теоремі про проміжне значення і полягає в послідовному звуженні інтервалу, 
            на якому лежить корінь. Це один з найбільш стійких методів, хоча він може збігатися повільніше в порівнянні 
            з методами вищого порядку.
          </p>
        )}
        
        {methodTheme === 'secant' && (
          <p>
            Метод хорд - це метод знаходження коренів рівняння шляхом апроксимації функції хордою (прямою лінією), 
            яка проходить через дві точки на кривій. Цей метод має кращу швидкість збіжності, ніж метод половинного ділення, 
            і не вимагає обчислення похідної, як у методі Ньютона.
          </p>
        )}
        
        {methodTheme === 'newton' && (
          <p>
            Метод Ньютона (також відомий як метод дотичних) - потужний ітеративний метод знаходження коренів 
            рівняння, який використовує лінійну апроксимацію за допомогою дотичної. Метод вимагає обчислення похідної функції, 
            але забезпечує квадратичну збіжність у більшості випадків. Це один з найефективніших методів, хоча він чутливий 
            до вибору початкового наближення.
          </p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default VideoPage;