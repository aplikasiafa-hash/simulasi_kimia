/* Perubahan Fisika atau Kimia? — Fase C
   Jalankan sepuluh peristiwa, amati cirinya, lalu putuskan jenis perubahannya. */

(function () {
  'use strict';

  const D = Sim.Draw, P = Sim.P;

  const PERISTIWA = [
    { nama: 'Es mencair', jenis: 'fisika', gambar: 'es',
      ciri: ['Wujud berubah padat → cair', 'Zatnya tetap air', 'Dapat dibekukan kembali'],
      alasan: 'Hanya wujudnya yang berubah. Rumus kimianya tetap H₂O, jadi tidak ada zat baru.' },
    { nama: 'Kertas dibakar', jenis: 'kimia', gambar: 'bakar',
      ciri: ['Muncul nyala dan asap', 'Terbentuk abu dan gas', 'Tidak bisa kembali menjadi kertas'],
      alasan: 'Kertas bereaksi dengan oksigen membentuk abu, karbon dioksida, dan uap air — semuanya zat baru.' },
    { nama: 'Gula dilarutkan', jenis: 'fisika', gambar: 'larut',
      ciri: ['Gula menghilang dari pandangan', 'Rasa manis tetap ada', 'Dapat diperoleh lagi dengan diuapkan'],
      alasan: 'Partikel gula hanya menyebar di antara partikel air. Gula masih gula, hanya tidak terlihat.' },
    { nama: 'Besi berkarat', jenis: 'kimia', gambar: 'karat',
      ciri: ['Warna berubah menjadi cokelat', 'Permukaan menjadi rapuh', 'Terbentuk zat baru'],
      alasan: 'Besi bereaksi dengan oksigen dan air membentuk karat (besi oksida), zat yang sifatnya sama sekali berbeda.' },
    { nama: 'Lilin meleleh', jenis: 'fisika', gambar: 'lilin',
      ciri: ['Lilin padat menjadi cair', 'Warna dan bau tetap', 'Membeku lagi saat dingin'],
      alasan: 'Hanya perubahan wujud akibat panas. Zat lilinnya sendiri tidak berubah.' },
    { nama: 'Lilin terbakar', jenis: 'kimia', gambar: 'nyala',
      ciri: ['Muncul nyala api', 'Keluar panas dan cahaya', 'Lilin habis menjadi gas'],
      alasan: 'Ini berbeda dengan meleleh. Lilin bereaksi dengan oksigen menjadi karbon dioksida dan uap air.' },
    { nama: 'Buah membusuk', jenis: 'kimia', gambar: 'busuk',
      ciri: ['Warna menjadi cokelat kehitaman', 'Timbul bau menyengat', 'Tekstur melunak'],
      alasan: 'Mikroorganisme menguraikan zat dalam buah menjadi senyawa baru. Prosesnya tidak dapat dibalik.' },
    { nama: 'Kayu dipotong', jenis: 'fisika', gambar: 'potong',
      ciri: ['Bentuk dan ukuran berubah', 'Masih berupa kayu', 'Sifatnya tidak berubah'],
      alasan: 'Memotong hanya mengubah ukuran dan bentuk. Setiap potongan tetap kayu dengan sifat yang sama.' },
    { nama: 'Susu menjadi masam', jenis: 'kimia', gambar: 'susu',
      ciri: ['Rasa berubah menjadi masam', 'Menggumpal', 'Muncul bau khas'],
      alasan: 'Bakteri mengubah gula susu (laktosa) menjadi asam laktat — senyawa baru dengan rasa dan sifat berbeda.' },
    { nama: 'Air mendidih', jenis: 'fisika', gambar: 'didih',
      ciri: ['Muncul gelembung dan uap', 'Uapnya tetap air', 'Dapat diembunkan kembali'],
      alasan: 'Gelembung itu uap air, bukan gas baru. Bila didinginkan, uap kembali menjadi air cair.' }
  ];

  const W = 790, H = 520;

  function siapkan(sim) {
    sim.data.idx = 0;
    sim.data.anim = 0;
    sim.data.jalan = false;
    sim.data.jawab = PERISTIWA.map(function () { return null; });
    sim.data.benar = 0;
    sim.data.dijawab = 0;
  }

  function jawab(sim, pilihan) {
    const i = sim.data.idx;
    if (sim.data.jawab[i]) return;
    const p = PERISTIWA[i];
    sim.data.jawab[i] = pilihan;
    sim.data.dijawab++;
    if (pilihan === p.jenis) sim.data.benar++;
  }

  /* ----------------------------------------------------------- gambaran -- */

  function adegan(c, p, t, a) {
    const cx = 220, cy = 236;
    const g = p.gambar;

    if (g === 'es') {
      const cair = a;
      D.roundRect(c, cx - 70, cy + 24, 140, 10, 4, 'rgba(255,255,255,.15)');
      for (let i = 0; i < 3; i++) {
        const s = 34 * (1 - cair * 0.85);
        if (s > 2) {
          D.roundRect(c, cx - 50 + i * 38, cy + 20 - s, s, s, 4,
            D.alpha('#bfe4f7', 0.85), 'rgba(255,255,255,.4)', 1.2);
        }
      }
      if (cair > 0.1) {
        D.roundRect(c, cx - 76 - cair * 14, cy + 22, 152 + cair * 28, 12 * cair + 3, 5,
          D.alpha('#4a9fd0', 0.7));
      }

    } else if (g === 'bakar' || g === 'nyala') {
      const sisa = 1 - a * 0.8;
      if (g === 'bakar') {
        D.roundRect(c, cx - 44, cy - 56 * sisa, 88, 112 * sisa, 3,
          D.mix('#f0ead8', '#2a2420', a), 'rgba(255,255,255,.26)', 1.2);
      } else {
        D.roundRect(c, cx - 13, cy - 40, 26, 96, 4, '#f2e8c8', 'rgba(255,255,255,.3)', 1.2);
        D.line(c, cx, cy - 40, cx, cy - 54, '#8d939a', 2);
      }
      if (a > 0.08) {
        D.flame(c, cx, g === 'bakar' ? cy - 56 * sisa : cy - 52, 0.55 + a * 0.5, t);
        for (let i = 0; i < 7; i++) {
          const uy = cy - 90 - ((t * 36 + i * 20) % 76);
          D.circle(c, cx + Math.sin(t * 1.6 + i) * 20, uy, 5 + i * 0.8,
            D.alpha('#8d939a', 0.3 * a));
        }
      }
      if (a > 0.6 && g === 'bakar') {
        for (let i = 0; i < 10; i++) {
          D.circle(c, cx - 40 + i * 9, cy + 54 + Math.sin(i) * 3, 3.4,
            D.alpha('#3a3430', 0.9));
        }
      }

    } else if (g === 'larut') {
      D.beaker(c, cx - 62, cy - 56, 124, 118, 0.74,
        D.alpha('#4a9fd0', 0.55 + a * 0.1));
      for (let i = 0; i < 16; i++) {
        const hidup = 1 - Sim.clamp((a - i * 0.03) * 2.4, 0, 1);
        if (hidup <= 0) continue;
        c.globalAlpha = hidup;
        D.circle(c, cx - 40 + (i * 29) % 80,
          cy + 28 - (i % 4) * 9 - (1 - hidup) * 24, 3.2, '#f2ead8');
      }
      c.globalAlpha = 1;
      D.line(c, cx + 14, cy - 76, cx + 14, cy + 20, 'rgba(230,236,240,.6)', 3.4);

    } else if (g === 'karat') {
      const karat = a;
      D.roundRect(c, cx - 66, cy - 18, 132, 36, 4,
        D.mix('#aab4bd', '#8a4a20', karat), 'rgba(255,255,255,.26)', 1.2);
      for (let i = 0; i < Math.round(karat * 18); i++) {
        const rx = cx - 60 + (i * 47) % 120;
        const ry = cy - 12 + (i * 31) % 24;
        D.circle(c, rx, ry, 2.6 + (i % 3), D.alpha('#b0601f', 0.7));
      }
      if (karat > 0.5) {
        for (let i = 0; i < 6; i++) {
          D.circle(c, cx - 50 + i * 20, cy + 30 + Math.sin(i) * 4, 2.4,
            D.alpha('#8a4a20', 0.8));
        }
      }
      D.text(c, 'O₂ + H₂O', cx, cy - 46,
        { size: 12, weight: 600, color: P.dim, align: 'c', base: 'middle' });

    } else if (g === 'lilin') {
      const leleh = a;
      D.roundRect(c, cx - 13, cy - 44 + leleh * 30, 26, 90 - leleh * 30, 4,
        '#f2e8c8', 'rgba(255,255,255,.3)', 1.2);
      D.line(c, cx, cy - 44 + leleh * 30, cx, cy - 58 + leleh * 30, '#8d939a', 2);
      D.flame(c, cx, cy - 58 + leleh * 30, 0.6, t);
      if (leleh > 0.1) {
        D.roundRect(c, cx - 30 - leleh * 20, cy + 40, 60 + leleh * 40, 8 + leleh * 4, 5,
          D.alpha('#f2e8c8', 0.8));
      }

    } else if (g === 'busuk') {
      const busuk = a;
      D.circle(c, cx, cy, 48, D.mix('#e8c84a', '#4a3a28', busuk), 'rgba(255,255,255,.2)', 1.2);
      D.line(c, cx, cy - 48, cx + 6, cy - 64, '#6b8a3a', 3);
      for (let i = 0; i < Math.round(busuk * 14); i++) {
        D.circle(c, cx - 36 + (i * 41) % 72, cy - 30 + (i * 27) % 60,
          3 + (i % 4), D.alpha('#2a2018', 0.75));
      }
      if (busuk > 0.4) {
        for (let i = 0; i < 4; i++) {
          const uy = cy - 60 - ((t * 24 + i * 22) % 50);
          D.text(c, '~', cx - 20 + i * 14, uy,
            { size: 15, color: D.alpha('#9aa4ae', 0.5), align: 'c', base: 'middle' });
        }
      }

    } else if (g === 'potong') {
      const pisah = a * 34;
      D.roundRect(c, cx - 78 - pisah, cy - 22, 74, 44, 4, '#a8763f', 'rgba(255,255,255,.26)', 1.2);
      D.roundRect(c, cx + 4 + pisah, cy - 22, 74, 44, 4, '#a8763f', 'rgba(255,255,255,.26)', 1.2);
      if (a < 0.9) {
        D.line(c, cx, cy - 56, cx, cy + 34, 'rgba(220,228,234,.8)', 3);
        D.roundRect(c, cx - 5, cy - 72, 10, 20, 2, '#6b7580');
      }
      D.text(c, 'tetap kayu', cx, cy + 50,
        { size: 12, weight: 600, color: P.dim, align: 'c', base: 'middle' });

    } else if (g === 'susu') {
      D.beaker(c, cx - 52, cy - 52, 104, 110, 0.72,
        D.mix('#f4f0e8', '#ddd4b8', a));
      for (let i = 0; i < Math.round(a * 11); i++) {
        D.circle(c, cx - 34 + (i * 37) % 68, cy + 10 + (i * 23) % 36,
          4 + (i % 3), D.alpha('#cfc4a4', 0.9));
      }
      if (a > 0.5) {
        D.text(c, 'asam laktat', cx, cy - 72,
          { size: 11.5, weight: 600, color: P.amber, align: 'c', base: 'middle' });
      }

    } else { // didih
      D.beaker(c, cx - 62, cy - 50, 124, 112, 0.66, D.alpha('#4a9fd0', 0.65));
      D.flame(c, cx, cy + 74, 0.5 + a * 0.5, t);
      const n = Math.round(a * 12);
      for (let i = 0; i < n; i++) {
        const by = cy + 56 - ((t * 110 + i * 29) % 100);
        D.circle(c, cx - 44 + (i * 31) % 88, by, 3 + (i % 3) * 1.4,
          null, 'rgba(255,255,255,.55)', 1.3);
      }
      for (let i = 0; i < Math.round(a * 6); i++) {
        const uy = cy - 60 - ((t * 40 + i * 24) % 60);
        D.circle(c, cx + Math.sin(t * 1.4 + i) * 22, uy, 5 + i, D.alpha('#bcd8e8', 0.3));
      }
    }
  }

  Sim.create({
    title: 'Perubahan Fisika atau Kimia?',
    subtitle: 'Jalankan peristiwanya, baca ciri-ciri yang muncul, lalu putuskan: apakah terbentuk zat baru? Pertanyaan itulah pembeda utamanya.',
    fase: 'C', jenjang: 'SD Kelas 5–6',
    topik: ['Perubahan Materi'],
    stage: { w: W, h: H },
    showPlay: false,
    stageNote: 'Klik tombol di bawah untuk menjawab',

    controls: [
      {
        title: 'Peristiwa',
        items: [
          { type: 'select', id: 'pilih', value: 0, label: 'Pilih peristiwa',
            options: PERISTIWA.map(function (p, i) { return { value: i, label: (i + 1) + '. ' + p.nama }; }) },
          { type: 'buttons', label: '', items: [
            { label: '▶ Jalankan', primary: true, onClick: function (sim) {
              sim.data.jalan = true; sim.data.anim = 0;
            } },
            { label: '← Sebelumnya', onClick: function (sim) {
              sim.set('pilih', (sim.data.idx + PERISTIWA.length - 1) % PERISTIWA.length);
            } },
            { label: 'Berikutnya →', onClick: function (sim) {
              sim.set('pilih', (sim.data.idx + 1) % PERISTIWA.length);
            } }
          ] }
        ]
      },
      {
        title: 'Jawabanmu',
        items: [
          { type: 'buttons', label: 'Perubahan ini termasuk…', items: [
            { label: 'Fisika', onClick: function (sim) { jawab(sim, 'fisika'); } },
            { label: 'Kimia', onClick: function (sim) { jawab(sim, 'kimia'); } }
          ] },
          { type: 'toggle', id: 'ciri', value: true, label: 'Tampilkan ciri-ciri' },
          { type: 'buttons', label: '', items: [
            { label: 'Hapus semua jawaban', onClick: function (sim) {
              sim.data.jawab = PERISTIWA.map(function () { return null; });
              sim.data.benar = 0; sim.data.dijawab = 0;
            } }
          ] }
        ]
      }
    ],

    readouts: [
      { id: 'skor', label: 'Skor', tone: 'accent' },
      { id: 'maju', label: 'Terjawab' },
      { id: 'jenis', label: 'Jenis sebenarnya' }
    ],

    setup: siapkan,
    reset: siapkan,
    onChange: function (sim, id) {
      if (id === 'pilih') {
        sim.data.idx = parseInt(sim.get('pilih'), 10) || 0;
        sim.data.anim = 0; sim.data.jalan = false;
      }
    },

    update: function (sim, dt) {
      sim.data.idx = parseInt(sim.get('pilih'), 10) || 0;
      if (sim.data.jalan) {
        sim.data.anim += dt * 0.45;
        if (sim.data.anim >= 1) { sim.data.anim = 1; sim.data.jalan = false; }
      }
    },

    draw: function (c, sim) {
      const i = sim.data.idx;
      const p = PERISTIWA[i];
      const a = sim.data.anim;
      const jawabUser = sim.data.jawab[i];

      /* ----- panggung peristiwa ----- */
      D.roundRect(c, 36, 60, 368, 352, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'PERISTIWA ' + (i + 1) + ' DARI ' + PERISTIWA.length, 56, 82,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
      D.text(c, p.nama, 56, 110, { size: 22, weight: 700, color: P.text, base: 'middle' });

      adegan(c, p, sim.t, a);

      if (a === 0) {
        D.text(c, 'tekan ▶ Jalankan untuk melihat', 220, 390,
          { size: 12, weight: 500, color: P.faint, align: 'c', base: 'middle' });
      }

      /* ----- panel ciri ----- */
      const RX = 426, RW = 332;
      D.roundRect(c, RX, 60, RW, 352, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'YANG TERAMATI', RX + 18, 82,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });

      if (sim.get('ciri') && a > 0.15) {
        p.ciri.forEach(function (s, k) {
          const y = 112 + k * 32;
          const tampil = a > 0.15 + k * 0.2;
          if (!tampil) return;
          D.circle(c, RX + 28, y, 4, P.accent);
          D.text(c, s, RX + 42, y, { size: 13, weight: 500, color: P.dim, base: 'middle' });
        });
      } else if (!sim.get('ciri')) {
        D.text(c, 'Ciri disembunyikan — amati sendiri dari gambar.', RX + 18, 118,
          { size: 12.5, weight: 500, color: P.faint, base: 'middle' });
      } else {
        D.text(c, 'Jalankan peristiwanya dulu.', RX + 18, 118,
          { size: 12.5, weight: 500, color: P.faint, base: 'middle' });
      }

      // pertanyaan kunci
      D.line(c, RX + 18, 214, RX + RW - 18, 214, 'rgba(255,255,255,.1)', 1);
      D.text(c, 'PERTANYAAN KUNCI', RX + 18, 234,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
      D.text(c, 'Apakah terbentuk zat baru?', RX + 18, 258,
        { size: 15, weight: 650, color: P.text, base: 'middle' });

      if (jawabUser) {
        const benar = jawabUser === p.jenis;
        D.roundRect(c, RX + 18, 276, RW - 36, 30, 7,
          benar ? 'rgba(111,207,127,.16)' : 'rgba(239,106,82,.16)',
          benar ? P.green : P.red, 1.3);
        D.text(c, (benar ? '✓ Jawabanmu tepat' : '✗ Jawabanmu: ' + jawabUser) +
          ' — ini perubahan ' + p.jenis.toUpperCase(),
          RX + 32, 291, { size: 12.5, weight: 650, color: benar ? P.green : P.red, base: 'middle' });

        // alasan, dipenggal agar muat
        const kata = p.alasan.split(' ');
        let baris = [''], lebarMaks = RW - 44;
        kata.forEach(function (w) {
          const coba = baris[baris.length - 1] ? baris[baris.length - 1] + ' ' + w : w;
          if (D.measure(c, coba, { size: 12.5 }) > lebarMaks) baris.push(w);
          else baris[baris.length - 1] = coba;
        });
        baris.slice(0, 4).forEach(function (b, k) {
          D.text(c, b, RX + 22, 324 + k * 19,
            { size: 12.5, weight: 500, color: P.dim, base: 'middle' });
        });
      } else {
        D.text(c, 'Pakai tombol Fisika / Kimia di panel kanan.', RX + 18, 284,
          { size: 12.5, weight: 500, color: P.faint, base: 'middle' });
        D.roundRect(c, RX + 18, 304, RW - 36, 92, 8, 'rgba(255,255,255,.03)',
          'rgba(255,255,255,.1)', 1.1);
        D.text(c, 'Tanda perubahan kimia:', RX + 32, 324,
          { size: 11.5, weight: 700, color: P.amber, base: 'middle' });
        ['terbentuk gas atau endapan', 'warna berubah tetap', 'muncul panas, cahaya, atau bau'].forEach(function (s, k) {
          D.text(c, '• ' + s, RX + 32, 346 + k * 18,
            { size: 11.5, weight: 500, color: P.dim, base: 'middle' });
        });
      }

      /* ----- deretan kemajuan ----- */
      PERISTIWA.forEach(function (q, k) {
        const x = 46 + k * 36;
        const j = sim.data.jawab[k];
        const aktif = k === i;
        const warna = !j ? 'rgba(255,255,255,.12)'
          : j === q.jenis ? P.green : P.red;
        D.roundRect(c, x, 432, 28, 28, 6,
          aktif ? D.alpha(P.accent, 0.2) : 'rgba(255,255,255,.04)',
          aktif ? P.accent : warna, aktif ? 2 : 1.4);
        D.text(c, String(k + 1), x + 14, 446,
          { size: 11.5, weight: 700, align: 'c', base: 'middle',
            color: aktif ? P.accent2 : (!j ? P.faint : warna) });
      });
      D.text(c, 'Kemajuan — hijau berarti tepat, merah berarti perlu ditinjau ulang',
        46, 482, { size: 11.5, weight: 500, color: P.faint, base: 'middle' });
    },

    readoutsUpdate: function (sim) {
      sim.readout('skor', sim.data.benar + ' / ' + PERISTIWA.length);
      sim.readout('maju', sim.data.dijawab + ' / ' + PERISTIWA.length);
      const i = sim.data.idx;
      sim.readout('jenis', sim.data.jawab[i] ? PERISTIWA[i].jenis : 'tersembunyi',
        sim.data.jawab[i] ? (PERISTIWA[i].jenis === 'kimia' ? 'warn' : 'accent') : null);
    },

    notes: `
      <p>Semua perubahan materi masuk ke salah satu dari dua kelompok. Pembedanya
      hanya satu pertanyaan: <strong>apakah terbentuk zat baru?</strong></p>

      <h3>Perubahan fisika</h3>
      <p><strong>Tidak</strong> menghasilkan zat baru. Yang berubah hanya wujud, bentuk,
      ukuran, atau keadaannya. Zat asalnya masih ada dan umumnya bisa dikembalikan.</p>
      <p>Contoh: es mencair, air mendidih, gula larut, kayu dipotong, kertas diremas,
      besi dipanaskan sampai memuai.</p>

      <h3>Perubahan kimia</h3>
      <p><strong>Menghasilkan</strong> zat baru dengan sifat yang berbeda. Hampir selalu
      sulit atau tidak mungkin dikembalikan seperti semula. Perubahan kimia disebut juga
      <strong>reaksi kimia</strong>.</p>
      <p>Contoh: kertas dibakar, besi berkarat, buah membusuk, susu menjadi masam,
      makanan dicerna, fotosintesis.</p>

      <h3>Lima tanda perubahan kimia</h3>
      <ol>
        <li>Terbentuk <strong>gas</strong> (muncul gelembung yang bukan karena mendidih)</li>
        <li>Terbentuk <strong>endapan</strong></li>
        <li><strong>Perubahan warna</strong> yang tetap</li>
        <li><strong>Perubahan suhu</strong> — terasa memanas atau mendingin sendiri</li>
        <li>Muncul <strong>bau baru</strong>, cahaya, atau nyala</li>
      </ol>

      <div class="callout" data-tone="warn">
        <strong>Perhatikan pasangan yang mirip</strong>
        Lilin <em>meleleh</em> adalah perubahan fisika, tetapi lilin <em>terbakar</em>
        adalah perubahan kimia. Peristiwanya terjadi pada benda yang sama, tetapi
        hasilnya berbeda sama sekali.
      </div>
    `,

    explore: [
      'Jalankan <strong>Lilin meleleh</strong> dan <strong>Lilin terbakar</strong> berturut-turut. Apa bedanya?',
      'Matikan <strong>Tampilkan ciri-ciri</strong> dan coba tebak hanya dari gambarnya.',
      'Kerjakan kesepuluh peristiwa tanpa melihat jawaban. Berapa skor akhirmu?',
      'Sebutkan tiga perubahan kimia yang kamu lihat di dapur rumahmu hari ini.'
    ],

    quiz: [
      {
        q: 'Manakah yang merupakan perubahan kimia?',
        options: ['Air membeku menjadi es', 'Nasi menjadi basi', 'Kawat tembaga dibengkokkan', 'Kapur barus menyublim'],
        answer: 1,
        explain: 'Nasi basi berarti zat dalam nasi telah diuraikan mikroorganisme menjadi senyawa baru yang berbau dan berasa berbeda. Tiga pilihan lainnya hanya mengubah wujud atau bentuk.'
      },
      {
        q: 'Ciri paling pokok dari perubahan kimia adalah…',
        options: [
          'Selalu disertai panas',
          'Terbentuknya zat baru dengan sifat berbeda',
          'Selalu mengubah wujud zat',
          'Selalu dapat dikembalikan'
        ],
        answer: 1,
        explain: 'Panas, gas, dan perubahan warna hanyalah tanda yang sering menyertai. Hakikat perubahan kimia adalah terbentuknya zat baru.'
      },
      {
        q: 'Gula dilarutkan dalam air termasuk perubahan fisika. Bukti paling kuatnya adalah…',
        options: [
          'Gula menghilang dari pandangan',
          'Larutannya menjadi bening',
          'Gula dapat diperoleh kembali dengan menguapkan air',
          'Rasanya menjadi manis'
        ],
        answer: 2,
        explain: 'Karena gula dapat diperoleh kembali utuh, berarti gula tidak pernah berubah menjadi zat lain. Ia hanya tersebar di antara partikel air.'
      },
      {
        q: 'Besi dipanaskan sampai membara lalu dipukul menjadi pipih. Peristiwa ini termasuk…',
        options: ['Perubahan kimia', 'Perubahan fisika', 'Keduanya sekaligus', 'Bukan perubahan apa pun'],
        answer: 1,
        explain: 'Besi yang ditempa hanya berubah bentuk. Zatnya tetap besi dengan sifat yang sama. Berbeda dengan besi berkarat, yang menghasilkan besi oksida.'
      }
    ]
  });
})();
