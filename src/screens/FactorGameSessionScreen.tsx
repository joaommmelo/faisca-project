import moment from "moment";
import { useEffect, useEffectEvent, useRef, useState, type ReactNode } from "react";
import { CoinStatus } from "../components/CoinStatus.tsx";
import { ExitSheet } from "../components/ExitSheet.tsx";
import { FactorEquation } from "../components/FactorEquation.tsx";
import { FactorPad } from "../components/FactorPad.tsx";
import { FeedbackPanel } from "../components/FeedbackPanel.tsx";
import { HelpButton, type HelpControl } from "../components/HelpButton.tsx";
import { HintBubble } from "../components/HintBubble.tsx";
import { CloseIcon, HomeIcon } from "../components/Icons.tsx";
import { SessionClock } from "../components/SessionClock.tsx";
import { TryAgainNote } from "../components/TryAgainNote.tsx";
import type { Labels } from "../copy/copy.ts";
import { ClockUtils, type ClockSettings } from "../utils/clock/utils.ts";
import {
    FactorGameUtils,
    type FactorAttemptResult,
    type FactorGame,
    type FactorPair,
    type FactorRound,
    type FactorRoundResult,
    type FinishedFactorGame
} from "../utils/factorGame/utils.ts";
import { HelpsUtils, type HelpUnavailableReason } from "../utils/helps/utils.ts";
import { Messages } from "../utils/messages.ts";
import type { Profile } from "../utils/profiles/utils.ts";
import type { ApplyRecordResult, Milestone } from "../utils/progression/utils.ts";
import { RecordsUtils } from "../utils/records/utils.ts";
import { WalletUtils } from "../utils/wallet/utils.ts";

// Every result moves on by itself after a short while; touching the screen or "Seguinte" moves on sooner.
// A praise stays within a second; the other multiplications of the number or a milestone a little longer; a
// correction long enough to read the answers.
const PRAISE_DISPLAY_MILLISECONDS: number = 1000;
const LONGER_PRAISE_DISPLAY_MILLISECONDS: number = 2000;
const CORRECTION_DISPLAY_MILLISECONDS: number = 2500;

interface FactorGameSessionScreenProps {
    profile: Profile;
    onProfileChange: (profile: Profile) => void;
    onFinish: (finished: FinishedFactorGame) => void;
    onExit: () => void;
}

