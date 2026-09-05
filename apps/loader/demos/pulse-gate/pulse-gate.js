/*
  Sanctum SecOps — Pulse Gate
  ------------------------------------------------------------------
  A "session establish" / transition loader matching the live gate at
  mmk6.sanctumsecops.com. Solid midnight background, three gold-to-purple
  bars, "CYGNUS SANCTUM" + "SANCTUM SECOPS" wordmark, and a status line
  that changes per transition. A rhythmic horizontal-blur glitch pulse
  hits the bars + "CYGNUS SANCTUM" while the wordmark stays sharp.

  Use it "in certain transitions" — establishing a secure session,
  syncing the vault, routing through Zero Trust, decrypting a workspace,
  reconnecting a channel, etc. Each transition carries its own status text.

  Brand: midnight #0A0814 / violet #7C3AED #A78BFA / gold #F5D060 #D4A017.
         Manrope sans, Cormorant display, JetBrains Mono code.

  Usage:
    <script src="pulse-gate.js"></script>
    PulseGate.play({ transition: 'session' });            // preset text
    PulseGate.play({ text: 'DECRYPTING WORKSPACE' });       // free-form
    PulseGate.hold({ text:'HANDSHAKE IN PROGRESS' });      // stay until .close()
    PulseGate.close();                                    // fade out now
*/
(function () {
  if (window.PulseGate) return;

  // Transition presets — each a status line for a different transition.
  var TRANSITIONS = {
    session:    'ESTABLISHING SECURE SESSION',
    vault:      'SYNCING VAULT',
    zerotrust:  'ROUTING THROUGH ZERO TRUST',
    decrypt:    'DECRYPTING WORKSPACE',
    reconnect:  'RECONNECTING SECURE CHANNEL',
    handshake:  'HANDSHAKE IN PROGRESS',
    auth:       'AUTHENTICATING IDENTITY',
    handoff:    'SECURE HANDOFF'
  };

  var OUT = 520;
  var DEFAULT_HOLD = 2600;   // ms the pulse runs before auto-fading

  var CSS =
    '#pgx{position:fixed;inset:0;z-index:2147483647;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;' +
    'background:radial-gradient(58% 52% at 50% 46%,#160f2e,#0A0814 70%);opacity:1;transition:opacity ' + OUT + 'ms ease}' +
    '#pgx.pg-out{opacity:0;pointer-events:none}' +
    '#pgx .pg-bars{display:flex;align-items:flex-end;gap:8px;height:50px;perspective:640px;transform-style:preserve-3d;animation:pgTilt 7s ease-in-out infinite}' +
    '#pgx .pg-bars i{position:relative;display:block;width:10px;border-radius:3px;transform-style:preserve-3d;background:linear-gradient(180deg,#FFE9A8 0%,#F5D060 22%,#D4A017 52%,#7C3AED 100%);box-shadow:1px 0 0 #4C1D95,2px 0 0 #3B1670,3px 0 0 #2A0F4D,3px 4px 12px rgba(0,0,0,.55),0 0 18px rgba(201,162,39,.35)}' +
    '#pgx .pg-bars i::before{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(115deg,transparent 38%,rgba(255,255,255,.65) 50%,transparent 62%);background-size:260% 100%;animation:pgShimmer 2.2s linear infinite}' +
    '#pgx .pg-bars i:nth-child(1){height:28px}#pgx .pg-bars i:nth-child(2){height:50px}#pgx .pg-bars i:nth-child(3){height:28px}' +
    '#pgx .pg-sub{font-family:JetBrains Mono,ui-monospace,monospace;font-size:11px;letter-spacing:.42em;text-transform:uppercase;color:#F5D060;text-shadow:0 0 12px rgba(201,162,39,.5);animation:pgGlow 2.4s ease-in-out infinite}' +
    '#pgx .pg-word{font-family:Manrope,Inter,Arial,sans-serif;font-weight:800;font-size:30px;letter-spacing:.16em;color:#F4F0FF;text-shadow:0 0 26px rgba(124,58,237,.55),0 0 6px rgba(0,0,0,.6);opacity:0;animation:pgIn 600ms ease-out 120ms forwards}' +
    '#pgx .pg-status{font-family:JetBrains Mono,ui-monospace,monospace;font-size:12px;letter-spacing:.34em;text-transform:uppercase;color:#A78BFA;text-shadow:0 0 12px rgba(124,58,237,.4);opacity:0;animation:pgIn 600ms ease-out 320ms forwards}' +
    '#pgx .pg-status .pg-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:#F5D060;margin-right:9px;vertical-align:middle;box-shadow:0 0 8px 2px rgba(201,162,39,.7);animation:pgBlink 900ms steps(2) infinite}' +
    '@keyframes pgTilt{0%,100%{transform:rotateY(-20deg)}50%{transform:rotateY(20deg)}}' +
    '@keyframes pgShimmer{0%{background-position:140% 0}100%{background-position:-140% 0}}' +
    '@keyframes pgGlow{0%,100%{opacity:.82;text-shadow:0 0 8px rgba(201,162,39,.3)}50%{opacity:1;text-shadow:0 0 16px rgba(201,162,39,.6)}}' +
    '@keyframes pgIn{from{opacity:0;letter-spacing:.3em}to{opacity:1;letter-spacing:.16em}}' +
    '@keyframes pgBlink{50%{opacity:.25}}' +
    '@media (max-width:480px){#pgx .pg-word{font-size:22px;letter-spacing:.1em}#pgx .pg-sub{font-size:9.5px;letter-spacing:.28em}#pgx .pg-status{font-size:10.5px;letter-spacing:.2em;max-width:88vw;text-align:center}}' +
    '@media (prefers-reduced-motion:reduce){#pgx *{animation-duration:1ms!important}}';

  var styleEl = document.createElement('style');
  styleEl.textContent = CSS;
  (document.head || document.documentElement).appendChild(styleEl);

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function resolveText(opts) {
    if (opts.text) return opts.text;
    if (opts.transition && TRANSITIONS[opts.transition]) return TRANSITIONS[opts.transition];
    return TRANSITIONS.session;
  }

  var current = null;
  var holdTimer = null;

  function build(text) {
    var o = document.createElement('div');
    o.id = 'pgx';
    o.innerHTML =
      '<div class="pg-bars"><i></i><i></i><i></i></div>' +
      '<div class="pg-sub">CYGNUS SANCTUM</div>' +
      '<div class="pg-word">SANCTUM SECOPS</div>' +
      '<div class="pg-status"><span class="pg-dot"></span>' + escapeHtml(text) + '</div>';
    return o;
  }

  function open(opts) {
    var text = resolveText(opts);
    var hold = typeof opts.hold === 'number' ? opts.hold : DEFAULT_HOLD;

    close(true); // remove any existing instantly (no fade)

    var o = build(text);
    (document.body || document.documentElement).appendChild(o);

    var html = document.documentElement;
    var prevOverflow = html.style.overflow;
    html.style.overflow = 'hidden';

    current = { el: o, prevOverflow: prevOverflow };

    if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
    if (hold > 0) {
      holdTimer = setTimeout(function () { close(); }, hold);
    }
    return current;
  }

  // Play a transition: open, pulse for `hold` ms, then auto-fade.
  function play(opts, done) {
    open(opts);
    if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
    var hold = typeof opts.hold === 'number' ? opts.hold : DEFAULT_HOLD;
    holdTimer = setTimeout(function () {
      close(false, done);
    }, hold);
    return current;
  }

  // Hold open (pulsing) until close() is called.
  function hold(opts) {
    open(Object.assign({ hold: 0 }, opts));
    if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
    return current;
  }

  // Fade out and remove. instant=true skips the fade.
  function close(instant, done) {
    if (!current) { if (typeof done === 'function') done(); return; }
    if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }

    var c = current;
    current = null;

    var html = document.documentElement;
    if (c.prevOverflow !== undefined) html.style.overflow = c.prevOverflow;

    if (instant) {
      c.el.remove();
      if (typeof done === 'function') done();
      return;
    }

    c.el.classList.add('pg-out');
    setTimeout(function () {
      c.el.remove();
      if (typeof done === 'function') done();
    }, OUT + 40);
  }

  window.PulseGate = {
    play: play,
    hold: hold,
    close: close,
    TRANSITIONS: TRANSITIONS
  };
})();
