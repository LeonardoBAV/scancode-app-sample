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
2. **`syncPullService.refresh()`** (via `syncService.refresh()` em `LoginPage` após auth) — após `truncate` + pulls bem-sucedidos, **`EventsComposable.refresh()`** no fim de `pullEvents()`; também `ProductsComposable` / `PaymentMethodsComposable` nos pulls correspondentes (ver `specs/03-sync-pull.md`, `specs/06-sync-services.md`). *Comportamento alvo com `finally` se o pull falhar após truncate — ainda a alinhar com `specs/00-architecture.md`.*

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
2. **`syncPullService`** (`pullProducts`) — após upsert no SQLite bem-sucedido (ver `specs/03-sync-pull.md`, `06-sync-services.md`).

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
2. **Não** é chamado após `syncPullService.pullClients()` no código atual — o SQLite é atualizado, mas o singleton em memória só refresca no próximo cold start com sessão até se adicionar `ClientsComposable.refresh()` no fim de `pullClients()` (ver `specs/06-sync-services.md`).

**Consumido por:** `ClientListPage.vue` (`getList()` + `computed` para exibir `fantasy_name` ou `corporate_name`), `OrderSelectClientPage.vue` (quando existir). Busca em **`ClientListComponent`**.

---

## Formulário de cliente (criar / editar) — UI, validação e API

Referência rápida para IAs e devs: onde está cada peça e como se encaixam.

### Arquivos

| Peça | Caminho | Papel |
| --- | --- | --- |
| Schema Zod (trim + limites) | `app/validation/client-form-validation.ts` | `clientFormValidation.clientFormFieldsSchema` — `corporate_name` obrigatório; `email` vazio ou e-mail válido; demais strings com `max` alinhado ao backend. |
| Erros por campo + duplicata CPF/CNPJ | `app/composables/useClientFormValidation.ts` | **Singleton** (`UseClientFormValidation.getInstance()`). Export `useClientFormValidation`: `fieldErrors` (ref compartilhado), `clearFieldErrors()`, `validateClientForm(raw, { ignoreClientId })`. Mensagens via `i18n.global.t` em `pages.clientForm.errors.*` (não usar `useI18n()` no fluxo de validação). |
| Formulário reutilizável | `app/components/ClientFormComponent.vue` | Props: `client: Client`. Emite `save` com `Client` já mesclado (campos editados + `is_sync: false`). Campos locais em `ref`; `watch` em `props.client` repõe valores e limpa erros. **Não** chama o repositório — só valida e emite. |
| Criar | `app/pages/Profile/ClientCreatePage.vue` | `clientDraft` com `id: null`; após `save` → `ClientsRepository.upsertOne` → toast → `navigateBack()`. |
| Ver / editar | `app/pages/Profile/ClientShowPage.vue` | Aba “info” (`ClientInfoComponent`) vs aba formulário (`ClientFormComponent`). Em `updateClient`, `upsertOne` → haptics + toast + volta segmento 0. |
| Tipo persistido | `app/types/schema/client.ts` | `Client` com `id \| null`, `remote_id`, `is_sync`, timestamps. |
| Push / API | `app/integrations/adapters/scancode-adapter.ts` | `getClients()` mapeia DTO → `Client` (`nullableString` para opcionais). **`updateClient`** exige `client.remote_id != null`; senão lança `ApiException` com `common.remoteIdRequired`. Faz `PATCH /clients/{remote_id}` com payload trimado. |

### Fluxo de validação

1. `ClientFormComponent` monta um objeto compatível com `ClientFormSchema` (`app/types/form/client-form-schema.ts`) e chama `useClientFormValidation.validateClientForm(...)`.
2. Zod `safeParse` — falhas viram `fieldErrors` (primeiro issue por campo).
3. Se OK, `ClientsRepository.loadByCpfCnpj(parsed.cpf_cnpj)` — se existir outro cliente e `found.id !== ignoreClientId`, erro `cpf_cnpj` duplicata.
4. `ignoreClientId`: na edição passar `props.client.id` (pode ser o id local); em criação o draft tem `id: null` → `ignoreClientId: null` bloqueia qualquer duplicata.

### Sync e limitação atual do push

- `SyncPushService.pushClients()` itera `findAllUnsynced()` e chama `ScancodeAdapter.updateClient` → **`PATCH` apenas**.
- Cliente **criado só no app** (`remote_id === null`) continua `is_sync = false` após tentativa conceitual de push: `updateClient` falha cedo sem `remote_id`. **Backlog:** `POST` cliente na API + realinhar `id`/`remote_id` como em outras entidades.

### i18n

Chaves em `app/locales/*.json` sob `pages.clientForm` (títulos, hints, `errors.*`, `save`, `saveSuccess`, `saveError`). Títulos de página: `pages.clientCreate.title`.

---

## Formulário de produto (criar / editar) — UI, validação e SQLite

Mesmo padrão do cliente: Zod → composable singleton → erros por campo + unicidade no repositório. Referência alinhada às regras da API (SKU, barcode, nome, preço, categoria).

### Arquivos

