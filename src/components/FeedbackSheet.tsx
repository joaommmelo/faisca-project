import { useEffect, useId, useRef } from "react";
import { Messages, type Feedback } from "../utils/messages.ts";
import type { Milestone } from "../utils/progression/utils.ts";
import { Celebration } from "./Celebration.tsx";
import { CoinIcon, StarIcon } from "./Icons.tsx";
import { Mascot } from "./Mascot.tsx";

interface FeedbackSheetProps {
    feedback: Feedback;
    isCorrect: boolean;
    milestones: Milestone[];
    onContinue: () => void;
}

export function FeedbackSheet({ feedback, isCorrect, milestones, onContinue }: FeedbackSheetProps) {
    const messageId: string = useId();
    const continueButtonRef = useRef<HTMLButtonElement>(null);

    // Focus lands on "Seguinte", which describes itself with the message, so screen readers read both.
    useEffect(() => {
        if (continueButtonRef.current !== null) {
            continueButtonRef.current.focus();
        }
    }, []);

    return (
        <section className={isCorrect ? "feedback feedback--correct" : "feedback feedback--wrong"} aria-label="Resultado">
            {milestones.length > 0 && <Celebration />}
            <div className="feedback__inner">
                <div className="feedback__message">
                    <Mascot mood={isCorrect ? "cheer" : "encourage"} size={72} />
                    <div id={messageId}>
                        <p className="feedback__title">{feedback.title}</p>
                        {feedback.lines.map((line) => (
                            <p key={line} className="feedback__line">
                                {line}
                            </p>
                        ))}
                        {milestones.length > 0 && (
                            <ul className="milestones">
                                {milestones.map((milestone, index) => (
                                    <li key={index} className={`milestone milestone--${milestone.kind}`}>
                                        {milestone.kind === "coin" ? <CoinIcon /> : <StarIcon />}
                                        {Messages.getMilestone(milestone)}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
                <button
                    ref={continueButtonRef}
                    type="button"
                    className="button button--primary button--block"
                    aria-describedby={messageId}
                    onClick={onContinue}
                >
                    Seguinte
                </button>
            </div>
        </section>
    );
}
