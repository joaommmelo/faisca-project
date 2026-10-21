import type { ReactNode } from "react";
import { ClockField } from "../components/ClockField.tsx";
import { CoinButton } from "../components/CoinButton.tsx";
import { Logo } from "../components/Logo.tsx";
import { MascotMessage } from "../components/Mascot.tsx";
import { OperationPicker } from "../components/OperationPicker.tsx";
import { ProfilesPanel } from "../components/ProfilesPanel.tsx";
import { SegmentedField } from "../components/SegmentedField.tsx";
import { SwitchField } from "../components/SwitchField.tsx";
import { TablesPicker } from "../components/TablesPicker.tsx";
import type { ClockSettings } from "../utils/clock/utils.ts";
import { DifficultiesUtils, type Difficulty } from "../utils/difficulties/utils.ts";
import { LevelsUtils } from "../utils/levels/utils.ts";
import { Messages } from "../utils/messages.ts";
import { OperationsUtils, type Operation, type TablesOperation } from "../utils/operations/utils.ts";
import { ProfilesUtils, type AppData, type Profile, type ProfileSettings } from "../utils/profiles/utils.ts";
import { QuestionsUtils, type AnswerLayout, type PracticeMode } from "../utils/questions/utils.ts";
import { RecordsUtils } from "../utils/records/utils.ts";
import type { StorageStatus } from "../utils/storage/utils.ts";

interface HomeScreenProps {
    data: AppData;
    profile: Profile;
    storageStatus: StorageStatus;
    onSelectProfile: (profileId: string) => void;
    onCreateProfile: (name: string) => void;
    onDeleteProfile: (profileId: string) => void;
    onSettingsChange: (settings: ProfileSettings) => void;
    onPlay: () => void;
    onShowProgress: () => void;
}

// What matters comes first on a phone: pick an operation, adjust it if wanted, play. The coins sit in the corner
// and open the piggy bank; who is playing rarely changes, so it waits at the bottom.
export function HomeScreen({
    data,
    profile,
    storageStatus,
    onSelectProfile,
    onCreateProfile,
    onDeleteProfile,
    onSettingsChange,
    onPlay,
    onShowProgress
}: HomeScreenProps) {
    const { settings } = profile;
    const canPlay: boolean = ProfilesUtils.canPlay(settings);

    const summaries: Record<Operation, string> = (() => {
        const getSummary = (operation: Operation): string => {
            const difficulty: Difficulty | null = OperationsUtils.isArithmetic(operation) ? settings[operation].difficulty : null;
            const level: number = LevelsUtils.getTrack(profile.tracks, LevelsUtils.getTrackId(operation, difficulty)).level;
            return Messages.getOperationSummary(difficulty, level);
        };
        return {
            addition: getSummary("addition"),
            subtraction: getSummary("subtraction"),
            multiplication: getSummary("multiplication"),
            division: getSummary("division")
        };
    })();

    return (
        <main className="screen screen--home">
            <header className="home-header">
                <Logo />
                <CoinButton wallet={profile.wallet} />
            </header>

            <MascotMessage mood="happy" size={80}>
                {Messages.getGreeting(profile.name)}
            </MascotMessage>

            {storageStatus !== "saved" && (
                <p className="notice" role="status">
                    {Messages.getStorageWarning(storageStatus)}
                </p>
            )}

            <OperationPicker operation={settings.operation} summaries={summaries} onChange={(operation) => onSettingsChange({ ...settings, operation })} />

            <OperationSettings profile={profile} onSettingsChange={onSettingsChange} />

            <div className="play-bar">
                <p className="hint" role="status">
                    {canPlay ? "" : "Escolhe pelo menos uma tabuada."}
                </p>
                <button type="button" className="button button--play" disabled={!canPlay} onClick={onPlay}>
                    Jogar
                </button>
            </div>

            <button type="button" className="button button--secondary button--block" onClick={onShowProgress}>
                Ver progresso
            </button>

            <ProfilesPanel
                data={data}
                profile={profile}
                onSelectProfile={onSelectProfile}
                onCreateProfile={onCreateProfile}
                onDeleteProfile={onDeleteProfile}
            />
        </main>
    );
}

