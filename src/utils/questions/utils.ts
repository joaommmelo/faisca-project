import { ArithmeticUtils, type Skill } from "../arithmetic/utils.ts";
import type { Difficulty } from "../difficulties/utils.ts";
import { DistractorsUtils } from "../distractors/utils.ts";
import type { Fact } from "../facts/utils.ts";
import { LeitnerUtils, type LeitnerBoxes } from "../leitner/utils.ts";
import { LevelsUtils } from "../levels/utils.ts";
import { OperationsUtils, type Operation } from "../operations/utils.ts";
import { RandomUtils, type RandomSource } from "../random/utils.ts";

export type PracticeMode = "direct" | "mixed";

// direct: 7 × 8 = ?   missing-left: ? × 8 = 56   missing-right: 7 × ? = 56
export type QuestionKind = "direct" | "missing-left" | "missing-right";

export type AnswerFormat = "choice" | "keypad" | "vertical";

// How the child prefers to answer additions and subtractions: just the result, or the written column method.
// Multiplication and division always ask for the result.
export type AnswerLayout = "result" | "vertical";

// fact: a times-table fact with its own box ("7x8"), shared by × and ÷ in Fácil. skill: a kind of calculation
// ("multiplication:medium:carry") whose box sums up every question of that kind.
export type BoxType = "fact" | "skill";

// left (operator) right = result, e.g. 56 ÷ 7 = 8. The answer is whichever term the kind hides.
export interface Question {
    id: string;
    operation: Operation;
    left: number;
    right: number;
    result: number;
    kind: QuestionKind;
    answer: number;
    format: AnswerFormat;
    // False when the child asked to always type the answer, or writes it in columns.
    allowsChoice: boolean;
    options: number[];
    isRetry: boolean;
    // The Leitner box this question trains: a fact ("7x8") for the times tables, a skill ("addition:easy:carry") otherwise.
    boxType: BoxType;
    boxKey: string;
    trackId: string;
}

export interface BuildMultiplicationOptions {
    mode: PracticeMode;
    boxes: LeitnerBoxes;
    isAlwaysTyped?: boolean;
    random?: RandomSource;
}

export interface BuildDivisionOptions {
    boxes: LeitnerBoxes;
    isAlwaysTyped?: boolean;
    random?: RandomSource;
}

export interface BuildSkillOptions {
    operation: Operation;
    difficulty: Difficulty;
    skill: Skill;
    left: number;
    right: number;
    layout: AnswerLayout;
    isAlwaysTyped: boolean;
    skillBoxes: LeitnerBoxes;
    random?: RandomSource;
}

export class QuestionsUtils {
    public static getValidModes(): PracticeMode[] {
        return ["direct", "mixed"];
    }

    public static isValidMode(value: string): boolean {
        return (this.getValidModes() as string[]).includes(value);
    }

    public static getDefaultMode(): PracticeMode {
        return "direct";
    }

    public static getValidLayouts(): AnswerLayout[] {
        return ["result", "vertical"];
    }

    public static isValidLayout(value: string): boolean {
        return (this.getValidLayouts() as string[]).includes(value);
    }

    public static getDefaultLayout(): AnswerLayout {
        return "result";
    }

    // Box 3 means two right answers in a row: from there the child types the answer instead of choosing it.
    public static getKeypadMinBox(): number {
        return 3;
    }

    public static getAnswerFormat(box: number): AnswerFormat {
        return box >= this.getKeypadMinBox() ? "keypad" : "choice";
    }

    // Multiplication and division follow the fact's box, unless the child always types the answer.
    public static getTablesAnswerFormat(box: number, isAlwaysTyped: boolean): AnswerFormat {
        return isAlwaysTyped ? "keypad" : this.getAnswerFormat(box);
    }

    public static getQuestionId(operation: Operation, left: number, right: number, kind: QuestionKind): string {
        return `${operation}:${left}${OperationsUtils.getSymbol(operation)}${right}:${kind}`;
    }

