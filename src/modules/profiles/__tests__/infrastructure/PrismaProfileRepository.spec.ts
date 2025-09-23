/* eslint-disable import/order */
import { describe, it, expect, vi } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import { PrismaProfileRepository } from '@modules/profiles/infrastructure/PrismaProfileRepository';
import { Profile } from '@modules/profiles/domain/Profile';

function prismaMock(overrides: Partial<PrismaClient['profile']> = {}) {
  return {
    profile: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      findMany: vi.fn(),
      ...overrides
    }
  } as unknown as PrismaClient;
}

describe('PrismaProfileRepository', () => {
  it('findById retorna null se não existir', async () => {
    const prisma = prismaMock({ findUnique: vi.fn().mockResolvedValue(null) });
    const repo = new PrismaProfileRepository(prisma);
    const res = await repo.findById('u1');
    expect(res).toBeNull();
  });
  it('save executa upsert', async () => {
    const prisma = prismaMock();
    const repo = new PrismaProfileRepository(prisma);
    const profile = Profile.restore({ id: 'u1', username: 'u1', solved: 0, attempts: 0, lastSubmissionAt: new Date(), createdAt: new Date(), updatedAt: new Date() });
    await repo.save(profile);
    expect(prisma.profile.upsert).toHaveBeenCalled();
  });
});
