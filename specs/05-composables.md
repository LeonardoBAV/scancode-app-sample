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
| `$products` na view | `products` — `Ref<Product[]>` observado pelo template |

A diferença: o composable mantém estado **vivo** (reativo) em vez de retornar uma resposta única.

---

## Padrão de Módulo Singleton

```typescript
// Declarado NO MÓDULO (fora da função) → compartilhado entre todos os consumidores
const products = ref<Product[]>([]);
const isLoading = ref<boolean>(false);

// A função exporta uma visão desse estado
export function useProducts() {
    return { products: readonly(products), isLoading: readonly(isLoading), loadProducts };
}
```

> `readonly()` do Vue garante que o componente não mute o estado diretamente — só via ações expostas.

---

## `useEvents`

**Arquivo:** `app/composables/useEvents.ts`

```typescript
import { ref, readonly, type Ref } from 'vue';
import type { Event } from '../types/schema/event';
import { EventsRepository } from '../db/repositories/events.repo';

const events: Ref<Event[]> = ref([]);
const isLoading: Ref<boolean> = ref(false);

export async function loadEvents(): Promise<void> {
    isLoading.value = true;
    try {
        events.value = await EventsRepository.findAll();
    } finally {
        isLoading.value = false;
    }
}

export function useEvents() {
    return {
        events: readonly(events),
        isLoading: readonly(isLoading),
        loadEvents,
    };
}
```

**Onde `loadEvents()` é chamado (únicos gatilhos):**

1. **`Application.launchEvent`** em `app/bootstrap/app.ts` — se `getAuth()`, hidrata o singleton no cold start com sessão já persistida.
2. **`SyncPullService`** (pós-login em `LoginPage`) — após `truncate` + pull de events bem-sucedido, **`loadEvents()`** é invocado no fim de `pullEvents()` (ver `specs/03-sync-pull.md`). *Comportamento alvo com `finally` se o pull falhar após truncate — ainda a alinhar com `specs/00-architecture.md`.*

Não chamar `loadEvents` em páginas (`LoginPage`, `Home`, `EventsPage` onMounted) para evitar dispersão; ver `specs/00-architecture.md`.

**Consumido por:** `EventsPage.vue` (lê `events` / `isLoading`), pontos acima para popular o singleton. O evento ativo na home vem de props após seleção na lista.

> Dados do SQLite seguem o tipo **`Event`** (`specs/01-db-schema.md`). Se a lista precisar de totais, contagens ou “status” derivado, compor um **view model** no composable ou na página (ex.: join com `orders`), em vez de reutilizar `EventItem` como se fosse linha de banco.

---

## `useProducts`

**Arquivo:** `app/composables/useProducts.ts`

```typescript
import { ref, computed, readonly, type Ref, type ComputedRef } from 'vue';
import type { Product } from '../types/product';
import * as productsRepo from '../db/repositories/products.repo';

const products: Ref<Product[]>    = ref([]);
const isLoading: Ref<boolean>     = ref(false);
const searchQuery: Ref<string>    = ref('');

// Filtro in-memory — evita queries SQL a cada keystroke
const filteredProducts: ComputedRef<Product[]> = computed(() => {
    const q = searchQuery.value.trim().toLowerCase();
    if (!q) return products.value;
    return products.value.filter((p) =>
        p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    );
});

async function loadProducts(): Promise<void> {
    isLoading.value = true;
    products.value = await productsRepo.findAll();
    isLoading.value = false;
}

async function findByBarcode(barcode: string): Promise<Product | null> {
    return productsRepo.findByBarcode(barcode);
}

export function useProducts() {
    return {
        products:         readonly(products),
        isLoading:        readonly(isLoading),
        searchQuery,                           // mutável — o template escreve diretamente
        filteredProducts,
        loadProducts,
        findByBarcode,
    };
}
```

**Consumido por:** `ProductListPage.vue`, `ProductShowPage.vue`, seletor de produto no carrinho.

> `searchQuery` é exposto como mutável para que o `v-model` do `TextField` funcione diretamente. `products` e `isLoading` são `readonly` para evitar mutação acidental.

---

## `useClients`

**Arquivo:** `app/composables/useClients.ts`

```typescript
import { ref, computed, readonly, type Ref, type ComputedRef } from 'vue';
import type { Client } from '../types/client';
import * as clientsRepo from '../db/repositories/clients.repo';

const clients: Ref<Client[]>   = ref([]);
const isLoading: Ref<boolean>  = ref(false);
const searchQuery: Ref<string> = ref('');

const filteredClients: ComputedRef<Client[]> = computed(() => {
    const q = searchQuery.value.trim().toLowerCase();
    if (!q) return clients.value;
    return clients.value.filter((c) =>
        c.corporate_name.toLowerCase().includes(q) ||
        (c.fantasy_name ?? '').toLowerCase().includes(q) ||
        c.cpf_cnpj.includes(q)
    );
});

async function loadClients(): Promise<void> {
    isLoading.value = true;
    clients.value = await clientsRepo.findAll();
    isLoading.value = false;
}

export function useClients() {
    return {
        clients:         readonly(clients),
        isLoading:       readonly(isLoading),
        searchQuery,
        filteredClients,
        loadClients,
    };
}
```

**Consumido por:** `ClientListPage.vue`, `OrderSelectClientPage.vue`.

---

## `usePaymentMethods`

**Arquivo:** `app/composables/usePaymentMethods.ts`

```typescript
import { ref, readonly, type Ref } from 'vue';
import type { PaymentMethod } from '../types/payment-method';
import * as paymentMethodsRepo from '../db/repositories/payment-methods.repo';

const methods: Ref<PaymentMethod[]> = ref([]);
const isLoading: Ref<boolean>       = ref(false);

async function loadPaymentMethods(): Promise<void> {
    isLoading.value = true;
    methods.value = await paymentMethodsRepo.findAll();
    isLoading.value = false;
}

export function usePaymentMethods() {
    return {
        methods:             readonly(methods),
        isLoading:           readonly(isLoading),
        loadPaymentMethods,
    };
}
```

**Consumido por:** `OrderPaymentPage.vue`.

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

## Quando chamar `load*` nos componentes

| Composable | Quando chamar `load*` |
|---|---|
| `useEvents` | `Application.launchEvent` (com sessão), e após sync pós-login via **`SyncPullService.pullEvents()`** → `loadEvents()` — ver `specs/00-architecture.md` |
| `useProducts` | `onMounted` em `ProductListPage.vue` e quando abrir seletor de produto no carrinho |
| `useClients` | `onMounted` em `ClientListPage.vue` e `OrderSelectClientPage.vue` |
| `usePaymentMethods` | `onMounted` em `OrderPaymentPage.vue` |
| `useOrders` | `onMounted` em `OrderListPage.vue`, passando o `eventId` do evento selecionado |

> Como os composables são singletons, se os dados já foram carregados em outra tela, o `ref` já estará preenchido e a tela renderiza imediatamente — o `load*` atualiza com dados frescos do SQLite.
