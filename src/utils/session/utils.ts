import { ArithmeticUtils, type Skill } from "../arithmetic/utils.ts";
import { FactsUtils, type Fact } from "../facts/utils.ts";
import { LeitnerUtils } from "../leitner/utils.ts";
import { LevelsUtils } from "../levels/utils.ts";
import type { Difficulty } from "../difficulties/utils.ts";
import { OperationsUtils, type MultiplicativeOperation, type Operation } from "../operations/utils.ts";
import { ProfilesUtils, type Profile } from "../profiles/utils.ts";
import type { ClockOutcome, Milestone, SessionOffer } from "../progression/utils.ts";
import { QuestionsUtils, type AnswerLayout, type Question } from "../questions/utils.ts";
import { RandomUtils, type RandomSource } from "../random/utils.ts";

// A finished question: every attempt given, and whether the last one was right.
export interface AnswerRecord {
    question: Question;
    givenAnswers: number[];
    isCorrect: boolean;
    isHelped: boolean;
}

export interface Session {
    questions: Question[];
    currentIndex: number;
    records: AnswerRecord[];
    // Wrong attempts on the current question while it still has a second chance.
    missedAttempts: number[];
    isCurrentHelped: boolean;
    helpsUsed: number;
}

// try-again: the first attempt missed and the child gets a second chance before seeing the answer.
export type AttemptOutcome = "correct" | "try-again" | "missed";

export interface SubmitAnswerResult {
    session: Session;
    outcome: AttemptOutcome;
    record: AnswerRecord | null;
}

export interface SessionSummary {
    correctAtFirstTry: number;
    helpedCount: number;
    firstTryCount: number;
    questionsToReinforce: Question[];
}

// What the summary screen shows once the session is over.
export interface SessionOutcome {
    summary: SessionSummary;
    elapsedMilliseconds: number | null;
    milestones: Milestone[];
    offer: SessionOffer | null;
    clock: ClockOutcome | null;
}

export class SessionUtils {
    public static getQuestionsPerSession(): number {
        return 10;
    }

    // Questions asked between a miss and its retry, so the correction is no longer on screen.
    public static getRetryGap(): number {
        return 3;
    }

    // The first miss only says "try again"; the answer shows after the second.
    public static getAttemptsPerQuestion(): number {
        return 2;
    }

    // Tries to find a question not yet asked in the session before accepting a repeat.
    public static getMaxDrawAttempts(): number {
        return 50;
    }

