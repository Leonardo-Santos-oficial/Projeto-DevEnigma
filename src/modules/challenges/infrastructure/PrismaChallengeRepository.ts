import type { PrismaClient } from '@prisma/client';

import { Challenge } from '../domain/Challenge';
import type { ChallengeRepository } from '../domain/ChallengeRepository';

// Implementação real usando Prisma (OCP: não altera consumidores)
export class PrismaChallengeRepository implements ChallengeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string) {
    const data = await this.prisma.challenge.findUnique({ where: { id } });
    if (!data) return null;
    return Challenge.create(data);
  }

  async findAll() {
    const list = await this.prisma.challenge.findMany({ orderBy: { createdAt: 'desc' } });
    return list.map(c => Challenge.create(c));
  }

  async save(challenge: Challenge) {
    await this.prisma.challenge.upsert({
      where: { id: challenge.id },
      update: {
        title: challenge.title,
        description: challenge.description,
        starterCode: challenge.starterCode,
        difficulty: challenge.difficulty,
        language: challenge.language
      },
      create: {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        starterCode: challenge.starterCode,
        difficulty: challenge.difficulty,
        language: challenge.language
      }
    });
  }
}
