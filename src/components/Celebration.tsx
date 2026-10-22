import { getSparkPath } from "./sparkPath.ts";

interface Spark {
    left: number;
    top: number;
    size: number;
    delay: number;
}

// Fixed spots so every party looks the same and nothing depends on chance.
const SPARKS: Spark[] = [
    { left: 6, top: 30, size: 22, delay: 0 },
    { left: 22, top: 6, size: 16, delay: 120 },
    { left: 44, top: 18, size: 26, delay: 60 },
    { left: 66, top: 4, size: 18, delay: 180 },
    { left: 84, top: 26, size: 24, delay: 90 },
    { left: 94, top: 60, size: 14, delay: 220 },
    { left: 2, top: 70, size: 14, delay: 260 }
];

// A burst of sparks for the big moments only: a coin, a new level, an unlocked challenge, the end of a session.
export function Celebration() {
    return (
        <div className="celebration" aria-hidden="true">
            {SPARKS.map((spark) => (
                <svg
                    key={`${spark.left}-${spark.top}`}
                    className="celebration__spark"
                    viewBox="0 0 24 24"
                    style={{ left: `${spark.left}%`, top: `${spark.top}%`, width: spark.size, height: spark.size, animationDelay: `${spark.delay}ms` }}
                >
                    <path d={getSparkPath(12, 12, 11)} fill="#ffc83d" stroke="#dfa200" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
            ))}
        </div>
    );
}
