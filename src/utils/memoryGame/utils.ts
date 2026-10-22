import type moment from "moment";
import { FactsUtils, type Fact } from "../facts/utils.ts";
import { LeitnerUtils } from "../leitner/utils.ts";
import { LevelsUtils, type RecentAnswer, type RecordTrackAnswerResult } from "../levels/utils.ts";
import type { Operation } from "../operations/utils.ts";
import type { Profile } from "../profiles/utils.ts";
import type { AnswerFormat } from "../questions/utils.ts";
import { ProgressionUtils, type ApplyRecordResult, type ClockOutcome, type Milestone, type TimedProfile } from "../progression/utils.ts";
import { RandomUtils, type RandomSource } from "../random/utils.ts";
import { RecordsUtils } from "../records/utils.ts";
import { StatsUtils } from "../stats/utils.ts";
import { WalletUtils, type AddWalletPointsResult } from "../wallet/utils.ts";

// What the pairs match: bones with their number, a sum with its result, or a times-table fact with its product.
export type MemoryContent = "quantities" | "additions" | "tables";

// One side of a pair: bones to count, a number, or a calculation.
export type MemoryFace =
    { kind: "quantity"; count: number } | { kind: "number"; value: number } | { kind: "calculation"; operation: Operation; left: number; right: number };

export interface MemoryCard {
    id: number;
    // Both cards of a pair share it, and its value: 7 bones and 7, 3 + 4 and 7.
    pairId: number;
    value: number;
    face: MemoryFace;
}

export interface MemoryGame {
    content: MemoryContent;
    cards: MemoryCard[];
    // Face up and not found yet: none, the first of a turn, or the two of a miss until the next tap.
    flippedIds: number[];
    matchedPairIds: number[];
    // Two cards turned make a turn.
    turns: number;
    // The card the help points at: the pair of the one face up.
    hintedCardId: number | null;
    // The pairs found with help, which earn nothing.
    helpedPairIds: number[];
    isCurrentHelped: boolean;
    helpsUsed: number;
}

// first: the first card of a turn. match: the two make a pair and stay up. miss: they show until the next tap.
export type MemoryFlipOutcome = "first" | "match" | "miss";

export interface MemoryFlipResult {
    game: MemoryGame;
    outcome: MemoryFlipOutcome;
}

export interface MemoryGameSummary {
    pairCount: number;
    turns: number;
    helpedCount: number;
    // Every pair of the game, to see once more what matched what.
    pairs: MemoryCard[][];
}

export interface FinishedMemoryGame {
    summary: MemoryGameSummary;
    elapsedMilliseconds: number | null;
    milestones: Milestone[];
}

export interface MemoryGameOutcome extends FinishedMemoryGame {
    clock: ClockOutcome | null;
}

// "Memória": the cards face down, two turned at a time, and a pair stays up when they match. A pair found alone
// earns the points of a typed answer towards the coins and the game's own level; a miss is part of the
// game (it is the memory, not the sum, that slipped), so it takes nothing away.
export class MemoryGameUtils {
    public static getValidContents(): MemoryContent[] {
        return ["quantities", "additions", "tables"];
    }

    public static getDefaultContent(): MemoryContent {
        return "additions";
    }

    // 8, 12 or 16 cards: four rows of two, three or four pairs.
    public static getValidPairCounts(): number[] {
        return [4, 6, 8];
    }

    public static getDefaultPairCount(): number {
        return 6;
    }

    public static getColumns(): number {
        return 4;
    }

    // Quantities and sums stay within what a young child counts: up to 10.
    public static getMaxValue(): number {
        return 10;
    }

    public static getTrackId(): string {
        return "memory-game";
    }

    // A pair counts as a typed answer: at half, leaving level 1 took some 60 pairs, eight games of 8 pairs.
    public static getPairFormat(): AnswerFormat {
        return "keypad";
    }

    public static getPointsForPair(): number {
        return LevelsUtils.getPointsForAnswer(this.getPairFormat());
    }

    // Any table has 12 facts of different products, enough for the biggest board.
    public static canPlay(content: MemoryContent, tables: number[]): boolean {
        return content !== "tables" || tables.length > 0;
    }

