import { describe, expect, it } from "vitest";
import { ProgressUtils } from "./utils.ts";

describe("ProgressUtils.getLevel", () => {
    it("is 0 for facts never practised", () => {
        expect(ProgressUtils.getLevel({}, 7, 8)).toBe(0);
    });

    it("is the box for practised facts, in either factor order", () => {
        expect(ProgressUtils.getLevel({ "7x8": 3 }, 7, 8)).toBe(3);
        expect(ProgressUtils.getLevel({ "7x8": 3 }, 8, 7)).toBe(3);
    });
});

describe("ProgressUtils.countMastered", () => {
    it("counts only facts in the last box", () => {
        expect(ProgressUtils.countMastered({ "2x2": 5, "2x3": 4, "7x8": 5 })).toBe(2);
    });

    it("has 78 facts to master", () => {
        expect(ProgressUtils.getTotalFacts()).toBe(78);
    });
});
