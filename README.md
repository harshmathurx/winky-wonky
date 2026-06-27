# Winky-Wonky Design System

A whimsical, physics-based, audio-synthesized design system inspired by the aesthetics of Wes Anderson and Tim Burton. It replaces standard rigid UI elements with wobbly buttons, seesawing volume sliders, gravity pendulums, wobbly text fields, and slingshot upload catapults.

**18 components. Zero dependencies. 100% vanilla JS. Fully accessible.**

---

## Installation

```bash
npm install winky-wonky
```

Or using React:

```bash
npm install winky-wonky winky-wonky-react
```

---

## Quick Start

### Vanilla JS

```javascript
import 'winky-wonky/style.css';
import { createTiltSlider } from 'winky-wonky';

const slider = createTiltSlider({
  initialValue: 40,
  gravity: 0.7,
  maxTilt: 20,
  onChange: (value) => console.log('Volume:', value)
});

document.getElementById('app').appendChild(slider);
```

### React

```jsx
import 'winky-wonky/style.css';
import { TiltSlider } from 'winky-wonky-react';

function App() {
  return (
    <TiltSlider
      initialValue={40}
      gravity={0.7}
      onChange={(value) => console.log('Volume:', value)}
    />
  );
}
```

---

## Accessibility

Winky-Wonky is built to be usable by everyone. Every component includes:

- **ARIA roles & labels** — sliders, switches, checkboxes, dialogs, tooltips, progressbars all use correct semantics
- **Keyboard navigation** — all interactive components are operable with Tab, Arrow keys, Enter, Space, Escape, Home, End
- **`prefers-reduced-motion`** — all wobble, jiggle, shake, and float animations are automatically disabled when the user requests reduced motion. Components remain fully functional, just without the physics flourish
- **`prefers-reduced-sound`** — all synthesized audio (ticks, clacks, squeaks, pops) is automatically silenced
- **`pointer: coarse` (touch)** — components work on touch devices with proper `touch-action` handling
- **Focus visibility** — keyboard focus is shown with a clear accent-color outline

---

## CSS Variables API

All visual tokens are namespaced with `--winky-` to prevent collisions. Override in your global CSS:

```css
:root {
  --winky-bg-primary: #FFFFFF;
  --winky-bg-secondary: #F7F7FA;
  --winky-accent-color: #FF0055;
  --winky-text-primary: #1E1F22;
  --winky-border-radius: 8px;
  --winky-border-style: 2px solid var(--winky-text-primary);
  --winky-box-shadow: 4px 4px 0px 0px var(--winky-text-primary);
}
```

### Available Variables

| Variable | Description |
|---|---|
| `--winky-bg-primary` | Primary cards/backgrounds |
| `--winky-bg-secondary` | Slider tracks, drop zones, wells |
| `--winky-accent-color` | Primary interactive accent |
| `--winky-accent-alt` | Hover states, trigger buttons |
| `--winky-accent-teal` | Secondary accents, progress fills |
| `--winky-text-primary` | Main text and label color |
| `--winky-border-color` | Border strokes |
| `--winky-border-radius` | Corner rounding (supports wobbly radii) |
| `--winky-border-style` | Border style (`2px dashed` or `2px solid`) |
| `--winky-box-shadow` | Card offset shadows |
| `--winky-transition-speed` | Standard animation timing |

### Built-in Themes

```html
<html data-theme="anderson"> <!-- Wes Anderson: pastel, warm, serif -->
<html data-theme="burton">   <!-- Tim Burton: dark, gothic, monospace -->
```

---

## Global Audio Settings

All sounds are synthesized via the Web Audio API — no audio files, zero network requests.

```javascript
import { AudioSynth } from 'winky-wonky';

AudioSynth.mute();
AudioSynth.unmute();
AudioSynth.setVolume(0.35);  // 0.0 to 1.0
```

Audio is automatically gated until user interaction (browser autoplay policy) and respects `prefers-reduced-sound`.

---

## Component Reference

### `createTiltSlider(options)`
A seesaw slider that tilts under your cursor. The knob slides down the slope under gravity.

