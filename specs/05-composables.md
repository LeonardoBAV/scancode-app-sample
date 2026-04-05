# Composables — Contratos e Responsabilidades

**Camada:** `app/composables/`
**Responsabilidade:** ponte reativa entre SQLite e UI. Expõe `ref`s para os componentes Vue.

---

## Regras da Camada

1. **Lê e escreve exclusivamente via repositórios** — nunca chama a API diretamente.
2. **Nunca contém SQL** — toda query passa pelo repositório correspondente.
3. **Estado como módulo singleton** — `ref`s declarados fora da função são compartilhados entre todos os componentes que importam o composable.
4. **Retorna tipagem explícita** — sem `any`; todos os `ref`s e `computed`s tipados.
5. **Ações de escrita são atômicas via repositório** — ex: `createOrder` chama `ordersRepo.insert` + `orderItemsRepo.insertMany` em uma transação.

---

## Analogia com Laravel (referência)

| Laravel | Composable equivalente |
|---|---|
| `Controller` (recebe request, retorna response) | A função do composable (recebe contexto, retorna estado reativo) |
| `Service` (lógica de negócio) | Ações dentro do composable (`createOrder`, `cancelOrder`) |
| `$products` na view | `ProductsComposable.getList()` — `Ref<Product[]>` observado pelo template |

A diferença: o composable mantém estado **vivo** (reativo) em vez de retornar uma resposta única.

---

## Padrão de Módulo Singleton

```typescript
// Declarado NO MÓDULO (fora da função) → compartilhado entre todos os consumidores
// (Exemplo genérico; no projeto, catálogo e eventos usam classes estáticas — ver secções abaixo.)
const items = ref<Item[]>([]);
const isLoading = ref<boolean>(false);

export function useItems() {
    return { items: readonly(items), isLoading: readonly(isLoading), loadItems };
}
```

> `readonly()` do Vue garante que o componente não mute o estado diretamente — só via ações expostas.

---

## `EventsComposable` (lista de eventos)

**Arquivo:** `app/composables/event-composable.ts` — **`EventsComposable`** com estado e API **estáticos**: `getList()` / `getIsLoading()` devolvem refs só de leitura; `refresh()` lê o SQLite e atualiza estado.

```typescript
export class EventsComposable {
    private static events = ref<Event[]>([]);
    private static isLoading = ref<boolean>(false);
    private constructor() {}
    static getList() { return readonly(EventsComposable.events); }
    static getIsLoading() { return readonly(EventsComposable.isLoading); }
    static async refresh() { ... } // EventsRepository.findAll()
}
```

**Onde `refresh()` é chamado (únicos gatilhos):**

1. **`Application.launchEvent`** em `app/bootstrap/app.ts` — se `getAuth()`, hidrata o singleton no cold start com sessão já persistida.
2. **`SyncPullService`** (pós-login em `LoginPage`) — após `truncate` + pull de events bem-sucedido, **`EventsComposable.refresh()`** é invocado no fim de `pullEvents()` (ver `specs/03-sync-pull.md`). *Comportamento alvo com `finally` se o pull falhar após truncate — ainda a alinhar com `specs/00-architecture.md`.*

Não chamar `refresh` em páginas (`LoginPage`, `Home`, `EventsPage` onMounted) para evitar dispersão; ver `specs/00-architecture.md`. Na UI: `getList()` e `getIsLoading()`.

**Consumido por:** `EventsPage.vue` (`getList()` + `getIsLoading()`), pontos acima para hidratar o estado estático. O evento ativo na home vem de props após seleção na lista.

> Dados do SQLite seguem o tipo **`Event`** (`specs/01-db-schema.md`). Se a lista precisar de totais, contagens ou “status” derivado, compor um **view model** no composable ou na página (ex.: join com `orders`), em vez de reutilizar `EventItem` como se fosse linha de banco.

---

## `ProductsComposable` (catálogo de produtos)

**Arquivo:** `app/composables/products-composable.ts` — **`ProductsComposable`** com estado e API **estáticos**: `getList()` / `getIsLoading()` devolvem refs só de leitura; `refresh()` lê o SQLite e atualiza estado.

