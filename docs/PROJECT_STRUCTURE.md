# Estrutura do projeto — MyWallet

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Prisma/SQLite. Ver também [`DATABASE.md`](./DATABASE.md) para o schema do banco, [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) para o catálogo de componentes visuais (`Button`, `Badge`, `Card`, `Input`, etc.), [`2 - DESIGN_PATTERNS.md`](2%20-%20DESIGN_PATTERNS.md) para os design patterns (Singleton, Template Method, Strategy) aplicados no `lib/` e em alguns módulos, e [`3 - CRUD.md`](3%20-%20CRUD.md) para o catálogo de quais rotas têm CRUD completo.

## Arquitetura geral

O projeto segue uma **arquitetura em camadas no estilo MVC, adaptada ao
modelo client/server do Next.js** — o dado sempre atravessa as mesmas quatro
camadas, na mesma ordem, tanto pra ler quanto pra escrever:

```
┌────────────────────────────────────────────────────────────────┐
│  CLIENTE (browser)                                               │
│                                                                    │
│   View                page.tsx (App Router)                       │
│     ↓ usa                                                          │
│   Controller/ViewModel  Context ou hook do módulo                  │
│                         (WalletsContext, useTransactions, ...)      │
│     ↓ chama                                                          │
│   Service (proxy)       <domínio>Service.ts, dentro do próprio módulo │
│                         (goalsService, walletsService, ...)            │
│     ↓ usa                                                                │
│   Gateway               src/services/apiClient.ts (fetch tipado)          │
└──────────────────────────────┬───────────────────────────────────────┘
                                │  HTTP (JSON)
┌──────────────────────────────▼───────────────────────────────────────┐
│  SERVIDOR (Next.js Route Handlers)                                     │
│                                                                        │
│   Controller           src/app/api/**/route.ts — fino: parseia,        │
│                         chama o Service, devolve Response.json(...)     │
│     ↓ chama                                                              │
│   Service               src/server/services/<recurso>Service.ts —        │
│                         regra de negócio e validação                      │
│     ↓ chama                                                                │
│   Repository            src/server/repositories/<recurso>Repository.ts —   │
│                         único lugar que fala com o Prisma                   │
│     ↓ usa                                                                     │
│   Model                 Prisma (schema.prisma + PrismaClient)                  │
└──────────────────────────────┬────────────────────────────────────────────┘
                                ↓
                         SQLite (dev.db)
```

**Onde isso bate com MVC "de livro" e onde não bate:** o **Model** é fiel —
só o Repository fala com o Prisma; nenhuma tela, Context, Service ou rota
monta uma query diretamente. A **View** também: `page.tsx` só renderiza,
nunca guarda estado de negócio por conta própria (ver próxima seção). O que
foge do MVC clássico é o **Controller**, que aqui existe em duas metades —
uma em cada lado da rede: do lado do cliente, o Context/hook de cada módulo
cumpre o papel de Controller/ViewModel (decide *quando* buscar ou mutar dado
e expõe o resultado pronto pra View); do lado do servidor, a própria função
exportada da rota (`GET`, `POST`, ...) é o Controller — não existe uma
classe `Controller` isolada por recurso, o Next.js já usa o arquivo de rota
como esse ponto de entrada. O **Service** é a camada nova de cada lado: no
cliente, é só um proxy fino sobre `apiClient` (não tem regra de negócio, só
nomeia os endpoints); no servidor, é onde a regra de negócio e a validação
realmente moram — inclusive a validação que os `ValidatedCreateHandler` de
`api/goals`, `api/team` etc. usam (ver
[`2 - DESIGN_PATTERNS.md`](2%20-%20DESIGN_PATTERNS.md)), que agora chama o
Service em vez de montar a query ali mesmo. Essa divisão em camadas é
**ortogonal** à organização de pastas: a camada descreve *por onde o dado
passa*, a organização por módulo (próxima seção) descreve *como o código
está agrupado* — por domínio de negócio no cliente (`src/modules/`), e por
recurso no servidor (`src/server/`).

