import React, { createContext, useState, useContext, useEffect } from 'react';

// Define theme options
const themes = {
  bisection: {
    primary: '#ff8f00', 
    secondary: '#e65100',
    background: 'linear-gradient(to bottom, #ffd181, rgb(160, 107, 107))',
    buttonHover: '#bf360c',
    lightAccent: '#ffcc80'
  },
  secant: {
    primary: '#007bff',
    secondary: '#0056b3', 
    background: 'linear-gradient(to bottom, #a5d5ff, rgb(160, 107, 107))',
    buttonHover: '#003380',
    lightAccent: '#b3d7ff'
  },
  newton: {
    primary: '#6a1b9a',
    secondary: '#4a148c',
    background: 'linear-gradient(to bottom, #d78ce4, rgb(121, 64, 64))',
    buttonHover: '#38006b',
    lightAccent: '#ce93d8'
  },
  home: {
    primary: '#673ab7',
    secondary: '#512da8',
    background: 'linear-gradient(to right, #daa956, #a5d5ff, #bc54d1)',
    buttonHover: '#4527a0',
    lightAccent: '#d1c4e9'
  },
  comparison: {
    primary: '#673ab7',
    secondary: '#3f51b5',
    background: 'linear-gradient(135deg, #e1bee7 0%, #f3e5f5 100%)',
    buttonHover: '#303f9f',
    lightAccent: '#e1bee7'
  }
};

// Create context
const ThemeContext = createContext();

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('home');
  const [themeColors, setThemeColors] = useState(themes.home);
  
  // Update the theme CSS variables when theme changes
  useEffect(() => {
    const root = document.documentElement;
    
    root.style.setProperty('--primary-color', themeColors.primary);
    root.style.setProperty('--secondary-color', themeColors.secondary);
    root.style.setProperty('--background-gradient', themeColors.background);
    root.style.setProperty('--button-hover', themeColors.buttonHover);
    root.style.setProperty('--light-accent', themeColors.lightAccent);
    
    // Set a smooth transition
    document.body.classList.remove('theme-transition');
    
    // Force reflow
    void document.body.offsetWidth;
    
    document.body.classList.add('theme-transition');
  }, [themeColors]);

  // Change the theme based on method or page
  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
      setThemeColors(themes[themeName]);
    }
  };

  const value = {
    currentTheme,
    themeColors,
    changeTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};