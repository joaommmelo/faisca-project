import { useId, useState } from "react";
import type { AppData, Profile } from "../utils/profiles/utils.ts";
import { PlusIcon } from "./Icons.tsx";
import { ProfileForm } from "./ProfileForm.tsx";

interface ProfilesPanelProps {
    data: AppData;
    profile: Profile;
    onSelectProfile: (profileId: string) => void;
    onCreateProfile: (name: string) => void;
    onDeleteProfile: (profileId: string) => void;
}

// Who is playing: switch, add or remove profiles. Opened from the name at the top of the home screen.
export function ProfilesPanel({ data, profile, onSelectProfile, onCreateProfile, onDeleteProfile }: ProfilesPanelProps) {
    const deleteTitleId: string = useId();
    const [isAddingProfile, setIsAddingProfile] = useState<boolean>(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false);

    return (
        <section className="card stack" aria-label="Perfis">
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
                <ProfileForm
                    data={data}
                    title="Nome do novo perfil"
                    submitLabel="Criar perfil"
                    onSubmit={onCreateProfile}
                    onCancel={() => setIsAddingProfile(false)}
                />
            )}
            {isConfirmingDelete ? (
                <div className="stack" role="alertdialog" aria-labelledby={deleteTitleId}>
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
                </div>
            ) : (
                <button type="button" className="button button--ghost button--danger" onClick={() => setIsConfirmingDelete(true)}>
                    Apagar perfil «{profile.name}»
                </button>
            )}
        </section>
    );
}
