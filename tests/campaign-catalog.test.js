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

test('draft campaign has no authority or receipts', () => {
  const draft = catalog.campaigns.find(item => item.number === '004');
  assert.equal(draft.status, 'draft_not_authorized');
  assert.equal(draft.opened_at, null);
  assert.equal(draft.result, null);
  assert.deepEqual(draft.receipts, { total: 0, broadcast: 0, success: 0, abort: 0, no_tx: 0 });
});

test('catalog refuses an aggregate result across overlapping campaign boundaries', () => {
  assert.equal(catalog.aggregate_result, null);
  assert.match(catalog.aggregate_result_reason, /residual/i);
});
