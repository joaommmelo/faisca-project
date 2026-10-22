import type { Fact } from "../facts/utils.ts";

// key → Leitner box (1 to 5): a fact ("7x8") or a skill ("addition:easy:carry"). An absent key has never been practised.
export type LeitnerBoxes = Record<string, number>;

export class LeitnerUtils {
    public static getMinBox(): number {
        return 1;
    }

    public static getMaxBox(): number {
        return 5;
    }

    // Facts with these factors are easy enough to deserve fewer draws.
    public static getEasyFactors(): number[] {
        return [1, 10];
    }

    public static getEasyFactWeightMultiplier(): number {
        return 0.3;
    }

    public static isPractised(boxes: LeitnerBoxes, factId: string): boolean {
        return boxes[factId] !== undefined;
    }

    // Facts never practised are treated as the weakest box for drawing and answer format.
    public static getBox(boxes: LeitnerBoxes, factId: string): number {
        if (!this.isPractised(boxes, factId)) {
            return this.getMinBox();
        }
        return boxes[factId];
    }

    public static applyAnswer(boxes: LeitnerBoxes, factId: string, isCorrect: boolean): LeitnerBoxes {
        const nextBox: number = isCorrect ? Math.min(this.getBox(boxes, factId) + 1, this.getMaxBox()) : this.getMinBox();
        return { ...boxes, [factId]: nextBox };
    }

    // The weaker the box, the more often it is drawn.
    public static getBoxDrawWeight(boxes: LeitnerBoxes, key: string): number {
        return 1 / this.getBox(boxes, key);
    }

    // A skill sums up many different questions, so one slip only takes it down one box instead of back to the start.
    public static applySkillAnswer(boxes: LeitnerBoxes, skillId: string, isCorrect: boolean): LeitnerBoxes {
        const box: number = this.getBox(boxes, skillId);
        const nextBox: number = isCorrect ? Math.min(box + 1, this.getMaxBox()) : Math.max(box - 1, this.getMinBox());
        return { ...boxes, [skillId]: nextBox };
    }

    public static getDrawWeight(fact: Fact, boxes: LeitnerBoxes): number {
        const boxWeight: number = this.getBoxDrawWeight(boxes, fact.id);
        const isEasyFact: boolean = this.getEasyFactors().some((factor) => fact.smallerFactor === factor || fact.largerFactor === factor);
        return isEasyFact ? boxWeight * this.getEasyFactWeightMultiplier() : boxWeight;
    }
}
