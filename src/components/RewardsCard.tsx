import type { Labels } from "../copy/copy.ts";
import { Messages } from "../utils/messages.ts";
import type { Milestone } from "../utils/progression/utils.ts";
import { MedalIcon } from "./Icons.tsx";
import { MilestoneIcon } from "./MilestoneIcon.tsx";

interface RewardsCardProps {
    milestones: Milestone[];
    isNewRecord: boolean;
}

// What a game earned: today's mission, stars, coins, a record, new levels. Nothing shows when it earned none.
export function RewardsCard({ milestones, isNewRecord }: RewardsCardProps) {
    const labels: Labels = Messages.getLabels();
    const mission: Milestone | null = milestones.find((milestone) => milestone.kind === "mission") ?? null;
    const starsEarned: number = milestones.filter((milestone) => milestone.kind === "star").length;
    const coinsEarned: number = milestones.filter((milestone) => milestone.kind === "coin").length;
    const levelUps: Milestone[] = milestones.filter((milestone) => milestone.kind === "level-up");
    if (mission === null && starsEarned === 0 && coinsEarned === 0 && levelUps.length === 0 && !isNewRecord) {
        return null;
    }

    return (
        <section className="card rewards" aria-label={labels.achievements}>
            <ul className="milestones milestones--summary">
                {mission !== null && (
                    <li className="milestone milestone--mission">
                        <MilestoneIcon kind="mission" />
                        {Messages.getMilestone(mission)}
                    </li>
                )}
                {starsEarned > 0 && (
                    <li className="milestone milestone--star">
                        <MilestoneIcon kind="star" />
                        {labels.starsEarned(starsEarned)}
                    </li>
                )}
                {coinsEarned > 0 && (
                    <li className="milestone milestone--coin">
                        <MilestoneIcon kind="coin" />
                        {labels.coinsEarned(coinsEarned)}
                    </li>
                )}
                {isNewRecord && (
                    <li className="milestone milestone--record">
                        <MedalIcon />
                        {labels.newRecord}
                    </li>
                )}
                {levelUps.map((milestone, index) => (
                    <li key={index} className="milestone milestone--level-up">
                        <MilestoneIcon kind="level-up" />
                        {Messages.getMilestone(milestone)}
                    </li>
                ))}
            </ul>
        </section>
    );
}
