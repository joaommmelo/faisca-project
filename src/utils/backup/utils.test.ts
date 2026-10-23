import moment from "moment";
import { describe, expect, it } from "vitest";
import { ProfilesUtils, type AppData } from "../profiles/utils.ts";
import { BackupUtils } from "./utils.ts";

const twoProfiles: AppData = ProfilesUtils.add(ProfilesUtils.add({ ...ProfilesUtils.createEmptyData(), locale: "en" }, "Rita"), "Tiago");

describe("BackupUtils.getFileName", () => {
    it("names the file after the day it was saved", () => {
        expect(BackupUtils.getFileName(moment("2026-10-23 18:40"))).toBe("faisca-2026-10-23.json");
    });
});

describe("BackupUtils.read", () => {
    it("reads back what it saved", () => {
        expect(BackupUtils.read(BackupUtils.toText(twoProfiles))).toEqual({ kind: "data", data: twoProfiles });
    });

    it("migrates a file saved by an older version", () => {
        const versionOne = {
            version: 1,
            profiles: [
                {
                    id: "rita-id",
                    name: "Rita",
                    settings: { tables: [3, 7], mode: "mixed", isTimerEnabled: false },
                    boxes: { "7x8": 4 },
                    stats: { sessionsCompleted: 12, practiceDays: 5, currentStreak: 2, lastPracticeDay: "2026-10-20" }
                }
            ],
            activeProfileId: "rita-id"
        };
        const read = BackupUtils.read(JSON.stringify(versionOne));

        expect(read.kind).toBe("data");
        if (read.kind === "data") {
            expect(read.data.version).toBe(ProfilesUtils.getDataVersion());
            expect(read.data.profiles[0]).toMatchObject({ id: "rita-id", name: "Rita", boxes: { "7x8": 4 } });
        }
    });

    it("refuses a file from a newer version", () => {
        expect(BackupUtils.read(JSON.stringify({ ...twoProfiles, version: 99 }))).toEqual({ kind: "newer-version" });
    });

    it("refuses a file that is not Faísca's", () => {
        expect(BackupUtils.read("{not json")).toEqual({ kind: "unreadable" });
        expect(BackupUtils.read(JSON.stringify({ name: "package", version: "2.0.0" }))).toEqual({ kind: "unreadable" });
        expect(BackupUtils.read(JSON.stringify({ version: 10, profiles: [{ id: "rita-id" }] }))).toEqual({ kind: "unreadable" });
    });

    it("refuses a file with no profiles", () => {
        expect(BackupUtils.read(BackupUtils.toText(ProfilesUtils.createEmptyData()))).toEqual({ kind: "unreadable" });
    });
});

describe("BackupUtils.restore", () => {
    it("replaces every profile on the device, keeping the device's language", () => {
        const device: AppData = ProfilesUtils.add({ ...ProfilesUtils.createEmptyData(), locale: "pt" }, "Ana");
        const restored: AppData = BackupUtils.restore(device, twoProfiles);

        expect(restored.profiles).toEqual(twoProfiles.profiles);
        expect(restored.activeProfileId).toBe(twoProfiles.activeProfileId);
        expect(restored.locale).toBe("pt");
    });

    it("starts with the first profile when the file had nobody playing", () => {
        const restored: AppData = BackupUtils.restore(ProfilesUtils.createEmptyData(), { ...twoProfiles, activeProfileId: null });
        expect(restored.activeProfileId).toBe(twoProfiles.profiles[0].id);
    });
});
