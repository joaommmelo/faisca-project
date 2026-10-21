import type { RandomSource } from "../utils/random/utils.ts";

// Deterministic PRNG (mulberry32) so tests can sample many draws reproducibly.
export function createSeededRandom(seed: number): RandomSource {
    let state: number = seed >>> 0;
    return () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let mixed: number = state;
        mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
        mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
        return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
    };
}
