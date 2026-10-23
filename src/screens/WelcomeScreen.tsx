import { BackupPanel } from "../components/BackupPanel.tsx";
import { InstallCard } from "../components/InstallCard.tsx";
import { LanguagePicker } from "../components/LanguagePicker.tsx";
import { Logo } from "../components/Logo.tsx";
import { Mascot } from "../components/Mascot.tsx";
import { ProfileForm } from "../components/ProfileForm.tsx";
import { Messages } from "../utils/messages.ts";
import type { Locale } from "../utils/locales/utils.ts";
import type { AppData } from "../utils/profiles/utils.ts";

interface WelcomeScreenProps {
    data: AppData;
    locale: Locale;
    onCreateProfile: (name: string) => void;
    onLocaleChange: (locale: Locale) => void;
    onRestore: (data: AppData) => void;
}

export function WelcomeScreen({ data, locale, onCreateProfile, onLocaleChange, onRestore }: WelcomeScreenProps) {
    return (
        <main className="screen screen--centered">
            <Logo isCentered />
            <div className="centered">
                <Mascot mood="happy" size={176} />
            </div>
            <section className="card">
                <ProfileForm data={data} title={Messages.getWelcomeQuestion()} submitLabel={Messages.getLabels().start} onSubmit={onCreateProfile} />
            </section>
            <InstallCard />
            <LanguagePicker locale={locale} onChange={onLocaleChange} />
            <BackupPanel data={data} onRestore={onRestore} />
        </main>
    );
}
