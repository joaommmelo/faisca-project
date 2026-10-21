import { useId, useState, type FormEvent } from "react";
import { Messages } from "../utils/messages.ts";
import { ProfilesUtils, type AppData, type ProfileNameProblem } from "../utils/profiles/utils.ts";

interface ProfileFormProps {
    data: AppData;
    title: string;
    submitLabel: string;
    onSubmit: (name: string) => void;
    onCancel?: () => void;
}

export function ProfileForm({ data, title, submitLabel, onSubmit, onCancel }: ProfileFormProps) {
    const inputId: string = useId();
    const errorId: string = useId();
    const [name, setName] = useState<string>("");
    const [problem, setProblem] = useState<ProfileNameProblem | null>(null);

    const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        const nameProblem: ProfileNameProblem | null = ProfilesUtils.getNameProblem(data, name);
        if (nameProblem !== null) {
            setProblem(nameProblem);
            return;
        }
        onSubmit(name);
    };

    return (
        <form onSubmit={handleSubmit} noValidate>
            <label className="form-label" htmlFor={inputId}>
                {title}
            </label>
            <input
                id={inputId}
                className="text-input"
                type="text"
                value={name}
                placeholder="O teu nome"
                maxLength={ProfilesUtils.getMaxNameLength()}
                autoComplete="off"
                autoCapitalize="words"
                enterKeyHint="done"
                aria-invalid={problem !== null}
                aria-describedby={problem !== null ? errorId : undefined}
                onChange={(event) => {
                    setName(event.target.value);
                    setProblem(null);
                }}
            />
            {problem !== null && (
                <p id={errorId} className="form-error" role="alert">
                    {Messages.getNameProblem(problem)}
                </p>
            )}
            <div className="form-actions">
                {onCancel !== undefined && (
                    <button type="button" className="button button--secondary" onClick={onCancel}>
                        Cancelar
                    </button>
                )}
                <button type="submit" className="button button--primary">
                    {submitLabel}
                </button>
            </div>
        </form>
    );
}
