import { ClockUtils, type ClockDirection, type ClockReference, type ClockSettings } from "../utils/clock/utils.ts";
import { Messages } from "../utils/messages.ts";
import { TimeUtils } from "../utils/time/utils.ts";
import { SegmentedField } from "./SegmentedField.tsx";
import { SwitchField } from "./SwitchField.tsx";

interface ClockFieldProps {
    clock: ClockSettings;
    recordMilliseconds: number | null;
    onChange: (clock: ClockSettings) => void;
}

// Off by default. When on it counts up, towards 3 minutes or the child's record, or counts down from either.
export function ClockField({ clock, recordMilliseconds, onChange }: ClockFieldProps) {
    return (
        <div className="stack">
            <SwitchField
                label="Relógio"
                description="Para quem gosta de contar o tempo. Sem pressa!"
                isOn={clock.isEnabled}
                onChange={(isEnabled) => onChange({ ...clock, isEnabled })}
            />
            {clock.isEnabled && (
                <>
                    <SegmentedField<ClockDirection>
                        legend="Como conta?"
                        value={clock.direction}
                        options={ClockUtils.getValidDirections().map((direction) => ({
                            value: direction,
                            label: Messages.getClockDirectionLabel(direction),
                            detail: direction === "up" ? "0:00, 0:01…" : "3:00, 2:59…"
                        }))}
                        onChange={(direction) => onChange({ ...clock, direction })}
                    />
                    <SegmentedField<ClockReference>
                        legend="Contra o quê?"
                        value={clock.reference}
                        options={ClockUtils.getValidReferences().map((reference) => ({
                            value: reference,
                            label: Messages.getClockReferenceLabel(reference),
                            detail: (() => {
                                if (reference === "default") {
                                    return TimeUtils.formatElapsed(ClockUtils.getDefaultMilliseconds());
                                }
                                return recordMilliseconds === null ? "Ainda não tens" : TimeUtils.formatElapsed(recordMilliseconds);
                            })()
                        }))}
                        onChange={(reference) => onChange({ ...clock, reference })}
                    />
                </>
            )}
        </div>
    );
}
