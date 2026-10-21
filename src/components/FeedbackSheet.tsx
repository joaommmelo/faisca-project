import { useEffect, useId, useRef } from "react";
import { Messages, type Feedback } from "../utils/messages.ts";
import type { AnswerRecord } from "../utils/session/utils.ts";
import { Mascot } from "./Mascot.tsx";

interface FeedbackSheetProps {
    record: AnswerRecord;
    praiseVariant: number;
    onContinue: () => void;
}

export function FeedbackSheet({ record, praiseVariant, onContinue }: FeedbackSheetProps) {
    const messageId: string = useId();
    const continueButtonRef = useRef<HTMLButtonElement>(null);
    const feedback: Feedback = Messages.getFeedback(record, praiseVariant);

    // Focus lands on "Seguinte", which describes itself with the message, so screen readers read both.
    useEffect(() => {
        if (continueButtonRef.current !== null) {
            continueButtonRef.current.focus();
        }
    }, []);

    return (
        <section className={record.isCorrect ? "feedback feedback--correct" : "feedback feedback--wrong"} aria-label="Resultado">
            <div className="feedback__inner">
                <div className="feedback__message">
                    <Mascot mood={record.isCorrect ? "cheer" : "encourage"} size={72} />
                    <div id={messageId}>
                        <p className="feedback__title">{feedback.title}</p>
                        {feedback.lines.map((line) => (
                            <p key={line} className="feedback__line">
                                {line}
                            </p>
                        ))}
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
