/* Larut atau Tidak Larut? — Fase B — adegan 3D */

Sim3D.daftar('larut-tak-larut', (function () {
  'use strict';
  const T = THREE, S = S3;

  const ZAT = [
    { n: 'Gula pasir', larut: 1.0,  w: 0xf2f0ea, warnaLarutan: 0x4a9fd8, butir: 0.055 },
    { n: 'Garam dapur', larut: 1.0, w: 0xffffff, warnaLarutan: 0x4a9fd8, butir: 0.05 },
    { n: 'Sirup', larut: 1.0,      w: 0xe0405a, warnaLarutan: 0xd04a62, butir: 0.07 },
    { n: 'Kopi bubuk', larut: 0.45, w: 0x5a3a24, warnaLarutan: 0x6b4630, butir: 0.055 },
    { n: 'Pasir', larut: 0.0,      w: 0xc2a878, warnaLarutan: 0x4a9fd8, butir: 0.07 },
    { n: 'Minyak goreng', larut: 0.0, w: 0xe8c54a, warnaLarutan: 0x4a9fd8, butir: 0.1, mengapung: true },
    { n: 'Kapur tulis', larut: 0.08, w: 0xf0f2f4, warnaLarutan: 0x9ab8cc, butir: 0.06 },
    { n: 'Serbuk besi', larut: 0.0, w: 0x6b747c, butir: 0.05, warnaLarutan: 0x4a9fd8 }
  ];

  const N = 180;

  function zat(s) { return ZAT[parseInt(s.get('zat'), 10) || 0]; }

  return {
    latar: 0x091014,
    kamera: { jarak: 7.6, phi: 1.12, theta: 0.6, targetY: 1.2, lajuPutar: 0.12 },

    kendali: [
      { judul: 'Bahan', isi: [
        { type: 'select', id: 'zat', value: 0, label: 'Dimasukkan ke air',
          options: ZAT.map(function (z, i) { return { value: i, label: z.n }; }) },
        { type: 'slider', id: 'jumlah', value: 1, min: 0.2, max: 2, step: 0.1,
          label: 'Banyak bahan', unit: ' sendok', dec: 1 }
      ]},
      { judul: 'Perlakuan', isi: [
        { type: 'slider', id: 'aduk', value: 0, min: 0, max: 1, step: 0.05,
          label: 'Kecepatan mengaduk', unit: '', dec: 2,
          format: function (v) { return v < 0.05 ? 'diam' : v < 0.4 ? 'pelan' : v < 0.75 ? 'sedang' : 'cepat'; } },
        { type: 'slider', id: 'suhu', value: 25, min: 5, max: 90, step: 1,
          label: 'Suhu air', unit: ' °C', dec: 0 },
        { type: 'buttons', label: '', items: [
          { label: '↺ Masukkan ulang', utama: true, klik: function (s) { taburUlang(s); } }
        ]}
      ]},
      { judul: 'Tampilan', isi: [
        { type: 'toggle', id: 'sendok', value: true, label: 'Tampilkan pengaduk' }
      ]}
    ],

    baca: [
      { id: 'hasil', label: 'Hasil', tone: 'aksen' },
      { id: 'larut', label: 'Bagian yang larut' },
      { id: 'campuran', label: 'Jenis campuran' },
      { id: 'waktu', label: 'Pengaruh mengaduk' }
    ],

    bangun: function (s) {
      s.tambah(S.lantai({ r: 6, warna: 0x0f161d }));

      const gelas = S.gelas({ r: 1.25, h: 2.3, level: 0.68, warna: 0x4a9fd8 });
      s.data.gelas = gelas;
      s.tambah(gelas);

      // butiran zat
      const p = S.partikel(N, { r: 0.055, warna: 0xf2f0ea, kotak: { x: 1.1, y: 0.7, z: 1.1 } });
      s.data.p = p;
      s.tambah(p);

      // lapisan minyak di permukaan
      const minyak = new T.Mesh(new T.CylinderGeometry(1.22, 1.22, 0.16, 48),
        S.matCairan(0xe8c54a, { opacity: 0.8, transmission: 0.3 }));
      minyak.position.y = 1.64;
      minyak.visible = false;
      s.data.minyak = minyak;
      s.tambah(minyak);

      // sendok pengaduk
      const sendok = new T.Group();
      const batang = new T.Mesh(new T.CylinderGeometry(0.045, 0.045, 2.6, 16), S.matLogam(0xc8ced4));
      batang.position.y = 1.5;
      sendok.add(batang);
      const kepala = new T.Mesh(new T.SphereGeometry(0.17, 24, 18), S.matLogam(0xc8ced4));
      kepala.scale.set(1, 0.42, 1.3);
      kepala.position.y = 0.3;
      sendok.add(kepala);
      sendok.position.set(0.45, 0, 0);
      s.data.sendok = sendok;
      s.tambah(sendok);

      const lbl = S.teks('Gula pasir', { skala: 0.46, lebar: 18, warna: '#d8e4ec' });
      lbl.position.set(0, 3.25, 0);
      s.data.lbl = lbl;
      s.tambah(lbl);

      s.data.sudut = 0;
      taburUlang(s);
    },

    ubah: function (s, id) {
      if (id === 'zat' || id === 'jumlah') taburUlang(s);
      if (id === 'sendok') s.data.sendok.visible = s.get('sendok');
    },

    langkah: function (s, dt) {
      const z = zat(s);
      const aduk = s.get('aduk');
      const suhu = s.get('suhu');
      const p = s.data.p, d = p.userData.p;

      // laju pelarutan naik oleh suhu dan pengadukan
      const laju = z.larut * (0.25 + aduk * 1.5) * (0.4 + suhu / 70) * dt * 0.9;

      s.data.sudut += dt * (1 + aduk * 7);
      if (s.get('sendok')) {
        s.data.sendok.position.set(Math.cos(s.data.sudut) * 0.5 * (0.2 + aduk), 0,
          Math.sin(s.data.sudut) * 0.5 * (0.2 + aduk));
        s.data.sendok.rotation.z = Math.sin(s.data.sudut) * 0.12 * aduk;
      }

      let tersisa = 0;
      for (let i = 0; i < d.length; i++) {
        const q = d[i];
        if (!q.aktif) continue;
        // sebagian butiran larut (mengecil lalu hilang)
        if (q.bisaLarut) {
          q.sisa -= laju;
          if (q.sisa <= 0) { q.aktif = false; continue; }
          q.r = z.butir * q.sisa;
        }
        tersisa++;

        // pusaran akibat mengaduk
        const r = Math.hypot(q.pos.x, q.pos.z);
        const a = Math.atan2(q.pos.z, q.pos.x) + dt * aduk * (2.6 - r * 0.8);
        const rr = r + (aduk > 0.25 ? dt * 0.25 * (0.75 - r) : 0);
        q.pos.x = Math.cos(a) * rr;
        q.pos.z = Math.sin(a) * rr;

        // gerak acak + gravitasi
        q.pos.y += (q.vy || 0) * dt;
        if (z.mengapung) {
          q.vy = S.lerp(q.vy || 0, 0.5, dt * 2);
          if (q.pos.y > 1.52) { q.pos.y = 1.52; q.vy = 0; }
        } else {
          q.vy = (q.vy || 0) - dt * (0.9 - aduk * 0.75);
          if (q.pos.y < 0.09) { q.pos.y = 0.09; q.vy = Math.abs(q.vy) * 0.18 + aduk * 0.5; }
        }
        if (q.pos.y > 1.5) { q.pos.y = 1.5; q.vy = -Math.abs(q.vy) * 0.4; }
        q.pos.x += Math.sin(s.waktu * 3 + i) * dt * 0.05 * (0.2 + aduk);
        const rb = Math.hypot(q.pos.x, q.pos.z);
        if (rb > 1.14) { q.pos.x *= 1.14 / rb; q.pos.z *= 1.14 / rb; }
      }
      p.userData.tulis();
      s.data.tersisa = tersisa;

      // warna larutan berubah saat zat larut
      const sudahLarut = 1 - tersisa / Math.max(1, s.data.awal);
      const dasar = new T.Color(0x4a9fd8);
      const tujuan = new T.Color(z.warnaLarutan);
      const c = dasar.clone().lerp(tujuan, z.larut * sudahLarut);
      s.data.gelas.userData.cair.material.color.copy(c);
      // sedikit keruh untuk zat yang tidak larut sempurna
      s.data.gelas.userData.cair.material.transmission =
        0.45 - 0.3 * (z.larut > 0 && z.larut < 0.7 ? sudahLarut : 0);
    },

    bacaUbah: function (s) {
      const z = zat(s);
      const sisa = s.data.tersisa || 0;
      const larut = 1 - sisa / Math.max(1, s.data.awal);
      s.baca('hasil', z.larut >= 0.9 ? 'Larut' : z.larut > 0.1 ? 'Larut sebagian' : 'Tidak larut',
        z.larut >= 0.9 ? 'aksen' : z.larut > 0.1 ? 'warn' : 'danger');
      s.baca('larut', Math.round(larut * 100) + '%');
      s.baca('campuran', z.larut >= 0.9 ? 'Larutan (homogen)'
        : z.mengapung ? 'Campuran tidak menyatu' : 'Suspensi (heterogen)');
      const aduk = s.get('aduk');
      s.baca('waktu', z.larut < 0.1 ? 'Tidak membantu'
        : aduk < 0.05 ? 'Belum diaduk — lambat'
        : aduk > 0.7 ? 'Jauh lebih cepat' : 'Mempercepat');
    }
  };

  function taburUlang(s) {
    const z = zat(s);
    const p = s.data.p, d = p.userData.p;
    const n = Math.round(d.length * S.clamp(s.get('jumlah') / 2, 0.1, 1));
    p.material.color.setHex(z.w);
    p.material.emissive.setHex(z.w);
    s.data.minyak.visible = false;
    s.data.gelas.userData.cair.material.color.setHex(0x4a9fd8);
    s.data.gelas.userData.cair.material.transmission = 0.45;
    for (let i = 0; i < d.length; i++) {
      const q = d[i];
      q.aktif = i < n;
      q.bisaLarut = z.larut > 0 && Math.random() < z.larut;
      q.sisa = 1;
      q.r = z.butir;
      q.vy = 0;
      const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 0.95;
      q.pos.set(Math.cos(a) * r, z.mengapung ? 1.45 : 1.2 + Math.random() * 0.3, Math.sin(a) * r);
    }
    p.userData.tulis();
    s.data.awal = n;
    s.data.tersisa = n;
    s.data.lbl.userData.ganti(z.n + ' + air');
  }
})());
