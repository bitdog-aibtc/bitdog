#!/usr/bin/env node

/**
 * Build BITDOG's public machine-readable receipt ledger from the private
 * narrative ledger without copying private runtime state into the public repo.
 *
 * Usage:
 *   node scripts/build-ledger.js --source=/path/to/dogbot
 */

const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const sourceArg = process.argv.find(arg => arg.startsWith('--source='));
const source = sourceArg ? sourceArg.slice('--source='.length) : process.env.BITDOG_PRIVATE_SOURCE;

if (!source) {
  throw new Error('Pass --source=/path/to/dogbot or set BITDOG_PRIVATE_SOURCE.');
}

const narrativePath = path.join(source, 'memory', 'hodlmm-transactions.md');
const machinePath = path.join(source, 'memory', 'hodlmm-receipts.jsonl');
const outputDir = path.join(root, 'public', 'hodlmm', 'ledger');
const outputPath = path.join(outputDir, 'transactions.jsonl');
const summaryPath = path.join(outputDir, 'summary.json');

const narrative = fs.readFileSync(narrativePath, 'utf8');
const privateReceipts = fs.readFileSync(machinePath, 'utf8')
  .split(/\r?\n/)
  .map(line => line.trim())
  .filter(Boolean)
  .map(line => JSON.parse(line));

function iso(value) {
  const normalized = value.endsWith('Z') && value.length === 17
    ? value.replace('Z', ':00Z')
    : value;
  return new Date(normalized).toISOString();
}

function txids(text) {
  return [...text.matchAll(/`(?:0x)?([0-9a-f]{64})`/gi)].map(match => `0x${match[1].toLowerCase()}`);
}

function campaignFor(at) {
  return at >= '2026-07-10T00:00:00.000Z'
    ? 'HODLMM-DLMM6-20260709-003'
    : 'HODLMM-DLMM6-20260604-001';
}

function gasFor(section) {
  const match = section.match(/\*\*Gas(?: spent)?[^:]*:\*\*\s*(?:~)?([0-9.]+)\s*STX/i)
    || section.match(/\*\*Gas:\*\*\s*([0-9.]+)\s*STX/i);
  return match ? Number(match[1]) : null;
}

function receipt({ at, campaignId, attemptId, role, stage, status, broadcast, txid = null, details = {} }) {
  return {
    schema_version: 1,
    at,
    campaign_id: campaignId,
    attempt_id: attemptId,
    role,
    stage,
    status,
    broadcast,
    txid,
    ...details,
  };
}

