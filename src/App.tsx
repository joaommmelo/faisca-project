import moment from "moment";
import { useEffect, useState } from "react";
import { ChallengeScreen } from "./screens/ChallengeScreen.tsx";
import { ChallengeSessionScreen } from "./screens/ChallengeSessionScreen.tsx";
import { FactorGameScreen } from "./screens/FactorGameScreen.tsx";
import { FactorGameSessionScreen } from "./screens/FactorGameSessionScreen.tsx";
import { HomeScreen } from "./screens/HomeScreen.tsx";
import { ProgressScreen } from "./screens/ProgressScreen.tsx";
import { SessionScreen } from "./screens/SessionScreen.tsx";
import { SettingsScreen } from "./screens/SettingsScreen.tsx";
import { SetupScreen } from "./screens/SetupScreen.tsx";
import { SummaryScreen } from "./screens/SummaryScreen.tsx";
import { WelcomeScreen } from "./screens/WelcomeScreen.tsx";
import { ChallengeUtils, type ChallengeRun } from "./utils/challenge/utils.ts";
import type { FactorGameOutcome } from "./utils/factorGame/utils.ts";
import { LocalesUtils, type Locale } from "./utils/locales/utils.ts";
import { Messages } from "./utils/messages.ts";
import { ProfilesUtils, type AppData, type Profile } from "./utils/profiles/utils.ts";
import { ProgressionUtils, type FinishSessionResult } from "./utils/progression/utils.ts";
import type { SessionOutcome } from "./utils/session/utils.ts";
import { StorageUtils, type LoadResult } from "./utils/storage/utils.ts";

type View =
    | { name: "home" }
    | { name: "setup" }
    | { name: "session" }
    | { name: "summary"; outcome: SessionOutcome }
    | { name: "progress" }
    | { name: "settings" }
    | { name: "challenge"; run: ChallengeRun | null }
    | { name: "challenge-session" }
    | { name: "factor-game"; outcome: FactorGameOutcome | null }
    | { name: "factor-game-session" };

