import { useId, useRef } from "react";
import type { Labels } from "../copy/copy.ts";
import { Messages, type Feedback } from "../utils/messages.ts";
import { StarsUtils, type StarsProgress } from "../utils/stars/utils.ts";
import { CheckIcon, StarIcon } from "./Icons.tsx";
import { MascotMessage } from "./Mascot.tsx";
import { Sheet } from "./Sheet.tsx";
import { StarsMeter } from "./StarsMeter.tsx";

interface StarButtonProps {
    progress: StarsProgress;
    onOpen: () => void;
}

// The child's stars, with a thin bar to the next one; touching them opens the sheet that says what is left. Only a
// button, so it can sit inside the greeting next to the child's name; the sheet opens outside it.
export function StarButton({ progress, onOpen }: StarButtonProps) {
    const labels: Labels = Messages.getLabels();

    return (
        <button type="button" className="coin-pill coin-pill--button star-pill" onClick={onOpen}>
            <StarIcon />
            <span aria-hidden="true">{progress.stars}</span>
            <span className="visually-hidden">{`${labels.starsCount(progress.stars)}. ${labels.seeStars}`}</span>
            <span className="star-pill__bar" aria-hidden="true">
                <span className="star-pill__fill" style={{ transform: `scaleX(${StarsUtils.getProgressRatio(progress)})` }} />
            </span>
        </button>
    );
}

interface StarsSheetProps {
    progress: StarsProgress;
    onClose: () => void;
}

export function StarsSheet({ progress, onClose }: StarsSheetProps) {
    const titleId: string = useId();
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const help: Feedback = Messages.getStarsHelp(progress);

    return (
        <Sheet titleId={titleId} initialFocusRef={closeButtonRef} onClose={onClose}>
            <MascotMessage mood="proud" size={72}>
                <span id={titleId}>{help.title}</span>
            </MascotMessage>
            <StarsMeter progress={progress} />
            <ul className="level-help">
                {help.lines.map((line) => (
                    <li key={line}>{line}</li>
                ))}
            </ul>
            <button ref={closeButtonRef} type="button" className="button button--primary button--block" onClick={onClose}>
                <CheckIcon />
                {Messages.getLabels().gotIt}
            </button>
        </Sheet>
    );
}
