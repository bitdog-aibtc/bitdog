# Proof bundle integrity

[`manifest.sha256`](manifest.sha256) contains a SHA-256 digest for every public source, document,
schema, receipt, test, and workflow in this repository, excluding the manifest itself.

Verify the committed bundle:

```bash
npm run verify:manifest
```

Maintainers regenerate it only after all intended public changes pass the disclosure audit:

```bash
npm run audit:public
npm run build:manifest
npm run verify:manifest
```

The manifest proves byte-level integrity relative to the Git commit. It is not a signature and does not
grant authority to transact.
