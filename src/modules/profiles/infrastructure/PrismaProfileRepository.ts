import type { PrismaClient, Profile as PrismaProfile } from '@prisma/client';

import { Profile } from '../domain/Profile';
import type { ProfileRepository } from '../domain/ProfileRepository';

// NOTE: Requires `prisma generate` after adding Profile model to schema.
export class PrismaProfileRepository implements ProfileRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Profile | null> {
    const row = await this.prisma.profile.findUnique({ where: { userId: id } });
    if (!row) return null;
    return this.mapToDomain(row);
  }

  async save(profile: Profile): Promise<void> {
    await this.prisma.profile.upsert({
      where: { userId: profile.id },
      update: {
        attempts: profile.attempts,
        solved: profile.solved,
        updatedAt: profile.updatedAt,
      },
      create: {
        userId: profile.id,
        attempts: profile.attempts,
        solved: profile.solved,
      }
    });
  }

  async all(): Promise<Profile[]> {
    const rows = await this.prisma.profile.findMany({ orderBy: [{ solved: 'desc' }, { attempts: 'asc' }] });
    return rows.map(r => this.mapToDomain(r));
  }

  // Using 'any' row typing to stay decoupled; Prisma generates a type but we only need fields present.
  private mapToDomain(row: PrismaProfile): Profile {
    return Profile.restore({
      id: row.userId,
      username: row.userId, // placeholder until join with User
      solved: row.solved,
      attempts: row.attempts,
      lastSubmissionAt: row.updatedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
