interface SwitchFieldProps {
    label: string;
    description: string;
    isOn: boolean;
    onChange: (isOn: boolean) => void;
}

export function SwitchField({ label, description, isOn, onChange }: SwitchFieldProps) {
    return (
        <label className="switch-row">
            <span>
                <span className="switch-row__label">{label}</span>
                <span className="switch-row__description">{description}</span>
            </span>
            <input className="visually-hidden" type="checkbox" role="switch" checked={isOn} onChange={(event) => onChange(event.target.checked)} />
            <span className="switch" aria-hidden="true" />
        </label>
    );
}
