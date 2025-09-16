import type { PrismaClient } from '@prisma/client';
import { TestCase } from '../domain/TestCase';
import type { TestCaseRepository } from '../domain/TestCaseRepository';

export class PrismaTestCaseRepository implements TestCaseRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByChallengeId(challengeId: string) {
    const rows = await this.prisma.testCase.findMany({ where: { challengeId } });
    return rows.map(r =>
      TestCase.create({
        id: r.id,
        input: r.input,
        expectedOutput: r.expectedOutput,
        isHidden: r.isHidden,
        challengeId: r.challengeId
      })
    );
  }

  async saveMany(testCases: TestCase[]) {
    if (testCases.length === 0) return;
    const challengeId = testCases[0].challengeId;
    // transação simples: remove existentes e insere novos
    await this.prisma.$transaction([
      this.prisma.testCase.deleteMany({ where: { challengeId } }),
      this.prisma.testCase.createMany({
        data: testCases.map(tc => ({
          id: tc.id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isHidden: tc.isHidden,
          challengeId: tc.challengeId
        }))
      })
    ]);
  }
}
