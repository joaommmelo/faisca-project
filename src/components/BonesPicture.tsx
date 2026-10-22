import type { ReactElement } from "react";
import { CountingGameUtils, type CountingLayout } from "../utils/countingGame/utils.ts";
import { BoneIcon } from "./Icons.tsx";

// The spots of a die, in a grid of 3 by 3 read row by row.
const DICE_CELLS: Record<number, number[]> = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8]
};
const DICE_GRID_CELLS: number = 9;
// Rows of five up to 10; from 11, rows of ten, split in two fives.
const ROW_LENGTH: number = 5;
const LONG_ROW_LENGTH: number = 10;
// A scattered bone leans a little, each cell its own way, so the picture looks thrown rather than lined up.
const SCATTER_ANGLES: number[] = [-28, 14, -6, 32, -18, 8, 24, -34, 0, 18];

interface BonesPictureProps {
    groups: number[];
    layout: CountingLayout;
    spots: number[];
}

// The bones of Quantos são?, laid out as the round asks: like a die, in rows, or scattered. Two groups show side by
// side with a + between them. The spoken question lives in the screen's heading.
export function BonesPicture({ groups, layout, spots }: BonesPictureProps) {
    if (layout === "scattered") {
        return (
            <div className="bones bones--scattered" style={{ gridTemplateColumns: `repeat(${CountingGameUtils.getScatterColumns()}, 1fr)` }}>
                {Array.from({ length: CountingGameUtils.getScatterCells() }, (_, cell) => (
                    <span key={cell} className="bones__cell" style={{ transform: `rotate(${SCATTER_ANGLES[cell % SCATTER_ANGLES.length]}deg)` }}>
                        {spots.includes(cell) && <BoneIcon />}
                    </span>
                ))}
            </div>
        );
    }
    if (layout === "rows") {
        const count: number = CountingGameUtils.getCount(groups);
        const rowLength: number = count > LONG_ROW_LENGTH ? LONG_ROW_LENGTH : ROW_LENGTH;
        return (
            <div className={`bones bones--rows bones--rows-of-${rowLength}`}>
                {Array.from({ length: count }, (_, index) => (
                    <span key={index} className="bones__cell">
                        <BoneIcon />
                    </span>
                ))}
            </div>
        );
    }
    const dice: ReactElement[] = groups.map((group, index) => (
        <div key={index} className="bones bones--dice">
            {Array.from({ length: DICE_GRID_CELLS }, (_, cell) => (
                <span key={cell} className="bones__cell">
                    {DICE_CELLS[group].includes(cell) && <BoneIcon />}
                </span>
            ))}
        </div>
    ));
    return (
        <div className="bones-groups">
            {dice[0]}
            {dice.length > 1 && (
                <>
                    <span className="bones-groups__plus">+</span>
                    {dice[1]}
                </>
            )}
        </div>
    );
}
