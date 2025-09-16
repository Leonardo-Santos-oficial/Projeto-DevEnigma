# PRD Detalhado e Prescritivo - Projeto DevEnigma v1.1

## 1. Visão Geral do Projeto

* **Nome do Projeto:** DevEnigma
* **Conceito:** Uma plataforma educacional gamificada onde desenvolvedores aprimoram suas habilidades de debugging, refatoração e resolução de problemas ao consertarem "enigmas de código". Em vez de criar algoritmos do zero, os usuários consertam, otimizam e entendem trechos de código existentes, simulando desafios reais de engenharia de software.
* **Público-Alvo Primário:** Desenvolvedores júnior a pleno que buscam aprimorar suas habilidades práticas de programação.
* **Público-Alvo Secundário:** Recrutadores técnicos e empresas que buscam uma forma inovadora de avaliar candidatos.
* **Objetivo Principal:** Criar uma peça de portfólio de alta complexidade que demonstre maestria em arquitetura full-stack, segurança, performance web e práticas de código de elite (Clean Code, SOLID), resultando em uma experiência de usuário engajadora, acessível e universalmente performática.

---

## 2. Mandamentos do Projeto: Requisitos Não-Funcionais Obrigatórios

Esta seção detalha os pilares de qualidade que **devem** ser seguidos em todas as fases do desenvolvimento.

### 2.1. Código como Arte: Aderência Estrita ao Clean Code, SOLID e Design Patterns

A qualidade interna do software é um requisito primário.

> **Princípios do Clean Code (Conforme Solicitado)**
> O Clean Code é uma abordagem para a escrita de código que enfatiza a clareza, a simplicidade e a eficiência. Seus princípios incluem:
> * **Nomes Significativos:** Utilizar nomes descritivos para variáveis, funções e classes, tornando o código autoexplicativo.
> * **Funções Pequenas:** Manter as funções curtas e focadas em uma única responsabilidade, facilitando a leitura e o teste.
> * **Evitar Repetição (DRY):** Seguir o princípio "Don't Repeat Yourself", evitando a duplicação de código.
> * **Comentários Úteis:** Usar comentários apenas quando necessário para explicar o que o código faz, mas não o óbvio.
> * **Código Limpo:** Manter o código organizado e otimizado sempre que for preciso modificá-lo.

> **Princípios SOLID (Conforme Solicitado)**
> SOLID é um acrônimo para cinco princípios de design que promovem a criação de sistemas mais flexíveis e fáceis de manter:
> * **S - Single Responsibility Principle (SRP):** Uma classe deve ter um único motivo para mudar.
> * **O - Open/Closed Principle (OCP):** O software (classes, módulos, funções) deve ser aberto para extensão, mas fechado para modificação.
> * **L - Liskov Substitution Principle (LSP):** Objetos de um supertipo devem ser substituíveis por objetos de um subtipo sem que o programa quebre.
> * **I - Interface Segregation Principle (ISP):** Os clientes (classes que utilizam uma interface) não devem ser forçados a depender de métodos que não utilizam.
> * **D - Dependency Inversion Principle (DIP):** Módulos de alto nível não devem depender de módulos de baixo nível. Ambos devem depender de abstrações.

* **Aplicação Prática e Design Patterns:**
    * **SRP:** O serviço `SubmissionService` no back-end terá a única responsabilidade de orquestrar a lógica de submissão de um desafio. Ele não saberá detalhes sobre a API do Judge0 nem sobre como salvar no banco; ele delegará essas tarefas a módulos específicos (`Judge0Client`, `SubmissionRepository`).
    * **DIP:** Os componentes React (`'use client'`) não importarão serviços do back-end diretamente. Eles consumirão dados e ações através de hooks customizados (`useChallengeData`) que abstraem a lógica de `fetch`.
    * **Padrão Strategy:** Será utilizado para definir diferentes estratégias de avaliação de código. Inicialmente, uma estratégia "ExactMatch" para comparar saídas, mas o sistema estará aberto (OCP) para novas estratégias, como "PerformanceTest" ou "CodeLinting".
    * **Padrão Repository:** Para cada modelo do Prisma (`User`, `Challenge`), criaremos um `Repository` que encapsula toda a lógica de acesso a dados, desacoplando o resto da aplicação do ORM.

