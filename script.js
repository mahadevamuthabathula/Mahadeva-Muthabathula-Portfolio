const menuToggle = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('.primary-nav');
const navLinks = [...document.querySelectorAll('[data-nav-link]')];
const sections = [...document.querySelectorAll('main section[id]')];

function closeMenu() {
  if (!menuToggle || !primaryNav) return;
  menuToggle.setAttribute('aria-expanded', 'false');
  primaryNav.classList.remove('is-open');
}

menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  primaryNav.classList.toggle('is-open', !isOpen);
});

navLinks.forEach((link) => link.addEventListener('click', closeMenu));

document.addEventListener('click', (event) => {
  if (!primaryNav?.classList.contains('is-open')) return;
  if (!primaryNav.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('is-visible');
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-38% 0px -52% 0px', threshold: 0 });
sections.forEach((section) => sectionObserver.observe(section));

const filterButtons = [...document.querySelectorAll('[data-filter]')];
const workCards = [...document.querySelectorAll('.work-card')];
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle('is-active', item === button));
    workCards.forEach((card) => {
      const matches = filter === 'all' || card.dataset.category.split(' ').includes(filter);
      card.classList.toggle('is-hidden', !matches);
    });
  });
});

const form = document.querySelector('[data-contact-form]');
const formStatus = document.querySelector('.form-status');
const toast = document.querySelector('[data-toast]');
let toastTimer;

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 4200);
}

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const message = String(formData.get('message') || '').trim();
  const submitButton = form.querySelector('button[type="submit"]');
  if (!formStatus) {
    showToast('Unable to send the enquiry. Please email mahadevamuthabathula@gmail.com directly.');
    return;
  }
  if (!name || !email || !message) {
    formStatus.textContent = 'Please complete all fields before sending your enquiry.';
    return;
  }

  if (submitButton) submitButton.disabled = true;
  formStatus.textContent = 'Sending your enquiry…';
  try {
    const response = await fetch('/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Your enquiry could not be sent.');
    formStatus.textContent = result.message;
    form.reset();
  } catch (error) {
    formStatus.textContent = error.message || 'Your enquiry could not be sent. Please try again.';
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
});

// Keep keyboard users able to open a portfolio card without changing the calm visual language.
workCards.forEach((card) => card.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    showToast(`${card.querySelector('h3')?.textContent || 'Project'} — case study coming soon.`);
  }
}));
