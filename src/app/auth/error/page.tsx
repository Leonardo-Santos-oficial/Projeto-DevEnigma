import Link from 'next/link';
import React from 'react';

// Página de erro custom para exibir código de erro do NextAuth e dicas rápidas.
// Acessada automaticamente se definirmos pages.error em authOptions ou manualmente via /auth/error?error=XYZ
export default function AuthErrorPage({ searchParams }: { searchParams?: Record<string, string | string[]> }) {
  const raw = searchParams?.error;
  const error = Array.isArray(raw) ? raw[0] : raw;

  const hints: Record<string, string> = {
    OAuthSignin: 'Falha iniciando OAuth. Verifique GITHUB_ID/GITHUB_SECRET e callback autorizado no GitHub App.',
    OAuthCallback: 'Callback falhou. Geralmente DATABASE_URL indisponível, estado inválido ou secret inconsistente.',
    OAuthCreateAccount: 'Falha ao criar conta no adapter. Verifique migrations e permissões do banco.',
    EmailCreateAccount: 'Erro criando usuário via email.',
    CallbackRouteError: 'Erro em callback custom (session/signIn). Veja logs do servidor.',
    Configuration: 'Configuração inválida. Cheque NEXTAUTH_URL, NEXTAUTH_SECRET e provider.',
    AccessDenied: 'Acesso negado pela policy (signIn callback retornou false).',
    Verification: 'Token de verificação inválido ou expirado.',
    Default: 'Erro genérico. Veja logs do servidor para detalhes.'
  };

  const message = (error && hints[error]) || hints.Default;

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-md space-y-4">
        <h1 className="text-2xl font-semibold text-center">Erro de Autenticação</h1>
        <div className="text-sm text-gray-600 space-y-2">
          <p><span className="font-medium">Código:</span> <code className="px-2 py-0.5 bg-gray-50 rounded border">{error ?? 'N/A'}</code></p>
          <p>{message}</p>
        </div>
        <div className="text-xs text-gray-500 border-t pt-4 space-y-1">
          <p>Verifique o terminal do servidor para logs começando com <code>[auth:</code>.</p>
          <p>Se alterou NEXTAUTH_SECRET, limpe cookies de localhost e tente novamente.</p>
        </div>
        <div className="pt-2 flex gap-2 justify-center text-sm">
          <Link className="text-blue-600 hover:underline" href="/api/auth/signin">Tentar novamente</Link>
          <Link className="text-gray-600 hover:underline" href="/">Home</Link>
        </div>
      </div>
    </main>
  );
}