### 2.2. Orçamento de Performance e Core Web Vitals (Tolerância Zero)

A aplicação **DEVE** atingir e manter pontuações verdes (>90) no Lighthouse.

| Métrica | Meta | Estratégia de Implementação |
| :--- | :--- | :--- |
| **First Contentful Paint (FCP)** | < 1.8s | Renderização no servidor (SSR/SSG) com Next.js para todas as páginas de conteúdo estático. Mínimo CSS bloqueador de renderização. |
| **Largest Contentful Paint (LCP)** | < 2.5s | Uso do componente `<Image>` do `next/image` com a prop `priority={true}` para o elemento principal de cada página. Fontes serão pré-carregadas. |
| **Total Blocking Time (TBT)** | < 200ms | **Uso agressivo de React Server Components (RSC)**. A interatividade será isolada em componentes cliente (`'use client'`) mínimos, como `CodeEditor` e `SubmissionButton`. Toda a UI estática será RSC. |
| **Cumulative Layout Shift (CLS)**| < 0.1 | Todas as imagens, iframes e embeds terão suas dimensões especificadas. Espaço para componentes dinâmicos será pré-alocado para evitar saltos de layout. |
| **Speed Index** | < 3.4s | Code splitting automático do Next.js. Otimização de todos os assets (imagens, fontes) e uso de uma CDN (implícito na Vercel). |

### 2.3. Acessibilidade e Usabilidade Universal (Padrão WCAG 2.1 AA)

A aplicação será utilizável por todos.

* **HTML Semântico:** Uso correto de tags como `<main>`, `<nav>`, `<aside>`, `<button>`.
* **Navegação por Teclado:** Toda funcionalidade interativa (botões, links, editor de código) será 100% acessível e operável via teclado.
* **Atributos ARIA:** Implementação de roles e atributos ARIA para componentes dinâmicos (ex: painéis de abas, modais de resultado) para prover contexto a leitores de tela.
* **Contraste e Legibilidade:** A paleta de cores e a tipografia seguirão as diretrizes de contraste mínimo de 4.5:1.
* **Labels e Foco:** Todos os inputs terão `<label>` associada. O gerenciamento de foco será implementado para guiar o usuário após ações.

---

## 3. Arquitetura e Tech Stack Detalhada

| Categoria | Tecnologia | Versão Mínima | Justificativa da Escolha |
| :--- | :--- | :--- | :--- |
| **Framework Full-Stack** | Next.js | 14+ (App Router) | Pela performance (RSC, SSG), DX e ecossistema robusto. |
| **Linguagem** | TypeScript | 5.0+ | Pela segurança de tipos e manutenibilidade em projetos complexos. |
| **Banco de Dados** | PostgreSQL | 15+ | Pela robustez, escalabilidade e compatibilidade com o ecossistema Vercel. |
| **ORM** | Prisma | 5.0+ | Pela segurança de tipos, autocompletar e facilidade na escrita de queries. |
| **Autenticação** | NextAuth.js | 5.0+ (Auth.js) | Pela simplicidade, segurança e integração com múltiplos provedores. |
| **Estilização** | Tailwind CSS | 3.0+ | Pela produtividade, consistência e otimização de CSS em produção. |
| **Componentes UI Base** | Shadcn/UI | Última | Pela acessibilidade, componentização e facilidade de customização. |
| **Editor de Código** | Monaco Editor | Última | Por ser o motor do VS Code, oferecendo uma experiência de edição rica. |
| **Execução de Código** | Judge0 API | v1.13.0+ | Por ser uma solução robusta e segura para execução de código em sandbox. |
| **Validação** | Zod | 3.0+ | Pela inferência de tipos e integração perfeita com TypeScript. |
| **Deployment** | Vercel | N/A | Pela integração nativa com Next.js, performance e CI/CD simplificado. |

