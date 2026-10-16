/* Laju Reaksi dan Faktor-faktornya — Fase F — adegan 3D */

Sim3D.daftar('laju-reaksi', (function () {
  'use strict';
  const T = THREE, S = S3;

  const BENTUK = [
    { id: 'serbuk', n: 'Serbuk', luas: 1.0, butir: 44, r: 0.075 },
    { id: 'butiran', n: 'Butiran', luas: 0.55, butir: 14, r: 0.16 },
    { id: 'lempeng', n: 'Satu lempeng', luas: 0.22, butir: 1, r: 0.42 }
  ];

  const KATALIS = [
    { n: 'Tanpa katalis', ea: 60, f: 1.0, warna: 0x9aa8b4 },
    { n: 'CuSO₄ (sedikit)', ea: 48, f: 1.9, warna: 0x4a9fd8 },
    { n: 'MnO₂', ea: 40, f: 3.1, warna: 0x3a3a42 },
    { n: 'Enzim katalase', ea: 26, f: 6.5, warna: 0x9fe8ad }
  ];

  const R_GAS = 8.314;

  function bentuk(s) {
    const id = s.get('bentuk');
    for (let i = 0; i < BENTUK.length; i++) if (BENTUK[i].id === id) return BENTUK[i];
    return BENTUK[0];
  }
  function katalis(s) { return KATALIS[parseInt(s.get('kat'), 10) || 0]; }

  /* laju awal relatif (satuan sembarang, dinormalkan agar enak dibaca) */
  function hitung(s) {
    const c = s.get('c');
    const Tk = s.get('suhu') + 273.15;
    const b = bentuk(s);
    const k = katalis(s);
    const ea = k.ea * 1000;                       // J/mol
    const A = 4.2e9;
    const kLaju = A * Math.exp(-ea / (R_GAS * Tk));
    const laju = kLaju * c * b.luas;              // orde 1 terhadap [HCl]
    const vMaks = 60 * c * (b.luas * 0.5 + 0.5);  // volume gas maksimum (mL)
    return { laju: laju, ea: k.ea, b: b, k: k, vMaks: vMaks, Tk: Tk, c: c };
  }

  /* volume gas pada waktu t (detik) — peluruhan eksponensial menuju vMaks */
  function volume(h, t) {
    const tau = 1 / Math.max(1e-4, h.laju * 0.09);
    return h.vMaks * (1 - Math.exp(-t / tau));
  }

  return {
    latar: 0x070d13,
    kamera: { jarak: 11, phi: 1.04, theta: 0.58, targetY: 1.6, lajuPutar: 0.1 },

    kendali: [
      { judul: 'Pereaksi', isi: [
        { type: 'slider', id: 'c', value: 1, min: 0.1, max: 3, step: 0.05,
          label: 'Konsentrasi HCl', unit: ' M', dec: 2 },
        { type: 'slider', id: 'suhu', value: 25, min: 5, max: 90, step: 1,
          label: 'Suhu', unit: ' °C', dec: 0 },
        { type: 'segment', id: 'bentuk', value: 'serbuk', label: 'Bentuk logam Mg',
          options: BENTUK.map(function (b) { return { value: b.id, label: b.n }; }) },
        { type: 'select', id: 'kat', value: 0, label: 'Katalis',
          options: KATALIS.map(function (k, i) { return { value: i, label: k.n }; }) }
      ]},
      { judul: 'Percobaan', isi: [
        { type: 'buttons', label: '', items: [
          { label: '▶ Mulai reaksi', utama: true, klik: function (s) { s.data.jalan = true; } },
          { label: '⏸ Jeda', klik: function (s) { s.data.jalan = false; } },
          { label: '↺ Ulangi', klik: function (s) { ulang(s); } },
          { label: '＋ Simpan kurva', klik: function (s) { simpan(s); } }
        ]},
        { type: 'slider', id: 'laju', value: 1, min: 0.2, max: 4, step: 0.1,
          label: 'Kecepatan waktu', unit: '×', dec: 1 }
      ]},
      { judul: 'Panel', isi: [
        { type: 'segment', id: 'panel', value: 'volume', label: 'Grafik', options: [
          { value: 'volume', label: 'Volume gas' },
          { value: 'energi', label: 'Energi aktivasi' }
        ]},
        { type: 'toggle', id: 'grafik', value: true, label: 'Tampilkan panel' },
        { type: 'toggle', id: 'partikel', value: true, label: 'Tampilkan tumbukan partikel' }
      ]}
    ],

    baca: [
      { id: 'laju', label: 'Laju awal', tone: 'aksen' },
      { id: 'vol', label: 'Volume H₂ terkumpul' },
      { id: 'waktu', label: 'Waktu berjalan' },
      { id: 'ea', label: 'Energi aktivasi' },
      { id: 'luas', label: 'Luas permukaan relatif' },
      { id: 'sebab', label: 'Faktor paling berpengaruh' }
    ],

    bangun: function (s) {
      s.tambah(S.lantai({ r: 9, warna: 0x0c1218 }));

      /* ---------- labu tempat reaksi ---------- */
      const labu = S.labu({ r: 1.25, h: 2.2, level: 0.5, warna: 0xdfe8ee });
      labu.position.set(-1.6, 0.05, 0);
      s.data.labu = labu;
      s.tambah(labu);

      // sumbat + selang ke tabung ukur
      const sumbat = new T.Mesh(new T.CylinderGeometry(0.42, 0.36, 0.34, 24),
        new T.MeshStandardMaterial({ color: 0xd8923a, roughness: 0.85 }));
      sumbat.position.set(-1.6, 2.3, 0);
      s.tambah(sumbat);

      const kurva = new T.CatmullRomCurve3([
        new T.Vector3(-1.6, 2.5, 0), new T.Vector3(-1.3, 3.3, 0.3),
        new T.Vector3(0.4, 3.7, 0.3), new T.Vector3(1.9, 3.3, 0.1),
        new T.Vector3(2.1, 2.6, 0)
      ]);
      const selang = new T.Mesh(new T.TubeGeometry(kurva, 60, 0.07, 12, false),
        new T.MeshStandardMaterial({ color: 0x3e4a56, roughness: 0.6 }));
      s.tambah(selang);

      /* ---------- tabung ukur gas (suntikan) ---------- */
      const silinder = new T.Mesh(new T.CylinderGeometry(0.44, 0.44, 3.0, 36, 1, true),
        new T.MeshPhysicalMaterial({ color: 0xcfe6f2, roughness: 0.06, transparent: true,
          opacity: 0.2, side: T.DoubleSide, depthWrite: false }));
      silinder.position.set(2.1, 1.6, 0);
      s.tambah(silinder);
      const dasarS = new T.Mesh(new T.CylinderGeometry(0.46, 0.46, 0.1, 36), S.matLogam(0x8d99a4));
      dasarS.position.set(2.1, 0.1, 0);
      s.tambah(dasarS);

      // gas terkumpul (kolom biru muda)
      const gasKolom = new T.Mesh(new T.CylinderGeometry(0.42, 0.42, 1, 32),
        new T.MeshStandardMaterial({ color: 0xbfe8ff, transparent: true, opacity: 0.45,
          emissive: 0x4a9fd8, emissiveIntensity: 0.18 }));
      s.data.gasKolom = gasKolom;
      s.tambah(gasKolom);

      // piston
      const piston = new T.Mesh(new T.CylinderGeometry(0.43, 0.43, 0.16, 32),
        S.matLogam(0xd0d6dc, { roughness: 0.4 }));
      s.data.piston = piston;
      s.tambah(piston);
      const tangkai = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, 1.4, 14), S.matLogam(0xb0b8c0));
      s.data.tangkai = tangkai;
      s.tambah(tangkai);

      // skala tabung
      for (let i = 0; i <= 6; i++) {
        const g = new T.Mesh(new T.BoxGeometry(0.14, 0.014, 0.014),
          new T.MeshBasicMaterial({ color: 0x8d97a1 }));
        g.position.set(2.56, 0.2 + i * 0.47, 0);
        s.tambah(g);
      }
      const lblV = S.teks('0 mL', { skala: 0.3, lebar: 10, warna: '#bfe8ff' });
      lblV.position.set(3.2, 2.4, 0);
      s.data.lblV = lblV;
      s.tambah(lblV);

      /* ---------- butiran logam di dasar labu ---------- */
      const logam = new T.Group();
      s.data.logam = logam;
      s.tambah(logam);

      /* ---------- partikel asam + gelembung ---------- */
      const asam = S.partikel(70, { r: 0.065, warna: 0xf0d040, kotak: { x: 0.85, y: 0.4, z: 0.85 } });
      asam.position.set(-1.6, 0.6, 0);
      asam.material.transparent = true;
      asam.material.opacity = 0.9;
      s.data.asam = asam;
      s.tambah(asam);

      const gel = S.gelembung({ n: 44, sebar: 0.75, tinggi: 1.5, warna: 0xeaf4fa });
      gel.position.set(-1.6, 0.18, 0);
      s.data.gel = gel;
      s.tambah(gel);

      // kilatan tumbukan berhasil
      const kilat = [];
      for (let i = 0; i < 10; i++) {
        const m = new T.Mesh(S.geoBola(12), new T.MeshBasicMaterial({
          color: 0xfff0a0, transparent: true, opacity: 0
        }));
        m.scale.setScalar(0.14);
        s.tambah(m);
        kilat.push({ m: m, t: 9 });
      }
      s.data.kilat = kilat;

      /* ---------- panel grafik ---------- */
      const g1 = S.panelGrafik({ w: 4.8, px: 700, py: 440 });
      g1.position.set(0.2, 5.4, -1.8);
      s.data.g1 = g1;
      s.tambah(g1);

      // termometer kecil
      const lblS = S.teks('', { skala: 0.3, lebar: 14, warna: '#ef8a52' });
      lblS.position.set(-3.6, 2.4, 0);
      s.data.lblS = lblS;
      s.tambah(lblS);

      const lbl = S.teks('Mg(s) + 2HCl(aq) → MgCl₂(aq) + H₂(g)',
        { skala: 0.36, lebar: 44, warna: '#d8e4ec' });
      lbl.position.set(0, 7.1, 0);
      s.tambah(lbl);

      s.data.tersimpan = [];
      ulang(s);
      pasang(s);
    },

    ubah: function (s, id) {
      if (id === 'bentuk' || id === 'c' || id === 'kat') { pasang(s); ulang(s); }
      if (id === 'suhu') { pasang(s); ulang(s); }
      if (id === 'grafik') s.data.g1.visible = s.get('grafik');
      if (id === 'partikel') {
        s.data.asam.visible = s.get('partikel');
        s.data.logam.visible = true;
      }
      gambar(s);
    },

    langkah: function (s, dt) {
      const h = hitung(s);
      if (s.data.jalan) {
        s.data.jam += dt * s.get('laju') * 1.6;
        if (s.data.rekam.length < 500) {
          s.data.rekam.push([s.data.jam, volume(h, s.data.jam)]);
        }
      }
      const v = volume(h, s.data.jam);
      const f = S.clamp(v / Math.max(0.001, h.vMaks), 0, 1);

      // kolom gas & piston naik
      const tinggi = f * 2.6 + 0.02;
      s.data.gasKolom.scale.y = tinggi;
      s.data.gasKolom.position.set(2.1, 0.15 + tinggi / 2, 0);
      s.data.piston.position.set(2.1, 0.15 + tinggi + 0.08, 0);
      s.data.tangkai.position.set(2.1, 0.15 + tinggi + 0.85, 0);
      s.data.lblV.userData.ganti(S.fmt(v, 1) + ' mL');

      // gelembung: makin cepat bila laju besar, berhenti bila habis
      const kecepatan = s.data.jalan ? S.clamp(h.laju * 0.6 * (1 - f * 0.85), 0, 3) : 0;
      s.data.gel.userData.perbarui(dt, kecepatan);

      // partikel asam bergerak; makin panas makin cepat
      const cepat = 0.3 + (s.get('suhu') + 20) / 60;
      s.data.asam.userData.gerak(dt, cepat);

      // logam mengecil saat bereaksi
      s.data.logam.children.forEach(function (m, i) {
        const sk = Math.max(0.05, 1 - f * 0.92);
        m.scale.setScalar(m.userData.r0 * sk);
        m.position.y = m.userData.y0 * sk + 0.04;
      });

      // kilatan tumbukan berhasil (frekuensi ~ laju)
      s.data.kilat.forEach(function (k) {
        k.t += dt;
        if (s.data.jalan && kecepatan > 0.05 && k.t > 0.25 + 1.2 / Math.max(0.1, kecepatan)) {
          k.t = 0;
          const a = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random()) * 0.8;
          k.m.position.set(-1.6 + Math.cos(a) * rr, 0.25 + Math.random() * 0.5,
            Math.sin(a) * rr);
        }
        const u = S.clamp(1 - k.t / 0.35, 0, 1);
        k.m.material.opacity = u * 0.85;
        k.m.scale.setScalar(0.08 + (1 - u) * 0.2);
      });

      s.data.v = v;
      if (s.data.jalan) gambar(s);
    },

    bacaUbah: function (s) {
      const h = hitung(s);
      const v = s.data.v || 0;
      const f = v / Math.max(0.001, h.vMaks);
      s.baca('laju', S.fmtRapi(h.laju) + ' satuan/s',
        h.laju > 3 ? 'aksen' : h.laju > 0.5 ? 'warn' : 'danger');
      s.baca('vol', S.fmt(v, 1) + ' mL dari ' + S.fmt(h.vMaks, 1) + ' mL  ('
        + Math.round(f * 100) + ' %)');
      s.baca('waktu', S.fmt(s.data.jam, 1) + ' s' + (s.data.jalan ? ' — berjalan' : ' — berhenti'));
      s.baca('ea', h.ea + ' kJ/mol  (' + h.k.n + ')', h.ea < 45 ? 'aksen' : 'warn');
      s.baca('luas', S.fmt(h.b.luas, 2) + ' ×  (' + h.b.n + ')');
      s.baca('sebab', faktorUtama(s));
      gambar(s);
    }
  };

  function faktorUtama(s) {
    const dasar = { c: 1, suhu: 25, luas: 1, ea: 60 };
    const h = hitung(s);
    const skor = [
      { n: 'konsentrasi', v: Math.abs(Math.log(h.c / dasar.c)) },
      { n: 'suhu', v: Math.abs((s.get('suhu') - 25) / 25) * 1.3 },
      { n: 'luas permukaan', v: Math.abs(Math.log(h.b.luas)) },
      { n: 'katalis', v: Math.abs((60 - h.ea) / 20) * 1.1 }
    ].sort(function (a, b) { return b.v - a.v; });
    if (skor[0].v < 0.08) return 'Semua faktor masih di keadaan dasar';
    return 'Perubahan ' + skor[0].n + ' paling banyak mengubah laju';
  }

  function ulang(s) {
    s.data.jam = 0;
    s.data.jalan = false;
    s.data.rekam = [[0, 0]];
    gambar(s);
  }

  function simpan(s) {
    const h = hitung(s);
    const warna = ['#f0a94a', '#6fb6ff', '#c58ef0', '#9fe8ad', '#ef6a52'];
    s.data.tersimpan.push({
      titik: s.data.rekam.slice(),
      warna: warna[s.data.tersimpan.length % warna.length],
      nama: S.fmt(h.c, 1) + ' M · ' + Math.round(s.get('suhu')) + '°C · ' + h.b.n
    });
    if (s.data.tersimpan.length > 4) s.data.tersimpan.shift();
    gambar(s);
  }

  function gambar(s) {
    if (!s.data.g1 || !s.data.g1.visible) return;
    const h = hitung(s);

    if (s.get('panel') === 'energi') {
      const jalur = function (ea, warna, nama, putus) {
        const t = [[0, 0], [0.2, 0]];
        for (let i = 0; i <= 24; i++) {
          const u = i / 24;
          t.push([0.2 + u * 0.5, S.lerp(0, -466, u) + (ea + 233) * Math.sin(Math.PI * u)]);
        }
        t.push([0.7, -466]); t.push([1, -466]);
        return { titik: t, warna: warna, nama: nama, putus: putus, tebal: 3 };
      };
      const seri = [jalur(60, '#9aa8b4', 'tanpa katalis', true)];
      if (h.ea !== 60) seri.push(jalur(h.ea, '#9fe8ad', h.k.n, false));
      S.gambarGrafik(s.data.g1, {
        judul: 'Diagram energi — katalis menurunkan Ea',
        xMin: 0, xMax: 1, yMin: -560, yMax: 130,
        xLabel: 'jalannya reaksi', yLabel: 'entalpi (kJ)',
        seri: seri,
        garisY: [
          { v: 0, warna: 'rgba(214,228,240,.5)', label: 'Mg + 2HCl' },
          { v: -466, warna: 'rgba(240,169,74,.7)', label: 'MgCl₂ + H₂   −466 kJ' }
        ],
        titikTebal: [{ x: 0.45, y: h.ea, warna: '#f0d040', r: 6 }]
      });
      return;
    }

    const maksX = Math.max(20, s.data.jam * 1.15);
    const seri = s.data.tersimpan.map(function (t) {
      return { titik: t.titik, warna: t.warna, nama: t.nama, tebal: 2, putus: true };
    });
    seri.push({ titik: s.data.rekam.length > 1 ? s.data.rekam : [[0, 0], [0.001, 0]],
      warna: '#4fd1c0', tebal: 3.4, nama: 'percobaan sekarang' });

    S.gambarGrafik(s.data.g1, {
      judul: 'Volume gas H₂ terhadap waktu',
      xMin: 0, xMax: maksX, yMin: 0, yMax: Math.max(20, h.vMaks * 1.15),
      xLabel: 'waktu (s)', yLabel: 'volume H₂ (mL)',
      seri: seri,
      garisY: [{ v: h.vMaks, warna: 'rgba(240,208,64,.7)',
        label: 'volume maksimum ' + S.fmt(h.vMaks, 0) + ' mL' }]
    });
  }

  function pasang(s) {
    const h = hitung(s);
    const b = h.b;

    // butiran logam
    const g = s.data.logam;
    while (g.children.length) S.buangObjek(g.children.pop());
    const mat = S.matLogam(0xb8c2cc, { roughness: 0.45 });
    for (let i = 0; i < b.butir; i++) {
      const m = new T.Mesh(b.butir === 1
        ? new T.BoxGeometry(1.3, 0.1, 0.8)
        : new T.DodecahedronGeometry(1, 0), mat);
      const r0 = b.butir === 1 ? 1 : b.r;
      m.userData.r0 = r0;
      m.scale.setScalar(r0);
      const a = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random()) * 0.8;
      const y0 = b.butir === 1 ? 0.12 : b.r + 0.05;
      m.userData.y0 = y0;
      m.position.set(-1.6 + (b.butir === 1 ? 0 : Math.cos(a) * rr), 0.08 + y0,
        b.butir === 1 ? 0 : Math.sin(a) * rr);
      m.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      m.castShadow = true;
      g.add(m);
    }

    // warna larutan ikut katalis
    s.data.labu.userData.setLevel(0.5,
      h.k.warna === 0x9aa8b4 ? 0xdfe8ee : h.k.warna);
    s.data.labu.userData.cair.material.opacity = 0.55 + S.clamp(h.c / 3, 0, 0.3);

    // kerapatan partikel asam ikut konsentrasi
    const d = s.data.asam.userData.p;
    const n = Math.round(S.clamp(h.c / 3, 0.08, 1) * d.length);
    for (let i = 0; i < d.length; i++) d[i].aktif = i < n;
    s.data.asam.userData.tulis();
    s.data.asam.visible = s.get('partikel');

    s.data.lblS.userData.ganti(Math.round(s.get('suhu')) + ' °C',
      s.get('suhu') > 55 ? '#ef6a52' : s.get('suhu') < 15 ? '#6fb6ff' : '#f0a94a');
    s.data.g1.visible = s.get('grafik');
  }
})());