interface OperationSettingsProps {
    profile: Profile;
    onSettingsChange: (settings: ProfileSettings) => void;
}

// The choices that belong to the selected operation, its clock included.
function OperationSettings({ profile, onSettingsChange }: OperationSettingsProps) {
    const { settings } = profile;
    const operation: Operation = settings.operation;
    const recordMilliseconds: number | null = RecordsUtils.getBest(profile.records, RecordsUtils.getCategory(settings));
    const changeClock = (clock: ClockSettings): void => onSettingsChange({ ...settings, [operation]: { ...settings[operation], clock } });
    const clockField = <ClockField clock={settings[operation].clock} recordMilliseconds={recordMilliseconds} onChange={changeClock} />;

    if (!OperationsUtils.isArithmetic(operation)) {
        return <TablesSettingsCard operation={operation} settings={settings} clockField={clockField} onSettingsChange={onSettingsChange} />;
    }

    const arithmeticSettings = settings[operation];
    const layoutExamples: Record<AnswerLayout, string> = {
        result: operation === "addition" ? "37 + 25 = ?" : "52 − 27 = ?",
        vertical: "Uma por baixo da outra"
    };

    return (
        <section className={`card stack card--${operation}`}>
            <SegmentedField<Difficulty>
                legend="Que dificuldade?"
                value={arithmeticSettings.difficulty}
                options={DifficultiesUtils.getValidDifficulties().map((difficulty) => ({
                    value: difficulty,
                    label: Messages.getDifficultyName(difficulty),
                    detail: Messages.getDifficultyRange(difficulty),
                    isLocked: !DifficultiesUtils.isUnlocked(difficulty, profile.unlockedDifficulties[operation])
                }))}
                onChange={(difficulty) => onSettingsChange({ ...settings, [operation]: { ...arithmeticSettings, difficulty } })}
            />
            <SegmentedField<AnswerLayout>
                legend="Como queres fazer as contas?"
                value={arithmeticSettings.layout}
                options={QuestionsUtils.getValidLayouts().map((layout) => ({
                    value: layout,
                    label: Messages.getLayoutLabel(layout),
                    detail: layoutExamples[layout]
                }))}
                onChange={(layout) => onSettingsChange({ ...settings, [operation]: { ...arithmeticSettings, layout } })}
            />
            <div className="card-divider" />
            {clockField}
        </section>
    );
}

interface TablesSettingsCardProps {
    operation: TablesOperation;
    settings: ProfileSettings;
    clockField: ReactNode;
    onSettingsChange: (settings: ProfileSettings) => void;
}

function TablesSettingsCard({ operation, settings, clockField, onSettingsChange }: TablesSettingsCardProps) {
    const tablesSettings = settings[operation];

    return (
        <section className={`card stack card--${operation}`}>
            <TablesPicker
                selectedTables={tablesSettings.tables}
                onChange={(tables) => onSettingsChange({ ...settings, [operation]: { ...tablesSettings, tables } })}
            />
            {operation === "multiplication" && (
                <SegmentedField<PracticeMode>
                    legend="Que contas queres?"
                    value={settings.multiplication.mode}
                    options={QuestionsUtils.getValidModes().map((mode) => ({
                        value: mode,
                        label: Messages.getModeLabel(mode),
                        detail: Messages.getModeExample(mode)
                    }))}
                    onChange={(mode) => onSettingsChange({ ...settings, multiplication: { ...settings.multiplication, mode } })}
                />
            )}
            <SwitchField
                label="Escrever sempre a resposta"
                description="Sem escolha múltipla, mesmo nas contas novas."
                isOn={tablesSettings.isAlwaysTyped}
                onChange={(isAlwaysTyped) => onSettingsChange({ ...settings, [operation]: { ...tablesSettings, isAlwaysTyped } })}
            />
            <div className="card-divider" />
            {clockField}
        </section>
    );
}
