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
        expect(profile?.settings).toEqual({ tables: [2, 5, 10], mode: "direct", isTimerEnabled: false });
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
