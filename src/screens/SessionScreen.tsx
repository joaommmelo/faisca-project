import moment from "moment";
import { useEffect, useEffectEvent, useRef, useState, type ReactNode } from "react";
import { ChoiceOptions } from "../components/ChoiceOptions.tsx";
import { CoinStatus } from "../components/CoinStatus.tsx";
import { Equation } from "../components/Equation.tsx";
import { ExitSheet } from "../components/ExitSheet.tsx";
import { FeedbackPanel } from "../components/FeedbackPanel.tsx";
import { HelpButton, type HelpControl } from "../components/HelpButton.tsx";
import { HintBubble } from "../components/HintBubble.tsx";
import { CloseIcon, HomeIcon } from "../components/Icons.tsx";
import { KeypadAnswer } from "../components/KeypadAnswer.tsx";
import { SessionClock } from "../components/SessionClock.tsx";
import { TryAgainNote } from "../components/TryAgainNote.tsx";
import { VerticalAnswer } from "../components/VerticalAnswer.tsx";
import type { Labels } from "../copy/copy.ts";
import { useBackButton } from "../hooks/useBackButton.ts";
import { ClockUtils, type ClockSettings } from "../utils/clock/utils.ts";
import { HelpsUtils, type HelpUnavailableReason } from "../utils/helps/utils.ts";
import { Messages } from "../utils/messages.ts";
import { ProfilesUtils, type Profile } from "../utils/profiles/utils.ts";
import { ProgressionUtils, type Milestone } from "../utils/progression/utils.ts";
import type { Question } from "../utils/questions/utils.ts";
import { RecordsUtils } from "../utils/records/utils.ts";
import { SessionUtils, type AnswerRecord, type AttemptOutcome, type Session, type SessionOutcome } from "../utils/session/utils.ts";
import { VerticalUtils } from "../utils/vertical/utils.ts";
import { WalletUtils } from "../utils/wallet/utils.ts";

// Every result moves on by itself after a short while; touching the screen or "Seguinte" moves on sooner.
// A praise stays within a second, a milestone a little longer, and a correction long enough to read the answer.
const PRAISE_DISPLAY_MILLISECONDS: number = 1000;
const MILESTONE_DISPLAY_MILLISECONDS: number = 2000;
const CORRECTION_DISPLAY_MILLISECONDS: number = 2500;

interface SessionScreenProps {
    profile: Profile;
    onProfileChange: (profile: Profile) => void;
    onFinish: (outcome: Omit<SessionOutcome, "offer" | "clock">) => void;
    onExit: () => void;
}

