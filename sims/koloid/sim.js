/* Sistem Koloid — Fase F — adegan 3D */

Sim3D.daftar('koloid', (function () {
  'use strict';
  const T = THREE, S = S3;

  /* ukuran partikel dalam nanometer (perkiraan) */
  const SISTEM = [
    { id: 'larutan', n: 'Larutan', uk: 0.6, nP: 160, r: 0.03, tyndall: 0,
      brown: 0, saring: 'lolos kertas saring dan membran', stabil: 'satu fase, jernih',
      contoh: 'gula dalam air, garam dalam air', warna: 0xdfe8ee, keruh: 0.02 },
    { id: 'koloid', n: 'Koloid', uk: 60, nP: 70, r: 0.1, tyndall: 1,
      brown: 1, saring: 'lolos kertas saring, tertahan membran',
      stabil: 'dua fase, tampak keruh tetapi tidak mengendap',
      contoh: 'susu, santan, cat, asap, agar-agar', warna: 0xf0f2f4, keruh: 0.42 },
    { id: 'suspensi', n: 'Suspensi', uk: 1500, nP: 26, r: 0.22, tyndall: 0.5,
      brown: 0.15, saring: 'tertahan kertas saring',
      stabil: 'dua fase, mengendap bila didiamkan',
      contoh: 'air keruh berlumpur, campuran kapur dan air', warna: 0xd8cfc0, keruh: 0.75 }
  ];

  const JENIS = [
    { n: 'Aerosol cair — kabut, hairspray', fase: 'cair dalam gas', warna: 0xdfeef6 },
    { n: 'Aerosol padat — asap, debu', fase: 'padat dalam gas', warna: 0x8d97a1 },
    { n: 'Sol — cat, tinta, sol emas', fase: 'padat dalam cair', warna: 0xc85a3a },
    { n: 'Emulsi — susu, santan, mayones', fase: 'cair dalam cair', warna: 0xf4f2ec },
    { n: 'Gel — agar-agar, lem, jeli', fase: 'cair dalam padat', warna: 0xa8d8b0 },
    { n: 'Buih — buih sabun, krim kocok', fase: 'gas dalam cair', warna: 0xeef4f8 },
    { n: 'Buih padat — batu apung, styrofoam', fase: 'gas dalam padat', warna: 0xd8d4c8 },
    { n: 'Sol padat — kaca berwarna, paduan logam', fase: 'padat dalam padat', warna: 0x4a6fd0 }
  ];

  function sistem(s) {
    const id = s.get('sis');
    for (let i = 0; i < SISTEM.length; i++) if (SISTEM[i].id === id) return SISTEM[i];
    return SISTEM[1];
  }
  function jenis(s) { return JENIS[parseInt(s.get('jenis'), 10) || 0]; }

  return {
    latar: 0x05090e,
    kamera: { jarak: 11, phi: 1.04, theta: 0.6, targetY: 1.4, lajuPutar: 0.1 },

    kendali: [
      { judul: 'Sistem yang diuji', isi: [
        { type: 'segment', id: 'sis', value: 'koloid', label: 'Campuran',
          options: SISTEM.map(function (x) { return { value: x.id, label: x.n }; }) },
        { type: 'select', id: 'jenis', value: 3, label: 'Jenis koloid yang ditiru',
          options: JENIS.map(function (j, i) { return { value: i, label: j.n }; }) }
      ]},
      { judul: 'Uji Tyndall', isi: [
        { type: 'toggle', id: 'laser', value: true, label: 'Nyalakan berkas cahaya' },
        { type: 'slider', id: 'kuat', value: 1, min: 0.2, max: 2, step: 0.1,
          label: 'Kekuatan cahaya', unit: '×', dec: 1 },
        { type: 'toggle', id: 'gelap', value: true, label: 'Ruang digelapkan' }
      ]},
      { judul: 'Uji lain', isi: [
        { type: 'toggle', id: 'brown', value: true, label: 'Tampilkan gerak Brown' },
        { type: 'buttons', label: '', items: [
          { label: '▶ Koagulasikan', utama: true, klik: function (s) { s.data.koag = 1; } },
          { label: '⏳ Diamkan (mengendap)', klik: function (s) { s.data.endap = 1; } },
          { label: '↺ Kocok kembali', klik: function (s) {
            s.data.koag = 0; s.data.endap = 0; s.data.tKoag = 0; s.data.tEndap = 0; sebar(s);
          }}
        ]},
        { type: 'toggle', id: 'saring', value: false, label: 'Pasang kertas saring' }
      ]}
    ],

    baca: [
      { id: 'jenisS', label: 'Golongan campuran', tone: 'aksen' },
      { id: 'ukuran', label: 'Ukuran partikel' },
      { id: 'tyndall', label: 'Efek Tyndall' },
      { id: 'brown', label: 'Gerak Brown' },
      { id: 'saring', label: 'Penyaringan' },
      { id: 'contoh', label: 'Contoh sehari-hari' }
    ],

    bangun: function (s) {
      s.tambah(S.lantai({ r: 9, warna: 0x080d12 }));

      /* ---------- bejana kaca persegi (kuvet besar) ---------- */
      const kaca = new T.Mesh(new T.BoxGeometry(3.0, 2.4, 1.8),
        new T.MeshPhysicalMaterial({ color: 0xcfe6f2, roughness: 0.04, transparent: true,
          opacity: 0.13, side: T.DoubleSide, depthWrite: false, clearcoat: 1 }));
      kaca.position.y = 1.3;
      s.data.kaca = kaca;
      s.tambah(kaca);

      // cairan di dalam
      const cair = new T.Mesh(new T.BoxGeometry(2.92, 1.9, 1.72),
        new T.MeshPhysicalMaterial({ color: 0xf0f2f4, roughness: 0.1, transparent: true,
          opacity: 0.2, transmission: 0.55, thickness: 0.6, depthWrite: false }));
      cair.position.y = 1.1;
      s.data.cair = cair;
      s.tambah(cair);

      const dasar = new T.Mesh(new T.BoxGeometry(3.3, 0.16, 2.1),
        new T.MeshStandardMaterial({ color: 0x242e37, roughness: 0.6, metalness: 0.3 }));
      dasar.position.y = 0.08;
      dasar.receiveShadow = true;
      s.tambah(dasar);

      /* ---------- partikel terdispersi ---------- */
      const part = S.partikel(170, { r: 0.1, warna: 0xf4f2ec,
        kotak: { x: 1.3, y: 0.85, z: 0.75 } });
      part.position.y = 1.1;
      part.material.transparent = true;
      part.material.opacity = 0.95;
      s.data.part = part;
      s.tambah(part);

      /* ---------- sumber & berkas cahaya ---------- */
      const kotakLaser = new T.Mesh(new T.BoxGeometry(0.7, 0.4, 0.4),
        new T.MeshStandardMaterial({ color: 0x2a3138, roughness: 0.5, metalness: 0.4 }));
      kotakLaser.position.set(-3.1, 1.1, 0);
      s.tambah(kotakLaser);
      const lensa = new T.Mesh(new T.CylinderGeometry(0.1, 0.1, 0.1, 20),
        new T.MeshStandardMaterial({ color: 0xff4a4a, emissive: 0xff4a4a, emissiveIntensity: 1.4 }));
      lensa.rotation.z = Math.PI / 2;
      lensa.position.set(-2.72, 1.1, 0);
      s.data.lensa = lensa;
      s.tambah(lensa);

      // berkas sebelum masuk bejana (selalu terlihat tipis)
      const berkasLuar = new T.Mesh(new T.CylinderGeometry(0.03, 0.03, 1.2, 12),
        new T.MeshBasicMaterial({ color: 0xff5a4a, transparent: true, opacity: 0.5 }));
      berkasLuar.rotation.z = Math.PI / 2;
      berkasLuar.position.set(-2.1, 1.1, 0);
      s.data.berkasLuar = berkasLuar;
      s.tambah(berkasLuar);

      // berkas di dalam bejana — inilah efek Tyndall
      const berkasDalam = new T.Mesh(new T.CylinderGeometry(0.075, 0.075, 3.0, 16),
        new T.MeshBasicMaterial({ color: 0xff7a5a, transparent: true, opacity: 0,
          depthWrite: false }));
      berkasDalam.rotation.z = Math.PI / 2;
      berkasDalam.position.set(0, 1.1, 0);
      s.data.berkasDalam = berkasDalam;
      s.tambah(berkasDalam);

      // berkas keluar di seberang
      const berkasKeluar = new T.Mesh(new T.CylinderGeometry(0.03, 0.03, 1.4, 12),
        new T.MeshBasicMaterial({ color: 0xff5a4a, transparent: true, opacity: 0.4 }));
      berkasKeluar.rotation.z = Math.PI / 2;
      berkasKeluar.position.set(2.2, 1.1, 0);
      s.data.berkasKeluar = berkasKeluar;
      s.tambah(berkasKeluar);

      // layar penerima
      const layar = new T.Mesh(new T.BoxGeometry(0.08, 1.4, 1.4),
        new T.MeshStandardMaterial({ color: 0xe8ebee, roughness: 0.9 }));
      layar.position.set(3.0, 1.2, 0);
      s.tambah(layar);
      const titikLayar = new T.Mesh(S.geoBola(16),
        new T.MeshBasicMaterial({ color: 0xff6a4a, transparent: true, opacity: 0.9 }));
      titikLayar.scale.setScalar(0.1);
      titikLayar.position.set(2.96, 1.1, 0);
      s.data.titikLayar = titikLayar;
      s.tambah(titikLayar);

      /* ---------- kertas saring ---------- */
      const saring = new T.Group();
      const kerucut = new T.Mesh(new T.ConeGeometry(0.55, 0.85, 24, 1, true),
        new T.MeshStandardMaterial({ color: 0xf0ece0, roughness: 0.95, side: T.DoubleSide }));
      kerucut.rotation.x = Math.PI;
      kerucut.position.y = 3.6;
      saring.add(kerucut);
      const corong = new T.Mesh(new T.ConeGeometry(0.62, 0.95, 24, 1, true),
        new T.MeshPhysicalMaterial({ color: 0xcfe6f2, roughness: 0.06, transparent: true,
          opacity: 0.22, side: T.DoubleSide, depthWrite: false }));
      corong.rotation.x = Math.PI;
      corong.position.y = 3.58;
      saring.add(corong);
      const leher = new T.Mesh(new T.CylinderGeometry(0.07, 0.07, 0.6, 16),
        new T.MeshPhysicalMaterial({ color: 0xcfe6f2, roughness: 0.06, transparent: true,
          opacity: 0.22, side: T.DoubleSide, depthWrite: false }));
      leher.position.y = 2.85;
      saring.add(leher);
      saring.position.set(0, 0, 0);
      saring.visible = false;
      s.data.saring = saring;
      s.tambah(saring);

      // residu di atas kertas saring
      const residu = new T.Mesh(S.geoBola(20),
        new T.MeshStandardMaterial({ color: 0xd8cfc0, roughness: 0.8 }));
      residu.scale.set(0.4, 0.14, 0.4);
      residu.position.set(0, 3.42, 0);
      residu.visible = false;
      s.data.residu = residu;
      s.tambah(residu);

      // tetesan filtrat
      const filtrat = [];
      for (let i = 0; i < 5; i++) {
        const m = new T.Mesh(S.geoBola(10),
          new T.MeshPhysicalMaterial({ color: 0xdfe8ee, roughness: 0.06, transmission: 0.8,
            transparent: true, opacity: 0.8, thickness: 0.1 }));
        m.scale.setScalar(0.06);
        m.visible = false;
        s.tambah(m);
        filtrat.push({ m: m, y: 9 });
      }
      s.data.filtrat = filtrat;

      /* ---------- endapan di dasar bejana ---------- */
      const endapan = new T.Group();
      s.data.butirEndap = [];
      for (let i = 0; i < 40; i++) {
        const m = new T.Mesh(S.geoBola(10),
          new T.MeshStandardMaterial({ color: 0xd8cfc0, roughness: 0.75 }));
        const sk = S.acak(0.07, 0.14);
        m.scale.setScalar(sk);
        m.position.set(S.acak(-1.3, 1.3), 0.2 + Math.random() * 0.12, S.acak(-0.75, 0.75));
        m.visible = false;
        endapan.add(m);
        s.data.butirEndap.push(m);
      }
      s.tambah(endapan);

      /* ---------- elektrode koagulasi ---------- */
      const lblJ = S.teks('', { skala: 0.28, lebar: 28, warna: '#aebbc6' });
      lblJ.position.set(0, 0.0, 1.5);
      s.data.lblJ = lblJ;
      s.tambah(lblJ);

      const lbl = S.teks('', { skala: 0.4, lebar: 30, warna: '#d8e4ec' });
      lbl.position.set(0, 3.0, 0);
      s.data.lbl = lbl;
      s.tambah(lbl);

      s.data.koag = 0; s.data.tKoag = 0;
      s.data.endap = 0; s.data.tEndap = 0;
      sebar(s);
      pasang(s);
    },

    ubah: function (s, id) {
      if (id === 'sis' || id === 'jenis') {
        s.data.koag = 0; s.data.tKoag = 0;
        s.data.endap = 0; s.data.tEndap = 0;
        sebar(s);
        pasang(s);
      }
      if (id === 'saring') {
        s.data.saring.visible = s.get('saring');
        s.data.residu.visible = s.get('saring') && sistem(s).id === 'suspensi';
      }
      if (id === 'gelap') {
        const g = s.get('gelap');
        s.scene.environment = g ? null : S.lingkungan(s.renderer);
      }
      if (id === 'laser' || id === 'kuat') pasang(s);
    },

    langkah: function (s, dt) {
      const z = sistem(s);

      if (s.data.koag) s.data.tKoag = Math.min(1, s.data.tKoag + dt * 0.4);
      if (s.data.endap) s.data.tEndap = Math.min(1, s.data.tEndap + dt * 0.3);

      /* gerak Brown: makin kecil partikel makin cepat zig-zag */
      const d = s.data.part.userData.p;
      const kuatBrown = s.get('brown') ? (z.id === 'larutan' ? 1.6 : z.brown * 1.0) : 0;
      const k = s.data.part.userData.kotak;
      for (let i = 0; i < d.length; i++) {
        const q = d[i];
        if (!q.aktif) continue;
        // hentakan acak khas gerak Brown
        if (kuatBrown > 0 && Math.random() < dt * 8) {
          q.vel.set(S.acak(-1, 1), S.acak(-1, 1), S.acak(-1, 1))
            .normalize().multiplyScalar(S.acak(0.3, 1.1) * kuatBrown);
        }
        q.pos.addScaledVector(q.vel, dt * 0.9);

        // mengendap bila didiamkan (suspensi jatuh cepat, koloid hampir tidak)
        const jatuh = (z.id === 'suspensi' ? 0.55 : z.id === 'koloid' ? 0.03 : 0)
          * s.data.tEndap;
        q.pos.y -= jatuh * dt;

        // koagulasi: partikel tertarik ke beberapa pusat gumpalan
        if (s.data.tKoag > 0.01 && z.id !== 'larutan') {
          const pusat = q.pusat || (q.pusat = Math.floor(Math.random() * 5));
          const px = (pusat - 2) * 0.5;
          q.pos.x = S.lerp(q.pos.x, px, dt * s.data.tKoag * 1.8);
          q.pos.z = S.lerp(q.pos.z, 0, dt * s.data.tKoag * 1.2);
          q.pos.y = S.lerp(q.pos.y, -k.y + 0.1, dt * s.data.tKoag * 1.4);
          q.r = z.r * (1 + s.data.tKoag * 1.5);
        }

        ['x', 'y', 'z'].forEach(function (ax) {
          const b = k[ax] - q.r;
          if (q.pos[ax] > b) { q.pos[ax] = b; q.vel[ax] *= -1; }
          if (q.pos[ax] < -b) { q.pos[ax] = -b; q.vel[ax] *= -1; }
        });
      }
      s.data.part.userData.tulis();

      /* efek Tyndall: berkas di dalam terlihat sebanding hamburan */
      const on = s.get('laser');
      const hambur = z.tyndall * s.get('kuat') * (s.get('gelap') ? 1 : 0.55);
      s.data.berkasDalam.material.opacity = on ? S.clamp(hambur * 0.3, 0, 0.55) : 0;
      s.data.berkasDalam.material.color.setHex(0xff7a5a);
      s.data.berkasDalam.scale.set(1 + hambur * 0.7, 1, 1 + hambur * 0.7);
      s.data.berkasLuar.visible = on;
      s.data.berkasKeluar.visible = on;
      s.data.lensa.material.emissiveIntensity = on ? 1.4 : 0.08;
      // cahaya diteruskan: makin keruh makin lemah di layar
      const teruskan = on ? S.clamp(1 - z.keruh * 1.1, 0.02, 1) : 0;
      s.data.berkasKeluar.material.opacity = teruskan * 0.45;
      s.data.titikLayar.material.opacity = teruskan * 0.95;
      s.data.titikLayar.scale.setScalar(0.06 + teruskan * 0.07);

      // kilau partikel yang terkena berkas (hanya pada koloid)
      if (on && z.tyndall > 0.2) {
        s.data.part.material.emissiveIntensity = 0.1
          + 0.3 * hambur * (0.6 + 0.4 * Math.sin(s.waktu * 5));
      } else {
        s.data.part.material.emissiveIntensity = 0.08;
      }

      /* endapan di dasar */
      const nEndap = Math.round((z.id === 'suspensi' ? s.data.tEndap : s.data.tKoag * 0.5)
        * s.data.butirEndap.length);
      s.data.butirEndap.forEach(function (m, i) {
        m.visible = i < nEndap;
        m.material.color.setHex(jenis(s).warna);
      });

      /* penyaringan: tetesan filtrat jatuh */
      if (s.get('saring')) {
        s.data.filtrat.forEach(function (t) {
          if (t.y > 8 && Math.random() < dt * 2.5) t.y = 2.8;
          if (t.y < 8) {
            t.y -= dt * 3.2;
            t.m.visible = true;
            t.m.position.set(0, t.y, 0);
            if (t.y < 2.1) { t.y = 9; t.m.visible = false; }
          } else t.m.visible = false;
        });
      } else {
        s.data.filtrat.forEach(function (t) { t.m.visible = false; t.y = 9; });
      }
    },

    bacaUbah: function (s) {
      const z = sistem(s);
      const j = jenis(s);
      s.baca('jenisS', z.n + '  —  ' + z.stabil,
        z.id === 'koloid' ? 'aksen' : z.id === 'larutan' ? 'biru' : 'warn');
      s.baca('ukuran', z.uk < 1 ? '< 1 nm' : z.uk < 100 ? '1 – 100 nm' : '> 100 nm'
        + '', z.id === 'koloid' ? 'aksen' : undefined);
      s.baca('tyndall', z.tyndall > 0.8 ? 'Kuat — berkas cahaya terlihat jelas'
        : z.tyndall > 0.2 ? 'Terlihat, tetapi cahaya banyak terhalang'
          : 'Tidak terjadi — cahaya lewat tanpa dihamburkan',
        z.tyndall > 0.8 ? 'aksen' : z.tyndall > 0.2 ? 'warn' : 'danger');
      s.baca('brown', z.id === 'koloid' ? 'Jelas — partikel bergerak zig-zag terus-menerus'
        : z.id === 'larutan' ? 'Partikel terlalu kecil untuk diamati sebagai gerak Brown'
          : 'Hampir tidak ada — partikel terlalu berat dan segera mengendap');
      s.baca('saring', z.saring);
      s.baca('contoh', z.id === 'koloid' ? j.n + '  (' + j.fase + ')' : z.contoh);
    }
  };

  function sebar(s) {
    const z = sistem(s);
    const d = s.data.part.userData.p;
    const k = s.data.part.userData.kotak;
    for (let i = 0; i < d.length; i++) {
      d[i].aktif = i < z.nP;
      d[i].r = z.r;
      d[i].pusat = null;
      d[i].pos.set(S.acak(-k.x + 0.1, k.x - 0.1), S.acak(-k.y + 0.1, k.y - 0.1),
        S.acak(-k.z + 0.1, k.z - 0.1));
      d[i].vel.set(S.acak(-1, 1), S.acak(-1, 1), S.acak(-1, 1))
        .normalize().multiplyScalar(S.acak(0.3, 0.9));
    }
    s.data.part.userData.tulis();
  }

  function pasang(s) {
    const z = sistem(s);
    const j = jenis(s);
    const warna = z.id === 'koloid' ? j.warna : z.warna;
    s.data.part.material.color.setHex(warna);
    s.data.part.material.emissive.setHex(warna);
    s.data.cair.material.color.setHex(z.id === 'larutan' ? 0xdfe8ee : 0xeef2f4);
    s.data.cair.material.opacity = 0.1 + z.keruh * 0.45;
    s.data.cair.material.transmission = S.clamp(0.8 - z.keruh * 0.7, 0.05, 0.9);

    s.data.saring.visible = s.get('saring');
    s.data.residu.visible = s.get('saring') && z.id === 'suspensi';
    s.data.residu.material.color.setHex(warna);
    s.data.lblJ.userData.ganti(z.id === 'koloid' ? j.n : z.contoh);
    s.data.lbl.userData.ganti(z.n + (z.id === 'koloid' ? '  —  ' + j.fase : ''));
    s.scene.environment = s.get('gelap') ? null : S.lingkungan(s.renderer);
  }
})());
