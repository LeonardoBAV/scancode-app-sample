# Sync Pull — API → SQLite

**Arquivo:** `app/sync/pull.ts`
**Direção:** API → SQLite local
**Quando é executado:** dois gatilhos distintos (implementados em `sync-service.ts`):

| Gatilho | Escopo do pull |
|---|---|
| **Após login bem-sucedido** | **Completo:** `events`, `product_categories`, `products`, `clients`, `payment_methods`, `orders`, `order_items` (sempre **depois** do backup+wipe documentado em `specs/00-architecture.md`). |
| **Botão “Sincronizar” no Profile** | **Parcial (catálogo):** apenas `product_categories`, `products`, `clients`, `payment_methods`. **Não** inclui `events`, `orders`, `order_items`. |

Não há listener automático de reconexão nesta versão.

---

## Responsabilidade

O `pull.ts` é a ponte entre a camada de integração (adapter) e a camada de persistência (repositórios).

- Chama funções do adapter (que chamam a API).
- Passa os dados recebidos para os repositórios gravarem no SQLite.
- Atualiza o `sync_log` após cada entidade cuja pull **terminou com sucesso** (ver subseção abaixo).
- **Não tem estado reativo.** Não conhece Vue.
- **Não trata erros de exibição.** Lança exceções para o `sync-service.ts` tratar.

### O que significa “atualizar o `sync_log` após cada entidade”

A tabela `sync_log` guarda, **por nome de entidade** (`events`, `products`, …), o instante (`pulled_at`) em que **aquela** pull terminou sem erro.

- Ex.: após `pullProducts()` concluir com sucesso → `setLastPulledAt('products', now)`.
- Se `pullProducts()` falhar, **não** atualiza a linha de `products` — na próxima sync, o app refaz **pull completo** dessa entidade. Uso de `pulled_at` para filtro na API é **backlog V2** (sync incremental — ver fim deste documento).

Isso **não apaga pedidos locais** e **não substitui dados de outras entidades**; só registra “até quando” a última sincronização daquele tipo foi considerada bem-sucedida.

---

## Ordem de Pull (login — completo)

A ordem é obrigatória — respeita FKs no SQLite:

```
1. events
2. product_categories
3. products            (→ product_categories)
4. clients
5. payment_methods
6. orders              (→ events, clients, payment_methods, sales_representative na API)
7. order_items         (→ orders, products)
```

> No **Profile**, executar apenas os passos **2–5** (catálogo).

---

## Estratégia de Upsert

Todos os pulls usam `INSERT OR REPLACE INTO` nos repositórios. Isso garante:

- Se o registro não existe: inserido.
- Se o registro já existe (mesmo `id`): **apenas a linha dessa tabela** (ex.: `events`) é substituída pelos campos vindos da API (`name`, `start`, `end`, etc.).
- Registros removidos na API **não são removidos** do SQLite automaticamente (sem hard delete no pull desta versão).

### Eventos e pedidos (pull de catálogo no Profile)

No pull **parcial** do Profile, `events` e `orders` **não** são atualizados. Upsert em `products` / `clients` etc. **não** altera linhas de `orders`.

### Pedidos no pull completo (login)

Após o **wipe** no login, `orders` e `order_items` são repovoados só pelo pull da API. Cada pedido recebe `id` e `remote_id` iguais aos da API e `synced_at` conforme o payload (pedido já “oficial” no servidor).

---

## Backlog V2 — Sync incremental (fora do escopo da V1)

**V1:** pull sempre **lista completa** por entidade (`GET /events`, `GET /products`, …) + `INSERT OR REPLACE`. O `sync_log` / `pulled_at` continua sendo gravado após cada pull bem-sucedida (auditoria e base para V2).

**V2 (quando priorizar):** com endpoints na API do tipo `?updated_since=` (ou equivalente), usar `sync_log.pulled_at` para pedir só deltas, reduzindo tráfego em catálogos grandes. Exige definir política para **remoções** na API (registro que sumiu do delta).

Referência de desenho (não implementar na V1):

```typescript
const lastPulledAt: string | null = await syncLogRepo.getLastPulledAt('products');
const path: string = lastPulledAt
    ? `/products?updated_after=${encodeURIComponent(lastPulledAt)}`
    : '/products';
// Após pull OK: setLastPulledAt('products', new Date().toISOString());
```

---

## Mapeamento por Entidade

### `events`

**Migration de referência:** `2026_03_29_044250_create_events_table.php` — colunas persistidas localmente: `id`, `name`, `start`, `end`, `created_at`, `updated_at` (sem `distributor_id`).

```typescript
// Endpoint (ajustar ao routing real da API Laravel):
GET /events

// DTO bruto (exemplo — alinhar ao Resource / JSON real):
interface EventDTO {
    id: number;
    name: string;
    start: string;       // 'YYYY-MM-DD'
    end: string;         // 'YYYY-MM-DD'
    created_at: string;
    updated_at: string;
}

// Adapter function a criar:
async function getEvents(): Promise<Event[]>

// Fluxo:
async function pullEvents(): Promise<void> {
    const events = await scancodeAdapter.getEvents();
    await eventsRepo.upsertMany(events);
    await syncLogRepo.setLastPulledAt('events', new Date().toISOString());
}
```

**Pedidos na API:** `orders.event_id` obrigatório (`2026_03_29_044252_add_event_id_to_orders_table.php`). O app local usa `orders.event_id` → `events(id)`.

---

