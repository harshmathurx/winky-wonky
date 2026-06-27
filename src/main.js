import { AudioSynth } from './components/audioSynth.js';
import { createTiltSlider } from './components/tiltSlider.js';
import { createGroovySlider } from './components/groovySlider.js';
import { createMischievousButtons } from './components/mischievousButton.js';
import { createHingeDropdown } from './components/hingeDropdown.js';
import { createTypewriterInput } from './components/typewriterInput.js';
import { createPendulumToggle } from './components/pendulumToggle.js';
import { createBalloonTooltip } from './components/balloonTooltip.js';
import { createSlimeProgress } from './components/slimeProgress.js';
import { createGrumpyModalTrigger } from './components/grumpyModal.js';
import { createRatingStars } from './components/ratingStars.js';
import { createSlinkyAccordion } from './components/slinkyAccordion.js';
import { createRotaryColorPicker } from './components/rotaryColorPicker.js';
import { createDrunkLoader } from './components/drunkLoader.js';
import { createSuspiciousEyes } from './components/suspiciousEyes.js';
import { createSlingshotUpload } from './components/slingshotUpload.js';
import { createMagneticButton } from './components/magneticButton.js';
import { createWobblyCheckbox } from './components/wobblyCheckbox.js';
import { createWobblyRadioGroup } from './components/wobblyRadioGroup.js';
import { createSpringyTabs } from './components/springyTabs.js';
import { createGravityToast } from './components/gravityToast.js';
import { createWobblySwitch } from './components/wobblySwitch.js';
import { createRippleButton } from './components/rippleButton.js';
import { createMagneticNav } from './components/magneticNav.js';
import { createElasticDragList } from './components/elasticDragList.js';

// Elements
const playgroundView = document.getElementById('playgroundView');
const tabTitle = document.getElementById('tabTitle');
const navBtns = document.querySelectorAll('.nav-btn');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const pendulumBob = document.getElementById('pendulumBob');
const themeWipe = document.getElementById('themeWipe');
const logoText = document.getElementById('logoText');

// Active tracking
let activeTab = 'tactile';
let activeComponents = [];
let hasLoadedTab = false;

