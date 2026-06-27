# Claude CLI Prompt: Security & Dependency Compliance Audit

## Context

**Environment:** Node v24.18.0 · npm v11.16.0 · Windows (PowerShell)
**Current package.json:** Angular 17 (EOL May 2025), Jest, zone.js
**Target state:** Angular 21 · PrimeNG 21 · Vitest (Angular-official default) · Zoneless

Run each numbered prompt block below in order inside Claude CLI.
Each block is a self-contained task with a clear deliverable.

---

## PHASE 1 — Security Audit (Read-Only, No Changes Yet)

### Prompt 1.1 — Baseline CVE Scan

```
You are a security compliance engineer auditing a Node 24 / Angular 17 project.

Read the file package.json in the current directory.

Run the following commands exactly and capture full output to a file called
audit-report-baseline.json:

  npm audit --json > audit-report-baseline.json 2>&1

Then run:

  npm outdated --json > outdated-report.json 2>&1

Then produce a human-readable summary file called SECURITY-AUDIT.md containing:

1. CRITICAL FINDINGS
   - List every vulnerability with severity = critical or high
   - For each: package name, CVE id (if present), severity, vulnerable version range,
     fixed version, and whether a safe auto-fix exists

2. EOL FRAMEWORK ALERT
   - Angular 17 reached End of Life in May 2025.
     Node 24 is NOT in Angular 17's supported range (^18.19.1 || ^20.11.1 || ^22.0.0).
     Running Angular 17 on Node 24 is an unsupported and unaudited configuration.
     State the business risk explicitly.

3. DEPRECATED TOOLING ALERT
   - Jest support is deprecated as of Angular 21 and will be REMOVED in Angular 22.
     jest-preset-angular has peer dependency conflicts with Angular 21+.
     Angular's official test runner is now Vitest (stable in Angular 21).
     State the migration requirement.

4. DEPENDENCY HEALTH TABLE
   - For every dependency and devDependency in package.json, produce a table:
     | Package | Current | Latest Safe | Status | Action Required |
   - Status values: ✅ OK | ⚠️ Outdated | 🔴 EOL | 🚨 CVE

5. SUPPLY CHAIN RISK NOTE
   - Note that the npm registry suffered a supply chain attack in September 2025
     affecting chalk, debug, and 16 other packages.
   - Note the axios maintainer account compromise in March 2026.
   - Recommend lock-file integrity checks.

6. RECOMMENDED UPGRADE PATH
   Angular 17 → Angular 21 (skip 18/19/20 via ng update is NOT supported —
   must update sequentially: 17→18→19→20→21 using ng update @angular/core @angular/cli
   at each step, OR scaffold a new Angular 21 project and migrate source files).

Do not make any file changes except writing SECURITY-AUDIT.md and the two JSON reports.
```

---

### Prompt 1.2 — Lock File Integrity Check

```
Run the following commands and append results to SECURITY-AUDIT.md under a new
section called "LOCK FILE INTEGRITY":

1. Verify the package-lock.json integrity field is present:
   node -e "
     const lock = require('./package-lock.json');
     const pkgs = Object.values(lock.packages || {});
     const missing = pkgs.filter(p => p.version && !p.integrity);
     console.log('Packages missing integrity hash:', missing.length);
     if (missing.length > 0) console.log(missing.map(p => p.resolved).slice(0, 10));
   "

2. Check for known-compromised package versions:
   node -e "
     const lock = require('./package-lock.json');
     const risky = ['chalk', 'debug', 'axios'];
     const pkgs = lock.packages || {};
     risky.forEach(name => {
       const key = 'node_modules/' + name;
       if (pkgs[key]) console.log(name, pkgs[key].version, pkgs[key].resolved);
     });
   "

3. Confirm lockfileVersion is 3 (npm 7+):
   node -e "const l = require('./package-lock.json'); console.log('lockfileVersion:', l.lockfileVersion);"

Document findings. Flag any package without an integrity hash as HIGH RISK.
```

---

## PHASE 2 — Upgrade Plan (Analysis, No Code Changes Yet)

