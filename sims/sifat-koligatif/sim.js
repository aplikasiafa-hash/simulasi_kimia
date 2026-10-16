/* Sifat Koligatif Larutan — Fase F
   Larutkan zat elektrolit dan nonelektrolit, amati empat sifat koligatif
   sekaligus beserta diagram fasenya. */

(function () {
  'use strict';

  const D = Sim.Draw, P = Sim.P;
  const C = Chem;

  const W = 800, H = 600;

  const ZAT = [
    { n: 'Glukosa', r: 'C6H12O6', Mr: 180.16, i: 1, elek: false, ion: 1 },
    { n: 'Urea', r: 'CO(NH2)2', Mr: 60.06, i: 1, elek: false, ion: 1 },
    { n: 'Sukrosa', r: 'C12H22O11', Mr: 342.3, i: 1, elek: false, ion: 1 },
    { n: 'Natrium klorida', r: 'NaCl', Mr: 58.44, i: 2, elek: true, ion: 2 },
    { n: 'Kalsium klorida', r: 'CaCl2', Mr: 110.98, i: 3, elek: true, ion: 3 },
    { n: 'Aluminium sulfat', r: 'Al2(SO4)3', Mr: 342.15, i: 5, elek: true, ion: 5 },
    { n: 'Asam asetat', r: 'CH3COOH', Mr: 60.05, i: 1.013, elek: true, ion: 2, alfa: 0.013 }
  ];

  function zatAktif(sim) { return ZAT[parseInt(sim.get('zat'), 10) || 0]; }

  function hitung(sim) {
    const z = zatAktif(sim);
    const massa = sim.get('massa');       // gram zat terlarut
    const air = sim.get('air');           // gram pelarut
    const n = massa / z.Mr;
    const kg = air / 1000;
    const m = n / kg;                     // molalitas
    const i = z.i;

    const dTb = C.AIR.Kb * m * i;
    const dTf = C.AIR.Kf * m * i;
    const Tb = 100 + dTb;
    const Tf = 0 - dTf;

    // fraksi mol pelarut untuk tekanan uap
    const nAir = air / C.AIR.Mr;
    const Xp = nAir / (nAir + n * i);
    const P0 = 23.8;                      // mmHg pada 25 °C
    const Plar = P0 * Xp;

    // tekanan osmotik (anggap larutan encer, M ≈ m)
    const osm = m * i * 0.08206 * 298;

    return { z: z, n: n, m: m, i: i, dTb: dTb, dTf: dTf, Tb: Tb, Tf: Tf,
      Xp: Xp, P0: P0, Plar: Plar, dP: P0 - Plar, osm: osm };
  }

  function siapkan(sim) { sim.data.a = 0; }

  Sim.create({
    title: 'Sifat Koligatif Larutan',
    subtitle: 'Empat sifat ini hanya bergantung pada jumlah partikel terlarut, bukan jenisnya. Karena itu elektrolit yang terurai menjadi banyak ion berpengaruh jauh lebih besar.',
    fase: 'F', jenjang: 'SMA Kelas 12',
    topik: ['Koligatif', 'Faktor van \'t Hoff'],
    stage: { w: W, h: H },
    showPlay: false,

    controls: [
      {
        title: 'Larutan',
        items: [
          { type: 'select', id: 'zat', value: 0, label: 'Zat terlarut',
            options: ZAT.map(function (z, i) {
              return { value: i, label: z.n + ' (' + Sim.formula(z.r) + ')' }; }) },
          { type: 'slider', id: 'massa', value: 18, min: 1, max: 100, step: 1,
            label: 'Massa zat terlarut', unit: 'g', dec: 0 },
          { type: 'slider', id: 'air', value: 1000, min: 100, max: 2000, step: 50,
            label: 'Massa air', unit: 'g', dec: 0 }
        ]
      },
      {
        title: 'Tampilan',
        items: [
          { type: 'segment', id: 'panel', value: 'empat', label: 'Panel utama',
            options: [
              { value: 'empat', label: 'Empat sifat' },
              { value: 'fase', label: 'Diagram fase' }
            ] },
          { type: 'toggle', id: 'banding', value: true, label: 'Bandingkan dengan nonelektrolit' },
          { type: 'toggle', id: 'partikel', value: true, label: 'Tampilkan partikel terlarut' }
        ]
      }
    ],

    readouts: [
      { id: 'm', label: 'Molalitas', tone: 'accent' },
      { id: 'i', label: 'Faktor van\'t Hoff' },
      { id: 'tb', label: 'Titik didih' },
      { id: 'tf', label: 'Titik beku' }
    ],

    setup: siapkan,
    reset: siapkan,

    draw: function (c, sim) {
      const h = hitung(sim);
      const z = h.z;

      /* ---------- gelas + partikel ---------- */
      const GX = 60, GY = 120, GW = 130, GH = 150;
      D.beaker(c, GX, GY, GW, GH, 0.74, D.alpha('#4a9fd0', 0.55));

      if (sim.get('partikel')) {
        const nPartikel = Math.min(26, Math.round(h.m * h.i * 5) + 3);
        for (let k = 0; k < nPartikel; k++) {
          const seed = k * 79.7;
          const x = GX + 16 + ((seed * 5.3) % (GW - 32));
          const y = GY + 48 + ((seed * 3.7) % (GH - 62));
          const px = x + Math.sin(sim.t * 0.8 + k) * 3;
          const py = y + Math.cos(sim.t * 0.9 + k) * 3;
          if (z.elek) {
            const pos = k % h.i < 1 || k % 2 === 0;
            D.circle(c, px, py, 5.5, pos ? '#ef6a52' : '#5b9bf5');
            D.text(c, pos ? '+' : '−', px, py,
              { size: 8, weight: 800, color: '#fff', align: 'c', base: 'middle' });
          } else {
            D.circle(c, px, py, 6.5, '#b795f0');
          }
        }
      }

      D.text(c, z.n, GX + GW / 2, GY - 40,
        { size: 16, weight: 700, color: P.text, align: 'c', base: 'middle' });
      D.text(c, z.elek ? 'ELEKTROLIT' : 'NONELEKTROLIT', GX + GW / 2, GY - 20,
        { size: 10.5, weight: 800, color: z.elek ? P.amber : P.violet, align: 'c', base: 'middle' });
      D.text(c, Sim.fmt(sim.get('massa'), 0) + ' g dalam ' + Sim.fmt(sim.get('air'), 0) + ' g air',
        GX + GW / 2, GY + GH + 20,
        { size: 11, weight: 600, color: P.faint, align: 'c', base: 'middle' });

      // faktor van 't Hoff
      D.roundRect(c, GX - 6, GY + GH + 36, GW + 12, 56, 10,
        D.alpha(z.elek ? P.amber : P.violet, 0.12), z.elek ? P.amber : P.violet, 1.4);
      D.text(c, 'Faktor van \'t Hoff', GX + GW / 2, GY + GH + 52,
        { size: 10, weight: 600, color: P.faint, align: 'c', base: 'middle' });
      D.text(c, 'i = ' + Sim.fmt(h.i, h.i % 1 === 0 ? 0 : 3), GX + GW / 2, GY + GH + 74,
        { size: 20, weight: 700, color: z.elek ? P.amber : P.violet, align: 'c', base: 'middle', mono: true });

      if (z.elek) {
        const persamaan = z.r === 'NaCl' ? 'NaCl → Na⁺ + Cl⁻'
          : z.r === 'CaCl2' ? 'CaCl₂ → Ca²⁺ + 2Cl⁻'
          : z.r === 'Al2(SO4)3' ? 'Al₂(SO₄)₃ → 2Al³⁺ + 3SO₄²⁻'
          : 'CH₃COOH ⇌ H⁺ + CH₃COO⁻';
        D.text(c, persamaan, GX + GW / 2, GY + GH + 108,
          { size: 11, weight: 650, color: P.dim, align: 'c', base: 'middle', mono: true });
        D.text(c, z.alfa
          ? 'i = 1 + (n−1)α = 1 + 1×' + Sim.fmt(z.alfa, 3)
          : 'terurai menjadi ' + z.ion + ' ion',
          GX + GW / 2, GY + GH + 126,
          { size: 10, weight: 500, color: P.faint, align: 'c', base: 'middle' });
      }

      /* ---------- panel utama ---------- */
      if (sim.get('panel') === 'empat') {
        const EX = 232, EW = 540;
        D.text(c, 'EMPAT SIFAT KOLIGATIF', EX, 100,
          { size: 10.5, weight: 700, color: P.faint, base: 'middle' });

        const nonElek = hitung({
          get: function (k) { return k === 'zat' ? 0 : sim.get(k); },
          state: sim.state
        });
        // bandingkan pada molalitas sama tapi i = 1
        const mSama = h.m;
        const banding = {
          dTb: C.AIR.Kb * mSama, dTf: C.AIR.Kf * mSama,
          dP: 23.8 * (1 - (sim.get('air') / C.AIR.Mr) / ((sim.get('air') / C.AIR.Mr) + h.n)),
          osm: mSama * 0.08206 * 298
        };

        const sifat = [
          { n: 'Penurunan tekanan uap', sim: 'ΔP', v: h.dP, u: 'mmHg', b: banding.dP,
            rumus: 'ΔP = P° × Xterlarut', w: P.blue },
          { n: 'Kenaikan titik didih', sim: 'ΔTb', v: h.dTb, u: '°C', b: banding.dTb,
            rumus: 'ΔTb = Kb × m × i', w: P.amber },
          { n: 'Penurunan titik beku', sim: 'ΔTf', v: h.dTf, u: '°C', b: banding.dTf,
            rumus: 'ΔTf = Kf × m × i', w: P.accent },
          { n: 'Tekanan osmotik', sim: 'π', v: h.osm, u: 'atm', b: banding.osm,
            rumus: 'π = M × R × T × i', w: P.violet }
        ];

        sifat.forEach(function (s, idx) {
          const x = EX + (idx % 2) * (EW / 2);
          const y = 118 + Math.floor(idx / 2) * 124;
          const w = EW / 2 - 14;
          D.roundRect(c, x, y, w, 112, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
          D.text(c, s.n.toUpperCase(), x + 16, y + 20,
            { size: 9.5, weight: 700, color: P.faint, base: 'middle' });
          D.text(c, s.rumus, x + 16, y + 40,
            { size: 11.5, weight: 650, color: s.w, base: 'middle', mono: true });
          D.text(c, s.sim + ' = ' + Sim.fmt(s.v, 3) + ' ' + s.u, x + 16, y + 68,
            { size: 17, weight: 700, color: s.w, base: 'middle', mono: true });

          if (sim.get('banding') && z.elek) {
            D.text(c, 'bila nonelektrolit: ' + Sim.fmt(s.b, 3) + ' ' + s.u,
              x + 16, y + 90, { size: 10.5, weight: 500, color: P.faint, base: 'middle' });
            // bilah perbandingan
            const maks = Math.max(s.v, s.b) * 1.1;
            D.roundRect(c, x + w - 76, y + 60, 60, 8, 4, 'rgba(255,255,255,.08)');
            D.roundRect(c, x + w - 76, y + 60, 60 * (s.b / maks), 8, 4, 'rgba(255,255,255,.26)');
            D.roundRect(c, x + w - 76, y + 72, 60, 8, 4, 'rgba(255,255,255,.08)');
            D.roundRect(c, x + w - 76, y + 72, 60 * (s.v / maks), 8, 4, s.w);
          }
        });

      } else {
        /* ---------- diagram fase ---------- */
        const g = { x: 300, y: 118, w: 420, h: 240 };
        const map = Plot.axes(c, {
          x: g.x, y: g.y, w: g.w, h: g.h,
          xmin: -12, xmax: 112, ymin: 0, ymax: 850,
          xlabel: 'suhu (°C)', ylabel: 'tekanan (mmHg)',
          judul: 'Diagram fase air dan larutan', xticks: 6, yticks: 4
        });

        // kurva tekanan uap air murni (perkiraan Antoine sederhana)
        function Puap(T, faktor) {
          return faktor * Math.exp(20.386 - 5132 / (T + 273.15));
        }
        const murni = [], larutan = [];
        for (let T = -10; T <= 112; T += 1.2) {
          murni.push([T, Puap(T, 1)]);
          larutan.push([T, Puap(T, h.Xp)]);
        }
        Plot.line(c, map, murni, { color: '#5b9bf5', lw: 2.2 });
        Plot.line(c, map, larutan, { color: P.amber, lw: 2.2, dash: [5, 4] });

        // garis 760 mmHg
        Plot.acuan(c, map, { y: 760, color: 'rgba(255,255,255,.3)', label: '760 mmHg (1 atm)' });

        // titik didih
        Plot.titik(c, map, 100, 760, { r: 4.5, color: '#5b9bf5', label: '100 °C' });
        Plot.titik(c, map, h.Tb, 760, { r: 4.5, color: P.amber, label: Sim.fmt(h.Tb, 2) + ' °C' });

        // garis beku
        Plot.acuan(c, map, { x: 0, color: '#5b9bf5' });
        Plot.acuan(c, map, { x: h.Tf, color: P.accent, label: 'beku ' + Sim.fmt(h.Tf, 2) + ' °C' });

        Plot.legenda(c, g.x, g.y + g.h + 40, [
          { label: 'air murni', warna: '#5b9bf5' },
          { label: 'larutan', warna: P.amber, dash: [5, 4] }
        ]);

        D.roundRect(c, 300, 388, 420, 72, 10, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.2);
        D.text(c, 'Zat terlarut menurunkan tekanan uap larutan. Akibatnya kurva bergeser ke bawah,',
          316, 410, { size: 11.5, weight: 500, color: P.dim, base: 'middle' });
        D.text(c, 'sehingga diperlukan suhu lebih tinggi untuk mencapai 760 mmHg (titik didih naik)',
          316, 428, { size: 11.5, weight: 500, color: P.dim, base: 'middle' });
        D.text(c, 'dan suhu lebih rendah untuk membeku (titik beku turun).',
          316, 446, { size: 11.5, weight: 500, color: P.dim, base: 'middle' });
      }

      /* ---------- penerapan ---------- */
      const PY = 478;
      D.roundRect(c, 40, PY, W - 80, 96, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'PENERAPAN SEHARI-HARI', 58, PY + 20,
        { size: 10, weight: 700, color: P.faint, base: 'middle' });
      const terap = [
        ['Garam di jalan bersalju', 'Menurunkan titik beku air sehingga es mencair'],
        ['Antibeku radiator', 'Etilena glikol mencegah air membeku dan mendidih terlalu cepat'],
        ['Mengawetkan dengan garam', 'Tekanan osmotik menarik air keluar dari sel bakteri'],
        ['Cairan infus isotonik', 'Tekanan osmotiknya disamakan dengan darah agar sel tidak rusak']
      ];
      terap.forEach(function (t, i) {
        const x = 58 + i * ((W - 140) / 4);
        D.text(c, t[0], x, PY + 42, { size: 11.5, weight: 700, color: P.accent2, base: 'middle' });
        const kata = t[1].split(' ');
        let baris = [''];
        kata.forEach(function (w) {
          const coba = baris[baris.length - 1] ? baris[baris.length - 1] + ' ' + w : w;
          if (D.measure(c, coba, { size: 10.5 }) > (W - 140) / 4 - 16) baris.push(w);
          else baris[baris.length - 1] = coba;
        });
        baris.slice(0, 3).forEach(function (b, bi) {
          D.text(c, b, x, PY + 60 + bi * 13,
            { size: 10.5, weight: 500, color: P.dim, base: 'middle' });
        });
      });
    },

    readoutsUpdate: function (sim) {
      const h = hitung(sim);
      sim.readout('m', Sim.fmt(h.m, 3) + '<span class="unit"> molal</span>');
      sim.readout('i', Sim.fmt(h.i, h.i % 1 === 0 ? 0 : 3),
        h.z.elek ? 'warn' : null);
      sim.readout('tb', Sim.fmt(h.Tb, 2) + '<span class="unit"> °C</span>');
      sim.readout('tf', Sim.fmt(h.Tf, 2) + '<span class="unit"> °C</span>');
    },

    notes: `
      <p>Sifat koligatif adalah sifat larutan yang hanya bergantung pada
      <strong>jumlah partikel zat terlarut</strong>, bukan pada jenisnya. Satu mol
      glukosa dan satu mol urea memberi pengaruh yang persis sama, karena keduanya
      menghasilkan jumlah partikel yang sama.</p>

      <h3>Empat sifat koligatif</h3>
      <span class="formula">1. Penurunan tekanan uap   ΔP = P° × Xterlarut
2. Kenaikan titik didih   ΔTb = Kb × m × i
3. Penurunan titik beku   ΔTf = Kf × m × i
4. Tekanan osmotik        π = M × R × T × i

Untuk air:  Kb = 0,52 °C/molal   Kf = 1,86 °C/molal</span>

      <h3>Mengapa keempatnya terjadi?</h3>
      <p>Partikel zat terlarut <strong>menghalangi molekul air</strong> meninggalkan
      permukaan dan menghalanginya menyusun diri menjadi kristal es. Akibatnya:</p>
      <ul>
        <li>Tekanan uap turun, karena lebih sedikit molekul air yang dapat menguap.</li>
        <li>Titik didih naik, karena perlu suhu lebih tinggi agar tekanan uap mencapai
            tekanan udara luar.</li>
        <li>Titik beku turun, karena molekul air lebih sulit tersusun rapi menjadi es.</li>
        <li>Timbul tekanan osmotik, karena air cenderung berpindah menuju larutan yang
            lebih pekat melewati selaput semipermeabel.</li>
      </ul>

      <h3>Faktor van 't Hoff (i)</h3>
      <p>Elektrolit terurai menjadi ion, sehingga <strong>jumlah partikelnya berlipat</strong>.
      Faktor i menyatakan berapa kali lipat pengaruhnya dibanding nonelektrolit pada
      molalitas sama.</p>

      <table>
        <thead><tr><th>Zat</th><th>Penguraian</th><th>i</th></tr></thead>
        <tbody>
          <tr><td>Glukosa, urea</td><td>tidak terurai</td><td>1</td></tr>
          <tr><td>NaCl</td><td>Na⁺ + Cl⁻</td><td>2</td></tr>
          <tr><td>CaCl₂</td><td>Ca²⁺ + 2Cl⁻</td><td>3</td></tr>
          <tr><td>Al₂(SO₄)₃</td><td>2Al³⁺ + 3SO₄²⁻</td><td>5</td></tr>
        </tbody>
      </table>

      <p>Untuk elektrolit lemah yang hanya terionisasi sebagian:</p>
      <span class="formula">i = 1 + (n − 1)α
<span class="cmt">// n = jumlah ion, α = derajat ionisasi</span></span>

      <p>Akibatnya, larutan NaCl 1 molal menurunkan titik beku <strong>dua kali lebih
      banyak</strong> daripada larutan glukosa 1 molal, meski jumlah molnya sama.</p>

      <h3>Molalitas, bukan molaritas</h3>
      <p>Perhitungan koligatif memakai <strong>molalitas</strong> (mol per kilogram
      pelarut), bukan molaritas. Alasannya: molalitas tidak berubah saat suhu berubah,
      sedangkan molaritas berubah karena volume larutan memuai.</p>

      <div class="callout" data-tone="tip">
        <strong>Mengapa CaCl₂ lebih dipilih daripada NaCl untuk mencairkan salju?</strong>
        Pada massa yang sama, CaCl₂ menghasilkan tiga partikel per satuan rumus sedangkan
        NaCl hanya dua. Penurunan titik bekunya lebih besar, sehingga tetap bekerja pada
        suhu yang lebih rendah.
      </div>
    `,

    explore: [
      'Bandingkan <strong>Glukosa</strong> dan <strong>NaCl</strong> dengan massa yang sama. Mengapa pengaruhnya berbeda?',
      'Pilih <strong>CaCl₂</strong> lalu <strong>Al₂(SO₄)₃</strong>. Perhatikan nilai i dan akibatnya pada titik beku.',
      'Buka <strong>Diagram fase</strong> dan amati pergeseran kurva tekanan uapnya.',
      'Pilih <strong>Asam asetat</strong>. Mengapa nilai i-nya hanya 1,013 dan bukan 2?'
    ],

    quiz: [
      {
        q: 'Larutan NaCl 0,5 molal dan larutan glukosa 0,5 molal. Manakah yang titik bekunya lebih rendah?',
        options: [
          'Glukosa, karena molekulnya lebih besar',
          'NaCl, karena terurai menjadi dua ion sehingga jumlah partikelnya dua kali lipat',
          'Keduanya sama, karena molalitasnya sama',
          'Tidak dapat ditentukan'
        ],
        answer: 1,
        explain: 'Sifat koligatif bergantung pada jumlah partikel. NaCl terurai menjadi Na⁺ dan Cl⁻ sehingga i = 2, membuat penurunan titik bekunya dua kali lipat dibanding glukosa yang tidak terurai.'
      },
      {
        q: 'Nilai faktor van \'t Hoff untuk Al₂(SO₄)₃ yang terionisasi sempurna adalah…',
        options: ['2', '3', '5', '7'],
        answer: 2,
        explain: 'Al₂(SO₄)₃ → 2Al³⁺ + 3SO₄²⁻ menghasilkan total 2 + 3 = 5 ion per satuan rumus, sehingga i = 5.'
      },
      {
        q: 'Mengapa perhitungan sifat koligatif memakai molalitas, bukan molaritas?',
        options: [
          'Karena molalitas lebih mudah dihitung',
          'Karena molalitas tidak berubah ketika suhu berubah',
          'Karena molaritas hanya untuk elektrolit',
          'Karena molalitas selalu lebih besar'
        ],
        answer: 1,
        explain: 'Molalitas dihitung terhadap massa pelarut yang tidak berubah oleh suhu. Molaritas dihitung terhadap volume larutan, yang memuai atau menyusut saat suhu berubah.'
      },
      {
        q: 'Larutan dengan tekanan osmotik sama dengan cairan tubuh disebut…',
        options: ['Hipertonik', 'Hipotonik', 'Isotonik', 'Jenuh'],
        answer: 2,
        explain: 'Larutan isotonik memiliki tekanan osmotik yang sama dengan cairan tubuh, sehingga tidak terjadi perpindahan air bersih ke dalam atau ke luar sel. Inilah prinsip pembuatan cairan infus.'
      }
    ]
  });
})();