| Peça | Caminho | Papel |
| --- | --- | --- |
| Schema Zod (trim + limites) | `app/validation/product-form-validation.ts` | `productFormValidation.productFormFieldsSchema` — `sku`, `name`, `barcode` obrigatórios após trim; `max(255)` nesses campos; `price` a partir de string (vírgula/ponto), numérico finito e `≥ 0`; `product_category_id` inteiro. |
| Payload bruto do form | `app/types/form/product-form-schema.ts` | `ProductFormSchema`: strings de UI + `product_category_id`. |
| Erros por campo + duplicatas | `app/composables/useProductFormValidation.ts` | **Singleton**. `useProductFormValidation`: `fieldErrors`, `clearFieldErrors()`, `validateProductForm(raw, { allowedCategoryIds, ignoreProductId })`. Mensagens em `pages.productForm.errors.*` via `i18n.global.t` (não usar `useI18n()` no fluxo de validação). |
| Formulário reutilizável | `app/components/ProductFormComponent.vue` | Props: `product: Product`, `categories: ProductCategory[]`. `onSave` async; `input-field` / `input-field-invalid`; emite `save` após validação. **Não** chama o repositório. |
| Criar | `app/pages/Profile/ProductCreatePage.vue` | Carrega categorias; `productDraft` com `id: null`, `remote_id: null`; após `save` → `ProductsRepository.upsertOne` → toast → `navigateBack()`. |
| Ver / editar | `app/pages/Profile/ProductShowPage.vue` | Segmentos info vs formulário (`ProductFormComponent`); `upsertOne` após save. |
| Lista + atalho criar | `app/pages/Profile/ProductListPage.vue` | Header `right-action-icon="plus"` → `ProductCreatePage`. |
| Tipo persistido | `app/types/schema/product.ts` | `Product` com `id \| null`, `remote_id \| null`, `is_sync`, `product_category` aninhada. |
| Duplicatas no SQLite | `app/db/repositories/products.repo.ts` | `loadBySku(sku)` e `loadByBarcode(barcode)` — comparação exata (SKU case-sensitive). Usados só após Zod ok. |

### Fluxo de validação

1. `ProductFormComponent` monta `ProductFormSchema` e chama `validateProductForm(..., { allowedCategoryIds: categories.map(c => c.id), ignoreProductId: props.product.id })`.
2. Zod `safeParse` — falhas viram `fieldErrors` (primeiro issue por campo; preço com `mapPriceIssueToMessage` para `origin` string vs number).
3. Se OK, `product_category_id` deve estar em `allowedCategoryIds`; senão erro em `product_category_id`.
4. `ProductsRepository.loadBySku(parsed.sku)` — se existir outro produto e `found.id !== ignoreProductId`, erro `sku` duplicata.
5. `ProductsRepository.loadByBarcode(parsed.barcode)` — sempre após validação (barcode obrigatório no app); mesma regra de `ignoreProductId` para duplicata.

### Regras de negócio (app vs API)

- **Barcode obrigatório** no formulário (API pode marcar `nullable`; o app exige valor para alinhar ao uso offline e unicidade local).
- Categoria: SQLite exige `product_category_id NOT NULL`; a lista vem de `ProductCategoriesRepository.findAll()` na criação e nas telas de edição.

### Sync / push

- `SyncPushService.pushProducts()` usa `findAllUnsynced()`: se `remote_id == null` → `ScancodeAdapter.createProduct` (`POST /products`); senão → `updateProduct` (`PATCH`). Depois `is_sync = true` e, na criação, `remote_id = product.id` (id remoto devolvido pela API), como em `pushClients`.

### i18n

Chaves em `app/locales/*.json` sob `pages.productForm` (`errors.*`, hints, `save`, …) e `pages.productCreate` (título / erro de init sem categorias).

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
2. **`syncPullService`** (`pullPaymentMethods`) — após upsert no SQLite (ver `specs/03-sync-pull.md`, `06-sync-services.md`).

**Consumido por:** `PaymentMethodListPage.vue`, `OrderPaymentPage.vue` (`getList()` + `computed` com cópia superficial para tipagem). Busca em **`PaymentMethodListComponent`**.

> Tipo **`PaymentMethod`**: `app/types/schema/payment-method.ts`.

---

## `useOrders`

**Arquivo:** `app/composables/useOrders.ts`

Este composable é diferente dos demais: **recebe `eventId` como parâmetro** porque o escopo de pedidos é sempre por evento.

```typescript
import { ref, computed, readonly, type Ref, type ComputedRef } from 'vue';
import { getAuth } from '../persistence/auth-session';
import type { Order, OrderStatus } from '../types/schema/order';
import type { NewOrderItem } from '../types/schema/order-item';
import { createOrderWithItems } from '../db/transactions';
import * as ordersRepo     from '../db/repositories/orders.repo';

/** Input de criação (ver também `specs/02-repositories.md`). */
interface NewOrder {
    eventId: number;
    status: OrderStatus;
    notes: string | null;
    clientId: number;
    salesRepresentativeId: number;
    paymentMethodId: number;
    createdAt: string;
    updatedAt: string;
}

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
    await ordersRepo.updateStatus(orderId, 'cancelled');
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
| `EventsComposable` | `Application.launchEvent` (com sessão), e após **`syncPullService.pullEvents()`** (login via `syncService.refresh()`) → `EventsComposable.refresh()` — ver `specs/00-architecture.md`, `06-sync-services.md` |
| `ProductsComposable` | `Application.launchEvent` (com sessão), e após **`syncPullService.pullProducts()`** → `ProductsComposable.refresh()` |
| `ClientsComposable` | `Application.launchEvent` (com sessão) **apenas**; *não* após `pullClients()` até backlog |
| `PaymentMethodsComposable` | `Application.launchEvent` (com sessão), e após **`syncPullService.pullPaymentMethods()`** → `PaymentMethodsComposable.refresh()` |
| `useOrders` | `onMounted` em `OrderListPage.vue`, passando o `eventId` do evento selecionado *(quando implementado)* |

> Como os composables de catálogo são singletons, se os dados já foram carregados após login ou cold start, o `ref` já estará preenchido — a página só lê `getList()`. O `refresh()` após pull garante dados alinhados ao servidor.
