import moment from "moment";
import { useEffect, useEffectEvent, useState } from "react";
import { ExitSheet } from "../components/ExitSheet.tsx";
import { ClockIcon, CloseIcon, HelpIcon, StarIcon } from "../components/Icons.tsx";
import type { Labels } from "../copy/copy.ts";
import { MahjongUtils, type MahjongEnding, type MahjongGame, type MahjongRun, type MahjongSelectResult, type MahjongTile } from "../utils/mahjong/utils.ts";
import { Messages } from "../utils/messages.ts";
import { TimeUtils } from "../utils/time/utils.ts";

// The board is laid out in half tiles: from x = −2 to 14 across, from y = 0 to 8 down. A tile is two half tiles
// wide and 1.3 times as tall as it is wide.
const BOARD_MIN_X: number = -2;
const BOARD_WIDTH: number = 16;
const TILE_HEIGHT_RATIO: number = 1.3;
const BOARD_HEIGHT: number = 8 * TILE_HEIGHT_RATIO + 0.6;
// Each layer sits a little up and to the left, so the stacks read as stacks.
const LAYER_OFFSET_PIXELS: number = 6;
// How often the time is redrawn, and how long the cleared board shows before the result.
const TICK_MILLISECONDS: number = 1000;
const CLEARED_DISPLAY_MILLISECONDS: number = 700;

interface MahjongSessionScreenProps {
    onFinish: (run: Omit<MahjongRun, "previousRecordMilliseconds">) => void;
}

// The board, the time and the tiles left. A hint shows a free pair; when no pair is free, the tiles left can be
// dealt again.
export function MahjongSessionScreen({ onFinish }: MahjongSessionScreenProps) {
    const labels: Labels = Messages.getLabels();
    const [game, setGame] = useState<MahjongGame>(() => MahjongUtils.create());
    const [startedAt] = useState<number>(() => moment().valueOf());
    const [now, setNow] = useState<number>(() => moment().valueOf());
    const [isExitConfirmOpen, setIsExitConfirmOpen] = useState<boolean>(false);
    const remaining: MahjongTile[] = MahjongUtils.getRemaining(game);
    const isCleared: boolean = MahjongUtils.isCleared(game);
    const isStuck: boolean = MahjongUtils.isStuck(game);

    const finish = (ending: MahjongEnding): void => {
        onFinish({ ending, elapsedMilliseconds: moment().diff(startedAt), hintsUsed: game.hintsUsed, tilesLeft: remaining.length });
    };

    const select = (tileId: number): void => {
        const selected: MahjongSelectResult = MahjongUtils.select(game, tileId);
        setGame(selected.game);
    };

    const showHint = (): void => {
        const hinted: MahjongGame | null = MahjongUtils.hint(game);
        if (hinted !== null) {
            setGame(hinted);
        }
    };

    // Only when no pair is free; a board that cannot be dealt again ends the game.
    const shuffle = (): void => {
        const shuffled: MahjongGame | null = MahjongUtils.shuffle(game);
        if (shuffled === null) {
            finish("stuck");
            return;
        }
        setGame(shuffled);
    };

    const finishCleared = useEffectEvent(() => finish("cleared"));

    useEffect(() => {
        const intervalId: number = window.setInterval(() => setNow(moment().valueOf()), TICK_MILLISECONDS);
        return () => window.clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (!isCleared) {
            return;
        }
        const timeoutId: number = window.setTimeout(() => finishCleared(), CLEARED_DISPLAY_MILLISECONDS);
        return () => window.clearTimeout(timeoutId);
    }, [isCleared]);

    const getTileClassName = (tile: MahjongTile, isFree: boolean): string => {
        const classNames: string[] = ["mahjong-tile"];
        if (!isFree) {
            classNames.push("mahjong-tile--blocked");
        }
        if (game.selectedId === tile.id) {
            classNames.push("mahjong-tile--selected");
        }
        if (game.hintedIds.includes(tile.id)) {
            classNames.push("mahjong-tile--hinted");
        }
        return classNames.join(" ");
    };

    return (
        <main className="screen screen--session screen--challenge">
            <header className="session-header">
                <button type="button" className="exit-button" onClick={() => setIsExitConfirmOpen(true)}>
                    <CloseIcon />
                    {labels.exit}
                </button>
                <p className="session-header__label">{Messages.getMahjongTilesLeft(remaining.length)}</p>
                {/* Keeps the count in the middle, as in the other games. */}
                <span aria-hidden="true" />
            </header>

            <p className="session-clock" role="timer" aria-label={labels.time}>
                <ClockIcon />
                <span className="session-clock__time">{TimeUtils.formatElapsed(Math.max(now - startedAt, 0))}</span>
            </p>

            <div className="session-body">
                <h1 className="visually-hidden">{Messages.getMahjongName()}</h1>
                <div className="mahjong-board" role="group" aria-label={labels.board} style={{ aspectRatio: `${BOARD_WIDTH} / ${BOARD_HEIGHT}` }}>
                    {[...remaining]
                        .sort((first, second) => first.slot.z - second.slot.z)
                        .map((tile) => {
                            const isFree: boolean = MahjongUtils.isFree(tile, remaining);
                            const offset: number = tile.slot.z * LAYER_OFFSET_PIXELS;
                            return (
                                <button
                                    key={tile.id}
                                    type="button"
                                    className={getTileClassName(tile, isFree)}
                                    style={{
                                        left: `${((tile.slot.x - BOARD_MIN_X) / BOARD_WIDTH) * 100}%`,
                                        top: `${((tile.slot.y * TILE_HEIGHT_RATIO) / BOARD_HEIGHT) * 100}%`,
                                        width: `${(2 / BOARD_WIDTH) * 100}%`,
                                        height: `${((2 * TILE_HEIGHT_RATIO) / BOARD_HEIGHT) * 100}%`,
                                        transform: `translate(${-offset}px, ${-offset}px)`,
                                        zIndex: tile.slot.z + 1
                                    }}
                                    aria-label={Messages.getMahjongTileLabel(tile.face, isFree)}
                                    aria-pressed={game.selectedId === tile.id}
                                    disabled={!isFree || isExitConfirmOpen}
                                    onClick={() => select(tile.id)}
                                >
                                    {Messages.getMahjongFaceText(tile.face)}
                                </button>
                            );
                        })}
                </div>

                <p className="mahjong-status" role="status">
                    {isStuck ? Messages.getMahjongStuck() : ""}
                </p>
                <div className="mahjong-actions">
                    <button type="button" className="button button--secondary" disabled={isStuck || isCleared} onClick={showHint}>
                        <HelpIcon />
                        {labels.hint}
                    </button>
                    <button type="button" className={isStuck ? "button button--primary" : "button button--secondary"} disabled={!isStuck} onClick={shuffle}>
                        {labels.shuffle}
                    </button>
                </div>
            </div>

            {isExitConfirmOpen && (
                <ExitSheet question={labels.exitQuestion} leaveIcon={<StarIcon />} onLeave={() => finish("stop")} onStay={() => setIsExitConfirmOpen(false)} />
            )}
        </main>
    );
}
