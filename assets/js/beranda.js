/* ==========================================================================
   SimKimia — beranda.js
   Membangun katalog simulasi: penyaring fase, topik, pencarian, dan kisi
   kartu dengan gambar kecil (thumbnail) yang dibuat secara prosedural.
   ========================================================================== */

(function () {
  'use strict';

  const el = Sim.el;
  const KATALOG = window.KATALOG || [];
  const FASE_INFO = window.FASE_INFO || {};
  const URUT_FASE = ['A', 'B', 'C', 'D', 'E', 'F'];

  /* --------------------------------------------- gambar kecil prosedural -- */

  /** Pembangkit acak berulang (deterministik) dari sebuah teks. */
  function benih(teks) {
    let h = 2166136261;
    for (let i = 0; i < teks.length; i++) {
      h ^= teks.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return function () {
      h += 0x6D2B79F5;
      let t = h;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /**
   * Menggambar "rasi molekul": simpul yang terhubung garis, unik untuk tiap
   * simulasi tetapi selalu sama setiap kali halaman dimuat.
   */
  function thumbnail(sim) {
    const r = benih(sim.slug);
    const W = 320, H = 180;
    const warna = sim.warna;
    const n = 5 + Math.floor(r() * 4);
    const titik = [];
    for (let i = 0; i < n; i++) {
      titik.push({
        x: 34 + r() * (W - 68),
        y: 30 + r() * (H - 60),
        rad: 7 + r() * 13
      });
    }
    // dorong simpul agar tidak saling menumpuk
    for (let pass = 0; pass < 26; pass++) {
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
        const a = titik[i], b = titik[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 0.01;
        const min = a.rad + b.rad + 20;
        if (d < min) {
          const k = (min - d) / d * 0.5;
          a.x -= dx * k; a.y -= dy * k;
          b.x += dx * k; b.y += dy * k;
        }
      }
    }
    titik.forEach(function (p) {
      p.x = Math.max(24, Math.min(W - 24, p.x));
      p.y = Math.max(22, Math.min(H - 22, p.y));
    });

    let garis = '';
    for (let i = 1; i < n; i++) {
      const j = Math.floor(r() * i);
      garis += '<line x1="' + titik[i].x.toFixed(1) + '" y1="' + titik[i].y.toFixed(1) +
        '" x2="' + titik[j].x.toFixed(1) + '" y2="' + titik[j].y.toFixed(1) +
        '" stroke="' + warna + '" stroke-opacity=".42" stroke-width="' + (1.4 + r() * 1.6).toFixed(1) + '"/>';
    }

    let simpul = '';
    titik.forEach(function (p, i) {
      const terang = i % 3 === 0;
      simpul += '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="' + p.rad.toFixed(1) +
        '" fill="' + warna + '" fill-opacity="' + (terang ? '.92' : '.5') + '"/>';
      if (terang) {
        simpul += '<circle cx="' + (p.x - p.rad * 0.3).toFixed(1) + '" cy="' + (p.y - p.rad * 0.32).toFixed(1) +
          '" r="' + (p.rad * 0.3).toFixed(1) + '" fill="#fff" fill-opacity=".28"/>';
      }
    });

    // debu latar
    let debu = '';
    for (let i = 0; i < 22; i++) {
      debu += '<circle cx="' + (r() * W).toFixed(1) + '" cy="' + (r() * H).toFixed(1) +
        '" r="' + (0.7 + r() * 1.5).toFixed(1) + '" fill="#fff" fill-opacity="' + (0.05 + r() * 0.12).toFixed(2) + '"/>';
    }

    const gid = 'g-' + sim.slug;
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      '<defs><radialGradient id="' + gid + '" cx="30%" cy="22%" r="95%">' +
      '<stop offset="0" stop-color="' + warna + '" stop-opacity=".30"/>' +
      '<stop offset="1" stop-color="' + warna + '" stop-opacity="0"/>' +
      '</radialGradient></defs>' +
      '<rect width="' + W + '" height="' + H + '" fill="#11161c"/>' +
      '<rect width="' + W + '" height="' + H + '" fill="url(#' + gid + ')"/>' +
      debu + garis + simpul +
      '</svg>';
  }

  /* --------------------------------------------------------------- kartu -- */

  function kartu(sim) {
    const thumb = el('div', { class: 'sim-thumb', html: thumbnail(sim) });
    thumb.appendChild(el('span', {
      class: 'fase-chip',
      style: { background: sim.warna },
      text: 'Fase ' + sim.fase
    }));
    return el('a', {
      class: 'sim-card',
      href: 'sims/' + sim.slug + '/index.html',
      'data-slug': sim.slug
    }, [
      thumb,
      el('div', { class: 'sim-body' }, [
        el('h3', { text: sim.judul }),
        el('p', { text: sim.ringkas }),
        el('div', { class: 'sim-card-topik' },
          sim.topik.slice(0, 3).map(function (t) { return el('span', { class: 'badge', text: t }); }))
      ])
    ]);
  }

  /* ------------------------------------------------------------ penyaring */

  const keadaan = { fase: 'semua', topik: 'semua', cari: '' };

  function cocok(sim) {
    if (keadaan.fase !== 'semua' && sim.fase !== keadaan.fase) return false;
    if (keadaan.topik !== 'semua' && sim.topik.indexOf(keadaan.topik) === -1) return false;
    if (keadaan.cari) {
      const q = keadaan.cari.toLowerCase();
      const haystack = (sim.judul + ' ' + sim.ringkas + ' ' + sim.topik.join(' ') + ' ' +
        sim.jenjang + ' ' + (sim.cp || '')).toLowerCase();
      if (haystack.indexOf(q) === -1) return false;
    }
    return true;
  }

  function render() {
    const hasil = document.getElementById('hasil');
    hasil.innerHTML = '';
    const terpilih = KATALOG.filter(cocok);

    document.getElementById('jumlah').textContent =
      terpilih.length + ' dari ' + KATALOG.length + ' simulasi';

    if (!terpilih.length) {
      hasil.appendChild(el('div', { class: 'empty' }, [
        el('strong', { text: 'Tidak ada simulasi yang cocok' }),
        el('p', { text: 'Coba hapus kata pencarian atau pilih fase lain.' })
      ]));
      return;
    }

    URUT_FASE.forEach(function (f) {
      const isi = terpilih.filter(function (s) { return s.fase === f; });
      if (!isi.length) return;
      const info = FASE_INFO[f] || {};
      hasil.appendChild(el('section', { class: 'fase-section', id: 'fase-' + f }, [
        el('div', { class: 'fase-header' }, [
          el('span', { class: 'fase-bar', style: { background: info.warna } }),
          el('h2', { text: info.label || ('Fase ' + f) }),
          el('span', { class: 'jenjang', text: info.jenjang || '' }),
          info.catatan ? el('span', { class: 'note', text: info.catatan }) : null
        ]),
        el('div', { class: 'grid' }, isi.map(kartu))
      ]));
    });
  }

  /* ----------------------------------------------------------- pemasangan */

  function pasang() {
    // pil fase
    const pills = document.getElementById('fase-pills');
    const daftar = [{ k: 'semua', label: 'Semua fase' }].concat(
      URUT_FASE.map(function (f) {
        return { k: f, label: 'Fase ' + f, sub: (FASE_INFO[f] || {}).jenjang };
      })
    );
    daftar.forEach(function (d) {
      const b = el('button', {
        class: 'pill', type: 'button', 'data-fase': d.k,
        'aria-pressed': d.k === 'semua' ? 'true' : 'false',
        title: d.sub || 'Tampilkan semua fase'
      }, [el('span', { class: 'dot', 'aria-hidden': 'true' }), el('span', { text: d.label })]);
      b.addEventListener('click', function () {
        keadaan.fase = d.k;
        Array.prototype.forEach.call(pills.children, function (c) {
          c.setAttribute('aria-pressed', c === b ? 'true' : 'false');
        });
        render();
      });
      pills.appendChild(b);
    });

    // daftar topik
    const topikSet = {};
    KATALOG.forEach(function (s) { s.topik.forEach(function (t) { topikSet[t] = (topikSet[t] || 0) + 1; }); });
    const sel = document.getElementById('topik');
    sel.appendChild(el('option', { value: 'semua', text: 'Semua topik' }));
    Object.keys(topikSet).sort(function (a, b) { return a.localeCompare(b, 'id'); })
      .forEach(function (t) {
        sel.appendChild(el('option', { value: t, text: t + ' (' + topikSet[t] + ')' }));
      });
    sel.addEventListener('change', function () { keadaan.topik = sel.value; render(); });

    // pencarian
    const cari = document.getElementById('cari');
    let tunda;
    cari.addEventListener('input', function () {
      clearTimeout(tunda);
      tunda = setTimeout(function () { keadaan.cari = cari.value.trim(); render(); }, 90);
    });

    // statistik hero
    document.getElementById('stat-sim').textContent = KATALOG.length;
    const topikTotal = Object.keys(topikSet).length;
    document.getElementById('stat-topik').textContent = topikTotal;

    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pasang);
  else pasang();
})();
