import { describe, it, expect } from 'vitest';
import { DefaultSubmissionService } from '../../domain/SubmissionService';
import { InMemoryTestCaseRepository } from '@modules/challenges/infrastructure/InMemoryTestCaseRepository';
import { InMemorySubmissionRepository } from '../../infrastructure/InMemorySubmissionRepository';
import { MockJudge0Client } from '../../infrastructure/MockJudge0Client';
import type { Logger } from '@core/logging/Logger';

const logger: Logger = { info: () => {}, error: () => {}, debug: () => {} } as any;

describe('SubmissionService with many test cases', () => {
  it('processes large number of cases within reasonable time', async () => {
    const cases = Array.from({ length: 60 }, (_, i) => ({
      id: 'tc-' + i,
      input: 'ignored',
      expectedOutput: 'Hello World',
      isHidden: i % 10 === 0, // alguns ocultos
      challengeId: 'big'
    } as any));
    const tcRepo = new InMemoryTestCaseRepository(cases);
    const subRepo = new InMemorySubmissionRepository();
    const judge0 = new MockJudge0Client();
    const service = new DefaultSubmissionService(tcRepo as any, subRepo as any, judge0 as any, undefined, logger);
    const start = performance.now();
    const result = await service.submit({ code: 'hello', challengeId: 'big', userId: 'u1', language: 'javascript' });
    const duration = performance.now() - start;
    // should mark all public cases as passed
    expect(result.cases.length).toBe(cases.filter(c => !c.isHidden).length);
    expect(result.passed).toBe(true);
    // tempo heurístico: < 1000ms local (mock). Não falha rígido; apenas sanity check amplo
    expect(duration).toBeLessThan(1000);
  });
});
