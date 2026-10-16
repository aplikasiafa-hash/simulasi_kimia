/* ==========================================================================
   tools/uji.js
   Penguji tanpa peramban. Menyediakan DOM dan kanvas tiruan secukupnya agar
   setiap sim.js benar-benar dijalankan: Sim.create() dipanggil, panel kontrol
   dibangun, draw() dan update() dijalankan berkali-kali, dan setiap kontrol
   digeser ke nilai ekstrem untuk menjaring galat yang hanya muncul di sana.

   Jalankan:  node tools/uji.js            (semua simulasi)
              node tools/uji.js laju-reaksi  (satu simulasi saja)
   ========================================================================== */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const AKAR = path.resolve(__dirname, '..');

/* ----------------------------------------------------------- DOM tiruan -- */

function buatNode(tag) {
  const n = {
    tagName: String(tag).toUpperCase(),
    nodeType: 1,
    children: [],
    childNodes: [],
    style: {},
    dataset: {},
    attributes: {},
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    _handlers: {},
    _text: '',
    disabled: false,
    checked: false,
    value: '',
    clientWidth: 760,
    clientHeight: 470,

    appendChild(c) { if (c) { this.children.push(c); this.childNodes.push(c); c.parentNode = this; } return c; },
    removeChild(c) {
      const i = this.children.indexOf(c);
      if (i >= 0) { this.children.splice(i, 1); this.childNodes.splice(i, 1); }
      return c;
    },
    insertBefore(c) { return this.appendChild(c); },
    setAttribute(k, v) { this.attributes[k] = String(v); if (k === 'value') this.value = v; },
    getAttribute(k) { return k in this.attributes ? this.attributes[k] : null; },
    removeAttribute(k) { delete this.attributes[k]; },
    hasAttribute(k) { return k in this.attributes; },
    addEventListener(ev, fn) { (this._handlers[ev] || (this._handlers[ev] = [])).push(fn); },
    removeEventListener(ev, fn) {
      const a = this._handlers[ev];
      if (a) { const i = a.indexOf(fn); if (i >= 0) a.splice(i, 1); }
    },
    dispatchEvent(e) {
      (this._handlers[e.type] || []).forEach((fn) => fn.call(this, e));
      return true;
    },
    getBoundingClientRect() { return { left: 0, top: 0, width: 760, height: 470, right: 760, bottom: 470 }; },
    setPointerCapture() {}, releasePointerCapture() {},
    focus() {}, blur() {}, click() { this.dispatchEvent({ type: 'click', target: this }); },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    closest() { return null; },
    contains() { return false; },
    remove() { if (this.parentNode) this.parentNode.removeChild(this); }
  };

  Object.defineProperty(n, 'textContent', {
    get() { return this._text; },
    set(v) { this._text = String(v); this.children.length = 0; this.childNodes.length = 0; }
  });
  Object.defineProperty(n, 'innerHTML', {
    get() { return this._html || ''; },
    set(v) { this._html = String(v); this.children.length = 0; this.childNodes.length = 0; }
  });
  Object.defineProperty(n, 'className', {
    get() { return this.attributes['class'] || ''; },
    set(v) { this.attributes['class'] = String(v); }
  });
  Object.defineProperty(n, 'firstChild', { get() { return this.children[0] || null; } });

  if (n.tagName === 'CANVAS') {
    n.width = 760; n.height = 470;
    n.getContext = () => buatCtx();
  }
  return n;
}

/* -------------------------------------------------------- kanvas tiruan -- */

function buatCtx() {
  const angkaWajar = (v, nama) => {
    if (typeof v === 'number' && !Number.isFinite(v)) {
      throw new Error('nilai tidak hingga (' + v + ') diberikan ke ctx.' + nama);
    }
  };
  const bungkus = (nama) => function () {
    for (let i = 0; i < arguments.length; i++) angkaWajar(arguments[i], nama);
  };

  const ctx = {
    canvas: { width: 760, height: 470 },
    fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, globalAlpha: 1,
    font: '13px sans-serif', textAlign: 'left', textBaseline: 'alphabetic',
    lineCap: 'butt', lineJoin: 'miter', globalCompositeOperation: 'source-over',
    shadowBlur: 0, shadowColor: 'transparent', shadowOffsetX: 0, shadowOffsetY: 0,
    filter: 'none',

    save() {}, restore() {}, beginPath() {}, closePath() {}, stroke() {}, fill() {},
    clip() {}, setLineDash() {}, getLineDash() { return []; },
    setTransform() {}, resetTransform() {}, transform() {},
    moveTo: bungkus('moveTo'), lineTo: bungkus('lineTo'),
    rect: bungkus('rect'), fillRect: bungkus('fillRect'),
    strokeRect: bungkus('strokeRect'), clearRect: bungkus('clearRect'),
    arc: bungkus('arc'), arcTo: bungkus('arcTo'), ellipse: bungkus('ellipse'),
    roundRect: bungkus('roundRect'),
    quadraticCurveTo: bungkus('quadraticCurveTo'), bezierCurveTo: bungkus('bezierCurveTo'),
    translate: bungkus('translate'), rotate: bungkus('rotate'), scale: bungkus('scale'),
    fillText(s, x, y) { angkaWajar(x, 'fillText.x'); angkaWajar(y, 'fillText.y'); },
    strokeText(s, x, y) { angkaWajar(x, 'strokeText.x'); angkaWajar(y, 'strokeText.y'); },
    measureText(s) { return { width: String(s == null ? '' : s).length * 6.2 }; },
    drawImage() {},
    createRadialGradient() { return { addColorStop() {} }; },
    createLinearGradient() { return { addColorStop() {} }; },
    createPattern() { return null; },
    getImageData() { return { data: new Uint8ClampedArray(4) }; },
    putImageData() {}, createImageData() { return { data: new Uint8ClampedArray(4) }; }
  };
  return ctx;
}

