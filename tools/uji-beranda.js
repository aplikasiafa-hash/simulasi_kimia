/* ==========================================================================
   tools/uji-beranda.js
   Menguji halaman katalog tanpa peramban: membangun penyaring, menghasilkan
   seluruh kartu, menjalankan pencarian, dan menyaring tiap fase serta topik.

   Jalankan:  node tools/uji-beranda.js
   ========================================================================== */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const AKAR = path.resolve(__dirname, '..');

/* --------------------------------------------------------- DOM tiruan --- */

function buatNode(tag) {
  const n = {
    tagName: String(tag).toUpperCase(),
    children: [], childNodes: [], style: {}, dataset: {}, attributes: {},
    _handlers: {}, _text: '', _html: '', value: '', checked: false,
    appendChild(c) { if (c) { this.children.push(c); this.childNodes.push(c); c.parentNode = this; } return c; },
    setAttribute(k, v) { this.attributes[k] = String(v); },
    getAttribute(k) { return k in this.attributes ? this.attributes[k] : null; },
    addEventListener(ev, fn) { (this._handlers[ev] || (this._handlers[ev] = [])).push(fn); },
    removeEventListener() {},
    dispatchEvent(e) { (this._handlers[e.type] || []).forEach((fn) => fn.call(this, e)); return true; },
    getBoundingClientRect() { return { left: 0, top: 0, width: 800, height: 600 }; },
    focus() {}, click() { this.dispatchEvent({ type: 'click', target: this }); },
    querySelector() { return null; }, querySelectorAll() { return []; }
  };
  Object.defineProperty(n, 'textContent', {
    get() { return this._text; },
    set(v) { this._text = String(v); }
  });
  Object.defineProperty(n, 'innerHTML', {
    get() { return this._html; },
    set(v) { this._html = String(v); this.children.length = 0; this.childNodes.length = 0; }
  });
  Object.defineProperty(n, 'className', {
    get() { return this.attributes['class'] || ''; },
    set(v) { this.attributes['class'] = String(v); }
  });
  if (n.tagName === 'CANVAS') n.getContext = () => ({});
  return n;
}

/** Hitung seluruh simpul keturunan dengan kelas tertentu. */
function hitungKelas(simpul, kelas, hasil) {
  hasil = hasil || { n: 0 };
  if (simpul.attributes && (simpul.attributes['class'] || '').split(' ').indexOf(kelas) >= 0) hasil.n++;
  (simpul.children || []).forEach((c) => hitungKelas(c, kelas, hasil));
  return hasil.n;
}

const simpulId = {};
['hasil', 'jumlah', 'fase-pills', 'topik', 'cari', 'stat-sim', 'stat-topik'].forEach(function (id) {
  simpulId[id] = buatNode(id === 'topik' ? 'select' : id === 'cari' ? 'input' : 'div');
});

const dokumen = {
  documentElement: buatNode('html'),
  body: buatNode('body'),
  readyState: 'complete',
  createElement: buatNode,
  createTextNode: (t) => ({ nodeType: 3, textContent: String(t) }),
  getElementById: (id) => simpulId[id] || null,
  querySelector: () => null, querySelectorAll: () => [],
  addEventListener() {}
};

const win = {
  document: dokumen, devicePixelRatio: 1,
  performance: { now: () => Date.now() },
  requestAnimationFrame() { return 1; }, cancelAnimationFrame() {},
  setTimeout(fn) { if (typeof fn === 'function') fn(); return 0; },
  clearTimeout() {},
  matchMedia: () => ({ matches: false, addListener() {} }),
  localStorage: { _d: {}, getItem(k) { return this._d[k] || null; }, setItem(k, v) { this._d[k] = v; } },
  ResizeObserver: function () { return { observe() {} }; },
  addEventListener() {}, console: console, Math: Math, Date: Date, JSON: JSON
};
win.window = win;

const konteks = vm.createContext(win);
['assets/js/core.js', 'assets/js/katalog.js', 'assets/js/beranda.js'].forEach(function (p) {
  vm.runInContext(fs.readFileSync(path.join(AKAR, p), 'utf8'), konteks, { filename: p });
});