    public static buildMultiplication(fact: Fact, options: BuildMultiplicationOptions): Question {
        const random: RandomSource = options.random ?? Math.random;
        const [left, right]: number[] = RandomUtils.isHeads(random) ? [fact.smallerFactor, fact.largerFactor] : [fact.largerFactor, fact.smallerFactor];
        const kind: QuestionKind = (() => {
            if (options.mode === "direct" || RandomUtils.isHeads(random)) {
                return "direct";
            }
            return RandomUtils.isHeads(random) ? "missing-left" : "missing-right";
        })();
        const answer: number = (() => {
            switch (kind) {
                case "missing-left":
                    return left;
                case "missing-right":
                    return right;
                default:
                    return fact.product;
            }
        })();

        return this.withOptions(
            {
                id: this.getQuestionId("multiplication", left, right, kind),
                operation: "multiplication",
                left,
                right,
                result: fact.product,
                kind,
                answer,
                format: this.getTablesAnswerFormat(LeitnerUtils.getBox(options.boxes, fact.id), options.isAlwaysTyped === true),
                allowsChoice: options.isAlwaysTyped !== true,
                options: [],
                isRetry: false,
                boxType: "fact",
                boxKey: fact.id,
                trackId: LevelsUtils.getTrackId("multiplication", "easy")
            },
            random
        );
    }

    // 56 ÷ 7 = 8 trains the fact 7 × 8, so division shares the multiplication boxes. It is always exact.
    public static buildDivision(fact: Fact, options: BuildDivisionOptions): Question {
        const random: RandomSource = options.random ?? Math.random;
        const [divisor, quotient]: number[] = RandomUtils.isHeads(random) ? [fact.smallerFactor, fact.largerFactor] : [fact.largerFactor, fact.smallerFactor];

        return this.withOptions(
            {
                id: this.getQuestionId("division", fact.product, divisor, "direct"),
                operation: "division",
                left: fact.product,
                right: divisor,
                result: quotient,
                kind: "direct",
                answer: quotient,
                format: this.getTablesAnswerFormat(LeitnerUtils.getBox(options.boxes, fact.id), options.isAlwaysTyped === true),
                allowsChoice: options.isAlwaysTyped !== true,
                options: [],
                isRetry: false,
                boxType: "fact",
                boxKey: fact.id,
                trackId: LevelsUtils.getTrackId("division", "easy")
            },
            random
        );
    }

    // Additions and subtractions of every difficulty, and multiplications and divisions with bigger numbers.
    public static buildForSkill(options: BuildSkillOptions): Question {
        const random: RandomSource = options.random ?? Math.random;
        const boxKey: string = ArithmeticUtils.getSkillId(options.operation, options.difficulty, options.skill);
        const result: number = OperationsUtils.calculate(options.operation, options.left, options.right);
        const format: AnswerFormat = (() => {
            if (options.layout === "vertical") {
                return "vertical";
            }
            return options.isAlwaysTyped ? "keypad" : this.getAnswerFormat(LeitnerUtils.getBox(options.skillBoxes, boxKey));
        })();

        return this.withOptions(
            {
                id: this.getQuestionId(options.operation, options.left, options.right, "direct"),
                operation: options.operation,
                left: options.left,
                right: options.right,
                result,
                kind: "direct",
                answer: result,
                format,
                allowsChoice: options.layout !== "vertical" && !options.isAlwaysTyped,
                options: [],
                isRetry: false,
                boxType: "skill",
                boxKey,
                trackId: LevelsUtils.getTrackId(options.operation, options.difficulty)
            },
            random
        );
    }

    // The retry asks exactly the same thing again. After a miss the box is low, so it comes as multiple choice,
    // unless the child writes the sum in columns or always types the answer.
    public static buildRetry(question: Question, random: RandomSource = Math.random): Question {
        const format: AnswerFormat = (() => {
            if (question.format === "vertical") {
                return "vertical";
            }
            return question.allowsChoice ? "choice" : "keypad";
        })();
        return this.withOptions({ ...question, format, isRetry: true }, random);
    }

    private static withOptions(question: Question, random: RandomSource): Question {
        if (question.format !== "choice") {
            return { ...question, options: [] };
        }
        return { ...question, options: DistractorsUtils.getOptions(question, random) };
    }
}
