import moment from "moment";
import { BackIcon, LockIcon } from "../components/Icons.tsx";
import { LevelMeter } from "../components/LevelMeter.tsx";
import { MascotMessage } from "../components/Mascot.tsx";
import { ProgressMap } from "../components/ProgressMap.tsx";
import type { Labels } from "../copy/copy.ts";
import { useFocusOnMount } from "../hooks/useFocusOnMount.ts";
import { ArithmeticUtils } from "../utils/arithmetic/utils.ts";
import { DifficultiesUtils } from "../utils/difficulties/utils.ts";
import { FactorGameUtils } from "../utils/factorGame/utils.ts";
import { LevelsUtils, type TrackProgress } from "../utils/levels/utils.ts";
import { MemoryGameUtils } from "../utils/memoryGame/utils.ts";
import { Messages } from "../utils/messages.ts";
import { OperationsUtils, type Operation } from "../utils/operations/utils.ts";
import type { Profile } from "../utils/profiles/utils.ts";
import { ProgressUtils } from "../utils/progress/utils.ts";
import type { BestTime } from "../utils/records/utils.ts";
import { RoundGameUtils, type RoundGameId } from "../utils/roundGame/utils.ts";
import { StatsUtils } from "../utils/stats/utils.ts";
import { TimeUtils } from "../utils/time/utils.ts";

interface ProgressScreenProps {
    profile: Profile;
    onBack: () => void;
}

export function ProgressScreen({ profile, onBack }: ProgressScreenProps) {
    const headingRef = useFocusOnMount<HTMLHeadingElement>();
    const labels: Labels = Messages.getLabels();
    const masteredCount: number = ProgressUtils.countMastered(profile.boxes);
    const visibleStreak: number = StatsUtils.getVisibleStreak(profile.stats, moment());

    return (
        <main className="screen">
            <div className="screen-header">
                <button type="button" className="button button--ghost" onClick={onBack}>
                    <BackIcon />
                    {labels.home}
                </button>
            </div>

            <h1 ref={headingRef} tabIndex={-1} className="page-title">
                {labels.progressTitle(profile.name)}
            </h1>

            <MascotMessage mood="proud" size={96}>
                {Messages.getProgressCheer(masteredCount)}
            </MascotMessage>

            <ul className="stats" aria-label={labels.progressNumbers}>
                <li className="stat">
                    <span className="stat__value">{profile.stats.sessionsCompleted}</span>
                    <span className="stat__label">{labels.games(profile.stats.sessionsCompleted)}</span>
                </li>
                <li className="stat">
                    <span className="stat__value">{profile.stats.practiceDays}</span>
                    <span className="stat__label">{labels.practiceDays(profile.stats.practiceDays)}</span>
                </li>
                <li className="stat">
                    <span className="stat__value">{profile.wallet.coins}</span>
                    <span className="stat__label">{labels.coins(profile.wallet.coins)}</span>
                </li>
                {visibleStreak > 0 && (
                    <li className="stat">
                        <span className="stat__value">{visibleStreak}</span>
                        <span className="stat__label">{labels.daysInARow(visibleStreak)}</span>
                    </li>
                )}
            </ul>

            <RecordsCard profile={profile} />

            {OperationsUtils.getValidOperations().map((operation) => (
                <OperationProgress key={operation} profile={profile} operation={operation} />
            ))}

            {/* Its answers also light up the times-table map, with the multiplication. */}
            <section className="card stack card--multiplication">
                <h2 className="section-title">{Messages.getFactorGameName()}</h2>
                <LevelMeter track={LevelsUtils.getTrack(profile.tracks, FactorGameUtils.getTrackId())} help={{ earning: "game", nextSkillName: null }} />
            </section>

            {RoundGameUtils.getValidGames().map((game) => (
                <RoundGameProgress key={game} profile={profile} game={game} />
            ))}

            <section className="card stack card--memory">
                <h2 className="section-title">{Messages.getMemoryGameName()}</h2>
                <LevelMeter track={LevelsUtils.getTrack(profile.tracks, MemoryGameUtils.getTrackId())} help={{ earning: "memory", nextSkillName: null }} />
            </section>
        </main>
    );
}

