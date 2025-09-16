# DevEnigma

Plataforma educacional gamificada focada em aprimorar debugging, refatoração e compreensão de código existente.

## Visão
Em vez de criar algoritmos do zero, o usuário corrige e otimiza trechos com bugs, aproxima-se de cenários reais e evolui habilidades de engenharia.

## Stack Principal
- Next.js 14 (App Router, RSC) + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- NextAuth (GitHub OAuth)
- Vitest (testes) / ESLint / Prettier
- Commitlint + Husky (Commits Semânticos)

## Princípios de Arquitetura
- Clean Code: nomes descritivos, funções pequenas, evitar duplicação, comentários só quando agregam.
- SOLID: Repositórios, Strategy de avaliação, DI container simples.
- Performance: foco em RSC para reduzir TBT, otimização futura (Lighthouse > 90).
- Acessibilidade: layout semântico, navegação por teclado, contraste adequado (em progresso).

## Arquitetura / Estrutura (parcial)
```
src/
  app/                # Rotas (RSC)
  core/di             # Container de dependências
  core/auth           # Config auth
  modules/
    challenges/
      domain/                 # Entidades (Challenge, TestCase) + contratos
      infrastructure/         # Repositórios (InMemory, Prisma)
    submissions/
      domain/                 # Submission, Status, Service, Judge0 abstractions
      infrastructure/         # MockJudge0, Repositórios
  ui/ (futuro)                # Componentes de interface
core/
  bootstrap/                  # Composition root (registra dependências)
  config/                     # Validação de ENV (Zod)
  di/                         # Container simples (Service Locator controlado)
prisma/
```

## Scripts
| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor Next.js |
| `npm run build` | Build de produção |
| `npm run start` | Inicia build compilado |
| `npm run lint` | Lint de código |
| `npm run format` | Prettier write |
| `npm test` | Testes Vitest |

## Configuração Local
1. `cp .env.example .env` e ajuste variáveis.
2. `docker compose up -d` para subir Postgres.
3. `npm install`
4. `npx prisma generate`
5. (Após criar migration) `npx prisma migrate dev`
6. `npm run dev`

## Próximos Passos Planejados
- Execução real via Judge0 HTTP (substituir mock)
- UI Shadcn + Monaco Editor lazy
- Estratégias adicionais (linting, performance)
- Ranking / Perfil de usuário
- Observabilidade (logs estruturados / métricas básicas)

## Segurança & Qualidade
- Dependências auditadas e atualizadas (overrides de vulnerabilidades críticas)
- ESLint + import order + unused imports enforced
- Tipagem strict (TS) preservada
- Commits semânticos (Conventional Commits) validados por Husky + Commitlint

## Fluxo de Submissão (Atual)
1. Usuário escreve código no editor (client component futuro).
2. POST `/api/submissions` (a ser implementado) envia: `code`, `challengeId`, `language`.
3. `DefaultSubmissionService` resolve via DI:
  - `TestCaseRepository` (busca casos do desafio)
  - `SubmissionRepository` (persiste submissão PENDING)
  - `Judge0Client` (atualmente `MockJudge0Client` simula execução)
4. Serviço avalia resultado, atualiza status para `PASSED` ou `FAILED` e retorna visão simplificada.
5. Futuro: execução assíncrona + polling / websockets.

## Judge0 Abstração
- Interface `Judge0Client` isola detalhes HTTP.
- Implementação atual: mock determinístico (simula outputs).
- Próximo: `Judge0HttpClient` usando variáveis `JUDGE0_URL`, `JUDGE0_API_KEY`.

## Design Patterns Empregados
- Repository (Challenge, TestCase, Submission)
- Strategy (avaliation futura / pluggable evaluation)
- Dependency Injection (container simples + tokens centralizados)
- Factory (criação controlada via métodos estáticos `create`)

## Commits Semânticos
Formato: `tipo(escopo): descrição breve`
Tipos principais: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `perf`, `build`.
Exemplos:
```
feat(submissions): add judge0 http client
fix(challenges): ensure description validation covers edge case
```

## Execução Local Rápida
```
cp .env.example .env
docker compose up -d
npm install
npx prisma generate
npm run dev:mem   # modo in-memory sem DB (flag USE_IN_MEMORY=true)
```

## Variáveis de Ambiente (Parcial)
| Nome | Descrição |
|------|-----------|
| DATABASE_URL | URL Postgres (omitido se in-memory) |
| USE_IN_MEMORY | Força repositórios em memória para dev rápido |
| GITHUB_ID / GITHUB_SECRET | OAuth GitHub |
| NEXTAUTH_SECRET | Assinatura NextAuth |
| JUDGE0_URL | (futuro) endpoint Judge0 |
| JUDGE0_API_KEY | (futuro) chave Judge0 |

## Observabilidade (Planejado)
- Logger estruturado (JSON) com níveis: info, warn, error.
- Métricas básicas: latência de avaliação, taxa de sucesso.

## Roadmap Curto Prazo
- [ ] Endpoint `/api/submissions`
- [ ] UI de submissão (botão + feedback)
- [ ] Judge0 HTTP real
- [ ] Strategy tolerant whitespace
- [ ] Logs estruturados

## Contribuição
Projeto de portfólio: foco em demonstrar arquitetura limpa. Sugestões via issue/PR são bem-vindas.

## Licença
MIT (ajustar se necessário)
