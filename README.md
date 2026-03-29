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

### Design & UI

| Skill | Description |
|-------|-------------|
| adapt | Adapt designs to work across different screen sizes, devices, contexts, or platforms |
| animate | Enhance with purposeful animations, micro-interactions, and motion effects |
| arrange | Improve layout, spacing, and visual rhythm |
| audit | Comprehensive audit of accessibility, performance, theming, and responsive design |
| bolder | Amplify safe or boring designs to make them more visually interesting |
| clarify | Improve unclear UX copy, error messages, microcopy, labels, and instructions |
| colorize | Add strategic color to features that lack visual interest |
| critique | Evaluate design effectiveness from a UX perspective with actionable feedback |
| delight | Add moments of joy, personality, and unexpected touches |
| distill | Strip designs to their essence by removing unnecessary complexity |
| extract | Extract and consolidate reusable components, design tokens, and patterns |
| frontend-design | Create distinctive, production-grade frontend interfaces with high design quality |
| harden | Improve interface resilience through better error handling and edge case management |
| normalize | Normalize design to match your design system and ensure consistency |
| onboard | Design or improve onboarding flows, empty states, and first-time user experiences |
| optimize | Improve interface performance across loading speed, rendering, and bundle size |
| overdrive | Push interfaces past conventional limits with technically ambitious implementations |
| polish | Final quality pass before shipping — fixes alignment, spacing, and consistency |
| quieter | Tone down overly bold or visually aggressive designs |
| teach-impeccable | One-time setup that gathers design context and saves it to your AI config |
| typeset | Improve typography by fixing font choices, hierarchy, and readability |

### Planning & Development

| Skill | Description |
|-------|-------------|
| design-an-interface | Generate multiple radically different interface designs |
| grill-me | Interview user relentlessly about a plan or design |
| improve-codebase-architecture | Find architectural improvement opportunities |
| init-pre-commit | Initialize pre-commit configuration with linting, formatting, complexity checks |
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
