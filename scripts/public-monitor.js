#!/usr/bin/env node

/**
 * Fail-closed, read-only HODLMM monitor.
 *
 * This module cannot unlock a wallet, sign, persist state, or broadcast. It
 * turns a public position read and a non-authorizing campaign snapshot into a
 * directive for a human or separately controlled planner.
 */

const fs = require('node:fs');
const path = require('node:path');
const { main: getBitflowPosition } = require('./bitflow_position');

const root = path.resolve(__dirname, '..');
const defaultCampaign = path.join(root, 'public', 'hodlmm', 'schemas', 'campaign.public.example.json');

function evaluateMonitor({ position, campaign, now = new Date() }) {
  const lpTokens = Number(position.position?.lp_tokens || 0);
  const inRange = position.range?.in_range;
  const endAtMs = new Date(campaign.end_at || 0).getTime();
  const gasBudget = Number(campaign.limits?.gas_budget_stx || 0);
  const gasSpent = Number(campaign.gas?.spent_stx || 0);
  const gasRemaining = Number((gasBudget - gasSpent).toFixed(6));
  const writeHalt = campaign.write_halt?.active === true;

  const gates = {
    campaign_active: campaign.status === 'active'
      && Number.isFinite(endAtMs)
      && now.getTime() < endAtMs,
    gas_budget_available: gasRemaining > 0,
    prior_failure_clear: !writeHalt,
  };

  const blockedReasons = [];
  if (!gates.campaign_active) blockedReasons.push('campaign_inactive_or_ended');
  if (!gates.gas_budget_available) blockedReasons.push('gas_budget_exhausted');
  if (!gates.prior_failure_clear) blockedReasons.push('campaign_write_halt_active');

  let directive;
  if (lpTokens <= 0) directive = 'NO_POSITION';
  else if (inRange === true) directive = 'HOLD_IN_RANGE';
  else if (blockedReasons.length) directive = 'HALT_WRITE';
  else directive = 'RECOMMEND_FRESH_DRY_RUN_ONLY';

  return {
    timestamp: now.toISOString(),
    mode: 'public_read_only',
    directive,
    wallet: campaign.wallet,
    pool: position.pool,
    position: {
      active_bin: position.active_bin,
      range: position.range,
      lp_tokens: lpTokens,
    },
    campaign: {
      id: campaign.campaign_id,
      status: campaign.status,
      end_at: campaign.end_at,
      gas_budget_stx: gasBudget,
      gas_spent_stx: gasSpent,
      gas_remaining_stx: gasRemaining,
      write_halt_active: writeHalt,
    },
    gates,
    blocked_reasons: blockedReasons,
    next_step: directive === 'RECOMMEND_FRESH_DRY_RUN_ONLY'
      ? 'A separately authorized planner may prepare a fresh simulation. This monitor cannot execute it.'
      : 'No write action.',
    safety: {
      wallet_unlocked: false,
      signer_available: false,
      state_written: false,
      transaction_broadcast: false,
    },
  };
}

function campaignPathFromArgs(argv) {
  const argument = argv.find(item => item.startsWith('--campaign='));
  return argument ? path.resolve(argument.slice('--campaign='.length)) : defaultCampaign;
}

async function main() {
  const campaignPath = campaignPathFromArgs(process.argv.slice(2));
  const campaign = JSON.parse(fs.readFileSync(campaignPath, 'utf8'));
  const position = await getBitflowPosition({ silent: true });
  process.stdout.write(`${JSON.stringify(evaluateMonitor({ position, campaign }), null, 2)}\n`);
}

module.exports = { evaluateMonitor };

if (require.main === module) {
  main().catch(error => {
    process.stderr.write(`${error.stack || error.message}\n`);
    process.exitCode = 1;
  });
}
