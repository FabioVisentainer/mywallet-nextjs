# Personalização, reuso e arquitetura — MyWallet

Documento da atividade: (1) inventário das interfaces de alta variação do protótipo, (2) a função exclusiva de um cliente específico e como ela fica isolada das demais, e (3) a pesquisa da arquitetura de desenvolvimento mais adequada ao projeto para alta personalização com foco em reuso.

Ver também [`2 - DESIGN_PATTERNS.md`](2%20-%20DESIGN_PATTERNS.md): os hooks de gating descritos aqui (item 4.4) passaram a ser implementados com o padrão **Strategy**, e dois outros pontos de variação do produto — fora do eixo role/plan/accountType — foram formalizados com o mesmo padrão.

## 1. Três eixos de personalização, não um só

A atividade permite variar por função em tela, por usuário com acesso específico, ou por módulo exclusivo de cliente. O MyWallet usa os três ao mesmo tempo, como camadas **independentes e compostas** — cada uma resolvida por um hook central, nunca por `if`s espalhados pelas telas:

| Eixo | Pergunta que responde | Onde mora o dado | Hook central |
|---|---|---|---|
| **role** — `investor` \| `analyst` \| `admin` | O que essa pessoa pode *fazer*? | `User.role` (banco) | [`navFor(role, accountType)`](../src/modules/core/nav.ts) |
| **plan** — `Standard` \| `Platinum` \| `Black` | O que a assinatura paga *libera*? | estado de sessão (simulável em `/plans`) | [`usePlanGating()`](../src/modules/plans/gating.ts) |
| **accountType** — `Individual` \| `Institutional` | Esse cliente tem acesso a este *módulo inteiro*? | `User.accountType` (banco) | [`useInstitutionalAccess()`](../src/modules/institutional/access.ts) |

`role` e `plan` já existiam no projeto. `accountType` foi adicionado para atender literalmente o requisito "nem todos os clientes terão a mesma opção": é o único eixo dos três que não depende de quem a pessoa é (role) nem de quanto ela paga (plan) — depende só de qual *segmento de cliente* ela é, exatamente como uma feature enterprise-only num SaaS B2B.

