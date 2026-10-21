import { describe, expect, it } from "vitest";
import { ClockUtils, type ClockSettings } from "./utils.ts";

const up: ClockSettings = { isEnabled: true, direction: "up", reference: "default" };
const down: ClockSettings = { isEnabled: true, direction: "down", reference: "record" };

describe("ClockUtils", () => {
    it("is off by default and counts up when switched on", () => {
        expect(ClockUtils.createDefault()).toEqual({ isEnabled: false, direction: "up", reference: "default" });
    });

    it("uses the record as reference, or 3 minutes while there is none", () => {
        expect(ClockUtils.getReferenceMilliseconds(down, 95_000)).toBe(95_000);
        expect(ClockUtils.getReferenceMilliseconds(down, null)).toBe(180_000);
        expect(ClockUtils.getReferenceMilliseconds(up, 95_000)).toBe(180_000);
    });

    it("counts up, and down to the reference", () => {
        expect(ClockUtils.read(up, 42_000, 180_000)).toEqual({ milliseconds: 42_000, isOvertime: false });
        expect(ClockUtils.read(down, 42_000, 95_000)).toEqual({ milliseconds: 53_000, isOvertime: false });
    });

    it("shows the extra time calmly after the reference", () => {
        expect(ClockUtils.read(down, 107_000, 95_000)).toEqual({ milliseconds: 12_000, isOvertime: true });
        expect(ClockUtils.read(up, 190_000, 180_000)).toEqual({ milliseconds: 190_000, isOvertime: true });
    });
});
