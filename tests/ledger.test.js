const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const ledgerPath = path.join(root, 'public', 'hodlmm', 'ledger', 'transactions.jsonl');
const receipts = fs.readFileSync(ledgerPath, 'utf8')
  .trim()
  .split(/\r?\n/)
  .map(line => JSON.parse(line));

test('every receipt has an unambiguous broadcast state', () => {
  for (const item of receipts) {
    assert.equal(typeof item.broadcast, 'boolean');
    if (item.broadcast) assert.match(item.txid, /^0x[0-9a-f]{64}$/);
    if (!item.broadcast) assert.equal(item.txid ?? null, null);
  }
});

test('every emitted hash is unique', () => {
  const hashes = receipts.filter(item => item.txid).map(item => item.txid);
  assert.equal(new Set(hashes).size, hashes.length);
});

test('the known paid abort is preserved', () => {
  const aborted = receipts.filter(item => item.status === 'abort');
  assert.equal(aborted.length, 1);
  assert.equal(aborted[0].txid, '0x7ea584ced8441af70d6bedfa83422d5e15cd5e1d775c7b1addd42c7a933d1c57');
});

test('pre-broadcast failures never claim a tx hash or gas', () => {
  const stopped = receipts.filter(item => !item.broadcast);
  assert.ok(stopped.length >= 2);
  for (const item of stopped) {
    assert.equal(item.txid ?? null, null);
    if (item.details?.gas_spent_stx !== undefined) assert.equal(item.details.gas_spent_stx, 0);
  }
});
