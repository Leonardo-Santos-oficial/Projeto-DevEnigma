import { PrismaClient } from '@prisma/client';

// Extensão Accelerate opcional; evitar que o bundler do Next tente resolvê-la quando não instalada.
// Usamos eval('require') para impedir análise estática do webpack.
let prismaSingleton: PrismaClient | (PrismaClient & Record<string, unknown>) | null = null;

function loadAccelerate() {
  try {
    // Só tenta carregar se de fato a URL indicar uso do Data Proxy
    const url = process.env.DATABASE_URL || '';
    if (!(url.startsWith('prisma://') || url.startsWith('prisma+postgres://'))) return null;
    // eslint-disable-next-line no-new-func
    const req: NodeRequire = (Function('return require'))(); // eval para evitar bundle
    const mod = req('@prisma/extension-accelerate');
    return mod?.withAccelerate || null;
  } catch {
    return null;
  }
}

function createClient() {
  const base = new PrismaClient();
  const withAccelerate = loadAccelerate();
  if (withAccelerate) {
    try {
      return base.$extends(withAccelerate()) as typeof base;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[prisma] Falha ao aplicar withAccelerate, usando client padrão', e);
      return base;
    }
  }
  return base;
}

export function getPrisma() {
  if (!prismaSingleton) {
    prismaSingleton = createClient();
  }
  return prismaSingleton;
}

export const prisma = getPrisma();
