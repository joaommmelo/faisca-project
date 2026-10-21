import { describe, expect, it } from "vitest";
import { FactsUtils } from "./utils.ts";

describe("FactsUtils.getAll", () => {
    it("has 78 unique facts from 1×1 to 12×12", () => {
        const facts = FactsUtils.getAll();
        expect(facts).toHaveLength(78);
        expect(new Set(facts.map((fact) => fact.id)).size).toBe(78);
    });

    it("stores every fact with the smaller factor first", () => {
        for (const fact of FactsUtils.getAll()) {
            expect(fact.smallerFactor).toBeLessThanOrEqual(fact.largerFactor);
            expect(fact.product).toBe(fact.smallerFactor * fact.largerFactor);
        }
    });
});

describe("FactsUtils.getFactId", () => {
    it("is the same regardless of factor order", () => {
        expect(FactsUtils.getFactId(7, 3)).toBe("3x7");
        expect(FactsUtils.getFactId(3, 7)).toBe("3x7");
    });
});

describe("FactsUtils.getForTables", () => {
    it("returns the 12 facts of a single table", () => {
        const facts = FactsUtils.getForTables([7]);
        expect(facts).toHaveLength(12);
        expect(facts.every((fact) => fact.smallerFactor === 7 || fact.largerFactor === 7)).toBe(true);
    });

    it("does not duplicate facts shared by two tables", () => {
        const facts = FactsUtils.getForTables([2, 5]);
        expect(facts).toHaveLength(23);
        expect(facts.filter((fact) => fact.id === "2x5")).toHaveLength(1);
    });

    it("returns nothing when no table is selected", () => {
        expect(FactsUtils.getForTables([])).toEqual([]);
    });
});
