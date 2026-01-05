// Main JavaScript for Amir Ali Portfolio

document.addEventListener('DOMContentLoaded', function() {
  // ====== PRELOADER ======
  const preloader = document.querySelector('.preloader');
  setTimeout(() => {
    preloader.classList.add('fade-out');
    setTimeout(() => {
      preloader.style.display = 'none';
    }, 600);
  }, 1500);

  // ====== CURSOR EFFECT ======
  const cursorDot = document.querySelector('[data-cursor-dot]');
  const cursorOutline = document.querySelector('[data-cursor-outline]');

  if (cursorDot && cursorOutline) {
    window.addEventListener('mousemove', function(e) {
      const posX = e.clientX;
      const posY = e.clientY;
      
      cursorDot.style.left = `${posX}px`;
      cursorDot.style.top = `${posY}px`;
      
      cursorOutline.animate({
        left: `${posX}px`,
        top: `${posY}px`
      }, { duration: 500, fill: 'forwards' });
      
      // Interactive elements hover effect
      const interactiveElements = document.querySelectorAll('a, button, .btn, .service-card, .portfolio-card, .info-card');
      interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
          cursorDot.style.transform = 'scale(2)';
          cursorOutline.style.transform = 'scale(1.5)';
        });
        
        el.addEventListener('mouseleave', () => {
          cursorDot.style.transform = 'scale(1)';
          cursorOutline.style.transform = 'scale(1)';
        });
      });
    });
  }

  // ====== TYPED TEXT ANIMATION ======
  const typed = new Typed('#typed', {
    strings: [
      'Web Developer',
      'Frontend Expert',
      'UI/UX Designer',
      'Freelancer',
      'Problem Solver'
    ],
    typeSpeed: 60,
    backSpeed: 40,
    backDelay: 1500,
    startDelay: 1000,
    loop: true,
    showCursor: true,
    cursorChar: '|',
    onStringTyped: function() {
      const typedElement = document.querySelector('.typed-text');
      typedElement.classList.add('highlight');
      setTimeout(() => typedElement.classList.remove('highlight'), 300);
    }
  });

  // ====== AOS INITIALIZATION ======
  AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true,
    mirror: false,
    disable: window.innerWidth < 768
  });

  // ====== PARTICLE BACKGROUND ======
  particlesJS('particles-js', {
    particles: {
      number: { value: 80, density: { enable: true, value_area: 800 } },
      color: { value: "#6366f1" },
      shape: { type: "circle" },
      opacity: { value: 0.3, random: true },
      size: { value: 3, random: true },
      line_linked: {
        enable: true,
        distance: 150,
        color: "#6366f1",
        opacity: 0.2,
        width: 1
      },
      move: {
        enable: true,
        speed: 2,
        direction: "none",
        random: true,
        straight: false,
        out_mode: "out",
        bounce: false
      }
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: { enable: true, mode: "repulse" },
        onclick: { enable: true, mode: "push" }
      }
    }
  });

  // ====== HEADER SCROLL EFFECT ======
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    // Back to top button
    const backToTop = document.querySelector('.back-to-top');
    if (window.scrollY > 300) {
      backToTop.classList.add('active');
    } else {
      backToTop.classList.remove('active');
    }
  });

  // ====== BACK TO TOP ======
  const backToTopBtn = document.querySelector('.back-to-top');
  backToTopBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // ====== SMOOTH SCROLL ======
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      if (this.getAttribute('href') === '#') return;
      
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });
        
        // Close mobile menu if open
        const navbarCollapse = document.querySelector('.navbar-collapse.show');
        if (navbarCollapse) {
          const bsCollapse = new bootstrap.Collapse(navbarCollapse);
          bsCollapse.hide();
        }
      }
    });
  });

  // ====== NAVBAR ACTIVE LINK ======
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (scrollY >= sectionTop - 100) {
        current = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // ====== SKILL BARS ANIMATION ======
  const animateSkillBars = () => {
    const skillBars = document.querySelectorAll('.skill-progress');
    skillBars.forEach(bar => {
      const width = bar.getAttribute('data-width');
      bar.style.width = '0%';
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              bar.style.width = `${width}%`;
            }, 300);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      
      observer.observe(bar);
    });
  };
  
  // Initialize skill bars
  animateSkillBars();

  // ====== PORTFOLIO FILTERING ======
  const filterButtons = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));
      // Add active class to clicked button
      button.classList.add('active');
      
      const filterValue = button.getAttribute('data-filter');
      
      portfolioItems.forEach(item => {
        if (filterValue === '*' || item.classList.contains(filterValue.substring(1))) {
          item.style.display = 'block';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          }, 100);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.8)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 300);
        }
      });
    });
  });

  // ====== CONTACT FORM ======
  const contactForm = document.getElementById('contactForm');
  const formMessage = document.getElementById('form-message');
  
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      
      // Show loading state
      submitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Sending...';
      submitBtn.disabled = true;
      
      try {
        const formData = new FormData(this);
        const response = await fetch(this.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          // Success
          formMessage.textContent = 'Message sent successfully! I\'ll get back to you soon.';
          formMessage.className = 'success';
          formMessage.style.display = 'block';
          
          // Reset form
          this.reset();
          
          // Hide message after 5 seconds
          setTimeout(() => {
            formMessage.style.display = 'none';
          }, 5000);
        } else {
          throw new Error('Form submission failed');
        }
      } catch (error) {
        // Error
        formMessage.textContent = 'Oops! Something went wrong. Please try again.';
        formMessage.className = 'error';
        formMessage.style.display = 'block';
        
        // Hide message after 5 seconds
        setTimeout(() => {
          formMessage.style.display = 'none';
        }, 5000);
      } finally {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // ====== NEWSLETTER FORM ======
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = this.querySelector('input[type="email"]');
      const button = this.querySelector('button');
      
      // Simple validation
      if (!email.value.includes('@')) {
        email.style.borderColor = 'var(--danger)';
        return;
      }
      
      // Show success state
      const originalText = button.innerHTML;
      button.innerHTML = '<i class="bi bi-check"></i>';
      button.style.background = 'var(--success)';
      
      // Reset after 2 seconds
      setTimeout(() => {
        button.innerHTML = originalText;
        button.style.background = '';
        email.value = '';
        email.style.borderColor = '';
      }, 2000);
    });
  }

  // ====== COUNTER ANIMATION ======
  const counters = document.querySelectorAll('.stat h3');
  const speed = 200;
  
  const animateCounters = () => {
    counters.forEach(counter => {
      const updateCount = () => {
        const target = parseInt(counter.getAttribute('data-count') || counter.textContent);
        const count = parseInt(counter.textContent);
        const increment = Math.ceil(target / speed);
        
        if (count < target) {
          counter.textContent = count + increment;
          setTimeout(updateCount, 1);
        } else {
          counter.textContent = target + '+';
        }
      };
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            updateCount();
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      
      observer.observe(counter);
    });
  };
  
  // Initialize counters
  animateCounters();

  // ====== SCROLL ANIMATIONS ======
  const animateOnScroll = () => {
    const elements = document.querySelectorAll('.service-card, .portfolio-card, .info-card');
    
    elements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;
      
      if (elementTop < window.innerHeight - elementVisible) {
        element.classList.add('animate');
      }
    });
  };
  
  window.addEventListener('scroll', animateOnScroll);
  animateOnScroll(); // Initial check

  // ====== GLIGHTBOX INIT ======
  if (typeof GLightbox !== 'undefined') {
    const lightbox = GLightbox({
      selector: '.portfolio-link[href$=".jpg"], .portfolio-link[href$=".png"], .portfolio-link[href$=".gif"]'
    });
  }

  // ====== THEME TOGGLE (Optional) ======
  const themeToggle = document.createElement('button');
  themeToggle.className = 'theme-toggle';
  themeToggle.innerHTML = '<i class="bi bi-moon"></i>';
  document.body.appendChild(themeToggle);
  
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    if (document.body.classList.contains('light-mode')) {
      themeToggle.innerHTML = '<i class="bi bi-sun"></i>';
    } else {
      themeToggle.innerHTML = '<i class="bi bi-moon"></i>';
    }
  });

  // ====== CONSOLE LOGO ======
  console.log('%c👋 Hello! Welcome to my portfolio.', 'color: #6366f1; font-size: 16px; font-weight: bold;');
  console.log('%cAmir Ali - Web Developer', 'color: #10b981; font-size: 14px;');
  console.log('%cPortfolio website loaded successfully!', 'color: #f59e0b; font-size: 12px;');
});
// Initialize Testimonials Slider
if (document.querySelector('#testimonials')) {
    const testimonialsSlider = new TestimonialsSlider();
}