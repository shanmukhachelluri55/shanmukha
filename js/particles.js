class Particles {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    // Default options
    this.options = {
      particleCount: 100,
      particleColor: '#3b82f6',
      lineColor: 'rgba(59, 130, 246, 0.15)',
      particleRadius: 2,
      lineWidth: 1,
      lineDistance: 150,
      speed: 1,
      directionX: -1,
      directionY: 1,
      mouseEffect: true,
      mouseRadius: 150,
      mousePush: true,
      mouseAttract: false,
      mouseForce: 2,
      particleLife: 3,
      particleLifeVariance: 1,
      particleFade: true,
      responsive: [
        {
          breakpoint: 768,
          options: {
            particleCount: 50,
            lineDistance: 100
          }
        },
        {
          breakpoint: 480,
          options: {
            particleCount: 30,
            lineDistance: 80
          }
        }
      ],
      ...options
    };
    
    this.width = 0;
    this.height = 0;
    this.particles = [];
    this.animationFrame = null;
    this.isDarkMode = document.documentElement.classList.contains('dark');
    this.mouse = { 
      x: null, 
      y: null, 
      radius: this.options.mouseRadius,
      lastX: null,
      lastY: null,
      velocityX: 0,
      velocityY: 0
    };
    
    this.init();
    this.bindEvents();
  }
  
  init() {
    this.resizeCanvas();
    this.createParticles();
    this.animate();
    
    if (this.isDarkMode) {
      this.updateColorsForDarkMode();
    }
  }
  
  bindEvents() {
    window.addEventListener('resize', this.resizeCanvas.bind(this));
    
    if (this.options.mouseEffect) {
      this.canvas.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        
        // Store last position for velocity calculation
        this.mouse.lastX = this.mouse.x || e.clientX - rect.left;
        this.mouse.lastY = this.mouse.y || e.clientY - rect.top;
        
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
        
        // Calculate mouse velocity
        this.mouse.velocityX = this.mouse.x - this.mouse.lastX;
        this.mouse.velocityY = this.mouse.y - this.mouse.lastY;
      });
      
      this.canvas.addEventListener('mouseleave', () => {
        this.mouse.x = null;
        this.mouse.y = null;
        this.mouse.velocityX = 0;
        this.mouse.velocityY = 0;
      });
    }
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDarkMode = document.documentElement.classList.contains('dark');
          if (isDarkMode !== this.isDarkMode) {
            this.isDarkMode = isDarkMode;
            if (isDarkMode) {
              this.updateColorsForDarkMode();
            } else {
              this.updateColorsForLightMode();
            }
          }
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
  }
  
  updateColorsForDarkMode() {
    this.options.particleColor = '#60a5fa';
    this.options.lineColor = 'rgba(96, 165, 250, 0.15)';
  }
  
  updateColorsForLightMode() {
    this.options.particleColor = '#3b82f6';
    this.options.lineColor = 'rgba(59, 130, 246, 0.15)';
  }
  
  resizeCanvas() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    if (this.options.responsive) {
      for (const item of this.options.responsive) {
        if (window.innerWidth <= item.breakpoint) {
          this.options = { ...this.options, ...item.options };
          break;
        }
      }
    }
    
    if (this.particles.length) {
      this.particles = [];
      this.createParticles();
    }
  }
  
  createParticle() {
    return {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      vx: (Math.random() - 0.5) * this.options.speed,
      vy: (Math.random() - 0.5) * this.options.speed,
      radius: Math.random() * this.options.particleRadius + 1,
      color: this.options.particleColor,
      originalRadius: Math.random() * this.options.particleRadius + 1,
      life: this.options.particleLife + (Math.random() - 0.5) * this.options.particleLifeVariance,
      opacity: 1
    };
  }
  
  createParticles() {
    for (let i = 0; i < this.options.particleCount; i++) {
      this.particles.push(this.createParticle());
    }
  }
  
  drawParticles() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      
      if (this.options.mouseEffect && this.mouse.x !== null && this.mouse.y !== null) {
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.mouse.radius) {
          const angle = Math.atan2(dy, dx);
          const force = (this.mouse.radius - distance) / this.mouse.radius;
          
          if (this.options.mousePush) {
            // Push particles away from mouse
            p.vx -= Math.cos(angle) * force * this.options.mouseForce;
            p.vy -= Math.sin(angle) * force * this.options.mouseForce;
          }
          
          if (this.options.mouseAttract) {
            // Add mouse velocity influence
            p.vx += this.mouse.velocityX * force * 0.1;
            p.vy += this.mouse.velocityY * force * 0.1;
          }
          
          // Scale particle size based on mouse proximity
          p.radius = p.originalRadius * (1 + force);
        } else {
          p.radius = p.originalRadius;
        }
      }
      
      // Draw particle with opacity
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color.replace(')', `, ${p.opacity})`);
      this.ctx.fill();
      
      // Draw connections
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.options.lineDistance) {
          const opacity = (1 - distance / this.options.lineDistance) * 0.5 * p.opacity * p2.opacity;
          this.ctx.beginPath();
          this.ctx.strokeStyle = this.options.lineColor.replace('0.15', opacity);
          this.ctx.lineWidth = this.options.lineWidth;
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
        }
      }
    }
  }
  
  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      // Update position
      p.x += p.vx;
      p.y += p.vy;
      
      // Apply friction
      p.vx *= 0.99;
      p.vy *= 0.99;
      
      // Bounce off edges
      if (p.x <= 0 || p.x >= this.width) {
        p.vx = -p.vx * 0.8;
        p.x = Math.max(0, Math.min(p.x, this.width));
      }
      
      if (p.y <= 0 || p.y >= this.height) {
        p.vy = -p.vy * 0.8;
        p.y = Math.max(0, Math.min(p.y, this.height));
      }
      
      // Update particle life and opacity
      if (this.options.particleFade) {
        p.life -= 0.01;
        p.opacity = Math.max(0, Math.min(1, p.life));
        
        if (p.life <= 0) {
          this.particles.splice(i, 1);
          this.particles.push(this.createParticle());
        }
      }
    }
  }
  
  animate() {
    this.drawParticles();
    this.updateParticles();
    this.animationFrame = requestAnimationFrame(this.animate.bind(this));
  }
  
  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    window.removeEventListener('resize', this.resizeCanvas);
    this.particles = [];
  }
}