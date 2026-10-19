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

  /* Fraksi produk pada kesetimbangan, dipengaruhi suhu, tekanan, dan gangguan */
  function setimbang(s) {
    const z = sistem(s);
    const Tk = s.get('suhu') + 273.15;
    // ln K bergeser menurut van't Hoff: endoterm → K naik saat panas
    const lnK = Math.log(z.K / (1 - z.K)) + (z.dH / 8.314) * (1 / 298.15 - 1 / Tk) * 1000 / 1000 * 1.0;
    let f = 1 / (1 + Math.exp(-lnK));
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

  function arah(s) {
    const f = setimbang(s);
    const lama = s.data ? (s.data.fLama === undefined ? f : s.data.fLama) : f;
    const d = f - lama;
    if (Math.abs(d) < 0.004) return { teks: 'Sudah setimbang — laju maju = laju balik', tone: 'aksen', d: 0 };
    return d > 0
      ? { teks: 'Bergeser ke kanan (ke arah hasil)', tone: 'warn', d: 1 }
      : { teks: 'Bergeser ke kiri (ke arah pereaksi)', tone: 'biru', d: -1 };
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
      const tiang = new T.Mesh(new T.CylinderGeometry(0.06, 0.08, 1.1, 16), S.matLogam(0x8d99a4));
      tiang.position.set(4.6, 1.0, 0);
      s.tambah(tiang);
      const batang = new T.Mesh(new T.BoxGeometry(2.4, 0.08, 0.14), S.matLogam(0xc8ced4));
      batang.position.set(4.6, 1.6, 0);
      s.data.batang = batang;
      s.tambah(batang);
      const piringKi = new T.Mesh(new T.CylinderGeometry(0.42, 0.42, 0.05, 28),
        new T.MeshStandardMaterial({ color: 0x9ec8f0, roughness: 0.4,
          emissive: 0x9ec8f0, emissiveIntensity: 0.2 }));
      const piringKa = new T.Mesh(new T.CylinderGeometry(0.42, 0.42, 0.05, 28),
        new T.MeshStandardMaterial({ color: 0xf0a94a, roughness: 0.4,
          emissive: 0xf0a94a, emissiveIntensity: 0.2 }));
      s.data.piringKi = piringKi; s.data.piringKa = piringKa;
      s.tambah(piringKi); s.tambah(piringKa);

      /* ---------- panel grafik ---------- */
      const g1 = S.panelGrafik({ w: 4.2, px: 680, py: 430 });
      g1.position.set(-3.6, 3.4, -1.4);
      s.data.g1 = g1;
      s.tambah(g1);

      const lbl = S.teks('', { skala: 0.4, lebar: 40, warna: '#d8e4ec' });
      lbl.position.set(0, 5.5, 0);
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
      const miring = (f - 0.5) * 0.55;
      s.data.batang.rotation.z = -miring;
      s.data.piringKi.position.set(4.6 - 1.1 * Math.cos(miring), 1.6 - 1.1 * Math.sin(miring) * -1 - 0.26, 0);
      s.data.piringKa.position.set(4.6 + 1.1 * Math.cos(miring), 1.6 + 1.1 * Math.sin(miring) * -1 - 0.26, 0);

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
      s.baca('k', S.fmtRapi(f / Math.max(0.001, 1 - f)) + '  (perbandingan hasil/pereaksi)');
      s.baca('suhu', z.dH > 0
        ? 'Endoterm (ΔH = +' + z.dH + ' kJ) — dipanaskan bergeser ke kanan'
        : 'Eksoterm (ΔH = ' + z.dH + ' kJ) — dipanaskan bergeser ke kiri',
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
