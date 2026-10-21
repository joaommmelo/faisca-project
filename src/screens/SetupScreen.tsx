import { useId, useState } from "react";
import { ClockField } from "../components/ClockField.tsx";
import { CoinButton } from "../components/CoinButton.tsx";
import { BackIcon } from "../components/Icons.tsx";
import { SegmentedField } from "../components/SegmentedField.tsx";
import { SwitchField } from "../components/SwitchField.tsx";
import { TablesPicker } from "../components/TablesPicker.tsx";
import { useFocusOnMount } from "../hooks/useFocusOnMount.ts";
import type { ClockSettings } from "../utils/clock/utils.ts";
import { DifficultiesUtils, type Difficulty } from "../utils/difficulties/utils.ts";
import { Messages } from "../utils/messages.ts";
import { OperationsUtils, type AdditiveOperation, type MultiplicativeOperation, type Operation } from "../utils/operations/utils.ts";
import { ProfilesUtils, type PlayProblem, type Profile, type ProfileSettings } from "../utils/profiles/utils.ts";
import { QuestionsUtils, type AnswerLayout, type PracticeMode } from "../utils/questions/utils.ts";
import { RecordsUtils } from "../utils/records/utils.ts";

interface SetupScreenProps {
    profile: Profile;
    onSettingsChange: (settings: ProfileSettings) => void;
    onPlay: () => void;
    onBack: () => void;
}

// Between choosing what to practise and playing: the choices a child makes every time are in view, and the rest
// (mode, always typing, the clock) waits behind "Mais opções".
export function SetupScreen({ profile, onSettingsChange, onPlay, onBack }: SetupScreenProps) {
    const headingRef = useFocusOnMount<HTMLHeadingElement>();
    const moreOptionsId: string = useId();
    const [isMoreOpen, setIsMoreOpen] = useState<boolean>(false);
    const { settings } = profile;
    const { practice } = settings;
    const playProblem: PlayProblem | null = ProfilesUtils.getPlayProblem(settings);
    const recordMilliseconds: number | null = RecordsUtils.getBest(profile.records, RecordsUtils.getCategory(settings));
    const changeClock = (clock: ClockSettings): void => {
        if (practice === "mix") {
            onSettingsChange({ ...settings, mix: { ...settings.mix, clock } });
            return;
        }
        onSettingsChange({ ...settings, [practice]: { ...settings[practice], clock } });
    };

    return (
        <main className={`screen screen--setup screen--${practice}`}>
            <header className="setup-header">
                <button type="button" className="button button--ghost" onClick={onBack}>
                    <BackIcon />
                    Início
                </button>
                <CoinButton wallet={profile.wallet} />
            </header>

            <h1 ref={headingRef} tabIndex={-1} className="setup-title">
                <span className="setup-title__symbol" aria-hidden="true">
                    {practice === "mix" ? "+−×÷" : OperationsUtils.getSymbol(practice)}
                </span>
                {Messages.getPracticeName(practice)}
            </h1>

            <section className={`card stack card--${practice}`}>
                {practice === "mix" ? (
                    <MixFields profile={profile} onSettingsChange={onSettingsChange} />
                ) : (
                    <OperationFields profile={profile} operation={practice} onSettingsChange={onSettingsChange} />
                )}

                <button
                    type="button"
                    className="more-options"
                    aria-expanded={isMoreOpen}
                    aria-controls={moreOptionsId}
                    onClick={() => setIsMoreOpen(!isMoreOpen)}
                >
                    Mais opções
                    <span className="more-options__chevron" aria-hidden="true" />
                </button>
                {isMoreOpen && (
                    <div id={moreOptionsId} className="stack">
                        {practice !== "mix" && OperationsUtils.isMultiplicative(practice) && (
                            <MoreMultiplicativeFields operation={practice} settings={settings} onSettingsChange={onSettingsChange} />
                        )}
                        <ClockField clock={ProfilesUtils.getClock(settings)} recordMilliseconds={recordMilliseconds} onChange={changeClock} />
                    </div>
                )}
            </section>

            <div className="play-bar">
                <p className="hint" role="status">
                    {playProblem === null ? "" : Messages.getPlayProblem(playProblem)}
                </p>
                <button type="button" className="button button--play" disabled={playProblem !== null} onClick={onPlay}>
                    Jogar
                </button>
            </div>
        </main>
    );
}

interface OperationFieldsProps {
    profile: Profile;
    operation: Operation;
    onSettingsChange: (settings: ProfileSettings) => void;
}

