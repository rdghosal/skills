# Functional Testing

Interact with UI components and verify expected behavior. Generate regression tests that become part of the project's test suite.

## Contents
- Interaction patterns
- Assertions
- Test structure
- Common scenarios

## Interaction Patterns

### Click and verify

```typescript
await page.locator('#submit-button').click();
await expect(page.locator('.success-message')).toBeVisible();
```

### Form filling

```typescript
await page.locator('#email').fill('user@example.com');
await page.locator('#password').fill('password123');
await page.locator('#login-form').submit();

await expect(page).toHaveURL('/dashboard');
```

### Select and checkbox

```typescript
await page.locator('#country').selectOption('US');
await page.locator('#terms').check();

await expect(page.locator('#country')).toHaveValue('US');
await expect(page.locator('#terms')).toBeChecked();
```

### Keyboard navigation

```typescript
await page.locator('#search-input').focus();
await page.keyboard.type('search query');
await page.keyboard.press('Enter');

await expect(page.locator('.results')).toBeVisible();
```

### Wait for conditions

```typescript
// Wait for element
await page.locator('.loading').waitFor({ state: 'hidden' });

// Wait for network idle
await page.waitForLoadState('networkidle');

// Wait for response
const response = await page.waitForResponse('**/api/data');
```

## Assertions

Playwright provides auto-retrying assertions:

| Assertion | Purpose |
|-----------|---------|
| `toBeVisible()` | Element is visible |
| `toBeHidden()` | Element is hidden |
| `toBeEnabled()` | Element is enabled |
| `toBeDisabled()` | Element is disabled |
| `toHaveText()` | Element has exact text |
| `toContainText()` | Element contains text |
| `toHaveValue()` | Input has value |
| `toHaveURL()` | Page has URL |
| `toHaveTitle()` | Page has title |

**Example:**
```typescript
await expect(page.locator('.error')).not.toBeVisible();
await expect(page.locator('.status')).toHaveText('Saved');
await expect(page).toHaveURL(/.*dashboard/);
```

## Test Structure

Use given/when/then structure for clarity:

```typescript
test('user can submit form', async ({ page }) => {
  // Given: user is on the form page
  await page.goto('/form');

  // When: user fills and submits the form
  await page.locator('#name').fill('John Doe');
  await page.locator('#email').fill('john@example.com');
  await page.locator('#submit').click();

  // Then: success message is shown
  await expect(page.locator('.success')).toHaveText('Form submitted');
});
```

## Common Scenarios

### Authentication flow

```typescript
test('login redirects to dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.locator('#email').fill('user@example.com');
  await page.locator('#password').fill('password');
  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL('/dashboard');
});
```

### Form validation

```typescript
test('shows validation errors', async ({ page }) => {
  await page.goto('/register');
  await page.locator('#submit').click(); // Submit empty form

  await expect(page.locator('.error-email')).toHaveText('Email is required');
  await expect(page.locator('.error-password')).toHaveText('Password is required');
});
```

### Modal interactions

```typescript
test('modal opens and closes', async ({ page }) => {
  await page.locator('#open-modal').click();
  await expect(page.locator('.modal')).toBeVisible();

  await page.locator('.modal .close').click();
  await expect(page.locator('.modal')).toBeHidden();
});
```

### API integration

```typescript
test('displays data from API', async ({ page }) => {
  // Mock API response
  await page.route('**/api/users', route => {
    route.fulfill({
      status: 200,
      body: JSON.stringify([{ id: 1, name: 'John' }])
    });
  });

  await page.goto('/users');
  await expect(page.locator('.user-name')).toHaveText('John');
});
```

### Responsive behavior

```typescript
test('mobile menu toggles', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');

  await expect(page.locator('.desktop-nav')).toBeHidden();
  await expect(page.locator('.mobile-menu-button')).toBeVisible();

  await page.locator('.mobile-menu-button').click();
  await expect(page.locator('.mobile-nav')).toBeVisible();
});
```

## Workflow

1. Identify the component or flow to test
2. Write test with given/when/then structure
3. Run test to verify behavior
4. If failures, check console for errors
5. Fix issues and re-run
6. Save test to project test directory

**Test file location:**
```
tests/
├── accessibility.test.ts
├── design-tokens.test.ts
├── functional/
│   ├── login.test.ts
│   ├── form-submission.test.ts
│   └── modal.test.ts
└── extension-popup.test.ts
```

## Console Error Detection

Capture and report console errors during tests:

```typescript
const errors: string[] = [];
page.on('console', msg => {
  if (msg.type() === 'error') {
    errors.push(msg.text());
  }
});

// After test actions
if (errors.length > 0) {
  console.log('Console errors:', errors);
}
```

Include console errors in test output only when relevant to the failure.
