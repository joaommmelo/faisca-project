import moment from "moment";
import { useEffect, useEffectEvent, useState, type ReactNode } from "react";
import { CoinStatus } from "../components/CoinStatus.tsx";
import { ExitSheet } from "../components/ExitSheet.tsx";
import { FeedbackPanel } from "../components/FeedbackPanel.tsx";
import { HelpButton, type HelpControl } from "../components/HelpButton.tsx";
import { HintBubble } from "../components/HintBubble.tsx";
import { CloseIcon, HomeIcon, SparkIcon } from "../components/Icons.tsx";
import { MemoryCardFace } from "../components/MemoryCardFace.tsx";
import { SessionClock } from "../components/SessionClock.tsx";
import type { Labels } from "../copy/copy.ts";
import { useBackButton } from "../hooks/useBackButton.ts";
import { ClockUtils, type ClockSettings } from "../utils/clock/utils.ts";
import { HelpsUtils, type HelpUnavailableReason } from "../utils/helps/utils.ts";
import { MemoryGameUtils, type FinishedMemoryGame, type MemoryCard, type MemoryFlipResult, type MemoryGame } from "../utils/memoryGame/utils.ts";
import { Messages } from "../utils/messages.ts";
import type { Profile } from "../utils/profiles/utils.ts";
import type { ApplyRecordResult, Milestone } from "../utils/progression/utils.ts";
import { RecordsUtils } from "../utils/records/utils.ts";
import { WalletUtils } from "../utils/wallet/utils.ts";

// The two cards of a miss stay up long enough to remember them, then turn back down; a tap turns them sooner.
const MISS_DISPLAY_MILLISECONDS: number = 1400;
// The last pair found: the end shows in the sheet, and moves on by itself like every result.
const END_DISPLAY_MILLISECONDS: number = 2500;

interface MemoryGameSessionScreenProps {
    profile: Profile;
    onProfileChange: (profile: Profile) => void;
    onFinish: (finished: FinishedMemoryGame) => void;
    onExit: () => void;
}

