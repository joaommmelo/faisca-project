import { OperationsUtils, type Operation } from "../operations/utils.ts";
import type { Profile } from "../profiles/utils.ts";
import { RandomUtils, type RandomSource } from "../random/utils.ts";

// A place on the board, in half tiles: a tile covers x to x + 2 and y to y + 2, and z is its layer.
export interface MahjongSlot {
    x: number;
    y: number;
    z: number;
}

// A calculation of at most four characters ("12×9", "63−7", "72÷8"), so it fits a tile on a phone.
export interface MahjongFace {
    operation: Operation;
    left: number;
    right: number;
}

export interface MahjongTile {
    id: number;
    slot: MahjongSlot;
    face: MahjongFace;
    value: number;
}

export interface MahjongGame {
    tiles: MahjongTile[];
    removedIds: number[];
    selectedId: number | null;
    // The free pair the hint shows, until one of its tiles is tapped.
    hintedIds: number[];
    hintsUsed: number;
}

// blocked: the tile is not free. select: it is now chosen. deselect: tapped again. match: it made a pair with the
// one chosen, and both leave. switch: it does not match, so it is now the one chosen.
export type MahjongSelectOutcome = "blocked" | "select" | "deselect" | "match" | "switch";

export interface MahjongSelectResult {
    game: MahjongGame;
    outcome: MahjongSelectOutcome;
}

// cleared: no tile left. stuck: tiles left with no pair the player can still take, even after shuffling. stop: the
// player chose to stop.
export type MahjongEnding = "cleared" | "stuck" | "stop";

export interface MahjongRun {
    ending: MahjongEnding;
    elapsedMilliseconds: number;
    hintsUsed: number;
    tilesLeft: number;
    // The record before this run, to tell whether it was beaten.
    previousRecordMilliseconds: number | null;
}

// Mahjong solitaire with calculations, for adults: two free tiles of the same value leave the board (7 × 8 with
// 63 − 7). A tile is free with nothing on top and nothing on its left or on its right. The tiles are dealt from a
// solution, so every board can be cleared; only the order the player takes them can leave it stuck, and then the
// tiles left are dealt again. It never touches the child's progress.
export class MahjongUtils {
    // Deals before giving up on the tiles left: a few positions (one tile on top of its only neighbour) can never
    // be cleared.
    public static getMaxDeals(): number {
        return 200;
    }

    public static getMaxFaceLength(): number {
        return 4;
    }

    // A pyramid of 36 tiles: four rows of six, a tile on each side of the middle rows, two rows of four on top and
    // two tiles at the top.
    public static getLayout(): MahjongSlot[] {
        const slots: MahjongSlot[] = [];
        for (const y of [0, 2, 4, 6]) {
            for (const x of [0, 2, 4, 6, 8, 10]) {
                slots.push({ x, y, z: 0 });
            }
        }
        slots.push({ x: -2, y: 3, z: 0 }, { x: 12, y: 3, z: 0 });
        for (const y of [2, 4]) {
            for (const x of [2, 4, 6, 8]) {
                slots.push({ x, y, z: 1 });
            }
        }
        slots.push({ x: 4, y: 3, z: 2 }, { x: 6, y: 3, z: 2 });
        return slots;
    }

    public static getValue(face: MahjongFace): number {
        return OperationsUtils.calculate(face.operation, face.left, face.right);
    }

    public static getFaceText(face: MahjongFace): string {
        return `${face.left}${OperationsUtils.getSymbol(face.operation)}${face.right}`;
    }

    public static create(random: RandomSource = Math.random): MahjongGame {
        const slots: MahjongSlot[] = this.getLayout();
        const faces: MahjongFace[][] = this.drawPairs(slots.length / 2, random);
        const tiles: MahjongTile[] | null = this.deal(slots, faces, random);
        if (tiles === null) {
            throw new Error("The layout cannot be dealt.");
        }
        return { tiles, removedIds: [], selectedId: null, hintedIds: [], hintsUsed: 0 };
    }

    public static getRemaining(game: MahjongGame): MahjongTile[] {
        return game.tiles.filter((tile) => !game.removedIds.includes(tile.id));
    }

