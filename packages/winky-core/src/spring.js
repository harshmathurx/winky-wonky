/**
 * A single, reusable damped-harmonic-oscillator spring — the "one spring
 * implementation, not 25" called for in the audit. Every ad-hoc lerp/gravity
 * loop in the individual components can be replaced by an instance of this.
 *
 * Physics: F = -k(x - target) - c*v, advanced each frame via the exact
 * closed-form solution to that ODE (the "Ryan Juckett damped spring"
 * formulation), not naive Euler integration — this is unconditionally
 * numerically stable for any timestep/stiffness/damping/mass combination.
 * (A naive `velocity += acceleration * dt` step is only conditionally
 * stable and visibly fails — oscillates forever instead of settling — for
 * stiff, highly-damped configs at 60fps.) `stiffness` (k) and `damping` (c)
 * follow the same naming/scale as Framer Motion/react-spring so the
 * defaults (170/26) feel familiar; critical damping for that stiffness+mass
 * is `2 * sqrt(stiffness * mass)` ≈ 26.08, so the defaults are very
 * slightly underdamped (a barely-perceptible settle, no visible overshoot).
 * Pass a smaller `damping` for a bouncier, overshooting spring.
 */

/**
 * @typedef {Object} SpringOptions
 * @property {number} [stiffness=170] - Spring constant (k). Higher = snappier.
 * @property {number} [damping=26] - Damping coefficient (c). Higher = less
 *   oscillation. `2 * sqrt(stiffness * mass)` is critical damping.
 * @property {number} [mass=1] - Mass (m). Higher = slower to accelerate.
 * @property {number} [value=0] - Initial value.
 * @property {number} [target=value] - Initial target (defaults to `value`,
 *   i.e. the spring starts at rest).
 * @property {number} [precision=0.01] - `onRest` fires once both the
 *   distance-to-target and the velocity drop below this.
 * @property {number} [maxDeltaTime=1/30] - Per-frame time step is clamped to
 *   this many seconds, so a tab returning from background doesn't apply one
 *   huge, unstable physics step.
 */

/**
 * @typedef {Object} SpringInstance
 * @property {number} value - Current value (read-only; use `set`/`target` to change it).
 * @property {number} velocity - Current velocity (read-only).
 * @property {(v: number) => void} set - Jumps immediately to `v` with zero
 *   velocity, stops the loop, and does NOT fire `onUpdate`/`onRest` (a
 *   `setValue`-style programmatic reset — read `.value` afterward if you
 *   need to react to it).
 * @property {(v?: number) => number} target - With an argument, sets a new
 *   target and (re)starts the rAF loop toward it if not already there;
 *   returns the (possibly just-set) target. With no argument, just returns
 *   the current target.
 * @property {(cb: (value: number, velocity: number) => void) => () => void} onUpdate -
 *   Subscribes to every physics step while the loop is running. Returns an unsubscribe function.
 * @property {(cb: (value: number) => void) => () => void} onRest - Subscribes
 *   to the loop settling (distance + velocity both under `precision`).
 *   Returns an unsubscribe function.
 * @property {() => boolean} isSettled - Whether the spring is currently at rest.
 * @property {() => void} stop - Cancels the rAF loop without changing `value`/`target`.
 * @property {() => void} destroy - Alias for `stop`, for symmetry with
 *   other winky instances' teardown method.
 */

/**
 * Creates a damped spring. The internal rAF loop only runs while the spring
 * is moving — `stop`/`onRest` guarantee no idle CPU use, matching the
 * "loops idle when settled" contract the rest of the library follows.
 * @param {SpringOptions} [options]
 * @returns {SpringInstance}
 */
