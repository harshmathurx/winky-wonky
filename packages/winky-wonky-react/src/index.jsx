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

function useWinkyComponent(createFn, options) {
  const ref = useRef(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (!ref.current) return;
    const node = createFn(optionsRef.current);
    ref.current.replaceChildren(node);

    return () => {
      if (node.destroy) node.destroy();
    };
  }, [createFn]);

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
    const node = createBalloonTooltip({ ...props, triggerNode: trigger });
    ref.current.replaceChildren(node);
    return () => { if (node.destroy) node.destroy(); };
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
