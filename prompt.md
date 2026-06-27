# Claude CLI Prompt: Angular Customer Search Component

## Overview

Build a production-ready Angular **Customer Search** component following TDD, strict TypeScript, WCAG 2.2 AA accessibility, and PrimeNG styling.

---

## Step-by-Step Prompt Sequence

Use each block below as a separate Claude CLI prompt in order. Each step builds on the previous.

---

### Step 1 — Project Scaffold & Configuration

```
Create an Angular 17+ standalone component project structure for a Customer Search feature.

Requirements:
- Use Angular standalone components (no NgModules)
- Enable strict TypeScript (strict: true in tsconfig.json)
- Install and configure PrimeNG (latest) with the Lara Light theme
- Install RxJS (bundled with Angular)
- Install Jest + jest-preset-angular for unit testing (NOT Karma/Jasmine)
- Create folder structure:
    src/
      app/
        features/
          customer-search/
            models/
            services/
            components/
            pipes/
            __tests__/

Output:
- tsconfig.json with strict mode enabled
- jest.config.ts configured for Angular
- package.json with all dependencies
- main.ts bootstrapping a standalone AppComponent
- app.config.ts with provideHttpClient() and provideAnimations()

Do NOT write any feature code yet.
```

---

### Step 2 — Define Strict TypeScript Models

```
Inside src/app/features/customer-search/models/, create the following strict TypeScript interfaces and types. No "any" types allowed.

File: customer.model.ts

Interfaces required:
  - Geo { lat: string; lng: string }
  - Address { street: string; suite: string; city: string; zipcode: string; geo: Geo }
  - Company { name: string; catchPhrase: string; bs: string }
  - Customer { id: number; name: string; username: string; email: string; address: Address; phone: string; website: string; company: Company }

Types required:
  - SearchType = 'id' | 'username' | 'email'
  - SearchState = 'idle' | 'loading' | 'found' | 'not-found' | 'invalid' | 'error'

Interfaces required (continued):
  - SearchValidationResult { valid: boolean; searchType: SearchType | null; errorMessage: string | null }

File: search-result.model.ts
  - SearchResult<T> { data: T | null; state: SearchState; errorMessage: string | null }

Export all from an index.ts barrel file in the models/ folder.
```

---

### Step 3 — Write Tests FIRST for the Search Service (TDD Red Phase)

```
Using Jest, write failing unit tests FIRST for a CustomerSearchService before implementing it.

File: src/app/features/customer-search/__tests__/customer-search.service.spec.ts

The service will have two public methods:
  search(query: string): Observable<Customer[]>
  validateQuery(query: string): SearchValidationResult

It must detect AND validate the query type:
  - Digits only (e.g. "1") → valid id → call ?id=1. A single digit is a complete, valid id.
  - Contains "@" → must match a full email pattern (local@domain.tld) to be a valid email → call ?email=<query>;
    if it contains "@" but is malformed, it is INVALID and must never fall back to a username search.
  - Otherwise, must match an allowed name charset (letters, digits, spaces, `' . -`) to be a valid username → call ?username=<query>;
    otherwise it is INVALID.

Base URL: https://jsonplaceholder.typicode.com/users/

Test cases to write (all should FAIL at this stage):
  1. should be created
  2. should call the API with ?id= when query is a digit-only string
  3. should call the API with ?email= when query is a well-formed email
  4. should call the API with ?username= when query is a plain alphabetic string
  5. should return an Observable of Customer[]
  6. should return empty array when API returns []
  7. should propagate HTTP errors as Observables
  8. should fall back to a username search if search() is called with a query that fails validation
  9. validateQuery: should mark a digit-only query (including a single digit) as a valid id
  10. validateQuery: should mark a well-formed email as valid
  11. validateQuery: should reject a malformed email (contains "@" but no valid domain) instead of treating it as a username
  12. validateQuery: should mark a plain alphabetic query as a valid username
  13. validateQuery: should reject a query containing disallowed characters (e.g. "Sam$antha!")

Use HttpClientTestingModule and HttpTestingController.
Use typed mocks matching the Customer interface exactly.
```

---

### Step 4 — Implement CustomerSearchService (TDD Green Phase)

```
Now implement the CustomerSearchService to make all tests from Step 3 pass.

File: src/app/features/customer-search/services/customer-search.service.ts

Requirements:
  - Injectable({ providedIn: 'root' })
  - Use HttpClient (inject via inject())
  - Strict TypeScript: all parameters and return types explicitly typed
  - Public method: validateQuery(query: string): SearchValidationResult
      - Digits only → { valid: true, searchType: 'id', errorMessage: null }. No minimum length — a single digit is valid.
      - Contains '@' → must match a full email regex (e.g. /^[^\s@]+@[^\s@]+\.[^\s@]+$/) to be valid;
        if not, return { valid: false, searchType: null, errorMessage: <message> } — never fall through to username.
      - Otherwise → must match an allowed name charset regex to be valid as 'username'; otherwise invalid.
      - This is the single source of truth for detection AND validation — do not duplicate it in the component.
  - Public method: search(query: string): Observable<Customer[]>
      - Call validateQuery(query) to determine the searchType (default to 'username' if validation failed, as a defensive fallback)
      - Build URL params using HttpParams
      - Return this.http.get<Customer[]>(BASE_URL, { params })
  - No magic strings: define BASE_URL as a private readonly constant

