# Sanctum Stage Gate

A cinematic entry/exit loader for the Sanctum SecOps web estate. This is a
faithful, brand-accurate generalization of the loader running at
`pki.sanctumsecops.com` (`sanctum-intro.original.js` is the reference source).

The **only** things that vary between an entry and an exit are:

1. The transitional direction of the camera dolly
   - `enter` → forward push-in  (scale 1.03 → 1.34)
   - `exit`  → reverse pull-back (scale 1.34 → 1.03)
2. The status text shown beneath the seal.

Every other aesthetic element — corridor image, palette, fog, bloom,
vignette, gold flash, hexagon seal, twinkling embers, timings, letter-spacing,
and fade — is identical to the original.

## Brand

- Colors: midnight `#0A0814`, violet `#7C3AED` / `#A78BFA`, gold `#F5D060` / `#D4A017`
- Type: Cormorant Garamond (display), Manrope/Satoshi (body), JetBrains Mono (code)
- Seal: gold three-pronged mark inside a purple hexagon

## Files

| File | Purpose |
|---|---|
| `sanctum-gate.js` | The loader module (drop-in, no framework) |
| `intro/corridor.jpg` | The corridor background (from the live site) |
| `index.html` | Demo gateway page + controls for every action |
| `sanctum-intro.original.js` | Original reference loader (for diffing) |

## Drop-in usage

```html
<!-- auto entry on first paint -->
<script src="sanctum-gate.js"
        data-auto-enter="access-granted"
        data-img="intro/corridor.jpg"></script>

<!-- exit before navigating away -->
<a href="/logout" data-gate-exit="session-secured">Sign out</a>
<a href="https://sanctumsecops.com/" data-gate-exit data-gate-text="CLOSING SANCTUM">Home</a>
```

## Programmatic API

```js
SanctumGate.play('session-secured');                        // by action key
SanctumGate.play({ action: 'vault-opened' });               // text from registry
SanctumGate.play({ dir: 'exit', text: 'PERIMETER SEALED' }); // explicit
SanctumGate.registerActions({                               // custom action
  revoke: { dir: 'exit', text: 'REVOCATION COMPLETE' }
});
```

## Action registry

| Direction | Key | Status text |
|---|---|---|
| enter | `access-granted` | ACCESS GRANTED |
| enter | `identity-verified` | IDENTITY VERIFIED |
| enter | `chain-verified` | CHAIN VERIFIED |
| enter | `vault-opened` | VAULT OPENED |
| exit | `session-secured` | SESSION SECURED |
| exit | `access-closed` | ACCESS CLOSED |
| exit | `identity-cleared` | IDENTITY CLEARED |
| exit | `perimeter-sealed` | PERIMETER SEALED |

Add custom actions with `SanctumGate.registerActions({ key: { dir, text } })`.

## Standalone domain

This folder is a static site — point a domain (e.g. `gate.sanctumsecops.com`)
at it and it runs as the entry/exit to the estate. `data-img` must point at
`intro/corridor.jpg` relative to the page (or an absolute URL).

## Accessibility

`prefers-reduced-motion: reduce` collapses all animations to ~1ms.
