#!/usr/bin/env node

import { syncDeps } from '../scripts/sync-deps.js';

const prevHead = process.argv[2] || 'ORIG_HEAD';
const newHead = process.argv[3] || 'HEAD';
const isBranchCheckout = process.argv[4] !== undefined ? process.argv[4] : 1;

syncDeps(prevHead, newHead, isBranchCheckout);
