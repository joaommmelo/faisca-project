import moment from "moment";
import { useEffect, useState } from "react";
import { ChallengeScreen } from "./screens/ChallengeScreen.tsx";
import { ChallengeSessionScreen } from "./screens/ChallengeSessionScreen.tsx";
import { FactorGameScreen } from "./screens/FactorGameScreen.tsx";
import { FactorGameSessionScreen } from "./screens/FactorGameSessionScreen.tsx";
import { HomeScreen } from "./screens/HomeScreen.tsx";
import { MahjongScreen } from "./screens/MahjongScreen.tsx";
import { MahjongSessionScreen } from "./screens/MahjongSessionScreen.tsx";
import { MemoryGameScreen } from "./screens/MemoryGameScreen.tsx";
import { MemoryGameSessionScreen } from "./screens/MemoryGameSessionScreen.tsx";
import { ProgressScreen } from "./screens/ProgressScreen.tsx";
import { RoundGameScreen } from "./screens/RoundGameScreen.tsx";
import { RoundGameSessionScreen } from "./screens/RoundGameSessionScreen.tsx";
import { SessionScreen } from "./screens/SessionScreen.tsx";
import { SettingsScreen } from "./screens/SettingsScreen.tsx";
import { SetupScreen } from "./screens/SetupScreen.tsx";
import { SummaryScreen } from "./screens/SummaryScreen.tsx";
import { useBackButton } from "./hooks/useBackButton.ts";
import { WelcomeScreen } from "./screens/WelcomeScreen.tsx";
import { ChallengeUtils, type ChallengeRun } from "./utils/challenge/utils.ts";
import { FactorGameUtils, type FactorGameOutcome, type FinishedFactorGame } from "./utils/factorGame/utils.ts";
import { LocalesUtils, type Locale } from "./utils/locales/utils.ts";
import { MahjongUtils, type MahjongRun } from "./utils/mahjong/utils.ts";
import { MemoryGameUtils, type FinishedMemoryGame, type MemoryGameOutcome } from "./utils/memoryGame/utils.ts";
import { Messages } from "./utils/messages.ts";
import { MissionsUtils } from "./utils/missions/utils.ts";
import { ProfilesUtils, type AppData, type Profile } from "./utils/profiles/utils.ts";
import { ProgressionUtils, type ApplyRecordResult, type FinishSessionResult, type TimedProfile } from "./utils/progression/utils.ts";
import { RoundGameUtils, type FinishedRoundGame, type RoundGameId, type RoundGameOutcome } from "./utils/roundGame/utils.ts";
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
    | { name: "factor-game-session" }
    | { name: "round-game"; game: RoundGameId; outcome: RoundGameOutcome | null }
    | { name: "round-game-session"; game: RoundGameId }
    | { name: "memory-game"; outcome: MemoryGameOutcome | null }
    | { name: "memory-game-session" }
    | { name: "mahjong"; run: MahjongRun | null }
    | { name: "mahjong-session" };

