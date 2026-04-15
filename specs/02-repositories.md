# Repositórios — Contratos e Interfaces

**Camada:** `app/db/repositories/`
**Responsabilidade:** único lugar com SQL no projeto. Conhece apenas SQLite e tipos de domínio.

---

## Regras da Camada

1. **Sem imports do Vue** — nenhum `ref`, `reactive`, `computed`.
2. **Sem lógica de negócio** — não decide se deve sincronizar, não valida regras de domínio.
3. **Sem conhecimento da API** — não sabe o que é um DTO, não conhece endpoints.
4. **Retorna tipos de domínio** — não retorna rows cruas do SQLite; mapeia para interfaces TypeScript.
5. **Operações atômicas** — cada método faz uma coisa. Transações são explícitas quando necessário.

---

## Tipos de Input (NewOrder, NewOrderItem)

Definir em `app/types/` junto com os demais tipos de domínio.

```typescript
// app/types/order.ts — modelo persistido (pull + pós-push)
export interface Order {
    id: number;
    remote_id: number | null;
    event_id: number;
    status: OrderStatus;
    notes: string | null;
    client_id: number;
    sales_representative_id: number;
    payment_method_id: number;
    synced_at: string | null;
    created_at: string;
    updated_at: string;
}

// Inserção local (sem id — SQLite autoincrement)
export interface NewOrder {
    eventId: number;
    status: OrderStatus;
    notes: string | null;
    clientId: number;
    salesRepresentativeId: number;
    paymentMethodId: number;
    createdAt: string;
    updatedAt: string;
}

// app/types/order-item.ts
export interface OrderItem {
    id: number;
    orderId: number;
    productId: number;
    price: number;
    qty: number;
    notes: string | null;
}

export interface NewOrderItem {
    orderId: number;
    productId: number;
    price: number;
    qty: number;
    notes: string | null;
}
```

---

## Interfaces dos Repositórios

### `EventsRepository`

Arquivo: `app/db/repositories/events.repo.ts`

Tipo de domínio: `Event` — ver `app/types/event.ts` e `specs/01-db-schema.md` (colunas `id`, `name`, `start`, `end`, `created_at`, `updated_at`).

```typescript
interface EventsRepository {
    /**
     * Retorna todos os eventos, ordenados por start ASC (cronológico).
     */
    findAll(): Promise<Event[]>;

    /**
     * Retorna um evento pelo ID da API, ou null se não existir localmente.
     */
    findById(id: number): Promise<Event | null>;

    /**
     * Insere ou substitui múltiplos eventos (INSERT OR REPLACE).
     * Usado pela camada de pull (`syncPullService` — `specs/03-sync-pull.md`, `06-sync-services.md`) após receber dados da API.
     */
    upsertMany(events: Event[]): Promise<void>;
}
```

---

### `ProductCategoriesRepository`

Arquivo: `app/db/repositories/product-categories.repo.ts`

```typescript
interface ProductCategoriesRepository {
    /**
     * Retorna todas as categorias, ordenadas por name ASC.
     */
    findAll(): Promise<ProductCategory[]>;

    /**
     * Insere ou substitui múltiplas categorias (INSERT OR REPLACE).
     */
    upsertMany(categories: ProductCategory[]): Promise<void>;
}
```

---

### `ProductsRepository`

Arquivo: `app/db/repositories/products.repo.ts`

Tipos **`Product`** e **`ProductCategory`**: `app/types/schema/product.ts` e `app/types/schema/product-category.ts` (produto com relação aninhada após JOIN em `findAll()`).

```typescript
interface ProductsRepository {
    /**
     * Retorna todos os produtos com sua categoria, ordenados por name ASC.
     * Faz JOIN com product_categories para popular o campo product_category.
     */
    findAll(): Promise<Product[]>;

    /**
     * Busca produto pelo barcode exato. Usado no scan de código de barras.
     * Retorna null se não encontrado.
     */
    findByBarcode(barcode: string): Promise<Product | null>;

    /**
     * Busca produtos por query de texto (LIKE %query%) em name e sku.
     * Retorna no máximo 50 resultados, ordenados por name ASC.
     */
    search(query: string): Promise<Product[]>;

    /**
     * Insere ou substitui múltiplos produtos (INSERT OR REPLACE).
     * Usado pela camada de pull (`syncPullService` — `specs/03-sync-pull.md`, `06-sync-services.md`) após receber dados da API.
     */
    upsertMany(products: Product[]): Promise<void>;
}
```

---

### `ClientsRepository`

Arquivo: `app/db/repositories/clients.repo.ts`  
Tipo: `Client` em `app/types/schema/client.ts`. Classe estática estendendo `RepositoryBase`.

**Implementação atual** (métodos `public static`):

