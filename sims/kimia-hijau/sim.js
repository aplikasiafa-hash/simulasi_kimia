/* Kimia Hijau dan Proses Produksi — Fase E — adegan 3D */

Sim3D.daftar('kimia-hijau', (function () {
  'use strict';
  const T = THREE, S = S3;

  /* ekonomiKlasik/ekonomiHijau = ekonomi atom (%), langkah = jumlah tahap */
  const PROSES = [
    { n: 'Sintesis ibuprofen', eK: 40, eH: 77, lK: 6, lH: 3, produk: 0xe8eef2 },
    { n: 'Asam adipat (nilon)', eK: 48, eH: 86, lK: 4, lH: 2, produk: 0xf0e07a },
    { n: 'Biodiesel dari minyak jelantah', eK: 62, eH: 93, lK: 3, lH: 2, produk: 0xd8b84a },
    { n: 'Plastik PLA dari jagung', eK: 55, eH: 90, lK: 5, lH: 3, produk: 0xdfe8ee },
    { n: 'Indigo pewarna jins', eK: 36, eH: 72, lK: 5, lH: 3, produk: 0x4a6fd0 }
  ];

  const PELARUT = [
    { n: 'Benzena', bahaya: 1.0, warna: 0xd04a3a },
    { n: 'Toluena', bahaya: 0.78, warna: 0xd07a3a },
    { n: 'Diklorometana', bahaya: 0.9, warna: 0xc85a8a },
    { n: 'Etanol', bahaya: 0.3, warna: 0x8ad0a0 },
    { n: 'Air', bahaya: 0.06, warna: 0x4a9fd8 },
    { n: 'Tanpa pelarut (bebas pelarut)', bahaya: 0.0, warna: 0x9fe8ad }
  ];

  const ENERGI = [
    { n: 'Batu bara', f: 1.0, warna: 0x5a4a40 },
    { n: 'Gas alam', f: 0.55, warna: 0x6f9ab6 },
    { n: 'Listrik PLN campuran', f: 0.72, warna: 0x8a94a0 },
    { n: 'Surya + angin', f: 0.06, warna: 0x9fe8ad }
  ];

  function proses(s) { return PROSES[parseInt(s.get('p'), 10) || 0]; }
  function pelarut(s) { return PELARUT[parseInt(s.get('pel'), 10) || 0]; }
  function energi(s) { return ENERGI[parseInt(s.get('en'), 10) || 0]; }

  function hitung(s) {
    const p = proses(s);
    const hijau = s.get('rute') === 'hijau';
    const kat = s.get('katalis');
    const suhu = s.get('suhu');
    const daur = s.get('daur') / 100;
    const pel = pelarut(s);
    const en = energi(s);

    // ekonomi atom: rute + bantuan katalis
    const ekonomi = S.clamp((hijau ? p.eH : p.eK) + kat * 9, 5, 99.5);
    const langkah = hijau ? p.lH : p.lK;

    // massa limbah per 1 kg produk (faktor E)
    const limbahDasar = (100 - ekonomi) / ekonomi * langkah * 0.55;
    const eFaktor = Math.max(0.02, limbahDasar * (1 - daur * 0.8) * (0.55 + pel.bahaya * 0.9));

    // energi: makin panas & makin banyak tahap, makin besar; katalis menurunkan
    const tenaga = (0.5 + (suhu - 25) / 220) * langkah * (1 - kat * 0.42);

    // emisi karbon kg CO2 per kg produk
    const emisi = tenaga * en.f * 2.6 * (1 - daur * 0.35);

    // skor hijau gabungan
    const skor = S.clamp(
      ekonomi * 0.34
      + (1 - S.clamp(eFaktor / 14, 0, 1)) * 100 * 0.24
      + (1 - S.clamp(emisi / 10, 0, 1)) * 100 * 0.24
      + (1 - pel.bahaya) * 100 * 0.12
      + daur * 100 * 0.06, 0, 100);

    return { ekonomi: ekonomi, langkah: langkah, eFaktor: eFaktor,
      tenaga: tenaga, emisi: emisi, skor: skor, pel: pel, en: en, hijau: hijau };
  }

  return {
    latar: 0x070d12,
    kamera: { jarak: 13.5, phi: 1.04, theta: 0.62, targetY: 1.2, lajuPutar: 0.1 },

    kendali: [
      { judul: 'Proses', isi: [
        { type: 'select', id: 'p', value: 0, label: 'Produk yang dibuat',
          options: PROSES.map(function (p, i) { return { value: i, label: p.n }; }) },
        { type: 'segment', id: 'rute', value: 'klasik', label: 'Rute sintesis', options: [
          { value: 'klasik', label: 'Rute lama' },
          { value: 'hijau', label: 'Rute hijau' }
        ]}
      ]},
      { judul: 'Rancangan', isi: [
        { type: 'slider', id: 'katalis', value: 0, min: 0, max: 1, step: 0.05,
          label: 'Pemakaian katalis', unit: '', dec: 2 },
        { type: 'slider', id: 'suhu', value: 160, min: 25, max: 300, step: 5,
          label: 'Suhu reaktor', unit: ' °C', dec: 0 },
        { type: 'select', id: 'pel', value: 0, label: 'Pelarut',
          options: PELARUT.map(function (p, i) { return { value: i, label: p.n }; }) },
        { type: 'slider', id: 'daur', value: 0, min: 0, max: 95, step: 5,
          label: 'Daur ulang bahan', unit: ' %', dec: 0 },
        { type: 'select', id: 'en', value: 0, label: 'Sumber energi',
          options: ENERGI.map(function (e, i) { return { value: i, label: e.n }; }) }
      ]},
      { judul: 'Tampilan', isi: [
        { type: 'buttons', label: '', items: [
          { label: '♻ Jadikan sehijau mungkin', utama: true, klik: function (s) {
            s.set('rute', 'hijau');
            s.set('katalis', 1);
            s.set('suhu', 40);
            s.set('pel', 5);
            s.set('daur', 95);
            s.set('en', 3);
          }},
          { label: '↺ Kembali ke rute lama', klik: function (s) {
            s.set('rute', 'klasik');
            s.set('katalis', 0);
            s.set('suhu', 160);
            s.set('pel', 0);
            s.set('daur', 0);
            s.set('en', 0);
          }}
        ]},
        { type: 'toggle', id: 'grafik', value: true, label: 'Tampilkan panel grafik' },
        { type: 'toggle', id: 'asap', value: true, label: 'Tampilkan asap & limbah' }
      ]}
    ],

    baca: [
      { id: 'skor', label: 'Skor hijau', tone: 'aksen' },
      { id: 'ekonomi', label: 'Ekonomi atom' },
      { id: 'limbah', label: 'Faktor E (limbah/produk)' },
      { id: 'energi', label: 'Kebutuhan energi' },
      { id: 'emisi', label: 'Emisi karbon' },
      { id: 'pelarut', label: 'Pelarut' }
    ],

    bangun: function (s) {
      s.tambah(S.lantai({ r: 10, warna: 0x0c1218 }));

      // lantai pabrik
      const lantai = new T.Mesh(new T.BoxGeometry(11, 0.22, 7),
        new T.MeshStandardMaterial({ color: 0x1b242c, roughness: 0.8 }));
      lantai.position.y = 0.11;
      lantai.receiveShadow = true;
      s.tambah(lantai);

      /* ---------- silo bahan baku ---------- */
      function silo(x, warna) {
        const g = new T.Group();
        const b = new T.Mesh(new T.CylinderGeometry(0.52, 0.52, 1.5, 28),
          S.matLogam(0x8d99a4, { roughness: 0.45 }));
        b.position.y = 1.0;
        b.castShadow = true;
        g.add(b);
        const kerucut = new T.Mesh(new T.ConeGeometry(0.52, 0.5, 28), S.matLogam(0x75818c));
        kerucut.position.y = 0.0;
        kerucut.rotation.x = Math.PI;
        g.add(kerucut);
        const isi = new T.Mesh(new T.CylinderGeometry(0.46, 0.46, 1.1, 24),
          S.matCairan(warna, { opacity: 0.95 }));
        isi.position.y = 0.95;
        g.add(isi);
        g.position.set(x, 0.3, -1.9);
        return g;
      }
      s.tambah(silo(-3.9, 0xc8a070));
      s.tambah(silo(-2.7, 0x8aa0c8));

      /* ---------- reaktor ---------- */
      const reaktor = new T.Group();
      const badan = new T.Mesh(new T.CylinderGeometry(1.05, 1.05, 2.1, 40),
        new T.MeshPhysicalMaterial({ color: 0xaab6c2, roughness: 0.28, metalness: 0.75,
          clearcoat: 0.6 }));
      badan.position.y = 1.4;
      badan.castShadow = true;
      reaktor.add(badan);
      const atas = new T.Mesh(new T.SphereGeometry(1.05, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
        S.matLogam(0x98a4b0, { roughness: 0.32 }));
      atas.position.y = 2.45;
      reaktor.add(atas);

      // jendela pengamat
      const jendela = new T.Mesh(new T.CylinderGeometry(1.06, 1.06, 0.9, 40, 1, true),
        new T.MeshPhysicalMaterial({ color: 0xcfe6f2, roughness: 0.05, transparent: true,
          opacity: 0.3, side: T.DoubleSide, depthWrite: false }));
      jendela.position.y = 1.5;
      reaktor.add(jendela);

      // isi reaktor (warna mengikuti pelarut)
      const isiR = new T.Mesh(new T.CylinderGeometry(0.98, 0.98, 1.3, 36),
        S.matCairan(0xd04a3a, { opacity: 0.85 }));
      isiR.position.y = 1.0;
      s.data.isiR = isiR;
      reaktor.add(isiR);

      // pengaduk
      const batang = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, 2.4, 14), S.matLogam(0xc4ccd4));
      batang.position.y = 1.9;
      reaktor.add(batang);
      const bilah = new T.Group();
      for (let i = 0; i < 3; i++) {
        const b = new T.Mesh(new T.BoxGeometry(0.72, 0.06, 0.2), S.matLogam(0xc4ccd4));
        b.rotation.y = i * Math.PI * 2 / 3;
        b.position.set(Math.cos(i * 2.094) * 0.3, 0, Math.sin(i * 2.094) * 0.3);
        bilah.add(b);
      }
      bilah.position.y = 0.72;
      s.data.bilah = bilah;
      reaktor.add(bilah);

      // gelembung di dalam reaktor
      const gel = S.gelembung({ n: 30, sebar: 0.6, tinggi: 1.2, warna: 0xeaf4fa });
      gel.position.y = 0.4;
      s.data.gel = gel;
      reaktor.add(gel);

      reaktor.position.set(-0.6, 0.22, 0);
      s.data.reaktor = reaktor;
      s.tambah(reaktor);

      // cincin suhu di sekeliling reaktor
      const cincin = new T.Mesh(new T.TorusGeometry(1.2, 0.05, 10, 56),
        new T.MeshStandardMaterial({ color: 0xef6a52, emissive: 0xef6a52, emissiveIntensity: 0.9 }));
      cincin.rotation.x = Math.PI / 2;
      cincin.position.set(-0.6, 0.6, 0);
      s.data.cincin = cincin;
      s.tambah(cincin);

      /* ---------- tangki produk ---------- */
      const tp = new T.Group();
      const tpB = new T.Mesh(new T.CylinderGeometry(0.78, 0.78, 1.7, 32),
        new T.MeshPhysicalMaterial({ color: 0xcfe6f2, roughness: 0.08, transparent: true,
          opacity: 0.24, side: T.DoubleSide, depthWrite: false }));
      tpB.position.y = 0.95;
      tp.add(tpB);
      const tpI = new T.Mesh(new T.CylinderGeometry(0.72, 0.72, 1, 32), S.matCairan(0xe8eef2));
      tp.add(tpI);
      s.data.tpI = tpI;
      const tpD = new T.Mesh(new T.CylinderGeometry(0.86, 0.9, 0.2, 32), S.matLogam(0x6b7784));
      tpD.position.y = 0.1;
      tp.add(tpD);
      tp.position.set(2.4, 0.22, -1.1);
      s.tambah(tp);
      const lblP = S.teks('produk', { skala: 0.26, lebar: 12, warna: '#9fe8ad' });
      lblP.position.set(2.4, 2.4, -1.1);
      s.tambah(lblP);

      /* ---------- drum limbah ---------- */
      const drumG = new T.Group();
      s.data.drum = [];
      for (let i = 0; i < 8; i++) {
        const d = new T.Mesh(new T.CylinderGeometry(0.3, 0.3, 0.72, 22),
          new T.MeshStandardMaterial({ color: 0x6a5a2a, roughness: 0.6, metalness: 0.3 }));
        const kol = i % 4, bar = Math.floor(i / 4);
        d.position.set(3.1 + kol * 0.66, 0.58 + bar * 0.74, 1.7);
        d.castShadow = true;
        d.visible = false;
        drumG.add(d);
        s.data.drum.push(d);
      }
      s.tambah(drumG);
      const lblL = S.teks('limbah', { skala: 0.26, lebar: 12, warna: '#f0a94a' });
      lblL.position.set(4.0, 2.4, 1.7);
      s.tambah(lblL);

      /* ---------- cerobong + asap ---------- */
      const cer = new T.Mesh(new T.CylinderGeometry(0.34, 0.42, 3.4, 26),
        new T.MeshStandardMaterial({ color: 0x4a5058, roughness: 0.75 }));
      cer.position.set(-3.4, 1.9, 1.6);
      cer.castShadow = true;
      s.tambah(cer);
      const asap = S.partikel(80, { r: 0.22, warna: 0x8d97a1, kotak: { x: 1.4, y: 2.6, z: 1.4 } });
      asap.material.transparent = true;
      asap.material.opacity = 0.3;
      asap.position.set(-3.4, 5.4, 1.6);
      s.data.asap = asap;
      s.tambah(asap);

      /* ---------- sumber energi ---------- */
      const panel = new T.Group();
      for (let i = 0; i < 4; i++) {
        const p = new T.Mesh(new T.BoxGeometry(1.0, 0.05, 0.66),
          new T.MeshPhysicalMaterial({ color: 0x1b2d4a, roughness: 0.12, metalness: 0.5,
            clearcoat: 1 }));
        p.position.set(-4.4 + (i % 2) * 1.1, 0.5, 2.2 + Math.floor(i / 2) * 0.76);
        p.rotation.x = -0.4;
        panel.add(p);
      }
      s.data.panel = panel;
      s.tambah(panel);

      const tungku = new T.Group();
      const kotak = new T.Mesh(new T.BoxGeometry(1.7, 1.0, 1.2),
        new T.MeshStandardMaterial({ color: 0x322a24, roughness: 0.85 }));
      kotak.position.set(-4.0, 0.72, 2.5);
      tungku.add(kotak);
      const ny = S.nyala({ r: 0.3, h: 0.6 });
      ny.position.set(-4.0, 1.2, 2.5);
      s.data.ny = ny;
      tungku.add(ny);
      s.data.tungku = tungku;
      s.tambah(tungku);

      /* ---------- panel grafik ---------- */
      const g1 = S.panelGrafik({ w: 4.2, px: 640, py: 400 });
      g1.position.set(0.2, 4.6, -2.6);
      s.data.g1 = g1;
      s.tambah(g1);

      // meteran skor hijau
      const busur = new T.Mesh(new T.TorusGeometry(0.9, 0.09, 12, 64, Math.PI * 1.4),
        new T.MeshStandardMaterial({ color: 0x9fe8ad, emissive: 0x9fe8ad, emissiveIntensity: 0.8 }));
      busur.position.set(4.6, 3.6, -1.0);
      busur.rotation.z = Math.PI * 0.8;
      s.data.busur = busur;
      s.tambah(busur);
      const lblS = S.teks('', { skala: 0.4, lebar: 10, warna: '#9fe8ad' });
      lblS.position.set(4.6, 3.6, -1.0);
      s.data.lblS = lblS;
      s.tambah(lblS);

      const lbl = S.teks('', { skala: 0.4, lebar: 40, warna: '#d8e4ec' });
      lbl.position.set(0, 6.4, 0);
      s.data.lbl = lbl;
      s.tambah(lbl);

      pasang(s);
    },

    ubah: function (s, id) {
      pasang(s);
      if (id === 'grafik') s.data.g1.visible = s.get('grafik');
      if (id === 'asap') {
        s.data.asap.visible = s.get('asap');
        s.data.drum.forEach(function (d, i) {
          d.visible = s.get('asap') && i < (s.data.nDrum || 0);
        });
      }
    },

    langkah: function (s, dt) {
      const h = hitung(s);
      s.data.bilah.rotation.y += dt * (1.5 + h.tenaga * 1.2);
      s.data.gel.userData.perbarui(dt, S.clamp((s.get('suhu') - 25) / 200, 0.1, 1.4));

      // cincin suhu
      const panas = S.clamp((s.get('suhu') - 25) / 275, 0, 1);
      s.data.cincin.material.color.setRGB(0.25 + panas * 0.68, 0.72 - panas * 0.5, 0.78 - panas * 0.6);
      s.data.cincin.material.emissive.copy(s.data.cincin.material.color);
      s.data.cincin.material.emissiveIntensity = 0.5 + panas * 0.9;

      // asap naik; kerapatan mengikuti emisi
      if (s.data.asap.visible) {
        const d = s.data.asap.userData.p;
        const n = Math.round(S.clamp(h.emisi / 9, 0, 1) * d.length);
        for (let i = 0; i < d.length; i++) {
          d[i].aktif = i < n;
          if (!d[i].aktif) continue;
          d[i].pos.y += dt * 0.7;
          d[i].pos.x += Math.sin(s.waktu * 0.8 + i) * dt * 0.35;
          d[i].r = 0.16 + d[i].pos.y * 0.07;
          if (d[i].pos.y > 2.6) d[i].pos.set(S.acak(-0.25, 0.25), -2.5, S.acak(-0.25, 0.25));
        }
        s.data.asap.userData.tulis();
        s.data.asap.material.opacity = 0.1 + S.clamp(h.emisi / 10, 0, 1) * 0.35;
        s.data.asap.material.color.setHex(h.en.warna);
      }

      // nyala tungku bila bukan energi terbarukan
      const fosil = parseInt(s.get('en'), 10) !== 3;
      s.data.tungku.visible = fosil;
      s.data.panel.visible = !fosil;
      if (fosil) s.data.ny.userData.perbarui(s.waktu, 0.4 + h.en.f * 0.6);

      // isi tangki produk naik-turun pelan
      const isiTinggi = S.clamp(h.ekonomi / 100, 0.08, 1);
      s.data.tpI.scale.y = isiTinggi * 1.55;
      s.data.tpI.position.y = isiTinggi * 1.55 / 2 + 0.12;
      s.data.tpI.material.color.setHex(proses(s).produk);

      // meteran skor
      s.data.busur.scale.set(1, 1, 1);
      const c = new T.Color().setHSL(S.lerp(0.02, 0.33, h.skor / 100), 0.65, 0.58);
      s.data.busur.material.color.copy(c);
      s.data.busur.material.emissive.copy(c);
      s.data.busur.material.emissiveIntensity = 0.5 + h.skor / 180;
      s.data.lblS.userData.ganti(Math.round(h.skor) + '', '#' + c.getHexString());

      s.data.h = h;
    },

    bacaUbah: function (s) {
      const h = hitung(s);
      s.baca('skor', Math.round(h.skor) + ' / 100',
        h.skor > 70 ? 'aksen' : h.skor > 45 ? 'warn' : 'danger');
      s.baca('ekonomi', S.fmt(h.ekonomi, 1) + ' %  (' + h.langkah + ' tahap)',
        h.ekonomi > 75 ? 'aksen' : h.ekonomi > 50 ? 'warn' : 'danger');
      s.baca('limbah', S.fmt(h.eFaktor, 2) + ' kg limbah per kg produk',
        h.eFaktor < 1 ? 'aksen' : h.eFaktor < 5 ? 'warn' : 'danger');
      s.baca('energi', S.fmt(h.tenaga, 2) + ' satuan relatif');
      s.baca('emisi', S.fmt(h.emisi, 2) + ' kg CO₂ per kg produk',
        h.emisi < 1.5 ? 'aksen' : h.emisi < 5 ? 'warn' : 'danger');
      s.baca('pelarut', h.pel.n, h.pel.bahaya < 0.1 ? 'aksen'
        : h.pel.bahaya < 0.5 ? 'warn' : 'danger');
      gambar(s, h);
    }
  };

  function gambar(s, h) {
    S.gambarBatang(s.data.g1, {
      judul: 'Rapor proses (makin tinggi batang hijau, makin baik)',
      maks: 100,
      bar: [
        { nama: 'Ekonomi atom', v: Math.round(h.ekonomi),
          warna: h.ekonomi > 75 ? 'rgba(159,232,173,.9)' : 'rgba(240,169,74,.9)' },
        { nama: 'Limbah rendah', v: Math.round((1 - S.clamp(h.eFaktor / 14, 0, 1)) * 100),
          warna: h.eFaktor < 2 ? 'rgba(159,232,173,.9)' : 'rgba(239,106,82,.9)' },
        { nama: 'Emisi rendah', v: Math.round((1 - S.clamp(h.emisi / 10, 0, 1)) * 100),
          warna: h.emisi < 2 ? 'rgba(159,232,173,.9)' : 'rgba(239,106,82,.9)' },
        { nama: 'Pelarut aman', v: Math.round((1 - h.pel.bahaya) * 100),
          warna: h.pel.bahaya < 0.2 ? 'rgba(159,232,173,.9)' : 'rgba(240,169,74,.9)' },
        { nama: 'Daur ulang', v: Math.round(s.get('daur')), warna: 'rgba(111,182,255,.9)' },
        { nama: 'Skor hijau', v: Math.round(h.skor), warna: 'rgba(79,209,192,.95)' }
      ]
    });
  }

  function pasang(s) {
    const h = hitung(s);
    const p = proses(s);
    s.data.isiR.material.color.setHex(h.pel.warna);
    s.data.isiR.material.opacity = 0.7 + h.pel.bahaya * 0.2;

    // jumlah drum limbah terlihat
    const n = Math.round(S.clamp(h.eFaktor / 14, 0, 1) * 8);
    s.data.nDrum = n;
    s.data.drum.forEach(function (d, i) {
      d.visible = s.get('asap') && i < n;
      d.material.color.setHex(h.pel.bahaya > 0.5 ? 0x7a4a2a : 0x6a6a3a);
    });

    s.data.g1.visible = s.get('grafik');
    s.data.asap.visible = s.get('asap');
    s.data.lbl.userData.ganti(p.n + '  —  ' + (h.hijau ? 'rute hijau' : 'rute lama'),
      h.hijau ? '#9fe8ad' : '#f0a94a');
    gambar(s, h);
  }
})());
