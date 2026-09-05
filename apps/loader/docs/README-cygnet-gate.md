# CygnetLib Validation Gate

Cinematic validation loaders for the Sanctum SecOps validation arena. Same
on-brand corridor aesthetic as `sanctum-gate` (deep midnight + violet/gold,
fog, bloom, twinkling embers, manifesting gold hexagon seal), re-skinned to
the **CygnetLib** identity: the gold three-pronged mark inside a purple
hexagon, with a `CYGNETLIB` wordmark, a **provider** line, and a fingerprint —
exactly like the CYGNET CERTIFIED document seal in the Cygnus deposit PDFs.

Status text is driven by validation **type + stage**, so one loader covers
"whatever type of validation" you run.

## Files

- `cygnet-gate.js` — drop-in loader module (no framework, no build).
- `index.html` — the validation arena demo (IETF interop runner UI + Run Suite).
- `intro/corridor.jpg` — the server-corridor background (from pki.sanctumsecops.com).

## Drop-in usage

```html
<script src="cygnet-gate.js" data-img="intro/corridor.jpg"></script>
<script>
  // Play one stage of a validation type:
  CygnetGate.play({ validationType: 'ietf-interop', stage: 'verify-pass' });

  // Override the provider (shown under the wordmark):
  CygnetGate.play({ validationType: 'pki-chain', stage: 'execute', provider: 'OpenSSL 3.5' });

  // Free-form status text (auto-detected pass/fail by keyword):
  CygnetGate.play({ text: 'CONFORMANCE VERIFIED', provider: 'oqs-provider 0.12' });

  // Run a full suite: cycles Queue -> Boot -> Collect -> Execute -> Verify(-pass).
  CygnetGate.runSuite('ietf-interop', {
    provider: 'oqs-provider 0.12',
    onStage: (key, statusText) => console.log(key, statusText),
    pass: false,                 // set false to end on a fail terminal
    done: () => console.log('suite complete')
  });
</script>
```

## Validation types

Each type ships a default provider and a stage->text map covering the arena's
Queue -> Boot -> Collect -> Execute -> Verify progression, plus pass/fail
terminals:

| Type | Default provider | Pass terminal | Fail terminal |
|---|---|---|---|
| `ietf-interop` | oqs-provider 0.12 | CONFORMANCE VERIFIED | CONFORMANCE FAILED |
| `pki-chain` | sanctum-root-ca-g1 | CHAIN VERIFIED | CHAIN BROKEN |
| `pqc-readiness` | CygnetLib 1.0.0 | PQC READY | PQC GAP FOUND |
| `cmmc-controls` | Sanctum SecOps | CONTROLS VERIFIED | CONTROL GAP |
| `crypto-selftest` | CygnetLib 1.0.0 | SELF-TEST PASSED | SELF-TEST FAILED |
| `provider-attest` | cygnus.sso.corp | PROVIDER ATTESTED | ATTESTATION INVALID |

Add your own with `CygnetGate.TYPES['my-type'] = { provider, stages: {...} }`.

## API

- `CygnetGate.play(opts[, done])` — `opts`: `{ validationType, stage, provider, text }`.
  Shows the corridor, manifesting seal, `CYGNETLIB`, provider, fingerprint, and status.
- `CygnetGate.runSuite(type, opts, done)` — plays the 5 stages + a terminal.
- `CygnetGate.TYPES` — the registry (inspect or extend).

## Brand

midnight `#0A0814` / violet `#7C3AED` `#A78BFA` / gold `#F5D060` `#D4A017`.
Cormorant Garamond display, JetBrains Mono code. Respects
`prefers-reduced-motion`.

## Standalone domain

To point a dedicated domain at it, set the corridor image to an absolute URL:
`data-img="https://your.cdn/corridor.jpg"` (or set `window.CYGNET_GATE_IMG`).
