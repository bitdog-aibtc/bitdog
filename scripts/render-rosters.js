#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const ledger = fs.readFileSync(path.join(root, 'public', 'hodlmm', 'ledger', 'transactions.jsonl'), 'utf8')
  .trim()
  .split(/\r?\n/)
  .map(line => JSON.parse(line));
const verification = JSON.parse(
  fs.readFileSync(path.join(root, 'public', 'hodlmm', 'ledger', 'onchain-verification.json'), 'utf8')
);
const verifiedByTx = new Map(verification.results.map(item => [item.txid, item]));

const campaignDirs = {
  'HODLMM-DLMM6-20260604-001': '001',
  'HODLMM-DLMM6-20260709-002': '002',
  'HODLMM-DLMM6-20260709-003': '003',
  'HODLMM-DLMM6-20260720-004': '004',
};

function explorer(txid) {
  return `https://explorer.hiro.so/txid/${txid}?chain=mainnet`;
}

function escape(value) {
  return String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');
}

for (const [campaignId, dir] of Object.entries(campaignDirs)) {
  const items = ledger.filter(item => item.campaign_id === campaignId);
  const lines = [
    `# ${campaignId} — complete receipt roster`,
    '',
    '> Generated from `public/hodlmm/ledger/transactions.jsonl` and reconciled against Hiro.',
    '> `no tx` is an intentional receipt: the agent stopped before broadcast.',
    '',
    '| UTC | Attempt | Role | Recorded | Chain | Block | Fee (µSTX) | Receipt |',
    '|---|---|---|---|---|---:|---:|---|',
  ];

  for (const item of items) {
    const chain = item.txid ? verifiedByTx.get(item.txid) : null;
    const receiptLink = item.txid
      ? `[${item.txid.slice(0, 10)}…](${explorer(item.txid)})`
      : `no tx — ${escape(item.error || item.details?.error || item.status)}`;
    lines.push([
      escape(item.at),
      escape(item.attempt_id),
      escape(item.role),
      escape(item.status),
      escape(chain?.chain_status || 'not broadcast'),
      escape(chain?.block_height ?? '—'),
      escape(chain?.fee_rate_ustx ?? '—'),
      receiptLink,
    ].join(' | ').replace(/^/, '| ').replace(/$/, ' |'));
  }

  lines.push('', `Receipts: **${items.length}** · Broadcast txs: **${items.filter(item => item.broadcast).length}** · No-tx receipts: **${items.filter(item => !item.broadcast).length}**`);
  const target = path.join(root, 'public', 'hodlmm', 'campaigns', dir, 'transaction-roster.md');
  fs.writeFileSync(target, `${lines.join('\n')}\n`);
}

process.stdout.write('Rendered campaign transaction rosters.\n');
