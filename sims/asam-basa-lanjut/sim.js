/* Teori Asam–Basa dan Perhitungan pH — Fase F — adegan 3D */

Sim3D.daftar('asam-basa-lanjut', (function () {
  'use strict';
  const T = THREE, S = S3;

  const KW = 1e-14;

  /* jenis: 'ak' asam kuat, 'al' asam lemah, 'bk' basa kuat, 'bl' basa lemah
     val = valensi (jumlah H⁺/OH⁻ yang dilepas) */
  const ZAT = [
    { n: 'HCl — asam klorida', j: 'ak', val: 1, warna: 0xeaf2f6,
      ar: 'Melepas H⁺ dalam air', br: 'Memberi proton ke H₂O', le: 'Bukan contoh khas Lewis' },
    { n: 'H₂SO₄ — asam sulfat', j: 'ak', val: 2, warna: 0xeef2f6,
      ar: 'Melepas 2 H⁺', br: 'Donor proton kuat', le: 'Bukan contoh khas Lewis' },
    { n: 'HNO₃ — asam nitrat', j: 'ak', val: 1, warna: 0xf0f2f0,
      ar: 'Melepas H⁺', br: 'Donor proton', le: 'Bukan contoh khas Lewis' },
    { n: 'CH₃COOH — asam asetat', j: 'al', ka: 1.8e-5, val: 1, warna: 0xf0ead8,
      ar: 'Terionisasi sebagian', br: 'Donor proton lemah', le: '—' },
    { n: 'H₂CO₃ — asam karbonat', j: 'al', ka: 4.3e-7, val: 1, warna: 0xe6eef2,
      ar: 'Terionisasi sangat sedikit', br: 'Donor proton sangat lemah', le: '—' },
    { n: 'HF — asam fluorida', j: 'al', ka: 6.8e-4, val: 1, warna: 0xe8f0f2,
      ar: 'Terionisasi sebagian', br: 'Donor proton', le: '—' },
    { n: 'HCN — asam sianida', j: 'al', ka: 6.2e-10, val: 1, warna: 0xeaeef0,
      ar: 'Hampir tak terionisasi', br: 'Donor proton sangat lemah', le: 'CN⁻ donor pasangan elektron' },
    { n: 'NaOH — natrium hidroksida', j: 'bk', val: 1, warna: 0xe4eef4,
      ar: 'Melepas OH⁻', br: 'Penerima proton', le: 'OH⁻ donor pasangan elektron' },
    { n: 'Ca(OH)₂ — kapur sirih', j: 'bk', val: 2, warna: 0xf2f4f6,
      ar: 'Melepas 2 OH⁻', br: 'Penerima proton', le: '—' },
    { n: 'NH₃ — amonia', j: 'bl', kb: 1.8e-5, val: 1, warna: 0xe2f0f6,
      ar: 'Tidak punya OH⁻ — teori Arrhenius gagal', br: 'Menerima proton dari H₂O',
      le: 'Donor pasangan elektron bebas pada N' },
    { n: 'CH₃NH₂ — metilamina', j: 'bl', kb: 4.4e-4, val: 1, warna: 0xe6f0f4,
      ar: 'Tidak punya OH⁻', br: 'Penerima proton', le: 'Donor pasangan elektron' },
    { n: 'BF₃ — boron trifluorida', j: 'lewis', val: 0, warna: 0xf4f0e8,
      ar: 'Bukan asam Arrhenius', br: 'Bukan asam Brønsted (tak punya H)',
      le: 'Asam Lewis — penerima pasangan elektron' }
  ];

  const TEORI = {
    arrhenius: { n: 'Arrhenius', ket: 'asam melepas H⁺, basa melepas OH⁻ di dalam air' },
    bronsted: { n: 'Brønsted–Lowry', ket: 'asam memberi proton, basa menerima proton' },
    lewis: { n: 'Lewis', ket: 'asam menerima pasangan elektron, basa memberi pasangan elektron' }
  };

  function zat(s) { return ZAT[parseInt(s.get('z'), 10) || 0]; }

  function hitung(s) {
    const z = zat(s);
    const c = s.get('c') * (z.val || 1);
    let H, OH, alfa = 1;
    if (z.j === 'ak') { H = c; OH = KW / H; }
    else if (z.j === 'bk') { OH = c; H = KW / OH; }
    else if (z.j === 'al') {
      H = (-z.ka + Math.sqrt(z.ka * z.ka + 4 * z.ka * c)) / 2;
      OH = KW / H; alfa = H / c;
    } else if (z.j === 'bl') {
      OH = (-z.kb + Math.sqrt(z.kb * z.kb + 4 * z.kb * c)) / 2;
      H = KW / OH; alfa = OH / c;
    } else { H = 1e-7; OH = 1e-7; alfa = 0; }
    const pH = -Math.log10(Math.max(1e-15, H));
    return { z: z, c: c, H: H, OH: OH, pH: S.clamp(pH, 0, 14), alfa: alfa };
  }

  function warnaPH(pH) {
    const titik = [
      [0, 0xd02020], [2, 0xe85a20], [4, 0xf0a030], [6, 0xd8d040],
      [7, 0x60c860], [8, 0x40b8a0], [10, 0x3878d0], [12, 0x5030b0], [14, 0x30107a]
    ];
    for (let i = 0; i < titik.length - 1; i++) {
      if (pH <= titik[i + 1][0]) {
        const u = (pH - titik[i][0]) / (titik[i + 1][0] - titik[i][0]);
        return new T.Color(titik[i][1]).lerp(new T.Color(titik[i + 1][1]), u);
      }
    }
    return new T.Color(titik[titik.length - 1][1]);
  }

  return {
    latar: 0x070c12,
    kamera: { jarak: 10.5, phi: 1.06, theta: 0.6, targetY: 1.4, lajuPutar: 0.1 },

    legenda: [
      { warna: '#ef6a52', label: 'ion H₃O⁺ (asam)' },
      { warna: '#6fb6ff', label: 'ion OH⁻ (basa)' },
      { warna: '#dfe8ee', label: 'molekul belum terionisasi' }
    ],

    kendali: [
      { judul: 'Larutan', isi: [
        { type: 'select', id: 'z', value: 0, label: 'Zat',
          options: ZAT.map(function (z, i) { return { value: i, label: z.n }; }) },
        { type: 'slider', id: 'c', value: 0.1, min: 0.0001, max: 1, step: 0.0001,
          label: 'Konsentrasi', unit: ' M', dec: 4,
          format: function (v) { return S.fmtRapi(v) + ' M'; } }
      ]},
      { judul: 'Teori yang dipakai', isi: [
        { type: 'segment', id: 'teori', value: 'arrhenius', label: 'Sudut pandang', options: [
          { value: 'arrhenius', label: 'Arrhenius' },
          { value: 'bronsted', label: 'Brønsted' },
          { value: 'lewis', label: 'Lewis' }
        ]},
        { type: 'buttons', label: '', items: [
          { label: '▶ Jalankan serah-terima', utama: true, klik: function (s) { s.data.jalan = true; } },
          { label: '↺ Ulangi', klik: function (s) { s.data.t = 0; s.data.jalan = false; } }
        ]}
      ]},
      { judul: 'Tampilan', isi: [
        { type: 'toggle', id: 'ion', value: true, label: 'Tampilkan ion H₃O⁺ dan OH⁻' },
        { type: 'toggle', id: 'skala', value: true, label: 'Tampilkan pita skala pH' },
        { type: 'toggle', id: 'molekul', value: true, label: 'Tampilkan model molekul' }
      ]}
    ],

    baca: [
      { id: 'ph', label: 'pH larutan', tone: 'aksen' },
      { id: 'h', label: '[H₃O⁺]' },
      { id: 'oh', label: '[OH⁻]' },
      { id: 'alfa', label: 'Derajat ionisasi / tetapan' },
      { id: 'sifat', label: 'Sifat larutan' },
      { id: 'teori', label: 'Menurut teori terpilih' }
    ],

    bangun: function (s) {
      s.tambah(S.lantai({ r: 8.5, warna: 0x0b1118 }));

      /* ---------- gelas larutan ---------- */
      const gls = S.gelas({ r: 1.5, h: 2.1, level: 0.72, warna: 0xdfe8ee, opacity: 0.6 });
      s.data.gls = gls;
      s.tambah(gls);

      /* ---------- pH meter ---------- */
      const badan = new T.Mesh(new T.BoxGeometry(1.5, 1.0, 0.5),
        new T.MeshStandardMaterial({ color: 0x232d36, roughness: 0.5, metalness: 0.3 }));
      badan.position.set(2.9, 1.5, 0);
      s.tambah(badan);
      const layar = new T.Mesh(new T.BoxGeometry(1.18, 0.6, 0.05),
        new T.MeshStandardMaterial({ color: 0x08181a, roughness: 0.3,
          emissive: 0x0a2a2c, emissiveIntensity: 0.6 }));
      layar.position.set(2.9, 1.62, 0.27);
      s.tambah(layar);
      const angka = S.teks('7,00', { skala: 0.4, lebar: 8, latar: false, warna: '#4fd1c0' });
      angka.position.set(2.9, 1.62, 0.33);
      s.data.angka = angka;
      s.tambah(angka);
      const lblPH = S.teks('pH', { skala: 0.22, lebar: 5, latar: false, warna: '#7f8f9c' });
      lblPH.position.set(2.9, 1.05, 0.3);
      s.tambah(lblPH);

      // kabel + elektrode masuk ke gelas
      const kurva = new T.CatmullRomCurve3([
        new T.Vector3(2.4, 1.9, 0.1), new T.Vector3(1.6, 2.7, 0.2),
        new T.Vector3(0.7, 2.6, 0.3), new T.Vector3(0.55, 1.9, 0.25)
      ]);
      const kabel = new T.Mesh(new T.TubeGeometry(kurva, 50, 0.04, 10, false),
        new T.MeshStandardMaterial({ color: 0x2c3b4a, roughness: 0.6 }));
      s.tambah(kabel);
      const probe = new T.Mesh(new T.CylinderGeometry(0.1, 0.1, 1.9, 20),
        new T.MeshPhysicalMaterial({ color: 0xcfe6f2, roughness: 0.1, transparent: true,
          opacity: 0.4, side: T.DoubleSide }));
      probe.position.set(0.55, 1.0, 0.25);
      s.tambah(probe);
      const ujung = new T.Mesh(S.geoBola(18), S.matLogam(0xd8c080));
      ujung.scale.setScalar(0.11);
      ujung.position.set(0.55, 0.1, 0.25);
      s.tambah(ujung);

      /* ---------- ion di dalam larutan ---------- */
      const ionH = S.partikel(90, { r: 0.085, warna: 0xef6a52, kotak: { x: 1.2, y: 0.6, z: 1.2 } });
      const ionOH = S.partikel(90, { r: 0.1, warna: 0x6fb6ff, kotak: { x: 1.2, y: 0.6, z: 1.2 } });
      const netral = S.partikel(90, { r: 0.11, warna: 0xdfe8ee, kotak: { x: 1.2, y: 0.6, z: 1.2 } });
      [ionH, ionOH, netral].forEach(function (p) {
        p.position.y = 0.78;
        p.material.transparent = true;
        p.material.opacity = 0.95;
        s.tambah(p);
      });
      s.data.ionH = ionH; s.data.ionOH = ionOH; s.data.netral = netral;

      /* ---------- pita skala pH ---------- */
      const pita = new T.Group();
      for (let i = 0; i <= 14; i++) {
        const c = warnaPH(i);
        const m = new T.Mesh(new T.BoxGeometry(0.4, 0.3, 0.06),
          new T.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.35,
            roughness: 0.45 }));
        m.position.set(-3.0 + i * 0.42, 3.9, 0);
        pita.add(m);
        if (i % 2 === 0) {
          const t = S.teks(String(i), { skala: 0.2, lebar: 4, latar: false, warna: '#aebbc6' });
          t.position.set(-3.0 + i * 0.42, 3.58, 0);
          pita.add(t);
        }
      }
      const penunjuk = new T.Mesh(new T.ConeGeometry(0.13, 0.26, 16),
        new T.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.8 }));
      penunjuk.rotation.x = Math.PI;
      penunjuk.position.set(0, 4.3, 0);
      pita.add(penunjuk);
      s.data.penunjuk = penunjuk;
      s.data.pita = pita;
      s.tambah(pita);

      /* ---------- model molekul serah-terima ---------- */
      const gm = new T.Group();
      gm.position.set(-3.6, 1.6, 0);
      s.data.gm = gm;
      s.tambah(gm);

      const lblM = S.teks('', { skala: 0.28, lebar: 26, warna: '#aebbc6' });
      lblM.position.set(-3.6, 3.0, 0);
      s.data.lblM = lblM;
      s.tambah(lblM);

      const lbl = S.teks('', { skala: 0.38, lebar: 36, warna: '#d8e4ec' });
      lbl.position.set(0, 4.9, 0);
      s.data.lbl = lbl;
      s.tambah(lbl);

      s.data.t = 0;
      s.data.jalan = false;
      pasang(s);
    },

    ubah: function (s, id) {
      if (id === 'z' || id === 'c') pasang(s);
      if (id === 'teori') { pasangModel(s); s.data.t = 0; s.data.jalan = false; }
      if (id === 'ion') {
        [s.data.ionH, s.data.ionOH, s.data.netral].forEach(function (p) {
          p.visible = s.get('ion');
        });
      }
      if (id === 'skala') s.data.pita.visible = s.get('skala');
      if (id === 'molekul') { s.data.gm.visible = s.get('molekul'); s.data.lblM.visible = s.get('molekul'); }
    },

    langkah: function (s, dt) {
      const h = hitung(s);
      s.data.ionH.userData.gerak(dt, 1.1);
      s.data.ionOH.userData.gerak(dt, 0.9);
      s.data.netral.userData.gerak(dt, 0.7);

      // penunjuk skala meluncur ke posisi pH
      const x = -3.0 + h.pH * 0.42;
      s.data.penunjuk.position.x = S.lerp(s.data.penunjuk.position.x, x, dt * 5);
      const c = warnaPH(h.pH);
      s.data.penunjuk.material.color.copy(c);
      s.data.penunjuk.material.emissive.copy(c);

      // layar pH meter
      s.data.angka.userData.ganti(S.fmt(h.pH, 2), '#' + c.getHexString());

      // animasi serah-terima proton / pasangan elektron
      if (s.data.jalan) s.data.t = Math.min(1, s.data.t + dt * 0.45);
      const t = s.data.t;
      if (s.data.pindah) {
        const a = s.data.pindahDari, b = s.data.pindahKe;
        s.data.pindah.position.lerpVectors(a, b, mulus(t));
        s.data.pindah.position.y += Math.sin(Math.PI * t) * 0.35;
        s.data.pindah.material.emissiveIntensity = 0.6 + Math.sin(s.waktu * 6) * 0.3;
      }
      if (s.get('molekul')) s.data.gm.rotation.y += dt * 0.25;
    },

    bacaUbah: function (s) {
      const h = hitung(s);
      const z = h.z;
      s.baca('ph', S.fmt(h.pH, 2),
        h.pH < 6 ? 'danger' : h.pH > 8 ? 'biru' : 'aksen');
      s.baca('h', S.fmtRapi(h.H) + ' M');
      s.baca('oh', S.fmtRapi(h.OH) + ' M');
      s.baca('alfa', z.j === 'al' ? 'Ka = ' + S.fmtRapi(z.ka) + '   α = '
        + S.fmt(h.alfa * 100, 2) + ' %   pKa = ' + S.fmt(-Math.log10(z.ka), 2)
        : z.j === 'bl' ? 'Kb = ' + S.fmtRapi(z.kb) + '   α = '
          + S.fmt(h.alfa * 100, 2) + ' %   pKb = ' + S.fmt(-Math.log10(z.kb), 2)
          : z.j === 'lewis' ? 'Tidak punya Ka/Kb — asam Lewis'
            : 'Terionisasi sempurna (α = 100 %), valensi ' + z.val);
      s.baca('sifat', h.pH < 3 ? 'Asam kuat' : h.pH < 6.5 ? 'Asam'
        : h.pH < 7.5 ? 'Mendekati netral' : h.pH < 11 ? 'Basa' : 'Basa kuat',
        h.pH < 6.5 ? 'danger' : h.pH > 7.5 ? 'biru' : 'aksen');
      const tr = s.get('teori');
      s.baca('teori', TEORI[tr].n + ': ' + (tr === 'arrhenius' ? z.ar : tr === 'bronsted' ? z.br : z.le));
    }
  };

  function mulus(t) { return t * t * (3 - 2 * t); }

  /* ---------------- model molekul untuk tiap teori ---------------- */
  function pasangModel(s) {
    const g = s.data.gm;
    while (g.children.length) S.buangObjek(g.children.pop());
    s.data.pindah = null;

    const tr = s.get('teori');
    const z = zat(s);
    const asamBasa = z.j === 'ak' || z.j === 'al' ? 'asam' : z.j === 'lewis' ? 'lewis' : 'basa';

    if (tr === 'arrhenius') {
      // HA → H⁺ + A⁻  atau  BOH → B⁺ + OH⁻
      const inti = S.atom(asamBasa === 'asam' ? 'Cl' : 'Na', [0, 0, 0], { skala: 0.85 });
      g.add(inti);
      const ion = S.atom(asamBasa === 'asam' ? 'H' : 'O', [0.95, 0.25, 0], { skala: 0.8 });
      g.add(ion);
      g.add(S.ikatan([0, 0, 0], [0.95, 0.25, 0], { tebal: 0.06 }));
      const bola = new T.Mesh(S.geoBola(18), new T.MeshStandardMaterial({
        color: asamBasa === 'asam' ? 0xef6a52 : 0x6fb6ff,
        emissive: asamBasa === 'asam' ? 0xef6a52 : 0x6fb6ff, emissiveIntensity: 0.7
      }));
      bola.scale.setScalar(0.2);
      g.add(bola);
      s.data.pindah = bola;
      s.data.pindahDari = new T.Vector3(0.95, 0.25, 0);
      s.data.pindahKe = new T.Vector3(2.4, 0.5, 0);
      s.data.lblM.userData.ganti(asamBasa === 'asam'
        ? 'HA → H⁺ + A⁻  (melepas H⁺ di air)'
        : 'BOH → B⁺ + OH⁻  (melepas OH⁻ di air)');
    } else if (tr === 'bronsted') {
      // HA + H2O → A⁻ + H3O⁺ : proton melompat
      const ha = S.molekul({ atom: [['Cl', -1.1, 0, 0], ['H', -0.3, 0.3, 0]],
        ikatan: [[0, 1, 1]] }, { skalaAtom: 0.7, tebal: 0.06 });
      g.add(ha);
      const air = S.molekul({ atom: [['O', 1.5, 0, 0], ['H', 2.1, 0.55, 0.3], ['H', 2.1, -0.4, -0.4]],
        ikatan: [[0, 1, 1], [0, 2, 1]] }, { skalaAtom: 0.7, tebal: 0.06 });
      g.add(air);
      const proton = new T.Mesh(S.geoBola(18), new T.MeshStandardMaterial({
        color: 0xef6a52, emissive: 0xef6a52, emissiveIntensity: 0.8
      }));
      proton.scale.setScalar(0.19);
      g.add(proton);
      s.data.pindah = proton;
      s.data.pindahDari = new T.Vector3(-0.3, 0.3, 0);
      s.data.pindahKe = new T.Vector3(1.0, 0.25, 0);
      g.add(S.panah([-0.2, 0.9, 0], [1.0, 0.9, 0], { warna: 0xf0d040, tebal: 0.035, kepala: 0.2 }));
      s.data.lblM.userData.ganti('HA + H₂O → A⁻ + H₃O⁺  (proton berpindah)');
    } else {
      // Lewis: NH3 (donor) → BF3 (akseptor)
      const nh3 = S.molekul({ atom: [['N', -1.3, 0, 0], ['H', -1.9, 0.6, 0.4],
        ['H', -1.9, -0.5, 0.5], ['H', -1.7, 0.1, -0.8]],
        ikatan: [[0, 1, 1], [0, 2, 1], [0, 3, 1]] }, { skalaAtom: 0.66, tebal: 0.055 });
      g.add(nh3);
      const bf3 = S.molekul({ atom: [['Al', 1.5, 0, 0], ['F', 2.3, 0.7, 0],
        ['F', 2.3, -0.7, 0.2], ['F', 1.4, -0.2, -0.95]],
        ikatan: [[0, 1, 1], [0, 2, 1], [0, 3, 1]] }, { skalaAtom: 0.6, tebal: 0.055 });
      g.add(bf3);
      // pasangan elektron bebas
      const pas = new T.Group();
      for (let i = 0; i < 2; i++) {
        const e = new T.Mesh(S.geoBola(14), new T.MeshStandardMaterial({
          color: 0x8fd8ff, emissive: 0x4fa8e8, emissiveIntensity: 1.3
        }));
        e.scale.setScalar(0.085);
        e.position.set(0, i === 0 ? 0.1 : -0.1, 0);
        pas.add(e);
      }
      pas.position.set(-0.75, 0.25, 0);
      g.add(pas);
      s.data.pindah = pas;
      s.data.pindahDari = new T.Vector3(-0.75, 0.25, 0);
      s.data.pindahKe = new T.Vector3(1.0, 0.1, 0);
      g.add(S.panah([-0.6, 0.95, 0], [1.1, 0.95, 0], { warna: 0x9fe8ad, tebal: 0.035, kepala: 0.2 }));
      s.data.lblM.userData.ganti('NH₃ : → BF₃   (pasangan elektron diberikan)');
    }
    g.visible = s.get('molekul');
    s.data.lblM.visible = s.get('molekul');
  }

  function pasang(s) {
    const h = hitung(s);
    const z = h.z;

    // warna larutan mengikuti pH (seperti indikator universal)
    const c = warnaPH(h.pH);
    s.data.gls.userData.setLevel(0.72, c.getHex());
    s.data.gls.userData.setOpasitas(S.opasitasCair(c.getHex(), 0.74));

    // jumlah ion sebanding log konsentrasi ion
    function jumlah(konsen) {
      return Math.round(S.clamp((Math.log10(Math.max(1e-14, konsen)) + 14) / 14, 0, 1) * 90);
    }
    atur(s.data.ionH, jumlah(h.H));
    atur(s.data.ionOH, jumlah(h.OH));
    atur(s.data.netral, Math.round(S.clamp(1 - h.alfa, 0, 1) * 60));
    [s.data.ionH, s.data.ionOH, s.data.netral].forEach(function (p) {
      p.visible = s.get('ion');
    });
    s.data.netral.material.color.setHex(z.warna);
    s.data.netral.material.emissive.setHex(z.warna);

    s.data.pita.visible = s.get('skala');
    s.data.lbl.userData.ganti(z.n + '   ' + S.fmtRapi(s.get('c')) + ' M');
    pasangModel(s);
  }

  function atur(p, n) {
    const d = p.userData.p;
    for (let i = 0; i < d.length; i++) {
      if (!d[i].aktif && i < n) d[i].pos.set(S.acak(-1, 1), S.acak(-0.5, 0.5), S.acak(-1, 1));
      d[i].aktif = i < n;
    }
    p.userData.tulis();
  }
})());
