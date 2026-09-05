# Sanctum Auth0 Universal Login — v4 Gate

Cinematic, on-brand Auth0 New Universal Login template. The initial
purple-server + logo-unlock sequence is the entry point; the Auth0 credential
gate folds in only after the trust ring completes and the padlock unseals.

## Files

- `auth0-universal-login-sanctum-v4.html` — **production** template. Upload to
  Auth0 → Branding → Universal Login → Custom. Keeps the Liquid placeholders
  `{%- auth0:head -%}` (in `<head>`) and `{%- auth0:widget -%}` (inside `.gate`)
  exactly as Auth0 requires.
- `preview.html` — QA harness only. Same file, but the placeholders are swapped
  for a mock login card and a charset meta, so the rendered experience can be
  screenshotted without Auth0. Never upload this to Auth0.

## The sequence

6-stage trust ring (each segment lights, then "done"), synced to a mono
telemetry stream and trust-stack chips:

1. Cloudflare edge route prepared → **Cloudflare**
2. Auth0 challenge mounted → **Auth0**
3. Zero Trust policy context loaded → **Cloudflare**
4. FIPS baseline context loaded
5. Data plane standby — Supabase / Neon → **Supabase**, **Neon**
6. GitHub source attestation referenced → **GitHub**

Then: padlock shackle swings open (3D rotate), body + shackle shift to gold,
gold halo blooms, "SANCTUM" wordmark turns gold, and the glass gate **folds in**
via perspective + clip-path (not a basic fade) revealing the Auth0 widget.

Wording is choreographic ("prepared / mounted / standby / referenced") — never
claims live health or auth success before login. The "armed" state means the
identity prompt is ready, not that credentials were accepted.

## Behavior

- **Idle seal (15 min, 60s warning):** ring reverses, padlock closes, gate
  desaturates + blurs, "Session sealed" shown. UX timer only — does not touch
  Auth0 storage or session state.
- **Reduced motion:** ring completes instantly, gate opens immediately, the
  rotating aperture and particle canvas are disabled. Widget is usable at T0.
- **Background:** procedural violet/gold particle-orbit canvas + slow conic
  "server aperture" iris. Pure procedural (no image draw, no canvas readback) so
  it is unaffected by the opaque-origin preview iframe and degrades to the CSS
  gradient if canvas is unsupported.
- **Widget styling:** scoped descendant selectors under `.gate` only — never
  global `input{}`/`button{}`. Gate uses opacity/transform/pointer-events, not
  `display:none`, so Auth0's widget measurement/rendering is not disrupted.

## Stack reflected

Cloudflare (edge + Zero Trust), Auth0 (identity challenge), Supabase + Neon
(data plane), GitHub (source attestation). FIPS 140-3 baseline assumed at the
provider level; only TLS 1.3 to the edge and Auth0 APIs.

## Install in Auth0

1. Auth0 dashboard → Branding → Universal Login → Login tab → "Show advanced
   options" → HTML toggle.
2. Paste the full contents of `auth0-universal-login-sanctum-v4.html`.
3. Save → Preview. The widget renders inside `.gate` after the unlock sequence.
