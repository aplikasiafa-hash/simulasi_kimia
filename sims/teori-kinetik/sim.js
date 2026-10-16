/* Teori Kinetik: Gerak Partikel dan Suhu — Fase D — adegan 3D */

Sim3D.daftar('teori-kinetik', (function () {
  'use strict';
  const T = THREE, S = S3;

  const N = 260;

  return {
    latar: 0x080e14,
    kamera: { jarak: 10, phi: 1.1, theta: 0.65, targetY: 0.4, lajuPutar: 0.12 },

    kendali: [
      { judul: 'Keadaan gas', isi: [
        { type: 'slider', id: 'suhu', value: 300, min: 20, max: 900, step: 5,
          label: 'Suhu', unit: ' K', dec: 0 },
        { type: 'slider', id: 'volume', value: 1, min: 0.35, max: 1, step: 0.01,
          label: 'Volume (posisi piston)', unit: '', dec: 2,
          format: function (v) { return Math.round(v * 100) + '%'; } },
        { type: 'slider', id: 'jumlah', value: 0.6, min: 0.1, max: 1, step: 0.02,
          label: 'Jumlah partikel', unit: '', dec: 2,
          format: function (v) { return Math.round(v * 260) + ' butir'; } }
      ]},
      { judul: 'Jenis partikel', isi: [
        { type: 'segment', id: 'gas', value: 'ringan', label: 'Massa partikel', options: [
          { value: 'ringan', label: 'Ringan (He)' },
          { value: 'sedang', label: 'Sedang (N₂)' },
          { value: 'berat', label: 'Berat (CO₂)' }
        ]},
        { type: 'toggle', id: 'campur', value: false, label: 'Campur dua jenis gas' }
      ]},
      { judul: 'Tampilan', isi: [
        { type: 'toggle', id: 'jejak', value: false, label: 'Tampilkan jejak satu partikel' },
        { type: 'toggle', id: 'tumbuk', value: true, label: 'Kilatkan dinding saat ditumbuk' },
        { type: 'buttons', label: '', items: [
          { label: '❄ Dinginkan', klik: function (s) { s.set('suhu', 60); } },
          { label: '🔥 Panaskan', klik: function (s) { s.set('suhu', 800); } }
        ]}
      ]}
    ],

    baca: [
      { id: 'suhu', label: 'Suhu', tone: 'aksen' },
      { id: 'laju', label: 'Laju rata-rata' },
      { id: 'tekanan', label: 'Tekanan' },
      { id: 'tumbuk', label: 'Tumbukan dinding/detik' },
      { id: 'energi', label: 'Energi kinetik rata-rata' }
    ],

    bangun: function (s) {
      s.tambah(S.lantai({ r: 9, y: -2.4, warna: 0x0e151d }));

      // kotak wadah
      const L = 2.0;
      s.data.L = L;
      const geo = new T.BoxGeometry(L * 2, L * 2, L * 2);
      const kaca = new T.Mesh(geo, S.matKaca({ opacity: 0.09 }));
      kaca.renderOrder = 3;
      s.data.kaca = kaca;
      s.tambah(kaca);

      const rangka = new T.LineSegments(new T.EdgesGeometry(geo),
        new T.LineBasicMaterial({ color: 0x4fd1c0, transparent: true, opacity: 0.45 }));
      s.data.rangka = rangka;
      s.tambah(rangka);

      // dinding yang berkilat saat ditumbuk
      s.data.dinding = [];
      const arah = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
      arah.forEach(function (a) {
        const m = new T.Mesh(new T.PlaneGeometry(L * 2, L * 2),
          new T.MeshBasicMaterial({ color: 0x7fe3d6, transparent: true, opacity: 0,
            side: T.DoubleSide, depthWrite: false }));
        m.position.set(a[0] * L, a[1] * L, a[2] * L);
        if (a[0]) m.rotation.y = Math.PI / 2;
        if (a[1]) m.rotation.x = Math.PI / 2;
        m.userData.n = a;
        m.userData.kilat = 0;
        s.tambah(m);
        s.data.dinding.push(m);
      });

      // piston di sisi kanan
      const piston = new T.Group();
      const pelat = new T.Mesh(new T.BoxGeometry(0.18, L * 2, L * 2), S.matLogam(0x9aa4ae));
      piston.add(pelat);
      const batang = new T.Mesh(new T.CylinderGeometry(0.12, 0.12, 1.6, 20), S.matLogam(0x7c868e));
      batang.rotation.z = Math.PI / 2;
      batang.position.x = 0.88;
      piston.add(batang);
      const peg = new T.Mesh(new T.CylinderGeometry(0.4, 0.4, 0.2, 24), S.matLogam(0xef6a52, { metalness: 0.3 }));
      peg.rotation.z = Math.PI / 2;
      peg.position.x = 1.76;
      piston.add(peg);
      s.data.piston = piston;
      s.tambah(piston);

      // partikel
      const p = S.partikel(N, { r: 0.1, warna: 0x5b9bf5, kotak: { x: L, y: L, z: L } });
      s.data.p = p;
      s.tambah(p);

      // jejak satu partikel
      const jejakGeo = new T.BufferGeometry();
      s.data.jejakTitik = new Float32Array(240 * 3);
      jejakGeo.setAttribute('position', new T.BufferAttribute(s.data.jejakTitik, 3));
      const jejak = new T.Line(jejakGeo,
        new T.LineBasicMaterial({ color: 0xf0c04a, transparent: true, opacity: 0.8 }));
      jejak.frustumCulled = false;
      jejak.visible = false;
      s.data.jejak = jejak;
      s.data.jejakN = 0;
      s.tambah(jejak);

      const penanda = S.atom('X', null, { skala: 0.14, warna: 0xf0c04a });
      penanda.visible = false;
      s.data.penanda = penanda;
      s.tambah(penanda);

      // pengukur tekanan
      const meter = new T.Group();
      const muka = new T.Mesh(new T.CylinderGeometry(0.62, 0.62, 0.12, 40),
        new T.MeshStandardMaterial({ color: 0x141c23, roughness: 0.5 }));
      muka.rotation.x = Math.PI / 2;
      meter.add(muka);
      const cincin = new T.Mesh(new T.TorusGeometry(0.62, 0.05, 12, 44), S.matLogam(0xc8ced4));
      meter.add(cincin);
      const jarum = new T.Mesh(new T.BoxGeometry(0.05, 0.5, 0.03),
        new T.MeshStandardMaterial({ color: 0xef6a52, emissive: 0xef6a52, emissiveIntensity: 0.4 }));
      jarum.position.y = 0.2;
      const pivot = new T.Group();
      pivot.add(jarum);
      pivot.position.z = 0.08;
      meter.add(pivot);
      s.data.jarum = pivot;
      meter.position.set(0, 3.0, 0);
      s.tambah(meter);

      s.data.tumbukCacah = 0;
      s.data.tumbukLaju = 0;
      pasang(s);
    },

    ubah: function (s, id) {
      if (id === 'jumlah' || id === 'gas' || id === 'campur') pasang(s);
      if (id === 'jejak') {
        s.data.jejak.visible = s.get('jejak');
        s.data.penanda.visible = s.get('jejak');
        s.data.jejakN = 0;
      }
    },

    langkah: function (s, dt) {
      const L = s.data.L;
      const vol = s.get('volume');
      const batasX = -L + 2 * L * vol;      // dinding piston bergerak
      const suhu = s.get('suhu');
      const p = s.data.p, d = p.userData.p;

      s.data.piston.position.x = batasX + 0.09;
      s.data.kaca.scale.x = vol;
      s.data.kaca.position.x = -L + L * vol;
      s.data.rangka.scale.x = vol;
      s.data.rangka.position.x = -L + L * vol;
      s.data.dinding.forEach(function (m) {
        if (m.userData.n[0] === 1) m.position.x = batasX;
        else if (m.userData.n[0] === 0) {
          m.scale.x = vol;
          m.position.x = -L + L * vol;
        }
      });

      let tumbuk = 0;
      let jumlahLaju = 0, aktif = 0;
      for (let i = 0; i < d.length; i++) {
        const q = d[i];
        if (!q.aktif) continue;
        aktif++;
        // laju mengikuti akar suhu dibagi massa
        const v = Math.sqrt(suhu / 300 / q.massa) * 2.4;
        jumlahLaju += v;
        q.pos.addScaledVector(q.arah, v * dt);
        const r = q.r;
        if (q.pos.x > batasX - r) { q.pos.x = batasX - r; q.arah.x *= -1; tumbuk++; kilat(s, 0); }
        if (q.pos.x < -L + r) { q.pos.x = -L + r; q.arah.x *= -1; tumbuk++; kilat(s, 1); }
        if (q.pos.y > L - r) { q.pos.y = L - r; q.arah.y *= -1; tumbuk++; kilat(s, 2); }
        if (q.pos.y < -L + r) { q.pos.y = -L + r; q.arah.y *= -1; tumbuk++; kilat(s, 3); }
        if (q.pos.z > L - r) { q.pos.z = L - r; q.arah.z *= -1; tumbuk++; kilat(s, 4); }
        if (q.pos.z < -L + r) { q.pos.z = -L + r; q.arah.z *= -1; tumbuk++; kilat(s, 5); }
      }
      p.userData.tulis();

      s.data.lajuRata = aktif ? jumlahLaju / aktif : 0;
      s.data.tumbukLaju = S.lerp(s.data.tumbukLaju, tumbuk / Math.max(dt, 1e-4), dt * 3);
      s.data.aktif = aktif;

      // kilat dinding memudar
      s.data.dinding.forEach(function (m) {
        m.userData.kilat = Math.max(0, m.userData.kilat - dt * 3.2);
        m.material.opacity = s.get('tumbuk') ? m.userData.kilat * 0.15 : 0;
      });

      // jejak satu partikel
      if (s.get('jejak')) {
        const q = d[0];
        s.data.penanda.position.copy(q.pos);
        const a = s.data.jejakTitik;
        if (s.data.jejakN < 240) {
          a[s.data.jejakN * 3] = q.pos.x;
          a[s.data.jejakN * 3 + 1] = q.pos.y;
          a[s.data.jejakN * 3 + 2] = q.pos.z;
          s.data.jejakN++;
        } else {
          a.copyWithin(0, 3);
          a[717] = q.pos.x; a[718] = q.pos.y; a[719] = q.pos.z;
        }
        s.data.jejak.geometry.setDrawRange(0, s.data.jejakN);
        s.data.jejak.geometry.attributes.position.needsUpdate = true;
      }

      // jarum tekanan
      const tek = tekanan(s);
      s.data.jarum.rotation.z = S.lerp(s.data.jarum.rotation.z,
        Math.PI * 0.75 - S.clamp(tek / 4, 0, 1) * Math.PI * 1.5, dt * 4);

      // warna partikel mengikuti suhu
      const c = new T.Color(0x4a90d9).lerp(new T.Color(0xef6a52), S.clamp((suhu - 50) / 700, 0, 1));
      if (!s.get('campur')) { p.material.color.copy(c); p.material.emissive.copy(c); }
    },

    bacaUbah: function (s) {
      const suhu = s.get('suhu');
      const vol = s.get('volume');
      s.baca('suhu', Math.round(suhu) + ' K  (' + Math.round(suhu - 273) + ' °C)',
        suhu < 150 ? 'biru' : suhu > 600 ? 'danger' : 'aksen');
      s.baca('laju', S.fmt(s.data.lajuRata || 0, 2) + ' satuan');
      s.baca('tekanan', S.fmt(tekanan(s), 2) + ' satuan',
        tekanan(s) > 2.6 ? 'danger' : 'aksen');
      s.baca('tumbuk', Math.round(s.data.tumbukLaju || 0));
      s.baca('energi', S.fmt(suhu / 300 * 0.5, 2) + ' satuan  (∝ suhu)');
    }
  };

  function tekanan(s) {
    // p ∝ n·T/V
    const n = (s.data.aktif || 1) / 260;
    return n * (s.get('suhu') / 300) / Math.max(0.1, s.get('volume')) * 1.0;
  }

  function kilat(s, i) {
    const m = s.data.dinding[i];
    if (m) m.userData.kilat = Math.min(1, m.userData.kilat + 0.08);
  }

  function pasang(s) {
    const p = s.data.p, d = p.userData.p;
    const n = Math.round(d.length * s.get('jumlah'));
    const gas = s.get('gas');
    const massa = gas === 'ringan' ? 0.4 : gas === 'sedang' ? 1 : 2.2;
    const campur = s.get('campur');
    const L = s.data.L;

    if (campur && !p.instanceColor) {
      p.instanceColor = new T.InstancedBufferAttribute(new Float32Array(d.length * 3), 3);
    }

    for (let i = 0; i < d.length; i++) {
      const q = d[i];
      q.aktif = i < n;
      const ringan = campur && i % 2 === 0;
      q.massa = campur ? (ringan ? 0.4 : 2.2) : massa;
      q.r = 0.07 + Math.sqrt(q.massa) * 0.055;
      q.pos.set(S.acak(-L + 0.2, L - 0.6), S.acak(-L + 0.2, L - 0.2), S.acak(-L + 0.2, L - 0.2));
      q.arah = new T.Vector3(S.acak(-1, 1), S.acak(-1, 1), S.acak(-1, 1)).normalize();
      if (campur) {
        p.setColorAt(i, new T.Color(ringan ? 0x7fe3d6 : 0xf0718f));
      }
    }
    if (campur && p.instanceColor) p.instanceColor.needsUpdate = true;
    if (!campur && p.instanceColor) {
      for (let i = 0; i < d.length; i++) p.setColorAt(i, new T.Color(0xffffff));
      p.instanceColor.needsUpdate = true;
    }
    p.userData.tulis();
    s.data.jejakN = 0;
    s.data.jejak.visible = s.get('jejak');
    s.data.penanda.visible = s.get('jejak');
  }
})());
