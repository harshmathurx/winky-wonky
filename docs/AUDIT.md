# Winky-Wonky — Full Audit & Direction

> Product + engineering audit of the repo as of 2026-07-17 (v1.0.0, commit `3b81261`).
> Covers all 25 components, packaging, the React wrapper, CSS, and the strategy docs.

---

## The Verdict First

The component code is **better than it looks from the inside** — real ARIA, real
`prefers-reduced-motion` handling, audio gated behind user gesture, focus traps. Most
"whimsical UI" repos have none of that.

What's actually broken is everything *around* the components: the packaging, the
architecture, and the gap between what the README claims and what ships. **This is a
playground cosplaying as a library.** The strategy docs (VISION.md, PM-ANALYSIS.md,
GTM-PLAN.md) are genuinely good — but they're writing checks the repo can't cash yet.

The one-liner: the product thinking is ahead of the implementation, and the
implementation is ahead of the packaging. **Fix in reverse order.**

---

## Part 1: The Audit — What Is Actually Broken

### 1. `winky-wonky-react` is dead on arrival — SEVERITY: FATAL

`packages/winky-wonky-react/index.js` ships **raw JSX** (`return <div ref={ref} />`)
with no build step and no compiled output. The moment anyone `npm install`s this,
their bundler chokes — nobody transpiles `node_modules` by default.

This package has never been consumed by a real app.

**Fix:** Add a build step (vite lib mode / esbuild) emitting plain JS + a `.d.ts`.
Publish compiled output, not source JSX.

### 2. The library crashes on import in SSR — SEVERITY: FATAL

- `src/components/utils.js:1-3` calls `window.matchMedia` at module top level.
- `src/components/audioSynth.js:33-34` attaches `document` listeners at import time.

Any Next.js / Remix / Astro app that imports the package server-side dies with
`window is not defined`. In 2026 that's disqualifying — half the funnel is Next users.

**Fix:** Lazy-init every module-level DOM/BOM touch. `typeof window === 'undefined'`
guards or first-call initialization.

### 3. Permanent rAF loops + `onChange` spam at 60Hz — SEVERITY: HIGH

In `src/components/tiltSlider.js`:

- `needsRender` is set to `true` and **never set back to `false`**, so
  `updateRender()` runs every animation frame, forever, per instance.
- Line 78 fires `onChange` on **every frame** even when the value hasn't changed —
  and `onChange` *also* fires from the drag `onMove` handler, so it double-fires
  during drags.

Mount five sliders and you have five permanent rAF loops cooking laptops. The
pattern (always-on rAF, no idle state, no value-change guard) repeats across
components. A "physics-first" library that drains batteries **at rest** is a self-own.

**Fix:** Reset `needsRender = false` after render; stop the rAF loop entirely when
settled and restart on interaction; only invoke `onChange` when the rounded value
actually changes.

### 4. Playground code ships inside the library — SEVERITY: HIGH

- Every component carries `getControls()` and `getCodeSnippet()` — demo-site
  concerns bolted onto DOM nodes (e.g. `tiltSlider.js:198-217`). That's dead weight
  in every consumer's bundle and a bizarre API surface.
- `src/style.css` (2,622 lines) mixes shipped component styles with the demo app's
  styles (`.app-container`, `.brand-title`, `.code-inspector`, nav, theme-wipe…).
  Consumers download the playground.

**Fix:** Move `getControls`/`getCodeSnippet` into the playground (`main.js`) as a
registry keyed by component name. Split `style.css` into per-component files +
one `winky-wonky.css` aggregate; keep demo styles in the demo.

### 5. The CSS namespacing claim is false — SEVERITY: HIGH

README says everything is `--winky-` namespaced. True for CSS variables — **not for
class names**: `.accordion-item`, `.btn-dodge`, `.seesaw-slider-track`,
`.gravity-toast`. `.accordion-item` will collide with half the codebases on earth.

**Fix:** Prefix every shipped class with `.winky-`. Breaking change — do it before
there are real users, i.e. now.

### 6. No programmatic API → React wrappers are uncontrolled facades — SEVERITY: HIGH

Components accept `initialValue` and `onChange` and nothing else. No `setValue()`,
no `getValue()`, no way to control a component after creation. Methods are
duct-taped onto DOM nodes (`wrapper.destroy = ...`).

Consequence: `<TiltSlider value={volume} />` — the way React people actually use
inputs — is impossible. The wrappers can never be controlled components.

**Fix:** Factories return an instance object: `{ el, getValue, setValue, destroy, on }`.
Wrappers sync props → `setValue` in an effect.

### 7. Zero types, zero tests, zero CI — SEVERITY: MEDIUM (HIGH for adoption)

