import { describe, expect, it } from "vitest";
import { createTestProfile } from "../../test/profiles.ts";
import { createSeededRandom } from "../../test/random.ts";
import { MahjongUtils, type MahjongGame, type MahjongRun, type MahjongTile } from "./utils.ts";

// Plays a board the way a player who always takes a free pair would.
const playGreedily = (game: MahjongGame): MahjongGame => {
    let current: MahjongGame = game;
    for (let pairs = MahjongUtils.getFreePairs(current); pairs.length > 0; pairs = MahjongUtils.getFreePairs(current)) {
        const [first, second] = pairs[0];
        current = MahjongUtils.select(MahjongUtils.select(current, first.id).game, second.id).game;
    }
    return current;
};

const run: MahjongRun = { ending: "cleared", elapsedMilliseconds: 90000, hintsUsed: 0, tilesLeft: 0, previousRecordMilliseconds: null };

describe("MahjongUtils board", () => {
    it("lays out 36 tiles: 18 pairs of different values, each with two calculations that fit a tile", () => {
        const game: MahjongGame = MahjongUtils.create(createSeededRandom(1));
        expect(game.tiles).toHaveLength(36);
        const values: number[] = game.tiles.map((tile) => tile.value);
        expect(new Set(values).size).toBe(18);
        for (const value of new Set(values)) {
            const pair: MahjongTile[] = game.tiles.filter((tile) => tile.value === value);
            expect(pair).toHaveLength(2);
            expect(MahjongUtils.getFaceText(pair[0].face)).not.toBe(MahjongUtils.getFaceText(pair[1].face));
            expect(pair.every((tile) => MahjongUtils.getFaceText(tile.face).length <= MahjongUtils.getMaxFaceLength())).toBe(true);
            expect(pair.every((tile) => Number.isInteger(tile.value) && tile.value >= 10 && tile.value <= 99)).toBe(true);
        }
    });

    it("frees a tile with nothing on top and one side open", () => {
        const game: MahjongGame = MahjongUtils.create(createSeededRandom(2));
        const remaining: MahjongTile[] = MahjongUtils.getRemaining(game);
        const isFreeAt = (x: number, y: number, z: number): boolean => {
            const tile: MahjongTile | undefined = remaining.find((candidate) => candidate.slot.x === x && candidate.slot.y === y && candidate.slot.z === z);
            if (tile === undefined) {
                throw new Error(`No tile at ${x}, ${y}, ${z}.`);
            }
            return MahjongUtils.isFree(tile, remaining);
        };
        expect(isFreeAt(4, 3, 2)).toBe(true);
        expect(isFreeAt(4, 2, 1)).toBe(false);
        expect(isFreeAt(-2, 3, 0)).toBe(true);
        expect(isFreeAt(0, 2, 0)).toBe(false);
        expect(isFreeAt(0, 0, 0)).toBe(true);
        expect(isFreeAt(2, 0, 0)).toBe(false);
    });

    it("deals every board from a solution", () => {
        for (let seed = 1; seed <= 30; seed++) {
            const game: MahjongGame = MahjongUtils.create(createSeededRandom(seed));
            const solution: MahjongGame = (() => {
                // The deal takes the tiles apart in pairs of ids 0 and 1, 2 and 3, and so on.
                let current: MahjongGame = game;
                for (let id = 0; id < game.tiles.length; id += 2) {
                    current = MahjongUtils.select(MahjongUtils.select(current, id).game, id + 1).game;
                }
                return current;
            })();
            expect(MahjongUtils.isCleared(solution)).toBe(true);
        }
    });
});

