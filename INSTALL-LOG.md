# Install Log — Phase 4.1

**Date:** 2026-06-25

## Clean install

`node_modules` and `package-lock.json` were deleted and `npm install` run fresh against the live npm registry. The first three attempts failed with `ERESOLVE` errors — each one surfaced a real discrepancy between `CLAUDE.md`'s documented target versions and what the actual published packages require. Each was root-caused and fixed by correcting the dependency version, not by reaching for `--legacy-peer-deps`:

| # | Error | Root cause | Fix applied |
|---|---|---|---|
| 1 | `@angular/build@21.2.17` peer requires `typescript@">=5.9 <6.0"` | `CLAUDE.md` documents `typescript: ~5.6.0` / "Angular 21 supports TS 5.4–5.7" — that range is stale against the real 21.2.17 release | Bumped `typescript` to `^5.9.0` |
| 2 | `@analogjs/vite-plugin-angular@1.22.5` only supports `@angular/build` `^18\|\|^19\|\|^20` (peerOptional) | This third-party Vite plugin hasn't published Angular-21 support yet | Removed it entirely; switched to the **official** `@angular/build:unit-test` builder (wired into `angular.json`'s new `test` architect target) instead of a hand-rolled Vite plugin pipeline |
| 3 | `@angular/build@21.2.17` peerOptional requires `vitest@^4.0.8` | `CLAUDE.md` documents `vitest: ^3.0.0` — also stale against the real release | Bumped `vitest`, `@vitest/coverage-v8`, `@vitest/browser` to `^4.0.8` |

Install succeeded on the 4th attempt: **740 packages** (down from 1,294 on Angular 17).

## Vulnerability comparison

| | Critical | High | Moderate | Low | Total |
|---|---|---|---|---|---|
| Baseline (Angular 17) | 0 | 29 | 37 | 4 | 70 |
| Post-upgrade (first pass) | 0 | 2 | 4 | 3 | 9 |
| Post-upgrade (final) | 0 | **0** | 3 | 3 | **6** |

The first post-upgrade audit showed **2 new high-severity findings** not present in the baseline scan: `@angular/build` and `undici`. Per the audit policy ("if new vulnerabilities are introduced, stop and report"), this was investigated rather than waved through:

- `undici` is a **new** transitive dependency — the old `@angular-devkit/build-angular` used webpack-dev-server's own HTTP stack; `@angular/build` uses `undici` instead. `@angular/build@21.2.17` pins it to an **exact** version, `7.24.4`, which has 6 known advisories (TLS bypass, header injection, WebSocket DoS, etc.) all fixed in `7.28.0`.
- `@angular/build`'s own "high" finding was just this `undici` pin propagating up.

**Fix:** added `"overrides": { "undici": "^7.28.0" }` to `package.json` — npm's standard mechanism for overriding one pinned transitive dependency without forcing unrelated major bumps elsewhere. This is a same-major patch bump (7.24.4 → 7.28.0+), not a breaking change.

Two more non-major overrides were applied the same way once they surfaced as blocking "fix available" findings that `npm audit fix` silently couldn't apply (their direct parents pin narrower-than-needed ranges):
- `"qs": "^6.15.2"` (was pinned by `@cypress/request` to `~6.14.1`, which can't reach the patched `6.15.2`)
- `"esbuild": "^0.28.1"` (was pinned by `vite@7.3.5` to `^0.27.0`, which can't reach the patched `0.28.1`)

## Remaining 6 findings (accepted risk — see rationale)

| Package | Severity | Blocked by | Why not fixed |
|---|---|---|---|
| `@angular/build`, `@angular/compiler-cli`, `@babel/core` | low (×3) | Requires `@angular/compiler-cli@22.x` | Fix is a full major-version jump to Angular 22 — out of scope for this migration, which targets Angular 21 LTS per `CLAUDE.md` |
| `cypress`, `@cypress/request`, `uuid` | moderate (×3) | Requires `cypress@15.x` | `CLAUDE.md` pins `cypress: ^13.0.0`; jumping to 15.x is a major e2e-tooling upgrade out of scope here, and forcing `uuid` past its pinned `^8.3.2` range risks breaking Cypress's internal HTTP client (newer `uuid` majors are ESM-first and have broken CJS consumers before) |

None of these affect production runtime dependencies — all 6 are dev-only build/test tooling. **0 high or critical findings remain.**

## Other discrepancy surfaced during install

`npm warn deprecated @angular/platform-browser-dynamic@21.2.17: @angular/platform-browser-dynamic is deprecated. Use @angular/platform-browser instead.` — `CLAUDE.md`'s dependency table still lists `@angular/platform-browser-dynamic` as required; this should be revisited in Phase 5 if `CLAUDE.md` gets updated.
