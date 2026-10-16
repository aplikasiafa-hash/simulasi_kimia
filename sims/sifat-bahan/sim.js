/* Memilih Bahan yang Tepat — Fase B — adegan 3D */

Sim3D.daftar('sifat-bahan', (function () {
  'use strict';
  const T = THREE, S = S3;

  /* Bahan dinilai pada empat sifat, 0..1 */
  const BAHAN = [
    { n: 'Kain katun', w: 0xe8dcc0, tahanAir: 0.1, tahanPanas: 0.3, kuat: 0.3, lentur: 0.9 },
    { n: 'Plastik',    w: 0x3fa0d8, tahanAir: 1.0, tahanPanas: 0.25, kuat: 0.5, lentur: 0.6 },
    { n: 'Logam',      w: 0xb8c0c8, tahanAir: 0.9, tahanPanas: 1.0, kuat: 1.0, lentur: 0.1, logam: true },
    { n: 'Kaca',       w: 0xbfe4f0, tahanAir: 1.0, tahanPanas: 0.75, kuat: 0.35, lentur: 0.0, bening: true },
    { n: 'Kayu',       w: 0xa9763f, tahanAir: 0.3, tahanPanas: 0.4, kuat: 0.7, lentur: 0.2 },
    { n: 'Karet',      w: 0x343b42, tahanAir: 1.0, tahanPanas: 0.5, kuat: 0.5, lentur: 1.0 },
    { n: 'Kertas',     w: 0xf0ecdf, tahanAir: 0.0, tahanPanas: 0.1, kuat: 0.1, lentur: 0.7 }
  ];

  /* Benda yang mau dibuat, dengan sifat yang dibutuhkan */
  const BENDA = [
    { n: 'Payung',       butuh: { tahanAir: 0.8, lentur: 0.5 }, baik: [1, 6] },
    { n: 'Panci masak',  butuh: { tahanPanas: 0.85, kuat: 0.6 }, baik: [2] },
    { n: 'Jendela',      butuh: { tahanAir: 0.8, bening: 1 }, baik: [3] },
    { n: 'Ban sepeda',   butuh: { lentur: 0.85, tahanAir: 0.7 }, baik: [5] },
    { n: 'Kursi',        butuh: { kuat: 0.6 }, baik: [2, 4] },
    { n: 'Buku catatan', butuh: { lentur: 0.5 }, baik: [6] }
  ];

  function bahan(s) { return BAHAN[parseInt(s.get('bahan'), 10) || 0]; }
  function benda(s) { return BENDA[parseInt(s.get('benda'), 10) || 0]; }

  function matDari(b) {
    if (b.bening) return new T.MeshPhysicalMaterial({
      color: b.w, roughness: 0.05, metalness: 0, transparent: true,
      opacity: 0.28, clearcoat: 1, envMapIntensity: 1
    });
    if (b.logam) return S.matLogam(b.w, { roughness: 0.3 });
    return new T.MeshPhysicalMaterial({
      color: b.w, roughness: 0.55 - b.lentur * 0.2, metalness: 0.03,
      clearcoat: b.tahanAir * 0.6, envMapIntensity: 0.8
    });
  }

  /* ------------------------------------------------------- bentuk benda - */

  function bangunBenda(nama, mat) {
    const g = new T.Group();
    if (nama === 'Payung') {
      const kubah = new T.Mesh(new T.SphereGeometry(1.25, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2.2), mat);
      kubah.position.y = 1.0; kubah.castShadow = true;
      g.add(kubah);
      const gagang = new T.Mesh(new T.CylinderGeometry(0.045, 0.045, 1.9, 16), S.matLogam(0x8a949e));
      gagang.position.y = 0.5;
      g.add(gagang);
      const kait = new T.Mesh(new T.TorusGeometry(0.16, 0.042, 12, 24, Math.PI), S.matLogam(0x8a949e));
      kait.position.set(0.16, -0.42, 0); kait.rotation.z = Math.PI / 2;
      g.add(kait);
    } else if (nama === 'Panci masak') {
      const badan = new T.Mesh(new T.CylinderGeometry(0.95, 0.82, 0.95, 44, 1, true), mat);
      badan.position.y = 0.48; badan.castShadow = true;
      g.add(badan);
      const dasar = new T.Mesh(new T.CylinderGeometry(0.82, 0.82, 0.07, 44), mat);
      dasar.position.y = 0.035;
      g.add(dasar);
      [-1, 1].forEach(function (d) {
        const peg = new T.Mesh(new T.TorusGeometry(0.2, 0.05, 12, 24, Math.PI), mat);
        peg.position.set(d * 1.02, 0.78, 0);
        peg.rotation.set(Math.PI / 2, 0, d > 0 ? 0 : Math.PI);
        g.add(peg);
      });
    } else if (nama === 'Jendela') {
      const kaca = new T.Mesh(new T.BoxGeometry(1.7, 1.7, 0.06), mat);
      kaca.position.y = 1.1;
      g.add(kaca);
      const bingkai = new T.Group();
      const mb = S.matLogam(0x8a7050, { metalness: 0.2, roughness: 0.6 });
      [[0, 1.95, 1.9, 0.12], [0, 0.25, 1.9, 0.12]].forEach(function (b) {
        const m = new T.Mesh(new T.BoxGeometry(b[2], b[3], 0.14), mb);
        m.position.set(b[0], b[1], 0); bingkai.add(m);
      });
      [[-0.89, 1.1], [0.89, 1.1]].forEach(function (b) {
        const m = new T.Mesh(new T.BoxGeometry(0.12, 1.82, 0.14), mb);
        m.position.set(b[0], b[1], 0); bingkai.add(m);
      });
      const silang = new T.Mesh(new T.BoxGeometry(1.8, 0.07, 0.1), mb);
      silang.position.y = 1.1; bingkai.add(silang);
      g.add(bingkai);
    } else if (nama === 'Ban sepeda') {
      const ban = new T.Mesh(new T.TorusGeometry(1.05, 0.26, 20, 56), mat);
      ban.position.y = 1.15; ban.castShadow = true;
      g.add(ban);
      const pelek = new T.Mesh(new T.TorusGeometry(0.82, 0.07, 14, 48), S.matLogam(0xc8ced4));
      pelek.position.y = 1.15;
      g.add(pelek);
      for (let i = 0; i < 12; i++) {
        const a = i / 12 * Math.PI * 2;
        const j = new T.Mesh(new T.CylinderGeometry(0.016, 0.016, 1.6, 8), S.matLogam(0xd0d6dc));
        j.position.set(Math.cos(a) * 0.41, 1.15 + Math.sin(a) * 0.41, 0);
        j.rotation.z = -a + Math.PI / 2;
        g.add(j);
      }
    } else if (nama === 'Kursi') {
      const dudukan = new T.Mesh(new T.BoxGeometry(1.3, 0.14, 1.2), mat);
      dudukan.position.y = 0.92; dudukan.castShadow = true;
      g.add(dudukan);
      const sandaran = new T.Mesh(new T.BoxGeometry(1.3, 1.0, 0.12), mat);
      sandaran.position.set(0, 1.5, -0.52); sandaran.castShadow = true;
      g.add(sandaran);
      [[-0.55, -0.48], [0.55, -0.48], [-0.55, 0.48], [0.55, 0.48]].forEach(function (k) {
        const kaki = new T.Mesh(new T.BoxGeometry(0.12, 0.92, 0.12), mat);
        kaki.position.set(k[0], 0.46, k[1]); kaki.castShadow = true;
        g.add(kaki);
      });
    } else {
      // buku
      const sampul = new T.Mesh(new T.BoxGeometry(1.3, 0.1, 1.7), mat);
      sampul.position.y = 0.9; sampul.castShadow = true;
      g.add(sampul);
      for (let i = 0; i < 8; i++) {
        const l = new T.Mesh(new T.BoxGeometry(1.24, 0.03, 1.62),
          new T.MeshStandardMaterial({ color: 0xf4f2ea, roughness: 0.9 }));
        l.position.y = 0.96 + i * 0.035;
        g.add(l);
      }
      const atas = new T.Mesh(new T.BoxGeometry(1.3, 0.1, 1.7), mat);
      atas.position.y = 1.3;
      g.add(atas);
      const punggung = new T.Mesh(new T.BoxGeometry(0.1, 0.5, 1.7), mat);
      punggung.position.set(-0.6, 1.1, 0);
      g.add(punggung);
    }
    return g;
  }

  function nilaiCocok(bd, bh) {
    let total = 0, n = 0;
    for (const k in bd.butuh) {
      const perlu = bd.butuh[k];
      const punya = k === 'bening' ? (bh.bening ? 1 : 0) : bh[k];
      total += S.clamp(punya / Math.max(0.01, perlu), 0, 1);
      n++;
    }
    return n ? total / n : 0;
  }

  return {
    latar: 0x0a1016,
    kamera: { jarak: 8.2, phi: 1.1, theta: 0.6, targetY: 1.1, lajuPutar: 0.16 },

    kendali: [
      { judul: 'Yang ingin dibuat', isi: [
        { type: 'select', id: 'benda', value: 0, label: 'Benda',
          options: BENDA.map(function (b, i) { return { value: i, label: b.n }; }) }
      ]},
      { judul: 'Bahannya', isi: [
        { type: 'select', id: 'bahan', value: 1, label: 'Dibuat dari',
          options: BAHAN.map(function (b, i) { return { value: i, label: b.n }; }) }
      ]},
      { judul: 'Uji coba', isi: [
        { type: 'segment', id: 'uji', value: 'tidak', label: 'Beri perlakuan', options: [
          { value: 'tidak', label: 'Tidak' },
          { value: 'hujan', label: 'Disiram' },
          { value: 'panas', label: 'Dipanaskan' },
          { value: 'tekan', label: 'Ditekan' }
        ]}
      ]},
      { judul: 'Tampilan', isi: [
        { type: 'toggle', id: 'nilai', value: true, label: 'Tampilkan bilah sifat' }
      ]}
    ],

    baca: [
      { id: 'cocok', label: 'Kecocokan', tone: 'aksen' },
      { id: 'butuh', label: 'Sifat yang dibutuhkan' },
      { id: 'hasil', label: 'Hasil uji' }
    ],

    bangun: function (s) {
      s.tambah(S.lantai({ r: 7, warna: 0x101821 }));
      const alas = new T.Mesh(new T.CylinderGeometry(2.1, 2.1, 0.14, 48),
        new T.MeshStandardMaterial({ color: 0x1d2730, roughness: 0.75 }));
      alas.position.y = 0.07; alas.receiveShadow = true;
      s.tambah(alas);

      s.data.wadah = new T.Group();
      s.data.wadah.position.y = 0.14;
      s.tambah(s.data.wadah);

      // hujan
      const hujan = S.partikel(120, { r: 0.035, warna: 0x7fc7e8, kotak: { x: 1.4, y: 2, z: 1.4 } });
      hujan.position.y = 2.6;
      hujan.visible = false;
      s.data.hujan = hujan;
      s.tambah(hujan);

      // nyala pemanas
      const api = S.nyala();
      api.position.y = 0.15;
      api.visible = false;
      s.data.api = api;
      s.tambah(api);

      // penekan
      const tekan = new T.Mesh(new T.BoxGeometry(1.9, 0.26, 1.9), S.matLogam(0x7c868e));
      tekan.position.y = 3.2;
      tekan.visible = false;
      tekan.castShadow = true;
      s.data.tekan = tekan;
      s.tambah(tekan);

      // bilah sifat melayang
      const bilah = new T.Group();
      s.data.bilah = bilah;
      s.data.batang = [];
      const sifat = ['tahanAir', 'tahanPanas', 'kuat', 'lentur'];
      const nama = ['Tahan air', 'Tahan panas', 'Kuat', 'Lentur'];
      sifat.forEach(function (k, i) {
        const dasar = new T.Mesh(new T.BoxGeometry(0.16, 1.2, 0.16),
          new T.MeshStandardMaterial({ color: 0x27323b, roughness: 0.9 }));
        dasar.position.set(2.5, 0.6 + 0, i * -0.0);
        const kel = new T.Group();
        kel.position.set(2.6, 0.2, (i - 1.5) * 0.46);
        const isi = new T.Mesh(new T.BoxGeometry(0.17, 1, 0.17),
          new T.MeshStandardMaterial({
            color: 0x4fd1c0, roughness: 0.4, emissive: 0x4fd1c0, emissiveIntensity: 0.25
          }));
        kel.add(dasarKecil(), isi);
        isi.name = 'isi';
        bilah.add(kel);
        s.data.batang.push(isi);
        const t = S.teks(nama[i], { skala: 0.26, warna: '#9aa8b4' });
        t.position.set(2.6, 0.08, (i - 1.5) * 0.46);
        bilah.add(t);
      });
      s.tambah(bilah);

      const lbl = S.teks('', { skala: 0.44, lebar: 26, warna: '#d8e4ec' });
      lbl.position.set(0, 3.6, 0);
      s.data.lbl = lbl;
      s.tambah(lbl);

      s.data.turun = 0;
      pasang(s);
    },

    ubah: function (s, id) {
      if (id === 'bahan' || id === 'benda') pasang(s);
      if (id === 'uji') pasangUji(s);
      if (id === 'nilai') s.data.bilah.visible = s.get('nilai');
    },

    langkah: function (s, dt) {
      const bh = bahan(s);
      const uji = s.get('uji');
      const o = s.data.wadah;
      o.rotation.y += dt * 0.35;

      if (uji === 'hujan') {
        const d = s.data.hujan.userData.p;
        for (let i = 0; i < d.length; i++) {
          d[i].pos.y -= dt * 3.2;
          if (d[i].pos.y < -2) d[i].pos.set(S.acak(-1.3, 1.3), 2, S.acak(-1.3, 1.3));
        }
        s.data.hujan.userData.tulis();
        // bahan yang tidak tahan air jadi melendut dan gelap
        const rusak = 1 - bh.tahanAir;
        o.scale.y = 1 - rusak * 0.18 * (0.6 + 0.4 * Math.sin(s.waktu * 2));
        o.position.y = 0.14 - rusak * 0.06;
      } else if (uji === 'panas') {
        s.data.api.userData.perbarui(s.waktu, 1);
        const rusak = 1 - bh.tahanPanas;
        o.scale.y = 1 - rusak * 0.3 * S.clamp(s.waktu * 0.2, 0, 1);
        o.position.y = 0.14;
        // warna memerah pada bahan yang tidak tahan panas
        o.traverse(function (m) {
          if (m.material && m.material.emissive) {
            m.material.emissive.setHex(0x000000);
            m.material.emissiveIntensity = 0;
          }
        });
        if (rusak > 0.4) {
          o.traverse(function (m) {
            if (m.material && m.material.emissive) {
              m.material.emissive.setHex(0x8a2a10);
              m.material.emissiveIntensity = rusak * 0.5 * (0.6 + 0.4 * Math.sin(s.waktu * 3));
            }
          });
        }
      } else if (uji === 'tekan') {
        s.data.turun = S.lerp(s.data.turun, 1, dt * 1.5);
        const t = s.data.turun;
        const lendut = (1 - bh.kuat) * 0.42 * t;
        s.data.tekan.position.y = 2.6 - t * (0.65 + lendut);
        o.scale.y = 1 - lendut;
        o.position.y = 0.14;
      } else {
        o.scale.y = S.lerp(o.scale.y, 1, dt * 4);
        o.position.y = 0.14;
        s.data.turun = 0;
      }

      // bilah sifat
      const nilai = [bh.tahanAir, bh.tahanPanas, bh.kuat, bh.lentur];
      s.data.batang.forEach(function (b, i) {
        const v = Math.max(0.03, nilai[i]);
        b.scale.y = S.lerp(b.scale.y, v, dt * 6);
        b.position.y = b.scale.y / 2;
        b.material.color.setHex(v > 0.66 ? 0x6fcf7f : v > 0.33 ? 0xf0c04a : 0xef6a52);
        b.material.emissive.copy(b.material.color);
      });
    },

    bacaUbah: function (s) {
      const bd = benda(s), bh = bahan(s);
      const c = nilaiCocok(bd, bh);
      s.baca('cocok', Math.round(c * 100) + '%',
        c > 0.8 ? 'aksen' : c > 0.5 ? 'warn' : 'danger');
      s.baca('butuh', Object.keys(bd.butuh).map(function (k) {
        return { tahanAir: 'tahan air', tahanPanas: 'tahan panas', kuat: 'kuat',
          lentur: 'lentur', bening: 'bening' }[k];
      }).join(', '));
      const uji = s.get('uji');
      s.baca('hasil',
        uji === 'hujan' ? (bh.tahanAir > 0.7 ? 'Tetap kering' : bh.tahanAir > 0.25 ? 'Basah sedikit' : 'Rusak basah')
        : uji === 'panas' ? (bh.tahanPanas > 0.7 ? 'Aman' : bh.tahanPanas > 0.35 ? 'Mulai melunak' : 'Terbakar/meleleh')
        : uji === 'tekan' ? (bh.kuat > 0.65 ? 'Kokoh' : bh.kuat > 0.35 ? 'Melendut' : 'Penyok')
        : 'Belum diuji',
        uji === 'tidak' ? null
        : (uji === 'hujan' ? bh.tahanAir : uji === 'panas' ? bh.tahanPanas : bh.kuat) > 0.65 ? 'aksen' : 'danger');
    }
  };

  function dasarKecil() {
    return new T.Mesh(new T.BoxGeometry(0.19, 1.02, 0.19),
      new T.MeshStandardMaterial({ color: 0x1e2830, roughness: 0.95, transparent: true, opacity: 0.6 }));
  }

  function pasang(s) {
    const bd = benda(s), bh = bahan(s);
    const w = s.data.wadah;
    while (w.children.length) { const c = w.children.pop(); S.buangObjek(c); }
    w.add(bangunBenda(bd.n, matDari(bh)));
    w.scale.y = 1;
    const c = nilaiCocok(bd, bh);
    s.data.lbl.userData.ganti(bd.n + ' dari ' + bh.n.toLowerCase(),
      c > 0.8 ? '#9fe8ad' : c > 0.5 ? '#f0d58a' : '#f6a898');
    s.data.bilah.visible = s.get('nilai');
    pasangUji(s);
  }

  function pasangUji(s) {
    const uji = s.get('uji');
    s.data.hujan.visible = uji === 'hujan';
    s.data.api.visible = uji === 'panas';
    s.data.tekan.visible = uji === 'tekan';
    s.data.turun = 0;
    if (uji !== 'panas') s.data.api.userData.perbarui(0, 0);
    s.data.tekan.position.y = 2.6;
  }
})());
