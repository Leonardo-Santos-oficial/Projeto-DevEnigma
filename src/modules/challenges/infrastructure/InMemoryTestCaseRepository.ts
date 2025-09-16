import type { TestCase } from '../domain/TestCase';
import type { TestCaseRepository } from '../domain/TestCaseRepository';

export class InMemoryTestCaseRepository implements TestCaseRepository {
  private items: TestCase[] = [];

  constructor(seed: TestCase[] = []) {
    this.items = seed;
  }

  async findByChallengeId(challengeId: string) {
    return this.items.filter(tc => tc.challengeId === challengeId);
  }

  async saveMany(testCases: TestCase[]): Promise<void> {
    // substitui test cases do mesmo desafio (simplificação)
    const challengeId = testCases[0]?.challengeId;
    if (challengeId) {
      this.items = this.items.filter(tc => tc.challengeId !== challengeId).concat(testCases);
    } else {
      this.items.push(...testCases);
    }
  }
}
