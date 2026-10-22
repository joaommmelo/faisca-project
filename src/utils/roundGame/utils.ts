import type moment from "moment";
import { BalanceGameUtils, type BalanceRound, type BalanceSide } from "../balanceGame/utils.ts";
import { CountingGameUtils, type CountingRound } from "../countingGame/utils.ts";
import { LeitnerUtils, type LeitnerBoxes } from "../leitner/utils.ts";
import { LevelsUtils, type RecentAnswer, type RecordTrackAnswerResult, type TrackProgress } from "../levels/utils.ts";
import { MissingSignGameUtils, type MissingSignRound } from "../missingSignGame/utils.ts";
import { NumberBondsGameUtils, type NumberBondsRound } from "../numberBondsGame/utils.ts";
import type { Operation } from "../operations/utils.ts";
import type { Profile } from "../profiles/utils.ts";
import { ProgressionUtils, type ApplyRecordResult, type ClockOutcome, type Milestone, type TimedProfile } from "../progression/utils.ts";
import { RandomUtils, type RandomSource } from "../random/utils.ts";
import { RecordsUtils } from "../records/utils.ts";
import { SessionUtils } from "../session/utils.ts";
import { SkipCountingGameUtils, type SkipCountingRound } from "../skipCountingGame/utils.ts";
import { StatsUtils } from "../stats/utils.ts";
import { WalletUtils, type AddWalletPointsResult } from "../wallet/utils.ts";

// The games of ten rounds where the child taps one of a few options: Quantos são?, Amigos do 10, Salta com o Faísca,
// Qual é o sinal? and Qual pesa mais?
export type RoundGameId = "counting" | "number-bonds" | "skip-counting" | "missing-sign" | "balance";

// What a round offers to tap: a number, a sign, or a side of the balance.
export type RoundOption = number | Operation | BalanceSide;

// What every round has, whatever the game.
export interface RoundBase {
    // Never the same round twice in a game when there are enough to choose from.
    id: string;
    // The kind of round, from the game's easiest to its hardest; each level opens one more.
    skill: string;
    options: RoundOption[];
    // Every option that is right: 2 ? 2 = 4 takes + and ×.
    answers: RoundOption[];
    // The one shown after two misses.
    answer: RoundOption;
}

export type GameRound = CountingRound | NumberBondsRound | SkipCountingRound | MissingSignRound | BalanceRound;

// hide-options: two options stay, the answer and one other. show-value: a calculation of the round worked out.
export type RoundHelp = "hide-options" | "show-value";

export interface RoundResult {
    round: GameRound;
    // Every option tapped, the last one included.
    givenOptions: RoundOption[];
    isCorrect: boolean;
    isHelped: boolean;
}

export interface RoundGame {
    game: RoundGameId;
    rounds: GameRound[];
    currentIndex: number;
    // The options already missed on the current round.
    missedOptions: RoundOption[];
    // The options the help took away on the current round.
    hiddenOptions: RoundOption[];
    results: RoundResult[];
    isCurrentHelped: boolean;
    helpsUsed: number;
}

export type RoundAttemptOutcome = "correct" | "try-again" | "wrong";

export interface RoundAttemptResult {
    game: RoundGame;
    outcome: RoundAttemptOutcome;
    // The round's result once it is answered; null when the child gets a second chance.
    result: RoundResult | null;
}

export interface RoundGameSummary {
    correctAtFirstTry: number;
    helpedCount: number;
    roundCount: number;
    // The rounds not found alone at the first try, each once.
    roundsToPractise: GameRound[];
}

// The end of a game, as the game screen hands it over.
export interface FinishedRoundGame {
    game: RoundGameId;
    // The level the game was played at: it decides which rounds came up, so records only compare within it.
    level: number;
    summary: RoundGameSummary;
    elapsedMilliseconds: number | null;
    milestones: Milestone[];
}

// What the screen after a game shows.
export interface RoundGameOutcome extends FinishedRoundGame {
    clock: ClockOutcome | null;
}

// Ten rounds, two tries each, as in the practice. Each game has its own level, which opens its next kind of round,
// and the kinds of round are skills with their boxes, so the weakest open one comes up most. Coins, helps and the
// clock work as in the practice.
export class RoundGameUtils {
    public static getValidGames(): RoundGameId[] {
        return ["counting", "number-bonds", "skip-counting", "missing-sign", "balance"];
    }

    public static getRoundsPerGame(): number {
        return 10;
    }

    // Draws of a round before accepting one already asked in this game (never the one just before).
    public static getMaxDraws(): number {
        return 30;
    }

    public static getTrackId(game: RoundGameId): string {
        return `${game}-game`;
    }

    public static getSkillId(game: RoundGameId, skill: string): string {
        return `${game}:${skill}`;
    }

