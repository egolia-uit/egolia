#!/usr/bin/env node

const { syncDeps } = require('../scripts/sync-deps');

// post-merge hook arguments
syncDeps('ORIG_HEAD', 'HEAD', 1);
