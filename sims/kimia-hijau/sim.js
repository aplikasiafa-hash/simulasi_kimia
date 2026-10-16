/* Kimia Hijau dan Jejak Karbon — Fase E
   Rancang ulang sebuah proses produksi: pilih bahan baku, pelarut, sumber
   energi, dan katalis; lalu baca ekonomi atom, limbah, dan emisi karbonnya. */

(function () {
  'use strict';

  const D = Sim.Draw, P = Sim.P;
  const C = Chem;

  const W = 790, H = 580;

  const PILIHAN = {
    bahan: [
      { n: 'Minyak bumi (fosil)',   atom: 0.42, emisi: 2.6, biaya: 1.0, catatan: 'Tak terbarukan, jejak karbon besar.' },
      { n: 'Biomassa (terbarukan)', atom: 0.68, emisi: 0.7, biaya: 1.3, catatan: 'Terbarukan, tetapi bersaing dengan lahan pangan.' },
      { n: 'Limbah pertanian',      atom: 0.74, emisi: 0.3, biaya: 0.8, catatan: 'Memanfaatkan sisa yang tadinya dibakar.' }
    ],
    pelarut: [
      { n: 'Benzena',       aman: 0.1, emisi: 1.4, limbah: 1.0, catatan: 'Karsinogenik dan mudah menguap. Dihindari.' },
      { n: 'Etanol',        aman: 0.7, emisi: 0.5, limbah: 0.4, catatan: 'Jauh lebih aman dan dapat didaur ulang.' },
      { n: 'Air',           aman: 1.0, emisi: 0.1, limbah: 0.1, catatan: 'Pelarut paling hijau bila reaksinya memungkinkan.' },
      { n: 'Tanpa pelarut', aman: 1.0, emisi: 0.0, limbah: 0.0, catatan: 'Reaksi fase padat atau lelehan. Paling ideal.' }
    ],
    energi: [
      { n: 'Batu bara',        emisi: 3.2, catatan: 'Emisi CO₂ terbesar per satuan energi.' },
      { n: 'Gas alam',         emisi: 1.8, catatan: 'Lebih bersih daripada batu bara, tetapi tetap fosil.' },
      { n: 'Listrik jaringan', emisi: 1.5, catatan: 'Bergantung bauran energi nasional.' },
      { n: 'Surya & angin',    emisi: 0.15, catatan: 'Hampir tanpa emisi langsung.' }
    ],
    katalis: [
      { n: 'Tanpa katalis',    suhu: 320, hasil: 0.55, catatan: 'Perlu suhu sangat tinggi, boros energi.' },
      { n: 'Katalis logam berat', suhu: 180, hasil: 0.82, catatan: 'Efektif, tetapi limbahnya beracun.' },
      { n: 'Katalis enzim',    suhu: 40,  hasil: 0.91, catatan: 'Bekerja di suhu rendah dan dapat terurai alami.' }
    ]
  };

  const PRINSIP = [
    'Mencegah limbah lebih baik daripada mengolahnya',
    'Memaksimalkan ekonomi atom',
    'Memakai bahan yang tidak berbahaya',
    'Merancang bahan kimia yang lebih aman',
    'Memakai pelarut yang aman',
    'Merancang proses hemat energi',
    'Memakai bahan baku terbarukan',
    'Mengurangi turunan yang tidak perlu',
    'Memakai katalis daripada pereaksi berlebih',
    'Merancang produk yang dapat terurai',
    'Memantau pencemaran secara langsung',
    'Mencegah kecelakaan kimia'
  ];

  function pilih(sim, kunci) {
    return PILIHAN[kunci][parseInt(sim.get(kunci), 10) || 0];
  }

  function nilai(sim) {
    const b = pilih(sim, 'bahan'), p = pilih(sim, 'pelarut');
    const e = pilih(sim, 'energi'), k = pilih(sim, 'katalis');
    const skala = sim.get('skala');

    const ekonomiAtom = Sim.clamp(b.atom * (0.6 + k.hasil * 0.5), 0, 1);
    const limbah = skala * (1 - ekonomiAtom) * (0.6 + p.limbah) * 10;
    const energiPakai = skala * (k.suhu / 100) * 0.9;
    const emisi = skala * (b.emisi * 0.4 + p.emisi * 0.2 + e.emisi * (k.suhu / 180) * 0.8);
    const keamanan = (p.aman * 0.6 + (k.n === 'Katalis logam berat' ? 0.2 : 0.8) * 0.4);

    // skor hijau 0..100
    const skor = Sim.clamp(
      ekonomiAtom * 30 +
      (1 - Sim.clamp(emisi / (skala * 3.2), 0, 1)) * 28 +
      (1 - Sim.clamp(limbah / (skala * 10), 0, 1)) * 22 +
      keamanan * 20, 0, 100);

    return {
      ekonomiAtom: ekonomiAtom, limbah: limbah, energi: energiPakai,
      emisi: emisi, keamanan: keamanan, skor: skor,
      hasil: skala * k.hasil * 10, suhu: k.suhu
    };
  }

  function siapkan(sim) { sim.data.riwayat = []; }

  Sim.create({
    title: 'Kimia Hijau dan Jejak Karbon',
    subtitle: 'Kimia hijau bukan sekadar membersihkan limbah, melainkan merancang proses yang sejak awal tidak menghasilkannya. Ubah empat pilihan dan lihat akibatnya.',
    fase: 'E', jenjang: 'SMA Kelas 10',
    topik: ['Kimia Hijau', 'Keberlanjutan'],
    stage: { w: W, h: H },
    showPlay: false,

    controls: [
      {
        title: 'Rancangan proses',
        items: [
          { type: 'select', id: 'bahan', value: 0, label: 'Bahan baku',
            options: PILIHAN.bahan.map(function (q, i) { return { value: i, label: q.n }; }) },
          { type: 'select', id: 'pelarut', value: 0, label: 'Pelarut',
            options: PILIHAN.pelarut.map(function (q, i) { return { value: i, label: q.n }; }) },
          { type: 'select', id: 'energi', value: 0, label: 'Sumber energi',
            options: PILIHAN.energi.map(function (q, i) { return { value: i, label: q.n }; }) },
          { type: 'select', id: 'katalis', value: 0, label: 'Katalis',
            options: PILIHAN.katalis.map(function (q, i) { return { value: i, label: q.n }; }) }
        ]
      },
      {
        title: 'Skala produksi',
        items: [
          { type: 'slider', id: 'skala', value: 10, min: 1, max: 50, step: 1,
            label: 'Produksi', unit: 'ton/hari', dec: 0 }
        ]
      },
      {
        title: 'Pembanding',
        items: [
          { type: 'buttons', label: '', items: [
            { label: 'Proses lama (1970-an)', onClick: function (sim) {
              sim.set('bahan', '0'); sim.set('pelarut', '0');
              sim.set('energi', '0'); sim.set('katalis', '0');
            } },
            { label: 'Proses terhijau', primary: true, onClick: function (sim) {
              sim.set('bahan', '2'); sim.set('pelarut', '3');
              sim.set('energi', '3'); sim.set('katalis', '2');
            } }
          ] },
          { type: 'toggle', id: 'prinsip', value: true, label: 'Tampilkan 12 prinsip' }
        ]
      }
    ],

    readouts: [
      { id: 'skor', label: 'Skor hijau', tone: 'accent' },
      { id: 'atom', label: 'Ekonomi atom' },
      { id: 'emisi', label: 'Emisi CO₂' },
      { id: 'limbah', label: 'Limbah' }
    ],

    setup: siapkan,
    reset: siapkan,

    draw: function (c, sim) {
      const v = nilai(sim);
      const skala = sim.get('skala');

      /* ---------- skor besar ---------- */
      const warnaSkor = v.skor >= 70 ? P.green : v.skor >= 45 ? P.amber : P.red;
      D.roundRect(c, 40, 40, 236, 150, 14, D.alpha(warnaSkor, 0.1), warnaSkor, 1.8);
      D.text(c, 'SKOR KIMIA HIJAU', 58, 62,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
      D.text(c, Math.round(v.skor), 58, 110,
        { size: 52, weight: 700, color: warnaSkor, base: 'middle', mono: true });
      D.text(c, '/ 100', 58 + D.measure(c, String(Math.round(v.skor)), { size: 52, weight: 700, mono: true }) + 10,
        118, { size: 17, weight: 600, color: P.faint, base: 'middle' });
      D.text(c, v.skor >= 70 ? 'Rancangan berkelanjutan'
        : v.skor >= 45 ? 'Masih bisa diperbaiki' : 'Berdampak besar pada lingkungan',
        58, 148, { size: 13, weight: 650, color: warnaSkor, base: 'middle' });

      // bilah skor
      D.roundRect(c, 58, 164, 200, 12, 6, 'rgba(255,255,255,.08)');
      D.roundRect(c, 58, 164, 200 * v.skor / 100, 12, 6, warnaSkor);

      /* ---------- empat ukuran ---------- */
      const UX = 296, UW = 462;
      D.roundRect(c, UX, 40, UW, 150, 14, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'DAMPAK PROSES', UX + 18, 62,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });

      const ukuran = [
        { n: 'Ekonomi atom', v: v.ekonomiAtom, maks: 1, teks: Math.round(v.ekonomiAtom * 100) + '%',
          baik: true, w: P.accent },
        { n: 'Emisi CO₂', v: v.emisi, maks: skala * 3.2, teks: Sim.fmt(v.emisi, 1) + ' ton/hari',
          baik: false, w: P.rose },
        { n: 'Limbah', v: v.limbah, maks: skala * 10, teks: Sim.fmt(v.limbah, 1) + ' ton/hari',
          baik: false, w: P.amber },
        { n: 'Keamanan bahan', v: v.keamanan, maks: 1, teks: Math.round(v.keamanan * 100) + '%',
          baik: true, w: P.blue }
      ];
      ukuran.forEach(function (u, i) {
        const y = 88 + i * 26;
        D.text(c, u.n, UX + 18, y, { size: 11.5, weight: 600, color: P.dim, base: 'middle' });
        const bx = UX + 140, bw = 200;
        D.roundRect(c, bx, y - 7, bw, 14, 7, 'rgba(255,255,255,.07)');
        const f = Sim.clamp(u.v / u.maks, 0, 1);
        D.roundRect(c, bx, y - 7, bw * f, 14, 7,
          u.baik ? D.ramp(['#ef6a52', '#f0a94a', '#6fcf7f'], f)
                 : D.ramp(['#6fcf7f', '#f0a94a', '#ef6a52'], f));
        D.text(c, u.teks, UX + UW - 18, y,
          { size: 11.5, weight: 700, color: u.w, align: 'r', base: 'middle', mono: true });
      });

      /* ---------- rincian pilihan ---------- */
      const PY = 206;
      D.roundRect(c, 40, PY, W - 80, 148, 14, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'EMPAT KEPUTUSAN PERANCANGAN', 58, PY + 20,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });

      const keputusan = [
        { label: 'Bahan baku', q: pilih(sim, 'bahan') },
        { label: 'Pelarut', q: pilih(sim, 'pelarut') },
        { label: 'Sumber energi', q: pilih(sim, 'energi') },
        { label: 'Katalis', q: pilih(sim, 'katalis') }
      ];
      keputusan.forEach(function (k, i) {
        const x = 58 + i * ((W - 140) / 4);
        const w = (W - 140) / 4 - 14;
        D.text(c, k.label.toUpperCase(), x, PY + 46,
          { size: 9.5, weight: 700, color: P.faint, base: 'middle' });
        D.text(c, k.q.n, x, PY + 68,
          { size: 13.5, weight: 700, color: P.accent2, base: 'middle' });
        // catatan dipenggal
        const kata = k.q.catatan.split(' ');
        let baris = [''];
        kata.forEach(function (wd) {
          const coba = baris[baris.length - 1] ? baris[baris.length - 1] + ' ' + wd : wd;
          if (D.measure(c, coba, { size: 11 }) > w) baris.push(wd);
          else baris[baris.length - 1] = coba;
        });
        baris.slice(0, 4).forEach(function (b, bi) {
          D.text(c, b, x, PY + 90 + bi * 15,
            { size: 11, weight: 500, color: P.dim, base: 'middle' });
        });
      });

      /* ---------- ekonomi atom ---------- */
      const EY = 370;
      D.roundRect(c, 40, EY, 364, 112, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'EKONOMI ATOM', 58, EY + 20,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
      D.text(c, 'Berapa persen massa pereaksi yang benar-benar masuk ke produk?',
        58, EY + 40, { size: 11.5, weight: 500, color: P.dim, base: 'middle' });

      // bilah terbagi: produk vs limbah
      const bw = 306;
      D.roundRect(c, 58, EY + 54, bw, 26, 5, 'rgba(255,255,255,.07)');
      D.roundRect(c, 58, EY + 54, bw * v.ekonomiAtom, 26, 5, P.accent);
      D.text(c, 'produk ' + Math.round(v.ekonomiAtom * 100) + '%',
        64, EY + 67, { size: 11.5, weight: 700, color: '#06201d', base: 'middle' });
      if (v.ekonomiAtom < 0.88) {
        D.text(c, 'limbah ' + Math.round((1 - v.ekonomiAtom) * 100) + '%',
          58 + bw - 6, EY + 67,
          { size: 11.5, weight: 700, color: P.amber, align: 'r', base: 'middle' });
      }
      D.text(c, 'Hasil produk: ' + Sim.fmt(v.hasil, 1) + ' ton/hari  ·  Suhu reaksi: ' +
        Math.round(v.suhu) + ' °C', 58, EY + 96,
        { size: 12, weight: 600, color: P.dim, base: 'middle' });

      /* ---------- 12 prinsip ---------- */
      if (sim.get('prinsip')) {
        const KX = 420, KW = 338;
        D.roundRect(c, KX, EY, KW, 112, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
        D.text(c, '12 PRINSIP KIMIA HIJAU (ANASTAS & WARNER, 1998)', KX + 16, EY + 20,
          { size: 9.5, weight: 700, color: P.faint, base: 'middle' });
        PRINSIP.slice(0, 8).forEach(function (p, i) {
          const x = KX + 16 + (i % 2) * 162;
          const y = EY + 40 + Math.floor(i / 2) * 17;
          D.text(c, (i + 1) + '. ' + (p.length > 28 ? p.slice(0, 26) + '…' : p), x, y,
            { size: 10, weight: 500, color: P.dim, base: 'middle' });
        });
        D.text(c, '…dan 4 prinsip lainnya tentang produk terurai, pemantauan, dan keselamatan.',
          KX + 16, EY + 100, { size: 10, weight: 500, color: P.faint, base: 'middle' });
      }

      /* ---------- perbandingan ---------- */
      const BY = 496;
      D.roundRect(c, 40, BY, W - 80, 66, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'DALAM SATU TAHUN PRODUKSI', 58, BY + 18,
        { size: 10, weight: 700, color: P.faint, base: 'middle' });
      const perTahun = [
        ['Emisi CO₂', Sim.fmt(v.emisi * 365, 0) + ' ton', P.rose],
        ['Limbah', Sim.fmt(v.limbah * 365, 0) + ' ton', P.amber],
        ['Produk', Sim.fmt(v.hasil * 365, 0) + ' ton', P.accent],
        ['Setara pohon untuk menyerap CO₂', Sim.fmt(v.emisi * 365 / 0.022, 0) + ' pohon', P.green]
      ];
      perTahun.forEach(function (q, i) {
        const x = 58 + i * ((W - 140) / 4);
        D.text(c, q[0], x, BY + 38, { size: 10.5, weight: 500, color: P.faint, base: 'middle' });
        D.text(c, q[1], x, BY + 56, { size: 15, weight: 700, color: q[2], base: 'middle', mono: true });
      });
    },

    readoutsUpdate: function (sim) {
      const v = nilai(sim);
      sim.readout('skor', Math.round(v.skor) + '<span class="unit"> / 100</span>',
        v.skor >= 70 ? 'accent' : v.skor >= 45 ? 'warn' : 'danger');
      sim.readout('atom', Math.round(v.ekonomiAtom * 100) + '<span class="unit">%</span>');
      sim.readout('emisi', Sim.fmt(v.emisi, 1) + '<span class="unit"> t/hari</span>');
      sim.readout('limbah', Sim.fmt(v.limbah, 1) + '<span class="unit"> t/hari</span>');
    },

    notes: `
      <p>Kimia hijau (<em>green chemistry</em>) adalah pendekatan merancang produk dan
      proses kimia yang <strong>mengurangi atau meniadakan penggunaan dan pembentukan
      zat berbahaya</strong>. Intinya bukan membersihkan limbah setelah terbentuk,
      melainkan merancang agar limbah itu tidak pernah ada.</p>

      <h3>Ekonomi atom</h3>
      <p>Ukuran paling khas dalam kimia hijau. Rendemen tinggi belum tentu hijau, karena
      rendemen hanya menghitung produk dibanding yang mungkin dihasilkan. Ekonomi atom
      menghitung berapa persen <strong>massa seluruh pereaksi</strong> yang benar-benar
      berakhir di produk.</p>

      <span class="formula">Ekonomi atom = (Mr produk yang diinginkan ÷ jumlah Mr seluruh pereaksi) × 100%</span>

      <p>Reaksi adisi memiliki ekonomi atom 100% karena seluruh atom pereaksi masuk ke
      produk. Reaksi substitusi dan eliminasi selalu menghasilkan produk samping,
      sehingga ekonomi atomnya lebih rendah.</p>

      <h3>Empat keputusan yang paling berpengaruh</h3>
      <ul>
        <li><strong>Bahan baku</strong> — terbarukan atau fosil. Limbah pertanian bahkan
            mengubah masalah menjadi sumber daya.</li>
        <li><strong>Pelarut</strong> — penyumbang terbesar volume limbah di industri kimia.
            Mengganti benzena dengan air atau meniadakan pelarut sama sekali adalah
            langkah besar.</li>
        <li><strong>Sumber energi</strong> — menentukan jejak karbon. Batu bara
            menghasilkan sekitar dua puluh kali emisi tenaga surya per satuan energi.</li>
        <li><strong>Katalis</strong> — menurunkan energi aktivasi sehingga reaksi dapat
            berlangsung pada suhu rendah. Katalis enzim bekerja pada suhu tubuh dan dapat
            terurai alami.</li>
      </ul>

      <h3>Jejak karbon</h3>
      <p>Jejak karbon adalah total gas rumah kaca yang dilepaskan suatu kegiatan,
      dinyatakan setara CO₂. Dalam industri kimia, penyumbang terbesarnya biasanya adalah
      <strong>energi untuk memanaskan reaktor</strong> — bukan reaksinya sendiri. Karena
      itu katalis yang menurunkan suhu reaksi punya dampak lingkungan yang besar.</p>

      <h3>Contoh nyata</h3>
      <p>Pembuatan ibuprofen dahulu memerlukan enam tahap dengan ekonomi atom sekitar 40%.
      Proses BHC yang lebih baru hanya tiga tahap dengan ekonomi atom 77%, dan hampir
      seluruh produk sampingnya dapat didaur ulang. Produknya sama, tetapi limbahnya
      berkurang drastis.</p>

      <div class="callout" data-tone="tip">
        <strong>Prinsip paling penting</strong>
        Prinsip pertama kimia hijau berbunyi: mencegah terbentuknya limbah selalu lebih
        baik daripada mengolah limbah setelah terbentuk. Semua prinsip lain pada dasarnya
        menjabarkan prinsip ini.
      </div>
    `,

    explore: [
      'Tekan <strong>Proses lama (1970-an)</strong> dan catat skornya. Lalu tekan <strong>Proses terhijau</strong>. Berapa selisihnya?',
      'Mulai dari proses lama, ganti <strong>hanya pelarutnya</strong> menjadi air. Berapa banyak limbah yang berkurang?',
      'Ganti <strong>hanya katalisnya</strong> menjadi enzim. Perhatikan suhu reaksi turun dari 320 °C ke 40 °C — bagaimana pengaruhnya pada emisi?',
      'Naikkan skala produksi menjadi 50 ton/hari. Apakah skor hijaunya berubah? Mengapa emisi tahunannya melonjak?'
    ],

    quiz: [
      {
        q: 'Prinsip pertama kimia hijau menyatakan bahwa…',
        options: [
          'Limbah harus diolah dengan teknologi terbaik',
          'Mencegah terbentuknya limbah lebih baik daripada mengolahnya',
          'Semua pelarut harus diganti air',
          'Produksi harus dikurangi'
        ],
        answer: 1,
        explain: 'Prinsip pencegahan menempatkan perancangan di awal: bila proses dirancang agar tidak menghasilkan limbah, biaya dan dampak pengolahan limbah hilang sama sekali.'
      },
      {
        q: 'Suatu reaksi memiliki rendemen 95% tetapi ekonomi atom hanya 35%. Apa artinya?',
        options: [
          'Reaksinya sangat hijau',
          'Hampir semua pereaksi menjadi produk',
          'Reaksi berhasil, tetapi sebagian besar massa pereaksi berakhir sebagai produk samping',
          'Perhitungannya pasti salah'
        ],
        answer: 2,
        explain: 'Rendemen mengukur keberhasilan reaksi dibanding hasil teoretis, sedangkan ekonomi atom mengukur berapa massa pereaksi yang masuk ke produk. Reaksi bisa berhasil sempurna namun tetap membuang banyak atom sebagai produk samping.'
      },
      {
        q: 'Mengapa penggunaan katalis termasuk prinsip kimia hijau?',
        options: [
          'Karena katalis ikut menjadi produk',
          'Karena katalis menurunkan energi aktivasi sehingga reaksi dapat berjalan pada suhu lebih rendah',
          'Karena katalis menambah hasil reaksi menjadi lebih dari 100%',
          'Karena katalis menggantikan pelarut'
        ],
        answer: 1,
        explain: 'Katalis menurunkan energi aktivasi, sehingga reaksi tidak memerlukan pemanasan setinggi sebelumnya. Energi yang dihemat berarti emisi karbon yang jauh lebih kecil. Katalis juga dipakai berulang, berbeda dengan pereaksi berlebih.'
      },
      {
        q: 'Jenis reaksi manakah yang secara teori memiliki ekonomi atom 100%?',
        options: ['Substitusi', 'Eliminasi', 'Adisi', 'Pembakaran'],
        answer: 2,
        explain: 'Pada reaksi adisi, seluruh atom pereaksi bergabung menjadi satu produk tanpa ada yang terbuang. Substitusi dan eliminasi selalu melepaskan sebagian atom sebagai produk samping.'
      }
    ]
  });
})();
