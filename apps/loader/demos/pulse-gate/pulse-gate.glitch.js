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
    '#pgx .pg-bars{display:flex;align-items:flex-end;gap:7px;height:46px;transform-origin:50% 50%;animation:pgPulse 1380ms cubic-bezier(.2,.8,.2,1) infinite}' +
    '#pgx .pg-bars i{display:block;width:8px;border-radius:2px;background:linear-gradient(180deg,#F5D060 0%,#D4A017 38%,#7C3AED 100%);box-shadow:0 0 14px rgba(201,162,39,.35)}' +
    '#pgx .pg-bars i:nth-child(1){height:26px}#pgx .pg-bars i:nth-child(2){height:46px}#pgx .pg-bars i:nth-child(3){height:26px}' +
    '#pgx .pg-sub{font-family:JetBrains Mono,ui-monospace,monospace;font-size:11px;letter-spacing:.42em;text-transform:uppercase;color:#F5D060;text-shadow:0 0 12px rgba(201,162,39,.5);animation:pgPulse 1380ms cubic-bezier(.2,.8,.2,1) infinite}' +
    '#pgx .pg-word{font-family:Manrope,Inter,Arial,sans-serif;font-weight:800;font-size:30px;letter-spacing:.16em;color:#F4F0FF;text-shadow:0 0 26px rgba(124,58,237,.55),0 0 6px rgba(0,0,0,.6);opacity:0;animation:pgIn 600ms ease-out 120ms forwards}' +
    '#pgx .pg-status{font-family:JetBrains Mono,ui-monospace,monospace;font-size:12px;letter-spacing:.34em;text-transform:uppercase;color:#A78BFA;text-shadow:0 0 12px rgba(124,58,237,.4);opacity:0;animation:pgIn 600ms ease-out 320ms forwards}' +
    '#pgx .pg-status .pg-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:#F5D060;margin-right:9px;vertical-align:middle;box-shadow:0 0 8px 2px rgba(201,162,39,.7);animation:pgBlink 900ms steps(2) infinite}' +
    '@keyframes pgPulse{0%,100%{filter:blur(0);transform:scaleX(1)}42%{filter:blur(2.5px);transform:scaleX(1.55)}50%{filter:blur(1.5px);transform:scaleX(.92)}58%{filter:blur(2px);transform:scaleX(1.12)}70%{filter:blur(0);transform:scaleX(1)}}' +
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