export function SessionScreen({ profile, onProfileChange, onFinish, onExit }: SessionScreenProps) {
    const questionHeadingRef = useRef<HTMLHeadingElement>(null);
    const labels: Labels = Messages.getLabels();
    const [session, setSession] = useState<Session>(() => SessionUtils.create(profile));
    const [startedAt] = useState<number>(() => moment().valueOf());
    // Read once: the record only changes when this session ends.
    const [recordMilliseconds] = useState<number | null>(() => RecordsUtils.getBest(profile.records, RecordsUtils.getCategory(profile.settings)));
    const [answerMilestones, setAnswerMilestones] = useState<Milestone[]>([]);
    const [sessionMilestones, setSessionMilestones] = useState<Milestone[]>([]);
    const [coinFlightKey, setCoinFlightKey] = useState<number | null>(null);
    const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
    const [tryAgainText, setTryAgainText] = useState<string | null>(null);
    const [tryAgainCount, setTryAgainCount] = useState<number>(0);
    const [isExitConfirmOpen, setIsExitConfirmOpen] = useState<boolean>(false);
    useBackButton("screen", () => setIsExitConfirmOpen(true));

    const question: Question = SessionUtils.getCurrentQuestion(session);
    const record: AnswerRecord | null = SessionUtils.getCurrentRecord(session);
    const clock: ClockSettings = ProfilesUtils.getClock(profile.settings);
    const autoAdvanceMilliseconds: number | null = (() => {
        if (record === null) {
            return null;
        }
        if (!record.isCorrect) {
            return CORRECTION_DISPLAY_MILLISECONDS;
        }
        return answerMilestones.length > 0 ? MILESTONE_DISPLAY_MILLISECONDS : PRAISE_DISPLAY_MILLISECONDS;
    })();

    const submitAnswer = (givenAnswer: number): AttemptOutcome => {
        const result = SessionUtils.submitAnswer(session, givenAnswer);
        setSession(result.session);
        if (result.record === null) {
            const wrongColumnCount: number =
                question.format === "vertical" ? VerticalUtils.getWrongColumns(givenAnswer, question.answer, VerticalUtils.getColumnCount(question)).length : 0;
            setTryAgainText(Messages.getTryAgain(question, tryAgainCount, wrongColumnCount));
            setTryAgainCount(tryAgainCount + 1);
            return result.outcome;
        }

        const applied = ProgressionUtils.applyRecord(profile, result.record);
        onProfileChange(applied.profile);
        setAnswerMilestones(applied.milestones);
        setSessionMilestones([...sessionMilestones, ...applied.milestones]);
        if (applied.milestones.some((milestone) => milestone.kind === "coin")) {
            setCoinFlightKey(session.records.length);
        }
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
                elapsedMilliseconds: clock.isEnabled ? moment().diff(startedAt) : null,
                milestones: sessionMilestones
            });
            return;
        }
        setAnswerMilestones([]);
        setHiddenOptions([]);
        setTryAgainText(null);
        setSession(nextSession);
    };

    const continueAfterFeedback = useEffectEvent(() => goToNextQuestion());

    useEffect(() => {
        if (autoAdvanceMilliseconds === null || isExitConfirmOpen) {
            return;
        }
        const timeoutId: number = window.setTimeout(() => continueAfterFeedback(), autoAdvanceMilliseconds);
        return () => window.clearTimeout(timeoutId);
    }, [autoAdvanceMilliseconds, isExitConfirmOpen, session.currentIndex]);

    useEffect(() => {
        if (isExitConfirmOpen || questionHeadingRef.current === null) {
            return;
        }
        questionHeadingRef.current.focus();
    }, [session.currentIndex, isExitConfirmOpen]);

    const unavailableReason: HelpUnavailableReason | null = HelpsUtils.getUnavailableReason(session, profile.wallet);
    const helpControl: HelpControl = {
        canUse: HelpsUtils.canUse(session, profile.wallet),
        isPaid: session.isCurrentHelped,
        unavailableText: unavailableReason === null ? null : Messages.getHelpUnavailable(unavailableReason),
        onUse: requestHelp
    };

    // One-step helps: two options fewer, a neighbouring fact for the times tables, a first step for everything else.
    // Columns have their own steps inside VerticalAnswer.
    const oneStepHelp: ReactNode = (() => {
        if (record !== null) {
            return null;
        }
        if (!session.isCurrentHelped) {
            return <HelpButton control={helpControl} />;
        }
        if (question.format === "choice") {
            return <HintBubble text={Messages.getChoiceHint()} />;
        }
        if (question.boxType === "fact") {
            return <HintBubble text={Messages.getNeighbourHint(HelpsUtils.getNeighbourFact(question, profile.boxes))} />;
        }
        return <HintBubble text={Messages.getArithmeticHint(question, HelpsUtils.getArithmeticHint(question))} />;
    })();
    // The second-chance note sits right under the question so it is never hidden.
    const tryAgainNote: ReactNode = tryAgainText === null ? null : <TryAgainNote key={tryAgainCount} text={tryAgainText} />;
    const useChoiceHelp: HelpControl = {
        ...helpControl,
        onUse: () => {
            setHiddenOptions(HelpsUtils.getOptionsToHide(question, session.missedAttempts));
            requestHelp();
        }
    };

    return (
        <main className={`screen screen--session screen--${question.operation}`}>
            <header className="session-header">
                <button type="button" className="exit-button" onClick={() => setIsExitConfirmOpen(true)}>
                    <CloseIcon />
                    {labels.exit}
                </button>
                <p className="session-header__label">
                    {question.isRetry ? (
                        <span className="retry-badge">{labels.again}</span>
                    ) : (
                        labels.questionPosition(SessionUtils.getFirstTryPosition(session), SessionUtils.getFirstTryTotal(session))
                    )}
                </p>
                <CoinStatus wallet={profile.wallet} flightKey={coinFlightKey} />
            </header>

            <div
                className="progress-bar"
                role="progressbar"
                aria-label={labels.gameProgress}
                aria-valuemin={0}
                aria-valuemax={session.questions.length}
                aria-valuenow={session.records.length}
            >
                <div className="progress-bar__fill" style={{ transform: `scaleX(${session.records.length / session.questions.length})` }} />
            </div>

            {clock.isEnabled && (
                <SessionClock
                    startedAt={startedAt}
                    settings={clock}
                    referenceMilliseconds={ClockUtils.getReferenceMilliseconds(clock, recordMilliseconds)}
                    hasRecord={recordMilliseconds !== null}
                />
            )}

            <div className="session-body">
                <h1 className="visually-hidden" tabIndex={-1} ref={questionHeadingRef}>
                    {Messages.getSpokenQuestion(question)}
                </h1>
                {question.format === "vertical" && (
                    <VerticalAnswer
                        key={session.currentIndex}
                        question={question}
                        record={record}
                        tryAgainNote={tryAgainNote}
                        help={helpControl}
                        isPaused={isExitConfirmOpen}
                        onSubmit={submitAnswer}
                    />
                )}
                {question.format === "keypad" && (
                    <KeypadAnswer
                        key={session.currentIndex}
                        question={question}
                        record={record}
                        tryAgainNote={tryAgainNote}
                        help={oneStepHelp}
                        isPaused={isExitConfirmOpen}
                        onSubmit={submitAnswer}
                    />
                )}
                {question.format === "choice" && (
                    <>
                        <Equation question={question} typedAnswer="" isAnswered={record !== null} />
                        {tryAgainNote}
                        <ChoiceOptions
                            options={question.options}
                            answer={question.answer}
                            missedAttempts={session.missedAttempts}
                            hiddenOptions={hiddenOptions}
                            record={record}
                            onChoose={submitAnswer}
                        />
                        {record === null && !session.isCurrentHelped ? <HelpButton control={useChoiceHelp} /> : oneStepHelp}
                    </>
                )}
                {record !== null && (
                    <>
                        <button type="button" className="tap-to-continue" tabIndex={-1} aria-hidden="true" onClick={goToNextQuestion} />
                        <FeedbackPanel
                            key={session.currentIndex}
                            feedback={Messages.getFeedback(record, { variant: session.records.length, hasRetryAhead: SessionUtils.hasRetryAhead(session) })}
                            isCorrect={record.isCorrect}
                            milestones={answerMilestones}
                            onContinue={goToNextQuestion}
                        />
                    </>
                )}
            </div>

            {isExitConfirmOpen && (
                <ExitSheet question={labels.exitQuestion} leaveIcon={<HomeIcon />} onLeave={onExit} onStay={() => setIsExitConfirmOpen(false)} />
            )}
        </main>
    );
}
