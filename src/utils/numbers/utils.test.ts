import { describe, expect, it } from "vitest";
import { NumbersUtils } from "./utils.ts";

describe("NumbersUtils.format", () => {
    it("leaves numbers up to four digits as they are", () => {
        expect(NumbersUtils.format(7)).toBe("7");
        expect(NumbersUtils.format(1000)).toBe("1000");
    });

    it("groups the thousands with a space from five digits on", () => {
        expect(NumbersUtils.format(12_345)).toBe("12 345");
        expect(NumbersUtils.format(1_234_567)).toBe("1 234 567");
    });
});
