/* Perubahan Wujud Benda — Fase B
   Panaskan dan dinginkan zat; amati wujud, nama perubahan, gerak partikel,
   dan grafik suhu terhadap kalor yang diberikan (lengkap dengan dataran). */

(function () {
  'use strict';

  const D = Sim.Draw, P = Sim.P;

  const ZAT = {
    air:    { nama: 'Air',    tl: 0,   td: 100, warna: '#4a9fd0', padat: 'Es',    gas: 'Uap air' },
    etanol: { nama: 'Etanol', tl: -114, td: 78, warna: '#c0d8e8', padat: 'Etanol beku', gas: 'Uap etanol' },
    besi:   { nama: 'Besi',   tl: 1538, td: 2862, warna: '#aab4bd', padat: 'Besi padat', gas: 'Uap besi' },
    lilin:  { nama: 'Lilin',  tl: 58,  td: 370, warna: '#f2e8c8', padat: 'Lilin padat', gas: 'Uap lilin' }
  };

  const W = 790, H = 510;

  function wujudPada(z, T) {
    if (T < z.tl) return 'padat';
    if (T < z.td) return 'cair';
    return 'gas';
  }

  function siapkan(sim) {
    const z = ZAT[sim.get('zat')];
    sim.data.T = 25;
    sim.data.wujudLalu = wujudPada(z, 25);
    sim.data.pesan = '';
    sim.data.pesanWaktu = 0;
    sim.data.jejak = new Plot.Buffer(900);
    sim.data.kalor = 0;
    buatPartikel(sim);
  }

  function buatPartikel(sim) {
    const z = ZAT[sim.get('zat')];
    const sys = new SistemPartikel({ x: 452, y: 104, w: 300, h: 176, tumbukan: false });
    sys.susunKisi(40, 7.5, z.warna, { kolom: 10 });
    sim.data.sys = sys;
  }

  /** Suhu kesetimbangan sederhana: pemanas menaikkan, lingkungan menarik ke 25 °C. */
  function targetSuhu(sim) {
    const api = sim.get('api');       // -1 (pendingin) .. +1 (pemanas penuh)
    const z = ZAT[sim.get('zat')];
    const atas = z.td + (z.td - z.tl) * 0.35 + 60;
    const bawah = z.tl - (z.td - z.tl) * 0.3 - 40;
    if (api > 0) return 25 + (atas - 25) * api;
    if (api < 0) return 25 + (25 - bawah) * api;
    return 25;
  }

  const NAMA_UBAH = {
    'padat>cair': ['Melebur', 'Zat padat menyerap kalor dan berubah menjadi cair.'],
    'cair>padat': ['Membeku', 'Zat cair melepas kalor dan berubah menjadi padat.'],
    'cair>gas':   ['Menguap', 'Zat cair menyerap kalor dan berubah menjadi gas.'],
    'gas>cair':   ['Mengembun', 'Gas melepas kalor dan berubah menjadi cair.'],
    'padat>gas':  ['Menyublim', 'Zat padat langsung menjadi gas tanpa mencair.'],
    'gas>padat':  ['Mengkristal', 'Gas langsung menjadi padat tanpa mencair.']
  };

  Sim.create({
    title: 'Perubahan Wujud Benda',
    subtitle: 'Geser pemanas atau pendingin, lalu amati zat berpindah wujud. Perhatikan grafik suhu — ada bagian mendatar yang menarik di titik lebur dan titik didih.',
    fase: 'B', jenjang: 'SD Kelas 3–4',
    topik: ['Wujud Zat', 'Kalor'],
    stage: { w: W, h: H },
    stageNote: 'Grafik merekam suhu terhadap waktu',

    controls: [
      {
        title: 'Zat yang dipanaskan',
        items: [
          { type: 'select', id: 'zat', value: 'air', label: 'Pilih zat',
            options: Object.keys(ZAT).map(function (k) { return { value: k, label: ZAT[k].nama }; }),
            hint: 'Tiap zat punya titik lebur dan titik didih sendiri.' }
        ]
      },
      {
        title: 'Pemanas dan pendingin',
        items: [
          { type: 'slider', id: 'api', value: 0, min: -1, max: 1, step: 0.05,
            label: 'Nyala api / pendingin', dec: 2,
            minLabel: '❄ dingin', maxLabel: 'panas 🔥',
            format: function (v) {
              return v > 0.02 ? 'panas ' + Math.round(v * 100) + '%'
                : v < -0.02 ? 'dingin ' + Math.round(-v * 100) + '%' : 'mati';
            },
            hint: 'Ke kanan memanaskan, ke kiri mendinginkan, tengah berarti dibiarkan.' },
          { type: 'slider', id: 'laju', value: 1, min: 0.25, max: 4, step: 0.25,
            label: 'Kecepatan waktu', unit: '×', dec: 2 }
        ]
      },
      {
        title: 'Tampilan',
        items: [
          { type: 'toggle', id: 'partikel', value: true, label: 'Tampilkan partikel' },
          { type: 'toggle', id: 'grafik', value: true, label: 'Tampilkan grafik suhu' },
          { type: 'toggle', id: 'titik', value: true, label: 'Tandai titik lebur & didih' }
        ]
      }
    ],

    readouts: [
      { id: 'suhu', label: 'Suhu', tone: 'accent' },
      { id: 'wujud', label: 'Wujud' },
      { id: 'tl', label: 'Titik lebur' },
      { id: 'td', label: 'Titik didih' }
    ],

    setup: siapkan,
    reset: siapkan,

    onChange: function (sim, id) {
      if (id === 'zat') {
        const z = ZAT[sim.get('zat')];
        sim.data.T = 25;
        sim.data.wujudLalu = wujudPada(z, 25);
        sim.data.jejak.clear();
        sim.data.kalor = 0;
        buatPartikel(sim);
      }
    },

    update: function (sim, dt) {
      dt *= sim.get('laju');
      const z = ZAT[sim.get('zat')];
      const tujuan = targetSuhu(sim);
      const rentang = Math.max(1, z.td - z.tl);

      // laju perubahan suhu, diperlambat kuat di titik lebur dan titik didih
      // untuk memunculkan "dataran" kalor laten pada grafik.
      let laju = (tujuan - sim.data.T) * 0.22;
      const dekatLebur = Math.abs(sim.data.T - z.tl) < rentang * 0.02;
      const dekatDidih = Math.abs(sim.data.T - z.td) < rentang * 0.02;
      if (dekatLebur || dekatDidih) laju *= 0.08;

      sim.data.T += laju * dt * 3;
      sim.data.kalor += Math.abs(sim.get('api')) * dt * 3;

      const w = wujudPada(z, sim.data.T);
      if (w !== sim.data.wujudLalu) {
        const kunci = sim.data.wujudLalu + '>' + w;
        const info = NAMA_UBAH[kunci];
        if (info) {
          sim.data.pesan = info[0] + ' — ' + info[1];
          sim.data.pesanWaktu = 3.6;
        }
        sim.data.wujudLalu = w;
      }

      // partikel mengikuti wujud dan suhu
      const sys = sim.data.sys;
      const panas = Sim.clamp((sim.data.T - z.tl) / rentang, 0, 1.6);
      sys.setWujud(w, w === 'gas' ? 0.6 + panas * 0.5 : w === 'cair' ? 0.3 + panas * 0.5 : panas * 0.8);
      if (w === 'cair') sys.levelCair = 0.62;
      sys.partikel.forEach(function (p) { p.warna = z.warna; });
      sys.langkah(dt);

      sim.data.jejak.push(sim.t, sim.data.T);
      if (sim.data.pesanWaktu > 0) sim.data.pesanWaktu -= dt;
    },

    draw: function (c, sim) {
      const z = ZAT[sim.get('zat')];
      const T = sim.data.T;
      const w = wujudPada(z, T);
      const api = sim.get('api');

      /* ---------- kiri: wadah + pemanas ---------- */
      const bx = 72, by = 104, bw = 150, bh = 172;
      const isi = w === 'gas' ? 0.96 : w === 'cair' ? 0.6 : 0.5;
      const warnaIsi = w === 'gas' ? D.alpha(z.warna, 0.2)
        : w === 'padat' ? D.lighten(z.warna, 0.22) : z.warna;
      D.beaker(c, bx, by, bw, bh, isi, warnaIsi);

      if (w === 'padat') {
        // bongkahan padat
        for (let i = 0; i < 5; i++) {
          D.roundRect(c, bx + 14 + (i % 3) * 42, by + bh - 70 - Math.floor(i / 3) * 34,
            34, 28, 4, D.lighten(z.warna, 0.3), 'rgba(255,255,255,.35)', 1.2);
        }
      }
      if (w === 'gas') {
        for (let i = 0; i < 11; i++) {
          const px = bx + 14 + ((i * 61 + sim.t * 30) % (bw - 28));
          const py = by + bh - 16 - ((i * 43 + sim.t * 52) % (bh - 24));
          D.circle(c, px, py, 5 + (i % 3), D.alpha(z.warna, 0.35));
        }
      }
      if (w === 'cair' && T > z.td - (z.td - z.tl) * 0.1) {
        // gelembung menjelang mendidih
        for (let i = 0; i < 7; i++) {
          const py = by + bh - ((i * 37 + sim.t * 95) % bh);
          D.circle(c, bx + 22 + (i * 23) % (bw - 44), py, 3.4,
            null, 'rgba(255,255,255,.5)', 1.2);
        }
      }

      // pemanas / pendingin
      const ax = bx + bw / 2, ay = by + bh + 26;
      if (api > 0.02) {
        D.flame(c, ax, ay, api, sim.t);
        D.roundRect(c, ax - 16, ay + 2, 32, 22, 4, '#3b434b', 'rgba(255,255,255,.2)', 1.2);
      } else if (api < -0.02) {
        D.roundRect(c, bx + 4, ay - 2, bw - 8, 22, 5,
          D.alpha('#4a90d9', 0.3 + (-api) * 0.4), '#4a90d9', 1.4);
        D.text(c, '❄ pendingin', ax, ay + 9,
          { size: 11, weight: 700, color: '#9fd4ee', align: 'c', base: 'middle' });
        for (let i = 0; i < 5; i++) {
          D.text(c, '❄', bx + 16 + i * 30, ay - 14 - Math.sin(sim.t * 2 + i) * 5,
            { size: 11, color: D.alpha('#9fd4ee', 0.6), align: 'c', base: 'middle' });
        }
      } else {
        D.roundRect(c, ax - 16, ay + 2, 32, 22, 4, '#3b434b', 'rgba(255,255,255,.14)', 1.2);
      }

      // termometer
      const tx = bx + bw + 34, ty = by - 6, th = bh + 22;
      D.roundRect(c, tx, ty, 16, th, 8, 'rgba(255,255,255,.07)', 'rgba(255,255,255,.26)', 1.4);
      const skalaLo = Math.min(z.tl - 40, -20), skalaHi = Math.max(z.td + 60, 120);
      const frac = Sim.clamp((T - skalaLo) / (skalaHi - skalaLo), 0, 1);
      const warnaT = D.ramp(['#4a90d9', '#54b64c', '#f0a94a', '#ef6a52'], frac);
      D.roundRect(c, tx + 3, ty + th - 6 - (th - 12) * frac, 10, (th - 12) * frac + 3, 5, warnaT);
      D.circle(c, tx + 8, ty + th + 6, 10, warnaT, 'rgba(255,255,255,.26)', 1.4);
      if (sim.get('titik')) {
        [[z.tl, 'lebur', '#8fd0ff'], [z.td, 'didih', '#f0a94a']].forEach(function (m) {
          const f = Sim.clamp((m[0] - skalaLo) / (skalaHi - skalaLo), 0, 1);
          const y = ty + th - 6 - (th - 12) * f;
          D.line(c, tx - 6, y, tx + 22, y, m[2], 1.4, [3, 3]);
          D.text(c, m[1] + ' ' + Math.round(m[0]) + '°', tx + 26, y,
            { size: 10, weight: 600, color: m[2], base: 'middle' });
        });
      }
      D.text(c, Sim.fmt(T, 1) + ' °C', bx + bw / 2, by - 22,
        { size: 17, weight: 700, color: warnaT, align: 'c', base: 'middle' });
      D.text(c, z.nama + ' — ' +
        (w === 'padat' ? z.padat : w === 'cair' ? z.nama + ' cair' : z.gas),
        bx + bw / 2, by - 42,
        { size: 12, weight: 600, color: P.dim, align: 'c', base: 'middle' });

      /* ---------- kanan atas: partikel ---------- */
      if (sim.get('partikel')) {
        const s = sim.data.sys;
        D.roundRect(c, s.x - 8, s.y - 26, s.w + 16, s.h + 34, 10,
          'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.2);
        D.text(c, 'SUSUNAN PARTIKEL · ' + w.toUpperCase(), s.x, s.y - 12,
          { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
        s.gambar(c, { label: false });
        const ket = w === 'padat' ? 'bergetar di tempat, tersusun rapi'
          : w === 'cair' ? 'berdekatan tetapi bisa bergeser'
          : 'berjauhan dan bergerak sangat cepat';
        D.text(c, ket, s.x + s.w / 2, s.y + s.h + 14,
          { size: 11, weight: 500, color: P.dim, align: 'c', base: 'middle' });
      }

      /* ---------- bawah: grafik suhu ---------- */
      if (sim.get('grafik')) {
        const g = { x: 452, y: 330, w: 300, h: 128 };
        const data = sim.data.jejak.data;
        const tMax = Math.max(8, sim.t);
        const lo = Math.min(z.tl - 25, -15), hi = Math.max(z.td + 35, 115);
        const map = Plot.axes(c, {
          x: g.x, y: g.y, w: g.w, h: g.h,
          xmin: Math.max(0, tMax - 30), xmax: tMax,
          ymin: lo, ymax: hi,
          xlabel: 'waktu (detik)', ylabel: 'suhu (°C)',
          judul: 'Suhu terhadap waktu', yticks: 4, xticks: 5
        });
        if (sim.get('titik')) {
          Plot.acuan(c, map, { y: z.tl, color: '#8fd0ff', label: 'titik lebur' });
          Plot.acuan(c, map, { y: z.td, color: '#f0a94a', label: 'titik didih' });
        }
        Plot.line(c, map, data, { color: P.accent, lw: 2.4 });
        if (data.length) {
          const last = data[data.length - 1];
          if (last[0] >= map.xmin) Plot.titik(c, map, last[0], last[1], { color: P.accent2, r: 4, halo: true });
        }
      }

      /* ---------- pesan perubahan wujud ---------- */
      if (sim.data.pesanWaktu > 0) {
        const a = Math.min(1, sim.data.pesanWaktu / 0.6);
        c.save(); c.globalAlpha = a;
        const tw = D.measure(c, sim.data.pesan, { size: 13, weight: 600 }) + 34;
        D.roundRect(c, 40, H - 44, Math.min(tw, W - 80), 32, 16,
          'rgba(240,169,74,.16)', P.amber, 1.4);
        D.text(c, sim.data.pesan, 58, H - 28,
          { size: 13, weight: 600, color: P.amber, base: 'middle' });
        c.restore();
      }
    },

    readoutsUpdate: function (sim) {
      const z = ZAT[sim.get('zat')];
      const w = wujudPada(z, sim.data.T);
      sim.readout('suhu', Sim.fmt(sim.data.T, 1) + '<span class="unit">°C</span>');
      sim.readout('wujud', w.charAt(0).toUpperCase() + w.slice(1),
        w === 'gas' ? 'warn' : w === 'padat' ? null : 'accent');
      sim.readout('tl', Sim.fmt(z.tl, 0) + '<span class="unit">°C</span>');
      sim.readout('td', Sim.fmt(z.td, 0) + '<span class="unit">°C</span>');
    },

    notes: `
      <p>Zat bisa berpindah dari satu wujud ke wujud lain bila diberi atau diambil
      <strong>kalor</strong> (panas). Zatnya sendiri tidak berubah — air tetap air,
      baik sebagai es, air cair, maupun uap. Yang berubah hanyalah jarak dan gerak
      partikelnya.</p>

      <h3>Enam nama perubahan wujud</h3>
      <table>
        <thead><tr><th>Perubahan</th><th>Nama</th><th>Kalor</th></tr></thead>
        <tbody>
          <tr><td>Padat → cair</td><td><strong>Melebur</strong></td><td>menyerap</td></tr>
          <tr><td>Cair → padat</td><td><strong>Membeku</strong></td><td>melepas</td></tr>
          <tr><td>Cair → gas</td><td><strong>Menguap</strong></td><td>menyerap</td></tr>
          <tr><td>Gas → cair</td><td><strong>Mengembun</strong></td><td>melepas</td></tr>
          <tr><td>Padat → gas</td><td><strong>Menyublim</strong></td><td>menyerap</td></tr>
          <tr><td>Gas → padat</td><td><strong>Mengkristal</strong></td><td>melepas</td></tr>
        </tbody>
      </table>

      <h3>Mengapa grafiknya mendatar?</h3>
      <p>Perhatikan: saat zat sedang melebur atau mendidih, suhunya <strong>berhenti
      naik</strong> walaupun api terus menyala. Kalor yang masuk tidak dipakai untuk
      menaikkan suhu, melainkan untuk <strong>melepaskan partikel dari ikatannya</strong>.
      Kalor ini disebut kalor laten. Begitu seluruh zat berubah wujud, suhu baru naik lagi.</p>

      <div class="callout" data-tone="tip">
        <strong>Titik lebur = titik beku</strong>
        Air melebur pada 0 °C dan membeku juga pada 0 °C. Suhunya sama; yang
        membedakan hanyalah arah perpindahan kalornya.
      </div>
    `,

    explore: [
      'Mulai dari air pada 25 °C. Dorong api ke kanan penuh dan amati kapan grafik berhenti naik.',
      'Setelah air mendidih, geser ke pendingin penuh. Perubahan wujud apa yang muncul berturut-turut?',
      'Ganti zat ke <strong>Besi</strong>. Mengapa besi berwujud padat di suhu ruang, sedangkan air cair?',
      'Bandingkan <strong>Etanol</strong> dan <strong>Air</strong>: zat mana yang lebih mudah menguap? Hubungkan dengan titik didihnya.'
    ],

    quiz: [
      {
        q: 'Air dipanaskan terus di atas kompor. Setelah mencapai 100 °C, suhunya tidak naik lagi walaupun api tetap menyala. Mengapa?',
        options: [
          'Karena kompornya rusak',
          'Karena kalor dipakai untuk mengubah air menjadi uap, bukan menaikkan suhu',
          'Karena air sudah tidak bisa menyerap kalor',
          'Karena suhu maksimum air adalah 100 °C selamanya'
        ],
        answer: 1,
        explain: 'Selama mendidih, seluruh kalor yang masuk dipakai untuk melepaskan partikel air dari ikatannya menjadi uap. Suhu baru naik lagi setelah semua air berubah menjadi uap.'
      },
      {
        q: 'Embun di rumput pada pagi hari terbentuk melalui proses…',
        options: ['Menguap', 'Mengembun', 'Menyublim', 'Melebur'],
        answer: 1,
        explain: 'Uap air di udara melepas kalor saat udara malam mendingin, lalu berubah menjadi tetesan air cair. Proses gas menjadi cair disebut mengembun.'
      },
      {
        q: 'Kapur barus yang diletakkan di lemari lama-lama habis tanpa pernah menjadi cair. Peristiwa ini disebut…',
        options: ['Melebur', 'Mengkristal', 'Menyublim', 'Membeku'],
        answer: 2,
        explain: 'Perubahan langsung dari wujud padat menjadi gas tanpa melewati wujud cair disebut menyublim.'
      },
      {
        q: 'Es pada 0 °C dan air pada 0 °C sama-sama bersuhu nol. Apa yang membedakan keduanya?',
        options: [
          'Zatnya berbeda',
          'Jumlah kalor yang dikandungnya berbeda',
          'Es lebih dingin walaupun angkanya sama',
          'Tidak ada bedanya sama sekali'
        ],
        answer: 1,
        explain: 'Suhunya sama, tetapi air cair sudah menyerap kalor laten peleburan. Itulah sebabnya es terasa jauh lebih mendinginkan daripada air dingin biasa.'
      }
    ]
  });
})();
