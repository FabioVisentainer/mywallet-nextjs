# Banco de dados — MyWallet

SQLite local via **Prisma 7** (novo gerador `prisma-client`, arquitetura de *driver adapters*). O arquivo do banco fica em `mywallet-nextjs/dev.db` e **não é versionado** (está no `.gitignore`) — quem clonar o projeto precisa rodar migração + seed para ter dados.

- Schema: [`prisma/schema.prisma`](../prisma/schema.prisma)
- Migrações: [`prisma/migrations/`](../prisma/migrations/)
- Seed: [`prisma/seed.ts`](../prisma/seed.ts)
- Cliente singleton usado pelas rotas: [`src/lib/prisma.ts`](../src/lib/prisma.ts)

Ver também [`3 - CRUD.md`](3%20-%20CRUD.md) para o catálogo de quais tabelas têm CRUD completo (Create/Read/Update/Delete) por rota de API e quais existem no banco mas não são CRUD de propósito (histórico, log, token).

## Comandos

Rodar sempre a partir de `mywallet-nextjs/`:

```bash
npm run db:migrate    # aplica/cria migrações (prisma migrate dev)
npm run db:generate   # regenera o client TS a partir do schema.prisma
npm run db:seed       # apaga e repopula todas as tabelas (dados de demonstração)
npm run db:studio     # abre o Prisma Studio (GUI para inspecionar o banco)
```

`DATABASE_URL` fica em `.env` (não versionado). Nesta máquina está como **caminho absoluto**:

```
DATABASE_URL="file:C:/Users/fabio/OneDrive/Área de Trabalho/Claude/mywallet-nextjs/dev.db"
```

> ⚠️ **Por que caminho absoluto, e não `file:./dev.db`?** O ambiente de preview usado durante o desenvolvimento inicia o servidor com o diretório de trabalho (`cwd`) na pasta *pai* do projeto, não em `mywallet-nextjs/`. Com caminho relativo, o Prisma acabava criando um `dev.db` vazio no lugar errado. Se um dia o app disser "table does not exist" do nada, comece checando se `DATABASE_URL` está resolvendo para o arquivo certo — não é necessariamente um problema de schema. Em produção (deploy normal, sem esse workaround), um caminho relativo funcionaria normalmente.

## Que dados moram no SQLite vs. o que é mockado

Nem todo dado que a UI mostra vem do banco. Dados que em um app real viriam de **provedores externos** (cotações de mercado, câmbio, etc.) são simulados por módulos dedicados, não persistidos:

| Dado | Onde vive | Por quê |
|---|---|---|
| Wallets, Assets (qty/avg), Goals, Articles, Users, Transactions, Team Members, Promotions, tokens de recuperação de senha, resultados do teste de perfil | **SQLite** (tabelas abaixo) | Registros de negócio reais, criados/editados pelo usuário |
| Preço atual de cada ativo (`price`) | `src/mocks/external/quotes.ts` | Em produção viria de uma API de cotações em tempo real |
| Câmbio (USD/EUR/GBP/CAD) | `src/mocks/external/rates.ts` | Em produção viria de uma API de câmbio |
| Série histórica do gráfico de performance + benchmark (Ibovespa) | `src/mocks/external/performance.ts` | Em produção viria de um provedor de dados de mercado |
| Recomendações de analistas (widget da página de notícias) | `src/mocks/external/analystCalls.ts` | Simula um feed de research de terceiros |
| E-mail transacional (link de recuperação de senha) | `src/mocks/external/emailProvider.ts` | Em produção viria de um provedor de e-mail transacional (SES, SendGrid, etc.) — a `PasswordResetToken` (dado real, ver abaixo) é o que a aplicação de fato controla |

Essas rotas expõem os mocks "externos" como se fossem uma API de mercado: `GET /api/market/rates`, `GET /api/market/performance`, `GET /api/market/analyst-calls`. O preço (`price`) de cada `Asset` é calculado e mesclado dentro das rotas `/api/wallets*` (ver `getQuote(ticker, avgCost)`), nunca gravado no banco.

## Tabelas

### `User`
Contas do sistema — tanto quem faz login quanto os usuários gerenciados na tela de Admin (é a mesma tabela).

| Campo | Tipo | Observação |
|---|---|---|
| `id` | String (PK) | ex.: `u1`, ou `u<timestamp>` para contas criadas via signup |
| `name` | String | |
| `email` | String (único) | usado para login |
| `passwordHash` | String | `"<saltHex>:<hashHex>"` gerado com scrypt — **nunca** a senha em texto puro |
| `role` | String | `"Investor"` \| `"Analyst"` \| `"Administrator"` (SQLite não suporta enum nativo no Prisma, então é validado na camada TS) |
| `status` | String | `"Active"` \| `"Suspended"` \| `"Pending"` |
| `perms` | String | texto livre exibido na tabela de admin (não é a fonte de verdade das permissões — essas ficam só no client, ver `AdminContext`) |
| `since` | String | ex.: `"Mar 2024"` |
| `lastAccess` | String | ex.: `"2026-08-11"` |
| `accountType` | String | `"Individual"` (padrão) \| `"Institutional"` — segmento de cliente, independente de `role` e do plano de assinatura. Controla só o acesso ao módulo `institutional/` (ver `useInstitutionalAccess`) |

