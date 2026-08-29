function initCarousel({ trackSelector, dotsSelector, prevSelector, nextSelector, itemCount, delay, groupSelector }) {
  const track = document.querySelector(trackSelector);
  const dotsContainer = dotsSelector ? document.querySelector(dotsSelector) : null;
  const prevBtn = document.querySelector(prevSelector);
  const nextBtn = document.querySelector(nextSelector);
  const group = groupSelector ? document.querySelector(groupSelector) : track;
  if (!track) return;

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
    timer = window.setInterval(() => goTo(active + 1), delay);
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

document.addEventListener('DOMContentLoaded', () => {
  initCarousel({
    trackSelector: '.plant-track',
    dotsSelector: '.plant-dots',
    prevSelector: '.plant-controls [data-action="prev"]',
    nextSelector: '.plant-controls [data-action="next"]',
    itemCount: document.querySelectorAll('.plant-slide').length,
    delay: 6000,
    groupSelector: '.plant-gallery',
  });

  initCarousel({
    trackSelector: '.machine-track',
    dotsSelector: '.carousel-dots',
    prevSelector: '.carousel-controls [data-action="prev"]',
    nextSelector: '.carousel-controls [data-action="next"]',
    itemCount: document.querySelectorAll('.machine-card').length,
    delay: 5200,
    groupSelector: '.machinery-section',
  });
});
