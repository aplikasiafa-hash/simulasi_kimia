/* Termokimia: Entalpi dan Kalorimetri — Fase F
   Jalankan kalorimeter, baca kenaikan suhu, gambar diagram tingkat energi,
   dan hitung ΔH lewat hukum Hess. */

(function () {
  'use strict';

  const D = Sim.Draw, P = Sim.P;
  const C = Chem;

  const W = 790, H = 580;

  const REAKSI = [
    { id: 'netralisasi', nama: 'HCl + NaOH → NaCl + H₂O',
      dH: -57.1, jenis: 'eksoterm', satuan: 'kJ/mol',
      cerita: 'Reaksi penetralan asam kuat dengan basa kuat. Larutan terasa menghangat.' },
    { id: 'pembakaran', nama: 'CH₄ + 2O₂ → CO₂ + 2H₂O',
      dH: -890.4, jenis: 'eksoterm', satuan: 'kJ/mol',
      cerita: 'Pembakaran metana. Energinya sangat besar — dasar pemakaian gas sebagai bahan bakar.' },
    { id: 'pelarutan-naoh', nama: 'NaOH(s) → Na⁺(aq) + OH⁻(aq)',
      dH: -44.5, jenis: 'eksoterm', satuan: 'kJ/mol',
      cerita: 'Melarutkan soda api. Wadahnya terasa panas — hati-hati saat praktikum.' },
    { id: 'pelarutan-urea', nama: 'CO(NH₂)₂(s) → CO(NH₂)₂(aq)',
      dH: 15.4, jenis: 'endoterm', satuan: 'kJ/mol',
      cerita: 'Melarutkan urea. Wadahnya justru mendingin — dasar kerja kompres dingin instan.' },
    { id: 'penguraian', nama: 'CaCO₃ → CaO + CO₂',
      dH: 178.5, jenis: 'endoterm', satuan: 'kJ/mol',
      cerita: 'Penguraian batu kapur menjadi kapur tohor. Perlu dibakar di tanur suhu tinggi.' },
    { id: 'fotosintesis', nama: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂',
      dH: 2802, jenis: 'endoterm', satuan: 'kJ/mol',
      cerita: 'Fotosintesis menyerap energi matahari dan menyimpannya sebagai glukosa.' }
  ];

  const HESS = {
    nama: 'Menentukan ΔH pembentukan CO melalui hukum Hess',
    tahap: [
      { r: 'C(s) + O₂(g) → CO₂(g)', dH: -393.5 },
      { r: 'CO(g) + ½O₂(g) → CO₂(g)', dH: -283.0 }
    ],
    target: { r: 'C(s) + ½O₂(g) → CO(g)', dH: -110.5 }
  };

  function reaksiAktif(sim) {
    return REAKSI.find(function (r) { return r.id === sim.get('reaksi'); }) || REAKSI[0];
  }

  /** Suhu kalorimeter dari kalor reaksi: q = m·c·ΔT */
  function hitung(sim) {
    const R = reaksiAktif(sim);
    const n = sim.get('mol');
    const m = sim.get('massa');
    const c = C.KALOR_JENIS.air;
    const q = -R.dH * n * 1000;        // joule yang dilepas ke larutan
    const dT = q / (m * c);            // kenaikan suhu (°C)
    return { q: q, dT: dT, Takhir: 25 + dT, R: R, n: n, m: m };
  }

  function siapkan(sim) {
    sim.data.a = 0;
    sim.data.jalan = false;
    sim.data.jejak = new Plot.Buffer(400);
  }

  Sim.create({
    title: 'Termokimia: Entalpi dan Kalorimetri',
    subtitle: 'Setiap reaksi kimia disertai perpindahan energi. Kalorimeter mengubah perubahan suhu menjadi angka entalpi yang dapat dihitung.',
    fase: 'F', jenjang: 'SMA Kelas 11',
    topik: ['Termokimia', 'Entalpi', 'Hukum Hess'],
    stage: { w: W, h: H },

    controls: [
      {
        title: 'Percobaan kalorimetri',
        items: [
          { type: 'select', id: 'reaksi', value: 'netralisasi', label: 'Pilih reaksi',
            options: REAKSI.map(function (r) { return { value: r.id, label: r.nama }; }) },
          { type: 'slider', id: 'mol', value: 0.1, min: 0.01, max: 0.5, step: 0.01,
            label: 'Jumlah mol pereaksi', unit: 'mol', dec: 2 },
          { type: 'slider', id: 'massa', value: 200, min: 50, max: 500, step: 10,
            label: 'Massa larutan', unit: 'g', dec: 0,
            hint: 'Makin banyak larutan, makin kecil kenaikan suhunya.' },
          { type: 'buttons', label: '', items: [
            { label: '▶ Mulai reaksi', primary: true, onClick: function (sim) {
              sim.data.jalan = true; sim.data.a = 0; sim.data.jejak.clear();
            } }
          ] }
        ]
      },
      {
        title: 'Tampilan',
        items: [
          { type: 'segment', id: 'panel', value: 'diagram', label: 'Panel kanan',
            options: [
              { value: 'diagram', label: 'Diagram energi' },
              { value: 'hess', label: 'Hukum Hess' }
            ] },
          { type: 'toggle', id: 'grafik', value: true, label: 'Grafik suhu terhadap waktu' }
        ]
      }
    ],

    readouts: [
      { id: 'jenis', label: 'Jenis reaksi', tone: 'accent' },
      { id: 'dh', label: 'ΔH reaksi' },
      { id: 'q', label: 'Kalor q' },
      { id: 'dt', label: 'Perubahan suhu' }
    ],

    setup: siapkan,
    reset: siapkan,
    onChange: function (sim, id) {
      if (id === 'reaksi') { sim.data.a = 0; sim.data.jalan = false; sim.data.jejak.clear(); }
    },

    update: function (sim, dt) {
      if (sim.data.jalan) {
        sim.data.a += dt * 0.45;
        if (sim.data.a >= 1) { sim.data.a = 1; sim.data.jalan = false; }
      }
      const h = hitung(sim);
      // suhu naik cepat lalu melandai
      const kurva = 1 - Math.exp(-sim.data.a * 4.2);
      sim.data.jejak.push(sim.t, 25 + h.dT * kurva);
    },

    draw: function (c, sim) {
      const h = hitung(sim);
      const R = h.R;
      const eksoterm = R.dH < 0;
      const kurva = 1 - Math.exp(-sim.data.a * 4.2);
      const Tsekarang = 25 + h.dT * kurva;

      /* ---------- kalorimeter ---------- */
      const KX = 70, KY = 120, KW = 150, KH = 160;

      // bejana luar (isolator)
      D.roundRect(c, KX - 18, KY - 14, KW + 36, KH + 36, 10,
        'rgba(255,255,255,.05)', 'rgba(255,255,255,.26)', 2);
      D.text(c, 'bejana berisolasi', KX + KW / 2, KY + KH + 38,
        { size: 10.5, weight: 600, color: P.faint, align: 'c', base: 'middle' });

      // larutan
      const warnaL = eksoterm
        ? D.ramp(['#4a9fd0', '#f0a94a', '#ef6a52'], Sim.clamp(h.dT * kurva / 40, 0, 1))
        : D.ramp(['#4a9fd0', '#7fb8e8', '#bfe4f7'], Sim.clamp(-h.dT * kurva / 20, 0, 1));
      D.beaker(c, KX, KY, KW, KH, 0.74, D.alpha(warnaL, 0.85));

      // pengaduk & termometer
      D.line(c, KX + 36, KY - 30, KX + 36, KY + KH - 24, 'rgba(230,236,240,.7)', 3);
      D.roundRect(c, KX + 100, KY - 44, 12, KH + 10, 6,
        'rgba(255,255,255,.1)', 'rgba(255,255,255,.3)', 1.3);
      const fT = Sim.clamp((Tsekarang - 10) / 60, 0, 1);
      D.roundRect(c, KX + 102, KY + KH - 40 - (KH - 20) * fT, 8, (KH - 20) * fT + 6, 4,
        D.ramp(['#4a90d9', '#54b64c', '#f0a94a', '#ef6a52'], fT));
      D.circle(c, KX + 106, KY + KH - 30, 9,
        D.ramp(['#4a90d9', '#54b64c', '#f0a94a', '#ef6a52'], fT), 'rgba(255,255,255,.3)', 1.2);

      D.text(c, Sim.fmt(Tsekarang, 2) + ' °C', KX + KW / 2, KY - 58,
        { size: 22, weight: 700, align: 'c', base: 'middle',
          color: D.ramp(['#4a90d9', '#54b64c', '#f0a94a', '#ef6a52'], fT) });
      D.text(c, eksoterm ? 'sistem melepas kalor ke larutan' : 'sistem menyerap kalor dari larutan',
        KX + KW / 2, KY - 36,
        { size: 11, weight: 600, color: eksoterm ? P.amber : P.blue, align: 'c', base: 'middle' });

      // panah aliran kalor
      if (sim.data.a > 0.05) {
        for (let i = 0; i < 4; i++) {
          const fase = (sim.t * 1.2 + i * 0.25) % 1;
          const y = KY + 30 + i * 32;
          const x1 = eksoterm ? KX + 60 : KX + 136;
          const x2 = eksoterm ? KX + 60 + 40 * fase : KX + 136 - 40 * fase;
          c.globalAlpha = 0.6 * (1 - fase);
          D.arrow(c, x1, y, x2, y, eksoterm ? P.amber : P.blue, 2, 6);
          c.globalAlpha = 1;
        }
      }

      /* ---------- panel perhitungan ---------- */
      const PX = 262, PW = 220;
      D.roundRect(c, PX, 100, PW, 200, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'PERHITUNGAN', PX + 16, 120,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
      D.text(c, 'q = m × c × ΔT', PX + 16, 146,
        { size: 14, weight: 700, color: P.accent2, base: 'middle', mono: true });
      const hitungan = [
        ['m (massa larutan)', Sim.fmt(h.m, 0) + ' g'],
        ['c (kalor jenis air)', '4,18 J/g·°C'],
        ['ΔT (perubahan suhu)', Sim.fmt(h.dT, 2) + ' °C'],
        ['q (kalor)', Sim.fmt(h.q / 1000, 2) + ' kJ'],
        ['n (mol pereaksi)', Sim.fmt(h.n, 2) + ' mol']
      ];
      hitungan.forEach(function (b, i) {
        const y = 170 + i * 20;
        D.text(c, b[0], PX + 16, y, { size: 10.5, weight: 500, color: P.faint, base: 'middle' });
        D.text(c, b[1], PX + PW - 16, y,
          { size: 11, weight: 650, color: P.dim, align: 'r', base: 'middle', mono: true });
      });
      D.line(c, PX + 16, 272, PX + PW - 16, 272, 'rgba(255,255,255,.14)', 1);
      D.text(c, 'ΔH = −q / n = ' + Sim.fmt(R.dH, 1) + ' kJ/mol', PX + 16, 288,
        { size: 12, weight: 700, color: eksoterm ? P.amber : P.blue, base: 'middle', mono: true });

      /* ---------- panel kanan ---------- */
      const RX = 500, RW = 258;
      if (sim.get('panel') === 'diagram') {
        D.roundRect(c, RX, 100, RW, 200, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
        D.text(c, 'DIAGRAM TINGKAT ENERGI', RX + 16, 120,
          { size: 10.5, weight: 700, color: P.faint, base: 'middle' });

        const yPereaksi = eksoterm ? 160 : 260;
        const yHasil = eksoterm ? 260 : 160;
        const xA = RX + 40, xB = RX + RW - 40;

        D.line(c, xA, yPereaksi, xA + 70, yPereaksi, P.blue, 3);
        D.text(c, 'pereaksi', xA, yPereaksi - 12,
          { size: 11, weight: 650, color: P.blue, base: 'middle' });
        D.line(c, xB - 70, yHasil, xB, yHasil, P.amber, 3);
        D.text(c, 'hasil reaksi', xB, yHasil - 12,
          { size: 11, weight: 650, color: P.amber, align: 'r', base: 'middle' });

        // garis penghubung
        c.save(); c.setLineDash([4, 4]);
        D.line(c, xA + 70, yPereaksi, xB - 70, yHasil, 'rgba(255,255,255,.2)', 1.4);
        c.restore();

        // panah ΔH
        const xm = RX + RW / 2;
        D.arrow(c, xm, yPereaksi, xm, yHasil, eksoterm ? P.amber : P.blue, 2.6, 9);
        D.roundRect(c, xm + 8, (yPereaksi + yHasil) / 2 - 14, 104, 28, 6,
          D.alpha(eksoterm ? P.amber : P.blue, 0.16),
          eksoterm ? P.amber : P.blue, 1.3);
        D.text(c, 'ΔH = ' + (R.dH > 0 ? '+' : '') + Sim.fmt(R.dH, 1),
          xm + 60, (yPereaksi + yHasil) / 2,
          { size: 12, weight: 700, color: eksoterm ? P.amber : P.blue, align: 'c', base: 'middle', mono: true });

        D.text(c, 'entalpi (H)', RX + 16, 150,
          { size: 10, weight: 600, color: P.faint, base: 'middle' });
        D.arrow(c, RX + 22, 290, RX + 22, 150, 'rgba(255,255,255,.2)', 1.4, 6);

        D.text(c, eksoterm
          ? 'Entalpi hasil lebih rendah → energi dilepas → ΔH bertanda negatif'
          : 'Entalpi hasil lebih tinggi → energi diserap → ΔH bertanda positif',
          RX + 16, 288, { size: 10, weight: 500, color: P.dim, base: 'middle' });

      } else {
        D.roundRect(c, RX, 100, RW, 200, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
        D.text(c, 'HUKUM HESS', RX + 16, 120,
          { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
        D.text(c, 'ΔH tidak bergantung pada jalannya reaksi,', RX + 16, 142,
          { size: 11, weight: 500, color: P.dim, base: 'middle' });
        D.text(c, 'hanya pada keadaan awal dan akhir.', RX + 16, 158,
          { size: 11, weight: 500, color: P.dim, base: 'middle' });

        HESS.tahap.forEach(function (t, i) {
          const y = 184 + i * 34;
          D.text(c, '(' + (i + 1) + ')  ' + t.r, RX + 16, y,
            { size: 10.5, weight: 600, color: P.dim, base: 'middle' });
          D.text(c, 'ΔH = ' + Sim.fmt(t.dH, 1) + ' kJ', RX + 16, y + 15,
            { size: 11, weight: 700, color: P.amber, base: 'middle', mono: true });
        });

        D.line(c, RX + 16, 254, RX + RW - 16, 254, 'rgba(255,255,255,.14)', 1);
        D.text(c, '(1) − (2):', RX + 16, 270,
          { size: 10.5, weight: 600, color: P.faint, base: 'middle' });
        D.text(c, HESS.target.r, RX + 16, 286,
          { size: 10.5, weight: 600, color: P.text, base: 'middle' });
        D.text(c, 'ΔH = −393,5 − (−283,0) = ' + Sim.fmt(HESS.target.dH, 1) + ' kJ',
          RX + 16, 302, { size: 11, weight: 700, color: P.accent2, base: 'middle', mono: true });
      }

      /* ---------- grafik suhu ---------- */
      if (sim.get('grafik')) {
        const GX = 80, GY = 350, GW = 320, GH = 120;
        const data = sim.data.jejak.data;
        const tMax = Math.max(6, sim.t);
        const lo = Math.min(20, 25 + h.dT - 2), hi = Math.max(32, 25 + h.dT + 3);
        const map = Plot.axes(c, {
          x: GX, y: GY, w: GW, h: GH,
          xmin: Math.max(0, tMax - 18), xmax: tMax,
          ymin: lo, ymax: hi,
          xlabel: 'waktu (detik)', ylabel: 'suhu (°C)',
          judul: 'Suhu kalorimeter', yticks: 4, xticks: 4
        });
        Plot.acuan(c, map, { y: 25, color: 'rgba(255,255,255,.3)', label: 'suhu awal' });
        Plot.line(c, map, data, { color: eksoterm ? P.amber : P.blue, lw: 2.4 });
        if (data.length) {
          const last = data[data.length - 1];
          if (last[0] >= map.xmin) {
            Plot.titik(c, map, last[0], last[1], { r: 4, color: P.accent2, halo: true });
          }
        }
      }

      /* ---------- keterangan reaksi ---------- */
      D.roundRect(c, 430, 350, 328, 120, 12,
        D.alpha(eksoterm ? P.amber : P.blue, 0.1), eksoterm ? P.amber : P.blue, 1.5);
      D.text(c, R.jenis.toUpperCase(), 448, 374,
        { size: 15, weight: 800, color: eksoterm ? P.amber : P.blue, base: 'middle' });
      D.text(c, R.nama, 448, 398, { size: 13, weight: 650, color: P.text, base: 'middle' });
      const kata = R.cerita.split(' ');
      let baris = [''];
      kata.forEach(function (w) {
        const coba = baris[baris.length - 1] ? baris[baris.length - 1] + ' ' + w : w;
        if (D.measure(c, coba, { size: 11.5 }) > 292) baris.push(w);
        else baris[baris.length - 1] = coba;
      });
      baris.slice(0, 3).forEach(function (b, i) {
        D.text(c, b, 448, 420 + i * 16, { size: 11.5, weight: 500, color: P.dim, base: 'middle' });
      });

      /* ---------- ringkasan tanda ---------- */
      D.roundRect(c, 40, 490, W - 80, 70, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'MEMBACA TANDA ΔH', 58, 510,
        { size: 10, weight: 700, color: P.faint, base: 'middle' });
      [['EKSOTERM', 'ΔH negatif · sistem melepas kalor · lingkungan memanas · H hasil < H pereaksi', P.amber],
       ['ENDOTERM', 'ΔH positif · sistem menyerap kalor · lingkungan mendingin · H hasil > H pereaksi', P.blue]
      ].forEach(function (q, i) {
        D.text(c, q[0], 58, 532 + i * 20,
          { size: 11.5, weight: 800, color: q[2], base: 'middle' });
        D.text(c, q[1], 150, 532 + i * 20,
          { size: 11.5, weight: 500, color: P.dim, base: 'middle' });
      });
    },

    readoutsUpdate: function (sim) {
      const h = hitung(sim);
      sim.readout('jenis', h.R.jenis, h.R.dH < 0 ? 'warn' : 'accent');
      sim.readout('dh', (h.R.dH > 0 ? '+' : '') + Sim.fmt(h.R.dH, 1) + '<span class="unit"> kJ/mol</span>');
      sim.readout('q', Sim.fmt(h.q / 1000, 2) + '<span class="unit"> kJ</span>');
      sim.readout('dt', (h.dT > 0 ? '+' : '') + Sim.fmt(h.dT, 2) + '<span class="unit"> °C</span>');
    },

    notes: `
      <p>Termokimia mempelajari <strong>perpindahan energi</strong> yang menyertai reaksi
      kimia. Energi itu tersimpan dalam ikatan: memutus ikatan <em>memerlukan</em> energi,
      membentuk ikatan <em>melepaskan</em> energi. Selisihnya adalah
      <strong>perubahan entalpi (ΔH)</strong>.</p>

      <h3>Sistem dan lingkungan</h3>
      <p>Perhatikan bahwa tanda ΔH selalu dilihat dari sudut pandang <strong>sistem</strong>
      (zat yang bereaksi), bukan dari sudut pandang kita.</p>
      <table>
        <thead><tr><th></th><th>Eksoterm</th><th>Endoterm</th></tr></thead>
        <tbody>
          <tr><td>Tanda ΔH</td><td>negatif (−)</td><td>positif (+)</td></tr>
          <tr><td>Kalor</td><td>dilepas sistem</td><td>diserap sistem</td></tr>
          <tr><td>Suhu lingkungan</td><td>naik</td><td>turun</td></tr>
          <tr><td>Entalpi hasil</td><td>lebih rendah</td><td>lebih tinggi</td></tr>
          <tr><td>Contoh</td><td>pembakaran, penetralan</td><td>fotosintesis, kompres dingin</td></tr>
        </tbody>
      </table>

      <h3>Kalorimetri</h3>
      <p>Kita tidak dapat mengukur entalpi secara langsung, tetapi dapat mengukur
      <strong>perubahan suhu</strong> yang ditimbulkannya.</p>
      <span class="formula">q = m × c × ΔT
ΔH = −q / n     <span class="cmt">// tanda minus: kalor yang masuk larutan berasal dari sistem</span></span>

      <p>Perhatikan: menambah jumlah pereaksi membuat kenaikan suhu lebih besar, tetapi
      <strong>ΔH per mol tetap sama</strong>. Entalpi adalah sifat zat, bukan sifat
      percobaan.</p>

      <h3>Jenis-jenis entalpi standar</h3>
      <ul>
        <li><strong>ΔH°f</strong> — entalpi pembentukan: 1 mol senyawa dari unsur-unsurnya.</li>
        <li><strong>ΔH°c</strong> — entalpi pembakaran: 1 mol zat dibakar sempurna.</li>
        <li><strong>ΔH°d</strong> — entalpi penguraian: kebalikan pembentukan.</li>
        <li><strong>ΔH°n</strong> — entalpi penetralan: 1 mol H₂O dari asam dan basa.</li>
      </ul>
      <p>Entalpi pembentukan unsur bebas dalam keadaan standar bernilai <strong>nol</strong>.</p>

      <h3>Hukum Hess</h3>
      <p>Perubahan entalpi suatu reaksi <strong>tidak bergantung pada jalan reaksinya</strong>,
      hanya pada keadaan awal dan akhir. Hukum ini sangat berguna untuk reaksi yang sulit
      diukur langsung.</p>

      <p>ΔH pembentukan CO tidak dapat diukur langsung, karena pembakaran karbon selalu
      menghasilkan campuran CO dan CO₂. Namun dengan menyusun dua reaksi yang dapat diukur,
      nilainya dapat dihitung: −393,5 − (−283,0) = −110,5 kJ/mol.</p>

      <h3>Tiga cara menghitung ΔH</h3>
      <ol>
        <li><strong>Kalorimetri</strong> — dari pengukuran langsung ΔT.</li>
        <li><strong>Hukum Hess</strong> — menyusun reaksi antara.</li>
        <li><strong>Data ΔH°f</strong>: ΔH = Σ ΔH°f hasil − Σ ΔH°f pereaksi.</li>
        <li><strong>Energi ikatan</strong>: ΔH = Σ energi ikatan putus − Σ energi ikatan terbentuk.</li>
      </ol>

      <div class="callout" data-tone="tip">
        <strong>Kompres dingin instan</strong>
        Kantong kompres dingin berisi air dan kristal amonium nitrat yang dipisahkan sekat.
        Saat ditekan, sekatnya pecah dan garam melarut secara endoterm, menyerap kalor dari
        sekitarnya sehingga kantong menjadi dingin.
      </div>
    `,

    explore: [
      'Jalankan <strong>penetralan HCl + NaOH</strong> dengan 0,1 mol. Berapa kenaikan suhunya?',
      'Gandakan jumlah mol menjadi 0,2. Apakah ΔH per mol ikut berubah? Mengapa?',
      'Naikkan massa larutan dari 200 g ke 500 g tanpa mengubah mol. Mengapa kenaikan suhunya mengecil?',
      'Pilih <strong>pelarutan urea</strong> dan amati suhunya turun. Buka diagram energi — ke mana arah panah ΔH?'
    ],

    quiz: [
      {
        q: 'Suatu reaksi memiliki ΔH = −890 kJ/mol. Reaksi ini bersifat…',
        options: [
          'Endoterm, menyerap kalor dari lingkungan',
          'Eksoterm, melepaskan kalor ke lingkungan',
          'Netral, tidak melibatkan kalor',
          'Tidak dapat ditentukan'
        ],
        answer: 1,
        explain: 'Tanda negatif menunjukkan sistem melepaskan kalor ke lingkungan. Entalpi hasil reaksi lebih rendah daripada pereaksi, dan lingkungan akan terasa memanas.'
      },
      {
        q: 'Dalam kalorimeter berisi 200 g larutan, suhu naik 3 °C. Kalor yang diserap larutan (c = 4,18 J/g·°C) adalah…',
        options: ['2,51 kJ', '0,84 kJ', '25,1 kJ', '836 kJ'],
        answer: 0,
        explain: 'q = m × c × ΔT = 200 × 4,18 × 3 = 2.508 J = 2,51 kJ.'
      },
      {
        q: 'Jumlah mol pereaksi digandakan dalam percobaan kalorimetri. Apa yang terjadi pada ΔH per mol?',
        options: [
          'Menjadi dua kali lipat',
          'Menjadi setengahnya',
          'Tetap sama, karena ΔH adalah sifat zat per mol',
          'Menjadi nol'
        ],
        answer: 2,
        explain: 'Kalor total yang dilepas memang bertambah dua kali lipat, tetapi karena mol pereaksinya juga bertambah dua kali, hasil baginya tetap. ΔH per mol adalah sifat reaksi itu sendiri.'
      },
      {
        q: 'Hukum Hess menyatakan bahwa perubahan entalpi suatu reaksi…',
        options: [
          'Selalu bernilai negatif',
          'Bergantung pada jumlah tahapan reaksinya',
          'Hanya bergantung pada keadaan awal dan akhir, bukan pada jalannya reaksi',
          'Sama dengan kalor jenis zat'
        ],
        answer: 2,
        explain: 'Entalpi adalah fungsi keadaan. Berapa pun tahapan yang ditempuh, selisih entalpi antara keadaan awal dan akhir selalu sama. Inilah yang memungkinkan kita menyusun reaksi antara untuk menghitung ΔH yang sulit diukur.'
      }
    ]
  });
})();
