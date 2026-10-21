import { Messages } from "../utils/messages.ts";
import { OperationsUtils } from "../utils/operations/utils.ts";
import type { Question } from "../utils/questions/utils.ts";
import type { VerticalColumn, VerticalEntry } from "../utils/vertical/utils.ts";

interface VerticalProblemProps {
    question: Question;
    columns: VerticalColumn[];
    entry: VerticalEntry;
    wrongColumns: number[];
    highlightedColumn: number | null;
    revealedMarks: number[];
    isAnswered: boolean;
    onSelectCell: (column: number) => void;
}

// A written sum: the two numbers with the operator on the left, the line, and one cell per digit for the result.
// Above them, only once the help shows it, the 1 that comes in or the borrow. Columns are stored units first and drawn left to right.
export function VerticalProblem({ question, columns, entry, wrongColumns, highlightedColumn, revealedMarks, isAnswered, onSelectCell }: VerticalProblemProps) {
    const drawnColumns: number[] = columns.map((_, column) => column).reverse();
    const isAddition: boolean = question.operation === "addition";
    const getColumnClassName = (column: number): string => {
        const classNames: string[] = ["vertical__cell"];
        if (wrongColumns.includes(column)) {
            classNames.push("vertical__cell--wrong");
        }
        if (highlightedColumn === column) {
            classNames.push("vertical__cell--highlighted");
        }
        return classNames.join(" ");
    };
    const getMarkText = (column: number): string => {
        if (!revealedMarks.includes(column)) {
            return "";
        }
        if (columns[column].workingTop !== null) {
            return String(columns[column].workingTop);
        }
        return columns[column].carryIn ? "1" : "";
    };

    return (
        <div className="vertical" style={{ gridTemplateColumns: `auto repeat(${columns.length}, var(--vertical-cell))` }}>
            {revealedMarks.length > 0 && (
                <>
                    <span className="vertical__operator" aria-hidden="true" />
                    {drawnColumns.map((column) => (
                        <span key={`mark-${column}`} className="vertical__mark" aria-hidden="true">
                            {getMarkText(column)}
                        </span>
                    ))}
                </>
            )}

            <span className="vertical__operator" aria-hidden="true" />
            {drawnColumns.map((column) => (
                <span
                    key={`top-${column}`}
                    className={`${getColumnClassName(column)} vertical__digit${revealedMarks.includes(column) && columns[column].workingTop !== null && !isAddition ? " vertical__digit--crossed" : ""}`}
                    aria-hidden="true"
                >
                    {columns[column].top ?? ""}
                </span>
            ))}

            <span className="vertical__operator" aria-hidden="true">
                {OperationsUtils.getSymbol(question.operation)}
            </span>
            {drawnColumns.map((column) => (
                <span key={`bottom-${column}`} className={`${getColumnClassName(column)} vertical__digit`} aria-hidden="true">
                    {columns[column].bottom ?? ""}
                </span>
            ))}

            <span className="vertical__line" aria-hidden="true" />

            <span className="vertical__operator" aria-hidden="true" />
            {drawnColumns.map((column) => {
                const digit: number | null = entry.digits[column];
                const stateClassNames: string = [
                    !isAnswered && entry.cursor === column ? "vertical__result--cursor" : "",
                    isAnswered && digit !== null && !wrongColumns.includes(column) ? "vertical__result--answered" : "",
                    isAddition && column === columns.length - 1 ? "vertical__result--spare" : ""
                ].join(" ");
                return (
                    <button
                        key={`result-${column}`}
                        type="button"
                        className={`${getColumnClassName(column)} vertical__result ${stateClassNames}`}
                        aria-label={`Casa das ${Messages.getColumnName(column)}${digit === null ? ", vazia" : `: ${digit}`}`}
                        aria-current={!isAnswered && entry.cursor === column ? "true" : undefined}
                        disabled={isAnswered}
                        onClick={() => onSelectCell(column)}
                    >
                        {digit ?? ""}
                    </button>
                );
            })}
        </div>
    );
}
