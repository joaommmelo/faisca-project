import { describe, expect, it } from "vitest";
import { KeypadUtils } from "./utils.ts";

describe("KeypadUtils", () => {
    it("allows up to three digits, enough for 144", () => {
        expect(KeypadUtils.getMaxDigits()).toBe(3);
        expect(KeypadUtils.appendDigit("14", "4")).toBe("144");
        expect(KeypadUtils.appendDigit("144", "1")).toBe("144");
    });

    it("replaces a lone leading zero", () => {
        expect(KeypadUtils.appendDigit("0", "7")).toBe("7");
    });

    it("erases the last digit", () => {
        expect(KeypadUtils.eraseDigit("56")).toBe("5");
        expect(KeypadUtils.eraseDigit("")).toBe("");
    });

    it("only confirms when something was typed", () => {
        expect(KeypadUtils.canConfirm("")).toBe(false);
        expect(KeypadUtils.canConfirm("0")).toBe(true);
    });
});
