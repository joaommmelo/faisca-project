import { describe, expect, it } from "vitest";
import { createTestProfile } from "../../test/profiles.ts";
import { createSeededRandom } from "../../test/random.ts";
import { ArithmeticUtils } from "../arithmetic/utils.ts";
import type { LeitnerBoxes } from "../leitner/utils.ts";
import { ProfilesUtils, type Profile } from "../profiles/utils.ts";
import type { Question } from "../questions/utils.ts";
import { SessionUtils, type Session } from "./utils.ts";

function multiplicationProfile(boxes: LeitnerBoxes = {}, tables: number[] = [7]): Profile {
    const defaults = ProfilesUtils.createDefaultSettings();
    return createTestProfile({ practice: "multiplication", multiplication: { ...defaults.multiplication, tables, mode: "mixed" } }, { boxes });
}

function createSession(seed: number = 1): Session {
    return SessionUtils.create(multiplicationProfile(), createSeededRandom(seed));
}

function wrongAnswerFor(question: Question): number {
    return question.answer + 1;
}

// Answers the current question right, or wrong twice so it is missed for good.
function finishCurrent(session: Session, isCorrect: boolean): Session {
    const question: Question = SessionUtils.getCurrentQuestion(session);
    if (isCorrect) {
        return SessionUtils.submitAnswer(session, question.answer).session;
    }
    const firstTry: Session = SessionUtils.submitAnswer(session, wrongAnswerFor(question)).session;
    return SessionUtils.submitAnswer(firstTry, wrongAnswerFor(question)).session;
}

describe("SessionUtils.create", () => {
    it("draws 10 different facts from the chosen tables", () => {
        const session: Session = SessionUtils.create(multiplicationProfile({}, [2, 5]), createSeededRandom(4));
        expect(session.questions).toHaveLength(10);
        expect(new Set(session.questions.map((question) => question.boxKey)).size).toBe(10);
        expect(session.questions.every((question) => [2, 5].includes(question.left) || [2, 5].includes(question.right))).toBe(true);
    });

    it("refuses to start without tables", () => {
        expect(() => SessionUtils.create(multiplicationProfile({}, []))).toThrow();
    });

    it("draws weak facts more often than mastered ones", () => {
        const random = createSeededRandom(11);
        const profile: Profile = multiplicationProfile({ "7x8": 5, "7x9": 1 }, [3, 7]);
        let masteredCount: number = 0;
        let weakCount: number = 0;
        for (let sessionNumber = 0; sessionNumber < 300; sessionNumber++) {
            const factIds: string[] = SessionUtils.create(profile, random).questions.map((question) => question.boxKey);
            masteredCount += factIds.includes("7x8") ? 1 : 0;
            weakCount += factIds.includes("7x9") ? 1 : 0;
        }
        expect(weakCount).toBeGreaterThan(masteredCount * 1.5);
    });

    it("asks exact divisions from the chosen tables", () => {
        const defaults = ProfilesUtils.createDefaultSettings();
        const session: Session = SessionUtils.create(
            createTestProfile({ practice: "division", division: { ...defaults.division, tables: [6] } }),
            createSeededRandom(3)
        );
        for (const question of session.questions) {
            expect(question.operation).toBe("division");
            expect(question.left % question.right).toBe(0);
            expect(question.right * question.answer).toBe(question.left);
        }
    });

    it("asks only the skills the level has opened, without repeating a question", () => {
        const profile: Profile = createTestProfile({ practice: "addition" });
        const session: Session = SessionUtils.create(profile, createSeededRandom(5));
        expect(session.questions).toHaveLength(10);
        expect(new Set(session.questions.map((question) => question.id)).size).toBe(10);
        expect(session.questions.every((question) => ArithmeticUtils.classify("addition", question.left, question.right) === "no-carry")).toBe(true);
    });

    it("reinforces the weaker skill once a level opens more", () => {
        const random = createSeededRandom(9);
        const profile: Profile = createTestProfile(
            { practice: "subtraction" },
            {
                tracks: { "subtraction:easy": { level: 2, points: 0, recentAnswers: [], answersSinceSafetyNet: 0 } },
                skillBoxes: { "subtraction:easy:no-borrow": 5, "subtraction:easy:borrow": 1 }
            }
        );
        const skills: string[] = Array.from({ length: 30 }, () => SessionUtils.create(profile, random).questions)
            .flat()
            .map((question) => ArithmeticUtils.classify("subtraction", question.left, question.right));
        expect(skills.filter((skill) => skill === "borrow").length).toBeGreaterThan(skills.filter((skill) => skill === "no-borrow").length * 2);
    });
});

