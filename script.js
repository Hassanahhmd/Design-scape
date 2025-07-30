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
});
