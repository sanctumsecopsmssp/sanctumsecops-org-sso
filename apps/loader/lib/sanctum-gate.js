/*
  Sanctum SecOps — Stage Gate Loader
  ------------------------------------------------------------------
  A reusable entry/exit cinematic loader for the Sanctum SecOps web
  estate. This is a faithful, brand-accurate generalization of the
  loader currently running at https://pki.sanctumsecops.com
  (see sanctum-intro.original.js for the reference implementation).

  The ONLY things that vary between an entry and an exit are:
    1. The transitional direction of the camera dolly
         enter -> forward push-in   (scale 1.03 -> 1.34)
         exit  -> reverse pull-back (scale 1.34 -> 1.03)
    2. The status text shown beneath the seal.
  Every other aesthetic element — corridor image, palette, fog,
  bloom, vignette, gold flash, hexagon seal, twinkling embers,
  timings, letter-spacing, and fade behavior — is identical.

  Brand tokens: midnight #0A0814, violet #7C3AED / #A78BFA, gold
  #F5D060 / #D4A017. Tone: calm, authoritative, precise.

  Usage (drop-in, no framework):
    <script src="sanctum-gate.js" data-auto-enter="access-granted"></script>

  Programmatic:
    SanctumGate.play('session-secured');                 // by action key
    SanctumGate.play({ action:'vault-opened' });          // text from registry
    SanctumGate.play({ dir:'exit', text:'PERIMETER SEALED' }); // explicit
    SanctumGate.registerActions({ 'revoke': { dir:'exit', text:'REVOCATION COMPLETE' } });

  Outbound links tagged data-gate-exit="action-key" play the exit
  loader, then navigate. data-gate-exit (no value) defaults to
  'session-secured'. data-gate-text="CUSTOM TEXT" overrides the label.
*/
(function () {
  if (window.SanctumGate) return;

  var DEFAULT_IMG =
    (window.SANCTUM_GATE_IMG ||
      (document.currentScript && document.currentScript.dataset && document.currentScript.dataset.img)) ||
    '/intro/corridor.jpg';

  // Conservative, security-operations action registry.
  var ACTIONS = {
    // --- entry: forward push-in ---
    'access-granted':    { dir: 'enter', text: 'ACCESS GRANTED' },
    'identity-verified':{ dir: 'enter', text: 'IDENTITY VERIFIED' },
    'chain-verified':    { dir: 'enter', text: 'CHAIN VERIFIED' },
    'vault-opened':      { dir: 'enter', text: 'VAULT OPENED' },
    // --- exit: reverse pull-back ---
    'session-secured':  { dir: 'exit',  text: 'SESSION SECURED' },
    'access-closed':    { dir: 'exit',  text: 'ACCESS CLOSED' },
    'identity-cleared':  { dir: 'exit',  text: 'IDENTITY CLEARED' },
    'perimeter-sealed':  { dir: 'exit',  text: 'PERIMETER SEALED' }
  };

  var T = { hall: 2300, sigil: 1300, grant: 700, out: 560 };
  var TOTAL = T.hall + T.sigil + T.grant;
  var DOLLY_MS = T.hall + T.sigil;

  // Both directions' keyframes are injected once. Only sxDolly differs
  // by direction; everything else is shared and identical to the original.
  var CSS =
    '#sxi{position:fixed;inset:0;z-index:2147483647;background:#05030c;overflow:hidden;opacity:1;transition:opacity ' + T.out + 'ms ease}' +
    '#sxi.sx-out{opacity:0;pointer-events:none}' +
    '#sxi .sx-plate{position:absolute;inset:-8%;background:var(--sx-img) center/cover no-repeat;transform:scale(1.03);image-rendering:high-quality;filter:saturate(1.22) contrast(1.16) brightness(1.1)}' +
    '#sxi.dir-enter .sx-plate{animation:sxDollyIn ' + DOLLY_MS + 'ms cubic-bezier(.16,.72,.22,1) forwards}' +
    '#sxi.dir-exit  .sx-plate{animation:sxDollyOut ' + DOLLY_MS + 'ms cubic-bezier(.16,.72,.22,1) forwards}' +
    '#sxi .sx-bloom{position:absolute;inset:0;background:radial-gradient(32% 25% at 50% 50%,rgba(186,134,255,.6),rgba(139,92,246,.2) 46%,transparent 72%);mix-blend-mode:screen;animation:sxBloom 1200ms ease-in-out infinite}' +
    '#sxi .sx-tw{position:absolute;width:3px;height:3px;border-radius:50%;background:#fff;box-shadow:0 0 8px 2px rgba(178,124,255,.9);opacity:0;animation:sxTw 1600ms ease-in-out infinite}' +
    '#sxi .sx-tw.g{background:#FFE9A8;box-shadow:0 0 10px 3px rgba(201,162,39,.9)}' +
    '#sxi .sx-fog{position:absolute;inset:0;background:radial-gradient(30% 24% at 50% 51%,rgba(255,255,255,.22),transparent 68%);filter:blur(26px);mix-blend-mode:screen;animation:sxFog ' + DOLLY_MS + 'ms ease-in forwards}' +
    '#sxi .sx-vig{position:absolute;inset:0;box-shadow:inset 0 0 260px 90px rgba(5,3,12,.94);background:radial-gradient(48% 40% at 50% 52%,rgba(201,162,39,.10),transparent 70%)}' +
    '#sxi .sx-stage{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px}' +
    '#sxi .sx-mark{opacity:0;transform:scale(.5) rotate(0deg);filter:blur(14px) drop-shadow(0 0 30px rgba(201,162,39,.8));animation:sxUnlock ' + (T.sigil + T.grant) + 'ms cubic-bezier(.2,.8,.2,1) ' + T.hall + 'ms forwards}' +
    '#sxi .sx-mark svg{width:132px;height:132px;display:block}' +
    '#sxi .sx-mark .sx-ring{transform-origin:50% 50%;animation:sxSpinCCW ' + (T.sigil + T.grant) + 'ms cubic-bezier(.3,.7,.2,1) ' + T.hall + 'ms forwards}' +
    '#sxi .sx-grant{opacity:0;font:400 13px/1 ui-sans-serif,system-ui;letter-spacing:.58em;text-transform:uppercase;color:#F1E4B8;text-shadow:0 0 18px rgba(201,162,39,.9);animation:sxGrant ' + T.grant + 'ms ease-out ' + (T.hall + T.sigil) + 'ms forwards}' +
    '#sxi .sx-flash{position:absolute;inset:0;background:radial-gradient(20% 18% at 50% 50%,rgba(255,244,214,.95),rgba(201,162,39,.25) 42%,transparent 74%);opacity:0;animation:sxFlash 620ms ease-out ' + (T.hall + T.sigil - 260) + 'ms forwards}' +
    '@keyframes sxDollyIn{0%{transform:scale(1.03)}100%{transform:scale(1.34)}}' +
    '@keyframes sxDollyOut{0%{transform:scale(1.34)}100%{transform:scale(1.03)}}' +
    '@keyframes sxBloom{0%,100%{opacity:.5}50%{opacity:1}}' +
    '@keyframes sxTw{0%,100%{opacity:0;transform:scale(.4)}50%{opacity:1;transform:scale(1.3)}}' +
    '@keyframes sxFog{0%{opacity:.25;transform:translateY(8%) scale(1)}70%{opacity:.9;transform:translateY(-2%) scale(1.5)}100%{opacity:.35;transform:translateY(-6%) scale(1.9)}}' +
    '@keyframes sxUnlock{0%{opacity:0;transform:scale(.5) rotate(0deg);filter:blur(16px) drop-shadow(0 0 10px rgba(201,162,39,.4))}45%{opacity:1;transform:scale(1.08) rotate(540deg);filter:blur(2px) drop-shadow(0 0 34px rgba(201,162,39,.95))}72%{transform:scale(1) rotate(430deg);filter:blur(0) drop-shadow(0 0 26px rgba(201,162,39,.9))}100%{opacity:1;transform:scale(1) rotate(450deg);filter:blur(0) drop-shadow(0 0 22px rgba(139,92,246,.7))}}' +
    '@keyframes sxSpinCCW{0%{transform:rotate(0deg)}45%{transform:rotate(-360deg)}100%{transform:rotate(-450deg)}}' +
    '@keyframes sxGrant{0%{opacity:0;letter-spacing:.3em}100%{opacity:1;letter-spacing:.58em}}' +
    '@keyframes sxFlash{0%{opacity:0}35%{opacity:1}100%{opacity:0}}' +
    '@media (prefers-reduced-motion:reduce){#sxi *{animation-duration:1ms!important}}';

  var styleEl = document.createElement('style');
  styleEl.textContent = CSS;
  (document.head || document.documentElement).appendChild(styleEl);

  var SEAL_SVG =
    '<div class="sx-mark"><svg viewBox="0 0 120 120" fill="none">' +
    '<defs><linearGradient id="sxg" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0%" stop-color="#F6E7B0"/><stop offset="45%" stop-color="#C9A227"/>' +
    '<stop offset="70%" stop-color="#FFF3CC"/><stop offset="100%" stop-color="#9A7B1B"/></linearGradient></defs>' +
    '<g class="sx-ring"><path d="M60 8 105 34v52L60 112 15 86V34z" stroke="#8B5CF6" stroke-width="3.4" opacity=".95"/>' +
    '<circle cx="60" cy="60" r="52" stroke="url(#sxg)" stroke-width="1" stroke-dasharray="3 9" opacity=".8"/></g>' +
    '<path d="M60 32v56M60 60 36 46M60 60l24-14" stroke="url(#sxg)" stroke-width="5" stroke-linecap="round"/>' +
    '</svg></div>';

  function resolve(opts) {
    var action = (typeof opts === 'string') ? { action: opts } : (opts || {});
    var key = action.action || (action.dir === 'exit' ? 'session-secured' : 'access-granted');
    var def = ACTIONS[key] || { dir: action.dir || 'enter', text: key.toUpperCase().replace(/-/g, ' ') };
    var dir = action.dir || def.dir;
    if (dir !== 'enter' && dir !== 'exit') dir = def.dir;
    var text = (action.text || def.text || 'ACCESS GRANTED').toUpperCase();
    return { dir: dir, text: text };
  }

  // current overlay + its removal timer, so exits can be interrupted by a
  // subsequent play (e.g. enter right after exit) without leaving ghosts.
  var current = null;

  function play(opts, done) {
    var r = resolve(opts);

    // tear down any in-flight gate first
    if (current && current.el) {
      current.el.remove();
      if (current.timer) clearTimeout(current.timer);
      if (current.overflowTimer) clearTimeout(current.overflowTimer);
    }

    var o = document.createElement('div');
    o.id = 'sxi';
    o.className = 'dir-' + r.dir;
    o.innerHTML =
      '<div class="sx-plate"></div><div class="sx-bloom"></div><div class="sx-fog"></div>' +
      '<div class="sx-vig"></div><div class="sx-flash"></div>' +
      '<div class="sx-stage">' + SEAL_SVG + '<div class="sx-grant">' + escapeHtml(r.text) + '</div></div>';

    // set the corridor image inline on the plate (matches the original loader)
    var plate = o.querySelector('.sx-plate');
    if (plate) plate.style.background = 'url("' + DEFAULT_IMG + '") center/cover no-repeat';

    for (var i = 0; i < 26; i++) {
      var t = document.createElement('div');
      t.className = 'sx-tw' + (i % 3 === 0 ? ' g' : '');
      t.style.left = (8 + Math.random() * 84) + '%';
      t.style.top = (10 + Math.random() * 76) + '%';
      t.style.animationDelay = (Math.random() * 1600) + 'ms';
      t.style.animationDuration = (900 + Math.random() * 1400) + 'ms';
      o.appendChild(t);
    }

    o.style.setProperty('--sx-img', 'url("' + DEFAULT_IMG + '")');
    (document.body || document.documentElement).appendChild(o);

    var html = document.documentElement;
    var prevOverflow = html.style.overflow;
    html.style.overflow = 'hidden';

    current = { el: o };

    var overflowTimer = setTimeout(function () { html.style.overflow = prevOverflow; }, TOTAL + 120);
    current.overflowTimer = overflowTimer;

    var timer = setTimeout(function () {
      o.classList.add('sx-out');
      var removeTimer = setTimeout(function () {
        o.remove();
        if (current && current.el === o) current = null;
        if (typeof done === 'function') done();
      }, T.out + 40);
      current.removeTimer = removeTimer;
    }, TOTAL + 120);
    current.timer = timer;

    return r;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var Gate = {
    play: play,
    registerActions: function (map) {
      for (var k in map) {
        var v = map[k];
        ACTIONS[k] = { dir: v.dir === 'exit' ? 'exit' : 'enter', text: (v.text || k).toUpperCase() };
      }
    },
    config: function (opts) {
      if (opts && opts.image) DEFAULT_IMG = opts.image;
      if (opts && opts.actions) Gate.registerActions(opts.actions);
    },
    ACTIONS: ACTIONS,
    timings: T
  };
  window.SanctumGate = Gate;

  // ---- auto entry on load ----
  var cs = document.currentScript;
  var autoEnter = cs && cs.dataset && cs.dataset.autoEnter;
  if (autoEnter != null) {
    var key = autoEnter || 'access-granted';
    function autoPlay() { play(key); }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', autoPlay, { once: true });
    } else { autoPlay(); }
  }

  // ---- intercept outbound [data-gate-exit] links ----
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-gate-exit]');
    if (!a) return;
    // honor modifier-clicks (new tab / download / etc.)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#') return;
    e.preventDefault();
    var key = a.dataset.gateExit || 'session-secured';
    var text = a.dataset.gateText || null;
    play({ action: key, text: text }, function () {
      // navigate after the gate finishes
      window.location.href = href;
    });
  });
})();
