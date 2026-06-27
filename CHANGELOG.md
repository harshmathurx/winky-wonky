# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

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
