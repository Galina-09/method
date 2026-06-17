import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import * as math from 'mathjs';
import { motion } from 'framer-motion';

const Graph = forwardRef(({ 
  funcStr, 
  results, 
  method, 
  width = 400, 
  height = 400,
  scaleInit = 50
}, ref) => {
  const canvasRef = useRef(null);
  const [scale, setScale] = useState(scaleInit);
  const [offset, setOffset] = useState({ x: width / 2, y: height / 2 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Expose canvasRef to parent via ref
  useImperativeHandle(ref, () => ({
    canvasRef
  }));

  // Function to draw the graph
  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !funcStr) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    // Draw coordinate axes
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, offset.y);
    ctx.lineTo(width, offset.y);
    ctx.moveTo(offset.x, 0);
    ctx.lineTo(offset.x, height);
    ctx.stroke();

    // Calculate range for drawing the function
    const minX = (0 - offset.x) / scale - 1;
    const maxX = (width - offset.x) / scale + 1;
    const step = 0.1 / scale;

    // Draw function graph
    ctx.strokeStyle = '#007bff';
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

    // Define method-specific drawing functions inside useCallback
    const drawBisectionResults = (ctx, results, funcStr) => {
      results.forEach((res, index) => {
        const isLastIteration = index === results.length - 1;
        const pointColor = isLastIteration ? '#ff0000' : '#28a745';

        // Draw the left and right boundary points
        const canvasLeftX = res.left * scale + offset.x;
        const canvasLeftY = -math.evaluate(funcStr, { x: res.left }) * scale + offset.y;
        const canvasRightX = res.right * scale + offset.x;
        const canvasRightY = -math.evaluate(funcStr, { x: res.right }) * scale + offset.y;
        
        // Draw midpoint
        const canvasMidX = res.mid * scale + offset.x;
        const canvasMidY = -res.fmid * scale + offset.y;

        // Draw boundary points
        ctx.fillStyle = pointColor;
        ctx.beginPath();
        ctx.arc(canvasLeftX, canvasLeftY, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(canvasRightX, canvasRightY, 3, 0, 2 * Math.PI);
        ctx.fill();

        // Draw midpoint - larger for emphasis
        ctx.fillStyle = pointColor;
        ctx.beginPath();
        ctx.arc(canvasMidX, canvasMidY, 4, 0, 2 * Math.PI);
        ctx.fill();

        // Draw the interval on the x-axis
        ctx.strokeStyle = '#ffa500';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(canvasLeftX, offset.y);
        ctx.lineTo(canvasRightX, offset.y);
        ctx.stroke();
        
        // For the final iteration, add a vertical line from midpoint to x-axis
        if (isLastIteration) {
          ctx.strokeStyle = '#ff0000';
          ctx.setLineDash([2, 2]);
          ctx.beginPath();
          ctx.moveTo(canvasMidX, canvasMidY);
          ctx.lineTo(canvasMidX, offset.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });
    };

    // Draw secant method visualization
    const drawSecantResults = (ctx, results, funcStr) => {
      results.forEach((res, index) => {
        const isLastIteration = index === results.length - 1;
        const pointColor = isLastIteration ? '#ff0000' : '#28a745';

        // Get canvas coordinates for the points
        const canvasX0 = res.x0 * scale + offset.x;
        const canvasFX0 = -res.fx0 * scale + offset.y;
        const canvasX1 = res.x1 * scale + offset.x;
        const canvasFX1 = -res.fx1 * scale + offset.y;
        const canvasX2 = res.x2 * scale + offset.x;
        const canvasFX2 = -res.fx2 * scale + offset.y;

        // Draw the points
        ctx.fillStyle = '#00aaff';
        ctx.beginPath();
        ctx.arc(canvasX0, canvasFX0, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(canvasX1, canvasFX1, 4, 0, 2 * Math.PI);
        ctx.fill();

        // Draw the result point (next approximation)
        ctx.fillStyle = pointColor;
        ctx.beginPath();
        ctx.arc(canvasX2, canvasFX2, 5, 0, 2 * Math.PI);
        ctx.fill();

        // Draw the secant line
        ctx.strokeStyle = '#ffa500';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(canvasX0, canvasFX0);
        ctx.lineTo(canvasX1, canvasFX1);
        ctx.stroke();
        
        // For the final iteration, show intersection with x-axis
        if (isLastIteration) {
          ctx.strokeStyle = '#ff0000';
          ctx.setLineDash([2, 2]);
          ctx.beginPath();
          ctx.moveTo(canvasX2, canvasFX2);
          ctx.lineTo(canvasX2, offset.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });
    };

    // Draw Newton method visualization
    const drawNewtonResults = (ctx, results, funcStr) => {
      results.forEach((res, index) => {
        const isLastIteration = index === results.length - 1;
        const pointColor = isLastIteration ? '#ff0000' : '#28a745';

        // Get canvas coordinates
        const canvasX0 = res.x0 * scale + offset.x;
        const canvasFX0 = -math.evaluate(funcStr, { x: res.x0 }) * scale + offset.y;
        const canvasX1 = res.x1 * scale + offset.x;
        const canvasFX1 = -math.evaluate(funcStr, { x: res.x1 }) * scale + offset.y;

        // Draw the point
        ctx.fillStyle = pointColor;
        ctx.beginPath();
        ctx.arc(canvasX0, canvasFX0, 4, 0, 2 * Math.PI);
        ctx.fill();

        // Draw the tangent line
        const x0 = res.x0;
        const fx0 = res.fx;
        const dfx0 = res.dfx;
        
        // Calculate 2 points on the tangent line
        const tangentX1 = x0 - 1;
        const tangentY1 = fx0 - dfx0 * 1;
        const tangentX2 = x0 + 1;
        const tangentY2 = fx0 + dfx0 * 1;
        
        const canvasTangentX1 = tangentX1 * scale + offset.x;
        const canvasTangentY1 = -tangentY1 * scale + offset.y;
        const canvasTangentX2 = tangentX2 * scale + offset.x;
        const canvasTangentY2 = -tangentY2 * scale + offset.y;
        
        ctx.strokeStyle = '#ffa500';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(canvasTangentX1, canvasTangentY1);
        ctx.lineTo(canvasTangentX2, canvasTangentY2);
        ctx.stroke();
        
        // Draw the new approximate point
        ctx.fillStyle = pointColor;
        ctx.beginPath();
        ctx.arc(canvasX1, canvasFX1, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // For the final iteration, show vertical line to x-axis
        if (isLastIteration) {
          ctx.strokeStyle = '#ff0000';
          ctx.setLineDash([2, 2]);
          ctx.beginPath();
          ctx.moveTo(canvasX1, canvasFX1);
          ctx.lineTo(canvasX1, offset.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });
    };

    // Draw method-specific visualization
    if (results && results.length > 0) {
      if (method === 'bisection') {
        drawBisectionResults(ctx, results, funcStr);
      } else if (method === 'secant') {
        drawSecantResults(ctx, results, funcStr);
      } else if (method === 'newton') {
        drawNewtonResults(ctx, results, funcStr);
      }
    }
  }, [funcStr, results, method, scale, offset, width, height]);

  // Event handlers for interactive graph
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ 
      x: e.clientX - offset.x, 
      y: e.clientY - offset.y 
    });
    e.currentTarget.style.cursor = 'grabbing';
  };

  const handleMouseUp = (e) => {
    setIsDragging(false);
    e.currentTarget.style.cursor = 'grab';
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prevScale => prevScale * scaleFactor);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Reset view to default
  const resetView = () => {
    setScale(scaleInit);
    setOffset({ x: width / 2, y: height / 2 });
  };

  // Update graph when relevant props change
  useEffect(() => {
    drawGraph();
  }, [drawGraph]); // Now properly depends on the memoized drawGraph function

  return (
    <div className="graph-container">
      <motion.canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
        onMouseLeave={handleMouseLeave}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ cursor: 'grab' }}
        className="graph-canvas"
      />
      
      <div className="graph-controls">
        <motion.button 
          onClick={resetView}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="reset-view-button"
        >
          Скинути масштаб
        </motion.button>
        <div className="zoom-indicator">
          Масштаб: {Math.round(scale / scaleInit * 100)}%
        </div>
      </div>
    </div>
  );
});

// Add display name for better debugging
Graph.displayName = 'Graph';

export default Graph;