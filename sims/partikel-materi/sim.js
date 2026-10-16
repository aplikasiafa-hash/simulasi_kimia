/* Partikel Materi: Atom, Molekul, dan Ion — Fase D — adegan 3D */

Sim3D.daftar('partikel-materi', (function () {
  'use strict';
  const T = THREE, S = S3;

  const CONTOH = [
    { n: 'Atom besi (Fe)', jenis: 'atom',
      atom: [['Fe', 0, 0, 0]], ikatan: [], ket: 'Satu atom berdiri sendiri' },
    { n: 'Atom helium (He)', jenis: 'atom',
      atom: [['He', 0, 0, 0]], ikatan: [], ket: 'Gas mulia, tidak berikatan' },
    { n: 'Molekul unsur O₂', jenis: 'molekul-unsur',
      atom: [['O', -0.6, 0, 0], ['O', 0.6, 0, 0]], ikatan: [[0, 1, 2]],
      ket: 'Dua atom sejenis' },
    { n: 'Molekul unsur N₂', jenis: 'molekul-unsur',
      atom: [['N', -0.55, 0, 0], ['N', 0.55, 0, 0]], ikatan: [[0, 1, 3]],
      ket: 'Ikatan rangkap tiga' },
    { n: 'Molekul senyawa H₂O', jenis: 'molekul-senyawa',
      atom: [['O', 0, 0.12, 0], ['H', -0.78, -0.58, 0], ['H', 0.78, -0.58, 0]],
      ikatan: [[0, 1, 1], [0, 2, 1]], ket: 'Dua jenis atom berbeda' },
    { n: 'Molekul senyawa CO₂', jenis: 'molekul-senyawa',
      atom: [['C', 0, 0, 0], ['O', -1.16, 0, 0], ['O', 1.16, 0, 0]],
      ikatan: [[0, 1, 2], [0, 2, 2]], ket: 'Linear, dua ikatan rangkap' },
    { n: 'Molekul senyawa CH₄', jenis: 'molekul-senyawa',
      atom: [['C', 0, 0, 0], ['H', 0.63, 0.63, 0.63], ['H', -0.63, -0.63, 0.63],
             ['H', -0.63, 0.63, -0.63], ['H', 0.63, -0.63, -0.63]],
      ikatan: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]], ket: 'Bentuk tetrahedron' },
    { n: 'Ion natrium Na⁺', jenis: 'ion',
      atom: [['Na', 0, 0, 0]], ikatan: [], muatan: 1, ket: 'Atom yang melepas 1 elektron' },
    { n: 'Ion klorida Cl⁻', jenis: 'ion',
      atom: [['Cl', 0, 0, 0]], ikatan: [], muatan: -1, ket: 'Atom yang menerima 1 elektron' },
    { n: 'Kisi ion NaCl', jenis: 'kisi', ket: 'Ion tersusun berselang-seling' }
  ];

  const JENIS = {
    'atom': { n: 'Atom', w: 'aksen', ket: 'Bagian terkecil suatu unsur' },
    'molekul-unsur': { n: 'Molekul unsur', w: 'biru', ket: 'Gabungan atom SEJENIS' },
    'molekul-senyawa': { n: 'Molekul senyawa', w: 'warn', ket: 'Gabungan atom BERBEDA jenis' },
    'ion': { n: 'Ion', w: 'danger', ket: 'Atom atau gugus yang bermuatan listrik' },
    'kisi': { n: 'Senyawa ion', w: 'danger', ket: 'Kisi raksasa ion positif dan negatif' }
  };

  function contoh(s) { return CONTOH[parseInt(s.get('c'), 10) || 0]; }

  return {
    latar: 0x080e14,
    kamera: { jarak: 6.6, phi: 1.2, theta: 0.6, targetY: 0.1, lajuPutar: 0.26 },

    kendali: [
      { judul: 'Partikel', isi: [
        { type: 'select', id: 'c', value: 4, label: 'Contoh partikel',
          options: CONTOH.map(function (c, i) { return { value: i, label: c.n }; }) }
      ]},
      { judul: 'Tampilan', isi: [
        { type: 'segment', id: 'gaya', value: 'bola', label: 'Gaya gambar', options: [
          { value: 'bola', label: 'Bola' },
          { value: 'tongkat', label: 'Bola-tongkat' },
          { value: 'kerangka', label: 'Kerangka' }
        ]},
        { type: 'toggle', id: 'label', value: true, label: 'Tampilkan lambang atom' },
        { type: 'toggle', id: 'getar', value: true, label: 'Partikel bergetar' },
        { type: 'slider', id: 'besar', value: 1, min: 0.5, max: 1.8, step: 0.05,
          label: 'Ukuran atom', unit: '×', dec: 2 }
      ]},
      { judul: 'Kisi NaCl', isi: [
        { type: 'slider', id: 'kisi', value: 3, min: 2, max: 5, step: 1,
          label: 'Ukuran kisi', unit: '³ ion', dec: 0 },
        { type: 'toggle', id: 'potong', value: false, label: 'Belah kisi agar terlihat dalamnya' }
      ]}
    ],

    baca: [
      { id: 'jenis', label: 'Golongan', tone: 'aksen' },
      { id: 'arti', label: 'Artinya' },
      { id: 'atom', label: 'Jumlah atom' },
      { id: 'unsur', label: 'Jenis unsur' }
    ],

    bangun: function (s) {
      s.data.wadah = new T.Group();
      s.tambah(s.data.wadah);

      const lbl = S.teks('', { skala: 0.42, lebar: 20, warna: '#d8e4ec' });
      lbl.position.set(0, 2.9, 0);
      s.data.lbl = lbl;
      s.tambah(lbl);

      pasang(s);
    },

    ubah: function (s) { pasang(s); },

    langkah: function (s, dt) {
      const w = s.data.wadah;
      if (!s.get('getar')) return;
      const c = contoh(s);
      if (c.jenis === 'kisi') {
        (s.data.ion || []).forEach(function (m, i) {
          m.position.copy(m.userData.asal).add(new T.Vector3(
            Math.sin(s.waktu * 7 + i * 1.7) * 0.018,
            Math.sin(s.waktu * 8 + i * 2.3) * 0.018,
            Math.cos(s.waktu * 7.5 + i) * 0.018));
        });
      } else {
        (s.data.bola || []).forEach(function (m, i) {
          m.position.copy(m.userData.asal).add(new T.Vector3(
            Math.sin(s.waktu * 9 + i * 1.9) * 0.022,
            Math.sin(s.waktu * 10 + i * 2.6) * 0.022,
            Math.cos(s.waktu * 9.5 + i * 1.3) * 0.022));
        });
        (s.data.ik || []).forEach(function (b) {
          b.userData.perbarui(b.userData.a.position, b.userData.b.position);
        });
      }
    },

    bacaUbah: function (s) {
      const c = contoh(s);
      const j = JENIS[c.jenis];
      s.baca('jenis', j.n, j.w);
      s.baca('arti', j.ket);
      if (c.jenis === 'kisi') {
        const n = Math.round(s.get('kisi'));
        s.baca('atom', n * n * n + ' ion');
        s.baca('unsur', '2 (Na dan Cl)');
      } else {
        s.baca('atom', c.atom.length + ' atom');
        const u = {};
        c.atom.forEach(function (a) { u[a[0]] = 1; });
        const d = Object.keys(u);
        s.baca('unsur', d.length + ' (' + d.join(', ') + ')');
      }
    }
  };

  function pasang(s) {
    const c = contoh(s);
    const w = s.data.wadah;
    while (w.children.length) { const x = w.children.pop(); S.buangObjek(x); }
    s.data.bola = []; s.data.ik = []; s.data.ion = [];

    const gaya = s.get('gaya');
    const besar = s.get('besar');
    const skalaAtom = gaya === 'bola' ? besar : gaya === 'tongkat' ? besar * 0.42 : besar * 0.16;

    if (c.jenis === 'kisi') {
      const n = Math.round(s.get('kisi'));
      const jarak = 1.05 * besar;
      for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) for (let z = 0; z < n; z++) {
        if (s.get('potong') && x + y + z > n) continue;
        const na = (x + y + z) % 2 === 0;
        const m = S.atom(na ? 'Na' : 'Cl', null, { skala: (na ? 0.62 : 0.95) * besar * 0.85 });
        m.position.set(
          (x - (n - 1) / 2) * jarak,
          (y - (n - 1) / 2) * jarak,
          (z - (n - 1) / 2) * jarak);
        m.userData.asal = m.position.clone();
        w.add(m);
        s.data.ion.push(m);
        if (s.get('label')) {
          const t = S.teks(na ? 'Na⁺' : 'Cl⁻', { skala: 0.2, latar: false,
            warna: na ? '#c9a8f0' : '#9fe8ad', depthTest: false });
          t.position.copy(m.position);
          t.renderOrder = 10;
          w.add(t);
        }
      }
      // garis kisi
      const kisiGeo = new T.BoxGeometry(jarak * (n - 1), jarak * (n - 1), jarak * (n - 1));
      const rangka = new T.LineSegments(new T.EdgesGeometry(kisiGeo),
        new T.LineBasicMaterial({ color: 0x4fd1c0, transparent: true, opacity: 0.22 }));
      w.add(rangka);
      kisiGeo.dispose();
      s.orbit.set({ jarak: 3.2 + n * 1.5 });
    } else {
      const pos = c.atom.map(function (a) { return new T.Vector3(a[1], a[2], a[3] || 0); });
      c.atom.forEach(function (a, i) {
        const m = S.atom(a[0], null, { skala: skalaAtom });
        m.position.copy(pos[i]);
        m.userData.asal = pos[i].clone();
        w.add(m);
        s.data.bola.push(m);
        if (s.get('label')) {
          const u = S.UNSUR[a[0]] || S.UNSUR.X;
          const warna = new T.Color(u.w);
          const terang = (0.299 * warna.r + 0.587 * warna.g + 0.114 * warna.b) > 0.55;
          const t = S.teks(a[0] + (c.muatan ? (c.muatan > 0 ? '⁺' : '⁻') : ''),
            { skala: 0.26, latar: false, warna: terang ? '#12181d' : '#ffffff', depthTest: false });
          t.position.copy(pos[i]);
          t.renderOrder = 10;
          w.add(t);
        }
      });
      (c.ikatan || []).forEach(function (b) {
        const g = S.ikatan(pos[b[0]], pos[b[1]], {
          orde: b[2], tebal: gaya === 'kerangka' ? 0.055 : 0.085
        });
        g.userData.a = s.data.bola[b[0]];
        g.userData.b = s.data.bola[b[1]];
        w.add(g);
        s.data.ik.push(g);
      });

      // awan muatan untuk ion
      if (c.muatan) {
        const aura = new T.Mesh(new T.SphereGeometry(1, 36, 24),
          new T.MeshBasicMaterial({
            color: c.muatan > 0 ? 0xef6a52 : 0x5b9bf5,
            transparent: true, opacity: 0.12, side: T.BackSide
          }));
        aura.scale.setScalar((S.UNSUR[c.atom[0][0]] || S.UNSUR.X).r * skalaAtom * 2.1);
        w.add(aura);
      }
      s.orbit.set({ jarak: c.atom.length > 3 ? 6.4 : 5.2 });
    }

    s.data.lbl.userData.ganti(c.n);
  }
})());
