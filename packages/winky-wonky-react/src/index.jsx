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

/**
 * @typedef {import('winky-wonky/components/tiltSlider.js').TiltSliderOptions} TiltSliderOptions
 * @typedef {import('winky-wonky/components/groovySlider.js').GroovySliderOptions} GroovySliderOptions
 * @typedef {import('winky-wonky/components/mischievousButton.js').MischievousButtonsOptions} MischievousButtonsOptions
 * @typedef {import('winky-wonky/components/hingeDropdown.js').HingeDropdownOptions} HingeDropdownOptions
 * @typedef {import('winky-wonky/components/typewriterInput.js').TypewriterInputOptions} TypewriterInputOptions
 * @typedef {import('winky-wonky/components/pendulumToggle.js').PendulumToggleOptions} PendulumToggleOptions
 * @typedef {import('winky-wonky/components/balloonTooltip.js').BalloonTooltipOptions} BalloonTooltipOptions
 * @typedef {import('winky-wonky/components/slimeProgress.js').SlimeProgressOptions} SlimeProgressOptions
 * @typedef {import('winky-wonky/components/grumpyModal.js').GrumpyModalOptions} GrumpyModalOptions
 * @typedef {import('winky-wonky/components/ratingStars.js').RatingStarsOptions} RatingStarsOptions
 * @typedef {import('winky-wonky/components/slinkyAccordion.js').SlinkyAccordionOptions} SlinkyAccordionOptions
 * @typedef {import('winky-wonky/components/rotaryColorPicker.js').RotaryColorPickerOptions} RotaryColorPickerOptions
 * @typedef {import('winky-wonky/components/drunkLoader.js').DrunkLoaderOptions} DrunkLoaderOptions
 * @typedef {import('winky-wonky/components/suspiciousEyes.js').SuspiciousEyesOptions} SuspiciousEyesOptions
 * @typedef {import('winky-wonky/components/slingshotUpload.js').SlingshotUploadOptions} SlingshotUploadOptions
 * @typedef {import('winky-wonky/components/magneticButton.js').MagneticButtonOptions} MagneticButtonOptions
 * @typedef {import('winky-wonky/components/wobblyCheckbox.js').WobblyCheckboxOptions} WobblyCheckboxOptions
 * @typedef {import('winky-wonky/components/wobblyRadioGroup.js').WobblyRadioGroupOptions} WobblyRadioGroupOptions
 * @typedef {import('winky-wonky/components/springyTabs.js').SpringyTabsOptions} SpringyTabsOptions
 * @typedef {import('winky-wonky/components/gravityToast.js').GravityToastOptions} GravityToastOptions
 * @typedef {import('winky-wonky/components/wobblySwitch.js').WobblySwitchOptions} WobblySwitchOptions
 * @typedef {import('winky-wonky/components/rippleButton.js').RippleButtonOptions} RippleButtonOptions
 * @typedef {import('winky-wonky/components/magneticNav.js').MagneticNavOptions} MagneticNavOptions
 * @typedef {import('winky-wonky/components/elasticDragList.js').ElasticDragListOptions} ElasticDragListOptions
 */

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

/** @param {TiltSliderOptions & {value?: number}} props */
export function TiltSlider(props) {
  const ref = useWinkyComponent(createTiltSlider, props);
  return <div ref={ref} />;
}

/** @param {GroovySliderOptions & {value?: number}} props */
export function GroovySlider(props) {
  const ref = useWinkyComponent(createGroovySlider, props);
  return <div ref={ref} />;
}

/** @param {MischievousButtonsOptions} props */
export function MischievousButtons(props) {
  const ref = useWinkyComponent(createMischievousButtons, props);
  return <div ref={ref} />;
}

/** @param {HingeDropdownOptions & {value?: string}} props */
export function HingeDropdown(props) {
  const ref = useWinkyComponent(createHingeDropdown, props);
  return <div ref={ref} />;
}

