import type { ReactElement } from "react";

interface FactorEquationProps {
    target: number;
    // The factors picked so far (none, one or both), the pair just missed, or the multiplication shown once answered.
    factors: number[];
    isAnswered: boolean;
    // The pair just missed stays in view, crossed out like a wrong option in multiple choice, until the next tap.
    isMissed: boolean;
    // The factor the help put in the first slot, shown in the help's colour.
    hintedFactor: number | null;
}

// "? × ? = 24": two slots, filled from the left. The next one to fill stands out. The spoken version lives in the
// screen's heading.
export function FactorEquation({ target, factors, isAnswered, isMissed, hintedFactor }: FactorEquationProps) {
    const getSlotClassName = (index: number): string => {
        if (isAnswered) {
            return "equation__slot equation__slot--answered";
        }
        if (isMissed) {
            return "equation__slot equation__slot--missed";
        }
        if (index === 0 && factors.length > 0 && factors[0] === hintedFactor) {
            return "equation__slot equation__slot--hinted";
        }
        if (index < factors.length) {
            return "equation__slot equation__slot--filled";
        }
        return index === factors.length ? "equation__slot equation__slot--next" : "equation__slot";
    };
    const slots: ReactElement[] = [0, 1].map((index) => (
        <span key={index} className={getSlotClassName(index)}>
            {index < factors.length ? factors[index] : "?"}
        </span>
    ));

    return (
        <div className="equation equation--multiplication" aria-hidden="true">
            <span className="equation__side">
                {slots[0]}
                <span className="equation__operator">×</span>
                {slots[1]}
            </span>
            <span className="equation__side">
                <span className="equation__operator">=</span>
                <span>{target}</span>
            </span>
        </div>
    );
}
