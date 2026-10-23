import moment from "moment";
import { FactorGameUtils } from "../factorGame/utils.ts";
import { LevelsUtils } from "../levels/utils.ts";
import { MemoryGameUtils } from "../memoryGame/utils.ts";
import { OperationsUtils, type Operation } from "../operations/utils.ts";
import type { Practice, Profile } from "../profiles/utils.ts";
import type { ApplyRecordResult, Milestone } from "../progression/utils.ts";
import { RandomUtils, type RandomSource } from "../random/utils.ts";
import { RoundGameUtils, type RoundGameId } from "../roundGame/utils.ts";
import { StatsUtils } from "../stats/utils.ts";
import { WalletUtils, type AddWalletPointsResult } from "../wallet/utils.ts";

// What a mission can ask for: a game of one operation, or one of the children's games.
export type MissionGame = Operation | "factor-game" | RoundGameId | "memory";

export interface DailyMission {
    day: string;
    game: MissionGame;
    isDone: boolean;
}

export interface Missions {
    // The last mission drawn; it is today's only while its day is today.
    current: DailyMission | null;
    // The days a mission was done, oldest first. Only the last week is kept: it is all the week's circles need.
    doneDays: string[];
    doneCount: number;
}

export interface MissionWeekDay {
    day: string;
    isDone: boolean;
    isToday: boolean;
}

// "Missão do dia": one game to finish each day, for a coin. The week fills a circle for each day done; a missed day
// stays an empty circle and nothing is ever taken away, so there is no streak to lose.
export class MissionsUtils {
    public static getValidGames(): MissionGame[] {
        return [...OperationsUtils.getValidOperations(), "factor-game", ...RoundGameUtils.getValidGames(), "memory"];
    }

    // Until a child has played this many games, the missions also come from the games for the youngest.
    public static getMinPlayedGames(): number {
        return 2;
    }

    public static getStarterGames(): MissionGame[] {
        return ["counting", "addition"];
    }

    public static getDaysPerWeek(): number {
        return 7;
    }

    public static createEmpty(): Missions {
        return { current: null, doneDays: [], doneCount: 0 };
    }

    public static getToday(missions: Missions, now: moment.Moment): DailyMission | null {
        if (missions.current === null || missions.current.day !== now.format(StatsUtils.getDayFormat())) {
            return null;
        }
        return missions.current;
    }

    // The first time the home screen opens on a new day, today's mission is drawn and kept for the whole day.
    public static refresh(profile: Profile, now: moment.Moment, random: RandomSource = Math.random): Profile {
        if (this.getToday(profile.missions, now) !== null) {
            return profile;
        }
        const current: DailyMission = { day: now.format(StatsUtils.getDayFormat()), game: this.drawGame(profile, random), isDone: false };
        return { ...profile, missions: { ...profile.missions, current } };
    }

    // From the games already played, the lower the level the likelier, and never yesterday's game again when there
    // is another one to play.
    public static drawGame(profile: Profile, random: RandomSource = Math.random): MissionGame {
        const played: MissionGame[] = this.getValidGames().filter((game) => this.hasPlayed(profile, game));
        const candidates: MissionGame[] = (() => {
            const pool: MissionGame[] =
                played.length >= this.getMinPlayedGames() ? played : [...played, ...this.getStarterGames().filter((game) => !played.includes(game))];
            const previous: MissionGame | null = profile.missions.current === null ? null : profile.missions.current.game;
            const fresh: MissionGame[] = pool.filter((game) => game !== previous);
            return fresh.length === 0 ? pool : fresh;
        })();
        return RandomUtils.pickWeightedWithoutReplacement({
            items: candidates,
            count: 1,
            getWeight: (game) => 1 / this.getLevel(profile, game),
            random
        })[0];
    }

    // Any game finished counts, however it went: the mission rewards playing, not getting everything right. A mix
    // is never a mission's game.
    public static complete(profile: Profile, now: moment.Moment, game: MissionGame | Practice): ApplyRecordResult {
        const today: DailyMission | null = this.getToday(profile.missions, now);
        if (today === null || today.isDone || today.game !== game) {
            return { profile, milestones: [] };
        }

        // With the piggy bank full, the coin waits as any other: the progress to the next one fills up.
        const walletResult: AddWalletPointsResult = WalletUtils.addPoints(profile.wallet, WalletUtils.getPointsPerCoin());
        const missions: Missions = {
            current: { ...today, isDone: true },
            doneDays: [...profile.missions.doneDays, today.day].slice(-this.getDaysPerWeek()),
            doneCount: profile.missions.doneCount + 1
        };
        const isWeekComplete: boolean = this.getWeek(missions, now).every((day) => day.isDone);
        const milestones: Milestone[] = [
            { kind: "mission", isWeekComplete },
            ...Array.from({ length: walletResult.coinsEarned }, (): Milestone => ({ kind: "coin" }))
        ];
        return { profile: { ...profile, wallet: walletResult.wallet, missions }, milestones };
    }

    // Monday to Sunday of the current week.
    public static getWeek(missions: Missions, now: moment.Moment): MissionWeekDay[] {
        const today: string = now.format(StatsUtils.getDayFormat());
        const monday: moment.Moment = now.clone().startOf("isoWeek");
        return Array.from({ length: this.getDaysPerWeek() }, (_, index): MissionWeekDay => {
            const day: string = monday.clone().add(index, "days").format(StatsUtils.getDayFormat());
            return { day, isDone: missions.doneDays.includes(day), isToday: day === today };
        });
    }

    public static hasPlayed(profile: Profile, game: MissionGame): boolean {
        if (OperationsUtils.isValidOperation(game)) {
            return Object.keys(profile.tracks).some((trackId) => trackId.startsWith(`${game}:`));
        }
        return profile.tracks[this.getTrackId(profile, game)] !== undefined;
    }

    // An operation's level is the one of the difficulty it is set to play.
    private static getLevel(profile: Profile, game: MissionGame): number {
        return LevelsUtils.getTrack(profile.tracks, this.getTrackId(profile, game)).level;
    }

    private static getTrackId(profile: Profile, game: MissionGame): string {
        if (OperationsUtils.isValidOperation(game)) {
            return LevelsUtils.getTrackId(game, profile.settings[game].difficulty);
        }
        if (game === "factor-game") {
            return FactorGameUtils.getTrackId();
        }
        if (game === "memory") {
            return MemoryGameUtils.getTrackId();
        }
        return RoundGameUtils.getTrackId(game);
    }
}
