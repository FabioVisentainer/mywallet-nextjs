# MyWallet — CRUD Database First com ASP.NET Core + EF Core

Passo a passo no terminal do macOS. O banco SQLite exportado do projeto Next.js/Prisma vira um projeto ASP.NET Core MVC com entidades, controllers e telas de CRUD gerados automaticamente para as 11 tabelas.

```
Prisma + SQLite (dev.db) → mywallet.db (npm run db:export) → dotnet ef scaffold (Models + DbContext) → aspnet-codegenerator (Controllers + Views)
```

Versões: .NET 10 · EF Core 10 · dotnet-aspnet-codegenerator 10.

> **Copiar e colar:** cada comando está numa linha só. Copie o bloco inteiro.

---

## Antes de começar

- macOS com Homebrew (ou baixe o .NET SDK em dotnet.microsoft.com).
- O banco exportado precisa existir em `~/Desenvolvimento/mywallet-nextjs/prisma/database-first/sqlite/mywallet.db`. Se não existir ou estiver desatualizado, rode `npm run db:export` dentro de `mywallet-nextjs`.
- O projeto .NET fica em `~/Desenvolvimento/MyWallet.Web`, ao lado do projeto Next.js.

---

## 1. Instalar o .NET 10 SDK e as ferramentas

```bash
brew install --cask dotnet-sdk
dotnet --version
dotnet tool install --global dotnet-ef
dotnet tool install --global dotnet-aspnet-codegenerator
echo 'export PATH="$PATH:$HOME/.dotnet/tools"' >> ~/.zshrc && source ~/.zshrc
```

O `dotnet --version` deve mostrar `10.x`. O `dotnet-ef` gera as classes a partir do banco, e o `dotnet-aspnet-codegenerator` gera os controllers e as telas.

---

## 2. Criar o projeto MVC e copiar o banco

```bash
cd ~/Desenvolvimento
dotnet new mvc -n MyWallet.Web
cd MyWallet.Web
mkdir Data
cp ../mywallet-nextjs/prisma/database-first/sqlite/mywallet.db Data/
```

---

## 3. Adicionar os pacotes NuGet

```bash
dotnet add package Microsoft.EntityFrameworkCore.Sqlite
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Microsoft.EntityFrameworkCore.Tools
dotnet add package Microsoft.VisualStudio.Web.CodeGeneration.Design
```

O pacote `Tools` é obrigatório para o passo 6. Sem ele, o gerador falha com "install Entity Framework core packages… Microsoft.EntityFrameworkCore.Tools". Ferramentas, pacotes e SDK precisam ter a mesma versão principal (10).

---

## 4. Gerar as classes a partir do banco (Database First)

```bash
dotnet ef dbcontext scaffold "Data Source=Data/mywallet.db" Microsoft.EntityFrameworkCore.Sqlite --output-dir Models --context MyWalletContext --context-dir Data --no-onconfiguring --force
```

Depois do scaffold, rode este ajuste:

```bash
sed -i '' -E 's/(User|Wallet) (User|Wallet) \{ get; set; \} = null!;/\1? \2 { get; set; }/' Models/*.cs
```

O que esperar:

- Uma classe por tabela em `Models/` e o arquivo `Data/MyWalletContext.cs`.
- Os avisos "should map to a property of type DateTime/DateOnly… Using a different type" são normais. As colunas de data são texto em formatos variados (`"Mar 2024"`, `"2026-08-11 09:40"`), então o EF mantém `string`.
- O aviso sobre `Promotion.active` também é normal. Ela vira `bool?` porque tem valor padrão no banco.
- O `sed` torna opcionais as navegações `Wallet` e `User`. Sem ele, salvar um Asset (ou outra tabela com FK) falha com "The Wallet field is required". **Sempre que rodar o scaffold de novo, rode o `sed` também.**

---

## 5. Ligar o banco na aplicação

**`appsettings.json`**: substitua o conteúdo por:

