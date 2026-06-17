import * as math from 'mathjs';

/**
 * Draws coordinate axes on canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {Object} offset - Offset for axes {x, y}
 * @param {string} color - Axes color
 */
export const drawAxes = (ctx, width, height, offset, color = '#888') => {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, offset.y);
  ctx.lineTo(width, offset.y);
  ctx.moveTo(offset.x, 0);
  ctx.lineTo(offset.x, height);
  ctx.stroke();
};

/**
 * Draws a function graph on canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
 * @param {string} funcStr - Function string
 * @param {Object} viewSettings - View settings {width, height, scale, offset}
 * @param {string} color - Graph color
 */
export const drawFunctionGraph = (ctx, funcStr, viewSettings, color = '#007bff') => {
  const { width, height, scale, offset } = viewSettings;
  
  // Calculate range for drawing the function
  const minX = (0 - offset.x) / scale - 1;
  const maxX = (width - offset.x) / scale + 1;
  const step = 0.1 / scale;
  
  // Draw function graph
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  let firstPoint = true;
  for (let x = minX; x <= maxX; x += step) {
    try {
      const y = math.evaluate(funcStr, { x });
      const canvasX = x * scale + offset.x;
      const canvasY = -y * scale + offset.y;
      
      if (firstPoint) {
        ctx.moveTo(canvasX, canvasY);
        firstPoint = false;
      } else {
        ctx.lineTo(canvasX, canvasY);
      }
    } catch (error) {
      // Skip points where function evaluation fails
      firstPoint = true;
    }
  }
  
  ctx.stroke();
};

/**
 * Draws a point on the canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
 * @param {number} x - x coordinate
 * @param {number} y - y coordinate
 * @param {Object} viewSettings - View settings {scale, offset}
 * @param {number} radius - Point radius
 * @param {string} color - Point color
 */
export const drawPoint = (ctx, x, y, viewSettings, radius = 4, color = '#28a745') => {
  const { scale, offset } = viewSettings;
  
  const canvasX = x * scale + offset.x;
  const canvasY = -y * scale + offset.y;
  
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(canvasX, canvasY, radius, 0, 2 * Math.PI);
  ctx.fill();
};

/**
 * Draws a line between two points on the canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
 * @param {number} x1 - First point x coordinate
 * @param {number} y1 - First point y coordinate
 * @param {number} x2 - Second point x coordinate
 * @param {number} y2 - Second point y coordinate
 * @param {Object} viewSettings - View settings {scale, offset}
 * @param {string} color - Line color
 * @param {number} width - Line width
 * @param {boolean} dashed - Whether line should be dashed
 */
export const drawLine = (ctx, x1, y1, x2, y2, viewSettings, color = '#ffa500', width = 1, dashed = false) => {
  const { scale, offset } = viewSettings;
  
  const canvasX1 = x1 * scale + offset.x;
  const canvasY1 = -y1 * scale + offset.y;
  const canvasX2 = x2 * scale + offset.x;
  const canvasY2 = -y2 * scale + offset.y;
  
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  
  if (dashed) {
    ctx.setLineDash([2, 2]);
  } else {
    ctx.setLineDash([]);
  }
  
  ctx.beginPath();
  ctx.moveTo(canvasX1, canvasY1);
  ctx.lineTo(canvasX2, canvasY2);
  ctx.stroke();
  
  // Reset line dash
  ctx.setLineDash([]);
};

/**
 * Draws a tangent line to a function at a specific point
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
 * @param {number} x - x coordinate at which to draw tangent
 * @param {number} fx - Function value at x
 * @param {number} dfx - Derivative value at x
 * @param {Object} viewSettings - View settings {scale, offset}
 * @param {string} color - Line color
 */
export const drawTangent = (ctx, x, fx, dfx, viewSettings, color = '#ffa500') => {
  const { scale, offset } = viewSettings;
  
  // Calculate two points on the tangent line
  const tangentX1 = x - 1;
  const tangentY1 = fx - dfx * 1;
  const tangentX2 = x + 1;
  const tangentY2 = fx + dfx * 1;
  
  drawLine(ctx, tangentX1, tangentY1, tangentX2, tangentY2, viewSettings, color);
};

