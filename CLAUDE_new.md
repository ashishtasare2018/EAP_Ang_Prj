# CLAUDE.md — Customer Search Project

> This file guides Claude CLI on how to work within this Angular project.
> Claude reads this automatically when running in this directory.

---

## Project Identity

**Project:** Customer Search Component
**Framework:** Angular 17+ (standalone APIs)
**Language:** TypeScript (strict mode — no exceptions)
**UI Library:** PrimeNG (latest, Lara Light theme)
**Testing:** Jest + jest-preset-angular (unit), Cypress or Playwright (e2e), axe-core (a11y)
**State:** Angular Signals
**HTTP:** Angular HttpClient — accessed only through `ApiHttpClientService`, never directly

---

## Service Layer Architecture

All HTTP communication flows through a dedicated abstraction layer.
No service or component may inject or call `HttpClient` directly.

```
CustomerSearchComponent
    │
    ▼
CustomerSearchService          ← domain logic: validation, query detection, params
    │
    ▼
ApiHttpClientService           ← HTTP infrastructure: headers, timeout, error shape
    │
    ▼
Angular HttpClient             ← Angular built-in (injected only inside ApiHttpClientService)
```

### Layer responsibilities

| Layer | Owns | Must NOT contain |
|---|---|---|
| `ApiHttpClientService` | `Content-Type`/`Accept` headers, 10 s timeout, `HttpErrorResponse` → `Error` normalisation, typed `get<T>()` and `post<T,B>()` | Customer models, validation logic, `BASE_URL`, any query param logic |
| `CustomerSearchService` | `validateQuery()`, `detectSearchType()`, `buildParams()`, `BASE_URL`, search state | `HttpClient`, `HttpHeaders`, raw HTTP options |
| `CustomerSearchComponent` | UI signals, form control, result display | `ApiHttpClientService`, `HttpClient` |

### File locations

```
src/app/features/customer-search/
  services/
    api-http-client.service.ts      ← generic HTTP wrapper (GET + POST)
    customer-search.service.ts      ← domain search logic
  __tests__/
    api-http-client.service.spec.ts ← 18 unit tests, 100% coverage required
    customer-search.service.spec.ts ← 24 unit tests, 100% coverage required
```

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

### HTTP
- `HttpClient` is injected **only** inside `ApiHttpClientService`. No other class may inject it.
- `ApiHttpClientService` is the single entry point for all outbound HTTP calls.
- Every HTTP call must use `take(1)` so the observable completes after one emission.
- Every HTTP call must apply `timeout(10_000)` to prevent hanging requests.
- `catchError` must map `HttpErrorResponse` to a plain `Error` — never expose raw Angular HTTP objects to callers.
- `DEFAULT_HEADERS` (`Content-Type: application/json`, `Accept: application/json`) are set inside `ApiHttpClientService` and must not be duplicated in any other layer.

### RxJS
- Search is triggered **explicitly** — Search button click or Enter submit — never automatically on keystroke.
- Use `switchMap` on the search-trigger stream (cancels an in-flight request if the user submits again before it resolves).
- Use `distinctUntilChanged()` on the search-trigger stream so an identical query submitted twice in a row does not call the API twice.
- Do not apply `debounceTime` to the search trigger — submission is already a deliberate user action.
- Always handle errors with `catchError` and return a safe fallback observable.
- Do not swallow errors silently — always set an error state signal.

### PrimeNG
- Import only the specific PrimeNG modules needed (tree-shakable imports).
- Use PrimeNG utility CSS classes (`p-inputtext`, `p-card`, `p-message`, etc.).
- Use PrimeNG `Skeleton` for loading states instead of spinners where possible.
- Apply PrimeNG theme tokens for all colors — never hard-code hex values in component SCSS.
- The component must be horizontally centered on the page with comfortable padding around it (host-level flex centering plus a padded, bordered surface card) — never let it stretch edge-to-edge or sit flush against the viewport.

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
          api-http-client.service.ts   ← generic HTTP GET + POST wrapper
          customer-search.service.ts   ← domain search logic
        components/
          customer-search.component.ts
          customer-search.component.html
          customer-search.component.scss
          customer-card.component.ts
          customer-card.component.html
        pipes/                     ← any custom pipes
        __tests__/
          api-http-client.service.spec.ts  ← 18 tests
          customer-search.service.spec.ts  ← 24 tests
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
| Services | PascalCase + Service suffix | `CustomerSearchService`, `ApiHttpClientService` |
| Components | PascalCase + Component suffix | `CustomerSearchComponent` |
| Files | kebab-case | `api-http-client.service.ts` |
| CSS classes | BEM-like kebab-case | `search-box__input`, `search-box__results` |
| Constants | SCREAMING_SNAKE_CASE | `BASE_URL`, `MIN_QUERY_LENGTH`, `REQUEST_TIMEOUT_MS` |

