import { useId, useRef } from "react";
import type { Labels } from "../copy/copy.ts";
import type { Difficulty } from "../utils/difficulties/utils.ts";
import { Messages } from "../utils/messages.ts";
import type { UnlockRequirement, UnlockStep } from "../utils/progression/utils.ts";
import { CheckIcon } from "./Icons.tsx";
import { MascotMessage } from "./Mascot.tsx";
import { Sheet } from "./Sheet.tsx";

interface UnlockSheetProps {
    lockedDifficulty: Difficulty;
    requirement: UnlockRequirement;
    onClose: () => void;
}

// Touching a locked difficulty says what opens it: where to play, and a tick and a bar for each step, so a child
// who cannot read yet still sees how far there is to go.
export function UnlockSheet({ lockedDifficulty, requirement, onClose }: UnlockSheetProps) {
    const titleId: string = useId();
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const labels: Labels = Messages.getLabels();

    return (
        <Sheet titleId={titleId} initialFocusRef={closeButtonRef} onClose={onClose}>
            <MascotMessage mood={requirement.isReady ? "cheer" : "happy"} size={72}>
                <span id={titleId}>{Messages.getUnlockIntro(lockedDifficulty, requirement)}</span>
            </MascotMessage>
            <ul className="unlock-steps">
                {requirement.steps.map((step) => (
                    <UnlockStepItem key={step.kind} step={step} />
                ))}
            </ul>
            <button ref={closeButtonRef} type="button" className="button button--primary button--block" onClick={onClose}>
                <CheckIcon />
                {labels.gotIt}
            </button>
        </Sheet>
    );
}

function UnlockStepItem({ step }: { step: UnlockStep }) {
    return (
        <li className={step.isDone ? "unlock-step unlock-step--done" : "unlock-step"}>
            <span className="unlock-step__mark" aria-hidden="true">
                {step.isDone && <CheckIcon />}
            </span>
            <div className="unlock-step__body">
                <p className="unlock-step__text">{Messages.getUnlockStep(step)}</p>
                <div className="unlock-step__progress">
                    <div className="meter" aria-hidden="true">
                        <div className="meter__fill" style={{ transform: `scaleX(${step.current / step.needed})` }} />
                    </div>
                    <p className="unlock-step__count">{`${step.current} ${Messages.getLabels().outOf(step.needed)}`}</p>
                </div>
                {step.kind === "correct" && step.missingAnswers > 0 && (
                    <p className="unlock-step__note">{Messages.getUnlockMissingAnswers(step.missingAnswers)}</p>
                )}
            </div>
        </li>
    );
}
