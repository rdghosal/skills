---
name: init-pre-commit
description: Initialize pre-commit configuration for a project by analyzing existing files or asking about expected technologies. Creates .pre-commit-config.yaml with linting, formatting, cyclomatic complexity, and conventional commits hooks.
---

# Initialize Pre-Commit Configuration

Initialize a `.pre-commit-config.yaml` for the current project by either analyzing existing files to detect technologies, or asking the user what languages/frameworks are expected. Creates a comprehensive configuration covering linting, formatting, cyclomatic complexity checks, and conventional commits.

## When to Use

- Setting up a new project
- Adding pre-commit to an existing project without pre-commit configuration
- Standardizing code quality checks across a team
- Ensuring conventional commits compliance

## Process

### 1. Check for Existing Configuration

First, check if `.pre-commit-config.yaml` already exists in the project root:

```bash
ls -la .pre-commit-config.yaml 2>/dev/null || echo "No pre-commit config found"
```

If it exists, **ask the user if they want to overwrite it or skip**.

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

### 4. Generate Pre-Commit Configuration

Create a `.pre-commit-config.yaml` based on detected/confirmed technologies. Include these **core hooks for all projects**:

#### Core Configuration (Always Include)

```yaml
repos:
  # Conventional commit message format
  - repo: https://github.com/compilerla/conventional-pre-commit
    rev: v4.0.0
    hooks:
      - id: conventional-pre-commit
        stages: [commit-msg]

  # General file hygiene
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
      # Syntax validation for common config formats
      - id: check-json
      - id: check-yaml
      - id: check-toml
      # Line ending and encoding consistency
      - id: mixed-line-ending
      - id: fix-byte-order-marker
      # Prevent accidental submodule additions
      - id: forbid-new-submodules

  # Alternative: Gitleaks for more comprehensive secret scanning
  # - repo: https://github.com/gitleaks/gitleaks
  #   rev: v8.23.3
  #   hooks:
  #     - id: gitleaks

  # Protect main/master branches from direct commits (optional but recommended for teams)
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v5.0.0
    hooks:
      - id: no-commit-to-branch
        args: [--branch, main, --branch, master]
```

### 5. Add Language-Specific Hooks

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

### 6. Add Cyclomatic Complexity Checks

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

### 7. Additional Maintainability Hooks (Optional)

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

### 8. Install and Test

After creating the configuration, instruct the user to:

```bash
# Install pre-commit hooks
pre-commit install
pre-commit install --hook-type commit-msg

# Test on all files
pre-commit run --all-files
```

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

ci:
  autofix_commit_msg: |
    [pre-commit.ci] auto fixes from pre-commit.com hooks
  autofix_prs: true
  autoupdate_schedule: weekly
```

## Hook Reference Quick Guide

| Language | Formatter | Linter | Complexity | Type Check |
|----------|-----------|--------|------------|------------|
| Rust | `cargo fmt` | `cargo clippy` | lizard | N/A |
| TypeScript | `prettier` | `eslint` | lizard | `tsc --noEmit` |
| Python | `ruff format` | `ruff` | lizard | `mypy` |
| Go | `gofmt` | `golangci-lint` | lizard | `go vet` |
| Shell | `shfmt` | `shellcheck` | N/A | N/A |
| Markdown | `markdownlint --fix` | `markdownlint` | N/A | N/A |
| JSON/YAML | `prettier` | `check-json/yaml` | N/A | N/A |

## Best Practices

1.  **Local hooks vs. Repository hooks**: Use local hooks (`language: system`) for tools already in the project's toolchain (e.g., `cargo`, `npm`, `go`). Use repository hooks for standalone tools.

2.  **Passing filenames**: Set `pass_filenames: false` when the tool needs to run at project level (e.g., `cargo clippy`, `tsc`).

3.  **Complexity threshold**: Start with `-C 15` and adjust based on your codebase. High-complexity functions are harder to test and maintain.

4.  **Exclusions**: Always exclude generated code, dependencies, and test files from complexity checks.

5.  **CI integration**: Add the `ci:` section to enable pre-commit.ci or similar services for automated fixes.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "lizard: command not found" | Install with `uv tool install lizard` |
| Conventional commit hook not firing | Ensure `stages: [commit-msg]` is set and run `pre-commit install --hook-type commit-msg` |
| Hook too slow | Add `files:` filter to only run on changed relevant files |
| Merge conflicts | Run `pre-commit run check-merge-conflict --all-files` |
| Warnings treated as errors | Add <code>&#124;&#124; true</code> to the entry for warnings-only hooks |
