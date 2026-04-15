# Schema SQLite — Banco Local do App

**Derivado das migrations da API em:** 28/03/2026  
**Atualização `events` + `orders.event_id`:** 29/03/2026 — alinhado a `2026_03_29_044250_create_events_table.php` e `2026_03_29_044252_add_event_id_to_orders_table.php`

**Versão do schema local:** 3 (`events` definitiva + `orders`/`order_items` inteiros + tabelas de backup)

**Migrations do app (`app/db/migrations.ts`):** `SCHEMA_VERSION` **2** — em instalações que já tinham o arquivo SQLite na revisão 1, `migrateToV2AutoincrementPullTables` recria `product_categories`, `products`, `clients`, `payment_methods` e `events` com `INTEGER PRIMARY KEY AUTOINCREMENT`, copiando linhas e preservando `id` (FKs de `orders` / `order_items` intactas). Instalações novas recebem esse DDL já na `migrateToV1` e não executam a v2.

---

## Contexto e Decisões de Design

### O que foi omitido da API

| Omitido | Motivo |
|---|---|
| `distributor_id` em todas as tabelas | A API já filtra por distribuidor do seller logado. O SQLite inteiro é implicitamente scoped a um distribuidor. |
| Tabela `sales_representatives` | O seller logado está em `ApplicationSettings` via `getAuth()`. Não há necessidade de cache local. |
| Tabela `users` | Usuários admin do backend — irrelevante no app. |
| `password`, `remember_token` | Auth é feita via token Bearer em `ApplicationSettings`. |
| `distributor`, `cache`, `jobs`, `sessions`, `personal_access_tokens` | Infraestrutura de backend. |

### Convenções do schema local

| Convenção | Detalhe |
|---|---|
| `price` como `REAL` | SQLite não tem `DECIMAL`. Usamos `REAL` (float), consistente com `number` do TypeScript já em uso. |
| `id INTEGER` PK em `orders` | Ver subseção abaixo (**sempre** inteiro local; autoincrement ao criar offline; no pull, `id` gravado = id da API). |
| `remote_id` em `orders` | Ver subseção abaixo (espelho do id na API; `NULL` só enquanto o servidor ainda não “conhece” o pedido). |
| `id INTEGER` PK em `order_items` | **Autoincremento**; `order_id INTEGER` referencia `orders(id)`. |
| `INTEGER PRIMARY KEY AUTOINCREMENT` (catálogo + `clients`) | `product_categories`, `products`, `clients`, `payment_methods`, `events`: PK com `AUTOINCREMENT` no DDL. **Pull:** `INSERT OR REPLACE` com `id` explícito da API. **Cliente novo offline:** ver subseção *`ClientsRepository.upsertOne` (resolução de `id`)* abaixo. Não se usa `MAX(id)+1` em código. |
| `synced_at TEXT NULL` em orders | `NULL` = pendente de sync. ISO 8601 após sync. Itens não têm `synced_at` próprio — são sync atômico com o pedido pai. |
| `updated_at` em tabelas pull-only | Útil na **V2** (sync incremental na API); na V1 só acompanha o payload da API. |
| Datas como `TEXT` (ISO 8601) | SQLite não tem tipo `DATETIME` nativo. Padrão: `'2026-03-28T14:00:00Z'`. |

### `id` e `remote_id` em `orders` (refinado)

**`id` (PK local, inteiro)**  
- **Offline / novo pedido:** `INSERT` **sem** informar `id` → SQLite **AUTOINCREMENT** gera o próximo inteiro — são “nossos” ids até existir correspondência na API.  
- **Pull da API (login, após wipe):** gravar com **`id` explícito** = id retornado pela API. Nesse caso **`id` = `remote_id`** (mesmo valor).  
- **Após push bem-sucedido:** **realinhar** o registro local para que **`id` = `remote_id` = id devolvido pela API** (e atualizar `order_items.order_id` na mesma transação — ver `specs/04-sync-push.md`).

**Por que evitar conflito de `id`?**  
Antes de cada login com wipe, pedidos com `synced_at IS NULL` vão para **backup**; em seguida as tabelas operacionais são limpas. O pull recria `orders` com ids da API. Assim, na prática, não se mistura no mesmo ciclo um pedido local antigo (autoincrement) com o mesmo número que a API usará — o wipe remove a base antes do pull.

**`remote_id`**  
- Representa o **id canônico na API** (maior fonte de verdade quando já existe no servidor).  
- **`NULL`:** pedido criado só no device e ainda **não** aceito/gravado na API (operação offline com “nosso” `id` apenas).  
- **Preenchido:** após push com sucesso **ou** linha vinda do pull; quando consolidado, manter **`id` = `remote_id`**.

