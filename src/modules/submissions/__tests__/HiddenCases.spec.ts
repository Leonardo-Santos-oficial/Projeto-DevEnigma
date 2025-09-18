/* eslint-disable import/order, @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import { TestCase } from '@modules/challenges/domain/TestCase';
import { InMemoryTestCaseRepository } from '@modules/challenges/infrastructure/InMemoryTestCaseRepository';
import { InMemorySubmissionRepository } from '../infrastructure/InMemorySubmissionRepository';
import { MockJudge0Client } from '../infrastructure/MockJudge0Client';
import { DefaultSubmissionService } from '../domain/SubmissionService';
import { WhitespaceCaseInsensitiveStrategy } from '../domain/EvaluationStrategy';
import { logger } from '@core/logging/Logger';

function make(id: string, input: string, expected: string, challengeId: string, hidden: boolean) {
  return TestCase.create({ id, input, expectedOutput: expected, isHidden: hidden, challengeId });
}

describe('Hidden test cases filtering', () => {
  it('não retorna casos ocultos no payload', async () => {
    const challengeId = 'ch-hidden';
    const testCaseRepo = new InMemoryTestCaseRepository([
      make('v1', 'ignored', 'Hello', challengeId, false),
      make('h1', 'ignored2', 'Hello', challengeId, true)
    ]);
    const submissionRepo = new InMemorySubmissionRepository();
    const service = new DefaultSubmissionService(
      testCaseRepo,
      submissionRepo,
      new MockJudge0Client(),
      new WhitespaceCaseInsensitiveStrategy(),
      logger
    );

    const result = await service.submit({
      code: 'console.log("Hello")',
      challengeId,
      userId: 'u',
      language: 'javascript'
    });

    expect(result.cases.length).toBe(1);
    expect(result.cases[0].expected).toBe('Hello');
  });
});
