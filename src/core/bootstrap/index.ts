// Composition Root - registra implementações concretas em um único ponto
// Segue DIP: camadas altas importam apenas TOKENS + container.

import { PrismaClient } from '@prisma/client';

import { loadEnv } from '@core/config/env';
import { Challenge } from '@modules/challenges/domain/Challenge';
import { InMemoryChallengeRepository } from '@modules/challenges/infrastructure/InMemoryChallengeRepository';
import { PrismaChallengeRepository } from '@modules/challenges/infrastructure/PrismaChallengeRepository';
import { container, TOKENS } from '../di/container';

// Durante build estático (NEXT_PHASE=build) se DATABASE_URL não existir, forçamos modo in-memory
// NEXT_PHASE pode não estar definido; também checamos NODE_ENV === 'production' durante build
const isBuilding = process.env.NEXT_PHASE === 'build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL);
if (isBuilding && !process.env.DATABASE_URL) {
  process.env.USE_IN_MEMORY = 'true';
}
const env = loadEnv(!process.env.USE_IN_MEMORY);

// Prisma singleton somente se não estiver em modo in-memory
let prisma: PrismaClient | null = null;
if (env.USE_IN_MEMORY !== 'true') {
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL ausente. Defina no .env ou use USE_IN_MEMORY=true');
  }
    prisma = new PrismaClient();
    container.registerSingleton('PrismaClient', prisma);
}

// Registro repositório de desafios (pode trocar entre Prisma e InMemory via flag)
const USE_IN_MEMORY = process.env.USE_IN_MEMORY === 'true';

if (USE_IN_MEMORY) {
  container.registerSingleton(
    TOKENS.ChallengeRepository,
    new InMemoryChallengeRepository([
      Challenge.create({
        id: 'hello-world',
        title: 'Hello World Fix',
        description: 'Corrija o código para imprimir Hello World corretamente.',
        starterCode: 'function main() {\n  // TODO: corrigir\n  consol.log("Hello Wrold")\n}\n',
        difficulty: 'EASY',
        language: 'javascript',
        createdAt: new Date(),
        updatedAt: new Date()
      })
    ])
  );
} else if (!isBuilding && prisma) {
  container.registerFactory(TOKENS.ChallengeRepository, () => new PrismaChallengeRepository(prisma!));
}

// Futuro: registrar SubmissionService, Judge0Client, etc.

export {}; // módulo sem exports públicos (side-effects apenas)
