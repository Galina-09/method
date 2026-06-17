// Path: src/utils/debugHelper.js

/**
 * Утиліта для діагностики та виправлення помилок під час виконання
 */

// Функція для розширеного виводу помилок у консоль
export const logError = (error, context = {}) => {
  console.error(`🔴 Помилка: ${error.message}`, {
    назва: error.name,
    стек: error.stack,
    контекст: context
  });
  
  return {
    message: error.message,
    type: error.name,
    hasStack: !!error.stack
  };
};

// Перевірка наявності необхідних залежностей у проекті
export const checkDependencies = () => {
  const dependencies = {
    react: false,
    mathjs: false,
    framerMotion: false,
    reactRouter: false
  };
  
  try {
    // Перевірка React
    if (typeof React !== 'undefined') {
      dependencies.react = true;
    }
    
    // Перевірка Math.js
    try {
      const math = require('mathjs');
      dependencies.mathjs = !!math;
    } catch (e) {}
    
    // Перевірка Framer Motion
    try {
      const motion = require('framer-motion');
      dependencies.framerMotion = !!motion;
    } catch (e) {}
    
    // Перевірка React Router
    try {
      const router = require('react-router-dom');
      dependencies.reactRouter = !!router;
    } catch (e) {}
    
  } catch (e) {
    console.error("Помилка перевірки залежностей:", e);
  }
  
  const missingDeps = Object.keys(dependencies).filter(key => !dependencies[key]);
  return {
    allPresent: missingDeps.length === 0,
    dependencies,
    missing: missingDeps,
    message: missingDeps.length > 0 
      ? `Відсутні залежності: ${missingDeps.join(', ')}. Запустіть npm install.` 
      : "Усі залежності встановлено."
  };
};

// Перевірка можливостей браузера
export const checkBrowserCapabilities = () => {
  const capabilities = {
    canvas: false,
    localStorage: false,
    es6: false,
    flexbox: false
  };
  
  // Перевірка підтримки Canvas
  capabilities.canvas = typeof HTMLCanvasElement !== 'undefined';
  
  // Перевірка localStorage
  try {
    capabilities.localStorage = typeof localStorage !== 'undefined';
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
  } catch (e) {
    capabilities.localStorage = false;
  }
  
  // Перевірка ES6
  try {
    eval('const test = () => {}');
    capabilities.es6 = true;
  } catch (e) {
    capabilities.es6 = false;
  }
  
  // Перевірка Flexbox
  try {
    const test = document.createElement('div');
    capabilities.flexbox = 'flex' in test.style;
  } catch (e) {
    capabilities.flexbox = false;
  }
  
  const missingCapabilities = Object.keys(capabilities).filter(key => !capabilities[key]);
  return {
    allSupported: missingCapabilities.length === 0,
    capabilities,
    missing: missingCapabilities,
    message: missingCapabilities.length > 0 
      ? `Браузер не підтримує: ${missingCapabilities.join(', ')}. Оновіть браузер.` 
      : "Браузер підтримує всі необхідні можливості."
  };
};

// Виправлення найпоширеніших помилок
export const fixCommonErrors = (errorMessage) => {
  // Відомі помилки та їх виправлення
  const knownErrors = [
    {
      pattern: /is not defined/i,
      diagnosis: "Компонент використовує невизначену змінну або функцію.",
      fix: "Перевірте імпорти компонента та додайте відсутні."
    },
    {
      pattern: /cannot read property .* of (undefined|null)/i,
      diagnosis: "Спроба звернутися до властивості невизначеного об'єкта.",
      fix: "Додайте перевірку існування об'єкта перед зверненням до його властивостей."
    },
    {
      pattern: /useCallback is not defined/i,
      diagnosis: "Хук useCallback не імпортовано з React.",
      fix: "Додайте useCallback до списку імпортів з React."
    },
    {
      pattern: /invalid hook call/i,
      diagnosis: "Неправильний виклик хука React.",
      fix: "Переконайтеся, що хуки викликаються тільки на верхньому рівні компонента."
    },
    {
      pattern: /cannot update a component while rendering a different component/i,
      diagnosis: "Спроба оновити стан під час рендерингу іншого компонента.",
      fix: "Перемістіть оновлення стану в useEffect або інший обробник подій."
    }
  ];
  
  for (const error of knownErrors) {
    if (error.pattern.test(errorMessage)) {
      return {
        identified: true,
        ...error
      };
    }
  }
  
  return {
    identified: false,
    diagnosis: "Невідома помилка.",
    fix: "Перевірте консоль браузера для додаткової інформації."
  };
};

// Створення та відображення компонента зі звітом про помилки
export const createErrorBoundary = (error, componentStack, reset) => {
  // Діагностика помилки
  const analysis = fixCommonErrors(error.message);
  
  // Шаблон компонента звіту про помилки
  return `
    <div className="error-boundary">
      <h2>Виникла помилка</h2>
      <div className="error-details">
        <p className="error-message">${error.message}</p>
        ${analysis.identified ? `
          <div className="error-diagnosis">
            <p><strong>Діагноз:</strong> ${analysis.diagnosis}</p>
            <p><strong>Вирішення:</strong> ${analysis.fix}</p>
          </div>
        ` : ''}
        <div className="error-stack">
          <p><strong>Стек компонентів:</strong></p>
          <pre>${componentStack}</pre>
        </div>
      </div>
      <button onClick={reset} className="error-reset-btn">
        Спробувати знову
      </button>
    </div>
  `;
};

export default {
  logError,
  checkDependencies,
  checkBrowserCapabilities,
  fixCommonErrors,
  createErrorBoundary
};