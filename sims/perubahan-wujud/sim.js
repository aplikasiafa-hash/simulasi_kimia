/* Perubahan Wujud Benda — Fase B — adegan 3D */

Sim3D.daftar('perubahan-wujud', (function () {
  'use strict';
  const T = THREE, S = S3;

  const N = 220;
  const ZAT = [
    { n: 'Air', leleh: 0, didih: 100, wP: 0xaee0f0, wC: 0x3f8fd8, wG: 0xcfe8f4 },
    { n: 'Cokelat', leleh: 34, didih: 240, wP: 0x6b4228, wC: 0x8a5634, wG: 0xc09a7a },
    { n: 'Lilin', leleh: 58, didih: 320, wP: 0xf0e8d0, wC: 0xe8dcb8, wG: 0xf4eedc },
    { n: 'Besi', leleh: 1538, didih: 2862, wP: 0x8a949e, wC: 0xe08040, wG: 0xf0c080 }
  ];

  function zat(s) { return ZAT[parseInt(s.get('zat'), 10) || 0]; }
  function suhu(s) { return s.get('suhu'); }

  function wujudDari(z, t) {
    if (t < z.leleh) return 'padat';
    if (t < z.didih) return 'cair';
    return 'gas';
  }

  return {
    latar: 0x0a1016,
    kamera: { jarak: 9.6, phi: 1.1, theta: 0.55, targetY: 1.5, lajuPutar: 0.1 },

    kendali: [
      { judul: 'Zat', isi: [
        { type: 'select', id: 'zat', value: 0, label: 'Zat yang dipanaskan',
          options: ZAT.map(function (z, i) { return { value: i, label: z.n }; }) }
      ]},
      { judul: 'Pemanas', isi: [
        { type: 'slider', id: 'suhu', value: -20, min: -40, max: 160, step: 1,
          label: 'Suhu', unit: ' °C', dec: 0 },
        { type: 'toggle', id: 'api', value: true, label: 'Nyalakan pembakar' },
        { type: 'buttons', label: '', items: [
          { label: '❄ Bekukan', klik: function (s) { s.set('suhu', -30); } },
          { label: '🔥 Didihkan', klik: function (s) { s.set('suhu', 140); } }
        ]}
      ]},
      { judul: 'Tampilan', isi: [
        { type: 'toggle', id: 'partikel', value: true, label: 'Lihat partikelnya' },
        { type: 'toggle', id: 'termo', value: true, label: 'Tampilkan termometer' }
      ]}
    ],

    baca: [
      { id: 'suhu', label: 'Suhu', tone: 'aksen' },
      { id: 'wujud', label: 'Wujud sekarang' },
      { id: 'titik', label: 'Titik leleh / didih' },
      { id: 'proses', label: 'Nama perubahan' }
    ],

    bangun: function (s) {
      s.tambah(S.lantai({ r: 8, warna: 0x0f1620 }));

      // kaki tiga + kasa
      const kaki = new T.Group();
      for (let i = 0; i < 3; i++) {
        const a = i / 3 * Math.PI * 2;
        const b = new T.Mesh(new T.CylinderGeometry(0.045, 0.045, 1.5, 12), S.matLogam(0x6b747c));
        b.position.set(Math.cos(a) * 0.85, 0.75, Math.sin(a) * 0.85);
        b.rotation.z = Math.cos(a) * 0.1; b.rotation.x = -Math.sin(a) * 0.1;
        kaki.add(b);
      }
      const cincin = new T.Mesh(new T.TorusGeometry(0.88, 0.045, 12, 40), S.matLogam(0x6b747c));
      cincin.rotation.x = Math.PI / 2; cincin.position.y = 1.5;
      kaki.add(cincin);
      const kasa = new T.Mesh(new T.CylinderGeometry(0.92, 0.92, 0.035, 36),
        new T.MeshStandardMaterial({ color: 0x4a5058, roughness: 0.85, metalness: 0.4 }));
      kasa.position.y = 1.52;
      kaki.add(kasa);
      s.tambah(kaki);

      // pembakar
      const bakar = new T.Group();
      const dasar = new T.Mesh(new T.CylinderGeometry(0.42, 0.52, 0.2, 28), S.matLogam(0x3a4149));
      dasar.position.y = 0.1; bakar.add(dasar);
      const pipa = new T.Mesh(new T.CylinderGeometry(0.12, 0.14, 0.78, 20), S.matLogam(0x5a636b));
      pipa.position.y = 0.58; bakar.add(pipa);
      const api = S.nyala();
      api.position.y = 0.95;
      bakar.add(api);
      s.data.api = api;
      s.tambah(bakar);

      // gelas
      const gelas = S.gelas({ r: 0.95, h: 1.9, level: 0 });
      gelas.position.y = 1.54;
      gelas.userData.cair.visible = false;
      s.data.gelas = gelas;
      s.tambah(gelas);

      // bongkahan padat di dalam gelas
      const es = new T.Mesh(new T.BoxGeometry(1.05, 0.9, 1.05),
        new T.MeshPhysicalMaterial({
          color: 0xaee0f0, roughness: 0.14, metalness: 0, transmission: 0.55,
          thickness: 0.5, transparent: true, opacity: 0.9, clearcoat: 1, envMapIntensity: 1
        }));
      es.position.y = 1.54 + 0.47;
      es.castShadow = true;
      s.data.es = es;
      s.tambah(es);

      // partikel
      const p = S.partikel(N, { r: 0.075, warna: 0x7fc7e8, kotak: { x: 0.78, y: 0.78, z: 0.78 } });
      p.position.y = 1.54 + 0.85;
      s.data.p = p;
      s.tambah(p);

      // uap keluar dari mulut gelas
      const uap = S.partikel(60, { r: 0.07, warna: 0xcfe8f4, kotak: { x: 1.4, y: 1.4, z: 1.4 } });
      uap.material.transparent = true; uap.material.opacity = 0.45;
      uap.position.y = 3.9;
      s.data.uap = uap;
      uap.userData.p.forEach(function (q) {
        q.pos.set(S.acak(-0.45, 0.45), S.acak(-1.1, 0.5), S.acak(-0.45, 0.45));
        q.vel.set(S.acak(-0.14, 0.14), S.acak(0.32, 0.72), S.acak(-0.14, 0.14));
      });
      s.tambah(uap);

      // gelembung mendidih
      const gel = S.gelembung({ n: 40, sebar: 0.62, tinggi: 1.5 });
      gel.position.y = 1.6;
      s.data.gel = gel;
      s.tambah(gel);

      // termometer
      const termo = new T.Group();
      const tabungT = new T.Mesh(new T.CylinderGeometry(0.075, 0.075, 3.2, 20),
        S.matKaca({ opacity: 0.42, color: 0xdceef8 }));
      tabungT.position.y = 1.6; termo.add(tabungT);
      const bulb = new T.Mesh(new T.SphereGeometry(0.14, 24, 18),
        new T.MeshPhysicalMaterial({ color: 0xef4e4e, roughness: 0.2, emissive: 0xef4e4e, emissiveIntensity: 0.3 }));
      termo.add(bulb);
      const kolom = new T.Mesh(new T.CylinderGeometry(0.042, 0.042, 1, 16),
        new T.MeshPhysicalMaterial({ color: 0xef4e4e, roughness: 0.2, emissive: 0xef4e4e, emissiveIntensity: 0.35 }));
      termo.add(kolom);
      s.data.kolom = kolom;
      termo.position.set(1.45, 1.7, 0.3);
      s.data.termo = termo;
      s.tambah(termo);

      const lbl = S.teks('Padat', { skala: 0.52, lebar: 16, warna: '#9fe8ad' });
      lbl.position.set(0, 5.2, 0);
      s.data.lbl = lbl;
      s.tambah(lbl);

      pasang(s);
    },

    ubah: function (s, id) {
      if (id === 'zat') pasangSkala(s);
      if (id === 'termo') s.data.termo.visible = s.get('termo');
      if (id === 'partikel') s.data.p.visible = s.get('partikel');
      pasang(s);
    },

    langkah: function (s, dt) {
      const z = zat(s), t = suhu(s);
      const w = wujudDari(z, petakanSuhu(z, t));
      const p = s.data.p, d = p.userData.p;
      const panas = S.clamp((petakanSuhu(z, t) - z.leleh) / Math.max(1, z.didih - z.leleh), 0, 1);

      s.data.api.userData.perbarui(s.waktu, s.get('api') ? S.clamp((t + 40) / 200, 0, 1) : 0);

      if (w === 'gas') {
        p.userData.gerak(dt, 1.6 + panas);
        s.data.uap.visible = true;
        majuUap(s, dt, 1.3);
        s.data.gel.userData.perbarui(dt, 1.4);
      } else if (w === 'cair') {
        for (let i = 0; i < d.length; i++) {
          const q = d[i];
          q.pos.addScaledVector(q.vel, dt * (0.3 + panas * 0.7));
          const r = Math.hypot(q.pos.x, q.pos.z);
          if (r > 0.74) { q.pos.x *= 0.74 / r; q.pos.z *= 0.74 / r; q.vel.x *= -0.72; q.vel.z *= -0.72; }
          if (q.pos.y > 0.02) { q.pos.y = 0.02; q.vel.y = -Math.abs(q.vel.y); }
          if (q.pos.y < -0.78) { q.pos.y = -0.78; q.vel.y = Math.abs(q.vel.y); }
        }
        p.userData.tulis();
        s.data.uap.visible = panas > 0.72;
        if (s.data.uap.visible) majuUap(s, dt, 0.5);
        s.data.gel.userData.perbarui(dt, panas > 0.6 ? (panas - 0.6) * 2.4 : 0);
      } else {
        const dingin = S.clamp((z.leleh - petakanSuhu(z, t)) / 40, 0, 1);
        const amp = 0.05 * (1 - dingin * 0.75);
        for (let i = 0; i < d.length; i++) {
          const q = d[i];
          if (!q.asal) continue;
          q.pos.set(
            q.asal.x + Math.sin(s.waktu * 10 + i * 1.7) * amp,
            q.asal.y + Math.sin(s.waktu * 12 + i * 2.3) * amp,
            q.asal.z + Math.cos(s.waktu * 11 + i * 1.1) * amp);
        }
        p.userData.tulis();
        s.data.uap.visible = false;
        s.data.gel.userData.perbarui(dt, 0);
      }

      // kolom termometer
      const f = S.clamp((t + 40) / 200, 0, 1);
      s.data.kolom.scale.y = Math.max(0.01, f * 3);
      s.data.kolom.position.y = f * 1.5;
    },

    bacaUbah: function (s) {
      const z = zat(s), t = suhu(s);
      const tt = petakanSuhu(z, t);
      const w = wujudDari(z, tt);
      s.baca('suhu', Math.round(t) + ' °C' + (z.n !== 'Air' ? ' (skala ' + z.n.toLowerCase() + ')' : ''),
        t < 0 ? 'biru' : t > 100 ? 'danger' : 'aksen');
      s.baca('wujud', w === 'padat' ? 'Padat' : w === 'cair' ? 'Cair' : 'Gas',
        w === 'padat' ? 'biru' : w === 'cair' ? 'aksen' : 'warn');
      s.baca('titik', z.leleh + ' °C / ' + z.didih + ' °C');
      const dekatLeleh = Math.abs(tt - z.leleh) < (z.didih - z.leleh) * 0.06;
      const dekatDidih = Math.abs(tt - z.didih) < (z.didih - z.leleh) * 0.06;
      s.baca('proses', dekatLeleh ? 'Mencair / membeku'
        : dekatDidih ? 'Menguap / mengembun'
        : w === 'padat' ? 'Belum berubah' : w === 'gas' ? 'Sudah menguap' : 'Sudah mencair');
    }
  };

  /* Petakan suhu slider (−40..160) ke skala zat, agar semua zat bisa
     dilelehkan dalam satu rentang penggeser yang sama. */
  function petakanSuhu(z, t) {
    if (z.leleh === 0 && z.didih === 100) return t;
    const f = (t + 40) / 200;                 // 0..1
    return z.leleh - 40 + f * (z.didih + 60 - (z.leleh - 40));
  }

  function majuUap(s, dt, laju) {
    const u = s.data.uap.userData.p;
    for (let i = 0; i < u.length; i++) {
      u[i].pos.addScaledVector(u[i].vel, dt * laju);
      const naik = (u[i].pos.y + 1.2) / 2.0;
      u[i].r = 0.075 * (1 - S.clamp(naik, 0, 1) * 0.55);
      if (u[i].pos.y > 0.8) u[i].pos.set(S.acak(-0.35, 0.35), -1.2, S.acak(-0.35, 0.35));
    }
    s.data.uap.userData.tulis();
  }

  function pasang(s) {
    const z = zat(s), t = petakanSuhu(zat(s), suhu(s));
    const w = wujudDari(z, t);
    const p = s.data.p, d = p.userData.p;

    s.data.es.visible = w === 'padat' && !s.get('partikel');
    s.data.es.material.color.setHex(z.wP);
    const tampilCair = w === 'cair' && !s.get('partikel');
    s.data.gelas.userData.setLevel(tampilCair ? 0.55 : 0, z.wC);
    s.data.p.visible = s.get('partikel');
    s.data.uap.material.color.setHex(z.wG);

    const warna = w === 'padat' ? z.wP : w === 'cair' ? z.wC : z.wG;
    p.material.color.setHex(warna);
    p.material.emissive.setHex(warna);

    if (w === 'padat') {
      const sisi = Math.floor(Math.pow(d.length, 1 / 3));
      const jarak = 0.168;
      let k = 0;
      for (let x = 0; x < sisi; x++) for (let y = 0; y < sisi; y++) for (let zz = 0; zz < sisi; zz++) {
        if (k >= d.length) break;
        const q = d[k++];
        q.asal = new T.Vector3(
          (x - (sisi - 1) / 2) * jarak,
          (y - (sisi - 1) / 2) * jarak - 0.35,
          (zz - (sisi - 1) / 2) * jarak);
        q.pos.copy(q.asal);
        q.r = 0.072; q.aktif = true;
      }
      for (; k < d.length; k++) { d[k].aktif = false; d[k].asal = null; }
    } else if (w === 'cair') {
      for (let i = 0; i < d.length; i++) {
        const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 0.7;
        d[i].pos.set(Math.cos(a) * r, -0.78 + Math.random() * 0.78, Math.sin(a) * r);
        d[i].vel.set(S.acak(-1, 1), S.acak(-1, 1), S.acak(-1, 1)).normalize().multiplyScalar(S.acak(.4, .9));
        d[i].asal = null; d[i].r = 0.072; d[i].aktif = true;
      }
    } else {
      p.userData.kotak = { x: 0.78, y: 0.82, z: 0.78 };
      for (let i = 0; i < d.length; i++) {
        d[i].pos.set(S.acak(-0.7, 0.7), S.acak(-0.78, 0.78), S.acak(-0.7, 0.7));
        d[i].vel.set(S.acak(-1, 1), S.acak(-1, 1), S.acak(-1, 1)).normalize().multiplyScalar(S.acak(1, 1.8));
        d[i].asal = null; d[i].r = 0.06; d[i].aktif = true;
      }
    }
    p.userData.tulis();

    s.data.lbl.userData.ganti(z.n + ' — ' + (w === 'padat' ? 'Padat' : w === 'cair' ? 'Cair' : 'Gas'),
      w === 'padat' ? '#9fc8e8' : w === 'cair' ? '#7fe3d6' : '#f0c88a');
    s.data.termo.visible = s.get('termo');
  }

  function pasangSkala(s) { /* skala mengikuti zat lewat petakanSuhu */ }
})());
