const test = require('node:test');
const assert = require('node:assert/strict');
const { findingsForText, prohibitedPath } = require('../scripts/audit-publication');

test('rejects private runtime paths but allows the environment template', () => {
  assert.equal(prohibitedPath('.env.example'), null);
  assert.equal(prohibitedPath('.env'), 'environment_file');
  assert.equal(prohibitedPath('private/wallet.json'), 'private_runtime_directory');
  assert.equal(prohibitedPath('agent.key'), 'key_material_extension');
});

test('detects a generated GitHub-style token without storing one in the fixture', () => {
  const fake = ['ghp', 'A'.repeat(36)].join('_');
  const findings = findingsForText(`credential=${fake}`, 'fixture.txt', false);
  assert.ok(findings.some(finding => finding.rule === 'github_token'));
});

test('detects signer and mutating network code in JavaScript', () => {
  const source = ['makeContract', 'Call({})', 'axios', ['.', 'post(url)'].join('')].join('');
  const findings = findingsForText(source, 'fixture.js', true);
  assert.ok(findings.some(finding => finding.rule === 'contract_call_constructor'));
  assert.ok(findings.some(finding => finding.rule === 'http_post'));
});