---

## ApiHttpClientService — Full Specification

### Module-level constants

```typescript
const DEFAULT_HEADERS = new HttpHeaders({
  'Content-Type': 'application/json',
  Accept: 'application/json',
});

const REQUEST_TIMEOUT_MS = 10_000;
```

### Class shape

```typescript
@Injectable({ providedIn: 'root' })
export class ApiHttpClientService {
  private readonly http = inject(HttpClient);

  get<T>(url: string, params?: HttpParams): Observable<T> { ... }
  post<T, B>(url: string, body: B): Observable<T> { ... }

  private readonly handleError = (err: unknown): Observable<never> => { ... };
}
```

### Method behaviour

| Method | Headers set | Timeout | Error handling | Completes after |
|---|---|---|---|---|
| `get<T>()` | `DEFAULT_HEADERS` | 10 s | `HttpErrorResponse` → `Error` | 1 emission (`take(1)`) |
| `post<T,B>()` | `DEFAULT_HEADERS` | 10 s | `HttpErrorResponse` → `Error` | 1 emission (`take(1)`) |

### Error normalisation

```typescript
private readonly handleError = (err: unknown): Observable<never> => {
  if (err instanceof HttpErrorResponse) {
    return throwError(() => new Error(err.message));
  }
  return throwError(() => new Error('An unexpected network error occurred.'));
};
```

---

## API Contract

Base URL: `https://jsonplaceholder.typicode.com/users/`

| Query param | Detects when | Example |
|---|---|---|
| `?id=` | Query is digits only | `?id=1` |
| `?email=` | Query contains `@` **and** matches a full email pattern (`local@domain.tld`) | `?email=Sincere@april.biz` |
| `?username=` | Any other string matching the allowed name charset (letters, digits, spaces, `' . -`) | `?username=Samantha` |

**Response shape:** Always `Customer[]`. Empty array `[]` means not found.

Detection **and** validation logic live exclusively in `CustomerSearchService.validateQuery(query: string): SearchValidationResult`. Do not duplicate this logic in the component or in `ApiHttpClientService`. A query containing `@` is always evaluated as an email — never silently reinterpreted as a name — so a malformed address is rejected with an inline error instead of being sent to the API as a username search.

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

### Unit Tests (Jest)

**ApiHttpClientService (100% coverage required)**
- Test every public method: `get<T>()` and `post<T,B>()`.
- Use `HttpClientTestingModule` and `HttpTestingController` — never real network calls.
- Assert the HTTP method, URL, headers, and params on every request.
- Cover 4xx, 5xx, and `ErrorEvent` (network) error paths.
- Assert the observable completes after one emission.
- Call `httpTestingController.verify()` after every test.
- Use a fully-typed `MOCK_CUSTOMER` constant — no `as Customer` casts.

**CustomerSearchService (100% coverage required)**
- Mock `ApiHttpClientService` with `jest.Mocked<Pick<ApiHttpClientService, 'get' | 'post'>>`.
- Do NOT use `HttpClientTestingModule` in CustomerSearchService tests — HTTP is mocked at the `ApiHttpClientService` boundary.
- Test every logical branch of `validateQuery()`, `detectSearchType()`, and `buildParams()`.
- Assert the correct `HttpParams` are built and passed to `apiHttp.get()`.
- Call `jest.clearAllMocks()` in `afterEach`.

**Components (≥ 90% coverage)**
- Mock `CustomerSearchService` — do not touch HTTP at all in component tests.
- Drive tests by calling `component.onSearch()` or submitting the form directly.
- No `fakeAsync` / `tick` unless a real timer is introduced.

### Accessibility Tests (axe-core)
- Run axe on every distinct component state: `idle`, `loading`, `found`, `not-found`, `invalid`, `error`.
- Zero `critical` or `serious` violations permitted.
- Configure axe for WCAG 2.2 AA ruleset: `{ runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } }`.

