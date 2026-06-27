# Angular 17 → 21 Upgrade Plan

**Date:** 2026-06-25
**Scope:** Analysis only. No files were modified while producing this document. Every breaking change below was verified against this project's actual source files (not assumed) — file paths and line numbers refer to the current code.

---

## 1. Angular 17 → 21: Breaking Changes That Affect This Project

### a) zone.js removal (Angular 21 is zoneless by default)

- **What breaks:** Angular 21's default `provideZonelessChangeDetection()` is incompatible with `zone.js` being present in polyfills — running both is unsupported. The build also still actively loads zone.js today.
- **Files affected:**
  - `angular.json:19` — `"polyfills": ["zone.js"]` must become `"polyfills": []` (or the key removed).
  - `src/app/app.config.ts` — currently has **no** `provideZoneChangeDetection()` call to remove, but also has no zoneless provider. Must add `provideZonelessChangeDetection()` to the `providers` array.
  - `package.json:32` — `"zone.js": "^0.14.0"` dependency must be deleted entirely.
- **Exact change** (`src/app/app.config.ts`):
  ```ts
  import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
  import { provideHttpClient } from '@angular/common/http';

  export const appConfig: ApplicationConfig = {
    providers: [provideHttpClient(), provideZonelessChangeDetection()],
  };
  ```
- **Good news:** I grepped all of `src/**/*.spec.ts` for `fakeAsync(` and `tick(` — **zero matches**. This project's existing tests never relied on zone.js timing APIs, so there is no test-logic rewrite needed for this specific change, only the config/polyfill removal above.

### b) `@angular/animations` deprecation (PrimeNG 21 uses native CSS)

- **What breaks:** `provideAnimations()` is deprecated as of Angular 20.2 and the package conflicts with PrimeNG 21's native-CSS-animation approach.
- **Files affected:**
  - `src/app/app.config.ts:3,6` — imports `provideAnimations` from `@angular/platform-browser/animations` and calls it in `providers`. Both must be removed (see the consolidated snippet in 1a above — the migrated file drops this import entirely).
  - `package.json:19` — `"@angular/animations": "^17.0.0"` dependency must be deleted.
- **Good news:** I grepped every `.html` template in `src/` for `showTransitionOptions`/`hideTransitionOptions` — **zero matches**. Nothing to clean up there.

### c) `@angular-devkit/build-angular` → `@angular/build`

