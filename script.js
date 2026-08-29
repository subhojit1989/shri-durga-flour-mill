function initCarousel({ trackSelector, dotsSelector, prevSelector, nextSelector, groupSelector }) {
  const track = document.querySelector(trackSelector);
  if (!track) return;
  const itemCount = track.children.length;
  const dotsContainer = dotsSelector ? document.querySelector(dotsSelector) : null;
  const prevBtn = document.querySelector(prevSelector);
  const nextBtn = document.querySelector(nextSelector);
  const group = groupSelector ? document.querySelector(groupSelector) : track;

  const dots = dotsContainer ? Array.from(dotsContainer.querySelectorAll('button')) : [];
  let active = 0;
  let paused = false;
  let timer = null;

  function setActiveUI(index) {
    dots.forEach((dot, i) => {
      if (i === index) {
        dot.classList.add('active');
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.classList.remove('active');
        dot.removeAttribute('aria-current');
      }
    });
  }

  function goTo(index) {
    const next = ((index % itemCount) + itemCount) % itemCount;
    const card = track.children[next];
    if (track && card) {
      const trackRect = track.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const centeredLeft =
        track.scrollLeft +
        cardRect.left -
        trackRect.left -
        (track.clientWidth - card.clientWidth) / 2;
      track.scrollTo({ left: centeredLeft, behavior: 'smooth' });
    }
    active = next;
    setActiveUI(active);
  }

  function syncActive() {
    const trackCenter = track.getBoundingClientRect().left + track.clientWidth / 2;
    let nearest = 0;
    let nearestDistance = Infinity;
    Array.from(track.children).forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const distance = Math.abs(rect.left + rect.width / 2 - trackCenter);
      if (distance < nearestDistance) {
        nearest = index;
        nearestDistance = distance;
      }
    });
    active = nearest;
    setActiveUI(active);
  }

  function restartTimer() {
    if (timer) window.clearInterval(timer);
    if (paused || itemCount < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    timer = window.setInterval(() => goTo(active + 1), 5600);
  }

  function setPaused(value) {
    paused = value;
    restartTimer();
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(active - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(active + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

  track.addEventListener('scroll', syncActive);
  track.addEventListener('pointerdown', () => setPaused(true));
  track.addEventListener('pointerup', () => setPaused(false));

  if (group) {
    group.addEventListener('mouseenter', () => setPaused(true));
    group.addEventListener('mouseleave', () => setPaused(false));
    group.addEventListener('focusin', () => setPaused(true));
    group.addEventListener('focusout', () => setPaused(false));
  }

  setActiveUI(active);
  restartTimer();
}

function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  items.forEach((el) => observer.observe(el));
}

function initQuantityStepper() {
  const input = document.getElementById('bags');
  const minus = document.getElementById('qty-minus');
  const plus = document.getElementById('qty-plus');
  if (!input || !minus || !plus) return;

  minus.addEventListener('click', () => {
    const val = Math.max(1, parseInt(input.value || '1', 10) - 5);
    input.value = val;
  });
  plus.addEventListener('click', () => {
    const val = Math.max(1, parseInt(input.value || '1', 10) + 5);
    input.value = val;
  });
}

function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const closeBtn = document.getElementById('lightbox-close');
  const triggers = document.querySelectorAll('.lightbox-img');
  if (!lightbox || !lightboxImage || !triggers.length) return;

  let lastFocused = null;

  function openLightbox(img) {
    const fullSrc = img.dataset.full || img.currentSrc || img.src;
    lightboxImage.src = fullSrc;
    lightboxImage.alt = img.alt || '';
    lastFocused = document.activeElement;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lightboxImage.src = '';
    if (lastFocused) lastFocused.focus();
  }

  triggers.forEach((img) => {
    img.addEventListener('click', () => openLightbox(img));
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', (img.alt || 'Photo') + ' — view larger');
    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(img);
      }
    });
  });

  closeBtn.addEventListener('click', closeLightbox);
  lightboxImage.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
  });
}

function initOrderForm() {
  const form = document.getElementById('order-form');
  if (!form) return;

  const MILL_PHONE = '917001237685';

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const shopName = document.getElementById('shop-name').value.trim();
    const contactPerson = document.getElementById('contact-person').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const city = document.getElementById('city').value.trim();
    const bags = document.getElementById('bags').value.trim();
    const message = document.getElementById('message').value.trim();

    const lines = [
      'New order enquiry from the website:',
      '',
      `Shop / business name: ${shopName}`,
      `Contact person: ${contactPerson}`,
      `Phone: ${phone}`,
      `City / area: ${city}`,
      `Bags required (50 KG each): ${bags}`,
    ];
    if (message) {
      lines.push(`Note: ${message}`);
    }

    const text = encodeURIComponent(lines.join('\n'));
    const url = `https://wa.me/${MILL_PHONE}?text=${text}`;
    window.open(url, '_blank', 'noopener');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initCarousel({
    trackSelector: '.plant-track',
    dotsSelector: '.plant-dots',
    prevSelector: '.plant-controls [data-action="prev"]',
    nextSelector: '.plant-controls [data-action="next"]',
    groupSelector: '.plant-gallery',
  });

  initCarousel({
    trackSelector: '.machine-track',
    dotsSelector: '.carousel-dots',
    prevSelector: '.carousel-controls [data-action="prev"]',
    nextSelector: '.carousel-controls [data-action="next"]',
    groupSelector: '.machinery-section',
  });

  initScrollReveal();
  initQuantityStepper();
  initLightbox();
  initOrderForm();
});
