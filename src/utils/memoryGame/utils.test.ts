import moment from "moment";
import { describe, expect, it } from "vitest";
import { createTestProfile } from "../../test/profiles.ts";
import { createSeededRandom } from "../../test/random.ts";
import type { Profile } from "../profiles/utils.ts";
import { RecordsUtils } from "../records/utils.ts";
import { MemoryGameUtils, type MemoryCard, type MemoryGame } from "./utils.ts";

const now: moment.Moment = moment("2026-10-22T18:00:00");

const findPair = (game: MemoryGame, pairId: number): MemoryCard[] => game.cards.filter((card) => card.pairId === pairId);

describe("MemoryGameUtils.create", () => {
    it("deals two cards of the same value per pair, and every pair has a value of its own", () => {
        for (const content of MemoryGameUtils.getValidContents()) {
            for (const pairCount of MemoryGameUtils.getValidPairCounts()) {
                const game: MemoryGame = MemoryGameUtils.create(content, pairCount, createTestProfile(), createSeededRandom(pairCount));
                expect(game.cards).toHaveLength(pairCount * 2);
                expect(new Set(game.cards.map((card) => card.id)).size).toBe(pairCount * 2);
                for (let pairId = 0; pairId < pairCount; pairId++) {
                    const pair: MemoryCard[] = findPair(game, pairId);
                    expect(pair).toHaveLength(2);
                    expect(MemoryGameUtils.getFaceValue(pair[0].face)).toBe(MemoryGameUtils.getFaceValue(pair[1].face));
                    expect(pair.map((card) => card.face.kind)).toContain("number");
                }
                expect(new Set(game.cards.map((card) => card.value)).size).toBe(pairCount);
            }
        }
    });

    it("matches bones with their number, sums up to 10 with their result, and facts of the chosen tables with their product", () => {
        const profile: Profile = createTestProfile({ multiplication: { ...createTestProfile().settings.multiplication, tables: [7] } });
        const quantities: MemoryGame = MemoryGameUtils.create("quantities", 8, profile, createSeededRandom(1));
        expect(quantities.cards.filter((card) => card.face.kind === "quantity")).toHaveLength(8);
        const additions: MemoryGame = MemoryGameUtils.create("additions", 8, profile, createSeededRandom(1));
        expect(additions.cards.every((card) => card.value <= MemoryGameUtils.getMaxValue())).toBe(true);
        const tables: MemoryGame = MemoryGameUtils.create("tables", 8, profile, createSeededRandom(1));
        for (const card of tables.cards) {
            if (card.face.kind === "calculation") {
                expect([card.face.left, card.face.right]).toContain(7);
            }
        }
    });

    it("needs a table to play the times tables", () => {
        expect(MemoryGameUtils.canPlay("tables", [])).toBe(false);
        expect(MemoryGameUtils.canPlay("additions", [])).toBe(true);
    });
});

describe("MemoryGameUtils.flip", () => {
    const game: MemoryGame = MemoryGameUtils.create("additions", 4, createTestProfile(), createSeededRandom(7));
    const [first, second] = findPair(game, 0);
    const [other] = findPair(game, 1);

    it("keeps a pair up when the two cards match, in one turn", () => {
        const opened = MemoryGameUtils.flip(game, first.id);
        expect(opened.outcome).toBe("first");
        const matched = MemoryGameUtils.flip(opened.game, second.id);
        expect(matched.outcome).toBe("match");
        expect(matched.game.matchedPairIds).toEqual([0]);
        expect(matched.game.turns).toBe(1);
        expect(MemoryGameUtils.canFlip(matched.game, first.id)).toBe(false);
    });

    it("shows a miss until the next tap, which turns them back and opens the new card", () => {
        const missed = MemoryGameUtils.flip(MemoryGameUtils.flip(game, first.id).game, other.id);
        expect(missed.outcome).toBe("miss");
        expect(missed.game.flippedIds).toEqual([first.id, other.id]);
        expect(MemoryGameUtils.hideMiss(missed.game).flippedIds).toEqual([]);

        const next = MemoryGameUtils.flip(missed.game, first.id);
        expect(next.outcome).toBe("first");
        expect(next.game.flippedIds).toEqual([first.id]);
        expect(() => MemoryGameUtils.flip(next.game, first.id)).toThrow();
    });

    it("finishes with every pair up", () => {
        const finished: MemoryGame = [0, 1, 2, 3].reduce((current, pairId) => {
            const [one, two] = findPair(current, pairId);
            return MemoryGameUtils.flip(MemoryGameUtils.flip(current, one.id).game, two.id).game;
        }, game);
        expect(MemoryGameUtils.isFinished(finished)).toBe(true);
        expect(MemoryGameUtils.getSummary(finished)).toMatchObject({ pairCount: 4, turns: 4, helpedCount: 0 });
        expect(MemoryGameUtils.getSummary(finished).pairs[0][1].face.kind).toBe("number");
    });
});

describe("MemoryGameUtils helps and progress", () => {
    const game: MemoryGame = MemoryGameUtils.create("additions", 4, createTestProfile(), createSeededRandom(7));
    const [first, second] = findPair(game, 0);

    it("points at the pair of the card face up, once per card", () => {
        expect(MemoryGameUtils.canAskHelp(game)).toBe(false);
        const helped: MemoryGame = MemoryGameUtils.registerHelp(MemoryGameUtils.flip(game, first.id).game);
        expect(helped.hintedCardId).toBe(second.id);
        expect(MemoryGameUtils.registerHelp(helped).helpsUsed).toBe(1);
        const matched: MemoryGame = MemoryGameUtils.flip(helped, second.id).game;
        expect(matched.helpedPairIds).toEqual([0]);
        expect(matched.hintedCardId).toBeNull();
    });

    it("gives a pair found alone the points of a typed answer, and a helped pair nothing", () => {
        const profile: Profile = createTestProfile({}, { wallet: { coins: 1, points: 8 } });
        const matched: MemoryGame = MemoryGameUtils.flip(MemoryGameUtils.flip(game, first.id).game, second.id).game;
        const applied = MemoryGameUtils.applyMatch(profile, matched, 0);
        expect(applied.profile.wallet).toEqual({ coins: 2, points: 0 });
        expect(applied.milestones).toEqual([{ kind: "coin" }]);
        expect(applied.profile.tracks[MemoryGameUtils.getTrackId()].points).toBe(2);
        expect(MemoryGameUtils.applyMatch(profile, { ...matched, helpedPairIds: [0] }, 0).profile).toBe(profile);
    });

    it("keeps the time of a game without help as the record of the same cards", () => {
        const profile: Profile = createTestProfile();
        const summary = { pairCount: 6, turns: 9, helpedCount: 0, pairs: [] };
        const finished = MemoryGameUtils.finish(profile, now, { summary, elapsedMilliseconds: 50000, milestones: [] });
        expect(finished.profile.stats.sessionsCompleted).toBe(1);
        expect(RecordsUtils.getBest(finished.profile.records, RecordsUtils.getMemoryGameCategory("additions", 6, [2, 5, 10]))).toBe(50000);

        const helped = MemoryGameUtils.finish(profile, now, { summary: { ...summary, helpedCount: 1 }, elapsedMilliseconds: 40000, milestones: [] });
        expect(helped.profile.records).toEqual({});
    });
});
