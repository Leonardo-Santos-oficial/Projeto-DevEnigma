// Composition Root (composition root isolado: SRP para configurar DI)
import type { PrismaClient } from '@prisma/client';

import { loadEnv } from '@core/config/env';
import { prisma as sharedPrisma } from '@core/database/prismaClient';
import { logger } from '@core/logging/Logger';
import { Challenge } from '@modules/challenges/domain/Challenge';
import { TestCase } from '@modules/challenges/domain/TestCase';
import { InMemoryChallengeRepository } from '@modules/challenges/infrastructure/InMemoryChallengeRepository';
import { InMemoryTestCaseRepository } from '@modules/challenges/infrastructure/InMemoryTestCaseRepository';
import { PrismaChallengeRepository } from '@modules/challenges/infrastructure/PrismaChallengeRepository';
import { PrismaTestCaseRepository } from '@modules/challenges/infrastructure/PrismaTestCaseRepository';
import { InMemoryProfileRepository } from '@modules/profiles/infrastructure/InMemoryProfileRepository';
import { PrismaProfileRepository } from '@modules/profiles/infrastructure/PrismaProfileRepository';
import { WhitespaceCaseInsensitiveStrategy } from '@modules/submissions/domain/EvaluationStrategy';
import { DefaultSubmissionService } from '@modules/submissions/domain/SubmissionService';
import { InMemorySubmissionRepository } from '@modules/submissions/infrastructure/InMemorySubmissionRepository';
import { Judge0HttpClient } from '@modules/submissions/infrastructure/Judge0HttpClient';
import { MockJudge0Client } from '@modules/submissions/infrastructure/MockJudge0Client';
import { PrismaSubmissionRepository } from '@modules/submissions/infrastructure/PrismaSubmissionRepository';

import { container, TOKENS } from '../di/container';
container.registerSingleton('Logger', logger);

const isBuilding = process.env.NEXT_PHASE === 'build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL);
if (isBuilding && !process.env.DATABASE_URL) {
  process.env.USE_IN_MEMORY = 'true';
}
if (!isBuilding && process.env.NODE_ENV !== 'production' && !process.env.DATABASE_URL && process.env.USE_IN_MEMORY !== 'true') {
  process.env.USE_IN_MEMORY = 'true';
  logger.info('bootstrap.fallbackInMemory', { reason: 'DATABASE_URL missing in dev, forcing USE_IN_MEMORY=true' });
}
const env = loadEnv(!process.env.USE_IN_MEMORY);

// Prisma é opcional dependendo do modo (in-memory vs banco real)
let prisma: PrismaClient | null = null;
if (env.USE_IN_MEMORY !== 'true') {
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL ausente. Defina no .env ou use USE_IN_MEMORY=true');
  }
  prisma = sharedPrisma;
  container.registerSingleton('PrismaClient', prisma);
}

const USE_IN_MEMORY = process.env.USE_IN_MEMORY === 'true';

// Log inicial explícito do modo atual para facilitar diagnóstico (SRP: apenas informação, sem alterar fluxo)
logger.info('bootstrap.mode', {
  nodeEnv: process.env.NODE_ENV,
  useInMemory: USE_IN_MEMORY,
  hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
  isBuilding
});