## Estrutura de pastas principais

Visão de alto nível de cada pasta de primeiro nível — a lista completa dos
módulos de negócio (o que tem dentro de cada um) fica na seção "Ideia
central" logo abaixo; aqui o objetivo é só entender o papel de cada pasta:

| Pasta | O que tem dentro | Camada (seção anterior) |
|---|---|---|
| `src/app/` | Rotas do App Router: cada `page.tsx` é uma tela, cada `api/**/route.ts` é um Controller fino | View (páginas) + Controller do servidor (rotas de API) |
| `src/modules/` | Uma subpasta por domínio de negócio (carteiras, metas, admin, etc.) — dentro de cada uma, o estado (Context ou hook), o Service de API do módulo, os tipos e os componentes daquele domínio | Controller/ViewModel + Service (proxy) do cliente |
| `src/design-system/` | Só átomos visuais reutilizáveis, sem estado de negócio (`Button`, `Input`, `Card`, ... — catálogo completo em [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)) | — (é usado por toda View, mas não é uma camada de dado) |
| `src/services/` | Infra client-side de comunicação com a API: `apiClient.ts` (fetch tipado), e as bases Template Method `apiResourceLoader.ts`/`formSubmitTemplate.ts` (ver [`2 - DESIGN_PATTERNS.md`](2%20-%20DESIGN_PATTERNS.md)) | Gateway do cliente |
| `src/server/` | Tudo que é só servidor: `prisma.ts` (Singleton), `password.ts`, `controllers/validatedCreateHandler.ts` (Template Method), `repositories/<recurso>Repository.ts` (só Prisma) e `services/<recurso>Service.ts` (regra de negócio) | Service + Repository do servidor |
| `src/mocks/` | `seed/` (dados de demonstração, só o `prisma/seed.ts` importa daqui) e `external/` (simulação de APIs externas — cotações, câmbio, e-mail transacional) | Dado de apoio para desenvolvimento, não é uma camada de arquitetura |
| `src/generated/prisma/` | Client TypeScript gerado a partir do `schema.prisma` — não editar, não versionar | Model (código gerado) |
| `prisma/` (fora de `src/`) | `schema.prisma` (definição do Model) + `migrations/` (histórico versionado do schema do banco) | Model (fonte) |
| `docs/` | Esta documentação | — |

## Ideia central: módulos separados por domínio

O código de funcionalidade **não** fica dentro de `src/app/` (que é só roteamento). Cada domínio de negócio é um módulo autocontido em `src/modules/<dominio>/`, com seu próprio estado (Context), tipos e componentes. A regra: um módulo de feature (wallets, goals, news, admin...) só pode depender do módulo `core` — nunca de outro módulo de feature diretamente (a única exceção documentada é `analyst` reaproveitando o `NewsContext`, já que analista é uma extensão do domínio de notícias).

Por quê: para dar de extrair/vender um módulo isolado a um cliente que só precisa daquele pedaço, sem arrastar o app inteiro.

