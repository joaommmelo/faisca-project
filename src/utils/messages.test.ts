import { describe, expect, it } from "vitest";
import { Messages } from "./messages.ts";
import type { Question } from "./questions/utils.ts";

const question: Question = {
    id: "multiplication:7×8:direct",
    operation: "multiplication",
    left: 7,
    right: 8,
    result: 56,
    kind: "direct",
    answer: 56,
    format: "choice",
    allowsChoice: true,
    options: [48, 56, 63, 65],
    isRetry: false,
    boxKey: "7x8",
    trackId: "multiplication"
};

describe("Messages.getFeedback", () => {
    it("praises a right answer, varying the words", () => {
        const first = Messages.getFeedback({ question, givenAnswers: [56], isCorrect: true, isHelped: false }, { variant: 0, hasRetryAhead: false });
        const second = Messages.getFeedback({ question, givenAnswers: [56], isCorrect: true, isHelped: false }, { variant: 1, hasRetryAhead: false });
        expect(first.title).not.toBe(second.title);
        expect(first.lines).toEqual([]);
    });

    it("celebrates getting it at the second try", () => {
        const feedback = Messages.getFeedback({ question, givenAnswers: [54, 56], isCorrect: true, isHelped: false }, { variant: 0, hasRetryAhead: true });
        expect(feedback.title).toBe("Boa! À segunda acertaste!");
    });

    it("shows the right answer after two misses and says when it comes back", () => {
        const missed = { question, givenAnswers: [54, 55], isCorrect: false, isHelped: false };
        expect(Messages.getFeedback(missed, { variant: 0, hasRetryAhead: true })).toEqual({
            title: "Quase!",
            lines: ["A resposta certa é 56.", "Vamos tentar outra vez mais à frente."]
        });
        expect(Messages.getFeedback(missed, { variant: 0, hasRetryAhead: false }).lines[1]).toBe("Vamos treinar esta na próxima vez.");
    });
});

describe("Messages.getTryAgain", () => {
    it("never reveals the answer", () => {
        expect(Messages.getTryAgain(question, 0, 0)).not.toContain("56");
        expect(Messages.getTryAgain({ ...question, format: "vertical" }, 0, 2)).toBe("Quase! Vê as colunas realçadas e tenta outra vez.");
    });
});

describe("Messages.getSpokenQuestion", () => {
    it("reads each question shape as a sentence", () => {
        expect(Messages.getSpokenQuestion(question)).toBe("Quanto é 7 vezes 8?");
        expect(Messages.getSpokenQuestion({ ...question, kind: "missing-left", answer: 7 })).toBe("Que número vezes 8 dá 56?");
        expect(Messages.getSpokenQuestion({ ...question, kind: "missing-right", answer: 8 })).toBe("7 vezes que número dá 56?");
        expect(Messages.getSpokenQuestion({ ...question, operation: "division", left: 56, right: 7, result: 8, answer: 8 })).toBe(
            "Quanto é 56 a dividir por 7?"
        );
        expect(Messages.getSpokenQuestion({ ...question, operation: "subtraction", left: 52, right: 27, result: 25, answer: 25 })).toBe(
            "Quanto é 52 menos 27?"
        );
    });
});

describe("Messages.getCoinProgress", () => {
    it("shows halves from multiple choice", () => {
        expect(Messages.getCoinProgress(3)).toBe("3 de 5");
        expect(Messages.getCoinProgress(3.5)).toBe("3½ de 5");
        expect(Messages.getCoinProgress(0.5)).toBe("½ de 5");
    });
});

describe("Messages.getSummaryHeadline", () => {
    it("always finds something positive to say", () => {
        expect(Messages.getSummaryHeadline(10, 10)).toBe("Perfeito! Acertaste todas!");
        expect(Messages.getSummaryHeadline(7, 10)).toBe("Muito bem! Estás a melhorar!");
        expect(Messages.getSummaryHeadline(2, 10)).toBe("Boa prática! Cada jogo ajuda a aprender.");
    });
});

describe("Messages.getClockOutcomeLines", () => {
    const base = {
        elapsedMilliseconds: 72_000,
        referenceMilliseconds: 180_000,
        isAgainstRecord: false,
        isWithinReference: true,
        isPerfect: true,
        isNewRecord: false,
        previousRecordMilliseconds: null
    };

    it("celebrates a first or a new record", () => {
        expect(Messages.getClockOutcomeLines({ ...base, isNewRecord: true })).toEqual(["Primeiro recorde nesta categoria!"]);
        expect(Messages.getClockOutcomeLines({ ...base, isNewRecord: true, previousRecordMilliseconds: 80_000 })).toEqual(["Novo recorde! Antes era 1:20."]);
    });

    it("compares with the record or the default time without blame", () => {
        const slowerThanRecord = {
            ...base,
            elapsedMilliseconds: 75_000,
            referenceMilliseconds: 72_000,
            isAgainstRecord: true,
            isWithinReference: false,
            previousRecordMilliseconds: 72_000
        };
        expect(Messages.getClockOutcomeLines(slowerThanRecord)).toEqual(["Ficaste a 0:03 do teu recorde, 1:12. Para a próxima!"]);
        expect(Messages.getClockOutcomeLines({ ...base, elapsedMilliseconds: 190_000, isWithinReference: false, isPerfect: false })).toEqual([
            "Mais 0:10 do que os 3 minutos. Para a próxima!",
            "Os recordes contam quando acertas todas à primeira."
        ]);
    });
});
