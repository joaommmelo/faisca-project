import { NumbersUtils } from "../utils/numbers/utils.ts";
import { OperationsUtils } from "../utils/operations/utils.ts";
import type { DisplayedQuestion } from "../utils/questions/utils.ts";

// From this many digits the question no longer fits one line on a phone: the result goes on a line of its own, from
// the start, so it never jumps down while being typed.
const LONG_EQUATION_DIGITS: number = 5;

interface EquationProps {
    question: DisplayedQuestion;
    typedAnswer: string;
    isAnswered: boolean;
}

// The question with a slot for the hidden number, in one line or two. The spoken version lives in the screen's heading.
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
            return NumbersUtils.format(question.answer);
        }
        if (typedAnswer.length > 0) {
            return NumbersUtils.format(Number(typedAnswer));
        }
        return "?";
    })();
    const slot = <span className={slotClassName}>{slotContent}</span>;
    const isLong: boolean = String(Math.max(question.left, question.right, question.result)).length >= LONG_EQUATION_DIGITS;

    return (
        <div className={`equation equation--${question.operation}${isLong ? " equation--long" : ""}`} aria-hidden="true">
            <span className="equation__side">
                {question.kind === "missing-left" ? slot : <span>{NumbersUtils.format(question.left)}</span>}
                <span className="equation__operator">{OperationsUtils.getSymbol(question.operation)}</span>
                {question.kind === "missing-right" ? slot : <span>{NumbersUtils.format(question.right)}</span>}
            </span>
            <span className="equation__side">
                <span className="equation__operator">=</span>
                {question.kind === "direct" ? slot : <span>{NumbersUtils.format(question.result)}</span>}
            </span>
        </div>
    );
}
