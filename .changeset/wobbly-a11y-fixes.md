---
"winky-wonky": patch
---

Fix accessibility issues found in an audit: Rotary Color Picker no longer hides its focusable palette holes from assistive tech via a stray `aria-hidden`; Magnetic Nav no longer sets an invalid `role="menuitem"` without a `menu`/`menubar` ancestor; Gravity Toast now announces via `role="status"`/`aria-live="polite"` instead of interrupting with `assertive`/`alert` for routine messages; and text-on-accent-color contrast across Gravity Toast, Ripple Button, Grumpy Modal, Magnetic Button, Magnetic Nav, Pendulum Toggle, Springy Tabs, Wobbly Radio Group, and Rotary Color Picker now meets WCAG AA (4.5:1) in all three built-in themes via new `--winky-accent-color-text`/`--winky-accent-color-fill-text`/`--winky-accent-alt-fill-text` tokens.
