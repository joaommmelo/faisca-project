import type { MemoryFace } from "../utils/memoryGame/utils.ts";
import { Messages } from "../utils/messages.ts";
import { BonesPicture } from "./BonesPicture.tsx";
import { BoneIcon } from "./Icons.tsx";

// Up to 5 bones sit like a die. More go in two columns, like a domino, so they fit a card that is taller than wide.
const DICE_MAX: number = 5;

// What a card shows face up: bones to count, a number, or a calculation. The spoken version is the card's label.
export function MemoryCardFace({ face }: { face: MemoryFace }) {
    switch (face.kind) {
        case "quantity":
            return (
                <span className="memory-card__bones">
                    {face.count <= DICE_MAX ? (
                        <BonesPicture groups={[face.count]} layout="dice" spots={[]} />
                    ) : (
                        <span className="bones bones--domino">
                            {Array.from({ length: face.count }, (_, index) => (
                                <span key={index} className="bones__cell">
                                    <BoneIcon />
                                </span>
                            ))}
                        </span>
                    )}
                </span>
            );
        case "number":
            return <span className="memory-card__number">{face.value}</span>;
        default:
            return <span className="memory-card__calculation">{Messages.getMemoryFaceText(face)}</span>;
    }
}
