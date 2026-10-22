import { useId } from "react";
import { FactorGameUtils } from "../utils/factorGame/utils.ts";
import { LevelsUtils } from "../utils/levels/utils.ts";
import { MemoryGameUtils } from "../utils/memoryGame/utils.ts";
import { Messages } from "../utils/messages.ts";
import { OperationsUtils } from "../utils/operations/utils.ts";
import type { Profile } from "../utils/profiles/utils.ts";
import { RoundGameUtils, type RoundGameId } from "../utils/roundGame/utils.ts";
import { GameSymbol } from "./GameSymbol.tsx";

interface GameTilesProps {
    profile: Profile;
    onChooseMix: () => void;
    onOpenFactorGame: () => void;
    onOpenRoundGame: (game: RoundGameId) => void;
    onOpenMemoryGame: () => void;
    onOpenMahjong: () => void;
    onOpenChallenge: () => void;
}

// Under the operations, the games: two by two, in the same tiles as the operations, each with its level. The games
// for adults go across the width when they are switched on.
export function GameTiles({ profile, onChooseMix, onOpenFactorGame, onOpenRoundGame, onOpenMemoryGame, onOpenMahjong, onOpenChallenge }: GameTilesProps) {
    const titleId: string = useId();
    const { settings } = profile;
    const getLevelSummary = (trackId: string): string => Messages.getLevelName(LevelsUtils.getTrack(profile.tracks, trackId).level);

    return (
        <section aria-labelledby={titleId}>
            <h2 id={titleId} className="section-title">
                {Messages.getLabels().gamesTitle}
            </h2>
            <ul className="practices">
                <li>
                    <button type="button" className="practice practice--mix" onClick={onChooseMix}>
                        <span className="practice__symbol practice__symbol--mix" aria-hidden="true">
                            {OperationsUtils.getValidOperations().map((operation) => (
                                <span key={operation}>{OperationsUtils.getSymbol(operation)}</span>
                            ))}
                        </span>
                        <span className="practice__name">{Messages.getMixName()}</span>
                        <span className="practice__summary">{settings.mix.operations.map((operation) => OperationsUtils.getSymbol(operation)).join(" ")}</span>
                    </button>
                </li>
                <li>
                    <button type="button" className="practice practice--multiplication practice--factor-game" onClick={onOpenFactorGame}>
                        <span className="practice__symbol practice__symbol--factors" aria-hidden="true">
                            ?×?
                        </span>
                        <span className="practice__name">{Messages.getFactorGameName()}</span>
                        <span className="practice__summary">{getLevelSummary(FactorGameUtils.getTrackId())}</span>
                    </button>
                </li>
                {RoundGameUtils.getValidGames().map((game) => (
                    <li key={game}>
                        <button type="button" className={`practice practice--${game}`} onClick={() => onOpenRoundGame(game)}>
                            <span className="practice__symbol practice__symbol--game" aria-hidden="true">
                                <GameSymbol game={game} />
                            </span>
                            <span className="practice__name">{Messages.getRoundGameName(game)}</span>
                            <span className="practice__summary">{getLevelSummary(RoundGameUtils.getTrackId(game))}</span>
                        </button>
                    </li>
                ))}
                <li>
                    <button type="button" className="practice practice--memory" onClick={onOpenMemoryGame}>
                        <span className="practice__symbol practice__symbol--game" aria-hidden="true">
                            <GameSymbol game="memory" />
                        </span>
                        <span className="practice__name">{Messages.getMemoryGameName()}</span>
                        <span className="practice__summary">{getLevelSummary(MemoryGameUtils.getTrackId())}</span>
                    </button>
                </li>
                {settings.isChallengeEnabled && (
                    <li className="practices__wide">
                        <button type="button" className="practice practice--challenge" onClick={onOpenChallenge}>
                            <span className="practice__symbol" aria-hidden="true">
                                ∞
                            </span>
                            <span className="practice__text">
                                <span className="practice__name">{Messages.getChallengeName()}</span>
                                <span className="practice__summary">{Messages.getChallengeSummary(profile.challengeRecord)}</span>
                            </span>
                        </button>
                    </li>
                )}
                {settings.isMahjongEnabled && (
                    <li className="practices__wide">
                        <button type="button" className="practice practice--challenge" onClick={onOpenMahjong}>
                            <span className="practice__symbol practice__symbol--game" aria-hidden="true">
                                <GameSymbol game="mahjong" />
                            </span>
                            <span className="practice__text">
                                <span className="practice__name">{Messages.getMahjongName()}</span>
                                <span className="practice__summary">{Messages.getMahjongSummary(profile.mahjongRecord)}</span>
                            </span>
                        </button>
                    </li>
                )}
            </ul>
        </section>
    );
}