Run tests after implementation. All tests must pass (Green phase).
```

---

### Step 5 — Write Tests FIRST for the Search Component (TDD Red Phase)

```
Write failing Jest unit tests for a CustomerSearchComponent before implementing the UI.

File: src/app/features/customer-search/__tests__/customer-search.component.spec.ts

The component will have:
  - A text input bound to a FormControl, plus a Search submit button — search runs ONLY on submit (button click or Enter), never automatically while typing
  - A searchState signal: SearchState (includes 'invalid')
  - A customer signal: Customer | null
  - A validationError signal: string | null

Test cases (all should FAIL now):
  1. should create the component
  2. should render a search input with aria-label="Search customers"
  3. should render a Search submit button
  4. should not call the service while the user is typing (no auto-search)
  5. should not call the service when Search is triggered with an empty input
  6. should not call the service when Search is triggered with fewer than 2 non-id characters
  7. should call the service for a single-digit id even though it is shorter than the minimum length
  8. should validate and call the service when Search is triggered with a valid query
  9. should call the service when the form is submitted (Search button click or Enter)
  10. should set state to "invalid" and not call the service when validation fails, showing the error message with role="alert"
  11. should not call the service again for the same query submitted twice in a row
  12. should display a loading indicator while state is "loading"
  13. should display customer info card when state is "found" and customer is not null
  14. should display "Customer not found" message when state is "not-found"
  15. should display an error message when state is "error"
  16. should clear previous results when a new search begins
  17. should reset to idle and clear results when the input is cleared
  18. input should have role="searchbox" and aria-live region for results

Since search is synchronous and explicit (no debounce), drive these tests by calling `onSearch()` or submitting
the form directly with `of(...)`/`throwError(...)`/a `Subject` (for the "clear previous results" case) — no
`fakeAsync`/`tick` needed.
Use MockProvider or jest.fn() to mock CustomerSearchService (both `search` and `validateQuery`).
```

---

### Step 6 — Implement CustomerSearchComponent (TDD Green Phase)

```
Implement the CustomerSearchComponent to make all 10 tests from Step 5 pass.

File: src/app/features/customer-search/components/customer-search.component.ts
File: src/app/features/customer-search/components/customer-search.component.html
File: src/app/features/customer-search/components/customer-search.component.scss

TypeScript requirements:
  - Standalone component, imports: [ReactiveFormsModule, FormsModule, PrimeNG modules]
    (FormsModule is needed purely so the plain `<form (ngSubmit)>` activates Angular's NgForm directive —
    the input itself still uses [formControl], not ngModel)
  - Use Angular Signals for state: searchState = signal<SearchState>('idle'), customer = signal<Customer | null>(null),
    validationError = signal<string | null>(null)
  - FormControl<string> with nonNullable: true
  - A private `searchTrigger = new Subject<string>()` piped with:
      - distinctUntilChanged()
      - switchMap to CustomerSearchService.search(), with catchError setting searchState to 'error'
      - takeUntilDestroyed() for cleanup
  - A separate, undebounced subscription to searchControl.valueChanges that resets to 'idle' and clears
    customer/validationError whenever the trimmed value drops below the minimum length (covers "input cleared")
  - onSearch() method, bound to the form's (ngSubmit):
      - trim the value; if empty, set 'idle' and return (no service calls)
      - call CustomerSearchService.validateQuery(value)
      - if the result is not type 'id' AND the value is shorter than 2 characters, set 'idle' and return
        (a single digit is already a valid id and must not be blocked)
      - if invalid, set searchState to 'invalid', clear customer, set validationError to the message, and return
      - otherwise clear validationError, set searchState to 'loading', clear customer, and push the value onto searchTrigger
  - On empty results ([]) set state to 'not-found'
  - On results set state to 'found' and customer signal to results[0]

HTML/Template requirements:
  - A <form (ngSubmit)="onSearch()"> wrapping the PrimeNG InputText (p-inputtext p-component) and a
    PrimeNG Button (pButton, type="submit", label="Search", icon="pi pi-search") — this is the ONLY way a search runs
  - PrimeNG Skeleton while state === 'loading' (not a spinner)
  - PrimeNG Card (p-card) to display customer info when state === 'found'
  - PrimeNG Message component for 'not-found', 'invalid' (severity="warn", role="alert", bound to validationError()),
    and 'error' states

