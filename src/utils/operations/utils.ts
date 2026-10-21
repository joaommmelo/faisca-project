export type Operation = "addition" | "subtraction" | "multiplication" | "division";

// Practised by difficulty (Fácil, Médio, Difícil); multiplication and division are practised by times table.
export type ArithmeticOperation = "addition" | "subtraction";

export type TablesOperation = "multiplication" | "division";

export class OperationsUtils {
    public static getValidOperations(): Operation[] {
        return ["addition", "subtraction", "multiplication", "division"];
    }

    public static isValidOperation(value: string): boolean {
        return (this.getValidOperations() as string[]).includes(value);
    }

    public static getDefaultOperation(): Operation {
        return "addition";
    }

    public static isArithmetic(operation: Operation): operation is ArithmeticOperation {
        return operation === "addition" || operation === "subtraction";
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
