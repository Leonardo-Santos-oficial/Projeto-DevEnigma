import { describe, it, expect } from 'vitest';

import { Challenge } from '../../challenges/domain/Challenge';
import { InMemoryChallengeRepository } from '../../challenges/infrastructure/InMemoryChallengeRepository';

function makeChallenge(id: string, createdAt = new Date(), tags: string[] = []) {
  return Challenge.create({
    id,
    title: `Title ${id}`,
    description: 'Descrição válida de teste para garantir tamanho mínimo',
    starterCode: '// code',
    difficulty: 'EASY',
    language: 'javascript',
    createdAt,
    updatedAt: createdAt,
    tags
  });
}

describe('InMemoryChallengeRepository', () => {
  it('salva e recupera por id', async () => {
    const repo = new InMemoryChallengeRepository();
    const challenge = makeChallenge('abc');
    await repo.save(challenge);
    const found = await repo.findById('abc');
    expect(found?.id).toBe('abc');
  });

  it('retorna null para id inexistente', async () => {
    const repo = new InMemoryChallengeRepository();
    const found = await repo.findById('nope');
    expect(found).toBeNull();
  });

  it('mantém tags associadas ao challenge salvo', async () => {
    const repo = new InMemoryChallengeRepository();
    const ch = makeChallenge('tagged', new Date(), ['intro','loop']);
    await repo.save(ch);
    const found = await repo.findById('tagged');
    expect(found?.tags).toEqual(['intro','loop']);
  });

  it('findAll retorna todos (sem ordenação garantida aqui) incluindo tags', async () => {
    const c1 = makeChallenge('c1', new Date('2024-01-01'), ['a']);
    const c2 = makeChallenge('c2', new Date('2024-02-01'), ['b']);
    const repo = new InMemoryChallengeRepository([c1, c2]);
    const list = await repo.findAll();
    expect(list).toHaveLength(2);
    const tagsConcat = list.flatMap(c => c.tags);
    expect(tagsConcat.sort()).toEqual(['a','b']);
  });
});
