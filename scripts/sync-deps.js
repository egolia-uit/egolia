#!/usr/bin/env node

import { execSync, spawnSync } from 'child_process';

/**
 * Syncs dependencies based on changed files
 * @param {string} prevHead - Previous HEAD commit
 * @param {string} newHead - New HEAD commit
 * @param {number|string} isBranchCheckout - Flag (1 for branch, 0 for file)
 */
function syncDeps(
  prevHead = 'HEAD@{1}',
  newHead = 'HEAD',
  isBranchCheckout = 1
) {
  // Normalize isBranchCheckout
  const isFileCheckout = isBranchCheckout === 0 || isBranchCheckout === '0';

  // Only run if we actually switched branches/commits
  if (isFileCheckout) {
    return;
  }

  try {
    // Get changed files once
    const changedFiles = execSync(
      `git diff --name-only "${prevHead}" "${newHead}"`
    )
      .toString()
      .trim();

    // Detection via logic
    const pnpmSync = changedFiles.includes('pnpm-lock.yaml');
    const goSync = changedFiles.includes('go.sum');
    const miseSync = /.*mise.*\.toml/.test(changedFiles);

    // Exit early if nothing to do
    if (!pnpmSync && !goSync && !miseSync) {
      return;
    }

    console.log('🔔 Dependency changes detected.');

    // 1. Sync Mise first (tooling provider)
    if (miseSync) {
      console.log('🚀 mise install...');
      execSync('mise install', { stdio: 'inherit' });
    }

    // 2. Sync Languages
    if (pnpmSync) {
      console.log('📦 pnpm install...');
      execSync('pnpm install', { stdio: 'inherit' });
    }

    if (goSync) {
      console.log('🐹 go mod download...');
      execSync('go mod download', { stdio: 'inherit' });
    }

    console.log('✅ Environment synced.');
  } catch (error) {
    console.error('Error syncing dependencies:', error.message);
    process.exit(error.status || 1);
  }
}

// Export for use as a module
export { syncDeps };

// Run as CLI if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const prevHead = args[0] || 'HEAD@{1}';
  const newHead = args[1] || 'HEAD';
  const isBranchCheckout = args[2] !== undefined ? args[2] : 1;

  syncDeps(prevHead, newHead, isBranchCheckout);
}
