/* Ikatan Ion dan Ikatan Kovalen — Fase E — adegan 3D */

Sim3D.daftar('ikatan-kimia', (function () {
  'use strict';
  const T = THREE, S = S3;

  const KASUS = [
    { id: 'nacl', n: 'NaCl — ikatan ion', jenis: 'ion',
      a: { s: 'Na', e: 1, nama: 'Natrium' }, b: { s: 'Cl', e: 7, nama: 'Klorin' },
      pindah: 1, ket: 'Natrium menyerahkan 1 elektron kepada klorin' },
    { id: 'mgo', n: 'MgO — ikatan ion', jenis: 'ion',
      a: { s: 'Mg', e: 2, nama: 'Magnesium' }, b: { s: 'O', e: 6, nama: 'Oksigen' },
      pindah: 2, ket: 'Magnesium menyerahkan 2 elektron kepada oksigen' },
    { id: 'h2', n: 'H₂ — kovalen tunggal', jenis: 'kovalen',
      a: { s: 'H', e: 1, nama: 'Hidrogen' }, b: { s: 'H', e: 1, nama: 'Hidrogen' },
      pasang: 1, ket: 'Dua atom berbagi sepasang elektron' },
    { id: 'o2', n: 'O₂ — kovalen rangkap dua', jenis: 'kovalen',
      a: { s: 'O', e: 6, nama: 'Oksigen' }, b: { s: 'O', e: 6, nama: 'Oksigen' },
      pasang: 2, ket: 'Berbagi dua pasang elektron' },
    { id: 'n2', n: 'N₂ — kovalen rangkap tiga', jenis: 'kovalen',
      a: { s: 'N', e: 5, nama: 'Nitrogen' }, b: { s: 'N', e: 5, nama: 'Nitrogen' },
      pasang: 3, ket: 'Berbagi tiga pasang elektron — sangat kuat' },
    { id: 'hcl', n: 'HCl — kovalen polar', jenis: 'kovalen',
      a: { s: 'H', e: 1, nama: 'Hidrogen' }, b: { s: 'Cl', e: 7, nama: 'Klorin' },
      pasang: 1, polar: true, ket: 'Elektron bersama lebih dekat ke klorin' }
  ];

  function kasus(s) {
    const id = s.get('k');
    for (let i = 0; i < KASUS.length; i++) if (KASUS[i].id === id) return KASUS[i];
    return KASUS[0];
  }

  return {
    latar: 0x070d13,
    kamera: { jarak: 8.4, phi: 1.1, theta: 0.5, targetY: 0.1, lajuPutar: 0.14 },

    kendali: [
      { judul: 'Ikatan', isi: [
        { type: 'select', id: 'k', value: 'nacl', label: 'Contoh',
          options: KASUS.map(function (k) { return { value: k.id, label: k.n }; }) },
        { type: 'slider', id: 't', value: 0, min: 0, max: 1, step: 0.01,
          label: 'Tahap pembentukan ikatan', unit: '', dec: 2,
          format: function (v) { return v < 0.05 ? 'atom terpisah' : v > 0.95 ? 'ikatan terbentuk' : Math.round(v * 100) + '%'; } },
        { type: 'buttons', label: '', items: [
          { label: '▶ Bentuk ikatan', utama: true, klik: function (s) { s.data.animasi = 1; } },
          { label: '◀ Uraikan', klik: function (s) { s.data.animasi = -1; } }
        ]}
      ]},
      { judul: 'Tampilan', isi: [
        { type: 'toggle', id: 'kulit', value: true, label: 'Tampilkan kulit valensi' },
        { type: 'toggle', id: 'lewis', value: true, label: 'Tampilkan titik Lewis' },
        { type: 'toggle', id: 'kisi', value: false, label: 'Tampilkan kisi ion (untuk ikatan ion)' },
        { type: 'toggle', id: 'dipol', value: true, label: 'Tampilkan kutub muatan' }
      ]}
    ],

    baca: [
      { id: 'jenis', label: 'Jenis ikatan', tone: 'aksen' },
      { id: 'proses', label: 'Yang terjadi' },
      { id: 'a', label: 'Atom kiri' },
      { id: 'b', label: 'Atom kanan' },
      { id: 'sifat', label: 'Sifat senyawa' }
    ],

    bangun: function (s) {
      s.tambah(S.panggungMolekul({ r: 6.0, warna: 0x2a4a63, kuat: 0.45, yBayang: -2.6 }));
      s.data.w = new T.Group();
      s.tambah(s.data.w);
      s.data.kisiG = new T.Group();
      s.data.kisiG.visible = false;
      s.tambah(s.data.kisiG);

      const lbl = S.teks('', { skala: 0.42, lebar: 20, warna: '#d8e4ec' });
      lbl.position.set(0, 2.75, 0);
      s.data.lbl = lbl;
      s.tambah(lbl);
      const ket = S.teks('', { skala: 0.27, lebar: 42, warna: '#9aa8b4' });
      ket.position.set(0, -2.6, 0);
      s.data.ket = ket;
      s.tambah(ket);

      s.data.animasi = 0;
      pasang(s);
    },

    ubah: function (s, id) {
      if (id === 't') { s.data.animasi = 0; perbarui(s); }
      else pasang(s);
    },

    langkah: function (s, dt) {
      if (s.data.animasi) {
        const v = S.clamp(s.get('t') + s.data.animasi * dt * 0.42, 0, 1);
        s.setDiam('t', v);
        if (v === 0 || v === 1) s.data.animasi = 0;
      }
      perbarui(s);
      if (s.get('kisi') && kasus(s).jenis === 'ion') s.data.kisiG.rotation.y += dt * 0.2;
    },

    bacaUbah: function (s) {
      const k = kasus(s);
      const t = s.get('t');
      s.baca('jenis', k.jenis === 'ion' ? 'Ikatan ion' : (k.polar ? 'Kovalen polar' : 'Kovalen nonpolar'),
        k.jenis === 'ion' ? 'danger' : 'aksen');
      s.baca('proses', k.jenis === 'ion'
        ? 'Serah-terima ' + k.pindah + ' elektron'
        : 'Pemakaian bersama ' + k.pasang + ' pasang elektron');
      const muatanA = k.jenis === 'ion' ? Math.round(k.pindah * t) : 0;
      s.baca('a', k.a.nama + (muatanA ? '  →  ' + k.a.s + S.sup(muatanA + '+') : '  ' + k.a.e + ' e⁻ valensi'));
      s.baca('b', k.b.nama + (muatanA ? '  →  ' + k.b.s + S.sup(muatanA + '−') : '  ' + k.b.e + ' e⁻ valensi'));
      s.baca('sifat', k.jenis === 'ion'
        ? 'Titik leleh tinggi, larutannya menghantarkan listrik'
        : k.polar ? 'Larut dalam air, titik didih sedang'
        : 'Titik leleh rendah, tidak menghantarkan listrik');
    }
  };

  function perbarui(s) {
    const k = kasus(s);
    const t = s.get('t');
    const d = s.data;
    if (!d.A) return;

    const jarakAwal = 3.1;
    const jarakAkhir = k.jenis === 'ion' ? 1.9 : 1.25;
    const jarak = S.lerp(jarakAwal, jarakAkhir, t);
    d.A.position.x = -jarak / 2;
    d.B.position.x = jarak / 2;

    // elektron valensi
    d.eA.forEach(function (e, i) {
      const u = e.userData;
      if (k.jenis === 'ion' && i < k.pindah) {
        // elektron pindah ke atom kanan
        const dari = new T.Vector3(-jarak / 2 + Math.cos(u.a) * u.r, Math.sin(u.a) * u.r * 0.6, Math.sin(u.a) * u.r);
        const ke = new T.Vector3(jarak / 2 + Math.cos(u.a + 1) * (u.r + 0.12),
          Math.sin(u.a + 1) * (u.r + 0.12) * 0.6, Math.sin(u.a + 1) * (u.r + 0.12));
        e.position.lerpVectors(dari, ke, S.clamp((t - 0.15) * 1.6, 0, 1));
        e.material.color.setHex(t > 0.5 ? 0x4fd1c0 : 0xf0c04a);
        e.material.emissive.copy(e.material.color);
      } else if (k.jenis === 'kovalen' && i < k.pasang) {
        // elektron bergeser ke tengah (dibagi bersama)
        const dari = new T.Vector3(-jarak / 2 + Math.cos(u.a) * u.r, Math.sin(u.a) * u.r * 0.6, Math.sin(u.a) * u.r);
        const geser = k.polar ? 0.22 : 0;
        const ke = new T.Vector3(geser, (i - (k.pasang - 1) / 2) * 0.26, -0.18);
        e.position.lerpVectors(dari, ke, t);
      } else {
        e.position.set(-jarak / 2 + Math.cos(u.a) * u.r, Math.sin(u.a) * u.r * 0.6, Math.sin(u.a) * u.r);
      }
    });
    d.eB.forEach(function (e, i) {
      const u = e.userData;
      if (k.jenis === 'kovalen' && i < k.pasang) {
        const dari = new T.Vector3(jarak / 2 + Math.cos(u.a) * u.r, Math.sin(u.a) * u.r * 0.6, Math.sin(u.a) * u.r);
        const geser = k.polar ? 0.22 : 0;
        const ke = new T.Vector3(geser, (i - (k.pasang - 1) / 2) * 0.26, 0.18);
        e.position.lerpVectors(dari, ke, t);
      } else {
        e.position.set(jarak / 2 + Math.cos(u.a) * u.r, Math.sin(u.a) * u.r * 0.6, Math.sin(u.a) * u.r);
      }
    });

    // kulit
    if (d.kA) { d.kA.position.x = -jarak / 2; d.kB.position.x = jarak / 2; }

    // batang ikatan kovalen
    if (d.batang) {
      d.batang.visible = k.jenis === 'kovalen' && t > 0.7;
      if (d.batang.visible) {
        d.batang.userData.perbarui([-jarak / 2 + 0.3, 0, 0], [jarak / 2 - 0.3, 0, 0]);
      }
    }

    // aura muatan ion
    if (d.auraA) {
      const on = k.jenis === 'ion' && t > 0.5;
      d.auraA.visible = on && s.get('dipol');
      d.auraB.visible = on && s.get('dipol');
      d.auraA.position.x = -jarak / 2;
      d.auraB.position.x = jarak / 2;
      const f = S.clamp((t - 0.5) * 2, 0, 1);
      d.auraA.material.opacity = 0.2 * f;
      d.auraB.material.opacity = 0.2 * f;
    }

    // tanda δ+ / δ− untuk kovalen polar
    if (d.dp) {
      const on = k.jenis === 'kovalen' && !!k.polar && t > 0.7 && s.get('dipol');
      d.dp.visible = on; d.dm.visible = on;
      d.dp.position.set(-jarak / 2, 0.75, 0);
      d.dm.position.set(jarak / 2, 0.75, 0);
    }

    // tanda muatan ion
    if (d.mA) {
      const on = k.jenis === 'ion' && t > 0.55 && s.get('dipol');
      d.mA.visible = on; d.mB.visible = on;
      d.mA.position.set(-jarak / 2, 0.85, 0);
      d.mB.position.set(jarak / 2, 0.85, 0);
    }
  }

  function pasang(s) {
    const k = kasus(s);
    const w = s.data.w;
    while (w.children.length) { const c = w.children.pop(); S.buangObjek(c); }
    const kg = s.data.kisiG;
    while (kg.children.length) { const c = kg.children.pop(); S.buangObjek(c); }

    const d = s.data;
    d.A = S.atom(k.a.s, null, { skala: 0.95 });
    d.B = S.atom(k.b.s, null, { skala: 0.95 });
    w.add(d.A, d.B);

    const rA = (S.UNSUR[k.a.s] || S.UNSUR.X).r * 0.95;
    const rB = (S.UNSUR[k.b.s] || S.UNSUR.X).r * 0.95;

    d.eA = []; d.eB = [];
    for (let i = 0; i < k.a.e; i++) {
      const e = S.atom('X', null, { skala: 0.1, warna: 0xf0c04a });
      e.userData = { a: i / k.a.e * Math.PI * 2, r: rA + 0.24 };
      w.add(e); d.eA.push(e);
    }
    for (let i = 0; i < k.b.e; i++) {
      const e = S.atom('X', null, { skala: 0.1, warna: 0x4fd1c0 });
      e.userData = { a: i / k.b.e * Math.PI * 2 + 0.4, r: rB + 0.24 };
      w.add(e); d.eB.push(e);
    }

    if (s.get('kulit')) {
      d.kA = cincin(rA + 0.24, 0xf0c04a); d.kB = cincin(rB + 0.24, 0x4fd1c0);
      w.add(d.kA, d.kB);
    } else { d.kA = null; d.kB = null; }

    d.batang = S.ikatan([-0.6, 0, 0], [0.6, 0, 0], { orde: k.pasang || 1, tebal: 0.07 });
    d.batang.visible = false;
    w.add(d.batang);

    d.auraA = new T.Mesh(new T.SphereGeometry(rA + 0.5, 32, 22),
      new T.MeshBasicMaterial({ color: 0xef6a52, transparent: true, opacity: 0, side: T.BackSide }));
    d.auraB = new T.Mesh(new T.SphereGeometry(rB + 0.5, 32, 22),
      new T.MeshBasicMaterial({ color: 0x5b9bf5, transparent: true, opacity: 0, side: T.BackSide }));
    w.add(d.auraA, d.auraB);

    d.mA = S.teks(k.a.s + S.sup((k.pindah > 1 ? k.pindah : '') + '+'),
      { skala: 0.3, lebar: 5, warna: '#f6a898' });
    d.mB = S.teks(k.b.s + S.sup((k.pindah > 1 ? k.pindah : '') + '−'),
      { skala: 0.3, lebar: 5, warna: '#9fc0f8' });
    d.mA.visible = d.mB.visible = false;
    w.add(d.mA, d.mB);

    d.dp = S.teks('δ+', { skala: 0.28, lebar: 3, warna: '#f6a898' });
    d.dm = S.teks('δ−', { skala: 0.28, lebar: 3, warna: '#9fc0f8' });
    d.dp.visible = d.dm.visible = false;
    w.add(d.dp, d.dm);

    // kisi ion
    if (k.jenis === 'ion') {
      const n = 3, jarak = 1.0;
      for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) for (let z = 0; z < n; z++) {
        const pos = (x + y + z) % 2 === 0;
        const m = S.atom(pos ? k.a.s : k.b.s, null, { skala: pos ? 0.55 : 0.8 });
        m.position.set((x - 1) * jarak, (y - 1) * jarak, (z - 1) * jarak);
        kg.add(m);
      }
      const rangka = new T.LineSegments(
        new T.EdgesGeometry(new T.BoxGeometry(jarak * 2, jarak * 2, jarak * 2)),
        new T.LineBasicMaterial({ color: 0x4fd1c0, transparent: true, opacity: 0.25 }));
      kg.add(rangka);
    }
    const pakaiKisi = s.get('kisi') && k.jenis === 'ion';
    kg.visible = pakaiKisi;
    w.visible = !pakaiKisi;

    s.data.lbl.userData.ganti(k.n, k.jenis === 'ion' ? '#f6a898' : '#7fe3d6');
    s.data.ket.userData.ganti(k.ket);
    s.orbit.set({ jarak: pakaiKisi ? 7.2 : 8.4 });
    perbarui(s);
  }

  function cincin(r, w) {
    const m = new T.Mesh(new T.TorusGeometry(r, 0.01, 8, 70),
      new T.MeshBasicMaterial({ color: w, transparent: true, opacity: 0.3 }));
    m.rotation.x = Math.PI / 2;
    return m;
  }
})());
