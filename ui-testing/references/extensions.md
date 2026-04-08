# Browser Extension Testing

Test browser extension UI (popups, options pages) and validate extension code (manifest, content scripts).

## Contents
- Loading extensions in Playwright
- Testing popup and options pages
- Content script injection
- Manifest validation
- Common issues

## Loading Extensions

Use `launchPersistentContext` with the `--load-extension` flag:

```typescript
import { chromium } from 'playwright';
import path from 'path';

const extensionPath = path.resolve('./my-extension');

const browser = await chromium.launchPersistentContext('', {
  headless: false, // Extensions require headed mode
  args: [
    `--load-extension=${extensionPath}`,
    '--disable-extensions-except=' + extensionPath
  ]
});
```

**Note:** Browser extensions require headed mode. Headless testing is not supported.

## Getting Extension ID

After loading, retrieve the extension ID:

```typescript
// Navigate to extensions page
const page = await browser.newPage();
await page.goto('chrome://extensions');

// Enable developer mode
await page.locator('#dev-mode').check();

// Get extension ID from the page
const extensionId = await page.locator('.extension-id').first().textContent();
```

## Testing Popup UI

Navigate to the extension popup URL:

```typescript
const popupPage = await browser.newPage();
await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);

// Test popup interactions
await popupPage.locator('#enable-feature').click();
await expect(popupPage.locator('.status')).toHaveText('Enabled');
```

## Testing Options Page

Extensions with options pages:

```typescript
const optionsPage = await browser.newPage();
await optionsPage.goto(`chrome-extension://${extensionId}/options.html`);

// Test settings persistence
await optionsPage.locator('#theme').selectOption('dark');
await optionsPage.locator('#save').click();

// Reload and verify
await optionsPage.reload();
await expect(optionsPage.locator('#theme')).toHaveValue('dark');
```

## Content Script Injection

Test that content scripts inject correctly on matching pages:

```typescript
// Navigate to a page matching content_scripts matches pattern
const page = await browser.newPage();
await page.goto('https://example.com');

// Wait for content script to inject
await page.waitForSelector('.extension-injected-element');

// Verify DOM manipulation
const injectedElement = await page.locator('.extension-injected-element');
await expect(injectedElement).toBeVisible();

// Verify CSS applied
const styles = await injectedElement.evaluate(el => window.getComputedStyle(el));
expect(styles.backgroundColor).toBe('rgb(0, 0, 0)');
```

## Manifest Validation

Use `scripts/validate-manifest.ts` to check manifest.json:

```bash
npx tsx scripts/validate-manifest.ts <manifest-path>
```

**Output:**
```
PASS: manifest_version (3)
PASS: name
PASS: version
FAIL: permissions
  - "tabs" permission requires justification in manifest
FAIL: content_security_policy
  - CSP blocks inline scripts but allows 'unsafe-eval'
```

**Required fields (Manifest V3):**
- `manifest_version`: Must be 3
- `name`: Extension name
- `version`: Version string (e.g., "1.0.0")

**Common validation rules:**
- Permissions must be minimal and justified
- CSP must not allow `unsafe-inline` or `unsafe-eval`
- Host permissions must match content script matches
- Background service worker must be specified (not background page)

## Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Extension not loading | Invalid manifest | Run manifest validation |
| Popup not opening | Missing `default_popup` | Add to `action` in manifest |
| Content script not injecting | `matches` pattern wrong | Check URL matches pattern |
| CSP errors | Inline scripts blocked | Move scripts to separate files |
| Storage not persisting | Missing `storage` permission | Add to `permissions` array |
| Cross-origin requests blocked | Missing host permissions | Add to `host_permissions` |

## Workflow

1. Validate manifest.json with `scripts/validate-manifest.ts`
2. Load extension in Playwright persistent context
3. Test popup/options UI interactions
4. Navigate to matching pages to test content script injection
5. Verify DOM manipulation and CSS application
6. Write regression tests for critical extension behavior

**Example regression test:**
```typescript
// tests/extension-popup.test.ts
import { test, expect } from '@playwright/test';

test('extension popup toggles feature', async () => {
  const browser = await chromium.launchPersistentContext('', {
    args: [`--load-extension=${extensionPath}`]
  });

  const popup = await browser.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);

  await popup.locator('#toggle').click();
  await expect(popup.locator('.status')).toHaveText('Enabled');

  await browser.close();
});
```
