import { describe, expect, it } from "vitest";
import { createSeededRandom } from "../../test/random.ts";
import { RandomUtils } from "./utils.ts";

describe("RandomUtils.shuffle", () => {
    it("keeps every item exactly once", () => {
        const items: number[] = [1, 2, 3, 4, 5, 6];
        const shuffled: number[] = RandomUtils.shuffle(items, createSeededRandom(7));
        expect([...shuffled].sort((first, second) => first - second)).toEqual(items);
    });

    it("does not mutate the input", () => {
        const items: number[] = [1, 2, 3];
        RandomUtils.shuffle(items, createSeededRandom(1));
        expect(items).toEqual([1, 2, 3]);
    });
});

describe("RandomUtils.pickWeightedWithoutReplacement", () => {
    it("returns the requested number of distinct items", () => {
        const picked: string[] = RandomUtils.pickWeightedWithoutReplacement({
            items: ["a", "b", "c", "d", "e"],
            count: 3,
            getWeight: () => 1,
            random: createSeededRandom(3)
        });
        expect(picked).toHaveLength(3);
        expect(new Set(picked).size).toBe(3);
    });

    it("stops when there are fewer items than requested", () => {
        const picked: string[] = RandomUtils.pickWeightedWithoutReplacement({
            items: ["a", "b"],
            count: 5,
            getWeight: () => 1
        });
        expect(picked).toHaveLength(2);
    });

    it("favours heavier items", () => {
        const random = createSeededRandom(42);
        let heavyFirstCount: number = 0;
        for (let draw = 0; draw < 1000; draw++) {
            const [first] = RandomUtils.pickWeightedWithoutReplacement({
                items: ["heavy", "light"],
                count: 1,
                getWeight: (item) => (item === "heavy" ? 9 : 1),
                random
            });
            if (first === "heavy") {
                heavyFirstCount++;
            }
        }
        expect(heavyFirstCount).toBeGreaterThan(850);
        expect(heavyFirstCount).toBeLessThan(950);
    });

    it("never picks the last item past the total weight", () => {
        const picked: string[] = RandomUtils.pickWeightedWithoutReplacement({
            items: ["a", "b"],
            count: 1,
            getWeight: () => 1,
            random: () => 0.9999999999999999
        });
        expect(picked).toEqual(["b"]);
    });
});