- No `.d.ts` → no autocomplete → in practice, untyped npm packages don't get
  adopted anymore.
- Not one test, on a library whose whole pitch is intricate stateful interaction.
- No CI, no lint, no formatting config.

**Fix:** JSDoc-typed source + generated `.d.ts` is the cheap path (no TS rewrite
needed). Vitest + jsdom for state-machine tests (keyboard nav, ARIA state, destroy
cleanup). One GitHub Action.

### 8. Small trust-killers — SEVERITY: LOW individually, HIGH together

| Issue | Detail |
|---|---|
| Component count lie | README says "18 components"; `src/index.js` exports 25 |
| Hardcoded a11y strings | e.g. `'Seesaw volume slider'` aria-label not overridable — bad for i18n and for anyone with two sliders |
| `main` points at `src/` | Shipping untranspiled source as the entry; fine-ish for ESM, but no CJS, no types field |
| Expando properties | `toast._timer`, methods on DOM nodes — leaks internals |
| README ≠ exports | `wobblyRadioGroup`, `springyTabs`, `gravityToast`, `wobblySwitch`, `rippleButton`, `magneticNav`, `elasticDragList` exported but undocumented |

Each is 10 minutes; together they read as "unmaintained."

### What's genuinely good (don't break these)

- **Accessibility effort is real.** ARIA roles/states, keyboard nav (arrows, Home,
  End, Shift-step), focus traps, `role="status"`/`role="alert"` where appropriate,
  reduced-motion *and* reduced-sound media query handling with live listeners.
- **`AudioSynth` is the most differentiated ~200 lines in the repo.** Pure
  oscillator synthesis, gesture-gated, master gain, graceful no-op fallbacks.
  Nobody else on the web does UI acoustics this way.
- **Zero dependencies, vanilla DOM** — correct architectural instinct.
- **`utils.js` primitives** (`addPointerDrag`, `trapFocus`, media-query helpers)
  are clean and reusable — they're the seed of the real product (see below).

---

## Part 2: Direction — Where To Take This

### The strategic problem

VISION.md claims a "physics engine for interactions." **There is no engine in this
repo.** There are 25 components each with their own ad-hoc lerp math copy-pasted
inline. The moat the vision describes — springs, damping, acoustic feedback as a
*layer* — doesn't exist as an artifact anyone can adopt.

And nobody is going to adopt "wobbly design system" as their design system. Shadcn
won; that war is over. But **"add physical feel and synthesized sound to the
components you already have"** is a real wedge — and *nobody* owns the audio half.
Framer Motion does springs; zero libraries do synthesized UI acoustics well.

### The play

**Sprint 1 — Stop the bleeding (1 week).**
Fix findings 1, 2, 3, and 8. Compiled React package, SSR-safe imports, idle rAF
loops, honest README. This is the difference between "launchable" and "embarrassing
on the HN front page when someone runs it in Next."

**Sprint 2 — Invert the architecture (2–3 weeks).**
Extract `@winky/core`:

- the spring/damping engine (one implementation, not 25)
- the gesture layer (`addPointerDrag` already exists)
- `AudioSynth`

Headless, typed, tree-shakeable, framework-agnostic. Rewrite 5 flagship components
on top of it as proof (suggested: TiltSlider, PendulumToggle, GrumpyModal,
SlingshotUpload, MagneticButton). The other 20 become **recipes on the docs site**,
not npm surface area. Twenty-five mediocre components is a demo; five excellent
primitives is a product.

**Then launch** exactly the way GTM-PLAN.md says — that plan is solid. But launch
the *engine + showcase*, not the "design system."

> "Show HN: synthesized audio + spring physics for UI, zero deps, here's the math"

is the version the HN crowd upvotes, and the version that survives someone opening
the source.

### Sequenced checklist

- [ ] Compile `winky-wonky-react` (no raw JSX on npm) + `.d.ts`
- [ ] SSR-safe: lazy-init all `window`/`document` access
- [ ] Fix `needsRender` / rAF idle behavior; guard `onChange` on value change
- [ ] Strip `getControls`/`getCodeSnippet` from library into playground
- [ ] Prefix all shipped CSS classes with `.winky-`; split demo CSS out of `style.css`
- [ ] Instance API: `{ el, getValue, setValue, destroy, on }`; controlled React wrappers
- [ ] README: correct component count, document all exports, configurable aria labels
- [ ] JSDoc types → generated `.d.ts`; Vitest + jsdom; GitHub Actions CI
- [ ] Extract `@winky/core` (springs + gestures + AudioSynth), rebuild 5 flagships on it
- [ ] Re-run the GTM plan with the engine-first framing
