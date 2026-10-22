import { useId, useState } from "react";
import { Celebration } from "../components/Celebration.tsx";
import { ClockField } from "../components/ClockField.tsx";
import { ClockResultCard } from "../components/ClockResultCard.tsx";
import { CoinButton } from "../components/CoinButton.tsx";
import { GameSymbol } from "../components/GameSymbol.tsx";
import { BackIcon, BoneIcon, HomeIcon, PlayIcon } from "../components/Icons.tsx";
import { MascotMessage } from "../components/Mascot.tsx";
import { MemoryCardFace } from "../components/MemoryCardFace.tsx";
import { RewardsCard } from "../components/RewardsCard.tsx";
import { SegmentedField } from "../components/SegmentedField.tsx";
import { TablesPicker } from "../components/TablesPicker.tsx";
import type { Labels } from "../copy/copy.ts";
import { useFocusOnMount } from "../hooks/useFocusOnMount.ts";
import { MemoryGameUtils, type MemoryContent, type MemoryFace, type MemoryGameOutcome } from "../utils/memoryGame/utils.ts";
import { Messages } from "../utils/messages.ts";
import type { Profile, ProfileSettings } from "../utils/profiles/utils.ts";
import { RecordsUtils } from "../utils/records/utils.ts";

// The example of the rules: a pair of each kind of cards, as it shows once found.
const EXAMPLE_PAIRS: Record<MemoryContent, MemoryFace[]> = {
    quantities: [
        { kind: "quantity", count: 3 },
        { kind: "number", value: 3 }
    ],
    additions: [
        { kind: "calculation", operation: "addition", left: 3, right: 4 },
        { kind: "number", value: 7 }
    ],
    tables: [
        { kind: "calculation", operation: "multiplication", left: 7, right: 8 },
        { kind: "number", value: 56 }
    ]
};
// What each kind of cards looks like, next to its name.
const CONTENT_DETAILS: Record<MemoryContent, string> = { quantities: "", additions: "3 + 4", tables: "7 × 8" };
const QUANTITY_DETAIL_BONES: number = 3;

interface MemoryGameScreenProps {
    profile: Profile;
    // The game that just ended, or null before the first one.
    outcome: MemoryGameOutcome | null;
    onSettingsChange: (settings: ProfileSettings) => void;
    onPlay: () => void;
    onShowProgress: () => void;
    onHome: () => void;
}

