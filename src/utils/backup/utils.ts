import { Capacitor } from "@capacitor/core";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import moment from "moment";
import { ProfilesUtils, type AppData, type Profile } from "../profiles/utils.ts";
import { StorageUtils, type ParsedData } from "../storage/utils.ts";

// A backup file holds every profile on the device, in the same shape localStorage keeps, so an older file is migrated
// like older saved data.
export class BackupUtils {
    public static getFileName(now: moment.Moment): string {
        return `faisca-${now.format("YYYY-MM-DD")}.json`;
    }

    public static getMimeType(): string {
        return "application/json";
    }

    public static toText(data: AppData): string {
        return JSON.stringify(data, null, 2);
    }

    // A file with no profiles has nothing to bring back.
    public static read(raw: string): ParsedData {
        const parsed: ParsedData = StorageUtils.parse(raw);
        if (parsed.kind === "data" && parsed.data.profiles.length === 0) {
            return { kind: "unreadable" };
        }
        return parsed;
    }

    // The file's profiles replace this device's, with whoever was playing there. The language stays the device's.
    public static restore(current: AppData, backup: AppData): AppData {
        const activeProfile: Profile | null = ProfilesUtils.getActive(backup);
        const activeProfileId: string = activeProfile === null ? backup.profiles[0].id : activeProfile.id;
        return { ...backup, activeProfileId, locale: current.locale };
    }

    // The Android app's WebView cannot download, so there the file is written to the app's cache and leaves through
    // Android's share sheet (Drive, email, …). Cancelling the share sheet rejects.
    public static async saveFile(data: AppData, now: moment.Moment): Promise<void> {
        const fileName: string = this.getFileName(now);
        const text: string = this.toText(data);

        if (Capacitor.isNativePlatform()) {
            const written = await Filesystem.writeFile({ path: fileName, data: text, directory: Directory.Cache, encoding: Encoding.UTF8 });
            await Share.share({ title: fileName, files: [written.uri] });
            return;
        }

        const link: HTMLAnchorElement = document.createElement("a");
        link.href = `data:${this.getMimeType()};charset=utf-8,${encodeURIComponent(text)}`;
        link.download = fileName;
        link.click();
    }
}
