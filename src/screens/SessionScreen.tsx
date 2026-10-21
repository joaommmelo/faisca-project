import moment from "moment";
import { useEffect, useEffectEvent, useId, useRef, useState } from "react";
import { ChoiceOptions } from "../components/ChoiceOptions.tsx";
import { Equation } from "../components/Equation.tsx";
import { FeedbackSheet } from "../components/FeedbackSheet.tsx";
import { CloseIcon } from "../components/Icons.tsx";
import { MascotMessage } from "../components/Mascot.tsx";
import { NumericKeypad } from "../components/NumericKeypad.tsx";
import { Stopwatch } from "../components/Stopwatch.tsx";
import type { LeitnerBoxes } from "../utils/leitner/utils.ts";
import type { Profile } from "../utils/profiles/utils.ts";
import type { Question } from "../utils/questions/utils.ts";
import { SessionUtils, type AnswerRecord, type Session, type SessionOutcome } from "../utils/session/utils.ts";

// Long enough to read the praise, short enough to keep the rhythm. Misses always wait for "Seguinte".
const PRAISE_DISPLAY_MILLISECONDS: number = 1500;

interface SessionScreenProps {
    profile: Profile;
    onBoxesChange: (boxes: LeitnerBoxes) => void;
    onFinish: (outcome: SessionOutcome) => void;
    onExit: () => void;
}

export function SessionScreen({ profile, onBoxesChange, onFinish, onExit }: SessionScreenProps) {
    const exitTitleId: string = useId();
    const questionHeadingRef = useRef<HTMLHeadingElement>(null);
    const [session, setSession] = useState<Session>(() =>
        SessionUtils.create({ tables: profile.settings.tables, mode: profile.settings.mode, boxes: profile.boxes })
    );
    const [startedAt] = useState<number>(() => moment().valueOf());
    const [typedAnswer, setTypedAnswer] = useState<string>("");
    const [isExitConfirmOpen, setIsExitConfirmOpen] = useState<boolean>(false);

    const question: Question = SessionUtils.getCurrentQuestion(session);
    const record: AnswerRecord | null = SessionUtils.getCurrentRecord(session);

    const submitAnswer = (givenAnswer: number): void => {
        const result = SessionUtils.submitAnswer(session, givenAnswer, { boxes: profile.boxes });
        setSession(result.session);
        onBoxesChange(result.boxes);
    };

    const goToNextQuestion = (): void => {
        const nextSession: Session = SessionUtils.advance(session);
        if (SessionUtils.isFinished(nextSession)) {
            onFinish({
                summary: SessionUtils.getSummary(nextSession),
                elapsedMilliseconds: profile.settings.isTimerEnabled ? moment().diff(startedAt) : null
            });
            return;
        }
        setTypedAnswer("");
        setSession(nextSession);
    };

    const continueAfterPraise = useEffectEvent(() => goToNextQuestion());

    useEffect(() => {
        if (record === null || !record.isCorrect || isExitConfirmOpen) {
            return;
        }
        const timeoutId: number = window.setTimeout(() => continueAfterPraise(), PRAISE_DISPLAY_MILLISECONDS);
        return () => window.clearTimeout(timeoutId);
    }, [record, isExitConfirmOpen]);

    useEffect(() => {
        if (isExitConfirmOpen || questionHeadingRef.current === null) {
            return;
        }
        questionHeadingRef.current.focus();
    }, [session.currentIndex, isExitConfirmOpen]);

    return (
        <main className="screen">
            <header className="session-header">
                <button type="button" className="icon-button" aria-label="Sair do jogo" onClick={() => setIsExitConfirmOpen(true)}>
                    <CloseIcon />
                </button>
                <p className="session-header__label">
                    {question.isRetry ? (
                        <span className="retry-badge">Outra vez</span>
                    ) : (
                        `Pergunta ${SessionUtils.getFirstTryPosition(session)} de ${SessionUtils.getFirstTryTotal(session)}`
                    )}
                </p>
                {profile.settings.isTimerEnabled ? <Stopwatch startedAt={startedAt} /> : <span />}
            </header>

            <div
                className="progress-bar"
                role="progressbar"
                aria-label="Progresso do jogo"
                aria-valuemin={0}
                aria-valuemax={session.questions.length}
                aria-valuenow={session.records.length}
            >
                <div className="progress-bar__fill" style={{ width: `${(session.records.length / session.questions.length) * 100}%` }} />
            </div>

            {isExitConfirmOpen ? (
                <section className="card stack" role="alertdialog" aria-labelledby={exitTitleId}>
                    <MascotMessage mood="encourage" size={72}>
                        <span id={exitTitleId}>Queres sair do jogo?</span>
                    </MascotMessage>
                    <p className="hint">O que já fizeste fica guardado.</p>
                    <div className="actions-row">
                        <button type="button" className="button button--primary" autoFocus onClick={() => setIsExitConfirmOpen(false)}>
                            Continuar a jogar
                        </button>
                        <button type="button" className="button button--secondary" onClick={onExit}>
                            Sair
                        </button>
                    </div>
                </section>
            ) : (
                <div className="session-body">
                    <Equation question={question} typedAnswer={typedAnswer} isAnswered={record !== null} headingRef={questionHeadingRef} />
                    {question.format === "choice" ? (
                        <ChoiceOptions options={question.options} answer={question.answer} record={record} onChoose={submitAnswer} />
                    ) : (
                        <NumericKeypad
                            value={typedAnswer}
                            isDisabled={record !== null}
                            onChange={setTypedAnswer}
                            onConfirm={() => submitAnswer(Number(typedAnswer))}
                        />
                    )}
                    {record !== null && (
                        <FeedbackSheet key={session.currentIndex} record={record} praiseVariant={session.records.length} onContinue={goToNextQuestion} />
                    )}
                </div>
            )}
        </main>
    );
}
