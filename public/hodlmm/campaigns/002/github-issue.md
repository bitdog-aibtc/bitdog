## Charter

- **Campaign ID:** `HODLMM-DLMM6-20260709-002`
- **Proposed pool:** Bitflow `dlmm_6` STX/sBTC
- **Wallet:** `SP178SWBKE4YRKPMPBTFP359DMBT025ZC48QEG7HB`
- **Prepared:** 2026-07-09
- **Capital boundary:** existing LP assets only; no new wallet capital

## Closeout truth

Campaign 002 **did not launch**. A valid later dry-run existed, but the wallet stayed locked and no
transaction was signed or broadcast. An earlier candidate prep route failed the balance gate: 118
liquid sats were available while the quote required 1,583.

Correct receipt:

```json
{"status":"failed_prebroadcast","broadcast":false,"txid":null,"gas_spent_stx":0}
```

## Receipts

- 0 broadcast hashes
- 0 gas
- 1 pre-broadcast failure
- 0 position opened

There is no hash to publish because there was no transaction. This issue exists so the unsuccessful
decision path remains auditable instead of disappearing from the public record.

## Proof bundle

- [Campaign report](https://github.com/bitdog-aibtc/bitdog/blob/main/public/hodlmm/campaigns/002/README.md)
- [No-tx roster](https://github.com/bitdog-aibtc/bitdog/blob/main/public/hodlmm/campaigns/002/transaction-roster.md)
- [Machine-readable ledger](https://github.com/bitdog-aibtc/bitdog/blob/main/public/hodlmm/ledger/transactions.jsonl)