    // As much as a typed answer, as in Descobre a conta: at half, the second kind of round would only open after six
    // perfect games.
    public static getPointsForAnswer(): number {
        return LevelsUtils.getPointsForAnswer("keypad");
    }

    public static getSkills(game: RoundGameId): string[] {
        switch (game) {
            case "counting":
                return CountingGameUtils.getSkills();
            case "number-bonds":
                return NumberBondsGameUtils.getSkills();
            case "skip-counting":
                return SkipCountingGameUtils.getSkills();
            case "missing-sign":
                return MissingSignGameUtils.getSkills();
            default:
                return BalanceGameUtils.getSkills();
        }
    }

    // Level N opens the N easiest kinds of round.
    public static getOpenSkills(game: RoundGameId, level: number): string[] {
        return this.getSkills(game).slice(0, Math.max(level, 1));
    }

    public static getLevel(profile: Profile, game: RoundGameId): number {
        return LevelsUtils.getTrack(profile.tracks, this.getTrackId(game)).level;
    }

    public static createRound(game: RoundGameId, skill: string, random: RandomSource = Math.random): GameRound {
        switch (game) {
            case "counting":
                return CountingGameUtils.createRound(skill as CountingRound["skill"], random);
            case "number-bonds":
                return NumberBondsGameUtils.createRound(skill as NumberBondsRound["skill"], random);
            case "skip-counting":
                return SkipCountingGameUtils.createRound(skill as SkipCountingRound["skill"], random);
            case "missing-sign":
                return MissingSignGameUtils.createRound(skill as MissingSignRound["skill"], random);
            default:
                return BalanceGameUtils.createRound(skill as BalanceRound["skill"], random);
        }
    }

    // Each round draws a kind among the open ones, the weaker more often, then a round of that kind not asked yet.
    public static create(profile: Profile, game: RoundGameId, random: RandomSource = Math.random): RoundGame {
        const skills: string[] = this.getOpenSkills(game, this.getLevel(profile, game));
        const rounds: GameRound[] = [];
        while (rounds.length < this.getRoundsPerGame()) {
            const [skill]: string[] = RandomUtils.pickWeightedWithoutReplacement({
                items: skills,
                count: 1,
                getWeight: (candidate) => LeitnerUtils.getBoxDrawWeight(profile.skillBoxes, this.getSkillId(game, candidate)),
                random
            });
            rounds.push(this.drawNewRound(game, skill, rounds, random));
        }
        return { game, rounds, currentIndex: 0, missedOptions: [], hiddenOptions: [], results: [], isCurrentHelped: false, helpsUsed: 0 };
    }

    public static getCurrentRound(game: RoundGame): GameRound {
        return game.rounds[game.currentIndex];
    }

    // The current round's result once it is answered, or null while the child is still trying.
    public static getCurrentResult(game: RoundGame): RoundResult | null {
        return game.results.length > game.currentIndex ? game.results[game.currentIndex] : null;
    }

    // The same two tries as in the practice: the first miss only says to try again.
    public static submit(game: RoundGame, option: RoundOption): RoundAttemptResult {
        const round: GameRound = this.getCurrentRound(game);
        const isCorrect: boolean = this.isRight(round, option);
        const hasAnotherAttempt: boolean = game.missedOptions.length + 1 < SessionUtils.getAttemptsPerQuestion();
        if (!isCorrect && hasAnotherAttempt) {
            return { game: { ...game, missedOptions: [...game.missedOptions, option] }, outcome: "try-again", result: null };
        }
        const result: RoundResult = { round, givenOptions: [...game.missedOptions, option], isCorrect, isHelped: game.isCurrentHelped };
        return { game: { ...game, results: [...game.results, result] }, outcome: isCorrect ? "correct" : "wrong", result };
    }

    // A balance with a calculation gets it worked out; every other round keeps two options.
    public static getHelp(round: GameRound): RoundHelp {
        return round.game === "balance" && BalanceGameUtils.getHintSide(round) !== null ? "show-value" : "hide-options";
    }

    // The coin is paid once per round. Taking options away keeps the answer and one option not tried yet; the
    // places of the others stay empty, so nothing jumps under the child's finger.
    public static registerHelp(game: RoundGame, random: RandomSource = Math.random): RoundGame {
        if (this.getCurrentResult(game) !== null) {
            throw new Error("The current round was already answered.");
        }
        if (game.isCurrentHelped) {
            return game;
        }
        const round: GameRound = this.getCurrentRound(game);
        const hiddenOptions: RoundOption[] = this.getHelp(round) === "hide-options" ? this.getOptionsToHide(round, game.missedOptions, random) : [];
        return { ...game, isCurrentHelped: true, helpsUsed: game.helpsUsed + 1, hiddenOptions };
    }