### Prompt 2.1 — Breaking Change Impact Analysis

```
You are a senior Angular architect. Based on the package.json in this directory,
produce a file called UPGRADE-PLAN.md with the following sections:

## 1. Angular 17 → 21: Breaking Changes That Affect This Project

List ONLY the breaking changes relevant to this project's dependencies.
For each breaking change, state:
  - What breaks
  - Which file(s) in this project are affected (guess from common Angular project structure)
  - The exact code change required

Focus on:
  a) zone.js removal: Angular 21 defaults to zoneless. zone.js must be removed from
     polyfills and angular.json. provideZoneChangeDetection() must be removed from
     app.config.ts. All fakeAsync/tick usage in tests MUST be replaced.

  b) @angular/animations deprecation: PrimeNG 21 migrated to native CSS animations.
     showTransitionOptions and hideTransitionOptions on PrimeNG components are no-ops
     in PrimeNG 21 and should be removed.

  c) @angular-devkit/build-angular → @angular/build: The builder package was renamed.
     angular.json builder references must be updated.

  d) Jest → Vitest migration: Angular 21 deprecated Jest. Angular 22 will remove it.
     All spec files must be migrated from Jest APIs to Vitest APIs.
     jest.config.ts must be replaced with vitest.config.ts.
     setup-jest.ts must be replaced with setup-vitest.ts using setupZonelessTestEnv.
     jest.fn() → vi.fn(), jest.spyOn() → vi.spyOn(), jest.mock() → vi.mock().

  e) @Input()/@Output() → signal inputs/outputs: The current CLAUDE.md already requires
     input()/output() signals. Confirm any legacy decorator usage needs conversion.

  f) HttpClientTestingModule: In Angular 21+ with zoneless + Vitest, use
     provideHttpClientTesting() instead of HttpClientTestingModule.

  g) PrimeNG 17 → 21: Direct component imports replace module imports.
     Example: import { ButtonModule } from 'primeng/button' →
              import { Button } from 'primeng/button'
     Document all PrimeNG components used and their new import path.

## 2. Risk Assessment Matrix
| Change | Risk Level | Effort | Auto-migratable? |
|--------|-----------|--------|-----------------|
| zone.js removal | High | Medium | Partial (ng update) |
| Jest → Vitest | High | Medium | Yes (codemod) |
| ... | ... | ... | ... |

## 3. Recommended Upgrade Sequence
Step-by-step with exact commands. Include --force or --legacy-peer-deps notes where needed.
```

---

## PHASE 3 — Automated Upgrade Execution

### Prompt 3.1 — Update package.json to Secure Versions

```
Update the package.json file in the current directory to the following secure,
Angular 21-compatible versions. Do NOT run npm install yet — only edit the file.

Set these exact versions (use ^ prefix for all):

dependencies:
  @angular/animations: remove this package (PrimeNG 21 uses native CSS animations)
  @angular/common: ^21.0.0
  @angular/compiler: ^21.0.0
  @angular/core: ^21.0.0
  @angular/forms: ^21.0.0
  @angular/platform-browser: ^21.0.0
  @angular/platform-browser-dynamic: ^21.0.0
  @angular/router: ^21.0.0
  primeng: ^21.0.0
  primeicons: ^7.0.0
  primeflex: ^3.3.1
  rxjs: ^7.8.1
  tslib: ^2.8.0
  zone.js: REMOVE THIS PACKAGE

devDependencies:
  @angular/build: ^21.0.0
  @angular/cli: ^21.0.0
  @angular/compiler-cli: ^21.0.0
  @angular-eslint/eslint-plugin: ^21.0.0
  @angular-eslint/eslint-plugin-template: ^21.0.0
  @angular-eslint/template-parser: ^21.0.0
  @typescript-eslint/eslint-plugin: ^8.0.0
  @typescript-eslint/parser: ^8.0.0
  @types/node: ^22.0.0
  axe-core: ^4.10.0
  cypress: ^13.0.0
  cypress-real-events: ^1.13.0
  eslint: ^9.0.0
  typescript: ~5.6.0
  vitest: ^3.0.0
  @vitest/coverage-v8: ^3.0.0
  @vitest/browser: ^3.0.0
  playwright: ^1.49.0
  jest-axe: REMOVE
  @types/jest-axe: REMOVE
  jest: REMOVE
  jest-preset-angular: REMOVE
  jest-environment-jsdom: REMOVE

REMOVE these devDependencies entirely:
  jest, jest-preset-angular, jest-environment-jsdom, @types/jest-axe, jest-axe

Update scripts section:
  "test": "vitest run"
  "test:watch": "vitest"
  "test:coverage": "vitest run --coverage"
  "test:ui": "vitest --ui"

After editing package.json, show the full updated file content for review.
Do NOT run npm install yet.
```

