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
}

// A row of big radio buttons. Locked options stay visible as a goal, but cannot be picked yet.
export function SegmentedField<T extends string>({ legend, options, value, onChange }: SegmentedFieldProps<T>) {
    const groupName: string = useId();

    return (
        <fieldset>
            <legend className="section-title">{legend}</legend>
            <div className="segmented" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
                {options.map((option) => (
                    <label key={option.value} className={option.isLocked === true ? "segmented__option segmented__option--locked" : "segmented__option"}>
                        <input
                            className="visually-hidden"
                            type="radio"
                            name={groupName}
                            value={option.value}
                            checked={value === option.value}
                            disabled={option.isLocked === true}
                            onChange={() => onChange(option.value)}
                        />
                        {option.isLocked === true && (
                            <span className="segmented__lock">
                                <LockIcon />
                            </span>
                        )}
                        <span>{option.label}</span>
                        <span className="segmented__detail">{option.isLocked === true ? Messages.getLabels().locked : option.detail}</span>
                    </label>
                ))}
            </div>
        </fieldset>
    );
}
