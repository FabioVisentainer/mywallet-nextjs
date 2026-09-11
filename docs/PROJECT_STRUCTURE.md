# Estrutura do projeto — MyWallet

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Prisma/SQLite. Ver também [`DATABASE.md`](./DATABASE.md) para o schema do banco, [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) para o catálogo de componentes visuais (`Button`, `Badge`, `Card`, `Input`, etc.) e [`2 - DESIGN_PATTERNS.md`](2%20-%20DESIGN_PATTERNS.md) para os design patterns (Singleton, Template Method, Strategy) aplicados no `lib/` e em alguns módulos.

## Ideia central: módulos separados por domínio

O código de funcionalidade **não** fica dentro de `src/app/` (que é só roteamento). Cada domínio de negócio é um módulo autocontido em `src/modules/<dominio>/`, com seu próprio estado (Context), tipos e componentes. A regra: um módulo de feature (wallets, goals, news, admin...) só pode depender do módulo `core` — nunca de outro módulo de feature diretamente (a única exceção documentada é `analyst` reaproveitando o `NewsContext`, já que analista é uma extensão do domínio de notícias).

Por quê: para dar de extrair/vender um módulo isolado a um cliente que só precisa daquele pedaço, sem arrastar o app inteiro.

```
src/
├── app/                    # só rotas — cada arquivo é fino, importa dos módulos
├── modules/
│   ├── core/               # sessão, toast, modal de confirmação, layout base, tema — fundação de todos os módulos
│   ├── wallets/            # carteiras + ativos
│   ├── goals/               # metas financeiras
│   ├── performance/         # gráfico de performance
│   ├── transactions/        # extrato de transações (somente leitura)
│   ├── news/                 # portal de notícias + estúdio do analista (ArticleForm)
│   ├── admin/                # gestão de usuários
│   ├── plans/                 # planos Standard/Platinum/Black + regras de bloqueio
│   ├── institutional/          # mesa institucional (equipe + relatório consolidado) — só clientes accountType="Institutional"
│   └── quiz/                   # teste de perfil de investidor
├── mocks/
│   ├── seed/                # dados de exemplo — só o prisma/seed.ts importa daqui
│   └── external/              # simula APIs externas (cotações, câmbio, etc.) — só as rotas /api/market/* importam daqui
├── lib/                      # prisma client singleton, market data gateway (singleton), api resource loader e form-submit (template method), validated create handler, hash de senha, cliente fetch da API — ver DESIGN_PATTERNS.md
└── generated/prisma/          # código gerado pelo Prisma — não editar, não versionar
```

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

Padrão repetido em `goals/`, `news/`, `admin/`, `institutional/` (com pequenas variações — `transactions/` e `performance/` não têm Context porque não têm mutação feita pelo usuário, só um hook de busca `useTransactions`/`useMarketSeries`).

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

```
Página (src/app/.../page.tsx)
   ↓ usa
Hook do módulo (useWallets, useGoals, useNews, useAdmin, useTransactions, useMarketSeries, useCurrencyRates, useAnalystCalls)
   ↓ faz fetch via src/lib/apiClient.ts (apiFetch + ApiError)
Rota de API (src/app/api/**/route.ts)
   ↓ Prisma (dados reais) ou src/mocks/external/* (dados "de mercado")
SQLite (dev.db)
```

Nenhuma página lê o Prisma diretamente — sempre passa pela rota de API, mesmo sendo tudo local. Isso mantém a fronteira clara entre client e servidor e é o que permite trocar SQLite por outro banco, ou os mocks externos por chamadas reais, sem tocar nas páginas.

## Mapa de rotas

### Autenticação — `src/app/page.tsx` e `src/app/(auth)/`
| Rota | Arquivo | O que é |
|---|---|---|
| `/` | `app/page.tsx` | Login (chama `POST /api/auth/login` de verdade) |
| `/signup` | `app/(auth)/signup/page.tsx` | Cadastro (chama `POST /api/auth/signup`, depois faz login) |
| `/forgot-password` | `app/(auth)/forgot-password/page.tsx` | Fluxo de fachada (não é real) |
| `/reset-password` | `app/(auth)/reset-password/page.tsx` | Fluxo de fachada (não é real) |

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
| `/plans` | `plans/page.tsx` | plans |
| `/institutional` | `institutional/page.tsx` | institutional — exclusivo `accountType="Institutional"`, mostra bloqueio para os demais |
| `/institutional/reports` | `institutional/reports/page.tsx` | institutional — idem, agrega dados de `wallets` |

### API interna — `src/app/api/`
CRUD real contra o SQLite:

- `wallets/route.ts`, `wallets/[id]/route.ts`, `wallets/[id]/assets/route.ts`, `wallets/[id]/assets/[assetId]/route.ts`
- `goals/route.ts` (o `POST` usa `ValidatedCreateHandler`, ver `2 - DESIGN_PATTERNS.md`), `goals/[id]/route.ts`
- `articles/route.ts`, `articles/[id]/route.ts`
- `users/route.ts`, `users/[id]/route.ts`
- `team/route.ts` (o `POST` também usa `ValidatedCreateHandler`), `team/[id]/route.ts` (CRUD de `TeamMember`, consumido só por `institutional/`)
- `transactions/route.ts` (só leitura)
- `auth/login/route.ts`, `auth/signup/route.ts`

Dados "de mercado" (mockados, ver `DATABASE.md`), todas passando pelo singleton `MarketDataGateway` (ver `2 - DESIGN_PATTERNS.md`):
- `market/rates/route.ts`, `market/performance/route.ts`, `market/analyst-calls/route.ts`

## Módulo `core` (fundação compartilhada)

| Arquivo | Responsabilidade |
|---|---|
| `SessionContext.tsx` | usuário logado, `login(email, senha)`/`logout`, plano atual |
| `ToastContext.tsx` | notificações no canto da tela |
| `ConfirmContext.tsx` | modal de confirmação genérico (usado por toda ação de excluir) |
| `CoreProviders.tsx` | combina os três acima |
| `nav.ts` | itens do menu lateral por papel (investor/analyst/admin) |
| `format.ts` | formatação de moeda, percentual, iniciais do nome |
| `components/` | Layout: `Sidebar`, `Topbar`, `AppPage`, `Modal`, `ConfirmModal`, `Toast`, `Loading`, `RequireSession`. Design system: `Button`, `Badge`, `Card`, `StatCard`, `Alert`, `Input`, `Select`, `Textarea`, `Checkbox`, `FieldShell`, `ProgressBar` — catálogo completo em [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) |

`src/AppProviders.tsx` (fora de `modules/`, de propósito) é o único arquivo que conhece todos os módulos — ele só compõe os providers. Se algum dia for extrair só o módulo de wallets pra outro projeto, é só copiar `core/` + `wallets/` e escrever um `AppProviders` novo com menos providers.

## Rodando o projeto

```bash
npm install
npm run db:migrate   # cria/atualiza o schema local
npm run db:seed       # popula dados de demonstração
npm run dev            # http://localhost:3000
```

`npm run build` e `npm run lint` devem passar limpos antes de qualquer entrega.
