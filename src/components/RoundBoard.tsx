import type { ReactNode } from "react";
import type { Labels } from "../copy/copy.ts";
import { BalanceGameUtils, type BalancePan, type BalanceRound, type BalanceSide } from "../utils/balanceGame/utils.ts";
import type { CountingRound } from "../utils/countingGame/utils.ts";
import { Messages } from "../utils/messages.ts";
import type { MissingSignRound } from "../utils/missingSignGame/utils.ts";
import { NumberBondsGameUtils, type NumberBondsRound } from "../utils/numberBondsGame/utils.ts";
import { OperationsUtils, type Operation } from "../utils/operations/utils.ts";
import { RoundGameUtils, type RoundOption, type RoundOptionState } from "../utils/roundGame/utils.ts";
import type { SkipCountingRound } from "../utils/skipCountingGame/utils.ts";
import { BonesPicture } from "./BonesPicture.tsx";
import { CheckIcon } from "./Icons.tsx";
import { RoundChoices, type RoundBoardState } from "./RoundChoices.tsx";

interface RoundBoardProps {
    state: RoundBoardState;
    // What goes between the round and its options: the "try again" and the help.
    middle: ReactNode;
}

// What a game of rounds shows: the round on top, its options under it. Once answered, the round shows the answer.
// On the balance the pans are the options, so what goes in the middle comes after it.
export function RoundBoard({ state, middle }: RoundBoardProps) {
    const { round } = state;
    switch (round.game) {
        case "counting":
            return <CountingBoard state={state} round={round} middle={middle} />;
        case "number-bonds":
            return <NumberBondsBoard state={state} round={round} middle={middle} />;
        case "skip-counting":
            return <SkipCountingBoard state={state} round={round} middle={middle} />;
        case "missing-sign":
            return <MissingSignBoard state={state} round={round} middle={middle} />;
        default:
            return (
                <>
                    <BalanceBoard state={state} round={round} />
                    {middle}
                </>
            );
    }
}

interface BoardProps<Round> {
    state: RoundBoardState;
    round: Round;
    middle: ReactNode;
}

// The slot of the hidden number or sign: a question mark, then what answered it.
function AnswerSlot({ state, children }: { state: RoundBoardState; children: (option: RoundOption) => string }) {
    if (state.result === null) {
        return <span className="equation__slot">?</span>;
    }
    return <span className="equation__slot equation__slot--answered">{children(RoundGameUtils.getShownOption(state.result))}</span>;
}

function NumberChoices({ state }: { state: RoundBoardState }) {
    return <RoundChoices state={state} label={Messages.getLabels().chooseAnswer} variant="numbers" renderOption={(option) => String(option)} />;
}

function CountingBoard({ state, round, middle }: BoardProps<CountingRound>) {
    return (
        <>
            <div className="round-picture" aria-hidden="true">
                <BonesPicture groups={round.groups} layout={round.layout} spots={round.spots} />
            </div>
            {middle}
            <NumberChoices state={state} />
        </>
    );
}

// With the ten frame, the part fills its spots; once answered, the missing ones fill in green.
function NumberBondsBoard({ state, round, middle }: BoardProps<NumberBondsRound>) {
    return (
        <>
            {round.hasFrame && (
                <div className="ten-frame" aria-hidden="true">
                    {Array.from({ length: NumberBondsGameUtils.getFrameSize() }, (_, index) => {
                        const isPart: boolean = index < round.part;
                        const isAnswer: boolean = !isPart && state.result !== null;
                        return (
                            <span
                                key={index}
                                className={`ten-frame__cell${isPart ? " ten-frame__cell--part" : ""}${isAnswer ? " ten-frame__cell--answer" : ""}`}
                            />
                        );
                    })}
                </div>
            )}
            <div className="equation" aria-hidden="true">
                <span className="equation__side">
                    <span>{round.part}</span>
                    <span className="equation__operator">+</span>
                    <AnswerSlot state={state}>{(option) => String(option)}</AnswerSlot>
                </span>
                <span className="equation__side">
                    <span className="equation__operator">=</span>
                    <span>{round.whole}</span>
                </span>
            </div>
            {middle}
            <NumberChoices state={state} />
        </>
    );
}

