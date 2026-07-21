#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { hashFile, includedFiles, manifestRelative } = require('./build-manifest');

const root = path.resolve(__dirname, '..');
const manifestPath = path.join(root, manifestRelative);

function expectedEntries() {
  return new Map(fs.readFileSync(manifestPath, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line, index) => {
      const match = line.match(/^([0-9a-f]{64})  (.+)$/);
      if (!match) throw new Error(`Invalid manifest line ${index + 1}`);
      return [match[2], match[1]];
    }));
}

function verifyManifest() {
  const expected = expectedEntries();
  const actualFiles = includedFiles();
  const actualPaths = new Set(actualFiles.map(file => path.relative(root, file).split(path.sep).join('/')));
  const mismatches = [];

  for (const file of actualFiles) {
    const relative = path.relative(root, file).split(path.sep).join('/');
    const expectedHash = expected.get(relative);
    const actualHash = hashFile(file);
    if (!expectedHash) mismatches.push({ file: relative, reason: 'missing_from_manifest' });
    else if (expectedHash !== actualHash) mismatches.push({ file: relative, reason: 'hash_mismatch' });
  }

  for (const relative of expected.keys()) {
    if (!actualPaths.has(relative)) mismatches.push({ file: relative, reason: 'missing_from_worktree' });
  }

  return {
    ok: mismatches.length === 0,
    files_verified: actualFiles.length,
    mismatches,
  };
}

const result = verifyManifest();
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
process.exitCode = result.ok ? 0 : 1;
