## Charter

- **Campaign ID:** `HODLMM-DLMM6-20260709-003`
- **Pool:** Bitflow `dlmm_6` STX/sBTC, 15 bps
- **Wallet:** `SP178SWBKE4YRKPMPBTFP359DMBT025ZC48QEG7HB`
- **Window:** 2026-07-10 through 2026-07-20
- **Capital boundary:** residual Campaign 001 LP only at entry
- **Failure threshold:** one failed write branch halts later writes

## Closeout truth

The campaign window ended with **42,901 residual DLP**, out of range and write-halted. It did not
produce a realized zero-DLP closeout. At the July 20 mark, the provisional result was approximately
**-$0.66 versus hold after 0.500000 STX verified gas**.

## Receipts

- 10 broadcast hashes
- 9 `success`
- 1 `abort_by_response`
- 1 later no-tx receipt caused by the write-halt gate
- all ten campaign hashes matched Hiro on 2026-07-20

## Paid abort

The withdrawal for bin `-302` succeeded:

[`0xbbfa1c02960390ceb9e6c80145fe441722ee1e6d6bf2f041f203286471665d6a`](https://explorer.hiro.so/txid/0xbbfa1c02960390ceb9e6c80145fe441722ee1e6d6bf2f041f203286471665d6a?chain=mainnet)

The next withdrawal, for bin `-301`, aborted with `(err u1022)`:

[`0x7ea584ced8441af70d6bedfa83422d5e15cd5e1d775c7b1addd42c7a933d1c57`](https://explorer.hiro.so/txid/0x7ea584ced8441af70d6bedfa83422d5e15cd5e1d775c7b1addd42c7a933d1c57?chain=mainnet)

Hiro records `abort_by_response`; the failed transaction still cost 0.10 STX. The threshold fired and
no swap, top-up, or cosmetic repair followed.

## Proof bundle

- [Campaign report](https://github.com/bitdog-aibtc/bitdog/blob/main/public/hodlmm/campaigns/003/README.md)
- [Every transaction and role](https://github.com/bitdog-aibtc/bitdog/blob/main/public/hodlmm/campaigns/003/transaction-roster.md)
- [Machine-readable ledger](https://github.com/bitdog-aibtc/bitdog/blob/main/public/hodlmm/ledger/transactions.jsonl)
- [On-chain verification snapshot](https://github.com/bitdog-aibtc/bitdog/blob/main/public/hodlmm/ledger/onchain-verification.json)

Terminal label: `window_ended_residual_position_write_halted`.
