/* Kesetimbangan Kimia dan Asas Le Chatelier — Fase F — adegan 3D */

Sim3D.daftar('kesetimbangan', (function () {
  'use strict';
  const T = THREE, S = S3;

  /* Setiap sistem: A ⇌ B dengan koefisien, dH, dan warna gas/larutan.
     mol: koefisien kiri/kanan untuk menentukan pengaruh tekanan. */
  const SISTEM = [
    { n: 'N₂O₄(g) ⇌ 2NO₂(g)', molKi: 1, molKa: 2, dH: 57.2, K: 0.36,
      ki: { n: 'N₂O₄', w: 0xdfe8ee }, ka: { n: 'NO₂', w: 0xc86a28 }, fase: 'gas' },
    { n: 'N₂(g) + 3H₂(g) ⇌ 2NH₃(g)', molKi: 4, molKa: 2, dH: -92.4, K: 0.65,
      ki: { n: 'N₂+3H₂', w: 0x9ec8f0 }, ka: { n: 'NH₃', w: 0x8ad0a8 }, fase: 'gas' },
    { n: '2SO₂(g) + O₂(g) ⇌ 2SO₃(g)', molKi: 3, molKa: 2, dH: -197, K: 0.8,
      ki: { n: 'SO₂+O₂', w: 0xe8d870 }, ka: { n: 'SO₃', w: 0xeaf2f6 }, fase: 'gas' },
    { n: 'H₂(g) + I₂(g) ⇌ 2HI(g)', molKi: 2, molKa: 2, dH: -9.4, K: 0.78,
      ki: { n: 'H₂+I₂', w: 0xc868c8 }, ka: { n: 'HI', w: 0xdfe8ee }, fase: 'gas' },
    { n: 'Fe³⁺ + SCN⁻ ⇌ FeSCN²⁺', molKi: 2, molKa: 1, dH: -18, K: 0.55,
      ki: { n: 'Fe³⁺+SCN⁻', w: 0xf0d8a0 }, ka: { n: 'FeSCN²⁺', w: 0xb02a1a }, fase: 'larutan' },
    { n: 'CoCl₄²⁻ + 6H₂O ⇌ Co(H₂O)₆²⁺', molKi: 1, molKa: 1, dH: -40, K: 0.5,
      ki: { n: 'CoCl₄²⁻ (biru)', w: 0x2a5ad0 }, ka: { n: 'Co(H₂O)₆²⁺ (merah)', w: 0xd8486a }, fase: 'larutan' }
  ];

  const NP = 120;

  function sistem(s) { return SISTEM[parseInt(s.get('sis'), 10) || 0]; }

  /* ------------------------------------------------------- van 't Hoff --
     ln K(T) = ln K(298) + (ΔH/R) · (1/298,15 − 1/T)

     ΔH pada tabel di atas ditulis dalam kJ/mol sedangkan R dalam J/(mol·K),
     jadi ΔH harus dikalikan 1000 lebih dahulu.

     Nilai mentahnya terlalu tajam untuk dipakai mengajar: pada ΔH = −197 kJ,
     K turun ribuan kali lipat hanya dalam beberapa puluh derajat sehingga
     slider langsung mentok di ujung. Karena itu besar pergeserannya diredam
     dengan tanh. Yang dipertahankan:
       · tandanya  — endoterm dipanaskan selalu bergeser ke kanan, dan
                     eksoterm selalu ke kiri;
       · urutannya — makin besar |ΔH| makin besar pergeserannya
                     (SO₃ bergerak jauh, HI hampir diam);
       · bentuknya — tetap bergantung pada 1/T, bukan pada T,
                     sehingga mendinginkan terasa lebih kuat daripada
                     memanaskan pada selisih derajat yang sama.                */
  const R_GAS = 8.314;        // J/(mol·K)
  const T_ACUAN = 298.15;     // 25 °C
  const REDAM = 6.0;          // skala peredam tanh pada sumbu ln K
  const KUAT = 2.6;           // lebar pergeseran maksimum pada sumbu ln K

  function lnAcuan(z) { return Math.log(z.K / (1 - z.K)); }

  /** ln K pada suhu sekarang. Hanya suhu yang boleh mengubah K. */
  function lnTetapan(s) {
    const z = sistem(s);
    const Tk = s.get('suhu') + 273.15;
    const mentah = (z.dH * 1000 / R_GAS) * (1 / T_ACUAN - 1 / Tk);
    return lnAcuan(z) + KUAT * Math.tanh(mentah / REDAM);
  }

  /** Kc relatif = perbandingan hasil/pereaksi pada kesetimbangan murni. */
  function tetapanK(s) { return Math.exp(lnTetapan(s)); }

  /* Fraksi hasil pada kesetimbangan. Suhu menentukan titik dasarnya lewat K;
     tekanan dan penambahan zat menggeser posisinya TANPA mengubah K. */
  function setimbang(s) {
    const z = sistem(s);
    let f = 1 / (1 + Math.exp(-lnTetapan(s)));
    // tekanan: bergeser ke ruas dengan mol gas lebih kecil
    if (z.fase === 'gas') {
      const p = s.get('tekanan');
      const beda = z.molKi - z.molKa;          // > 0 → kanan lebih sedikit mol
      f = S.clamp(f + Math.log(p) * beda * 0.14, 0.02, 0.98);
    }
    // gangguan konsentrasi: tambah pereaksi (geser kanan) / tambah produk (geser kiri)
    f = S.clamp(f + s.get('tambah') * 0.09, 0.02, 0.98);
    return f;
  }

  return {
    latar: 0x070c12,
    kamera: { jarak: 13.8, phi: 1.06, theta: 0.6, targetY: 2.35, lajuPutar: 0.1 },

    legenda: [
      { warna: '#6fb6ff', label: 'pereaksi (ruas kiri)' },
      { warna: '#f0a94a', label: 'hasil (ruas kanan)' },
      { warna: '#f0d040', label: 'panah arah pergeseran' }
    ],

    kendali: [
      { judul: 'Sistem', isi: [
        { type: 'select', id: 'sis', value: 0, label: 'Reaksi kesetimbangan',
          options: SISTEM.map(function (z, i) { return { value: i, label: z.n }; }) }
      ]},
      { judul: 'Gangguan', isi: [
        { type: 'slider', id: 'suhu', value: 25, min: -10, max: 300, step: 5,
          label: 'Suhu', unit: ' °C', dec: 0 },
        { type: 'slider', id: 'tekanan', value: 1, min: 0.2, max: 6, step: 0.1,
          label: 'Tekanan (hanya gas)', unit: ' atm', dec: 1 },
        { type: 'slider', id: 'tambah', value: 0, min: -3, max: 3, step: 0.1,
          label: 'Tambah pereaksi (+) / hasil (−)', unit: '', dec: 1 },
        { type: 'buttons', label: '', items: [
          { label: '↺ Kembali ke keadaan awal', utama: true, klik: function (s) {
            s.set('suhu', 25); s.set('tekanan', 1); s.set('tambah', 0);
          }}
        ]}
      ]},
      { judul: 'Tampilan', isi: [
        { type: 'toggle', id: 'grafik', value: true, label: 'Tampilkan grafik konsentrasi' },
        { type: 'toggle', id: 'panah', value: true, label: 'Tampilkan panah pergeseran' },
        { type: 'slider', id: 'laju', value: 1, min: 0.2, max: 3, step: 0.1,
          label: 'Kecepatan animasi', unit: '×', dec: 1 }
      ]}
    ],

    baca: [
      { id: 'arah', label: 'Arah pergeseran', tone: 'aksen' },
      { id: 'ki', label: 'Pereaksi' },
      { id: 'ka', label: 'Hasil' },
      { id: 'k', label: 'Tetapan Kc (relatif)' },
      { id: 'suhu', label: 'Pengaruh suhu' },
      { id: 'tek', label: 'Pengaruh tekanan' }
    ],

    bangun: function (s) {
      s.tambah(S.lantai({ r: 9, warna: 0x0b1118 }));

      /* ---------- bejana silinder berpiston ---------- */
      const R = 1.7;
      const dinding = new T.Mesh(new T.CylinderGeometry(R, R, 3.4, 48, 1, true),
        new T.MeshPhysicalMaterial({ color: 0xcfe6f2, roughness: 0.05, transparent: true,
          opacity: 0.16, side: T.DoubleSide, depthWrite: false }));
      dinding.position.y = 1.75;
      s.tambah(dinding);
      const dasar = new T.Mesh(new T.CylinderGeometry(R + 0.1, R + 0.18, 0.22, 48),
        S.matLogam(0x6b7784, { roughness: 0.55 }));
      dasar.position.y = 0.06;
      dasar.receiveShadow = true;
      s.tambah(dasar);

      // piston
      const piston = new T.Mesh(new T.CylinderGeometry(R - 0.02, R - 0.02, 0.2, 48),
        S.matLogam(0xb0b8c0, { roughness: 0.4 }));
      s.data.piston = piston;
      s.tambah(piston);
      const tangkai = new T.Mesh(new T.CylinderGeometry(0.1, 0.1, 1.6, 18), S.matLogam(0x98a0a8));
      s.data.tangkai = tangkai;
      s.tambah(tangkai);
      const pegangan = new T.Mesh(new T.BoxGeometry(1.0, 0.14, 0.3), S.matLogam(0xd0a84a));
      s.data.pegangan = pegangan;
      s.tambah(pegangan);

      /* ---------- partikel: pereaksi & hasil ---------- */
      const pKi = S.partikel(NP, { r: 0.12, warna: 0xdfe8ee, kotak: { x: 1.4, y: 1.3, z: 1.4 } });
      const pKa = S.partikel(NP, { r: 0.1, warna: 0xc86a28, kotak: { x: 1.4, y: 1.3, z: 1.4 } });
      [pKi, pKa].forEach(function (p) {
        p.position.y = 1.6;
        p.material.transparent = true;
        p.material.opacity = 0.95;
        s.tambah(p);
      });
      s.data.pKi = pKi; s.data.pKa = pKa;

      // kabut warna di dalam bejana (untuk gas berwarna / larutan)
      const kabut = new T.Mesh(new T.CylinderGeometry(R - 0.06, R - 0.06, 1, 40),
        new T.MeshStandardMaterial({ color: 0xc86a28, transparent: true, opacity: 0.1,
          depthWrite: false }));
      s.data.kabut = kabut;
      s.tambah(kabut);

      /* ---------- pemanas / pendingin ---------- */
      const pelat = new T.Mesh(new T.CylinderGeometry(R + 0.4, R + 0.4, 0.14, 48),
        new T.MeshStandardMaterial({ color: 0x3a3f46, roughness: 0.7,
          emissive: 0xef4a3a, emissiveIntensity: 0 }));
      pelat.position.y = -0.1;
      s.data.pelat = pelat;
      s.tambah(pelat);

      const lblSuhu = S.teks('', { skala: 0.32, lebar: 12, warna: '#f0a94a' });
      lblSuhu.position.set(-2.9, 0.5, 0);
      s.data.lblSuhu = lblSuhu;
      s.tambah(lblSuhu);

      const lblTek = S.teks('', { skala: 0.3, lebar: 12, warna: '#8fd8ff' });
      lblTek.position.set(2.9, 4.4, 0);
      s.data.lblTek = lblTek;
      s.tambah(lblTek);

      /* ---------- panah pergeseran ---------- */
      const pKanan = S.panah([-0.9, 4.6, 0], [0.9, 4.6, 0], { warna: 0xf0a94a, tebal: 0.06 });
      const pKiri = S.panah([0.9, 4.6, 0], [-0.9, 4.6, 0], { warna: 0x6fb6ff, tebal: 0.06 });
      pKanan.visible = false; pKiri.visible = false;
      s.data.pKanan = pKanan; s.data.pKiri = pKiri;
      s.tambah(pKanan); s.tambah(pKiri);

      /* ---------- neraca batang (lambang kesetimbangan) ---------- */
      /* Neraca dibungkus satu grup. Grup ini diputar mengikuti kamera pada
         sumbu tegak saja (lihat langkah()), sehingga batangnya selalu
         melintang terhadap arah pandang. Tanpa itu, pada kemiringan kecil
         perspektif kamera justru membuat neraca tampak miring ke arah yang
         berlawanan dengan data — menyesatkan siswa. */
      const NX = -2.2, NY = 1.45, NZ = 2.9;    // letak neraca di depan-kiri
      const NL = 0.78;                          // panjang lengan
      s.data.ny = NY; s.data.nl = NL;
      const neraca = new T.Group();
      neraca.position.set(NX, 0, NZ);
      const alasN = new T.Mesh(new T.CylinderGeometry(0.42, 0.5, 0.1, 28),
        S.matLogam(0x6b7784, { roughness: 0.5 }));
      alasN.position.y = 0.05;
      alasN.receiveShadow = true;
      neraca.add(alasN);
      neraca.add(S.bayanganKontak({ r: 0.75, y: 0.012, kuat: 0.7 }));
      const tiang = new T.Mesh(new T.CylinderGeometry(0.055, 0.075, NY, 16),
        S.matLogam(0x8d99a4));
      tiang.position.y = NY / 2 + 0.08;
      neraca.add(tiang);
      const batang = new T.Mesh(new T.BoxGeometry(NL * 2.1, 0.07, 0.12),
        S.matLogam(0xc8ced4));
      batang.position.y = NY + 0.08;
      s.data.batang = batang;
      neraca.add(batang);
      const piringKi = new T.Mesh(new T.CylinderGeometry(0.3, 0.3, 0.045, 28),
        new T.MeshStandardMaterial({ color: 0x9ec8f0, roughness: 0.4,
          emissive: 0x9ec8f0, emissiveIntensity: 0.2 }));
      const piringKa = new T.Mesh(new T.CylinderGeometry(0.3, 0.3, 0.045, 28),
        new T.MeshStandardMaterial({ color: 0xf0a94a, roughness: 0.4,
          emissive: 0xf0a94a, emissiveIntensity: 0.2 }));
      s.data.piringKi = piringKi; s.data.piringKa = piringKa;
      neraca.add(piringKi); neraca.add(piringKa);
      s.data.neraca = neraca;
      s.tambah(neraca);
      const lblN = S.teks('neraca kesetimbangan', { skala: 0.19, lebar: 20,
        warna: '#9fb4c6', maksLebar: 2.4 });
      lblN.position.set(NX, 0.3, NZ + 0.8);
      s.tambah(lblN);

      /* ---------- panel grafik ---------- */
      const g1 = S.panelGrafik({ w: 3.5, px: 620, py: 400 });
      g1.position.set(-3.95, 3.1, -1.5);
      s.data.g1 = g1;
      s.tambah(g1);

      const lbl = S.teks('', { skala: 0.46, lebar: 34, warna: '#d8e4ec',
        maksLebar: 5.4 });
      lbl.position.set(0.4, 0.28, 3.3);
      s.data.lbl = lbl;
      s.tambah(lbl);

      s.data.f = setimbang(s);
      s.data.fLama = s.data.f;
      s.data.rekam = [];
      s.data.jam = 0;
      pasang(s);
    },

    ubah: function (s, id) {
      if (id === 'sis') pasang(s);
      if (id === 'grafik') s.data.g1.visible = s.get('grafik');
      if (id === 'panah' && !s.get('panah')) {
        s.data.pKanan.visible = false;
        s.data.pKiri.visible = false;
      }
      if (id !== 'laju' && id !== 'grafik' && id !== 'panah') s.data.ganggu = 1;
    },

    langkah: function (s, dt) {
      const z = sistem(s);
      const target = setimbang(s);
      const dtl = dt * s.get('laju');

      // konsentrasi menuju nilai setimbang dengan relaksasi
      s.data.fLama = s.data.f;
      s.data.f = S.lerp(s.data.f, target, S.clamp(dtl * 1.6, 0, 1));
      const f = s.data.f;

      s.data.jam += dtl * 3;
      if (s.data.rekam.length > 420) s.data.rekam.shift();
      s.data.rekam.push([s.data.jam, f]);

      // jumlah partikel tiap sisi
      const nKa = Math.round(f * NP);
      aturJumlah(s.data.pKa, nKa);
      aturJumlah(s.data.pKi, NP - nKa);

      // piston: tekanan tinggi → volume kecil
      const vol = z.fase === 'gas' ? S.clamp(1 / s.get('tekanan'), 0.18, 1.2) : 1;
      const tinggi = 0.9 + vol * 2.2;
      s.data.piston.position.y = tinggi + 0.1;
      s.data.tangkai.position.y = tinggi + 1.0;
      s.data.pegangan.position.y = tinggi + 1.85;

      const setengah = Math.max(0.3, (tinggi - 0.25) / 2);
      [s.data.pKi, s.data.pKa].forEach(function (p) {
        p.position.y = 0.2 + setengah;
        p.userData.kotak = { x: 1.45, y: setengah, z: 1.45 };
      });

      const laju = 0.5 + (s.get('suhu') + 20) / 90;
      s.data.pKi.userData.gerak(dtl, laju);
      s.data.pKa.userData.gerak(dtl, laju);

      // kabut warna: campuran warna kiri & kanan sesuai fraksi
      const c = new T.Color(z.ki.w).lerp(new T.Color(z.ka.w), f);
      s.data.kabut.material.color.copy(c);
      s.data.kabut.scale.y = tinggi - 0.25;
      s.data.kabut.position.y = 0.2 + (tinggi - 0.25) / 2;
      s.data.kabut.material.opacity = z.fase === 'larutan' ? 0.55 : 0.1 + f * 0.14;

      // pelat pemanas
      const panas = S.clamp((s.get('suhu') - 25) / 275, -1, 1);
      s.data.pelat.material.emissive.setRGB(
        panas > 0 ? 0.9 : 0.25, panas > 0 ? 0.25 : 0.55, panas > 0 ? 0.15 : 0.95);
      s.data.pelat.material.emissiveIntensity = Math.abs(panas) * 0.85;
      s.data.lblSuhu.userData.ganti(Math.round(s.get('suhu')) + ' °C',
        panas > 0.1 ? '#ef6a52' : panas < -0.1 ? '#6fb6ff' : '#f0a94a');
      s.data.lblTek.userData.ganti(z.fase === 'gas'
        ? S.fmt(s.get('tekanan'), 1) + ' atm' : 'larutan — tekanan tak berpengaruh');

      // neraca miring sesuai fraksi
      /* Hadapkan neraca ke kamera pada sumbu tegak saja supaya batangnya
         melintang terhadap pandangan dan kemiringannya terbaca jujur. */
      const kam = s.kamera;
      if (kam) {
        const n = s.data.neraca;
        n.rotation.y = Math.atan2(kam.position.x - n.position.x,
          kam.position.z - n.position.z);
      }
      const miring = (f - 0.5) * 0.9;
      const NY = s.data.ny + 0.08, NL = s.data.nl;
      // makin banyak hasil → piring hasil (kanan) makin berat dan turun
      s.data.batang.rotation.z = -miring;
      s.data.piringKi.position.set(-NL * Math.cos(miring),
        NY + NL * Math.sin(miring) - 0.22, 0);
      s.data.piringKa.position.set(NL * Math.cos(miring),
        NY - NL * Math.sin(miring) - 0.22, 0);

      // panah pergeseran
      const d = target - f;
      if (s.get('panah')) {
        s.data.pKanan.visible = d > 0.004;
        s.data.pKiri.visible = d < -0.004;
        const kuat = S.clamp(Math.abs(d) * 9, 0.2, 1);
        [s.data.pKanan, s.data.pKiri].forEach(function (p) {
          p.children.forEach(function (m) { m.material.emissiveIntensity = kuat; });
          p.scale.setScalar(0.8 + kuat * 0.4);
        });
      }

      if (s.get('grafik')) gambar(s);
    },

    bacaUbah: function (s) {
      const z = sistem(s);
      const f = s.data.f === undefined ? setimbang(s) : s.data.f;
      const target = setimbang(s);
      const d = target - f;
      s.baca('arah', Math.abs(d) < 0.004 ? 'Sudah setimbang — laju maju = laju balik'
        : d > 0 ? 'Bergeser ke kanan (menambah hasil)' : 'Bergeser ke kiri (menambah pereaksi)',
        Math.abs(d) < 0.004 ? 'aksen' : d > 0 ? 'warn' : 'biru');
      s.baca('ki', z.ki.n + ' : ' + Math.round((1 - f) * 100) + ' %');
      s.baca('ka', z.ka.n + ' : ' + Math.round(f * 100) + ' %');

      /* Kc hanya berubah oleh suhu. Tekanan dan penambahan zat menggeser
         posisi setimbang, tetapi angka Kc-nya tetap — itu justru inti
         pelajarannya, jadi angkanya dibaca dari K, bukan dari f. */
      const kSekarang = tetapanK(s);
      const kAcuan = z.K / (1 - z.K);
      s.baca('k', S.fmtRapi(kSekarang) + '   (pada 25 °C: ' + S.fmtRapi(kAcuan)
        + ')   — hanya suhu yang mengubahnya');

      const dT = Math.round(s.get('suhu')) - 25;
      const rasio = kSekarang / kAcuan;
      const sifat = z.dH > 0
        ? 'Endoterm (ΔH = +' + z.dH + ' kJ) — panas berlaku sebagai pereaksi'
        : 'Eksoterm (ΔH = ' + z.dH + ' kJ) — panas berlaku sebagai hasil';
      s.baca('suhu', Math.abs(dT) < 1
        ? sifat + '.  Sekarang tepat di suhu acuan 25 °C.'
        : sifat + '.  ' + (dT > 0 ? 'Dipanaskan ' + dT : 'Didinginkan ' + (-dT))
          + ' °C → Kc menjadi ' + S.fmtRapi(rasio) + '× dan setimbang bergeser ke '
          + (rasio > 1.001 ? 'kanan' : rasio < 0.999 ? 'kiri' : 'tempat semula') + '.',
      z.dH > 0 ? 'biru' : 'warn');
      s.baca('tek', z.fase === 'larutan' ? 'Tidak berpengaruh — bukan sistem gas'
        : z.molKi === z.molKa ? 'Tidak berpengaruh — jumlah mol gas kedua ruas sama ('
          + z.molKi + ' = ' + z.molKa + ')'
          : 'Ditekan bergeser ke ruas ber-mol lebih kecil ('
            + (z.molKa < z.molKi ? 'kanan, ' + z.molKa + ' mol' : 'kiri, ' + z.molKi + ' mol') + ')',
        z.fase === 'larutan' || z.molKi === z.molKa ? undefined : 'aksen');
    }
  };

  function aturJumlah(p, n) {
    const d = p.userData.p;
    for (let i = 0; i < d.length; i++) {
      if (!d[i].aktif && i < n) {
        d[i].pos.set(S.acak(-1.2, 1.2), S.acak(-0.8, 0.8), S.acak(-1.2, 1.2));
      }
      d[i].aktif = i < n;
    }
    p.userData.tulis();
  }

  function gambar(s) {
    const z = sistem(s);
    const rek = s.data.rekam;
    const kiri = rek.map(function (t) { return [t[0], 1 - t[1]]; });
    const maksX = Math.max(20, s.data.jam);
    const minX = Math.max(0, s.data.jam - 60);
    S.gambarGrafik(s.data.g1, {
      judul: 'Perbandingan jumlah zat terhadap waktu',
      xMin: minX, xMax: maksX, yMin: 0, yMax: 1,
      xLabel: 'waktu', yLabel: 'fraksi zat',
      seri: [
        { titik: kiri.length > 1 ? kiri : [[0, 0.5], [0.001, 0.5]],
          warna: '#6fb6ff', tebal: 3, nama: 'pereaksi' },
        { titik: rek.length > 1 ? rek : [[0, 0.5], [0.001, 0.5]],
          warna: '#f0a94a', tebal: 3, nama: 'hasil' }
      ],
      garisY: [{ v: setimbang(s), warna: 'rgba(79,209,192,.75)', label: 'nilai setimbang baru' }]
    });
  }

  function pasang(s) {
    const z = sistem(s);
    s.data.f = setimbang(s);
    s.data.fLama = s.data.f;
    s.data.jam = 0;
    s.data.rekam = [[0, s.data.f]];

    s.data.pKi.material.color.setHex(z.ki.w);
    s.data.pKi.material.emissive.setHex(z.ki.w);
    s.data.pKa.material.color.setHex(z.ka.w);
    s.data.pKa.material.emissive.setHex(z.ka.w);
    s.data.piringKi.material.color.setHex(z.ki.w);
    s.data.piringKa.material.color.setHex(z.ka.w);
    s.data.g1.visible = s.get('grafik');
    s.data.lbl.userData.ganti(z.n);
  }
})());
