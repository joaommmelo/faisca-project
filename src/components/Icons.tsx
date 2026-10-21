import { getSparkPath } from "./sparkPath.ts";

// Decorative icons: the surrounding text or aria-label always carries the meaning.

export function SparkIcon() {
    return (
        <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d={getSparkPath(12, 12, 11)} fill="#ffc83d" stroke="#dfa200" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
    );
}

export function CheckIcon() {
    return (
        <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export function CloseIcon() {
    return (
        <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
    );
}

export function EraseIcon() {
    return (
        <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M9 5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6-7z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M12 9.5l5 5M17 9.5l-5 5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
    );
}

export function ClockIcon() {
    return (
        <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <circle cx="12" cy="13" r="8" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <path d="M12 9v4l2.5 2M10 2.5h4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
    );
}

export function BackIcon() {
    return (
        <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export function PlusIcon() {
    return (
        <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
    );
}
