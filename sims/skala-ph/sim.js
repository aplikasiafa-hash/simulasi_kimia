/* Skala pH dan Kekuatan Asam-Basa — Fase D — adegan 3D */

Sim3D.daftar('skala-ph', (function () {
  'use strict';
  const T = THREE, S = S3;

  const BAHAN = [
    { n: 'Asam lambung', ph: 1.5 }, { n: 'Air jeruk', ph: 2.4 },
    { n: 'Cuka', ph: 2.9 }, { n: 'Air soda', ph: 4.0 },
    { n: 'Kopi hitam', ph: 5.0 }, { n: 'Air hujan', ph: 5.6 },
    { n: 'Air murni', ph: 7.0 }, { n: 'Air laut', ph: 8.1 },
    { n: 'Soda kue', ph: 8.4 }, { n: 'Air sabun', ph: 9.5 },
    { n: 'Pembersih lantai', ph: 11.0 }, { n: 'Air kapur', ph: 12.4 }
  ];

  function warnaPh(ph) {
    const skala = [[0, 0xd01010], [2, 0xe04010], [4, 0xe8a020], [6, 0xd8d020],
                   [7, 0x40c050], [8, 0x20b0a0], [10, 0x2070d0], [12, 0x4030a0], [14, 0x6020a0]];
    ph = S.clamp(ph, 0, 14);
    for (let i = 0; i < skala.length - 1; i++) {
      const a = skala[i], b = skala[i + 1];
      if (ph >= a[0] && ph <= b[0]) {
        return new T.Color(a[1]).lerp(new T.Color(b[1]), (ph - a[0]) / (b[0] - a[0])).getHex();
      }
    }
    return 0x6020a0;
  }

  const NH = 90;   // partikel H+ dan OH- maksimum

  return {
    latar: 0x080e14,
    kamera: { jarak: 9.4, phi: 1.1, theta: 0.5, targetY: 1.5, lajuPutar: 0.1 },

    kendali: [
      { judul: 'Larutan', isi: [
        { type: 'slider', id: 'ph', value: 7, min: 0, max: 14, step: 0.1,
          label: 'Nilai pH', unit: '', dec: 1 },
        { type: 'select', id: 'contoh', value: 6, label: 'Pilih contoh sehari-hari',
          options: BAHAN.map(function (b, i) { return { value: i, label: b.n + '  (pH ' + b.ph + ')' }; }) }
      ]},
      { judul: 'Ubah larutan', isi: [
        { type: 'buttons', label: '', items: [
          { label: '🍋 + Asam', klik: function (s) { s.set('ph', S.clamp(s.get('ph') - 1.5, 0, 14)); } },
          { label: '🧼 + Basa', klik: function (s) { s.set('ph', S.clamp(s.get('ph') + 1.5, 0, 14)); } }
        ]},
        { type: 'buttons', label: '', items: [
          { label: '💧 Encerkan 10×', klik: function (s) {
            const p = s.get('ph');
            s.set('ph', S.clamp(p < 7 ? Math.min(6.9, p + 1) : p > 7 ? Math.max(7.1, p - 1) : 7, 0, 14));
          } }
        ]}
      ]},
      { judul: 'Tampilan', isi: [
        { type: 'toggle', id: 'ion', value: true, label: 'Tampilkan ion H⁺ dan OH⁻' },
        { type: 'toggle', id: 'pita', value: true, label: 'Tampilkan pita skala pH' },
        { type: 'toggle', id: 'log', value: true, label: 'Tampilkan menara kepekatan (log)' }
      ]}
    ],

    baca: [
      { id: 'ph', label: 'pH', tone: 'aksen' },
      { id: 'sifat', label: 'Sifat' },
      { id: 'h', label: '[H⁺]' },
      { id: 'oh', label: '[OH⁻]' },
      { id: 'banding', label: 'Dibanding air murni' }
    ],

    bangun: function (s) {
      s.tambah(S.lantai({ r: 8, warna: 0x0e151d }));

      const gelas = S.gelas({ r: 1.3, h: 2.4, level: 0.66 });
      s.data.gelas = gelas;
      s.tambah(gelas);

      // ion H+ (merah) dan OH- (biru)
      const h = S.partikel(NH, { r: 0.07, warna: 0xef4e4e, kotak: { x: 1, y: 0.7, z: 1 } });
      const oh = S.partikel(NH, { r: 0.085, warna: 0x4f7ce0, kotak: { x: 1, y: 0.7, z: 1 } });
      [h, oh].forEach(function (p) {
        p.userData.p.forEach(function (q) {
          const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 1.1;
          q.pos.set(Math.cos(a) * r, 0.18 + Math.random() * 1.3, Math.sin(a) * r);
          q.vel.set(S.acak(-1, 1), S.acak(-1, 1), S.acak(-1, 1)).normalize().multiplyScalar(S.acak(0.3, 0.8));
        });
        p.userData.tulis();
        s.tambah(p);
      });
      s.data.h = h; s.data.oh = oh;

      // pita skala pH melengkung
      const pita = new T.Group();
      s.data.kotakPita = [];
      for (let i = 0; i <= 14; i++) {
        const m = new T.Mesh(new T.BoxGeometry(0.46, 0.4, 0.1),
          new T.MeshStandardMaterial({ color: warnaPh(i), roughness: 0.55,
            emissive: warnaPh(i), emissiveIntensity: 0.14 }));
        m.position.set((i - 7) * 0.48, 0, 0);
        pita.add(m);
        s.data.kotakPita.push(m);
        const t = S.teks(String(i), { skala: 0.19, latar: false, warna: '#8d99a4' });
        t.position.set((i - 7) * 0.48, -0.36, 0.06);
        pita.add(t);
      }
      ['ASAM', 'NETRAL', 'BASA'].forEach(function (n, i) {
        const t = S.teks(n, { skala: 0.2, lebar: 7,
          warna: i === 0 ? '#f6a898' : i === 1 ? '#9fe8ad' : '#9fc0f8' });
        t.position.set([-1.7, 0, 1.7][i], 0.46, 0.06);
        pita.add(t);
      });
      pita.position.set(0, 3.5, -0.3);
      s.data.pita = pita;
      s.tambah(pita);

      const penanda = new T.Mesh(new T.ConeGeometry(0.1, 0.26, 16),
        new T.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.5 }));
      penanda.rotation.z = Math.PI;
      s.data.penanda = penanda;
      s.tambah(penanda);

      // menara kepekatan logaritmik: tiap tingkat = 10×
      const menara = new T.Group();
      s.data.tingkatH = []; s.data.tingkatOH = [];
      for (let i = 0; i < 14; i++) {
        const mh = new T.Mesh(new T.BoxGeometry(0.36, 0.17, 0.36),
          new T.MeshStandardMaterial({ color: 0xef4e4e, roughness: 0.4,
            emissive: 0xef4e4e, emissiveIntensity: 0.25 }));
        mh.position.set(-0.4, 0.1 + i * 0.2, 0);
        menara.add(mh); s.data.tingkatH.push(mh);
        const mo = new T.Mesh(new T.BoxGeometry(0.36, 0.17, 0.36),
          new T.MeshStandardMaterial({ color: 0x4f7ce0, roughness: 0.4,
            emissive: 0x4f7ce0, emissiveIntensity: 0.25 }));
        mo.position.set(0.4, 0.1 + i * 0.2, 0);
        menara.add(mo); s.data.tingkatOH.push(mo);
      }
      menara.add(objekLabel('H⁺', -0.4, -0.3, '#f6a898'));
      menara.add(objekLabel('OH⁻', 0.4, -0.3, '#9fc0f8'));
      menara.position.set(3.1, 0.3, 0);
      s.data.menara = menara;
      s.tambah(menara);

      const lbl = S.teks('', { skala: 0.44, lebar: 18, warna: '#d8e4ec' });
      lbl.position.set(0, 4.5, 0);
      s.data.lbl = lbl;
      s.tambah(lbl);

      pasang(s);
    },

    ubah: function (s, id) {
      if (id === 'contoh') {
        const b = BAHAN[parseInt(s.get('contoh'), 10) || 0];
        s.setDiam('ph', b.ph);
      }
      if (id === 'ion') { s.data.h.visible = s.get('ion'); s.data.oh.visible = s.get('ion'); }
      if (id === 'pita') { s.data.pita.visible = s.get('pita'); s.data.penanda.visible = s.get('pita'); }
      if (id === 'log') s.data.menara.visible = s.get('log');
      pasang(s);
    },

    langkah: function (s, dt) {
      const ph = s.get('ph');
      // jumlah ion: skala logaritmik dipadatkan agar terlihat
      const nH = Math.round(NH * Math.pow(10, -(ph - 7) / 7) / (1 + Math.pow(10, -(ph - 7) / 7)) * 2);
      const nOH = Math.round(NH * Math.pow(10, (ph - 7) / 7) / (1 + Math.pow(10, (ph - 7) / 7)) * 2);

      atur(s.data.h, Math.min(NH, nH), dt, s);
      atur(s.data.oh, Math.min(NH, nOH), dt, s);

      // warna larutan
      s.data.gelas.userData.cair.material.color.lerp(new T.Color(warnaPh(ph)), dt * 5);

      // penanda pita
      s.data.penanda.position.set((ph - 7) * 0.48, 3.5 + 0.44, -0.3);

      // menara kepekatan: tinggi menyatakan 10^x
      const tH = S.clamp(14 - ph, 0, 14);
      const tOH = S.clamp(ph, 0, 14);
      s.data.tingkatH.forEach(function (m, i) {
        m.visible = i < tH;
        m.scale.setScalar(i < tH ? 1 : 0.001);
      });
      s.data.tingkatOH.forEach(function (m, i) {
        m.visible = i < tOH;
        m.scale.setScalar(i < tOH ? 1 : 0.001);
      });
    },

    bacaUbah: function (s) {
      const ph = s.get('ph');
      s.baca('ph', S.fmt(ph, 1), ph < 6.5 ? 'danger' : ph > 7.5 ? 'biru' : 'aksen');
      s.baca('sifat', ph < 3 ? 'Asam kuat' : ph < 6.5 ? 'Asam' : ph <= 7.5 ? 'Netral'
        : ph < 11 ? 'Basa' : 'Basa kuat',
        ph < 6.5 ? 'danger' : ph > 7.5 ? 'biru' : 'aksen');
      s.baca('h', '10' + S.sup(String(-Math.round(ph * 10) / 10)) + ' M');
      s.baca('oh', '10' + S.sup(String(-Math.round((14 - ph) * 10) / 10)) + ' M');
      const kali = Math.pow(10, Math.abs(7 - ph));
      s.baca('banding', Math.abs(ph - 7) < 0.05 ? 'sama'
        : (kali >= 1e6 ? kali.toExponential(0).replace('e+', '×10') : Math.round(kali)) + '× lebih banyak ' +
          (ph < 7 ? 'H⁺' : 'OH⁻'));
    }
  };

  function objekLabel(teks, x, y, warna) {
    const t = S.teks(teks, { skala: 0.22, latar: false, warna: warna });
    t.position.set(x, y, 0);
    return t;
  }

  function atur(p, n, dt, s) {
    const d = p.userData.p;
    for (let i = 0; i < d.length; i++) {
      const q = d[i];
      q.aktif = i < n;
      if (!q.aktif) continue;
      q.pos.addScaledVector(q.vel, dt * 0.55);
      const r = Math.hypot(q.pos.x, q.pos.z);
      if (r > 1.2) { q.pos.x *= 1.2 / r; q.pos.z *= 1.2 / r; q.vel.x *= -0.8; q.vel.z *= -0.8; }
      if (q.pos.y > 1.52) { q.pos.y = 1.52; q.vel.y = -Math.abs(q.vel.y); }
      if (q.pos.y < 0.1) { q.pos.y = 0.1; q.vel.y = Math.abs(q.vel.y); }
    }
    p.userData.tulis();
  }

  function pasang(s) {
    const ph = s.get('ph');
    s.data.h.visible = s.get('ion');
    s.data.oh.visible = s.get('ion');
    s.data.pita.visible = s.get('pita');
    s.data.penanda.visible = s.get('pita');
    s.data.menara.visible = s.get('log');
    // nama contoh terdekat
    let dekat = BAHAN[0], jarak = 99;
    BAHAN.forEach(function (b) {
      const dd = Math.abs(b.ph - ph);
      if (dd < jarak) { jarak = dd; dekat = b; }
    });
    s.data.lbl.userData.ganti('pH ' + S.fmt(ph, 1) + (jarak < 0.35 ? ' — ' + dekat.n : ''),
      ph < 6.5 ? '#f6a898' : ph > 7.5 ? '#9fc0f8' : '#9fe8ad');
  }
})());
