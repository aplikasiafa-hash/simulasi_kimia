/* Tabel Periodik dan Keperiodikan Sifat — Fase E — tabel 3D */

Sim3D.daftar('tabel-periodik', (function () {
  'use strict';
  const T = THREE, S = S3;

  /* Z, lambang, nama, golongan(1-18), periode, kategori,
     jari-jari (pm), energi ionisasi (kJ/mol), keelektronegatifan */
  const U = [
    [1,'H','Hidrogen',1,1,'nonlogam',53,1312,2.20],
    [2,'He','Helium',18,1,'mulia',31,2372,0],
    [3,'Li','Litium',1,2,'alkali',167,520,0.98],
    [4,'Be','Berilium',2,2,'alkalitanah',112,899,1.57],
    [5,'B','Boron',13,2,'metaloid',87,801,2.04],
    [6,'C','Karbon',14,2,'nonlogam',67,1086,2.55],
    [7,'N','Nitrogen',15,2,'nonlogam',56,1402,3.04],
    [8,'O','Oksigen',16,2,'nonlogam',48,1314,3.44],
    [9,'F','Fluor',17,2,'halogen',42,1681,3.98],
    [10,'Ne','Neon',18,2,'mulia',38,2081,0],
    [11,'Na','Natrium',1,3,'alkali',190,496,0.93],
    [12,'Mg','Magnesium',2,3,'alkalitanah',145,738,1.31],
    [13,'Al','Aluminium',13,3,'logam',118,578,1.61],
    [14,'Si','Silikon',14,3,'metaloid',111,787,1.90],
    [15,'P','Fosforus',15,3,'nonlogam',98,1012,2.19],
    [16,'S','Belerang',16,3,'nonlogam',88,1000,2.58],
    [17,'Cl','Klorin',17,3,'halogen',79,1251,3.16],
    [18,'Ar','Argon',18,3,'mulia',71,1521,0],
    [19,'K','Kalium',1,4,'alkali',243,419,0.82],
    [20,'Ca','Kalsium',2,4,'alkalitanah',194,590,1.00],
    [21,'Sc','Skandium',3,4,'transisi',184,633,1.36],
    [22,'Ti','Titanium',4,4,'transisi',176,659,1.54],
    [23,'V','Vanadium',5,4,'transisi',171,651,1.63],
    [24,'Cr','Kromium',6,4,'transisi',166,653,1.66],
    [25,'Mn','Mangan',7,4,'transisi',161,717,1.55],
    [26,'Fe','Besi',8,4,'transisi',156,763,1.83],
    [27,'Co','Kobalt',9,4,'transisi',152,760,1.88],
    [28,'Ni','Nikel',10,4,'transisi',149,737,1.91],
    [29,'Cu','Tembaga',11,4,'transisi',145,746,1.90],
    [30,'Zn','Seng',12,4,'transisi',142,906,1.65],
    [31,'Ga','Galium',13,4,'logam',136,579,1.81],
    [32,'Ge','Germanium',14,4,'metaloid',125,762,2.01],
    [33,'As','Arsen',15,4,'metaloid',114,947,2.18],
    [34,'Se','Selenium',16,4,'nonlogam',103,941,2.55],
    [35,'Br','Brom',17,4,'halogen',94,1140,2.96],
    [36,'Kr','Kripton',18,4,'mulia',88,1351,3.00],
    [37,'Rb','Rubidium',1,5,'alkali',265,403,0.82],
    [38,'Sr','Stronsium',2,5,'alkalitanah',219,550,0.95],
    [47,'Ag','Perak',11,5,'transisi',165,731,1.93],
    [53,'I','Iodin',17,5,'halogen',115,1008,2.66],
    [54,'Xe','Xenon',18,5,'mulia',108,1170,2.60],
    [55,'Cs','Sesium',1,6,'alkali',298,376,0.79],
    [56,'Ba','Barium',2,6,'alkalitanah',253,503,0.89],
    [79,'Au','Emas',11,6,'transisi',174,890,2.54],
    [80,'Hg','Raksa',12,6,'transisi',171,1007,2.00],
    [82,'Pb','Timbal',14,6,'logam',154,716,2.33]
  ];

  const KATEGORI = {
    alkali:       { n: 'Logam alkali', w: 0xef6a52 },
    alkalitanah:  { n: 'Logam alkali tanah', w: 0xf0a94a },
    transisi:     { n: 'Logam transisi', w: 0xf0c04a },
    logam:        { n: 'Logam lain', w: 0x9aa4ae },
    metaloid:     { n: 'Metaloid', w: 0x6fcf7f },
    nonlogam:     { n: 'Nonlogam', w: 0x4fd1c0 },
    halogen:      { n: 'Halogen', w: 0x5b9bf5 },
    mulia:        { n: 'Gas mulia', w: 0xb795f0 }
  };

  const SIFAT = [
    { id: 'kategori', n: 'Kategori (tanpa tinggi)', satuan: '' },
    { id: 'jari', n: 'Jari-jari atom', satuan: ' pm', i: 6, naikKanan: false },
    { id: 'ionisasi', n: 'Energi ionisasi', satuan: ' kJ/mol', i: 7, naikKanan: true },
    { id: 'eneg', n: 'Keelektronegatifan', satuan: '', i: 8, naikKanan: true }
  ];

  function sifat(s) {
    const id = s.get('sifat');
    for (let i = 0; i < SIFAT.length; i++) if (SIFAT[i].id === id) return SIFAT[i];
    return SIFAT[0];
  }

  const SK = 0.62;   // jarak antar ubin

  return {
    latar: 0x070d13,
    kamera: { jarak: 15, phi: 0.78, theta: 0.1, targetY: 0.4, lajuPutar: 0.06 },

    kendali: [
      { judul: 'Sifat yang ditampilkan', isi: [
        { type: 'select', id: 'sifat', value: 'jari', label: 'Tinggi ubin menyatakan',
          options: SIFAT.map(function (x) { return { value: x.id, label: x.n }; }) },
        { type: 'slider', id: 'tinggi', value: 1, min: 0.2, max: 2.5, step: 0.05,
          label: 'Lebihkan tinggi', unit: '×', dec: 2 }
      ]},
      { judul: 'Soroti', isi: [
        { type: 'select', id: 'kat', value: 'semua', label: 'Kategori unsur',
          options: [{ value: 'semua', label: 'Semua kategori' }].concat(
            Object.keys(KATEGORI).map(function (k) { return { value: k, label: KATEGORI[k].n }; })) },
        { type: 'slider', id: 'pilih', value: 6, min: 1, max: 46, step: 1,
          label: 'Unsur yang diamati', unit: '', dec: 0,
          format: function (v) { const u = U[Math.round(v) - 1]; return u ? u[1] + ' — ' + u[2] : ''; } }
      ]},
      { judul: 'Tampilan', isi: [
        { type: 'toggle', id: 'lambang', value: true, label: 'Tampilkan lambang unsur' },
        { type: 'toggle', id: 'nomor', value: false, label: 'Tampilkan nomor atom' },
        { type: 'toggle', id: 'panah', value: true, label: 'Tampilkan panah kecenderungan' }
      ]}
    ],

    baca: [
      { id: 'unsur', label: 'Unsur', tone: 'aksen' },
      { id: 'posisi', label: 'Golongan / periode' },
      { id: 'kategori', label: 'Kategori' },
      { id: 'nilai', label: 'Nilai sifat' },
      { id: 'tren', label: 'Kecenderungan' }
    ],

    bangun: function (s) {
      s.tambah(S.lantai({ r: 14, y: -0.02, warna: 0x0c1319, kisiN: 30 }));
      s.data.ubin = [];
      s.data.wadah = new T.Group();
      s.tambah(s.data.wadah);

      U.forEach(function (u, i) {
        const g = new T.Group();
        const x = (u[3] - 9.5) * SK;
        const z = (u[4] - 3.5) * SK;
        g.position.set(x, 0, z);

        const kotak = new T.Mesh(new T.BoxGeometry(SK * 0.88, 1, SK * 0.88),
          new T.MeshPhysicalMaterial({
            color: KATEGORI[u[5]].w, roughness: 0.35, metalness: 0.1,
            clearcoat: 0.6, envMapIntensity: 0.8,
            emissive: KATEGORI[u[5]].w, emissiveIntensity: 0.08
          }));
        kotak.castShadow = true; kotak.receiveShadow = true;
        g.add(kotak);

        const lam = S.teks(u[1], { skala: 0.3, latar: false, warna: '#ffffff', tebal: 800 });
        lam.position.y = 0.1;
        g.add(lam);
        const nom = S.teks(String(u[0]), { skala: 0.18, latar: false, warna: '#d8e4ec' });
        nom.position.y = 0.1;
        nom.visible = false;
        g.add(nom);

        s.data.wadah.add(g);
        s.data.ubin.push({ g: g, kotak: kotak, lam: lam, nom: nom, u: u, tinggi: 0.2 });
      });

      // panah kecenderungan
      const panah = new T.Group();
      const pKanan = S.panah([-6.2, 0.1, -2.6], [6.0, 0.1, -2.6], { warna: 0xf0c04a, tebal: 0.035 });
      const pBawah = S.panah([-6.6, 0.1, -2.3], [-6.6, 0.1, 2.4], { warna: 0x7fe3d6, tebal: 0.035 });
      panah.add(pKanan, pBawah);
      const tk = S.teks('→ sepanjang periode', { skala: 0.26, lebar: 20, warna: '#f0c04a' });
      tk.position.set(0, 0.3, -3.1);
      const tb = S.teks('↓ menuruni golongan', { skala: 0.26, lebar: 20, warna: '#7fe3d6' });
      tb.position.set(-7.6, 0.3, 0.2);
      panah.add(tk, tb);
      s.data.panah = panah;
      s.tambah(panah);

      // sorotan
      const cincin = new T.Mesh(new T.TorusGeometry(SK * 0.62, 0.028, 10, 36),
        new T.MeshBasicMaterial({ color: 0xffffff }));
      cincin.rotation.x = Math.PI / 2;
      s.data.cincin = cincin;
      s.tambah(cincin);

      const lbl = S.teks('', { skala: 0.4, lebar: 22, warna: '#d8e4ec' });
      lbl.position.set(0, 3.4, -2.6);
      s.data.lbl = lbl;
      s.tambah(lbl);

      pasang(s);
    },

    ubah: function (s) { pasang(s); },

    langkah: function (s, dt) {
      s.data.ubin.forEach(function (x) {
        x.kotak.scale.y = S.lerp(x.kotak.scale.y, x.tinggi, dt * 5);
        x.kotak.position.y = x.kotak.scale.y / 2;
        x.lam.position.y = x.kotak.scale.y + 0.16;
        x.nom.position.y = x.kotak.scale.y + 0.16;
      });
      const i = Math.round(s.get('pilih')) - 1;
      const t = s.data.ubin[i];
      if (t) {
        s.data.cincin.position.set(t.g.position.x,
          t.kotak.scale.y + 0.05 + Math.sin(s.waktu * 3) * 0.03, t.g.position.z);
        s.data.cincin.material.color.setHSL((s.waktu * 0.2) % 1, 0.1, 0.9);
      }
    },

    bacaUbah: function (s) {
      const i = Math.round(s.get('pilih')) - 1;
      const u = U[i];
      if (!u) return;
      const f = sifat(s);
      s.baca('unsur', u[2] + ' (' + u[1] + ', Z=' + u[0] + ')');
      s.baca('posisi', 'Golongan ' + u[3] + ' · Periode ' + u[4]);
      s.baca('kategori', KATEGORI[u[5]].n);
      s.baca('nilai', f.i ? S.fmt(u[f.i], f.id === 'eneg' ? 2 : 0) + f.satuan : '—');
      s.baca('tren', f.id === 'kategori' ? 'pilih sifat untuk melihat kecenderungan'
        : f.naikKanan ? 'naik ke kanan, turun ke bawah'
        : 'turun ke kanan, naik ke bawah');
    }
  };

  function pasang(s) {
    const f = sifat(s);
    const kat = s.get('kat');
    const lebih = s.get('tinggi');

    let min = Infinity, maks = -Infinity;
    if (f.i) U.forEach(function (u) {
      if (u[f.i] > 0) { min = Math.min(min, u[f.i]); maks = Math.max(maks, u[f.i]); }
    });

    s.data.ubin.forEach(function (x) {
      const u = x.u;
      const cocok = kat === 'semua' || u[5] === kat;
      if (f.i) {
        const v = u[f.i] > 0 ? (u[f.i] - min) / (maks - min) : 0;
        x.tinggi = 0.16 + v * 2.4 * lebih;
      } else {
        x.tinggi = 0.22;
      }
      const w = new T.Color(KATEGORI[u[5]].w);
      if (f.i) {
        // gradasi dingin→panas mengikuti nilai, tetap pakai rona kategori saat 'kategori'
        const v = u[f.i] > 0 ? (u[f.i] - min) / (maks - min) : 0;
        w.copy(new T.Color(0x2b63c9).lerp(new T.Color(0xef6a52), v));
      }
      x.kotak.material.color.copy(w);
      x.kotak.material.emissive.copy(w);
      x.kotak.material.emissiveIntensity = cocok ? 0.1 : 0.02;
      x.kotak.material.opacity = cocok ? 1 : 0.25;
      x.kotak.material.transparent = !cocok;
      x.lam.visible = s.get('lambang') && !s.get('nomor') && cocok;
      x.nom.visible = s.get('nomor') && cocok;
      x.lam.material.opacity = cocok ? 1 : 0.2;
    });

    s.data.panah.visible = s.get('panah') && !!f.i;
    s.data.lbl.userData.ganti(f.n);
  }
})());
