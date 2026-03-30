---
name: init-pre-commit
description: Initialize or augment pre-commit configuration for a project by analyzing existing files or asking about expected technologies. Creates or updates .pre-commit-config.yaml with linting, formatting, security scanning, testing, cyclomatic complexity, and conventional commits hooks. Never overwrites existing hooks—only adds missing ones.
---

# Initialize Pre-Commit Configuration

Initialize or augment a `.pre-commit-config.yaml` for the current project. If a config exists, parse it and only add hooks that aren't already present. Never alter existing hook behavior or remove hooks the project already uses.

## When to Use

- Setting up a new project
- Adding pre-commit to an existing project
- Augmenting an existing pre-commit config with additional hooks
- Standardizing code quality checks across a team
- Ensuring conventional commits compliance
- Enforcing security best practices before code lands
- Running fast tests before every commit

## Process

### 1. Check for Existing Configuration

First, check if `.pre-commit-config.yaml` already exists in the project root:

```bash
ls -la .pre-commit-config.yaml 2>/dev/null || echo "No pre-commit config found"
```

**If it exists**, parse it to identify existing hooks:

```bash
# Extract existing hook IDs
grep -E "^\s+- id:" .pre-commit-config.yaml | sed 's/.*- id: //' | sort -u

# Extract existing repos
grep -E "^\s+- repo:" .pre-commit-config.yaml | sed 's/.*- repo: //' | sort -u
```

**Do not overwrite or modify existing hooks.** Only add hooks that aren't already configured.

### 2. Detect Project Technologies

Analyze the project structure to determine what languages and technologies are present:

```bash
# Check for common project files
find . -maxdepth 2 -type f \( \
  -name "Cargo.toml" -o \
  -name "package.json" -o \
  -name "pyproject.toml" -o \
  -name "setup.py" -o \
  -name "requirements.txt" -o \
  -name "go.mod" -o \
  -name "*.rs" -o \
  -name "*.py" -o \
  -name "*.ts" -o \
  -name "*.tsx" -o \
  -name "*.js" -o \
  -name "*.go" -o \
  -name "*.sh" -o \
  -name "*.md" -o \
  -name "Dockerfile" -o \
  -name "docker-compose.yml" -o \
  -name "*.tf" -o \
  -name "*.yaml" -o \
  -name "*.yml" \
) 2>/dev/null | head -50
```

Also check for specific directories:

```bash
ls -la 2>/dev/null | grep -E "(api|mobile|web|frontend|backend|src|app|tests|docs)"
```

### 3. Ask for Clarification (If Needed)

If no clear technology indicators are found, or if the project structure is ambiguous, ask the user:

> "I don't see clear indicators of specific languages in this project. What languages or technologies are you expecting to use? (e.g., Rust, TypeScript/React, Python, Go, etc.)"

### 4. Determine Hooks to Add

Compare recommended hooks against existing configuration. For each hook category, check if an equivalent already exists:

| Hook Purpose | Existing Hook Patterns to Check |
|--------------|-------------------------------|
| Commit message format | `conventional-pre-commit`, `commitlint` |
| Trailing whitespace | `trailing-whitespace` |
| EOF fixer | `end-of-file-fixer` |
| Secret scanning | `detect-private-key`, `gitleaks`, `ripsecrets` |
| Formatting (Rust) | `cargo-fmt`, `cargo fmt` |
| Formatting (Python) | `ruff-format`, `black`, `autopep8` |
| Formatting (JS/TS) | `prettier` |
| Linting (Rust) | `cargo-clippy`, `cargo clippy` |
| Linting (Python) | `ruff`, `flake8`, `pylint` |
| Linting (JS/TS) | `eslint` |
| Type checking (TS) | `tsc`, `typescript` |
| Type checking (Python) | `mypy` |
| Testing (Python) | `pytest` |
| Testing (Rust) | `cargo-test`, `cargo test` |
| Testing (JS/TS) | `jest`, `vitest` |
| Complexity | `lizard` |
| Spell checking | `codespell`, `cspell` |
| SQL linting | `sqlfluff` |
| Shell linting | `shellcheck` |
| Markdown linting | `markdownlint` |