---

### Prompt 3.2 — Replace Jest Config with Vitest Config

```
Perform the following file operations. Read CLAUDE.md for conventions before starting.

1. DELETE jest.config.ts (or jest.config.js) if it exists.

2. DELETE setup-jest.ts if it exists.

3. CREATE vitest.config.ts with this content:

import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/setup-vitest.ts'],
    include: ['src/**/*.spec.ts'],
    exclude: ['node_modules', 'dist', 'cypress'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
      },
      exclude: ['src/**/*.spec.ts', 'src/main.ts', 'src/environments/**'],
    },
  },
});

4. CREATE src/setup-vitest.ts with this content:

import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';
// NOTE: If jest-preset-angular is removed, replace with:
// import '@angular/core/testing';
// import { getTestBed } from '@angular/core/testing';
// import { BrowserDynamicTestingModule, platformBrowserDynamicTesting }
//   from '@angular/platform-browser-dynamic/testing';
// getTestBed().initTestEnvironment(
//   BrowserDynamicTestingModule,
//   platformBrowserDynamicTesting(),
//   { teardown: { destroyAfterEach: true } }
// );

5. UPDATE tsconfig.spec.json:
   - Change "types": ["jest", "node"] to "types": ["vitest/globals", "node"]
   - Ensure "esModuleInterop": true is present

After all changes, list every file created, modified, or deleted.
```

---

### Prompt 3.3 — Migrate angular.json for Angular 21

```
Update angular.json to be compatible with Angular 21 and the new build tooling.

1. Replace ALL occurrences of:
   "@angular-devkit/build-angular:application"
   with:
   "@angular/build:application"

2. Replace ALL occurrences of:
   "@angular-devkit/build-angular:browser"
   with:
   "@angular/build:browser-esbuild"

3. Replace ALL occurrences of:
   "@angular-devkit/build-angular:jest"
   with:
   "@angular/build:unit-test"

4. In the "test" architect target, update options to:
   {
     "builder": "@angular/build:unit-test",
     "options": {
       "tsConfig": "tsconfig.spec.json"
     }
   }

5. In polyfills array: REMOVE "zone.js" if present.

6. In the "projects" section, find the "polyfills" array in build options and
   remove any reference to zone.js.

Show the full diff of every change made.
```

---

### Prompt 3.4 — Migrate app.config.ts for Zoneless

```
Update src/app/app.config.ts to remove zone.js and enable zoneless change detection.

Current likely content:
  import { ApplicationConfig } from '@angular/core';
  import { provideRouter } from '@angular/router';
  import { provideHttpClient } from '@angular/common/http';
  import { provideAnimations } from '@angular/platform-browser/animations';

  export const appConfig: ApplicationConfig = {
    providers: [
      provideRouter([]),
      provideHttpClient(),
      provideAnimations(),
    ]
  };

Required changes:
  1. REMOVE provideAnimations() — PrimeNG 21 uses native CSS animations; Angular's
     animation provider is deprecated in Angular 20.2+.
  2. ADD provideZonelessChangeDetection() from '@angular/core'.
     Import: import { provideZonelessChangeDetection } from '@angular/core';
  3. Keep provideHttpClient().
  4. Keep provideRouter([]).

Output the complete updated file content.
Add a comment above provideZonelessChangeDetection() explaining:
// Angular 21 default: zoneless change detection via Signals.
// Removes dependency on zone.js and enables better performance.
// All components must use OnPush or Signals for change detection.
```