```typescript
import { ref, readonly } from 'vue';
import type { Product } from '../types/schema/product';
import { ProductsRepository } from '../db/repositories/products.repo';

export class ProductsComposable {
    private static products = ref<Product[]>([]);
    private static isLoading = ref<boolean>(false);
    private constructor() {}
    static getList() { return readonly(ProductsComposable.products); }
    static getIsLoading() { return readonly(ProductsComposable.isLoading); }
    static async refresh() {
        ProductsComposable.products.value = await ProductsRepository.findAll(); // JOIN com categorias
    }
}
```

**Onde `refresh()` é chamado (gatilhos):**

1. **`Application.launchEvent`** em `app/bootstrap/app.ts` — se `getAuth()`, hidrata junto de `EventsComposable` e `ClientsComposable`.
2. **`SyncPullService.pullProducts()`** — após upsert no SQLite bem-sucedido (ver `specs/03-sync-pull.md`).

Não chamar `refresh` em `onMounted` de `ProductListPage` — a lista consome `getList()` já preenchido pelos gatilhos acima.

**Consumido por:** `ProductListPage.vue` (`getList()`). O campo de busca e o filtro in-memory ficam em **`ProductListComponent`** (`searchQuery` local + `computed` sobre a prop `products`), no mesmo padrão de `ClientListComponent`.

> Tipo **`Product`**: `app/types/schema/product.ts` (inclui `product_category` aninhado; o repositório faz JOIN ao montar `findAll()`).

---

## `ClientsComposable` (catálogo de clientes)

**Arquivo:** `app/composables/clients-composable.ts` — **`ClientsComposable`** com o mesmo padrão estático que `ProductsComposable`.

```typescript
import { ref, readonly } from 'vue';
import type { Client } from '../types/schema/client';
import { ClientsRepository } from '../db/repositories/clients.repo';

export class ClientsComposable {
    private static clients = ref<Client[]>([]);
    private static isLoading = ref<boolean>(false);
    private constructor() {}
    static getList() { return readonly(ClientsComposable.clients); }
    static getIsLoading() { return readonly(ClientsComposable.isLoading); }
    static async refresh() {
        ClientsComposable.clients.value = await ClientsRepository.findAll();
    }
}
```

**Onde `refresh()` é chamado:**

1. **`Application.launchEvent`** em `app/bootstrap/app.ts` — se `getAuth()`.
2. **`SyncPullService.pullClients()`** — após upsert no SQLite.

**Consumido por:** `ClientListPage.vue` (`getList()` + `computed` para exibir `fantasy_name` ou `corporate_name`), `OrderSelectClientPage.vue` (quando existir). Busca em **`ClientListComponent`**.

---

## `PaymentMethodsComposable` (formas de pagamento)

**Arquivo:** `app/composables/payment-methods-composable.ts` — mesmo padrão estático que `ProductsComposable` / `ClientsComposable`.

```typescript
import { ref, readonly } from 'vue';
import type { PaymentMethod } from '../types/schema/payment-method';
import { PaymentMethodsRepository } from '../db/repositories/payment-methods.repo';

export class PaymentMethodsComposable {
    private static paymentMethods = ref<PaymentMethod[]>([]);
    private static isLoading = ref<boolean>(false);
    private constructor() {}
    static getList() { return readonly(PaymentMethodsComposable.paymentMethods); }
    static getIsLoading() { return readonly(PaymentMethodsComposable.isLoading); }
    static async refresh() {
        PaymentMethodsComposable.paymentMethods.value = await PaymentMethodsRepository.findAll();
    }
}
```

**Onde `refresh()` é chamado:**

1. **`Application.launchEvent`** em `app/bootstrap/app.ts` — se `getAuth()`.
2. **`SyncPullService.pullPaymentMethods()`** — após upsert no SQLite (ver `specs/03-sync-pull.md`).

