#!/usr/bin/env node
/**
 * Run all DSA solutions and report pass/fail.
 * Usage: node DSA/run-all.js
 */
import { readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const solutionsDir = join(__dirname, 'solutions');

function findSolutions(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) findSolutions(full, files);
    else if (entry === 'solution.js') files.push(full);
  }
  return files.sort();
}

const files = findSolutions(solutionsDir);
let passed = 0, failed = 0;

for (const file of files) {
  const result = spawnSync('node', [file], { encoding: 'utf8' });
  if (result.status === 0) {
    passed++;
    console.log(result.stdout.trim());
  } else {
    failed++;
    console.error(`❌ ${file}`);
    console.error(result.stderr || result.stdout);
  }
}

console.log(`\n${'='.repeat(40)}`);
console.log(`Total: ${files.length} | Passed: ${passed} | Failed: ${failed}`);
