import moment from "moment";
import { useEffect, useState } from "react";
import { ClockUtils, type ClockReading, type ClockSettings } from "../utils/clock/utils.ts";
import { Messages } from "../utils/messages.ts";
import { TimeUtils } from "../utils/time/utils.ts";
import { ClockIcon } from "./Icons.tsx";

interface SessionClockProps {
    startedAt: number;
    settings: ClockSettings;
    referenceMilliseconds: number;
    hasRecord: boolean;
}

// Counts up or down against a reference. Past it, the clock calmly shows the extra time; the game goes on.
export function SessionClock({ startedAt, settings, referenceMilliseconds, hasRecord }: SessionClockProps) {
    const [elapsedMilliseconds, setElapsedMilliseconds] = useState<number>(() => moment().diff(startedAt));

    useEffect(() => {
        const intervalId: number = window.setInterval(() => setElapsedMilliseconds(moment().diff(startedAt)), 1000);
        return () => window.clearInterval(intervalId);
    }, [startedAt]);

    const reading: ClockReading = ClockUtils.read(settings, elapsedMilliseconds, referenceMilliseconds);

    return (
        <p className={reading.isOvertime ? "session-clock session-clock--overtime" : "session-clock"} role="timer">
            <ClockIcon />
            <span className="session-clock__time">
                {reading.isOvertime && settings.direction === "down" ? "+" : ""}
                {TimeUtils.formatElapsed(reading.milliseconds)}
            </span>
            <span className="session-clock__note">{Messages.getClockNote(settings, referenceMilliseconds, hasRecord, reading.isOvertime)}</span>
        </p>
    );
}
