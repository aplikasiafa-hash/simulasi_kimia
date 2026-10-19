/* Konfigurasi Elektron dan Aturan Pengisian — Fase E — adegan 3D */

Sim3D.daftar('konfigurasi-elektron', (function () {
  'use strict';
  const T = THREE, S = S3;

  const LAMBANG = ['', 'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne',
    'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca', 'Sc', 'Ti', 'V', 'Cr',
    'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr'];
  const NAMA = ['', 'Hidrogen', 'Helium', 'Litium', 'Berilium', 'Boron', 'Karbon',
    'Nitrogen', 'Oksigen', 'Fluor', 'Neon', 'Natrium', 'Magnesium', 'Aluminium',
    'Silikon', 'Fosforus', 'Belerang', 'Klorin', 'Argon', 'Kalium', 'Kalsium',
    'Skandium', 'Titanium', 'Vanadium', 'Kromium', 'Mangan', 'Besi', 'Kobalt',
    'Nikel', 'Tembaga', 'Seng', 'Galium', 'Germanium', 'Arsen', 'Selenium',
    'Brom', 'Kripton'];

  /* Urutan Aufbau */
  const URUT = [
    ['1s', 2], ['2s', 2], ['2p', 6], ['3s', 2], ['3p', 6], ['4s', 2],
    ['3d', 10], ['4p', 6], ['5s', 2], ['4d', 10], ['5p', 6]
  ];

  function konfigurasi(z) {
    const out = [];
    let sisa = z;
    for (let i = 0; i < URUT.length && sisa > 0; i++) {
      const n = Math.min(sisa, URUT[i][1]);
      out.push({ nama: URUT[i][0], isi: n, maks: URUT[i][1] });
      sisa -= n;
    }
    return out;
  }

  const WARNA_SUB = { s: 0x4fd1c0, p: 0xf0a94a, d: 0xb795f0, f: 0xf0718f };

  /* ------------------------------------------------- bentuk orbital 3D - */

  function bentukOrbital(sub, skala) {
    const g = new T.Group();
    const w = WARNA_SUB[sub] || 0x4fd1c0;
    const mat = new T.MeshPhysicalMaterial({
      color: w, roughness: 0.25, metalness: 0, transmission: 0.35, thickness: 0.6,
      transparent: true, opacity: 0.44, clearcoat: 1, side: T.DoubleSide,
      emissive: w, emissiveIntensity: 0.12, depthWrite: false
    });
    if (sub === 's') {
      const m = new T.Mesh(new T.SphereGeometry(skala, 44, 32), mat);
      g.add(m);
    } else if (sub === 'p') {
      // tiga pasang cuping pada sumbu x, y, z
      [[1, 0, 0], [0, 1, 0], [0, 0, 1]].forEach(function (a) {
        [-1, 1].forEach(function (d) {
          const m = new T.Mesh(cupingGeo(skala), mat);
          m.position.set(a[0] * skala * 0.62 * d, a[1] * skala * 0.62 * d, a[2] * skala * 0.62 * d);
          if (a[0]) m.rotation.z = -Math.PI / 2 * d;
          if (a[2]) m.rotation.x = Math.PI / 2 * d;
          if (a[1] && d < 0) m.rotation.x = Math.PI;
          g.add(m);
        });
      });
    } else {
      // d: empat cuping di bidang diagonal
      for (let i = 0; i < 4; i++) {
        const a = i / 4 * Math.PI * 2 + Math.PI / 4;
        const m = new T.Mesh(cupingGeo(skala * 0.85), mat);
        m.position.set(Math.cos(a) * skala * 0.6, 0, Math.sin(a) * skala * 0.6);
        m.rotation.z = -Math.PI / 2;
        m.rotation.y = -a;
        g.add(m);
      }
      const cincin = new T.Mesh(new T.TorusGeometry(skala * 0.5, skala * 0.12, 16, 40), mat);
      cincin.rotation.x = Math.PI / 2;
      g.add(cincin);
    }
    return g;
  }

  let _cuping = {};
  function cupingGeo(skala) {
    const k = skala.toFixed(2);
    if (_cuping[k]) return _cuping[k];
    const titik = [];
    const n = 24;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const r = Math.sin(t * Math.PI) * skala * 0.42 * (1 - t * 0.2);
      titik.push(new T.Vector2(Math.max(0.001, r), t * skala * 1.25));
    }
    _cuping[k] = new T.LatheGeometry(titik, 28);
    return _cuping[k];
  }

  return {
    latar: 0x05090e,
    kamera: { jarak: 8.6, phi: 1.02, theta: 0.6, targetY: 0.2, lajuPutar: 0.22 },

    kendali: [
      { judul: 'Unsur', isi: [
        { type: 'slider', id: 'z', value: 8, min: 1, max: 36, step: 1,
          label: 'Nomor atom (Z)', unit: '', dec: 0,
          format: function (v) { return Math.round(v) + '  ' + (LAMBANG[Math.round(v)] || ''); } },
        { type: 'buttons', label: 'Lompat ke', items: [
          { label: 'C (6)', klik: function (s) { s.set('z', 6); } },
          { label: 'Ne (10)', klik: function (s) { s.set('z', 10); } },
          { label: 'Fe (26)', klik: function (s) { s.set('z', 26); } }
        ]}
      ]},
      { judul: 'Tampilan orbital', isi: [
        { type: 'segment', id: 'tampil', value: 'semua', label: 'Yang digambar', options: [
          { value: 'semua', label: 'Semua' },
          { value: 'terluar', label: 'Terluar' },
          { value: 'satu', label: 'Satu subkulit' }
        ]},
        { type: 'select', id: 'pilihSub', value: 0, label: 'Subkulit yang disorot',
          options: URUT.map(function (u, i) { return { value: i, label: u[0] }; }) },
        { type: 'toggle', id: 'kotak', value: true, label: 'Tampilkan diagram kotak orbital' },
        { type: 'slider', id: 'tembus', value: 0.44, min: 0.08, max: 0.9, step: 0.02,
          label: 'Ketembusan awan', unit: '', dec: 2 }
      ]}
    ],

    baca: [
      { id: 'unsur', label: 'Unsur', tone: 'aksen' },
      { id: 'konf', label: 'Konfigurasi' },
      { id: 'singkat', label: 'Singkatan gas mulia' },
      { id: 'valensi', label: 'Elektron valensi' },
      { id: 'aturan', label: 'Aturan yang berlaku' }
    ],

    bangun: function (s) {
      s.tambah(S.panggungMolekul({ r: 6.0, warna: 0x2e4160, kuat: 0.45, yBayang: -2.8 }));
      s.data.w = new T.Group();
      s.tambah(s.data.w);

      s.data.kotakG = new T.Group();
      s.data.kotakG.position.set(0, -2.9, 0);
      s.tambah(s.data.kotakG);

      const lbl = S.teks('', { skala: 0.44, lebar: 18, warna: '#d8e4ec' });
      lbl.position.set(0, 3.5, 0);
      s.data.lbl = lbl;
      s.tambah(lbl);

      pasang(s);
    },

    ubah: function (s) { pasang(s); },

    langkah: function (s, dt) {
      s.data.w.rotation.y += dt * 0.1;
      (s.data.elektron || []).forEach(function (e, i) {
        const u = e.userData;
        u.fase += dt * u.laju;
        e.position.copy(u.jalur(u.fase));
      });
    },

    bacaUbah: function (s) {
      const z = Math.round(s.get('z'));
      const k = konfigurasi(z);
      s.baca('unsur', (NAMA[z] || '—') + ' (' + (LAMBANG[z] || '?') + ', Z=' + z + ')');
      s.baca('konf', k.map(function (x) { return x.nama + S.sup(String(x.isi)); }).join(' '));
      s.baca('singkat', singkat(z, k));
      const n = Math.max.apply(null, k.map(function (x) { return parseInt(x.nama[0], 10); }));
      let val = 0;
      k.forEach(function (x) { if (parseInt(x.nama[0], 10) === n) val += x.isi; });
      s.baca('valensi', val + ' elektron (kulit ke-' + n + ')');
      const terakhir = k[k.length - 1];
      s.baca('aturan', terakhir && terakhir.isi < terakhir.maks && terakhir.nama[1] !== 's'
        ? 'Hund: sendiri dulu sebelum berpasangan' : 'Aufbau: energi terendah diisi lebih dulu');
    }
  };

  function singkat(z, k) {
    const mulia = [2, 10, 18, 36];
    const lambangMulia = { 2: 'He', 10: 'Ne', 18: 'Ar', 36: 'Kr' };
    let dasar = 0;
    mulia.forEach(function (m) { if (m < z) dasar = m; });
    if (!dasar) return '—';
    const kd = konfigurasi(dasar);
    const sisa = k.slice(kd.length - (kd[kd.length - 1].isi < kd[kd.length - 1].maks ? 1 : 0));
    const inti = konfigurasi(dasar).map(function (x) { return x.nama + x.isi; }).join('');
    const out = k.filter(function (x, i) {
      const d = konfigurasi(dasar)[i];
      return !d || d.isi !== x.isi || d.nama !== x.nama;
    });
    return '[' + lambangMulia[dasar] + '] ' +
      out.map(function (x) { return x.nama + S.sup(String(x.isi)); }).join(' ');
  }

  function pasang(s) {
    const z = Math.round(s.get('z'));
    const k = konfigurasi(z);
    const w = s.data.w;
    while (w.children.length) { const c = w.children.pop(); S.buangObjek(c); }
    const kg = s.data.kotakG;
    while (kg.children.length) { const c = kg.children.pop(); S.buangObjek(c); }
    s.data.elektron = [];

    const mode = s.get('tampil');
    const pilih = parseInt(s.get('pilihSub'), 10) || 0;
    const tembus = s.get('tembus');

    // inti
    const inti = S.atom('X', null, { skala: 0.22, warna: 0xe0533d });
    w.add(inti);

    const nMaks = Math.max.apply(null, k.map(function (x) { return parseInt(x.nama[0], 10); }));

    k.forEach(function (sub, i) {
      const n = parseInt(sub.nama[0], 10);
      const jenis = sub.nama[1];
      let tampak = true;
      if (mode === 'terluar') tampak = n === nMaks;
      if (mode === 'satu') tampak = URUT[pilih] && URUT[pilih][0] === sub.nama;
      if (!tampak) return;

      const skala = 0.52 + n * 0.46;
      const g = bentukOrbital(jenis, skala);
      g.children.forEach(function (m) { m.material.opacity = tembus; });
      g.renderOrder = 2;
      w.add(g);

      // elektron bergerak di dalam orbital
      for (let e = 0; e < sub.isi; e++) {
        const el = S.atom('X', null, { skala: 0.1, warna: 0x9fd8ff });
        const r = skala * (jenis === 's' ? 0.72 : 0.95);
        const sumbu = e % 3;
        const arah = e % 2 ? 1 : -1;
        el.userData = {
          fase: e / Math.max(1, sub.isi) * Math.PI * 2,
          laju: 0.9 / Math.sqrt(n) * arah,
          jalur: function (f) {
            if (jenis === 's') {
              return new T.Vector3(Math.cos(f) * r, Math.sin(f * 0.8) * r * 0.5, Math.sin(f) * r);
            }
            const v = new T.Vector3(Math.cos(f) * r * 0.42, 0, Math.sin(f) * r * 0.42);
            v.setComponent(sumbu, Math.cos(f) * r);
            if (sumbu === 0) { v.y = Math.sin(f) * r * 0.3; v.z = Math.sin(f) * r * 0.18; }
            if (sumbu === 1) { v.x = Math.sin(f) * r * 0.3; v.z = Math.cos(f * 1.3) * r * 0.18; }
            if (sumbu === 2) { v.x = Math.sin(f) * r * 0.3; v.y = Math.cos(f * 1.1) * r * 0.18; }
            return v;
          }
        };
        w.add(el);
        s.data.elektron.push(el);
      }
    });

    /* ---------- diagram kotak orbital ---------- */
    if (s.get('kotak')) {
      let x = 0;
      const lebarTotal = k.reduce(function (a, sub) {
        return a + (sub.maks / 2) * 0.34 + 0.4;
      }, 0);
      x = -lebarTotal / 2;
      k.forEach(function (sub) {
        const jenis = sub.nama[1];
        const nKotak = sub.maks / 2;
        const t = S.teks(sub.nama, { skala: 0.21, latar: false,
          warna: '#' + new T.Color(WARNA_SUB[jenis]).getHexString() });
        t.position.set(x + nKotak * 0.17, -0.34, 0);
        kg.add(t);
        for (let i = 0; i < nKotak; i++) {
          const kotak = new T.Mesh(new T.BoxGeometry(0.3, 0.3, 0.05),
            new T.MeshStandardMaterial({ color: 0x1d2730, roughness: 0.8 }));
          kotak.position.set(x + i * 0.34, 0, 0);
          kg.add(kotak);
          const garis = new T.LineSegments(
            new T.EdgesGeometry(new T.BoxGeometry(0.3, 0.3, 0.05)),
            new T.LineBasicMaterial({ color: WARNA_SUB[jenis], transparent: true, opacity: 0.5 }));
          garis.position.copy(kotak.position);
          kg.add(garis);
        }
        // isi menurut aturan Hund: satu per kotak dulu
        for (let e = 0; e < sub.isi; e++) {
          const putaran = e < nKotak ? 0 : 1;
          const idx = e < nKotak ? e : e - nKotak;
          const panah = new T.Mesh(new T.ConeGeometry(0.052, 0.17, 10),
            new T.MeshStandardMaterial({ color: putaran ? 0xf0718f : 0x7fe3d6,
              emissive: putaran ? 0xf0718f : 0x7fe3d6, emissiveIntensity: 0.4 }));
          panah.position.set(x + idx * 0.34 + (putaran ? 0.07 : -0.07), 0, 0.06);
          panah.rotation.z = putaran ? Math.PI : 0;
          kg.add(panah);
        }
        x += nKotak * 0.34 + 0.4;
      });
    }

    s.data.lbl.userData.ganti((NAMA[z] || '?') + '  ' + (LAMBANG[z] || ''));
    s.orbit.set({ jarak: 5.6 + nMaks * 1.1 });
  }
})());
