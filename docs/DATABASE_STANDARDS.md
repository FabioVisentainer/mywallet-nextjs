# Padrão de Banco de Dados — MySQL

> Padrão de banco de dados MySQL para ser reaproveitado em qualquer projeto da empresa — nomenclatura, tipos de dados, estratégia de migrations e um kit de tabelas reutilizáveis para autenticação e auditoria. Vale tanto para começar um projeto novo do zero quanto para evoluir um protótipo existente (ex.: um MVP em SQLite) para um banco "de verdade" em produção. A ideia não é reescrever tudo de uma vez num projeto legado: é ter um padrão único para aplicar em toda tabela/migration nova e ir corrigindo o resto aos poucos.

## 1. Motor, charset e configuração

Toda tabela usa `ENGINE=InnoDB` (suporte a transação e FK, já é o padrão implícito do MySQL 8) e `CHARACTER SET utf8mb4` com `COLLATE utf8mb4_0900_ai_ci` (colation padrão do MySQL 8.0+; se algum ambiente ainda rodar 5.7, usar `utf8mb4_unicode_ci`). `utf8mb4` é obrigatório mesmo sem previsão de emoji hoje — `utf8mb3`/`latin1` corrompem nomes com acento e travam silenciosamente no primeiro emoji.

Conexão sempre roda com `sql_mode` estrito:

```sql
SET GLOBAL sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,ONLY_FULL_GROUP_BY';
```

Isso faz o MySQL rejeitar inserts que truncariam dado silenciosamente (comportamento padrão do MySQL é só um warning) — importante em qualquer domínio que grave valor monetário ou quantidade, onde um dado cortado sem erro vira um bug caro de rastrear depois.

Todo `DATETIME` gravado é em **UTC**. Conversão para o fuso do usuário é responsabilidade da camada de aplicação, nunca do banco.

## 2. Nomenclatura

### 2.1 Tabelas

`snake_case`, plural, em inglês (consistente com o resto do código, que já é em inglês). Se a camada de acesso a dados usada no projeto tiver um mapeamento padrão diferente (por exemplo, nomear a tabela igual ao nome da entidade/classe em PascalCase singular), esse mapeamento deve ser configurado explicitamente para produzir `snake_case` — nunca aceitar o nome default gerado pela ferramenta sem revisar.

| Nome comum em prototipagem rápida | Tabela recomendada |
|---|---|
| `User` | `users` |
| `OrderItem` | `order_items` |
| `Transaction` | `transactions` (atenção: em alguns bancos vale renomear para evitar ambiguidade com a palavra reservada `TRANSACTION` do SQL — ex.: `wallet_transactions`, `payment_transactions`) |
| `Customer` | `customers` |

### 2.2 Colunas

`snake_case` sempre. Chave primária é sempre `id`. Chave estrangeira é `<tabela_referenciada_no_singular>_id` (`user_id`, `order_id`). Booleanos usam prefixo `is_`/`has_` (`is_active`, `has_verified_email`). Colunas de auditoria têm nome fixo em toda tabela: `created_at`, `updated_at`, `deleted_at`.

### 2.3 Índices e constraints

| Tipo | Padrão de nome | Exemplo |
|---|---|---|
| Chave única | `uq_<tabela>_<coluna>` | `uq_users_email` |
| Índice comum | `idx_<tabela>_<coluna(s)>` | `idx_order_items_order_id` |
| Chave estrangeira | `fk_<tabela>_<coluna>` | `fk_order_items_order_id` |
| Índice composto | `idx_<tabela>_<col1>_<col2>` | `idx_orders_customer_id_created_at` |

Ferramentas de migration costumam gerar nome de constraint automático (algo como `User_email_key`) — sempre renomear explicitamente para o padrão acima em vez de aceitar o nome default.

### 2.4 Estratégia de chave primária

| Opção | Prós | Contras |
|---|---|---|
| `BIGINT UNSIGNED AUTO_INCREMENT` | Menor, mais rápido para índice clusterizado do InnoDB | Expõe volume de negócio na URL (`/orders/842`), ruim para IDs públicos |
| `CHAR(36)` UUIDv4 | Não sequencial, não vaza volume | Aleatório = fragmenta o índice clusterizado (pior performance de insert em tabela grande) |
| `BINARY(16)` UUID | Mesmas vantagens do UUID, 16 bytes em vez de 36 | Precisa converter para exibir/depurar (`BIN_TO_UUID`/`UUID_TO_BIN`) |
| `CHAR(26)` ULID | Não sequencial nem vaza volume, mas é **ordenável por tempo** (bom para o índice), gerado sem round-trip ao banco | String um pouco maior que `BIGINT` |

