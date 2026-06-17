import React, { useEffect, useRef, useState } from 'react';

const NightSkyBackground = () => {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: window.devicePixelRatio || 1
  });
  
  // Resize handler with debouncing
  useEffect(() => {
    let timeoutId = null;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
          pixelRatio: window.devicePixelRatio || 1
        });
      }, 200); // Debounce resize events
    };
    
    // Listen for window resize and orientation change
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    // Initial sizing
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);
  
  // Main animation and canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    // Set canvas dimensions with pixel ratio consideration
    const setupCanvas = () => {
      const { width, height, pixelRatio } = dimensions;
      
      // Set physical canvas size (taking pixel ratio into account)
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      
      // Set display size (CSS)
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      // Scale all drawing operations by the pixel ratio
      ctx.scale(pixelRatio, pixelRatio);
      
      console.log(`Canvas resized to ${width}×${height} (pixel ratio: ${pixelRatio})`);
    };
    
    setupCanvas();
    
    // Star class
    class Star {
      constructor() {
        this.reset();
        // Start stars at random positions
        this.x = Math.random() * dimensions.width;
        this.y = Math.random() * dimensions.height;
      }
      
      reset() {
        this.x = Math.random() * dimensions.width;
        this.y = Math.random() * dimensions.height;
        this.size = Math.random() * 1.8 + 0.4;
        this.maxSize = this.size + (Math.random() * 1.2);
        this.minSize = Math.max(0.2, this.size - (Math.random() * 0.8));
        this.twinkleSpeed = Math.random() * 0.04 + 0.01;
        this.twinkleProgress = Math.random() * Math.PI * 2;
        this.color = this.getStarColor();
      }
      
      getStarColor() {
        const colors = [
          'rgba(255, 255, 255, 0.9)',  // White
          'rgba(255, 255, 220, 0.85)',  // Warm white
          'rgba(220, 220, 255, 0.85)',  // Cool white
          'rgba(255, 230, 180, 0.75)',  // Pale yellow
          'rgba(200, 220, 255, 0.75)',  // Pale blue
          'rgba(255, 200, 200, 0.65)',  // Very pale red
          'rgba(200, 255, 220, 0.65)'   // Very pale green
        ];
        return colors[Math.floor(Math.random() * colors.length)];
      }
      
      update() {
        // Twinkle effect - size oscillation based on sine wave
        this.twinkleProgress += this.twinkleSpeed;
        const sineValue = Math.sin(this.twinkleProgress);
        const normalizedSine = (sineValue + 1) / 2; // Normalize to 0-1
        this.size = this.minSize + normalizedSine * (this.maxSize - this.minSize);
        
        // Return value indicates if star is within bounds
        return this.x >= 0 && 
               this.x <= dimensions.width && 
               this.y >= 0 && 
               this.y <= dimensions.height;
      }
      
      draw() {
        const glow = ctx.createRadialGradient(
          this.x, this.y, 0, 
          this.x, this.y, this.size * 3
        );
        
        // Create glow effect
        glow.addColorStop(0, this.color);
        glow.addColorStop(1, 'rgba(0, 0, 20, 0)');
        
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw star core
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Improved constellation class
    class Constellation {
      constructor(starCount = Math.floor(Math.random() * 4) + 3) {
        this.stars = [];
        this.connections = [];
        this.reset();
        
        // Generate constellation shape with more complex patterns
        this.generateShape(starCount);
      }
      
      reset() {
        this.x = Math.random() * dimensions.width;
        this.y = Math.random() * dimensions.height;
        
        // Movement speeds proportional to screen size
        const speedFactor = Math.min(dimensions.width, dimensions.height) / 1000;
        this.speedX = (Math.random() * 0.5 + 0.1) * (Math.random() > 0.5 ? 1 : -1) * speedFactor;
        this.speedY = (Math.random() * 0.5 + 0.1) * (Math.random() > 0.5 ? 1 : -1) * speedFactor;
        
        // Size proportional to screen size (60% larger as requested)
        const sizeFactor = Math.min(dimensions.width, dimensions.height) / 800;
        this.scale = (Math.random() * 0.3 + 0.2) * 1.6 * sizeFactor;
        
        // Rotation properties
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() * 0.002 + 0.0005) * (Math.random() > 0.5 ? 1 : -1);
      }
      
      generateShape(starCount) {
        // Clear previous arrays
        this.stars = [];
        this.connections = [];
        
        // More varied and interesting shapes
        const patterns = [
          'circular',    // Stars arranged in a rough circle
          'linear',      // Stars in a line with variations
          'triangular',  // Triangle-based pattern
          'random'       // Completely random pattern
        ];
        
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        const baseSize = 60 * this.scale; // Adjusted base size
        
        // First star is central
        this.stars.push({
          x: 0,
          y: 0,
          size: Math.random() * 1.5 + 1.5
        });
        
        // Generate stars based on the selected pattern
        for (let i = 1; i < starCount; i++) {
          let angle, distance;
          
          switch(pattern) {
            case 'circular':
              angle = (i / starCount) * Math.PI * 2 + (Math.random() * 0.5 - 0.25);
              distance = baseSize * (0.8 + Math.random() * 0.4);
              break;
            case 'linear':
              angle = (Math.random() * 0.5 - 0.25) + (i % 2 ? 0 : Math.PI);
              distance = baseSize * (0.3 + (i / starCount) * 0.7 + Math.random() * 0.2);
              break;
            case 'triangular':
              angle = (i % 3) * ((2 * Math.PI) / 3) + (Math.random() * 0.4 - 0.2);
              distance = baseSize * (0.7 + Math.random() * 0.6);
              break;
            case 'random':
            default:
              angle = Math.random() * Math.PI * 2;
              distance = Math.random() * baseSize + baseSize * 0.3;
          }
          
          this.stars.push({
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance,
            size: Math.random() * 1.2 + 0.8
          });
          
          // Create connections between stars
          if (i > 1) {
            // Find closest previous star
            let minDist = Infinity;
            let closestIdx = 0;
            
            for (let j = 0; j < i; j++) {
              const dist = Math.hypot(
                this.stars[i].x - this.stars[j].x,
                this.stars[i].y - this.stars[j].y
              );
              
              if (dist < minDist) {
                minDist = dist;
                closestIdx = j;
              }
            }
            
            // Only connect if the distance isn't too large
            if (minDist < baseSize * 1.5) {
              this.connections.push({
                from: i,
                to: closestIdx
              });
            }
          } else {
            // First star connects to central star
            this.connections.push({
              from: i,
              to: 0
            });
          }
          
          // Occasionally add an extra connection for more complex patterns
          if (i > 2 && Math.random() > 0.7) {
            const connectTo = Math.floor(Math.random() * i);
            if (connectTo !== i) {
              this.connections.push({
                from: i,
                to: connectTo
              });
            }
          }
        }
      }
      
      update() {
        // Move in both X and Y directions
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
        
        // Bounce off edges
        const padding = 50 * this.scale;
        
        if (this.x - padding < 0) {
          this.x = padding;
          this.speedX = Math.abs(this.speedX);
        } else if (this.x + padding > dimensions.width) {
          this.x = dimensions.width - padding;
          this.speedX = -Math.abs(this.speedX);
        }
        
        if (this.y - padding < 0) {
          this.y = padding;
          this.speedY = Math.abs(this.speedY);
        } else if (this.y + padding > dimensions.height) {
          this.y = dimensions.height - padding;
          this.speedY = -Math.abs(this.speedY);
        }
        
        // Positioning for drawing
        this.drawX = this.x;
        this.drawY = this.y;
        
        // Return if constellation is within view bounds with padding
        return this.x >= -padding && 
               this.x <= dimensions.width + padding && 
               this.y >= -padding && 
               this.y <= dimensions.height + padding;
      }
      
      draw() {
        ctx.save();
        
        // Translate to constellation center and apply rotation
        ctx.translate(this.drawX, this.drawY);
        ctx.rotate(this.rotation);
        
        // Draw connections first (so they're behind stars)
        ctx.strokeStyle = 'rgba(180, 180, 255, 0.2)'; // More transparent connections
        ctx.lineWidth = 0.8;
        
        for (const connection of this.connections) {
          const fromStar = this.stars[connection.from];
          const toStar = this.stars[connection.to];
          
          ctx.beginPath();
          ctx.moveTo(fromStar.x, fromStar.y);
          ctx.lineTo(toStar.x, toStar.y);
          ctx.stroke();
        }
        
        // Draw stars
        for (const star of this.stars) {
          // Create star glow
          const glow = ctx.createRadialGradient(
            star.x, star.y, 0, 
            star.x, star.y, star.size * 3
          );
          
          glow.addColorStop(0, 'rgba(220, 220, 255, 0.7)');
          glow.addColorStop(1, 'rgba(0, 0, 20, 0)');
          
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
          ctx.fill();
          
          // Draw star core
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();
      }
    }
    
    // Calculate optimal star and constellation count based on screen size
    const calculateOptimalCounts = () => {
      const area = dimensions.width * dimensions.height;
      const starDensity = 0.00015; // Stars per pixel
      const constellationDensity = 0.00001; // Constellations per pixel
      
      // Calculate counts with minimum and maximum limits
      const starCount = Math.max(100, Math.min(500, Math.floor(area * starDensity)));
      const constellationCount = Math.max(27, Math.min(35, Math.floor(area * constellationDensity)));
      
      return { starCount, constellationCount };
    };
    
    // Create stars and constellations
    const { starCount, constellationCount } = calculateOptimalCounts();
    console.log(`Creating ${starCount} stars and ${constellationCount} constellations`);
    
    const stars = Array.from({ length: starCount }, () => new Star());
    const constellations = Array.from({ length: constellationCount }, () => new Constellation());
    
    // Arrays for special effects
    const shootingStars = [];
    const supernovas = [];
    const waveRings = [];
    
    // Create shooting star effect
    const createShootingStar = (x, y, initialAngle = null) => {
      const angle = initialAngle || Math.random() * Math.PI * 2;
      const length = Math.random() * 120 + 80;
      const speed = Math.random() * 6 + 8;
      
      const shootingStar = {
        x,
        y,
        angle,
        length,
        speed,
        progress: 0,
        opacity: 1,
        width: Math.random() * 2 + 1,
        color: Math.random() > 0.8 ?
          `rgba(${155 + Math.random() * 100}, ${200 + Math.random() * 55}, 255, ` :
          'rgba(255, 255, 255, ',
        update: function() {
          this.progress += this.speed / 80;
          this.opacity = Math.max(0, 1 - this.progress);
          return this.opacity > 0;
        },
        draw: function() {
          if (this.opacity <= 0) return;
          
          const headX = this.x + Math.cos(this.angle) * this.length * this.progress;
          const headY = this.y + Math.sin(this.angle) * this.length * this.progress;
          const tailX = headX - Math.cos(this.angle) * (this.length / 3 * this.opacity);
          const tailY = headY - Math.sin(this.angle) * (this.length / 3 * this.opacity);
          
          const gradient = ctx.createLinearGradient(
            headX, headY,
            tailX, tailY
          );
          
          gradient.addColorStop(0, `${this.color}${this.opacity})`);
          gradient.addColorStop(1, `${this.color}0)`);
          
          ctx.strokeStyle = gradient;
          ctx.lineWidth = this.width;
          ctx.beginPath();
          ctx.moveTo(headX, headY);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();
          
          // Star/head of the shooting star
          ctx.fillStyle = `${this.color}${this.opacity})`;
          ctx.beginPath();
          ctx.arc(headX, headY, this.width * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      };
      
      shootingStars.push(shootingStar);
    };
    
    // Create supernova effect
    const createSupernova = (event) => {
      // Get position relative to canvas
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      const supernova = {
        x,
        y,
        radius: 0,
        maxRadius: Math.max(dimensions.width, dimensions.height),
        color: 'rgba(255, 255, 200, 0.8)',
        progress: 0,
        
        update: function() {
          this.progress += 0.01;
          this.radius = this.maxRadius * 0.5 * this.progress;
          
          // Create wave effect
          if (this.progress > 0.1 && this.progress < 0.7 && Math.random() > 0.8) {
            createWaveRing(this.x, this.y, this.radius * 0.8);
          }
          
          return this.progress < 1;
        },
        
        draw: function() {
          const alpha = Math.max(0, 1 - this.progress);
          
          // Draw glow
          const glow = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius
          );
          
          glow.addColorStop(0, `rgba(255, 255, 200, ${alpha * 0.8})`);
          glow.addColorStop(0.2, `rgba(255, 200, 100, ${alpha * 0.6})`);
          glow.addColorStop(0.5, `rgba(255, 100, 50, ${alpha * 0.4})`);
          glow.addColorStop(1, 'rgba(100, 50, 0, 0)');
          
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      };
      
      supernovas.push(supernova);
    };
    
    // Create wave ring effect
    const createWaveRing = (x, y, radius) => {
      const ring = {
        x,
        y,
        radius,
        thickness: Math.random() * 2 + 1,
        color: `rgba(${150 + Math.random() * 105}, ${150 + Math.random() * 105}, ${200 + Math.random() * 55}, 0.3)`,
        progress: 0,
        
        update: function() {
          this.progress += 0.02;
          return this.progress < 1;
        },
        
        draw: function() {
          const alpha = Math.max(0, 0.4 - this.progress * 0.4);
          
          ctx.strokeStyle = this.color.replace('0.3', alpha);
          ctx.lineWidth = this.thickness;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius + (this.progress * 200), 0, Math.PI * 2);
          ctx.stroke();
        }
      };
      
      waveRings.push(ring);
    };
    
    // Periodically create random shooting stars
    const createRandomShootingStar = () => {
      const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
      let x, y, angle;
      
      switch (edge) {
        case 0: // Top
          x = Math.random() * dimensions.width;
          y = 0;
          angle = Math.PI / 2 + (Math.random() * Math.PI / 4 - Math.PI / 8);
          break;
        case 1: // Right
          x = dimensions.width;
          y = Math.random() * dimensions.height;
          angle = Math.PI + (Math.random() * Math.PI / 4 - Math.PI / 8);
          break;
        case 2: // Bottom
          x = Math.random() * dimensions.width;
          y = dimensions.height;
          angle = -Math.PI / 2 + (Math.random() * Math.PI / 4 - Math.PI / 8);
          break;
        case 3: // Left
          x = 0;
          y = Math.random() * dimensions.height;
          angle = 0 + (Math.random() * Math.PI / 4 - Math.PI / 8);
          break;
          
        default: // Adding default case to satisfy ESLint
          x = Math.random() * dimensions.width;
          y = 0;
          angle = Math.PI / 2 + (Math.random() * Math.PI / 4 - Math.PI / 8);
          break;
      }
      
      createShootingStar(x, y, angle);
    };
    
    // Animation loop
    const animate = () => {
      // Create a dark night sky background with gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, dimensions.height);
      gradient.addColorStop(0, 'rgba(5, 5, 25, 1)');      // Darker blue at top
      gradient.addColorStop(0.5, 'rgba(12, 8, 35, 1)');  // Deeper midnight blue in middle
      gradient.addColorStop(1, 'rgba(15, 0, 30, 1)');     // Deeper purple at bottom
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);
      
      // Update and draw stars with visibility check
      for (let i = stars.length - 1; i >= 0; i--) {
        const isVisible = stars[i].update();
        if (isVisible) {
          stars[i].draw();
        } else {
          // Replace stars that moved off-screen
          stars[i].reset();
        }
      }
      
      // Update and draw constellations with visibility check
      for (let i = constellations.length - 1; i >= 0; i--) {
        const isVisible = constellations[i].update();
        if (isVisible) {
          constellations[i].draw();
        } else {
          // Replace constellations that moved off-screen
          constellations[i].reset();
        }
      }
      
      // Update and draw shooting stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const active = shootingStars[i].update();
        if (active) {
          shootingStars[i].draw();
        } else {
          shootingStars.splice(i, 1);
        }
      }
      
      // Update and draw supernovas
      for (let i = supernovas.length - 1; i >= 0; i--) {
        const active = supernovas[i].update();
        if (active) {
          supernovas[i].draw();
        } else {
          supernovas.splice(i, 1);
        }
      }
      
      // Update and draw wave rings
      for (let i = waveRings.length - 1; i >= 0; i--) {
        const active = waveRings[i].update();
        if (active) {
          waveRings[i].draw();
        } else {
          waveRings.splice(i, 1);
        }
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    // Mouse interaction - create shooting star effect
    canvas.addEventListener('mousemove', (event) => {
      if (Math.random() > 0.97) {
        const rect = canvas.getBoundingClientRect();
        createShootingStar(
          event.clientX - rect.left,
          event.clientY - rect.top
        );
      }
    });
    
    canvas.addEventListener('click', (event) => {
      const rect = canvas.getBoundingClientRect();
      createShootingStar(
        event.clientX - rect.left,
        event.clientY - rect.top
      );
    });
    
    // Add event listener to app title for supernova effect
    setTimeout(() => {
      const titleElement = document.querySelector('.home-page .home-header h1, h1.app-title');
      if (titleElement) {
        console.log('Adding click event to title for supernova effect');
        titleElement.addEventListener('click', createSupernova);
        titleElement.style.cursor = 'pointer';
        titleElement.title = 'Натисніть для ефекту вибуху наднової';
      } else {
        console.warn('App title element not found for supernova effect');
      }
    }, 1000);
    
    // Periodically create random shooting stars
    const shootingStarInterval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance each interval
        createRandomShootingStar();
      }
    }, 2000);
    
    // Start the animation
    animate();
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(shootingStarInterval);
      
      // Remove title click event
      const titleElement = document.querySelector('.home-page .home-header h1, h1.app-title');
      if (titleElement) {
        titleElement.removeEventListener('click', createSupernova);
      }
    };
  }, [dimensions]); // Re-run when dimensions change
  
  return (
    <canvas
      ref={canvasRef}
      className="night-sky-background"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',  // Use viewport units to ensure full coverage
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'auto', // Allow mouse interaction
        display: 'block'       // Remove any default spacing
      }}
    />
  );
};

export default NightSkyBackground;