import { describe, it, expect } from 'vitest';

import { Challenge } from '../../challenges/domain/Challenge';
import { InMemoryChallengeRepository } from '../../challenges/infrastructure/InMemoryChallengeRepository';

function makeChallenge(id: string) {
  return Challenge.create({
    id,
    title: `Title ${id}`,
    description: 'Desc',
    starterCode: '// code',
    difficulty: 'EASY',
    language: 'javascript',
    createdAt: new Date(),
    updatedAt: new Date()
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
});
