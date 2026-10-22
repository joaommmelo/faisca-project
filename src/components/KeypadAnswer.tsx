import { useState, type ReactNode } from "react";
import { KeypadUtils } from "../utils/keypad/utils.ts";
import type { Question } from "../utils/questions/utils.ts";
import type { AnswerRecord, AttemptOutcome } from "../utils/session/utils.ts";
import { Equation } from "./Equation.tsx";
import { NumericKeypad } from "./NumericKeypad.tsx";

interface KeypadAnswerProps {
    question: Question;
    record: AnswerRecord | null;
    // The second-chance note, shown right under the question.
    tryAgainNote: ReactNode;
    help: ReactNode;
    // The exit sheet is open: keys typed meanwhile do not reach the answer.
    isPaused: boolean;
    onSubmit: (givenAnswer: number) => AttemptOutcome;
}

// Typing the answer. Mount it with a key per question so every question starts empty.
export function KeypadAnswer({ question, record, tryAgainNote, help, isPaused, onSubmit }: KeypadAnswerProps) {
    const [typedAnswer, setTypedAnswer] = useState<string>("");

    const confirm = (): void => {
        if (onSubmit(Number(typedAnswer)) === "try-again") {
            setTypedAnswer("");
        }
    };

    return (
        <>
            <Equation question={question} typedAnswer={typedAnswer} isAnswered={record !== null} />
            {tryAgainNote}
            {help}
            <NumericKeypad
                announcement={typedAnswer.length === 0 ? "Ainda sem resposta" : `A tua resposta: ${typedAnswer}`}
                canConfirm={KeypadUtils.canConfirm(typedAnswer)}
                isDisabled={record !== null || isPaused}
                onDigit={(digit) => setTypedAnswer(KeypadUtils.appendDigit(typedAnswer, String(digit), KeypadUtils.getMaxDigits()))}
                onErase={() => setTypedAnswer(KeypadUtils.eraseDigit(typedAnswer))}
                onConfirm={confirm}
            />
        </>
    );
}
