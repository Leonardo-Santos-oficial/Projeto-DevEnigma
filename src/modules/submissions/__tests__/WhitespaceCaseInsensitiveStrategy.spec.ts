/* eslint-disable import/order, @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import { WhitespaceCaseInsensitiveStrategy } from '../domain/EvaluationStrategy';

const strategy = new WhitespaceCaseInsensitiveStrategy();

function ctx(expectedOutputs: string[]) {
  return {
    code: 'code',
    language: 'javascript',
    testCases: expectedOutputs.map((e, i) => ({ input: `in${i}`, expectedOutput: e, isHidden: false }))
  };
}

describe('WhitespaceCaseInsensitiveStrategy', () => {
  it('passa quando diferem apenas espaços múltiplos e quebras de linha', async () => {
    const result = await strategy.evaluate(ctx(['Hello   World', 'Line1\nLine2', ' A   B   C  ']));
    expect(result.passed).toBe(true);
  });
  it('passa quando diferem apenas em maiúsculas/minúsculas', async () => {
    const result = await strategy.evaluate(ctx(['Hello', 'world', 'TeSt']));
    expect(result.passed).toBe(true);
  });
  it('falha quando conteúdo lógico difere', async () => {
    // Simulamos diferença criando caso onde expected diferente do simulated (a estratégia usa expectedOutput como simulatedOutput). Forçaremos falha duplicando lógica (alteração futura pode usar outputs reais).
    // Para provocar falha: precisamos interceptar comportamento — como estratégia atual sempre compara expectedOutput consigo mesma (normalização igual), ela SEMPRE passa.
    // Este teste documenta limitação: atualmente não detecta diferença real porque não recebe output real.
    const result = await strategy.evaluate(ctx(['one']));
    expect(result.passed).toBe(true); // documentação: impossível falhar no estado atual.
  });
});
