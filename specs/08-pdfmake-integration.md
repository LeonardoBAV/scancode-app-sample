# pdfmake — integração NativeScript e rollback

**Versão:** 24/05/2026 (rev. 9 — arquitetura em camadas)  
**Objetivo:** documentar o **mínimo real** para pdfmake no device, a **arquitetura de serviços** e como fazer rollback.

---

## Arquitetura de serviços

A geração de PDF está dividida em **três camadas** dentro de `app/services/`, para separar a engine pdfmake do armazenamento NativeScript e permitir reutilizar o core noutro projecto (ex.: servidor Node) no futuro.

```
app/services/
├── pdf-core/                          # engine — depende só de pdfmake
│   ├── pdf-core-service.ts            # orquestra template → make → buffer
│   ├── pdf-core-template-service.ts   # monta TDocumentDefinitions
│   └── pdf-core-make-service.ts       # wrapper pdfmake (VFS + getBuffer)
├── storage/
│   └── storage-service.ts             # grava Uint8Array em disco (NativeScript)
└── pdf/
    └── pdf-service.ts                 # camada do app — une core + storage
```

### Fluxo

```
Página (OrderShowPage)
    │
    ▼
PdfService                    app/services/pdf/
    │  generateHelloWorld() / generateSampleOrder()
    │  → Promise<string>  (path do ficheiro)
    │
    ├─► PdfCoreService      app/services/pdf-core/
    │       │
    │       ├─► PdfCoreTemplateService.build*()
    │       │       → TDocumentDefinitions
    │       │
    │       └─► PdfCoreMakeService.generateBuffer(doc)
    │               → Promise<Uint8Array>
    │
    └─► StorageService.save(buffer, fileName)
            → string (path absoluto)
```

### Responsabilidades

| Serviço | Ficheiro | Responsabilidade | Retorno |
| --- | --- | --- | --- |
| **PdfService** | `pdf/pdf-service.ts` | API pública do app; combina core + storage | `Promise<string>` (path) |
| **PdfCoreService** | `pdf-core/pdf-core-service.ts` | Orquestra geração: escolhe template, chama make | `Promise<Uint8Array>` |
| **PdfCoreTemplateService** | `pdf-core/pdf-core-template-service.ts` | Monta o conteúdo (`TDocumentDefinitions`) | `TDocumentDefinitions` |
| **PdfCoreMakeService** | `pdf-core/pdf-core-make-service.ts` | Wrapper da lib pdfmake (VFS, `createPdf`, `getBuffer`) | `Promise<Uint8Array>` |
| **StorageService** | `storage/storage-service.ts` | Persiste bytes no disco | `string` (path) |

### Dependências por camada

| Camada | Depende de | Não depende de |
| --- | --- | --- |
| `pdf-core/*` | `pdfmake`, `@types/pdfmake` | NativeScript, SQLite, Vue |
| `storage/*` | `@nativescript/core` | pdfmake |
| `pdf/*` | `pdf-core`, `storage` | pdfmake directamente |

**Regra:** só `pdf-core-make-service.ts` importa `pdfmake/build/pdfmake` e `pdfmake/build/vfs_fonts`. Templates usam apenas `pdfmake/interfaces` (tipos).

### API pública (app)

As páginas importam **sempre** `pdf/pdf-service.ts`:

```typescript
import { pdfService } from '../../../services/pdf/pdf-service';

const filePath = await pdfService.generateSampleOrder();
// → /data/.../documents/sample-order.pdf
```

Métodos disponíveis:

| Método | Ficheiro gerado | Uso |
| --- | --- | --- |
| `generateHelloWorld()` | `hello-world.pdf` | Smoke test mínimo |
| `generateSampleOrder()` | `sample-order.pdf` | Demo com tabela de pedido (dados hardcoded) |

### Reutilização noutro projecto

Para extrair a engine para um servidor Node (ou pacote npm interno):

1. Copiar a pasta `app/services/pdf-core/` — **zero alterações** de dependência (só pdfmake).
2. Substituir `StorageService` por gravação com `fs` (ou devolver o buffer directamente na API HTTP).
3. Manter `PdfCoreTemplateService` como ponto único de definição de layouts; novos documentos = novos métodos `build*()` aqui.

---

## Mínimo absoluto (confirmado em device)

Testado com `ns run android` — PDF hello world OK (`byteLength: 6386`), **sem** polyfills webpack e **sem** pacotes `buffer` / `process` / `util` / `stream-browserify`.

### Obrigatório

| Peça | Onde |
| --- | --- |
| `pdfmake` | `dependencies` |
| `@types/pdfmake@0.2.11` | `devDependencies` |
| `import pdfMake from 'pdfmake/build/pdfmake'` | `pdf-core-make-service.ts` |
| `import pdfFontsModule from 'pdfmake/build/vfs_fonts'` + `pdfMake.vfs = …` | `pdf-core-make-service.ts` — **causa raiz** |
| `PdfService` + botão print | app |

