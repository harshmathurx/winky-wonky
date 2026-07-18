# @winky/core

**The physics engine for UI feel.** One damped-spring implementation, a unified
pointer-gesture layer, synthesized Web Audio feedback, and accessibility media
helpers. Headless, framework-agnostic, zero dependencies, SSR-safe.

This is the engine underneath [winky-wonky](https://github.com/harshmathurx/winky-wonky) —
but it's designed to add physical feel to *any* UI, including the design system
you already have.

## Install

```bash
npm install @winky/core
```

## `createSpring(options)`

A damped harmonic oscillator advanced with the exact closed-form solution
(unconditionally numerically stable — no Euler blow-ups at high stiffness).
`stiffness`/`damping`/`mass` follow the same scale as Framer Motion /
react-spring. The internal rAF loop **only runs while the spring is moving**:
`onRest` guarantees zero idle CPU.

```javascript
import { createSpring } from '@winky/core';

const spring = createSpring({
  stiffness: 170,  // k — higher = snappier (default 170)
  damping: 14,     // c — 2*sqrt(k*m) is critical damping; lower = bouncier (default 26)
  mass: 1,         // m — higher = more inertia (default 1)
  value: 0,        // initial value
  precision: 0.01, // rest threshold for distance AND velocity
});

const unsubscribe = spring.onUpdate((value, velocity) => {
  el.style.transform = `translateX(${value}px)`;
});
spring.onRest((value) => console.log('settled at', value));

spring.target(100);   // animate toward 100 (starts the loop)
spring.set(0);        // jump instantly, zero velocity, no callbacks
spring.isSettled();   // => boolean
spring.stop();        // cancel the loop, keep state
spring.destroy();     // alias for stop()
```

## `addPointerDrag(target, handlers)`

Unified mouse + touch + pen dragging via Pointer Events.

```javascript
import { addPointerDrag } from '@winky/core';

const remove = addPointerDrag(knob, {
  onDown(e) { spring.stop(); },
  onMove(e) { spring.set(e.clientX); },
  onUp(e)   { spring.target(snapPoint); },
});
// remove() tears down all listeners
```

## `AudioSynth` and `soundRecipes`

Pure-oscillator UI sounds — no audio files, no network requests. Playback is
gated behind the first user gesture (browser autoplay policy) and respects
`prefers-reduced-sound` automatically.

```javascript
import { AudioSynth, soundRecipes } from '@winky/core';

AudioSynth.playTick();              // notch snap
AudioSynth.playClack();             // button bottom-out
const slide = AudioSynth.startSlide();  // continuous; slide.update(pitch), slide.stop()
const hum = AudioSynth.startHum();      // proximity hum; hum.updateVolume(dist), hum.stop()

AudioSynth.setVolume(0.35);  // 0..1 master gain
AudioSynth.mute();
AudioSynth.unmute();
AudioSynth.init();           // optional eager init; every method also lazy-inits

// soundRecipes are the underlying parameter presets (waveform, freq/gain
// envelopes) — start from one and tweak to design your own feedback sounds.
```

## Media / accessibility helpers

```javascript
import {
  prefersReducedMotion, prefersReducedSound, isCoarsePointer,
  shouldAnimate, shouldPlaySound,
  onReducedMotionChange, onReducedSoundChange, onPointerTypeChange,
} from '@winky/core';

if (shouldAnimate()) spring.target(100);
const off = onReducedMotionChange(() => { /* re-check and adapt */ });
```

All helpers are lazily initialized and safe to import (not call) in Node/SSR —
`import '@winky/core'` never touches `window` or `document` at module scope.

## Types

JSDoc-typed source with generated `.d.ts` declarations — full autocomplete in
TypeScript and JS projects.

## License

MIT
