import type { Ref } from "react";
import { Messages } from "../utils/messages.ts";
import type { Question } from "../utils/questions/utils.ts";

interface EquationProps {
    question: Question;
    typedAnswer: string;
    isAnswered: boolean;
    headingRef: Ref<HTMLHeadingElement>;
}

export function Equation({ question, typedAnswer, isAnswered, headingRef }: EquationProps) {
    const slotClassName: string = (() => {
        if (isAnswered) {
            return "equation__slot equation__slot--answered";
        }
        if (typedAnswer.length > 0) {
            return "equation__slot equation__slot--filled";
        }
        return "equation__slot";
    })();
    const slotContent: string = (() => {
        if (isAnswered) {
            return String(question.answer);
        }
        if (typedAnswer.length > 0) {
            return typedAnswer;
        }
        return "?";
    })();
    const slot = <span className={slotClassName}>{slotContent}</span>;

    return (
        <div>
            <h1 className="visually-hidden" tabIndex={-1} ref={headingRef}>
                {Messages.getSpokenQuestion(question)}
            </h1>
            <div className="equation" aria-hidden="true">
                {question.kind === "missing-left" ? slot : <span>{question.leftFactor}</span>}
                <span className="equation__operator">×</span>
                {question.kind === "missing-right" ? slot : <span>{question.rightFactor}</span>}
                <span className="equation__operator">=</span>
                {question.kind === "direct" ? slot : <span>{question.product}</span>}
            </div>
        </div>
    );
}
