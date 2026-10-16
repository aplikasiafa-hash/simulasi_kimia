/* Campuran dan Cara Memisahkannya — Fase C
   Susun campuran dari beberapa bahan, pilih metode pemisahan, jalankan, dan
   lihat komponen mana yang berhasil terpisah dan mana yang belum. */

(function () {
  'use strict';

  const D = Sim.Draw, P = Sim.P;

  const KOMPONEN = {
    pasir:  { nama: 'Pasir',       warna: '#d8c08a', larut: false, magnet: false, rho: 2.6, uap: false },
    garam:  { nama: 'Garam',       warna: '#ffffff', larut: true,  magnet: false, rho: 2.2, uap: false },
    besi:   { nama: 'Serbuk besi', warna: '#8d939a', larut: false, magnet: true,  rho: 7.9, uap: false },
    kapur:  { nama: 'Kapur',       warna: '#f0f0ea', larut: false, magnet: false, rho: 2.7, uap: false },
    minyak: { nama: 'Minyak',      warna: '#e8c84a', larut: false, magnet: false, rho: 0.9, uap: false },
    air:    { nama: 'Air',         warna: '#4a9fd0', larut: true,  magnet: false, rho: 1.0, uap: true }
  };

  const RESEP = [
    { id: 'pasir-air',   label: 'Pasir + air',              isi: ['pasir', 'air'] },
    { id: 'garam-air',   label: 'Garam + air',              isi: ['garam', 'air'] },
    { id: 'besi-pasir',  label: 'Serbuk besi + pasir',      isi: ['besi', 'pasir'] },
    { id: 'minyak-air',  label: 'Minyak + air',             isi: ['minyak', 'air'] },
    { id: 'kapur-air',   label: 'Kapur + air',              isi: ['kapur', 'air'] },
    { id: 'lengkap',     label: 'Pasir + garam + besi + air', isi: ['pasir', 'garam', 'besi', 'air'] }
  ];

  const METODE = {
    filtrasi: {
      nama: 'Penyaringan (filtrasi)',
      dasar: 'Memisahkan zat padat yang tidak larut dari cairannya.',
      bisa: function (k) { return !KOMPONEN[k].larut && k !== 'minyak' && k !== 'air'; }
    },
    penguapan: {
      nama: 'Penguapan',
      dasar: 'Menguapkan pelarut sehingga zat terlarut tertinggal sebagai kristal.',
      bisa: function (k) { return k === 'garam'; }
    },
    magnet: {
      nama: 'Penarikan magnet',
      dasar: 'Menarik komponen yang bersifat magnetis.',
      bisa: function (k) { return KOMPONEN[k].magnet; }
    },
    dekantasi: {
      nama: 'Pengendapan & dekantasi',
      dasar: 'Mendiamkan campuran lalu menuang cairan bening di bagian atas.',
      bisa: function (k) { return k === 'minyak' || k === 'pasir'; }
    }
  };

  const W = 790, H = 520;

  function resepAktif(sim) {
    return RESEP.find(function (r) { return r.id === sim.get('campuran'); }) || RESEP[0];
  }

  function siapkan(sim) {
    const r = resepAktif(sim);
    sim.data.terpisah = {};
    sim.data.anim = 0;
    sim.data.jalan = false;
    sim.data.pesan = 'Pilih metode pemisahan, lalu tekan Jalankan.';
    sim.data.butir = [];
    r.isi.forEach(function (k) {
      if (k === 'air' || k === 'minyak') return;
      for (let i = 0; i < 22; i++) {
        sim.data.butir.push({
          k: k, x: Sim.rnd(126, 254), y: Sim.rnd(150, 262),
          r: KOMPONEN[k].larut ? 2.2 : Sim.rnd(2.6, 4.6),
          ox: 0, oy: 0, keluar: false
        });
      }
    });
  }

  function jalankan(sim) {
    const r = resepAktif(sim);
    const m = sim.get('metode');
    const met = METODE[m];
    const berhasil = r.isi.filter(function (k) { return met.bisa(k) && !sim.data.terpisah[k]; });

    if (!berhasil.length) {
      sim.data.pesan = met.nama + ' tidak memisahkan apa pun dari campuran ini.';
      sim.data.jalan = true; sim.data.anim = 0;
      return;
    }
    berhasil.forEach(function (k) { sim.data.terpisah[k] = m; });
    sim.data.pesan = met.nama + ' berhasil memisahkan ' +
      berhasil.map(function (k) { return KOMPONEN[k].nama.toLowerCase(); }).join(' dan ') + '.';
    sim.data.jalan = true; sim.data.anim = 0;
  }

  Sim.create({
    title: 'Campuran dan Cara Memisahkannya',
    subtitle: 'Komponen dalam campuran tidak berubah menjadi zat lain, jadi selalu bisa dipisahkan kembali — asal kita memakai perbedaan sifat yang tepat.',
    fase: 'C', jenjang: 'SD Kelas 5–6',
    topik: ['Campuran', 'Pemisahan'],
    stage: { w: W, h: H },
    showPlay: false,

    controls: [
      {
        title: 'Campuran',
        items: [
          { type: 'select', id: 'campuran', value: 'pasir-air', label: 'Pilih campuran',
            options: RESEP.map(function (r) { return { value: r.id, label: r.label }; }) }
        ]
      },
      {
        title: 'Metode pemisahan',
        items: [
          { type: 'segment', id: 'metode', value: 'filtrasi', label: '',
            options: [
              { value: 'filtrasi', label: 'Saring' },
              { value: 'penguapan', label: 'Uapkan' },
              { value: 'magnet', label: 'Magnet' },
              { value: 'dekantasi', label: 'Endapkan' }
            ] },
          { type: 'buttons', label: '', items: [
            { label: '▶ Jalankan', primary: true, onClick: jalankan },
            { label: 'Ulangi dari awal', onClick: function (sim) { siapkan(sim); } }
          ] }
        ]
      }
    ],

    readouts: [
      { id: 'komponen', label: 'Jumlah komponen', tone: 'accent' },
      { id: 'sudah', label: 'Sudah terpisah' },
      { id: 'belum', label: 'Belum terpisah' }
    ],

    setup: siapkan,
    reset: siapkan,
    onChange: function (sim, id) { if (id === 'campuran') siapkan(sim); },

    update: function (sim, dt) {
      if (sim.data.jalan) {
        sim.data.anim += dt * 0.55;
        if (sim.data.anim >= 1) { sim.data.anim = 1; sim.data.jalan = false; }
      }
      const m = sim.get('metode');
      const a = sim.data.anim;
      sim.data.butir.forEach(function (b) {
        const terpisah = sim.data.terpisah[b.k];
        if (!terpisah) {
          b.oy += (0 - b.oy) * dt * 4;
          b.ox += (0 - b.ox) * dt * 4;
          return;
        }
        // pindahkan butir ke wadah hasil sesuai metodenya
        let tx = 0, ty = 0;
        if (terpisah === 'filtrasi') { tx = 0; ty = -58; }
        else if (terpisah === 'magnet') { tx = 0; ty = -96; }
        else if (terpisah === 'penguapan') { tx = 300; ty = 96; }
        else { tx = 300; ty = 30; }
        b.ox += (tx - b.ox) * Math.min(1, dt * 3.4);
        b.oy += (ty - b.oy) * Math.min(1, dt * 3.4);
      });
    },

    draw: function (c, sim) {
      const r = resepAktif(sim);
      const m = sim.get('metode');
      const met = METODE[m];
      const a = sim.data.anim;
      const adaAir = r.isi.indexOf('air') >= 0;
      const adaMinyak = r.isi.indexOf('minyak') >= 0;

      /* ---------- kiri: alat pemisah ---------- */
      const GX = 120, GY = 140, GW = 150, GH = 140;

      D.text(c, 'CAMPURAN AWAL', GX, 104,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
      D.text(c, r.label, GX, 124, { size: 15, weight: 650, color: P.text, base: 'middle' });

      if (m === 'filtrasi') {
        // corong + kertas saring di atas gelas
        const fx = GX + GW / 2;
        c.beginPath();
        c.moveTo(fx - 56, GY - 72); c.lineTo(fx + 56, GY - 72);
        c.lineTo(fx + 7, GY - 10); c.lineTo(fx - 7, GY - 10); c.closePath();
        c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 2.2; c.stroke();
        c.fillStyle = 'rgba(255,255,255,.05)'; c.fill();
        D.text(c, 'kertas saring', fx, GY - 86,
          { size: 10.5, weight: 600, color: P.dim, align: 'c', base: 'middle' });
        // tetesan filtrat
        if (sim.data.jalan || a > 0) {
          for (let i = 0; i < 4; i++) {
            const dy = ((sim.t * 90 + i * 24) % 44);
            D.circle(c, fx, GY - 6 + dy, 3, D.alpha('#4a9fd0', 0.8));
          }
        }
      } else if (m === 'magnet') {
        const mx = GX + GW / 2, my = GY - 92 + (1 - a) * 44;
        D.roundRect(c, mx - 30, my, 60, 22, 4, '#c23b3b', 'rgba(255,255,255,.3)', 1.4);
        D.roundRect(c, mx - 30, my, 30, 22, 4, '#3b6fc2');
        D.text(c, 'U', mx - 15, my + 11, { size: 12, weight: 800, color: '#fff', align: 'c', base: 'middle' });
        D.text(c, 'S', mx + 15, my + 11, { size: 12, weight: 800, color: '#fff', align: 'c', base: 'middle' });
      } else if (m === 'penguapan') {
        D.flame(c, GX + GW / 2, GY + GH + 30, 0.8, sim.t);
        D.roundRect(c, GX + GW / 2 - 16, GY + GH + 22, 32, 22, 4, '#3b434b', 'rgba(255,255,255,.2)', 1.2);
        for (let i = 0; i < 6; i++) {
          const uy = GY - 10 - ((sim.t * 42 + i * 22) % 72);
          D.circle(c, GX + 30 + i * 18 + Math.sin(sim.t * 2 + i) * 6, uy, 4 + i * 0.4,
            D.alpha('#bcd8e8', 0.3 * a));
        }
      } else {
        D.text(c, 'didiamkan…', GX + GW / 2, GY - 24,
          { size: 11.5, weight: 600, color: P.dim, align: 'c', base: 'middle' });
      }

      // gelas campuran
      const tersisaAir = adaAir && !(m === 'penguapan' && sim.data.terpisah['garam']);
      const level = m === 'penguapan' && sim.data.terpisah['garam'] ? 0.1 : 0.72;
      D.beaker(c, GX, GY, GW, GH, adaAir ? level : 0.3,
        adaAir ? D.alpha('#4a9fd0', 0.6) : 'rgba(255,255,255,.05)');

      // lapisan minyak terpisah saat dekantasi
      if (adaMinyak) {
        const sudah = sim.data.terpisah['minyak'];
        const ketebalan = 20;
        const topY = GY + GH * 0.28;
        if (!sudah) {
          D.roundRect(c, GX + 1, topY - ketebalan, GW - 2, ketebalan,
            0, D.alpha('#e8c84a', m === 'dekantasi' ? 0.6 + a * 0.3 : 0.4));
          if (m !== 'dekantasi') {
            D.text(c, 'minyak & air masih bercampur', GX + GW / 2, topY - 34,
              { size: 10, weight: 500, color: P.faint, align: 'c', base: 'middle' });
          }
        }
      }

      // butiran
      sim.data.butir.forEach(function (b) {
        const k = KOMPONEN[b.k];
        const larutHilang = k.larut && adaAir && !sim.data.terpisah[b.k];
        if (larutHilang) return;   // garam larut, tidak tampak
        D.circle(c, b.x + b.ox, b.y + b.oy, b.r, k.warna, 'rgba(0,0,0,.2)', 0.8);
      });

      /* ---------- kanan: wadah hasil ---------- */
      const RX = 430;
      D.roundRect(c, RX, 92, 328, 232, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'HASIL PEMISAHAN', RX + 16, 112,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });

      r.isi.forEach(function (k, i) {
        const komp = KOMPONEN[k];
        const y = 142 + i * 44;
        const sudah = sim.data.terpisah[k];
        D.roundRect(c, RX + 16, y - 16, 296, 36, 7,
          sudah ? 'rgba(111,207,127,.12)' : 'rgba(255,255,255,.04)',
          sudah ? P.green : 'rgba(255,255,255,.1)', 1.2);
        D.circle(c, RX + 36, y + 2, 9, komp.warna, 'rgba(255,255,255,.3)', 1.2);
        D.text(c, komp.nama, RX + 54, y - 2,
          { size: 13, weight: 650, color: P.text, base: 'middle' });
        D.text(c, sudah ? 'terpisah dengan ' + METODE[sudah].nama.toLowerCase().split(' ')[0]
          : 'masih dalam campuran',
          RX + 54, y + 13, { size: 10.5, weight: 500, color: sudah ? P.green : P.faint, base: 'middle' });
        D.text(c, sudah ? '✓' : '○', RX + 292, y + 2,
          { size: 16, weight: 700, color: sudah ? P.green : P.faint, align: 'c', base: 'middle' });
      });

      /* ---------- bawah: penjelasan metode ---------- */
      D.roundRect(c, 36, 348, W - 72, 128, 12, 'rgba(255,255,255,.05)', 'rgba(255,255,255,.14)', 1.3);
      D.text(c, 'METODE YANG DIPILIH', 56, 370,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
      D.text(c, met.nama, 56, 394, { size: 17, weight: 700, color: P.accent2, base: 'middle' });
      D.text(c, met.dasar, 56, 418, { size: 13, weight: 500, color: P.dim, base: 'middle' });

      D.roundRect(c, 56, 434, W - 112, 28, 7,
        'rgba(79,209,192,.1)', 'rgba(79,209,192,.3)', 1.2);
      D.text(c, sim.data.pesan, 72, 448,
        { size: 12.5, weight: 600, color: P.accent2, base: 'middle' });
    },

    readoutsUpdate: function (sim) {
      const r = resepAktif(sim);
      const sudah = r.isi.filter(function (k) { return sim.data.terpisah[k]; }).length;
      sim.readout('komponen', r.isi.length);
      sim.readout('sudah', sudah, sudah === r.isi.length ? 'accent' : null);
      sim.readout('belum', r.isi.length - sudah);
    },

    notes: `
      <p>Dalam <strong>campuran</strong>, zat-zat penyusunnya bergabung tetapi tidak
      berubah menjadi zat baru. Gula dalam air tetaplah gula. Karena itu, campuran
      selalu bisa dipisahkan kembali — berbeda dengan senyawa yang perlu reaksi kimia.</p>

      <h3>Kuncinya: cari perbedaan sifat</h3>
      <p>Setiap metode pemisahan bekerja dengan memanfaatkan satu perbedaan sifat
      antarkomponennya.</p>
      <table>
        <thead><tr><th>Metode</th><th>Memanfaatkan</th><th>Contoh</th></tr></thead>
        <tbody>
          <tr><td>Penyaringan</td><td>Ukuran partikel</td><td>Pasir dari air</td></tr>
          <tr><td>Penguapan</td><td>Titik didih</td><td>Garam dari air laut</td></tr>
          <tr><td>Magnet</td><td>Sifat magnetis</td><td>Serbuk besi dari pasir</td></tr>
          <tr><td>Pengendapan</td><td>Massa jenis</td><td>Minyak dari air</td></tr>
        </tbody>
      </table>

      <h3>Mengapa garam tidak bisa disaring?</h3>
      <p>Saat garam larut, partikelnya menjadi <strong>sangat kecil</strong> — jauh
      lebih kecil daripada lubang kertas saring. Partikel garam lolos bersama air.
      Untuk memisahkannya kita harus menguapkan airnya sehingga garam tertinggal
      sebagai kristal. Inilah cara petani garam bekerja di tambak.</p>

      <div class="callout" data-tone="tip">
        <strong>Sering perlu beberapa tahap</strong>
        Campuran pasir + garam + besi + air tidak bisa dipisahkan dengan satu metode.
        Coba urutkan: magnet dulu, lalu saring, lalu uapkan. Perhatikan urutannya penting.
      </div>
    `,

    explore: [
      'Pilih <strong>Pasir + air</strong>, coba Uapkan dulu. Lalu coba Saring. Mana yang berhasil?',
      'Pilih <strong>Garam + air</strong> dan coba Saring. Mengapa garam tetap lolos?',
      'Kerjakan campuran <strong>lengkap</strong> dengan tiga metode berurutan sampai semua komponen terpisah.',
      'Pada <strong>Minyak + air</strong>, perhatikan posisi lapisan minyak. Hubungkan dengan massa jenisnya.'
    ],

    quiz: [
      {
        q: 'Air keruh dari sungai disaring dengan kertas saring. Yang tertinggal di kertas saring disebut…',
        options: ['Filtrat', 'Residu', 'Larutan', 'Pelarut'],
        answer: 1,
        explain: 'Residu adalah zat padat yang tertahan di kertas saring. Cairan bening yang lolos disebut filtrat.'
      },
      {
        q: 'Petani garam memperoleh garam dari air laut dengan cara…',
        options: ['Penyaringan', 'Penguapan air laut oleh sinar matahari', 'Penarikan magnet', 'Pengendapan'],
        answer: 1,
        explain: 'Air laut dialirkan ke petak dangkal. Panas matahari menguapkan airnya, sehingga garam tertinggal sebagai kristal.'
      },
      {
        q: 'Campuran serbuk besi dan pasir paling mudah dipisahkan dengan…',
        options: ['Disaring', 'Diuapkan', 'Ditarik magnet', 'Didiamkan'],
        answer: 2,
        explain: 'Besi tertarik magnet sedangkan pasir tidak. Perbedaan sifat magnetis inilah yang dimanfaatkan.'
      },
      {
        q: 'Mengapa campuran selalu dapat dipisahkan kembali menjadi komponennya?',
        options: [
          'Karena komponennya tidak berubah menjadi zat baru',
          'Karena campuran selalu berupa cairan',
          'Karena komponennya selalu berwarna berbeda',
          'Karena campuran tidak stabil'
        ],
        answer: 0,
        explain: 'Pada campuran, zat penyusunnya hanya bercampur secara fisik dan tetap mempertahankan sifatnya masing-masing. Sifat yang berbeda itulah yang kita manfaatkan untuk memisahkannya.'
      }
    ]
  });
})();
