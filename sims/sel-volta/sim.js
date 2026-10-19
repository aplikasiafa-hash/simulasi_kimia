/* Sel Volta dan Elektrolisis — Fase F — adegan 3D */

Sim3D.daftar('sel-volta', (function () {
  'use strict';
  const T = THREE, S = S3;

  /* E° reduksi standar (volt) */
  const ELEKTRODE = [
    { s: 'Li', n: 'Li⁺ | Li', e: -3.04, w: 0xcfd6dc, ion: 0xeef2f6 },
    { s: 'K', n: 'K⁺ | K', e: -2.92, w: 0xc8a8e0, ion: 0xe8daf6 },
    { s: 'Ca', n: 'Ca²⁺ | Ca', e: -2.87, w: 0xd8d4c4, ion: 0xf0eee0 },
    { s: 'Na', n: 'Na⁺ | Na', e: -2.71, w: 0xe0e4e8, ion: 0xeef2f6 },
    { s: 'Mg', n: 'Mg²⁺ | Mg', e: -2.37, w: 0xbcc4cc, ion: 0xe6eef2 },
    { s: 'Al', n: 'Al³⁺ | Al', e: -1.66, w: 0xc8ced4, ion: 0xeaf0f4 },
    { s: 'Zn', n: 'Zn²⁺ | Zn', e: -0.76, w: 0xa8b2ba, ion: 0xeaf2f6 },
    { s: 'Fe', n: 'Fe²⁺ | Fe', e: -0.44, w: 0x8a949e, ion: 0xa8c8a0 },
    { s: 'Ni', n: 'Ni²⁺ | Ni', e: -0.25, w: 0x9aa4ac, ion: 0x6fb86f },
    { s: 'Pb', n: 'Pb²⁺ | Pb', e: -0.13, w: 0x8d97a1, ion: 0xeaeef0 },
    { s: 'H', n: '2H⁺ | H₂  (acuan)', e: 0.00, w: 0x3a4248, ion: 0xeaf2f6 },
    { s: 'Cu', n: 'Cu²⁺ | Cu', e: 0.34, w: 0xb87333, ion: 0x3f8fd0 },
    { s: 'I', n: 'I₂ | 2I⁻', e: 0.54, w: 0x9a4ac8, ion: 0xd0a0e8 },
    { s: 'Ag', n: 'Ag⁺ | Ag', e: 0.80, w: 0xd8dde2, ion: 0xeef2f6 },
    { s: 'Br', n: 'Br₂ | 2Br⁻', e: 1.07, w: 0xa52a2a, ion: 0xe0a080 },
    { s: 'Cl', n: 'Cl₂ | 2Cl⁻', e: 1.36, w: 0x9fe8ad, ion: 0xdff0e0 },
    { s: 'Au', n: 'Au³⁺ | Au', e: 1.50, w: 0xffd700, ion: 0xf0e0a0 },
    { s: 'F', n: 'F₂ | 2F⁻', e: 2.87, w: 0xa8e85c, ion: 0xe0f0c0 }
  ];

  function kiri(s) { return ELEKTRODE[parseInt(s.get('ki'), 10) || 0]; }
  function kanan(s) { return ELEKTRODE[parseInt(s.get('ka'), 10) || 0]; }

  function hitung(s) {
    const a = kiri(s), b = kanan(s);
    // yang E° lebih besar menjadi katode (tereduksi) pada sel volta
    const katode = a.e >= b.e ? a : b;
    const anode = a.e >= b.e ? b : a;
    const esel = katode.e - anode.e;
    const elektrolisis = s.get('mode') === 'elektrolisis';
    const luar = s.get('luar');
    const jalan = elektrolisis ? luar > esel : esel > 0.001;
    return { a: a, b: b, katode: katode, anode: anode, esel: esel,
      elektrolisis: elektrolisis, luar: luar, jalan: jalan,
      spontan: esel > 0, arahKanan: b.e >= a.e };
  }

  return {
    latar: 0x070c12,
    kamera: { jarak: 15.4, phi: 1.04, theta: 0.6, targetY: 2.1, lajuPutar: 0.1 },

    legenda: [
      { warna: '#8fd8ff', label: 'elektron' },
      { warna: '#f0a94a', label: 'anode — oksidasi' },
      { warna: '#6fb6ff', label: 'katode — reduksi' }
    ],

    kendali: [
      { judul: 'Elektrode', isi: [
        { type: 'select', id: 'ki', value: 6, label: 'Setengah sel kiri',
          options: ELEKTRODE.map(function (e, i) {
            return { value: i, label: e.n + '   E° = ' + (e.e >= 0 ? '+' : '') + S.fmt(e.e, 2) + ' V' };
          }) },
        { type: 'select', id: 'ka', value: 11, label: 'Setengah sel kanan',
          options: ELEKTRODE.map(function (e, i) {
            return { value: i, label: e.n + '   E° = ' + (e.e >= 0 ? '+' : '') + S.fmt(e.e, 2) + ' V' };
          }) },
        { type: 'slider', id: 'c', value: 1, min: 0.01, max: 2, step: 0.01,
          label: 'Konsentrasi ion', unit: ' M', dec: 2 }
      ]},
      { judul: 'Mode', isi: [
        { type: 'segment', id: 'mode', value: 'volta', label: 'Jenis sel', options: [
          { value: 'volta', label: 'Sel volta' },
          { value: 'elektrolisis', label: 'Elektrolisis' }
        ]},
        { type: 'slider', id: 'luar', value: 2, min: 0, max: 6, step: 0.1,
          label: 'Tegangan luar (elektrolisis)', unit: ' V', dec: 1 },
        { type: 'toggle', id: 'saklar', value: true, label: 'Saklar tersambung' }
      ]},
      { judul: 'Tampilan', isi: [
        { type: 'toggle', id: 'elektron', value: true, label: 'Tampilkan aliran elektron' },
        { type: 'toggle', id: 'ion', value: true, label: 'Tampilkan ion dalam larutan' },
        { type: 'slider', id: 'laju', value: 1, min: 0.2, max: 3, step: 0.1,
          label: 'Kecepatan animasi', unit: '×', dec: 1 }
      ]}
    ],

    baca: [
      { id: 'esel', label: 'Potensial sel E°', tone: 'aksen' },
      { id: 'anode', label: 'Anode (oksidasi)' },
      { id: 'katode', label: 'Katode (reduksi)' },
      { id: 'notasi', label: 'Notasi sel' },
      { id: 'arah', label: 'Arah elektron' },
      { id: 'status', label: 'Keadaan' }
    ],

    bangun: function (s) {
      s.tambah(S.lantai({ r: 10, warna: 0x0b1118 }));

      /* ---------- dua gelas larutan ---------- */
      function sel(x) {
        const g = new T.Group();
        const gls = S.gelas({ r: 1.35, h: 2.0, level: 0.68, warna: 0x3f8fd0, opacity: 0.6 });
        g.add(gls);
        g.position.set(x, 0.05, 0);
        g.userData.gls = gls;
        return g;
      }
      const sKi = sel(-2.6), sKa = sel(2.6);
      s.data.sKi = sKi; s.data.sKa = sKa;
      s.tambah(sKi); s.tambah(sKa);

      /* ---------- elektrode logam ---------- */
      function bilah(x) {
        const m = new T.Mesh(new T.BoxGeometry(0.5, 2.8, 0.12),
          S.matLogam(0xb87333, { roughness: 0.42 }));
        m.position.set(x, 1.5, 0);
        m.castShadow = true;
        s.tambah(m);
        return m;
      }
      s.data.bKi = bilah(-2.6);
      s.data.bKa = bilah(2.6);

      const lblKi = S.teks('', { skala: 0.3, lebar: 18, warna: '#cfdbe6' });
      lblKi.position.set(-2.6, -0.5, 0);
      s.data.lblKi = lblKi;
      s.tambah(lblKi);
      const lblKa = S.teks('', { skala: 0.3, lebar: 18, warna: '#cfdbe6' });
      lblKa.position.set(2.6, -0.5, 0);
      s.data.lblKa = lblKa;
      s.tambah(lblKa);

      const perKi = S.teks('', { skala: 0.3, lebar: 14, warna: '#f0a94a' });
      perKi.position.set(-2.6, 3.3, 0);
      s.data.perKi = perKi;
      s.tambah(perKi);
      const perKa = S.teks('', { skala: 0.3, lebar: 14, warna: '#6fb6ff' });
      perKa.position.set(2.6, 3.3, 0);
      s.data.perKa = perKa;
      s.tambah(perKa);

      /* ---------- jembatan garam ---------- */
      const jk = new T.CatmullRomCurve3([
        new T.Vector3(-2.0, 1.5, 0), new T.Vector3(-1.6, 2.5, 0),
        new T.Vector3(0, 2.8, 0), new T.Vector3(1.6, 2.5, 0),
        new T.Vector3(2.0, 1.5, 0)
      ]);
      const jembatan = new T.Mesh(new T.TubeGeometry(jk, 60, 0.17, 14, false),
        new T.MeshPhysicalMaterial({ color: 0xcfe6f2, roughness: 0.06, transparent: true,
          opacity: 0.3, side: T.DoubleSide, depthWrite: false }));
      s.tambah(jembatan);
      const isiJ = new T.Mesh(new T.TubeGeometry(jk, 60, 0.12, 12, false),
        S.matCairan(0xdfe8ee, { opacity: 0.65 }));
      s.tambah(isiJ);
      s.data.jk = jk;
      const lblJ = S.teks('jembatan garam KNO₃', { skala: 0.24, lebar: 24, warna: '#aebbc6' });
      lblJ.position.set(0, 3.3, 0);
      s.tambah(lblJ);

      /* ---------- kawat + voltmeter ---------- */
      const kw = new T.CatmullRomCurve3([
        new T.Vector3(-2.6, 2.95, 0), new T.Vector3(-2.4, 4.4, 0),
        new T.Vector3(-0.8, 4.9, 0), new T.Vector3(0.8, 4.9, 0),
        new T.Vector3(2.4, 4.4, 0), new T.Vector3(2.6, 2.95, 0)
      ]);
      const kawat = new T.Mesh(new T.TubeGeometry(kw, 90, 0.045, 10, false),
        new T.MeshStandardMaterial({ color: 0x2c3b4a, roughness: 0.55 }));
      s.tambah(kawat);
      s.data.kw = kw;

      // voltmeter
      const vm = new T.Group();
      const badan = new T.Mesh(new T.BoxGeometry(1.7, 1.1, 0.5),
        new T.MeshStandardMaterial({ color: 0x232d36, roughness: 0.5, metalness: 0.3 }));
      vm.add(badan);
      const layar = new T.Mesh(new T.BoxGeometry(1.35, 0.6, 0.05),
        new T.MeshStandardMaterial({ color: 0x08181a, emissive: 0x0a2a2c, emissiveIntensity: 0.6 }));
      layar.position.z = 0.27;
      vm.add(layar);
      const angka = S.teks('0,00 V', { skala: 0.34, lebar: 10, latar: false, warna: '#4fd1c0' });
      angka.position.z = 0.33;
      vm.add(angka);
      s.data.angka = angka;
      const lblV = S.teks('voltmeter', { skala: 0.2, lebar: 12, latar: false, warna: '#7f8f9c' });
      lblV.position.set(0, -0.42, 0.3);
      vm.add(lblV);
      vm.position.set(0, 5.6, 0);
      s.tambah(vm);

      // baterai luar (mode elektrolisis)
      const bat = new T.Group();
      const bb = new T.Mesh(new T.CylinderGeometry(0.26, 0.26, 1.1, 26),
        new T.MeshStandardMaterial({ color: 0x1f2a33, roughness: 0.45, metalness: 0.4 }));
      bb.rotation.z = Math.PI / 2;
      bat.add(bb);
      const kut = new T.Mesh(new T.CylinderGeometry(0.09, 0.09, 0.14, 16), S.matLogam(0xd8c080));
      kut.rotation.z = Math.PI / 2;
      kut.position.x = 0.62;
      bat.add(kut);
      bat.position.set(-1.6, 4.86, 0.35);
      bat.visible = false;
      s.data.bat = bat;
      s.tambah(bat);

      // saklar
      const sp = new T.Mesh(new T.BoxGeometry(0.62, 0.1, 0.36),
        new T.MeshStandardMaterial({ color: 0x27323c, roughness: 0.6 }));
      sp.position.set(1.7, 4.65, 0.2);
      s.tambah(sp);
      const tuas = new T.Mesh(new T.BoxGeometry(0.5, 0.06, 0.09), S.matLogam(0xd0a84a));
      tuas.position.set(1.7, 4.75, 0.2);
      s.data.tuas = tuas;
      s.tambah(tuas);

      /* ---------- elektron di kawat ---------- */
      const el = [];
      for (let i = 0; i < 16; i++) {
        const m = new T.Mesh(S.geoBola(12), new T.MeshStandardMaterial({
          color: 0x8fd8ff, emissive: 0x4fa8e8, emissiveIntensity: 1.6, roughness: 0.25
        }));
        m.scale.setScalar(0.085);
        m.visible = false;
        s.tambah(m);
        el.push(m);
      }
      s.data.el = el;

      /* ---------- ion di jembatan garam ---------- */
      const ij = [];
      for (let i = 0; i < 10; i++) {
        const m = new T.Mesh(S.geoBola(12), new T.MeshStandardMaterial({
          color: i % 2 ? 0xef6a52 : 0x9fe8ad, emissive: i % 2 ? 0xef6a52 : 0x9fe8ad,
          emissiveIntensity: 0.7, roughness: 0.3
        }));
        m.scale.setScalar(0.075);
        m.visible = false;
        s.tambah(m);
        ij.push(m);
      }
      s.data.ij = ij;

      /* ---------- ion dalam larutan ---------- */
      function awan(x, warna) {
        const p = S.partikel(60, { r: 0.085, warna: warna, kotak: { x: 1.1, y: 0.5, z: 1.1 } });
        p.position.set(x, 0.78, 0);
        p.material.transparent = true;
        p.material.opacity = 0.9;
        s.tambah(p);
        return p;
      }
      s.data.pKi = awan(-2.6, 0xeaf2f6);
      s.data.pKa = awan(2.6, 0x3f8fd0);

      /* endapan logam di katode / pengikisan anode */
      const lapis = new T.Mesh(new T.BoxGeometry(0.58, 1.6, 0.2),
        new T.MeshStandardMaterial({ color: 0xb87333, roughness: 0.5, metalness: 0.8,
          transparent: true, opacity: 0 }));
      s.data.lapis = lapis;
      s.tambah(lapis);

      // gelembung gas pada elektrode gas (H2, Cl2, O2)
      s.data.gasKi = S.gelembung({ n: 26, sebar: 0.2, tinggi: 1.3, warna: 0xdff2ff });
      s.data.gasKi.position.set(-2.6, 0.15, 0);
      s.tambah(s.data.gasKi);
      s.data.gasKa = S.gelembung({ n: 26, sebar: 0.2, tinggi: 1.3, warna: 0xdff2ff });
      s.data.gasKa.position.set(2.6, 0.15, 0);
      s.tambah(s.data.gasKa);

      const lbl = S.teks('', { skala: 0.38, lebar: 40, warna: '#d8e4ec' });
      lbl.position.set(0, 6.6, 0);
      s.data.lbl = lbl;
      s.tambah(lbl);

      pasang(s);
    },

    ubah: function (s, id) {
      pasang(s);
    },

    langkah: function (s, dt) {
      const h = hitung(s);
      const on = s.get('saklar');
      const dtl = dt * s.get('laju');
      s.data.fase = (s.data.fase || 0) + dtl * (on && h.jalan ? 0.3 : 0);

      s.data.tuas.rotation.z = S.lerp(s.data.tuas.rotation.z, on ? 0 : 0.5, dt * 8);

      // voltmeter
      const tampil = h.elektrolisis ? h.luar - h.esel : h.esel;
      const c = tampil > 0.001 && on ? '#4fd1c0' : '#7f8f9c';
      s.data.angka.userData.ganti(
        (on ? S.fmt(h.elektrolisis ? h.luar : Math.max(0, h.esel), 2) : '0,00') + ' V', c);

      // arah elektron: pada sel volta dari anode ke katode lewat kawat luar;
      // pada elektrolisis arah dibalik oleh sumber luar
      let keKanan = h.anode === h.a ? true : false;   // anode kiri → elektron ke kanan
      if (h.elektrolisis) keKanan = !keKanan;

      const aktif = on && h.jalan && s.get('elektron');
      s.data.el.forEach(function (m, i) {
        m.visible = aktif;
        if (!aktif) return;
        let u = (s.data.fase + i / s.data.el.length) % 1;
        if (!keKanan) u = 1 - u;
        const p = s.data.kw.getPoint(u);
        m.position.copy(p);
        m.material.emissiveIntensity = 1.2 + 0.7 * Math.sin(s.waktu * 6 + i);
      });

      // ion di jembatan garam bergerak berlawanan arah
      s.data.ij.forEach(function (m, i) {
        m.visible = aktif;
        if (!aktif) return;
        const kation = i % 2 === 1;
        let u = (s.data.fase * 0.7 + i / s.data.ij.length) % 1;
        if (kation !== keKanan) u = 1 - u;
        const p = s.data.jk.getPoint(u);
        m.position.copy(p);
      });

      // ion dalam larutan bergerak
      s.data.pKi.userData.gerak(dtl, 0.8);
      s.data.pKa.userData.gerak(dtl, 0.8);

      // pengendapan logam di katode & pengikisan anode
      if (on && h.jalan) {
        s.data.tumbuh = Math.min(1, (s.data.tumbuh || 0) + dtl * 0.12);
      }
      const tum = s.data.tumbuh || 0;
      const bKat = h.katode === h.a ? s.data.bKi : s.data.bKa;
      const bAno = h.katode === h.a ? s.data.bKa : s.data.bKi;
      s.data.lapis.position.copy(bKat.position);
      s.data.lapis.material.color.setHex(h.katode.w);
      s.data.lapis.material.opacity = tum * 0.95;
      s.data.lapis.scale.set(1 + tum * 0.25, 1, 1 + tum * 1.2);
      bAno.scale.set(Math.max(0.3, 1 - tum * 0.5), 1, Math.max(0.3, 1 - tum * 0.5));

      // gelembung bila elektrodenya gas
      const gasKi = h.a.s === 'H' || h.a.s === 'Cl' || h.a.s === 'Br' || h.a.s === 'F';
      const gasKa = h.b.s === 'H' || h.b.s === 'Cl' || h.b.s === 'Br' || h.b.s === 'F';
      s.data.gasKi.userData.perbarui(dtl, on && h.jalan && gasKi ? 1.4 : 0);
      s.data.gasKa.userData.perbarui(dtl, on && h.jalan && gasKa ? 1.4 : 0);
    },

    bacaUbah: function (s) {
      const h = hitung(s);
      const on = s.get('saklar');
      s.baca('esel', (h.esel >= 0 ? '+' : '') + S.fmt(h.esel, 2) + ' V'
        + (h.elektrolisis ? '   (tegangan luar ' + S.fmt(h.luar, 1) + ' V)' : ''),
        h.esel > 0 ? 'aksen' : 'danger');
      s.baca('anode', h.anode.n + '   E° = ' + (h.anode.e >= 0 ? '+' : '')
        + S.fmt(h.anode.e, 2) + ' V   — kutub negatif pada sel volta', 'warn');
      s.baca('katode', h.katode.n + '   E° = ' + (h.katode.e >= 0 ? '+' : '')
        + S.fmt(h.katode.e, 2) + ' V   — kutub positif pada sel volta', 'biru');
      s.baca('notasi', h.anode.s + ' | ' + h.anode.s + 'ⁿ⁺ ‖ '
        + h.katode.s + 'ⁿ⁺ | ' + h.katode.s);
      let keKanan = h.anode === h.a;
      if (h.elektrolisis) keKanan = !keKanan;
      s.baca('arah', !on || !h.jalan ? 'Tidak ada aliran'
        : keKanan ? 'Melalui kawat: dari kiri ke kanan' : 'Melalui kawat: dari kanan ke kiri');
      s.baca('status', !on ? 'Saklar terbuka — rangkaian terputus'
        : h.elektrolisis
          ? (h.jalan ? 'Elektrolisis berjalan — reaksi tak spontan dipaksa oleh sumber luar'
            : 'Tegangan luar belum melampaui ' + S.fmt(h.esel, 2) + ' V, reaksi belum berjalan')
          : (h.esel > 0.001 ? 'Sel volta berjalan spontan — menghasilkan listrik'
            : 'Kedua elektrode sama — tidak ada beda potensial'),
        !on ? 'danger' : h.jalan ? 'aksen' : 'danger');
    }
  };

  function pasang(s) {
    const h = hitung(s);
    s.data.tumbuh = 0;
    s.data.fase = 0;

    // warna elektrode & larutan
    s.data.bKi.material.color.setHex(h.a.w);
    s.data.bKi.material.metalness = h.a.s === 'H' ? 0.3 : 0.9;
    s.data.bKa.material.color.setHex(h.b.w);
    s.data.bKa.material.metalness = h.b.s === 'H' ? 0.3 : 0.9;
    s.data.bKi.scale.set(1, 1, 1);
    s.data.bKa.scale.set(1, 1, 1);
    s.data.lapis.material.opacity = 0;

    s.data.sKi.userData.gls.userData.setLevel(0.68, h.a.ion);
    s.data.sKa.userData.gls.userData.setLevel(0.68, h.b.ion);
    // larutan pucat (ion tak berwarna) tetap bening; larutan pekat
    // menggelap mengikuti konsentrasi
    const f = 0.55 + S.clamp(s.get('c') / 2, 0, 0.45);
    s.data.sKi.userData.gls.userData.setOpasitas(S.opasitasCair(h.a.ion) * f);
    s.data.sKa.userData.gls.userData.setOpasitas(S.opasitasCair(h.b.ion) * f);

    s.data.pKi.material.color.setHex(h.a.ion);
    s.data.pKi.material.emissive.setHex(h.a.ion);
    s.data.pKa.material.color.setHex(h.b.ion);
    s.data.pKa.material.emissive.setHex(h.b.ion);
    const n = Math.round(S.clamp(s.get('c') / 2, 0.1, 1) * 60);
    [s.data.pKi, s.data.pKa].forEach(function (p) {
      const d = p.userData.p;
      for (let i = 0; i < d.length; i++) {
        if (!d[i].aktif && i < n) d[i].pos.set(S.acak(-1, 1), S.acak(-0.4, 0.4), S.acak(-1, 1));
        d[i].aktif = i < n;
      }
      p.userData.tulis();
      p.visible = s.get('ion');
    });

    // label peran tiap sisi
    const kiAnode = h.anode === h.a;
    s.data.perKi.userData.ganti(kiAnode ? 'ANODE  (−)' : 'KATODE  (+)',
      kiAnode ? '#f0a94a' : '#6fb6ff');
    s.data.perKa.userData.ganti(kiAnode ? 'KATODE  (+)' : 'ANODE  (−)',
      kiAnode ? '#6fb6ff' : '#f0a94a');
    s.data.lblKi.userData.ganti(h.a.n);
    s.data.lblKa.userData.ganti(h.b.n);

    s.data.bat.visible = h.elektrolisis;
    s.data.el.forEach(function (m) { m.visible = false; });
    s.data.ij.forEach(function (m) { m.visible = false; });

    s.data.lbl.userData.ganti(h.elektrolisis
      ? 'Elektrolisis — dipaksa oleh sumber luar ' + S.fmt(h.luar, 1) + ' V'
      : 'Sel volta   ' + h.anode.s + ' ‖ ' + h.katode.s
        + '   E°sel = ' + (h.esel >= 0 ? '+' : '') + S.fmt(h.esel, 2) + ' V');
  }
})());