// Component Config Lists
const componentsCatalog = {
  tactile: [
    {
      title: 'Tilt Seesaw Slider',
      desc: 'Hover left/right to rotate the seesaw. Under gravity, the slider knob slips down the slope. Adjust gravity strength and lag variables below.',
      generator: createTiltSlider
    },
    {
      title: 'Groove-o-Matic Slider',
      desc: 'Moves along a wavy sine track and snaps magnetically into physical notches, generating synthetic audio tick clicks and elastic bounces.',
      generator: createGroovySlider
    },
    {
      title: 'Mischievous Buttons',
      desc: 'A button suite features: cursor evasion dodging, rubbery hover squash-stretches, and a Wes Anderson-style delayed lazy key shadow.',
      generator: createMischievousButtons
    },
    {
      title: 'Pendulum Switch',
      desc: 'A lever toggle switch hanging from a mechanical bracket. Click to trigger pendulum swings that oscillate and settle under physical damping.',
      generator: createPendulumToggle
    },
    {
      title: 'Slingshot Catapult',
      desc: 'Drag-drop file/curiosity elements to stretch the elastic rubber band slingshot. Dropping triggers a catapult launch flying the file off the screen.',
      generator: createSlingshotUpload
    },
    {
      title: 'Magnetic Putty Button',
      desc: 'Stretches and pulls itself toward the cursor like magnetic putty, playing a low-frequency vacuum hum that gets louder as the mouse draws closer.',
      generator: createMagneticButton
    },
    {
      title: 'Wobbly Checkbox',
      desc: 'A hand-drawn checkbox. Checking triggers wobbly scaling tremors and draws a shaky tick mark with vector stroke animations.',
      generator: createWobblyCheckbox
    }
  ],
  dynamic: [
    {
      title: 'Typewriter Jitter Input',
      desc: 'A text box with hand-drawn borders. Typing rattles the container frame and shoots characters up into a staggered wobbly preview.',
      generator: createTypewriterInput
    },
    {
      title: 'Helium Balloon Tooltip',
      desc: 'Hover to inflate a balloon tooltip. The balloon sways gently under gravity, tethered by an organic wavy SVG path string.',
      generator: createBalloonTooltip
    },
    {
      title: 'Swinging Hinge Dropdown',
      desc: 'Click select trigger to drop and swing the menu on a top hinge corner, swaying back and forth like an old wooden shop sign.',
      generator: createHingeDropdown
    },
    {
      title: 'Slinky Springs Accordion',
      desc: 'Accordion tabs expand using custom spring curves, bouncing and overshooting their target content boundaries.',
      generator: createSlinkyAccordion
    },
    {
      title: 'Drunk Loader Spinner',
      desc: 'Spins irregularly—decelerating, wobbling off-center, and reversing direction to catch up, playing uneven clockwork ticking sounds.',
      generator: createDrunkLoader
    },
    {
      title: 'Suspicious Password Eye',
      desc: 'Eyes follow cursor coordinates across the screen, lock onto typing carets when active, and dilate in shock on password reveal.',
      generator: createSuspiciousEyes
    }
  ],
  gothic: [
    {
      title: 'Slime Meltdown Progress',
      desc: 'Progress bar fills normally. Click "Melt" to trigger gravity-driven drips of viscous organic slime falling off the fill edge.',
      generator: createSlimeProgress
    },
    {
      title: 'Self-Conscious Stars',
      desc: 'Stars blush and wobble on hover. Low ratings collapse and spin down off-screen; five stars celebrate with spinning loops and color confetti.',
      generator: createRatingStars
    },
    {
      title: 'Notice Grumpy Modal',
      desc: 'Launches a modal that drops on a ceiling spring. Clicking outside to dismiss triggers a buzzer sound and angry head shakes.',
      generator: createGrumpyModalTrigger
    },
    {
      title: 'Rotary Theme Dial',
      desc: 'A vintage dial selector. Click number slots to rotate the dial mechanical-style, click-shifting dashboard color sub-theme variables.',
      generator: createRotaryColorPicker
    }
  ],
  system: [
    {
      title: 'Wobbly Radio Group',
      desc: 'A segmented radio group with a spring-animated selection indicator that slides between options.',
      generator: createWobblyRadioGroup
    },
    {
      title: 'Springy Tabs',
      desc: 'A tab interface with a spring-animated underline indicator and gentle panel transitions.',
      generator: createSpringyTabs
    },
    {
      title: 'Gravity Toast',
      desc: 'Toast notifications that drop in with gravity settling and slide out on dismiss. Auto-expiring with close button.',
      generator: createGravityToast
    },
    {
      title: 'Wobbly Switch',
      desc: 'An iOS-style toggle switch with spring overshoot on the thumb. Keyboard accessible with ARIA switch role.',
      generator: createWobblySwitch
    },
    {
      title: 'Ripple Button',
      desc: 'A button with a material-style ripple effect that originates from the click point. Haptic clack on press.',
      generator: createRippleButton
    },
    {
      title: 'Magnetic Navigation',
      desc: 'A navigation bar with magnetic cursor attraction and a sliding active indicator. Keyboard navigable.',
      generator: createMagneticNav
    },
    {
      title: 'Elastic Drag List',
      desc: 'A reorderable list with drag-and-drop. Items have elastic visual feedback. Alt+Arrow keys for keyboard reordering.',
      generator: createElasticDragList
    }
  ]
};

