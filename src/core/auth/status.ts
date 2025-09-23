// Helper para verificar se GitHub OAuth está configurado corretamente.
// SRP: apenas lógica de checagem; facilita testes e evita espalhar condicionais.
export function isGitHubAuthConfigured() {
  let { GITHUB_ID, GITHUB_SECRET } = process.env as Record<string, string | undefined>;
  if (!GITHUB_ID || !GITHUB_SECRET) return false;
  const rawId = GITHUB_ID;
  const rawSecret = GITHUB_SECRET;
  GITHUB_ID = GITHUB_ID.trim();
  GITHUB_SECRET = GITHUB_SECRET.trim();
  if (rawId !== GITHUB_ID || rawSecret !== GITHUB_SECRET) {
    // eslint-disable-next-line no-console
    console.warn('[auth] Removendo espaços extras em GITHUB_ID/GITHUB_SECRET');
  }
  if (GITHUB_ID === 'your_github_client_id' || GITHUB_ID === 'missing') return false;
  if (GITHUB_SECRET === 'your_github_client_secret' || GITHUB_SECRET === 'missing') return false;
  if (GITHUB_ID.length < 10 || GITHUB_SECRET.length < 20) return false;
  return true;
}
