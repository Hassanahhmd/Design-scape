// script.js
// Minor interactive behaviours for the Hassuna Visuals site.

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
      // Simple form validation (fields are already required)
      // Here you could integrate with a backend service or email client
      alert('Thank you for reaching out! We will get back to you shortly.');
      form.reset();
    });
  }
});
