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

## Fluxo de Submissão (Atualizado)
1. Usuário escreve código no `SubmissionPanel` (textarea – preparado para Monaco).
2. POST `/api/submissions` envia: `code`, `challengeId`, `language`.
3. `DefaultSubmissionService` (SRP: orquestra fluxo) via DI resolve dependências:
   - `TestCaseRepository` (carrega casos – futuramente filtrando hidden do output público)
   - `SubmissionRepository` (persiste submissão inicial com status PENDING)
   - `Judge0Client` (`MockJudge0Client` ou `Judge0HttpClient` real)
   - `EvaluationStrategy` (`WhitespaceCaseInsensitiveStrategy` tolera diferenças de espaço / case)
   - `Logger` (eventos estruturados)
4. Execução: Judge0 (mock ou HTTP) roda cada test case e retorna outputs.
5. Strategy (se presente) reavalia tolerância e define `passed` final.
6. Status é atualizado para `PASSED` ou `FAILED` + métricas runtime (tempo/memória quando disponível).
7. Resposta simplificada retorna casos (apenas públicos), status e indicador `passed`.
8. Futuro: fila assíncrona (job queue) retornando imediatamente `PENDING` + canal de atualização (SSE/WebSocket).

### Contrato Simplificado
Input: `{ code, challengeId, language }`
Output: `{ submissionId, status, passed, cases: [{ input, expected, actual, passed }] }`

### Possíveis Evoluções
- Casos ocultos (não retornados no array, apenas contam para o `passed`).
- Penalidades de performance ou memória influenciando score.
- Execução paralela (Promise.all) no Judge0 real com limitação de taxa.

## Integração Judge0
Camada de execução isolada por `Judge0Client` para cumprir DIP.

Implementações:
- `MockJudge0Client`: determinística, rápida, sem dependências externas (ideal para dev/testes locais e CI).
- `Judge0HttpClient`: usa API pública/privada Judge0.

Seleção em runtime:
```
USE_JUDGE0_MOCK=true  => força mock
JUDGE0_API_URL ausente => fallback automático para mock
```

### Estratégia de Execução Atual
- Execução sequencial de test cases (mais simples para logging e isolação de falhas).
- Coleta tempo máximo e memória máxima (baseline). Futuro: métricas agregadas por caso.

### Resiliência (Futuro)
- Retentativas com backoff exponencial em casos de erro transitório 5xx.
- Circuit breaker simples baseado em janela de falhas.

## Logging Estruturado
Interface `Logger` abstrai emissões (`info`, `error`, `debug`). Implementação atual: `ConsoleJsonLogger` (saída JSON flat, fácil ingestão em ferramentas futuras).

Eventos principais:
| Evento | Contexto |
|--------|----------|
| `submission.start` | challengeId, language |
| `submission.finish` | submissionId, status, durationMs, passed, cases |
| `bootstrap.fallbackInMemory` | reason (quando força modo in-memory) |

Benefícios:
- Observabilidade sem dependência de vendor.
- Correlação futura via inclusão de requestId / userId.

Backlog Logging:
- Nível `debug` configurável por ENV.
- Export para provider (OTEL / Logtail / Loki) via adapter.

## UI Submission Panel
Componentes:
- `useSubmission` (hook): gerencia estado (code, loading, result, error).
- `SubmissionPanel`: layout imersivo (área de código + resultados) minimalista, preparado para plugar editor Monaco.

Próximos upgrades UI:
- Substituir textarea por Monaco Editor (lazy dynamic import).
- Destaque de linhas com erro (quando output divergir e tivermos diffs).
- Acessibilidade: aria-live para status e foco gerenciado pós-submissão.

## Convenções de Imports
Regra ESLint `import/order` configurada com:
```
groups: [builtin, external, internal, parent, sibling, index]
internal-regex: ^(@core|@modules)/
newlines-between: always
alphabetize: asc
```
Padrões:
- Todos os imports de tipos: `import type { X } from '...'`.
- Separação clara entre grupos com 1 linha em branco.
- Sem linhas em branco dentro do mesmo grupo.

## Fallback In-Memory
Para acelerar DX e evitar crashes quando `DATABASE_URL` não está definido:
- Em build de produção sem DATABASE_URL: força `USE_IN_MEMORY=true`.
- Em dev (`NODE_ENV !== production`) sem DATABASE_URL: aplica fallback e loga `bootstrap.fallbackInMemory`.
- Permite rodar `npm run dev` instantaneamente sem provisionar Postgres.

## Princípios Clean Code Aplicados
- Nomes descritivos (`DefaultSubmissionService`, `WhitespaceCaseInsensitiveStrategy`).
- Funções curtas focadas: métodos de repositório e serviço mantêm uma responsabilidade.
- DRY: lógica de criação centralizada em métodos `create` das entidades.
- Comentários mínimos: apenas quando esclarecem decisões (ex: nota sobre futura execução assíncrona).
- Código expressivo > comentários redundantes.

## Princípios SOLID na Prática
| Princípio | Aplicação |
|-----------|-----------|
| SRP | Cada repositório só persiste/recupera seu agregado; serviço de submissão apenas orquestra fluxo. |
| OCP | Novas estratégias de avaliação ou storage (ex: RedisSubmissionRepository) adicionadas sem alterar clientes existentes. |
| LSP | Implementações de `Judge0Client` e repositórios podem substituir-se sem quebrar código consumidor. |
| ISP | Interfaces enxutas (`TestCaseRepository`, `SubmissionRepository`, `Judge0Client`) não forçam métodos extras. |
| DIP | Serviços dependem de abstrações registradas no container, não de implementações concretas. |

## Próximas Extensões (Sugestões)
- Monaco Editor + diff interativo.
- Test cases ocultos (flag `isHidden` suprimindo retorno no payload).
- Fila assíncrona (BullMQ / Cloud Tasks) para execução fora do request.
- Métricas de performance (p95 tempo de execução por desafio).
- Scoring e ranking (ponderando velocidade / tentativas).
- Estratégias adicionais (normalização por regex, análise semântica futura).

## Guia Rápido de Contribuição Clean Code
1. Antes de adicionar comentário, tente renomear algo para ficar autoexplicativo.
2. Prefira compor funções pequenas ao invés de adicionar flags booleanas internas.
3. Evite `any`; se inevitável, isole e documente com TODO para remoção.
4. Não duplique schema/entidade – reutilize factories.
5. Escreva teste cobrindo caso feliz + 1 edge case mínimo.
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
