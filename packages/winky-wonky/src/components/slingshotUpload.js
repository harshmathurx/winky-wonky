import { AudioSynth } from './audioSynth.js';
import { prefersReducedMotion, onReducedMotionChange } from './utils.js';

/**
 * @typedef {Object} SlingshotUploadOptions
 * @property {string} [ariaLabel='Upload file by dragging or clicking'] -
 *   Accessible name for the drop zone.
 * @property {number} [bandWidth=4] - Slingshot band stroke width in px.
 * @property {number} [launchSpeed=0.65] - Launch animation duration in seconds.
 */

/**
 * @typedef {Object} SlingshotUploadInstance
 * @property {HTMLElement} el - Root drop-zone element (also a hidden
 *   `<input type="file">` for the click-to-upload fallback); append this to the DOM.
 * @property {() => void} destroy - Removes the reduced-motion listener.
 * @property {{bandWidth: number, launchSpeed: number}} config - Live-mutable
 *   secondary knobs; prefer `setOptions` for changes that need re-rendering.
 * @property {(partial: {bandWidth?: number, launchSpeed?: number}) => void} setOptions -
 *   Updates the band width and/or launch speed.
 */

/**
 * Creates a drag-and-drop (or click-to-upload) file target styled as a
 * slingshot: dragging over it stretches the band, dropping/selecting a
 * file launches an icon.
 * @param {SlingshotUploadOptions} [options]
 * @returns {SlingshotUploadInstance}
 */
export function createSlingshotUpload(options = {}) {
  const container = document.createElement('div');
  container.className = 'winky-slingshot-container';
  container.setAttribute('role', 'button');
  const ariaLabel = options.ariaLabel ?? 'Upload file by dragging or clicking';
  container.setAttribute('aria-label', ariaLabel);
  container.tabIndex = 0;
  container.classList.add('winky-focus-visible');

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'winky-slingshot-svg');
  svg.setAttribute('aria-hidden', 'true');

  const band = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  band.setAttribute('class', 'winky-slingshot-band');
  svg.appendChild(band);

  const pouch = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pouch.setAttribute('class', 'winky-slingshot-pouch');
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

  const config = {
    bandWidth: options.bandWidth ?? 4,
    launchSpeed: options.launchSpeed ?? 0.65,
  };
  let reducedMotion = prefersReducedMotion();

  const leftAnchor = { x: 25, y: 80 };
  const rightAnchor = { x: 255, y: 80 };

  function drawBand(x, y) {
    band.setAttribute('d', `M ${leftAnchor.x} ${leftAnchor.y} Q ${x} ${y} ${rightAnchor.x} ${rightAnchor.y}`);
    band.setAttribute('stroke-width', `${config.bandWidth}px`);
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
      flyer.className = 'winky-upload-icon-flyer';
      flyer.textContent = '\u{1F4C4}';
      flyer.style.left = `${x}px`;
      flyer.style.top = `${y}px`;
      flyer.style.setProperty('--start-y', `${y}px`);
      flyer.style.animation = `winky-catapult-launch ${config.launchSpeed}s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`;

      container.appendChild(flyer);

      flyer.addEventListener('animationend', () => { flyer.remove(); });
    }
  }

  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    container.classList.add('winky-dragover');
    stretchBand(e.clientX, e.clientY);
  });

  container.addEventListener('dragleave', () => {
    container.classList.remove('winky-dragover');
    resetBand();
  });

  container.addEventListener('drop', (e) => {
    e.preventDefault();
    container.classList.remove('winky-dragover');
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

  function destroy() {
    motionListener();
  }

  function setOptions(partial = {}) {
    if (partial.bandWidth != null) {
      config.bandWidth = partial.bandWidth;
      drawBand(140, 80);
    }
    if (partial.launchSpeed != null) {
      config.launchSpeed = partial.launchSpeed;
    }
  }

  return { el: container, destroy, config, setOptions };
}
