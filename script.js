const menuToggle = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('.primary-nav');
const siteHeader = document.querySelector('[data-header]');
const navLinks = [...document.querySelectorAll('[data-nav-link]')];
const sections = [...document.querySelectorAll('main section[id]')];

function updateHeaderScrollState() {
  siteHeader?.classList.toggle('is-scrolled', window.scrollY > 8);
}

updateHeaderScrollState();
window.addEventListener('scroll', updateHeaderScrollState, { passive: true });

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
    filterButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-pressed', String(isActive));
    });
    workCards.forEach((card) => {
      const matches = filter === 'all' || card.dataset.category.split(' ').includes(filter);
      card.classList.toggle('is-hidden', !matches);
    });
  });
});

const form = document.querySelector('[data-contact-form]');
const formStatus = document.querySelector('.form-status');
const toast = document.querySelector('[data-toast]');
const skillList = document.querySelector('.tool-list');
const skillTooltip = document.querySelector('#skill-tooltip');
let toastTimer;
let activeSkill;

function hideSkillTooltip() {
  if (!skillTooltip) return;
  skillTooltip.hidden = true;
  activeSkill = undefined;
}

function positionSkillTooltip(button) {
  const buttonRect = button.getBoundingClientRect();
  const tooltipRect = skillTooltip.getBoundingClientRect();
  const margin = 12;
  const left = Math.max(margin, Math.min(buttonRect.left, window.innerWidth - tooltipRect.width - margin));
  const top = buttonRect.bottom + tooltipRect.height + margin <= window.innerHeight
    ? buttonRect.bottom + margin
    : buttonRect.top - tooltipRect.height - margin >= margin
      ? buttonRect.top - tooltipRect.height - margin
      : margin;
  skillTooltip.style.left = `${left}px`;
  skillTooltip.style.top = `${top}px`;
}

function showSkillTooltip(button) {
  if (!skillTooltip) return;
  activeSkill = button;
  skillTooltip.textContent = button.dataset.skillInfo;
  skillTooltip.hidden = false;
  positionSkillTooltip(button);
}

function updateSkillTooltipPosition() {
  if (!activeSkill) return;
  const buttonRect = activeSkill.getBoundingClientRect();
  if (buttonRect.bottom < 0 || buttonRect.top > window.innerHeight) {
    if (!activeSkill.matches(':focus')) hideSkillTooltip();
    return;
  }
  positionSkillTooltip(activeSkill);
}

skillList?.addEventListener('pointerover', (event) => {
  const button = event.target.closest('.skill-chip');
  if (button && button !== activeSkill) showSkillTooltip(button);
});

skillList?.addEventListener('pointerout', (event) => {
  const button = event.target.closest('.skill-chip');
  if (button && !button.contains(event.relatedTarget) && button === activeSkill) hideSkillTooltip();
});

skillList?.addEventListener('focusin', (event) => {
  const button = event.target.closest('.skill-chip');
  if (button) showSkillTooltip(button);
});

skillList?.addEventListener('click', (event) => {
  const button = event.target.closest('.skill-chip');
  if (button) showSkillTooltip(button);
});

skillList?.addEventListener('focusout', (event) => {
  const nextButton = event.relatedTarget?.closest('.skill-chip');
  if (nextButton) showSkillTooltip(nextButton);
  else hideSkillTooltip();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') hideSkillTooltip();
});

document.addEventListener('pointerdown', (event) => {
  if (activeSkill && !skillList?.contains(event.target)) hideSkillTooltip();
});

window.addEventListener('scroll', updateSkillTooltipPosition, { passive: true });
window.addEventListener('resize', hideSkillTooltip);

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 4200);
}

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!formStatus) {
    showToast('Please email your enquiry to mahadevamuthabathula@gmail.com.');
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const formData = new FormData(form);
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const message = String(formData.get('message') || '').trim();
  if (!name || !email || !message) {
    formStatus.textContent = 'Please complete all fields before sending your enquiry.';
    return;
  }

  if (submitButton) submitButton.disabled = true;
  formStatus.textContent = 'Sending your enquiry…';

  try {
    if (!window.emailjs) throw new Error('The email service did not load.');
    form.elements.namedItem('title').value = `Portfolio enquiry from ${name}`;
    form.elements.namedItem('time').value = new Date().toLocaleString();
    await window.emailjs.sendForm('default_service', 'template_jmjy0hk', form);
    form.reset();
    formStatus.textContent = 'Thanks — your enquiry has been sent. I’ll be in touch soon.';
  } catch (error) {
    const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\r\nEmail: ${email}\r\n\r\n${message}`);
    const fallbackLink = document.createElement('a');
    fallbackLink.href = `mailto:mahadevamuthabathula@gmail.com?subject=${subject}&body=${body}`;
    fallbackLink.textContent = 'send it by email instead';
    const errorMessage = error instanceof Error
      ? error.message
      : error?.text || 'The email service is temporarily unavailable.';
    formStatus.replaceChildren(
      document.createTextNode(`${errorMessage} Please try again or `),
      fallbackLink,
      document.createTextNode('.')
    );
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
});
