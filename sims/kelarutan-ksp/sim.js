/* Kelarutan dan Hasil Kali Kelarutan (Ksp) — Fase F — adegan 3D */

Sim3D.daftar('kelarutan-ksp', (function () {
  'use strict';
  const T = THREE, S = S3;

  /* a, b = koefisien kation & anion dalam AaBb */
  const SENYAWA = [
    { n: 'AgCl', ksp: 1.8e-10, a: 1, b: 1, kat: 'Ag⁺', ani: 'Cl⁻',
      wK: 0xd8dde2, wA: 0x9fe8ad, wEndap: 0xf0f4f8 },
    { n: 'AgBr', ksp: 5.0e-13, a: 1, b: 1, kat: 'Ag⁺', ani: 'Br⁻',
      wK: 0xd8dde2, wA: 0xc06840, wEndap: 0xf0e8c8 },
    { n: 'AgI', ksp: 8.5e-17, a: 1, b: 1, kat: 'Ag⁺', ani: 'I⁻',
      wK: 0xd8dde2, wA: 0x9a4ac8, wEndap: 0xf0d860 },
    { n: 'BaSO₄', ksp: 1.1e-10, a: 1, b: 1, kat: 'Ba²⁺', ani: 'SO₄²⁻',
      wK: 0xe8e0c0, wA: 0xf0d040, wEndap: 0xffffff },
    { n: 'CaCO₃ (kapur)', ksp: 3.3e-9, a: 1, b: 1, kat: 'Ca²⁺', ani: 'CO₃²⁻',
      wK: 0xeae6dc, wA: 0x9aa8b4, wEndap: 0xf6f4ee },
    { n: 'PbI₂', ksp: 7.1e-9, a: 1, b: 2, kat: 'Pb²⁺', ani: 'I⁻',
      wK: 0x8d97a1, wA: 0x9a4ac8, wEndap: 0xf0d040 },
    { n: 'PbCl₂', ksp: 1.7e-5, a: 1, b: 2, kat: 'Pb²⁺', ani: 'Cl⁻',
      wK: 0x8d97a1, wA: 0x9fe8ad, wEndap: 0xf4f6f8 },
    { n: 'Mg(OH)₂', ksp: 5.6e-12, a: 1, b: 2, kat: 'Mg²⁺', ani: 'OH⁻',
      wK: 0xe0e8ec, wA: 0x6fb6ff, wEndap: 0xf0f6f8 },
    { n: 'Fe(OH)₃', ksp: 2.8e-39, a: 1, b: 3, kat: 'Fe³⁺', ani: 'OH⁻',
      wK: 0xd06a30, wA: 0x6fb6ff, wEndap: 0xa05020 },
    { n: 'CaF₂', ksp: 3.9e-11, a: 1, b: 2, kat: 'Ca²⁺', ani: 'F⁻',
      wK: 0xeae6dc, wA: 0xa8e85c, wEndap: 0xf4f4f0 },
    { n: 'CaSO₄ (gipsum)', ksp: 4.9e-5, a: 1, b: 1, kat: 'Ca²⁺', ani: 'SO₄²⁻',
      wK: 0xeae6dc, wA: 0xf0d040, wEndap: 0xf8f6f0 }
  ];

  function senyawa(s) { return SENYAWA[parseInt(s.get('z'), 10) || 0]; }

  /* kelarutan molar s dari Ksp = (a·s)^a · (b·s)^b */
  function kelarutan(z) {
    const n = z.a + z.b;
    const fak = Math.pow(z.a, z.a) * Math.pow(z.b, z.b);
    return Math.pow(z.ksp / fak, 1 / n);
  }

  function hitung(s) {
    const z = senyawa(s);
    const Vk = s.get('vk'), Va = s.get('va');
    const Ck = s.get('ck'), Ca = s.get('ca');
    const V = Vk + Va;
    let ck = Ck * Vk / V;        // konsentrasi kation setelah pencampuran
    let ca = Ca * Va / V;        // konsentrasi anion setelah pencampuran

    // ion sejenis dari garam tambahan
    const sejenis = s.get('sejenis');
    if (s.get('ionSejenis') === 'kation') ck += sejenis;
    else if (s.get('ionSejenis') === 'anion') ca += sejenis;

    const Qc = Math.pow(ck, z.a) * Math.pow(ca, z.b);
    const sMolar = kelarutan(z);
    const Mr = 1;  // tidak dipakai; kelarutan dilaporkan dalam mol/L
    return { z: z, ck: ck, ca: ca, V: V, Qc: Qc, sMolar: sMolar,
      lewat: Qc / z.ksp, mengendap: Qc > z.ksp };
  }

  return {
    latar: 0x070c12,
    kamera: { jarak: 15.84, phi: 1.04, theta: 0.6, targetY: 3.1, lajuPutar: 0.1 },

    legenda: [
      { warna: '#d8dde2', label: 'ion logam (kation)' },
      { warna: '#9fe8ad', label: 'ion pasangannya (anion)' },
      { warna: '#f0d040', label: 'garis jenuh Qc = Ksp' }
    ],

    kendali: [
      { judul: 'Senyawa', isi: [
        { type: 'select', id: 'z', value: 0, label: 'Garam sukar larut',
          options: SENYAWA.map(function (z, i) { return { value: i, label: z.n + '   Ksp = ' + S.fmtRapi(z.ksp) }; }) }
      ]},
      { judul: 'Larutan yang dicampur', isi: [
        { type: 'slider', id: 'ck', value: 0.001, min: 0.000001, max: 0.1, step: 0.000001,
          label: 'Konsentrasi larutan kation', unit: ' M', dec: 6,
          format: function (v) { return S.fmtRapi(v) + ' M'; } },
        { type: 'slider', id: 'vk', value: 50, min: 5, max: 100, step: 1,
          label: 'Volume larutan kation', unit: ' mL', dec: 0 },
        { type: 'slider', id: 'ca', value: 0.001, min: 0.000001, max: 0.1, step: 0.000001,
          label: 'Konsentrasi larutan anion', unit: ' M', dec: 6,
          format: function (v) { return S.fmtRapi(v) + ' M'; } },
        { type: 'slider', id: 'va', value: 50, min: 5, max: 100, step: 1,
          label: 'Volume larutan anion', unit: ' mL', dec: 0 }
      ]},
      { judul: 'Pengaruh ion sejenis', isi: [
        { type: 'segment', id: 'ionSejenis', value: 'tidak', label: 'Tambahkan garam ber-ion sejenis',
          options: [
            { value: 'tidak', label: 'Tidak' },
            { value: 'kation', label: 'Ion kation' },
            { value: 'anion', label: 'Ion anion' }
          ]},
        { type: 'slider', id: 'sejenis', value: 0, min: 0, max: 0.1, step: 0.0005,
          label: 'Jumlah ion sejenis', unit: ' M', dec: 4,
          format: function (v) { return S.fmtRapi(v) + ' M'; } },
        { type: 'buttons', label: '', items: [
          { label: '▶ Campurkan', utama: true, klik: function (s) { s.data.jalan = true; } },
          { label: '↺ Pisahkan kembali', klik: function (s) { s.data.t = 0; s.data.jalan = false; } }
        ]}
      ]},
      { judul: 'Tampilan', isi: [
        { type: 'toggle', id: 'grafik', value: true, label: 'Tampilkan panel Qc vs Ksp' },
        { type: 'toggle', id: 'ion', value: true, label: 'Tampilkan ion' }
      ]}
    ],

    baca: [
      { id: 'hasil', label: 'Hasil pencampuran', tone: 'aksen' },
      { id: 'qc', label: 'Qc hasil pencampuran' },
      { id: 'ksp', label: 'Ksp senyawa' },
      { id: 'bandingan', label: 'Qc / Ksp' },
      { id: 'kelarutan', label: 'Kelarutan dalam air murni' },
      { id: 'ion', label: 'Konsentrasi ion setelah dicampur' }
    ],

    bangun: function (s) {
      s.tambah(S.lantai({ r: 9, warna: 0x0b1118 }));

      /* dua gelas kecil pereaksi + satu gelas besar hasil */
      const gK = S.gelas({ r: 0.9, h: 1.5, level: 0.62, warna: 0xd8dde2, opacity: 0.6 });
      gK.position.set(-3.3, 1.9, 0);
      s.data.gK = gK;
      s.tambah(gK);
      const gA = S.gelas({ r: 0.9, h: 1.5, level: 0.62, warna: 0x9fe8ad, opacity: 0.6 });
      gA.position.set(3.3, 1.9, 0);
      s.data.gA = gA;
      s.tambah(gA);

      const lblK = S.teks('', { skala: 0.24, lebar: 16, warna: '#d8dde2' });
      lblK.position.set(-3.3, 1.55, 0);
      s.data.lblK = lblK;
      s.tambah(lblK);
      const lblA = S.teks('', { skala: 0.24, lebar: 16, warna: '#9fe8ad' });
      lblA.position.set(3.3, 1.55, 0);
      s.data.lblA = lblA;
      s.tambah(lblA);

      const gH = S.gelas({ r: 1.5, h: 2.2, level: 0.1, warna: 0xdfe8ee, opacity: 0.55 });
      s.data.gH = gH;
      s.tambah(gH);

      /* aliran dari kedua gelas ke gelas tengah */
      function aliran(x) {
        const kurva = new T.CatmullRomCurve3([
          new T.Vector3(x, 2.3, 0),
          new T.Vector3(x * 0.6, 2.0, 0),
          new T.Vector3(x * 0.2, 1.3, 0),
          new T.Vector3(x * 0.08, 0.8, 0)
        ]);
        const m = new T.Mesh(new T.TubeGeometry(kurva, 40, 0.055, 10, false),
          new T.MeshPhysicalMaterial({ color: 0xcfe6f2, roughness: 0.05, transmission: 0.7,
            transparent: true, opacity: 0.6, thickness: 0.2 }));
        m.visible = false;
        s.tambah(m);
        return m;
      }
      s.data.alirK = aliran(-3.3);
      s.data.alirA = aliran(3.3);

      /* ion di gelas tengah */
      function awan(warna, n, r) {
        const p = S.partikel(n, { r: r, warna: warna, kotak: { x: 1.15, y: 0.5, z: 1.15 } });
        p.position.y = 0.7;
        p.material.transparent = true;
        p.material.opacity = 0.92;
        s.tambah(p);
        return p;
      }
      s.data.pK = awan(0xd8dde2, 70, 0.085);
      s.data.pA = awan(0x9fe8ad, 70, 0.1);

      /* endapan: butiran menumpuk di dasar */
      const endap = new T.Group();
      s.data.butir = [];
      for (let i = 0; i < 90; i++) {
        const m = new T.Mesh(S.geoBola(10),
          new T.MeshStandardMaterial({ color: 0xf0f4f8, roughness: 0.55 }));
        const sk = S.acak(0.05, 0.1);
        m.scale.setScalar(sk);
        m.userData.sk = sk;
        const a = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random()) * 1.3;
        m.userData.x = Math.cos(a) * rr;
        m.userData.z = Math.sin(a) * rr;
        m.userData.y = 0.04 + Math.random() * 0.22;
        m.position.set(m.userData.x, m.userData.y, m.userData.z);
        m.visible = false;
        endap.add(m);
        s.data.butir.push(m);
      }
      s.data.endap = endap;
      s.tambah(endap);

      // kekeruhan larutan
      const keruh = new T.Mesh(new T.CylinderGeometry(1.42, 1.42, 1, 36),
        new T.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0,
          depthWrite: false }));
      s.data.keruh = keruh;
      s.tambah(keruh);

      /* panel grafik */
      const g1 = S.panelGrafik({ w: 4.8, px: 700, py: 440 });
      g1.position.set(0, 5.0, -1.6);
      s.data.g1 = g1;
      s.tambah(g1);

      const lbl = S.teks('', { skala: 0.4, lebar: 36, warna: '#d8e4ec' });
      lbl.position.set(0, 3.6, 0);
      s.data.lbl = lbl;
      s.tambah(lbl);

      s.data.t = 0;
      s.data.jalan = false;
      pasang(s);
    },

    ubah: function (s, id) {
      if (id === 'grafik') s.data.g1.visible = s.get('grafik');
      else if (id === 'ion') {
        s.data.pK.visible = s.get('ion');
        s.data.pA.visible = s.get('ion');
      } else pasang(s);
      gambar(s);
    },

    langkah: function (s, dt) {
      const h = hitung(s);
      if (s.data.jalan) s.data.t = Math.min(1, s.data.t + dt * 0.45);
      const t = s.data.t;

      // aliran terlihat saat 0.05 < t < 0.65
      const mengalir = t > 0.03 && t < 0.7;
      s.data.alirK.visible = mengalir;
      s.data.alirA.visible = mengalir;
      s.data.alirK.material.color.setHex(h.z.wK);
      s.data.alirA.material.color.setHex(h.z.wA);

      // gelas pereaksi mengosong, gelas tengah terisi
      s.data.gK.userData.setLevel(0.62 * (1 - t), h.z.wK);
      s.data.gA.userData.setLevel(0.62 * (1 - t), h.z.wA);
      const lv = 0.1 + t * 0.62;
      s.data.gH.userData.setLevel(lv, h.mengendap && t > 0.7 ? 0xe8eef2 : 0xdfe8ee);

      // ion di gelas tengah
      const frak = S.clamp(t * 1.4, 0, 1);
      const nK = Math.round(skala(h.ck) * 70 * frak);
      const nA = Math.round(skala(h.ca) * 70 * frak);
      atur(s.data.pK, h.mengendap && t > 0.8 ? Math.round(nK * 0.25) : nK);
      atur(s.data.pA, h.mengendap && t > 0.8 ? Math.round(nA * 0.25) : nA);
      s.data.pK.position.y = 0.1 + lv * 1.1;
      s.data.pK.userData.kotak = { x: 1.15, y: Math.max(0.2, lv * 0.95), z: 1.15 };
      s.data.pA.position.copy(s.data.pK.position);
      s.data.pA.userData.kotak = s.data.pK.userData.kotak;
      s.data.pK.userData.gerak(dt, 1.0);
      s.data.pA.userData.gerak(dt, 0.9);

      // endapan tumbuh
      const banyak = h.mengendap
        ? S.clamp(Math.log10(Math.max(1.0001, h.lewat)) / 6, 0.05, 1) : 0;
      const nEnd = Math.round(banyak * 90 * S.clamp((t - 0.6) / 0.4, 0, 1));
      s.data.butir.forEach(function (m, i) {
        m.visible = i < nEnd;
        m.material.color.setHex(h.z.wEndap);
        if (m.visible) {
          m.position.y = m.userData.y + Math.sin(s.waktu * 2 + i) * 0.004;
        }
      });
      s.data.keruh.material.opacity = banyak * 0.22 * S.clamp((t - 0.6) / 0.4, 0, 1);
      s.data.keruh.material.color.setHex(h.z.wEndap);
      s.data.keruh.scale.y = lv * 2.1;
      s.data.keruh.position.y = lv * 2.1 / 2;
    },

    bacaUbah: function (s) {
      const h = hitung(s);
      const z = h.z;
      s.baca('hasil', h.mengendap
        ? 'Qc > Ksp → terbentuk endapan ' + z.n
        : Math.abs(h.lewat - 1) < 0.02 ? 'Qc = Ksp → tepat jenuh, di ambang mengendap'
          : 'Qc < Ksp → larutan belum jenuh, tidak ada endapan',
        h.mengendap ? 'warn' : 'aksen');
      s.baca('qc', S.fmtRapi(h.Qc));
      s.baca('ksp', S.fmtRapi(z.ksp) + '   (' + z.n + ')');
      s.baca('bandingan', S.fmtRapi(h.lewat) + ' ×',
        h.lewat > 1 ? 'warn' : 'aksen');
      s.baca('kelarutan', S.fmtRapi(h.sMolar) + ' mol/L');
      s.baca('ion', '[' + z.kat + '] = ' + S.fmtRapi(h.ck) + ' M    ['
        + z.ani + '] = ' + S.fmtRapi(h.ca) + ' M');
      gambar(s);
    }
  };

  function skala(c) {
    return S.clamp((Math.log10(Math.max(1e-12, c)) + 12) / 11, 0.03, 1);
  }

  function atur(p, n) {
    const d = p.userData.p;
    for (let i = 0; i < d.length; i++) {
      if (!d[i].aktif && i < n) d[i].pos.set(S.acak(-1, 1), S.acak(-0.4, 0.4), S.acak(-1, 1));
      d[i].aktif = i < n;
    }
    p.userData.tulis();
  }

  function gambar(s) {
    if (!s.data.g1 || !s.data.g1.visible) return;
    const h = hitung(s);
    const z = h.z;
    // kurva kelarutan: [anion] yang diperlukan untuk tiap [kation] agar Qc = Ksp
    const titik = [];
    for (let i = 0; i <= 120; i++) {
      const lk = -10 + i / 120 * 10;        // log [kation] dari 1e-10 ke 1
      const ck = Math.pow(10, lk);
      const ca = Math.pow(z.ksp / Math.pow(ck, z.a), 1 / z.b);
      const la = Math.log10(ca);
      if (la > -12 && la < 1) titik.push([lk, la]);
    }
    S.gambarGrafik(s.data.g1, {
      judul: 'Garis jenuh ' + z.n + ' — titik di atas garis mengendap',
      xMin: -10, xMax: 0, yMin: -12, yMax: 0,
      xLabel: 'log [' + z.kat + ']', yLabel: 'log [' + z.ani + ']',
      seri: [{ titik: titik, warna: '#f0d040', tebal: 3, nama: 'Qc = Ksp (jenuh)' }],
      titikTebal: [{
        x: S.clamp(Math.log10(Math.max(1e-10, h.ck)), -10, 0),
        y: S.clamp(Math.log10(Math.max(1e-12, h.ca)), -12, 0),
        warna: h.mengendap ? '#ef6a52' : '#4fd1c0', r: 8
      }]
    });
  }

  function pasang(s) {
    const h = hitung(s);
    const z = h.z;
    s.data.t = 0;
    s.data.jalan = false;

    s.data.gK.userData.setLevel(0.62 * S.clamp(s.get('vk') / 100, 0.1, 1), z.wK);
    s.data.gA.userData.setLevel(0.62 * S.clamp(s.get('va') / 100, 0.1, 1), z.wA);
    s.data.gH.userData.setLevel(0.1, 0xdfe8ee);
    s.data.pK.material.color.setHex(z.wK);
    s.data.pK.material.emissive.setHex(z.wK);
    s.data.pA.material.color.setHex(z.wA);
    s.data.pA.material.emissive.setHex(z.wA);
    atur(s.data.pK, 0); atur(s.data.pA, 0);
    s.data.pK.visible = s.get('ion');
    s.data.pA.visible = s.get('ion');
    s.data.butir.forEach(function (m) { m.visible = false; });
    s.data.keruh.material.opacity = 0;
    s.data.alirK.visible = false;
    s.data.alirA.visible = false;

    s.data.lblK.userData.ganti(z.kat + '  ' + S.fmtRapi(s.get('ck')) + ' M');
    s.data.lblA.userData.ganti(z.ani + '  ' + S.fmtRapi(s.get('ca')) + ' M');
    s.data.g1.visible = s.get('grafik');
    s.data.lbl.userData.ganti(z.n + '   Ksp = ' + S.fmtRapi(z.ksp));
    gambar(s);
  }
})());