interface RoundGameProgressProps {
    profile: Profile;
    game: RoundGameId;
}

// The game's level, and how each kind of round is going; the kinds the level has not opened yet show what is ahead.
function RoundGameProgress({ profile, game }: RoundGameProgressProps) {
    const level: number = RoundGameUtils.getLevel(profile, game);
    const openSkills: string[] = RoundGameUtils.getOpenSkills(game, level);

    return (
        <section className={`card stack card--${game}`}>
            <h2 className="section-title">{Messages.getRoundGameName(game)}</h2>
            <LevelMeter
                track={LevelsUtils.getTrack(profile.tracks, RoundGameUtils.getTrackId(game))}
                help={{ earning: "game", nextSkillName: Messages.getNextRoundSkillName(game, level) }}
            />
            <ul className="skills">
                {RoundGameUtils.getSkills(game).map((skill) => {
                    const isOpen: boolean = openSkills.includes(skill);
                    const mastery: number = ProgressUtils.getMastery(profile.skillBoxes, RoundGameUtils.getSkillId(game, skill));
                    return (
                        <li key={skill} className="skill">
                            <span className={`skill__swatch level-${mastery}`} aria-hidden="true" />
                            <span className="skill__name">{Messages.getRoundSkillName(game, skill)}</span>
                            {isOpen ? (
                                <span className="skill__mastery">{Messages.getMasteryLabel(mastery)}</span>
                            ) : (
                                <span className="skill__mastery skill__mastery--locked">
                                    <LockIcon />
                                    {Messages.getLevelName(RoundGameUtils.getSkills(game).indexOf(skill) + 1)}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}

// Best times of perfect sessions, one per way of playing.
function RecordsCard({ profile }: { profile: Profile }) {
    const bestTimes: BestTime[] = Object.values(profile.records);

    return (
        <section className="card">
            <h2 className="section-title">{Messages.getLabels().records}</h2>
            {bestTimes.length === 0 ? (
                <p className="hint hint--left">{Messages.getLabels().noRecords}</p>
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

interface OperationProgressProps {
    profile: Profile;
    operation: Operation;
}

// One row per difficulty: its level and how each skill is going, or the times-table map in Fácil × and ÷.
// Locked difficulties show what is ahead.
function OperationProgress({ profile, operation }: OperationProgressProps) {
    return (
        <section className={`card card--${operation}`}>
            <h2 className="section-title">{Messages.getOperationName(operation)}</h2>
            <ul className="difficulty-progress">
                {DifficultiesUtils.getValidDifficulties().map((difficulty) => {
                    const isUnlocked: boolean = DifficultiesUtils.isUnlocked(difficulty, profile.unlockedDifficulties[operation]);
                    const track: TrackProgress = LevelsUtils.getTrack(profile.tracks, LevelsUtils.getTrackId(operation, difficulty));
                    return (
                        <li key={difficulty} className="difficulty-progress__item">
                            <p className="difficulty-progress__name">
                                {Messages.getDifficultyName(difficulty)}
                                <span className="difficulty-progress__range"> {Messages.getDifficultyDetail(operation, difficulty)}</span>
                            </p>
                            {isUnlocked ? (
                                <>
                                    <LevelMeter
                                        track={track}
                                        help={{ earning: "practice", nextSkillName: Messages.getNextSkillName(operation, difficulty, track.level) }}
                                    />
                                    {OperationsUtils.usesTables(operation, difficulty) && <TablesProgress profile={profile} operation={operation} />}
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
                                    {Messages.getLabels().locked}
                                </p>
                            )}
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}

interface TablesProgressProps {
    profile: Profile;
    operation: Operation;
}

// Division in Fácil trains the same facts as multiplication, so the map lives with multiplication only.
function TablesProgress({ profile, operation }: TablesProgressProps) {
    if (operation === "division") {
        return <p className="hint hint--left">{Messages.getLabels().divisionUsesMap}</p>;
    }
    return (
        <>
            <p className="hint hint--left">{Messages.getLabels().factsKnown(ProgressUtils.countMastered(profile.boxes), ProgressUtils.getTotalFacts())}</p>
            <ProgressMap boxes={profile.boxes} />
        </>
    );
}
