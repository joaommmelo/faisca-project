import { Messages } from "../utils/messages.ts";
import { OperationsUtils } from "../utils/operations/utils.ts";
import type { Practice } from "../utils/profiles/utils.ts";

interface PracticeTilesProps {
    summaries: Record<Practice, string>;
    onChoose: (practice: Practice) => void;
}

// The main menu: one big tile per operation, plus the mix. Each opens its own screen before playing.
export function PracticeTiles({ summaries, onChoose }: PracticeTilesProps) {
    return (
        <nav aria-label={Messages.getLabels().whatToPractise}>
            <ul className="practices">
                {OperationsUtils.getValidOperations().map((operation) => (
                    <li key={operation}>
                        <button type="button" className={`practice practice--${operation}`} onClick={() => onChoose(operation)}>
                            <span className="practice__symbol" aria-hidden="true">
                                {OperationsUtils.getSymbol(operation)}
                            </span>
                            <span className="practice__name">{Messages.getOperationName(operation)}</span>
                            <span className="practice__summary">{summaries[operation]}</span>
                        </button>
                    </li>
                ))}
                <li className="practices__mix">
                    <button type="button" className="practice practice--mix" onClick={() => onChoose("mix")}>
                        <span className="practice__symbol practice__symbol--mix" aria-hidden="true">
                            {OperationsUtils.getValidOperations().map((operation) => (
                                <span key={operation}>{OperationsUtils.getSymbol(operation)}</span>
                            ))}
                        </span>
                        <span className="practice__name">{Messages.getMixName()}</span>
                        <span className="practice__summary">{summaries.mix}</span>
                    </button>
                </li>
            </ul>
        </nav>
    );
}
