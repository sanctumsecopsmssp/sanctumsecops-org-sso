/*
  Sanctum SecOps — Session Gate (on-brand)
  ------------------------------------------------------------------
  Branded "Signing In / Signing Out" checklist card. Same API as before:
    SessionGate.signIn({ autoEnter, onDone });
    SessionGate.signOut({ onDone });
  Now styled on-brand: midnight surface, violet border glow, gold hexagon
  seal, gold divider, JetBrains Mono checklist, green checks, violet/gold
  padlock final state. Mirrors the Alliance sequence, entry = sign-out reversed.
*/
(function () {
  if (window.SessionGate) return;

  var STEPS = {
    in: [
      'Issuing session token',
      'Loading local key material',
      'Signing in to Microsoft Entra ID',
      'Establishing Cloudflare Access session',
      'Unsealing vault'
    ],
    out: [
      'Revoking session token',
      'Clearing local key material',
      'Signing out of Microsoft Entra ID',
      'Tearing down Cloudflare Access session',
      'Sealing vault'
    ]
  };
  var FINAL = {
    in:  { title: 'VAULT UNSEALED', sub: 'You are entering the Sanctum SecOps Admin Console. Session material has been loaded into this browser.', action: 'Enter Console' },
    out: { title: 'VAULT SEALED',   sub: 'You signed out of the Sanctum SecOps Admin Console. All session material has been cleared from this browser.', action: 'Re-authenticate' }
  };

  var OUT = 320;
  var STEP_MS = 760, STEP_GAP = 140;

  var CSS =
    '#sgx{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;' +
    'background:radial-gradient(circle at 50% 38%,#1a1330,#0A0814 74%);opacity:1;transition:opacity ' + OUT + 'ms ease}' +
    '#sgx::before{content:"";position:absolute;inset:0;background-image:radial-gradient(rgba(124,58,237,.06) 1px,transparent 1px);background-size:26px 26px;opacity:.6;pointer-events:none}' +
    '#sgx.sg-out{opacity:0;pointer-events:none}' +
    '#sgx .sg-card{position:relative;width:460px;max-width:92vw;background:linear-gradient(180deg,#15102A,#100c1d);border:1px solid rgba(124,58,237,.32);border-radius:18px;padding:0 0 26px;box-shadow:0 40px 90px -24px rgba(0,0,0,.8),0 0 0 1px rgba(124,58,237,.10),0 0 60px -20px rgba(124,58,237,.5);text-align:center;font-family:Manrope,Inter,Arial,sans-serif;overflow:hidden}' +
    '#sgx .sg-card::after{content:"";position:absolute;inset:0;border-radius:18px;pointer-events:none;background:radial-gradient(circle at 50% 0%,rgba(124,58,237,.16),transparent 55%)}' +
    '#sgx .sg-seal{width:54px;height:54px;margin:30px auto 0;position:relative;z-index:1;filter:drop-shadow(0 0 10px rgba(245,208,96,.35))}' +
    '#sgx .sg-seal .ring{transform-origin:center;animation:sgSpin 9s linear infinite}' +
    '#sgx .sg-brand{position:relative;z-index:1;font-family:Cormorant Garamond,Georgia,serif;font-weight:600;font-size:15px;letter-spacing:.22em;color:#F4F0FF;text-transform:uppercase;margin:12px 0 0}' +
    '#sgx .sg-brand small{display:block;font-family:JetBrains Mono,monospace;font-size:8.5px;letter-spacing:.3em;color:#8B7FB5;margin-top:3px}' +
    '#sgx .sg-div{position:relative;z-index:1;height:1px;width:70%;margin:14px auto 6px;background:linear-gradient(90deg,transparent,rgba(245,208,96,.45),transparent)}' +
    '#sgx .sg-title{position:relative;z-index:1;font-size:13px;font-weight:800;letter-spacing:.2em;color:#F4F0FF;margin:6px 0 16px;text-transform:uppercase}' +
    '#sgx .sg-spin{display:inline-block;vertical-align:-2px;width:13px;height:13px;margin-left:8px;border:2px solid rgba(124,58,237,.25);border-top-color:#A78BFA;border-radius:50%;animation:sgSpin .8s linear infinite}' +
    '@keyframes sgSpin{to{transform:rotate(360deg)}}' +
    '#sgx .sg-list{position:relative;z-index:1;list-style:none;padding:0 30px;margin:0;text-align:left}' +
    '#sgx .sg-list li{display:flex;align-items:center;gap:11px;padding:9px 4px;border-bottom:1px solid rgba(124,58,237,.10);font-size:12.5px;font-family:JetBrains Mono,ui-monospace,monospace;color:#6E6985;opacity:.5;transition:opacity .3s}' +
    '#sgx .sg-list li.active{opacity:1;color:#ECE9F5}' +
    '#sgx .sg-list li.done{opacity:1;color:#A09BB8}' +
    '#sgx .sg-ico{width:16px;height:16px;flex-shrink:0;position:relative}' +
    '#sgx .sg-ico .dot{position:absolute;inset:3px;border-radius:50%;border:2px solid #3a3160}' +
    '#sgx .sg-ico .sp{position:absolute;inset:0;border:2.5px solid rgba(124,58,237,.18);border-top-color:#A78BFA;border-radius:50%;opacity:0;animation:sgSpin .8s linear infinite}' +
    '#sgx .sg-list li.active .sg-ico .sp{opacity:1}' +
    '#sgx .sg-list li.active .sg-ico .dot{opacity:0}' +
    '#sgx .sg-ico .ck{position:absolute;inset:0;opacity:0;transform:scale(.4);transition:opacity .25s,transform .25s cubic-bezier(.2,.9,.2,1)}' +
    '#sgx .sg-list li.done .sg-ico .ck{opacity:1;transform:scale(1)}' +
    '#sgx .sg-list li.done .sg-ico .sp{opacity:0}' +
    '#sgx .sg-final{position:relative;z-index:1;opacity:0;transform:translateY(8px);transition:opacity .5s,transform .5s;pointer-events:none;padding:0 30px}' +
    '#sgx .sg-final.show{opacity:1;transform:none;pointer-events:auto}' +
    '#sgx .sg-pad{width:66px;height:66px;margin:22px auto 14px;border-radius:50%;background:linear-gradient(135deg,#8B5CF6,#6D28D9);display:flex;align-items:center;justify-content:center;box-shadow:0 14px 34px -10px rgba(124,58,237,.7),0 0 0 6px rgba(124,58,237,.10);opacity:0;transform:scale(.6);transition:opacity .5s,transform .5s cubic-bezier(.2,.9,.2,1)}' +
    '#sgx .sg-pad.show{opacity:1;transform:scale(1)}' +
    '#sgx .sg-ftitle{font-family:Cormorant Garamond,Georgia,serif;font-weight:700;font-size:25px;letter-spacing:.1em;color:#F4F0FF;margin:0 0 8px}' +
    '#sgx .sg-fsub{font-size:11.5px;color:#8B7FB5;line-height:1.6;margin:0 0 20px}' +
    '#sgx .sg-btn{appearance:none;cursor:pointer;font-family:Manrope,sans-serif;font-weight:700;font-size:13px;letter-spacing:.06em;color:#0A0814;background:linear-gradient(135deg,#F5D060,#D4A017);border:none;border-radius:10px;padding:12px 26px;display:inline-flex;align-items:center;gap:8px;box-shadow:0 10px 24px -8px rgba(245,208,96,.6);transition:transform .15s}' +
    '#sgx .sg-btn:hover{transform:translateY(-1px)}' +
    '@media (max-width:480px){#sgx .sg-list{padding:0 22px}#sgx .sg-ftitle{font-size:22px}#sgx .sg-card{padding-bottom:24px}}';

  var styleEl = document.createElement('style');
  styleEl.textContent = CSS;
  (document.head || document.documentElement).appendChild(styleEl);

  var CHECK = '<svg class="ck" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#22C55E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var PADLOCK_CLOSED = '<svg viewBox="0 0 24 24" fill="none" width="26" height="26"><rect x="5" y="11" width="14" height="9" rx="2" fill="#fff"/><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="#fff" stroke-width="2" fill="none"/></svg>';
  var PADLOCK_OPEN = '<svg viewBox="0 0 24 24" fill="none" width="26" height="26"><rect x="5" y="11" width="14" height="9" rx="2" fill="#fff"/><path d="M9 11V8a4 4 0 0 1 5-1.5" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>';
  var LOGINICO = '<svg viewBox="0 0 24 24" fill="none" width="15" height="15"><path d="M15 12H4m0 0l4-4m-4 4l4 4m6-12v2" stroke="#0A0814" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  // gold hexagon seal with three-prong mark (Sanctum logo)
  var SEAL = '<svg viewBox="0 0 60 60" width="54" height="54">' +
    '<g class="ring"><polygon points="30,4 53,17.5 53,42.5 30,56 7,42.5 7,17.5" fill="none" stroke="#F5D060" stroke-width="1.6" opacity=".5"/></g>' +
    '<polygon points="30,7 50,18.5 50,41.5 30,53 10,41.5 10,18.5" fill="none" stroke="#F5D060" stroke-width="2.2"/>' +
    '<path d="M30 16 L30 30 M30 30 L42 37 M30 30 L18 37" stroke="#F5D060" stroke-width="2.4" stroke-linecap="round" fill="none"/>' +
    '<circle cx="30" cy="30" r="3.4" fill="#F5D060"/>' +
    '</svg>';

  function build(dir) {
    var steps = STEPS[dir];
    var f = FINAL[dir];
    var padIco = dir === 'in' ? PADLOCK_OPEN : PADLOCK_CLOSED;
    var items = steps.map(function (s, i) {
      return '<li data-i="' + i + '"><span class="sg-ico"><span class="dot"></span><span class="sp"></span>' + CHECK + '</span>' + s + '</li>';
    }).join('');
    var card =
      '<div class="sg-card">' +
      '<div class="sg-seal">' + SEAL + '</div>' +
      '<div class="sg-brand">Sanctum SecOps<small>Admin Console</small></div>' +
      '<div class="sg-div"></div>' +
      '<div class="sg-title">' + (dir === 'in' ? 'Signing In' : 'Signing Out') + '<span class="sg-spin"></span></div>' +
      '<ul class="sg-list">' + items + '</ul>' +
      '<div class="sg-final">' +
        '<div class="sg-pad"><svg width="26" height="26">' + padIco + '</svg></div>' +
        '<div class="sg-ftitle">' + f.title + '</div>' +
        '<p class="sg-fsub">' + f.sub + '</p>' +
        '<button class="sg-btn">' + LOGINICO + ' ' + f.action + '</button>' +
      '</div>' +
      '</div>';
    var o = document.createElement('div');
    o.id = 'sgx';
    o.innerHTML = card;
    return { el: o };
  }

  function play(dir, opts) {
    opts = opts || {};
    var built = build(dir);
    var o = built.el;
    (document.body || document.documentElement).appendChild(o);
    var html = document.documentElement;
    var prev = html.style.overflow; html.style.overflow = 'hidden';
    var lis = o.querySelectorAll('.sg-list li');
    var i = 0;
    var timers = [];
    function next() {
      if (i > 0) { lis[i - 1].classList.remove('active'); lis[i - 1].classList.add('done'); }
      if (i >= lis.length) { return finalize(); }
      lis[i].classList.add('active');
      i++;
      timers.push(setTimeout(next, STEP_MS + STEP_GAP));
    }
    timers.push(setTimeout(next, 420));
    function finalize() {
      o.querySelector('.sg-pad').classList.add('show');
      o.querySelector('.sg-final').classList.add('show');
      var btn = o.querySelector('.sg-btn');
      var completed = false;
      var done = function () { if (completed) return; completed = true; close(o, prev); if (opts.onDone) opts.onDone(); };
      btn.addEventListener('click', done);
      if (dir === 'in' && opts.autoEnter) timers.push(setTimeout(done, 1900));
    }
    function close(el, prevOverflow) {
      el.classList.add('sg-out');
      setTimeout(function () { el.remove(); html.style.overflow = prevOverflow; }, OUT + 40);
    }
    return { el: o, cancel: function () { timers.forEach(clearTimeout); close(o, prev); } };
  }

  window.SessionGate = { signIn: function (opts) { return play('in', opts); }, signOut: function (opts) { return play('out', opts); }, STEPS: STEPS };
})();