```
src/
├── app/                    # rotas (App Router) — ver seção "O que realmente fica em app/ vs. modules/" logo abaixo
├── design-system/          # átomos visuais puros (Button, Input, Card, ...) — ver DESIGN_SYSTEM.md
├── services/                # apiClient, apiResourceLoader e formSubmitTemplate (Template Method) — proxy client-side
├── modules/
│   ├── core/               # sessão, toast, modal de confirmação, layout do app (Sidebar, Topbar, Modal...) — fundação de todos os módulos
│   ├── wallets/            # carteiras + ativos — CRUD completo, + walletsService.ts
│   ├── goals/               # metas financeiras — CRUD completo, + goalsService.ts
│   ├── performance/         # gráfico de performance (só leitura)
│   ├── transactions/        # extrato de transações — CRUD completo (manual) + importação em lote de swaps, + transactionsService.ts
│   ├── news/                 # portal de notícias + estúdio do analista (ArticleForm) — CRUD completo, + articlesService.ts
│   ├── admin/                # gestão de usuários — CRUD completo, + usersService.ts
│   ├── promotions/            # promoções por tempo determinado nos planos — CRUD completo, exclusivo role admin, + promotionsService.ts
│   ├── plans/                  # planos Standard/Platinum/Black + regras de bloqueio (Strategy)
│   ├── institutional/           # mesa institucional (equipe + relatório consolidado) — CRUD completo, só clientes accountType="Institutional", + teamService.ts
│   └── quiz/                    # teste de perfil de investidor (histórico, não é CRUD)
├── mocks/
│   ├── seed/                # dados de exemplo — só o prisma/seed.ts importa daqui
│   └── external/              # simula APIs externas (cotações, câmbio, e-mail transacional, etc.) — só as rotas /api/market/* e as de auth importam daqui
├── server/                    # Controller-base, Service e Repository do lado servidor — ver "Arquitetura geral" acima e DESIGN_PATTERNS.md
│   ├── prisma.ts                # PrismaSingleton
│   ├── password.ts               # hash scrypt
│   ├── controllers/validatedCreateHandler.ts  # Template Method
│   ├── repositories/               # só Prisma — um arquivo por recurso, + marketDataGateway.ts (Singleton)
│   └── services/                     # regra de negócio — um arquivo por recurso
└── generated/prisma/          # código gerado pelo Prisma — não editar, não versionar
```

Cada Service/Repository do servidor corresponde a um recurso de
[`3 - CRUD.md`](3%20-%20CRUD.md), não a um módulo do cliente — os dois
conjuntos de pastas (`src/modules/` no cliente, `src/server/` no servidor)
são organizados de formas diferentes de propósito (ver "Arquitetura geral").

## O que realmente fica em `app/` vs. em `modules/`

A ideia de "`app/` só tem rotas finas" é fácil de ler errado como "todo
`page.tsx` é uma linha só, importando uma tela pronta de dentro de `modules/`"
— **não é bem assim na prática**. A maioria dos `page.tsx` deste projeto monta
a composição visual inteira da tela (grid, cards, tabela, filtros) — só o
**estado e a mutação de dado** vêm de um Context/hook do módulo:

| `page.tsx` | Linhas | O que vem de `modules/` |
|---|---|---|
| `goals/page.tsx` | 137 | `useGoals()` (estado) + `GoalFormModal` (formulário) — o card, a barra de progresso e o layout da lista são escritos ali mesmo |
| `admin/page.tsx` | 148 | `useAdmin()` + `CreateUserModal` — a tabela, busca e filtro por papel são código da rota |
| `transactions/page.tsx` | 185 | `useTransactions()` + `TransactionFormModal` + `BrokerImportPanel` — a tabela e os filtros por tipo são código da rota |
| `promotions/page.tsx` | 136 | `usePromotions()` + `PromotionFormModal` — o cálculo de status (`Scheduled`/`Active`/`Expired`) é código da rota |
| `dashboard/page.tsx` | 181 | agrega `useWallets`, `useGoals` e `useMarketSeries` de três módulos diferentes — só faz sentido existir na rota, não em nenhum módulo isolado |

Só uma minoria de rotas é de fato "fina" no sentido literal — devolve
praticamente só um componente de formulário do módulo, sem montar layout
próprio:

| `page.tsx` | Linhas | Componente do módulo que faz o trabalho |
|---|---|---|
| `analyst/new/page.tsx` | 12 | `<ArticleForm mode="new" .../>` |
| `wallets/[id]/assets/new/page.tsx` | 34 | `<AssetForm mode="new" .../>` |
| `wallets/[id]/assets/[assetId]/page.tsx` | 41 | `<AssetForm mode="edit" .../>` |
| `analyst/[id]/page.tsx` | 45 | `<ArticleForm mode="edit" .../>` |

