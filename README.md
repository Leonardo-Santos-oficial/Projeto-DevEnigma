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

## Princípios de Arquitetura
- Clean Code: nomes descritivos, funções pequenas, evitar duplicação, comentários só quando agregam.
- SOLID: Repositórios, Strategy de avaliação, DI container simples.
- Performance: foco em RSC para reduzir TBT, otimização futura (Lighthouse > 90).
- Acessibilidade: layout semântico, navegação por teclado, contraste adequado (em progresso).

## Estrutura (parcial)
```
src/
  app/                # Rotas (RSC)
  core/di             # Container de dependências
  core/auth           # Config auth
  modules/
    challenges/
      domain/         # Entidades + contratos
      infrastructure/ # Implementações (InMemory etc.)
    submissions/
      domain/         # Strategy + serviço
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
- Integração real com PostgreSQL (migrations + repos Prisma)
- Judge0 Client + fila de avaliação
- UI Shadcn + Monaco Editor lazy
- Estratégias adicionais (linting, performance)
- Ranking / Perfil de usuário

## Segurança & Qualidade
- Dependências auditadas e atualizadas (overrides de vulnerabilidades críticas)
- ESLint + import order + unused imports enforced
- Tipagem strict (TS) preservada

## Contribuição
Projeto de portfólio: foco em demonstrar arquitetura limpa. Sugestões via issue/PR são bem-vindas.

## Licença
MIT (ajustar se necessário)
