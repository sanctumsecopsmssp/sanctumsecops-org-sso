(function(){
  if (window.__SANCTUM_INTRO__) return; window.__SANCTUM_INTRO__ = 1;
  var IMG = window.SANCTUM_INTRO_IMG || '/intro/corridor.jpg';
  var T = { hall: 2300, sigil: 1300, grant: 700, out: 560 };
  var TOTAL = T.hall + T.sigil + T.grant;
  var css = ''
  +'#sxi{position:fixed;inset:0;z-index:2147483647;background:#05030c;overflow:hidden;opacity:1;transition:opacity '+T.out+'ms ease}'
  +'#sxi.sx-out{opacity:0;pointer-events:none}'
  +'#sxi .sx-plate{position:absolute;inset:-8%;background:url("'+IMG+'") center/cover no-repeat;transform:scale(1.03);image-rendering:high-quality;filter:saturate(1.22) contrast(1.16) brightness(1.1);animation:sxDolly '+(T.hall+T.sigil)+'ms cubic-bezier(.16,.72,.22,1) forwards}'
  +'#sxi .sx-bloom{position:absolute;inset:0;background:radial-gradient(32% 25% at 50% 50%,rgba(186,134,255,.6),rgba(139,92,246,.2) 46%,transparent 72%);mix-blend-mode:screen;animation:sxBloom 1200ms ease-in-out infinite}'
  +'#sxi .sx-tw{position:absolute;width:3px;height:3px;border-radius:50%;background:#fff;box-shadow:0 0 8px 2px rgba(178,124,255,.9);opacity:0;animation:sxTw 1600ms ease-in-out infinite}'
  +'#sxi .sx-tw.g{background:#FFE9A8;box-shadow:0 0 10px 3px rgba(201,162,39,.9)}'
  +'#sxi .sx-fog{position:absolute;inset:0;background:radial-gradient(30% 24% at 50% 51%,rgba(255,255,255,.22),transparent 68%);filter:blur(26px);mix-blend-mode:screen;animation:sxFog '+(T.hall+T.sigil)+'ms ease-in forwards}'
  +'#sxi .sx-vig{position:absolute;inset:0;box-shadow:inset 0 0 260px 90px rgba(5,3,12,.94);background:radial-gradient(48% 40% at 50% 52%,rgba(201,162,39,.10),transparent 70%)}'
  +'#sxi .sx-stage{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px}'
  +'#sxi .sx-mark{opacity:0;transform:scale(.5) rotate(0deg);filter:blur(14px) drop-shadow(0 0 30px rgba(201,162,39,.8));animation:sxUnlock '+(T.sigil+T.grant)+'ms cubic-bezier(.2,.8,.2,1) '+T.hall+'ms forwards}'
  +'#sxi .sx-mark svg{width:132px;height:132px;display:block}'
  +'#sxi .sx-mark .sx-ring{transform-origin:50% 50%;animation:sxSpinCCW '+(T.sigil+T.grant)+'ms cubic-bezier(.3,.7,.2,1) '+T.hall+'ms forwards}'
  +'#sxi .sx-grant{opacity:0;font:400 13px/1 ui-sans-serif,system-ui;letter-spacing:.58em;text-transform:uppercase;color:#F1E4B8;text-shadow:0 0 18px rgba(201,162,39,.9);animation:sxGrant '+T.grant+'ms ease-out '+(T.hall+T.sigil)+'ms forwards}'
  +'#sxi .sx-flash{position:absolute;inset:0;background:radial-gradient(20% 18% at 50% 50%,rgba(255,244,214,.95),rgba(201,162,39,.25) 42%,transparent 74%);opacity:0;animation:sxFlash 620ms ease-out '+(T.hall+T.sigil-260)+'ms forwards}'
  +'@keyframes sxDolly{0%{transform:scale(1.03)}100%{transform:scale(1.34)}}'
  +'@keyframes sxBloom{0%,100%{opacity:.5}50%{opacity:1}}'
  +'@keyframes sxTw{0%,100%{opacity:0;transform:scale(.4)}50%{opacity:1;transform:scale(1.3)}}'
  +'@keyframes sxFog{0%{opacity:.25;transform:translateY(8%) scale(1)}70%{opacity:.9;transform:translateY(-2%) scale(1.5)}100%{opacity:.35;transform:translateY(-6%) scale(1.9)}}'
  +'@keyframes sxUnlock{0%{opacity:0;transform:scale(.5) rotate(0deg);filter:blur(16px) drop-shadow(0 0 10px rgba(201,162,39,.4))}45%{opacity:1;transform:scale(1.08) rotate(540deg);filter:blur(2px) drop-shadow(0 0 34px rgba(201,162,39,.95))}72%{transform:scale(1) rotate(430deg);filter:blur(0) drop-shadow(0 0 26px rgba(201,162,39,.9))}100%{opacity:1;transform:scale(1) rotate(450deg);filter:blur(0) drop-shadow(0 0 22px rgba(139,92,246,.7))}}'
  +'@keyframes sxSpinCCW{0%{transform:rotate(0deg)}45%{transform:rotate(-360deg)}100%{transform:rotate(-450deg)}}'
  +'@keyframes sxGrant{0%{opacity:0;letter-spacing:.3em}100%{opacity:1;letter-spacing:.58em}}'
  +'@keyframes sxFlash{0%{opacity:0}35%{opacity:1}100%{opacity:0}}'
  +'@media (prefers-reduced-motion:reduce){#sxi *{animation-duration:1ms!important}}';
  var s=document.createElement('style'); s.textContent=css; document.head.appendChild(s);
  var o=document.createElement('div'); o.id='sxi';
  o.innerHTML='<div class="sx-plate"></div><div class="sx-bloom"></div><div class="sx-fog"></div>'
   +'<div class="sx-vig"></div><div class="sx-flash"></div>'
   +'<div class="sx-stage"><div class="sx-mark"><svg viewBox="0 0 120 120" fill="none">'
   +'<defs><linearGradient id="sxg" x1="0" y1="0" x2="1" y2="1">'
   +'<stop offset="0%" stop-color="#F6E7B0"/><stop offset="45%" stop-color="#C9A227"/>'
   +'<stop offset="70%" stop-color="#FFF3CC"/><stop offset="100%" stop-color="#9A7B1B"/></linearGradient></defs>'
   +'<g class="sx-ring"><path d="M60 8 105 34v52L60 112 15 86V34z" stroke="#8B5CF6" stroke-width="3.4" opacity=".95"/>'
   +'<circle cx="60" cy="60" r="52" stroke="url(#sxg)" stroke-width="1" stroke-dasharray="3 9" opacity=".8"/></g>'
   +'<path d="M60 32v56M60 60 36 46M60 60l24-14" stroke="url(#sxg)" stroke-width="5" stroke-linecap="round"/>'
   +'</svg></div><div class="sx-grant">Access Granted</div></div>';
  for (var i=0;i<26;i++){
    var t=document.createElement('div');
    t.className='sx-tw'+(i%3===0?' g':'');
    t.style.left=(8+Math.random()*84)+'%';
    t.style.top=(10+Math.random()*76)+'%';
    t.style.animationDelay=(Math.random()*1600)+'ms';
    t.style.animationDuration=(900+Math.random()*1400)+'ms';
    o.appendChild(t);
  }
  (document.body||document.documentElement).appendChild(o);
  var html=document.documentElement, prev=html.style.overflow; html.style.overflow='hidden';
  setTimeout(function(){ o.classList.add('sx-out'); html.style.overflow=prev;
    setTimeout(function(){ o.remove(); }, T.out+40); }, TOTAL+120);
})();
