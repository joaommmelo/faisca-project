import { useId } from "react";
import type { Labels } from "../copy/copy.ts";
import { Messages } from "../utils/messages.ts";
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
    const labels: Labels = Messages.getLabels();

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
                {control.isPaid ? labels.moreHelp : labels.help}
                {!control.isPaid && (
                    <span className="help__cost">
                        <CoinIcon />
                        <span aria-hidden="true">1</span>
                        <span className="visually-hidden">{labels.helpCost}</span>
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
