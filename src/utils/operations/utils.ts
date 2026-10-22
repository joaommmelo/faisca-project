import type { Difficulty } from "../difficulties/utils.ts";

export type Operation = "addition" | "subtraction" | "multiplication" | "division";

// Addition and subtraction: the result typed, or the written column method.
export type AdditiveOperation = "addition" | "subtraction";

// Multiplication and division: the times tables in Fácil, bigger numbers in Médio and Difícil.
export type MultiplicativeOperation = "multiplication" | "division";

export class OperationsUtils {
    public static getValidOperations(): Operation[] {
        return ["addition", "subtraction", "multiplication", "division"];
    }

    public static isValidOperation(value: string): boolean {
        return (this.getValidOperations() as string[]).includes(value);
    }

    public static getDefaultOperation(): Operation {
        return "multiplication";
    }

    public static isAdditive(operation: Operation): operation is AdditiveOperation {
        return operation === "addition" || operation === "subtraction";
    }

    public static isMultiplicative(operation: Operation): operation is MultiplicativeOperation {
        return !this.isAdditive(operation);
    }

    // Fácil multiplication and division practise the times tables fact by fact; everything else practises skills.
    public static usesTables(operation: Operation, difficulty: Difficulty): boolean {
        return this.isMultiplicative(operation) && difficulty === "easy";
    }

    public static getSymbol(operation: Operation): string {
        switch (operation) {
            case "addition":
                return "+";
            case "subtraction":
                return "−";
            case "multiplication":
                return "×";
            default:
                return "÷";
        }
    }

    public static calculate(operation: Operation, left: number, right: number): number {
        switch (operation) {
            case "addition":
                return left + right;
            case "subtraction":
                return left - right;
            case "multiplication":
                return left * right;
            default:
                return left / right;
        }
    }
}