export function App() {
    const [stored] = useState<LoadResult>(() => StorageUtils.load());
    // The first start detects the language and keeps it.
    const [data, setData] = useState<AppData>(() =>
        stored.data.locale === null
            ? ProfilesUtils.setLocale(stored.data, LocalesUtils.detect(Intl.DateTimeFormat().resolvedOptions().timeZone, navigator.languages))
            : stored.data
    );
    const [view, setView] = useState<View>({ name: "home" });
    const canSave: boolean = StorageUtils.canSave(stored.status);
    const hasProfiles: boolean = data.profiles.length > 0;
    const locale: Locale = data.locale ?? LocalesUtils.getFallbackLocale();
    // Before anything below renders, so every screen speaks the same language.
    Messages.setLocale(locale);
    const changeLocale = (newLocale: Locale): void => setData((current) => ProfilesUtils.setLocale(current, newLocale));

    useEffect(() => {
        document.documentElement.lang = LocalesUtils.getLanguageTag(locale);
    }, [locale]);

    useEffect(() => {
        if (canSave) {
            StorageUtils.save(data);
        }
    }, [data, canSave]);

    // Only worth asking once there is progress to keep; a refusal changes nothing.
    useEffect(() => {
        if (canSave && hasProfiles) {
            void StorageUtils.requestPersistence();
        }
    }, [canSave, hasProfiles]);

    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, [view.name]);

    const activeProfile: Profile | null = ProfilesUtils.getActive(data);
    if (activeProfile === null) {
        // The first profile starts at home, whatever screen was open when the last one was deleted.
        const createFirstProfile = (name: string): void => {
            setData(ProfilesUtils.add(data, name));
            setView({ name: "home" });
        };
        return <WelcomeScreen data={data} locale={locale} onCreateProfile={createFirstProfile} onLocaleChange={changeLocale} />;
    }

    const updateActiveProfile = (change: (profile: Profile) => Profile): void => {
        setData((current) => ProfilesUtils.updateActive(current, change));
    };

    const finishSession = (outcome: Omit<SessionOutcome, "offer" | "clock">): void => {
        const finished: FinishSessionResult = ProgressionUtils.finishSession(activeProfile, moment(), outcome);
        updateActiveProfile(() => finished.profile);
        setView({ name: "summary", outcome: { ...outcome, offer: finished.offer, clock: finished.clock } });
    };

    const finishChallenge = (ending: Omit<ChallengeRun, "previousRecord">): void => {
        const run: ChallengeRun = { ...ending, previousRecord: activeProfile.challengeRecord };
        updateActiveProfile((profile) => ChallengeUtils.finishRun(profile, run));
        setView({ name: "challenge", run });
    };

    switch (view.name) {
        case "session":
            return (
                <SessionScreen
                    profile={activeProfile}
                    onProfileChange={(profile) => updateActiveProfile(() => profile)}
                    onFinish={finishSession}
                    onExit={() => setView({ name: "home" })}
                />
            );
        case "summary":
            return (
                <SummaryScreen
                    outcome={view.outcome}
                    onAcceptOffer={(offer) => {
                        updateActiveProfile((profile) => ProgressionUtils.acceptOffer(profile, offer));
                        setView({ name: "session" });
                    }}
                    onPlayAgain={() => setView({ name: "session" })}
                    onShowProgress={() => setView({ name: "progress" })}
                    onHome={() => setView({ name: "home" })}
                />
            );
        case "setup":
            return (
                <SetupScreen
                    profile={activeProfile}
                    onSettingsChange={(settings) => updateActiveProfile((profile) => ({ ...profile, settings }))}
                    onPlay={() => setView({ name: "session" })}
                    onBack={() => setView({ name: "home" })}
                />
            );
        case "progress":
            return <ProgressScreen profile={activeProfile} onBack={() => setView({ name: "home" })} />;
        case "settings":
            return (
                <SettingsScreen
                    key={activeProfile.id}
                    data={data}
                    profile={activeProfile}
                    locale={locale}
                    onSelectProfile={(profileId) => setData(ProfilesUtils.select(data, profileId))}
                    onCreateProfile={(name) => setData(ProfilesUtils.add(data, name))}
                    onDeleteProfile={(profileId) => setData(ProfilesUtils.remove(data, profileId))}
                    onLocaleChange={changeLocale}
                    onChallengeSwitch={(isChallengeEnabled) =>
                        updateActiveProfile((profile) => ({ ...profile, settings: { ...profile.settings, isChallengeEnabled } }))
                    }
                    onBack={() => setView({ name: "home" })}
                />
            );
        case "factor-game-session":
            return (
                <FactorGameSessionScreen
                    tables={activeProfile.settings.multiplication.tables}
                    onFinish={(outcome) => setView({ name: "factor-game", outcome })}
                    onExit={() => setView({ name: "home" })}
                />
            );
        case "factor-game":
            return (
                <FactorGameScreen
                    tables={activeProfile.settings.multiplication.tables}
                    outcome={view.outcome}
                    onTablesChange={(tables) =>
                        updateActiveProfile((profile) => ({
                            ...profile,
                            settings: { ...profile.settings, multiplication: { ...profile.settings.multiplication, tables } }
                        }))
                    }
                    onPlay={() => setView({ name: "factor-game-session" })}
                    onHome={() => setView({ name: "home" })}
                />
            );
        case "challenge-session":
            return <ChallengeSessionScreen onFinish={finishChallenge} />;
        case "challenge":
            return (
                <ChallengeScreen
                    profile={activeProfile}
                    run={view.run}
                    onPlay={() => setView({ name: "challenge-session" })}
                    onHome={() => setView({ name: "home" })}
                />
            );
        default:
            return (
                <HomeScreen
                    key={activeProfile.id}
                    profile={activeProfile}
                    storageStatus={stored.status}
                    onChoosePractice={(practice) => {
                        updateActiveProfile((profile) => ({ ...profile, settings: { ...profile.settings, practice } }));
                        setView({ name: "setup" });
                    }}
                    onShowProgress={() => setView({ name: "progress" })}
                    onOpenFactorGame={() => setView({ name: "factor-game", outcome: null })}
                    onOpenChallenge={() => setView({ name: "challenge", run: null })}
                    onOpenSettings={() => setView({ name: "settings" })}
                />
            );
    }
}
