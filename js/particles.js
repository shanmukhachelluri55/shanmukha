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
    
    // Listen for dark mode changes
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
    
    // Update options based on screen size
    if (this.options.responsive) {
      for (const item of this.options.responsive) {
        if (window.innerWidth <= item.breakpoint) {
          this.options = { ...this.options, ...item.options };
          break;
        }
      }
    }
    
    // Re-create particles when canvas is resized
    if (this.particles.length) {
      this.particles = [];
      this.createParticles();
    }
  }
  
  createParticles() {
    for (let i = 0; i < this.options.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: Math.random() * this.options.speed * this.options.directionX,
        vy: Math.random() * this.options.speed * this.options.directionY,
        radius: Math.random() * this.options.particleRadius + 1,
        color: this.options.particleColor
      });
    }
  }
  
  drawParticles() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.fill();
      
      // Draw lines between particles
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.options.lineDistance) {
          this.ctx.beginPath();
          this.ctx.strokeStyle = this.options.lineColor;
          this.ctx.lineWidth = this.options.lineWidth;
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
        }
      }
    }
  }
  
  updateParticles() {
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      
      // Bounce off the edges
      if (p.x <= 0 || p.x >= this.width) {
        p.vx = -p.vx;
      }
      
      if (p.y <= 0 || p.y >= this.height) {
        p.vy = -p.vy;
      }
      
      // Keep particles within the canvas
      p.x = Math.max(0, Math.min(p.x, this.width));
      p.y = Math.max(0, Math.min(p.y, this.height));
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