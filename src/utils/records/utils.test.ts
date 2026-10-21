import { describe, expect, it } from "vitest";
import { Messages } from "../messages.ts";
import { ProfilesUtils, type ProfileSettings } from "../profiles/utils.ts";
import { RecordsUtils, type RecordCategory, type Records } from "./utils.ts";

const settings: ProfileSettings = ProfilesUtils.createDefaultSettings();

describe("RecordsUtils.getCategory", () => {
    it("separates sessions played differently", () => {
        const verticalEasy = RecordsUtils.getCategory({ ...settings, practice: "addition", addition: { ...settings.addition, layout: "vertical" } });
        const resultEasy = RecordsUtils.getCategory({ ...settings, practice: "addition" });
        const easyTables = RecordsUtils.getCategory({ ...settings, multiplication: { ...settings.multiplication, tables: [10, 2, 5] } });
        const hardTables = RecordsUtils.getCategory({ ...settings, multiplication: { ...settings.multiplication, tables: [7, 8, 9] } });
        const typed = RecordsUtils.getCategory({ ...settings, multiplication: { ...settings.multiplication, tables: [2, 5, 10], isAlwaysTyped: true } });

        const ids: string[] = [verticalEasy, resultEasy, easyTables, hardTables, typed].map((category) => RecordsUtils.getCategoryId(category));
        expect(new Set(ids).size).toBe(5);
        expect(easyTables.kind === "operation" ? easyTables.tables : null).toEqual([2, 5, 10]);
    });
});

describe("RecordsUtils.registerTime", () => {
    const category: RecordCategory = RecordsUtils.getCategory(settings);

    it("keeps the fastest time only", () => {
        const first = RecordsUtils.registerTime({}, category, 90_000);
        const slower = RecordsUtils.registerTime(first.records, category, 95_000);
        const faster = RecordsUtils.registerTime(first.records, category, 70_000);

        expect(first.isNewRecord).toBe(true);
        expect(slower).toEqual({ records: first.records, isNewRecord: false, previousMilliseconds: 90_000 });
        expect(faster.isNewRecord).toBe(true);
        expect(RecordsUtils.getBest(faster.records, category)).toBe(70_000);
    });

    it("finds no record in an empty category", () => {
        const records: Records = {};
        expect(RecordsUtils.getBest(records, category)).toBeNull();
    });
});

describe("RecordsUtils.isPerfect", () => {
    it("needs every question right at the first try without help", () => {
        expect(RecordsUtils.isPerfect({ correctAtFirstTry: 10, helpedCount: 0, firstTryCount: 10, questionsToReinforce: [] })).toBe(true);
        expect(RecordsUtils.isPerfect({ correctAtFirstTry: 9, helpedCount: 1, firstTryCount: 10, questionsToReinforce: [] })).toBe(false);
    });
});

describe("RecordsUtils with bigger numbers and mixes", () => {
    it("keeps Médio multiplication apart from the tables, without the tables", () => {
        const medium = RecordsUtils.getCategory({ ...settings, multiplication: { ...settings.multiplication, difficulty: "medium" } });
        const tables = RecordsUtils.getCategory(settings);
        expect(RecordsUtils.getCategoryId(medium)).not.toBe(RecordsUtils.getCategoryId(tables));
        expect(medium.kind === "operation" ? medium.tables : "mix").toBeNull();
    });

    it("compares a mix only with mixes of the same operations played the same way", () => {
        const allFour = RecordsUtils.getCategory({ ...settings, practice: "mix" });
        const threeOnly = RecordsUtils.getCategory({
            ...settings,
            practice: "mix",
            mix: { ...settings.mix, operations: ["addition", "subtraction", "division"] }
        });
        const harderAddition = RecordsUtils.getCategory({ ...settings, practice: "mix", addition: { ...settings.addition, difficulty: "medium" } });
        const ids: Set<string> = new Set([allFour, threeOnly, harderAddition].map((category) => RecordsUtils.getCategoryId(category)));
        expect(ids.size).toBe(3);
        expect(Messages.getRecordCategoryName(threeOnly)).toBe("Misturado · Soma Fácil, Subtração Fácil, Divisão Fácil");
    });
});
