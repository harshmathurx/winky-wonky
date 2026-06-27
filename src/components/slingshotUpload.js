import { AudioSynth } from './audioSynth.js';
import { prefersReducedMotion, onReducedMotionChange } from './utils.js';

export function createSlingshotUpload(options = {}) {
  const container = document.createElement('div');
  container.className = 'slingshot-container';
  container.setAttribute('role', 'button');
  container.setAttribute('aria-label', 'Upload file by dragging or clicking');
  container.tabIndex = 0;
  container.classList.add('winky-focus-visible');

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'slingshot-svg');
  svg.setAttribute('aria-hidden', 'true');

  const band = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  band.setAttribute('class', 'slingshot-band');
  svg.appendChild(band);

  const pouch = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pouch.setAttribute('class', 'slingshot-pouch');
  svg.appendChild(pouch);

  container.appendChild(svg);

  const promptText = document.createElement('span');
  promptText.style.fontWeight = '600';
  promptText.style.fontSize = '0.85rem';
  promptText.style.pointerEvents = 'none';
  promptText.textContent = 'Drag curiosity here';
  container.appendChild(promptText);

  const subText = document.createElement('span');
  subText.style.fontSize = '0.75rem';
  subText.style.opacity = '0.6';
  subText.style.pointerEvents = 'none';
  subText.style.marginTop = '4px';
  subText.textContent = '(or click to upload)';
  container.appendChild(subText);

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.style.display = 'none';
  fileInput.setAttribute('aria-hidden', 'true');
  fileInput.tabIndex = -1;
  container.appendChild(fileInput);

  let bandWidth = options.bandWidth ?? 4;
  let launchSpeed = options.launchSpeed ?? 0.65;
  let reducedMotion = prefersReducedMotion();

  const leftAnchor = { x: 25, y: 80 };
  const rightAnchor = { x: 255, y: 80 };

  function drawBand(x, y) {
    band.setAttribute('d', `M ${leftAnchor.x} ${leftAnchor.y} Q ${x} ${y} ${rightAnchor.x} ${rightAnchor.y}`);
    band.setAttribute('stroke-width', `${bandWidth}px`);
    pouch.setAttribute('d', `M ${x-12} ${y} L ${x} ${y-8} L ${x+12} ${y} L ${x} ${y+8} Z`);
  }

  function resetBand() {
    if (!reducedMotion) {
      band.style.transition = 'd 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      pouch.style.transition = 'd 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    }
    drawBand(140, 80);

    setTimeout(() => {
      band.style.transition = 'none';
      pouch.style.transition = 'none';
    }, 300);
  }

  function stretchBand(clientX, clientY) {
    const rect = container.getBoundingClientRect();
    let x = clientX - rect.left;
    let y = clientY - rect.top;

    x = Math.max(30, Math.min(250, x));
    y = Math.max(70, Math.min(150, y));

    drawBand(x, y);
    return { x, y };
  }

  function launchFile(x, y) {
    AudioSynth.playClack();

    if (!reducedMotion) {
      band.style.transition = 'd 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.4)';
      pouch.style.transition = 'd 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.4)';
      drawBand(140, 50);

      setTimeout(() => { drawBand(140, 80); }, 100);

      const flyer = document.createElement('div');
      flyer.className = 'upload-icon-flyer';
      flyer.textContent = '\u{1F4C4}';
      flyer.style.left = `${x}px`;
      flyer.style.top = `${y}px`;
      flyer.style.setProperty('--start-y', `${y}px`);
      flyer.style.animation = `catapult-launch ${launchSpeed}s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`;

      container.appendChild(flyer);

      flyer.addEventListener('animationend', () => { flyer.remove(); });
    }
  }

  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    container.classList.add('dragover');
    stretchBand(e.clientX, e.clientY);
  });

  container.addEventListener('dragleave', () => {
    container.classList.remove('dragover');
    resetBand();
  });

  container.addEventListener('drop', (e) => {
    e.preventDefault();
    container.classList.remove('dragover');
    const { x, y } = stretchBand(e.clientX, e.clientY);

    setTimeout(() => { launchFile(x, y); }, 50);
  });

  container.addEventListener('click', () => {
    fileInput.click();
  });

  container.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.click();
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      drawBand(140, 130);
      setTimeout(() => { launchFile(140, 130); }, 200);
    }
  });

  const motionListener = onReducedMotionChange(() => {
    reducedMotion = prefersReducedMotion();
  });

  drawBand(140, 80);

  container.destroy = () => {
    motionListener();
  };

  container.getControls = () => {
    return [
      { label: 'Elastic Width', type: 'range', min: 2, max: 6, step: 1, value: bandWidth, onChange: (v) => { bandWidth = parseInt(v); drawBand(140, 80); } },
      { label: 'Launch Speed', type: 'range', min: 0.3, max: 1.5, step: 0.1, value: launchSpeed, onChange: (v) => { launchSpeed = parseFloat(v); } }
    ];
  };

  container.getCodeSnippet = () => {
    return `import { createSlingshotUpload } from 'winky-wonky';

const uploader = createSlingshotUpload({
  bandWidth: 4,
  launchSpeed: 0.6
});
document.body.appendChild(uploader);`;
  };

  return container;
}
