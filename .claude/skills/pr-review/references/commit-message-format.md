# Commit message format

## Default: Conventional Commits

```
<type>(<scope>): <summary>

<body>

<footer>
```

**Type** — pick the one that matches the dominant change in the diff (if mixed, pick the type of the change that would break something if reverted, and mention the rest in the body):

| type | when |
|---|---|
| `feat` | new user-facing capability |
| `fix` | bug fix |
| `refactor` | code restructuring, no behavior change |
| `test` | test-only changes |
| `docs` | documentation only |
| `style` | formatting/whitespace, no logic change |
| `chore` | tooling, deps, config, build scripts |
| `perf` | performance improvement |
| `build` | build system / packaging |
| `ci` | CI pipeline changes |

**Scope** — infer from the changed paths, don't leave it blank or generic:
- Single package/module touched → use its directory/package name (`customer-search-app`, `auth-service`)
- Single Angular feature module → its module name (`customer-search`, `results-table`)
- Cuts across the whole app → omit scope rather than guessing
- Monorepo with multiple packages touched → use the most-changed package, or list up to two: `(search, api)`

**Summary** — imperative mood ("add", not "added"/"adds"), ≤72 chars, describes what changed in the code, not the ticket. "fix null pointer on empty search results" beats "fix bug".

**Body** — only include if the summary doesn't fully explain the *why*. State the reason for the change and any non-obvious tradeoff. Skip for small self-evident changes.

**Footer** — `BREAKING CHANGE: ...` if a public API/contract changed in an incompatible way; `Fixes #123` / `Refs #123` if the user mentions a ticket/issue number.

## Matching an existing convention instead

Before defaulting to Conventional Commits, check `git log --oneline -15`. If the repo clearly uses something else consistently (e.g. `[JIRA-123] message`, or plain imperative sentences with no type prefix), match that instead — consistency with the existing history matters more than the "correct" format.

## Examples

Angular component + spec change, bug fix:
```
fix(customer-search): guard against empty results array in filter pipe

Filtering with an empty dataset threw before the results table
rendered its empty state. Added a length check before the pipe
runs the comparison.
```

New Node endpoint + tests, no existing ticket reference:
```
feat(auth-api): add password reset request endpoint

Validates email format and rate-limits requests per IP before
issuing a reset token. Includes handler and integration tests.
```

Multi-file dependency bump, no logic change:
```
chore(deps): bump @angular/platform-browser to 21.2.17
```

Refactor with no behavior change, small enough to skip a body:
```
refactor(results-table): extract sort comparator into shared util
```
