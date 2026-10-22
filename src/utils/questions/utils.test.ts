import { describe, expect, it } from "vitest";
import { createSeededRandom } from "../../test/random.ts";
import { FactsUtils, type Fact } from "../facts/utils.ts";
import type { LeitnerBoxes } from "../leitner/utils.ts";
import { QuestionsUtils, type PracticeMode, type Question, type RecentSkillAnswers } from "./utils.ts";

const factSevenEight: Fact = FactsUtils.getAll().find((fact) => fact.id === "7x8") as Fact;

function answers(count: number, isCorrect: boolean): boolean[] {
    return Array.from({ length: count }, () => isCorrect);
}

function buildMany(count: number, mode: PracticeMode, boxes: LeitnerBoxes = {}): Question[] {
    const random = createSeededRandom(99);
    return Array.from({ length: count }, () => QuestionsUtils.buildMultiplication(factSevenEight, { mode, boxes, random }));
}

describe("QuestionsUtils.buildMultiplication", () => {
    it("only asks direct questions in direct mode", () => {
        expect(buildMany(100, "direct").every((question) => question.kind === "direct")).toBe(true);
    });

    it("mixes direct and both inverse shapes in mixed mode", () => {
        const kinds = new Set(buildMany(100, "mixed").map((question) => question.kind));
        expect(kinds).toEqual(new Set(["direct", "missing-left", "missing-right"]));
    });

    it("always has a consistent answer", () => {
        for (const question of buildMany(100, "mixed")) {
            expect(question.left * question.right).toBe(question.result);
            if (question.kind === "direct") {
                expect(question.answer).toBe(question.result);
            }
            if (question.kind === "missing-left") {
                expect(question.answer).toBe(question.left);
            }
            if (question.kind === "missing-right") {
                expect(question.answer).toBe(question.right);
            }
        }
    });

    it("presents the factors in both orders", () => {
        expect(new Set(buildMany(50, "direct").map((question) => question.left))).toEqual(new Set([7, 8]));
    });

    it("uses multiple choice for new or weak facts", () => {
        for (const question of buildMany(20, "mixed", { "7x8": 2 })) {
            expect(question.format).toBe("choice");
            expect(question.options).toHaveLength(4);
            expect(question.options).toContain(question.answer);
        }
    });

    it("uses the keypad for facts the child already knows", () => {
        for (const question of buildMany(20, "mixed", { "7x8": 3 })) {
            expect(question.format).toBe("keypad");
            expect(question.options).toEqual([]);
        }
    });
});

describe("always typing", () => {
    it("never offers multiple choice, not even for new facts or their retries", () => {
        const question: Question = QuestionsUtils.buildMultiplication(factSevenEight, { mode: "direct", boxes: {}, isAlwaysTyped: true });
        const division: Question = QuestionsUtils.buildDivision(factSevenEight, { boxes: {}, isAlwaysTyped: true });
        expect(question.format).toBe("keypad");
        expect(division.format).toBe("keypad");
        expect(QuestionsUtils.buildRetry(question).format).toBe("keypad");
    });
});

describe("QuestionsUtils.buildDivision", () => {
    it("is always exact and trains the multiplication fact", () => {
        const random = createSeededRandom(12);
        for (const fact of FactsUtils.getAll()) {
            const question: Question = QuestionsUtils.buildDivision(fact, { boxes: {}, random });
            expect(question.left).toBe(fact.product);
            expect(question.left % question.right).toBe(0);
            expect(question.right * question.answer).toBe(question.left);
            expect(question.boxKey).toBe(fact.id);
        }
    });

    it("follows the multiplication box for its format", () => {
        expect(QuestionsUtils.buildDivision(factSevenEight, { boxes: { "7x8": 4 } }).format).toBe("keypad");
        expect(QuestionsUtils.buildDivision(factSevenEight, { boxes: {} }).format).toBe("choice");
    });
});

