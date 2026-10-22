import moment from "moment";
import { ArithmeticUtils } from "../arithmetic/utils.ts";
import { ClockUtils, type ClockSettings } from "../clock/utils.ts";
import { DifficultiesUtils, type Difficulty } from "../difficulties/utils.ts";
import { LeitnerUtils, type LeitnerBoxes } from "../leitner/utils.ts";
import { LevelsUtils, type RecentAnswer, type RecordTrackAnswerResult, type TrackProgress } from "../levels/utils.ts";
import type { Operation } from "../operations/utils.ts";
import { ProfilesUtils, type Profile } from "../profiles/utils.ts";
import { QuestionsUtils, type RecentSkillAnswers } from "../questions/utils.ts";
import { RecordsUtils, type RecordCategory, type RegisterTimeResult } from "../records/utils.ts";
import { SessionUtils, type AnswerRecord, type SessionSummary } from "../session/utils.ts";
import { StatsUtils } from "../stats/utils.ts";
import { WalletUtils, type AddWalletPointsResult } from "../wallet/utils.ts";

export type Milestone = { kind: "coin" } | { kind: "level-up"; level: number };

export interface ApplyRecordResult {
    profile: Profile;
    milestones: Milestone[];
}

// What the end of a session proposes for the operation just played: the next difficulty, or a step back after a hard run.
export interface SessionOffer {
    kind: "unlock" | "safety-net";
    operation: Operation;
    difficulty: Difficulty;
}

// How the session went against the clock, when it was on.
export interface ClockOutcome {
    elapsedMilliseconds: number;
    referenceMilliseconds: number;
    // The clock ran against the child's record (there was one), not the default time.
    isAgainstRecord: boolean;
    isWithinReference: boolean;
    isPerfect: boolean;
    isNewRecord: boolean;
    previousRecordMilliseconds: number | null;
}

export interface FinishedSession {
    summary: SessionSummary;
    elapsedMilliseconds: number | null;
}

interface OfferTarget {
    operation: Operation;
    difficulty: Difficulty;
}

interface TimedProfile {
    profile: Profile;
    clock: ClockOutcome | null;
}

export interface FinishSessionResult {
    profile: Profile;
    offer: SessionOffer | null;
    clock: ClockOutcome | null;
}

// One thing still between a child and the next difficulty, with how far along it is. "correct" may also be waiting
// for answers: 15 right but only 17 typed answers so far still needs 3 more.
export type UnlockStep =
    | { kind: "level"; current: number; needed: number; isDone: boolean }
    | { kind: "correct"; current: number; needed: number; outOf: number; missingAnswers: number; isDone: boolean }
    | { kind: "distinct"; current: number; needed: number; isDone: boolean };

// What opens the next difficulty of an operation. The answers only count at the highest open difficulty, and the
// difficulty opens at the end of a session there once every step is done.
export interface UnlockRequirement {
    playDifficulty: Difficulty;
    nextDifficulty: Difficulty;
    steps: UnlockStep[];
    isReady: boolean;
}

export class ProgressionUtils {
    // Unlocking the next difficulty: 15 right in the last 20 typed answers, across at least 10 different questions.
    public static getUnlockWindow(): number {
        return 20;
    }

    public static getUnlockMinCorrect(): number {
        return 15;
    }

    public static getUnlockMinDistinctQuestions(): number {
        return 10;
    }

    // The safety net: fewer than 5 right in the last 10 answers proposes the previous difficulty.
    public static getSafetyNetWindow(): number {
        return 10;
    }

    public static getSafetyNetMinCorrect(): number {
        return 5;
    }

