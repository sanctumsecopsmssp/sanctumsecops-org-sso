/* ============================================================
   Sanctum SecOps .org — shared chrome + client-side hashing
   No dependencies, no build step, no framework.
   ============================================================ */

const MARK = `<svg viewBox="0 0 40 44" aria-hidden="true">
  <path d="M20 1.5 37.5 11.5v21L20 42.5 2.5 32.5v-21z" fill="none" stroke="#7C3AED" stroke-width="2"/>
  <path d="M20 12v20M20 20l-6-5M20 20l6-5" fill="none" stroke="#F5D060" stroke-width="2.2" stroke-linecap="round"/>
</svg>`;

const NAV = [
  ['index.html','Overview'],
  ['stamp.html','Stamp'],
  ['verify.html','Verify'],
  ['transparency.html','Transparency'],
  ['docs.html','API'],
  ['pricing.html','Pricing'],
  ['about.html','About'],
];

function chrome(){
  const here = (location.pathname.split('/').pop() || 'index.html');

  document.body.insertAdjacentHTML('afterbegin', `
    <div class="nav"><div class="wrap">
      <a class="brand" href="index.html">${MARK}<span>Sanctum <i>Timestamp</i></span></a>
      <nav>${NAV.map(([h,l]) =>
        `<a href="${h}"${h===here?' aria-current="page"':''}>${l}</a>`).join('')}</nav>
    </div></div>`);

  document.body.insertAdjacentHTML('beforeend', `
    <footer><div class="wrap">
      <div class="cols">
        <div>
          <h4>Service</h4>
          <a href="stamp.html">Stamp a file</a>
          <a href="verify.html">Verify a receipt</a>
          <a href="transparency.html">Transparency log</a>
          <a href="pricing.html">Pricing</a>
        </div>
        <div>
          <h4>Developers</h4>
          <a href="docs.html">API reference</a>
          <a href="docs.html#ots">OpenTimestamps compatibility</a>
          <a href="docs.html#receipts">Receipt format</a>
          <a href="transparency.html#sth">Signed tree heads</a>
        </div>
        <div>
          <h4>Estate</h4>
          <a href="https://sanctumsecops.com">sanctumsecops.com</a>
          <a href="https://pki.sanctumsecops.com">PKI repository</a>
          <a href="https://arena.sanctumsecops.com">PQC Validation Arena</a>
          <a href="about.html">Entity structure</a>
        </div>
        <div>
          <h4>Contact</h4>
          <a href="tel:+16073788287">+1 (607) 378-8287</a>
          <a href="mailto:Brian@sso-labs.com">Brian@sso-labs.com</a>
          <span>128 Dry Run Rd<br>Pine City, NY 14871</span>
        </div>
      </div>
      <div class="legal">
        Sanctum SecOps LLC &middot; UEI H3A2Z4R3HE87 &middot; CAGE 20XS3 &middot; DUNS 145042588<br>
        Timestamping is a proof of existence at a point in time. It attests that data existed,
        not that its contents are true, lawful, or accurate.<br>
        Patent pending. Composite signature scheme: ECDSA P-256 + ML-DSA-65.
      </div>
    </div></footer>`);
}

/* ---------- SHA-256 in the browser. The file never leaves the device. ---------- */
async function sha256(file, onProgress){
  const CHUNK = 4 * 1024 * 1024;
  // Streaming digest is not exposed by WebCrypto, so read fully for < 64 MB,
  // otherwise warn rather than silently stalling the tab.
  const buf = await file.arrayBuffer();
  if (onProgress) onProgress(1);
  const d = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2,'0')).join('');
}

function hex(n){
  const a = new Uint8Array(n); crypto.getRandomValues(a);
  return [...a].map(b => b.toString(16).padStart(2,'0')).join('');
}

function fmtBytes(n){
  if (n < 1024) return n + ' B';
  if (n < 1048576) return (n/1024).toFixed(1) + ' KB';
  return (n/1048576).toFixed(2) + ' MB';
}

/* Wire a drop zone + file input to a digest handler. */
function wireDrop(zoneId, inputId, handler){
  const z = document.getElementById(zoneId), i = document.getElementById(inputId);
  if (!z || !i) return;
  z.addEventListener('click', () => i.click());
  z.addEventListener('dragover', e => { e.preventDefault(); z.classList.add('over'); });
  z.addEventListener('dragleave', () => z.classList.remove('over'));
  z.addEventListener('drop', e => {
    e.preventDefault(); z.classList.remove('over');
    if (e.dataTransfer.files[0]) handler(e.dataTransfer.files[0]);
  });
  i.addEventListener('change', () => { if (i.files[0]) handler(i.files[0]); });
}

document.addEventListener('DOMContentLoaded', chrome);