**Recomendação padrão:** ULID (`CHAR(26)`). É comum, em prototipagem rápida, gerar ID como string opaca direto na aplicação (ex.: prefixo + timestamp) — trocar essa geração por ULID mantém a vantagem de não depender de `AUTO_INCREMENT` nem de round-trip ao banco, resolve a fragmentação de índice que um UUID aleatório teria, e continua ordenável cronologicamente, o que ajuda em paginação e em debug. Gerar com uma lib de ULID (ex.: `ulid`/`ulidx` em Node, ou equivalente na stack usada).

## 3. Tipos de dados recomendados

| Categoria | Tipo MySQL | Observação |
|---|---|---|
| Identificador (PK/FK) | `CHAR(26)` (ULID) | ver 2.4 |
| **Valor monetário** | `DECIMAL(18,2)` | **Nunca `FLOAT`/`DOUBLE`.** É comum um protótipo guardar valor monetário em ponto flutuante — mas `0.1 + 0.2` já não fecha exato nesse formato; em qualquer domínio que soma/multiplica dinheiro isso vira diferença de centavos acumulada. É a correção mais importante deste documento. |
| Quantidade fracionária (ex.: estoque, posição de ativo) | `DECIMAL(28,10)` | Precisão maior que dinheiro comum, quando o domínio exige muitas casas decimais |
| Texto curto (nome, código, e-mail) | `VARCHAR(n)` com tamanho pensado pro dado real | Não usar um tamanho genérico default sem revisar — dimensionar (`email VARCHAR(255)`, `sku VARCHAR(50)`, etc.) |
| Texto longo (corpo de artigo, descrição) | `TEXT` / `LONGTEXT` | conforme o tamanho esperado do conteúdo |
| Data de negócio (vencimento, data de um evento) | `DATE` | Evitar guardar data como texto livre formatado para exibição — formatação de exibição fica só no app, nunca no banco |
| Timestamp de auditoria | `DATETIME(3)` | Preferir a `TIMESTAMP` (que tem limite em 2038 e comportamento de auto-update surpreendente) |
| Categoria fechada e estável (role, status, tipo de item) | Tabela de apoio (lookup table) + FK | Não usar `ENUM` nativo do MySQL (`ALTER` pra adicionar valor trava a tabela e não é portável) nem string livre validada só na aplicação |
| Booleano | `TINYINT(1)` | prefixo `is_`/`has_` no nome da coluna |
| Dado semiestruturado (ex.: preferências livres de um usuário) | `JSON` | usar só quando não faz sentido virar tabela relacional |

## 4. Padrão de migrations

Cada mudança de schema é um arquivo de migration versionado no controle de código, guardado numa pasta própria (`migrations/` na raiz do projeto), nomeado com timestamp + descrição no imperativo em `snake_case`: `<timestamp>_<descrição>`, ex.: `20260820120000_create_sessions_table`, `20260820121500_add_deleted_at_to_users`.

Uma migration corresponde a **uma mudança lógica coesa**: não misturar "criar tabela de sessões" com "adicionar coluna em `users`" no mesmo arquivo.

Uma migration que já rodou em qualquer ambiente compartilhado (staging ou produção) **nunca é editada** — qualquer correção vira uma migration nova. Editar uma migration antiga faz o histórico de quem já aplicou divergir de quem vai aplicar depois, e isso é a causa mais comum de "funciona na minha máquina, quebra no deploy".

Mudança destrutiva (`DROP COLUMN`, `DROP TABLE`, renomear coluna) em tabela com dado em produção segue o padrão **expand/contract** em dois deploys separados: primeiro migration que adiciona o novo formato e faz backfill (mantendo o antigo em paralelo), a aplicação passa a escrever nos dois, só depois de confirmar que nada mais lê o campo antigo é que uma segunda migration o remove.

O ambiente local pode gerar/testar migration livremente; o pipeline de CI/CD, em produção, só **aplica** migrations já commitadas e revisadas — nunca gera uma nova a partir de um diff automático de schema direto em produção.

Todo PR que altera o schema é revisado olhando o SQL real da migration, não só a intenção da mudança — o SQL gerado automaticamente por uma ferramenta nem sempre é o mais seguro em MySQL com tabela grande (por exemplo, um `ALTER TABLE` que reescreve a tabela inteira trava escrita por segundos/minutos; quando aplicável, preferir `ALGORITHM=INPLACE, LOCK=NONE` explicitamente no SQL).

Script de seed (dados de exemplo/demo) roda só em dev/demo — nunca em produção.

Evitar manter uma cópia manual do schema completo em paralelo ao histórico de migrations — o próprio histórico aplicado em ordem já é a fonte da verdade. Se for necessário um dump do schema atual para consulta, gerar automaticamente a partir do banco (`mysqldump --no-data`, por exemplo) em vez de manter um arquivo escrito à mão, que tende a dessincronizar.

## 5. Tabelas reutilizáveis (kit padrão)

