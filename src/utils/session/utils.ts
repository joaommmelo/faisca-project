import { FactsUtils, type Fact } from "../facts/utils.ts";
import { LeitnerUtils, type LeitnerBoxes } from "../leitner/utils.ts";
import { QuestionsUtils, type PracticeMode, type Question } from "../questions/utils.ts";
import { RandomUtils, type RandomSource } from "../random/utils.ts";

export interface AnswerRecord {
    question: Question;
    givenAnswer: number;
    isCorrect: boolean;
}

export interface Session {
    questions: Question[];
    currentIndex: number;
    records: AnswerRecord[];
}

export interface CreateSessionOptions {
    tables: number[];
    mode: PracticeMode;
    boxes: LeitnerBoxes;
    random?: RandomSource;
}

export interface SubmitAnswerOptions {
    boxes: LeitnerBoxes;
    random?: RandomSource;
}

export interface SubmitAnswerResult {
    session: Session;
    boxes: LeitnerBoxes;
    isCorrect: boolean;
}

export interface SessionSummary {
    correctAtFirstTry: number;
    firstTryCount: number;
    factsToReinforce: Question[];
}

export interface SessionOutcome {
    summary: SessionSummary;
    elapsedMilliseconds: number | null;
}

export class SessionUtils {
    public static getQuestionsPerSession(): number {
        return 10;
    }

    // Questions asked between a miss and its retry, so the correction is no longer on screen.
    public static getRetryGap(): number {
        return 3;
    }

    public static create(options: CreateSessionOptions): Session {
        const facts: Fact[] = FactsUtils.getForTables(options.tables);
        if (facts.length === 0) {
            throw new Error("Choose at least one table to start a session.");
        }

        const random: RandomSource = options.random ?? Math.random;
        const drawnFacts: Fact[] = RandomUtils.pickWeightedWithoutReplacement({
            items: facts,
            count: this.getQuestionsPerSession(),
            getWeight: (fact) => LeitnerUtils.getDrawWeight(fact, options.boxes),
            random
        });

        return {
            questions: drawnFacts.map((fact) => QuestionsUtils.build(fact, { mode: options.mode, boxes: options.boxes, random })),
            currentIndex: 0,
            records: []
        };
    }

    public static isFinished(session: Session): boolean {
        return session.currentIndex >= session.questions.length;
    }

    public static getCurrentQuestion(session: Session): Question {
        if (this.isFinished(session)) {
            throw new Error("The session has no more questions.");
        }
        return session.questions[session.currentIndex];
    }

    public static getCurrentRecord(session: Session): AnswerRecord | null {
        if (session.records.length <= session.currentIndex) {
            return null;
        }
        return session.records[session.currentIndex];
    }

    // A miss is asked again once, later in the session. A second miss waits for a future session:
    // the fact is already back in box 1, so it will be drawn often.
    public static submitAnswer(session: Session, givenAnswer: number, options: SubmitAnswerOptions): SubmitAnswerResult {
        if (this.getCurrentRecord(session) !== null) {
            throw new Error("The current question was already answered.");
        }

        const question: Question = this.getCurrentQuestion(session);
        const isCorrect: boolean = givenAnswer === question.answer;
        // Only the first attempt moves the fact between boxes: the retry comes right after seeing the correction.
        const boxes: LeitnerBoxes = question.isRetry ? options.boxes : LeitnerUtils.applyAnswer(options.boxes, question.factId, isCorrect);
        const questions: Question[] = (() => {
            if (isCorrect || question.isRetry) {
                return session.questions;
            }
            const retry: Question = QuestionsUtils.buildRetry(question, boxes, options.random);
            const retryIndex: number = Math.min(session.currentIndex + 1 + this.getRetryGap(), session.questions.length);
            return [...session.questions.slice(0, retryIndex), retry, ...session.questions.slice(retryIndex)];
        })();

        return {
            session: {
                questions,
                currentIndex: session.currentIndex,
                records: [...session.records, { question, givenAnswer, isCorrect }]
            },
            boxes,
            isCorrect
        };
    }

    public static advance(session: Session): Session {
        if (this.getCurrentRecord(session) === null) {
            throw new Error("Answer the current question before moving on.");
        }
        return { ...session, currentIndex: session.currentIndex + 1 };
    }

    // Position among the planned questions ("Pergunta 3 de 10"); retries do not count.
    public static getFirstTryPosition(session: Session): number {
        return session.questions.slice(0, session.currentIndex + 1).filter((question) => !question.isRetry).length;
    }

    public static getFirstTryTotal(session: Session): number {
        return session.questions.filter((question) => !question.isRetry).length;
    }

    public static getSummary(session: Session): SessionSummary {
        const firstTries: AnswerRecord[] = session.records.filter((record) => !record.question.isRetry);
        return {
            correctAtFirstTry: firstTries.filter((record) => record.isCorrect).length,
            firstTryCount: firstTries.length,
            factsToReinforce: firstTries.filter((record) => !record.isCorrect).map((record) => record.question)
        };
    }
}
