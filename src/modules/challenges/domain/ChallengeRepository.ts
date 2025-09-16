import type { Challenge } from './Challenge';

export interface ChallengeRepository {
  findById(id: string): Promise<Challenge | null>;
  findAll(): Promise<Challenge[]>;
  save(challenge: Challenge): Promise<void>;
}