Este é o "kit" de tabelas que praticamente todo produto com autenticação real acaba precisando. É comum um protótipo inicial ter só uma tabela `users` com `role`/`status`/permissões como texto livre e nenhuma sessão persistida no servidor — as tabelas abaixo cobrem esse gap quando o projeto precisa de autenticação de verdade.

### 5.1 `users`

```sql
CREATE TABLE `users` (
  `id`            CHAR(26)     NOT NULL,
  `name`          VARCHAR(191) NOT NULL,
  `email`         VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `status_id`     TINYINT UNSIGNED NOT NULL,
  `last_login_at` DATETIME(3)  NULL,
  `created_at`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deleted_at`    DATETIME(3)  NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `uq_users_email` UNIQUE (`email`),
  CONSTRAINT `fk_users_status_id` FOREIGN KEY (`status_id`) REFERENCES `user_statuses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `user_statuses` (
  `id`   TINYINT UNSIGNED NOT NULL,
  `slug` VARCHAR(30) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `uq_user_statuses_slug` UNIQUE (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
-- seed: (1, 'active'), (2, 'suspended'), (3, 'pending')
```

`deleted_at` implementa soft delete: consultas normais filtram `WHERE deleted_at IS NULL`. Se o time preferir não adotar soft delete em tudo, pelo menos em `users` costuma valer a pena (histórico de negócio referenciando um usuário não pode virar linha órfã).

### 5.2 `roles`, `permissions` e RBAC

Substitui as colunas `role`/`perms` de texto livre por um modelo relacional — permite adicionar papel ou permissão nova sem `ALTER` e sem tocar em código de validação:

