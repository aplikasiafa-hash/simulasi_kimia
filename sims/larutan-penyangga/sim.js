/* Larutan Penyangga (Buffer) — Fase F — adegan 3D */

Sim3D.daftar('larutan-penyangga', (function () {
  'use strict';
  const T = THREE, S = S3;

  const KW = 1e-14;

  const BUFFER = [
    { n: 'CH₃COOH / CH₃COO⁻', ka: 1.8e-5, jenis: 'asam', pel: 'asetat' },
    { n: 'H₂CO₃ / HCO₃⁻ (darah)', ka: 4.3e-7, jenis: 'asam', pel: 'karbonat' },
    { n: 'H₂PO₄⁻ / HPO₄²⁻ (dalam sel)', ka: 6.2e-8, jenis: 'asam', pel: 'fosfat' },
    { n: 'NH₄⁺ / NH₃', ka: 5.6e-10, jenis: 'basa', pel: 'amonium' },
    { n: 'HCOOH / HCOO⁻', ka: 1.8e-4, jenis: 'asam', pel: 'format' }
  ];

  function buffer(s) { return BUFFER[parseInt(s.get('b'), 10) || 0]; }

  /* pH buffer setelah penambahan mmol asam (+) atau basa (−) kuat */
  function phBuffer(s, tambah) {
    const b = buffer(s);
    const V = s.get('v') / 1000;
    let na = s.get('ca') * V * 1000;     // mmol asam lemah
    let ng = s.get('cg') * V * 1000;     // mmol basa konjugat
    if (tambah > 0) { na += tambah; ng -= tambah; }     // asam kuat ditambahkan
    else { na += tambah; ng -= tambah; }                 // basa kuat: tambah<0 → na turun, ng naik
    const pKa = -Math.log10(b.ka);
    if (ng <= 0.0001) {
      // kapasitas habis: sisa asam kuat berlebih
      const sisa = (tambah > 0 ? tambah - s.get('cg') * V * 1000 : 0);
      const H = Math.max(1e-7, (sisa / 1000) / V);
      return S.clamp(-Math.log10(H), 0, 14);
    }
    if (na <= 0.0001) {
      const sisa = (tambah < 0 ? -tambah - s.get('ca') * V * 1000 : 0);
      const OH = Math.max(1e-7, (sisa / 1000) / V);
      return S.clamp(14 + Math.log10(OH), 0, 14);
    }
    return S.clamp(pKa + Math.log10(ng / na), 0, 14);
  }

  /* pH air murni setelah penambahan mmol asam/basa kuat yang sama */
  function phAir(s, tambah) {
    const V = s.get('v') / 1000;
    if (Math.abs(tambah) < 1e-9) return 7;
    if (tambah > 0) {
      const H = (tambah / 1000) / V;
      return S.clamp(-Math.log10(H), 0, 14);
    }
    const OH = (-tambah / 1000) / V;
    return S.clamp(14 + Math.log10(OH), 0, 14);
  }

  function warnaPH(p) {
    const titik = [
      [0, 0xd02020], [2, 0xe85a20], [4, 0xf0a030], [6, 0xd8d040],
      [7, 0x60c860], [8, 0x40b8a0], [10, 0x3878d0], [12, 0x5030b0], [14, 0x30107a]
    ];
    for (let i = 0; i < titik.length - 1; i++) {
      if (p <= titik[i + 1][0]) {
        const u = (p - titik[i][0]) / (titik[i + 1][0] - titik[i][0]);
        return new T.Color(titik[i][1]).lerp(new T.Color(titik[i + 1][1]), u);
      }
    }
    return new T.Color(0x30107a);
  }

  return {
    latar: 0x070c12,
    kamera: { jarak: 11.5, phi: 1.06, theta: 0.5, targetY: 1.5, lajuPutar: 0.1 },

    kendali: [
      { judul: 'Penyangga', isi: [
        { type: 'select', id: 'b', value: 0, label: 'Pasangan penyangga',
          options: BUFFER.map(function (b, i) { return { value: i, label: b.n }; }) },
        { type: 'slider', id: 'ca', value: 0.1, min: 0.01, max: 0.5, step: 0.01,
          label: 'Konsentrasi asam lemah', unit: ' M', dec: 2 },
        { type: 'slider', id: 'cg', value: 0.1, min: 0.01, max: 0.5, step: 0.01,
          label: 'Konsentrasi basa konjugat', unit: ' M', dec: 2 },
        { type: 'slider', id: 'v', value: 100, min: 25, max: 250, step: 5,
          label: 'Volume larutan', unit: ' mL', dec: 0 }
      ]},
      { judul: 'Penambahan', isi: [
        { type: 'slider', id: 'tambah', value: 0, min: -20, max: 20, step: 0.1,
          label: 'Asam kuat (+) / basa kuat (−)', unit: ' mmol', dec: 1 },
        { type: 'buttons', label: '', items: [
          { label: '＋ Teteskan HCl', utama: true, klik: function (s) { s.data.alir = 1; } },
          { label: '− Teteskan NaOH', klik: function (s) { s.data.alir = -1; } },
          { label: '⏸ Berhenti', klik: function (s) { s.data.alir = 0; } },
          { label: '↺ Ulangi', klik: function (s) { s.set('tambah', 0); s.data.alir = 0; } }
        ]}
      ]},
      { judul: 'Tampilan', isi: [
        { type: 'toggle', id: 'grafik', value: true, label: 'Tampilkan grafik perbandingan' },
        { type: 'toggle', id: 'ion', value: true, label: 'Tampilkan partikel di larutan' }
      ]}
    ],

    baca: [
      { id: 'phb', label: 'pH larutan penyangga', tone: 'aksen' },
      { id: 'pha', label: 'pH air biasa (pembanding)' },
      { id: 'geser', label: 'Pergeseran pH' },
      { id: 'pka', label: 'pKa dan perbandingan' },
      { id: 'kapasitas', label: 'Kapasitas penyangga' },
      { id: 'status', label: 'Keadaan' }
    ],

    bangun: function (s) {
      s.tambah(S.lantai({ r: 9.5, warna: 0x0b1118 }));

      /* dua gelas berdampingan */
      function unit(x, judul, warnaJudul) {
        const g = new T.Group();
        const gls = S.gelas({ r: 1.3, h: 2.1, level: 0.66, warna: 0x60c860, opacity: 0.62 });
        g.add(gls);
        const t = S.teks(judul, { skala: 0.3, lebar: 20, warna: warnaJudul });
        t.position.set(0, -0.55, 0);
        g.add(t);
        g.position.set(x, 0.05, 0);
        g.userData.gls = gls;
        return g;
      }
      const uB = unit(-2.0, 'larutan penyangga', '#9fe8ad');
      const uA = unit(2.0, 'air biasa', '#6fb6ff');
      s.data.uB = uB; s.data.uA = uA;
      s.tambah(uB); s.tambah(uA);

      /* pH meter di atas tiap gelas */
      function meter(x, warna) {
        const g = new T.Group();
        const badan = new T.Mesh(new T.BoxGeometry(1.2, 0.72, 0.4),
          new T.MeshStandardMaterial({ color: 0x232d36, roughness: 0.5, metalness: 0.3 }));
        g.add(badan);
        const layar = new T.Mesh(new T.BoxGeometry(0.95, 0.42, 0.05),
          new T.MeshStandardMaterial({ color: 0x08181a, emissive: 0x0a2a2c, emissiveIntensity: 0.6 }));
        layar.position.z = 0.22;
        g.add(layar);
        const angka = S.teks('7,00', { skala: 0.3, lebar: 8, latar: false, warna: warna });
        angka.position.z = 0.28;
        g.add(angka);
        g.userData.angka = angka;
        return g;
      }
      const mB = meter(0, '#4fd1c0');
      mB.position.set(-2.0, 3.5, 0);
      const mA = meter(0, '#6fb6ff');
      mA.position.set(2.0, 3.5, 0);
      s.data.mB = mB; s.data.mA = mA;
      s.tambah(mB); s.tambah(mA);

      // elektrode menjulur ke dalam gelas
      [[-2.0, mB], [2.0, mA]].forEach(function (p) {
        const probe = new T.Mesh(new T.CylinderGeometry(0.075, 0.075, 1.7, 18),
          new T.MeshPhysicalMaterial({ color: 0xcfe6f2, roughness: 0.1, transparent: true,
            opacity: 0.4, side: T.DoubleSide }));
        probe.position.set(p[0] + 0.45, 2.2, 0.2);
        s.tambah(probe);
      });

      /* pipet penambah */
      const pipet = new T.Group();
      const badanP = new T.Mesh(new T.CylinderGeometry(0.14, 0.14, 1.6, 20),
        new T.MeshPhysicalMaterial({ color: 0xcfe6f2, roughness: 0.06, transparent: true,
          opacity: 0.3, side: T.DoubleSide, depthWrite: false }));
      pipet.add(badanP);
      const isiP = new T.Mesh(new T.CylinderGeometry(0.11, 0.11, 1.1, 18),
        S.matCairan(0xef6a52, { opacity: 0.85 }));
      isiP.position.y = -0.1;
      pipet.add(isiP);
      s.data.isiP = isiP;
      const ujungP = new T.Mesh(new T.ConeGeometry(0.13, 0.4, 18),
        new T.MeshPhysicalMaterial({ color: 0xcfe6f2, roughness: 0.06, transparent: true,
          opacity: 0.3, side: T.DoubleSide, depthWrite: false }));
      ujungP.position.y = -1.0;
      ujungP.rotation.x = Math.PI;
      pipet.add(ujungP);
      const karet = new T.Mesh(S.geoBola(18),
        new T.MeshStandardMaterial({ color: 0xd04a5a, roughness: 0.8 }));
      karet.scale.set(0.2, 0.26, 0.2);
      karet.position.y = 1.0;
      pipet.add(karet);
      pipet.position.set(0, 4.4, 0);
      s.data.pipet = pipet;
      s.tambah(pipet);

      /* tetesan jatuh ke dua gelas */
      const tetes = [];
      for (let i = 0; i < 8; i++) {
        const m = new T.Mesh(S.geoBola(12),
          new T.MeshStandardMaterial({ color: 0xef6a52, emissive: 0xef6a52,
            emissiveIntensity: 0.5, roughness: 0.2 }));
        m.scale.setScalar(0.07);
        m.visible = false;
        s.tambah(m);
        tetes.push({ m: m, y: 9, x: i % 2 === 0 ? -2.0 : 2.0 });
      }
      s.data.tetesan = tetes;

      /* partikel di dalam tiap gelas */
      function awan(x, warna, n) {
        const p = S.partikel(n, { r: 0.085, warna: warna, kotak: { x: 1, y: 0.55, z: 1 } });
        p.position.set(x, 0.75, 0);
        p.material.transparent = true;
        p.material.opacity = 0.9;
        return p;
      }
      s.data.pHA = awan(-2.0, 0xf0a94a, 70);   // asam lemah
      s.data.pGA = awan(-2.0, 0x6fb6ff, 70);   // basa konjugat
      s.data.pAir = awan(2.0, 0xdfe8ee, 50);   // molekul air
      [s.data.pHA, s.data.pGA, s.data.pAir].forEach(function (p) { s.tambah(p); });

      /* panel grafik */
      const g1 = S.panelGrafik({ w: 5.2, px: 740, py: 460 });
      g1.position.set(0, 6.1, -1.4);
      s.data.g1 = g1;
      s.tambah(g1);

      const lbl = S.teks('', { skala: 0.36, lebar: 38, warna: '#d8e4ec' });
      lbl.position.set(0, 8.6, -1.4);
      s.data.lbl = lbl;
      s.tambah(lbl);

      s.data.alir = 0;
      pasang(s);
    },

    ubah: function (s, id) {
      if (id === 'b' || id === 'ca' || id === 'cg' || id === 'v') pasang(s);
      if (id === 'grafik') s.data.g1.visible = s.get('grafik');
      if (id === 'ion') {
        [s.data.pHA, s.data.pGA, s.data.pAir].forEach(function (p) { p.visible = s.get('ion'); });
      }
      perbarui(s);
    },

    langkah: function (s, dt) {
      // pipet mengalir
      if (s.data.alir !== 0) {
        const v = S.clamp(s.get('tambah') + s.data.alir * dt * 3.2, -20, 20);
        s.setDiam('tambah', v);
        if (Math.abs(v) >= 20) s.data.alir = 0;
        perbarui(s);
      }

      const tambah = s.get('tambah');
      const asam = tambah >= 0;
      const warna = asam ? 0xef6a52 : 0x6fb6ff;
      s.data.isiP.material.color.setHex(warna);
      s.data.pipet.position.x = S.lerp(s.data.pipet.position.x, 0, dt * 4);

      // tetesan
      s.data.tetesan.forEach(function (t) {
        if (s.data.alir !== 0 && t.y > 8 && Math.random() < dt * 3) t.y = 3.6;
        if (t.y < 8) {
          t.y -= dt * 4.6;
          t.m.visible = true;
          t.m.material.color.setHex(warna);
          t.m.material.emissive.setHex(warna);
          t.m.position.set(t.x, t.y, 0);
          if (t.y < 1.4) { t.y = 9; t.m.visible = false; }
        } else t.m.visible = false;
      });

      s.data.pHA.userData.gerak(dt, 0.8);
      s.data.pGA.userData.gerak(dt, 0.9);
      s.data.pAir.userData.gerak(dt, 0.7);
    },

    bacaUbah: function (s) {
      const b = buffer(s);
      const tambah = s.get('tambah');
      const pb = phBuffer(s, tambah);
      const pa = phAir(s, tambah);
      const pb0 = phBuffer(s, 0);
      const V = s.get('v') / 1000;
      const mmolA = s.get('ca') * V * 1000;
      const mmolG = s.get('cg') * V * 1000;
      const kapasitas = Math.min(mmolA, mmolG);
      const habis = tambah > mmolG + 0.001 || -tambah > mmolA + 0.001;

      s.baca('phb', S.fmt(pb, 2) + '   (awal ' + S.fmt(pb0, 2) + ')',
        Math.abs(pb - pb0) < 0.5 ? 'aksen' : 'warn');
      s.baca('pha', S.fmt(pa, 2) + '   (awal 7,00)', 'danger');
      s.baca('geser', 'penyangga ' + (pb - pb0 >= 0 ? '+' : '') + S.fmt(pb - pb0, 2)
        + '   vs air ' + (pa - 7 >= 0 ? '+' : '') + S.fmt(pa - 7, 2));
      s.baca('pka', 'pKa = ' + S.fmt(-Math.log10(b.ka), 2) + '   [basa]/[asam] = '
        + S.fmt(Math.max(0.001, (mmolG - tambah)) / Math.max(0.001, (mmolA + tambah)), 2));
      s.baca('kapasitas', S.fmt(kapasitas, 1) + ' mmol asam/basa kuat masih dapat ditahan',
        kapasitas > 5 ? 'aksen' : 'warn');
      s.baca('status', habis
        ? 'Kapasitas penyangga terlampaui — pH melonjak seperti air biasa'
        : Math.abs(tambah) < 0.05 ? 'Belum ada penambahan'
          : 'Penyangga masih bekerja — pH hampir tak bergerak',
        habis ? 'danger' : Math.abs(tambah) < 0.05 ? undefined : 'aksen');
      gambar(s);
    }
  };

  function perbarui(s) {
    const tambah = s.get('tambah');
    const pb = phBuffer(s, tambah);
    const pa = phAir(s, tambah);
    const cb = warnaPH(pb), ca = warnaPH(pa);
    s.data.uB.userData.gls.userData.setLevel(0.66, cb.getHex());
    s.data.uA.userData.gls.userData.setLevel(0.66, ca.getHex());
    s.data.mB.userData.angka.userData.ganti(S.fmt(pb, 2), '#' + cb.getHexString());
    s.data.mA.userData.angka.userData.ganti(S.fmt(pa, 2), '#' + ca.getHexString());

    // jumlah partikel asam lemah vs basa konjugat
    const V = s.get('v') / 1000;
    const mmolA = s.get('ca') * V * 1000 + Math.max(0, tambah) - Math.max(0, -tambah) * 0;
    const na = Math.max(0.001, s.get('ca') * V * 1000 + tambah);
    const ng = Math.max(0.001, s.get('cg') * V * 1000 - tambah);
    const tot = na + ng;
    atur(s.data.pHA, Math.round(na / tot * 70));
    atur(s.data.pGA, Math.round(ng / tot * 70));
    gambar(s);
  }

  function atur(p, n) {
    const d = p.userData.p;
    for (let i = 0; i < d.length; i++) {
      if (!d[i].aktif && i < n) d[i].pos.set(S.acak(-0.9, 0.9), S.acak(-0.45, 0.45), S.acak(-0.9, 0.9));
      d[i].aktif = i < n;
    }
    p.userData.tulis();
  }

  function gambar(s) {
    if (!s.data.g1 || !s.data.g1.visible) return;
    const kB = [], kA = [];
    for (let i = -40; i <= 40; i++) {
      const x = i / 2;
      kB.push([x, phBuffer(s, x)]);
      kA.push([x, phAir(s, x)]);
    }
    const tambah = s.get('tambah');
    S.gambarGrafik(s.data.g1, {
      judul: 'pH terhadap jumlah asam/basa kuat yang ditambahkan',
      xMin: -20, xMax: 20, yMin: 0, yMax: 14,
      xLabel: 'mmol  (−) basa kuat  ←→  asam kuat (+)', yLabel: 'pH',
      seri: [
        { titik: kA, warna: '#6fb6ff', tebal: 2.6, putus: true, nama: 'air biasa' },
        { titik: kB, warna: '#9fe8ad', tebal: 3.4, nama: 'larutan penyangga' }
      ],
      garisX: [{ v: 0, warna: 'rgba(214,228,240,.35)' }],
      garisY: [{ v: phBuffer(s, 0), warna: 'rgba(79,209,192,.7)',
        label: 'pH awal penyangga ' + S.fmt(phBuffer(s, 0), 2) }],
      titikTebal: [
        { x: tambah, y: phBuffer(s, tambah), warna: '#9fe8ad', r: 7 },
        { x: tambah, y: phAir(s, tambah), warna: '#6fb6ff', r: 6 }
      ]
    });
  }

  function pasang(s) {
    const b = buffer(s);
    s.data.alir = 0;
    s.data.g1.visible = s.get('grafik');
    [s.data.pHA, s.data.pGA, s.data.pAir].forEach(function (p) { p.visible = s.get('ion'); });
    s.data.lbl.userData.ganti('Penyangga ' + b.n + '  dibandingkan dengan air murni');
    perbarui(s);
  }
})());
