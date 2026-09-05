# Sanctum SecOps — Admin Console Demo (Multi-Section)

A full admin command console mirroring the **Alliance** golden image. On-brand
dark UI (midnight / violet / gold), branded entry/logout sequence, identity
strip, sidebar nav, and seven operational sections — of which the Validation
Arena is one.

## Entry → Console → Logout

1. **Corridor (server) gate** — `sanctum-gate.js` push-in dolly, gold hexagon
   seal, `ACCESS GRANTED`.
2. **Branded "Signing In" card** — `session-gate.js` — the Alliance sign-out
   card reversed for entry, now on-brand (midnight surface, violet border
   glow, gold seal + gold divider, JetBrains Mono checklist, green checks):
   - Issuing session token → Loading local key material → Signing in to
     Microsoft Entra ID → Establishing Cloudflare Access session →
     Unsealing vault
3. **Vault unsealed** — open padlock, `VAULT UNSEALED`, gold "Enter Console".
4. **Logout** — "Signing Out" (Alliance verbatim) → `VAULT SEALED`
   (closed padlock) → "Re-authenticate".

## Identity strip (top)

Chips listing the federal + corporate identity: `Brian@sso-labs.com`,
`sanctumsecops.com`, `CAGE 20XS3`, `UEI H3A2Z4R3HE87`, `DUNS 145042588`,
`EIN 42-2733487`, `Pine City, NY`.

## Sections (sidebar)

| # | Section | Contents |
|---|---------|----------|
| 01 | Command Center | Estate + service-health status, KPIs, domain posture (flags the live `sanctumsecops.com` 500s as P0) |
| 02 | Validation Arena | 5 stage tiles (spinner→check), streaming console, stats, action loading buttons (Run Suite / Download .p12 / Issue Certificate) |
| 03 | PKI / CertOps | CA health KPIs, recently-issued table, revocation surfaces, Mint .p12 / Renew buttons |
| 04 | Trust Domains | 9 domain cards with DNS/TLS/status badges |
| 05 | Compliance / CMMC | 110-control readiness KPIs, federal identity table, control-family rows |
| 06 | SOC / Telemetry | Endpoint/alert/ingest KPIs + live alert stream |
| 07 | Vault / Access | Session material + trust fabric rows, Re-issue Session Token |

## Action loading buttons

Buttons enter a loading state on click — spinner + rotating status text →
green check (e.g. Download .p12: Generating keypair… → Securing p12… →
Signing with CA… → triggers a `.p12` download). Same pattern drives the PKI
and Vault action buttons.

## Files

- `index.html` — multi-section admin shell (entry sequence + 7 sections).
- `session-gate.js` — branded Signing In / Signing Out card.
- `sanctum-gate.js` — corridor (server) gate.
- `intro/corridor.jpg` — corridor background.

## API

```js
// Entry chain (auto on load):
SanctumGate.play({ dir:'enter', action:'access-granted' }, () => {
  SessionGate.signIn({ autoEnter:true, onDone: revealConsole });
});
// Logout:
SessionGate.signOut({ onDone: () => location.reload() });
// Action loading button helper:
runAction(btn, ['Generating keypair…','Securing p12…','Signing with CA…','p12 ready'], done);
```

## Live-style data, not production backend

The arena console, SOC alert stream, KPIs, and domain statuses are
**simulated live-style data** for the demo. To make it production-real on
`.176`, wire the `advance()` loop / alert stream to a WebSocket/SSE/polling
endpoint that pushes real CygnetLib test events and estate telemetry. The
entry/logout sequence is independent of the data source.

## Brand

midnight `#0A0814` / violet `#7C3AED` `#A78BFA` / gold `#F5D060` / pass
`#22C55E`. Cormorant Garamond display, Manrope UI, JetBrains Mono code.
Gold hexagon + three-prong mark seal. Gold reserved for federal/trust signals.
