import { describe, it, expect } from 'vitest';
import { Challenge, type ChallengeProps } from '../../domain/Challenge';

function makeBase(overrides: Partial<ChallengeProps> = {}): ChallengeProps {
  const now = new Date();
  return Object.assign({
    id: 'c1',
    title: 'Titulo Válido',
    description: 'Descrição suficientemente longa',
    starterCode: '// code',
    difficulty: 'EASY' as const,
    language: 'javascript',
    createdAt: now,
    updatedAt: now
  }, overrides);
}

describe('Challenge (Domain Entity)', () => {
  it('cria entidade válida', () => {
    const c = Challenge.create(makeBase());
    expect(c.id).toBe('c1');
    expect(c.title).toBe('Titulo Válido');
  });

  it('falha quando title muito curto', () => {
    expect(() => Challenge.create(makeBase({ title: 'ab' }))).toThrow(/title deve ter ao menos 3/);
  });

  it('falha quando description muito curta', () => {
    expect(() => Challenge.create(makeBase({ description: 'pequena' }))).toThrow(/description mínima/);
  });

  it('falha em difficulty inválida', () => {
    // @ts-expect-error testando caminho inválido
    expect(() => Challenge.create(makeBase({ difficulty: 'IMPOSSIBLE' }))).toThrow(/Difficulty inválida/);
  });

  it('falha se language vazio', () => {
    expect(() => Challenge.create(makeBase({ language: '   ' }))).toThrow(/Language obrigatória/);
  });
});
