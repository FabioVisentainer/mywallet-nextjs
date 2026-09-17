# Design system — MyWallet

Todos os componentes visuais reutilizáveis vivem em `src/design-system/`, separado do módulo `core` (que guarda o shell do app — Sidebar, Topbar, Modal — ver [`PROJECT_STRUCTURE.md`](./PROJECT_STRUCTURE.md)) — qualquer módulo de feature pode importar daqui, e o design system não depende de nenhum módulo de feature.

Antes deste componentizado, cada tela reimplementava do zero os mesmos botões, badges, cards e campos de formulário com classes Tailwind inline — cada uma com uma variação ligeiramente diferente de altura, cor ou borda. Este documento é o catálogo do que existe agora e quando usar cada peça.

## Tokens de design

Definidos como CSS custom properties em [`src/app/globals.css`](../src/app/globals.css) (bloco `@theme inline`). Nenhum componente usa cor hexadecimal direto — sempre `var(--color-*)`.

| Grupo | Tokens | Uso |
|---|---|---|
| Marca | `--color-brand` (#2563EB), `--color-brand-hover`, `--color-brand-soft`, `--color-brand-soft-bg`, `--color-brand-soft-border` | Botões primários, links, destaques |
| Navy (sidebar/hero) | `--color-ink` (#111A2B), `--color-ink-2`, `--color-ink-border`, `--color-ink-muted*` | Sidebar, hero de login, cards escuros |
| Superfície | `--color-surface`, `--color-card`, `--color-card-alt`, `--color-border`, `--color-border-2`, `--color-border-3` | Fundos e bordas neutras |
| Texto | `--color-text`, `--color-text-muted`, `--color-text-muted-2/3`, `--color-text-faint` | Hierarquia tipográfica |
| Semânticas | `--color-success*`, `--color-danger*`, `--color-warning*`, `--color-purple*` | Estados (sucesso, erro, aviso) e a categoria "Crypto/Analyst" |

Tipografia: **Manrope** (`--font-manrope`, texto geral) e **Azeret Mono** (`--font-azeret-mono`, todo valor numérico — preços, percentuais, datas ISO). Regra: qualquer número monetário ou percentual usa `font-mono`.

## Componentes

### `Button`
`src/design-system/Button.tsx`

O botão universal. Renderiza `<button>` normalmente, ou vira um `next/link` estilizado igual quando você passa `href` (para CTAs de navegação) — assim uma tela nunca precisa escolher entre "botão" e "link estilizado de botão".

```tsx
<Button onClick={save}>Save wallet</Button>
<Button href="/plans" variant="secondary">Compare plans</Button>
<Button variant="danger" size="sm" disabled={saving}>Delete</Button>
```

| Prop | Valores | Padrão |
|---|---|---|
| `variant` | `primary` \| `secondary` \| `danger` \| `dangerSolid` \| `ghost` | `primary` |
| `size` | `xs` (30px, ações em linha de tabela) \| `sm` (36px) \| `md` (44px) \| `lg` (46px, CTAs de autenticação) | `md` |
| `fullWidth` | `boolean` | — |
| `href` | `string` — quando presente, renderiza como link | — |

Todo o resto (`onClick`, `disabled`, `type`, `style`...) são as props nativas de `<button>` quando `href` não é passado.

### `Badge`
`src/design-system/Badge.tsx`

Pílula pequena para status, papéis e categorias.

```tsx
<Badge tone="success">Active</Badge>
<Badge tone="brand" uppercase>Equities</Badge>
<Badge style={{ background: c.bg, color: c.fg }}>{c.rating}</Badge>
```

`tone`: `brand` \| `success` \| `danger` \| `warning` \| `purple` \| `neutral` (padrão) \| `dark`. Quando as cores não se encaixam em nenhum tone (ex.: cor por-linha vinda de dados, como o rating de uma recomendação), passe `style` diretamente — ele sobrescreve o `tone`.

### `Card`
`src/design-system/Card.tsx`

O contêiner branco com borda arredondada usado em quase toda tela — cards de estatística, linhas de lista, painéis de formulário.

```tsx
<Card>...</Card>
<Card padding="p-0" className="overflow-hidden">...</Card> {/* tabelas, onde o cabeçalho precisa colar na borda */}
```

### `StatCard`
`src/design-system/StatCard.tsx`

Especialização de `Card` para o padrão "label + valor grande + variação": `<StatCard label="Market value" value={usd(x)} color={posColor(x)} />`.

### `Alert`
`src/design-system/Alert.tsx`

Banner de ícone + mensagem — erro de validação de formulário, aviso de plano bloqueado.

```tsx
<Alert>{error}</Alert> {/* tone="danger" por padrão */}
<Alert tone="warning" title="Hierarchy restriction.">Administrators cannot...</Alert>
<Alert tone="brand" action={<Button size="sm">Upgrade</Button>}>Standard charts go back 12 months.</Alert>
```

`tone`: `danger` (padrão) \| `warning` \| `brand` \| `success`. `icon` aceita um SVG customizado (o padrão é um "!" circular). Banners com layout muito específico (ex.: o aviso de limite de carteiras, com ícone quadrado de 38px) continuam com markup próprio — nem todo banner precisa forçar o `Alert`.

### `Input`, `Select`, `Textarea`, `Checkbox`
`src/design-system/{Input,Select,Textarea,Checkbox}.tsx`, construídos sobre `FieldShell.tsx`

Campos de formulário com label, texto de erro e borda vermelha consistentes. Antes desses componentes, cada formulário reimplementava as mesmas funções `bc()`/`bg()` para decidir a cor da borda com base em erro — eram 6 cópias quase idênticas espalhadas pelo app.

```tsx
<Input label="Ticker" required value={form.ticker} onChange={...} error={errors.ticker} mono />
<Select label="Asset class" value={form.type} onChange={...}>
  <option value="Stock">Stock</option>
</Select>
<Textarea label="Summary" required rows={2} error={errors.summary} hint={<div>...</div>} />
<Checkbox label="I accept the terms..." checked={form.terms} onChange={...} error={errors.terms} />
```

Props comuns a `Input`/`Select`/`Textarea`: `label`, `required` (mostra `*` vermelho), `error` (string — mostra a mensagem embaixo do campo e deixa a borda vermelha), `hint` (nó extra abaixo, ex. "Strong password." em verde). `Input` também tem `mono` (usa a fonte monoespaçada — tickers, valores, CPF).

`Input` também aceita `invalid` (boolean): deixa a borda vermelha **sem** mostrar texto de erro embaixo — útil quando um `Alert` já explica o erro uma vez para o formulário inteiro (ex.: a tela de login, onde e-mail e senha ficam vermelhos mas a mensagem "Invalid email or password." aparece uma vez só, acima).

### `ProgressBar`
`src/design-system/ProgressBar.tsx`

Barra de progresso — usada em metas financeiras, no teste de perfil e na alocação sugerida.

```tsx
<ProgressBar value={71} />                          {/* 0–100 */}
<ProgressBar value={p} color={barColor} height="h-[9px]" />
```

### Componentes que continuam fora do sistema (de propósito)

Nem todo padrão visual repetido virou componente — força um padrão em um componente genérico só vale a pena quando ele realmente se repete igual em vários lugares. Ficaram como markup próprio, por exemplo:

- Os chips de filtro interativos (categorias de notícias, tipos de transação, filtros de papel no admin) — são toggles com estado próprio, não um "badge" estático.
- O banner de limite de carteiras (`/wallets`) e o card de plano (`/plans`) — cada um tem uma combinação única de ícone, cor e CTA que não se repete em nenhum outro lugar.

Se um desses padrões passar a aparecer em 3+ lugares, é sinal de que merece virar um componente novo aqui.

## Onde cada componente é usado hoje

| Componente | Telas |
|---|---|
| `Button` | Praticamente todas — login, cadastro, wallets, goals, news, analyst, admin, plans, performance, quiz, institutional |
| `Badge` | Admin (papel/status), analyst studio (status do artigo), news (categoria), transactions (tipo), goals (status), plans (ribbons), quiz (perfil), institutional (papel do operador) |
| `Card` | Todas as telas do app autenticado |
| `StatCard` | Dashboard, detalhe de carteira, performance, relatório consolidado (institutional) |
| `Alert` | Login, cadastro, formulário de ativo, formulário de artigo, esqueci/redefinir senha, detalhe de usuário (admin), performance, institutional (bloqueio de acesso + aviso de exclusividade) |
| `Input`/`Select`/`Textarea`/`Checkbox` | Login, cadastro, esqueci/redefinir senha, formulário de carteira, formulário de ativo, formulário de meta, formulário de artigo, formulário de operador (institutional) |
| `ProgressBar` | Dashboard (metas), goals, quiz, resultado do quiz |

`institutional/` (mesa institucional, exclusiva de clientes `accountType="Institutional"`) não introduz nenhum componente visual novo — reaproveita 100% do catálogo acima, incluindo o padrão de tela de bloqueio (`Alert` tone `warning`) que já existia implicitamente em `LockedFeature`.
