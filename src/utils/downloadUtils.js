/**
 * Generates text content for downloading calculation results
 * @param {Object} calculation - Calculation result object
 * @param {string} method - Calculation method name
 * @returns {string} - Text content for download
 */
export const generateDownloadContent = (calculation, method) => {
  if (!calculation) return '';
  
  let text = '';
  
  // Header
  text += "-------------------------------------------------------------------\n";
  
  if (method === 'bisection') {
    text += `Використаний метод: Половинного ділення \n`;
  } else if (method === 'secant') {
    text += `Використаний метод: Хорд \n`;
  } else if (method === 'newton') {
    text += `Використаний метод: Ньютона \n`;
  } else {
    text += `Використаний метод: ${method} \n`;
  }
  
  text += "-------------------------------------------------------------------\n\n";
  
  // Input data
  text += "Введені дані:\n";
  text += "-------------------------------------------------------------------\n";
  text += `| Функція:             | ${calculation.funcStr.padEnd(30)} |\n`;
  
  if (method === 'bisection' || method === 'secant') {
    text += `| Початок інтервалу:   | ${calculation.a.toString().padEnd(30)} |\n`;
    text += `| Кінець інтервалу:    | ${calculation.b.toString().padEnd(30)} |\n`;
  } else if (method === 'newton') {
    text += `| Початкове наближення: | ${calculation.x0.toString().padEnd(30)} |\n`;
    text += `| Похідна:              | ${calculation.derivativeStr.padEnd(30)} |\n`;
  }
  
  text += `| Точність:            | ${calculation.tolerance.toString().padEnd(30)} |\n`;
  text += "-------------------------------------------------------------------\n\n";
  
  // Iteration results
  text += "Результати ітерацій:\n";
  text += "-------------------------------------------------------------------\n";
  
  if (method === 'bisection') {
    text += "| Ітерація | Ліва межа | Права межа | Середина | f(середина) |\n";
    text += "-------------------------------------------------------------------\n";
    
    calculation.results.forEach((res, index) => {
      text += `| ${index + 1}`.padEnd(10);
      text += `| ${res.left.toString().padEnd(10)}`;
      text += `| ${res.right.toString().padEnd(11)}`;
      text += `| ${res.mid.toString().padEnd(9)}`;
      text += `| ${res.fmid.toString().padEnd(13)} |\n`;
    });
  } else if (method === 'secant') {
    text += "| Ітерація |     x0     |     x1     |     x2     |    f(x2)    |\n";
    text += "-------------------------------------------------------------------\n";
    
    calculation.results.forEach((res, index) => {
      text += `| ${index + 1}`.padEnd(10);
      text += `| ${res.x0.toString().padEnd(12)}`;
      text += `| ${res.x1.toString().padEnd(12)}`;
      text += `| ${res.x2.toString().padEnd(12)}`;
      text += `| ${res.fx2.toString().padEnd(14)} |\n`;
    });
  } else if (method === 'newton') {
    text += "| Ітерація |        x0      |        x1      |       f(x0)    |\n";
    text += "-------------------------------------------------------------------\n";
    
    calculation.results.forEach((res, index) => {
      text += `| ${index + 1}`.padEnd(10);
      text += `| ${res.x0.toString().padEnd(18)}`;
      text += `| ${res.x1.toString().padEnd(18)}`;
      text += `| ${res.fx.toString().padEnd(15)} |\n`;
    });
  }
  
  text += "-------------------------------------------------------------------\n\n";
  
  // Final result
  text += "Результат:\n";
  text += "-------------------------------------------------------------------\n";
  text += `| Корінь:               | ${calculation.root.toString().padEnd(30)} |\n`;
  
  if (calculation.finalError !== undefined) {
    text += `| Похибка:              | ${calculation.finalError.toString().padEnd(30)} |\n`;
  }
  
  if (calculation.iterations !== undefined) {
    text += `| Кількість ітерацій:   | ${calculation.iterations.toString().padEnd(30)} |\n`;
  } else if (calculation.results) {
    text += `| Кількість ітерацій:   | ${calculation.results.length.toString().padEnd(30)} |\n`;
  }
  
  text += "-------------------------------------------------------------------\n";
  
  return text;
};

/**
 * Creates and triggers a file download
 * @param {string} content - File content
 * @param {string} filename - File name
 * @param {string} type - File MIME type
 */
export const downloadFile = (content, filename, type = 'text/plain;charset=utf-8') => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Create a named export object
const downloadUtils = {
  generateDownloadContent,
  downloadFile
};

export default downloadUtils;