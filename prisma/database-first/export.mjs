#!/usr/bin/env node
// MyWallet — exporta o banco SQLite gerado pelo Prisma para scripts SQL "neutros"
// (MySQL/MariaDB, PostgreSQL, SQL Server e SQLite), prontos para serem carregados
// num servidor de banco e lidos por ferramentas Database First (EF Core scaffold,
// Radzen, Django inspectdb, JPA/Hibernate Tools, Laravel generators, NocoDB etc.).
//
// A estrutura é lida do PRÓPRIO banco (introspecção do dev.db), não do schema.prisma —
// assim o resultado é exatamente o que existe no arquivo .db.
//
// Uso (a partir da raiz do projeto):
//   npm run db:export                       # usa DATABASE_URL do .env, ou ./dev.db
//   node prisma/database-first/export.mjs caminho/para/outro.db
//
// Saída: prisma/database-first/{mysql,postgresql,sqlserver,sqlite}/

import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const OUT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(OUT_DIR, "..", "..");

try {
  await import("dotenv/config");
} catch {
  /* dotenv é opcional */
}

// Colunas de texto livre/longo -> TEXT / NVARCHAR(MAX). As demais strings viram VARCHAR.
// Ajuste aqui se surgirem novos campos longos.
const LONG_TEXT = new Set([
  "Article.summary",
  "Article.body",
  "Promotion.description",
  "InvestorProfileResult.answers",
]);

// Tabelas internas que não fazem parte do domínio.
const SKIP_TABLES = new Set(["_prisma_migrations", "sqlite_sequence"]);

function resolveDbPath() {
  const arg = process.argv[2];
  if (arg) return path.resolve(arg);
  const url = process.env.DATABASE_URL;
  if (url && url.startsWith("file:")) {
    const p = url.slice("file:".length);
    const abs = path.isAbsolute(p) || /^[A-Za-z]:[\\/]/.test(p) ? p : path.resolve(ROOT, p);
    if (fs.existsSync(abs)) return abs;
  }
  return path.join(ROOT, "dev.db");
}

// ---------------------------------------------------------------------------
// Introspecção do SQLite
// ---------------------------------------------------------------------------
function introspect(db) {
  const rows = db
    .prepare("SELECT name, sql FROM sqlite_master WHERE type = 'table' ORDER BY name")
    .all()
    .filter((t) => !SKIP_TABLES.has(t.name) && !t.name.startsWith("sqlite_"));

  const tables = rows.map(({ name, sql }) => {
    const cols = db.prepare(`PRAGMA table_info("${name}")`).all();
    const pk = cols.filter((c) => c.pk > 0).sort((a, b) => a.pk - b.pk).map((c) => c.name);
    const autoInc = /AUTOINCREMENT/i.test(sql) && pk.length === 1 ? pk[0] : null;

    const fks = new Map();
    for (const fk of db.prepare(`PRAGMA foreign_key_list("${name}")`).all()) {
      if (!fks.has(fk.id)) {
        fks.set(fk.id, { table: fk.table, from: [], to: [], onDelete: fk.on_delete, onUpdate: fk.on_update });
      }
      fks.get(fk.id).from.push(fk.from);
      fks.get(fk.id).to.push(fk.to);
    }

    const indexes = db
      .prepare(`PRAGMA index_list("${name}")`)
      .all()
      .filter((i) => i.origin === "c" || i.origin === "u")
      .map((i) => ({
        name: i.name,
        unique: !!i.unique,
        columns: db.prepare(`PRAGMA index_info("${i.name}")`).all().map((c) => c.name),
      }));

    const keyCols = new Set([
      ...pk,
      ...[...fks.values()].flatMap((f) => f.from),
      ...indexes.flatMap((i) => i.columns),
    ]);

    return {
      name,
      pk,
      autoInc,
      fks: [...fks.values()],
      indexes,
      columns: cols.map((c) => ({
        name: c.name,
        type: (c.type || "TEXT").toUpperCase(),
        notNull: !!c.notnull || c.pk > 0,
        default: c.dflt_value,
        isKey: keyCols.has(c.name),
        isLong: LONG_TEXT.has(`${name}.${c.name}`),
      })),
    };
  });

  // Ordena pais antes de filhos (para CREATE e INSERT).
  const sorted = [];
  const done = new Set();
  const visit = (t, stack = new Set()) => {
    if (done.has(t.name) || stack.has(t.name)) return;
    stack.add(t.name);
    for (const fk of t.fks) {
      const parent = tables.find((x) => x.name === fk.table);
      if (parent && parent !== t) visit(parent, stack);
    }
    done.add(t.name);
    sorted.push(t);
  };
  tables.forEach((t) => visit(t));
  return sorted;
}