```typescript
interface ClientsRepository {
    /** Lista ordenada por corporate_name ASC. */
    findAll(): Promise<Client[]>;

    /**
     * Primeira linha com `cpf_cnpj` **igual** ao argumento (match exato na string armazenada), ou null.
     * Usado por `useClientFormValidation` para bloquear duplicata no formulário.
     */
    loadByCpfCnpj(cpfCnpj: string): Promise<Client | null>;

    /** Clientes com `is_sync = 0`, ordenados por id ASC — entrada do push (`sync-push-service.ts`). */
    findAllUnsynced(): Promise<Client[]>;

    /**
     * Pull em massa: INSERT OR REPLACE com colunas alinhadas a `CLIENT_COLUMNS`.
     * Dispara `ClientsComposable.refresh()`.
     */
    upsertMany(clients: Client[]): Promise<void>;

    /**
     * Uma linha. Se `client.id == null`, preenche `id` com `getNextLocalClientId()` e zera `remote_id`.
     * Dispara `ClientsComposable.refresh()`. Retorna o `client` atualizado (com `id` definido após insert local).
     */
    upsertOne(client: Client): Promise<Client>;

    /** `COALESCE(MAX(id), 0) + 1` — candidato a PK para registro criado só no device. */
    getNextLocalClientId(): Promise<number>;

    /** DELETE FROM clients + refresh do composable. */
    truncate(): Promise<void>;
}
```

> **Não implementados** no repositório atual: `findById`, `search` (busca in-memory/LIKE fica na UI, ex. `ClientListComponent`).

---

### `PaymentMethodsRepository`

Arquivo: `app/db/repositories/payment-methods.repo.ts`

Tipo **`PaymentMethod`**: `app/types/schema/payment-method.ts`.

```typescript
interface PaymentMethodsRepository {
    /**
     * Retorna todos os métodos de pagamento, ordenados por name ASC.
     */
    findAll(): Promise<PaymentMethod[]>;

    /**
     * Insere ou substitui múltiplos métodos de pagamento (INSERT OR REPLACE).
     * Usado pela camada de pull (`syncPullService` — `specs/03-sync-pull.md`, `06-sync-services.md`) após receber dados da API.
     */
    upsertMany(methods: PaymentMethod[]): Promise<void>;
}
```

---

### `OrdersRepository`

Arquivo: `app/db/repositories/orders.repo.ts`

```typescript
interface OrdersRepository {
    findByEvent(eventId: number): Promise<Order[]>;

    findUnsynced(): Promise<Order[]>;

    /**
     * Insere pedido com synced_at = NULL; id gerado por autoincrement.
     * Retorna o id local (number).
     */
    insert(order: NewOrder): Promise<number>;

    /**
     * Upsert em massa vindo do pull da API (id explícito, remote_id = id, synced_at preenchido).
     */
    upsertManyFromApi(rows: Order[]): Promise<void>;

    updateStatus(orderId: number, status: OrderStatus): Promise<void>;

    /**
     * Após push: migrar PK local → apiId; remote_id = apiId; synced_at = now.
     * Atualiza order_items.order_id na mesma transação.
     */
    markAsSynced(localOrderId: number, apiId: number): Promise<void>;

    /** Só para pedidos locais não enviados (remote_id IS NULL). */
    delete(orderId: number): Promise<void>;
}
```

---

### `OrderItemsRepository`

Arquivo: `app/db/repositories/order-items.repo.ts`

```typescript
interface OrderItemsRepository {
    findByOrder(orderId: number): Promise<OrderItem[]>;

    insertMany(items: NewOrderItem[]): Promise<void>;

    upsertManyFromApi(rows: OrderItem[]): Promise<void>;

    deleteByOrder(orderId: number): Promise<void>;
}
```

---

### `SyncLogRepository`

Arquivo: `app/db/repositories/sync-log.repo.ts`

```typescript
interface SyncLogRepository {
    /**
     * Retorna o ISO 8601 do último pull bem-sucedido para a entidade.
     * Retorna null se nunca houve pull para esta entidade.
     * Na V1 pode não ser lido para montar URL (pull sempre full); na V2 (backlog) usar para sync incremental.
     *
     * @param entity - inclui 'orders' | 'order_items' no pull completo
     */
    getLastPulledAt(entity: string): Promise<string | null>;

    /**
     * Grava ou atualiza o timestamp do último pull bem-sucedido.
     * Chamado pela camada de pull APENAS após pull completo e sem erros.
     *
     * @param entity   - nome da entidade
     * @param pulledAt - ISO 8601 do momento do pull
     */
    setLastPulledAt(entity: string, pulledAt: string): Promise<void>;
}
```

---

### `OrdersBackupRepository` (ou módulo `orders-backup.repo.ts`)

