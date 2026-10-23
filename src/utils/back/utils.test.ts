import { describe, expect, it } from "vitest";
import { BackUtils, type BackEntry, type BackLayer } from "./utils.ts";

const createEntry = (layer: BackLayer): BackEntry => ({ layer, onBack: () => undefined });

describe("BackUtils.getAnswering", () => {
    it("leaves the app when nothing answers, as on the home screen", () => {
        expect(BackUtils.getAnswering([])).toBeNull();
    });

    it("lets a game ask to leave before the app goes home", () => {
        const app: BackEntry = createEntry("app");
        const screen: BackEntry = createEntry("screen");
        expect(BackUtils.getAnswering([app, screen])).toBe(screen);
        // A screen opens before the app hears of the new view, so the order it came in must not matter.
        expect(BackUtils.getAnswering([screen, app])).toBe(screen);
    });

    it("closes an open sheet first", () => {
        const sheet: BackEntry = createEntry("sheet");
        expect(BackUtils.getAnswering([createEntry("app"), sheet, createEntry("screen")])).toBe(sheet);
    });

    it("closes the last sheet to open when there are two", () => {
        const last: BackEntry = createEntry("sheet");
        expect(BackUtils.getAnswering([createEntry("sheet"), last])).toBe(last);
    });
});