    public static create(content: MemoryContent, pairCount: number, profile: Profile, random: RandomSource = Math.random): MemoryGame {
        const pairs: MemoryFace[][] = this.drawPairs(content, pairCount, profile, random);
        const cards: MemoryCard[] = RandomUtils.shuffle(
            pairs.flatMap((faces, pairId) => faces.map((face) => ({ pairId, value: this.getFaceValue(face), face }))),
            random
        ).map((card, id) => ({ ...card, id }));
        return { content, cards, flippedIds: [], matchedPairIds: [], turns: 0, hintedCardId: null, helpedPairIds: [], isCurrentHelped: false, helpsUsed: 0 };
    }

    public static getFaceValue(face: MemoryFace): number {
        switch (face.kind) {
            case "quantity":
                return face.count;
            case "number":
                return face.value;
            default:
                return face.operation === "addition" ? face.left + face.right : face.left * face.right;
        }
    }

    public static getCard(game: MemoryGame, cardId: number): MemoryCard {
        const card: MemoryCard | undefined = game.cards.find((candidate) => candidate.id === cardId);
        if (card === undefined) {
            throw new Error(`Unknown card: ${cardId}.`);
        }
        return card;
    }

    public static isMatched(game: MemoryGame, card: MemoryCard): boolean {
        return game.matchedPairIds.includes(card.pairId);
    }

    public static isFaceUp(game: MemoryGame, card: MemoryCard): boolean {
        return this.isMatched(game, card) || game.flippedIds.includes(card.id);
    }

    // A card already up does nothing. A tap after a miss turns the two back down first.
    public static canFlip(game: MemoryGame, cardId: number): boolean {
        const card: MemoryCard = this.getCard(game, cardId);
        if (this.isMatched(game, card)) {
            return false;
        }
        return game.flippedIds.length === 2 || !game.flippedIds.includes(cardId);
    }

    public static flip(game: MemoryGame, cardId: number): MemoryFlipResult {
        if (!this.canFlip(game, cardId)) {
            throw new Error(`Card ${cardId} cannot be turned now.`);
        }
        const flippedIds: number[] = game.flippedIds.length === 2 ? [] : game.flippedIds;
        if (flippedIds.length === 0) {
            return { game: { ...game, flippedIds: [cardId], hintedCardId: null, isCurrentHelped: false }, outcome: "first" };
        }

        const first: MemoryCard = this.getCard(game, flippedIds[0]);
        const second: MemoryCard = this.getCard(game, cardId);
        const turned: MemoryGame = { ...game, turns: game.turns + 1, hintedCardId: null, isCurrentHelped: false };
        if (first.pairId !== second.pairId) {
            return { game: { ...turned, flippedIds: [first.id, second.id] }, outcome: "miss" };
        }
        const helpedPairIds: number[] = game.isCurrentHelped ? [...game.helpedPairIds, first.pairId] : game.helpedPairIds;
        return { game: { ...turned, flippedIds: [], matchedPairIds: [...game.matchedPairIds, first.pairId], helpedPairIds }, outcome: "match" };
    }

    // The two cards of a miss go back down.
    public static hideMiss(game: MemoryGame): MemoryGame {
        return game.flippedIds.length === 2 ? { ...game, flippedIds: [] } : game;
    }

    // Only with one card up: the help points at its pair. The coin is paid once for that card.
    public static canAskHelp(game: MemoryGame): boolean {
        return game.flippedIds.length === 1;
    }

    public static registerHelp(game: MemoryGame): MemoryGame {
        if (!this.canAskHelp(game)) {
            throw new Error("The help needs exactly one card face up.");
        }
        if (game.isCurrentHelped) {
            return game;
        }
        const card: MemoryCard = this.getCard(game, game.flippedIds[0]);
        const pair: MemoryCard | undefined = game.cards.find((candidate) => candidate.pairId === card.pairId && candidate.id !== card.id);
        if (pair === undefined) {
            throw new Error(`Card ${card.id} has no pair.`);
        }
        return { ...game, hintedCardId: pair.id, isCurrentHelped: true, helpsUsed: game.helpsUsed + 1 };
    }

    public static isFinished(game: MemoryGame): boolean {
        return game.matchedPairIds.length * 2 === game.cards.length;
    }

