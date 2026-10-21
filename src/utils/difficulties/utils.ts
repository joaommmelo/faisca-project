export type Difficulty = "easy" | "medium" | "hard";

export class DifficultiesUtils {
    public static getValidDifficulties(): Difficulty[] {
        return ["easy", "medium", "hard"];
    }

    public static isValidDifficulty(value: string): boolean {
        return (this.getValidDifficulties() as string[]).includes(value);
    }

    public static getDefaultDifficulty(): Difficulty {
        return "easy";
    }

    // The sum, or the number subtracted from, goes up to this limit.
    public static getLimit(difficulty: Difficulty): number {
        switch (difficulty) {
            case "easy":
                return 20;
            case "medium":
                return 100;
            default:
                return 1000;
        }
    }

    // Each difficulty starts above the previous limit, so Médio never asks a Fácil question.
    public static getLowerLimit(difficulty: Difficulty): number {
        const previous: Difficulty | null = this.getPrevious(difficulty);
        return previous === null ? 0 : this.getLimit(previous);
    }

    // Two-digit numbers in Médio, three-digit numbers in Difícil.
    public static getMinOperand(difficulty: Difficulty): number {
        switch (difficulty) {
            case "easy":
                return 1;
            case "medium":
                return 10;
            default:
                return 100;
        }
    }

    public static getNext(difficulty: Difficulty): Difficulty | null {
        const difficulties: Difficulty[] = this.getValidDifficulties();
        const index: number = difficulties.indexOf(difficulty);
        return index === difficulties.length - 1 ? null : difficulties[index + 1];
    }

    public static getPrevious(difficulty: Difficulty): Difficulty | null {
        const difficulties: Difficulty[] = this.getValidDifficulties();
        const index: number = difficulties.indexOf(difficulty);
        return index === 0 ? null : difficulties[index - 1];
    }

    public static isUnlocked(difficulty: Difficulty, highestUnlocked: Difficulty): boolean {
        const difficulties: Difficulty[] = this.getValidDifficulties();
        return difficulties.indexOf(difficulty) <= difficulties.indexOf(highestUnlocked);
    }
}
