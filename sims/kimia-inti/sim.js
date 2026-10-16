/* Kimia Inti: Peluruhan Radioaktif — Fase F — adegan 3D */

Sim3D.daftar('kimia-inti', (function () {
  'use strict';
  const T = THREE, S = S3;

  /* t½ dalam detik; satuan tampil disesuaikan */
  const ISOTOP = [
    { n: 'C-14 (penanggalan)', Z: 6, A: 14, jenis: 'beta', t: 1.8084e11, sat: 'tahun', bagi: 3.156e7,
      anak: 'N-14', guna: 'penanggalan fosil & artefak' },
    { n: 'U-238', Z: 92, A: 238, jenis: 'alfa', t: 1.41e17, sat: 'tahun', bagi: 3.156e7,
      anak: 'Th-234', guna: 'penanggalan batuan, bahan bakar nuklir' },
    { n: 'U-235', Z: 92, A: 235, jenis: 'alfa', t: 2.22e16, sat: 'tahun', bagi: 3.156e7,
      anak: 'Th-231', guna: 'bahan bakar reaktor nuklir' },
    { n: 'Ra-226', Z: 88, A: 226, jenis: 'alfa', t: 5.05e10, sat: 'tahun', bagi: 3.156e7,
      anak: 'Rn-222', guna: 'sejarah penelitian radioaktivitas' },
    { n: 'I-131 (tiroid)', Z: 53, A: 131, jenis: 'beta', t: 6.93e5, sat: 'hari', bagi: 86400,
      anak: 'Xe-131', guna: 'diagnosis & terapi kelenjar tiroid' },
    { n: 'Co-60 (radioterapi)', Z: 27, A: 60, jenis: 'gama', t: 1.66e8, sat: 'tahun', bagi: 3.156e7,
      anak: 'Ni-60', guna: 'radioterapi kanker, sterilisasi alat' },
    { n: 'Tc-99m (pencitraan)', Z: 43, A: 99, jenis: 'gama', t: 21600, sat: 'jam', bagi: 3600,
      anak: 'Tc-99', guna: 'pencitraan organ (kedokteran nuklir)' },
    { n: 'P-32 (pupuk tertanda)', Z: 15, A: 32, jenis: 'beta', t: 1.23e6, sat: 'hari', bagi: 86400,
      anak: 'S-32', guna: 'menelusuri serapan pupuk oleh tanaman' },
    { n: 'Na-24', Z: 11, A: 24, jenis: 'beta', t: 53856, sat: 'jam', bagi: 3600,
      anak: 'Mg-24', guna: 'mendeteksi kebocoran pipa' },
    { n: 'Po-210', Z: 84, A: 210, jenis: 'alfa', t: 1.2e7, sat: 'hari', bagi: 86400,
      anak: 'Pb-206', guna: 'sumber partikel alfa' }
  ];

  const JENIS = {
    alfa: { n: 'Peluruhan alfa (α)', dZ: -2, dA: -4, warna: 0xef6a52,
      partikel: '⁴₂He (inti helium)', tembus: 'tertahan kertas, jangkauan beberapa cm di udara' },
    beta: { n: 'Peluruhan beta (β⁻)', dZ: 1, dA: 0, warna: 0x6fb6ff,
      partikel: '⁰₋₁e (elektron)', tembus: 'tertahan lempeng aluminium beberapa mm' },
    gama: { n: 'Pancaran gama (γ)', dZ: 0, dA: 0, warna: 0x9fe8ad,
      partikel: 'foton berenergi tinggi', tembus: 'perlu timbal atau beton tebal' }
  };

  const N0 = 160;

  function isotop(s) { return ISOTOP[parseInt(s.get('i'), 10) || 0]; }

  function sisa(s) {
    const z = isotop(s);
    const n = s.get('paruh');            // berapa kali waktu paruh berlalu
    return Math.pow(0.5, n);
  }

  return {
    latar: 0x05090e,
    kamera: { jarak: 12, phi: 1.06, theta: 0.6, targetY: 0.6, lajuPutar: 0.14 },

    kendali: [
      { judul: 'Isotop', isi: [
        { type: 'select', id: 'i', value: 0, label: 'Inti radioaktif',
          options: ISOTOP.map(function (z, i) { return { value: i, label: z.n }; }) },
        { type: 'slider', id: 'paruh', value: 0, min: 0, max: 8, step: 0.02,
          label: 'Waktu yang berlalu', unit: ' × t½', dec: 2 },
        { type: 'buttons', label: '', items: [
          { label: '▶ Jalankan waktu', utama: true, klik: function (s) { s.data.jalan = true; } },
          { label: '⏸ Jeda', klik: function (s) { s.data.jalan = false; } },
          { label: '↺ Kembali ke awal', klik: function (s) {
            s.set('paruh', 0); s.data.jalan = false;
          }}
        ]},
        { type: 'slider', id: 'laju', value: 1, min: 0.2, max: 4, step: 0.1,
          label: 'Kecepatan waktu', unit: '×', dec: 1 }
      ]},
      { judul: 'Pancaran', isi: [
        { type: 'toggle', id: 'pancar', value: true, label: 'Tampilkan partikel yang dipancarkan' },
        { type: 'select', id: 'penghalang', value: 0, label: 'Penghalang yang dipasang',
          options: [
            { value: 0, label: 'Tanpa penghalang' },
            { value: 1, label: 'Kertas' },
            { value: 2, label: 'Aluminium 3 mm' },
            { value: 3, label: 'Timbal 5 cm' }
          ]},
        { type: 'toggle', id: 'detektor', value: true, label: 'Tampilkan detektor Geiger' }
      ]},
      { judul: 'Panel', isi: [
        { type: 'segment', id: 'panel', value: 'paruh', label: 'Grafik', options: [
          { value: 'paruh', label: 'Kurva peluruhan' },
          { value: 'umur', label: 'Penanggalan' }
        ]},
        { type: 'toggle', id: 'grafik', value: true, label: 'Tampilkan panel' }
      ]}
    ],

    baca: [
      { id: 'sisa', label: 'Inti yang belum meluruh', tone: 'aksen' },
      { id: 'paruh', label: 'Waktu paruh' },
      { id: 'waktu', label: 'Waktu yang berlalu' },
      { id: 'jenis', label: 'Jenis peluruhan' },
      { id: 'reaksi', label: 'Persamaan inti' },
      { id: 'tembus', label: 'Daya tembus / kegunaan' }
    ],

    bangun: function (s) {
      s.tambah(S.lantai({ r: 10, warna: 0x080d12, y: -2.8 }));

      /* ---------- awan inti: induk (belum meluruh) & anak ---------- */
      const induk = S.partikel(N0, { r: 0.13, warna: 0xf0a94a, kotak: { x: 1.9, y: 1.4, z: 1.9 } });
      const anak = S.partikel(N0, { r: 0.12, warna: 0x6fb6ff, kotak: { x: 1.9, y: 1.4, z: 1.9 } });
      [induk, anak].forEach(function (p) {
        p.position.set(-2.6, 0.4, 0);
        p.material.transparent = true;
        p.material.opacity = 0.95;
        s.tambah(p);
      });
      s.data.induk = induk; s.data.anak = anak;

      const kotak = new T.Mesh(new T.BoxGeometry(4.0, 3.0, 4.0),
        new T.MeshBasicMaterial({ color: 0x3a4a5a, wireframe: true, transparent: true,
          opacity: 0.16 }));
      kotak.position.set(-2.6, 0.4, 0);
      s.tambah(kotak);

      const lblSampel = S.teks('', { skala: 0.28, lebar: 22, warna: '#f0a94a' });
      lblSampel.position.set(-2.6, 2.3, 0);
      s.data.lblSampel = lblSampel;
      s.tambah(lblSampel);

      /* ---------- satu inti besar yang meluruh (model) ---------- */
      const gInti = new T.Group();
      gInti.position.set(2.6, 0.6, 0);
      s.data.gInti = gInti;
      s.tambah(gInti);

      s.data.nukleon = [];
      for (let i = 0; i < 64; i++) {
        const proton = i % 2 === 0;
        const m = new T.Mesh(S.geoBola(14), new T.MeshStandardMaterial({
          color: proton ? 0xef6a52 : 0xcfd6dc,
          emissive: proton ? 0xef6a52 : 0x8d97a1, emissiveIntensity: 0.22,
          roughness: 0.4
        }));
        m.scale.setScalar(0.13);
        // susunan bola padat acak
        const u = Math.random(), v = Math.random();
        const th = Math.acos(1 - 2 * u), ph = 2 * Math.PI * v;
        const rr = 0.52 * Math.cbrt(Math.random());
        m.position.set(rr * Math.sin(th) * Math.cos(ph), rr * Math.cos(th),
          rr * Math.sin(th) * Math.sin(ph));
        m.userData.asal = m.position.clone();
        m.userData.proton = proton;
        gInti.add(m);
        s.data.nukleon.push(m);
      }

      // halo inti
      const halo = new T.Mesh(S.geoBola(28), new T.MeshBasicMaterial({
        color: 0xf0a94a, transparent: true, opacity: 0.07, depthWrite: false
      }));
      halo.scale.setScalar(0.95);
      s.data.halo = halo;
      gInti.add(halo);

      const lblInti = S.teks('', { skala: 0.3, lebar: 16, warna: '#f0d040' });
      lblInti.position.set(2.6, 2.0, 0);
      s.data.lblInti = lblInti;
      s.tambah(lblInti);

      /* ---------- partikel yang dipancarkan ---------- */
      const pancar = [];
      for (let i = 0; i < 24; i++) {
        const m = new T.Mesh(S.geoBola(12), new T.MeshStandardMaterial({
          color: 0xef6a52, emissive: 0xef6a52, emissiveIntensity: 1.4, roughness: 0.3
        }));
        m.scale.setScalar(0.1);
        m.visible = false;
        s.tambah(m);
        pancar.push({ m: m, t: 9, arah: new T.Vector3(), mati: false });
      }
      s.data.pancar = pancar;

      /* ---------- penghalang ---------- */
      const hal = new T.Mesh(new T.BoxGeometry(0.2, 2.6, 2.6),
        new T.MeshStandardMaterial({ color: 0xd8d4c8, roughness: 0.8 }));
      hal.position.set(4.6, 0.6, 0);
      hal.visible = false;
      s.data.hal = hal;
      s.tambah(hal);
      const lblHal = S.teks('', { skala: 0.24, lebar: 18, warna: '#aebbc6' });
      lblHal.position.set(4.6, 2.2, 0);
      s.data.lblHal = lblHal;
      s.tambah(lblHal);

      /* ---------- detektor Geiger ---------- */
      const det = new T.Group();
      const tabung = new T.Mesh(new T.CylinderGeometry(0.25, 0.25, 1.4, 24),
        S.matLogam(0xb0b8c0, { roughness: 0.4 }));
      tabung.rotation.z = Math.PI / 2;
      det.add(tabung);
      const jendela = new T.Mesh(new T.CylinderGeometry(0.26, 0.26, 0.08, 24),
        new T.MeshStandardMaterial({ color: 0xf0e0a0, roughness: 0.4,
          emissive: 0xf0e0a0, emissiveIntensity: 0.2 }));
      jendela.rotation.z = Math.PI / 2;
      jendela.position.x = -0.72;
      det.add(jendela);
      const kotakD = new T.Mesh(new T.BoxGeometry(1.3, 0.9, 0.7),
        new T.MeshStandardMaterial({ color: 0x232d36, roughness: 0.5, metalness: 0.3 }));
      kotakD.position.set(1.3, -0.1, 0);
      det.add(kotakD);
      const layar = new T.Mesh(new T.BoxGeometry(1.0, 0.44, 0.05),
        new T.MeshStandardMaterial({ color: 0x08181a, emissive: 0x0a2a2c, emissiveIntensity: 0.6 }));
      layar.position.set(1.3, 0.04, 0.37);
      det.add(layar);
      const angka = S.teks('0 cpm', { skala: 0.26, lebar: 15, latar: false, warna: '#4fd1c0' });
      angka.position.set(1.3, 0.04, 0.42);
      det.add(angka);
      s.data.angkaDet = angka;
      det.position.set(6.4, 0.6, 0);
      s.data.det = det;
      s.tambah(det);

      /* ---------- panel grafik ---------- */
      const g1 = S.panelGrafik({ w: 5.2, px: 740, py: 460 });
      g1.position.set(0, 4.3, -2.2);
      s.data.g1 = g1;
      s.tambah(g1);

      const lbl = S.teks('', { skala: 0.38, lebar: 40, warna: '#d8e4ec' });
      lbl.position.set(0, 2.9, 0);
      s.data.lbl = lbl;
      s.tambah(lbl);

      s.data.jalan = false;
      s.data.cpm = 0;
      pasang(s);
    },

    ubah: function (s, id) {
      if (id === 'i') pasang(s);
      if (id === 'grafik') s.data.g1.visible = s.get('grafik');
      if (id === 'detektor') s.data.det.visible = s.get('detektor');
      if (id === 'penghalang') aturHalangan(s);
      if (id === 'pancar' && !s.get('pancar')) {
        s.data.pancar.forEach(function (q) { q.m.visible = false; q.t = 9; });
      }
      perbaruiJumlah(s);
      gambar(s);
    },

    langkah: function (s, dt) {
      const z = isotop(s);
      const j = JENIS[z.jenis];
      const dtl = dt * s.get('laju');

      if (s.data.jalan) {
        const v = Math.min(8, s.get('paruh') + dtl * 0.26);
        s.setDiam('paruh', v);
        perbaruiJumlah(s);
        gambar(s);
        if (v >= 8) s.data.jalan = false;
      }

      s.data.induk.userData.gerak(dtl, 0.45);
      s.data.anak.userData.gerak(dtl, 0.4);

      // inti besar bergetar; makin dekat meluruh makin kuat
      const f = sisa(s);
      const getar = 0.012 + (1 - f) * 0.03;
      s.data.nukleon.forEach(function (m, i) {
        m.position.copy(m.userData.asal);
        m.position.x += Math.sin(s.waktu * 5 + i) * getar;
        m.position.y += Math.cos(s.waktu * 4.3 + i * 1.7) * getar;
        m.position.z += Math.sin(s.waktu * 6.1 + i * 0.9) * getar;
      });
      s.data.gInti.rotation.y += dtl * 0.3;
      s.data.halo.material.opacity = 0.05 + (1 - f) * 0.07;
      s.data.halo.material.color.setHex(j.warna);

      // pancaran partikel: laju sebanding jumlah inti yang masih ada
      const laju = s.get('pancar') ? f * 2.6 + 0.05 : 0;
      let tercatat = 0;
      s.data.pancar.forEach(function (q, i) {
        q.t += dtl;
        if (q.t > 9 && laju > 0.02 && Math.random() < dtl * laju * 1.6) {
          q.t = 0;
          q.mati = false;
          const u = Math.random(), v = Math.random();
          const th = Math.acos(1 - 2 * u), ph = 2 * Math.PI * v;
          q.arah.set(Math.sin(th) * Math.cos(ph), Math.cos(th) * 0.5, Math.sin(th) * Math.sin(ph));
          // separuh diarahkan ke penghalang & detektor agar terlihat
          if (i % 2 === 0) q.arah.set(1, S.acak(-0.22, 0.22), S.acak(-0.22, 0.22)).normalize();
        }
        if (q.t < 9) {
          const jarak = q.t * 2.6;
          q.m.visible = !q.mati;
          q.m.position.copy(s.data.gInti.position).addScaledVector(q.arah, jarak);
          q.m.material.color.setHex(j.warna);
          q.m.material.emissive.setHex(j.warna);
          q.m.scale.setScalar(z.jenis === 'alfa' ? 0.12 : z.jenis === 'beta' ? 0.07 : 0.05);

          // tertahan penghalang?
          const hal = parseInt(s.get('penghalang'), 10) || 0;
          if (hal > 0 && q.m.position.x > 4.5 && !q.mati) {
            const lolos = z.jenis === 'alfa' ? hal < 1
              : z.jenis === 'beta' ? hal < 2 : hal < 3;
            if (!lolos) { q.mati = true; q.m.visible = false; }
          }
          if (!q.mati && q.m.position.x > 6.1 && q.m.position.x < 6.5) tercatat++;
          if (jarak > 11) { q.t = 9; q.m.visible = false; }
        } else q.m.visible = false;
      });

      // bacaan detektor (dihaluskan)
      const target = tercatat * 240 * (1 + f * 2);
      s.data.cpm = S.lerp(s.data.cpm, target, dt * 2.2);
      s.data.angkaDet.userData.ganti(Math.round(s.data.cpm) + ' cpm',
        s.data.cpm > 400 ? '#ef6a52' : s.data.cpm > 60 ? '#f0a94a' : '#4fd1c0');
    },

    bacaUbah: function (s) {
      const z = isotop(s);
      const j = JENIS[z.jenis];
      const f = sisa(s);
      const n = s.get('paruh');
      const anakZ = z.Z + j.dZ, anakA = z.A + j.dA;

      s.baca('sisa', Math.round(f * 100) + ' %   (' + Math.round(f * N0) + ' dari ' + N0 + ' inti)',
        f > 0.5 ? 'aksen' : f > 0.1 ? 'warn' : 'danger');
      s.baca('paruh', S.fmtRapi(z.t / z.bagi) + ' ' + z.sat);
      s.baca('waktu', S.fmt(n, 2) + ' × t½  =  ' + S.fmtRapi(n * z.t / z.bagi) + ' ' + z.sat);
      s.baca('jenis', j.n + '  —  memancarkan ' + j.partikel);
      s.baca('reaksi', z.n.split(' ')[0] + '  →  ' + z.anak + '  +  '
        + (z.jenis === 'alfa' ? 'α' : z.jenis === 'beta' ? 'β⁻' : 'γ')
        + '      (Z: ' + z.Z + ' → ' + anakZ + ',  A: ' + z.A + ' → ' + anakA + ')');
      const hal = parseInt(s.get('penghalang'), 10) || 0;
      const lolos = z.jenis === 'alfa' ? hal < 1 : z.jenis === 'beta' ? hal < 2 : hal < 3;
      s.baca('tembus', hal === 0 ? j.tembus
        : (lolos ? 'Masih tembus penghalang ini' : 'Tertahan penghalang ini') + ' — ' + j.tembus,
        hal === 0 ? undefined : lolos ? 'warn' : 'aksen');
      gambar(s);
    }
  };

  function perbaruiJumlah(s) {
    const f = sisa(s);
    const nInduk = Math.round(f * N0);
    atur(s.data.induk, nInduk, true);
    atur(s.data.anak, N0 - nInduk, false);
  }

  function atur(p, n, depan) {
    const d = p.userData.p;
    for (let i = 0; i < d.length; i++) {
      const aktif = depan ? i < n : i >= d.length - n;
      if (!d[i].aktif && aktif) {
        d[i].pos.set(S.acak(-1.8, 1.8), S.acak(-1.3, 1.3), S.acak(-1.8, 1.8));
      }
      d[i].aktif = aktif;
    }
    p.userData.tulis();
  }

  function aturHalangan(s) {
    const hal = parseInt(s.get('penghalang'), 10) || 0;
    const info = [
      { n: '', w: 0xd8d4c8, t: 0.2 },
      { n: 'kertas', w: 0xf0ece0, t: 0.06 },
      { n: 'aluminium 3 mm', w: 0xc8ced4, t: 0.16 },
      { n: 'timbal 5 cm', w: 0x5a6068, t: 0.4 }
    ][hal];
    s.data.hal.visible = hal > 0;
    s.data.hal.material.color.setHex(info.w);
    s.data.hal.material.metalness = hal >= 2 ? 0.7 : 0.05;
    s.data.hal.scale.x = info.t / 0.2;
    s.data.lblHal.userData.ganti(info.n);
    s.data.lblHal.visible = hal > 0;
  }

  function gambar(s) {
    if (!s.data.g1 || !s.data.g1.visible) return;
    const z = isotop(s);
    const n = s.get('paruh');

    if (s.get('panel') === 'paruh') {
      const kurva = [];
      for (let i = 0; i <= 160; i++) {
        const x = i / 160 * 8;
        kurva.push([x, Math.pow(0.5, x) * 100]);
      }
      const garis = [];
      for (let k = 1; k <= 4; k++) {
        garis.push({ v: k, warna: 'rgba(214,228,240,.22)',
          label: k === 1 ? 't½' : k + '·t½' });
      }
      S.gambarGrafik(s.data.g1, {
        judul: 'Kurva peluruhan ' + z.n.split(' ')[0] + ' — setiap t½ tersisa separuh',
        xMin: 0, xMax: 8, yMin: 0, yMax: 100,
        xLabel: 'waktu (× waktu paruh)', yLabel: 'inti tersisa (%)',
        seri: [{ titik: kurva, warna: '#f0a94a', tebal: 3.4, nama: 'N / N₀' }],
        garisX: garis,
        garisY: [{ v: 50, warna: 'rgba(79,209,192,.6)', label: '50 %' }],
        titikTebal: [{ x: n, y: sisa(s) * 100, warna: '#ffffff', r: 7 }]
      });
      return;
    }

    // penanggalan: dari fraksi C-14 tersisa ke umur sampel
    const kurva = [];
    const t12 = 5730;      // tahun, C-14
    for (let i = 0; i <= 160; i++) {
      const umur = i / 160 * 45000;
      kurva.push([umur, Math.pow(0.5, umur / t12) * 100]);
    }
    const f = sisa(s);
    const umurS = -Math.log2(Math.max(0.0001, f)) * t12;
    S.gambarGrafik(s.data.g1, {
      judul: 'Penanggalan karbon — kadar C-14 menunjukkan umur sampel',
      xMin: 0, xMax: 45000, yMin: 0, yMax: 100,
      xLabel: 'umur sampel (tahun)', yLabel: 'kadar C-14 tersisa (%)',
      seri: [{ titik: kurva, warna: '#6fb6ff', tebal: 3.4, nama: 'C-14, t½ = 5.730 tahun' }],
      garisY: [{ v: f * 100, warna: 'rgba(240,208,64,.8)',
        label: 'kadar sekarang ' + S.fmt(f * 100, 1) + ' %' }],
      garisX: [{ v: Math.min(45000, umurS), warna: 'rgba(79,209,192,.8)',
        label: '≈ ' + S.fmtRapi(Math.round(umurS)) + ' tahun' }],
      titikTebal: [{ x: Math.min(45000, umurS), y: f * 100, warna: '#ffffff', r: 7 }]
    });
  }

  function pasang(s) {
    const z = isotop(s);
    const j = JENIS[z.jenis];
    s.data.jalan = false;

    s.data.induk.material.color.setHex(0xf0a94a);
    s.data.induk.material.emissive.setHex(0xf0a94a);
    s.data.anak.material.color.setHex(0x6fb6ff);
    s.data.anak.material.emissive.setHex(0x6fb6ff);
    perbaruiJumlah(s);

    // jumlah nukleon terlihat mengikuti nomor massa (dibatasi)
    const nTampil = Math.round(S.clamp(z.A / 238, 0.18, 1) * 64);
    s.data.nukleon.forEach(function (m, i) { m.visible = i < nTampil; });

    s.data.lblSampel.userData.ganti('sampel ' + N0 + ' inti ' + z.n.split(' ')[0]);
    s.data.lblInti.userData.ganti('satu inti  Z=' + z.Z + '  A=' + z.A);
    s.data.lbl.userData.ganti(z.n + '   —   ' + j.n);
    s.data.g1.visible = s.get('grafik');
    s.data.det.visible = s.get('detektor');
    aturHalangan(s);
    gambar(s);
  }
})());
