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

export function NextIcon() {
    return (
        <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
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

export function LockIcon() {
    return (
        <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="currentColor" />
            <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
    );
}

// A gold coin stamped with the brand's spark.
export function CoinIcon() {
    return (
        <svg className="icon icon--coin" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="10.5" fill="#ffc83d" stroke="#c98a00" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="7.5" fill="none" stroke="#dfa200" strokeWidth="1" />
            <path d={getSparkPath(12, 12, 5.5)} fill="#ffffff" opacity="0.9" />
        </svg>
    );
}

export function HelpIcon() {
    return (
        <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path
                d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2h5c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinejoin="round"
            />
            <path d="M9.5 19h5M10.5 21.5h3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
    );
}

export function StarIcon() {
    return (
        <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3-4.6-4.4 6.3-.9z" fill="currentColor" strokeLinejoin="round" />
        </svg>
    );
}

export function HomeIcon() {
    return (
        <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M3.5 11L12 4l8.5 7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 9.5V20h4.5v-5.5h3V20H18V9.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
    );
}

export function PlayIcon() {
    return (
        <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
    );
}

// The iOS share symbol, so the install steps point at the button the child will see.
export function ShareIcon() {
    return (
        <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 14V3M8 6.5L12 2.5l4 4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8.5 10H7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-1.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
    );
}
