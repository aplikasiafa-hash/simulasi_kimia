/* Hidrokarbon dan Minyak Bumi — Fase E
   Bangun rantai karbon, temukan isomer, dan jalankan menara distilasi
   bertingkat minyak bumi. */

(function () {
  'use strict';

  const D = Sim.Draw, P = Sim.P;
  const C = Chem;

  const W = 790, H = 570;

  /* --- jumlah isomer rangka alkana --- */
  const ISOMER = { 1: 1, 2: 1, 3: 1, 4: 2, 5: 3, 6: 5, 7: 9, 8: 18, 9: 35, 10: 75 };

  const ISOMER_C5 = [
    { n: 'n-pentana', cabang: [], td: 36.1 },
    { n: '2-metilbutana (isopentana)', cabang: [{ pos: 1, n: 1 }], td: 27.8 },
    { n: '2,2-dimetilpropana (neopentana)', cabang: [{ pos: 1, n: 2 }], td: 9.5 }
  ];

  const FRAKSI = [
    { n: 'Gas',          c: 'C₁–C₄',   td: '< 20 °C',    guna: 'LPG, bahan bakar kompor',    w: '#9fd4ee', tinggi: 0.92 },
    { n: 'Bensin',       c: 'C₅–C₁₀',  td: '40–180 °C',  guna: 'Bahan bakar kendaraan',      w: '#f0d04a', tinggi: 0.76 },
    { n: 'Nafta',        c: 'C₆–C₁₂',  td: '70–200 °C',  guna: 'Bahan baku industri plastik', w: '#f0a94a', tinggi: 0.62 },
    { n: 'Kerosin',      c: 'C₁₂–C₁₆', td: '175–325 °C', guna: 'Avtur dan minyak tanah',      w: '#e8884a', tinggi: 0.48 },
    { n: 'Solar',        c: 'C₁₅–C₁₈', td: '250–350 °C', guna: 'Mesin diesel',                w: '#c4703a', tinggi: 0.34 },
    { n: 'Oli & lilin',  c: 'C₁₈–C₃₀', td: '300–400 °C', guna: 'Pelumas mesin',               w: '#8a5a30', tinggi: 0.20 },
    { n: 'Residu/aspal', c: '> C₃₀',   td: '> 400 °C',   guna: 'Pengeras jalan',              w: '#4a3a30', tinggi: 0.06 }
  ];

  function siapkan(sim) {
    sim.data.a = 0;
    sim.data.jalan = false;
  }

  /** Rumus molekul deret homolog. */
  function rumus(n, jenis) {
    if (jenis === 'alkana') return 'C' + n + 'H' + (2 * n + 2);
    if (jenis === 'alkena') return 'C' + n + 'H' + (2 * n);
    return 'C' + n + 'H' + (2 * n - 2);
  }

  function nama(n, jenis) {
    const akar = ['', 'met', 'et', 'prop', 'but', 'pent', 'heks', 'hept', 'okt', 'non', 'dek'][n];
    return akar + (jenis === 'alkana' ? 'ana' : jenis === 'alkena' ? 'ena' : 'una');
  }

  /** Perkiraan titik didih alkana rantai lurus. */
  function titikDidih(n, jenis) {
    const dasar = C.ALKANA[n - 1] ? C.ALKANA[n - 1].td : -160 + n * 32;
    return jenis === 'alkana' ? dasar : dasar - (jenis === 'alkena' ? 6 : 2);
  }

  Sim.create({
    title: 'Hidrokarbon dan Minyak Bumi',
    subtitle: 'Karbon mampu mengikat dirinya sendiri menjadi rantai panjang. Dari sifat itu lahir jutaan senyawa — dan seluruh industri minyak bumi.',
    fase: 'E', jenjang: 'SMA Kelas 10',
    topik: ['Hidrokarbon', 'Isomer', 'Minyak Bumi'],
    stage: { w: W, h: H },

    controls: [
      {
        title: 'Mode',
        items: [
          { type: 'segment', id: 'mode', value: 'rantai', label: '',
            options: [
              { value: 'rantai', label: 'Rantai' },
              { value: 'isomer', label: 'Isomer' },
              { value: 'distilasi', label: 'Distilasi' }
            ] }
        ]
      },
      {
        title: 'Membangun molekul',
        items: [
          { type: 'slider', id: 'n', value: 5, min: 1, max: 10, step: 1,
            label: 'Jumlah atom karbon', dec: 0 },
          { type: 'segment', id: 'jenis', value: 'alkana', label: 'Deret homolog',
            options: [
              { value: 'alkana', label: 'Alkana' },
              { value: 'alkena', label: 'Alkena' },
              { value: 'alkuna', label: 'Alkuna' }
            ],
            hint: 'Alkana jenuh (ikatan tunggal), alkena rangkap dua, alkuna rangkap tiga.' },
          { type: 'toggle', id: 'hidrogen', value: true, label: 'Tampilkan atom H' }
        ]
      },
      {
        title: 'Menara distilasi',
        items: [
          { type: 'buttons', label: '', items: [
            { label: '▶ Jalankan distilasi', primary: true, onClick: function (sim) {
              sim.set('mode', 'distilasi');
              sim.data.jalan = true; sim.data.a = 0;
            } }
          ] },
          { type: 'toggle', id: 'guna', value: true, label: 'Tampilkan kegunaan fraksi' }
        ]
      }
    ],

    readouts: [
      { id: 'rumus', label: 'Rumus molekul', tone: 'accent' },
      { id: 'nama', label: 'Nama senyawa' },
      { id: 'isomer', label: 'Jumlah isomer' },
      { id: 'td', label: 'Titik didih' }
    ],

    setup: siapkan,
    reset: siapkan,

    update: function (sim, dt) {
      if (sim.data.jalan) {
        sim.data.a += dt * 0.35;
        if (sim.data.a >= 1) { sim.data.a = 1; sim.data.jalan = false; }
      }
    },

    draw: function (c, sim) {
      const mode = sim.get('mode');
      const n = Math.round(sim.get('n'));
      const jenis = sim.get('jenis');

      /* ============================================== MODE RANTAI ===== */
      if (mode === 'rantai') {
        D.text(c, 'DERET HOMOLOG ' + jenis.toUpperCase(), 40, 44,
          { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
        D.text(c, nama(n, jenis) + '  ·  ' + Sim.formula(rumus(n, jenis)), 40, 74,
          { size: 24, weight: 700, color: P.accent2, base: 'middle' });

        // gambar rantai zig-zag
        const bx = 90, by = 190, dx = Math.min(72, 560 / Math.max(n, 1)), dy = 30;
        const pos = [];
        for (let i = 0; i < n; i++) {
          pos.push({ x: bx + i * dx, y: by + (i % 2 === 0 ? 0 : dy) });
        }
        // ikatan C–C
        for (let i = 0; i < n - 1; i++) {
          const rangkap = (jenis === 'alkena' && i === 0) ? 2
            : (jenis === 'alkuna' && i === 0) ? 3 : 1;
          const a = pos[i], b = pos[i + 1];
          const dxn = b.x - a.x, dyn = b.y - a.y;
          const len = Math.hypot(dxn, dyn);
          const nx = -dyn / len, ny = dxn / len;
          for (let k = 0; k < rangkap; k++) {
            const off = (k - (rangkap - 1) / 2) * 5.5;
            D.line(c, a.x + nx * off, a.y + ny * off, b.x + nx * off, b.y + ny * off,
              rangkap > 1 ? P.amber : 'rgba(255,255,255,.4)', 3);
          }
        }
        // atom H
        if (sim.get('hidrogen')) {
          pos.forEach(function (p, i) {
            let nH = 2;
            if (i === 0 || i === n - 1) nH = 3;
            if (n === 1) nH = 4;
            if (jenis === 'alkena' && i < 2) nH -= 1;
            if (jenis === 'alkuna' && i < 2) nH -= 2;
            nH = Math.max(0, nH);
            const arah = [[0, -1], [0, 1], [-0.8, -0.6], [0.8, -0.6]];
            for (let k = 0; k < nH; k++) {
              const a = arah[k % 4];
              const hx = p.x + a[0] * 30, hy = p.y + a[1] * 30;
              D.line(c, p.x, p.y, hx, hy, 'rgba(255,255,255,.2)', 2);
              D.atom(c, hx, hy, 9, C.warnaAtom('H'), 'H', { size: 9 });
            }
          });
        }
        pos.forEach(function (p) {
          D.atom(c, p.x, p.y, 16, C.warnaAtom('C'), 'C', { size: 13 });
        });

        // tabel deret homolog
        const TY = 300;
        D.roundRect(c, 40, TY, W - 80, 170, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
        D.text(c, 'DERET HOMOLOG — PERHATIKAN KENAIKAN TITIK DIDIHNYA', 58, TY + 20,
          { size: 10.5, weight: 700, color: P.faint, base: 'middle' });

        const map = Plot.axes(c, {
          x: 420, y: TY + 36, w: 310, h: 112,
          xmin: 0.5, xmax: 10.5, ymin: -180, ymax: 190,
          xlabel: 'jumlah atom C', ylabel: '°C',
          judul: 'Titik didih alkana', xticks: 5, yticks: 4
        });
        const titik = [];
        for (let i = 1; i <= 10; i++) titik.push([i, titikDidih(i, 'alkana')]);
        Plot.line(c, map, titik, { color: P.accent, lw: 2.2 });
        Plot.titik(c, map, n, titikDidih(n, jenis), { r: 5, color: '#fff', halo: true });
        Plot.acuan(c, map, { y: 25, color: 'rgba(255,255,255,.3)', label: 'suhu ruang' });

        for (let i = 1; i <= 6; i++) {
          const y = TY + 46 + (i - 1) * 21;
          const aktif = i === n;
          if (aktif) D.roundRect(c, 50, y - 10, 350, 20, 4, 'rgba(79,209,192,.12)');
          D.text(c, nama(i, 'alkana'), 58, y,
            { size: 11.5, weight: aktif ? 700 : 500, color: aktif ? P.accent2 : P.dim, base: 'middle' });
          D.text(c, Sim.formula(rumus(i, 'alkana')), 170, y,
            { size: 11.5, weight: 600, color: aktif ? P.accent2 : P.dim, base: 'middle', mono: true });
          D.text(c, Sim.fmt(titikDidih(i, 'alkana'), 1) + ' °C', 280, y,
            { size: 11.5, weight: 500, color: P.dim, base: 'middle', mono: true });
          D.text(c, ISOMER[i] + ' isomer', 350, y,
            { size: 11, weight: 500, color: P.faint, base: 'middle' });
        }

      /* ============================================== MODE ISOMER ===== */
      } else if (mode === 'isomer') {
        D.text(c, 'ISOMER RANGKA — RUMUS SAMA, STRUKTUR BERBEDA', 40, 44,
          { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
        D.text(c, 'C₅H₁₂ — tiga isomer pentana', 40, 74,
          { size: 22, weight: 700, color: P.accent2, base: 'middle' });

        ISOMER_C5.forEach(function (iso, i) {
          const bx = 70 + i * 240, by = 170;
          D.roundRect(c, bx - 40, by - 76, 222, 230, 12,
            'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
          D.text(c, iso.n, bx - 24, by - 54,
            { size: 12.5, weight: 700, color: P.text, base: 'middle' });

          // gambar struktur
          if (i === 0) {
            for (let k = 0; k < 5; k++) {
              const x = bx - 20 + k * 36, y = by + (k % 2 === 0 ? 0 : 24);
              if (k > 0) {
                const px = bx - 20 + (k - 1) * 36, py = by + ((k - 1) % 2 === 0 ? 0 : 24);
                D.line(c, px, py, x, y, 'rgba(255,255,255,.4)', 3);
              }
              D.atom(c, x, y, 14, C.warnaAtom('C'), 'C', { size: 11 });
            }
          } else if (i === 1) {
            const utama = [[bx - 10, by], [bx + 26, by + 24], [bx + 62, by], [bx + 98, by + 24]];
            utama.forEach(function (p, k) {
              if (k > 0) D.line(c, utama[k - 1][0], utama[k - 1][1], p[0], p[1], 'rgba(255,255,255,.4)', 3);
            });
            D.line(c, utama[1][0], utama[1][1], utama[1][0], utama[1][1] + 34, P.amber, 3);
            D.atom(c, utama[1][0], utama[1][1] + 34, 14, C.warnaAtom('C'), 'C', { size: 11 });
            utama.forEach(function (p) { D.atom(c, p[0], p[1], 14, C.warnaAtom('C'), 'C', { size: 11 }); });
          } else {
            const pusat = [bx + 36, by + 18];
            [[-38, 0], [38, 0], [0, -36], [0, 36]].forEach(function (o) {
              D.line(c, pusat[0], pusat[1], pusat[0] + o[0], pusat[1] + o[1],
                o[1] !== 0 ? P.amber : 'rgba(255,255,255,.4)', 3);
              D.atom(c, pusat[0] + o[0], pusat[1] + o[1], 14, C.warnaAtom('C'), 'C', { size: 11 });
            });
            D.atom(c, pusat[0], pusat[1], 14, C.warnaAtom('C'), 'C', { size: 11 });
          }

          D.text(c, 'Titik didih', bx - 24, by + 96,
            { size: 10.5, weight: 500, color: P.faint, base: 'middle' });
          D.text(c, Sim.fmt(iso.td, 1) + ' °C', bx - 24, by + 116,
            { size: 19, weight: 700, color: P.amber, base: 'middle', mono: true });
          D.text(c, i === 0 ? 'rantai lurus — gaya antarmolekul kuat'
            : i === 1 ? 'satu cabang — molekul lebih bulat'
            : 'dua cabang — paling bulat dan ringkas',
            bx - 24, by + 138, { size: 10.5, weight: 500, color: P.dim, base: 'middle' });
        });

        D.roundRect(c, 40, 420, W - 80, 86, 12, 'rgba(79,209,192,.1)', P.accent, 1.5);
        D.text(c, 'Mengapa titik didih turun bila cabangnya bertambah?', 58, 444,
          { size: 15, weight: 700, color: P.accent2, base: 'middle' });
        D.text(c, 'Rantai lurus dapat saling berdempetan rapat sehingga gaya London antarmolekul kuat.',
          58, 468, { size: 12.5, weight: 500, color: P.dim, base: 'middle' });
        D.text(c, 'Molekul bercabang berbentuk lebih bulat, luas sentuhnya kecil, sehingga lebih mudah menguap.',
          58, 488, { size: 12.5, weight: 500, color: P.dim, base: 'middle' });

      /* =========================================== MODE DISTILASI ===== */
      } else {
        const a = sim.data.a;
        D.text(c, 'DISTILASI BERTINGKAT MINYAK BUMI', 40, 44,
          { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
        D.text(c, 'Memisahkan ratusan hidrokarbon berdasarkan titik didihnya', 40, 68,
          { size: 13, weight: 500, color: P.dim, base: 'middle' });

        // menara
        const MX = 190, MY = 96, MW = 170, MH = 390;
        D.roundRect(c, MX, MY, MW, MH, 10, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.3)', 2);

        FRAKSI.forEach(function (f, i) {
          const y = MY + MH - MH * f.tinggi;
          // sekat
          D.line(c, MX, y, MX + MW, y, 'rgba(255,255,255,.18)', 1.2);
          // pipa keluar
          const muncul = Sim.clamp((a - i * 0.08) * 3, 0, 1);
          D.line(c, MX + MW, y + 10, MX + MW + 54, y + 10,
            D.alpha(f.w, 0.4 + muncul * 0.6), 4);
          D.roundRect(c, MX + MW + 54, y - 2, 46, 24, 4,
            D.alpha(f.w, 0.2 + muncul * 0.5), f.w, 1.3);

          // label kiri
          D.text(c, f.n, MX - 12, y + 10,
            { size: 12, weight: 700, color: f.w, align: 'r', base: 'middle' });
          D.text(c, f.c + '  ·  ' + f.td, MX - 12, y + 26,
            { size: 10, weight: 500, color: P.faint, align: 'r', base: 'middle' });

          // kegunaan di kanan
          if (sim.get('guna')) {
            D.text(c, f.guna, MX + MW + 108, y + 10,
              { size: 11.5, weight: 500, color: muncul > 0.5 ? P.dim : P.faint, base: 'middle' });
          }

          // tetesan di pipa
          if (muncul > 0.5) {
            for (let k = 0; k < 3; k++) {
              const px = MX + MW + 6 + ((sim.t * 50 + k * 18) % 46);
              D.circle(c, px, y + 10, 3, D.alpha(f.w, 0.9));
            }
          }
        });

        // minyak mentah masuk & tungku
        D.arrow(c, MX - 70, MY + MH - 30, MX - 6, MY + MH - 30, '#4a3a30', 3, 9);
        D.text(c, 'minyak mentah', MX - 72, MY + MH - 48,
          { size: 11, weight: 600, color: P.dim, align: 'r', base: 'middle' });
        D.flame(c, MX + MW / 2, MY + MH + 22, a > 0.03 ? 0.8 : 0.15, sim.t);

        // gradien suhu
        D.text(c, 'SUHU', MX + MW + 130, MY + 10,
          { size: 10, weight: 700, color: P.faint, base: 'middle' });
        for (let i = 0; i < MH - 20; i++) {
          c.fillStyle = D.ramp(['#9fd4ee', '#f0d04a', '#e8884a', '#4a3a30'], i / (MH - 20));
          c.fillRect(MX + MW + 134, MY + 24 + i, 14, 1.4);
        }
        D.roundRect(c, MX + MW + 134, MY + 24, 14, MH - 20, 3, null, 'rgba(255,255,255,.2)', 1);
        D.text(c, '20 °C', MX + MW + 152, MY + 30,
          { size: 10, weight: 600, color: P.dim, base: 'middle' });
        D.text(c, '400 °C', MX + MW + 152, MY + MH,
          { size: 10, weight: 600, color: P.dim, base: 'middle' });

        D.roundRect(c, 40, 506, W - 80, 48, 10, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.1)', 1.1);
        D.text(c, 'Makin panjang rantai karbonnya, makin tinggi titik didihnya, sehingga makin ke bawah posisinya di menara.',
          58, 530, { size: 12.5, weight: 500, color: P.dim, base: 'middle' });
      }
    },

    readoutsUpdate: function (sim) {
      const n = Math.round(sim.get('n'));
      const jenis = sim.get('jenis');
      sim.readout('rumus', Sim.formula(rumus(n, jenis)));
      sim.readout('nama', nama(n, jenis));
      sim.readout('isomer', jenis === 'alkana' ? ISOMER[n] + ' isomer' : '—');
      sim.readout('td', Sim.fmt(titikDidih(n, jenis), 1) + '<span class="unit"> °C</span>');
    },

    notes: `
      <p>Hidrokarbon adalah senyawa yang hanya tersusun dari <strong>karbon dan
      hidrogen</strong>. Jumlahnya jutaan, dan semuanya bermula dari satu sifat
      istimewa karbon.</p>

      <h3>Kekhasan atom karbon</h3>
      <ul>
        <li>Memiliki <strong>4 elektron valensi</strong>, sehingga dapat membentuk empat
            ikatan kovalen sekaligus.</li>
        <li>Mampu berikatan dengan <strong>sesama atom karbon</strong> (katenasi)
            membentuk rantai panjang, bercabang, atau melingkar.</li>
        <li>Dapat membentuk ikatan tunggal, rangkap dua, dan rangkap tiga.</li>
      </ul>

      <h3>Tiga deret homolog</h3>
      <table>
        <thead><tr><th>Deret</th><th>Rumus umum</th><th>Ikatan</th><th>Sifat</th></tr></thead>
        <tbody>
          <tr><td>Alkana</td><td>CₙH₂ₙ₊₂</td><td>tunggal</td><td>jenuh, kurang reaktif</td></tr>
          <tr><td>Alkena</td><td>CₙH₂ₙ</td><td>rangkap dua</td><td>tak jenuh, reaktif</td></tr>
          <tr><td>Alkuna</td><td>CₙH₂ₙ₋₂</td><td>rangkap tiga</td><td>tak jenuh, sangat reaktif</td></tr>
        </tbody>
      </table>

      <h3>Isomer</h3>
      <p>Senyawa dengan <strong>rumus molekul sama tetapi struktur berbeda</strong>.
      Karena strukturnya berbeda, sifat fisikanya pun berbeda.</p>

      <p>C₅H₁₂ memiliki tiga isomer. Yang menarik, titik didihnya berbeda cukup jauh:
      n-pentana 36,1 °C, isopentana 27,8 °C, neopentana hanya 9,5 °C. Penyebabnya adalah
      <strong>bentuk molekul</strong>. Rantai lurus dapat saling berdempetan rapat
      sehingga gaya tarik antarmolekul (gaya London) besar. Molekul bercabang lebih bulat,
      luas sentuhnya kecil, sehingga lebih mudah dilepaskan menjadi uap.</p>

      <p>Jumlah isomer naik sangat cepat: C₅ punya 3, C₁₀ punya 75, dan C₂₀ punya lebih
      dari 366 ribu isomer.</p>

      <h3>Minyak bumi</h3>
      <p>Minyak bumi adalah campuran ratusan hidrokarbon yang terbentuk dari jasad renik
      laut yang terkubur jutaan tahun. Untuk memisahkannya dipakai
      <strong>distilasi bertingkat</strong>.</p>

      <p>Minyak mentah dipanaskan sampai sekitar 400 °C lalu dialirkan ke menara. Uapnya
      naik dan mendingin secara bertahap. Fraksi dengan <strong>titik didih tinggi</strong>
      (rantai panjang) mengembun lebih dulu di bagian bawah; fraksi dengan titik didih
      rendah terus naik ke puncak.</p>

      <h3>Bilangan oktan</h3>
      <p>Mutu bensin dinyatakan dengan bilangan oktan, yang mengukur ketahanan terhadap
      ketukan (<em>knocking</em>). Hidrokarbon <strong>bercabang</strong> seperti
      isooktana memiliki bilangan oktan tinggi (100), sedangkan n-heptana yang lurus
      bernilai 0. Itulah sebabnya bensin beroktan tinggi diperkaya senyawa bercabang.</p>

      <div class="callout" data-tone="warn">
        <strong>Dampak lingkungan</strong>
        Pembakaran hidrokarbon menghasilkan CO₂ yang memperkuat efek rumah kaca. Pembakaran
        tidak sempurna menghasilkan CO yang beracun dan jelaga. Belerang dalam minyak bumi
        menghasilkan SO₂ penyebab hujan asam.
      </div>
    `,

    explore: [
      'Pada mode <strong>Rantai</strong>, naikkan jumlah karbon dari 1 ke 10. Perhatikan grafik titik didihnya.',
      'Pada jumlah karbon 5, ganti jenis dari alkana ke alkena lalu alkuna. Bagaimana rumus molekulnya berubah?',
      'Buka mode <strong>Isomer</strong>. Ketiganya C₅H₁₂, tetapi titik didihnya berbeda 27 derajat. Mengapa?',
      'Jalankan <strong>Distilasi</strong>. Fraksi mana yang keluar paling atas? Hubungkan dengan panjang rantainya.'
    ],

    quiz: [
      {
        q: 'Rumus molekul alkana dengan 6 atom karbon adalah…',
        options: ['C₆H₁₂', 'C₆H₁₄', 'C₆H₁₀', 'C₆H₆'],
        answer: 1,
        explain: 'Rumus umum alkana adalah CₙH₂ₙ₊₂. Untuk n = 6: H = 2(6) + 2 = 14, sehingga rumusnya C₆H₁₄ (heksana).'
      },
      {
        q: 'n-pentana mendidih pada 36 °C sedangkan neopentana pada 9,5 °C, padahal rumus molekulnya sama. Penyebabnya adalah…',
        options: [
          'Neopentana memiliki massa lebih kecil',
          'Molekul bercabang lebih bulat sehingga gaya antarmolekulnya lebih lemah',
          'Neopentana memiliki ikatan rangkap',
          'n-pentana adalah senyawa ion'
        ],
        answer: 1,
        explain: 'Rantai lurus dapat berdempetan rapat sehingga gaya London antarmolekul besar. Molekul bercabang lebih bulat, luas sentuhnya kecil, sehingga lebih mudah dipisahkan menjadi uap.'
      },
      {
        q: 'Dalam menara distilasi bertingkat, fraksi aspal keluar di bagian paling bawah karena…',
        options: [
          'Massa jenisnya paling besar',
          'Rantai karbonnya paling panjang sehingga titik didihnya paling tinggi',
          'Warnanya paling gelap',
          'Jumlahnya paling sedikit'
        ],
        answer: 1,
        explain: 'Fraksi dengan rantai karbon panjang memiliki gaya antarmolekul besar dan titik didih tinggi, sehingga mengembun lebih dulu di bagian bawah menara yang paling panas.'
      },
      {
        q: 'Manakah yang merupakan ciri senyawa alkena?',
        options: [
          'Semua ikatan antar-karbonnya tunggal',
          'Memiliki satu ikatan rangkap dua antar-karbon',
          'Rumus umumnya CₙH₂ₙ₊₂',
          'Tidak dapat mengalami reaksi adisi'
        ],
        answer: 1,
        explain: 'Alkena memiliki setidaknya satu ikatan rangkap dua C=C dengan rumus umum CₙH₂ₙ. Ikatan rangkap ini membuatnya tak jenuh dan mudah mengalami reaksi adisi.'
      }
    ]
  });
})();