/**
 * Draws visualization for bisection method
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
 * @param {Array} results - Bisection method results
 * @param {string} funcStr - Function string
 * @param {Object} viewSettings - View settings {scale, offset}
 */
export const drawBisectionVisualization = (ctx, results, funcStr, viewSettings) => {
  results.forEach((res, index) => {
    const isLastIteration = index === results.length - 1;
    const pointColor = isLastIteration ? '#ff0000' : '#28a745';
    
    // Draw boundary points
    const fleft = math.evaluate(funcStr, { x: res.left });
    const fright = math.evaluate(funcStr, { x: res.right });
    
    drawPoint(ctx, res.left, fleft, viewSettings, 3, pointColor);
    drawPoint(ctx, res.right, fright, viewSettings, 3, pointColor);
    
    // Draw midpoint
    drawPoint(ctx, res.mid, res.fmid, viewSettings, 4, pointColor);
    
    // Draw interval on x-axis
    drawLine(
      ctx, 
      res.left, 
      0, 
      res.right, 
      0, 
      viewSettings, 
      '#ffa500'
    );
    
    // For the final iteration, draw vertical line to x-axis
    if (isLastIteration) {
      drawLine(
        ctx,
        res.mid,
        res.fmid,
        res.mid,
        0,
        viewSettings,
        '#ff0000',
        1,
        true
      );
    }
  });
};

/**
 * Draws visualization for secant method
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
 * @param {Array} results - Secant method results
 * @param {Object} viewSettings - View settings {scale, offset}
 */
export const drawSecantVisualization = (ctx, results, viewSettings) => {
  results.forEach((res, index) => {
    const isLastIteration = index === results.length - 1;
    const pointColor = isLastIteration ? '#ff0000' : '#28a745';
    
    // Draw initial points
    drawPoint(ctx, res.x0, res.fx0, viewSettings, 4, '#00aaff');
    drawPoint(ctx, res.x1, res.fx1, viewSettings, 4, '#00aaff');
    
    // Draw result point
    drawPoint(ctx, res.x2, res.fx2, viewSettings, 5, pointColor);
    
    // Draw secant line
    drawLine(
      ctx,
      res.x0,
      res.fx0,
      res.x1,
      res.fx1,
      viewSettings,
      '#ffa500'
    );
    
    // For the final iteration, draw vertical line to x-axis
    if (isLastIteration) {
      drawLine(
        ctx,
        res.x2,
        res.fx2,
        res.x2,
        0,
        viewSettings,
        '#ff0000',
        1,
        true
      );
    }
  });
};

/**
 * Draws visualization for Newton's method
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
 * @param {Array} results - Newton's method results
 * @param {string} funcStr - Function string
 * @param {Object} viewSettings - View settings {scale, offset}
 */
export const drawNewtonVisualization = (ctx, results, funcStr, viewSettings) => {
  results.forEach((res, index) => {
    const isLastIteration = index === results.length - 1;
    const pointColor = isLastIteration ? '#ff0000' : '#28a745';
    
    // Draw the current point
    drawPoint(ctx, res.x0, res.fx, viewSettings, 4, pointColor);
    
    // Draw the tangent line
    drawTangent(ctx, res.x0, res.fx, res.dfx, viewSettings, '#ffa500');
    
    // Draw the new point
    const fx1 = math.evaluate(funcStr, { x: res.x1 });
    drawPoint(ctx, res.x1, fx1, viewSettings, 4, pointColor);
    
    // For the final iteration, draw vertical line to x-axis
    if (isLastIteration) {
      drawLine(
        ctx,
        res.x1,
        fx1,
        res.x1,
        0,
        viewSettings,
        '#ff0000',
        1,
        true
      );
    }
  });
};

export default {
  drawAxes,
  drawFunctionGraph,
  drawPoint,
  drawLine,
  drawTangent,
  drawBisectionVisualization,
  drawSecantVisualization,
  drawNewtonVisualization
};