**Consumido por:** `PaymentMethodListPage.vue`, `OrderPaymentPage.vue` (`getList()` + `computed` com cópia superficial para tipagem). Busca em **`PaymentMethodListComponent`**.

> Tipo **`PaymentMethod`**: `app/types/schema/payment-method.ts`.

---

## `useOrders`

**Arquivo:** `app/composables/useOrders.ts`

Este composable é diferente dos demais: **recebe `eventId` como parâmetro** porque o escopo de pedidos é sempre por evento.

```typescript
import { ref, computed, readonly, type Ref, type ComputedRef } from 'vue';
import { getAuth } from '../persistence/auth-session';
import type { Order, NewOrder, OrderStatus } from '../types/order';
import type { NewOrderItem } from '../types/order-item';
import { createOrderWithItems } from '../db/transactions';
import * as ordersRepo     from '../db/repositories/orders.repo';

// Não é singleton puro — o estado é por evento selecionado
const orders: Ref<Order[]>    = ref([]);
const isLoading: Ref<boolean> = ref(false);

const unsyncedCount: ComputedRef<number> = computed(
    () => orders.value.filter((o) => o.synced_at === null).length
);

async function loadOrders(eventId: number): Promise<void> {
    isLoading.value = true;
    orders.value = await ordersRepo.findByEvent(eventId);
    isLoading.value = false;
}

/**
 * Cria um pedido com seus itens em uma única transação.
 * Retorna o id local (INTEGER autoincrement) do pedido.
 */
async function createOrder(
    eventId: number,
    data: Omit<NewOrder, 'salesRepresentativeId' | 'eventId' | 'createdAt' | 'updatedAt'>,
    items: Omit<NewOrderItem, 'orderId'>[],
): Promise<number> {
    const auth = getAuth();
    if (!auth) throw new Error('Usuário não autenticado');

    const now: string = new Date().toISOString();

    const newOrder: NewOrder = {
        eventId,
        salesRepresentativeId: auth.sales_representative.id,
        createdAt: now,
        updatedAt: now,
        ...data,
    };

    const newId: number = await createOrderWithItems(newOrder, items);

    orders.value = await ordersRepo.findByEvent(eventId);

    return newId;
}

async function cancelOrder(orderId: number, eventId: number): Promise<void> {
    await ordersRepo.updateStatus(orderId, 'Canceled');
    orders.value = await ordersRepo.findByEvent(eventId);
}

export function useOrders() {
    return {
        orders:         readonly(orders),
        isLoading:      readonly(isLoading),
        unsyncedCount,
        loadOrders,
        createOrder,
        cancelOrder,
    };
}
```

**Consumido por:** `OrderListPage.vue`, `OrderShowPage.vue`, `Cart.vue` (para confirmar pedido), `Home.vue` (para exibir `unsyncedCount`).

---

> Ids de pedido e item são **INTEGER** geridos pelo SQLite (`AUTOINCREMENT`); não usar UUID na V1.

---

## Quando chamar `refresh()` / `load*` nos componentes

| Composable | Quando hidratar / atualizar |
|---|---|
| `EventsComposable` | `Application.launchEvent` (com sessão), e após **`SyncPullService.pullEvents()`** → `EventsComposable.refresh()` — ver `specs/00-architecture.md` |
| `ProductsComposable` | `Application.launchEvent` (com sessão), e após **`SyncPullService.pullProducts()`** → `ProductsComposable.refresh()` |
| `ClientsComposable` | `Application.launchEvent` (com sessão), e após **`SyncPullService.pullClients()`** → `ClientsComposable.refresh()` |
| `PaymentMethodsComposable` | `Application.launchEvent` (com sessão), e após **`SyncPullService.pullPaymentMethods()`** → `PaymentMethodsComposable.refresh()` |
| `useOrders` | `onMounted` em `OrderListPage.vue`, passando o `eventId` do evento selecionado *(quando implementado)* |

> Como os composables de catálogo são singletons, se os dados já foram carregados após login ou cold start, o `ref` já estará preenchido — a página só lê `getList()`. O `refresh()` após pull garante dados alinhados ao servidor.
