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

document.querySelectorAll('[data-compare]').forEach((slider) => {
  const range = slider.querySelector('.compare-range');
  if (!range) return;

  const update = () => {
    slider.style.setProperty('--compare-position', range.value + '%');
  };

  range.addEventListener('input', update);
  update();
});

document.querySelectorAll('[data-stage-slider]').forEach((slider) => {
  const firstHandle = slider.querySelector('.stage-handle.h1');
  const secondHandle = slider.querySelector('.stage-handle.h2');
  const logLabel = slider.querySelector('.label-log');
  const recLabel = slider.querySelector('.label-rec');
  const finalLabel = slider.querySelector('.label-final');
  if (!firstHandle || !secondHandle || !logLabel || !recLabel || !finalLabel) return;

  const minimumGap = 12;
  let firstPosition = 33;
  let secondPosition = 66;

  const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));
  const render = () => {
    slider.style.setProperty('--p1', `${firstPosition}%`);
    slider.style.setProperty('--p2', `${secondPosition}%`);
    firstHandle.setAttribute('aria-valuenow', String(Math.round(firstPosition)));
    firstHandle.setAttribute('aria-valuemin', '0');
    firstHandle.setAttribute('aria-valuemax', String(Math.round(secondPosition - minimumGap)));
    secondHandle.setAttribute('aria-valuenow', String(Math.round(secondPosition)));
    secondHandle.setAttribute('aria-valuemin', String(Math.round(firstPosition + minimumGap)));
    secondHandle.setAttribute('aria-valuemax', '100');
    logLabel.classList.toggle('hide', firstPosition < 22);
    recLabel.classList.toggle('hide', secondPosition - firstPosition < 28);
    finalLabel.classList.toggle('hide', 100 - secondPosition < 26);
  };
  const setHandle = (which, value) => {
    if (which === 1) firstPosition = clamp(value, 0, secondPosition - minimumGap);
    else secondPosition = clamp(value, firstPosition + minimumGap, 100);
    render();
  };
  const positionFromEvent = (event) => {
    const bounds = slider.getBoundingClientRect();
    return ((event.clientX - bounds.left) / bounds.width) * 100;
  };
  const bindDrag = (handle, which) => {
    handle.addEventListener('pointerdown', (event) => {
      if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
      event.preventDefault();
      handle.focus();
      handle.setPointerCapture(event.pointerId);
      handle.classList.add('dragging');
      setHandle(which, positionFromEvent(event));
    });
    handle.addEventListener('pointermove', (event) => {
      if (handle.hasPointerCapture(event.pointerId)) setHandle(which, positionFromEvent(event));
    });
    const endDrag = (event) => {
      handle.classList.remove('dragging');
      if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
    };
    handle.addEventListener('pointerup', endDrag);
    handle.addEventListener('pointercancel', endDrag);
    handle.addEventListener('keydown', (event) => {
      const currentPosition = which === 1 ? firstPosition : secondPosition;
      const step = event.shiftKey ? 10 : 2;
      if (event.key === 'ArrowLeft') setHandle(which, currentPosition - step);
      else if (event.key === 'ArrowRight') setHandle(which, currentPosition + step);
      else return;
      event.preventDefault();
    });
  };

  bindDrag(firstHandle, 1);
  bindDrag(secondHandle, 2);

  slider.addEventListener('pointerdown', (event) => {
    if (event.target.closest('.stage-handle')) return;
    const position = positionFromEvent(event);
    setHandle(Math.abs(position - firstPosition) < Math.abs(position - secondPosition) ? 1 : 2, position);
  });

  render();
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
    showToast('Please email your message to mahadevamuthabathula@gmail.com.');
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const formData = new FormData(form);
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const message = String(formData.get('message') || '').trim();
  if (!name || !email || !message) {
    formStatus.textContent = 'Please complete all fields before sending your message.';
    return;
  }

  if (submitButton) submitButton.disabled = true;
  formStatus.textContent = 'Sending your message…';

  try {
    if (!window.emailjs) throw new Error('The email service did not load.');
    form.elements.namedItem('title').value = `Portfolio message from ${name}`;
    form.elements.namedItem('time').value = new Date().toLocaleString();
    await window.emailjs.sendForm('default_service', 'template_jmjy0hk', form);
    form.reset();
    formStatus.textContent = 'Thanks — your message has been sent. I’ll be in touch soon.';
  } catch (error) {
    const subject = encodeURIComponent(`Portfolio message from ${name}`);
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
