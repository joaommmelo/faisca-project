import { useInstallPrompt, type InstallPrompt } from "../hooks/useInstallPrompt.ts";
import { ShareIcon } from "./Icons.tsx";

// Suggests the home screen before the first profile: the app then opens without the browser's bars and works
// offline. On iPhone and iPad it also keeps its own storage, apart from Safari, so it has to come before any progress.
export function InstallCard() {
    const { method, install }: InstallPrompt = useInstallPrompt();

    if (method === "none") {
        return null;
    }

    return (
        <section className="card stack" aria-label="Instalar">
            <h2 className="section-title">Põe o Faísca no ecrã principal</h2>
            <p>Abre como uma app e funciona sem internet.</p>
            {method === "prompt" && (
                <button type="button" className="button button--secondary button--block" onClick={install}>
                    Instalar
                </button>
            )}
            {method === "share-menu" && (
                <>
                    <ol className="install-steps">
                        <li>
                            Toca em <ShareIcon /> Partilhar (se não o vires, está no menu ⋯).
                        </li>
                        <li>Escolhe «Adicionar ao ecrã principal».</li>
                    </ol>
                    <p>
                        <strong>Faz isto antes de começar:</strong> o que fizeres aqui não passa para a app.
                    </p>
                </>
            )}
            {method === "browser-menu" && (
                <ol className="install-steps">
                    <li>Toca no menu ⋮ do browser.</li>
                    <li>Escolhe «Instalar aplicação» ou «Adicionar ao ecrã principal».</li>
                </ol>
            )}
        </section>
    );
}
