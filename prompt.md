# prompt.md — HTTP Client Abstraction Layer
## Claude CLI Step-by-Step Prompts

> Run each numbered prompt block in order inside Claude CLI.
> Each block is self-contained with a clear deliverable and a verification step.
> Do NOT skip ahead — every step depends on the previous one passing.

---

## Background: What We Are Building

Right now `CustomerSearchService` calls Angular's `HttpClient` directly.
We are inserting a **dedicated HTTP layer** between them:

```
BEFORE
  CustomerSearchService  →  HttpClient

AFTER
  CustomerSearchService  →  ApiHttpClientService  →  HttpClient
```

### Two files will change:

| File | Status | What changes |
|---|---|---|
| `src/app/features/customer-search/services/api-http-client.service.ts` | **NEW** | Generic GET + POST wrapper. Owns headers, timeout, error normalisation. |
| `src/app/features/customer-search/services/customer-search.service.ts` | **UPDATED** | Drops direct `HttpClient` dependency. Calls `ApiHttpClientService` instead. |
| `src/app/features/customer-search/__tests__/api-http-client.service.spec.ts` | **NEW** | 18 unit tests for the new service. |
| `src/app/features/customer-search/__tests__/customer-search.service.spec.ts` | **UPDATED** | Mocks `ApiHttpClientService` instead of `HttpClient`. Adds 6 new tests. |

### Responsibility split after the refactor:

| Concern | Owner |
|---|---|
| Set `Content-Type` / `Accept` headers | `ApiHttpClientService` |
| Apply request timeout | `ApiHttpClientService` |
| Normalise `HttpErrorResponse` → `Error` | `ApiHttpClientService` |
| Validate query string (id / email / username) | `CustomerSearchService` |
| Build `HttpParams` for the search | `CustomerSearchService` |
| UI state, signals, form control | `CustomerSearchComponent` (unchanged) |

---

## Step 1 of 4 — Write Failing Tests for ApiHttpClientService (TDD Red)

```
Read CLAUDE.md in this directory before writing a single line of code.
Every rule in CLAUDE.md applies without exception.

Context
-------
Project: Angular 17+ standalone, strict TypeScript, RxJS, Jest for unit tests.
Services folder: src/app/features/customer-search/services/
Tests folder:    src/app/features/customer-search/__tests__/

Task
----
Write FAILING unit tests for a brand-new service called ApiHttpClientService.
The implementation file does NOT exist yet. Write only the test file.

File to create
--------------
src/app/features/customer-search/__tests__/api-http-client.service.spec.ts

The service will expose exactly two public methods:

  get<T>(url: string, params?: HttpParams): Observable<T>
  post<T, B>(url: string, body: B): Observable<T>

Test cases — write all 18, every one must fail at this stage
------------------------------------------------------------

GROUP 1 — Service creation (1 test)
  1. should be created

GROUP 2 — get<T>() (9 tests)
  2. should make a GET request to the exact URL provided
  3. should attach HttpParams to the GET request when params argument is provided
  4. should make a GET request with no query params when params argument is omitted
  5. should set the Content-Type header to application/json on GET requests
  6. should set the Accept header to application/json on GET requests
  7. should return an Observable that emits the typed response body
  8. should complete the Observable after a single emission (no long-lived streams)
  9. should propagate HTTP 4xx errors as an Observable error (use 404)
  10. should propagate HTTP 5xx errors as an Observable error (use 500)

GROUP 3 — post<T, B>() (7 tests)
  11. should make a POST request to the exact URL provided
  12. should send the request body serialised as JSON
  13. should set the Content-Type header to application/json on POST requests
  14. should set the Accept header to application/json on POST requests
  15. should return an Observable that emits the typed response body
  16. should complete the Observable after a single emission
  17. should propagate HTTP 4xx errors on POST as an Observable error (use 400)

GROUP 4 — shared behaviour (1 test)
  18. should propagate network-level errors (ErrorEvent) as an Observable error

Implementation rules for the test file
---------------------------------------
- Use HttpClientTestingModule and HttpTestingController from @angular/common/http/testing.
- Never make real network calls.
- Configure TestBed with:
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiHttpClientService],
    });
- Import Customer from src/app/features/customer-search/models/index.ts
  and use it as the typed generic in GET tests.
- Use a MOCK_CUSTOMER constant that satisfies the full Customer interface —
  no partial objects, no "as Customer" casts.
- After every test, call httpTestingController.verify() to catch unexpected requests.
- For header assertions use:
    const req = httpTestingController.expectOne(url);
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
- For error tests use req.flush(null, { status: 404, statusText: 'Not Found' }).
- For network error tests use req.error(new ErrorEvent('Network error')).
- For the "completes after one emission" tests use a done callback or
  subscribe with complete: () => done() to assert the stream finishes.

Verification
------------
After creating the file, confirm the tests fail by running:
  npx jest api-http-client.service.spec.ts --no-coverage 2>&1 | tail -20

You should see 18 failing tests. Paste the failure summary here.
Do NOT move to Step 2 until you see exactly 18 failures.
```