    // A pair found alone moves the level and the coins; a helped one moves nothing, as in the practice.
    public static applyMatch(profile: Profile, game: MemoryGame, pairId: number): ApplyRecordResult {
        if (game.helpedPairIds.includes(pairId)) {
            return { profile, milestones: [] };
        }
        const card: MemoryCard | undefined = game.cards.find((candidate) => candidate.pairId === pairId);
        if (card === undefined) {
            throw new Error(`Unknown pair: ${pairId}.`);
        }
        const recentAnswer: RecentAnswer = { questionId: `${this.getTrackId()}:${game.content}:${card.value}`, isCorrect: true, format: this.getPairFormat() };
        const trackResult: RecordTrackAnswerResult = LevelsUtils.recordAnswer(LevelsUtils.getTrack(profile.tracks, this.getTrackId()), recentAnswer);
        const walletResult: AddWalletPointsResult = WalletUtils.addPoints(profile.wallet, this.getPointsForPair());
        return {
            profile: { ...profile, tracks: { ...profile.tracks, [this.getTrackId()]: trackResult.track }, wallet: walletResult.wallet },
            milestones: [
                ...Array.from({ length: walletResult.coinsEarned }, (): Milestone => ({ kind: "coin" })),
                ...trackResult.reachedLevels.map((level): Milestone => ({ kind: "level-up", level }))
            ]
        };
    }

    public static getSummary(game: MemoryGame): MemoryGameSummary {
        const pairIds: number[] = [...new Set(game.cards.map((card) => card.pairId))].sort((first, second) => first - second);
        return {
            pairCount: pairIds.length,
            turns: game.turns,
            helpedCount: game.helpedPairIds.length,
            pairs: pairIds.map((pairId) => this.sortPair(game.cards.filter((card) => card.pairId === pairId)))
        };
    }

    // Counts the game and the practice day. Every game ends with all the pairs found, so a game without help is a
    // perfect one, and its time can be a record of the same cards.
    public static finish(profile: Profile, now: moment.Moment, finished: FinishedMemoryGame): TimedProfile {
        const { memoryGame } = profile.settings;
        const timed: TimedProfile = ProgressionUtils.registerTime(
            profile,
            memoryGame.clock,
            RecordsUtils.getMemoryGameCategory(memoryGame.content, memoryGame.pairCount, profile.settings.multiplication.tables),
            finished.elapsedMilliseconds,
            finished.summary.helpedCount === 0
        );
        return { profile: { ...timed.profile, stats: StatsUtils.registerSession(profile.stats, now) }, clock: timed.clock };
    }

    // The calculation first, then what it makes: "3 + 4 = 7", or the bones and their number.
    private static sortPair(cards: MemoryCard[]): MemoryCard[] {
        return [...cards].sort((first, second) => (first.face.kind === "number" ? 1 : 0) - (second.face.kind === "number" ? 1 : 0));
    }

    // Every pair has its own value, so two cards only ever match their own pair.
    private static drawPairs(content: MemoryContent, pairCount: number, profile: Profile, random: RandomSource): MemoryFace[][] {
        if (content === "tables") {
            return this.drawFacts(profile, pairCount, random).map((fact) => {
                const [left, right]: number[] = RandomUtils.isHeads(random) ? [fact.smallerFactor, fact.largerFactor] : [fact.largerFactor, fact.smallerFactor];
                return [
                    { kind: "calculation", operation: "multiplication", left, right },
                    { kind: "number", value: fact.product }
                ];
            });
        }
        const minValue: number = content === "quantities" ? 1 : 2;
        const values: number[] = RandomUtils.shuffle(
            Array.from({ length: this.getMaxValue() - minValue + 1 }, (_, index) => index + minValue),
            random
        ).slice(0, pairCount);
        return values.map((value): MemoryFace[] => {
            if (content === "quantities") {
                return [
                    { kind: "quantity", count: value },
                    { kind: "number", value }
                ];
            }
            const left: number = RandomUtils.integerBetween(1, value - 1, random);
            return [
                { kind: "calculation", operation: "addition", left, right: value - left },
                { kind: "number", value }
            ];
        });
    }

    // The facts of the multiplication's tables, the weaker more often, each with a product of its own.
    private static drawFacts(profile: Profile, pairCount: number, random: RandomSource): Fact[] {
        const facts: Fact[] = FactsUtils.getForTables(profile.settings.multiplication.tables);
        const ordered: Fact[] = RandomUtils.pickWeightedWithoutReplacement({
            items: facts,
            count: facts.length,
            getWeight: (fact) => LeitnerUtils.getDrawWeight(fact, profile.boxes),
            random
        });
        const picked: Fact[] = [];
        for (const fact of ordered) {
            if (picked.length === pairCount) {
                break;
            }
            if (!picked.some((other) => other.product === fact.product)) {
                picked.push(fact);
            }
        }
        return picked;
    }
}