> **Atualização:** o eixo `plan` deixou de ser um `if (plan === "Standard")` central e passou a ser **Strategy** — uma classe `PlanPolicy` por plano (`StandardPlanPolicy`, `PlatinumPlanPolicy`, `BlackPlanPolicy`) atrás da mesma interface, resolvida dentro do próprio `usePlanGating()`. A assinatura pública do hook não mudou, então nenhuma tela precisou ser tocada. Detalhe em [`2 - DESIGN_PATTERNS.md`](2%20-%20DESIGN_PATTERNS.md#3-strategy-3-exemplos--3-domínios-diferentes). O eixo `accountType` (`useInstitutionalAccess()`) continua sendo um booleano simples — só duas variações (institucional ou não) não justificam uma classe por variação; se um terceiro segmento aparecer, aí sim vale revisitar como Strategy.

## 2. As 15 interfaces de alta variação

| # | Tela | Rota | Eixo de variação demonstrado |
|---|---|---|---|
| 1 | Login | `/` | pública; redireciona por `role` após autenticar |
| 2 | Cadastro | `/signup` | pública; onboarding de novo cliente |
| 3 | Teste de perfil de investidor | `/quiz` | fluxo multi-etapas, sem exigir login |
| 4 | Resultado do teste | `/quiz/result` | recomendação personalizada por perfil de risco |
| 5 | Dashboard | `/dashboard` | role investor; agrega 3 módulos (wallets+goals+performance) |
| 6 | Carteiras (plano Standard) | `/wallets` | **bloqueio por plano** — banner de limite de 2 carteiras |
| 7 | Detalhe de carteira (Platinum/Black) | `/wallets/[id]` | mesma tela, sem limite — dado real muda o resultado exibido |
| 8 | Metas financeiras | `/goals` | **bloqueio por plano** — tela inteira vira paywall (`LockedFeature`) no Standard |
| 9 | Extrato de transações | `/transactions` | bloqueio por plano, mas em padrão de tabela (não paywall centralizado) |
| 10 | Portal de notícias | `/news` | pública, sem sessão — recurso "para todos" |
| 11 | Estúdio do analista | `/analyst` | **exclusivo role analyst** — editor de conteúdo (CRUD), não dashboard |
| 12 | Administração de usuários | `/admin` + `/admin/[id]` | **exclusivo role admin** — tabela de gestão + permissões granulares |
| 13 | Comparativo de planos | `/plans` | upsell/pricing; gatilho de todo o eixo `plan` |
| 14 | **Mesa institucional — equipe** (novo) | `/institutional` | **exclusivo `accountType=Institutional`** — gestão de operadores, padrão inédito no app |
| 15 | **Mesa institucional — relatório consolidado** (novo) | `/institutional/reports` | **exclusivo `accountType=Institutional`** — agrega dados de outro módulo (`wallets`), export de fachada |

Isso é mais que as 10-13 pedidas de propósito, para cobrir com folga os três eixos e ainda ter variação de *padrão* de interface (formulário, paywall, tabela, editor, wizard, agregação/relatório) — não só cor ou texto.

## 3. A função exclusiva de um cliente específico — mesa institucional

**Cliente:** apenas a conta seed `carla.mendes@mywallet.io` tem `accountType="Institutional"`. Para qualquer outra conta — mesmo um investidor Black pagando o plano mais caro — o módulo **não existe**: o item "Institutional desk" nem aparece no menu (`nav.ts` só o injeta quando `accountType === "Institutional"`), e navegar direto pela URL mostra uma tela de bloqueio (`Alert`), nunca um crash ou 404 cru.

**A função:** duas telas que não fazem sentido para um cliente pessoa física —
- gestão de **operadores com acesso delegado** à conta (equipe: Trader/Compliance/Viewer), algo que só existe quando a "conta" representa uma organização, não uma pessoa;
- **relatório consolidado multi-carteira** com exportação PDF/CSV, no padrão de relatório de compliance, não de dashboard pessoal.

**Como fica isolada arquiteturalmente (não só escondida na UI):**
- Vive inteira em `src/modules/institutional/` — módulo próprio com seu Context (`TeamContext`), tipos e componentes, seguindo a mesma regra que todo módulo de feature do projeto já segue (documentada em `PROJECT_STRUCTURE.md`): **só pode depender de `core`**, nunca de outro módulo de feature diretamente. A única exceção é o relatório lendo `useWallets()` — o mesmo tipo de exceção pontual e documentada que `analyst/` já faz hoje ao reaproveitar `NewsContext`.
- Tem tabela própria no banco (`TeamMember`) e rotas de API próprias (`/api/team`, `/api/team/[id]`) — nenhuma outra tela ou módulo lê ou escreve nela.
- O controle de acesso é um hook só (`useInstitutionalAccess`), não uma checagem duplicada em cada tela — se amanhã o critério mudar (por exemplo, virar um plano `Enterprise` em vez de um segmento), muda-se num lugar só.
- Consequência prática: para extrair essa mesa institucional como produto separado para um cliente que só quer isso, basta copiar `core/` + `institutional/` e escrever um `AppProviders` menor — exatamente o argumento que o projeto já usa para justificar módulos por domínio em vez de por tipo de arquivo.

## 4. Arquitetura pesquisada para alta personalização + reuso

Pergunta da atividade: qual arquitetura (linguagem, SGBD, padrão de interfaces/componentes) melhor se encaixa nesse projeto. A resposta é justificar e formalizar o que o projeto já faz — um **monólito modular por domínio**, com três técnicas concretas de reuso:

### 4.1 Linguagem: TypeScript fullstack (Next.js App Router)
Uma única linguagem e um único runtime cobrem tela, hook de estado e rota de API (`src/app/api/**/route.ts`). O mesmo `type`/`interface` (ex.: `Wallet`, `TeamMember`) é compartilhado entre o componente que renderiza, o Context que busca os dados e a rota que os retorna — elimina a duplicação de contrato client/server que existe em stacks poliglotas (ex.: front em TS + back em outra linguagem, contrato mantido "no olho"). Isso é o que torna barato adicionar um eixo de personalização novo (como `accountType`): um campo em um `type`, refletido automaticamente onde for usado.

### 4.2 SGBD: SQLite via Prisma ORM (driver adapters)
O banco físico (SQLite) é o menos importante da escolha — o que importa é a **camada Prisma por cima**, que abstrai o dialeto SQL. Trocar para Postgres ou MySQL em produção é mudar o `datasource` do `schema.prisma`, sem tocar em nenhuma rota ou tela. Isso é diretamente relevante para personalização multi-cliente: o projeto usa **schema único, discriminado por coluna** (`role`, `accountType`, `status`) em vez de "um banco por cliente" — a opção certa para o porte de um protótipo/MVP, porque adicionar um cliente novo é inserir uma linha, não provisionar infraestrutura. Um sistema de fato multi-tenant em produção evoluiria isso para *schema-per-tenant* ou *row-level security*, mas isso seria over-engineering hoje.

### 4.3 Padrão de interfaces: design system central
Todo componente visual reutilizável mora em `src/modules/core/components/` (catálogo em `DESIGN_SYSTEM.md`) e é consumido por todos os módulos de feature — nenhuma tela reimplementa botão, badge, card ou campo de formulário. O documento do próprio projeto já registra o "antes": cada tela reimplementava as mesmas classes Tailwind com pequenas variações de altura/cor/borda. É o motivo pelo qual as 15 interfaces do item 2 têm alta variação de *conteúdo* e *fluxo*, mas identidade visual consistente — reuso sem engessar a personalização.

### 4.4 Padrão de personalização: hooks de "gating" centralizados, formalizados com Strategy
`usePlanGating()` e `useInstitutionalAccess()` (item 1) são o padrão que dá reuso real a regras de acesso: a regra de negócio ("Standard não vê metas", "só Institutional vê a mesa") vive em um lugar, e cada tela só pergunta um booleano. Evoluir esse padrão para algo mais robusto (ex.: um serviço de feature flags tipo LaunchDarkly/Unleash) seria o próximo passo natural se o número de eixos crescesse muito — mas para 2-3 eixos, um hook por módulo é mais simples e igualmente reusável.

Dentro de `usePlanGating()`, essa regra de negócio agora é o padrão **Strategy** (ver [`2 - DESIGN_PATTERNS.md`](2%20-%20DESIGN_PATTERNS.md)): cada plano é uma classe `PlanPolicy` própria, e o hook só resolve qual classe usar. A mesma ideia — variar um comportamento por eixo, sem `if` central — reaparece em outros dois pontos do produto que não são personalização por cliente, mas são a mesma força arquitetural: qual perfil de investidor o score do quiz indica (`quiz/profileStrategy.ts`) e como serializar o relatório consolidado por formato (`institutional/reportExportStrategy.ts`). Os três são exemplos independentes do mesmo padrão, não o mesmo código reaproveitado três vezes.

### 4.5 Arquitetura geral: monólito modular por domínio
`src/modules/<domínio>/`, não `src/{components,hooks,services}/` por tipo de arquivo. Cada módulo de feature só depende de `core`. Alternativas consideradas e descartadas para este projeto:

| Alternativa | Por que não |
|---|---|
| Microfrontends (um app por módulo, deploy independente) | Overhead de infraestrutura (build, versionamento, comunicação entre apps) desproporcional ao tamanho do time e do protótipo; a regra "módulo só depende de core" já dá a mesma separação lógica sem pagar esse custo operacional |
| Multi-tenant com *schema-per-tenant* | Resolve isolamento de dados entre clientes de verdade, mas o projeto ainda não tem multi-tenancy real (dados são um único dataset de demonstração) — seria complexidade sem necessidade correspondente hoje |
| Serviço de feature flag dedicado | Correto para dezenas de flags/experimentos; aqui 2-3 eixos de personalização cabem em hooks simples, mais fáceis de ler e testar |

**Conclusão:** para o porte e o objetivo deste projeto — protótipo acadêmico com potencial de evoluir para produto real, times pequenos, necessidade de trocar SGBD facilmente e de compor personalização por role + plano + segmento de cliente sem duplicar código — a combinação **TypeScript fullstack (Next.js) + Prisma/SQLite + monólito modular por domínio + design system central + hooks de gating por eixo** é a que maximiza reuso sem sacrificar a capacidade de dar a cada cliente uma experiência diferente.
