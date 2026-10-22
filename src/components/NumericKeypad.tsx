import { useEffect, useEffectEvent } from "react";
import type { Labels } from "../copy/copy.ts";
import { Messages } from "../utils/messages.ts";
import { CheckIcon, EraseIcon } from "./Icons.tsx";

interface NumericKeypadProps {
    announcement: string;
    canConfirm: boolean;
    isDisabled: boolean;
    onDigit: (digit: number) => void;
    onErase: () => void;
    onConfirm: () => void;
}

const DIGIT_ROWS: number[][] = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
];

// On-screen keypad so tablets and phones never open their own keyboard. It only sends keys; the screen
// decides where they go (the answer slot or the cell under the cursor in a column sum).
// A physical keyboard also works (digits, Backspace, Enter) for keyboard-only users.
export function NumericKeypad({ announcement, canConfirm, isDisabled, onDigit, onErase, onConfirm }: NumericKeypadProps) {
    const labels: Labels = Messages.getLabels();
    const confirm = (): void => {
        if (canConfirm) {
            onConfirm();
        }
    };

    const handlePhysicalKey = useEffectEvent((event: KeyboardEvent) => {
        if (event.repeat) {
            return;
        }
        if (/^[0-9]$/.test(event.key)) {
            event.preventDefault();
            onDigit(Number(event.key));
            return;
        }
        if (event.key === "Backspace") {
            event.preventDefault();
            onErase();
            return;
        }
        // A focused button already turns Enter into its own click.
        if (event.key === "Enter" && !(event.target instanceof HTMLButtonElement)) {
            event.preventDefault();
            confirm();
        }
    });

    useEffect(() => {
        if (isDisabled) {
            return;
        }
        const listener = (event: KeyboardEvent): void => handlePhysicalKey(event);
        window.addEventListener("keydown", listener);
        return () => window.removeEventListener("keydown", listener);
    }, [isDisabled]);

    return (
        <div className="keypad" role="group" aria-label={labels.keypad}>
            <output className="visually-hidden" aria-live="polite">
                {announcement}
            </output>
            {DIGIT_ROWS.flat().map((digit) => (
                <button key={digit} type="button" className="keypad__key" disabled={isDisabled} onClick={() => onDigit(digit)}>
                    {digit}
                </button>
            ))}
            <button type="button" className="keypad__key keypad__key--erase" aria-label={labels.erase} disabled={isDisabled} onClick={onErase}>
                <EraseIcon />
            </button>
            <button type="button" className="keypad__key" disabled={isDisabled} onClick={() => onDigit(0)}>
                0
            </button>
            <button
                type="button"
                className="keypad__key keypad__key--confirm"
                aria-label={labels.confirm}
                disabled={isDisabled || !canConfirm}
                onClick={confirm}
            >
                <CheckIcon />
            </button>
        </div>
    );
}
