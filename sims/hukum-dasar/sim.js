/* Hukum-Hukum Dasar Kimia — Fase E — adegan 3D */

Sim3D.daftar('hukum-dasar', (function () {
  'use strict';
  const T = THREE, S = S3;

  const HUKUM = [
    { id: 'lavoisier', n: 'Lavoisier — Kekekalan Massa',
      bunyi: 'Massa zat sebelum dan sesudah reaksi selalu sama',
      pers: '2H₂ + O₂ → 2H₂O' },
    { id: 'proust', n: 'Proust — Perbandingan Tetap',
      bunyi: 'Perbandingan massa unsur dalam satu senyawa selalu tetap',
      pers: 'H : O = 1 : 8 dalam setiap air' },
    { id: 'dalton', n: 'Dalton — Perbandingan Berganda',
      bunyi: 'Bila dua unsur membentuk beberapa senyawa, massa salah satunya berbanding bulat sederhana',
      pers: 'CO dan CO₂ → O berbanding 1 : 2' },
    { id: 'gaylussac', n: 'Gay-Lussac — Perbandingan Volume',
      bunyi: 'Volume gas yang bereaksi berbanding bulat sederhana',
      pers: 'N₂ + 3H₂ → 2NH₃  →  1 : 3 : 2' },
    { id: 'avogadro', n: 'Avogadro — Hipotesis Volume',
      bunyi: 'Volume gas yang sama berisi jumlah molekul yang sama',
      pers: 'P, V, T sama → jumlah molekul sama' }
  ];

  const DEF = {
    H2: { atom: [['H', -0.32, 0, 0], ['H', 0.32, 0, 0]], ikatan: [[0, 1, 1]] },
    O2: { atom: [['O', -0.38, 0, 0], ['O', 0.38, 0, 0]], ikatan: [[0, 1, 2]] },
    N2: { atom: [['N', -0.36, 0, 0], ['N', 0.36, 0, 0]], ikatan: [[0, 1, 3]] },
    H2O: { atom: [['O', 0, 0.08, 0], ['H', -0.5, -0.36, 0], ['H', 0.5, -0.36, 0]],
      ikatan: [[0, 1, 1], [0, 2, 1]] },
    NH3: { atom: [['N', 0, 0.1, 0], ['H', -0.45, -0.3, 0.2], ['H', 0.45, -0.3, 0.2], ['H', 0, -0.3, -0.5]],
      ikatan: [[0, 1, 1], [0, 2, 1], [0, 3, 1]] },
    CO: { atom: [['C', -0.34, 0, 0], ['O', 0.34, 0, 0]], ikatan: [[0, 1, 3]] },
    CO2: { atom: [['C', 0, 0, 0], ['O', -0.68, 0, 0], ['O', 0.68, 0, 0]],
      ikatan: [[0, 1, 2], [0, 2, 2]] },
    He: { atom: [['He', 0, 0, 0]], ikatan: [] },
    Ar: { atom: [['Ar', 0, 0, 0]], ikatan: [] }
  };

  function hukum(s) {
    const id = s.get('h');
    for (let i = 0; i < HUKUM.length; i++) if (HUKUM[i].id === id) return HUKUM[i];
    return HUKUM[0];
  }

  return {
    latar: 0x080e14,
    kamera: { jarak: 11.5, phi: 1.06, theta: 0.5, targetY: 1.1, lajuPutar: 0.1 },

    kendali: [
      { judul: 'Hukum dasar', isi: [
        { type: 'select', id: 'h', value: 'proust', label: 'Hukum',
          options: HUKUM.map(function (h) { return { value: h.id, label: h.n.split(' — ')[0] }; }) },
        { type: 'slider', id: 'skala', value: 1, min: 0.4, max: 3, step: 0.1,
          label: 'Perbesar jumlah zat', unit: '×', dec: 1 }
      ]},
      { judul: 'Jalankan', isi: [
        { type: 'buttons', label: '', items: [
          { label: '▶ Reaksikan', utama: true, klik: function (s) { s.data.arah = 1; } },
          { label: '◀ Uraikan', klik: function (s) { s.data.arah = -1; } }
        ]},
        { type: 'slider', id: 'lebih', value: 0, min: 0, max: 1, step: 0.05,
          label: 'Tambahkan pereaksi berlebih', unit: '', dec: 2,
          format: function (v) { return v < 0.03 ? 'pas' : '+' + Math.round(v * 100) + '%'; } }
      ]},
      { judul: 'Tampilan', isi: [
        { type: 'toggle', id: 'neraca', value: true, label: 'Tampilkan neraca massa' },
        { type: 'toggle', id: 'tabung', value: true, label: 'Tampilkan tabung volume gas' }
      ]}
    ],

    baca: [
      { id: 'hukum', label: 'Hukum', tone: 'aksen' },
      { id: 'bunyi', label: 'Bunyi' },
      { id: 'kiri', label: 'Sebelum reaksi' },
      { id: 'kanan', label: 'Sesudah reaksi' },
      { id: 'simpul', label: 'Kesimpulan' }
    ],

    bangun: function (s) {
      s.tambah(S.lantai({ r: 10, warna: 0x0e151d }));
      s.data.w = new T.Group();
      s.tambah(s.data.w);

      const lbl = S.teks('', { skala: 0.4, lebar: 22, warna: '#d8e4ec' });
      lbl.position.set(0, 4.6, 0);
      s.data.lbl = lbl;
      s.tambah(lbl);
      const pers = S.teks('', { skala: 0.3, lebar: 32, warna: '#7fe3d6' });
      pers.position.set(0, 4.0, 0);
      s.data.pers = pers;
      s.tambah(pers);

      s.data.t = 0;
      s.data.arah = 0;
      pasang(s);
    },

    ubah: function (s) { pasang(s); },

    langkah: function (s, dt) {
      if (s.data.arah) {
        s.data.t = S.clamp(s.data.t + s.data.arah * dt * 0.4, 0, 1);
        if (s.data.t === 0 || s.data.t === 1) s.data.arah = 0;
      }
      const t = s.data.t;
      const o = s.data.o || {};

      if (o.kiri) {
        // molekul pereaksi berkurang, produk bertambah
        o.kiri.forEach(function (g) {
          g.visible = g.userData.sisa ? true : t < 0.85;
          g.scale.setScalar(g.userData.sisa ? 1 : Math.max(0.01, 1 - t));
          g.position.y = g.userData.y + Math.sin(s.waktu * 1.4 + g.userData.f) * 0.05;
          g.rotation.y += dt * 0.5;
        });
      }
      if (o.kanan) {
        o.kanan.forEach(function (g) {
          g.visible = t > 0.12;
          g.scale.setScalar(Math.max(0.01, S.clamp((t - 0.12) * 1.3, 0, 1)));
          g.position.y = g.userData.y + Math.sin(s.waktu * 1.4 + g.userData.f) * 0.05;
          g.rotation.y += dt * 0.5;
        });
      }
      if (o.batangKiri) {
        o.batangKiri.forEach(function (b) {
          b.scale.y = S.lerp(b.scale.y, b.userData.target, dt * 4);
          b.position.y = b.scale.y / 2;
        });
      }
      if (o.jarum) {
        o.jarum.rotation.z = S.lerp(o.jarum.rotation.z, 0, dt * 4);
      }
    },

    bacaUbah: function (s) {
      const h = hukum(s);
      const sk = s.get('skala');
      const lebih = s.get('lebih');
      s.baca('hukum', h.n.split(' — ')[1] || h.n);
      s.baca('bunyi', h.bunyi);
      if (h.id === 'lavoisier') {
        s.baca('kiri', S.fmt(4 * sk, 1) + ' g H₂ + ' + S.fmt(32 * sk, 1) + ' g O₂');
        s.baca('kanan', S.fmt(36 * sk, 1) + ' g H₂O');
        s.baca('simpul', 'Massa total tetap: ' + S.fmt(36 * sk, 1) + ' g', 'aksen');
      } else if (h.id === 'proust') {
        const hMassa = 2 * sk * (1 + lebih);
        const oMassa = 16 * sk;
        const bereaksi = Math.min(hMassa, oMassa / 8);
        s.baca('kiri', S.fmt(hMassa, 2) + ' g H + ' + S.fmt(oMassa, 1) + ' g O');
        s.baca('kanan', S.fmt(bereaksi * 9, 2) + ' g H₂O' +
          (hMassa > bereaksi ? ' + ' + S.fmt(hMassa - bereaksi, 2) + ' g H sisa' : ''));
        s.baca('simpul', 'H : O selalu 1 : 8 — kelebihan tidak ikut bereaksi',
          lebih > 0.03 ? 'warn' : 'aksen');
      } else if (h.id === 'dalton') {
        s.baca('kiri', '12 g C + 16 g O  →  CO');
        s.baca('kanan', '12 g C + 32 g O  →  CO₂');
        s.baca('simpul', 'Massa O berbanding 16 : 32 = 1 : 2', 'aksen');
      } else if (h.id === 'gaylussac') {
        s.baca('kiri', S.fmt(1 * sk, 1) + ' L N₂ + ' + S.fmt(3 * sk, 1) + ' L H₂');
        s.baca('kanan', S.fmt(2 * sk, 1) + ' L NH₃');
        s.baca('simpul', 'Volume berbanding 1 : 3 : 2 — bilangan bulat sederhana', 'aksen');
      } else {
        s.baca('kiri', '1 L gas apa pun pada P dan T sama');
        s.baca('kanan', '2,69 × 10²² molekul');
        s.baca('simpul', 'Jumlah molekul sama, apa pun jenis gasnya', 'aksen');
      }
    }
  };

  function molekulKecil(def, skala) {
    const g = new T.Group();
    const pos = def.atom.map(function (a) { return new T.Vector3(a[1], a[2], a[3] || 0); });
    def.atom.forEach(function (a, i) {
      g.add(S.atom(a[0], [pos[i].x, pos[i].y, pos[i].z], { skala: skala * 0.5, seg: 18 }));
    });
    (def.ikatan || []).forEach(function (b) {
      g.add(S.ikatan(pos[b[0]], pos[b[1]], { orde: b[2] || 1, tebal: 0.05 * skala }));
    });
    return g;
  }

  function pasang(s) {
    const h = hukum(s);
    const w = s.data.w;
    while (w.children.length) { const c = w.children.pop(); S.buangObjek(c); }
    const o = { kiri: [], kanan: [], batangKiri: [], jarum: null };
    s.data.o = o;
    s.data.t = 0;
    s.data.arah = 0;

    const sk = s.get('skala');
    const lebih = s.get('lebih');

    function taruh(def, n, x0, x1, y, daftar, sisa) {
      for (let i = 0; i < n; i++) {
        const g = molekulKecil(DEF[def], 1);
        const kol = Math.ceil(Math.sqrt(n));
        const bx = (i % kol - (kol - 1) / 2) * 0.72;
        const bz = (Math.floor(i / kol) - (kol - 1) / 2) * 0.72;
        g.position.set(S.lerp(x0, x1, 0.5) + bx, y, bz);
        g.userData = { y: y, f: i * 1.3, sisa: !!sisa };
        w.add(g);
        daftar.push(g);
      }
    }

    if (h.id === 'lavoisier' || h.id === 'gaylussac') {
      const n1 = h.id === 'lavoisier' ? 2 : 1;
      const n2 = h.id === 'lavoisier' ? 1 : 3;
      const n3 = 2;
      const m1 = h.id === 'lavoisier' ? 'H2' : 'N2';
      const m2 = h.id === 'lavoisier' ? 'O2' : 'H2';
      const m3 = h.id === 'lavoisier' ? 'H2O' : 'NH3';
      const k = Math.max(1, Math.round(sk * 2));
      taruh(m1, n1 * k, -4.4, -4.4, 1.6, o.kiri);
      taruh(m2, n2 * k, -1.9, -1.9, 1.6, o.kiri);
      taruh(m3, n3 * k, 2.6, 2.6, 1.6, o.kanan);
      w.add(tandaTambah(-3.15, 1.6));
      w.add(tandaPanah(0.4, 1.6));

      if (h.id === 'gaylussac' && s.get('tabung')) {
        [[-4.4, n1 * k, 0x7fe3d6], [-1.9, n2 * k, 0xf0c04a], [2.6, n3 * k, 0x9fe8ad]]
          .forEach(function (x) {
            const tinggi = x[1] * 0.42;
            const tab = new T.Mesh(new T.CylinderGeometry(0.72, 0.72, 4, 36, 1, true),
              S.matKaca({ opacity: 0.12 }));
            tab.position.set(x[0], 2.0, 0);
            w.add(tab);
            const isi = new T.Mesh(new T.CylinderGeometry(0.68, 0.68, 1, 32),
              new T.MeshPhysicalMaterial({ color: x[2], roughness: 0.3, transmission: 0.5,
                thickness: 0.5, transparent: true, opacity: 0.3, emissive: x[2],
                emissiveIntensity: 0.12 }));
            isi.scale.y = tinggi;
            isi.position.set(x[0], tinggi / 2, 0);
            w.add(isi);
            const t = S.teks(S.fmt(x[1] / k, 0) + ' volume', { skala: 0.22, lebar: 10, warna: '#9aa8b4' });
            t.position.set(x[0], -0.45, 0);
            w.add(t);
          });
      }
    } else if (h.id === 'proust') {
      const nH = Math.max(1, Math.round(2 * sk * (1 + lebih)));
      const nO = Math.max(1, Math.round(sk * 1));
      const bereaksi = Math.min(nH, nO * 2);
      taruh('H2', nH, -4.2, -4.2, 1.6, o.kiri);
      // tandai kelebihan sebagai sisa
      o.kiri.slice(bereaksi).forEach(function (g) { g.userData.sisa = true; });
      taruh('O2', nO, -1.6, -1.6, 1.6, o.kiri);
      taruh('H2O', bereaksi, 2.6, 2.6, 1.6, o.kanan);
      w.add(tandaTambah(-2.9, 1.6));
      w.add(tandaPanah(0.5, 1.6));
    } else if (h.id === 'dalton') {
      taruh('CO', Math.max(1, Math.round(sk * 2)), -2.6, -2.6, 2.4, o.kanan);
      taruh('CO2', Math.max(1, Math.round(sk * 2)), 2.2, 2.2, 2.4, o.kanan);
      // batang massa O
      [[-2.6, 1, 0x4fd1c0, 'CO'], [2.2, 2, 0xf0a94a, 'CO₂']].forEach(function (x) {
        const b = new T.Mesh(new T.BoxGeometry(0.9, 1, 0.9),
          new T.MeshStandardMaterial({ color: x[2], roughness: 0.4,
            emissive: x[2], emissiveIntensity: 0.15 }));
        b.userData = { target: x[1] * 0.9 };
        b.scale.y = 0.01;
        b.position.set(x[0], 0, 0);
        w.add(b);
        o.batangKiri.push(b);
        const t = S.teks(x[3] + ' — ' + (x[1] === 1 ? '16' : '32') + ' g O', { skala: 0.24, lebar: 14, warna: '#9aa8b4' });
        t.position.set(x[0], -0.5, 0);
        w.add(t);
      });
    } else {
      // avogadro: tiga tabung berisi gas berbeda, jumlah molekul sama
      [['H2', -3.4, 0x7fe3d6], ['He', 0, 0xb795f0], ['CO2', 3.4, 0xf0a94a]].forEach(function (x) {
        const tab = new T.Mesh(new T.CylinderGeometry(1.0, 1.0, 3.2, 40, 1, true),
          S.matKaca({ opacity: 0.1 }));
        tab.position.set(x[1], 1.7, 0);
        w.add(tab);
        const n = Math.max(3, Math.round(6 * sk));
        for (let i = 0; i < n; i++) {
          const g = molekulKecil(DEF[x[0]], 0.8);
          g.position.set(x[1] + S.acak(-0.6, 0.6), 0.5 + Math.random() * 2.3, S.acak(-0.6, 0.6));
          g.userData = { y: g.position.y, f: i * 1.3, sisa: true };
          w.add(g);
          o.kiri.push(g);
        }
        const t = S.teks(x[0].replace('2', '₂') + ' — ' + n + ' molekul',
          { skala: 0.24, lebar: 16, warna: '#9aa8b4' });
        t.position.set(x[1], -0.2, 0);
        w.add(t);
      });
    }

    // neraca massa
    if (s.get('neraca') && (h.id === 'lavoisier' || h.id === 'proust')) {
      const n = new T.Group();
      const tiang = new T.Mesh(new T.CylinderGeometry(0.07, 0.09, 2.4, 16), S.matLogam(0x8a949e));
      tiang.position.y = 1.2;
      n.add(tiang);
      const lengan = new T.Mesh(new T.BoxGeometry(5.6, 0.1, 0.18), S.matLogam(0xc8ced4));
      lengan.position.y = 2.4;
      n.add(lengan);
      [-2.6, 2.6].forEach(function (x) {
        const tali = new T.Mesh(new T.CylinderGeometry(0.012, 0.012, 0.8, 8), S.matLogam(0x9aa4ae));
        tali.position.set(x, 2.0, 0);
        n.add(tali);
        const piring = new T.Mesh(new T.CylinderGeometry(1.0, 1.0, 0.07, 36), S.matLogam(0xc8ced4));
        piring.position.set(x, 1.6, 0);
        n.add(piring);
      });
      n.position.set(0, -1.9, -2.0);
      o.jarum = lengan;
      w.add(n);
      const t = S.teks('massa kiri = massa kanan', { skala: 0.24, lebar: 24, warna: '#9fe8ad' });
      t.position.set(0, 0.8, -2.0);
      w.add(t);
    }

    s.data.lbl.userData.ganti(h.n);
    s.data.pers.userData.ganti(h.pers);
    s.orbit.set({ jarak: h.id === 'avogadro' ? 12.5 : 11.5 });
  }

  function tandaTambah(x, y) {
    const t = S.teks('+', { skala: 0.5, latar: false, warna: '#9aa8b4' });
    t.position.set(x, y, 0);
    return t;
  }
  function tandaPanah(x, y) {
    const t = S.teks('→', { skala: 0.5, latar: false, warna: '#4fd1c0' });
    t.position.set(x, y, 0);
    return t;
  }
})());
