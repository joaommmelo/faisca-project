import { OperationsUtils } from "../utils/operations/utils.ts";
import type { Question } from "../utils/questions/utils.ts";

interface EquationProps {
    question: Question;
    typedAnswer: string;
    isAnswered: boolean;
}

// The question in one line, with a slot for the hidden number. The spoken version lives in the screen's heading.
export function Equation({ question, typedAnswer, isAnswered }: EquationProps) {
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
        <div className={`equation equation--${question.operation}`} aria-hidden="true">
            {question.kind === "missing-left" ? slot : <span>{question.left}</span>}
            <span className="equation__operator">{OperationsUtils.getSymbol(question.operation)}</span>
            {question.kind === "missing-right" ? slot : <span>{question.right}</span>}
            <span className="equation__operator">=</span>
            {question.kind === "direct" ? slot : <span>{question.result}</span>}
        </div>
    );
}
