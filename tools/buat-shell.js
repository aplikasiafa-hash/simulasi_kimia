/* ==========================================================================
   tools/buat-shell.js
   Membuat berkas sims/<slug>/index.html untuk setiap simulasi di katalog.
   Kerangka HTML-nya seragam; seluruh isi halaman dibangun oleh sim.js.

   Jalankan dari akar proyek:  node tools/buat-shell.js
   Berkas sim.js yang sudah ada tidak pernah ditimpa.
   ========================================================================== */

const fs = require('fs');
const path = require('path');

const AKAR = path.resolve(__dirname, '..');

// katalog.js menulis ke `window`, jadi sediakan window palsu lalu muat.
global.window = {};
require(path.join(AKAR, 'assets/js/katalog.js'));
const KATALOG = global.window.KATALOG;

function shell(sim) {
  const judul = sim.judul.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const ringkas = sim.ringkas.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${judul} — SimKimia</title>
<meta name="description" content="${ringkas}">
<meta property="og:title" content="${judul} — SimKimia">
<meta property="og:description" content="${ringkas}">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='22' fill='${encodeURIComponent(sim.warna)}'/><text y='72' x='50' text-anchor='middle' font-size='62' font-family='sans-serif' font-weight='bold' fill='white'>K</text></svg>">
<link rel="stylesheet" href="../../assets/css/base.css">
<link rel="stylesheet" href="../../assets/css/sim.css">
</head>
<body>
<noscript>
  <div class="wrap" style="padding:40px 16px">
    <h1>${judul}</h1>
    <p>Simulasi ini memerlukan JavaScript. Mohon aktifkan JavaScript di peramban Anda,
       lalu muat ulang halaman.</p>
    <p><a href="../../index.html">← Kembali ke daftar simulasi</a></p>
  </div>
</noscript>
<script src="../../assets/js/chem.js"></script>
<script src="../../assets/js/plot.js"></script>
<script src="../../assets/js/particles.js"></script>
<script src="../../assets/js/core.js"></script>
<script src="sim.js"></script>
</body>
</html>
`;
}

let dibuat = 0, dilewati = 0, tanpaLogika = [];

KATALOG.forEach(function (sim) {
  const dir = path.join(AKAR, 'sims', sim.slug);
  fs.mkdirSync(dir, { recursive: true });

  const indexPath = path.join(dir, 'index.html');
  fs.writeFileSync(indexPath, shell(sim), 'utf8');
  dibuat++;

  const simPath = path.join(dir, 'sim.js');
  if (!fs.existsSync(simPath)) tanpaLogika.push(sim.slug);
  else dilewati++;
});

console.log('Kerangka HTML ditulis : ' + dibuat);
console.log('sim.js sudah ada      : ' + dilewati);
if (tanpaLogika.length) {
  console.log('Belum ada sim.js (' + tanpaLogika.length + '):');
  tanpaLogika.forEach(function (s) { console.log('  - ' + s); });
}
