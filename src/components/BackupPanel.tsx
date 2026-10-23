import moment from "moment";
import { useId, useRef, useState, type ChangeEvent } from "react";
import type { Labels } from "../copy/copy.ts";
import { BackupUtils } from "../utils/backup/utils.ts";
import { Messages } from "../utils/messages.ts";
import type { AppData } from "../utils/profiles/utils.ts";
import type { ParsedData } from "../utils/storage/utils.ts";

interface BackupPanelProps {
    data: AppData;
    onRestore: (data: AppData) => void;
}

// Every profile's progress to a file and back, for the adult moving to another device (the site and the Android app
// keep separate progress). In the settings; on the welcome screen it only opens a file, as there is nothing to save.
// Opening a file replaces every profile, so with profiles on the device it asks first.
export function BackupPanel({ data, onRestore }: BackupPanelProps) {
    const questionId: string = useId();
    const labels: Labels = Messages.getLabels();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [pendingBackup, setPendingBackup] = useState<AppData | null>(null);
    const [problem, setProblem] = useState<string | null>(null);
    const hasProfiles: boolean = data.profiles.length > 0;

    const saveBackup = (): void => {
        BackupUtils.saveFile(data, moment()).catch((error: unknown) => console.warn("Faísca: the backup was not saved.", error));
    };

    const chooseFile = (): void => {
        if (fileInputRef.current !== null) {
            fileInputRef.current.click();
        }
    };

    const openBackup = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
        const files: FileList | null = event.target.files;
        if (files === null || files.length === 0) {
            return;
        }
        const read: ParsedData = BackupUtils.read(await files[0].text());
        // The same file can be chosen again after a problem or a cancel.
        event.target.value = "";
        if (read.kind === "unreadable") {
            setProblem(labels.backupUnreadable);
            return;
        }
        if (read.kind === "newer-version") {
            setProblem(labels.backupNewerVersion);
            return;
        }
        setProblem(null);
        if (!hasProfiles) {
            onRestore(BackupUtils.restore(data, read.data));
            return;
        }
        setPendingBackup(read.data);
    };

    return (
        <section className="card stack" aria-label={hasProfiles ? labels.backupTitle : labels.backupWelcomeTitle}>
            <h2 className="section-title">{hasProfiles ? labels.backupTitle : labels.backupWelcomeTitle}</h2>
            <p>{hasProfiles ? labels.backupAbout : labels.backupWelcomeAbout(`${labels.settings} → ${labels.backupTitle}`)}</p>
            {hasProfiles && (
                <button type="button" className="button button--secondary button--block" onClick={saveBackup}>
                    {labels.saveBackup}
                </button>
            )}
            <button type="button" className="button button--secondary button--block" onClick={chooseFile}>
                {labels.openBackup}
            </button>
            <input ref={fileInputRef} type="file" accept={`${BackupUtils.getMimeType()},.json`} hidden onChange={(event) => void openBackup(event)} />
            {problem !== null && (
                <p className="form-error" role="alert">
                    {problem}
                </p>
            )}
            {pendingBackup !== null && (
                <div className="stack" role="alertdialog" aria-labelledby={questionId}>
                    <p id={questionId} className="section-title">
                        {labels.restoreBackupQuestion(pendingBackup.profiles.map((profile) => profile.name))}
                    </p>
                    <p className="hint">{labels.cannotUndo}</p>
                    <div className="actions-row">
                        <button type="button" className="button button--secondary" autoFocus onClick={() => setPendingBackup(null)}>
                            {labels.cancel}
                        </button>
                        <button
                            type="button"
                            className="button button--secondary button--danger"
                            onClick={() => onRestore(BackupUtils.restore(data, pendingBackup))}
                        >
                            {labels.confirmRestore}
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}
