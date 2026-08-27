# Padrão de Estrutura de Projeto (reaproveitável)

> Padrão de organização de projeto para ser reaproveitado em qualquer projeto novo Next.js/TypeScript da empresa, além de servir de referência para reorganizar um projeto existente que cresceu sem estrutura. A ideia é começar todo projeto novo com esta estrutura em vez de reinventar a organização de pastas a cada vez — cada projeto individual mantém depois seu próprio `docs/PROJECT_STRUCTURE.md` documentando os módulos reais que forem nascendo em cima deste padrão.

## 1. Stack de referência

Next.js (App Router) + TypeScript + banco via ORM/camada de acesso a dados + Tailwind (ou outra lib de estilo). O padrão de pastas abaixo não depende de nenhum desses itens especificamente — o que importa é o princípio da seção 2, que se aplica mesmo trocando o framework.

## 2. Princípio central: módulos por domínio, não por tipo de arquivo

A armadilha mais comum em projeto que cresce é organizar por **tipo técnico** (`components/`, `hooks/`, `contexts/`, `types/` na raiz, tudo misturado) — com 15 features, cada pasta dessas vira uma lista enorme sem relação visível entre os arquivos que pertencem à mesma funcionalidade.

O padrão aqui é o oposto: cada domínio de negócio (`billing`, `catalog`, `users`, o que for) é um **módulo autocontido**, com seu próprio estado, tipos e componentes dentro da própria pasta do módulo. `src/app/` (ou equivalente de rotas do framework) fica **só** com roteamento — cada arquivo de rota é fino e importa dos módulos, nunca contém lógica de negócio.

Regra de dependência entre módulos: **um módulo de feature só pode importar do módulo `core`, nunca de outro módulo de feature diretamente.** Se dois módulos precisam compartilhar algo, esse algo sobe pro `core`. Exceção só quando um domínio é literalmente uma extensão declarada de outro — nesse caso, documentar a exceção explicitamente no `docs/PROJECT_STRUCTURE.md` do projeto, para não virar acoplamento silencioso.

Por quê vale a pena: qualquer módulo pode em tese ser extraído/isolado sozinho (vender uma feature separada, quebrar em microsserviço, etc.) sem arrastar o projeto inteiro — a fronteira já existe desde o começo.

## 3. Estrutura de pastas padrão

```
src/
├── app/                        # só rotas — cada arquivo é fino, importa dos módulos
│   ├── (public)/                # grupo de rotas públicas (auth, marketing, etc.)
│   ├── (app)/                    # grupo de rotas autenticadas
│   └── api/                      # rotas de API, uma pasta por recurso
├── modules/
│   ├── core/                     # fundação: sessão, layout base, design system, formatação, contexts globais
│   ├── <dominio-1>/               # ex.: billing, catalog, users...
│   ├── <dominio-2>/
│   └── ...
├── mocks/                        # dados de exemplo/fake — nunca importado fora de seed e rotas de dev
│   ├── seed/                      # dados usados só pelo seed do banco
│   └── external/                   # simula serviço externo (API de terceiro) até ele existir de verdade
├── lib/                           # singletons e integrações técnicas: client do banco, client HTTP, helpers de baixo nível (hash, etc.)
└── generated/                     # código gerado por ferramenta (ORM, codegen) — nunca editado à mão, nunca versionado
```

## 4. Anatomia de um módulo de domínio

Todo módulo de domínio segue a mesma forma interna, o que faz o projeto ficar previsível — abrir qualquer módulo novo já dá pra adivinhar onde as coisas estão:

```
<dominio>/
├── types.ts               # tipos do domínio
├── <Dominio>Context.tsx    # estado (busca dado da API, expõe mutações) — se o módulo não tem mutação do usuário, um hook de busca simples (use<Dominio>.ts) substitui o Context
└── components/              # componentes visuais específicos deste domínio (formulários, modais, cards)
```

Módulo sem escrita do usuário (só leitura — um relatório, um extrato) não precisa de Context: um hook (`useInvoices`, `useReports`) que busca e expõe estado local já resolve, evitando Context desnecessário.

## 5. Design system (dentro do módulo `core`)

Todo componente visual reutilizável (botão, badge, card, campo de formulário, etc.) vive em `core/components/`, nunca duplicado dentro de um módulo de feature. Nenhuma tela reimplementa esses elementos com estilo inline — sempre importa do `core`. É assim que se evita o padrão clássico de 6 telas com um botão ligeiramente diferente cada uma, ou 6 cópias quase idênticas da mesma função de "borda vermelha quando tem erro" espalhadas pelo código.

Tokens de design (cor, espaçamento, tipografia) ficam centralizados como variáveis — CSS custom properties, tema do Tailwind, ou equivalente da stack usada — nunca como valor "cru" (hex de cor, `px` solto) direto no meio de um componente. Um componente sempre referencia o token, nunca o valor final.

