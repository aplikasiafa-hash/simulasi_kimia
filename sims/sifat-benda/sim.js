/* Mengenal Sifat Benda — Fase A — adegan 3D */

Sim3D.daftar('sifat-benda', (function () {
  'use strict';
  const T = THREE, S = S3;

  const BAHAN = [
    { n: 'Kayu',   w: 0xa9763f, apung: true,  magnet: false, tembus: 0.0, keras: 0.45, kasar: 0.7, logam: false },
    { n: 'Besi',   w: 0x8a949e, apung: false, magnet: true,  tembus: 0.0, keras: 0.95, kasar: 0.2, logam: true },
    { n: 'Kaca',   w: 0xbfe4f0, apung: false, magnet: false, tembus: 0.92, keras: 0.8, kasar: 0.05, logam: false },
    { n: 'Karet',  w: 0x3a4149, apung: true,  magnet: false, tembus: 0.0, keras: 0.15, kasar: 0.55, logam: false },
    { n: 'Busa',   w: 0xe8c86a, apung: true,  magnet: false, tembus: 0.1, keras: 0.05, kasar: 0.85, logam: false },
    { n: 'Batu',   w: 0x76726c, apung: false, magnet: false, tembus: 0.0, keras: 0.88, kasar: 0.9, logam: false },
    { n: 'Plastik',w: 0x4aa6d8, apung: true,  magnet: false, tembus: 0.35, keras: 0.4, kasar: 0.15, logam: false },
    { n: 'Alumunium', w: 0xc8ced4, apung: false, magnet: false, tembus: 0.0, keras: 0.7, kasar: 0.1, logam: true }
  ];

  function bahan(s) { return BAHAN[parseInt(s.get('bahan'), 10) || 0]; }

  function matBahan(b) {
    if (b.tembus > 0.6) {
      return new T.MeshPhysicalMaterial({
        color: b.w, roughness: 0.05, metalness: 0, transparent: true,
        opacity: 0.3, clearcoat: 1, envMapIntensity: 0.9
      });
    }
    if (b.logam) return S.matLogam(b.w, { roughness: 0.3 });
    return new T.MeshPhysicalMaterial({
      color: b.w,
      roughness: 0.25 + b.kasar * 0.6,
      metalness: 0.03,
      clearcoat: b.kasar < 0.3 ? 0.7 : 0.1,
      transparent: b.tembus > 0.05,
      opacity: b.tembus > 0.05 ? 1 - b.tembus * 0.55 : 1,
      envMapIntensity: 0.8
    });
  }

  return {
    latar: 0x0a1016,
    kamera: { jarak: 8.6, phi: 1.1, theta: 0.5, targetY: 1.0, lajuPutar: 0.14 },

    kendali: [
      { judul: 'Benda', isi: [
        { type: 'select', id: 'bahan', value: 0, label: 'Terbuat dari',
          options: BAHAN.map(function (b, i) { return { value: i, label: b.n }; }) },
        { type: 'segment', id: 'bentuk', value: 'kubus', label: 'Bentuk', options: [
          { value: 'kubus', label: 'Kubus' }, { value: 'bola', label: 'Bola' },
          { value: 'batang', label: 'Batang' }
        ]}
      ]},
      { judul: 'Percobaan', isi: [
        { type: 'segment', id: 'uji', value: 'lihat', label: 'Yang diuji', options: [
          { value: 'lihat', label: 'Amati' }, { value: 'air', label: 'Air' },
          { value: 'magnet', label: 'Magnet' }, { value: 'cahaya', label: 'Cahaya' }
        ]},
        { type: 'toggle', id: 'jalan', value: true, label: 'Jalankan percobaan' }
      ]},
      { judul: 'Tampilan', isi: [
        { type: 'toggle', id: 'label', value: true, label: 'Tampilkan nama benda' },
        { type: 'slider', id: 'ukuran', value: 1, min: 0.5, max: 1.8, step: 0.05,
          label: 'Ukuran benda', unit: '×', dec: 2 }
      ]}
    ],

    baca: [
      { id: 'bahan', label: 'Bahan', tone: 'aksen' },
      { id: 'hasil', label: 'Hasil uji' },
      { id: 'sifat', label: 'Sifat menonjol' }
    ],

    bangun: function (s) {
      s.tambah(S.lantai({ r: 7, warna: 0x101820 }));

      // meja bundar
      const meja = new T.Mesh(new T.CylinderGeometry(2.4, 2.4, 0.16, 56),
        new T.MeshStandardMaterial({ color: 0x1e2830, roughness: 0.7, metalness: 0.1 }));
      meja.position.y = 0.08; meja.receiveShadow = true;
      s.tambah(meja);

      // benda uji
      const benda = new T.Group();
      s.data.benda = benda;
      s.tambah(benda);

      // bak air
      const bak = new T.Group();
      const dinding = new T.Mesh(new T.BoxGeometry(3.2, 1.8, 2.2), S.matKaca());
      dinding.position.y = 0.9; dinding.renderOrder = 3;
      bak.add(dinding);
      const air = new T.Mesh(new T.BoxGeometry(3.14, 1.2, 2.14), S.matCairan(0x3b8ad0, { opacity: 0.68 }));
      air.position.y = 0.6; air.renderOrder = 1;
      bak.add(air);
      bak.visible = false; bak.position.y = 0.16;
      s.data.bak = bak; s.data.air = air;
      s.tambah(bak);

      // magnet tapal kuda
      const magnet = new T.Group();
      const mMerah = S.matLogam(0xd0402a, { metalness: 0.5, roughness: 0.4 });
      const mBiru = S.matLogam(0x3a6fd0, { metalness: 0.5, roughness: 0.4 });
      const lengkung = new T.Mesh(new T.TorusGeometry(0.55, 0.17, 16, 28, Math.PI), mMerah);
      lengkung.rotation.z = Math.PI;
      magnet.add(lengkung);
      [-0.55, 0.55].forEach(function (x, i) {
        const kaki = new T.Mesh(new T.CylinderGeometry(0.17, 0.17, 0.7, 20), i ? mBiru : mMerah);
        kaki.position.set(x, 0.35, 0);
        magnet.add(kaki);
      });
      magnet.position.set(0, 2.8, 0);
      magnet.visible = false;
      s.data.magnet = magnet;
      s.tambah(magnet);

      // senter / berkas cahaya
      const cahaya = new T.Group();
      const badan = new T.Mesh(new T.CylinderGeometry(0.17, 0.22, 0.75, 24), S.matLogam(0x3a4149));
      badan.rotation.z = Math.PI / 2;
      badan.position.x = -2.5;
      cahaya.add(badan);
      const berkas = new T.Mesh(new T.CylinderGeometry(0.1, 0.42, 4.4, 28, 1, true),
        S.matNyala(0xfff0c0, 0.16));
      berkas.rotation.z = -Math.PI / 2;
      berkas.position.x = -0.1;
      cahaya.add(berkas);
      const layar = new T.Mesh(new T.PlaneGeometry(2.2, 1.8),
        new T.MeshStandardMaterial({ color: 0x20282f, roughness: 0.9 }));
      layar.position.set(2.6, 0, 0);
      layar.rotation.y = -Math.PI / 2;
      cahaya.add(layar);
      const bayang = new T.Mesh(new T.CircleGeometry(0.52, 36),
        new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.6 }));
      bayang.position.set(2.58, 0, 0);
      bayang.rotation.y = -Math.PI / 2;
      cahaya.add(bayang);
      cahaya.position.y = 1.5;
      cahaya.visible = false;
      s.data.cahaya = cahaya; s.data.berkas = berkas; s.data.bayang = bayang;
      s.tambah(cahaya);

      const lbl = S.teks('Kayu', { skala: 0.5, lebar: 11, warna: '#d8e4ec' });
      lbl.position.set(0, 3.5, 0);
      s.data.lbl = lbl;
      s.tambah(lbl);

      s.data.y = 1.4;
      s.data.vy = 0;
      pasangBenda(s);
      pasangUji(s);
    },

    ubah: function (s, id) {
      if (id === 'bahan' || id === 'bentuk' || id === 'ukuran') pasangBenda(s);
      if (id === 'uji' || id === 'jalan') pasangUji(s);
      if (id === 'label') s.data.lbl.visible = s.get('label');
    },

    langkah: function (s, dt) {
      const b = bahan(s);
      const uji = s.get('uji');
      const jalan = s.get('jalan');
      const o = s.data.benda;

      if (uji === 'air' && jalan) {
        const target = b.apung ? 1.0 : 0.42;   // tinggi akhir di dalam bak
        s.data.vy += (target - s.data.y) * dt * 9 - s.data.vy * dt * 5.5;
        s.data.y += s.data.vy * dt;
        o.position.y = s.data.y;
        o.rotation.y += dt * 0.3;
        // riak
        s.data.air.scale.y = 1 + Math.sin(s.waktu * 5) * 0.012;
      } else if (uji === 'magnet' && jalan) {
        const target = b.magnet ? 2.25 : 1.1;
        s.data.vy += (target - s.data.y) * dt * (b.magnet ? 11 : 7) - s.data.vy * dt * 6;
        s.data.y += s.data.vy * dt;
        o.position.y = s.data.y;
        s.data.magnet.position.y = 2.8 + Math.sin(s.waktu * 1.4) * 0.12;
        o.rotation.y += dt * (b.magnet ? 1.6 : 0.3);
      } else if (uji === 'cahaya' && jalan) {
        o.position.y = 1.5;
        o.rotation.y += dt * 0.5;
        const t = b.tembus;
        s.data.bayang.material.opacity = 0.72 * (1 - t);
        s.data.bayang.material.color.setHex(t > 0.3 ? 0x2a4a60 : 0x000000);
        s.data.berkas.material.opacity = 0.14 + 0.05 * Math.sin(s.waktu * 3);
      } else {
        s.data.y += (1.4 - s.data.y) * dt * 5;
        o.position.y = s.data.y + Math.sin(s.waktu * 1.3) * 0.05;
        o.rotation.y += dt * 0.55;
        o.rotation.x = Math.sin(s.waktu * 0.7) * 0.14;
      }
      s.data.lbl.position.y = 3.5;
    },

    bacaUbah: function (s) {
      const b = bahan(s);
      const uji = s.get('uji');
      s.baca('bahan', b.n);
      if (uji === 'air') {
        s.baca('hasil', b.apung ? 'Terapung' : 'Tenggelam', b.apung ? 'aksen' : 'warn');
      } else if (uji === 'magnet') {
        s.baca('hasil', b.magnet ? 'Ditarik magnet' : 'Tidak ditarik', b.magnet ? 'aksen' : 'warn');
      } else if (uji === 'cahaya') {
        s.baca('hasil', b.tembus > 0.6 ? 'Tembus cahaya'
          : b.tembus > 0.15 ? 'Tembus sebagian' : 'Tidak tembus',
          b.tembus > 0.6 ? 'aksen' : b.tembus > 0.15 ? 'warn' : 'danger');
      } else {
        s.baca('hasil', 'Amati bentuk dan warnanya');
      }
      const sifat = [];
      if (b.keras > 0.7) sifat.push('keras'); else if (b.keras < 0.25) sifat.push('lentur');
      if (b.kasar > 0.6) sifat.push('kasar'); else if (b.kasar < 0.2) sifat.push('halus');
      if (b.logam) sifat.push('mengilap');
      if (b.tembus > 0.6) sifat.push('bening');
      s.baca('sifat', sifat.join(', ') || 'biasa');
    }
  };

  function pasangBenda(s) {
    const b = bahan(s);
    const g = s.data.benda;
    while (g.children.length) { const c = g.children.pop(); S.buangObjek(c); }
    const k = s.get('ukuran');
    let geo;
    const bentuk = s.get('bentuk');
    if (bentuk === 'bola') geo = new T.SphereGeometry(0.62 * k, 40, 30);
    else if (bentuk === 'batang') geo = new T.CylinderGeometry(0.3 * k, 0.3 * k, 1.5 * k, 32);
    else geo = new T.BoxGeometry(1.05 * k, 1.05 * k, 1.05 * k);
    const m = new T.Mesh(geo, matBahan(b));
    m.castShadow = true; m.receiveShadow = true;
    g.add(m);
    s.data.lbl.userData.ganti(b.n);
    s.data.lbl.visible = s.get('label');
  }

  function pasangUji(s) {
    const uji = s.get('uji');
    s.data.bak.visible = uji === 'air';
    s.data.magnet.visible = uji === 'magnet';
    s.data.cahaya.visible = uji === 'cahaya';
    s.data.vy = 0;
    s.data.y = uji === 'air' ? 2.3 : uji === 'magnet' ? 1.1 : 1.4;
    s.data.benda.position.set(0, s.data.y, 0);
    s.orbit.set({ targetY: uji === 'magnet' ? 1.7 : 1.1 });
  }
})());
