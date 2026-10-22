import { Messages } from "../utils/messages.ts";
import { OperationsUtils, type Operation } from "../utils/operations/utils.ts";

interface PracticeTilesProps {
    summaries: Record<Operation, string>;
    onChoose: (operation: Operation) => void;
}

// The main menu: one big tile per operation. Each opens its own screen before playing.
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
            </ul>
        </nav>
    );
}
