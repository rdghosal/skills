/**
 * Run axe-core accessibility audit on a page.
 *
 * Usage:
 *   npx tsx scripts/run-axe.ts <url>
 *   npx tsx scripts/run-axe.ts http://localhost:3000
 *
 * Or import programmatically:
 *   import { runAxe } from './scripts/run-axe';
 *   const results = await runAxe(page);
 */

import { chromium, Page } from 'playwright';

interface AxeViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{
    html: string;
    target: string[];
    failureSummary: string;
  }>;
}

interface AxeResults {
  violations: AxeViolation[];
  passes: number;
  incomplete: number;
  url: string;
}

/**
 * Run axe-core accessibility audit on a Playwright page.
 */
export async function runAxe(page: Page): Promise<AxeResults> {
  // Inject axe-core
  await page.addScriptTag({
    path: require.resolve('axe-core/axe.min.js')
  });

  // Run axe
  const results = await page.evaluate(async () => {
    // @ts-ignore - axe is injected
    const results = await axe.run();
    return {
      violations: results.violations.map((v: any) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        help: v.help,
        helpUrl: v.helpUrl,
        nodes: v.nodes.map((n: any) => ({
          html: n.html,
          target: n.target,
          failureSummary: n.failureSummary
        }))
      })),
      passes: results.passes.length,
      incomplete: results.incomplete.length
    };
  });

  return {
    ...results,
    url: page.url()
  };
}

/**
 * Format axe results for console output.
 */
function formatResults(results: AxeResults): string {
  const lines: string[] = [];

  lines.push(`\nAccessibility Audit: ${results.url}`);
  lines.push('='.repeat(50));

  if (results.violations.length === 0) {
    lines.push('\n✓ No accessibility violations found');
    lines.push(`  Passes: ${results.passes}, Incomplete: ${results.incomplete}`);
  } else {
    lines.push(`\n✗ ${results.violations.length} violation(s) found:\n`);

    for (const violation of results.violations) {
      const impact = violation.impact.toUpperCase().padEnd(10);
      lines.push(`[${impact}] ${violation.id}`);
      lines.push(`  ${violation.description}`);
      lines.push(`  Help: ${violation.helpUrl}`);
      lines.push(`  Affected nodes: ${violation.nodes.length}`);

      for (const node of violation.nodes.slice(0, 3)) {
        lines.push(`    - ${node.target.join(' > ')}`);
      }

      if (violation.nodes.length > 3) {
        lines.push(`    ... and ${violation.nodes.length - 3} more`);
      }

      lines.push('');
    }
  }

  return lines.join('\n');
}

/**
 * Suggest fixes for common violations.
 */
function suggestFixes(results: AxeResults): string[] {
  const suggestions: string[] = [];

  for (const violation of results.violations) {
    switch (violation.id) {
      case 'color-contrast':
        suggestions.push('Increase color contrast to at least 4.5:1 for normal text, 3:1 for large text');
        break;
      case 'image-alt':
        suggestions.push('Add alt attribute to all images: <img alt="description" />');
        break;
      case 'label':
        suggestions.push('Associate form controls with labels: <label for="input-id">Label</label>');
        break;
      case 'button-name':
        suggestions.push('Add text or aria-label to buttons: <button aria-label="Save">...</button>');
        break;
      case 'aria-allowed-attr':
        suggestions.push('Use only ARIA attributes allowed for the element\'s role');
        break;
      case 'region':
        suggestions.push('Add landmark regions: <main>, <nav>, <aside>, <header>, <footer>');
        break;
      case 'skip-link':
        suggestions.push('Add a skip link at the top of the page: <a href="#main" class="skip-link">Skip to main</a>');
        break;
    }
  }

  return [...new Set(suggestions)]; // Dedupe
}

// CLI entry point
async function main() {
  const url = process.argv[2];

  if (!url) {
    console.error('Usage: npx tsx scripts/run-axe.ts <url>');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    const results = await runAxe(page);

    console.log(formatResults(results));

    if (results.violations.length > 0) {
      const suggestions = suggestFixes(results);
      if (suggestions.length > 0) {
        console.log('\nSuggested fixes:');
        for (const suggestion of suggestions) {
          console.log(`  - ${suggestion}`);
        }
      }
    }

    await browser.close();

    // Exit with error code if violations found
    process.exit(results.violations.length > 0 ? 1 : 0);
  } catch (error) {
    console.error('Error running axe:', error);
    await browser.close();
    process.exit(1);
  }
}

// Run CLI if executed directly
if (require.main === module) {
  main();
}
