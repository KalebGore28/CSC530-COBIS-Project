/**
 * A seeded random number generator, so the demo data comes out the same on every run.
 * Mulberry32: small, fast and plenty random for fake data.
 */
let state = 1;

export function setRandomSeed(seed: number) {
  state = seed >>> 0;
}

/** A number from 0 up to (not including) 1 */
export function random() {
  state = (state + 0x6d2b79f5) >>> 0;
  let t = state;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** A whole number from min to max, both included */
export function randomInt(min: number, max: number) {
  return min + Math.floor(random() * (max - min + 1));
}

/** True with the given probability, like chance(0.25) for one time in four */
export function chance(probability: number) {
  return random() < probability;
}

export function pick<T>(items: ReadonlyArray<T>): T {
  return items[Math.floor(random() * items.length)];
}

/** Picks an item, where an item with twice the weight comes up twice as often */
export function pickWeighted<T>(items: ReadonlyArray<T>, weights: ReadonlyArray<number>): T {
  let total = 0;
  for (const weight of weights) total += weight;
  let roll = random() * total;
  for (let i = 0; i < items.length; i++) {
    roll -= weights[i];
    if (roll < 0) return items[i];
  }
  return items[items.length - 1];
}

/** A number from a bell curve around mean, where about two thirds land within one spread of it */
export function normal(mean: number, spread: number) {
  const u = 1 - random();
  const v = random();
  return mean + spread * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** A copy of the items in random order */
export function shuffled<T>(items: ReadonlyArray<T>): Array<T> {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
