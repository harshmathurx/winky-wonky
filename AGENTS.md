# AGENTS.md

## Project
Winky-Wonky: physics-first UI component library. Vanilla JS, zero dependencies, Web Audio synthesis.

## Commands
- `npm run dev` — start Vite dev server (port 5173), serves the playground
- `npm run build` — playground build to `dist/`
- `npm run build:lib` — library build (ESM + IIFE + CSS) to `dist/`
- `npm test` — vitest (jsdom + node environments)
- `npm run preview` — preview production build

## Architecture
- `src/components/` — 24 component factories + `AudioSynth`, each factory returns an
  instance object `{ el, destroy, getValue?, setValue?, config?, setOptions? }` — `el`
  is the DOM node to mount, not the return value itself
- `src/components/utils.js` — shared helpers: `prefersReducedMotion`, `setAria`, `trapFocus`, `addPointerDrag`
- `src/components/audioSynth.js` — Web Audio synthesis, 2 sounds (tick/clack), default volume 0.15
- `src/winky-wonky.css` — published library CSS aggregate (`@import`s `src/styles/*.css`: design tokens, shared a11y rules, one file per component). All shipped classes are `winky-`-prefixed.
- `src/playground/` — demo-app-only code, never published: `playground.css` (app shell/hero/gallery), `registry.js` + `registry/*.js` (per-component "Parameters" panel + code snippet, keyed by factory function)
- `src/main.js` — playground app (hero landing, gallery, tabbed component showcase)
- `src/index.js` — library entry point (npm package export)
- `packages/winky-wonky-react/` — React wrapper package (own build + tests, not an npm workspace yet)
- `examples/` — standalone showcase pages (landing, pricing, settings, getting-started)
- `docs/` — vision, architecture, design system spec, GTM plan, audit, remediation plan

## Conventions
- No comments in code unless explicitly asked
- No external dependencies — vanilla JS only
- All components: ARIA roles, keyboard nav, reduced-motion/sound respect, pointer events (touch)
- CSS: every shipped class is `winky-`-prefixed; CSS variable tokens use `--winky-*`
- Playground-only code (demo controls, code snippets, app chrome) never lives in `src/components/` — it goes in `src/playground/`
- Audio: `playTick()` for subtle feedback, `playClack()` for button presses. No other sounds.
- Default theme: dark premium (no `data-theme` attribute). `[data-theme="anderson"]` and `[data-theme="burton"]` are presets.