**Skip any hook that already has an equivalent.** Report these as "already configured."

### 5. Generate or Augment Configuration

**If no config exists:** Create a new `.pre-commit-config.yaml` with all recommended hooks for detected technologies.

**If config exists:** Append only the missing hooks to the existing configuration. Preserve:
- Existing `repos` entries (don't modify)
- Existing hook configurations (don't change args, files, etc.)
- Existing `ci:` configuration
- Comments and formatting

#### Example: Augmenting Existing Config

**Before:**
```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v5.0.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
```

**After (adding missing hooks):**
```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v5.0.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer

  # Added by init-pre-commit skill
  - repo: https://github.com/compilerla/conventional-pre-commit
    rev: v4.0.0
    hooks:
      - id: conventional-pre-commit
        stages: [commit-msg]

  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.23.3
    hooks:
      - id: gitleaks
```

### 6. Report Results

After generating or augmenting, provide a summary:

```
Pre-commit configuration updated.

Added (5 hooks):
  ✓ conventional-pre-commit (commit message format)
  ✓ gitleaks (secret scanning)
  ✓ codespell (spell checking)
  ✓ cargo-clippy (Rust linting)
  ✓ lizard (cyclomatic complexity)

Already configured (3 hooks):
  • trailing-whitespace
  • end-of-file-fixer
  • prettier

Skipped (not applicable):
  • sqlfluff (no SQL files found)
  • depcheck (not a Node.js project)
```

### 7. Install and Test

After generating or augmenting the configuration, instruct the user to:

```bash
# Install pre-commit hooks
pre-commit install
pre-commit install --hook-type commit-msg

# Test on all files
pre-commit run --all-files
```

### 8. Add Language-Specific Hooks

Based on detected technologies, add appropriate hooks:

#### Rust Projects

```yaml
  # Rust — formatting, linting
  - repo: local
    hooks:
      - id: cargo-fmt
        name: cargo fmt
        language: system
        entry: cargo fmt -- --check
        pass_filenames: false
        types: [rust]

      - id: cargo-clippy
        name: cargo clippy
        language: system
        entry: cargo clippy -- -D warnings
        pass_filenames: false
        types: [rust]
```

**Note:** If the project has a non-standard structure (e.g., Rust code in `api/` subdirectory), adjust the `--manifest-path` accordingly:

```yaml
entry: cargo fmt --manifest-path api/Cargo.toml -- --check
```

#### TypeScript/JavaScript Projects

```yaml
  # TypeScript/JavaScript — formatting, linting
  # Note: ESLint v9 requires flat config (eslint.config.js). Use v8 for legacy .eslintrc configs.
  - repo: https://github.com/pre-commit/mirrors-eslint
    rev: v8.57.1
    hooks:
      - id: eslint
        additional_dependencies:
          - eslint@8.57.1
          - eslint-config-prettier
          - eslint-plugin-import
        files: \.(ts|tsx|js|jsx)$

  - repo: https://github.com/pre-commit/mirrors-prettier
    rev: v3.1.0
    hooks:
      - id: prettier
        types_or: [javascript, jsx, ts, tsx, json, yaml, markdown]
        args: [--prose-wrap=always, --print-width=88]
```

#### Python Projects

```yaml
  # Python — formatting, linting
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.9.3
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format

  # Python type checking (if mypy is configured)
  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.14.1
    hooks:
      - id: mypy
        additional_dependencies: [types-all]
        args: [--ignore-missing-imports]
```

#### Go Projects

```yaml
  # Go — formatting, linting
  - repo: https://github.com/golangci/golangci-lint
    rev: v1.63.4
    hooks:
      - id: golangci-lint
        args: [--fix]

  - repo: local
    hooks:
      - id: go-fmt
        name: go fmt
        language: system
        entry: gofmt -l -w
        types: [go]
```

#### Shell Scripts

```yaml
  # Shell script linting and formatting
  - repo: https://github.com/shellcheck-py/shellcheck-py
    rev: v0.10.0.1
    hooks:
      - id: shellcheck
        args: [--severity=warning]

  - repo: https://github.com/scop/pre-commit-shfmt
    rev: v3.11.0-1
    hooks:
      - id: shfmt
        args: [-i=2, -ci, -w]
```

#### Markdown

```yaml
  # Markdown linting
  - repo: https://github.com/igorshubovych/markdownlint-cli
    rev: v0.44.0
    hooks:
      - id: markdownlint
        args: [--fix, --disable, MD013, MD033, --]
```

#### Docker

```yaml
  # Dockerfile linting
  - repo: https://github.com/hadolint/hadolint
    rev: v2.12.0
    hooks:
      - id: hadolint
        args: [--ignore, DL3008, --ignore, DL3018]
```

#### Terraform

```yaml
  # Terraform formatting and validation
  - repo: https://github.com/antonbabenko/pre-commit-terraform
    rev: v1.96.2
    hooks:
      - id: terraform_fmt
      - id: terraform_validate
      - id: terraform_tflint
```

### 9. Add Security Hooks (Secret Scanning)

Secret scanning catches API keys, tokens, and credentials before they enter git history. This is critical to run on every commit because once a secret is committed, it's in the history forever—even if you delete the file.

**Note:** Dependency audits (`cargo audit`, `npm audit`), SAST tools (`semgrep`, `bandit`), and license compliance checks are **not included here**. These belong in CI because:
- Dependencies change rarely (lockfiles update infrequently)
- Running on every commit is wasteful
- New vulnerabilities are discovered over time, not just when you commit

#### Secret Scanning

```yaml
  # Gitleaks — comprehensive secret scanning
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.23.3
    hooks:
      - id: gitleaks
```

The core configuration already includes `detect-private-key` for basic secret detection. Use `gitleaks` for more comprehensive scanning.

#### Security Hook Summary

| Hook | Purpose | Stage | Speed |
|------|---------|-------|-------|
| `detect-private-key` | Basic secret detection | pre-commit | Instant |
| `gitleaks` | Comprehensive secret scanning | pre-commit | Fast |

**CI-only security checks** (not in pre-commit):
- `cargo audit` / `npm audit` — Dependency vulnerability scanning
- `semgrep` / `bandit` — Static application security testing
- `pip-licenses` / `license-checker` — License compliance

### 10. Add Cyclomatic Complexity Checks

For maintainability, add cyclomatic complexity analysis. Use **lizard** for universal support:

```yaml
  # Cyclomatic complexity check
  - repo: local
    hooks:
      - id: lizard
        name: lizard (cyclomatic complexity)
        language: system
        entry: lizard -C 15 -w -x "*/tests/*" -x "*/migrations/*" -x "*/node_modules/*" -x "*/target/*" -x "*/dist/*" -x "*/.git/*" -x "*/__pycache__/*"
        pass_filenames: false
        types_or: [python, rust, ts, tsx, javascript, jsx, go, c, cpp, java]
```

**Configuration Notes:**

- `-C 15`: Warn on functions with complexity > 15 (adjust based on team preference)
- `-w`: Only show warnings
- `-x`: Exclude test files, generated code, and dependencies

### 11. Add Testing Hooks

Run fast tests before every commit to catch regressions early. Only include tests that complete in under 10 seconds.

#### Python Testing

```yaml
  # Python — run fast tests
  - repo: local
    hooks:
      - id: pytest-fast
        name: pytest (fast tests only)
        language: system
        entry: pytest -m "not slow" -x -q
        pass_filenames: false
        types: [python]
```

#### Rust Testing

```yaml
  # Rust — run fast tests
  - repo: local
    hooks:
      - id: cargo-test
        name: cargo test (fast)
        language: system
        entry: cargo test --lib -- --test-threads=4 -q
        pass_filenames: false
        types: [rust]
```

#### TypeScript/JavaScript Testing

```yaml
  # TypeScript — run fast tests
  - repo: local
    hooks:
      - id: jest-fast
        name: jest (fast tests)
        language: system
        entry: npx jest --testPathPattern="^(?!.*\.slow\.)" --passWithNoTests
        pass_filenames: false
        types_or: [ts, tsx, js, jsx]
```

#### Coverage Threshold Enforcement

Enforce minimum coverage on changed files:

```yaml
  # Python — coverage threshold
  - repo: local
    hooks:
      - id: coverage-check
        name: coverage threshold (80%)
        language: system
        entry: pytest --cov --cov-fail-under=80 -q
        pass_filenames: false
        types: [python]
```

#### Testing Hook Guidelines

| Guideline | Reason |
|-----------|--------|
| **< 10 seconds** | Pre-commit runs on every commit; slow hooks break flow |
| **Use `-x` flag** | Stop on first failure; faster feedback |
| **Exclude slow tests** | Mark integration/e2e tests with `@pytest.mark.slow` or similar |
| **Parallel execution** | Use `--test-threads` or `--maxWorkers` for speed |
| **CI for full suite** | Run complete test suite in CI, not pre-commit |

### 12. Add Changelog Enforcement

Optionally require CHANGELOG updates for user-facing changes. This integrates with the `update-changelog` skill.

#### Basic Changelog Check

```yaml
  # Require CHANGELOG update for feat/fix commits
  - repo: local
    hooks:
      - id: changelog-check
        name: changelog check
        language: system
        entry: bash -c '
          commit_msg=$(cat "$1");
          if echo "$commit_msg" | grep -qE "^(feat|fix)(\(.+\))?!?:"; then
            if ! git diff --cached --name-only | grep -q "CHANGELOG"; then
              echo "ERROR: feat/fix commits require CHANGELOG update";
              echo "       Add entry or use --no-verify to skip";
              exit 1;
            fi;
          fi
        '
        args: [.git/COMMIT_EDITMSG]
        stages: [commit-msg]
        pass_filenames: false
```

#### Changelog with Breaking Change Detection

```yaml
  # Require CHANGELOG for breaking changes
  - repo: local
    hooks:
      - id: changelog-breaking
        name: changelog (breaking changes)
        language: system
        entry: bash -c '
          commit_msg=$(cat "$1");
          if echo "$commit_msg" | grep -qE "^.+!:" || echo "$commit_msg" | grep -q "BREAKING CHANGE:"; then
            if ! git diff --cached --name-only | grep -q "CHANGELOG"; then
              echo "ERROR: Breaking changes require CHANGELOG update";
              exit 1;
            fi;
          fi
        '
        args: [.git/COMMIT_EDITMSG]
        stages: [commit-msg]
        pass_filenames: false
```

#### Changelog Hook Options

| Mode | When Required | Use Case |
|------|---------------|----------|
| **feat/fix only** | `feat:` or `fix:` commits | Standard projects |
| **Breaking changes** | `!:` or `BREAKING CHANGE:` | Critical changes only |
| **All user-facing** | `feat|fix|perf|refactor:` | Strict enforcement |

**Tip:** Allow bypass with `--no-verify` for WIP commits, but enforce in CI.

### 13. Add Static Analysis Hooks

These hooks catch issues that linters and formatters miss: typos, SQL problems, and dependency bloat.

#### Spell Checking (`codespell`)

Catches typos in comments, docstrings, and string literals. Fast and catches embarrassing mistakes that linters miss.

```yaml
  # Spell checking for code and docs
  - repo: https://github.com/codespell-project/codespell
    rev: v2.3.0
    hooks:
      - id: codespell
        args: [--skip="*.lock,*.min.js,*.min.css,*.snap"]
```

**Why it's valuable:** Agents often introduce typos in comments and documentation. This catches them immediately.

#### SQL Linting (`sqlfluff`)

For projects with SQL files, migrations, or raw SQL. Catches syntax errors, inconsistent formatting, and some injection-prone patterns.

```yaml
  # SQL linting and formatting
  - repo: https://github.com/sqlfluff/sqlfluff
    rev: 3.2.5
    hooks:
      - id: sqlfluff-lint
        args: [--dialect, "ansi"]
      - id: sqlfluff-fix
        args: [--dialect, "ansi"]
```

**When to add:** Only if the project has `.sql` files or migration directories. If you use an ORM (Prisma, Diesel, SQLAlchemy), SQL injection is largely prevented at the ORM level.

#### Unused Dependencies (`depcheck`)

For Node.js projects. Catches dependencies declared in `package.json` but never imported.

```yaml
  # Check for unused dependencies
  - repo: local
    hooks:
      - id: depcheck
        name: depcheck
        language: system
        entry: npx depcheck --ignores="@types/*,eslint-config-*"
        pass_filenames: false
        files: package\.json$
```

**Why it's valuable:** Agents often add dependencies while experimenting but may not clean up. This catches unused deps before they accumulate.

#### Static Analysis Hook Summary

| Hook | Purpose | Speed | When to Add |
|------|---------|-------|-------------|
| `codespell` | Typos in comments/docs | Fast | All projects |
| `sqlfluff` | SQL syntax and formatting | Fast | Projects with SQL files |
| `depcheck` | Unused Node.js dependencies | Medium | Node.js projects |

### 14. Additional Maintainability Hooks (Optional)

The core configuration already includes many essential hooks. Consider these **additional hooks** based on your project's specific needs:

| Hook | Purpose | When to Add |
|------|---------|-------------|
| `check-xml` | Validate XML syntax | Any XML files |
| `check-symlinks` | Ensure symlinks point to real files | Projects with symlinks |
| `destroyed-symlinks` | Detect accidentally destroyed symlinks | Projects with symlinks |
| `check-executables-have-shebangs` | Ensure executables have proper shebang | Shell scripts |
| `check-shebang-scripts-are-executable` | Ensure scripts with shebang are executable | Shell scripts |
| `check-ast` | Validate Python syntax | Python projects |
| `debug-statements` | Prevent committing debug breakpoints | Python projects |
| `double-quote-string-fixer` | Enforce double quotes in Python | Python projects |
| `commitlint` | Enforce conventional commit format (alternative) | If conventional-pre-commit doesn't work |
| `ripsecrets` | Alternative to gitleaks for secrets | All projects |

**Note:** The following hooks are already included in the core configuration:

- `check-json`, `check-yaml`, `check-toml` — Syntax validation
- `mixed-line-ending`, `fix-byte-order-marker` — Line ending/encoding consistency  
- `forbid-new-submodules` — Prevent accidental submodules
- `detect-private-key` — Basic secret detection
- `no-commit-to-branch` — Protect main/master branches

For comprehensive secret scanning, uncomment the `gitleaks` hook in the core configuration.

### 15. Optimize Hook Performance

Slow hooks kill developer productivity. Apply these optimizations to keep pre-commit under 5 seconds.

#### Use `fail_fast` for Critical Hooks

Stop early on critical failures:

```yaml
repos:
  - repo: https://github.com/compilerla/conventional-pre-commit
    rev: v4.0.0
    hooks:
      - id: conventional-pre-commit
        stages: [commit-msg]
        fail_fast: true  # Stop immediately on bad commit message
```

#### Scope Hooks to Changed Files

Only run hooks on relevant files:

```yaml
  - repo: local
    hooks:
      - id: cargo-clippy
        name: cargo clippy
        language: system
        entry: cargo clippy -- -D warnings
        pass_filenames: false
        files: \.rs$  # Only run when Rust files change
```

#### Use `types_or` for Multiple File Types

More efficient than regex `files:`:

```yaml
  - repo: local
    hooks:
      - id: lizard
        types_or: [python, rust, javascript, typescript]  # Faster than regex
```

#### Cache Expensive Operations

For hooks that download dependencies, use environment caching:

```yaml
  # ESLint with cached dependencies
  - repo: https://github.com/pre-commit/mirrors-eslint
    rev: v8.57.1
    hooks:
      - id: eslint
        additional_dependencies:
          - eslint@8.57.1
        args: ["--cache", "--cache-location", ".eslintcache"]
```

#### Parallel Execution

Pre-commit runs hooks in parallel by default. To control concurrency:

```yaml
# In .pre-commit-config.yaml (top level)
default_language_version:
  python: python3.12

# Limit parallel hooks (useful for resource-intensive tools)
# pre-commit run --config .pre-commit-config.yaml --all-files
```

Or run manually with parallelism:

```bash
pre-commit run --all-files --show-diff-on-failure
```

#### Skip Slow Hooks Locally

For development, skip slow hooks but enforce in CI:

```yaml
  # Slow hook example — only run manually
  - repo: local
    hooks:
      - id: slow-check
        name: slow check
        language: system
        entry: ./scripts/slow-check.sh
        stages: [manual]  # Only run with --hook-stage manual
```

Then in CI:

```bash
pre-commit run --all-files --hook-stage manual
```

#### Performance Benchmarks

| Hook Type | Target Time | Optimization |
|-----------|-------------|--------------|
| Formatting | < 1s | Use `--check` mode |
| Linting | < 3s | Scope to changed files |
| Type checking | < 5s | Incremental mode |
| Testing | < 10s | Fast tests only |

## Example: Full Multi-Language Configuration

Here's a complete example for a project using **Rust + TypeScript** (like Lexi):

```yaml
repos:
  # Conventional commit message format
  - repo: https://github.com/compilerla/conventional-pre-commit
    rev: v4.0.0
    hooks:
      - id: conventional-pre-commit
        stages: [commit-msg]
        fail_fast: true

  # General file hygiene and syntax validation
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v5.0.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-merge-conflict
      - id: check-added-large-files
        args: ["--maxkb=500"]
      - id: check-case-conflict
      - id: detect-private-key
      - id: check-executables-have-shebangs
      - id: check-shebang-scripts-are-executable
      - id: check-json
      - id: check-yaml
      - id: check-toml
      - id: mixed-line-ending
      - id: fix-byte-order-marker
      - id: forbid-new-submodules

  # Secret detection (comprehensive scanning)
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.23.3
    hooks:
      - id: gitleaks

  # Spell checking
  - repo: https://github.com/codespell-project/codespell
    rev: v2.3.0
    hooks:
      - id: codespell
        args: [--skip="*.lock,*.min.js,*.min.css"]

  # Protect main/master branches
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v5.0.0
    hooks:
      - id: no-commit-to-branch
        args: [--branch, main, --branch, master]

  # Rust — formatting, linting
  - repo: local
    hooks:
      - id: cargo-fmt
        name: cargo fmt
        language: system
        entry: cargo fmt --manifest-path api/Cargo.toml -- --check
        pass_filenames: false
        types: [rust]

      - id: cargo-clippy
        name: cargo clippy
        language: system
        entry: cargo clippy --manifest-path api/Cargo.toml -- -D warnings
        pass_filenames: false
        types: [rust]

  # Cyclomatic complexity
  - repo: local
    hooks:
      - id: lizard
        name: lizard (cyclomatic complexity)
        language: system
        entry: lizard -C 15 -w -x "*/tests/*" -x "*/migrations/*" -x "*/node_modules/*" -x "*/target/*" -x "*/dist/*"
        pass_filenames: false
        types_or: [rust, ts, tsx]

  # TypeScript — type checking
  - repo: local
    hooks:
      - id: tsc
        name: tsc
        language: system
        entry: bash -c 'cd mobile && npx tsc --noEmit'
        pass_filenames: false
        types_or: [ts, tsx]

  # TypeScript — fast tests
  - repo: local
    hooks:
      - id: jest-fast
        name: jest (fast tests)
        language: system
        entry: bash -c 'cd mobile && npx jest --testPathPattern="^(?!.*\.slow\.)" --passWithNoTests'
        pass_filenames: false
        types_or: [ts, tsx]

  # Changelog enforcement for feat/fix commits
  - repo: local
    hooks:
      - id: changelog-check
        name: changelog check
        language: system
        entry: bash -c '
          commit_msg=$(cat "$1");
          if echo "$commit_msg" | grep -qE "^(feat|fix)(\(.+\))?!?:"; then
            if ! git diff --cached --name-only | grep -q "CHANGELOG"; then
              echo "ERROR: feat/fix commits require CHANGELOG update";
              exit 1;
            fi;
          fi
        '
        args: [.git/COMMIT_EDITMSG]
        stages: [commit-msg]
        pass_filenames: false

ci:
  autofix_commit_msg: |
    [pre-commit.ci] auto fixes from pre-commit.com hooks
  autofix_prs: true
  autoupdate_schedule: weekly
```

## Hook Reference Quick Guide

### Language-Specific Hooks

| Language | Formatter | Linter | Complexity | Type Check | Testing |
|----------|-----------|--------|------------|------------|---------|
| Rust | `cargo fmt` | `cargo clippy` | lizard | N/A | `cargo test` |
| TypeScript | `prettier` | `eslint` | lizard | `tsc --noEmit` | `jest` |
| Python | `ruff format` | `ruff` | lizard | `mypy` | `pytest` |
| Go | `gofmt` | `golangci-lint` | lizard | `go vet` | `go test` |
| Shell | `shfmt` | `shellcheck` | N/A | N/A | N/A |
| Markdown | `markdownlint --fix` | `markdownlint` | N/A | N/A | N/A |
| JSON/YAML | `prettier` | `check-json/yaml` | N/A | N/A | N/A |

### Cross-Cutting Hooks

| Hook | Purpose | When to Use |
|------|---------|-------------|
| `codespell` | Typos in comments/docs | All projects |
| `sqlfluff` | SQL syntax and formatting | Projects with SQL files |
| `depcheck` | Unused Node.js dependencies | Node.js projects |
| `lizard` | Cyclomatic complexity | All projects |
| `gitleaks` | Secret scanning | All projects |

**Note:** Security checks (dependency audits, SAST, license compliance) belong in CI, not pre-commit. See section 6 for secret scanning which runs in pre-commit.

## Best Practices

1.  **Local hooks vs. Repository hooks**: Use local hooks (`language: system`) for tools already in the project's toolchain (e.g., `cargo`, `npm`, `go`). Use repository hooks for standalone tools.

2.  **Passing filenames**: Set `pass_filenames: false` when the tool needs to run at project level (e.g., `cargo clippy`, `tsc`).

3.  **Complexity threshold**: Start with `-C 15` and adjust based on your codebase. High-complexity functions are harder to test and maintain.

4.  **Exclusions**: Always exclude generated code, dependencies, and test files from complexity checks.

5.  **CI integration**: Add the `ci:` section to enable pre-commit.ci or similar services for automated fixes.

6.  **Keep hooks under 5 seconds**: Pre-commit runs on every commit. Slow hooks break developer flow. Move slow checks (full test suite, dependency audits) to CI.

7.  **Use `fail_fast` sparingly**: Only for critical hooks like commit message format. Most hooks should run to completion to show all issues.

8.  **Test before commit, not after**: Run fast tests in pre-commit, full suite in CI. This catches regressions early without blocking commits.

9.  **Security in layers**: Secret scanning (fast) in pre-commit, dependency audits and SAST (slow) in CI.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "lizard: command not found" | Install with `uv tool install lizard` |
| Conventional commit hook not firing | Ensure `stages: [commit-msg]` is set and run `pre-commit install --hook-type commit-msg` |
| Hook too slow | Add `files:` filter to only run on changed relevant files |
| Merge conflicts | Run `pre-commit run check-merge-conflict --all-files` |
| Warnings treated as errors | Add <code>&#124;&#124; true</code> to the entry for warnings-only hooks |
| Tests fail on unrelated changes | Use `files:` to scope test hooks to changed directories |
| Changelog check blocking WIP | Use `git commit --no-verify` to bypass |
| Coverage threshold too strict | Lower threshold or exclude specific files with `--cov-config` |
