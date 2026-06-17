// Path: src/utils/docxReportUtils.js

import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  AlignmentType, 
  HeadingLevel,
  WidthType,
  ImageRun
} from 'docx';

/**
 * Create a DOCX report for calculation results
 * @param {Object} calculation - Calculation data
 * @param {string} method - Method name ('bisection', 'secant', 'newton')
 * @param {HTMLCanvasElement} canvas - Graph canvas
 * @returns {Promise<Blob>} - DOCX document as a Blob
 */
export const generateDocxReport = async (calculation, method, canvas) => {
  if (!calculation) return null;
  
  try {
    // Get method name in Ukrainian
    const methodNameUA = getMethodNameUA(method);
    
    // Convert canvas to image
    let graphImageData = null;
    if (canvas) {
      try {
        graphImageData = canvas.toDataURL('image/png');
      } catch (err) {
        console.warn("Could not get graph image data:", err);
      }
    }
    
    // Calculate success metrics
    const successMetrics = calculateSuccessMetrics(calculation);
    
    // Create sections for document
    const sections = [{
      properties: {},
      children: [
        ...createHeader(methodNameUA),
        ...createInputDataSection(calculation, method),
        ...createIterationsSection(calculation, method),
        ...createResultSection(calculation, successMetrics)
      ]
    }];
    
    // Add graph section if available
    if (graphImageData) {
      sections[0].children.push(...createGraphSection(graphImageData));
    }
    
    // Start creating document
    const doc = new Document({
      sections: sections
    });
    
    // Generate and return the document as a blob
    console.log('Generating DOCX document...');
    return await Packer.toBlob(doc);
  } catch (error) {
    console.error('Error creating DOCX report:', error);
    throw new Error(`Помилка створення звіту DOCX: ${error.message}`);
  }
};

/**
 * Get Ukrainian method name
 * @param {string} method - Method name
 * @returns {string} - Method name in Ukrainian
 */
const getMethodNameUA = (method) => {
  switch (method) {
    case 'bisection': return 'Половинного Ділення';
    case 'secant': return 'Хорд';
    case 'newton': return 'Ньютона';
    default: return method;
  }
};

/**
 * Create document header
 * @param {string} methodNameUA - Method name in Ukrainian
 * @returns {Array} - Array of document elements
 */
