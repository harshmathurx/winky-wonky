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
- [x] `src/components/utils.js:1-3` — replace module-level `window.matchMedia`
      calls with lazy getters (init on first call, guard `typeof window`).
- [x] `src/components/audioSynth.js:33-34` — move the `document.addEventListener`
      prime-audio hooks into a lazy init (first `AudioSynth` method call or an
      explicit `AudioSynth.init()` invoked by factories).
- [x] Sweep every file in `src/components/` for other module-level `window`/
      `document`/`matchMedia` access. `grep -n "^\s*\(window\|document\)\." src/components/*.js` is a start, but read each file's top level.
      (Result: only utils.js/audioSynth.js had real module-level access; all
      other `document.`/`window.` hits in the sweep were inside
      `getCodeSnippet()` template-literal strings, not live code.)
- [x] Test: a Node (non-jsdom) vitest environment can
      `import('./src/index.js')` without throwing.

### 1b. rAF idle + onChange discipline (audit #3)
- [x] `src/components/tiltSlider.js` — `needsRender` must reset to `false` after
      render; the rAF loop must stop entirely when settled (no drag, |angle| below
      threshold, value at target) and restart on interaction; `onChange` fires only
      when `Math.round(value)` actually changes, and never double-fires during drag
      (currently fires from both `updateRender` and `onMove`).
- [x] Audit every other component with a `requestAnimationFrame` loop
      (`grep -ln requestAnimationFrame src/components/*.js`) and apply the same
      pattern: loops idle when settled, restart on interaction, cancel in `destroy`.
      (Result: only `tiltSlider.js` had a true permanent loop. `ratingStars.js`'s
      confetti rAF already self-terminates when particles die and is cancelled in
      `destroy`. `magneticNav.js`/`wobblyRadioGroup.js`/`springyTabs.js`/
      `grumpyModal.js` only use a single one-shot `requestAnimationFrame` on
      init/open, not a loop — no change needed. `drunkLoader.js` runs a
      continuous rAF loop by design (it's an indeterminate loading spinner —
      "always visible and moving" IS its idle/settled state, there's no
      interaction to restart on); left unchanged but it already cancels
      correctly in `destroy`. See final report for full rationale.)
- [x] Test: after creating a tiltSlider and dispatching no events, `onChange` is
      not called; after one keyboard step, it is called exactly once.

### 1c. Compile the React package (audit #1)
- [x] `packages/winky-wonky-react/` currently ships raw JSX. Add a build
      (vite lib mode or esbuild) that emits plain ESM JS to `dist/`; point
      `main`/`module`/`exports` at the built output; add `prepublishOnly`.
