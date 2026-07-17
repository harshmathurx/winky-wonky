import { useRef, useEffect } from 'react';
import {
  createTiltSlider,
  createGroovySlider,
  createMischievousButtons,
  createHingeDropdown,
  createTypewriterInput,
  createPendulumToggle,
  createBalloonTooltip,
  createSlimeProgress,
  createGrumpyModalTrigger,
  createRatingStars,
  createSlinkyAccordion,
  createRotaryColorPicker,
  createDrunkLoader,
  createSuspiciousEyes,
  createSlingshotUpload,
  createMagneticButton,
  createWobblyCheckbox,
  createWobblyRadioGroup,
  createSpringyTabs,
  createGravityToast,
  createWobblySwitch,
  createRippleButton,
  createMagneticNav,
  createElasticDragList,
  AudioSynth,
} from 'winky-wonky';

// Mounts a winky-wonky factory instance (`{ el, destroy, getValue?, setValue? }`)
// into a wrapper <div>, and supports controlled usage: when a `value` prop is
// passed, an effect calls `instance.setValue(value)` on every change (and
// once right after creation, so the DOM reflects `value` from first paint).
// `setValue` never fires the component's own `onChange` — see each
// component's `setValue` contract — so this can't create update loops with a
// parent that does `onChange={setValue}`.
function useWinkyComponent(createFn, props) {
  const ref = useRef(null);
  const instanceRef = useRef(null);
  const { value, ...creationOptions } = props;
  const optionsRef = useRef(creationOptions);
  optionsRef.current = creationOptions;
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    if (!ref.current) return;
    const instance = createFn(optionsRef.current);
    if (valueRef.current !== undefined && instance.setValue) {
      instance.setValue(valueRef.current);
    }
    instanceRef.current = instance;
    ref.current.replaceChildren(instance.el);

    return () => {
      instance.destroy?.();
      instanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createFn]);

  // Controlled `value` prop: sync into the instance without re-mounting or
  // firing `onChange`.
  useEffect(() => {
    const instance = instanceRef.current;
    if (!instance || !instance.setValue || value === undefined) return;
    if (instance.getValue && instance.getValue() === value) return;
    instance.setValue(value);
  }, [value]);

  return ref;
}

export function TiltSlider(props) {
  const ref = useWinkyComponent(createTiltSlider, props);
  return <div ref={ref} />;
}

export function GroovySlider(props) {
  const ref = useWinkyComponent(createGroovySlider, props);
  return <div ref={ref} />;
}

export function MischievousButtons(props) {
  const ref = useWinkyComponent(createMischievousButtons, props);
  return <div ref={ref} />;
}

export function HingeDropdown(props) {
  const ref = useWinkyComponent(createHingeDropdown, props);
  return <div ref={ref} />;
}

export function TypewriterInput(props) {
  const ref = useWinkyComponent(createTypewriterInput, props);
  return <div ref={ref} />;
}

export function PendulumToggle(props) {
  const ref = useWinkyComponent(createPendulumToggle, props);
  return <div ref={ref} />;
}

export function BalloonTooltip({ trigger, ...props }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || !trigger) return;
    const instance = createBalloonTooltip({ ...props, triggerNode: trigger });
    ref.current.replaceChildren(instance.el);
    return () => { instance.destroy?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  return <div ref={ref} />;
}

export function SlimeProgress(props) {
  const ref = useWinkyComponent(createSlimeProgress, props);
  return <div ref={ref} />;
}

export function GrumpyModalTrigger(props) {
  const ref = useWinkyComponent(createGrumpyModalTrigger, props);
  return <span ref={ref} />;
}

export function RatingStars(props) {
  const ref = useWinkyComponent(createRatingStars, props);
  return <div ref={ref} />;
}

export function SlinkyAccordion(props) {
  const ref = useWinkyComponent(createSlinkyAccordion, props);
  return <div ref={ref} />;
}

export function RotaryColorPicker(props) {
  const ref = useWinkyComponent(createRotaryColorPicker, props);
  return <div ref={ref} />;
}

export function DrunkLoader(props) {
  const ref = useWinkyComponent(createDrunkLoader, props);
  return <div ref={ref} />;
}

export function SuspiciousEyes(props) {
  const ref = useWinkyComponent(createSuspiciousEyes, props);
  return <div ref={ref} />;
}

export function SlingshotUpload(props) {
  const ref = useWinkyComponent(createSlingshotUpload, props);
  return <div ref={ref} />;
}

export function MagneticButton(props) {
  const ref = useWinkyComponent(createMagneticButton, props);
  return <div ref={ref} />;
}

export function WobblyCheckbox(props) {
  const ref = useWinkyComponent(createWobblyCheckbox, props);
  return <div ref={ref} />;
}

export function WobblyRadioGroup(props) {
  const ref = useWinkyComponent(createWobblyRadioGroup, props);
  return <div ref={ref} />;
}

export function SpringyTabs(props) {
  const ref = useWinkyComponent(createSpringyTabs, props);
  return <div ref={ref} />;
}

export function GravityToast(props) {
  const ref = useWinkyComponent(createGravityToast, props);
  return <div ref={ref} />;
}

export function WobblySwitch(props) {
  const ref = useWinkyComponent(createWobblySwitch, props);
  return <div ref={ref} />;
}

export function RippleButton(props) {
  const ref = useWinkyComponent(createRippleButton, props);
  return <div ref={ref} />;
}

export function MagneticNav(props) {
  const ref = useWinkyComponent(createMagneticNav, props);
  return <div ref={ref} />;
}

export function ElasticDragList(props) {
  const ref = useWinkyComponent(createElasticDragList, props);
  return <div ref={ref} />;
}

export { AudioSynth };