---

### Prompt 3.5 — Migrate Test Files from Jest to Vitest API

```
Scan all files matching src/**/*.spec.ts.

For each file, apply these API replacements:

IMPORTS:
  Remove: import { jest } from '@jest/globals'
  Remove: import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
  (Vitest globals are auto-imported when globals: true in vitest.config.ts)

MOCKING:
  jest.fn()           → vi.fn()
  jest.spyOn()        → vi.spyOn()
  jest.mock()         → vi.mock()
  jest.clearAllMocks()→ vi.clearAllMocks()
  jest.resetAllMocks()→ vi.resetAllMocks()
  jest.restoreAllMocks()→ vi.restoreAllMocks()
  jest.useFakeTimers()→ vi.useFakeTimers()
  jest.useRealTimers()→ vi.useRealTimers()
  jest.advanceTimersByTime() → vi.advanceTimersByTime()

FAKEASYNC / TICK (CRITICAL — zoneless Vitest does not support these):
  Any test using fakeAsync(() => { ... tick(400); ... }) MUST be rewritten.
  Replace debounce testing pattern:
    OLD: fakeAsync(() => { component.searchControl.setValue('x'); tick(400); fixture.detectChanges(); expect(...) })
    NEW: Since search is now triggered by form submit (not debounce-on-keystroke
         per CLAUDE.md), just call component.onSearch() directly.
         For any remaining timer tests, use vi.useFakeTimers() and vi.advanceTimersByTime(400).

HTTPCLIENT TESTING:
  HttpClientTestingModule → provideHttpClientTesting()
  TestBed.configureTestingModule({ imports: [HttpClientTestingModule] })
    → TestBed.configureTestingModule({ providers: [provideHttpClientTesting()] })

JEST-AXE → VITEST-AXE:
  import { axe, toHaveNoViolations } from 'jest-axe'
    → import { axe, toHaveNoViolations } from 'axe-core' (use axe-core directly)
  expect.extend(toHaveNoViolations) → remove (axe-core handles this differently)

For each modified file, show the before and after diff.
Do not change test logic — only change the API surface.
After migration, run: npx vitest run --reporter=verbose 2>&1 | head -100
to show any remaining failures.
```

---

### Prompt 3.6 — Migrate PrimeNG 17 → 21 Imports

```
Scan all TypeScript files in src/ for PrimeNG imports.

PrimeNG 21 dropped module-based imports. Replace all *Module imports with direct
component imports. Apply these replacements:

  import { ButtonModule } from 'primeng/button'
    → import { Button } from 'primeng/button'

  import { InputTextModule } from 'primeng/inputtext'
    → import { InputText } from 'primeng/inputtext'

  import { CardModule } from 'primeng/card'
    → import { Card } from 'primeng/card'

  import { ProgressSpinnerModule } from 'primeng/progressspinner'
    → import { ProgressSpinner } from 'primeng/progressspinner'

  import { SkeletonModule } from 'primeng/skeleton'
    → import { Skeleton } from 'primeng/skeleton'

  import { MessageModule } from 'primeng/message'
    → import { Message } from 'primeng/message'

  import { DividerModule } from 'primeng/divider'
    → import { Divider } from 'primeng/divider'

  import { AutoCompleteModule } from 'primeng/autocomplete'
    → import { AutoComplete } from 'primeng/autocomplete'

  import { ToastModule } from 'primeng/toast'
    → import { Toast } from 'primeng/toast'

In each component's imports array, replace the old module names with the new
component names.

ALSO: Remove showTransitionOptions and hideTransitionOptions from ALL PrimeNG
component attributes in HTML templates — these are no-ops in PrimeNG 21 and
generate console warnings.

For each file changed, output a unified diff.
```

---

## PHASE 4 — Install, Verify, and Lock

### Prompt 4.1 — Install Updated Dependencies