**A fronteira que é de fato garantida** (e vale para as duas categorias
acima): nenhuma página fala com o Prisma ou faz `fetch` bruto — sempre passa
pelo hook/Context do módulo, que por sua vez passa por `apiClient.ts` até a
rota de API (ver "Camadas de estado" mais abaixo); e nenhuma página guarda
estado de negócio (a lista de metas, o extrato de transações) fora desse
Context/hook — só estado de UI local mesmo (aba selecionada, texto de busca,
qual modal está aberto). O que varia de página pra página é só **quanto de
composição visual** fica na rota vs. delegada a um componente do módulo — e
isso depende de a tela ser específica daquela rota (a maioria) ou ser
literalmente "o formulário X, em modo criar ou editar" (as quatro da segunda
tabela).

## Anatomia de um módulo

Exemplo — `src/modules/wallets/`:

```
wallets/
├── types.ts                       # Wallet, Asset, AssetInput
├── WalletsContext.tsx              # estado (busca da API no mount, mutações assíncronas)
└── components/
    ├── AssetForm.tsx                # formulário de criar/editar ativo
    └── WalletFormModal.tsx           # modal de criar/renomear carteira
```

Padrão repetido em `goals/`, `news/`, `admin/`, `institutional/`, `promotions/`. Nem todo módulo segue a forma à risca — a tabela abaixo mostra o que cada um realmente tem hoje:

| Módulo | Estado (Context ou hook) | Service (proxy de API) | `types.ts` | `components/` | Observação |
|---|---|---|---|---|---|
| `core` | `SessionContext`, `ToastContext`, `ConfirmContext` (`CoreProviders` combina os três) | — | `types.ts` (`Role`, `PlanName`, `AccountType`, ...) | `layout/` — só o shell do app (`Sidebar`, `Topbar`, `AppPage`, `Modal`, ...); o design system mudou pra `src/design-system/` | fundação — todo módulo de feature depende dele |
| `wallets` | `WalletsContext` — CRUD completo | `walletsService.ts` | `types.ts` (`Wallet`, `Asset`, `AssetInput`) | `AssetForm`, `WalletFormModal` | + `useAssetReference.ts`, hook de leitura auxiliar |
| `goals` | `GoalsContext` — CRUD completo | `goalsService.ts` | `types.ts` | `GoalFormModal` | |
| `performance` | `useMarketSeries` (hook, só leitura) | — (usa `ApiResourceLoader` direto, ver `2 - DESIGN_PATTERNS.md`) | — | `PerformanceChart` | + `chart.ts` (cálculo de série do gráfico) |
| `transactions` | `useTransactions` (hook) — CRUD completo | `transactionsService.ts` | `data.ts` faz esse papel (`TxRecord`, `TxInput`, `TxType`) | `TransactionFormModal`, `BrokerImportPanel` | sem Context porque a mutação é simples o bastante para um hook só |
| `news` | `NewsContext` — CRUD completo | `articlesService.ts` | `types.ts` | `ArticleForm` | + `useAnalystCalls.ts` (hook de leitura, widget de recomendações) |
| `admin` | `AdminContext` — CRUD completo | `usersService.ts` | `types.ts` | `CreateUserModal` | |
| `promotions` | `PromotionsContext` — CRUD completo | `promotionsService.ts` | `types.ts` | `PromotionFormModal` | ver `3 - CRUD.md` para o catálogo completo de CRUDs |
| `plans` | `usePlanGating()` (`gating.ts`) + `useCurrencyRates` | — (usa `ApiResourceLoader` direto) | — | `LockedFeature` | `data.ts` guarda os planos estáticos (Standard/Platinum/Black) |
| `institutional` | `TeamContext` — CRUD completo | `teamService.ts` | `types.ts` | `AddMemberModal` | + `access.ts` (`useInstitutionalAccess`), `reportExportStrategy.ts` (Strategy) |
| `quiz` | `QuizContext` | — (`app/quiz/result/page.tsx` chama `/api/quiz/result` direto — não é CRUD, não ganhou Service próprio) | — | — | `data.ts` (perguntas), `profileStrategy.ts` (Strategy) — histórico de tentativas, não CRUD |

