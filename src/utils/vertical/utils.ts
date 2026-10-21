import { ArithmeticUtils } from "../arithmetic/utils.ts";
import type { Question } from "../questions/utils.ts";

// One column of a written sum or subtraction, units first.
export interface VerticalColumn {
    top: number | null;
    bottom: number | null;
    // The digit to write; null in the spare cell on the left when the result does not reach it.
    result: number | null;
    // Addition: a 1 comes in from the column on the right / goes out to the column on the left.
    carryIn: boolean;
    carryOut: boolean;
    // Subtraction: the column takes 10 from the column on its left.
    borrowsTen: boolean;
    // Subtraction: the top digit after lending to the right and taking 10 from the left (3 → 13, 0 → 9).
    // Null when the column keeps its digit.
    workingTop: number | null;
}

// What the child has written so far, units first.
export interface VerticalEntry {
    digits: (number | null)[];
    cursor: number;
    // The child's own "e vai 1" and borrow marks. They help the child and are never checked.
    marks: boolean[];
}

export class VerticalUtils {
    // Additions get a spare cell on the left, so the number of cells never gives away a carry.
    public static getColumnCount(question: Question): number {
        const leftLength: number = ArithmeticUtils.getDigits(question.left).length;
        if (question.operation === "subtraction") {
            return leftLength;
        }
        return Math.max(leftLength, ArithmeticUtils.getDigits(question.right).length) + 1;
    }

    public static getColumns(question: Question): VerticalColumn[] {
        const carryColumns: number[] = question.operation === "addition" ? ArithmeticUtils.getCarryColumns(question.left, question.right) : [];
        const borrowColumns: number[] = question.operation === "subtraction" ? ArithmeticUtils.getBorrowColumns(question.left, question.right) : [];
        const getDigitOrNull = (value: number, column: number): number | null =>
            column < ArithmeticUtils.getDigits(value).length ? ArithmeticUtils.getDigit(value, column) : null;

        return Array.from({ length: this.getColumnCount(question) }, (_, column): VerticalColumn => {
            const lent: number = borrowColumns.includes(column - 1) ? 1 : 0;
            const taken: number = borrowColumns.includes(column) ? 10 : 0;
            return {
                top: getDigitOrNull(question.left, column),
                bottom: getDigitOrNull(question.right, column),
                result: getDigitOrNull(question.answer, column),
                carryIn: carryColumns.includes(column - 1),
                carryOut: carryColumns.includes(column),
                borrowsTen: taken > 0,
                workingTop: lent === 0 && taken === 0 ? null : ArithmeticUtils.getDigit(question.left, column) - lent + taken
            };
        });
    }

    // The marks that explain a column: its own carry or borrow, plus every column a borrow passes through (403 − 127).
    public static getHelpMarkColumns(columns: VerticalColumn[], column: number): number[] {
        const marked: number[] = [column];
        if (!columns[column].borrowsTen) {
            return marked;
        }
        for (let lender = column + 1; lender < columns.length; lender++) {
            marked.push(lender);
            if (columns[lender].top !== 0) {
                break;
            }
        }
        return marked;
    }

    public static createEntry(columnCount: number): VerticalEntry {
        return { digits: Array.from({ length: columnCount }, () => null), cursor: 0, marks: Array.from({ length: columnCount }, () => false) };
    }

    // Writes in the cursor's cell and moves left, like writing a column sum by hand.
    public static typeDigit(entry: VerticalEntry, digit: number): VerticalEntry {
        const digits: (number | null)[] = entry.digits.map((current, column) => (column === entry.cursor ? digit : current));
        return { ...entry, digits, cursor: Math.min(entry.cursor + 1, entry.digits.length - 1) };
    }

    // Clears the cursor's cell, or steps back right and clears that one when the cursor's cell is empty.
    public static erase(entry: VerticalEntry): VerticalEntry {
        const column: number = entry.digits[entry.cursor] === null ? Math.max(entry.cursor - 1, 0) : entry.cursor;
        return { ...entry, digits: entry.digits.map((current, index) => (index === column ? null : current)), cursor: column };
    }

    public static moveCursor(entry: VerticalEntry, column: number): VerticalEntry {
        if (column < 0 || column >= entry.digits.length) {
            throw new Error(`No column ${column}.`);
        }
        return { ...entry, cursor: column };
    }

    public static toggleMark(entry: VerticalEntry, column: number): VerticalEntry {
        return { ...entry, marks: entry.marks.map((mark, index) => (index === column ? !mark : mark)) };
    }

    // Written from the units up with no gaps; the cells on the left may stay empty.
    public static canConfirm(entry: VerticalEntry): boolean {
        const filledCount: number = entry.digits.findIndex((digit) => digit === null);
        const writtenLength: number = filledCount === -1 ? entry.digits.length : filledCount;
        return writtenLength > 0 && entry.digits.slice(writtenLength).every((digit) => digit === null);
    }

    public static getValue(entry: VerticalEntry): number {
        return entry.digits.reduce<number>((value, digit, column) => value + (digit ?? 0) * 10 ** column, 0);
    }

    // Compares column by column; an empty cell on the left reads as 0, so only real differences are pointed out.
    public static getWrongColumns(givenAnswer: number, answer: number, columnCount: number): number[] {
        return Array.from({ length: columnCount }, (_, column) => column).filter(
            (column) => ArithmeticUtils.getDigit(givenAnswer, column) !== ArithmeticUtils.getDigit(answer, column)
        );
    }

    // After the first miss: the wrong digits go and the cursor waits at the rightmost of them.
    public static clearColumns(entry: VerticalEntry, columns: number[]): VerticalEntry {
        if (columns.length === 0) {
            return entry;
        }
        return {
            ...entry,
            digits: entry.digits.map((digit, column) => (columns.includes(column) ? null : digit)),
            cursor: Math.min(...columns)
        };
    }

    public static revealDigit(entry: VerticalEntry, column: number, digit: number): VerticalEntry {
        return this.typeDigit(this.moveCursor(entry, column), digit);
    }

    public static fillAnswer(entry: VerticalEntry, answer: number): VerticalEntry {
        const answerLength: number = ArithmeticUtils.getDigits(answer).length;
        return {
            ...entry,
            digits: entry.digits.map((_, column) => (column < answerLength ? ArithmeticUtils.getDigit(answer, column) : null))
        };
    }
}