WCAG 2.2 AA Accessibility requirements:
  - Input: role="searchbox", aria-label="Search customers", aria-describedby="search-hint"
  - Search hint text: id="search-hint" — "Search by ID, name or email address"
  - aria-live="polite" aria-atomic="true" region wrapping all results
  - aria-busy="true" on the live region while loading
  - Error and validation messages must have role="alert"
  - All interactive elements must be keyboard accessible (the Search button and Enter-to-submit both work)
  - Focus must not be lost on search result update
  - Color contrast must meet 4.5:1 ratio minimum

Layout requirements:
  - Center the component horizontally on the page with comfortable padding around it (e.g. `:host` flex
    centering plus a padded, bordered surface card using PrimeNG theme tokens) — do not stretch it edge-to-edge.

Run all tests. All tests from Step 5 must pass.
```

---

### Step 7 — Customer Info Card Sub-Component

```
Create a presentational CustomerCardComponent.

File: src/app/features/customer-search/components/customer-card.component.ts
File: src/app/features/customer-search/components/customer-card.component.html

Requirements:
  - Standalone, input() signal: customer = input.required<Customer>()
  - Display the following fields using PrimeNG layout:
      - Full Name (bold, large)
      - Username (prefixed with @)
      - Email (as mailto: link)
      - Phone
      - Website (as https:// link, opens in _blank with rel="noopener noreferrer")
      - Address: street, suite, city, zipcode
      - Company name and catchPhrase
  - Use PrimeNG Divider between sections
  - All links must have aria-label describing the destination
  - Card must have role="region" aria-label="Customer details"

Write 3 unit tests:
  1. should render customer name
  2. should render email as a mailto link
  3. should render website as an external link with rel="noopener noreferrer"
```

---

### Step 8 — Integration & E2E Test (Cypress or Playwright)

```
Write integration tests for the full Customer Search flow.

File: cypress/e2e/customer-search.cy.ts  (or playwright equivalent)

Test scenarios:
  1. User types a query but never submits → no API call is made and no result/loading UI appears (no auto-search)
  2. User types "1" and clicks Search → loading skeleton appears → customer card shows name "Leanne Graham"
     (a single-digit id must work despite being shorter than the general minimum length)
  3. User types "Samantha" and clicks Search → customer card shows name "Clementine Bauch"
  4. User types "Sincere@april.biz" and clicks Search → customer card shows correct email
  5. User types a malformed email like "not-an-email@" and clicks Search → an inline role="alert" validation
     message appears and NO API call is made
  6. User types "Kedar" and clicks Search → "Customer not found" message appears
  7. Network error is simulated → error message appears with role="alert"
  8. User clears input → all results disappear and state resets to 'idle'
  9. Keyboard-only navigation: user tabs to input, types, presses Enter to submit, then tabs to the result link and activates it

Use cy.intercept() to mock API responses for reliability.
```

---

### Step 9 — Accessibility Audit

```
Add an automated accessibility test using axe-core.

Install: @axe-core/angular or axe-playwright

Write accessibility tests covering:
  1. Component in 'idle' state has no axe violations
  2. Component in 'loading' state has no axe violations
  3. Component in 'found' state has no axe violations
  4. Component in 'not-found' state has no axe violations
  5. Component in 'invalid' state has no axe violations
  6. Component in 'error' state has no axe violations

All tests must pass with zero critical or serious violations at WCAG 2.2 AA level.

Produce an accessibility report as a JSON file: a11y-report.json
```

---

### Step 10 — Final Polish & Documentation

```
Add finishing touches:

1. Add a PrimeNG Skeleton loader that shows the card shape while loading
   (instead of a spinner).

2. Write a JSDoc comment on every public method and exported interface.

3. Generate a README.md explaining:
   - How to run the app
   - How to run unit tests
   - How to run e2e tests
   - API used and its limitations
   - Accessibility decisions made

Note: an earlier version of this app stored the last 5 unique searches in memory (SearchHistoryService) and
showed them in a "Recent searches" PrimeNG AutoComplete below the input. That feature has been intentionally
removed — search is now a single explicit action (Search button / Enter), and Steps 5-6 above already
reflect that. Do not reintroduce a recent-searches feature unless explicitly asked.
```

---

## API Reference

| Search Type | Example URL |
|---|---|
| By ID | `https://jsonplaceholder.typicode.com/users/?id=1` |
| By Username | `https://jsonplaceholder.typicode.com/users/?username=Samantha` |
| By Email | `https://jsonplaceholder.typicode.com/users/?email=Sincere@april.biz` |

- Returns `Customer[]` (array), empty `[]` if not found.
- No authentication required.
- Read-only mock API — POST/PUT/DELETE are simulated only.

---

## Test Coverage Targets

| Layer | Target |
|---|---|
| Services | 100% |
| Components | ≥ 90% |
| Models | 100% (type safety) |
| E2E flows | 9 happy/sad/invalid/error/keyboard-only scenarios |
| Accessibility | 0 axe violations (AA), across idle/loading/found/not-found/invalid/error |
