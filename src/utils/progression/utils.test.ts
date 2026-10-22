import moment from "moment";
import { describe, expect, it } from "vitest";
import { createTestProfile } from "../../test/profiles.ts";
import type { Difficulty } from "../difficulties/utils.ts";
import type { RecentAnswer, TrackProgress } from "../levels/utils.ts";
import type { Profile } from "../profiles/utils.ts";
import { QuestionsUtils, type AnswerFormat, type Question } from "../questions/utils.ts";
import type { AnswerRecord, SessionSummary } from "../session/utils.ts";
import { ProgressionUtils, type FinishedSession } from "./utils.ts";

const now: moment.Moment = moment("2026-10-21T18:00:00");
const perfect: SessionSummary = { correctAtFirstTry: 10, helpedCount: 0, firstTryCount: 10, questionsToReinforce: [] };
const untimed: FinishedSession = { summary: perfect, elapsedMilliseconds: null };

function additionQuestion(format: AnswerFormat = "vertical", left: number = 37): Question {
    const question: Question = QuestionsUtils.buildForSkill({
        isAlwaysTyped: false,
        operation: "addition",
        difficulty: "easy",
        skill: "no-carry",
        left: 3,
        right: 4,
        layout: "vertical",
        recentSkillAnswers: {}
    });
    return { ...question, id: `addition:${left}+4:direct`, format, options: format === "choice" ? [6, 7, 8, 9] : [] };
}

function record(question: Question, changes: Partial<AnswerRecord> = {}): AnswerRecord {
    return { question, givenAnswers: [question.answer], isCorrect: true, isHelped: false, ...changes };
}

function answers(count: number, correctCount: number, format: AnswerFormat = "vertical", distinct: number = count): RecentAnswer[] {
    return Array.from({ length: count }, (_, index) => ({ questionId: `q${index % distinct}`, isCorrect: index < correctCount, format }));
}

function profileAt(difficulty: Difficulty, track: Partial<TrackProgress>, unlocked: Difficulty = difficulty): Profile {
    const base: Profile = createTestProfile();
    return {
        ...base,
        settings: { ...base.settings, practice: "addition", addition: { ...base.settings.addition, difficulty } },
        unlockedDifficulties: { ...base.unlockedDifficulties, addition: unlocked },
        tracks: { [`addition:${difficulty}`]: { level: 2, points: 0, recentAnswers: [], answersSinceSafetyNet: 0, ...track } }
    };
}

describe("ProgressionUtils.applyRecord", () => {
    it("moves the skill box, the level points and the coin progress on a right answer", () => {
        const result = ProgressionUtils.applyRecord(createTestProfile(), record(additionQuestion()));
        expect(result.profile.skillBoxes["addition:easy:no-carry"]).toBe(2);
        expect(result.profile.tracks["addition:easy"].points).toBe(2);
        expect(result.profile.wallet.points).toBe(2);
    });

    it("counts multiple choice as half", () => {
        const result = ProgressionUtils.applyRecord(createTestProfile(), record(additionQuestion("choice")));
        expect(result.profile.wallet.points).toBe(1);
        expect(result.profile.tracks["addition:easy"].points).toBe(1);
    });

    it("does not count a helped answer as right, nor move anything", () => {
        const profile: Profile = createTestProfile();
        const result = ProgressionUtils.applyRecord(profile, record(additionQuestion(), { isHelped: true }));
        expect(result.profile).toEqual(profile);
        expect(result.milestones).toEqual([]);
    });

    it("takes the skill down one box when the first try missed, even if the second was right", () => {
        const question: Question = additionQuestion();
        const profile: Profile = createTestProfile({}, { skillBoxes: { "addition:easy:no-carry": 4 } });
        const result = ProgressionUtils.applyRecord(profile, record(question, { givenAnswers: [8, question.answer] }));
        expect(result.profile.skillBoxes["addition:easy:no-carry"]).toBe(3);
        expect(result.profile.wallet).toEqual(profile.wallet);
    });

    it("adds the first try to the skill's last answers, which decide whether it is chosen or typed", () => {
        const question: Question = additionQuestion();
        const profile: Profile = createTestProfile({}, { recentSkillAnswers: { "addition:easy:no-carry": [true] } });
        const result = ProgressionUtils.applyRecord(profile, record(question, { givenAnswers: [8, question.answer] }));
        expect(result.profile.recentSkillAnswers).toEqual({ "addition:easy:no-carry": [true, false] });
    });

    it("sends a missed multiplication fact back to box 1, as in v1", () => {
        const question: Question = QuestionsUtils.buildMultiplication(
            { id: "7x8", smallerFactor: 7, largerFactor: 8, product: 56 },
            { mode: "direct", boxes: { "7x8": 4 } }
        );
        const result = ProgressionUtils.applyRecord(
            createTestProfile({}, { boxes: { "7x8": 4 } }),
            record(question, { givenAnswers: [54, 55], isCorrect: false })
        );
        expect(result.profile.boxes["7x8"]).toBe(1);
        expect(result.profile.recentSkillAnswers).toEqual({});
    });

    it("trains the shared multiplication box from a division", () => {
        const division: Question = QuestionsUtils.buildDivision({ id: "7x8", smallerFactor: 7, largerFactor: 8, product: 56 }, { boxes: {} });
        const result = ProgressionUtils.applyRecord(createTestProfile(), record(division));
        expect(result.profile.boxes["7x8"]).toBe(2);
        expect(result.profile.tracks["division:easy"].points).toBe(division.format === "choice" ? 1 : 2);
    });

    it("celebrates a coin when the fifth right answer lands", () => {
        const profile: Profile = createTestProfile({}, { wallet: { coins: 3, points: 8 } });
        const result = ProgressionUtils.applyRecord(profile, record(additionQuestion()));
        expect(result.profile.wallet).toEqual({ coins: 4, points: 0 });
        expect(result.milestones).toEqual([{ kind: "coin" }]);
    });
});

