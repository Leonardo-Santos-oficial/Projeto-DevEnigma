import { describe, it, expect } from 'vitest';
import { DefaultSubmissionService } from '../../domain/SubmissionService';
import { InMemoryTestCaseRepository } from '@modules/challenges/infrastructure/InMemoryTestCaseRepository';
import { InMemorySubmissionRepository } from '../../infrastructure/InMemorySubmissionRepository';
import { MockJudge0Client } from '../../infrastructure/MockJudge0Client';
import { WhitespaceCaseInsensitiveStrategy } from '../../domain/EvaluationStrategy';
import { InMemoryProfileRepository } from '@modules/profiles/infrastructure/InMemoryProfileRepository';
import type { Logger } from '@core/logging/Logger';

const logger: Logger = { info: () => {}, error: () => {}, debug: () => {} } as any;

describe('Profile integration flow', () => {
  it('increments attempts, solved only on first pass', async () => {
    const tcRepo = new InMemoryTestCaseRepository([{
      id: 'tc', input: 'ignored', expectedOutput: 'Hello World', isHidden: false, challengeId: 'ch'
    } as any]);
    const subRepo = new InMemorySubmissionRepository();
    const profileRepo = new InMemoryProfileRepository();
    const judge0 = new MockJudge0Client();
    const service = new DefaultSubmissionService(tcRepo as any, subRepo as any, judge0 as any, new WhitespaceCaseInsensitiveStrategy(), logger, profileRepo as any);

    // First attempt fails (code does not contain hello)
    await service.submit({ code: 'function x(){}', challengeId: 'ch', userId: 'u1', language: 'javascript' });
    // Second attempt passes
    await service.submit({ code: 'hello', challengeId: 'ch', userId: 'u1', language: 'javascript' });
    // Third attempt (still passes) but solved should not increment again
    await service.submit({ code: 'hello', challengeId: 'ch', userId: 'u1', language: 'javascript' });

    const profile = await profileRepo.findById('u1');
    expect(profile?.attempts).toBe(3);
    expect(profile?.solved).toBe(1);
  });
});
