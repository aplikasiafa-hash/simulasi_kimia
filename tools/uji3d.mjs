/* ============================================================================
   SimKimia 3D — alat uji
   Membuka situs di Chromium tanpa kepala, memuat setiap simulasi, menyapu
   seluruh kendali, menjalankan beberapa detik animasi, lalu memotret layar.
   Galat JavaScript apa pun membuat simulasi itu dinyatakan gagal.

   Pakai:
     node tools/uji3d.mjs               seluruh simulasi
     node tools/uji3d.mjs slug [slug]   simulasi tertentu
     FOTO=1 node tools/uji3d.mjs        simpan tangkapan layar ke tools/foto/
   ========================================================================= */

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const AKAR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = process.env.CHROME_BIN || '/opt/pw-browsers/chromium';
const FOTO = !!process.env.FOTO;
const DIR_FOTO = path.join(AKAR, 'tools', 'foto');

// baca katalog tanpa menjalankan peramban
const katalogSrc = fs.readFileSync(path.join(AKAR, 'assets/js/katalog.js'), 'utf8');
const sandbox = { window: {} };
new Function('window', katalogSrc)(sandbox.window);
const KATALOG = sandbox.window.KATALOG;

const pilih = process.argv.slice(2);
const target = pilih.length
  ? KATALOG.filter(s => pilih.includes(s.slug))
  : KATALOG;

if (!target.length) {
  console.error('Tidak ada slug yang cocok.');
  process.exit(1);
}

if (FOTO) fs.mkdirSync(DIR_FOTO, { recursive: true });

/* ----------------------------------------------- pemeriksaan statis --- */
/* const/let yang ditulis di bawah `return {…}` tidak pernah dijalankan,
   sehingga pemakaiannya dari dalam fungsi melempar ReferenceError saat
   simulasi berjalan. Tangkap lebih dulu sebelum membuka peramban. */
const masalahStatis = [];
for (const s of target) {
  const berkas = path.join(AKAR, 'sims', s.slug, 'sim.js');
  if (!fs.existsSync(berkas)) continue;
  const src = fs.readFileSync(berkas, 'utf8');
  const mulai = src.indexOf('\n  return {');
  if (mulai < 0) continue;
  const tutup = src.indexOf('\n  };\n', mulai);
  if (tutup < 0) continue;
  const setelah = src.slice(tutup);
  const re = /\n  (const|let) ([A-Za-z_$][\w$]*)\s*=/g;
  let m;
  while ((m = re.exec(setelah)) !== null) {
    masalahStatis.push(`${s.slug}: ${m[1]} ${m[2]} dideklarasikan setelah return — pindahkan ke atas`);
  }
}
if (masalahStatis.length) {
  console.error('\nPemeriksaan statis gagal:');
  masalahStatis.forEach(m => console.error('  ✗  ' + m));
  process.exit(1);
}

const browser = await chromium.launch({
  executablePath: CHROME,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
         '--disable-lcd-text', '--force-color-profile=srgb']
});
const page = await browser.newPage({ viewport: { width: 1440, height: 860 } });

let galat = [];
page.on('pageerror', e => galat.push('pageerror: ' + e.message));
page.on('console', m => {
  if (m.type() === 'error') {
    const t = m.text();
    if (/favicon|fonts\.googleapis|fonts\.gstatic|ERR_/i.test(t)) return;
    galat.push('console: ' + t);
  }
});

await page.goto('file://' + path.join(AKAR, 'index.html'));
await page.waitForFunction(() => window.App && window.Sim3D, null, { timeout: 15000 });
await page.waitForTimeout(600);

/* --------------------------------------------------------------- jalan -- */

let lulus = 0, gagal = 0, belum = 0;
const catatanGagal = [];

for (const sim of target) {
  galat = [];
  const t0 = Date.now();

  // matikan putar otomatis agar foto konsisten
  await page.evaluate(async (slug) => {
    await window.App.mulai(slug);
  }, sim.slug);
  await page.waitForTimeout(340);

  const terdaftar = await page.evaluate(s => !!window.Sim3D.ambil(s), sim.slug);
  if (!terdaftar) {
    belum++;
    console.log('  ·  ' + sim.slug.padEnd(24) + 'belum dibuat');
    continue;
  }

  // sapu semua kendali ke nilai ekstrem lalu tengah
  const sapuan = await page.evaluate(async () => {
    const tunggu = ms => new Promise(r => setTimeout(r, ms));
    const hasil = { slider: 0, toggle: 0, select: 0, seg: 0, tombol: 0 };

    for (const inp of document.querySelectorAll('#kendali-isi input[type=range]')) {
      hasil.slider++;
      const min = parseFloat(inp.min), maks = parseFloat(inp.max), asal = inp.value;
      for (const v of [min, maks, (min + maks) / 2, asal]) {
        inp.value = v;
        inp.dispatchEvent(new Event('input', { bubbles: true }));
        await tunggu(8);
      }
    }
    for (const inp of document.querySelectorAll('#kendali-isi input[type=checkbox]')) {
      hasil.toggle++;
      for (let i = 0; i < 2; i++) {
        inp.checked = !inp.checked;
        inp.dispatchEvent(new Event('change', { bubbles: true }));
        await tunggu(14);
      }
    }
    for (const sel of document.querySelectorAll('#kendali-isi select')) {
      hasil.select++;
      const n = sel.options.length, asal = sel.selectedIndex;
      for (let i = 0; i < n; i++) {
        sel.selectedIndex = i;
        sel.dispatchEvent(new Event('change', { bubbles: true }));
        await tunggu(18);
      }
      sel.selectedIndex = asal;
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      await tunggu(14);
    }
    for (const bar of document.querySelectorAll('#kendali-isi .seg')) {
      const tb = Array.from(bar.querySelectorAll('button'));
      hasil.seg += tb.length;
      for (const b of tb) { b.click(); await tunggu(18); }
      tb[0] && tb[0].click();
      await tunggu(14);
    }
    for (const b of document.querySelectorAll('#kendali-isi .tombol-baris button')) {
      hasil.tombol++;
      b.click();
      await tunggu(26);
    }
    return hasil;
  });

  // biarkan animasi berjalan
  await page.waitForTimeout(600);

  // seret untuk menguji orbit, lalu zoom
  const kotak = await page.locator('#panggung').boundingBox();
  await page.mouse.move(kotak.width / 2, kotak.height / 2);
  await page.mouse.down();
  await page.mouse.move(kotak.width / 2 + 160, kotak.height / 2 - 70, { steps: 8 });
  await page.mouse.up();
  await page.mouse.wheel(0, -240);
  await page.waitForTimeout(380);

  // periksa bahwa kanvas benar-benar menggambar sesuatu (bukan layar kosong)
  const hidup = await page.evaluate(() => {
    const r = document.querySelector('#panggung');
    const g = r.getContext('webgl2') || r.getContext('webgl');
    return !!g && !g.isContextLost();
  });
  if (!hidup) galat.push('konteks WebGL hilang');

  if (FOTO) {
    await page.screenshot({ path: path.join(DIR_FOTO, sim.slug + '.png') });
  }

  const ms = Date.now() - t0;
  if (galat.length) {
    gagal++;
    catatanGagal.push({ slug: sim.slug, galat: galat.slice(0, 4) });
    console.log('  ✗  ' + sim.slug.padEnd(24) + galat[0].slice(0, 96));
  } else {
    lulus++;
    const k = `${sapuan.slider}s ${sapuan.toggle}t ${sapuan.select}p ${sapuan.seg}g ${sapuan.tombol}b`;
    console.log('  ✓  ' + sim.slug.padEnd(24) + k.padEnd(22) + (ms / 1000).toFixed(1) + ' dtk');
  }
}

