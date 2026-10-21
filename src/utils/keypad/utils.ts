import { FactsUtils } from "../facts/utils.ts";

export class KeypadUtils {
    // Enough digits for the largest product (12 × 12 = 144).
    public static getMaxDigits(): number {
        const largestFactor: number = Math.max(...FactsUtils.getValidFactors());
        return String(largestFactor * largestFactor).length;
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