describe("ProgressionUtils.getUnlockableDifficulty", () => {
    it("unlocks after 15 right in the last 20 typed answers across 10 questions", () => {
        expect(ProgressionUtils.getUnlockableDifficulty(profileAt("easy", { recentAnswers: answers(20, 15) }), "addition")).toBe("medium");
    });

    it("waits for 20 typed answers, ignoring multiple choice", () => {
        const recentAnswers: RecentAnswer[] = [...answers(19, 19), ...answers(10, 10, "choice")];
        expect(ProgressionUtils.getUnlockableDifficulty(profileAt("easy", { recentAnswers }), "addition")).toBeNull();
    });

    it("needs 15 right and 10 different questions", () => {
        expect(ProgressionUtils.getUnlockableDifficulty(profileAt("easy", { recentAnswers: answers(20, 14) }), "addition")).toBeNull();
        expect(ProgressionUtils.getUnlockableDifficulty(profileAt("easy", { recentAnswers: answers(20, 20, "keypad", 9) }), "addition")).toBeNull();
    });

    it("waits until every skill of the difficulty is open", () => {
        expect(ProgressionUtils.getUnlockableDifficulty(profileAt("easy", { level: 1, recentAnswers: answers(20, 20) }), "addition")).toBeNull();
    });

    it("only unlocks from the highest open difficulty, and never past Difícil", () => {
        expect(ProgressionUtils.getUnlockableDifficulty(profileAt("easy", { recentAnswers: answers(20, 20) }, "medium"), "addition")).toBeNull();
        expect(ProgressionUtils.getUnlockableDifficulty(profileAt("hard", { level: 3, recentAnswers: answers(20, 20) }), "addition")).toBeNull();
    });
});

describe("ProgressionUtils.getUnlockRequirement", () => {
    it("starts with the level, then 15 right of 20 typed, at the highest open difficulty", () => {
        expect(ProgressionUtils.getUnlockRequirement(profileAt("easy", { level: 1, recentAnswers: answers(6, 4) }), "addition")).toEqual({
            playDifficulty: "easy",
            nextDifficulty: "medium",
            steps: [
                { kind: "level", current: 1, needed: 2, isDone: false },
                { kind: "correct", current: 4, needed: 15, outOf: 20, missingAnswers: 0, isDone: false }
            ],
            isReady: false
        });
    });

    it("has no level step in the times tables, which have no skills", () => {
        const kinds = ProgressionUtils.getUnlockRequirement(createTestProfile(), "multiplication")?.steps.map((step) => step.kind);
        expect(kinds).toEqual(["correct"]);
    });

    it("counts the answers still missing once 15 are right", () => {
        const [, correct] = ProgressionUtils.getUnlockRequirement(profileAt("easy", { recentAnswers: answers(17, 15) }), "addition")?.steps ?? [];
        expect(correct).toEqual({ kind: "correct", current: 15, needed: 15, outOf: 20, missingAnswers: 3, isDone: false });
    });

    it("asks for different questions only when that is what is missing", () => {
        const repeated = ProgressionUtils.getUnlockRequirement(profileAt("easy", { recentAnswers: answers(20, 20, "keypad", 8) }), "addition");
        expect(repeated?.steps.at(-1)).toEqual({ kind: "distinct", current: 8, needed: 10, isDone: false });
        expect(repeated?.isReady).toBe(false);
    });

    it("is ready when every step is done, and agrees with the unlock", () => {
        const profile: Profile = profileAt("easy", { recentAnswers: answers(20, 15) });
        const requirement = ProgressionUtils.getUnlockRequirement(profile, "addition");
        expect(requirement?.steps.every((step) => step.isDone)).toBe(true);
        expect(requirement?.isReady).toBe(true);
        expect(ProgressionUtils.getUnlockableDifficulty(profile, "addition")).toBe(requirement?.nextDifficulty);
    });

    it("is about the highest open difficulty, whatever is chosen, and ends when all are open", () => {
        expect(ProgressionUtils.getUnlockRequirement(profileAt("easy", { recentAnswers: answers(20, 20) }, "medium"), "addition")).toMatchObject({
            playDifficulty: "medium",
            nextDifficulty: "hard",
            isReady: false
        });
        expect(ProgressionUtils.getUnlockRequirement(profileAt("hard", { level: 3 }), "addition")).toBeNull();
    });
});

