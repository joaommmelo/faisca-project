import moment from "moment";
import { describe, expect, it } from "vitest";
import { createTestProfile } from "../../test/profiles.ts";
import { createSeededRandom } from "../../test/random.ts";
import { LevelsUtils } from "../levels/utils.ts";
import type { Profile } from "../profiles/utils.ts";
import { RecordsUtils } from "../records/utils.ts";
import { FactorGameUtils, type FactorGame, type FactorGameSummary, type FactorRound, type FactorRoundResult } from "./utils.ts";

const now: moment.Moment = moment("2026-10-22T18:00:00");

const round24: FactorRound = {
    target: 24,
    pairs: [
        { first: 2, second: 12 },
        { first: 3, second: 8 },
        { first: 4, second: 6 }
    ],
    answer: { first: 4, second: 6 }
};

const createGame = (rounds: FactorRound[]): FactorGame => ({ rounds, currentIndex: 0, missedPairs: [], results: [], isCurrentHelped: false, helpsUsed: 0 });

const rightAtFirstTry: FactorRoundResult = { round: round24, givenPairs: [{ first: 8, second: 3 }], isCorrect: true, isHelped: false };
const perfect: FactorGameSummary = { correctAtFirstTry: 10, helpedCount: 0, roundCount: 10, roundsToPractise: [] };

describe("FactorGameUtils numbers", () => {
    it("leaves 1 out of the pad", () => {
        expect(FactorGameUtils.getFactors()).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    });

    it("finds every multiplication of the pad that makes a number, smaller factor first", () => {
        expect(FactorGameUtils.getPairs(24)).toEqual(round24.pairs);
        expect(FactorGameUtils.getPairs(36)).toEqual([
            { first: 3, second: 12 },
            { first: 4, second: 9 },
            { first: 6, second: 6 }
        ]);
        expect(FactorGameUtils.getPairs(144)).toEqual([{ first: 12, second: 12 }]);
        expect(FactorGameUtils.getPairs(26)).toEqual([]);
    });

    it("draws the numbers of the chosen tables, each once, without × 1", () => {
        expect(FactorGameUtils.getTargets([2])).toEqual([4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24]);
        const targets: number[] = FactorGameUtils.getTargets([2, 5, 10]);
        expect(targets.filter((target) => target === 20)).toHaveLength(1);
        expect(targets).not.toContain(2);
        expect(targets).toContain(120);
    });

    it("cannot play with no tables or with the table of 1 alone", () => {
        expect(FactorGameUtils.canPlay([])).toBe(false);
        expect(FactorGameUtils.canPlay([1])).toBe(false);
        expect(FactorGameUtils.canPlay([1, 7])).toBe(true);
    });
});

describe("FactorGameUtils.create", () => {
    it("asks 10 different numbers of the chosen tables, with an answer from those tables", () => {
        for (let seed = 1; seed <= 20; seed++) {
            const tables: number[] = [5];
            const game: FactorGame = FactorGameUtils.create(tables, createSeededRandom(seed));
            const targets: number[] = game.rounds.map((round) => round.target);
            expect(targets).toHaveLength(FactorGameUtils.getRoundsPerGame());
            expect(new Set(targets).size).toBe(targets.length);
            for (const round of game.rounds) {
                expect(FactorGameUtils.getTargets(tables)).toContain(round.target);
                expect(round.answer.first * round.answer.second).toBe(round.target);
                expect([round.answer.first, round.answer.second]).toContain(5);
            }
        }
    });
});

describe("FactorGameUtils answers", () => {
    it("takes any multiplication that makes the number, in either order", () => {
        const answered = FactorGameUtils.submit(createGame([round24]), { first: 8, second: 3 });
        expect(answered.outcome).toBe("correct");
        expect(answered.result).toEqual(rightAtFirstTry);
        expect(FactorGameUtils.getCurrentResult(answered.game)).toEqual(rightAtFirstTry);
        expect(FactorGameUtils.isFirstTryCorrect(rightAtFirstTry)).toBe(true);
        expect(FactorGameUtils.getShownPair(rightAtFirstTry)).toEqual({ first: 8, second: 3 });
        expect(FactorGameUtils.getOtherPairs(rightAtFirstTry)).toEqual([
            { first: 2, second: 12 },
            { first: 4, second: 6 }
        ]);
    });

    it("gives a second chance, and after the second miss shows the answer", () => {
        const firstMiss = FactorGameUtils.submit(createGame([round24]), { first: 4, second: 7 });
        expect(firstMiss.outcome).toBe("try-again");
        expect(firstMiss.result).toBeNull();

        const secondMiss = FactorGameUtils.submit(firstMiss.game, { first: 5, second: 5 });
        expect(secondMiss.outcome).toBe("wrong");
        expect(secondMiss.result).not.toBeNull();
        if (secondMiss.result !== null) {
            expect(secondMiss.result.givenPairs).toEqual([
                { first: 4, second: 7 },
                { first: 5, second: 5 }
            ]);
            expect(FactorGameUtils.getShownPair(secondMiss.result)).toEqual(round24.answer);
            expect(FactorGameUtils.getOtherPairs(secondMiss.result)).toHaveLength(2);
        }
    });

    it("counts only the first try alone, and lists the numbers to practise", () => {
        const round12: FactorRound = { target: 12, pairs: FactorGameUtils.getPairs(12), answer: { first: 2, second: 6 } };
        const atSecondTry: FactorGame = (() => {
            const missed = FactorGameUtils.submit(createGame([round24, round12]), { first: 4, second: 7 });
            return FactorGameUtils.submit(missed.game, { first: 6, second: 4 }).game;
        })();
        const finished: FactorGame = FactorGameUtils.advance(FactorGameUtils.submit(FactorGameUtils.advance(atSecondTry), { first: 3, second: 4 }).game);

        expect(FactorGameUtils.isFinished(finished)).toBe(true);
        expect(FactorGameUtils.getSummary(finished)).toEqual({ correctAtFirstTry: 1, helpedCount: 0, roundCount: 2, roundsToPractise: [round24] });
    });
});

