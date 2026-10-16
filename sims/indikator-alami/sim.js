/* Asam, Basa, dan Indikator Alami — Fase C — adegan 3D */

Sim3D.daftar('indikator-alami', (function () {
  'use strict';
  const T = THREE, S = S3;

  const LARUTAN = [
    { n: 'Air jeruk',      ph: 2.4, sifat: 'asam' },
    { n: 'Cuka',           ph: 2.9, sifat: 'asam' },
    { n: 'Air soda',       ph: 4.0, sifat: 'asam' },
    { n: 'Air hujan',      ph: 5.6, sifat: 'asam lemah' },
    { n: 'Air murni',      ph: 7.0, sifat: 'netral' },
    { n: 'Air sabun',      ph: 9.5, sifat: 'basa' },
    { n: 'Soda kue',       ph: 8.4, sifat: 'basa lemah' },
    { n: 'Air kapur',      ph: 12.4, sifat: 'basa' },
    { n: 'Pembersih lantai', ph: 11.0, sifat: 'basa' }
  ];

  /* Indikator: fungsi pH → warna */
  const INDIKATOR = [
    { id: 'kubis', n: 'Kubis ungu', warna: function (ph) {
        const skala = [[0, 0xd01030], [3, 0xe03a4a], [5, 0xd060a0], [7, 0x8a4ec0],
                       [9, 0x4a6ad0], [11, 0x3aa08a], [14, 0x8ac040]];
        return antara(skala, ph);
      }, ket: 'merah di asam → ungu di netral → hijau di basa' },
    { id: 'kunyit', n: 'Kunyit', warna: function (ph) {
        const skala = [[0, 0xf0c030], [7, 0xe8b020], [8.5, 0xd06a20], [14, 0xa02a2a]];
        return antara(skala, ph);
      }, ket: 'kuning di asam dan netral → merah bata di basa' },
    { id: 'bunga', n: 'Bunga sepatu', warna: function (ph) {
        const skala = [[0, 0xe02050], [5, 0xd84070], [7, 0xa050a0], [10, 0x5a70c0], [14, 0x3a9060]];
        return antara(skala, ph);
      }, ket: 'merah muda di asam → hijau di basa kuat' },
    { id: 'lakmus', n: 'Kertas lakmus', warna: function (ph) {
        return ph < 7 ? 0xe03a4a : ph > 7 ? 0x3a6ad0 : 0xa060b0;
      }, ket: 'merah bila asam, biru bila basa — tanpa gradasi' },
    { id: 'universal', n: 'Indikator universal', warna: function (ph) {
        const skala = [[0, 0xd01010], [2, 0xe04010], [4, 0xe8a020], [6, 0xd8d020],
                       [7, 0x40c050], [8, 0x20b0a0], [10, 0x2070d0], [12, 0x4030a0], [14, 0x6020a0]];
        return antara(skala, ph);
      }, ket: 'warna berbeda untuk hampir setiap nilai pH' }
  ];

  function antara(skala, ph) {
    ph = S.clamp(ph, 0, 14);
    for (let i = 0; i < skala.length - 1; i++) {
      const a = skala[i], b = skala[i + 1];
      if (ph >= a[0] && ph <= b[0]) {
        const t = (ph - a[0]) / Math.max(0.001, b[0] - a[0]);
        return new T.Color(a[1]).lerp(new T.Color(b[1]), t).getHex();
      }
    }
    return skala[skala.length - 1][1];
  }

  function ind(s) {
    const id = s.get('ind');
    for (let i = 0; i < INDIKATOR.length; i++) if (INDIKATOR[i].id === id) return INDIKATOR[i];
    return INDIKATOR[0];
  }

  return {
    latar: 0x090f15,
    kamera: { jarak: 11, phi: 1.14, theta: 0.42, targetY: 1.0, lajuPutar: 0.08 },

    kendali: [
      { judul: 'Indikator alami', isi: [
        { type: 'select', id: 'ind', value: 'kubis', label: 'Bahan indikator',
          options: INDIKATOR.map(function (i) { return { value: i.id, label: i.n }; }) },
        { type: 'buttons', label: '', items: [
          { label: '💧 Teteskan ke semua', utama: true, klik: function (s) {
            s.data.tetes = true; s.data.tp = 0;
          } },
          { label: '↺ Kosongkan', klik: function (s) {
            s.data.tetes = false; s.data.tp = 0;
          } }
        ]}
      ]},
      { judul: 'Satu larutan', isi: [
        { type: 'select', id: 'sorot', value: 4, label: 'Amati lebih dekat',
          options: LARUTAN.map(function (l, i) { return { value: i, label: l.n }; }) },
        { type: 'toggle', id: 'dekat', value: false, label: 'Dekatkan kamera' }
      ]},
      { judul: 'Tampilan', isi: [
        { type: 'toggle', id: 'skala', value: true, label: 'Tampilkan pita skala pH' },
        { type: 'toggle', id: 'nama', value: true, label: 'Tampilkan nama larutan' }
      ]}
    ],

    baca: [
      { id: 'larutan', label: 'Larutan diamati', tone: 'aksen' },
      { id: 'ph', label: 'pH' },
      { id: 'sifat', label: 'Sifatnya' },
      { id: 'warna', label: 'Warna indikator' }
    ],

    bangun: function (s) {
      s.tambah(S.lantai({ r: 9, warna: 0x0e151c }));

      // rak tabung
      const rak = new T.Mesh(new T.BoxGeometry(8.2, 0.22, 1.1),
        new T.MeshStandardMaterial({ color: 0x3a2d22, roughness: 0.8 }));
      rak.position.y = 0.11; rak.receiveShadow = true;
      s.tambah(rak);

      s.data.tabung = [];
      s.data.nama = [];
      LARUTAN.forEach(function (l, i) {
        const x = (i - (LARUTAN.length - 1) / 2) * 0.88;
        const tb = S.tabung({ r: 0.3, h: 1.7, level: 0.62, warna: 0xdfe8ee });
        tb.position.set(x, 0.22, 0);
        s.tambah(tb);
        s.data.tabung.push(tb);

        const n = S.teks(l.n, { skala: 0.23, lebar: 15, warna: '#8d99a4' });
        n.position.set(x, -0.1, 0.45);
        s.tambah(n);
        s.data.nama.push(n);
      });

      // pipet
      const pipet = new T.Group();
      const badan = new T.Mesh(new T.CylinderGeometry(0.075, 0.075, 0.9, 20), S.matKaca({ opacity: 0.3 }));
      pipet.add(badan);
      const karet = new T.Mesh(new T.CylinderGeometry(0.11, 0.095, 0.3, 20),
        new T.MeshStandardMaterial({ color: 0x3a4149, roughness: 0.8 }));
      karet.position.y = 0.58;
      pipet.add(karet);
      const ujung = new T.Mesh(new T.ConeGeometry(0.075, 0.26, 16), S.matKaca({ opacity: 0.3 }));
      ujung.position.y = -0.58; ujung.rotation.x = Math.PI;
      pipet.add(ujung);
      const isi = new T.Mesh(new T.CylinderGeometry(0.055, 0.055, 0.6, 16),
        new T.MeshStandardMaterial({ color: 0x8a4ec0, roughness: 0.3,
          emissive: 0x8a4ec0, emissiveIntensity: 0.25 }));
      pipet.add(isi);
      s.data.pipetIsi = isi;
      pipet.position.set(0, 2.5, 0);
      s.data.pipet = pipet;
      s.tambah(pipet);

      // tetesan
      const tetes = S.partikel(18, { r: 0.055, warna: 0x8a4ec0, kotak: { x: 0.2, y: 1, z: 0.2 } });
      tetes.visible = false;
      s.data.tetesP = tetes;
      s.tambah(tetes);

      // pita skala pH
      const pita = new T.Group();
      for (let i = 0; i <= 14; i++) {
        const m = new T.Mesh(new T.BoxGeometry(0.54, 0.32, 0.06),
          new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6,
            emissive: 0xffffff, emissiveIntensity: 0.1 }));
        m.position.set((i - 7) * 0.56, 0, 0);
        pita.add(m);
        const t = S.teks(String(i), { skala: 0.2, latar: false, warna: '#8d99a4' });
        t.position.set((i - 7) * 0.56, -0.3, 0.05);
        pita.add(t);
      }
      pita.position.set(0, 2.85, -0.5);
      s.data.pita = pita;
      s.tambah(pita);

      const penanda = new T.Mesh(new T.ConeGeometry(0.11, 0.24, 16),
        new T.MeshStandardMaterial({ color: 0xf0c04a, emissive: 0xf0c04a, emissiveIntensity: 0.4 }));
      penanda.position.set(0, 3.2, -0.5);
      s.data.penanda = penanda;
      s.tambah(penanda);

      const lbl = S.teks('', { skala: 0.4, lebar: 18, warna: '#d8e4ec' });
      lbl.position.set(0, 3.9, 0);
      s.data.lbl = lbl;
      s.tambah(lbl);

      s.data.tetes = false;
      s.data.tp = 0;
      pasang(s);
    },

    ubah: function (s, id) {
      if (id === 'ind') { s.data.tp = 0; }
      if (id === 'skala') s.data.pita.visible = s.get('skala');
      if (id === 'nama') s.data.nama.forEach(function (n) { n.visible = s.get('nama'); });
      if (id === 'sorot' || id === 'dekat') geserKamera(s);
      pasang(s);
    },

    langkah: function (s, dt) {
      const I = ind(s);
      const sorot = parseInt(s.get('sorot'), 10) || 0;

      if (s.data.tetes) s.data.tp = Math.min(1, s.data.tp + dt * 0.55);

      // pipet berpindah dari tabung ke tabung
      const n = LARUTAN.length;
      const posisi = s.data.tetes ? S.clamp(s.data.tp * n, 0, n - 0.001) : sorot;
      const idx = Math.floor(posisi);
      const x = (idx - (n - 1) / 2) * 0.88;
      s.data.pipet.position.x = S.lerp(s.data.pipet.position.x, x, dt * 7);
      s.data.pipet.position.y = S.lerp(s.data.pipet.position.y,
        s.data.tetes ? 2.35 + Math.sin(s.waktu * 8) * 0.04 : 2.7, dt * 5);
      s.data.pipetIsi.material.color.setHex(I.warna(7));
      s.data.pipetIsi.material.emissive.setHex(I.warna(7));

      s.data.tetesP.visible = s.data.tetes && s.data.tp < 0.99;
      if (s.data.tetesP.visible) {
        const d = s.data.tetesP.userData.p;
        for (let i = 0; i < d.length; i++) {
          d[i].pos.y -= dt * 3.4;
          d[i].pos.x = s.data.pipet.position.x + S.acak(-0.02, 0.02);
          if (d[i].pos.y < 1.0) d[i].pos.y = 2.2 + Math.random() * 0.3;
        }
        s.data.tetesP.userData.tulis();
      }

      // warna tiap tabung
      LARUTAN.forEach(function (l, i) {
        const kena = s.data.tetes ? (s.data.tp * n > i + 0.35) : false;
        const tujuan = kena ? I.warna(l.ph) : 0xdfe8ee;
        const m = s.data.tabung[i].userData.cair.material;
        m.color.lerp(new T.Color(tujuan), dt * 4.5);
        m.transmission = kena ? 0.2 : 0.45;
        m.opacity = kena ? 0.95 : 0.8;
        const naik = i === sorot ? 0.14 : 0;
        s.data.tabung[i].position.y = S.lerp(s.data.tabung[i].position.y, 0.22 + naik, dt * 6);
      });

      // penanda skala pH
      const l = LARUTAN[sorot];
      s.data.penanda.position.x = S.lerp(s.data.penanda.position.x, (l.ph - 7) * 0.56, dt * 6);
      s.data.penanda.rotation.z = Math.PI;
    },

    bacaUbah: function (s) {
      const I = ind(s);
      const l = LARUTAN[parseInt(s.get('sorot'), 10) || 0];
      s.baca('larutan', l.n);
      s.baca('ph', S.fmt(l.ph, 1), l.ph < 6.5 ? 'danger' : l.ph > 7.5 ? 'biru' : 'aksen');
      s.baca('sifat', l.sifat[0].toUpperCase() + l.sifat.slice(1),
        l.sifat.indexOf('asam') === 0 ? 'danger' : l.sifat.indexOf('basa') === 0 ? 'biru' : 'aksen');
      s.baca('warna', s.data.tetes ? namaWarna(I.warna(l.ph)) : 'belum ditetesi');
    }
  };

  function namaWarna(hex) {
    const c = new T.Color(hex);
    const hsl = {};
    c.getHSL(hsl);
    const h = hsl.h * 360;
    if (hsl.l > 0.85) return 'nyaris putih';
    if (hsl.s < 0.18) return 'kelabu';
    if (h < 16 || h >= 340) return 'merah';
    if (h < 42) return 'jingga';
    if (h < 68) return 'kuning';
    if (h < 160) return 'hijau';
    if (h < 200) return 'hijau kebiruan';
    if (h < 255) return 'biru';
    if (h < 300) return 'ungu';
    return 'merah muda';
  }

  function geserKamera(s) {
    const n = LARUTAN.length;
    const i = parseInt(s.get('sorot'), 10) || 0;
    const x = (i - (n - 1) / 2) * 0.88;
    if (s.get('dekat')) {
      s.orbit.set({ target: [x, 0.9, 0], jarak: 3.4, phi: 1.28 });
    } else {
      s.orbit.set({ target: [0, 1.0, 0], jarak: 11, phi: 1.14 });
    }
  }

  function pasang(s) {
    const I = ind(s);
    s.data.lbl.userData.ganti(I.n);
    s.data.pita.visible = s.get('skala');
    s.data.nama.forEach(function (n) { n.visible = s.get('nama'); });
    // pita skala memakai indikator terpilih
    let k = 0;
    s.data.pita.children.forEach(function (c) {
      if (c.isMesh) { c.material.color.setHex(I.warna(k)); c.material.emissive.setHex(I.warna(k)); k++; }
    });
  }
})());
