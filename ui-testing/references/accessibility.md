# Accessibility Testing

Run automated accessibility audits using axe-core, plus keyboard navigation and color contrast checks.

## Contents
- axe-core audit
- Keyboard navigation
- Color contrast
- Common violations and fixes

## axe-core Audit

Use `scripts/run-axe.ts` for automated accessibility scanning:

```bash
npx tsx scripts/run-axe.ts <url>
```

**Output:**
```json
{
  "violations": [
    {
      "id": "color-contrast",
      "impact": "serious",
      "description": "Elements must have sufficient color contrast",
      "nodes": [{ "html": "<button>Submit</button>", "target": ["button"] }]
    }
  ],
  "passes": 42,
  "incomplete": 0
}
```

**Programmatic usage:**
```typescript
import { runAxe } from './scripts/run-axe';

const results = await runAxe(page);
if (results.violations.length > 0) {
  console.log('Accessibility violations:', results.violations);
}
```

## Keyboard Navigation

Test focus order and visibility:

```typescript
// Tab through focusable elements
const focusable = await page.locator('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])').all();

for (const element of focusable) {
  await page.keyboard.press('Tab');
  const focused = await page.evaluateHandle(() => document.activeElement);

  // Verify focus is visible
  const isVisible = await focused.evaluate(el => {
    const style = window.getComputedStyle(el);
    return style.outline !== 'none' || style.boxShadow !== 'none';
  });

  if (!isVisible) {
    console.log('Focus indicator missing on:', await element.evaluate(el => el.tagName));
  }
}
```

**Common issues:**
- Focus outline removed without replacement
- Skip links missing
- Modal focus trap broken
- Tab order doesn't match visual order

## Color Contrast

Check WCAG AA compliance (4.5:1 for normal text, 3:1 for large text):

```typescript
// Extract computed colors
const contrastCheck = await page.evaluate(() => {
  const el = document.querySelector('button');
  const style = window.getComputedStyle(el);
  return {
    foreground: style.color,
    background: style.backgroundColor
  };
});

// Calculate contrast ratio (simplified)
function getLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map(c => c / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(fg: [number, number, number], bg: [number, number, number]): number {
  const l1 = getLuminance(fg);
  const l2 = getLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
```

## Common Violations and Fixes

| Violation | Fix |
|-----------|-----|
| `color-contrast` | Increase contrast ratio to 4.5:1 (AA) or 7:1 (AAA) |
| `image-alt` | Add `alt` attribute to images |
| `label` | Associate form controls with labels |
| `button-name` | Add text content or `aria-label` to buttons |
| `aria-allowed-attr` | Use correct ARIA attributes for role |
| `aria-hidden-focus` | Don't hide focusable elements with `aria-hidden` |
| `region` | Add landmark regions (main, nav, aside) |
| `skip-link` | Add skip navigation link |

## Workflow

1. Run axe-core audit on page/component
2. Review violations by impact (critical > serious > moderate > minor)
3. Fix violations in code
4. Re-run audit to verify fixes
5. Write regression test for critical accessibility requirements

**Example regression test:**
```typescript
// tests/accessibility.test.ts
import { test, expect } from '@playwright/test';
import { runAxe } from '../scripts/run-axe';

test('login page has no accessibility violations', async ({ page }) => {
  await page.goto('/login');
  const results = await runAxe(page);
  expect(results.violations).toHaveLength(0);
});
```
