/* Mengenal Sifat Benda — Fase A
   Pilih benda, jalankan empat uji sederhana, dan catat sifatnya di kartu. */

(function () {
  'use strict';

  const D = Sim.Draw, P = Sim.P;

  // keras 0..1, halus 0..1, lentur 0..1, massa jenis (g/cm³), serap 0..1
  const BENDA = [
    { nama: 'Batu',    warna: '#8d939a', keras: 0.95, halus: 0.45, lentur: 0.02, rho: 2.6,  serap: 0.05 },
    { nama: 'Spons',   warna: '#f0c860', keras: 0.08, halus: 0.30, lentur: 0.95, rho: 0.25, serap: 0.98 },
    { nama: 'Kayu',    warna: '#a8763f', keras: 0.70, halus: 0.55, lentur: 0.20, rho: 0.6,  serap: 0.45 },
    { nama: 'Karet',   warna: '#4a4f55', keras: 0.35, halus: 0.75, lentur: 0.90, rho: 1.2,  serap: 0.05 },
    { nama: 'Kaca',    warna: '#9fd4ee', keras: 0.90, halus: 0.98, lentur: 0.01, rho: 2.5,  serap: 0.00 },
    { nama: 'Kain',    warna: '#d07a9e', keras: 0.10, halus: 0.70, lentur: 0.98, rho: 0.4,  serap: 0.85 },
    { nama: 'Besi',    warna: '#aab4bd', keras: 1.00, halus: 0.85, lentur: 0.05, rho: 7.9,  serap: 0.00 },
    { nama: 'Plastik', warna: '#5fc0e0', keras: 0.55, halus: 0.90, lentur: 0.55, rho: 0.95, serap: 0.02 },
    { nama: 'Kertas',  warna: '#eee6d0', keras: 0.15, halus: 0.60, lentur: 0.80, rho: 0.8,  serap: 0.80 },
    { nama: 'Lilin',   warna: '#f2e8c8', keras: 0.25, halus: 0.80, lentur: 0.35, rho: 0.9,  serap: 0.01 }
  ];

  const UJI = [
    { id: 'tekan', label: 'Tekan', tanya: 'Keras atau lunak?' },
    { id: 'raba',  label: 'Raba',  tanya: 'Kasar atau halus?' },
    { id: 'tekuk', label: 'Tekuk', tanya: 'Lentur atau kaku?' },
    { id: 'air',   label: 'Celup', tanya: 'Terapung atau tenggelam?' }
  ];

  const W = 780, H = 500;
  const RAK_Y = 60;

  function siapkan(sim) {
    sim.data.pilih = 0;
    sim.data.anim = 0;
    sim.data.jalan = false;
    sim.data.catatan = BENDA.map(function () { return {}; });
  }

  function posisiBenda(i) {
    const kol = 5;
    const bx = 60 + (i % kol) * 78;
    const by = RAK_Y + Math.floor(i / kol) * 84;
    return { x: bx, y: by };
  }

  function sifatTeks(b, uji) {
    if (uji === 'tekan') return b.keras > 0.6 ? 'Keras' : b.keras > 0.3 ? 'Agak keras' : 'Lunak';
    if (uji === 'raba')  return b.halus > 0.7 ? 'Halus' : b.halus > 0.45 ? 'Agak halus' : 'Kasar';
    if (uji === 'tekuk') return b.lentur > 0.6 ? 'Lentur' : b.lentur > 0.3 ? 'Agak lentur' : 'Kaku';
    if (uji === 'air')   return b.rho < 1 ? 'Terapung' : 'Tenggelam';
    return '';
  }

  /* ---------------------------------------------------------- menggambar -- */

  function gambarContoh(c, b, x, y, r, tekan, tekuk) {
    c.save();
    c.translate(x, y);
    const sx = 1 + tekan * 0.3, sy = 1 - tekan * 0.42;
    c.scale(sx, sy);
    if (tekuk) c.rotate(Math.sin(tekuk * 8) * 0.3 * tekuk);
    D.roundRect(c, -r, -r * 0.72, r * 2, r * 1.44, Math.max(2, r * 0.22),
      b.warna, 'rgba(255,255,255,.3)', 1.5);
    // tekstur permukaan menunjukkan kasar/halus
    if (b.halus < 0.65) {
      for (let i = 0; i < 9; i++) {
        const px = -r + (i * 37 % (r * 1.85));
        D.line(c, px, -r * 0.6, px + 3, r * 0.6, 'rgba(0,0,0,.16)', 1.1);
      }
    } else {
      D.roundRect(c, -r * 0.72, -r * 0.5, r * 0.6, r * 0.3, 3, 'rgba(255,255,255,.3)');
    }
    c.restore();
  }

  Sim.create({
    title: 'Mengenal Sifat Benda',
    subtitle: 'Pilih sebuah benda, lalu jalankan uji. Setiap benda punya gabungan sifat yang berbeda — dan sifat itulah yang menentukan benda dipakai untuk apa.',
    fase: 'A', jenjang: 'SD Kelas 1–2',
    topik: ['Sifat Materi', 'Pengamatan'],
    stage: { w: W, h: H },
    showPlay: false,
    stageNote: 'Klik benda di rak untuk memilihnya',

    controls: [
      {
        title: 'Uji yang dijalankan',
        items: [
          { type: 'segment', id: 'uji', value: 'tekan', label: '',
            options: UJI.map(function (u) { return { value: u.id, label: u.label }; }),
            hint: 'Setiap uji menjawab satu pertanyaan tentang benda.' },
          { type: 'buttons', label: '', items: [
            { label: '▶ Jalankan uji', primary: true, onClick: function (sim) {
              sim.data.jalan = true; sim.data.anim = 0;
              const b = BENDA[sim.data.pilih];
              sim.data.catatan[sim.data.pilih][sim.get('uji')] = sifatTeks(b, sim.get('uji'));
            } }
          ] }
        ]
      },
      {
        title: 'Tampilan',
        items: [
          { type: 'toggle', id: 'kartu', value: true, label: 'Tampilkan kartu sifat',
            hint: 'Hasil uji dikumpulkan menjadi kartu identitas benda.' },
          { type: 'buttons', label: '', items: [
            { label: 'Uji semua sifat', onClick: function (sim) {
              const i = sim.data.pilih, b = BENDA[i];
              UJI.forEach(function (u) { sim.data.catatan[i][u.id] = sifatTeks(b, u.id); });
            } },
            { label: 'Hapus catatan', onClick: function (sim) {
              sim.data.catatan = BENDA.map(function () { return {}; });
            } }
          ] }
        ]
      }
    ],

    readouts: [
      { id: 'benda', label: 'Benda', tone: 'accent' },
      { id: 'hasil', label: 'Hasil uji' },
      { id: 'tercatat', label: 'Sifat tercatat' }
    ],

    setup: siapkan,
    reset: siapkan,

    onPointerDown: function (sim, x, y) {
      for (let i = 0; i < BENDA.length; i++) {
        const p = posisiBenda(i);
        if (Math.abs(p.x - x) < 34 && Math.abs(p.y - y) < 34) {
          sim.data.pilih = i;
          sim.data.jalan = false;
          sim.data.anim = 0;
          return;
        }
      }
    },

    update: function (sim, dt) {
      if (sim.data.jalan) {
        sim.data.anim += dt * 0.85;
        if (sim.data.anim >= 1) { sim.data.anim = 1; sim.data.jalan = false; }
      }
    },

    draw: function (c, sim) {
      const b = BENDA[sim.data.pilih];
      const uji = sim.get('uji');
      const a = sim.data.anim;
      const gel = sim.data.jalan ? Math.sin(a * Math.PI) : 0;

      // --- rak benda ---
      D.text(c, 'RAK BENDA — KLIK UNTUK MEMILIH', 60, 28,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
      BENDA.forEach(function (bb, i) {
        const p = posisiBenda(i);
        const dipilih = i === sim.data.pilih;
        const jml = Object.keys(sim.data.catatan[i]).length;
        if (dipilih) {
          D.roundRect(c, p.x - 34, p.y - 34, 68, 68, 10, 'rgba(79,209,192,.12)', P.accent, 2);
        }
        gambarContoh(c, bb, p.x, p.y - 4, 20, 0, 0);
        D.text(c, bb.nama, p.x, p.y + 24,
          { size: 10.5, weight: 600, color: dipilih ? P.accent2 : P.dim, align: 'c', base: 'middle' });
        if (jml) {
          D.circle(c, p.x + 25, p.y - 25, 8, P.accent);
          D.text(c, String(jml), p.x + 25, p.y - 25,
            { size: 9.5, weight: 800, color: '#06201d', align: 'c', base: 'middle' });
        }
      });

      // --- meja uji ---
      const MX = 440, MY = 268, MW = 300, MH = 190;
      D.roundRect(c, 40, MY - 26, 360, 216, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      const u = UJI.find(function (q) { return q.id === uji; });
      D.text(c, 'MEJA UJI · ' + u.label.toUpperCase(), 58, MY - 8,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
      D.text(c, u.tanya, 58, MY + 14, { size: 14, weight: 600, color: P.text, base: 'middle' });

      const cx = 220, cy = MY + 90;

      if (uji === 'tekan') {
        const tekan = gel * (1 - b.keras) * 0.9;
        // jari penekan
        const jy = cy - 58 + gel * (30 + (1 - b.keras) * 14);
        D.roundRect(c, cx - 11, jy - 34, 22, 36, 9, '#c9a88a', 'rgba(0,0,0,.2)', 1.2);
        gambarContoh(c, b, cx, cy, 34, tekan, 0);
        D.line(c, cx - 60, cy + 26, cx + 60, cy + 26, 'rgba(255,255,255,.2)', 2);
        if (a > 0.3) {
          D.text(c, sifatTeks(b, 'tekan'), cx, cy + 52,
            { size: 15, weight: 700, color: P.accent2, align: 'c', base: 'middle' });
        }

      } else if (uji === 'raba') {
        gambarContoh(c, b, cx, cy, 34, 0, 0);
        // jari bergerak menyapu permukaan
        const fx = cx - 46 + gel * 92;
        D.roundRect(c, fx - 9, cy - 56, 18, 30, 8, '#c9a88a', 'rgba(0,0,0,.2)', 1.2);
        if (sim.data.jalan && b.halus < 0.65) {
          for (let i = 0; i < 4; i++) {
            D.circle(c, fx + Math.sin(i * 2 + sim.t * 20) * 8, cy - 30 - i * 5, 1.8,
              D.alpha('#f0a94a', 0.6 - i * 0.12));
          }
        }
        if (a > 0.3) {
          D.text(c, sifatTeks(b, 'raba'), cx, cy + 52,
            { size: 15, weight: 700, color: P.accent2, align: 'c', base: 'middle' });
        }

      } else if (uji === 'tekuk') {
        gambarContoh(c, b, cx, cy, 34, 0, gel * b.lentur);
        if (b.lentur < 0.15 && gel > 0.6) {
          D.line(c, cx - 8, cy - 26, cx + 6, cy + 26, '#ef6a52', 2.6);
          D.text(c, 'patah!', cx + 48, cy,
            { size: 12, weight: 700, color: '#ef6a52', base: 'middle' });
        }
        if (a > 0.3) {
          D.text(c, sifatTeks(b, 'tekuk'), cx, cy + 52,
            { size: 15, weight: 700, color: P.accent2, align: 'c', base: 'middle' });
        }

      } else {
        // bak air
        const bx = cx - 72, by = cy - 54, bw = 144, bh = 104;
        D.beaker(c, bx, by, bw, bh, 0.78, D.alpha(P.air, 0.52), { ticks: false });
        const permukaan = by + bh * 0.22;
        const tenggelam = b.rho >= 1;
        const akhir = tenggelam ? by + bh - 26 : permukaan + 2;
        const mulai = by - 34;
        const oy = mulai + (akhir - mulai) * (sim.data.jalan ? a : (sim.data.anim ? 1 : 0));
        gambarContoh(c, b, cx, oy, 24, 0, 0);
        D.line(c, bx, permukaan, bx + bw, permukaan, 'rgba(255,255,255,.4)', 1.6);
        if (a > 0.5) {
          D.text(c, sifatTeks(b, 'air'), cx, by + bh + 22,
            { size: 15, weight: 700, color: P.accent2, align: 'c', base: 'middle' });
          D.text(c, 'massa jenis ' + Sim.fmt(b.rho, 2) + ' g/cm³ · air 1,00 g/cm³',
            cx, by + bh + 40, { size: 10.5, weight: 500, color: P.faint, align: 'c', base: 'middle' });
        }
      }

      // --- kartu sifat ---
      if (sim.get('kartu')) {
        D.roundRect(c, MX, MY - 26, MW, 216, 12, 'rgba(255,255,255,.05)', 'rgba(255,255,255,.14)', 1.3);
        D.text(c, 'KARTU SIFAT', MX + 18, MY - 8,
          { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
        D.text(c, b.nama, MX + 18, MY + 16,
          { size: 19, weight: 700, color: P.text, base: 'middle' });
        gambarContoh(c, b, MX + MW - 42, MY + 14, 18, 0, 0);

        const cat = sim.data.catatan[sim.data.pilih];
        UJI.forEach(function (uu, i) {
          const y = MY + 52 + i * 32;
          D.text(c, uu.tanya, MX + 18, y,
            { size: 11.5, weight: 500, color: P.dim, base: 'middle' });
          const nilai = cat[uu.id];
          D.text(c, nilai || 'belum diuji', MX + MW - 18, y, {
            size: 13, weight: 700,
            color: nilai ? P.accent2 : P.faint,
            align: 'r', base: 'middle'
          });
          D.line(c, MX + 18, y + 14, MX + MW - 18, y + 14, 'rgba(255,255,255,.08)', 1);
        });
      }
    },

    readoutsUpdate: function (sim) {
      const b = BENDA[sim.data.pilih];
      sim.readout('benda', b.nama);
      const cat = sim.data.catatan[sim.data.pilih];
      sim.readout('hasil', cat[sim.get('uji')] || '—');
      sim.readout('tercatat', Object.keys(cat).length + ' / 4');
    },

    notes: `
      <p>Setiap benda punya <strong>sifat</strong> — ciri khas yang bisa kita amati
      atau ukur. Sifat inilah yang membuat kita memilih bahan tertentu untuk
      keperluan tertentu.</p>

      <h3>Empat sifat yang diuji di sini</h3>
      <ul>
        <li><strong>Keras atau lunak</strong> — seberapa kuat benda menahan tekanan.
            Batu keras, spons lunak.</li>
        <li><strong>Kasar atau halus</strong> — bagaimana permukaannya terasa.
            Kaca halus, batu kasar.</li>
        <li><strong>Lentur atau kaku</strong> — apakah benda bisa ditekuk lalu kembali.
            Karet lentur, kaca kaku sampai patah.</li>
        <li><strong>Terapung atau tenggelam</strong> — ini bergantung pada
            <strong>massa jenis</strong>, yaitu berat benda dibanding ukurannya.</li>
      </ul>

      <h3>Mengapa ada yang terapung?</h3>
      <p>Benda terapung bila massa jenisnya <strong>lebih kecil daripada air</strong>
      (1 gram tiap sentimeter kubik). Kayu punya massa jenis sekitar 0,6 sehingga
      terapung. Besi 7,9 sehingga tenggelam. Perhatikan: ini bukan soal berat saja —
      sebatang kayu besar bisa lebih berat daripada paku besi kecil, tetapi kayu tetap
      terapung.</p>

      <div class="callout" data-tone="tip">
        <strong>Hubungkan dengan kehidupan</strong>
        Mengapa pegangan panci dibuat dari plastik, bukan besi? Mengapa ban dibuat dari
        karet, bukan kaca? Jawabannya selalu kembali ke sifat bahan.
      </div>
    `,

    explore: [
      'Uji <strong>Spons</strong> dan <strong>Batu</strong> dengan uji Tekan. Bandingkan seberapa dalam benda berubah bentuk.',
      'Celupkan <strong>Kayu</strong> lalu <strong>Besi</strong>. Keduanya padat, tetapi hasilnya berbeda — mengapa?',
      'Tekuk <strong>Kaca</strong>. Apa yang terjadi? Lalu tekuk <strong>Karet</strong>.',
      'Pakai tombol <strong>Uji semua sifat</strong> pada tiga benda, lalu bandingkan kartunya.'
    ],

    quiz: [
      {
        q: 'Sebuah benda memiliki massa jenis 0,8 g/cm³. Apa yang terjadi bila dimasukkan ke air?',
        options: ['Tenggelam ke dasar', 'Terapung di permukaan', 'Melayang di tengah', 'Larut dalam air'],
        answer: 1,
        explain: 'Massa jenis air adalah 1,0 g/cm³. Karena 0,8 lebih kecil daripada 1,0, benda itu terapung.'
      },
      {
        q: 'Mengapa karet dipilih sebagai bahan ban kendaraan?',
        options: [
          'Karena karet sangat keras dan kaku',
          'Karena karet lentur sehingga meredam guncangan',
          'Karena karet menyerap banyak air',
          'Karena karet lebih berat daripada besi'
        ],
        answer: 1,
        explain: 'Sifat lentur membuat karet bisa berubah bentuk saat menerima benturan lalu kembali seperti semula. Inilah yang meredam guncangan di jalan.'
      },
      {
        q: 'Spons dipakai untuk mengelap tumpahan air karena sifat apa?',
        options: ['Keras', 'Halus', 'Daya serap tinggi', 'Massa jenis besar'],
        answer: 2,
        explain: 'Spons memiliki banyak rongga kecil yang dapat menampung air, sehingga daya serapnya sangat tinggi.'
      }
    ]
  });
})();
