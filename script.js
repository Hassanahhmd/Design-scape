// script.js
// Minor interactive behaviours for the Design Scape Architecture site.

document.addEventListener('DOMContentLoaded', () => {
  // Initialise testimonial slider
  const testimonials = document.querySelectorAll('.testimonial');
  const prevBtn = document.getElementById('prevTestimonial');
  const nextBtn = document.getElementById('nextTestimonial');
  let currentIndex = 0;

  function showTestimonial(index) {
    testimonials.forEach((t, i) => {
      t.classList.toggle('active', i === index);
    });
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
    showTestimonial(currentIndex);
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % testimonials.length;
    showTestimonial(currentIndex);
  }

  // Attach event listeners
  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', showPrev);
    nextBtn.addEventListener('click', showNext);
  }

  // Show first testimonial by default
  if (testimonials.length) {
    showTestimonial(currentIndex);
  }

  // Update footer year
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Handle contact form submission
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // Gather form data and compose an email using mailto. Encode to ensure special characters
      const name = encodeURIComponent(form.name.value);
      const company = encodeURIComponent(form.company.value);
      const email = encodeURIComponent(form.email.value);
      const message = encodeURIComponent(form.message.value);
      // Retrieve the selected reason from the drop‑down list. If none selected, default to empty string.
      const reason = encodeURIComponent(form.reason?.value || '');
      const subject = encodeURIComponent(`New enquiry from ${form.name.value}`);
      const body = `Name: ${name}%0D%0ACompany: ${company}%0D%0AEmail: ${email}%0D%0AReason: ${reason}%0D%0A%0D%0A${message}`;
      // Redirect to mailto link; this opens the user's mail client with prefilled data
      window.location.href = `mailto:Hassanua4@gmail.com?subject=${subject}&body=${body}`;
    });
  }

  // Show current time in Cairo and fetch current weather
  const timeEl = document.getElementById('currentTime');
  const weatherEl = document.getElementById('currentWeather');
  // Only execute if elements exist
  if (timeEl && weatherEl) {
    function updateTime() {
      const now = new Date();
      const options = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Africa/Cairo'
      };
      timeEl.textContent = new Intl.DateTimeFormat('en-US', options).format(now);
    }
    updateTime();
    setInterval(updateTime, 1000);

    // Map weather codes from Open-Meteo to simple descriptions
    const weatherDescriptions = {
      0: 'Clear',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Foggy',
      51: 'Drizzle',
      53: 'Drizzle',
      55: 'Heavy drizzle',
      56: 'Freezing drizzle',
      57: 'Freezing drizzle',
      61: 'Rain',
      63: 'Rain',
      65: 'Heavy rain',
      71: 'Snow',
      73: 'Snow',
      75: 'Heavy snow',
      95: 'Thunderstorm'
    };

    function fetchWeather() {
      const lat = 30.0444;
      const lon = 31.2357;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          const current = data.current_weather;
          if (!current) return;
          const temp = current.temperature;
          const code = current.weathercode;
          const desc = weatherDescriptions[code] || '';
          // Compose weather string, e.g. "30°C Clear"
          weatherEl.textContent = `${Math.round(temp)}°C ${desc}`;
        })
        .catch((err) => {
          console.error('Weather fetch error', err);
          weatherEl.textContent = '';
        });
    }
    fetchWeather();
    // Update weather every hour (3600000 ms)
    setInterval(fetchWeather, 3600000);
  }

  // Lightbox functionality for portfolio images
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox ? lightbox.querySelector('.lightbox-img') : null;
  const lightboxClose = lightbox ? lightbox.querySelector('.lightbox-close') : null;
  const galleryImages = document.querySelectorAll('.gallery-item img');
  if (lightbox && lightboxImg && lightboxClose && galleryImages.length) {
    galleryImages.forEach((img) => {
      img.style.cursor = 'pointer';
      img.addEventListener('click', () => {
        lightboxImg.src = img.getAttribute('src');
        lightbox.classList.remove('hidden');
      });
    });
    // Close when clicking close icon
    lightboxClose.addEventListener('click', () => {
      lightbox.classList.add('hidden');
    });
    // Close when clicking outside the image
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        lightbox.classList.add('hidden');
      }
    });
  }

  // IntersectionObserver to animate sections on scroll
  const fadeEls = document.querySelectorAll('.fade-in');
  if (fadeEls.length) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    fadeEls.forEach((el) => observer.observe(el));
  }

  // Back to top button functionality
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    });
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Scroll progress bar: update width based on scroll position
  const scrollProgress = document.getElementById('scrollProgress');
  if (scrollProgress) {
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const scrollable = docHeight - winHeight;
      const progress = scrollable > 0 ? (scrollTop / scrollable) * 100 : 0;
      scrollProgress.style.width = `${progress}%`;
    });
  }

  // Dark mode toggle: persist user preference and toggle data-theme
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;
  if (themeToggle) {
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      body.setAttribute('data-theme', savedTheme);
      // Update icon to reflect current theme
      themeToggle.querySelector('i').classList.toggle('fa-moon', savedTheme !== 'dark');
      themeToggle.querySelector('i').classList.toggle('fa-sun', savedTheme === 'dark');
    }
    themeToggle.addEventListener('click', () => {
      const currentTheme = body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      body.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      // Toggle icon classes
      const icon = themeToggle.querySelector('i');
      if (newTheme === 'dark') {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
      } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
      }
    });
  }

  // Typewriter effect for hero tagline
  const typewriterEl = document.getElementById('typewriter');
  if (typewriterEl) {
    const words = [
      'Inspiring Spaces',
      'Innovative Designs',
      'Immersive Experiences'
    ];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
      const currentWord = words[wordIndex];
      const visibleText = isDeleting
        ? currentWord.substring(0, charIndex--)
        : currentWord.substring(0, charIndex++);
      typewriterEl.textContent = visibleText;
      const baseDelay = 120;
      let timeout = isDeleting ? baseDelay / 2 : baseDelay;
      if (!isDeleting && charIndex === currentWord.length) {
        timeout = 2000; // Pause before deleting
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        timeout = 500;
      }
      setTimeout(type, timeout);
    }
    type();
  }
});