| Option | Default | Description |
|---|---|---|
| `initialValue` | `50` | Start percentage |
| `gravity` | `0.4` | Pull speed down the slope |
| `maxTilt` | `15` | Maximum tilt in degrees |
| `springLag` | `0.2` | Drag spring elasticity |
| `onChange(value)` | — | Callback |

**ARIA:** `role="slider"`, keyboard: Arrow keys, Home, End

### `createGroovySlider(options)`
A slider that rides a sine wave track and snaps magnetically into notches.

| Option | Default | Description |
|---|---|---|
| `initialValue` | `20` | Start percentage |
| `notchCount` | `8` | Number of snapping notches |
| `waveAmplitude` | `18` | Wave peak height |
| `snapThreshold` | `3.5` | Magnetic snap radius |
| `onChange(value)` | — | Callback |

**ARIA:** `role="slider"`, keyboard: Arrow keys, Home, End

### `createMischievousButtons(options)`
Three buttons: a dodger that evades your cursor, a squash-stretch, and a lazy-shadow tactile press.

| Option | Default | Description |
|---|---|---|
| `isDodgeEnabled` | `true` | Enable cursor evasion |
| `dodgePower` | `0.8` | Evasion speed multiplier |
| `maxDodgeRange` | `75` | Evasion radius limit (px) |
| `onClick(type)` | — | Callback (`'dodge'`, `'squash'`, `'lazy-shadow'`) |

**ARIA:** Buttons with labels. Dodge disabled under reduced-motion.

### `createHingeDropdown(options)`
A dropdown that swings open from a hinge like a wooden shop sign.

| Option | Default | Description |
|---|---|---|
| `label` | `'Select Curiosity'` | Button text |
| `options` | preset list | Array of option strings |
| `hingeOrigin` | `'top left'` | Hinge corner |
| `swingSpeed` | `1.8` | Swing duration (seconds) |
| `onSelect(value)` | — | Callback |

**ARIA:** `aria-haspopup="listbox"`, `role="listbox"`, keyboard: Arrow keys, Enter, Escape

### `createTypewriterInput(options)`
A text input that jitters on each keystroke and projects characters into a floating preview.

| Option | Default | Description |
|---|---|---|
| `placeholder` | `'Type something peculiar...'` | Placeholder text |
| `jitterStrength` | `3` | Shake intensity (px) |
| `maxWobbleRotation` | `12` | Character wobble (degrees) |
| `onChange(value)` | — | Callback |

**ARIA:** Labelled input. Jitter disabled under reduced-motion.

### `createPendulumToggle(options)`
A toggle switch hanging from a bracket. Click to swing it to the other side with physics damping.

| Option | Default | Description |
|---|---|---|
| `initialState` | `false` | Initial on/off state |
| `damping` | `0.5` | Physics damping factor |
| `swingTime` | `1.4` | Swing duration (seconds) |
| `onChange(isOn)` | — | Callback |

**ARIA:** `role="switch"`, `aria-checked`, keyboard: Enter, Space

### `createBalloonTooltip(options)`
A helium balloon tooltip that inflates on hover/focus and sways on a wavy string.

| Option | Default | Description |
|---|---|---|
| `text` | `'Curiosity Box!'` | Tooltip text |
| `stringLength` | `25` | Balloon string length (px) |
| `triggerNode` | auto-created | Custom trigger element |

**ARIA:** `role="tooltip"`, `aria-describedby`. Shows on hover AND focus.

### `createSlimeProgress(options)`
A progress bar that can melt — viscous slime drips fall off the fill edge.

| Option | Default | Description |
|---|---|---|
| `initialProgress` | `35` | Start percentage |
| `meltDuration` | `1.5` | Drip animation duration (seconds) |
| `onMeltComplete(pct)` | — | Callback |

**ARIA:** `role="progressbar"`, `aria-valuenow`

### `createGrumpyModalTrigger(options)`
A modal that drops on a spring. Clicking outside to dismiss triggers an angry shake + buzzer.

| Option | Default | Description |
|---|---|---|
| `headerText` | `'Peculiar Notice!'` | Modal title |
| `bodyText` | preset | Modal body text |
| `buttonText` | `'Dismiss Me'` | Close button text |
| `onClose()` | — | Callback |

