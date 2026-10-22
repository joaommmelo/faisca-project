import { Messages } from "../utils/messages.ts";
import type { AnswerRecord } from "../utils/session/utils.ts";
import { CheckIcon } from "./Icons.tsx";

interface ChoiceOptionsProps {
    options: number[];
    answer: number;
    missedAttempts: number[];
    // Taken away by a help; their places stay empty so nothing jumps under the child's finger.
    hiddenOptions: number[];
    record: AnswerRecord | null;
    onChoose: (value: number) => void;
}

// After a first miss the chosen option steps aside and the others stay open for the second chance.
export function ChoiceOptions({ options, answer, missedAttempts, hiddenOptions, record, onChoose }: ChoiceOptionsProps) {
    const triedAnswers: number[] = record === null ? missedAttempts : record.givenAnswers;
    const getStateClassName = (option: number): string => {
        if (record !== null && option === answer) {
            return "choice--correct";
        }
        if (triedAnswers.includes(option)) {
            return "choice--tried";
        }
        return record === null ? "" : "choice--dimmed";
    };

    return (
        <div className="choices" role="group" aria-label={Messages.getLabels().chooseAnswer}>
            {options.map((option) =>
                hiddenOptions.includes(option) ? (
                    <span key={option} className="choice choice--hidden" aria-hidden="true" />
                ) : (
                    <button
                        key={option}
                        type="button"
                        className={`choice ${getStateClassName(option)}`}
                        disabled={record !== null || triedAnswers.includes(option)}
                        onClick={() => onChoose(option)}
                    >
                        {option}
                        {record !== null && option === answer && <CheckIcon />}
                    </button>
                )
            )}
        </div>
    );
}
