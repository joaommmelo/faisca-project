import moment from "moment";
import { useEffect, useState } from "react";
import { HomeScreen } from "./screens/HomeScreen.tsx";
import { SessionScreen } from "./screens/SessionScreen.tsx";
import { SummaryScreen } from "./screens/SummaryScreen.tsx";
import { WelcomeScreen } from "./screens/WelcomeScreen.tsx";
import { ProfilesUtils, type AppData, type Profile } from "./utils/profiles/utils.ts";
import type { SessionOutcome } from "./utils/session/utils.ts";
import { StatsUtils } from "./utils/stats/utils.ts";
import { StorageUtils } from "./utils/storage/utils.ts";

type View = { name: "home" } | { name: "session" } | { name: "summary"; outcome: SessionOutcome };

export function App() {
    const [data, setData] = useState<AppData>(() => StorageUtils.load());
    const [view, setView] = useState<View>({ name: "home" });

    useEffect(() => {
        StorageUtils.save(data);
    }, [data]);

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

    const finishSession = (outcome: SessionOutcome): void => {
        const finishedAt: moment.Moment = moment();
        updateActiveProfile((profile) => ({ ...profile, stats: StatsUtils.registerSession(profile.stats, finishedAt) }));
        setView({ name: "summary", outcome });
    };

    switch (view.name) {
        case "session":
            return (
                <SessionScreen
                    profile={activeProfile}
                    onBoxesChange={(boxes) => updateActiveProfile((profile) => ({ ...profile, boxes }))}
                    onFinish={finishSession}
                    onExit={() => setView({ name: "home" })}
                />
            );
        case "summary":
            return <SummaryScreen outcome={view.outcome} onPlayAgain={() => setView({ name: "session" })} onHome={() => setView({ name: "home" })} />;
        default:
            return (
                <HomeScreen
                    key={activeProfile.id}
                    data={data}
                    profile={activeProfile}
                    onSelectProfile={(profileId) => setData(ProfilesUtils.select(data, profileId))}
                    onCreateProfile={(name) => setData(ProfilesUtils.add(data, name))}
                    onDeleteProfile={(profileId) => setData(ProfilesUtils.remove(data, profileId))}
                    onSettingsChange={(settings) => updateActiveProfile((profile) => ({ ...profile, settings }))}
                    onPlay={() => setView({ name: "session" })}
                />
            );
    }
}
