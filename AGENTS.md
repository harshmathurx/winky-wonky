# AGENTS.md

## Project
Winky-Wonky: physics-first UI component library. Vanilla JS, zero dependencies, Web Audio synthesis.

## Commands
- `npm run dev` — start Vite dev server (port 5173)
- `npm run build` — production build to `dist/`
- `npm run preview` — preview production build

## Architecture
- `src/components/` — 25 component factories, each returns a DOM node with `.destroy()`, `.getControls()`, `.getCodeSnippet()`
- `src/components/utils.js` — shared helpers: `prefersReducedMotion`, `setAria`, `trapFocus`, `addPointerDrag`
- `src/components/audioSynth.js` — Web Audio synthesis, 2 sounds (tick/clack), default volume 0.15
- `src/style.css` — complete design system, dark premium default, Anderson/Burton presets
- `src/main.js` — playground app (hero landing, gallery, tabbed component showcase)
- `src/index.js` — library entry point (npm package export)
- `packages/winky-wonky-react/` — React wrapper package
- `examples/` — standalone showcase pages (landing, pricing, settings)
- `docs/` — vision, architecture, design system spec, GTM plan

## Conventions
- No comments in code unless explicitly asked
- No external dependencies — vanilla JS only
- All components: ARIA roles, keyboard nav, reduced-motion/sound respect, pointer events (touch)
- CSS tokens: `--winky-*` prefix
- Audio: `playTick()` for subtle feedback, `playClack()` for button presses. No other sounds.
- Default theme: dark premium (no `data-theme` attribute). `[data-theme="anderson"]` and `[data-theme="burton"]` are presets.
