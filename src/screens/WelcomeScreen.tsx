import { InstallCard } from "../components/InstallCard.tsx";
import { Logo } from "../components/Logo.tsx";
import { Mascot } from "../components/Mascot.tsx";
import { ProfileForm } from "../components/ProfileForm.tsx";
import { Messages } from "../utils/messages.ts";
import type { AppData } from "../utils/profiles/utils.ts";

interface WelcomeScreenProps {
    data: AppData;
    onCreateProfile: (name: string) => void;
}

export function WelcomeScreen({ data, onCreateProfile }: WelcomeScreenProps) {
    return (
        <main className="screen screen--centered">
            <Logo isCentered />
            <div className="centered">
                <Mascot mood="happy" size={176} />
            </div>
            <section className="card">
                <ProfileForm data={data} title={Messages.getWelcomeQuestion()} submitLabel="Começar" onSubmit={onCreateProfile} />
            </section>
            <InstallCard />
        </main>
    );
}
