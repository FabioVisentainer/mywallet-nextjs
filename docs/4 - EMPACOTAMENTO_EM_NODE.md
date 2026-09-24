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

### Passo 7 — Ligar o pacote ao MyWallet (workspaces)

No `package.json` da **raiz** do projeto, adicione:

```json
{
  "workspaces": ["packages/*"],
  "dependencies": {
    "@fabiovisentainer/design-system": "*"
  }
}
```

E no terminal do IntelliJ (`View > Tool Windows > Terminal`), na raiz:

```bash
npm install
npm run build -w @fabiovisentainer/design-system
```

O `npm install` cria um link `node_modules/@fabiovisentainer/design-system` →
`packages/design-system`. Ou seja: o app usa o pacote "de verdade", mas qualquer
mudança no pacote aparece na hora (depois de rebuild, ou com `npm run dev -w ...`
rodando em paralelo).

> No IntelliJ: botão direito no `packages/design-system/package.json` →
> **Show npm Scripts** abre uma janela com `build` e `dev` clicáveis.

### Passo 8 — Trocar os imports nas telas

Com `Edit > Find > Replace in Path` (**Ctrl+Shift+R** / **⌘⇧R**), com regex ligado:

- Procurar: `from "@/design-system/\w+"`
- Substituir: `from "@fabiovisentainer/design-system"`

Depois, `Code > Optimize Imports` (**Ctrl+Alt+O** / **⌃⌥O**) no diretório `src`
junta imports duplicados, por exemplo:

```ts
// antes
import { Button } from "@/design-system/Button";
import { Card } from "@/design-system/Card";

// depois
import { Button, Card } from "@fabiovisentainer/design-system";
```

### Passo 9 — Ajustar o Tailwind do app

O Tailwind v4 **não varre `node_modules`**. Se não avisar, ele não gera as classes
usadas dentro dos componentes do pacote e eles aparecem sem estilo. No topo do
`src/app/globals.css`:

```css
@import "tailwindcss";
@import "@fabiovisentainer/design-system/tokens.css";

/* avisa o Tailwind para ler as classes usadas no pacote */
@source "../../node_modules/@fabiovisentainer/design-system/dist";
```

O caminho do `@source` é **relativo ao próprio `globals.css`**.

### Passo 10 — Validar

```bash
npm run build -w @fabiovisentainer/design-system   # pacote compila e gera .d.ts
npm run lint
npm run build                                        # app Next compila com o pacote
npm run dev                                          # conferir visualmente
```

Checklist visual rápido: login (Input + Alert + Button `lg`), `/wallets`
(Card, Badge, Button com `href`), `/goals` (ProgressBar), dashboard (StatCard).

## 4. Distribuir para outros projetos

Escolha uma das três formas, da mais simples para a mais "profissional":

### Opção A — Arquivo `.tgz` (sem publicar nada)

```bash
cd packages/design-system
npm run build
npm pack
# gera fabiovisentainer-design-system-0.1.0.tgz
```

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
