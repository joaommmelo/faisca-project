import type { ReactNode } from "react";
import { getSparkPath } from "./sparkPath.ts";

export type MascotMood = "happy" | "cheer" | "encourage" | "proud";

const MASCOT_COLORS = {
    fur: "#a8683f",
    furDark: "#6e3f22",
    cream: "#f6ddbb",
    ink: "#2a1a10",
    tongue: "#f27c8d",
    collar: "#1f5fd1",
    spark: "#ffc83d",
    sparkEdge: "#dfa200"
};

interface MascotProps {
    mood: MascotMood;
    size: number;
}

// Faísca: a brown dog with floppy ears, a cream blaze and a blue collar with a spark-shaped tag.
export function Mascot({ mood, size }: MascotProps) {
    const hasHappyEyes: boolean = mood === "cheer" || mood === "proud";
    const hasOpenMouth: boolean = mood === "happy" || mood === "cheer";

    return (
        <svg className={`mascot mascot--${mood}`} width={size} height={size} viewBox="0 0 160 160" aria-hidden="true" focusable="false">
            {mood === "cheer" && (
                <g>
                    <path className="mascot__spark" d={getSparkPath(22, 30, 9)} fill={MASCOT_COLORS.spark} stroke={MASCOT_COLORS.sparkEdge} strokeWidth="1.5" />
                    <path
                        className="mascot__spark"
                        d={getSparkPath(140, 22, 11)}
                        fill={MASCOT_COLORS.spark}
                        stroke={MASCOT_COLORS.sparkEdge}
                        strokeWidth="1.5"
                    />
                    <path
                        className="mascot__spark"
                        d={getSparkPath(150, 66, 6)}
                        fill={MASCOT_COLORS.spark}
                        stroke={MASCOT_COLORS.sparkEdge}
                        strokeWidth="1.5"
                    />
                </g>
            )}
            {mood === "proud" && <path d={getSparkPath(140, 24, 11)} fill={MASCOT_COLORS.spark} stroke={MASCOT_COLORS.sparkEdge} strokeWidth="1.5" />}

            <g transform={mood === "encourage" ? "rotate(-8 80 110)" : undefined}>
                <ellipse cx="80" cy="142" rx="40" ry="30" fill={MASCOT_COLORS.fur} />
                <ellipse cx="80" cy="152" rx="18" ry="14" fill={MASCOT_COLORS.cream} />

                <ellipse cx="80" cy="80" rx="42" ry="40" fill={MASCOT_COLORS.fur} />
                <path d="M80 44 C 75 56, 72 72, 70 90 L 90 90 C 88 72, 85 56, 80 44 Z" fill={MASCOT_COLORS.cream} />
                <ellipse cx="80" cy="102" rx="25" ry="19" fill={MASCOT_COLORS.cream} />

                <path d="M54 46 C 34 38, 16 60, 22 94 C 25 108, 41 110, 45 96 C 49 82, 48 64, 58 54 Z" fill={MASCOT_COLORS.furDark} />
                <path d="M106 46 C 126 38, 144 60, 138 94 C 135 108, 119 110, 115 96 C 111 82, 112 64, 102 54 Z" fill={MASCOT_COLORS.furDark} />

                {mood === "encourage" && (
                    <g stroke={MASCOT_COLORS.furDark} strokeWidth="3" strokeLinecap="round" fill="none">
                        <path d="M56 66 Q63 62 70 60" />
                        <path d="M104 66 Q97 62 90 60" />
                    </g>
                )}

                {hasHappyEyes ? (
                    <g stroke={MASCOT_COLORS.ink} strokeWidth="3.5" strokeLinecap="round" fill="none">
                        <path d="M57 78 Q64 70 71 78" />
                        <path d="M89 78 Q96 70 103 78" />
                    </g>
                ) : (
                    <g>
                        <circle cx="64" cy="76" r="6.5" fill={MASCOT_COLORS.ink} />
                        <circle cx="96" cy="76" r="6.5" fill={MASCOT_COLORS.ink} />
                        <circle cx="66.5" cy="73.5" r="2.2" fill="#ffffff" />
                        <circle cx="98.5" cy="73.5" r="2.2" fill="#ffffff" />
                    </g>
                )}

                <ellipse cx="80" cy="93" rx="9" ry="6.5" fill={MASCOT_COLORS.ink} />
                <ellipse cx="77" cy="91" rx="3" ry="1.6" fill="#ffffff" opacity="0.6" />
                <path d="M80 99 L80 104" stroke={MASCOT_COLORS.ink} strokeWidth="2.5" strokeLinecap="round" />

                {hasOpenMouth ? (
                    <g>
                        <path
                            d={mood === "cheer" ? "M65 104 Q80 128 95 104 Q80 110 65 104 Z" : "M67 104 Q80 121 93 104 Q80 109 67 104 Z"}
                            fill={MASCOT_COLORS.ink}
                        />
                        <ellipse cx="80" cy={mood === "cheer" ? 114 : 111} rx="6" ry="4" fill={MASCOT_COLORS.tongue} />
                    </g>
                ) : (
                    <path d="M68 104 Q74 110 80 104 Q86 110 92 104" stroke={MASCOT_COLORS.ink} strokeWidth="2.5" strokeLinecap="round" fill="none" />
                )}

                <path d="M54 118 Q80 134 106 118" stroke={MASCOT_COLORS.collar} strokeWidth="9" strokeLinecap="round" fill="none" />
                <path d={getSparkPath(80, 134, 9)} fill={MASCOT_COLORS.spark} stroke={MASCOT_COLORS.sparkEdge} strokeWidth="1.5" />
            </g>
        </svg>
    );
}

interface MascotMessageProps {
    mood: MascotMood;
    size: number;
    isStacked?: boolean;
    children: ReactNode;
}

export function MascotMessage({ mood, size, isStacked = false, children }: MascotMessageProps) {
    return (
        <div className={isStacked ? "mascot-message mascot-message--stacked" : "mascot-message"}>
            <Mascot mood={mood} size={size} />
            <p className="bubble">{children}</p>
        </div>
    );
}
