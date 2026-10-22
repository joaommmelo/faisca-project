import { useState } from "react";
import { Celebration } from "../components/Celebration.tsx";
import { ClockResultCard } from "../components/ClockResultCard.tsx";
import { HomeIcon, PlayIcon } from "../components/Icons.tsx";
import { Mascot, MascotMessage } from "../components/Mascot.tsx";
import { RewardsCard } from "../components/RewardsCard.tsx";
import type { Labels } from "../copy/copy.ts";
import { useFocusOnMount } from "../hooks/useFocusOnMount.ts";
import { Messages, type OfferText } from "../utils/messages.ts";
import type { SessionOffer } from "../utils/progression/utils.ts";
import type { SessionOutcome } from "../utils/session/utils.ts";

interface SummaryScreenProps {
    outcome: SessionOutcome;
    onAcceptOffer: (offer: SessionOffer) => void;
    onPlayAgain: () => void;
    onShowProgress: () => void;
    onHome: () => void;
}

export function SummaryScreen({ outcome, onAcceptOffer, onPlayAgain, onShowProgress, onHome }: SummaryScreenProps) {
    const headingRef = useFocusOnMount<HTMLHeadingElement>();
    const labels: Labels = Messages.getLabels();
    const [isOfferOpen, setIsOfferOpen] = useState<boolean>(outcome.offer !== null);
    const { summary, offer } = outcome;

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
                    <span className="score__total"> {labels.outOf(summary.firstTryCount)}</span>
                </p>
                <p className="score__label">{labels.correctAtFirstTry}</p>
                {summary.helpedCount > 0 && <p className="score__time">{Messages.getHelpedCount(summary.helpedCount)}</p>}
            </section>

            {outcome.clock !== null && <ClockResultCard clock={outcome.clock} />}

            <RewardsCard milestones={outcome.milestones} isNewRecord={outcome.clock !== null && outcome.clock.isNewRecord} />

            <section className="card">
                <h2 className="section-title">{labels.toPractiseMore}</h2>
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
                {labels.seeProgress}
            </button>

            <div className="summary-actions">
                <button type="button" className="button button--secondary" onClick={onHome}>
                    <HomeIcon />
                    {labels.home}
                </button>
                <button type="button" className="button button--play" onClick={onPlayAgain}>
                    <PlayIcon />
                    {labels.playAgain}
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
