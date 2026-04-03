#!/usr/bin/env node

const { syncDeps } = require('../scripts/sync-deps');

const prevHead = process.argv[2] || 'HEAD@{1}';
const newHead = process.argv[3] || 'HEAD';
const isBranchCheckout = process.argv[4] !== undefined ? process.argv[4] : 1;

syncDeps(prevHead, newHead, isBranchCheckout);
