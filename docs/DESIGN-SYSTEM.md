# Design System Specification

> The visual and interaction language of winky-wonky. Every component, theme, and feature must conform to this spec.

---

## Design Principles

### 1. Physics is the interaction, not the decoration
A slider that tilts under gravity isn't a slider with a tilt animation. It's a slider whose *value* is determined by physics. The motion is the logic. If you remove the physics, the component breaks.

### 2. Sound is feedback, not entertainment
Every sound tells you something happened. A tick means a notch snapped. A clack means a button bottomed out. If the sound doesn't convey information about the interaction, it doesn't exist. Haptic audio only.

### 3. Accessibility is not a fallback mode
`prefers-reduced-motion` doesn't mean "turn off the personality." It means "express the same personality through a different channel." The *intent* is preserved. The *modality* changes.

### 4. Zero dependencies is a feature
No React, no GSAP, no lodash, no audio files. Everything is vanilla JS and Web Audio. <20KB bundle. Works in any stack.

### 5. Dark premium is the default
The out-of-box experience should make someone think "this looks like a product, not a library."

### 6. The wobble is the brand
Every component should have one moment of physicality that a screenshot can't capture. You have to *interact* to understand why it's different.

---

## Color Tokens

### Dark Premium (Default — `:root`)

| Token | Value | Usage |
|---|---|---|
| `--winky-bg-primary` | `#0A0A0F` | Page background |
| `--winky-bg-secondary` | `#14141C` | Sidebar, topbar |
| `--winky-bg-surface` | `#1A1A24` | Cards, inputs, demo frames |
| `--winky-bg-glass` | `rgba(26, 26, 36, 0.72)` | Glassmorphic overlays |
| `--winky-accent-color` | `#6366F1` | Primary interactive accent |
| `--winky-accent-glow` | `rgba(99, 102, 241, 0.3)` | Glow shadows, hover states |
| `--winky-accent-alt` | `#8B5CF6` | Secondary accent, gradients |
| `--winky-accent-teal` | `#2DD4BF` | Tertiary accent, progress fills |
| `--winky-text-primary` | `#F4F4F8` | Primary text |
| `--winky-text-secondary` | `#9494A8` | Secondary text, descriptions |
| `--winky-text-muted` | `#5A5A6E` | Muted text, hints |
| `--winky-border-color` | `rgba(255, 255, 255, 0.08)` | Default borders |
| `--winky-border-strong` | `rgba(255, 255, 255, 0.14)` | Emphasized borders |

### Anderson Preset (`[data-theme="anderson"]`)

| Token | Value |
|---|---|
| `--winky-bg-primary` | `#FAF6F0` |
| `--winky-bg-secondary` | `#F1E4C3` |
| `--winky-bg-surface` | `#FFFDF8` |
| `--winky-accent-color` | `#D8A035` |
| `--winky-accent-alt` | `#E5A9A9` |
| `--winky-accent-teal` | `#7DB3B3` |
| `--winky-text-primary` | `#2B2520` |
| `--winky-text-secondary` | `#6B6356` |
| `--winky-border-color` | `rgba(43, 37, 32, 0.12)` |

### Burton Preset (`[data-theme="burton"]`)

| Token | Value |
|---|---|
| `--winky-bg-primary` | `#0D0C13` |
| `--winky-bg-secondary` | `#16151E` |
| `--winky-bg-surface` | `#1C1B28` |
| `--winky-accent-color` | `#F37F30` |
| `--winky-accent-alt` | `#7B3E8C` |
| `--winky-accent-teal` | `#496F5E` |
| `--winky-text-primary` | `#ECE9F2` |
| `--winky-text-secondary` | `#A09EB0` |
| `--winky-border-color` | `rgba(255, 255, 255, 0.06)` |

---

## Typography

| Token | Value | Usage |
|---|---|---|
| `--winky-font-sans` | `'Inter', system-ui, sans-serif` | Body, UI, labels |
| `--winky-font-display` | `'Space Grotesk', sans-serif` | Headers, titles, brand |
| `--winky-font-mono` | `'JetBrains Mono', monospace` | Code, values, URLs |

### Type Scale
- Hero title: `clamp(2.5rem, 8vw, 4.5rem)`, weight 700, letter-spacing -0.04em
- Page header: 1.5rem, weight 700, letter-spacing -0.02em
- Card title: 1.05rem, weight 600, letter-spacing -0.01em
- Body: 0.875rem, weight 500
- Small/labels: 0.75rem, weight 600
- Micro/badges: 0.65rem, weight 600, letter-spacing 1.5px, uppercase

---

## Spacing Scale

| Token | Value |
|---|---|
| `--winky-space-xs` | `0.5rem` |
| `--winky-space-sm` | `0.75rem` |
| `--winky-space-md` | `1rem` |
| `--winky-space-lg` | `1.5rem` |
| `--winky-space-xl` | `2.5rem` |
| `--winky-space-2xl` | `4rem` |

