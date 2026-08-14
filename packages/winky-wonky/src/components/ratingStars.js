import { AudioSynth } from './audioSynth.js';
import { setAria, onKeyActivation, prefersReducedMotion, onReducedMotionChange } from './utils.js';

/**
 * @typedef {Object} RatingStarsOptions
 * @property {number} [initialRating=0] - Starting rating, 0-5.
 * @property {number} [confettiCount=25] - Confetti piece count on a 5-star pick.
 * @property {string} [ariaLabel='Rating'] - Accessible name for the radiogroup.
 * @property {(i: number) => string} [starLabel] - Per-star accessible label,
 *   given the 1-based star index. Defaults to "N star(s)".
 * @property {(rating: number) => void} [onChange] - Called with the new
 *   rating whenever it changes from user interaction (never from `setValue`).
 */

/**
 * @typedef {Object} RatingStarsInstance
 * @property {HTMLElement} el - Root element; append this to the DOM.
 * @property {() => number} getValue - Current rating (0-5).
 * @property {(value: number) => void} setValue - Programmatically set the
 *   rating. Updates DOM/ARIA only — no confetti, no lock, no `onChange`.
 * @property {() => void} destroy
 * @property {{confettiCount: number}} config - Live-mutable passive knob.
 */

/**
 * Creates a 5-star rating control. Hovering previews, clicking locks in a
 * rating; a 5-star pick celebrates with confetti, a 1-star pick self-resets.
 * @param {RatingStarsOptions} [options]
 * @returns {RatingStarsInstance}
 */
