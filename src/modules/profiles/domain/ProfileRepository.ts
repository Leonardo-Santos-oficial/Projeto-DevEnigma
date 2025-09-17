import { Profile } from './Profile';

export interface ProfileRepository {
  findById(id: string): Promise<Profile | null>;
  save(profile: Profile): Promise<void>;
  all(): Promise<Profile[]>;
}
