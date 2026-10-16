/* Wujud Benda di Sekitar Kita — Fase A
   Seret benda ke keranjang padat, cair, atau gas. Keranjang menampilkan
   susunan partikel masing-masing wujud. */

(function () {
  'use strict';

  const D = Sim.Draw, P = Sim.P;

  const BENDA = [
    { nama: 'Batu',     wujud: 'padat', warna: '#8d939a', bentuk: 'batu' },
    { nama: 'Kayu',     wujud: 'padat', warna: '#a8763f', bentuk: 'balok' },
    { nama: 'Es batu',  wujud: 'padat', warna: '#9fd4ee', bentuk: 'kubus' },
    { nama: 'Buku',     wujud: 'padat', warna: '#c25a4a', bentuk: 'balok' },
    { nama: 'Air',      wujud: 'cair',  warna: '#4a9fd0', bentuk: 'gelas' },
    { nama: 'Susu',     wujud: 'cair',  warna: '#eee6d8', bentuk: 'gelas' },
    { nama: 'Minyak',   wujud: 'cair',  warna: '#e0c04a', bentuk: 'botol' },
    { nama: 'Kecap',    wujud: 'cair',  warna: '#4a3a30', bentuk: 'botol' },
    { nama: 'Udara',    wujud: 'gas',   warna: '#7fd8e0', bentuk: 'balon' },
    { nama: 'Asap',     wujud: 'gas',   warna: '#9aa4ae', bentuk: 'awan' },
    { nama: 'Uap air',  wujud: 'gas',   warna: '#bcd8e8', bentuk: 'awan' },
    { nama: 'Gas balon',wujud: 'gas',   warna: '#e07aa8', bentuk: 'balon' }
  ];

  const KERANJANG = [
    { wujud: 'padat', label: 'PADAT', warna: '#e8713c',
      sifat: 'Bentuk tetap · Volume tetap' },
    { wujud: 'cair',  label: 'CAIR',  warna: '#4a9fd0',
      sifat: 'Bentuk berubah · Volume tetap' },
    { wujud: 'gas',   label: 'GAS',   warna: '#9a7fd0',
      sifat: 'Bentuk berubah · Volume berubah' }
  ];

  const W = 780, H = 500;
  const TRAY_Y = 56, KER_Y = 250, KER_H = 190;

  function siapkan(sim) {
    sim.data.item = BENDA.map(function (b, i) {
      return Object.assign({}, b, {
        i: i, x: 0, y: 0, hx: 0, hy: 0,
        ditempatkan: null, goyang: 0, muncul: 0, seret: false
      });
    });
    sim.data.ambil = null;
    sim.data.pesan = '';
    sim.data.pesanWaktu = 0;
    sim.data.benar = 0; sim.data.salah = 0;
    aturTray(sim);
  }

  /** Letakkan kembali benda yang belum ditempatkan ke baki atas. */
  function aturTray(sim) {
    const sisa = sim.data.item.filter(function (b) { return !b.ditempatkan; });
    const lebar = W - 80;
    const jarak = Math.min(78, lebar / Math.max(1, sisa.length));
    const x0 = W / 2 - (sisa.length - 1) * jarak / 2;
    sisa.forEach(function (b, k) {
      if (b.seret) return;
      b.hx = x0 + k * jarak;
      b.hy = TRAY_Y + 46;
    });
  }

  function kotakKeranjang(k) {
    const w = (W - 80) / 3;
    return { x: 40 + k * w + 7, y: KER_Y, w: w - 14, h: KER_H };
  }

  /* ---------------------------------------------------------- menggambar -- */

  function gambarBenda(c, b, t) {
    const x = b.x + Math.sin(b.goyang * 26) * b.goyang * 11;
    const y = b.y;
    const s = b.ditempatkan ? 15 : 21;
    c.save();

    if (b.bentuk === 'balok' || b.bentuk === 'kubus') {
      D.roundRect(c, x - s, y - s * 0.78, s * 2, s * 1.56, 4,
        b.warna, 'rgba(255,255,255,.3)', 1.4);
      if (b.bentuk === 'kubus') {
        D.line(c, x - s, y - s * 0.78, x - s * 0.6, y - s * 1.1, 'rgba(255,255,255,.25)', 1.2);
      }
    } else if (b.bentuk === 'batu') {
      c.beginPath();
      for (let i = 0; i < 7; i++) {
        const a = i / 7 * Math.PI * 2;
        const r = s * (0.78 + 0.22 * Math.sin(i * 2.7 + b.i));
        const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r * 0.82;
        i ? c.lineTo(px, py) : c.moveTo(px, py);
      }
      c.closePath();
      c.fillStyle = b.warna; c.fill();
      c.strokeStyle = 'rgba(255,255,255,.28)'; c.lineWidth = 1.4; c.stroke();
    } else if (b.bentuk === 'gelas') {
      D.beaker(c, x - s * 0.62, y - s * 0.8, s * 1.24, s * 1.6, 0.68, b.warna, { ticks: false, lw: 1.8 });
    } else if (b.bentuk === 'botol') {
      D.roundRect(c, x - s * 0.5, y - s * 0.5, s, s * 1.3, 4, b.warna, 'rgba(255,255,255,.3)', 1.3);
      D.roundRect(c, x - s * 0.18, y - s * 0.95, s * 0.36, s * 0.48, 2, b.warna, 'rgba(255,255,255,.3)', 1.1);
    } else if (b.bentuk === 'balon') {
      c.beginPath();
      c.ellipse(x, y - s * 0.22, s * 0.72, s * 0.88, 0, 0, Math.PI * 2);
      c.fillStyle = D.alpha(b.warna, 0.72); c.fill();
      c.strokeStyle = b.warna; c.lineWidth = 1.6; c.stroke();
      D.line(c, x, y + s * 0.62, x + Math.sin(t * 2 + b.i) * 4, y + s * 1.2, 'rgba(255,255,255,.4)', 1.2);
    } else { // awan
      for (let i = 0; i < 4; i++) {
        const a = i / 4 * Math.PI * 2;
        D.circle(c, x + Math.cos(a) * s * 0.42, y + Math.sin(a) * s * 0.3 - s * 0.1,
          s * 0.5, D.alpha(b.warna, 0.5));
      }
      D.circle(c, x, y - s * 0.1, s * 0.56, D.alpha(b.warna, 0.62));
    }

    D.text(c, b.nama, x, y + s + 13, {
      size: 11.5, weight: 600, color: b.ditempatkan ? P.dim : P.text, align: 'c', base: 'middle'
    });
    c.restore();
  }

  /** Gambaran susunan partikel di dalam keranjang. */
  function gambarPartikel(c, kotak, wujud, t, warna) {
    const x = kotak.x + 13, y = kotak.y + 46;
    const w = kotak.w - 26, h = 54;
    c.save();
    c.beginPath(); c.rect(x, y, w, h); c.clip();
    D.roundRect(c, x, y, w, h, 5, 'rgba(255,255,255,.05)');

    if (wujud === 'padat') {
      const kol = 8, bar = 3;
      for (let j = 0; j < bar; j++) for (let i = 0; i < kol; i++) {
        const px = x + w * (i + 0.5) / kol + Math.sin(t * 3 + i + j) * 1.1;
        const py = y + h * (j + 0.5) / bar + Math.cos(t * 3.4 + i * 1.3) * 1.1;
        D.circle(c, px, py, 5, warna);
      }
    } else if (wujud === 'cair') {
      for (let i = 0; i < 20; i++) {
        const fx = (i * 0.618) % 1;
        const px = x + 8 + ((fx * w * 0.92) + Math.sin(t * 0.9 + i) * 9) % (w - 16);
        const py = y + h * 0.42 + Math.sin(t * 1.3 + i * 1.7) * 10 + (i % 3) * 7;
        D.circle(c, px, Math.min(py, y + h - 6), 5, warna);
      }
    } else {
      for (let i = 0; i < 11; i++) {
        const px = x + 10 + ((i * 97 + t * 46 * (1 + i % 3)) % (w - 20));
        const py = y + 9 + ((i * 53 + t * 31 * (1 + (i % 2))) % (h - 18));
        D.circle(c, px, py, 4.6, warna);
      }
    }
    c.restore();
    D.roundRect(c, x, y, w, h, 5, null, 'rgba(255,255,255,.14)', 1);
  }

  Sim.create({
    title: 'Wujud Benda di Sekitar Kita',
    subtitle: 'Seret setiap benda ke keranjang yang tepat. Perhatikan susunan partikel di tiap wujud — itulah yang membuat padat, cair, dan gas berbeda.',
    fase: 'A', jenjang: 'SD Kelas 1–2',
    topik: ['Wujud Zat', 'Pengamatan'],
    stage: { w: W, h: H },
    autoplay: true,
    showPlay: false,
    stageNote: 'Seret benda dengan jari atau tetikus',

    controls: [
      {
        title: 'Tampilan',
        items: [
          { type: 'toggle', id: 'partikel', value: true, label: 'Tampilkan partikel',
            hint: 'Lihat bagaimana partikel tersusun di dalam setiap wujud.' },
          { type: 'toggle', id: 'sifat', value: true, label: 'Tampilkan sifat wujud' },
          { type: 'toggle', id: 'bantuan', value: false, label: 'Mode bantuan',
            hint: 'Keranjang yang tepat akan bersinar saat benda diangkat.' }
        ]
      },
      {
        title: 'Permainan',
        items: [
          { type: 'buttons', label: '', items: [
            { label: 'Acak ulang', onClick: function (sim) { siapkan(sim); } },
            { label: 'Isi otomatis', onClick: function (sim) {
              sim.data.item.forEach(function (b) { b.ditempatkan = b.wujud; });
              sim.data.benar = BENDA.length; sim.data.salah = 0;
              aturTray(sim);
            } }
          ] }
        ]
      }
    ],

    readouts: [
      { id: 'benar', label: 'Tepat', tone: 'accent' },
      { id: 'salah', label: 'Keliru' },
      { id: 'sisa', label: 'Sisa benda' }
    ],

    setup: siapkan,
    reset: siapkan,

    onPointerDown: function (sim, x, y) {
      const items = sim.data.item;
      for (let i = items.length - 1; i >= 0; i--) {
        const b = items[i];
        if (Math.hypot(b.x - x, b.y - y) < 26) {
          b.seret = true;
          sim.data.ambil = b;
          if (b.ditempatkan) {
            b.ditempatkan = null;
            aturTray(sim);
          }
          items.splice(i, 1); items.push(b);  // gambar paling atas
          return;
        }
      }
    },

    onPointerMove: function (sim, x, y) {
      const b = sim.data.ambil;
      if (b) { b.hx = x; b.hy = y; }
    },

    onPointerUp: function (sim, x, y) {
      const b = sim.data.ambil;
      if (!b) return;
      b.seret = false;
      sim.data.ambil = null;
      for (let k = 0; k < 3; k++) {
        const kk = kotakKeranjang(k);
        if (x > kk.x && x < kk.x + kk.w && y > kk.y && y < kk.y + kk.h) {
          if (KERANJANG[k].wujud === b.wujud) {
            b.ditempatkan = b.wujud;
            b.muncul = 1;
            sim.data.benar++;
            sim.data.pesan = 'Tepat! ' + b.nama + ' berwujud ' + b.wujud + '.';
          } else {
            b.goyang = 1;
            sim.data.salah++;
            sim.data.pesan = b.nama + ' bukan ' + KERANJANG[k].wujud + '. Coba lagi ya!';
          }
          sim.data.pesanWaktu = 2.6;
          aturTray(sim);
          return;
        }
      }
      aturTray(sim);
    },

    update: function (sim, dt) {
      const terisi = {};
      sim.data.item.forEach(function (b) {
        if (b.ditempatkan) {
          const k = b.ditempatkan;
          terisi[k] = (terisi[k] || 0);
          const idx = KERANJANG.findIndex(function (q) { return q.wujud === k; });
          const kk = kotakKeranjang(idx);
          const kol = 4;
          const n = terisi[k]++;
          b.hx = kk.x + kk.w * ((n % kol) + 0.5) / kol;
          b.hy = kk.y + 128 + Math.floor(n / kol) * 36;
        }
        b.x += (b.hx - b.x) * Math.min(1, dt * 15);
        b.y += (b.hy - b.y) * Math.min(1, dt * 15);
        b.goyang = Math.max(0, b.goyang - dt * 2.2);
        b.muncul = Math.max(0, b.muncul - dt * 1.6);
      });
      if (sim.data.pesanWaktu > 0) sim.data.pesanWaktu -= dt;
    },

    draw: function (c, sim) {
      const t = sim.t;

      // baki atas
      D.roundRect(c, 24, TRAY_Y - 30, W - 48, 100, 12, 'rgba(255,255,255,.035)', 'rgba(255,255,255,.1)', 1);
      D.text(c, 'BENDA YANG BELUM DIKELOMPOKKAN', W / 2, TRAY_Y - 15,
        { size: 10.5, weight: 700, color: P.faint, align: 'c', base: 'middle' });

      // keranjang
      const diangkat = sim.data.ambil;
      KERANJANG.forEach(function (k, i) {
        const kk = kotakKeranjang(i);
        const sorot = diangkat && sim.get('bantuan') && diangkat.wujud === k.wujud;
        D.roundRect(c, kk.x, kk.y, kk.w, kk.h, 12,
          sorot ? D.alpha(k.warna, 0.14) : 'rgba(255,255,255,.04)',
          sorot ? k.warna : 'rgba(255,255,255,.14)', sorot ? 2.4 : 1.4);

        D.roundRect(c, kk.x, kk.y, kk.w, 30, 12, D.alpha(k.warna, 0.2));
        D.text(c, k.label, kk.x + kk.w / 2, kk.y + 16,
          { size: 14, weight: 800, color: k.warna, align: 'c', base: 'middle' });

        if (sim.get('partikel')) gambarPartikel(c, kk, k.wujud, t, k.warna);

        if (sim.get('sifat')) {
          D.text(c, k.sifat, kk.x + kk.w / 2, kk.y + 115,
            { size: 10.5, weight: 500, color: P.dim, align: 'c', base: 'middle' });
        }
      });

      // benda
      sim.data.item.forEach(function (b) { gambarBenda(c, b, t); });

      // pesan
      if (sim.data.pesanWaktu > 0 && sim.data.pesan) {
        const a = Math.min(1, sim.data.pesanWaktu / 0.5);
        const w = D.measure(c, sim.data.pesan, { size: 13.5, weight: 600 }) + 32;
        c.save(); c.globalAlpha = a;
        D.roundRect(c, W / 2 - w / 2, H - 42, w, 30, 15, 'rgba(79,209,192,.17)', P.accent, 1.4);
        D.text(c, sim.data.pesan, W / 2, H - 27,
          { size: 13.5, weight: 600, color: P.accent2, align: 'c', base: 'middle' });
        c.restore();
      }
    },

    readoutsUpdate: function (sim) {
      sim.readout('benar', sim.data.benar);
      sim.readout('salah', sim.data.salah, sim.data.salah > 0 ? 'warn' : null);
      const sisa = sim.data.item.filter(function (b) { return !b.ditempatkan; }).length;
      sim.readout('sisa', sisa);
    },

    notes: `
      <p>Semua benda di sekitar kita bisa dikelompokkan menjadi tiga <strong>wujud</strong>:
      padat, cair, dan gas. Yang membedakan ketiganya bukan bahannya, melainkan
      <strong>bagaimana partikel di dalamnya tersusun dan bergerak</strong>.</p>

      <h3>Padat</h3>
      <p>Partikelnya berdempetan rapat dan tersusun rapi seperti barisan. Partikel
      hanya bisa bergetar di tempat, tidak bisa berpindah. Itulah sebabnya benda padat
      punya <strong>bentuk tetap</strong> — batu tetap berbentuk batu ke mana pun dibawa.</p>

      <h3>Cair</h3>
      <p>Partikelnya masih berdekatan, tetapi sudah bisa bergeser dan menggelinding
      melewati satu sama lain. Karena itu zat cair <strong>mengikuti bentuk wadahnya</strong>,
      tetapi jumlahnya tidak berubah. Satu gelas air dituang ke mangkuk tetap satu gelas air.</p>

      <h3>Gas</h3>
      <p>Partikelnya berjauhan dan bergerak sangat cepat ke segala arah. Gas
      <strong>memenuhi seluruh ruang</strong> yang tersedia — baik bentuk maupun volumenya
      ikut wadah.</p>

      <div class="callout" data-tone="tip">
        <strong>Perhatikan ini</strong>
        Es batu, air, dan uap air adalah zat yang sama, yaitu air. Yang berbeda hanyalah
        wujudnya. Jadi satu zat bisa punya tiga wujud sekaligus, tergantung suhunya.
      </div>
    `,

    explore: [
      'Nyalakan <strong>Tampilkan partikel</strong>. Keranjang mana yang partikelnya paling rapat? Mana yang paling renggang?',
      'Taruh <strong>Es batu</strong> di keranjang padat, lalu <strong>Air</strong> di cair, lalu <strong>Uap air</strong> di gas. Ketiganya zat yang sama — apa yang berbeda?',
      'Coba sengaja salah menaruh satu benda. Baca pesan yang muncul dan perbaiki.',
      'Cari lima benda di sekitarmu sekarang. Tebak wujudnya sebelum memastikan.'
    ],

    quiz: [
      {
        q: 'Air yang dituang dari gelas ke mangkuk berubah bentuknya. Mengapa?',
        options: [
          'Karena jumlah airnya berkurang',
          'Karena partikel zat cair bisa bergeser melewati satu sama lain',
          'Karena air berubah menjadi gas',
          'Karena mangkuk menarik partikel air'
        ],
        answer: 1,
        explain: 'Partikel zat cair masih berdekatan, tetapi tidak terkunci pada tempatnya. Partikel bisa saling bergeser, sehingga bentuknya mengikuti wadah. Volumenya sendiri tidak berubah.'
      },
      {
        q: 'Balon yang ditiup menggembung ke segala arah. Sifat gas apa yang ditunjukkan?',
        options: [
          'Gas memiliki bentuk tetap',
          'Gas memiliki volume tetap',
          'Gas memenuhi seluruh ruang yang tersedia',
          'Gas lebih berat daripada zat padat'
        ],
        answer: 2,
        explain: 'Partikel gas bergerak cepat ke segala arah dan berjauhan satu sama lain, sehingga gas selalu menyebar memenuhi seluruh wadahnya.'
      },
      {
        q: 'Manakah kelompok yang seluruhnya berwujud padat?',
        options: [
          'Batu, kayu, susu',
          'Es batu, buku, kayu',
          'Asap, batu, minyak',
          'Udara, uap air, es batu'
        ],
        answer: 1,
        explain: 'Es batu, buku, dan kayu semuanya mempertahankan bentuknya sendiri. Susu dan minyak berwujud cair, sedangkan asap, udara, dan uap air berwujud gas.'
      }
    ]
  });
})();
