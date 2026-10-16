/* Hidrolisis Garam — Fase F
   Larutkan dua belas garam dan telusuri mengapa sebagiannya bersifat asam,
   basa, atau netral, lengkap dengan perhitungan pH-nya. */

(function () {
  'use strict';

  const D = Sim.Draw, P = Sim.P;
  const C = Chem;

  const W = 800, H = 590;

  // tipe: kk (kuat-kuat), lk (asam lemah + basa kuat), kl (asam kuat + basa lemah), ll
  const GARAM = [
    { r: 'NaCl', kation: 'Na⁺', anion: 'Cl⁻', asam: 'HCl', basa: 'NaOH',
      tipe: 'kk', sifat: 'netral', hid: 'tidak terhidrolisis' },
    { r: 'KNO3', kation: 'K⁺', anion: 'NO₃⁻', asam: 'HNO₃', basa: 'KOH',
      tipe: 'kk', sifat: 'netral', hid: 'tidak terhidrolisis' },
    { r: 'Na2SO4', kation: 'Na⁺', anion: 'SO₄²⁻', asam: 'H₂SO₄', basa: 'NaOH',
      tipe: 'kk', sifat: 'netral', hid: 'tidak terhidrolisis' },
    { r: 'CH3COONa', kation: 'Na⁺', anion: 'CH₃COO⁻', asam: 'CH₃COOH', basa: 'NaOH',
      tipe: 'lk', sifat: 'basa', hid: 'hidrolisis sebagian (anion)', Ka: 1.8e-5 },
    { r: 'NaHCO3', kation: 'Na⁺', anion: 'HCO₃⁻', asam: 'H₂CO₃', basa: 'NaOH',
      tipe: 'lk', sifat: 'basa', hid: 'hidrolisis sebagian (anion)', Ka: 4.3e-7 },
    { r: 'KCN', kation: 'K⁺', anion: 'CN⁻', asam: 'HCN', basa: 'KOH',
      tipe: 'lk', sifat: 'basa', hid: 'hidrolisis sebagian (anion)', Ka: 6.2e-10 },
    { r: 'NaF', kation: 'Na⁺', anion: 'F⁻', asam: 'HF', basa: 'NaOH',
      tipe: 'lk', sifat: 'basa', hid: 'hidrolisis sebagian (anion)', Ka: 6.8e-4 },
    { r: 'NH4Cl', kation: 'NH₄⁺', anion: 'Cl⁻', asam: 'HCl', basa: 'NH₃',
      tipe: 'kl', sifat: 'asam', hid: 'hidrolisis sebagian (kation)', Kb: 1.8e-5 },
    { r: 'NH4NO3', kation: 'NH₄⁺', anion: 'NO₃⁻', asam: 'HNO₃', basa: 'NH₃',
      tipe: 'kl', sifat: 'asam', hid: 'hidrolisis sebagian (kation)', Kb: 1.8e-5 },
    { r: '(NH4)2SO4', kation: 'NH₄⁺', anion: 'SO₄²⁻', asam: 'H₂SO₄', basa: 'NH₃',
      tipe: 'kl', sifat: 'asam', hid: 'hidrolisis sebagian (kation)', Kb: 1.8e-5 },
    { r: 'CH3COONH4', kation: 'NH₄⁺', anion: 'CH₃COO⁻', asam: 'CH₃COOH', basa: 'NH₃',
      tipe: 'll', sifat: 'netral', hid: 'hidrolisis total', Ka: 1.8e-5, Kb: 1.8e-5 },
    { r: 'NH4CN', kation: 'NH₄⁺', anion: 'CN⁻', asam: 'HCN', basa: 'NH₃',
      tipe: 'll', sifat: 'basa', hid: 'hidrolisis total', Ka: 6.2e-10, Kb: 1.8e-5 }
  ];

  function garamAktif(sim) { return GARAM[parseInt(sim.get('garam'), 10) || 0]; }

  function hitung(sim) {
    const g = garamAktif(sim);
    const Cm = sim.get('konsentrasi');
    let pH = 7, Kh = null, rumus = '';

    if (g.tipe === 'kk') {
      pH = 7; rumus = 'tidak ada hidrolisis → pH = 7';
    } else if (g.tipe === 'lk') {
      Kh = C.Kw / g.Ka;
      const OH = Math.sqrt(Kh * Cm);
      pH = 14 + Math.log10(Math.max(OH, 1e-14));
      rumus = '[OH⁻] = √(Kw/Ka × M)';
    } else if (g.tipe === 'kl') {
      Kh = C.Kw / g.Kb;
      const Hp = Math.sqrt(Kh * Cm);
      pH = -Math.log10(Math.max(Hp, 1e-14));
      rumus = '[H⁺] = √(Kw/Kb × M)';
    } else {
      Kh = C.Kw / (g.Ka * g.Kb);
      const Hp = Math.sqrt(C.Kw * g.Ka / g.Kb);
      pH = -Math.log10(Math.max(Hp, 1e-14));
      rumus = '[H⁺] = √(Kw × Ka / Kb)';
    }
    return { pH: Sim.clamp(pH, 0, 14), Kh: Kh, rumus: rumus, g: g, Cm: Cm };
  }

  function siapkan(sim) { sim.data.a = 0; sim.data.jalan = false; }

  Sim.create({
    title: 'Hidrolisis Garam',
    subtitle: 'Garam tidak selalu netral. Yang menentukan adalah asal-usulnya: ion dari zat lemah akan bereaksi dengan air dan menggeser pH larutan.',
    fase: 'F', jenjang: 'SMA Kelas 11',
    topik: ['Hidrolisis', 'Garam', 'pH'],
    stage: { w: W, h: H },

    controls: [
      {
        title: 'Garam yang dilarutkan',
        items: [
          { type: 'select', id: 'garam', value: 0, label: 'Pilih garam',
            options: GARAM.map(function (g, i) {
              return { value: i, label: Sim.formula(g.r) }; }) },
          { type: 'slider', id: 'konsentrasi', value: 0.1, min: 0.01, max: 1, step: 0.01,
            label: 'Konsentrasi', unit: 'M', dec: 2 },
          { type: 'buttons', label: '', items: [
            { label: '▶ Larutkan', primary: true, onClick: function (sim) {
              sim.data.jalan = true; sim.data.a = 0;
            } }
          ] }
        ]
      },
      {
        title: 'Tampilan',
        items: [
          { type: 'toggle', id: 'asal', value: true, label: 'Tampilkan asal-usul garam' },
          { type: 'toggle', id: 'hitung', value: true, label: 'Tampilkan perhitungan' },
          { type: 'toggle', id: 'tabel', value: true, label: 'Tabel empat jenis garam' }
        ]
      }
    ],

    readouts: [
      { id: 'sifat', label: 'Sifat larutan', tone: 'accent' },
      { id: 'ph', label: 'pH' },
      { id: 'jenis', label: 'Jenis hidrolisis' },
      { id: 'kh', label: 'Tetapan Kh' }
    ],

    setup: siapkan,
    reset: siapkan,
    onChange: function (sim, id) { if (id === 'garam') { sim.data.a = 0; sim.data.jalan = false; } },

    update: function (sim, dt) {
      if (sim.data.jalan) {
        sim.data.a += dt * 0.6;
        if (sim.data.a >= 1) { sim.data.a = 1; sim.data.jalan = false; }
      }
    },

    draw: function (c, sim) {
      const h = hitung(sim);
      const g = h.g;
      const a = sim.data.a;
      const warnaSifat = g.sifat === 'asam' ? '#ef6a52' : g.sifat === 'basa' ? '#5b9bf5' : '#6fcf7f';

      /* ---------- gelas ---------- */
      const GX = 70, GY = 150, GW = 140, GH = 150;
      const pHTampil = Sim.lerp(7, h.pH, a);
      D.beaker(c, GX, GY, GW, GH, 0.74, D.alpha(C.warnaPH(pHTampil), 0.85));

      D.text(c, Sim.formula(g.r), GX + GW / 2, GY - 48,
        { size: 24, weight: 700, color: P.text, align: 'c', base: 'middle' });
      D.text(c, Sim.fmt(h.Cm, 2) + ' M dalam air', GX + GW / 2, GY - 24,
        { size: 11.5, weight: 600, color: P.faint, align: 'c', base: 'middle' });

      // ion terlarut
      if (a > 0.1) {
        const n = 14;
        for (let i = 0; i < n; i++) {
          const seed = i * 93.1;
          const x = GX + 16 + ((seed * 5.3) % (GW - 32));
          const y = GY + 48 + ((seed * 3.9) % (GH - 62));
          const kation = i % 2 === 0;
          c.globalAlpha = Math.min(1, a * 1.5);
          D.circle(c, x + Math.sin(sim.t + i) * 3, y + Math.cos(sim.t * 1.2 + i) * 3,
            7, kation ? '#ef6a52' : '#5b9bf5');
          D.text(c, kation ? '+' : '−', x + Math.sin(sim.t + i) * 3,
            y + Math.cos(sim.t * 1.2 + i) * 3,
            { size: 9, weight: 800, color: '#fff', align: 'c', base: 'middle' });
          c.globalAlpha = 1;
        }
      } else {
        // kristal belum larut
        for (let i = 0; i < 9; i++) {
          D.roundRect(c, GX + 26 + (i % 3) * 32, GY + GH - 30 - Math.floor(i / 3) * 12,
            10, 10, 1.5, '#f0f0ea', 'rgba(255,255,255,.4)', 0.8);
        }
      }

      D.text(c, 'pH ' + Sim.fmt(pHTampil, 2), GX + GW / 2, GY + GH + 32,
        { size: 28, weight: 700, color: C.warnaPH(pHTampil), align: 'c', base: 'middle', mono: true });
      D.roundRect(c, GX + 8, GY + GH + 48, GW - 16, 26, 13,
        D.alpha(warnaSifat, a * 0.2), a > 0.4 ? warnaSifat : 'transparent', 1.4);
      if (a > 0.4) {
        D.text(c, g.sifat.toUpperCase(), GX + GW / 2, GY + GH + 61,
          { size: 13, weight: 800, color: warnaSifat, align: 'c', base: 'middle' });
      }

      /* ---------- asal-usul garam ---------- */
      if (sim.get('asal')) {
        const AX = 262, AW = 300;
        D.roundRect(c, AX, 108, AW, 150, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
        D.text(c, 'ASAL-USUL GARAM', AX + 16, 128,
          { size: 10.5, weight: 700, color: P.faint, base: 'middle' });

        const asamKuat = g.tipe === 'kk' || g.tipe === 'kl';
        const basaKuat = g.tipe === 'kk' || g.tipe === 'lk';

        [[g.asam, asamKuat, 'ASAM ASAL', AX + 16],
         [g.basa, basaKuat, 'BASA ASAL', AX + 160]].forEach(function (q) {
          D.text(c, q[2], q[3], 152, { size: 9.5, weight: 700, color: P.faint, base: 'middle' });
          D.text(c, Sim.formula(q[0]), q[3], 176,
            { size: 17, weight: 700, color: P.text, base: 'middle' });
          D.roundRect(c, q[3], 188, 108, 22, 11,
            q[1] ? 'rgba(111,207,127,.16)' : 'rgba(240,169,74,.16)',
            q[1] ? P.green : P.amber, 1.3);
          D.text(c, q[1] ? 'KUAT' : 'LEMAH', q[3] + 54, 199,
            { size: 11, weight: 800, color: q[1] ? P.green : P.amber, align: 'c', base: 'middle' });
        });

        D.line(c, AX + 16, 222, AX + AW - 16, 222, 'rgba(255,255,255,.1)', 1);
        D.text(c, 'Ion yang terhidrolisis:', AX + 16, 238,
          { size: 10.5, weight: 500, color: P.faint, base: 'middle' });
        const ionHid = g.tipe === 'kk' ? 'tidak ada'
          : g.tipe === 'lk' ? g.anion + ' (dari asam lemah)'
          : g.tipe === 'kl' ? g.kation + ' (dari basa lemah)'
          : g.kation + ' dan ' + g.anion;
        D.text(c, ionHid, AX + 150, 238,
          { size: 11.5, weight: 700, color: P.accent2, base: 'middle' });
      }

      /* ---------- reaksi hidrolisis ---------- */
      const RX = 584, RW = 186;
      D.roundRect(c, RX, 108, RW, 150, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'REAKSI DENGAN AIR', RX + 14, 128,
        { size: 10, weight: 700, color: P.faint, base: 'middle' });

      let reaksi;
      if (g.tipe === 'kk') {
        reaksi = ['Kation dan anion berasal', 'dari zat kuat.', '', 'Keduanya tidak bereaksi', 'dengan air.', '', 'pH tetap 7.'];
      } else if (g.tipe === 'lk') {
        reaksi = [g.anion + ' + H₂O ⇌', '  ' + g.asam + ' + OH⁻', '', 'Terbentuk OH⁻', '→ larutan basa'];
      } else if (g.tipe === 'kl') {
        reaksi = [g.kation + ' + H₂O ⇌', '  ' + g.basa + ' + H₃O⁺', '', 'Terbentuk H₃O⁺', '→ larutan asam'];
      } else {
        reaksi = ['Kedua ion bereaksi', 'dengan air.', '', 'Sifat ditentukan', 'perbandingan Ka dan Kb.'];
      }
      reaksi.forEach(function (s, i) {
        D.text(c, s, RX + 14, 152 + i * 18, {
          size: 11, weight: i < 2 ? 700 : 500,
          color: i < 2 ? P.accent2 : P.dim, base: 'middle', mono: i < 2
        });
      });

      /* ---------- perhitungan ---------- */
      if (sim.get('hitung')) {
        const HX = 262, HW2 = 508;
        D.roundRect(c, HX, 272, HW2, 96, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
        D.text(c, 'PERHITUNGAN pH', HX + 16, 292,
          { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
        D.text(c, h.rumus, HX + 16, 316,
          { size: 14, weight: 700, color: P.accent2, base: 'middle', mono: true });

        const rows = [];
        if (g.tipe === 'lk') {
          rows.push(['Ka asam asal', Sim.sci(g.Ka, 2)]);
          rows.push(['Kh = Kw / Ka', Sim.sci(h.Kh, 2)]);
          rows.push(['[OH⁻]', Sim.sci(Math.sqrt(h.Kh * h.Cm), 2) + ' M']);
          rows.push(['pOH → pH', Sim.fmt(14 - h.pH, 2) + ' → ' + Sim.fmt(h.pH, 2)]);
        } else if (g.tipe === 'kl') {
          rows.push(['Kb basa asal', Sim.sci(g.Kb, 2)]);
          rows.push(['Kh = Kw / Kb', Sim.sci(h.Kh, 2)]);
          rows.push(['[H⁺]', Sim.sci(Math.sqrt(h.Kh * h.Cm), 2) + ' M']);
          rows.push(['pH', Sim.fmt(h.pH, 2)]);
        } else if (g.tipe === 'll') {
          rows.push(['Ka', Sim.sci(g.Ka, 2)]);
          rows.push(['Kb', Sim.sci(g.Kb, 2)]);
          rows.push([g.Ka > g.Kb ? 'Ka > Kb → asam' : g.Ka < g.Kb ? 'Ka < Kb → basa' : 'Ka = Kb → netral',
            'pH = ' + Sim.fmt(h.pH, 2)]);
        } else {
          rows.push(['Tidak ada ion yang terhidrolisis', 'pH = 7,00']);
        }
        rows.forEach(function (r, i) {
          const x = HX + 16 + (i % 2) * 250;
          const y = 338 + Math.floor(i / 2) * 18;
          D.text(c, r[0], x, y, { size: 10.5, weight: 500, color: P.faint, base: 'middle' });
          D.text(c, r[1], x + 230, y,
            { size: 10.5, weight: 650, color: P.dim, align: 'r', base: 'middle', mono: true });
        });
      }

      /* ---------- tabel empat jenis ---------- */
      if (sim.get('tabel')) {
        const TY = 384;
        D.roundRect(c, 40, TY, W - 80, 172, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
        D.text(c, 'EMPAT JENIS GARAM DAN SIFATNYA', 58, TY + 20,
          { size: 10.5, weight: 700, color: P.faint, base: 'middle' });

        const kol = ['Jenis garam', 'Hidrolisis', 'Sifat', 'pH', 'Contoh'];
        const lebar = [200, 180, 100, 90, 140];
        let x0 = 58;
        kol.forEach(function (k, i) {
          D.text(c, k, x0, TY + 42, { size: 10, weight: 700, color: P.faint, base: 'middle' });
          x0 += lebar[i];
        });
        D.line(c, 56, TY + 52, W - 56, TY + 52, 'rgba(255,255,255,.14)', 1);

        const isi = [
          { t: 'kk', a: 'Asam kuat + basa kuat', b: 'tidak terhidrolisis', c: 'netral', d: '= 7', e: 'NaCl, KNO₃', w: P.green },
          { t: 'lk', a: 'Asam lemah + basa kuat', b: 'sebagian (anion)', c: 'basa', d: '> 7', e: 'CH₃COONa', w: P.blue },
          { t: 'kl', a: 'Asam kuat + basa lemah', b: 'sebagian (kation)', c: 'asam', d: '< 7', e: 'NH₄Cl', w: P.rose },
          { t: 'll', a: 'Asam lemah + basa lemah', b: 'total (keduanya)', c: 'lihat Ka & Kb', d: 'bergantung', e: 'CH₃COONH₄', w: P.amber }
        ];
        isi.forEach(function (r, i) {
          const y = TY + 74 + i * 24;
          const aktif = r.t === g.tipe;
          if (aktif) D.roundRect(c, 50, y - 12, W - 100, 23, 5, 'rgba(79,209,192,.12)');
          let x = 58;
          [r.a, r.b, r.c, r.d, r.e].forEach(function (s, k) {
            D.text(c, s, x, y, {
              size: 11, weight: aktif ? 650 : 500,
              color: k === 2 ? r.w : (aktif ? P.accent2 : P.dim), base: 'middle'
            });
            x += lebar[k];
          });
        });

        D.text(c, 'Kaidah pokok: sifat larutan ditentukan oleh komponen yang LEBIH KUAT.',
          58, TY + 178 - 8, { size: 11.5, weight: 600, color: P.accent2, base: 'middle' });
      }
    },

    readoutsUpdate: function (sim) {
      const h = hitung(sim);
      const g = h.g;
      sim.readout('sifat', g.sifat.charAt(0).toUpperCase() + g.sifat.slice(1),
        g.sifat === 'asam' ? 'danger' : g.sifat === 'basa' ? 'accent' : null);
      sim.readout('ph', Sim.fmt(h.pH, 2));
      sim.readout('jenis', g.hid);
      sim.readout('kh', h.Kh ? Sim.sci(h.Kh, 2) : '—');
    },

    notes: `
      <p>Garam terbentuk dari reaksi asam dengan basa. Banyak orang mengira semua garam
      bersifat netral, padahal <strong>hanya sebagian</strong> yang demikian. Yang
      menentukan adalah <strong>kekuatan asam dan basa asalnya</strong>.</p>

      <h3>Kaidah pokok</h3>
      <p>Sifat larutan garam ditentukan oleh komponen yang <strong>lebih kuat</strong>.
      Ion yang berasal dari zat <strong>lemah</strong> akan bereaksi dengan air
      (terhidrolisis), sedangkan ion dari zat kuat tidak.</p>

      <table>
        <thead><tr><th>Asal garam</th><th>Hidrolisis</th><th>Sifat</th><th>Contoh</th></tr></thead>
        <tbody>
          <tr><td>Asam kuat + basa kuat</td><td>tidak ada</td><td>netral (pH = 7)</td><td>NaCl, KNO₃</td></tr>
          <tr><td>Asam lemah + basa kuat</td><td>sebagian (anion)</td><td>basa (pH &gt; 7)</td><td>CH₃COONa</td></tr>
          <tr><td>Asam kuat + basa lemah</td><td>sebagian (kation)</td><td>asam (pH &lt; 7)</td><td>NH₄Cl</td></tr>
          <tr><td>Asam lemah + basa lemah</td><td>total</td><td>bergantung Ka dan Kb</td><td>CH₃COONH₄</td></tr>
        </tbody>
      </table>

      <h3>Mengapa CH₃COONa bersifat basa?</h3>
      <p>Garam ini terurai menjadi Na⁺ dan CH₃COO⁻. Ion Na⁺ berasal dari NaOH yang kuat,
      sehingga tidak bereaksi dengan air. Namun CH₃COO⁻ berasal dari asam asetat yang
      lemah, dan ia cukup kuat menarik proton dari air:</p>
      <span class="formula">CH₃COO⁻ + H₂O ⇌ CH₃COOH + OH⁻</span>
      <p>Terbentuknya OH⁻ inilah yang membuat larutan bersifat basa.</p>

      <h3>Rumus perhitungan</h3>
      <span class="formula">Garam asam lemah + basa kuat:
  Kh = Kw / Ka      [OH⁻] = √(Kh × M)

Garam asam kuat + basa lemah:
  Kh = Kw / Kb      [H⁺] = √(Kh × M)

Garam asam lemah + basa lemah:
  [H⁺] = √(Kw × Ka / Kb)</span>

      <p>Perhatikan hal menarik pada garam dari asam lemah dan basa lemah: pH-nya
      <strong>tidak bergantung pada konsentrasi</strong>, hanya pada perbandingan Ka dan
      Kb. Bila Ka = Kb larutannya netral, bila Ka &gt; Kb bersifat asam, dan bila
      Ka &lt; Kb bersifat basa.</p>

      <h3>Makin lemah asamnya, makin basa garamnya</h3>
      <p>Bandingkan tiga garam natrium pada konsentrasi sama: NaF (dari HF, Ka 6,8×10⁻⁴),
      CH₃COONa (Ka 1,8×10⁻⁵), dan KCN (dari HCN, Ka 6,2×10⁻¹⁰). Makin kecil Ka asam
      asalnya, makin kuat basa konjugasinya menarik proton, sehingga pH larutannya makin
      tinggi.</p>

      <div class="callout" data-tone="tip">
        <strong>Penerapan sehari-hari</strong>
        Soda kue (NaHCO₃) bersifat sedikit basa karena berasal dari asam karbonat yang
        lemah. Inilah sebabnya soda kue dapat menetralkan asam lambung dan mengembangkan
        adonan kue saat bereaksi dengan bahan asam.
      </div>
    `,

    explore: [
      'Larutkan <strong>NaCl</strong>. Mengapa pH-nya tepat 7?',
      'Bandingkan <strong>CH₃COONa</strong> dan <strong>NH₄Cl</strong> pada konsentrasi sama. Mengapa arahnya berlawanan?',
      'Urutkan <strong>NaF</strong>, <strong>CH₃COONa</strong>, dan <strong>KCN</strong> menurut pH-nya. Hubungkan dengan nilai Ka asam asalnya.',
      'Ubah konsentrasi <strong>CH₃COONH₄</strong>. Mengapa pH-nya tidak ikut berubah?'
    ],

    quiz: [
      {
        q: 'Larutan NH₄Cl bersifat asam. Hal ini disebabkan oleh…',
        options: [
          'Ion Cl⁻ bereaksi dengan air menghasilkan H⁺',
          'Ion NH₄⁺ bereaksi dengan air menghasilkan H₃O⁺',
          'Kedua ionnya bereaksi dengan air',
          'NH₄Cl adalah asam kuat'
        ],
        answer: 1,
        explain: 'NH₄⁺ berasal dari basa lemah NH₃, sehingga ia terhidrolisis: NH₄⁺ + H₂O ⇌ NH₃ + H₃O⁺. Ion Cl⁻ berasal dari HCl yang kuat sehingga tidak bereaksi dengan air.'
      },
      {
        q: 'Manakah garam yang larutannya bersifat netral?',
        options: ['CH₃COONa', 'NH₄Cl', 'K₂SO₄', 'NaF'],
        answer: 2,
        explain: 'K₂SO₄ berasal dari KOH (basa kuat) dan H₂SO₄ (asam kuat). Tidak ada ion yang terhidrolisis, sehingga larutannya netral dengan pH 7.'
      },
      {
        q: 'Tiga garam natrium berikut punya konsentrasi sama. Manakah yang pH-nya paling tinggi?',
        options: ['NaF (Ka HF = 6,8×10⁻⁴)', 'CH₃COONa (Ka = 1,8×10⁻⁵)', 'KCN (Ka HCN = 6,2×10⁻¹⁰)', 'NaCl'],
        answer: 2,
        explain: 'Makin kecil Ka asam asalnya, makin kuat basa konjugasinya. HCN adalah asam paling lemah di antara ketiganya, sehingga CN⁻ paling kuat menarik proton dari air dan menghasilkan pH tertinggi.'
      },
      {
        q: 'Mengapa pH larutan CH₃COONH₄ tidak bergantung pada konsentrasinya?',
        options: [
          'Karena garam ini tidak terhidrolisis',
          'Karena rumus [H⁺] = √(Kw × Ka / Kb) tidak memuat konsentrasi',
          'Karena konsentrasinya selalu sama',
          'Karena garam ini adalah penyangga'
        ],
        answer: 1,
        explain: 'Pada hidrolisis total, kation dan anion sama-sama terhidrolisis. Faktor konsentrasi saling meniadakan, sehingga pH hanya ditentukan oleh perbandingan Ka dan Kb.'
      }
    ]
  });
})();
