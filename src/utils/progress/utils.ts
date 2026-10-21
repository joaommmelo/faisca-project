import { FactsUtils } from "../facts/utils.ts";
import { LeitnerUtils, type LeitnerBoxes } from "../leitner/utils.ts";

export class ProgressUtils {
    // 0 = never practised, then the Leitner box (1 to 5).
    public static getLevel(boxes: LeitnerBoxes, firstFactor: number, secondFactor: number): number {
        const factId: string = FactsUtils.getFactId(firstFactor, secondFactor);
        if (!LeitnerUtils.isPractised(boxes, factId)) {
            return 0;
        }
        return LeitnerUtils.getBox(boxes, factId);
    }

    public static getLevels(): number[] {
        return [0, 1, 2, 3, 4, 5];
    }

    public static countMastered(boxes: LeitnerBoxes): number {
        return Object.values(boxes).filter((box) => box === LeitnerUtils.getMaxBox()).length;
    }

    public static getTotalFacts(): number {
        return FactsUtils.getAll().length;
    }
}
