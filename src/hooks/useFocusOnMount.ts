import { useEffect, useRef, type RefObject } from "react";

// Moves focus to a screen's heading when it appears, so screen readers start reading from the top.
export function useFocusOnMount<T extends HTMLElement>(): RefObject<T | null> {
    const elementRef = useRef<T>(null);

    useEffect(() => {
        if (elementRef.current !== null) {
            elementRef.current.focus();
        }
    }, []);

    return elementRef;
}
