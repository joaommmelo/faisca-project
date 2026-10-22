import { LocalesUtils, type Locale } from "../utils/locales/utils.ts";
import { Messages } from "../utils/messages.ts";

interface LanguagePickerProps {
    locale: Locale;
    onChange: (locale: Locale) => void;
}

// For the adult holding the device. Each language is written in its own words (and read out in its own voice), so
// anyone finds theirs whatever language the app is showing.
export function LanguagePicker({ locale, onChange }: LanguagePickerProps) {
    const title: string = Messages.getLabels().language;

    return (
        <section className="card stack" aria-label={title}>
            <h2 className="section-title">{title}</h2>
            <div className="languages">
                {LocalesUtils.getValidLocales().map((candidate) => (
                    <button
                        key={candidate}
                        type="button"
                        className="chip"
                        lang={LocalesUtils.getLanguageTag(candidate)}
                        aria-pressed={candidate === locale}
                        onClick={() => onChange(candidate)}
                    >
                        {LocalesUtils.getLanguageName(candidate)}
                    </button>
                ))}
            </div>
        </section>
    );
}