describe("SessionUtils.submitAnswer", () => {
    it("finishes the question on a right answer and keeps the plan", () => {
        const session: Session = createSession();
        const question: Question = SessionUtils.getCurrentQuestion(session);
        const result = SessionUtils.submitAnswer(session, question.answer);

        expect(result.outcome).toBe("correct");
        expect(result.record?.givenAnswers).toEqual([question.answer]);
        expect(result.session.questions).toHaveLength(10);
    });

    it("gives a second chance before showing the answer", () => {
        const session: Session = createSession();
        const question: Question = SessionUtils.getCurrentQuestion(session);
        const result = SessionUtils.submitAnswer(session, wrongAnswerFor(question));

        expect(result.outcome).toBe("try-again");
        expect(result.record).toBeNull();
        expect(SessionUtils.getCurrentRecord(result.session)).toBeNull();
        expect(result.session.missedAttempts).toEqual([wrongAnswerFor(question)]);
    });

    it("counts a second-chance success as right, but not at the first try, and still retries it later", () => {
        const session: Session = createSession();
        const question: Question = SessionUtils.getCurrentQuestion(session);
        const firstTry = SessionUtils.submitAnswer(session, wrongAnswerFor(question));
        const secondTry = SessionUtils.submitAnswer(firstTry.session, question.answer);

        expect(secondTry.outcome).toBe("correct");
        expect(secondTry.record?.givenAnswers).toEqual([wrongAnswerFor(question), question.answer]);
        expect(SessionUtils.isFirstTryCorrect(secondTry.record!)).toBe(false);
        expect(secondTry.session.questions[1 + SessionUtils.getRetryGap()].isRetry).toBe(true);
    });

    it("schedules one retry, as multiple choice, after two misses", () => {
        const missed: Session = finishCurrent(createSession(), false);
        const retry: Question = missed.questions[1 + SessionUtils.getRetryGap()];

        expect(SessionUtils.getCurrentRecord(missed)?.isCorrect).toBe(false);
        expect(missed.questions).toHaveLength(11);
        expect(retry.isRetry).toBe(true);
        expect(retry.id).toBe(missed.questions[0].id);
        expect(retry.format).toBe("choice");
        expect(SessionUtils.hasRetryAhead(missed)).toBe(true);
    });

    it("never repeats the last question right after itself", () => {
        let session: Session = createSession();
        for (let index = 0; index < 9; index++) {
            session = SessionUtils.advance(finishCurrent(session, true));
        }
        const missed: Session = finishCurrent(session, false);

        expect(SessionUtils.hasRetryAhead(missed)).toBe(false);
        expect(SessionUtils.isFinished(SessionUtils.advance(missed))).toBe(true);
    });

    it("does not retry a retry", () => {
        let session: Session = SessionUtils.advance(finishCurrent(createSession(), false));
        while (!SessionUtils.getCurrentQuestion(session).isRetry) {
            session = SessionUtils.advance(finishCurrent(session, true));
        }
        const missedRetry: Session = finishCurrent(session, false);
        expect(missedRetry.questions).toHaveLength(11);
    });

    it("refuses another answer to a finished question", () => {
        const answered: Session = finishCurrent(createSession(), true);
        expect(() => SessionUtils.submitAnswer(answered, 1)).toThrow();
    });
});

describe("SessionUtils.registerHelp", () => {
    it("marks the question as helped and counts one help per question", () => {
        const helped: Session = SessionUtils.registerHelp(SessionUtils.registerHelp(createSession()));
        expect(helped.isCurrentHelped).toBe(true);
        expect(helped.helpsUsed).toBe(1);

        const question: Question = SessionUtils.getCurrentQuestion(helped);
        const result = SessionUtils.submitAnswer(helped, question.answer);
        expect(result.record?.isHelped).toBe(true);
        expect(SessionUtils.countsForProgress(result.record!)).toBe(false);
    });

    it("starts the next question without help", () => {
        const helped: Session = SessionUtils.registerHelp(createSession());
        const next: Session = SessionUtils.advance(finishCurrent(helped, true));
        expect(next.isCurrentHelped).toBe(false);
        expect(next.helpsUsed).toBe(1);
    });
});

