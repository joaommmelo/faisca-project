import { useId } from "react";
import { FactorGameUtils } from "../utils/factorGame/utils.ts";
import { LevelsUtils } from "../utils/levels/utils.ts";
import { Messages } from "../utils/messages.ts";
import { OperationsUtils } from "../utils/operations/utils.ts";
import type { Profile } from "../utils/profiles/utils.ts";

interface GameTilesProps {
    profile: Profile;
    onChooseMix: () => void;
    onOpenFactorGame: () => void;
    onOpenChallenge: () => void;
}

// Under the operations, the ways of playing them: the mix and Descobre a conta side by side, in the same tiles as the
// operations, and the challenge for adults across the width when it is switched on.
export function GameTiles({ profile, onChooseMix, onOpenFactorGame, onOpenChallenge }: GameTilesProps) {
    const titleId: string = useId();
    const { settings } = profile;

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
                        <span className="practice__summary">
                            {Messages.getLevelName(LevelsUtils.getTrack(profile.tracks, FactorGameUtils.getTrackId()).level)}
                        </span>
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
            </ul>
        </section>
    );
}
