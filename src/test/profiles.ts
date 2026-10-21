import { ProfilesUtils, type Profile, type ProfileSettings } from "../utils/profiles/utils.ts";

// A fresh profile with some settings changed, for tests that start a session or apply answers.
export function createTestProfile(settings: Partial<ProfileSettings> = {}, changes: Partial<Profile> = {}): Profile {
    const profile: Profile = ProfilesUtils.createProfile("Rita");
    return { ...profile, ...changes, settings: { ...profile.settings, ...settings } };
}
