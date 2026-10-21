import moment from "moment";
import { useEffect, useEffectEvent, useId, useRef, useState } from "react";
import { Equation } from "../components/Equation.tsx";
import { CheckIcon, CloseIcon, PlayIcon, StarIcon } from "../components/Icons.tsx";
import { MascotMessage } from "../components/Mascot.tsx";
import { NumericKeypad } from "../components/NumericKeypad.tsx";
import { ChallengeUtils, type ChallengeClock, type ChallengeEnding, type ChallengeQuestion, type ChallengeRun } from "../utils/challenge/utils.ts";
import { KeypadUtils } from "../utils/keypad/utils.ts";
import { Messages } from "../utils/messages.ts";
import { NumbersUtils } from "../utils/numbers/utils.ts";

// A right answer shows for a moment before the next question; a new level a little longer, to read what changed.
// The question's clock is stopped meanwhile.
const PRAISE_DISPLAY_MILLISECONDS: number = 500;
const LEVEL_UP_DISPLAY_MILLISECONDS: number = 1500;
// How often the time left is redrawn.
const TICK_MILLISECONDS: number = 100;
// The time bar turns warm when this share of the question's time is left.
const LOW_TIME_SHARE: number = 0.25;

interface ChallengeSessionScreenProps {
    onFinish: (run: Omit<ChallengeRun, "previousRecord">) => void;
}