**Restauração a partir de backup (backlog — botão “Restaurar”)**  
Ao recolocar um pedido do backup na tabela `orders`, o **`id` salvo no backup pode já estar ocupado** por outro pedido (ex.: após um pull que trouxe esse id da API). Nesse caso **atribuir um novo `id` local** (novo autoincrement), atualizar todos os `order_items.order_id` do pedido restaurado e ajustar `remote_id` / `synced_at` conforme a regra de negócio (pedido restaurado continua assíncrono até novo push). Filtrar restauração **por `sales_representative_id`** quando o botão for “pedidos assíncronos deste seller”.

**Riscos residuais (baixa probabilidade na V1):**  
- Bypass do fluxo (dados inseridos manualmente / migração quebrada) pode gerar colisão de `id` — mitigação: invariantes no repositório e testes no restore.  
- Após pull com muitos ids altos da API, o próximo autoincrement local fica acima do maior `id` existente (comportamento normal do SQLite ao inserir ids explícitos).

---

## Tabelas Pull-Only

Recebidas da API durante o sync. **Nunca modificadas localmente** (exceto onde indicado).
Estratégia de upsert: `INSERT OR REPLACE INTO`.

**Exceção:** a tabela **`clients`** também aceita **criação e edição offline** no app (`ClientsRepository.upsertOne`, formulário em `ClientFormComponent.vue`). Linhas locais novas usam `remote_id IS NULL` e `is_sync = 0` até existir fluxo de criação na API no push (hoje o push chama apenas `PATCH` por `remote_id` — ver `specs/05-composables.md` secção “Formulário de cliente”).

---

### `events`

**Fonte na API:** `events` com `id`, `distributor_id`, `name`, `start` (date), `end` (date), `timestamps`, unique `(distributor_id, name)`.

**No SQLite local:** omite-se `distributor_id` (tenant implícito pelo seller logado). Colunas `start` e `end` espelham o tipo **date** do Laravel: armazenar como `TEXT` no formato **`YYYY-MM-DD`** (igual ao JSON típico da API).

**Relacionamento:** 1 event → N `orders` (FK `orders.event_id` na API e no app local).

```sql
CREATE TABLE IF NOT EXISTS events (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    remote_id   INTEGER,
    is_sync     INTEGER NOT NULL DEFAULT 0,
    name        TEXT    NOT NULL,
    start       TEXT    NOT NULL,   -- date API → 'YYYY-MM-DD'
    end         TEXT    NOT NULL,   -- date API → 'YYYY-MM-DD'
    created_at  TEXT    NOT NULL,
    updated_at  TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_start ON events(start);
```

**Tipo TypeScript sugerido** (`app/types/event.ts` — criar na implementação):

```typescript
export interface Event {
    id: number;
    name: string;
    start: string;   // YYYY-MM-DD
    end: string;     // YYYY-MM-DD
    created_at: string;
    updated_at: string;
}
```

> O arquivo legado `app/types/event-item.ts` mistura campos de **lista de UI** (totais, contagens, `status` string). Não corresponde à linha do SQLite. Preferir `Event` para dados vindos do pull; agregações (valor total, pedidos sync/não sync) vêm de queries em `orders` ou de computed no composable.

---

### `product_categories`

```sql
CREATE TABLE IF NOT EXISTS product_categories (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    remote_id   INTEGER,
    is_sync     INTEGER NOT NULL DEFAULT 0,
    name        TEXT    NOT NULL,
    created_at  TEXT    NOT NULL DEFAULT '',
    updated_at  TEXT    NOT NULL
);
```

---

### `products`

```sql
CREATE TABLE IF NOT EXISTS products (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    remote_id            INTEGER,
    is_sync              INTEGER NOT NULL DEFAULT 0,
    sku                  TEXT    NOT NULL,
    barcode              TEXT,
    name                 TEXT    NOT NULL,
    price                REAL    NOT NULL,  -- 4 casas decimais vindas da API
    product_category_id  INTEGER NOT NULL REFERENCES product_categories(id),
    created_at           TEXT    NOT NULL DEFAULT '',
    updated_at           TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_sku     ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(product_category_id);
```

---

### `clients`

**Tipo TypeScript:** `app/types/schema/client.ts` — `id` e `remote_id` podem ser `null` em rascunho local; `is_sync` espelha o backend após pull/push.

**Fonte de verdade do DDL:** `app/db/migrations.ts` (abaixo espelha o que está no código).

