/* Teori Kinetik: Gerak Partikel dan Suhu — Fase D
   Kotak gas dengan dinding yang bisa digeser. Ubah suhu, jumlah partikel, dan
   volume; amati tekanan, laju partikel, dan difusi dua jenis gas. */

(function () {
  'use strict';

  const D = Sim.Draw, P = Sim.P;

  const W = 790, H = 520;
  const KX = 46, KY = 92, KH = 250, KW_MAKS = 420;

  function lebarKotak(sim) { return KW_MAKS * sim.get('volume'); }

  function buat(sim) {
    const sys = new SistemPartikel({
      x: KX, y: KY, w: lebarKotak(sim), h: KH, tumbukan: true
    });
    const n = Math.round(sim.get('jumlah'));
    const laju = 26 + sim.get('suhu') * 0.72;
    const dua = sim.get('dua');
    for (let i = 0; i < n; i++) {
      const a = Sim.rnd(0, Math.PI * 2);
      const biru = dua ? i % 2 === 0 : true;
      const v = laju * (biru ? 1 : 0.76) * Sim.rnd(0.7, 1.3);
      const batasKiri = dua ? (biru ? KX + 6 : KX + sys.w / 2 + 6) : KX + 6;
      const batasKanan = dua ? (biru ? KX + sys.w / 2 - 6 : KX + sys.w - 6) : KX + sys.w - 6;
      sys.tambah(new Partikel(
        Sim.rnd(batasKiri, batasKanan), Sim.rnd(KY + 8, KY + KH - 8),
        biru ? 6 : 8, biru ? '#5b9bf5' : '#f0a94a',
        { vx: Math.cos(a) * v, vy: Math.sin(a) * v, jenis: biru ? 'A' : 'B', massa: biru ? 1 : 1.8 }
      ));
    }
    sim.data.sys = sys;
    sim.data.sekat = dua;
    sim.data.jejakP = new Plot.Buffer(500);
    sim.data.jejakKiri = new Plot.Buffer(500);
  }

  function siapkan(sim) {
    buat(sim);
    sim.data.tekanan = 0;
  }

  Sim.create({
    title: 'Teori Kinetik: Gerak Partikel dan Suhu',
    subtitle: 'Gas bukan ruang kosong. Di dalamnya partikel bergerak acak dan menumbuk dinding tanpa henti — tumbukan itulah yang kita rasakan sebagai tekanan.',
    fase: 'D', jenjang: 'SMP Kelas 7–9',
    topik: ['Teori Kinetik', 'Wujud Zat', 'Gas'],
    stage: { w: W, h: H },

    controls: [
      {
        title: 'Keadaan gas',
        items: [
          { type: 'slider', id: 'suhu', value: 120, min: 10, max: 400, step: 5,
            label: 'Suhu', unit: 'K', dec: 0,
            hint: 'Suhu adalah ukuran energi kinetik rata-rata partikel.' },
          { type: 'slider', id: 'jumlah', value: 60, min: 10, max: 160, step: 2,
            label: 'Jumlah partikel', dec: 0 },
          { type: 'slider', id: 'volume', value: 1, min: 0.4, max: 1, step: 0.02,
            label: 'Volume (lebar wadah)', dec: 2,
            minLabel: 'sempit', maxLabel: 'lebar',
            format: function (v) { return Math.round(v * 100) + '%'; } }
        ]
      },
      {
        title: 'Percobaan difusi',
        items: [
          { type: 'toggle', id: 'dua', value: false, label: 'Dua jenis gas',
            hint: 'Gas biru ringan dan gas jingga berat dipisahkan sekat.' },
          { type: 'buttons', label: '', items: [
            { label: 'Buka sekat', primary: true, onClick: function (sim) { sim.data.sekat = false; } },
            { label: 'Susun ulang', onClick: function (sim) { buat(sim); } }
          ] }
        ]
      },
      {
        title: 'Tampilan',
        items: [
          { type: 'toggle', id: 'jejak', value: false, label: 'Jejak gerak partikel' },
          { type: 'toggle', id: 'grafik', value: true, label: 'Grafik tekanan' }
        ]
      }
    ],

    readouts: [
      { id: 'tek', label: 'Tekanan', tone: 'accent' },
      { id: 'laju', label: 'Laju rata-rata' },
      { id: 'ek', label: 'Energi kinetik' },
      { id: 'kiri', label: 'Partikel di kiri' }
    ],

    setup: siapkan,
    reset: siapkan,

    onChange: function (sim, id) {
      const sys = sim.data.sys;
      if (!sys) return;
      if (id === 'volume') {
        sys.w = lebarKotak(sim);
        sys.partikel.forEach(function (p) {
          if (p.x > sys.x + sys.w - p.r) p.x = sys.x + sys.w - p.r;
        });
      } else if (id === 'suhu') {
        const target = 26 + sim.get('suhu') * 0.72;
        const sekarang = sys.lajuRata();
        if (sekarang > 1) sys.skalaLaju(Sim.clamp(target / sekarang, 0.5, 2));
      } else if (id === 'jumlah' || id === 'dua') {
        buat(sim);
      }
    },

    update: function (sim, dt) {
      const sys = sim.data.sys;

      // sekat pemisah di tengah
      if (sim.data.sekat) {
        const tengah = sys.x + sys.w / 2;
        sys.partikel.forEach(function (p) {
          if (p.jenis === 'A' && p.x + p.r > tengah) { p.x = tengah - p.r; p.vx = -Math.abs(p.vx); }
          if (p.jenis === 'B' && p.x - p.r < tengah) { p.x = tengah + p.r; p.vx = Math.abs(p.vx); }
        });
      }

      sys.langkah(dt);

      // jaga laju tetap sesuai suhu (tumbukan mengacak, bukan mengubah total)
      const target = 26 + sim.get('suhu') * 0.72;
      const sekarang = sys.lajuRata();
      if (sekarang > 1) sys.skalaLaju(Sim.lerp(1, target / sekarang, Math.min(1, dt * 1.6)));

      sim.data.tekanan = sys.tekanan;
      sim.data.jejakP.push(sim.t, sys.tekanan);
      if (sim.get('dua')) sim.data.jejakKiri.push(sim.t, sys.hitungKiri('B'));
    },

    draw: function (c, sim) {
      const sys = sim.data.sys;
      const dua = sim.get('dua');

      /* ---------- kotak gas ---------- */
      D.text(c, 'WADAH GAS', KX, 70, { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
      D.roundRect(c, sys.x - 3, sys.y - 3, sys.w + 6, sys.h + 6, 4,
        'rgba(255,255,255,.03)', 'rgba(255,255,255,.34)', 2.4);

      // dinding geser
      const dx = sys.x + sys.w;
      D.roundRect(c, dx + 3, sys.y - 3, 14, sys.h + 6, 3, '#6b7580', 'rgba(255,255,255,.3)', 1.4);
      for (let i = 0; i < 5; i++) {
        D.line(c, dx + 6, sys.y + 20 + i * 48, dx + 14, sys.y + 20 + i * 48, 'rgba(255,255,255,.26)', 1.4);
      }
      D.text(c, 'dinding\ngeser', dx + 10, sys.y + sys.h + 22,
        { size: 10, weight: 600, color: P.faint, align: 'c', base: 'middle' });

      // sekat
      if (dua && sim.data.sekat) {
        const t = sys.x + sys.w / 2;
        D.roundRect(c, t - 3, sys.y, 6, sys.h, 2, '#9aa4ae', 'rgba(255,255,255,.4)', 1.2);
        D.text(c, 'sekat', t, sys.y - 12,
          { size: 10.5, weight: 700, color: P.dim, align: 'c', base: 'middle' });
      }

      // partikel
      sys.gambar(c, { label: false, jejak: sim.get('jejak') });

      // kilat tumbukan dinding
      const tekananRel = Sim.clamp(sim.data.tekanan / 40, 0, 1);
      c.globalAlpha = 0.1 + tekananRel * 0.3;
      D.roundRect(c, sys.x - 3, sys.y - 3, sys.w + 6, sys.h + 6, 4, null, P.accent, 2.4);
      c.globalAlpha = 1;

      /* ---------- manometer ---------- */
      const MX = 530, MY = 92;
      D.roundRect(c, MX, MY, 226, 112, 10, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'PENGUKUR TEKANAN', MX + 16, MY + 18,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });

      const bar = Sim.clamp(sim.data.tekanan / 55, 0, 1);
      D.roundRect(c, MX + 16, MY + 38, 194, 20, 10, 'rgba(255,255,255,.07)');
      D.roundRect(c, MX + 16, MY + 38, 194 * bar, 20, 10,
        D.ramp(['#4fd1c0', '#f0a94a', '#ef6a52'], bar));
      D.text(c, Sim.fmt(sim.data.tekanan, 1) + ' satuan', MX + 16, MY + 76,
        { size: 17, weight: 700, color: P.text, base: 'middle' });
      D.text(c, 'tekanan = jumlah tumbukan partikel pada dinding tiap detik',
        MX + 16, MY + 96, { size: 10.5, weight: 500, color: P.faint, base: 'middle' });

      /* ---------- hubungan P–V–T ---------- */
      const HX = 530, HY = 220;
      D.roundRect(c, HX, HY, 226, 122, 10, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'HUBUNGAN YANG BERLAKU', HX + 16, HY + 18,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
      const baris = [
        ['Suhu naik', 'partikel lebih cepat → tekanan naik'],
        ['Volume mengecil', 'dinding lebih sering ditumbuk → tekanan naik'],
        ['Partikel bertambah', 'lebih banyak penumbuk → tekanan naik']
      ];
      baris.forEach(function (b, i) {
        const y = HY + 42 + i * 28;
        D.text(c, b[0], HX + 16, y, { size: 11.5, weight: 700, color: P.accent2, base: 'middle' });
        D.text(c, b[1], HX + 16, y + 13, { size: 10.5, weight: 500, color: P.dim, base: 'middle' });
      });

      /* ---------- grafik ---------- */
      if (sim.get('grafik')) {
        const g = { x: 92, y: 392, w: 390, h: 96 };
        const tMax = Math.max(10, sim.t);
        const map = Plot.axes(c, {
          x: g.x, y: g.y, w: g.w, h: g.h,
          xmin: Math.max(0, tMax - 24), xmax: tMax,
          ymin: 0, ymax: Math.max(30, sim.data.tekanan * 1.6),
          xlabel: 'waktu (detik)', ylabel: 'tekanan',
          judul: 'Tekanan terhadap waktu', yticks: 3, xticks: 5
        });
        Plot.line(c, map, sim.data.jejakP.data, { color: P.accent, lw: 2, isi: true });
      }

      if (dua) {
        const g2 = { x: 560, y: 392, w: 180, h: 96 };
        const tMax = Math.max(10, sim.t);
        const map2 = Plot.axes(c, {
          x: g2.x, y: g2.y, w: g2.w, h: g2.h,
          xmin: Math.max(0, tMax - 24), xmax: tMax,
          ymin: 0, ymax: Math.round(sim.get('jumlah') / 2) + 2,
          xlabel: 'waktu', ylabel: 'gas jingga di kiri',
          judul: 'Difusi', yticks: 3, xticks: 3
        });
        Plot.line(c, map2, sim.data.jejakKiri.data, { color: P.amber, lw: 2 });
        Plot.acuan(c, map2, { y: sim.get('jumlah') / 4, color: 'rgba(255,255,255,.3)', label: 'merata' });
      }
    },

    readoutsUpdate: function (sim) {
      const sys = sim.data.sys;
      sim.readout('tek', Sim.fmt(sim.data.tekanan, 1));
      sim.readout('laju', Sim.fmt(sys.lajuRata(), 0) + '<span class="unit"> px/s</span>');
      sim.readout('ek', Sim.fmt(sys.energiKinetik() / Math.max(1, sys.partikel.length), 0) +
        '<span class="unit"> /partikel</span>');
      sim.readout('kiri', sys.hitungKiri() + ' / ' + sys.partikel.length);
    },

    notes: `
      <p>Teori kinetik menjelaskan sifat zat lewat satu gagasan sederhana: materi
      tersusun dari <strong>partikel yang selalu bergerak</strong>. Semakin tinggi
      suhunya, semakin cepat geraknya.</p>

      <h3>Suhu itu apa sebenarnya?</h3>
      <p>Suhu adalah ukuran <strong>energi kinetik rata-rata</strong> partikel.
      Bukan "jumlah panas", melainkan seberapa kencang partikel bergerak rata-rata.
      Saat suhu dinaikkan, partikel menumbuk dinding lebih sering dan lebih keras.</p>

      <h3>Tekanan itu apa?</h3>
      <p>Tekanan gas muncul dari <strong>tumbukan partikel pada dinding wadah</strong>.
      Satu tumbukan terlalu kecil untuk dirasakan, tetapi miliaran tumbukan setiap detik
      menghasilkan dorongan yang dapat diukur. Karena itu tekanan naik bila:</p>
      <ul>
        <li>suhu naik — partikel bergerak lebih cepat,</li>
        <li>volume mengecil — dinding lebih dekat sehingga lebih sering ditumbuk,</li>
        <li>jumlah partikel bertambah — lebih banyak penumbuk.</li>
      </ul>

      <h3>Difusi</h3>
      <p>Bila sekat dibuka, kedua gas bercampur sendiri tanpa diaduk. Peristiwa ini
      disebut <strong>difusi</strong>: partikel menyebar dari daerah rapat ke daerah
      renggang karena geraknya acak. Perhatikan bahwa gas <strong>ringan menyebar lebih
      cepat</strong> daripada gas berat pada suhu yang sama — inilah sebabnya bau parfum
      tercium lebih dulu daripada bau benda berat.</p>

      <div class="callout" data-tone="tip">
        <strong>Hubungkan dengan kehidupan</strong>
        Ban sepeda terasa lebih keras setelah dipakai jauh karena gesekan menaikkan suhu
        udara di dalamnya. Volume ban tetap, tetapi partikelnya bergerak lebih cepat,
        sehingga tekanan naik.
      </div>
    `,

    explore: [
      'Tahan jumlah partikel dan volume, lalu naikkan suhu dari 10 K ke 400 K. Bagaimana grafik tekanannya?',
      'Kembalikan suhu, lalu geser volume dari 100% ke 40%. Apa yang terjadi pada tekanan?',
      'Nyalakan <strong>Dua jenis gas</strong>, amati sekat tertutup, lalu tekan <strong>Buka sekat</strong>. Gas mana yang menyebar lebih cepat?',
      'Nyalakan <strong>Jejak gerak partikel</strong> pada suhu rendah dan tinggi. Bandingkan panjang lintasannya.'
    ],

    quiz: [
      {
        q: 'Gas dalam wadah tertutup dipanaskan tanpa mengubah volumenya. Apa yang terjadi pada tekanannya?',
        options: ['Turun', 'Naik', 'Tetap', 'Mula-mula naik lalu turun'],
        answer: 1,
        explain: 'Suhu lebih tinggi berarti partikel bergerak lebih cepat. Tumbukan ke dinding menjadi lebih sering dan lebih keras, sehingga tekanan naik.'
      },
      {
        q: 'Apa yang sebenarnya diukur oleh suhu?',
        options: [
          'Jumlah partikel dalam wadah',
          'Energi kinetik rata-rata partikel',
          'Volume wadah',
          'Berat total gas'
        ],
        answer: 1,
        explain: 'Suhu adalah ukuran rata-rata energi gerak partikel. Itulah sebabnya dua wadah berbeda ukuran bisa punya suhu sama meski jumlah partikelnya berbeda.'
      },
      {
        q: 'Bau minyak kayu putih yang dibuka di sudut ruangan lama-lama tercium di seluruh ruangan. Peristiwa ini disebut…',
        options: ['Konveksi', 'Difusi', 'Kondensasi', 'Sublimasi'],
        answer: 1,
        explain: 'Difusi adalah penyebaran partikel dari daerah rapat ke daerah renggang akibat gerak acaknya sendiri, tanpa perlu diaduk atau ditiup.'
      },
      {
        q: 'Pada suhu yang sama, gas hidrogen (ringan) dan gas oksigen (berat) dilepaskan bersamaan. Mana yang menyebar lebih cepat?',
        options: [
          'Oksigen, karena lebih berat',
          'Hidrogen, karena lebih ringan sehingga lajunya lebih tinggi',
          'Sama cepat, karena suhunya sama',
          'Tidak ada yang menyebar'
        ],
        answer: 1,
        explain: 'Pada suhu sama, energi kinetik rata-rata keduanya sama. Karena energi kinetik bergantung pada massa dan laju, partikel yang lebih ringan harus bergerak lebih cepat.'
      }
    ]
  });
})();
