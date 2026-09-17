# CRUD completo — MyWallet

Catálogo dos CRUDs (Create/Read/Update/Delete) do projeto: quais entidades expõem
as quatro operações, onde vive a rota de API e a tela de cada uma, e quais tabelas
do banco existem mas **não** são CRUD de propósito (histórico, log, token — nunca
editadas/apagadas pelo usuário). Ver também [`DATABASE.md`](./DATABASE.md) para o
schema completo de cada tabela, [`2 - DESIGN_PATTERNS.md`](2%20-%20DESIGN_PATTERNS.md)
para os padrões reaproveitados nas rotas e formulários (`ValidatedCreateHandler`,
`FormSubmitTemplate`), e [`PROJECT_STRUCTURE.md`](./PROJECT_STRUCTURE.md) para a
convenção de módulo/rota que todo CRUD do projeto segue.

## 1. O que conta como "CRUD completo" aqui

Não basta o model existir no `schema.prisma` — para contar como completo neste
catálogo, a entidade precisa expor as quatro operações **por rota de API** e ter
as quatro **alcançáveis pela UI** (criar, listar/ver, editar e excluir a partir de
uma tela, não só via Prisma Studio):

| Operação | Verbo HTTP | Onde mora |
|---|---|---|
| Create | `POST` | `/api/<recurso>` |
| Read | `GET` | `/api/<recurso>` (lista) e/ou `/api/<recurso>/[id]` (item) |
| Update | `PATCH` | `/api/<recurso>/[id]` |
| Delete | `DELETE` | `/api/<recurso>/[id]` |

## 2. Panorama geral

| Recurso | GET | POST | PATCH | DELETE | Módulo | Tela |
|---|---|---|---|---|---|---|
| `Wallet` / `Asset` | ✓ | ✓ | ✓ | ✓ | [`src/modules/wallets/`](../src/modules/wallets) | `/wallets`, `/wallets/[id]` |
| `Goal` | ✓ | ✓ | ✓ | ✓ | [`src/modules/goals/`](../src/modules/goals) | `/goals` |
| `Article` | ✓ | ✓ | ✓ | ✓ | [`src/modules/news/`](../src/modules/news) (analyst) | `/analyst`, `/analyst/new`, `/analyst/[id]` |
| `TeamMember` | ✓ | ✓ | ✓ | ✓ | [`src/modules/institutional/`](../src/modules/institutional) | `/institutional` |
| `User` | ✓ | ✓ | ✓ | ✓ | [`src/modules/admin/`](../src/modules/admin) | `/admin`, `/admin/[id]` |
| `Transaction` | ✓ | ✓ | ✓ | ✓ | [`src/modules/transactions/`](../src/modules/transactions) | `/transactions` |
| `Promotion` | ✓ | ✓ | ✓ | ✓ | [`src/modules/promotions/`](../src/modules/promotions) | `/promotions` |

Os sete recursos de domínio do projeto têm CRUD completo. A seção 4 lista as
tabelas do banco que ficam de fora deste catálogo de propósito — não por
estarem incompletas, mas por não serem CRUDs no sentido do requisito (histórico
de tentativas, log de atividade, token de uso único).

## 3. CRUDs por recurso

### 3.1 `Wallet` / `Asset`