const KATALOG = win.KATALOG;
let gagal = 0;

function periksa(nama, syarat, rincian) {
  if (syarat) console.log('  ✓ ' + nama);
  else { console.log('  ✗ ' + nama + (rincian ? '  — ' + rincian : '')); gagal++; }
}

/* ----- seluruh kartu terbangun ----- */
const kartuAwal = hitungKelas(simpulId['hasil'], 'sim-card');
periksa('Seluruh ' + KATALOG.length + ' kartu terbangun', kartuAwal === KATALOG.length,
  'terbangun ' + kartuAwal);

/* ----- bagian fase terbangun ----- */
const bagian = hitungKelas(simpulId['hasil'], 'fase-section');
periksa('Enam bagian fase terbangun', bagian === 6, 'terbangun ' + bagian);

/* ----- pil penyaring fase ----- */
periksa('Tujuh pil penyaring (semua + 6 fase)', simpulId['fase-pills'].children.length === 7,
  simpulId['fase-pills'].children.length + ' pil');

/* ----- statistik hero ----- */
periksa('Jumlah simulasi tampil di hero', simpulId['stat-sim'].textContent === String(KATALOG.length));

/* ----- penyaringan tiap fase ----- */
['A', 'B', 'C', 'D', 'E', 'F'].forEach(function (f, i) {
  const pil = simpulId['fase-pills'].children[i + 1];
  pil.dispatchEvent({ type: 'click', target: pil });
  const n = hitungKelas(simpulId['hasil'], 'sim-card');
  const harus = KATALOG.filter((s) => s.fase === f).length;
  periksa('Saring Fase ' + f + ' → ' + harus + ' kartu', n === harus, 'dapat ' + n);
});

/* ----- kembali ke semua ----- */
const pilSemua = simpulId['fase-pills'].children[0];
pilSemua.dispatchEvent({ type: 'click', target: pilSemua });
periksa('Kembali ke semua fase', hitungKelas(simpulId['hasil'], 'sim-card') === KATALOG.length);

/* ----- pencarian ----- */
simpulId['cari'].value = 'titrasi';
simpulId['cari'].dispatchEvent({ type: 'input', target: simpulId['cari'] });
const hasilCari = hitungKelas(simpulId['hasil'], 'sim-card');
periksa('Pencarian "titrasi" menemukan hasil', hasilCari >= 1 && hasilCari < KATALOG.length,
  hasilCari + ' kartu');

simpulId['cari'].value = 'zzzqqq';
simpulId['cari'].dispatchEvent({ type: 'input', target: simpulId['cari'] });
periksa('Pencarian tanpa hasil menampilkan pesan kosong',
  hitungKelas(simpulId['hasil'], 'sim-card') === 0 &&
  hitungKelas(simpulId['hasil'], 'empty') === 1);

simpulId['cari'].value = '';
simpulId['cari'].dispatchEvent({ type: 'input', target: simpulId['cari'] });

/* ----- penyaring topik ----- */
const opsiTopik = simpulId['topik'].children.length;
periksa('Daftar topik terisi', opsiTopik > 5, opsiTopik + ' opsi');

simpulId['topik'].value = 'Asam Basa';
simpulId['topik'].dispatchEvent({ type: 'change', target: simpulId['topik'] });
const nTopik = hitungKelas(simpulId['hasil'], 'sim-card');
const harusTopik = KATALOG.filter((s) => s.topik.indexOf('Asam Basa') >= 0).length;
periksa('Saring topik "Asam Basa" → ' + harusTopik + ' kartu', nTopik === harusTopik, 'dapat ' + nTopik);

/* ----- kelengkapan metadata katalog ----- */
let metaKurang = 0;
KATALOG.forEach(function (s) {
  if (!s.slug || !s.judul || !s.fase || !s.jenjang || !s.ringkas ||
      !s.topik || !s.topik.length || !s.warna || !s.cp) metaKurang++;
});
periksa('Metadata seluruh entri katalog lengkap', metaKurang === 0, metaKurang + ' entri kurang');

console.log('');
if (gagal) { console.log('Gagal: ' + gagal); process.exit(1); }
console.log('✓ Halaman katalog berjalan dengan benar.');