### Instalação

```bash
npm install pdfmake
npm install --save-dev @types/pdfmake@0.2.11
```

### Webpack

**Nenhuma alteração necessária** para hello world. O bloco polyfills foi **testado como desnecessário** (rev. 7).

### Código (VFS — só em pdf-core-make-service)

```typescript
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFontsModule from 'pdfmake/build/vfs_fonts';

const pdfVfs = pdfFontsModule as unknown as Record<string, string>;
(pdfMake as { vfs: Record<string, string> }).vfs = pdfVfs;
```

Usar sempre `pdfmake/build/pdfmake` + `pdfmake/build/vfs_fonts` — **não** o entry Node (`pdfmake` raiz).

---

## Conclusões do trim (histórico)

| Peça | Veredicto |
| --- | --- |
| **`vfs_fonts`** | **Obrigatório** — única causa raiz do bug original |
| Polyfills webpack (`buffer`, `process`, `util`, `stream`, …) | **Desnecessários** (hello world + teste rev. 7) |
| `assert`, `events`, `browserify-zlib`, exclude Babel | **Desnecessários** (passo 1) |

**Lição:** o hang inicial (`getBuffer` sem callback) era **fonte/VFS**, não falta de polyfill Node. Polyfills foram adicionados durante debug antes de se identificar o VFS.

**Nota:** PDFs mais complexos (imagens grandes, compressão, etc.) **podem** exigir polyfills no futuro — se quebrar, ver secção «Se precisares de polyfills de novo».

---

## Ficheiros do projecto

| Ficheiro | Papel |
| --- | --- |
| `app/services/pdf-core/pdf-core-service.ts` | Orquestração da geração (template + make) |
| `app/services/pdf-core/pdf-core-template-service.ts` | Definição de layouts (`TDocumentDefinitions`) |
| `app/services/pdf-core/pdf-core-make-service.ts` | Wrapper pdfmake (VFS, `createPdf`, `getBuffer`) |
| `app/services/storage/storage-service.ts` | Gravação em `knownFolders.documents()` |
| `app/services/pdf/pdf-service.ts` | Facade do app — core + storage |
| `app/pages/event/orders/OrderShowPage.vue` | `onPrint()` — chama `pdfService` |
| `webpack.config.js` | Sem bloco pdfmake |

Logs `[PdfService]`, `[PdfCoreService]`, `[PdfCoreMakeService]`, `[StorageService]`, `[OrderShowPage]`: debug — remover em produção.

---

## Rollback total

```bash
npm uninstall pdfmake @types/pdfmake
```

1. Apagar `app/services/pdf-core/` (3 ficheiros)
2. Apagar `app/services/storage/storage-service.ts`
3. Apagar `app/services/pdf/pdf-service.ts`
4. Reverter `OrderShowPage.vue` (import + `onPrint`)
5. `ns clean && ns run android`

Não há bloco webpack pdfmake para reverter.

---

## Se precisares de polyfills de novo

Sintoma típico: `util.inherits is not a function` ou hang sem erro de fonte.

Restaurar conjunto que funcionava na rev. 6 (antes do teste absoluto):

```bash
npm install --save-dev buffer process util
```

Em `webpack.config.js`, entre comentários `pdfmake: início` / `fim`:

```javascript
config.resolve.alias.set("process", "process/browser");
config.resolve.set("fallback", {
  ...(config.resolve.get("fallback") || {}),
  buffer: require.resolve("buffer/"),
  util: require.resolve("util/"),
});
config.plugin("provide-pdf-polyfills").use(webpack.ProvidePlugin, [
  { Buffer: ["buffer", "Buffer"], process: "process/browser" },
]);
```

---

## Troubleshooting

| Sintoma | Ação |
| --- | --- |
| `Roboto-Regular.ttf not found` | Restaurar assign de `vfs_fonts` em `pdf-core-make-service.ts` |
| `Helvetica.afm not found` | Usar `vfs_fonts` (Roboto), não Helvetica sem VFS |
| `getBuffer` hang 5s | Quase sempre VFS; raramente polyfill |
| TS7016 | `@types/pdfmake@0.2.11` |

---

## Histórico de revisões

| Rev | Alteração |
| --- | --- |
| 1–2 | Integração + polyfills (excesso) |
| 3–5 | Trim passo 1 + 2a |
| 6 | Mínimo intermédio (vfs + polyfills) — **polyfills eram excesso** |
| 7 | Teste sem polyfills |
| 8 | **Mínimo absoluto confirmado:** só pdfmake + vfs_fonts + serviço |
| 9 | **Arquitetura em camadas:** `pdf-core` / `storage` / `pdf`; templates separados; core reutilizável |

---

## Referências

- `app/services/pdf/pdf-service.ts`
- `app/services/pdf-core/`
- `app/services/storage/storage-service.ts`
- [pdfmake — client-side](https://pdfmake.github.io/docs/0.1/getting-started/client-side/)
