export default function HomePage() {
  return (
    <main className="p-6 space-y-4">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">DevEnigma</h1>
        <p className="text-sm opacity-80 max-w-prose">
          Plataforma gamificada para aprimorar debugging, refatoração e leitura de código real.
        </p>
      </header>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Status</h2>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>Infra inicial (Next.js / Tailwind / Prisma / Auth) configurada.</li>
          <li>Domínio de Challenges e Submissions modelado (InMemory PoC).</li>
          <li>Próximos: Banco Postgres, Execução Judge0, UI acessível.</li>
        </ul>
      </section>
      <nav aria-label="Acesso rápido" className="space-x-4 text-sm">
        <a className="underline" href="/challenges/hello-world">Ver PoC de Challenge</a>
        <a className="underline" href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
      </nav>
    </main>
  );
}
