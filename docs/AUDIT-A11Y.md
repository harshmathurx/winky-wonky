# Accessibility & Usability Audit — 2026-08-14

Scope: all 24 components, exercised through the new Storybook stories
(`stories/*.stories.js`), in the default **Dark** theme. Method: automated
`axe-core` scan of every story's rendered DOM (via headless Chromium /
Playwright — the interactive Chrome extension wasn't attached to this
session, so this substitutes for manual click-through with the same
rendering engine), full-page + post-Tab screenshots of every story for
visual review, and a manual source read of every component and the shared
a11y helpers (`src/components/utils.js`, `src/styles/_a11y.css`,
`src/styles/_utilities.css`).

Raw results: `audit-results.json` (24 stories × axe violations + console
errors), screenshots per story (2 each: default state, post-first-Tab) —
generated to a scratch dir, not committed.

## Excluded as false positives (Storybook test-harness artifacts)

Three axe rules fired on **every** story: `landmark-one-main`,
`page-has-heading-one`, `region`. These fail because Storybook's bare
`iframe.html` canvas has no `<main>`/`<h1>`/document landmarks — that's
Storybook's test harness, not something winky-wonky ships. A real host page
provides its own landmarks. Not counted as findings below.

## Findings

### 1. [Fixed] Rotary Color Picker: focusable controls hidden inside an `aria-hidden` wheel

`src/components/rotaryColorPicker.js` — `wheel.setAttribute('aria-hidden',
'true')` is set on the `.winky-rotary-wheel` container, but the 5
interactive palette holes (`role="radio"`, `tabIndex=0`) are appended
*inside* that same wheel. Keyboard/screen-reader users can Tab onto a
control the accessibility tree says doesn't exist — axe: `aria-hidden-focus`
(serious).

### 2. [Fixed] Magnetic Nav: `role="menuitem"` without a `role="menu"` ancestor

`src/components/magneticNav.js` — each nav link gets
`role="menuitem"`, but its ancestor list only has `role="list"`
(`navList.setAttribute('role', 'list')`), not `role="menu"`/`"menubar"`.
`menuitem` requires one of those parents per the ARIA spec — axe:
`aria-required-parent` (critical). This is real nav (arrow-key/Home/End,
not a dropdown menu), so the actual fix is to drop the stray `menuitem`
role rather than add a `menu` ancestor.

### 3. [Fixed] Systemic: text-on-accent contrast fails WCAG AA across ~9 components

The design tokens (`--winky-accent-color` `#6366F1`, `--winky-accent-alt`
`#8B5CF6`) are used both as **fills with white text** and as **text color
directly on the dark page background**. Measured contrast in both cases
lands at roughly 4.0–4.6:1 — under the 4.5:1 AA threshold for normal-weight
text at these sizes (14–16px). axe `color-contrast` (serious) confirmed on:

- `gravityToast.css` `.winky-gravity-toast-trigger` (white text, accent fill)
- `rippleButton.css` `.winky-ripple-btn` (white text, accent fill)
- `grumpyModal.css` trigger button + `.winky-modal-btn-close` (white text, accent/accent-alt fill)
- `magneticButton.css` `.winky-magnetic-btn` (white text, accent fill)
- `magneticNav.css` active link (`aria-current="page"`) — accent-colored text on dark bg
- `pendulumToggle.css` `.winky-toggle-lbl.winky-active`, and the (`aria-hidden`, but still visually rendered — low-vision users still see it) idle side label — accent-colored text on dark bg
- `springyTabs.css` `.winky-springy-tab[aria-selected="true"]` — accent-colored text on dark bg
- `wobblyRadioGroup.css` `.winky-wobbly-radio-item.winky-selected` (white text over the accent-fill indicator bar)
- `rotaryColorPicker.css` `.winky-rotary-hole:hover` (white text, accent fill) — same pattern, only missed by the automated scan because it's hover-only

Decorative accent fills with no text on them (switch/checkbox tracks, tab/nav
underline indicators, slider knobs, progress bars) are **not** part of this
finding — 1.4.3 text-contrast doesn't apply to them, and they retain a
visible border/shape against the background.

### 4. [Fixed] Gravity Toast defaults to `aria-live="assertive"` / `role="alert"` for routine messages

`src/components/gravityToast.js` — every toast (`"Settings saved"`, `"Sync
complete"`, …) is `role="alert"` + `aria-live="assertive"`, which
interrupts whatever a screen reader is currently announcing. That's
appropriate for actual errors, not routine status messages — the default
should be `role="status"` / `aria-live="polite"`.

### 5. Known limitation, not fixed here: Elastic Drag List has no touch-friendly reorder path

`src/components/elasticDragList.js` reorders via native HTML5 drag-and-drop
(`draggable`, `dragstart`/`dragover`/`drop`) with an Alt+Arrow keyboard
fallback — the keyboard path is solid, but native HTML5 DnD doesn't fire on
touch devices in most mobile browsers, and there's no touch-drag or
explicit move-up/move-down button fallback. Fixing this properly means
swapping to `@winkywonky/core`'s pointer-gesture primitives (`addPointerDrag`)
for the drag path, which is a larger, riskier change than the rest of this
audit — flagged for a follow-up rather than patched here.

### 6. Not a bug: Rotary Color Picker mutates the whole page's theme

