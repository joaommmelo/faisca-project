export interface Fact {
    id: string;
    smallerFactor: number;
    largerFactor: number;
    product: number;
}

export class FactsUtils {
    public static getValidFactors(): number[] {
        return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    }

    public static isValidFactor(value: number): boolean {
        return this.getValidFactors().includes(value);
    }

    public static getDefaultTables(): number[] {
        return [2, 5, 10];
    }

    public static getFactId(firstFactor: number, secondFactor: number): string {
        return `${Math.min(firstFactor, secondFactor)}x${Math.max(firstFactor, secondFactor)}`;
    }

    public static getAll(): Fact[] {
        const facts: Fact[] = [];
        for (const smallerFactor of this.getValidFactors()) {
            for (const largerFactor of this.getValidFactors()) {
                if (largerFactor < smallerFactor) {
                    continue;
                }
                facts.push({
                    id: this.getFactId(smallerFactor, largerFactor),
                    smallerFactor,
                    largerFactor,
                    product: smallerFactor * largerFactor
                });
            }
        }
        return facts;
    }

    public static getForTables(tables: number[]): Fact[] {
        return this.getAll().filter((fact) => tables.includes(fact.smallerFactor) || tables.includes(fact.largerFactor));
    }
}