Um módulo sem mutação do usuário (`performance`) não precisa de Context — um
hook de busca simples resolve. `transactions` tem CRUD completo mas fica num
hook (`useTransactions`) em vez de Context porque a mutação é simples o
bastante para não justificar o Context; `quiz` não tem CRUD de propósito
(histórico de tentativas, ver `3 - CRUD.md`) mas ainda assim usa Context
(`QuizContext`) por conveniência de estado compartilhado entre as etapas do
teste. Um módulo sem `components/` (`quiz`, `plans`... exceto `LockedFeature`)
é sinal de que ele não tem formulário/modal próprio, só lê e decide (Strategy)
ou só expõe estado.

Duas exceções ganharam um arquivo de "regra" isolado do resto do módulo, no padrão Strategy (ver `2 - DESIGN_PATTERNS.md`): `quiz/profileStrategy.ts` (decide qual perfil de investidor o score indica) e `institutional/reportExportStrategy.ts` (decide como serializar o relatório consolidado por formato).

## Personalização em três eixos independentes

Três mecanismos compostos, cada um resolvido por um hook central (nunca `if` espalhado pelas telas):

| Eixo | O que controla | Fonte | Hook central |
|---|---|---|---|
| **role** (`investor`/`analyst`/`admin`) | o que a pessoa pode *fazer* | `User.role`, mapeado em `SessionContext` | `navFor(role, accountType)` em [`nav.ts`](../src/modules/core/nav.ts) |
| **plan** (`Standard`/`Platinum`/`Black`) | o que a assinatura *libera* | estado de sessão (simulado, ver `/plans`) | `usePlanGating()` em [`plans/gating.ts`](../src/modules/plans/gating.ts) |
| **accountType** (`Individual`/`Institutional`) | *módulo* exclusivo por segmento de cliente | `User.accountType` | `useInstitutionalAccess()` em [`institutional/access.ts`](../src/modules/institutional/access.ts) |

`accountType` é o eixo que resolve o requisito de "nem todo cliente tem a mesma opção": só a conta seed `carla.mendes@mywallet.io` é `Institutional` e enxerga o item "Institutional desk" no menu — para as demais o módulo simplesmente não existe. Igual a `wallets/`, `institutional/` só depende de `core` (mais uma leitura pontual de `useWallets` no relatório consolidado, precedente documentado abaixo com `analyst`/`NewsContext`) — dá pra extrair `core/` + `institutional/` e vender essa mesa isolada a um cliente que só precisa dela.

## Camadas de estado — de onde vêm os dados

Versão detalhada do diagrama de "Arquitetura geral" (topo deste documento),
aqui com os hooks reais de cada módulo:

```
Página (src/app/.../page.tsx)
   ↓ usa
Hook do módulo (useWallets, useGoals, useNews, useAdmin, useTransactions, useMarketSeries, useCurrencyRates, useAnalystCalls)
   ↓ chama o Service do próprio módulo (walletsService, goalsService, articlesService, usersService, transactionsService, teamService, promotionsService)
   ↓ que faz fetch via src/services/apiClient.ts (apiFetch + ApiError)
Rota de API — Controller fino (src/app/api/**/route.ts)
   ↓ chama o Service do servidor (src/server/services/<recurso>Service.ts)
   ↓ que chama o Repository (src/server/repositories/<recurso>Repository.ts)
   ↓ Prisma (dados reais) ou src/mocks/external/* via MarketDataGateway (dados "de mercado")
SQLite (dev.db)
```

