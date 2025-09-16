import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Evita duplicar seed se já existir
  const existing = await prisma.challenge.findFirst({ where: { title: 'Hello World Fix' } });
  if (!existing) {
    await prisma.challenge.create({
      data: {
        title: 'Hello World Fix',
        description: 'Corrija o código para imprimir Hello World corretamente.',
        starterCode: 'function main() {\n  // TODO: corrigir\n  consol.log("Hello Wrold")\n}\n',
        difficulty: 'EASY',
        language: 'javascript'
      }
    });
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