/* ------------------------------------------------- uji kerangka aplikasi */

if (!pilih.length) {
  console.log('\nKerangka aplikasi:');
  galat = [];
  const cek = [];

  // pemilih terbuka dan berisi seluruh katalog
  await page.keyboard.press('s');
  await page.waitForTimeout(300);
  const nKartu = await page.locator('#pemilih .pem-kartu').count();
  cek.push([nKartu === KATALOG.length, `pemilih berisi ${nKartu} dari ${KATALOG.length} simulasi`]);

  // pencarian menyaring
  await page.fill('#pem-cari', 'titrasi');
  await page.waitForTimeout(200);
  const nSaring = await page.locator('#pemilih .pem-kartu:visible').count();
  cek.push([nSaring > 0 && nSaring < KATALOG.length, `pencarian "titrasi" menyisakan ${nSaring} kartu`]);
  await page.fill('#pem-cari', '');
  await page.waitForTimeout(150);

  // memilih dari pemilih memuat simulasi tanpa pindah halaman
  const urlSebelum = page.url().split('#')[0];
  await page.locator('#pemilih .pem-kartu[data-slug="skala-ph"]').click();
  await page.waitForTimeout(700);
  const urlSesudah = page.url().split('#')[0];
  const judul = await page.locator('#judul').textContent();
  cek.push([urlSebelum === urlSesudah, 'berganti simulasi tanpa memuat ulang halaman']);
  cek.push([/pH/i.test(judul), 'judul berganti menjadi simulasi terpilih']);

  // tombol dan pintasan papan ketik
  await page.keyboard.press(' ');
  await page.waitForTimeout(120);
  const jeda = await page.locator('#btn-jalan.jeda').count();
  cek.push([jeda === 1, 'Spasi menjeda animasi']);
  await page.keyboard.press(' ');

  await page.keyboard.press('c');
  await page.waitForTimeout(260);
  const sembunyi = await page.evaluate(() => document.body.classList.contains('sembunyi-kendali'));
  cek.push([sembunyi, 'C menyembunyikan panel kendali']);
  await page.keyboard.press('c');

  await page.keyboard.press('h');
  await page.waitForTimeout(200);
  const sembunyiUi = await page.evaluate(() => document.body.classList.contains('sembunyi-ui'));
  cek.push([sembunyiUi, 'H menyembunyikan seluruh antarmuka']);
  await page.keyboard.press('h');

  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(700);
  const judul2 = await page.locator('#judul').textContent();
  cek.push([judul2 !== judul, 'panah kanan berpindah ke simulasi berikutnya']);

  // API layar penuh tersedia (tidak bisa benar-benar dipicu tanpa gerak pengguna)
  const adaFs = await page.evaluate(() => !!document.documentElement.requestFullscreen);
  cek.push([adaFs, 'API layar penuh tersedia']);

  cek.forEach(([ok, teks]) => console.log('  ' + (ok ? '✓' : '✗') + '  ' + teks));
  const gagalKerangka = cek.filter(c => !c[0]).length;
  if (galat.length) { console.log('  ✗  galat: ' + galat[0]); }
  if (gagalKerangka || galat.length) gagal += gagalKerangka + (galat.length ? 1 : 0);
}

await browser.close();

console.log('');
console.log(`Lulus: ${lulus}   Gagal: ${gagal}   Belum dibuat: ${belum}   (katalog: ${KATALOG.length})`);
if (catatanGagal.length) {
  console.log('\nRincian kegagalan:');
  catatanGagal.forEach(c => {
    console.log('  ' + c.slug);
    c.galat.forEach(g => console.log('    - ' + g));
  });
}
if (FOTO) console.log('\nTangkapan layar: tools/foto/');
process.exit(gagal ? 1 : 0);