/* ------------------------------------------------- lingkungan window --- */

function buatLingkungan() {
  const body = buatNode('body');
  const html = buatNode('html');
  const dokumen = {
    documentElement: html,
    body: body,
    head: buatNode('head'),
    readyState: 'complete',
    activeElement: null,
    createElement: buatNode,
    createTextNode: (t) => ({ nodeType: 3, textContent: String(t) }),
    createElementNS: buatNode,
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener() {}, removeEventListener() {}
  };

  const rafAntrian = [];
  const win = {
    document: dokumen,
    devicePixelRatio: 2,
    innerWidth: 1280, innerHeight: 900,
    location: { href: 'http://local/test', protocol: 'http:' },
    navigator: { userAgent: 'uji' },
    performance: { now: () => Date.now() },
    requestAnimationFrame(fn) { rafAntrian.push(fn); return rafAntrian.length; },
    cancelAnimationFrame() {},
    setTimeout(fn) { return 0; },           // jangan jalankan tunda apa pun
    clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    matchMedia: () => ({ matches: false, addListener() {}, addEventListener() {} }),
    localStorage: {
      _d: {},
      getItem(k) { return k in this._d ? this._d[k] : null; },
      setItem(k, v) { this._d[k] = String(v); },
      removeItem(k) { delete this._d[k]; }
    },
    ResizeObserver: function () { return { observe() {}, unobserve() {}, disconnect() {} }; },
    addEventListener() {}, removeEventListener() {},
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    console: console,
    Math: Math, Date: Date, JSON: JSON,
    _raf: rafAntrian
  };
  win.window = win;
  win.self = win;
  win.globalThis = win;
  return win;
}

/* --------------------------------------------------------------- muat --- */

const PUSTAKA = [
  'assets/js/chem.js',
  'assets/js/plot.js',
  'assets/js/particles.js',
  'assets/js/core.js'
];

function jalankanBerkas(konteks, relatif) {
  const kode = fs.readFileSync(path.join(AKAR, relatif), 'utf8');
  vm.runInContext(kode, konteks, { filename: relatif });
}

