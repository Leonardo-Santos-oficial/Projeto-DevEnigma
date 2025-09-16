import { loadEnv } from './env';

try {
  loadEnv(true);
  // eslint-disable-next-line no-console
  console.log('✅ Variáveis de ambiente validadas com sucesso.');
} catch (err) {
  // eslint-disable-next-line no-console
  console.error('❌ Falha na validação de ambiente:\n', (err as Error).message);
  process.exit(1);
}
