import { useState } from "react";
import { Celebration } from "../components/Celebration.tsx";
import { ClockIcon, CoinIcon, StarIcon } from "../components/Icons.tsx";
import { Mascot, MascotMessage } from "../components/Mascot.tsx";
import { useFocusOnMount } from "../hooks/useFocusOnMount.ts";
import { Messages, type OfferText } from "../utils/messages.ts";
import type { Milestone, SessionOffer } from "../utils/progression/utils.ts";
import type { SessionOutcome } from "../utils/session/utils.ts";
import { TimeUtils } from "../utils/time/utils.ts";

interface SummaryScreenProps {
    outcome: SessionOutcome;
    onAcceptOffer: (offer: SessionOffer) => void;
    onPlayAgain: () => void;
    onShowProgress: () => void;
    onHome: () => void;
}

export function SummaryScreen({ outcome, onAcceptOffer, onPlayAgain, onShowProgress, onHome }: SummaryScreenProps) {
    const headingRef = useFocusOnMount<HTMLHeadingElement>();
    const [isOfferOpen, setIsOfferOpen] = useState<boolean>(outcome.offer !== null);
    const { summary, offer } = outcome;
    const coinsEarned: number = outcome.milestones.filter((milestone) => milestone.kind === "coin").length;
    const levelUps: Milestone[] = outcome.milestones.filter((milestone) => milestone.kind === "level-up");
    const isNewRecord: boolean = outcome.clock !== null && outcome.clock.isNewRecord;

    return (
        <main className="screen screen--summary">
            <Celebration />
            <MascotMessage mood="proud" size={112}>
                {Messages.getSessionEnd()}
            </MascotMessage>

            {offer !== null && isOfferOpen && <OfferCard offer={offer} onAccept={() => onAcceptOffer(offer)} onDecline={() => setIsOfferOpen(false)} />}

            <section className="card score">
                <h1 ref={headingRef} tabIndex={-1} className="score__headline">
                    {Messages.getSummaryHeadline(summary.correctAtFirstTry, summary.firstTryCount)}
                </h1>
                <p className="score__value">
                    {summary.correctAtFirstTry}
                    <span className="score__total"> de {summary.firstTryCount}</span>
                </p>
                <p className="score__label">certas à primeira</p>
                {summary.helpedCount > 0 && <p className="score__time">{Messages.getHelpedCount(summary.helpedCount)}</p>}
            </section>

            {outcome.clock !== null && (
                <section className={isNewRecord ? "card clock-result clock-result--record" : "card clock-result"} aria-label="Tempo">
                    <p className="clock-result__time">
                        <ClockIcon />
                        {TimeUtils.formatElapsed(outcome.clock.elapsedMilliseconds)}
                    </p>
                    {Messages.getClockOutcomeLines(outcome.clock).map((line) => (
                        <p key={line} className="clock-result__line">
                            {line}
                        </p>
                    ))}
                </section>
            )}

            {(coinsEarned > 0 || levelUps.length > 0 || isNewRecord) && (
                <section className="card rewards" aria-label="Conquistas deste jogo">
                    <ul className="milestones milestones--summary">
                        {coinsEarned > 0 && (
                            <li className="milestone milestone--coin">
                                <CoinIcon />
                                {coinsEarned === 1 ? "Ganhaste 1 moeda!" : `Ganhaste ${coinsEarned} moedas!`}
                            </li>
                        )}
                        {isNewRecord && (
                            <li className="milestone milestone--record">
                                <StarIcon />
                                Novo recorde!
                            </li>
                        )}
                        {levelUps.map((milestone, index) => (
                            <li key={index} className="milestone milestone--level-up">
                                <StarIcon />
                                {Messages.getMilestone(milestone)}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <section className="card">
                <h2 className="section-title">Para treinar mais</h2>
                {summary.questionsToReinforce.length === 0 ? (
                    <p>{Messages.getNothingToReinforce()}</p>
                ) : (
                    <ul className="fact-list">
                        {summary.questionsToReinforce.map((question) => (
                            <li key={question.id}>{Messages.getEquationText(question)}</li>
                        ))}
                    </ul>
                )}
            </section>

            <button type="button" className="button button--secondary button--block" onClick={onShowProgress}>
                Ver progresso
            </button>

            <div className="summary-actions">
                <button type="button" className="button button--secondary" onClick={onHome}>
                    Início
                </button>
                <button type="button" className="button button--play" onClick={onPlayAgain}>
                    Jogar outra vez
                </button>
            </div>
        </main>
    );
}

interface OfferCardProps {
    offer: SessionOffer;
    onAccept: () => void;
    onDecline: () => void;
}

// An invitation, never an order: the child picks, and nothing is lost either way.
function OfferCard({ offer, onAccept, onDecline }: OfferCardProps) {
    const text: OfferText = Messages.getOfferText(offer);

    return (
        <section className={`card offer offer--${offer.kind}`} aria-label={text.title}>
            <div className="offer__header">
                <Mascot mood={offer.kind === "unlock" ? "cheer" : "encourage"} size={72} />
                <div>
                    <h2 className="offer__title">{text.title}</h2>
                    <p>{text.text}</p>
                </div>
            </div>
            <div className="actions-row">
                <button type="button" className="button button--primary" onClick={onAccept}>
                    {text.acceptLabel}
                </button>
                <button type="button" className="button button--secondary" onClick={onDecline}>
                    {text.declineLabel}
                </button>
            </div>
        </section>
    );
}