/** @param {TypewriterInputOptions & {value?: string}} props */
export function TypewriterInput(props) {
  const ref = useWinkyComponent(createTypewriterInput, props);
  return <div ref={ref} />;
}

/** @param {PendulumToggleOptions & {value?: boolean}} props */
export function PendulumToggle(props) {
  const ref = useWinkyComponent(createPendulumToggle, props);
  return <div ref={ref} />;
}

/** @param {BalloonTooltipOptions & {trigger?: HTMLElement}} props */
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

/** @param {SlimeProgressOptions & {value?: number}} props */
export function SlimeProgress(props) {
  const ref = useWinkyComponent(createSlimeProgress, props);
  return <div ref={ref} />;
}

/** @param {GrumpyModalOptions} props */
export function GrumpyModalTrigger(props) {
  const ref = useWinkyComponent(createGrumpyModalTrigger, props);
  return <span ref={ref} />;
}

/** @param {RatingStarsOptions & {value?: number}} props */
export function RatingStars(props) {
  const ref = useWinkyComponent(createRatingStars, props);
  return <div ref={ref} />;
}

/** @param {SlinkyAccordionOptions} props */
export function SlinkyAccordion(props) {
  const ref = useWinkyComponent(createSlinkyAccordion, props);
  return <div ref={ref} />;
}

/** @param {RotaryColorPickerOptions & {value?: number}} props */
export function RotaryColorPicker(props) {
  const ref = useWinkyComponent(createRotaryColorPicker, props);
  return <div ref={ref} />;
}

/** @param {DrunkLoaderOptions} props */
export function DrunkLoader(props) {
  const ref = useWinkyComponent(createDrunkLoader, props);
  return <div ref={ref} />;
}

/** @param {SuspiciousEyesOptions} props */
export function SuspiciousEyes(props) {
  const ref = useWinkyComponent(createSuspiciousEyes, props);
  return <div ref={ref} />;
}

/** @param {SlingshotUploadOptions} props */
export function SlingshotUpload(props) {
  const ref = useWinkyComponent(createSlingshotUpload, props);
  return <div ref={ref} />;
}

/** @param {MagneticButtonOptions} props */
export function MagneticButton(props) {
  const ref = useWinkyComponent(createMagneticButton, props);
  return <div ref={ref} />;
}

/** @param {WobblyCheckboxOptions & {value?: boolean}} props */
export function WobblyCheckbox(props) {
  const ref = useWinkyComponent(createWobblyCheckbox, props);
  return <div ref={ref} />;
}

/** @param {WobblyRadioGroupOptions & {value?: string}} props */
export function WobblyRadioGroup(props) {
  const ref = useWinkyComponent(createWobblyRadioGroup, props);
  return <div ref={ref} />;
}

/** @param {SpringyTabsOptions & {value?: number}} props */
export function SpringyTabs(props) {
  const ref = useWinkyComponent(createSpringyTabs, props);
  return <div ref={ref} />;
}

/** @param {GravityToastOptions} props */
export function GravityToast(props) {
  const ref = useWinkyComponent(createGravityToast, props);
  return <div ref={ref} />;
}

/** @param {WobblySwitchOptions & {value?: boolean}} props */
export function WobblySwitch(props) {
  const ref = useWinkyComponent(createWobblySwitch, props);
  return <div ref={ref} />;
}

/** @param {RippleButtonOptions} props */
export function RippleButton(props) {
  const ref = useWinkyComponent(createRippleButton, props);
  return <div ref={ref} />;
}

/** @param {MagneticNavOptions} props */
export function MagneticNav(props) {
  const ref = useWinkyComponent(createMagneticNav, props);
  return <div ref={ref} />;
}

/** @param {ElasticDragListOptions} props */
export function ElasticDragList(props) {
  const ref = useWinkyComponent(createElasticDragList, props);
  return <div ref={ref} />;
}

export { AudioSynth };