// Render component card with Demo frame, controls and copy code inspectors
function renderCard(data) {
  const card = document.createElement('div');
  card.className = 'component-card';

  // Header
  const header = document.createElement('div');
  header.className = 'component-header';
  
  const title = document.createElement('h3');
  title.className = 'component-title';
  title.textContent = data.title;
  header.appendChild(title);
  card.appendChild(header);

  // Description
  const desc = document.createElement('p');
  desc.className = 'component-desc';
  desc.textContent = data.desc;
  card.appendChild(desc);

  // Demo Frame
  const demoFrame = document.createElement('div');
  demoFrame.className = 'demo-frame';
  
  // Initialize component node
  const componentNode = data.generator();
  demoFrame.appendChild(componentNode);
  card.appendChild(demoFrame);
  activeComponents.push(componentNode);

  // Controls Panel
  if (componentNode.getControls) {
    const controls = componentNode.getControls();
    if (controls && controls.length > 0) {
      const ctrlPanel = document.createElement('div');
      ctrlPanel.className = 'controls-panel';
      
      const ctrlTitle = document.createElement('div');
      ctrlTitle.className = 'controls-title';
      ctrlTitle.innerHTML = '<span>Parameters</span><span>⚙</span>';
      ctrlPanel.appendChild(ctrlTitle);

      controls.forEach((c) => {
        const row = document.createElement('div');
        row.className = 'control-row';

        const label = document.createElement('label');
        label.textContent = c.label;
        row.appendChild(label);

        if (c.type === 'range') {
          const input = document.createElement('input');
          input.type = 'range';
          input.className = 'control-input';
          input.style.width = '100px';
          input.min = c.min;
          input.max = c.max;
          input.step = c.step;
          input.value = c.value;
          
          input.addEventListener('input', (e) => {
            c.onChange(e.target.value);
          });
          row.appendChild(input);
        } else if (c.type === 'checkbox') {
          const input = document.createElement('input');
          input.type = 'checkbox';
          input.checked = c.value;
          input.addEventListener('change', (e) => {
            c.onChange(e.target.checked);
          });
          row.appendChild(input);
        } else if (c.type === 'select') {
          const select = document.createElement('select');
          select.className = 'control-input';
          select.style.width = '100px';
          c.options.forEach(opt => {
            const o = document.createElement('option');
            o.value = opt;
            o.textContent = opt;
            if (opt === c.value) o.selected = true;
            select.appendChild(o);
          });
          select.addEventListener('change', (e) => {
            c.onChange(e.target.value);
          });
          row.appendChild(select);
        } else if (c.type === 'text') {
          const input = document.createElement('input');
          input.type = 'text';
          input.className = 'control-input';
          input.style.width = '120px';
          input.value = c.value;
          input.addEventListener('input', (e) => {
            c.onChange(e.target.value);
          });
          row.appendChild(input);
        } else if (c.type === 'button') {
          const btn = document.createElement('button');
          btn.className = 'control-input';
          btn.style.width = '100px';
          btn.style.cursor = 'pointer';
          btn.textContent = c.value;
          btn.addEventListener('click', c.onChange);
          row.appendChild(btn);
        }

        ctrlPanel.appendChild(row);
      });
      card.appendChild(ctrlPanel);
    }
  }

  // Code Inspector
  if (componentNode.getCodeSnippet) {
    const codeInspector = document.createElement('div');
    codeInspector.className = 'code-inspector';

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'code-toggle-btn';
    toggleBtn.innerHTML = '<span>Show HTML/CSS</span><span>⟨/⟩</span>';
    
    const codeContainer = document.createElement('div');
    codeContainer.className = 'code-container';
    
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.textContent = componentNode.getCodeSnippet();
    pre.appendChild(code);
    codeContainer.appendChild(pre);

    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = 'Copy';
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(componentNode.getCodeSnippet());
      copyBtn.textContent = 'Copied!';
      AudioSynth.playTick();
      setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1500);
    });
    codeContainer.appendChild(copyBtn);

    toggleBtn.addEventListener('click', () => {
      AudioSynth.playClack();
      codeContainer.classList.toggle('show');
      toggleBtn.querySelector('span').textContent = codeContainer.classList.contains('show') ? 'Hide Code' : 'Show HTML/CSS';
    });

    codeInspector.appendChild(toggleBtn);
    codeInspector.appendChild(codeContainer);
    card.appendChild(codeInspector);
  }

  return card;
}

// Load catalog matching tab key
function loadTab(tabKey) {
  // Call destructors to avoid background rendering cycles
  activeComponents.forEach((c) => {
    if (c.destroy) c.destroy();
  });
  activeComponents = [];
  
  playgroundView.replaceChildren();

  const list = componentsCatalog[tabKey] || [];
  list.forEach((data) => {
    const card = renderCard(data);
    playgroundView.appendChild(card);
  });

  // Capitalize title
  tabTitle.textContent = tabKey.charAt(0).toUpperCase() + tabKey.slice(1) + ' Elements';
}

// Nav Click Listeners
navBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    AudioSynth.playClack();
    const target = btn.dataset.tab;
    if (target === activeTab) return;

    // Shift active nav tab class
    document.querySelector('.nav-btn.active').classList.remove('active');
    btn.classList.add('active');

    activeTab = target;
    loadTab(activeTab);
  });
});

// Theme Pendulum Swapper — cycles: dark → anderson → burton → dark
let currentTheme = 'dark';

const themeCycle = ['dark', 'anderson', 'burton'];
const themeLabels = { dark: 'Winky Wonky', anderson: 'Winky Anderson', burton: 'Winky Burton' };
const themeIcons = { dark: '\u25C9', anderson: '\u2600', burton: '\u263E' };

