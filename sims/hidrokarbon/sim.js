/* Hidrokarbon dan Minyak Bumi — Fase E — adegan 3D */

Sim3D.daftar('hidrokarbon', (function () {
  'use strict';
  const T = THREE, S = S3;

  const AKAR = ['met', 'et', 'prop', 'but', 'pent', 'heks', 'hept', 'okt', 'non', 'dek'];
  const ISOMER = [1, 1, 1, 2, 3, 5, 9, 18, 35, 75];

  /* fraksi minyak bumi: nama, rentang C, suhu didih, warna, tinggi keluar 0..1 */
  const FRAKSI = [
    { n: 'Gas (LPG)', c: 'C₁–C₄', suhu: '< 20 °C', warna: 0xbfe8ff, y: 0.96, guna: 'bahan bakar kompor' },
    { n: 'Petroleum eter', c: 'C₅–C₇', suhu: '20–70 °C', warna: 0xdff0d8, y: 0.84, guna: 'pelarut' },
    { n: 'Bensin', c: 'C₅–C₁₂', suhu: '70–140 °C', warna: 0xf0e07a, y: 0.70, guna: 'mesin bensin' },
    { n: 'Nafta', c: 'C₈–C₁₂', suhu: '140–180 °C', warna: 0xf0c868, y: 0.58, guna: 'bahan petrokimia' },
    { n: 'Kerosin', c: 'C₁₂–C₁₆', suhu: '180–250 °C', warna: 0xe8a84a, y: 0.46, guna: 'avtur, minyak tanah' },
    { n: 'Diesel', c: 'C₁₅–C₁₈', suhu: '250–350 °C', warna: 0xc8803a, y: 0.33, guna: 'mesin diesel' },
    { n: 'Oli & lilin', c: 'C₁₈–C₃₀', suhu: '350–400 °C', warna: 0x9a5f30, y: 0.20, guna: 'pelumas, parafin' },
    { n: 'Residu/aspal', c: '> C₃₀', suhu: '> 400 °C', warna: 0x3a2b22, y: 0.06, guna: 'aspal jalan' }
  ];

  /* arah tetrahedral untuk menempelkan H */
  const ARAH = [
    [1, 1, 1], [-1, -1, 1], [-1, 1, -1], [1, -1, -1],
    [1, 1, -1], [-1, -1, -1], [-1, 1, 1], [1, -1, 1],
    [0, 1, 0], [0, -1, 0]
  ].map(function (a) { return new T.Vector3(a[0], a[1], a[2]).normalize(); });

  /* batas suhu kasar tiap fraksi agar ikut menguap */
  const BATAS = [20, 70, 140, 180, 250, 350, 400, 999];

  function jenis(s) { return s.get('jenis'); }
  function nC(s) { return Math.round(s.get('n')); }

  function rumus(s) {
    const n = nC(s), j = jenis(s);
    const h = j === 'alkana' ? 2 * n + 2 : j === 'alkena' ? 2 * n : 2 * n - 2;
    return { n: n, h: h, teks: 'C' + S.sub(n) + 'H' + S.sub(h), mr: n * 12.011 + h * 1.008 };
  }

  function nama(s) {
    const n = nC(s), j = jenis(s);
    const akar = AKAR[n - 1] || ('C' + n);
    const akhir = j === 'alkana' ? 'ana' : j === 'alkena' ? 'ena' : 'una';
    const cab = parseInt(s.get('cabang'), 10) || 0;
    let awal = '';
    if (cab === 1) awal = '2-metil';
    if (cab === 2) awal = '3-metil';
    if (cab === 3) awal = '2,2-dimetil';
    const utama = Math.max(1, n - (cab === 3 ? 2 : cab > 0 ? 1 : 0));
    const akarU = AKAR[utama - 1] || ('C' + utama);
    if (awal) return awal + akarU + akhir;
    return akar + akhir;
  }

  return {
    latar: 0x060b11,
    kamera: { jarak: 11, phi: 1.1, theta: 0.6, targetY: 0.3, lajuPutar: 0.12 },

    kendali: [
      { judul: 'Mode', isi: [
        { type: 'segment', id: 'mode', value: 'rantai', label: 'Yang dikerjakan', options: [
          { value: 'rantai', label: 'Bangun rantai' },
          { value: 'distilasi', label: 'Menara distilasi' }
        ]}
      ]},
      { judul: 'Rantai karbon', isi: [
        { type: 'slider', id: 'n', value: 4, min: 1, max: 10, step: 1, label: 'Jumlah atom C', unit: '', dec: 0 },
        { type: 'segment', id: 'jenis', value: 'alkana', label: 'Golongan', options: [
          { value: 'alkana', label: 'Alkana' },
          { value: 'alkena', label: 'Alkena' },
          { value: 'alkuna', label: 'Alkuna' }
        ]},
        { type: 'select', id: 'cabang', value: 0, label: 'Kerangka', options: [
          { value: 0, label: 'Rantai lurus' },
          { value: 1, label: 'Cabang metil di C-2' },
          { value: 2, label: 'Cabang metil di C-3' },
          { value: 3, label: 'Dua metil di C-2' }
        ]},
        { type: 'toggle', id: 'h', value: true, label: 'Tampilkan atom H' },
        { type: 'toggle', id: 'putar', value: true, label: 'Putar molekul' }
      ]},
      { judul: 'Menara distilasi', isi: [
        { type: 'slider', id: 'suhu', value: 380, min: 200, max: 500, step: 5,
          label: 'Suhu umpan masuk', unit: ' °C', dec: 0 },
        { type: 'slider', id: 'aliran', value: 1, min: 0, max: 2.5, step: 0.1,
          label: 'Laju aliran', unit: '×', dec: 1 },
        { type: 'select', id: 'fraksi', value: 2, label: 'Fraksi yang disorot',
          options: FRAKSI.map(function (f, i) { return { value: i, label: f.n }; }) },
        { type: 'toggle', id: 'potong', value: true, label: 'Potong dinding menara' }
      ]}
    ],

    baca: [
      { id: 'a', label: 'Nama', tone: 'aksen' },
      { id: 'b', label: 'Rumus molekul' },
      { id: 'c', label: 'Massa molar' },
      { id: 'd', label: 'Keterangan' },
      { id: 'e', label: 'Isomer kerangka' }
    ],

    bangun: function (s) {
      s.tambah(S.lantai({ r: 9, warna: 0x0b1117, y: -3.2 }));

      /* ---------------- mode rantai ---------------- */
      const gR = new T.Group();
      s.data.gR = gR;
      s.tambah(gR);

      const lblR = S.teks('', { skala: 0.46, lebar: 26, warna: '#d8e4ec' });
      lblR.position.set(0, 3.0, 0);
      s.data.lblR = lblR;
      gR.add(lblR);

      const isi = new T.Group();
      s.data.isi = isi;
      gR.add(isi);

      /* ---------------- mode distilasi ---------------- */
      const gD = new T.Group();
      gD.visible = false;
      s.data.gD = gD;
      s.tambah(gD);
      bangunMenara(s, gD);

      pasangRantai(s);
      aturMode(s);
    },

    ubah: function (s, id) {
      if (id === 'mode') { aturMode(s); return; }
      if (id === 'n' || id === 'jenis' || id === 'cabang' || id === 'h') pasangRantai(s);
      if (id === 'fraksi') sorot(s);
      if (id === 'potong') {
        s.data.dinding.material.opacity = s.get('potong') ? 0.12 : 0.3;
        s.data.dinding.material.side = s.get('potong') ? T.BackSide : T.DoubleSide;
      }
      if (id === 'suhu') warnaMenara(s);
    },

    langkah: function (s, dt) {
      if (s.get('mode') === 'rantai') {
        if (s.get('putar')) s.data.isi.rotation.y += dt * 0.4;
        return;
      }
      const laju = s.get('aliran');
      // uap naik di dalam menara
      const d = s.data.uap.userData.p;
      for (let i = 0; i < d.length; i++) {
        d[i].pos.y += dt * (0.5 + d[i].vel.y * 0.3) * laju * 1.6;
        d[i].pos.x += Math.sin(s.waktu * 1.4 + i) * dt * 0.1;
        if (d[i].pos.y > 3.1) d[i].pos.set(S.acak(-0.5, 0.5), -3.0, S.acak(-0.5, 0.5));
      }
      s.data.uap.userData.tulis();
      s.data.uap.visible = laju > 0.03;

      // tetesan keluar di tiap pipa
      s.data.tetes.forEach(function (t, i) {
        const f = FRAKSI[i];
        const aktif = laju > 0.03 && suhuCukup(s, i);
        t.visible = aktif;
        if (!aktif) return;
        t.position.x = 1.35 + ((s.waktu * laju * 1.1 + i * 0.37) % 1) * 1.5;
        t.position.y = -3.2 + f.y * 6.4 - ((s.waktu * laju * 1.1 + i * 0.37) % 1) * 0.5;
      });

      // nyala tungku
      s.data.nyalaTungku.userData.perbarui(s.waktu, S.clamp((s.get('suhu') - 200) / 300, 0.08, 1));
    },

    bacaUbah: function (s) {
      if (s.get('mode') === 'rantai') {
        const r = rumus(s);
        const j = jenis(s);
        s.baca('a', nama(s));
        s.baca('b', r.teks);
        s.baca('c', S.fmt(r.mr, 2) + ' g/mol');
        s.baca('d', j === 'alkana' ? 'Ikatan tunggal semua — jenuh'
          : j === 'alkena' ? 'Ada satu ikatan rangkap dua — tak jenuh'
            : 'Ada satu ikatan rangkap tiga — tak jenuh',
          j === 'alkana' ? 'aksen' : 'warn');
        const n = r.n;
        s.baca('e', j === 'alkana'
          ? (ISOMER[n - 1] || '> 75') + ' isomer kerangka untuk C' + S.sub(n)
          : 'Alkena/alkuna juga punya isomer posisi & geometri');
      } else {
        const i = parseInt(s.get('fraksi'), 10) || 0;
        const f = FRAKSI[i];
        s.baca('a', f.n, 'aksen');
        s.baca('b', f.c);
        s.baca('c', 'Titik didih ' + f.suhu);
        s.baca('d', 'Dipakai untuk ' + f.guna);
        s.baca('e', suhuCukup(s, i)
          ? 'Pada ' + Math.round(s.get('suhu')) + ' °C fraksi ini ikut menguap ✓'
          : 'Pada ' + Math.round(s.get('suhu')) + ' °C fraksi ini belum menguap',
          suhuCukup(s, i) ? 'aksen' : 'danger');
      }
    }
  };

  function suhuCukup(s, i) {
    if (i === 7) return true;                    // residu selalu tertinggal di dasar
    return s.get('suhu') >= BATAS[i];
  }

  function aturMode(s) {
    const r = s.get('mode') === 'rantai';
    s.data.gR.visible = r;
    s.data.gD.visible = !r;
    if (s.orbit) s.orbit.set({ jarak: r ? 11 : 16, targetY: r ? 0.3 : 0.2 });
    if (!r) { sorot(s); warnaMenara(s); }
  }

  /* ============================ rantai karbon ============================ */

  function pasangRantai(s) {
    const isi = s.data.isi;
    while (isi.children.length) S.buangObjek(isi.children.pop());

    const n = nC(s), j = jenis(s);
    let cab = parseInt(s.get('cabang'), 10) || 0;
    // cabang hanya mungkin bila rantai cukup panjang
    if (cab === 1 && n < 4) cab = 0;
    if (cab === 2 && n < 5) cab = 0;
    if (cab === 3 && n < 5) cab = 0;

    const utama = Math.max(1, n - (cab === 3 ? 2 : cab > 0 ? 1 : 0));
    const pos = [];
    const ikat = [];      // [i, j, orde]

    // rantai utama zig-zag
    for (let i = 0; i < utama; i++) {
      pos.push(new T.Vector3(i * 0.84 - (utama - 1) * 0.42, (i % 2) * 0.5 - 0.25, 0));
      if (i > 0) {
        let orde = 1;
        if (i === 1 && j === 'alkena') orde = 2;
        if (i === 1 && j === 'alkuna') orde = 3;
        ikat.push([i - 1, i, orde]);
      }
    }
    // ikatan rangkap pada molekul 1-C tak mungkin
    if (utama === 1) { /* metana */ }

    // cabang metil
    const titikCabang = [];
    if (cab === 1 && utama >= 3) titikCabang.push(1);
    if (cab === 2 && utama >= 4) titikCabang.push(2);
    if (cab === 3 && utama >= 3) { titikCabang.push(1); titikCabang.push(1); }
    titikCabang.forEach(function (idx, k) {
      const dasar = pos[idx];
      const arah = new T.Vector3(0, (idx % 2) ? -0.55 : 0.55, k === 0 ? 0.72 : -0.72).normalize();
      const p = dasar.clone().addScaledVector(arah, 0.84);
      pos.push(p);
      ikat.push([idx, pos.length - 1, 1]);
    });

    // hitung orde terpakai tiap C
    const terpakai = new Array(pos.length).fill(0);
    const tetangga = pos.map(function () { return []; });
    ikat.forEach(function (b) {
      terpakai[b[0]] += b[2];
      terpakai[b[1]] += b[2];
      tetangga[b[0]].push(pos[b[1]]);
      tetangga[b[1]].push(pos[b[0]]);
    });

    // bangun atom C
    const mat = S.matBola(S.UNSUR.C.w, { unik: true });
    pos.forEach(function (p) {
      const m = new T.Mesh(S.geoBola(28), mat);
      m.scale.setScalar(S.UNSUR.C.r * 0.6);
      m.position.copy(p);
      m.castShadow = true;
      isi.add(m);
    });

    // ikatan C–C
    ikat.forEach(function (b) {
      isi.add(S.ikatan(pos[b[0]], pos[b[1]], { orde: b[2], tebal: 0.072, pisah: 0.17 }));
    });

    // atom H
    if (s.get('h')) {
      const matH = S.matBola(S.UNSUR.H.w, { unik: true });
      pos.forEach(function (p, i) {
        const sisa = 4 - terpakai[i];
        if (sisa <= 0) return;
        const dipakai = [];
        for (let k = 0; k < sisa; k++) {
          let terbaik = null, nilai = -9;
          ARAH.forEach(function (a) {
            if (dipakai.indexOf(a) >= 0) return;
            let v = 0;
            tetangga[i].forEach(function (q) {
              v -= a.dot(q.clone().sub(p).normalize()) * 2;
            });
            dipakai.forEach(function (a2) { v -= a.dot(a2) * 1.3; });
            if (v > nilai) { nilai = v; terbaik = a; }
          });
          if (!terbaik) break;
          dipakai.push(terbaik);
          const q = p.clone().addScaledVector(terbaik, 0.62);
          const m = new T.Mesh(S.geoBola(18), matH);
          m.scale.setScalar(S.UNSUR.H.r * 0.6);
          m.position.copy(q);
          isi.add(m);
          isi.add(S.ikatan(p, q, { tebal: 0.05, warna: 0x8d97a1 }));
        }
      });
    }

    isi.rotation.y = 0;
    s.data.lblR.userData.ganti(nama(s) + '  —  ' + rumus(s).teks);
  }

  /* ============================ menara distilasi ============================ */

  function bangunMenara(s, g) {
    const H = 6.4, R = 1.3;

    // dinding menara
    const dinding = new T.Mesh(new T.CylinderGeometry(R, R, H, 48, 1, true),
      new T.MeshPhysicalMaterial({
        color: 0xa8b6c2, roughness: 0.3, metalness: 0.7,
        transparent: true, opacity: 0.12, side: T.BackSide
      }));
    dinding.position.y = -3.2 + H / 2;
    s.data.dinding = dinding;
    g.add(dinding);

    // kerangka luar
    const rangka = new T.Mesh(new T.CylinderGeometry(R + 0.02, R + 0.02, H, 48, 1, true),
      new T.MeshStandardMaterial({ color: 0x4a5a68, roughness: 0.45, metalness: 0.6,
        wireframe: true, transparent: true, opacity: 0.22 }));
    rangka.position.y = dinding.position.y;
    g.add(rangka);

    // tudung atas & dasar
    const tudung = new T.Mesh(new T.SphereGeometry(R, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      S.matLogam(0x8c9aa6, { roughness: 0.4 }));
    tudung.position.y = -3.2 + H;
    g.add(tudung);
    const dasar = new T.Mesh(new T.CylinderGeometry(R + 0.16, R + 0.3, 0.4, 48),
      S.matLogam(0x5a6672, { roughness: 0.6 }));
    dasar.position.y = -3.35;
    dasar.receiveShadow = true;
    g.add(dasar);

    // piringan (tray) + pipa keluar tiap fraksi
    s.data.cincin = [];
    s.data.tetes = [];
    FRAKSI.forEach(function (f, i) {
      const y = -3.2 + f.y * H;

      const tray = new T.Mesh(new T.CylinderGeometry(R - 0.06, R - 0.06, 0.05, 40),
        new T.MeshStandardMaterial({ color: f.warna, roughness: 0.4, metalness: 0.25,
          emissive: f.warna, emissiveIntensity: 0.12, transparent: true, opacity: 0.85 }));
      tray.position.y = y;
      g.add(tray);
      s.data.cincin.push(tray);

      // pipa keluar ke kanan
      const pipa = new T.Mesh(new T.CylinderGeometry(0.075, 0.075, 1.6, 16),
        S.matLogam(0x9aa6b2, { roughness: 0.4 }));
      pipa.rotation.z = Math.PI / 2;
      pipa.position.set(R + 0.8, y, 0);
      g.add(pipa);

      // tangki penampung
      const tangki = new T.Mesh(new T.CylinderGeometry(0.3, 0.3, 0.46, 24),
        new T.MeshStandardMaterial({ color: 0x27323c, roughness: 0.55, metalness: 0.35 }));
      tangki.position.set(R + 1.85, y - 0.2, 0);
      g.add(tangki);
      const isiT = new T.Mesh(new T.CylinderGeometry(0.27, 0.27, 0.3, 24),
        S.matCairan(f.warna, { opacity: 0.9 }));
      isiT.position.set(R + 1.85, y - 0.26, 0);
      g.add(isiT);

      // label fraksi
      const l = S.teks(f.n + '   ' + f.c, { skala: 0.26, lebar: 24, warna: '#cfdbe6' });
      l.position.set(R + 3.0, y, 0);
      g.add(l);

      // tetesan yang mengalir keluar
      const tetes = new T.Mesh(S.geoBola(12),
        new T.MeshStandardMaterial({ color: f.warna, emissive: f.warna, emissiveIntensity: 0.4,
          roughness: 0.2 }));
      tetes.scale.setScalar(0.08);
      tetes.visible = false;
      g.add(tetes);
      s.data.tetes.push(tetes);
    });

    // uap naik di dalam
    const uap = S.partikel(80, { r: 0.07, warna: 0xdfe8ee, kotak: { x: 0.9, y: 3, z: 0.9 } });
    uap.material.transparent = true;
    uap.material.opacity = 0.42;
    s.data.uap = uap;
    g.add(uap);

    // tungku pemanas di bawah
    const tungku = new T.Mesh(new T.BoxGeometry(2.2, 0.7, 1.6),
      new T.MeshStandardMaterial({ color: 0x2b2420, roughness: 0.8 }));
    tungku.position.set(0, -3.95, 0);
    g.add(tungku);
    const ny = S.nyala({ r: 0.4, h: 0.8 });
    ny.position.set(0, -3.75, 0);
    s.data.nyalaTungku = ny;
    g.add(ny);

    // pipa umpan minyak mentah
    const umpan = new T.Mesh(new T.CylinderGeometry(0.11, 0.11, 2.4, 18),
      S.matLogam(0x7a6a52, { roughness: 0.5 }));
    umpan.rotation.z = Math.PI / 2;
    umpan.position.set(-R - 1.2, -2.5, 0);
    g.add(umpan);
    const lblU = S.teks('minyak mentah', { skala: 0.26, lebar: 22, warna: '#c8a070' });
    lblU.position.set(-R - 2.6, -2.1, 0);
    g.add(lblU);

    // sorotan fraksi terpilih
    const sorotCincin = new T.Mesh(new T.TorusGeometry(R + 0.1, 0.045, 10, 64),
      new T.MeshStandardMaterial({ color: 0xf0d040, emissive: 0xf0d040, emissiveIntensity: 1.1 }));
    sorotCincin.rotation.x = Math.PI / 2;
    s.data.sorot = sorotCincin;
    g.add(sorotCincin);

    const judul = S.teks('Menara distilasi fraksionasi', { skala: 0.4, lebar: 34, warna: '#d8e4ec' });
    judul.position.set(0, 3.9, 0);
    g.add(judul);
  }

  function sorot(s) {
    const i = parseInt(s.get('fraksi'), 10) || 0;
    s.data.sorot.position.y = -3.2 + FRAKSI[i].y * 6.4;
  }

  function warnaMenara(s) {
    s.data.cincin.forEach(function (c, i) {
      const aktif = suhuCukup(s, i);
      c.material.emissiveIntensity = aktif ? 0.45 : 0.04;
      c.material.opacity = aktif ? 0.92 : 0.4;
    });
  }
})());
