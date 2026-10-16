/* Larutan Penyangga (Buffer) — Fase F
   Tambahkan asam atau basa kuat ke buffer dan ke air biasa secara berdampingan,
   lalu bandingkan goyangan pH keduanya. */

(function () {
  'use strict';

  const D = Sim.Draw, P = Sim.P;
  const C = Chem;

  const W = 800, H = 590;

  const BUFFER = [
    { id: 'asetat', n: 'CH₃COOH / CH₃COO⁻', jenis: 'asam', K: 1.8e-5,
      asam: 'CH₃COOH', basa: 'CH₃COONa', pKa: 4.74,
      guna: 'Pengawet makanan, larutan baku laboratorium.' },
    { id: 'format', n: 'HCOOH / HCOO⁻', jenis: 'asam', K: 1.8e-4,
      asam: 'HCOOH', basa: 'HCOONa', pKa: 3.74,
      guna: 'Elektroforesis dan analisis kimia.' },
    { id: 'amonia', n: 'NH₃ / NH₄⁺', jenis: 'basa', K: 1.8e-5,
      asam: 'NH₄Cl', basa: 'NH₃', pKa: 9.26,
      guna: 'Pembersih dan media kultur sel.' },
    { id: 'fosfat', n: 'H₂PO₄⁻ / HPO₄²⁻', jenis: 'asam', K: 6.2e-8,
      asam: 'NaH₂PO₄', basa: 'Na₂HPO₄', pKa: 7.21,
      guna: 'Penyangga utama di dalam sel tubuh manusia.' }
  ];

  function bufferAktif(sim) {
    return BUFFER.find(function (b) { return b.id === sim.get('buffer'); }) || BUFFER[0];
  }

  /** pH buffer setelah penambahan asam/basa kuat. */
  function hitung(sim) {
    const B = bufferAktif(sim);
    const Vb = 0.1;                                 // 100 mL
    const nAsam0 = sim.get('cAsam') * Vb;
    const nBasa0 = sim.get('cBasa') * Vb;
    const tambah = sim.get('tambah') / 1000;        // mol asam/basa kuat
    const asamKuat = sim.get('jenis') === 'asam';

    // asam kuat menambah komponen asam, basa kuat menambah komponen basa
    let nAsam = asamKuat ? nAsam0 + tambah : nAsam0 - tambah;
    let nBasa = asamKuat ? nBasa0 - tambah : nBasa0 + tambah;
    const jebol = nAsam < 0 || nBasa < 0;
    nAsam = Math.max(nAsam, 1e-9);
    nBasa = Math.max(nBasa, 1e-9);

    let pH;
    if (B.jenis === 'asam') {
      pH = -Math.log10(B.K) + Math.log10(nBasa / nAsam);
    } else {
      const pOH = -Math.log10(B.K) + Math.log10(nAsam / nBasa);
      pH = 14 - pOH;
    }
    if (jebol) {
      // kapasitas penyangga terlampaui: pH melonjak seperti air biasa
      const sisa = asamKuat ? (tambah - nBasa0) : (tambah - nAsam0);
      pH = asamKuat
        ? Math.min(pH, -Math.log10(Math.max(sisa / Vb, 1e-14)))
        : Math.max(pH, 14 + Math.log10(Math.max(sisa / Vb, 1e-14)));
    }

    // pembanding: air murni
    let pHAir = 7;
    if (tambah > 1e-9) {
      pHAir = asamKuat
        ? -Math.log10(tambah / Vb)
        : 14 + Math.log10(tambah / Vb);
    }

    return {
      pH: Sim.clamp(pH, 0, 14), pHAir: Sim.clamp(pHAir, 0, 14),
      nAsam: nAsam, nBasa: nBasa, jebol: jebol,
      pH0: B.jenis === 'asam'
        ? -Math.log10(B.K) + Math.log10(nBasa0 / Math.max(nAsam0, 1e-9))
        : 14 - (-Math.log10(B.K) + Math.log10(nAsam0 / Math.max(nBasa0, 1e-9))),
      B: B
    };
  }

  function siapkan(sim) {
    sim.data.jejakB = new Plot.Buffer(300);
    sim.data.jejakA = new Plot.Buffer(300);
  }

  Sim.create({
    title: 'Larutan Penyangga (Buffer)',
    subtitle: 'Buffer mempertahankan pH hampir tetap meski ditambah asam atau basa kuat. Bandingkan langsung dengan air murni pada perlakuan yang sama.',
    fase: 'F', jenjang: 'SMA Kelas 11',
    topik: ['Buffer', 'Henderson-Hasselbalch'],
    stage: { w: W, h: H },
    showPlay: false,

    controls: [
      {
        title: 'Susunan buffer',
        items: [
          { type: 'select', id: 'buffer', value: 'asetat', label: 'Pasangan penyangga',
            options: BUFFER.map(function (b) { return { value: b.id, label: b.n }; }) },
          { type: 'slider', id: 'cAsam', value: 0.1, min: 0.01, max: 0.5, step: 0.01,
            label: 'Konsentrasi komponen asam', unit: 'M', dec: 2 },
          { type: 'slider', id: 'cBasa', value: 0.1, min: 0.01, max: 0.5, step: 0.01,
            label: 'Konsentrasi komponen basa', unit: 'M', dec: 2 }
        ]
      },
      {
        title: 'Gangguan',
        items: [
          { type: 'segment', id: 'jenis', value: 'asam', label: 'Zat yang ditambahkan',
            options: [{ value: 'asam', label: 'HCl (asam kuat)' }, { value: 'basa', label: 'NaOH (basa kuat)' }] },
          { type: 'slider', id: 'tambah', value: 0, min: 0, max: 30, step: 0.5,
            label: 'Jumlah ditambahkan', unit: 'mmol', dec: 1,
            hint: 'Volume larutan dianggap tetap 100 mL.' },
          { type: 'buttons', label: '', items: [
            { label: 'Kembalikan ke nol', onClick: function (sim) { sim.set('tambah', 0); } },
            { label: 'Buat 1 : 1 (pH = pKa)', onClick: function (sim) {
              sim.set('cAsam', 0.1); sim.set('cBasa', 0.1);
            } }
          ] }
        ]
      },
      {
        title: 'Tampilan',
        items: [
          { type: 'toggle', id: 'reaksi', value: true, label: 'Tampilkan reaksi penyangga' }
        ]
      }
    ],

    readouts: [
      { id: 'ph', label: 'pH buffer', tone: 'accent' },
      { id: 'phair', label: 'pH air murni' },
      { id: 'delta', label: 'Perubahan pH buffer' },
      { id: 'kapasitas', label: 'Keadaan' }
    ],

    setup: siapkan,
    reset: siapkan,

    draw: function (c, sim) {
      const h = hitung(sim);
      const B = h.B;
      const asamKuat = sim.get('jenis') === 'asam';

      /* ---------- dua gelas berdampingan ---------- */
      const gelas = [
        { x: 86, label: 'LARUTAN PENYANGGA', pH: h.pH, pH0: h.pH0, warna: C.warnaPH(h.pH), buffer: true },
        { x: 290, label: 'AIR MURNI (pembanding)', pH: h.pHAir, pH0: 7, warna: C.warnaPH(h.pHAir), buffer: false }
      ];

      gelas.forEach(function (g) {
        const GW = 136, GH = 150, GY = 150;
        D.text(c, g.label, g.x + GW / 2, GY - 44,
          { size: 10.5, weight: 700, color: g.buffer ? P.accent : P.faint, align: 'c', base: 'middle' });
        D.beaker(c, g.x, GY, GW, GH, 0.72, D.alpha(g.warna, 0.88));

        // partikel buffer
        if (g.buffer && sim.get('reaksi')) {
          const total = 18;
          const fBasa = h.nBasa / (h.nAsam + h.nBasa);
          for (let i = 0; i < total; i++) {
            const basa = (i / total) < fBasa;
            const seed = i * 71.3;
            const x = g.x + 14 + ((seed * 5.9) % (GW - 28));
            const y = GY + 48 + ((seed * 3.3) % (GH - 62));
            D.circle(c, x + Math.sin(sim.t + i) * 2.4, y + Math.cos(sim.t * 1.1 + i) * 2.4,
              6.5, basa ? '#5b9bf5' : '#ef6a52');
          }
        }

        // pH besar
        D.text(c, Sim.fmt(g.pH, 2), g.x + GW / 2, GY + GH + 34,
          { size: 30, weight: 700, color: g.warna, align: 'c', base: 'middle', mono: true });
        const delta = g.pH - g.pH0;
        D.text(c, (delta >= 0 ? '+' : '') + Sim.fmt(delta, 2) + ' dari awal',
          g.x + GW / 2, GY + GH + 58, {
            size: 12, weight: 650, align: 'c', base: 'middle',
            color: Math.abs(delta) < 0.5 ? P.green : Math.abs(delta) < 2 ? P.amber : P.red
          });
      });

      // panah penambahan
      if (sim.get('tambah') > 0) {
        gelas.forEach(function (g) {
          const tx = g.x + 68;
          D.arrow(c, tx, 86, tx, 128, asamKuat ? '#ef6a52' : '#5b9bf5', 2.4, 9);
          for (let i = 0; i < 3; i++) {
            const dy = ((sim.t * 90 + i * 16) % 42);
            D.circle(c, tx, 92 + dy, 3.4,
              D.alpha(asamKuat ? '#ef6a52' : '#5b9bf5', 0.9));
          }
        });
        D.text(c, Sim.fmt(sim.get('tambah'), 1) + ' mmol ' + (asamKuat ? 'HCl' : 'NaOH'),
          228, 74, { size: 13, weight: 700, align: 'c', base: 'middle',
            color: asamKuat ? '#ef6a52' : '#5b9bf5' });
      }

      /* ---------- Henderson-Hasselbalch ---------- */
      const HX = 468, HW = 300;
      D.roundRect(c, HX, 90, HW, 160, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'PERSAMAAN HENDERSON-HASSELBALCH', HX + 16, 110,
        { size: 10, weight: 700, color: P.faint, base: 'middle' });
      D.text(c, B.jenis === 'asam' ? 'pH = pKa + log ([basa] / [asam])'
        : 'pOH = pKb + log ([asam] / [basa])',
        HX + 16, 136, { size: 13.5, weight: 700, color: P.accent2, base: 'middle', mono: true });

      const rows = [
        [B.jenis === 'asam' ? 'pKa' : 'pKb', Sim.fmt(-Math.log10(B.K), 2)],
        ['mol komponen asam', Sim.fmt(h.nAsam * 1000, 2) + ' mmol'],
        ['mol komponen basa', Sim.fmt(h.nBasa * 1000, 2) + ' mmol'],
        ['perbandingan basa/asam', Sim.fmt(h.nBasa / h.nAsam, 3)],
        ['log perbandingan', Sim.fmt(Math.log10(h.nBasa / h.nAsam), 3)]
      ];
      rows.forEach(function (r, i) {
        const y = 160 + i * 18;
        D.text(c, r[0], HX + 16, y, { size: 10.5, weight: 500, color: P.faint, base: 'middle' });
        D.text(c, r[1], HX + HW - 16, y,
          { size: 10.5, weight: 650, color: P.dim, align: 'r', base: 'middle', mono: true });
      });

      /* ---------- reaksi penyangga ---------- */
      if (sim.get('reaksi')) {
        D.roundRect(c, HX, 262, HW, 118, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
        D.text(c, 'BAGAIMANA BUFFER BEKERJA', HX + 16, 282,
          { size: 10, weight: 700, color: P.faint, base: 'middle' });

        const r1 = B.jenis === 'asam'
          ? ['Bila ditambah asam (H⁺):', 'CH₃COO⁻ + H⁺ → CH₃COOH', '#ef6a52']
          : ['Bila ditambah asam (H⁺):', 'NH₃ + H⁺ → NH₄⁺', '#ef6a52'];
        const r2 = B.jenis === 'asam'
          ? ['Bila ditambah basa (OH⁻):', 'CH₃COOH + OH⁻ → CH₃COO⁻ + H₂O', '#5b9bf5']
          : ['Bila ditambah basa (OH⁻):', 'NH₄⁺ + OH⁻ → NH₃ + H₂O', '#5b9bf5'];

        [r1, r2].forEach(function (r, i) {
          const y = 306 + i * 38;
          const aktif = (i === 0) === asamKuat && sim.get('tambah') > 0;
          if (aktif) D.roundRect(c, HX + 10, y - 14, HW - 20, 34, 6, D.alpha(r[2], 0.12));
          D.text(c, r[0], HX + 18, y - 3,
            { size: 10.5, weight: 600, color: aktif ? r[2] : P.faint, base: 'middle' });
          D.text(c, r[1], HX + 18, y + 13,
            { size: 11.5, weight: 700, color: aktif ? r[2] : P.dim, base: 'middle', mono: true });
        });
        D.text(c, 'Asam/basa kuat yang ditambahkan diubah menjadi komponen buffer sendiri.',
          HX + 16, 370, { size: 10, weight: 500, color: P.faint, base: 'middle' });
      }

      /* ---------- grafik perbandingan ---------- */
      const g = { x: 90, y: 420, w: 330, h: 136 };
      const maksTambah = 30;
      const map = Plot.axes(c, {
        x: g.x, y: g.y, w: g.w, h: g.h,
        xmin: 0, xmax: maksTambah, ymin: 0, ymax: 14,
        xlabel: 'asam/basa kuat ditambahkan (mmol)', ylabel: 'pH',
        judul: 'Buffer vs air murni', yticks: 4, xticks: 5
      });

      // kurva buffer
      const kurvaB = [], kurvaA = [];
      const simpanTambah = sim.get('tambah');
      for (let t = 0; t <= maksTambah; t += 0.4) {
        sim.state.tambah = t;
        const hh = hitung(sim);
        kurvaB.push([t, hh.pH]);
        kurvaA.push([t, hh.pHAir]);
      }
      sim.state.tambah = simpanTambah;

      Plot.line(c, map, kurvaA, { color: P.rose, lw: 2, dash: [5, 4] });
      Plot.line(c, map, kurvaB, { color: P.accent, lw: 2.6 });
      Plot.titik(c, map, simpanTambah, h.pH, { r: 5, color: '#fff', halo: true });
      Plot.legenda(c, g.x, g.y + g.h + 36, [
        { label: 'larutan penyangga', warna: P.accent },
        { label: 'air murni', warna: P.rose, dash: [5, 4] }
      ]);

      /* ---------- kapasitas & kegunaan ---------- */
      const KX = 468, KW2 = 300;
      D.roundRect(c, KX, 392, KW2, 164, 12,
        h.jebol ? 'rgba(239,106,82,.1)' : 'rgba(255,255,255,.04)',
        h.jebol ? P.red : 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'KAPASITAS PENYANGGA', KX + 16, 412,
        { size: 10, weight: 700, color: P.faint, base: 'middle' });

      const batas = asamKuat ? sim.get('cBasa') * 100 : sim.get('cAsam') * 100;
      const pakai = Sim.clamp(sim.get('tambah') / Math.max(batas, 0.001), 0, 1);
      D.roundRect(c, KX + 16, 428, KW2 - 32, 16, 8, 'rgba(255,255,255,.07)');
      D.roundRect(c, KX + 16, 428, (KW2 - 32) * pakai, 16, 8,
        D.ramp(['#6fcf7f', '#f0a94a', '#ef6a52'], pakai));
      D.text(c, Sim.fmt(sim.get('tambah'), 1) + ' / ' + Sim.fmt(batas, 1) + ' mmol terpakai',
        KX + 16, 458, { size: 11, weight: 600, color: P.dim, base: 'middle' });

      D.text(c, h.jebol ? '⚠ Kapasitas terlampaui — buffer rusak, pH melonjak.'
        : pakai > 0.8 ? 'Hampir habis — buffer mulai kewalahan.'
        : 'Buffer masih bekerja dengan baik.',
        KX + 16, 480, {
          size: 12, weight: 700, base: 'middle',
          color: h.jebol ? P.red : pakai > 0.8 ? P.amber : P.green
        });

      D.line(c, KX + 16, 498, KX + KW2 - 16, 498, 'rgba(255,255,255,.1)', 1);
      D.text(c, 'Penerapan', KX + 16, 514,
        { size: 10, weight: 700, color: P.faint, base: 'middle' });
      const kata = B.guna.split(' ');
      let baris = [''];
      kata.forEach(function (w) {
        const coba = baris[baris.length - 1] ? baris[baris.length - 1] + ' ' + w : w;
        if (D.measure(c, coba, { size: 11.5 }) > KW2 - 36) baris.push(w);
        else baris[baris.length - 1] = coba;
      });
      baris.slice(0, 2).forEach(function (b, i) {
        D.text(c, b, KX + 16, 532 + i * 16,
          { size: 11.5, weight: 500, color: P.dim, base: 'middle' });
      });
    },

    readoutsUpdate: function (sim) {
      const h = hitung(sim);
      sim.readout('ph', Sim.fmt(h.pH, 2));
      sim.readout('phair', Sim.fmt(h.pHAir, 2), 'danger');
      const d = h.pH - h.pH0;
      sim.readout('delta', (d >= 0 ? '+' : '') + Sim.fmt(d, 2),
        Math.abs(d) < 0.5 ? 'accent' : 'warn');
      sim.readout('kapasitas', h.jebol ? 'Terlampaui' : 'Masih menyangga',
        h.jebol ? 'danger' : 'accent');
    },

    notes: `
      <p>Larutan penyangga mampu <strong>mempertahankan pH hampir tetap</strong> walaupun
      ditambah sedikit asam kuat, basa kuat, atau diencerkan. Kemampuan ini berasal dari
      adanya dua zat sekaligus di dalam larutan.</p>

      <h3>Susunan larutan penyangga</h3>
      <ul>
        <li><strong>Penyangga asam</strong> — asam lemah + basa konjugasinya.
            Contoh: CH₃COOH + CH₃COONa. Bekerja di daerah pH asam.</li>
        <li><strong>Penyangga basa</strong> — basa lemah + asam konjugasinya.
            Contoh: NH₃ + NH₄Cl. Bekerja di daerah pH basa.</li>
      </ul>

      <h3>Cara kerjanya</h3>
      <p>Buffer bekerja seperti dua "bantalan" yang saling melengkapi:</p>
      <span class="formula">Ditambah asam (H⁺):   CH₃COO⁻ + H⁺ → CH₃COOH
Ditambah basa (OH⁻):  CH₃COOH + OH⁻ → CH₃COO⁻ + H₂O</span>

      <p>Asam atau basa kuat yang masuk <strong>diubah menjadi komponen buffer itu
      sendiri</strong> — zat yang ionisasinya lemah. Akibatnya [H⁺] hampir tidak berubah,
      meski perbandingan kedua komponennya bergeser.</p>

      <h3>Persamaan Henderson-Hasselbalch</h3>
      <span class="formula">pH = pKa + log ([basa konjugasi] ÷ [asam lemah])</span>

      <p>Dua akibat penting dari persamaan ini:</p>
      <ol>
        <li>Saat perbandingannya <strong>1 : 1</strong>, log 1 = 0 sehingga
            <strong>pH = pKa</strong>. Inilah keadaan buffer paling kuat.</li>
        <li>pH bergantung pada <strong>perbandingan mol</strong>, bukan jumlah mutlaknya.
            Karena itu <strong>pengenceran hampir tidak mengubah pH buffer</strong> —
            kedua komponen diencerkan bersama-sama.</li>
      </ol>

      <h3>Kapasitas penyangga</h3>
      <p>Buffer tidak mampu menahan selamanya. Bila asam kuat yang ditambahkan
      <strong>melebihi jumlah mol basa konjugasi</strong>, komponen itu habis dan pH
      melonjak seperti pada larutan biasa.</p>

      <p>Kapasitas penyangga membesar bila: konsentrasi kedua komponen diperbesar, dan
      perbandingannya mendekati 1 : 1. Buffer bekerja efektif dalam rentang
      <strong>pH = pKa ± 1</strong>.</p>

      <h3>Buffer dalam tubuh</h3>
      <p>pH darah manusia dijaga sangat ketat antara <strong>7,35 dan 7,45</strong>.
      Di luar rentang itu, enzim berhenti bekerja dengan baik. Tubuh memakai tiga sistem
      penyangga:</p>
      <ul>
        <li><strong>H₂CO₃ / HCO₃⁻</strong> — penyangga utama dalam plasma darah.</li>
        <li><strong>H₂PO₄⁻ / HPO₄²⁻</strong> — penyangga utama di dalam sel.</li>
        <li><strong>Protein dan hemoglobin</strong> — menyumbang kapasitas tambahan.</li>
      </ul>

      <div class="callout" data-tone="tip">
        <strong>Mengapa air ludah pun bersifat penyangga?</strong>
        Air liur mengandung bikarbonat yang menetralkan asam dari bakteri mulut. Inilah
        pertahanan alami gigi terhadap pengeroposan.
      </div>
    `,

    explore: [
      'Mulai dengan buffer asetat 1 : 1. Berapa pH-nya? Bandingkan dengan nilai pKa.',
      'Tambahkan 5 mmol HCl. Bandingkan perubahan pH buffer dengan pH air murni.',
      'Terus tambahkan sampai 15 mmol. Pada titik mana buffer mulai jebol? Hubungkan dengan mol komponen basanya.',
      'Naikkan kedua konsentrasi menjadi 0,5 M lalu ulangi. Mengapa buffer menjadi jauh lebih tahan?'
    ],

    quiz: [
      {
        q: 'Larutan penyangga asetat dibuat dari CH₃COOH 0,1 M dan CH₃COONa 0,1 M (Ka = 1,8 × 10⁻⁵). pH larutan ini adalah…',
        options: ['4,74', '5,74', '7,00', '9,26'],
        answer: 0,
        explain: 'Karena perbandingan basa : asam adalah 1 : 1, maka log 1 = 0 sehingga pH = pKa = −log(1,8 × 10⁻⁵) ≈ 4,74.'
      },
      {
        q: 'Larutan penyangga diencerkan dengan air sampai volumenya dua kali lipat. Apa yang terjadi pada pH-nya?',
        options: [
          'Naik 1 satuan',
          'Turun 1 satuan',
          'Hampir tidak berubah',
          'Menjadi 7'
        ],
        answer: 2,
        explain: 'pH buffer bergantung pada perbandingan mol asam dan basa konjugasi. Pengenceran memperkecil keduanya dengan faktor yang sama, sehingga perbandingannya tetap dan pH hampir tidak berubah.'
      },
      {
        q: 'Mengapa penambahan sedikit HCl ke larutan penyangga tidak banyak mengubah pH?',
        options: [
          'Karena HCl tidak bereaksi sama sekali',
          'Karena ion H⁺ diikat oleh basa konjugasi menjadi asam lemah',
          'Karena buffer menetralkan HCl menjadi air saja',
          'Karena pH buffer selalu 7'
        ],
        answer: 1,
        explain: 'Basa konjugasi (misalnya CH₃COO⁻) menangkap ion H⁺ dari HCl dan mengubahnya menjadi CH₃COOH yang hanya terionisasi sedikit. Ion H⁺ bebas hampir tidak bertambah.'
      },
      {
        q: 'Suatu buffer mengandung 10 mmol asam lemah dan 10 mmol basa konjugasinya. Lalu ditambahkan 12 mmol NaOH. Apa yang terjadi?',
        options: [
          'pH tetap seperti semula',
          'Kapasitas buffer terlampaui, pH melonjak tajam',
          'Buffer menjadi lebih kuat',
          'pH turun drastis'
        ],
        answer: 1,
        explain: 'NaOH bereaksi dengan komponen asam lemah yang hanya tersedia 10 mmol. Sisa 2 mmol NaOH tetap sebagai basa kuat bebas, sehingga pH melonjak seperti pada larutan biasa.'
      }
    ]
  });
})();