// Before a game: what the pairs match and how many, with the clock behind "Mais opções". After one: the turns, what
// it earned and every pair of the game.
export function MemoryGameScreen({ profile, outcome, onSettingsChange, onPlay, onShowProgress, onHome }: MemoryGameScreenProps) {
    const headingRef = useFocusOnMount<HTMLHeadingElement>();
    const labels: Labels = Messages.getLabels();

    return (
        <main className="screen screen--setup screen--memory">
            <header className="setup-header">
                <button type="button" className="button button--ghost" onClick={onHome}>
                    <BackIcon />
                    {labels.home}
                </button>
                <CoinButton wallet={profile.wallet} />
            </header>

            <h1 ref={headingRef} tabIndex={-1} className="setup-title">
                <span className="setup-title__symbol" aria-hidden="true">
                    <GameSymbol game="memory" />
                </span>
                {Messages.getMemoryGameName()}
            </h1>

            {outcome === null ? (
                <MemoryGameRules profile={profile} onSettingsChange={onSettingsChange} onPlay={onPlay} />
            ) : (
                <>
                    <MemoryGameResult outcome={outcome} />
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

interface MemoryGameRulesProps {
    profile: Profile;
    onSettingsChange: (settings: ProfileSettings) => void;
    onPlay: () => void;
}

function MemoryGameRules({ profile, onSettingsChange, onPlay }: MemoryGameRulesProps) {
    const moreOptionsId: string = useId();
    const labels: Labels = Messages.getLabels();
    const [isMoreOpen, setIsMoreOpen] = useState<boolean>(false);
    const { settings } = profile;
    const { memoryGame } = settings;
    const { tables } = settings.multiplication;
    const canPlay: boolean = MemoryGameUtils.canPlay(memoryGame.content, tables);
    const changeMemoryGame = (changes: Partial<ProfileSettings["memoryGame"]>): void =>
        onSettingsChange({ ...settings, memoryGame: { ...memoryGame, ...changes } });

    return (
        <>
            <MascotMessage mood="happy" size={80}>
                {Messages.getMemoryGameGreeting()}
            </MascotMessage>
            <section className="card stack card--memory">
                <div className="memory-example" aria-hidden="true">
                    {EXAMPLE_PAIRS[memoryGame.content].map((face, index) => (
                        <span key={index} className="memory-card memory-card--matched">
                            <MemoryCardFace face={face} />
                        </span>
                    ))}
                </div>
                <SegmentedField<MemoryContent>
                    legend={labels.contentQuestion}
                    value={memoryGame.content}
                    options={MemoryGameUtils.getValidContents().map((content) => ({
                        value: content,
                        label: Messages.getMemoryContentName(content),
                        detail:
                            content === "quantities" ? (
                                <span className="memory-detail-bones" aria-hidden="true">
                                    {Array.from({ length: QUANTITY_DETAIL_BONES }, (_, index) => (
                                        <BoneIcon key={index} />
                                    ))}
                                </span>
                            ) : (
                                CONTENT_DETAILS[content]
                            )
                    }))}
                    onChange={(content) => changeMemoryGame({ content })}
                />
                <SegmentedField<string>
                    legend={labels.pairCountQuestion}
                    value={String(memoryGame.pairCount)}
                    options={MemoryGameUtils.getValidPairCounts().map((pairCount) => ({
                        value: String(pairCount),
                        label: labels.pairCount(pairCount),
                        detail: <span className={`memory-detail-grid memory-detail-grid--${pairCount}`} aria-hidden="true" />
                    }))}
                    onChange={(pairCount) => changeMemoryGame({ pairCount: Number(pairCount) })}
                />
                {memoryGame.content === "tables" && (
                    <TablesPicker
                        selectedTables={tables}
                        onChange={(changedTables) => onSettingsChange({ ...settings, multiplication: { ...settings.multiplication, tables: changedTables } })}
                    />
                )}
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
                            clock={memoryGame.clock}
                            recordMilliseconds={RecordsUtils.getBest(
                                profile.records,
                                RecordsUtils.getMemoryGameCategory(memoryGame.content, memoryGame.pairCount, tables)
                            )}
                            onChange={(clock) => changeMemoryGame({ clock })}
                        />
                    </div>
                )}
            </section>
            <div className="play-bar">
                <p className="hint" role="status">
                    {canPlay ? "" : Messages.getPlayProblem("no-tables")}
                </p>
                <button type="button" className="button button--play" disabled={!canPlay} onClick={onPlay}>
                    <PlayIcon />
                    {labels.play}
                </button>
            </div>
        </>
    );
}

function MemoryGameResult({ outcome }: { outcome: MemoryGameOutcome }) {
    const labels: Labels = Messages.getLabels();
    const { summary } = outcome;

    return (
        <>
            <Celebration />
            <MascotMessage mood="proud" size={88}>
                {Messages.getMemoryDone()}
            </MascotMessage>

            <section className="card score">
                <p className="score__value">{summary.turns}</p>
                <p className="score__label">{labels.turns(summary.turns)}</p>
                <p className="score__time">{labels.pairCount(summary.pairCount)}</p>
                {summary.helpedCount > 0 && <p className="score__time">{Messages.getHelpedCount(summary.helpedCount)}</p>}
            </section>

            {outcome.clock !== null && <ClockResultCard clock={outcome.clock} recordRule="no-help" />}

            <RewardsCard milestones={outcome.milestones} isNewRecord={outcome.clock !== null && outcome.clock.isNewRecord} />

            <section className="card">
                <h2 className="section-title">{Messages.getMemoryPairsTitle()}</h2>
                <ul className="fact-list">
                    {summary.pairs.map((pair) => (
                        <li key={pair[0].pairId}>{Messages.getMemoryPairText(pair)}</li>
                    ))}
                </ul>
            </section>
        </>
    );
}
