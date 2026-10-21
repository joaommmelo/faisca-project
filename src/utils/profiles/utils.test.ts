import { describe, expect, it } from "vitest";
import { ProfilesUtils, type AppData } from "./utils.ts";

function dataWith(...names: string[]): AppData {
    return names.reduce((data, name) => ProfilesUtils.add(data, name), ProfilesUtils.createEmptyData());
}

describe("ProfilesUtils.add", () => {
    it("creates a profile with the default settings and makes it active", () => {
        const data: AppData = dataWith("Rita");
        const profile = ProfilesUtils.getActive(data);

        expect(profile?.name).toBe("Rita");
        expect(profile?.settings.operation).toBe("multiplication");
        expect(profile?.settings.multiplication).toEqual({
            tables: [2, 5, 10],
            mode: "direct",
            isAlwaysTyped: false,
            clock: { isEnabled: false, direction: "up", reference: "default" }
        });
        expect(profile?.settings.addition).toEqual({
            difficulty: "easy",
            layout: "result",
            clock: { isEnabled: false, direction: "up", reference: "default" }
        });
        expect(profile?.records).toEqual({});
        expect(profile?.unlockedDifficulties).toEqual({ addition: "easy", subtraction: "easy" });
        expect(profile?.wallet).toEqual({ coins: 3, points: 0 });
        expect(profile?.boxes).toEqual({});
        expect(profile?.stats.sessionsCompleted).toBe(0);
    });

    it("tidies spaces in the name", () => {
        expect(ProfilesUtils.getActive(dataWith("  Tomás   Silva "))?.name).toBe("Tomás Silva");
    });

    it("refuses invalid names", () => {
        expect(() => ProfilesUtils.add(ProfilesUtils.createEmptyData(), "   ")).toThrow();
    });
});

describe("ProfilesUtils.getNameProblem", () => {
    const data: AppData = dataWith("Rita");

    it("explains what is wrong with a name", () => {
        expect(ProfilesUtils.getNameProblem(data, " ")).toBe("empty");
        expect(ProfilesUtils.getNameProblem(data, "a".repeat(21))).toBe("too-long");
        expect(ProfilesUtils.getNameProblem(data, "rita")).toBe("taken");
        expect(ProfilesUtils.getNameProblem(data, "Tomás")).toBeNull();
    });
});

describe("ProfilesUtils.select and update", () => {
    it("switches the active profile and keeps progress separate", () => {
        const data: AppData = dataWith("Rita", "Tomás");
        const [rita, tomas] = data.profiles;

        const updated: AppData = ProfilesUtils.update(data, { ...rita, boxes: { "7x8": 3 } });
        const selected: AppData = ProfilesUtils.select(updated, rita.id);

        expect(ProfilesUtils.getActive(selected)?.boxes).toEqual({ "7x8": 3 });
        expect(selected.profiles.find((profile) => profile.id === tomas.id)?.boxes).toEqual({});
    });

    it("refuses unknown profiles", () => {
        expect(() => ProfilesUtils.select(dataWith("Rita"), "nope")).toThrow();
    });
});

describe("ProfilesUtils.updateActive", () => {
    it("changes only the active profile", () => {
        const data: AppData = dataWith("Rita", "Tomás");
        const updated: AppData = ProfilesUtils.updateActive(data, (profile) => ({ ...profile, boxes: { "2x2": 2 } }));
        expect(updated.profiles[0].boxes).toEqual({});
        expect(updated.profiles[1].boxes).toEqual({ "2x2": 2 });
    });

    it("refuses to run without an active profile", () => {
        expect(() => ProfilesUtils.updateActive(ProfilesUtils.createEmptyData(), (profile) => profile)).toThrow();
    });
});

describe("ProfilesUtils.toggleTable", () => {
    it("adds a table keeping the list in order", () => {
        expect(ProfilesUtils.toggleTable([2, 10], 5)).toEqual([2, 5, 10]);
    });

    it("removes a selected table", () => {
        expect(ProfilesUtils.toggleTable([2, 5, 10], 5)).toEqual([2, 10]);
    });
});

describe("ProfilesUtils.canPlay", () => {
    it("needs a table for multiplication and division only", () => {
        const settings = ProfilesUtils.createDefaultSettings();
        expect(ProfilesUtils.canPlay({ ...settings, operation: "division", division: { ...settings.division, tables: [] } })).toBe(false);
        expect(ProfilesUtils.canPlay({ ...settings, operation: "multiplication" })).toBe(true);
        expect(ProfilesUtils.canPlay({ ...settings, operation: "subtraction" })).toBe(true);
    });
});

describe("ProfilesUtils.remove", () => {
    it("activates another profile when the active one is removed", () => {
        const data: AppData = dataWith("Rita", "Tomás");
        const removed: AppData = ProfilesUtils.remove(data, data.profiles[1].id);
        expect(removed.profiles).toHaveLength(1);
        expect(removed.activeProfileId).toBe(data.profiles[0].id);
    });

    it("leaves no active profile when the last one is removed", () => {
        const data: AppData = dataWith("Rita");
        expect(ProfilesUtils.remove(data, data.profiles[0].id).activeProfileId).toBeNull();
    });
});