describe("QuestionsUtils.buildForSkill", () => {
    it("writes in columns when the child chose the vertical layout", () => {
        const question: Question = QuestionsUtils.buildForSkill({
            isAlwaysTyped: false,
            operation: "addition",
            difficulty: "medium",
            skill: "carry",
            left: 37,
            right: 25,
            layout: "vertical",
            recentSkillAnswers: {}
        });
        expect(question.answer).toBe(62);
        expect(question.format).toBe("vertical");
        expect(question.boxKey).toBe("addition:medium:carry");
        expect(question.trackId).toBe("addition:medium");
    });

    it("follows the skill's last answers when only the result is asked", () => {
        const base = {
            operation: "subtraction" as const,
            difficulty: "easy" as const,
            skill: "borrow" as const,
            left: 13,
            right: 7,
            layout: "result" as const
        };
        const eightOfTen: RecentSkillAnswers = { "subtraction:easy:borrow": [...answers(8, true), ...answers(2, false)] };
        expect(QuestionsUtils.buildForSkill({ isAlwaysTyped: false, ...base, recentSkillAnswers: {} }).format).toBe("choice");
        expect(QuestionsUtils.buildForSkill({ isAlwaysTyped: false, ...base, recentSkillAnswers: eightOfTen }).format).toBe("keypad");
    });
});

describe("QuestionsUtils.getSkillAnswerFormat", () => {
    it("types a skill only once 8 of its last 10 answers are right", () => {
        expect(QuestionsUtils.getSkillAnswerFormat({}, "addition:easy:carry")).toBe("choice");
        expect(QuestionsUtils.getSkillAnswerFormat({ "addition:easy:carry": answers(7, true) }, "addition:easy:carry")).toBe("choice");
        expect(QuestionsUtils.getSkillAnswerFormat({ "addition:easy:carry": answers(8, true) }, "addition:easy:carry")).toBe("keypad");
    });

    it("chooses again when the child starts missing", () => {
        const typed: RecentSkillAnswers = { "addition:easy:carry": answers(10, true) };
        const missed: RecentSkillAnswers = [false, false, false].reduce(
            (recentSkillAnswers, isCorrect) => QuestionsUtils.recordSkillAnswer(recentSkillAnswers, "addition:easy:carry", isCorrect),
            typed
        );
        expect(QuestionsUtils.getSkillAnswerFormat(typed, "addition:easy:carry")).toBe("keypad");
        expect(QuestionsUtils.getSkillAnswerFormat(missed, "addition:easy:carry")).toBe("choice");
    });
});

describe("QuestionsUtils.recordSkillAnswer", () => {
    it("keeps the last 10 answers of that skill, oldest first, and leaves the others alone", () => {
        const recentSkillAnswers: RecentSkillAnswers = { "addition:easy:carry": answers(10, true), "addition:easy:no-carry": [false] };
        const recorded: RecentSkillAnswers = QuestionsUtils.recordSkillAnswer(recentSkillAnswers, "addition:easy:carry", false);
        expect(recorded["addition:easy:carry"]).toEqual([...answers(9, true), false]);
        expect(recorded["addition:easy:no-carry"]).toEqual([false]);
        expect(recentSkillAnswers["addition:easy:carry"]).toEqual(answers(10, true));
    });
});

describe("QuestionsUtils.buildRetry", () => {
    it("asks the same thing again, as multiple choice after a miss", () => {
        const [original] = buildMany(1, "mixed", { "7x8": 4 });
        const retry: Question = QuestionsUtils.buildRetry(original, createSeededRandom(5));

        expect(original.format).toBe("keypad");
        expect(retry.isRetry).toBe(true);
        expect(retry.id).toBe(original.id);
        expect(retry.answer).toBe(original.answer);
        expect(retry.format).toBe("choice");
        expect(retry.options).toContain(retry.answer);
    });
});

describe("QuestionsUtils.isValidMode", () => {
    it("accepts only known modes", () => {
        expect(QuestionsUtils.isValidMode("direct")).toBe(true);
        expect(QuestionsUtils.isValidMode("mixed")).toBe(true);
        expect(QuestionsUtils.isValidMode("division")).toBe(false);
    });
});