Nenhuma página lê o Prisma diretamente — sempre passa pela rota de API, mesmo sendo tudo local. Isso mantém a fronteira clara entre client e servidor e é o que permite trocar SQLite por outro banco, ou os mocks externos por chamadas reais, sem tocar nas páginas. Do lado do cliente, o Service de cada módulo é o único arquivo que sabe a URL do endpoint — o Context/hook só chama métodos com nome de negócio (`goalsService.create(input)`), nunca monta uma URL ou um `fetch` na mão.

## Mapa de rotas

### Autenticação — `src/app/page.tsx` e `src/app/(auth)/`
| Rota | Arquivo | O que é |
|---|---|---|
| `/` | `app/page.tsx` | Login (chama `POST /api/auth/login` de verdade) |
| `/signup` | `app/(auth)/signup/page.tsx` | Cadastro (chama `POST /api/auth/signup`, depois faz login) |
| `/forgot-password` | `app/(auth)/forgot-password/page.tsx` | Chama `POST /api/auth/forgot-password` de verdade — grava um `PasswordResetToken` real; só o envio do e-mail é mockado (ver `DATABASE.md`) |
| `/reset-password` | `app/(auth)/reset-password/page.tsx` | Chama `POST /api/auth/reset-password` de verdade — valida o token e grava a nova senha com hash |

### Teste de perfil — `src/app/quiz/`
`quiz/layout.tsx` provê o `QuizProvider` (estado do questionário compartilhado entre as duas telas abaixo).

| Rota | Arquivo |
|---|---|
| `/quiz` | `app/quiz/page.tsx` |
| `/quiz/result` | `app/quiz/result/page.tsx` |

### App autenticado — `src/app/(app)/`
`(app)/layout.tsx` aplica `RequireSession` (redireciona pra `/` se não estiver logado, exceto `/news` que é pública), mais Sidebar, Topbar, modal de confirmação e toast globais.

| Rota | Arquivo | Módulo |
|---|---|---|
| `/dashboard` | `dashboard/page.tsx` | wallets + goals + performance |
| `/wallets` | `wallets/page.tsx` | wallets |
| `/wallets/[id]` | `wallets/[id]/page.tsx` | wallets |
| `/wallets/[id]/assets/new` | `wallets/[id]/assets/new/page.tsx` | wallets |
| `/wallets/[id]/assets/[assetId]` | `wallets/[id]/assets/[assetId]/page.tsx` | wallets |
| `/performance` | `performance/page.tsx` | performance |
| `/goals` | `goals/page.tsx` | goals |
| `/transactions` | `transactions/page.tsx` | transactions |
| `/news` | `news/page.tsx` | news (pública, sem login) |
| `/analyst` | `analyst/page.tsx` | news (estúdio do analista) |
| `/analyst/new`, `/analyst/[id]` | `analyst/new/page.tsx`, `analyst/[id]/page.tsx` | news |
| `/admin` | `admin/page.tsx` | admin |
| `/admin/[id]` | `admin/[id]/page.tsx` | admin |
| `/promotions` | `promotions/page.tsx` | promotions — exclusivo role admin |
| `/plans` | `plans/page.tsx` | plans |
| `/institutional` | `institutional/page.tsx` | institutional — exclusivo `accountType="Institutional"`, mostra bloqueio para os demais |
| `/institutional/reports` | `institutional/reports/page.tsx` | institutional — idem, agrega dados de `wallets` |

### API interna — `src/app/api/`
CRUD real contra o SQLite. Cada `route.ts` abaixo é um Controller fino — a
regra de negócio e a validação vivem no Service correspondente em
`src/server/services/`, e o acesso ao Prisma fica isolado no Repository em
`src/server/repositories/` (ver "Arquitetura geral" no topo deste
documento):

