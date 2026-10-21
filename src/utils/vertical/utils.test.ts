import { describe, expect, it } from "vitest";
import { QuestionsUtils, type Question } from "../questions/utils.ts";
import { VerticalUtils, type VerticalEntry } from "./utils.ts";

function verticalQuestion(operation: "addition" | "subtraction", left: number, right: number): Question {
    return QuestionsUtils.buildForSkill({
        isAlwaysTyped: false,
        operation,
        difficulty: "hard",
        skill: "no-carry",
        left,
        right,
        layout: "vertical",
        skillBoxes: {}
    });
}

function typeAll(entry: VerticalEntry, digitsFromUnits: number[]): VerticalEntry {
    return digitsFromUnits.reduce((current, digit) => VerticalUtils.typeDigit(current, digit), entry);
}

describe("VerticalUtils.getColumns", () => {
    it("gives additions a spare cell so the cells never reveal a carry", () => {
        expect(VerticalUtils.getColumnCount(verticalQuestion("addition", 23, 45))).toBe(3);
        expect(VerticalUtils.getColumnCount(verticalQuestion("subtraction", 52, 27))).toBe(2);
    });

    it("marks where the 1 comes in", () => {
        const columns = VerticalUtils.getColumns(verticalQuestion("addition", 368, 457));
        expect(columns.map((column) => column.carryIn)).toEqual([false, true, true, false]);
        expect(columns.map((column) => column.result)).toEqual([5, 2, 8, null]);
    });

    it("works out borrowing through a zero", () => {
        const columns = VerticalUtils.getColumns(verticalQuestion("subtraction", 403, 127));
        expect(columns.map((column) => column.workingTop)).toEqual([13, 9, 3]);
        expect(columns.map((column) => column.borrowsTen)).toEqual([true, true, false]);
        expect(columns.map((column) => column.result)).toEqual([6, 7, 2]);
        expect(VerticalUtils.getHelpMarkColumns(columns, 0)).toEqual([0, 1, 2]);
    });
});

describe("VerticalUtils entry", () => {
    it("is written right to left with the cursor moving by itself", () => {
        const entry: VerticalEntry = typeAll(VerticalUtils.createEntry(3), [2, 6]);
        expect(entry.digits).toEqual([2, 6, null]);
        expect(entry.cursor).toBe(2);
        expect(VerticalUtils.getValue(entry)).toBe(62);
        expect(VerticalUtils.canConfirm(entry)).toBe(true);
    });

    it("erases back towards the units", () => {
        const entry: VerticalEntry = VerticalUtils.erase(typeAll(VerticalUtils.createEntry(3), [2, 6]));
        expect(entry.digits).toEqual([2, null, null]);
        expect(entry.cursor).toBe(1);
    });

    it("does not confirm with a gap between digits", () => {
        const withGap: VerticalEntry = VerticalUtils.typeDigit(VerticalUtils.moveCursor(VerticalUtils.createEntry(3), 2), 1);
        expect(VerticalUtils.canConfirm(withGap)).toBe(false);
        expect(VerticalUtils.canConfirm(VerticalUtils.createEntry(3))).toBe(false);
    });

    it("points at the wrong columns and clears only those", () => {
        const entry: VerticalEntry = typeAll(VerticalUtils.createEntry(3), [2, 5]);
        expect(VerticalUtils.getWrongColumns(VerticalUtils.getValue(entry), 62, 3)).toEqual([1]);

        const cleared: VerticalEntry = VerticalUtils.clearColumns(entry, [1]);
        expect(cleared.digits).toEqual([2, null, null]);
        expect(cleared.cursor).toBe(1);
    });

    it("treats an empty spare cell as nothing", () => {
        expect(VerticalUtils.getWrongColumns(VerticalUtils.getValue(typeAll(VerticalUtils.createEntry(3), [2, 6])), 62, 3)).toEqual([]);
    });
});
