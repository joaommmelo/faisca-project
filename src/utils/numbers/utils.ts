export class NumbersUtils {
    // European Portuguese groups the thousands with a space only from five digits on: 1000, 12 345, 1 234 567.
    public static format(value: number): string {
        return new Intl.NumberFormat("pt-PT", { useGrouping: "min2" }).format(value);
    }
}
