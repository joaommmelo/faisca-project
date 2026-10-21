import { useId, useState } from "react";
import { PlusIcon } from "../components/Icons.tsx";
import { Logo } from "../components/Logo.tsx";
import { MascotMessage } from "../components/Mascot.tsx";
import { OperationPicker } from "../components/OperationPicker.tsx";
import { PiggyBank } from "../components/PiggyBank.tsx";
import { ProfileForm } from "../components/ProfileForm.tsx";
import { SegmentedField } from "../components/SegmentedField.tsx";
import { SwitchField } from "../components/SwitchField.tsx";
import { TablesPicker } from "../components/TablesPicker.tsx";
import { DifficultiesUtils, type Difficulty } from "../utils/difficulties/utils.ts";
import { LevelsUtils } from "../utils/levels/utils.ts";
import { Messages } from "../utils/messages.ts";
import { OperationsUtils, type ArithmeticOperation, type Operation } from "../utils/operations/utils.ts";
import { ProfilesUtils, type AppData, type Profile, type ProfileSettings } from "../utils/profiles/utils.ts";
import { QuestionsUtils, type AnswerLayout, type PracticeMode } from "../utils/questions/utils.ts";
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
    const deleteTitleId: string = useId();
    const [isAddingProfile, setIsAddingProfile] = useState<boolean>(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false);
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
        <main className="screen">
            <Logo />
            <MascotMessage mood="happy" size={96}>
                {Messages.getGreeting(profile.name)}
            </MascotMessage>

            {storageStatus !== "saved" && (
                <p className="notice" role="status">
                    {Messages.getStorageWarning(storageStatus)}
                </p>
            )}

            <section className="card">
                <h2 className="section-title">Quem vai jogar?</h2>
                <div className="profiles">
                    {data.profiles.map((candidate) => (
                        <button
                            key={candidate.id}
                            type="button"
                            className="chip"
                            aria-pressed={candidate.id === profile.id}
                            onClick={() => onSelectProfile(candidate.id)}
                        >
                            {candidate.name}
                        </button>
                    ))}
                    <button type="button" className="chip chip--add" aria-expanded={isAddingProfile} onClick={() => setIsAddingProfile(true)}>
                        <PlusIcon />
                        Novo
                    </button>
                </div>
                {isAddingProfile && (
                    <div className="card-section">
                        <ProfileForm
                            data={data}
                            title="Nome do novo perfil"
                            submitLabel="Criar perfil"
                            onSubmit={onCreateProfile}
                            onCancel={() => setIsAddingProfile(false)}
                        />
                    </div>
                )}
            </section>

            <PiggyBank wallet={profile.wallet} />

            <section className="card">
                <OperationPicker operation={settings.operation} summaries={summaries} onChange={(operation) => onSettingsChange({ ...settings, operation })} />
            </section>

            <OperationSettings profile={profile} onSettingsChange={onSettingsChange} />

            <section className="card">
                <SwitchField
                    label="Cronómetro"
                    description="Mostra o tempo de cada jogo. Sem pressa!"
                    isOn={settings.isTimerEnabled}
                    onChange={(isTimerEnabled) => onSettingsChange({ ...settings, isTimerEnabled })}
                />
            </section>

            <div className="play-bar">
                <p className="hint" role="status">
                    {canPlay ? "" : "Escolhe pelo menos uma tabuada."}
                </p>
                <button type="button" className={`button button--play button--play-${settings.operation}`} disabled={!canPlay} onClick={onPlay}>
                    Jogar
                </button>
            </div>

            <button type="button" className="button button--secondary button--block" onClick={onShowProgress}>
                Ver progresso
            </button>

            {isConfirmingDelete ? (
                <section className="card stack" role="alertdialog" aria-labelledby={deleteTitleId}>
                    <p id={deleteTitleId} className="section-title">
                        Apagar o perfil «{profile.name}» e todo o progresso?
                    </p>
                    <p className="hint">Não dá para desfazer.</p>
                    <div className="actions-row">
                        <button type="button" className="button button--secondary" autoFocus onClick={() => setIsConfirmingDelete(false)}>
                            Cancelar
                        </button>
                        <button type="button" className="button button--secondary button--danger" onClick={() => onDeleteProfile(profile.id)}>
                            Sim, apagar
                        </button>
                    </div>
                </section>
            ) : (
                <button type="button" className="button button--ghost button--danger" onClick={() => setIsConfirmingDelete(true)}>
                    Apagar perfil «{profile.name}»
                </button>
            )}
        </main>
    );
}

interface OperationSettingsProps {
    profile: Profile;
    onSettingsChange: (settings: ProfileSettings) => void;
}

// The choices that belong to the selected operation: difficulty and layout, or the times tables.
function OperationSettings({ profile, onSettingsChange }: OperationSettingsProps) {
    const { settings } = profile;
    const operation: Operation = settings.operation;

    if (operation === "multiplication") {
        return (
            <section className={`card card--${operation}`}>
                <TablesPicker
                    selectedTables={settings.multiplication.tables}
                    onChange={(tables) => onSettingsChange({ ...settings, multiplication: { ...settings.multiplication, tables } })}
                />
                <div className="card-section">
                    <SegmentedField<PracticeMode>
                        legend="Que contas queres?"
                        value={settings.multiplication.mode}
                        options={QuestionsUtils.getValidModes().map((mode) => ({ value: mode, label: Messages.getModeLabel(mode), detail: Messages.getModeExample(mode) }))}
                        onChange={(mode) => onSettingsChange({ ...settings, multiplication: { ...settings.multiplication, mode } })}
                    />
                </div>
            </section>
        );
    }

    if (operation === "division") {
        return (
            <section className={`card card--${operation}`}>
                <TablesPicker selectedTables={settings.division.tables} onChange={(tables) => onSettingsChange({ ...settings, division: { tables } })} />
            </section>
        );
    }

    const arithmeticOperation: ArithmeticOperation = operation;
    const arithmeticSettings = settings[arithmeticOperation];
    const layoutExamples: Record<AnswerLayout, string> = {
        result: arithmeticOperation === "addition" ? "37 + 25 = ?" : "52 − 27 = ?",
        vertical: "Uma por baixo da outra"
    };

    return (
        <section className={`card card--${operation}`}>
            <SegmentedField<Difficulty>
                legend="Que dificuldade?"
                value={arithmeticSettings.difficulty}
                options={DifficultiesUtils.getValidDifficulties().map((difficulty) => ({
                    value: difficulty,
                    label: Messages.getDifficultyName(difficulty),
                    detail: Messages.getDifficultyRange(difficulty),
                    isLocked: !DifficultiesUtils.isUnlocked(difficulty, profile.unlockedDifficulties[arithmeticOperation])
                }))}
                onChange={(difficulty) => onSettingsChange({ ...settings, [arithmeticOperation]: { ...arithmeticSettings, difficulty } })}
            />
            <div className="card-section">
                <SegmentedField<AnswerLayout>
                    legend="Como queres fazer as contas?"
                    value={arithmeticSettings.layout}
                    options={QuestionsUtils.getValidLayouts().map((layout) => ({ value: layout, label: Messages.getLayoutLabel(layout), detail: layoutExamples[layout] }))}
                    onChange={(layout) => onSettingsChange({ ...settings, [arithmeticOperation]: { ...arithmeticSettings, layout } })}
                />
            </div>
        </section>
    );
}
