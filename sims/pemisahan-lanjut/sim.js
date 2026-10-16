/* Teknik Pemisahan Campuran — Fase D
   Lima teknik dijalankan penuh: filtrasi, destilasi, kromatografi kertas,
   sublimasi, dan kristalisasi. */

(function () {
  'use strict';

  const D = Sim.Draw, P = Sim.P;

  const W = 790, H = 540;

  const TEKNIK = {
    filtrasi: {
      nama: 'Filtrasi (penyaringan)',
      dasar: 'Perbedaan ukuran partikel',
      contoh: 'Memisahkan pasir dari air, menyaring santan dari ampas kelapa',
      urut: ['Campuran dituang ke corong berlapis kertas saring',
             'Partikel besar tertahan di kertas (residu)',
             'Cairan lolos dan tertampung (filtrat)']
    },
    destilasi: {
      nama: 'Destilasi (penyulingan)',
      dasar: 'Perbedaan titik didih',
      contoh: 'Memisahkan alkohol dari air, memurnikan air laut menjadi air tawar',
      urut: ['Campuran dipanaskan sampai komponen bertitik didih rendah menguap',
             'Uap mengalir ke pendingin (kondensor)',
             'Uap mengembun menjadi cairan murni (destilat)']
    },
    kromatografi: {
      nama: 'Kromatografi kertas',
      dasar: 'Perbedaan kecepatan perambatan pada kertas',
      contoh: 'Memisahkan zat warna dalam tinta atau pewarna makanan',
      urut: ['Setetes campuran ditotolkan di kertas',
             'Ujung kertas dicelupkan ke pelarut',
             'Pelarut merambat naik membawa zat warna dengan kecepatan berbeda']
    },
    sublimasi: {
      nama: 'Sublimasi',
      dasar: 'Salah satu komponen dapat menyublim',
      contoh: 'Memurnikan kapur barus, iodin, atau kafein',
      urut: ['Campuran dipanaskan perlahan',
             'Komponen yang mudah menyublim berubah langsung menjadi gas',
             'Gas mengkristal kembali di permukaan dingin di atasnya']
    },
    kristalisasi: {
      nama: 'Kristalisasi',
      dasar: 'Perbedaan kelarutan saat larutan dipekatkan',
      contoh: 'Membuat garam dari air laut, memurnikan gula tebu',
      urut: ['Larutan dipanaskan sampai sebagian pelarut menguap',
             'Larutan menjadi lewat jenuh',
             'Zat terlarut membentuk kristal yang dapat dipisahkan']
    }
  };

  function siapkan(sim) {
    sim.data.a = 0;
    sim.data.jalan = false;
    sim.data.langkah = 0;
    sim.data.selesai = {};
  }

  Sim.create({
    title: 'Teknik Pemisahan Campuran',
    subtitle: 'Setiap teknik memanfaatkan satu perbedaan sifat fisika. Jalankan prosesnya tahap demi tahap dan perhatikan sifat apa yang sedang dieksploitasi.',
    fase: 'D', jenjang: 'SMP Kelas 7–9',
    topik: ['Pemisahan', 'Campuran'],
    stage: { w: W, h: H },

    controls: [
      {
        title: 'Teknik',
        items: [
          { type: 'select', id: 'teknik', value: 'destilasi', label: 'Pilih teknik',
            options: Object.keys(TEKNIK).map(function (k) {
              return { value: k, label: TEKNIK[k].nama }; }) },
          { type: 'buttons', label: '', items: [
            { label: '▶ Jalankan proses', primary: true, onClick: function (sim) {
              sim.data.jalan = true;
              if (sim.data.a >= 1) sim.data.a = 0;
            } },
            { label: '⏸ Jeda', onClick: function (sim) { sim.data.jalan = false; } },
            { label: '↺ Ulangi', onClick: function (sim) { sim.data.a = 0; sim.data.jalan = false; } }
          ] }
        ]
      },
      {
        title: 'Pengaturan',
        items: [
          { type: 'slider', id: 'kecepatan', value: 1, min: 0.3, max: 3, step: 0.1,
            label: 'Kecepatan proses', unit: '×', dec: 1 },
          { type: 'toggle', id: 'label', value: true, label: 'Tampilkan nama alat' },
          { type: 'toggle', id: 'tahap', value: true, label: 'Tampilkan tahapan' }
        ]
      }
    ],

    readouts: [
      { id: 'dasar', label: 'Dasar pemisahan', tone: 'accent' },
      { id: 'maju', label: 'Kemajuan' },
      { id: 'tahap', label: 'Tahap' }
    ],

    setup: siapkan,
    reset: siapkan,
    onChange: function (sim, id) {
      if (id === 'teknik') { sim.data.a = 0; sim.data.jalan = false; }
    },

    update: function (sim, dt) {
      if (sim.data.jalan) {
        sim.data.a += dt * 0.17 * sim.get('kecepatan');
        if (sim.data.a >= 1) {
          sim.data.a = 1; sim.data.jalan = false;
          sim.data.selesai[sim.get('teknik')] = true;
        }
      }
      sim.data.langkah = Math.min(2, Math.floor(sim.data.a * 3));
    },

    draw: function (c, sim) {
      const k = sim.get('teknik');
      const T = TEKNIK[k];
      const a = sim.data.a;
      const t = sim.t;
      const label = sim.get('label');

      D.text(c, T.nama.toUpperCase(), 40, 40,
        { size: 11, weight: 700, color: P.faint, base: 'middle' });
      D.text(c, 'Dasar: ' + T.dasar, 40, 62,
        { size: 15, weight: 650, color: P.accent2, base: 'middle' });

      const AX = 40, AY = 90, AW = 470, AH = 300;
      D.roundRect(c, AX, AY, AW, AH, 14, 'rgba(255,255,255,.035)', 'rgba(255,255,255,.1)', 1.2);

      /* ================================================= FILTRASI ===== */
      if (k === 'filtrasi') {
        const cx = AX + AW / 2;
        // corong
        c.beginPath();
        c.moveTo(cx - 72, AY + 60); c.lineTo(cx + 72, AY + 60);
        c.lineTo(cx + 9, AY + 148); c.lineTo(cx - 9, AY + 148);
        c.closePath();
        c.fillStyle = 'rgba(255,255,255,.05)'; c.fill();
        c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 2.2; c.stroke();

        // campuran di dalam corong, berkurang
        const sisa = 1 - a;
        if (sisa > 0.02) {
          c.save();
          c.beginPath();
          c.moveTo(cx - 72, AY + 60); c.lineTo(cx + 72, AY + 60);
          c.lineTo(cx + 9, AY + 148); c.lineTo(cx - 9, AY + 148);
          c.closePath(); c.clip();
          c.fillStyle = D.alpha('#6b8aa0', 0.65);
          c.fillRect(cx - 72, AY + 148 - 88 * sisa, 144, 88 * sisa);
          c.restore();
        }
        // residu menumpuk
        for (let i = 0; i < Math.round(a * 16); i++) {
          D.circle(c, cx - 50 + (i * 41) % 100, AY + 132 - (i % 3) * 5, 3.6,
            D.alpha('#d8c08a', 0.95));
        }
        if (label) {
          D.text(c, 'kertas saring', cx + 84, AY + 100,
            { size: 11, weight: 600, color: P.dim, base: 'middle' });
          D.text(c, 'residu', cx - 108, AY + 130,
            { size: 11, weight: 600, color: P.amber, base: 'middle' });
        }
        // tetesan
        if (a > 0.05 && a < 1) {
          for (let i = 0; i < 3; i++) {
            const dy = ((t * 110 + i * 26) % 70);
            D.circle(c, cx, AY + 152 + dy, 3.4, D.alpha('#4a9fd0', 0.9));
          }
        }
        // gelas penampung
        D.beaker(c, cx - 56, AY + 222, 112, 66, 0.1 + a * 0.75, D.alpha('#4a9fd0', 0.75));
        if (label) D.text(c, 'filtrat', cx + 70, AY + 258,
          { size: 11, weight: 600, color: '#8fd0ff', base: 'middle' });

      /* ================================================ DESTILASI ===== */
      } else if (k === 'destilasi') {
        const lx = AX + 80, ly = AY + 120;
        // labu didih
        D.circle(c, lx, ly + 40, 42, 'rgba(255,255,255,.05)', 'rgba(255,255,255,.4)', 2.2);
        const sisa = Math.max(0.12, 0.8 - a * 0.55);
        c.save();
        c.beginPath(); c.arc(lx, ly + 40, 40, 0, Math.PI * 2); c.clip();
        c.fillStyle = D.alpha('#5a8aa8', 0.7);
        c.fillRect(lx - 42, ly + 80 - 72 * sisa, 84, 72 * sisa);
        c.restore();
        D.roundRect(c, lx - 9, ly - 24, 18, 26, 3, null, 'rgba(255,255,255,.4)', 2);

        // gelembung mendidih
        if (a > 0.08) {
          for (let i = 0; i < 6; i++) {
            const by = ly + 72 - ((t * 85 + i * 22) % 60);
            D.circle(c, lx - 26 + (i * 19) % 52, by, 2.6, null, 'rgba(255,255,255,.5)', 1.2);
          }
        }
        D.flame(c, lx, ly + 92, a > 0.03 ? 0.85 : 0.15, t);

        // termometer
        D.roundRect(c, lx - 3, ly - 70, 6, 50, 3, 'rgba(255,255,255,.1)', 'rgba(255,255,255,.3)', 1.2);
        const suhu = 25 + a * 70;
        D.roundRect(c, lx - 2, ly - 22 - 46 * (suhu - 25) / 80, 4, 46 * (suhu - 25) / 80, 2,
          D.ramp(['#4a90d9', '#f0a94a', '#ef6a52'], (suhu - 25) / 80));
        D.text(c, Math.round(suhu) + '°C', lx + 10, ly - 60,
          { size: 11, weight: 700, color: P.dim, base: 'middle' });

        // pipa ke kondensor
        D.line(c, lx + 9, ly - 14, lx + 110, ly - 14, 'rgba(255,255,255,.4)', 2.2);

        // kondensor miring
        const kx1 = lx + 110, ky1 = ly - 14, kx2 = lx + 250, ky2 = ly + 70;
        c.save();
        c.translate(kx1, ky1);
        c.rotate(Math.atan2(ky2 - ky1, kx2 - kx1));
        const panjang = Math.hypot(kx2 - kx1, ky2 - ky1);
        D.roundRect(c, 0, -17, panjang, 34, 8, 'rgba(90,160,210,.14)', 'rgba(255,255,255,.4)', 2);
        D.roundRect(c, 0, -6, panjang, 12, 6, null, 'rgba(255,255,255,.3)', 1.4);
        // uap mengalir di dalam
        for (let i = 0; i < 7; i++) {
          const f = ((t * 0.3 + i / 7) % 1);
          if (a < 0.05) break;
          D.circle(c, f * panjang, 0, 4 - f * 2.4, D.alpha('#bcd8e8', 0.55 * (1 - f * 0.6)));
        }
        c.restore();
        if (label) {
          D.text(c, 'kondensor (pendingin)', kx1 + 20, ky1 - 32,
            { size: 11, weight: 600, color: P.dim, base: 'middle' });
          D.text(c, 'labu didih', lx - 52, ly + 100,
            { size: 11, weight: 600, color: P.dim, base: 'middle' });
        }
        // penampung destilat
        D.beaker(c, kx2 + 6, ky2 + 24, 86, 72, 0.08 + a * 0.7, D.alpha('#8fd0ff', 0.8));
        if (label) D.text(c, 'destilat (murni)', kx2 + 8, ky2 + 112,
          { size: 11, weight: 600, color: '#8fd0ff', base: 'middle' });

      /* ============================================ KROMATOGRAFI ===== */
      } else if (k === 'kromatografi') {
        const cx = AX + AW / 2, ky = AY + 40, kh = 200, kw = 150;
        // kertas
        D.roundRect(c, cx - kw / 2, ky, kw, kh, 3, 'rgba(255,255,255,.92)', 'rgba(255,255,255,.4)', 1.4);
        // pelarut merambat
        const naik = a * (kh - 36);
        D.roundRect(c, cx - kw / 2, ky + kh - 24 - naik, kw, naik + 24, 3,
          'rgba(140,190,230,.22)');
        D.line(c, cx - kw / 2, ky + kh - 24 - naik, cx + kw / 2, ky + kh - 24 - naik,
          'rgba(90,160,210,.8)', 2);
        if (label) D.text(c, 'garis depan pelarut', cx + kw / 2 + 10, ky + kh - 24 - naik,
          { size: 10.5, weight: 600, color: '#8fd0ff', base: 'middle' });

        // tiga zat warna merambat dengan kecepatan berbeda
        const zat = [
          { w: '#e0533d', rf: 0.85, n: 'merah' },
          { w: '#4a7fd8', rf: 0.55, n: 'biru' },
          { w: '#f0c020', rf: 0.28, n: 'kuning' }
        ];
        zat.forEach(function (z, i) {
          const y = ky + kh - 24 - naik * z.rf;
          const lebar = 9 + a * 9;
          c.save();
          c.globalAlpha = 0.9;
          c.beginPath();
          c.ellipse(cx, y, lebar, 6 + a * 3, 0, 0, Math.PI * 2);
          c.fillStyle = z.w; c.fill();
          c.restore();
          if (a > 0.5 && label) {
            D.text(c, z.n + '  Rf ' + Sim.fmt(z.rf, 2), cx - kw / 2 - 10, y,
              { size: 10.5, weight: 600, color: z.w, align: 'r', base: 'middle' });
          }
        });
        // totolan awal
        D.line(c, cx - kw / 2 + 8, ky + kh - 24, cx + kw / 2 - 8, ky + kh - 24,
          'rgba(60,70,80,.4)', 1.2, [4, 3]);
        if (label) D.text(c, 'garis totol', cx + kw / 2 + 10, ky + kh - 24,
          { size: 10.5, weight: 600, color: P.faint, base: 'middle' });
        // bejana pelarut
        D.beaker(c, cx - kw / 2 - 22, ky + kh - 14, kw + 44, 54, 0.4,
          D.alpha('#5a8aa8', 0.55), { ticks: false });
        if (label) D.text(c, 'pelarut (eluen)', cx, ky + kh + 58,
          { size: 11, weight: 600, color: P.dim, align: 'c', base: 'middle' });

      /* ============================================== SUBLIMASI ===== */
      } else if (k === 'sublimasi') {
        const cx = AX + AW / 2, cy = AY + 190;
        // cawan penguap
        D.beaker(c, cx - 70, cy - 36, 140, 46, 0.6, 'rgba(255,255,255,.06)', { ticks: false });
        // campuran: iodin (ungu) + pasir
        for (let i = 0; i < 20; i++) {
          const tersisa = i % 2 === 0 ? 1 : (1 - a);
          if (tersisa < 0.1) continue;
          c.globalAlpha = tersisa;
          D.circle(c, cx - 56 + (i * 37) % 112, cy - 4 + (i % 3) * 5, 3.6,
            i % 2 === 0 ? '#d8c08a' : '#7a3fc0');
        }
        c.globalAlpha = 1;
        D.flame(c, cx, cy + 32, a > 0.03 ? 0.6 : 0.1, t);

        // uap ungu naik
        if (a > 0.05) {
          for (let i = 0; i < 9; i++) {
            const uy = cy - 44 - ((t * 36 + i * 17) % 110);
            D.circle(c, cx + Math.sin(t * 1.4 + i * 1.6) * 34, uy, 4 + i * 0.5,
              D.alpha('#9a5fd8', 0.3 * a));
          }
        }
        // corong terbalik / permukaan dingin
        c.beginPath();
        c.moveTo(cx - 84, cy - 148); c.lineTo(cx + 84, cy - 148);
        c.lineTo(cx + 10, cy - 66); c.lineTo(cx - 10, cy - 66);
        c.closePath();
        c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 2.2; c.stroke();
        // kristal terbentuk kembali
        for (let i = 0; i < Math.round(a * 22); i++) {
          const fx = cx - 70 + (i * 53) % 140;
          const fy = cy - 142 + Math.abs(fx - cx) * 0.45;
          D.roundRect(c, fx - 2.4, fy, 4.8, 4.8, 1, '#8a4fd0');
        }
        if (label) {
          D.text(c, 'kristal iodin murni', cx + 94, cy - 128,
            { size: 11, weight: 600, color: '#b795f0', base: 'middle' });
          D.text(c, 'permukaan dingin', cx + 94, cy - 110,
            { size: 10.5, weight: 500, color: P.faint, base: 'middle' });
          D.text(c, 'campuran iodin + pasir', cx - 76, cy + 24,
            { size: 11, weight: 600, color: P.dim, align: 'r', base: 'middle' });
        }

      /* ============================================ KRISTALISASI ===== */
      } else {
        const cx = AX + AW / 2, cy = AY + 150;
        const sisa = 1 - a * 0.78;
        D.beaker(c, cx - 86, cy - 60, 172, 120, sisa * 0.8, D.alpha('#5a8aa8', 0.6));
        D.flame(c, cx, cy + 86, a < 0.95 ? 0.7 : 0.1, t);
        // uap air keluar
        if (a > 0.03 && a < 0.97) {
          for (let i = 0; i < 6; i++) {
            const uy = cy - 72 - ((t * 40 + i * 20) % 70);
            D.circle(c, cx + Math.sin(t * 1.5 + i) * 26, uy, 5 + i * 0.6,
              D.alpha('#bcd8e8', 0.25));
          }
        }
        // kristal tumbuh di dasar
        const nK = Math.round(Math.max(0, a - 0.35) / 0.65 * 26);
        for (let i = 0; i < nK; i++) {
          const kx = cx - 74 + (i * 47) % 148;
          const ky = cy + 52 - (i % 4) * 7;
          const s = 3 + (i % 3) * 1.6;
          c.save();
          c.translate(kx, ky); c.rotate((i * 1.1) % Math.PI);
          D.roundRect(c, -s, -s, s * 2, s * 2, 1, '#f2f2ee', 'rgba(255,255,255,.5)', 0.8);
          c.restore();
        }
        if (label) {
          D.text(c, 'larutan garam dipanaskan', cx, cy - 86,
            { size: 11.5, weight: 600, color: P.dim, align: 'c', base: 'middle' });
          if (a > 0.4) D.text(c, 'kristal garam murni', cx + 96, cy + 48,
            { size: 11, weight: 600, color: P.accent2, base: 'middle' });
        }
      }

      /* ---------- panel tahapan ---------- */
      const SX = 530, SW = 226;
      D.roundRect(c, SX, AY, SW, AH, 14, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'TAHAPAN PROSES', SX + 16, AY + 20,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });

      if (sim.get('tahap')) {
        T.urut.forEach(function (s, i) {
          const y = AY + 46 + i * 78;
          const aktif = i === sim.data.langkah;
          const lewat = i < sim.data.langkah || a >= 1;
          D.roundRect(c, SX + 16, y, SW - 32, 64, 9,
            aktif ? 'rgba(79,209,192,.12)' : 'rgba(255,255,255,.03)',
            aktif ? P.accent : (lewat ? 'rgba(111,207,127,.4)' : 'rgba(255,255,255,.1)'),
            aktif ? 1.8 : 1.2);
          D.circle(c, SX + 34, y + 18, 10,
            lewat ? P.green : (aktif ? P.accent : 'rgba(255,255,255,.1)'));
          D.text(c, lewat ? '✓' : String(i + 1), SX + 34, y + 18,
            { size: 11, weight: 800, color: lewat || aktif ? '#06201d' : P.faint, align: 'c', base: 'middle' });

          // pecah teks menjadi beberapa baris
          const kata = s.split(' ');
          let baris = [''];
          kata.forEach(function (w) {
            const coba = baris[baris.length - 1] ? baris[baris.length - 1] + ' ' + w : w;
            if (D.measure(c, coba, { size: 11.5 }) > SW - 76) baris.push(w);
            else baris[baris.length - 1] = coba;
          });
          baris.slice(0, 3).forEach(function (b, bi) {
            D.text(c, b, SX + 50, y + 14 + bi * 15,
              { size: 11.5, weight: 500, color: aktif ? P.text : P.dim, base: 'middle' });
          });
        });
      }

      /* ---------- bilah kemajuan & contoh ---------- */
      D.roundRect(c, 40, 408, W - 80, 10, 5, 'rgba(255,255,255,.08)');
      D.roundRect(c, 40, 408, (W - 80) * a, 10, 5,
        a >= 1 ? P.green : P.accent);
      D.text(c, a >= 1 ? 'Proses selesai — komponen berhasil dipisahkan' :
        (sim.data.jalan ? 'Proses berjalan…' : 'Tekan ▶ Jalankan proses'),
        40, 434, { size: 12.5, weight: 600, color: a >= 1 ? P.green : P.dim, base: 'middle' });

      D.roundRect(c, 40, 450, W - 80, 56, 10, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.1)', 1.1);
      D.text(c, 'CONTOH PENERAPAN', 56, 468,
        { size: 10, weight: 700, color: P.faint, base: 'middle' });
      D.text(c, T.contoh, 56, 490, { size: 13, weight: 500, color: P.dim, base: 'middle' });
    },

    readoutsUpdate: function (sim) {
      const T = TEKNIK[sim.get('teknik')];
      sim.readout('dasar', T.dasar);
      sim.readout('maju', Math.round(sim.data.a * 100) + '<span class="unit">%</span>');
      sim.readout('tahap', (sim.data.langkah + 1) + ' / 3');
    },

    notes: `
      <p>Semua teknik pemisahan bekerja dengan prinsip yang sama: <strong>cari satu
      sifat fisika yang berbeda antarkomponen, lalu manfaatkan perbedaan itu</strong>.
      Memilih teknik berarti memilih sifat mana yang paling mudah dibedakan.</p>

      <h3>Ringkasan lima teknik</h3>
      <table>
        <thead><tr><th>Teknik</th><th>Sifat yang dipakai</th><th>Contoh</th></tr></thead>
        <tbody>
          <tr><td>Filtrasi</td><td>Ukuran partikel</td><td>Santan dari ampas</td></tr>
          <tr><td>Destilasi</td><td>Titik didih</td><td>Air tawar dari air laut</td></tr>
          <tr><td>Kromatografi</td><td>Daya rambat pada kertas</td><td>Zat warna dalam tinta</td></tr>
          <tr><td>Sublimasi</td><td>Kemampuan menyublim</td><td>Kapur barus murni</td></tr>
          <tr><td>Kristalisasi</td><td>Kelarutan</td><td>Garam dari air laut</td></tr>
        </tbody>
      </table>

      <h3>Membaca hasil kromatografi</h3>
      <p>Jarak yang ditempuh tiap zat dibandingkan jarak pelarut disebut
      <strong>nilai Rf</strong>:</p>
      <span class="formula">Rf = jarak yang ditempuh zat ÷ jarak yang ditempuh pelarut</span>
      <p>Nilai Rf selalu antara 0 dan 1, dan khas untuk setiap zat pada pelarut tertentu.
      Karena itu kromatografi dipakai untuk mengenali zat, bukan sekadar memisahkan —
      misalnya mendeteksi pewarna terlarang dalam makanan.</p>

      <h3>Destilasi bertingkat</h3>
      <p>Bila komponennya banyak dan titik didihnya berdekatan, dipakai
      <strong>destilasi bertingkat</strong> dengan kolom bersekat. Cara inilah yang
      memisahkan minyak bumi menjadi bensin, solar, dan aspal.</p>

      <div class="callout" data-tone="tip">
        <strong>Mengapa destilat lebih murni?</strong>
        Hanya komponen dengan titik didih rendah yang menguap lebih dulu. Zat terlarut
        seperti garam tidak ikut menguap, sehingga tertinggal di labu didih.
      </div>
    `,

    explore: [
      'Jalankan <strong>Destilasi</strong> dan perhatikan termometer. Pada suhu berapa uap mulai mengalir?',
      'Jalankan <strong>Kromatografi</strong> dan baca nilai Rf ketiga zat warna. Mana yang paling cepat merambat?',
      'Bandingkan <strong>Kristalisasi</strong> dan <strong>Destilasi</strong> untuk memisahkan garam dari air. Keduanya bisa — apa bedanya hasil yang diperoleh?',
      'Teknik mana yang akan kamu pilih untuk memurnikan kapur barus yang tercampur pasir? Mengapa?'
    ],

    quiz: [
      {
        q: 'Air laut diubah menjadi air tawar yang dapat diminum. Teknik paling tepat adalah…',
        options: ['Filtrasi', 'Destilasi', 'Kromatografi', 'Sublimasi'],
        answer: 1,
        explain: 'Garam terlarut tidak dapat disaring karena partikelnya sangat kecil. Destilasi menguapkan air lalu mengembunkannya kembali, meninggalkan garam di labu didih.'
      },
      {
        q: 'Pada kromatografi kertas, zat yang paling jauh merambat memiliki…',
        options: [
          'Nilai Rf paling kecil',
          'Nilai Rf paling besar',
          'Massa paling besar',
          'Warna paling pekat'
        ],
        answer: 1,
        explain: 'Rf adalah perbandingan jarak zat terhadap jarak pelarut. Zat yang merambat paling jauh berarti nilai Rf-nya paling mendekati 1.'
      },
      {
        q: 'Campuran iodin dan pasir dipisahkan dengan sublimasi. Komponen mana yang menyublim?',
        options: ['Pasir', 'Iodin', 'Keduanya', 'Tidak ada'],
        answer: 1,
        explain: 'Iodin dapat berubah langsung dari padat menjadi gas ungu saat dipanaskan, lalu mengkristal kembali di permukaan dingin. Pasir tetap tertinggal di cawan.'
      },
      {
        q: 'Prinsip yang mendasari seluruh teknik pemisahan campuran adalah…',
        options: [
          'Memanaskan campuran sampai bereaksi',
          'Memanfaatkan perbedaan sifat fisika antarkomponen',
          'Menambahkan zat kimia pemisah',
          'Mengubah komponen menjadi zat baru'
        ],
        answer: 1,
        explain: 'Pemisahan campuran tidak mengubah zat penyusunnya. Yang dimanfaatkan selalu perbedaan sifat fisika seperti ukuran, titik didih, kelarutan, atau daya rambat.'
      }
    ]
  });
})();
