import type { SubmissionRepository } from '../domain/SubmissionRepository';
import { SubmissionStatus } from '../domain/SubmissionStatus';
import { Submission } from '../domain/Submission';

export class InMemorySubmissionRepository implements SubmissionRepository {
  private items: Submission[] = [];

  constructor(seed: Submission[] = []) {
    this.items = seed;
  }

  async findById(id: string) {
    return this.items.find(s => s.id === id) ?? null;
  }

  async findRecentByUserAndChallenge(userId: string, challengeId: string, limit: number) {
    return this.items
      .filter(s => s.userId === userId && s.challengeId === challengeId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async save(submission: Submission) {
    this.items.push(submission);
  }

  async updateStatus(id: string, status: SubmissionStatus, passed: boolean, executionTime?: number | null, memoryUsage?: number | null) {
    const idx = this.items.findIndex(s => s.id === id);
    if (idx === -1) return;
    const current = this.items[idx];
    const plain = current.toPlain();
    this.items[idx] = Submission.create({
      ...plain,
      status,
      passed,
      executionTime: executionTime ?? null,
      memoryUsage: memoryUsage ?? null
    });
  }
}
