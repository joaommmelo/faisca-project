import { Mascot } from "./Mascot.tsx";

interface TryAgainNoteProps {
    text: string;
}

// The first miss: a gentle word and the second chance, never the answer.
export function TryAgainNote({ text }: TryAgainNoteProps) {
    return (
        <div className="try-again" role="status">
            <Mascot mood="encourage" size={56} />
            <p className="bubble">{text}</p>
        </div>
    );
}