function ujiSatu(slug) {
  const berkas = path.join(AKAR, 'sims', slug, 'sim.js');
  if (!fs.existsSync(berkas)) return { slug, status: 'kosong', pesan: 'sim.js belum ada' };

  const win = buatLingkungan();
  const konteks = vm.createContext(win);
  const catatan = [];

  try {
    PUSTAKA.forEach((p) => jalankanBerkas(konteks, p));
    jalankanBerkas(konteks, path.join('sims', slug, 'sim.js'));
  } catch (e) {
    return { slug, status: 'gagal', pesan: 'saat memuat: ' + e.message, tumpukan: e.stack };
  }

  const sim = win.__sim;
  if (!sim) return { slug, status: 'gagal', pesan: 'Sim.create() tidak pernah dipanggil' };

  const cfg = sim.cfg;

  // kelengkapan metadata
  if (!cfg.title) catatan.push('judul kosong');
  if (!cfg.fase) catatan.push('fase kosong');
  if (!cfg.notes) catatan.push('tanpa panel konsep');
  if (!cfg.quiz || !cfg.quiz.length) catatan.push('tanpa latihan');
  if (!cfg.explore || !cfg.explore.length) catatan.push('tanpa ajakan bereksperimen');

  // kuis harus menunjuk jawaban yang ada
  (cfg.quiz || []).forEach((q, i) => {
    if (!q.options || q.answer == null || q.answer < 0 || q.answer >= q.options.length) {
      catatan.push('kuis #' + (i + 1) + ' indeks jawaban di luar jangkauan');
    }
    if (!q.explain) catatan.push('kuis #' + (i + 1) + ' tanpa pembahasan');
  });

  const ctx = sim.ctx;

  // jalankan beberapa bingkai
  try {
    for (let i = 0; i < 40; i++) {
      if (cfg.update) cfg.update(sim, 1 / 60);
      sim.t += 1 / 60;
      if (cfg.draw) cfg.draw(ctx, sim);
      if (cfg.readoutsUpdate) cfg.readoutsUpdate(sim);
    }
  } catch (e) {
    return { slug, status: 'gagal', pesan: 'saat menjalankan bingkai: ' + e.message, tumpukan: e.stack };
  }

  // geser setiap kontrol ke nilai ekstrem dan tengah
  try {
    (cfg.controls || []).forEach((g) => {
      (g.items || []).forEach((c) => {
        if (c.id === undefined) return;
        let nilai = [];
        if (c.type === 'slider') nilai = [c.min, c.max, (c.min + c.max) / 2];
        else if (c.type === 'toggle') nilai = [true, false, !c.value];
        else if (c.type === 'select' || c.type === 'segment') {
          nilai = (c.options || []).map((o) => {
            const v = typeof o === 'object' ? o.value : o;
            return c.numeric ? parseFloat(v) : v;
          });
        }
        nilai.forEach((v) => {
          sim.set(c.id, v);
          if (cfg.update) cfg.update(sim, 1 / 60);
          if (cfg.draw) cfg.draw(ctx, sim);
          if (cfg.readoutsUpdate) cfg.readoutsUpdate(sim);
        });
      });
    });
  } catch (e) {
    return { slug, status: 'gagal', pesan: 'saat mengubah kontrol: ' + e.message, tumpukan: e.stack };
  }

  // tombol panggung dan tombol panel
  try {
    (cfg.stageButtons || []).forEach((b) => { b.onClick(sim); if (cfg.draw) cfg.draw(ctx, sim); });
    (cfg.controls || []).forEach((g) => (g.items || []).forEach((c) => {
      if (c.type === 'buttons') (c.items || []).forEach((b) => {
        b.onClick(sim);
        if (cfg.update) cfg.update(sim, 1 / 60);
        if (cfg.draw) cfg.draw(ctx, sim);
      });
    }));
  } catch (e) {
    return { slug, status: 'gagal', pesan: 'saat menekan tombol: ' + e.message, tumpukan: e.stack };
  }

  // interaksi penunjuk di seluruh panggung
  try {
    const titikUji = [];
    for (let gx = 0; gx <= 6; gx++) for (let gy = 0; gy <= 4; gy++) {
      titikUji.push([sim.W * gx / 6, sim.H * gy / 4]);
    }
    titikUji.forEach(([x, y]) => {
      const ev = { clientX: x, clientY: y, pointerId: 1, preventDefault() {} };
      if (cfg.onPointerDown) cfg.onPointerDown(sim, x, y, ev);
      if (cfg.onPointerMove) cfg.onPointerMove(sim, x, y, ev);
      if (cfg.onPointerUp) cfg.onPointerUp(sim, x, y, ev);
      if (cfg.update) cfg.update(sim, 1 / 60);
      if (cfg.draw) cfg.draw(ctx, sim);
    });
  } catch (e) {
    return { slug, status: 'gagal', pesan: 'saat interaksi penunjuk: ' + e.message, tumpukan: e.stack };
  }

  // atur ulang lalu jalankan lagi
  try {
    sim.reset();
    for (let i = 0; i < 20; i++) {
      if (cfg.update) cfg.update(sim, 1 / 60);
      if (cfg.draw) cfg.draw(ctx, sim);
      if (cfg.readoutsUpdate) cfg.readoutsUpdate(sim);
    }
  } catch (e) {
    return { slug, status: 'gagal', pesan: 'saat atur ulang: ' + e.message, tumpukan: e.stack };
  }

  return { slug, status: catatan.length ? 'catatan' : 'lulus', catatan };
}

/* ---------------------------------------------------------------- utama -- */

global.window = {};
require(path.join(AKAR, 'assets/js/katalog.js'));
const KATALOG = global.window.KATALOG;
delete global.window;

const saring = process.argv[2];
const daftar = saring ? KATALOG.filter((s) => s.slug === saring) : KATALOG;

if (!daftar.length) {
  console.error('Tidak ada simulasi bernama "' + saring + '".');
  process.exit(1);
}

let lulus = 0, gagal = 0, kosong = 0, catatan = 0;
const masalah = [];

daftar.forEach((s) => {
  const h = ujiSatu(s.slug);
  if (h.status === 'lulus') { lulus++; console.log('  ✓ ' + s.slug); }
  else if (h.status === 'catatan') {
    catatan++;
    console.log('  ~ ' + s.slug + '  — ' + h.catatan.join('; '));
  } else if (h.status === 'kosong') { kosong++; }
  else {
    gagal++;
    console.log('  ✗ ' + s.slug + '  — ' + h.pesan);
    masalah.push(h);
  }
});

console.log('');
console.log('Lulus: ' + lulus + '   Dengan catatan: ' + catatan +
            '   Gagal: ' + gagal + '   Belum dibuat: ' + kosong +
            '   (total katalog: ' + KATALOG.length + ')');

if (masalah.length && process.env.RINCI) {
  masalah.forEach((m) => {
    console.log('\n--- ' + m.slug + ' ---\n' + (m.tumpukan || m.pesan));
  });
}

process.exit(gagal ? 1 : 0);