---

## Step 2 of 4 — Implement ApiHttpClientService (TDD Green)

```
Read CLAUDE.md before starting.

Context
-------
All 18 tests from Step 1 are failing. Implement the service to make them pass.

File to create
--------------
src/app/features/customer-search/services/api-http-client.service.ts

Complete specification
----------------------

Imports (use only what you need — no unused imports):
  import { inject, Injectable } from '@angular/core';
  import {
    HttpClient,
    HttpErrorResponse,
    HttpHeaders,
    HttpParams,
  } from '@angular/common/http';
  import { catchError, Observable, take, throwError, timeout } from 'rxjs';

Module-level constants (outside the class, at the top of the file):
  const DEFAULT_HEADERS = new HttpHeaders({
    'Content-Type': 'application/json',
    Accept: 'application/json',
  });
  const REQUEST_TIMEOUT_MS = 10_000;

Class declaration:
  @Injectable({ providedIn: 'root' })
  export class ApiHttpClientService { ... }

Fields (all private readonly, inject() only — no constructor):
  private readonly http = inject(HttpClient);

Public method — get<T>():
  /**
   * Performs a typed HTTP GET request.
   *
   * @param url    Absolute URL or path to call.
   * @param params Optional HttpParams to append as query string.
   * @returns      Observable that emits the typed response body once then completes.
   */
  get<T>(url: string, params?: HttpParams): Observable<T> {
    return this.http
      .get<T>(url, { headers: DEFAULT_HEADERS, params })
      .pipe(
        take(1),
        timeout(REQUEST_TIMEOUT_MS),
        catchError(this.handleError),
      );
  }

Public method — post<T, B>():
  /**
   * Performs a typed HTTP POST request.
   *
   * @param url  Absolute URL or path to call.
   * @param body Request payload — must be JSON-serialisable.
   * @returns    Observable that emits the typed response body once then completes.
   */
  post<T, B>(url: string, body: B): Observable<T> {
    return this.http
      .post<T>(url, body, { headers: DEFAULT_HEADERS })
      .pipe(
        take(1),
        timeout(REQUEST_TIMEOUT_MS),
        catchError(this.handleError),
      );
  }

Private error handler (arrow function so "this" is always bound):
  private readonly handleError = (err: unknown): Observable<never> => {
    if (err instanceof HttpErrorResponse) {
      return throwError(() => new Error(err.message));
    }
    return throwError(() => new Error('An unexpected network error occurred.'));
  };

Rules
-----
- Zero use of "any" anywhere in the file.
- No constructor — only inject().
- No domain logic (no URL constants, no query validation, no customer types).
- DEFAULT_HEADERS and REQUEST_TIMEOUT_MS live at module scope, not inside the class.
- Every public method must have JSDoc as specified above.
- The file must compile with npx tsc --noEmit before you move on.

Verification
------------
Run the test suite after creating the file:
  npx jest api-http-client.service.spec.ts --no-coverage --verbose 2>&1 | tail -30

All 18 tests must show ✓ (passing).
Then run the TypeScript check:
  npx tsc --noEmit 2>&1

Zero errors expected. Paste both outputs before moving to Step 3.
```

---

## Step 3 of 4 — Update CustomerSearchService Tests (TDD Red for Refactor)