const receipts = [];
const sections = narrative.split(/^###\s+/m).slice(1);

for (const section of sections) {
  const heading = section.split(/\r?\n/, 1)[0];
  const dateMatch = heading.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{3})?)?Z)/);
  if (!dateMatch) continue;
  const at = iso(dateMatch[1]);
  const campaignId = campaignFor(at);
  const attemptId = `bitdog-${at.replace(/[-:.TZ]/g, '').slice(0, 14)}`;
  const attemptGas = gasFor(section);

  if (/DEFERRED/i.test(heading)) {
    receipts.push(receipt({
      at,
      campaignId,
      attemptId,
      role: 'entry_deposit',
      stage: 'preflight',
      status: 'blocked_preflight',
      broadcast: false,
      details: {
        error: 'Safe min-DLP was unavailable before simulation; the agent stopped without signing.',
        gas_stx: 0,
        source_ref: 'private narrative ledger',
      },
    }));
    continue;
  }

  if (/partial withdraw halted/i.test(heading)) {
    const successLine = section.split(/\r?\n/).find(line => /Successful withdraw txid/i.test(line)) || '';
    const failedLine = section.split(/\r?\n/).find(line => /Failed withdraw txid/i.test(line)) || '';
    const successTx = txids(successLine)[0];
    const failedTx = txids(failedLine)[0];
    receipts.push(receipt({
      at,
      campaignId,
      attemptId,
      role: 'recenter_withdraw',
      stage: 'withdraw',
      status: 'success',
      broadcast: true,
      txid: successTx,
      details: { bin_id: -302, source_ref: 'private narrative ledger' },
    }));
    receipts.push(receipt({
      at,
      campaignId,
      attemptId,
      role: 'recenter_withdraw',
      stage: 'withdraw',
      status: 'abort',
      broadcast: true,
      txid: failedTx,
      details: {
        bin_id: -301,
        error: 'Contract aborted with err u1022 after the active bin moved and made the strict minimum guard stale.',
        gas_stx: attemptGas,
        halt_triggered: true,
        source_ref: 'private narrative ledger',
      },
    }));
    continue;
  }

  const lines = section.split(/\r?\n/);
  const withdrawLine = lines.find(line => /\*\*Withdraw txids:\*\*/i.test(line));
  const depositLine = lines.find(line => /\*\*Deposit txid:\*\*/i.test(line));
  const singleTxLine = lines.find(line => /\*\*Txid:\*\*/i.test(line));

  if (withdrawLine && depositLine) {
    txids(withdrawLine).forEach((txid, index) => {
      receipts.push(receipt({
        at,
        campaignId,
        attemptId,
        role: 'recenter_withdraw',
        stage: 'withdraw',
        status: 'success',
        broadcast: true,
        txid,
        details: { sequence: index + 1, source_ref: 'private narrative ledger' },
      }));
    });
    const depositTx = txids(depositLine)[0];
    receipts.push(receipt({
      at,
      campaignId,
      attemptId,
      role: 'recenter_deposit',
      stage: 'deposit',
      status: 'success',
      broadcast: true,
      txid: depositTx,
      details: { attempt_gas_stx: attemptGas, source_ref: 'private narrative ledger' },
    }));
    continue;
  }

  if (singleTxLine) {
    const txid = txids(singleTxLine)[0];
    const isSwap = /Prep swap/i.test(heading);
    receipts.push(receipt({
      at,
      campaignId,
      attemptId,
      role: isSwap ? 'entry_swap' : 'entry_deposit',
      stage: isSwap ? 'swap' : 'deposit',
      status: 'success',
      broadcast: true,
      txid,
      details: { attempt_gas_stx: attemptGas, source_ref: 'private narrative ledger' },
    }));
  }
}

for (const privateReceipt of privateReceipts) {
  if (privateReceipt.txid) continue;
  const mappedCampaign = privateReceipt.campaign_id
    || 'HODLMM-DLMM6-20260709-002';
  receipts.push({
    ...privateReceipt,
    campaign_id: mappedCampaign,
    source_ref: 'private machine receipt ledger',
  });
}

receipts.sort((a, b) => a.at.localeCompare(b.at) || a.role.localeCompare(b.role));

const seen = new Set();
for (const item of receipts) {
  if (item.broadcast && !item.txid) throw new Error(`Broadcast receipt missing txid: ${item.attempt_id}`);
  if (!item.broadcast && item.txid) throw new Error(`Non-broadcast receipt has txid: ${item.attempt_id}`);
  if (item.txid) {
    if (seen.has(item.txid)) throw new Error(`Duplicate txid: ${item.txid}`);
    seen.add(item.txid);
  }
}

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputPath, `${receipts.map(item => JSON.stringify(item)).join('\n')}\n`);

const byCampaign = Object.values(receipts.reduce((acc, item) => {
  const current = acc[item.campaign_id] || {
    campaign_id: item.campaign_id,
    receipts: 0,
    broadcasts: 0,
    successful_txs: 0,
    aborted_txs: 0,
    no_tx_receipts: 0,
  };
  current.receipts += 1;
  current.broadcasts += item.broadcast ? 1 : 0;
  current.successful_txs += item.status === 'success' ? 1 : 0;
  current.aborted_txs += item.status === 'abort' ? 1 : 0;
  current.no_tx_receipts += item.txid ? 0 : 1;
  acc[item.campaign_id] = current;
  return acc;
}, {}));

const summary = {
  generated_at: new Date().toISOString(),
  receipt_count: receipts.length,
  unique_txids: seen.size,
  successful_txs: receipts.filter(item => item.status === 'success').length,
  aborted_txs: receipts.filter(item => item.status === 'abort').length,
  no_tx_receipts: receipts.filter(item => !item.txid).length,
  campaigns: byCampaign,
};

fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