Responsável por copiar assíncronos e pelo wipe operacional no login — **sem** lógica de restauração na V1.

```typescript
interface OrdersBackupRepository {
    /**
     * Se existir algum pedido com synced_at IS NULL, copia todos esses pedidos + itens para *_backup
     * com backed_up_at = now. Independente de sales_representative_id.
     */
    archiveUnsyncedOrdersIfAny(): Promise<void>;

    /**
     * Apaga dados operacionais para novo login: events, categories, products, clients,
     * payment_methods, orders, order_items, sync_log (linhas operacionais).
     * NÃO apaga orders_backup nem order_items_backup.
     */
    wipeOperationalData(): Promise<void>;
}
```

---

## Padrão de Implementação

Cada repositório segue esta estrutura:

Ver `clients.repo.ts`: `insertOrReplaceMany` / `insertOrReplaceOne` via `RepositoryBase` com `CLIENT_COLUMNS` explícito (inclui `remote_id`, `is_sync`, `created_at`).

> `Database.getConnection()` devolve o handle SQLite (singleton). Ver `app/db/database.ts`.

---

## Base compartilhada (`app/db/repository-base.ts`)

Classe abstrata **`RepositoryBase`**: `protected static connection()` delega em `Database.getConnection()`; métodos **`protected static`** para `insertOrReplaceMany`, `queryAll`, etc. Repositórios de entidade **estendem** `RepositoryBase`, `private constructor() { super(); }`, e expõem apenas métodos `public static` por tabela.

**Migrations** (`migrations.ts`) e **interfaces TypeScript** (`app/types/`, `app/types/schema/`) continuam sendo fontes de verdade **independentes** — o repositório só precisa manter a lista de colunas do upsert **consistente** com o DDL e com o tipo usado no código.

| Método (em `RepositoryBase`) | Responsabilidade |
| --- | --- |
| `assertSafeSqlIdentifier` | Valida identificadores SQL (tabela/coluna): `[a-zA-Z_][a-zA-Z0-9_]*`. |
| `buildInsertOrReplaceSql` | Monta `INSERT OR REPLACE INTO t (c1,…) VALUES (?,…)`. |
| `rowParamsForColumns` | Objeto → parâmetros posicionais na ordem das colunas (`undefined` → `null`). |
| `insertOrReplaceMany` | Uma transação; um `INSERT OR REPLACE` por linha. |
| `insertOrReplaceOne` | Atalho para uma única linha. |
| `execute` | `db.execute` na conexão singleton (sem passar `db` nas subclasses). |
| `truncateTable` | SQLite não tem `TRUNCATE TABLE`: `DELETE FROM t` + `DELETE FROM sqlite_sequence WHERE name = t` para reiniciar AUTOINCREMENT onde existir. |
| `queryAll` / `queryOne` | Wrappers tipados sobre `db.select` / `db.get` (uma linha ou `null`). |

**Regras:** (1) Colunas do upsert devem ser um `readonly` array literal alinhado ao schema local. (2) Não passar strings do usuário como nome de tabela/coluna — só literais do código. (3) Queries com `WHERE` dinâmico continuam escritas no repositório com parâmetros ligados (`?`).

Exemplo para novos repositórios (colunas na **mesma ordem** do `CREATE TABLE` em `migrations.ts`; ver `events.repo.ts`):

```typescript
import type { SomeEntity } from '../../types/some-entity';
import { RepositoryBase } from '../repository-base';

export class SomeEntityRepository extends RepositoryBase {
    private constructor() {
        super();
    }

    private static readonly COLUMNS: readonly (keyof SomeEntity)[] = ['id', 'name' /* … */];

    public static async upsertMany(rows: SomeEntity[]): Promise<void> {
        await SomeEntityRepository.insertOrReplaceMany('some_table', SomeEntityRepository.COLUMNS, rows);
    }

    public static async findAll(): Promise<SomeEntity[]> {
        return await SomeEntityRepository.queryAll<SomeEntity>('SELECT * FROM some_table ORDER BY name ASC');
    }
}
```

---

## Transação Criação de Pedido

A criação de um pedido deve ser **atômica** — order + order_items em uma única transação:

```typescript
// Chamado pelo useOrders.ts (composable)
async function createOrderWithItems(
    order: NewOrder,
    items: Omit<NewOrderItem, 'orderId'>[]
): Promise<number> {
    const db = await getDatabase();
    let newId: number = 0;
    await db.transaction(async () => {
        newId = await ordersRepo.insert(order);
        await orderItemsRepo.insertMany(
            items.map((item) => ({ ...item, orderId: newId }))
        );
    });
    return newId;
}
```

Este helper deve viver em `app/db/transactions.ts` (export usado pelo `useOrders`).
