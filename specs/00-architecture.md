# Arquitetura Offline-First

**Versão:** 28/03/2026
**Stack:** NativeScript 9 · Vue 3 · TypeScript · SQLite

---

## Visão Geral

O app opera em **feiras sem internet**. A estratégia é:

- **Antes da feira (online):** pull de dados da API → SQLite local.
- **Durante a feira (offline):** toda leitura e escrita via SQLite. Zero chamadas de rede.
- **Após a feira (online):** push de pedidos criados offline → API (ação explícita — **sem push automático** “transparente” na V1).

---

## Hidratação `EventsComposable.refresh` (lista de eventos na UI)

`EventsComposable` mantém `events` em memória (estado estático). Para alinhar com o SQLite só há **dois** pontos de chamada a `EventsComposable.refresh()`:

| Gatilho | Ficheiro | Comportamento |
| --- | --- | --- |
| **`Application.launchEvent`** (`launch`) | `app/bootstrap/app.ts` | Se existir sessão (`getAuth()`), `EventsComposable.refresh()` — lê `events` do SQLite ao arrancar o processo. |
| **Sync pós-login** | `app/sync/sync-pull-service.ts` (`SyncPullService`) | Após auth: `truncate` operacional (ordem FK) → `pullEvents()` (adapter → `EventsRepository` → `sync_log` → **`EventsComposable.refresh()`** no fim de `pullEvents`). *Comportamento alvo (backup assíncronos, pull completo 1–7, `finally` em falha)* — ver `specs/03-sync-pull.md` e regras em `00-architecture`; a implementação atual cobre truncate + pull de **events** + hidratação do composable. |

**Contraponto:** com sessão guardada, o cold start pode fazer `refresh` no `launch` e outra vez após login noutra sessão — aceitável (dois `SELECT` curtos). Voltar da home do evento para a lista **não** dispara `refresh`; a lista usa o singleton já preenchido (se no futuro o schema passar a atualizar contagens no SQLite por tabela `events`, reavaliar).

---

## Documentação vs comentários no código

- **Preferir sempre** `specs/` e regras em `.cursor/rules/` para decisões de arquitetura, contratos e “quando chamar o quê”.
- **Evitar comentários** no código-fonte na grande maioria dos casos; só exceções pontuais quando o código não pode ser tornado autoexplicativo e a spec não cobre.

---

## Ciclo de login, logout e reset do banco

### Logout

- **Não** apaga dados do SQLite. Só limpa sessão/token (`clearAuth()` etc.).
- O banco permanece com eventos, catálogo, pedidos e backups até o próximo login.

### Login (após API autenticar com sucesso)

1. **Backup de pedidos assíncronos:** se existir **ao menos um** registro em `orders` com `synced_at IS NULL`, copiar **todos** esses pedidos e respectivos `order_items` para `orders_backup` / `order_items_backup` (**independente** de `sales_representative_id` — qualquer seller). Se **não** houver pedido assíncrono, este passo é no-op.
2. **Sem push automático** antes do wipe (nada de enviar pedidos “em silêncio” na V1).
3. **Wipe operacional:** apagar dados do “mundo sincronizado” do login anterior — tabelas operacionais (`events`, `product_categories`, `products`, `clients`, `payment_methods`, `orders`, `order_items`) e **reiniciar** `sync_log` conforme política definida (ex.: `DELETE` em todas as linhas). **Não** apagar `orders_backup` nem `order_items_backup` (acumulam histórico de resgates futuros).
4. **Pull completo (login):** na ordem de `specs/03-sync-pull.md` — `events` → `product_categories` → `products` → `clients` → `payment_methods` → **`orders`** → **`order_items`**.

### Pedidos e seller (sem lógica extra de “identificação”)

- Se **não existir nenhuma** linha em `orders` antes do wipe → tratar como **sem contexto de seller anterior** (fluxo normal: backup no-op se não houver assíncronos, wipe, pull).
- Se **existir** pedido, `sales_representative_id` na linha já indica o vendedor responsável — **não** é necessário outro mecanismo de identificação no login. A regra de backup continua: qualquer `synced_at IS NULL` → backup antes do wipe, **independente** de quem está logando agora.

### Botão Sincronizar no Profile

- Apenas **pull parcial** de catálogo: `product_categories`, `products`, `clients`, `payment_methods`.
- **Não** puxa `events`, `orders`, `order_items`. Novo evento na distribuidora exige **novo login** (pull completo).

---

## Diagrama de Camadas

```mermaid
flowchart TD
    subgraph ui [UI]
        Pages["Pages / Components"]
    end

    subgraph composables [Composables]
        EventsComposable["EventsComposable"]
        useProducts["useProducts"]
        useClients["useClients"]
        useOrders["useOrders"]
        usePaymentMethods["usePaymentMethods"]
    end

    subgraph db [DB — Camada Local]
        Repos["repositories/\nevents · catalog · orders\nbackup · sync_log"]
        SQLite[("SQLite\n(device)")]
    end

    subgraph sync [Sync]
        SyncPull["sync-pull-service.ts\nSyncPullService"]
        Push["push.ts\nSQLite → API"]
    end

    subgraph integration [Integração — já existe]
        Adapter["adapters/scancode-adapter.ts"]
        ApiFile["apis/scancode-api.ts"]
        HttpClient["http-client.ts"]
        API[("API\nServidor")]
    end

    Pages --> composables
    composables --> Repos
    Repos --> SQLite

    SyncPull -->|"chama adapter"| Adapter
    SyncPull -->|"upsert / truncate"| Repos
    Push -->|"findUnsynced"| Repos
    Push -->|"POST"| Adapter
    Push -->|"markAsSynced"| Repos

    Adapter --> ApiFile
    ApiFile --> HttpClient
    HttpClient --> API
```

