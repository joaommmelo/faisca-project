import moment from "moment";
import { useEffect, useEffectEvent, useId, useRef, useState, type ReactNode } from "react";
import { ChoiceOptions } from "../components/ChoiceOptions.tsx";
import { Equation } from "../components/Equation.tsx";
import { FeedbackSheet } from "../components/FeedbackSheet.tsx";
import { HelpButton, type HelpControl } from "../components/HelpButton.tsx";
import { HintBubble } from "../components/HintBubble.tsx";
import { CloseIcon } from "../components/Icons.tsx";
import { KeypadAnswer } from "../components/KeypadAnswer.tsx";
import { MascotMessage } from "../components/Mascot.tsx";
import { Stopwatch } from "../components/Stopwatch.tsx";
import { TryAgainNote } from "../components/TryAgainNote.tsx";
import { VerticalAnswer } from "../components/VerticalAnswer.tsx";
import { HelpsUtils, type HelpUnavailableReason } from "../utils/helps/utils.ts";
import { Messages } from "../utils/messages.ts";
import type { Profile } from "../utils/profiles/utils.ts";
import { ProgressionUtils, type Milestone } from "../utils/progression/utils.ts";
import type { Question } from "../utils/questions/utils.ts";
import { SessionUtils, type AnswerRecord, type AttemptOutcome, type Session, type SessionOutcome } from "../utils/session/utils.ts";
import { VerticalUtils } from "../utils/vertical/utils.ts";
import { WalletUtils } from "../utils/wallet/utils.ts";

// The whole reward stays within a second; touching the screen moves on sooner. Misses and milestones wait for "Seguinte".
const PRAISE_DISPLAY_MILLISECONDS: number = 1000;

interface SessionScreenProps {
    profile: Profile;
    onProfileChange: (profile: Profile) => void;
    onFinish: (outcome: Omit<SessionOutcome, "offer">) => void;
    onExit: () => void;
}

