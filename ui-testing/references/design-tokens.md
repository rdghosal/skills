# Design Token Compliance

Validate that UI components use design tokens from `.impeccable.md` instead of hardcoded values.

## Contents
- Token extraction
- Computed style comparison
- Common mismatches
- Manual review workflow

## Token Extraction

Parse `.impeccable.md` to extract design tokens:

```typescript
// scripts/check-tokens.ts extracts tokens from .impeccable.md
interface DesignToken {
  name: string;
  cssVar: string;
  value: string;
  category: 'color' | 'spacing' | 'typography' | 'shadow' | 'radius';
}

// Example tokens from .impeccable.md:
const tokens: DesignToken[] = [
  { name: 'primary', cssVar: '--color-primary', value: '#3b82f6', category: 'color' },
  { name: 'md', cssVar: '--spacing-md', value: '16px', category: 'spacing' },
  { name: 'body', cssVar: '--font-body', value: 'Inter, sans-serif', category: 'typography' }
];
```

## Computed Style Comparison

Compare rendered styles against expected tokens:

```bash
npx tsx scripts/check-tokens.ts <url> <impeccable-path>
```

**Output:**
```
PASS: Button background uses var(--color-primary)
FAIL: Card padding uses 12px, expected var(--spacing-md)
FAIL: Heading font uses "Arial", expected var(--font-heading)

Suggested fixes:
  - Replace padding: 12px with padding: var(--spacing-md)
  - Replace font-family: "Arial" with font-family: var(--font-heading)
```

**Programmatic usage:**
```typescript
import { checkTokens } from './scripts/check-tokens';

const mismatches = await checkTokens(page, './.impeccable.md');

for (const mismatch of mismatches) {
  console.log(`${mismatch.element}: uses ${mismatch.actual}, expected ${mismatch.expected}`);
}
```

## Token Categories

### Colors

Check that color values match token definitions:

```typescript
const colorTokens = [
  { cssVar: '--color-primary', value: '#3b82f6' },
  { cssVar: '--color-secondary', value: '#64748b' },
  { cssVar: '--color-background', value: '#ffffff' },
  { cssVar: '--color-text', value: '#1e293b' }
];

// Extract computed color
const computedColor = await element.evaluate(el => {
  return window.getComputedStyle(el).backgroundColor;
});

// Convert to hex and compare
const hexColor = rgbToHex(computedColor);
const matchingToken = colorTokens.find(t => t.value === hexColor);
```

### Spacing

Verify spacing uses token values:

```typescript
const spacingTokens = [
  { cssVar: '--spacing-xs', value: '4px' },
  { cssVar: '--spacing-sm', value: '8px' },
  { cssVar: '--spacing-md', value: '16px' },
  { cssVar: '--spacing-lg', value: '24px' }
];

// Check padding, margin, gap
const padding = await element.evaluate(el => window.getComputedStyle(el).padding);
```

### Typography

Validate font families, sizes, weights:

```typescript
const typographyTokens = [
  { cssVar: '--font-body', value: 'Inter, sans-serif' },
  { cssVar: '--font-heading', value: 'Inter, sans-serif' },
  { cssVar: '--text-sm', value: '14px' },
  { cssVar: '--text-base', value: '16px' }
];
```

## Common Mismatches

| Hardcoded Value | Token | Fix |
|-----------------|-------|-----|
| `#3b82f6` | `var(--color-primary)` | Replace hex with CSS variable |
| `12px` (padding) | `var(--spacing-sm)` | Use spacing token |
| `16px` (font-size) | `var(--text-base)` | Use typography token |
| `8px` (border-radius) | `var(--radius-sm)` | Use radius token |
| `0 4px 6px rgba(0,0,0,0.1)` | `var(--shadow-sm)` | Use shadow token |

## Manual Review Workflow

When automated comparison isn't sufficient:

1. **Capture screenshot** of the component
2. **Compare to design reference** (Figma, design file, or previous snapshot)
3. **Document discrepancies** in structured format
4. **Provide fix suggestions** based on design intent

**When manual review is needed:**
- Complex gradients or patterns
- Animation timing
- Responsive breakpoint behavior
- Interaction states (hover, focus, active)

## Workflow

1. Run `scripts/check-tokens.ts` against the page/component
2. Review mismatches by category (color, spacing, typography)
3. Fix hardcoded values in code
4. Re-run token check to verify fixes
5. For complex cases, capture screenshot for manual review
6. Write regression test for token compliance

**Example regression test:**
```typescript
// tests/design-tokens.test.ts
import { test, expect } from '@playwright/test';
import { checkTokens } from '../scripts/check-tokens';

test('button uses design tokens', async ({ page }) => {
  await page.goto('/components/button');

  const mismatches = await checkTokens(page, './.impeccable.md');
  const buttonMismatches = mismatches.filter(m => m.element.includes('button'));

  expect(buttonMismatches).toHaveLength(0);
});
```