describe("SessionUtils.advance", () => {
    it("refuses to skip an unanswered question", () => {
        expect(() => SessionUtils.advance(createSession())).toThrow();
    });
});

describe("a full session", () => {
    it("counts first tries alone, helps apart, and lists what to reinforce", () => {
        let session: Session = createSession(21);
        const missedId: string = SessionUtils.getCurrentQuestion(session).id;
        session = SessionUtils.advance(finishCurrent(session, false));
        session = SessionUtils.advance(finishCurrent(SessionUtils.registerHelp(session), true));
        while (!SessionUtils.isFinished(session)) {
            session = SessionUtils.advance(finishCurrent(session, true));
        }

        const summary = SessionUtils.getSummary(session);
        expect(session.records).toHaveLength(11);
        expect(summary.firstTryCount).toBe(10);
        expect(summary.correctAtFirstTry).toBe(8);
        expect(summary.helpedCount).toBe(1);
        expect(summary.questionsToReinforce.map((question) => question.id)).toContain(missedId);
        expect(summary.questionsToReinforce).toHaveLength(2);
    });

    it("numbers questions without counting retries", () => {
        const missed: Session = finishCurrent(createSession(), false);
        expect(SessionUtils.getFirstTryPosition(missed)).toBe(1);
        expect(SessionUtils.getFirstTryTotal(missed)).toBe(10);
    });
});

describe("SessionUtils.create with bigger numbers and mixes", () => {
    const defaults = ProfilesUtils.createDefaultSettings();

    it("practises skills, not facts, in Médio multiplication", () => {
        const profile: Profile = createTestProfile({ practice: "multiplication", multiplication: { ...defaults.multiplication, difficulty: "medium" } });
        const session: Session = SessionUtils.create(profile, createSeededRandom(8));
        expect(session.questions).toHaveLength(10);
        expect(session.questions.every((question) => question.boxType === "skill" && question.trackId === "multiplication:medium")).toBe(true);
        expect(session.questions.every((question) => Math.max(question.left, question.right) >= ArithmeticUtils.getMinBigFactor())).toBe(true);
    });

    it("keeps typing every answer when asked, also with bigger numbers", () => {
        const profile: Profile = createTestProfile({ practice: "division", division: { ...defaults.division, difficulty: "hard", isAlwaysTyped: true } });
        const session: Session = SessionUtils.create(profile, createSeededRandom(9));
        expect(session.questions.every((question) => question.format === "keypad" && question.left % question.right === 0)).toBe(true);
    });

    it("shares a mix out evenly between the chosen operations", () => {
        const profile: Profile = createTestProfile({ practice: "mix", mix: { ...defaults.mix, operations: ["addition", "multiplication", "division"] } });
        const session: Session = SessionUtils.create(profile, createSeededRandom(10));
        const counts: number[] = ["addition", "multiplication", "division"].map(
            (operation) => session.questions.filter((question) => question.operation === operation).length
        );
        expect(session.questions).toHaveLength(10);
        expect([...counts].sort()).toEqual([3, 3, 4]);
        expect(session.questions.every((question) => question.operation !== "subtraction")).toBe(true);
    });

    it("uses each operation's own settings inside a mix", () => {
        const profile: Profile = createTestProfile({
            practice: "mix",
            mix: { ...defaults.mix, operations: ["subtraction", "multiplication"] },
            subtraction: { ...defaults.subtraction, layout: "vertical" }
        });
        const session: Session = SessionUtils.create(profile, createSeededRandom(12));
        const subtractions: Question[] = session.questions.filter((question) => question.operation === "subtraction");
        const multiplications: Question[] = session.questions.filter((question) => question.operation === "multiplication");
        expect(subtractions.every((question) => question.format === "vertical")).toBe(true);
        expect(multiplications.every((question) => question.boxType === "fact")).toBe(true);
    });
});
