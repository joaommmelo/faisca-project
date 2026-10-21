import { describe, expect, it } from "vitest";
import { createSeededRandom } from "../../test/random.ts";
import { FactsUtils, type Fact } from "../facts/utils.ts";
import { QuestionsUtils, type Question } from "./utils.ts";

const factSevenEight: Fact = FactsUtils.getAll().find((fact) => fact.id === "7x8") as Fact;

function buildMany(count: number, mode: "direct" | "mixed", boxes = {}): Question[] {
    const random = createSeededRandom(99);
    return Array.from({ length: count }, () => QuestionsUtils.build(factSevenEight, { mode, boxes, random }));
}

describe("QuestionsUtils.build", () => {
    it("only asks direct questions in direct mode", () => {
        expect(buildMany(100, "direct").every((question) => question.kind === "direct")).toBe(true);
    });

    it("mixes direct and both inverse shapes in mixed mode", () => {
        const kinds = new Set(buildMany(100, "mixed").map((question) => question.kind));
        expect(kinds).toEqual(new Set(["direct", "missing-left", "missing-right"]));
    });

    it("always has a consistent answer", () => {
        for (const question of buildMany(100, "mixed")) {
            expect(question.leftFactor * question.rightFactor).toBe(question.product);
            if (question.kind === "direct") {
                expect(question.answer).toBe(question.product);
            }
            if (question.kind === "missing-left") {
                expect(question.answer).toBe(question.leftFactor);
            }
            if (question.kind === "missing-right") {
                expect(question.answer).toBe(question.rightFactor);
            }
        }
    });

    it("presents the factors in both orders", () => {
        const leftFactors = new Set(buildMany(50, "direct").map((question) => question.leftFactor));
        expect(leftFactors).toEqual(new Set([7, 8]));
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

describe("QuestionsUtils.buildRetry", () => {
    it("asks the same thing again, as multiple choice after a miss", () => {
        const [original] = buildMany(1, "mixed", { "7x8": 4 });
        const retry: Question = QuestionsUtils.buildRetry(original, { "7x8": 1 }, createSeededRandom(5));

        expect(original.format).toBe("keypad");
        expect(retry.isRetry).toBe(true);
        expect(retry.kind).toBe(original.kind);
        expect(retry.leftFactor).toBe(original.leftFactor);
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