```json
{
  "ConnectionStrings": {
    "MyWallet": "Data Source=Data/mywallet.db"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

**`Program.cs`**: no topo do arquivo:

```csharp
using Microsoft.EntityFrameworkCore;
using MyWallet.Web.Data;
```

**`Program.cs`**: logo abaixo de `builder.Services.AddControllersWithViews();`:

```csharp
builder.Services.AddDbContext<MyWalletContext>(o => o.UseSqlite(builder.Configuration.GetConnectionString("MyWallet")));
```

Faça este passo **antes** do 6. O gerador de CRUD encontra o contexto do banco por esse registro.

---

## 6. Gerar controllers e telas de CRUD de todas as tabelas

```bash
dotnet build
```

```bash
for m in User ActivityEntry Article Wallet Asset Goal InvestorProfileResult PasswordResetToken Promotion TeamMember Transaction; do dotnet aspnet-codegenerator controller -name "${m}Controller" -m "$m" -dc MyWallet.Web.Data.MyWalletContext --databaseProvider sqlite --relativeFolderPath Controllers --useDefaultLayout --referenceScriptLibraries --force; done
```

O gerador compila o projeto a cada tabela, então leva alguns minutos. Confira o resultado:

```bash
ls Controllers Views/User
```

O certo é ter `UserController.cs`, `WalletController.cs`… dentro de `Controllers/`, e `Create.cshtml`, `Delete.cshtml`, `Details.cshtml`, `Edit.cshtml` e `Index.cshtml` dentro de `Views/User/`.

> Se aparecerem arquivos `*Controller.cs` **na raiz do projeto** com `namespace MyApp.Namespace` e só um `return View()`, o comando rodou sem os parâmetros. São controllers vazios, sem CRUD. Apague-os com `rm *Controller.cs` (na raiz, não dentro de `Controllers/`) e rode o loop de novo.

---

## 7. Colocar as telas no menu

Em `Views/Shared/_Layout.cshtml`, dentro do `<ul class="navbar-nav flex-grow-1">`, logo após o item "Privacy":

```html
<li class="nav-item"><a class="nav-link text-dark" asp-controller="User" asp-action="Index">Usuários</a></li>
<li class="nav-item"><a class="nav-link text-dark" asp-controller="Wallet" asp-action="Index">Carteiras</a></li>
<li class="nav-item"><a class="nav-link text-dark" asp-controller="Asset" asp-action="Index">Ativos</a></li>
<li class="nav-item"><a class="nav-link text-dark" asp-controller="Transaction" asp-action="Index">Transações</a></li>
<li class="nav-item"><a class="nav-link text-dark" asp-controller="Goal" asp-action="Index">Metas</a></li>
<li class="nav-item"><a class="nav-link text-dark" asp-controller="Article" asp-action="Index">Artigos</a></li>
<li class="nav-item"><a class="nav-link text-dark" asp-controller="Promotion" asp-action="Index">Promoções</a></li>
<li class="nav-item"><a class="nav-link text-dark" asp-controller="TeamMember" asp-action="Index">Equipe</a></li>
```

As outras três tabelas também têm telas, acessíveis pela URL: `/ActivityEntry`, `/PasswordResetToken` e `/InvestorProfileResult`.

---

## 8. Rodar

```bash
dotnet run
```

Abra o endereço `http://localhost:5xxx` que aparecer no terminal.

---

## O que esperar das telas geradas

- **Id no cadastro:** a tela de criação pede o Id, porque os IDs do banco são texto sem valor automático (`u1`, `w1`…). A exceção é `ActivityEntry`, que tem autoincremento.
- **Dropdowns de FK mostram o id:** para mostrar o nome, troque `"Id", "Id"` por `"Id", "Name"` nos `new SelectList(...)` do controller (Asset → Wallet; ActivityEntry, PasswordResetToken, InvestorProfileResult → User).
- **Datas e "enums" viram texto livre**, porque é assim que estão no banco. Os valores válidos estão nos comentários do `schema.prisma`.
- **`Promotion.Active`** aparece como dropdown (vazio/True/False), porque é `bool?`.
- **Relacionamentos com FK no banco:** só `Asset → Wallet` e as três tabelas ligadas a `User`. `Transaction.wallet`, `Transaction.asset` e `Promotion.createdBy` são texto solto.

---

## Solução de problemas

| Sintoma | O que fazer |
|---|---|
| `dotnet-ef` / `dotnet-aspnet-codegenerator`: command not found | Rode a linha do PATH do passo 1 e abra um terminal novo. |
| "install Entity Framework core packages… Microsoft.EntityFrameworkCore.Tools" | `dotnet add package Microsoft.EntityFrameworkCore.Tools`, `dotnet build` e repita o passo 6. |
| Links do menu não abrem nada | Os controllers não existem: o passo 6 falhou. Confira `ls Controllers`. |
| "The view 'Index' was not found… /Views/User/Index.cshtml" | Os controllers foram criados vazios, sem as views. Veja a observação do passo 6: apague os `*Controller.cs` da raiz e rode o loop de novo. |
| Aviso NU1901 sobre `NuGet.Packaging` / `NuGet.Protocol` | Vem do pacote do gerador e é de gravidade baixa. Pode ignorar. |
| "No database provider has been configured" / "Unable to resolve service for DbContextOptions" no passo 6 | O `AddDbContext` do passo 5 está faltando ou com erro. Corrija, rode `dotnet build` e repita o passo 6. |
| "The Wallet field is required" / "The User field is required" ao salvar | Rode de novo o `sed` do passo 4. |
| "SQLite Error 1: no such table" | Rode `dotnet run` de dentro da pasta `MyWallet.Web` e confira se `Data/mywallet.db` existe. |

---

## Quando o schema do Prisma mudar

```bash
cd ~/Desenvolvimento/mywallet-nextjs && npm run db:migrate && npm run db:export
```

```bash
cp prisma/database-first/sqlite/mywallet.db ../MyWallet.Web/Data/ && cd ../MyWallet.Web
```

Depois, repita o passo 4 (scaffold + `sed`) e o passo 6. O loop já usa `--force`.

---

## Estrutura final

```
MyWallet.Web/
├── Controllers/   UserController.cs, WalletController.cs, AssetController.cs … (11) + HomeController.cs
├── Data/          MyWalletContext.cs, mywallet.db
├── Models/        User.cs, Wallet.cs, Asset.cs, Transaction.cs … (11 entidades)
├── Views/
│   ├── User/      Index, Create, Edit, Details, Delete (.cshtml)
│   ├── Wallet/    …
│   └── Shared/_Layout.cshtml
├── appsettings.json
└── Program.cs
```

## Referências

- dotnet-aspnet-codegenerator (NuGet): https://www.nuget.org/packages/dotnet-aspnet-codegenerator
- EF Core — Scaffolding (Reverse Engineering): https://learn.microsoft.com/ef/core/managing-schemas/scaffolding/
- Exportação do banco: `mywallet-nextjs/prisma/database-first/README.md`
