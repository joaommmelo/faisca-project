import { describe, expect, it } from "vitest";
import { Messages } from "./messages.ts";
import type { Question } from "./questions/utils.ts";

const question: Question = {
    factId: "7x8",
    leftFactor: 7,
    rightFactor: 8,
    product: 56,
    kind: "direct",
    answer: 56,
    format: "choice",
    options: [48, 56, 63, 65],
    isRetry: false
};

describe("Messages.getFeedback", () => {
    it("praises a right answer, varying the words", () => {
        const first = Messages.getFeedback({ question, givenAnswer: 56, isCorrect: true }, 0);
        const second = Messages.getFeedback({ question, givenAnswer: 56, isCorrect: true }, 1);
        expect(first.title).not.toBe(second.title);
        expect(first.lines).toEqual([]);
    });

    it("shows the right answer and promises another try after a miss", () => {
        expect(Messages.getFeedback({ question, givenAnswer: 54, isCorrect: false }, 0)).toEqual({
            title: "Quase!",
            lines: ["A resposta certa é 56.", "Vamos tentar outra vez mais à frente."]
        });
    });

    it("leaves a missed retry for next time", () => {
        const feedback = Messages.getFeedback({ question: { ...question, isRetry: true }, givenAnswer: 54, isCorrect: false }, 0);
        expect(feedback.lines[1]).toBe("Vamos treinar esta na próxima vez.");
    });
});

describe("Messages.getSpokenQuestion", () => {
    it("reads each question shape as a sentence", () => {
        expect(Messages.getSpokenQuestion(question)).toBe("Quanto é 7 vezes 8?");
        expect(Messages.getSpokenQuestion({ ...question, kind: "missing-left", answer: 7 })).toBe("Que número vezes 8 dá 56?");
        expect(Messages.getSpokenQuestion({ ...question, kind: "missing-right", answer: 8 })).toBe("7 vezes que número dá 56?");
    });
});

describe("Messages.getSummaryHeadline", () => {
    it("always finds something positive to say", () => {
        expect(Messages.getSummaryHeadline(10, 10)).toBe("Perfeito! Acertaste todas!");
        expect(Messages.getSummaryHeadline(7, 10)).toBe("Muito bem! Estás a melhorar!");
        expect(Messages.getSummaryHeadline(2, 10)).toBe("Boa prática! Cada jogo ajuda a aprender.");
    });
});