Duas entidades relacionadas (`Wallet 1—N Asset`, ver
[`DATABASE.md`](./DATABASE.md#wallet)), CRUD completo em rotas separadas por
serem agregados diferentes: uma carteira pode existir sem ativos, mas todo
ativo pertence a exatamente uma carteira.

| Operação | Rota |
|---|---|
| Listar carteiras | `GET /api/wallets` |
| Criar carteira | `POST /api/wallets` |
| Editar / excluir carteira | `PATCH` / `DELETE /api/wallets/[id]` |
| Adicionar ativo a uma carteira | `POST /api/wallets/[id]/assets` |
| Editar / excluir ativo | `PATCH` / `DELETE /api/wallets/[id]/assets/[assetId]` |

UI: `/wallets` (lista + criação), `/wallets/[id]` (detalhe, ativos da
carteira), `/wallets/[id]/assets/new` e `/wallets/[id]/assets/[assetId]`
(formulários dedicados — ver a nota sobre essas telas serem "finas" em
[`PROJECT_STRUCTURE.md`](PROJECT_STRUCTURE.md#o-que-realmente-fica-em-app-vs-em-modules)).
Bloqueado por plano: Standard tem limite de carteiras (ver
[`1 - ARCHITECTURE_PERSONALIZATION.md`](1%20-%20ARCHITECTURE_PERSONALIZATION.md)).

### 3.2 `Goal`

CRUD simples, sem entidade filha. `POST` usa `CreateGoalHandler extends
ValidatedCreateHandler` (ver [`2 - DESIGN_PATTERNS.md`](2%20-%20DESIGN_PATTERNS.md)).
UI: `/goals`, tela inteira vira paywall (`LockedFeature`) no plano Standard.

| Operação | Rota |
|---|---|
| Listar / criar | `GET` / `POST /api/goals` |
| Editar / excluir | `PATCH` / `DELETE /api/goals/[id]` |

### 3.3 `Article`

Editor de conteúdo do papel **Analyst** — único CRUD do projeto que não é
gestão de dados financeiros, e sim autoria de conteúdo (`status`:
`Published`/`Draft`). UI: `/analyst` (lista), `/analyst/new` (criação),
`/analyst/[id]` (edição).

| Operação | Rota |
|---|---|
| Listar / criar | `GET` / `POST /api/articles` |
| Ver / editar / excluir | `GET` / `PATCH` / `DELETE /api/articles/[id]` |

### 3.4 `TeamMember`

Exclusivo do módulo institucional (`accountType = "Institutional"`, ver
[`1 - ARCHITECTURE_PERSONALIZATION.md`](1%20-%20ARCHITECTURE_PERSONALIZATION.md)).
Tabela plana, sem FK de dono — mesma simplificação de dataset único
compartilhado que `Wallet`/`Goal` já usam. `PATCH` e `POST` compartilham a
mesma validação (nome obrigatório, e-mail com `@`, `roleInTeam` dentro de
`Trader`/`Compliance`/`Viewer`); o formulário de criação e edição é o mesmo
componente (`AddMemberModal`, com `FormSubmitTemplate`).

| Operação | Rota |
|---|---|
| Listar / criar | `GET` / `POST /api/team` |
| Editar / excluir | `PATCH` / `DELETE /api/team/[id]` |

UI: `/institutional` — botões **Edit** e **Remove** por linha.

### 3.5 `User`

Dois caminhos de criação distintos, propositalmente separados:

- `POST /api/auth/signup` — autoatendimento (a própria pessoa cria a própria
  conta como Investor, com checagem de watchlist AML/KYC).
- `POST /api/users` — criação **administrativa**, feita por um Administrator
  pela tela de gestão (`CreateUserHandler extends ValidatedCreateHandler`;
  mesmas regras de e-mail/senha do signup, sem a checagem de watchlist —
  quem cria é um administrador de dentro do sistema, não um desconhecido).
  Senha rotulada como "temporária": o MyWallet não a envia por e-mail, quem
  cria compartilha por outro canal.

| Operação | Rota |
|---|---|
| Listar | `GET /api/users` |
| Criar (administrativo) | `POST /api/users` |
| Ver / editar / excluir | `GET` / `PATCH` / `DELETE /api/users/[id]` |

UI: `/admin` (lista + botão **+ New user**), `/admin/[id]` (edição de
permissões granulares).

### 3.6 `Transaction`

Duas formas de entrada: lançamento manual (este CRUD) e importação em lote do
feed simulado da corretora (`POST /api/transactions/import`, fora do escopo
deste catálogo — não segue o formato de `ValidatedCreateHandler`, é um
processo em lote). `total` segue uma convenção de sinal: `Buy` debita
(negativo), `Sell`/`Deposit` creditam (positivo), `Swap` manual mantém
`total = 0` — a importação de swap calcula o total real de câmbio, o
lançamento manual não tenta reproduzir isso (ver
[`DATABASE.md`](./DATABASE.md#transaction)).

| Operação | Rota |
|---|---|
| Listar / criar | `GET` / `POST /api/transactions` |
| Editar / excluir | `PATCH` / `DELETE /api/transactions/[id]` |
| Importar em lote (não é CRUD manual) | `POST /api/transactions/import` |

UI: `/transactions` — botão **+ New transaction**, colunas **Edit**/**Delete**.
Bloqueado por plano (ver
[`1 - ARCHITECTURE_PERSONALIZATION.md`](1%20-%20ARCHITECTURE_PERSONALIZATION.md)).

### 3.7 `Promotion`

Promoções por tempo determinado sobre um plano de assinatura
(`Standard`/`Platinum`/`Black`), cadastradas por um atendente/administrador.
`planName` referencia o plano **por nome**, não por FK — não existe uma
tabela `Plan` própria, os planos são definidos estaticamente em
`src/modules/plans/data.ts`, mesma simplificação que `Transaction.wallet` já
usa (ver [`DATABASE.md`](./DATABASE.md#promotion) para o schema completo).

| Operação | Rota |
|---|---|
| Listar / criar | `GET` / `POST /api/promotions` |
| Editar / excluir | `PATCH` / `DELETE /api/promotions/[id]` |

`POST`/`PATCH` via `CreatePromotionHandler extends ValidatedCreateHandler`:
plano dentro do conjunto conhecido, título/descrição não vazios, desconto
entre 1–100%, `endsAt >= startsAt`; `PATCH` também aceita alternar só o
campo `active` (usado pelo botão Deactivate/Reactivate sem reabrir o
formulário). UI: `/promotions`, item de menu exclusivo do papel **admin**
(ver `nav.ts`). Cada card mostra um **status calculado** a partir de
`startsAt`/`endsAt`/`active` — não é uma coluna no banco: `Scheduled`,
`Active`, `Expired` ou `Deactivated`.

## 4. Tabelas que não são CRUD de propósito

Existem no banco (ver [`DATABASE.md`](./DATABASE.md)) mas não entram no
catálogo acima porque o usuário nunca edita ou apaga um registro seu — são
histórico, log ou token de uso único:

| Tabela | Por que não é CRUD | Operações reais |
|---|---|---|
| `ActivityEntry` | log de atividade da conta — append-only | só `POST` (interno, ao registrar uma ação) |
| `InvestorProfileResult` | histórico de tentativas do teste de perfil — cada "refazer o teste" grava um novo registro, nenhum é editado/apagado | `GET` (histórico) + `POST` (nova tentativa) |
| `PasswordResetToken` | token de uso único, consumido (`usedAt`) ou expira sozinho — nunca editado pelo usuário | criado por `POST /api/auth/forgot-password`, consumido por `POST /api/auth/reset-password` |

## 5. Padrões reaproveitados

Todas as rotas `POST` deste catálogo (exceto `wallets/[id]/assets`, que ainda
usa o formato manual mais antigo) seguem `ValidatedCreateHandler`: ler corpo →
validar → 400 se inválido → persistir → responder com a entidade criada.
Todos os formulários de criação/edição da UI seguem `FormSubmitTemplate`.
Detalhe de cada exemplo e por que aquele ponto do código pedia o padrão em
[`2 - DESIGN_PATTERNS.md`](2%20-%20DESIGN_PATTERNS.md).

Por trás de cada rota, a validação e a regra de negócio (o `validate`/`persist`
de cada `ValidatedCreateHandler`, e a mesma validação reaproveitada pelo
`PATCH`) moram num Service de servidor (`src/server/services/`), que chama um
Repository (`src/server/repositories/`) — o único lugar que fala com o Prisma.
Ver "Arquitetura geral" em [`PROJECT_STRUCTURE.md`](./PROJECT_STRUCTURE.md)
para o diagrama completo dessa camada.
