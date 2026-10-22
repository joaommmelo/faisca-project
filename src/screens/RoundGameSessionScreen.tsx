import moment from "moment";
import { useEffect, useEffectEvent, useRef, useState, type ReactNode } from "react";
import { CoinStatus } from "../components/CoinStatus.tsx";
import { ExitSheet } from "../components/ExitSheet.tsx";
import { FeedbackPanel } from "../components/FeedbackPanel.tsx";
import { HelpButton, type HelpControl } from "../components/HelpButton.tsx";
import { HintBubble } from "../components/HintBubble.tsx";
import { CloseIcon, HomeIcon } from "../components/Icons.tsx";
import { RoundBoard } from "../components/RoundBoard.tsx";
import { SessionClock } from "../components/SessionClock.tsx";
import { TryAgainNote } from "../components/TryAgainNote.tsx";
import type { Labels } from "../copy/copy.ts";
import { ClockUtils, type ClockSettings } from "../utils/clock/utils.ts";
import { HelpsUtils, type HelpUnavailableReason } from "../utils/helps/utils.ts";
import { Messages } from "../utils/messages.ts";
import type { Profile } from "../utils/profiles/utils.ts";
import type { ApplyRecordResult, Milestone } from "../utils/progression/utils.ts";
import { RecordsUtils } from "../utils/records/utils.ts";
import {
    RoundGameUtils,
    type FinishedRoundGame,
    type GameRound,
    type RoundAttemptResult,
    type RoundGame,
    type RoundGameId,
    type RoundOption,
    type RoundResult
} from "../utils/roundGame/utils.ts";
import { WalletUtils } from "../utils/wallet/utils.ts";

// Every result moves on by itself after a short while; touching the screen or "Seguinte" moves on sooner. A praise
// stays within a second; one with more to read (the jump, the weights, a milestone) a little longer; a correction
// long enough to read the answer.
const PRAISE_DISPLAY_MILLISECONDS: number = 1000;
const LONGER_PRAISE_DISPLAY_MILLISECONDS: number = 2000;
const CORRECTION_DISPLAY_MILLISECONDS: number = 2500;

interface RoundGameSessionScreenProps {
    game: RoundGameId;
    profile: Profile;
    onProfileChange: (profile: Profile) => void;
    onFinish: (finished: FinishedRoundGame) => void;
    onExit: () => void;
}

// Ten rounds of one game: the round, its options, two tries, the help, and the result in a sheet at the bottom.
export function RoundGameSessionScreen({ game: gameId, profile, onProfileChange, onFinish, onExit }: RoundGameSessionScreenProps) {
    const questionHeadingRef = useRef<HTMLHeadingElement>(null);
    const labels: Labels = Messages.getLabels();
    const clock: ClockSettings = profile.settings.roundGames[gameId].clock;
    // Read once: the level only decides the rounds when the game starts, and its record changes when it ends.
    const [level] = useState<number>(() => RoundGameUtils.getLevel(profile, gameId));
    const [game, setGame] = useState<RoundGame>(() => RoundGameUtils.create(profile, gameId));
    const [startedAt] = useState<number>(() => moment().valueOf());
    const [recordMilliseconds] = useState<number | null>(() => RecordsUtils.getBest(profile.records, RecordsUtils.getRoundGameCategory(gameId, level)));
    const [answerMilestones, setAnswerMilestones] = useState<Milestone[]>([]);
    const [gameMilestones, setGameMilestones] = useState<Milestone[]>([]);
    const [coinFlightKey, setCoinFlightKey] = useState<number | null>(null);
    const [tryAgainText, setTryAgainText] = useState<string | null>(null);
    const [tryAgainCount, setTryAgainCount] = useState<number>(0);
    const [isExitConfirmOpen, setIsExitConfirmOpen] = useState<boolean>(false);

    const round: GameRound = RoundGameUtils.getCurrentRound(game);
    const result: RoundResult | null = RoundGameUtils.getCurrentResult(game);
    const autoAdvanceMilliseconds: number | null = (() => {
        if (result === null) {
            return null;
        }
        if (!result.isCorrect) {
            return CORRECTION_DISPLAY_MILLISECONDS;
        }
        const hasMoreToRead: boolean = answerMilestones.length > 0 || Messages.getRoundFeedback(result, 0).lines.length > 0;
        return hasMoreToRead ? LONGER_PRAISE_DISPLAY_MILLISECONDS : PRAISE_DISPLAY_MILLISECONDS;
    })();

    const choose = (option: RoundOption): void => {
        const attempt: RoundAttemptResult = RoundGameUtils.submit(game, option);
        setGame(attempt.game);
        if (attempt.result === null) {
            setTryAgainText(Messages.getTryAgainText(tryAgainCount));
            setTryAgainCount(tryAgainCount + 1);
            return;
        }
        const applied: ApplyRecordResult = RoundGameUtils.applyResult(profile, attempt.result);
        onProfileChange(applied.profile);
        setAnswerMilestones(applied.milestones);
        setGameMilestones([...gameMilestones, ...applied.milestones]);
        if (applied.milestones.some((milestone) => milestone.kind === "coin")) {
            setCoinFlightKey(game.results.length);
        }
        setTryAgainText(null);
    };

    // The coin goes the first time help is asked on a round.
    const requestHelp = (): void => {
        if (!game.isCurrentHelped) {
            onProfileChange({ ...profile, wallet: WalletUtils.spend(profile.wallet) });
        }
        setGame(RoundGameUtils.registerHelp(game));
    };

    const goToNextRound = (): void => {
        const nextGame: RoundGame = RoundGameUtils.advance(game);
        if (RoundGameUtils.isFinished(nextGame)) {
            onFinish({
                game: gameId,
                level,
                summary: RoundGameUtils.getSummary(nextGame),
                elapsedMilliseconds: clock.isEnabled ? moment().diff(startedAt) : null,
                milestones: gameMilestones
            });
            return;
        }
        setAnswerMilestones([]);
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

    // Fewer options, or a calculation of the balance worked out.
    const help: ReactNode = (() => {
        if (result !== null) {
            return null;
        }
        if (game.isCurrentHelped) {
            const text: string =
                round.game === "balance" && RoundGameUtils.getHelp(round) === "show-value"
                    ? Messages.getBalanceHint(round)
                    : Messages.getRoundChoiceHint(game.hiddenOptions.length);
            return <HintBubble text={text} />;
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
        <main className={`screen screen--session screen--${gameId}`}>
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
                    {Messages.getSpokenRound(round)}
                </h1>
                <RoundBoard
                    key={game.currentIndex}
                    state={{
                        round,
                        missedOptions: game.missedOptions,
                        hiddenOptions: game.hiddenOptions,
                        result,
                        isDisabled: result !== null || isExitConfirmOpen,
                        onChoose: choose
                    }}
                    middle={
                        <>
                            {tryAgainText !== null && <TryAgainNote key={tryAgainCount} text={tryAgainText} />}
                            {help}
                        </>
                    }
                />
                {result !== null && (
                    <>
                        <button type="button" className="tap-to-continue" tabIndex={-1} aria-hidden="true" onClick={goToNextRound} />
                        <FeedbackPanel
                            key={game.currentIndex}
                            feedback={Messages.getRoundFeedback(result, game.results.length)}
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
