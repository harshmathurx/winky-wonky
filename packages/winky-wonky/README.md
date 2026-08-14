# Winky-Wonky

**A physics engine for UI feel — springs, gestures, and synthesized audio — plus 24 components built on it.**

Flat design made every interface feel like the same interface. Winky-Wonky is the argument that UI elements are *objects*: they have weight, resistance, momentum, and they make sounds when you touch them. Inspired by the aesthetics of Wes Anderson and Tim Burton.

It ships as two layers:

- **`@winkywonky/core`** — the engine. One damped-spring implementation (`createSpring`), a unified pointer-gesture layer (`addPointerDrag`), a Web Audio synthesis module (`AudioSynth` + composable `soundRecipes` — no audio files, pure oscillators), and reduced-motion/-sound/pointer helpers. Headless, typed, zero dependencies, SSR-safe. Use it to add feel to the components you already have.
- **`winky-wonky`** — the component library. 24 accessible, themeable vanilla-JS components (seesaw sliders, pendulum toggles, slingshot uploads, dodging buttons…) built on the core. Framework-agnostic, with React wrappers in `winky-wonky-react`.

```javascript
import { createSpring, AudioSynth } from '@winkywonky/core';

const spring = createSpring({ stiffness: 170, damping: 14 }); // underdamped = bouncy
spring.onUpdate((v) => { knob.style.left = `${v}%`; });
spring.onRest(() => AudioSynth.playTick());
spring.target(80); // rAF loop runs only while moving — zero idle CPU
```

**Zero dependencies. 100% vanilla JS. Fully accessible. SSR-safe.**

Browse every component live — with tunable Controls and a theme switcher
(Dark / Wes Anderson / Tim Burton) — by cloning the repo and running:

```bash
npm install && npm run storybook
```

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

Every factory returns an **instance**, not a bare DOM node — mount `instance.el`:

