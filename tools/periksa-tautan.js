/* ==========================================================================
   tools/periksa-tautan.js
   Memeriksa seluruh tautan dan rujukan berkas di dalam proyek: href, src,
   serta jalur yang disebut di katalog. Memastikan tidak ada tautan rusak
   sebelum situs diunggah ke GitHub Pages.

   Jalankan:  node tools/periksa-tautan.js
   ========================================================================== */

const fs = require('fs');
const path = require('path');

const AKAR = path.resolve(__dirname, '..');

/** Kumpulkan seluruh berkas HTML di proyek. */
function cariHtml(dir, hasil) {
  hasil = hasil || [];
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (e) {
    if (e.name.startsWith('.') || e.name === 'node_modules') return;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) cariHtml(p, hasil);
    else if (e.name.endsWith('.html')) hasil.push(p);
  });
  return hasil;
}

const berkasHtml = cariHtml(AKAR);
let diperiksa = 0, rusak = 0;
const masalah = [];

berkasHtml.forEach(function (berkas) {
  const isi = fs.readFileSync(berkas, 'utf8');
  const dir = path.dirname(berkas);
  const rel = path.relative(AKAR, berkas);

  const pola = /(?:href|src)\s*=\s*["']([^"']+)["']/g;
  let m;
  while ((m = pola.exec(isi)) !== null) {
    const tautan = m[1];
    // lewati tautan luar, jangkar, data URI, dan mailto
    if (/^(https?:|mailto:|data:|#|\/\/)/.test(tautan)) continue;

    const bersih = tautan.split('#')[0].split('?')[0];
    if (!bersih) continue;

    diperiksa++;
    const tujuan = path.resolve(dir, bersih);
    if (!fs.existsSync(tujuan)) {
      rusak++;
      masalah.push(rel + '  →  ' + tautan);
    }
  }
});

/* ----- periksa setiap entri katalog punya berkasnya ----- */
global.window = {};
require(path.join(AKAR, 'assets/js/katalog.js'));
const KATALOG = global.window.KATALOG;
delete global.window;

let katalogRusak = 0;
KATALOG.forEach(function (s) {
  ['index.html', 'sim.js'].forEach(function (f) {
    const p = path.join(AKAR, 'sims', s.slug, f);
    diperiksa++;
    if (!fs.existsSync(p)) {
      katalogRusak++;
      masalah.push('katalog: ' + s.slug + '  →  berkas ' + f + ' tidak ada');
    }
  });
});

/* ----- periksa slug unik ----- */
const terlihat = {};
KATALOG.forEach(function (s) {
  if (terlihat[s.slug]) masalah.push('katalog: slug ganda "' + s.slug + '"');
  terlihat[s.slug] = true;
});

/* ----- periksa berkas wajib ----- */
['index.html', 'panduan.html', '.nojekyll', 'README.md'].forEach(function (f) {
  diperiksa++;
  if (!fs.existsSync(path.join(AKAR, f))) {
    masalah.push('berkas wajib tidak ada: ' + f);
  }
});

console.log('Tautan dan rujukan diperiksa : ' + diperiksa);
console.log('Berkas HTML                  : ' + berkasHtml.length);
console.log('Entri katalog                : ' + KATALOG.length);

if (masalah.length) {
  console.log('\nMasalah ditemukan (' + masalah.length + '):');
  masalah.forEach(function (p) { console.log('  ✗ ' + p); });
  process.exit(1);
}
console.log('\n✓ Semua tautan dan berkas lengkap.');
