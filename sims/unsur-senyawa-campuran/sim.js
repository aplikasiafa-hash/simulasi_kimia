/* Unsur, Senyawa, dan Campuran — Fase D
   Klasifikasikan dua belas materi lewat pohon keputusan sambil melihat
   gambaran partikelnya pada tingkat mikroskopis. */

(function () {
  'use strict';

  const D = Sim.Draw, P = Sim.P;
  const C = Chem;

  /* pola: daftar partikel yang digambar.
     'A' = satu jenis atom, 'AB' = molekul dua unsur, dst. */
  const MATERI = [
    { nama: 'Gas oksigen', rumus: 'O2', gol: 'unsur', sub: 'Molekul unsur',
      pola: [['O', 'O']], warna: ['#e0533d'],
      cat: 'Hanya tersusun dari atom oksigen. Tidak dapat diuraikan lagi secara kimia.' },
    { nama: 'Logam tembaga', rumus: 'Cu', gol: 'unsur', sub: 'Unsur logam',
      pola: [['Cu']], warna: ['#c4703a'],
      cat: 'Hanya satu jenis atom, tersusun sebagai kisi logam.' },
    { nama: 'Gas helium', rumus: 'He', gol: 'unsur', sub: 'Unsur gas mulia',
      pola: [['He']], warna: ['#d67ae0'],
      cat: 'Atom tunggal yang stabil, tidak berikatan dengan atom lain.' },
    { nama: 'Serbuk belerang', rumus: 'S8', gol: 'unsur', sub: 'Molekul unsur',
      pola: [['S', 'S', 'S', 'S']], warna: ['#e8c84a'],
      cat: 'Delapan atom belerang membentuk cincin. Tetap satu jenis unsur.' },
    { nama: 'Air murni', rumus: 'H2O', gol: 'senyawa', sub: 'Senyawa molekuler',
      pola: [['O', 'H', 'H']], warna: ['#e0533d', '#f0f2f4'],
      cat: 'Hidrogen dan oksigen terikat dengan perbandingan tetap 2 : 1.' },
    { nama: 'Garam dapur', rumus: 'NaCl', gol: 'senyawa', sub: 'Senyawa ion',
      pola: [['Na', 'Cl']], warna: ['#8f72d8', '#5fcf5a'],
      cat: 'Ion Na⁺ dan Cl⁻ tersusun berselang-seling membentuk kristal.' },
    { nama: 'Gas karbon dioksida', rumus: 'CO2', gol: 'senyawa', sub: 'Senyawa molekuler',
      pola: [['C', 'O', 'O']], warna: ['#3a4248', '#e0533d'],
      cat: 'Satu atom karbon mengikat dua atom oksigen, selalu dengan perbandingan tetap.' },
    { nama: 'Gula pasir', rumus: 'C12H22O11', gol: 'senyawa', sub: 'Senyawa molekuler',
      pola: [['C', 'H', 'O']], warna: ['#3a4248', '#f0f2f4', '#e0533d'],
      cat: 'Molekul besar dari karbon, hidrogen, dan oksigen dengan perbandingan tetap.' },
    { nama: 'Udara', rumus: '—', gol: 'campuran', sub: 'Campuran homogen',
      pola: [['N', 'N'], ['O', 'O'], ['Ar']], warna: ['#4a7fd8', '#e0533d', '#d67ae0'],
      cat: 'Nitrogen 78%, oksigen 21%, sisanya gas lain. Perbandingannya bisa berubah.' },
    { nama: 'Air laut', rumus: '—', gol: 'campuran', sub: 'Campuran homogen',
      pola: [['O', 'H', 'H'], ['Na'], ['Cl']], warna: ['#e0533d', '#8f72d8', '#5fcf5a'],
      cat: 'Air, garam, dan zat lain tercampur merata. Kadar garamnya berbeda-beda.' },
    { nama: 'Air dan pasir', rumus: '—', gol: 'campuran', sub: 'Campuran heterogen',
      pola: [['O', 'H', 'H'], ['Si']], warna: ['#e0533d', '#c8a070'],
      cat: 'Batas antarkomponen terlihat jelas. Pasir mengendap di dasar.' },
    { nama: 'Perunggu', rumus: '—', gol: 'campuran', sub: 'Campuran homogen (paduan)',
      pola: [['Cu'], ['Sn']], warna: ['#c4703a', '#c3c6c9'],
      cat: 'Paduan tembaga dan timah. Perbandingannya diatur sesuai kebutuhan.' }
  ];

  const W = 790, H = 530;

  function siapkan(sim) {
    sim.data.idx = 0;
    sim.data.jawab = MATERI.map(function () { return null; });
    sim.data.benar = 0; sim.data.dijawab = 0;
    acakPartikel(sim);
  }

  function acakPartikel(sim) {
    const m = MATERI[parseInt(sim.get('materi'), 10) || 0];
    const butir = [];
    const n = 15;
    for (let i = 0; i < n; i++) {
      const pola = m.pola[i % m.pola.length];
      butir.push({
        x: Sim.rnd(0.1, 0.9), y: Sim.rnd(0.12, 0.88),
        a: Sim.rnd(0, Math.PI * 2),
        v: Sim.rnd(0.4, 1), pola: pola
      });
    }
    sim.data.butir = butir;
  }

  function jawab(sim, pilihan) {
    const i = parseInt(sim.get('materi'), 10) || 0;
    if (sim.data.jawab[i]) return;
    sim.data.jawab[i] = pilihan;
    sim.data.dijawab++;
    if (pilihan === MATERI[i].gol) sim.data.benar++;
  }

  Sim.create({
    title: 'Unsur, Senyawa, dan Campuran',
    subtitle: 'Perbedaan ketiganya paling jelas terlihat pada tingkat partikel. Amati gambaran mikroskopisnya, lalu putuskan golongan materinya.',
    fase: 'D', jenjang: 'SMP Kelas 7–9',
    topik: ['Klasifikasi Materi'],
    stage: { w: W, h: H },

    controls: [
      {
        title: 'Materi yang diamati',
        items: [
          { type: 'select', id: 'materi', value: 0, label: 'Pilih materi',
            options: MATERI.map(function (m, i) { return { value: i, label: (i + 1) + '. ' + m.nama }; }) },
          { type: 'buttons', label: '', items: [
            { label: '← Sebelumnya', onClick: function (sim) {
              const i = parseInt(sim.get('materi'), 10) || 0;
              sim.set('materi', String((i + MATERI.length - 1) % MATERI.length));
            } },
            { label: 'Berikutnya →', onClick: function (sim) {
              const i = parseInt(sim.get('materi'), 10) || 0;
              sim.set('materi', String((i + 1) % MATERI.length));
            } }
          ] }
        ]
      },
      {
        title: 'Golongkan materi ini',
        items: [
          { type: 'buttons', label: '', items: [
            { label: 'Unsur', onClick: function (sim) { jawab(sim, 'unsur'); } },
            { label: 'Senyawa', onClick: function (sim) { jawab(sim, 'senyawa'); } },
            { label: 'Campuran', onClick: function (sim) { jawab(sim, 'campuran'); } }
          ] },
          { type: 'toggle', id: 'kunci', value: false, label: 'Tampilkan kunci jawaban' }
        ]
      },
      {
        title: 'Tampilan',
        items: [
          { type: 'toggle', id: 'gerak', value: true, label: 'Partikel bergerak' },
          { type: 'toggle', id: 'pohon', value: true, label: 'Tampilkan pohon keputusan' },
          { type: 'buttons', label: '', items: [
            { label: 'Hapus jawaban', onClick: function (sim) {
              sim.data.jawab = MATERI.map(function () { return null; });
              sim.data.benar = 0; sim.data.dijawab = 0;
            } }
          ] }
        ]
      }
    ],

    readouts: [
      { id: 'gol', label: 'Golongan', tone: 'accent' },
      { id: 'skor', label: 'Skor' },
      { id: 'maju', label: 'Terjawab' }
    ],

    setup: siapkan,
    reset: siapkan,
    onChange: function (sim, id) { if (id === 'materi') acakPartikel(sim); },

    update: function (sim, dt) {
      if (!sim.get('gerak')) return;
      sim.data.butir.forEach(function (b) {
        b.x += Math.cos(b.a) * b.v * dt * 0.07;
        b.y += Math.sin(b.a) * b.v * dt * 0.07;
        if (b.x < 0.08 || b.x > 0.92) { b.a = Math.PI - b.a; b.x = Sim.clamp(b.x, 0.08, 0.92); }
        if (b.y < 0.1 || b.y > 0.9) { b.a = -b.a; b.y = Sim.clamp(b.y, 0.1, 0.9); }
      });
    },

    draw: function (c, sim) {
      const i = parseInt(sim.get('materi'), 10) || 0;
      const m = MATERI[i];
      const jawabUser = sim.data.jawab[i];
      const tampilKunci = sim.get('kunci') || jawabUser;

      /* ---------- panggung mikroskopis ---------- */
      const VX = 36, VY = 92, VW = 400, VH = 290;
      D.roundRect(c, VX, VY, VW, VH, 14, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'TAMPAK MIKROSKOPIS', VX + 18, VY - 22,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
      D.text(c, m.nama + (m.rumus !== '—' ? '  ·  ' + Sim.formula(m.rumus) : ''),
        VX, VY - 44, { size: 19, weight: 700, color: P.text, base: 'middle' });

      c.save();
      c.beginPath(); c.rect(VX + 4, VY + 4, VW - 8, VH - 8); c.clip();
      sim.data.butir.forEach(function (b) {
        const px = VX + b.x * VW, py = VY + b.y * VH;
        if (b.pola.length === 1) {
          const sym = b.pola[0];
          D.atom(c, px, py, 13, C.warnaAtom(sym), sym, { size: 11 });
        } else {
          // molekul: atom pertama di tengah, sisanya mengelilingi
          const pusat = b.pola[0];
          for (let k = 1; k < b.pola.length; k++) {
            const ang = b.a + (k - 1) / (b.pola.length - 1) * Math.PI * 1.5;
            const ox = px + Math.cos(ang) * 17, oy = py + Math.sin(ang) * 17;
            D.line(c, px, py, ox, oy, 'rgba(255,255,255,.3)', 3.4);
          }
          for (let k = 1; k < b.pola.length; k++) {
            const ang = b.a + (k - 1) / (b.pola.length - 1) * Math.PI * 1.5;
            const ox = px + Math.cos(ang) * 17, oy = py + Math.sin(ang) * 17;
            D.atom(c, ox, oy, 10, C.warnaAtom(b.pola[k]), b.pola[k], { size: 9 });
          }
          D.atom(c, px, py, 13, C.warnaAtom(pusat), pusat, { size: 11 });
        }
      });
      c.restore();

      // keterangan jumlah jenis partikel
      const jenisSet = {};
      m.pola.forEach(function (p) { jenisSet[p.join('')] = true; });
      D.roundRect(c, VX + 10, VY + VH - 34, 200, 24, 6, 'rgba(0,0,0,.4)');
      D.text(c, Object.keys(jenisSet).length + ' jenis partikel berbeda terlihat',
        VX + 22, VY + VH - 22, { size: 11.5, weight: 600, color: P.dim, base: 'middle' });

      /* ---------- pohon keputusan ---------- */
      if (sim.get('pohon')) {
        const TX = 456, TW = 300;
        D.roundRect(c, TX, VY, TW, VH, 14, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
        D.text(c, 'POHON KEPUTUSAN', TX + 18, VY + 20,
          { size: 10.5, weight: 700, color: P.faint, base: 'middle' });

        const q = [
          { t: 'Dapatkah dipisahkan secara fisika\n(disaring, diuapkan, didiamkan)?',
            jawabBenar: m.gol === 'campuran' ? 'Ya → CAMPURAN' : 'Tidak → zat tunggal' },
          { t: 'Dapatkah diuraikan menjadi\nzat lebih sederhana secara kimia?',
            jawabBenar: m.gol === 'campuran' ? '—' : (m.gol === 'senyawa' ? 'Ya → SENYAWA' : 'Tidak → UNSUR') },
          { t: 'Apakah perbandingan penyusunnya tetap?',
            jawabBenar: m.gol === 'campuran' ? 'Tidak tetap' : 'Tetap' }
        ];

        q.forEach(function (qq, k) {
          const y = VY + 48 + k * 78;
          D.roundRect(c, TX + 18, y, TW - 36, 64, 9, 'rgba(255,255,255,.04)',
            'rgba(255,255,255,.12)', 1.2);
          qq.t.split('\n').forEach(function (baris, bi) {
            D.text(c, baris, TX + 32, y + 18 + bi * 14,
              { size: 11.5, weight: 600, color: P.dim, base: 'middle' });
          });
          if (tampilKunci) {
            D.text(c, qq.jawabBenar, TX + 32, y + 50,
              { size: 12.5, weight: 700, color: P.accent2, base: 'middle' });
          } else {
            D.text(c, '— jawab sendiri —', TX + 32, y + 50,
              { size: 12, weight: 500, color: P.faint, base: 'middle' });
          }
        });
      }

      /* ---------- hasil & catatan ---------- */
      D.roundRect(c, 36, 400, W - 72, 72, 12,
        jawabUser
          ? (jawabUser === m.gol ? 'rgba(111,207,127,.1)' : 'rgba(239,106,82,.1)')
          : 'rgba(255,255,255,.04)',
        jawabUser ? (jawabUser === m.gol ? P.green : P.red) : 'rgba(255,255,255,.12)', 1.4);

      if (jawabUser) {
        const benar = jawabUser === m.gol;
        D.text(c, (benar ? '✓ Tepat — ' : '✗ Jawabanmu: ' + jawabUser + ' — ') +
          m.gol.toUpperCase() + ' (' + m.sub + ')',
          56, 424, { size: 15, weight: 700, color: benar ? P.green : P.red, base: 'middle' });
        D.text(c, m.cat, 56, 448, { size: 12.5, weight: 500, color: P.dim, base: 'middle' });
      } else if (sim.get('kunci')) {
        D.text(c, m.gol.toUpperCase() + ' — ' + m.sub, 56, 424,
          { size: 15, weight: 700, color: P.accent2, base: 'middle' });
        D.text(c, m.cat, 56, 448, { size: 12.5, weight: 500, color: P.dim, base: 'middle' });
      } else {
        D.text(c, 'Golongkan materi ini memakai tombol di panel kanan.', 56, 428,
          { size: 14, weight: 600, color: P.dim, base: 'middle' });
        D.text(c, 'Amati berapa jenis partikel yang terlihat dan apakah terikat atau terpisah.',
          56, 450, { size: 12, weight: 500, color: P.faint, base: 'middle' });
      }

      /* ---------- deret kemajuan ---------- */
      MATERI.forEach(function (mm, k) {
        const x = 46 + k * 31;
        const j = sim.data.jawab[k];
        const aktif = k === i;
        const warna = !j ? 'rgba(255,255,255,.12)' : (j === mm.gol ? P.green : P.red);
        D.roundRect(c, x, 486, 24, 24, 5,
          aktif ? D.alpha(P.accent, 0.2) : 'rgba(255,255,255,.04)',
          aktif ? P.accent : warna, aktif ? 2 : 1.3);
        D.text(c, String(k + 1), x + 12, 498,
          { size: 11, weight: 700, align: 'c', base: 'middle',
            color: aktif ? P.accent2 : (!j ? P.faint : warna) });
      });
    },

    readoutsUpdate: function (sim) {
      const i = parseInt(sim.get('materi'), 10) || 0;
      const m = MATERI[i];
      const tampil = sim.get('kunci') || sim.data.jawab[i];
      sim.readout('gol', tampil ? m.gol : 'tersembunyi');
      sim.readout('skor', sim.data.benar + ' / ' + MATERI.length);
      sim.readout('maju', sim.data.dijawab + ' / ' + MATERI.length);
    },

    notes: `
      <p>Semua materi dapat digolongkan dengan dua pertanyaan berurutan. Pertanyaan
      pertama memisahkan <strong>zat tunggal</strong> dari <strong>campuran</strong>;
      pertanyaan kedua memisahkan <strong>unsur</strong> dari <strong>senyawa</strong>.</p>

      <h3>Unsur</h3>
      <p>Zat tunggal yang <strong>tidak dapat diuraikan lagi</strong> menjadi zat yang
      lebih sederhana dengan cara kimia biasa. Hanya tersusun dari satu jenis atom.
      Sampai saat ini dikenal 118 unsur. Contoh: besi (Fe), oksigen (O₂), helium (He),
      belerang (S₈).</p>

      <p>Perhatikan: O₂ tetap unsur walaupun terdiri dari dua atom, karena kedua atomnya
      sejenis.</p>

      <h3>Senyawa</h3>
      <p>Zat tunggal yang terbentuk dari <strong>dua unsur atau lebih</strong> melalui
      reaksi kimia, dengan <strong>perbandingan massa yang tetap</strong>. Sifat senyawa
      sangat berbeda dari unsur penyusunnya.</p>

      <p>Contoh yang paling terkenal: natrium adalah logam yang meledak di air, klorin
      adalah gas beracun. Tetapi gabungannya, NaCl, adalah garam dapur yang kita makan
      setiap hari.</p>

      <h3>Campuran</h3>
      <p>Gabungan dua zat atau lebih yang <strong>tidak bereaksi</strong> dan
      perbandingannya <strong>dapat berubah-ubah</strong>. Setiap komponen tetap
      mempertahankan sifatnya dan dapat dipisahkan secara fisika.</p>
      <ul>
        <li><strong>Homogen</strong> — tercampur merata, batasnya tidak terlihat.
            Contoh: udara, air garam, perunggu.</li>
        <li><strong>Heterogen</strong> — batas antarkomponen terlihat.
            Contoh: air dan pasir, minyak dan air, beton.</li>
      </ul>

      <div class="callout" data-tone="tip">
        <strong>Petunjuk dari gambar partikel</strong>
        Satu jenis bola → unsur. Satu jenis molekul dengan bola berbeda warna yang terikat
        → senyawa. Beberapa jenis partikel berbeda yang berdampingan tanpa terikat → campuran.
      </div>
    `,

    explore: [
      'Bandingkan gambar partikel <strong>Gas oksigen</strong> dan <strong>Udara</strong>. Keduanya gas — apa bedanya?',
      'Lihat <strong>Garam dapur</strong> lalu <strong>Air laut</strong>. Satu senyawa, satu campuran. Dari mana kita tahu?',
      'Perhatikan <strong>Serbuk belerang (S₈)</strong>. Delapan atom, tetapi tetap unsur. Mengapa?',
      'Kerjakan keduabelas materi tanpa membuka kunci. Berapa skormu?'
    ],

    quiz: [
      {
        q: 'Gas oksigen (O₂) tergolong unsur meskipun terdiri dari dua atom. Alasannya adalah…',
        options: [
          'Karena berwujud gas',
          'Karena kedua atomnya berjenis sama',
          'Karena jumlahnya hanya dua',
          'Karena tidak berwarna'
        ],
        answer: 1,
        explain: 'Unsur ditentukan oleh jenis atomnya, bukan jumlahnya. Karena kedua atom penyusun O₂ sama-sama oksigen, zat ini tetap tergolong unsur.'
      },
      {
        q: 'Natrium adalah logam yang bereaksi hebat dengan air, klorin adalah gas beracun. Tetapi NaCl aman dimakan. Hal ini menunjukkan bahwa…',
        options: [
          'Sifat senyawa berbeda dari sifat unsur penyusunnya',
          'Natrium dan klorin sebenarnya tidak berbahaya',
          'NaCl adalah campuran',
          'Reaksi kimia tidak mengubah sifat zat'
        ],
        answer: 0,
        explain: 'Dalam senyawa, atom-atom terikat dan membentuk zat baru dengan sifat yang sama sekali berbeda dari unsur asalnya. Inilah ciri pokok senyawa.'
      },
      {
        q: 'Manakah yang merupakan campuran homogen?',
        options: ['Air dan minyak', 'Air dan pasir', 'Udara', 'Air murni'],
        answer: 2,
        explain: 'Udara adalah campuran gas yang tercampur merata sehingga batas antarkomponennya tidak terlihat. Air murni bukan campuran, melainkan senyawa.'
      },
      {
        q: 'Perbedaan utama senyawa dan campuran terletak pada…',
        options: [
          'Wujudnya',
          'Warnanya',
          'Perbandingan penyusunnya tetap atau tidak',
          'Jumlah unsurnya'
        ],
        answer: 2,
        explain: 'Senyawa selalu punya perbandingan massa penyusun yang tetap (air selalu 1 : 8 massa H : O). Pada campuran, perbandingannya bebas — air garam bisa dibuat encer atau pekat.'
      }
    ]
  });
})();
