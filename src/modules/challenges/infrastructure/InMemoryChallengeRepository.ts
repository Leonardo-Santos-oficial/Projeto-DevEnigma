import type { Challenge } from '../domain/Challenge';
import type { ChallengeRepository } from '../domain/ChallengeRepository';

export class InMemoryChallengeRepository implements ChallengeRepository {
  private items = new Map<string, Challenge>();

  constructor(seed: Challenge[] = []) {
    seed.forEach(c => this.items.set(c.id, c));
  }

  async findById(id: string): Promise<Challenge | null> {
    return this.items.get(id) ?? null;
  }

  async findAll(): Promise<Challenge[]> {
    return Array.from(this.items.values());
  }

  async save(challenge: Challenge): Promise<void> {
    this.items.set(challenge.id, challenge);
  }
}
