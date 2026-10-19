/* Reaksi Reduksi–Oksidasi — Fase E — adegan 3D */

Sim3D.daftar('redoks', (function () {
  'use strict';
  const T = THREE, S = S3;

  /* ---------- senyawa untuk penelusuran bilangan oksidasi ---------- */
  const SENYAWA = [
    { n: 'H₂O', atom: [['O', 0, 0, 0, -2], ['H', 0.76, 0.59, 0, 1], ['H', -0.76, 0.59, 0, 1]],
      ikatan: [[0, 1, 1], [0, 2, 1]] },
    { n: 'H₂O₂', atom: [['O', -0.74, 0.06, 0, -1], ['O', 0.74, -0.06, 0, -1],
      ['H', -0.95, 0.55, 0.72, 1], ['H', 0.95, -0.55, 0.72, 1]],
      ikatan: [[0, 1, 1], [0, 2, 1], [1, 3, 1]] },
    { n: 'NH₃', atom: [['N', 0, 0.2, 0, -3], ['H', 0.94, -0.26, 0, 1],
      ['H', -0.47, -0.26, 0.81, 1], ['H', -0.47, -0.26, -0.81, 1]],
      ikatan: [[0, 1, 1], [0, 2, 1], [0, 3, 1]] },
    { n: 'CH₄', atom: [['C', 0, 0, 0, -4], ['H', 0.63, 0.63, 0.63, 1], ['H', -0.63, -0.63, 0.63, 1],
      ['H', 0.63, -0.63, -0.63, 1], ['H', -0.63, 0.63, -0.63, 1]],
      ikatan: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]] },
    { n: 'CO₂', atom: [['C', 0, 0, 0, 4], ['O', -1.16, 0, 0, -2], ['O', 1.16, 0, 0, -2]],
      ikatan: [[0, 1, 2], [0, 2, 2]] },
    { n: 'NaCl', atom: [['Na', -1.1, 0, 0, 1], ['Cl', 1.1, 0, 0, -1]], ikatan: [[0, 1, 1]] },
    { n: 'H₂SO₄', atom: [['S', 0, 0, 0, 6], ['O', 0, 1.3, 0, -2], ['O', 0, -1.3, 0, -2],
      ['O', 1.25, 0, 0.5, -2], ['O', -1.25, 0, 0.5, -2],
      ['H', 1.95, 0.5, 0.9, 1], ['H', -1.95, 0.5, 0.9, 1]],
      ikatan: [[0, 1, 2], [0, 2, 2], [0, 3, 1], [0, 4, 1], [3, 5, 1], [4, 6, 1]] },
    { n: 'HNO₃', atom: [['N', 0, 0, 0, 5], ['O', 0, 1.22, 0, -2], ['O', 1.14, -0.56, 0, -2],
      ['O', -1.14, -0.56, 0, -2], ['H', -1.85, 0.1, 0, 1]],
      ikatan: [[0, 1, 2], [0, 2, 1], [0, 3, 1], [3, 4, 1]] },
    { n: 'KMnO₄', atom: [['Mn', 0, 0, 0, 7], ['O', 0, 1.35, 0, -2], ['O', 1.27, -0.45, 0, -2],
      ['O', -0.64, -0.45, 1.1, -2], ['O', -0.64, -0.45, -1.1, -2], ['K', 0, -2.1, 0, 1]],
      ikatan: [[0, 1, 2], [0, 2, 2], [0, 3, 2], [0, 4, 2]] },
    { n: 'K₂Cr₂O₇', atom: [['Cr', -1.0, 0, 0, 6], ['Cr', 1.0, 0, 0, 6], ['O', 0, 0.45, 0, -2],
      ['O', -1.6, 1.2, 0, -2], ['O', -1.6, -0.75, 0.9, -2], ['O', -1.6, -0.75, -0.9, -2],
      ['O', 1.6, 1.2, 0, -2], ['O', 1.6, -0.75, 0.9, -2], ['O', 1.6, -0.75, -0.9, -2],
      ['K', -2.4, 1.9, 1.2, 1], ['K', 2.4, 1.9, 1.2, 1]],
      ikatan: [[0, 2, 1], [1, 2, 1], [0, 3, 2], [0, 4, 1], [0, 5, 1], [1, 6, 2], [1, 7, 1], [1, 8, 1]] },
    { n: 'Fe₂O₃', atom: [['Fe', -1.15, 0, 0, 3], ['Fe', 1.15, 0, 0, 3], ['O', 0, 0, 0, -2],
      ['O', -1.9, 1.1, 0, -2], ['O', 1.9, 1.1, 0, -2]],
      ikatan: [[0, 2, 1], [1, 2, 1], [0, 3, 1], [1, 4, 1]] },
    { n: 'O₂ (unsur bebas)', atom: [['O', -0.6, 0, 0, 0], ['O', 0.6, 0, 0, 0]], ikatan: [[0, 1, 2]] }
  ];

  /* ---------- reaksi redoks ---------- */
  const REAKSI = [
    { n: 'Zn + Cu²⁺ → Zn²⁺ + Cu',
      red: { s: 'Zn', a: 0, b: 2, nama: 'Zn' }, oks: { s: 'Cu', a: 2, b: 0, nama: 'Cu²⁺' },
      e: 2, setara: 'Zn + Cu²⁺ → Zn²⁺ + Cu',
      oksidator: 'Cu²⁺', reduktor: 'Zn' },
    { n: '2Na + Cl₂ → 2NaCl',
      red: { s: 'Na', a: 0, b: 1, nama: 'Na' }, oks: { s: 'Cl', a: 0, b: -1, nama: 'Cl₂' },
      e: 2, setara: '2Na + Cl₂ → 2NaCl',
      oksidator: 'Cl₂', reduktor: 'Na' },
    { n: 'Mg + 2HCl → MgCl₂ + H₂',
      red: { s: 'Mg', a: 0, b: 2, nama: 'Mg' }, oks: { s: 'H', a: 1, b: 0, nama: 'H⁺' },
      e: 2, setara: 'Mg + 2HCl → MgCl₂ + H₂',
      oksidator: 'HCl', reduktor: 'Mg' },
    { n: 'Fe + S → FeS',
      red: { s: 'Fe', a: 0, b: 2, nama: 'Fe' }, oks: { s: 'S', a: 0, b: -2, nama: 'S' },
      e: 2, setara: 'Fe + S → FeS',
      oksidator: 'S', reduktor: 'Fe' },
    { n: '4Fe + 3O₂ → 2Fe₂O₃ (perkaratan)',
      red: { s: 'Fe', a: 0, b: 3, nama: 'Fe' }, oks: { s: 'O', a: 0, b: -2, nama: 'O₂' },
      e: 12, setara: '4Fe + 3O₂ → 2Fe₂O₃',
      oksidator: 'O₂', reduktor: 'Fe' },
    { n: 'CH₄ + 2O₂ → CO₂ + 2H₂O',
      red: { s: 'C', a: -4, b: 4, nama: 'CH₄' }, oks: { s: 'O', a: 0, b: -2, nama: 'O₂' },
      e: 8, setara: 'CH₄ + 2O₂ → CO₂ + 2H₂O',
      oksidator: 'O₂', reduktor: 'CH₄' },
    { n: 'Cl₂ + H₂O → HCl + HClO (disproporsionasi)',
      red: { s: 'Cl', a: 0, b: 1, nama: 'Cl₂ → HClO' }, oks: { s: 'Cl', a: 0, b: -1, nama: 'Cl₂ → HCl' },
      e: 1, setara: 'Cl₂ + H₂O → HCl + HClO',
      oksidator: 'Cl₂', reduktor: 'Cl₂' }
  ];

  function senyawa(s) { return SENYAWA[parseInt(s.get('sy'), 10) || 0]; }
  function rks(s) { return REAKSI[parseInt(s.get('rk'), 10) || 0]; }
  function mode(s) { return s.get('mode'); }

  function tandaBiloks(v) {
    if (v === 0) return '0';
    return (v > 0 ? '+' : '−') + Math.abs(v);
  }

  return {
    latar: 0x070c12,
    kamera: { jarak: 9.2, phi: 1.12, theta: 0.5, targetY: 0.4, lajuPutar: 0.14 },

    legenda: [
      { warna: '#8fd8ff', label: 'elektron yang berpindah' },
      { warna: '#ef9a52', label: 'biloks naik (oksidasi)' },
      { warna: '#6fb6ff', label: 'biloks turun (reduksi)' },
      { warna: '#9fe8ad', label: 'biloks nol (unsur bebas)' }
    ],

    kendali: [
      { judul: 'Mode', isi: [
        { type: 'segment', id: 'mode', value: 'biloks', label: 'Yang diamati', options: [
          { value: 'biloks', label: 'Bilangan oksidasi' },
          { value: 'transfer', label: 'Transfer elektron' }
        ]}
      ]},
      { judul: 'Senyawa', isi: [
        { type: 'select', id: 'sy', value: 0, label: 'Senyawa yang ditelusuri',
          options: SENYAWA.map(function (z, i) { return { value: i, label: z.n }; }) },
        { type: 'toggle', id: 'label', value: true, label: 'Tampilkan angka biloks' },
        { type: 'toggle', id: 'putar', value: true, label: 'Putar molekul' }
      ]},
      { judul: 'Reaksi redoks', isi: [
        { type: 'select', id: 'rk', value: 0, label: 'Reaksi',
          options: REAKSI.map(function (r, i) { return { value: i, label: r.n }; }) },
        { type: 'buttons', label: '', items: [
          { label: '▶ Pindahkan elektron', utama: true, klik: function (s) { s.data.jalan = true; } },
          { label: '↺ Ulangi', klik: function (s) { s.data.t = 0; s.data.jalan = false; } }
        ]},
        { type: 'slider', id: 'laju', value: 1, min: 0.2, max: 3, step: 0.1,
          label: 'Kecepatan', unit: '×', dec: 1 }
      ]}
    ],

    baca: [
      { id: 'a', label: 'Keterangan', tone: 'aksen' },
      { id: 'b', label: 'Oksidasi' },
      { id: 'c', label: 'Reduksi' },
      { id: 'd', label: 'Elektron' },
      { id: 'e', label: 'Persamaan setara' }
    ],

    bangun: function (s) {
      s.tambah(S.lantai({ r: 8, warna: 0x0c1218, y: -2.4 }));

      /* ============ mode biloks: molekul + label angka ============ */
      const gMol = new T.Group();
      s.data.gMol = gMol;
      s.tambah(gMol);
      s.data.lblAtom = [];

      /* ============ mode transfer: dua panggung ============ */
      const gTr = new T.Group();
      gTr.visible = false;
      s.data.gTr = gTr;
      s.tambah(gTr);

      function panggung(x, warna, judul) {
        const g = new T.Group();
        const dasar = new T.Mesh(new T.CylinderGeometry(1.5, 1.7, 0.22, 48),
          new T.MeshStandardMaterial({ color: 0x1d262e, roughness: 0.6, metalness: 0.3 }));
        dasar.position.y = -1.6;
        dasar.receiveShadow = true;
        g.add(dasar);
        const cincin = new T.Mesh(new T.TorusGeometry(1.52, 0.035, 10, 64),
          new T.MeshStandardMaterial({ color: warna, emissive: warna, emissiveIntensity: 0.8 }));
        cincin.rotation.x = Math.PI / 2;
        cincin.position.y = -1.48;
        g.add(cincin);
        const t = S.teks(judul, { skala: 0.32, lebar: 16, warna: '#cfdbe6' });
        t.position.set(0, -2.05, 0);
        g.add(t);
        g.position.x = x;
        return g;
      }
      const pL = panggung(-3.0, 0xef6a52, 'teroksidasi (reduktor)');
      const pR = panggung(3.0, 0x6fb6ff, 'tereduksi (oksidator)');
      gTr.add(pL); gTr.add(pR);

      // bola atom di tiap panggung
      const bolaL = S.atom('Zn', [-3.0, -0.4, 0], { skala: 1.1 });
      const bolaR = S.atom('Cu', [3.0, -0.4, 0], { skala: 1.1 });
      s.data.bolaL = bolaL; s.data.bolaR = bolaR;
      gTr.add(bolaL); gTr.add(bolaR);

      const labelL = S.teks('', { skala: 0.42, lebar: 16, warna: '#ef9a52' });
      labelL.position.set(-3.0, 1.1, 0);
      const labelR = S.teks('', { skala: 0.42, lebar: 16, warna: '#6fb6ff' });
      labelR.position.set(3.0, 1.1, 0);
      s.data.labelL = labelL; s.data.labelR = labelR;
      gTr.add(labelL); gTr.add(labelR);

      const namaL = S.teks('', { skala: 0.3, lebar: 14, warna: '#9aa8b4' });
      namaL.position.set(-3.0, -1.2, 0);
      const namaR = S.teks('', { skala: 0.3, lebar: 14, warna: '#9aa8b4' });
      namaR.position.set(3.0, -1.2, 0);
      s.data.namaL = namaL; s.data.namaR = namaR;
      gTr.add(namaL); gTr.add(namaR);

      // elektron yang terbang
      const el = [];
      for (let i = 0; i < 12; i++) {
        const m = new T.Mesh(S.geoBola(16), new T.MeshStandardMaterial({
          color: 0x8fd8ff, emissive: 0x4fa8e8, emissiveIntensity: 1.5, roughness: 0.25
        }));
        m.scale.setScalar(0.13);
        m.visible = false;
        gTr.add(m);
        el.push(m);
      }
      s.data.el = el;

      // jalur lengkung elektron
      const kurva = new T.CatmullRomCurve3([
        new T.Vector3(-3.0, 0.3, 0), new T.Vector3(-1.4, 1.9, 0),
        new T.Vector3(0, 2.3, 0), new T.Vector3(1.4, 1.9, 0), new T.Vector3(3.0, 0.3, 0)
      ]);
      s.data.kurva = kurva;
      const jalur = new T.Mesh(new T.TubeGeometry(kurva, 64, 0.016, 8, false),
        new T.MeshBasicMaterial({ color: 0x4fa8e8, transparent: true, opacity: 0.3 }));
      gTr.add(jalur);

      const lblJml = S.teks('', { skala: 0.34, lebar: 14, warna: '#8fd8ff' });
      lblJml.position.set(0, 2.75, 0);
      s.data.lblJml = lblJml;
      gTr.add(lblJml);

      /* judul umum */
      const lbl = S.teks('', { skala: 0.4, lebar: 40, warna: '#d8e4ec' });
      lbl.position.set(0, 3.6, 0);
      s.data.lbl = lbl;
      s.tambah(lbl);

      s.data.t = 0;
      s.data.jalan = false;
      pasangMol(s);
      pasangTr(s);
      aturMode(s);
    },

    ubah: function (s, id) {
      if (id === 'mode') aturMode(s);
      if (id === 'sy') pasangMol(s);
      if (id === 'rk') pasangTr(s);
      if (id === 'label') s.data.lblAtom.forEach(function (l) { l.visible = s.get('label'); });
    },

    langkah: function (s, dt) {
      if (mode(s) === 'biloks') {
        if (s.get('putar')) s.data.gMol.rotation.y += dt * 0.42;
        // label mengambang halus
        s.data.lblAtom.forEach(function (l, i) {
          l.position.y = l.userData.y0 + Math.sin(s.waktu * 1.6 + i) * 0.035;
        });
        return;
      }

      // ---- transfer elektron ----
      const r = rks(s);
      if (s.data.jalan) s.data.t = Math.min(1, s.data.t + dt * s.get('laju') * 0.4);
      const t = s.data.t;
      const n = Math.min(12, r.e);

      for (let i = 0; i < s.data.el.length; i++) {
        const m = s.data.el[i];
        if (i >= n) { m.visible = false; continue; }
        const u = S.clamp(t * 1.5 - i * (0.55 / n), 0, 1);
        m.visible = u > 0.001 && u < 0.999;
        if (m.visible) {
          const p = s.data.kurva.getPoint(u);
          m.position.copy(p);
          m.position.y += Math.sin(s.waktu * 5 + i) * 0.05;
          m.material.emissiveIntensity = 1.2 + 0.8 * Math.sin(s.waktu * 7 + i);
        }
      }

      // warna & ukuran bola berubah mengikuti biloks
      const skL = S.lerp(1.1, 0.78, t);
      const skR = S.lerp(0.82, 1.14, t);
      s.data.bolaL.scale.setScalar(skL * (S.UNSUR[r.red.s] || S.UNSUR.X).r);
      s.data.bolaR.scale.setScalar(skR * (S.UNSUR[r.oks.s] || S.UNSUR.X).r);
      s.data.bolaL.material.emissiveIntensity = 0.1 + t * 0.5;
      s.data.bolaR.material.emissiveIntensity = 0.1 + (1 - t) * 0.5;

      const bL = Math.round(S.lerp(r.red.a, r.red.b, t));
      const bR = Math.round(S.lerp(r.oks.a, r.oks.b, t));
      s.data.labelL.userData.ganti(r.red.s + '  ' + tandaBiloks(bL));
      s.data.labelR.userData.ganti(r.oks.s + '  ' + tandaBiloks(bR));
      s.data.lblJml.userData.ganti(Math.round(t * r.e) + ' / ' + r.e + ' elektron berpindah');
    },

    bacaUbah: function (s) {
      if (mode(s) === 'biloks') {
        const z = senyawa(s);
        let jml = 0;
        z.atom.forEach(function (a) { jml += a[4]; });
        s.baca('a', 'Menelusuri biloks di ' + z.n);
        s.baca('b', z.atom.map(function (a) { return a[0] + ' ' + tandaBiloks(a[4]); })
          .filter(function (x, i, arr) { return arr.indexOf(x) === i; }).join('   '));
        s.baca('c', '—');
        s.baca('d', '—');
        s.baca('e', 'Jumlah biloks seluruh atom = ' + tandaBiloks(jml) +
          (jml === 0 ? ' (senyawa netral ✓)' : ' (ion)'),
          jml === 0 ? 'aksen' : 'warn');
      } else {
        const r = rks(s);
        const t = s.data.t || 0;
        s.baca('a', Math.round(t * 100) + ' % elektron sudah berpindah',
          t > 0.99 ? 'aksen' : 'warn');
        s.baca('b', r.reduktor + ': ' + tandaBiloks(r.red.a) + ' → ' + tandaBiloks(r.red.b) +
          ' (naik, melepas e⁻)', 'warn');
        s.baca('c', r.oksidator + ': ' + tandaBiloks(r.oks.a) + ' → ' + tandaBiloks(r.oks.b) +
          ' (turun, menerima e⁻)', 'biru');
        s.baca('d', r.e + ' elektron per persamaan setara');
        s.baca('e', r.setara);
      }
    }
  };

  function aturMode(s) {
    const m = mode(s) === 'biloks';
    s.data.gMol.visible = m;
    s.data.gTr.visible = !m;
    s.data.lblAtom.forEach(function (l) { l.visible = m && s.get('label'); });
    if (m) pasangMol(s); else pasangTr(s);
    s.data.lbl.userData.ganti(m ? senyawa(s).n : rks(s).n);
  }

  function pasangMol(s) {
    const g = s.data.gMol;
    while (g.children.length) {
      const c = g.children.pop();
      S.buangObjek(c);
    }
    s.data.lblAtom = [];
    const z = senyawa(s);
    const def = { atom: z.atom.map(function (a) { return [a[0], a[1], a[2], a[3]]; }), ikatan: z.ikatan };
    const mol = S.molekul(def, { skalaAtom: 0.62, tebal: 0.075 });
    g.add(mol);
    g.rotation.y = 0;

    z.atom.forEach(function (a, i) {
      const warna = a[4] > 0 ? '#ef9a52' : a[4] < 0 ? '#6fb6ff' : '#9fe8ad';
      const l = S.teks(tandaBiloks(a[4]), { skala: 0.3, lebar: 6, warna: warna, latar: true });
      const r = (S.UNSUR[a[0]] || S.UNSUR.X).r * 0.62;
      l.position.set(a[1], a[2] + r + 0.3, a[3]);
      l.userData.y0 = l.position.y;
      l.visible = s.get('label');
      g.add(l);
      s.data.lblAtom.push(l);
    });
    s.data.lbl.userData.ganti(z.n);
  }

  function pasangTr(s) {
    const r = rks(s);
    s.data.t = 0;
    s.data.jalan = false;
    const uL = S.UNSUR[r.red.s] || S.UNSUR.X;
    const uR = S.UNSUR[r.oks.s] || S.UNSUR.X;
    s.data.bolaL.material.color.setHex(uL.w);
    s.data.bolaL.material.emissive.setHex(uL.w);
    s.data.bolaR.material.color.setHex(uR.w);
    s.data.bolaR.material.emissive.setHex(uR.w);
    s.data.bolaL.scale.setScalar(1.1 * uL.r);
    s.data.bolaR.scale.setScalar(0.82 * uR.r);
    s.data.labelL.userData.ganti(r.red.s + '  ' + tandaBiloks(r.red.a));
    s.data.labelR.userData.ganti(r.oks.s + '  ' + tandaBiloks(r.oks.a));
    s.data.namaL.userData.ganti(r.reduktor);
    s.data.namaR.userData.ganti(r.oksidator);
    s.data.lblJml.userData.ganti('0 / ' + r.e + ' elektron berpindah');
    s.data.el.forEach(function (m) { m.visible = false; });
    s.data.lbl.userData.ganti(r.n);
  }
})());