    // Nothing on top, and one side open.
    public static isFree(tile: MahjongTile, remaining: MahjongTile[]): boolean {
        return this.isSlotFree(
            tile.slot,
            remaining.map((other) => other.slot)
        );
    }

    public static getFreePairs(game: MahjongGame): MahjongTile[][] {
        const remaining: MahjongTile[] = this.getRemaining(game);
        const free: MahjongTile[] = remaining.filter((tile) => this.isFree(tile, remaining));
        return free.flatMap((tile, index) =>
            free
                .slice(index + 1)
                .filter((other) => other.value === tile.value)
                .map((other) => [tile, other])
        );
    }

    public static isCleared(game: MahjongGame): boolean {
        return game.removedIds.length === game.tiles.length;
    }

    public static isStuck(game: MahjongGame): boolean {
        return !this.isCleared(game) && this.getFreePairs(game).length === 0;
    }

    public static select(game: MahjongGame, tileId: number): MahjongSelectResult {
        const remaining: MahjongTile[] = this.getRemaining(game);
        const tile: MahjongTile | undefined = remaining.find((candidate) => candidate.id === tileId);
        if (tile === undefined) {
            throw new Error(`Tile ${tileId} is not on the board.`);
        }
        if (!this.isFree(tile, remaining)) {
            return { game, outcome: "blocked" };
        }
        if (game.selectedId === null) {
            return { game: { ...game, selectedId: tileId }, outcome: "select" };
        }
        if (game.selectedId === tileId) {
            return { game: { ...game, selectedId: null }, outcome: "deselect" };
        }
        const selected: MahjongTile | undefined = remaining.find((candidate) => candidate.id === game.selectedId);
        if (selected === undefined) {
            throw new Error(`The chosen tile ${game.selectedId} is not on the board.`);
        }
        if (selected.value !== tile.value) {
            return { game: { ...game, selectedId: tileId }, outcome: "switch" };
        }
        return { game: { ...game, selectedId: null, hintedIds: [], removedIds: [...game.removedIds, selected.id, tile.id] }, outcome: "match" };
    }

    // Shows one free pair. Null when there is none left to show.
    public static hint(game: MahjongGame, random: RandomSource = Math.random): MahjongGame | null {
        const pairs: MahjongTile[][] = this.getFreePairs(game);
        if (pairs.length === 0) {
            return null;
        }
        const pair: MahjongTile[] = RandomUtils.pickOne(pairs, random);
        return { ...game, selectedId: null, hintedIds: pair.map((tile) => tile.id), hintsUsed: game.hintsUsed + 1 };
    }

    // Deals the faces left again on the places left, from a solution. Null when the places left have none.
    public static shuffle(game: MahjongGame, random: RandomSource = Math.random): MahjongGame | null {
        const remaining: MahjongTile[] = this.getRemaining(game);
        const faces: MahjongFace[][] = this.groupPairs(remaining);
        const dealt: MahjongTile[] | null = this.deal(
            remaining.map((tile) => tile.slot),
            faces,
            random
        );
        if (dealt === null) {
            return null;
        }
        // Each place keeps its tile's id; only the faces move.
        const tiles: MahjongTile[] = game.tiles.map((tile) => {
            const redealt: MahjongTile | undefined = dealt.find((candidate) => candidate.slot === tile.slot);
            return redealt === undefined ? tile : { ...redealt, id: tile.id };
        });
        return { ...game, tiles, selectedId: null, hintedIds: [] };
    }

    // Only a board cleared without hints sets a record: the best time.
    public static isNewRecord(run: MahjongRun): boolean {
        return this.countsForRecord(run) && (run.previousRecordMilliseconds === null || run.elapsedMilliseconds < run.previousRecordMilliseconds);
    }

    public static countsForRecord(run: MahjongRun): boolean {
        return run.ending === "cleared" && run.hintsUsed === 0;
    }

    public static finishRun(profile: Profile, run: MahjongRun): Profile {
        return this.isNewRecord(run) ? { ...profile, mahjongRecord: run.elapsedMilliseconds } : profile;
    }