if (USE_IN_MEMORY) {
  const now = () => new Date();
  const inMemoryChallenges = [
    Challenge.create({
      id: 'hello-world',
      title: 'Hello World Fix',
      description: 'Corrija o código para imprimir Hello World corretamente.',
      starterCode: 'function main() {\n  // TODO: corrigir\n  consol.log("Hello Wrold")\n}\n',
      difficulty: 'EASY',
      language: 'javascript',
      createdAt: now(),
      updatedAt: now()
    }),
    Challenge.create({
      id: 'sum-range-off-by-one',
      title: 'Sum Range Off By One',
      description: 'Some todos inteiros entre start e end (inclusive). Há um bug de off-by-one.',
      starterCode: 'export function sumRange(start, end) {\n  let total = 0;\n  for (let i = start; i < end; i++) { // BUG: não inclui end\n    total += i;\n  }\n  return total;\n}\n',
      difficulty: 'EASY',
      language: 'javascript',
      createdAt: now(),
      updatedAt: now()
    }),
    Challenge.create({
      id: 'palindrome-normalizer',
      title: 'Palindrome Check Normalizer',
      description: 'Verifique se string é palíndromo ignorando espaços, pontuação e caixa. Código falha na normalização.',
      starterCode: 'export function isPalindrome(str) {\n  const cleaned = str.replace(/\\s+/g, ""); // não remove pontuação nem lowercase\n  const reversed = cleaned.split("").reverse().join("");\n  return cleaned === reversed;\n}\n',
      difficulty: 'MEDIUM',
      language: 'javascript',
      createdAt: now(),
      updatedAt: now()
    }),
    Challenge.create({
      id: 'factorial-edge-cases',
      title: 'Factorial Edge Cases',
      description: 'Calcule fatorial (0 <= n <= 10). Código trata 0! errado e laço não multiplica por n.',
      starterCode: 'export function factorial(n){\n  if(n === 0) return 0; // BUG: 0! deve ser 1\n  if(n < 0) throw new Error("negativo");\n  let r = 1;\n  for(let i=1;i<n;i++){ // BUG: para antes de n\n    r *= i;\n  }\n  return r;\n}\n',
      difficulty: 'EASY',
      language: 'javascript',
      createdAt: now(),
      updatedAt: now()
    }),
    Challenge.create({
      id: 'unique-array-elements',
      title: 'Unique Array Elements',
      description: 'Retorne array sem duplicados preservando ordem. Implementação atual muta e reordena.',
      starterCode: 'export function unique(arr){\n  for(let i=0;i<arr.length;i++){\n    for(let j=i+1;j<arr.length;j++){\n      if(arr[i]===arr[j]){\n        arr.splice(j,1);\n      }\n    }\n  }\n  return arr.sort();\n}\n',
      difficulty: 'MEDIUM',
      language: 'javascript',
      createdAt: now(),
      updatedAt: now()
    }),
    Challenge.create({
      id: 'fizzbuzz-broken-logic',
      title: 'FizzBuzz Broken Logic',
      description: 'Corrija a ordem das condições para FizzBuzz (15 antes de 3 e 5).',
      starterCode: 'export function fizzbuzz(n){\n  let out = [];\n  for(let i=1;i<=n;i++){\n    if(i%3===0) out.push("Fizz");\n    else if(i%5===0) out.push("Buzz");\n    else if(i%15===0) out.push("FizzBuzz");\n    else out.push(String(i));\n  }\n  return out.join(",");\n}\n',
      difficulty: 'EASY',
      language: 'javascript',
      createdAt: now(),
      updatedAt: now()
    }),
    Challenge.create({
      id: 'normalize-whitespace',
      title: 'Normalize Whitespace',
      description: 'Remova espaços duplicados internos e aparar início/fim.',
      starterCode: 'export function normalize(str){\n  return str.trim().replace(/\\s+/," "); // só primeira ocorrência\n}\n',
      difficulty: 'EASY',
      language: 'javascript',
      createdAt: now(),
      updatedAt: now()
    }),
    Challenge.create({
      id: 'anagram-detector',
      title: 'Anagram Detector',
      description: 'Verifique anagramas ignorando caixa e espaços.',
      starterCode: 'export function areAnagrams(a,b){\n  return a === b;\n}\n',
      difficulty: 'MEDIUM',
      language: 'javascript',
      createdAt: now(),
      updatedAt: now()
    }),
    Challenge.create({
      id: 'roman-numeral-parser',
      title: 'Roman Numeral Parser',
      description: 'Parse básico de algarismos romanos (I,V,X,L,C) tratando subtrações.',
      starterCode: 'export function romanToInt(s){\n  const map = {I:1,V:5,X:10,L:50,C:100};\n  let total = 0;\n  for(let i=0;i<s.length;i++){\n    total += map[s[i]]; // ignora subtrações\n  }\n  return total;\n}\n',
      difficulty: 'HARD',
      language: 'javascript',
      createdAt: now(),
      updatedAt: now()
    })
  ];
  container.registerSingleton(
    TOKENS.ChallengeRepository,
    new InMemoryChallengeRepository(inMemoryChallenges)
  );
} else if (!isBuilding && prisma) {
  container.registerFactory(TOKENS.ChallengeRepository, () => new PrismaChallengeRepository(prisma!));
}