// A number, and two taps on the pad to make a multiplication that gives it: the second tap answers.
export function FactorGameSessionScreen({ profile, onProfileChange, onFinish, onExit }: FactorGameSessionScreenProps) {
    const questionHeadingRef = useRef<HTMLHeadingElement>(null);
    const labels: Labels = Messages.getLabels();
    const clock: ClockSettings = profile.settings.factorGame.clock;
    const [game, setGame] = useState<FactorGame>(() => FactorGameUtils.create(profile.settings.multiplication.tables));
    const [startedAt] = useState<number>(() => moment().valueOf());
    // Read once: the record only changes when this game ends.
    const [recordMilliseconds] = useState<number | null>(() =>
        RecordsUtils.getBest(profile.records, RecordsUtils.getFactorGameCategory(profile.settings.multiplication.tables))
    );
    const [firstFactor, setFirstFactor] = useState<number | null>(null);
    // The pair just missed stays in the slots, crossed out, until the next tap.
    const [isMissShown, setIsMissShown] = useState<boolean>(false);
    const [answerMilestones, setAnswerMilestones] = useState<Milestone[]>([]);
    const [gameMilestones, setGameMilestones] = useState<Milestone[]>([]);
    const [coinFlightKey, setCoinFlightKey] = useState<number | null>(null);
    const [tryAgainText, setTryAgainText] = useState<string | null>(null);
    const [tryAgainCount, setTryAgainCount] = useState<number>(0);
    const [isExitConfirmOpen, setIsExitConfirmOpen] = useState<boolean>(false);

    const round: FactorRound = FactorGameUtils.getCurrentRound(game);
    const result: FactorRoundResult | null = FactorGameUtils.getCurrentResult(game);
    // With the help, the first slot always starts from its factor, also after a miss.
    const startingFactor: number | null = game.isCurrentHelped ? FactorGameUtils.getHintFactor(round) : null;
    const missedPair: FactorPair | null = game.missedPairs.length === 0 ? null : game.missedPairs[game.missedPairs.length - 1];
    const isMissedPairShown: boolean = result === null && isMissShown && firstFactor === null && missedPair !== null;
    const shownFactors: number[] = (() => {
        if (result !== null) {
            const shownPair: FactorPair = FactorGameUtils.getShownPair(result);
            return [shownPair.first, shownPair.second];
        }
        if (isMissedPairShown && missedPair !== null) {
            return [missedPair.first, missedPair.second];
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
        const hasMoreToRead: boolean = answerMilestones.length > 0 || FactorGameUtils.getOtherPairs(result).length > 0;
        return hasMoreToRead ? LONGER_PRAISE_DISPLAY_MILLISECONDS : PRAISE_DISPLAY_MILLISECONDS;
    })();

    const applyAnswer = (answered: FactorRoundResult): void => {
        const applied: ApplyRecordResult = FactorGameUtils.applyResult(profile, answered);
        onProfileChange(applied.profile);
        setAnswerMilestones(applied.milestones);
        setGameMilestones([...gameMilestones, ...applied.milestones]);
        if (applied.milestones.some((milestone) => milestone.kind === "coin")) {
            setCoinFlightKey(game.results.length);
        }
        setTryAgainText(null);
    };

    const pickFactor = (factor: number): void => {
        setIsMissShown(false);
        if (firstFactor === null) {
            setFirstFactor(factor);
            return;
        }
        const pair: FactorPair = { first: firstFactor, second: factor };
        const attempt: FactorAttemptResult = FactorGameUtils.submit(game, pair);
        setGame(attempt.game);
        if (attempt.result === null) {
            setFirstFactor(startingFactor);
            setIsMissShown(true);
            setTryAgainText(Messages.getFactorGameTryAgain(pair));
            setTryAgainCount(tryAgainCount + 1);
            return;
        }
        setFirstFactor(null);
        applyAnswer(attempt.result);
    };

    // The coin goes the first time help is asked on a round.
    const requestHelp = (): void => {
        if (!game.isCurrentHelped) {
            onProfileChange({ ...profile, wallet: WalletUtils.spend(profile.wallet) });
        }
        setGame(FactorGameUtils.registerHelp(game));
        setFirstFactor(FactorGameUtils.getHintFactor(round));
        setIsMissShown(false);
    };

    const goToNextRound = (): void => {
        const nextGame: FactorGame = FactorGameUtils.advance(game);
        if (FactorGameUtils.isFinished(nextGame)) {
            onFinish({
                summary: FactorGameUtils.getSummary(nextGame),
                elapsedMilliseconds: clock.isEnabled ? moment().diff(startedAt) : null,
                milestones: gameMilestones
            });
            return;
        }
        setAnswerMilestones([]);
        setTryAgainText(null);
        setIsMissShown(false);
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

    // One step: the bigger factor of the answer goes in the first slot, and the bubble says so.
    const help: ReactNode = (() => {
        if (result !== null) {
            return null;
        }
        if (game.isCurrentHelped) {
            return <HintBubble text={Messages.getFactorGameHint(round)} />;
        }
        const unavailableReason: HelpUnavailableReason | null = HelpsUtils.getUnavailableReason(game, profile.wallet);
        const control: HelpControl = {
            canUse: HelpsUtils.canUse(game, profile.wallet),
            isPaid: false,
            unavailableText: unavailableReason === null ? null : Messages.getHelpUnavailable(unavailableReason),
            onUse: requestHelp
        };
        return <HelpButton control={control} />;
    })();

    return (
        <main className="screen screen--session screen--multiplication">
            <header className="session-header">
                <button type="button" className="exit-button" onClick={() => setIsExitConfirmOpen(true)}>
                    <CloseIcon />
                    {labels.exit}
                </button>
                <p className="session-header__label">{labels.questionPosition(game.currentIndex + 1, game.rounds.length)}</p>
                <CoinStatus wallet={profile.wallet} flightKey={coinFlightKey} />
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
                    {Messages.getFactorGameQuestion(round.target)}
                </h1>
                <FactorEquation
                    target={round.target}
                    factors={shownFactors}
                    isAnswered={result !== null}
                    isMissed={isMissedPairShown}
                    hintedFactor={game.isCurrentHelped ? FactorGameUtils.getHintFactor(round) : null}
                />
                {tryAgainText !== null && <TryAgainNote key={tryAgainCount} text={tryAgainText} />}
                {help}
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
                            milestones={answerMilestones}
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
