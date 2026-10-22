import { useId, useState } from "react";
import { Celebration } from "../components/Celebration.tsx";
import { ClockField } from "../components/ClockField.tsx";
import { ClockResultCard } from "../components/ClockResultCard.tsx";
import { CoinButton } from "../components/CoinButton.tsx";
import { FactorEquation } from "../components/FactorEquation.tsx";
import { BackIcon, HomeIcon, PlayIcon } from "../components/Icons.tsx";
import { MascotMessage } from "../components/Mascot.tsx";
import { RewardsCard } from "../components/RewardsCard.tsx";
import { TablesPicker } from "../components/TablesPicker.tsx";
import type { Labels } from "../copy/copy.ts";
import { useFocusOnMount } from "../hooks/useFocusOnMount.ts";
import { FactorGameUtils, type FactorGameOutcome } from "../utils/factorGame/utils.ts";
import { Messages } from "../utils/messages.ts";
import type { Profile, ProfileSettings } from "../utils/profiles/utils.ts";
import { RecordsUtils } from "../utils/records/utils.ts";

// The example of the rules: one of the multiplications that make 24.
const EXAMPLE_TARGET: number = 24;
const EXAMPLE_FACTORS: number[] = [4, 6];

interface FactorGameScreenProps {
    profile: Profile;
    // The game that just ended, or null before the first one.
    outcome: FactorGameOutcome | null;
    onSettingsChange: (settings: ProfileSettings) => void;
    onPlay: () => void;
    onShowProgress: () => void;
    onHome: () => void;
}

// Before a game: how it works and which tables, with the clock behind "Mais opções". After one: how it went, what it
// earned and every multiplication of the numbers missed.
export function FactorGameScreen({ profile, outcome, onSettingsChange, onPlay, onShowProgress, onHome }: FactorGameScreenProps) {
    const headingRef = useFocusOnMount<HTMLHeadingElement>();
    const labels: Labels = Messages.getLabels();

    return (
        <main className="screen screen--setup screen--multiplication">
            <header className="setup-header">
                <button type="button" className="button button--ghost" onClick={onHome}>
                    <BackIcon />
                    {labels.home}
                </button>
                <CoinButton wallet={profile.wallet} />
            </header>

            <h1 ref={headingRef} tabIndex={-1} className="setup-title">
                <span className="setup-title__symbol" aria-hidden="true">
                    ?×?
                </span>
                {Messages.getFactorGameName()}
            </h1>

            {outcome === null ? (
                <FactorGameRules profile={profile} onSettingsChange={onSettingsChange} onPlay={onPlay} />
            ) : (
                <>
                    <FactorGameResult outcome={outcome} />
                    <button type="button" className="button button--secondary button--block" onClick={onShowProgress}>
                        {labels.seeProgress}
                    </button>
                    <div className="summary-actions">
                        <button type="button" className="button button--secondary" onClick={onHome}>
                            <HomeIcon />
                            {labels.home}
                        </button>
                        <button type="button" className="button button--play" onClick={onPlay}>
                            <PlayIcon />
                            {labels.playAgain}
                        </button>
                    </div>
                </>
            )}
        </main>
    );
}

interface FactorGameRulesProps {
    profile: Profile;
    onSettingsChange: (settings: ProfileSettings) => void;
    onPlay: () => void;
}

function FactorGameRules({ profile, onSettingsChange, onPlay }: FactorGameRulesProps) {
    const moreOptionsId: string = useId();
    const labels: Labels = Messages.getLabels();
    const [isMoreOpen, setIsMoreOpen] = useState<boolean>(false);
    const { settings } = profile;
    const { tables } = settings.multiplication;
    const canPlay: boolean = FactorGameUtils.canPlay(tables);

    return (
        <>
            <MascotMessage mood="happy" size={80}>
                {Messages.getFactorGameGreeting()}
            </MascotMessage>
            <section className="card stack card--multiplication">
                <div className="factor-example">
                    <FactorEquation target={EXAMPLE_TARGET} factors={EXAMPLE_FACTORS} isAnswered />
                </div>
                <p>{Messages.getFactorGameAnyAnswer()}</p>
            </section>
            <section className="card stack card--multiplication">
                <TablesPicker
                    selectedTables={tables}
                    onChange={(changedTables) => onSettingsChange({ ...settings, multiplication: { ...settings.multiplication, tables: changedTables } })}
                />
                <button
                    type="button"
                    className="more-options"
                    aria-expanded={isMoreOpen}
                    aria-controls={moreOptionsId}
                    onClick={() => setIsMoreOpen(!isMoreOpen)}
                >
                    {labels.moreOptions}
                    <span className="more-options__chevron" aria-hidden="true" />
                </button>
                {isMoreOpen && (
                    <div id={moreOptionsId} className="stack">
                        <ClockField
                            clock={settings.factorGame.clock}
                            recordMilliseconds={RecordsUtils.getBest(profile.records, RecordsUtils.getFactorGameCategory(tables))}
                            onChange={(clock) => onSettingsChange({ ...settings, factorGame: { ...settings.factorGame, clock } })}
                        />
                    </div>
                )}
            </section>
            <div className="play-bar">
                <p className="hint" role="status">
                    {canPlay ? "" : Messages.getFactorGameNeedsTable()}
                </p>
                <button type="button" className="button button--play" disabled={!canPlay} onClick={onPlay}>
                    {labels.play}
                </button>
            </div>
        </>
    );
}

function FactorGameResult({ outcome }: { outcome: FactorGameOutcome }) {
    const labels: Labels = Messages.getLabels();
    const { summary } = outcome;

    return (
        <>
            <Celebration />
            <MascotMessage mood="proud" size={88}>
                {Messages.getSummaryHeadline(summary.correctAtFirstTry, summary.roundCount)}
            </MascotMessage>

            <section className="card score">
                <p className="score__value">
                    {summary.correctAtFirstTry}
                    <span className="score__total"> {labels.outOf(summary.roundCount)}</span>
                </p>
                <p className="score__label">{labels.correctAtFirstTry}</p>
                {summary.helpedCount > 0 && <p className="score__time">{Messages.getHelpedCount(summary.helpedCount)}</p>}
            </section>

            {outcome.clock !== null && <ClockResultCard clock={outcome.clock} />}

            <RewardsCard milestones={outcome.milestones} isNewRecord={outcome.clock !== null && outcome.clock.isNewRecord} />

            <section className="card">
                <h2 className="section-title">{labels.toPractiseMore}</h2>
                {summary.roundsToPractise.length === 0 ? (
                    <p>{Messages.getNothingToReinforce()}</p>
                ) : (
                    <ul className="fact-list">
                        {summary.roundsToPractise.map((round) => (
                            <li key={round.target}>{Messages.getFactorRoundText(round)}</li>
                        ))}
                    </ul>
                )}
            </section>
        </>
    );
}