if (USE_IN_MEMORY) {
  const tc = (id: string, input: string, expectedOutput: string, isHidden: boolean, challengeId: string) => TestCase.create({ id, input, expectedOutput, isHidden, challengeId });
  const inMemoryTestCases = [
    tc('tc-hello-visible-1', 'ignored', 'Hello World', false, 'hello-world'),
    tc('tc-hello-hidden-1', 'any', 'Hello World', true, 'hello-world'),
    tc('tc-sum-range-1', '1 3', '6', false, 'sum-range-off-by-one'),
    tc('tc-sum-range-2', '5 5', '5', false, 'sum-range-off-by-one'),
    tc('tc-sum-range-hidden-1', '10 12', '33', true, 'sum-range-off-by-one'),
    tc('tc-palindrome-1', 'Ame a ema', 'true', false, 'palindrome-normalizer'),
    tc('tc-palindrome-2', 'Hello World', 'false', false, 'palindrome-normalizer'),
    tc('tc-palindrome-hidden-1', 'Roma me tem amor', 'true', true, 'palindrome-normalizer'),
    tc('tc-factorial-0', '0', '1', false, 'factorial-edge-cases'),
    tc('tc-factorial-1', '1', '1', false, 'factorial-edge-cases'),
    tc('tc-factorial-hidden-5', '5', '120', true, 'factorial-edge-cases'),
    tc('tc-unique-1', '1,2,2,3', '1,2,3', false, 'unique-array-elements'),
    tc('tc-unique-2', 'a,a,a', 'a', false, 'unique-array-elements'),
    tc('tc-unique-hidden-3', '3,3,2,1,2', '3,2,1', true, 'unique-array-elements'),
    tc('tc-fizzbuzz-5', '5', '1,2,Fizz,4,Buzz', false, 'fizzbuzz-broken-logic'),
    tc('tc-fizzbuzz-hidden-15', '15', '1,2,Fizz,4,Buzz,Fizz,7,8,Fizz,Buzz,11,Fizz,13,14,FizzBuzz', true, 'fizzbuzz-broken-logic'),
    tc('tc-normalize-1', '  oi   mundo  ', 'oi mundo', false, 'normalize-whitespace'),
    tc('tc-normalize-hidden-2', 'a   b    c', 'a b c', true, 'normalize-whitespace'),
    tc('tc-anagram-1', 'listen silent', 'true', false, 'anagram-detector'),
    tc('tc-anagram-2', 'abc abd', 'false', false, 'anagram-detector'),
    tc('tc-anagram-hidden-3', 'Banana ananab', 'true', true, 'anagram-detector'),
    tc('tc-roman-1', 'III', '3', false, 'roman-numeral-parser'),
    tc('tc-roman-2', 'XII', '12', false, 'roman-numeral-parser'),
    tc('tc-roman-hidden-iv', 'IV', '4', true, 'roman-numeral-parser'),
    tc('tc-roman-hidden-xix', 'XIX', '19', true, 'roman-numeral-parser')
  ];
  container.registerSingleton(
    TOKENS.TestCaseRepository,
    new InMemoryTestCaseRepository(inMemoryTestCases)
  );
  logger.info('bootstrap.seed.testCases', { total: inMemoryTestCases.length });
} else if (!isBuilding && prisma) {
  container.registerFactory(TOKENS.TestCaseRepository, () => new PrismaTestCaseRepository(prisma!));
}

if (USE_IN_MEMORY) {
  container.registerSingleton(
    TOKENS.SubmissionRepository,
    new InMemorySubmissionRepository([])
  );
  // Profile repo em memória
  container.registerSingleton(
    TOKENS.ProfileRepository,
    new InMemoryProfileRepository([])
  );
} else if (prisma) {
  // Durante build (SSG/ISR) precisamos que os repositórios Prisma existam para rotas pré-renderizadas (ex: ranking)
  container.registerFactory(TOKENS.SubmissionRepository, () => new PrismaSubmissionRepository(prisma!));
  container.registerFactory(TOKENS.ProfileRepository, () => new PrismaProfileRepository(prisma!));
}

const useJudge0Mock = process.env.USE_JUDGE0_MOCK === 'true' || !env.JUDGE0_API_URL;
if (useJudge0Mock) {
  container.registerSingleton('Judge0Client', new MockJudge0Client());
} else {
  container.registerSingleton('Judge0Client', new Judge0HttpClient(env.JUDGE0_API_URL!, env.JUDGE0_API_KEY));
}

container.registerFactory(
  TOKENS.SubmissionService,
  () => new DefaultSubmissionService(
    container.resolve(TOKENS.TestCaseRepository),
    container.resolve(TOKENS.SubmissionRepository),
    container.resolve('Judge0Client'),
    new WhitespaceCaseInsensitiveStrategy(),
    container.resolve('Logger'),
    container.resolve(TOKENS.ProfileRepository)
  )
);

export {}; // módulo sem exports públicos (side-effects apenas)
