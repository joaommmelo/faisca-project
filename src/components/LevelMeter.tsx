import { LevelsUtils, type TrackProgress } from "../utils/levels/utils.ts";
import { Messages } from "../utils/messages.ts";
import { StarIcon } from "./Icons.tsx";

interface LevelMeterProps {
    track: TrackProgress;
}

// The level as a marker of progress: a badge and how far into it the child already is.
export function LevelMeter({ track }: LevelMeterProps) {
    const progress: number = LevelsUtils.getLevelProgress(track);

    return (
        <div className="level-meter">
            <span className="level-badge">
                <StarIcon />
                {Messages.getLevelName(track.level)}
            </span>
            <div
                className="meter"
                role="progressbar"
                aria-label={`Progresso no ${Messages.getLevelName(track.level).toLocaleLowerCase("pt-PT")}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress * 100)}
            >
                <div className="meter__fill" style={{ transform: `scaleX(${progress})` }} />
            </div>
        </div>
    );
}
