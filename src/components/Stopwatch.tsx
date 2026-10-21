import moment from "moment";
import { useEffect, useState } from "react";
import { TimeUtils } from "../utils/time/utils.ts";
import { ClockIcon } from "./Icons.tsx";

interface StopwatchProps {
    startedAt: number;
}

// Counts up, never down: it shows time spent, it does not pressure.
export function Stopwatch({ startedAt }: StopwatchProps) {
    const [elapsedMilliseconds, setElapsedMilliseconds] = useState<number>(() => moment().diff(startedAt));

    useEffect(() => {
        const intervalId: number = window.setInterval(() => setElapsedMilliseconds(moment().diff(startedAt)), 1000);
        return () => window.clearInterval(intervalId);
    }, [startedAt]);

    return (
        <span className="stopwatch" role="timer">
            <ClockIcon />
            <span className="visually-hidden">Tempo: </span>
            {TimeUtils.formatElapsed(elapsedMilliseconds)}
        </span>
    );
}