describe("MahjongUtils.select", () => {
    const game: MahjongGame = MahjongUtils.create(createSeededRandom(3));
    const [first, second] = MahjongUtils.getFreePairs(game)[0];

    it("takes two free tiles of the same value off the board", () => {
        const selected = MahjongUtils.select(game, first.id);
        expect(selected.outcome).toBe("select");
        expect(MahjongUtils.select(selected.game, first.id).outcome).toBe("deselect");
        const matched = MahjongUtils.select(selected.game, second.id);
        expect(matched.outcome).toBe("match");
        expect(matched.game.removedIds).toEqual([first.id, second.id]);
        expect(matched.game.selectedId).toBeNull();
    });

    it("ignores a blocked tile, and moves the choice to a free tile that does not match", () => {
        const remaining: MahjongTile[] = MahjongUtils.getRemaining(game);
        const blocked: MahjongTile | undefined = remaining.find((tile) => !MahjongUtils.isFree(tile, remaining));
        const otherFree: MahjongTile | undefined = remaining.find((tile) => MahjongUtils.isFree(tile, remaining) && tile.value !== first.value);
        if (blocked === undefined || otherFree === undefined) {
            throw new Error("The board has no blocked tile or no other free tile.");
        }
        const selected: MahjongGame = MahjongUtils.select(game, first.id).game;
        expect(MahjongUtils.select(selected, blocked.id)).toEqual({ game: selected, outcome: "blocked" });
        expect(MahjongUtils.select(selected, otherFree.id)).toMatchObject({ outcome: "switch", game: { selectedId: otherFree.id } });
    });
});

describe("MahjongUtils when stuck", () => {
    it("shows a free pair as a hint, counted", () => {
        const hinted: MahjongGame | null = MahjongUtils.hint(MahjongUtils.create(createSeededRandom(4)), createSeededRandom(1));
        expect(hinted?.hintedIds).toHaveLength(2);
        expect(hinted?.hintsUsed).toBe(1);
    });

    it("deals the tiles left again from a solution, in the same places", () => {
        for (let seed = 1; seed <= 20; seed++) {
            const played: MahjongGame = playGreedily(MahjongUtils.create(createSeededRandom(seed)));
            if (MahjongUtils.isCleared(played)) {
                continue;
            }
            expect(MahjongUtils.isStuck(played)).toBe(true);
            const shuffled: MahjongGame | null = MahjongUtils.shuffle(played, createSeededRandom(seed));
            if (shuffled === null) {
                continue;
            }
            expect(shuffled.removedIds).toEqual(played.removedIds);
            expect(MahjongUtils.getRemaining(shuffled).map((tile) => tile.slot)).toEqual(MahjongUtils.getRemaining(played).map((tile) => tile.slot));
            expect(MahjongUtils.getFreePairs(shuffled).length).toBeGreaterThan(0);
        }
    });

    it("cannot deal again a tile left on top of the only other one", () => {
        const game: MahjongGame = MahjongUtils.create(createSeededRandom(5));
        const top: MahjongTile = game.tiles.find((tile) => tile.slot.z === 2) as MahjongTile;
        const under: MahjongTile = game.tiles.find((tile) => tile.slot.z === 1 && tile.slot.x === top.slot.x && tile.slot.y === 2) as MahjongTile;
        const removedIds: number[] = game.tiles.filter((tile) => tile.id !== top.id && tile.id !== under.id).map((tile) => tile.id);
        const twoLeft: MahjongGame = {
            ...game,
            removedIds,
            tiles: game.tiles.map((tile) => (tile.id === under.id ? { ...tile, face: top.face, value: top.value } : tile))
        };
        expect(MahjongUtils.isStuck(twoLeft)).toBe(true);
        expect(MahjongUtils.shuffle(twoLeft)).toBeNull();
    });
});

describe("MahjongUtils records", () => {
    it("keeps the best time of a board cleared without hints", () => {
        const profile = createTestProfile();
        expect(MahjongUtils.finishRun(profile, run).mahjongRecord).toBe(90000);
        expect(MahjongUtils.isNewRecord({ ...run, previousRecordMilliseconds: 80000 })).toBe(false);
        expect(MahjongUtils.isNewRecord({ ...run, hintsUsed: 1 })).toBe(false);
        expect(MahjongUtils.isNewRecord({ ...run, ending: "stop" })).toBe(false);
        expect(MahjongUtils.finishRun(profile, { ...run, hintsUsed: 2 })).toBe(profile);
    });
});