---

## Radius Scale

| Token | Value | Usage |
|---|---|---|
| `--winky-border-radius-sm` | `8px` | Inputs, buttons, small elements |
| `--winky-border-radius` | `12px` | Cards, containers |
| `--winky-border-radius-lg` | `20px` | Large surfaces, modals |

---

## Shadows

| Token | Value |
|---|---|
| `--winky-box-shadow` | `0 4px 24px rgba(0, 0, 0, 0.4)` |
| `--winky-box-shadow-hover` | `0 8px 32px rgba(0, 0, 0, 0.5)` |
| `--winky-box-shadow-glow` | `0 0 20px var(--winky-accent-glow)` |

---

## Motion Language

### Easing Curves
| Token | Value | Usage |
|---|---|---|
| `--winky-transition` | `all 0.2s cubic-bezier(0.4, 0, 0.2, 1)` | Default transitions |
| `--winky-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy spring (overshoot) |
| `--winky-gentle-spring` | `cubic-bezier(0.22, 1, 0.36, 1)` | Whisper motion (no overshoot) |

### Whisper Motion Standards
- Wobble amplitudes: 1-3 degrees (not 10-15)
- Scale shifts: 0.92-1.08 (not 0.6-1.3)
- Translation: 1-4px (not 10-30px)
- Durations: 0.08-0.3s (not 0.5-1.8s)
- Easing: `--winky-gentle-spring` for most, `--winky-spring` for deliberate bounces

### Reduced Motion
All animations disabled. Components remain fully functional. Physics still determines values — the visual expression is just instant.

---

## Audio Spec

### Synthesized Sounds (Web Audio API)

| Sound | Waveform | Freq Range | Duration | Volume | Meaning |
|---|---|---|---|---|---|
| `playTick` | Sine | 800→400Hz | 25ms | 0.08 | Notch snapped, item hovered |
| `playClack` | Sine | 200→100Hz | 35ms | 0.10 | Button pressed, toggle settled |
| `startSlide` | Sine | 200-600Hz | Continuous | 0.03 | Dragging a slider |
| `startHum` | Sine | 60Hz | Continuous | 0.06 | Magnetic proximity |

### Audio Rules
- Default volume: 0.15 (15%)
- Gated until user interaction (browser autoplay policy)
- Respects `prefers-reduced-sound`
- No music, no ambiance, no decorative sounds
- Every sound maps to a physical event

---

## Component Inventory (18)

### Tactile Controls (7)
1. **Tilt Seesaw Slider** — gravity-driven, tilts under cursor, knob slides down slope
2. **Groove-o-Matic Slider** — sine wave track, magnetic notch snap
3. **Mischievous Buttons** — dodge evasion, squash/stretch, lazy shadow
4. **Pendulum Switch** — damped pendulum swing toggle
5. **Slingshot Upload** — elastic band drag, catapult launch
6. **Magnetic Putty Button** — magnetic pull, proximity hum
7. **Wobbly Checkbox** — jitter on check, SVG tick draw

### Dynamic Widgets (6)
8. **Typewriter Input** — keystroke jitter, floating char projection
9. **Helium Balloon Tooltip** — inflate on hover/focus, sway on string
10. **Swinging Hinge Dropdown** — hinge swing open
11. **Slinky Accordion** — spring overshoot expand
12. **Drunk Loader** — irregular spin, wobble, direction reversal
13. **Suspicious Eyes** — cursor tracking, caret lock, shock dilation

### Gothic Extras (5)
14. **Slime Progress** — gravity drip melt
15. **Self-Conscious Stars** — blush, collapse on low, confetti on 5-star
16. **Grumpy Modal** — spring drop, angry shake on outside click
17. **Rotary Theme Dial** — mechanical rotation, palette switching
18. **(AudioSynth)** — not a component, the synthesis engine

---

## Accessibility Spec

Every component must have:

- **ARIA role** appropriate to function (slider, switch, checkbox, dialog, etc.)
- **Keyboard navigation** (Tab, Arrow keys, Enter, Space, Escape, Home, End)
- **`prefers-reduced-motion`** — physics preserved, visual motion disabled
- **`prefers-reduced-sound`** — audio silenced
- **`pointer: coarse`** — touch-action: none on draggable elements
- **Focus visibility** — `.winky-focus-visible:focus-visible` outline

---

## Framework Support

| Package | Status |
|---|---|
| `winky-wonky` (vanilla) | Shipped |
| `winky-wonky-react` | Shipped (`packages/winky-wonky-react/`) |
| `winky-wonky-vue` | Planned (Phase 2) |
| `winky-wonky-svelte` | Planned (Phase 2) |
| `winky-wonky-solid` | Planned (Phase 2) |
