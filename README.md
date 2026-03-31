---
name: skills
description: Agent skills for AI coding assistants.
---

# Skills

## Custom Skills

| Skill | Description |
|-------|-------------|
| **design-an-interface** | Generate multiple radically different interface designs for a module, then compare trade-offs. Based on "Design It Twice" principle. |
| **improve-codebase-architecture** | Explore a codebase to find architectural improvement opportunities, focusing on deepening shallow modules. Outputs as todos. |
| **init-pre-commit** | Initialize or augment `.pre-commit-config.yaml` with linting, formatting, security scanning, testing, cyclomatic complexity, and conventional commits hooks. Never overwrites existing hooks—only adds missing ones. |
| **prd-to-todos** | Break a PRD into independently-grabbable todos using tracer-bullet vertical slices. |
| **review-and-commit** | Review code against AGENTS.md conventions, verify compliance with project-specific guidelines, and organize commits following Conventional Commits format. |

### Attribution

| Skill | Inspiration |
|-------|-------------|
| design-an-interface | Inspired by [mattpocock/design-an-interface](https://github.com/mattpocock/skills) |
| improve-codebase-architecture | Inspired by [mattpocock/improve-codebase-architecture](https://github.com/mattpocock/skills) |
| init-pre-commit | Inspired by [mattpocock/setup-pre-commit](https://github.com/mattpocock/skills) |
| prd-to-todos | Inspired by [mattpocock/prd-to-issues](https://github.com/mattpocock/skills) |
| review-and-commit | Original |

## Installation

```bash
git clone git@github.com:rdghosal/agentish.git ~/code/agentish
ln -s ~/code/agentish/skills ~/.config/pi/agent/skills
```