// The five numbers on a line with Faísca's jumps between them; once answered, each jump shows its step.
function SkipCountingBoard({ state, round, middle }: BoardProps<SkipCountingRound>) {
    return (
        <>
            <div className="jumps" aria-hidden="true">
                {round.numbers.map((number, index) => (
                    <span key={index} className="jumps__stop">
                        {index > 0 && <span className="jumps__arc">{state.result === null ? "" : `+${round.step}`}</span>}
                        {index === round.missingIndex ? (
                            <AnswerSlot state={state}>{(option) => String(option)}</AnswerSlot>
                        ) : (
                            <span className="jumps__number">{number}</span>
                        )}
                    </span>
                ))}
            </div>
            {middle}
            <NumberChoices state={state} />
        </>
    );
}

// The four signs, each in its operation's colour.
function MissingSignBoard({ state, round, middle }: BoardProps<MissingSignRound>) {
    return (
        <>
            <div className="equation" aria-hidden="true">
                <span className="equation__side">
                    <span>{round.left}</span>
                    <AnswerSlot state={state}>{(option) => OperationsUtils.getSymbol(option as Operation)}</AnswerSlot>
                    <span>{round.right}</span>
                </span>
                <span className="equation__side">
                    <span className="equation__operator">=</span>
                    <span>{round.result}</span>
                </span>
            </div>
            {middle}
            <RoundChoices
                state={state}
                label={Messages.getLabels().chooseSign}
                variant="signs"
                renderOption={(option) => OperationsUtils.getSymbol(option as Operation)}
                getOptionClassName={(option) => `choice--sign practice--${option}`}
            />
        </>
    );
}

const PAN_STATE_CLASS_NAMES: Record<RoundOptionState, string> = {
    idle: "",
    right: "balance__choice--right",
    tried: "balance__choice--tried",
    dimmed: "balance__choice--dimmed",
    hidden: "balance__choice--hidden"
};

// The pans are the options: tap the heavier one, or the = between them. Once answered the beam tips, and each pan
// shows what it weighs.
function BalanceBoard({ state, round }: Omit<BoardProps<BalanceRound>, "middle">) {
    const labels: Labels = Messages.getLabels();
    const tilt: BalanceSide = state.result === null ? "equal" : round.answer;
    const renderOption = (side: BalanceSide) => {
        const optionState: RoundOptionState = RoundGameUtils.getOptionState(state, side);
        const pan: BalancePan | null = (() => {
            if (side === "equal") {
                return null;
            }
            return side === "left" ? round.leftPan : round.rightPan;
        })();
        return (
            <button
                key={side}
                type="button"
                className={`balance__choice balance__choice--${side} ${PAN_STATE_CLASS_NAMES[optionState]}`}
                aria-label={Messages.getRoundOptionLabel(round, side)}
                disabled={state.isDisabled || optionState !== "idle"}
                onClick={() => state.onChoose(side)}
            >
                {pan === null ? (
                    <span className="balance__equal">=</span>
                ) : (
                    <>
                        <span className="balance__calculation">{Messages.getPanText(pan)}</span>
                        {state.result !== null && pan.operation !== null && <span className="balance__value">= {BalanceGameUtils.getValue(pan)}</span>}
                    </>
                )}
                {optionState === "right" && <CheckIcon />}
            </button>
        );
    };

    return (
        <div className={`balance balance--tilt-${tilt}`} role="group" aria-label={labels.balance}>
            <div className="balance__stand" aria-hidden="true" />
            <div className="balance__beam" aria-hidden="true" />
            <div className="balance__choices">{BalanceGameUtils.getValidSides().map(renderOption)}</div>
        </div>
    );
}
