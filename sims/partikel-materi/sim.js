/* Partikel Materi: Atom, Molekul, dan Ion — Fase D
   Bangun partikel dari atom-atom, lalu kenali jenisnya: atom tunggal,
   molekul unsur, molekul senyawa, atau ion. */

(function () {
  'use strict';

  const D = Sim.Draw, P = Sim.P;
  const C = Chem;

  const CONTOH = {
    'he':   { label: 'He — atom helium',          atom: [['He', 0, 0]], muatan: 0 },
    'fe':   { label: 'Fe — atom besi',            atom: [['Fe', 0, 0]], muatan: 0 },
    'h2':   { label: 'H₂ — molekul unsur',        atom: [['H', -22, 0], ['H', 22, 0]], muatan: 0, ikat: [[0, 1]] },
    'o2':   { label: 'O₂ — molekul unsur',        atom: [['O', -26, 0], ['O', 26, 0]], muatan: 0, ikat: [[0, 1]] },
    'p4':   { label: 'P₄ — molekul unsur',        atom: [['P', 0, -28], ['P', -28, 18], ['P', 28, 18], ['P', 0, 6]], muatan: 0,
              ikat: [[0, 1], [0, 2], [1, 2], [0, 3], [1, 3], [2, 3]] },
    'h2o':  { label: 'H₂O — molekul senyawa',     atom: [['O', 0, -6], ['H', -30, 18], ['H', 30, 18]], muatan: 0, ikat: [[0, 1], [0, 2]] },
    'co2':  { label: 'CO₂ — molekul senyawa',     atom: [['C', 0, 0], ['O', -40, 0], ['O', 40, 0]], muatan: 0, ikat: [[0, 1], [0, 2]] },
    'nh3':  { label: 'NH₃ — molekul senyawa',     atom: [['N', 0, -8], ['H', -32, 18], ['H', 0, 30], ['H', 32, 18]], muatan: 0, ikat: [[0, 1], [0, 2], [0, 3]] },
    'ch4':  { label: 'CH₄ — molekul senyawa',     atom: [['C', 0, 0], ['H', -32, -24], ['H', 32, -24], ['H', -32, 26], ['H', 32, 26]], muatan: 0,
              ikat: [[0, 1], [0, 2], [0, 3], [0, 4]] },
    'na+':  { label: 'Na⁺ — ion positif',         atom: [['Na', 0, 0]], muatan: 1 },
    'cl-':  { label: 'Cl⁻ — ion negatif',         atom: [['Cl', 0, 0]], muatan: -1 },
    'mg2+': { label: 'Mg²⁺ — ion positif',        atom: [['Mg', 0, 0]], muatan: 2 },
    'oh-':  { label: 'OH⁻ — ion poliatom',        atom: [['O', -16, 0], ['H', 18, 0]], muatan: -1, ikat: [[0, 1]] },
    'so42-':{ label: 'SO₄²⁻ — ion poliatom',      atom: [['S', 0, 0], ['O', 0, -36], ['O', 0, 36], ['O', -36, 0], ['O', 36, 0]], muatan: -2,
              ikat: [[0, 1], [0, 2], [0, 3], [0, 4]] },
    'nh4+': { label: 'NH₄⁺ — ion poliatom',       atom: [['N', 0, 0], ['H', -30, -24], ['H', 30, -24], ['H', -30, 26], ['H', 30, 26]], muatan: 1,
              ikat: [[0, 1], [0, 2], [0, 3], [0, 4]] }
  };

  const W = 790, H = 520;

  function jenisPartikel(p) {
    const unsur = {};
    p.atom.forEach(function (a) { unsur[a[0]] = true; });
    const nUnsur = Object.keys(unsur).length;
    if (p.muatan !== 0) return p.atom.length > 1 ? 'Ion poliatom' : 'Ion monoatom';
    if (p.atom.length === 1) return 'Atom';
    return nUnsur === 1 ? 'Molekul unsur' : 'Molekul senyawa';
  }

  function penjelasan(jenis) {
    return {
      'Atom': 'Partikel terkecil suatu unsur yang masih memiliki sifat unsur itu. Berdiri sendiri, tidak bermuatan.',
      'Molekul unsur': 'Gabungan dua atau lebih atom dari unsur yang SAMA. Tidak bermuatan.',
      'Molekul senyawa': 'Gabungan atom dari unsur yang BERBEDA. Tidak bermuatan.',
      'Ion monoatom': 'Atom tunggal yang melepas atau menerima elektron sehingga bermuatan listrik.',
      'Ion poliatom': 'Gabungan beberapa atom yang secara keseluruhan bermuatan listrik.'
    }[jenis];
  }

  function siapkan(sim) {
    sim.data.putar = 0;
    sim.data.sorot = -1;
  }

  Sim.create({
    title: 'Partikel Materi: Atom, Molekul, dan Ion',
    subtitle: 'Semua materi tersusun dari partikel yang sangat kecil. Pilih partikelnya, periksa atom penyusunnya, dan pelajari cara menggolongkannya.',
    fase: 'D', jenjang: 'SMP Kelas 7–9',
    topik: ['Partikel Materi', 'Atom'],
    stage: { w: W, h: H },
    stageNote: 'Arahkan kursor ke atom untuk melihat lambangnya',

    controls: [
      {
        title: 'Partikel yang ditampilkan',
        items: [
          { type: 'select', id: 'partikel', value: 'h2o', label: 'Pilih partikel',
            options: Object.keys(CONTOH).map(function (k) {
              return { value: k, label: CONTOH[k].label }; }) }
        ]
      },
      {
        title: 'Tampilan',
        items: [
          { type: 'toggle', id: 'nama', value: true, label: 'Tampilkan nama unsur' },
          { type: 'toggle', id: 'ikatan', value: true, label: 'Tampilkan ikatan' },
          { type: 'toggle', id: 'putar', value: true, label: 'Putar perlahan' },
          { type: 'slider', id: 'zoom', value: 1.5, min: 0.8, max: 2.4, step: 0.1,
            label: 'Perbesaran', unit: '×', dec: 1 }
        ]
      },
      {
        title: 'Pohon penggolongan',
        items: [
          { type: 'toggle', id: 'pohon', value: true, label: 'Tampilkan alur penggolongan',
            hint: 'Tiga pertanyaan berurutan yang menentukan jenis partikel.' }
        ]
      }
    ],

    readouts: [
      { id: 'jenis', label: 'Jenis partikel', tone: 'accent' },
      { id: 'atom', label: 'Jumlah atom' },
      { id: 'unsur', label: 'Jenis unsur' },
      { id: 'muatan', label: 'Muatan' }
    ],

    setup: siapkan,
    reset: siapkan,

    onPointerMove: function (sim, x, y) {
      const p = CONTOH[sim.get('partikel')];
      const z = sim.get('zoom');
      const cx = 250, cy = 230;
      sim.data.sorot = -1;
      p.atom.forEach(function (a, i) {
        const r = Math.max(13, C.jariAtom(a[0]) * 0.17) * z;
        const ang = sim.data.putar;
        const ax = cx + (a[1] * Math.cos(ang) - a[2] * Math.sin(ang)) * z;
        const ay = cy + (a[1] * Math.sin(ang) + a[2] * Math.cos(ang)) * z;
        if (Math.hypot(ax - x, ay - y) < r) sim.data.sorot = i;
      });
    },

    update: function (sim, dt) {
      if (sim.get('putar')) sim.data.putar += dt * 0.22;
    },

    draw: function (c, sim) {
      const p = CONTOH[sim.get('partikel')];
      const z = sim.get('zoom');
      const ang = sim.data.putar;
      const cx = 250, cy = 230;
      const jenis = jenisPartikel(p);

      /* ---------- panggung partikel ---------- */
      D.roundRect(c, 36, 60, 420, 400, 14, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'PARTIKEL', 56, 82, { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
      D.text(c, p.label, 56, 106, { size: 18, weight: 700, color: P.text, base: 'middle' });

      const pos = p.atom.map(function (a) {
        return {
          sym: a[0],
          x: cx + (a[1] * Math.cos(ang) - a[2] * Math.sin(ang)) * z,
          y: cy + (a[1] * Math.sin(ang) + a[2] * Math.cos(ang)) * z,
          r: Math.max(13, C.jariAtom(a[0]) * 0.17) * z
        };
      });

      // ikatan
      if (sim.get('ikatan') && p.ikat) {
        p.ikat.forEach(function (ik) {
          const a = pos[ik[0]], b = pos[ik[1]];
          D.line(c, a.x, a.y, b.x, b.y, 'rgba(255,255,255,.3)', 5.5);
          D.line(c, a.x, a.y, b.x, b.y, 'rgba(255,255,255,.14)', 2.5);
        });
      }

      // atom
      pos.forEach(function (a, i) {
        const warna = C.warnaAtom(a.sym);
        if (i === sim.data.sorot) {
          D.circle(c, a.x, a.y, a.r + 7, D.alpha(P.accent, 0.2));
        }
        D.atom(c, a.x, a.y, a.r, warna, a.sym, { size: a.r * 0.9 });
        if (sim.get('nama') && C.bySym[a.sym]) {
          D.text(c, C.bySym[a.sym].nama, a.x, a.y + a.r + 13,
            { size: 10.5, weight: 600, color: P.dim, align: 'c', base: 'middle' });
        }
      });

      // muatan
      if (p.muatan !== 0) {
        const tanda = (Math.abs(p.muatan) > 1 ? Math.abs(p.muatan) : '') + (p.muatan > 0 ? '+' : '−');
        const bx = 400, by = 150;
        D.circle(c, bx, by, 22,
          D.alpha(p.muatan > 0 ? '#ef6a52' : '#5b9bf5', 0.2),
          p.muatan > 0 ? '#ef6a52' : '#5b9bf5', 2);
        D.text(c, tanda, bx, by,
          { size: 18, weight: 800, color: p.muatan > 0 ? '#ef6a52' : '#5b9bf5', align: 'c', base: 'middle' });
        D.text(c, p.muatan > 0 ? 'melepas ' + Math.abs(p.muatan) + ' elektron'
          : 'menerima ' + Math.abs(p.muatan) + ' elektron',
          bx, by + 34, { size: 10.5, weight: 600, color: P.dim, align: 'c', base: 'middle' });
      }

      // keterangan atom yang disorot
      if (sim.data.sorot >= 0) {
        const a = pos[sim.data.sorot];
        const e = C.bySym[a.sym];
        if (e) {
          D.roundRect(c, 56, 396, 240, 48, 8, 'rgba(0,0,0,.4)', 'rgba(255,255,255,.2)', 1.2);
          D.text(c, e.sym + ' — ' + e.nama, 70, 414,
            { size: 13.5, weight: 700, color: C.warnaAtom(a.sym), base: 'middle' });
          D.text(c, 'nomor atom ' + e.Z + ' · massa ' + Sim.fmt(e.massa, 2) + ' g/mol',
            70, 432, { size: 11, weight: 500, color: P.dim, base: 'middle' });
        }
      }

      /* ---------- pohon penggolongan ---------- */
      if (sim.get('pohon')) {
        const TX = 476, TW = 282;
        D.roundRect(c, TX, 60, TW, 400, 14, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
        D.text(c, 'CARA MENGGOLONGKAN', TX + 18, 82,
          { size: 10.5, weight: 700, color: P.faint, base: 'middle' });

        const unsurSet = {};
        p.atom.forEach(function (a) { unsurSet[a[0]] = true; });
        const nUnsur = Object.keys(unsurSet).length;

        const langkah = [
          { tanya: 'Apakah bermuatan listrik?',
            jawab: p.muatan !== 0 ? 'Ya' : 'Tidak',
            ya: p.muatan !== 0 },
          { tanya: 'Terdiri dari berapa atom?',
            jawab: p.atom.length === 1 ? 'Satu atom' : p.atom.length + ' atom',
            ya: p.atom.length > 1 },
          { tanya: 'Berapa jenis unsurnya?',
            jawab: nUnsur === 1 ? 'Satu jenis' : nUnsur + ' jenis',
            ya: nUnsur > 1 }
        ];

        langkah.forEach(function (l, i) {
          const y = 118 + i * 84;
          D.roundRect(c, TX + 18, y, TW - 36, 62, 9,
            'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.2);
          D.text(c, (i + 1) + '. ' + l.tanya, TX + 32, y + 20,
            { size: 12, weight: 600, color: P.dim, base: 'middle' });
          D.roundRect(c, TX + 32, y + 32, D.measure(c, l.jawab, { size: 13, weight: 700 }) + 22, 22, 11,
            D.alpha(P.accent, 0.18));
          D.text(c, l.jawab, TX + 43, y + 43,
            { size: 13, weight: 700, color: P.accent2, base: 'middle' });
          if (i < 2) {
            D.arrow(c, TX + TW / 2, y + 62, TX + TW / 2, y + 80, 'rgba(255,255,255,.22)', 2, 7);
          }
        });

        // kesimpulan
        D.roundRect(c, TX + 18, 374, TW - 36, 70, 10,
          'rgba(79,209,192,.14)', P.accent, 1.6);
        D.text(c, 'KESIMPULAN', TX + 32, 392,
          { size: 10, weight: 700, color: P.accent, base: 'middle' });
        D.text(c, jenis, TX + 32, 414,
          { size: 16, weight: 700, color: P.accent2, base: 'middle' });
        D.text(c, p.atom.length + ' atom · ' + nUnsur + ' jenis unsur · muatan ' +
          (p.muatan === 0 ? 'nol' : (p.muatan > 0 ? '+' : '') + p.muatan),
          TX + 32, 432, { size: 11, weight: 500, color: P.dim, base: 'middle' });
      }

      /* ---------- penjelasan ---------- */
      D.roundRect(c, 36, 472, W - 72, 34, 8, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.1)', 1.1);
      D.text(c, penjelasan(jenis), 54, 489,
        { size: 12.5, weight: 500, color: P.dim, base: 'middle' });
    },

    readoutsUpdate: function (sim) {
      const p = CONTOH[sim.get('partikel')];
      const unsurSet = {};
      p.atom.forEach(function (a) { unsurSet[a[0]] = true; });
      sim.readout('jenis', jenisPartikel(p));
      sim.readout('atom', p.atom.length);
      sim.readout('unsur', Object.keys(unsurSet).length);
      sim.readout('muatan', p.muatan === 0 ? 'netral'
        : (p.muatan > 0 ? '+' : '') + p.muatan,
        p.muatan === 0 ? null : 'warn');
    },

    notes: `
      <p>Materi tidak dapat dibagi terus-menerus tanpa batas. Pada suatu titik kita
      sampai pada <strong>partikel</strong> terkecil yang masih memiliki sifat zat itu.
      Ada tiga jenis partikel penyusun materi.</p>

      <h3>Atom</h3>
      <p>Partikel terkecil dari suatu <strong>unsur</strong>. Atom bersifat netral karena
      jumlah proton (muatan positif) sama dengan jumlah elektron (muatan negatif).
      Beberapa unsur memang berdiri sebagai atom tunggal, misalnya gas mulia (He, Ne, Ar)
      dan sebagian besar logam (Fe, Cu, Na).</p>

      <h3>Molekul</h3>
      <p>Gabungan dua atom atau lebih yang terikat dan bersifat netral. Ada dua macam:</p>
      <ul>
        <li><strong>Molekul unsur</strong> — atom penyusunnya sejenis.
            Contoh: H₂, O₂, N₂, Cl₂, P₄, S₈.</li>
        <li><strong>Molekul senyawa</strong> — atom penyusunnya berbeda jenis.
            Contoh: H₂O, CO₂, NH₃, CH₄, C₆H₁₂O₆.</li>
      </ul>

      <h3>Ion</h3>
      <p>Atom atau kelompok atom yang <strong>bermuatan listrik</strong> karena melepas
      atau menerima elektron.</p>
      <ul>
        <li><strong>Kation</strong> (ion positif) — melepas elektron. Contoh: Na⁺, Mg²⁺, Al³⁺.</li>
        <li><strong>Anion</strong> (ion negatif) — menerima elektron. Contoh: Cl⁻, O²⁻, S²⁻.</li>
        <li><strong>Ion poliatom</strong> — terdiri dari beberapa atom. Contoh: OH⁻, SO₄²⁻, NH₄⁺, NO₃⁻.</li>
      </ul>

      <div class="callout" data-tone="tip">
        <strong>Tiga pertanyaan yang selalu berhasil</strong>
        (1) Bermuatan atau netral? (2) Satu atom atau lebih? (3) Satu jenis unsur atau lebih?
        Jawab berurutan, dan jenis partikelnya selalu ketemu.
      </div>
    `,

    explore: [
      'Bandingkan <strong>O₂</strong> dan <strong>CO₂</strong>. Keduanya terdiri dari beberapa atom — apa yang membedakannya?',
      'Lihat <strong>Na⁺</strong> lalu <strong>Cl⁻</strong>. Mengapa yang satu bermuatan positif dan yang lain negatif?',
      'Bandingkan <strong>NH₃</strong> dan <strong>NH₄⁺</strong>. Hanya beda satu atom H, tetapi golongannya berbeda. Mengapa?',
      'Cari semua partikel di daftar yang tergolong molekul unsur. Ada berapa?'
    ],

    quiz: [
      {
        q: 'Partikel H₂O tergolong…',
        options: ['Atom', 'Molekul unsur', 'Molekul senyawa', 'Ion poliatom'],
        answer: 2,
        explain: 'H₂O netral, terdiri dari 3 atom, dan tersusun dari dua jenis unsur berbeda (H dan O). Karena itu disebut molekul senyawa.'
      },
      {
        q: 'Manakah yang merupakan molekul unsur?',
        options: ['CO₂', 'P₄', 'NaCl', 'SO₄²⁻'],
        answer: 1,
        explain: 'P₄ terdiri dari empat atom fosforus — semuanya unsur yang sama — dan bersifat netral. Itulah ciri molekul unsur.'
      },
      {
        q: 'Atom natrium melepaskan satu elektron. Partikel yang terbentuk adalah…',
        options: ['Na⁻', 'Na⁺', 'Na₂', 'Na tetap netral'],
        answer: 1,
        explain: 'Melepas elektron berarti kehilangan satu muatan negatif, sehingga muatan positif proton menjadi berlebih satu. Terbentuklah ion Na⁺.'
      },
      {
        q: 'Ion SO₄²⁻ disebut ion poliatom karena…',
        options: [
          'Muatannya dua',
          'Terdiri dari lebih dari satu atom dan bermuatan',
          'Mengandung oksigen',
          'Berasal dari asam sulfat'
        ],
        answer: 1,
        explain: 'Awalan "poli" berarti banyak. Ion poliatom adalah kelompok atom yang terikat dan secara keseluruhan membawa muatan listrik.'
      }
    ]
  });
})();
