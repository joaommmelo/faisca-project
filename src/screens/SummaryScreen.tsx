import { MascotMessage } from "../components/Mascot.tsx";
import { useFocusOnMount } from "../hooks/useFocusOnMount.ts";
import { Messages } from "../utils/messages.ts";
import type { SessionOutcome } from "../utils/session/utils.ts";
import { TimeUtils } from "../utils/time/utils.ts";

interface SummaryScreenProps {
    outcome: SessionOutcome;
    onPlayAgain: () => void;
    onShowProgress: () => void;
    onHome: () => void;
}

export function SummaryScreen({ outcome, onPlayAgain, onShowProgress, onHome }: SummaryScreenProps) {
    const headingRef = useFocusOnMount<HTMLHeadingElement>();
    const { summary } = outcome;

    return (
        <main className="screen">
            <MascotMessage mood="proud" size={112}>
                {Messages.getSessionEnd()}
            </MascotMessage>

            <section className="card score">
                <h1 ref={headingRef} tabIndex={-1} className="score__headline">
                    {Messages.getSummaryHeadline(summary.correctAtFirstTry, summary.firstTryCount)}
                </h1>
                <p className="score__value">
                    {summary.correctAtFirstTry}
                    <span className="score__total"> de {summary.firstTryCount}</span>
                </p>
                <p className="score__label">certas à primeira</p>
                {outcome.elapsedMilliseconds !== null && <p className="score__time">Tempo: {TimeUtils.formatElapsed(outcome.elapsedMilliseconds)}</p>}
            </section>

            <section className="card">
                <h2 className="section-title">Para treinar mais</h2>
                {summary.factsToReinforce.length === 0 ? (
                    <p>{Messages.getNothingToReinforce()}</p>
                ) : (
                    <ul className="fact-list">
                        {summary.factsToReinforce.map((question) => (
                            <li key={question.factId}>
                                {question.leftFactor} × {question.rightFactor} = {question.product}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <div className="stack">
                <button type="button" className="button button--play" onClick={onPlayAgain}>
                    Jogar outra vez
                </button>
                <button type="button" className="button button--secondary button--block" onClick={onShowProgress}>
                    Ver progresso
                </button>
                <button type="button" className="button button--ghost" onClick={onHome}>
                    Início
                </button>
            </div>
        </main>
    );
}
