import { AudioSynth } from './audioSynth.js';
import { setAria, onKeyActivation, prefersReducedMotion, onReducedMotionChange } from './utils.js';

export function createRatingStars(options = {}) {
  const container = document.createElement('div');
  container.className = 'rating-stars-container';
  container.style.flexDirection = 'column';
  container.style.alignItems = 'center';
  container.style.width = '100%';
  container.style.position = 'relative';

  const starRow = document.createElement('div');
  starRow.className = 'rating-stars-container';
  starRow.setAttribute('role', 'radiogroup');
  starRow.setAttribute('aria-label', 'Rating');
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
  let confettiCount = options.confettiCount ?? 25;
  const onChange = options.onChange;
  let reducedMotion = prefersReducedMotion();
  let confettiRAF = null;

  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement('span');
    star.className = 'wonky-star winky-focus-visible';
    star.textContent = '\u2605';
    star.setAttribute('role', 'radio');
    star.setAttribute('aria-checked', rating === i ? 'true' : 'false');
    star.setAttribute('aria-label', `${i} star${i > 1 ? 's' : ''}`);
    star.tabIndex = 0;
    star.dataset.index = i;
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
          if (idx > 0) s.classList.add('collapsed');
        });
      }

      setTimeout(() => {
        stars.forEach(s => s.classList.remove('collapsed'));
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
      if (idx < count) star.classList.add('active');
      else star.classList.remove('active');
    });
  }

  function triggerConfetti() {
    confettiCanvas.replaceChildren();
    const colors = ['#D8A035', '#E5A9A9', '#7DB3B3', '#F37F30', '#8D5B4C'];
    const pieces = [];

    for (let i = 0; i < confettiCount; i++) {
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

  container.destroy = () => {
    if (confettiRAF) cancelAnimationFrame(confettiRAF);
    motionListener();
  };

  container.getControls = () => {
    return [
      { label: 'Confetti Density', type: 'range', min: 10, max: 50, step: 5, value: confettiCount, onChange: (v) => { confettiCount = parseInt(v); } }
    ];
  };

  container.getCodeSnippet = () => {
    return `import { createRatingStars } from 'winky-wonky';

const stars = createRatingStars({
  initialRating: 3,
  confettiCount: 30,
  onChange: (rating) => console.log('Current stars count: ', rating)
});
document.body.appendChild(stars);`;
  };

  return container;
}