```sql
CREATE TABLE `roles` (
  `id`   SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `uq_roles_slug` UNIQUE (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
-- seed: papéis do domínio, ex.: (member, editor, admin)

CREATE TABLE `permissions` (
  `id`   SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `uq_permissions_slug` UNIQUE (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `role_permissions` (
  `role_id`       SMALLINT UNSIGNED NOT NULL,
  `permission_id` SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (`role_id`, `permission_id`),
  CONSTRAINT `fk_role_permissions_role_id` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_role_permissions_permission_id` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `user_roles` (
  `user_id` CHAR(26) NOT NULL,
  `role_id` SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (`user_id`, `role_id`),
  CONSTRAINT `fk_user_roles_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_roles_role_id` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

Para um projeto pequeno ou um MVP, RBAC completo pode ser mais do que precisa — uma alternativa mais leve é manter só `roles`/`user_roles` (sem `permissions`/`role_permissions`) e continuar resolvendo permissão fina no código da aplicação. Vale adotar o modelo completo quando permissão granular por usuário passar a ser um requisito real do produto.

### 5.3 `sessions` (autenticação persistida)

Quando a sessão do usuário fica só em memória no client (ex.: estado de um app React), um simples F5 na página derruba o login. Esta tabela resolve isso com sessão validada no servidor via cookie httpOnly:

```sql
CREATE TABLE `sessions` (
  `id`         CHAR(26)     NOT NULL,
  `user_id`    CHAR(26)     NOT NULL,
  `token_hash` CHAR(64)     NOT NULL COMMENT 'SHA-256 do token — nunca o token bruto',
  `user_agent` VARCHAR(255) NULL,
  `ip_address` VARCHAR(45)  NULL,
  `expires_at` DATETIME(3)  NOT NULL,
  `created_at` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  CONSTRAINT `uq_sessions_token_hash` UNIQUE (`token_hash`),
  CONSTRAINT `fk_sessions_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_sessions_user_id` (`user_id`),
  INDEX `idx_sessions_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

Igual à senha: o banco nunca guarda o token de sessão em texto puro, só o hash — se o banco vazar, os tokens vazados não servem pra logar como ninguém.

### 5.4 `password_reset_tokens`

Estrutura padrão para um fluxo real de "esqueci minha senha" — sem essa tabela, o fluxo tende a ficar só de fachada (tela existe, mas não persiste nem valida nada de verdade):

```sql
CREATE TABLE `password_reset_tokens` (
  `id`         CHAR(26)    NOT NULL,
  `user_id`    CHAR(26)    NOT NULL,
  `token_hash` CHAR(64)    NOT NULL,
  `expires_at` DATETIME(3) NOT NULL,
  `used_at`    DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  CONSTRAINT `uq_password_reset_tokens_token_hash` UNIQUE (`token_hash`),
  CONSTRAINT `fk_password_reset_tokens_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_password_reset_tokens_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

Regra de uso: token expira curto (15–60 min), `used_at` marcado no primeiro uso e nunca reaproveitado, e o e-mail enviado ao usuário carrega o token bruto — só o hash fica no banco, igual sessão.

### 5.5 `audit_log`

Uma tabela de atividade dedicada a uma única entidade (ex.: só atividade de usuário) tende a se repetir conforme o produto cresce. Um log de auditoria genérico e polimórfico cobre qualquer entidade do domínio (registro criado, item removido, campo editado) numa tabela só:

```sql
CREATE TABLE `audit_log` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `actor_user_id` CHAR(26)     NULL COMMENT 'quem fez a ação; NULL = sistema',
  `entity_type`   VARCHAR(50)  NOT NULL COMMENT 'ex.: order, invoice, user, product',
  `entity_id`     CHAR(26)     NOT NULL,
  `action`        VARCHAR(50)  NOT NULL COMMENT 'ex.: created, updated, deleted',
  `metadata`      JSON         NULL,
  `created_at`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_audit_log_actor_user_id` FOREIGN KEY (`actor_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_audit_log_entity` (`entity_type`, `entity_id`),
  INDEX `idx_audit_log_actor_user_id` (`actor_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

Uma tela de histórico por registro (ex.: detalhe de um pedido, detalhe de um usuário) só precisa filtrar `WHERE entity_type = '<tipo>' AND entity_id = :id`, em vez de existir uma tabela de atividade dedicada por entidade.

## 6. Exemplo de referência — duas tabelas seguindo o padrão completo

Par de tabelas ilustrando o padrão inteiro aplicado desde o início (útil como gabarito ao desenhar uma tabela nova): uma tabela pai e uma tabela filha relacionada, com PK em ULID, FK nomeada e indexada, valor monetário em `DECIMAL`, colunas de auditoria e status resolvido por lookup table em vez de string livre.

```sql
CREATE TABLE `customers` (
  `id`         CHAR(26)     NOT NULL,
  `name`       VARCHAR(191) NOT NULL,
  `email`      VARCHAR(255) NOT NULL,
  `status_id`  TINYINT UNSIGNED NOT NULL,
  `created_at` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deleted_at` DATETIME(3)  NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `uq_customers_email` UNIQUE (`email`),
  CONSTRAINT `fk_customers_status_id` FOREIGN KEY (`status_id`) REFERENCES `customer_statuses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `orders` (
  `id`          CHAR(26)      NOT NULL,
  `customer_id` CHAR(26)      NOT NULL,
  `total`       DECIMAL(18,2) NOT NULL,
  `placed_at`   DATETIME(3)   NOT NULL,
  `created_at`  DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`  DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_orders_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  INDEX `idx_orders_customer_id` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

Toda tabela filha nova em qualquer projeto segue esse mesmo esqueleto: FK obrigatoriamente indexada e nomeada (`fk_<tabela>_<coluna>`), auditoria fixa, dinheiro sempre em `DECIMAL`, categoria fechada sempre via lookup table.

## 7. Segurança — pontos que já valem preservar / reforçar

Hash de senha usa `scrypt`, `bcrypt` ou `argon2id` com salt aleatório, nunca um hash rápido de propósito geral (`MD5`, `SHA-1`, `SHA-256` puro). Comparação de segredo (senha, token) sempre em tempo constante (`timingSafeEqual` ou equivalente), nunca com `==`/`===` direto — evita vazar informação por timing attack. Vale o mesmo truque de rodar a verificação mesmo quando o registro não existe (comparar contra um hash "dummy"), para que uma tentativa com e-mail inexistente e uma com senha errada levem aproximadamente o mesmo tempo. O padrão de qualquer tabela nova que guarde segredo (token de sessão, token de reset) é o mesmo do hash de senha: nunca gravar o valor bruto, sempre hash, e comparar em tempo constante.

Nunca usar `FLOAT`/`DOUBLE` para dinheiro (seção 3). Toda FK tem índice (o InnoDB exige um índice na coluna de FK, então isso já é forçado). Toda tabela usa `utf8mb4`. Toda query é parametrizada — nunca concatenar SQL manualmente, mesmo passando pelo ORM/camada de acesso a dados.

## 8. Checklist antes de mergear uma migration

| Verificar | Por quê |
|---|---|
| Nome da migration está no padrão `<timestamp>_<verbo_snake_case>` | Consistência e histórico legível |
| O SQL real da migration foi lido, não só a intenção da mudança | O SQL gerado automaticamente às vezes não é o mais seguro para tabela grande |
| Nenhuma migration antiga foi editada | Editar quebra a consistência do histórico entre ambientes |
| Coluna de dinheiro é `DECIMAL`, nunca `FLOAT`/`DOUBLE` | Erro de arredondamento em app financeiro |
| Toda tabela nova tem `created_at`/`updated_at` | Padrão de auditoria mínimo |
| Todo nome de tabela/coluna/índice segue a seção 2 | Consistência de nomenclatura |
| Mudança destrutiva usa expand/contract (seção 4) se já houver dado em produção | Evita perda de dado ou downtime |
| Script de seed não foi alterado para rodar em produção | Seed é só dev/demo |
