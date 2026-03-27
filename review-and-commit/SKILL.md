---
name: review-and-commit
description: Review code against AGENTS.md conventions, verify compliance with project-specific guidelines, and organize commits following Conventional Commits format. Use when preparing to commit changes, finalizing work, or ensuring code meets project standards before committing.
---

# Review and Commit Skill

Use this skill when the user asks to review code, prepare for commit, organize commits, or finalize work before committing.

## Instructions

### Step 1: Load and Review AGENTS.md

Read the project's `AGENTS.md` file at the repository root. This contains:

- Project structure (api/, mobile/)
- Design context rules (reference to .impeccable.md)
- Coding conventions (conventions-rust.md for Rust, conventions-ts.md for TypeScript)
- Commit message guidelines (Conventional Commits)
- Cross-cutting rules

If AGENTS.md is missing critical information or contains outdated guidance, suggest updates to it before proceeding.

### Step 2: Review Code Against Conventions

For each modified or new file:

1.  **Identify the language**: Check file extension (.rs → Rust, .ts/.tsx → TypeScript)

2.  **Load the relevant conventions file**:

    - Working in `api/` or `.rs` files → read `docs/conventions-rust.md`
    - Working in `mobile/` or `.ts/.tsx` files → read `docs/conventions-ts.md`

3.  **Check compliance**:

    - Function size and single-purpose design
    - Comments explain _why_, not _what_
    - Explicit over implicit (types, intent)
    - No debug logs, dead code, or TODOs without explanation
    - Dependency additions have clear purpose documented

### Step 3: Check for UI/Design Work

If changes involve screens, components, or styles:

1.  Read `.impeccable.md` for design context
2.  Verify changes align with the five design principles
3.  Ensure the target audience and brand personality are respected

### Step 4: Organize Commits per Conventional Commits

Group changes into logical commits following this format:

```
<type>(<scope>)[!]: <short summary>

[optional body]

[optional footers]
```

**Types to use:**

- `feat` — New features/endpoints visible to users
- `fix` — Bug fixes
- `chore` — Maintenance (deps, config, migrations with no logic change)
- `refactor` — Code changes that neither fix bugs nor add features
- `docs` — Documentation only
- `test` — Adding/updating tests
- `perf` — Performance improvements

**Scopes to use:**

- `api` — Rust backend changes
- `db` — Database/schema changes
- `mobile` — React Native app changes
- `quiz`, `vocabulary`, `sentences`, `stories`, `levels` — Feature domains
- `deps` — Dependency updates

**Rules:**

- Summary: imperative mood, no trailing period, max 72 chars
- Body: explain _why_, not _what_, wrap at 100 chars
- Breaking changes: append `!` after scope AND add `BREAKING CHANGE:` footer

### Step 5: Propose Commit Organization

Present the user with:

1.  A summary of convention violations found (if any)
2.  Suggested AGENTS.md updates (if needed)
3.  A proposed commit structure with:

- Commit message for each logical group
- Files included in each commit
- Brief rationale for the organization

**Example output:**

```
Proposed Commits:

1. feat(api): add user progress tracking endpoint
   - api/src/routes/progress.rs
   - api/src/models/progress.rs
   Rationale: New feature exposing progress data to consumers

2. refactor(api): extract progress calculation logic
   - api/src/services/progress.rs
   - api/src/routes/progress.rs
   Rationale: Single-purpose functions, clearer separation of concerns

3. chore(deps): add chrono for date handling
   - api/Cargo.toml
   - api/Cargo.lock
   Rationale: Required for progress history timestamps
```

### Step 6: Wait for Confirmation

Do not execute `git commit` commands. Present the plan and wait for user confirmation or modifications.
