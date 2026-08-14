# Changelog

## 2.0.0

### Patch Changes

- [#1](https://github.com/harshmathurx/winky-wonky/pull/1) [`8900254`](https://github.com/harshmathurx/winky-wonky/commit/8900254e38c9a035c0d0558bbed8abf85ee994f3) Thanks [@harshmathurx](https://github.com/harshmathurx)! - Fix accessibility issues found in an audit: Rotary Color Picker no longer hides its focusable palette holes from assistive tech via a stray `aria-hidden`; Magnetic Nav no longer sets an invalid `role="menuitem"` without a `menu`/`menubar` ancestor; Gravity Toast now announces via `role="status"`/`aria-live="polite"` instead of interrupting with `assertive`/`alert` for routine messages; and text-on-accent-color contrast across Gravity Toast, Ripple Button, Grumpy Modal, Magnetic Button, Magnetic Nav, Pendulum Toggle, Springy Tabs, Wobbly Radio Group, and Rotary Color Picker now meets WCAG AA (4.5:1) in all three built-in themes via new `--winky-accent-color-text`/`--winky-accent-color-fill-text`/`--winky-accent-alt-fill-text` tokens.

- [#1](https://github.com/harshmathurx/winky-wonky/pull/1) [`8900254`](https://github.com/harshmathurx/winky-wonky/commit/8900254e38c9a035c0d0558bbed8abf85ee994f3) Thanks [@harshmathurx](https://github.com/harshmathurx)! - Fix functional bugs found in a manual UAT pass: Grumpy Modal's trigger button did nothing (inline styles set in JS were permanently overriding the CSS class that opened it); Gravity Toast could visually shift the trigger button around the page as toasts stacked up (toasts are now a fixed-position stack, out of normal document flow); and Rotary Color Picker's dial holes rendered partly outside the dial's circle (a hardcoded center offset didn't match the dial's actual CSS size).

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [2.0.0-alpha.0] - 2026-07-17

Remediation release addressing the full findings list in `docs/AUDIT.md`. Not yet
published — `2.0.0-alpha.0` is a working version for the `audit/product-and-code-audit`
branch; publishing is the maintainer's call. See `PLAN.md` for the phased execution
record.

### Breaking

- **Factories now return an instance object, not a bare DOM node** (audit #6). Every
  `createX()` returns `{ el, destroy, getValue?, setValue? }` — mount `instance.el`,
  not `instance` itself. `getValue`/`setValue` are implemented by every value-bearing
  component (sliders, toggles, checkbox, radio group, rating, tabs, switch, dropdown,
  input, progress, color picker); `setValue` updates the DOM + ARIA state and never
  invokes `onChange`, matching the standard controlled-component contract.
- **All shipped CSS classes are now `winky-`-prefixed** (audit #5), e.g.
  `.accordion-item` → `.winky-accordion-item`, `.btn-dodge` → `.winky-btn-dodge`,
  `.seesaw-slider-track` → `.winky-seesaw-slider-track`. Update any code that
  selected library-internal class names directly.
- **`getControls()`/`getCodeSnippet()` removed from every component** (audit #4).
  These were playground-only concerns bolted onto the shipped component API; the
  playground's tuning panel and code inspector now read from a separate,
  unpublished registry (`src/playground/registry.js`).
- **`src/style.css` split** (audit #4/#5). The single 2,622-line file is now
  `src/winky-wonky.css` (the published aggregate — imports design tokens, shared
  a11y rules, and one file per component from `src/styles/`) plus a demo-only
  `src/playground/playground.css` that never ships. The `winky-wonky/style.css`
  package export now points at the new aggregate — most consumers need no changes.
- **Several hardcoded ARIA strings became configurable options** (audit #8), e.g.
  `ariaLabel`, `dismissAriaLabel`, `inputAriaLabel`/`revealAriaLabel`,
  `dodgeAriaLabel`/`squashAriaLabel`/`lazyAriaLabel`. Existing defaults are
  unchanged, so this is additive unless you were relying on the old hardcoded text.
- **`winky-wonky-react` wrappers use `.el` internally** and support a controlled
  `value` prop for value-bearing components; uncontrolled usage (`initialValue`,
  `onChange`, etc.) is unchanged.
- **React peer dependency bumped** to `winky-wonky >=2.0.0-alpha.0`.

### Fixed

- **SSR crash on import** (audit #2) — `window.matchMedia`/`document` access is now
  lazy-initialized; importing the package in Node (Next.js/Remix/Astro SSR) no
  longer throws.
- **Permanent rAF loop + `onChange` spam in `TiltSlider`** (audit #3) — the render
  loop now idles fully when settled and restarts only on interaction;
  `onChange` fires at most once per rounded-value change, never from both the
  render loop and the drag handler simultaneously.
- **`winky-wonky-react` shipped raw, untranspiled JSX** (audit #1) — now built with
  Vite lib mode to plain ESM `dist/index.js`.
- **`toast._timer` expando leak** in `GravityToast` (audit #8) — replaced with a
  `WeakMap` keyed by the toast element.
- **README component count** corrected from the claimed 18 to the actual 24
  (`AudioSynth` and the 5 media-query helpers are separate exports, not counted as
  "components"); the 7 previously-undocumented exports (`wobblyRadioGroup`,
  `springyTabs`, `gravityToast`, `wobblySwitch`, `rippleButton`, `magneticNav`,
  `elasticDragList`) are now documented.

### Added

- **`@winky/core`** — the physics engine extracted as its own headless package:
  `createSpring` (one damped-spring implementation with `set`/`target`/
  `onUpdate`/`onRest`, closed-form integration, idle-when-settled rAF),
  `addPointerDrag`, `AudioSynth` + composable `soundRecipes` (tick/clack/
  slide/hum), and the reduced-motion/-sound/pointer media helpers. Zero
  dependencies, SSR-safe, JSDoc-typed, 20 unit tests. `winky-wonky`'s
  `utils.js`/`audioSynth.js` are now compatibility re-export shims over it,
  and `TiltSlider` is fully rebuilt on `createSpring` as the flagship proof.
- Repo converted to **npm workspaces** (`packages/winky-core`,
  `packages/winky-wonky-react`) with a single root lockfile and a `test:all`
  script.
- **Generated TypeScript declarations** for all packages (JSDoc-typed source +
  `tsc --allowJs --declaration`), wired into `exports.types`, CI, and
  `prepublishOnly`.
- Vitest + jsdom test suite (smoke tests for every factory, SSR-safe import test,
  `TiltSlider` rAF/onChange/instance-API tests) and a GitHub Actions CI workflow.
- `winky-wonky-react` test suite (Vitest + `@testing-library/react`), including a
  controlled-component render test.
- Package READMEs for `@winky/core` and `winky-wonky-react`; engine-first main
  README with 1.x → 2.0 migration notes; `docs/ARCHITECTURE.md` rewritten to
  the post-refactor two-layer architecture.

## [1.0.0] - 2024-01-01

### Added
- 25 physics-based, accessible UI components
- **Tactile Controls (7):** TiltSlider, GroovySlider, MischievousButtons, PendulumToggle, SlingshotUpload, MagneticButton, WobblyCheckbox
- **Dynamic Widgets (6):** TypewriterInput, BalloonTooltip, HingeDropdown, SlinkyAccordion, DrunkLoader, SuspiciousEyes
- **Gothic Extras (4):** SlimeProgress, RatingStars, GrumpyModal, RotaryColorPicker
- **System UI (7):** WobblyRadioGroup, SpringyTabs, GravityToast, WobblySwitch, RippleButton, MagneticNav, ElasticDragList
- Web Audio synthesis engine (2 sounds: tick, clack) — zero audio files, pure oscillators
- Dark premium default theme with Anderson and Burton presets
- CSS variables API (`--winky-*` prefix) for full theming
- React wrapper package (`winky-wonky-react`)
- IIFE CDN bundle (`winky-wonky.min.js`) — use via `<script>` tag, zero install
- ES module build for bundler consumption
- Full accessibility: ARIA roles, keyboard navigation, `prefers-reduced-motion`, `prefers-reduced-sound`, touch support
- Live playground with interactive demos, code inspector, and parameter controls
- Gallery submission system ("Show Your Wobbliest Site")
- 4 example pages: Getting Started, Landing, Pricing, Settings
- Docs: Vision, PM Analysis, Architecture, Design System Spec, GTM Plan

### Technical
- Zero runtime dependencies — vanilla JS only
- 67KB IIFE bundle (17KB gzipped)
- 56KB CSS (8KB gzipped)
- All components return DOM nodes with `.destroy()`, `.getControls()`, `.getCodeSnippet()`
- Unified pointer events (mouse + touch)
- `prefers-reduced-motion` respected on all components
- `prefers-reduced-sound` respected on all audio
