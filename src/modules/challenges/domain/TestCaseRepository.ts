import type { TestCase } from './TestCase';

export interface TestCaseRepository {
  findByChallengeId(challengeId: string): Promise<TestCase[]>;
  saveMany(testCases: TestCase[]): Promise<void>;
}
