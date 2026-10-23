import { LevelsUtils, type Tracks } from "../levels/utils.ts";
import type { Milestone } from "../progression/utils.ts";

export interface StarsProgress {
    stars: number;
    // Points earned towards the next star, and the points it asks for.
    points: number;
    pointsToNextStar: number;
}

// The child's own progress across every game: each point a game's level earns also counts towards the stars, so
// they come straight from the levels already kept and never go down. The games for adults have no level and earn
// none.
export class StarsUtils {
    // The next star after N asks for 10 × (N + 1) right typed answers: the first comes in the first game.
    public static getAnswersPerStep(): number {
        return 10;
    }

    public static getPointsToNextStar(stars: number): number {
        return LevelsUtils.getPointsForAnswer("keypad") * this.getAnswersPerStep() * (stars + 1);
    }

    public static getTotalPoints(tracks: Tracks): number {
        return Object.values(tracks).reduce((total, track) => total + LevelsUtils.getPointsToReach(track.level) + track.points, 0);
    }

    public static getProgress(tracks: Tracks): StarsProgress {
        let stars: number = 0;
        let points: number = this.getTotalPoints(tracks);
        while (points >= this.getPointsToNextStar(stars)) {
            points -= this.getPointsToNextStar(stars);
            stars += 1;
        }
        return { stars, points, pointsToNextStar: this.getPointsToNextStar(stars) };
    }

    // Right typed answers still needed; multiple-choice ones count half.
    public static getAnswersToNextStar(progress: StarsProgress): number {
        return Math.ceil((progress.pointsToNextStar - progress.points) / LevelsUtils.getPointsForAnswer("keypad"));
    }

    // How far towards the next star, from 0 to 1, for the bar.
    public static getProgressRatio(progress: StarsProgress): number {
        return progress.points / progress.pointsToNextStar;
    }

    // One milestone per star an answer reached, between the levels before it and after it.
    public static getMilestones(tracksBefore: Tracks, tracksAfter: Tracks): Milestone[] {
        const before: number = this.getProgress(tracksBefore).stars;
        const after: number = this.getProgress(tracksAfter).stars;
        return Array.from({ length: after - before }, (): Milestone => ({ kind: "star" }));
    }
}
