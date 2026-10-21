import moment from "moment";
import { describe, expect, it } from "vitest";
import { createTestProfile } from "../../test/profiles.ts";
import type { Difficulty } from "../difficulties/utils.ts";
import type { RecentAnswer, TrackProgress } from "../levels/utils.ts";
import type { Profile } from "../profiles/utils.ts";
import { QuestionsUtils, type AnswerFormat, type Question } from "../questions/utils.ts";
import type { AnswerRecord } from "../session/utils.ts";
import { ProgressionUtils } from "./utils.ts";

const now: moment.Moment = moment("2026-10-21T18:00:00");

function additionQuestion(format: AnswerFormat = "vertical", left: number = 37): Question {
    const question: Question = QuestionsUtils.buildArithmetic({ operation: "addition", difficulty: "easy", skill: "no-carry", left: 3, right: 4, layout: "vertical", skillBoxes: {} });
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
        settings: { ...base.settings, operation: "addition", addition: { ...base.settings.addition, difficulty } },
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

    it("sends a missed multiplication fact back to box 1, as in v1", () => {
        const question: Question = QuestionsUtils.buildMultiplication({ id: "7x8", smallerFactor: 7, largerFactor: 8, product: 56 }, { mode: "direct", boxes: { "7x8": 4 } });
        const result = ProgressionUtils.applyRecord(createTestProfile({}, { boxes: { "7x8": 4 } }), record(question, { givenAnswers: [54, 55], isCorrect: false }));
        expect(result.profile.boxes["7x8"]).toBe(1);
    });

    it("trains the shared multiplication box from a division", () => {
        const division: Question = QuestionsUtils.buildDivision({ id: "7x8", smallerFactor: 7, largerFactor: 8, product: 56 }, { boxes: {} });
        const result = ProgressionUtils.applyRecord(createTestProfile(), record(division));
        expect(result.profile.boxes["7x8"]).toBe(2);
        expect(result.profile.tracks.division.points).toBe(division.format === "choice" ? 1 : 2);
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

describe("ProgressionUtils.getSafetyNetDifficulty", () => {
    it("proposes the previous difficulty after fewer than 5 right in the last 10", () => {
        const profile: Profile = profileAt("medium", { recentAnswers: answers(10, 4), answersSinceSafetyNet: 10 });
        expect(ProgressionUtils.getSafetyNetDifficulty(profile, "addition")).toBe("easy");
    });

    it("stays quiet with 5 right, with too few answers, or right after proposing", () => {
        expect(ProgressionUtils.getSafetyNetDifficulty(profileAt("medium", { recentAnswers: answers(10, 5), answersSinceSafetyNet: 10 }), "addition")).toBeNull();
        expect(ProgressionUtils.getSafetyNetDifficulty(profileAt("medium", { recentAnswers: answers(9, 0), answersSinceSafetyNet: 9 }), "addition")).toBeNull();
        expect(ProgressionUtils.getSafetyNetDifficulty(profileAt("medium", { recentAnswers: answers(10, 0), answersSinceSafetyNet: 3 }), "addition")).toBeNull();
    });

    it("has nothing below Fácil", () => {
        expect(ProgressionUtils.getSafetyNetDifficulty(profileAt("easy", { recentAnswers: answers(10, 0), answersSinceSafetyNet: 10 }), "addition")).toBeNull();
    });
});

describe("ProgressionUtils.finishSession", () => {
    it("unlocks right away and lets the child decide when to play it", () => {
        const result = ProgressionUtils.finishSession(profileAt("easy", { recentAnswers: answers(20, 18) }), now);
        expect(result.offer).toEqual({ kind: "unlock", difficulty: "medium" });
        expect(result.profile.unlockedDifficulties.addition).toBe("medium");
        expect(result.profile.settings.addition.difficulty).toBe("easy");
        expect(result.profile.stats.sessionsCompleted).toBe(1);

        expect(ProgressionUtils.acceptOffer(result.profile, result.offer!).settings.addition.difficulty).toBe("medium");
    });

    it("keeps level and coins when stepping back, and does not repeat the proposal at once", () => {
        const profile: Profile = { ...profileAt("medium", { level: 3, recentAnswers: answers(10, 2), answersSinceSafetyNet: 12 }), wallet: { coins: 4, points: 6 } };
        const result = ProgressionUtils.finishSession(profile, now);
        expect(result.offer).toEqual({ kind: "safety-net", difficulty: "easy" });
        expect(result.profile.tracks["addition:medium"].answersSinceSafetyNet).toBe(0);
        expect(ProgressionUtils.getSafetyNetDifficulty(result.profile, "addition")).toBeNull();

        const steppedBack: Profile = ProgressionUtils.acceptOffer(result.profile, result.offer!);
        expect(steppedBack.settings.addition.difficulty).toBe("easy");
        expect(steppedBack.tracks["addition:medium"].level).toBe(3);
        expect(steppedBack.wallet).toEqual({ coins: 4, points: 6 });
        expect(steppedBack.unlockedDifficulties.addition).toBe("medium");
    });

    it("offers nothing in multiplication", () => {
        expect(ProgressionUtils.finishSession(createTestProfile({ operation: "multiplication" }), now).offer).toBeNull();
    });
});