export function createSpring(options = {}) {
  const stiffness = options.stiffness ?? 170;
  const damping = options.damping ?? 26;
  const mass = options.mass ?? 1;
  const precision = options.precision ?? 0.01;
  const maxDeltaTime = options.maxDeltaTime ?? 1 / 30;

  let value = options.value ?? 0;
  let velocity = 0;
  let targetValue = options.target ?? value;

  const updateListeners = new Set();
  const restListeners = new Set();

  let rafId = null;
  let lastTime = null;

  function isSettled() {
    return Math.abs(targetValue - value) < precision && Math.abs(velocity) < precision;
  }

  // Exact (closed-form) damped-harmonic-oscillator step, not naive Euler
  // integration. A naive `velocity += acceleration * dt; value += velocity *
  // dt` update is only *conditionally* stable — for a stiff/highly-damped
  // config (e.g. damping=200 at 60fps) `dt` can exceed the integrator's
  // stability bound and the spring oscillates forever instead of settling.
  // This closed-form solution (the standard "Ryan Juckett damped spring"
  // formulation) is unconditionally stable for any dt/stiffness/damping/mass
  // combination because it's not an approximation — it's the analytic
  // solution to the ODE evaluated at exactly `dt`.
  function stepPhysics(dt) {
    const angularFrequency = Math.sqrt(stiffness / mass);
    if (angularFrequency < 1e-5) return; // no restoring force: nothing to do

    const dampingRatio = damping / (2 * Math.sqrt(stiffness * mass));
    const relPos = value - targetValue;
    const relVel = velocity;

    let newRelPos, newVel;

    if (dampingRatio > 1 + 1e-4) {
      // Overdamped: sum of two decaying exponentials.
      const za = -angularFrequency * dampingRatio;
      const zb = angularFrequency * Math.sqrt(dampingRatio * dampingRatio - 1);
      const z1 = za - zb;
      const z2 = za + zb;
      const e1 = Math.exp(z1 * dt);
      const e2 = Math.exp(z2 * dt);
      const invTwoZb = 1 / (2 * zb);

      const posPosCoef = (z2 * invTwoZb) * e1 - (z1 * invTwoZb) * e2;
      const posVelCoef = -e1 * invTwoZb + e2 * invTwoZb;
      const velPosCoef = (z2 * invTwoZb) * z1 * e1 - (z1 * invTwoZb) * z2 * e2;
      const velVelCoef = -z1 * e1 * invTwoZb + z2 * e2 * invTwoZb;

      newRelPos = relPos * posPosCoef + relVel * posVelCoef;
      newVel = relPos * velPosCoef + relVel * velVelCoef;
    } else if (dampingRatio < 1 - 1e-4) {
      // Underdamped: decaying sinusoid — this is the case that overshoots.
      const omegaZeta = angularFrequency * dampingRatio;
      const alpha = angularFrequency * Math.sqrt(1 - dampingRatio * dampingRatio);
      const expTerm = Math.exp(-omegaZeta * dt);
      const cosTerm = Math.cos(alpha * dt);
      const sinTerm = Math.sin(alpha * dt);
      const invAlpha = 1 / alpha;

      const expSin = expTerm * sinTerm;
      const expCos = expTerm * cosTerm;
      const expOmegaZetaSinOverAlpha = expTerm * omegaZeta * sinTerm * invAlpha;

      const posPosCoef = expCos + expOmegaZetaSinOverAlpha;
      const posVelCoef = expSin * invAlpha;
      const velPosCoef = -expSin * alpha - omegaZeta * expOmegaZetaSinOverAlpha;
      const velVelCoef = expCos - expOmegaZetaSinOverAlpha;

      newRelPos = relPos * posPosCoef + relVel * posVelCoef;
      newVel = relPos * velPosCoef + relVel * velVelCoef;
    } else {
      // Critically damped: fastest non-oscillating approach.
      const expTerm = Math.exp(-angularFrequency * dt);
      const timeExp = dt * expTerm;
      const timeExpFreq = timeExp * angularFrequency;

      const posPosCoef = timeExpFreq + expTerm;
      const posVelCoef = timeExp;
      const velPosCoef = -angularFrequency * timeExpFreq;
      const velVelCoef = -timeExpFreq * angularFrequency + expTerm;

      newRelPos = relPos * posPosCoef + relVel * posVelCoef;
      newVel = relPos * velPosCoef + relVel * velVelCoef;
    }

    value = newRelPos + targetValue;
    velocity = newVel;
  }

  function notifyUpdate() {
    for (const cb of updateListeners) cb(value, velocity);
  }

  function notifyRest() {
    for (const cb of restListeners) cb(value);
  }

  function tick(now) {
    if (lastTime == null) lastTime = now;
    const dt = Math.min((now - lastTime) / 1000, maxDeltaTime);
    lastTime = now;

    stepPhysics(dt);

    if (isSettled()) {
      value = targetValue;
      velocity = 0;
      rafId = null;
      lastTime = null;
      notifyUpdate();
      notifyRest();
      return;
    }

    notifyUpdate();
    rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (rafId != null) return;
    if (typeof requestAnimationFrame !== 'function') return; // SSR/Node: no-op
    lastTime = null;
    rafId = requestAnimationFrame(tick);
  }

  function stop() {
    if (rafId != null && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(rafId);
    }
    rafId = null;
    lastTime = null;
  }

  function set(v) {
    stop();
    value = v;
    velocity = 0;
    targetValue = v;
  }

  function target(v) {
    if (v === undefined) return targetValue;
    targetValue = v;
    if (!isSettled()) start();
    return targetValue;
  }

  function onUpdate(cb) {
    updateListeners.add(cb);
    return () => updateListeners.delete(cb);
  }

  function onRest(cb) {
    restListeners.add(cb);
    return () => restListeners.delete(cb);
  }

  return {
    get value() { return value; },
    get velocity() { return velocity; },
    set,
    target,
    onUpdate,
    onRest,
    isSettled,
    stop,
    destroy: stop,
  };
}
