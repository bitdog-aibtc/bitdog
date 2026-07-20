/**
 * bitflow_position.js — BITDOG HODLMM position checker
 *
 * Queries the Bitflow STX/sBTC DLMM pool for:
 *   - User's bin positions and range
 *   - Active bin (market price)
 *   - In-range vs out-of-range status
 *   - Position value (estimated via pool TVL × share)
 *   - Fee rate data
 *
 * Contract: SM1FKXGNZJWSTWDWXQZJNF7B5TV5ZB235JTCXYXKD.dlmm-pool-stx-sbtc-v-1-bps-15
 *
 * Clarity type codes:
 *   0x00 = int128 (signed)   0x07 = response-ok
 *   0x01 = uint128           0x08 = response-err
 *   0x02 = bool-true         0x09 = optional-none
 *   0x03 = bool-false        0x0a = optional-some
 *   0x04 = (unused)          0x0b = list
 *   0x05 = optional-none     0x0c = tuple
 *   0x06 = standard-principal 0x0d = string-ascii
 */
require('dotenv').config({ quiet: true });
const axios = require('axios');
const { c32addressDecode } = require('c32check');

const STX_ADDR  = process.env.STX_ADDRESS || 'SP178SWBKE4YRKPMPBTFP359DMBT025ZC48QEG7HB';
const HIRO      = 'https://api.hiro.so';
const POOL_ADDR = 'SM1FKXGNZJWSTWDWXQZJNF7B5TV5ZB235JTCXYXKD';
// HODLMM_POOL env override lets watcher target a different pool (e.g. dlmm-pool-sbtc-usdcx-v-1-bps-10)
const POOL_NAME = process.env.HODLMM_POOL || 'dlmm-pool-stx-sbtc-v-1-bps-15';
const POOL_FULL = `${POOL_ADDR}.${POOL_NAME}`;
const POOL_FT_ID = `${POOL_FULL}::pool-token`;
const SBTC_ID   = 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc-token';
const BIN_TOKEN_ID_OFFSET = 500;
// Derive bin step from pool name suffix `-bps-N`
const BIN_STEP_BPS = (() => {
  const m = POOL_NAME.match(/-bps-(\d+)$/);
  return m ? parseInt(m[1], 10) : 15;
})();

const http = axios.create({
  timeout: 15000,
  headers: process.env.HIRO_API_KEY ? { 'x-api-key': process.env.HIRO_API_KEY } : {},
});

// ── Clarity encoding helpers ──────────────────────────────────────────────

function addressToCV(address) {
  const [version, hash160] = c32addressDecode(address);
  return '0x05' + version.toString(16).padStart(2, '0') + hash160;
}

function uintToCV(n) {
  return '0x01' + BigInt(n).toString(16).padStart(32, '0');
}

// ── Clarity parsing helpers ───────────────────────────────────────────────

/** Parse Clarity int128 (signed, 16 bytes big-endian) from 32-char hex */
function parseInt128(hex32) {
  const raw = BigInt('0x' + hex32);
  const signBit = BigInt('0x80000000000000000000000000000000');
  if (raw >= signBit) return Number(raw - BigInt('0x100000000000000000000000000000000'));
  return Number(raw);
}

/** Parse Clarity uint128 from 32-char hex */
function parseUint128(hex32) {
  return parseInt('0x' + hex32, 16);
}

/**
 * Parse a Clarity value hex string.
 * Returns a JS number for int/uint, or the inner hex for complex types.
 */
function parseCV(hexValue) {
  if (!hexValue) return null;
  const hex = hexValue.replace('0x', '');
  if (!hex.length) return null;
  const type = parseInt(hex.slice(0, 2), 16);

  if (type === 0x07) return parseCV('0x' + hex.slice(2)); // response-ok: unwrap
  if (type === 0x00) return parseInt128(hex.slice(2, 34)); // int128 (signed)
  if (type === 0x01) return parseUint128(hex.slice(2, 34)); // uint128
  if (type === 0x02) return true;  // bool true
  if (type === 0x03) return false; // bool false
  return hexValue; // return raw for complex types (list, tuple, etc.)
}

