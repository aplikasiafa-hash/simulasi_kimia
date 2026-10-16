/* Larutan Elektrolit dan Nonelektrolit — Fase E — adegan 3D */

Sim3D.daftar('larutan-elektrolit', (function () {
  'use strict';
  const T = THREE, S = S3;

  /* alfa = derajat ionisasi, n = jumlah ion per rumus */
  const ZAT = [
    { n: 'NaCl — garam dapur', alfa: 1.00, ion: 2, k: '#f2f4f6', a: '#9fe8ad', warna: 0xdfe8ee, jenis: 'kuat' },
    { n: 'HCl — asam klorida', alfa: 1.00, ion: 2, k: '#ef6a52', a: '#9fe8ad', warna: 0xe8eef2, jenis: 'kuat' },
    { n: 'NaOH — natrium hidroksida', alfa: 1.00, ion: 2, k: '#f2f4f6', a: '#6fb6ff', warna: 0xe4eef4, jenis: 'kuat' },
    { n: 'H₂SO₄ — asam sulfat', alfa: 1.00, ion: 3, k: '#ef6a52', a: '#f0d040', warna: 0xeef2f6, jenis: 'kuat' },
    { n: 'CuSO₄ — tembaga(II) sulfat', alfa: 1.00, ion: 2, k: '#4a9fd8', a: '#f0d040', warna: 0x3f8fd0, jenis: 'kuat' },
    { n: 'KNO₃ — kalium nitrat', alfa: 1.00, ion: 2, k: '#c58ef0', a: '#6fb6ff', warna: 0xe8eef2, jenis: 'kuat' },
    { n: 'CH₃COOH — asam cuka', alfa: 0.013, ion: 2, k: '#ef6a52', a: '#f0a94a', warna: 0xf0ead8, jenis: 'lemah' },
    { n: 'NH₃ — amonia', alfa: 0.013, ion: 2, k: '#8fd8ff', a: '#6fb6ff', warna: 0xe2f0f6, jenis: 'lemah' },
    { n: 'H₂CO₃ — asam karbonat', alfa: 0.002, ion: 2, k: '#ef6a52', a: '#9aa8b4', warna: 0xe6eef2, jenis: 'lemah' },
    { n: 'HF — asam fluorida', alfa: 0.080, ion: 2, k: '#ef6a52', a: '#a8e85c', warna: 0xe8f0f2, jenis: 'lemah' },
    { n: 'C₆H₁₂O₆ — gula', alfa: 0.00, ion: 0, k: '#dfe8ee', a: '#dfe8ee', warna: 0xf0e8d4, jenis: 'non' },
    { n: 'C₂H₅OH — alkohol', alfa: 0.00, ion: 0, k: '#dfe8ee', a: '#dfe8ee', warna: 0xeef2f4, jenis: 'non' },
    { n: 'CO(NH₂)₂ — urea', alfa: 0.00, ion: 0, k: '#dfe8ee', a: '#dfe8ee', warna: 0xf2f2ee, jenis: 'non' },
    { n: 'Air murni (akuades)', alfa: 0.0000002, ion: 2, k: '#ef6a52', a: '#6fb6ff', warna: 0xd8ecf6, jenis: 'non' }
  ];

  const NION = 90;

  function zat(s) { return ZAT[parseInt(s.get('z'), 10) || 0]; }

  /* hantaran relatif 0..1 */
  function hantar(s) {
    const z = zat(s), c = s.get('c');
    const n = z.alfa * z.ion * c;
    return S.clamp(Math.pow(n / 1.9, 0.62), 0, 1);
  }

  return {
    latar: 0x070d13,
    kamera: { jarak: 9.6, phi: 1.06, theta: 0.62, targetY: 1.6, lajuPutar: 0.1 },

    kendali: [
      { judul: 'Larutan', isi: [
        { type: 'select', id: 'z', value: 0, label: 'Zat yang dilarutkan',
          options: ZAT.map(function (z, i) { return { value: i, label: z.n }; }) },
        { type: 'slider', id: 'c', value: 1, min: 0.01, max: 2, step: 0.01,
          label: 'Konsentrasi', unit: ' M', dec: 2 }
      ]},
      { judul: 'Rangkaian', isi: [
        { type: 'segment', id: 'elektrode', value: 'karbon', label: 'Bahan elektrode', options: [
          { value: 'karbon', label: 'Karbon' },
          { value: 'tembaga', label: 'Tembaga' },
          { value: 'seng', label: 'Seng' }
        ]},
        { type: 'toggle', id: 'saklar', value: true, label: 'Saklar tersambung' },
        { type: 'slider', id: 'tegangan', value: 9, min: 1.5, max: 12, step: 0.5,
          label: 'Tegangan baterai', unit: ' V', dec: 1 }
      ]},
      { judul: 'Tampilan', isi: [
        { type: 'toggle', id: 'ion', value: true, label: 'Tampilkan ion bergerak' },
        { type: 'toggle', id: 'gas', value: true, label: 'Tampilkan gelembung gas' },
        { type: 'toggle', id: 'medan', value: false, label: 'Tampilkan arah medan listrik' }
      ]}
    ],

    baca: [
      { id: 'jenis', label: 'Golongan larutan', tone: 'aksen' },
      { id: 'alfa', label: 'Derajat ionisasi α' },
      { id: 'ion', label: 'Ion dalam larutan' },
      { id: 'hantar', label: 'Daya hantar' },
      { id: 'lampu', label: 'Keadaan lampu' }
    ],

    bangun: function (s) {
      s.tambah(S.lantai({ r: 8, warna: 0x0d141c }));

      /* ---------- gelas berisi larutan ---------- */
      const gls = S.gelas({ r: 1.5, h: 2.1, level: 0.74, warna: 0xdfe8ee, opacity: 0.6 });
      gls.position.y = 0.05;
      s.data.gls = gls;
      s.tambah(gls);

      /* ---------- dua elektrode ---------- */
      function buatElektrode(x) {
        const g = new T.Group();
        const bilah = new T.Mesh(new T.BoxGeometry(0.4, 2.6, 0.1), S.matLogam(0x2b3238, { roughness: 0.6 }));
        bilah.position.y = 1.35;
        bilah.castShadow = true;
        g.add(bilah);
        const jepit = new T.Mesh(new T.BoxGeometry(0.3, 0.22, 0.26), S.matLogam(0xc8ced4));
        jepit.position.y = 2.62;
        g.add(jepit);
        g.position.x = x;
        g.userData.bilah = bilah;
        return g;
      }
      const eA = buatElektrode(-0.82);   // anode (+)
      const eK = buatElektrode(0.82);    // katode (−)
      s.data.eA = eA; s.data.eK = eK;
      s.tambah(eA); s.tambah(eK);

      const lblA = S.teks('+ anode', { skala: 0.3, lebar: 12, warna: '#ef6a52' });
      lblA.position.set(-0.82, 3.0, 0.3);
      const lblK = S.teks('− katode', { skala: 0.3, lebar: 12, warna: '#6fb6ff' });
      lblK.position.set(0.82, 3.0, 0.3);
      s.tambah(lblA); s.tambah(lblK);

      /* ---------- kabel + baterai + lampu ---------- */
      function kabel(titik, warna) {
        const kurva = new T.CatmullRomCurve3(titik.map(function (t) {
          return new T.Vector3(t[0], t[1], t[2]);
        }));
        const m = new T.Mesh(new T.TubeGeometry(kurva, 48, 0.045, 10, false),
          new T.MeshStandardMaterial({ color: warna, roughness: 0.5 }));
        return m;
      }
      s.tambah(kabel([[-0.82, 2.7, 0], [-1.9, 3.5, 0], [-2.6, 4.1, 0], [-1.3, 4.6, 0]], 0xd04a3a));
      s.tambah(kabel([[0.82, 2.7, 0], [1.9, 3.5, 0], [2.6, 4.1, 0], [1.5, 4.6, 0]], 0x2c3b4a));

      // dudukan lampu
      const dudukan = new T.Mesh(new T.CylinderGeometry(0.26, 0.3, 0.34, 24), S.matLogam(0xb9c0c7));
      dudukan.position.set(0, 4.62, 0);
      s.tambah(dudukan);
      const bola = new T.Mesh(S.geoBola(28), new T.MeshPhysicalMaterial({
        color: 0xfff2cc, emissive: 0xffd480, emissiveIntensity: 0,
        roughness: 0.12, transparent: true, opacity: 0.62, transmission: 0.5
      }));
      bola.position.set(0, 5.08, 0);
      bola.scale.set(0.38, 0.44, 0.38);
      s.data.bola = bola;
      s.tambah(bola);

      const cahaya = new T.PointLight(0xffd480, 0, 7, 2);
      cahaya.position.set(0, 5.08, 0);
      s.data.cahaya = cahaya;
      s.tambah(cahaya);

      // filamen
      const fil = new T.Mesh(new T.TorusGeometry(0.1, 0.014, 8, 20),
        new T.MeshStandardMaterial({ color: 0x3b2a18, emissive: 0xffaa33, emissiveIntensity: 0 }));
      fil.position.set(0, 5.02, 0);
      fil.rotation.x = Math.PI / 2;
      s.data.fil = fil;
      s.tambah(fil);

      // baterai
      const bat = new T.Group();
      const badan = new T.Mesh(new T.CylinderGeometry(0.3, 0.3, 1.2, 28),
        new T.MeshStandardMaterial({ color: 0x1f2a33, roughness: 0.45, metalness: 0.4 }));
      badan.rotation.z = Math.PI / 2;
      bat.add(badan);
      const kutub = new T.Mesh(new T.CylinderGeometry(0.1, 0.1, 0.16, 18), S.matLogam(0xd8c080));
      kutub.rotation.z = Math.PI / 2;
      kutub.position.x = 0.68;
      bat.add(kutub);
      bat.position.set(-2.9, 4.4, 0);
      bat.rotation.z = -0.35;
      s.tambah(bat);
      const lblV = S.teks('9,0 V', { skala: 0.28, lebar: 10, warna: '#f0d040' });
      lblV.position.set(-2.9, 3.85, 0);
      s.data.lblV = lblV;
      s.tambah(lblV);

      // saklar
      const sPapan = new T.Mesh(new T.BoxGeometry(0.7, 0.1, 0.4),
        new T.MeshStandardMaterial({ color: 0x27323c, roughness: 0.6 }));
      sPapan.position.set(2.9, 4.4, 0);
      s.tambah(sPapan);
      const tuas = new T.Mesh(new T.BoxGeometry(0.56, 0.07, 0.1), S.matLogam(0xd0a84a));
      tuas.position.set(2.72, 4.5, 0);
      tuas.geometry.translate(0.28, 0, 0);
      tuas.geometry.translate(-0.28, 0, 0);
      s.data.tuas = tuas;
      s.tambah(tuas);

      /* ---------- ion ---------- */
      const kation = S.partikel(NION, { r: 0.085, warna: 0xef6a52, kotak: { x: 1.3, y: 0.7, z: 1.3 } });
      const anion = S.partikel(NION, { r: 0.105, warna: 0x6fb6ff, kotak: { x: 1.3, y: 0.7, z: 1.3 } });
      [kation, anion].forEach(function (p) {
        p.material.transparent = true;
        p.material.opacity = 0.95;
        s.tambah(p);
      });
      s.data.kation = kation; s.data.anion = anion;

      // molekul utuh (untuk nonelektrolit / sisa yang tak terionisasi)
      const utuh = S.partikel(NION, { r: 0.12, warna: 0xf0e8d4, kotak: { x: 1.3, y: 0.7, z: 1.3 } });
      utuh.material.transparent = true; utuh.material.opacity = 0.88;
      s.data.utuh = utuh;
      s.tambah(utuh);

      /* ---------- gelembung di tiap elektrode ---------- */
      const gA = S.gelembung({ n: 34, sebar: 0.2, tinggi: 1.5, warna: 0xdff2ff });
      gA.position.set(-0.82, 0.12, 0);
      const gK = S.gelembung({ n: 34, sebar: 0.2, tinggi: 1.5, warna: 0xdff2ff });
      gK.position.set(0.82, 0.12, 0);
      s.data.gA = gA; s.data.gK = gK;
      s.tambah(gA); s.tambah(gK);

      /* ---------- panah medan listrik ---------- */
      const medan = new T.Group();
      for (let i = -1; i <= 1; i++) {
        for (let j = 0; j < 2; j++) {
          const y = 0.5 + j * 0.7;
          const p = S.panah([0.5, y, i * 0.55], [-0.5, y, i * 0.55],
            { warna: 0xf0d040, tebal: 0.028, kepala: 0.18 });
          medan.add(p);
        }
      }
      medan.visible = false;
      s.data.medan = medan;
      s.tambah(medan);

      const lbl = S.teks('', { skala: 0.4, lebar: 30, warna: '#d8e4ec' });
      lbl.position.set(0, 6.0, 0);
      s.data.lbl = lbl;
      s.tambah(lbl);

      pasang(s);
    },

    ubah: function (s, id) {
      if (id === 'z' || id === 'c') pasang(s);
      if (id === 'elektrode') {
        const w = s.get('elektrode') === 'tembaga' ? 0xb87333
          : s.get('elektrode') === 'seng' ? 0xa8b2ba : 0x2b3238;
        [s.data.eA, s.data.eK].forEach(function (e) {
          e.userData.bilah.material.color.setHex(w);
          e.userData.bilah.material.metalness = s.get('elektrode') === 'karbon' ? 0.25 : 0.95;
          e.userData.bilah.material.roughness = s.get('elektrode') === 'karbon' ? 0.72 : 0.3;
        });
      }
      if (id === 'ion') {
        s.data.kation.visible = s.get('ion');
        s.data.anion.visible = s.get('ion');
        s.data.utuh.visible = s.get('ion');
      }
      if (id === 'medan') s.data.medan.visible = s.get('medan');
      if (id === 'tegangan') s.data.lblV.userData.ganti(S.fmt(s.get('tegangan'), 1) + ' V');
    },

    langkah: function (s, dt) {
      const z = zat(s);
      const on = s.get('saklar');
      const tarik = on ? S.clamp(s.get('tegangan') / 9, 0, 1.6) : 0;
      const h = on ? hantar(s) : 0;

      // tuas saklar
      s.data.tuas.rotation.z = S.lerp(s.data.tuas.rotation.z, on ? 0 : 0.5, dt * 8);

      // gerak ion: hanyut ke elektrode berlawanan + gerak acak
      gerakIon(s, s.data.kation, -1, tarik, dt);
      gerakIon(s, s.data.anion, 1, tarik, dt);
      gerakIon(s, s.data.utuh, 0, 0, dt);

      // nyala lampu
      const nyala = h;
      s.data.bola.material.emissiveIntensity = nyala * 2.6;
      s.data.fil.material.emissiveIntensity = nyala * 4.5;
      s.data.cahaya.intensity = nyala * 9;
      s.data.bola.material.opacity = 0.62 + nyala * 0.3;

      // gelembung gas di elektrode
      const gasOn = s.get('gas') ? h : 0;
      s.data.gA.userData.perbarui(dt, gasOn * 1.5);
      s.data.gK.userData.perbarui(dt, gasOn * 2.2);

      // medan berkedip pelan
      if (s.data.medan.visible) {
        s.data.medan.children.forEach(function (p, i) {
          p.children.forEach(function (m) {
            m.material.emissiveIntensity = 0.2 + 0.25 * (0.5 + 0.5 * Math.sin(s.waktu * 3 - i * 0.6));
          });
        });
      }
      s.data.h = h;
    },

    bacaUbah: function (s) {
      const z = zat(s);
      const on = s.get('saklar');
      const h = on ? hantar(s) : 0;
      const nama = z.jenis === 'kuat' ? 'Elektrolit kuat'
        : z.jenis === 'lemah' ? 'Elektrolit lemah' : 'Nonelektrolit';
      s.baca('jenis', nama, z.jenis === 'kuat' ? 'aksen' : z.jenis === 'lemah' ? 'warn' : 'danger');
      s.baca('alfa', z.alfa >= 0.999 ? '1 (terionisasi sempurna)'
        : z.alfa < 1e-5 ? '≈ 0' : S.fmtRapi(z.alfa));
      const nIon = z.alfa * z.ion * s.get('c');
      s.baca('ion', z.ion === 0 ? 'Tidak ada ion — molekul utuh'
        : S.fmt(nIon, nIon < 0.01 ? 4 : 3) + ' mol/L');
      s.baca('hantar', Math.round(h * 100) + ' %', h > 0.6 ? 'aksen' : h > 0.08 ? 'warn' : 'danger');
      s.baca('lampu', !on ? 'Saklar terbuka — rangkaian terputus'
        : h > 0.6 ? 'Menyala terang + banyak gelembung'
          : h > 0.08 ? 'Menyala redup / gelembung sedikit'
            : 'Tidak menyala',
        !on ? undefined : h > 0.6 ? 'aksen' : h > 0.08 ? 'warn' : 'danger');
    }
  };

  function gerakIon(s, p, arah, tarik, dt) {
    const d = p.userData.p;
    for (let i = 0; i < d.length; i++) {
      const q = d[i];
      if (!q.aktif) continue;
      q.pos.x += (q.vel.x * 0.5 + arah * tarik * 0.85) * dt;
      q.pos.y += q.vel.y * 0.4 * dt;
      q.pos.z += q.vel.z * 0.5 * dt;
      if (q.pos.y > 1.55) { q.pos.y = 1.55; q.vel.y *= -1; }
      if (q.pos.y < 0.18) { q.pos.y = 0.18; q.vel.y *= -1; }
      if (Math.abs(q.pos.z) > 1.3) { q.pos.z = Math.sign(q.pos.z) * 1.3; q.vel.z *= -1; }
      // sampai di elektrode → lahir kembali di tengah
      if (arah !== 0 && arah * q.pos.x < -0.72) {
        q.pos.set(S.acak(-0.45, 0.45), S.acak(0.3, 1.4), S.acak(-1.1, 1.1));
      } else if (Math.abs(q.pos.x) > 1.32) {
        q.pos.x = Math.sign(q.pos.x) * 1.32; q.vel.x *= -1;
      }
    }
    p.userData.tulis();
  }

  function pasang(s) {
    const z = zat(s);
    const c = s.get('c');
    s.data.gls.userData.setLevel(0.74, z.warna);
    s.data.gls.userData.cair.material.opacity = 0.42 + S.clamp(c * 0.14, 0, 0.3);

    // banyaknya ion & molekul utuh mengikuti konsentrasi dan derajat ionisasi
    const total = Math.round(S.clamp(c / 2, 0.06, 1) * NION);
    const terion = Math.round(total * S.clamp(z.alfa * 1, 0, 1));
    const sisa = total - terion;

    atur(s.data.kation, terion, z.k, z.ion >= 3 ? 0.075 : 0.085);
    atur(s.data.anion, Math.max(0, Math.round(terion / (z.ion >= 3 ? 2 : 1))), z.a, 0.105);
    atur(s.data.utuh, z.ion === 0 ? total : sisa, '#f0e8d4', 0.12);

    [s.data.kation, s.data.anion, s.data.utuh].forEach(function (p) {
      p.visible = s.get('ion');
    });
    s.data.lbl.userData.ganti(z.n);
    s.data.lblV.userData.ganti(S.fmt(s.get('tegangan'), 1) + ' V');
  }

  function atur(p, n, warna, r) {
    p.material.color.set(warna);
    p.material.emissive.set(warna);
    const d = p.userData.p;
    for (let i = 0; i < d.length; i++) {
      d[i].aktif = i < n;
      d[i].r = r;
      if (i < n && d[i].pos.lengthSq() < 0.001) {
        d[i].pos.set(S.acak(-1.1, 1.1), S.acak(0.3, 1.4), S.acak(-1.1, 1.1));
      }
    }
    p.userData.tulis();
  }
})());
