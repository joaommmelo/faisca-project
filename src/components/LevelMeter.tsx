import { useId, useRef, useState } from "react";
import type { Labels } from "../copy/copy.ts";
import { LevelsUtils, type LevelEarning, type TrackProgress } from "../utils/levels/utils.ts";
import { Messages, type Feedback } from "../utils/messages.ts";
import { CheckIcon, LevelIcon } from "./Icons.tsx";
import { MascotMessage } from "./Mascot.tsx";
import { Sheet } from "./Sheet.tsx";

// What the "?" next to the bar explains: how the level earns its points, and the kind of question the next level
// opens, if any.
export interface LevelHelp {
    earning: LevelEarning;
    nextSkillName: string | null;
}

interface LevelMeterProps {
    track: TrackProgress;
    help?: LevelHelp;
}

// The level as a marker of progress: a badge and how far into it the child already is. With help, a "?" next to the
// bar says what is left to the next level.
export function LevelMeter({ track, help }: LevelMeterProps) {
    const labels: Labels = Messages.getLabels();
    const progress: number = LevelsUtils.getLevelProgress(track);
    const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

    return (
        <div className="level-meter">
            <span className="level-badge">
                <LevelIcon />
                {Messages.getLevelName(track.level)}
            </span>
            <div
                className="meter"
                role="progressbar"
                aria-label={labels.levelProgress(track.level)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress * 100)}
            >
                <div className="meter__fill" style={{ transform: `scaleX(${progress})` }} />
            </div>
            {help !== undefined && (
                <button type="button" className="level-meter__help" aria-label={labels.levelHelp(track.level + 1)} onClick={() => setIsHelpOpen(true)}>
                    ?
                </button>
            )}
            {help !== undefined && isHelpOpen && <LevelHelpSheet track={track} help={help} onClose={() => setIsHelpOpen(false)} />}
        </div>
    );
}

interface LevelHelpSheetProps {
    track: TrackProgress;
    help: LevelHelp;
    onClose: () => void;
}

function LevelHelpSheet({ track, help, onClose }: LevelHelpSheetProps) {
    const titleId: string = useId();
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const levelHelp: Feedback = Messages.getLevelHelp(track, help.earning, help.nextSkillName);

    return (
        <Sheet titleId={titleId} initialFocusRef={closeButtonRef} onClose={onClose}>
            <MascotMessage mood="happy" size={72}>
                <span id={titleId}>{levelHelp.title}</span>
            </MascotMessage>
            <ul className="level-help">
                {levelHelp.lines.map((line) => (
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
