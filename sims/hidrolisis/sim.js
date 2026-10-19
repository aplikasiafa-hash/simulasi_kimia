/* Hidrolisis Garam — Fase F — adegan 3D */

Sim3D.daftar('hidrolisis', (function () {
  'use strict';
  const T = THREE, S = S3;

  const KW = 1e-14;

  /* jenis: 'kk' kuat-kuat (netral), 'kl' asam kuat + basa lemah (asam),
     'lk' asam lemah + basa kuat (basa), 'll' lemah-lemah (bergantung Ka/Kb) */
  const GARAM = [
    { n: 'NaCl', jenis: 'kk', kation: 'Na⁺', anion: 'Cl⁻', warna: 0xdfe8ee,
      asal: 'HCl (kuat) + NaOH (kuat)' },
    { n: 'KNO₃', jenis: 'kk', kation: 'K⁺', anion: 'NO₃⁻', warna: 0xe4eef4,
      asal: 'HNO₃ (kuat) + KOH (kuat)' },
    { n: 'Na₂SO₄', jenis: 'kk', kation: 'Na⁺', anion: 'SO₄²⁻', warna: 0xeaf2f6,
      asal: 'H₂SO₄ (kuat) + NaOH (kuat)' },
    { n: 'CH₃COONa', jenis: 'lk', ka: 1.8e-5, kation: 'Na⁺', anion: 'CH₃COO⁻', warna: 0xdff0e4,
      asal: 'CH₃COOH (lemah) + NaOH (kuat)' },
    { n: 'NaHCO₃ (soda kue)', jenis: 'lk', ka: 4.3e-7, kation: 'Na⁺', anion: 'HCO₃⁻', warna: 0xdcf0ea,
      asal: 'H₂CO₃ (lemah) + NaOH (kuat)' },
    { n: 'KCN', jenis: 'lk', ka: 6.2e-10, kation: 'K⁺', anion: 'CN⁻', warna: 0xd8f0f0,
      asal: 'HCN (lemah) + KOH (kuat)' },
    { n: 'NaF', jenis: 'lk', ka: 6.8e-4, kation: 'Na⁺', anion: 'F⁻', warna: 0xe2f0e8,
      asal: 'HF (lemah) + NaOH (kuat)' },
    { n: 'NH₄Cl', jenis: 'kl', kb: 1.8e-5, kation: 'NH₄⁺', anion: 'Cl⁻', warna: 0xf0e8dc,
      asal: 'HCl (kuat) + NH₃ (lemah)' },
    { n: '(NH₄)₂SO₄ (pupuk ZA)', jenis: 'kl', kb: 1.8e-5, kation: 'NH₄⁺', anion: 'SO₄²⁻', warna: 0xf0ead8,
      asal: 'H₂SO₄ (kuat) + NH₃ (lemah)' },
    { n: 'AlCl₃', jenis: 'kl', kb: 1.3e-9, kation: 'Al³⁺', anion: 'Cl⁻', warna: 0xf4e4d4,
      asal: 'HCl (kuat) + Al(OH)₃ (lemah)' },
    { n: 'CH₃COONH₄', jenis: 'll', ka: 1.8e-5, kb: 1.8e-5, kation: 'NH₄⁺', anion: 'CH₃COO⁻',
      warna: 0xe8eee8, asal: 'CH₃COOH (lemah) + NH₃ (lemah)' },
    { n: 'NH₄CN', jenis: 'll', ka: 6.2e-10, kb: 1.8e-5, kation: 'NH₄⁺', anion: 'CN⁻',
      warna: 0xe0eef0, asal: 'HCN (lemah) + NH₃ (lemah)' }
  ];

  function garam(s) { return GARAM[parseInt(s.get('g'), 10) || 0]; }

  function hitung(s) {
    const g = garam(s);
    const c = s.get('c');
    let pH = 7, jenisH = 'tidak terhidrolisis', ion = 'tidak ada';
    if (g.jenis === 'kk') {
      pH = 7; jenisH = 'tidak terhidrolisis'; ion = 'tidak ada ion yang bereaksi dengan air';
    } else if (g.jenis === 'lk') {
      const kb = KW / g.ka;
      const OH = Math.sqrt(kb * c);
      pH = S.clamp(14 + Math.log10(OH), 0, 14);
      jenisH = 'hidrolisis sebagian (anion)';
      ion = g.anion + ' + H₂O ⇌ asam lemah + OH⁻';
    } else if (g.jenis === 'kl') {
      const ka = KW / g.kb;
      const H = Math.sqrt(ka * c);
      pH = S.clamp(-Math.log10(H), 0, 14);
      jenisH = 'hidrolisis sebagian (kation)';
      ion = g.kation + ' + H₂O ⇌ basa lemah + H₃O⁺';
    } else {
      const H = Math.sqrt(KW * g.ka / g.kb);
      pH = S.clamp(-Math.log10(H), 0, 14);
      jenisH = 'hidrolisis total (kedua ion)';
      ion = 'kation dan anion sama-sama bereaksi dengan air';
    }
    return { g: g, c: c, pH: pH, jenisH: jenisH, ion: ion };
  }

  function warnaPH(p) {
    const titik = [
      [0, 0xd02020], [2, 0xe85a20], [4, 0xf0a030], [6, 0xd8d040],
      [7, 0x60c860], [8, 0x40b8a0], [10, 0x3878d0], [12, 0x5030b0], [14, 0x30107a]
    ];
    for (let i = 0; i < titik.length - 1; i++) {
      if (p <= titik[i + 1][0]) {
        const u = (p - titik[i][0]) / (titik[i + 1][0] - titik[i][0]);
        return new T.Color(titik[i][1]).lerp(new T.Color(titik[i + 1][1]), u);
      }
    }
    return new T.Color(0x30107a);
  }

  return {
    latar: 0x070c12,
    kamera: { jarak: 12, phi: 1.02, theta: 0.6, targetY: 1.3, lajuPutar: 0.1 },

    legenda: [
      { warna: '#ef6a52', label: 'kation garam' },
      { warna: '#6fb6ff', label: 'anion garam' },
      { warna: '#f0a94a', label: 'H₃O⁺ hasil hidrolisis' },
      { warna: '#8ad0f0', label: 'OH⁻ hasil hidrolisis' },
      { warna: '#cfe6f2', label: 'molekul air' }
    ],

    kendali: [
      { judul: 'Garam', isi: [
        { type: 'select', id: 'g', value: 0, label: 'Garam yang dilarutkan',
          options: GARAM.map(function (g, i) { return { value: i, label: g.n }; }) },
        { type: 'slider', id: 'c', value: 0.1, min: 0.001, max: 1, step: 0.001,
          label: 'Konsentrasi', unit: ' M', dec: 3,
          format: function (v) { return S.fmtRapi(v) + ' M'; } },
        { type: 'buttons', label: '', items: [
          { label: '▶ Larutkan', utama: true, klik: function (s) { s.data.jalan = true; } },
          { label: '↺ Ulangi', klik: function (s) { s.data.t = 0; s.data.jalan = false; } }
        ]}
      ]},
      { judul: 'Rak uji', isi: [
        { type: 'toggle', id: 'rak', value: true, label: 'Tampilkan rak 12 garam' },
        { type: 'segment', id: 'kelompok', value: 'semua', label: 'Kelompok yang disorot', options: [
          { value: 'semua', label: 'Semua' },
          { value: 'kk', label: 'Netral' },
          { value: 'lk', label: 'Basa' },
          { value: 'kl', label: 'Asam' }
        ]}
      ]},
      { judul: 'Tampilan', isi: [
        { type: 'toggle', id: 'ion', value: true, label: 'Tampilkan ion dan molekul air' },
        { type: 'toggle', id: 'putar', value: false, label: 'Putar kamera otomatis' }
      ]}
    ],

    baca: [
      { id: 'ph', label: 'pH larutan', tone: 'aksen' },
      { id: 'sifat', label: 'Sifat larutan' },
      { id: 'jenis', label: 'Jenis hidrolisis' },
      { id: 'reaksi', label: 'Ion yang bereaksi' },
      { id: 'asal', label: 'Berasal dari' },
      { id: 'tetapan', label: 'Tetapan hidrolisis' }
    ],

    bangun: function (s) {
      s.tambah(S.lantai({ r: 10, warna: 0x0b1118 }));

      /* ---------- gelas utama ---------- */
      const gls = S.gelas({ r: 1.4, h: 2.0, level: 0.7, warna: 0x60c860, opacity: 0.6 });
      gls.position.set(-3.0, 0.05, 0);
      s.data.gls = gls;
      s.tambah(gls);

      // kristal garam yang belum larut
      const kristal = new T.Group();
      for (let i = 0; i < 16; i++) {
        const k = new T.Mesh(new T.BoxGeometry(1, 1, 1),
          new T.MeshPhysicalMaterial({ color: 0xf0f4f8, roughness: 0.25, clearcoat: 0.8,
            transparent: true, opacity: 0.95 }));
        const sk = S.acak(0.1, 0.19);
        k.scale.setScalar(sk);
        k.userData.sk = sk;
        const a = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random()) * 0.8;
        k.position.set(Math.cos(a) * rr, 0.1 + Math.random() * 0.15, Math.sin(a) * rr);
        k.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
        kristal.add(k);
      }
      kristal.position.set(-3.0, 0.05, 0);
      s.data.kristal = kristal;
      s.tambah(kristal);

      // ion & molekul air di dalam gelas
      function awan(warna, n, r) {
        const p = S.partikel(n, { r: r, warna: warna, kotak: { x: 1.1, y: 0.55, z: 1.1 } });
        p.position.set(-3.0, 0.75, 0);
        p.material.transparent = true;
        p.material.opacity = 0.92;
        s.tambah(p);
        return p;
      }
      s.data.pKat = awan(0xef6a52, 60, 0.085);
      s.data.pAni = awan(0x6fb6ff, 60, 0.1);
      s.data.pAir = awan(0xcfe6f2, 50, 0.06);
      s.data.pH3O = awan(0xf0a94a, 40, 0.075);
      s.data.pOH = awan(0x8ad0f0, 40, 0.075);

      /* ---------- pH meter ---------- */
      const badan = new T.Mesh(new T.BoxGeometry(1.4, 0.9, 0.45),
        new T.MeshStandardMaterial({ color: 0x232d36, roughness: 0.5, metalness: 0.3 }));
      badan.position.set(-3.0, 3.6, 0);
      s.tambah(badan);
      const layar = new T.Mesh(new T.BoxGeometry(1.1, 0.5, 0.05),
        new T.MeshStandardMaterial({ color: 0x08181a, emissive: 0x0a2a2c, emissiveIntensity: 0.6 }));
      layar.position.set(-3.0, 3.68, 0.25);
      s.tambah(layar);
      const angka = S.teks('7,00', { skala: 0.34, lebar: 8, latar: false, warna: '#4fd1c0' });
      angka.position.set(-3.0, 3.68, 0.31);
      s.data.angka = angka;
      s.tambah(angka);
      const probe = new T.Mesh(new T.CylinderGeometry(0.08, 0.08, 1.9, 18),
        new T.MeshPhysicalMaterial({ color: 0xcfe6f2, roughness: 0.1, transparent: true,
          opacity: 0.4, side: T.DoubleSide }));
      probe.position.set(-2.6, 2.1, 0.2);
      s.tambah(probe);

      /* ---------- rak 12 tabung ---------- */
      const rak = new T.Group();
      const papan = new T.Mesh(new T.BoxGeometry(7.0, 0.16, 1.5),
        new T.MeshStandardMaterial({ color: 0x3a2f26, roughness: 0.8 }));
      papan.position.set(0, 0.1, 0);
      rak.add(papan);
      const papanAtas = new T.Mesh(new T.BoxGeometry(7.0, 0.1, 1.5),
        new T.MeshStandardMaterial({ color: 0x4a3c30, roughness: 0.8, transparent: true,
          opacity: 0.55 }));
      papanAtas.position.set(0, 1.5, 0);
      rak.add(papanAtas);

      s.data.tabung = [];
      s.data.lblTab = [];
      GARAM.forEach(function (g, i) {
        const kol = i % 6, bar = Math.floor(i / 6);
        const x = -2.9 + kol * 1.16;
        const z = bar === 0 ? -0.38 : 0.42;
        const tb = S.tabung({ r: 0.27, h: 1.7, level: 0.6, warna: 0x60c860 });
        tb.position.set(x, 0.2, z);
        rak.add(tb);
        s.data.tabung.push(tb);
        const l = S.teks(g.n, { skala: 0.17, lebar: 14, warna: '#aebbc6' });
        l.position.set(x, 2.15 + (bar === 0 ? 0.3 : 0), z);
        rak.add(l);
        s.data.lblTab.push(l);
      });
      rak.position.set(1.9, 0, 0);
      s.data.rak = rak;
      s.tambah(rak);

      // sorotan tabung terpilih
      const sorot = new T.Mesh(new T.TorusGeometry(0.36, 0.035, 10, 40),
        new T.MeshStandardMaterial({ color: 0xf0d040, emissive: 0xf0d040, emissiveIntensity: 1 }));
      sorot.rotation.x = Math.PI / 2;
      s.data.sorot = sorot;
      s.tambah(sorot);

      const lbl = S.teks('', { skala: 0.38, lebar: 40, warna: '#d8e4ec' });
      lbl.position.set(0, 4.8, 0);
      s.data.lbl = lbl;
      s.tambah(lbl);

      s.data.t = 0;
      s.data.jalan = false;
      pasang(s);
      isiRak(s);
    },

    ubah: function (s, id) {
      if (id === 'g' || id === 'c') pasang(s);
      if (id === 'rak') {
        s.data.rak.visible = s.get('rak');
        s.data.sorot.visible = s.get('rak');
      }
      if (id === 'kelompok') isiRak(s);
      if (id === 'ion') {
        [s.data.pKat, s.data.pAni, s.data.pAir, s.data.pH3O, s.data.pOH]
          .forEach(function (p) { p.visible = s.get('ion'); });
      }
      if (id === 'putar' && s.orbit) s.orbit.set({ putarOtomatis: s.get('putar') });
    },

    langkah: function (s, dt) {
      const h = hitung(s);
      if (s.data.jalan) s.data.t = Math.min(1, s.data.t + dt * 0.5);
      const t = s.data.t;

      // kristal mengecil saat larut
      s.data.kristal.children.forEach(function (k) {
        k.scale.setScalar(k.userData.sk * Math.max(0.001, 1 - t));
        k.rotation.y += dt * 0.6;
        k.visible = t < 0.99;
      });

      // ion muncul setelah larut
      const nIon = Math.round(S.clamp(s.get('c') / 1, 0.08, 1) * 60 * t);
      atur(s.data.pKat, nIon);
      atur(s.data.pAni, nIon);
      // ion hasil hidrolisis
      const kuat = Math.abs(h.pH - 7) / 7;
      atur(s.data.pH3O, h.pH < 7 ? Math.round(kuat * 40 * t) : 0);
      atur(s.data.pOH, h.pH > 7 ? Math.round(kuat * 40 * t) : 0);

      s.data.pKat.userData.gerak(dt, 1.0);
      s.data.pAni.userData.gerak(dt, 0.9);
      s.data.pAir.userData.gerak(dt, 0.7);
      s.data.pH3O.userData.gerak(dt, 1.2);
      s.data.pOH.userData.gerak(dt, 1.1);

      // pH meter & warna larutan menuju nilai akhir
      const pNow = S.lerp(7, h.pH, t);
      const c = warnaPH(pNow);
      s.data.gls.userData.setLevel(0.7, c.getHex());
      s.data.angka.userData.ganti(S.fmt(pNow, 2), '#' + c.getHexString());

      // sorotan tabung
      const i = parseInt(s.get('g'), 10) || 0;
      const kol = i % 6, bar = Math.floor(i / 6);
      s.data.sorot.position.set(1.9 - 2.9 + kol * 1.16, 0.26, bar === 0 ? -0.38 : 0.42);
      s.data.sorot.material.emissiveIntensity = 0.7 + Math.sin(s.waktu * 3) * 0.3;
    },

    bacaUbah: function (s) {
      const h = hitung(s);
      const t = s.data.t || 0;
      const p = S.lerp(7, h.pH, t);
      s.baca('ph', S.fmt(p, 2) + (t < 0.98 ? '  (sedang melarut…)' : ''),
        h.pH < 6.5 ? 'danger' : h.pH > 7.5 ? 'biru' : 'aksen');
      s.baca('sifat', h.pH < 6.5 ? 'Asam' : h.pH > 7.5 ? 'Basa' : 'Netral',
        h.pH < 6.5 ? 'danger' : h.pH > 7.5 ? 'biru' : 'aksen');
      s.baca('jenis', h.jenisH);
      s.baca('reaksi', h.ion);
      s.baca('asal', h.g.asal);
      s.baca('tetapan', h.g.jenis === 'kk' ? 'Tidak ada — kedua ion berasal dari elektrolit kuat'
        : h.g.jenis === 'lk' ? 'Kb = Kw/Ka = ' + S.fmtRapi(KW / h.g.ka)
          : h.g.jenis === 'kl' ? 'Ka = Kw/Kb = ' + S.fmtRapi(KW / h.g.kb)
            : 'Kh = Kw/(Ka·Kb) = ' + S.fmtRapi(KW / (h.g.ka * h.g.kb)));
    }
  };

  function atur(p, n) {
    const d = p.userData.p;
    for (let i = 0; i < d.length; i++) {
      if (!d[i].aktif && i < n) d[i].pos.set(S.acak(-1, 1), S.acak(-0.45, 0.45), S.acak(-1, 1));
      d[i].aktif = i < n;
    }
    p.userData.tulis();
  }

  function isiRak(s) {
    const kel = s.get('kelompok');
    GARAM.forEach(function (g, i) {
      const c = s.get('c');
      // hitung pH tiap garam pada konsentrasi sekarang
      let pH = 7;
      if (g.jenis === 'lk') pH = S.clamp(14 + Math.log10(Math.sqrt(KW / g.ka * c)), 0, 14);
      else if (g.jenis === 'kl') pH = S.clamp(-Math.log10(Math.sqrt(KW / g.kb * c)), 0, 14);
      else if (g.jenis === 'll') pH = S.clamp(-Math.log10(Math.sqrt(KW * g.ka / g.kb)), 0, 14);
      const w = warnaPH(pH);
      const tb = s.data.tabung[i];
      tb.userData.setLevel(0.6, w.getHex());
      const sorot = kel === 'semua' || kel === g.jenis
        || (kel === 'lk' && g.jenis === 'lk') || (kel === 'kl' && g.jenis === 'kl');
      tb.userData.setOpasitas(sorot ? 0.85 : 0.22);
      s.data.lblTab[i].material.opacity = sorot ? 1 : 0.3;
      s.data.lblTab[i].material.transparent = true;
    });
  }

  function pasang(s) {
    const h = hitung(s);
    s.data.t = 0;
    s.data.jalan = false;

    s.data.kristal.children.forEach(function (k) {
      k.scale.setScalar(k.userData.sk);
      k.visible = true;
      k.material.color.setHex(h.g.warna);
    });
    s.data.gls.userData.setLevel(0.7, 0x60c860);

    atur(s.data.pKat, 0); atur(s.data.pAni, 0);
    atur(s.data.pH3O, 0); atur(s.data.pOH, 0);
    atur(s.data.pAir, 40);
    [s.data.pKat, s.data.pAni, s.data.pAir, s.data.pH3O, s.data.pOH]
      .forEach(function (p) { p.visible = s.get('ion'); });

    s.data.rak.visible = s.get('rak');
    s.data.sorot.visible = s.get('rak');
    s.data.lbl.userData.ganti(h.g.n + '  —  ' + h.g.kation + ' + ' + h.g.anion);
    isiRak(s);
  }
})());
