import moment from "moment";

// Up: time spent so far. Down: time left until the reference, then the extra time, calmly.
export type ClockDirection = "up" | "down";

// What the clock measures against: a fixed default, or the child's best perfect session in this category.
export type ClockReference = "default" | "record";

export interface ClockSettings {
    isEnabled: boolean;
    direction: ClockDirection;
    reference: ClockReference;
}

export interface ClockReading {
    milliseconds: number;
    // Past the reference: shown as "+0:12" and never treated as a failure.
    isOvertime: boolean;
}

export class ClockUtils {
    public static getValidDirections(): ClockDirection[] {
        return ["up", "down"];
    }

    public static getValidReferences(): ClockReference[] {
        return ["default", "record"];
    }

    // On by default, counting up towards 3 minutes. It can always be switched off.
    public static createDefault(): ClockSettings {
        return { isEnabled: true, direction: "up", reference: "default" };
    }

    public static getDefaultMinutes(): number {
        return 3;
    }

    public static getDefaultMilliseconds(): number {
        return moment.duration(this.getDefaultMinutes(), "minutes").asMilliseconds();
    }

    // Without a record yet, the record reference falls back to the default time.
    public static getReferenceMilliseconds(settings: ClockSettings, recordMilliseconds: number | null): number {
        if (settings.reference === "record" && recordMilliseconds !== null) {
            return recordMilliseconds;
        }
        return this.getDefaultMilliseconds();
    }

    public static read(settings: ClockSettings, elapsedMilliseconds: number, referenceMilliseconds: number): ClockReading {
        const isOvertime: boolean = elapsedMilliseconds > referenceMilliseconds;
        if (settings.direction === "up") {
            return { milliseconds: elapsedMilliseconds, isOvertime };
        }
        return { milliseconds: Math.abs(referenceMilliseconds - elapsedMilliseconds), isOvertime };
    }
}
