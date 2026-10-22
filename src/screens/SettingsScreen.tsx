import { BackIcon } from "../components/Icons.tsx";
import { LanguagePicker } from "../components/LanguagePicker.tsx";
import { ProfilesPanel } from "../components/ProfilesPanel.tsx";
import { SwitchField } from "../components/SwitchField.tsx";
import type { Labels } from "../copy/copy.ts";
import { useFocusOnMount } from "../hooks/useFocusOnMount.ts";
import type { Locale } from "../utils/locales/utils.ts";
import { Messages } from "../utils/messages.ts";
import type { AppData, Profile } from "../utils/profiles/utils.ts";

interface SettingsScreenProps {
    data: AppData;
    profile: Profile;
    locale: Locale;
    onSelectProfile: (profileId: string) => void;
    onCreateProfile: (name: string) => void;
    onDeleteProfile: (profileId: string) => void;
    onLocaleChange: (locale: Locale) => void;
    onChallengeSwitch: (isChallengeEnabled: boolean) => void;
    onMahjongSwitch: (isMahjongEnabled: boolean) => void;
    onBack: () => void;
}

// What an adult changes once in a while, out of the way of playing: who is playing, the language, and the games for
// adults.
export function SettingsScreen({
    data,
    profile,
    locale,
    onSelectProfile,
    onCreateProfile,
    onDeleteProfile,
    onLocaleChange,
    onChallengeSwitch,
    onMahjongSwitch,
    onBack
}: SettingsScreenProps) {
    const headingRef = useFocusOnMount<HTMLHeadingElement>();
    const labels: Labels = Messages.getLabels();

    return (
        <main className="screen">
            <div className="screen-header">
                <button type="button" className="button button--ghost" onClick={onBack}>
                    <BackIcon />
                    {labels.home}
                </button>
            </div>

            <h1 ref={headingRef} tabIndex={-1} className="page-title">
                {labels.settings}
            </h1>

            <ProfilesPanel
                data={data}
                profile={profile}
                onSelectProfile={onSelectProfile}
                onCreateProfile={onCreateProfile}
                onDeleteProfile={onDeleteProfile}
            />

            <LanguagePicker locale={locale} onChange={onLocaleChange} />

            <section className="card" aria-label={labels.advanced}>
                <h2 className="section-title">{labels.advanced}</h2>
                <SwitchField
                    label={Messages.getChallengeName()}
                    description={Messages.getChallengeAbout()}
                    isOn={profile.settings.isChallengeEnabled}
                    onChange={onChallengeSwitch}
                />
                <SwitchField
                    label={Messages.getMahjongName()}
                    description={Messages.getMahjongAbout()}
                    isOn={profile.settings.isMahjongEnabled}
                    onChange={onMahjongSwitch}
                />
            </section>
        </main>
    );
}
