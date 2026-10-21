import type { Difficulty } from "../difficulties/utils.ts";
import { OperationsUtils, type Operation } from "../operations/utils.ts";
import type { ProfileSettings } from "../profiles/utils.ts";
import type { AnswerLayout, PracticeMode } from "../questions/utils.ts";
import type { SessionSummary } from "../session/utils.ts";

// Sessions only compare with sessions played the same way: same operation and difficulty, plus the same layout,
// or the same tables and mode when practising the times tables, and the same way of answering.
export interface OperationCategory {
    kind: "operation";
    operation: Operation;
    difficulty: Difficulty;
    layout: AnswerLayout | null;
    tables: number[] | null;
    mode: PracticeMode | null;
    isAlwaysTyped: boolean;
}

// A mix compares with mixes of the same operations, each played the same way.
export interface MixCategory {
    kind: "mix";
    parts: OperationCategory[];
}

export type RecordCategory = OperationCategory | MixCategory;

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
        if (settings.practice === "mix") {
            return { kind: "mix", parts: settings.mix.operations.map((operation) => this.getOperationCategory(settings, operation)) };
        }
        return this.getOperationCategory(settings, settings.practice);
    }

    public static getOperationCategory(settings: ProfileSettings, operation: Operation): OperationCategory {
        if (OperationsUtils.isAdditive(operation)) {
            const { difficulty, layout } = settings[operation];
            return { kind: "operation", operation, difficulty, layout, tables: null, mode: null, isAlwaysTyped: false };
        }
        const { difficulty, tables, isAlwaysTyped } = settings[operation];
        if (!OperationsUtils.usesTables(operation, difficulty)) {
            return { kind: "operation", operation, difficulty, layout: null, tables: null, mode: null, isAlwaysTyped };
        }
        const mode: PracticeMode | null = operation === "multiplication" ? settings.multiplication.mode : null;
        const sortedTables: number[] = [...tables].sort((first, second) => first - second);
        return { kind: "operation", operation, difficulty, layout: null, tables: sortedTables, mode, isAlwaysTyped };
    }

    public static getCategoryId(category: RecordCategory): string {
        if (category.kind === "mix") {
            return ["mix", ...category.parts.map((part) => this.getCategoryId(part))].join("|");
        }
        return [
            category.operation,
            category.difficulty,
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
