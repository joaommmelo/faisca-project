import { useState, type ReactNode } from "react";
import { HelpsUtils, type VerticalHelpStep } from "../utils/helps/utils.ts";
import { Messages } from "../utils/messages.ts";
import type { Question } from "../utils/questions/utils.ts";
import type { AnswerRecord, AttemptOutcome } from "../utils/session/utils.ts";
import { VerticalUtils, type VerticalColumn, type VerticalEntry } from "../utils/vertical/utils.ts";
import { HelpButton, type HelpControl } from "./HelpButton.tsx";
import { HintBubble } from "./HintBubble.tsx";
import { NumericKeypad } from "./NumericKeypad.tsx";
import { VerticalProblem } from "./VerticalProblem.tsx";

interface VerticalAnswerProps {
    question: Question;
    record: AnswerRecord | null;
    // The second-chance note, shown right under the sum.
    tryAgainNote: ReactNode;
    help: HelpControl;
    // The exit sheet is open: keys typed meanwhile do not reach the cells.
    isPaused: boolean;
    onSubmit: (givenAnswer: number) => AttemptOutcome;
}

interface HelpProgress {
    column: number;
    stepIndex: number;
}

// Writing a sum in columns. Mount it with a key per question so every question starts with empty cells.
export function VerticalAnswer({ question, record, tryAgainNote, help, isPaused, onSubmit }: VerticalAnswerProps) {
    const columns: VerticalColumn[] = VerticalUtils.getColumns(question);
    const [entry, setEntry] = useState<VerticalEntry>(() => VerticalUtils.createEntry(columns.length));
    const [wrongColumns, setWrongColumns] = useState<number[]>([]);
    const [helpProgress, setHelpProgress] = useState<HelpProgress | null>(null);
    const [revealedMarks, setRevealedMarks] = useState<number[]>([]);
    const isAnswered: boolean = record !== null;

    const confirm = (): void => {
        const givenAnswer: number = VerticalUtils.getValue(entry);
        const wrong: number[] = VerticalUtils.getWrongColumns(givenAnswer, question.answer, columns.length);
        const outcome: AttemptOutcome = onSubmit(givenAnswer);
        setHelpProgress(null);
        if (outcome === "try-again") {
            setWrongColumns(wrong);
            setEntry(VerticalUtils.clearColumns(entry, wrong));
            return;
        }
        if (outcome === "missed") {
            setWrongColumns(wrong);
            setEntry(VerticalUtils.fillAnswer(entry, question.answer));
            return;
        }
        setWrongColumns([]);
    };

    // Each press shows the next step on the column under the cursor; moving on starts again from the first step.
    const showNextHelpStep = (): void => {
        const column: number = entry.cursor;
        const steps: VerticalHelpStep[] = HelpsUtils.getVerticalSteps(columns[column]);
        const stepIndex: number = helpProgress !== null && helpProgress.column === column ? Math.min(helpProgress.stepIndex + 1, steps.length - 1) : 0;
        help.onUse();
        setHelpProgress({ column, stepIndex });

        const step: VerticalHelpStep = steps[stepIndex];
        const resultDigit: number | null = columns[column].result;
        if (step === "marks") {
            setRevealedMarks([...revealedMarks, ...VerticalUtils.getHelpMarkColumns(columns, column)]);
        }
        if (step === "digit" && resultDigit !== null) {
            setEntry(VerticalUtils.revealDigit(entry, column, resultDigit));
            if (columns[column].carryOut) {
                setRevealedMarks([...revealedMarks, column + 1]);
            }
        }
    };

    const hintText: string | null = (() => {
        if (helpProgress === null || isAnswered) {
            return null;
        }
        const steps: VerticalHelpStep[] = HelpsUtils.getVerticalSteps(columns[helpProgress.column]);
        return Messages.getVerticalHint(question, columns[helpProgress.column], helpProgress.column, steps[helpProgress.stepIndex]);
    })();
    const value: number = VerticalUtils.getValue(entry);

    return (
        <>
            <VerticalProblem
                question={question}
                columns={columns}
                entry={entry}
                wrongColumns={wrongColumns}
                highlightedColumn={helpProgress === null || isAnswered ? null : helpProgress.column}
                revealedMarks={revealedMarks}
                isAnswered={isAnswered}
                onSelectCell={(column) => setEntry(VerticalUtils.moveCursor(entry, column))}
            />
            {tryAgainNote}
            {!isAnswered && <HelpButton control={{ ...help, onUse: showNextHelpStep }} />}
            {hintText !== null && <HintBubble text={hintText} />}
            <NumericKeypad
                announcement={entry.digits.every((digit) => digit === null) ? "Ainda sem resposta" : `A tua resposta: ${value}`}
                canConfirm={VerticalUtils.canConfirm(entry)}
                isDisabled={isAnswered || isPaused}
                onDigit={(digit) => setEntry(VerticalUtils.typeDigit(entry, digit))}
                onErase={() => setEntry(VerticalUtils.erase(entry))}
                onConfirm={confirm}
            />
        </>
    );
}
