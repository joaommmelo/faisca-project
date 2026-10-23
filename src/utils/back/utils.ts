// Android's back gesture, from the bottom up. app: any screen but the home one goes home. screen: a game asks
// whether to leave, as its «Sair» does. sheet: an open sheet closes with the answer that changes nothing.
export type BackLayer = "app" | "screen" | "sheet";

export interface BackEntry {
    layer: BackLayer;
    onBack: () => void;
}

export class BackUtils {
    public static getValidLayers(): BackLayer[] {
        return ["app", "screen", "sheet"];
    }

    // The highest layer answers; within a layer, the last one to open. No entry: back leaves the app.
    public static getAnswering(entries: BackEntry[]): BackEntry | null {
        return entries.reduce<BackEntry | null>((answering, entry) => {
            if (answering === null) {
                return entry;
            }
            return this.getRank(entry.layer) >= this.getRank(answering.layer) ? entry : answering;
        }, null);
    }

    private static getRank(layer: BackLayer): number {
        return this.getValidLayers().indexOf(layer);
    }
}
