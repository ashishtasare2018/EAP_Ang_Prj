# Test Results — Phase 4.3

**Date:** 2026-06-25
**Runner:** Vitest 4.1.9, invoked via the official `@angular/build:unit-test` builder (`ng test`)

## Summary

- **Total tests:** 43 passed, 0 failed, 0 skipped
- **Test files:** 4 passed (4)
- Zero tests rely on `fakeAsync()` or `tick()` — confirmed by grep before migration (none existed) and the suite passing without either API.

## Coverage

| Metric | Result | Threshold | Status |
|---|---|---|---|
| Statements | 100% (142/142) | 90% components / 100% services | ✅ |
| Branches | 98.41% (62/63) | 90% components / 100% services | ✅ |
| Functions | 100% (15/15) | 90% components / 100% services | ✅ |
| Lines | 100% (112/112) | 90% components / 100% services | ✅ |

The `services/` directory has no entries in the coverage table below the summary row — the v8 text reporter only lists paths with uncovered lines, so its absence means `customer-search.service.ts` is at 100% across all four metrics, meeting the service-specific bar. The only uncovered branch (1 of 63) is in a component template (`*.component.html`, line 54, 91.66% branch coverage in that file) — still well above the 90% component threshold, so not pursued further.

## Migration notes (why this required more than an API find-replace)

Per Phase 4.3 policy ("fix Jest→Vitest API issues, do not fix logic regressions, report which is which"), here's what was actually wrong and how each was classified:

| Issue | Classification | Fix |
|---|---|---|
| `ESLint`'s `no-undef` flagging `describe`/`it`/`expect`/`console`/`process` | Tooling config gap (new flat-config ESLint setup never declared `no-undef: off`, which `@typescript-eslint`'s legacy preset used to do implicitly) | Added explicit `'no-undef': 'off'` to `eslint.config.js` |
| `Cannot find dependency 'jsdom'` | Missing peer — Vitest doesn't bundle `jsdom`, it must be installed explicitly | Added `jsdom` to devDependencies |
| `Component 'CustomerSearchComponent' is not resolved: templateUrl... Did you run resolveComponentResources()?` when invoking `npx vitest run` directly | Tooling/architecture gap — no Angular-aware Vite transform was wired in (the third-party plugin that would have done this doesn't support Angular 21 yet) | Switched to running tests through the official `@angular/build:unit-test` builder (`ng test`), which performs this transform internally |
| `done()` callback / `fail()` global in 3 tests in `customer-search.service.spec.ts` | Jest/Jasmine API removed in Vitest — `done` callback support and the `fail()` global don't exist | Rewrote as plain synchronous assertions (the underlying `HttpTestingController` flow was already synchronous; `done` was vestigial Jest boilerplate, not a real async gap) — **test logic and assertions unchanged**, only the API surface |
| `Button is not used within the template` (compiler warning) → real failure once through the official builder | **Not a Jest/Vitest issue at all** — a genuine PrimeNG 17→21 API change: `Button`'s selector is the element `p-button`, but this project's template uses the attribute form `<button pButton>`, which requires the separate `ButtonDirective` export | Verified against the actual installed `primeng@21.1.9` type declarations (not guessed) and imported `ButtonDirective` instead of `Button` |
| `<ng-template pTemplate="title">` in `customer-card.component.html` had no matching directive in the standalone component's `imports` | PrimeNG migration gap — `pTemplate` (`PrimeTemplate`, from `primeng/api`) used to ride along implicitly via `CardModule`'s NgModule exports; standalone `Card` doesn't carry it | Verified against installed types, added explicit `PrimeTemplate` import |
| `primeng/resources/themes/...` / `primeng/resources/primeng.css` imports in `styles.scss` failed to resolve | Real PrimeNG 21 breaking change — static theme CSS files were removed in favor of a programmatic theming API (`@primeng/themes` + `providePrimeNG()`) | Removed the dead imports, added `@primeng/themes`, wired `providePrimeNG({ theme: { preset: Aura } })` into `app.config.ts` |

No genuine test-logic regressions were found — every failure traced to a migration/tooling gap, not a behavior change in the application code.

## `ng test` vs raw `vitest run`, and why coverage thresholds needed `runnerConfig`

Confirmed empirically (not assumed): the `@angular/build:unit-test` builder does **not** read `vitest.config.ts` unless `angular.json`'s `test` architect target explicitly sets a `"runnerConfig"` option pointing at it — verified by temporarily removing the file and observing identical output. The builder also auto-initializes `TestBed`/the test platform internally; once `runnerConfig` was wired in, the project's original `src/setup-vitest.ts` (which called `getTestBed().initTestEnvironment()` a second time) collided with it and failed with `NG0400: A platform with a different configuration has been created`. Fixed by deleting `src/setup-vitest.ts` and trimming `vitest.config.ts` down to only the `coverage` block (the one thing the builder doesn't expose its own flag for) — `test.include`/`exclude`/`setupFiles` are either unsupported or actively conflicting with the builder's own file discovery and environment setup, per its own logged warnings.

Per-directory threshold enforcement was verified live: temporarily setting the components threshold to an unreachable 99.9% produced `ERROR: Coverage for branches (97.91%) does not meet ... threshold (99.9%)`, then reverting to 90% passed again — confirming thresholds are real, not silently ignored.

`package.json`'s `test`/`test:watch`/`test:coverage`/`test:ui` scripts were updated to call `ng test` (with the appropriate flags) instead of the `vitest` CLI directly, since direct `vitest run` cannot resolve Angular `templateUrl`/`styleUrl` without the builder's transform.

## Known harmless console noise

Every `axe-core` accessibility test run prints `Error: Not implemented: HTMLCanvasElement.prototype.getContext` to the console. This is `axe-core`'s internal color-contrast check attempting to use the Canvas API for precise text-rendering measurement, which `jsdom` doesn't implement without the optional `canvas` native package. `axe-core` catches this internally and falls back to a less precise check — it does not fail any test or affect results. This is pre-existing behavior, not introduced by this migration.
