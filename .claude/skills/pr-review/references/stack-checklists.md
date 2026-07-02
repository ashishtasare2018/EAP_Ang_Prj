# Stack-specific checklists

Load only the section(s) relevant to the detected stack(s) from Step 2 of SKILL.md.

## Angular / TypeScript frontend

- Standards: consistent use of `standalone` components vs modules (don't mix conventions mid-file); no `any` types introduced without justification; RxJS subscriptions are unsubscribed (`takeUntilDestroyed`, `async` pipe, or explicit teardown) — unsubscribed subscriptions in components are a common leak; template bindings don't call methods that do heavy work on every change-detection cycle.
- Coverage: new components/services/pipes have a matching `.spec.ts`; changed `@Input()`/`@Output()` contracts have a test exercising the new contract; run `ng test --watch=false --code-coverage` if feasible.
- Logic: check for signal/observable timing issues (change detection, `OnPush` components that don't call `markForCheck` after async updates); check route guards and resolvers for edge cases (unauthenticated, empty params).
- Ignore: anything under `.angular/cache/`, `dist/`, `node_modules/` — these are build artifacts, not source changes. If they appear in `git status`, that's a `.gitignore` gap worth flagging as a standards note, not a logic review target.

## Node / Express / general JS-TS backend

- Standards: consistent async style (no mixing callbacks/promises/async-await in the same module without reason); input validation on new endpoints/handlers; consistent error response shape.
- Coverage: new routes/handlers/middleware have request-level tests; run `npm test -- --coverage` (or the repo's configured script) if feasible.
- Logic: check for unhandled promise rejections, missing `await`, race conditions on shared state; verify new endpoints handle auth/authorization the same way as sibling endpoints.

## Python

- Standards: type hints present and consistent with the rest of the module; follows repo's configured linter (`ruff`, `flake8`, `black` — check `pyproject.toml`); no bare `except:`; no mutable default arguments.
- Coverage: new/changed functions have corresponding `pytest`/`unittest` tests; run `pytest --cov` if feasible and check the diff-relevant files specifically.
- Logic: check generator/iterator exhaustion, off-by-one in slicing, None-handling on optional fields, decorator ordering.

## Java / Kotlin

- Standards: matches existing package/module conventions; checked exceptions handled or declared consistently with surrounding code; no raw types.
- Coverage: new/changed public methods have JUnit tests; check `build.gradle`/`pom.xml` for a coverage plugin (JaCoCo) and run it if feasible.
- Logic: null-safety (especially Java `Optional` usage or Kotlin nullable types), equals/hashCode consistency if a data class changed, thread-safety of any shared/static state touched.

## Go

- Standards: errors returned and checked (not discarded with `_`); consistent naming (exported vs unexported); `gofmt`/`golangci-lint` clean.
- Coverage: `go test ./... -cover` for touched packages; table-driven tests preferred if that's the repo's existing pattern.
- Logic: goroutine/channel leaks or deadlocks in changed concurrency code; nil pointer checks on changed struct fields.

## .NET / C#

- Standards: nullable reference type annotations consistent with project settings; async methods suffixed `Async` and awaited properly; consistent use of dependency injection vs `new`.
- Coverage: xUnit/NUnit tests for changed public members; check for a coverage tool in the CI config (`coverlet`, etc.).
- Logic: `IDisposable`/`using` correctness on changed resources; LINQ deferred-execution pitfalls (multiple enumeration, closures over loop variables).

## Multi-stack / monorepo

Review each touched stack independently using its section above, then add one cross-cutting check: if a shared contract changed (API schema, shared types package, proto/graphql schema), confirm every consumer of that contract in the diff was updated consistently — this is the most common gap in monorepo PRs.
