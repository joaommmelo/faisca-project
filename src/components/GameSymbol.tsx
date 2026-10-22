import type { RoundGameId } from "../utils/roundGame/utils.ts";
import { BalanceIcon, BoneIcon, CardsIcon, JumpsIcon, TilesIcon } from "./Icons.tsx";

interface GameSymbolProps {
    game: RoundGameId | "memory" | "mahjong";
}

// What stands for a game on its tile and its title, so a child who does not read yet still recognises it.
export function GameSymbol({ game }: GameSymbolProps) {
    switch (game) {
        case "counting":
            return <BoneIcon />;
        case "number-bonds":
            return <span className="game-symbol__text">7+3</span>;
        case "skip-counting":
            return <JumpsIcon />;
        case "missing-sign":
            return <span className="game-symbol__text">6?3</span>;
        case "balance":
            return <BalanceIcon />;
        case "memory":
            return <CardsIcon />;
        default:
            return <TilesIcon />;
    }
}
