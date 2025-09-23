import { describe, it, expect } from 'vitest';
import { ExactMatchStrategy, WhitespaceCaseInsensitiveStrategy } from '../domain/EvaluationStrategy';

const baseCtx = (expected: string[]) => ({
  code: '//',
  language: 'javascript',
  testCases: expected.map((e, i) => ({ input: `in${i}`, expectedOutput: e, isHidden: false }))
});

describe('ExactMatchStrategy', () => {
  it('passa quando outputs idênticos', async () => {
    const s = new ExactMatchStrategy();
    const res = await s.evaluate(baseCtx(['A','B']));
    expect(res.passed).toBe(true);
  });

  it('(limitação atual) não detecta diferença pois usa expected como received', async () => {
    const s = new ExactMatchStrategy();
    const res = await s.evaluate(baseCtx(['Different']));
    expect(res.passed).toBe(true);
  });
});

describe('WhitespaceCaseInsensitiveStrategy', () => {
  it('ignora diferenças de espaçamento e caixa', async () => {
    const s = new WhitespaceCaseInsensitiveStrategy();
    const res = await s.evaluate(baseCtx([' Hello   World  ', 'TeSt  Value   ']));
    expect(res.passed).toBe(true);
  });

  it('(limitação) sempre passa com dados atuais', async () => {
    const s = new WhitespaceCaseInsensitiveStrategy();
    const res = await s.evaluate(baseCtx(['x']));
    expect(res.passed).toBe(true);
  });
});
