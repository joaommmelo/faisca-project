import { useId, useState } from "react";
import { Celebration } from "../components/Celebration.tsx";
import { ClockField } from "../components/ClockField.tsx";
import { ClockResultCard } from "../components/ClockResultCard.tsx";
import { CoinButton } from "../components/CoinButton.tsx";
import { GameSymbol } from "../components/GameSymbol.tsx";
import { LevelMeter } from "../components/LevelMeter.tsx";
import { BackIcon, HomeIcon, PlayIcon } from "../components/Icons.tsx";
import { MascotMessage } from "../components/Mascot.tsx";
import { RewardsCard } from "../components/RewardsCard.tsx";
import { RoundBoard } from "../components/RoundBoard.tsx";
import type { Labels } from "../copy/copy.ts";
import { useFocusOnMount } from "../hooks/useFocusOnMount.ts";
import { LevelsUtils } from "../utils/levels/utils.ts";
import { Messages } from "../utils/messages.ts";
import type { Profile, ProfileSettings } from "../utils/profiles/utils.ts";
import { RecordsUtils } from "../utils/records/utils.ts";
import { RoundGameUtils, type GameRound, type RoundGameId, type RoundGameOutcome } from "../utils/roundGame/utils.ts";

interface RoundGameScreenProps {
    game: RoundGameId;
    profile: Profile;
    // The game that just ended, or null before the first one.
    outcome: RoundGameOutcome | null;
    onSettingsChange: (settings: ProfileSettings) => void;
    onPlay: () => void;
    onShowProgress: () => void;
    onHome: () => void;
}

// Before a game: Faísca says what to do and a round shows it done, with the clock behind "Mais opções". After one:
// how it went, what it earned and the rounds to train again.
export function RoundGameScreen({ game, profile, outcome, onSettingsChange, onPlay, onShowProgress, onHome }: RoundGameScreenProps) {
    const headingRef = useFocusOnMount<HTMLHeadingElement>();
    const labels: Labels = Messages.getLabels();

    return (
        <main className={`screen screen--setup screen--${game}`}>
            <header className="setup-header">
                <button type="button" className="button button--ghost" onClick={onHome}>
                    <BackIcon />
                    {labels.home}
                </button>
                <CoinButton wallet={profile.wallet} />
            </header>

            <h1 ref={headingRef} tabIndex={-1} className="setup-title">
                <span className="setup-title__symbol" aria-hidden="true">
                    <GameSymbol game={game} />
                </span>
                {Messages.getRoundGameName(game)}
            </h1>

            {outcome === null ? (
                <RoundGameRules game={game} profile={profile} onSettingsChange={onSettingsChange} onPlay={onPlay} />
            ) : (
                <>
                    <RoundGameResult outcome={outcome} />
                    <button type="button" className="button button--secondary button--block" onClick={onShowProgress}>
                        {labels.seeProgress}
                    </button>
                    <div className="summary-actions">
                        <button type="button" className="button button--secondary" onClick={onHome}>
                            <HomeIcon />
                            {labels.home}
                        </button>
                        <button type="button" className="button button--play" onClick={onPlay}>
                            <PlayIcon />
                            {labels.playAgain}
                        </button>
                    </div>
                </>
            )}
        </main>
    );
}

interface RoundGameRulesProps {
    game: RoundGameId;
    profile: Profile;
    onSettingsChange: (settings: ProfileSettings) => void;
    onPlay: () => void;
}

function RoundGameRules({ game, profile, onSettingsChange, onPlay }: RoundGameRulesProps) {
    const moreOptionsId: string = useId();
    const labels: Labels = Messages.getLabels();
    const [isMoreOpen, setIsMoreOpen] = useState<boolean>(false);
    const { settings } = profile;
    const example: GameRound = RoundGameUtils.getExampleRound(game);
    const level: number = RoundGameUtils.getLevel(profile, game);

    return (
        <>
            <MascotMessage mood="happy" size={80}>
                {Messages.getRoundGameGreeting(game)}
            </MascotMessage>
            <section className={`card stack card--${game} round-example`} aria-hidden="true">
                <RoundBoard
                    state={{
                        round: example,
                        missedOptions: [],
                        hiddenOptions: [],
                        result: { round: example, givenOptions: [example.answer], isCorrect: true, isHelped: false },
                        isDisabled: true,
                        onChoose: () => undefined
                    }}
                    middle={null}
                />
            </section>
            <section className={`card stack card--${game}`}>
                <LevelMeter
                    track={LevelsUtils.getTrack(profile.tracks, RoundGameUtils.getTrackId(game))}
                    help={{ earning: "game", nextSkillName: Messages.getNextRoundSkillName(game, level) }}
                />
                <button
                    type="button"
                    className="more-options"
                    aria-expanded={isMoreOpen}
                    aria-controls={moreOptionsId}
                    onClick={() => setIsMoreOpen(!isMoreOpen)}
                >
                    {labels.moreOptions}
                    <span className="more-options__chevron" aria-hidden="true" />
                </button>
                {isMoreOpen && (
                    <div id={moreOptionsId} className="stack">
                        <ClockField
                            clock={settings.roundGames[game].clock}
                            recordMilliseconds={RecordsUtils.getBest(profile.records, RecordsUtils.getRoundGameCategory(game, level))}
                            onChange={(clock) =>
                                onSettingsChange({ ...settings, roundGames: { ...settings.roundGames, [game]: { ...settings.roundGames[game], clock } } })
                            }
                        />
                    </div>
                )}
            </section>
            <div className="play-bar">
                <button type="button" className="button button--play" onClick={onPlay}>
                    <PlayIcon />
                    {labels.play}
                </button>
            </div>
        </>
    );
}

function RoundGameResult({ outcome }: { outcome: RoundGameOutcome }) {
    const labels: Labels = Messages.getLabels();
    const { summary } = outcome;

    return (
        <>
            <Celebration />
            <MascotMessage mood="proud" size={88}>
                {Messages.getSummaryHeadline(summary.correctAtFirstTry, summary.roundCount)}
            </MascotMessage>

            <section className="card score">
                <p className="score__value">
                    {summary.correctAtFirstTry}
                    <span className="score__total"> {labels.outOf(summary.roundCount)}</span>
                </p>
                <p className="score__label">{labels.correctAtFirstTry}</p>
                {summary.helpedCount > 0 && <p className="score__time">{Messages.getHelpedCount(summary.helpedCount)}</p>}
            </section>

            {outcome.clock !== null && <ClockResultCard clock={outcome.clock} />}

            <RewardsCard milestones={outcome.milestones} isNewRecord={outcome.clock !== null && outcome.clock.isNewRecord} />

            <section className="card">
                <h2 className="section-title">{labels.toPractiseMore}</h2>
                {summary.roundsToPractise.length === 0 ? (
                    <p>{Messages.getNothingToReinforce()}</p>
                ) : (
                    <ul className="fact-list">
                        {summary.roundsToPractise.map((round) => (
                            <li key={round.id}>{Messages.getRoundText(round)}</li>
                        ))}
                    </ul>
                )}
            </section>
        </>
    );
}
