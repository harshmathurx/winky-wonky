# Technical Audit & Architecture

> Findings from the initial codebase audit before the polish pass.

## Codebase State (Pre-Polish)

**18 components, all vanilla JS factory functions:**

| Component | File | Physics | Audio |
|---|---|---|---|
| Tilt Seesaw Slider | `tiltSlider.js` | Gravity-driven tilt + spring lag | startSlide |
| Groove-o-Matic Slider | `groovySlider.js` | Sine wave track + magnetic notch snap | playTick |
| Mischievous Buttons | `mischievousButton.js` | Cursor evasion dodge + squash/stretch | playTick, playClack |
| Pendulum Switch | `pendulumToggle.js` | Damped pendulum swing | playTick, playClack |
| Slingshot Upload | `slingshotUpload.js` | Elastic band drag + catapult launch | playSnap |
| Magnetic Putty Button | `magneticButton.js` | Magnetic pull + skew deformation | startHum |
| Wobbly Checkbox | `wobblyCheckbox.js` | Jitter scale + SVG tick draw | playClack, playTick |
| Typewriter Input | `typewriterInput.js` | Keystroke jitter + char projection | playClack, playSqueak |
| Helium Balloon Tooltip | `balloonTooltip.js` | Balloon float + sway | playPop |
| Hinge Dropdown | `hingeDropdown.js` | Hinge swing open | playSqueak, playTick, playClack |
| Slinky Accordion | `slinkyAccordion.js` | Spring overshoot | playClack, playSqueak |
| Drunk Loader | `drunkLoader.js` | Irregular spin + wobble | playTick |
| Suspicious Eyes | `suspiciousEyes.js` | Pupil tracking + shock dilation | playBlink |
| Slime Progress | `slimeProgress.js` | Gravity drip melt | playSplat |
| Grumpy Modal | `grumpyModal.js` | Spring drop + angry shake | playSqueak, playBuzz, playClack |
| Rating Stars | `ratingStars.js` | Collapse + spin + confetti physics | playSqueak, playPop, playClack |
| Rotary Color Picker | `rotaryColorPicker.js` | Mechanical dial rotation | playTick, playClack, playSqueak |
| Audio Synth | `audioSynth.js` | — | All sound synthesis |

## Critical Issues Found

### 1. Zero Accessibility
- No ARIA roles, labels, or states on any component
- No keyboard navigation — everything mouse-only (`mousedown`/`mousemove`)
- No `prefers-reduced-motion` respect
- No `prefers-reduced-sound` respect
- No focus management (modals, dropdowns)

### 2. No Touch Support
- All drag interactions use `mousedown`/`mousemove`/`mouseup`
- Mobile/tablet completely broken
- No `touch-action` declarations

### 3. Memory Leaks
- `hingeDropdown.js`: Adds `document.addEventListener('click', ...)` but never removes it on destroy
- `tiltSlider.js`: RAF loop runs forever, even when component is destroyed (cancelAnimationFrame called, but loop never terminates cleanly)
- `ratingStars.js`: Spawns 25+ individual RAF loops for confetti — one per piece
- `suspiciousEyes.js`: `window.addEventListener('mousemove')` added but only removed in destroy (which is called, but fragile)

### 4. `grumpyModal.js` Architecturally Broken
- Depends on global DOM IDs (`grumpyModalOverlay`, `grumpyModalBox`, `grumpyModalCloseBtn`)
- Uses `cloneNode(true)` hack to "reset" event listeners — fragile and breaks if instantiated twice
- Modal HTML hardcoded in `index.html` — not self-contained
- No focus trap, no Escape key handling, no ARIA dialog semantics

### 5. Not a Real Package
- `package.json` has `"private": true`, no `main`/`exports`/`files`/`keywords`
- Cannot be `npm install`'d
- No library entry point (`src/index.js`)

### 6. Global Listener Pollution
- `audioSynth.js`: Adds `document.addEventListener('click', ...)` at import time — runs as a side effect of importing the module
- `hingeDropdown.js`: Each instance adds a `document` click listener — multiple dropdowns fight each other

## Architecture (Post-Polish)

### Shared Utils (`utils.js`)
- `prefersReducedMotion()`, `prefersReducedSound()`, `isCoarsePointer()` — media query helpers
- `onReducedMotionChange(cb)` — returns cleanup function
- `setAria(el, attrs)` — batch ARIA attribute setter
- `makeFocusable(el)` — adds tabindex if missing
- `onKeyActivation(el, handler)` — Enter/Space activation
- `trapFocus(container)` — focus trap for modals, returns `{ activate(), release() }`
- `addPointerDrag(target, opts)` — unified pointer/touch drag handler, returns cleanup function

### Audio Synth (`audioSynth.js`)
- Gates audio until user interaction (browser autoplay policy)
- Respects `prefers-reduced-sound`
- Two sounds only: `playTick` (800→400Hz, 25ms), `playClack` (200→100Hz, 35ms)
- `startSlide()` and `startHum()` — continuous sounds with update/stop pattern
- Default volume: 0.15

### Component Pattern
Every component factory returns a DOM node with:
- `.destroy()` — cleanup (RAF, listeners, audio)
- `.getControls()` — returns array of control configs for the playground
- `.getCodeSnippet()` — returns example code string

### Theme System
- `:root` = Dark Premium (default, no data-theme attribute)
- `[data-theme="anderson"]` = Wes Anderson preset
- `[data-theme="burton"]` = Tim Burton preset
- All tokens use `--winky-*` prefix
- Theme pendulum cycles: dark → anderson → burton → dark