Relação: um `User` tem várias `ActivityEntry` (`onDelete: Cascade`).

### `ActivityEntry`
Feed de atividade exibido na tela de detalhe do usuário (admin).

| Campo | Tipo |
|---|---|
| `id` | Int (PK, autoincrement) |
| `userId` | String (FK → `User.id`) |
| `text` | String |
| `when` | String |

### `Wallet`
| Campo | Tipo | Observação |
|---|---|---|
| `id` | String (PK) | ex.: `w1`, ou `w<timestamp>` |
| `name`, `kind`, `icon`, `tint`, `tintFg`, `created` | String | dados de exibição do card da carteira |

Relação: uma `Wallet` tem vários `Asset` (`onDelete: Cascade` — apagar a carteira apaga os ativos dela).

### `Asset`
Posição de um ativo dentro de uma carteira. **Não tem coluna de preço** — o preço atual é dado de mercado externo (ver tabela acima).

| Campo | Tipo | Observação |
|---|---|---|
| `id` | String (PK) | |
| `walletId` | String (FK → `Wallet.id`) | |
| `ticker`, `name` | String | |
| `type` | String | `"Stock"` \| `"Crypto"` \| `"ETF"` \| `"REIT"` |
| `qty`, `avg` | Float | quantidade e preço médio pago pelo usuário |

### `Goal`
| Campo | Tipo |
|---|---|
| `id` | String (PK) |
| `name` | String |
| `target`, `current` | Float |
| `due` | String |

### `Article`
Conteúdo publicado pelo analista no portal de notícias.

| Campo | Tipo | Observação |
|---|---|---|
| `id` | String (PK) | |
| `title`, `category`, `date`, `author`, `read`, `summary` | String | |
| `body` | String? | pode ser nulo (rascunhos às vezes não têm corpo ainda) |
| `views` | Int | |
| `status` | String | `"Published"` \| `"Draft"` |