```sql
CREATE TABLE IF NOT EXISTS clients (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    remote_id        INTEGER,
    is_sync          INTEGER NOT NULL DEFAULT 0,
    cpf_cnpj         TEXT    NOT NULL,
    corporate_name   TEXT    NOT NULL,
    fantasy_name     TEXT,
    email            TEXT,
    phone            TEXT,
    carrier          TEXT,
    created_at       TEXT    NOT NULL DEFAULT '',
    updated_at       TEXT    NOT NULL
);

CREATE UNIQUE INDEX idx_clients_cpf_cnpj ON clients(cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_clients_corporate_name ON clients(corporate_name);
```

- **`cpf_cnpj`:** unicidade no SQLite (índice único). A validação de formulário também consulta `ClientsRepository.loadByCpfCnpj` antes de gravar, com `ignoreClientId` na edição para permitir o mesmo registro ao salvar alterações sem mudar o documento.
- **Cliente novo offline:** `INSERT` com `id` nulo → SQLite gera a PK (`AUTOINCREMENT`). `is_sync` fica `false` após salvar pelo formulário até o push.

#### `ClientsRepository.upsertOne` (resolução de `id` após insert)

Implementação em `app/db/repositories/clients.repo.ts`:

1. `INSERT OR REPLACE` com as colunas de `CLIENT_COLUMNS` (inclui `id` nulo para linha nova).
2. `ClientsComposable.refresh()` — recarrega a lista a partir de `findAll()` (`ORDER BY corporate_name ASC`).
3. Se ainda `client.id == null`, substitui o objeto retornado pelo **último elemento** de `ClientsComposable.getList()` (último índice do array após o refresh).

**Intenção:** evitar `last_insert_rowid()` e reaproveitar o estado já materializado no composable.

**Limitações a ter em mente (para evolução ou outras entidades):**

- A lista **não** está ordenada por ordem de inserção nem por `id`; o último item é o **último `corporate_name` na ordenação ASC** — em geral **não** é uma garantia formal de que seja o registro acabado de inserir.
- Dois `upsertOne` concorrentes com `id` nulo podem cruzar o refresh e o “último da lista” da mesma forma que cruzariam `last_insert_rowid()` em conexão compartilhada.

**Alternativas documentadas para o futuro:** recarregar a linha por chave estável (`loadByCpfCnpj` após o insert); ou `last_insert_rowid()` / transação na mesma conexão; ou fila de escrita serializada.

---

### `payment_methods`

```sql
CREATE TABLE IF NOT EXISTS payment_methods (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    remote_id   INTEGER,
    is_sync     INTEGER NOT NULL DEFAULT 0,
    name        TEXT    NOT NULL,
    created_at  TEXT    NOT NULL DEFAULT '',
    updated_at  TEXT    NOT NULL
);
```

---

## Tabelas operacionais de pedido

Pedidos são **criados offline** (autoincremento) e **puxados no login** (id explícito da API). Ver também `specs/00-architecture.md` (ciclo login/logout) e `specs/03-sync-pull.md` (pull completo vs catálogo).

---

### `orders`

```sql
CREATE TABLE IF NOT EXISTS orders (
    id                        INTEGER PRIMARY KEY AUTOINCREMENT,
    remote_id                 INTEGER UNIQUE,               -- NULL = API ainda não tem este pedido; depois = id da API (espelho da verdade)
    event_id                  INTEGER NOT NULL REFERENCES events(id),
    status                    TEXT    NOT NULL DEFAULT 'Pending',
    notes                     TEXT,
    client_id                 INTEGER NOT NULL REFERENCES clients(id),
    sales_representative_id   INTEGER NOT NULL,             -- de getAuth().sales_representative.id
    payment_method_id         INTEGER NOT NULL REFERENCES payment_methods(id),
    synced_at                 TEXT,                         -- NULL = pendente; ISO 8601 após sync/pull da API
    created_at                TEXT    NOT NULL,
    updated_at                TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_event_id  ON orders(event_id);
CREATE INDEX IF NOT EXISTS idx_orders_synced_at ON orders(synced_at);
```

**Alinhamento API:** `orders.event_id` na API. Pull no login: `id` e `remote_id` iguais ao payload. Push de pedido novo: após resposta, **realinhar** `id` = `remote_id` = id da API e atualizar `order_items.order_id` na mesma transação.

**Status possíveis:** `'Pending'` | `'Closed'` | `'Canceled'`

> `sales_representative_id` vem de `getAuth()` na criação. **Não** há fluxo extra de “identificar seller no login” além disso: se **não** houver linhas em `orders` antes do wipe, tratar como se não houvesse contexto de seller anterior; se houver pedidos, o responsável está nesta coluna (útil para UI/debug e para o futuro botão de restaurar backup **por seller**).

