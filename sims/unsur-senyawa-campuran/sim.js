/* Unsur, Senyawa, dan Campuran — Fase D — adegan 3D */

Sim3D.daftar('unsur-senyawa-campuran', (function () {
  'use strict';
  const T = THREE, S = S3;

  const ZAT = [
    { n: 'Gas oksigen (O₂)', jenis: 'unsur', pola: [{ a: ['O', 'O'], n: 34 }],
      ket: 'Satu jenis atom saja' },
    { n: 'Logam tembaga (Cu)', jenis: 'unsur', pola: [{ a: ['Cu'], n: 44 }],
      ket: 'Atom sejenis tersusun rapat' },
    { n: 'Gas helium (He)', jenis: 'unsur', pola: [{ a: ['He'], n: 40 }],
      ket: 'Atom tunggal, tidak berikatan' },
    { n: 'Air (H₂O)', jenis: 'senyawa', pola: [{ a: ['O', 'H', 'H'], n: 30 }],
      ket: 'Perbandingan atom selalu tetap 2 : 1' },
    { n: 'Karbon dioksida (CO₂)', jenis: 'senyawa', pola: [{ a: ['C', 'O', 'O'], n: 28 }],
      ket: 'Satu karbon mengikat dua oksigen' },
    { n: 'Garam dapur (NaCl)', jenis: 'senyawa', pola: [{ a: ['Na', 'Cl'], n: 34 }],
      ket: 'Ion positif dan negatif berpasangan' },
    { n: 'Udara', jenis: 'campuran', pola: [
        { a: ['N', 'N'], n: 26 }, { a: ['O', 'O'], n: 8 }, { a: ['Ar'], n: 3 }],
      ket: 'Beberapa zat bercampur, perbandingan bisa berubah' },
    { n: 'Air garam', jenis: 'campuran', pola: [
        { a: ['O', 'H', 'H'], n: 24 }, { a: ['Na'], n: 6 }, { a: ['Cl'], n: 6 }],
      ket: 'Dua zat berbeda, masih bisa dipisahkan' },
    { n: 'Kuningan (Cu + Zn)', jenis: 'campuran', pola: [
        { a: ['Cu'], n: 30 }, { a: ['Zn'], n: 14 }],
      ket: 'Campuran logam — perbandingan dapat diatur' }
  ];

  const JENIS = {
    unsur: { n: 'Unsur', w: 'aksen', nada: 0x4fd1c0,
      ciri: ['Hanya satu jenis atom', 'Tidak bisa diuraikan lagi'] },
    senyawa: { n: 'Senyawa', w: 'warn', nada: 0xf0a94a,
      ciri: ['Dua jenis atom atau lebih, terikat', 'Perbandingan selalu tetap',
        'Sifatnya berbeda dari penyusunnya'] },
    campuran: { n: 'Campuran', w: 'danger', nada: 0xef6a52,
      ciri: ['Beberapa zat, tidak terikat kimia', 'Perbandingan dapat berubah',
        'Masih bisa dipisahkan secara fisika'] }
  };

  function zat(s) { return ZAT[parseInt(s.get('z'), 10) || 0]; }

  return {
    latar: 0x080e14,
    kamera: { jarak: 8.8, phi: 1.12, theta: 0.58, targetY: 0.3, lajuPutar: 0.14 },

    kendali: [
      { judul: 'Zat', isi: [
        { type: 'select', id: 'z', value: 3, label: 'Zat yang diamati',
          options: ZAT.map(function (z, i) { return { value: i, label: z.n }; }) }
      ]},
      { judul: 'Tampilan', isi: [
        { type: 'toggle', id: 'wadah', value: true, label: 'Tampilkan wadah kaca' },
        { type: 'toggle', id: 'gerak', value: true, label: 'Partikel bergerak' },
        { type: 'toggle', id: 'sorot', value: false, label: 'Soroti satu partikel' },
        { type: 'slider', id: 'laju', value: 1, min: 0.1, max: 3, step: 0.1,
          label: 'Kecepatan gerak', unit: '×', dec: 1 },
        { type: 'slider', id: 'besar', value: 1, min: 0.6, max: 1.6, step: 0.05,
          label: 'Ukuran partikel', unit: '×', dec: 2 }
      ]},
      { judul: 'Tebak dulu', isi: [
        { type: 'segment', id: 'tebak', value: 'belum', label: 'Menurutmu ini…', options: [
          { value: 'belum', label: 'Belum' }, { value: 'unsur', label: 'Unsur' },
          { value: 'senyawa', label: 'Senyawa' }, { value: 'campuran', label: 'Campuran' }
        ]}
      ]}
    ],

    baca: [
      { id: 'jenis', label: 'Golongan', tone: 'aksen' },
      { id: 'tebak', label: 'Tebakanmu' },
      { id: 'partikel', label: 'Jenis partikel' },
      { id: 'unsurN', label: 'Jenis atom' },
      { id: 'ciri', label: 'Ciri utama' }
    ],

    bangun: function (s) {
      s.tambah(S.lantai({ r: 8, y: -2.6, warna: 0x0e151d }));

      const geo = new T.BoxGeometry(4.2, 4.2, 4.2);
      const kaca = new T.Mesh(geo, S.matKaca({ opacity: 0.08 }));
      kaca.renderOrder = 3;
      s.data.kaca = kaca;
      s.tambah(kaca);
      const rangka = new T.LineSegments(new T.EdgesGeometry(geo),
        new T.LineBasicMaterial({ color: 0x4fd1c0, transparent: true, opacity: 0.32 }));
      s.data.rangka = rangka;
      s.tambah(rangka);

      s.data.wadahP = new T.Group();
      s.tambah(s.data.wadahP);

      const lbl = S.teks('', { skala: 0.42, lebar: 20, warna: '#d8e4ec' });
      lbl.position.set(0, 3.1, 0);
      s.data.lbl = lbl;
      s.tambah(lbl);

      pasang(s);
    },

    ubah: function (s, id) {
      if (id === 'z') s.setDiam('tebak', 'belum');
      if (id === 'wadah') { s.data.kaca.visible = s.get('wadah'); s.data.rangka.visible = s.get('wadah'); }
      if (id === 'z' || id === 'besar') pasang(s);
      if (id === 'sorot') sorotkan(s);
    },

    langkah: function (s, dt) {
      if (!s.get('gerak')) return;
      const laju = s.get('laju');
      const L = 2.1;
      (s.data.unit || []).forEach(function (u) {
        u.g.position.addScaledVector(u.v, dt * laju);
        ['x', 'y', 'z'].forEach(function (a) {
          const b = L - u.r;
          if (u.g.position[a] > b) { u.g.position[a] = b; u.v[a] *= -1; }
          if (u.g.position[a] < -b) { u.g.position[a] = -b; u.v[a] *= -1; }
        });
        u.g.rotation.x += u.w.x * dt * laju;
        u.g.rotation.y += u.w.y * dt * laju;
        u.g.rotation.z += u.w.z * dt * laju;
      });
    },

    bacaUbah: function (s) {
      const z = zat(s);
      const j = JENIS[z.jenis];
      const tebak = s.get('tebak');
      const buka = tebak !== 'belum';
      s.baca('jenis', buka ? j.n : 'tebak dulu di panel', buka ? j.w : null);
      s.baca('tebak', tebak === 'belum' ? '—'
        : buka ? (tebak === z.jenis ? JENIS[tebak].n + ' — tepat ✓' : JENIS[tebak].n + ' — belum tepat') : tebak,
        buka ? (tebak === z.jenis ? 'aksen' : 'danger') : null);
      const satuan = z.pola.length > 1 ? z.pola.length + ' macam'
        : z.pola[0].a.length > 1 ? 'molekul ' + z.pola[0].a.length + ' atom' : 'atom tunggal';
      s.baca('partikel', satuan);
      const u = {};
      z.pola.forEach(function (p) { p.a.forEach(function (a) { u[a] = 1; }); });
      s.baca('unsurN', Object.keys(u).length + ' (' + Object.keys(u).join(', ') + ')');
      s.baca('ciri', buka ? j.ciri[0] : '—');
    }
  };

  function sorotkan(s) {
    const on = s.get('sorot');
    (s.data.unit || []).forEach(function (u, i) {
      u.g.traverse(function (m) {
        if (!m.material || !m.material.opacity === undefined) return;
        if (m.isMesh && m.material.transparent !== undefined) {
          m.material.transparent = on && i !== 0;
          m.material.opacity = on && i !== 0 ? 0.16 : 1;
          m.material.depthWrite = !(on && i !== 0);
        }
      });
    });
  }

  function pasang(s) {
    const z = zat(s);
    const w = s.data.wadahP;
    while (w.children.length) { const c = w.children.pop(); S.buangObjek(c); }
    s.data.unit = [];
    const besar = s.get('besar');

    z.pola.forEach(function (pola) {
      for (let k = 0; k < pola.n; k++) {
        const g = new T.Group();
        const n = pola.a.length;
        let r = 0.2;
        if (n === 1) {
          const m = S.atom(pola.a[0], null, { skala: besar * 0.62, seg: 20 });
          g.add(m);
          r = (S.UNSUR[pola.a[0]] || S.UNSUR.X).r * besar * 0.62;
        } else if (n === 2) {
          const d = 0.3 * besar;
          const a = S.atom(pola.a[0], [-d, 0, 0], { skala: besar * 0.5, seg: 18 });
          const b = S.atom(pola.a[1], [d, 0, 0], { skala: besar * 0.5, seg: 18 });
          g.add(a, b, S.ikatan([-d, 0, 0], [d, 0, 0], { tebal: 0.05 * besar }));
          r = d + 0.28 * besar;
        } else {
          // tiga atom: bentuk V atau linear
          const linear = pola.a[0] === 'C';
          const d = 0.34 * besar;
          const pusat = S.atom(pola.a[0], [0, 0, 0], { skala: besar * 0.5, seg: 18 });
          g.add(pusat);
          [1, 2].forEach(function (i) {
            const a = linear ? (i === 1 ? Math.PI : 0) : (i === 1 ? Math.PI * 0.72 : Math.PI * 0.28);
            const pos = [Math.cos(a) * d, Math.sin(a) * d * (linear ? 0 : 1) - (linear ? 0 : 0.1), 0];
            g.add(S.atom(pola.a[i], pos, { skala: besar * 0.38, seg: 16 }));
            g.add(S.ikatan([0, 0, 0], pos, { tebal: 0.045 * besar, orde: linear ? 2 : 1 }));
          });
          r = d + 0.24 * besar;
        }
        g.position.set(S.acak(-1.8, 1.8), S.acak(-1.8, 1.8), S.acak(-1.8, 1.8));
        g.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
        w.add(g);
        s.data.unit.push({
          g: g, r: r,
          v: new T.Vector3(S.acak(-1, 1), S.acak(-1, 1), S.acak(-1, 1)).normalize().multiplyScalar(S.acak(0.3, 0.8)),
          w: new T.Vector3(S.acak(-1, 1), S.acak(-1, 1), S.acak(-1, 1))
        });
      }
    });

    s.data.kaca.visible = s.get('wadah');
    s.data.rangka.visible = s.get('wadah');
    s.data.lbl.userData.ganti(z.n);
    sorotkan(s);
  }
})());
