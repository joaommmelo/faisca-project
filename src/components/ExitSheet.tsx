import { useId, useRef, type ReactNode } from "react";
import { Messages } from "../utils/messages.ts";
import { PlayIcon } from "./Icons.tsx";
import { MascotMessage } from "./Mascot.tsx";
import { Sheet } from "./Sheet.tsx";

interface ExitSheetProps {
    question: string;
    leaveIcon: ReactNode;
    onLeave: () => void;
    onStay: () => void;
}

// "Sair" asks only "Sim" and "Não": the icons say where each goes, for children who cannot read yet.
// Closing the sheet any other way is "Não", the answer that loses nothing.
export function ExitSheet({ question, leaveIcon, onLeave, onStay }: ExitSheetProps) {
    const titleId: string = useId();
    const stayButtonRef = useRef<HTMLButtonElement>(null);

    return (
        <Sheet titleId={titleId} initialFocusRef={stayButtonRef} onClose={onStay}>
            <MascotMessage mood="encourage" size={72}>
                <span id={titleId}>{question}</span>
            </MascotMessage>
            <div className="exit-sheet__choices">
                <button type="button" className="button exit-sheet__choice exit-sheet__choice--leave" onClick={onLeave}>
                    {leaveIcon}
                    {Messages.getLabels().yes}
                </button>
                <button ref={stayButtonRef} type="button" className="button exit-sheet__choice exit-sheet__choice--stay" onClick={onStay}>
                    <PlayIcon />
                    {Messages.getLabels().no}
                </button>
            </div>
        </Sheet>
    );
}
