---
name: skills
description: Index of all available agent skills. Browse to discover capabilities for planning, development, and tooling.
---

# Skills

Agent skills for AI coding assistants.

## Installation

### Clone and symlink (recommended for personal use)
```bash
git clone git@github.com:rdghosal/skills.git ~/code/skills
ln -s ~/code/skills ~/.config/pi/agent/skills
ln -s ~/code/skills ~/.config/opencode/skills
```

### As an NPM Package
```bash
npm install @rdghosal/skills
```

## Skills

| Skill | Description |
|-------|-------------|
| design-an-interface | Generate multiple radically different interface designs |
| grill-me | Interview user relentlessly about a plan or design |
| improve-codebase-architecture | Find architectural improvement opportunities |
| prd-to-plan | Turn a PRD into a multi-phase implementation plan |
| prd-to-todos | Break a PRD into independently-grabbable todos |
| review-and-commit | Review code and organize commits |
| tdd | Test-driven development with red-green-refactor loop |
| tmux | Remote control tmux sessions |
| update-changelog | Update changelogs following conventions |
| uv | Use uv instead of pip/python/venv |
| write-a-prd | Create a PRD through user interview |

## Development

Install pre-commit hooks:
```bash
pre-commit install
pre-commit run --all-files
```
