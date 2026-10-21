import moment from "moment";
import { BackIcon } from "../components/Icons.tsx";
import { MascotMessage } from "../components/Mascot.tsx";
import { ProgressMap } from "../components/ProgressMap.tsx";
import { useFocusOnMount } from "../hooks/useFocusOnMount.ts";
import { Messages } from "../utils/messages.ts";
import type { Profile } from "../utils/profiles/utils.ts";
import { ProgressUtils } from "../utils/progress/utils.ts";
import { StatsUtils } from "../utils/stats/utils.ts";

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
                    <span className="stat__value">
                        {masteredCount}/{ProgressUtils.getTotalFacts()}
                    </span>
                    <span className="stat__label">contas de cor</span>
                </li>
                <li className="stat">
                    <span className="stat__value">{profile.stats.sessionsCompleted}</span>
                    <span className="stat__label">jogos</span>
                </li>
                <li className="stat">
                    <span className="stat__value">{profile.stats.practiceDays}</span>
                    <span className="stat__label">dias de prática</span>
                </li>
                {visibleStreak > 0 && (
                    <li className="stat">
                        <span className="stat__value">{visibleStreak}</span>
                        <span className="stat__label">{visibleStreak === 1 ? "dia seguido" : "dias seguidos"}</span>
                    </li>
                )}
            </ul>

            <section className="card">
                <h2 className="section-title">Mapa das tabuadas</h2>
                <ProgressMap boxes={profile.boxes} />
            </section>
        </main>
    );
}
