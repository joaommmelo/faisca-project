import type { Labels } from "../copy/copy.ts";
import { Messages } from "../utils/messages.ts";
import { StarsUtils, type StarsProgress } from "../utils/stars/utils.ts";
import { StarIcon } from "./Icons.tsx";

interface StarsMeterProps {
    progress: StarsProgress;
}

// The stars so far and how far towards the next one, in gold like the coins.
export function StarsMeter({ progress }: StarsMeterProps) {
    const labels: Labels = Messages.getLabels();
    const ratio: number = StarsUtils.getProgressRatio(progress);

    return (
        <div className="stars-meter">
            <span className="stars-meter__count">
                <StarIcon />
                <span aria-hidden="true">{progress.stars}</span>
                <span className="visually-hidden">{labels.starsCount(progress.stars)}</span>
            </span>
            <div
                className="meter"
                role="progressbar"
                aria-label={labels.starsProgress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(ratio * 100)}
            >
                <div className="meter__fill" style={{ transform: `scaleX(${ratio})` }} />
            </div>
        </div>
    );
}