```
Now install the updated dependencies. Run these commands in sequence,
capturing output at each step:

Step 1 — Clean install:
  Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
  Remove-Item package-lock.json -ErrorAction SilentlyContinue

Step 2 — Install:
  npm install

Step 3 — If peer dependency errors occur, run:
  npm install --legacy-peer-deps

Step 4 — After successful install, run security audit:
  npm audit --json > audit-report-post-upgrade.json

Step 5 — Compare pre and post audit:
  node -e "
    const before = require('./audit-report-baseline.json');
    const after = require('./audit-report-post-upgrade.json');
    const bCount = before.metadata?.vulnerabilities || {};
    const aCount = after.metadata?.vulnerabilities || {};
    console.log('BEFORE:', JSON.stringify(bCount));
    console.log('AFTER: ', JSON.stringify(aCount));
    const reduced = Object.keys(bCount).filter(k => (aCount[k]||0) < bCount[k]);
    const introduced = Object.keys(aCount).filter(k => (aCount[k]||0) > (bCount[k]||0));
    console.log('Vulnerabilities reduced:', reduced);
    console.log('NEW vulnerabilities introduced:', introduced);
  "

If NEW vulnerabilities are introduced, STOP and report them. Do not proceed.

Document all output in a file called INSTALL-LOG.md.
```

---

### Prompt 4.2 — Type Check and Lint

```
Run the following verification commands in order. Stop on first failure and report it.

1. TypeScript strict check (must produce zero errors):
   npx tsc --noEmit 2>&1

2. ESLint (must produce zero errors):
   npx eslint src --ext .ts,.html --max-warnings 0 2>&1

3. Angular build (must succeed):
   ng build --configuration production 2>&1 | tail -20

If any command fails:
  - Show the exact error output
  - Identify which file and line caused the failure
  - Apply the minimal fix
  - Re-run the failed command to confirm it now passes
  - Document fix in UPGRADE-LOG.md

Append a summary to UPGRADE-LOG.md:
  | Check | Status | Errors Fixed |
  |-------|--------|-------------|
  | tsc --noEmit | ✅/❌ | N |
  | eslint | ✅/❌ | N |
  | ng build | ✅/❌ | N |
```

---

### Prompt 4.3 — Run Full Test Suite

```
Run the full test suite and verify compliance targets are met.

1. Run all unit tests with coverage:
   npx vitest run --coverage 2>&1

2. Parse coverage output and verify thresholds:
   - Statements: ≥ 90%
   - Branches: ≥ 90%
   - Functions: ≥ 90%
   - Lines: ≥ 90%
   - Services: must be 100%

3. If any test fails after the migration:
   a. Show the full error including file name and line number
   b. Identify whether the failure is a Jest→Vitest API issue (fix it)
      or a genuine logic regression (report it, do NOT fix logic)
   c. Apply API fixes only, document in UPGRADE-LOG.md
   d. Re-run to confirm fix

4. Produce TEST-RESULTS.md with:
   - Total tests: X passed, Y failed
   - Coverage summary table
   - List of any skipped or todo tests
   - Confirmation that zero tests rely on fakeAsync or tick()
```

---

### Prompt 4.4 — Lock File and SBOM

