import { useId, useState } from "react";
import { PlusIcon } from "../components/Icons.tsx";
import { Logo } from "../components/Logo.tsx";
import { MascotMessage } from "../components/Mascot.tsx";
import { ModePicker } from "../components/ModePicker.tsx";
import { ProfileForm } from "../components/ProfileForm.tsx";
import { SwitchField } from "../components/SwitchField.tsx";
import { TablesPicker } from "../components/TablesPicker.tsx";
import { Messages } from "../utils/messages.ts";
import type { AppData, Profile, ProfileSettings } from "../utils/profiles/utils.ts";

interface HomeScreenProps {
    data: AppData;
    profile: Profile;
    onSelectProfile: (profileId: string) => void;
    onCreateProfile: (name: string) => void;
    onDeleteProfile: (profileId: string) => void;
    onSettingsChange: (settings: ProfileSettings) => void;
    onPlay: () => void;
}

export function HomeScreen({ data, profile, onSelectProfile, onCreateProfile, onDeleteProfile, onSettingsChange, onPlay }: HomeScreenProps) {
    const deleteTitleId: string = useId();
    const [isAddingProfile, setIsAddingProfile] = useState<boolean>(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false);
    const { settings } = profile;
    const hasTables: boolean = settings.tables.length > 0;

    return (
        <main className="screen">
            <Logo />
            <MascotMessage mood="happy" size={96}>
                {Messages.getGreeting(profile.name)}
            </MascotMessage>

            <section className="card">
                <h2 className="section-title">Quem vai jogar?</h2>
                <div className="profiles">
                    {data.profiles.map((candidate) => (
                        <button
                            key={candidate.id}
                            type="button"
                            className="chip"
                            aria-pressed={candidate.id === profile.id}
                            onClick={() => onSelectProfile(candidate.id)}
                        >
                            {candidate.name}
                        </button>
                    ))}
                    <button type="button" className="chip chip--add" aria-expanded={isAddingProfile} onClick={() => setIsAddingProfile(true)}>
                        <PlusIcon />
                        Novo
                    </button>
                </div>
                {isAddingProfile && (
                    <div className="card-section">
                        <ProfileForm
                            data={data}
                            title="Nome do novo perfil"
                            submitLabel="Criar perfil"
                            onSubmit={onCreateProfile}
                            onCancel={() => setIsAddingProfile(false)}
                        />
                    </div>
                )}
            </section>

            <section className="card">
                <TablesPicker selectedTables={settings.tables} onChange={(tables) => onSettingsChange({ ...settings, tables })} />
            </section>

            <section className="card">
                <ModePicker mode={settings.mode} onChange={(mode) => onSettingsChange({ ...settings, mode })} />
            </section>

            <section className="card">
                <SwitchField
                    label="Cronómetro"
                    description="Mostra o tempo de cada jogo. Sem pressa!"
                    isOn={settings.isTimerEnabled}
                    onChange={(isTimerEnabled) => onSettingsChange({ ...settings, isTimerEnabled })}
                />
            </section>

            <div className="play-bar">
                <p className="hint" role="status">
                    {hasTables ? "" : "Escolhe pelo menos uma tabuada."}
                </p>
                <button type="button" className="button button--play" disabled={!hasTables} onClick={onPlay}>
                    Jogar
                </button>
            </div>

            {isConfirmingDelete ? (
                <section className="card stack" role="alertdialog" aria-labelledby={deleteTitleId}>
                    <p id={deleteTitleId} className="section-title">
                        Apagar o perfil «{profile.name}» e todo o progresso?
                    </p>
                    <p className="hint">Não dá para desfazer.</p>
                    <div className="actions-row">
                        <button type="button" className="button button--secondary" autoFocus onClick={() => setIsConfirmingDelete(false)}>
                            Cancelar
                        </button>
                        <button type="button" className="button button--secondary button--danger" onClick={() => onDeleteProfile(profile.id)}>
                            Sim, apagar
                        </button>
                    </div>
                </section>
            ) : (
                <button type="button" className="button button--ghost button--danger" onClick={() => setIsConfirmingDelete(true)}>
                    Apagar perfil «{profile.name}»
                </button>
            )}
        </main>
    );
}
