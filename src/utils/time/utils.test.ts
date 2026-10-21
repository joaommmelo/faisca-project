import { describe, expect, it } from "vitest";
import { TimeUtils } from "./utils.ts";

describe("TimeUtils.formatElapsed", () => {
    it("shows minutes and seconds", () => {
        expect(TimeUtils.formatElapsed(0)).toBe("0:00");
        expect(TimeUtils.formatElapsed(65_000)).toBe("1:05");
    });

    it("adds hours when the timer runs that long", () => {
        expect(TimeUtils.formatElapsed(3_725_000)).toBe("1:02:05");
    });
});
