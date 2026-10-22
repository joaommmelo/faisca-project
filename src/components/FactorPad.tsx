import type { ReactElement } from "react";
import type { Labels } from "../copy/copy.ts";
import { FactorGameUtils } from "../utils/factorGame/utils.ts";
import { Messages } from "../utils/messages.ts";
import { EraseIcon } from "./Icons.tsx";

const KEYS_PER_ROW: number = 3;

interface FactorPadProps {
    announcement: string;
    canErase: boolean;
    isDisabled: boolean;
    onFactor: (factor: number) => void;
    onErase: () => void;
}

// The factors from 2 to 12, laid out like the numeric keypad, with the eraser in the same corner (bottom left). Two
// taps make a multiplication: the screen decides what each tap fills and when it answers.
export function FactorPad({ announcement, canErase, isDisabled, onFactor, onErase }: FactorPadProps) {
    const labels: Labels = Messages.getLabels();
    const factors: number[] = FactorGameUtils.getFactors();
    // The last row starts with the eraser, as in the numeric keypad, so it holds one factor fewer (11, 12).
    const firstRowsLength: number = factors.length - (KEYS_PER_ROW - 1);
    const renderFactor = (factor: number): ReactElement => (
        <button key={factor} type="button" className="keypad__key" disabled={isDisabled} onClick={() => onFactor(factor)}>
            {factor}
        </button>
    );

    return (
        <div className="keypad" role="group" aria-label={labels.chooseTwoNumbers}>
            <output className="visually-hidden" aria-live="polite">
                {announcement}
            </output>
            {factors.slice(0, firstRowsLength).map(renderFactor)}
            <button type="button" className="keypad__key keypad__key--erase" aria-label={labels.erase} disabled={isDisabled || !canErase} onClick={onErase}>
                <EraseIcon />
            </button>
            {factors.slice(firstRowsLength).map(renderFactor)}
        </div>
    );
}