// ---------------------------------------------------------------------------
// Dialetos
// ---------------------------------------------------------------------------
const isBool = (c) => c.type.startsWith("BOOL");
const isInt = (c) => c.type.includes("INT");
const isReal = (c) => /REAL|FLOA|DOUB|NUMERIC|DECIMAL/.test(c.type);

const dialects = {
  mysql: {
    title: "MySQL 8+ / MariaDB 10.5+",
    q: (n) => "`" + n + "`",
    type(c) {
      if (isBool(c)) return "BOOLEAN";
      if (isInt(c)) return "INT";
      if (isReal(c)) return "DOUBLE";
      if (c.isLong) return "TEXT";
      return c.isKey ? "VARCHAR(191)" : "VARCHAR(255)";
    },
    autoInc: () => " AUTO_INCREMENT",
    bool: (v) => (v ? "1" : "0"),
    str: (s) => "'" + s.replace(/\\/g, "\\\\").replace(/'/g, "''") + "'",
    header: (dbName) =>
      [
        "SET NAMES utf8mb4;",
        `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
        `USE \`${dbName}\`;`,
        "SET FOREIGN_KEY_CHECKS = 0;",
      ].join("\n"),
    drop: (t) => `DROP TABLE IF EXISTS \`${t}\`;`,
    tableSuffix: " ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
    footer: () => "SET FOREIGN_KEY_CHECKS = 1;",
    dataHeader: (dbName) => `SET NAMES utf8mb4;\nUSE \`${dbName}\`;\nSET FOREIGN_KEY_CHECKS = 0;`,
    dataFooter: () => "SET FOREIGN_KEY_CHECKS = 1;",
    beforeInsert: () => "",
    afterInsert: () => "",
    go: "",
  },

  postgresql: {
    title: "PostgreSQL 12+",
    q: (n) => '"' + n + '"',
    type(c) {
      if (isBool(c)) return "BOOLEAN";
      if (isInt(c)) return "INTEGER";
      if (isReal(c)) return "DOUBLE PRECISION";
      if (c.isLong) return "TEXT";
      return c.isKey ? "VARCHAR(191)" : "VARCHAR(255)";
    },
    autoInc: () => " GENERATED BY DEFAULT AS IDENTITY",
    bool: (v) => (v ? "TRUE" : "FALSE"),
    str: (s) => "'" + s.replace(/'/g, "''") + "'",
    header: () => "SET client_encoding = 'UTF8';",
    drop: (t) => `DROP TABLE IF EXISTS "${t}" CASCADE;`,
    tableSuffix: "",
    footer: () => "",
    dataHeader: () => "SET client_encoding = 'UTF8';\nBEGIN;",
    dataFooter: () => "COMMIT;",
    beforeInsert: () => "",
    afterInsert: (t) =>
      t.autoInc
        ? `SELECT setval(pg_get_serial_sequence('"${t.name}"', '${t.autoInc}'), COALESCE((SELECT MAX("${t.autoInc}") FROM "${t.name}"), 0) + 1, false);`
        : "",
    go: "",
  },

  sqlserver: {
    title: "SQL Server 2016+ / Azure SQL",
    q: (n) => "[" + n + "]",
    type(c) {
      if (isBool(c)) return "BIT";
      if (isInt(c)) return "INT";
      if (isReal(c)) return "FLOAT";
      if (c.isLong) return "NVARCHAR(MAX)";
      return c.isKey ? "NVARCHAR(191)" : "NVARCHAR(255)";
    },
    autoInc: () => " IDENTITY(1,1)",
    bool: (v) => (v ? "1" : "0"),
    str: (s) => "N'" + s.replace(/'/g, "''") + "'",
    header: (dbName) =>
      [
        `IF DB_ID(N'${dbName}') IS NULL CREATE DATABASE [${dbName}];`,
        "GO",
        `USE [${dbName}];`,
        "GO",
      ].join("\n"),
    drop: (t) => `DROP TABLE IF EXISTS [${t}];`,
    tableSuffix: "",
    footer: () => "GO",
    dataHeader: (dbName) => `USE [${dbName}];\nGO\nSET NOCOUNT ON;`,
    dataFooter: () => "GO",
    beforeInsert: (t) => (t.autoInc ? `SET IDENTITY_INSERT [${t.name}] ON;` : ""),
    afterInsert: (t) => (t.autoInc ? `SET IDENTITY_INSERT [${t.name}] OFF;` : ""),
    go: "GO",
  },
};

function defaultSql(d, c) {
  if (c.default == null) return "";
  const raw = String(c.default).trim();
  if (isBool(c)) return ` DEFAULT ${d.bool(/^(1|true)$/i.test(raw))}`;
  if (/^'.*'$/s.test(raw)) return ` DEFAULT ${d.str(raw.slice(1, -1).replace(/''/g, "'"))}`;
  return ` DEFAULT ${raw}`;
}

const refAction = (a) => (a && a !== "NO ACTION" ? a : "NO ACTION");

function schemaSql(d, tables, dbName) {
  const out = [];
  out.push(`-- MyWallet — schema ${d.title}`);
  out.push(`-- Gerado por prisma/database-first/export.mjs a partir do dev.db (Prisma/SQLite).`);
  out.push(`-- Não edite à mão: rode "npm run db:export" de novo após mudar o schema.prisma.`);
  out.push("");
  out.push(d.header(dbName));
  out.push("");
  for (const t of [...tables].reverse()) out.push(d.drop(t.name));
  if (d.go) out.push(d.go);
  out.push("");

  for (const t of tables) {
    const lines = t.columns.map((c) => {
      let s = `    ${d.q(c.name)} ${d.type(c)}`;
      if (c.name === t.autoInc) s += d.autoInc();
      s += c.notNull ? " NOT NULL" : " NULL";
      s += defaultSql(d, c);
      return s;
    });
    lines.push(`    CONSTRAINT ${d.q(t.name + "_pkey")} PRIMARY KEY (${t.pk.map(d.q).join(", ")})`);
    out.push(`CREATE TABLE ${d.q(t.name)} (\n${lines.join(",\n")}\n)${d.tableSuffix};`);
    for (const i of t.indexes) {
      out.push(
        `CREATE ${i.unique ? "UNIQUE " : ""}INDEX ${d.q(i.name)} ON ${d.q(t.name)} (${i.columns.map(d.q).join(", ")});`
      );
    }
    out.push("");
  }

  for (const t of tables) {
    for (const fk of t.fks) {
      const name = `${t.name}_${fk.from.join("_")}_fkey`;
      out.push(
        `ALTER TABLE ${d.q(t.name)} ADD CONSTRAINT ${d.q(name)} FOREIGN KEY (${fk.from.map(d.q).join(", ")}) ` +
          `REFERENCES ${d.q(fk.table)} (${fk.to.map(d.q).join(", ")}) ` +
          `ON DELETE ${refAction(fk.onDelete)} ON UPDATE ${refAction(fk.onUpdate)};`
      );
    }
  }
  const footer = d.footer();
  if (footer) out.push("", footer);
  return out.join("\n") + "\n";
}

function literal(d, c, v) {
  if (v === null || v === undefined) return "NULL";
  if (isBool(c)) return d.bool(v === 1 || v === true || v === "true");
  if (typeof v === "number" || typeof v === "bigint") return String(v);
  if (Buffer.isBuffer(v)) throw new Error(`BLOB não suportado em ${c.name}`);
  return d.str(String(v));
}

function dataSql(d, tables, db, dbName) {
  const out = [];
  out.push(`-- MyWallet — dados de demonstração (${d.title})`);
  out.push(`-- Rode DEPOIS do 01-schema.sql. Gerado por prisma/database-first/export.mjs.`);
  out.push("");
  out.push(d.dataHeader(dbName));
  out.push("");
  for (const t of tables) {
    const rows = db.prepare(`SELECT * FROM "${t.name}"`).all();
    if (!rows.length) continue;
    out.push(`-- ${t.name} (${rows.length})`);
    const pre = d.beforeInsert(t);
    if (pre) out.push(pre);
    const cols = t.columns.map((c) => d.q(c.name)).join(", ");
    for (const r of rows) {
      const vals = t.columns.map((c) => literal(d, c, r[c.name])).join(", ");
      out.push(`INSERT INTO ${d.q(t.name)} (${cols}) VALUES (${vals});`);
    }
    const post = d.afterInsert(t);
    if (post) out.push(post);
    out.push("");
  }
  out.push(d.dataFooter());
  return out.join("\n") + "\n";
}

// SQLite: DDL limpo (sem a tabela interna do Prisma) + cópia do .db sem _prisma_migrations.
function sqliteOutputs(db, tables, dbPath, dir) {
  const ddl = [
    "-- MyWallet — schema SQLite (idêntico ao dev.db, sem a tabela interna _prisma_migrations)",
    "-- Gerado por prisma/database-first/export.mjs.",
    "PRAGMA foreign_keys = ON;",
    "",
  ];
  for (const t of [...tables].reverse()) ddl.push(`DROP TABLE IF EXISTS "${t.name}";`);
  ddl.push("");
  for (const t of tables) {
    ddl.push(db.prepare("SELECT sql FROM sqlite_master WHERE name = ?").get(t.name).sql + ";");
    for (const i of t.indexes) {
      const s = db.prepare("SELECT sql FROM sqlite_master WHERE name = ?").get(i.name)?.sql;
      if (s) ddl.push(s + ";");
    }
    ddl.push("");
  }
  fs.writeFileSync(path.join(dir, "01-schema.sql"), ddl.join("\n"));

  const target = path.join(dir, "mywallet.db");
  fs.rmSync(target, { force: true });
  db.exec(`VACUUM INTO '${target.replace(/'/g, "''")}'`);
  const copy = new Database(target);
  copy.exec('DROP TABLE IF EXISTS "_prisma_migrations"; VACUUM;');
  copy.close();
}

// ---------------------------------------------------------------------------
const dbPath = resolveDbPath();
if (!fs.existsSync(dbPath)) {
  console.error(`Banco não encontrado: ${dbPath}\nRode "npm run db:migrate" e "npm run db:seed" primeiro.`);
  process.exit(1);
}
const DB_NAME = process.env.EXPORT_DB_NAME || "mywallet";
const db = new Database(dbPath, { readonly: true, fileMustExist: true });
const tables = introspect(db);

for (const [key, d] of Object.entries(dialects)) {
  const dir = path.join(OUT_DIR, key);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "01-schema.sql"), schemaSql(d, tables, DB_NAME));
  fs.writeFileSync(path.join(dir, "02-data.sql"), dataSql(d, tables, db, DB_NAME));
}
const sqliteDir = path.join(OUT_DIR, "sqlite");
fs.mkdirSync(sqliteDir, { recursive: true });
sqliteOutputs(db, tables, dbPath, sqliteDir);
db.close();

console.log(`Origem: ${dbPath}`);
console.log(`Tabelas (${tables.length}): ${tables.map((t) => t.name).join(", ")}`);
console.log(`Scripts gerados em ${path.relative(ROOT, OUT_DIR)}/{mysql,postgresql,sqlserver,sqlite}`);