```
Read CLAUDE.md before starting.

Context
-------
CustomerSearchService currently imports and injects HttpClient directly.
We are refactoring it to use ApiHttpClientService instead.
This step updates the test file so it mocks ApiHttpClientService — and adds
six new tests that express the intended behaviour. These new tests must FAIL
because the refactor has not happened yet.

File to update
--------------
src/app/features/customer-search/__tests__/customer-search.service.spec.ts

Changes to make
---------------

REMOVE these imports and usages entirely:
  - HttpClientTestingModule
  - HttpTestingController
  - Any httpTestingController.expectOne(...) calls
  - Any req.flush(...) or req.error(...) calls
  - Any import of provideHttpClient or HttpClientModule

ADD at the top of the describe block a typed mock for ApiHttpClientService:

  import { ApiHttpClientService } from '../services/api-http-client.service';
  import { of, throwError } from 'rxjs';

  // Typed partial mock — matches the real service's public surface
  let mockApiHttp: jest.Mocked<Pick<ApiHttpClientService, 'get' | 'post'>>;

  beforeEach(() => {
    mockApiHttp = {
      get: jest.fn(),
      post: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        CustomerSearchService,
        { provide: ApiHttpClientService, useValue: mockApiHttp },
      ],
    });

    service = TestBed.inject(CustomerSearchService);
  });

UPDATE existing HTTP-behaviour tests:
  Replace every pattern that flushed a real HTTP request with:
    mockApiHttp.get.mockReturnValue(of([MOCK_CUSTOMER]));
    // then call service.search('...') and subscribe/assert

ADD six new test cases that must FAIL right now:

  19. should inject ApiHttpClientService, not HttpClient directly
      Hint: assert ApiHttpClientService is in the service's injector tree,
      not HttpClient. Use TestBed.inject(ApiHttpClientService) — it should
      return the mock, confirming the service uses the abstraction.

  20. should call apiHttpClientService.get with the BASE_URL for an id query
      Setup:  mockApiHttp.get.mockReturnValue(of([MOCK_CUSTOMER]));
      Act:    service.search('1').subscribe();
      Assert: expect(mockApiHttp.get).toHaveBeenCalledWith(
                'https://jsonplaceholder.typicode.com/users/',
                expect.any(HttpParams)
              );

  21. should pass HttpParams with id=1 when query is the string '1'
      Setup:  mockApiHttp.get.mockReturnValue(of([MOCK_CUSTOMER]));
      Act:    service.search('1').subscribe();
      Assert: const params = mockApiHttp.get.mock.calls[0][1] as HttpParams;
              expect(params.get('id')).toBe('1');
              expect(params.has('email')).toBe(false);
              expect(params.has('username')).toBe(false);

  22. should pass HttpParams with email= when query contains '@' and is valid
      Setup:  mockApiHttp.get.mockReturnValue(of([MOCK_CUSTOMER]));
      Act:    service.search('test@example.com').subscribe();
      Assert: const params = mockApiHttp.get.mock.calls[0][1] as HttpParams;
              expect(params.get('email')).toBe('test@example.com');

  23. should pass HttpParams with username= for a plain name query
      Setup:  mockApiHttp.get.mockReturnValue(of([MOCK_CUSTOMER]));
      Act:    service.search('Samantha').subscribe();
      Assert: const params = mockApiHttp.get.mock.calls[0][1] as HttpParams;
              expect(params.get('username')).toBe('Samantha');

  24. should forward an error emitted by ApiHttpClientService.get to the caller
      Setup:  mockApiHttp.get.mockReturnValue(
                throwError(() => new Error('network failure'))
              );
      Act:    service.search('1').subscribe({
                error: (err: Error) => {
                  expect(err.message).toBe('network failure');
                  done();
                },
              });

Rules
-----
- The MOCK_CUSTOMER object must match the full Customer interface exactly.
- Use jest.Mocked<Pick<...>> so TypeScript enforces the mock shape.
- Do not use "as any" casts anywhere.
- afterEach must call jest.clearAllMocks() to prevent state leaking between tests.

Verification
------------
Run only the updated service test file:
  npx jest customer-search.service.spec.ts --no-coverage 2>&1 | tail -20

Existing tests should still pass.
The 6 new tests (19–24) must FAIL.
Paste the failure summary before moving to Step 4.
```

---

## Step 4 of 4 — Refactor CustomerSearchService + Full Verification (TDD Green + Refactor)