---

## 4. Modelagem de Dados Detalhada (Prisma Schema)

```prisma
// ./prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Modelos de Autenticação (NextAuth.js)
// ... (User, Account, Session, etc.)

model Challenge {
  id              String       @id @default(cuid())
  title           String       @unique
  description     String
  starterCode     String       // Código inicial que o usuário verá
  difficulty      Difficulty   @default(EASY)
  language        String       // Linguagem do desafio (ex: 'javascript')
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  
  testCases       TestCase[]
  submissions     Submission[]
}

model TestCase {
  id              String     @id @default(cuid())
  input           String     // Input a ser fornecido ao código
  expectedOutput  String     // Saída esperada
  isHidden        Boolean    @default(true) // Se o usuário pode ver este caso de teste
  
  challengeId     String
  challenge       Challenge  @relation(fields: [challengeId], references: [id], onDelete: Cascade)
}

model Submission {
  id              String    @id @default(cuid())
  code            String    // O código que o usuário submeteu
  passed          Boolean   // Se passou em todos os testes
  executionTime   Float?    // Tempo de execução em ms
  memoryUsage     Int?      // Memória usada em KB
  createdAt       DateTime  @default(now())

  userId          String
  user            User      @relation(fields: [userId], references: [id])
  challengeId     String
  challenge       Challenge @relation(fields: [challengeId], references: [id])
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
}

5. User Stories Detalhadas com Critérios de Aceite (MVP)
US-01: Autenticação de Usuário

Como um visitante, eu quero me cadastrar e fazer login usando minha conta do GitHub, para que eu possa salvar meu progresso e participar do ranking.

Critérios de Aceite:

O botão "Login com GitHub" deve estar visível no header.

Após o login, o avatar e nome do usuário devem aparecer no header.

A sessão do usuário deve ser persistida.

US-02: Visualização de um Desafio

Como um usuário logado, eu quero selecionar um desafio da lista e ver uma página dedicada com a descrição, o editor de código e o painel de resultados, para que eu possa começar a resolvê-lo.

Critérios de Aceite:

A página deve ser renderizada no servidor para LCP e FCP rápidos.

O layout de 3 painéis deve ser responsivo (virando abas no mobile).

O componente Monaco Editor deve ser carregado de forma assíncrona para não bloquear o TBT.

A página deve ser 100% navegável via teclado.

US-03: Submissão de Código

Como um usuário logado, eu quero submeter meu código para avaliação, para que eu possa saber se minha solução está correta.

Critérios de Aceite:

O botão "Submeter" deve ficar desabilitado durante o processamento.

Um feedback visual de "loading" deve ser exibido.

O resultado (sucesso/falha/erro) deve ser exibido claramente no painel de resultados.

Em caso de falha, o resultado do primeiro teste que falhou (se não for oculto) deve ser mostrado.

A submissão deve ser salva no histórico do usuário.

6. Roadmap de Implementação
Sprint 0 (Setup): Configuração do projeto, Next.js, Prisma, Tailwind, NextAuth, e conexão com o banco de dados.

Sprint 1 (O Coração do Sistema): Implementação do serviço de comunicação com Judge0. Criação da página de desafio estática (hardcoded) para provar o fluxo de execução de código. Foco total na funcionalidade core.

Sprint 2 (Conteúdo Dinâmico): Implementação do schema do banco de dados, criação de um painel de admin simples para adicionar desafios, e fazer a página de desafio buscar os dados dinamicamente.

Sprint 3 (Fluxo de Usuário): Implementação da autenticação, perfis de usuário e a página de listagem de desafios.

Sprint 4 (Refinamento e Otimização): Auditoria completa de performance (Lighthouse), acessibilidade e usabilidade. Refatoração de código seguindo os mandamentos da Seção 2.