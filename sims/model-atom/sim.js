/* Perkembangan Model Atom — Fase E — adegan 3D */

Sim3D.daftar('model-atom', (function () {
  'use strict';
  const T = THREE, S = S3;

  const MODEL = [
    { id: 'dalton', n: 'Dalton (1803)', ket: 'Atom = bola pejal yang tak terbagi',
      lemah: 'Tidak bisa menjelaskan listrik dan elektron' },
    { id: 'thomson', n: 'Thomson (1897)', ket: 'Roti kismis: elektron tersebar dalam bola positif',
      lemah: 'Gagal menjelaskan hamburan sinar alfa' },
    { id: 'rutherford', n: 'Rutherford (1911)', ket: 'Inti kecil bermuatan positif, elektron mengelilinginya',
      lemah: 'Elektron seharusnya jatuh ke inti' },
    { id: 'bohr', n: 'Bohr (1913)', ket: 'Elektron hanya boleh di kulit tertentu',
      lemah: 'Hanya tepat untuk atom berelektron satu' },
    { id: 'kuantum', n: 'Mekanika kuantum (1926)', ket: 'Elektron = awan peluang, bukan lintasan',
      lemah: 'Model yang dipakai sampai sekarang' }
  ];

  function model(s) {
    const id = s.get('m');
    for (let i = 0; i < MODEL.length; i++) if (MODEL[i].id === id) return MODEL[i];
    return MODEL[0];
  }

  return {
    latar: 0x05090e,
    kamera: { jarak: 8.4, phi: 1.14, theta: 0.6, targetY: 0, lajuPutar: 0.22 },

    kendali: [
      { judul: 'Model atom', isi: [
        { type: 'select', id: 'm', value: 'bohr', label: 'Model',
          options: MODEL.map(function (m) { return { value: m.id, label: m.n }; }) },
        { type: 'buttons', label: 'Jelajahi berurutan', items: [
          { label: '← Sebelum', klik: function (s) { geser(s, -1); } },
          { label: 'Sesudah →', klik: function (s) { geser(s, 1); } }
        ]}
      ]},
      { judul: 'Percobaan Rutherford', isi: [
        { type: 'toggle', id: 'alfa', value: false, label: 'Tembakkan sinar alfa' },
        { type: 'slider', id: 'lajuAlfa', value: 1, min: 0.3, max: 3, step: 0.1,
          label: 'Kecepatan partikel', unit: '×', dec: 1 }
      ]},
      { judul: 'Tampilan', isi: [
        { type: 'toggle', id: 'orbit', value: true, label: 'Tampilkan garis lintasan' },
        { type: 'toggle', id: 'label', value: true, label: 'Tampilkan keterangan' },
        { type: 'slider', id: 'elektron', value: 8, min: 1, max: 18, step: 1,
          label: 'Jumlah elektron', unit: '', dec: 0 }
      ]}
    ],

    baca: [
      { id: 'model', label: 'Model', tone: 'aksen' },
      { id: 'inti', label: 'Inti atom' },
      { id: 'elektron', label: 'Letak elektron' },
      { id: 'lemah', label: 'Kelemahan' }
    ],

    bangun: function (s) {
      s.tambah(S.panggungMolekul({ r: 6.5, warna: 0x2e4160, kuat: 0.5, yBayang: -3.0 }));
      s.data.w = new T.Group();
      s.tambah(s.data.w);

      // partikel alfa
      const alfa = S.partikel(26, { r: 0.07, warna: 0xf0c04a, kotak: { x: 6, y: 3, z: 3 } });
      alfa.visible = false;
      s.data.alfa = alfa;
      s.tambah(alfa);

      // layar pendar
      const layar = new T.Mesh(new T.TorusGeometry(4.6, 0.09, 12, 72),
        new T.MeshStandardMaterial({ color: 0x2a3640, roughness: 0.8,
          emissive: 0x1a2a34, emissiveIntensity: 0.3 }));
      layar.rotation.x = Math.PI / 2;
      layar.visible = false;
      s.data.layar = layar;
      s.tambah(layar);

      const lbl = S.teks('', { skala: 0.42, lebar: 22, warna: '#d8e4ec' });
      lbl.position.set(0, 3.5, 0);
      s.data.lbl = lbl;
      s.tambah(lbl);

      const ket = S.teks('', { skala: 0.28, lebar: 46, warna: '#9aa8b4' });
      ket.position.set(0, -3.1, 0);
      s.data.ket = ket;
      s.tambah(ket);

      pasang(s);
    },

    ubah: function (s, id) {
      if (id === 'alfa') {
        s.data.alfa.visible = s.get('alfa');
        s.data.layar.visible = s.get('alfa');
        aturAlfa(s);
      } else pasang(s);
    },

    langkah: function (s, dt) {
      const m = model(s);
      const w = s.data.w;

      if (m.id === 'thomson') {
        (s.data.el || []).forEach(function (e, i) {
          e.position.copy(e.userData.asal).add(new T.Vector3(
            Math.sin(s.waktu * 2 + i * 1.3) * 0.08,
            Math.sin(s.waktu * 2.4 + i * 2.1) * 0.08,
            Math.cos(s.waktu * 2.2 + i) * 0.08));
        });
      } else if (m.id === 'rutherford' || m.id === 'bohr') {
        (s.data.el || []).forEach(function (e) {
          const u = e.userData;
          u.sudut += dt * u.laju;
          const p = new T.Vector3(Math.cos(u.sudut) * u.r, 0, Math.sin(u.sudut) * u.r);
          p.applyAxisAngle(new T.Vector3(1, 0, 0), u.miring);
          p.applyAxisAngle(new T.Vector3(0, 1, 0), u.putar);
          e.position.copy(p);
        });
      } else if (m.id === 'kuantum') {
        if (s.data.awan) s.data.awan.rotation.y += dt * 0.12;
        (s.data.titikAwan || []).forEach(function (q, i) {
          q.pos.copy(q.asal).add(new T.Vector3(
            Math.sin(s.waktu * 1.6 + i * 0.7) * 0.05,
            Math.cos(s.waktu * 1.4 + i * 1.1) * 0.05,
            Math.sin(s.waktu * 1.8 + i * 1.5) * 0.05));
        });
        if (s.data.awanP) s.data.awanP.userData.tulis();
      } else {
        w.rotation.y += dt * 0.1;
      }

      // partikel alfa
      if (s.get('alfa')) {
        const d = s.data.alfa.userData.p;
        const laju = s.get('lajuAlfa');
        const padat = m.id === 'dalton' || m.id === 'thomson';
        for (let i = 0; i < d.length; i++) {
          const q = d[i];
          q.pos.addScaledVector(q.vel, dt * 4 * laju);
          // dibelokkan bila mendekati inti kecil (Rutherford dan sesudahnya)
          if (!padat) {
            const r = q.pos.length();
            if (r < 1.3 && !q.belok) {
              const gaya = q.pos.clone().normalize().multiplyScalar((1.3 - r) * 2.6);
              q.vel.add(gaya).normalize();
              if (r < 0.42) q.belok = true;
            }
          } else {
            // model pejal: semua dipantulkan di permukaan bola
            if (q.pos.length() < 1.55 && !q.belok) {
              q.vel.reflect(q.pos.clone().normalize()).normalize();
              q.belok = true;
            }
          }
          if (q.pos.length() > 5.2) {
            q.pos.set(-5.2, S.acak(-0.9, 0.9), S.acak(-0.9, 0.9));
            q.vel.set(1, 0, 0);
            q.belok = false;
          }
        }
        s.data.alfa.userData.tulis();
      }
    },

    bacaUbah: function (s) {
      const m = model(s);
      s.baca('model', m.n);
      s.baca('inti', m.id === 'dalton' ? 'belum dikenal'
        : m.id === 'thomson' ? 'tidak ada — muatan positif tersebar'
        : 'ada, sangat kecil dan padat');
      s.baca('elektron', m.id === 'dalton' ? 'belum dikenal'
        : m.id === 'thomson' ? 'tersebar di seluruh bola'
        : m.id === 'rutherford' ? 'mengelilingi inti, lintasan bebas'
        : m.id === 'bohr' ? 'pada kulit dengan energi tertentu'
        : 'awan peluang (orbital)');
      s.baca('lemah', m.lemah);
    }
  };

  function geser(s, arah) {
    const i = MODEL.findIndex(function (m) { return m.id === s.get('m'); });
    const j = (i + arah + MODEL.length) % MODEL.length;
    s.set('m', MODEL[j].id);
  }

  function aturAlfa(s) {
    const d = s.data.alfa.userData.p;
    for (let i = 0; i < d.length; i++) {
      d[i].pos.set(-5.2 - Math.random() * 3, S.acak(-0.9, 0.9), S.acak(-0.9, 0.9));
      d[i].vel = new T.Vector3(1, 0, 0);
      d[i].belok = false;
      d[i].r = 0.065;
      d[i].aktif = true;
    }
    s.data.alfa.userData.tulis();
  }

  function pasang(s) {
    const m = model(s);
    const w = s.data.w;
    while (w.children.length) { const c = w.children.pop(); S.buangObjek(c); }
    s.data.el = [];
    s.data.awan = null;
    s.data.awanP = null;

    const nE = Math.round(s.get('elektron'));

    if (m.id === 'dalton') {
      const bola = new T.Mesh(new T.SphereGeometry(1.5, 60, 44),
        new T.MeshPhysicalMaterial({ color: 0x5b9bf5, roughness: 0.3, metalness: 0.1,
          clearcoat: 0.8, envMapIntensity: 0.9 }));
      bola.castShadow = true;
      w.add(bola);
    } else if (m.id === 'thomson') {
      const bola = new T.Mesh(new T.SphereGeometry(1.6, 60, 44),
        new T.MeshPhysicalMaterial({ color: 0xef6a52, roughness: 0.2, metalness: 0,
          transmission: 0.55, thickness: 1, transparent: true, opacity: 0.75,
          clearcoat: 1, envMapIntensity: 0.9 }));
      bola.renderOrder = 2;
      w.add(bola);
      for (let i = 0; i < nE; i++) {
        const e = S.atom('X', null, { skala: 0.16, warna: 0x5b9bf5 });
        const a = Math.random() * Math.PI * 2, b = Math.acos(2 * Math.random() - 1);
        const r = Math.cbrt(Math.random()) * 1.25;
        e.position.set(r * Math.sin(b) * Math.cos(a), r * Math.cos(b), r * Math.sin(b) * Math.sin(a));
        e.userData.asal = e.position.clone();
        w.add(e);
        s.data.el.push(e);
      }
    } else if (m.id === 'rutherford' || m.id === 'bohr') {
      // inti
      const inti = new T.Group();
      const nI = 10;
      for (let i = 0; i < nI; i++) {
        const p = S.atom('X', null, { skala: 0.13, warna: i % 2 ? 0xe0533d : 0x8793a0 });
        const a = Math.random() * Math.PI * 2, b = Math.acos(2 * Math.random() - 1);
        const r = Math.cbrt(Math.random()) * 0.19;
        p.position.set(r * Math.sin(b) * Math.cos(a), r * Math.cos(b), r * Math.sin(b) * Math.sin(a));
        inti.add(p);
      }
      const halo = new T.Mesh(new T.SphereGeometry(0.42, 32, 24),
        new T.MeshBasicMaterial({ color: 0xef6a52, transparent: true, opacity: 0.16 }));
      inti.add(halo);
      w.add(inti);

      const bohr = m.id === 'bohr';
      const kapasitas = [2, 8, 18, 32];
      let sisa = nE, kulit = 0;
      const radius = [1.3, 2.1, 2.9, 3.6];
      while (sisa > 0 && kulit < 4) {
        const isi = bohr ? Math.min(sisa, kapasitas[kulit]) : Math.min(sisa, 6);
        const r = radius[kulit];
        if (s.get('orbit')) {
          const lingkar = new T.Mesh(new T.TorusGeometry(r, 0.012, 8, 100),
            new T.MeshBasicMaterial({ color: bohr ? 0x4fd1c0 : 0x5b9bf5,
              transparent: true, opacity: bohr ? 0.42 : 0.2 }));
          lingkar.rotation.x = Math.PI / 2 + (bohr ? 0 : kulit * 0.5);
          lingkar.rotation.z = bohr ? 0 : kulit * 0.8;
          w.add(lingkar);
        }
        for (let i = 0; i < isi; i++) {
          const e = S.atom('X', null, { skala: 0.15, warna: 0x5b9bf5 });
          e.userData = {
            sudut: i / isi * Math.PI * 2, r: r,
            laju: (bohr ? 1.5 : 1.2) / Math.sqrt(r),
            miring: bohr ? Math.PI / 2 : Math.PI / 2 + kulit * 0.5,
            putar: bohr ? 0 : kulit * 0.8
          };
          w.add(e);
          s.data.el.push(e);
        }
        if (bohr && s.get('label')) {
          const t = S.teks('kulit ' + 'KLMN'[kulit] + ' (' + isi + 'e⁻)',
            { skala: 0.2, lebar: 12, warna: '#7fe3d6' });
          t.position.set(0, 0.16, r + 0.1);
          w.add(t);
        }
        sisa -= isi;
        kulit++;
      }
    } else {
      // awan kuantum
      const n = 900;
      const p = S.partikel(n, { r: 0.028, warna: 0x7fe3d6, seg: 8, kotak: { x: 3, y: 3, z: 3 } });
      p.material.transparent = true;
      p.material.opacity = 0.55;
      const d = p.userData.p;
      s.data.titikAwan = d;
      for (let i = 0; i < n; i++) {
        // campuran orbital s dan p agar bentuknya menarik
        const jenis = i % 4;
        let v;
        if (jenis === 0) {
          const r = Math.abs(gauss()) * 0.55 + 0.25;
          v = arahAcak().multiplyScalar(r);
        } else {
          const sumbu = jenis - 1;
          const r = Math.abs(gauss()) * 0.6 + 0.5;
          v = arahAcak();
          const bobot = Math.pow(Math.abs(v.getComponent(sumbu)), 1.6);
          if (Math.random() > bobot) { i--; continue; }
          v.multiplyScalar(r * 1.5);
        }
        d[i].pos.copy(v);
        d[i].asal = v.clone();
        d[i].r = 0.028;
        d[i].aktif = true;
      }
      p.userData.tulis();
      w.add(p);
      s.data.awanP = p;
      s.data.awan = w;

      const inti = S.atom('X', null, { skala: 0.26, warna: 0xef6a52 });
      w.add(inti);
      const halo = new T.Mesh(new T.SphereGeometry(0.4, 32, 24),
        new T.MeshBasicMaterial({ color: 0xef6a52, transparent: true, opacity: 0.2 }));
      w.add(halo);
    }

    s.data.lbl.userData.ganti(m.n);
    s.data.ket.userData.ganti(m.ket);
    s.data.ket.visible = s.get('label');
    s.data.alfa.visible = s.get('alfa');
    s.data.layar.visible = s.get('alfa');
    if (s.get('alfa')) aturAlfa(s);
    s.orbit.set({ jarak: m.id === 'kuantum' ? 6.6 : s.get('alfa') ? 12 : 8.6 });
  }

  function gauss() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  function arahAcak() {
    const a = Math.random() * Math.PI * 2, b = Math.acos(2 * Math.random() - 1);
    return new T.Vector3(Math.sin(b) * Math.cos(a), Math.cos(b), Math.sin(b) * Math.sin(a));
  }
})());