// Questions one after another, each against its own time, until a wrong answer, the time running out, or Sair.
export function ChallengeSessionScreen({ onFinish }: ChallengeSessionScreenProps) {
    const exitTitleId: string = useId();
    const questionHeadingRef = useRef<HTMLHeadingElement>(null);
    const [correctCount, setCorrectCount] = useState<number>(0);
    const [question, setQuestion] = useState<ChallengeQuestion>(() => ChallengeUtils.createQuestion(0, null));
    const [clock, setClock] = useState<ChallengeClock>(() => ChallengeUtils.startClock(question.timeLimitMilliseconds, moment().valueOf()));
    const [now, setNow] = useState<number>(() => moment().valueOf());
    const [typedAnswer, setTypedAnswer] = useState<string>("");
    const [isAnswered, setIsAnswered] = useState<boolean>(false);
    const [isExitConfirmOpen, setIsExitConfirmOpen] = useState<boolean>(false);

    const isClockRunning: boolean = !isAnswered && clock.startedAt !== null;
    const remainingMilliseconds: number = ChallengeUtils.getRemainingMilliseconds(clock, now);
    const remainingShare: number = remainingMilliseconds / question.timeLimitMilliseconds;
    const isLevelUp: boolean = isAnswered && ChallengeUtils.isLevelUp(correctCount);

    const finish = (ending: ChallengeEnding, givenAnswer: number | null): void => {
        onFinish({ correctCount, lastQuestion: question, givenAnswer, ending });
    };

    // An answer confirmed after the time ran out does not count, even if the timeout has not fired yet.
    const confirm = (): void => {
        const givenAnswer: number = Number(typedAnswer);
        if (ChallengeUtils.getRemainingMilliseconds(clock, moment().valueOf()) === 0) {
            finish("time", null);
            return;
        }
        if (givenAnswer !== question.answer) {
            finish("wrong", givenAnswer);
            return;
        }
        setCorrectCount(correctCount + 1);
        setIsAnswered(true);
    };

    const goToNextQuestion = (): void => {
        const nextQuestion: ChallengeQuestion = ChallengeUtils.createQuestion(correctCount, question);
        const startedAt: number = moment().valueOf();
        setQuestion(nextQuestion);
        setClock(ChallengeUtils.startClock(nextQuestion.timeLimitMilliseconds, startedAt));
        setNow(startedAt);
        setTypedAnswer("");
        setIsAnswered(false);
    };

    const openExitConfirm = (): void => {
        setClock(ChallengeUtils.pauseClock(clock, moment().valueOf()));
        setIsExitConfirmOpen(true);
    };

    const closeExitConfirm = (): void => {
        const resumedAt: number = moment().valueOf();
        setClock(ChallengeUtils.resumeClock(clock, resumedAt));
        setNow(resumedAt);
        setIsExitConfirmOpen(false);
    };

    const runOutOfTime = useEffectEvent(() => finish("time", null));
    const continueAfterPraise = useEffectEvent(() => goToNextQuestion());

    useEffect(() => {
        if (!isClockRunning) {
            return;
        }
        const intervalId: number = window.setInterval(() => setNow(moment().valueOf()), TICK_MILLISECONDS);
        const timeoutId: number = window.setTimeout(() => runOutOfTime(), ChallengeUtils.getRemainingMilliseconds(clock, moment().valueOf()));
        return () => {
            window.clearInterval(intervalId);
            window.clearTimeout(timeoutId);
        };
    }, [clock, isClockRunning]);

    useEffect(() => {
        if (!isAnswered || isExitConfirmOpen) {
            return;
        }
        const timeoutId: number = window.setTimeout(() => continueAfterPraise(), isLevelUp ? LEVEL_UP_DISPLAY_MILLISECONDS : PRAISE_DISPLAY_MILLISECONDS);
        return () => window.clearTimeout(timeoutId);
    }, [isAnswered, isExitConfirmOpen, isLevelUp]);

    useEffect(() => {
        if (isExitConfirmOpen || questionHeadingRef.current === null) {
            return;
        }
        questionHeadingRef.current.focus();
    }, [question, isExitConfirmOpen]);

    return (
        <main className="screen screen--session screen--challenge">
            <header className="session-header">
                <button type="button" className="exit-button" onClick={openExitConfirm}>
                    <CloseIcon />
                    Sair
                </button>
                <p className="session-header__label">{Messages.getLevelName(ChallengeUtils.getLevel(correctCount))}</p>
                <p className="challenge-score">
                    <CheckIcon />
                    {Messages.getChallengeScore(correctCount)}
                </p>
            </header>

            <div className={remainingShare <= LOW_TIME_SHARE ? "challenge-timer challenge-timer--low" : "challenge-timer"}>
                <div className="challenge-timer__bar" aria-hidden="true">
                    <div className="challenge-timer__fill" style={{ transform: `scaleX(${remainingShare})` }} />
                </div>
                <p className="challenge-timer__time" role="timer">{`${Math.ceil(remainingMilliseconds / 1000)} s`}</p>
            </div>

            {isExitConfirmOpen ? (
                <section className="card stack exit-confirm" role="alertdialog" aria-labelledby={exitTitleId}>
                    <MascotMessage mood="encourage" size={72}>
                        <span id={exitTitleId}>Queres terminar o desafio?</span>
                    </MascotMessage>
                    <p className="hint">{Messages.getChallengeExitNote(correctCount)} O tempo está parado.</p>
                    <div className="exit-confirm__choices">
                        <button type="button" className="button exit-confirm__choice exit-confirm__choice--leave" onClick={() => finish("stop", null)}>
                            <StarIcon />
                            Sim, terminar
                        </button>
                        <button type="button" className="button exit-confirm__choice exit-confirm__choice--stay" autoFocus onClick={closeExitConfirm}>
                            <PlayIcon />
                            Não, continuar
                        </button>
                    </div>
                </section>
            ) : (
                <div className="session-body">
                    <h1 className="visually-hidden" tabIndex={-1} ref={questionHeadingRef}>
                        {Messages.getSpokenQuestion(question)}
                    </h1>
                    <Equation question={question} typedAnswer={typedAnswer} isAnswered={isAnswered} />
                    <p className="challenge-status" role="status">
                        {isLevelUp ? Messages.getChallengeLevelUp(ChallengeUtils.getLevel(correctCount)) : ""}
                    </p>
                    <NumericKeypad
                        announcement={typedAnswer.length === 0 ? "Ainda sem resposta" : `A tua resposta: ${NumbersUtils.format(Number(typedAnswer))}`}
                        canConfirm={KeypadUtils.canConfirm(typedAnswer)}
                        isDisabled={isAnswered}
                        onDigit={(digit) => setTypedAnswer(KeypadUtils.appendDigit(typedAnswer, String(digit), ChallengeUtils.getMaxDigits()))}
                        onErase={() => setTypedAnswer(KeypadUtils.eraseDigit(typedAnswer))}
                        onConfirm={confirm}
                    />
                    {isAnswered && <button type="button" className="tap-to-continue" tabIndex={-1} aria-hidden="true" onClick={goToNextQuestion} />}
                </div>
            )}
        </main>
    );
}