```
Perform final supply chain security steps:

1. Verify package-lock.json lockfileVersion is 3:
   node -e "console.log(require('./package-lock.json').lockfileVersion)"

2. Generate a Software Bill of Materials (SBOM):
   npm sbom --sbom-format cyclonedx --sbom-type library > sbom.json 2>&1

   If npm sbom is not supported (npm < 10), generate with:
   npx @cyclonedx/cyclonedx-npm --output-file sbom.json

3. Count direct and transitive dependencies:
   node -e "
     const lock = require('./package-lock.json');
     const all = Object.keys(lock.packages || {}).filter(k => k.startsWith('node_modules/'));
     const direct = Object.keys(require('./package.json').dependencies || {}).length
       + Object.keys(require('./package.json').devDependencies || {}).length;
     console.log('Direct dependencies:', direct);
     console.log('Total (incl. transitive):', all.length);
   "

4. Check for known risky package names (typosquatting patterns):
   node -e "
     const lock = require('./package-lock.json');
     const names = Object.keys(lock.packages||{})
       .map(k => k.replace('node_modules/',''))
       .filter(Boolean);
     // Flag packages with suspicious patterns
     const suspicious = names.filter(n =>
       n.match(/angular-core|angularjs|primeng-ui|rxjs-compat|zone-js/) &&
       !['@angular/core','primeng','rxjs','zone.js'].includes(n)
     );
     console.log('Potentially suspicious package names:', suspicious);
   "

5. Append to SECURITY-AUDIT.md a section "POST-UPGRADE SUPPLY CHAIN STATUS":
   - lockfileVersion: X
   - Total packages in lock file: X
   - CVE count before upgrade: X critical, X high, X moderate
   - CVE count after upgrade: X critical, X high, X moderate
   - SBOM generated: sbom.json (Y packages)
   - Suspicious names found: none / list
```

---

## PHASE 5 — Update Project Conventions

### Prompt 5.1 — Update CLAUDE.md for New Stack

```
Read the existing CLAUDE.md in the current directory.

Apply the following targeted updates — do not rewrite the whole file,
use str_replace to change only the specific sections listed:

1. In "Project Identity", update:
   - Framework: Angular 21+ (standalone APIs, zoneless by default)
   - Testing: Vitest 3+ (unit, browser mode), Cypress or Playwright (e2e), axe-core (a11y)

2. In "Non-Negotiable Rules → Angular" section, ADD after the OnPush bullet:
   - Angular 21 is zoneless by default. Never import or reference zone.js.
     Do not use provideZoneChangeDetection() — use provideZonelessChangeDetection() instead.
     zone.js must not appear in polyfills, angular.json, or package.json.

3. In "Non-Negotiable Rules → RxJS" section, the debounceTime rule should already
   say search is triggered by submit not keystroke (from CLAUDE.md). Confirm it is correct.
   If it still says debounceTime(400) on valueChanges triggers search, correct it to:
   "debounceTime is NOT used on the search trigger. Search only fires on explicit
    submit (Enter key or Search button). A separate valueChanges listener without
    debounce may reset state to 'idle' when input is cleared or too short."

4. In "Test Standards → Unit Tests" section, REPLACE the Jest-specific content with:

   ### Unit Tests (Vitest — Angular 21 default)
   - Use Vitest (vi.*) APIs exclusively. jest.* is removed from Angular 22.
   - vi.fn(), vi.spyOn(), vi.mock() replace jest counterparts.
   - NO fakeAsync or tick() — these are zone.js APIs unavailable in zoneless Vitest.
   - For timer-dependent tests: use vi.useFakeTimers() and vi.advanceTimersByTime().
   - For HTTP tests: use provideHttpClientTesting() (not HttpClientTestingModule).
   - The search trigger is synchronous submit — drive tests by calling onSearch() directly.
   - Use typed mock data matching interfaces exactly (no partial casts with `as`).
   - Minimum 90% branch coverage on components, 100% on services.

5. In "Dependencies" section, update the JSON block to match the new package.json
   produced in Prompt 3.1. Remove Jest entries. Add Vitest entries.

6. In "Commands Reference", update:
   "test": from "npx jest --watch" to "npx vitest"
   "coverage": from "npx jest --coverage" to "npx vitest run --coverage"
   Add: "test:ui": "npx vitest --ui"

7. In "What Claude Must NOT Do" list, ADD:
   - ❌ Import or reference zone.js in any file
   - ❌ Use fakeAsync() or tick() — these require zone.js and are unavailable in Vitest
   - ❌ Use jest.* APIs — use vi.* (Vitest) instead
   - ❌ Use HttpClientTestingModule — use provideHttpClientTesting() instead
   - ❌ Use @angular/animations or provideAnimations() — PrimeNG 21 uses native CSS
   - ❌ Use PrimeNG *Module imports (e.g. ButtonModule) — import components directly

After all changes, output the full updated CLAUDE.md for review.
```