export function SessionScreen({ profile, onProfileChange, onFinish, onExit }: SessionScreenProps) {
    const exitTitleId: string = useId();
    const questionHeadingRef = useRef<HTMLHeadingElement>(null);
    const [session, setSession] = useState<Session>(() => SessionUtils.create(profile));
    const [startedAt] = useState<number>(() => moment().valueOf());
    const [answerMilestones, setAnswerMilestones] = useState<Milestone[]>([]);
    const [sessionMilestones, setSessionMilestones] = useState<Milestone[]>([]);
    const [tryAgainText, setTryAgainText] = useState<string | null>(null);
    const [tryAgainCount, setTryAgainCount] = useState<number>(0);
    const [isExitConfirmOpen, setIsExitConfirmOpen] = useState<boolean>(false);

    const question: Question = SessionUtils.getCurrentQuestion(session);
    const record: AnswerRecord | null = SessionUtils.getCurrentRecord(session);
    const isAutoAdvancing: boolean = record !== null && record.isCorrect && answerMilestones.length === 0;

    const submitAnswer = (givenAnswer: number): AttemptOutcome => {
        const result = SessionUtils.submitAnswer(session, givenAnswer);
        setSession(result.session);
        if (result.record === null) {
            const wrongColumnCount: number =
                question.format === "vertical"
                    ? VerticalUtils.getWrongColumns(givenAnswer, question.answer, VerticalUtils.getColumnCount(question)).length
                    : 0;
            setTryAgainText(Messages.getTryAgain(question, tryAgainCount, wrongColumnCount));
            setTryAgainCount(tryAgainCount + 1);
            return result.outcome;
        }

        const applied = ProgressionUtils.applyRecord(profile, result.record);
        onProfileChange(applied.profile);
        setAnswerMilestones(applied.milestones);
        setSessionMilestones([...sessionMilestones, ...applied.milestones]);
        setTryAgainText(null);
        return result.outcome;
    };

    // The coin goes the first time help is asked on a question; further steps on the same question are free.
    const requestHelp = (): void => {
        if (!session.isCurrentHelped) {
            onProfileChange({ ...profile, wallet: WalletUtils.spend(profile.wallet) });
        }
        setSession(SessionUtils.registerHelp(session));
    };

    const goToNextQuestion = (): void => {
        const nextSession: Session = SessionUtils.advance(session);
        if (SessionUtils.isFinished(nextSession)) {
            onFinish({
                summary: SessionUtils.getSummary(nextSession),
                elapsedMilliseconds: profile.settings.isTimerEnabled ? moment().diff(startedAt) : null,
                milestones: sessionMilestones
            });
            return;
        }
        setAnswerMilestones([]);
        setTryAgainText(null);
        setSession(nextSession);
    };

    const continueAfterPraise = useEffectEvent(() => goToNextQuestion());

    useEffect(() => {
        if (!isAutoAdvancing || isExitConfirmOpen) {
            return;
        }
        const timeoutId: number = window.setTimeout(() => continueAfterPraise(), PRAISE_DISPLAY_MILLISECONDS);
        return () => window.clearTimeout(timeoutId);
    }, [isAutoAdvancing, isExitConfirmOpen]);

    useEffect(() => {
        if (isExitConfirmOpen || questionHeadingRef.current === null) {
            return;
        }
        questionHeadingRef.current.focus();
    }, [session.currentIndex, isExitConfirmOpen]);

    const unavailableReason: HelpUnavailableReason | null = HelpsUtils.getUnavailableReason(session, profile.wallet);
    const helpControl: HelpControl = {
        canUse: HelpsUtils.canUse(session, question, profile.wallet),
        isPaid: session.isCurrentHelped,
        unavailableText: unavailableReason === null ? null : Messages.getHelpUnavailable(unavailableReason),
        onUse: requestHelp
    };
    // Typed multiplications and divisions get one step: a neighbouring fact. Columns have their own steps.
    const keypadHelp: ReactNode = (() => {
        if (question.format !== "keypad" || !HelpsUtils.isAvailableFor(question) || record !== null) {
            return null;
        }
        if (session.isCurrentHelped) {
            return <HintBubble text={Messages.getNeighbourHint(HelpsUtils.getNeighbourFact(question, profile.boxes))} />;
        }
        return <HelpButton control={helpControl} />;
    })();

    return (
        <main className={`screen screen--session screen--${question.operation}`}>
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
                <div className="progress-bar__fill" style={{ transform: `scaleX(${session.records.length / session.questions.length})` }} />
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
                    <h1 className="visually-hidden" tabIndex={-1} ref={questionHeadingRef}>
                        {Messages.getSpokenQuestion(question)}
                    </h1>
                    {question.format === "vertical" && (
                        <VerticalAnswer key={session.currentIndex} question={question} record={record} help={helpControl} onSubmit={submitAnswer} />
                    )}
                    {question.format === "keypad" && (
                        <KeypadAnswer key={session.currentIndex} question={question} record={record} help={keypadHelp} onSubmit={submitAnswer} />
                    )}
                    {question.format === "choice" && (
                        <>
                            <Equation question={question} typedAnswer="" isAnswered={record !== null} />
                            <ChoiceOptions
                                options={question.options}
                                answer={question.answer}
                                missedAttempts={session.missedAttempts}
                                record={record}
                                onChoose={submitAnswer}
                            />
                        </>
                    )}
                    {tryAgainText !== null && record === null && <TryAgainNote key={tryAgainCount} text={tryAgainText} />}
                    {record !== null && (
                        <>
                            {isAutoAdvancing && <button type="button" className="tap-to-continue" tabIndex={-1} aria-hidden="true" onClick={goToNextQuestion} />}
                            <FeedbackSheet
                                key={session.currentIndex}
                                feedback={Messages.getFeedback(record, { variant: session.records.length, hasRetryAhead: SessionUtils.hasRetryAhead(session) })}
                                isCorrect={record.isCorrect}
                                milestones={answerMilestones}
                                onContinue={goToNextQuestion}
                            />
                        </>
                    )}
                </div>
            )}
        </main>
    );
}
