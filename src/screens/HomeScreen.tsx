import { CoinButton } from "../components/CoinButton.tsx";
import { Logo } from "../components/Logo.tsx";
import { MascotMessage } from "../components/Mascot.tsx";
import { PracticeTiles } from "../components/PracticeTiles.tsx";
import { ProfilesPanel } from "../components/ProfilesPanel.tsx";
import { SwitchField } from "../components/SwitchField.tsx";
import { useInstallPrompt, type InstallPrompt } from "../hooks/useInstallPrompt.ts";
import type { Difficulty } from "../utils/difficulties/utils.ts";
import { LevelsUtils } from "../utils/levels/utils.ts";
import { Messages } from "../utils/messages.ts";
import { OperationsUtils, type Operation } from "../utils/operations/utils.ts";
import { ProfilesUtils, type AppData, type Practice, type Profile } from "../utils/profiles/utils.ts";
import type { StorageStatus } from "../utils/storage/utils.ts";

interface HomeScreenProps {
    data: AppData;
    profile: Profile;
    storageStatus: StorageStatus;
    onSelectProfile: (profileId: string) => void;
    onCreateProfile: (name: string) => void;
    onDeleteProfile: (profileId: string) => void;
    onChoosePractice: (practice: Practice) => void;
    onShowProgress: () => void;
    onOpenChallenge: () => void;
    onChallengeSwitch: (isChallengeEnabled: boolean) => void;
}

// Only the choice of what to practise; everything about how to play it waits on the next screen. The coins sit in
// the corner and open the piggy bank; who is playing rarely changes, so it waits at the bottom, and the challenge for
// adults is switched on below that.
export function HomeScreen({
    data,
    profile,
    storageStatus,
    onSelectProfile,
    onCreateProfile,
    onDeleteProfile,
    onChoosePractice,
    onShowProgress,
    onOpenChallenge,
    onChallengeSwitch
}: HomeScreenProps) {
    const { settings } = profile;
    const installPrompt: InstallPrompt = useInstallPrompt();

    const summaries: Record<Practice, string> = (() => {
        const getSummary = (operation: Operation): string => {
            const difficulty: Difficulty = ProfilesUtils.getDifficulty(settings, operation);
            const level: number = LevelsUtils.getTrack(profile.tracks, LevelsUtils.getTrackId(operation, difficulty)).level;
            return Messages.getOperationSummary(difficulty, level);
        };
        return {
            addition: getSummary("addition"),
            subtraction: getSummary("subtraction"),
            multiplication: getSummary("multiplication"),
            division: getSummary("division"),
            mix: settings.mix.operations.map((operation) => OperationsUtils.getSymbol(operation)).join(" ")
        };
    })();

    return (
        <main className="screen screen--home">
            <header className="home-header">
                <Logo />
                <CoinButton wallet={profile.wallet} />
            </header>

            <MascotMessage mood="happy" size={80}>
                {Messages.getGreeting(profile.name)}
            </MascotMessage>

            {storageStatus !== "saved" && (
                <p className="notice" role="status">
                    {Messages.getStorageWarning(storageStatus)}
                </p>
            )}

            <PracticeTiles summaries={summaries} onChoose={onChoosePractice} />

            {settings.isChallengeEnabled && (
                <button type="button" className="practice practice--challenge" onClick={onOpenChallenge}>
                    <span className="practice__symbol" aria-hidden="true">
                        ∞
                    </span>
                    <span className="practice__text">
                        <span className="practice__name">{Messages.getChallengeName()}</span>
                        <span className="practice__summary">{Messages.getChallengeSummary(profile.challengeRecord)}</span>
                    </span>
                </button>
            )}

            <button type="button" className="button button--secondary button--block" onClick={onShowProgress}>
                Ver progresso
            </button>

            {/* One tap, and only where the browser offers it: the steps of the other browsers would sit here on every
                visit, and on iPhone and iPad the installed app starts without the progress kept in Safari. */}
            {installPrompt.method === "prompt" && (
                <button type="button" className="button button--secondary button--block" onClick={installPrompt.install}>
                    Pôr no ecrã principal
                </button>
            )}

            <ProfilesPanel
                data={data}
                profile={profile}
                onSelectProfile={onSelectProfile}
                onCreateProfile={onCreateProfile}
                onDeleteProfile={onDeleteProfile}
            />

            <section className="card" aria-label="Avançado">
                <h2 className="section-title">Avançado</h2>
                <SwitchField
                    label={Messages.getChallengeName()}
                    description={Messages.getChallengeAbout()}
                    isOn={settings.isChallengeEnabled}
                    onChange={onChallengeSwitch}
                />
            </section>
        </main>
    );
}
