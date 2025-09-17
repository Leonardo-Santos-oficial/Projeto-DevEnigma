import { Profile } from '../domain/Profile';
import type { ProfileRepository } from '../domain/ProfileRepository';

export class InMemoryProfileRepository implements ProfileRepository {
  constructor(private profiles: Profile[] = []) {}

  async findById(id: string): Promise<Profile | null> {
    return this.profiles.find(p => p.id === id) ?? null;
  }

  async save(profile: Profile): Promise<void> {
    const idx = this.profiles.findIndex(p => p.id === profile.id);
    if (idx >= 0) this.profiles[idx] = profile; else this.profiles.push(profile);
  }

  async all(): Promise<Profile[]> { return [...this.profiles].sort((a,b) => b.solved - a.solved || a.username.localeCompare(b.username)); }
}
