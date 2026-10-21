import { useEffect, useId, useRef, useState } from "react";
import { Messages } from "../utils/messages.ts";
import type { Wallet } from "../utils/wallet/utils.ts";
import { CoinIcon } from "./Icons.tsx";
import { PiggyBank } from "./PiggyBank.tsx";

interface CoinButtonProps {
    wallet: Wallet;
}

// The coins in the corner of the home screen; touching them opens the piggy bank with the details.
export function CoinButton({ wallet }: CoinButtonProps) {
    const panelId: string = useId();
    const wrapperRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    // Closes on a touch outside or on Escape, like any small panel that opens from a button.
    useEffect(() => {
        if (!isOpen) {
            return;
        }
        const closeOnOutsideTouch = (event: PointerEvent): void => {
            if (wrapperRef.current !== null && event.target instanceof Node && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        const closeOnEscape = (event: KeyboardEvent): void => {
            if (event.key === "Escape") {
                setIsOpen(false);
                if (buttonRef.current !== null) {
                    buttonRef.current.focus();
                }
            }
        };
        document.addEventListener("pointerdown", closeOnOutsideTouch);
        document.addEventListener("keydown", closeOnEscape);
        return () => {
            document.removeEventListener("pointerdown", closeOnOutsideTouch);
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, [isOpen]);

    return (
        <div ref={wrapperRef} className="coin-button">
            <button
                ref={buttonRef}
                type="button"
                className="coin-pill coin-pill--button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setIsOpen(!isOpen)}
            >
                <CoinIcon />
                <span aria-hidden="true">{wallet.coins}</span>
                <span className="visually-hidden">{Messages.getCoinsCount(wallet.coins)}. Ver o mealheiro</span>
            </button>
            {isOpen && (
                <div id={panelId} className="coin-button__panel">
                    <PiggyBank wallet={wallet} />
                </div>
            )}
        </div>
    );
}
