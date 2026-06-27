# Customer Search

An Angular 17 standalone-component app for looking up a customer by ID, username, or email against the JSONPlaceholder mock API.

## Running the app

```bash
npm install
ng serve
```

Then open `http://localhost:4200`.

## Running unit tests

```bash
npx jest              # single run
npx jest --watch       # watch mode
npx jest --coverage    # with coverage report (services: 100%, components: ≥90%, enforced in jest.config.ts)
```

## Running e2e tests

```bash
npx cypress open   # interactive
npx cypress run    # headless
```

All e2e scenarios mock the API via `cy.intercept()` (`cypress/e2e/customer-search.cy.ts`) — they never hit the live JSONPlaceholder service, so they're safe to run in CI.

## Running the accessibility audit

The axe-core checks run as part of the normal Jest suite (`src/app/features/customer-search/__tests__/accessibility.spec.ts`), scanning the component in all five states (`idle`, `loading`, `found`, `not-found`, `error`) against the WCAG 2.2 AA rule set. A machine-readable summary is written to `a11y-report.json` after the run.

## API used and its limitations

- Base URL: `https://jsonplaceholder.typicode.com/users/`
- Read-only mock API — there is no real customer data behind it, and write operations are only simulated (nothing persists).
- No authentication, and no documented rate limiting, but it's a shared public fake-data service — don't depend on it for production traffic.
- Always returns an array, even when filtering by a single `id`. An empty array means "not found"; the app only ever displays the first result.
- Query type is auto-detected client-side (`CustomerSearchService.detectSearchType`): purely numeric input → `?id=`, contains `@` → `?email=`, otherwise → `?username=`. This means a username that happens to be all digits will incorrectly be searched as an `id` — an inherent limitation of inferring intent from the string alone, accepted here per the stated API contract.

## Accessibility decisions

- The search input has `role="searchbox"`, a visible `<label>`, and `aria-label="Search customers"`, plus `aria-describedby` pointing at a hint explaining the supported query types.
- The results region is `aria-live="polite"` / `aria-atomic="true"` so screen reader users are told about new results without focus being moved — the input never loses focus as you type or as results change.
- `aria-busy="true"` is set on the results region while a search is in flight, paired with the skeleton placeholder (and a visually-hidden "Searching customers…" string) for screen readers, since the skeleton shapes themselves are `aria-hidden`.
- Error messages use `role="alert"` so they're announced immediately, independent of the `aria-live="polite"` region.
- The "Customer not found" and error messages never expose raw HTTP status codes or error details — see `customer-search.component.ts`'s `catchError`.
- All colors are sourced from PrimeNG's Lara Light Blue theme tokens (CSS custom properties) rather than hard-coded hex values, so contrast stays consistent with the rest of the theme.
- The external website link on the customer card uses `target="_blank" rel="noopener noreferrer"` and an `aria-label` describing where it leads; the mailto link is similarly labelled.
- Everything is reachable via keyboard alone (native `<input>`, PrimeNG components, and standard anchors) — there's no custom keyboard trap or focus management beyond what the browser provides by default.