---

## PHASE 6 — Final Compliance Report

### Prompt 6.1 — Generate Compliance Certificate

```
Generate a file called COMPLIANCE-REPORT.md with the following structure:

# Security & Dependency Compliance Report
Generated: <current date>
Project: customer-search-app
Environment: Node v24.18.0 · npm v11.16.0

## Executive Summary
One-paragraph summary of: what was found, what was changed, current risk level.

## Framework Compliance
| Item | Before | After | Status |
|------|--------|-------|--------|
| Angular version | 17 (EOL) | 21 (LTS) | ✅ |
| Node compatibility | ❌ unsupported | ✅ ^24.0.0 | ✅ |
| PrimeNG version | 17 | 21 | ✅ |
| zone.js | present | removed | ✅ |
| Test runner | Jest (deprecated) | Vitest (official) | ✅ |
| @angular/animations | present | removed | ✅ |

## Vulnerability Summary
| Severity | Before | After | Delta |
|----------|--------|-------|-------|
| Critical | X | X | -X |
| High | X | X | -X |
| Moderate | X | X | -X |
| Low | X | X | -X |

## Test Suite Health
| Metric | Value | Threshold | Status |
|--------|-------|-----------|--------|
| Tests passing | X/X | 100% | ✅/❌ |
| Statement coverage | X% | 90% | ✅/❌ |
| Branch coverage | X% | 90% | ✅/❌ |
| axe violations | 0 | 0 | ✅/❌ |

## Supply Chain
| Check | Result |
|-------|--------|
| lockfileVersion | 3 |
| Packages with integrity hash | X/X |
| Suspicious package names | none / list |
| SBOM generated | ✅ sbom.json |

## Remaining Risks & Accepted Risk Register
List any vulnerabilities that could not be auto-fixed, with justification for acceptance.

## Next Review Date
Recommended: <date 90 days from today>

## Audit Trail
List every file created, modified, or deleted during this compliance run.
```

---

## Quick Reference: Key Version Targets

| Package | Your Current | Secure Target | Notes |
|---|---|---|---|
| Node.js | v24.18.0 | v24.18.0 ✅ | Angular 21 supports ^24.0.0 |
| npm | 11.16.0 | 11.16.0 ✅ | Lockfile v3 |
| `@angular/*` | ^17.0.0 🔴 | ^21.0.0 | Sequential upgrade via ng update |
| `@angular/cli` | ^17.0.0 🔴 | ^21.0.0 | |
| `@angular/build` | absent | ^21.0.0 | Replaces @angular-devkit/build-angular |
| `primeng` | ^17.0.0 🔴 | ^21.0.0 | Direct component imports, no *Module |
| `primeicons` | ^6.0.1 | ^7.0.0 | |
| `rxjs` | ^7.8.0 | ^7.8.1 | |
| `zone.js` | ^0.14.0 🚫 | REMOVE | Angular 21 is zoneless by default |
| `@angular/animations` | ^17.0.0 🚫 | REMOVE | PrimeNG 21 uses native CSS |
| `typescript` | ~5.2.0 | ~5.6.0 | Angular 21 requires TS 5.4–5.7 |
| `jest` | ^29.0.0 🚫 | REMOVE | Deprecated in Angular 21, removed in v22 |
| `jest-preset-angular` | ^14.0.0 🚫 | REMOVE | Peer dep conflict with Angular 21 |
| `jest-environment-jsdom` | ^29.0.0 🚫 | REMOVE | |
| `vitest` | absent | ^3.0.0 | Angular 21 official test runner |
| `@vitest/coverage-v8` | absent | ^3.0.0 | |
| `cypress` | ^13.0.0 | ^13.0.0 ✅ | |
| `axe-core` | ^4.9.0 | ^4.10.0 | |
| `eslint` | ^8.57.0 | ^9.0.0 | |
| `@types/jest` | ^29.0.0 🚫 | REMOVE | |
| `@types/node` | ^20.0.0 | ^22.0.0 | |
