/* Larutan Elektrolit dan Nonelektrolit — Fase E
   Celupkan elektrode ke berbagai larutan; nyala lampu, gelembung gas, dan
   gerak ion menunjukkan derajat ionisasinya. */

(function () {
  'use strict';

  const D = Sim.Draw, P = Sim.P;
  const C = Chem;

  const W = 790, H = 560;

  // alfa = derajat ionisasi (0..1)
  const LARUTAN = [
    { n: 'Asam klorida (HCl)',      alfa: 1.00, jenis: 'Elektrolit kuat', ion: ['H⁺', 'Cl⁻'], gol: 'Asam kuat', w: '#e8eef2' },
    { n: 'Asam sulfat (H₂SO₄)',     alfa: 1.00, jenis: 'Elektrolit kuat', ion: ['H⁺', 'SO₄²⁻'], gol: 'Asam kuat', w: '#eceef0' },
    { n: 'Natrium hidroksida (NaOH)', alfa: 1.00, jenis: 'Elektrolit kuat', ion: ['Na⁺', 'OH⁻'], gol: 'Basa kuat', w: '#eef2f4' },
    { n: 'Garam dapur (NaCl)',      alfa: 1.00, jenis: 'Elektrolit kuat', ion: ['Na⁺', 'Cl⁻'], gol: 'Garam', w: '#e4ecf0' },
    { n: 'Kalium nitrat (KNO₃)',    alfa: 1.00, jenis: 'Elektrolit kuat', ion: ['K⁺', 'NO₃⁻'], gol: 'Garam', w: '#e8ecf0' },
    { n: 'Asam asetat (CH₃COOH)',   alfa: 0.013, jenis: 'Elektrolit lemah', ion: ['H⁺', 'CH₃COO⁻'], gol: 'Asam lemah', w: '#f0e8c8' },
    { n: 'Amonia (NH₃)',            alfa: 0.013, jenis: 'Elektrolit lemah', ion: ['NH₄⁺', 'OH⁻'], gol: 'Basa lemah', w: '#eaf0f4' },
    { n: 'Asam karbonat (H₂CO₃)',   alfa: 0.002, jenis: 'Elektrolit lemah', ion: ['H⁺', 'HCO₃⁻'], gol: 'Asam lemah', w: '#e8eef2' },
    { n: 'Asam sitrat',             alfa: 0.027, jenis: 'Elektrolit lemah', ion: ['H⁺', 'sitrat⁻'], gol: 'Asam lemah', w: '#f0ecd0' },
    { n: 'Larutan gula',            alfa: 0.00, jenis: 'Nonelektrolit', ion: [], gol: 'Senyawa kovalen', w: '#eef0e8' },
    { n: 'Larutan urea',            alfa: 0.00, jenis: 'Nonelektrolit', ion: [], gol: 'Senyawa kovalen', w: '#f0f0ea' },
    { n: 'Etanol',                  alfa: 0.00, jenis: 'Nonelektrolit', ion: [], gol: 'Senyawa kovalen', w: '#eef2f4' },
    { n: 'Air murni',               alfa: 0.0000002, jenis: 'Nonelektrolit', ion: ['H⁺', 'OH⁻'], gol: 'Pelarut', w: '#dfe8ee' }
  ];

  const GX = 120, GY = 180, GW = 210, GH = 170;

  function larutanAktif(sim) { return LARUTAN[parseInt(sim.get('larutan'), 10) || 0]; }

  function siapkan(sim) {
    sim.data.ion = [];
    sim.data.celup = 0;
    sim.data.gelembung = [];
    buatIon(sim);
  }

  function buatIon(sim) {
    const l = larutanAktif(sim);
    const konsen = sim.get('konsentrasi');
    const nTotal = Math.round(16 + konsen * 14);
    const list = [];
    for (let i = 0; i < nTotal; i++) {
      // sebagian terionisasi, sisanya tetap sebagai molekul utuh
      const terion = (i / nTotal) < l.alfa;
      list.push({
        x: Sim.rnd(GX + 16, GX + GW - 16),
        y: Sim.rnd(GY + 30, GY + GH - 16),
        vx: Sim.rnd(-16, 16), vy: Sim.rnd(-16, 16),
        terion: terion,
        muatan: terion ? (i % 2 === 0 ? 1 : -1) : 0,
        r: terion ? 7 : 9
      });
    }
    sim.data.ion = list;
  }

  /** Daya hantar relatif = alfa × konsentrasi. */
  function hantaran(sim) {
    const l = larutanAktif(sim);
    return Math.min(1, l.alfa * sim.get('konsentrasi') * 1.1);
  }

  Sim.create({
    title: 'Larutan Elektrolit dan Nonelektrolit',
    subtitle: 'Larutan menghantarkan listrik hanya bila mengandung ion yang bebas bergerak. Nyala lampu menunjukkan seberapa banyak ion yang terbentuk.',
    fase: 'E', jenjang: 'SMA Kelas 10',
    topik: ['Elektrolit', 'Daya Hantar'],
    stage: { w: W, h: H },

    controls: [
      {
        title: 'Larutan yang diuji',
        items: [
          { type: 'select', id: 'larutan', value: 0, label: 'Pilih larutan',
            options: LARUTAN.map(function (l, i) { return { value: i, label: l.n }; }) },
          { type: 'slider', id: 'konsentrasi', value: 1, min: 0.1, max: 2, step: 0.1,
            label: 'Konsentrasi', unit: 'M', dec: 1,
            hint: 'Konsentrasi mengubah banyaknya ion, tetapi tidak mengubah derajat ionisasinya.' },
          { type: 'buttons', label: '', items: [
            { label: '↓ Celupkan elektrode', primary: true, onClick: function (sim) {
              sim.data.celupTarget = 1;
            } },
            { label: '↑ Angkat', onClick: function (sim) { sim.data.celupTarget = 0; } }
          ] }
        ]
      },
      {
        title: 'Tampilan',
        items: [
          { type: 'toggle', id: 'ion', value: true, label: 'Tampilkan ion dan molekul' },
          { type: 'toggle', id: 'tarik', value: true, label: 'Ion tertarik ke elektrode',
            hint: 'Ion positif menuju katode, ion negatif menuju anode.' },
          { type: 'toggle', id: 'banding', value: true, label: 'Tabel perbandingan' }
        ]
      }
    ],

    readouts: [
      { id: 'jenis', label: 'Jenis larutan', tone: 'accent' },
      { id: 'alfa', label: 'Derajat ionisasi α' },
      { id: 'lampu', label: 'Nyala lampu' },
      { id: 'gelembung', label: 'Gelembung gas' }
    ],

    setup: function (sim) { sim.data.celupTarget = 0; siapkan(sim); },
    reset: function (sim) { sim.data.celupTarget = 0; siapkan(sim); },
    onChange: function (sim, id) {
      if (id === 'larutan' || id === 'konsentrasi') buatIon(sim);
    },

    update: function (sim, dt) {
      const target = sim.data.celupTarget || 0;
      sim.data.celup += (target - sim.data.celup) * Math.min(1, dt * 4);
      const aktif = sim.data.celup > 0.8;
      const h = hantaran(sim);

      const katodeX = GX + 46, anodeX = GX + GW - 46;
      sim.data.ion.forEach(function (p) {
        if (aktif && sim.get('tarik') && p.terion) {
          const tujuan = p.muatan > 0 ? katodeX : anodeX;
          p.vx += (tujuan - p.x) * 0.9 * dt;
        }
        p.vx += Sim.rnd(-1, 1) * 42 * dt;
        p.vy += Sim.rnd(-1, 1) * 42 * dt;
        const v = Math.hypot(p.vx, p.vy);
        if (v > 44) { p.vx *= 44 / v; p.vy *= 44 / v; }
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.x < GX + 12) { p.x = GX + 12; p.vx = Math.abs(p.vx); }
        if (p.x > GX + GW - 12) { p.x = GX + GW - 12; p.vx = -Math.abs(p.vx); }
        if (p.y < GY + 26) { p.y = GY + 26; p.vy = Math.abs(p.vy); }
        if (p.y > GY + GH - 12) { p.y = GY + GH - 12; p.vy = -Math.abs(p.vy); }
      });

      // gelembung di elektrode
      if (aktif && h > 0.02 && Math.random() < h * dt * 22) {
        sim.data.gelembung.push({
          x: (Math.random() < 0.5 ? katodeX : anodeX) + Sim.rnd(-8, 8),
          y: GY + GH - 20, r: Sim.rnd(2, 4.6)
        });
      }
      sim.data.gelembung.forEach(function (g) { g.y -= 46 * dt; });
      sim.data.gelembung = sim.data.gelembung.filter(function (g) { return g.y > GY + 28; });
    },

    draw: function (c, sim) {
      const l = larutanAktif(sim);
      const h = hantaran(sim);
      const celup = sim.data.celup;
      const aktif = celup > 0.8;

      /* ---------- rangkaian ---------- */
      const lampX = GX + GW / 2, lampY = 76;
      // baterai
      D.roundRect(c, 460, 60, 56, 32, 5, '#3b434b', 'rgba(255,255,255,.3)', 1.4);
      D.text(c, '+   −', 488, 76, { size: 12, weight: 700, color: P.dim, align: 'c', base: 'middle' });
      D.text(c, 'baterai', 488, 104, { size: 10.5, weight: 600, color: P.faint, align: 'c', base: 'middle' });

      // kabel
      const nyala = aktif ? h : 0;
      const warnaKabel = nyala > 0.02 ? D.alpha('#f0d04a', 0.3 + nyala * 0.5) : 'rgba(230,236,240,.3)';
      D.line(c, 460, 76, lampX + 26, 76, warnaKabel, 2.4);
      D.line(c, lampX - 26, 76, GX + 46, 76, warnaKabel, 2.4);
      D.line(c, GX + 46, 76, GX + 46, GY - 10 + celup * 60, warnaKabel, 2.4);
      D.line(c, 516, 76, 560, 76, warnaKabel, 2.4);
      D.line(c, 560, 76, 560, GY + 20, warnaKabel, 2.4);
      D.line(c, 560, GY + 20, GX + GW - 46, GY + 20, warnaKabel, 2.4);
      D.line(c, GX + GW - 46, GY + 20, GX + GW - 46, GY - 10 + celup * 60, warnaKabel, 2.4);

      // lampu
      if (nyala > 0.02) {
        D.circle(c, lampX, lampY, 22 + nyala * 22, D.alpha('#f0d04a', nyala * 0.26));
      }
      D.circle(c, lampX, lampY, 18,
        nyala > 0.02 ? D.mix('#4a5057', '#f0d04a', Math.min(1, nyala * 2.4)) : '#4a5057',
        'rgba(255,255,255,.3)', 1.6);
      if (nyala > 0.25) {
        for (let i = 0; i < 8; i++) {
          const ang = i / 8 * Math.PI * 2;
          D.line(c, lampX + Math.cos(ang) * 24, lampY + Math.sin(ang) * 24,
            lampX + Math.cos(ang) * (26 + nyala * 10), lampY + Math.sin(ang) * (26 + nyala * 10),
            D.alpha('#f0d04a', nyala), 2.2);
        }
      }
      D.text(c, nyala > 0.5 ? 'TERANG' : nyala > 0.03 ? 'REDUP' : 'PADAM',
        lampX, lampY + 38, {
          size: 11.5, weight: 700, align: 'c', base: 'middle',
          color: nyala > 0.5 ? '#f0d04a' : nyala > 0.03 ? P.amber : P.faint
        });

      /* ---------- gelas + elektrode ---------- */
      D.beaker(c, GX, GY, GW, GH, 0.78, D.alpha(l.w, 0.55));

      const elY = GY - 10 + celup * 60;
      [[GX + 46, '#c4703a', 'katode (−)'], [GX + GW - 46, '#aab4bd', 'anode (+)']].forEach(function (q) {
        D.roundRect(c, q[0] - 7, elY, 14, 120, 3, q[1], 'rgba(255,255,255,.3)', 1.3);
        D.text(c, q[2], q[0], GY + GH + 20,
          { size: 10, weight: 600, color: P.faint, align: 'c', base: 'middle' });
      });

      // ion & molekul
      if (sim.get('ion')) {
        sim.data.ion.forEach(function (p) {
          if (p.terion) {
            const warna = p.muatan > 0 ? '#ef6a52' : '#5b9bf5';
            D.circle(c, p.x, p.y, p.r, warna, 'rgba(0,0,0,.25)', 1);
            D.text(c, p.muatan > 0 ? '+' : '−', p.x, p.y,
              { size: 10, weight: 800, color: '#fff', align: 'c', base: 'middle' });
          } else {
            D.circle(c, p.x, p.y, p.r, D.alpha('#9aa4ae', 0.75), 'rgba(0,0,0,.2)', 1);
          }
        });
      }

      // gelembung
      sim.data.gelembung.forEach(function (g) {
        D.circle(c, g.x, g.y, g.r, null, 'rgba(255,255,255,.55)', 1.2);
      });

      D.text(c, l.n, GX + GW / 2, GY + GH + 46,
        { size: 14, weight: 700, color: P.text, align: 'c', base: 'middle' });

      if (!aktif) {
        D.text(c, 'tekan ↓ Celupkan elektrode', GX + GW / 2, GY + GH + 66,
          { size: 11.5, weight: 500, color: P.faint, align: 'c', base: 'middle' });
      }

      /* ---------- panel hasil ---------- */
      const RX = 400, RW = 358;
      D.roundRect(c, RX, 140, RW, 180, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'HASIL PENGAMATAN', RX + 16, 160,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });

      const warnaJenis = l.jenis === 'Elektrolit kuat' ? P.accent
        : l.jenis === 'Elektrolit lemah' ? P.amber : P.faint;
      D.text(c, l.jenis.toUpperCase(), RX + 16, 186,
        { size: 18, weight: 800, color: warnaJenis, base: 'middle' });
      D.text(c, l.gol, RX + 16, 208, { size: 12, weight: 600, color: P.dim, base: 'middle' });

      // bilah derajat ionisasi
      D.text(c, 'Derajat ionisasi (α)', RX + 16, 234,
        { size: 11, weight: 500, color: P.faint, base: 'middle' });
      D.roundRect(c, RX + 16, 244, RW - 100, 16, 8, 'rgba(255,255,255,.07)');
      D.roundRect(c, RX + 16, 244, (RW - 100) * Math.min(1, l.alfa), 16, 8, warnaJenis);
      D.text(c, l.alfa >= 0.99 ? 'α = 1 (terionisasi sempurna)'
        : l.alfa > 0 ? 'α = ' + Sim.sci(l.alfa, 2) : 'α = 0',
        RX + RW - 16, 252, { size: 11.5, weight: 700, color: warnaJenis, align: 'r', base: 'middle' });

      // reaksi ionisasi
      D.text(c, 'Reaksi ionisasi dalam air:', RX + 16, 282,
        { size: 11, weight: 500, color: P.faint, base: 'middle' });
      D.text(c, l.ion.length
        ? l.n.replace(/.*\(|\)/g, '') + ' ' + (l.alfa >= 0.99 ? '→' : '⇌') + ' ' + l.ion.join(' + ')
        : 'tidak mengalami ionisasi — tetap sebagai molekul utuh',
        RX + 16, 302, { size: 13.5, weight: 650, color: P.accent2, base: 'middle' });

      /* ---------- tabel perbandingan ---------- */
      if (sim.get('banding')) {
        const TY = 344;
        D.roundRect(c, 40, TY, W - 80, 168, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
        D.text(c, 'PERBANDINGAN TIGA JENIS LARUTAN', 58, TY + 20,
          { size: 10.5, weight: 700, color: P.faint, base: 'middle' });

        const kol = ['', 'Elektrolit kuat', 'Elektrolit lemah', 'Nonelektrolit'];
        const lebar = (W - 116) / 4;
        kol.forEach(function (k, i) {
          D.text(c, k, 58 + i * lebar, TY + 44, {
            size: 11.5, weight: 700, base: 'middle',
            color: i === 0 ? P.faint : [null, P.accent, P.amber, P.faint][i]
          });
        });

        const isi = [
          ['Derajat ionisasi', 'α = 1', '0 < α < 1', 'α = 0'],
          ['Jenis partikel', 'ion semua', 'ion + molekul', 'molekul semua'],
          ['Nyala lampu', 'terang', 'redup', 'padam'],
          ['Gelembung gas', 'banyak', 'sedikit', 'tidak ada'],
          ['Contoh', 'HCl, NaOH, NaCl', 'CH₃COOH, NH₃', 'gula, urea, etanol']
        ];
        isi.forEach(function (b, i) {
          const y = TY + 68 + i * 20;
          b.forEach(function (s, k) {
            const sorotKolom =
              (l.jenis === 'Elektrolit kuat' && k === 1) ||
              (l.jenis === 'Elektrolit lemah' && k === 2) ||
              (l.jenis === 'Nonelektrolit' && k === 3);
            D.text(c, s, 58 + k * lebar, y, {
              size: 11.5, weight: k === 0 ? 600 : (sorotKolom ? 700 : 500),
              color: k === 0 ? P.faint : (sorotKolom ? P.accent2 : P.dim), base: 'middle'
            });
          });
        });

        // sorot kolom aktif
        const kolAktif = l.jenis === 'Elektrolit kuat' ? 1 : l.jenis === 'Elektrolit lemah' ? 2 : 3;
        D.roundRect(c, 50 + kolAktif * lebar, TY + 32, lebar - 10, 142, 7,
          'rgba(79,209,192,.07)', 'rgba(79,209,192,.3)', 1.3);
      }
    },

    readoutsUpdate: function (sim) {
      const l = larutanAktif(sim);
      const h = hantaran(sim);
      const aktif = sim.data.celup > 0.8;
      sim.readout('jenis', l.jenis);
      sim.readout('alfa', l.alfa >= 0.99 ? '1,00' : Sim.sci(l.alfa, 2));
      sim.readout('lampu', !aktif ? '—' : h > 0.5 ? 'Terang' : h > 0.03 ? 'Redup' : 'Padam',
        !aktif ? null : h > 0.5 ? 'accent' : h > 0.03 ? 'warn' : null);
      sim.readout('gelembung', !aktif ? '—' : h > 0.5 ? 'Banyak' : h > 0.03 ? 'Sedikit' : 'Tidak ada');
    },

    notes: `
      <p>Listrik mengalir bila ada <strong>muatan yang dapat bergerak bebas</strong>.
      Dalam logam, pembawa muatannya adalah elektron. Dalam larutan, pembawanya adalah
      <strong>ion</strong>. Karena itu larutan hanya menghantarkan listrik bila
      mengandung ion.</p>

      <h3>Tiga golongan larutan</h3>
      <table>
        <thead><tr><th>Golongan</th><th>Derajat ionisasi</th><th>Nyala lampu</th></tr></thead>
        <tbody>
          <tr><td>Elektrolit kuat</td><td>α = 1 (sempurna)</td><td>terang</td></tr>
          <tr><td>Elektrolit lemah</td><td>0 &lt; α &lt; 1 (sebagian)</td><td>redup</td></tr>
          <tr><td>Nonelektrolit</td><td>α = 0 (tidak terionisasi)</td><td>padam</td></tr>
        </tbody>
      </table>

      <h3>Derajat ionisasi</h3>
      <span class="formula">α = jumlah zat yang terionisasi ÷ jumlah zat mula-mula</span>
      <p>Pada elektrolit kuat, reaksi ionisasi ditulis dengan panah satu arah (→) karena
      berlangsung sempurna. Pada elektrolit lemah dipakai panah bolak-balik (⇌) karena
      hanya sebagian yang terionisasi dan terjadi kesetimbangan.</p>

      <h3>Yang menentukan: jenis ikatan</h3>
      <ul>
        <li><strong>Senyawa ion</strong> (NaCl, KNO₃) — sudah tersusun dari ion. Saat
            dilarutkan, ionnya langsung terpisah dan bebas bergerak.</li>
        <li><strong>Senyawa kovalen polar</strong> (HCl, CH₃COOH) — tidak mengandung ion,
            tetapi dapat terionisasi dalam air. Seberapa banyak yang terionisasi
            menentukan kuat atau lemahnya.</li>
        <li><strong>Senyawa kovalen nonpolar</strong> (gula, urea, etanol) — tidak
            terionisasi sama sekali. Molekulnya larut tetapi tetap utuh.</li>
      </ul>

      <h3>Gula larut tetapi tidak menghantar</h3>
      <p>Ini sering membingungkan. Gula memang larut sempurna dalam air, tetapi yang
      tersebar adalah <strong>molekul gula yang utuh dan netral</strong>, bukan ion.
      Tanpa muatan yang bergerak, tidak ada arus listrik. Larut dan terionisasi adalah
      dua hal yang berbeda.</p>

      <h3>Pengaruh konsentrasi</h3>
      <p>Memperbesar konsentrasi menambah <strong>jumlah ion</strong>, sehingga lampu
      makin terang. Tetapi konsentrasi <strong>tidak mengubah derajat ionisasi</strong> —
      asam asetat pekat tetaplah elektrolit lemah.</p>

      <div class="callout" data-tone="warn">
        <strong>Keselamatan listrik</strong>
        Air murni sebenarnya elektrolit yang sangat lemah. Namun air keran, air hujan,
        dan keringat mengandung garam terlarut yang membuatnya menghantar listrik dengan
        baik. Inilah sebabnya peralatan listrik dan air adalah gabungan yang berbahaya.
      </div>
    `,

    explore: [
      'Uji <strong>HCl</strong> lalu <strong>Asam asetat</strong> pada konsentrasi sama. Bandingkan nyala lampunya.',
      'Uji <strong>Larutan gula</strong>. Molekulnya jelas larut — mengapa lampunya tetap padam?',
      'Naikkan konsentrasi asam asetat sampai 2 M. Apakah lampunya menjadi seterang HCl?',
      'Matikan <strong>Ion tertarik ke elektrode</strong>, lalu nyalakan kembali. Perhatikan arah gerak ion positif dan negatif.'
    ],

    quiz: [
      {
        q: 'Larutan gula tidak menghantarkan listrik meskipun gulanya larut sempurna. Alasannya adalah…',
        options: [
          'Gula tidak benar-benar larut',
          'Gula larut sebagai molekul netral, bukan sebagai ion',
          'Gula memiliki derajat ionisasi 1',
          'Air murni tidak dapat menghantarkan listrik'
        ],
        answer: 1,
        explain: 'Hantaran listrik memerlukan partikel bermuatan yang bergerak bebas. Gula larut sebagai molekul utuh yang netral, sehingga tidak ada pembawa muatan.'
      },
      {
        q: 'Suatu larutan memberi nyala lampu redup dan sedikit gelembung. Larutan ini tergolong…',
        options: ['Elektrolit kuat', 'Elektrolit lemah', 'Nonelektrolit', 'Bukan larutan'],
        answer: 1,
        explain: 'Nyala redup menunjukkan ion yang terbentuk hanya sedikit, yang berarti zat terlarut hanya terionisasi sebagian. Ini ciri elektrolit lemah.'
      },
      {
        q: 'Mengapa HCl tergolong elektrolit kuat padahal merupakan senyawa kovalen?',
        options: [
          'Karena HCl berwujud gas',
          'Karena HCl terionisasi sempurna dalam air menjadi H⁺ dan Cl⁻',
          'Karena HCl adalah senyawa ion',
          'Karena HCl tidak larut dalam air'
        ],
        answer: 1,
        explain: 'HCl memang berikatan kovalen polar, tetapi dalam air ikatannya putus sempurna menghasilkan ion H⁺ dan Cl⁻. Derajat ionisasinya 1, sehingga tergolong elektrolit kuat.'
      },
      {
        q: 'Konsentrasi larutan asam asetat dinaikkan dua kali lipat. Apa yang terjadi?',
        options: [
          'Derajat ionisasinya menjadi dua kali lipat',
          'Berubah menjadi elektrolit kuat',
          'Jumlah ion bertambah sehingga lampu lebih terang, tetapi derajat ionisasinya tetap kecil',
          'Tidak ada perubahan sama sekali'
        ],
        answer: 2,
        explain: 'Menambah konsentrasi menambah jumlah ion total, sehingga hantarannya naik. Namun derajat ionisasi adalah sifat zat itu sendiri dan tidak berubah menjadi besar hanya karena larutan dipekatkan.'
      }
    ]
  });
})();
