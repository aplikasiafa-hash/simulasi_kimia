/* Makromolekul: Polimer dan Biomolekul — Fase F — adegan 3D */

Sim3D.daftar('makromolekul', (function () {
  'use strict';
  const T = THREE, S = S3;

  /* -------------------- polimer -------------------- */
  const POLIMER = [
    { n: 'Polietilena (PE)', monomer: 'etena  CH₂=CH₂', jenis: 'adisi',
      ulang: '—CH₂—CH₂—', guna: 'kantong plastik, botol', w: 0xdfe8ee, cabang: 'H' },
    { n: 'Polipropilena (PP)', monomer: 'propena  CH₂=CH—CH₃', jenis: 'adisi',
      ulang: '—CH₂—CH(CH₃)—', guna: 'wadah makanan, karung', w: 0xeaf0f4, cabang: 'C' },
    { n: 'PVC', monomer: 'vinil klorida  CH₂=CHCl', jenis: 'adisi',
      ulang: '—CH₂—CHCl—', guna: 'pipa air, pelapis kabel', w: 0xd8f0d8, cabang: 'Cl' },
    { n: 'Polistirena', monomer: 'stirena  CH₂=CH—C₆H₅', jenis: 'adisi',
      ulang: '—CH₂—CH(C₆H₅)—', guna: 'styrofoam, gelas plastik', w: 0xf0f0e8, cabang: 'C' },
    { n: 'Teflon (PTFE)', monomer: 'tetrafluoroetena  CF₂=CF₂', jenis: 'adisi',
      ulang: '—CF₂—CF₂—', guna: 'pelapis wajan antilengket', w: 0xe8f4d8, cabang: 'F' },
    { n: 'Nilon 6,6', monomer: 'asam adipat + heksametilendiamina', jenis: 'kondensasi',
      ulang: '—CO—(CH₂)₄—CO—NH—(CH₂)₆—NH—', guna: 'serat kain, tali, parasut',
      w: 0xf0e8d0, cabang: 'N', lepas: 'H₂O' },
    { n: 'Dakron (PET)', monomer: 'asam tereftalat + etilena glikol', jenis: 'kondensasi',
      ulang: '—CO—C₆H₄—CO—O—CH₂CH₂—O—', guna: 'botol minuman, serat poliester',
      w: 0xdfeef4, cabang: 'O', lepas: 'H₂O' },
    { n: 'Protein (polipeptida)', monomer: 'asam amino', jenis: 'kondensasi',
      ulang: '—NH—CHR—CO—', guna: 'enzim, otot, antibodi',
      w: 0xf0d8d8, cabang: 'N', lepas: 'H₂O' },
    { n: 'Amilum (polisakarida)', monomer: 'glukosa', jenis: 'kondensasi',
      ulang: '—(glukosa)—O—', guna: 'cadangan makanan tumbuhan',
      w: 0xf0e8c0, cabang: 'O', lepas: 'H₂O' },
    { n: 'Karet alam', monomer: 'isoprena', jenis: 'adisi',
      ulang: '—CH₂—C(CH₃)=CH—CH₂—', guna: 'ban, sarung tangan', w: 0xd8cfc0, cabang: 'C' }
  ];

  /* -------------------- uji biomolekul -------------------- */
  const UJI = [
    { n: 'Amilum + larutan iodin', zat: 'Amilum (karbohidrat)', awal: 0xf0f2f4,
      akhir: 0x1a2a6a, hasil: 'biru kehitaman', positif: true,
      ket: 'uji iodin untuk polisakarida' },
    { n: 'Glukosa + Fehling', zat: 'Glukosa (gula pereduksi)', awal: 0x3f8fd0,
      akhir: 0xc84a2a, hasil: 'endapan merah bata Cu₂O', positif: true,
      ket: 'uji Fehling untuk gula pereduksi' },
    { n: 'Sukrosa + Fehling', zat: 'Sukrosa (bukan pereduksi)', awal: 0x3f8fd0,
      akhir: 0x3f8fd0, hasil: 'tetap biru', positif: false,
      ket: 'sukrosa bukan gula pereduksi' },
    { n: 'Protein + Biuret', zat: 'Albumin (protein)', awal: 0x6fa8d8,
      akhir: 0x9a3ac8, hasil: 'ungu', positif: true,
      ket: 'uji Biuret untuk ikatan peptida' },
    { n: 'Protein + Xantoprotein', zat: 'Protein cincin benzena', awal: 0xeaf2f6,
      akhir: 0xf0a030, hasil: 'jingga', positif: true,
      ket: 'uji xantoprotein untuk gugus benzena' },
    { n: 'Protein + Timbal asetat', zat: 'Protein berbelerang', awal: 0xeaf2f6,
      akhir: 0x2a2a2a, hasil: 'endapan hitam PbS', positif: true,
      ket: 'uji belerang pada protein' },
    { n: 'Lemak + kertas buram', zat: 'Minyak (lipid)', awal: 0xf0e8c0,
      akhir: 0xe0d090, hasil: 'kertas menjadi transparan', positif: true,
      ket: 'uji kelarutan dan noda lemak' },
    { n: 'Lemak + Sudan III', zat: 'Minyak (lipid)', awal: 0xf0e8c0,
      akhir: 0xd84a3a, hasil: 'merah jingga', positif: true,
      ket: 'uji Sudan III untuk lipid' }
  ];

  function polimer(s) { return POLIMER[parseInt(s.get('p'), 10) || 0]; }
  function uji(s) { return UJI[parseInt(s.get('u'), 10) || 0]; }

  return {
    latar: 0x070c12,
    kamera: { jarak: 12, phi: 1.08, theta: 0.6, targetY: 0.6, lajuPutar: 0.12 },

    legenda: [
      { warna: '#2b3238', label: 'atom karbon rantai utama' },
      { warna: '#f0d040', label: 'ikatan baru antar-monomer' },
      { warna: '#6fb6ff', label: 'molekul kecil yang dilepas (H₂O)' }
    ],

    kendali: [
      { judul: 'Mode', isi: [
        { type: 'segment', id: 'mode', value: 'polimer', label: 'Yang dikerjakan', options: [
          { value: 'polimer', label: 'Polimerisasi' },
          { value: 'uji', label: 'Uji biomolekul' }
        ]}
      ]},
      { judul: 'Polimerisasi', isi: [
        { type: 'select', id: 'p', value: 0, label: 'Polimer yang dibuat',
          options: POLIMER.map(function (p, i) { return { value: i, label: p.n }; }) },
        { type: 'slider', id: 'n', value: 6, min: 2, max: 14, step: 1,
          label: 'Jumlah monomer', unit: ' unit', dec: 0 },
        { type: 'buttons', label: '', items: [
          { label: '▶ Rangkai', utama: true, klik: function (s) { s.data.jalan = true; } },
          { label: '↺ Pisahkan', klik: function (s) { s.data.t = 0; s.data.jalan = false; } }
        ]},
        { type: 'slider', id: 'laju', value: 1, min: 0.2, max: 3, step: 0.1,
          label: 'Kecepatan', unit: '×', dec: 1 },
        { type: 'toggle', id: 'putar', value: true, label: 'Putar rantai' }
      ]},
      { judul: 'Uji biomolekul', isi: [
        { type: 'select', id: 'u', value: 0, label: 'Uji yang dilakukan',
          options: UJI.map(function (u, i) { return { value: i, label: u.n }; }) },
        { type: 'buttons', label: '', items: [
          { label: '▶ Teteskan reagen', utama: true, klik: function (s) { s.data.jalanU = true; } },
          { label: '↺ Ulangi', klik: function (s) { s.data.tu = 0; s.data.jalanU = false; } }
        ]},
        { type: 'toggle', id: 'panas', value: false, label: 'Panaskan tabung' }
      ]}
    ],

    baca: [
      { id: 'a', label: 'Keterangan', tone: 'aksen' },
      { id: 'b', label: 'Monomer' },
      { id: 'c', label: 'Jenis reaksi' },
      { id: 'd', label: 'Satuan berulang' },
      { id: 'e', label: 'Kegunaan / hasil uji' }
    ],

    bangun: function (s) {
      s.tambah(S.lantai({ r: 10, warna: 0x0b1118, y: -2.6 }));

      /* ================= mode polimerisasi ================= */
      const gP = new T.Group();
      s.data.gP = gP;
      s.tambah(gP);

      s.data.unit = [];     // tiap unit: { g, x0, y0, z0 }
      s.data.ikat = [];     // batang penghubung
      s.data.lepas = [];    // molekul kecil yang dilepas (H₂O)

      const lblP = S.teks('', { skala: 0.4, lebar: 36, warna: '#d8e4ec' });
      lblP.position.set(0, 3.1, 0);
      s.data.lblP = lblP;
      gP.add(lblP);

      const lblU = S.teks('', { skala: 0.28, lebar: 34, warna: '#aebbc6' });
      lblU.position.set(0, -2.1, 0);
      s.data.lblU = lblU;
      gP.add(lblU);

      const rantai = new T.Group();
      s.data.rantai = rantai;
      gP.add(rantai);

      /* ================= mode uji ================= */
      const gU = new T.Group();
      gU.visible = false;
      s.data.gU = gU;
      s.tambah(gU);

      // rak kecil
      const papan = new T.Mesh(new T.BoxGeometry(3.4, 0.16, 1.4),
        new T.MeshStandardMaterial({ color: 0x3a2f26, roughness: 0.8 }));
      papan.position.set(0, -1.5, 0);
      gU.add(papan);

      // tabung uji besar di tengah
      const tb = S.tabung({ r: 0.46, h: 2.6, level: 0.55, warna: 0xf0f2f4 });
      tb.position.set(0, -1.4, 0);
      s.data.tb = tb;
      gU.add(tb);

      // penjepit
      const jepit = new T.Mesh(new T.TorusGeometry(0.56, 0.055, 10, 32),
        S.matLogam(0xb0b8c0));
      jepit.rotation.x = Math.PI / 2;
      jepit.position.set(0, 0.2, 0);
      gU.add(jepit);

      // pipet reagen
      const pip = new T.Group();
      const badanP = new T.Mesh(new T.CylinderGeometry(0.12, 0.12, 1.3, 18),
        new T.MeshPhysicalMaterial({ color: 0xcfe6f2, roughness: 0.06, transparent: true,
          opacity: 0.3, side: T.DoubleSide, depthWrite: false }));
      pip.add(badanP);
      const isiP = new T.Mesh(new T.CylinderGeometry(0.09, 0.09, 0.9, 16),
        S.matCairan(0x3f8fd0, { opacity: 0.85 }));
      pip.add(isiP);
      s.data.isiP = isiP;
      const ujungP = new T.Mesh(new T.ConeGeometry(0.11, 0.34, 16),
        new T.MeshPhysicalMaterial({ color: 0xcfe6f2, roughness: 0.06, transparent: true,
          opacity: 0.3, side: T.DoubleSide, depthWrite: false }));
      ujungP.position.y = -0.8;
      ujungP.rotation.x = Math.PI;
      pip.add(ujungP);
      const karet = new T.Mesh(S.geoBola(16),
        new T.MeshStandardMaterial({ color: 0xd04a5a, roughness: 0.8 }));
      karet.scale.set(0.18, 0.23, 0.18);
      karet.position.y = 0.85;
      pip.add(karet);
      pip.position.set(0, 2.3, 0);
      s.data.pip = pip;
      gU.add(pip);

      // tetesan reagen
      const tetes = [];
      for (let i = 0; i < 5; i++) {
        const m = new T.Mesh(S.geoBola(10),
          new T.MeshStandardMaterial({ color: 0x3f8fd0, emissive: 0x3f8fd0,
            emissiveIntensity: 0.4, roughness: 0.2 }));
        m.scale.setScalar(0.07);
        m.visible = false;
        gU.add(m);
        tetes.push({ m: m, y: 9 });
      }
      s.data.tetes = tetes;

      // endapan hasil uji
      const butir = [];
      for (let i = 0; i < 34; i++) {
        const m = new T.Mesh(S.geoBola(10),
          new T.MeshStandardMaterial({ color: 0xc84a2a, roughness: 0.65 }));
        const sk = S.acak(0.04, 0.085);
        m.scale.setScalar(sk);
        m.position.set(S.acak(-0.3, 0.3), -1.1 + Math.random() * 0.2, S.acak(-0.3, 0.3));
        m.visible = false;
        gU.add(m);
        butir.push(m);
      }
      s.data.butir = butir;

      // pembakar
      const kaki = new T.Mesh(new T.CylinderGeometry(0.34, 0.42, 0.18, 24),
        S.matLogam(0x5a6672, { roughness: 0.6 }));
      kaki.position.set(0, -2.45, 0);
      gU.add(kaki);
      const ny = S.nyala({ r: 0.26, h: 0.6 });
      ny.position.set(0, -2.3, 0);
      s.data.ny = ny;
      gU.add(ny);

      const lblUji = S.teks('', { skala: 0.36, lebar: 36, warna: '#d8e4ec' });
      lblUji.position.set(0, 3.1, 0);
      s.data.lblUji = lblUji;
      gU.add(lblUji);

      const lblHasil = S.teks('', { skala: 0.3, lebar: 28, warna: '#9fe8ad' });
      lblHasil.position.set(0, -1.95, 0);
      s.data.lblHasil = lblHasil;
      gU.add(lblHasil);

      s.data.t = 0; s.data.jalan = false;
      s.data.tu = 0; s.data.jalanU = false;
      bangunRantai(s);
      pasangUji(s);
      aturMode(s);
    },

    ubah: function (s, id) {
      if (id === 'mode') { aturMode(s); return; }
      if (id === 'p' || id === 'n') { bangunRantai(s); }
      if (id === 'u') pasangUji(s);
    },

    langkah: function (s, dt) {
      if (s.get('mode') === 'polimer') {
        const p = polimer(s);
        if (s.data.jalan) s.data.t = Math.min(1, s.data.t + dt * s.get('laju') * 0.3);
        const t = mulus(s.data.t);

        // unit bergerak dari tebaran acak ke posisi dalam rantai
        s.data.unit.forEach(function (u, i) {
          u.g.position.lerpVectors(u.acak, u.target, t);
          u.g.rotation.y = S.lerp(u.rot, 0, t);
          u.g.rotation.z = S.lerp(u.rotZ, 0, t);
        });

        // batang ikatan baru muncul setelah unit mendekat
        s.data.ikat.forEach(function (m, i) {
          const u = S.clamp((t - 0.55) / 0.45, 0, 1);
          m.visible = u > 0.02;
          m.scale.y = u;
          m.material.opacity = u;
        });

        // molekul kecil yang dilepas pada kondensasi
        s.data.lepas.forEach(function (o, i) {
          const u = S.clamp((t - 0.6) / 0.4, 0, 1);
          o.m.visible = p.jenis === 'kondensasi' && u > 0.02;
          if (o.m.visible) {
            o.m.position.set(o.x, o.y + u * 1.5 + Math.sin(s.waktu * 2 + i) * 0.08, o.z + u * 0.5);
            o.m.material.opacity = u * (1 - u * 0.4);
          }
        });

        if (s.get('putar')) s.data.rantai.rotation.y += dt * 0.3;
        return;
      }

      /* ---- mode uji ---- */
      const u = uji(s);
      if (s.data.jalanU) s.data.tu = Math.min(1, s.data.tu + dt * 0.42);
      const t = s.data.tu;

      // tetesan reagen jatuh
      s.data.tetes.forEach(function (q) {
        if (s.data.jalanU && t < 0.5 && q.y > 8 && Math.random() < dt * 3) q.y = 1.7;
        if (q.y < 8) {
          q.y -= dt * 3.6;
          q.m.visible = true;
          q.m.position.set(0, q.y, 0);
          if (q.y < 0.2) { q.y = 9; q.m.visible = false; }
        } else q.m.visible = false;
      });

      // warna larutan berubah
      const c = new T.Color(u.awal).lerp(new T.Color(u.akhir),
        u.positif ? mulus(S.clamp((t - 0.3) / 0.7, 0, 1)) : 0);
      s.data.tb.userData.setLevel(0.55, c.getHex());

      // endapan untuk uji yang membentuk endapan
      const berEndap = u.hasil.indexOf('endapan') >= 0;
      const n = berEndap ? Math.round(S.clamp((t - 0.5) / 0.5, 0, 1) * s.data.butir.length) : 0;
      s.data.butir.forEach(function (m, i) {
        m.visible = i < n;
        m.material.color.setHex(u.akhir);
      });

      // pembakar
      s.data.ny.userData.perbarui(s.waktu, s.get('panas') ? 0.9 : 0.0);
      s.data.ny.visible = s.get('panas');

      // gelembung ringan saat dipanaskan
      s.data.pip.position.y = 2.3 + Math.sin(s.waktu * 1.2) * 0.05;
    },

    bacaUbah: function (s) {
      if (s.get('mode') === 'polimer') {
        const p = polimer(s);
        const n = Math.round(s.get('n'));
        s.baca('a', p.n + '  —  ' + n + ' monomer tersambung '
          + Math.round((s.data.t || 0) * 100) + ' %');
        s.baca('b', p.monomer);
        s.baca('c', p.jenis === 'adisi'
          ? 'Polimerisasi adisi — ikatan rangkap terbuka, tidak ada zat yang dilepas'
          : 'Polimerisasi kondensasi — melepas ' + (p.lepas || 'H₂O') + ' setiap sambungan',
          p.jenis === 'adisi' ? 'aksen' : 'warn');
        s.baca('d', p.ulang + '   ditulis  (' + p.ulang.replace(/—/g, '') + ')ₙ');
        s.baca('e', p.guna);
      } else {
        const u = uji(s);
        const t = s.data.tu || 0;
        s.baca('a', u.n + (t > 0.95 ? '  — selesai' : t > 0.02 ? '  — berjalan' : ''));
        s.baca('b', u.zat);
        s.baca('c', u.ket);
        s.baca('d', t > 0.5 ? 'Perubahan terlihat: ' + u.hasil : 'Belum ada perubahan');
        s.baca('e', u.positif ? 'Hasil positif ✓ — zat yang diuji terdeteksi'
          : 'Hasil negatif — zat tidak memberi reaksi pada uji ini',
          u.positif ? 'aksen' : 'danger');
      }
    }
  };

  function mulus(t) { return t * t * (3 - 2 * t); }

  function aturMode(s) {
    const pol = s.get('mode') === 'polimer';
    s.data.gP.visible = pol;
    s.data.gU.visible = !pol;
    if (s.orbit) s.orbit.set({ jarak: pol ? 12 : 9, targetY: pol ? 0.6 : 0.2 });
  }

  /* ---------------- rantai polimer 3D ---------------- */
  function bangunRantai(s) {
    const r = s.data.rantai;
    while (r.children.length) S.buangObjek(r.children.pop());
    s.data.unit = [];
    s.data.ikat = [];
    s.data.lepas = [];
    s.data.t = 0;
    s.data.jalan = false;

    const p = polimer(s);
    const n = Math.round(s.get('n'));
    const jarak = 1.05;
    const lebar = (n - 1) * jarak;

    const matC = S.matBola(S.UNSUR.C.w, { unik: true });
    const matCab = S.matBola((S.UNSUR[p.cabang] || S.UNSUR.X).w, { unik: true });

    for (let i = 0; i < n; i++) {
      const g = new T.Group();

      // dua atom C tulang belakang per unit
      [-0.26, 0.26].forEach(function (dx, k) {
        const m = new T.Mesh(S.geoBola(24), matC);
        m.scale.setScalar(S.UNSUR.C.r * 0.52);
        m.position.set(dx, k === 0 ? 0.16 : -0.16, 0);
        m.castShadow = true;
        g.add(m);
      });
      g.add(S.ikatan([-0.26, 0.16, 0], [0.26, -0.16, 0], { tebal: 0.065 }));

      // gugus samping
      const cab = new T.Mesh(S.geoBola(20), matCab);
      cab.scale.setScalar((S.UNSUR[p.cabang] || S.UNSUR.X).r * 0.48);
      cab.position.set(0.3, -0.16, 0.6);
      g.add(cab);
      g.add(S.ikatan([0.26, -0.16, 0], [0.3, -0.16, 0.6], { tebal: 0.05, warna: 0x8d97a1 }));

      // dua atom H
      [[-0.3, 0.16, 0.58], [-0.3, 0.16, -0.58]].forEach(function (q) {
        const h = new T.Mesh(S.geoBola(14), S.matBola(S.UNSUR.H.w, { unik: true }));
        h.scale.setScalar(S.UNSUR.H.r * 0.5);
        h.position.set(q[0], q[1], q[2]);
        g.add(h);
        g.add(S.ikatan([-0.26, 0.16, 0], q, { tebal: 0.042, warna: 0x8d97a1 }));
      });

      const target = new T.Vector3(-lebar / 2 + i * jarak, (i % 2) * 0.22 - 0.11, 0);
      const a = Math.random() * Math.PI * 2;
      const rr = 3.2 + Math.random() * 1.6;
      const acak = new T.Vector3(Math.cos(a) * rr, S.acak(-1.6, 1.8), Math.sin(a) * rr * 0.6);
      g.position.copy(acak);
      const rot = S.acak(-2.4, 2.4), rotZ = S.acak(-1.2, 1.2);
      g.rotation.set(0, rot, rotZ);
      r.add(g);
      s.data.unit.push({ g: g, target: target, acak: acak, rot: rot, rotZ: rotZ });

      // batang penghubung antar unit (muncul setelah merapat)
      if (i > 0) {
        const m = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, jarak - 0.52, 14),
          new T.MeshStandardMaterial({ color: 0xf0d040, roughness: 0.4,
            emissive: 0xf0d040, emissiveIntensity: 0.4, transparent: true, opacity: 0 }));
        m.rotation.z = Math.PI / 2;
        m.position.set(-lebar / 2 + (i - 0.5) * jarak, 0, 0);
        m.visible = false;
        r.add(m);
        s.data.ikat.push(m);

        // molekul kecil yang dilepas (kondensasi)
        const w = new T.Mesh(S.geoBola(14),
          new T.MeshStandardMaterial({ color: 0x6fb6ff, emissive: 0x6fb6ff,
            emissiveIntensity: 0.5, transparent: true, opacity: 0 }));
        w.scale.setScalar(0.12);
        w.visible = false;
        r.add(w);
        s.data.lepas.push({ m: w, x: -lebar / 2 + (i - 0.5) * jarak, y: 0.4, z: 0 });
      }
    }

    s.data.lblP.userData.ganti(p.n);
    s.data.lblU.userData.ganti('satuan berulang:  ' + p.ulang);
    r.rotation.y = 0;
  }

  function pasangUji(s) {
    const u = uji(s);
    s.data.tu = 0;
    s.data.jalanU = false;
    s.data.tb.userData.setLevel(0.55, u.awal);
    s.data.isiP.material.color.setHex(u.akhir === u.awal ? 0x3f8fd0 : u.akhir);
    s.data.tetes.forEach(function (q) {
      q.m.visible = false; q.y = 9;
      q.m.material.color.setHex(u.akhir === u.awal ? 0x3f8fd0 : u.akhir);
      q.m.material.emissive.setHex(u.akhir === u.awal ? 0x3f8fd0 : u.akhir);
    });
    s.data.butir.forEach(function (m) { m.visible = false; });
    s.data.lblUji.userData.ganti(u.n);
    s.data.lblHasil.userData.ganti('diharapkan: ' + u.hasil,
      u.positif ? '#9fe8ad' : '#ef6a52');
  }
})());