O catálogo de componentes é documentado em `docs/DESIGN_SYSTEM.md`, um arquivo por projeto: para cada componente, as variantes/props aceitas, um exemplo de uso em código, e — quando o catálogo crescer — uma tabela de "onde é usado hoje" (ajuda a medir o impacto de alterar um componente antes de mexer nele).

Regra para decidir quando componentizar: só vale extrair um padrão visual repetido para dentro do design system quando ele já se repete de fato — na prática, a partir da 3ª repetição igual em telas diferentes. Componentizar cedo demais, achando que vai se repetir, tende a gerar um componente genérico demais com excesso de props só para cobrir casos únicos. Um layout muito específico de uma única tela pode perfeitamente continuar como markup próprio dentro do módulo daquela feature.

```
core/
├── components/         # catálogo do design system (Button, Badge, Card, Input, Select, ...)
├── <Sessão/Layout/Toast/etc.>Context.tsx
├── format.ts            # formatação compartilhada (moeda, data, texto)
└── nav.ts                # itens de navegação, se aplicável
```

## 6. Camadas de dados

```
Página (src/app/.../page.tsx)
   ↓ usa
Hook/Context do módulo
   ↓ chama via client HTTP central (src/lib/apiClient.ts)
Rota de API (src/app/api/**/route.ts)
   ↓ ORM/DB, ou integração externa
Banco de dados / serviço externo
```

Regra fixa: **nenhuma página ou componente acessa o ORM/banco diretamente.** Tudo passa pela rota de API, mesmo rodando local com um banco embarcado — isso é o que permite trocar o banco, mockar uma integração externa, ou mover a API pra outro serviço sem tocar em nenhuma página.

## 7. Convenção de nomenclatura

| Item | Padrão | Exemplo |
|---|---|---|
| Pasta de módulo | `kebab-case` ou palavra única minúscula | `modules/billing/` |
| Componente React | `PascalCase.tsx` | `InvoiceFormModal.tsx` |
| Context | `<Dominio>Context.tsx` | `BillingContext.tsx` |
| Hook | `use<Coisa>.ts` | `useInvoices.ts` |
| Rota de API (arquivo) | `route.ts` dentro da pasta do recurso | `api/billing/route.ts`, `api/billing/[id]/route.ts` |
| Tipos do domínio | `types.ts` dentro do módulo | `modules/billing/types.ts` |

## 8. Convenção de rotas de API

Uma pasta por recurso, seguindo REST: `GET/POST /api/<recurso>` na raiz do recurso, `GET/PATCH/DELETE /api/<recurso>/[id]` para item único. Sub-recurso vira sub-pasta (`/api/billing/[id]/invoices`). Toda rota mockada/externa (dado que num produto real viria de terceiro) fica agrupada sob um prefixo próprio (ex.: `/api/external/*`) pra ficar óbvio, só de olhar a URL, o que é dado real do banco e o que é simulado.

## 9. Onde fica o quê

| Tipo de conteúdo | Local |
|---|---|
| Documentação do projeto (arquitetura, schema de banco, design system) | `docs/*.md` — um arquivo por assunto, não um único README gigante |
| Regras específicas para agentes de IA trabalharem no repo | `AGENTS.md` (ou `CLAUDE.md`) na raiz |
| Configuração de banco/ORM | pasta própria na raiz (ex.: `migrations/`, `database/`), nunca dentro de `src/` |
| Variáveis de ambiente | `.env` (nunca versionado) + `.env.example` versionado documentando quais chaves existem |
| Código gerado por ferramenta | `src/generated/` (ou onde a ferramenta exigir), sempre no `.gitignore` |

## 10. Checklist para começar um projeto novo com este padrão

| Passo | Detalhe |
|---|---|
| Criar `src/app/`, `src/modules/core/`, `src/lib/` vazios | Esqueleto mínimo antes da primeira feature |
| Definir o client HTTP central (`src/lib/apiClient.ts`) | Toda chamada de página passa por ele, mesmo antes de existir uma segunda rota |
| Criar `docs/PROJECT_STRUCTURE.md` específico do projeto | Aponta pra este padrão e documenta os módulos reais conforme forem nascendo |
| Criar `docs/DESIGN_SYSTEM.md` junto com o primeiro componente do `core` | Cataloga o design system desde o primeiro componente, não depois que já tem 10 |
| Primeira feature vira o primeiro módulo em `modules/` | Nunca começar código de feature dentro de `app/` |
| Registrar a regra de dependência (módulo não importa módulo) no `AGENTS.md`/`CLAUDE.md` | Pra ferramenta de IA e novo desenvolvedor não quebrarem a fronteira sem perceber |
