# CLAUDE.md — Customer Search Project

> This file guides Claude CLI on how to work within this Angular project.
> Claude reads this automatically when running in this directory.
> Last compliance update: 2026-06-26 (Angular 21 · Vitest 4 · Zoneless · Node 24 — versions verified against the actual installed packages after a live migration, not just the target spec)

---

## Project Identity

**Project:** Customer Search Component
**Framework:** Angular 21+ (standalone APIs, **zoneless by default**)
**Language:** TypeScript 5.9 (strict mode — no exceptions; `@angular/build@21.2.17`'s real published peer range is `>=5.9 <6.0`, not 5.6)
**UI Library:** PrimeNG 21 (native CSS animations via `@primeng/themes`, direct component imports)
**Testing:** Vitest 4+ (unit, run through the official `@angular/build:unit-test` builder via `ng test` — **not** the raw `vitest` CLI, which cannot resolve Angular `templateUrl`/`styleUrl`), Cypress 13+ (e2e), axe-core 4.10+ (a11y)
**State:** Angular Signals
**HTTP:** Angular HttpClient with RxJS 7.8+
**Runtime:** Node v24 · npm v11 (lockfileVersion 3)

---

## Security & Compliance Baseline

**All dependencies must be at versions listed below or newer. No exceptions.**

| Package | Required Version | Reason |
|---|---|---|
| `@angular/*` | `^21.0.0` | Angular 17–19 are EOL; 21 is current LTS |
| `@angular/platform-browser-dynamic` | `^21.0.0` (deprecated upstream) | Angular 21 deprecates this in favor of `@angular/platform-browser`; kept for now since `src/main.ts` and the Vitest builder still use it — revisit on the next Angular major |
| `primeng` | `^21.0.0` | PrimeNG 17 has peer dep incompatibility with Angular 21 |
| `@primeng/themes` | `^21.0.0` | PrimeNG 21 removed static theme CSS (`primeng/resources/...`) entirely — theming is now programmatic via `providePrimeNG({ theme: { preset: Aura } })` in `app.config.ts` |
| `zone.js` | **REMOVED** | Angular 21 is zoneless by default |
| `@angular/animations` | **REMOVED** | Deprecated in Angular 20.2; PrimeNG 21 uses native CSS |
| `vitest` / `@vitest/coverage-v8` / `@vitest/browser` | `^4.0.8` | Jest is deprecated in Angular 21, removed in Angular 22. **Not `^3.0.0`** — `@angular/build@21.2.17`'s real published peerOptional range is `^4.0.8` |
| `jsdom` | `^25.0.0` | Required peer for Vitest's `environment: 'jsdom'` — not bundled by Vitest itself |
| `@eslint/js` | `^9.0.0` | Required by ESLint 9 flat config's `recommended` ruleset |
| `jest` / `jest-preset-angular` | **REMOVED** | See above |
| `typescript` | `^5.9.0` | **Not `~5.6.0`** — `@angular/build@21.2.17`'s real published peer range is `>=5.9 <6.0` |
| `@angular/build` | `^21.0.0` | Replaces `@angular-devkit/build-angular`. Pins `undici` to an exact vulnerable version (`7.24.4`) — see `package.json`'s `overrides` block |
| `eslint` | `^9.0.0` | ESLint 8 is EOL. Flat config (`eslint.config.js`) replaces `.eslintrc.json`; `no-undef` must stay disabled for `.ts` files (TS's own compiler covers it; the rule can't see ambient/Vitest globals) |
| `@babel/core` | `>=7.30.0` (override) | Forces a modern Babel core so the Angular Linker patch (see below) operates against a consistent `@babel/types` API. Applied via `package.json` `overrides`, not as a direct dependency. |

Run `npm audit --audit-level=high` before every commit. Zero high/critical CVEs permitted in production dependencies.

---

## Non-Negotiable Rules

Claude must follow these on every code generation task, no exceptions:

### TypeScript
- `strict: true` is always on. Never use `any`. Use `unknown` when the type is truly unknown and narrow it.
- All function parameters, return types, and class fields must be explicitly typed.
- Use `readonly` for fields that do not change after construction.
- Use `const` by default; `let` only when the variable must be reassigned.
- Prefer `interface` over `type` for object shapes; use `type` for unions and aliases.
- Never use non-null assertions (`!`) unless you explain exactly why it is safe in a comment.

### Angular
- All components must be **standalone** (no NgModules).
- Inject dependencies using the `inject()` function, not constructor injection.
- Use Angular **Signals** (`signal()`, `computed()`, `effect()`) for local state.
- Use `input()` and `output()` signal-based APIs for component I/O, not `@Input`/`@Output`.
- Use `takeUntilDestroyed()` (from `@angular/core/rxjs-interop`) for all subscriptions inside components.
- Never subscribe inside a template — use `async` pipe or signals.
- Always use `OnPush` change detection strategy.
- **Angular 21 is zoneless by default.** Never import or reference `zone.js`. Never use `provideZoneChangeDetection()`. Use `provideZonelessChangeDetection()` in `app.config.ts`. `zone.js` must not appear in `polyfills`, `angular.json`, or `package.json`.

### RxJS
- Search is triggered **explicitly** — Search button click or Enter submit — never automatically on keystroke.
- Use `switchMap` on the search-trigger stream (cancels an in-flight request if the user submits again before it resolves).
- Use `distinctUntilChanged()` on the search-trigger stream so an identical query submitted twice in a row doesn't call the API twice.
- Do **not** apply `debounceTime` to the search trigger — submission is already a deliberate user action, not a keystroke stream. A separate, undebounced `valueChanges` listener may still reset the UI to `idle` when the input drops below the minimum length or is cleared.
- Always handle errors with `catchError` and return a safe fallback observable.
- Do not swallow errors silently — always set an error state signal.

### PrimeNG 21
- Import only specific PrimeNG **components** — never `*Module` imports (removed in PrimeNG 21).
  - ✅ `import { InputText } from 'primeng/inputtext'` for the `[pInputText]` attribute, `import { Skeleton } from 'primeng/skeleton'` for `<p-skeleton>`, etc.
  - ❌ `import { ButtonModule } from 'primeng/button'`
  - **`Button` is not always the right import for the `Button` family** — verified against the actual installed `primeng@21.1.9` types: the bare `Button` class's selector is the *element* `p-button`. If your template uses the *attribute* form on a native element (`<button pButton>`), you need `ButtonDirective` from the same `primeng/button` entry point instead — importing `Button` when the template only uses `pButton` compiles but silently never applies (NG8113 "is not used within the template").
  - `<ng-template pTemplate="title">` (used by `Card` and others) requires an explicit `import { PrimeTemplate } from 'primeng/api'` in the component's `imports` array — it used to ride along for free via `CardModule`'s NgModule exports; standalone `Card` doesn't carry it.
- Never use `showTransitionOptions` or `hideTransitionOptions` on PrimeNG components — these are deprecated no-ops in PrimeNG 21 (native CSS animations replaced `@angular/animations`).
- **PrimeNG 21 has no static theme CSS files** — `primeng/resources/themes/...` and `primeng/resources/primeng.css` no longer exist in the published package. Theming is wired once in `app.config.ts` via `providePrimeNG({ theme: { preset: Aura } })` (`Aura` from `@primeng/themes/aura`), not via `@import` in `styles.scss`.
- Apply PrimeNG theme tokens for all colors — never hard-code hex values in component SCSS.
- Use PrimeNG `Skeleton` for loading states instead of spinners where possible.
- The component must be horizontally centered on the page with comfortable padding around it (host-level flex centering plus a padded, bordered surface card) — never let it stretch edge-to-edge or sit flush against the viewport.
- **Before assuming a PrimeNG 21 selector/API matches the old version, check the actual installed type declarations** (`node_modules/primeng/types/primeng-*.d.ts`) rather than guessing from the package name — several components (e.g. `Button` above) split or renamed their selectors between v17 and v21.

---

## Accessibility (WCAG 2.2 AA — Mandatory)

Every component Claude generates must satisfy:

| Requirement | Implementation |
|---|---|
| All inputs have a visible label or `aria-label` | `aria-label="Search customers"` on the input |
| Search input role | `role="searchbox"` |
| Results region | `aria-live="polite"` `aria-atomic="true"` `aria-relevant="additions text"` |
| Loading state announced | `aria-busy="true"` on live region while loading |
| Error messages | `role="alert"` so they are announced immediately |
| Keyboard navigation | All interactive elements reachable and operable by keyboard |
| Focus management | Focus must not jump unexpectedly on search updates |
| Color contrast | Minimum 4.5:1 for normal text, 3:1 for large text |
| Link context | All links have descriptive `aria-label` if link text alone is ambiguous |
| External links | `target="_blank"` always paired with `rel="noopener noreferrer"` and `aria-label` noting it opens in a new tab |

Claude must not remove or weaken any accessibility attribute without explaining why in a code comment.

---

## TDD Workflow (Mandatory)

Claude must follow this sequence for every new feature:

```
1. RED   → Write failing tests that define the expected behaviour
2. GREEN → Write the minimum implementation to make tests pass
3. REFACTOR → Clean up code without changing test outcomes
```

**Never write implementation before tests.** If asked to implement something without tests, Claude must first write the tests, confirm they fail, then implement.

---

## File & Folder Conventions

```
src/
  app/
    features/
      customer-search/
        models/
          customer.model.ts        ← interfaces and types
          search-result.model.ts   ← SearchResult<T>, SearchState
          index.ts                 ← barrel export
        services/
          customer-search.service.ts
        components/
          customer-search.component.ts
          customer-search.component.html
          customer-search.component.scss
          customer-card.component.ts
          customer-card.component.html
        pipes/                     ← any custom pipes
        __tests__/
          customer-search.service.spec.ts
          customer-search.component.spec.ts
          customer-card.component.spec.ts
          accessibility.spec.ts
```

- Test files live inside `__tests__/` alongside the feature they test.
- Name test files `<subject>.spec.ts`.
- Name e2e files `<feature>.cy.ts` inside `cypress/e2e/`.

---

## Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Interfaces | PascalCase | `Customer`, `Address` |
| Type aliases | PascalCase | `SearchState`, `SearchType` |
| Signals | camelCase | `searchState`, `customer` |
| Services | PascalCase + Service suffix | `CustomerSearchService` |
| Components | PascalCase + Component suffix | `CustomerSearchComponent` |
| Files | kebab-case | `customer-search.component.ts` |
| CSS classes | BEM-like kebab-case | `search-box__input`, `search-box__results` |
| Constants | SCREAMING_SNAKE_CASE | `BASE_URL`, `MIN_QUERY_LENGTH` |

---

## API Contract

Base URL: `https://jsonplaceholder.typicode.com/users/`

| Query param | Detects when | Example |
|---|---|---|
| `?id=` | Query is digits only | `?id=1` |
| `?email=` | Query contains `@` **and** matches a full email pattern (`local@domain.tld`) | `?email=Sincere@april.biz` |
| `?username=` | Any other string matching the allowed name charset (letters, digits, spaces, `' . -`) | `?username=Samantha` |

**Response shape:** Always `Customer[]`. Empty array `[]` means not found.

Detection **and** validation logic live exclusively in `CustomerSearchService.validateQuery(query: string): SearchValidationResult`. Do not duplicate this logic in the component. A query containing `@` is always evaluated as an email — never silently reinterpreted as a name — so a malformed address is rejected with an inline error instead of being sent to the API as a username search.

**The minimum-length guard is type-aware, not a flat character count.** A single digit (e.g. `"1"`) is already a complete, valid id — JSONPlaceholder ids are 1–10 — so the "too short" check must never block id-shaped input, or no id could ever be searched. Non-id queries still require at least 2 characters.

---

## Error Handling Policy

| Scenario | User-visible result | State |
|---|---|---|
| API returns `[]` | "Customer not found" message | `not-found` |
| HTTP 4xx / 5xx | "Something went wrong. Please try again." with `role="alert"` | `error` |
| Network offline | Same error message as above | `error` |
| Query fails id/email/name validation (e.g. malformed email) | Inline validation message with `role="alert"`; no API call made | `invalid` |
| Non-id input < 2 chars | No call made, results cleared | `idle` |
| Input cleared | Results cleared | `idle` |

Error messages must never expose internal error details, stack traces, or HTTP status codes to the user.

---

## Test Standards

### Unit Tests (Vitest — Angular 21 official default)

- Use **Vitest** (`vi.*`) APIs exclusively. `jest.*` is deprecated in Angular 21 and will be removed in Angular 22.
- API mapping from old Jest to Vitest:
  - `jest.fn()` → `vi.fn()`
  - `jest.spyOn()` → `vi.spyOn()`
  - `jest.mock()` → `vi.mock()`
  - `jest.clearAllMocks()` → `vi.clearAllMocks()`
  - `jest.useFakeTimers()` → `vi.useFakeTimers()`
  - `jest.advanceTimersByTime()` → `vi.advanceTimersByTime()`
- **NO `fakeAsync()` or `tick()`** — these are zone.js APIs; they do not exist in zoneless Angular Vitest tests.
- **NO Jest/Jasmine `done()` callback parameter or `fail()` global** — Vitest doesn't support either. `HttpTestingController`-based tests are synchronous once `req.flush()` is called, so rewrite `it('...', (done) => { ...; done(); })` as a plain synchronous test that captures the emitted value/error in a local variable and asserts after `flush()` — don't reach for `async`/`await` or `Promise` wrappers unless a real asynchronous gap exists.
- For HTTP tests: use `provideHttpClientTesting()` — **not** `HttpClientTestingModule`.
- **Run tests via `ng test` (the `@angular/build:unit-test` builder), never the raw `vitest` CLI directly.** The builder performs the Angular/Vite transform that resolves `templateUrl`/`styleUrl` into inline content and auto-initializes `TestBed`; `npx vitest run` has neither and fails every component test with "Component is not resolved... Did you run resolveComponentResources()?". Do **not** add a manual `TestBed.initTestEnvironment()` call to a setup file referenced from `vitest.config.ts`'s `test.setupFiles` — the builder already does this and a second call throws `NG0400`.
- `vitest.config.ts` is only read by the builder if `angular.json`'s `test` architect target sets `"runnerConfig": "vitest.config.ts"`. Keep that file limited to settings the builder's own CLI flags don't cover (per-directory `coverage.thresholds`) — `test.include`/`exclude`/`setupFiles` are unsupported or actively conflict with the builder's own file discovery and environment setup.
- The search trigger is synchronous submit — drive tests by calling `component.onSearch()` directly; only use `vi.useFakeTimers()` if a real timer is introduced.
- Use typed mock data that matches interfaces exactly (no partial casts with `as`).
- Minimum 90% branch coverage on components, 100% on services — enforced via `vitest.config.ts`'s `coverage.thresholds` (verify enforcement is live by temporarily setting an unreachable threshold and confirming the build fails, rather than assuming the config is being read).

### Accessibility Tests (axe-core)
- Run axe on every distinct component state: `idle`, `loading`, `found`, `not-found`, `invalid`, `error`.
- Zero `critical` or `serious` violations permitted.
- Configure axe for WCAG 2.2 AA ruleset: `{ runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } }`.

### E2E Tests (Cypress / Playwright)
- Mock all HTTP calls with `cy.intercept()` — never depend on live API in CI.
- Cover happy path (found), sad path (not found), invalid-input path (validation rejected, no API call), error path, and keyboard-only flow (tab to input, type, press Enter to submit).
- Include a regression test asserting that typing alone — without submitting — never calls the API.

---

## What Claude Must NOT Do

- ❌ Use `any` type anywhere
- ❌ Use `NgModule` — standalone only
- ❌ Use constructor injection — use `inject()` only
- ❌ Use `@Input()` / `@Output()` decorators — use `input()` / `output()` signals
- ❌ Skip writing tests before implementation
- ❌ Hard-code color hex values in SCSS (use PrimeNG tokens)
- ❌ Add `target="_blank"` links without `rel="noopener noreferrer"`
- ❌ Subscribe to observables in templates (use async pipe or signals)
- ❌ Use `localStorage` or `sessionStorage`
- ❌ Expose HTTP errors directly to the UI
- ❌ Add `console.log` to production code (test code is fine)
- ❌ Trigger a search automatically on keystroke — a search only runs when the user submits (Search button click or Enter)
- ❌ Apply a flat minimum-length guard that blocks valid single-digit id searches
- ❌ Import or reference `zone.js` in any file
- ❌ Use `fakeAsync()` or `tick()` — zone.js APIs unavailable in zoneless Vitest
- ❌ Use `jest.*` APIs, the `done()` callback parameter, or the `fail()` global — use `vi.*` (Vitest) and plain synchronous/async assertions instead
- ❌ Use `HttpClientTestingModule` — use `provideHttpClientTesting()` instead
- ❌ Use `@angular/animations` or `provideAnimations()` — PrimeNG 21 uses native CSS
- ❌ Use PrimeNG `*Module` imports (e.g. `ButtonModule`) — import components directly (e.g. `Button`, or `ButtonDirective` for `[pButton]` attribute usage — check the real selector before assuming)
- ❌ Use `showTransitionOptions` or `hideTransitionOptions` on PrimeNG components
- ❌ `@import` PrimeNG's old `resources/themes/...` or `resources/primeng.css` in `styles.scss` — these files no longer exist in PrimeNG 21; use `providePrimeNG({ theme: { preset: Aura } })` instead
- ❌ Reference `@angular-devkit/build-angular` — use `@angular/build` instead
- ❌ Run `npx vitest run` directly to execute the suite — use `ng test` (the official builder); raw `vitest` cannot resolve Angular `templateUrl`/`styleUrl`

---

## Commands Reference

```bash
# Apply Angular Linker patch (runs automatically via postinstall; re-run manually
# after any npm install that bumps @angular/compiler-cli)
node scripts/patch-angular-linker.cjs

# Development
ng serve

# Unit tests (watch mode — Vitest via the official Angular builder)
ng test
# or: npm run test:watch

# Unit tests, single run
npm test
# (equivalent to: ng test --watch=false)

# Unit tests with coverage
npm run test:coverage
# (equivalent to: ng test --watch=false --coverage)

# Unit tests with UI dashboard
npm run test:ui

# E2E tests
npx cypress open
# or
npx playwright test

# Lint (ESLint 9, flat config — no --ext flag needed, eslint.config.js's
# per-block `files` globs already cover both .ts and .html)
npx eslint src

# Type check only
npx tsc --noEmit

# Security audit (must show zero high/critical)
npm audit --audit-level=high

# Build production
ng build --configuration production
```

---

## Known Issues & Active Workarounds

### Angular Linker — negative numeric literal bug (Angular 21.2.x + PrimeNG 21.1.x)

**Symptom:** `npm start` or `ng build` fails with:
```
Cannot create property 'message' on string '...primeng-message.mjs:
NumericLiterals must be non-negative finite numbers. You can use t.valueToNode(-1) instead.'
[plugin angular-compiler]
```

**Root cause:** `@angular/compiler-cli@21.2.x`'s Babel Linker plugin (`BabelAstFactory.createLiteral`) calls `t.numericLiteral(value)` for all numbers. PrimeNG 21.1.x's `Message`, `SpeedDial`, `Table`, `Tree`, and `TreeTable` components use Angular 21.2.x's `animate.enter`/`animate.leave` host bindings, which cause the Linker to emit a **negative** numeric literal. Both `@babel/types@7.x` and `@babel/types@8.x` reject `numericLiteral(-n)` — the correct Babel AST for `-n` is `unaryExpression('-', numericLiteral(n))`.

**Active fixes (both must be in place):**

1. **`scripts/patch-angular-linker.cjs`** — patches the single offending line in `node_modules/@angular/compiler-cli/bundles/linker/babel/index.js` at postinstall time. The patch changes `t.numericLiteral(value)` to `value < 0 ? t.unaryExpression("-", t.numericLiteral(-value)) : t.numericLiteral(value)`. Run manually with `node scripts/patch-angular-linker.cjs` after any `npm install` that touches `@angular/compiler-cli`.

2. **`angular.json` `serve.options.prebundle.exclude: ["primeng"]`** — prevents Vite's dep-optimisation step from also running the Linker on PrimeNG during HMR re-optimisation (a separate code path from the main compiler plugin that hits the same bug). PrimeNG is still bundled into the app by esbuild; only the Vite pre-bundling step is skipped.

**Remove both fixes** once Angular ships an upstream Linker fix (expected in a `21.2.x` patch). Verify the fix is no longer needed by temporarily reverting the patch script and confirming `npm start` succeeds.

---

## Dependencies

```json
{
  "dependencies": {
    "@angular/common": "^21.0.0",
    "@angular/compiler": "^21.0.0",
    "@angular/core": "^21.0.0",
    "@angular/forms": "^21.0.0",
    "@angular/platform-browser": "^21.0.0",
    "@angular/platform-browser-dynamic": "^21.0.0",
    "@angular/router": "^21.0.0",
    "primeng": "^21.0.0",
    "@primeng/themes": "^21.0.0",
    "primeicons": "^7.0.0",
    "primeflex": "^3.3.1",
    "rxjs": "^7.8.1",
    "tslib": "^2.8.0"
  },
  "devDependencies": {
    "@angular/build": "^21.0.0",
    "@angular/cli": "^21.0.0",
    "@angular/compiler-cli": "^21.0.0",
    "@angular-eslint/eslint-plugin": "^21.0.0",
    "@angular-eslint/eslint-plugin-template": "^21.0.0",
    "@angular-eslint/template-parser": "^21.0.0",
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "@types/node": "^22.0.0",
    "@eslint/js": "^9.0.0",
    "@vitest/browser": "^4.0.8",
    "@vitest/coverage-v8": "^4.0.8",
    "axe-core": "^4.10.0",
    "cypress": "^15.18.0",
    "cypress-real-events": "^1.13.0",
    "eslint": "^9.0.0",
    "jsdom": "^25.0.0",
    "playwright": "^1.49.0",
    "ts-node": "^10.9.0",
    "typescript": "^5.9.0",
    "vitest": "^4.0.8"
  },
  "overrides": {
    "undici": "^7.28.0",
    "qs": "^6.15.2",
    "esbuild": "^0.28.1",
    "@babel/core": ">=7.30.0"
  }
}
```

The four `overrides` entries:
- `undici`, `qs`, `esbuild` — pin transitive dependencies that `@angular/build`, `vite`, and `@cypress/request` each pinned to an exact or too-narrow vulnerable version. Re-check after any future `@angular/build`/`vite`/`cypress` bump.
- `@babel/core` — forces a modern Babel core across the tree as part of the Angular Linker workaround (see **Known Issues & Active Workarounds** above). Remove once the upstream Linker fix ships.

---

## Definition of Done

A feature is complete only when all of the following are true:

- [ ] All unit tests pass (`npm test`, i.e. `ng test --watch=false` — not raw `vitest run`)
- [ ] Coverage meets targets (≥ 90% components, 100% services)
- [ ] Zero TypeScript errors (`npx tsc --noEmit`)
- [ ] Zero ESLint errors (`npx eslint src`)
- [ ] All E2E scenarios pass
- [ ] Zero axe violations at WCAG 2.2 AA in all component states (`idle`, `loading`, `found`, `not-found`, `invalid`, `error`)
- [ ] `npm audit --audit-level=high` returns exit code 0
- [ ] No `zone.js`, `jest`, `@angular/animations`, or `*Module` PrimeNG imports exist anywhere in `src/`
- [ ] Code reviewed against all rules in this file