    public static create(profile: Profile, random: RandomSource = Math.random): Session {
        const operations: Operation[] = ProfilesUtils.getPracticeOperations(profile.settings);
        const questions: Question[] =
            operations.length === 1 ? this.createOperationQuestions(profile, operations[0], random) : this.createMixedQuestions(profile, operations, random);
        return { questions, currentIndex: 0, records: [], missedAttempts: [], isCurrentHelped: false, helpsUsed: 0 };
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

    public static isFirstTryCorrect(record: AnswerRecord): boolean {
        return record.isCorrect && record.givenAnswers.length === 1;
    }

    // Retries and helped answers show what the child can do with support, not alone: they never move boxes, levels or coins.
    public static countsForProgress(record: AnswerRecord): boolean {
        return !record.question.isRetry && !record.isHelped;
    }

    public static submitAnswer(session: Session, givenAnswer: number, random: RandomSource = Math.random): SubmitAnswerResult {
        if (this.getCurrentRecord(session) !== null) {
            throw new Error("The current question was already answered.");
        }

        const question: Question = this.getCurrentQuestion(session);
        const isCorrect: boolean = givenAnswer === question.answer;
        const hasAnotherAttempt: boolean = session.missedAttempts.length + 1 < this.getAttemptsPerQuestion();
        if (!isCorrect && hasAnotherAttempt) {
            return { session: { ...session, missedAttempts: [...session.missedAttempts, givenAnswer] }, outcome: "try-again", record: null };
        }

        const record: AnswerRecord = { question, givenAnswers: [...session.missedAttempts, givenAnswer], isCorrect, isHelped: session.isCurrentHelped };
        const questions: Question[] = this.isFirstTryCorrect(record) || question.isRetry ? session.questions : this.scheduleRetry(session, question, random);
        return {
            session: { ...session, questions, records: [...session.records, record], missedAttempts: [] },
            outcome: isCorrect ? "correct" : "missed",
            record
        };
    }

    // The coin is paid once per question; asking again on the same question shows the next step for free.
    public static registerHelp(session: Session): Session {
        if (this.getCurrentRecord(session) !== null) {
            throw new Error("The current question was already answered.");
        }
        return { ...session, isCurrentHelped: true, helpsUsed: session.isCurrentHelped ? session.helpsUsed : session.helpsUsed + 1 };
    }

    public static advance(session: Session): Session {
        if (this.getCurrentRecord(session) === null) {
            throw new Error("Answer the current question before moving on.");
        }
        return { ...session, currentIndex: session.currentIndex + 1, missedAttempts: [], isCurrentHelped: false };
    }

    public static hasRetryAhead(session: Session): boolean {
        const question: Question = session.questions[session.currentIndex];
        return session.questions.slice(session.currentIndex + 1).some((candidate) => candidate.isRetry && candidate.id === question.id);
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
        const isAlone = (record: AnswerRecord): boolean => this.isFirstTryCorrect(record) && !record.isHelped;
        return {
            correctAtFirstTry: firstTries.filter(isAlone).length,
            helpedCount: firstTries.filter((record) => record.isHelped).length,
            firstTryCount: firstTries.length,
            questionsToReinforce: firstTries.filter((record) => !isAlone(record)).map((record) => record.question)
        };
    }

    // A miss is asked again once, a few questions later. A second miss waits for a future session: the box is
    // already back at 1, so it will come up often. A miss on the last question also waits, so the same
    // question never shows twice in a row.
    private static scheduleRetry(session: Session, question: Question, random: RandomSource): Question[] {
        const nextIndex: number = session.currentIndex + 1;
        const retryIndex: number = Math.min(nextIndex + this.getRetryGap(), session.questions.length);
        if (retryIndex === nextIndex) {
            return session.questions;
        }
        const retry: Question = QuestionsUtils.buildRetry(question, random);
        return [...session.questions.slice(0, retryIndex), retry, ...session.questions.slice(retryIndex)];
    }

    // A full session of one operation, at that operation's own settings.
    private static createOperationQuestions(profile: Profile, operation: Operation, random: RandomSource): Question[] {
        const difficulty: Difficulty = ProfilesUtils.getDifficulty(profile.settings, operation);
        if (OperationsUtils.isMultiplicative(operation) && OperationsUtils.usesTables(operation, difficulty)) {
            return this.createTablesQuestions(profile, operation, random);
        }
        return this.createSkillQuestions(profile, operation, difficulty, random);
    }

    // The questions are shared out as evenly as possible (10 between 4 operations: 3, 3, 2, 2, the extra ones to
    // operations drawn at random), then shuffled. Each operation still draws its weakest facts or skills first.
    private static createMixedQuestions(profile: Profile, operations: Operation[], random: RandomSource): Question[] {
        const total: number = this.getQuestionsPerSession();
        const baseCount: number = Math.floor(total / operations.length);
        const operationsWithExtra: Operation[] = RandomUtils.shuffle(operations, random).slice(0, total % operations.length);
        const questions: Question[] = operations.flatMap((operation) => {
            const count: number = baseCount + (operationsWithExtra.includes(operation) ? 1 : 0);
            return this.createOperationQuestions(profile, operation, random).slice(0, count);
        });
        return RandomUtils.shuffle(questions, random);
    }

    private static createTablesQuestions(profile: Profile, operation: MultiplicativeOperation, random: RandomSource): Question[] {
        const facts: Fact[] = FactsUtils.getForTables(profile.settings[operation].tables);
        if (facts.length === 0) {
            throw new Error("Choose at least one table to start a session.");
        }

        const drawnFacts: Fact[] = RandomUtils.pickWeightedWithoutReplacement({
            items: facts,
            count: this.getQuestionsPerSession(),
            getWeight: (fact) => LeitnerUtils.getDrawWeight(fact, profile.boxes),
            random
        });
        const { isAlwaysTyped } = profile.settings[operation];
        return drawnFacts.map((fact) =>
            operation === "multiplication"
                ? QuestionsUtils.buildMultiplication(fact, { mode: profile.settings.multiplication.mode, boxes: profile.boxes, isAlwaysTyped, random })
                : QuestionsUtils.buildDivision(fact, { boxes: profile.boxes, isAlwaysTyped, random })
        );
    }

    // Each question trains one of the skills the level has opened, the weakest ones more often.
    private static createSkillQuestions(profile: Profile, operation: Operation, difficulty: Difficulty, random: RandomSource): Question[] {
        const layout: AnswerLayout = ProfilesUtils.getLayout(profile.settings, operation);
        const isAlwaysTyped: boolean = ProfilesUtils.isAlwaysTyped(profile.settings, operation);
        const level: number = LevelsUtils.getTrack(profile.tracks, LevelsUtils.getTrackId(operation, difficulty)).level;
        const skills: Skill[] = ArithmeticUtils.getOpenSkills(operation, difficulty, level);

        const questions: Question[] = [];
        while (questions.length < this.getQuestionsPerSession()) {
            const skill: Skill = RandomUtils.pickWeightedWithoutReplacement({
                items: skills,
                count: 1,
                getWeight: (candidate) => LeitnerUtils.getBoxDrawWeight(profile.skillBoxes, ArithmeticUtils.getSkillId(operation, difficulty, candidate)),
                random
            })[0];
            const usedIds: string[] = questions.map((question) => question.id);
            const question: Question = (() => {
                let candidate: Question | null = null;
                for (let attempt = 0; attempt < this.getMaxDrawAttempts(); attempt++) {
                    const { left, right } = ArithmeticUtils.generate(operation, difficulty, skill, random);
                    candidate = QuestionsUtils.buildForSkill({
                        operation,
                        difficulty,
                        skill,
                        left,
                        right,
                        layout,
                        isAlwaysTyped,
                        recentSkillAnswers: profile.recentSkillAnswers,
                        random
                    });
                    if (!usedIds.includes(candidate.id)) {
                        return candidate;
                    }
                }
                if (candidate === null) {
                    throw new Error("Could not draw a question.");
                }
                return candidate;
            })();
            questions.push(question);
        }
        return questions;
    }
}
