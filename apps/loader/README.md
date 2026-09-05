# Sanctum SecOps — Web Estate Loaders

Everything that was scattered across `artifacts-1of5 … 6of6.zip` in
`~/Pictures/LOADERS`, unpacked, deduplicated, wired together, and served from one
control panel. **No build step, no npm, no framework.** Plain files.

Start here:

```bash
cd ~/sanctum/webestate && ./serve.sh
```

Then open http://localhost:8080/ — the control panel enumerates every sequence
directly from each module's registry and plays it on click.

---

## Layout

```
~/sanctum/webestate/
├── index.html                 control panel (fires every sequence)
├── serve.sh                   local static server on :8080
├── lib/                       the loader modules — ONE canonical copy each
│   ├── sanctum-gate.js          corridor entry/exit gate      -> window.SanctumGate
│   ├── pulse-gate.js            session transitions, depth+shimmer -> window.PulseGate
│   ├── pulse-gate.glitch.js     same API, blur-glitch treatment    -> window.PulseGate
│   ├── cygnet-gate.js           CygnetLib validation gate      -> window.CygnetGate
│   ├── session-gate.js          sign-in / sign-out card        -> window.SessionGate
│   └── sanctum-intro.original.js  reference loader from pki.sanctumsecops.com
├── shared/intro/corridor.jpg  the corridor plate — ONE copy, symlinked into demos
├── demos/                     the original demo pages, untouched
│   ├── stage-gate/  pulse-gate/  cygnet-gate/  admin-console/
│   └── auth0-gate/  (production template + preview harness)
├── docs/                      per-module READMEs, site audit, deployment runbook
└── tools/Sync-SanctumBrand.ps1
```

`pulse-gate.js` and `pulse-gate.glitch.js` both claim `window.PulseGate` and
each guards on it, so **load only one per page**. The control panel switches
between them with `?pulse=depth` / `?pulse=glitch`.

Files inside `demos/*/` named `sanctum-gate.js`, `intro/`, etc. are **symlinks**
into `lib/` and `shared/`. Edit the file in `lib/` and every demo picks it up.
If you copy a demo to a server that does not follow symlinks, dereference first:
`cp -RL demos/admin-console /var/www/console`.

---

## Sequence inventory

| Module | Count | Registry | Extend with |
|---|---|---|---|
| Stage gate | 8 | `SanctumGate.ACTIONS` | `SanctumGate.registerActions({ key:{dir,text} })` |
| Pulse gate | 8 | `PulseGate.TRANSITIONS` | `PulseGate.TRANSITIONS['key'] = 'TEXT'` |
| Validation gate | 6 types × 6 stages = 36 | `CygnetGate.TYPES` | `CygnetGate.TYPES['type'] = {provider,stages}` |
| Session card | 2 (in / out) | `SessionGate.STEPS` | edit `STEPS` |

**54 named sequences total**, plus `CygnetGate.runSuite()` which chains five
stages and a pass/fail terminal, and the composite login/logout chains.

---

## Drop-in usage on a real page

```html
<!-- entry gate on first paint, then the sign-in card, then reveal the app -->
<script src="/lib/sanctum-gate.js" data-img="/shared/intro/corridor.jpg"></script>
<script src="/lib/session-gate.js"></script>
<script>
  SanctumGate.play({ dir:'enter', action:'access-granted' }, function () {
    SessionGate.signIn({ autoEnter:true, onDone: revealConsole });
  });
</script>

<!-- exit gate intercepts the click and navigates after the animation -->
<a href="/logout" data-gate-exit="session-secured">Sign out</a>
```

Wrap real async work with the hold/close pattern instead of a fixed timer:

```js
PulseGate.hold({ transition:'session' });
await fetch('/api/session', { credentials:'include' });
PulseGate.close();
```

`data-img` must resolve from the *page*, not from the script — use an absolute
path (`/shared/intro/corridor.jpg`) or set `window.CYGNET_GATE_IMG` before the
CygnetLib gate loads.

---

## Publishing to the estate

These are static assets — drop `lib/` and `shared/` at the document root of
whichever host serves the estate and reference them absolutely.

Apache (`/etc/apache2/sites-available/…`):

```apache
Alias /lib    /var/www/sanctum/lib
Alias /shared /var/www/sanctum/shared
<Directory /var/www/sanctum>
  Require all granted
  Options -Indexes +FollowSymLinks
</Directory>
# long-cache the immutable plate, short-cache the modules while iterating
<LocationMatch "^/shared/intro/">
  Header set Cache-Control "public, max-age=31536000, immutable"
</LocationMatch>
<LocationMatch "^/lib/.*\.js$">
  Header set Cache-Control "public, max-age=300"
</LocationMatch>
```

Rsync from here:

```bash
rsync -avL --delete ~/sanctum/webestate/lib/    user@host:/var/www/sanctum/lib/
rsync -avL --delete ~/sanctum/webestate/shared/ user@host:/var/www/sanctum/shared/
```

`-L` dereferences the symlinks so the remote gets real files.

Purge Cloudflare after a module change:

```bash
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $CF_API_TOKEN" -H 'content-type: application/json' \
  -d '{"files":["https://sanctumsecops.com/lib/sanctum-gate.js"]}'
```

---

## Accessibility

Every module collapses to ~1ms under `prefers-reduced-motion: reduce`. The Auth0
gate additionally opens instantly and disables the particle canvas and rotating
aperture, so the credential widget is usable at T0. Test it:
**System Settings → Accessibility → Display → Reduce motion.**

---

## Auth0

The Universal Login template lives at
`demos/auth0-gate/auth0-universal-login-sanctum-v4.html` and the Management API
proxy at `~/sanctum/comet-auth0/`. See `~/sanctum/comet-auth0/README.md`.

Brand: midnight `#0A0814` · violet `#7C3AED` / `#A78BFA` · gold `#F5D060` / `#D4A017`
· Cormorant Garamond display · Manrope UI · JetBrains Mono code.
