import { useEffect, useId, useRef, type ReactNode } from "react";
import { PlayIcon } from "./Icons.tsx";
import { MascotMessage } from "./Mascot.tsx";

interface ExitSheetProps {
    question: string;
    leaveIcon: ReactNode;
    onLeave: () => void;
    onStay: () => void;
}

// "Sair" asks in a sheet over the dimmed game, so it never looks like the game's next question.
// Only "Sim" and "Não": the icons say where each goes, for children who cannot read yet.
// Tapping outside the sheet, or Escape, is "Não".
export function ExitSheet({ question, leaveIcon, onLeave, onStay }: ExitSheetProps) {
    const titleId: string = useId();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const stayButtonRef = useRef<HTMLButtonElement>(null);

    // A modal dialog makes the game behind it inert. Focus starts on "Não", the answer that loses nothing.
    useEffect(() => {
        if (dialogRef.current === null || stayButtonRef.current === null) {
            return;
        }
        if (!dialogRef.current.open) {
            dialogRef.current.showModal();
        }
        stayButtonRef.current.focus();
    }, []);

    return (
        <dialog
            ref={dialogRef}
            className="exit-sheet"
            aria-labelledby={titleId}
            onClose={onStay}
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    onStay();
                }
            }}
        >
            <div className="exit-sheet__inner">
                <MascotMessage mood="encourage" size={72}>
                    <span id={titleId}>{question}</span>
                </MascotMessage>
                <div className="exit-sheet__choices">
                    <button type="button" className="button exit-sheet__choice exit-sheet__choice--leave" onClick={onLeave}>
                        {leaveIcon}
                        Sim
                    </button>
                    <button ref={stayButtonRef} type="button" className="button exit-sheet__choice exit-sheet__choice--stay" onClick={onStay}>
                        <PlayIcon />
                        Não
                    </button>
                </div>
            </div>
        </dialog>
    );
}
