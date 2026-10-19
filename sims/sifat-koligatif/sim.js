/* Sifat Koligatif Larutan — Fase F — adegan 3D */

Sim3D.daftar('sifat-koligatif', (function () {
  'use strict';
  const T = THREE, S = S3;

  /* i = faktor van't Hoff ideal (jumlah partikel per rumus) */
  const ZAT = [
    { n: 'Glukosa C₆H₁₂O₆ (nonelektrolit)', i: 1, mr: 180.16, warna: 0xf0e8d4, el: false },
    { n: 'Urea CO(NH₂)₂ (nonelektrolit)', i: 1, mr: 60.06, warna: 0xf2f2ee, el: false },
    { n: 'Sukrosa C₁₂H₂₂O₁₁ (nonelektrolit)', i: 1, mr: 342.3, warna: 0xf0ecd8, el: false },
    { n: 'NaCl (elektrolit, 2 ion)', i: 2, mr: 58.44, warna: 0xdfe8ee, el: true },
    { n: 'KNO₃ (elektrolit, 2 ion)', i: 2, mr: 101.1, warna: 0xe8eef2, el: true },
    { n: 'CaCl₂ (elektrolit, 3 ion)', i: 3, mr: 110.98, warna: 0xeaf0f4, el: true },
    { n: 'MgSO₄ (elektrolit, 2 ion)', i: 2, mr: 120.37, warna: 0xe6eef2, el: true },
    { n: 'Al₂(SO₄)₃ (elektrolit, 5 ion)', i: 5, mr: 342.15, warna: 0xf0f0ea, el: true },
    { n: 'Na₃PO₄ (elektrolit, 4 ion)', i: 4, mr: 163.94, warna: 0xe4eef0, el: true }
  ];

  const PELARUT = [
    { n: 'Air', kf: 1.86, kb: 0.52, tf: 0, tb: 100, mr: 18.02, rho: 1.0, warna: 0x4a9fd8 },
    { n: 'Benzena', kf: 5.12, kb: 2.53, tf: 5.5, tb: 80.1, mr: 78.11, rho: 0.877, warna: 0xd0b070 },
    { n: 'Etanol', kf: 1.99, kb: 1.22, tf: -114.6, tb: 78.4, mr: 46.07, rho: 0.789, warna: 0xa8d8c0 },
    { n: 'Asam asetat', kf: 3.90, kb: 3.07, tf: 16.6, tb: 118.1, mr: 60.05, rho: 1.049, warna: 0xe0d8a0 }
  ];

  function zat(s) { return ZAT[parseInt(s.get('z'), 10) || 0]; }
  function pelarut(s) { return PELARUT[parseInt(s.get('pel'), 10) || 0]; }

  function hitung(s) {
    const z = zat(s), p = pelarut(s);
    const gram = s.get('gram');
    const mPel = s.get('pelarutG');      // gram pelarut
    const alfa = z.el ? s.get('alfa') : 0;
    const i = z.el ? 1 + (z.i - 1) * alfa : 1;

    const mol = gram / z.mr;
    const molal = mol / (mPel / 1000);                 // mol/kg
    const dTf = p.kf * molal * i;
    const dTb = p.kb * molal * i;
    const tf = p.tf - dTf;
    const tb = p.tb + dTb;

    // fraksi mol & tekanan uap (hukum Raoult)
    const molPel = mPel / p.mr;
    const xPel = molPel / (molPel + mol * i);
    const p0 = 100;                                     // tekanan uap relatif pelarut murni
    const pLar = xPel * p0;

    // tekanan osmotik pada 27 °C, anggap molaritas ≈ molalitas
    const M = mol / ((mPel / p.rho) / 1000);
    const osm = M * 0.0821 * 300.15 * i;

    return { z: z, p: p, mol: mol, molal: molal, i: i, alfa: alfa,
      dTf: dTf, dTb: dTb, tf: tf, tb: tb, xPel: xPel, pLar: pLar,
      dP: p0 - pLar, M: M, osm: osm };
  }

  return {
    latar: 0x070c12,
    kamera: { jarak: 18.72, phi: 1.04, theta: 0.62, targetY: 3, lajuPutar: 0.1 },

    legenda: [
      { warna: '#f0a94a', label: 'larutan' },
      { warna: '#6fb6ff', label: 'pelarut murni (pembanding)' },
      { warna: '#dff0ff', label: 'kristal es yang terbentuk' }
    ],

    kendali: [
      { judul: 'Larutan', isi: [
        { type: 'select', id: 'z', value: 0, label: 'Zat terlarut',
          options: ZAT.map(function (z, i) { return { value: i, label: z.n }; }) },
        { type: 'slider', id: 'gram', value: 18, min: 0.5, max: 100, step: 0.5,
          label: 'Massa zat terlarut', unit: ' g', dec: 1 },
        { type: 'select', id: 'pel', value: 0, label: 'Pelarut',
          options: PELARUT.map(function (p, i) { return { value: i, label: p.n }; }) },
        { type: 'slider', id: 'pelarutG', value: 500, min: 50, max: 1000, step: 10,
          label: 'Massa pelarut', unit: ' g', dec: 0 },
        { type: 'slider', id: 'alfa', value: 1, min: 0, max: 1, step: 0.05,
          label: 'Derajat ionisasi α (elektrolit)', unit: '', dec: 2 }
      ]},
      { judul: 'Yang diamati', isi: [
        { type: 'segment', id: 'sifat', value: 'beku', label: 'Sifat koligatif', options: [
          { value: 'beku', label: 'Titik beku' },
          { value: 'didih', label: 'Titik didih' },
          { value: 'uap', label: 'Tekanan uap' },
          { value: 'osmosis', label: 'Osmosis' }
        ]},
        { type: 'toggle', id: 'banding', value: true, label: 'Bandingkan dengan pelarut murni' }
      ]},
      { judul: 'Tampilan', isi: [
        { type: 'toggle', id: 'grafik', value: true, label: 'Tampilkan diagram fase' },
        { type: 'toggle', id: 'partikel', value: true, label: 'Tampilkan partikel terlarut' }
      ]}
    ],

    baca: [
      { id: 'molal', label: 'Kemolalan', tone: 'aksen' },
      { id: 'i', label: 'Faktor van’t Hoff (i)' },
      { id: 'beku', label: 'Titik beku' },
      { id: 'didih', label: 'Titik didih' },
      { id: 'uap', label: 'Tekanan uap relatif' },
      { id: 'osm', label: 'Tekanan osmotik (27 °C)' }
    ],

    bangun: function (s) {
      s.tambah(S.lantai({ r: 10, warna: 0x0b1118 }));

      /* ---------- dua gelas: larutan & pelarut murni ---------- */
      function unit(x, judul, warnaJudul) {
        const g = new T.Group();
        const gls = S.gelas({ r: 1.25, h: 2.0, level: 0.66, warna: 0x4a9fd8, opacity: 0.62 });
        g.add(gls);
        const t = S.teks(judul, { skala: 0.28, lebar: 18, warna: warnaJudul });
        t.position.set(0, -0.5, 0);
        g.add(t);
        g.position.set(x, 0.05, 0);
        g.userData.gls = gls;
        return g;
      }
      const uL = unit(-2.3, 'larutan', '#f0a94a');
      const uP = unit(2.3, 'pelarut murni', '#6fb6ff');
      s.data.uL = uL; s.data.uP = uP;
      s.tambah(uL); s.tambah(uP);

      /* partikel zat terlarut di gelas larutan */
      const pz = S.partikel(90, { r: 0.095, warna: 0xf0e8d4, kotak: { x: 1, y: 0.5, z: 1 } });
      pz.position.set(-2.3, 0.75, 0);
      pz.material.transparent = true;
      pz.material.opacity = 0.92;
      s.data.pz = pz;
      s.tambah(pz);

      /* es yang terbentuk (titik beku) */
      function esGroup(x) {
        const g = new T.Group();
        const butir = [];
        for (let i = 0; i < 26; i++) {
          const m = new T.Mesh(new T.OctahedronGeometry(1, 0),
            new T.MeshPhysicalMaterial({ color: 0xdff0ff, roughness: 0.15, clearcoat: 0.9,
              transparent: true, opacity: 0.8 }));
          const sk = S.acak(0.1, 0.2);
          m.scale.setScalar(sk);
          m.userData.sk = sk;
          const a = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random()) * 1.0;
          m.position.set(Math.cos(a) * rr, 0.3 + Math.random() * 0.9, Math.sin(a) * rr);
          m.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
          m.visible = false;
          g.add(m);
          butir.push(m);
        }
        g.position.set(x, 0.05, 0);
        g.userData.butir = butir;
        s.tambah(g);
        return g;
      }
      s.data.esL = esGroup(-2.3);
      s.data.esP = esGroup(2.3);

      /* gelembung didih */
      s.data.gelL = S.gelembung({ n: 40, sebar: 0.7, tinggi: 1.3, warna: 0xeaf4fa });
      s.data.gelL.position.set(-2.3, 0.15, 0);
      s.tambah(s.data.gelL);
      s.data.gelP = S.gelembung({ n: 40, sebar: 0.7, tinggi: 1.3, warna: 0xeaf4fa });
      s.data.gelP.position.set(2.3, 0.15, 0);
      s.tambah(s.data.gelP);

      /* uap keluar (tekanan uap) */
      function uapGroup(x) {
        const p = S.partikel(60, { r: 0.09, warna: 0xdff0ff, kotak: { x: 0.9, y: 1.1, z: 0.9 } });
        p.material.transparent = true;
        p.material.opacity = 0.35;
        p.position.set(x, 3.0, 0);
        p.visible = false;
        s.tambah(p);
        return p;
      }
      s.data.uapL = uapGroup(-2.3);
      s.data.uapP = uapGroup(2.3);

      /* ---------- tabung osmosis (tabung-U dengan membran) ---------- */
      const osm = new T.Group();
      const kiri = new T.Mesh(new T.CylinderGeometry(0.42, 0.42, 3.4, 28, 1, true),
        new T.MeshPhysicalMaterial({ color: 0xcfe6f2, roughness: 0.06, transparent: true,
          opacity: 0.17, side: T.DoubleSide, depthWrite: false }));
      kiri.position.set(-0.75, 1.7, 0);
      osm.add(kiri);
      const kanan = kiri.clone();
      kanan.position.set(0.75, 1.7, 0);
      osm.add(kanan);
      const bawah = new T.Mesh(new T.CylinderGeometry(0.42, 0.42, 1.5, 28, 1, true),
        new T.MeshPhysicalMaterial({ color: 0xcfe6f2, roughness: 0.06, transparent: true,
          opacity: 0.17, side: T.DoubleSide, depthWrite: false }));
      bawah.rotation.z = Math.PI / 2;
      bawah.position.set(0, 0.2, 0);
      osm.add(bawah);

      const cairKi = new T.Mesh(new T.CylinderGeometry(0.39, 0.39, 1, 24),
        S.matCairan(0xf0a94a, { opacity: 0.85 }));
      const cairKa = new T.Mesh(new T.CylinderGeometry(0.39, 0.39, 1, 24),
        S.matCairan(0x4a9fd8, { opacity: 0.85 }));
      osm.add(cairKi); osm.add(cairKa);
      s.data.cairKi = cairKi; s.data.cairKa = cairKa;

      const membran = new T.Mesh(new T.BoxGeometry(0.1, 0.8, 0.8),
        new T.MeshStandardMaterial({ color: 0xd0d8e0, roughness: 0.6, transparent: true,
          opacity: 0.6 }));
      membran.position.set(0, 0.2, 0);
      osm.add(membran);
      const lblMem = S.teks('membran semipermeabel', { skala: 0.2, lebar: 26, warna: '#aebbc6' });
      lblMem.position.set(0, -0.6, 0);
      osm.add(lblMem);

      // panah aliran air melewati membran
      const panahOsm = S.panah([0.45, 0.2, 0], [-0.45, 0.2, 0], { warna: 0x6fb6ff, tebal: 0.04 });
      osm.add(panahOsm);
      s.data.panahOsm = panahOsm;

      osm.position.set(0, 0, 0);
      osm.visible = false;
      s.data.osm = osm;
      s.tambah(osm);

      /* termometer di tiap gelas */
      function termo(x) {
        const g = new T.Group();
        const kaca = new T.Mesh(new T.CylinderGeometry(0.07, 0.07, 2.8, 18),
          new T.MeshPhysicalMaterial({ color: 0xcfe6f2, roughness: 0.06, transparent: true,
            opacity: 0.3, side: T.DoubleSide, depthWrite: false }));
        kaca.position.y = 1.4;
        g.add(kaca);
        const kolom = new T.Mesh(new T.CylinderGeometry(0.038, 0.038, 1, 14),
          new T.MeshStandardMaterial({ color: 0xef4a3a, emissive: 0xef4a3a, emissiveIntensity: 0.45 }));
        g.add(kolom);
        g.userData.kolom = kolom;
        const lbl = S.teks('', { skala: 0.26, lebar: 12, warna: '#ff8a6a' });
        lbl.position.set(0, 3.1, 0);
        g.add(lbl);
        g.userData.lbl = lbl;
        g.position.set(x, 0.2, 0.4);
        s.tambah(g);
        return g;
      }
      s.data.tL = termo(-1.45);
      s.data.tP = termo(3.15);

      /* panel diagram fase */
      const g1 = S.panelGrafik({ w: 5.0, px: 720, py: 450 });
      g1.position.set(0, 5.4, -1.8);
      s.data.g1 = g1;
      s.tambah(g1);

      const lbl = S.teks('', { skala: 0.36, lebar: 40, warna: '#d8e4ec' });
      lbl.position.set(0, 3.9, 0);
      s.data.lbl = lbl;
      s.tambah(lbl);

      pasang(s);
    },

    ubah: function (s, id) {
      pasang(s);
      if (id === 'grafik') s.data.g1.visible = s.get('grafik');
    },

    langkah: function (s, dt) {
      const h = hitung(s);
      const mode = s.get('sifat');
      const banding = s.get('banding');

      s.data.pz.userData.gerak(dt, 0.85);

      // ---- titik beku: es muncul lebih dulu di pelarut murni ----
      if (mode === 'beku') {
        const siklus = (s.waktu * 0.22) % 1;              // suhu menurun berulang
        const suhu = S.lerp(h.p.tf + 6, h.p.tf - Math.max(6, h.dTf + 4), siklus);
        tampilEs(s.data.esP, suhu <= h.p.tf ? S.clamp((h.p.tf - suhu) / 4, 0, 1) : 0, banding);
        tampilEs(s.data.esL, suhu <= h.tf ? S.clamp((h.tf - suhu) / 4, 0, 1) : 0, true);
        setTermo(s.data.tL, suhu, h.p);
        setTermo(s.data.tP, suhu, h.p);
        s.data.gelL.userData.perbarui(dt, 0);
        s.data.gelP.userData.perbarui(dt, 0);
        s.data.uapL.visible = false; s.data.uapP.visible = false;
      } else if (mode === 'didih') {
        const siklus = (s.waktu * 0.22) % 1;
        const suhu = S.lerp(h.p.tb - 8, h.p.tb + Math.max(8, h.dTb + 5), siklus);
        tampilEs(s.data.esL, 0, false);
        tampilEs(s.data.esP, 0, false);
        s.data.gelP.userData.perbarui(dt, suhu >= h.p.tb && banding
          ? S.clamp((suhu - h.p.tb) / 2, 0, 2) : 0);
        s.data.gelL.userData.perbarui(dt, suhu >= h.tb
          ? S.clamp((suhu - h.tb) / 2, 0, 2) : 0);
        setTermo(s.data.tL, suhu, h.p);
        setTermo(s.data.tP, suhu, h.p);
        s.data.uapL.visible = false; s.data.uapP.visible = false;
      } else if (mode === 'uap') {
        tampilEs(s.data.esL, 0, false);
        tampilEs(s.data.esP, 0, false);
        s.data.gelL.userData.perbarui(dt, 0);
        s.data.gelP.userData.perbarui(dt, 0);
        // kerapatan uap sebanding tekanan uap
        gerakUap(s, s.data.uapL, dt, h.pLar / 100, true);
        gerakUap(s, s.data.uapP, dt, 1, banding);
        setTermo(s.data.tL, 25, h.p);
        setTermo(s.data.tP, 25, h.p);
      } else {
        // osmosis: tinggi kolom larutan naik
        const naik = S.clamp(h.osm / 60, 0, 1);
        const hKi = 1.2 + naik * 1.4;
        const hKa = 1.2 - naik * 0.9;
        s.data.cairKi.scale.y = hKi;
        s.data.cairKi.position.set(-0.75, 0.2 + hKi / 2, 0);
        s.data.cairKa.scale.y = Math.max(0.2, hKa);
        s.data.cairKa.position.set(0.75, 0.2 + Math.max(0.2, hKa) / 2, 0);
        s.data.panahOsm.scale.setScalar(0.6 + naik * 0.7);
        s.data.panahOsm.children.forEach(function (m) {
          m.material.emissiveIntensity = 0.2 + 0.4 * (0.5 + 0.5 * Math.sin(s.waktu * 4));
        });
      }
    },

    bacaUbah: function (s) {
      const h = hitung(s);
      s.baca('molal', S.fmt(h.molal, 4) + ' mol/kg   (' + S.fmt(h.mol, 4) + ' mol zat)');
      s.baca('i', h.z.el
        ? S.fmt(h.i, 2) + '   (dari ' + h.z.i + ' ion, α = ' + S.fmt(h.alfa, 2) + ')'
        : '1   (nonelektrolit, tidak terionisasi)',
        h.z.el ? 'warn' : 'aksen');
      s.baca('beku', S.fmt(h.tf, 3) + ' °C   (turun ' + S.fmt(h.dTf, 3)
        + ' °C dari ' + S.fmt(h.p.tf, 1) + ' °C)', 'biru');
      s.baca('didih', S.fmt(h.tb, 3) + ' °C   (naik ' + S.fmt(h.dTb, 3)
        + ' °C dari ' + S.fmt(h.p.tb, 1) + ' °C)', 'warn');
      s.baca('uap', S.fmt(h.pLar, 2) + ' %  dari pelarut murni   (turun '
        + S.fmt(h.dP, 2) + ' %,  X pelarut = ' + S.fmt(h.xPel, 4) + ')');
      s.baca('osm', S.fmt(h.osm, 3) + ' atm   (M = ' + S.fmt(h.M, 4) + ' mol/L)');
      gambar(s);
    }
  };

  function setTermo(g, suhu, p) {
    const sk = S.clamp((suhu - (p.tf - 20)) / ((p.tb + 20) - (p.tf - 20)), 0.02, 1);
    g.userData.kolom.scale.y = sk * 2.5;
    g.userData.kolom.position.y = sk * 2.5 / 2;
    const c = suhu < p.tf ? new T.Color(0x6fb6ff)
      : suhu > p.tb ? new T.Color(0xef4a3a)
        : new T.Color(0xf0a94a);
    g.userData.kolom.material.color.copy(c);
    g.userData.kolom.material.emissive.copy(c);
    g.userData.lbl.userData.ganti(S.fmt(suhu, 1) + ' °C', '#' + c.getHexString());
  }

  function tampilEs(g, f, tampil) {
    const n = Math.round(S.clamp(f, 0, 1) * g.userData.butir.length);
    g.userData.butir.forEach(function (m, i) {
      m.visible = tampil && i < n;
      m.rotation.y += 0.004;
    });
  }

  function gerakUap(s, p, dt, rapat, tampil) {
    p.visible = tampil;
    if (!tampil) return;
    const d = p.userData.p;
    const n = Math.round(S.clamp(rapat, 0, 1) * d.length);
    for (let i = 0; i < d.length; i++) {
      d[i].aktif = i < n;
      if (!d[i].aktif) continue;
      d[i].pos.y += dt * 0.45;
      d[i].pos.x += Math.sin(s.waktu * 1.3 + i) * dt * 0.25;
      if (d[i].pos.y > 1.1) d[i].pos.set(S.acak(-0.7, 0.7), -1.0, S.acak(-0.7, 0.7));
    }
    p.userData.tulis();
  }

  function gambar(s) {
    if (!s.data.g1 || !s.data.g1.visible) return;
    const h = hitung(s);
    const p = h.p;

    // diagram fase sederhana: kurva uap (Clausius-Clapeyron pendekatan) dan garis leleh
    const uapMurni = [], uapLarutan = [];
    for (let i = 0; i <= 90; i++) {
      const Tc = p.tf - 15 + i / 90 * ((p.tb + 25) - (p.tf - 15));
      // tekanan uap naik eksponensial terhadap suhu, 1 atm pada titik didih
      const pr = Math.exp((Tc - p.tb) * 0.055);
      uapMurni.push([Tc, Math.min(2.2, pr)]);
      uapLarutan.push([Tc, Math.min(2.2, pr * h.xPel)]);
    }
    const lelehMurni = [[p.tf, 0], [p.tf - 0.4, 2.2]];
    const lelehLarutan = [[h.tf, 0], [h.tf - 0.4, 2.2]];

    S.gambarGrafik(s.data.g1, {
      judul: 'Diagram fase — larutan menggeser kedua batas',
      xMin: p.tf - 15, xMax: p.tb + 25, yMin: 0, yMax: 2.2,
      xLabel: 'suhu (°C)', yLabel: 'tekanan (atm)',
      seri: [
        { titik: uapMurni, warna: '#6fb6ff', tebal: 3, nama: 'pelarut murni' },
        { titik: uapLarutan, warna: '#f0a94a', tebal: 3, nama: 'larutan' },
        { titik: lelehMurni, warna: '#6fb6ff', tebal: 2, putus: true },
        { titik: lelehLarutan, warna: '#f0a94a', tebal: 2, putus: true }
      ],
      garisY: [{ v: 1, warna: 'rgba(214,228,240,.5)', label: '1 atm' }],
      titikTebal: [
        { x: p.tb, y: 1, warna: '#6fb6ff', r: 6 },
        { x: h.tb, y: 1, warna: '#f0a94a', r: 6 },
        { x: p.tf, y: 0.02, warna: '#6fb6ff', r: 6 },
        { x: h.tf, y: 0.02, warna: '#f0a94a', r: 6 }
      ]
    });
  }

  function pasang(s) {
    const h = hitung(s);
    const mode = s.get('sifat');
    const banding = s.get('banding');

    // warna cairan ikut pelarut
    s.data.uL.userData.gls.userData.setLevel(0.66, h.p.warna);
    s.data.uP.userData.gls.userData.setLevel(0.66, h.p.warna);
    s.data.uL.userData.gls.userData.setOpasitas(S.opasitasCair(h.p.warna, 0.72));
    s.data.uP.visible = banding && mode !== 'osmosis';

    // partikel terlarut
    const d = s.data.pz.userData.p;
    const n = Math.round(S.clamp(h.molal / 1.2, 0.12, 1) * d.length);
    for (let i = 0; i < d.length; i++) {
      if (!d[i].aktif && i < n) d[i].pos.set(S.acak(-0.9, 0.9), S.acak(-0.4, 0.4), S.acak(-0.9, 0.9));
      d[i].aktif = i < n;
    }
    s.data.pz.material.color.setHex(h.z.warna);
    s.data.pz.material.emissive.setHex(h.z.warna);
    s.data.pz.userData.tulis();
    s.data.pz.visible = s.get('partikel') && mode !== 'osmosis';

    // tampilan khusus osmosis
    const os = mode === 'osmosis';
    s.data.osm.visible = os;
    s.data.uL.visible = !os;
    s.data.tL.visible = !os && (mode === 'beku' || mode === 'didih');
    s.data.tP.visible = !os && banding && (mode === 'beku' || mode === 'didih');
    if (os) {
      s.data.cairKi.material.color.setHex(h.z.warna === 0xf0e8d4 ? 0xf0a94a : 0xf0a94a);
      s.data.cairKa.material.color.setHex(h.p.warna);
      tampilEs(s.data.esL, 0, false);
      tampilEs(s.data.esP, 0, false);
      s.data.uapL.visible = false; s.data.uapP.visible = false;
      s.data.gelL.visible = false; s.data.gelP.visible = false;
    }

    s.data.g1.visible = s.get('grafik');
    s.data.lbl.userData.ganti(h.z.n.split(' (')[0] + ' dalam ' + h.p.n
      + '   —   ' + S.fmt(h.molal, 3) + ' molal');
    gambar(s);
  }
})());
