import type { Milestone } from "../utils/progression/utils.ts";
import { CoinIcon, LevelIcon, SparkIcon, StarIcon } from "./Icons.tsx";

// The same picture for a milestone wherever it shows: in the sheet after an answer and in a game's achievements.
export function MilestoneIcon({ kind }: { kind: Milestone["kind"] }) {
    switch (kind) {
        case "coin":
            return <CoinIcon />;
        case "star":
            return <StarIcon />;
        case "mission":
            return <SparkIcon />;
        default:
            return <LevelIcon />;
    }
}
