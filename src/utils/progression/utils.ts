import moment from "moment";
import { ArithmeticUtils } from "../arithmetic/utils.ts";
import { ClockUtils, type ClockSettings } from "../clock/utils.ts";
import { DifficultiesUtils, type Difficulty } from "../difficulties/utils.ts";
import { LeitnerUtils, type LeitnerBoxes } from "../leitner/utils.ts";
import { LevelsUtils, type RecentAnswer, type RecordTrackAnswerResult, type TrackProgress } from "../levels/utils.ts";
import { OperationsUtils, type ArithmeticOperation, type Operation } from "../operations/utils.ts";
import { ProfilesUtils, type Profile } from "../profiles/utils.ts";
import { RecordsUtils, type RecordCategory, type RegisterTimeResult } from "../records/utils.ts";
import { SessionUtils, type AnswerRecord, type SessionSummary } from "../session/utils.ts";
import { StatsUtils } from "../stats/utils.ts";
import { WalletUtils, type AddWalletPointsResult } from "../wallet/utils.ts";

export type Milestone = { kind: "coin" } | { kind: "level-up"; level: number };

export interface ApplyRecordResult {
    profile: Profile;
    milestones: Milestone[];
}

// What the end of a session proposes: the next difficulty, or a step back after a hard run.
export type SessionOffer = { kind: "unlock"; difficulty: Difficulty } | { kind: "safety-net"; difficulty: Difficulty };

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

interface TimedProfile {
    profile: Profile;
    clock: ClockOutcome | null;
}

export interface FinishSessionResult {
    profile: Profile;
    offer: SessionOffer | null;
    clock: ClockOutcome | null;
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
        const isTablesQuestion: boolean = !OperationsUtils.isArithmetic(question.operation);
        const boxes: LeitnerBoxes = isTablesQuestion ? LeitnerUtils.applyAnswer(profile.boxes, question.boxKey, isCorrect) : profile.boxes;
        const skillBoxes: LeitnerBoxes = isTablesQuestion ? profile.skillBoxes : LeitnerUtils.applySkillAnswer(profile.skillBoxes, question.boxKey, isCorrect);

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
        const operation: Operation = counted.settings.operation;
        if (!OperationsUtils.isArithmetic(operation)) {
            return { profile: counted, offer: null, clock: timed.clock };
        }

        const unlockable: Difficulty | null = this.getUnlockableDifficulty(counted, operation);
        if (unlockable !== null) {
            return {
                profile: { ...counted, unlockedDifficulties: { ...counted.unlockedDifficulties, [operation]: unlockable } },
                offer: { kind: "unlock", difficulty: unlockable },
                clock: timed.clock
            };
        }

        const saferDifficulty: Difficulty | null = this.getSafetyNetDifficulty(counted, operation);
        if (saferDifficulty !== null) {
            const trackId: string = LevelsUtils.getTrackId(operation, counted.settings[operation].difficulty);
            const track: TrackProgress = LevelsUtils.getTrack(counted.tracks, trackId);
            return {
                profile: { ...counted, tracks: { ...counted.tracks, [trackId]: { ...track, answersSinceSafetyNet: 0 } } },
                offer: { kind: "safety-net", difficulty: saferDifficulty },
                clock: timed.clock
            };
        }

        return { profile: counted, offer: null, clock: timed.clock };
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

    // Either offer is accepted by playing its difficulty; nothing is lost in the one left behind.
    public static acceptOffer(profile: Profile, offer: SessionOffer): Profile {
        const operation: Operation = profile.settings.operation;
        if (!OperationsUtils.isArithmetic(operation)) {
            return profile;
        }
        return { ...profile, settings: { ...profile.settings, [operation]: { ...profile.settings[operation], difficulty: offer.difficulty } } };
    }

    // Only from the highest open difficulty, and only once all its skills are open, so no skill is skipped.
    public static getUnlockableDifficulty(profile: Profile, operation: ArithmeticOperation): Difficulty | null {
        const difficulty: Difficulty = profile.settings[operation].difficulty;
        const next: Difficulty | null = DifficultiesUtils.getNext(difficulty);
        if (next === null || difficulty !== profile.unlockedDifficulties[operation]) {
            return null;
        }

        const track: TrackProgress = LevelsUtils.getTrack(profile.tracks, LevelsUtils.getTrackId(operation, difficulty));
        if (track.level < ArithmeticUtils.getSkills(operation, difficulty).length) {
            return null;
        }

        const typedAnswers: RecentAnswer[] = track.recentAnswers.filter((answer) => answer.format !== "choice").slice(-this.getUnlockWindow());
        const correctCount: number = typedAnswers.filter((answer) => answer.isCorrect).length;
        const distinctCount: number = new Set(typedAnswers.map((answer) => answer.questionId)).size;
        const isReady: boolean =
            typedAnswers.length === this.getUnlockWindow() &&
            correctCount >= this.getUnlockMinCorrect() &&
            distinctCount >= this.getUnlockMinDistinctQuestions();
        return isReady ? next : null;
    }

    public static getSafetyNetDifficulty(profile: Profile, operation: ArithmeticOperation): Difficulty | null {
        const difficulty: Difficulty = profile.settings[operation].difficulty;
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
