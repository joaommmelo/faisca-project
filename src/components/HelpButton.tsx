import { useId } from "react";
import { CoinIcon, HelpIcon } from "./Icons.tsx";

// What a question needs to offer help: whether it can, whether it is already paid, and why not.
export interface HelpControl {
    canUse: boolean;
    isPaid: boolean;
    unavailableText: string | null;
    onUse: () => void;
}

interface HelpButtonProps {
    control: HelpControl;
}

export function HelpButton({ control }: HelpButtonProps) {
    const reasonId: string = useId();

    return (
        <div className="help">
            <button
                type="button"
                className="button button--help"
                disabled={!control.canUse}
                aria-describedby={control.unavailableText === null ? undefined : reasonId}
                onClick={control.onUse}
            >
                <HelpIcon />
                {control.isPaid ? "Mais ajuda" : "Ajuda"}
                {!control.isPaid && (
                    <span className="help__cost">
                        <CoinIcon />
                        <span className="visually-hidden">custa </span>1<span className="visually-hidden"> moeda</span>
                    </span>
                )}
            </button>
            {control.unavailableText !== null && (
                <p id={reasonId} className="help__reason">
                    {control.unavailableText}
                </p>
            )}
        </div>
    );
}