---

### `order_items`

```sql
CREATE TABLE IF NOT EXISTS order_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id    INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id  INTEGER NOT NULL REFERENCES products(id),
    price       REAL    NOT NULL,
    qty         INTEGER NOT NULL,
    notes       TEXT
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
```

> **Snapshot de preço:** o `price` é copiado do produto no momento da criação do item. Nunca é atualizado, mesmo que o produto mude de preço depois. Isso garante integridade do pedido criado offline.

> `order_items` não têm `synced_at` próprio. Quando o pedido pai (`orders`) é sincronizado, todos os seus itens são enviados atomicamente no mesmo payload.

---

## Backup (pré-login — pedidos assíncronos)

**Objetivo:** antes do **wipe** no login (ver `specs/00-architecture.md`), se existir **qualquer** pedido com `synced_at IS NULL`, copiar esses pedidos e seus itens para backup **independente do seller que vai logar**. **Sem push** antes do backup. **V1:** só armazenar. **Backlog:** botão **Restaurar** (ex.: na Profile) para recolocar pedidos assíncronos **do seller atual** (filtrar por `sales_representative_id` no backup), com remapeamento de `id` se houver colisão — ver subseção “Restauração” em `id`/`remote_id` acima.

### `orders_backup`

Cópia dos campos do pedido no momento do backup + metadados.

```sql
CREATE TABLE IF NOT EXISTS orders_backup (
    backup_id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    backed_up_at              TEXT    NOT NULL,
    reason                    TEXT    NOT NULL DEFAULT 'pre_login_unsynced',
    id                        INTEGER NOT NULL,
    remote_id                 INTEGER,
    event_id                  INTEGER NOT NULL,
    status                    TEXT    NOT NULL,
    notes                     TEXT,
    client_id                 INTEGER NOT NULL,
    sales_representative_id   INTEGER NOT NULL,
    payment_method_id         INTEGER NOT NULL,
    synced_at                 TEXT,
    created_at                TEXT    NOT NULL,
    updated_at                TEXT    NOT NULL
);
```

### `order_items_backup`

```sql
CREATE TABLE IF NOT EXISTS order_items_backup (
    backup_id     INTEGER PRIMARY KEY AUTOINCREMENT,
    backed_up_at  TEXT    NOT NULL,
    order_id      INTEGER NOT NULL,
    id            INTEGER NOT NULL,
    product_id    INTEGER NOT NULL,
    price         REAL    NOT NULL,
    qty           INTEGER NOT NULL,
    notes         TEXT
);
```

> `order_id` em `order_items_backup` é o **id do pedido na tabela `orders` no momento do backup** (para correlacionar itens ao pedido copiado).

---

## Metadados de Sync

### `sync_log`

Rastreia o último pull bem-sucedido por entidade. Na **V1** serve como registro/auditoria; na **V2** pode alimentar sync incremental se a API suportar filtro por data.

```sql
CREATE TABLE IF NOT EXISTS sync_log (
    entity      TEXT    PRIMARY KEY,   -- 'events' | 'product_categories' | 'products' | 'clients' | 'payment_methods' | 'orders' | 'order_items'
    pulled_at   TEXT    NOT NULL        -- ISO 8601 do último pull bem-sucedido
);
```

**V1:** atualizar `pulled_at` após cada pull completa e sem erros da entidade (sem usar o valor como query param ainda).

**V2 (backlog):** consultar `pulled_at` para montar `?updated_after=<pulled_at>` (ou equivalente) quando existir contrato na API.

---

## Ordem de Criação das Tabelas (migrations.ts)

A ordem respeita as dependências de chaves estrangeiras:

```
1. events
2. product_categories
3. products              → product_categories
4. clients
5. payment_methods
6. orders_backup           (sem FK — arquivo morto)
7. order_items_backup    (sem FK)
8. orders                → events, clients, payment_methods
9. order_items           → orders, products
10. sync_log
```

> `orders_backup` / `order_items_backup` podem ser criadas antes de `orders` se preferir; não há FK entre backup e operacional.

---

## Versionamento do Schema

O arquivo `db/migrations.ts` deve implementar controle de versão via `PRAGMA user_version`:

```typescript
const SCHEMA_VERSION = 3;

// Ao abrir o banco:
// - Ler PRAGMA user_version
// - Se < SCHEMA_VERSION: rodar migrations pendentes
// - Atualizar PRAGMA user_version ao final
```

**Migrações entre versões:** seguir deltas em `migrations.ts` (placeholder antigo de `events`, troca de PK TEXT→INTEGER em `orders`, criação de tabelas de backup, etc.).
