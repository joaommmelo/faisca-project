import moment from "moment";
import { BackIcon, LockIcon } from "../components/Icons.tsx";
import { LevelMeter } from "../components/LevelMeter.tsx";
import { MascotMessage } from "../components/Mascot.tsx";
import { ProgressMap } from "../components/ProgressMap.tsx";
import { useFocusOnMount } from "../hooks/useFocusOnMount.ts";
import { ArithmeticUtils } from "../utils/arithmetic/utils.ts";
import { DifficultiesUtils } from "../utils/difficulties/utils.ts";
import { LevelsUtils } from "../utils/levels/utils.ts";
import { Messages } from "../utils/messages.ts";
import type { ArithmeticOperation } from "../utils/operations/utils.ts";
import type { Profile } from "../utils/profiles/utils.ts";
import { ProgressUtils } from "../utils/progress/utils.ts";
import type { BestTime } from "../utils/records/utils.ts";
import { StatsUtils } from "../utils/stats/utils.ts";
import { TimeUtils } from "../utils/time/utils.ts";

interface ProgressScreenProps {
    profile: Profile;
    onBack: () => void;
}

export function ProgressScreen({ profile, onBack }: ProgressScreenProps) {
    const headingRef = useFocusOnMount<HTMLHeadingElement>();
    const masteredCount: number = ProgressUtils.countMastered(profile.boxes);
    const visibleStreak: number = StatsUtils.getVisibleStreak(profile.stats, moment());

    return (
        <main className="screen">
            <div className="screen-header">
                <button type="button" className="button button--ghost" onClick={onBack}>
                    <BackIcon />
                    Início
                </button>
            </div>

            <h1 ref={headingRef} tabIndex={-1} className="page-title">
                O teu progresso, {profile.name}
            </h1>

            <MascotMessage mood="proud" size={96}>
                {Messages.getProgressCheer(masteredCount)}
            </MascotMessage>

            <ul className="stats" aria-label="Números do teu progresso">
                <li className="stat">
                    <span className="stat__value">{profile.stats.sessionsCompleted}</span>
                    <span className="stat__label">jogos</span>
                </li>
                <li className="stat">
                    <span className="stat__value">{profile.stats.practiceDays}</span>
                    <span className="stat__label">dias de prática</span>
                </li>
                <li className="stat">
                    <span className="stat__value">{profile.wallet.coins}</span>
                    <span className="stat__label">{profile.wallet.coins === 1 ? "moeda" : "moedas"}</span>
                </li>
                {visibleStreak > 0 && (
                    <li className="stat">
                        <span className="stat__value">{visibleStreak}</span>
                        <span className="stat__label">{visibleStreak === 1 ? "dia seguido" : "dias seguidos"}</span>
                    </li>
                )}
            </ul>

            <RecordsCard profile={profile} />

            <ArithmeticProgress profile={profile} operation="addition" />
            <ArithmeticProgress profile={profile} operation="subtraction" />

            <section className="card card--multiplication">
                <h2 className="section-title">{Messages.getOperationName("multiplication")}</h2>
                <LevelMeter track={LevelsUtils.getTrack(profile.tracks, LevelsUtils.getTrackId("multiplication", null))} />
                <p className="hint hint--left">
                    {masteredCount} de {ProgressUtils.getTotalFacts()} contas de cor
                </p>
                <ProgressMap boxes={profile.boxes} />
            </section>

            <section className="card card--division">
                <h2 className="section-title">{Messages.getOperationName("division")}</h2>
                <LevelMeter track={LevelsUtils.getTrack(profile.tracks, LevelsUtils.getTrackId("division", null))} />
                <p className="hint hint--left">As divisões treinam as mesmas contas do mapa da multiplicação.</p>
            </section>
        </main>
    );
}

// Best times of perfect sessions, one per way of playing.
function RecordsCard({ profile }: { profile: Profile }) {
    const bestTimes: BestTime[] = Object.values(profile.records);

    return (
        <section className="card">
            <h2 className="section-title">Recordes</h2>
            {bestTimes.length === 0 ? (
                <p className="hint hint--left">Liga o relógio e acerta todas à primeira para teres o teu primeiro recorde.</p>
            ) : (
                <ul className="records">
                    {bestTimes.map((bestTime) => (
                        <li key={Messages.getRecordCategoryName(bestTime.category)} className="record">
                            <span className="record__name">{Messages.getRecordCategoryName(bestTime.category)}</span>
                            <span className="record__time">{TimeUtils.formatElapsed(bestTime.milliseconds)}</span>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

interface ArithmeticProgressProps {
    profile: Profile;
    operation: ArithmeticOperation;
}

// One row per difficulty: its level and how each skill is going. Locked difficulties show what is ahead.
function ArithmeticProgress({ profile, operation }: ArithmeticProgressProps) {
    return (
        <section className={`card card--${operation}`}>
            <h2 className="section-title">{Messages.getOperationName(operation)}</h2>
            <ul className="difficulty-progress">
                {DifficultiesUtils.getValidDifficulties().map((difficulty) => {
                    const isUnlocked: boolean = DifficultiesUtils.isUnlocked(difficulty, profile.unlockedDifficulties[operation]);
                    return (
                        <li key={difficulty} className="difficulty-progress__item">
                            <p className="difficulty-progress__name">
                                {Messages.getDifficultyName(difficulty)}
                                <span className="difficulty-progress__range"> {Messages.getDifficultyRange(difficulty)}</span>
                            </p>
                            {isUnlocked ? (
                                <>
                                    <LevelMeter track={LevelsUtils.getTrack(profile.tracks, LevelsUtils.getTrackId(operation, difficulty))} />
                                    <ul className="skills">
                                        {ArithmeticUtils.getSkills(operation, difficulty).map((skill) => {
                                            const mastery: number = ProgressUtils.getMastery(
                                                profile.skillBoxes,
                                                ArithmeticUtils.getSkillId(operation, difficulty, skill)
                                            );
                                            return (
                                                <li key={skill} className="skill">
                                                    <span className={`skill__swatch level-${mastery}`} aria-hidden="true" />
                                                    <span className="skill__name">{Messages.getSkillName(skill)}</span>
                                                    <span className="skill__mastery">{Messages.getMasteryLabel(mastery)}</span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </>
                            ) : (
                                <p className="locked">
                                    <LockIcon />
                                    Por desbloquear
                                </p>
                            )}
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
