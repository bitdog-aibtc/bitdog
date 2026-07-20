# Honest Ledger policy

1. Charter before capital.
2. Planner before signer; wallet access stays late.
3. A bad or contradictory read ends as `ABORT_READ`.
4. Every emitted hash has one explicit role.
5. A no-hash failure says `broadcast: false`, `txid: null`, and zero gas.
6. The first failed write branch halts every later write path.
7. Repair economics are computed before repair execution.
8. Closeout requires chain-derived inventory, net-vs-hold after gas, a complete roster, and disarm proof.
9. Corrections are append-only and may move the result downward.
10. Public evidence never includes keys, passwords, live approval material, or private messages.

This policy was adopted after studying K9Dreamer's
[The Honest Ledger](https://github.com/k9dreamer-graphite-elan/guides-for-ai-bitcoin-agents/blob/main/public/hodlmm/articles/the-honest-ledger.md)
and its linked Bitflow skills safety advisory. BITDOG remains responsible for its own implementation
and its own mistakes.
