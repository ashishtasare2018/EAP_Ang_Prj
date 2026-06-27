# Security & Dependency Audit — Baseline

**Date:** 2026-06-25
**Project:** customer-search-app
**Environment:** Node v24.18.0 · npm v11.16.0 · Windows (PowerShell)
**Scope:** Read-only audit. No files were modified except this report and the two raw scan outputs (`audit-report-baseline.json`, `outdated-report.json`).

`npm audit` totals: **0 critical · 29 high · 37 moderate · 4 low** (70 vulnerabilities) across 1,294 packages (15 prod, 1,280 dev, 93 optional).

---

## 1. Critical Findings (severity = high, since 0 critical were reported)

| Package | CVE / Advisory | Severity | Vulnerable Range | Fixed In | Safe Auto-Fix? |
|---|---|---|---|---|---|
| `@angular/core` | [GHSA-prjf-86w9-mfqv](https://github.com/advisories/GHSA-prjf-86w9-mfqv) i18n XSS | high (CVSS 6.1) | ≤18.2.14 | 22.0.2 | No — major bump |
| `@angular/core`, `@angular/compiler` | [GHSA-g93w-mfhg-p222](https://github.com/advisories/GHSA-g93w-mfhg-p222) XSS in i18n attribute bindings | high (CVSS 9.0) | 17.0.0–18.2.14 | 22.0.2 | No — major bump |
| `@angular/core`, `@angular/compiler` | [GHSA-jrmj-c5cx-3cw6](https://github.com/advisories/GHSA-jrmj-c5cx-3cw6) Unsanitized SVG script attrs (XSS) | high | ≤18.2.14 | 22.0.2 | No — major bump |
| `@angular/core` | [GHSA-rgjc-h3x7-9mwg](https://github.com/advisories/GHSA-rgjc-h3x7-9mwg) Hydration DOM clobbering / cache poisoning | high | ≤19.2.25 | 22.0.2 | No — major bump |
| `@angular/common` | [GHSA-58c5-g7wp-6w37](https://github.com/advisories/GHSA-58c5-g7wp-6w37) XSRF token leak via protocol-relative URLs | high | <19.2.16 | 22.0.2 | No — major bump |
| `@angular/common` | [GHSA-p3vc-36g9-x9gr](https://github.com/advisories/GHSA-p3vc-36g9-x9gr) DoS via OOM in number formatting | high | ≤18.2.14 | 22.0.2 | No — major bump |
| `@angular/common` | [GHSA-q6f4-qqrg-jv6x](https://github.com/advisories/GHSA-q6f4-qqrg-jv6x) Credentialed-request cache leak (HttpTransferCache) | high | ≤18.2.14 | 22.0.2 | No — major bump |
| `@angular/common` | [GHSA-48r7-hpm6-gfxm](https://github.com/advisories/GHSA-48r7-hpm6-gfxm) DoS via OOM in date formatting | high | ≤19.2.25 | 22.0.2 | No — major bump |
| `@angular/common` | [GHSA-39pv-4j6c-2g6v](https://github.com/advisories/GHSA-39pv-4j6c-2g6v) Weak 32-bit cache key hash → cross-request data leak | high | ≤19.2.25 | 22.0.2 | No — major bump |
| `primeng` | (transitive via Angular core/common/forms) | high | 9.0.0-rc.1–18.0.7-lts | 21.1.9 | No — major bump |
| `@angular-devkit/build-angular` (dev) | pulls vulnerable webpack/vite/esbuild/inquirer/pacote chain | high | ≤22.0.4 | 21.2.17 | No — major bump |
| `tar` (transitive, dev) | [GHSA-34x7-hfp2-rc4v](https://github.com/advisories/GHSA-34x7-hfp2-rc4v) and 5 related hardlink/symlink path-traversal CVEs | high (CVSS up to 8.8) | ≤7.5.15 | via `@angular/cli` 22.0.4 | No — major bump |
| `piscina` (transitive, dev) | [GHSA-x9g3-xrwr-cwfg](https://github.com/advisories/GHSA-x9g3-xrwr-cwfg) Prototype pollution → RCE | high (CVSS 8.1) | ≤4.9.2 | via build-angular 21.2.17 | No — major bump |
| `tmp` (transitive, dev) | [GHSA-ph9p-34f9-6g65](https://github.com/advisories/GHSA-ph9p-34f9-6g65) Path traversal | high | <0.2.6 | via `@angular/cli` 22.0.4 | No — major bump |
| `vite` (transitive, dev) | [GHSA-fx2h-pf6j-xcff](https://github.com/advisories/GHSA-fx2h-pf6j-xcff) `server.fs.deny` bypass on Windows | high | ≤6.4.2 | via build-angular 21.2.17 | No — major bump |
| `@npmcli/run-script`, `make-fetch-happen`, `node-gyp`, `npm-registry-fetch`, `pacote`, `sigstore`, `@sigstore/sign`, `@sigstore/tuf`, `tuf-js`, `@ngtools/webpack` (transitive, dev) | various high-severity advisories in the CLI's install/build toolchain | high | varies | via `@angular/cli` 22.0.4 / build-angular 21.2.17 | No — major bump |

**Every high-severity finding traces back to one root cause: the entire Angular 17 toolchain (core packages + CLI + build-angular + their transitive webpack/vite/pacote chain) is too old to receive patches.** There is no minor/patch-level fix — every `fixAvailable` in the raw report is `isSemVerMajor: true`, pointing at Angular 21–22 or `primeng@21.1.9`. 37 moderate and 4 low findings (ajv, postcss, qs, uuid, sockjs, webpack, js-yaml, etc.) follow the same pattern via Jest/Cypress/build-angular's dependency tree — see `audit-report-baseline.json` for the full list.

---

## 2. EOL Framework Alert

**Angular 17 reached End-of-Life in May 2025.** No further security patches will be issued for it upstream — every CVE above will remain unfixed on this major version indefinitely.

**Node v24.18.0 is not in Angular 17's supported engines range** (`^18.19.1 || ^20.11.1 || ^22.0.0`). This project is currently running an **unsupported and unaudited configuration**: Angular's CI matrix never tested 17.x against Node 24, so behavior (build, SSR, CLI internals) is unverified upstream.

**Business risk:** Production traffic is served by a framework version with 29 open high-severity CVEs (XSS, XSRF token leakage, DoS, cache poisoning) that will never be patched, running on a Node version Angular never certified it against. This is both a security liability (exploitable, disclosed vulnerabilities with public advisories) and a compliance liability (fails any audit requiring "no known unpatched high/critical CVEs in production dependencies," which is also this project's own `CLAUDE.md` policy).

## 3. Deprecated Tooling Alert

Jest support is deprecated as of Angular 21 and will be **removed in Angular 22**. This project's `jest-preset-angular@14.6.2` already has peer-dependency conflicts with Angular 21+, and `jest@29.7.0` itself carries 1 moderate CVE chain (`@jest/core`, `jest-snapshot`, etc.). Angular's official test runner going forward is **Vitest**, stable as of Angular 21.

**Migration requirement:** `jest`, `jest-preset-angular`, `jest-environment-jsdom`, `jest-axe`, `@types/jest`, `@types/jest-axe` must all be removed and replaced with `vitest`, `@vitest/coverage-v8`, `@vitest/browser`. All 4 spec files in `src/app/features/customer-search/__tests__/` (`customer-search.service.spec.ts`, `customer-search.component.spec.ts`, `customer-card.component.spec.ts`, `accessibility.spec.ts`) and `jest.config.ts` / `setup-jest.ts` will need to migrate to Vitest APIs. This is covered by Phase 2/3 of the broader migration plan — no files were touched in this audit.

## 4. Dependency Health Table

Status legend: ✅ OK · ⚠️ Outdated (no CVE) · 🔴 EOL (must be removed/replaced per project policy) · 🚨 CVE (active vulnerability)

| Package | Current | Latest Safe | Status | Action Required |
|---|---|---|---|---|
| `@angular/animations` | 17.3.12 | 20.1.8 (patched) / target: remove | 🚨🔴 | Has high-sev CVE *and* is slated for removal — PrimeNG 21 uses native CSS animations |
| `@angular/common` | 17.3.12 | 22.0.2 | 🚨 | Upgrade to `^21.0.0` |
| `@angular/compiler` | 17.3.12 | 22.0.2 | 🚨 | Upgrade to `^21.0.0` |
| `@angular/compiler-cli` | 17.3.12 | 22.0.2 | 🚨 | Upgrade to `^21.0.0` |
| `@angular/core` | 17.3.12 | 22.0.2 | 🚨 | Upgrade to `^21.0.0` |
| `@angular/forms` | 17.3.12 | 22.0.2 | 🚨 | Upgrade to `^21.0.0` |
| `@angular/platform-browser` | 17.3.12 | 22.0.2 | 🚨 | Upgrade to `^21.0.0` |
| `@angular/platform-browser-dynamic` | 17.3.12 | 20.0.7 (patched) | 🚨 | Upgrade to `^21.0.0` |
| `@angular/router` | 17.3.12 | 22.0.2 | 🚨 | Upgrade to `^21.0.0` |
| `primeng` | 17.18.15 | 21.1.9 | 🚨 | Upgrade to `^21.0.0`; migrate `*Module` imports to direct component imports |
| `primeicons` | 6.0.1 | 7.0.0 | ⚠️ | Bump to `^7.0.0` |
| `primeflex` | 3.3.1 | 4.0.0 | ⚠️ | CLAUDE.md target keeps `^3.3.1` — no action required unless re-evaluated |
| `rxjs` | 7.8.x | 7.8.1 | ✅ | None |
| `tslib` | 2.6.x | 2.8.x | ⚠️ | Minor bump to `^2.8.0` |
| `zone.js` | 0.14.10 | 0.16.2 | 🔴 | **REMOVE** — Angular 21 is zoneless by default per project policy |
| `@angular/cli` (dev) | 17.3.17 | 22.0.4 (patched) | 🚨 | Upgrade to `^21.0.0` |
| `@angular-devkit/build-angular` (dev) | 17.3.17 | 21.2.17 (patched) | 🚨🔴 | Has high-sev CVE chain *and* is replaced by `@angular/build` in Angular 21 |
| `@angular-eslint/eslint-plugin` (dev) | 17.5.3 | 22.0.0 | ⚠️ | Bump to `^21.0.0` |
| `@angular-eslint/eslint-plugin-template` (dev) | 17.5.3 | 22.0.0 | ⚠️ | Bump to `^21.0.0` |
| `@angular-eslint/template-parser` (dev) | 17.5.3 | 22.0.0 | ⚠️ | Bump to `^21.0.0` |
| `@typescript-eslint/eslint-plugin` (dev) | 7.18.0 | 8.62.0 | ⚠️ | Bump to `^8.0.0` |
| `@typescript-eslint/parser` (dev) | 7.18.0 | 8.62.0 | ⚠️ | Bump to `^8.0.0` |
| `@types/jest` (dev) | 29.5.14 | 30.0.0 | 🔴 | **REMOVE** — Jest deprecated/removed per project policy |
| `@types/jest-axe` (dev) | 3.5.x | — | 🔴 | **REMOVE** along with `jest-axe` |
| `@types/node` (dev) | 20.19.43 | 26.0.1 | ⚠️ | Bump to `^22.0.0` per project target (matches Node 24 LTS types) |
| `axe-core` (dev) | 4.9.x | 4.10.x | ⚠️ | Bump to `^4.10.0` |
| `cypress` (dev) | 13.17.0 | 15.18.0 | 🚨 | Moderate CVE via transitive `@cypress/request`→`qs`/`uuid`; `npm audit fix` may resolve without a major bump — verify in Phase 4 |
| `cypress-real-events` (dev) | 1.13.x | — | ✅ | None |
| `eslint` (dev) | 8.57.1 | 10.5.0 | 🔴 | ESLint 8 is EOL — bump to `^9.0.0` minimum per project policy |
| `jest` (dev) | 29.7.0 | 30.4.2 | 🚨🔴 | Moderate CVE chain *and* deprecated — **REMOVE**, replace with Vitest |
| `jest-axe` (dev) | 10.0.0 | — | 🔴 | **REMOVE** |
| `jest-environment-jsdom` (dev) | 29.7.0 | 30.4.1 | 🔴 | **REMOVE** |
| `jest-preset-angular` (dev) | 14.6.2 | 17.0.0 | 🚨🔴 | Moderate CVE *and* peer-dep conflict with Angular 21+ — **REMOVE** |
| `ts-node` (dev) | 10.9.x | — | ✅ | Not part of target stack; confirm still needed once Jest config is removed |
| `typescript` (dev) | 5.2.2 | 6.0.3 | ⚠️ | Bump to `~5.6.0` — **do not** jump to 6.0, Angular 21 supports TS 5.4–5.7 only |

---

## 5. Supply Chain Risk Note

- **September 2025 npm supply-chain attack** (chalk/debug and ~16 other packages briefly compromised via a maintainer phishing attack): I checked this project's actual lockfile — it resolves `chalk@4.1.2` and `debug@4.4.3`. The compromised publishes were `chalk@5.6.1` and `debug@4.4.2` (briefly live before being pulled from the registry). **This project's lockfile is not pinned to either compromised version**, so it was not directly exposed — but this should be re-verified after any `npm install` that could shift transitive resolutions.
- **March 2026 axios maintainer account compromise:** `axios` does **not** appear anywhere in this project's dependency tree (confirmed against `package-lock.json`) — not applicable here.
- **Recommendation:** keep `npm ci` (not `npm install`) in CI so installs are always driven by the committed lockfile, and run `npm audit` on every PR. Consider adding lockfile integrity verification (see §6 below) to a pre-merge check.

## 6. Lock File Integrity

- **Integrity hashes:** 1,295 total entries in `package-lock.json`; only 1 is missing an `integrity` field — and that single entry is the **root project package itself** (`""` key, i.e. `customer-search-app@0.1.0`), which never carries a resolved/integrity hash by design. **0 real packages are missing an integrity hash.** No high-risk findings here.
- **Known-compromised package versions check:** `chalk@4.1.2` and `debug@4.4.3` are present — neither matches the compromised versions from the September 2025 incident (see §5). `axios` is not present at all.
- **Lockfile version:** `lockfileVersion: 2`. This is npm-7-compatible but **does not match the `lockfileVersion: 3` baseline documented in `CLAUDE.md`**. This isn't a CVE risk, but it's a compliance gap worth closing — a fresh `npm install` under npm 11 (already in use) will naturally upgrade it to v3 on the next lockfile regeneration (planned for Phase 4 of the migration, not done in this audit).

---

## 7. Recommended Upgrade Path

Angular 17 → Angular 21 cannot be done with a single `ng update` jump — Angular's update tooling only supports moving one major version at a time. Two viable paths:

**Option A — Sequential `ng update` (lower risk, preserves git history/incremental diffs):**
```
ng update @angular/core@18 @angular/cli@18
ng update @angular/core@19 @angular/cli@19
ng update @angular/core@20 @angular/cli@20
ng update @angular/core@21 @angular/cli@21
```
Run the test suite and fix breakages after each step. PrimeNG, ESLint, and the Jest→Vitest migration are handled separately from `ng update` and would still need manual work at the end.

**Option B — Scaffold fresh + migrate source (higher risk, cleaner result):** Generate a new Angular 21 project with `ng new`, then port `src/app/features/customer-search/**` into it. Avoids carrying forward any stale generated config but requires manually re-verifying every build/test/lint config file.

This audit does not recommend one over the other yet — that tradeoff (and the detailed breaking-change list) belongs in Phase 2 (`UPGRADE-PLAN.md`), which has not been run.

---

## Files produced in this phase
- `audit-report-baseline.json` — raw `npm audit --json` output
- `outdated-report.json` — raw `npm outdated --json` output
- `SECURITY-AUDIT.md` — this report

No source files, `package.json`, or config files were modified in this read-only phase. The sections below were appended after Phase 3/4 (file migration + clean install + verification) actually executed — see `UPGRADE-PLAN.md`, `INSTALL-LOG.md`, and `TEST-RESULTS.md` for the full record.

---

## POST-UPGRADE SUPPLY CHAIN STATUS

| Item | Value |
|---|---|
| `lockfileVersion` | 3 (confirmed — was 2 in baseline) |
| Direct dependencies | 34 |
| Total packages in lock file (incl. transitive) | 873 |
| CVE count before upgrade | 0 critical, 29 high, 37 moderate, 4 low (70 total) |
| CVE count after upgrade | 0 critical, 0 high, 3 moderate, 3 low (6 total) |
| SBOM generated | ✅ `sbom.json` (CycloneDX 1.5, 706 components) via `npm sbom` |
| Suspicious package names (typosquat check) | none found |

The 6 residual findings are all dev-only build/test tooling, blocked by major-version jumps explicitly out of scope for this migration (Angular 22, Cypress 15) — see `INSTALL-LOG.md` for the full breakdown and rationale for accepting them rather than forcing unrelated major upgrades.