    public static advance(game: RoundGame): RoundGame {
        return { ...game, currentIndex: game.currentIndex + 1, missedOptions: [], hiddenOptions: [], isCurrentHelped: false };
    }

    public static isFinished(game: RoundGame): boolean {
        return game.currentIndex >= game.rounds.length;
    }

    public static isFirstTryCorrect(result: RoundResult): boolean {
        return result.isCorrect && result.givenOptions.length === 1;
    }

    // What the round shows once answered: the child's option when right (one of several right ones), otherwise the
    // answer.
    public static getShownOption(result: RoundResult): RoundOption {
        return result.isCorrect ? result.givenOptions[result.givenOptions.length - 1] : result.round.answer;
    }

    // As in the practice, only the first try counts, and a helped round moves no box, level or coin.
    public static applyResult(profile: Profile, result: RoundResult): ApplyRecordResult {
        if (result.isHelped) {
            return { profile, milestones: [] };
        }

        const { round } = result;
        const game: RoundGameId = round.game;
        const isCorrect: boolean = this.isFirstTryCorrect(result);
        const skillBoxes: LeitnerBoxes = LeitnerUtils.applySkillAnswer(profile.skillBoxes, this.getSkillId(game, round.skill), isCorrect);
        const recentAnswer: RecentAnswer = { questionId: round.id, isCorrect, format: "keypad" };
        const track: TrackProgress = LevelsUtils.getTrack(profile.tracks, this.getTrackId(game));
        const trackResult: RecordTrackAnswerResult = LevelsUtils.recordAnswer(track, recentAnswer);
        const walletResult: AddWalletPointsResult = isCorrect
            ? WalletUtils.addPoints(profile.wallet, this.getPointsForAnswer())
            : { wallet: profile.wallet, coinsEarned: 0 };

        return {
            profile: { ...profile, skillBoxes, tracks: { ...profile.tracks, [this.getTrackId(game)]: trackResult.track }, wallet: walletResult.wallet },
            milestones: [
                ...Array.from({ length: walletResult.coinsEarned }, (): Milestone => ({ kind: "coin" })),
                ...trackResult.reachedLevels.map((level): Milestone => ({ kind: "level-up", level }))
            ]
        };
    }

    public static getSummary(game: RoundGame): RoundGameSummary {
        const isAlone = (result: RoundResult): boolean => this.isFirstTryCorrect(result) && !result.isHelped;
        const roundsToPractise: GameRound[] = game.results
            .filter((result) => !isAlone(result))
            .map((result) => result.round)
            .filter((round, index, rounds) => rounds.findIndex((other) => other.id === round.id) === index);
        return {
            correctAtFirstTry: game.results.filter(isAlone).length,
            helpedCount: game.results.filter((result) => result.isHelped).length,
            roundCount: game.rounds.length,
            roundsToPractise
        };
    }

    // Counts the game and the practice day, and its time against the record of the same game at the same level.
    public static finish(profile: Profile, now: moment.Moment, finished: FinishedRoundGame): TimedProfile {
        const { summary } = finished;
        const timed: TimedProfile = ProgressionUtils.registerTime(
            profile,
            profile.settings.roundGames[finished.game].clock,
            RecordsUtils.getRoundGameCategory(finished.game, finished.level),
            finished.elapsedMilliseconds,
            RecordsUtils.isPerfect({ correctAtFirstTry: summary.correctAtFirstTry, firstTryCount: summary.roundCount })
        );
        return { profile: { ...timed.profile, stats: StatsUtils.registerSession(profile.stats, now) }, clock: timed.clock };
    }

    private static drawNewRound(game: RoundGameId, skill: string, rounds: GameRound[], random: RandomSource): GameRound {
        const previous: GameRound | null = rounds.length === 0 ? null : rounds[rounds.length - 1];
        let round: GameRound = this.createRound(game, skill, random);
        for (let draw = 1; draw < this.getMaxDraws() && rounds.some((asked) => asked.id === round.id); draw++) {
            round = this.createRound(game, skill, random);
        }
        while (previous !== null && round.id === previous.id) {
            round = this.createRound(game, skill, random);
        }
        return round;
    }

    public static isRight(round: GameRound, option: RoundOption): boolean {
        const answers: RoundOption[] = round.answers;
        return answers.includes(option);
    }

    private static getOptionsToHide(round: GameRound, missedOptions: RoundOption[], random: RandomSource): RoundOption[] {
        const options: RoundOption[] = round.options;
        const untriedWrong: RoundOption[] = options.filter((option) => !this.isRight(round, option) && !missedOptions.includes(option));
        const visibleRight: number = options.filter((option) => this.isRight(round, option)).length;
        const hideCount: number = Math.max(untriedWrong.length + visibleRight - 2, 0);
        return RandomUtils.shuffle(untriedWrong, random).slice(0, hideCount);
    }
}
