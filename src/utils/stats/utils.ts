import moment from "moment";

export interface PracticeStats {
    sessionsCompleted: number;
    practiceDays: number;
    currentStreak: number;
    lastPracticeDay: string | null;
}

export class StatsUtils {
    public static getDayFormat(): string {
        return "YYYY-MM-DD";
    }

    public static createEmpty(): PracticeStats {
        return { sessionsCompleted: 0, practiceDays: 0, currentStreak: 0, lastPracticeDay: null };
    }

    public static registerSession(stats: PracticeStats, now: moment.Moment): PracticeStats {
        const today: string = now.format(this.getDayFormat());
        if (stats.lastPracticeDay === today) {
            return { ...stats, sessionsCompleted: stats.sessionsCompleted + 1 };
        }

        return {
            sessionsCompleted: stats.sessionsCompleted + 1,
            practiceDays: stats.practiceDays + 1,
            currentStreak: this.getDaysSinceLastPractice(stats, now) === 1 ? stats.currentStreak + 1 : 1,
            lastPracticeDay: today
        };
    }

    // A missed day only hides the streak; nothing else is taken away and no message points it out.
    public static getVisibleStreak(stats: PracticeStats, now: moment.Moment): number {
        const daysSinceLastPractice: number | null = this.getDaysSinceLastPractice(stats, now);
        if (daysSinceLastPractice === null || daysSinceLastPractice > 1) {
            return 0;
        }
        return stats.currentStreak;
    }

    private static getDaysSinceLastPractice(stats: PracticeStats, now: moment.Moment): number | null {
        if (stats.lastPracticeDay === null) {
            return null;
        }
        return now.clone().startOf("day").diff(moment(stats.lastPracticeDay, this.getDayFormat()), "days");
    }
}
