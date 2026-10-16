/* Asam-Basa: Teori dan Perhitungan pH — Fase F
   Bandingkan tiga teori asam-basa, dan hitung pH asam/basa kuat maupun lemah
   lengkap dengan langkah perhitungannya. */

(function () {
  'use strict';

  const D = Sim.Draw, P = Sim.P;
  const C = Chem;

  const W = 800, H = 590;

  const ZAT = [
    { n: 'HCl', tipe: 'asam', Ka: Infinity, val: 1, nama: 'asam klorida' },
    { n: 'H2SO4', tipe: 'asam', Ka: Infinity, val: 2, nama: 'asam sulfat' },
    { n: 'HNO3', tipe: 'asam', Ka: Infinity, val: 1, nama: 'asam nitrat' },
    { n: 'CH3COOH', tipe: 'asam', Ka: 1.8e-5, val: 1, nama: 'asam asetat' },
    { n: 'HF', tipe: 'asam', Ka: 6.8e-4, val: 1, nama: 'asam fluorida' },
    { n: 'HCN', tipe: 'asam', Ka: 6.2e-10, val: 1, nama: 'asam sianida' },
    { n: 'NaOH', tipe: 'basa', Kb: Infinity, val: 1, nama: 'natrium hidroksida' },
    { n: 'Ca(OH)2', tipe: 'basa', Kb: Infinity, val: 2, nama: 'kalsium hidroksida' },
    { n: 'NH3', tipe: 'basa', Kb: 1.8e-5, val: 1, nama: 'amonia' },
    { n: 'CH3NH2', tipe: 'basa', Kb: 4.4e-4, val: 1, nama: 'metilamina' }
  ];

  const TEORI = [
    { n: 'Arrhenius', th: '1884',
      asam: 'Zat yang melepaskan ion H⁺ dalam air',
      basa: 'Zat yang melepaskan ion OH⁻ dalam air',
      contoh: 'HCl → H⁺ + Cl⁻   ·   NaOH → Na⁺ + OH⁻',
      batas: 'Hanya berlaku dalam pelarut air. NH₃ tidak punya OH⁻ tetapi bersifat basa.' },
    { n: 'Brønsted-Lowry', th: '1923',
      asam: 'Zat yang memberi proton (donor H⁺)',
      basa: 'Zat yang menerima proton (akseptor H⁺)',
      contoh: 'NH₃ + H₂O ⇌ NH₄⁺ + OH⁻',
      batas: 'Memperkenalkan pasangan asam-basa konjugasi. Berlaku di luar pelarut air.' },
    { n: 'Lewis', th: '1923',
      asam: 'Zat yang menerima pasangan elektron',
      basa: 'Zat yang memberi pasangan elektron',
      contoh: 'BF₃ + NH₃ → F₃B←NH₃',
      batas: 'Paling luas. Mencakup reaksi tanpa perpindahan proton sama sekali.' }
  ];

  function zatAktif(sim) { return ZAT[parseInt(sim.get('zat'), 10) || 0]; }

  function hitung(sim) {
    const z = zatAktif(sim);
    const Cm = sim.get('konsentrasi');
    let pH, ion, alfa;
    if (z.tipe === 'asam') {
      pH = C.pHAsam(Cm, z.Ka, z.val);
      ion = Math.pow(10, -pH);
      alfa = isFinite(z.Ka) ? Math.sqrt(z.Ka / Cm) : 1;
    } else {
      pH = C.pHBasa(Cm, z.Kb, z.val);
      ion = Math.pow(10, -(14 - pH));
      alfa = isFinite(z.Kb) ? Math.sqrt(z.Kb / Cm) : 1;
    }
    return { pH: pH, pOH: 14 - pH, ion: ion, alfa: Math.min(1, alfa), z: z, Cm: Cm };
  }

  function siapkan(sim) { sim.data.jejak = new Plot.Buffer(200); }

  Sim.create({
    title: 'Asam-Basa: Teori dan Perhitungan pH',
    subtitle: 'Tiga teori asam-basa menjelaskan hal yang sama dengan sudut pandang makin luas. Perhitungan pH-nya bergantung pada kuat atau lemahnya zat tersebut.',
    fase: 'F', jenjang: 'SMA Kelas 11',
    topik: ['Asam Basa', 'pH', 'Ka dan Kb'],
    stage: { w: W, h: H },
    showPlay: false,

    controls: [
      {
        title: 'Larutan',
        items: [
          { type: 'select', id: 'zat', value: 0, label: 'Pilih zat',
            options: ZAT.map(function (z, i) {
              return { value: i, label: Sim.formula(z.n) + ' — ' + z.nama }; }) },
          { type: 'slider', id: 'konsentrasi', value: 0.1, min: 0.001, max: 1, step: 0.001,
            label: 'Konsentrasi', unit: 'M', dec: 3,
            hint: 'Perhatikan: pada asam lemah, pH tidak berubah sebesar pada asam kuat.' }
        ]
      },
      {
        title: 'Teori asam-basa',
        items: [
          { type: 'segment', id: 'teori', value: 1, numeric: true, label: '',
            options: [
              { value: 0, label: 'Arrhenius' },
              { value: 1, label: 'Brønsted' },
              { value: 2, label: 'Lewis' }
            ] }
        ]
      },
      {
        title: 'Tampilan',
        items: [
          { type: 'toggle', id: 'langkah', value: true, label: 'Langkah perhitungan' },
          { type: 'toggle', id: 'kurva', value: true, label: 'Grafik pH terhadap konsentrasi' }
        ]
      }
    ],

    readouts: [
      { id: 'ph', label: 'pH larutan', tone: 'accent' },
      { id: 'poh', label: 'pOH' },
      { id: 'ion', label: 'Konsentrasi ion' },
      { id: 'alfa', label: 'Derajat ionisasi' }
    ],

    setup: siapkan,
    reset: siapkan,

    draw: function (c, sim) {
      const h = hitung(sim);
      const z = h.z;
      const kuat = !isFinite(z.Ka) && !isFinite(z.Kb);
      const asam = z.tipe === 'asam';

      /* ---------- gelas + pH ---------- */
      const GX = 60, GY = 130, GW = 130, GH = 150;
      D.beaker(c, GX, GY, GW, GH, 0.74, D.alpha(C.warnaPH(h.pH), 0.85));

      // ion mengambang
      const nIon = Math.round(4 + h.alfa * 18);
      for (let i = 0; i < nIon; i++) {
        const seed = i * 83.7;
        const x = GX + 14 + ((seed * 5.3) % (GW - 28));
        const y = GY + 46 + ((seed * 3.1) % (GH - 60));
        const warna = asam ? '#ef6a52' : '#5b9bf5';
        D.circle(c, x + Math.sin(sim.t + i) * 3, y + Math.cos(sim.t * 1.2 + i) * 3, 5.5, warna);
      }
      // molekul yang belum terionisasi
      if (!kuat) {
        const nMol = Math.round(14 * (1 - h.alfa));
        for (let i = 0; i < nMol; i++) {
          const seed = i * 131.3;
          const x = GX + 16 + ((seed * 4.7) % (GW - 32));
          const y = GY + 50 + ((seed * 2.9) % (GH - 64));
          D.circle(c, x, y, 7, D.alpha('#9aa4ae', 0.7));
        }
      }

      D.text(c, Sim.formula(z.n), GX + GW / 2, GY - 36,
        { size: 20, weight: 700, color: P.text, align: 'c', base: 'middle' });
      D.text(c, Sim.fmt(h.Cm, 3) + ' M · ' + (kuat ? 'kuat' : 'lemah'),
        GX + GW / 2, GY - 14,
        { size: 11.5, weight: 600, color: kuat ? P.accent : P.amber, align: 'c', base: 'middle' });

      // nilai pH besar
      D.text(c, 'pH', GX + GW / 2, GY + GH + 24,
        { size: 11, weight: 600, color: P.faint, align: 'c', base: 'middle' });
      D.text(c, Sim.fmt(h.pH, 2), GX + GW / 2, GY + GH + 56,
        { size: 36, weight: 700, color: C.warnaPH(h.pH), align: 'c', base: 'middle', mono: true });

      /* ---------- skala pH ---------- */
      const SX = 232, SY = 130, SW = 300, SH = 36;
      D.text(c, 'SKALA pH', SX, SY - 14,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
      for (let i = 0; i < SW; i++) {
        c.fillStyle = C.warnaPH(i / SW * 14);
        c.fillRect(SX + i, SY, 1.6, SH);
      }
      D.roundRect(c, SX, SY, SW, SH, 5, null, 'rgba(255,255,255,.2)', 1.3);
      const px = SX + Sim.clamp(h.pH, 0, 14) / 14 * SW;
      D.line(c, px, SY - 4, px, SY + SH + 4, '#ffffff', 2.4);
      for (let p = 0; p <= 14; p += 2) {
        D.text(c, String(p), SX + p / 14 * SW, SY + SH + 14,
          { size: 10, weight: 500, color: P.faint, align: 'c', base: 'middle' });
      }

      /* ---------- langkah perhitungan ---------- */
      if (sim.get('langkah')) {
        const LX = 232, LY = 196, LW = 300;
        D.roundRect(c, LX, LY, LW, 168, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
        D.text(c, 'LANGKAH PERHITUNGAN', LX + 16, LY + 20,
          { size: 10.5, weight: 700, color: P.faint, base: 'middle' });

        let langkah;
        if (kuat && asam) {
          langkah = [
            'Asam kuat → terionisasi sempurna (α = 1)',
            '[H⁺] = valensi × M = ' + z.val + ' × ' + Sim.fmt(h.Cm, 3),
            '[H⁺] = ' + Sim.sci(h.ion, 2) + ' M',
            'pH = −log [H⁺]',
            'pH = ' + Sim.fmt(h.pH, 2)
          ];
        } else if (kuat && !asam) {
          langkah = [
            'Basa kuat → terionisasi sempurna (α = 1)',
            '[OH⁻] = valensi × M = ' + z.val + ' × ' + Sim.fmt(h.Cm, 3),
            '[OH⁻] = ' + Sim.sci(h.ion, 2) + ' M',
            'pOH = −log [OH⁻] = ' + Sim.fmt(h.pOH, 2),
            'pH = 14 − pOH = ' + Sim.fmt(h.pH, 2)
          ];
        } else if (asam) {
          langkah = [
            'Asam lemah → terionisasi sebagian',
            'Ka = ' + Sim.sci(z.Ka, 2),
            '[H⁺] = √(Ka × M)',
            '[H⁺] = √(' + Sim.sci(z.Ka, 1) + ' × ' + Sim.fmt(h.Cm, 3) + ') = ' + Sim.sci(h.ion, 2),
            'pH = −log [H⁺] = ' + Sim.fmt(h.pH, 2)
          ];
        } else {
          langkah = [
            'Basa lemah → terionisasi sebagian',
            'Kb = ' + Sim.sci(z.Kb, 2),
            '[OH⁻] = √(Kb × M) = ' + Sim.sci(h.ion, 2),
            'pOH = ' + Sim.fmt(h.pOH, 2),
            'pH = 14 − pOH = ' + Sim.fmt(h.pH, 2)
          ];
        }
        langkah.forEach(function (s, i) {
          D.text(c, s, LX + 16, LY + 46 + i * 24, {
            size: 12, weight: i === langkah.length - 1 ? 700 : 500,
            color: i === langkah.length - 1 ? P.accent2 : P.dim,
            base: 'middle', mono: i > 0
          });
        });
      }

      /* ---------- teori asam-basa ---------- */
      const TX = 556, TW = 204;
      const t = TEORI[Math.round(sim.get('teori'))];
      D.roundRect(c, TX, 130, TW, 234, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'TEORI ' + t.n.toUpperCase(), TX + 16, 150,
        { size: 10.5, weight: 700, color: P.accent, base: 'middle' });
      D.text(c, t.th, TX + TW - 16, 150,
        { size: 10.5, weight: 600, color: P.faint, align: 'r', base: 'middle' });

      const bagian = [
        ['ASAM', t.asam, '#ef6a52'],
        ['BASA', t.basa, '#5b9bf5']
      ];
      let yy = 176;
      bagian.forEach(function (b) {
        D.text(c, b[0], TX + 16, yy, { size: 11, weight: 800, color: b[2], base: 'middle' });
        const kata = b[1].split(' ');
        let baris = [''];
        kata.forEach(function (w) {
          const coba = baris[baris.length - 1] ? baris[baris.length - 1] + ' ' + w : w;
          if (D.measure(c, coba, { size: 11.5 }) > TW - 36) baris.push(w);
          else baris[baris.length - 1] = coba;
        });
        baris.forEach(function (s, i) {
          D.text(c, s, TX + 16, yy + 16 + i * 15,
            { size: 11.5, weight: 500, color: P.dim, base: 'middle' });
        });
        yy += 16 + baris.length * 15 + 12;
      });

      D.line(c, TX + 16, yy - 4, TX + TW - 16, yy - 4, 'rgba(255,255,255,.1)', 1);
      D.text(c, 'Contoh', TX + 16, yy + 12,
        { size: 10, weight: 700, color: P.faint, base: 'middle' });
      D.text(c, t.contoh, TX + 16, yy + 28,
        { size: 11, weight: 600, color: P.accent2, base: 'middle', mono: true });
      const kataB = t.batas.split(' ');
      let barisB = [''];
      kataB.forEach(function (w) {
        const coba = barisB[barisB.length - 1] ? barisB[barisB.length - 1] + ' ' + w : w;
        if (D.measure(c, coba, { size: 10.5 }) > TW - 36) barisB.push(w);
        else barisB[barisB.length - 1] = coba;
      });
      barisB.slice(0, 4).forEach(function (s, i) {
        D.text(c, s, TX + 16, yy + 48 + i * 14,
          { size: 10.5, weight: 500, color: P.faint, base: 'middle' });
      });

      /* ---------- grafik pH vs konsentrasi ---------- */
      if (sim.get('kurva')) {
        const g = { x: 90, y: 406, w: 320, h: 130 };
        const map = Plot.axes(c, {
          x: g.x, y: g.y, w: g.w, h: g.h,
          xmin: -3, xmax: 0, ymin: 0, ymax: 14,
          xlabel: 'log M', ylabel: 'pH',
          judul: 'pH terhadap konsentrasi', yticks: 4, xticks: 4
        });
        Plot.acuan(c, map, { y: 7, color: 'rgba(255,255,255,.26)', label: 'netral' });

        // kurva asam kuat & lemah untuk perbandingan
        [[{ Ka: Infinity, val: 1 }, '#ef6a52', 'asam kuat'],
         [{ Ka: 1.8e-5, val: 1 }, '#f0a94a', 'asam lemah (Ka 1,8×10⁻⁵)']
        ].forEach(function (q) {
          const pts = [];
          for (let lg = -3; lg <= 0; lg += 0.08) {
            pts.push([lg, C.pHAsam(Math.pow(10, lg), q[0].Ka, q[0].val)]);
          }
          Plot.line(c, map, pts, { color: q[1], lw: 2 });
        });
        Plot.legenda(c, g.x, g.y + g.h + 36, [
          { label: 'asam kuat', warna: '#ef6a52' },
          { label: 'asam lemah', warna: '#f0a94a' }
        ]);

        if (asam) {
          Plot.titik(c, map, Math.log10(h.Cm), h.pH, { r: 5, color: '#fff', halo: true });
        }
      }

      /* ---------- tabel kekuatan ---------- */
      const KX = 450, KW = 310;
      D.roundRect(c, KX, 390, KW, 162, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'KEKUATAN ASAM — MAKIN BESAR Ka, MAKIN KUAT', KX + 16, 410,
        { size: 10, weight: 700, color: P.faint, base: 'middle' });
      const daftar = ZAT.filter(function (q) { return q.tipe === 'asam'; });
      daftar.forEach(function (q, i) {
        const y = 434 + i * 20;
        const aktif = q.n === z.n;
        if (aktif) D.roundRect(c, KX + 10, y - 9, KW - 20, 19, 4, 'rgba(79,209,192,.12)');
        D.text(c, Sim.formula(q.n), KX + 20, y,
          { size: 11.5, weight: aktif ? 700 : 500, color: aktif ? P.accent2 : P.dim, base: 'middle' });
        D.text(c, isFinite(q.Ka) ? 'Ka = ' + Sim.sci(q.Ka, 1) : 'asam kuat (α = 1)',
          KX + 110, y, { size: 11, weight: 500, color: P.dim, base: 'middle', mono: true });
        const kekuatan = isFinite(q.Ka) ? Sim.clamp((Math.log10(q.Ka) + 11) / 11, 0.03, 1) : 1;
        D.roundRect(c, KX + 236, y - 5, 56, 10, 5, 'rgba(255,255,255,.08)');
        D.roundRect(c, KX + 236, y - 5, 56 * kekuatan, 10, 5,
          D.ramp(['#5b9bf5', '#f0a94a', '#ef6a52'], kekuatan));
      });
      D.text(c, 'Makin kecil Ka → makin lemah → makin sedikit H⁺ yang dilepas.',
        KX + 16, 542, { size: 10.5, weight: 500, color: P.faint, base: 'middle' });
    },

    readoutsUpdate: function (sim) {
      const h = hitung(sim);
      sim.readout('ph', Sim.fmt(h.pH, 2),
        h.pH < 6.5 ? 'danger' : h.pH > 7.5 ? 'accent' : null);
      sim.readout('poh', Sim.fmt(h.pOH, 2));
      sim.readout('ion', Sim.sci(h.ion, 2) + '<span class="unit"> M</span>');
      sim.readout('alfa', h.alfa >= 0.999 ? '100%' : Sim.fmt(h.alfa * 100, 2) + '<span class="unit">%</span>');
    },

    notes: `
      <p>Tiga teori asam-basa tidak saling membatalkan. Masing-masing memperluas sudut
      pandang sebelumnya agar mencakup lebih banyak kejadian.</p>

      <h3>Perbandingan tiga teori</h3>
      <table>
        <thead><tr><th>Teori</th><th>Asam</th><th>Basa</th></tr></thead>
        <tbody>
          <tr><td>Arrhenius</td><td>melepas H⁺ dalam air</td><td>melepas OH⁻ dalam air</td></tr>
          <tr><td>Brønsted-Lowry</td><td>donor proton</td><td>akseptor proton</td></tr>
          <tr><td>Lewis</td><td>akseptor pasangan elektron</td><td>donor pasangan elektron</td></tr>
        </tbody>
      </table>

      <p>Amonia menunjukkan keterbatasan Arrhenius. NH₃ tidak mengandung gugus OH, tetapi
      larutannya jelas bersifat basa. Brønsted-Lowry menjelaskannya: NH₃ menerima proton
      dari air, NH₃ + H₂O ⇌ NH₄⁺ + OH⁻.</p>

      <h3>Pasangan asam-basa konjugasi</h3>
      <p>Dalam teori Brønsted-Lowry, setiap asam memiliki <strong>basa konjugasi</strong>
      yang terbentuk setelah ia melepas proton, dan sebaliknya.</p>
      <span class="formula">CH₃COOH + H₂O ⇌ CH₃COO⁻ + H₃O⁺
asam₁      basa₂    basa₁konj   asam₂konj</span>
      <p>Makin kuat asamnya, makin lemah basa konjugasinya.</p>

      <h3>Perhitungan pH</h3>
      <p><strong>Asam kuat</strong> terionisasi sempurna, sehingga [H⁺] langsung diperoleh
      dari konsentrasi dan valensinya:</p>
      <span class="formula">[H⁺] = valensi × M
pH = −log [H⁺]</span>

      <p><strong>Asam lemah</strong> hanya terionisasi sebagian, sehingga perlu Ka:</p>
      <span class="formula">[H⁺] = √(Ka × M)
α = √(Ka ÷ M)</span>

      <p>Untuk basa, perhitungannya serupa dengan Kb dan [OH⁻], lalu dilengkapi:</p>
      <span class="formula">pH + pOH = 14
Kw = [H⁺][OH⁻] = 10⁻¹⁴ (pada 25 °C)</span>

      <h3>Perhatikan pengaruh pengenceran</h3>
      <p>Pada asam kuat, mengencerkan sepuluh kali menaikkan pH tepat satu satuan.
      Pada asam lemah, kenaikannya <strong>hanya setengah satuan</strong>, karena
      pengenceran justru menaikkan derajat ionisasinya. Perhatikan kemiringan kedua kurva
      pada grafik — perbedaan ini sering muncul di soal.</p>

      <div class="callout" data-tone="warn">
        <strong>Kuat bukan berarti pekat</strong>
        "Kuat" menyatakan seberapa sempurna zat terionisasi; "pekat" menyatakan jumlah mol
        per liter. Asam asetat 5 M tetaplah asam lemah, sedangkan HCl 0,001 M tetaplah
        asam kuat meski pH-nya hanya 3.
      </div>
    `,

    explore: [
      'Pilih <strong>HCl</strong> 0,1 M, catat pH-nya. Encerkan menjadi 0,01 M. Berapa kenaikan pH-nya?',
      'Ulangi dengan <strong>CH₃COOH</strong> pada konsentrasi yang sama. Mengapa kenaikan pH-nya berbeda?',
      'Bandingkan <strong>HCN</strong> (Ka 6,2×10⁻¹⁰) dan <strong>HF</strong> (Ka 6,8×10⁻⁴) pada 0,1 M.',
      'Pilih <strong>Ca(OH)₂</strong>. Mengapa pH-nya lebih tinggi daripada NaOH pada konsentrasi sama?'
    ],

    quiz: [
      {
        q: 'Berapa pH larutan HCl 0,01 M?',
        options: ['1', '2', '12', '0,01'],
        answer: 1,
        explain: 'HCl adalah asam kuat bervalensi 1, sehingga [H⁺] = 0,01 M = 10⁻². pH = −log(10⁻²) = 2.'
      },
      {
        q: 'Larutan CH₃COOH 0,1 M memiliki Ka = 1,8 × 10⁻⁵. Nilai [H⁺]-nya adalah…',
        options: ['0,1 M', '1,8 × 10⁻⁵ M', '1,34 × 10⁻³ M', '1,8 × 10⁻⁶ M'],
        answer: 2,
        explain: '[H⁺] = √(Ka × M) = √(1,8 × 10⁻⁵ × 0,1) = √(1,8 × 10⁻⁶) ≈ 1,34 × 10⁻³ M, sehingga pH sekitar 2,87.'
      },
      {
        q: 'Menurut teori Brønsted-Lowry, dalam reaksi NH₃ + H₂O ⇌ NH₄⁺ + OH⁻, air berperan sebagai…',
        options: ['Basa, karena menerima proton', 'Asam, karena memberi proton', 'Netral', 'Katalis'],
        answer: 1,
        explain: 'Air memberikan satu proton (H⁺) kepada amonia, sehingga air berperan sebagai asam Brønsted-Lowry. Sisanya menjadi OH⁻ yang merupakan basa konjugasi air.'
      },
      {
        q: 'Larutan asam kuat diencerkan sepuluh kali. Perubahan pH-nya adalah…',
        options: [
          'Naik 1 satuan',
          'Turun 1 satuan',
          'Naik 0,5 satuan',
          'Tidak berubah'
        ],
        answer: 0,
        explain: 'Pada asam kuat, [H⁺] sebanding langsung dengan konsentrasi. Mengencerkan sepuluh kali membuat [H⁺] menjadi sepersepuluh, sehingga pH naik tepat 1 satuan. Pada asam lemah kenaikannya hanya sekitar 0,5 satuan.'
      }
    ]
  });
})();
