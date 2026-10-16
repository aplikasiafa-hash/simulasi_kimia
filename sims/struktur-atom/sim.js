/* Struktur Atom, Isotop, dan Ion — Fase E — adegan 3D */

Sim3D.daftar('struktur-atom', (function () {
  'use strict';
  const T = THREE, S = S3;

  const NAMA = ['', 'Hidrogen', 'Helium', 'Litium', 'Berilium', 'Boron', 'Karbon',
    'Nitrogen', 'Oksigen', 'Fluor', 'Neon', 'Natrium', 'Magnesium', 'Aluminium',
    'Silikon', 'Fosforus', 'Belerang', 'Klorin', 'Argon', 'Kalium', 'Kalsium'];
  const LAMBANG = ['', 'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne',
    'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca'];
  const NETRON_LAZIM = [0, 0, 2, 4, 5, 6, 6, 7, 8, 10, 10, 12, 12, 14, 14, 16, 16, 18, 22, 20, 20];
  const KAPASITAS = [2, 8, 8, 18];

  function kulitDari(e) {
    const out = [];
    let sisa = e, i = 0;
    while (sisa > 0 && i < 4) {
      const n = Math.min(sisa, KAPASITAS[i]);
      out.push(n); sisa -= n; i++;
    }
    return out;
  }

  return {
    latar: 0x05090e,
    kamera: { jarak: 9.2, phi: 0.92, theta: 0.6, targetY: 0, lajuPutar: 0.2 },

    kendali: [
      { judul: 'Susun atom', isi: [
        { type: 'slider', id: 'p', value: 6, min: 1, max: 20, step: 1,
          label: 'Proton (nomor atom Z)', unit: '', dec: 0 },
        { type: 'slider', id: 'n', value: 6, min: 0, max: 24, step: 1,
          label: 'Netron', unit: '', dec: 0 },
        { type: 'slider', id: 'e', value: 6, min: 0, max: 20, step: 1,
          label: 'Elektron', unit: '', dec: 0 },
        { type: 'buttons', label: '', items: [
          { label: '⚖ Jadikan netral', utama: true, klik: function (s) { s.set('e', Math.round(s.get('p'))); } },
          { label: '🔁 Netron lazim', klik: function (s) {
            s.set('n', NETRON_LAZIM[Math.round(s.get('p'))] || Math.round(s.get('p')));
          } }
        ]}
      ]},
      { judul: 'Tampilan', isi: [
        { type: 'toggle', id: 'kulit', value: true, label: 'Tampilkan garis kulit' },
        { type: 'toggle', id: 'label', value: true, label: 'Tampilkan notasi atom' },
        { type: 'toggle', id: 'belah', value: false, label: 'Belah inti agar terlihat' },
        { type: 'slider', id: 'zoomInti', value: 1, min: 0.5, max: 3, step: 0.1,
          label: 'Perbesaran inti', unit: '×', dec: 1 }
      ]}
    ],

    baca: [
      { id: 'unsur', label: 'Unsur', tone: 'aksen' },
      { id: 'notasi', label: 'Notasi' },
      { id: 'massa', label: 'Nomor massa (A)' },
      { id: 'muatan', label: 'Muatan' },
      { id: 'jenis', label: 'Keterangan' }
    ],

    bangun: function (s) {
      s.data.inti = new T.Group();
      s.data.kulitG = new T.Group();
      s.tambah(s.data.inti);
      s.tambah(s.data.kulitG);

      const lbl = S.teks('', { skala: 0.46, lebar: 16, warna: '#d8e4ec' });
      lbl.position.set(0, 4.0, 0);
      s.data.lbl = lbl;
      s.tambah(lbl);

      const not = S.teks('', { skala: 0.4, lebar: 8, warna: '#7fe3d6' });
      not.position.set(0, -2.9, 0);
      s.data.not = not;
      s.tambah(not);

      // kunci warna
      const kunci = new T.Group();
      [['Proton +', 0xe0533d], ['Netron 0', 0x8793a0], ['Elektron −', 0x5b9bf5]].forEach(function (k, i) {
        const b = S.atom('X', null, { skala: 0.13, warna: k[1] });
        b.position.set(-4.2, 2.6 - i * 0.44, 0);
        kunci.add(b);
        const t = S.teks(k[0], { skala: 0.21, lebar: 10, latar: false, warna: '#9aa8b4' });
        t.position.set(-3.5, 2.6 - i * 0.44, 0);
        kunci.add(t);
      });
      s.data.kunci = kunci;
      s.tambah(kunci);

      pasang(s);
    },

    ubah: function (s, id) {
      if (id === 'p') {
        const z = Math.round(s.get('p'));
        s.setDiam('n', NETRON_LAZIM[z] || z);
        s.setDiam('e', z);
      }
      pasang(s);
    },

    langkah: function (s, dt) {
      (s.data.el || []).forEach(function (e) {
        const u = e.userData;
        u.sudut += dt * u.laju;
        const p = new T.Vector3(Math.cos(u.sudut) * u.r, 0, Math.sin(u.sudut) * u.r);
        p.applyAxisAngle(new T.Vector3(1, 0, 0), u.miring);
        e.position.copy(p);
      });
      (s.data.nuk || []).forEach(function (m, i) {
        m.position.copy(m.userData.asal).add(new T.Vector3(
          Math.sin(s.waktu * 5 + i * 1.7) * 0.012,
          Math.sin(s.waktu * 6 + i * 2.3) * 0.012,
          Math.cos(s.waktu * 5.5 + i) * 0.012));
      });
    },

    bacaUbah: function (s) {
      const z = Math.round(s.get('p')), n = Math.round(s.get('n')), e = Math.round(s.get('e'));
      const muatan = z - e;
      s.baca('unsur', (NAMA[z] || '—') + ' (' + (LAMBANG[z] || '?') + ')');
      s.baca('notasi', S.sup(String(z + n)) + LAMBANG[z] + (muatan ? S.sup((Math.abs(muatan) > 1 ? Math.abs(muatan) : '') + (muatan > 0 ? '+' : '−')) : ''));
      s.baca('massa', (z + n) + '  (' + z + ' p + ' + n + ' n)');
      s.baca('muatan', muatan === 0 ? 'netral (0)' : (muatan > 0 ? '+' : '') + muatan,
        muatan === 0 ? 'aksen' : muatan > 0 ? 'danger' : 'biru');
      const lazim = NETRON_LAZIM[z];
      s.baca('jenis', muatan > 0 ? 'Ion positif (kation)'
        : muatan < 0 ? 'Ion negatif (anion)'
        : n !== lazim ? 'Isotop ' + LAMBANG[z] + '-' + (z + n) : 'Atom netral biasa');
    }
  };

  function pasang(s) {
    const z = Math.round(s.get('p')), n = Math.round(s.get('n')), e = Math.round(s.get('e'));
    const inti = s.data.inti, kul = s.data.kulitG;
    while (inti.children.length) { const c = inti.children.pop(); S.buangObjek(c); }
    while (kul.children.length) { const c = kul.children.pop(); S.buangObjek(c); }
    s.data.el = []; s.data.nuk = [];

    /* --- inti: proton dan netron tersusun rapat --- */
    const zoom = s.get('zoomInti');
    const total = z + n;
    const rInti = Math.cbrt(total) * 0.11 * zoom;
    const titik = kemasBola(total, rInti);
    for (let i = 0; i < total; i++) {
      const proton = i < z;
      const m = S.atom('X', null, {
        skala: 0.1 * zoom,
        warna: proton ? 0xe0533d : 0x8793a0
      });
      m.position.copy(titik[i]);
      if (s.get('belah') && m.position.z > 0) continue;
      m.userData.asal = m.position.clone();
      inti.add(m);
      s.data.nuk.push(m);
    }
    const halo = new T.Mesh(new T.SphereGeometry(rInti + 0.14 * zoom, 32, 24),
      new T.MeshBasicMaterial({ color: 0xe0533d, transparent: true, opacity: 0.055 }));
    inti.add(halo);

    /* --- kulit elektron --- */
    const kulit = kulitDari(e);
    const radius = [1.5, 2.3, 3.0, 3.6];
    kulit.forEach(function (isi, k) {
      const r = radius[k];
      if (s.get('kulit')) {
        const lingkar = new T.Mesh(new T.TorusGeometry(r, 0.011, 8, 110),
          new T.MeshBasicMaterial({ color: 0x4fd1c0, transparent: true, opacity: 0.35 }));
        lingkar.rotation.x = Math.PI / 2;
        kul.add(lingkar);
      }
      for (let i = 0; i < isi; i++) {
        const el = S.atom('X', null, { skala: 0.14, warna: 0x5b9bf5 });
        el.userData = {
          sudut: i / isi * Math.PI * 2 + k * 0.4, r: r,
          laju: 1.5 / Math.sqrt(r), miring: Math.PI / 2
        };
        kul.add(el);
        s.data.el.push(el);
      }
      if (s.get('label')) {
        const t = S.teks('KLMN'[k] + ' : ' + isi, { skala: 0.21, lebar: 7, warna: '#7fe3d6' });
        const a = -Math.PI / 2 + k * 0.34;
        t.position.set(Math.cos(a) * (r + 0.3), 0.1 + k * 0.1, Math.sin(a) * (r + 0.3));
        kul.add(t);
      }
    });

    const muatan = z - e;
    s.data.lbl.userData.ganti((NAMA[z] || '?') + (muatan ? (muatan > 0 ? '  ion ' + muatan + '+' : '  ion ' + (-muatan) + '−') : ''),
      muatan === 0 ? '#d8e4ec' : muatan > 0 ? '#f6a898' : '#9fc0f8');
    s.data.not.userData.ganti(
      S.sup(String(z + n)) + '/' + S.sub(String(z)) + ' ' + (LAMBANG[z] || '?'));
    s.data.not.visible = s.get('label');
    s.data.kunci.visible = s.get('label');
  }

  /** Susun n titik rapat di dalam bola berjari-jari r. */
  function kemasBola(n, r) {
    const out = [];
    const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const k = Math.cbrt((i + 0.5) / n) * r;
      const y = 1 - (i / Math.max(1, n - 1)) * 2;
      const rad = Math.sqrt(Math.max(0, 1 - y * y));
      const th = phi * i;
      out.push(new T.Vector3(Math.cos(th) * rad * k, y * k, Math.sin(th) * rad * k));
    }
    return out;
  }
})());