describe("FactorGameUtils helps", () => {
    it("gives the bigger factor of the answer, paid once per round", () => {
        const helped: FactorGame = FactorGameUtils.registerHelp(FactorGameUtils.registerHelp(createGame([round24, round24])));
        expect(FactorGameUtils.getHintFactor(round24)).toBe(6);
        expect(helped.helpsUsed).toBe(1);
        expect(FactorGameUtils.advance(helped).isCurrentHelped).toBe(false);
    });

    it("marks the round as helped, which never counts as found alone", () => {
        const answered = FactorGameUtils.submit(FactorGameUtils.registerHelp(createGame([round24])), { first: 6, second: 4 });
        expect(answered.result?.isHelped).toBe(true);
        expect(FactorGameUtils.getSummary(FactorGameUtils.advance(answered.game))).toEqual({
            correctAtFirstTry: 0,
            helpedCount: 1,
            roundCount: 1,
            roundsToPractise: [round24]
        });
    });
});

describe("FactorGameUtils.applyResult", () => {
    it("moves the fact found up a box and adds the points of a typed answer to the coins and the game's own level", () => {
        const profile: Profile = createTestProfile({}, { boxes: { "3x8": 2 }, wallet: { coins: 1, points: 8 } });
        const applied = FactorGameUtils.applyResult(profile, rightAtFirstTry);

        expect(applied.profile.boxes["3x8"]).toBe(3);
        expect(applied.profile.wallet).toEqual({ coins: 2, points: 0 });
        expect(applied.milestones).toEqual([{ kind: "coin" }]);
        expect(LevelsUtils.getTrack(applied.profile.tracks, FactorGameUtils.getTrackId()).points).toBe(2);
        expect(applied.profile.tracks["multiplication:easy"]).toBeUndefined();
    });

    it("sends the fact shown back to the first box when the first try missed, with no points", () => {
        const profile: Profile = createTestProfile({}, { boxes: { "4x6": 4, "3x8": 4 } });
        const missedThenFound: FactorRoundResult = {
            ...rightAtFirstTry,
            givenPairs: [
                { first: 4, second: 7 },
                { first: 3, second: 8 }
            ]
        };
        const missedTwice: FactorRoundResult = {
            ...rightAtFirstTry,
            givenPairs: [
                { first: 4, second: 7 },
                { first: 5, second: 5 }
            ],
            isCorrect: false
        };

        expect(FactorGameUtils.applyResult(profile, missedThenFound).profile.boxes).toEqual({ "4x6": 4, "3x8": 1 });
        const missed = FactorGameUtils.applyResult(profile, missedTwice);
        expect(missed.profile.boxes).toEqual({ "4x6": 1, "3x8": 4 });
        expect(missed.profile.wallet).toEqual(profile.wallet);
        expect(LevelsUtils.getTrack(missed.profile.tracks, FactorGameUtils.getTrackId()).points).toBe(0);
    });

    it("changes nothing for a helped round", () => {
        const profile: Profile = createTestProfile();
        expect(FactorGameUtils.applyResult(profile, { ...rightAtFirstTry, isHelped: true })).toEqual({ profile, milestones: [] });
    });
});

describe("FactorGameUtils.finish", () => {
    it("counts the game and the practice day", () => {
        const finished = FactorGameUtils.finish(createTestProfile(), now, { summary: perfect, elapsedMilliseconds: null, milestones: [] });
        expect(finished.profile.stats.sessionsCompleted).toBe(1);
        expect(finished.profile.stats.practiceDays).toBe(1);
        expect(finished.clock).toBeNull();
    });

    it("keeps the time of a perfect game as the record of its tables", () => {
        const profile: Profile = createTestProfile();
        const finished = FactorGameUtils.finish(profile, now, { summary: perfect, elapsedMilliseconds: 95_000, milestones: [] });
        expect(finished.clock?.isNewRecord).toBe(true);
        expect(RecordsUtils.getBest(finished.profile.records, RecordsUtils.getFactorGameCategory([10, 5, 2]))).toBe(95_000);
        expect(RecordsUtils.getBest(finished.profile.records, RecordsUtils.getCategory(profile.settings))).toBeNull();
    });

    it("keeps no record from a game with a miss or a help", () => {
        const summary: FactorGameSummary = { ...perfect, correctAtFirstTry: 9, helpedCount: 1 };
        const finished = FactorGameUtils.finish(createTestProfile(), now, { summary, elapsedMilliseconds: 95_000, milestones: [] });
        expect(finished.clock?.isPerfect).toBe(false);
        expect(finished.profile.records).toEqual({});
    });
});