---

## Responsabilidades por Camada

| Camada | Arquivo(s) | O que faz | O que NÃO faz |
|---|---|---|---|
| **HttpClient** | `integrations/http-client.ts` | Executa requisições HTTP, lida com timeout | Conhece endpoints ou negócio |
| **API** | `integrations/apis/scancode-api.ts` | Define endpoints, monta payloads, retorna DTOs | Trata erros de negócio |
| **Adapter** | `integrations/adapters/scancode-adapter.ts` | Regras de erro, limpa auth no 401, converte DTOs | Conhece Vue ou SQLite |
| **Repository** | `db/repositories/*.repo.ts` | CRUD no SQLite — único lugar com SQL | Conhece API ou Vue |
| **SyncPullService** | `sync/sync-pull-service.ts` | Pull: chama adapter → repositórios → `sync_log`; truncates operacionais em ordem FK; chama `EventsComposable.refresh()` após pull de events (pós-login). | Estado reativo Vue; SQL direto |
| **push.ts** | `sync/push.ts` (a implementar) | Lê não-sincronizados → envia via adapter → marca como sync | Tem estado reativo |
| **Composable** | `composables/use*.ts` | Expõe `ref`s reativos para a UI, lê/escreve via repo | Chama API diretamente; contém SQL |
| **Page/Component** | `pages/**/*.vue` | Consome composables, renderiza UI | Contém lógica de negócio ou SQL |

---

## Regras de Ouro

1. **Composable nunca chama API diretamente** — passa pelo repositório (leitura) ou pelo sync (escrita em servidor).
2. **Repositório nunca conhece Vue** — sem `ref`, sem `reactive`, sem imports do Vue.
3. **SQL só existe em repositórios** — nenhuma outra camada escreve SQL.
4. **Push nunca re-consulta preços** — o `price` do `order_item` é o snapshot do momento da criação local.
5. **`synced_at IS NULL` = verdade do estado offline** — é a única fonte de "o que ainda não foi para a API".
6. **Pull não bloqueia uso** — falha de pull não impede o app de funcionar com dados locais existentes.
7. **Adapter permanece agnóstico ao SQLite** — o adapter existente não é modificado para conhecer o banco local.

---

## Pacotes a Instalar

```bash
npm install @nativescript/sqlite
npm install @nativescript/connectivity
```

| Pacote | Uso |
|---|---|
| `@nativescript/sqlite` | Banco de dados local no device |
| `@nativescript/connectivity` | Detectar mudança de rede para disparar sync automático |

---

## Estrutura de Arquivos

```
app/
├── db/
│   ├── database.ts              # conexão singleton com o SQLite
│   ├── migrations.ts            # criação e versionamento das tabelas
│   ├── transactions.ts          # ex.: createOrderWithItems (transação orders + items)
│   └── repositories/
│       ├── events.repo.ts
│       ├── product-categories.repo.ts
│       ├── products.repo.ts
│       ├── clients.repo.ts
│       ├── payment-methods.repo.ts
│       ├── orders.repo.ts
│       ├── order-items.repo.ts
│       ├── orders-backup.repo.ts   # ou métodos no orders.repo — copiar assíncronos / wipe
│       └── sync-log.repo.ts
│
├── sync/
│   ├── sync-pull-service.ts     # SyncPullService — pull API → SQLite + truncate pós-login
│   └── push.ts                  # envia do SQLite → API (quando existir)
│
└── composables/
    ├── event-composable.ts   # EventsComposable
    ├── useProducts.ts
    ├── useClients.ts
    ├── useOrders.ts
    └── usePaymentMethods.ts

specs/                           # este diretório — documentação técnica
```

---

## Fases de Implementação

| Fase | O que implementar | Depende de |
|---|---|---|
| **1** | Instalar pacotes + `db/database.ts` + `db/migrations.ts` | `specs/01-db-schema.md` |
| **2** | Todos os repositórios em `db/repositories/` | Fase 1 |
| **3** | Novos endpoints na API + funções no adapter para pull | Fase 2 |
| **4** | `sync/sync-pull-service.ts` (pull; alinhar com `03-sync-pull.md`) | Fase 3 |
| **5** | Composables (leitura do SQLite para UI) | Fase 2 |
| **6** | `sync/push.ts` (ação explícita; sem push automático na V1) | Fase 3 |

> As fases 4, 5 e 6 podem ser desenvolvidas em paralelo após a Fase 3.

---

## Fluxo de Uso Real

```
1. Login (online) — após auth OK
      ↓
2. Se houver orders com synced_at IS NULL → backup → wipe operacional → pull completo:
   events → product_categories → products → clients → payment_methods → orders → order_items
      ↓
3. Usuário seleciona evento → feira (offline)
      ↓
4. App lê SQLite via composables; novos pedidos → id INTEGER autoincrement, synced_at = NULL
      ↓
5. Push explícito (ação do usuário / fluxo definido na implementação) → API
   Após sucesso: id e remote_id = id da API (realinhamento)
      ↓
6. Profile “Sincronizar” → só catálogo (categories, products, clients, payment_methods)
```
