import type { ReactNode } from "react";
import { Messages } from "../utils/messages.ts";
import { RoundGameUtils, type GameRound, type RoundOption, type RoundOptionState, type RoundResult } from "../utils/roundGame/utils.ts";
import { CheckIcon } from "./Icons.tsx";

// Where the child is in a round, as every board of a game of rounds receives it.
export interface RoundBoardState {
    round: GameRound;
    missedOptions: RoundOption[];
    // Taken away by a help; their places stay, so nothing jumps under the child's finger.
    hiddenOptions: RoundOption[];
    result: RoundResult | null;
    isDisabled: boolean;
    onChoose: (option: RoundOption) => void;
}

const STATE_CLASS_NAMES: Record<RoundOptionState, string> = {
    idle: "",
    right: "choice--correct",
    tried: "choice--tried",
    dimmed: "choice--dimmed",
    hidden: "choice--hidden"
};

interface RoundChoicesProps {
    state: RoundBoardState;
    label: string;
    // A row of three numbers, or the four signs.
    variant: "numbers" | "signs";
    renderOption: (option: RoundOption) => ReactNode;
    getOptionClassName?: (option: RoundOption) => string;
}

// The options of a round, in one row. After a first miss the chosen one steps aside and the others stay open.
export function RoundChoices({ state, label, variant, renderOption, getOptionClassName }: RoundChoicesProps) {
    const options: RoundOption[] = state.round.options;

    return (
        <div className={`choices choices--${variant}`} role="group" aria-label={label}>
            {options.map((option) => {
                const optionState: RoundOptionState = RoundGameUtils.getOptionState(state, option);
                if (optionState === "hidden") {
                    return <span key={String(option)} className="choice choice--hidden" aria-hidden="true" />;
                }
                const extraClassName: string = getOptionClassName === undefined ? "" : getOptionClassName(option);
                return (
                    <button
                        key={String(option)}
                        type="button"
                        className={`choice ${extraClassName} ${STATE_CLASS_NAMES[optionState]}`}
                        aria-label={Messages.getRoundOptionLabel(state.round, option)}
                        disabled={state.isDisabled || optionState !== "idle"}
                        onClick={() => state.onChoose(option)}
                    >
                        {renderOption(option)}
                        {optionState === "right" && <CheckIcon />}
                    </button>
                );
            })}
        </div>
    );
}
