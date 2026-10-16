/* Asam, Basa, dan Indikator Alami — Fase C
   Teteskan ekstrak kubis ungu dan indikator lain ke larutan rumah tangga. */

(function () {
  'use strict';

  const D = Sim.Draw, P = Sim.P;
  const C = Chem;

  const LARUTAN = [
    { nama: 'Air jeruk nipis', pH: 2.2, sifat: 'asam', warna: '#e8d84a' },
    { nama: 'Cuka dapur',      pH: 2.9, sifat: 'asam', warna: '#f0e8c8' },
    { nama: 'Air soda',        pH: 3.5, sifat: 'asam', warna: '#e8e8e0' },
    { nama: 'Air teh',         pH: 5.5, sifat: 'asam', warna: '#b06a30' },
    { nama: 'Air hujan',       pH: 5.8, sifat: 'asam', warna: '#dfe8ee' },
    { nama: 'Susu sapi',       pH: 6.6, sifat: 'asam', warna: '#f4f0e8' },
    { nama: 'Air murni',       pH: 7.0, sifat: 'netral', warna: '#dfe8ee' },
    { nama: 'Air garam',       pH: 7.0, sifat: 'netral', warna: '#e4ecf0' },
    { nama: 'Larutan gula',    pH: 7.0, sifat: 'netral', warna: '#eef0e8' },
    { nama: 'Pasta gigi',      pH: 8.5, sifat: 'basa', warna: '#f0f4f0' },
    { nama: 'Air sabun',       pH: 10.0, sifat: 'basa', warna: '#e0eef0' },
    { nama: 'Obat maag',       pH: 10.3, sifat: 'basa', warna: '#f4f4ec' },
    { nama: 'Air kapur',       pH: 12.4, sifat: 'basa', warna: '#f0f0ea' },
    { nama: 'Pembersih lantai',pH: 13.0, sifat: 'basa', warna: '#dcecf4' }
  ];

  const INDIKATOR = ['kubis-ungu', 'lakmus', 'fenolftalein', 'bromtimol'];

  const W = 790, H = 520;
  const GX = 150, GY = 150, GW = 130, GH = 150;

  function larutanAktif(sim) { return LARUTAN[parseInt(sim.get('larutan'), 10) || 0]; }

  function siapkan(sim) {
    sim.data.tetes = 0;        // 0..1 seberapa banyak indikator diteteskan
    sim.data.menetes = false;
    sim.data.dicatat = {};
    sim.data.tetesJatuh = [];
  }

  function teteskan(sim) {
    sim.data.menetes = true;
    const l = larutanAktif(sim);
    sim.data.dicatat[l.nama] = l.sifat;
  }

  Sim.create({
    title: 'Asam, Basa, dan Indikator Alami',
    subtitle: 'Kubis ungu mengandung zat warna yang berubah menurut keasaman. Teteskan ekstraknya ke berbagai larutan di dapur dan baca pesan warnanya.',
    fase: 'C', jenjang: 'SD Kelas 5–6',
    topik: ['Asam Basa', 'Indikator'],
    stage: { w: W, h: H },

    controls: [
      {
        title: 'Larutan yang diuji',
        items: [
          { type: 'select', id: 'larutan', value: 0, label: 'Pilih larutan',
            options: LARUTAN.map(function (l, i) { return { value: i, label: l.nama }; }) },
          { type: 'buttons', label: '', items: [
            { label: '💧 Teteskan indikator', primary: true, onClick: teteskan },
            { label: 'Bilas gelas', onClick: function (sim) {
              sim.data.tetes = 0; sim.data.menetes = false; sim.data.tetesJatuh = [];
            } }
          ] }
        ]
      },
      {
        title: 'Indikator',
        items: [
          { type: 'select', id: 'indikator', value: 'kubis-ungu', label: 'Pilih indikator',
            options: INDIKATOR.map(function (k) { return { value: k, label: C.INDIKATOR[k].nama }; }),
            hint: 'Tiap indikator punya trayek perubahan warna sendiri.' },
          { type: 'toggle', id: 'skala', value: true, label: 'Tampilkan skala pH' },
          { type: 'toggle', id: 'angka', value: false, label: 'Tampilkan angka pH',
            hint: 'Di Fase C cukup asam, basa, atau netral. Angka pH dipelajari di SMP.' }
        ]
      },
      {
        title: 'Catatan percobaan',
        items: [
          { type: 'buttons', label: '', items: [
            { label: 'Uji semua larutan', onClick: function (sim) {
              LARUTAN.forEach(function (l) { sim.data.dicatat[l.nama] = l.sifat; });
            } },
            { label: 'Hapus catatan', onClick: function (sim) { sim.data.dicatat = {}; } }
          ] }
        ]
      }
    ],

    readouts: [
      { id: 'sifat', label: 'Sifat larutan', tone: 'accent' },
      { id: 'warna', label: 'Warna indikator' },
      { id: 'diuji', label: 'Sudah diuji' }
    ],

    setup: siapkan,
    reset: siapkan,
    onChange: function (sim, id) {
      if (id === 'larutan' || id === 'indikator') {
        sim.data.tetes = 0; sim.data.menetes = false; sim.data.tetesJatuh = [];
      }
    },

    update: function (sim, dt) {
      if (sim.data.menetes) {
        sim.data.tetes = Math.min(1, sim.data.tetes + dt * 0.75);
        if (Math.random() < dt * 9 && sim.data.tetes < 0.95) {
          sim.data.tetesJatuh.push({ y: 0, v: 0 });
        }
        if (sim.data.tetes >= 1) sim.data.menetes = false;
      }
      sim.data.tetesJatuh.forEach(function (t) { t.v += 420 * dt; t.y += t.v * dt; });
      sim.data.tetesJatuh = sim.data.tetesJatuh.filter(function (t) { return t.y < 118; });
    },

    draw: function (c, sim) {
      const l = larutanAktif(sim);
      const ind = sim.get('indikator');
      const campur = sim.data.tetes;
      const warnaAkhir = C.warnaIndikator(ind, l.pH);
      const warnaGelas = campur > 0 ? D.mix(l.warna, warnaAkhir, Math.min(1, campur * 1.25)) : l.warna;

      /* ---------- botol indikator & pipet ---------- */
      const PX = GX + GW / 2;
      D.roundRect(c, PX - 22, 40, 44, 54, 6,
        D.alpha(C.warnaIndikator(ind, 7), 0.5), 'rgba(255,255,255,.3)', 1.4);
      D.roundRect(c, PX - 9, 26, 18, 16, 3, '#6b7580', 'rgba(255,255,255,.2)', 1.1);
      D.text(c, C.INDIKATOR[ind].nama, PX, 108,
        { size: 11.5, weight: 650, color: P.dim, align: 'c', base: 'middle' });

      // tetesan jatuh
      sim.data.tetesJatuh.forEach(function (t) {
        D.circle(c, PX, 100 + t.y * 0.32, 4, D.alpha(C.warnaIndikator(ind, 7), 0.85));
      });

      /* ---------- gelas ---------- */
      D.beaker(c, GX, GY, GW, GH, 0.72, D.alpha(warnaGelas, 0.9));

      // riak saat indikator menyebar
      if (campur > 0 && campur < 1) {
        c.save();
        c.beginPath(); c.rect(GX, GY + GH * 0.28, GW, GH * 0.72); c.clip();
        for (let i = 0; i < 4; i++) {
          c.beginPath();
          c.ellipse(GX + GW / 2, GY + GH * 0.4 + i * 22,
            GW * 0.3 * (0.4 + campur), 7, 0, 0, Math.PI * 2);
          c.strokeStyle = D.alpha(warnaAkhir, 0.35); c.lineWidth = 2; c.stroke();
        }
        c.restore();
      }

      D.text(c, l.nama, GX + GW / 2, GY + GH + 26,
        { size: 15, weight: 700, color: P.text, align: 'c', base: 'middle' });

      if (campur > 0.45) {
        const sifatWarna = l.sifat === 'asam' ? '#ef6a52' : l.sifat === 'basa' ? '#5b9bf5' : '#6fcf7f';
        D.roundRect(c, GX - 10, GY + GH + 40, GW + 20, 30, 8,
          D.alpha(sifatWarna, 0.18), sifatWarna, 1.5);
        D.text(c, l.sifat.toUpperCase(), GX + GW / 2, GY + GH + 55,
          { size: 15, weight: 800, color: sifatWarna, align: 'c', base: 'middle' });
      } else {
        D.text(c, 'teteskan indikator untuk menguji', GX + GW / 2, GY + GH + 54,
          { size: 11.5, weight: 500, color: P.faint, align: 'c', base: 'middle' });
      }

      /* ---------- skala warna indikator ---------- */
      if (sim.get('skala')) {
        const SX = 340, SY = 96, SW = 400, SH = 44;
        D.text(c, 'SKALA WARNA · ' + C.INDIKATOR[ind].nama.toUpperCase(), SX, SY - 16,
          { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
        for (let i = 0; i < SW; i++) {
          const pH = i / SW * 14;
          c.fillStyle = C.warnaIndikator(ind, pH);
          c.fillRect(SX + i, SY, 1.6, SH);
        }
        D.roundRect(c, SX, SY, SW, SH, 6, null, 'rgba(255,255,255,.22)', 1.4);

        // penanda posisi larutan
        if (campur > 0.3) {
          const px = SX + l.pH / 14 * SW;
          c.beginPath();
          c.moveTo(px, SY - 8); c.lineTo(px - 7, SY - 18); c.lineTo(px + 7, SY - 18);
          c.closePath(); c.fillStyle = P.text; c.fill();
          D.line(c, px, SY, px, SY + SH, '#ffffff', 2.2);
        }

        // label asam/netral/basa
        [['ASAM', 0.14, '#ef6a52'], ['NETRAL', 0.5, '#6fcf7f'], ['BASA', 0.86, '#5b9bf5']].forEach(function (m) {
          D.text(c, m[0], SX + SW * m[1], SY + SH + 16,
            { size: 11, weight: 700, color: m[2], align: 'c', base: 'middle' });
        });
        if (sim.get('angka')) {
          for (let p = 0; p <= 14; p += 2) {
            D.text(c, String(p), SX + p / 14 * SW, SY + SH + 32,
              { size: 10, weight: 500, color: P.faint, align: 'c', base: 'middle' });
          }
        }
      }

      /* ---------- tabel hasil ---------- */
      const TX = 340, TY = 196, TW = 400;
      D.roundRect(c, TX, TY, TW, 268, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'CATATAN PERCOBAAN', TX + 16, TY + 18,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });

      const kol = 2, perKol = Math.ceil(LARUTAN.length / kol);
      LARUTAN.forEach(function (ll, i) {
        const kx = TX + 16 + Math.floor(i / perKol) * 194;
        const ky = TY + 42 + (i % perKol) * 31;
        const dicatat = sim.data.dicatat[ll.nama];
        const aktif = ll === l;
        if (aktif) D.roundRect(c, kx - 4, ky - 12, 190, 25, 4, 'rgba(79,209,192,.1)');
        const warna = dicatat
          ? (ll.sifat === 'asam' ? '#ef6a52' : ll.sifat === 'basa' ? '#5b9bf5' : '#6fcf7f')
          : 'rgba(255,255,255,.12)';
        D.circle(c, kx + 7, ky, 5.5, dicatat ? C.warnaIndikator(ind, ll.pH) : 'rgba(255,255,255,.1)',
          warna, 1.4);
        D.text(c, ll.nama, kx + 20, ky,
          { size: 11.5, weight: aktif ? 700 : 500, color: aktif ? P.accent2 : P.dim, base: 'middle' });
        D.text(c, dicatat ? ll.sifat : '—', kx + 182, ky,
          { size: 11, weight: 700, color: dicatat ? warna : P.faint, align: 'r', base: 'middle' });
      });

      D.line(c, TX + 16, TY + 240, TX + TW - 16, TY + 240, 'rgba(255,255,255,.1)', 1);
      const nAsam = Object.keys(sim.data.dicatat).filter(function (k) {
        return sim.data.dicatat[k] === 'asam'; }).length;
      const nBasa = Object.keys(sim.data.dicatat).filter(function (k) {
        return sim.data.dicatat[k] === 'basa'; }).length;
      const nNetral = Object.keys(sim.data.dicatat).filter(function (k) {
        return sim.data.dicatat[k] === 'netral'; }).length;
      D.text(c, 'Asam ' + nAsam + '  ·  Netral ' + nNetral + '  ·  Basa ' + nBasa,
        TX + 16, TY + 256, { size: 12, weight: 600, color: P.dim, base: 'middle' });
    },

    readoutsUpdate: function (sim) {
      const l = larutanAktif(sim);
      const tampil = sim.data.tetes > 0.45;
      sim.readout('sifat', tampil ? l.sifat.charAt(0).toUpperCase() + l.sifat.slice(1) : 'belum diuji',
        tampil ? (l.sifat === 'asam' ? 'danger' : l.sifat === 'basa' ? 'accent' : null) : null);
      const w = C.warnaIndikator(sim.get('indikator'), l.pH);
      sim.readout('warna', tampil
        ? '<span style="display:inline-block;width:14px;height:14px;border-radius:4px;vertical-align:-2px;background:' + w + '"></span>'
        : '—');
      sim.readout('diuji', Object.keys(sim.data.dicatat).length + ' / ' + LARUTAN.length);
    },

    notes: `
      <p>Larutan di sekitar kita dapat dikelompokkan menjadi tiga: <strong>asam</strong>,
      <strong>basa</strong>, dan <strong>netral</strong>. Kita tidak boleh mencicipi atau
      menyentuh larutan yang tidak dikenal untuk mengujinya. Karena itu kita memakai
      <strong>indikator</strong> — zat yang berubah warna sesuai sifat larutan.</p>

      <h3>Ciri-cirinya</h3>
      <table>
        <thead><tr><th></th><th>Asam</th><th>Basa</th></tr></thead>
        <tbody>
          <tr><td>Rasa</td><td>masam</td><td>pahit</td></tr>
          <tr><td>Sentuhan</td><td>—</td><td>licin seperti sabun</td></tr>
          <tr><td>Lakmus merah</td><td>tetap merah</td><td>menjadi biru</td></tr>
          <tr><td>Lakmus biru</td><td>menjadi merah</td><td>tetap biru</td></tr>
          <tr><td>Contoh</td><td>jeruk, cuka</td><td>sabun, air kapur</td></tr>
        </tbody>
      </table>

      <h3>Kubis ungu, indikator dari dapur</h3>
      <p>Kubis ungu mengandung zat warna bernama <strong>antosianin</strong>. Zat ini
      berubah warna sesuai keasaman: <strong>merah muda</strong> di larutan asam kuat,
      <strong>ungu</strong> di sekitar netral, dan <strong>hijau sampai kuning</strong>
      di larutan basa. Karena rentangnya lebar, kubis ungu bisa menunjukkan tingkat
      keasaman, bukan sekadar asam atau basa.</p>

      <p>Bunga sepatu, kunyit, dan kulit buah naga juga dapat dipakai sebagai indikator
      alami. Cobalah membuatnya sendiri di rumah dengan merebus bahan tersebut lalu
      menyaring airnya.</p>

      <div class="callout" data-tone="warn">
        <strong>Keselamatan di atas segalanya</strong>
        Pembersih lantai dan obat penghilang karat bersifat sangat basa atau sangat asam
        dan bisa melukai kulit. Dalam percobaan nyata, selalu pakai sarung tangan dan
        minta pendampingan guru atau orang tua.
      </div>
    `,

    explore: [
      'Uji <strong>Air jeruk nipis</strong> dan <strong>Air sabun</strong> dengan kubis ungu. Bandingkan warnanya.',
      'Ganti indikator ke <strong>Fenolftalein</strong>, lalu uji ulang keduanya. Mengapa jeruk dan air murni terlihat sama?',
      'Cari larutan yang netral. Ada berapa? Apa persamaan ketiganya?',
      'Pakai <strong>Uji semua larutan</strong>, lalu urutkan dari yang paling asam ke paling basa.'
    ],

    quiz: [
      {
        q: 'Ekstrak kubis ungu diteteskan ke suatu larutan dan berubah menjadi hijau kekuningan. Larutan itu bersifat…',
        options: ['Asam kuat', 'Asam lemah', 'Netral', 'Basa'],
        answer: 3,
        explain: 'Antosianin dalam kubis ungu berubah menjadi hijau sampai kuning pada larutan basa. Warna merah muda menandakan asam, dan ungu menandakan netral.'
      },
      {
        q: 'Kertas lakmus biru dicelupkan ke air jeruk nipis. Apa yang terjadi?',
        options: ['Tetap biru', 'Berubah menjadi merah', 'Berubah menjadi hijau', 'Warnanya hilang'],
        answer: 1,
        explain: 'Air jeruk nipis bersifat asam. Ciri khas asam adalah mengubah lakmus biru menjadi merah.'
      },
      {
        q: 'Mengapa kita tidak boleh menguji sifat larutan dengan cara mencicipinya?',
        options: [
          'Karena rasanya tidak enak',
          'Karena banyak larutan bersifat racun atau merusak jaringan tubuh',
          'Karena lidah tidak bisa membedakan asam dan basa',
          'Karena hasilnya selalu salah'
        ],
        answer: 1,
        explain: 'Banyak asam dan basa kuat dapat melukai mulut dan saluran pencernaan. Indikator memberi jawaban yang sama amannya tanpa risiko.'
      },
      {
        q: 'Sabun terasa licin di kulit. Sifat ini menunjukkan sabun termasuk larutan…',
        options: ['Asam', 'Basa', 'Netral', 'Garam'],
        answer: 1,
        explain: 'Rasa licin saat disentuh adalah ciri khas larutan basa. Air kapur dan obat maag juga memiliki sifat ini.'
      }
    ]
  });
})();
