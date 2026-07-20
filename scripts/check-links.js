#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const ignoredDirectories = new Set(['.git', 'node_modules']);

function markdownFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) return [];
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(target);
    return entry.name.endsWith('.md') ? [target] : [];
  });
}

const failures = [];

for (const file of markdownFiles(root)) {
  const source = fs.readFileSync(file, 'utf8');
  const links = source.matchAll(/\[[^\]]*\]\(([^)]+)\)/g);

  for (const match of links) {
    const rawTarget = match[1].trim().replace(/^<|>$/g, '');
    if (!rawTarget || /^(?:https?:|mailto:|#)/i.test(rawTarget)) continue;

    const withoutFragment = rawTarget.split('#')[0].split('?')[0];
    const resolved = path.resolve(path.dirname(file), decodeURIComponent(withoutFragment));
    if (!resolved.startsWith(root + path.sep) || !fs.existsSync(resolved)) {
      failures.push(`${path.relative(root, file)} -> ${rawTarget}`);
    }
  }
}

if (failures.length) {
  console.error(`Broken internal links (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log('All internal Markdown links resolve.');
}
