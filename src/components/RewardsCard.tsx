import type { Labels } from "../copy/copy.ts";
import { Messages } from "../utils/messages.ts";
import type { Milestone } from "../utils/progression/utils.ts";
import { CoinIcon, SparkIcon, StarIcon } from "./Icons.tsx";

interface RewardsCardProps {
    milestones: Milestone[];
    isNewRecord: boolean;
}

// What a game earned: today's mission, coins, a record, new levels. Nothing shows when it earned none.
export function RewardsCard({ milestones, isNewRecord }: RewardsCardProps) {
    const labels: Labels = Messages.getLabels();
    const mission: Milestone | null = milestones.find((milestone) => milestone.kind === "mission") ?? null;
    const coinsEarned: number = milestones.filter((milestone) => milestone.kind === "coin").length;
    const levelUps: Milestone[] = milestones.filter((milestone) => milestone.kind === "level-up");
    if (mission === null && coinsEarned === 0 && levelUps.length === 0 && !isNewRecord) {
        return null;
    }

    return (
        <section className="card rewards" aria-label={labels.achievements}>
            <ul className="milestones milestones--summary">
                {mission !== null && (
                    <li className="milestone milestone--mission">
                        <SparkIcon />
                        {Messages.getMilestone(mission)}
                    </li>
                )}
                {coinsEarned > 0 && (
                    <li className="milestone milestone--coin">
                        <CoinIcon />
                        {labels.coinsEarned(coinsEarned)}
                    </li>
                )}
                {isNewRecord && (
                    <li className="milestone milestone--record">
                        <StarIcon />
                        {labels.newRecord}
                    </li>
                )}
                {levelUps.map((milestone, index) => (
                    <li key={index} className="milestone milestone--level-up">
                        <StarIcon />
                        {Messages.getMilestone(milestone)}
                    </li>
                ))}
            </ul>
        </section>
    );
}
