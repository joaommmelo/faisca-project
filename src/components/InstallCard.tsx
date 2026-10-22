import { useInstallPrompt, type InstallPrompt } from "../hooks/useInstallPrompt.ts";
import type { Labels } from "../copy/copy.ts";
import { Messages } from "../utils/messages.ts";
import { ShareIcon } from "./Icons.tsx";

// Suggests the home screen before the first profile: the app then opens without the browser's bars and works
// offline. On iPhone and iPad it also keeps its own storage, apart from Safari, so it has to come before any progress.
export function InstallCard() {
    const { method, install }: InstallPrompt = useInstallPrompt();
    const labels: Labels = Messages.getLabels();

    if (method === "none") {
        return null;
    }

    return (
        <section className="card stack" aria-label={labels.install}>
            <h2 className="section-title">{labels.installTitle}</h2>
            <p>{labels.installAbout}</p>
            {method === "prompt" && (
                <button type="button" className="button button--secondary button--block" onClick={install}>
                    {labels.install}
                </button>
            )}
            {method === "share-menu" && (
                <>
                    <ol className="install-steps">
                        <li>
                            {labels.installShareTap} <ShareIcon /> {labels.installShareName}
                        </li>
                        <li>{labels.installShareAdd}</li>
                    </ol>
                    <p>
                        <strong>{labels.installBeforeStarting}</strong> {labels.installBeforeStartingWhy}
                    </p>
                </>
            )}
            {method === "browser-menu" && (
                <ol className="install-steps">
                    <li>{labels.installMenuTap}</li>
                    <li>{labels.installMenuAdd}</li>
                </ol>
            )}
        </section>
    );
}
