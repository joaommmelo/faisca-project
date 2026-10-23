import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { useBackButton } from "../hooks/useBackButton.ts";

interface SheetProps {
    titleId: string;
    // Where focus starts: the answer that changes nothing.
    initialFocusRef: RefObject<HTMLElement | null>;
    onClose: () => void;
    children: ReactNode;
}

// A question that stops the screen comes up in a sheet over it, dimmed and inert behind, so it never looks like part
// of the screen. Tapping outside the sheet, or Escape, closes it, and focus goes back to what opened it.
export function Sheet({ titleId, initialFocusRef, onClose, children }: SheetProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [opener] = useState<Element | null>(() => document.activeElement);
    useBackButton("sheet", onClose);

    useEffect(() => {
        if (dialogRef.current === null || initialFocusRef.current === null) {
            return;
        }
        if (!dialogRef.current.open) {
            dialogRef.current.showModal();
        }
        initialFocusRef.current.focus();
        return () => {
            if (opener instanceof HTMLElement) {
                opener.focus();
            }
        };
    }, [initialFocusRef, opener]);

    return (
        <dialog
            ref={dialogRef}
            className="sheet"
            aria-labelledby={titleId}
            onClose={onClose}
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="sheet__inner">{children}</div>
        </dialog>
    );
}
