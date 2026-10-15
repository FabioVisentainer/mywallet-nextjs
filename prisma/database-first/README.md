# Banco do MyWallet para ferramentas Database First

O app usa SQLite via Prisma (`dev.db`). Esta pasta tem o **mesmo banco exportado para os SGBDs mais comuns**, já com os dados de demonstração. Assim dá para subir o banco num servidor e apontar um gerador *Database First* para ele (classes, CRUD e telas).

A estrutura é lida **do próprio `dev.db`** (introspecção), não do `schema.prisma`. O resultado é exatamente o que está no arquivo.

```
prisma/database-first/
├── export.mjs              ← gera tudo de novo (npm run db:export)
├── mysql/                  ← MySQL 8+ / MariaDB 10.5+
│   ├── 01-schema.sql       (cria o database `mywallet` + tabelas + FKs)
│   └── 02-data.sql         (INSERTs com os dados do dev.db)
├── postgresql/             ← PostgreSQL 12+
├── sqlserver/              ← SQL Server 2016+ / Azure SQL (usa GO → SSMS/sqlcmd/Azure Data Studio)
└── sqlite/
    ├── mywallet.db         ← cópia do dev.db sem a tabela interna _prisma_migrations
    └── 01-schema.sql
```

> Substitui o antigo `prisma/mysql/schema.sql`, que está desatualizado: não tem `PasswordResetToken`, `InvestorProfileResult` nem `Promotion`.

## Regenerar depois de mudar o schema

```bash
npm run db:migrate    # aplica a mudança no dev.db
npm run db:export     # regera todos os scripts desta pasta
```

Nome do database: `EXPORT_DB_NAME=outro npm run db:export` (o padrão é `mywallet`).

## Carregar no servidor

| SGBD | Comando |
|---|---|
| MySQL/MariaDB | `mysql -u root -p < mysql/01-schema.sql && mysql -u root -p < mysql/02-data.sql`. No Workbench, abra e execute os dois arquivos. |
| PostgreSQL | `createdb mywallet && psql -d mywallet -f postgresql/01-schema.sql -f postgresql/02-data.sql` |
| SQL Server | Abra os dois arquivos no SSMS/Azure Data Studio e execute, ou: `sqlcmd -S localhost -U sa -i sqlserver\01-schema.sql,sqlserver\02-data.sql` |
| SQLite | Nada a fazer: aponte a ferramenta para `sqlite/mywallet.db`. |

Os scripts podem ser rodados de novo: eles fazem `DROP TABLE IF EXISTS` antes de criar.

## Exemplos de geradores (classes + CRUD + telas)

**ASP.NET Core MVC / Razor Pages (EF Core)**: gera entidades, DbContext, controllers e views de CRUD.
```bash
dotnet ef dbcontext scaffold "Data Source=prisma/database-first/sqlite/mywallet.db" Microsoft.EntityFrameworkCore.Sqlite -o Models -c MyWalletContext
# ou SQL Server: "Server=localhost;Database=mywallet;User Id=sa;Password=...;TrustServerCertificate=True" Microsoft.EntityFrameworkCore.SqlServer
dotnet aspnet-codegenerator controller -name UsersController -m User -dc MyWalletContext --relativeFolderPath Controllers --useDefaultLayout
```

**Django**: gera os models a partir do banco, e o Django Admin cria as telas de CRUD.
```bash
python manage.py inspectdb > app/models.py   # DATABASES apontando para mywallet.db ou o Postgres/MySQL
# admin.py: admin.site.register([...models])
```

**Java / Spring (IntelliJ)**: plugin JPA Buddy, ou no Ultimate *Database → Generate Persistence Mapping*, sobre a conexão MySQL/Postgres.

**Telas prontas sem gerar código** (painel CRUD direto sobre o banco): Radzen Blazor Studio, NocoDB, Directus, AppGini/PHPRunner (MySQL).

## O que o gerador vai "herdar" do modelo atual

O banco foi modelado para o protótipo. Algumas decisões aparecem no código gerado:

- **IDs são texto sem valor automático** (`u1`, `w1`, `promo1`…), exceto `ActivityEntry.id`, que é autoincremento. O app gera o id no código. Num CRUD gerado, o formulário de criação vai pedir o id; preencha à mão ou ajuste o default no gerador.
- **Datas são texto** (`"2026-08-11"`, `"Mar 2024"`). Os forms vão mostrar input de texto, não date picker.
- **"Enums" são texto livre**, e os valores válidos não estão no banco (estão em comentários do `schema.prisma`):
  `User.role` Investor/Analyst/Administrator · `User.status` Active/Suspended/Pending · `User.accountType` Individual/Institutional · `Asset.type` Stock/Crypto/ETF/REIT · `Article.status` Published/Draft · `Transaction.type` Buy/Sell/Swap/Deposit · `TeamMember.roleInTeam` Trader/Compliance/Viewer · `InvestorProfileResult.profileKey` Conservative/Moderate/Aggressive · `Promotion.planName` Standard/Platinum/Black.
- **Relacionamentos que existem no banco (FKs)**: `Asset → Wallet`, e `ActivityEntry`, `PasswordResetToken` e `InvestorProfileResult → User`, todos com cascade. Os geradores criam navegação e dropdowns só para esses.
- **Referências sem FK** (são texto solto, e o gerador não vai ligar as tabelas): `Transaction.wallet` e `Transaction.asset` guardam nomes, não ids. `Promotion.createdBy` guarda um id de User. `Wallet`, `Goal`, `Transaction` e `TeamMember` não têm dono (`userId`).
- `User` e `Transaction` são palavras reservadas em vários SGBDs. Os scripts colocam aspas nos nomes. Em SQL manual no Postgres, use `"User"` com aspas, porque os nomes diferenciam maiúsculas de minúsculas.
- Preço atual dos ativos, câmbio e histórico de performance **não estão no banco**: são mocks de API externa (`src/mocks/external/`).
