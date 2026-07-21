const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluateMonitor } = require('../scripts/public-monitor');

function fixture(overrides = {}) {
  return {
    position: {
      pool: 'public.pool',
      active_bin: -327,
      range: { min_bin: -301, max_bin: -300, in_range: false },
      position: { lp_tokens: 42901 },
    },
    campaign: {
      campaign_id: 'campaign-003',
      wallet: 'public-wallet',
      status: 'ended',
      end_at: '2026-07-20T00:00:00.000Z',
      limits: { gas_budget_stx: 0.5 },
      gas: { spent_stx: 0.5 },
      write_halt: { active: true },
    },
    now: new Date('2026-07-20T18:00:00.000Z'),
    ...overrides,
  };
}

test('fails closed for an ended, halted campaign', () => {
  const result = evaluateMonitor(fixture());
  assert.equal(result.directive, 'HALT_WRITE');
  assert.deepEqual(result.blocked_reasons, [
    'campaign_inactive_or_ended',
    'gas_budget_exhausted',
    'campaign_write_halt_active',
  ]);
  assert.equal(result.safety.wallet_unlocked, false);
  assert.equal(result.safety.signer_available, false);
  assert.equal(result.safety.state_written, false);
  assert.equal(result.safety.transaction_broadcast, false);
});

test('recommends only a fresh dry-run when every public gate passes', () => {
  const input = fixture();
  input.campaign.status = 'active';
  input.campaign.end_at = '2026-07-21T00:00:00.000Z';
  input.campaign.gas.spent_stx = 0.1;
  input.campaign.write_halt.active = false;
  const result = evaluateMonitor(input);
  assert.equal(result.directive, 'RECOMMEND_FRESH_DRY_RUN_ONLY');
  assert.deepEqual(result.blocked_reasons, []);
});

test('does not recommend a write for an in-range position', () => {
  const input = fixture();
  input.position.range.in_range = true;
  const result = evaluateMonitor(input);
  assert.equal(result.directive, 'HOLD_IN_RANGE');
});
