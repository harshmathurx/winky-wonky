# winky-wonky-react

React wrappers for [winky-wonky](https://github.com/harshmathurx/winky-wonky) —
the physics-based, audio-synthesized component library. Compiled ESM (no raw
JSX shipped), with controlled-component support.

## Install

```bash
npm install winky-wonky winky-wonky-react
```

`react >= 17`, `react-dom >= 17`, and `winky-wonky` are peer dependencies.

## Usage

```jsx
import 'winky-wonky/style.css';
import { TiltSlider, WobblyCheckbox, RatingStars, DrunkLoader } from 'winky-wonky-react';

function App() {
  return (
    <>
      {/* Uncontrolled — initial value + change callback */}
      <TiltSlider initialValue={50} onChange={(v) => console.log(v)} />
      <RatingStars initialRating={3} />
      <DrunkLoader />
    </>
  );
}
```

### Controlled components

Value-bearing components accept a `value` prop. When it changes, the wrapper
calls the underlying instance's `setValue()` — which updates the DOM and ARIA
state **without** firing `onChange` back at you (the standard controlled
contract):

```jsx
function VolumeControl() {
  const [volume, setVolume] = useState(40);
  return <TiltSlider value={volume} onChange={setVolume} />;
}
```

### Props

Every wrapper accepts the same options object as its vanilla factory
(`createTiltSlider`, `createWobblyCheckbox`, …) passed as props — see the main
[winky-wonky Component Reference](https://github.com/harshmathurx/winky-wonky#component-reference)
for the full per-component list. `AudioSynth` is re-exported for global
volume/mute control.

## License

MIT
