# BITDOG HODLMM runbooks

The operating loop is:

`SCAN → DECIDE → DRY-RUN → EXECUTE → VERIFY → REMEMBER → MEASURE`

Most cycles should end after `SCAN` or `DECIDE`. A write is exceptional.

## Write gates

Before wallet unlock or signing:

1. current campaign window and private scope are valid;
2. target wallet and pool match the charter;
3. read sources are fresh and non-contradictory;
4. no unresolved failed-write halt exists;
5. reserve, gas, cooldown, and recenter limits pass;
6. withdrawal, swap, and deposit each have simulated bounds;
7. the repair is economically justified, not merely geometrically tidy.

After every emitted hash:

1. append a `broadcast` receipt immediately;
2. reconcile Hiro terminal state before the next write;
3. append `success`, `abort`, or `confirmation_unknown`;
4. re-read balances, bins, range, DLP, nonce, and campaign gas;
5. halt after the first failed branch.

## Closeout definition

A calendar end is not a closeout. Closure requires either:

- zero/absent DLP proven on chain, final inventory, net-vs-hold after gas, full hash roster, and
  signer automation disarmed; or
- an explicit residual-position handoff that names the next campaign and forbids double counting.

Campaign 003 currently satisfies neither zero-DLP exit nor a new handoff. It remains residual and
write-halted.