```
Read CLAUDE.md before starting.

Context
-------
Tests 19–24 are failing because CustomerSearchService still calls HttpClient
directly. Refactor it now to use ApiHttpClientService. The public API — method
names, signatures, and return types — must not change. The component that calls
this service must require zero changes.

File to update
--------------
src/app/features/customer-search/services/customer-search.service.ts

Exact changes required
----------------------

REMOVE:
  - import { HttpClient } from '@angular/common/http';   (or the full HttpClient line)
  - private readonly http = inject(HttpClient);
  - The headers object (HttpHeaders) that was built inside this service
  - { headers: ... } options passed to this.http.get(...)

ADD:
  - import { ApiHttpClientService } from './api-http-client.service';
  - private readonly apiHttp = inject(ApiHttpClientService);

CHANGE the internal HTTP call from:
  this.http.get<Customer[]>(BASE_URL, { params, headers })
to:
  this.apiHttp.get<Customer[]>(BASE_URL, params)

  (ApiHttpClientService already applies the headers — do not pass them here.)

Keep everything else completely unchanged:
  - BASE_URL constant
  - validateQuery() method
  - detectSearchType() method
  - buildParams() (or equivalent params-construction logic)
  - All exported interfaces and types
  - catchError handling in the public search() method
  - Every JSDoc comment

Import hygiene
--------------
After the change, scan the import list and remove any import that is no longer
used. Run the TypeScript compiler to confirm.

Verification — run all four checks in order, fix any failure before moving on
-----------------------------------------------------------------------------

CHECK 1 — CustomerSearchService tests (must be 24/24 green):
  npx jest customer-search.service.spec.ts --no-coverage --verbose 2>&1 | tail -35

CHECK 2 — ApiHttpClientService tests (must still be 18/18 green):
  npx jest api-http-client.service.spec.ts --no-coverage --verbose 2>&1 | tail -25

CHECK 3 — Full test suite with coverage (must meet thresholds):
  npx jest --coverage 2>&1 | tail -20

  Required minimums:
    CustomerSearchService  : 100% statements, branches, functions, lines
    ApiHttpClientService   : 100% statements, branches, functions, lines
    Components             : ≥ 90% on all metrics
    Zero test regressions across the full suite

CHECK 4 — TypeScript strict check (zero errors):
  npx tsc --noEmit 2>&1

Paste all four outputs before declaring the task complete.

Refactor pass (run only after all checks are green)
----------------------------------------------------
Review both service files side by side and fix any of the following:

  □ Any remaining magic strings — extract to named constants
  □ Missing or outdated JSDoc on public methods
  □ Import ordering not following the convention:
      1. Angular packages (@angular/*)
      2. RxJS packages (rxjs, rxjs/operators)
      3. Local project imports (relative paths)
  □ Any exported symbol that is no longer used — remove it
  □ Any logic that has drifted to the wrong layer:
      - Domain logic (validation, param building) must stay in CustomerSearchService
      - HTTP plumbing (headers, timeout, error shape) must stay in ApiHttpClientService

After the refactor pass, re-run CHECK 1, CHECK 2, and CHECK 4 to confirm
nothing broke. Paste the re-run outputs.

Final file listing
------------------
Output a table of every file created or modified during Steps 1–4:

| File | Status | What changed |
|------|--------|--------------|
| api-http-client.service.ts      | Created  | ... |
| api-http-client.service.spec.ts | Created  | ... |
| customer-search.service.ts      | Updated  | ... |
| customer-search.service.spec.ts | Updated  | ... |
```

---

## Architecture reference card

```
CustomerSearchComponent
    │
    │  calls search(query: string)
    ▼
CustomerSearchService                     ← domain layer
    │  validateQuery()
    │  detectSearchType()
    │  buildParams()
    │
    │  calls apiHttp.get<Customer[]>(BASE_URL, params)
    ▼
ApiHttpClientService                      ← HTTP infrastructure layer  ← NEW
    │  Sets Content-Type + Accept headers
    │  Applies 10 s timeout
    │  Normalises HttpErrorResponse → Error
    │
    │  calls http.get<T>(url, { headers, params })
    ▼
Angular HttpClient                        ← Angular built-in
```

### Layer boundaries — never cross these

| Layer | May depend on | Must NOT depend on |
|---|---|---|
| `ApiHttpClientService` | `HttpClient`, `HttpHeaders`, `HttpParams`, RxJS | Customer models, validation logic, BASE_URL |
| `CustomerSearchService` | `ApiHttpClientService`, Customer models, RxJS | `HttpClient`, `HttpHeaders` |
| `CustomerSearchComponent` | `CustomerSearchService`, Angular Signals, PrimeNG | `ApiHttpClientService`, `HttpClient` |

---

## Definition of done for this task

- [ ] `api-http-client.service.ts` created — 0 lines of domain logic
- [ ] `api-http-client.service.spec.ts` created — 18 tests, all green
- [ ] `customer-search.service.ts` updated — no `HttpClient` import remaining
- [ ] `customer-search.service.spec.ts` updated — 24 tests, all green
- [ ] `npx tsc --noEmit` produces zero errors
- [ ] `npx jest --coverage` meets 100% on both services, ≥ 90% on components
- [ ] No `any` type appears in any modified file
- [ ] Import ordering follows Angular → RxJS → local in every file
- [ ] Every public method in both services has JSDoc
