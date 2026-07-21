#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const ignoredDirectories = new Set(['.git', 'node_modules']);

const secretPatterns = [
  ['private_key_block', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
  ['github_token', /\bgh[pousr]_[A-Za-z0-9_]{16,}\b/g],
  ['openai_key', /\bsk-[A-Za-z0-9_-]{20,}\b/g],
  ['slack_token', /\bxox[baprs]-[A-Za-z0-9-]{16,}\b/g],
  ['bearer_token', /authorization\s*:\s*bearer\s+[A-Za-z0-9._~+/=-]{12,}/gi],
  [
    'sensitive_env_assignment',
    /^\s*(?:export\s+)?[A-Z0-9_]*(?:PASSWORD|PASSPHRASE|MNEMONIC|SEED|PRIVATE_KEY|WIF|TOKEN|API_KEY)[A-Z0-9_]*\s*=\s*["']?[^\s"'#][^\s"'#]{5,}/gm,
  ],
  [
    'sensitive_json_assignment',
    /^[\t ]*["'](?:password|passphrase|mnemonic|seed|private_key|wif|token|api_key)["'][\t ]*:[\t ]*["'][^"']{6,}["']/gmi,
  ],
];

const signerPatterns = [
  ['contract_call_constructor', /\bmakeContractCall\s*\(/g],
  ['transaction_broadcast', /\bbroadcastTransaction\s*\(/g],
  ['wallet_unlock', /\bwallet[_A-Za-z]*unlock\s*\(/gi],
  ['private_key_derivation', /\b(?:privateKeyTo|derivePrivate|mnemonicToSeed)\w*\s*\(/g],
  ['http_post', /\.\s*post\s*\(/gi],
  ['http_mutator', /\.\s*(?:put|patch|delete)\s*\(/gi],
  ['mutating_fetch_call', /\bmethod\s*:\s*["'](?:POST|PUT|PATCH|DELETE)["']/gi],
];

function filesIn(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) return [];
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(target) : [target];
  });
}

function prohibitedPath(relativePath) {
  const normalized = relativePath.split(path.sep).join('/');
  if (normalized === '.env.example') return null;
  if (/(^|\/)\.env(?:\.|$)/i.test(normalized)) return 'environment_file';
  if (/(^|\/)(?:daemon|private)(?:$|\/)/i.test(normalized)) return 'private_runtime_directory';
  if (/(^|\/)(?:\.mcp\.json|wallets?\.json|credentials?(?:\..+)?|inbox\.json|outbox\.json)(?:$|\/)/i.test(normalized)) {
    return 'private_runtime_file';
  }
  if (/\.(?:pem|key|p12|pfx|keystore)$/i.test(normalized)) return 'key_material_extension';
  return null;
}

function findingsForText(text, source, includeRuntimePatterns = true) {
  const findings = [];
  const patterns = includeRuntimePatterns ? [...secretPatterns, ...signerPatterns] : secretPatterns;
  for (const [rule, pattern] of patterns) {
    pattern.lastIndex = 0;
    if (!pattern.test(text)) continue;
    const readOnlyClarityPost = rule === 'http_post'
      && source.endsWith('scripts/bitflow_position.js')
      && /\/v2\/contracts\/call-read\//.test(text)
      && (text.match(/\.\s*post\s*\(/gi) || []).length === 1;
    if (!readOnlyClarityPost) findings.push({ source, rule });
  }
  return findings;
}

function scanWorktree() {
  const findings = [];
  let bytesScanned = 0;
  let filesScanned = 0;

  for (const file of filesIn(root)) {
    const relative = path.relative(root, file);
    const pathRule = prohibitedPath(relative);
    if (pathRule) findings.push({ source: relative, rule: pathRule });

    const buffer = fs.readFileSync(file);
    if (buffer.includes(0)) continue;
    const text = buffer.toString('utf8');
    filesScanned += 1;
    bytesScanned += buffer.length;
    findings.push(...findingsForText(text, relative, file.endsWith('.js')));
  }

  return { findings, filesScanned, bytesScanned };
}

function scanHistory() {
  const revisions = spawnSync('git', ['rev-list', '--all'], { cwd: root, encoding: 'utf8' });
  if (revisions.status !== 0) return [{ source: 'git_history', rule: 'history_scan_failed' }];

  const findings = [];
  for (const revision of revisions.stdout.split(/\r?\n/).filter(Boolean)) {
    const tree = spawnSync('git', ['ls-tree', '-r', '--name-only', revision], {
      cwd: root,
      encoding: 'utf8',
    });
    if (tree.status !== 0) return [{ source: 'git_history', rule: 'history_scan_failed' }];

    for (const relative of tree.stdout.split(/\r?\n/).filter(Boolean)) {
      const pathRule = prohibitedPath(relative);
      if (pathRule) findings.push({ source: `git:${revision.slice(0, 12)}:${relative}`, rule: pathRule });

      const blob = spawnSync('git', ['show', `${revision}:${relative}`], {
        cwd: root,
        encoding: 'buffer',
        maxBuffer: 16 * 1024 * 1024,
      });
      if (blob.status !== 0 || blob.stdout.includes(0)) continue;
      findings.push(...findingsForText(blob.stdout.toString('utf8'), relative, relative.endsWith('.js'))
        .map(finding => ({ ...finding, source: `git:${revision.slice(0, 12)}:${finding.source}` })));
    }
  }
  return findings;
}

function main() {
  const worktree = scanWorktree();
  const historyFindings = scanHistory();
  const findings = [...worktree.findings, ...historyFindings];
  const result = {
    ok: findings.length === 0,
    files_scanned: worktree.filesScanned,
    bytes_scanned: worktree.bytesScanned,
    history_scanned: true,
    findings,
  };
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  process.exitCode = result.ok ? 0 : 1;
}

module.exports = { findingsForText, prohibitedPath };

if (require.main === module) main();
