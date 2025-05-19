// DOM Elements
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const themeToggle = document.getElementById('theme-toggle');
const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
const header = document.getElementById('header');
const scrollTopBtn = document.getElementById('scroll-top');
const navLinks = document.querySelectorAll('.nav-link');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
const contactForm = document.getElementById('contact-form');
const downloadCvBtn = document.getElementById('download-cv');

// Initialize Particles and Mouse Effects
document.addEventListener('DOMContentLoaded', () => {
  // Initialize background particles
  new Particles('bg-canvas', {
    particleCount: 80,
    particleRadius: 2,
    lineDistance: 150,
    speed: 0.5,
    mouseEffect: true, // Enable mouse interaction
    mouseRadius: 100 // Radius of mouse influence
  });
  
  // Check for saved theme
  if (localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  // Animation on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  document.querySelectorAll('section > .container').forEach(section => {
    observer.observe(section);
  });
  
  // Highlight current section in navigation
  updateActiveNavItem();
});

// Download CV functionality
downloadCvBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  const cvUrl = 'https://drive.google.com/file/d/1U5kx0oaQJaVU2g-gNMdqHES5AjRADfv4/view?usp=drive_link';
  
  try {
    const response = await fetch(cvUrl);
    if (!response.ok) throw new Error('Download failed');
    
    // Create a temporary link to trigger download
    const link = document.createElement('a');
    link.href = cvUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading CV:', error);
    window.open(cvUrl, '_blank', 'noopener,noreferrer');
  }
});

// Mobile Menu Toggle
mobileMenuBtn.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.contains('translate-y-0');
  
  if (isOpen) {
    mobileMenu.classList.remove('translate-y-0');
    mobileMenu.classList.add('translate-y-[-100%]');
    mobileMenuBtn.innerHTML = '<i class="fa-solid fa-bars text-xl"></i>';
  } else {
    mobileMenu.classList.add('translate-y-0');
    mobileMenu.classList.remove('translate-y-[-100%]');
    mobileMenuBtn.innerHTML = '<i class="fa-solid fa-xmark text-xl"></i>';
  }
});

// Close mobile menu when a link is clicked
mobileNavLinks.forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('translate-y-0');
    mobileMenu.classList.add('translate-y-[-100%]');
    mobileMenuBtn.innerHTML = '<i class="fa-solid fa-bars text-xl"></i>';
  });
});

// Theme Toggle
function toggleTheme() {
  if (document.documentElement.classList.contains('dark')) {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  } else {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }
}

themeToggle.addEventListener('click', toggleTheme);
mobileThemeToggle.addEventListener('click', toggleTheme);

// Header Scroll Effect
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('py-2', 'shadow-md');
    header.classList.remove('py-4');
  } else {
    header.classList.add('py-4');
    header.classList.remove('py-2', 'shadow-md');
  }
  
  // Scroll to Top Button
  if (window.scrollY > 500) {
    scrollTopBtn.classList.add('visible');
  } else {
    scrollTopBtn.classList.remove('visible');
  }
  
  // Update active navigation item
  updateActiveNavItem();
});

// Scroll to Top
scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
      const offsetPosition = targetElement.offsetTop - 80;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// Update Active Navigation Item based on Scroll Position
function updateActiveNavItem() {
  const scrollPosition = window.scrollY;
  
  // Get all sections
  const sections = document.querySelectorAll('section');
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    const sectionBottom = sectionTop + section.offsetHeight;
    const sectionId = section.getAttribute('id');
    
    if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
      // Desktop nav
      navLinks.forEach(link => {
        if (link.getAttribute('href') === `#${sectionId}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
      
      // Mobile nav
      mobileNavLinks.forEach(link => {
        if (link.getAttribute('href') === `#${sectionId}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  });
}

// Form Submission (Demo Only)
contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // Get form values
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const subject = document.getElementById('subject').value.trim();
  const message = document.getElementById('message').value.trim();
  
  // Simple validation
  if (!name || !email || !subject || !message) {
    alert('Please fill in all fields');
    return;
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Please enter a valid email address');
    return;
  }
  
  // Simulate form submission
  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerHTML;
  
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Sending...';
  
  // Simulate API call
  setTimeout(() => {
    alert('Thank you for your message! As this is a demo, no actual email was sent.');
    contactForm.reset();
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
  }, 1500);
});

// Additional interaction and animations
document.querySelectorAll('.skill-item, .tech-tag').forEach(element => {
  element.addEventListener('mouseenter', () => {
    element.classList.add('scale-105');
  });
  
  element.addEventListener('mouseleave', () => {
    element.classList.remove('scale-105');
  });
});