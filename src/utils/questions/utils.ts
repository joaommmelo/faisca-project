import { DistractorsUtils } from "../distractors/utils.ts";
import type { Fact } from "../facts/utils.ts";
import { LeitnerUtils, type LeitnerBoxes } from "../leitner/utils.ts";
import { RandomUtils, type RandomSource } from "../random/utils.ts";

export type PracticeMode = "direct" | "mixed";

// direct: 7 × 8 = ?   missing-left: ? × 8 = 56   missing-right: 7 × ? = 56
export type QuestionKind = "direct" | "missing-left" | "missing-right";

export type AnswerFormat = "choice" | "keypad";

export interface Question {
    factId: string;
    leftFactor: number;
    rightFactor: number;
    product: number;
    kind: QuestionKind;
    answer: number;
    format: AnswerFormat;
    options: number[];
    isRetry: boolean;
}

export interface BuildQuestionOptions {
    mode: PracticeMode;
    boxes: LeitnerBoxes;
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

    // Box 3 means two right answers in a row: from there the child types the answer instead of choosing it.
    public static getKeypadMinBox(): number {
        return 3;
    }

    public static getAnswerFormat(box: number): AnswerFormat {
        return box >= this.getKeypadMinBox() ? "keypad" : "choice";
    }

    public static build(fact: Fact, options: BuildQuestionOptions): Question {
        const random: RandomSource = options.random ?? Math.random;
        const [leftFactor, rightFactor]: number[] = RandomUtils.isHeads(random)
            ? [fact.smallerFactor, fact.largerFactor]
            : [fact.largerFactor, fact.smallerFactor];
        const kind: QuestionKind = (() => {
            if (options.mode === "direct" || RandomUtils.isHeads(random)) {
                return "direct";
            }
            return RandomUtils.isHeads(random) ? "missing-left" : "missing-right";
        })();
        const answer: number = this.getAnswer(kind, leftFactor, rightFactor, fact.product);
        const format: AnswerFormat = this.getAnswerFormat(LeitnerUtils.getBox(options.boxes, fact.id));

        return {
            factId: fact.id,
            leftFactor,
            rightFactor,
            product: fact.product,
            kind,
            answer,
            format,
            options: this.getOptionsForFormat(format, { kind, leftFactor, rightFactor, product: fact.product, answer }, random),
            isRetry: false
        };
    }

    // The retry asks exactly the same thing again; only the format follows the fact's (now lower) box.
    public static buildRetry(question: Question, boxes: LeitnerBoxes, random: RandomSource = Math.random): Question {
        const format: AnswerFormat = this.getAnswerFormat(LeitnerUtils.getBox(boxes, question.factId));
        return {
            ...question,
            format,
            options: this.getOptionsForFormat(format, question, random),
            isRetry: true
        };
    }

    private static getAnswer(kind: QuestionKind, leftFactor: number, rightFactor: number, product: number): number {
        switch (kind) {
            case "missing-left":
                return leftFactor;
            case "missing-right":
                return rightFactor;
            default:
                return product;
        }
    }

    private static getOptionsForFormat(
        format: AnswerFormat,
        question: Pick<Question, "kind" | "leftFactor" | "rightFactor" | "product" | "answer">,
        random: RandomSource
    ): number[] {
        if (format === "keypad") {
            return [];
        }
        return DistractorsUtils.getOptions(question, random);
    }
}
