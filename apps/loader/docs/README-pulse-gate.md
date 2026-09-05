# Sanctum SecOps — Pulse Gate

A "session establish" / transition loader matching the live gate at
`mmk6.sanctumsecops.com`. Solid midnight background, three gold-to-purple
bars, `CYGNUS SANCTUM` + `SANCTUM SECOPS` wordmark, and a status line that
changes per transition. A rhythmic horizontal-blur glitch pulse hits the bars
+ `CYGNUS SANCTUM` while the wordmark stays sharp.

Use it "in certain transitions" — establishing a secure session, syncing the
vault, routing through Zero Trust, decrypting a workspace, reconnecting a
channel, handshake, auth, or a secure handoff. Each transition carries its
own status text.

## Files

- `pulse-gate.js` — drop-in loader module (no framework, no build).
- `index.html` — demo: a grid of transitions; click any to play its status.

## Drop-in usage

```html
<script src="pulse-gate.js"></script>
<script>
  // Play a preset transition (auto-fades after ~2.6s):
  PulseGate.play({ transition: 'vault' });

  // Free-form status text:
  PulseGate.play({ text: 'DECRYPTING WORKSPACE', hold: 3000 });

  // Hold open (pulsing) until you close it — ideal for real transitions:
  PulseGate.hold({ transition: 'handshake' });
  // ...await your async work...
  PulseGate.close();
</script>
```

## Transitions

| Key | Status text |
|---|---|
| `session` | ESTABLISHING SECURE SESSION |
| `vault` | SYNCING VAULT |
| `zerotrust` | ROUTING THROUGH ZERO TRUST |
| `decrypt` | DECRYPTING WORKSPACE |
| `reconnect` | RECONNECTING SECURE CHANNEL |
| `handshake` | HANDSHAKE IN PROGRESS |
| `auth` | AUTHENTICATING IDENTITY |
| `handoff` | SECURE HANDOFF |

Add your own: `PulseGate.TRANSITIONS['my-flow'] = 'MY STATUS TEXT'`.

## API

- `PulseGate.play(opts[, done])` — `opts`: `{ transition, text, hold }`.
  Pulses for `hold` ms (default 2600) then fades.
- `PulseGate.hold(opts)` — opens and pulses until `close()` is called.
- `PulseGate.close([instant])` — fades out (or removes instantly).

## Brand

midnight `#0A0814` / violet `#7C3AED` `#A78BFA` / gold `#F5D060` `#D4A017`.
Manrope wordmark, JetBrains Mono labels. Responsive at 375px; respects
`prefers-reduced-motion`.

## Integration pattern for real transitions

```js
// Route guard / before-navigation:
PulseGate.hold({ transition: 'session' });
await fetch('/api/session', { credentials: 'include' });
PulseGate.close();
navigate('/secure-area');
```
