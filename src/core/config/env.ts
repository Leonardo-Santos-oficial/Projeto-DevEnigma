import { z } from 'zod';
import type { ZodIssue } from 'zod';

// Schema de validação das variáveis de ambiente necessárias para runtime.
// Clean Code: nomes explícitos e responsabilidade única.
// OCP: adicionar novas vars sem modificar consumidor (exporta objeto resultante).

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().url('DATABASE_URL deve ser uma URL válida').optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(16, 'NEXTAUTH_SECRET deve ter >=16 chars').optional(),
  GITHUB_ID: z.string().optional(),
  GITHUB_SECRET: z.string().optional(),
  USE_IN_MEMORY: z.string().optional(),
  USE_JUDGE0_MOCK: z.string().optional(),
  JUDGE0_API_URL: z.string().optional(),
  JUDGE0_API_KEY: z.string().optional()
});

export type AppEnv = z.infer<typeof envSchema>;

let cached: AppEnv | null = null;

export function loadEnv(strict = false): AppEnv {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    if (strict) {
    const issues = parsed.error.issues.map((i: ZodIssue) => `${i.path.join('.')}: ${i.message}`).join('\n');
      throw new Error(`Falha na validação de variáveis de ambiente:\n${issues}`);
    } else {
      // Loga avisos mas não interrompe em modo non-strict
      // eslint-disable-next-line no-console
    console.warn('[env] Avisos de validação:', parsed.error.issues.map((i: ZodIssue) => i.path.join('.')).join(', '));
    }
  }
  cached = (parsed.success ? parsed.data : (process.env as unknown)) as AppEnv;
  return cached;
}
