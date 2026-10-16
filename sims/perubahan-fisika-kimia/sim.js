/* Perubahan Fisika atau Kimia? — Fase C — adegan 3D */

Sim3D.daftar('perubahan-fisika-kimia', (function () {
  'use strict';
  const T = THREE, S = S3;

  const PERISTIWA = [
    { n: 'Es mencair', jenis: 'fisika', adegan: 'es',
      tanda: [], balik: true, ket: 'Wujud berubah, zatnya tetap air' },
    { n: 'Air mendidih', jenis: 'fisika', adegan: 'didih',
      tanda: ['gas'], balik: true, ket: 'Air menjadi uap air — tetap H₂O' },
    { n: 'Kertas disobek', jenis: 'fisika', adegan: 'sobek',
      tanda: [], balik: false, ket: 'Bentuk berubah, bahannya tetap kertas' },
    { n: 'Gula dilarutkan', jenis: 'fisika', adegan: 'larut',
      tanda: [], balik: true, ket: 'Gula masih gula, bisa didapat lagi' },
    { n: 'Kertas dibakar', jenis: 'kimia', adegan: 'bakar',
      tanda: ['gas', 'panas', 'warna'], balik: false, ket: 'Jadi abu, asap, dan gas baru' },
    { n: 'Besi berkarat', jenis: 'kimia', adegan: 'karat',
      tanda: ['warna'], balik: false, ket: 'Besi + oksigen → karat besi' },
    { n: 'Soda kue + cuka', jenis: 'kimia', adegan: 'buih',
      tanda: ['gas'], balik: false, ket: 'Muncul gas karbon dioksida' },
    { n: 'Susu basi', jenis: 'kimia', adegan: 'basi',
      tanda: ['bau', 'endap'], balik: false, ket: 'Terbentuk zat baru oleh bakteri' },
    { n: 'Lilin menyala', jenis: 'kimia', adegan: 'lilin',
      tanda: ['gas', 'panas', 'warna'], balik: false, ket: 'Lilin terbakar jadi gas dan air' }
  ];

  const TANDA = {
    gas: 'Muncul gas', panas: 'Keluar panas/cahaya',
    warna: 'Warna berubah tetap', endap: 'Muncul endapan', bau: 'Bau berubah'
  };

  function peristiwa(s) { return PERISTIWA[parseInt(s.get('p'), 10) || 0]; }

  return {
    latar: 0x0a1016,
    kamera: { jarak: 8.4, phi: 1.1, theta: 0.55, targetY: 1.3, lajuPutar: 0.12 },

    kendali: [
      { judul: 'Peristiwa', isi: [
        { type: 'select', id: 'p', value: 0, label: 'Yang diamati',
          options: PERISTIWA.map(function (p, i) { return { value: i, label: p.n }; }) },
        { type: 'buttons', label: '', items: [
          { label: '▶ Jalankan', utama: true, klik: function (s) { s.data.jalan = true; } },
          { label: '↺ Kembalikan', klik: function (s) { s.data.t = 0; s.data.jalan = false; pasang(s); } }
        ]},
        { type: 'slider', id: 'laju', value: 1, min: 0.2, max: 3, step: 0.1,
          label: 'Kecepatan', unit: '×', dec: 1 }
      ]},
      { judul: 'Tebakan kamu', isi: [
        { type: 'segment', id: 'tebak', value: 'belum', label: 'Ini perubahan apa?', options: [
          { value: 'belum', label: 'Belum' },
          { value: 'fisika', label: 'Fisika' },
          { value: 'kimia', label: 'Kimia' }
        ]}
      ]},
      { judul: 'Tampilan', isi: [
        { type: 'toggle', id: 'tandaT', value: true, label: 'Tampilkan tanda perubahan' }
      ]}
    ],

    baca: [
      { id: 'jenis', label: 'Jenis perubahan', tone: 'aksen' },
      { id: 'tebak', label: 'Tebakanmu' },
      { id: 'zat', label: 'Zat baru?' },
      { id: 'balik', label: 'Bisa dikembalikan?' }
    ],

    bangun: function (s) {
      s.tambah(S.lantai({ r: 7, warna: 0x101821 }));
      const alas = new T.Mesh(new T.CylinderGeometry(2.2, 2.2, 0.14, 48),
        new T.MeshStandardMaterial({ color: 0x1b242c, roughness: 0.8 }));
      alas.position.y = 0.07; alas.receiveShadow = true;
      s.tambah(alas);

      s.data.panggung = new T.Group();
      s.data.panggung.position.y = 0.14;
      s.tambah(s.data.panggung);

      // asap / gas
      const gas = S.partikel(70, { r: 0.08, warna: 0x9aa4ae, kotak: { x: 1, y: 1.6, z: 1 } });
      gas.material.transparent = true; gas.material.opacity = 0.5;
      gas.position.y = 2.6;
      gas.visible = false;
      s.data.gas = gas;
      s.tambah(gas);

      // nyala
      const api = S.nyala();
      api.visible = false;
      s.data.api = api;
      s.tambah(api);

      // papan tanda
      const papan = new T.Group();
      s.data.papan = papan;
      s.data.tandaSprite = [];
      Object.keys(TANDA).forEach(function (k, i) {
        const t = S.teks('○  ' + TANDA[k], { skala: 0.3, lebar: 20, warna: '#5d6872' });
        t.position.set(2.9, 2.5 - i * 0.38, 0);
        papan.add(t);
        s.data.tandaSprite.push({ k: k, sp: t });
      });
      s.tambah(papan);

      const lbl = S.teks('', { skala: 0.46, lebar: 24, warna: '#d8e4ec' });
      lbl.position.set(0, 3.9, 0);
      s.data.lbl = lbl;
      s.tambah(lbl);

      s.data.t = 0;
      pasang(s);
    },

    ubah: function (s, id) {
      if (id === 'p') { s.setDiam('tebak', 'belum'); pasang(s); }
      if (id === 'tandaT') s.data.papan.visible = s.get('tandaT');
    },

    langkah: function (s, dt) {
      const p = peristiwa(s);
      if (s.data.jalan) s.data.t = Math.min(1, s.data.t + dt * s.get('laju') * 0.3);
      const t = s.data.t;
      const g = s.data.panggung;
      const o = s.data.objek || {};

      g.rotation.y += dt * 0.25;

      if (p.adegan === 'es') {
        if (o.es) { o.es.scale.setScalar(1 - t * 0.92); o.es.position.y = 0.55 - t * 0.35; }
        if (o.air) { o.air.scale.y = Math.max(0.02, t * 0.5); o.air.position.y = o.air.scale.y / 2 + 0.05; }
      } else if (p.adegan === 'didih') {
        if (o.gelas) o.gelas.userData.setLevel(0.6 * (1 - t * 0.55));
        if (o.gel) o.gel.userData.perbarui(dt, t > 0.12 ? 1.4 : 0);
        s.data.api.userData.perbarui(s.waktu, s.data.jalan ? 1 : 0);
        s.data.gas.visible = t > 0.14;
        majuGas(s, dt, 0.9);
      } else if (p.adegan === 'sobek') {
        if (o.kiri && o.kanan) {
          o.kiri.position.x = -t * 0.85; o.kiri.rotation.z = t * 0.35;
          o.kanan.position.x = t * 0.85; o.kanan.rotation.z = -t * 0.35;
          o.utuh.visible = t < 0.04;
          o.kiri.visible = o.kanan.visible = t >= 0.04;
        }
      } else if (p.adegan === 'larut') {
        if (o.gelas) o.gelas.userData.setLevel(0.6);
        if (o.butir) {
          const d = o.butir.userData.p;
          for (let i = 0; i < d.length; i++) {
            d[i].r = 0.05 * (1 - t);
            d[i].pos.y = S.lerp(d[i].asal.y, 0.9 + Math.random() * 0.3, t * 0.6);
            const a = Math.atan2(d[i].asal.z, d[i].asal.x) + t * 3;
            const r = Math.hypot(d[i].asal.x, d[i].asal.z);
            d[i].pos.x = Math.cos(a) * r; d[i].pos.z = Math.sin(a) * r;
          }
          o.butir.userData.tulis();
        }
      } else if (p.adegan === 'bakar') {
        s.data.api.userData.perbarui(s.waktu, s.data.jalan ? S.clamp(t * 3, 0, 1) * (1 - t * 0.5) : 0);
        s.data.gas.visible = t > 0.06;
        majuGas(s, dt, 1.4);
        if (o.kertas) {
          o.kertas.scale.y = Math.max(0.05, 1 - t);
          o.kertas.position.y = 0.9 - t * 0.78;
          o.kertas.material.color.lerpColors(
            new T.Color(0xf2efe4), new T.Color(0x201c18), S.clamp(t * 1.6, 0, 1));
        }
        if (o.abu) { o.abu.visible = t > 0.6; o.abu.scale.setScalar(S.clamp((t - 0.6) * 2.6, 0.01, 1)); }
      } else if (p.adegan === 'karat') {
        if (o.paku) {
          o.paku.material.color.lerpColors(
            new T.Color(0xb8c0c8), new T.Color(0x9c4e22), t);
          o.paku.material.roughness = 0.25 + t * 0.6;
          o.paku.material.metalness = 0.92 * (1 - t * 0.8);
        }
        if (o.karat) { o.karat.visible = t > 0.2; o.karat.material.opacity = S.clamp((t - 0.2) * 1.4, 0, 0.9); }
      } else if (p.adegan === 'buih') {
        if (o.gelas) o.gelas.userData.setLevel(0.42 + t * 0.2);
        if (o.buih) {
          o.buih.userData.perbarui(dt, s.data.jalan ? (t < 0.75 ? 2.4 : 2.4 * (1 - (t - 0.75) * 4)) : 0);
          o.buih.visible = t > 0.03 && t < 0.98;
        }
        s.data.gas.visible = t > 0.06 && t < 0.92;
        majuGas(s, dt, 1.1);
      } else if (p.adegan === 'basi') {
        if (o.gelas) {
          o.gelas.userData.setLevel(0.6);
          o.gelas.userData.cair.material.color.lerpColors(
            new T.Color(0xf4f6f8), new T.Color(0xd8cf9a), t);
        }
        if (o.gumpal) {
          o.gumpal.visible = t > 0.25;
          o.gumpal.children.forEach(function (c, i) {
            c.scale.setScalar(S.clamp((t - 0.25) * 1.8, 0.01, 1) * (0.7 + (i % 3) * 0.2));
            c.position.y = 0.26 + Math.sin(s.waktu * 1.2 + i) * 0.02;
          });
        }
      } else if (p.adegan === 'lilin') {
        s.data.api.userData.perbarui(s.waktu, s.data.jalan ? 1 : 0);
        if (o.lilin) {
          o.lilin.scale.y = 1 - t * 0.55;
          o.lilin.position.y = (1 - t * 0.55) * 0.75;
          s.data.api.position.y = (1 - t * 0.55) * 1.5 + 0.14;
        }
        s.data.gas.visible = s.data.jalan;
        majuGas(s, dt, 0.7);
      }

      // tanda-tanda menyala sesuai kemajuan
      s.data.tandaSprite.forEach(function (x) {
        const ada = p.tanda.indexOf(x.k) >= 0 && t > 0.2;
        x.sp.userData.ganti((ada ? '●  ' : '○  ') + TANDA[x.k], ada ? '#9fe8ad' : '#4a5560');
      });
    },

    bacaUbah: function (s) {
      const p = peristiwa(s);
      const tebak = s.get('tebak');
      const t = s.data.t || 0;
      const buka = t > 0.35;
      s.baca('jenis', buka ? (p.jenis === 'fisika' ? 'Perubahan fisika' : 'Perubahan kimia') : 'Jalankan dulu',
        buka ? (p.jenis === 'fisika' ? 'biru' : 'warn') : null);
      s.baca('tebak', tebak === 'belum' ? 'belum menebak'
        : buka ? (tebak === p.jenis ? 'Tepat ✓' : 'Belum tepat') : tebak,
        tebak === 'belum' ? null : buka ? (tebak === p.jenis ? 'aksen' : 'danger') : null);
      s.baca('zat', buka ? (p.jenis === 'kimia' ? 'Ya, terbentuk zat baru' : 'Tidak, zatnya tetap sama') : '—');
      s.baca('balik', buka ? (p.balik ? 'Bisa' : 'Tidak bisa') : '—',
        buka ? (p.balik ? 'aksen' : 'danger') : null);
    }
  };

  function majuGas(s, dt, laju) {
    if (!s.data.gas.visible) return;
    const d = s.data.gas.userData.p;
    for (let i = 0; i < d.length; i++) {
      d[i].pos.y += dt * laju * (0.6 + (i % 5) * 0.12);
      d[i].pos.x += Math.sin(s.waktu * 1.7 + i) * dt * 0.22;
      d[i].pos.z += Math.cos(s.waktu * 1.4 + i) * dt * 0.22;
      d[i].r = 0.06 + S.clamp((d[i].pos.y + 1.4) / 3, 0, 1) * 0.07;
      if (d[i].pos.y > 1.6) d[i].pos.set(S.acak(-0.3, 0.3), -1.5, S.acak(-0.3, 0.3));
    }
    s.data.gas.userData.tulis();
  }

  function pasang(s) {
    const p = peristiwa(s);
    const g = s.data.panggung;
    while (g.children.length) { const c = g.children.pop(); S.buangObjek(c); }
    const o = {};
    s.data.objek = o;
    s.data.gas.visible = false;
    s.data.api.visible = false;
    s.data.api.userData.perbarui(0, 0);
    s.data.api.position.set(0, 0.2, 0);
    s.data.gas.material.color.setHex(0x9aa4ae);

    if (p.adegan === 'es') {
      o.es = new T.Mesh(new T.BoxGeometry(1.1, 0.95, 1.1),
        new T.MeshPhysicalMaterial({ color: 0xaee0f0, roughness: 0.12, transmission: 0.6,
          thickness: 0.6, transparent: true, opacity: 0.92, clearcoat: 1, envMapIntensity: 1 }));
      o.es.position.y = 0.55; o.es.castShadow = true;
      g.add(o.es);
      o.air = new T.Mesh(new T.CylinderGeometry(1.15, 1.15, 1, 44),
        S.matCairan(0x3f8fd8, { opacity: 0.8 }));
      o.air.scale.y = 0.02; o.air.position.y = 0.06;
      g.add(o.air);
    } else if (p.adegan === 'didih' || p.adegan === 'larut' || p.adegan === 'buih' || p.adegan === 'basi') {
      o.gelas = S.gelas({ r: 1.0, h: 1.9, level: 0.6,
        warna: p.adegan === 'basi' ? 0xf4f6f8 : p.adegan === 'buih' ? 0xdfe8ee : 0x4a9fd8 });
      g.add(o.gelas);
      if (p.adegan === 'didih') {
        o.gel = S.gelembung({ n: 46, sebar: 0.66, tinggi: 1.1 });
        g.add(o.gel);
        s.data.api.visible = true;
        s.data.api.position.y = -0.7;
        const kaki = new T.Mesh(new T.TorusGeometry(0.9, 0.04, 10, 36), S.matLogam(0x6b747c));
        kaki.rotation.x = Math.PI / 2; kaki.position.y = -0.04;
        g.add(kaki);
        s.data.gas.material.color.setHex(0xcfe8f4);
      }
      if (p.adegan === 'larut') {
        o.butir = S.partikel(80, { r: 0.05, warna: 0xffffff, kotak: { x: 0.7, y: 0.5, z: 0.7 } });
        o.butir.userData.p.forEach(function (q) {
          const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 0.6;
          q.asal = new T.Vector3(Math.cos(a) * r, 0.18 + Math.random() * 0.2, Math.sin(a) * r);
          q.pos.copy(q.asal);
          q.r = 0.05;
        });
        o.butir.userData.tulis();
        g.add(o.butir);
      }
      if (p.adegan === 'buih') {
        o.buih = S.gelembung({ n: 70, sebar: 0.78, tinggi: 1.5, warna: 0xf4fbff });
        g.add(o.buih);
        s.data.gas.material.color.setHex(0xdce8f0);
      }
      if (p.adegan === 'basi') {
        o.gumpal = new T.Group();
        for (let i = 0; i < 12; i++) {
          const m = new T.Mesh(new T.SphereGeometry(0.14, 16, 12),
            new T.MeshStandardMaterial({ color: 0xe8dcb0, roughness: 0.85 }));
          const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 0.68;
          m.position.set(Math.cos(a) * r, 0.26, Math.sin(a) * r);
          o.gumpal.add(m);
        }
        o.gumpal.visible = false;
        g.add(o.gumpal);
      }
    } else if (p.adegan === 'sobek') {
      const mk = new T.MeshStandardMaterial({ color: 0xf2efe4, roughness: 0.92, side: T.DoubleSide });
      o.utuh = new T.Mesh(new T.BoxGeometry(1.7, 0.03, 2.2), mk);
      o.utuh.position.y = 1.1;
      g.add(o.utuh);
      o.kiri = new T.Mesh(new T.BoxGeometry(0.84, 0.03, 2.2), mk);
      o.kiri.position.set(-0.43, 1.1, 0); o.kiri.visible = false;
      g.add(o.kiri);
      o.kanan = new T.Mesh(new T.BoxGeometry(0.84, 0.03, 2.2), mk);
      o.kanan.position.set(0.43, 1.1, 0); o.kanan.visible = false;
      g.add(o.kanan);
    } else if (p.adegan === 'bakar') {
      o.kertas = new T.Mesh(new T.BoxGeometry(1.1, 1.5, 0.04),
        new T.MeshStandardMaterial({ color: 0xf2efe4, roughness: 0.92, side: T.DoubleSide }));
      o.kertas.position.y = 0.9;
      g.add(o.kertas);
      o.abu = new T.Mesh(new T.CylinderGeometry(0.62, 0.72, 0.12, 36),
        new T.MeshStandardMaterial({ color: 0x2a2724, roughness: 0.98 }));
      o.abu.position.y = 0.06; o.abu.visible = false;
      g.add(o.abu);
      s.data.api.visible = true;
      s.data.api.position.set(0, 0.2, 0);
      s.data.gas.material.color.setHex(0x6b7076);
    } else if (p.adegan === 'karat') {
      o.paku = new T.Mesh(new T.CylinderGeometry(0.14, 0.03, 1.9, 24),
        S.matLogam(0xb8c0c8, { roughness: 0.25 }));
      o.paku.position.y = 1.1; o.paku.rotation.z = 0.25;
      o.paku.castShadow = true;
      g.add(o.paku);
      const kepala = new T.Mesh(new T.CylinderGeometry(0.26, 0.26, 0.1, 24), o.paku.material);
      kepala.position.y = 2.0; kepala.rotation.z = 0.25;
      g.add(kepala);
      o.karat = new T.Mesh(new T.CylinderGeometry(0.19, 0.07, 1.85, 24),
        new T.MeshStandardMaterial({ color: 0x9c4e22, roughness: 0.95, transparent: true, opacity: 0 }));
      o.karat.position.y = 1.1; o.karat.rotation.z = 0.25;
      o.karat.visible = false;
      g.add(o.karat);
    } else if (p.adegan === 'lilin') {
      o.lilin = new T.Mesh(new T.CylinderGeometry(0.35, 0.38, 1.5, 32),
        new T.MeshPhysicalMaterial({ color: 0xf2e6c8, roughness: 0.42, transmission: 0.25,
          thickness: 0.5, transparent: true, opacity: 0.96, clearcoat: 0.4 }));
      o.lilin.position.y = 0.75; o.lilin.castShadow = true;
      g.add(o.lilin);
      const sumbu = new T.Mesh(new T.CylinderGeometry(0.022, 0.022, 0.2, 8),
        new T.MeshStandardMaterial({ color: 0x241f1a, roughness: 1 }));
      sumbu.position.y = 1.56;
      g.add(sumbu);
      s.data.api.visible = true;
      s.data.api.position.set(0, 1.64, 0);
      s.data.gas.material.color.setHex(0xaeb6bc);
    }

    s.data.lbl.userData.ganti(p.n, p.jenis === 'fisika' ? '#8fbdf8' : '#f0a94a');
    s.data.papan.visible = s.get('tandaT');
    s.data.tandaSprite.forEach(function (x) {
      x.sp.userData.ganti('○  ' + TANDA[x.k], '#4a5560');
    });
  }
})());
