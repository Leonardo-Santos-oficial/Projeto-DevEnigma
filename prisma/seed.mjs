// Seed script em JS (ESM) para evitar problemas de execução ts-node --esm no Windows
import { PrismaClient } from '@prisma/client';
let prisma;
const url = process.env.DATABASE_URL || '';
if (url.startsWith('prisma://') || url.startsWith('prisma+postgres://')) {
  try {
    const { withAccelerate } = await import('@prisma/extension-accelerate');
    prisma = new PrismaClient().$extends(withAccelerate());
  } catch (e) {
    console.warn('[seed] Falha ao carregar accelerate, fallback sem extensão');
    prisma = new PrismaClient();
  }
} else {
  prisma = new PrismaClient();
}

// Lista de desafios (debug/refactor oriented). Cada item possui testCases com visibilidade.
const challengesToSeed = [
  {
    title: 'Hello World Fix',
    description: 'Corrija o código para imprimir exatamente Hello World (sem typos).',
    starterCode: 'function main() {\n  // Existe um erro de digitação e a função correta do console não está sendo usada.\n  consol.log("Hello Wrold")\n}\n',
    difficulty: 'EASY',
    language: 'javascript',
    tags: ['intro', 'strings'],
    testCases: [
      { input: 'ignored', expectedOutput: 'Hello World', isHidden: false },
      { input: 'qualquer', expectedOutput: 'Hello World', isHidden: true }
    ]
  },
  {
    title: 'Sum Range Off By One',
    description: 'A função deve somar todos os inteiros de start até end inclusive. Existe um bug de off-by-one.',
    starterCode: 'export function sumRange(start, end) {\n  let total = 0;\n  for (let i = start; i < end; i++) { // BUG: não inclui end\n    total += i;\n  }\n  return total;\n}\n',
    difficulty: 'EASY',
    language: 'javascript',
    tags: ['loops', 'math', 'bugfix'],
    testCases: [
      { input: '1 3', expectedOutput: '6', isHidden: false }, // 1+2+3
      { input: '5 5', expectedOutput: '5', isHidden: false },
      { input: '10 12', expectedOutput: '33', isHidden: true }
    ]
  },
  {
    title: 'Palindrome Check Normalizer',
    description: 'Verifique se uma string é palíndromo ignorando espaços, pontuação e caixa. Há erros de normalização.',
    starterCode: 'export function isPalindrome(str) {\n  // Falha: não remove pontuação e usa comparação sensível a caixa\n  const cleaned = str.replace(/\s+/g, "");\n  const reversed = cleaned.split("").reverse().join("");\n  return cleaned === reversed;\n}\n',
    difficulty: 'MEDIUM',
    language: 'javascript',
    tags: ['strings', 'regex', 'refactor'],
    testCases: [
      { input: 'Ame a ema', expectedOutput: 'true', isHidden: false },
      { input: 'Roma me tem amor', expectedOutput: 'true', isHidden: true },
      { input: 'Hello World', expectedOutput: 'false', isHidden: false }
    ]
  },
  {
    title: 'Factorial Edge Cases',
    description: 'Calcule fatorial de n (0 <= n <= 10). Corrija erro em 0! e validação de limites.',
    starterCode: 'export function factorial(n){\n  if(n === 0) return 0; // BUG: 0! deve ser 1\n  if(n < 0) throw new Error("negativo");\n  let r = 1;\n  for(let i=1;i<n;i++){ // BUG: não multiplica por n\n    r *= i;\n  }\n  return r;\n}\n',
    difficulty: 'EASY',
    language: 'javascript',
    tags: ['math', 'edge-cases'],
    testCases: [
      { input: '0', expectedOutput: '1', isHidden: false },
      { input: '1', expectedOutput: '1', isHidden: false },
      { input: '5', expectedOutput: '120', isHidden: true }
    ]
  },
  {
    title: 'Unique Array Elements',
    description: 'Retorne um array sem elementos duplicados preservando ordem. Código atual altera o array original e falha.',
    starterCode: 'export function unique(arr){\n  // BUGS: muta arr, lógica de inclusão incorreta\n  for(let i=0;i<arr.length;i++){\n    for(let j=i+1;j<arr.length;j++){\n      if(arr[i]===arr[j]){\n        arr.splice(j,1); // mutação perigosa\n      }\n    }\n  }\n  return arr.sort(); // altera ordem original\n}\n',
    difficulty: 'MEDIUM',
    language: 'javascript',
    tags: ['arrays', 'refactor', 'performance'],
    testCases: [
      { input: '1,2,2,3', expectedOutput: '1,2,3', isHidden: false },
      { input: 'a,a,a', expectedOutput: 'a', isHidden: false },
      { input: '3,3,2,1,2', expectedOutput: '3,2,1', isHidden: true }
    ]
  },
  {
    title: 'FizzBuzz Broken Logic',
    description: 'Corrija a função para imprimir FizzBuzz corretamente até n. Atualmente a ordem das condições está errada.',
    starterCode: 'export function fizzbuzz(n){\n  let out = [];\n  for(let i=1;i<=n;i++){\n    if(i%3===0) out.push("Fizz"); // BUG: deveria verificar 15 primeiro\n    else if(i%5===0) out.push("Buzz");\n    else if(i%15===0) out.push("FizzBuzz");\n    else out.push(String(i));\n  }\n  return out.join(",");\n}\n',
    difficulty: 'EASY',
    language: 'javascript',
    tags: ['control-flow', 'bugfix'],
    testCases: [
      { input: '5', expectedOutput: '1,2,Fizz,4,Buzz', isHidden: false },
      { input: '15', expectedOutput: '1,2,Fizz,4,Buzz,Fizz,7,8,Fizz,Buzz,11,Fizz,13,14,FizzBuzz', isHidden: true }
    ]
  },
  {
    title: 'Normalize Whitespace',
    description: 'Remova espaços duplicados e aparar início/fim. Código atual não cobre todos os casos.',
    starterCode: 'export function normalize(str){\n  // BUG: replace apenas primeira ocorrência\n  return str.trim().replace(/\s+/," ");\n}\n',
    difficulty: 'EASY',
    language: 'javascript',
    tags: ['strings', 'regex'],
    testCases: [
      { input: '  oi   mundo  ', expectedOutput: 'oi mundo', isHidden: false },
      { input: 'a   b    c', expectedOutput: 'a b c', isHidden: true }
    ]
  },
  {
    title: 'Anagram Detector',
    description: 'Verifique se duas palavras são anagramas ignorando caixa e espaços. Código atual usa comparação direta.',
    starterCode: 'export function areAnagrams(a,b){\n  return a === b; // BUG: precisa normalizar, ordenar e comparar\n}\n',
    difficulty: 'MEDIUM',
    language: 'javascript',
    tags: ['strings', 'sorting'],
    testCases: [
      { input: 'listen silent', expectedOutput: 'true', isHidden: false },
      { input: 'Banana ananab', expectedOutput: 'true', isHidden: true },
      { input: 'abc abd', expectedOutput: 'false', isHidden: false }
    ]
  },
  {
    title: 'Roman Numeral Parser',
    description: 'Converta algarismos romanos (I,V,X,L,C) em número decimal. Código atual soma sem tratar subtrações.',
    starterCode: 'export function romanToInt(s){\n  const map = {I:1,V:5,X:10,L:50,C:100};\n  let total = 0;\n  for(let i=0;i<s.length;i++){\n    total += map[s[i]]; // BUG: não trata casos como IV (4) ou IX (9)\n  }\n  return total;\n}\n',
    difficulty: 'HARD',
    language: 'javascript',
    tags: ['parsing', 'conditions'],
    testCases: [
      { input: 'III', expectedOutput: '3', isHidden: false },
      { input: 'IV', expectedOutput: '4', isHidden: true },
      { input: 'XII', expectedOutput: '12', isHidden: false },
      { input: 'XIX', expectedOutput: '19', isHidden: true }
    ]
  }
];

async function main() {
  let created = 0;
  for (const ch of challengesToSeed) {
    const exists = await prisma.challenge.findFirst({ where: { title: ch.title } });
    if (exists) {
      console.log(`[seed] Challenge '${ch.title}' já existe, pulando.`);
      continue;
    }
    const { testCases, ...challengeData } = ch;
    const challenge = await prisma.challenge.create({ data: challengeData });
    await prisma.testCase.createMany({
      data: testCases.map(tc => ({ ...tc, challengeId: challenge.id }))
    });
    created++;
    console.log(`[seed] Challenge '${ch.title}' criado com ${testCases.length} casos.`);
  }
  console.log(`[seed] Finalizado. Novos desafios criados: ${created}.`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
