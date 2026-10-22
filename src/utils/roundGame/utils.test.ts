import moment from "moment";
import { describe, expect, it } from "vitest";
import { createTestProfile } from "../../test/profiles.ts";
import { createSeededRandom } from "../../test/random.ts";
import type { MissingSignRound } from "../missingSignGame/utils.ts";
import type { Profile } from "../profiles/utils.ts";
import { RecordsUtils } from "../records/utils.ts";
import { RoundGameUtils, type GameRound, type RoundGame, type RoundResult } from "./utils.ts";

const now: moment.Moment = moment("2026-10-22T18:00:00");

// 2 ? 2 = 4: both + and × are right.
const twoTwo: MissingSignRound = {
    game: "missing-sign",
    id: "missing-sign:2?2=4",
    skill: "add-subtract",
    left: 2,
    right: 2,
    result: 4,
    options: ["addition", "subtraction", "multiplication", "division"],
    answers: ["addition", "multiplication"],
    answer: "addition"
};

const sevenThree: GameRound = { ...twoTwo, id: "missing-sign:7?3=10", left: 7, right: 3, result: 10, answers: ["addition"] };

const createGame = (rounds: GameRound[]): RoundGame => ({
    game: "missing-sign",
    rounds,
    currentIndex: 0,
    missedOptions: [],
    hiddenOptions: [],
    results: [],
    isCurrentHelped: false,
    helpsUsed: 0
});

const rightAtFirstTry: RoundResult = { round: sevenThree, givenOptions: ["addition"], isCorrect: true, isHelped: false };

describe("RoundGameUtils.create", () => {
    it("asks 10 rounds of the kinds the level opens, never the same round twice in a row", () => {
        for (const game of RoundGameUtils.getValidGames()) {
            for (let seed = 1; seed <= 10; seed++) {
                const created: RoundGame = RoundGameUtils.create(createTestProfile(), game, createSeededRandom(seed));
                expect(created.rounds).toHaveLength(RoundGameUtils.getRoundsPerGame());
                expect(created.rounds.every((round) => round.game === game && round.skill === RoundGameUtils.getSkills(game)[0])).toBe(true);
                created.rounds.slice(1).forEach((round, index) => expect(round.id).not.toBe(created.rounds[index].id));
            }
        }
    });

    it("opens one more kind of round at each level, and draws the weaker kinds more often", () => {
        const profile: Profile = createTestProfile(
            {},
            {
                tracks: { "counting-game": { level: 3, points: 0, recentAnswers: [], answersSinceSafetyNet: 0 } },
                skillBoxes: { "counting:to-five": 5, "counting:to-ten": 5 }
            }
        );
        expect(RoundGameUtils.getOpenSkills("counting", 3)).toEqual(["to-five", "to-ten", "scattered"]);
        const skills: string[] = Array.from({ length: 30 }, (_, seed) => RoundGameUtils.create(profile, "counting", createSeededRandom(seed + 1)))
            .flatMap((game) => game.rounds)
            .map((round) => round.skill);
        expect(new Set(skills)).toEqual(new Set(["to-five", "to-ten", "scattered"]));
        expect(skills.filter((skill) => skill === "scattered").length).toBeGreaterThan(skills.length / 2);
    });
});

describe("RoundGameUtils answers", () => {
    it("takes any right option, and gives a second chance before showing the answer", () => {
        const right = RoundGameUtils.submit(createGame([twoTwo]), "multiplication");
        expect(right.outcome).toBe("correct");
        expect(right.result !== null && RoundGameUtils.getShownOption(right.result)).toBe("multiplication");

        const firstMiss = RoundGameUtils.submit(createGame([twoTwo]), "division");
        expect(firstMiss.outcome).toBe("try-again");
        const secondMiss = RoundGameUtils.submit(firstMiss.game, "subtraction");
        expect(secondMiss.outcome).toBe("wrong");
        expect(secondMiss.result?.givenOptions).toEqual(["division", "subtraction"]);
        expect(secondMiss.result !== null && RoundGameUtils.getShownOption(secondMiss.result)).toBe("addition");
    });

    it("counts only the first try alone, and lists each round to practise once", () => {
        const missedTwice: RoundGame = (() => {
            const missed = RoundGameUtils.submit(createGame([sevenThree, twoTwo, sevenThree]), "division");
            return RoundGameUtils.advance(RoundGameUtils.submit(missed.game, "addition").game);
        })();
        const rightThenMissed: RoundGame = RoundGameUtils.advance(RoundGameUtils.submit(missedTwice, "addition").game);
        const missed = RoundGameUtils.submit(rightThenMissed, "division");
        const finished: RoundGame = RoundGameUtils.advance(RoundGameUtils.submit(missed.game, "subtraction").game);

        expect(RoundGameUtils.isFinished(finished)).toBe(true);
        expect(RoundGameUtils.getSummary(finished)).toEqual({ correctAtFirstTry: 1, helpedCount: 0, roundCount: 3, roundsToPractise: [sevenThree] });
    });
});

