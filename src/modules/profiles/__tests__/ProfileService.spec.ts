import { describe, it, expect } from 'vitest';
import { Profile } from '../domain/Profile';
import { InMemoryProfileRepository } from '../infrastructure/InMemoryProfileRepository';

describe('Profile entity and repository', () => {
  it('increments attempts and solved only first time', async () => {
    const repo = new InMemoryProfileRepository([]);
    let profile = Profile.createNew('u1', 'user-u1');
    await repo.save(profile);
    profile.registerSubmission(true, true); // first solve
    await repo.save(profile);
    profile.registerSubmission(true, false); // solved again same challenge
    await repo.save(profile);
    const stored = await repo.findById('u1');
    expect(stored?.attempts).toBe(2);
    expect(stored?.solved).toBe(1);
  });
});
