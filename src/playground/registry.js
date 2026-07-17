// Playground-only registry: maps each factory function to its demo
// metadata (the "Parameters" tuning panel + "Show HTML/CSS" code snippet).
// None of this ships in the library — see src/components/*.js for the real
// components, which no longer carry any of this. Consumed by src/main.js.
import { createTiltSlider } from '../components/tiltSlider.js';
import { createGroovySlider } from '../components/groovySlider.js';
import { createMischievousButtons } from '../components/mischievousButton.js';
import { createHingeDropdown } from '../components/hingeDropdown.js';
import { createTypewriterInput } from '../components/typewriterInput.js';
import { createPendulumToggle } from '../components/pendulumToggle.js';
import { createBalloonTooltip } from '../components/balloonTooltip.js';
import { createSlimeProgress } from '../components/slimeProgress.js';
import { createGrumpyModalTrigger } from '../components/grumpyModal.js';
import { createRatingStars } from '../components/ratingStars.js';
import { createSlinkyAccordion } from '../components/slinkyAccordion.js';
import { createRotaryColorPicker } from '../components/rotaryColorPicker.js';
import { createDrunkLoader } from '../components/drunkLoader.js';
import { createSuspiciousEyes } from '../components/suspiciousEyes.js';
import { createSlingshotUpload } from '../components/slingshotUpload.js';
import { createMagneticButton } from '../components/magneticButton.js';
import { createWobblyCheckbox } from '../components/wobblyCheckbox.js';
import { createWobblyRadioGroup } from '../components/wobblyRadioGroup.js';
import { createSpringyTabs } from '../components/springyTabs.js';
import { createGravityToast } from '../components/gravityToast.js';
import { createWobblySwitch } from '../components/wobblySwitch.js';
import { createRippleButton } from '../components/rippleButton.js';
import { createMagneticNav } from '../components/magneticNav.js';
import { createElasticDragList } from '../components/elasticDragList.js';

import * as tiltSlider from './registry/tiltSlider.js';
import * as groovySlider from './registry/groovySlider.js';
import * as mischievousButton from './registry/mischievousButton.js';
import * as hingeDropdown from './registry/hingeDropdown.js';
import * as typewriterInput from './registry/typewriterInput.js';
import * as pendulumToggle from './registry/pendulumToggle.js';
import * as balloonTooltip from './registry/balloonTooltip.js';
import * as slimeProgress from './registry/slimeProgress.js';
import * as grumpyModal from './registry/grumpyModal.js';
import * as ratingStars from './registry/ratingStars.js';
import * as slinkyAccordion from './registry/slinkyAccordion.js';
import * as rotaryColorPicker from './registry/rotaryColorPicker.js';
import * as drunkLoader from './registry/drunkLoader.js';
import * as suspiciousEyes from './registry/suspiciousEyes.js';
import * as slingshotUpload from './registry/slingshotUpload.js';
import * as magneticButton from './registry/magneticButton.js';
import * as wobblyCheckbox from './registry/wobblyCheckbox.js';
import * as wobblyRadioGroup from './registry/wobblyRadioGroup.js';
import * as springyTabs from './registry/springyTabs.js';
import * as gravityToast from './registry/gravityToast.js';
import * as wobblySwitch from './registry/wobblySwitch.js';
import * as rippleButton from './registry/rippleButton.js';
import * as magneticNav from './registry/magneticNav.js';
import * as elasticDragList from './registry/elasticDragList.js';

export const registry = new Map([
  [createTiltSlider, tiltSlider],
  [createGroovySlider, groovySlider],
  [createMischievousButtons, mischievousButton],
  [createHingeDropdown, hingeDropdown],
  [createTypewriterInput, typewriterInput],
  [createPendulumToggle, pendulumToggle],
  [createBalloonTooltip, balloonTooltip],
  [createSlimeProgress, slimeProgress],
  [createGrumpyModalTrigger, grumpyModal],
  [createRatingStars, ratingStars],
  [createSlinkyAccordion, slinkyAccordion],
  [createRotaryColorPicker, rotaryColorPicker],
  [createDrunkLoader, drunkLoader],
  [createSuspiciousEyes, suspiciousEyes],
  [createSlingshotUpload, slingshotUpload],
  [createMagneticButton, magneticButton],
  [createWobblyCheckbox, wobblyCheckbox],
  [createWobblyRadioGroup, wobblyRadioGroup],
  [createSpringyTabs, springyTabs],
  [createGravityToast, gravityToast],
  [createWobblySwitch, wobblySwitch],
  [createRippleButton, rippleButton],
  [createMagneticNav, magneticNav],
  [createElasticDragList, elasticDragList],
]);
