/* Polimer dan Biomolekul — Fase F
   Rangkai monomer menjadi polimer adisi dan kondensasi, lalu jalankan uji
   karbohidrat, protein, dan lemak. */

(function () {
  'use strict';

  const D = Sim.Draw, P = Sim.P;
  const C = Chem;

  const W = 800, H = 600;

  const POLIMER = [
    { id: 'pe', n: 'Polietilena (PE)', monomer: 'etena (CH₂=CH₂)', jenis: 'adisi', asal: 'sintetis',
      guna: 'Kantong plastik, botol, pembungkus makanan', w: '#5b9bf5' },
    { id: 'pp', n: 'Polipropilena (PP)', monomer: 'propena', jenis: 'adisi', asal: 'sintetis',
      guna: 'Wadah makanan, karung, tali plastik', w: '#4fd1c0' },
    { id: 'pvc', n: 'PVC', monomer: 'vinil klorida', jenis: 'adisi', asal: 'sintetis',
      guna: 'Pipa air, pelapis lantai, kabel listrik', w: '#f0a94a' },
    { id: 'ps', n: 'Polistirena', monomer: 'stirena', jenis: 'adisi', asal: 'sintetis',
      guna: 'Styrofoam, gelas sekali pakai', w: '#b795f0' },
    { id: 'nilon', n: 'Nilon 6,6', monomer: 'asam adipat + heksametilendiamina', jenis: 'kondensasi', asal: 'sintetis',
      guna: 'Serat kain, tali, parasut', w: '#f0718f' },
    { id: 'pet', n: 'PET (poliester)', monomer: 'asam tereftalat + etilena glikol', jenis: 'kondensasi', asal: 'sintetis',
      guna: 'Botol minuman, serat poliester', w: '#6fcf7f' },
    { id: 'amilum', n: 'Amilum (pati)', monomer: 'glukosa', jenis: 'kondensasi', asal: 'alami',
      guna: 'Cadangan makanan tumbuhan', w: '#f0d04a' },
    { id: 'selulosa', n: 'Selulosa', monomer: 'glukosa', jenis: 'kondensasi', asal: 'alami',
      guna: 'Dinding sel tumbuhan, kertas, kapas', w: '#c8a070' },
    { id: 'protein', n: 'Protein', monomer: 'asam amino', jenis: 'kondensasi', asal: 'alami',
      guna: 'Enzim, otot, antibodi, hemoglobin', w: '#ef6a52' },
    { id: 'karet', n: 'Karet alam', monomer: 'isoprena', jenis: 'adisi', asal: 'alami',
      guna: 'Ban, sarung tangan, alas kaki', w: '#8d939a' }
  ];

  const BAHAN_UJI = [
    { n: 'Nasi', amilum: true, glukosa: false, protein: false, lemak: false },
    { n: 'Kentang', amilum: true, glukosa: false, protein: false, lemak: false },
    { n: 'Putih telur', amilum: false, glukosa: false, protein: true, lemak: false },
    { n: 'Tahu', amilum: false, glukosa: false, protein: true, lemak: true },
    { n: 'Minyak goreng', amilum: false, glukosa: false, protein: false, lemak: true },
    { n: 'Susu', amilum: false, glukosa: true, protein: true, lemak: true },
    { n: 'Pisang matang', amilum: true, glukosa: true, protein: false, lemak: false },
    { n: 'Kacang tanah', amilum: false, glukosa: false, protein: true, lemak: true }
  ];

  const UJI = {
    lugol: { n: 'Lugol (iodin)', untuk: 'amilum', positif: 'biru kehitaman', wPos: '#1e2a6e', wNeg: '#c08030' },
    benedict: { n: 'Benedict', untuk: 'glukosa', positif: 'merah bata', wPos: '#c0442a', wNeg: '#3a7fd0' },
    biuret: { n: 'Biuret', untuk: 'protein', positif: 'ungu', wPos: '#8a3fc0', wNeg: '#5aa0d8' },
    kertas: { n: 'Kertas buram', untuk: 'lemak', positif: 'noda transparan', wPos: '#d8c8a0', wNeg: '#f0ead8' }
  };

  function polimerAktif(sim) {
    return POLIMER.find(function (p) { return p.id === sim.get('polimer'); }) || POLIMER[0];
  }

  function siapkan(sim) {
    sim.data.n = 1;
    sim.data.jalan = false;
    sim.data.ujiJalan = 0;
  }

  Sim.create({
    title: 'Polimer dan Biomolekul',
    subtitle: 'Molekul raksasa tersusun dari satuan kecil yang berulang. Prinsip yang sama berlaku pada plastik buatan maupun protein dalam tubuh kita.',
    fase: 'F', jenjang: 'SMA Kelas 12',
    topik: ['Polimer', 'Biomolekul'],
    stage: { w: W, h: H },

    controls: [
      {
        title: 'Polimer',
        items: [
          { type: 'select', id: 'polimer', value: 'pe', label: 'Pilih polimer',
            options: POLIMER.map(function (p) { return { value: p.id, label: p.n }; }) },
          { type: 'slider', id: 'panjang', value: 6, min: 2, max: 14, step: 1,
            label: 'Jumlah monomer (n)', dec: 0 },
          { type: 'buttons', label: '', items: [
            { label: '▶ Polimerisasi', primary: true, onClick: function (sim) {
              sim.data.n = 1; sim.data.jalan = true;
            } }
          ] }
        ]
      },
      {
        title: 'Uji biomolekul',
        items: [
          { type: 'select', id: 'bahan', value: 0, label: 'Bahan makanan',
            options: BAHAN_UJI.map(function (b, i) { return { value: i, label: b.n }; }) },
          { type: 'segment', id: 'uji', value: 'lugol', label: 'Pereaksi',
            options: Object.keys(UJI).map(function (k) {
              return { value: k, label: UJI[k].n.split(' ')[0] }; }) },
          { type: 'buttons', label: '', items: [
            { label: '💧 Uji bahan ini', primary: true, onClick: function (sim) {
              sim.data.ujiJalan = 1;
            } }
          ] }
        ]
      },
      {
        title: 'Tampilan',
        items: [
          { type: 'toggle', id: 'tabel', value: true, label: 'Tabel hasil uji semua bahan' }
        ]
      }
    ],

    readouts: [
      { id: 'jenis', label: 'Jenis polimerisasi', tone: 'accent' },
      { id: 'asal', label: 'Asal polimer' },
      { id: 'monomer', label: 'Monomer' },
      { id: 'uji', label: 'Hasil uji' }
    ],

    setup: siapkan,
    reset: siapkan,
    onChange: function (sim, id) {
      if (id === 'polimer' || id === 'panjang') { sim.data.n = 1; sim.data.jalan = false; }
      if (id === 'bahan' || id === 'uji') sim.data.ujiJalan = 0;
    },

    update: function (sim, dt) {
      const target = Math.round(sim.get('panjang'));
      if (sim.data.jalan) {
        sim.data.n += dt * 2.6;
        if (sim.data.n >= target) { sim.data.n = target; sim.data.jalan = false; }
      }
      if (sim.data.ujiJalan > 0 && sim.data.ujiJalan < 1.0001) {
        sim.data.ujiJalan = Math.min(1, sim.data.ujiJalan + dt * 0.9);
      }
    },

    draw: function (c, sim) {
      const Pm = polimerAktif(sim);
      const nTampil = Math.floor(sim.data.n);
      const target = Math.round(sim.get('panjang'));
      const adisi = Pm.jenis === 'adisi';

      /* ---------- rantai polimer ---------- */
      D.text(c, 'POLIMERISASI ' + Pm.jenis.toUpperCase(), 40, 44,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
      D.text(c, Pm.n, 40, 70, { size: 22, weight: 700, color: Pm.w, base: 'middle' });
      D.text(c, 'monomer: ' + Pm.monomer, 40, 94,
        { size: 12, weight: 500, color: P.faint, base: 'middle' });

      const RX = 60, RY = 160, lebar = Math.min(48, 640 / target);
      for (let i = 0; i < target; i++) {
        const x = RX + i * lebar;
        const tersambung = i < nTampil;
        const y = RY + (tersambung ? 0 : Math.sin(i * 2.1) * 26);

        // ikatan antarmonomer
        if (i > 0 && tersambung) {
          D.line(c, x - lebar + 18, RY, x - 2, RY, 'rgba(255,255,255,.45)', 3.4);
        }
        // satuan monomer
        D.roundRect(c, x - 2, y - 15, lebar - 8, 30, 5,
          tersambung ? Pm.w : D.alpha(Pm.w, 0.3),
          'rgba(255,255,255,.3)', 1.3);
        D.text(c, '—', x + (lebar - 8) / 2 - 2, y,
          { size: 13, weight: 700, color: D.readable(Pm.w), align: 'c', base: 'middle' });

        // molekul kecil yang dilepas pada polimerisasi kondensasi
        if (!adisi && tersambung && i > 0) {
          D.circle(c, x - lebar / 2 + 8, RY - 34, 7, D.alpha('#5b9bf5', 0.8));
          D.text(c, 'H₂O', x - lebar / 2 + 8, RY - 48,
            { size: 9, weight: 700, color: '#8fd0ff', align: 'c', base: 'middle' });
        }
      }

      D.text(c, 'n = ' + nTampil + ' dari ' + target + ' monomer', RX, RY + 48,
        { size: 13, weight: 700, color: P.accent2, base: 'middle' });
      D.text(c, adisi
        ? 'Monomer berikatan rangkap terbuka dan menyambung langsung — tidak ada zat lain yang dilepas.'
        : 'Setiap sambungan melepaskan satu molekul kecil (air), sehingga disebut kondensasi.',
        RX, RY + 70, { size: 12, weight: 500, color: P.dim, base: 'middle' });

      /* ---------- keterangan polimer ---------- */
      const KX = 60, KY = 254, KW = 340;
      D.roundRect(c, KX, KY, KW, 110, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'KETERANGAN', KX + 16, KY + 20,
        { size: 10, weight: 700, color: P.faint, base: 'middle' });
      const ket = [
        ['Jenis polimerisasi', Pm.jenis],
        ['Asal', Pm.asal],
        ['Monomer penyusun', Pm.monomer],
        ['Kegunaan', Pm.guna]
      ];
      ket.forEach(function (k, i) {
        const y = KY + 42 + i * 18;
        D.text(c, k[0], KX + 16, y, { size: 10.5, weight: 500, color: P.faint, base: 'middle' });
        const teks = k[1].length > 36 ? k[1].slice(0, 34) + '…' : k[1];
        D.text(c, teks, KX + 140, y,
          { size: 10.5, weight: 650, color: P.dim, base: 'middle' });
      });

      /* ---------- adisi vs kondensasi ---------- */
      const AX = 416, AW = W - AX - 40;
      D.roundRect(c, AX, KY, AW, 110, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'DUA JENIS POLIMERISASI', AX + 16, KY + 20,
        { size: 10, weight: 700, color: P.faint, base: 'middle' });
      [['ADISI', 'Monomer berikatan rangkap. Ikatan rangkap terbuka lalu menyambung. Tidak ada zat sampingan.', 'PE, PP, PVC, karet', adisi],
       ['KONDENSASI', 'Monomer bergugus fungsi. Setiap sambungan melepas molekul kecil (air).', 'Nilon, PET, protein, pati', !adisi]
      ].forEach(function (q, i) {
        const y = KY + 42 + i * 34;
        if (q[3]) D.roundRect(c, AX + 10, y - 13, AW - 20, 32, 5, 'rgba(79,209,192,.12)');
        D.text(c, q[0], AX + 18, y - 3,
          { size: 11, weight: 800, color: q[3] ? P.accent2 : P.dim, base: 'middle' });
        D.text(c, q[2], AX + AW - 18, y - 3,
          { size: 10, weight: 600, color: P.faint, align: 'r', base: 'middle' });
        D.text(c, q[1].length > 68 ? q[1].slice(0, 66) + '…' : q[1], AX + 18, y + 11,
          { size: 10, weight: 500, color: P.faint, base: 'middle' });
      });

      /* ---------- uji biomolekul ---------- */
      const B = BAHAN_UJI[parseInt(sim.get('bahan'), 10) || 0];
      const ujiKunci = sim.get('uji');
      const U = UJI[ujiKunci];
      const positif = B[U.untuk];
      const a = sim.data.ujiJalan;

      const TX = 60, TY = 390;
      D.text(c, 'UJI BIOMOLEKUL', TX, TY,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });

      // tabung reaksi
      const tubeX = TX + 20, tubeY = TY + 20;
      D.tube(c, tubeX, tubeY, 42, 110,
        0.6, D.alpha(a > 0.4 ? (positif ? U.wPos : U.wNeg) : '#d8d0b8', 0.9));
      D.text(c, B.n, tubeX + 21, tubeY + 128,
        { size: 13, weight: 700, color: P.text, align: 'c', base: 'middle' });
      D.text(c, '+ ' + U.n, tubeX + 21, tubeY + 146,
        { size: 10.5, weight: 600, color: P.faint, align: 'c', base: 'middle' });

      // hasil
      D.roundRect(c, TX + 90, TY + 24, 260, 100, 12,
        a > 0.4 ? D.alpha(positif ? P.green : P.faint, 0.1) : 'rgba(255,255,255,.04)',
        a > 0.4 ? (positif ? P.green : 'rgba(255,255,255,.14)') : 'rgba(255,255,255,.12)', 1.4);
      D.text(c, 'HASIL UJI', TX + 106, TY + 44,
        { size: 10, weight: 700, color: P.faint, base: 'middle' });
      if (a > 0.4) {
        D.text(c, positif ? 'POSITIF' : 'NEGATIF', TX + 106, TY + 70,
          { size: 20, weight: 800, color: positif ? P.green : P.faint, base: 'middle' });
        D.text(c, positif ? 'Warna berubah menjadi ' + U.positif
          : 'Warna tidak berubah', TX + 106, TY + 94,
          { size: 12, weight: 600, color: P.dim, base: 'middle' });
        D.text(c, (positif ? 'Mengandung ' : 'Tidak mengandung ') + U.untuk,
          TX + 106, TY + 112, { size: 11.5, weight: 500, color: P.faint, base: 'middle' });
      } else {
        D.text(c, 'Tekan "Uji bahan ini" untuk melihat hasilnya.',
          TX + 106, TY + 76, { size: 12, weight: 500, color: P.faint, base: 'middle' });
      }

      /* ---------- tabel uji ---------- */
      if (sim.get('tabel')) {
        const JX = 416, JW = W - JX - 40, JY = 390;
        D.roundRect(c, JX, JY + 16, JW, 164, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
        D.text(c, 'HASIL UJI SELURUH BAHAN', JX + 16, JY + 36,
          { size: 10, weight: 700, color: P.faint, base: 'middle' });

        const kol = ['Bahan', 'Amilum', 'Glukosa', 'Protein', 'Lemak'];
        const lebarKol = [110, 60, 60, 60, 60];
        let x0 = JX + 16;
        kol.forEach(function (k, i) {
          D.text(c, k, x0, JY + 56, { size: 9, weight: 700, color: P.faint, base: 'middle' });
          x0 += lebarKol[i];
        });
        D.line(c, JX + 14, JY + 64, JX + JW - 14, JY + 64, 'rgba(255,255,255,.14)', 1);

        BAHAN_UJI.forEach(function (b, i) {
          const y = JY + 80 + i * 14;
          const aktif = b.n === B.n;
          if (aktif) D.roundRect(c, JX + 10, y - 7, JW - 20, 14, 3, 'rgba(79,209,192,.12)');
          let x = JX + 16;
          D.text(c, b.n, x, y, {
            size: 10, weight: aktif ? 700 : 500,
            color: aktif ? P.accent2 : P.dim, base: 'middle'
          });
          x += lebarKol[0];
          ['amilum', 'glukosa', 'protein', 'lemak'].forEach(function (k, ki) {
            D.text(c, b[k] ? '✓' : '·', x + 12, y, {
              size: 11, weight: 700, align: 'c', base: 'middle',
              color: b[k] ? P.green : P.faint
            });
            x += lebarKol[ki + 1];
          });
        });
      }
    },

    readoutsUpdate: function (sim) {
      const Pm = polimerAktif(sim);
      const B = BAHAN_UJI[parseInt(sim.get('bahan'), 10) || 0];
      const U = UJI[sim.get('uji')];
      sim.readout('jenis', Pm.jenis.charAt(0).toUpperCase() + Pm.jenis.slice(1));
      sim.readout('asal', Pm.asal.charAt(0).toUpperCase() + Pm.asal.slice(1),
        Pm.asal === 'alami' ? 'accent' : null);
      sim.readout('monomer', Pm.monomer.length > 22 ? Pm.monomer.slice(0, 20) + '…' : Pm.monomer);
      sim.readout('uji', sim.data.ujiJalan > 0.4 ? (B[U.untuk] ? 'Positif' : 'Negatif') : '—',
        sim.data.ujiJalan > 0.4 ? (B[U.untuk] ? 'accent' : null) : null);
    },

    notes: `
      <p>Makromolekul adalah molekul raksasa yang tersusun dari satuan kecil berulang.
      Satuan kecilnya disebut <strong>monomer</strong>, hasil gabungannya disebut
      <strong>polimer</strong>, dan prosesnya disebut <strong>polimerisasi</strong>.</p>

      <h3>Dua jenis polimerisasi</h3>
      <table>
        <thead><tr><th></th><th>Adisi</th><th>Kondensasi</th></tr></thead>
        <tbody>
          <tr><td>Monomer</td><td>berikatan rangkap</td><td>bergugus fungsi (dua gugus)</td></tr>
          <tr><td>Zat sampingan</td><td>tidak ada</td><td>molekul kecil, biasanya air</td></tr>
          <tr><td>Contoh sintetis</td><td>PE, PP, PVC, polistirena</td><td>nilon, PET, bakelit</td></tr>
          <tr><td>Contoh alami</td><td>karet alam</td><td>protein, pati, selulosa, DNA</td></tr>
        </tbody>
      </table>

      <p>Perhatikan bahwa hampir seluruh polimer alami terbentuk lewat polimerisasi
      kondensasi. Tubuh kita menyambung asam amino menjadi protein dengan melepaskan
      molekul air pada setiap ikatan peptida.</p>

      <h3>Empat golongan biomolekul</h3>
      <ul>
        <li><strong>Karbohidrat</strong> — monomernya monosakarida seperti glukosa.
            Pati, selulosa, dan glikogen semuanya polimer glukosa; yang membedakan hanya
            jenis ikatan dan percabangannya. Itulah sebabnya kita dapat mencerna pati
            tetapi tidak selulosa.</li>
        <li><strong>Protein</strong> — monomernya asam amino yang disambung
            <strong>ikatan peptida</strong>. Ada 20 jenis asam amino, dan urutannya
            menentukan bentuk serta fungsi protein.</li>
        <li><strong>Lipid</strong> — bukan polimer sejati. Tersusun dari gliserol dan asam
            lemak. Lemak jenuh berwujud padat, lemak tak jenuh berwujud cair (minyak).</li>
        <li><strong>Asam nukleat</strong> — DNA dan RNA, monomernya nukleotida. Membawa
            keterangan genetik.</li>
      </ul>

      <h3>Uji biomolekul di laboratorium</h3>
      <table>
        <thead><tr><th>Pereaksi</th><th>Menguji</th><th>Hasil positif</th></tr></thead>
        <tbody>
          <tr><td>Lugol (iodin)</td><td>amilum</td><td>biru kehitaman</td></tr>
          <tr><td>Benedict / Fehling</td><td>gula pereduksi</td><td>endapan merah bata</td></tr>
          <tr><td>Biuret</td><td>protein (ikatan peptida)</td><td>ungu</td></tr>
          <tr><td>Xantoproteat</td><td>protein bercincin benzena</td><td>jingga</td></tr>
          <tr><td>Kertas buram</td><td>lemak</td><td>noda transparan</td></tr>
        </tbody>
      </table>

      <h3>Masalah plastik</h3>
      <p>Sifat yang membuat plastik berguna — kuat, ringan, dan tahan reaksi kimia —
      justru membuatnya sulit terurai. Polietilena memerlukan ratusan tahun untuk hancur
      di alam.</p>

      <p>Beberapa jalan keluar yang dikembangkan: polimer <strong>biodegradable</strong>
      seperti PLA dari pati jagung, daur ulang mekanik maupun kimia, serta mengurangi
      pemakaian plastik sekali pakai. Kode daur ulang pada kemasan (1 sampai 7) membantu
      pemilahan.</p>

      <div class="callout" data-tone="tip">
        <strong>Pati dan selulosa dari monomer yang sama</strong>
        Keduanya polimer glukosa, tetapi arah ikatannya berbeda. Enzim amilase manusia
        hanya cocok dengan ikatan pada pati, sehingga kita bisa mencerna nasi tetapi tidak
        kertas. Sapi bisa, karena bakteri di rumennya memiliki enzim selulase.
      </div>
    `,

    explore: [
      'Jalankan polimerisasi <strong>Polietilena</strong> lalu <strong>Nilon 6,6</strong>. Apa yang muncul berbeda di antara monomernya?',
      'Bandingkan <strong>Amilum</strong> dan <strong>Selulosa</strong>. Monomernya sama — mengapa sifatnya sangat berbeda?',
      'Uji <strong>Nasi</strong> dengan Lugol, lalu dengan Biuret. Mengapa hasilnya berbeda?',
      'Cari bahan yang positif pada tiga uji sekaligus. Bahan apa itu?'
    ],

    quiz: [
      {
        q: 'Polimerisasi yang melepaskan molekul air pada setiap pembentukan ikatan disebut polimerisasi…',
        options: ['Adisi', 'Kondensasi', 'Substitusi', 'Eliminasi'],
        answer: 1,
        explain: 'Pada polimerisasi kondensasi, monomer bergugus fungsi bergabung sambil melepaskan molekul kecil, umumnya air. Protein, nilon, dan pati terbentuk dengan cara ini.'
      },
      {
        q: 'Suatu bahan makanan diuji dengan Biuret dan berubah menjadi ungu. Bahan tersebut mengandung…',
        options: ['Amilum', 'Glukosa', 'Protein', 'Lemak'],
        answer: 2,
        explain: 'Uji Biuret mendeteksi ikatan peptida yang hanya terdapat pada protein. Warna ungu menandakan hasil positif.'
      },
      {
        q: 'Amilum dan selulosa sama-sama polimer glukosa, tetapi manusia hanya dapat mencerna amilum. Penyebabnya adalah…',
        options: [
          'Selulosa bukan karbohidrat',
          'Jenis ikatan antarglukosanya berbeda sehingga enzim manusia tidak cocok',
          'Selulosa tidak larut dalam air',
          'Amilum memiliki monomer yang berbeda'
        ],
        answer: 1,
        explain: 'Arah ikatan glikosida pada amilum dan selulosa berbeda. Enzim amilase manusia hanya cocok dengan ikatan pada amilum. Hewan pemamah biak dapat mencerna selulosa karena dibantu bakteri bersenzim selulase.'
      },
      {
        q: 'Manakah polimer yang terbentuk melalui polimerisasi adisi?',
        options: ['Nilon 6,6', 'Protein', 'Polietilena', 'PET'],
        answer: 2,
        explain: 'Polietilena terbentuk dari monomer etena yang memiliki ikatan rangkap C=C. Ikatan rangkap terbuka lalu menyambung tanpa melepaskan zat lain — ciri polimerisasi adisi.'
      }
    ]
  });
})();
