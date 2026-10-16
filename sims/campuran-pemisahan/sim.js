/* Campuran dan Cara Memisahkannya — Fase C — adegan 3D */

Sim3D.daftar('campuran-pemisahan', (function () {
  'use strict';
  const T = THREE, S = S3;

  const CAMPURAN = [
    { n: 'Pasir + air', a: { n: 'pasir', w: 0xc2a878, larut: false, berat: true },
      b: { n: 'air', w: 0x4a9fd8 }, cara: 'saring' },
    { n: 'Garam + air', a: { n: 'garam', w: 0xffffff, larut: true },
      b: { n: 'air', w: 0x4a9fd8 }, cara: 'uapkan' },
    { n: 'Serbuk besi + pasir', a: { n: 'besi', w: 0x6b747c, magnet: true },
      b: { n: 'pasir', w: 0xc2a878 }, cara: 'magnet' },
    { n: 'Minyak + air', a: { n: 'minyak', w: 0xe8c54a, ringan: true },
      b: { n: 'air', w: 0x4a9fd8 }, cara: 'tuang' },
    { n: 'Kapur + air', a: { n: 'kapur', w: 0xf0f2f4, larut: false, berat: true },
      b: { n: 'air', w: 0x4a9fd8 }, cara: 'endap' }
  ];

  const CARA = {
    saring: { n: 'Penyaringan (filtrasi)', ket: 'butiran tertahan kertas saring' },
    uapkan: { n: 'Penguapan (evaporasi)', ket: 'air menguap, zat terlarut tertinggal' },
    magnet: { n: 'Penarikan magnet', ket: 'hanya bahan bersifat magnet yang tertarik' },
    tuang:  { n: 'Dekantasi (menuang)', ket: 'lapisan atas dituang terpisah' },
    endap:  { n: 'Pengendapan (sedimentasi)', ket: 'butiran berat turun ke dasar' }
  };

  const N = 170;

  function camp(s) { return CAMPURAN[parseInt(s.get('camp'), 10) || 0]; }

  return {
    latar: 0x091016,
    kamera: { jarak: 9.6, phi: 1.08, theta: 0.6, targetY: 1.5, lajuPutar: 0.1 },

    kendali: [
      { judul: 'Campuran', isi: [
        { type: 'select', id: 'camp', value: 0, label: 'Yang akan dipisahkan',
          options: CAMPURAN.map(function (c, i) { return { value: i, label: c.n }; }) }
      ]},
      { judul: 'Cara memisahkan', isi: [
        { type: 'segment', id: 'cara', value: 'saring', label: 'Alat yang dipakai', options: [
          { value: 'saring', label: 'Saring' }, { value: 'uapkan', label: 'Uapkan' },
          { value: 'magnet', label: 'Magnet' }, { value: 'endap', label: 'Diamkan' }
        ]},
        { type: 'buttons', label: '', items: [
          { label: '▶ Mulai memisahkan', utama: true, klik: function (s) { s.data.maju = true; } },
          { label: '↺ Ulangi', klik: function (s) { pasang(s); } }
        ]},
        { type: 'slider', id: 'laju', value: 1, min: 0.2, max: 3, step: 0.1,
          label: 'Kecepatan proses', unit: '×', dec: 1 }
      ]}
    ],

    baca: [
      { id: 'cara', label: 'Cara', tone: 'aksen' },
      { id: 'tepat', label: 'Apakah cocok?' },
      { id: 'maju', label: 'Kemajuan' },
      { id: 'dasar', label: 'Dasar pemisahan' }
    ],

    bangun: function (s) {
      s.tambah(S.lantai({ r: 8, warna: 0x0f1620 }));

      /* --- gelas atas (campuran) --- */
      const atas = S.gelas({ r: 1.0, h: 1.7, level: 0.62 });
      atas.position.y = 2.5;
      s.data.atas = atas;
      s.tambah(atas);

      /* --- corong + kertas saring --- */
      const corong = new T.Group();
      const kerucut = new T.Mesh(new T.ConeGeometry(0.85, 1.0, 40, 1, true), S.matKaca({ opacity: 0.2 }));
      kerucut.rotation.x = Math.PI;
      kerucut.position.y = 0.5;
      corong.add(kerucut);
      const pipa = new T.Mesh(new T.CylinderGeometry(0.1, 0.1, 0.7, 20), S.matKaca({ opacity: 0.2 }));
      pipa.position.y = -0.35;
      corong.add(pipa);
      const kertas = new T.Mesh(new T.ConeGeometry(0.78, 0.9, 36, 1, true),
        new T.MeshStandardMaterial({ color: 0xf2efe4, roughness: 0.92, side: T.DoubleSide }));
      kertas.rotation.x = Math.PI; kertas.position.y = 0.46;
      corong.add(kertas);
      corong.position.y = 1.45;
      corong.visible = false;
      s.data.corong = corong;
      s.tambah(corong);

      /* --- gelas bawah (hasil) --- */
      const bawah = S.gelas({ r: 1.05, h: 1.5, level: 0 });
      s.data.bawah = bawah;
      s.tambah(bawah);

      /* --- cawan penguap + pembakar --- */
      const cawan = new T.Group();
      const mangkuk = new T.Mesh(
        new T.SphereGeometry(1.0, 40, 20, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2.6),
        new T.MeshStandardMaterial({ color: 0xe8e4da, roughness: 0.55, side: T.DoubleSide }));
      mangkuk.position.y = 0.55;
      cawan.add(mangkuk);
      cawan.visible = false;
      cawan.position.y = 1.5;
      s.data.cawan = cawan;
      s.tambah(cawan);

      const api = S.nyala();
      api.position.y = 0.6;
      api.visible = false;
      s.data.api = api;
      s.tambah(api);

      const kakiApi = new T.Group();
      for (let i = 0; i < 3; i++) {
        const a = i / 3 * Math.PI * 2;
        const b = new T.Mesh(new T.CylinderGeometry(0.04, 0.04, 1.45, 10), S.matLogam(0x6b747c));
        b.position.set(Math.cos(a) * 0.8, 0.72, Math.sin(a) * 0.8);
        kakiApi.add(b);
      }
      const cincin = new T.Mesh(new T.TorusGeometry(0.82, 0.04, 10, 36), S.matLogam(0x6b747c));
      cincin.rotation.x = Math.PI / 2; cincin.position.y = 1.45;
      kakiApi.add(cincin);
      kakiApi.visible = false;
      s.data.kakiApi = kakiApi;
      s.tambah(kakiApi);

      /* --- magnet --- */
      const magnet = new T.Group();
      const batangM = new T.Mesh(new T.BoxGeometry(0.34, 1.3, 0.34), S.matLogam(0xd0402a, { metalness: 0.5 }));
      const batangM2 = new T.Mesh(new T.BoxGeometry(0.34, 0.5, 0.34), S.matLogam(0x3a6fd0, { metalness: 0.5 }));
      batangM2.position.y = -0.9;
      magnet.add(batangM, batangM2);
      magnet.position.set(0, 4.4, 0);
      magnet.visible = false;
      s.data.magnet = magnet;
      s.tambah(magnet);

      /* --- partikel campuran --- */
      const pa = S.partikel(N, { r: 0.06, warna: 0xc2a878, kotak: { x: 0.85, y: 0.6, z: 0.85 } });
      s.data.pa = pa;
      s.tambah(pa);

      /* --- aliran tetesan --- */
      const tetes = S.partikel(30, { r: 0.05, warna: 0x4a9fd8, kotak: { x: 0.2, y: 1, z: 0.2 } });
      tetes.visible = false;
      s.data.tetes = tetes;
      s.tambah(tetes);

      /* --- uap air --- */
      const uap = S.partikel(50, { r: 0.07, warna: 0xd8eef8, kotak: { x: 1, y: 1.4, z: 1 } });
      uap.material.transparent = true; uap.material.opacity = 0.42;
      uap.position.y = 3.6;
      uap.visible = false;
      s.data.uap = uap;
      s.tambah(uap);

      const lbl = S.teks('', { skala: 0.44, lebar: 28, warna: '#d8e4ec' });
      lbl.position.set(0, 5.4, 0);
      s.data.lbl = lbl;
      s.tambah(lbl);

      pasang(s);
    },

    ubah: function (s, id) {
      if (id === 'camp') {
        s.setDiam('cara', camp(s).cara);
      }
      pasang(s);
    },

    langkah: function (s, dt) {
      const c = camp(s);
      const cara = s.get('cara');
      const cocok = cara === c.cara;
      const laju = s.get('laju');
      const p = s.data.pa, d = p.userData.p;

      if (s.data.maju) {
        s.data.t = Math.min(1, (s.data.t || 0) + dt * laju * (cocok ? 0.26 : 0.1));
      }
      const t = s.data.t || 0;

      if (cara === 'saring') {
        // cairan turun ke gelas bawah, butiran tertahan di kertas
        s.data.atas.userData.setLevel(0.62 * (1 - t));
        s.data.bawah.userData.setLevel(0.72 * t * (cocok ? 1 : 0.7),
          cocok ? c.b.w : campurWarna(c));
        s.data.tetes.visible = s.data.maju && t < 0.99;
        majuTetes(s, dt * laju);
        for (let i = 0; i < d.length; i++) {
          const q = d[i];
          if (!q.aktif) continue;
          if (cocok || !q.ikut) {
            // tertahan: berkumpul di kerucut kertas saring
            const tt = S.clamp(t * 1.4, 0, 1);
            q.pos.y = S.lerp(q.asal.y, 1.75 + Math.random() * 0.05, tt);
            const r = Math.hypot(q.asal.x, q.asal.z) * (1 - tt * 0.45);
            const a = Math.atan2(q.asal.z, q.asal.x);
            q.pos.x = Math.cos(a) * r; q.pos.z = Math.sin(a) * r;
          } else {
            // lolos ikut cairan
            q.pos.y = S.lerp(q.asal.y, 0.4, S.clamp(t * 1.2, 0, 1));
          }
        }
      } else if (cara === 'uapkan') {
        s.data.atas.userData.setLevel(0);
        s.data.api.userData.perbarui(s.waktu, s.data.maju ? 1 : 0);
        s.data.uap.visible = s.data.maju && t < 0.98;
        majuUap(s, dt * laju);
        for (let i = 0; i < d.length; i++) {
          const q = d[i];
          if (!q.aktif) continue;
          // zat terlarut muncul sebagai kristal di dasar cawan
          const muncul = cocok ? S.clamp((t - 0.25) * 1.6, 0, 1) : 0;
          q.r = (c.a.larut ? 0.055 : 0.06) * (c.a.larut ? muncul : 1);
          q.pos.y = S.lerp(q.asal.y, 1.62, S.clamp(t * 1.3, 0, 1));
          const r = Math.hypot(q.asal.x, q.asal.z) * 0.8;
          const a = Math.atan2(q.asal.z, q.asal.x) + t * 0.6;
          q.pos.x = Math.cos(a) * r; q.pos.z = Math.sin(a) * r;
        }
      } else if (cara === 'magnet') {
        s.data.magnet.position.y = S.lerp(4.4, 3.1, t);
        for (let i = 0; i < d.length; i++) {
          const q = d[i];
          if (!q.aktif) continue;
          if (cocok && q.magnetik) {
            const tt = S.clamp(t * 1.5, 0, 1);
            q.pos.y = S.lerp(q.asal.y, 2.9, tt);
            q.pos.x = S.lerp(q.asal.x, q.asal.x * 0.3, tt);
            q.pos.z = S.lerp(q.asal.z, q.asal.z * 0.3, tt);
          } else {
            q.pos.copy(q.asal);
            q.pos.y += Math.sin(s.waktu * 2 + i) * 0.006;
          }
        }
      } else {
        // pengendapan
        for (let i = 0; i < d.length; i++) {
          const q = d[i];
          if (!q.aktif) continue;
          const tt = S.clamp(t * 1.3, 0, 1);
          if (q.berat) {
            q.pos.y = S.lerp(q.asal.y, 2.08 + Math.random() * 0.04, tt);
          } else if (q.ringan) {
            q.pos.y = S.lerp(q.asal.y, 3.08, tt);
          } else {
            q.pos.y = q.asal.y + Math.sin(s.waktu * 1.6 + i) * 0.02;
          }
        }
        s.data.atas.userData.setLevel(0.62);
      }
      p.userData.tulis();
    },

    bacaUbah: function (s) {
      const c = camp(s);
      const cara = s.get('cara');
      const cocok = cara === c.cara;
      s.baca('cara', CARA[cara].n, cocok ? 'aksen' : 'warn');
      s.baca('tepat', cocok ? 'Cara yang tepat' : 'Kurang tepat untuk campuran ini',
        cocok ? 'aksen' : 'danger');
      s.baca('maju', Math.round((s.data.t || 0) * 100) + '%');
      s.baca('dasar', CARA[cara].ket);
    }
  };

  function campurWarna(c) {
    const a = new T.Color(c.a.w), b = new T.Color(c.b.w);
    return a.lerp(b, 0.6).getHex();
  }

  function majuTetes(s, dt) {
    const d = s.data.tetes.userData.p;
    for (let i = 0; i < d.length; i++) {
      d[i].pos.y -= dt * 2.6;
      if (d[i].pos.y < 0.4) d[i].pos.set(S.acak(-0.05, 0.05), 1.05, S.acak(-0.05, 0.05));
    }
    s.data.tetes.userData.tulis();
  }

  function majuUap(s, dt) {
    const d = s.data.uap.userData.p;
    for (let i = 0; i < d.length; i++) {
      d[i].pos.y += dt * 0.8;
      d[i].pos.x += Math.sin(s.waktu * 2 + i) * dt * 0.1;
      if (d[i].pos.y > 1.3) d[i].pos.set(S.acak(-0.45, 0.45), -1.1, S.acak(-0.45, 0.45));
    }
    s.data.uap.userData.tulis();
  }

  function pasang(s) {
    const c = camp(s);
    const cara = s.get('cara');
    s.data.t = 0;
    s.data.maju = false;

    s.data.corong.visible = cara === 'saring';
    s.data.cawan.visible = cara === 'uapkan';
    s.data.api.visible = cara === 'uapkan';
    s.data.kakiApi.visible = cara === 'uapkan';
    s.data.magnet.visible = cara === 'magnet';
    s.data.magnet.position.y = 4.4;
    s.data.atas.visible = cara !== 'uapkan' && cara !== 'magnet';
    s.data.bawah.visible = cara === 'saring';
    s.data.tetes.visible = false;
    s.data.uap.visible = false;
    s.data.api.userData.perbarui(0, 0);

    s.data.atas.position.y = cara === 'saring' ? 2.9 : 1.6;
    s.data.atas.userData.setLevel(0.62, c.b.w);
    s.data.bawah.userData.setLevel(0);

    const p = s.data.pa, d = p.userData.p;
    const campuranDuaPadat = cara === 'magnet' || c.cara === 'magnet';
    p.material.color.setHex(c.a.w);
    p.material.emissive.setHex(c.a.w);

    for (let i = 0; i < d.length; i++) {
      const q = d[i];
      q.aktif = true;
      q.r = 0.06;
      q.magnetik = !!c.a.magnet && i % 2 === 0;
      q.berat = !!c.a.berat;
      q.ringan = !!c.a.ringan;
      q.ikut = !!c.a.larut;          // zat larut lolos saringan
      const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 0.72;
      const yDasar = cara === 'saring' ? 2.9 : cara === 'magnet' ? 1.1 : cara === 'uapkan' ? 1.6 : 1.6;
      q.asal = new T.Vector3(Math.cos(a) * r,
        yDasar + Math.random() * 0.85, Math.sin(a) * r);
      q.pos.copy(q.asal);
    }
    // campuran dua padat: tumpukan di piring, bukan di gelas
    if (campuranDuaPadat) {
      for (let i = 0; i < d.length; i++) {
        const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 0.95;
        d[i].asal = new T.Vector3(Math.cos(a) * r, 1.14 + Math.random() * 0.12, Math.sin(a) * r);
        d[i].pos.copy(d[i].asal);
        d[i].magnetik = i % 2 === 0;
      }
      if (!s.data.piring) {
        const piring = new T.Mesh(new T.CylinderGeometry(1.25, 1.15, 0.2, 44),
          new T.MeshStandardMaterial({ color: 0xdedacf, roughness: 0.6 }));
        piring.position.y = 1.05;
        s.data.piring = piring;
        s.tambah(piring);
      }
    }
    if (s.data.piring) s.data.piring.visible = campuranDuaPadat;
    p.userData.tulis();

    s.data.lbl.userData.ganti(c.n + '  →  ' + CARA[cara].n,
      cara === c.cara ? '#9fe8ad' : '#f0d58a');
    s.orbit.set({ targetY: cara === 'saring' ? 2.0 : cara === 'magnet' ? 2.2 : 1.6 });
  }
})());