### `orders` (somente pull completo — login)

```typescript
GET /orders   // ou lista scoped ao seller — alinhar à API

async function getOrders(): Promise<Order[]>

async function pullOrders(): Promise<void> {
    const rows = await scancodeAdapter.getOrders();
    await ordersRepo.upsertManyFromApi(rows);
    await syncLogRepo.setLastPulledAt('orders', new Date().toISOString());
}
```

Cada linha gravada com **`id` explícito** (PK) = id da API; `remote_id` = mesmo valor; `synced_at` preenchido.

---

### `order_items` (somente pull completo — login)

```typescript
GET /order-items   // ou aninhado no resource de order — alinhar à API

async function pullOrderItems(): Promise<void> {
    const rows = await scancodeAdapter.getOrderItems();
    await orderItemsRepo.upsertManyFromApi(rows);
    await syncLogRepo.setLastPulledAt('order_items', new Date().toISOString());
}
```

> Se a API devolver itens **embutidos** em cada order, o adapter pode flattenar e o repositório gravar em `order_items` na mesma transação que `orders` — uma única função `pullOrdersWithItems()` também é válida; manter `sync_log` coerente (`orders` + `order_items` ou uma chave combinada).

---

### `product_categories`

```typescript
// Endpoint esperado:
GET /product-categories

// Adapter function a criar:
async function getProductCategories(): Promise<ProductCategory[]>

// Fluxo:
async function pullProductCategories(): Promise<void> {
    const categories = await scancodeAdapter.getProductCategories();
    await productCategoriesRepo.upsertMany(categories);
    await syncLogRepo.setLastPulledAt('product_categories', new Date().toISOString());
}
```

---

### `products`

```typescript
// Endpoint esperado:
GET /products

// Adapter function a criar:
async function getProducts(): Promise<Product[]>

// Fluxo:
async function pullProducts(): Promise<void> {
    const products = await scancodeAdapter.getProducts();
    await productsRepo.upsertMany(products);
    await syncLogRepo.setLastPulledAt('products', new Date().toISOString());
}
```

> A API retorna `product_category` embutido no produto (eager load). O repositório trata o JOIN de forma inversa: ao fazer upsert, grava `product_category_id` na tabela `products`.
> Garantir que `pullProductCategories` rode **antes** de `pullProducts`.

---

### `clients`

```typescript
// Endpoint esperado:
GET /clients

// Adapter function a criar:
async function getClients(): Promise<Client[]>

// Fluxo:
async function pullClients(): Promise<void> {
    const clients = await scancodeAdapter.getClients();
    await clientsRepo.upsertMany(clients);
    await syncLogRepo.setLastPulledAt('clients', new Date().toISOString());
}
```

---

### `payment_methods`

```typescript
// Endpoint esperado:
GET /payment-methods

// Adapter function a criar:
async function getPaymentMethods(): Promise<PaymentMethod[]>

// Fluxo:
async function pullPaymentMethods(): Promise<void> {
    const methods = await scancodeAdapter.getPaymentMethods();
    await paymentMethodsRepo.upsertMany(methods);
    await syncLogRepo.setLastPulledAt('payment_methods', new Date().toISOString());
}
```

---

## Estrutura do pull.ts

```typescript
// app/sync/pull.ts

import * as scancodeAdapter from '../integrations/adapters/scancode-adapter';
import * as eventsRepo        from '../db/repositories/events.repo';
import * as productCatsRepo   from '../db/repositories/product-categories.repo';
import * as productsRepo      from '../db/repositories/products.repo';
import * as clientsRepo       from '../db/repositories/clients.repo';
import * as paymentMethodsRepo from '../db/repositories/payment-methods.repo';
import * as ordersRepo         from '../db/repositories/orders.repo';
import * as orderItemsRepo     from '../db/repositories/order-items.repo';
import * as syncLogRepo       from '../db/repositories/sync-log.repo';

export async function pullFullAfterLogin(): Promise<void> { ... }   // sequência 1–7
export async function pullCatalogFromProfile(): Promise<void> { ... }  // só 2–5

export async function pullEvents(): Promise<void> { ... }
export async function pullProductCategories(): Promise<void> { ... }
export async function pullProducts(): Promise<void> { ... }
export async function pullClients(): Promise<void> { ... }
export async function pullPaymentMethods(): Promise<void> { ... }
export async function pullOrders(): Promise<void> { ... }
export async function pullOrderItems(): Promise<void> { ... }
```

`pullFullAfterLogin()` chama na ordem da seção **Ordem de Pull (login — completo)**. `pullCatalogFromProfile()` chama apenas categorias → produtos → clientes → métodos de pagamento.

---

## O que precisa ser adicionado na camada de integração

Novos endpoints precisam de:

1. **`scancode-api.ts`** — função com a chamada HTTP (`http.get<DTO[]>('/endpoint')`).
2. **`scancode-adapter.ts`** — função que chama a api, trata erros via `handleApiError` e converte DTO → tipo de domínio.

Seguir exatamente o mesmo padrão do `login()` já existente.

---

## Comportamento em Caso de Falha

- Falha em um pull **não cancela** os demais (o `sync-service.ts` decide a política de continuação).
- O `sync_log` **não é atualizado** para a entidade que falhou.
- Na próxima ação de sync (login ou Profile), o pull da entidade que falhou pode ser retentado.
- Dados locais existentes no SQLite **permanecem intactos** — o app continua funcional com a versão anterior dos dados.
