import type { Labels } from "../copy/copy.ts";
import { FactorGameUtils } from "../utils/factorGame/utils.ts";
import { Messages } from "../utils/messages.ts";
import { EraseIcon } from "./Icons.tsx";

interface FactorPadProps {
    announcement: string;
    canErase: boolean;
    isDisabled: boolean;
    onFactor: (factor: number) => void;
    onErase: () => void;
}

// The factors from 2 to 12, laid out like the numeric keypad with the eraser in the corner. Two taps make a
// multiplication: the screen decides what each tap fills and when it answers.
export function FactorPad({ announcement, canErase, isDisabled, onFactor, onErase }: FactorPadProps) {
    const labels: Labels = Messages.getLabels();

    return (
        <div className="keypad" role="group" aria-label={labels.chooseTwoNumbers}>
            <output className="visually-hidden" aria-live="polite">
                {announcement}
            </output>
            {FactorGameUtils.getFactors().map((factor) => (
                <button key={factor} type="button" className="keypad__key" disabled={isDisabled} onClick={() => onFactor(factor)}>
                    {factor}
                </button>
            ))}
            <button type="button" className="keypad__key keypad__key--erase" aria-label={labels.erase} disabled={isDisabled || !canErase} onClick={onErase}>
                <EraseIcon />
            </button>
        </div>
    );
}
