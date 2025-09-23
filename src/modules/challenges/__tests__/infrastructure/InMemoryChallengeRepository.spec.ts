import { describe, it, expect } from 'vitest';

import { Challenge } from '../../domain/Challenge';
import { InMemoryChallengeRepository } from '../../infrastructure/InMemoryChallengeRepository';

function makeChallenge(id = 'c1') {
  const now = new Date();
  return Challenge.create({
    id,
    title: 'Titulo Válido',
    description: 'Descrição suficientemente longa',
    starterCode: '// code',
    difficulty: 'EASY',
    language: 'javascript',
    createdAt: now,
    updatedAt: now
  });
}

describe('InMemoryChallengeRepository', () => {
  it('retorna null para id inexistente', async () => {
    const repo = new InMemoryChallengeRepository();
    expect(await repo.findById('x')).toBeNull();
  });

  it('salva e recupera challenge', async () => {
    const repo = new InMemoryChallengeRepository();
    const ch = makeChallenge('abc');
    await repo.save(ch);
    const loaded = await repo.findById('abc');
    expect(loaded?.id).toBe('abc');
  });

  it('findAll retorna todos itens sem alterar conteúdo', async () => {
    const c1 = makeChallenge('c1');
    const c2 = makeChallenge('c2');
    const repo = new InMemoryChallengeRepository([c1, c2]);
    const list = await repo.findAll();
    expect(list.map(c => c.id)).toEqual(['c1','c2']);
  });
});
