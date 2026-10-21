interface HintBubbleProps {
    text: string;
}

// The help's words, read out by screen readers as they change.
export function HintBubble({ text }: HintBubbleProps) {
    return (
        <p className="hint-bubble" role="status">
            {text}
        </p>
    );
}
