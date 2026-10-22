import { Messages, type ClockRecordRule } from "../utils/messages.ts";
import type { ClockOutcome } from "../utils/progression/utils.ts";
import { TimeUtils } from "../utils/time/utils.ts";
import { ClockIcon } from "./Icons.tsx";

interface ClockResultCardProps {
    clock: ClockOutcome;
    recordRule?: ClockRecordRule;
}

// The time of a game that ran with the clock on, and something kind about it.
export function ClockResultCard({ clock, recordRule = "perfect" }: ClockResultCardProps) {
    return (
        <section className={clock.isNewRecord ? "card clock-result clock-result--record" : "card clock-result"} aria-label={Messages.getLabels().time}>
            <p className="clock-result__time">
                <ClockIcon />
                {TimeUtils.formatElapsed(clock.elapsedMilliseconds)}
            </p>
            {Messages.getClockOutcomeLines(clock, recordRule).map((line) => (
                <p key={line} className="clock-result__line">
                    {line}
                </p>
            ))}
        </section>
    );
}
