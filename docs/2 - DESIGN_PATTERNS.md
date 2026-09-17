# Design patterns aplicados ao MyWallet

Este documento resume os padrões de projeto codificados no repositório: onde cada
exemplo foi aplicado e por que aquele ponto do código pedia aquele padrão.

Cada exemplo, nos três padrões, resolve um problema de duplicação **real e
diferente** dos outros exemplos do mesmo padrão — não é a mesma solução copiada
3 vezes. Os comentários dentro do código marcam isso explicitamente
(`SINGLETON — exemplo 1 de 2`, `TEMPLATE METHOD — exemplo 2 de 3`, etc.).

## 1. Singleton (2 exemplos)

**O problema que resolve:** garantir que exista **uma única instância** de algo que
não deveria (ou não pode, por custo/estado) ser recriado à toa, e dar um ponto único
de acesso a ela.

### Exemplo 1 de 2 — `src/server/prisma.ts` — `PrismaSingleton`
- **Onde:** cliente do banco de dados (Prisma), usado por praticamente todas as rotas
  de API (`wallets`, `goals`, `transactions`, `users`, `team`, `articles`...).
- **Por quê:** cada `PrismaClient` abre seu próprio pool de conexões com o SQLite.
  Em desenvolvimento o Next.js recarrega módulos a cada save (hot reload) — sem uma
  instância única guardada fora do ciclo de módulos, o cliente seria recriado a cada
  recarregamento. A mudança tornou essa garantia **explícita**: construtor privado +
  `getInstance()` estático.
- **O que mudou:** comportamento idêntico ao original; `export const prisma` continua
  funcionando para todos os arquivos que já o importavam.

### Exemplo 2 de 2 — `src/server/repositories/marketDataGateway.ts` — `MarketDataGateway` (novo)
- **Onde:** acesso aos 4 provedores externos simulados (cotações, câmbio, histórico
  de performance, recomendações de analistas), usados por 6 rotas de API diferentes.
- **Por quê:** cada rota importava um mock diferente diretamente. Quando esses mocks
  forem substituídos por chamadas reais a uma API de mercado, existe agora **um
  único lugar** para adicionar autenticação, cache ou retry.
- **O que mudou:** as 6 rotas passaram a chamar `MarketDataGateway.getInstance().getX()`.
  O JSON devolvido é o mesmo de antes.

## 2. Template Method (3 exemplos — 3 domínios diferentes)

**O problema que resolve:** quando um **algoritmo de vários passos, em uma ordem
fixa**, se repete em mais de um lugar, mudando só alguns passos — em vez de copiar o
algoritmo inteiro, ele é escrito uma vez numa classe-base, e cada subclasse
implementa só o que varia.

### Exemplo 1 de 3 — `src/services/apiResourceLoader.ts` — leitura de dados externos (client-side)
- **Algoritmo fixo:** buscar o endpoint → extrair o dado útil da resposta.
- **Subclasses:** `CurrencyRatesLoader` (`useCurrencyRates.ts`), `MarketSeriesLoader`
  (`useMarketSeries.ts`), `AnalystCallsLoader` (`useAnalystCalls.ts`).
- **Por quê:** os três hooks tinham o mesmo `useEffect` (fetch → `setState` →
  `setLoading(false)`), mudando só a URL e o formato da resposta.

### Exemplo 2 de 3 — `src/server/controllers/validatedCreateHandler.ts` — criação validada (server-side)
- **Algoritmo fixo:** ler o corpo da requisição → validar campos → se inválido,
  responder 400 → persistir no banco → responder com a entidade criada.
- **Subclasses:** `CreateGoalHandler` (`api/goals/route.ts`), `CreateTeamMemberHandler`
  (`api/team/route.ts`).
- **Por quê:** as duas rotas `POST` tinham o mesmo formato — objeto de erros por
  campo, 400 se houver algum, senão criar via Prisma e devolver a entidade. Domínio
  diferente do exemplo 1: aqui o passo fixo é "validar antes de gravar", não "ler
  dados de fora".
- **Depois da reorganização em Controller/Service/Repository** (ver
  `PROJECT_STRUCTURE.md`): `validate()` e `persist()` de cada subclasse passaram a
  chamar o Service do recurso (`goalService.validate`/`.create`,
  `teamMemberService.validate`/`.create`, ...) em vez de montar o objeto de erros e
  chamar o Prisma ali mesmo — a sequência `parse → validate → persist → respond` do
  método-modelo não mudou em nada.

### Exemplo 3 de 3 — `src/services/formSubmitTemplate.ts` — envio de formulário (client-side)
- **Algoritmo fixo:** validar (passo opcional) → marcar "salvando" → chamar a API →
  se der erro, traduzir para algo exibível → desmarcar "salvando".
- **Subclasses:** `GoalFormSubmit` (`GoalFormModal.tsx`, com validação por campo),
  `WalletFormSubmit` (`WalletFormModal.tsx`, sem validação client-side, erro é uma
  mensagem única).
