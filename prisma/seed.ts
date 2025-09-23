/* Seed inicial: cria challenge + test cases se não existirem */
/* eslint-disable no-console -- Console output aqui é intencional para feedback rápido de seed */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.challenge.findFirst({ where: { title: 'Hello World Fix' } });
  if (!existing) {
    const challenge = await prisma.challenge.create({
      data: {
        title: 'Hello World Fix',
        description: 'Corrija o código para imprimir Hello World corretamente.',
        starterCode: 'function main() {\n  // TODO: corrigir\n  consol.log("Hello Wrold")\n}\n',
        difficulty: 'EASY',
        language: 'javascript'
      }
    });
    await prisma.testCase.createMany({
      data: [
        { input: 'ignored', expectedOutput: 'Hello World', isHidden: false, challengeId: challenge.id },
        { input: 'any', expectedOutput: 'Hello World', isHidden: true, challengeId: challenge.id }
      ]
    });
    console.log('[seed] Challenge + test cases criados');
  } else {
    console.log('[seed] Challenge já existe, ignorando');
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
