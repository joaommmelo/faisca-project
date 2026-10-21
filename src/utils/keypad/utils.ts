import { DifficultiesUtils } from "../difficulties/utils.ts";

export class KeypadUtils {
    // Enough digits for the largest result, 1000 in Difícil.
    public static getMaxDigits(): number {
        const largestResult: number = Math.max(...DifficultiesUtils.getValidDifficulties().map((difficulty) => DifficultiesUtils.getLimit(difficulty)));
        return String(largestResult).length;
    }

    public static appendDigit(value: string, digit: string): string {
        if (value.length >= this.getMaxDigits()) {
            return value;
        }
        if (value === "0") {
            return digit;
        }
        return `${value}${digit}`;
    }

    public static eraseDigit(value: string): string {
        return value.slice(0, -1);
    }

    public static canConfirm(value: string): boolean {
        return value.length > 0;
    }
}
