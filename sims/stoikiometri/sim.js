/* Konsep Mol dan Stoikiometri — Fase E — adegan 3D */

Sim3D.daftar('stoikiometri', (function () {
  'use strict';
  const T = THREE, S = S3;

  const REAKSI = [
    { n: '2H₂ + O₂ → 2H₂O',
      a: { s: 'H₂', koef: 2, mr: 2, def: 'H2', w: 0x7fe3d6 },
      b: { s: 'O₂', koef: 1, mr: 32, def: 'O2', w: 0xef6a52 },
      c: { s: 'H₂O', koef: 2, mr: 18, def: 'H2O', w: 0x5b9bf5 } },
    { n: 'N₂ + 3H₂ → 2NH₃',
      a: { s: 'N₂', koef: 1, mr: 28, def: 'N2', w: 0x5b9bf5 },
      b: { s: 'H₂', koef: 3, mr: 2, def: 'H2', w: 0x7fe3d6 },
      c: { s: 'NH₃', koef: 2, mr: 17, def: 'NH3', w: 0xb795f0 } },
    { n: 'C + O₂ → CO₂',
      a: { s: 'C', koef: 1, mr: 12, def: 'C', w: 0x3a4149 },
      b: { s: 'O₂', koef: 1, mr: 32, def: 'O2', w: 0xef6a52 },
      c: { s: 'CO₂', koef: 1, mr: 44, def: 'CO2', w: 0xf0a94a } },
    { n: '2Mg + O₂ → 2MgO',
      a: { s: 'Mg', koef: 2, mr: 24, def: 'Mg', w: 0x5fd06a },
      b: { s: 'O₂', koef: 1, mr: 32, def: 'O2', w: 0xef6a52 },
      c: { s: 'MgO', koef: 2, mr: 40, def: 'MgO', w: 0xe8e4da } }
  ];

  const DEF = {
    H2: { atom: [['H', -0.3, 0, 0], ['H', 0.3, 0, 0]], ikatan: [[0, 1, 1]] },
    O2: { atom: [['O', -0.36, 0, 0], ['O', 0.36, 0, 0]], ikatan: [[0, 1, 2]] },
    N2: { atom: [['N', -0.34, 0, 0], ['N', 0.34, 0, 0]], ikatan: [[0, 1, 3]] },
    H2O: { atom: [['O', 0, 0.08, 0], ['H', -0.48, -0.34, 0], ['H', 0.48, -0.34, 0]], ikatan: [[0, 1, 1], [0, 2, 1]] },
    NH3: { atom: [['N', 0, 0.1, 0], ['H', -0.44, -0.3, 0.18], ['H', 0.44, -0.3, 0.18], ['H', 0, -0.3, -0.48]],
      ikatan: [[0, 1, 1], [0, 2, 1], [0, 3, 1]] },
    CO2: { atom: [['C', 0, 0, 0], ['O', -0.66, 0, 0], ['O', 0.66, 0, 0]], ikatan: [[0, 1, 2], [0, 2, 2]] },
    C: { atom: [['C', 0, 0, 0]], ikatan: [] },
    Mg: { atom: [['Mg', 0, 0, 0]], ikatan: [] },
    MgO: { atom: [['Mg', -0.34, 0, 0], ['O', 0.34, 0, 0]], ikatan: [[0, 1, 1]] }
  };

  function reaksi(s) { return REAKSI[parseInt(s.get('r'), 10) || 0]; }

  function hitung(s) {
    const R = reaksi(s);
    const nA = s.get('molA'), nB = s.get('molB');
    const batasA = nA / R.a.koef;
    const batasB = nB / R.b.koef;
    const jalan = Math.min(batasA, batasB);      // berapa kali reaksi berjalan
    return {
      R: R, nA: nA, nB: nB, jalan: jalan,
      pakaiA: jalan * R.a.koef, pakaiB: jalan * R.b.koef,
      hasil: jalan * R.c.koef,
      sisaA: nA - jalan * R.a.koef, sisaB: nB - jalan * R.b.koef,
      pembatas: batasA < batasB - 1e-9 ? 'a' : batasB < batasA - 1e-9 ? 'b' : 'pas'
    };
  }

  return {
    latar: 0x080e14,
    kamera: { jarak: 12, phi: 1.04, theta: 0.5, targetY: 1.2, lajuPutar: 0.1 },

    kendali: [
      { judul: 'Reaksi', isi: [
        { type: 'select', id: 'r', value: 0, label: 'Persamaan',
          options: REAKSI.map(function (r, i) { return { value: i, label: r.n }; }) }
      ]},
      { judul: 'Jumlah pereaksi', isi: [
        { type: 'slider', id: 'molA', value: 4, min: 0, max: 12, step: 1,
          label: 'Mol pereaksi pertama', unit: ' mol', dec: 0 },
        { type: 'slider', id: 'molB', value: 2, min: 0, max: 12, step: 1,
          label: 'Mol pereaksi kedua', unit: ' mol', dec: 0 },
        { type: 'buttons', label: '', items: [
          { label: '⚖ Buat pas (stoikiometris)', utama: true, klik: function (s) {
            const R = reaksi(s);
            const k = Math.max(1, Math.floor(s.get('molA') / R.a.koef) || 2);
            s.set('molA', R.a.koef * k);
            s.set('molB', R.b.koef * k);
          } }
        ]}
      ]},
      { judul: 'Tampilan', isi: [
        { type: 'toggle', id: 'reaksikan', value: true, label: 'Tampilkan hasil reaksi' },
        { type: 'toggle', id: 'massa', value: true, label: 'Tampilkan bilah massa' },
        { type: 'toggle', id: 'sorotSisa', value: true, label: 'Soroti pereaksi sisa' }
      ]}
    ],

    baca: [
      { id: 'pembatas', label: 'Pereaksi pembatas', tone: 'aksen' },
      { id: 'pakai', label: 'Yang bereaksi' },
      { id: 'sisa', label: 'Yang tersisa' },
      { id: 'hasil', label: 'Hasil' },
      { id: 'massa', label: 'Massa total' }
    ],

    bangun: function (s) {
      s.tambah(S.lantai({ r: 11, warna: 0x0e151d }));
      s.data.w = new T.Group();
      s.tambah(s.data.w);

      const lbl = S.teks('', { skala: 0.42, lebar: 20, warna: '#7fe3d6' });
      lbl.position.set(0, 4.6, 0);
      s.data.lbl = lbl;
      s.tambah(lbl);

      pasang(s);
    },

    ubah: function (s) { pasang(s); },

    langkah: function (s, dt) {
      (s.data.unit || []).forEach(function (u, i) {
        u.position.y = u.userData.y + Math.sin(s.waktu * 1.3 + i * 0.7) * 0.05;
        u.rotation.y += dt * 0.5;
      });
      (s.data.batang || []).forEach(function (b) {
        b.scale.y = S.lerp(b.scale.y, b.userData.target, dt * 5);
        b.position.y = b.userData.dasar + b.scale.y / 2;
      });
    },

    bacaUbah: function (s) {
      const h = hitung(s);
      const R = h.R;
      s.baca('pembatas', h.jalan === 0 ? 'tidak ada reaksi'
        : h.pembatas === 'pas' ? 'pas — keduanya habis'
        : h.pembatas === 'a' ? R.a.s : R.b.s,
        h.pembatas === 'pas' ? 'aksen' : 'warn');
      s.baca('pakai', S.fmt(h.pakaiA, 0) + ' mol ' + R.a.s + ' + ' + S.fmt(h.pakaiB, 0) + ' mol ' + R.b.s);
      s.baca('sisa', (h.sisaA > 0.001 ? S.fmt(h.sisaA, 0) + ' mol ' + R.a.s : '') +
        (h.sisaA > 0.001 && h.sisaB > 0.001 ? ' , ' : '') +
        (h.sisaB > 0.001 ? S.fmt(h.sisaB, 0) + ' mol ' + R.b.s : '') ||
        'tidak ada', (h.sisaA > 0.001 || h.sisaB > 0.001) ? 'warn' : 'aksen');
      s.baca('hasil', S.fmt(h.hasil, 0) + ' mol ' + R.c.s + '  (' + S.fmt(h.hasil * R.c.mr, 0) + ' g)',
        h.hasil > 0 ? 'aksen' : null);
      const mKiri = h.nA * R.a.mr + h.nB * R.b.mr;
      const mKanan = h.hasil * R.c.mr + h.sisaA * R.a.mr + h.sisaB * R.b.mr;
      s.baca('massa', S.fmt(mKiri, 0) + ' g → ' + S.fmt(mKanan, 0) + ' g',
        Math.abs(mKiri - mKanan) < 0.5 ? 'aksen' : 'danger');
    }
  };

  function molekulKecil(def, skala) {
    const g = new T.Group();
    const d = DEF[def];
    const pos = d.atom.map(function (a) { return new T.Vector3(a[1], a[2], a[3] || 0); });
    d.atom.forEach(function (a, i) {
      g.add(S.atom(a[0], [pos[i].x, pos[i].y, pos[i].z], { skala: skala * 0.48, seg: 16 }));
    });
    (d.ikatan || []).forEach(function (b) {
      g.add(S.ikatan(pos[b[0]], pos[b[1]], { orde: b[2] || 1, tebal: 0.048 * skala }));
    });
    return g;
  }

  function pasang(s) {
    const h = hitung(s);
    const R = h.R;
    const w = s.data.w;
    while (w.children.length) { const c = w.children.pop(); S.buangObjek(c); }
    s.data.unit = [];
    s.data.batang = [];

    const tampilHasil = s.get('reaksikan');

    function kelompok(def, n, x, y, label, sisa) {
      for (let i = 0; i < n; i++) {
        const g = molekulKecil(def, 1);
        const kol = Math.max(1, Math.ceil(Math.sqrt(n)));
        g.position.set(
          x + (i % kol - (kol - 1) / 2) * 0.78,
          y + Math.floor(i / kol) * 0.72,
          (i % 2) * 0.3 - 0.15);
        g.userData = { y: g.position.y };
        if (sisa && s.get('sorotSisa')) {
          g.traverse(function (m) {
            if (m.isMesh && m.material) {
              m.material = m.material.clone();
              m.material.emissive = new T.Color(0xf0c04a);
              m.material.emissiveIntensity = 0.35;
            }
          });
        }
        w.add(g);
        s.data.unit.push(g);
      }
      if (label) {
        const t = S.teks(label, { skala: 0.25, lebar: 14, warna: sisa ? '#f0c88a' : '#9aa8b4' });
        t.position.set(x, y - 0.85, 0);
        w.add(t);
      }
    }

    const nA = Math.round(h.nA), nB = Math.round(h.nB);
    const pakaiA = Math.round(h.pakaiA), pakaiB = Math.round(h.pakaiB);

    if (tampilHasil) {
      kelompok(R.a.def, Math.round(h.sisaA), -5.2, 1.5,
        h.sisaA > 0.001 ? R.a.s + ' sisa: ' + S.fmt(h.sisaA, 0) + ' mol' : '', true);
      kelompok(R.b.def, Math.round(h.sisaB), -2.6, 1.5,
        h.sisaB > 0.001 ? R.b.s + ' sisa: ' + S.fmt(h.sisaB, 0) + ' mol' : '', true);
      kelompok(R.c.def, Math.round(h.hasil), 3.0, 1.5,
        R.c.s + ': ' + S.fmt(h.hasil, 0) + ' mol');
      const t = S.teks('→', { skala: 0.5, latar: false, warna: '#4fd1c0' });
      t.position.set(0.3, 1.9, 0);
      w.add(t);
      const t2 = S.teks('sesudah reaksi', { skala: 0.26, lebar: 16, warna: '#7fe3d6' });
      t2.position.set(0.3, 3.9, 0);
      w.add(t2);
    } else {
      kelompok(R.a.def, nA, -3.4, 1.5, R.a.s + ': ' + nA + ' mol');
      kelompok(R.b.def, nB, 1.4, 1.5, R.b.s + ': ' + nB + ' mol');
      const t = S.teks('+', { skala: 0.5, latar: false, warna: '#9aa8b4' });
      t.position.set(-1.0, 1.9, 0);
      w.add(t);
      const t2 = S.teks('sebelum reaksi', { skala: 0.26, lebar: 16, warna: '#9aa8b4' });
      t2.position.set(-1.0, 3.9, 0);
      w.add(t2);
    }

    /* bilah massa */
    if (s.get('massa')) {
      const data = [
        [R.a.s, h.nA * R.a.mr, R.a.w, -4.0],
        [R.b.s, h.nB * R.b.mr, R.b.w, -2.2],
        [R.c.s, h.hasil * R.c.mr, R.c.w, 1.6],
        ['sisa', h.sisaA * R.a.mr + h.sisaB * R.b.mr, 0xf0c04a, 3.4]
      ];
      const maks = Math.max.apply(null, data.map(function (d) { return d[1]; }).concat([1]));
      data.forEach(function (d) {
        const b = new T.Mesh(new T.BoxGeometry(0.7, 1, 0.7),
          new T.MeshStandardMaterial({ color: d[2], roughness: 0.4,
            emissive: d[2], emissiveIntensity: 0.14 }));
        b.userData = { target: Math.max(0.02, d[1] / maks * 2.2), dasar: -2.8 };
        b.scale.y = 0.02;
        b.position.set(d[3], -2.8, -2.4);
        w.add(b);
        s.data.batang.push(b);
        const t = S.teks(d[0] + '  ' + S.fmt(d[1], 0) + ' g', { skala: 0.21, lebar: 12, warna: '#9aa8b4' });
        t.position.set(d[3], -3.15, -2.4);
        w.add(t);
      });
      const t = S.teks('massa (gram)', { skala: 0.24, lebar: 14, warna: '#7fe3d6' });
      t.position.set(-0.3, 0.2, -2.4);
      w.add(t);
    }

    s.data.lbl.userData.ganti(R.n);
  }
})());
