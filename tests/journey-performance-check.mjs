import fs from 'node:fs';
import assert from 'node:assert/strict';
const before = JSON.parse(fs.readFileSync('docs/performance-journey-before.json', 'utf8'));
const after = JSON.parse(fs.readFileSync('docs/performance-journey-after.json', 'utf8'));
assert.equal(after.environment, before.environment);
assert.ok(after.median.lcp <= before.median.lcp * 1.1, `LCP ${after.median.lcp}ms exceeds the 10% limit over ${before.median.lcp}ms`);
assert.ok(after.runs.every(run => run.cls <= 0.1), 'CLS exceeds 0.1');
console.log(`PASS: LCP ${before.median.lcp} → ${after.median.lcp}ms (${((after.median.lcp / before.median.lcp - 1) * 100).toFixed(1)}%); CLS ${after.median.cls}.`);
