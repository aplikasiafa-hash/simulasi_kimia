/* Reaksi Kimia dan Hukum Kekekalan Massa — Fase D
   Timbang zat sebelum dan sesudah reaksi, di wadah terbuka maupun tertutup.
   Perbedaan hasilnya menjelaskan mengapa Lavoisier memakai wadah tertutup. */

(function () {
  'use strict';

  const D = Sim.Draw, P = Sim.P;

  const REAKSI = [
    {
      id: 'cuka-soda',
      nama: 'Cuka + soda kue',
      kiri: [{ n: 'Larutan cuka', m: 50, w: '#dfe8ee' }, { n: 'Soda kue', m: 8.4, w: '#f4f4ee' }],
      kanan: [{ n: 'Larutan natrium asetat', m: 53.0, w: '#e4ecf0' }, { n: 'Air', m: 1.8, w: '#4a9fd0' }],
      gas: { n: 'Gas CO₂', m: 3.6, w: '#9aa4ae' },
      persamaan: 'CH3COOH + NaHCO3 → CH3COONa + H2O + CO2',
      ciri: 'Muncul buih dan gelembung gas yang banyak.'
    },
    {
      id: 'besi-sulfur',
      nama: 'Besi + belerang',
      kiri: [{ n: 'Serbuk besi', m: 11.2, w: '#8d939a' }, { n: 'Serbuk belerang', m: 6.4, w: '#e8c84a' }],
      kanan: [{ n: 'Besi(II) sulfida', m: 17.6, w: '#4a3a30' }],
      gas: null,
      persamaan: 'Fe + S → FeS',
      ciri: 'Campuran memijar lalu menjadi padatan hitam yang tidak bisa dipisah magnet.'
    },
    {
      id: 'lilin',
      nama: 'Pembakaran lilin',
      kiri: [{ n: 'Lilin', m: 10.0, w: '#f2e8c8' }, { n: 'Gas oksigen', m: 34.3, w: '#e0533d' }],
      kanan: [],
      gas: { n: 'CO₂ + uap air', m: 44.3, w: '#9aa4ae' },
      persamaan: 'C25H52 + O2 → CO2 + H2O',
      ciri: 'Lilin tampak "hilang", padahal berubah menjadi gas.'
    },
    {
      id: 'magnesium',
      nama: 'Pembakaran magnesium',
      kiri: [{ n: 'Pita magnesium', m: 4.86, w: '#c9d6a0' }, { n: 'Gas oksigen', m: 3.2, w: '#e0533d' }],
      kanan: [{ n: 'Magnesium oksida', m: 8.06, w: '#f0f0ea' }],
      gas: null,
      persamaan: 'Mg + O2 → MgO',
      ciri: 'Nyala putih menyilaukan, hasilnya abu putih yang justru LEBIH BERAT.'
    },
    {
      id: 'endapan',
      nama: 'Timbal nitrat + kalium iodida',
      kiri: [{ n: 'Larutan Pb(NO₃)₂', m: 60, w: '#eef0f2' }, { n: 'Larutan KI', m: 40, w: '#f0f0e8' }],
      kanan: [{ n: 'Endapan PbI₂', m: 12.3, w: '#f0d040' }, { n: 'Larutan KNO₃', m: 87.7, w: '#e8ecf0' }],
      gas: null,
      persamaan: 'Pb(NO3)2 + KI → PbI2 + KNO3',
      ciri: 'Terbentuk endapan kuning cerah seketika.'
    }
  ];

  const W = 790, H = 530;

  function reaksiAktif(sim) {
    return REAKSI.find(function (r) { return r.id === sim.get('reaksi'); }) || REAKSI[0];
  }

  function siapkan(sim) {
    sim.data.a = 0;
    sim.data.jalan = false;
  }

  function massaKiri(r) {
    return r.kiri.reduce(function (s, z) { return s + z.m; }, 0);
  }
  function massaKanan(r, tertutup) {
    let s = r.kanan.reduce(function (q, z) { return q + z.m; }, 0);
    if (r.gas && tertutup) s += r.gas.m;
    return s;
  }

  Sim.create({
    title: 'Reaksi Kimia dan Hukum Kekekalan Massa',
    subtitle: 'Timbang zat sebelum dan sesudah bereaksi. Di wadah terbuka massa seolah berkurang — tetapi di wadah tertutup, angkanya selalu tepat sama.',
    fase: 'D', jenjang: 'SMP Kelas 7–9',
    topik: ['Reaksi Kimia', 'Hukum Dasar'],
    stage: { w: W, h: H },

    controls: [
      {
        title: 'Percobaan',
        items: [
          { type: 'select', id: 'reaksi', value: 'cuka-soda', label: 'Pilih reaksi',
            options: REAKSI.map(function (r) { return { value: r.id, label: r.nama }; }) },
          { type: 'segment', id: 'wadah', value: 'tertutup', label: 'Jenis wadah',
            options: [{ value: 'terbuka', label: 'Terbuka' }, { value: 'tertutup', label: 'Tertutup' }],
            hint: 'Pada wadah terbuka, gas hasil reaksi lepas ke udara dan tidak ikut tertimbang.' },
          { type: 'buttons', label: '', items: [
            { label: '▶ Mulai reaksi', primary: true, onClick: function (sim) {
              sim.data.jalan = true; if (sim.data.a >= 1) sim.data.a = 0;
            } },
            { label: '↺ Ulangi', onClick: function (sim) { sim.data.a = 0; sim.data.jalan = false; } }
          ] }
        ]
      },
      {
        title: 'Tampilan',
        items: [
          { type: 'toggle', id: 'partikel', value: true, label: 'Tampilkan hitungan atom' },
          { type: 'toggle', id: 'neraca', value: true, label: 'Tampilkan neraca' }
        ]
      }
    ],

    readouts: [
      { id: 'sebelum', label: 'Massa sebelum', tone: 'accent' },
      { id: 'sesudah', label: 'Massa sesudah' },
      { id: 'selisih', label: 'Selisih' },
      { id: 'simpul', label: 'Kesimpulan' }
    ],

    setup: siapkan,
    reset: siapkan,
    onChange: function (sim, id) {
      if (id === 'reaksi') { sim.data.a = 0; sim.data.jalan = false; }
    },

    update: function (sim, dt) {
      if (sim.data.jalan) {
        sim.data.a += dt * 0.35;
        if (sim.data.a >= 1) { sim.data.a = 1; sim.data.jalan = false; }
      }
    },

    draw: function (c, sim) {
      const r = reaksiAktif(sim);
      const tertutup = sim.get('wadah') === 'tertutup';
      const a = sim.data.a;
      const mKiri = massaKiri(r);
      const mKanan = massaKanan(r, tertutup);
      const tampil = Sim.lerp(mKiri, mKanan, a);

      /* ---------- bejana reaksi ---------- */
      const BX = 170, BY = 120, BW = 160, BH = 150;

      // tutup
      if (tertutup) {
        D.roundRect(c, BX - 14, BY - 24, BW + 28, 18, 5, '#6b7580', 'rgba(255,255,255,.34)', 1.6);
        D.text(c, 'TERTUTUP RAPAT', BX + BW / 2, BY - 38,
          { size: 10.5, weight: 700, color: P.accent, align: 'c', base: 'middle' });
      } else {
        D.text(c, 'TERBUKA', BX + BW / 2, BY - 38,
          { size: 10.5, weight: 700, color: P.amber, align: 'c', base: 'middle' });
      }

      // isi bejana berubah warna saat bereaksi
      const warnaAwal = r.kiri[0].w;
      const warnaAkhir = r.kanan.length ? r.kanan[0].w : '#3a3430';
      D.beaker(c, BX, BY, BW, BH, 0.68, D.alpha(D.mix(warnaAwal, warnaAkhir, a), 0.85));

      // gelembung / endapan / nyala
      if (a > 0.04 && a < 1) {
        if (r.gas) {
          for (let i = 0; i < 12; i++) {
            const by = BY + BH - ((sim.t * 120 + i * 24) % (BH * 0.7)) - 10;
            D.circle(c, BX + 20 + (i * 29) % (BW - 40), by, 3 + (i % 3),
              null, 'rgba(255,255,255,.55)', 1.3);
          }
        }
        if (r.id === 'magnesium') {
          c.globalAlpha = 0.35 + Math.sin(sim.t * 22) * 0.2;
          D.circle(c, BX + BW / 2, BY + BH * 0.6, 48, '#ffffff');
          c.globalAlpha = 1;
        }
      }
      if (r.id === 'endapan' && a > 0.2) {
        for (let i = 0; i < Math.round(a * 26); i++) {
          D.circle(c, BX + 16 + (i * 43) % (BW - 32),
            BY + BH - 12 - (i % 4) * 7, 3.6, D.alpha('#f0d040', 0.95));
        }
      }

      // gas lepas pada wadah terbuka
      if (!tertutup && r.gas && a > 0.05) {
        for (let i = 0; i < 8; i++) {
          const uy = BY - 20 - ((sim.t * 46 + i * 20) % 90);
          c.globalAlpha = 0.35 * (1 - (BY - 20 - uy) / 90);
          D.circle(c, BX + BW / 2 + Math.sin(sim.t * 1.6 + i) * 30, uy, 6 + i * 0.8, '#9aa4ae');
        }
        c.globalAlpha = 1;
        D.arrow(c, BX + BW / 2, BY - 36, BX + BW / 2, BY - 86, P.amber, 2.2, 9);
        D.text(c, r.gas.n + ' lepas ke udara', BX + BW / 2, BY - 100,
          { size: 11.5, weight: 650, color: P.amber, align: 'c', base: 'middle' });
      }

      /* ---------- neraca ---------- */
      if (sim.get('neraca')) {
        const NX = BX - 44, NY = BY + BH + 8;
        D.roundRect(c, NX, NY, BW + 88, 16, 3, '#4a5057', 'rgba(255,255,255,.26)', 1.4);
        D.roundRect(c, NX + 18, NY + 16, BW + 52, 54, 8, '#2a3036', 'rgba(255,255,255,.26)', 1.6);
        D.roundRect(c, NX + 34, NY + 28, BW + 20, 30, 5, '#0e1418', 'rgba(255,255,255,.14)', 1.2);
        D.text(c, Sim.fmt(tampil, 2) + ' g', NX + 34 + (BW + 20) / 2, NY + 43,
          { size: 21, weight: 700, color: P.accent2, align: 'c', base: 'middle', mono: true });
        D.text(c, 'NERACA DIGITAL', NX + 18, NY + 82,
          { size: 10, weight: 700, color: P.faint, base: 'middle' });
      }

      /* ---------- neraca perbandingan ---------- */
      const CX = 400, CW = 356;
      D.roundRect(c, CX, 76, CW, 180, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'PERBANDINGAN MASSA', CX + 16, 96,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });

      // daftar zat kiri
      D.text(c, 'SEBELUM REAKSI (pereaksi)', CX + 16, 120,
        { size: 10.5, weight: 700, color: P.blue, base: 'middle' });
      r.kiri.forEach(function (z, i) {
        const y = 140 + i * 20;
        D.circle(c, CX + 24, y, 5, z.w, 'rgba(255,255,255,.3)', 1);
        D.text(c, z.n, CX + 36, y, { size: 11.5, weight: 500, color: P.dim, base: 'middle' });
        D.text(c, Sim.fmt(z.m, 2) + ' g', CX + 166, y,
          { size: 11.5, weight: 700, color: P.text, align: 'r', base: 'middle', mono: true });
      });
      D.line(c, CX + 16, 140 + r.kiri.length * 20 - 6, CX + 166, 140 + r.kiri.length * 20 - 6,
        'rgba(255,255,255,.2)', 1);
      D.text(c, 'Total  ' + Sim.fmt(mKiri, 2) + ' g', CX + 166, 140 + r.kiri.length * 20 + 8,
        { size: 13, weight: 800, color: P.blue, align: 'r', base: 'middle', mono: true });

      // daftar zat kanan
      D.text(c, 'SESUDAH REAKSI (hasil)', CX + 196, 120,
        { size: 10.5, weight: 700, color: P.amber, base: 'middle' });
      const kananList = r.kanan.concat(r.gas ? [Object.assign({}, r.gas, { lepas: !tertutup })] : []);
      kananList.forEach(function (z, i) {
        const y = 140 + i * 20;
        const lepas = z.lepas;
        c.globalAlpha = lepas ? 0.4 : 1;
        D.circle(c, CX + 204, y, 5, z.w, 'rgba(255,255,255,.3)', 1);
        D.text(c, z.n + (lepas ? ' (lepas)' : ''), CX + 216, y,
          { size: 11, weight: 500, color: P.dim, base: 'middle' });
        D.text(c, (lepas ? '−' : '') + Sim.fmt(z.m, 2) + ' g', CX + CW - 16, y,
          { size: 11.5, weight: 700, color: lepas ? P.amber : P.text, align: 'r', base: 'middle', mono: true });
        c.globalAlpha = 1;
      });
      D.line(c, CX + 196, 140 + kananList.length * 20 - 6, CX + CW - 16, 140 + kananList.length * 20 - 6,
        'rgba(255,255,255,.2)', 1);
      D.text(c, 'Total  ' + Sim.fmt(mKanan, 2) + ' g', CX + CW - 16, 140 + kananList.length * 20 + 8,
        { size: 13, weight: 800, color: P.amber, align: 'r', base: 'middle', mono: true });

      /* ---------- persamaan reaksi ---------- */
      D.roundRect(c, CX, 268, CW, 56, 10, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.1)', 1.1);
      D.text(c, 'PERSAMAAN REAKSI', CX + 16, 286,
        { size: 10, weight: 700, color: P.faint, base: 'middle' });
      D.text(c, Sim.formula(r.persamaan), CX + 16, 308,
        { size: 13.5, weight: 650, color: P.accent2, base: 'middle', mono: true });

      /* ---------- kesimpulan besar ---------- */
      const selisih = mKanan - mKiri;
      const kekal = Math.abs(selisih) < 0.05;
      D.roundRect(c, 40, 346, W - 80, 86, 12,
        kekal ? 'rgba(111,207,127,.1)' : 'rgba(240,169,74,.1)',
        kekal ? P.green : P.amber, 1.6);
      D.text(c, kekal
        ? 'MASSA TETAP — massa sebelum = massa sesudah'
        : 'MASSA TAMPAK BERKURANG ' + Sim.fmt(Math.abs(selisih), 2) + ' g',
        60, 372, { size: 17, weight: 700, color: kekal ? P.green : P.amber, base: 'middle' });
      D.text(c, kekal
        ? 'Tidak ada atom yang hilang atau tercipta. Atom hanya disusun ulang menjadi zat baru.'
        : 'Gas hasil reaksi lepas ke udara dan tidak ikut tertimbang. Massanya tidak hilang — hanya pindah tempat.',
        60, 396, { size: 13, weight: 500, color: P.dim, base: 'middle' });
      D.text(c, r.ciri, 60, 416, { size: 12, weight: 500, color: P.faint, base: 'middle' });

      /* ---------- hitungan atom ---------- */
      if (sim.get('partikel')) {
        D.roundRect(c, 40, 444, W - 80, 62, 10, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.1)', 1.1);
        D.text(c, 'MENGAPA MASSANYA TETAP?', 56, 462,
          { size: 10, weight: 700, color: P.faint, base: 'middle' });
        D.text(c, 'Reaksi kimia hanya memutus dan menyusun kembali ikatan. Jumlah tiap jenis atom ' +
          'sebelum dan sesudah reaksi selalu persis sama.',
          56, 482, { size: 12.5, weight: 500, color: P.dim, base: 'middle' });

        // ilustrasi atom tersusun ulang
        const ix = W - 220;
        for (let i = 0; i < 6; i++) {
          const warna = i % 2 === 0 ? '#e0533d' : '#5b9bf5';
          const x0 = ix + (i % 3) * 22, y0 = 468 + Math.floor(i / 3) * 20;
          const x1 = ix + 112 + (i % 3) * 22, y1 = 468 + Math.floor(i / 3) * 20;
          const px = Sim.lerp(x0, x1, a), py = Sim.lerp(y0, y1, a);
          D.circle(c, px, py, 7, warna, 'rgba(255,255,255,.26)', 1);
        }
        D.text(c, '6 atom', ix + 22, 508,
          { size: 10, weight: 600, color: P.faint, align: 'c', base: 'middle' });
        D.text(c, '6 atom', ix + 134, 508,
          { size: 10, weight: 600, color: P.faint, align: 'c', base: 'middle' });
      }
    },

    readoutsUpdate: function (sim) {
      const r = reaksiAktif(sim);
      const tertutup = sim.get('wadah') === 'tertutup';
      const mK = massaKiri(r), mN = massaKanan(r, tertutup);
      const selisih = mN - mK;
      sim.readout('sebelum', Sim.fmt(mK, 2) + '<span class="unit"> g</span>');
      sim.readout('sesudah', Sim.fmt(mN, 2) + '<span class="unit"> g</span>');
      sim.readout('selisih', (selisih >= 0 ? '+' : '') + Sim.fmt(selisih, 2) + '<span class="unit"> g</span>',
        Math.abs(selisih) < 0.05 ? 'accent' : 'warn');
      sim.readout('simpul', Math.abs(selisih) < 0.05 ? 'Massa kekal' : 'Gas lepas');
    },

    notes: `
      <p>Pada tahun 1789 Antoine Lavoisier melakukan percobaan yang mengubah kimia
      selamanya. Ia menimbang zat <strong>di dalam wadah tertutup</strong> sebelum dan
      sesudah reaksi, dan menemukan angkanya selalu sama persis.</p>

      <span class="formula">Massa zat sebelum reaksi = massa zat sesudah reaksi</span>

      <h3>Mengapa massa bisa tampak berkurang?</h3>
      <p>Sebelum Lavoisier, banyak ilmuwan mengira massa berkurang saat zat dibakar.
      Mereka menimbang di wadah terbuka, sehingga gas hasil reaksi lepas ke udara dan
      tidak ikut tertimbang. Massanya tidak hilang — hanya pindah ke udara.</p>

      <p>Sebaliknya, pembakaran magnesium justru tampak <strong>menambah</strong> massa,
      karena oksigen dari udara ikut terikat menjadi magnesium oksida. Dua pengamatan
      yang tampak bertentangan ini terjelaskan oleh satu hukum yang sama, asalkan
      seluruh zat yang terlibat ikut diperhitungkan.</p>

      <h3>Alasan di balik hukum ini</h3>
      <p>Reaksi kimia tidak menciptakan atau memusnahkan atom. Yang terjadi hanyalah
      <strong>pemutusan dan penyusunan ulang ikatan</strong>. Karena jumlah dan jenis
      atom tetap, massanya pun tetap.</p>

      <p>Inilah alasan persamaan reaksi harus <strong>disetarakan</strong>: jumlah tiap
      jenis atom di ruas kiri harus sama dengan di ruas kanan.</p>

      <div class="callout" data-tone="tip">
        <strong>Rancangan percobaan yang baik</strong>
        Bila suatu reaksi menghasilkan gas, wadah harus tertutup rapat agar hasil
        penimbangan bermakna. Kesalahan ini sederhana, tetapi menyesatkan para ilmuwan
        selama berabad-abad.
      </div>
    `,

    explore: [
      'Jalankan <strong>Cuka + soda kue</strong> di wadah <strong>terbuka</strong>, lalu ulangi di wadah <strong>tertutup</strong>. Bandingkan angkanya.',
      'Coba <strong>Pembakaran magnesium</strong>. Mengapa massanya justru bertambah dari 4,86 g menjadi 8,06 g?',
      'Jalankan <strong>Besi + belerang</strong>. Reaksi ini tidak menghasilkan gas — apakah jenis wadah berpengaruh?',
      'Pada reaksi <strong>Timbal nitrat + kalium iodida</strong> terbentuk endapan. Apakah massa totalnya berubah?'
    ],

    quiz: [
      {
        q: 'Sebanyak 10 g lilin dibakar di udara terbuka. Setelah habis, massanya terukur hampir nol. Apakah hukum kekekalan massa dilanggar?',
        options: [
          'Ya, massanya benar-benar hilang',
          'Tidak, karena lilin berubah menjadi gas yang lepas ke udara',
          'Ya, karena pembakaran memusnahkan materi',
          'Tidak, karena lilin sebenarnya tidak terbakar'
        ],
        answer: 1,
        explain: 'Lilin bereaksi dengan oksigen menjadi karbon dioksida dan uap air. Keduanya berupa gas yang menyebar ke udara, sehingga tidak ikut tertimbang. Bila seluruh gas ditampung, massa totalnya tetap.'
      },
      {
        q: 'Pita magnesium 4,86 g dibakar menghasilkan 8,06 g abu putih. Dari mana tambahan 3,2 g berasal?',
        options: [
          'Dari api yang dipakai membakar',
          'Dari oksigen di udara yang ikut bereaksi',
          'Massa memang bisa bertambah sendiri',
          'Dari alat penimbang yang tidak akurat'
        ],
        answer: 1,
        explain: 'Magnesium mengikat oksigen dari udara membentuk magnesium oksida (MgO). Tambahan massa itu persis sama dengan massa oksigen yang terikat.'
      },
      {
        q: 'Mengapa persamaan reaksi kimia harus disetarakan?',
        options: [
          'Supaya terlihat rapi',
          'Supaya jumlah tiap jenis atom di kedua ruas sama, sesuai hukum kekekalan massa',
          'Supaya reaksinya berjalan lebih cepat',
          'Supaya hasil reaksinya lebih banyak'
        ],
        answer: 1,
        explain: 'Atom tidak dapat diciptakan atau dimusnahkan dalam reaksi kimia. Persamaan yang setara menunjukkan hal ini: setiap atom di ruas kiri harus muncul kembali di ruas kanan.'
      },
      {
        q: 'Dalam wadah tertutup, 23 g natrium direaksikan dengan 35,5 g klorin. Berapa massa garam yang terbentuk?',
        options: ['23 g', '35,5 g', '58,5 g', 'Tidak dapat ditentukan'],
        answer: 2,
        explain: 'Karena wadahnya tertutup, seluruh massa pereaksi menjadi massa hasil reaksi: 23 + 35,5 = 58,5 g natrium klorida.'
      }
    ]
  });
})();
