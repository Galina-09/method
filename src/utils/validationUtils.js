
export const validationMessages = {
  required: "Будь ласка, заповніть це поле.",
  number: "Будь ласка, введіть числове значення.",
  minValue: (min) => `Значення повинно бути більше або дорівнювати ${min}.`,
  maxValue: (max) => `Значення повинно бути менше або дорівнювати ${max}.`,
  minLength: (min) => `Текст повинен містити щонайменше ${min} символів.`,
  invalidFormat: "Неправильний формат введення.",
  tolerance: "Введіть допустиме значення точності (наприклад: 0.001, 0.0001).",
  toleranceRange: "Допустимі значення точності: від 0,0000001 до 0,1.",
  invalidInterval: "Початок інтервалу має бути менше кінця інтервалу.",
  noSignChange: "Функція не змінює знак на вказаному інтервалі.",
  emptyFunction: "Будь ласка, введіть функцію для обчислення.",
  emptyDerivative: "Будь ласка, введіть похідну функції.",
  invalidFunction: "Неправильний формат функції. Перевірте синтаксис.",
  invalidDerivative: "Неправильний формат похідної. Перевірте синтаксис."
};

/**
 * Перевіряє, що значення не є порожнім
 * @param {string} value - Значення для перевірки
 * @returns {Object} - Результат валідації
 */
export const validateRequired = (value) => {
  const isValid = value !== undefined && value !== null && value.toString().trim() !== '';
  return {
    isValid,
    message: isValid ? null : validationMessages.required
  };
};

/**
 * Перевіряє, що значення є дійсним числом
 * @param {string} value - Значення для перевірки
 * @returns {Object} - Результат валідації
 */
export const validateNumber = (value) => {
  const isValid = !isNaN(parseFloat(value)) && isFinite(value);
  return {
    isValid,
    message: isValid ? null : validationMessages.number
  };
};

/**
 * Перевіряє обмеження мінімального значення
 * @param {number} value - Значення для перевірки
 * @param {number} min - Мінімально допустиме значення
 * @returns {Object} - Результат валідації
 */
export const validateMin = (value, min) => {
  const numValue = parseFloat(value);
  const isValid = !isNaN(numValue) && numValue >= min;
  return {
    isValid,
    message: isValid ? null : validationMessages.minValue(min)
  };
};

/**
 * Перевіряє обмеження максимального значення
 * @param {number} value - Значення для перевірки
 * @param {number} max - Максимально допустиме значення
 * @returns {Object} - Результат валідації
 */
export const validateMax = (value, max) => {
  const numValue = parseFloat(value);
  const isValid = !isNaN(numValue) && numValue <= max;
  return {
    isValid,
    message: isValid ? null : validationMessages.maxValue(max)
  };
};

/**
 * Перевіряє що початок інтервалу менше кінця
 * @param {number} start - Початок інтервалу
 * @param {number} end - Кінець інтервалу
 * @returns {Object} - Результат валідації
 */
export const validateInterval = (start, end) => {
  const startValue = parseFloat(start);
  const endValue = parseFloat(end);
  const isValid = !isNaN(startValue) && !isNaN(endValue) && startValue < endValue;
  return {
    isValid,
    message: isValid ? null : validationMessages.invalidInterval
  };
};

/**
 * Перевіряє значення точності для чисельних методів
 * @param {number} value - Значення точності для перевірки
 * @returns {Object} - Результат валідації
 */
export const validateTolerance = (value) => {
  const numValue = parseFloat(value);
  
  // Перевірка, чи є це дійсним числом між 0 та 1
  if (isNaN(numValue) || numValue <= 0 || numValue >= 1) {
    return {
      isValid: false,
      message: validationMessages.tolerance
    };
  }
  
  // Перевірка, чи знаходиться точність у розумному діапазоні
  const isReasonable = numValue >= 0.0000001 && numValue <= 0.1;
  
  if (!isReasonable) {
    return {
      isValid: false,
      message: validationMessages.toleranceRange
    };
  }
  
  return { isValid: true, message: null };
};

/**
 * Перевіряє функцію на синтаксичні помилки
 * @param {string} functionStr - Рядок з функцією
 * @param {Object} mathLib - Бібліотека математичних функцій
 * @returns {Object} - Результат валідації
 */
export const validateFunction = (functionStr, mathLib) => {
  // Перевірка на пустий рядок
  if (!functionStr || functionStr.trim() === '') {
    return {
      isValid: false,
      message: validationMessages.emptyFunction
    };
  }
  
  // Перевірка синтаксису, пробуючи обчислити функцію
  try {
    mathLib.evaluate(functionStr, { x: 1 });
    return { isValid: true, message: null };
  } catch (error) {
    return {
      isValid: false,
      message: validationMessages.invalidFunction
    };
  }
};

/**
 * Перевіряє похідну на синтаксичні помилки
 * @param {string} derivativeStr - Рядок з похідною
 * @param {Object} mathLib - Бібліотека математичних функцій
 * @returns {Object} - Результат валідації
 */


/**
 * Перевіряє зміну знаку функції на інтервалі
 * @param {string} functionStr - Рядок з функцією
 * @param {number} a - Початок інтервалу
 * @param {number} b - Кінець інтервалу
 * @param {Object} mathLib - Бібліотека математичних функцій
 * @returns {Object} - Результат валідації
 */
export const validateSignChange = (functionStr, a, b, mathLib) => {
  try {
    const fa = mathLib.evaluate(functionStr, { x: a });
    const fb = mathLib.evaluate(functionStr, { x: b });
    const isValid = fa * fb <= 0;
    
    return {
      isValid,
      message: isValid ? null : validationMessages.noSignChange
    };
  } catch (error) {
    return {
      isValid: false,
      message: validationMessages.invalidFunction
    };
  }
};

/**
 * Перевіряє похідну на синтаксичні помилки з покращеною обробкою типів
 * @param {string} derivativeStr - Рядок з похідною
 * @param {Object} mathLib - Бібліотека математичних функцій
 * @returns {Object} - Результат валідації
 */
export const validateDerivative = (derivativeStr, mathLib) => {
  // Ensure derivativeStr is a string to prevent "trim is not a function" error
  if (typeof derivativeStr !== 'string') {
    return {
      isValid: false,
      message: "Похідна має бути рядком"
    };
  }
  
  // Перевірка на пустий рядок
  if (!derivativeStr || derivativeStr.trim() === '') {
    return {
      isValid: false,
      message: "Будь ласка, введіть похідну функції."
    };
  }
  
  // Перевірка синтаксису, пробуючи обчислити похідну
  try {
    mathLib.evaluate(derivativeStr, { x: 1 });
    return { isValid: true, message: null };
  } catch (error) {
    return {
      isValid: false,
      message: "Неправильний формат похідної. Перевірте синтаксис."
    };
  }
};

// Експорт об'єкту з функціями валідації
const validationUtils = {
  validateRequired,
  validateNumber,
  validateMin,
  validateMax,
  validateInterval,
  validateTolerance,
  validateFunction,
  validateDerivative,
  validateSignChange,
  validationMessages
};

export default validationUtils;