    private static isSlotFree(slot: MahjongSlot, slots: MahjongSlot[]): boolean {
        const overlapsRows = (other: MahjongSlot): boolean => Math.abs(other.y - slot.y) < 2;
        const isCovered: boolean = slots.some((other) => other.z === slot.z + 1 && Math.abs(other.x - slot.x) < 2 && overlapsRows(other));
        if (isCovered) {
            return false;
        }
        const hasLeft: boolean = slots.some((other) => other.z === slot.z && other.x === slot.x - 2 && overlapsRows(other));
        const hasRight: boolean = slots.some((other) => other.z === slot.z && other.x === slot.x + 2 && overlapsRows(other));
        return !hasLeft || !hasRight;
    }

    // Takes the board apart two free places at a time, as a player would, and puts a pair on each two: played back,
    // that is a way to clear it.
    private static deal(slots: MahjongSlot[], pairs: MahjongFace[][], random: RandomSource): MahjongTile[] | null {
        for (let attempt = 0; attempt < this.getMaxDeals(); attempt++) {
            const order: MahjongSlot[] | null = this.drawRemovalOrder(slots, random);
            if (order === null) {
                continue;
            }
            const shuffledPairs: MahjongFace[][] = RandomUtils.shuffle(pairs, random);
            return order.map((slot, index) => {
                const face: MahjongFace = shuffledPairs[Math.floor(index / 2)][index % 2];
                return { id: index, slot, face, value: this.getValue(face) };
            });
        }
        return null;
    }

    private static drawRemovalOrder(slots: MahjongSlot[], random: RandomSource): MahjongSlot[] | null {
        let remaining: MahjongSlot[] = [...slots];
        const order: MahjongSlot[] = [];
        while (remaining.length > 0) {
            const free: MahjongSlot[] = remaining.filter((slot) => this.isSlotFree(slot, remaining));
            if (free.length < 2) {
                return null;
            }
            const [first, second]: MahjongSlot[] = RandomUtils.shuffle(free, random);
            order.push(first, second);
            remaining = remaining.filter((slot) => slot !== first && slot !== second);
        }
        return order;
    }

    private static groupPairs(tiles: MahjongTile[]): MahjongFace[][] {
        const values: number[] = [...new Set(tiles.map((tile) => tile.value))];
        return values.map((value) => tiles.filter((tile) => tile.value === value).map((tile) => tile.face));
    }

    // Values of two digits, each once, each with two different calculations.
    private static drawPairs(pairCount: number, random: RandomSource): MahjongFace[][] {
        const values: number[] = RandomUtils.shuffle(
            Array.from({ length: 90 }, (_, index) => index + 10).filter((value) => this.getFaces(value).length >= 2),
            random
        ).slice(0, pairCount);
        return values.map((value) => {
            const faces: MahjongFace[] = this.getFaces(value);
            const operations: Operation[] = RandomUtils.shuffle([...new Set(faces.map((face) => face.operation))], random);
            // Two different signs when the value has them (7 × 8 with 63 − 7); otherwise two of the same sign.
            if (operations.length === 1) {
                return RandomUtils.shuffle(faces, random).slice(0, 2);
            }
            return operations.slice(0, 2).map((operation) =>
                RandomUtils.pickOne(
                    faces.filter((face) => face.operation === operation),
                    random
                )
            );
        });
    }

    // Every calculation that makes the value and fits a tile: products and quotients inside the times tables up to
    // 12, sums and differences with a single digit.
    private static getFaces(value: number): MahjongFace[] {
        const faces: MahjongFace[] = [];
        for (let factor = 2; factor <= 12; factor++) {
            if (value % factor === 0 && value / factor >= 2 && value / factor <= 12) {
                faces.push({ operation: "multiplication", left: value / factor, right: factor });
            }
            if (value * factor <= 99) {
                faces.push({ operation: "division", left: value * factor, right: factor });
            }
        }
        for (let digit = 2; digit <= 9; digit++) {
            if (value - digit >= 10) {
                faces.push({ operation: "addition", left: value - digit, right: digit });
            }
            if (value + digit <= 99) {
                faces.push({ operation: "subtraction", left: value + digit, right: digit });
            }
        }
        return faces.filter((face) => this.getFaceText(face).length <= this.getMaxFaceLength());
    }
}