themeToggleBtn.addEventListener('click', () => {
  if (themeWipe.classList.contains('wipe')) return;
  
  AudioSynth.playClack();
  themeWipe.classList.add('wipe');

  setTimeout(() => {
    const currentIdx = themeCycle.indexOf(currentTheme);
    const nextTheme = themeCycle[(currentIdx + 1) % themeCycle.length];
    setGlobalTheme(nextTheme);
    AudioSynth.playTick();
  }, 250);

  themeWipe.addEventListener('animationend', () => {
    themeWipe.classList.remove('wipe');
  }, { once: true });
});

function setGlobalTheme(theme) {
  currentTheme = theme;
  const root = document.documentElement;
  
  if (theme === 'dark') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }
  root.removeAttribute('style');

  pendulumBob.textContent = themeIcons[theme] || themeIcons.dark;
  logoText.textContent = themeLabels[theme] || themeLabels.dark;

  setTimeout(syncSettingsInputs, 100);
}

// Keep bob symbol in sync with color dialer
window.addEventListener('theme-changed', (e) => {
  const newTheme = e.detail;
  currentTheme = newTheme;
  pendulumBob.textContent = themeIcons[newTheme] || themeIcons.dark;
  logoText.textContent = themeLabels[newTheme] || themeLabels.dark;
    logoText.textContent = themeLabels[newTheme] || themeLabels.dark;
  setTimeout(syncSettingsInputs, 100);
});

// Settings inputs binding
const muteToggle = document.getElementById('muteToggle');
const volumeRange = document.getElementById('volumeRange');
const accentColorInput = document.getElementById('accentColorInput');
const bgColorInput = document.getElementById('bgColorInput');

muteToggle.addEventListener('change', (e) => {
  if (e.target.checked) {
    AudioSynth.mute();
  } else {
    AudioSynth.unmute();
  }
});

volumeRange.addEventListener('input', (e) => {
  AudioSynth.setVolume(parseFloat(e.target.value));
});

