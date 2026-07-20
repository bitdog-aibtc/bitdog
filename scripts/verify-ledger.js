#!/usr/bin/env node

/**
 * Reconcile every broadcast receipt against Hiro's Stacks API.
 * No wallet access, signing, or secret is required.
 *
 * Usage:
 *   node scripts/verify-ledger.js
 *   node scripts/verify-ledger.js --write
 */

const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const ledgerPath = path.join(root, 'public', 'hodlmm', 'ledger', 'transactions.jsonl');
const outputPath = path.join(root, 'public', 'hodlmm', 'ledger', 'onchain-verification.json');
const wallet = process.env.STX_ADDRESS || 'SP178SWBKE4YRKPMPBTFP359DMBT025ZC48QEG7HB';
const receipts = fs.readFileSync(ledgerPath, 'utf8')
  .split(/\r?\n/)
  .map(line => line.trim())
  .filter(Boolean)
  .map(line => JSON.parse(line));

const broadcasts = receipts.filter(item => item.broadcast);

async function getWithRetry(url) {
  let response;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await new Promise(resolve => setTimeout(resolve, 250));
    response = await fetch(url, {
      headers: { accept: 'application/json' },
    });
    if (response.ok) break;
    if (response.status !== 429 && response.status < 500) break;
    await new Promise(resolve => setTimeout(resolve, 750 * (attempt + 1)));
  }
  return response;
}

function resultFor(item, tx) {
  const matches = item.status === 'success'
    ? tx.tx_status === 'success'
    : item.status === 'abort'
      ? String(tx.tx_status).startsWith('abort')
      : true;
  return {
    txid: item.txid,
    campaign_id: item.campaign_id,
    role: item.role,
    expected: item.status,
    chain_status: tx.tx_status,
    block_height: tx.block_height ?? null,
    fee_rate_ustx: tx.fee_rate ?? null,
    matches,
  };
}

async function buildAddressIndex(expectedTxids) {
  const index = new Map();
  for (let offset = 0; offset < 1000; offset += 50) {
    const response = await getWithRetry(
      `https://api.hiro.so/extended/v1/address/${wallet}/transactions?limit=50&offset=${offset}`
    );
    if (!response?.ok) break;
    const page = await response.json();
    for (const tx of page.results || []) index.set(String(tx.tx_id).toLowerCase(), tx);
    if ([...expectedTxids].every(txid => index.has(txid))) break;
    if (!page.results || page.results.length < 50) break;
  }
  return index;
}

async function verify(item, addressIndex) {
  const indexed = addressIndex.get(item.txid.toLowerCase());
  if (indexed) return resultFor(item, indexed);
  const response = await getWithRetry(`https://api.hiro.so/extended/v1/tx/${item.txid}`);
  if (!response || !response.ok) {
    return {
      txid: item.txid,
      expected: item.status,
      chain_status: null,
      matches: false,
      http_status: response?.status ?? null,
    };
  }
  const tx = await response.json();
  return resultFor(item, tx);
}

async function runPool(items, concurrency, addressIndex) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      try {
        results[index] = await verify(items[index], addressIndex);
      } catch (error) {
        results[index] = {
          txid: items[index].txid,
          expected: items[index].status,
          chain_status: null,
          matches: false,
          error: error.message,
        };
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return results;
}

(async () => {
  const expectedTxids = new Set(broadcasts.map(item => item.txid.toLowerCase()));
  const addressIndex = await buildAddressIndex(expectedTxids);
  const results = await runPool(broadcasts, 2, addressIndex);
  const output = {
    verified_at: new Date().toISOString(),
    source: `https://api.hiro.so/extended/v1/address/${wallet}/transactions with per-tx fallback`,
    total: results.length,
    matched: results.filter(item => item.matches).length,
    mismatched: results.filter(item => !item.matches).length,
    status_counts: results.reduce((acc, item) => {
      const key = item.chain_status || 'unavailable';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}),
    results,
  };
  if (process.argv.includes('--write')) {
    fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
  }
  process.stdout.write(`${JSON.stringify({
    verified_at: output.verified_at,
    total: output.total,
    matched: output.matched,
    mismatched: output.mismatched,
    status_counts: output.status_counts,
  }, null, 2)}\n`);
  process.exitCode = output.mismatched === 0 ? 0 : 1;
})();