export function createRatingStars(options = {}) {
  const container = document.createElement('div');
  container.className = 'winky-rating-stars-container';
  container.style.flexDirection = 'column';
  container.style.alignItems = 'center';
  container.style.width = '100%';
  container.style.position = 'relative';

  const starRow = document.createElement('div');
  starRow.className = 'winky-rating-stars-container';
  starRow.setAttribute('role', 'radiogroup');
  const ariaLabel = options.ariaLabel ?? 'Rating';
  const starLabel = options.starLabel ?? ((i) => `${i} star${i > 1 ? 's' : ''}`);
  starRow.setAttribute('aria-label', ariaLabel);
  container.appendChild(starRow);

  const confettiCanvas = document.createElement('div');
  confettiCanvas.style.position = 'absolute';
  confettiCanvas.style.width = '100%';
  confettiCanvas.style.height = '100%';
  confettiCanvas.style.top = '0';
  confettiCanvas.style.left = '0';
  confettiCanvas.style.pointerEvents = 'none';
  confettiCanvas.setAttribute('aria-hidden', 'true');
  container.appendChild(confettiCanvas);

  let rating = options.initialRating ?? 0;
  let isLocked = false;
  const config = {
    confettiCount: options.confettiCount ?? 25,
  };
  const onChange = options.onChange;
  let reducedMotion = prefersReducedMotion();
  let confettiRAF = null;

  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement('span');
    star.className = 'winky-wonky-star winky-focus-visible';
    star.textContent = '★';
    star.setAttribute('role', 'radio');
    star.setAttribute('aria-checked', rating === i ? 'true' : 'false');
    star.setAttribute('aria-label', starLabel(i));
    star.tabIndex = 0;
    star.dataset.index = String(i);
    starRow.appendChild(star);
    stars.push(star);

    star.addEventListener('pointerenter', () => {
      if (isLocked) return;
      highlightStars(i);
      AudioSynth.playTick();
    });

    star.addEventListener('pointerleave', () => {
      if (isLocked) return;
      highlightStars(rating);
    });

    star.addEventListener('click', () => {
      if (isLocked) return;
      selectRating(i);
    });

    star.addEventListener('keydown', (e) => {
      if (isLocked) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectRating(i);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        const nextIdx = Math.min(5, i + 1);
        stars[nextIdx - 1].focus();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        const prevIdx = Math.max(1, i - 1);
        stars[prevIdx - 1].focus();
      }
    });
  }

  function selectRating(i) {
    rating = i;
    isLocked = true;
    highlightStars(rating);
    stars.forEach((s, idx) => s.setAttribute('aria-checked', idx + 1 === rating ? 'true' : 'false'));

    if (onChange) onChange(rating);

    if (rating === 1) {
      AudioSynth.playTick();
      if (!reducedMotion) {
        stars.forEach((s, idx) => {
          if (idx > 0) s.classList.add('winky-collapsed');
        });
      }

      setTimeout(() => {
        stars.forEach(s => s.classList.remove('winky-collapsed'));
        rating = 0;
        highlightStars(0);
        stars.forEach(s => s.setAttribute('aria-checked', 'false'));
        isLocked = false;
        if (onChange) onChange(0);
      }, 2000);
    } else if (rating === 5) {
      AudioSynth.playClack();
      if (!reducedMotion) {
        stars.forEach((s) => {
          s.style.transition = 'transform 0.5s ease-in-out';
          s.style.transform = 'rotate(360deg) scale(1.3)';
        });
        triggerConfetti();
      }

      setTimeout(() => {
        stars.forEach((s) => {
          s.style.transform = 'none';
          s.style.transition = 'color 0.15s, transform 0.15s';
        });
        isLocked = false;
      }, 1200);
    } else {
      AudioSynth.playClack();
      isLocked = false;
    }
  }

  function highlightStars(count) {
    stars.forEach((star, idx) => {
      if (idx < count) star.classList.add('winky-active');
      else star.classList.remove('winky-active');
    });
  }

  function triggerConfetti() {
    confettiCanvas.replaceChildren();
    const colors = ['#D8A035', '#E5A9A9', '#7DB3B3', '#F37F30', '#8D5B4C'];
    const pieces = [];

    for (let i = 0; i < config.confettiCount; i++) {
      const piece = document.createElement('div');
      piece.style.position = 'absolute';
      piece.style.width = '6px';
      piece.style.height = '6px';

      const randColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.backgroundColor = randColor;
      piece.style.left = '50%';
      piece.style.bottom = '30px';
      piece.style.transform = 'translateX(-50%)';

      confettiCanvas.appendChild(piece);

      const angle = (Math.random() * 120 + 30) * Math.PI / 180;
      const speed = Math.random() * 8 + 5;
      pieces.push({
        el: piece,
        vx: Math.cos(angle) * speed,
        vy: -Math.sin(angle) * speed,
        px: 0,
        py: 0,
        gravity: 0.25,
        currVy: -Math.sin(angle) * speed,
        timer: 0,
      });
    }

    if (confettiRAF) cancelAnimationFrame(confettiRAF);

    function updateConfetti() {
      let alive = false;
      pieces.forEach((p) => {
        if (p.timer >= 40) {
          if (p.el.parentNode) p.el.remove();
          return;
        }
        alive = true;
        p.px += p.vx;
        p.currVy += p.gravity;
        p.py += p.currVy;
        p.el.style.transform = `translate(${p.px}px, ${p.py}px) rotate(${p.timer * 10}deg)`;
        p.timer++;
      });

      if (alive) {
        confettiRAF = requestAnimationFrame(updateConfetti);
      } else {
        confettiRAF = null;
      }
    }
    confettiRAF = requestAnimationFrame(updateConfetti);
  }

  highlightStars(rating);

  const motionListener = onReducedMotionChange(() => {
    reducedMotion = prefersReducedMotion();
    if (reducedMotion && confettiRAF) {
      cancelAnimationFrame(confettiRAF);
      confettiRAF = null;
      confettiCanvas.replaceChildren();
    }
  });

  function destroy() {
    if (confettiRAF) cancelAnimationFrame(confettiRAF);
    motionListener();
  }

  function getValue() {
    return rating;
  }

  function setValue(v) {
    rating = Math.max(0, Math.min(5, Math.round(v)));
    highlightStars(rating);
    stars.forEach((s, idx) => s.setAttribute('aria-checked', idx + 1 === rating ? 'true' : 'false'));
  }

  return { el: container, getValue, setValue, destroy, config };
}
