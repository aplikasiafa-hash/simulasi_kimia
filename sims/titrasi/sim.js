/* Titrasi Asam–Basa — Fase F — adegan 3D */

Sim3D.daftar('titrasi', (function () {
  'use strict';
  const T = THREE, S = S3;

  const KW = 1e-14;

  const ANALIT = [
    { n: 'HCl (asam kuat)', jenis: 'ak', nama: 'HCl' },
    { n: 'CH₃COOH (asam lemah)', jenis: 'al', ka: 1.8e-5, nama: 'CH₃COOH' },
    { n: 'HF (asam lemah)', jenis: 'al', ka: 6.8e-4, nama: 'HF' },
    { n: 'HCN (asam sangat lemah)', jenis: 'al', ka: 6.2e-10, nama: 'HCN' },
    { n: 'NaOH (basa kuat)', jenis: 'bk', nama: 'NaOH' },
    { n: 'NH₃ (basa lemah)', jenis: 'bl', kb: 1.8e-5, nama: 'NH₃' }
  ];

  const INDIKATOR = [
    { n: 'Fenolftalein', lo: 8.2, hi: 10.0, wLo: null, wHi: 0xe0409a, nLo: 'tak berwarna', nHi: 'merah muda' },
    { n: 'Metil merah', lo: 4.2, hi: 6.3, wLo: 0xd03020, wHi: 0xf0d040, nLo: 'merah', nHi: 'kuning' },
    { n: 'Metil jingga', lo: 3.1, hi: 4.4, wLo: 0xe04010, wHi: 0xf0b030, nLo: 'merah', nHi: 'jingga-kuning' },
    { n: 'Bromtimol biru', lo: 6.0, hi: 7.6, wLo: 0xd8d040, wHi: 0x2a6ad0, nLo: 'kuning', nHi: 'biru' },
    { n: 'Indikator universal', lo: 0, hi: 14, wLo: 0xd02020, wHi: 0x30107a, nLo: 'merah', nHi: 'ungu' }
  ];

  function analit(s) { return ANALIT[parseInt(s.get('a'), 10) || 0]; }
  function indikator(s) { return INDIKATOR[parseInt(s.get('ind'), 10) || 0]; }
  function asamDiLabu(s) { const j = analit(s).jenis; return j === 'ak' || j === 'al'; }

  /* pH larutan setelah Vb mL titran ditambahkan */
  function pH(s, Vt) {
    const a = analit(s);
    const Ca = s.get('ca'), Va = s.get('va');
    const Ct = s.get('ct');
    const na = Ca * Va / 1000;
    const nt = Ct * Vt / 1000;
    const V = (Va + Vt) / 1000;
    let H;

    if (asamDiLabu(s)) {
      // asam dalam labu, titran basa kuat
      if (a.jenis === 'ak') {
        if (na > nt) H = (na - nt) / V;
        else if (nt > na) H = KW / ((nt - na) / V);
        else H = 1e-7;
      } else {
        if (nt <= 1e-12) {
          H = (-a.ka + Math.sqrt(a.ka * a.ka + 4 * a.ka * (na / V))) / 2;
        } else if (nt < na * 0.9999) {
          H = a.ka * (na - nt) / nt;
        } else if (Math.abs(nt - na) / na < 0.0001) {
          const cs = na / V;
          const OH = Math.sqrt(KW / a.ka * cs);
          H = KW / OH;
        } else {
          H = KW / ((nt - na) / V);
        }
      }
    } else {
      // basa dalam labu, titran asam kuat
      let OH;
      if (a.jenis === 'bk') {
        if (na > nt) OH = (na - nt) / V;
        else if (nt > na) OH = KW / ((nt - na) / V);
        else OH = 1e-7;
      } else {
        if (nt <= 1e-12) {
          OH = (-a.kb + Math.sqrt(a.kb * a.kb + 4 * a.kb * (na / V))) / 2;
        } else if (nt < na * 0.9999) {
          OH = a.kb * (na - nt) / nt;
        } else if (Math.abs(nt - na) / na < 0.0001) {
          const cs = na / V;
          OH = KW / Math.sqrt(KW / a.kb * cs);
        } else {
          OH = KW / ((nt - na) / V);
        }
      }
      H = KW / Math.max(1e-15, OH);
    }
    return S.clamp(-Math.log10(S.clamp(H, 1e-15, 10)), 0, 14);
  }

  function volumeEkuivalen(s) {
    return s.get('ca') * s.get('va') / Math.max(0.0001, s.get('ct'));
  }

  /* warna larutan menurut indikator pada pH tertentu */
  function warnaLarutan(s, p) {
    const ind = indikator(s);
    if (ind.n === 'Indikator universal') {
      const titik = [
        [0, 0xd02020], [2, 0xe85a20], [4, 0xf0a030], [6, 0xd8d040],
        [7, 0x60c860], [8, 0x40b8a0], [10, 0x3878d0], [12, 0x5030b0], [14, 0x30107a]
      ];
      for (let i = 0; i < titik.length - 1; i++) {
        if (p <= titik[i + 1][0]) {
          const u = (p - titik[i][0]) / (titik[i + 1][0] - titik[i][0]);
          return { warna: new T.Color(titik[i][1]).lerp(new T.Color(titik[i + 1][1]), u), jernih: 0 };
        }
      }
      return { warna: new T.Color(0x30107a), jernih: 0 };
    }
    const u = S.clamp((p - ind.lo) / (ind.hi - ind.lo), 0, 1);
    if (ind.wLo === null) {
      // tak berwarna → berwarna: pudarkan sekaligus warnanya, bukan hanya kepekatannya,
      // supaya bentuk asamnya benar-benar terlihat bening
      return {
        warna: new T.Color(0xeaf2f6).lerp(new T.Color(ind.wHi), u),
        jernih: 1 - u
      };
    }
    return { warna: new T.Color(ind.wLo).lerp(new T.Color(ind.wHi), u), jernih: 0 };
  }

  /* Rentang lonjakan pH di sekitar titik ekuivalen (±0,1 % dari V ekuivalen).
     Indikator dinilai cocok bila rentang peralihannya memotong lonjakan ini. */
  function lonjakan(s) {
    const Vek = volumeEkuivalen(s);
    const a = pH(s, Vek * 0.999);
    const b = pH(s, Vek * 1.001);
    return { bawah: Math.min(a, b), atas: Math.max(a, b) };
  }

  return {
    latar: 0x070c12,
    kamera: { jarak: 11.5, phi: 1.0, theta: 0.58, targetY: 2.2, lajuPutar: 0.08 },

    kendali: [
      { judul: 'Larutan dalam labu', isi: [
        { type: 'select', id: 'a', value: 0, label: 'Zat yang dititrasi',
          options: ANALIT.map(function (a, i) { return { value: i, label: a.n }; }) },
        { type: 'slider', id: 'ca', value: 0.1, min: 0.01, max: 1, step: 0.01,
          label: 'Konsentrasi analit', unit: ' M', dec: 2 },
        { type: 'slider', id: 'va', value: 25, min: 10, max: 50, step: 1,
          label: 'Volume analit', unit: ' mL', dec: 0 }
      ]},
      { judul: 'Titran di buret', isi: [
        { type: 'slider', id: 'ct', value: 0.1, min: 0.01, max: 1, step: 0.01,
          label: 'Konsentrasi titran', unit: ' M', dec: 2 },
        { type: 'slider', id: 'v', value: 0, min: 0, max: 60, step: 0.05,
          label: 'Volume titran yang keluar', unit: ' mL', dec: 2 },
        { type: 'buttons', label: '', items: [
          { label: '▶ Teteskan', utama: true, klik: function (s) { s.data.tetes = 1; } },
          { label: '≫ Alirkan cepat', klik: function (s) { s.data.tetes = 4; } },
          { label: '⏸ Tutup keran', klik: function (s) { s.data.tetes = 0; } },
          { label: '↺ Ulangi', klik: function (s) { s.set('v', 0); s.data.tetes = 0; } }
        ]}
      ]},
      { judul: 'Indikator & panel', isi: [
        { type: 'select', id: 'ind', value: 0, label: 'Indikator',
          options: INDIKATOR.map(function (i, k) { return { value: k, label: i.n }; }) },
        { type: 'toggle', id: 'grafik', value: true, label: 'Tampilkan kurva titrasi' },
        { type: 'toggle', id: 'aduk', value: true, label: 'Pengaduk magnet berputar' }
      ]}
    ],

    baca: [
      { id: 'ph', label: 'pH sekarang', tone: 'aksen' },
      { id: 'vol', label: 'Volume titran' },
      { id: 'ek', label: 'Volume ekuivalen' },
      { id: 'phek', label: 'pH titik ekuivalen' },
      { id: 'warna', label: 'Warna larutan' },
      { id: 'saran', label: 'Kecocokan indikator' }
    ],

    bangun: function (s) {
      s.tambah(S.lantai({ r: 9, warna: 0x0b1118 }));

      /* ---------- statif ---------- */
      const kaki = new T.Mesh(new T.BoxGeometry(2.2, 0.2, 1.4),
        new T.MeshStandardMaterial({ color: 0x222b33, roughness: 0.6, metalness: 0.3 }));
      kaki.position.set(-1.6, 0.1, -0.4);
      kaki.receiveShadow = true;
      s.tambah(kaki);
      const tiang = new T.Mesh(new T.CylinderGeometry(0.08, 0.08, 7.0, 18), S.matLogam(0x98a4b0));
      tiang.position.set(-2.4, 3.6, -0.4);
      s.tambah(tiang);
      const lengan = new T.Mesh(new T.BoxGeometry(1.6, 0.1, 0.14), S.matLogam(0x98a4b0));
      lengan.position.set(-1.7, 5.4, -0.4);
      s.tambah(lengan);

      /* ---------- buret ---------- */
      const bur = S.buret({ r: 0.2, h: 3.6, level: 0.9, warna: 0xeaf2f6 });
      bur.position.set(-1.0, 2.1, 0);
      s.data.bur = bur;
      s.tambah(bur);
      // skala buret
      for (let i = 0; i <= 12; i++) {
        const g = new T.Mesh(new T.BoxGeometry(0.1, 0.012, 0.012),
          new T.MeshBasicMaterial({ color: 0x8d97a1 }));
        g.position.set(-0.78, 2.6 + i * 0.26, 0.1);
        s.tambah(g);
      }
      const lblB = S.teks('0,00 mL', { skala: 0.26, lebar: 12, warna: '#bfe8ff' });
      lblB.position.set(-2.0, 4.4, 0.3);
      s.data.lblB = lblB;
      s.tambah(lblB);

      /* ---------- labu erlenmeyer ---------- */
      const labu = S.labu({ r: 1.3, h: 2.3, level: 0.42, warna: 0xeaf2f6 });
      labu.position.set(-1.0, 0.42, 0);
      s.data.labu = labu;
      s.tambah(labu);

      // alas pengaduk magnet
      const alas = new T.Mesh(new T.BoxGeometry(2.4, 0.42, 2.0),
        new T.MeshStandardMaterial({ color: 0x252f38, roughness: 0.5, metalness: 0.3 }));
      alas.position.set(-1.0, 0.21, 0);
      alas.receiveShadow = true;
      s.tambah(alas);
      const lampu = new T.Mesh(S.geoBola(14),
        new T.MeshStandardMaterial({ color: 0x9fe8ad, emissive: 0x9fe8ad, emissiveIntensity: 1 }));
      lampu.scale.setScalar(0.06);
      lampu.position.set(-0.1, 0.44, 0.9);
      s.tambah(lampu);

      // batang magnet berputar
      const magnet = new T.Mesh(new T.BoxGeometry(0.42, 0.08, 0.1),
        new T.MeshStandardMaterial({ color: 0xf0f4f8, roughness: 0.3 }));
      magnet.position.set(-1.0, 0.5, 0);
      s.data.magnet = magnet;
      s.tambah(magnet);

      // pusaran cairan
      const pusar = S.partikel(60, { r: 0.055, warna: 0xffffff, kotak: { x: 1, y: 0.3, z: 1 } });
      pusar.material.transparent = true;
      pusar.material.opacity = 0.3;
      pusar.position.set(-1.0, 0.85, 0);
      s.data.pusar = pusar;
      s.tambah(pusar);
      s.data.sudut = [];
      for (let i = 0; i < 60; i++) {
        s.data.sudut.push({ a: Math.random() * Math.PI * 2, r: 0.2 + Math.random() * 0.75,
          y: S.acak(-0.25, 0.25), v: 1 + Math.random() });
      }

      /* ---------- tetesan dari buret ---------- */
      const tetes = [];
      for (let i = 0; i < 6; i++) {
        const m = new T.Mesh(S.geoBola(12),
          new T.MeshPhysicalMaterial({ color: 0xcfe6f2, roughness: 0.05, transmission: 0.8,
            transparent: true, opacity: 0.8, thickness: 0.1 }));
        m.scale.set(0.07, 0.1, 0.07);
        m.visible = false;
        s.tambah(m);
        tetes.push({ m: m, y: 9 });
      }
      s.data.tetesan = tetes;

      /* ---------- panel kurva ---------- */
      const g1 = S.panelGrafik({ w: 4.6, px: 760, py: 470 });
      g1.position.set(3.0, 3.4, -1.3);
      s.data.g1 = g1;
      s.tambah(g1);

      const lbl = S.teks('', { skala: 0.38, lebar: 38, warna: '#d8e4ec' });
      lbl.position.set(-1.0, 5.1, 0);
      s.data.lbl = lbl;
      s.tambah(lbl);

      s.data.tetes = 0;
      s.data.jejak = [];
      pasang(s);
    },

    ubah: function (s, id) {
      if (id === 'a' || id === 'ca' || id === 'va' || id === 'ct') { s.set('v', 0); pasang(s); }
      if (id === 'ind') pasang(s);
      if (id === 'grafik') s.data.g1.visible = s.get('grafik');
      if (id === 'v') rekam(s);
      perbaruiWarna(s);
      gambar(s);
    },

    langkah: function (s, dt) {
      // keran mengalirkan titran
      if (s.data.tetes > 0) {
        const v = Math.min(60, s.get('v') + dt * s.data.tetes * 0.9);
        s.setDiam('v', v);
        rekam(s);
        perbaruiWarna(s);
        gambar(s);
        if (v >= 60) s.data.tetes = 0;
      }
      const V = s.get('v');

      // sisa titran di buret
      s.data.bur.userData.setLevel(S.clamp(0.9 - V / 60 * 0.85, 0.02, 0.9));
      s.data.bur.userData.keranPeg.rotation.x = s.data.tetes > 0 ? 1.2 : 0;
      s.data.lblB.userData.ganti(S.fmt(V, 2) + ' mL');

      // tinggi larutan di labu bertambah
      const lv = S.clamp(0.42 + V / 60 * 0.3, 0.42, 0.78);
      const w = warnaLarutan(s, pH(s, V));
      s.data.labu.userData.setLevel(lv, w.warna.getHex());

      // tetesan jatuh
      s.data.tetesan.forEach(function (t, i) {
        if (s.data.tetes > 0 && t.y > 8) {
          if (Math.random() < dt * s.data.tetes * 2.2) t.y = 2.1;
        }
        if (t.y < 8) {
          t.y -= dt * 4.2;
          t.m.visible = true;
          t.m.position.set(-1.0, t.y, 0);
          if (t.y < 0.95) { t.y = 9; t.m.visible = false; }
        } else t.m.visible = false;
      });

      // pengaduk magnet
      if (s.get('aduk')) {
        s.data.magnet.rotation.y += dt * 14;
        const d = s.data.pusar.userData.p;
        for (let i = 0; i < d.length; i++) {
          const q = s.data.sudut[i];
          q.a += dt * (2.4 / (0.3 + q.r)) * q.v;
          d[i].pos.set(Math.cos(q.a) * q.r, q.y, Math.sin(q.a) * q.r);
          d[i].aktif = true;
        }
        s.data.pusar.userData.tulis();
        s.data.pusar.position.y = 0.42 + lv * 0.8;
      }
      s.data.pusar.visible = s.get('aduk');
    },

    bacaUbah: function (s) {
      const V = s.get('v');
      const p = pH(s, V);
      const Vek = volumeEkuivalen(s);
      const pek = pH(s, Vek);
      const ind = indikator(s);
      const w = warnaLarutan(s, p);
      const u = S.clamp((p - ind.lo) / (ind.hi - ind.lo), 0, 1);

      s.baca('ph', S.fmt(p, 2), p < 6 ? 'danger' : p > 8 ? 'biru' : 'aksen');
      s.baca('vol', S.fmt(V, 2) + ' mL' + (s.data.tetes > 0 ? ' — keran terbuka' : ''));
      s.baca('ek', S.fmt(Vek, 2) + ' mL'
        + (Math.abs(V - Vek) < 0.1 ? '  ← tercapai!' : ''),
        Math.abs(V - Vek) < 0.1 ? 'aksen' : undefined);
      s.baca('phek', S.fmt(pek, 2) + '  (' + (pek > 7.5 ? 'basa' : pek < 6.5 ? 'asam' : 'netral') + ')');
      s.baca('warna', ind.wLo === null
        ? (u < 0.15 ? ind.nLo : u > 0.85 ? ind.nHi : 'mulai ' + ind.nHi)
        : (u < 0.15 ? ind.nLo : u > 0.85 ? ind.nHi : 'peralihan ' + ind.nLo + ' → ' + ind.nHi));
      // indikator cocok bila rentang peralihannya jatuh di dalam lonjakan pH
      const lj = lonjakan(s);
      const cocok = ind.hi >= lj.bawah && ind.lo <= lj.atas;
      s.baca('saran', ind.n === 'Indikator universal'
        ? 'Dipakai untuk memperkirakan pH, bukan titik akhir yang tajam'
        : cocok
          ? 'Cocok — rentang ' + ind.lo + '–' + ind.hi + ' jatuh di dalam lonjakan pH '
            + S.fmt(lj.bawah, 1) + '–' + S.fmt(lj.atas, 1)
          : 'Kurang cocok — rentang ' + ind.lo + '–' + ind.hi + ' di luar lonjakan pH '
            + S.fmt(lj.bawah, 1) + '–' + S.fmt(lj.atas, 1),
        ind.n === 'Indikator universal' ? undefined : cocok ? 'aksen' : 'danger');
      gambar(s);
    }
  };

  function perbaruiWarna(s) {
    const p = pH(s, s.get('v'));
    const w = warnaLarutan(s, p);
    s.data.labu.userData.cair.material.color.copy(w.warna);
    s.data.labu.userData.cair.material.opacity = S.lerp(0.9, 0.18, w.jernih);
  }

  function rekam(s) {
    const V = s.get('v');
    const j = s.data.jejak;
    if (!j.length || V > j[j.length - 1][0]) j.push([V, pH(s, V)]);
    if (j.length > 600) j.shift();
  }

  function gambar(s) {
    if (!s.data.g1 || !s.data.g1.visible) return;
    const Vek = volumeEkuivalen(s);
    const ind = indikator(s);
    const maksX = Math.max(10, Math.min(60, Vek * 2));

    // kurva teoretis penuh
    const teori = [];
    for (let i = 0; i <= 240; i++) {
      const V = i / 240 * maksX;
      teori.push([V, pH(s, V)]);
    }
    const V = s.get('v');

    S.gambarGrafik(s.data.g1, {
      judul: 'Kurva titrasi — pH terhadap volume titran',
      xMin: 0, xMax: maksX, yMin: 0, yMax: 14,
      xLabel: 'volume titran (mL)', yLabel: 'pH',
      seri: [
        { titik: teori, warna: 'rgba(120,140,160,.55)', tebal: 2, putus: true, nama: 'kurva teoretis' },
        { titik: s.data.jejak.length > 1 ? s.data.jejak : [[0, teori[0][1]], [0.001, teori[0][1]]],
          warna: '#4fd1c0', tebal: 3.4, nama: 'yang sudah dilalui' }
      ],
      garisX: [{ v: Vek, warna: 'rgba(240,208,64,.8)',
        label: 'V ekuivalen ' + S.fmt(Vek, 1) + ' mL' }],
      garisY: ind.n === 'Indikator universal' ? [] : [
        { v: ind.lo, warna: 'rgba(224,64,154,.55)', label: 'rentang ' + ind.n },
        { v: ind.hi, warna: 'rgba(224,64,154,.55)' }
      ],
      titikTebal: [{ x: V, y: pH(s, V), warna: '#ffffff', r: 7 }]
    });
  }

  function pasang(s) {
    const a = analit(s);
    s.data.jejak = [[0, pH(s, 0)]];
    s.data.tetes = 0;
    s.data.bur.userData.setLevel(0.9,
      asamDiLabu(s) ? 0xdfe8ee : 0xf0e4d8);
    s.data.labu.userData.setLevel(0.42);
    perbaruiWarna(s);
    s.data.g1.visible = s.get('grafik');
    s.data.lbl.userData.ganti(a.nama + ' dititrasi dengan '
      + (asamDiLabu(s) ? 'NaOH 0,1 M' : 'HCl 0,1 M').replace('0,1 M', S.fmt(s.get('ct'), 2) + ' M'));
    gambar(s);
  }
})());
