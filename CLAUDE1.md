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
**HTTP:** Angular HttpClient with RxJS

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

### RxJS
- Search is triggered **explicitly** — Search button click or Enter submit — never automatically on keystroke.
- Use `switchMap` on the search-trigger stream (cancels an in-flight request if the user submits again before it resolves).
- Use `distinctUntilChanged()` on the search-trigger stream so an identical query submitted twice in a row doesn't call the API twice.
- Do not apply `debounceTime` to the search trigger — submission is already a deliberate user action, not a keystroke stream. A separate, undebounced `valueChanges` listener may still reset the UI to `idle` when the input drops below the minimum length or is cleared.
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

### Unit Tests (Jest)
- Every public method in a service must have at least one test per logical branch, including `validateQuery`'s id/email/name branches and the malformed-email/malformed-name rejection branches.
- Use `HttpTestingController` for HTTP tests — never real network calls.
- The search trigger is synchronous (no debounce) — drive component tests by calling `onSearch()` or submitting the form directly with `of(...)`/`throwError(...)` mocks; only reach for `fakeAsync`/`tick` if a real timer is introduced elsewhere.
- Use typed mock data that matches interfaces exactly (no partial casts with `as`).
- Minimum 90% branch coverage on components, 100% on services.

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

---

## Commands Reference

```bash
# Development
ng serve

# Unit tests (watch mode)
npx jest --watch

# Unit tests with coverage
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
- [ ] Coverage meets targets (≥ 90% components, 100% services)
- [ ] Zero TypeScript errors (`npx tsc --noEmit`)
- [ ] Zero ESLint errors (`npx eslint src`)
- [ ] All E2E scenarios pass
- [ ] Zero axe violations at WCAG 2.2 AA in all component states
- [ ] Code reviewed against all rules in this file
