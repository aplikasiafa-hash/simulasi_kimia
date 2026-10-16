/* Bentuk Molekul (VSEPR) dan Kepolaran — Fase E — adegan 3D */

Sim3D.daftar('bentuk-molekul', (function () {
  'use strict';
  const T = THREE, S = S3;

  /* x = pasangan ikatan, e = pasangan bebas pada atom pusat */
  const BENTUK = {
    '2-0': { n: 'Linear', sudut: '180°', arah: [[0,0,1],[0,0,-1]] },
    '3-0': { n: 'Segitiga datar', sudut: '120°', arah: sudutDatar(3) },
    '2-1': { n: 'Bengkok (V)', sudut: '≈118°', arah: [sudutDatar(3)[0], sudutDatar(3)[1]], bebas: [sudutDatar(3)[2]] },
    '4-0': { n: 'Tetrahedron', sudut: '109,5°', arah: [[1,1,1],[-1,-1,1],[-1,1,-1],[1,-1,-1]] },
    '3-1': { n: 'Piramida segitiga', sudut: '≈107°', arah: [[-1,-1,1],[-1,1,-1],[1,-1,-1]], bebas: [[1,1,1]] },
    '2-2': { n: 'Bengkok (V)', sudut: '≈104,5°', arah: [[-1,1,-1],[1,-1,-1]], bebas: [[1,1,1],[-1,-1,1]] },
    '5-0': { n: 'Bipiramida segitiga', sudut: '120° dan 90°',
      arah: sudutDatar(3).concat([[0,1,0],[0,-1,0]]) },
    '4-1': { n: 'Jungkat-jungkit', sudut: '≈117° dan 90°',
      arah: [sudutDatar(3)[0], sudutDatar(3)[1], [0,1,0], [0,-1,0]], bebas: [sudutDatar(3)[2]] },
    '6-0': { n: 'Oktahedron', sudut: '90°',
      arah: [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]] },
    '5-1': { n: 'Piramida segiempat', sudut: '≈90°',
      arah: [[1,0,0],[-1,0,0],[0,0,1],[0,0,-1],[0,1,0]], bebas: [[0,-1,0]] },
    '4-2': { n: 'Segiempat datar', sudut: '90°',
      arah: [[1,0,0],[-1,0,0],[0,0,1],[0,0,-1]], bebas: [[0,1,0],[0,-1,0]] }
  };

  function sudutDatar(n) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2;
      out.push([Math.cos(a), 0, Math.sin(a)]);
    }
    return out;
  }

  const MOLEKUL = [
    { n: 'CO₂', pusat: 'C', luar: 'O', x: 2, e: 0, orde: 2, polar: false, ket: 'Simetris — dipol saling meniadakan' },
    { n: 'BF₃', pusat: 'B', luar: 'F', x: 3, e: 0, orde: 1, polar: false, ket: 'Simetris datar' },
    { n: 'SO₂', pusat: 'S', luar: 'O', x: 2, e: 1, orde: 2, polar: true, ket: 'Bengkok — dipol tidak meniadakan' },
    { n: 'CH₄', pusat: 'C', luar: 'H', x: 4, e: 0, orde: 1, polar: false, ket: 'Tetrahedron sempurna' },
    { n: 'NH₃', pusat: 'N', luar: 'H', x: 3, e: 1, orde: 1, polar: true, ket: 'Pasangan bebas mendorong ikatan' },
    { n: 'H₂O', pusat: 'O', luar: 'H', x: 2, e: 2, orde: 1, polar: true, ket: 'Dua pasangan bebas — sudut 104,5°' },
    { n: 'PCl₅', pusat: 'P', luar: 'Cl', x: 5, e: 0, orde: 1, polar: false, ket: 'Lima ikatan, simetris' },
    { n: 'SF₄', pusat: 'S', luar: 'F', x: 4, e: 1, orde: 1, polar: true, ket: 'Bentuk jungkat-jungkit' },
    { n: 'SF₆', pusat: 'S', luar: 'F', x: 6, e: 0, orde: 1, polar: false, ket: 'Oktahedron sempurna' },
    { n: 'XeF₄', pusat: 'X', luar: 'F', x: 4, e: 2, orde: 1, polar: false, ket: 'Datar — dipol meniadakan' }
  ];

  function mol(s) { return MOLEKUL[parseInt(s.get('m'), 10) || 0]; }

  return {
    latar: 0x060c12,
    kamera: { jarak: 6.6, phi: 1.1, theta: 0.6, targetY: 0, lajuPutar: 0.3 },

    kendali: [
      { judul: 'Molekul', isi: [
        { type: 'select', id: 'm', value: 5, label: 'Contoh molekul',
          options: MOLEKUL.map(function (m, i) { return { value: i, label: m.n + '  —  ' + bentukDari(m).n }; }) }
      ]},
      { judul: 'Susun sendiri', isi: [
        { type: 'toggle', id: 'sendiri', value: false, label: 'Pakai pengaturan sendiri' },
        { type: 'slider', id: 'x', value: 4, min: 2, max: 6, step: 1,
          label: 'Pasangan ikatan (X)', unit: '', dec: 0 },
        { type: 'slider', id: 'e', value: 0, min: 0, max: 2, step: 1,
          label: 'Pasangan bebas (E)', unit: '', dec: 0 }
      ]},
      { judul: 'Tampilan', isi: [
        { type: 'toggle', id: 'bebas', value: true, label: 'Tampilkan pasangan bebas' },
        { type: 'toggle', id: 'dipol', value: true, label: 'Tampilkan panah dipol' },
        { type: 'toggle', id: 'sudutT', value: true, label: 'Tampilkan sudut ikatan' },
        { type: 'segment', id: 'gaya', value: 'tongkat', label: 'Gaya gambar', options: [
          { value: 'tongkat', label: 'Bola-tongkat' }, { value: 'penuh', label: 'Ruang penuh' }
        ]}
      ]}
    ],

    baca: [
      { id: 'molekul', label: 'Molekul', tone: 'aksen' },
      { id: 'notasi', label: 'Notasi VSEPR' },
      { id: 'bentuk', label: 'Bentuk molekul' },
      { id: 'sudut', label: 'Sudut ikatan' },
      { id: 'polar', label: 'Kepolaran' }
    ],

    bangun: function (s) {
      s.data.w = new T.Group();
      s.tambah(s.data.w);
      const lbl = S.teks('', { skala: 0.44, lebar: 16, warna: '#d8e4ec' });
      lbl.position.set(0, 2.9, 0);
      s.data.lbl = lbl;
      s.tambah(lbl);
      const ket = S.teks('', { skala: 0.26, lebar: 40, warna: '#9aa8b4' });
      ket.position.set(0, -2.5, 0);
      s.data.ket = ket;
      s.tambah(ket);
      pasang(s);
    },

    ubah: function (s) { pasang(s); },

    langkah: function (s, dt) {
      if (s.data.dipolTotal) {
        s.data.dipolTotal.scale.setScalar(1 + Math.sin(s.waktu * 2.4) * 0.05);
      }
    },

    bacaUbah: function (s) {
      const m = aktif(s);
      const b = bentukDari(m);
      s.baca('molekul', m.n);
      s.baca('notasi', 'AX' + m.x + (m.e ? 'E' + m.e : ''));
      s.baca('bentuk', b.n);
      s.baca('sudut', b.sudut);
      s.baca('polar', m.polar ? 'Polar' : 'Nonpolar', m.polar ? 'warn' : 'aksen');
    }
  };

  function aktif(s) {
    if (!s.get('sendiri')) return mol(s);
    const x = Math.round(s.get('x')), e = Math.round(s.get('e'));
    const b = BENTUK[x + '-' + e];
    return { n: 'AX' + x + (e ? 'E' + e : ''), pusat: 'C', luar: 'F',
      x: x, e: e, orde: 1, polar: e > 0 && !(x === 4 && e === 2) && !(x === 2 && e === 0),
      ket: b ? 'Bentuk ' + b.n.toLowerCase() : 'Gabungan ini tidak lazim' };
  }

  function bentukDari(m) {
    return BENTUK[m.x + '-' + m.e] || { n: 'tidak lazim', sudut: '—', arah: [] };
  }

  function pasang(s) {
    const m = aktif(s);
    const b = bentukDari(m);
    const w = s.data.w;
    while (w.children.length) { const c = w.children.pop(); S.buangObjek(c); }
    s.data.dipolTotal = null;

    const penuh = s.get('gaya') === 'penuh';
    const skalaP = penuh ? 1.0 : 0.46;
    const skalaL = penuh ? 0.9 : 0.36;
    const jarak = penuh ? 1.15 : 1.45;

    const pusat = S.atom(m.pusat, null, { skala: skalaP });
    w.add(pusat);
    const tp = S.teks(m.pusat === 'X' ? 'Xe' : m.pusat,
      { skala: 0.26, latar: false, warna: '#ffffff', depthTest: false });
    tp.renderOrder = 10;
    w.add(tp);

    const arah = (b.arah || []).map(function (a) { return new T.Vector3(a[0], a[1], a[2]).normalize(); });
    const dipol = new T.Vector3();

    arah.forEach(function (a, i) {
      const p = a.clone().multiplyScalar(jarak);
      const at = S.atom(m.luar, null, { skala: skalaL });
      at.position.copy(p);
      w.add(at);
      if (!penuh) {
        w.add(S.ikatan([0, 0, 0], p, { orde: m.orde, tebal: 0.075 }));
      }
      // dipol ikatan menunjuk ke atom yang lebih elektronegatif
      dipol.add(a.clone().multiplyScalar(-1));
      if (s.get('dipol') && !penuh) {
        const d = S.panah(a.clone().multiplyScalar(jarak * 0.35),
          a.clone().multiplyScalar(jarak * 0.82), { warna: 0xf0718f, tebal: 0.028, kepala: 0.16 });
        w.add(d);
      }
    });

    // pasangan bebas sebagai awan
    if (s.get('bebas')) {
      (b.bebas || []).forEach(function (a) {
        const v = new T.Vector3(a[0], a[1], a[2]).normalize().multiplyScalar(jarak * 0.72);
        const awan = new T.Mesh(new T.SphereGeometry(0.42, 28, 20),
          new T.MeshPhysicalMaterial({
            color: 0xb795f0, roughness: 0.25, transmission: 0.4, thickness: 0.4,
            transparent: true, opacity: 0.38, emissive: 0xb795f0, emissiveIntensity: 0.18,
            depthWrite: false
          }));
        awan.scale.set(0.8, 0.8, 1.4);
        awan.position.copy(v);
        awan.lookAt(0, 0, 0);
        awan.renderOrder = 2;
        w.add(awan);
        // pasangan bebas juga menyumbang dipol
        dipol.add(v.clone().normalize().multiplyScalar(1.4));
      });
    } else {
      (b.bebas || []).forEach(function (a) {
        dipol.add(new T.Vector3(a[0], a[1], a[2]).normalize().multiplyScalar(1.4));
      });
    }

    // dipol total
    if (s.get('dipol') && dipol.length() > 0.12) {
      const d = S.panah([0, 0, 0], dipol.clone().normalize().multiplyScalar(2.2),
        { warna: 0xf0c04a, tebal: 0.05, kepala: 0.3 });
      w.add(d);
      s.data.dipolTotal = d;
      const t = S.teks('dipol total', { skala: 0.17, lebar: 11, warna: '#f0c04a' });
      t.position.copy(dipol.clone().normalize().multiplyScalar(2.95));
      w.add(t);
    }

    // sudut ikatan
    if (s.get('sudutT') && arah.length >= 2) {
      const a1 = arah[0], a2 = arah[1];
      const sudut = Math.acos(S.clamp(a1.dot(a2), -1, 1));
      const titik = [];
      const n = 26;
      const sumbu = new T.Vector3().crossVectors(a1, a2).normalize();
      for (let i = 0; i <= n; i++) {
        const v = a1.clone().applyAxisAngle(sumbu, sudut * i / n).multiplyScalar(jarak * 0.52);
        titik.push(v);
      }
      const busur = new T.Line(new T.BufferGeometry().setFromPoints(titik),
        new T.LineBasicMaterial({ color: 0x7fe3d6, transparent: true, opacity: 0.8 }));
      w.add(busur);
      const tengah = a1.clone().applyAxisAngle(sumbu, sudut / 2).multiplyScalar(jarak * 0.68);
      const t = S.teks(Math.round(sudut * 180 / Math.PI) + '°',
        { skala: 0.24, lebar: 5, warna: '#7fe3d6' });
      t.position.copy(tengah);
      w.add(t);
    }

    s.data.lbl.userData.ganti(m.n + ' — ' + b.n, m.polar ? '#f0c88a' : '#9fe8ad');
    s.data.ket.userData.ganti(m.ket);
    s.orbit.set({ jarak: penuh ? 5.6 : 7.0 });
  }
})());