    public static applyRecord(profile: Profile, record: AnswerRecord): ApplyRecordResult {
        if (!SessionUtils.countsForProgress(record)) {
            return { profile, milestones: [] };
        }

        const { question } = record;
        const isCorrect: boolean = SessionUtils.isFirstTryCorrect(record);
        const isFact: boolean = question.boxType === "fact";
        const boxes: LeitnerBoxes = isFact ? LeitnerUtils.applyAnswer(profile.boxes, question.boxKey, isCorrect) : profile.boxes;
        const skillBoxes: LeitnerBoxes = isFact ? profile.skillBoxes : LeitnerUtils.applySkillAnswer(profile.skillBoxes, question.boxKey, isCorrect);
        const recentSkillAnswers: RecentSkillAnswers = isFact
            ? profile.recentSkillAnswers
            : QuestionsUtils.recordSkillAnswer(profile.recentSkillAnswers, question.boxKey, isCorrect);

        const recentAnswer: RecentAnswer = { questionId: question.id, isCorrect, format: question.format };
        const trackResult: RecordTrackAnswerResult = LevelsUtils.recordAnswer(LevelsUtils.getTrack(profile.tracks, question.trackId), recentAnswer);
        const walletResult: AddWalletPointsResult = isCorrect
            ? WalletUtils.addPoints(profile.wallet, LevelsUtils.getPointsForAnswer(question.format))
            : { wallet: profile.wallet, coinsEarned: 0 };

        const milestones: Milestone[] = [
            ...Array.from({ length: walletResult.coinsEarned }, (): Milestone => ({ kind: "coin" })),
            ...trackResult.reachedLevels.map((level): Milestone => ({ kind: "level-up", level }))
        ];

        return {
            profile: {
                ...profile,
                boxes,
                skillBoxes,
                recentSkillAnswers,
                tracks: { ...profile.tracks, [question.trackId]: trackResult.track },
                wallet: walletResult.wallet
            },
            milestones
        };
    }

    // Counts the session and its time, then checks the current difficulty for an offer. Unlocking happens right
    // away; accepting the offer only decides whether to play the new difficulty now. A safety-net offer is not
    // repeated until another full window of answers.
    public static finishSession(profile: Profile, now: moment.Moment, finished: FinishedSession): FinishSessionResult {
        const timed: TimedProfile = this.registerClock(profile, finished);
        const counted: Profile = { ...timed.profile, stats: StatsUtils.registerSession(profile.stats, now) };
        // A mix checks each of its operations; the first unlock wins over any safety net.
        const operations: Operation[] = ProfilesUtils.getPracticeOperations(counted.settings);
        const unlock: OfferTarget | null = this.findTarget(operations, (operation) => this.getUnlockableDifficulty(counted, operation));
        if (unlock !== null) {
            return {
                profile: { ...counted, unlockedDifficulties: { ...counted.unlockedDifficulties, [unlock.operation]: unlock.difficulty } },
                offer: { kind: "unlock", ...unlock },
                clock: timed.clock
            };
        }

        const saferTarget: OfferTarget | null = this.findTarget(operations, (operation) => this.getSafetyNetDifficulty(counted, operation));
        if (saferTarget !== null) {
            const trackId: string = LevelsUtils.getTrackId(saferTarget.operation, ProfilesUtils.getDifficulty(counted.settings, saferTarget.operation));
            const track: TrackProgress = LevelsUtils.getTrack(counted.tracks, trackId);
            return {
                profile: { ...counted, tracks: { ...counted.tracks, [trackId]: { ...track, answersSinceSafetyNet: 0 } } },
                offer: { kind: "safety-net", ...saferTarget },
                clock: timed.clock
            };
        }

        return { profile: counted, offer: null, clock: timed.clock };
    }

    private static findTarget(operations: Operation[], getDifficulty: (operation: Operation) => Difficulty | null): OfferTarget | null {
        for (const operation of operations) {
            const difficulty: Difficulty | null = getDifficulty(operation);
            if (difficulty !== null) {
                return { operation, difficulty };
            }
        }
        return null;
    }

    // The reference is read before this session's time is registered, so it matches what the clock showed.
    // Only a perfect session with the clock on can set a record.
    private static registerClock(profile: Profile, finished: FinishedSession): TimedProfile {
        const clockSettings: ClockSettings = ProfilesUtils.getClock(profile.settings);
        if (!clockSettings.isEnabled || finished.elapsedMilliseconds === null) {
            return { profile, clock: null };
        }

        const category: RecordCategory = RecordsUtils.getCategory(profile.settings);
        const previousRecordMilliseconds: number | null = RecordsUtils.getBest(profile.records, category);
        const referenceMilliseconds: number = ClockUtils.getReferenceMilliseconds(clockSettings, previousRecordMilliseconds);
        const isPerfect: boolean = RecordsUtils.isPerfect(finished.summary);
        const registered: RegisterTimeResult = isPerfect
            ? RecordsUtils.registerTime(profile.records, category, finished.elapsedMilliseconds)
            : { records: profile.records, isNewRecord: false, previousMilliseconds: previousRecordMilliseconds };

        return {
            profile: { ...profile, records: registered.records },
            clock: {
                elapsedMilliseconds: finished.elapsedMilliseconds,
                referenceMilliseconds,
                isAgainstRecord: clockSettings.reference === "record" && previousRecordMilliseconds !== null,
                isWithinReference: finished.elapsedMilliseconds <= referenceMilliseconds,
                isPerfect,
                isNewRecord: registered.isNewRecord,
                previousRecordMilliseconds
            }
        };
    }

