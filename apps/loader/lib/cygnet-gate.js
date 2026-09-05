/*
  CygnetLib — Validation Gate
  ------------------------------------------------------------------
  Cinematic validation loaders for the Sanctum SecOps validation arena.
  Reuses the on-brand corridor aesthetic (deep midnight + violet/gold,
  fog, bloom, twinkling embers, manifesting hexagon seal) but re-skins
  the central seal to the CYGNETLIB identity: the gold three-pronged
  mark inside a purple hexagon, with a CYGNETLIB wordmark, a provider
  line, and a fingerprint — exactly like the CYGNET CERTIFIED document
  seal in the Cygnus deposit PDFs.

  Status text is driven by validation TYPE + STAGE, so the same loader
  covers "whatever type of validation" you run.

  Brand: midnight #0A0814 / violet #7C3AED #A78BFA / gold #F5D060 #D4A017.
         Cormorant Garamond display, JetBrains Mono code.

  Usage:
    <script src="cygnet-gate.js" data-img="intro/corridor.jpg"></script>

    CygnetGate.play({ validationType:'ietf-interop', stage:'verify-pass' });
    CygnetGate.play({ validationType:'pki-chain', stage:'execute', provider:'OpenSSL 3.5' });
    CygnetGate.play({ text:'CONFORMANCE VERIFIED', provider:'oqs-provider 0.12' });
    CygnetGate.runSuite('ietf-interop', { provider:'OpenSSL 3.5', onStage:fn, done:fn });
*/
(function () {
  if (window.CygnetGate) return;

  var DEFAULT_IMG =
    (window.CYGNET_GATE_IMG ||
      (document.currentScript && document.currentScript.dataset && document.currentScript.dataset.img)) ||
    '/intro/corridor.jpg';

  // Default fingerprint-style string (replaced per-play with a fresh one).
  function fp() {
    var hex = '0123456789ABCDEF';
    var g = '';
    for (var i = 0; i < 5; i++) {
      var grp = '';
      for (var j = 0; j < 4; j++) grp += hex[Math.floor(Math.random() * 16)];
      g += (i ? ':' : '') + grp;
    }
    return g;
  }

  // Validation types. Each defines a provider default and a stage->text map
  // covering the arena's Queue->Boot->Collect->Execute->Verify progression,
  // plus pass/fail terminal states.
  var TYPES = {
    'ietf-interop': {
      label: 'IETF Interop Conformance',
      provider: 'oqs-provider 0.12',
      stages: {
        queue: 'QUEUING SUITE', boot: 'BOOTING PYTEST',
        collect: 'COLLECTING TESTS', execute: 'EXECUTING CHECKS',
        'verify-pass': 'CONFORMANCE VERIFIED', 'verify-fail': 'CONFORMANCE FAILED'
      }
    },
    'pki-chain': {
      label: 'PKI Chain Validation',
      provider: 'sanctum-root-ca-g1',
      stages: {
        queue: 'QUEUING CHAIN', boot: 'LOADING TRUST ANCHOR',
        collect: 'GATHERING CERTIFICATES', execute: 'VERIFYING SIGNATURES',
        'verify-pass': 'CHAIN VERIFIED', 'verify-fail': 'CHAIN BROKEN'
      }
    },
    'pqc-readiness': {
      label: 'PQC Migration Readiness',
      provider: 'CygnetLib 1.0.0',
      stages: {
        queue: 'SCANNING CRYPTOGRAPHY', boot: 'INVENTORYING ALGORITHMS',
        collect: 'GATHERING KEYS', execute: 'ASSESSING QUANTUM RISK',
        'verify-pass': 'PQC READY', 'verify-fail': 'PQC GAP FOUND'
      }
    },
    'cmmc-controls': {
      label: 'CMMC / NIST 800-171',
      provider: 'Sanctum SecOps',
      stages: {
        queue: 'SCOPING CUI', boot: 'LOADING CONTROLS',
        collect: 'GATHERING EVIDENCE', execute: 'EVALUATING 800-171',
        'verify-pass': 'CONTROLS VERIFIED', 'verify-fail': 'CONTROL GAP'
      }
    },
    'crypto-selftest': {
      label: 'CygnetLib Engine Self-Test',
      provider: 'CygnetLib 1.0.0',
      stages: {
        queue: 'INITIALIZING ENGINE', boot: 'LOADING CYGNETLIB',
        collect: 'GATHERING VECTORS', execute: 'RUNNING KAT',
        'verify-pass': 'SELF-TEST PASSED', 'verify-fail': 'SELF-TEST FAILED'
      }
    },
    'provider-attest': {
      label: 'Provider Attestation',
      provider: 'cygnus.sso.corp',
      stages: {
        queue: 'ATTESTING PROVIDER', boot: 'VERIFYING SIGNING KEY',
        collect: 'GATHERING CLAIMS', execute: 'VALIDATING ATTESTATION',
        'verify-pass': 'PROVIDER ATTESTED', 'verify-fail': 'ATTESTATION INVALID'
      }
    }
  };

  var T = { hall: 2300, sigil: 1300, grant: 700, hold: 1200, out: 560 };
  var DOLLY = T.hall + T.sigil;
  var TOTAL = T.hall + T.sigil + T.grant;        // text fully visible here
  var HOLD_END = TOTAL + T.hold;                  // hold, then fade out

  var CSS =
    '#cyx{position:fixed;inset:0;z-index:2147483647;background:#05030c;overflow:hidden;opacity:1;transition:opacity ' + T.out + 'ms ease}' +
    '#cyx.cy-out{opacity:0;pointer-events:none}' +
    '#cyx .cy-plate{position:absolute;inset:-8%;background:var(--cy-img) center/cover no-repeat;transform:scale(1.03);image-rendering:high-quality;filter:saturate(1.22) contrast(1.16) brightness(1.1);animation:cyDolly ' + DOLLY + 'ms cubic-bezier(.16,.72,.22,1) forwards}' +
    '#cyx .cy-bloom{position:absolute;inset:0;background:radial-gradient(32% 25% at 50% 50%,rgba(186,134,255,.6),rgba(139,92,246,.2) 46%,transparent 72%);mix-blend-mode:screen;animation:cyBloom 1200ms ease-in-out infinite}' +
    '#cyx .cy-tw{position:absolute;width:3px;height:3px;border-radius:50%;background:#fff;box-shadow:0 0 8px 2px rgba(178,124,255,.9);opacity:0;animation:cyTw 1600ms ease-in-out infinite}' +
    '#cyx .cy-tw.g{background:#FFE9A8;box-shadow:0 0 10px 3px rgba(201,162,39,.9)}' +
    '#cyx .cy-fog{position:absolute;inset:0;background:radial-gradient(30% 24% at 50% 51%,rgba(255,255,255,.22),transparent 68%);filter:blur(26px);mix-blend-mode:screen;animation:cyFog ' + DOLLY + 'ms ease-in forwards}' +
    '#cyx .cy-vig{position:absolute;inset:0;box-shadow:inset 0 0 260px 90px rgba(5,3,12,.94);background:radial-gradient(48% 40% at 50% 52%,rgba(201,162,39,.10),transparent 70%)}' +
    '#cyx .cy-backing{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:560px;max-width:86vw;height:440px;background:radial-gradient(62% 62% at 50% 50%,rgba(5,3,12,.92),rgba(5,3,12,.6) 58%,transparent 80%);filter:blur(10px)}' +
    '#cyx .cy-stage{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px}' +
    '#cyx .cy-mark{opacity:0;transform:scale(.5) rotate(0deg);filter:blur(14px) drop-shadow(0 0 30px rgba(201,162,39,.8));animation:cyUnlock ' + (T.sigil + T.grant) + 'ms cubic-bezier(.2,.8,.2,1) ' + T.hall + 'ms forwards}' +
    '#cyx .cy-mark svg{width:138px;height:138px;display:block}' +
    '#cyx .cy-mark .cy-ring{transform-origin:50% 50%;animation:cySpinCCW ' + (T.sigil + T.grant) + 'ms cubic-bezier(.3,.7,.2,1) ' + T.hall + 'ms forwards}' +
    '#cyx .cy-word{opacity:0;font-family:Cormorant Garamond,Georgia,serif;font-weight:600;font-size:32px;letter-spacing:.34em;color:#F6E7B0;text-shadow:0 0 16px rgba(201,162,39,.7),0 2px 10px rgba(0,0,0,.9);animation:cyGrant ' + T.grant + 'ms ease-out ' + (T.hall + T.sigil) + 'ms forwards}' +
    '#cyx .cy-provider{opacity:0;font-family:JetBrains Mono,ui-monospace,monospace;font-size:12px;letter-spacing:.16em;color:#C4B8E8;text-transform:uppercase;text-shadow:0 1px 8px rgba(0,0,0,.95);animation:cyGrant ' + T.grant + 'ms ease-out ' + (T.hall + T.sigil + 120) + 'ms forwards}' +
    '#cyx .cy-fp{opacity:0;font-family:JetBrains Mono,ui-monospace,monospace;font-size:11px;letter-spacing:.14em;color:#D6CCEC;text-shadow:0 1px 2px #05030c,0 0 8px rgba(0,0,0,.95);animation:cyGrant ' + T.grant + 'ms ease-out ' + (T.hall + T.sigil + 200) + 'ms forwards}' +
    '#cyx .cy-status{opacity:0;font-family:JetBrains Mono,ui-monospace,monospace;font-size:16px;letter-spacing:.58em;text-transform:uppercase;color:#FFD964;text-shadow:0 1px 2px #05030c,0 0 6px rgba(0,0,0,1),0 0 18px rgba(201,162,39,.9),0 2px 10px rgba(0,0,0,.9);animation:cyGrant ' + T.grant + 'ms ease-out ' + (T.hall + T.sigil + 300) + 'ms forwards}' +
    '#cyx .cy-status.fail{color:#FF8E8E;text-shadow:0 1px 2px #05030c,0 0 6px rgba(0,0,0,1),0 0 18px rgba(239,68,68,.9),0 2px 10px rgba(0,0,0,.9)}' +
    '#cyx .cy-flash{position:absolute;inset:0;background:radial-gradient(20% 18% at 50% 50%,rgba(255,244,214,.95),rgba(201,162,39,.25) 42%,transparent 74%);opacity:0;animation:cyFlash 620ms ease-out ' + (T.hall + T.sigil - 260) + 'ms forwards}' +
    '@keyframes cyDolly{0%{transform:scale(1.03)}100%{transform:scale(1.34)}}' +
    '@keyframes cyBloom{0%,100%{opacity:.5}50%{opacity:1}}' +
    '@keyframes cyTw{0%,100%{opacity:0;transform:scale(.4)}50%{opacity:1;transform:scale(1.3)}}' +
    '@keyframes cyFog{0%{opacity:.25;transform:translateY(8%) scale(1)}70%{opacity:.9;transform:translateY(-2%) scale(1.5)}100%{opacity:.35;transform:translateY(-6%) scale(1.9)}}' +
    '@keyframes cyUnlock{0%{opacity:0;transform:scale(.5) rotate(0deg);filter:blur(16px) drop-shadow(0 0 10px rgba(201,162,39,.4))}45%{opacity:1;transform:scale(1.08) rotate(540deg);filter:blur(2px) drop-shadow(0 0 34px rgba(201,162,39,.95))}72%{transform:scale(1) rotate(430deg);filter:blur(0) drop-shadow(0 0 26px rgba(201,162,39,.9))}100%{opacity:1;transform:scale(1) rotate(450deg);filter:blur(0) drop-shadow(0 0 22px rgba(139,92,246,.7))}}' +
    '@keyframes cySpinCCW{0%{transform:rotate(0deg)}45%{transform:rotate(-360deg)}100%{transform:rotate(-450deg)}}' +
    '@keyframes cyGrant{0%{opacity:0;letter-spacing:.3em}100%{opacity:1;letter-spacing:.58em}}' +
    '@keyframes cyFlash{0%{opacity:0}35%{opacity:1}100%{opacity:0}}' +
    '@media (prefers-reduced-motion:reduce){#cyx *{animation-duration:1ms!important}}' +
    '@media (max-width:480px){#cyx .cy-mark svg{width:104px;height:104px}#cyx .cy-word{font-size:22px;letter-spacing:.22em}#cyx .cy-provider{font-size:10px;letter-spacing:.1em;max-width:84vw;text-align:center}#cyx .cy-fp{font-size:9.5px;letter-spacing:.1em;max-width:84vw;text-align:center}#cyx .cy-status{font-size:12px;letter-spacing:.28em;max-width:90vw;text-align:center}#cyx .cy-stage{gap:13px}#cyx .cy-backing{width:100vw;height:380px}}';

  var styleEl = document.createElement('style');
  styleEl.textContent = CSS;
  (document.head || document.documentElement).appendChild(styleEl);

  // Gold three-pronged mark inside a purple hexagon (the CygnetLib seal).
  var SEAL =
    '<div class="cy-mark"><svg viewBox="0 0 120 120" fill="none">' +
    '<defs><linearGradient id="cyg" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0%" stop-color="#F6E7B0"/><stop offset="45%" stop-color="#C9A227"/>' +
    '<stop offset="70%" stop-color="#FFF3CC"/><stop offset="100%" stop-color="#9A7B1B"/></linearGradient></defs>' +
    '<g class="cy-ring"><path d="M60 8 105 34v52L60 112 15 86V34z" stroke="#8B5CF6" stroke-width="3.4" opacity=".95"/>' +
    '<circle cx="60" cy="60" r="52" stroke="url(#cyg)" stroke-width="1" stroke-dasharray="3 9" opacity=".8"/></g>' +
    '<path d="M60 32v56M60 60 36 46M60 60l24-14" stroke="url(#cyg)" stroke-width="5" stroke-linecap="round"/>' +
    '</svg></div>';

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function resolve(opts) {
    opts = opts || {};
    var def = TYPES[opts.validationType] || TYPES['ietf-interop'];
    var provider = opts.provider || def.provider;
    var text;
    var fail = false;
    if (opts.text) {
      text = opts.text;
      fail = /fail|fail|broken|gap|invalid|failed/i.test(text);
    } else {
      var stage = opts.stage || 'execute';
      text = def.stages[stage] || stage.toUpperCase();
      fail = stage === 'verify-fail';
    }
    return { provider: provider, text: text, fail: fail, typeLabel: def.label };
  }

  var current = null;

  function play(opts, done) {
    var r = resolve(opts);
    var fingerprint = fp();

    if (current && current.el) {
      current.el.remove();
      if (current.timer) clearTimeout(current.timer);
      if (current.overflowTimer) clearTimeout(current.overflowTimer);
    }

    var o = document.createElement('div');
    o.id = 'cyx';
    o.innerHTML =
      '<div class="cy-plate"></div><div class="cy-bloom"></div><div class="cy-fog"></div>' +
      '<div class="cy-vig"></div><div class="cy-backing"></div><div class="cy-flash"></div>' +
      '<div class="cy-stage">' + SEAL +
      '<div class="cy-word">CYGNETLIB</div>' +
      '<div class="cy-provider">Provider: ' + escapeHtml(r.provider) + '</div>' +
      '<div class="cy-fp">' + fingerprint + '</div>' +
      '<div class="cy-status' + (r.fail ? ' fail' : '') + '">' + escapeHtml(r.text) + '</div>' +
      '</div>';

    var plate = o.querySelector('.cy-plate');
    if (plate) plate.style.background = 'url("' + DEFAULT_IMG + '") center/cover no-repeat';

    for (var i = 0; i < 26; i++) {
      var t = document.createElement('div');
      t.className = 'cy-tw' + (i % 3 === 0 ? ' g' : '');
      t.style.left = (8 + Math.random() * 84) + '%';
      t.style.top = (10 + Math.random() * 76) + '%';
      t.style.animationDelay = (Math.random() * 1600) + 'ms';
      t.style.animationDuration = (900 + Math.random() * 1400) + 'ms';
      o.appendChild(t);
    }

    (document.body || document.documentElement).appendChild(o);

    var html = document.documentElement;
    var prevOverflow = html.style.overflow;
    html.style.overflow = 'hidden';
    current = { el: o };

    var overflowTimer = setTimeout(function () { html.style.overflow = prevOverflow; }, HOLD_END + T.out + 120);
    current.overflowTimer = overflowTimer;

    var timer = setTimeout(function () {
      o.classList.add('cy-out');
      var removeTimer = setTimeout(function () {
        o.remove();
        if (current && current.el === o) current = null;
        if (typeof done === 'function') done();
      }, T.out + 40);
      current.removeTimer = removeTimer;
    }, HOLD_END + 120);
    current.timer = timer;

    return r;
  }

  // Run a full suite: cycle through the 5 stages + a terminal verify state.
  // Calls onStage(stageKey, statusText) at each step and done() at the end.
  function runSuite(validationType, opts, done) {
    opts = opts || {};
    var def = TYPES[validationType] || TYPES['ietf-interop'];
    done = (typeof done === 'function') ? done : (typeof opts.done === 'function' ? opts.done : null);
    var order = ['queue', 'boot', 'collect', 'execute'];
    var terminal = opts.pass === false ? 'verify-fail' : 'verify-pass';
    var i = 0;
    function next() {
      if (i < order.length) {
        var stage = order[i++];
        if (typeof opts.onStage === 'function') opts.onStage(stage, def.stages[stage]);
        play({ validationType: validationType, stage: stage, provider: opts.provider }, next);
      } else {
        if (typeof opts.onStage === 'function') opts.onStage(terminal, def.stages[terminal]);
        play({ validationType: validationType, stage: terminal, provider: opts.provider }, done);
      }
    }
    next();
  }

  window.CygnetGate = {
    play: play,
    runSuite: runSuite,
    TYPES: TYPES,
    timings: T
  };
})();
