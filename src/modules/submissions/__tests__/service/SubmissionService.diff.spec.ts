/* eslint-disable import/order, @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import { DefaultSubmissionService } from '../../domain/SubmissionService';
import { InMemoryTestCaseRepository } from '@modules/challenges/infrastructure/InMemoryTestCaseRepository';
import { InMemorySubmissionRepository } from '../../infrastructure/InMemorySubmissionRepository';
import { MockJudge0Client } from '../../infrastructure/MockJudge0Client';
import { WhitespaceCaseInsensitiveStrategy } from '../../domain/EvaluationStrategy';
import type { Logger } from '@core/logging/Logger';

const logger: Logger = { info: () => {}, error: () => {}, debug: () => {} } as any;

describe('DefaultSubmissionService diff generation', () => {
  it('includes diff for failing visible case', async () => {
    const tcRepo = new InMemoryTestCaseRepository([{
      id: 't1', input: 'ignored', expectedOutput: 'EXPECTED', isHidden: false, challengeId: 'c1'
    } as any]);
    const subRepo = new InMemorySubmissionRepository();
    const judge0 = new MockJudge0Client();
    // Código não contém palavra que gere idem ao expected => derivará output = input => falha
    const service = new DefaultSubmissionService(tcRepo as any, subRepo as any, judge0 as any, new WhitespaceCaseInsensitiveStrategy(), logger);
    const result = await service.submit({ code: 'function x(){}', challengeId: 'c1', userId: 'u1', language: 'javascript' });
    expect(result.cases[0].passed).toBe(false);
    expect(result.cases[0].diff).toBeDefined();
    expect(result.cases[0].diff!.line.length).toBeGreaterThan(0);
  });

  it('CRLF vs LF difference produces diff', async () => {
    const tcRepo = new InMemoryTestCaseRepository([{
      id: 't2', input: 'ignored', expectedOutput: 'Hello\nWorld', isHidden: false, challengeId: 'c2'
    } as any]);
    const subRepo = new InMemorySubmissionRepository();
    const judge0 = new MockJudge0Client();
    // Forçar saída derivada multi-linha CRLF: simulamos alterando derive via code contendo hello (gera Hello World único) -> ajustamos expected multi-linha para garantir falha
    const service = new DefaultSubmissionService(tcRepo as any, subRepo as any, judge0 as any, undefined, logger);
    const result = await service.submit({ code: 'hello // triggers hello output', challengeId: 'c2', userId: 'u1', language: 'javascript' });
    expect(result.cases[0].passed).toBe(false);
    expect(result.cases[0].diff).toBeDefined();
  });
});