- `wallets/route.ts`, `wallets/[id]/route.ts`, `wallets/[id]/assets/route.ts`, `wallets/[id]/assets/[assetId]/route.ts`
- `goals/route.ts` (o `POST` usa `ValidatedCreateHandler`, ver `2 - DESIGN_PATTERNS.md`), `goals/[id]/route.ts`
- `articles/route.ts`, `articles/[id]/route.ts`
- `users/route.ts` (`GET`/`POST` — o `POST` é criação administrativa, usa `ValidatedCreateHandler`, distinto de `auth/signup`), `users/[id]/route.ts` (`GET`/`PATCH`/`DELETE`)
- `team/route.ts` (`GET`/`POST`, o `POST` usa `ValidatedCreateHandler`), `team/[id]/route.ts` (`PATCH`/`DELETE`) — CRUD de `TeamMember`, consumido só por `institutional/`
- `transactions/route.ts` (`GET`/`POST`), `transactions/[id]/route.ts` (`PATCH`/`DELETE`), `transactions/import/route.ts` (importação em lote de swaps da corretora simulada)
- `promotions/route.ts` (`GET`/`POST`, o `POST` usa `ValidatedCreateHandler`), `promotions/[id]/route.ts` (`PATCH`/`DELETE`) — CRUD de `Promotion`, novo (ver `3 - CRUD.md`)
- `auth/login/route.ts`, `auth/signup/route.ts`, `auth/forgot-password/route.ts`, `auth/reset-password/route.ts` (recuperação de senha real, ver `DATABASE.md`)
- `quiz/result/route.ts` (`GET`/`POST` — histórico de tentativas do teste de perfil, não é CRUD)

Dados "de mercado" (mockados, ver `DATABASE.md`), todas passando pelo singleton `MarketDataGateway` (ver `2 - DESIGN_PATTERNS.md`):
- `market/rates/route.ts`, `market/performance/route.ts`, `market/analyst-calls/route.ts`

## Módulo `core` (fundação compartilhada) e o Design System

`core/` hoje é só o **shell do app e o estado transversal de sessão** — o
Design System (os átomos visuais reutilizáveis) saiu daqui e mora em
[`src/design-system/`](../src/design-system), separado, porque um botão ou
um campo de input não é uma responsabilidade de "sessão/layout": qualquer
módulo (e até uma tela fora de `core`) importa dele diretamente, sem passar
por `core`.

| Arquivo | Responsabilidade |
|---|---|
| `SessionContext.tsx` | usuário logado, `login(email, senha)`/`logout`, plano atual |
| `ToastContext.tsx` | notificações no canto da tela |
| `ConfirmContext.tsx` | modal de confirmação genérico (usado por toda ação de excluir) |
| `CoreProviders.tsx` | combina os três acima |
| `nav.ts` | itens do menu lateral por papel (investor/analyst/admin) |
| `format.ts` | formatação de moeda, percentual, iniciais do nome |
| `layout/` | só o shell do app: `Sidebar`, `Topbar`, `AppPage`, `Modal`, `ConfirmModal`, `Toast`, `Loading`, `RequireSession` |

| Design System | Onde |
|---|---|
| `Button`, `Badge`, `Card`, `StatCard`, `Alert`, `Input`, `Select`, `Textarea`, `Checkbox`, `FieldShell`, `ProgressBar` | [`src/design-system/`](../src/design-system) — catálogo completo em [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) |

`src/AppProviders.tsx` (fora de `modules/`, de propósito) é o único arquivo que conhece todos os módulos — ele só compõe os providers. Se algum dia for extrair só o módulo de wallets pra outro projeto, é só copiar `core/` + `design-system/` + `services/` + `wallets/` e escrever um `AppProviders` novo com menos providers.

## Rodando o projeto

```bash
npm install
npm run db:migrate   # cria/atualiza o schema local
npm run db:generate   # regenera o client TS a partir do schema.prisma
npm run db:seed        # popula dados de demonstração
npm run dev             # http://localhost:3000
```

`npm run build` e `npm run lint` devem passar limpos antes de qualquer entrega.
