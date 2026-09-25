# Empacotamento em Node — Design System do MyWallet

Passo a passo para extrair o [`src/design-system/`](../src/design-system) para um
**pacote npm reutilizável** (`@fabiovisentainer/design-system`), que pode ser usado
pelo próprio MyWallet e por qualquer outro projeto React/Next. Ver também
[`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) para o catálogo dos componentes e
[`PROJECT_STRUCTURE.md`](./PROJECT_STRUCTURE.md) para a organização de pastas do app.

> **Sobre o IntelliJ:** não existe um "empacotar este trecho de código" para
> JavaScript/TypeScript — o menu `Build > Build Artifacts` só gera JAR de Java. Em
> projeto Node, quem cria o pacote é o **npm** (`package.json` + `npm pack` /
> `npm publish`). O IntelliJ entra como apoio: mover arquivos com refatoração
> segura dos imports e rodar os scripts npm.

## 1. Por que dá para empacotar sem refatorar muito

O design system já foi construído isolado (regra do `DESIGN_SYSTEM.md`: ele não
depende de nenhum módulo de feature). As dependências externas dele hoje são só:

| Dependência | Onde | Como fica no pacote |
|---|---|---|
| `react` (tipos) | todos os componentes | `peerDependency` |
| `next/link` | `Button.tsx` (quando recebe `href`) | `peerDependency` |
| Classes Tailwind | todos os componentes | o app consumidor precisa ter Tailwind v4 e "enxergar" o pacote (`@source`) |
| Tokens `--color-*` | bloco `@theme inline` de `src/app/globals.css` | viram `tokens.css` dentro do pacote |
| `FieldShell` | `Input`, `Select`, `Textarea`, `Checkbox` | vai junto (é interno do pacote) |

**Peer dependency** = "o pacote precisa disso, mas quem instala é o app". Isso
evita duas cópias de React no mesmo bundle (causa clássica de erro de hooks).

## 2. Estrutura final

A abordagem escolhida é **npm workspaces**: o pacote mora no mesmo repositório
(monorepo), o MyWallet consome ele como se viesse do npm, e ele pode ser
distribuído para outros projetos quando quiser.

```
mywallet-nextjs/
├── package.json                 ← ganha "workspaces"
├── src/
│   └── app/globals.css          ← passa a importar os tokens do pacote
└── packages/
    └── design-system/
        ├── package.json
        ├── tsconfig.json
        ├── tsup.config.ts
        ├── README.md
        └── src/
            ├── index.ts         ← exporta tudo (barrel)
            ├── tokens.css       ← tokens de cor/fonte
            ├── Button.tsx
            ├── Badge.tsx
            ├── Card.tsx
            ├── StatCard.tsx
            ├── Alert.tsx
            ├── FieldShell.tsx
            ├── Input.tsx
            ├── Select.tsx
            ├── Textarea.tsx
            ├── Checkbox.tsx
            └── ProgressBar.tsx
```

## 3. Passo a passo

### Passo 1 — Criar a pasta do pacote (IntelliJ)

1. Na aba **Project**, botão direito na raiz `mywallet-nextjs` → `New > Directory`
   → digite `packages/design-system/src`.
2. Antes de mover, faça um commit (ou pelo menos confira o `git status`) — assim
   qualquer coisa dá para desfazer com `git checkout`.

### Passo 2 — Mover os componentes

1. Selecione todos os arquivos de `src/design-system/` (clique no primeiro,
   `Shift` + clique no último).
2. `Refactor > Move...` (atalho **F6**) → destino
   `packages/design-system/src`.
3. Deixe marcado **"Search for references"** — o IntelliJ reescreve os imports
   `@/design-system/...` que existem nas telas.
4. Apague a pasta vazia `src/design-system/`.

> Os imports serão trocados de novo no Passo 8 para usar o nome do pacote; o
> Passo 2 só garante que nada quebra no meio do caminho.

### Passo 3 — Extrair os tokens para `tokens.css`

Crie `packages/design-system/src/tokens.css` e **recorte** do
`src/app/globals.css` o bloco `@theme inline { ... }` inteiro (paleta da marca,
superfícies, textos e semânticas):

```css
/* packages/design-system/src/tokens.css */
@theme inline {
  --font-sans: var(--font-manrope);
  --font-mono: var(--font-azeret-mono);

  --color-ink: #111A2B;
  --color-brand: #2563EB;
  /* ...todo o restante dos --color-* ... */
}
```

Ficam no `globals.css` do app o que é específico da aplicação: `:root`
(`--background`/`--foreground`), estilos de `body`, `a`, foco de inputs e as
animações de toast/modal (usadas pelo `core`, não pelo design system).

> **Fontes:** o pacote só referencia `--font-manrope` e `--font-azeret-mono`. Quem
> carrega as fontes é o app (via `next/font` no `layout.tsx`), como já acontece
> hoje. Documente isso no README do pacote.

### Passo 4 — Criar o `index.ts` (barrel)

`packages/design-system/src/index.ts`:

```ts
export * from "./Button";
export * from "./Badge";
export * from "./Card";
export * from "./StatCard";
export * from "./Alert";
export * from "./FieldShell";
export * from "./Input";
export * from "./Select";
export * from "./Textarea";
export * from "./Checkbox";
export * from "./ProgressBar";
```

Tudo que não estiver exportado aqui é **privado** do pacote. Se algum componente
usa `export default`, troque para export nomeado ou adicione
`export { default as Nome } from "./Nome";`.

### Passo 5 — Criar o `package.json` do pacote

`packages/design-system/package.json`:

```json
{
  "name": "@fabiovisentainer/design-system",
  "version": "0.1.0",
  "description": "Design system do MyWallet — componentes React + tokens Tailwind v4",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./tokens.css": "./dist/tokens.css"
  },
  "files": ["dist"],
  "sideEffects": ["**/*.css"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "prepublishOnly": "npm run build"
  },
  "peerDependencies": {
    "next": ">=15",
    "react": ">=19",
    "react-dom": ">=19"
  },
  "devDependencies": {
    "@types/react": "^19",
    "tsup": "^8",
    "typescript": "^5"
  }
}
```

O que cada campo faz:

| Campo | Para quê |
|---|---|
| `name` | Nome usado no `npm install` e nos imports. O escopo `@fabiovisentainer/` evita conflito de nome no npm |
| `exports` | "Porta de entrada" oficial: só `@fabiovisentainer/design-system` e `.../tokens.css` podem ser importados |
| `files` | O que vai dentro do `.tgz` publicado — só a pasta `dist` (sem código-fonte, testes etc.) |
| `sideEffects` | Diz ao bundler que só o CSS tem efeito colateral, liberando tree-shaking dos componentes |
| `peerDependencies` | React/Next vêm do app, não do pacote |
| `prepublishOnly` | Garante que ninguém publica sem rodar o build antes |

### Passo 6 — Configurar o build (tsup)

O `tsup` compila o TypeScript/TSX para JavaScript puro + arquivos `.d.ts` de
tipos, que é o formato que qualquer projeto consegue consumir.

`packages/design-system/tsup.config.ts`:

```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ["react", "react-dom", "next"],
  // O Button usa "use client". Bundlers removem essa diretiva ao juntar os
  // arquivos — sem ela, o Next trata o pacote como Server Component e quebra.
  banner: { js: '"use client";' },
  onSuccess: "cp src/tokens.css dist/tokens.css",
});
```

`packages/design-system/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "declaration": true,
    "skipLibCheck": true,
    "isolatedModules": true
  },
  "include": ["src"]
}
```

> ⚠️ O `tsconfig` do pacote **não** tem o alias `@/*`. Se algum componente
> importar `@/...`, troque por import relativo (`./FieldShell`). Hoje nenhum
> importa, mas vale conferir antes do build.

> **Antes de continuar — terminal do Mac (zsh):** copie **só o comando**, uma
> linha por vez. O zsh não entende `#` como comentário quando você cola no
> terminal: `npm run build   # comentário` vira `next build #`, e o Next responde
> `Invalid project directory provided, no such directory: .../#`.

### Passo 7 — Registrar o pacote no projeto (workspaces)

**7.1 — Editar o `package.json` da raiz.** É o arquivo `mywallet-nextjs/package.json`
(o do app), **não** o `packages/design-system/package.json`. Mexa em dois lugares
dentro do objeto que já existe — não cole um novo bloco `{ }`:

- adicione a linha `"workspaces": ["packages/*"],` logo abaixo de `"private": true,`;
- dentro de `"dependencies"`, adicione a linha `"@fabiovisentainer/design-system": "*",`.

O começo do arquivo deve ficar assim (o resto continua igual):

```json
{
  "name": "mywallet-nextjs",
  "version": "0.1.0",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    ...
  },
  "dependencies": {
    "@fabiovisentainer/design-system": "*",
    "@prisma/adapter-better-sqlite3": "^7.9.1",
    ...
  },
```

**7.2 — Instalar.** Abra o terminal do IntelliJ (`View > Tool Windows > Terminal`),
na pasta raiz do projeto, e rode:

```bash
npm install
```

Se aparecer `npm warn allow-scripts`, não é erro: o npm está pedindo autorização
para rodar o script de instalação de uma dependência nova (o `esbuild`, usado pelo
`tsup`). Revise e aprove com:

```bash
npm approve-scripts --allow-scripts-pending
```

**7.3 — Compilar o pacote.**

```bash
npm run build -w @fabiovisentainer/design-system
```

O `-w` ("workspace") manda o npm rodar o script `build` do pacote, não o do app.
(No IntelliJ também dá: botão direito em `packages/design-system/package.json` →
**Show npm Scripts** → duplo clique em `build`.)

**7.4 — Fazer o ESLint ignorar o código gerado.** O `dist/` é saída do `tsup`, não
código escrito à mão — sem isso o `npm run lint` passa a acusar avisos dentro dele.
Em `eslint.config.mjs`, dentro de `globalIgnores([...])`, adicione:

```js
"packages/*/dist/**",
```

**7.5 — Não versionar o que é gerado.** No `.gitignore` da raiz, adicione:

```
packages/*/node_modules
packages/*/dist
```

O `/node_modules` que já existe no `.gitignore` só vale para a raiz; sem essas
linhas, o Git passa a listar as pastas geradas do pacote.

✅ **Confira antes de seguir:**

| Verificação | Resultado esperado |
|---|---|
| Pasta `packages/design-system/dist/` | contém `index.js`, `index.d.ts`, `index.js.map` e `tokens.css` |
| Primeira linha de `dist/index.js` | `"use client";` |
| Pasta `node_modules/@fabiovisentainer/` | contém `design-system` com ícone de atalho (é um link para `packages/design-system`) |

### Passo 8 — Trocar os imports das telas para o nome do pacote

Quando você moveu os arquivos com **F6** no Passo 2, o IntelliJ corrigiu os
imports usando **caminhos relativos**, por exemplo:

```ts
import {Card} from "../../../../packages/design-system/src/Card";
import {Badge} from "../../../../packages/design-system/src/Badge";
```

Funciona, mas o app está lendo o código-fonte direto, "por fora" do pacote. O
objetivo é que ele importe igual a qualquer outro projeto faria:

```ts
import {Card, Badge} from "@fabiovisentainer/design-system";
```

**8.1 — Substituir em todos os arquivos.** `Edit > Find > Replace in Files`
(**⌘⇧R** no Mac, **Ctrl+Shift+R** no Windows/Linux). Na janela:

1. Ligue a opção **`.*`** (expressão regular), à direita do campo de busca.
2. Em **Directory**, escolha a pasta `src` do projeto.
3. No campo de busca, cole:
   ```
   "(\.\./)+packages/design-system/src/\w+"
   ```
4. No campo de substituição, cole:
   ```
   "@fabiovisentainer/design-system"
   ```
5. Clique em **Replace All**.

**8.2 — Juntar os imports repetidos.** Depois da troca, um arquivo pode ficar com
várias linhas importando do mesmo pacote. Botão direito na pasta `src` →
**Optimize Imports** (**⌃⌥O** no Mac, **Ctrl+Alt+O** no Windows/Linux). O IntelliJ
junta tudo em uma linha por arquivo.

✅ **Confira:** busque (**⌘⇧F**) por `packages/design-system/src` dentro de `src` —
tem que dar **0 resultados**.

### Passo 9 — Importar os tokens e avisar o Tailwind

No Passo 3 as cores saíram do `globals.css` e foram para o pacote. Até este passo
o app está **sem as cores da marca** — é aqui que elas voltam.

Abra `src/app/globals.css`. A primeira linha é `@import "tailwindcss";`. Logo
abaixo dela, adicione duas linhas, de modo que o topo do arquivo fique assim:

```css
@import "tailwindcss";
@import "@fabiovisentainer/design-system/tokens.css";
@source "../../node_modules/@fabiovisentainer/design-system/dist";

:root {
  --background: #F6F7F9;
  ...
```

O que cada linha faz:

| Linha | Para quê |
|---|---|
| `@import ".../tokens.css"` | traz de volta todos os `--color-*` e as fontes do design system |
| `@source "..."` | o Tailwind não lê `node_modules` sozinho; sem isso ele não gera as classes usadas dentro dos componentes (botões e cards aparecem sem estilo). O caminho é relativo ao próprio `globals.css` (`src/app/` → sobe 2 pastas → raiz) |

### Passo 10 — Validar

Rode um comando por vez, na raiz do projeto, esperando cada um terminar.

**10.1 — Lint:**

```bash
npm run lint
```

Esperado: termina sem nenhum `error`. (Se aparecer
`react-hooks/set-state-in-effect` em `useCorporateActions.ts`, é um problema que já
existia no projeto, independente do pacote — já corrigido no repositório.)

**10.2 — Build de produção do app:**

```bash
npm run build
```

Esperado: `✓ Compiled successfully` e a tabela de rotas no final.

**10.3 — Rodar e conferir visualmente:**

```bash
npm run dev
```

Abra `http://localhost:3000` e confira:

| Tela | O que olhar |
|---|---|
| Login (`/`) | campos (`Input`) com borda, `Alert` vermelho ao errar a senha, botão azul grande |
| `/wallets` | `Card` branco com borda, `Badge` colorido, botão com link (`Button` com `href`) |
| `/goals` | `ProgressBar` preenchida com cor |
| `/dashboard` | `StatCard` com valores em fonte monoespaçada |

Se tudo estiver com as cores e bordas de antes, o app está usando o pacote. Para
parar o servidor: **Ctrl+C** no terminal.

## 4. Distribuir para outros projetos

Escolha uma das três formas, da mais simples para a mais "profissional":

### Opção A — Arquivo `.tgz` (sem publicar nada)

```bash
cd packages/design-system
npm run build
npm pack
```

Isso gera o arquivo `fabiovisentainer-design-system-0.1.0.tgz` dentro de `packages/design-system/`.

No outro projeto:

```bash
npm install /caminho/para/fabiovisentainer-design-system-0.1.0.tgz
```

Bom para testar ou entregar em trabalho acadêmico. Desvantagem: cada versão nova
é um arquivo novo para copiar.

> Dica: rode `npm pack --dry-run` antes para ver exatamente quais arquivos vão
> dentro do pacote.

### Opção B — GitHub Packages (recomendado, o repo já está no GitHub)

1. No GitHub: `Settings > Developer settings > Personal access tokens` → token
   com `write:packages` e `read:packages`.
2. Em `packages/design-system/package.json`, adicione:
   ```json
   "repository": "https://github.com/FabioVisentainer/mywallet-nextjs",
   "publishConfig": { "registry": "https://npm.pkg.github.com" }
   ```
3. Crie `packages/design-system/.npmrc` (e **não** comite o token):
   ```
   @fabiovisentainer:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
   ```
4. Publicar:
   ```bash
   export GITHUB_TOKEN=ghp_...
   npm publish -w @fabiovisentainer/design-system
   ```
5. No projeto que vai consumir, crie um `.npmrc` com as mesmas duas linhas e rode
   `npm install @fabiovisentainer/design-system`.

> No GitHub Packages o escopo precisa ser o seu usuário do GitHub em minúsculas
> (`@fabiovisentainer`).

### Opção C — npm público

```bash
npm login
npm publish -w @fabiovisentainer/design-system --access public
```

Pacotes com escopo são privados por padrão; `--access public` libera.

## 5. Usar em outro projeto

Requisitos do projeto consumidor: React 19, Next 15+ (por causa do `next/link`
no `Button`) e Tailwind v4.

```bash
npm install @fabiovisentainer/design-system
```

`globals.css` do outro projeto:

```css
@import "tailwindcss";
@import "@fabiovisentainer/design-system/tokens.css";
@source "../../node_modules/@fabiovisentainer/design-system/dist";
```

Carregar as fontes no `layout.tsx` (mesmas variáveis que o pacote espera):

```tsx
import { Manrope, Azeret_Mono } from "next/font/google";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const azeret = Azeret_Mono({ subsets: ["latin"], variable: "--font-azeret-mono" });

// <html className={`${manrope.variable} ${azeret.variable}`}>
```

E usar:

```tsx
import { Button, Card, Input } from "@fabiovisentainer/design-system";
```

## 6. Versionamento

Siga **SemVer** (`MAJOR.MINOR.PATCH`) — o `npm` usa isso para decidir o que
atualizar sozinho:

| Mudança | Exemplo | Comando |
|---|---|---|
| Correção sem mudar API | ajuste de cor/padding | `npm version patch` → 0.1.1 |
| Novo componente/prop opcional | `Tabs`, prop `loading` no Button | `npm version minor` → 0.2.0 |
| Quebra de API | renomear `tone` → `variant` | `npm version major` → 1.0.0 |

Rode `npm version ...` dentro de `packages/design-system`, depois build + publish.
Enquanto estiver em `0.x`, qualquer `minor` pode quebrar — trate como instável.

## 7. Problemas comuns

| Sintoma | Causa | Correção |
|---|---|---|
| Componentes aparecem sem estilo | Tailwind não leu o pacote | Conferir o `@source` e o caminho relativo dele |
| Cores erradas / transparentes | `tokens.css` não importado | `@import "@fabiovisentainer/design-system/tokens.css"` |
| Erro "useState / event handlers only work in Client Components" | `"use client"` sumiu no build | Conferir o `banner` no `tsup.config.ts` e se `dist/index.js` começa com `"use client";` |
| "Invalid hook call" / duas cópias de React | React em `dependencies` do pacote | Manter React/Next só em `peerDependencies` |
| `Cannot find module '@/...'` no build do pacote | Alias do app usado dentro do pacote | Usar imports relativos no pacote |
| IntelliJ não reconhece o pacote nos imports | Índice desatualizado | `File > Invalidate Caches > Invalidate and Restart` |
| `Invalid project directory provided, no such directory: .../#` | Comando colado com comentário `# ...` no zsh | Colar só o comando, sem o `#` e o texto depois dele |
| `npm error No workspaces found` | `"workspaces"` ausente no `package.json` da raiz (ou colado no do pacote) | Refazer o Passo 7.1 |
| `npm run lint` com avisos dentro de `packages/design-system/dist/index.js` | ESLint lendo código gerado | Passo 7.4 |
| Mudança no pacote não aparece no app | `dist` desatualizado | Rodar `npm run dev -w @fabiovisentainer/design-system` em paralelo ao `npm run dev` |

## 8. Atalho: sem build (só dentro do monorepo)

Se o pacote for usado **só pelo MyWallet** por enquanto, dá para pular o `tsup`:
aponte `main`/`exports` direto para `./src/index.ts` e `./src/tokens.css`. O
Turbopack do Next compila pacotes de workspace automaticamente. Fora do monorepo
(outro projeto instalando via `.tgz`/registry), adicione o nome em
`transpilePackages` no `next.config.ts`, porque o Next não compila TypeScript
vindo de `node_modules`:

```ts
const nextConfig = { transpilePackages: ["@fabiovisentainer/design-system"] };
```

Isso é mais rápido de montar, mas só funciona para projetos Next. O caminho com
`tsup` (seção 3) serve para qualquer projeto React.
