/**
 * Validate browser extension manifest.json.
 *
 * Usage:
 *   npx tsx scripts/validate-manifest.ts <manifest-path>
 *   npx tsx scripts/validate-manifest.ts ./extension/manifest.json
 *
 * Or import programmatically:
 *   import { validateManifest } from './scripts/validate-manifest';
 *   const results = validateManifest(manifestJson);
 */

import * as fs from 'fs';
import * as path from 'path';

interface ManifestValidation {
  field: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
}

interface ManifestResults {
  valid: boolean;
  validations: ManifestValidation[];
  manifestVersion: number;
}

interface ExtensionManifest {
  manifest_version: number;
  name: string;
  version: string;
  description?: string;
  permissions?: string[];
  host_permissions?: string[];
  action?: {
    default_popup?: string;
    default_icon?: Record<string, string>;
    default_title?: string;
  };
  background?: {
    service_worker?: string;
    page?: string;
    scripts?: string[];
  };
  content_scripts?: Array<{
    matches: string[];
    js?: string[];
    css?: string[];
    run_at?: 'document_start' | 'document_end' | 'document_idle';
  }>;
  content_security_policy?: {
    extension_pages?: string;
    sandbox?: string;
  };
  web_accessible_resources?: Array<{
    resources: string[];
    matches?: string[];
  }>;
  icons?: Record<string, string>;
  options_page?: string;
  options_ui?: {
    page: string;
    open_in_tab?: boolean;
  };
}

/**
 * Validate extension manifest.
 */
export function validateManifest(manifest: ExtensionManifest): ManifestResults {
  const validations: ManifestValidation[] = [];

  // Required fields
  validations.push({
    field: 'manifest_version',
    status: manifest.manifest_version === 3 ? 'pass' : 'fail',
    message: manifest.manifest_version === 3
      ? 'Manifest V3'
      : `Expected version 3, got ${manifest.manifest_version}`
  });

  validations.push({
    field: 'name',
    status: manifest.name ? 'pass' : 'fail',
    message: manifest.name ? `Extension name: "${manifest.name}"` : 'Missing required field'
  });

  validations.push({
    field: 'version',
    status: manifest.version ? 'pass' : 'fail',
    message: manifest.version ? `Version: ${manifest.version}` : 'Missing required field'
  });

  // Permissions
  if (manifest.permissions && manifest.permissions.length > 0) {
    const highRiskPermissions = ['tabs', 'activeTab', 'scripting', 'webNavigation', 'history', 'bookmarks'];
    const hasHighRisk = manifest.permissions.some(p => highRiskPermissions.includes(p));

    validations.push({
      field: 'permissions',
      status: hasHighRisk ? 'warn' : 'pass',
      message: hasHighRisk
        ? `High-risk permissions: ${manifest.permissions.filter(p => highRiskPermissions.includes(p)).join(', ')}. Ensure these are necessary.`
        : `Permissions: ${manifest.permissions.join(', ')}`
    });
  }

  // Host permissions
  if (manifest.host_permissions && manifest.host_permissions.length > 0) {
    const broadMatches = manifest.host_permissions.filter(p =>
      p === '<all_urls>' || p === '*://*/*'
    );

    validations.push({
      field: 'host_permissions',
      status: broadMatches.length > 0 ? 'warn' : 'pass',
      message: broadMatches.length > 0
        ? `Broad host permissions: ${broadMatches.join(', ')}. Consider restricting to specific domains.`
        : `Host permissions: ${manifest.host_permissions.join(', ')}`
    });
  }

  // Background
  if (manifest.background) {
    const hasServiceWorker = !!manifest.background.service_worker;
    const hasPage = !!manifest.background.page;
    const hasScripts = manifest.background.scripts && manifest.background.scripts.length > 0;

    validations.push({
      field: 'background',
      status: hasServiceWorker ? 'pass' : 'fail',
      message: hasServiceWorker
        ? 'Service worker defined'
        : hasPage || hasScripts
          ? 'Manifest V3 requires service_worker, not page or scripts'
          : 'Missing background definition'
    });
  }

  // Action (popup)
  if (manifest.action) {
    validations.push({
      field: 'action',
      status: manifest.action.default_popup ? 'pass' : 'warn',
      message: manifest.action.default_popup
        ? `Popup: ${manifest.action.default_popup}`
        : 'No popup defined (extension icon will not open a popup)'
    });
  }

  // Content scripts
  if (manifest.content_scripts && manifest.content_scripts.length > 0) {
    for (let i = 0; i < manifest.content_scripts.length; i++) {
      const cs = manifest.content_scripts[i];
      validations.push({
        field: `content_scripts[${i}].matches`,
        status: cs.matches && cs.matches.length > 0 ? 'pass' : 'fail',
        message: cs.matches && cs.matches.length > 0
          ? `Matches: ${cs.matches.join(', ')}`
          : 'Missing matches pattern'
      });
    }
  }

  // Content Security Policy
  if (manifest.content_security_policy?.extension_pages) {
    const csp = manifest.content_security_policy.extension_pages;
    const hasUnsafeInline = csp.includes("'unsafe-inline'");
    const hasUnsafeEval = csp.includes("'unsafe-eval'");

    validations.push({
      field: 'content_security_policy',
      status: hasUnsafeInline || hasUnsafeEval ? 'fail' : 'pass',
      message: hasUnsafeInline || hasUnsafeEval
        ? `CSP allows unsafe scripts: ${hasUnsafeInline ? "'unsafe-inline' " : ''}${hasUnsafeEval ? "'unsafe-eval'" : ''}`
        : 'CSP is secure'
    });
  }

  // Icons
  if (manifest.icons) {
    const requiredSizes = ['16', '48', '128'];
    const missingSizes = requiredSizes.filter(size => !manifest.icons?.[size]);

    validations.push({
      field: 'icons',
      status: missingSizes.length === 0 ? 'pass' : 'warn',
      message: missingSizes.length === 0
        ? 'All required icon sizes present'
        : `Missing icon sizes: ${missingSizes.join(', ')}`
    });
  }

  return {
    valid: !validations.some(v => v.status === 'fail'),
    validations,
    manifestVersion: manifest.manifest_version
  };
}

