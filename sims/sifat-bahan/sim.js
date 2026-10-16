/* Memilih Bahan yang Tepat — Fase B
   Uji enam bahan untuk hantaran panas, hantaran listrik, kelenturan, dan daya
   serap air, lalu cocokkan bahan dengan benda yang tepat. */

(function () {
  'use strict';

  const D = Sim.Draw, P = Sim.P;

  // nilai 0..1
  const BAHAN = [
    { nama: 'Besi',    warna: '#aab4bd', panas: 0.95, listrik: 1.00, lentur: 0.08, serap: 0.00 },
    { nama: 'Tembaga', warna: '#c4703a', panas: 1.00, listrik: 1.00, lentur: 0.22, serap: 0.00 },
    { nama: 'Kayu',    warna: '#a8763f', panas: 0.12, listrik: 0.02, lentur: 0.18, serap: 0.50 },
    { nama: 'Plastik', warna: '#5fc0e0', panas: 0.08, listrik: 0.00, lentur: 0.55, serap: 0.02 },
    { nama: 'Karet',   warna: '#4a4f55', panas: 0.06, listrik: 0.00, lentur: 0.95, serap: 0.04 },
    { nama: 'Kain',    warna: '#d07a9e', panas: 0.10, listrik: 0.03, lentur: 0.98, serap: 0.90 }
  ];

  const UJI = {
    panas:   { label: 'Hantaran panas',  satuan: 'Konduktor / isolator panas' },
    listrik: { label: 'Hantaran listrik', satuan: 'Konduktor / isolator listrik' },
    lentur:  { label: 'Kelenturan',       satuan: 'Lentur / kaku' },
    serap:   { label: 'Daya serap air',   satuan: 'Menyerap / menolak air' }
  };

  const BENDA_COCOK = [
    { benda: 'Kabel listrik',   sifat: 'listrik', mau: 'tinggi', jawab: ['Tembaga', 'Besi'] },
    { benda: 'Pegangan panci',  sifat: 'panas',   mau: 'rendah', jawab: ['Kayu', 'Plastik', 'Karet'] },
    { benda: 'Handuk',          sifat: 'serap',   mau: 'tinggi', jawab: ['Kain'] },
    { benda: 'Ban sepeda',      sifat: 'lentur',  mau: 'tinggi', jawab: ['Karet'] },
    { benda: 'Wajan penggoreng',sifat: 'panas',   mau: 'tinggi', jawab: ['Besi', 'Tembaga'] },
    { benda: 'Jas hujan',       sifat: 'serap',   mau: 'rendah', jawab: ['Plastik', 'Karet'] }
  ];

  const W = 790, H = 510;

  function siapkan(sim) {
    sim.data.anim = 0;
    sim.data.jalan = false;
    sim.data.hasil = BAHAN.map(function () { return {}; });
    sim.data.tantangan = 0;
    sim.data.jawabanDipilih = null;
    sim.data.skor = 0;
    sim.data.dicoba = 0;
  }

  function nilai(sim) { return BAHAN[sim.get('bahan')][sim.get('uji')]; }

  function keterangan(uji, v) {
    if (uji === 'panas')   return v > 0.5 ? 'Konduktor panas' : 'Isolator panas';
    if (uji === 'listrik') return v > 0.5 ? 'Konduktor listrik' : 'Isolator listrik';
    if (uji === 'lentur')  return v > 0.5 ? 'Lentur' : 'Kaku';
    return v > 0.5 ? 'Menyerap air' : 'Menolak air';
  }

  Sim.create({
    title: 'Memilih Bahan yang Tepat',
    subtitle: 'Setiap bahan punya kelebihan masing-masing. Uji empat sifat penting, lalu putuskan bahan apa yang pantas dipakai untuk benda tertentu.',
    fase: 'B', jenjang: 'SD Kelas 3–4',
    topik: ['Sifat Materi', 'Teknologi'],
    stage: { w: W, h: H },
    showPlay: false,

    controls: [
      {
        title: 'Percobaan',
        items: [
          { type: 'select', id: 'bahan', value: 0, label: 'Bahan yang diuji',
            options: BAHAN.map(function (b, i) { return { value: i, label: b.nama }; }) },
          { type: 'segment', id: 'uji', value: 'panas', label: 'Jenis uji',
            options: [
              { value: 'panas', label: 'Panas' }, { value: 'listrik', label: 'Listrik' },
              { value: 'lentur', label: 'Lentur' }, { value: 'serap', label: 'Serap' }
            ] },
          { type: 'buttons', label: '', items: [
            { label: '▶ Jalankan uji', primary: true, onClick: function (sim) {
              sim.data.jalan = true; sim.data.anim = 0;
              sim.data.hasil[sim.get('bahan')][sim.get('uji')] = nilai(sim);
            } },
            { label: 'Uji semua', onClick: function (sim) {
              BAHAN.forEach(function (b, i) {
                Object.keys(UJI).forEach(function (u) { sim.data.hasil[i][u] = b[u]; });
              });
            } }
          ] }
        ]
      },
      {
        title: 'Tantangan mencocokkan',
        items: [
          { type: 'toggle', id: 'tantangan', value: false, label: 'Tampilkan tantangan',
            hint: 'Pilih bahan di panel kiri, lalu klik tombol "Ini jawabanku".' },
          { type: 'buttons', label: '', items: [
            { label: 'Ini jawabanku', primary: true, onClick: function (sim) {
              if (!sim.get('tantangan')) { sim.set('tantangan', true); return; }
              const t = BENDA_COCOK[sim.data.tantangan];
              const b = BAHAN[sim.get('bahan')];
              sim.data.dicoba++;
              sim.data.jawabanDipilih = t.jawab.indexOf(b.nama) >= 0 ? 'benar' : 'salah';
              if (sim.data.jawabanDipilih === 'benar') sim.data.skor++;
            } },
            { label: 'Soal berikutnya →', onClick: function (sim) {
              sim.data.tantangan = (sim.data.tantangan + 1) % BENDA_COCOK.length;
              sim.data.jawabanDipilih = null;
            } }
          ] }
        ]
      }
    ],

    readouts: [
      { id: 'hasil', label: 'Kesimpulan uji', tone: 'accent' },
      { id: 'nilai', label: 'Nilai relatif' },
      { id: 'skor', label: 'Skor tantangan' }
    ],

    setup: siapkan,
    reset: siapkan,

    onChange: function (sim, id) {
      if (id === 'bahan' || id === 'uji') { sim.data.anim = 0; sim.data.jalan = false; }
    },

    update: function (sim, dt) {
      if (sim.data.jalan) {
        sim.data.anim += dt * 0.6;
        if (sim.data.anim >= 1) { sim.data.anim = 1; sim.data.jalan = false; }
      }
    },

    draw: function (c, sim) {
      const b = BAHAN[sim.get('bahan')];
      const uji = sim.get('uji');
      const v = b[uji];
      const a = sim.data.anim;

      /* ----- panggung percobaan ----- */
      const EX = 36, EY = 54, EW = 380, EH = 240;
      D.roundRect(c, EX, EY, EW, EH, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'PERCOBAAN · ' + UJI[uji].label.toUpperCase(), EX + 18, EY + 18,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
      D.text(c, b.nama, EX + 18, EY + 42, { size: 20, weight: 700, color: b.warna, base: 'middle' });

      const cx = EX + EW / 2, cy = EY + 150;

      if (uji === 'panas') {
        // batang bahan dipanaskan di ujung kiri
        const bx = cx - 120, bw = 240, bh = 26;
        D.roundRect(c, bx, cy - bh / 2, bw, bh, 5, b.warna, 'rgba(255,255,255,.26)', 1.4);
        const rambat = Math.min(1, a * (0.15 + v));
        for (let i = 0; i < 40; i++) {
          const f = i / 40;
          if (f > rambat) break;
          const warna = D.ramp(['#ef6a52', '#f0a94a', '#f0d04a'], f / Math.max(rambat, 0.01));
          c.globalAlpha = 0.75 * (1 - f / Math.max(rambat, 0.01) * 0.55);
          D.roundRect(c, bx + bw * f, cy - bh / 2 + 2, bw / 40 + 1, bh - 4, 2, warna);
        }
        c.globalAlpha = 1;
        D.flame(c, bx - 6, cy + bh / 2 + 10, 0.85, sim.t);
        D.text(c, 'api', bx - 6, cy + bh / 2 + 34,
          { size: 10.5, weight: 600, color: P.amber, align: 'c', base: 'middle' });
        // termometer di ujung kanan
        const suhuUjung = 28 + rambat * v * 70;
        D.circle(c, bx + bw + 20, cy, 13,
          D.ramp(['#4a90d9', '#f0a94a', '#ef6a52'], (suhuUjung - 28) / 70), 'rgba(255,255,255,.3)', 1.4);
        D.text(c, Math.round(suhuUjung) + '°', bx + bw + 20, cy + 28,
          { size: 11.5, weight: 700, color: P.dim, align: 'c', base: 'middle' });
        D.text(c, v > 0.5 ? 'Panas cepat merambat ke ujung' : 'Ujung tetap dingin — panas tertahan',
          cx, cy + 62, { size: 13, weight: 600, color: v > 0.5 ? P.amber : P.blue, align: 'c', base: 'middle' });

      } else if (uji === 'listrik') {
        // rangkaian: baterai – bahan – lampu
        const by = cy;
        D.roundRect(c, cx - 150, by - 16, 40, 32, 4, '#3b434b', 'rgba(255,255,255,.26)', 1.4);
        D.text(c, '+ −', cx - 130, by, { size: 11, weight: 700, color: P.dim, align: 'c', base: 'middle' });
        D.line(c, cx - 110, by, cx - 56, by, 'rgba(230,236,240,.5)', 2.4);
        D.roundRect(c, cx - 56, by - 14, 90, 28, 5, b.warna, 'rgba(255,255,255,.26)', 1.4);
        D.text(c, b.nama, cx - 11, by, { size: 11, weight: 700, color: D.readable(b.warna), align: 'c', base: 'middle' });
        D.line(c, cx + 34, by, cx + 86, by, 'rgba(230,236,240,.5)', 2.4);
        const nyala = a * v;
        D.circle(c, cx + 108, by, 20 + nyala * 10, D.alpha('#f0d04a', nyala * 0.35));
        D.circle(c, cx + 108, by, 17, nyala > 0.4 ? '#f0d04a' : '#4a5057', 'rgba(255,255,255,.3)', 1.6);
        if (nyala > 0.4) {
          for (let i = 0; i < 8; i++) {
            const ang = i / 8 * Math.PI * 2;
            D.line(c, cx + 108 + Math.cos(ang) * 22, by + Math.sin(ang) * 22,
              cx + 108 + Math.cos(ang) * 29, by + Math.sin(ang) * 29,
              D.alpha('#f0d04a', nyala), 2);
          }
        }
        D.text(c, v > 0.5 ? 'Lampu menyala — arus mengalir' : 'Lampu padam — arus terputus',
          cx, cy + 62, { size: 13, weight: 600, color: v > 0.5 ? '#f0d04a' : P.dim, align: 'c', base: 'middle' });

      } else if (uji === 'lentur') {
        // batang ditekuk
        const bx = cx - 100;
        const tekuk = a * v * 54;
        c.beginPath();
        c.moveTo(bx, cy);
        c.quadraticCurveTo(bx + 100, cy + tekuk * 2, bx + 200, cy);
        c.strokeStyle = b.warna; c.lineWidth = 16; c.lineCap = 'round'; c.stroke();
        D.circle(c, bx, cy, 7, 'rgba(255,255,255,.4)');
        D.circle(c, bx + 200, cy, 7, 'rgba(255,255,255,.4)');
        // beban
        D.roundRect(c, cx - 15, cy + tekuk * 2 + 8, 30, 24, 4, '#6b7580', 'rgba(255,255,255,.26)', 1.2);
        D.text(c, '1 kg', cx, cy + tekuk * 2 + 20,
          { size: 10, weight: 700, color: P.dim, align: 'c', base: 'middle' });
        if (v < 0.12 && a > 0.7) {
          D.text(c, 'bahan patah!', cx, cy - 34,
            { size: 12, weight: 700, color: '#ef6a52', align: 'c', base: 'middle' });
        }
        D.text(c, v > 0.5 ? 'Melengkung banyak lalu kembali' : 'Hampir tidak melengkung — kaku',
          cx, cy + 86, { size: 13, weight: 600, color: v > 0.5 ? P.accent2 : P.dim, align: 'c', base: 'middle' });

      } else {
        // celup ke air
        const bx = cx - 40, by = cy - 60;
        const tinggi = a * v * 68;
        D.roundRect(c, bx, by, 80, 76, 5, b.warna, 'rgba(255,255,255,.26)', 1.4);
        c.save();
        c.beginPath(); c.rect(bx, by + 76 - tinggi, 80, tinggi); c.clip();
        D.roundRect(c, bx, by, 80, 76, 5, D.alpha('#4a9fd0', 0.6));
        c.restore();
        D.beaker(c, bx - 26, cy + 26, 132, 48, 0.72, D.alpha('#4a9fd0', 0.6), { ticks: false });
        for (let i = 0; i < Math.round(a * v * 9); i++) {
          D.circle(c, bx + 10 + i * 8, by + 76 - tinggi - 5 + Math.sin(sim.t * 3 + i) * 3, 2.6,
            D.alpha('#9fd4ee', 0.7));
        }
        D.text(c, v > 0.5 ? 'Air terserap naik ke dalam bahan' : 'Air tidak terserap — permukaan tetap kering',
          cx, cy + 96, { size: 13, weight: 600, color: v > 0.5 ? P.blue : P.dim, align: 'c', base: 'middle' });
      }

      /* ----- tabel hasil ----- */
      const TX = 440, TY = 54, TW = 316;
      D.roundRect(c, TX, TY, TW, 240, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'TABEL HASIL PENGAMATAN', TX + 16, TY + 18,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });

      const kolX = [TX + 16, TX + 110, TX + 160, TX + 210, TX + 262];
      ['Bahan', 'Panas', 'Listrik', 'Lentur', 'Serap'].forEach(function (h, i) {
        D.text(c, h, kolX[i], TY + 42, { size: 10, weight: 700, color: P.faint, base: 'middle' });
      });
      D.line(c, TX + 14, TY + 52, TX + TW - 14, TY + 52, 'rgba(255,255,255,.14)', 1);

      BAHAN.forEach(function (bb, i) {
        const y = TY + 72 + i * 29;
        const aktif = i === sim.get('bahan');
        if (aktif) D.roundRect(c, TX + 10, y - 12, TW - 20, 25, 4, 'rgba(79,209,192,.1)');
        D.circle(c, kolX[0] + 5, y, 5, bb.warna);
        D.text(c, bb.nama, kolX[0] + 15, y,
          { size: 11.5, weight: aktif ? 700 : 500, color: aktif ? P.accent2 : P.dim, base: 'middle' });
        ['panas', 'listrik', 'lentur', 'serap'].forEach(function (u, k) {
          const h = sim.data.hasil[i][u];
          if (h === undefined) {
            D.text(c, '·', kolX[k + 1] + 12, y, { size: 13, color: P.faint, align: 'c', base: 'middle' });
          } else {
            const tinggi = h > 0.5;
            D.roundRect(c, kolX[k + 1], y - 7, 34, 14, 7,
              tinggi ? D.alpha(P.accent, 0.22) : 'rgba(255,255,255,.07)');
            D.text(c, tinggi ? 'ya' : 'tidak', kolX[k + 1] + 17, y,
              { size: 9.5, weight: 700, color: tinggi ? P.accent2 : P.faint, align: 'c', base: 'middle' });
          }
        });
      });

      /* ----- tantangan ----- */
      if (sim.get('tantangan')) {
        const t = BENDA_COCOK[sim.data.tantangan];
        D.roundRect(c, 36, 318, W - 72, 150, 12,
          'rgba(255,255,255,.05)', 'rgba(255,255,255,.14)', 1.3);
        D.text(c, 'TANTANGAN ' + (sim.data.tantangan + 1) + ' DARI ' + BENDA_COCOK.length,
          54, 340, { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
        D.text(c, 'Bahan apa yang paling tepat untuk membuat ' + t.benda.toLowerCase() + '?',
          54, 368, { size: 16, weight: 650, color: P.text, base: 'middle' });
        D.text(c, 'Petunjuk: benda ini perlu ' + UJI[t.sifat].label.toLowerCase() +
          ' yang ' + (t.mau === 'tinggi' ? 'TINGGI' : 'RENDAH') + '.',
          54, 392, { size: 12.5, weight: 500, color: P.dim, base: 'middle' });

        D.text(c, 'Pilihanmu sekarang: ' + b.nama, 54, 424,
          { size: 13, weight: 600, color: P.accent2, base: 'middle' });

        if (sim.data.jawabanDipilih) {
          const benar = sim.data.jawabanDipilih === 'benar';
          const pesan = benar
            ? '✓ Tepat! ' + b.nama + ' memang cocok untuk ' + t.benda.toLowerCase() + '.'
            : '✗ Belum tepat. Lihat kolom ' + UJI[t.sifat].label.toLowerCase() + ' di tabel hasil.';
          D.roundRect(c, 54, 436, Math.min(W - 108, D.measure(c, pesan, { size: 13, weight: 650 }) + 28), 26, 13,
            benar ? 'rgba(111,207,127,.18)' : 'rgba(239,106,82,.18)',
            benar ? P.green : P.red, 1.3);
          D.text(c, pesan, 68, 449,
            { size: 13, weight: 650, color: benar ? P.green : P.red, base: 'middle' });
        }
      }
    },

    readoutsUpdate: function (sim) {
      const b = BAHAN[sim.get('bahan')];
      const uji = sim.get('uji');
      const tercatat = sim.data.hasil[sim.get('bahan')][uji];
      sim.readout('hasil', tercatat === undefined ? 'belum diuji' : keterangan(uji, tercatat));
      sim.readout('nilai', tercatat === undefined ? '—' : Math.round(tercatat * 100) + '<span class="unit">%</span>');
      sim.readout('skor', sim.data.skor + ' / ' + sim.data.dicoba);
    },

    notes: `
      <p>Benda di sekitar kita dibuat dari bahan yang dipilih dengan sengaja. Pemilihan
      itu selalu berdasarkan <strong>sifat bahan</strong>, bukan karena kebetulan.</p>

      <h3>Konduktor dan isolator</h3>
      <p>Bahan yang <strong>mudah menghantarkan</strong> panas atau listrik disebut
      <strong>konduktor</strong>. Umumnya logam seperti besi, tembaga, dan aluminium.
      Bahan yang <strong>sulit menghantarkan</strong> disebut <strong>isolator</strong>,
      misalnya kayu, plastik, dan karet.</p>

      <p>Perhatikan bahwa satu benda sering memakai keduanya sekaligus. Wajan memakai
      logam di bagian bawah supaya panas cepat masuk ke makanan, tetapi pegangannya
      memakai kayu atau plastik supaya tangan kita tidak kepanasan.</p>

      <h3>Kelenturan</h3>
      <p>Bahan lentur bisa berubah bentuk lalu kembali seperti semula. Karet dipakai
      untuk ban karena sifat ini. Bahan kaku seperti kaca justru patah bila dipaksa menekuk.</p>

      <h3>Daya serap air</h3>
      <p>Kain dan kertas punya serat berongga yang menarik air masuk, sehingga cocok
      untuk handuk dan tisu. Plastik dan karet menolak air, sehingga cocok untuk jas hujan
      dan payung.</p>

      <div class="callout" data-tone="tip">
        <strong>Cara berpikir seorang perancang</strong>
        Mulailah dari pertanyaan "benda ini harus bisa apa?" Baru setelah itu pilih
        bahan yang sifatnya paling mendukung. Urutan ini tidak pernah terbalik.
      </div>
    `,

    explore: [
      'Uji hantaran panas pada <strong>Tembaga</strong> lalu <strong>Kayu</strong>. Berapa lama panas sampai ke ujung?',
      'Uji hantaran listrik pada keenam bahan. Bahan apa saja yang membuat lampu menyala?',
      'Pakai <strong>Uji semua</strong> untuk mengisi tabel, lalu nyalakan tantangan dan kerjakan keenam soalnya.',
      'Pikirkan satu benda di rumahmu yang memakai dua bahan berbeda. Mengapa dirancang begitu?'
    ],

    quiz: [
      {
        q: 'Gagang setrika terbuat dari plastik, bukan besi. Alasan utamanya adalah…',
        options: [
          'Plastik lebih murah daripada besi',
          'Plastik isolator panas sehingga tangan tidak kepanasan',
          'Plastik lebih berat sehingga setrika stabil',
          'Plastik menyerap air dengan baik'
        ],
        answer: 1,
        explain: 'Plastik menghantarkan panas dengan sangat buruk. Panas dari badan setrika tidak merambat ke gagang, sehingga aman dipegang.'
      },
      {
        q: 'Kabel listrik terbuat dari tembaga yang dibungkus plastik. Peran masing-masing bahan adalah…',
        options: [
          'Tembaga isolator, plastik konduktor',
          'Tembaga konduktor listrik, plastik isolator pelindung',
          'Keduanya konduktor supaya arus lebih besar',
          'Keduanya isolator supaya aman'
        ],
        answer: 1,
        explain: 'Tembaga menghantarkan arus listrik dengan sangat baik, sedangkan plastik di luarnya tidak menghantarkan listrik sehingga melindungi kita dari sengatan.'
      },
      {
        q: 'Manakah bahan yang paling tepat untuk membuat handuk?',
        options: ['Plastik', 'Karet', 'Kain', 'Besi'],
        answer: 2,
        explain: 'Handuk perlu daya serap air yang tinggi. Serat kain memiliki banyak rongga yang menarik dan menampung air.'
      }
    ]
  });
})();
