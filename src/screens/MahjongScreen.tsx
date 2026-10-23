import { Celebration } from "../components/Celebration.tsx";
import { GameSymbol } from "../components/GameSymbol.tsx";
import { BackIcon, HomeIcon, MedalIcon, PlayIcon } from "../components/Icons.tsx";
import { MascotMessage } from "../components/Mascot.tsx";
import type { Labels } from "../copy/copy.ts";
import { useFocusOnMount } from "../hooks/useFocusOnMount.ts";
import { MahjongUtils, type MahjongRun } from "../utils/mahjong/utils.ts";
import { Messages } from "../utils/messages.ts";
import type { Profile } from "../utils/profiles/utils.ts";
import { TimeUtils } from "../utils/time/utils.ts";

interface MahjongScreenProps {
    profile: Profile;
    // The game that just ended, or null before the first one.
    run: MahjongRun | null;
    onPlay: () => void;
    onHome: () => void;
}

// Before a game: how it works and the record. After one: how it ended, the time and whether it is a new record.
export function MahjongScreen({ profile, run, onPlay, onHome }: MahjongScreenProps) {
    const headingRef = useFocusOnMount<HTMLHeadingElement>();
    const labels: Labels = Messages.getLabels();

    return (
        <main className="screen screen--challenge">
            <header className="setup-header">
                <button type="button" className="button button--ghost" onClick={onHome}>
                    <BackIcon />
                    {labels.home}
                </button>
            </header>

            <h1 ref={headingRef} tabIndex={-1} className="setup-title">
                <span className="setup-title__symbol" aria-hidden="true">
                    <GameSymbol game="mahjong" />
                </span>
                {Messages.getMahjongName()}
            </h1>

            {run === null ? (
                <>
                    <MascotMessage mood="happy" size={80}>
                        {Messages.getMahjongGreeting()}
                    </MascotMessage>
                    <section className="card stack card--challenge">
                        <ul className="challenge-rules">
                            {Messages.getMahjongRules().map((rule) => (
                                <li key={rule}>{rule}</li>
                            ))}
                        </ul>
                        <p className="challenge-record">{Messages.getMahjongRecord(profile.mahjongRecord)}</p>
                    </section>
                </>
            ) : (
                <MahjongResult run={run} />
            )}

            <div className="summary-actions">
                <button type="button" className="button button--secondary" onClick={onHome}>
                    <HomeIcon />
                    {labels.home}
                </button>
                <button type="button" className="button button--play" onClick={onPlay}>
                    <PlayIcon />
                    {run === null ? labels.play : labels.playAgain}
                </button>
            </div>
        </main>
    );
}

function MahjongResult({ run }: { run: MahjongRun }) {
    const labels: Labels = Messages.getLabels();
    const isNewRecord: boolean = MahjongUtils.isNewRecord(run);
    const isCleared: boolean = run.ending === "cleared";

    return (
        <>
            {isCleared && <Celebration />}
            <MascotMessage mood={isCleared ? "cheer" : "proud"} size={88}>
                {Messages.getMahjongEnding(run.ending)}
            </MascotMessage>

            <section className="card score">
                <p className="score__value">{TimeUtils.formatElapsed(run.elapsedMilliseconds)}</p>
                <p className="score__label">{labels.time}</p>
                {!isCleared && <p className="score__time">{Messages.getMahjongTilesLeft(run.tilesLeft)}</p>}
                {isNewRecord ? (
                    <p className="milestone milestone--record">
                        <MedalIcon />
                        {labels.newRecord}
                    </p>
                ) : (
                    <p className="challenge-record">{Messages.getMahjongRecord(run.previousRecordMilliseconds)}</p>
                )}
                {isCleared && run.hintsUsed > 0 && <p className="hint">{Messages.getMahjongRecordsNeedNoHints()}</p>}
            </section>
        </>
    );
}
