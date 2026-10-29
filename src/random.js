/**
 * Seeded pseudo-randomness.
 *
 * A plan has to be reproducible: the same seed must always produce the same
 * graph, so it can be previewed, reviewed, and re-run without surprises.
 */

/** FNV-1a over the UTF-8 bytes of a string, folded to 32 bits. */
export function hashSeed(input) {
  let hash = 0x811c9dc5;

  for (const byte of new TextEncoder().encode(String(input))) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193);
  }

  return hash >>> 0;
}

/**
 * Build a deterministic generator from any seed value.
 * Returns a function producing floats in [0, 1).
 */
export function createRandom(seed) {
  let state = hashSeed(seed) || 0x9e3779b9;

  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;

    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);

    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/** Integer in [min, max], inclusive. */
export function randomInt(next, min, max) {
  return min + Math.floor(next() * (max - min + 1));
}
