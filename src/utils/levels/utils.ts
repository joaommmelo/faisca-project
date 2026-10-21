import type { Difficulty } from "../difficulties/utils.ts";
import type { Operation } from "../operations/utils.ts";
import type { AnswerFormat } from "../questions/utils.ts";

export interface RecentAnswer {
    questionId: string;
    isCorrect: boolean;
    format: AnswerFormat;
}

// One per operation and difficulty ("addition:easy", "multiplication:medium"). Subir de dificuldade keeps the others.
export interface TrackProgress {
    level: number;
    points: number;
    recentAnswers: RecentAnswer[];
    answersSinceSafetyNet: number;
}

export type Tracks = Record<string, TrackProgress>;

export interface RecordTrackAnswerResult {
    track: TrackProgress;
    reachedLevels: number[];
}

export class LevelsUtils {
    public static getFirstLevel(): number {
        return 1;
    }

    // A typed or vertical answer is worth twice a multiple-choice one.
    public static getPointsForAnswer(format: AnswerFormat): number {
        return format === "choice" ? 1 : 2;
    }

    // 20 + 10 × N right typed answers to leave level N, never more than 100.
    public static getPointsToLevelUp(level: number): number {
        const maxAnswersPerLevel: number = 100;
        return this.getPointsForAnswer("keypad") * Math.min(20 + 10 * level, maxAnswersPerLevel);
    }

    // Enough for the unlock check (the last 20 typed answers) even when multiple choice is mixed in.
    public static getMaxRecentAnswers(): number {
        return 40;
    }

    public static getTrackId(operation: Operation, difficulty: Difficulty): string {
        return `${operation}:${difficulty}`;
    }

    public static createTrack(): TrackProgress {
        return { level: this.getFirstLevel(), points: 0, recentAnswers: [], answersSinceSafetyNet: 0 };
    }

    public static getTrack(tracks: Tracks, trackId: string): TrackProgress {
        return tracks[trackId] ?? this.createTrack();
    }

    // Records an answer that counts for progress (first try, no help) and adds its points when it is right.
    public static recordAnswer(track: TrackProgress, answer: RecentAnswer): RecordTrackAnswerResult {
        const reachedLevels: number[] = [];
        let level: number = track.level;
        let points: number = track.points + (answer.isCorrect ? this.getPointsForAnswer(answer.format) : 0);
        while (points >= this.getPointsToLevelUp(level)) {
            points -= this.getPointsToLevelUp(level);
            level += 1;
            reachedLevels.push(level);
        }

        return {
            track: {
                level,
                points,
                recentAnswers: [...track.recentAnswers, answer].slice(-this.getMaxRecentAnswers()),
                answersSinceSafetyNet: track.answersSinceSafetyNet + 1
            },
            reachedLevels
        };
    }

    // How far into the current level, from 0 to 1, for the progress bar.
    public static getLevelProgress(track: TrackProgress): number {
        return track.points / this.getPointsToLevelUp(track.level);
    }
}
