import { describe, it, expect } from 'vitest';
import { InMemoryTestCaseRepository } from '@modules/challenges/infrastructure/InMemoryTestCaseRepository';
import { TestCase } from '@modules/challenges/domain/TestCase';
import { InMemorySubmissionRepository } from '../infrastructure/InMemorySubmissionRepository';
import { MockJudge0Client } from '../infrastructure/MockJudge0Client';
import { DefaultSubmissionService } from '../domain/SubmissionService';
import { SubmissionStatus } from '../domain/SubmissionStatus';

function makeTestCase(id: string, input: string, expected: string, challengeId: string) {
  return TestCase.create({ id, input, expectedOutput: expected, isHidden: false, challengeId });
}

describe('DefaultSubmissionService', () => {
  it('aprova submissão quando todos test cases passam', async () => {
    const challengeId = 'c1';
    const testCaseRepo = new InMemoryTestCaseRepository([
      makeTestCase('t1', 'ignored', 'Hello World', challengeId)
    ]);
    const submissionRepo = new InMemorySubmissionRepository();
    const judge0 = new MockJudge0Client();
    const service = new DefaultSubmissionService(testCaseRepo, submissionRepo, judge0);

    const result = await service.submit({
      code: 'console.log("Hello World")',
      challengeId,
      userId: 'u1',
      language: 'javascript'
    });

    expect(result.passed).toBe(true);
    expect(result.status).toBe(SubmissionStatus.PASSED);
    expect(result.cases[0].passed).toBe(true);
  });

  it('falha submissão quando output não corresponde', async () => {
    const challengeId = 'c2';
    const testCaseRepo = new InMemoryTestCaseRepository([
      makeTestCase('t1', 'input', 'Expected Output', challengeId)
    ]);
    const submissionRepo = new InMemorySubmissionRepository();
    const judge0 = new MockJudge0Client();
    const service = new DefaultSubmissionService(testCaseRepo, submissionRepo, judge0);

    const result = await service.submit({
      code: 'console.log("Different")',
      challengeId,
      userId: 'u1',
      language: 'javascript'
    });

    expect(result.passed).toBe(false);
    expect(result.status).toBe(SubmissionStatus.FAILED);
  });
});