/** Parse a Clarity list-of-uint128 response */
function parseUintList(hexValue) {
  if (!hexValue) return [];
  const hex = hexValue.replace('0x', '');
  const type = parseInt(hex.slice(0, 2), 16);

  if (type === 0x07) return parseUintList('0x' + hex.slice(2)); // ok: unwrap
  if (type !== 0x0b) return []; // not a list

  const count = parseInt(hex.slice(2, 10), 16);
  const items = [];
  let offset = 10;
  for (let i = 0; i < count; i++) {
    const itemType = parseInt(hex.slice(offset, offset + 2), 16);
    if (itemType === 0x01) {
      items.push(parseUint128(hex.slice(offset + 2, offset + 34)));
      offset += 34; // 2 type + 32 data = 34 hex chars
    } else {
      break;
    }
  }
  return items;
}

/** Parse a Clarity tuple with uint/int values into a JS object */
function parseTuple(hexValue) {
  if (!hexValue) return {};
  const hex = hexValue.replace('0x', '');
  const type = parseInt(hex.slice(0, 2), 16);

  if (type === 0x07) return parseTuple('0x' + hex.slice(2)); // ok: unwrap
  if (type !== 0x0c) return {};

  const count = parseInt(hex.slice(2, 10), 16);
  let offset = 10;
  const result = {};

  for (let i = 0; i < count; i++) {
    // Key: 1 byte length + ASCII chars
    const keyLen = parseInt(hex.slice(offset, offset + 2), 16) * 2;
    offset += 2;
    const key = Buffer.from(hex.slice(offset, offset + keyLen), 'hex').toString('ascii');
    offset += keyLen;

    // Value: Clarity value (type + data)
    const valType = parseInt(hex.slice(offset, offset + 2), 16);
    if (valType === 0x01) {
      result[key] = parseUint128(hex.slice(offset + 2, offset + 34));
      offset += 34;
    } else if (valType === 0x00) {
      result[key] = parseInt128(hex.slice(offset + 2, offset + 34));
      offset += 34;
    } else if (valType === 0x02 || valType === 0x03) {
      result[key] = valType === 0x02;
      offset += 2;
    } else {
      // Complex inner value — stop parsing (can't easily skip)
      break;
    }
  }
  return result;
}

// ── Contract read-only calls ───────────────────────────────────────────────

async function callReadOnly(fnName, args = []) {
  const url = `${HIRO}/v2/contracts/call-read/${POOL_ADDR}/${POOL_NAME}/${fnName}`;
  const resp = await http.post(url, { sender: STX_ADDR, arguments: args });
  return resp.data;
}

async function getActiveBinId() {
  const r = await callReadOnly('get-active-bin-id');
  return r.okay ? parseCV(r.result) : null;
}

async function getPool() {
  const r = await callReadOnly('get-pool');
  return r.okay ? parseTuple(r.result) : null;
}

async function getVariableFeesData() {
  const r = await callReadOnly('get-variable-fees-data');
  return r.okay ? parseTuple(r.result) : null;
}

async function getOverallSupply() {
  const r = await callReadOnly('get-overall-supply');
  return r.okay ? parseCV(r.result) : null;
}

async function getUserBins() {
  const principalCV = addressToCV(STX_ADDR);
  const r = await callReadOnly('get-user-bins', [principalCV]);
  return r.okay ? parseUintList(r.result) : [];
}

function tokenIdToSignedBin(tokenId) {
  return tokenId - BIN_TOKEN_ID_OFFSET;
}

async function getBinBalances(binId) {
  const r = await callReadOnly('get-bin-balances', [uintToCV(binId)]);
  return r.okay ? parseTuple(r.result) : null;
}

/** Get user's LP balance at a specific bin (token-id = bin-id) */
async function getUserBalanceAtBin(binId) {
  const principalCV = addressToCV(STX_ADDR);
  const r = await callReadOnly('get-balance', [uintToCV(binId), principalCV]);
  if (!r.okay) return 0;
  return parseCV(r.result) || 0;
}