const createHeader = (methodNameUA) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('uk-UA');
  const timeStr = now.toLocaleTimeString('uk-UA');
  
  return [
    new Paragraph({
      text: `Звіт по методу ${methodNameUA}`,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Звіт згенеровано: ${dateStr} ${timeStr}`,
          italics: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: {
        after: 400,
      },
    }),
  ];
};

/**
 * Create input data section
 * @param {Object} calculation - Calculation data
 * @param {string} method - Method name
 * @returns {Array} - Array of document elements
 */
const createInputDataSection = (calculation, method) => {
  const rows = [
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph('Параметр')],
          shading: {
            fill: 'D3D3D3',
          },
        }),
        new TableCell({
          children: [new Paragraph('Значення')],
          shading: {
            fill: 'D3D3D3',
          },
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph('Функція')],
        }),
        new TableCell({
          children: [new Paragraph(calculation.funcStr)],
        }),
      ],
    }),
  ];
  
  // Add method-specific parameters
  if (method === 'bisection' || method === 'secant') {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph('Початок інтервалу (a)')],
          }),
          new TableCell({
            children: [new Paragraph(calculation.a.toString())],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph('Кінець інтервалу (b)')],
          }),
          new TableCell({
            children: [new Paragraph(calculation.b.toString())],
          }),
        ],
      })
    );
  } else if (method === 'newton') {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph('Похідна функції')],
          }),
          new TableCell({
            children: [new Paragraph(calculation.derivativeStr)],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph('Початкове наближення (x0)')],
          }),
          new TableCell({
            children: [new Paragraph(calculation.x0.toString())],
          }),
        ],
      })
    );
  }
  
  // Add tolerance
  rows.push(
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph('Точність')],
        }),
        new TableCell({
          children: [new Paragraph(calculation.tolerance.toString())],
        }),
      ],
    })
  );
  
  return [
    new Paragraph({
      text: 'Введені дані',
      heading: HeadingLevel.HEADING_2,
      spacing: {
        before: 200,
        after: 200,
      },
    }),
    new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      rows: rows,
    }),
  ];
};

/**
 * Create iterations section
 * @param {Object} calculation - Calculation data
 * @param {string} method - Method name
 * @returns {Array} - Array of document elements
 */
const createIterationsSection = (calculation, method) => {
  let headerCells = [];
  
  // Create header row based on method
  if (method === 'bisection') {
    headerCells = [
      'Ітерація',
      'Ліва межа',
      'Права межа',
      'Середина',
      'f(середина)',
    ].map(text => 
      new TableCell({
        children: [new Paragraph(text)],
        shading: {
          fill: 'D3D3D3',
        },
      })
    );
  } else if (method === 'secant') {
    headerCells = [
      'Ітерація',
      'x0',
      'x1',
      'x2',
      'f(x2)',
    ].map(text => 
      new TableCell({
        children: [new Paragraph(text)],
        shading: {
          fill: 'D3D3D3',
        },
      })
    );
  } else if (method === 'newton') {
    headerCells = [
      'Ітерація',
      'x0',
      'f(x0)',
      'f\'(x0)',
      'x1',
    ].map(text => 
      new TableCell({
        children: [new Paragraph(text)],
        shading: {
          fill: 'D3D3D3',
        },
      })
    );
  }
  
  // Create header row
  const rows = [
    new TableRow({
      children: headerCells,
    }),
  ];
  
  // Create data rows based on method
  if (calculation.results && Array.isArray(calculation.results)) {
    calculation.results.forEach((res, index) => {
      let rowCells = [];
      
      if (method === 'bisection') {
        rowCells = [
          new TableCell({ children: [new Paragraph((index + 1).toString())] }),
          new TableCell({ children: [new Paragraph(formatNumber(res.left))] }),
          new TableCell({ children: [new Paragraph(formatNumber(res.right))] }),
          new TableCell({ children: [new Paragraph(formatNumber(res.mid))] }),
          new TableCell({ children: [new Paragraph(formatNumber(res.fmid))] }),
        ];
      } else if (method === 'secant') {
        rowCells = [
          new TableCell({ children: [new Paragraph((index + 1).toString())] }),
          new TableCell({ children: [new Paragraph(formatNumber(res.x0))] }),
          new TableCell({ children: [new Paragraph(formatNumber(res.x1))] }),
          new TableCell({ children: [new Paragraph(formatNumber(res.x2))] }),
          new TableCell({ children: [new Paragraph(formatNumber(res.fx2))] }),
        ];
      } else if (method === 'newton') {
        rowCells = [
          new TableCell({ children: [new Paragraph((index + 1).toString())] }),
          new TableCell({ children: [new Paragraph(formatNumber(res.x0))] }),
          new TableCell({ children: [new Paragraph(formatNumber(res.fx))] }),
          new TableCell({ children: [new Paragraph(formatNumber(res.dfx))] }),
          new TableCell({ children: [new Paragraph(formatNumber(res.x1))] }),
        ];
      }
      
      rows.push(new TableRow({ children: rowCells }));
    });
  }
  
  return [
    new Paragraph({
      text: 'Результати ітерацій',
      heading: HeadingLevel.HEADING_2,
      spacing: {
        before: 400,
        after: 200,
      },
    }),
    new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      rows: rows,
    }),
  ];
};

/**
 * Create result section
 * @param {Object} calculation - Calculation data
 * @param {Object} successMetrics - Success metrics
 * @returns {Array} - Array of document elements
 */
const createResultSection = (calculation, successMetrics) => {
  const rows = [
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph('Параметр')],
          shading: {
            fill: 'D3D3D3',
          },
        }),
        new TableCell({
          children: [new Paragraph('Значення')],
          shading: {
            fill: 'D3D3D3',
          },
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph('Корінь')],
        }),
        new TableCell({
          children: [new Paragraph(formatNumber(calculation.root, 8))],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph('Кількість ітерацій')],
        }),
        new TableCell({
          children: [new Paragraph(calculation.results ? calculation.results.length.toString() : '0')],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph('Похибка')],
        }),
        new TableCell({
          children: [new Paragraph(calculation.finalError ? calculation.finalError.toExponential(4) : '0')],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph('Збіжність')],
        }),
        new TableCell({
          children: [new Paragraph(calculation.converged ? 'Так' : 'Ні')],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph('Відсоток успішності')],
        }),
        new TableCell({
          children: [new Paragraph(`${successMetrics.successPercentage}%`)],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph('Швидкість збіжності')],
        }),
        new TableCell({
          children: [new Paragraph(successMetrics.convergenceRate)],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph('Оцінка ефективності')],
        }),
        new TableCell({
          children: [new Paragraph(successMetrics.efficiencyRating)],
        }),
      ],
    }),
  ];
  
  return [
    new Paragraph({
      text: 'Результати обчислень',
      heading: HeadingLevel.HEADING_2,
      spacing: {
        before: 400,
        after: 200,
      },
    }),
    new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      rows: rows,
    }),
  ];
};

/**
 * Create graph section
 * @param {string} graphImageData - Base64 image data
 * @returns {Array} - Array of document elements
 */
const createGraphSection = (graphImageData) => {
  if (!graphImageData) {
    return [
      new Paragraph({
        text: 'Графік не доступний',
        heading: HeadingLevel.HEADING_2,
        spacing: {
          before: 400,
          after: 200,
        },
      }),
    ];
  }
  
  try {
    console.log('Adding graph to DOCX...');
    
    // Remove the data URL prefix
    const imageData = graphImageData.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // Convert base64 to binary array
    const binaryString = atob(imageData);
    const imageBuffer = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      imageBuffer[i] = binaryString.charCodeAt(i);
    }
    
    return [
      new Paragraph({
        text: 'Графічне представлення',
        heading: HeadingLevel.HEADING_2,
        spacing: {
          before: 400,
          after: 200,
        },
      }),
      new Paragraph({
        children: [
          new ImageRun({
            data: imageBuffer,
            transformation: {
              width: 500,
              height: 400,
            },
          }),
        ],
        alignment: AlignmentType.CENTER,
      }),
    ];
  } catch (error) {
    console.error('Error adding graph to DOCX:', error);
    return [
      new Paragraph({
        text: 'Помилка додавання графіка: ' + error.message,
        heading: HeadingLevel.HEADING_2,
        spacing: {
          before: 400,
          after: 200,
        },
      }),
    ];
  }
};

/**
 * Calculate success metrics
 * @param {Object} calculation - Calculation data
 * @returns {Object} - Success metrics
 */
const calculateSuccessMetrics = (calculation) => {
  // Success percentage based on convergence and error
  const converged = calculation.converged === true;
  const hasLowError = calculation.finalError && calculation.finalError < calculation.tolerance * 10;
  const iterations = calculation.results ? calculation.results.length : 0;
  const maxIterations = 100;
  
  // Calculate success percentage
  let successPercentage = 0;
  
  if (converged) {
    // Base percentage for convergence
    successPercentage = 70;
    
    // Add up to 20% for low error
    if (hasLowError) {
      const errorFactor = 1 - Math.min(1, calculation.finalError / (calculation.tolerance * 10));
      successPercentage += Math.round(errorFactor * 20);
    }
    
    // Add up to 10% for iteration efficiency
    if (iterations > 0) {
      const iterationFactor = 1 - Math.min(1, iterations / maxIterations);
      successPercentage += Math.round(iterationFactor * 10);
    }
  } else {
    // If not converged, calculate partial success based on progress made
    if (calculation.finalError !== undefined) {
      const progressFactor = 1 - Math.abs(calculation.finalError) / (Math.abs(calculation.finalError) + 1);
      successPercentage = Math.round(progressFactor * 50);
    }
  }
  
  // Ensure percentage is in valid range
  successPercentage = Math.max(0, Math.min(100, successPercentage));
  
  // Determine convergence rate description
  let convergenceRate;
  if (!converged) {
    convergenceRate = 'Не зійшлося';
  } else if (iterations <= 5) {
    convergenceRate = 'Дуже швидка';
  } else if (iterations <= 10) {
    convergenceRate = 'Швидка';
  } else if (iterations <= 20) {
    convergenceRate = 'Середня';
  } else if (iterations <= 50) {
    convergenceRate = 'Повільна';
  } else {
    convergenceRate = 'Дуже повільна';
  }
  
  // Determine efficiency rating
  let efficiencyRating;
  if (!converged) {
    efficiencyRating = 'Незадовільна';
  } else if (successPercentage >= 90) {
    efficiencyRating = 'Відмінна';
  } else if (successPercentage >= 80) {
    efficiencyRating = 'Дуже добра';
  } else if (successPercentage >= 70) {
    efficiencyRating = 'Добра';
  } else if (successPercentage >= 60) {
    efficiencyRating = 'Задовільна';
  } else {
    efficiencyRating = 'Низька';
  }
  
  return {
    successPercentage,
    convergenceRate,
    efficiencyRating,
  };
};

/**
 * Format number for display
 * @param {number} num - Number to format
 * @param {number} precision - Decimal precision
 * @returns {string} - Formatted number
 */
const formatNumber = (num, precision = 6) => {
  if (num === undefined || num === null) return '';
  
  if (Math.abs(num) < 0.0001 || Math.abs(num) >= 10000) {
    return num.toExponential(4);
  }
  
  return num.toFixed(precision);
};

/**
 * Download DOCX report
 * @param {Object} calculation - Calculation data
 * @param {string} method - Method name
 * @param {HTMLCanvasElement} canvas - Graph canvas
 */
export const downloadDocxReport = async (calculation, method, canvas) => {
  if (!calculation) {
    throw new Error('Немає даних для завантаження DOCX');
  }
  
  try {
    console.log('Attempting to download DOCX report...');
    
    // Generate DOCX document
    const blob = await generateDocxReport(calculation, method, canvas);
    if (!blob) {
      throw new Error('Не вдалося створити DOCX документ');
    }
    
    // Create and trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${method}_calculation.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('DOCX download successful');
  } catch (error) {
    console.error('Error generating DOCX report:', error);
    throw new Error('Помилка при створенні звіту DOCX: ' + error.message);
  }
};

/**
 * Check if DOCX is available
 * @returns {boolean} - True if DOCX is available
 */
export const isDocxAvailable = () => {
  try {
    // Check if Document class exists and can be instantiated
    const doc = new Document({
      sections: [{
        properties: {},
        children: [new Paragraph("Test")]
      }]
    });
    return true;
  } catch (error) {
    console.warn("DOCX not available:", error);
    return false;
  }
};

// Export public methods
export default {
  generateDocxReport,
  downloadDocxReport,
  isDocxAvailable
};