- **Por quê:** os dois modais repetiam o mesmo
  `try { await onSave(...) } catch { ... } finally { setSaving(false) }`. Domínio
  diferente dos outros dois: aqui é sobre o ciclo de vida de um formulário no
  navegador.

Em todos os três, a assinatura pública dos hooks/componentes que os usam não mudou —
nenhum código consumidor precisou ser alterado.

## 3. Strategy (3 exemplos — 3 domínios diferentes)

**O problema que resolve:** quando existem **variações de um mesmo comportamento**
escolhidas em tempo de execução — em vez de um `if/else`/ternário central que só
sabe comparar uma opção contra as outras, cada variação vira uma classe própria,
todas atrás da mesma interface.

### Exemplo 1 de 3 — `src/modules/plans/gating.ts` — o que cada plano de assinatura libera
- **Interface:** `PlanPolicy`.
- **Estratégias:** `StandardPlanPolicy` (até 2 carteiras, metas/transações
  bloqueadas, 12 meses, só USD), `PlatinumPlanPolicy` (ilimitado, tudo liberado,
  24 meses, todas as moedas), `BlackPlanPolicy` (herda o Platinum; ponto de extensão
  para regras exclusivas do Black).
- **Por quê:** a versão anterior de `usePlanGating` comparava só
  `plan === "Standard"`, tratando Platinum e Black como idênticos.
- **O que mudou:** `usePlanGating()` devolve o mesmo formato de antes — as 5 páginas
  que o consomem não precisaram mudar.

### Exemplo 2 de 3 — `src/modules/quiz/profileStrategy.ts` — qual perfil de investidor o score do teste indica
- **Interface:** `InvestorProfileStrategy`.
- **Estratégias:** `ConservativeProfileStrategy` (score < 40), `ModerateProfileStrategy`
  (40–69), `AggressiveProfileStrategy` (≥ 70).
- **Por quê:** a regra era um encadeamento de ternários dentro do `useMemo` do
  `QuizContext`. Domínio totalmente diferente do exemplo 1: aqui a variação é sobre
  classificar uma pontuação, não sobre o que uma assinatura libera.
- **O que mudou:** `QuizContext` chama `resolveInvestorProfile(score)`; `profileKey`
  e `profile` continuam com o mesmo formato — `quiz/result/page.tsx` não mudou.

### Exemplo 3 de 3 — `src/modules/institutional/reportExportStrategy.ts` — como serializar o relatório consolidado
- **Interface:** `ReportExportStrategy`.
- **Estratégias:** `CsvReportExportStrategy` (linhas separadas por vírgula),
  `PdfReportExportStrategy` (layout de texto corrido).
- **Por quê:** os botões "Export CSV" / "Export PDF" chamavam a mesma função
  `exportFacade(kind)`, que só trocava a palavra no toast — não existia lógica por
  formato. Domínio diferente dos outros dois: aqui a variação é sobre como
  serializar dados, não sobre planos nem sobre classificação de perfil.
- **O que mudou:** a tela de relatórios (`institutional/reports/page.tsx`) agora
  monta o payload de fato antes de mostrar o toast, usando a estratégia escolhida
  pelo botão clicado.

## Resumo rápido (onde / por quê)

| Padrão | Exemplo | Onde | Domínio |
|---|---|---|---|
| Singleton 1/2 | `PrismaSingleton` | `src/server/prisma.ts` | conexão única de banco |
| Singleton 2/2 | `MarketDataGateway` | `src/server/repositories/marketDataGateway.ts` (6 rotas) | provedores externos |
| Template Method 1/3 | `ApiResourceLoader` | `src/services/apiResourceLoader.ts`, usado por hooks de `plans`, `performance`, `news` | leitura de dados externos |
| Template Method 2/3 | `ValidatedCreateHandler` | `src/server/controllers/validatedCreateHandler.ts`, usado por `api/goals`, `api/team` (entre outros) | criação validada no servidor |
| Template Method 3/3 | `FormSubmitTemplate` | `src/services/formSubmitTemplate.ts`, usado por `GoalFormModal`, `WalletFormModal` | envio de formulário |
| Strategy 1/3 | `PlanPolicy` | `src/modules/plans/gating.ts` | o que o plano libera |
| Strategy 2/3 | `InvestorProfileStrategy` | `src/modules/quiz/profileStrategy.ts` | classificação do score do quiz |
| Strategy 3/3 | `ReportExportStrategy` | `src/modules/institutional/reportExportStrategy.ts` | formato de exportação |

## Verificação feita

- `npx tsc --noEmit`: nenhum erro novo nos arquivos tocados (os erros existentes em
  `prisma/seed.ts`, `api/team/route.ts`/`api/team/[id]/route.ts` e
  `api/auth/login/route.ts` são pré-existentes, ligados a um desalinhamento do
  schema do Prisma — `teamMember` e `accountType` não existem no client gerado — e
  não têm relação com esta mudança).
- `npx eslint` em todos os arquivos criados/alterados: sem avisos.
