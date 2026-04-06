#!/usr/bin/env node

import { execSync, spawnSync } from 'child_process';
import fs from 'fs';

const FILE_LIMIT_BYTES = 1000000; // 1MB

const ALLOWED_USERS = [
  'trannguyenthaibinh46@gmail.com',
  'minhlephan1901@gmail.com',
  '23520320@gm.uit.edu.vn',
  'nhattri172@gmail.com',
];

try {
  // Get current user
  const currentUser = execSync('git config user.email').toString().trim();

  if (!ALLOWED_USERS.includes(currentUser)) {
    console.error(`Error: User '${currentUser}' is not allowed to commit.`);
    process.exit(1);
  }

  console.log(`Access granted for ${currentUser}.`);

  // Run pnpm nx affected
  execSync(
    'pnpm nx affected --target typecheck --target lint --target format:check --tui false',
    {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, CI: 'true' },
    }
  );

  // Check file sizes and types
  const stagedFiles = execSync('git diff --cached --name-only --diff-filter=A')
    .toString()
    .trim()
    .split('\n')
    .filter((file) => file.length > 0);

  for (const file of stagedFiles) {
    // Check file size
    const fileSize = fs.statSync(file).size;
    if (fileSize > FILE_LIMIT_BYTES) {
      console.error(
        `Error: File '${file}' is too large (>${FILE_LIMIT_BYTES} bytes).`
      );
      process.exit(2);
    }

    // Check if binary
    try {
      const fileCmd = spawnSync('file', ['--mime', file], { encoding: 'utf8' });
      if (fileCmd.stdout.includes('binary')) {
        console.error(`Error: Binary file '${file}' detected. Use Git LFS.`);
        process.exit(3);
      }
    } catch (error) {
      console.warn(`Warning: Could not check file type for '${file}'`);
    }
  }

  process.exit(0);
} catch (error) {
  process.exit(error.status || 1);
}