```javascript
import 'winky-wonky/style.css';
import { createTiltSlider } from 'winky-wonky';

const slider = createTiltSlider({
  initialValue: 40,
  gravity: 0.7,
  maxTilt: 20,
  onChange: (value) => console.log('Volume:', value)
});

document.getElementById('app').appendChild(slider.el);

// Later — e.g. syncing from external state:
slider.setValue(75);   // updates the DOM + ARIA, does NOT fire onChange
slider.getValue();     // => 75
slider.destroy();      // tears down listeners, timers, and rAF loops
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

React components can also be **controlled** — pass a `value` prop and it stays in sync with your state, without ever firing `onChange` back at itself:

```jsx
function VolumeControl() {
  const [volume, setVolume] = useState(40);
  return <TiltSlider value={volume} onChange={setVolume} />;
}
```

---

## Instance API

Every `createX()` factory returns a plain object, not a DOM node:

```javascript
const instance = createTiltSlider(options);
// instance.el       — the root DOM node; append this, not `instance`
// instance.destroy() — removes listeners/timers/rAF loops
// instance.getValue()  — present on value-bearing components (see below)
// instance.setValue(v) — present on value-bearing components; updates the
//                        DOM + ARIA state but never invokes `onChange`
//                        (the standard "controlled component" contract)
```

`getValue`/`setValue` are implemented by every value-bearing component:
`TiltSlider`, `GroovySlider`, `PendulumToggle`, `WobblyCheckbox`,
`WobblyRadioGroup`, `RatingStars`, `SpringyTabs`, `WobblySwitch`,
`HingeDropdown`, `TypewriterInput`, `SlimeProgress`, `RotaryColorPicker`.

Gestural/novelty components with no single canonical "value" (`MischievousButtons`,
`BalloonTooltip`, `GrumpyModalTrigger`, `DrunkLoader`, `SuspiciousEyes`,
`SlingshotUpload`, `MagneticButton`, `GravityToast`, `RippleButton`,
`MagneticNav`, `ElasticDragList`, `SlinkyAccordion`) return just `{ el, destroy }`
(some also expose a live-mutable `config` object for secondary tuning knobs —
see each component's JSDoc in `src/components/`).

---

## Accessibility

Winky-Wonky is built to be usable by everyone. Every component includes:

- **ARIA roles & labels** — sliders, switches, checkboxes, dialogs, tooltips, progressbars all use correct semantics
- **Configurable labels** — every accessible name that used to be a hardcoded string is now an option (e.g. `ariaLabel`, `dismissAriaLabel`), so screen-reader text can be translated or made instance-specific
- **Keyboard navigation** — all interactive components are operable with Tab, Arrow keys, Enter, Space, Escape, Home, End
- **`prefers-reduced-motion`** — all wobble, jiggle, shake, and float animations are automatically disabled when the user requests reduced motion. Components remain fully functional, just without the physics flourish
- **`prefers-reduced-sound`** — all synthesized audio (ticks, clacks, squeaks, pops) is automatically silenced
- **`pointer: coarse` (touch)** — components work on touch devices with proper `touch-action` handling
- **Focus visibility** — keyboard focus is shown with a clear accent-color outline

---

## CSS

Import once, globally:

```javascript
import 'winky-wonky/style.css';
```

That pulls in `src/winky-wonky.css` — the published aggregate, which imports design tokens, shared focus/reduced-motion rules, and one stylesheet per component from `src/styles/`. **Every shipped class is `winky-`-prefixed** (`.winky-seesaw-slider-track`, `.winky-accordion-item`, `.winky-btn-dodge`, …) so it won't collide with your own CSS. If you only want a subset, the per-component files in `src/styles/*.css` (and `dist/styles/*.css` in the published package) can be imported individually — just also import `src/styles/_tokens.css` for the `--winky-*` variables they rely on.

### CSS Variables API

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

Value-bearing components (`getValue`/`setValue`) are marked **●**.

### `createTiltSlider(options)` ●
A seesaw slider that tilts under your cursor. The knob slides down the slope under gravity.

| Option | Default | Description |
|---|---|---|
| `initialValue` | `50` | Start percentage |
| `gravity` | `0.4` | Pull speed down the slope |
| `maxTilt` | `15` | Maximum tilt in degrees |
| `springLag` | `0.2` | Drag spring elasticity |
| `ariaLabel` | `'Seesaw volume slider'` | Accessible name |
| `onChange(value)` | — | Callback |

**ARIA:** `role="slider"`, keyboard: Arrow keys, Home, End. **Value:** number 0-100.

### `createGroovySlider(options)` ●
A slider that rides a sine wave track and snaps magnetically into notches.

| Option | Default | Description |
|---|---|---|
| `initialValue` | `20` | Start percentage |
| `notchCount` | `8` | Number of snapping notches |
| `waveAmplitude` | `18` | Wave peak height |
| `snapThreshold` | `3.5` | Magnetic snap radius |
| `ariaLabel` | `'Groovy wave slider'` | Accessible name |
| `onChange(value)` | — | Callback |

**ARIA:** `role="slider"`, keyboard: Arrow keys, Home, End. **Value:** number 0-100.

### `createMischievousButtons(options)`
Three buttons: a dodger that evades your cursor, a squash-stretch, and a lazy-shadow tactile press.

| Option | Default | Description |
|---|---|---|
| `isDodgeEnabled` | `true` | Enable cursor evasion |
| `dodgePower` | `0.8` | Evasion speed multiplier |
| `maxDodgeRange` | `75` | Evasion radius limit (px) |
| `dodgeAriaLabel` | `'Dodge button — try to catch it'` | Accessible name for the dodge button |
| `squashAriaLabel` | `'Squash and stretch button'` | Accessible name for the squash button |
| `lazyAriaLabel` | `'Tactile button with lazy shadow'` | Accessible name for the lazy-shadow button |
| `onClick(type)` | — | Callback (`'dodge'`, `'squash'`, `'lazy-shadow'`) |

**ARIA:** Buttons with labels. Dodge disabled under reduced-motion.

### `createHingeDropdown(options)` ●
A dropdown that swings open from a hinge like a wooden shop sign.

| Option | Default | Description |
|---|---|---|
| `label` | `'Select Curiosity'` | Button text |
| `options` | preset list | Array of option strings |
| `hingeOrigin` | `'top left'` | Hinge corner |
| `swingSpeed` | `1.8` | Swing duration (seconds) |
| `ariaLabel` | trigger's visible text | Accessible name |
| `onSelect(value)` | — | Callback |

**ARIA:** `aria-haspopup="listbox"`, `role="listbox"`, keyboard: Arrow keys, Enter, Escape. **Value:** selected option string.

### `createTypewriterInput(options)` ●
A text input that jitters on each keystroke and projects characters into a floating preview.

| Option | Default | Description |
|---|---|---|
| `placeholder` | `'Type something peculiar...'` | Placeholder text |
| `jitterStrength` | `3` | Shake intensity (px) |
| `maxWobbleRotation` | `12` | Character wobble (degrees) |
| `ariaLabel` | `'Typewriter input'` | Accessible name |
| `onChange(value)` | — | Callback |

**ARIA:** Labelled input. Jitter disabled under reduced-motion. **Value:** the input's text.

### `createPendulumToggle(options)` ●
A toggle switch hanging from a bracket. Click to swing it to the other side with physics damping.

| Option | Default | Description |
|---|---|---|
| `initialState` | `false` | Initial on/off state |
| `damping` | `0.5` | Physics damping factor |
| `swingTime` | `1.4` | Swing duration (seconds) |
| `ariaLabel` | `'Pendulum toggle switch'` | Accessible name |
| `onChange(isOn)` | — | Callback |

**ARIA:** `role="switch"`, `aria-checked`, keyboard: Enter, Space. **Value:** boolean.

### `createBalloonTooltip(options)`
A helium balloon tooltip that inflates on hover/focus and sways on a wavy string.

| Option | Default | Description |
|---|---|---|
| `text` | `'Curiosity Box!'` | Tooltip text |
| `stringLength` | `25` | Balloon string length (px) |
| `triggerNode` | auto-created | Custom trigger element |

**ARIA:** `role="tooltip"`, `aria-describedby`. Shows on hover AND focus.

### `createSlimeProgress(options)` ●
A progress bar that can melt — viscous slime drips fall off the fill edge.

| Option | Default | Description |
|---|---|---|
| `initialProgress` | `35` | Start percentage |
| `meltDuration` | `1.5` | Drip animation duration (seconds) |
| `ariaLabel` | `'Slime progress bar'` | Accessible name |
| `onMeltComplete(pct)` | — | Callback |

**ARIA:** `role="progressbar"`, `aria-valuenow`. **Value:** number 0-100.

### `createGrumpyModalTrigger(options)`
A modal that drops on a spring. Clicking outside to dismiss triggers an angry shake + buzzer.

| Option | Default | Description |
|---|---|---|
| `headerText` | `'Peculiar Notice!'` | Modal title |
| `bodyText` | preset | Modal body text |
| `buttonText` | `'Dismiss Me'` | Close button text |
| `onClose()` | — | Callback |

**ARIA:** `role="dialog"`, `aria-modal`, focus trap, Escape triggers shake (not close). Self-contained — no global DOM dependencies.

### `createRatingStars(options)` ●
Star rating where low ratings collapse and fall, five stars trigger confetti.

| Option | Default | Description |
|---|---|---|
| `initialRating` | `0` | Initial star count |
| `confettiCount` | `25` | Confetti pieces on 5-star |
| `ariaLabel` | `'Rating'` | Accessible name for the group |
| `starLabel(i)` | `` `${i} star(s)` `` | Per-star accessible label function |
| `onChange(rating)` | — | Callback |

**ARIA:** `role="radiogroup"`, `role="radio"`, keyboard: Arrow keys, Enter. **Value:** number 0-5. `setValue` only updates DOM/ARIA — no confetti, no lock, no sound.

### `createSlinkyAccordion(options)`
Accordion that bounces open with spring overshoot.

| Option | Default | Description |
|---|---|---|
| `items` | preset | Array of `{ title, content }` |
| `springBounciness` | `1.35` | Spring overshoot factor |
| `transitionDuration` | `0.45` | Open/close duration (seconds) |

**ARIA:** `aria-expanded`, `role="region"`, keyboard: Arrow keys, Home, End

### `createRotaryColorPicker(options)` ●
A vintage rotary dial that selects color palettes with mechanical rotation.

| Option | Default | Description |
|---|---|---|
| `palettes` | 4 built-in | Array of palette objects |
| `ariaLabel` | `'Color palette selector'` | Accessible name |
| `onDialComplete(palette)` | — | Callback |

**ARIA:** `role="radiogroup"`, `role="radio"`, keyboard: Arrow keys, Enter. **Value:** selected palette index (`-1` if none yet).

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
| `inputAriaLabel` | `'Secret passcode'` | Accessible name for the password input |
| `revealAriaLabel` | `'Reveal passcode'` | Accessible name for the reveal button |

**ARIA:** Input with `aria-label`, reveal button with `aria-pressed`. Eyes are `aria-hidden`.

### `createSlingshotUpload(options)`
Drag a file onto the slingshot, stretch the band, and catapult-launch it.

| Option | Default | Description |
|---|---|---|
| `bandWidth` | `4` | Elastic band width (px) |
| `launchSpeed` | `0.65` | Launch velocity |
| `ariaLabel` | `'Upload file by dragging or clicking'` | Accessible name |

**ARIA:** `role="button"`, keyboard: Enter, Space. Touch-friendly.

### `createMagneticButton(options)`
A button that stretches toward your cursor like magnetic putty, with a proximity hum.

| Option | Default | Description |
|---|---|---|
| `magneticRange` | `90` | Magnetic pull radius (px) |
| `pullStrength` | `0.45` | Pull force multiplier |

**ARIA:** Standard button. Disabled under reduced-motion.

### `createWobblyCheckbox(options)` ●
A hand-drawn checkbox that jiggles when checked and draws a shaky tick mark.

| Option | Default | Description |
|---|---|---|
| `labelText` | `'Indie Cinema Mode'` | Visible label text |
| `ariaLabel` | defaults to `labelText` | Accessible name (independent of the visible label) |
| `isJitterEnabled` | `true` | Toggle jiggle on check |
| `onChange(isChecked)` | — | Callback |

**ARIA:** `role="checkbox"`, `aria-checked`, keyboard: Enter, Space. **Value:** boolean.

### `createWobblyRadioGroup(options)` ●
A segmented radio group with a spring-animated selection indicator that slides between options.

| Option | Default | Description |
|---|---|---|
| `items` | preset list | Radio option labels |
| `initialIndex` | `0` | Initially-selected item index |
| `ariaLabel` | `'Selection'` | Accessible name for the group |
| `onChange(selected)` | — | Callback with the selected item's label |

**ARIA:** `role="radiogroup"`, `role="radio"`, keyboard: Arrow keys, Home, End. **Value:** selected item's label (`setValue` accepts a label or an index).

### `createSpringyTabs(options)` ●
A tab interface with a spring-animated underline indicator and gentle panel transitions.

| Option | Default | Description |
|---|---|---|
| `tabs` | preset list | Array of `{ label, content }` |
| `activeIndex` | `0` | Initially-active tab index |
| `springBounciness` | `1.2` | Spring overshoot factor |
| `onChange(tab)` | — | Callback with the newly-active `{ label, content }` |

**ARIA:** `role="tablist"`/`role="tab"`/`role="tabpanel"`, keyboard: Arrow keys. **Value:** active tab index (note this differs from `onChange`, which emits the full tab object).

### `createGravityToast(options)`
Toast notifications that drop in with gravity settling and slide out on dismiss. Auto-expiring with close button.

| Option | Default | Description |
|---|---|---|
| `buttonText` | `'Show Toast'` | Trigger button label |
| `defaultMessage` | `'Something happened'` | Fallback toast message |
| `messages` | preset list | Messages cycled through on each trigger click |
| `maxVisible` | `3` | Max toasts shown at once (oldest evicted) |
| `duration` | `3000` | Auto-dismiss delay (ms) |
| `dismissAriaLabel` | `'Dismiss notification'` | Accessible name for each toast's close button |

**ARIA:** `role="alert"`, `aria-live="assertive"` on each toast.

### `createWobblySwitch(options)` ●
An iOS-style toggle switch with spring overshoot on the thumb. Keyboard accessible with ARIA switch role.

| Option | Default | Description |
|---|---|---|
| `labelText` | `'Enable Physics'` | Visible label text |
| `ariaLabel` | defaults to `labelText` | Accessible name |
| `initialState` | `false` | Initial on/off state |
| `springPower` | `1.3` | Thumb overshoot factor |
| `onChange(isOn)` | — | Callback |

**ARIA:** `role="switch"`, `aria-checked`, keyboard: Enter, Space. **Value:** boolean.

### `createRippleButton(options)`
A button with a material-style ripple effect that originates from the click point. Haptic clack on press.

| Option | Default | Description |
|---|---|---|
| `label` | `'Press Me'` | Visible button text |
| `ariaLabel` | falls back to `label` | Accessible name override |
| `rippleColor` | theme accent | CSS color for the ripple |
| `maxRipples` | `1` | Max concurrent ripples |
| `onClick()` | — | Callback |

**ARIA:** Standard button semantics.

### `createMagneticNav(options)`
A navigation bar with magnetic cursor attraction and a sliding active indicator. Keyboard navigable.

| Option | Default | Description |
|---|---|---|
| `label` | `'Main navigation'` | Accessible name for the nav landmark |
| `items` | preset list | Nav item labels |
| `activeIndex` | `0` | Initially active item index |
| `magneticRange` | `50` | Pointer distance (px) at which items start pulling toward the cursor |
| `pullStrength` | `0.2` | How strongly items translate toward the cursor (0-1) |
| `onChange(item)` | — | Callback with the newly active item's label |

**ARIA:** `<nav>` landmark, keyboard: Arrow keys, Home, End.

### `createElasticDragList(options)`
A reorderable list with drag-and-drop. Items have elastic visual feedback. Alt+Arrow keys for keyboard reordering.

| Option | Default | Description |
|---|---|---|
| `items` | preset list | Array of `{ label }` |
| `ariaLabel` | `'Reorderable list'` | Accessible name for the list |
| `onChange(order)` | — | Callback with the new label order |

**ARIA:** `role="list"`, keyboard: Alt+Arrow to reorder, Tab to navigate.

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
  BalloonTooltip, RotaryColorPicker, WobblyRadioGroup,
  SpringyTabs, GravityToast, WobblySwitch, RippleButton,
  MagneticNav, ElasticDragList,
} from 'winky-wonky-react';

function App() {
  return (
    <>
      {/* Uncontrolled — just an initial value */}
      <TiltSlider initialValue={50} onChange={(v) => console.log(v)} />

      {/* Controlled — `value` stays in sync with your state */}
      <WobblyCheckbox value={accepted} onChange={setAccepted} labelText="Accept wobbliness" />

      <RatingStars initialRating={3} />
      <DrunkLoader />
    </>
  );
}
```

Every wrapper component accepts the same options as its vanilla-JS factory, plus an optional `value` prop for value-bearing components (see the **●** components above) — passing `value` makes it a controlled component: an internal effect calls the instance's `setValue()` whenever `value` changes, which updates the DOM without ever re-invoking your `onChange`.

---

## Migrating from 1.x to 2.0

2.0 is a breaking release (full detail in [`CHANGELOG.md`](CHANGELOG.md)):

1. **Factories return an instance, not a DOM node.** Change
   `document.body.appendChild(createTiltSlider(...))` to
   `document.body.appendChild(createTiltSlider(...).el)`. Use
   `instance.getValue()` / `instance.setValue(v)` / `instance.destroy()`.
   `setValue` never fires `onChange`.
2. **All CSS classes are now `winky-`-prefixed.** If you styled or queried
   library-internal class names (`.accordion-item`, `.btn-dodge`, …), add the
   `winky-` prefix. The `--winky-*` CSS variables are unchanged.
3. **`getControls()` / `getCodeSnippet()` are gone** — they were playground
   tooling, not library API.
4. **The physics/gesture/audio primitives moved to `@winkywonky/core`.**
   `AudioSynth`, `addPointerDrag`, and the media-query helpers are still
   re-exported from `winky-wonky` for compatibility, but new code should import
   them from `@winkywonky/core`.
5. **React wrappers** are unchanged for uncontrolled usage; value-bearing
   components additionally accept a controlled `value` prop.

---

## Repository Layout

```
packages/winky-core/        @winkywonky/core — the engine (springs, gestures, audio, media helpers)
packages/winky-wonky-react/ React wrappers (compiled, controlled-component support)
src/                         winky-wonky — the component library
.storybook/, stories/        component gallery/docs (never published) — `npm run storybook`
docs/                        vision, audit, architecture, GTM
```

npm workspaces: `npm install` at the root sets up everything; `npm run test:all` runs every package's suite.

---

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for dev setup and the release
process (versioning is automated via [Changesets](https://github.com/changesets/changesets)
on merge to `main`).

---

## License

MIT
