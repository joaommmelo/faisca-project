import { describe, expect, it } from "vitest";
import { createSeededRandom } from "../../test/random.ts";
import { FactorGameUtils, type FactorGame, type FactorRound } from "./utils.ts";

const round24: FactorRound = {
    target: 24,
    pairs: [
        { first: 2, second: 12 },
        { first: 3, second: 8 },
        { first: 4, second: 6 }
    ],
    answer: { first: 4, second: 6 }
};

const createGame = (rounds: FactorRound[]): FactorGame => ({ rounds, currentIndex: 0, missedPairs: [], results: [] });

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
        const result = FactorGameUtils.getCurrentResult(answered.game);
        expect(result).not.toBeNull();
        if (result !== null) {
            expect(FactorGameUtils.isFirstTryCorrect(result)).toBe(true);
            expect(FactorGameUtils.getShownPair(result)).toEqual({ first: 8, second: 3 });
            expect(FactorGameUtils.getOtherPairs(result)).toEqual([
                { first: 2, second: 12 },
                { first: 4, second: 6 }
            ]);
        }
    });

    it("gives a second chance, and after the second miss shows the answer", () => {
        const firstMiss = FactorGameUtils.submit(createGame([round24]), { first: 4, second: 7 });
        expect(firstMiss.outcome).toBe("try-again");
        expect(FactorGameUtils.getCurrentResult(firstMiss.game)).toBeNull();

        const secondMiss = FactorGameUtils.submit(firstMiss.game, { first: 5, second: 5 });
        expect(secondMiss.outcome).toBe("wrong");
        const result = FactorGameUtils.getCurrentResult(secondMiss.game);
        expect(result).not.toBeNull();
        if (result !== null) {
            expect(result.givenPairs).toEqual([
                { first: 4, second: 7 },
                { first: 5, second: 5 }
            ]);
            expect(FactorGameUtils.getShownPair(result)).toEqual(round24.answer);
            expect(FactorGameUtils.getOtherPairs(result)).toHaveLength(2);
        }
    });

    it("counts only the first try, and lists the numbers to practise", () => {
        const round12: FactorRound = { target: 12, pairs: FactorGameUtils.getPairs(12), answer: { first: 2, second: 6 } };
        const atSecondTry: FactorGame = (() => {
            const missed = FactorGameUtils.submit(createGame([round24, round12]), { first: 4, second: 7 });
            return FactorGameUtils.submit(missed.game, { first: 6, second: 4 }).game;
        })();
        const finished: FactorGame = FactorGameUtils.advance(FactorGameUtils.submit(FactorGameUtils.advance(atSecondTry), { first: 3, second: 4 }).game);

        expect(FactorGameUtils.isFinished(finished)).toBe(true);
        expect(FactorGameUtils.getOutcome(finished)).toEqual({ correctAtFirstTry: 1, roundCount: 2, roundsToPractise: [round24] });
    });
});