    // Either offer is accepted by playing its operation at its difficulty, on its own even after a mix; nothing is
    // lost in the one left behind.
    public static acceptOffer(profile: Profile, offer: SessionOffer): Profile {
        const { operation } = offer;
        return {
            ...profile,
            settings: { ...profile.settings, practice: operation, [operation]: { ...profile.settings[operation], difficulty: offer.difficulty } }
        };
    }

    // Only while playing the highest open difficulty, once its requirement is met.
    public static getUnlockableDifficulty(profile: Profile, operation: Operation): Difficulty | null {
        if (ProfilesUtils.getDifficulty(profile.settings, operation) !== profile.unlockedDifficulties[operation]) {
            return null;
        }
        const requirement: UnlockRequirement | null = this.getUnlockRequirement(profile, operation);
        return requirement !== null && requirement.isReady ? requirement.nextDifficulty : null;
    }

    // Every skill of the highest open difficulty must be open first (its level reaches the number of skills), so no
    // skill is skipped; the times tables have no skills. Then 15 right in the last 20 typed answers, across 10
    // different questions. Null when every difficulty is open.
    public static getUnlockRequirement(profile: Profile, operation: Operation): UnlockRequirement | null {
        const playDifficulty: Difficulty = profile.unlockedDifficulties[operation];
        const nextDifficulty: Difficulty | null = DifficultiesUtils.getNext(playDifficulty);
        if (nextDifficulty === null) {
            return null;
        }

        const track: TrackProgress = LevelsUtils.getTrack(profile.tracks, LevelsUtils.getTrackId(operation, playDifficulty));
        const levelNeeded: number = ArithmeticUtils.getSkills(operation, playDifficulty).length;
        const typedAnswers: RecentAnswer[] = track.recentAnswers.filter((answer) => answer.format !== "choice").slice(-this.getUnlockWindow());
        const correctCount: number = typedAnswers.filter((answer) => answer.isCorrect).length;
        const distinctCount: number = new Set(typedAnswers.map((answer) => answer.questionId)).size;
        const isWindowFull: boolean = typedAnswers.length === this.getUnlockWindow();

        const levelStep: UnlockStep = { kind: "level", current: Math.min(track.level, levelNeeded), needed: levelNeeded, isDone: track.level >= levelNeeded };
        const correctStep: UnlockStep = {
            kind: "correct",
            current: Math.min(correctCount, this.getUnlockMinCorrect()),
            needed: this.getUnlockMinCorrect(),
            outOf: this.getUnlockWindow(),
            missingAnswers: correctCount >= this.getUnlockMinCorrect() ? this.getUnlockWindow() - typedAnswers.length : 0,
            isDone: isWindowFull && correctCount >= this.getUnlockMinCorrect()
        };
        const distinctStep: UnlockStep = {
            kind: "distinct",
            current: distinctCount,
            needed: this.getUnlockMinDistinctQuestions(),
            isDone: distinctCount >= this.getUnlockMinDistinctQuestions()
        };
        // Different questions only matter once there are enough answers: before that, few answers mean few questions.
        const steps: UnlockStep[] = [...(levelNeeded > 0 ? [levelStep] : []), correctStep, ...(isWindowFull && !distinctStep.isDone ? [distinctStep] : [])];
        return { playDifficulty, nextDifficulty, steps, isReady: levelStep.isDone && correctStep.isDone && distinctStep.isDone };
    }

    public static getSafetyNetDifficulty(profile: Profile, operation: Operation): Difficulty | null {
        const difficulty: Difficulty = ProfilesUtils.getDifficulty(profile.settings, operation);
        const previous: Difficulty | null = DifficultiesUtils.getPrevious(difficulty);
        if (previous === null) {
            return null;
        }

        const track: TrackProgress = LevelsUtils.getTrack(profile.tracks, LevelsUtils.getTrackId(operation, difficulty));
        const lastAnswers: RecentAnswer[] = track.recentAnswers.slice(-this.getSafetyNetWindow());
        const isStruggling: boolean =
            track.answersSinceSafetyNet >= this.getSafetyNetWindow() &&
            lastAnswers.length === this.getSafetyNetWindow() &&
            lastAnswers.filter((answer) => answer.isCorrect).length < this.getSafetyNetMinCorrect();
        return isStruggling ? previous : null;
    }
}
