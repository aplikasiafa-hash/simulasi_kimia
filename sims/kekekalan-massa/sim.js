/* Reaksi Kimia dan Hukum Kekekalan Massa — Fase D — adegan 3D */

Sim3D.daftar('kekekalan-massa', (function () {
  'use strict';
  const T = THREE, S = S3;

  const REAKSI = [
    { n: 'Soda kue + cuka', gas: true, gasN: 'CO₂', warnaA: 0xf2f0ea, warnaB: 0xdfe8ee,
      hasil: 0xe8eef2, pers: 'NaHCO₃ + CH₃COOH → CH₃COONa + H₂O + CO₂' },
    { n: 'Besi + belerang', gas: false, warnaA: 0x8a949e, warnaB: 0xe8d048,
      hasil: 0x4a3f36, pers: 'Fe + S → FeS' },
    { n: 'Timbal nitrat + kalium iodida', gas: false, endap: true,
      warnaA: 0xeaf2f6, warnaB: 0xeaf2f6, hasil: 0xf0d040,
      pers: 'Pb(NO₃)₂ + 2KI → PbI₂↓ + 2KNO₃' },
    { n: 'Lilin dibakar', gas: true, gasN: 'CO₂ + H₂O', warnaA: 0xf2e6c8, warnaB: 0x7fc7e8,
      hasil: 0x2a2724, pers: 'lilin + O₂ → CO₂ + H₂O' }
  ];

  function reaksi(s) { return REAKSI[parseInt(s.get('r'), 10) || 0]; }

  return {
    latar: 0x090f15,
    kamera: { jarak: 9.4, phi: 1.08, theta: 0.58, targetY: 1.5, lajuPutar: 0.1 },

    kendali: [
      { judul: 'Reaksi', isi: [
        { type: 'select', id: 'r', value: 0, label: 'Reaksi yang diamati',
          options: REAKSI.map(function (r, i) { return { value: i, label: r.n }; }) }
      ]},
      { judul: 'Wadah', isi: [
        { type: 'segment', id: 'wadah', value: 'tertutup', label: 'Jenis wadah', options: [
          { value: 'tertutup', label: 'Tertutup' },
          { value: 'terbuka', label: 'Terbuka' }
        ]},
        { type: 'buttons', label: '', items: [
          { label: '▶ Reaksikan', utama: true, klik: function (s) { s.data.jalan = true; } },
          { label: '↺ Ulangi', klik: function (s) { s.data.t = 0; s.data.jalan = false; } }
        ]},
        { type: 'slider', id: 'laju', value: 1, min: 0.2, max: 3, step: 0.1,
          label: 'Kecepatan reaksi', unit: '×', dec: 1 }
      ]},
      { judul: 'Tampilan', isi: [
        { type: 'toggle', id: 'partikel', value: true, label: 'Tampilkan partikel' },
        { type: 'toggle', id: 'pers', value: true, label: 'Tampilkan persamaan' }
      ]}
    ],

    baca: [
      { id: 'awal', label: 'Massa sebelum', tone: 'aksen' },
      { id: 'akhir', label: 'Massa sesudah' },
      { id: 'selisih', label: 'Selisih' },
      { id: 'kenapa', label: 'Penjelasan' }
    ],

    bangun: function (s) {
      s.tambah(S.lantai({ r: 8, warna: 0x0e151d }));

      /* --- neraca --- */
      const neraca = new T.Group();
      const dasarN = new T.Mesh(new T.BoxGeometry(3.4, 0.5, 2.4),
        new T.MeshStandardMaterial({ color: 0x242e37, roughness: 0.55, metalness: 0.35 }));
      dasarN.position.y = 0.25; dasarN.receiveShadow = true;
      neraca.add(dasarN);
      const piring = new T.Mesh(new T.CylinderGeometry(1.5, 1.5, 0.1, 56), S.matLogam(0xc8ced4));
      piring.position.y = 0.56; piring.receiveShadow = true;
      neraca.add(piring);
      s.data.piring = piring;

      // layar neraca
      const layar = new T.Mesh(new T.BoxGeometry(1.5, 0.52, 0.06),
        new T.MeshStandardMaterial({ color: 0x0b1a16, roughness: 0.35,
          emissive: 0x0b2a22, emissiveIntensity: 0.6 }));
      layar.position.set(0, 0.42, 1.24);
      layar.rotation.x = -0.35;
      neraca.add(layar);
      const angka = S.teks('0,00 g', { skala: 0.26, lebar: 9, latar: false, warna: '#4fd1c0' });
      angka.position.set(0, 0.5, 1.33);
      neraca.add(angka);
      s.data.angka = angka;
      s.tambah(neraca);

      /* --- labu --- */
      const labu = S.labu({ r: 1.05, h: 2.0, level: 0.46, warna: 0xdfe8ee });
      labu.position.y = 0.62;
      s.data.labu = labu;
      s.tambah(labu);

      // sumbat
      const sumbat = new T.Mesh(new T.CylinderGeometry(0.4, 0.34, 0.36, 24),
        new T.MeshStandardMaterial({ color: 0xd8923a, roughness: 0.85 }));
      sumbat.position.y = 0.62 + 2.0;
      s.data.sumbat = sumbat;
      s.tambah(sumbat);

      // partikel pereaksi A dan B
      const pa = S.partikel(70, { r: 0.07, warna: 0xf2f0ea, kotak: { x: 0.8, y: 0.6, z: 0.8 } });
      const pb = S.partikel(70, { r: 0.06, warna: 0xdfe8ee, kotak: { x: 0.8, y: 0.6, z: 0.8 } });
      const ph = S.partikel(70, { r: 0.075, warna: 0xe8eef2, kotak: { x: 0.8, y: 0.6, z: 0.8 } });
      [pa, pb, ph].forEach(function (p) { s.tambah(p); });
      s.data.pa = pa; s.data.pb = pb; s.data.ph = ph;

      // gas CO2
      const gas = S.gelembung({ n: 60, sebar: 0.62, tinggi: 1.6, warna: 0xe8f4fa });
      gas.position.y = 0.72;
      s.data.gelembung = gas;
      s.tambah(gas);

      const lolos = S.partikel(50, { r: 0.07, warna: 0xb0bcc6, kotak: { x: 1.4, y: 2, z: 1.4 } });
      lolos.material.transparent = true; lolos.material.opacity = 0.5;
      lolos.position.y = 4.2;
      lolos.visible = false;
      s.data.lolos = lolos;
      s.tambah(lolos);

      const lblP = S.teks('', { skala: 0.3, lebar: 42, warna: '#9aa8b4' });
      lblP.position.set(0, 4.5, 0);
      s.data.lblP = lblP;
      s.tambah(lblP);

      const lbl = S.teks('', { skala: 0.4, lebar: 18, warna: '#d8e4ec' });
      lbl.position.set(0, 5.1, 0);
      s.data.lbl = lbl;
      s.tambah(lbl);

      s.data.t = 0;
      pasang(s);
    },

    ubah: function (s, id) {
      if (id === 'r' || id === 'wadah') pasang(s);
      if (id === 'partikel') [s.data.pa, s.data.pb, s.data.ph].forEach(function (p) {
        p.visible = s.get('partikel');
      });
      if (id === 'pers') s.data.lblP.visible = s.get('pers');
    },

    langkah: function (s, dt) {
      const r = reaksi(s);
      const tertutup = s.get('wadah') === 'tertutup';
      if (s.data.jalan) s.data.t = Math.min(1, s.data.t + dt * s.get('laju') * 0.26);
      const t = s.data.t;

      s.data.sumbat.visible = tertutup;
      s.data.sumbat.position.y = 0.62 + 2.0 + (tertutup && t > 0.3 ? Math.sin(s.waktu * 14) * 0.012 * t : 0);

      // pereaksi berubah jadi hasil
      geser(s.data.pa, 1 - t);
      geser(s.data.pb, 1 - t);
      geser(s.data.ph, t);

      // gelembung gas
      if (r.gas) {
        s.data.gelembung.userData.perbarui(dt, s.data.jalan && t < 0.95 ? 2 : 0);
        s.data.gelembung.visible = t > 0.03 && t < 0.97;
        s.data.lolos.visible = !tertutup && t > 0.06;
        if (s.data.lolos.visible) {
          const d = s.data.lolos.userData.p;
          for (let i = 0; i < d.length; i++) {
            d[i].pos.y += dt * 1.1;
            d[i].pos.x += Math.sin(s.waktu * 1.7 + i) * dt * 0.25;
            if (d[i].pos.y > 1.6) d[i].pos.set(S.acak(-0.35, 0.35), -1.8, S.acak(-0.35, 0.35));
          }
          s.data.lolos.userData.tulis();
        }
      } else {
        s.data.gelembung.visible = false;
        s.data.lolos.visible = false;
      }

      // warna isi labu
      const c = new T.Color(r.warnaB).lerp(new T.Color(r.hasil), t);
      s.data.labu.userData.cair.material.color.copy(c);
      if (r.endap) {
        s.data.labu.userData.cair.material.transmission = 0.45 - t * 0.4;
        s.data.labu.userData.cair.material.opacity = 0.85 + t * 0.14;
      }

      // bacaan neraca
      const hilang = (!tertutup && r.gas) ? t * 0.34 : 0;
      const massa = 48.60 - hilang;
      s.data.massa = massa;
      s.data.angka.userData.ganti(S.fmt(massa, 2) + ' g',
        hilang > 0.001 ? '#ef6a52' : '#4fd1c0');
      s.data.piring.position.y = 0.56 - hilang * 0.02;
    },

    bacaUbah: function (s) {
      const r = reaksi(s);
      const tertutup = s.get('wadah') === 'tertutup';
      const m = s.data.massa || 48.60;
      s.baca('awal', '48,60 g');
      s.baca('akhir', S.fmt(m, 2) + ' g', Math.abs(m - 48.6) < 0.005 ? 'aksen' : 'danger');
      const d = m - 48.60;
      s.baca('selisih', (Math.abs(d) < 0.005 ? '0,00' : S.fmt(d, 2)) + ' g',
        Math.abs(d) < 0.005 ? 'aksen' : 'danger');
      s.baca('kenapa', Math.abs(d) < 0.005
        ? (r.gas && tertutup ? 'Gas tetap terkurung — massa kekal'
          : 'Tidak ada zat yang keluar — massa kekal')
        : 'Gas ' + (r.gasN || '') + ' keluar dari wadah terbuka');
    }
  };

  function geser(p, f) {
    const d = p.userData.p;
    const n = Math.round(d.length * S.clamp(f, 0, 1));
    for (let i = 0; i < d.length; i++) d[i].aktif = i < n;
    p.userData.tulis();
  }

  function pasang(s) {
    const r = reaksi(s);
    s.data.t = 0;
    s.data.jalan = false;
    s.data.pa.material.color.setHex(r.warnaA);
    s.data.pa.material.emissive.setHex(r.warnaA);
    s.data.pb.material.color.setHex(r.warnaB);
    s.data.pb.material.emissive.setHex(r.warnaB);
    s.data.ph.material.color.setHex(r.hasil);
    s.data.ph.material.emissive.setHex(r.hasil);

    [[s.data.pa, 0.07], [s.data.pb, 0.06], [s.data.ph, 0.075]].forEach(function (x) {
      const p = x[0], d = p.userData.p;
      for (let i = 0; i < d.length; i++) {
        const a = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random()) * 0.62;
        d[i].pos.set(Math.cos(a) * rr, 0.85 + Math.random() * 0.5, Math.sin(a) * rr);
        d[i].r = x[1];
        d[i].aktif = true;
      }
      p.userData.tulis();
      p.visible = s.get('partikel');
    });
    s.data.labu.userData.setLevel(0.46, r.warnaB);
    s.data.labu.userData.cair.material.transmission = 0.45;
    s.data.labu.userData.setOpasitas(S.opasitasCair(r.warnaB, 0.82));
    s.data.lblP.userData.ganti(r.pers);
    s.data.lblP.visible = s.get('pers');
    s.data.lbl.userData.ganti(r.n + (s.get('wadah') === 'tertutup' ? ' — wadah tertutup' : ' — wadah terbuka'),
      s.get('wadah') === 'tertutup' ? '#9fe8ad' : '#f0a94a');
    s.data.lolos.visible = false;
    s.data.gelembung.visible = false;
  }
})());
