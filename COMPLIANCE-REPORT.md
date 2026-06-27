# Security & Dependency Compliance Report

Generated: 2026-06-25
Project: customer-search-app
Environment: Node v24.18.0 · npm v11.16.0

## Executive Summary

The project was found running Angular 17 (EOL since May 2025) on Node 24 — a combination Angular never certified, carrying 70 known vulnerabilities (29 high, 37 moderate, 4 low) almost entirely rooted in an unpatchable, EOL build toolchain. It has been migrated to Angular 21 (current LTS), PrimeNG 21, Vitest 4 (replacing deprecated Jest), and zoneless change detection, bringing the vulnerability count down to 6 (0 high/critical, 3 moderate, 3 low) — all residual findings are dev-only tooling blocked by major-version jumps explicitly out of scope for this migration. All 43 unit tests pass with coverage above target (100% statements/functions/lines, 98.4% branches), `tsc`/`eslint`/production build are all clean, and `CLAUDE.md` has been updated to reflect what was actually verified against the real installed packages rather than the originally assumed target versions. Current risk level: **low** — zero high/critical CVEs in any dependency, zero failing tests, zero type or lint errors.

## Framework Compliance

| Item | Before | After | Status |
|------|--------|-------|--------|
| Angular version | 17 (EOL) | 21 (LTS) | ✅ |
| Node compatibility | ❌ unsupported (17 doesn't list Node 24) | ✅ Node 24 supported | ✅ |
| PrimeNG version | 17 | 21 (with `@primeng/themes` programmatic theming) | ✅ |
| zone.js | present | removed | ✅ |
| Test runner | Jest (deprecated, run via raw CLI) | Vitest 4 (official, run via `ng test`/`@angular/build:unit-test`) | ✅ |
| @angular/animations | present | removed | ✅ |
| Build tooling | `@angular-devkit/build-angular` | `@angular/build` | ✅ |
| ESLint | 8 (EOL, eslintrc) | 9 (flat config) | ✅ |
| Lockfile version | 2 | 3 | ✅ |

## Vulnerability Summary

| Severity | Before | After | Delta |
|----------|--------|-------|-------|
| Critical | 0 | 0 | 0 |
| High | 29 | 0 | -29 |
| Moderate | 37 | 3 | -34 |
| Low | 4 | 3 | -1 |
| **Total** | **70** | **6** | **-64** |

The 6 residual findings are dev-only build/test tooling (Cypress's internal HTTP client chain, and a `@babel/core` low-severity issue via `@angular/compiler-cli`), both blocked by major-version jumps (Cypress 15, Angular 22) explicitly out of scope for an Angular-21-targeted migration. See `INSTALL-LOG.md` for full rationale. Three transitive dependencies (`undici`, `qs`, `esbuild`) were pinned to vulnerable exact/narrow versions by their direct parents (`@angular/build`, `@cypress/request`, `vite` respectively) and were fixed via `package.json` `overrides` — a same-major patch bump in each case, not a forced breaking change.

## Test Suite Health

| Metric | Value | Threshold | Status |
|--------|-------|-----------|--------|
| Tests passing | 43/43 | 100% | ✅ |
| Statement coverage | 100% | 90% | ✅ |
| Branch coverage | 98.41% | 90% | ✅ |
| Function coverage | 100% | 90% | ✅ |
| Line coverage | 100% | 90% | ✅ |
| Services coverage | 100% (all 4 metrics) | 100% | ✅ |
| axe violations (critical/serious) | 0 across all 6 states | 0 | ✅ |
| TypeScript errors | 0 | 0 | ✅ |
| ESLint errors | 0 | 0 | ✅ |
| E2E scenarios (Cypress) | 9/9 passing | 100% | ✅ |
| Production build | succeeds (with a non-blocking 301KB bundle-budget warning) | succeeds | ✅ |

One e2e test ("finds a customer by email") initially failed against the migrated app — root-caused to a **pre-existing bug in the test file itself** (never touched during this migration): it intercepted `%40`-encoded `@`, but Angular's `HttpUrlEncodingCodec` deliberately decodes `%40` back to a literal `@` after `encodeURIComponent()` — behavior unchanged since early Angular versions, confirmed by reading the actual codec source in `node_modules/@angular/common`. Fixed the intercept pattern in `cypress/e2e/customer-search.cy.ts`; all 9 e2e tests now pass.

## Supply Chain

| Check | Result |
|-------|--------|
| lockfileVersion | 3 |
| Direct dependencies | 34 |
| Total packages (incl. transitive) | 873 |
| Suspicious package names | none |
| SBOM generated | ✅ `sbom.json` (CycloneDX 1.5, 706 components) |
| Sept 2025 npm supply-chain incident (chalk/debug) | not affected — installed versions don't match the compromised releases |
| March 2026 axios compromise | not applicable — axios is not a dependency |

## Remaining Risks & Accepted Risk Register

| Risk | Severity | Why accepted |
|---|---|---|
| `@angular/build`, `@angular/compiler-cli`, `@babel/core` — sourceMappingURL arbitrary file read | low ×3 | Fix requires Angular 22, a full major version beyond this migration's Angular-21-LTS target. Low severity, dev-tooling only, no known exploit path in this project's build process. |
| `cypress`, `@cypress/request`, `uuid` — DoS/buffer-bounds issues in Cypress's internal HTTP client | moderate ×3 | Fix requires Cypress 15.x, out of scope for this migration. Forcing `uuid` past its pinned `^8.3.2` range independently risks breaking Cypress's internals (newer `uuid` majors are ESM-first and have broken CJS consumers before) — judged a worse outcome than carrying the residual risk. Dev/e2e-only, no production exposure. |
| `@angular/platform-browser-dynamic` deprecated upstream | informational | Angular 21 recommends `@angular/platform-browser` instead, but `src/main.ts` and the Vitest test environment still use the dynamic variant. Revisit on the next Angular major rather than mid-migration scope creep. |
| Bundle size exceeds the 500KB warning budget (801KB actual) | low | Non-blocking warning, not an error. Likely attributable to PrimeNG 21's new theme system bundling more CSS than the old static theme import. Worth profiling in a follow-up, not blocking for this compliance pass. |

## Next Review Date

Recommended: **2026-09-23** (90 days from this report).

## Audit Trail

**Created:**
`SECURITY-AUDIT.md`, `UPGRADE-PLAN.md`, `INSTALL-LOG.md`, `TEST-RESULTS.md`, `COMPLIANCE-REPORT.md`, `audit-report-baseline.json`, `outdated-report.json`, `audit-report-post-upgrade.json`, `sbom.json`, `vitest.config.ts`, `eslint.config.js`

**Modified:**
`package.json`, `package-lock.json` (regenerated, now lockfileVersion 3), `angular.json`, `tsconfig.spec.json`, `CLAUDE.md`, `src/app/app.config.ts`, `src/styles.scss`, `src/app/features/customer-search/components/customer-search.component.ts`, `src/app/features/customer-search/components/customer-card.component.ts`, `src/app/features/customer-search/__tests__/customer-search.component.spec.ts`, `src/app/features/customer-search/__tests__/accessibility.spec.ts`, `src/app/features/customer-search/__tests__/customer-search.service.spec.ts`, `cypress/e2e/customer-search.cy.ts` (fixed a pre-existing `%40`-vs-literal-`@` intercept bug, unrelated to the migration — see Test Suite Health)

**Deleted:**
`jest.config.ts`, `setup-jest.ts`, `.eslintrc.json`, `src/setup-vitest.ts` (created during migration, then removed once confirmed redundant with the Angular builder's own TestBed initialization), old `node_modules`/`package-lock.json` (replaced by a clean install)

**Untouched (no changes needed — verified, not assumed):**
`src/app/features/customer-search/components/customer-card.component.html`, `customer-search.component.html` (PrimeNG element/attribute selectors unchanged across the migration), `src/app/features/customer-search/__tests__/customer-card.component.spec.ts` (no Jest-specific APIs to migrate), `src/app/features/customer-search/services/customer-search.service.ts`, all model files (no legacy `@Input`/`@Output`, no `fakeAsync`/`tick`, no hardcoded colors existed prior to this migration)
