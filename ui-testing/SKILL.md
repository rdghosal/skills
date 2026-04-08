---
name: ui-testing
description: Validates UI components and browser extensions using Playwright. Runs accessibility audits, checks design token compliance, validates extension manifests, and generates functional tests. Use when building UI components, browser extensions, or when the user mentions accessibility, design compliance, or UI testing.
---

# UI Testing

Validate UI components and browser extensions during development. Generates functional and regression tests that become part of the project's test suite.

## Setup

First-time setup requires mcporter and Playwright:

```bash
# Install mcporter globally
npm install -g mcporter

# Generate Playwright client
npx mcporter emit-ts @microsoft/playwright-mcp --mode client --out tests/playwright-client.ts

# Install Playwright browsers
npx playwright install

# Install axe-core for accessibility testing
npm install -D @axe-core/playwright
```

## Workflow

1. **Identify what to validate** — infer from context (recent files, current task) or ask user
2. **Choose validation type** — accessibility, design tokens, functional, or extension-specific
3. **Run validation** — use Playwright client or utility scripts
4. **Review results** — pass/fail report with fix suggestions
5. **Write regression test** — output `.test.ts` to project test directory
6. **Re-run if fixes applied** — validation loop until passing

## Validation Types

| Type | When to Use | Reference |
|------|-------------|-----------|
| Accessibility | Any UI component or page | [references/accessibility.md](references/accessibility.md) |
| Design tokens | UI with `.impeccable.md` in project | [references/design-tokens.md](references/design-tokens.md) |
| Functional | Interactive components, forms, flows | [references/functional-testing.md](references/functional-testing.md) |
| Extensions | Browser extension popups, content scripts | [references/extensions.md](references/extensions.md) |

## Utility Scripts

| Script | Purpose |
|--------|---------|
| `scripts/run-axe.ts` | Run axe-core accessibility audit |
| `scripts/validate-manifest.ts` | Validate extension manifest.json |
| `scripts/check-tokens.ts` | Compare computed styles against design tokens |

## Output Format

Validation returns structured results:

```
PASS: accessibility (0 violations)
FAIL: design-tokens (2 mismatches)
  - Button uses #3b82f6, expected var(--color-primary)
  - Spacing uses 12px, expected var(--spacing-md)

Suggested fixes:
  - Replace hardcoded color with var(--color-primary)
  - Replace 12px with var(--spacing-md)
```

Console errors and warnings are included only when relevant.

## Quick Start Examples

**Validate a component:**
```typescript
import { createPlaywrightClient } from './tests/playwright-client';

const client = await createPlaywrightClient();
await client.browser_navigate({ url: 'http://localhost:3000' });

// Run accessibility audit
const axeResults = await runAxe(client.page);
console.log(axeResults.violations);
```

**Validate an extension:**
```typescript
import { chromium } from 'playwright';

const browser = await chromium.launchPersistentContext('', {
  args: [`--load-extension=${extensionPath}`]
});

// Open extension popup
const page = await browser.newPage();
await page.goto(`chrome-extension://${extensionId}/popup.html`);
```

See reference files for detailed workflows and script usage.
