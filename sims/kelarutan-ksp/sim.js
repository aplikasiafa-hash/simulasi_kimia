/* Kelarutan dan Hasil Kali Kelarutan — Fase F
   Campurkan dua larutan, bandingkan Qc dengan Ksp, dan saksikan endapan
   muncul tepat saat Qc melampaui Ksp. */

(function () {
  'use strict';

  const D = Sim.Draw, P = Sim.P;
  const C = Chem;

  const W = 800, H = 590;

  const SENYAWA = [
    { r: 'AgCl', Ksp: 1.8e-10, a: 1, b: 1, kat: 'Ag⁺', an: 'Cl⁻',
      larut1: 'AgNO₃', larut2: 'NaCl', w: '#eeeeee', nama: 'perak klorida' },
    { r: 'AgI', Ksp: 8.5e-17, a: 1, b: 1, kat: 'Ag⁺', an: 'I⁻',
      larut1: 'AgNO₃', larut2: 'KI', w: '#f0d878', nama: 'perak iodida' },
    { r: 'BaSO4', Ksp: 1.1e-10, a: 1, b: 1, kat: 'Ba²⁺', an: 'SO₄²⁻',
      larut1: 'BaCl₂', larut2: 'Na₂SO₄', w: '#ffffff', nama: 'barium sulfat' },
    { r: 'CaCO3', Ksp: 3.3e-9, a: 1, b: 1, kat: 'Ca²⁺', an: 'CO₃²⁻',
      larut1: 'CaCl₂', larut2: 'Na₂CO₃', w: '#f4f4f0', nama: 'kalsium karbonat' },
    { r: 'PbI2', Ksp: 9.8e-9, a: 1, b: 2, kat: 'Pb²⁺', an: 'I⁻',
      larut1: 'Pb(NO₃)₂', larut2: 'KI', w: '#f0d040', nama: 'timbal(II) iodida' },
    { r: 'Mg(OH)2', Ksp: 5.6e-12, a: 1, b: 2, kat: 'Mg²⁺', an: 'OH⁻',
      larut1: 'MgCl₂', larut2: 'NaOH', w: '#f2f6f2', nama: 'magnesium hidroksida' },
    { r: 'CuS', Ksp: 8.0e-37, a: 1, b: 1, kat: 'Cu²⁺', an: 'S²⁻',
      larut1: 'CuSO₄', larut2: 'Na₂S', w: '#241c18', nama: 'tembaga(II) sulfida' }
  ];

  function senyawaAktif(sim) {
    return SENYAWA.find(function (s) { return s.r === sim.get('senyawa'); }) || SENYAWA[0];
  }

  function hitung(sim) {
    const S = senyawaAktif(sim);
    const M1 = sim.get('M1'), V1 = sim.get('V1');
    const M2 = sim.get('M2'), V2 = sim.get('V2');
    const Vtot = V1 + V2;

    // konsentrasi setelah dicampur (sebelum mengendap)
    const cKat = M1 * V1 / Vtot;
    const cAn = M2 * V2 / Vtot * S.b;   // koefisien anion dalam rumus

    const Qc = Math.pow(cKat, S.a) * Math.pow(cAn, S.b);
    const s = C.kelarutan(S.Ksp, S.a, S.b);

    return {
      S: S, cKat: cKat, cAn: cAn, Qc: Qc, Vtot: Vtot, s: s,
      mengendap: Qc > S.Ksp,
      rasio: Qc / S.Ksp
    };
  }

  function siapkan(sim) {
    sim.data.a = 0;
    sim.data.jalan = false;
    sim.data.butir = [];
  }

  Sim.create({
    title: 'Kelarutan dan Hasil Kali Kelarutan',
    subtitle: 'Setiap garam sukar larut punya batas. Bandingkan hasil kali konsentrasi ion (Qc) dengan batas itu (Ksp) untuk meramalkan terbentuknya endapan.',
    fase: 'F', jenjang: 'SMA Kelas 11',
    topik: ['Ksp', 'Kelarutan', 'Pengendapan'],
    stage: { w: W, h: H },

    controls: [
      {
        title: 'Senyawa yang dibentuk',
        items: [
          { type: 'select', id: 'senyawa', value: 'AgCl', label: 'Pilih senyawa',
            options: SENYAWA.map(function (s) {
              return { value: s.r, label: Sim.formula(s.r) + ' — ' + s.nama }; }) }
        ]
      },
      {
        title: 'Larutan 1 (sumber kation)',
        items: [
          { type: 'slider', id: 'M1', value: 0.001, min: 0.00001, max: 0.02, step: 0.00001,
            label: 'Konsentrasi', unit: 'M', dec: 5,
            format: function (v) { return Sim.sci(v, 2) + ' M'; } },
          { type: 'slider', id: 'V1', value: 50, min: 10, max: 100, step: 5,
            label: 'Volume', unit: 'mL', dec: 0 }
        ]
      },
      {
        title: 'Larutan 2 (sumber anion)',
        items: [
          { type: 'slider', id: 'M2', value: 0.001, min: 0.00001, max: 0.02, step: 0.00001,
            label: 'Konsentrasi', unit: 'M', dec: 5,
            format: function (v) { return Sim.sci(v, 2) + ' M'; } },
          { type: 'slider', id: 'V2', value: 50, min: 10, max: 100, step: 5,
            label: 'Volume', unit: 'mL', dec: 0 },
          { type: 'buttons', label: '', items: [
            { label: '▶ Campurkan', primary: true, onClick: function (sim) {
              sim.data.jalan = true; sim.data.a = 0;
            } },
            { label: '↺ Ulangi', onClick: function (sim) { siapkan(sim); } }
          ] }
        ]
      }
    ],

    readouts: [
      { id: 'hasil', label: 'Hasil', tone: 'accent' },
      { id: 'qc', label: 'Nilai Qc' },
      { id: 'ksp', label: 'Nilai Ksp' },
      { id: 's', label: 'Kelarutan molar' }
    ],

    setup: siapkan,
    reset: siapkan,
    onChange: function (sim, id) {
      if (id === 'senyawa') siapkan(sim);
      else { sim.data.a = 0; sim.data.jalan = false; sim.data.butir = []; }
    },

    update: function (sim, dt) {
      const h = hitung(sim);
      if (sim.data.jalan) {
        sim.data.a += dt * 0.6;
        if (sim.data.a >= 1) { sim.data.a = 1; sim.data.jalan = false; }
        if (h.mengendap && sim.data.butir.length < 60 && Math.random() < dt * 90) {
          sim.data.butir.push({
            x: Sim.rnd(300, 430), y: Sim.rnd(250, 290),
            vy: Sim.rnd(10, 36), r: Sim.rnd(2.4, 5)
          });
        }
      }
      sim.data.butir.forEach(function (b) {
        b.vy += 60 * dt;
        b.y = Math.min(b.y + b.vy * dt, 348);
        if (b.y >= 348) b.vy = 0;
      });
    },

    draw: function (c, sim) {
      const h = hitung(sim);
      const S = h.S;
      const a = sim.data.a;

      /* ---------- dua gelas + hasil campuran ---------- */
      const g1 = { x: 70, y: 150, w: 100, h: 110 };
      const g2 = { x: 196, y: 150, w: 100, h: 110 };
      D.beaker(c, g1.x, g1.y, g1.w, g1.h, 0.6, D.alpha('#5b9bf5', 0.4));
      D.beaker(c, g2.x, g2.y, g2.w, g2.h, 0.6, D.alpha('#f0a94a', 0.35));
      D.text(c, Sim.formula(S.larut1), g1.x + g1.w / 2, g1.y - 20,
        { size: 13, weight: 700, color: P.blue, align: 'c', base: 'middle' });
      D.text(c, Sim.sci(sim.get('M1'), 2) + ' M · ' + sim.get('V1') + ' mL',
        g1.x + g1.w / 2, g1.y + g1.h + 18,
        { size: 10.5, weight: 600, color: P.faint, align: 'c', base: 'middle' });
      D.text(c, Sim.formula(S.larut2), g2.x + g2.w / 2, g2.y - 20,
        { size: 13, weight: 700, color: P.amber, align: 'c', base: 'middle' });
      D.text(c, Sim.sci(sim.get('M2'), 2) + ' M · ' + sim.get('V2') + ' mL',
        g2.x + g2.w / 2, g2.y + g2.h + 18,
        { size: 10.5, weight: 600, color: P.faint, align: 'c', base: 'middle' });

      D.arrow(c, 310, 206, 352, 206, P.accent, 2.6, 10);

      // gelas hasil
      const g3 = { x: 290, y: 190, w: 150, h: 170 };
      c.save();
      c.globalAlpha = Math.min(1, a * 2);
      D.beaker(c, g3.x, g3.y, g3.w, g3.h, 0.78,
        D.alpha(h.mengendap ? D.mix('#4a7a9e', S.w, 0.25) : '#4a7a9e', 0.5));
      c.restore();

      // ion mengambang
      if (a > 0.15) {
        for (let i = 0; i < 16; i++) {
          const seed = i * 87.9;
          const x = g3.x + 14 + ((seed * 5.7) % (g3.w - 28));
          const y = g3.y + 50 + ((seed * 3.1) % (g3.h - 80));
          const kat = i % 2 === 0;
          c.globalAlpha = Math.min(1, a * 1.6) * (h.mengendap ? 0.45 : 1);
          D.circle(c, x + Math.sin(sim.t + i) * 2.6, y + Math.cos(sim.t * 1.2 + i) * 2.6,
            6, kat ? '#5b9bf5' : '#f0a94a');
          c.globalAlpha = 1;
        }
      }

      // endapan
      sim.data.butir.forEach(function (b) {
        D.circle(c, b.x, b.y, b.r, S.w, 'rgba(0,0,0,.2)', 0.7);
      });
      if (h.mengendap && a > 0.4) {
        D.roundRect(c, g3.x + 2, 344, g3.w - 4, 14, 3, D.alpha(S.w, 0.9));
      }

      D.text(c, 'campuran', g3.x + g3.w / 2, g3.y - 20,
        { size: 13, weight: 700, color: P.text, align: 'c', base: 'middle' });
      D.text(c, 'volume total ' + h.Vtot + ' mL', g3.x + g3.w / 2, g3.y + g3.h + 18,
        { size: 10.5, weight: 600, color: P.faint, align: 'c', base: 'middle' });

      /* ---------- perbandingan Qc dan Ksp ---------- */
      const QX = 480, QW = 290;
      D.roundRect(c, QX, 100, QW, 186, 12,
        a > 0.4 ? D.alpha(h.mengendap ? P.amber : P.accent, 0.1) : 'rgba(255,255,255,.04)',
        a > 0.4 ? (h.mengendap ? P.amber : P.accent) : 'rgba(255,255,255,.12)', 1.5);
      D.text(c, 'MEMBANDINGKAN Qc DENGAN Ksp', QX + 16, 120,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });

      D.text(c, 'Qc  = [' + S.kat + ']' + (S.a > 1 ? Sim.sup(S.a) : '') +
        ' [' + S.an + ']' + (S.b > 1 ? Sim.sup(S.b) : ''),
        QX + 16, 146, { size: 12.5, weight: 700, color: P.accent2, base: 'middle', mono: true });

      const rows = [
        ['[' + S.kat + '] setelah dicampur', Sim.sci(h.cKat, 2) + ' M'],
        ['[' + S.an + '] setelah dicampur', Sim.sci(h.cAn, 2) + ' M'],
        ['Qc', Sim.sci(h.Qc, 2)],
        ['Ksp ' + Sim.formula(S.r), Sim.sci(S.Ksp, 2)]
      ];
      rows.forEach(function (r, i) {
        const y = 172 + i * 20;
        D.text(c, r[0], QX + 16, y, { size: 10.5, weight: 500, color: P.faint, base: 'middle' });
        D.text(c, r[1], QX + QW - 16, y, {
          size: 11, weight: 700, align: 'r', base: 'middle', mono: true,
          color: i >= 2 ? (i === 2 ? P.accent2 : P.amber) : P.dim
        });
      });

      // pernyataan perbandingan
      const tanda = h.Qc > S.Ksp ? '>' : h.Qc < S.Ksp ? '<' : '=';
      D.roundRect(c, QX + 16, 252, QW - 32, 26, 6,
        D.alpha(h.mengendap ? P.amber : P.accent, 0.18),
        h.mengendap ? P.amber : P.accent, 1.3);
      D.text(c, 'Qc ' + tanda + ' Ksp  →  ' +
        (h.Qc > S.Ksp ? 'TERBENTUK ENDAPAN'
          : h.Qc < S.Ksp ? 'LARUT SEMPURNA' : 'TEPAT JENUH'),
        QX + QW / 2, 265, {
          size: 12, weight: 800, align: 'c', base: 'middle',
          color: h.mengendap ? P.amber : P.accent
        });

      /* ---------- skala logaritmik Qc vs Ksp ---------- */
      const SX = 480, SW = 290, SY = 310;
      D.text(c, 'PERBANDINGAN DALAM SKALA LOG', SX, SY - 10,
        { size: 10, weight: 700, color: P.faint, base: 'middle' });
      const lo = Math.log10(S.Ksp) - 6, hi = Math.log10(S.Ksp) + 6;
      D.roundRect(c, SX, SY, SW, 22, 5, 'rgba(255,255,255,.06)');
      // zona larut / mengendap
      const xKsp = SX + (Math.log10(S.Ksp) - lo) / (hi - lo) * SW;
      D.roundRect(c, SX, SY, xKsp - SX, 22, 5, D.alpha(P.accent, 0.18));
      D.roundRect(c, xKsp, SY, SX + SW - xKsp, 22, 5, D.alpha(P.amber, 0.18));
      D.line(c, xKsp, SY - 4, xKsp, SY + 26, P.rose, 2);
      D.text(c, 'Ksp', xKsp, SY + 36,
        { size: 10, weight: 700, color: P.rose, align: 'c', base: 'middle' });
      D.text(c, 'larut', SX + 8, SY + 11,
        { size: 10, weight: 700, color: P.accent, base: 'middle' });
      D.text(c, 'mengendap', SX + SW - 8, SY + 11,
        { size: 10, weight: 700, color: P.amber, align: 'r', base: 'middle' });

      const logQ = Math.log10(Math.max(h.Qc, 1e-60));
      const xQ = SX + Sim.clamp((logQ - lo) / (hi - lo), 0, 1) * SW;
      c.beginPath();
      c.moveTo(xQ, SY - 6); c.lineTo(xQ - 7, SY - 16); c.lineTo(xQ + 7, SY - 16);
      c.closePath(); c.fillStyle = P.text; c.fill();
      D.text(c, 'Qc', xQ, SY - 24,
        { size: 10, weight: 700, color: P.text, align: 'c', base: 'middle' });

      /* ---------- kelarutan molar ---------- */
      const KX = 60, KY = 392, KW = 380;
      D.roundRect(c, KX, KY, KW, 166, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'MENGHITUNG KELARUTAN DARI Ksp', KX + 16, KY + 20,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });

      const rumusKsp = S.b === 1
        ? 'Ksp = s × s = s²  →  s = √Ksp'
        : 'Ksp = s × (2s)² = 4s³  →  s = ∛(Ksp/4)';
      D.text(c, Sim.formula(S.r) + ' ⇌ ' + S.kat + ' + ' + (S.b > 1 ? S.b : '') + S.an,
        KX + 16, KY + 46, { size: 12.5, weight: 650, color: P.dim, base: 'middle', mono: true });
      D.text(c, rumusKsp, KX + 16, KY + 70,
        { size: 12.5, weight: 700, color: P.accent2, base: 'middle', mono: true });
      D.text(c, 's = ' + Sim.sci(h.s, 3) + ' mol/L', KX + 16, KY + 96,
        { size: 16, weight: 700, color: P.accent2, base: 'middle', mono: true });
      D.text(c, '  = ' + Sim.sci(h.s * C.massaMolar(S.r.replace(/[()]/g, '')), 3) + ' g/L',
        KX + 16, KY + 118, { size: 12.5, weight: 600, color: P.dim, base: 'middle', mono: true });
      D.text(c, 'Makin kecil Ksp, makin sukar larut senyawanya.',
        KX + 16, KY + 146, { size: 11, weight: 500, color: P.faint, base: 'middle' });

      /* ---------- urutan kelarutan ---------- */
      const UX = 480, UW = 290;
      D.roundRect(c, UX, KY, UW, 166, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'URUTAN KSP — MAKIN KE BAWAH MAKIN SUKAR LARUT', UX + 16, KY + 20,
        { size: 9.5, weight: 700, color: P.faint, base: 'middle' });
      const urut = SENYAWA.slice().sort(function (p, q) { return q.Ksp - p.Ksp; });
      urut.forEach(function (s, i) {
        const y = KY + 42 + i * 17;
        const aktif = s.r === S.r;
        if (aktif) D.roundRect(c, UX + 10, y - 8, UW - 20, 17, 4, 'rgba(79,209,192,.12)');
        D.text(c, Sim.formula(s.r), UX + 20, y,
          { size: 11, weight: aktif ? 700 : 500, color: aktif ? P.accent2 : P.dim, base: 'middle' });
        D.text(c, Sim.sci(s.Ksp, 1), UX + UW - 20, y,
          { size: 10.5, weight: 600, color: aktif ? P.accent2 : P.faint,
            align: 'r', base: 'middle', mono: true });
      });
    },

    readoutsUpdate: function (sim) {
      const h = hitung(sim);
      sim.readout('hasil', h.mengendap ? 'Mengendap' : 'Larut',
        h.mengendap ? 'warn' : 'accent');
      sim.readout('qc', Sim.sci(h.Qc, 2));
      sim.readout('ksp', Sim.sci(h.S.Ksp, 2));
      sim.readout('s', Sim.sci(h.s, 2) + '<span class="unit"> M</span>');
    },

    notes: `
      <p>Tidak ada senyawa yang benar-benar tidak larut. Yang ada hanyalah senyawa yang
      <strong>sangat sedikit larut</strong>. Dalam larutan jenuhnya, terjadi kesetimbangan
      antara padatan dan ion-ionnya.</p>

      <span class="formula">AgCl(s) ⇌ Ag⁺(aq) + Cl⁻(aq)
Ksp = [Ag⁺][Cl⁻]</span>

      <h3>Hasil kali kelarutan (Ksp)</h3>
      <p>Ksp adalah tetapan kesetimbangan untuk pelarutan. Seperti pada Kc, zat padat
      tidak dimasukkan ke dalam ungkapannya. Makin kecil Ksp, makin sukar larut
      senyawanya.</p>

      <p>Untuk senyawa berbentuk AₐBᵦ:</p>
      <span class="formula">AₐBᵦ(s) ⇌ aA(aq) + bB(aq)
Ksp = [A]ᵃ[B]ᵇ = (as)ᵃ · (bs)ᵇ</span>

      <p>Contoh perhitungan untuk dua bentuk yang paling sering muncul:</p>
      <ul>
        <li><strong>AB</strong> (seperti AgCl): Ksp = s², sehingga s = √Ksp</li>
        <li><strong>AB₂</strong> (seperti PbI₂): Ksp = s(2s)² = 4s³, sehingga s = ∛(Ksp/4)</li>
      </ul>

      <h3>Meramalkan terbentuknya endapan</h3>
      <p>Saat dua larutan dicampur, hitung <strong>Qc</strong> (hasil kali konsentrasi ion
      saat itu) lalu bandingkan dengan Ksp:</p>
      <table>
        <thead><tr><th>Keadaan</th><th>Artinya</th></tr></thead>
        <tbody>
          <tr><td>Qc &lt; Ksp</td><td>belum jenuh, semua larut</td></tr>
          <tr><td>Qc = Ksp</td><td>tepat jenuh, berada di ambang</td></tr>
          <tr><td>Qc &gt; Ksp</td><td>lewat jenuh, <strong>terbentuk endapan</strong></td></tr>
        </tbody>
      </table>

      <p>Jangan lupa: setelah dicampur, <strong>volume bertambah</strong> sehingga
      konsentrasi kedua ion mengecil. Langkah pengenceran ini sering terlewat dalam
      pengerjaan soal.</p>

      <h3>Pengaruh ion senama</h3>
      <p>Menambahkan ion yang sama dengan salah satu ion penyusun akan
      <strong>memperkecil kelarutan</strong>. Sesuai asas Le Châtelier, penambahan ion
      Cl⁻ menggeser kesetimbangan AgCl ke arah padatan.</p>

      <p>Inilah alasan AgCl jauh lebih sukar larut dalam larutan NaCl daripada dalam air
      murni. Prinsip ini dipakai untuk mengendapkan zat secara lebih sempurna dalam
      analisis kimia.</p>

      <h3>Penerapan</h3>
      <ul>
        <li><strong>BaSO₄</strong> dipakai sebagai zat kontras rontgen saluran cerna.
            Barium beracun, tetapi Ksp BaSO₄ sangat kecil sehingga ion Ba²⁺ yang terlarut
            dapat diabaikan.</li>
        <li><strong>CaCO₃</strong> membentuk kerak pada pipa air sadah dan stalaktit di gua.</li>
        <li><strong>Pelunakan air</strong> dilakukan dengan mengendapkan Ca²⁺ dan Mg²⁺.</li>
      </ul>

      <div class="callout" data-tone="tip">
        <strong>Ksp sangat peka terhadap pangkat</strong>
        Perhatikan AgI dengan Ksp 8,5 × 10⁻¹⁷ dibanding AgCl dengan 1,8 × 10⁻¹⁰.
        Selisihnya tujuh orde — AgI lebih dari sejuta kali lebih sukar larut.
      </div>
    `,

    explore: [
      'Campurkan AgNO₃ dan NaCl, keduanya 1×10⁻³ M. Apakah terbentuk endapan? Bandingkan Qc dengan Ksp.',
      'Turunkan kedua konsentrasi menjadi 1×10⁻⁵ M. Pada titik mana endapan berhenti terbentuk?',
      'Ganti ke <strong>AgI</strong> dengan konsentrasi yang sama. Mengapa jauh lebih mudah mengendap?',
      'Perhatikan <strong>PbI₂</strong>. Rumus kelarutannya berbeda karena perbandingan ionnya 1 : 2. Mengapa?'
    ],

    quiz: [
      {
        q: 'Kelarutan AgCl dalam air adalah s mol/L. Ungkapan Ksp yang benar adalah…',
        options: ['Ksp = s', 'Ksp = s²', 'Ksp = 4s³', 'Ksp = 2s²'],
        answer: 1,
        explain: 'AgCl(s) ⇌ Ag⁺ + Cl⁻ menghasilkan s mol/L masing-masing ion. Jadi Ksp = [Ag⁺][Cl⁻] = s × s = s².'
      },
      {
        q: 'Untuk senyawa PbI₂ dengan kelarutan s, ungkapan Ksp-nya adalah…',
        options: ['s²', '2s²', '4s³', 's³'],
        answer: 2,
        explain: 'PbI₂(s) ⇌ Pb²⁺ + 2I⁻ menghasilkan s mol/L Pb²⁺ dan 2s mol/L I⁻. Maka Ksp = (s)(2s)² = 4s³.'
      },
      {
        q: 'Dua larutan dicampur dan diperoleh Qc = 2 × 10⁻¹² sedangkan Ksp senyawanya 1,8 × 10⁻¹⁰. Apa yang terjadi?',
        options: [
          'Terbentuk endapan',
          'Larutan tepat jenuh',
          'Tidak terbentuk endapan, semua larut',
          'Tidak dapat ditentukan'
        ],
        answer: 2,
        explain: 'Qc lebih kecil daripada Ksp, berarti larutan belum jenuh. Seluruh ion tetap larut dan tidak ada endapan yang terbentuk.'
      },
      {
        q: 'Kelarutan AgCl dalam larutan NaCl 0,1 M dibandingkan dalam air murni akan…',
        options: [
          'Lebih besar',
          'Lebih kecil, karena pengaruh ion senama',
          'Sama saja',
          'Menjadi nol'
        ],
        answer: 1,
        explain: 'Ion Cl⁻ dari NaCl menggeser kesetimbangan AgCl(s) ⇌ Ag⁺ + Cl⁻ ke arah kiri sesuai asas Le Châtelier. Akibatnya kelarutan AgCl berkurang. Inilah pengaruh ion senama.'
      }
    ]
  });
})();
