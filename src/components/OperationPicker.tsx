import { useId } from "react";
import { Messages } from "../utils/messages.ts";
import { OperationsUtils, type Operation } from "../utils/operations/utils.ts";

interface OperationPickerProps {
    operation: Operation;
    summaries: Record<Operation, string>;
    onChange: (operation: Operation) => void;
}

// The main menu: one big tile per operation, each with its own colour and a one-line summary of progress.
export function OperationPicker({ operation, summaries, onChange }: OperationPickerProps) {
    const groupName: string = useId();

    return (
        <fieldset>
            <legend className="section-title">O que vamos praticar?</legend>
            <div className="operations">
                {OperationsUtils.getValidOperations().map((option) => (
                    <label key={option} className={`operation operation--${option}`}>
                        <input
                            className="visually-hidden"
                            type="radio"
                            name={groupName}
                            value={option}
                            checked={operation === option}
                            onChange={() => onChange(option)}
                        />
                        <span className="operation__symbol" aria-hidden="true">
                            {OperationsUtils.getSymbol(option)}
                        </span>
                        <span className="operation__name">{Messages.getOperationName(option)}</span>
                        <span className="operation__summary">{summaries[option]}</span>
                    </label>
                ))}
            </div>
        </fieldset>
    );
}
