import { Celebration } from "../components/Celebration.tsx";
import { Equation } from "../components/Equation.tsx";
import { BackIcon, HomeIcon, PlayIcon, StarIcon } from "../components/Icons.tsx";
import { MascotMessage } from "../components/Mascot.tsx";
import type { Labels } from "../copy/copy.ts";
import { useFocusOnMount } from "../hooks/useFocusOnMount.ts";
import { ChallengeUtils, type ChallengeRun } from "../utils/challenge/utils.ts";
import { Messages, type Feedback } from "../utils/messages.ts";
import type { Profile } from "../utils/profiles/utils.ts";

interface ChallengeScreenProps {
    profile: Profile;
    // The run that just ended, or null before the first one.
    run: ChallengeRun | null;
    onPlay: () => void;
    onHome: () => void;
}

// Before a run: how it works and the record. After one: how it ended, how far it went and whether it is a new record.
export function ChallengeScreen({ profile, run, onPlay, onHome }: ChallengeScreenProps) {
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
                    ∞
                </span>
                {Messages.getChallengeName()}
            </h1>

            {run === null ? <ChallengeRules record={profile.challengeRecord} /> : <ChallengeResult run={run} />}

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

function ChallengeRules({ record }: { record: number | null }) {
    return (
        <>
            <MascotMessage mood="happy" size={80}>
                {Messages.getChallengeGreeting()}
            </MascotMessage>
            <section className="card stack card--challenge">
                <ul className="challenge-rules">
                    {Messages.getChallengeRules().map((rule) => (
                        <li key={rule}>{rule}</li>
                    ))}
                </ul>
                <p className="challenge-record">{Messages.getChallengeRecord(record)}</p>
            </section>
        </>
    );
}

function ChallengeResult({ run }: { run: ChallengeRun }) {
    const ending: Feedback = Messages.getChallengeEnding(run);
    const isNewRecord: boolean = ChallengeUtils.isNewRecord(run);

    return (
        <>
            {isNewRecord && <Celebration />}
            <MascotMessage mood={isNewRecord ? "cheer" : "proud"} size={88}>
                {ending.title}
            </MascotMessage>

            {run.ending !== "stop" && (
                <section className="card challenge-last" aria-label={Messages.getLabels().lastQuestion(Messages.getEquationText(run.lastQuestion))}>
                    <Equation question={run.lastQuestion} typedAnswer="" isAnswered />
                    {ending.lines.map((line) => (
                        <p key={line} className="hint">
                            {line}
                        </p>
                    ))}
                </section>
            )}

            <section className="card score">
                <p className="score__value">{run.correctCount}</p>
                <p className="score__label">{Messages.getLabels().correctAnswers(run.correctCount)}</p>
                <p className="score__time">{Messages.getChallengeLevelReached(run.correctCount)}</p>
                {isNewRecord ? (
                    <p className="milestone milestone--record">
                        <StarIcon />
                        {Messages.getLabels().newRecord}
                    </p>
                ) : (
                    <p className="challenge-record">{Messages.getChallengeRecord(run.previousRecord)}</p>
                )}
            </section>
        </>
    );
}