export function App() {
    const [stored] = useState<LoadResult>(() => StorageUtils.load());
    // The first start detects the language and keeps it.
    const [data, setData] = useState<AppData>(() =>
        withTodaysMission(
            stored.data.locale === null
                ? ProfilesUtils.setLocale(stored.data, LocalesUtils.detect(Intl.DateTimeFormat().resolvedOptions().timeZone, navigator.languages))
                : stored.data
        )
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

    const showHome = (): void => {
        setData(withTodaysMission);
        setView({ name: "home" });
    };

    // Progress brought back from a file starts at home, like a first profile.
    const restoreBackup = (restored: AppData): void => {
        setData(withTodaysMission(restored));
        setView({ name: "home" });
    };

    // Back from any screen goes home, as «Início» does; from the home and welcome screens it leaves the app.
    useBackButton("app", hasProfiles && view.name !== "home" ? showHome : null);

    const activeProfile: Profile | null = ProfilesUtils.getActive(data);
    if (activeProfile === null) {
        // The first profile starts at home, whatever screen was open when the last one was deleted.
        const createFirstProfile = (name: string): void => {
            setData(withTodaysMission(ProfilesUtils.add(data, name)));
            setView({ name: "home" });
        };
        return <WelcomeScreen data={data} locale={locale} onCreateProfile={createFirstProfile} onLocaleChange={changeLocale} onRestore={restoreBackup} />;
    }

    const updateActiveProfile = (change: (profile: Profile) => Profile): void => {
        setData((current) => ProfilesUtils.updateActive(current, change));
    };

    // Every game the child finishes may be today's mission; what it earned joins the game's own milestones.
    const finishSession = (outcome: Omit<SessionOutcome, "offer" | "clock">): void => {
        const now: moment.Moment = moment();
        const finished: FinishSessionResult = ProgressionUtils.finishSession(activeProfile, now, outcome);
        const mission: ApplyRecordResult = MissionsUtils.complete(finished.profile, now, activeProfile.settings.practice);
        updateActiveProfile(() => mission.profile);
        setView({
            name: "summary",
            outcome: { ...outcome, milestones: [...outcome.milestones, ...mission.milestones], offer: finished.offer, clock: finished.clock }
        });
    };

    const finishFactorGame = (finished: FinishedFactorGame): void => {
        const now: moment.Moment = moment();
        const timed: TimedProfile = FactorGameUtils.finish(activeProfile, now, finished);
        const mission: ApplyRecordResult = MissionsUtils.complete(timed.profile, now, "factor-game");
        updateActiveProfile(() => mission.profile);
        setView({ name: "factor-game", outcome: { ...finished, milestones: [...finished.milestones, ...mission.milestones], clock: timed.clock } });
    };

    const finishRoundGame = (finished: FinishedRoundGame): void => {
        const now: moment.Moment = moment();
        const timed: TimedProfile = RoundGameUtils.finish(activeProfile, now, finished);
        const mission: ApplyRecordResult = MissionsUtils.complete(timed.profile, now, finished.game);
        updateActiveProfile(() => mission.profile);
        setView({
            name: "round-game",
            game: finished.game,
            outcome: { ...finished, milestones: [...finished.milestones, ...mission.milestones], clock: timed.clock }
        });
    };

    const finishMemoryGame = (finished: FinishedMemoryGame): void => {
        const now: moment.Moment = moment();
        const timed: TimedProfile = MemoryGameUtils.finish(activeProfile, now, finished);
        const mission: ApplyRecordResult = MissionsUtils.complete(timed.profile, now, "memory");
        updateActiveProfile(() => mission.profile);
        setView({ name: "memory-game", outcome: { ...finished, milestones: [...finished.milestones, ...mission.milestones], clock: timed.clock } });
    };

    const finishMahjong = (ending: Omit<MahjongRun, "previousRecordMilliseconds">): void => {
        const run: MahjongRun = { ...ending, previousRecordMilliseconds: activeProfile.mahjongRecord };
        updateActiveProfile((profile) => MahjongUtils.finishRun(profile, run));
        setView({ name: "mahjong", run });
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
                    onExit={showHome}
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
                    onHome={showHome}
                />
            );
        case "setup":
            return (
                <SetupScreen
                    profile={activeProfile}
                    onSettingsChange={(settings) => updateActiveProfile((profile) => ({ ...profile, settings }))}
                    onPlay={() => setView({ name: "session" })}
                    onBack={showHome}
                />
            );
        case "progress":
            return <ProgressScreen profile={activeProfile} onBack={showHome} />;
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
                    onMahjongSwitch={(isMahjongEnabled) =>
                        updateActiveProfile((profile) => ({ ...profile, settings: { ...profile.settings, isMahjongEnabled } }))
                    }
                    onRestore={restoreBackup}
                    onBack={showHome}
                />
            );
        case "factor-game-session":
            return (
                <FactorGameSessionScreen
                    profile={activeProfile}
                    onProfileChange={(profile) => updateActiveProfile(() => profile)}
                    onFinish={finishFactorGame}
                    onExit={showHome}
                />
            );
        case "factor-game":
            return (
                <FactorGameScreen
                    profile={activeProfile}
                    outcome={view.outcome}
                    onSettingsChange={(settings) => updateActiveProfile((profile) => ({ ...profile, settings }))}
                    onPlay={() => setView({ name: "factor-game-session" })}
                    onShowProgress={() => setView({ name: "progress" })}
                    onHome={showHome}
                />
            );
        case "round-game-session":
            return (
                <RoundGameSessionScreen
                    key={view.game}
                    game={view.game}
                    profile={activeProfile}
                    onProfileChange={(profile) => updateActiveProfile(() => profile)}
                    onFinish={finishRoundGame}
                    onExit={showHome}
                />
            );
        case "round-game": {
            const { game } = view;
            return (
                <RoundGameScreen
                    game={game}
                    profile={activeProfile}
                    outcome={view.outcome}
                    onSettingsChange={(settings) => updateActiveProfile((profile) => ({ ...profile, settings }))}
                    onPlay={() => setView({ name: "round-game-session", game })}
                    onShowProgress={() => setView({ name: "progress" })}
                    onHome={showHome}
                />
            );
        }
        case "memory-game-session":
            return (
                <MemoryGameSessionScreen
                    profile={activeProfile}
                    onProfileChange={(profile) => updateActiveProfile(() => profile)}
                    onFinish={finishMemoryGame}
                    onExit={showHome}
                />
            );
        case "memory-game":
            return (
                <MemoryGameScreen
                    profile={activeProfile}
                    outcome={view.outcome}
                    onSettingsChange={(settings) => updateActiveProfile((profile) => ({ ...profile, settings }))}
                    onPlay={() => setView({ name: "memory-game-session" })}
                    onShowProgress={() => setView({ name: "progress" })}
                    onHome={showHome}
                />
            );
        case "mahjong-session":
            return <MahjongSessionScreen onFinish={finishMahjong} />;
        case "mahjong":
            return <MahjongScreen profile={activeProfile} run={view.run} onPlay={() => setView({ name: "mahjong-session" })} onHome={showHome} />;
        case "challenge-session":
            return <ChallengeSessionScreen onFinish={finishChallenge} />;
        case "challenge":
            return <ChallengeScreen profile={activeProfile} run={view.run} onPlay={() => setView({ name: "challenge-session" })} onHome={showHome} />;
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
                    onOpenRoundGame={(game) => setView({ name: "round-game", game, outcome: null })}
                    onOpenMemoryGame={() => setView({ name: "memory-game", outcome: null })}
                    onOpenMahjong={() => setView({ name: "mahjong", run: null })}
                    onOpenChallenge={() => setView({ name: "challenge", run: null })}
                    onOpenSettings={() => setView({ name: "settings" })}
                />
            );
    }
}

// Opening the home screen on a new day draws the active profile's mission for today, before the screen shows it.
function withTodaysMission(data: AppData): AppData {
    const activeProfile: Profile | null = ProfilesUtils.getActive(data);
    if (activeProfile === null) {
        return data;
    }
    const refreshed: Profile = MissionsUtils.refresh(activeProfile, moment());
    return refreshed === activeProfile ? data : ProfilesUtils.update(data, refreshed);
}
