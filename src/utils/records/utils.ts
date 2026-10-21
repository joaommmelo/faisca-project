import type { Difficulty } from "../difficulties/utils.ts";
import { OperationsUtils, type Operation } from "../operations/utils.ts";
import type { ProfileSettings } from "../profiles/utils.ts";
import type { AnswerLayout, PracticeMode } from "../questions/utils.ts";
import type { SessionSummary } from "../session/utils.ts";

// Sessions only compare with sessions played the same way: same difficulty and layout, or same tables and mode.
export interface RecordCategory {
    operation: Operation;
    difficulty: Difficulty | null;
    layout: AnswerLayout | null;
    tables: number[] | null;
    mode: PracticeMode | null;
    isAlwaysTyped: boolean;
}

export interface BestTime {
    category: RecordCategory;
    milliseconds: number;
}

// categoryId → the best time of a perfect session.
export type Records = Record<string, BestTime>;

export interface RegisterTimeResult {
    records: Records;
    isNewRecord: boolean;
    previousMilliseconds: number | null;
}

export class RecordsUtils {
    public static getCategory(settings: ProfileSettings): RecordCategory {
        const operation: Operation = settings.operation;
        if (OperationsUtils.isArithmetic(operation)) {
            const { difficulty, layout } = settings[operation];
            return { operation, difficulty, layout, tables: null, mode: null, isAlwaysTyped: false };
        }
        const { tables, isAlwaysTyped } = settings[operation];
        const mode: PracticeMode | null = operation === "multiplication" ? settings.multiplication.mode : null;
        return { operation, difficulty: null, layout: null, tables: [...tables].sort((first, second) => first - second), mode, isAlwaysTyped };
    }

    public static getCategoryId(category: RecordCategory): string {
        return [
            category.operation,
            category.difficulty ?? "",
            category.layout ?? "",
            category.tables === null ? "" : category.tables.join("-"),
            category.mode ?? "",
            category.isAlwaysTyped ? "typed" : ""
        ].join(":");
    }

    public static getBest(records: Records, category: RecordCategory): number | null {
        const best: BestTime | undefined = records[this.getCategoryId(category)];
        return best === undefined ? null : best.milliseconds;
    }

    // Only a perfect session counts: every question right at the first try, with no help.
    public static isPerfect(summary: SessionSummary): boolean {
        return summary.firstTryCount > 0 && summary.correctAtFirstTry === summary.firstTryCount;
    }

    public static registerTime(records: Records, category: RecordCategory, milliseconds: number): RegisterTimeResult {
        const previousMilliseconds: number | null = this.getBest(records, category);
        if (previousMilliseconds !== null && previousMilliseconds <= milliseconds) {
            return { records, isNewRecord: false, previousMilliseconds };
        }
        return {
            records: { ...records, [this.getCategoryId(category)]: { category, milliseconds } },
            isNewRecord: true,
            previousMilliseconds
        };
    }
}
