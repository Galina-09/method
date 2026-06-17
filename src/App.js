// Path: src/App.js

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CalculationProvider } from './context/CalculationContext';
import { ThemeProvider } from './context/ThemeContext';
import NightSkyBackground from './components/NightSkyBackground';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Home from './pages/Home';
import BisectionMethod from './pages/BisectionMethod';
import SecantMethod from './pages/SecantMethod';
import NewtonMethod from './pages/NewtonMethod';
import NewComparisonPage from './pages/NewComparisonPage'; // Use the new comparison page instead
import BisectionVideo from './pages/videos/BisectionVideo';
import SecantVideo from './pages/videos/SecantVideo';
import NewtonVideo from './pages/videos/NewtonVideo';

// Import additional CSS
import './css/enhanced-styles.css';

// Animation wrapper
const AnimatedRoutes = () => {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    in: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: -20,
    }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
        className="page-container"
      >
        <ErrorBoundary>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/bisection" element={<BisectionMethod />} />
            <Route path="/secant" element={<SecantMethod />} />
            <Route path="/newton" element={<NewtonMethod />} />
            <Route path="/compare" element={<NewComparisonPage />} />
            <Route path="/videos/bisection" element={<BisectionVideo />} />
            <Route path="/videos/secant" element={<SecantVideo />} />
            <Route path="/videos/newton" element={<NewtonVideo />} />
          </Routes>
        </ErrorBoundary>
      </motion.div>
    </AnimatePresence>
  );
};

function App() {
  return (
    <ThemeProvider>
      <CalculationProvider>
        <Router>
          <div className="app">
            <NightSkyBackground />
            <AnimatedRoutes />
          </div>
        </Router>
      </CalculationProvider>
    </ThemeProvider>
  );
}

export default App;