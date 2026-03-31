---
name: skills
description: Agent skills for Pi coding agent.
---

# Agent Skills

## Custom Skills

| Skill | Description |
|-------|-------------|
| **init-pre-commit** | Initialize or augment `.pre-commit-config.yaml` with linting, formatting, security scanning, testing, cyclomatic complexity, and conventional commits hooks. Never overwrites existing hooks—only adds missing ones. |
| **prd-to-todos** | Break a PRD into independently-grabbable Pi todos using tracer-bullet vertical slices. Outputs to Pi's todo system instead of GitHub issues. |
| **review-and-commit** | Review code against AGENTS.md conventions, verify compliance with project-specific guidelines, and organize commits following Conventional Commits format. |

### Attribution

| Skill | Inspiration |
|-------|-------------|
| init-pre-commit | Inspired by [mattpocock/setup-pre-commit](https://github.com/mattpocock/skills) |
| prd-to-todos | Inspired by [mattpocock/prd-to-issues](https://github.com/mattpocock/skills) |
| review-and-commit | Original |

## Installation

```bash
git clone git@github.com:rdghosal/agentish.git ~/code/agentish
ln -s ~/code/agentish/skills ~/.config/pi/agent/skills
```
