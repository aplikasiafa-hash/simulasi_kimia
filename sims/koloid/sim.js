/* Sistem Koloid — Fase F
   Bandingkan larutan, koloid, dan suspensi; uji efek Tyndall, gerak Brown,
   penyaringan, dan koagulasi. */

(function () {
  'use strict';

  const D = Sim.Draw, P = Sim.P;
  const C = Chem;

  const W = 800, H = 590;

  const SISTEM = [
    { id: 'larutan', n: 'Larutan', contoh: 'Air gula, air garam, udara bersih',
      ukuran: '< 1 nm', fase: 'satu fase (homogen)', tyndall: false,
      saring: 'lolos kertas saring dan selaput', stabil: 'sangat stabil',
      rPartikel: 1.6, warna: '#8fd0ff', jumlah: 60 },
    { id: 'koloid', n: 'Koloid', contoh: 'Susu, santan, asap, kabut, cat, agar-agar',
      ukuran: '1–100 nm', fase: 'dua fase (heterogen mikroskopis)', tyndall: true,
      saring: 'lolos kertas saring, tertahan selaput', stabil: 'relatif stabil',
      rPartikel: 5, warna: '#f0f0ea', jumlah: 28 },
    { id: 'suspensi', n: 'Suspensi', contoh: 'Air keruh, air kapur, pasir dalam air',
      ukuran: '> 100 nm', fase: 'dua fase (heterogen)', tyndall: true,
      saring: 'tertahan kertas saring', stabil: 'mengendap',
      rPartikel: 11, warna: '#c8a070', jumlah: 14 }
  ];

  const JENIS_KOLOID = [
    { fase: 'Padat', medium: 'Gas', n: 'Aerosol padat', c: 'Asap, debu' },
    { fase: 'Cair', medium: 'Gas', n: 'Aerosol cair', c: 'Kabut, awan, hairspray' },
    { fase: 'Padat', medium: 'Cair', n: 'Sol', c: 'Cat, tinta, sol emas' },
    { fase: 'Cair', medium: 'Cair', n: 'Emulsi', c: 'Susu, santan, mayones' },
    { fase: 'Gas', medium: 'Cair', n: 'Buih', c: 'Busa sabun, krim kocok' },
    { fase: 'Padat', medium: 'Padat', n: 'Sol padat', c: 'Kaca berwarna, paduan logam' },
    { fase: 'Cair', medium: 'Padat', n: 'Emulsi padat', c: 'Keju, mentega, jeli' },
    { fase: 'Gas', medium: 'Padat', n: 'Buih padat', c: 'Batu apung, karet busa' }
  ];

  function sistemAktif(sim) {
    return SISTEM.find(function (s) { return s.id === sim.get('sistem'); }) || SISTEM[1];
  }

  function siapkan(sim) {
    const S = sistemAktif(sim);
    sim.data.partikel = [];
    for (let i = 0; i < S.jumlah; i++) {
      sim.data.partikel.push({
        x: Sim.rnd(0.08, 0.92), y: Sim.rnd(0.12, 0.88),
        vx: Sim.rnd(-1, 1), vy: Sim.rnd(-1, 1),
        r: S.rPartikel * Sim.rnd(0.8, 1.25)
      });
    }
    sim.data.koagulasi = 0;
  }

  Sim.create({
    title: 'Sistem Koloid',
    subtitle: 'Koloid berada di antara larutan dan suspensi. Ukuran partikelnya yang khas melahirkan sifat-sifat yang tidak dimiliki keduanya.',
    fase: 'F', jenjang: 'SMA Kelas 12',
    topik: ['Koloid', 'Efek Tyndall'],
    stage: { w: W, h: H },

    controls: [
      {
        title: 'Sistem yang diamati',
        items: [
          { type: 'segment', id: 'sistem', value: 'koloid', label: '',
            options: SISTEM.map(function (s) { return { value: s.id, label: s.n }; }) }
        ]
      },
      {
        title: 'Pengujian',
        items: [
          { type: 'toggle', id: 'cahaya', value: true, label: 'Sorotkan berkas cahaya',
            hint: 'Uji efek Tyndall: apakah berkasnya terlihat menghambur?' },
          { type: 'toggle', id: 'brown', value: true, label: 'Amati gerak Brown',
            hint: 'Gerak zig-zag akibat tumbukan dengan molekul medium.' },
          { type: 'toggle', id: 'saring', value: false, label: 'Saring dengan kertas saring' },
          { type: 'slider', id: 'koagulan', value: 0, min: 0, max: 1, step: 0.05,
            label: 'Tambahkan elektrolit (koagulasi)', dec: 2,
            format: function (v) { return v < 0.03 ? 'tidak ada' : Math.round(v * 100) + '%'; },
            hint: 'Elektrolit menetralkan muatan partikel koloid sehingga menggumpal.' }
        ]
      },
      {
        title: 'Tampilan',
        items: [
          { type: 'toggle', id: 'jenis', value: true, label: 'Tabel delapan jenis koloid' }
        ]
      }
    ],

    readouts: [
      { id: 'ukuran', label: 'Ukuran partikel', tone: 'accent' },
      { id: 'tyndall', label: 'Efek Tyndall' },
      { id: 'saring', label: 'Penyaringan' },
      { id: 'stabil', label: 'Kestabilan' }
    ],

    setup: siapkan,
    reset: siapkan,
    onChange: function (sim, id) { if (id === 'sistem') siapkan(sim); },

    update: function (sim, dt) {
      const S = sistemAktif(sim);
      const koag = sim.get('koagulan');
      sim.data.koagulasi += ((S.id === 'koloid' ? koag : 0) - sim.data.koagulasi) * Math.min(1, dt * 1.6);

      const brown = sim.get('brown');
      sim.data.partikel.forEach(function (p, i) {
        if (brown) {
          // gerak Brown: makin kecil partikel, makin lincah
          const lincah = 9 / Math.max(p.r, 1);
          p.vx += Sim.rnd(-1, 1) * lincah * dt * 7;
          p.vy += Sim.rnd(-1, 1) * lincah * dt * 7;
        }
        // suspensi mengendap
        if (S.id === 'suspensi') p.vy += 0.5 * dt;
        // koagulasi menarik partikel ke dasar
        if (sim.data.koagulasi > 0.2) p.vy += sim.data.koagulasi * 0.9 * dt;

        const vmaks = 0.9;
        const v = Math.hypot(p.vx, p.vy);
        if (v > vmaks) { p.vx *= vmaks / v; p.vy *= vmaks / v; }
        p.vx *= 0.97; p.vy *= 0.97;
        p.x += p.vx * dt * 0.1; p.y += p.vy * dt * 0.1;

        if (p.x < 0.06) { p.x = 0.06; p.vx = Math.abs(p.vx); }
        if (p.x > 0.94) { p.x = 0.94; p.vx = -Math.abs(p.vx); }
        if (p.y < 0.1) { p.y = 0.1; p.vy = Math.abs(p.vy); }
        if (p.y > 0.9) { p.y = 0.9; p.vy = -Math.abs(p.vy) * 0.3; }
      });
    },

    draw: function (c, sim) {
      const S = sistemAktif(sim);

      /* ---------- bejana utama ---------- */
      const BX = 56, BY = 112, BW = 280, BH = 200;
      const keruh = S.id === 'larutan' ? 0 : S.id === 'koloid' ? 0.3 : 0.5;
      D.roundRect(c, BX, BY, BW, BH, 6,
        D.alpha('#2f5f80', 0.3 + keruh * 0.4), 'rgba(255,255,255,.3)', 2);

      // berkas cahaya
      if (sim.get('cahaya')) {
        const ly = BY + BH * 0.42;
        // sumber
        D.roundRect(c, BX - 46, ly - 14, 38, 28, 5, '#4a5057', 'rgba(255,255,255,.3)', 1.3);
        D.circle(c, BX - 10, ly, 7, '#f0d04a');
        D.text(c, 'senter', BX - 27, ly + 28,
          { size: 10, weight: 600, color: P.faint, align: 'c', base: 'middle' });

        c.save();
        c.beginPath(); c.rect(BX, BY, BW, BH); c.clip();
        if (S.tyndall) {
          // berkas terlihat karena dihamburkan
          const grad = c.createLinearGradient(BX, 0, BX + BW, 0);
          grad.addColorStop(0, 'rgba(240,208,74,.4)');
          grad.addColorStop(1, 'rgba(240,208,74,.14)');
          c.fillStyle = grad;
          c.beginPath();
          c.moveTo(BX, ly - 9); c.lineTo(BX + BW, ly - 22);
          c.lineTo(BX + BW, ly + 22); c.lineTo(BX, ly + 9);
          c.closePath(); c.fill();
          // kilau hamburan di partikel
          sim.data.partikel.forEach(function (p) {
            const px = BX + p.x * BW, py = BY + p.y * BH;
            if (Math.abs(py - ly) < 26) {
              D.circle(c, px, py, p.r * 1.8, 'rgba(240,208,74,.3)');
            }
          });
        } else {
          // berkas menembus tanpa terlihat
          D.line(c, BX, ly, BX + BW, ly, 'rgba(240,208,74,.12)', 2, [6, 6]);
        }
        c.restore();

        D.text(c, S.tyndall ? 'berkas TERLIHAT — cahaya dihamburkan'
          : 'berkas TIDAK terlihat — cahaya diteruskan',
          BX + BW / 2, BY + BH + 22, {
            size: 12, weight: 700, align: 'c', base: 'middle',
            color: S.tyndall ? '#f0d04a' : P.faint
          });
      }

      // partikel
      sim.data.partikel.forEach(function (p, i) {
        const px = BX + p.x * BW, py = BY + p.y * BH;
        const gumpal = sim.data.koagulasi > 0.3 && i % 3 === 0;
        D.circle(c, px, py, p.r * (gumpal ? 1.8 : 1),
          S.id === 'larutan' ? D.alpha(S.warna, 0.75) : S.warna,
          'rgba(0,0,0,.2)', 0.7);
      });

      // endapan koagulasi / suspensi
      if (sim.data.koagulasi > 0.35 || S.id === 'suspensi') {
        const tebal = S.id === 'suspensi' ? 8 : sim.data.koagulasi * 14;
        D.roundRect(c, BX + 2, BY + BH - tebal - 2, BW - 4, tebal, 2,
          D.alpha(S.warna, 0.9));
      }

      D.text(c, S.n.toUpperCase(), BX, BY - 20,
        { size: 16, weight: 800, color: P.accent2, base: 'middle' });
      D.text(c, S.contoh, BX + 100, BY - 20,
        { size: 11, weight: 500, color: P.faint, base: 'middle' });

      /* ---------- penyaringan ---------- */
      if (sim.get('saring')) {
        const FX = 380, FY = 120;
        c.beginPath();
        c.moveTo(FX - 44, FY); c.lineTo(FX + 44, FY);
        c.lineTo(FX + 7, FY + 62); c.lineTo(FX - 7, FY + 62);
        c.closePath();
        c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 2; c.stroke();
        D.text(c, 'kertas saring', FX, FY - 14,
          { size: 10.5, weight: 600, color: P.faint, align: 'c', base: 'middle' });

        const tertahan = S.id === 'suspensi';
        if (tertahan) {
          for (let i = 0; i < 12; i++) {
            D.circle(c, FX - 30 + (i * 37) % 60, FY + 44 - (i % 3) * 5, 4, S.warna);
          }
          D.text(c, 'partikel TERTAHAN', FX, FY + 84,
            { size: 11.5, weight: 700, color: P.amber, align: 'c', base: 'middle' });
        } else {
          for (let i = 0; i < 3; i++) {
            const dy = ((sim.t * 90 + i * 22) % 56);
            D.circle(c, FX, FY + 64 + dy, 3.4, D.alpha(S.warna, 0.9));
          }
          D.text(c, 'partikel LOLOS', FX, FY + 134,
            { size: 11.5, weight: 700, color: P.accent, align: 'c', base: 'middle' });
        }
        D.beaker(c, FX - 36, FY + 140, 72, 48, tertahan ? 0.5 : 0.7,
          D.alpha(tertahan ? '#8fd0ff' : S.warna, 0.5), { ticks: false });
      }

      /* ---------- tabel perbandingan ---------- */
      const TX = sim.get('saring') ? 490 : 380;
      const TW = W - TX - 40;
      D.roundRect(c, TX, 112, TW, 210, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'PERBANDINGAN TIGA SISTEM', TX + 16, 132,
        { size: 10, weight: 700, color: P.faint, base: 'middle' });

      const baris = [
        ['Ukuran partikel', function (s) { return s.ukuran; }],
        ['Jumlah fase', function (s) { return s.fase; }],
        ['Efek Tyndall', function (s) { return s.tyndall ? 'ya' : 'tidak'; }],
        ['Penyaringan', function (s) { return s.saring; }],
        ['Kestabilan', function (s) { return s.stabil; }]
      ];
      baris.forEach(function (b, i) {
        const y = 158 + i * 32;
        D.text(c, b[0], TX + 16, y, { size: 10, weight: 700, color: P.faint, base: 'middle' });
        const v = b[1](S);
        const kata = v.split(' ');
        let ln = [''];
        kata.forEach(function (w) {
          const coba = ln[ln.length - 1] ? ln[ln.length - 1] + ' ' + w : w;
          if (D.measure(c, coba, { size: 11.5 }) > TW - 36) ln.push(w);
          else ln[ln.length - 1] = coba;
        });
        ln.slice(0, 2).forEach(function (l, li) {
          D.text(c, l, TX + 16, y + 15 + li * 13,
            { size: 11.5, weight: 650, color: P.dim, base: 'middle' });
        });
      });

      /* ---------- sifat koloid ---------- */
      const SY = 340;
      D.roundRect(c, 40, SY, 360, 212, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'SIFAT-SIFAT KHAS KOLOID', 58, SY + 20,
        { size: 10, weight: 700, color: P.faint, base: 'middle' });
      const sifat = [
        ['Efek Tyndall', 'Penghamburan cahaya oleh partikel koloid'],
        ['Gerak Brown', 'Gerak zig-zag acak akibat tumbukan molekul medium'],
        ['Adsorpsi', 'Penyerapan ion pada permukaan sehingga koloid bermuatan'],
        ['Koagulasi', 'Penggumpalan koloid karena muatannya dinetralkan'],
        ['Elektroforesis', 'Pergerakan koloid bermuatan dalam medan listrik'],
        ['Dialisis', 'Pemurnian koloid dengan selaput semipermeabel']
      ];
      sifat.forEach(function (s, i) {
        const y = SY + 44 + i * 28;
        D.text(c, s[0], 58, y, { size: 11.5, weight: 700, color: P.accent2, base: 'middle' });
        D.text(c, s[1], 58, y + 13, { size: 10.5, weight: 500, color: P.faint, base: 'middle' });
      });

      /* ---------- delapan jenis koloid ---------- */
      if (sim.get('jenis')) {
        const JX = 414, JW = W - JX - 40;
        D.roundRect(c, JX, SY, JW, 212, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
        D.text(c, 'DELAPAN JENIS KOLOID', JX + 16, SY + 20,
          { size: 10, weight: 700, color: P.faint, base: 'middle' });
        ['Fase terdispersi', 'Medium', 'Nama', 'Contoh'].forEach(function (k, i) {
          D.text(c, k, JX + 16 + i * 86, SY + 40,
            { size: 9, weight: 700, color: P.faint, base: 'middle' });
        });
        D.line(c, JX + 14, SY + 48, JX + JW - 14, SY + 48, 'rgba(255,255,255,.14)', 1);
        JENIS_KOLOID.forEach(function (j, i) {
          const y = SY + 66 + i * 19;
          [j.fase, j.medium, j.n, j.c].forEach(function (s, k) {
            D.text(c, s, JX + 16 + k * 86, y, {
              size: 10, weight: k === 2 ? 650 : 500,
              color: k === 2 ? P.dim : P.faint, base: 'middle'
            });
          });
        });
      }

      /* ---------- pesan koagulasi ---------- */
      if (sim.data.koagulasi > 0.3 && S.id === 'koloid') {
        D.roundRect(c, 56, 318, 280, 24, 12, 'rgba(240,169,74,.18)', P.amber, 1.3);
        D.text(c, 'Koagulasi — koloid menggumpal dan mengendap', 70, 330,
          { size: 11, weight: 700, color: P.amber, base: 'middle' });
      }
    },

    readoutsUpdate: function (sim) {
      const S = sistemAktif(sim);
      sim.readout('ukuran', S.ukuran);
      sim.readout('tyndall', S.tyndall ? 'Ya, berkas terlihat' : 'Tidak terlihat',
        S.tyndall ? 'accent' : null);
      sim.readout('saring', S.id === 'suspensi' ? 'Tertahan' : 'Lolos');
      sim.readout('stabil', S.stabil);
    },

    notes: `
      <p>Koloid adalah campuran yang berada <strong>di antara larutan dan suspensi</strong>.
      Partikelnya terlalu besar untuk disebut larutan sejati, tetapi terlalu kecil untuk
      mengendap seperti suspensi.</p>

      <h3>Perbandingan tiga sistem</h3>
      <table>
        <thead><tr><th></th><th>Larutan</th><th>Koloid</th><th>Suspensi</th></tr></thead>
        <tbody>
          <tr><td>Ukuran partikel</td><td>&lt; 1 nm</td><td>1–100 nm</td><td>&gt; 100 nm</td></tr>
          <tr><td>Jumlah fase</td><td>satu</td><td>dua</td><td>dua</td></tr>
          <tr><td>Penampilan</td><td>bening</td><td>keruh tetapi merata</td><td>keruh dan memisah</td></tr>
          <tr><td>Efek Tyndall</td><td>tidak</td><td><strong>ya</strong></td><td>ya</td></tr>
          <tr><td>Kertas saring</td><td>lolos</td><td>lolos</td><td>tertahan</td></tr>
          <tr><td>Selaput semipermeabel</td><td>lolos</td><td>tertahan</td><td>tertahan</td></tr>
          <tr><td>Kestabilan</td><td>stabil</td><td>relatif stabil</td><td>mengendap</td></tr>
        </tbody>
      </table>

      <h3>Efek Tyndall</h3>
      <p>Partikel koloid berukuran sebanding dengan panjang gelombang cahaya tampak,
      sehingga mampu <strong>menghamburkan cahaya</strong>. Akibatnya berkas cahaya yang
      melewati koloid dapat terlihat dari samping.</p>

      <p>Gejala ini terlihat pada sorot lampu mobil saat berkabut, berkas cahaya matahari
      yang menembus celah di ruangan berdebu, dan langit yang tampak biru. Pada larutan
      sejati, partikelnya terlalu kecil untuk menghamburkan cahaya.</p>

      <h3>Gerak Brown</h3>
      <p>Partikel koloid bergerak zig-zag acak tanpa henti karena terus
      <strong>ditumbuk molekul medium</strong> dari segala arah secara tidak merata.
      Gerak inilah yang mencegah partikel koloid mengendap, sehingga koloid relatif stabil.</p>

      <p>Makin kecil partikelnya, makin lincah geraknya. Pengamatan Robert Brown pada 1827
      menjadi salah satu bukti kuat keberadaan molekul.</p>

      <h3>Muatan dan koagulasi</h3>
      <p>Partikel koloid menyerap ion pada permukaannya (<strong>adsorpsi</strong>)
      sehingga bermuatan sejenis. Muatan yang sama membuat partikel saling tolak dan
      tidak menggumpal.</p>

      <p>Menambahkan elektrolit akan <strong>menetralkan muatan</strong> itu, sehingga
      partikel dapat saling mendekat dan menggumpal. Peristiwa ini disebut
      <strong>koagulasi</strong>.</p>

      <p>Contoh nyata: delta sungai terbentuk karena koloid tanah menggumpal saat bertemu
      air laut yang kaya elektrolit. Tawas dipakai menjernihkan air dengan prinsip yang sama.</p>

      <h3>Pembuatan koloid</h3>
      <ul>
        <li><strong>Kondensasi</strong> — dari larutan menjadi koloid, lewat reaksi
            hidrolisis, redoks, atau penggantian pelarut.</li>
        <li><strong>Dispersi</strong> — dari suspensi menjadi koloid, lewat penggerusan
            mekanik, peptisasi, atau busur Bredig.</li>
      </ul>

      <div class="callout" data-tone="tip">
        <strong>Mengapa susu tidak memisah?</strong>
        Susu adalah emulsi lemak dalam air. Keduanya sebenarnya tidak saling melarutkan,
        tetapi protein kasein berperan sebagai <strong>emulgator</strong> yang menyelimuti
        butiran lemak dan menjaganya tetap tersebar. Sabun bekerja dengan cara yang sama
        terhadap minyak.
      </div>
    `,

    explore: [
      'Sorotkan cahaya pada ketiga sistem bergantian. Pada mana saja berkasnya terlihat?',
      'Nyalakan <strong>Saring dengan kertas saring</strong> pada koloid lalu suspensi. Apa bedanya?',
      'Pilih koloid, lalu geser <strong>Tambahkan elektrolit</strong> ke kanan. Apa yang terjadi pada partikelnya?',
      'Amati gerak Brown pada larutan dan suspensi. Partikel mana yang paling lincah? Mengapa?'
    ],

    quiz: [
      {
        q: 'Berkas cahaya senter terlihat jelas saat melewati segelas susu, tetapi tidak terlihat pada air gula. Gejala ini disebut…',
        options: ['Gerak Brown', 'Efek Tyndall', 'Koagulasi', 'Elektroforesis'],
        answer: 1,
        explain: 'Efek Tyndall adalah penghamburan cahaya oleh partikel koloid. Susu adalah koloid sehingga berkasnya terlihat, sedangkan air gula adalah larutan sejati dengan partikel terlalu kecil untuk menghamburkan cahaya.'
      },
      {
        q: 'Partikel koloid bergerak zig-zag acak tanpa henti. Penyebabnya adalah…',
        options: [
          'Gaya gravitasi',
          'Tumbukan tidak merata dengan molekul medium pendispersi',
          'Muatan listrik partikel',
          'Perbedaan suhu dalam larutan'
        ],
        answer: 1,
        explain: 'Gerak Brown terjadi karena partikel koloid terus ditumbuk molekul medium dari segala arah. Karena tumbukan itu tidak pernah seimbang sempurna, partikel bergerak zig-zag dan tidak sempat mengendap.'
      },
      {
        q: 'Delta terbentuk di muara sungai karena koloid tanah liat menggumpal saat bertemu air laut. Peristiwa ini disebut…',
        options: ['Dialisis', 'Adsorpsi', 'Koagulasi', 'Dispersi'],
        answer: 2,
        explain: 'Elektrolit dalam air laut menetralkan muatan partikel koloid tanah. Tanpa gaya tolak antarpartikel, koloid menggumpal dan mengendap — inilah koagulasi.'
      },
      {
        q: 'Santan adalah campuran minyak kelapa dalam air. Jenis koloid ini disebut…',
        options: ['Sol', 'Aerosol', 'Emulsi', 'Buih'],
        answer: 2,
        explain: 'Emulsi adalah koloid dengan fase terdispersi cair dalam medium pendispersi cair. Santan, susu, dan mayones termasuk jenis ini.'
      }
    ]
  });
})();
