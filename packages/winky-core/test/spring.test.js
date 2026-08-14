import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createSpring } from '../src/spring.js';

// createSpring drives itself via the global requestAnimationFrame/
// cancelAnimationFrame, which don't exist in plain Node — this suite
// deliberately runs under the package's default `environment: 'node'`
// (no jsdom, no window at all), since proving the physics works with
// nothing but a stubbed scheduler is itself part of the "headless,
// SSR-safe" contract. At any moment createSpring has at most one
// in-flight rAF request, so the stub only needs to track a single
// pending callback and a fake, monotonically-advancing clock.
const frameMs = 16;
let pendingCb;
let pendingId;
let virtualNow;

function stubRaf() {
  pendingCb = null;
  pendingId = 0;
  virtualNow = 0;
  vi.stubGlobal('requestAnimationFrame', (cb) => {
    pendingId += 1;
    pendingCb = cb;
    return pendingId;
  });
  vi.stubGlobal('cancelAnimationFrame', (id) => {
    if (id === pendingId) pendingCb = null;
  });
}

// Advances up to `maxFrames` simulated frames, invoking whatever callback
// is currently pending each time. Stops early (returns true) once nothing
// is pending — i.e. the spring's internal loop settled and stopped
// rescheduling itself, exactly like the real idle-when-settled contract.
function advanceFrames(maxFrames = 2000) {
  for (let i = 0; i < maxFrames; i++) {
    if (!pendingCb) return true;
    const cb = pendingCb;
    pendingCb = null;
    virtualNow += frameMs;
    cb(virtualNow);
  }
  return !pendingCb;
}

beforeEach(stubRaf);
afterEach(() => vi.unstubAllGlobals());

describe('createSpring — physics', () => {
  it('settles at the target and stops the internal loop (onRest fires)', () => {
    const spring = createSpring({ value: 0, stiffness: 170, damping: 26 });
    const onRest = vi.fn();
    spring.onRest(onRest);

    spring.target(100);
    const settled = advanceFrames();

    expect(settled).toBe(true);
    expect(onRest).toHaveBeenCalledTimes(1);
    expect(spring.value).toBeCloseTo(100, 1);
    expect(spring.velocity).toBeCloseTo(0, 1);
    expect(spring.isSettled()).toBe(true);
    expect(pendingCb).toBeNull(); // no idle frame left scheduled
  });

  it('does not schedule any frames when idle (never targeted anywhere)', () => {
    const spring = createSpring({ value: 50 });
    expect(pendingCb).toBeNull();
    expect(spring.isSettled()).toBe(true);
    spring.destroy();
  });

  it('set() jumps immediately with zero velocity and does not fire onUpdate/onRest', () => {
    const spring = createSpring({ value: 0, target: 100 });
    const onUpdate = vi.fn();
    const onRest = vi.fn();
    spring.onUpdate(onUpdate);
    spring.onRest(onRest);

    spring.set(42);

    expect(spring.value).toBe(42);
    expect(spring.velocity).toBe(0);
    expect(spring.target()).toBe(42);
    expect(spring.isSettled()).toBe(true);
    expect(onUpdate).not.toHaveBeenCalled();
    expect(onRest).not.toHaveBeenCalled();
  });

  it('an underdamped spring (low damping relative to stiffness) overshoots before settling', () => {
    // Critical damping for stiffness=170, mass=1 is ~26.08; damping=4 is
    // well below that, so this must oscillate past the target at least once.
    const spring = createSpring({ value: 0, stiffness: 170, damping: 4 });
    let maxValueSeen = 0;
    spring.onUpdate((v) => { if (v > maxValueSeen) maxValueSeen = v; });

    spring.target(100);
    const settled = advanceFrames(5000);

    expect(settled).toBe(true);
    expect(maxValueSeen).toBeGreaterThan(100);
    expect(spring.value).toBeCloseTo(100, 1);
  });

  it('an overdamped spring (very high damping) approaches the target without overshooting', () => {
    const spring = createSpring({ value: 0, stiffness: 170, damping: 200 });
    let maxValueSeen = 0;
    spring.onUpdate((v) => { if (v > maxValueSeen) maxValueSeen = v; });

    spring.target(100);
    const settled = advanceFrames(5000);

    expect(settled).toBe(true);
    expect(maxValueSeen).toBeLessThanOrEqual(100.01);
    expect(spring.value).toBeCloseTo(100, 1);
  });

  it('stop() cancels the loop and no further onUpdate calls occur', () => {
    const spring = createSpring({ value: 0 });
    const onUpdate = vi.fn();
    spring.onUpdate(onUpdate);
    spring.target(100);

    spring.stop();
    expect(pendingCb).toBeNull();

    const callsAtStop = onUpdate.mock.calls.length;
    advanceFrames(10);
    expect(onUpdate.mock.calls.length).toBe(callsAtStop);
  });

  it('onUpdate/onRest subscriptions can be unsubscribed', () => {
    const spring = createSpring({ value: 0 });
    const onUpdate = vi.fn();
    const unsub = spring.onUpdate(onUpdate);
    unsub();

    spring.target(100);
    advanceFrames();

    expect(onUpdate).not.toHaveBeenCalled();
  });
});
