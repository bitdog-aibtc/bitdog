const test = require('node:test');
const assert = require('node:assert/strict');
const catalog = require('../public/hodlmm/campaigns/catalog.json');
const ledgerSummary = require('../public/hodlmm/ledger/summary.json');

test('published campaign receipt counts match the ledger summary', () => {
  for (const summary of ledgerSummary.campaigns) {
    const campaign = catalog.campaigns.find(item => item.campaign_id === summary.campaign_id);
    assert.ok(campaign, `missing ${summary.campaign_id}`);
    assert.equal(campaign.receipts.total, summary.receipts);
    assert.equal(campaign.receipts.broadcast, summary.broadcasts);
    assert.equal(campaign.receipts.success, summary.successful_txs);
    assert.equal(campaign.receipts.abort, summary.aborted_txs);
    assert.equal(campaign.receipts.no_tx, summary.no_tx_receipts);
  }
});

test('armed campaign remains unopened and signer-disarmed while entry gates are unmet', () => {
  const armed = catalog.campaigns.find(item => item.number === '004');
  assert.equal(armed.campaign_id, 'HODLMM-DLMM6-20260720-004');
  assert.equal(armed.status, 'armed_waiting_entry');
  assert.equal(armed.opened_at, null);
  assert.equal(armed.result, null);
  assert.equal(armed.capital.ceiling_usd, 40);
  assert.equal(armed.capital.moved_usd, 0);
  assert.deepEqual(armed.strategy.relative_bin_offsets, [-1, 0, 1]);
  assert.equal(armed.limits.minimum_liquid_stx_reserve, 5);
  assert.equal(armed.limits.entry_gas_cap_stx, 0.25);
  assert.equal(armed.limits.halt_after_failed_write_branches, 1);
  assert.equal(armed.entry_gates.volume_24h_usd_minimum, 10000);
  assert.equal(armed.entry_gates.second_confirmation, 'passed_2_of_2');
  assert.equal(armed.entry_gates.withdraw_simulation, 'passed');
  assert.equal(armed.entry_gates.signer, 'disarmed');
  assert.deepEqual(armed.receipts, { total: 2, broadcast: 0, success: 0, abort: 0, no_tx: 2 });
});

test('catalog refuses an aggregate result across overlapping campaign boundaries', () => {
  assert.equal(catalog.aggregate_result, null);
  assert.match(catalog.aggregate_result_reason, /residual/i);
});
