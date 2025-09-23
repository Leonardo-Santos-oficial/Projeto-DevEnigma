/* eslint-disable import/order */
import { describe, it, expect, vi } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import { PrismaChallengeRepository } from '@modules/challenges/infrastructure/PrismaChallengeRepository';

function createPrismaMock(overrides: Partial<PrismaClient['challenge']> = {}) {
  return {
    challenge: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      ...overrides
    }
  } as unknown as PrismaClient;
}

describe('PrismaChallengeRepository', () => {
  it('retorna null quando não encontra challenge', async () => {
    const prisma = createPrismaMock({ findUnique: vi.fn().mockResolvedValue(null) });
    const repo = new PrismaChallengeRepository(prisma);
    const result = await repo.findById('x');
    expect(result).toBeNull();
    expect(prisma.challenge.findUnique).toHaveBeenCalledWith({ where: { id: 'x' } });
  });

  it('mapeia challenge encontrado para domain entity', async () => {
    const now = new Date();
    const prisma = createPrismaMock({ findUnique: vi.fn().mockResolvedValue({
      id: 'c1', title: 'Title Ok', description: 'Descricao valida longa', starterCode: '//', difficulty: 'EASY', language: 'javascript', createdAt: now, updatedAt: now
    }) });
    const repo = new PrismaChallengeRepository(prisma);
    const result = await repo.findById('c1');
    expect(result).not.toBeNull();
    expect(result?.id).toBe('c1');
    expect(result?.title).toBe('Title Ok');
  });

  it('findAll ordena por createdAt desc e mapeia lista (datas distintas)', async () => {
    const d1 = new Date('2024-01-01T00:00:00Z');
    const d2 = new Date('2024-06-01T00:00:00Z');
    const d3 = new Date('2024-12-01T00:00:00Z');
    const prisma = createPrismaMock({ findMany: vi.fn().mockResolvedValue([
      { id: 'c3', title: 'GammaZ', description: 'Descricao gamma longa o suficiente', starterCode: '//', difficulty: 'HARD', language: 'js', createdAt: d3, updatedAt: d3, tags: ['hard','graph'] },
      { id: 'c2', title: 'BetaXX', description: 'Descricao beta longa o suficiente', starterCode: '//', difficulty: 'MEDIUM', language: 'js', createdAt: d2, updatedAt: d2, tags: [] },
      { id: 'c1', title: 'AlphaX', description: 'Descricao alpha longa o suficiente', starterCode: '//', difficulty: 'EASY', language: 'js', createdAt: d1, updatedAt: d1, tags: ['intro'] }
    ]) });
    const repo = new PrismaChallengeRepository(prisma);
    const list = await repo.findAll();
    expect(list.map(c => c.id)).toEqual(['c3','c2','c1']);
    expect(list[0].tags).toEqual(['hard','graph']);
    expect(prisma.challenge.findMany).toHaveBeenCalledWith({ orderBy: { createdAt: 'desc' } });
  });

  it('persiste tags no upsert', async () => {
    const now = new Date();
    const prisma = createPrismaMock({ upsert: vi.fn().mockResolvedValue({}) });
    const repo = new PrismaChallengeRepository(prisma);
    const challengeData = { id: 't1', title: 'Titulo Tags', description: 'Descricao longa com tags', starterCode: '//', difficulty: 'EASY' as const, language: 'js', createdAt: now, updatedAt: now, tags: ['array','strings'] };
    // usamos Challenge.create para validar regras, mas aqui focamos no repo: simulamos objeto shape prisma -> domain create já ocorre dentro do repo quando leitura
    // Para salvar precisamos de uma entidade domain real; import dinâmico para evitar alterar topo
    const { Challenge } = await import('../../domain/Challenge');
    const entity = Challenge.create(challengeData);
    await repo.save(entity);
    expect(prisma.challenge.upsert).toHaveBeenCalled();
  const upsertMock = prisma.challenge.upsert as unknown as { mock: { calls: unknown[][] } };
  const call = upsertMock.mock.calls[0][0] as { update: { tags: unknown }; create: { tags: unknown } };
    // Em atualização usamos sintaxe { set: [...] } para substituir todo array
    expect(call.update.tags).toEqual({ set: ['array','strings'] });
    // Na criação pode ser passado diretamente como array
    expect(call.create.tags).toEqual(['array','strings']);
  });
});
