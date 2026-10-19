/* Termokimia: Entalpi dan Kalorimetri — Fase F — adegan 3D */

Sim3D.daftar('termokimia', (function () {
  'use strict';
  const T = THREE, S = S3;

  /* dH dalam kJ/mol — negatif = eksoterm */
  const REAKSI = [
    { n: 'NaOH(s) larut dalam air', dH: -44.5, ea: 12, warna: 0xdfe8ee, pers: 'NaOH(s) → Na⁺(aq) + OH⁻(aq)' },
    { n: 'HCl + NaOH (penetralan)', dH: -57.1, ea: 8, warna: 0xeaf2f6, pers: 'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)' },
    { n: 'Pembakaran etanol', dH: -1367, ea: 180, warna: 0xf0e8d4, pers: 'C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O' },
    { n: 'Mg + HCl', dH: -466, ea: 60, warna: 0xe8eef2, pers: 'Mg(s) + 2HCl(aq) → MgCl₂(aq) + H₂(g)' },
    { n: 'CaO + air (kapur tohor)', dH: -65.2, ea: 20, warna: 0xf2f4f6, pers: 'CaO(s) + H₂O(l) → Ca(OH)₂(s)' },
    { n: 'NH₄NO₃ larut dalam air', dH: 25.7, ea: 30, warna: 0xdcecf4, pers: 'NH₄NO₃(s) → NH₄⁺(aq) + NO₃⁻(aq)' },
    { n: 'NH₄Cl + Ba(OH)₂', dH: 80.3, ea: 45, warna: 0xe0eef6, pers: 'Ba(OH)₂ + 2NH₄Cl → BaCl₂ + 2NH₃ + 2H₂O' },
    { n: 'Fotosintesis (model)', dH: 2803, ea: 300, warna: 0xd8ecd8, pers: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂' }
  ];

  /* tahap hukum Hess: pembentukan CO2 lewat satu atau dua langkah */
  const HESS = [
    { n: 'C + O₂ → CO₂', dH: -393.5, label: 'langsung' },
    { n: 'C + ½O₂ → CO', dH: -110.5, label: 'tahap 1' },
    { n: 'CO + ½O₂ → CO₂', dH: -283.0, label: 'tahap 2' }
  ];

  const C_AIR = 4.18;   // J/(g·°C)

  function reaksi(s) { return REAKSI[parseInt(s.get('r'), 10) || 0]; }

  function hitung(s) {
    const r = reaksi(s);
    const m = s.get('massa');          // gram air
    const n = s.get('mol');            // mol zat
    const q = -r.dH * n * 1000;        // J diserap air (eksoterm → positif)
    const dT = q / (m * C_AIR);
    const suhuAkhir = 25 + dT;
    return { r: r, m: m, n: n, q: q, dT: dT, suhuAkhir: suhuAkhir };
  }

  return {
    latar: 0x080d13,
    kamera: { jarak: 12.6, phi: 1.05, theta: 0.6, targetY: 2.25, lajuPutar: 0.1 },

    legenda: [
      { warna: '#ef4a3a', label: 'suhu naik — reaksi eksoterm' },
      { warna: '#6fb6ff', label: 'suhu turun — reaksi endoterm' },
      { warna: '#f0d040', label: 'puncak energi aktivasi' }
    ],

    kendali: [
      { judul: 'Reaksi', isi: [
        { type: 'select', id: 'r', value: 0, label: 'Reaksi di kalorimeter',
          options: REAKSI.map(function (r, i) { return { value: i, label: r.n }; }) },
        { type: 'slider', id: 'mol', value: 0.1, min: 0.01, max: 0.5, step: 0.01,
          label: 'Jumlah zat', unit: ' mol', dec: 2 },
        { type: 'slider', id: 'massa', value: 200, min: 50, max: 1000, step: 10,
          label: 'Massa air', unit: ' g', dec: 0 }
      ]},
      { judul: 'Jalankan', isi: [
        { type: 'buttons', label: '', items: [
          { label: '▶ Reaksikan', utama: true, klik: function (s) { s.data.jalan = true; } },
          { label: '↺ Ulangi', klik: function (s) { s.data.t = 0; s.data.jalan = false; } }
        ]},
        { type: 'slider', id: 'laju', value: 1, min: 0.2, max: 3, step: 0.1,
          label: 'Kecepatan waktu', unit: '×', dec: 1 },
        { type: 'toggle', id: 'aduk', value: true, label: 'Pengaduk berputar' }
      ]},
      { judul: 'Panel', isi: [
        { type: 'segment', id: 'panel', value: 'tingkat', label: 'Grafik yang ditampilkan', options: [
          { value: 'tingkat', label: 'Tingkat energi' },
          { value: 'suhu', label: 'Suhu vs waktu' },
          { value: 'hess', label: 'Hukum Hess' }
        ]},
        { type: 'toggle', id: 'grafik', value: true, label: 'Tampilkan panel' }
      ]}
    ],

    baca: [
      { id: 'jenis', label: 'Jenis reaksi', tone: 'aksen' },
      { id: 'suhu', label: 'Suhu larutan' },
      { id: 'dt', label: 'Perubahan suhu ΔT' },
      { id: 'q', label: 'Kalor q = m·c·ΔT' },
      { id: 'dh', label: 'Entalpi ΔH = −q/n' },
      { id: 'pers', label: 'Persamaan' }
    ],

    bangun: function (s) {
      s.tambah(S.lantai({ r: 9, warna: 0x0d141b }));

      /* ---------- kalorimeter: cangkir styrofoam berlapis ---------- */
      const luar = new T.Mesh(new T.CylinderGeometry(1.5, 1.3, 2.4, 44, 1, true),
        new T.MeshStandardMaterial({ color: 0xe8ebee, roughness: 0.92, side: T.DoubleSide }));
      luar.position.y = 1.2;
      luar.castShadow = true;
      s.tambah(luar);
      const dasarK = new T.Mesh(new T.CylinderGeometry(1.3, 1.3, 0.12, 44),
        new T.MeshStandardMaterial({ color: 0xd8dde2, roughness: 0.9 }));
      dasarK.position.y = 0.06;
      s.tambah(dasarK);

      // cangkir dalam (sedikit lebih kecil) → terlihat berlapis
      const dalam = new T.Mesh(new T.CylinderGeometry(1.24, 1.08, 2.1, 40, 1, true),
        new T.MeshStandardMaterial({ color: 0xf2f4f6, roughness: 0.85, side: T.DoubleSide }));
      dalam.position.y = 1.15;
      s.tambah(dalam);

      // air di dalam
      const air = new T.Mesh(new T.CylinderGeometry(1.2, 1.06, 1, 40),
        S.matCairan(0x4a9fd8, { opacity: 0.8 }));
      s.data.air = air;
      s.tambah(air);

      // tutup gabus
      const tutup = new T.Mesh(new T.CylinderGeometry(1.56, 1.52, 0.2, 44),
        new T.MeshStandardMaterial({ color: 0xd8923a, roughness: 0.88 }));
      tutup.position.y = 2.46;
      s.tambah(tutup);

      /* ---------- termometer ---------- */
      const term = new T.Group();
      const kacaT = new T.Mesh(new T.CylinderGeometry(0.075, 0.075, 3.2, 20),
        new T.MeshPhysicalMaterial({ color: 0xcfe6f2, roughness: 0.06, transparent: true,
          opacity: 0.3, side: T.DoubleSide, depthWrite: false }));
      kacaT.position.y = 1.6;
      term.add(kacaT);
      const kolom = new T.Mesh(new T.CylinderGeometry(0.04, 0.04, 1, 14),
        new T.MeshStandardMaterial({ color: 0xef4a3a, emissive: 0xef4a3a, emissiveIntensity: 0.45 }));
      s.data.kolom = kolom;
      term.add(kolom);
      const bulat = new T.Mesh(S.geoBola(18),
        new T.MeshStandardMaterial({ color: 0xef4a3a, emissive: 0xef4a3a, emissiveIntensity: 0.5 }));
      bulat.scale.setScalar(0.1);
      bulat.position.y = 0.3;
      term.add(bulat);
      // skala
      for (let i = 0; i <= 10; i++) {
        const g = new T.Mesh(new T.BoxGeometry(0.1, 0.012, 0.012),
          new T.MeshBasicMaterial({ color: 0x8d97a1 }));
        g.position.set(0.1, 0.6 + i * 0.25, 0);
        term.add(g);
      }
      term.position.set(0.55, 0.15, 0.3);
      s.tambah(term);
      const lblT = S.teks('25,0 °C', { skala: 0.32, lebar: 12, warna: '#ff8a6a' });
      lblT.position.set(1.5, 3.5, 0.3);
      s.data.lblT = lblT;
      s.tambah(lblT);

      /* ---------- pengaduk ---------- */
      const aduk = new T.Group();
      const btg = new T.Mesh(new T.CylinderGeometry(0.045, 0.045, 2.8, 14), S.matLogam(0xc8ced4));
      btg.position.y = 1.5;
      aduk.add(btg);
      const lingkar = new T.Mesh(new T.TorusGeometry(0.34, 0.035, 10, 28), S.matLogam(0xc8ced4));
      lingkar.rotation.x = Math.PI / 2;
      lingkar.position.y = 0.4;
      aduk.add(lingkar);
      aduk.position.set(-0.55, 0.1, -0.2);
      s.data.aduk = aduk;
      s.tambah(aduk);

      /* ---------- partikel zat + gelembung ---------- */
      const zat = S.partikel(60, { r: 0.09, warna: 0xf0f4f8, kotak: { x: 1, y: 0.6, z: 1 } });
      s.data.zat = zat;
      s.tambah(zat);
      const gel = S.gelembung({ n: 36, sebar: 0.8, tinggi: 1.5, warna: 0xeaf4fa });
      gel.position.y = 0.2;
      s.data.gel = gel;
      s.tambah(gel);

      // kabut panas / dingin di atas permukaan
      const kabut = S.partikel(60, { r: 0.18, warna: 0xffffff, kotak: { x: 1.1, y: 0.8, z: 1.1 } });
      kabut.material.transparent = true;
      kabut.material.opacity = 0.16;
      kabut.position.y = 2.9;
      s.data.kabut = kabut;
      s.tambah(kabut);

      /* ---------- panel grafik ---------- */
      const g1 = S.panelGrafik({ w: 4.2, px: 680, py: 430 });
      g1.position.set(3.4, 3.0, -1.4);
      s.data.g1 = g1;
      s.tambah(g1);

      const lbl = S.teks('', { skala: 0.4, lebar: 40, warna: '#d8e4ec' });
      lbl.position.set(0, 4.4, 0);
      s.data.lbl = lbl;
      s.tambah(lbl);

      s.data.t = 0;
      s.data.jalan = false;
      s.data.rekam = [];
      pasang(s);
    },

    ubah: function (s, id) {
      if (id === 'r' || id === 'mol' || id === 'massa') pasang(s);
      if (id === 'grafik') s.data.g1.visible = s.get('grafik');
      if (id === 'panel') gambar(s);
    },

    langkah: function (s, dt) {
      const h = hitung(s);
      if (s.data.jalan) {
        const dtl = dt * s.get('laju');
        s.data.t = Math.min(1, s.data.t + dtl * 0.3);
        s.data.jam = (s.data.jam || 0) + dtl * 20;
        if (s.data.rekam.length < 400) {
          s.data.rekam.push([s.data.jam, 25 + h.dT * mulus(s.data.t)]);
        }
      }
      const t = mulus(s.data.t);
      const suhu = 25 + h.dT * t;

      // kolom termometer: 0 °C di y=0.45, 100 °C di y=3.1 (dibatasi)
      const sk = S.clamp((suhu + 20) / 140, 0.02, 1);
      s.data.kolom.scale.y = sk * 2.7;
      s.data.kolom.position.y = 0.3 + sk * 2.7 / 2;
      const panas = S.clamp((suhu - 25) / 60, -1, 1);
      const cT = panas >= 0
        ? new T.Color(0xef4a3a).lerp(new T.Color(0xfff0a0), 1 - panas)
        : new T.Color(0x4a9fd8).lerp(new T.Color(0xfff0a0), 1 + panas);
      s.data.kolom.material.color.copy(cT);
      s.data.kolom.material.emissive.copy(cT);
      s.data.lblT.userData.ganti(S.fmt(suhu, 1) + ' °C', '#' + cT.getHexString());

      // warna air mengikuti suhu
      const cA = new T.Color(0x4a9fd8).lerp(new T.Color(0xe8683a), S.clamp(panas, 0, 1))
        .lerp(new T.Color(0x8ad0f0), S.clamp(-panas, 0, 1));
      s.data.air.material.color.copy(cA);

      // pengaduk
      if (s.get('aduk')) s.data.aduk.rotation.y += dt * 2.2;

      // partikel zat melarut
      const d = s.data.zat.userData.p;
      const n = Math.round(d.length * (1 - t));
      for (let i = 0; i < d.length; i++) d[i].aktif = i < n;
      s.data.zat.userData.gerak(dt, 0.35 + t * 0.8);

      // gelembung bila eksoterm kuat
      s.data.gel.userData.perbarui(dt,
        s.data.jalan && h.dT > 8 ? S.clamp(h.dT / 40, 0.2, 2) : 0);

      // kabut: uap panas (eksoterm) atau butir es (endoterm)
      const kab = Math.abs(panas) > 0.25 && t > 0.05;
      s.data.kabut.visible = kab;
      if (kab) {
        const q = s.data.kabut.userData.p;
        for (let i = 0; i < q.length; i++) {
          q[i].pos.y += dt * (panas > 0 ? 0.55 : -0.2);
          q[i].pos.x += Math.sin(s.waktu + i) * dt * 0.2;
          if (q[i].pos.y > 0.8 || q[i].pos.y < -0.8) {
            q[i].pos.set(S.acak(-0.9, 0.9), panas > 0 ? -0.75 : 0.75, S.acak(-0.9, 0.9));
          }
        }
        s.data.kabut.userData.tulis();
        s.data.kabut.material.color.setHex(panas > 0 ? 0xffffff : 0xbfe4ff);
        s.data.kabut.material.opacity = 0.05 + Math.abs(panas) * 0.14;
      }

      s.data.suhu = suhu;
      if (s.data.jalan && s.data.t > 0.02) gambar(s);
    },

    bacaUbah: function (s) {
      const h = hitung(s);
      const t = mulus(s.data.t || 0);
      const eks = h.r.dH < 0;
      s.baca('jenis', eks ? 'Eksoterm — melepas kalor' : 'Endoterm — menyerap kalor',
        eks ? 'warn' : 'biru');
      s.baca('suhu', S.fmt(25 + h.dT * t, 2) + ' °C  (awal 25,00 °C)');
      s.baca('dt', (h.dT > 0 ? '+' : '') + S.fmt(h.dT * t, 2) + ' °C  dari total '
        + (h.dT > 0 ? '+' : '') + S.fmt(h.dT, 2) + ' °C');
      s.baca('q', S.fmt(h.m * C_AIR * h.dT / 1000, 2) + ' kJ   ('
        + S.fmt(h.m, 0) + ' g × 4,18 × ' + S.fmt(h.dT, 2) + ')');
      s.baca('dh', S.fmt(h.r.dH, 1) + ' kJ/mol   untuk ' + S.fmt(h.n, 2) + ' mol → '
        + S.fmt(h.r.dH * h.n, 2) + ' kJ', eks ? 'warn' : 'biru');
      s.baca('pers', h.r.pers);
      gambar(s);
    }
  };

  function mulus(t) { return t * t * (3 - 2 * t); }

  function gambar(s) {
    if (!s.data.g1.visible) return;
    const mode = s.get('panel');
    const h = hitung(s);

    if (mode === 'tingkat') {
      const dh = h.r.dH;
      const awal = 0, akhir = dh;
      const ea = h.r.ea;
      const atas = Math.max(awal, akhir) + ea;
      const bawah = Math.min(awal, akhir);
      const pad = (atas - bawah) * 0.18 + 1;

      // jalur: pereaksi datar → puncak → hasil datar
      const jalur = [];
      jalur.push([0, awal]); jalur.push([0.22, awal]);
      const tonjol = atas - (awal + akhir) / 2;
      for (let i = 0; i <= 24; i++) {
        const u = i / 24;
        const x = 0.22 + u * 0.46;
        const y = S.lerp(awal, akhir, u) + tonjol * Math.sin(Math.PI * u);
        jalur.push([x, y]);
      }
      jalur.push([0.68, akhir]); jalur.push([1, akhir]);

      S.gambarGrafik(s.data.g1, {
        judul: 'Diagram tingkat energi — ' + (dh < 0 ? 'eksoterm' : 'endoterm'),
        xMin: 0, xMax: 1, yMin: bawah - pad, yMax: atas + pad,
        xLabel: 'jalannya reaksi', yLabel: 'entalpi (kJ)',
        seri: [
          { titik: jalur, warna: dh < 0 ? '#ef8a52' : '#6fb6ff', tebal: 3.5, nama: 'jalur reaksi' }
        ],
        garisY: [
          { v: awal, warna: 'rgba(214,228,240,.6)', label: 'pereaksi 0 kJ' },
          { v: akhir, warna: dh < 0 ? 'rgba(239,138,82,.85)' : 'rgba(111,182,255,.85)',
            label: 'hasil ' + S.fmt(akhir, 1) + ' kJ   (ΔH = ' + S.fmt(dh, 1) + ')' }
        ],
        titikTebal: [{ x: 0.45, y: atas, warna: '#f0d040', r: 6 }]
      });
      return;
    }

    if (mode === 'suhu') {
      const rek = s.data.rekam;
      const maksX = Math.max(30, (s.data.jam || 0) * 1.1);
      const yMin = Math.min(20, 25 + h.dT - 3);
      const yMaks = Math.max(30, 25 + h.dT + 3);
      S.gambarGrafik(s.data.g1, {
        judul: 'Suhu larutan terhadap waktu',
        xMin: 0, xMax: maksX, yMin: yMin, yMax: yMaks,
        xLabel: 'waktu (s)', yLabel: 'suhu (°C)',
        seri: [
          { titik: rek.length > 1 ? rek : [[0, 25], [0.001, 25]],
            warna: h.r.dH < 0 ? '#ef8a52' : '#6fb6ff', tebal: 3, nama: 'suhu terukur' }
        ],
        garisY: [
          { v: 25, warna: 'rgba(214,228,240,.45)', label: 'suhu awal 25 °C' },
          { v: 25 + h.dT, warna: 'rgba(240,208,64,.8)',
            label: 'suhu akhir ' + S.fmt(25 + h.dT, 1) + ' °C' }
        ]
      });
      return;
    }

    // hukum Hess
    const dH1 = HESS[1].dH, dH2 = HESS[2].dH, total = dH1 + dH2;
    S.gambarGrafik(s.data.g1, {
      judul: 'Hukum Hess — ΔH tak bergantung jalan',
      xMin: 0, xMax: 1, yMin: total - 70, yMax: 70,
      xLabel: 'jalannya reaksi', yLabel: 'entalpi (kJ)',
      seri: [
        { titik: [[0.04, 0], [0.3, 0], [0.3, HESS[0].dH], [0.96, HESS[0].dH]],
          warna: '#4fd1c0', tebal: 3.5, nama: 'jalur langsung' },
        { titik: [[0.04, 0], [0.18, 0], [0.18, dH1], [0.55, dH1], [0.55, total], [0.96, total]],
          warna: '#f0a94a', tebal: 3, putus: true, nama: 'dua tahap' }
      ],
      garisY: [
        { v: 0, warna: 'rgba(214,228,240,.5)', label: 'C + O₂' },
        { v: dH1, warna: 'rgba(240,169,74,.7)', label: 'CO + ½O₂   ' + dH1 + ' kJ' },
        { v: total, warna: 'rgba(79,209,192,.8)', label: 'CO₂   ' + total + ' kJ' }
      ]
    });
  }

  function pasang(s) {
    const h = hitung(s);
    s.data.t = 0;
    s.data.jalan = false;
    s.data.jam = 0;
    s.data.rekam = [[0, 25]];

    // tinggi air mengikuti massa (50–1000 g)
    const lv = S.clamp(0.3 + (h.m - 50) / 950 * 0.6, 0.25, 0.95);
    s.data.air.scale.y = lv * 2.0;
    s.data.air.position.y = lv * 2.0 / 2 + 0.1;
    s.data.air.material.color.setHex(0x4a9fd8);

    // partikel zat: sebanyak mol — kotaknya berpusat di tengah kolom air
    const tinggiAir = lv * 2.0;
    const setengah = Math.max(0.2, tinggiAir / 2 - 0.12);
    s.data.zat.position.y = 0.1 + tinggiAir / 2;
    s.data.zat.userData.kotak = { x: 0.95, y: setengah, z: 0.95 };
    const d = s.data.zat.userData.p;
    const n = Math.round(S.clamp(h.n / 0.5, 0.1, 1) * d.length);
    for (let i = 0; i < d.length; i++) {
      d[i].aktif = i < n;
      d[i].pos.set(S.acak(-0.85, 0.85), S.acak(-setengah, setengah), S.acak(-0.85, 0.85));
    }
    s.data.zat.material.color.setHex(h.r.warna);
    s.data.zat.material.emissive.setHex(h.r.warna);
    s.data.zat.userData.tulis();

    s.data.g1.visible = s.get('grafik');
    s.data.lbl.userData.ganti(h.r.n);
    gambar(s);
  }
})());
