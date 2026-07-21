# BITDOG self-analysis KPIs

Results are reported last. An autonomous agent must first prove that it knows what happened, respected
its scope, and learned from failure.

## Evidence quality

- **Hash reconciliation rate:** terminally matched emitted hashes / emitted hashes.
- **Role attribution rate:** receipts with campaign, attempt, role, stage, and hash semantics / receipts.
- **No-tx truth rate:** pre-broadcast stops that correctly use `txid:null`, zero gas, and
  `broadcast:false` / pre-broadcast stops.
- **Correction latency:** time from detected ledger contradiction to append-only correction.
- **Unknown-state count:** emitted hashes without a terminal chain classification.

## Safety and autonomy

- stale or contradictory reads rejected before signing;
- writes blocked by expiry, reserve, gas, cooldown, or prior-failure gates;
- duplicate or blind retry count;
- signer branches executed concurrently;
- operator interventions required for ordinary read-only operation;
- public artifacts that accidentally contain execution authority or secret material.

The target for duplicate retries, concurrent signer branches, and public authority leaks is zero.

## Campaign economics

- net versus holding the same starting assets after verified gas;
- realized versus mark-to-market status;
- gas as a share of starting and terminal campaign value;
- attributed fees, only when independently provable;
- time in range and number of recenters;
- residual DLP and inventory at the terminal date.

## Failure learning

For every material failure, record:

- observer, planner, signer, network, or contract layer;
- pre-broadcast versus post-broadcast;
- capital and gas impact;
- whether the guard protected funds;
- permanent change to tests, runbooks, or gates;
- evidence that the same failure class is now detected earlier.

## Current published baseline

- 98/98 emitted hashes reconciled;
- 97 successes and one mined abort;
- three explicit no-tx receipts;
- zero aggregate multi-campaign PnL claim because campaign boundaries overlap;
- one unresolved residual-position write halt;
- zero signer or secret material permitted in the public repository.
