import { CoinButton } from "../components/CoinButton.tsx";
import { SettingsIcon } from "../components/Icons.tsx";
import { Logo } from "../components/Logo.tsx";
import { MascotMessage } from "../components/Mascot.tsx";
import { PracticeTiles } from "../components/PracticeTiles.tsx";
import type { Labels } from "../copy/copy.ts";
import { useInstallPrompt, type InstallPrompt } from "../hooks/useInstallPrompt.ts";
import type { Difficulty } from "../utils/difficulties/utils.ts";
import { LevelsUtils } from "../utils/levels/utils.ts";
import { Messages } from "../utils/messages.ts";
import { OperationsUtils, type Operation } from "../utils/operations/utils.ts";
import { ProfilesUtils, type Practice, type Profile } from "../utils/profiles/utils.ts";
import type { StorageStatus } from "../utils/storage/utils.ts";

interface HomeScreenProps {
    profile: Profile;
    storageStatus: StorageStatus;
    onChoosePractice: (practice: Practice) => void;
    onShowProgress: () => void;
    onOpenFactorGame: () => void;
    onOpenChallenge: () => void;
    onOpenSettings: () => void;
}

// Only the choice of what to practise; everything about how to play it waits on the next screen. The coins sit in
// the corner and open the piggy bank. What an adult changes once in a while (who is playing, the language, the
// challenge for adults) waits behind the gear next to them.
export function HomeScreen({ profile, storageStatus, onChoosePractice, onShowProgress, onOpenFactorGame, onOpenChallenge, onOpenSettings }: HomeScreenProps) {
    const { settings } = profile;
    const installPrompt: InstallPrompt = useInstallPrompt();
    const labels: Labels = Messages.getLabels();

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
                {/* The coins keep the corner, where the piggy bank opens under them. */}
                <div className="home-header__actions">
                    <button type="button" className="icon-button" aria-label={labels.settings} onClick={onOpenSettings}>
                        <SettingsIcon />
                    </button>
                    <CoinButton wallet={profile.wallet} />
                </div>
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

            <button type="button" className="practice practice--multiplication practice--wide" onClick={onOpenFactorGame}>
                <span className="practice__symbol practice__symbol--factors" aria-hidden="true">
                    ?×?
                </span>
                <span className="practice__text">
                    <span className="practice__name">{Messages.getFactorGameName()}</span>
                    <span className="practice__summary">{Messages.getFactorGameAbout()}</span>
                </span>
            </button>

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
                {labels.seeProgress}
            </button>

            {/* One tap, and only where the browser offers it: the steps of the other browsers would sit here on every
                visit, and on iPhone and iPad the installed app starts without the progress kept in Safari. */}
            {installPrompt.method === "prompt" && (
                <button type="button" className="button button--secondary button--block" onClick={installPrompt.install}>
                    {labels.addToHomeScreen}
                </button>
            )}
        </main>
    );
}
