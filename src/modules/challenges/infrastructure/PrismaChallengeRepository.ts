import type { PrismaClient } from '@prisma/client';

import { Challenge } from '../domain/Challenge';
import type { ChallengeRepository } from '../domain/ChallengeRepository';

// Implementação real usando Prisma (OCP: não altera consumidores)
export class PrismaChallengeRepository implements ChallengeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string) {
    const row = await this.prisma.challenge.findUnique({ where: { id } });
    if (!row) return null;
    return this.toDomain(row);
  }

  async findAll() {
    const rows = await this.prisma.challenge.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map(r => this.toDomain(r));
  }

  async save(challenge: Challenge) {
    const delegate = this.prisma.challenge as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    const tags = challenge.tags ?? [];
    await delegate.upsert({
      where: { id: challenge.id },
      update: {
        title: challenge.title,
        description: challenge.description,
        starterCode: challenge.starterCode,
        difficulty: challenge.difficulty,
        language: challenge.language,
        tags: { set: tags }
      },
      create: {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        starterCode: challenge.starterCode,
        difficulty: challenge.difficulty,
        language: challenge.language,
        tags
      }
    });
  }

  private toDomain(row: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    return Challenge.create({ ...row, tags: (row.tags ?? []) });
  }
}
