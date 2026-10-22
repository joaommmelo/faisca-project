import { useEffect, useEffectEvent, useRef, useState } from "react";
import { ExitSheet } from "../components/ExitSheet.tsx";
import { FactorEquation } from "../components/FactorEquation.tsx";
import { FactorPad } from "../components/FactorPad.tsx";
import { FeedbackPanel } from "../components/FeedbackPanel.tsx";
import { CloseIcon, HomeIcon } from "../components/Icons.tsx";
import { TryAgainNote } from "../components/TryAgainNote.tsx";
import type { Labels } from "../copy/copy.ts";
import {
    FactorGameUtils,
    type FactorAttemptResult,
    type FactorGame,
    type FactorGameOutcome,
    type FactorPair,
    type FactorRound,
    type FactorRoundResult
} from "../utils/factorGame/utils.ts";
import { Messages } from "../utils/messages.ts";

// Every result moves on by itself after a short while; touching the screen or "Seguinte" moves on sooner.
// A praise stays within a second, the other multiplications of the number a little longer, and a correction long
// enough to read the answers.
const PRAISE_DISPLAY_MILLISECONDS: number = 1000;
const OTHER_PAIRS_DISPLAY_MILLISECONDS: number = 2000;
const CORRECTION_DISPLAY_MILLISECONDS: number = 2500;

interface FactorGameSessionScreenProps {
    tables: number[];
    onFinish: (outcome: FactorGameOutcome) => void;
    onExit: () => void;
}

// A number, and two taps on the pad to make a multiplication that gives it: the second tap answers.
export function FactorGameSessionScreen({ tables, onFinish, onExit }: FactorGameSessionScreenProps) {
    const questionHeadingRef = useRef<HTMLHeadingElement>(null);
    const labels: Labels = Messages.getLabels();
    const [game, setGame] = useState<FactorGame>(() => FactorGameUtils.create(tables));
    const [firstFactor, setFirstFactor] = useState<number | null>(null);
    const [tryAgainText, setTryAgainText] = useState<string | null>(null);
    const [tryAgainCount, setTryAgainCount] = useState<number>(0);
    const [isExitConfirmOpen, setIsExitConfirmOpen] = useState<boolean>(false);

    const round: FactorRound = FactorGameUtils.getCurrentRound(game);
    const result: FactorRoundResult | null = FactorGameUtils.getCurrentResult(game);
    const shownFactors: number[] = (() => {
        if (result !== null) {
            const shownPair: FactorPair = FactorGameUtils.getShownPair(result);
            return [shownPair.first, shownPair.second];
        }
        return firstFactor === null ? [] : [firstFactor];
    })();
    const autoAdvanceMilliseconds: number | null = (() => {
        if (result === null) {
            return null;
        }
        if (!result.isCorrect) {
            return CORRECTION_DISPLAY_MILLISECONDS;
        }
        return FactorGameUtils.getOtherPairs(result).length > 0 ? OTHER_PAIRS_DISPLAY_MILLISECONDS : PRAISE_DISPLAY_MILLISECONDS;
    })();

    const pickFactor = (factor: number): void => {
        if (firstFactor === null) {
            setFirstFactor(factor);
            return;
        }
        const pair: FactorPair = { first: firstFactor, second: factor };
        const attempt: FactorAttemptResult = FactorGameUtils.submit(game, pair);
        setGame(attempt.game);
        setFirstFactor(null);
        if (attempt.outcome === "try-again") {
            setTryAgainText(Messages.getFactorGameTryAgain(pair));
            setTryAgainCount(tryAgainCount + 1);
            return;
        }
        setTryAgainText(null);
    };

    const goToNextRound = (): void => {
        const nextGame: FactorGame = FactorGameUtils.advance(game);
        if (FactorGameUtils.isFinished(nextGame)) {
            onFinish(FactorGameUtils.getOutcome(nextGame));
            return;
        }
        setTryAgainText(null);
        setGame(nextGame);
    };

    const continueAfterFeedback = useEffectEvent(() => goToNextRound());

    useEffect(() => {
        if (autoAdvanceMilliseconds === null || isExitConfirmOpen) {
            return;
        }
        const timeoutId: number = window.setTimeout(() => continueAfterFeedback(), autoAdvanceMilliseconds);
        return () => window.clearTimeout(timeoutId);
    }, [autoAdvanceMilliseconds, isExitConfirmOpen, game.currentIndex]);

    useEffect(() => {
        if (isExitConfirmOpen || questionHeadingRef.current === null) {
            return;
        }
        questionHeadingRef.current.focus();
    }, [game.currentIndex, isExitConfirmOpen]);

    return (
        <main className="screen screen--session screen--multiplication">
            <header className="session-header session-header--centered">
                <button type="button" className="exit-button" onClick={() => setIsExitConfirmOpen(true)}>
                    <CloseIcon />
                    {labels.exit}
                </button>
                <p className="session-header__label">{labels.questionPosition(game.currentIndex + 1, game.rounds.length)}</p>
            </header>

            <div
                className="progress-bar"
                role="progressbar"
                aria-label={labels.gameProgress}
                aria-valuemin={0}
                aria-valuemax={game.rounds.length}
                aria-valuenow={game.results.length}
            >
                <div className="progress-bar__fill" style={{ transform: `scaleX(${game.results.length / game.rounds.length})` }} />
            </div>

            <div className="session-body">
                <h1 className="visually-hidden" tabIndex={-1} ref={questionHeadingRef}>
                    {Messages.getFactorGameQuestion(round.target)}
                </h1>
                <FactorEquation target={round.target} factors={shownFactors} isAnswered={result !== null} />
                {tryAgainText !== null && <TryAgainNote key={tryAgainCount} text={tryAgainText} />}
                <FactorPad
                    announcement={firstFactor === null ? labels.noAnswerYet : labels.yourAnswer(`${firstFactor} × ?`)}
                    canErase={firstFactor !== null}
                    isDisabled={result !== null || isExitConfirmOpen}
                    onFactor={pickFactor}
                    onErase={() => setFirstFactor(null)}
                />
                {result !== null && (
                    <>
                        <button type="button" className="tap-to-continue" tabIndex={-1} aria-hidden="true" onClick={goToNextRound} />
                        <FeedbackPanel
                            key={game.currentIndex}
                            feedback={Messages.getFactorGameFeedback(result, game.results.length)}
                            isCorrect={result.isCorrect}
                            milestones={[]}
                            onContinue={goToNextRound}
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