/**
 * Format validation results for console output.
 */
function formatResults(results: ManifestResults): string {
  const lines: string[] = [];

  lines.push('\nManifest Validation');
  lines.push('='.repeat(50));

  for (const validation of results.validations) {
    const icon = validation.status === 'pass' ? '✓' : validation.status === 'warn' ? '⚠' : '✗';
    const status = validation.status.toUpperCase().padEnd(6);
    lines.push(`[${status}] ${icon} ${validation.field}`);
    lines.push(`      ${validation.message}`);
  }

  lines.push('\n' + '='.repeat(50));
  lines.push(results.valid ? '✓ Manifest is valid' : '✗ Manifest has errors');

  return lines.join('\n');
}

// CLI entry point
async function main() {
  const manifestPath = process.argv[2];

  if (!manifestPath) {
    console.error('Usage: npx tsx scripts/validate-manifest.ts <manifest-path>');
    process.exit(1);
  }

  const fullPath = path.resolve(manifestPath);

  if (!fs.existsSync(fullPath)) {
    console.error(`Manifest not found: ${fullPath}`);
    process.exit(1);
  }

  try {
    const manifestContent = fs.readFileSync(fullPath, 'utf-8');
    const manifest = JSON.parse(manifestContent) as ExtensionManifest;
    const results = validateManifest(manifest);

    console.log(formatResults(results));
    process.exit(results.valid ? 0 : 1);
  } catch (error) {
    console.error('Error parsing manifest:', error);
    process.exit(1);
  }
}

// Run CLI if executed directly
if (require.main === module) {
  main();
}
