import moment from "moment";
import { useEffect, useState } from "react";
import { ChallengeScreen } from "./screens/ChallengeScreen.tsx";
import { ChallengeSessionScreen } from "./screens/ChallengeSessionScreen.tsx";
import { HomeScreen } from "./screens/HomeScreen.tsx";
import { ProgressScreen } from "./screens/ProgressScreen.tsx";
import { SessionScreen } from "./screens/SessionScreen.tsx";
import { SetupScreen } from "./screens/SetupScreen.tsx";
import { SummaryScreen } from "./screens/SummaryScreen.tsx";
import { WelcomeScreen } from "./screens/WelcomeScreen.tsx";
import { ChallengeUtils, type ChallengeRun } from "./utils/challenge/utils.ts";
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
    | { name: "challenge"; run: ChallengeRun | null }
    | { name: "challenge-session" };

export function App() {
    const [stored] = useState<LoadResult>(() => StorageUtils.load());
    const [data, setData] = useState<AppData>(stored.data);
    const [view, setView] = useState<View>({ name: "home" });
    const canSave: boolean = StorageUtils.canSave(stored.status);
    const hasProfiles: boolean = data.profiles.length > 0;

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
        return <WelcomeScreen data={data} onCreateProfile={(name) => setData(ProfilesUtils.add(data, name))} />;
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
                    data={data}
                    profile={activeProfile}
                    storageStatus={stored.status}
                    onSelectProfile={(profileId) => setData(ProfilesUtils.select(data, profileId))}
                    onCreateProfile={(name) => setData(ProfilesUtils.add(data, name))}
                    onDeleteProfile={(profileId) => setData(ProfilesUtils.remove(data, profileId))}
                    onChoosePractice={(practice) => {
                        updateActiveProfile((profile) => ({ ...profile, settings: { ...profile.settings, practice } }));
                        setView({ name: "setup" });
                    }}
                    onShowProgress={() => setView({ name: "progress" })}
                    onOpenChallenge={() => setView({ name: "challenge", run: null })}
                    onChallengeSwitch={(isChallengeEnabled) =>
                        updateActiveProfile((profile) => ({ ...profile, settings: { ...profile.settings, isChallengeEnabled } }))
                    }
                />
            );
    }
}
