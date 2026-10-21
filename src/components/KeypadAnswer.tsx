import { useState, type ReactNode } from "react";
import { KeypadUtils } from "../utils/keypad/utils.ts";
import type { Question } from "../utils/questions/utils.ts";
import type { AnswerRecord, AttemptOutcome } from "../utils/session/utils.ts";
import { Equation } from "./Equation.tsx";
import { NumericKeypad } from "./NumericKeypad.tsx";

interface KeypadAnswerProps {
    question: Question;
    record: AnswerRecord | null;
    help: ReactNode;
    onSubmit: (givenAnswer: number) => AttemptOutcome;
}

// Typing the answer. Mount it with a key per question so every question starts empty.
export function KeypadAnswer({ question, record, help, onSubmit }: KeypadAnswerProps) {
    const [typedAnswer, setTypedAnswer] = useState<string>("");

    const confirm = (): void => {
        if (onSubmit(Number(typedAnswer)) === "try-again") {
            setTypedAnswer("");
        }
    };

    return (
        <>
            <Equation question={question} typedAnswer={typedAnswer} isAnswered={record !== null} />
            {help}
            <NumericKeypad
                announcement={typedAnswer.length === 0 ? "Ainda sem resposta" : `A tua resposta: ${typedAnswer}`}
                canConfirm={KeypadUtils.canConfirm(typedAnswer)}
                isDisabled={record !== null}
                onDigit={(digit) => setTypedAnswer(KeypadUtils.appendDigit(typedAnswer, String(digit)))}
                onErase={() => setTypedAnswer(KeypadUtils.eraseDigit(typedAnswer))}
                onConfirm={confirm}
            />
        </>
    );
}
