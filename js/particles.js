class Particles {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    // Enhanced default options
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
      mouseAttract: true,
      mouseForce: 3,
      particleLife: 3,
      particleLifeVariance: 1,
      particleFade: true,
      particleGlow: true,
      glowColor: 'rgba(59, 130, 246, 0.3)',
      glowRadius: 10,
      trailEffect: true,
      trailLength: 5,
      particleShape: 'circle', // 'circle', 'square', 'triangle'
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
    this.trails = [];
    this.animationFrame = null;
    this.isDarkMode = document.documentElement.classList.contains('dark');
    this.mouse = { 
      x: null, 
      y: null, 
      radius: this.options.mouseRadius,
      lastX: null,
      lastY: null,
      velocityX: 0,
      velocityY: 0,
      isPressed: false
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
        
        this.mouse.lastX = this.mouse.x || e.clientX - rect.left;
        this.mouse.lastY = this.mouse.y || e.clientY - rect.top;
        
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
        
        this.mouse.velocityX = (this.mouse.x - this.mouse.lastX) * 0.2;
        this.mouse.velocityY = (this.mouse.y - this.mouse.lastY) * 0.2;
        
        if (this.options.trailEffect && this.mouse.isPressed) {
          this.addTrail(this.mouse.x, this.mouse.y);
        }
      });
      
      this.canvas.addEventListener('mousedown', () => {
        this.mouse.isPressed = true;
      });
      
      this.canvas.addEventListener('mouseup', () => {
        this.mouse.isPressed = false;
      });
      
      this.canvas.addEventListener('mouseleave', () => {
        this.mouse.x = null;
        this.mouse.y = null;
        this.mouse.velocityX = 0;
        this.mouse.velocityY = 0;
        this.mouse.isPressed = false;
      });
      
      // Touch events for mobile
      this.canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.mouse.isPressed = true;
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = touch.clientX - rect.left;
        this.mouse.y = touch.clientY - rect.top;
      });
      
      this.canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        
        this.mouse.lastX = this.mouse.x;
        this.mouse.lastY = this.mouse.y;
        
        this.mouse.x = touch.clientX - rect.left;
        this.mouse.y = touch.clientY - rect.top;
        
        if (this.options.trailEffect) {
          this.addTrail(this.mouse.x, this.mouse.y);
        }
      });
      
      this.canvas.addEventListener('touchend', () => {
        this.mouse.isPressed = false;
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
    this.options.glowColor = 'rgba(96, 165, 250, 0.3)';
  }
  
  updateColorsForLightMode() {
    this.options.particleColor = '#3b82f6';
    this.options.lineColor = 'rgba(59, 130, 246, 0.15)';
    this.options.glowColor = 'rgba(59, 130, 246, 0.3)';
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
      opacity: 1,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02
    };
  }
  
  addTrail(x, y) {
    this.trails.push({
      x,
      y,
      radius: this.options.particleRadius * 2,
      life: 1
    });
  }
  
  createParticles() {
    for (let i = 0; i < this.options.particleCount; i++) {
      this.particles.push(this.createParticle());
    }
  }
  
  drawParticleShape(p) {
    switch (this.options.particleShape) {
      case 'square':
        this.ctx.rect(p.x - p.radius, p.y - p.radius, p.radius * 2, p.radius * 2);
        break;
      case 'triangle':
        this.ctx.moveTo(p.x + p.radius * Math.cos(p.rotation), p.y + p.radius * Math.sin(p.rotation));
        this.ctx.lineTo(p.x + p.radius * Math.cos(p.rotation + (2 * Math.PI / 3)), 
                       p.y + p.radius * Math.sin(p.rotation + (2 * Math.PI / 3)));
        this.ctx.lineTo(p.x + p.radius * Math.cos(p.rotation + (4 * Math.PI / 3)),
                       p.y + p.radius * Math.sin(p.rotation + (4 * Math.PI / 3)));
        this.ctx.closePath();
        break;
      default: // circle
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    }
  }
  
  drawParticles() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Draw trails
    if (this.options.trailEffect) {
      for (const trail of this.trails) {
        this.ctx.beginPath();
        this.ctx.arc(trail.x, trail.y, trail.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.options.particleColor.replace(')', `, ${trail.life})`);
        this.ctx.fill();
      }
    }
    
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
            p.vx -= Math.cos(angle) * force * this.options.mouseForce;
            p.vy -= Math.sin(angle) * force * this.options.mouseForce;
          }
          
          if (this.options.mouseAttract) {
            p.vx += this.mouse.velocityX * force;
            p.vy += this.mouse.velocityY * force;
          }
          
          p.radius = p.originalRadius * (1 + force);
        } else {
          p.radius = p.originalRadius;
        }
      }
      
      // Particle glow effect
      if (this.options.particleGlow) {
        const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, this.options.glowRadius);
        gradient.addColorStop(0, this.options.glowColor);
        gradient.addColorStop(1, 'transparent');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(p.x - this.options.glowRadius, p.y - this.options.glowRadius,
                         this.options.glowRadius * 2, this.options.glowRadius * 2);
      }
      
      // Draw particle
      this.ctx.beginPath();
      this.drawParticleShape(p);
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
    // Update trails
    if (this.options.trailEffect) {
      for (let i = this.trails.length - 1; i >= 0; i--) {
        const trail = this.trails[i];
        trail.life -= 0.02;
        if (trail.life <= 0) {
          this.trails.splice(i, 1);
        }
      }
    }
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      
      // Apply friction and gravity
      p.vx *= 0.99;
      p.vy *= 0.99;
      p.vy += 0.02; // Slight gravity effect
      
      // Bounce off edges with energy loss
      if (p.x <= 0 || p.x >= this.width) {
        p.vx = -p.vx * 0.8;
        p.x = Math.max(0, Math.min(p.x, this.width));
      }
      
      if (p.y <= 0 || p.y >= this.height) {
        p.vy = -p.vy * 0.8;
        p.y = Math.max(0, Math.min(p.y, this.height));
      }
      
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
    this.trails = [];
  }
}