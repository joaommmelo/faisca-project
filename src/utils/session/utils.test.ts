import { describe, expect, it } from "vitest";
import { createSeededRandom } from "../../test/random.ts";
import type { LeitnerBoxes } from "../leitner/utils.ts";
import type { Question } from "../questions/utils.ts";
import { SessionUtils, type Session } from "./utils.ts";

function createSession(boxes: LeitnerBoxes = {}, seed: number = 1): Session {
    return SessionUtils.create({ tables: [7], mode: "mixed", boxes, random: createSeededRandom(seed) });
}

function wrongAnswerFor(question: Question): number {
    return question.answer + 1;
}

describe("SessionUtils.create", () => {
    it("draws 10 different facts from the chosen tables", () => {
        const session: Session = SessionUtils.create({ tables: [2, 5], mode: "direct", boxes: {}, random: createSeededRandom(4) });
        expect(session.questions).toHaveLength(10);
        expect(new Set(session.questions.map((question) => question.factId)).size).toBe(10);
        expect(session.questions.every((question) => [2, 5].includes(question.leftFactor) || [2, 5].includes(question.rightFactor))).toBe(true);
    });

    it("refuses to start without tables", () => {
        expect(() => SessionUtils.create({ tables: [], mode: "direct", boxes: {} })).toThrow();
    });

    it("draws weak facts more often than mastered ones", () => {
        const random = createSeededRandom(11);
        const boxes: LeitnerBoxes = { "7x8": 5, "7x9": 1 };
        let masteredCount: number = 0;
        let weakCount: number = 0;
        for (let sessionNumber = 0; sessionNumber < 300; sessionNumber++) {
            const factIds: string[] = SessionUtils.create({ tables: [3, 7], mode: "direct", boxes, random }).questions.map((question) => question.factId);
            masteredCount += factIds.includes("7x8") ? 1 : 0;
            weakCount += factIds.includes("7x9") ? 1 : 0;
        }
        expect(weakCount).toBeGreaterThan(masteredCount * 1.5);
    });
});

describe("SessionUtils.submitAnswer", () => {
    it("moves the fact up a box on a right answer and keeps the plan", () => {
        const session: Session = createSession();
        const question: Question = SessionUtils.getCurrentQuestion(session);
        const result = SessionUtils.submitAnswer(session, question.answer, { boxes: {} });

        expect(result.isCorrect).toBe(true);
        expect(result.boxes[question.factId]).toBe(2);
        expect(result.session.questions).toHaveLength(10);
        expect(SessionUtils.getCurrentRecord(result.session)?.isCorrect).toBe(true);
    });

    it("sends the fact to box 1 and schedules a retry a few questions later", () => {
        const session: Session = createSession();
        const question: Question = SessionUtils.getCurrentQuestion(session);
        const result = SessionUtils.submitAnswer(session, wrongAnswerFor(question), { boxes: { [question.factId]: 4 } });

        expect(result.isCorrect).toBe(false);
        expect(result.boxes[question.factId]).toBe(1);
        expect(result.session.questions).toHaveLength(11);
        const retry: Question = result.session.questions[1 + SessionUtils.getRetryGap()];
        expect(retry.isRetry).toBe(true);
        expect(retry.factId).toBe(question.factId);
        expect(retry.format).toBe("choice");
    });

    it("puts the retry right after the last question when a miss happens at the end", () => {
        let session: Session = createSession();
        let boxes: LeitnerBoxes = {};
        for (let index = 0; index < 9; index++) {
            const result = SessionUtils.submitAnswer(session, SessionUtils.getCurrentQuestion(session).answer, { boxes });
            session = SessionUtils.advance(result.session);
            boxes = result.boxes;
        }
        const lastQuestion: Question = SessionUtils.getCurrentQuestion(session);
        const result = SessionUtils.submitAnswer(session, wrongAnswerFor(lastQuestion), { boxes });
        const next: Session = SessionUtils.advance(result.session);

        expect(SessionUtils.isFinished(next)).toBe(false);
        expect(SessionUtils.getCurrentQuestion(next).factId).toBe(lastQuestion.factId);
    });

    it("does not retry a retry nor move its box", () => {
        const firstSession: Session = createSession();
        const missed = SessionUtils.submitAnswer(firstSession, wrongAnswerFor(SessionUtils.getCurrentQuestion(firstSession)), { boxes: {} });
        let session: Session = SessionUtils.advance(missed.session);
        let boxes: LeitnerBoxes = missed.boxes;
        while (!SessionUtils.getCurrentQuestion(session).isRetry) {
            const result = SessionUtils.submitAnswer(session, SessionUtils.getCurrentQuestion(session).answer, { boxes });
            session = SessionUtils.advance(result.session);
            boxes = result.boxes;
        }

        const retry: Question = SessionUtils.getCurrentQuestion(session);
        const result = SessionUtils.submitAnswer(session, wrongAnswerFor(retry), { boxes });

        expect(session.currentIndex).toBe(1 + SessionUtils.getRetryGap());
        expect(result.session.questions).toHaveLength(11);
        expect(result.boxes).toEqual(boxes);
    });

    it("refuses a second answer to the same question", () => {
        const session: Session = createSession();
        const answered = SessionUtils.submitAnswer(session, 1, { boxes: {} }).session;
        expect(() => SessionUtils.submitAnswer(answered, 1, { boxes: {} })).toThrow();
    });
});

describe("SessionUtils.advance", () => {
    it("refuses to skip an unanswered question", () => {
        expect(() => SessionUtils.advance(createSession())).toThrow();
    });
});

describe("a full session", () => {
    it("counts first tries and lists the facts to reinforce", () => {
        let session: Session = createSession({}, 21);
        let boxes: LeitnerBoxes = {};
        const missedFactId: string = SessionUtils.getCurrentQuestion(session).factId;

        while (!SessionUtils.isFinished(session)) {
            const question: Question = SessionUtils.getCurrentQuestion(session);
            const isFirstMiss: boolean = question.factId === missedFactId && !question.isRetry;
            const result = SessionUtils.submitAnswer(session, isFirstMiss ? wrongAnswerFor(question) : question.answer, { boxes });
            session = SessionUtils.advance(result.session);
            boxes = result.boxes;
        }

        const summary = SessionUtils.getSummary(session);
        expect(session.records).toHaveLength(11);
        expect(summary.firstTryCount).toBe(10);
        expect(summary.correctAtFirstTry).toBe(9);
        expect(summary.factsToReinforce.map((question) => question.factId)).toEqual([missedFactId]);
        expect(boxes[missedFactId]).toBe(1);
    });

    it("numbers questions without counting retries", () => {
        const session: Session = createSession();
        const question: Question = SessionUtils.getCurrentQuestion(session);
        const missed: Session = SessionUtils.submitAnswer(session, wrongAnswerFor(question), { boxes: {} }).session;

        expect(SessionUtils.getFirstTryPosition(missed)).toBe(1);
        expect(SessionUtils.getFirstTryTotal(missed)).toBe(10);
    });
});