Dialing a palette applies its colors to `document.documentElement` by
design (it's a theme switcher, not a scoped widget) — already called out in
its story's docs description since this can visibly fight with Storybook's
own theme-switcher toolbar (both write `data-theme` on `<html>`). No code
change; documentation only.

### 7. Not a bug: Grumpy Modal ignores outside-click/Escape

`src/components/grumpyModal.js` deliberately shakes instead of closing on
outside-click or Escape — it's the component's whole personality, and it's
already documented in its JSDoc (`@param` doc + comments). Worth knowing if
you're auditing modal behavior generically, not something to "fix."

## UAT findings (manual interaction pass, post-fix)

A follow-up manual pass — actually clicking, hovering, and typing into every
component's Storybook story (via headless Chromium/Playwright, driven the
same way as the automated sweep above) surfaced four functional bugs the
automated axe scan couldn't catch, since none of them are accessibility-tree
issues — they're real breakage a user would hit:

### 5. [Fixed] Balloon Tooltip: invisible on hover in its own story

Not a library bug — the story's `layout: 'padded'` parameter put the
trigger near the top of the canvas, and the balloon opens *upward*
(`tooltip.style.bottom = calc(100% + stringLength)`), so it rendered
entirely above the visible viewport. Switched the story to the default
`centered` layout, which gives it headroom.

### 6. [Fixed] Grumpy Modal: "Trigger Modal" did nothing

Real bug. `grumpyModal.js` built the overlay by setting ~12 inline styles
in JS (`overlay.style.opacity = '0'`, `overlay.style.pointerEvents =
'none'`, etc.) that duplicated `.winky-modal-overlay` in
`grumpyModal.css` almost line-for-line — except the CSS also had
`.winky-modal-overlay.winky-open { opacity: 1; pointer-events: auto; }`,
and **inline styles always beat class-based CSS rules regardless of
specificity**. `openModal()` added the `winky-open` class correctly, but
it could never win against the inline `opacity: 0; pointer-events: none`
sitting on the same element — the modal was permanently invisible and
unclickable. Deleted the entire redundant inline-style block from the JS
(the CSS class already fully describes the closed/open states); folded its
one intentional difference — a warm brown overlay tint instead of neutral
black — into the CSS rule itself.

### 7. [Fixed] Gravity Toast: clicking the trigger repeatedly walked the button up the page

Real bug (also present, less obviously, on the pre-fix design even outside
Storybook — this is normal-document-flow behavior, not a testing
artifact). Toasts were appended as normal-flow children of the same
container as the trigger button; each new toast grew the container's
height, and anything that vertically centers that container (Storybook's
`centered` layout, but equally a flex/grid consumer layout) shifts as a
result. Toasts are now appended to a `position: fixed` stack
(`.winky-gravity-toast-stack`, top-center) instead — fixed-position
elements are removed from layout flow entirely, so they can no longer
affect the trigger's position no matter how many stack up.

### 8. [Fixed] Rotary Color Picker: dial holes drawn outside the dial's circle

Real bug, and visually the most obvious of the four. `.winky-rotary-dial-outer`
is a 140×140px circle (CSS), but the JS positioned each hole using a
hardcoded center of `(80, 80)` — the correct center for a 160px circle, not
a 140px one. Every hole ended up 10px off-center toward the bottom-right,
pushing 3 of the 5 holes partly or fully outside the visible dial. Fixed
the center to `(70, 70)` to match the actual CSS size.

### 9. [Fixed] Rotary Color Picker leaking its theme into every other story

Not a library bug (the whole point of this component is to restyle the
page it's on — a real app wants that to persist), but a real Storybook-demo
papercut: dialing a light palette left inline `--winky-*` custom
properties on `document.documentElement`, which — same root cause as #6 —
beat the data-theme-attribute rules the toolbar's theme switcher relies on,
so every other story stayed light-themed until a hard refresh. Added a
`.storybook/preview.js` decorator that clears any lingering inline
`--winky-*` overrides before every story renders.

## Fixes

- **#1, #2, #4** — `src/components/rotaryColorPicker.js` (dropped
  `aria-hidden` from the wheel), `src/components/magneticNav.js` (dropped
  the stray `role="menuitem"`), `src/components/gravityToast.js` (toasts
  now default to `role="status"` / `aria-live="polite"`).
- **#3** — Added three new per-theme tokens to `src/styles/_tokens.css`
  (default, `anderson`, `burton`): `--winky-accent-color-text` (accent-hued
  text directly on the page background), `--winky-accent-color-fill-text`
  and `--winky-accent-alt-fill-text` (text sitting on an accent/accent-alt
  fill). Every flagged selector now uses the matching token instead of
  `#fff`/`var(--winky-accent-color)` for its text color; decorative fills
  and every other use of the base accent tokens (borders, glows, non-text
  fills) are untouched. All new pairings verified at ≥4.5:1 (most clear
  5–7.6:1) via the WCAG relative-luminance formula, computed per theme
  since e.g. Burton's `accent-alt` is a *dark* purple (needs light text)
  while its `accent-color` is light (needs dark text) — one direction
  doesn't hold across all three themes. `pendulumToggle.css`'s idle-state
  label also had its `opacity: 0.3` dimming removed — that alone was
  enough to fail AA even with an otherwise-safe text color.
  `grumpyModal.js`'s trigger button (background set inline via JS, not
  reachable from a CSS-only fix) now also sets
  `color: var(--winky-accent-alt-fill-text)` inline alongside its existing
  inline background-color, closing the one gap the systemic CSS fix
  couldn't reach.

## Verification

Re-ran the same axe sweep against all 24 stories after the fixes: **every
story dropped to exactly the 3 excluded Storybook-harness violations and
nothing else** (down from 2–4 real violations each beforehand). Also
re-ran `npm run test:all` (40 tests, all passing) and rebuilt both
`npm run build:lib` and a full `storybook build` clean.
