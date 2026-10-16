/* Kimia Inti dan Peluruhan Radioaktif — Fase F
   Amati peluruhan alfa, beta, dan gama; ukur waktu paruh; dan gunakan
   peluruhan karbon-14 untuk penanggalan fosil. */

(function () {
  'use strict';

  const D = Sim.Draw, P = Sim.P;
  const C = Chem;

  const W = 800, H = 600;

  const ISOTOP = [
    { n: 'Karbon-14', Z: 6, A: 14, t: 5730, satuan: 'tahun', jenis: 'beta',
      anak: 'Nitrogen-14', guna: 'Penanggalan fosil dan benda arkeologi' },
    { n: 'Uranium-238', Z: 92, A: 238, t: 4.5e9, satuan: 'tahun', jenis: 'alfa',
      anak: 'Torium-234', guna: 'Penanggalan batuan dan umur bumi' },
    { n: 'Iodin-131', Z: 53, A: 131, t: 8.02, satuan: 'hari', jenis: 'beta',
      anak: 'Xenon-131', guna: 'Diagnosis dan terapi kelenjar tiroid' },
    { n: 'Kobalt-60', Z: 27, A: 60, t: 5.27, satuan: 'tahun', jenis: 'gama',
      anak: 'Nikel-60', guna: 'Terapi kanker dan sterilisasi alat medis' },
    { n: 'Teknesium-99m', Z: 43, A: 99, t: 6.01, satuan: 'jam', jenis: 'gama',
      anak: 'Teknesium-99', guna: 'Pemindaian organ dalam kedokteran nuklir' },
    { n: 'Radium-226', Z: 88, A: 226, t: 1600, satuan: 'tahun', jenis: 'alfa',
      anak: 'Radon-222', guna: 'Sejarah penelitian radioaktivitas' },
    { n: 'Fosforus-32', Z: 15, A: 32, t: 14.3, satuan: 'hari', jenis: 'beta',
      anak: 'Belerang-32', guna: 'Pelacak serapan pupuk pada tanaman' }
  ];

  const SINAR = {
    alfa: { n: 'Alfa (α)', partikel: 'inti helium ⁴₂He', muatan: '+2', massa: '4 sma',
      daya: 'terhalang selembar kertas', dZ: -2, dA: -4, w: '#ef6a52', tembus: 0.15 },
    beta: { n: 'Beta (β)', partikel: 'elektron ⁰₋₁e', muatan: '−1', massa: '≈ 0',
      daya: 'terhalang lempeng aluminium', dZ: 1, dA: 0, w: '#5b9bf5', tembus: 0.5 },
    gama: { n: 'Gama (γ)', partikel: 'gelombang elektromagnetik', muatan: '0', massa: '0',
      daya: 'perlu beton atau timbal tebal', dZ: 0, dA: 0, w: '#b795f0', tembus: 1 }
  };

  function isotopAktif(sim) {
    return ISOTOP.find(function (i) { return i.n === sim.get('isotop'); }) || ISOTOP[0];
  }

  function siapkan(sim) {
    const I = isotopAktif(sim);
    sim.data.inti = [];
    for (let i = 0; i < 160; i++) {
      sim.data.inti.push({
        x: Sim.rnd(0.06, 0.94), y: Sim.rnd(0.08, 0.92),
        utuh: true, pancar: 0
      });
    }
    sim.data.waktuSim = 0;
  }

  /** Fraksi inti tersisa setelah t waktu paruh. */
  function sisa(nParuh) { return Math.pow(0.5, nParuh); }

  Sim.create({
    title: 'Kimia Inti dan Peluruhan Radioaktif',
    subtitle: 'Inti yang tidak stabil meluruh dengan laju tetap yang tidak dapat diubah apa pun. Keteraturan itulah yang membuatnya berguna sebagai jam alam.',
    fase: 'F', jenjang: 'SMA Kelas 12',
    topik: ['Radioaktivitas', 'Waktu Paruh'],
    stage: { w: W, h: H },

    controls: [
      {
        title: 'Isotop radioaktif',
        items: [
          { type: 'select', id: 'isotop', value: 'Karbon-14', label: 'Pilih isotop',
            options: ISOTOP.map(function (i) { return { value: i.n, label: i.n }; }) },
          { type: 'slider', id: 'paruh', value: 0, min: 0, max: 8, step: 0.05,
            label: 'Waktu berlalu', unit: '× waktu paruh', dec: 2 },
          { type: 'buttons', label: '', items: [
            { label: '▶ Jalankan waktu', primary: true, onClick: function (sim) {
              sim.data.jalan = true;
            } },
            { label: '■ Hentikan', onClick: function (sim) { sim.data.jalan = false; } },
            { label: '↺ Ulangi', onClick: function (sim) {
              sim.set('paruh', 0); sim.data.jalan = false; siapkan(sim);
            } }
          ] }
        ]
      },
      {
        title: 'Jenis sinar',
        items: [
          { type: 'segment', id: 'sinar', value: 'alfa', label: 'Bandingkan daya tembus',
            options: Object.keys(SINAR).map(function (k) {
              return { value: k, label: SINAR[k].n.split(' ')[0] }; }) }
        ]
      },
      {
        title: 'Penanggalan karbon',
        items: [
          { type: 'slider', id: 'kadar', value: 100, min: 1, max: 100, step: 1,
            label: 'Kadar C-14 tersisa', unit: '%', dec: 0,
            hint: 'Masukkan hasil pengukuran sampel untuk menghitung umurnya.' },
          { type: 'toggle', id: 'grafik', value: true, label: 'Grafik peluruhan' }
        ]
      }
    ],

    readouts: [
      { id: 'sisa', label: 'Inti tersisa', tone: 'accent' },
      { id: 'paruhke', label: 'Waktu paruh ke-' },
      { id: 'waktu', label: 'Waktu berlalu' },
      { id: 'umur', label: 'Umur sampel' }
    ],

    setup: function (sim) { sim.data.jalan = false; siapkan(sim); },
    reset: function (sim) { sim.data.jalan = false; siapkan(sim); },
    onChange: function (sim, id) { if (id === 'isotop') siapkan(sim); },

    update: function (sim, dt) {
      if (sim.data.jalan) {
        const baru = Math.min(8, sim.get('paruh') + dt * 0.35);
        sim.set('paruh', Math.round(baru * 20) / 20);
        if (baru >= 8) sim.data.jalan = false;
      }
      const f = sisa(sim.get('paruh'));
      const hidupTarget = Math.round(160 * f);
      sim.data.inti.forEach(function (n, i) {
        const seharusnya = i < hidupTarget;
        if (n.utuh && !seharusnya) { n.utuh = false; n.pancar = 1; }
        if (!n.utuh && seharusnya) { n.utuh = true; n.pancar = 0; }
        if (n.pancar > 0) n.pancar = Math.max(0, n.pancar - dt * 1.4);
      });
    },

    draw: function (c, sim) {
      const I = isotopAktif(sim);
      const S = SINAR[sim.get('sinar')];
      const nParuh = sim.get('paruh');
      const f = sisa(nParuh);
      const SJ = SINAR[I.jenis];

      /* ---------- kotak inti ---------- */
      const BX = 50, BY = 110, BW = 300, BH = 220;
      D.text(c, 'CUPLIKAN ' + I.n.toUpperCase(), BX, 92,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
      D.roundRect(c, BX, BY, BW, BH, 10, 'rgba(255,255,255,.03)', 'rgba(255,255,255,.2)', 1.6);

      sim.data.inti.forEach(function (n) {
        const px = BX + n.x * BW, py = BY + n.y * BH;
        if (n.utuh) {
          D.circle(c, px, py, 5, '#4fd1c0', 'rgba(0,0,0,.2)', 0.6);
        } else {
          D.circle(c, px, py, 4.4, D.alpha('#6b7580', 0.6));
          if (n.pancar > 0) {
            c.globalAlpha = n.pancar;
            D.circle(c, px, py, 5 + (1 - n.pancar) * 14, null, SJ.w, 1.6);
            c.globalAlpha = 1;
          }
        }
      });

      Plot.legenda(c, BX, BY + BH + 20, [
        { label: 'inti ' + I.n + ' (belum meluruh)', warna: '#4fd1c0' },
        { label: I.anak + ' (hasil peluruhan)', warna: '#6b7580' }
      ]);

      // bilah sisa
      D.roundRect(c, BX, BY + BH + 36, BW, 18, 9, 'rgba(255,255,255,.07)');
      D.roundRect(c, BX, BY + BH + 36, BW * f, 18, 9, P.accent);
      D.text(c, Sim.fmt(f * 100, 1) + '% tersisa', BX + 10, BY + BH + 45,
        { size: 11.5, weight: 700, color: f > 0.3 ? '#06201d' : P.accent2, base: 'middle' });

      /* ---------- persamaan peluruhan ---------- */
      const PX = 374, PW = W - PX - 40;
      D.roundRect(c, PX, 110, PW, 106, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'PERSAMAAN PELURUHAN', PX + 16, 130,
        { size: 10, weight: 700, color: P.faint, base: 'middle' });

      const Zanak = I.Z + SJ.dZ, Aanak = I.A + SJ.dA;
      const simAnak = C.byZ[Zanak] ? C.byZ[Zanak].sym : '?';
      const simInduk = C.byZ[I.Z] ? C.byZ[I.Z].sym : '?';
      const partikel = I.jenis === 'alfa' ? '⁴₂He' : I.jenis === 'beta' ? '⁰₋₁e' : 'γ';

      D.text(c, Sim.sup(String(I.A)) + Sim.sub(String(I.Z)) + simInduk + '  →  ' +
        Sim.sup(String(Aanak)) + Sim.sub(String(Zanak)) + simAnak + '  +  ' + partikel,
        PX + 16, 158, { size: 19, weight: 700, color: P.accent2, base: 'middle' });

      D.text(c, 'Jenis peluruhan: ' + SJ.n, PX + 16, 184,
        { size: 12, weight: 650, color: SJ.w, base: 'middle' });
      D.text(c, I.jenis === 'alfa' ? 'Nomor massa berkurang 4, nomor atom berkurang 2.'
        : I.jenis === 'beta' ? 'Nomor massa tetap, nomor atom bertambah 1.'
        : 'Nomor massa dan nomor atom tidak berubah, hanya energi yang dilepas.',
        PX + 16, 202, { size: 11, weight: 500, color: P.dim, base: 'middle' });

      /* ---------- waktu paruh ---------- */
      D.roundRect(c, PX, 226, PW, 104, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'WAKTU PARUH', PX + 16, 246,
        { size: 10, weight: 700, color: P.faint, base: 'middle' });
      D.text(c, Sim.sci(I.t, 3) + ' ' + I.satuan, PX + 16, 272,
        { size: 20, weight: 700, color: P.accent2, base: 'middle', mono: true });
      D.text(c, 'Nt = N₀ × (1/2)^(t / t½)', PX + 16, 298,
        { size: 12.5, weight: 650, color: P.dim, base: 'middle', mono: true });
      D.text(c, 'Setelah ' + Sim.fmt(nParuh, 2) + ' waktu paruh → ' +
        Sim.fmt(f * 100, 2) + '% tersisa',
        PX + 16, 318, { size: 11.5, weight: 600, color: P.accent2, base: 'middle' });

      /* ---------- grafik peluruhan ---------- */
      if (sim.get('grafik')) {
        const g = { x: 90, y: 400, w: 300, h: 140 };
        const map = Plot.axes(c, {
          x: g.x, y: g.y, w: g.w, h: g.h,
          xmin: 0, xmax: 8, ymin: 0, ymax: 100,
          xlabel: 'waktu (× waktu paruh)', ylabel: '% inti tersisa',
          judul: 'Kurva peluruhan', xticks: 5, yticks: 5
        });
        Plot.fungsi(c, map, function (x) { return 100 * Math.pow(0.5, x); },
          { color: P.accent, lw: 2.4, isi: true });
        // garis setengah berurutan
        for (let k = 1; k <= 4; k++) {
          Plot.acuan(c, map, { y: 100 * Math.pow(0.5, k),
            color: 'rgba(255,255,255,.14)' });
        }
        Plot.titik(c, map, nParuh, f * 100, { r: 5, color: '#fff', halo: true });
        D.text(c, 'tiap satu waktu paruh, jumlahnya tinggal separuh',
          g.x, g.y + g.h + 42, { size: 10.5, weight: 500, color: P.faint, base: 'middle' });
      }

      /* ---------- daya tembus ---------- */
      const DX = 420, DY = 358, DW = W - DX - 40;
      D.roundRect(c, DX, DY, DW, 110, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'DAYA TEMBUS SINAR ' + S.n.toUpperCase(), DX + 16, DY + 20,
        { size: 10, weight: 700, color: P.faint, base: 'middle' });

      // penghalang berlapis
      const sx = DX + 30, sy = DY + 56;
      const halangan = [
        { n: 'kertas', x: 60, batas: 0.2 },
        { n: 'aluminium', x: 130, batas: 0.6 },
        { n: 'timbal', x: 200, batas: 1.1 }
      ];
      D.circle(c, sx, sy, 8, SJ.w);
      D.text(c, 'sumber', sx, sy + 24,
        { size: 9.5, weight: 600, color: P.faint, align: 'c', base: 'middle' });

      halangan.forEach(function (hl) {
        const x = sx + hl.x;
        D.roundRect(c, x, sy - 26, 10, 52, 2, 'rgba(255,255,255,.26)', 'rgba(255,255,255,.4)', 1.2);
        D.text(c, hl.n, x + 5, sy + 40,
          { size: 9.5, weight: 600, color: P.faint, align: 'c', base: 'middle' });
      });

      // berkas sinar berhenti sesuai daya tembusnya
      const jauh = S.tembus * 250;
      D.line(c, sx + 10, sy, sx + 10 + jauh, sy, S.w, 3.4);
      for (let i = 0; i < 4; i++) {
        const px = sx + 16 + ((sim.t * 60 + i * 24) % Math.max(jauh - 10, 10));
        D.circle(c, px, sy, 4, S.w);
      }
      if (S.tembus < 1) {
        D.text(c, '✕', sx + 10 + jauh + 8, sy,
          { size: 15, weight: 800, color: P.red, align: 'c', base: 'middle' });
      }

      D.text(c, S.partikel + ' · muatan ' + S.muatan + ' · ' + S.daya,
        DX + 16, DY + 98, { size: 11, weight: 500, color: P.dim, base: 'middle' });

      /* ---------- penanggalan karbon ---------- */
      const UX = 420, UY = 482;
      D.roundRect(c, UX, UY, DW, 82, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'PENANGGALAN KARBON-14', UX + 16, UY + 20,
        { size: 10, weight: 700, color: P.faint, base: 'middle' });
      const kadar = sim.get('kadar') / 100;
      const umur = kadar > 0 ? Math.log(kadar) / Math.log(0.5) * 5730 : 0;
      D.text(c, 'Kadar C-14 tersisa ' + Math.round(kadar * 100) + '% dari makhluk hidup',
        UX + 16, UY + 42, { size: 11.5, weight: 500, color: P.dim, base: 'middle' });
      D.text(c, 'Umur ≈ ' + Sim.fmt(umur, 0).replace(',00', '') + ' tahun',
        UX + 16, UY + 66, { size: 17, weight: 700, color: P.accent2, base: 'middle', mono: true });

      /* ---------- kegunaan ---------- */
      D.roundRect(c, 50, 552, 340, 34, 8, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.1)', 1.1);
      D.text(c, 'Kegunaan: ' + I.guna, 66, 569,
        { size: 11.5, weight: 500, color: P.dim, base: 'middle' });
    },

    readoutsUpdate: function (sim) {
      const I = isotopAktif(sim);
      const nParuh = sim.get('paruh');
      const f = sisa(nParuh);
      sim.readout('sisa', Sim.fmt(f * 100, 2) + '<span class="unit">%</span>');
      sim.readout('paruhke', Sim.fmt(nParuh, 2));
      sim.readout('waktu', Sim.sci(nParuh * I.t, 2) + '<span class="unit"> ' + I.satuan + '</span>');
      const kadar = sim.get('kadar') / 100;
      const umur = kadar > 0 ? Math.log(kadar) / Math.log(0.5) * 5730 : 0;
      sim.readout('umur', Sim.fmt(umur, 0).replace(',00', '') + '<span class="unit"> thn</span>');
    },

    notes: `
      <p>Sebagian inti atom tidak stabil karena perbandingan neutron terhadap protonnya
      berada di luar daerah kestabilan. Inti seperti itu
      <strong>meluruh secara spontan</strong> sambil memancarkan radiasi.</p>

      <h3>Tiga jenis sinar radioaktif</h3>
      <table>
        <thead><tr><th>Sinar</th><th>Partikel</th><th>Muatan</th><th>Daya tembus</th></tr></thead>
        <tbody>
          <tr><td>Alfa (α)</td><td>inti helium ⁴₂He</td><td>+2</td><td>terhalang kertas</td></tr>
          <tr><td>Beta (β)</td><td>elektron ⁰₋₁e</td><td>−1</td><td>terhalang aluminium</td></tr>
          <tr><td>Gama (γ)</td><td>gelombang elektromagnetik</td><td>0</td><td>perlu timbal tebal</td></tr>
        </tbody>
      </table>

      <p>Perhatikan hubungan terbalik: makin besar muatan dan massa partikelnya, makin
      besar daya ionisasinya tetapi makin kecil daya tembusnya.</p>

      <h3>Perubahan nomor atom dan nomor massa</h3>
      <span class="formula">Peluruhan α:  A berkurang 4, Z berkurang 2
Peluruhan β:  A tetap, Z bertambah 1
Peluruhan γ:  A dan Z tidak berubah</span>

      <p>Pada peluruhan beta, satu neutron berubah menjadi proton sambil memancarkan
      elektron. Karena itu nomor atomnya naik satu, tetapi jumlah total nukleonnya tetap.</p>

      <h3>Waktu paruh</h3>
      <p>Waktu paruh (t½) adalah waktu yang diperlukan agar <strong>separuh inti
      meluruh</strong>. Nilainya khas untuk setiap isotop dan
      <strong>tidak dapat diubah</strong> oleh suhu, tekanan, atau reaksi kimia apa pun.
      Sifat inilah yang membuatnya dapat dipakai sebagai jam alam.</p>

      <span class="formula">Nt = N₀ × (1/2)^(t / t½)</span>

      <p>Setelah 1 waktu paruh tersisa 50%, setelah 2 tersisa 25%, setelah 3 tersisa 12,5%,
      dan seterusnya. Secara teori tidak pernah habis sama sekali — hanya terus membelah
      menjadi separuh.</p>

      <h3>Penanggalan karbon-14</h3>
      <p>Makhluk hidup terus menyerap karbon dari lingkungan, sehingga kadar C-14 dalam
      tubuhnya sama dengan kadar di atmosfer. Begitu mati, penyerapan berhenti dan C-14
      yang ada mulai meluruh dengan waktu paruh 5.730 tahun.</p>

      <p>Dengan mengukur sisa kadar C-14 pada fosil, umurnya dapat dihitung. Metode ini
      efektif sampai sekitar 50.000 tahun; untuk batuan yang jauh lebih tua dipakai
      uranium-238 dengan waktu paruh 4,5 miliar tahun.</p>

      <h3>Reaksi fisi dan fusi</h3>
      <ul>
        <li><strong>Fisi</strong> — inti berat terbelah menjadi inti lebih ringan,
            misalnya U-235 ditumbuk neutron. Dipakai pada PLTN.</li>
        <li><strong>Fusi</strong> — inti ringan bergabung menjadi inti lebih berat,
            misalnya hidrogen menjadi helium di matahari. Energinya jauh lebih besar,
            tetapi memerlukan suhu jutaan derajat.</li>
      </ul>

      <h3>Manfaat dan risiko</h3>
      <p>Radioisotop dipakai luas: Co-60 dan I-131 untuk terapi kanker, Tc-99m untuk
      pemindaian organ, P-32 untuk melacak serapan pupuk, dan iradiasi untuk mengawetkan
      makanan.</p>

      <p>Namun radiasi pengion dapat merusak DNA dan menyebabkan kanker. Karena itu
      pekerja radiasi memakai pelindung timbal, menjaga jarak, dan membatasi waktu
      paparan — tiga asas keselamatan radiasi.</p>

      <div class="callout" data-tone="warn">
        <strong>Waktu paruh tidak dapat dipercepat</strong>
        Tidak ada cara kimia untuk mempercepat atau memperlambat peluruhan. Inilah
        sebabnya penanganan limbah radioaktif menjadi persoalan yang sulit: limbah itu
        harus disimpan aman selama ribuan tahun sampai meluruh sendiri.
      </div>
    `,

    explore: [
      'Pilih <strong>Karbon-14</strong>, jalankan waktu sampai 3 waktu paruh. Berapa persen inti tersisa?',
      'Bandingkan <strong>Iodin-131</strong> (8 hari) dan <strong>Uranium-238</strong> (4,5 miliar tahun). Mengapa I-131 dipilih untuk terapi medis?',
      'Lihat persamaan peluruhan <strong>Uranium-238</strong>. Berapa perubahan nomor atom dan nomor massanya?',
      'Pada penanggalan karbon, atur kadar menjadi 25%. Berapa umur sampelnya? Cocokkan dengan dua waktu paruh.'
    ],

    quiz: [
      {
        q: 'Inti ²³⁸₉₂U memancarkan sinar alfa. Inti yang terbentuk adalah…',
        options: ['²³⁴₉₀Th', '²³⁸₉₃Np', '²³⁴₉₂U', '²³⁶₉₀Th'],
        answer: 0,
        explain: 'Peluruhan alfa memancarkan inti helium ⁴₂He, sehingga nomor massa berkurang 4 (238 → 234) dan nomor atom berkurang 2 (92 → 90). Unsur dengan Z = 90 adalah torium.'
      },
      {
        q: 'Suatu isotop memiliki waktu paruh 10 hari. Setelah 30 hari, jumlah inti yang tersisa adalah…',
        options: ['50%', '25%', '12,5%', '0%'],
        answer: 2,
        explain: '30 hari sama dengan 3 waktu paruh. Setelah tiga kali membelah dua: 100% → 50% → 25% → 12,5%.'
      },
      {
        q: 'Manakah sinar radioaktif dengan daya tembus paling besar?',
        options: ['Alfa', 'Beta', 'Gama', 'Ketiganya sama'],
        answer: 2,
        explain: 'Sinar gama tidak bermassa dan tidak bermuatan, sehingga sedikit berinteraksi dengan materi dan dapat menembus jauh. Diperlukan beton atau timbal tebal untuk menahannya.'
      },
      {
        q: 'Sebuah fosil mengandung 25% karbon-14 dibanding makhluk hidup. Bila waktu paruh C-14 adalah 5.730 tahun, umur fosil tersebut adalah…',
        options: ['5.730 tahun', '11.460 tahun', '17.190 tahun', '22.920 tahun'],
        answer: 1,
        explain: 'Dari 100% menjadi 25% berarti dua kali membelah dua (100 → 50 → 25), yaitu 2 waktu paruh. Umurnya 2 × 5.730 = 11.460 tahun.'
      }
    ]
  });
})();
