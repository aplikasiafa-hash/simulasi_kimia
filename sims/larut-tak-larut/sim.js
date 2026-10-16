/* Larut atau Tidak Larut? — Fase B
   Masukkan zat ke dalam air, atur suhu dan pengadukan, amati apa yang larut. */

(function () {
  'use strict';

  const D = Sim.Draw, P = Sim.P;

  // kelarutan: gram zat per 100 mL air pada 20 °C (0 berarti tidak larut)
  const ZAT = [
    { nama: 'Gula',    warna: '#f2ead8', s20: 203, naikSuhu: 2.4, larut: true,  butir: 'kristal' },
    { nama: 'Garam',   warna: '#ffffff', s20: 36,  naikSuhu: 1.1, larut: true,  butir: 'kubus' },
    { nama: 'Sirop',   warna: '#e0533d', s20: 400, naikSuhu: 1.5, larut: true,  butir: 'tetes' },
    { nama: 'Kopi',    warna: '#6b4a32', s20: 30,  naikSuhu: 2.0, larut: true,  butir: 'bubuk' },
    { nama: 'Pasir',   warna: '#d8c08a', s20: 0,   naikSuhu: 1,   larut: false, butir: 'bubuk' },
    { nama: 'Minyak',  warna: '#e8c84a', s20: 0,   naikSuhu: 1,   larut: false, butir: 'tetes' },
    { nama: 'Kapur',   warna: '#f0f0ea', s20: 0.17,naikSuhu: 0.6, larut: false, butir: 'bubuk' },
    { nama: 'Tepung',  warna: '#f4ecd8', s20: 0,   naikSuhu: 1,   larut: false, butir: 'bubuk' }
  ];

  const W = 780, H = 500;
  const GX = 230, GY = 130, GW = 210, GH = 230;

  function siapkan(sim) {
    sim.data.butir = [];
    sim.data.terlarut = 0;      // sendok yang sudah larut
    sim.data.ditambah = 0;      // sendok yang dimasukkan
    sim.data.aduk = 0;
    sim.data.pesan = '';
    sim.data.pesanWaktu = 0;
  }

  /** Kelarutan pada suhu terpilih, dinyatakan dalam "sendok per gelas". */
  function batasSendok(sim) {
    const z = ZAT[sim.get('zat')];
    const T = sim.get('suhu');
    const faktor = 1 + (T - 20) / 80 * (z.naikSuhu - 1);
    const gramPer100 = z.s20 * Math.max(0.2, faktor);
    // satu sendok dianggap 5 gram, gelas berisi 100 mL
    return gramPer100 / 5;
  }

  function tambahSendok(sim) {
    const z = ZAT[sim.get('zat')];
    sim.data.ditambah++;
    for (let i = 0; i < 16; i++) {
      sim.data.butir.push({
        x: GX + GW / 2 + Sim.rnd(-28, 28),
        y: GY + 22 + Sim.rnd(-8, 8),
        vx: Sim.rnd(-14, 14), vy: Sim.rnd(10, 40),
        r: z.butir === 'tetes' ? Sim.rnd(4, 7) : Sim.rnd(2.4, 4.4),
        hidup: 1, jatuh: true, sendok: sim.data.ditambah
      });
    }
    const batas = batasSendok(sim);
    if (!z.larut && z.s20 < 1) {
      sim.data.pesan = z.nama + ' tidak larut dalam air — butirannya tetap terlihat.';
    } else if (sim.data.ditambah > batas) {
      sim.data.pesan = 'Larutan sudah jenuh. ' + z.nama + ' berlebih mengendap di dasar.';
    } else {
      sim.data.pesan = z.nama + ' larut. Larutan menjadi lebih pekat.';
    }
    sim.data.pesanWaktu = 3;
  }

  Sim.create({
    title: 'Larut atau Tidak Larut?',
    subtitle: 'Masukkan zat sesendok demi sesendok ke dalam air. Aduk, panaskan, dan temukan sendiri batas kemampuan air melarutkan sesuatu.',
    fase: 'B', jenjang: 'SD Kelas 3–4',
    topik: ['Larutan', 'Campuran'],
    stage: { w: W, h: H },
    stageNote: 'Tekan "Tambah sesendok" berkali-kali',

    controls: [
      {
        title: 'Zat yang dimasukkan',
        items: [
          { type: 'select', id: 'zat', value: 0, label: 'Pilih zat',
            options: ZAT.map(function (z, i) { return { value: i, label: z.nama }; }) },
          { type: 'buttons', label: '', items: [
            { label: '+ Tambah sesendok', primary: true, onClick: tambahSendok },
            { label: 'Kosongkan gelas', onClick: function (sim) { siapkan(sim); } }
          ] }
        ]
      },
      {
        title: 'Perlakuan',
        items: [
          { type: 'slider', id: 'suhu', value: 20, min: 5, max: 90, step: 1,
            label: 'Suhu air', unit: '°C', dec: 0,
            hint: 'Air panas umumnya melarutkan lebih banyak zat padat.' },
          { type: 'toggle', id: 'diaduk', value: false, label: 'Diaduk',
            hint: 'Mengaduk mempercepat pelarutan, tetapi tidak menambah batas kelarutan.' },
          { type: 'toggle', id: 'halus', value: false, label: 'Butiran dihaluskan',
            hint: 'Butiran halus punya permukaan sentuh lebih luas sehingga lebih cepat larut.' }
        ]
      }
    ],

    readouts: [
      { id: 'status', label: 'Hasil', tone: 'accent' },
      { id: 'masuk', label: 'Dimasukkan' },
      { id: 'batas', label: 'Batas larut' },
      { id: 'sisa', label: 'Butir tersisa' }
    ],

    setup: siapkan,
    reset: siapkan,

    onChange: function (sim, id) { if (id === 'zat') siapkan(sim); },

    update: function (sim, dt) {
      const z = ZAT[sim.get('zat')];
      const batas = batasSendok(sim);
      const diaduk = sim.get('diaduk');
      sim.data.aduk += dt * (diaduk ? 4.2 : 0);

      // kecepatan larut dipengaruhi suhu, pengadukan, dan kehalusan butir
      const cepat = 0.5 * (0.4 + sim.get('suhu') / 60) *
        (diaduk ? 2.1 : 1) * (sim.get('halus') ? 1.7 : 1);

      const dasar = GY + GH - 10;
      sim.data.butir.forEach(function (b) {
        if (b.hidup <= 0) return;
        if (b.jatuh) {
          b.vy += 170 * dt;
          b.x += b.vx * dt; b.y += b.vy * dt;
          if (b.y > dasar) { b.y = dasar; b.jatuh = false; b.vy = 0; }
        } else if (diaduk) {
          const cx = GX + GW / 2, cy = GY + GH * 0.6;
          const a = Math.atan2(b.y - cy, b.x - cx) + dt * 3.2;
          const r = Math.hypot(b.x - cx, b.y - cy) * (0.985) + 0.4;
          b.x = cx + Math.cos(a) * Math.min(r, GW * 0.4);
          b.y = cy + Math.sin(a) * Math.min(r, GH * 0.3);
        } else {
          b.y = Math.min(dasar, b.y + 24 * dt);
          b.x += Math.sin(sim.t * 1.4 + b.r * 7) * 4 * dt;
        }
        // hanya butir di bawah batas kelarutan yang boleh larut
        if (b.sendok <= batas && !b.jatuh) b.hidup -= cepat * dt;
      });

      sim.data.butir = sim.data.butir.filter(function (b) { return b.hidup > 0; });
      sim.data.terlarut = Math.min(sim.data.ditambah, batas);
      if (sim.data.pesanWaktu > 0) sim.data.pesanWaktu -= dt;
    },

    draw: function (c, sim) {
      const z = ZAT[sim.get('zat')];
      const batas = batasSendok(sim);
      const T = sim.get('suhu');

      /* ----- gelas ----- */
      const pekat = Math.min(1, sim.data.terlarut / Math.max(batas, 0.6));
      const warnaAir = z.larut
        ? D.mix('#2f6f9e', z.warna, pekat * 0.75)
        : '#2f6f9e';
      D.beaker(c, GX, GY, GW, GH, 0.78, D.alpha(warnaAir, 0.82));

      // pusaran saat diaduk
      if (sim.get('diaduk')) {
        c.save();
        c.beginPath(); c.rect(GX, GY + GH * 0.22, GW, GH * 0.78); c.clip();
        for (let i = 0; i < 4; i++) {
          c.beginPath();
          c.ellipse(GX + GW / 2, GY + GH * 0.38 + i * 18, GW * 0.34 - i * 4, 8, 0, 0, Math.PI * 2);
          c.strokeStyle = 'rgba(255,255,255,.14)'; c.lineWidth = 1.3; c.stroke();
        }
        c.restore();
        // sendok pengaduk
        const sa = sim.data.aduk;
        const sx = GX + GW / 2 + Math.cos(sa) * GW * 0.2;
        D.line(c, sx, GY - 14, sx + Math.cos(sa) * 10, GY + GH * 0.6, 'rgba(230,236,240,.8)', 4);
      }

      // butiran
      sim.data.butir.forEach(function (b) {
        const r = b.r * (sim.get('halus') ? 0.62 : 1) * (0.5 + b.hidup * 0.5);
        c.save(); c.globalAlpha = Math.min(1, b.hidup * 1.3);
        if (z.butir === 'tetes' && !z.larut) {
          D.circle(c, b.x, Math.min(b.y, GY + GH * 0.24), r * 1.5, D.alpha(z.warna, 0.85));
        } else if (z.butir === 'kubus') {
          D.roundRect(c, b.x - r, b.y - r, r * 2, r * 2, 1, z.warna);
        } else {
          D.circle(c, b.x, b.y, r, z.warna);
        }
        c.restore();
      });

      // label gelas
      D.text(c, 'Gelas berisi 100 mL air', GX + GW / 2, GY - 24,
        { size: 12, weight: 600, color: P.dim, align: 'c', base: 'middle' });
      D.text(c, Math.round(T) + ' °C', GX + GW / 2, GY - 44, {
        size: 16, weight: 700, align: 'c', base: 'middle',
        color: D.ramp(['#4a90d9', '#54b64c', '#f0a94a', '#ef6a52'], (T - 5) / 85)
      });

      /* ----- panel kiri: keterangan zat ----- */
      D.roundRect(c, 24, GY - 56, 186, 240, 10, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.2);
      D.text(c, 'ZAT YANG DIUJI', 40, GY - 38,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
      D.text(c, z.nama, 40, GY - 14, { size: 20, weight: 700, color: P.text, base: 'middle' });

      const baris = [
        ['Sifat', z.s20 > 1 ? 'Larut dalam air' : z.s20 > 0 ? 'Sukar larut' : 'Tidak larut'],
        ['Kelarutan 20 °C', z.s20 > 0 ? Sim.fmt(z.s20, z.s20 < 1 ? 2 : 0) + ' g / 100 mL' : 'praktis nol'],
        ['Pengaruh suhu', z.naikSuhu > 1.3 ? 'naik banyak' : z.naikSuhu > 1 ? 'naik sedikit' : 'hampir tetap'],
        ['Batas di ' + Math.round(T) + ' °C', z.s20 > 0 ? Sim.fmt(batas, 1) + ' sendok' : '—']
      ];
      baris.forEach(function (b, i) {
        const y = GY + 16 + i * 38;
        D.text(c, b[0], 40, y, { size: 11, weight: 500, color: P.faint, base: 'middle' });
        D.text(c, b[1], 40, y + 16, { size: 13, weight: 650, color: P.text, base: 'middle' });
      });

      /* ----- panel kanan: tumpukan sendok ----- */
      const RX = 470;
      D.roundRect(c, RX, GY - 56, 286, 240, 10, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.2);
      D.text(c, 'SENDOK YANG DIMASUKKAN', RX + 16, GY - 38,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });

      const n = Math.min(sim.data.ditambah, 24);
      for (let i = 0; i < n; i++) {
        const kol = 6;
        const sx = RX + 26 + (i % kol) * 42;
        const sy = GY - 8 + Math.floor(i / kol) * 42;
        const larutDia = (i + 1) <= batas;
        D.circle(c, sx, sy, 15, larutDia ? D.alpha(P.accent, 0.22) : D.alpha('#f0a94a', 0.22),
          larutDia ? P.accent : P.amber, 1.6);
        D.text(c, String(i + 1), sx, sy,
          { size: 11, weight: 700, color: larutDia ? P.accent2 : P.amber, align: 'c', base: 'middle' });
      }
      if (sim.data.ditambah > 24) {
        D.text(c, '+' + (sim.data.ditambah - 24) + ' lagi', RX + 26, GY + 160,
          { size: 11, weight: 600, color: P.dim, base: 'middle' });
      }
      Plot.legenda(c, RX + 16, GY + 182, [
        { label: 'larut', warna: P.accent },
        { label: 'tidak larut / mengendap', warna: P.amber }
      ]);

      /* ----- pesan ----- */
      if (sim.data.pesanWaktu > 0) {
        c.save(); c.globalAlpha = Math.min(1, sim.data.pesanWaktu / 0.6);
        const tw = D.measure(c, sim.data.pesan, { size: 13, weight: 600 }) + 34;
        D.roundRect(c, W / 2 - tw / 2, H - 52, tw, 32, 16,
          'rgba(79,209,192,.15)', P.accent, 1.4);
        D.text(c, sim.data.pesan, W / 2, H - 36,
          { size: 13, weight: 600, color: P.accent2, align: 'c', base: 'middle' });
        c.restore();
      }
    },

    readoutsUpdate: function (sim) {
      const z = ZAT[sim.get('zat')];
      const batas = batasSendok(sim);
      sim.readout('status', z.s20 > 1 ? 'Larut' : z.s20 > 0 ? 'Sukar larut' : 'Tidak larut',
        z.s20 > 1 ? 'accent' : 'warn');
      sim.readout('masuk', sim.data.ditambah + '<span class="unit"> sdk</span>');
      sim.readout('batas', z.s20 > 0 ? Sim.fmt(batas, 1) + '<span class="unit"> sdk</span>' : '—');
      sim.readout('sisa', sim.data.butir.length);
    },

    notes: `
      <p>Ketika gula dimasukkan ke air lalu menghilang, gula itu <strong>tidak lenyap</strong>.
      Partikel gula hanya menyebar di antara partikel air sampai terlalu kecil untuk
      dilihat. Campuran yang terbentuk disebut <strong>larutan</strong>.</p>

      <h3>Tiga bagian larutan</h3>
      <ul>
        <li><strong>Zat terlarut</strong> — yang dilarutkan, misalnya gula.</li>
        <li><strong>Pelarut</strong> — yang melarutkan, di sini air.</li>
        <li><strong>Larutan</strong> — hasil campurannya, misalnya air gula.</li>
      </ul>

      <h3>Mengapa ada yang tidak larut?</h3>
      <p>Air hanya mampu melarutkan zat yang partikelnya "cocok" dengan partikel air.
      Gula dan garam cocok, sehingga larut. Pasir dan minyak tidak cocok, sehingga
      tetap terpisah — pasir mengendap di dasar, minyak mengapung di permukaan.</p>

      <h3>Larutan jenuh</h3>
      <p>Air punya <strong>batas</strong>. Setelah batas tercapai, tambahan gula tidak
      larut lagi dan menumpuk di dasar. Larutan seperti ini disebut <strong>jenuh</strong>.
      Memanaskan air biasanya menaikkan batas tersebut — itulah sebabnya gula lebih
      mudah larut di teh panas.</p>

      <div class="callout" data-tone="warn">
        <strong>Jangan tertukar</strong>
        Mengaduk membuat zat larut <em>lebih cepat</em>, tetapi tidak membuat air mampu
        melarutkan <em>lebih banyak</em>. Yang menambah batas kelarutan adalah suhu.
      </div>
    `,

    explore: [
      'Masukkan garam sesendok demi sesendok sampai muncul pesan "jenuh". Berapa sendok yang muat?',
      'Naikkan suhu ke 90 °C lalu ulangi. Berapa sendok sekarang? Apa kesimpulanmu?',
      'Bandingkan waktu larut dengan dan tanpa <strong>Diaduk</strong>. Apakah batasnya ikut berubah?',
      'Coba <strong>Minyak</strong> dan <strong>Pasir</strong>. Keduanya tidak larut, tetapi letaknya di gelas berbeda — mengapa?'
    ],

    quiz: [
      {
        q: 'Dalam segelas air teh manis, yang berperan sebagai pelarut adalah…',
        options: ['Gula', 'Air', 'Daun teh', 'Gelasnya'],
        answer: 1,
        explain: 'Pelarut adalah zat yang melarutkan, dan jumlahnya paling banyak. Di sini air melarutkan gula dan zat dari daun teh.'
      },
      {
        q: 'Gula lebih cepat larut dalam air panas daripada air dingin. Alasannya adalah…',
        options: [
          'Air panas lebih berat',
          'Partikel air panas bergerak lebih cepat sehingga lebih sering menumbuk butiran gula',
          'Gula berubah menjadi zat lain saat panas',
          'Air panas memiliki lebih sedikit partikel'
        ],
        answer: 1,
        explain: 'Suhu tinggi berarti partikel air bergerak lebih cepat. Tumbukan yang lebih sering dan lebih kuat membuat butiran gula terlepas lebih cepat.'
      },
      {
        q: 'Sebuah larutan disebut jenuh apabila…',
        options: [
          'Warnanya sudah sangat pekat',
          'Sudah diaduk sangat lama',
          'Zat terlarut tidak dapat larut lagi dan mulai mengendap',
          'Suhunya mencapai 100 °C'
        ],
        answer: 2,
        explain: 'Larutan jenuh berarti pelarut sudah melarutkan sebanyak-banyaknya pada suhu itu. Tambahan zat berikutnya akan mengendap di dasar.'
      },
      {
        q: 'Minyak dituang ke air lalu diaduk kuat. Setelah didiamkan, apa yang terjadi?',
        options: [
          'Minyak larut sempurna',
          'Minyak kembali terpisah dan mengapung di atas air',
          'Minyak mengendap di dasar',
          'Minyak berubah menjadi air'
        ],
        answer: 1,
        explain: 'Minyak tidak larut dalam air dan massa jenisnya lebih kecil, sehingga setelah didiamkan minyak kembali naik ke permukaan sebagai lapisan terpisah.'
      }
    ]
  });
})();
