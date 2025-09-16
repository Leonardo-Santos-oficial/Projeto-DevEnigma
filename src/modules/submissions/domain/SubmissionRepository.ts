import type { Submission } from './Submission';
import { SubmissionStatus } from './SubmissionStatus';

export interface SubmissionRepository {
  findById(id: string): Promise<Submission | null>;
  findRecentByUserAndChallenge(userId: string, challengeId: string, limit: number): Promise<Submission[]>;
  save(submission: Submission): Promise<void>;
  updateStatus(id: string, status: SubmissionStatus, passed: boolean, executionTime?: number | null, memoryUsage?: number | null): Promise<void>;
}