describe("ProgressionUtils.getSafetyNetDifficulty", () => {
    it("proposes the previous difficulty after fewer than 5 right in the last 10", () => {
        const profile: Profile = profileAt("medium", { recentAnswers: answers(10, 4), answersSinceSafetyNet: 10 });
        expect(ProgressionUtils.getSafetyNetDifficulty(profile, "addition")).toBe("easy");
    });

    it("stays quiet with 5 right, with too few answers, or right after proposing", () => {
        expect(
            ProgressionUtils.getSafetyNetDifficulty(profileAt("medium", { recentAnswers: answers(10, 5), answersSinceSafetyNet: 10 }), "addition")
        ).toBeNull();
        expect(ProgressionUtils.getSafetyNetDifficulty(profileAt("medium", { recentAnswers: answers(9, 0), answersSinceSafetyNet: 9 }), "addition")).toBeNull();
        expect(
            ProgressionUtils.getSafetyNetDifficulty(profileAt("medium", { recentAnswers: answers(10, 0), answersSinceSafetyNet: 3 }), "addition")
        ).toBeNull();
    });

    it("has nothing below Fácil", () => {
        expect(ProgressionUtils.getSafetyNetDifficulty(profileAt("easy", { recentAnswers: answers(10, 0), answersSinceSafetyNet: 10 }), "addition")).toBeNull();
    });
});

describe("ProgressionUtils.finishSession", () => {
    it("unlocks right away and lets the child decide when to play it", () => {
        const result = ProgressionUtils.finishSession(profileAt("easy", { recentAnswers: answers(20, 18) }), now, untimed);
        expect(result.offer).toEqual({ kind: "unlock", operation: "addition", difficulty: "medium" });
        expect(result.profile.unlockedDifficulties.addition).toBe("medium");
        expect(result.profile.settings.addition.difficulty).toBe("easy");
        expect(result.profile.stats.sessionsCompleted).toBe(1);

        expect(ProgressionUtils.acceptOffer(result.profile, result.offer!).settings.addition.difficulty).toBe("medium");
    });

    it("keeps level and coins when stepping back, and does not repeat the proposal at once", () => {
        const profile: Profile = {
            ...profileAt("medium", { level: 3, recentAnswers: answers(10, 2), answersSinceSafetyNet: 12 }),
            wallet: { coins: 4, points: 6 }
        };
        const result = ProgressionUtils.finishSession(profile, now, untimed);
        expect(result.offer).toEqual({ kind: "safety-net", operation: "addition", difficulty: "easy" });
        expect(result.profile.tracks["addition:medium"].answersSinceSafetyNet).toBe(0);
        expect(ProgressionUtils.getSafetyNetDifficulty(result.profile, "addition")).toBeNull();

        const steppedBack: Profile = ProgressionUtils.acceptOffer(result.profile, result.offer!);
        expect(steppedBack.settings.addition.difficulty).toBe("easy");
        expect(steppedBack.tracks["addition:medium"].level).toBe(3);
        expect(steppedBack.wallet).toEqual({ coins: 4, points: 6 });
        expect(steppedBack.unlockedDifficulties.addition).toBe("medium");
    });

    it("offers nothing in multiplication", () => {
        expect(ProgressionUtils.finishSession(createTestProfile({ practice: "multiplication" }), now, untimed).offer).toBeNull();
    });
});

