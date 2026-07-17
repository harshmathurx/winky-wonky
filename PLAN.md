# Winky-Wonky Remediation Plan

> Execution plan for the findings in [`docs/AUDIT.md`](docs/AUDIT.md). Written to be
> picked up by a fresh agent with no prior context. Read the audit first — it has
> file/line references and severity for every item below.

## Context for the executing agent

- **What this is:** a zero-dependency vanilla-JS UI component library ("physics-first,
  with synthesized audio"). 25 components in `src/components/`, aggregated by
  `src/index.js`. A demo playground lives in `index.html` + `src/main.js` +
  `src/style.css` (component styles and playground styles are currently mixed).
  A React wrapper package lives in `packages/winky-wonky-react/`.
- **Build:** Vite. `npm run dev` (playground), `npm run build:lib` (library IIFE via
  `vite.lib.config.js`). Node/npm may need `nvm use` first — plain `npm` was not on
  PATH in at least one shell.
- **Breaking changes are allowed and expected.** The package has no real adopters
  yet. Target version after this plan: `2.0.0`. Do NOT publish to npm at any point;
  publishing is the owner's call.
- **Do not break the things the audit calls out as genuinely good:** ARIA/keyboard
  support, `prefers-reduced-motion` / `prefers-reduced-sound` handling, gesture-gated
  audio, the `AudioSynth` design, zero runtime dependencies.
- **Workflow:** work on this branch (`audit/product-and-code-audit`) or a child of it.
  One commit per phase minimum, message prefixed `fix:`/`refactor:`/`feat:` as
  appropriate. Run the phase's verification before committing. Update the checkboxes
  in this file as you go.

---

## Phase 0 — Baseline & safety net

**Goal:** know the current state runs, and have a test harness before touching code.

- [x] Verify `npm install`, `npm run dev`, `npm run build`, and `npm run build:lib`
      all succeed. Record any failures before changing anything.
- [x] Add `vitest` + `jsdom` as devDependencies; add `"test": "vitest run"` script.
- [x] Write smoke tests: import every export from `src/index.js` in a jsdom
      environment, call each `create*` factory, assert it returns a DOM node, and
      call `destroy()` if present. This locks in "nothing crashes on create/destroy."
- [x] Add GitHub Actions workflow (`.github/workflows/ci.yml`): install, test,
      build, build:lib on push/PR.

**Verify:** `npm test` green; CI file lints (`act` optional, not required).

---

## Phase 1 — Fatal fixes (audit findings 1–3)

**Goal:** the library can be imported anywhere and doesn't burn CPU at idle.

### 1a. SSR-safe imports (audit #2)
- [ ] `src/components/utils.js:1-3` — replace module-level `window.matchMedia`
      calls with lazy getters (init on first call, guard `typeof window`).
- [ ] `src/components/audioSynth.js:33-34` — move the `document.addEventListener`
      prime-audio hooks into a lazy init (first `AudioSynth` method call or an
      explicit `AudioSynth.init()` invoked by factories).
- [ ] Sweep every file in `src/components/` for other module-level `window`/
      `document`/`matchMedia` access. `grep -n "^\s*\(window\|document\)\." src/components/*.js` is a start, but read each file's top level.
- [ ] Test: a Node (non-jsdom) vitest environment can
      `import('./src/index.js')` without throwing.

### 1b. rAF idle + onChange discipline (audit #3)
- [ ] `src/components/tiltSlider.js` — `needsRender` must reset to `false` after
      render; the rAF loop must stop entirely when settled (no drag, |angle| below
      threshold, value at target) and restart on interaction; `onChange` fires only
      when `Math.round(value)` actually changes, and never double-fires during drag
      (currently fires from both `updateRender` and `onMove`).
- [ ] Audit every other component with a `requestAnimationFrame` loop
      (`grep -ln requestAnimationFrame src/components/*.js`) and apply the same
      pattern: loops idle when settled, restart on interaction, cancel in `destroy`.
- [ ] Test: after creating a tiltSlider and dispatching no events, `onChange` is
      not called; after one keyboard step, it is called exactly once.

### 1c. Compile the React package (audit #1)
- [ ] `packages/winky-wonky-react/` currently ships raw JSX. Add a build
      (vite lib mode or esbuild) that emits plain ESM JS to `dist/`; point
      `main`/`module`/`exports` at the built output; add `prepublishOnly`.
- [ ] Keep `react`, `react-dom`, `winky-wonky` as peerDependencies.
- [ ] Test: `node -e "import('...dist/index.js')"` parses (no JSX syntax errors);
      ideally a tiny vitest + @testing-library/react render test for one wrapper.

**Verify:** Phase 0 smoke tests still green + the three new test groups above.

---

## Phase 2 — Library hygiene (audit findings 4, 5, 8)

**Goal:** consumers get a library, not the playground; nothing collides.

### 2a. Strip playground code from the library (audit #4)
- [ ] Remove `getControls()` and `getCodeSnippet()` from every component in
      `src/components/`. Move that content into a playground-only registry
      (e.g. `src/playground/registry.js`) keyed by component name, consumed by
      `src/main.js`. The playground keeps its knob-tweaking UX; the library sheds it.

### 2b. Namespace and split CSS (audit #5)
- [ ] Prefix every shipped component class with `winky-` (e.g. `.accordion-item`
      → `.winky-accordion-item`, `.seesaw-slider-track` →
      `.winky-seesaw-slider-track`). Update JS `className` assignments and CSS
      together — grep both directions to catch drift.
- [ ] Split `src/style.css` (2,622 lines): per-component files in `src/styles/`,
      an aggregate `src/winky-wonky.css` that imports them, and playground-only
      styles (`.app-container`, `.brand-*`, `.code-inspector`, nav, theme-wipe,
      etc.) moved to `src/playground/playground.css`. Update the `./style.css`
      export in `package.json` to point at the aggregate.
- [ ] Verify the playground still looks right in `npm run dev` (spot-check all tabs
      and both themes) and that `examples/*.html` still work.

### 2c. Honesty pass (audit #8)
- [ ] README: correct the component count (25, not 18), document the 7 undocumented
      exports (`wobblyRadioGroup`, `springyTabs`, `gravityToast`, `wobblySwitch`,
      `rippleButton`, `magneticNav`, `elasticDragList`).
- [ ] Make every hardcoded aria-label an option (e.g. `ariaLabel` with the current
      string as default) — sweep `grep -n "aria-label\|'label'" src/components/*.js`.
- [ ] Remove expando/private leaks where cheap (e.g. `toast._timer` → a WeakMap or
      closure variable).
- [ ] Bump version to `2.0.0-alpha.0` in both package.jsons; note breaking changes
      in `CHANGELOG.md`.

**Verify:** tests green; `npm run build:lib` output contains no `.app-container` or
`getCodeSnippet`; `grep -rn '"accordion-item"\|btn-dodge' src/components/` finds only
`winky-`-prefixed names.

---

## Phase 3 — Real instance API + controlled React wrappers (audit #6)

**Goal:** components are controllable after creation; React wrappers can be
controlled components.

- [ ] Change every factory's return from a bare DOM node with duct-taped methods to
      an instance object: `{ el, getValue?, setValue?, destroy, on?/off? }`.
      Value-bearing components (sliders, toggles, checkbox, radio group, rating,
      tabs, switch, dropdown, input, progress, color picker) must implement
      `getValue`/`setValue`; `setValue` updates DOM + ARIA and does NOT fire
      `onChange` (standard controlled-component contract).
- [ ] Update `src/main.js`, `examples/*.html`, and README snippets to the new
      API (`document.body.appendChild(slider.el)`).
- [ ] Rewrite `packages/winky-wonky-react/index.js`:
      - keep the mount/destroy effect pattern;
      - support controlled usage: when a `value` prop is passed, an effect calls
        `instance.setValue(value)`; `onChange` still proxies out;
      - `BalloonTooltip`'s `trigger` handling stays.
- [ ] Tests: `setValue` updates `aria-valuenow`/`aria-checked` and does not invoke
      `onChange`; keyboard interaction still fires `onChange` once per change;
      a controlled React `<TiltSlider value={x}/>` re-render moves the knob.

**Verify:** full test suite green; playground and examples manually spot-checked.

---

## Phase 4 — Types (audit #7)

**Goal:** autocomplete for consumers without a TypeScript rewrite.

- [ ] Add JSDoc typedefs to every factory's options and instance return type in
      `src/components/*.js` (options object shape, defaults, callbacks).
- [ ] Generate `.d.ts` via `tsc --allowJs --declaration --emitDeclarationOnly`
      (add a `typecheck`/`types` script); add `"types"` field to `package.json`
      exports for both packages.
- [ ] Add the type build to CI and to `prepublishOnly`.

**Verify:** `npm run types` emits declarations with no errors; a scratch `.ts` file
importing `createTiltSlider` type-checks with correct option hints.

---

## Phase 5 — Extract the engine (`@winky/core`)

**Goal:** the "physics engine" the vision claims actually exists as an adoptable
artifact. This is the product bet — see AUDIT.md Part 2 before starting.

- [ ] Create `packages/winky-core/` (headless, typed, zero deps, SSR-safe from
      day one) containing:
      - **springs:** one spring/damper implementation (`createSpring({stiffness,
        damping, mass})` with `set/target/onUpdate/onRest`), replacing the ad-hoc
        per-component lerp math;
      - **gestures:** `addPointerDrag` and friends, moved from
        `src/components/utils.js`;
      - **audio:** `AudioSynth`, moved from `src/components/audioSynth.js`,
        plus a small "sound recipe" API (tick/clack/slide/hum as composable
        presets);
      - **a11y/media helpers:** reduced-motion/sound/pointer utilities.
- [ ] Rebuild 5 flagship components on top of the core as proof:
      **TiltSlider, PendulumToggle, GrumpyModal, SlingshotUpload, MagneticButton.**
      Their component files should shrink to wiring: DOM + ARIA + core primitives.
- [ ] `winky-wonky` depends on `@winky/core` (workspace). Convert the repo to npm
      workspaces if not already.
- [ ] Remaining 20 components keep working unchanged for now (they migrate
      opportunistically later, or become docs-site "recipes" per the audit's
      recommendation — owner's call, flag it in the PR description).
- [ ] Unit-test the spring math (settles, overshoots per damping, `onRest` fires)
      and the audio API (no-ops safely without user gesture / in Node).

**Verify:** full suite green; playground behavior of the 5 flagships is
indistinguishable from before (manual check); `@winky/core` imports cleanly in Node.

---

## Phase 6 — Docs & launch prep

**Goal:** the repo tells the engine-first story the launch needs.

- [ ] README rewrite: lead with `@winky/core` (springs + gestures + synthesized
      audio), then the component layer; accurate counts, accurate claims, quick
      starts for vanilla + React, migration notes 1.x → 2.0.
- [ ] Write `packages/winky-wonky-react/README.md` (currently listed in `files`
      but missing).
- [ ] Update `docs/ARCHITECTURE.md` to match the post-refactor reality.
- [ ] Finalize `CHANGELOG.md` for `2.0.0`; leave version at `2.0.0-alpha.x` —
      **publishing is the owner's decision, not the agent's.**

**Verify:** every command in the READMEs actually works when copy-pasted.

---

## Definition of done

All phase checkboxes checked; CI green on the branch; `npm run dev` playground fully
functional in both themes; library + react package build clean; importing either
package in a bare Node script does not throw; no `onChange` fires without a user
value change; no rAF loop runs while every component is idle.