- [x] Keep `react`, `react-dom`, `winky-wonky` as peerDependencies.
- [x] Test: `node -e "import('...dist/index.js')"` parses (no JSX syntax errors);
      ideally a tiny vitest + @testing-library/react render test for one wrapper.
      (Verified with `node --check dist/index.js` plus a manual `import()` smoke
      check — see final report. A vitest + @testing-library/react render test
      was not added; flagged as a gap for Phase 2/3's agent.)

**Verify:** Phase 0 smoke tests still green + the three new test groups above.

---

## Phase 2 — Library hygiene (audit findings 4, 5, 8)

**Goal:** consumers get a library, not the playground; nothing collides.

### 2a. Strip playground code from the library (audit #4)
- [x] Remove `getControls()` and `getCodeSnippet()` from every component in
      `src/components/`. Move that content into a playground-only registry
      (e.g. `src/playground/registry.js`) keyed by component name, consumed by
      `src/main.js`. The playground keeps its knob-tweaking UX; the library sheds it.
      (Result: all 24 components stripped. Registry lives at
      `src/playground/registry.js` — a `Map<factoryFn, metadataModule>` — plus one
      `src/playground/registry/<name>.js` per component exporting `getControls(instance)`
      (only where non-empty) and `getCodeSnippet()`. `src/main.js`'s `renderCard`
      looks up `registry.get(data.generator)` instead of reading methods off the
      returned node.)

### 2b. Namespace and split CSS (audit #5)
- [x] Prefix every shipped component class with `winky-` (e.g. `.accordion-item`
      → `.winky-accordion-item`, `.seesaw-slider-track` →
      `.winky-seesaw-slider-track`). Update JS `className` assignments and CSS
      together — grep both directions to catch drift.
      (Result: mechanical 1:1 `winky-` prefix applied to every class token —
      structural *and* modifier classes — in all 24 component `.js` files and their
      matching `src/styles/*.css`. Several `@keyframes` names were prefixed too.
      Two genuine cross-component CSS dependencies were found and reconciled:
      `slinkyAccordion.js`'s inline `squash-press` animation now references
      `mischievousButton.css`'s `winky-squash-press`, and `suspiciousEyes.js`'s
      password input correctly reuses `typewriterInput.css`'s `winky-quill-input`.)
- [x] Split `src/style.css` (2,622 lines): per-component files in `src/styles/`,
      an aggregate `src/winky-wonky.css` that imports them, and playground-only
      styles (`.app-container`, `.brand-*`, `.code-inspector`, nav, theme-wipe,
      etc.) moved to `src/playground/playground.css`. Update the `./style.css`
      export in `package.json` to point at the aggregate.
      (Result: `src/style.css` deleted; replaced by `src/styles/_tokens.css`
      (`:root`/theme-preset variables), `src/styles/_utilities.css` (focus-visible),
      `src/styles/_a11y.css` (shared reduced-motion/pointer-coarse rules for shipped
      component selectors), 24 per-component files, and the aggregate
      `src/winky-wonky.css` (`@import`s all of the above). `src/playground/playground.css`
      holds the app shell/hero/gallery/code-inspector/responsive rules and its own
      playground-only reduced-motion block, and itself `@import`s the library
      aggregate so `index.html` needs only one `<link>`. `package.json`'s
      `./style.css` export and `files` list updated; `vite.lib.config.js`'s copy-css
      plugin now copies `src/winky-wonky.css` **and** `src/styles/` into `dist/`
      (the aggregate's `@import`s are relative, so both must ship together — this
      was almost missed, see final report). Found and fixed one orphaned rule while
      splitting: `.theme-wipe-overlay`/`@keyframes page-wipe` (playground's theme
      toggle transition) was misplaced inside the original Rotary Dial CSS section;
      moved to `playground.css`.)
- [x] Verify the playground still looks right in `npm run dev` (spot-check all tabs
      and both themes) and that `examples/*.html` still work.
      (Result: could not visually spot-check — verified instead via `npm run dev`
      serving `index.html` and all four `examples/*.html` with HTTP 200, `npm run
      build` succeeding, and grep-verifying no unprefixed component selectors
      survive in `dist/styles/*.css`. Flagged for a human visual pass.)

### 2c. Honesty pass (audit #8)
- [x] README: correct the component count (25, not 18), document the 7 undocumented
      exports (`wobblyRadioGroup`, `springyTabs`, `gravityToast`, `wobblySwitch`,
      `rippleButton`, `magneticNav`, `elasticDragList`).
      (Result: used **24**, not 25 — recounting `src/index.js`'s actual exports
      gives 24 `create*` factories; `AudioSynth` and the 5 media-query helpers are
      separate, not "components." The original 1.0.0 CHANGELOG's own category
      breakdown (7+6+4+7) already summed to 24 despite its headline claiming 25, so
      "25" was never actually correct either — flagging this as a deliberate
      deviation from the plan's literal wording in service of the same honesty goal.
      Also fixed a second live "18 components" instance in `index.html`'s hero
      stats that the audit missed. All 7 previously-undocumented exports now have
      full option tables in the Component Reference section, plus a new "Instance
      API" section and updated Quick Start/React Usage snippets using `.el` and
      controlled `value` usage.)
- [x] Make every hardcoded aria-label an option (e.g. `ariaLabel` with the current
      string as default) — sweep `grep -n "aria-label\|'label'" src/components/*.js`.
      (Result: swept all 24 files; every hardcoded aria-label string became an
      option with the original text as default — `ariaLabel` on 11 components,
      `dismissAriaLabel` (gravityToast), `inputAriaLabel`/`revealAriaLabel`
      (suspiciousEyes), `dodgeAriaLabel`/`squashAriaLabel`/`lazyAriaLabel`
      (mischievousButton, 3 independently-labeled buttons). `magneticNav`'s
      pre-existing `label` option and `wobblySwitch`/`typewriterInput`/`rippleButton`'s
      pre-existing `ariaLabel` options were left as-is. Final grep for hardcoded
      `setAttribute('aria-label', '...')` string literals: zero hits.)
- [x] Remove expando/private leaks where cheap (e.g. `toast._timer` → a WeakMap or
      closure variable).
      (Result: `toast._timer` → `WeakMap` in `gravityToast.js`. All 24 components'
      `wrapper.destroy = ...`/`wrapper.getControls = ...`/`wrapper.getCodeSnippet = ...`
      expando-on-DOM-node patterns removed as part of the Phase 3 instance-API
      conversion — `destroy` is now a plain closure returned in the instance object,
      not a property assigned onto the DOM node. Final sweep for other `._foo`
      expando patterns: zero hits.)
- [x] Bump version to `2.0.0-alpha.0` in both package.jsons; note breaking changes
      in `CHANGELOG.md`.
      (Result: done, including the react package's `winky-wonky` peerDependency
      range bumped to `>=2.0.0-alpha.0`. `CHANGELOG.md` has a full `## [2.0.0-alpha.0]`
      entry — Breaking/Fixed/Added sections covering every audit finding addressed
      in Phases 1-3.)

**Verify:** tests green; `npm run build:lib` output contains no `.app-container` or
`getCodeSnippet`; `grep -rn '"accordion-item"\|btn-dodge' src/components/` finds only
`winky-`-prefixed names.
(All three confirmed — see final report.)

---

## Phase 3 — Real instance API + controlled React wrappers (audit #6)

**Goal:** components are controllable after creation; React wrappers can be
controlled components.

- [x] Change every factory's return from a bare DOM node with duct-taped methods to
      an instance object: `{ el, getValue?, setValue?, destroy, on?/off? }`.
      Value-bearing components (sliders, toggles, checkbox, radio group, rating,
      tabs, switch, dropdown, input, progress, color picker) must implement
      `getValue`/`setValue`; `setValue` updates DOM + ARIA and does NOT fire
      `onChange` (standard controlled-component contract).
      (Result: all 24 factories return `{ el, destroy, ... }`; the 12 value-bearing
      components (tiltSlider, groovySlider, pendulumToggle, wobblyCheckbox,
      wobblyRadioGroup, ratingStars, springyTabs, wobblySwitch, hingeDropdown,
      typewriterInput, slimeProgress, rotaryColorPicker) additionally implement
      `getValue`/`setValue` per the no-onChange contract. Components with
      "secondary tunable knobs" beyond the primary value (e.g. tiltSlider's
      `gravity`/`maxTilt`/`springLag`) expose a plain mutable `config` object for
      passively-read knobs, or a `setOptions(partial)` method where changing the
      knob requires an immediate recompute (e.g. groovySlider's notch/wave
      redraw, hingeDropdown's reopen-if-open). `on`/`off` were not implemented
      anywhere — no component has event types beyond the existing `onChange`
      option, so there was nothing for them to add. One deliberate API deviation:
      `wobblyRadioGroup`'s pre-existing `label` option was renamed to `ariaLabel`
      for naming consistency with the rest of the library (breaking, but this is
      the 2.0 major).)
- [x] Update `src/main.js`, `examples/*.html`, and README snippets to the new
      API (`document.body.appendChild(slider.el)`).
      (Result: `src/main.js`'s `renderCard`/`loadTab` updated to `instance.el`
      throughout. All 4 `examples/*.html` files and both live and illustrative
      code snippets in `getting-started.html` updated to `.el` and to the current
      `winky-`-prefixed class names where they queried internals.)
- [x] Rewrite `packages/winky-wonky-react/index.js`:
      - keep the mount/destroy effect pattern;
      - support controlled usage: when a `value` prop is passed, an effect calls
        `instance.setValue(value)`; `onChange` still proxies out;
      - `BalloonTooltip`'s `trigger` handling stays.
      (Result: rewritten at `packages/winky-wonky-react/src/index.jsx`.
      `useWinkyComponent` now mounts `instance.el`, calls `instance.setValue(value)`
      once immediately after creation (so a `value` prop is reflected from first
      paint even for components with no dedicated "initial value" creation option,
      e.g. `WobblyCheckbox`) and again in a `[value]`-keyed effect on every change.
      No per-component "which option is the initial value" mapping was needed —
      the single post-creation `setValue` call handles it uniformly.
      `BalloonTooltip`'s separate `trigger`-keyed effect is unchanged.)
- [x] Tests: `setValue` updates `aria-valuenow`/`aria-checked` and does not invoke
      `onChange`; keyboard interaction still fires `onChange` once per change;
      a controlled React `<TiltSlider value={x}/>` re-render moves the knob.
      (Result: `tests/tiltSlider.test.js` has a new "instance API" describe block
      covering `getValue`/`setValue` + the no-onChange guarantee (keyboard-fires-once
      coverage already existed from Phase 1). `packages/winky-wonky-react/test/`
      added (new — package had zero tests before): `TiltSlider.test.jsx` covers the
      controlled-value-moves-the-knob case via `@testing-library/react`;
      `WobblyCheckbox.test.jsx` covers the boolean/no-creation-option case.
      `tests/smoke.test.js` rewritten for the `{ el, destroy, ... }` contract and
      extended to assert `getValue`/`setValue` exist on the 12 value-bearing
      components and that no `getControls`/`getCodeSnippet` leak onto instances.)

**Verify:** full test suite green; playground and examples manually spot-checked.
(Result: 35 root tests + 5 react-package tests, all green. Playground/examples
spot-checked via HTTP smoke test, not visually — see Phase 2b note above and the
final report's gotchas for Agent 3/the human owner.)

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