describe("ProgressionUtils.finishSession with the clock", () => {
    function timedProfile(changes: Partial<Profile> = {}): Profile {
        const base: Profile = createTestProfile({ practice: "multiplication" });
        const clock = { isEnabled: true, direction: "down" as const, reference: "record" as const };
        return { ...base, ...changes, settings: { ...base.settings, multiplication: { ...base.settings.multiplication, clock } } };
    }

    it("sets the first record on a perfect timed session", () => {
        const result = ProgressionUtils.finishSession(timedProfile(), now, { summary: perfect, elapsedMilliseconds: 95_000 });
        expect(result.clock).toMatchObject({ isNewRecord: true, previousRecordMilliseconds: null, referenceMilliseconds: 180_000, isWithinReference: true });
        expect(Object.values(result.profile.records).map((best) => best.milliseconds)).toEqual([95_000]);
    });

    it("measures against the record and only beats it when faster", () => {
        const first = ProgressionUtils.finishSession(timedProfile(), now, { summary: perfect, elapsedMilliseconds: 95_000 }).profile;
        const slower = ProgressionUtils.finishSession(first, now, { summary: perfect, elapsedMilliseconds: 99_000 });
        expect(slower.clock).toMatchObject({ isNewRecord: false, referenceMilliseconds: 95_000, isWithinReference: false });

        const faster = ProgressionUtils.finishSession(first, now, { summary: perfect, elapsedMilliseconds: 80_000 });
        expect(faster.clock).toMatchObject({ isNewRecord: true, previousRecordMilliseconds: 95_000 });
    });

    it("never sets a record without a perfect session", () => {
        const withMiss: SessionSummary = { ...perfect, correctAtFirstTry: 9 };
        const result = ProgressionUtils.finishSession(timedProfile(), now, { summary: withMiss, elapsedMilliseconds: 40_000 });
        expect(result.clock?.isNewRecord).toBe(false);
        expect(result.profile.records).toEqual({});
    });

    it("reports nothing when the clock is off", () => {
        expect(ProgressionUtils.finishSession(createTestProfile(), now, untimed).clock).toBeNull();
    });
});

describe("ProgressionUtils with multiplication and division difficulties and mixes", () => {
    function tablesProfile(recentAnswers: RecentAnswer[]): Profile {
        const base: Profile = createTestProfile({ practice: "multiplication" });
        return { ...base, tracks: { "multiplication:easy": { level: 1, points: 0, recentAnswers, answersSinceSafetyNet: 0 } } };
    }

    it("unlocks Médio from the times tables with the same answer rule", () => {
        const result = ProgressionUtils.finishSession(tablesProfile(answers(20, 16)), now, untimed);
        expect(result.offer).toEqual({ kind: "unlock", operation: "multiplication", difficulty: "medium" });
        expect(result.profile.unlockedDifficulties.multiplication).toBe("medium");
        expect(result.profile.unlockedDifficulties.addition).toBe("easy");
    });

    it("trains skill boxes, not facts, with bigger numbers", () => {
        const question: Question = QuestionsUtils.buildForSkill({
            operation: "multiplication",
            difficulty: "medium",
            skill: "carry",
            left: 27,
            right: 3,
            layout: "result",
            isAlwaysTyped: false,
            recentSkillAnswers: {}
        });
        const result = ProgressionUtils.applyRecord(createTestProfile(), record(question));
        expect(result.profile.skillBoxes["multiplication:medium:carry"]).toBe(2);
        expect(result.profile.boxes).toEqual({});
        expect(result.profile.tracks["multiplication:medium"].points).toBe(question.format === "choice" ? 1 : 2);
    });

    it("finds an unlock in any operation of a mix and plays it on its own when accepted", () => {
        const base: Profile = createTestProfile({ practice: "mix" });
        const profile: Profile = { ...base, tracks: { "division:easy": { level: 1, points: 0, recentAnswers: answers(20, 18), answersSinceSafetyNet: 0 } } };
        const result = ProgressionUtils.finishSession(profile, now, untimed);
        expect(result.offer).toEqual({ kind: "unlock", operation: "division", difficulty: "medium" });

        const accepted: Profile = ProgressionUtils.acceptOffer(result.profile, result.offer!);
        expect(accepted.settings.practice).toBe("division");
        expect(accepted.settings.division.difficulty).toBe("medium");
    });
});
