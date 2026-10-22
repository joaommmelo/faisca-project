import { useId, type ReactNode } from "react";
import { Messages } from "../utils/messages.ts";
import { LockIcon } from "./Icons.tsx";

export interface SegmentedOption<T extends string> {
    value: T;
    label: string;
    detail: ReactNode;
    isLocked?: boolean;
}

interface SegmentedFieldProps<T extends string> {
    legend: string;
    options: SegmentedOption<T>[];
    value: T;
    onChange: (value: T) => void;
    onChooseLocked?: (value: T) => void;
}

// A row of big radio buttons. Locked options stay visible as a goal: they cannot be picked yet, but touching one says
// what opens it.
export function SegmentedField<T extends string>({ legend, options, value, onChange, onChooseLocked }: SegmentedFieldProps<T>) {
    const groupName: string = useId();

    return (
        <fieldset>
            <legend className="section-title">{legend}</legend>
            <div className="segmented" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
                {options.map((option) =>
                    option.isLocked === true ? (
                        <button
                            key={option.value}
                            type="button"
                            className="segmented__option segmented__option--locked"
                            onClick={() => onChooseLocked?.(option.value)}
                        >
                            <span className="segmented__lock">
                                <LockIcon />
                            </span>
                            <span>{option.label}</span>
                            <span className="segmented__detail">{Messages.getLabels().locked}</span>
                        </button>
                    ) : (
                        <label key={option.value} className="segmented__option">
                            <input
                                className="visually-hidden"
                                type="radio"
                                name={groupName}
                                value={option.value}
                                checked={value === option.value}
                                onChange={() => onChange(option.value)}
                            />
                            <span>{option.label}</span>
                            <span className="segmented__detail">{option.detail}</span>
                        </label>
                    )
                )}
            </div>
        </fieldset>
    );
}