accentColorInput.addEventListener('input', (e) => {
  const hex = e.target.value;
  const rgb = hexToRgb(hex);
  document.documentElement.style.setProperty('--winky-accent-color', hex);
  if (rgb) {
    document.documentElement.style.setProperty('--winky-accent-glow', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`);
  }
});

bgColorInput.addEventListener('input', (e) => {
  const hex = e.target.value;
  document.documentElement.style.setProperty('--winky-bg-primary', hex);
});

function hexToRgb(hex) {
  const match = hex.match(/^#?([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i);
  if (!match) return null;
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16),
  };
}

function syncSettingsInputs() {
  const rootStyle = getComputedStyle(document.documentElement);
  const accent = rootStyle.getPropertyValue('--winky-accent-color').trim();
  const bg = rootStyle.getPropertyValue('--winky-bg-primary').trim();
  
  if (accent) accentColorInput.value = formatHex(accent);
  if (bg) bgColorInput.value = formatHex(bg);
}

function formatHex(colorStr) {
  if (colorStr.startsWith('#')) return colorStr;
  
  const match = colorStr.match(/\d+/g);
  if (match && match.length >= 3) {
    const r = parseInt(match[0]).toString(16).padStart(2, '0');
    const g = parseInt(match[1]).toString(16).padStart(2, '0');
    const b = parseInt(match[2]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }
  return '#6366F1'; 
}

// ==========================================
// HERO LANDING & GALLERY NAVIGATION
// ==========================================

const heroLanding = document.getElementById('heroLanding');
const appContainer = document.getElementById('appContainer');
const gallerySection = document.getElementById('gallerySection');
const enterPlaygroundBtn = document.getElementById('enterPlaygroundBtn');
const enterGalleryBtn = document.getElementById('enterGalleryBtn');
const galleryBackBtn = document.getElementById('galleryBackBtn');
const heroCopyBtn = document.getElementById('heroCopyBtn');

function showPlayground() {
  heroLanding.classList.add('hidden');
  gallerySection.classList.add('hidden');
  gallerySection.style.display = 'none';
  setTimeout(() => {
    appContainer.style.display = 'flex';
    heroLanding.style.display = 'none';
    if (!hasLoadedTab) {
      loadTab('tactile');
      hasLoadedTab = true;
      setTimeout(syncSettingsInputs, 100);
    }
  }, 500);
}

function showGallery() {
  heroLanding.classList.add('hidden');
  appContainer.style.display = 'none';
  gallerySection.style.display = 'block';
  gallerySection.classList.remove('hidden');
  renderGallery();
  setTimeout(() => {
    heroLanding.style.display = 'none';
  }, 500);
}

function showLanding() {
  appContainer.style.display = 'none';
  gallerySection.style.display = 'none';
  gallerySection.classList.add('hidden');
  heroLanding.style.display = 'flex';
  heroLanding.classList.remove('hidden');
}

enterPlaygroundBtn.addEventListener('click', () => {
  AudioSynth.playClack();
  showPlayground();
});

enterGalleryBtn.addEventListener('click', () => {
  AudioSynth.playClack();
  showGallery();
});

galleryBackBtn.addEventListener('click', () => {
  AudioSynth.playClack();
  showLanding();
});

heroCopyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText('npm install winky-wonky');
  heroCopyBtn.textContent = 'Copied!';
  heroCopyBtn.classList.add('copied');
  AudioSynth.playTick();
  setTimeout(() => {
    heroCopyBtn.textContent = 'Copy';
    heroCopyBtn.classList.remove('copied');
  }, 1500);
});

// ==========================================
// GALLERY SUBMISSION SYSTEM
// ==========================================

const galleryGrid = document.getElementById('galleryGrid');
const galleryEmpty = document.getElementById('galleryEmpty');
const galleryUrlInput = document.getElementById('galleryUrlInput');
const galleryTitleInput = document.getElementById('galleryTitleInput');
const gallerySubmitBtn = document.getElementById('gallerySubmitBtn');

const GALLERY_STORAGE_KEY = 'winky-wonky-gallery';

const seedSubmissions = [
  { title: 'Peculiar Pastel Portfolio', url: 'https://example.com/pastel', emoji: '\u{1F3A8}' },
  { title: 'Burton Bug Tracker', url: 'https://example.com/bugs', emoji: '\u{1F41B}' },
  { title: 'Grand Budapest Forms', url: 'https://example.com/forms', emoji: '\u{1F3E8}' },
];

function loadGallerySubmissions() {
  try {
    const stored = localStorage.getItem(GALLERY_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return [...seedSubmissions];
}

function saveGallerySubmissions(submissions) {
  try {
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(submissions));
  } catch (e) {}
}

function renderGallery() {
  const submissions = loadGallerySubmissions();
  galleryGrid.replaceChildren();

  if (submissions.length === 0) {
    galleryEmpty.style.display = 'block';
    return;
  }
  galleryEmpty.style.display = 'none';

  const emojis = ['\u{1F3A8}', '\u{1F41B}', '\u{1F3E8}', '\u{1F9F8}', '\u{1F381}', '\u{1FAA6}', '\u{1F52D}', '\u{1F576}'];

  submissions.forEach((sub) => {
    const card = document.createElement('a');
    card.className = 'gallery-card winky-focus-visible';
    card.href = sub.url;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';

    const thumb = document.createElement('div');
    thumb.className = 'gallery-card-thumb';
    thumb.textContent = sub.emoji || emojis[Math.floor(Math.random() * emojis.length)];
    card.appendChild(thumb);

    const title = document.createElement('div');
    title.className = 'gallery-card-title';
    title.textContent = sub.title;
    card.appendChild(title);

    const url = document.createElement('div');
    url.className = 'gallery-card-url';
    url.textContent = sub.url;
    card.appendChild(url);

    galleryGrid.appendChild(card);
  });
}

gallerySubmitBtn.addEventListener('click', () => {
  const url = galleryUrlInput.value.trim();
  const title = galleryTitleInput.value.trim();

  if (!url || !title) {
    AudioSynth.playClack();
    return;
  }

  const submissions = loadGallerySubmissions();
  const emojis = ['\u{1F3A8}', '\u{1F41B}', '\u{1F3E8}', '\u{1F9F8}', '\u{1F381}', '\u{1FAA6}', '\u{1F52D}', '\u{1F576}'];
  submissions.unshift({
    title,
    url,
    emoji: emojis[Math.floor(Math.random() * emojis.length)],
  });
  saveGallerySubmissions(submissions);

  galleryUrlInput.value = '';
  galleryTitleInput.value = '';

  AudioSynth.playClack();
  renderGallery();
});

galleryUrlInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') gallerySubmitBtn.click();
});
galleryTitleInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') gallerySubmitBtn.click();
});

// ==========================================
// SCROLL ON HERO → ENTER PLAYGROUND
// ==========================================

heroLanding.addEventListener('wheel', (e) => {
  if (e.deltaY > 30) {
    showPlayground();
  }
}, { passive: true });

// Bootstrap
setTimeout(syncSettingsInputs, 200);
console.log('Winky Wonky design system initialized successfully!');

