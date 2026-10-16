/* Teknik Pemisahan Campuran — Fase D — adegan 3D */

Sim3D.daftar('pemisahan-lanjut', (function () {
  'use strict';
  const T = THREE, S = S3;

  const TEKNIK = [
    { id: 'distilasi', n: 'Distilasi', dasar: 'Perbedaan titik didih',
      contoh: 'Memisahkan alkohol dari air, memurnikan air laut' },
    { id: 'kromatografi', n: 'Kromatografi', dasar: 'Perbedaan daya serap pada kertas',
      contoh: 'Memisahkan zat warna tinta atau pewarna makanan' },
    { id: 'sentrifugasi', n: 'Sentrifugasi', dasar: 'Perbedaan massa jenis saat diputar cepat',
      contoh: 'Memisahkan sel darah dari plasma' },
    { id: 'sublimasi', n: 'Sublimasi', dasar: 'Zat menyublim langsung dari padat ke gas',
      contoh: 'Memurnikan kapur barus dan iodin' },
    { id: 'kristalisasi', n: 'Kristalisasi', dasar: 'Zat terlarut mengkristal saat pelarut menguap',
      contoh: 'Membuat garam dari air laut, memurnikan gula' }
  ];

  function tek(s) {
    const id = s.get('tek');
    for (let i = 0; i < TEKNIK.length; i++) if (TEKNIK[i].id === id) return TEKNIK[i];
    return TEKNIK[0];
  }

  return {
    latar: 0x090f15,
    kamera: { jarak: 11, phi: 1.08, theta: 0.6, targetY: 1.6, lajuPutar: 0.1 },

    kendali: [
      { judul: 'Teknik', isi: [
        { type: 'select', id: 'tek', value: 'distilasi', label: 'Cara pemisahan',
          options: TEKNIK.map(function (t) { return { value: t.id, label: t.n }; }) },
        { type: 'buttons', label: '', items: [
          { label: '▶ Jalankan', utama: true, klik: function (s) { s.data.jalan = true; } },
          { label: '↺ Ulangi', klik: function (s) { s.data.t = 0; s.data.jalan = false; } }
        ]},
        { type: 'slider', id: 'laju', value: 1, min: 0.2, max: 3, step: 0.1,
          label: 'Kecepatan proses', unit: '×', dec: 1 }
      ]},
      { judul: 'Pengaturan alat', isi: [
        { type: 'slider', id: 'suhu', value: 85, min: 40, max: 140, step: 1,
          label: 'Suhu pemanas (distilasi)', unit: ' °C', dec: 0 },
        { type: 'slider', id: 'putar', value: 1, min: 0.2, max: 3, step: 0.1,
          label: 'Kecepatan putar (sentrifus)', unit: '×', dec: 1 },
        { type: 'toggle', id: 'potong', value: false, label: 'Tampilkan potongan alat' }
      ]}
    ],

    baca: [
      { id: 'teknik', label: 'Teknik', tone: 'aksen' },
      { id: 'dasar', label: 'Dasar pemisahan' },
      { id: 'maju', label: 'Kemajuan' },
      { id: 'contoh', label: 'Contoh pemakaian' }
    ],

    bangun: function (s) {
      s.tambah(S.lantai({ r: 9, warna: 0x0e151d }));
      s.data.set = {};
      ['distilasi', 'kromatografi', 'sentrifugasi', 'sublimasi', 'kristalisasi'].forEach(function (id) {
        const g = new T.Group();
        g.visible = false;
        s.data.set[id] = g;
        s.tambah(g);
      });
      bangunDistilasi(s, s.data.set.distilasi);
      bangunKromatografi(s, s.data.set.kromatografi);
      bangunSentrifugasi(s, s.data.set.sentrifugasi);
      bangunSublimasi(s, s.data.set.sublimasi);
      bangunKristalisasi(s, s.data.set.kristalisasi);

      const lbl = S.teks('', { skala: 0.44, lebar: 16, warna: '#d8e4ec' });
      lbl.position.set(0, 5.6, 0);
      s.data.lbl = lbl;
      s.tambah(lbl);

      s.data.t = 0;
      pasang(s);
    },

    ubah: function (s, id) { if (id === 'tek') pasang(s); },

    langkah: function (s, dt) {
      const t0 = tek(s);
      if (s.data.jalan) s.data.t = Math.min(1, s.data.t + dt * s.get('laju') * 0.22);
      const t = s.data.t;
      const o = s.data.o;

      if (t0.id === 'distilasi') {
        const panas = S.clamp((s.get('suhu') - 60) / 40, 0, 1);
        o.api.userData.perbarui(s.waktu, s.data.jalan ? panas : 0);
        o.labu.userData.setLevel(0.62 * (1 - t * 0.75));
        o.terima.userData.setLevel(0.72 * t);
        o.uap.visible = s.data.jalan && t < 0.99 && panas > 0.1;
        if (o.uap.visible) {
          const d = o.uap.userData.p;
          for (let i = 0; i < d.length; i++) {
            const f = (d[i].f = ((d[i].f || Math.random()) + dt * 0.3 * s.get('laju')) % 1);
            d[i].pos.copy(jalurUap(f));
            d[i].r = 0.07 * (1 - f * 0.4);
          }
          o.uap.userData.tulis();
        }
        o.tetes.visible = o.uap.visible && t > 0.1;
        if (o.tetes.visible) {
          const d = o.tetes.userData.p;
          for (let i = 0; i < d.length; i++) {
            d[i].pos.y -= dt * 2.4 * s.get('laju');
            if (d[i].pos.y < 1.1) d[i].pos.set(3.5 + S.acak(-0.04, 0.04), 2.1, S.acak(-0.04, 0.04));
          }
          o.tetes.userData.tulis();
        }
        // air pendingin mengalir
        o.pendingin.material.opacity = 0.2 + 0.08 * Math.sin(s.waktu * 3);
      } else if (t0.id === 'kromatografi') {
        o.pelarut.scale.y = Math.max(0.02, 0.2 + t * 2.6);
        o.pelarut.position.y = 0.32 + o.pelarut.scale.y / 2;
        o.noda.forEach(function (n, i) {
          const naik = S.clamp((t - 0.08) * n.userData.rf * 2.4, 0, n.userData.rf * 2.4);
          n.position.y = 0.72 + naik;
          n.material.opacity = t > 0.05 ? 0.95 : 0.5;
          n.scale.setScalar(1 + naik * 0.25);
        });
      } else if (t0.id === 'sentrifugasi') {
        const w = s.data.jalan ? s.get('putar') * 14 : 0;
        o.rotor.rotation.y += dt * w;
        o.tabung.forEach(function (tb, i) {
          tb.rotation.z = S.lerp(tb.rotation.z, s.data.jalan ? 0.5 : 0.18, dt * 3);
        });
        const d = o.sel.userData.p;
        for (let i = 0; i < d.length; i++) {
          const q = d[i];
          const tujuan = q.berat ? -0.52 : 0.16;
          q.pos.y = S.lerp(q.pos.y, q.asal.y + (tujuan - q.asal.y) * t, dt * 4);
          q.pos.x = q.asal.x * (1 - t * 0.5);
          q.pos.z = q.asal.z * (1 - t * 0.5);
        }
        o.sel.userData.tulis();
      } else if (t0.id === 'sublimasi') {
        o.api.userData.perbarui(s.waktu, s.data.jalan ? 0.8 : 0);
        const d = o.butir.userData.p;
        for (let i = 0; i < d.length; i++) {
          const q = d[i];
          if (q.menyublim) {
            q.pos.y = S.lerp(q.asal.y, 2.5 + (i % 7) * 0.05, S.clamp(t * 1.4, 0, 1));
            const r = Math.hypot(q.asal.x, q.asal.z) * (1 - t * 0.35);
            const a = Math.atan2(q.asal.z, q.asal.x);
            q.pos.x = Math.cos(a) * r; q.pos.z = Math.sin(a) * r;
            q.r = 0.05 * (1 - t * 0.35);
          } else {
            q.pos.copy(q.asal);
          }
        }
        o.butir.userData.tulis();
        o.kristal.visible = t > 0.4;
        o.kristal.children.forEach(function (c, i) {
          c.scale.setScalar(S.clamp((t - 0.4) * 1.9, 0.01, 1) * (0.7 + (i % 4) * 0.12));
        });
      } else {
        o.api.userData.perbarui(s.waktu, s.data.jalan ? 0.85 : 0);
        o.cawan.userData && o.cawan.userData.setLevel && o.cawan.userData.setLevel(0.6 * (1 - t));
        o.airC.scale.y = Math.max(0.01, 1 - t);
        o.airC.position.y = 1.72 + (1 - t) * 0.1;
        o.uapK.visible = s.data.jalan && t < 0.95;
        if (o.uapK.visible) {
          const d = o.uapK.userData.p;
          for (let i = 0; i < d.length; i++) {
            d[i].pos.y += dt * 0.9 * s.get('laju');
            if (d[i].pos.y > 1.4) d[i].pos.set(S.acak(-0.5, 0.5), -0.6, S.acak(-0.5, 0.5));
          }
          o.uapK.userData.tulis();
        }
        o.kristalK.visible = t > 0.35;
        o.kristalK.children.forEach(function (c, i) {
          const f = S.clamp((t - 0.35) * 1.7, 0, 1);
          c.scale.setScalar(f * (0.6 + (i % 5) * 0.14));
          c.rotation.y += dt * 0.4;
        });
      }
    },

    bacaUbah: function (s) {
      const t0 = tek(s);
      s.baca('teknik', t0.n);
      s.baca('dasar', t0.dasar);
      s.baca('maju', Math.round(s.data.t * 100) + '%',
        s.data.t > 0.95 ? 'aksen' : null);
      s.baca('contoh', t0.contoh);
    }
  };

  function jalurUap(f) {
    // dari labu → naik → melalui kondensor miring → ke penampung
    if (f < 0.35) {
      const t = f / 0.35;
      return new T.Vector3(S.acak(-0.12, 0.12), 2.1 + t * 1.3, S.acak(-0.12, 0.12));
    }
    const t = (f - 0.35) / 0.65;
    return new T.Vector3(t * 3.5, 3.4 - t * 1.2, S.acak(-0.07, 0.07));
  }

  /* ---------------------------------------------------------- perakitan */

  function bangunDistilasi(s, g) {
    const o = s.data.oDist = {};
    const labu = S.labu({ r: 1.0, h: 1.9, level: 0.62, warna: 0x5aa0d8 });
    labu.position.y = 1.5;
    g.add(labu); o.labu = labu;

    const api = S.nyala(); api.position.y = 0.55;
    g.add(api); o.api = api;
    for (let i = 0; i < 3; i++) {
      const a = i / 3 * Math.PI * 2;
      const b = new T.Mesh(new T.CylinderGeometry(0.04, 0.04, 1.45, 10), S.matLogam(0x6b747c));
      b.position.set(Math.cos(a) * 0.8, 0.72, Math.sin(a) * 0.8);
      g.add(b);
    }
    const cincin = new T.Mesh(new T.TorusGeometry(0.82, 0.04, 10, 36), S.matLogam(0x6b747c));
    cincin.rotation.x = Math.PI / 2; cincin.position.y = 1.45;
    g.add(cincin);

    // pipa naik
    const naik = new T.Mesh(new T.CylinderGeometry(0.13, 0.13, 1.1, 20), S.matKaca({ opacity: 0.2 }));
    naik.position.y = 3.0;
    g.add(naik);

    // kondensor miring berpendingin
    const pjg = 3.7;
    const dalam = new T.Mesh(new T.CylinderGeometry(0.11, 0.11, pjg, 20), S.matKaca({ opacity: 0.22 }));
    const luar = new T.Mesh(new T.CylinderGeometry(0.27, 0.27, pjg * 0.88, 24),
      new T.MeshPhysicalMaterial({ color: 0x4a9fd8, roughness: 0.15, transmission: 0.5,
        thickness: 0.4, transparent: true, opacity: 0.22, side: T.DoubleSide, depthWrite: false }));
    const kon = new T.Group();
    kon.add(dalam, luar);
    kon.position.set(1.75, 2.95, 0);
    kon.rotation.z = -Math.PI / 2 + 0.3;
    g.add(kon);
    o.pendingin = luar;

    // penampung
    const terima = S.gelas({ r: 0.8, h: 1.4, level: 0, warna: 0xbfe0f0 });
    terima.position.set(3.5, 0.6, 0);
    g.add(terima); o.terima = terima;
    const meja = new T.Mesh(new T.BoxGeometry(1.6, 0.6, 1.6),
      new T.MeshStandardMaterial({ color: 0x1d2730, roughness: 0.8 }));
    meja.position.set(3.5, 0.3, 0);
    g.add(meja);

    // termometer
    const term = new T.Mesh(new T.CylinderGeometry(0.055, 0.055, 1.4, 14), S.matKaca({ opacity: 0.35 }));
    term.position.set(-0.28, 3.5, 0);
    g.add(term);

    const uap = S.partikel(44, { r: 0.07, warna: 0xd8eef8, kotak: { x: 4, y: 4, z: 4 } });
    uap.material.transparent = true; uap.material.opacity = 0.5;
    uap.visible = false;
    g.add(uap); o.uap = uap;

    const tetes = S.partikel(16, { r: 0.05, warna: 0xbfe0f0, kotak: { x: 1, y: 2, z: 1 } });
    tetes.visible = false;
    tetes.userData.p.forEach(function (q) { q.pos.set(3.5, 1.1 + Math.random(), 0); });
    g.add(tetes); o.tetes = tetes;
  }

  function bangunKromatografi(s, g) {
    const o = s.data.oKrom = {};
    const gelas = S.gelas({ r: 1.1, h: 2.6, level: 0.12, warna: 0x6fc0e0 });
    g.add(gelas);
    // kertas
    const kertas = new T.Mesh(new T.BoxGeometry(1.1, 3.0, 0.02),
      new T.MeshStandardMaterial({ color: 0xf4f2e8, roughness: 0.95, side: T.DoubleSide }));
    kertas.position.y = 1.8;
    g.add(kertas);
    // pelarut naik
    const pel = new T.Mesh(new T.BoxGeometry(1.08, 1, 0.025),
      new T.MeshStandardMaterial({ color: 0xcfe6f2, roughness: 0.9, transparent: true,
        opacity: 0.75, side: T.DoubleSide }));
    pel.scale.y = 0.2; pel.position.y = 0.42;
    g.add(pel); o.pelarut = pel;

    const warna = [0xef4e4e, 0x4fd1c0, 0xf0c04a, 0x5b9bf5];
    const rf = [0.9, 0.62, 0.42, 0.22];
    o.noda = warna.map(function (w, i) {
      const n = new T.Mesh(new T.SphereGeometry(0.1, 20, 14),
        new T.MeshStandardMaterial({ color: w, emissive: w, emissiveIntensity: 0.4,
          transparent: true, opacity: 0.5 }));
      n.scale.set(1.6, 0.8, 0.3);
      n.position.set((i - 1.5) * 0.24, 0.72, 0.03);
      n.userData.rf = rf[i];
      g.add(n);
      return n;
    });
    const batang = new T.Mesh(new T.CylinderGeometry(0.035, 0.035, 1.6, 12), S.matLogam(0x9aa4ae));
    batang.rotation.z = Math.PI / 2; batang.position.y = 3.3;
    g.add(batang);
  }

  function bangunSentrifugasi(s, g) {
    const o = s.data.oSen = {};
    const badan = new T.Mesh(new T.CylinderGeometry(2.0, 2.2, 1.5, 48),
      new T.MeshStandardMaterial({ color: 0x242e37, roughness: 0.6, metalness: 0.3 }));
    badan.position.y = 0.75;
    g.add(badan);
    const tutup = new T.Mesh(new T.CylinderGeometry(2.05, 2.05, 0.1, 48), S.matKaca({ opacity: 0.16 }));
    tutup.position.y = 2.3; tutup.renderOrder = 3;
    g.add(tutup);

    const rotor = new T.Group();
    rotor.position.y = 1.6;
    const poros = new T.Mesh(new T.CylinderGeometry(0.22, 0.22, 0.5, 24), S.matLogam(0xc8ced4));
    rotor.add(poros);
    o.tabung = [];
    const sel = S.partikel(90, { r: 0.05, warna: 0xd04050, kotak: { x: 1, y: 1, z: 1 } });
    for (let i = 0; i < 4; i++) {
      const a = i / 4 * Math.PI * 2;
      const tb = new T.Group();
      const kaca = S.tabung({ r: 0.26, h: 1.2, level: 0.72, warna: 0xe0b0b8 });
      kaca.position.y = -0.6;
      tb.add(kaca);
      tb.position.set(Math.cos(a) * 1.1, 0.15, Math.sin(a) * 1.1);
      tb.rotation.y = -a;
      tb.rotation.z = 0.18;
      rotor.add(tb);
      o.tabung.push(tb);
    }
    rotor.add(sel);
    sel.userData.p.forEach(function (q, i) {
      const a = Math.floor(i / 23) / 4 * Math.PI * 2;
      q.asal = new T.Vector3(Math.cos(a) * 1.1 + S.acak(-0.14, 0.14), S.acak(-0.9, -0.1),
        Math.sin(a) * 1.1 + S.acak(-0.14, 0.14));
      q.pos.copy(q.asal);
      q.berat = i % 2 === 0;
      q.r = 0.05;
    });
    sel.userData.tulis();
    o.sel = sel;
    g.add(rotor);
    o.rotor = rotor;
  }

  function bangunSublimasi(s, g) {
    const o = s.data.oSub = {};
    const gelas = S.gelas({ r: 1.1, h: 2.6, level: 0 });
    gelas.userData.setLevel(0);
    g.add(gelas);
    // cawan berisi es di atas
    const cawan = new T.Mesh(new T.SphereGeometry(1.0, 36, 18, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2.6),
      new T.MeshStandardMaterial({ color: 0xdedacf, roughness: 0.6, side: T.DoubleSide }));
    cawan.position.y = 3.0;
    g.add(cawan);
    const esC = new T.Mesh(new T.CylinderGeometry(0.7, 0.7, 0.35, 32),
      new T.MeshPhysicalMaterial({ color: 0xaee0f0, roughness: 0.14, transmission: 0.6,
        thickness: 0.4, transparent: true, opacity: 0.85, clearcoat: 1 }));
    esC.position.y = 3.1;
    g.add(esC);

    const butir = S.partikel(90, { r: 0.05, warna: 0x9a50c0, kotak: { x: 1, y: 1, z: 1 } });
    butir.userData.p.forEach(function (q, i) {
      const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 0.82;
      q.asal = new T.Vector3(Math.cos(a) * r, 0.12 + Math.random() * 0.18, Math.sin(a) * r);
      q.pos.copy(q.asal);
      q.menyublim = i % 2 === 0;
      q.r = 0.05;
    });
    butir.userData.tulis();
    g.add(butir); o.butir = butir;

    const kristal = new T.Group();
    for (let i = 0; i < 14; i++) {
      const m = new T.Mesh(new T.OctahedronGeometry(0.1),
        new T.MeshPhysicalMaterial({ color: 0x8a40b8, roughness: 0.2, clearcoat: 1,
          emissive: 0x6a2098, emissiveIntensity: 0.2 }));
      const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 0.7;
      m.position.set(Math.cos(a) * r, 2.76, Math.sin(a) * r);
      m.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      kristal.add(m);
    }
    kristal.visible = false;
    g.add(kristal); o.kristal = kristal;

    const api = S.nyala(); api.position.y = -0.95;
    g.add(api); o.api = api;
    const cincin = new T.Mesh(new T.TorusGeometry(0.9, 0.04, 10, 36), S.matLogam(0x6b747c));
    cincin.rotation.x = Math.PI / 2; cincin.position.y = -0.06;
    g.add(cincin);
  }

  function bangunKristalisasi(s, g) {
    const o = s.data.oKris = {};
    const cawan = new T.Mesh(
      new T.SphereGeometry(1.4, 44, 22, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2.8),
      new T.MeshStandardMaterial({ color: 0xe4e0d6, roughness: 0.5, side: T.DoubleSide }));
    cawan.position.y = 1.7;
    g.add(cawan); o.cawan = cawan;

    const air = new T.Mesh(new T.CylinderGeometry(1.2, 0.95, 0.42, 44),
      S.matCairan(0x5aa0d8, { opacity: 0.82 }));
    air.position.y = 1.72;
    g.add(air); o.airC = air;

    const kristal = new T.Group();
    for (let i = 0; i < 26; i++) {
      const m = new T.Mesh(new T.BoxGeometry(0.13, 0.13, 0.13),
        new T.MeshPhysicalMaterial({ color: 0xf4f8fb, roughness: 0.12, clearcoat: 1,
          transmission: 0.3, thickness: 0.2, transparent: true, opacity: 0.95 }));
      const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 1.05;
      m.position.set(Math.cos(a) * r, 1.6, Math.sin(a) * r);
      m.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      kristal.add(m);
    }
    kristal.visible = false;
    g.add(kristal); o.kristalK = kristal;

    const uap = S.partikel(44, { r: 0.07, warna: 0xd8eef8, kotak: { x: 1, y: 1.5, z: 1 } });
    uap.material.transparent = true; uap.material.opacity = 0.42;
    uap.position.y = 2.8;
    uap.visible = false;
    g.add(uap); o.uapK = uap;

    const api = S.nyala(); api.position.y = 0.45;
    g.add(api); o.api = api;
    for (let i = 0; i < 3; i++) {
      const a = i / 3 * Math.PI * 2;
      const b = new T.Mesh(new T.CylinderGeometry(0.04, 0.04, 1.6, 10), S.matLogam(0x6b747c));
      b.position.set(Math.cos(a) * 0.9, 0.8, Math.sin(a) * 0.9);
      g.add(b);
    }
    const cincin = new T.Mesh(new T.TorusGeometry(0.92, 0.04, 10, 36), S.matLogam(0x6b747c));
    cincin.rotation.x = Math.PI / 2; cincin.position.y = 1.6;
    g.add(cincin);
  }

  function pasang(s) {
    const t0 = tek(s);
    s.data.t = 0;
    s.data.jalan = false;
    for (const k in s.data.set) s.data.set[k].visible = (k === t0.id);
    s.data.o = t0.id === 'distilasi' ? s.data.oDist
      : t0.id === 'kromatografi' ? s.data.oKrom
      : t0.id === 'sentrifugasi' ? s.data.oSen
      : t0.id === 'sublimasi' ? s.data.oSub : s.data.oKris;
    s.data.lbl.userData.ganti(t0.n);
    s.orbit.set({
      jarak: t0.id === 'distilasi' ? 13 : t0.id === 'sentrifugasi' ? 9 : 10,
      target: [t0.id === 'distilasi' ? 1.6 : 0, t0.id === 'kromatografi' ? 2.0 : 1.6, 0]
    });
  }
})());
