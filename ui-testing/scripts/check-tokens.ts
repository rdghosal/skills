/**
 * Compare computed styles against design tokens from .impeccable.md.
 *
 * Usage:
 *   npx tsx scripts/check-tokens.ts <url> <impeccable-path>
 *   npx tsx scripts/check-tokens.ts http://localhost:3000 ./.impeccable.md
 *
 * Or import programmatically:
 *   import { checkTokens } from './scripts/check-tokens';
 *   const mismatches = await checkTokens(page, './.impeccable.md');
 */

import { chromium, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface DesignToken {
  name: string;
  cssVar: string;
  value: string;
  category: 'color' | 'spacing' | 'typography' | 'shadow' | 'radius';
}

interface TokenMismatch {
  element: string;
  property: string;
  actual: string;
  expected: string;
  cssVar: string;
}

interface TokenResults {
  matches: number;
  mismatches: TokenMismatch[];
  url: string;
}

/**
 * Parse .impeccable.md to extract design tokens.
 * This is a simplified parser - adjust based on your .impeccable.md format.
 */
function parseImpeccable(content: string): DesignToken[] {
  const tokens: DesignToken[] = [];

  // Common patterns in .impeccable.md
  // This parser looks for CSS variable definitions
  const cssVarPattern = /--([a-z-]+):\s*([^;]+);/g;

  let match;
  while ((match = cssVarPattern.exec(content)) !== null) {
    const name = match[1];
    const value = match[2].trim();

    // Categorize token
    let category: DesignToken['category'] = 'color';
    if (name.includes('spacing') || name.includes('padding') || name.includes('margin') || name.includes('gap')) {
      category = 'spacing';
    } else if (name.includes('font') || name.includes('text')) {
      category = 'typography';
    } else if (name.includes('shadow')) {
      category = 'shadow';
    } else if (name.includes('radius') || name.includes('border')) {
      category = 'radius';
    }

    tokens.push({
      name,
      cssVar: `--${name}`,
      value,
      category
    });
  }

  return tokens;
}

/**
 * Convert RGB string to hex.
 */
function rgbToHex(rgb: string): string {
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return rgb;

  const r = parseInt(match[1]).toString(16).padStart(2, '0');
  const g = parseInt(match[2]).toString(16).padStart(2, '0');
  const b = parseInt(match[3]).toString(16).padStart(2, '0');

  return `#${r}${g}${b}`;
}

/**
 * Check if a value matches a token (with some flexibility).
 */
function matchesToken(value: string, tokenValue: string): boolean {
  // Normalize values
  const normalizedValue = value.toLowerCase().trim();
  const normalizedToken = tokenValue.toLowerCase().trim();

  // Direct match
  if (normalizedValue === normalizedToken) return true;

  // Color comparison (hex vs rgb)
  if (normalizedValue.startsWith('#') || normalizedValue.startsWith('rgb')) {
    const valueHex = normalizedValue.startsWith('rgb') ? rgbToHex(normalizedValue) : normalizedValue;
    const tokenHex = normalizedToken.startsWith('rgb') ? rgbToHex(normalizedToken) : normalizedToken;
    return valueHex === tokenHex;
  }

  // Spacing comparison (px values)
  if (normalizedValue.endsWith('px') && normalizedToken.endsWith('px')) {
    return normalizedValue === normalizedToken;
  }

  return false;
}

/**
 * Check computed styles against design tokens.
 */
export async function checkTokens(page: Page, impeccablePath: string): Promise<TokenResults> {
  // Read and parse .impeccable.md
  const fullPath = path.resolve(impeccablePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`.impeccable.md not found: ${fullPath}`);
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  const tokens = parseImpeccable(content);

  // Get all elements with inline styles or classes
  const mismatches: TokenMismatch[] = [];
  let matches = 0;

  // Check common elements
  const elements = await page.locator('button, input, select, textarea, a, h1, h2, h3, h4, h5, h6, p, div, span').all();

  for (const element of elements.slice(0, 50)) { // Limit to first 50 elements
    const tagName = await element.evaluate(el => el.tagName.toLowerCase());
    const classes = await element.evaluate(el => el.className);

    // Get computed styles
    const styles = await element.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        backgroundColor: computed.backgroundColor,
        color: computed.color,
        padding: computed.padding,
        margin: computed.margin,
        fontSize: computed.fontSize,
        fontFamily: computed.fontFamily,
        borderRadius: computed.borderRadius
      };
    });

    // Check each style against tokens
    const styleEntries = Object.entries(styles);

    for (const [property, value] of styleEntries) {
      // Skip if value is default/empty
      if (!value || value === 'none' || value === 'transparent' || value === 'rgba(0, 0, 0, 0)') {
        continue;
      }

      // Check if value matches any token
      const matchingToken = tokens.find(t => matchesToken(value, t.value));

      if (!matchingToken) {
        // Check if this looks like a hardcoded value that should be a token
        const isHardcodedColor = value.startsWith('#') || value.startsWith('rgb');
        const isHardcodedSpacing = /^\d+px$/.test(value) && !value.startsWith('0');

        if (isHardcodedColor || isHardcodedSpacing) {
          // Find the closest token
          const category = isHardcodedColor ? 'color' : 'spacing';
          const categoryTokens = tokens.filter(t => t.category === category);

          // Suggest the closest token (simplified - just pick first of category)
          const suggestedToken = categoryTokens[0];

          if (suggestedToken) {
            mismatches.push({
              element: `${tagName}.${classes.split(' ')[0] || tagName}`,
              property,
              actual: value,
              expected: `var(${suggestedToken.cssVar})`,
              cssVar: suggestedToken.cssVar
            });
          }
        }
      } else {
        matches++;
      }
    }
  }

  return {
    matches,
    mismatches: mismatches.slice(0, 20), // Limit output
    url: page.url()
  };
}

/**
 * Format results for console output.
 */
function formatResults(results: TokenResults): string {
  const lines: string[] = [];

  lines.push(`\nDesign Token Compliance: ${results.url}`);
  lines.push('='.repeat(50));

  if (results.mismatches.length === 0) {
    lines.push('\n✓ All checked elements use design tokens');
    lines.push(`  Matches: ${results.matches}`);
  } else {
    lines.push(`\n✗ ${results.mismatches.length} hardcoded value(s) found:\n`);

    for (const mismatch of results.mismatches) {
      lines.push(`FAIL: ${mismatch.element}`);
      lines.push(`  Property: ${mismatch.property}`);
      lines.push(`  Actual: ${mismatch.actual}`);
      lines.push(`  Expected: ${mismatch.expected}`);
      lines.push('');
    }

    lines.push('Suggested fixes:');
    for (const mismatch of results.mismatches) {
      lines.push(`  - Replace ${mismatch.actual} with ${mismatch.expected}`);
    }
  }

  return lines.join('\n');
}

// CLI entry point
async function main() {
  const url = process.argv[2];
  const impeccablePath = process.argv[3];

  if (!url || !impeccablePath) {
    console.error('Usage: npx tsx scripts/check-tokens.ts <url> <impeccable-path>');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    const results = await checkTokens(page, impeccablePath);

    console.log(formatResults(results));

    await browser.close();

    // Exit with error code if mismatches found
    process.exit(results.mismatches.length > 0 ? 1 : 0);
  } catch (error) {
    console.error('Error checking tokens:', error);
    await browser.close();
    process.exit(1);
  }
}

// Run CLI if executed directly
if (require.main === module) {
  main();
}
