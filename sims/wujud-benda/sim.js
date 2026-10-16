/* Wujud Benda di Sekitar Kita — Fase A — adegan 3D */

Sim3D.daftar('wujud-benda', (function () {
  'use strict';
  const T = THREE, S = S3;

  const BENDA = [
    { n: 'Batu', wujud: 'padat', warna: 0x8a8378, pw: 0x6f6a60 },
    { n: 'Es batu', wujud: 'padat', warna: 0xaee0f0, pw: 0x7fc7e8 },
    { n: 'Buku', wujud: 'padat', warna: 0xd06a4a, pw: 0xc07850 },
    { n: 'Air', wujud: 'cair', warna: 0x3f8fd8, pw: 0x4a9fe0 },
    { n: 'Susu', wujud: 'cair', warna: 0xf0f2f4, pw: 0xe8eef2 },
    { n: 'Minyak', wujud: 'cair', warna: 0xe8c54a, pw: 0xf0d060 },
    { n: 'Udara', wujud: 'gas', warna: 0x6fd0e0, pw: 0x7fe3d6 },
    { n: 'Asap', wujud: 'gas', warna: 0x9aa4ae, pw: 0xb0bac4 },
    { n: 'Uap air', wujud: 'gas', warna: 0xc0e0f0, pw: 0xd0eaf6 }
  ];

  const INFO = {
    padat: { n: 'Padat', w: 0x6fcf7f, bentuk: 'Tetap', isi: 'Tetap' },
    cair:  { n: 'Cair',  w: 0x5b9bf5, bentuk: 'Berubah', isi: 'Tetap' },
    gas:   { n: 'Gas',   w: 0xf0a94a, bentuk: 'Berubah', isi: 'Berubah' }
  };

  const N = 160;

  function benda(s) { return BENDA[parseInt(s.get('benda'), 10) || 0]; }

  return {
    latar: 0x0a1218,
    kamera: { jarak: 9.4, phi: 1.15, theta: 0.6, targetY: 0.9, lajuPutar: 0.1 },

    kendali: [
      { judul: 'Benda yang diamati', isi: [
        { type: 'select', id: 'benda', value: 0, label: 'Pilih benda',
          options: BENDA.map(function (b, i) { return { value: i, label: b.n + '  —  ' + INFO[b.wujud].n }; }) }
      ]},
      { judul: 'Wadah', isi: [
        { type: 'segment', id: 'wadah', value: 'gelas', label: 'Bentuk wadah', options: [
          { value: 'gelas', label: 'Gelas' },
          { value: 'kotak', label: 'Kotak' },
          { value: 'tanpa', label: 'Tanpa' }
        ]},
        { type: 'toggle', id: 'partikel', value: true, label: 'Tampilkan partikel' },
        { type: 'toggle', id: 'gerak', value: true, label: 'Partikel bergerak' }
      ]},
      { judul: 'Pengamatan', isi: [
        { type: 'slider', id: 'laju', value: 1, min: 0.1, max: 2.5, step: 0.1,
          label: 'Kecepatan gerak', unit: '×', dec: 1 }
      ]}
    ],

    baca: [
      { id: 'wujud', label: 'Wujud', tone: 'aksen' },
      { id: 'bentuk', label: 'Bentuknya' },
      { id: 'isi', label: 'Ruang yang diisi' },
      { id: 'susun', label: 'Susunan partikel' }
    ],

    bangun: function (s) {
      s.tambah(S.lantai({ r: 7, y: 0, warna: 0x121a21 }));

      // wadah gelas
      const gelas = S.gelas({ r: 1.5, h: 2.6, level: 0 });
      gelas.userData.cair.visible = false;
      s.data.gelas = gelas;
      s.tambah(gelas);

      // wadah kotak
      const kotak = new T.Group();
      const kaca = S.matKaca({ thickness: 0.25 });
      const kg = new T.Mesh(new T.BoxGeometry(2.8, 2.6, 2.8), kaca);
      kg.position.y = 1.3;
      kg.renderOrder = 2;
      kotak.add(kg);
      const rangka = new T.LineSegments(
        new T.EdgesGeometry(new T.BoxGeometry(2.8, 2.6, 2.8)),
        new T.LineBasicMaterial({ color: 0x7fe3d6, transparent: true, opacity: 0.4 }));
      rangka.position.y = 1.3;
      kotak.add(rangka);
      kotak.visible = false;
      s.data.kotak = kotak;
      s.tambah(kotak);

      // partikel
      const p = S.partikel(N, { r: 0.12, warna: 0x5b9bf5, kotak: { x: 1.2, y: 1.1, z: 1.2 } });
      p.position.y = 1.2;
      s.data.p = p;
      s.tambah(p);

      // cairan nyata di dalam wadah (untuk wujud cair)
      const cairan = new T.Mesh(
        new T.CylinderGeometry(1.47, 1.47, 1, 48),
        S.matCairan(0x3f8fd8, { opacity: 0.85 }));
      cairan.renderOrder = 1;
      s.data.cairan = cairan;
      s.tambah(cairan);

      // bongkahan padat
      const padat = new T.Group();
      const blok = new T.Mesh(new T.BoxGeometry(1.5, 1.2, 1.5),
        new T.MeshPhysicalMaterial({ color: 0x8a8378, roughness: 0.55, metalness: 0.08, clearcoat: 0.3 }));
      blok.castShadow = true; blok.receiveShadow = true;
      blok.position.y = 0.6;
      padat.add(blok);
      s.data.padat = padat;
      s.data.blok = blok;
      s.tambah(padat);

      // label wujud melayang
      const lbl = S.teks('Padat', { skala: 0.52, warna: '#9fe8ad' });
      lbl.position.set(0, 3.4, 0);
      s.data.lbl = lbl;
      s.tambah(lbl);

      pasang(s);
    },

    ubah: function (s, id) {
      if (id === 'benda' || id === 'wadah') pasang(s);
      if (id === 'partikel') s.data.p.visible = s.get('partikel');
    },

    langkah: function (s, dt) {
      const b = benda(s);
      const p = s.data.p;
      const laju = s.get('gerak') ? s.get('laju') : 0;
      const d = p.userData.p;

      if (b.wujud === 'gas') {
        p.userData.gerak(dt, laju * 1.5);
      } else if (b.wujud === 'cair') {
        // partikel berdesakan: gerak lambat + tarikan ke pusat bawah
        for (let i = 0; i < d.length; i++) {
          const q = d[i];
          q.pos.addScaledVector(q.vel, dt * laju * 0.42);
          const r = Math.hypot(q.pos.x, q.pos.z);
          if (r > 1.18) { q.pos.x *= 1.18 / r; q.pos.z *= 1.18 / r; q.vel.x *= -0.7; q.vel.z *= -0.7; }
          if (q.pos.y > -0.1) { q.pos.y = -0.1; q.vel.y = -Math.abs(q.vel.y); }
          if (q.pos.y < -1.05) { q.pos.y = -1.05; q.vel.y = Math.abs(q.vel.y); }
        }
        p.userData.tulis();
      } else {
        // padat: bergetar di sekitar titik kisi
        for (let i = 0; i < d.length; i++) {
          const q = d[i];
          if (!q.asal) continue;
          const g = 0.055 * laju;
          q.pos.set(
            q.asal.x + Math.sin(s.waktu * 9 + i * 1.7) * g,
            q.asal.y + Math.sin(s.waktu * 11 + i * 2.3) * g,
            q.asal.z + Math.cos(s.waktu * 10 + i * 1.1) * g
          );
        }
        p.userData.tulis();
      }

      if (s.data.padat.visible) {
        s.data.blok.rotation.y += dt * 0.25;
      }
    },

    bacaUbah: function (s) {
      const b = benda(s);
      const i = INFO[b.wujud];
      s.baca('wujud', i.n, b.wujud === 'padat' ? 'aksen' : b.wujud === 'cair' ? 'biru' : 'warn');
      s.baca('bentuk', i.bentuk);
      s.baca('isi', i.isi);
      s.baca('susun', b.wujud === 'padat' ? 'Rapat dan teratur'
        : b.wujud === 'cair' ? 'Rapat tapi bebas bergeser' : 'Renggang dan bebas');
    }
  };

  function pasang(s) {
    const b = benda(s);
    const wadah = s.get('wadah');
    const p = s.data.p;
    const d = p.userData.p;

    s.data.gelas.visible = wadah === 'gelas';
    s.data.kotak.visible = wadah === 'kotak';

    // bentuk ruang partikel menyesuaikan wadah
    const kotakGas = wadah === 'kotak'
      ? { x: 1.25, y: 1.15, z: 1.25 }
      : wadah === 'gelas' ? { x: 1.3, y: 1.15, z: 1.3 } : { x: 1.9, y: 1.5, z: 1.9 };
    p.userData.kotak = kotakGas;

    p.material.color.setHex(b.pw);
    p.material.emissive.setHex(b.pw);
    p.visible = s.get('partikel');

    s.data.cairan.visible = b.wujud === 'cair';
    s.data.padat.visible = b.wujud === 'padat';

    if (b.wujud === 'cair') {
      s.data.cairan.material.color.setHex(b.warna);
      const tinggi = 1.1;
      s.data.cairan.scale.y = tinggi;
      s.data.cairan.position.y = tinggi / 2;
      s.data.cairan.scale.x = s.data.cairan.scale.z = wadah === 'kotak' ? 0.92 : 1;
      s.data.cairan.visible = wadah !== 'tanpa';
      // partikel berkumpul di bawah
      for (let i = 0; i < d.length; i++) {
        const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 1.1;
        d[i].pos.set(Math.cos(a) * r, -0.1 - Math.random() * 0.95, Math.sin(a) * r);
        d[i].vel.set(S.acak(-1, 1), S.acak(-1, 1), S.acak(-1, 1)).normalize().multiplyScalar(S.acak(.4, .9));
        d[i].asal = null;
        d[i].r = 0.11;
      }
      p.position.y = 1.2;
    } else if (b.wujud === 'padat') {
      s.data.blok.material.color.setHex(b.warna);
      // kisi kubus teratur
      const sisi = Math.floor(Math.pow(d.length, 1 / 3));
      const jarak = 1.24 / sisi;
      let k = 0;
      for (let x = 0; x < sisi; x++) for (let y = 0; y < sisi; y++) for (let z = 0; z < sisi; z++) {
        if (k >= d.length) break;
        const q = d[k++];
        q.asal = new T.Vector3(
          (x - (sisi - 1) / 2) * jarak,
          (y - (sisi - 1) / 2) * jarak,
          (z - (sisi - 1) / 2) * jarak);
        q.pos.copy(q.asal);
        q.r = 0.11;
      }
      for (; k < d.length; k++) { d[k].asal = null; d[k].r = 0.0001; }
      p.position.y = 1.2;
      s.data.padat.visible = true;
      s.data.blok.visible = !s.get('partikel');
    } else {
      for (let i = 0; i < d.length; i++) {
        d[i].pos.set(S.acak(-kotakGas.x, kotakGas.x), S.acak(-kotakGas.y, kotakGas.y), S.acak(-kotakGas.z, kotakGas.z));
        d[i].vel.set(S.acak(-1, 1), S.acak(-1, 1), S.acak(-1, 1)).normalize().multiplyScalar(S.acak(.7, 1.4));
        d[i].asal = null;
        d[i].r = 0.085;
      }
      p.position.y = 1.2;
    }
    p.userData.tulis();

    const i = INFO[b.wujud];
    s.data.lbl.userData.ganti(b.n + ' — ' + i.n);
    s.data.lbl.material.map.needsUpdate = true;
  }
})());
