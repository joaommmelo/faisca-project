import { Celebration } from "../components/Celebration.tsx";
import { FactorEquation } from "../components/FactorEquation.tsx";
import { BackIcon, HomeIcon, PlayIcon } from "../components/Icons.tsx";
import { MascotMessage } from "../components/Mascot.tsx";
import { TablesPicker } from "../components/TablesPicker.tsx";
import type { Labels } from "../copy/copy.ts";
import { useFocusOnMount } from "../hooks/useFocusOnMount.ts";
import { FactorGameUtils, type FactorGameOutcome } from "../utils/factorGame/utils.ts";
import { Messages } from "../utils/messages.ts";

// The example of the rules: one of the multiplications that make 24.
const EXAMPLE_TARGET: number = 24;
const EXAMPLE_FACTORS: number[] = [4, 6];

interface FactorGameScreenProps {
    // The multiplication's tables: the game draws its numbers from what the child practises.
    tables: number[];
    // The game that just ended, or null before the first one.
    outcome: FactorGameOutcome | null;
    onTablesChange: (tables: number[]) => void;
    onPlay: () => void;
    onHome: () => void;
}

// Before a game: how it works and which tables. After one: how it went and every multiplication of the numbers missed.
export function FactorGameScreen({ tables, outcome, onTablesChange, onPlay, onHome }: FactorGameScreenProps) {
    const headingRef = useFocusOnMount<HTMLHeadingElement>();
    const labels: Labels = Messages.getLabels();
    const canPlay: boolean = FactorGameUtils.canPlay(tables);

    return (
        <main className="screen screen--setup screen--multiplication">
            <header className="setup-header">
                <button type="button" className="button button--ghost" onClick={onHome}>
                    <BackIcon />
                    {labels.home}
                </button>
            </header>

            <h1 ref={headingRef} tabIndex={-1} className="setup-title">
                <span className="setup-title__symbol" aria-hidden="true">
                    ?×?
                </span>
                {Messages.getFactorGameName()}
            </h1>

            {outcome === null ? (
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
                        <TablesPicker selectedTables={tables} onChange={onTablesChange} />
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
            ) : (
                <>
                    <FactorGameResult outcome={outcome} />
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

function FactorGameResult({ outcome }: { outcome: FactorGameOutcome }) {
    const labels: Labels = Messages.getLabels();

    return (
        <>
            <Celebration />
            <MascotMessage mood="proud" size={88}>
                {Messages.getSummaryHeadline(outcome.correctAtFirstTry, outcome.roundCount)}
            </MascotMessage>

            <section className="card score">
                <p className="score__value">
                    {outcome.correctAtFirstTry}
                    <span className="score__total"> {labels.outOf(outcome.roundCount)}</span>
                </p>
                <p className="score__label">{labels.correctAtFirstTry}</p>
            </section>

            <section className="card">
                <h2 className="section-title">{labels.toPractiseMore}</h2>
                {outcome.roundsToPractise.length === 0 ? (
                    <p>{Messages.getNothingToReinforce()}</p>
                ) : (
                    <ul className="fact-list">
                        {outcome.roundsToPractise.map((round) => (
                            <li key={round.target}>{Messages.getFactorRoundText(round)}</li>
                        ))}
                    </ul>
                )}
            </section>
        </>
    );
}
