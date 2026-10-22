import { useId, useState } from "react";
import type { Labels } from "../copy/copy.ts";
import { Messages } from "../utils/messages.ts";
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
    const labels: Labels = Messages.getLabels();
    const [isAddingProfile, setIsAddingProfile] = useState<boolean>(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false);

    return (
        <section className="card stack" aria-label={labels.profiles}>
            <h2 className="section-title">{labels.whoIsPlaying}</h2>
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
                    {labels.newProfile}
                </button>
            </div>
            {isAddingProfile && (
                <ProfileForm
                    data={data}
                    title={labels.newProfileName}
                    submitLabel={labels.createProfile}
                    onSubmit={onCreateProfile}
                    onCancel={() => setIsAddingProfile(false)}
                />
            )}
            {isConfirmingDelete ? (
                <div className="stack" role="alertdialog" aria-labelledby={deleteTitleId}>
                    <p id={deleteTitleId} className="section-title">
                        {labels.deleteProfileQuestion(profile.name)}
                    </p>
                    <p className="hint">{labels.cannotUndo}</p>
                    <div className="actions-row">
                        <button type="button" className="button button--secondary" autoFocus onClick={() => setIsConfirmingDelete(false)}>
                            {labels.cancel}
                        </button>
                        <button type="button" className="button button--secondary button--danger" onClick={() => onDeleteProfile(profile.id)}>
                            {labels.confirmDelete}
                        </button>
                    </div>
                </div>
            ) : (
                <button type="button" className="button button--ghost button--danger" onClick={() => setIsConfirmingDelete(true)}>
                    {labels.deleteProfile(profile.name)}
                </button>
            )}
        </section>
    );
}
