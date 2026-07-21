#!/usr/bin/env node

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const manifestRelative = 'public/hodlmm/proof/manifest.sha256';
const manifestPath = path.join(root, manifestRelative);
const roots = ['.github', 'public', 'scripts', 'tests'];
const topLevel = [
  '.env.example',
  '.gitignore',
  'AGENT.md',
  'CONTRIBUTING.md',
  'LICENSE',
  'PUBLICATION_POLICY.md',
  'README.md',
  'SECURITY.md',
  'SOUL.md',
  'package-lock.json',
  'package.json',
];

function filesIn(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(target) : [target];
  });
}

function includedFiles() {
  const files = [
    ...topLevel.map(file => path.join(root, file)),
    ...roots.flatMap(directory => filesIn(path.join(root, directory))),
  ];
  return files
    .filter(file => path.relative(root, file).split(path.sep).join('/') !== manifestRelative)
    .filter(file => !file.endsWith('.DS_Store'))
    .sort((a, b) => path.relative(root, a).localeCompare(path.relative(root, b)));
}

function hashFile(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function buildManifest() {
  const lines = includedFiles().map(file => {
    const relative = path.relative(root, file).split(path.sep).join('/');
    return `${hashFile(file)}  ${relative}`;
  });
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, `${lines.join('\n')}\n`);
  return { files: lines.length, manifest: manifestRelative };
}

module.exports = { buildManifest, hashFile, includedFiles, manifestRelative };

if (require.main === module) {
  process.stdout.write(`${JSON.stringify(buildManifest(), null, 2)}\n`);
}
