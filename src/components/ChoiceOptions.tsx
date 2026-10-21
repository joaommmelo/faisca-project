import type { AnswerRecord } from "../utils/session/utils.ts";
import { CheckIcon } from "./Icons.tsx";

interface ChoiceOptionsProps {
    options: number[];
    answer: number;
    record: AnswerRecord | null;
    onChoose: (value: number) => void;
}

export function ChoiceOptions({ options, answer, record, onChoose }: ChoiceOptionsProps) {
    const getStateClassName = (option: number): string => {
        if (record === null) {
            return "";
        }
        if (option === answer) {
            return "choice--correct";
        }
        if (option === record.givenAnswer) {
            return "choice--chosen-wrong";
        }
        return "choice--dimmed";
    };

    return (
        <div className="choices" role="group" aria-label="Escolhe a resposta">
            {options.map((option) => (
                <button
                    key={option}
                    type="button"
                    className={`choice ${getStateClassName(option)}`}
                    disabled={record !== null}
                    onClick={() => onChoose(option)}
                >
                    {option}
                    {record !== null && option === answer && <CheckIcon />}
                </button>
            ))}
        </div>
    );
}