- **What breaks:** The builder package is renamed; `angular.json` architect entries pointing at the old package will fail to resolve once the old package is removed from `devDependencies`.
- **Files affected:**
  - `angular.json:14` — `"builder": "@angular-devkit/build-angular:application"` → `"@angular/build:application"`
  - `angular.json:51` — `"builder": "@angular-devkit/build-angular:dev-server"` → `"@angular/build:dev-server"` (verify exact builder id against the installed `@angular/build` version's schema at migration time — builder names have shifted slightly release to release).
  - `package.json:37` — `"@angular-devkit/build-angular": "^17.0.0"` → remove; add `"@angular/build": "^21.0.0"`.
- This also resolves the single largest cluster of CVEs from `SECURITY-AUDIT.md` (the webpack/vite/esbuild/inquirer/pacote chain pulled in transitively by `@angular-devkit/build-angular`).

### d) Jest → Vitest migration

- **What breaks:** Jest is deprecated in Angular 21, removed in 22; `jest-preset-angular@14.6.2` already conflicts with Angular 21+ peer deps (per `SECURITY-AUDIT.md` §3).
- **Files affected (all confirmed by direct read, not guessed):**
  - `jest.config.ts` (whole file) — delete; replace with `vitest.config.ts`.
  - `setup-jest.ts` (`import 'jest-preset-angular/setup-jest';`) — delete; replace with a zoneless Vitest setup file.
  - `tsconfig.spec.json:5` — `"types": ["jest", "node"]` → `"types": ["vitest/globals", "node"]`.
  - `src/app/features/customer-search/__tests__/customer-search.component.spec.ts:38,42,43` — `jest.Mock` → a `Mock` type from `vitest`, `jest.fn()` → `vi.fn()`.
  - `src/app/features/customer-search/__tests__/accessibility.spec.ts:4,69` — `import { axe } from 'jest-axe'` → `import { axe } from 'axe-core'` (the axe-core API surface differs slightly from the jest-axe wrapper — verify `axe.run()` vs the wrapped `axe()` call signature when migrating); `jest.fn()` → `vi.fn()`.
  - `src/app/features/customer-search/__tests__/customer-search.service.spec.ts:2,38` — covered under (f) below.
  - `src/app/features/customer-search/__tests__/customer-card.component.spec.ts` — uses no `jest.*` APIs directly; needs no change beyond running under the new runner.
  - `package.json:10-12` — `"test": "jest"`, `"test:watch": "jest --watch"`, `"test:coverage": "jest --coverage"` → `vitest run` / `vitest` / `vitest run --coverage`.
- **Good news:** as noted in (a), there is no `fakeAsync`/`tick` usage to rewrite — the debounce-testing pitfall the original migration prompt warns about doesn't exist in this codebase; tests already drive `onSearch()` directly.

### e) `@Input()`/`@Output()` → signal `input()`/`output()`

- **Status: already compliant.** I grepped all of `src/` for `@Input(`, `@Output(`, and `EventEmitter` — **zero matches**. `customer-card.component.ts:16` already uses `input.required<Customer>()`, and `customer-search.component.ts` has no outputs at all (it manages a private `Subject` internally). No action needed for this item.

### f) `HttpClientTestingModule` → `provideHttpClientTesting()`

- **What breaks:** `HttpClientTestingModule` is an `NgModule`-based testing API; under Vitest + zoneless it should be replaced with the provider-based equivalent (also just generally the modern API regardless of test runner).
- **Files affected:**
  - `src/app/features/customer-search/__tests__/customer-search.service.spec.ts:2` — `import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';` → drop `HttpClientTestingModule` from this import, add `import { provideHttpClientTesting } from '@angular/common/http/testing';`.
  - Same file, line 38 — `TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [CustomerSearchService] })` → `TestBed.configureTestingModule({ providers: [provideHttpClientTesting(), CustomerSearchService] })`.

### g) PrimeNG 17 → 21: direct component imports

- **What breaks:** PrimeNG 21 dropped `NgModule`-based imports entirely; the `*Module` symbols this project currently imports will not exist in `primeng@21`.
- **Components actually used in this project (confirmed by reading every component/template file):**

  | Current import | File | New import |
  |---|---|---|
  | `InputTextModule` from `primeng/inputtext` | `customer-search.component.ts:12` | `InputText` from `primeng/inputtext` |
  | `ButtonModule` from `primeng/button` | `customer-search.component.ts:13` | `Button` from `primeng/button` |
  | `SkeletonModule` from `primeng/skeleton` | `customer-search.component.ts:14` | `Skeleton` from `primeng/skeleton` |
  | `MessageModule` from `primeng/message` | `customer-search.component.ts:15` | `Message` from `primeng/message` |
  | `CardModule` from `primeng/card` | `customer-card.component.ts:2` | `Card` from `primeng/card` |
  | `DividerModule` from `primeng/divider` | `customer-card.component.ts:3` | `Divider` from `primeng/divider` |

  Each component's `imports: [...]` array (`customer-search.component.ts:33-41`, `customer-card.component.ts:10`) needs the same symbol swap.
- **Templates need no changes:** `customer-search.component.html` (`p-skeleton`, `p-message`, `pInputText`, `pButton`) and `customer-card.component.html` (`p-card`, `p-divider`, `ng-template pTemplate="title"`) use PrimeNG's element/attribute selectors, which are unchanged by the module→standalone-component refactor — only the `.ts` import statements change. **Verify `ng-template pTemplate="title"` is still the correct content-projection API in PrimeNG 21's `Card` component** — some PrimeNG v18+ components moved from `pTemplate` string-based templates toward typed template references; this is worth a targeted check during Phase 3, not assumed here.
- **No `showTransitionOptions`/`hideTransitionOptions` usage exists** (confirmed by grep) — nothing to remove.

### h) ESLint 8 → 9 (not in the original prompt list, found independently)

- **What breaks:** ESLint 9 removed default support for the legacy `.eslintrc.json` format in favor of flat config (`eslint.config.js`/`.mjs`). This project's lint config is 100% eslintrc-style.
- **Files affected:**
  - `.eslintrc.json` (entire file) — must be rewritten as `eslint.config.js` using flat-config syntax. The current `overrides` array (TS files with `@typescript-eslint` + `@angular-eslint` rules, `.html` files with `@angular-eslint/template` rules) maps to flat config's array-of-config-objects format, but the syntax is different enough that this is a rewrite, not a find-replace.
  - `package.json:13` — `"lint": "eslint src --ext .ts,.html"` — the `--ext` flag is an eslintrc-era concept; flat config matches files via glob patterns inside `eslint.config.js` itself, so this script may need to simplify to `"eslint src"` once the config's `files` globs cover both `.ts` and `.html`.
  - `package.json` devDependencies — `@angular-eslint/*` packages must be bumped to a version with flat-config support (v18+) alongside the `@typescript-eslint` 7→8 bump already tracked in `SECURITY-AUDIT.md`.

---

## 2. Risk Assessment Matrix

| Change | Risk Level | Effort | Auto-migratable? |
|---|---|---|---|
| `@angular/core` + family 17→21 (4 major versions) | High | High | Partial — `ng update` handles mechanical bumps one major at a time; manual fixes likely needed at each stop |
| zone.js removal / zoneless | Medium | Low | Partial — `ng update` can scaffold the zoneless provider; this project has no `fakeAsync`/`tick` to rewrite, which removes the highest-effort part of this change |
| `@angular/animations` removal | Low | Low | Yes — two-line removal, already isolated to `app.config.ts` |
| `@angular-devkit/build-angular` → `@angular/build` | Medium | Low | Partial — `ng update` rewrites most `angular.json` builder strings; verify dev-server builder id manually |
| Jest → Vitest | Medium | Medium | Partial — mechanical API swaps (`jest.fn`→`vi.fn`, etc.) are scriptable; the `jest-axe`→`axe-core` swap in `accessibility.spec.ts` needs a manual signature check |
| `HttpClientTestingModule` → `provideHttpClientTesting()` | Low | Low | Yes — single file, two-line change |
| PrimeNG 17→21 import migration | Medium | Low | Mostly yes — 6 known symbol renames across 2 files; the `pTemplate="title"` API on `Card` needs manual verification |
| ESLint 8→9 flat config | Medium | Medium | No — `.eslintrc.json` → `eslint.config.js` is a structural rewrite; `@angular-eslint`/`@typescript-eslint` major bumps must land first |
| `typescript` 5.2→5.6 | Low | Low | Yes — within Angular 21's supported TS range (5.4–5.7); no jump to TS 6.0 |
| Transitive CVE chain (webpack/vite/esbuild/pacote/tar/etc., 29 high + 37 moderate findings) | — | — | Fully resolved as a side effect of the `@angular/cli`/`@angular/build` major bump — no separate work needed |

---

## 3. Recommended Upgrade Sequence

This project's actual exposure is narrow — 2 component files, 1 service, 4 spec files, 3 config files (`angular.json`, `tsconfig.spec.json`, `.eslintrc.json`), and `package.json`/`jest.config.ts`/`setup-jest.ts`. The breaking-change surface confirmed above is smaller than the original migration prompt assumed (no `fakeAsync`/`tick`, no legacy `@Input`/`@Output`, no hardcoded hex colors, no `showTransitionOptions`, host-centering CSS already in place). Recommended sequence:

1. **`ng update` one major version at a time**, running `npx tsc --noEmit` after each step to catch compiler breaks early:
   ```
   ng update @angular/core@18 @angular/cli@18
   ng update @angular/core@19 @angular/cli@19
   ng update @angular/core@20 @angular/cli@20
   ng update @angular/core@21 @angular/cli@21
   ```
2. **Builder rename** (`@angular-devkit/build-angular` → `@angular/build`) — `ng update` typically handles this automatically as part of the 21 step; verify `angular.json` manually afterward against item 1c above.
3. **Zoneless + animations removal** — apply the `app.config.ts` / `angular.json` polyfills change from 1a/1b by hand (small, isolated diff).
4. **PrimeNG 17→21** — `npm install primeng@21 primeicons@7`, then apply the 6 import renames from item 1g; manually verify the `Card` `pTemplate` API.
5. **ESLint 8→9** — bump `eslint`, `@typescript-eslint/*`, `@angular-eslint/*`, then hand-write `eslint.config.js` from the existing `.eslintrc.json` rules; delete the old file once parity is confirmed.
6. **Jest → Vitest** — do this last, once the app itself builds and runs on Angular 21/zoneless, so test failures are easy to attribute to the test-runner swap rather than tangled up with framework migration noise. Apply items 1d and 1f together since both touch the same spec files.

No `--force` or `--legacy-peer-deps` should be necessary if versions are bumped in the order above — `ng update` resolves peer ranges per step. If a peer conflict does appear at the PrimeNG or ESLint step, prefer resolving the actual version mismatch over reaching for `--legacy-peer-deps`, since that flag would mask exactly the kind of peer incompatibility (e.g. `jest-preset-angular` vs Angular 21) already flagged as a CVE/EOL risk in `SECURITY-AUDIT.md`.

---

## Files that will require changes in Phase 3 (for reference — none touched in this phase)

- `package.json`
- `angular.json`
- `src/app/app.config.ts`
- `.eslintrc.json` → `eslint.config.js`
- `jest.config.ts` → `vitest.config.ts`
- `setup-jest.ts` → `src/setup-vitest.ts`
- `tsconfig.spec.json`
- `src/app/features/customer-search/components/customer-search.component.ts`
- `src/app/features/customer-search/components/customer-card.component.ts`
- `src/app/features/customer-search/__tests__/customer-search.component.spec.ts`
- `src/app/features/customer-search/__tests__/customer-search.service.spec.ts`
- `src/app/features/customer-search/__tests__/accessibility.spec.ts`