### `Transaction`
Ledger histórico de operações. CRUD completo pela tela `/transactions` (ver [`3 - CRUD.md`](3%20-%20CRUD.md#33-transaction--só-tinha-leitura--importação-em-lote)) — lançamento manual (`POST`/`PATCH`/`DELETE`) e importação em lote de swaps do feed simulado da corretora (`POST /api/transactions/import`).

| Campo | Tipo | Observação |
|---|---|---|
| `id` | String (PK) | |
| `date`, `asset`, `wallet`, `qty` | String | |
| `type` | String | `"Buy"` \| `"Sell"` \| `"Swap"` \| `"Deposit"` |
| `price`, `total` | Float | sinal de `total`: `Buy` negativo, `Sell`/`Deposit` positivo, `Swap` fica em `0` num lançamento manual (ver `3 - CRUD.md`) |
| `externalRef` | String? | id do registro de origem no feed da corretora externa quando a transação veio de lá (`api/transactions/import`); `null` para lançamentos manuais |

### `TeamMember`
Operadores com acesso delegado na mesa institucional (`institutional/`) — exclusivo de contas `accountType="Institutional"`. Tabela plana, sem FK para `User` (mesma simplificação que `Wallet`/`Goal` já usam hoje: um único conjunto de dados de demonstração compartilhado, não multi-tenant de verdade).

| Campo | Tipo | Observação |
|---|---|---|
| `id` | String (PK) | |
| `name`, `email` | String | |
| `roleInTeam` | String | `"Trader"` \| `"Compliance"` \| `"Viewer"` |
| `since` | String | |

### `PasswordResetToken`
Recuperação de senha (Req. 3): token único com validade, gerado em
`POST /api/auth/forgot-password` e consumido (`usedAt` preenchido) em
`POST /api/auth/reset-password`. Não tem tela própria de CRUD — é
manipulado só pelas duas rotas acima, nunca listado/editado manualmente.

| Campo | Tipo | Observação |
|---|---|---|
| `id` | String (PK) | |
| `userId` | String (FK → `User.id`, `onDelete: Cascade`) | |
| `token` | String (único) | valor bruto enviado por e-mail; o e-mail em si é simulado (`src/mocks/external/emailProvider.ts`) |
| `expiresAt` | String | ISO datetime — token expira 30 minutos após a criação |
| `usedAt` | String? | preenchido no primeiro uso; um token usado não é aceito de novo |
| `createdAt` | String | |

### `InvestorProfileResult`
Resultado do teste de perfil de investidor (Req. 6, `/quiz`). Cada tentativa
("realizar" ou "refazer o teste") grava uma **linha nova**, preservando o
histórico — não é um `upsert` sobre um resultado único por usuário.

| Campo | Tipo | Observação |
|---|---|---|
| `id` | String (PK) | |
| `userId` | String (FK → `User.id`, `onDelete: Cascade`) | |
| `score` | Int | 0–100 |
| `profileKey` | String | `"Conservative"` \| `"Moderate"` \| `"Aggressive"` — decidido por `quiz/profileStrategy.ts` (Strategy, ver `2 - DESIGN_PATTERNS.md`) |
| `answers` | String | respostas selecionadas, serializadas em JSON |
| `completedAt` | String | |

### `Promotion`
Promoção por tempo determinado sobre um plano de assinatura
(`Standard`/`Platinum`/`Black`), cadastrada por um atendente/administrador.
CRUD completo pela tela `/promotions` (exclusiva do papel admin) — detalhe
completo em [`3 - CRUD.md`](3%20-%20CRUD.md#4-crud-novo--promotion).

| Campo | Tipo | Observação |
|---|---|---|
| `id` | String (PK) | |
| `planName` | String | `"Standard"` \| `"Platinum"` \| `"Black"` — por nome, não FK: não existe tabela `Plan` própria (planos são estáticos em `src/modules/plans/data.ts`), mesma simplificação de `Transaction.wallet` |
| `title`, `description` | String | |
| `discountPct` | Float | validado entre 1 e 100 |
| `startsAt`, `endsAt` | String | vigência da promoção; `endsAt >= startsAt` validado na API |
| `active` | Boolean (default `true`) | permite desativar manualmente antes do fim da vigência |
| `createdBy` | String | id do `User` que cadastrou |

## Senhas e autenticação

Hash com **scrypt** (`node:crypto`, sem dependência externa), implementado em [`src/lib/password.ts`](../src/lib/password.ts):

- `hashPassword(senha)` → gera salt aleatório de 16 bytes + deriva a chave, retorna `"saltHex:hashHex"`.
- `verifyPassword(senha, hashArmazenado)` → deriva a chave com o mesmo salt e compara com `timingSafeEqual` (evita *timing attacks*).
- `POST /api/auth/login` sempre roda `verifyPassword` (mesmo quando o e-mail não existe, contra um hash “dummy”) para que uma tentativa com e-mail inexistente e uma com senha errada levem aproximadamente o mesmo tempo — evita vazar por timing se o e-mail está cadastrado.
- A mensagem de erro é sempre genérica: **"Invalid email or password."** (nunca diz qual dos dois está errado).

### Credenciais de demonstração (seed)

Toda conta populada pelo seed usa a mesma senha, só para facilitar testes locais:

| E-mail | Papel | Senha |
|---|---|---|
| ana.souza@mywallet.io | Investor | `demo1234` |
| rafael.prado@mywallet.io | Analyst | `demo1234` |
| marcos.lima@mywallet.io | Administrator | `demo1234` |
| carla.mendes@mywallet.io | Investor, **accountType Institutional** — única conta com acesso à mesa institucional | `demo1234` |
| (+ 5 outras contas de exemplo, mesma senha) | Investor/Analyst | `demo1234` |

Contas criadas pela tela de cadastro (`/signup`) usam a senha escolhida pelo usuário, com hash real — nada de senha fixa aí.

## Limitações conhecidas (de propósito, para não inflar o escopo do protótipo)

- **Sessão não persiste em cookie/JWT.** O login é validado de verdade no servidor, mas o estado de "logado" fica só em memória no React (`SessionContext`) — um F5 na página derruba a sessão e volta pro login. Se precisar de sessão persistente entre reloads, isso pediria um próximo passo (cookie httpOnly + JWT, ou algo como NextAuth/Lucia).
- **"Esqueci minha senha"** (`/forgot-password`, `/reset-password`) já é real do lado do banco — gera e valida um `PasswordResetToken` de verdade, grava a nova senha com `hashPassword` (ver "Senhas e autenticação" abaixo). O único mock nesse fluxo é o **envio do e-mail** (`src/mocks/external/emailProvider.ts`, simula um provedor tipo SES/SendGrid); por isso a resposta da API devolve o token (`devToken`) direto, só para este protótipo conseguir montar um link funcional sem uma caixa de e-mail real.
- **Permissões granulares** do admin (toggles de "Publicar notícias", "Moderar", etc.) continuam só no client, não persistidas — o `role` (Investor/Analyst/Administrator) é o único controle de acesso real hoje.
- **`TeamMember`, `PasswordResetToken`, `InvestorProfileResult` e `Promotion`** dependem de rodar `npm run db:generate` num ambiente com acesso de rede a `binaries.prisma.sh` antes de funcionar — ver [`3 - CRUD.md`](3%20-%20CRUD.md#6-descoberta-e-correção-de-um-desalinhamento-no-schema-do-prisma) para o que aconteceu e o que falta.