// The cards face down in rows of four. Two at a time turn; a pair stays up, a miss turns back.
export function MemoryGameSessionScreen({ profile, onProfileChange, onFinish, onExit }: MemoryGameSessionScreenProps) {
    const labels: Labels = Messages.getLabels();
    const { memoryGame: settings } = profile.settings;
    const clock: ClockSettings = settings.clock;
    const [game, setGame] = useState<MemoryGame>(() => MemoryGameUtils.create(settings.content, settings.pairCount, profile));
    const [startedAt] = useState<number>(() => moment().valueOf());
    // Read once: the record only changes when this game ends.
    const [recordMilliseconds] = useState<number | null>(() =>
        RecordsUtils.getBest(profile.records, RecordsUtils.getMemoryGameCategory(settings.content, settings.pairCount, profile.settings.multiplication.tables))
    );
    const [statusText, setStatusText] = useState<string>("");
    const [gameMilestones, setGameMilestones] = useState<Milestone[]>([]);
    const [coinFlightKey, setCoinFlightKey] = useState<number | null>(null);
    const [isExitConfirmOpen, setIsExitConfirmOpen] = useState<boolean>(false);
    useBackButton("screen", () => setIsExitConfirmOpen(true));
    const isFinished: boolean = MemoryGameUtils.isFinished(game);
    const isMissShown: boolean = game.flippedIds.length === 2;

    const flip = (cardId: number): void => {
        const flipped: MemoryFlipResult = MemoryGameUtils.flip(game, cardId);
        setGame(flipped.game);
        if (flipped.outcome === "first") {
            setStatusText("");
            return;
        }
        if (flipped.outcome === "miss") {
            setStatusText(Messages.getMemoryFlipText(false, game.turns));
            return;
        }
        const pairId: number = MemoryGameUtils.getCard(game, cardId).pairId;
        const applied: ApplyRecordResult = MemoryGameUtils.applyMatch(profile, flipped.game, pairId);
        onProfileChange(applied.profile);
        setGameMilestones([...gameMilestones, ...applied.milestones]);
        if (applied.milestones.some((milestone) => milestone.kind === "coin")) {
            setCoinFlightKey(flipped.game.matchedPairIds.length);
        }
        setStatusText(
            [
                Messages.getMemoryFlipText(true, flipped.game.matchedPairIds.length),
                ...applied.milestones.map((milestone) => Messages.getMilestone(milestone))
            ].join(" ")
        );
    };

    // The coin goes once per card face up.
    const requestHelp = (): void => {
        if (!game.isCurrentHelped) {
            onProfileChange({ ...profile, wallet: WalletUtils.spend(profile.wallet) });
        }
        setGame(MemoryGameUtils.registerHelp(game));
    };

    const finish = (): void => {
        onFinish({
            summary: MemoryGameUtils.getSummary(game),
            elapsedMilliseconds: clock.isEnabled ? moment().diff(startedAt) : null,
            milestones: gameMilestones
        });
    };

    const hideMiss = useEffectEvent(() => setGame(MemoryGameUtils.hideMiss(game)));
    const finishAfterEnd = useEffectEvent(() => finish());

    useEffect(() => {
        if (!isMissShown || isExitConfirmOpen) {
            return;
        }
        const timeoutId: number = window.setTimeout(() => hideMiss(), MISS_DISPLAY_MILLISECONDS);
        return () => window.clearTimeout(timeoutId);
    }, [isMissShown, isExitConfirmOpen, game.turns]);

    useEffect(() => {
        if (!isFinished || isExitConfirmOpen) {
            return;
        }
        const timeoutId: number = window.setTimeout(() => finishAfterEnd(), END_DISPLAY_MILLISECONDS);
        return () => window.clearTimeout(timeoutId);
    }, [isFinished, isExitConfirmOpen]);

    // Only with one card face up: the help makes its pair shine.
    const help: ReactNode = (() => {
        if (isFinished) {
            return null;
        }
        if (game.isCurrentHelped) {
            return <HintBubble text={Messages.getMemoryHint()} />;
        }
        const unavailableReason: HelpUnavailableReason | null = HelpsUtils.getUnavailableReason(game, profile.wallet);
        const unavailableText: string | null = (() => {
            if (unavailableReason !== null) {
                return Messages.getHelpUnavailable(unavailableReason);
            }
            return MemoryGameUtils.canAskHelp(game) ? null : Messages.getMemoryHelpNeedsCard();
        })();
        const control: HelpControl = {
            canUse: HelpsUtils.canUse(game, profile.wallet) && MemoryGameUtils.canAskHelp(game),
            isPaid: false,
            unavailableText,
            onUse: requestHelp
        };
        return <HelpButton control={control} />;
    })();

    const getCardClassName = (card: MemoryCard): string => {
        const classNames: string[] = ["memory-card"];
        if (MemoryGameUtils.isMatched(game, card)) {
            classNames.push("memory-card--matched");
        } else if (game.flippedIds.includes(card.id)) {
            classNames.push(isMissShown ? "memory-card--missed" : "memory-card--up");
        }
        if (game.hintedCardId === card.id) {
            classNames.push("memory-card--hinted");
        }
        return classNames.join(" ");
    };

    return (
        <main className="screen screen--session screen--memory">
            <header className="session-header">
                <button type="button" className="exit-button" onClick={() => setIsExitConfirmOpen(true)}>
                    <CloseIcon />
                    {labels.exit}
                </button>
                <p className="session-header__label">{Messages.getMemoryTurns(game.turns)}</p>
                <CoinStatus wallet={profile.wallet} flightKey={coinFlightKey} />
            </header>

            {clock.isEnabled && (
                <SessionClock
                    startedAt={startedAt}
                    settings={clock}
                    referenceMilliseconds={ClockUtils.getReferenceMilliseconds(clock, recordMilliseconds)}
                    hasRecord={recordMilliseconds !== null}
                />
            )}

            <div className="session-body">
                <h1 className="visually-hidden">{Messages.getMemoryGameName()}</h1>
                <div
                    className="memory-grid"
                    role="group"
                    aria-label={labels.cards}
                    style={{ gridTemplateColumns: `repeat(${MemoryGameUtils.getColumns()}, 1fr)` }}
                >
                    {game.cards.map((card, index) => {
                        const isFaceUp: boolean = MemoryGameUtils.isFaceUp(game, card);
                        return (
                            <button
                                key={card.id}
                                type="button"
                                className={getCardClassName(card)}
                                aria-label={Messages.getMemoryCardLabel(index + 1, isFaceUp ? card : null)}
                                disabled={isFinished || isExitConfirmOpen || !MemoryGameUtils.canFlip(game, card.id)}
                                onClick={() => flip(card.id)}
                            >
                                {isFaceUp ? (
                                    <MemoryCardFace face={card.face} />
                                ) : (
                                    <span className="memory-card__back" aria-hidden="true">
                                        <SparkIcon />
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
                <p className="memory-status" role="status">
                    {statusText}
                </p>
                {help}
                {isFinished && (
                    <>
                        <button type="button" className="tap-to-continue" tabIndex={-1} aria-hidden="true" onClick={finish} />
                        <FeedbackPanel feedback={{ title: Messages.getMemoryDone(), lines: [] }} isCorrect milestones={[]} onContinue={finish} />
                    </>
                )}
            </div>

            {isExitConfirmOpen && (
                <ExitSheet question={labels.exitQuestion} leaveIcon={<HomeIcon />} onLeave={onExit} onStay={() => setIsExitConfirmOpen(false)} />
            )}
        </main>
    );
}
