---
name: pr-review
description: Use this skill for project-level pull request / code review in Claude Code — whenever the user asks to "review my changes," "review this PR," "check my diff," "is this ready to commit," or asks for a commit message. It detects the project's stack from repo files, reviews staged/unstaged/branch changes against three fixed rules (code standards, code coverage, logic verification), and produces a structured review plus a conventional-commit-style commit message. Trigger this proactively whenever the user is about to commit or open a PR, even if they only ask for "a commit message" — the review should run first so the message reflects what actually changed and whether it's safe to commit.
---

# PR Review

A project-level review skill for Claude Code. It looks at what actually changed, understands the stack those changes touch, checks the change against three fixed rules, and writes a commit message that reflects the real scope of the diff — not a generic "update files" message.

## When to use this

- "Review my changes" / "review this PR" / "check my diff before I push"
- "Write me a commit message"
- "Is this ready to commit?"
- Any time the user is about to commit/push and hasn't explicitly said "skip the review"

If the user only wants a commit message with no review, still do Step 1–2 (get the diff, detect the stack) since the message quality depends on understanding what changed — just skip the long-form review report and go straight to the message.

## Workflow

### Step 1 — Get the actual diff

Don't guess from filenames. Pull the real change set:

```bash
git status
git diff --staged            # if changes are staged
git diff                     # if not yet staged
git diff <base-branch>...HEAD  # for a full PR vs. a target branch, e.g. origin/main
git log --oneline -10        # recent history for commit message tone/conventions
```

If nothing is staged and nothing is unstaged but the user wants a PR-level review, diff against the likely base branch (`main`/`master`/`develop`) — check `git branch -a` or `git remote show origin` if unsure which.

Ignore generated/build artifacts in the diff (lockfiles beyond version bumps, `.angular/cache`, `dist/`, `node_modules/`, coverage output, etc.) — read them for context only if a rule below needs it (e.g. a lockfile diff can reveal a dependency bump worth flagging).

### Step 2 — Detect the stack

Identify what's actually touched so the review uses the right lens. Check for, in the changed paths and repo root:

| Signal file | Stack |
|---|---|
| `package.json` + `angular.json` | Angular |
| `package.json` + `next.config.*` | Next.js/React |
| `package.json` (no framework file) | Node/TS/JS |
| `requirements.txt`, `pyproject.toml` | Python |
| `pom.xml`, `build.gradle` | Java/Kotlin |
| `go.mod` | Go |
| `*.csproj`, `*.sln` | .NET |
| `Gemfile` | Ruby |

A change set can span more than one (e.g. Angular frontend + Node backend in a monorepo) — review each touched stack with its own checklist. Load `references/stack-checklists.md` for the specific checks per stack; don't try to hold all of them in memory.

### Step 3 — Apply the three rules

Every review covers exactly these three areas, in this order. Be concrete — cite file and line, not generic advice.

**1. Basic code standards**
- Formatting/linting consistent with the repo (run the project's linter/formatter if configured — check `.eslintrc*`, `.prettierrc*`, `pyproject.toml` `[tool.ruff]`/`[tool.black]`, `.editorconfig` — and actually run it rather than eyeballing style)
- Naming consistency with surrounding code
- No dead code, commented-out blocks, debug logging (`console.log`, `print()`, `debugger`), or leftover TODOs without context
- Consistent error handling (no swallowed exceptions, no bare `except:`/empty `catch`)
- No secrets, API keys, or credentials introduced in the diff

**2. Code coverage**
- Does new/changed logic have corresponding new/changed tests in the diff? Flag any non-trivial logic change (branching, calculations, new function, changed return contract) with no test touching it.
- If the repo has a coverage tool configured (check `package.json` scripts for `test:coverage`, `jest.config.*` `coverageThreshold`, `pyproject.toml`/`.coveragerc`, `nyc`), run it if feasible and report whether coverage dropped for touched files. If running it isn't feasible (no test infra available, network-restricted), say so explicitly rather than skipping silently.
- Distinguish "no tests needed" (pure config/type/formatting changes) from "tests missing" (behavior changed) — don't demand tests for things that don't need them.

**3. Logic verification**
- Read the actual logic change, not just the diff shape. Trace through: does the new code do what the surrounding code/comments/PR description imply it should?
- Check edge cases relevant to the change: empty/null inputs, boundary values, async/race conditions, off-by-one, error paths, state that could be stale.
- Check for regressions: does this change silently alter behavior somewhere else that calls the modified code? Search for other call sites of changed functions/methods (`grep`/repo search) before declaring it safe.
- Flag anything that looks like it fixes a symptom rather than the underlying cause.

### Step 4 — Report format

Present findings grouped by the three rules, not by file. For each finding: file:line, what's wrong, why it matters, suggested fix. Mark severity as **blocking** (should not commit/merge as-is) vs **suggestion** (worth doing, not required). End with a one-line verdict: ready to commit / needs fixes first.

Keep this proportional — a 5-line change gets a few lines of review, not a essay. Don't manufacture findings to look thorough.

### Step 5 — Commit message

After the review (or immediately, if the user only asked for a message), write the commit message based on what the diff actually does, not the filenames touched. Use Conventional Commits format unless the repo's `git log` shows a different established convention — check recent commits first and match that style.

```
<type>(<scope>): <summary, imperative mood, ≤72 chars>

<body: what changed and why, wrap ~72 chars, only if the change
isn't self-explanatory from the summary>

<footer: BREAKING CHANGE: ... / Fixes #123, only if applicable>
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `style`, `chore`, `perf`, `build`, `ci`. Scope is the module/component/package actually touched (e.g. `customer-search`, `auth-api`) — infer it from the changed paths, don't leave it generic. See `references/commit-message-format.md` for scope inference details and multi-stack examples.

If Step 3 found **blocking** issues, say so before offering the message: don't hand over a ready-to-use commit message for a change you just flagged as not ready, unless the user explicitly says they're committing anyway (e.g. a WIP commit).

## Notes

- If the user has no changes staged/unstaged and no PR branch to diff, say so plainly rather than inventing a review.
- If the project has a CI-run linter/test command in `package.json`/`Makefile`/CI config, prefer running that over ad hoc checks — it reflects what the team actually enforces.
- Never auto-run `git commit` or `git push` — produce the message and let the user run it, consistent with not taking side-effectful git actions unprompted.
