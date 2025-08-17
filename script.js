// script.js
// Responsive & accessible behaviours for the Design Scape Architecture site.

document.addEventListener('DOMContentLoaded', () => {
  // ======= Helpers =======
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => r.querySelectorAll(s);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isRmf = () => prefersReducedMotion.matches;

  // rAF throttle for scroll/resize
  const rafThrottle = (fn) => {
    let ticking = false;
    return (...args) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          fn(...args);
          ticking = false;
        });
        ticking = true;
      }
    };
  };

  // ======= Testimonial slider (touch + keyboard + responsive) =======
  const testimonials = $$('.testimonial');
  const prevBtn = $('#prevTestimonial');
  const nextBtn = $('#nextTestimonial');
  const sliderRegion = $('#testimonialRegion') || prevBtn?.closest('[role="region"]') || document.body;
  let currentIndex = 0;

  function showTestimonial(index) {
    if (!testimonials.length) return;
    currentIndex = (index + testimonials.length) % testimonials.length;
    testimonials.forEach((t, i) => {
      const active = i === currentIndex;
      t.classList.toggle('active', active);
      t.setAttribute('aria-hidden', active ? 'false' : 'true');
      // For responsiveness: ensure height adapts smoothly
      if (active) {
        t.parentElement.style.height = t.offsetHeight + 'px';
      }
    });
    // Update aria-live text if present
    const live = $('#testimonialAnnouncer');
    if (live) {
      live.textContent = `Showing testimonial ${currentIndex + 1} of ${testimonials.length}`;
    }
  }

  function showPrev() { showTestimonial(currentIndex - 1); }
  function showNext() { showTestimonial(currentIndex + 1); }

  if (prevBtn && nextBtn && testimonials.length) {
    prevBtn.addEventListener('click', showPrev, { passive: true });
    nextBtn.addEventListener('click', showNext, { passive: true });

    // Keyboard support on the region
    sliderRegion.setAttribute('tabindex', '0');
    sliderRegion.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    });

    // Touch/swipe (mobile)
    let startX = 0, startY = 0, isSwiping = false;
    const threshold = 30; // px
    const area = sliderRegion;

    area.addEventListener('touchstart', (e) => {
      const t = e.changedTouches[0];
      startX = t.clientX; startY = t.clientY; isSwiping = true;
    }, { passive: true });

    area.addEventListener('touchmove', (e) => {
      // If vertical move is dominant, cancel swipe to allow scroll
      if (!isSwiping) return;
      const t = e.changedTouches[0];
      if (Math.abs(t.clientY - startY) > Math.abs(t.clientX - startX)) {
        isSwiping = false;
      }
    }, { passive: true });

    area.addEventListener('touchend', (e) => {
      if (!isSwiping) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      if (dx > threshold) showPrev();
      if (dx < -threshold) showNext();
      isSwiping = false;
    }, { passive: true });

    // Resize: keep container height matching active slide
    const onResize = rafThrottle(() => showTestimonial(currentIndex));
    window.addEventListener('resize', onResize);

    // Auto-advance (skip if reduced motion)
    if (!isRmf()) {
      let timer = setInterval(showNext, 6000);
      // Pause on hover/focus for accessibility
      const pause = () => { clearInterval(timer); };
      const resume = () => { if (!isRmf()) timer = setInterval(showNext, 6000); };
      area.addEventListener('mouseenter', pause);
      area.addEventListener('mouseleave', resume);
      area.addEventListener('focusin', pause);
      area.addEventListener('focusout', resume);
    }

    // Init
    showTestimonial(currentIndex);
  }

  // ======= Footer year =======
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ======= Contact form (robust mailto) =======
  const form = $('#contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const get = (n) => encodeURIComponent((form[n]?.value || '').trim());
      const name = get('name');
      const company = get('company');
      const email = get('email');
      const message = get('message');
      const reason = get('reason');
      const subject = encodeURIComponent(`New enquiry from ${decodeURIComponent(name) || 'Website visitor'}`);
      const body =
        `Name: ${name}%0D%0ACompany: ${company}%0D%0AEmail: ${email}%0D%0AReason: ${reason}%0D%0A%0D%0A${message}`;
      window.location.href = `mailto:Hassanua4@gmail.com?subject=${subject}&body=${body}`;
    });
  }

  // ======= Cairo time & weather (respect reduced motion) =======
  const timeEl = $('#currentTime');
  const weatherEl = $('#currentWeather');

  if (timeEl) {
    const updateTime = () => {
      const now = new Date();
      timeEl.textContent = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false, timeZone: 'Africa/Cairo'
      }).format(now);
    };
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);
    if (isRmf()) { clearInterval(timeInterval); updateTime(); }
  }

  if (weatherEl) {
    const weatherDescriptions = {
      0: 'Clear', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
      45: 'Fog', 48: 'Foggy', 51: 'Drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
      56: 'Freezing drizzle', 57: 'Freezing drizzle', 61: 'Rain', 63: 'Rain',
      65: 'Heavy rain', 71: 'Snow', 73: 'Snow', 75: 'Heavy snow', 95: 'Thunderstorm'
    };
    const fetchWeather = () => {
      const lat = 30.0444, lon = 31.2357;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
      fetch(url)
        .then((r) => r.json())
        .then((data) => {
          const c = data.current_weather;
          if (!c) return;
          const temp = Math.round(c.temperature);
          const desc = weatherDescriptions[c.weathercode] || '';
          weatherEl.textContent = `${temp}°C ${desc}`;
        })
        .catch(() => { weatherEl.textContent = ''; });
    };
    fetchWeather();
    const wTimer = setInterval(fetchWeather, 3600000);
    if (isRmf()) clearInterval(wTimer);
  }

  // ======= Lightbox (esc to close + click outside) =======
  const lightbox = $('#lightbox');
  const lightboxImg = lightbox ? $('.lightbox-img', lightbox) : null;
  const lightboxClose = lightbox ? $('.lightbox-close', lightbox) : null;
  const galleryImages = $$('.gallery-item img');

  if (lightbox && lightboxImg && lightboxClose && galleryImages.length) {
    galleryImages.forEach((img) => {
      img.style.cursor = 'pointer';
      img.addEventListener('click', () => {
        const src = img.getAttribute('src');
        if (!src) return;
        lightboxImg.src = src;
        lightbox.classList.remove('hidden');
        lightbox.setAttribute('aria-hidden', 'false');
        lightboxClose.focus();
        document.body.style.overflow = 'hidden'; // prevent scroll on mobile
      }, { passive: true });
    });

    const closeLb = () => {
      lightbox.classList.add('hidden');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    lightboxClose.addEventListener('click', closeLb);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLb(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLb(); });
  }

  // ======= Scroll reveal (IntersectionObserver) =======
  const fadeEls = $$('.fade-in');
  if (fadeEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '80px 0px' });
    fadeEls.forEach((el) => io.observe(el));
  }

  // ======= Back to top + Scroll progress (rAF for smoothness) =======
  const backToTopBtn = $('#backToTop');
  const scrollProgress = $('#scrollProgress');

  const onScroll = rafThrottle(() => {
    const y = window.scrollY;
    if (backToTopBtn) backToTopBtn.classList.toggle('show', y > 400);
    if (scrollProgress) {
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const scrollable = Math.max(docHeight - winHeight, 1);
      const progress = (y / scrollable) * 100;
      scrollProgress.style.width = `${progress}%`;
    }
  });

  window.addEventListener('scroll', onScroll, { passive: true });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: isRmf() ? 'auto' : 'smooth' });
    });
  }

  // ======= Dark mode toggle (respect system by default) =======
  const themeToggle = $('#themeToggle');
  const body = document.body;

  const applyTheme = (theme) => {
    body.setAttribute('data-theme', theme);
    const icon = themeToggle?.querySelector('i');
    if (icon) {
      icon.classList.toggle('fa-sun', theme === 'dark');
      icon.classList.toggle('fa-moon', theme !== 'dark');
    }
    localStorage.setItem('theme', theme);
  };

  // Initialize theme: saved -> system -> light
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    body.setAttribute('data-theme', savedTheme);
  } else {
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    body.setAttribute('data-theme', systemDark ? 'dark' : 'light');
  }

  if (themeToggle) {
    // Sync icon initially
    const currentTheme = body.getAttribute('data-theme');
    const icon = themeToggle.querySelector('i');
    if (icon) {
      icon.classList.toggle('fa-sun', currentTheme === 'dark');
      icon.classList.toggle('fa-moon', currentTheme !== 'dark');
    }

    themeToggle.addEventListener('click', () => {
      const t = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(t);
    });

    // Follow system changes if user hasn’t explicitly saved a choice
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) applyTheme(e.matches ? 'dark' : 'light');
    });
  }
});
