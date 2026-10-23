import type { Labels } from "../copy/copy.ts";
import { Messages } from "../utils/messages.ts";
import type { DailyMission, MissionGame, MissionWeekDay } from "../utils/missions/utils.ts";
import { OperationsUtils } from "../utils/operations/utils.ts";
import { GameSymbol } from "./GameSymbol.tsx";
import { CheckIcon, CoinIcon, PlayIcon, SparkIcon } from "./Icons.tsx";

interface MissionCardProps {
    mission: DailyMission;
    week: MissionWeekDay[];
    onOpen: (game: MissionGame) => void;
}

// Today's game, in its colour and with its symbol, so a child who does not read yet knows which one to play; a coin
// for it, then a big tick once it is done. Under it, the week: a spark in each day done, an empty circle otherwise.
export function MissionCard({ mission, week, onOpen }: MissionCardProps) {
    const labels: Labels = Messages.getLabels();
    const doneCount: number = week.filter((weekDay) => weekDay.isDone).length;

    return (
        <section className={`card mission card--${getColour(mission.game)}${mission.isDone ? " mission--done" : ""}`} aria-label={labels.missionTitle}>
            <button type="button" className="mission__button" onClick={() => onOpen(mission.game)}>
                <span className={`practice__symbol mission__symbol ${getSymbolClass(mission.game)}`} aria-hidden="true">
                    <MissionSymbol game={mission.game} />
                    {mission.isDone && (
                        <span className="mission__badge">
                            <CheckIcon />
                        </span>
                    )}
                </span>
                <span className="mission__text">
                    <span className="mission__title">{labels.missionTitle}</span>
                    <span className="mission__name">{Messages.getMissionGameName(mission.game)}</span>
                </span>
                {!mission.isDone && (
                    <span className="mission__go" aria-hidden="true">
                        <PlayIcon />
                    </span>
                )}
                <span className="mission__state">
                    {!mission.isDone && <CoinIcon />}
                    {Messages.getMissionState(mission.isDone)}
                </span>
            </button>

            <div className="mission-week" role="img" aria-label={labels.missionWeek(doneCount, week.length)}>
                {week.map((weekDay, index) => (
                    <span
                        key={weekDay.day}
                        className={`mission-week__day${weekDay.isToday ? " mission-week__day--today" : ""}${weekDay.isDone ? " mission-week__day--done" : ""}`}
                    >
                        <span className="mission-week__circle">{weekDay.isDone && <SparkIcon />}</span>
                        <span className="mission-week__initial">{labels.weekdayInitials[index]}</span>
                    </span>
                ))}
            </div>
        </section>
    );
}

function MissionSymbol({ game }: { game: MissionGame }) {
    if (OperationsUtils.isValidOperation(game)) {
        return OperationsUtils.getSymbol(game);
    }
    if (game === "factor-game") {
        return "?×?";
    }
    return <GameSymbol game={game} />;
}

// The colours of the game's own tile: Descobre a conta is the multiplication's.
function getColour(game: MissionGame): string {
    return game === "factor-game" ? "multiplication" : game;
}

function getSymbolClass(game: MissionGame): string {
    if (OperationsUtils.isValidOperation(game)) {
        return "";
    }
    return game === "factor-game" ? "practice__symbol--factors" : "practice__symbol--game";
}