/** Get user's LP balance from Hiro FT balances */
async function getLpBalance() {
  const resp = await http.get(`${HIRO}/extended/v1/address/${STX_ADDR}/balances`);
  const fts = resp.data.fungible_tokens || {};
  return parseInt(fts[POOL_FT_ID]?.balance || '0');
}

/** Get pool contract's STX + sBTC holdings (= total TVL) */
async function getPoolTvl() {
  const resp = await http.get(`${HIRO}/extended/v1/address/${POOL_FULL}/balances`);
  const stxUstx = parseInt(resp.data.stx?.balance || '0');
  const fts = resp.data.fungible_tokens || {};
  const sbtcSats = parseInt(fts[SBTC_ID]?.balance || '0');
  return { stx_ustx: stxUstx, sbtc_sats: sbtcSats };
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main(options = {}) {
  const [activeBinId, poolInfo, feesData, overallSupply, userBins, lpBalance, poolTvl] =
    await Promise.all([
      getActiveBinId().catch(() => null),
      getPool().catch(() => null),
      getVariableFeesData().catch(() => null),
      getOverallSupply().catch(() => null),
      getUserBins().catch(() => []),
      getLpBalance().catch(() => 0),
      getPoolTvl().catch(() => ({ stx_ustx: 0, sbtc_sats: 0 })),
    ]);

  // Range analysis
  const signedUserBins = userBins.map(tokenIdToSignedBin);
  const minBin   = signedUserBins.length > 0 ? Math.min(...signedUserBins) : null;
  const maxBin   = signedUserBins.length > 0 ? Math.max(...signedUserBins) : null;
  const inRange  = (activeBinId !== null && minBin !== null && maxBin !== null)
    ? activeBinId >= minBin && activeBinId <= maxBin
    : null;
  const binsOutOfRange = (activeBinId !== null && minBin !== null)
    ? Math.max(0, minBin - activeBinId, activeBinId - maxBin)
    : null;

  // Price drift estimation: (1 + bin_step/10000)^distance
  const priceDriftPct = binsOutOfRange !== null && binsOutOfRange > 0
    ? (((1 + BIN_STEP_BPS / 10000) ** binsOutOfRange - 1) * 100).toFixed(2)
    : null;

  // Position value via TVL share
  const shareRatio = (overallSupply && overallSupply > 0) ? lpBalance / overallSupply : null;
  const userSbtcSats = shareRatio ? Math.floor(poolTvl.sbtc_sats * shareRatio) : 0;
  const userStxUstx  = shareRatio ? Math.floor(poolTvl.stx_ustx  * shareRatio) : 0;

  // Fee rate from pool or variable fees
  const feeRateBps = poolInfo?.['x-provider-fee'] ?? poolInfo?.['protocol-fee'] ?? BIN_STEP_BPS;

  // Bin details: per-bin pool balances + user share
  let binDetails = [];
  let userStxFromBins = 0;
  let userSbtcFromBins = 0;

  if (userBins.length > 0) {
    const binData = await Promise.all(
      userBins.slice(0, 20).map(async (binId) => {
        const [bal, userBinLp] = await Promise.all([
          getBinBalances(binId).catch(() => null),
          getUserBalanceAtBin(binId).catch(() => 0),
        ]);
        return { binId, bal, userBinLp };
      })
    );

    for (const { binId, bal, userBinLp } of binData) {
      const binShares = bal?.['bin-shares'] ?? 0;
      const binX      = bal?.['x-balance'] ?? 0; // uSTX (STX is x-token)
      const binY      = bal?.['y-balance'] ?? 0; // sats (sBTC is y-token)
      const userShare = binShares > 0 ? userBinLp / binShares : 0;
      const userX = Math.floor(binX * userShare);
      const userY = Math.floor(binY * userShare);
      userStxFromBins  += userX;
      userSbtcFromBins += userY;
      binDetails.push({
        token_id:      binId,
        bin_id:        tokenIdToSignedBin(binId),
        is_active:     tokenIdToSignedBin(binId) === activeBinId,
        bin_shares:    binShares,
        user_bin_lp:   userBinLp,
        user_share_pct: binShares > 0 ? (userShare * 100).toFixed(4) + '%' : '0%',
        pool_x_ustx:   binX,   // STX in uSTX
        pool_y_sats:   binY,   // sBTC in sats
        user_stx_ustx: userX,
        user_sbtc_sats: userY,
      });
    }
  }

  // Use bin-level calculation when available (both tokens together), fall back to TVL share
  const hasBinData = binDetails.length > 0;
  const finalUserStxUstx  = hasBinData ? userStxFromBins  : (shareRatio ? Math.floor(poolTvl.stx_ustx  * shareRatio) : 0);
  const finalUserSbtcSats = hasBinData ? userSbtcFromBins : (shareRatio ? Math.floor(poolTvl.sbtc_sats * shareRatio) : 0);

  const result = {
    timestamp: new Date().toISOString(),
    pool:      POOL_FULL,
    active_bin: activeBinId,
    user_bins:  signedUserBins,
    user_bin_token_ids: userBins,
    range: {
      min_bin:          minBin,
      max_bin:          maxBin,
      in_range:         inRange,
      bin_count:        userBins.length,
      bins_out_of_range: binsOutOfRange,
      price_drift_pct:  priceDriftPct ? `${priceDriftPct}%` : null,
    },
    position: {
      lp_tokens:      lpBalance,
      total_supply:   overallSupply,
      share_pct:      shareRatio ? (shareRatio * 100).toFixed(6) + '%' : 'unknown',
      est_sbtc_sats:  finalUserSbtcSats,
      est_stx_ustx:   finalUserStxUstx,
      calc_method:    userStxFromBins > 0 ? 'per-bin' : 'tvl-share',
    },
    pool_tvl: {
      stx_ustx:  poolTvl.stx_ustx,
      sbtc_sats: poolTvl.sbtc_sats,
    },
    fee_rate_bps: feeRateBps,
    fees_note:    'Unclaimed fees are embedded in bin balances and realized on withdrawal.',
    variable_fees: feesData,
    bin_details:  binDetails,
  };

  // Human-readable summary
  const rangeEmoji = inRange === true  ? '✅ EM RANGE'
                   : inRange === false ? '🚨 FORA DO RANGE'
                   : '❓ range desconhecido';

  const driftNote = priceDriftPct
    ? ` (preço deslocou ~${priceDriftPct}% do range)`
    : '';

  const summaryLines = [
    `🐕 Bitflow HODLMM — STX/sBTC`,
    `📍 Bin ativo:   ${activeBinId ?? '?'}`,
    `📊 Seus bins:   ${signedUserBins.join(', ') || 'nenhum'} (range ${minBin ?? '?'} → ${maxBin ?? '?'})`,
    `🎯 Status:      ${rangeEmoji}${driftNote}`,
    ``,
    `💧 Posição estimada (${shareRatio ? (shareRatio * 100).toFixed(4) : '?'}% do pool):`,
    `   sBTC: ${(finalUserSbtcSats / 1e8).toFixed(8)} BTC (${finalUserSbtcSats} sats)`,
    `   STX:  ${(finalUserStxUstx / 1e6).toFixed(4)} STX (${finalUserStxUstx} uSTX)`,
    `   LP:   ${lpBalance.toLocaleString()} / ${overallSupply?.toLocaleString() ?? '?'}`,
    ``,
    `💸 Taxa do pool: ${feeRateBps} bps (${feeRateBps / 100}%)`,
    `⚠️  Taxas acumuladas: embutidas no saldo dos bins, realizadas no saque.`,
  ];

  if (inRange === false && binsOutOfRange !== null) {
    summaryLines.push(``, `🔔 Ação sugerida: colher fees e reposicionar range (${binsOutOfRange} bins deslocado).`);
  }

  if (!options.silent) {
    process.stderr.write(summaryLines.join('\n') + '\n');
    console.log(JSON.stringify(result));
  }
  return result;
}

module.exports = { main };
if (require.main === module) {
  main().catch(err => { process.stderr.write(`Erro: ${err.message}\n`); process.exit(1); });
}
