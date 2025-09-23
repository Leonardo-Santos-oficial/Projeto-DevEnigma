// Rota temporária de debug para verificar se variáveis de auth estão carregadas.
// IMPORTANTE: Remover depois de corrigir o problema de login.
import { NextResponse } from 'next/server';

export async function GET() {
  const keys = ['GITHUB_ID', 'GITHUB_SECRET', 'NEXTAUTH_URL', 'NEXTAUTH_SECRET'];
  const result = Object.fromEntries(
    keys.map(k => [k, process.env[k] ? (k === 'GITHUB_SECRET' || k === 'NEXTAUTH_SECRET' ? 'SET' : process.env[k]) : 'MISSING'])
  );
  return NextResponse.json({ env: result });
}
