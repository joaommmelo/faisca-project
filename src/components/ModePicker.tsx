import { useId } from "react";
import { Messages } from "../utils/messages.ts";
import { QuestionsUtils, type PracticeMode } from "../utils/questions/utils.ts";

interface ModePickerProps {
    mode: PracticeMode;
    onChange: (mode: PracticeMode) => void;
}

export function ModePicker({ mode, onChange }: ModePickerProps) {
    const groupName: string = useId();

    return (
        <fieldset>
            <legend className="section-title">Que contas queres?</legend>
            <div className="segmented">
                {QuestionsUtils.getValidModes().map((option) => (
                    <label key={option} className="segmented__option">
                        <input
                            className="visually-hidden"
                            type="radio"
                            name={groupName}
                            value={option}
                            checked={mode === option}
                            onChange={() => onChange(option)}
                        />
                        <span>{Messages.getModeLabel(option)}</span>
                        <span className="segmented__example" aria-hidden="true">
                            {Messages.getModeExample(option)}
                        </span>
                    </label>
                ))}
            </div>
        </fieldset>
    );
}