**ARIA:** `role="dialog"`, `aria-modal`, focus trap, Escape triggers shake (not close). Self-contained — no global DOM dependencies.

### `createRatingStars(options)`
Star rating where low ratings collapse and fall, five stars trigger confetti.

| Option | Default | Description |
|---|---|---|
| `initialRating` | `0` | Initial star count |
| `confettiCount` | `25` | Confetti pieces on 5-star |
| `onChange(rating)` | — | Callback |

**ARIA:** `role="radiogroup"`, `role="radio"`, keyboard: Arrow keys, Enter

### `createSlinkyAccordion(options)`
Accordion that bounces open with spring overshoot.

| Option | Default | Description |
|---|---|---|
| `items` | preset | Array of `{ title, content }` |
| `springBounciness` | `1.35` | Spring overshoot factor |
| `transitionDuration` | `0.45` | Open/close duration (seconds) |

**ARIA:** `aria-expanded`, `role="region"`, keyboard: Arrow keys, Home, End

### `createRotaryColorPicker(options)`
A vintage rotary dial that selects color palettes with mechanical rotation.

| Option | Default | Description |
|---|---|---|
| `palettes` | 4 built-in | Array of palette objects |
| `onDialComplete(palette)` | — | Callback |

**ARIA:** `role="radiogroup"`, `role="radio"`, keyboard: Arrow keys, Enter

### `createDrunkLoader(options)`
A spinner that wobbles, decelerates, and reverses direction like it's had a few.

| Option | Default | Description |
|---|---|---|
| `baseSpeed` | `3.5` | Base rotation speed |
| `drunkenness` | `2.8` | Speed wobble severity |
| `wobbleSeverity` | `4` | Position wobble (px) |

**ARIA:** `role="status"`, `aria-live="polite"`

### `createSuspiciousEyes(options)`
Eyes that track your cursor, lock onto your caret while typing, and dilate in shock on password reveal.

| Option | Default | Description |
|---|---|---|
| `trackingSensitivity` | `7` | Pupil travel distance |
| `shockDuration` | `1500` | Shock animation duration (ms) |

**ARIA:** Input with `aria-label`, reveal button with `aria-pressed`. Eyes are `aria-hidden`.

### `createSlingshotUpload(options)`
Drag a file onto the slingshot, stretch the band, and catapult-launch it.

| Option | Default | Description |
|---|---|---|
| `bandWidth` | `4` | Elastic band width (px) |
| `launchSpeed` | `0.65` | Launch velocity |

**ARIA:** `role="button"`, keyboard: Enter, Space. Touch-friendly.

### `createMagneticButton(options)`
A button that stretches toward your cursor like magnetic putty, with a proximity hum.

| Option | Default | Description |
|---|---|---|
| `magneticRange` | `90` | Magnetic pull radius (px) |
| `pullStrength` | `0.45` | Pull force multiplier |

**ARIA:** Standard button. Disabled under reduced-motion.

### `createWobblyCheckbox(options)`
A hand-drawn checkbox that jiggles when checked and draws a shaky tick mark.

| Option | Default | Description |
|---|---|---|
| `labelText` | `'Indie Cinema Mode'` | Label text |
| `isJitterEnabled` | `true` | Toggle jiggle on check |
| `onChange(isChecked)` | — | Callback |

**ARIA:** `role="checkbox"`, `aria-checked`, keyboard: Enter, Space

---

## React Usage

```jsx
import 'winky-wonky/style.css';
import {
  TiltSlider, GroovySlider, MischievousButtons,
  HingeDropdown, PendulumToggle, WobblyCheckbox,
  RatingStars, SlinkyAccordion, DrunkLoader,
  SlimeProgress, GrumpyModalTrigger, SuspiciousEyes,
  SlingshotUpload, MagneticButton, TypewriterInput,
  BalloonTooltip, RotaryColorPicker
} from 'winky-wonky-react';

function App() {
  return (
    <>
      <TiltSlider initialValue={50} onChange={(v) => console.log(v)} />
      <WobblyCheckbox labelText="Accept wobbliness" />
      <RatingStars initialRating={3} />
      <DrunkLoader />
    </>
  );
}
```

---

## License

MIT