describe("RoundGameUtils helps", () => {
    it("takes options away until two are left, never one already tried, and charges once per round", () => {
        const missed: RoundGame = RoundGameUtils.submit(createGame([sevenThree]), "division").game;
        const helped: RoundGame = RoundGameUtils.registerHelp(missed, createSeededRandom(3));
        expect(helped.hiddenOptions).toHaveLength(1);
        expect(helped.hiddenOptions).not.toContain("division");
        expect(helped.hiddenOptions).not.toContain("addition");
        expect(RoundGameUtils.registerHelp(helped).helpsUsed).toBe(1);
        expect(RoundGameUtils.advance(helped)).toMatchObject({ isCurrentHelped: false, hiddenOptions: [] });
    });

    it("keeps both right signs when two are right", () => {
        const helped: RoundGame = RoundGameUtils.registerHelp(createGame([twoTwo]), createSeededRandom(1));
        expect([...helped.hiddenOptions].sort()).toEqual(["division", "subtraction"]);
    });

    it("works out a calculation of the balance instead of taking options away", () => {
        const balance: GameRound = {
            game: "balance",
            id: "balance:7×8|54",
            skill: "sum-and-number",
            leftPan: { operation: "multiplication", left: 7, right: 8 },
            rightPan: { operation: null, left: 54, right: 0 },
            options: ["left", "equal", "right"],
            answers: ["left"],
            answer: "left"
        };
        expect(RoundGameUtils.getHelp(balance)).toBe("show-value");
        expect(RoundGameUtils.registerHelp({ ...createGame([balance]), game: "balance" }).hiddenOptions).toEqual([]);
    });
});

describe("RoundGameUtils.applyResult", () => {
    it("moves the kind of round up a box and adds the points of a typed answer to the coins and the game's level", () => {
        const profile: Profile = createTestProfile({}, { wallet: { coins: 1, points: 8 } });
        const applied = RoundGameUtils.applyResult(profile, rightAtFirstTry);

        expect(applied.profile.skillBoxes["missing-sign:add-subtract"]).toBe(2);
        expect(applied.profile.wallet).toEqual({ coins: 2, points: 0 });
        expect(applied.milestones).toEqual([{ kind: "coin" }]);
        expect(applied.profile.tracks["missing-sign-game"].points).toBe(2);
    });

    it("takes the kind of round down a box after a miss, and moves nothing with help", () => {
        const profile: Profile = createTestProfile({}, { skillBoxes: { "missing-sign:add-subtract": 3 } });
        const missed = RoundGameUtils.applyResult(profile, { ...rightAtFirstTry, givenOptions: ["division", "addition"] });
        expect(missed.profile.skillBoxes["missing-sign:add-subtract"]).toBe(2);
        expect(missed.profile.wallet).toEqual(profile.wallet);
        expect(RoundGameUtils.applyResult(profile, { ...rightAtFirstTry, isHelped: true }).profile).toBe(profile);
    });
});

describe("RoundGameUtils.finish", () => {
    it("counts the game and keeps the time of a perfect game as the record of its game and level", () => {
        const profile: Profile = createTestProfile();
        const finished = RoundGameUtils.finish(profile, now, {
            game: "balance",
            level: 2,
            summary: { correctAtFirstTry: 10, helpedCount: 0, roundCount: 10, roundsToPractise: [] },
            elapsedMilliseconds: 61000,
            milestones: []
        });

        expect(finished.profile.stats.sessionsCompleted).toBe(1);
        expect(finished.clock?.isNewRecord).toBe(true);
        expect(RecordsUtils.getBest(finished.profile.records, RecordsUtils.getRoundGameCategory("balance", 2))).toBe(61000);
        expect(RecordsUtils.getBest(finished.profile.records, RecordsUtils.getRoundGameCategory("balance", 1))).toBeNull();
    });
});