// The difficulty, then what it needs: the tables in Fácil × and ÷, the layout in + and −.
function OperationFields({ profile, operation, onSettingsChange }: OperationFieldsProps) {
    const { settings } = profile;

    return (
        <>
            <SegmentedField<Difficulty>
                legend="Que dificuldade?"
                value={ProfilesUtils.getDifficulty(settings, operation)}
                options={DifficultiesUtils.getValidDifficulties().map((difficulty) => ({
                    value: difficulty,
                    label: Messages.getDifficultyName(difficulty),
                    detail: Messages.getDifficultyDetail(operation, difficulty),
                    isLocked: !DifficultiesUtils.isUnlocked(difficulty, profile.unlockedDifficulties[operation])
                }))}
                onChange={(difficulty) => onSettingsChange({ ...settings, [operation]: { ...settings[operation], difficulty } })}
            />
            {OperationsUtils.isAdditive(operation) ? (
                <LayoutField operation={operation} settings={settings} onSettingsChange={onSettingsChange} />
            ) : (
                <TablesField operation={operation} settings={settings} onSettingsChange={onSettingsChange} />
            )}
        </>
    );
}

interface AdditiveFieldProps {
    operation: AdditiveOperation;
    settings: ProfileSettings;
    onSettingsChange: (settings: ProfileSettings) => void;
}

function LayoutField({ operation, settings, onSettingsChange }: AdditiveFieldProps) {
    const additiveSettings = settings[operation];
    const layoutExamples: Record<AnswerLayout, string> = {
        result: operation === "addition" ? "37 + 25 = ?" : "52 − 27 = ?",
        vertical: "Uma por baixo da outra"
    };

    return (
        <SegmentedField<AnswerLayout>
            legend="Como queres fazer as contas?"
            value={additiveSettings.layout}
            options={QuestionsUtils.getValidLayouts().map((layout) => ({
                value: layout,
                label: Messages.getLayoutLabel(layout),
                detail: layoutExamples[layout]
            }))}
            onChange={(layout) => onSettingsChange({ ...settings, [operation]: { ...additiveSettings, layout } })}
        />
    );
}

interface MultiplicativeFieldProps {
    operation: MultiplicativeOperation;
    settings: ProfileSettings;
    onSettingsChange: (settings: ProfileSettings) => void;
}

// The tables only make sense in Fácil; bigger numbers come from the difficulty itself.
function TablesField({ operation, settings, onSettingsChange }: MultiplicativeFieldProps) {
    const multiplicativeSettings = settings[operation];
    if (!OperationsUtils.usesTables(operation, multiplicativeSettings.difficulty)) {
        return null;
    }
    return (
        <TablesPicker
            selectedTables={multiplicativeSettings.tables}
            onChange={(tables) => onSettingsChange({ ...settings, [operation]: { ...multiplicativeSettings, tables } })}
        />
    );
}

function MoreMultiplicativeFields({ operation, settings, onSettingsChange }: MultiplicativeFieldProps) {
    const multiplicativeSettings = settings[operation];
    const hasInverseQuestions: boolean = operation === "multiplication" && OperationsUtils.usesTables(operation, multiplicativeSettings.difficulty);

    return (
        <>
            {hasInverseQuestions && (
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
                isOn={multiplicativeSettings.isAlwaysTyped}
                onChange={(isAlwaysTyped) => onSettingsChange({ ...settings, [operation]: { ...multiplicativeSettings, isAlwaysTyped } })}
            />
        </>
    );
}

interface MixFieldsProps {
    profile: Profile;
    onSettingsChange: (settings: ProfileSettings) => void;
}

// Which operations to mix, two or more. Each keeps the difficulty chosen on its own screen.
function MixFields({ profile, onSettingsChange }: MixFieldsProps) {
    const { settings } = profile;

    return (
        <fieldset>
            <legend className="section-title">Que contas queres misturar?</legend>
            <div className="mix-options">
                {OperationsUtils.getValidOperations().map((operation) => {
                    const isIncluded: boolean = settings.mix.operations.includes(operation);
                    return (
                        <button
                            key={operation}
                            type="button"
                            className={`mix-option mix-option--${operation}`}
                            aria-pressed={isIncluded}
                            onClick={() =>
                                onSettingsChange({
                                    ...settings,
                                    mix: { ...settings.mix, operations: ProfilesUtils.toggleMixOperation(settings.mix.operations, operation) }
                                })
                            }
                        >
                            <span className="mix-option__symbol" aria-hidden="true">
                                {OperationsUtils.getSymbol(operation)}
                            </span>
                            <span className="mix-option__name">{Messages.getOperationName(operation)}</span>
                            <span className="mix-option__difficulty">{Messages.getDifficultyName(ProfilesUtils.getDifficulty(settings, operation))}</span>
                        </button>
                    );
                })}
            </div>
            <p className="hint hint--left">Cada conta usa a dificuldade que escolheste nela.</p>
        </fieldset>
    );
}
