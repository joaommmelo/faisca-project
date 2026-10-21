import { describe, expect, it } from "vitest";
import { KeypadUtils } from "./utils.ts";

describe("KeypadUtils", () => {
    it("allows up to four digits, enough for 1000", () => {
        expect(KeypadUtils.getMaxDigits()).toBe(4);
        expect(KeypadUtils.appendDigit("100", "0")).toBe("1000");
        expect(KeypadUtils.appendDigit("1000", "1")).toBe("1000");
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