### E2E Tests (Cypress / Playwright)
- Mock all HTTP calls with `cy.intercept()` — never depend on live API in CI.
- Cover happy path (found), sad path (not found), invalid-input path (validation rejected, no API call), error path, and keyboard-only flow (tab to input, type, press Enter to submit).
- Include a regression test asserting that typing alone — without submitting — never calls the API.

---

## Import Ordering Convention

Every TypeScript file must follow this import order:

```typescript
// 1. Angular packages
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

// 2. RxJS packages
import { catchError, Observable, take, throwError, timeout } from 'rxjs';

// 3. Local project imports (relative paths)
import { Customer } from '../models';
import { ApiHttpClientService } from './api-http-client.service';
```

---

## What Claude Must NOT Do

- ❌ Use `any` type anywhere
- ❌ Use `NgModule` — standalone only
- ❌ Use constructor injection — use `inject()` only
- ❌ Use `@Input()` / `@Output()` decorators — use `input()` / `output()` signals
- ❌ Inject or call `HttpClient` outside of `ApiHttpClientService`
- ❌ Set HTTP headers outside of `ApiHttpClientService`
- ❌ Put `BASE_URL`, validation logic, or `HttpParams` construction inside `ApiHttpClientService`
- ❌ Put domain models (Customer, SearchState) inside `ApiHttpClientService`
- ❌ Use `HttpClientTestingModule` in `CustomerSearchService` tests
- ❌ Skip writing tests before implementation
- ❌ Hard-code color hex values in SCSS (use PrimeNG tokens)
- ❌ Add `target="_blank"` links without `rel="noopener noreferrer"`
- ❌ Subscribe to observables in templates (use async pipe or signals)
- ❌ Use `localStorage` or `sessionStorage`
- ❌ Expose HTTP errors or raw `HttpErrorResponse` objects to the UI
- ❌ Add `console.log` to production code (test code is fine)
- ❌ Trigger a search automatically on keystroke — a search only runs when the user submits
- ❌ Apply a flat minimum-length guard that blocks valid single-digit id searches
- ❌ Leave unused imports in any file

---

## Commands Reference

```bash
# Development
ng serve

# Unit tests (watch mode)
npx jest --watch

# Unit tests — single file
npx jest api-http-client.service.spec.ts --no-coverage --verbose
npx jest customer-search.service.spec.ts --no-coverage --verbose

# Unit tests with full coverage report
npx jest --coverage

# E2E tests
npx cypress open
# or
npx playwright test

# Lint
npx eslint src --ext .ts,.html

# Type check only
npx tsc --noEmit

# Build production
ng build --configuration production
```

---

## Dependencies

```json
{
  "dependencies": {
    "@angular/core": "^17.0.0",
    "@angular/common": "^17.0.0",
    "@angular/forms": "^17.0.0",
    "@angular/router": "^17.0.0",
    "primeng": "^17.0.0",
    "primeicons": "^6.0.0",
    "primeflex": "^3.0.0",
    "rxjs": "^7.8.0"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "jest-preset-angular": "^14.0.0",
    "@types/jest": "^29.0.0",
    "axe-core": "^4.9.0",
    "@axe-core/angular": "^4.0.0",
    "cypress": "^13.0.0",
    "@angular/build": "^17.0.0"
  }
}
```

---

## Definition of Done

A feature is complete only when all of the following are true:

- [ ] All unit tests pass (`npx jest`)
- [ ] `ApiHttpClientService` has 100% statement, branch, function, and line coverage
- [ ] `CustomerSearchService` has 100% statement, branch, function, and line coverage
- [ ] Components meet ≥ 90% coverage on all metrics
- [ ] Zero TypeScript errors (`npx tsc --noEmit`)
- [ ] Zero ESLint errors (`npx eslint src`)
- [ ] All E2E scenarios pass
- [ ] Zero axe violations at WCAG 2.2 AA in all component states
- [ ] No `HttpClient` import exists outside `api-http-client.service.ts`
- [ ] No `HttpHeaders` construction exists outside `api-http-client.service.ts`
- [ ] Every public method in both services has JSDoc
- [ ] Import ordering follows Angular → RxJS → local in every file
- [ ] Code reviewed against all rules in this file
