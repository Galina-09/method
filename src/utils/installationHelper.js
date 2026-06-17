
// Detects and provides guidance for missing dependencies
export const checkDependencies = (dependencies = ['docx', 'mathjs', 'framer-motion']) => {
  const missingDependencies = [];
  
  // Check each dependency
  dependencies.forEach(dependency => {
    try {
      // Try to require the dependency
      require(dependency);
    } catch (error) {
      // If there's an error, it's likely missing
      missingDependencies.push(dependency);
    }
  });
  
  // Return object with status and instructions
  return {
    allInstalled: missingDependencies.length === 0,
    missing: missingDependencies,
    installCommand: missingDependencies.length > 0 
      ? `npm install ${missingDependencies.join(' ')}` 
      : null,
    getInstallMessage: () => {
      if (missingDependencies.length === 0) {
        return null;
      }
      
      const plural = missingDependencies.length > 1;
      return `Відсутня ${plural ? 'залежності' : 'залежність'}: ${missingDependencies.join(', ')}. 
      Встановіть ${plural ? 'їх' : 'її'} за допомогою команди: npm install ${missingDependencies.join(' ')}`;
    }
  };
};

// Generate error messages in Ukrainian
export const getErrorMessage = (errorType, params = {}) => {
  const errorMessages = {
    functionEvaluation: 'Помилка обчислення функції',
    derivativeEvaluation: 'Помилка обчислення похідної',
    zeroDerivative: 'Похідна дорівнює нулю в точці. Спробуйте інше початкове наближення',
    noSignChange: 'Функція не змінює знак на вказаному інтервалі',
    convergenceFailed: 'Метод не зійшовся за максимальну кількість ітерацій',
    invalidTolerance: 'Неприпустиме значення точності. Використовуйте значення між 0.0000001 і 0.1',
    missingDependency: `Відсутня залежність: ${params.dependency || 'невідома'}`
  };
  
  return errorMessages[errorType] || 'Невідома помилка';
};

// Check browser capabilities for features needed by the application
export const checkBrowserSupport = () => {
  const issues = [];
  
  // Check for canvas support
  if (!window.HTMLCanvasElement) {
    issues.push('Ваш браузер не підтримує HTML Canvas, необхідний для візуалізації графіків');
  }
  
  // Check for modern JavaScript support
  try {
    eval('const test = () => {}');
  } catch (e) {
    issues.push('Ваш браузер не підтримує сучасний JavaScript. Оновіть браузер для коректної роботи');
  }
  
  // Check for localStorage support (for saving preferences)
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
  } catch (e) {
    issues.push('Ваш браузер не підтримує локальне сховище, деякі налаштування не будуть збережені');
  }
  
  return {
    supported: issues.length === 0,
    issues
  };
};

export default {
  checkDependencies,
  getErrorMessage,
  checkBrowserSupport
};