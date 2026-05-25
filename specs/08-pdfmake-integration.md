# pdfmake — integração NativeScript e rollback

**Versão:** 25/05/2026 (rev. 8 — mínimo absoluto confirmado)  
**Objetivo:** documentar o **mínimo real** para pdfmake no device e como fazer rollback.

---

## Mínimo absoluto (confirmado em device)

Testado com `ns run android` — PDF hello world OK (`byteLength: 6386`), **sem** polyfills webpack e **sem** pacotes `buffer` / `process` / `util` / `stream-browserify`.

### Obrigatório

| Peça | Onde |
| --- | --- |
| `pdfmake` | `dependencies` |
| `@types/pdfmake@0.2.11` | `devDependencies` |
| `import pdfMake from 'pdfmake/build/pdfmake'` | serviço |
| `import pdfFontsModule from 'pdfmake/build/vfs_fonts'` + `pdfMake.vfs = …` | serviço — **causa raiz** |
| `PdfService` + botão print | app |

### Instalação

```bash
npm install pdfmake
npm install --save-dev @types/pdfmake@0.2.11
```

### Webpack

**Nenhuma alteração necessária** para hello world. O bloco polyfills foi **testado como desnecessário** (rev. 7).

### Código (serviço)

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
| `app/services/pdf-service.ts` | Geração + gravação em `knownFolders.documents()` |
| `app/pages/event/orders/OrderShowPage.vue` | `onPrint()` |
| `webpack.config.js` | Sem bloco pdfmake |

Logs `[PdfService]` / `[OrderShowPage]`: debug — remover em produção.

---

## Rollback total

```bash
npm uninstall pdfmake @types/pdfmake
```

1. Apagar `app/services/pdf-service.ts`
2. Reverter `OrderShowPage.vue` (import + `onPrint`)
3. `ns clean && ns run android`

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
| `Roboto-Regular.ttf not found` | Restaurar assign de `vfs_fonts` |
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

---

## Referências

- `app/services/pdf-service.ts`
- [pdfmake — client-side](https://pdfmake.github.io/docs/0.1/getting-started/client-side/)
