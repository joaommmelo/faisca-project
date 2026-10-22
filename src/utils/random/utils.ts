export type RandomSource = () => number;

export interface WeightedPickOptions<T> {
    items: T[];
    count: number;
    getWeight: (item: T) => number;
    random?: RandomSource;
}

export class RandomUtils {
    public static shuffle<T>(items: T[], random: RandomSource = Math.random): T[] {
        const shuffled: T[] = [...items];
        for (let index = shuffled.length - 1; index > 0; index--) {
            const swapIndex: number = Math.floor(random() * (index + 1));
            [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
        }
        return shuffled;
    }

    public static isHeads(random: RandomSource = Math.random): boolean {
        return random() < 0.5;
    }

    // Both ends included.
    public static integerBetween(min: number, max: number, random: RandomSource = Math.random): number {
        if (max < min) {
            throw new Error(`Empty range: ${min} to ${max}.`);
        }
        return min + Math.floor(random() * (max - min + 1));
    }

    public static pickOne<T>(items: T[], random: RandomSource = Math.random): T {
        if (items.length === 0) {
            throw new Error("Cannot pick from an empty list.");
        }
        return items[Math.floor(random() * items.length)];
    }

    public static pickWeightedWithoutReplacement<T>(options: WeightedPickOptions<T>): T[] {
        const random: RandomSource = options.random ?? Math.random;
        const remaining: T[] = [...options.items];
        const picked: T[] = [];

        while (picked.length < options.count && remaining.length > 0) {
            const totalWeight: number = remaining.reduce((sum, item) => sum + options.getWeight(item), 0);
            const target: number = random() * totalWeight;
            const pickedIndex: number = (() => {
                let accumulatedWeight: number = 0;
                for (let index = 0; index < remaining.length; index++) {
                    accumulatedWeight += options.getWeight(remaining[index]);
                    if (target < accumulatedWeight) {
                        return index;
                    }
                }
                // Floating-point rounding can leave target equal to the total; the last item owns that edge.
                return remaining.length - 1;
            })();

            picked.push(remaining[pickedIndex]);
            remaining.splice(pickedIndex, 1);
        }

        return picked;
    }
}
