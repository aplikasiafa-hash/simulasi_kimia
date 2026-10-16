/* Reaksi Redoks dan Bilangan Oksidasi — Fase E
   Tentukan bilangan oksidasi tiap atom, kenali oksidator dan reduktor,
   dan telusuri perpindahan elektron pada contoh reaksi nyata. */

(function () {
  'use strict';

  const D = Sim.Draw, P = Sim.P;
  const C = Chem;

  const W = 790, H = 570;

  // bo: bilangan oksidasi tiap atom dalam urutan yang digambar
  const REAKSI = [
    {
      id: 'besi-tembaga',
      nama: 'Fe + CuSO₄ → FeSO₄ + Cu',
      kiri:  [{ z: 'Fe', bo: 0 }, { z: 'Cu²⁺', bo: 2 }],
      kanan: [{ z: 'Fe²⁺', bo: 2 }, { z: 'Cu', bo: 0 }],
      teroks: 'Fe', tered: 'Cu²⁺', e: 2,
      cerita: 'Paku besi dicelupkan ke larutan biru tembaga(II) sulfat. Lapisan tembaga merah menempel di paku dan larutan memudar.'
    },
    {
      id: 'seng-hcl',
      nama: 'Zn + 2HCl → ZnCl₂ + H₂',
      kiri:  [{ z: 'Zn', bo: 0 }, { z: 'H⁺', bo: 1 }],
      kanan: [{ z: 'Zn²⁺', bo: 2 }, { z: 'H₂', bo: 0 }],
      teroks: 'Zn', tered: 'H⁺', e: 2,
      cerita: 'Logam seng dimasukkan ke asam klorida. Muncul gelembung gas hidrogen dan seng perlahan larut.'
    },
    {
      id: 'karat',
      nama: '4Fe + 3O₂ → 2Fe₂O₃',
      kiri:  [{ z: 'Fe', bo: 0 }, { z: 'O₂', bo: 0 }],
      kanan: [{ z: 'Fe³⁺', bo: 3 }, { z: 'O²⁻', bo: -2 }],
      teroks: 'Fe', tered: 'O₂', e: 3,
      cerita: 'Perkaratan besi — reaksi redoks paling merugikan di dunia, merusak jembatan dan kendaraan setiap hari.'
    },
    {
      id: 'bakar',
      nama: 'CH₄ + 2O₂ → CO₂ + 2H₂O',
      kiri:  [{ z: 'C (CH₄)', bo: -4 }, { z: 'O₂', bo: 0 }],
      kanan: [{ z: 'C (CO₂)', bo: 4 }, { z: 'O (H₂O)', bo: -2 }],
      teroks: 'C', tered: 'O₂', e: 8,
      cerita: 'Pembakaran gas metana di kompor. Semua reaksi pembakaran adalah reaksi redoks.'
    },
    {
      id: 'fotosintesis',
      nama: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂',
      kiri:  [{ z: 'C (CO₂)', bo: 4 }, { z: 'O (H₂O)', bo: -2 }],
      kanan: [{ z: 'C (glukosa)', bo: 0 }, { z: 'O₂', bo: 0 }],
      teroks: 'O', tered: 'C', e: 24,
      cerita: 'Fotosintesis — karbon direduksi menjadi gula, oksigen dioksidasi menjadi O₂. Sumber hampir seluruh energi makhluk hidup.'
    }
  ];

  const SENYAWA_UJI = [
    { r: 'H2SO4', atom: ['H', 'S', 'O'], bo: [1, 6, -2] },
    { r: 'KMnO4', atom: ['K', 'Mn', 'O'], bo: [1, 7, -2] },
    { r: 'K2Cr2O7', atom: ['K', 'Cr', 'O'], bo: [1, 6, -2] },
    { r: 'NH3', atom: ['N', 'H'], bo: [-3, 1] },
    { r: 'HNO3', atom: ['H', 'N', 'O'], bo: [1, 5, -2] },
    { r: 'Na2S2O3', atom: ['Na', 'S', 'O'], bo: [1, 2, -2] },
    { r: 'H2O2', atom: ['H', 'O'], bo: [1, -1] },
    { r: 'CaCO3', atom: ['Ca', 'C', 'O'], bo: [2, 4, -2] }
  ];

  function reaksiAktif(sim) {
    return REAKSI.find(function (r) { return r.id === sim.get('reaksi'); }) || REAKSI[0];
  }

  function siapkan(sim) {
    sim.data.a = 0;
    sim.data.jalan = false;
  }

  Sim.create({
    title: 'Reaksi Redoks dan Bilangan Oksidasi',
    subtitle: 'Reduksi dan oksidasi selalu terjadi bersamaan: elektron yang dilepas satu pihak pasti diterima pihak lain. Bilangan oksidasi adalah cara melacaknya.',
    fase: 'E', jenjang: 'SMA Kelas 10',
    topik: ['Redoks', 'Bilangan Oksidasi'],
    stage: { w: W, h: H },

    controls: [
      {
        title: 'Reaksi yang ditelusuri',
        items: [
          { type: 'select', id: 'reaksi', value: 'besi-tembaga', label: 'Pilih reaksi',
            options: REAKSI.map(function (r) { return { value: r.id, label: r.nama }; }) },
          { type: 'buttons', label: '', items: [
            { label: '▶ Pindahkan elektron', primary: true, onClick: function (sim) {
              sim.data.jalan = true; sim.data.a = 0;
            } },
            { label: '↺ Ulangi', onClick: function (sim) { sim.data.a = 0; sim.data.jalan = false; } }
          ] }
        ]
      },
      {
        title: 'Latihan bilangan oksidasi',
        items: [
          { type: 'select', id: 'senyawa', value: 0, label: 'Tentukan b.o. dalam',
            options: SENYAWA_UJI.map(function (s, i) {
              return { value: i, label: Sim.formula(s.r) }; }) },
          { type: 'toggle', id: 'kunci', value: false, label: 'Tampilkan jawaban',
            hint: 'Hitung sendiri dulu dengan aturan di panel bawah.' }
        ]
      },
      {
        title: 'Tampilan',
        items: [
          { type: 'toggle', id: 'garis', value: true, label: 'Garis perubahan b.o.' },
          { type: 'toggle', id: 'aturan', value: true, label: 'Aturan bilangan oksidasi' }
        ]
      }
    ],

    readouts: [
      { id: 'oksidasi', label: 'Mengalami oksidasi', tone: 'warn' },
      { id: 'reduksi', label: 'Mengalami reduksi' },
      { id: 'oksidator', label: 'Oksidator' },
      { id: 'reduktor', label: 'Reduktor' }
    ],

    setup: siapkan,
    reset: siapkan,
    onChange: function (sim, id) { if (id === 'reaksi') { sim.data.a = 0; sim.data.jalan = false; } },

    update: function (sim, dt) {
      if (sim.data.jalan) {
        sim.data.a += dt * 0.5;
        if (sim.data.a >= 1) { sim.data.a = 1; sim.data.jalan = false; }
      }
    },

    draw: function (c, sim) {
      const R = reaksiAktif(sim);
      const a = sim.data.a;

      /* ---------- persamaan ---------- */
      D.text(c, 'REAKSI YANG DITELUSURI', 40, 42,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
      D.text(c, R.nama, 40, 70, { size: 22, weight: 700, color: P.accent2, base: 'middle', mono: true });
      D.text(c, R.cerita, 40, 94, { size: 12, weight: 500, color: P.faint, base: 'middle' });

      /* ---------- diagram bilangan oksidasi ---------- */
      const DY = 150, DH = 150;
      D.roundRect(c, 40, DY - 26, W - 80, DH + 56, 12,
        'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'PERUBAHAN BILANGAN OKSIDASI', 58, DY - 6,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });

      // sumbu bilangan oksidasi
      const semuaBo = R.kiri.concat(R.kanan).map(function (q) { return q.bo; });
      const loBo = Math.min.apply(null, semuaBo) - 1;
      const hiBo = Math.max.apply(null, semuaBo) + 1;
      const sy = function (bo) { return DY + 108 - (bo - loBo) / (hiBo - loBo) * 96; };

      // garis sumbu
      for (let b = Math.ceil(loBo); b <= hiBo; b++) {
        const y = sy(b);
        D.line(c, 150, y, W - 100, y, b === 0 ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.07)',
          b === 0 ? 1.4 : 1);
        D.text(c, (b > 0 ? '+' : '') + b, 142, y,
          { size: 10.5, weight: 600, color: b === 0 ? P.dim : P.faint, align: 'r', base: 'middle' });
      }
      D.text(c, 'b.o.', 142, DY + 2, { size: 10, weight: 700, color: P.faint, align: 'r', base: 'middle' });

      const xKiri = 250, xKanan = W - 190;
      D.text(c, 'SEBELUM', xKiri, DY + 128,
        { size: 10.5, weight: 700, color: P.blue, align: 'c', base: 'middle' });
      D.text(c, 'SESUDAH', xKanan, DY + 128,
        { size: 10.5, weight: 700, color: P.amber, align: 'c', base: 'middle' });

      // titik dan garis perubahan
      R.kiri.forEach(function (zk, i) {
        const zn = R.kanan[i];
        const y1 = sy(zk.bo), y2 = sy(zn.bo);
        const naik = zn.bo > zk.bo;
        const warna = naik ? '#ef6a52' : '#5b9bf5';

        if (sim.get('garis')) {
          c.save();
          c.setLineDash([5, 4]);
          D.line(c, xKiri + 14, y1, xKanan - 14, y2, D.alpha(warna, 0.4), 1.6);
          c.restore();
          D.arrow(c, xKiri + 60, Sim.lerp(y1, y2, 0.25),
            xKanan - 60, Sim.lerp(y1, y2, 0.75), warna, 2.2, 8);
          const my = (y1 + y2) / 2;
          const label = naik ? 'OKSIDASI (b.o. naik, melepas e⁻)' : 'REDUKSI (b.o. turun, menerima e⁻)';
          D.roundRect(c, (xKiri + xKanan) / 2 - 100, my - 12, 200, 22, 11,
            D.alpha(warna, 0.16), warna, 1.2);
          D.text(c, label, (xKiri + xKanan) / 2, my - 1,
            { size: 10.5, weight: 700, color: warna, align: 'c', base: 'middle' });
        }

        D.circle(c, xKiri, y1, 13, warna, 'rgba(255,255,255,.3)', 1.4);
        D.text(c, (zk.bo > 0 ? '+' : '') + zk.bo, xKiri, y1,
          { size: 11, weight: 800, color: '#fff', align: 'c', base: 'middle' });
        D.text(c, zk.z, xKiri - 24, y1,
          { size: 13, weight: 700, color: P.text, align: 'r', base: 'middle' });

        D.circle(c, xKanan, y2, 13, warna, 'rgba(255,255,255,.3)', 1.4);
        D.text(c, (zn.bo > 0 ? '+' : '') + zn.bo, xKanan, y2,
          { size: 11, weight: 800, color: '#fff', align: 'c', base: 'middle' });
        D.text(c, zn.z, xKanan + 24, y2,
          { size: 13, weight: 700, color: P.text, base: 'middle' });
      });

      // elektron bergerak
      if (a > 0) {
        const y1 = sy(R.kiri[0].bo), y2 = sy(R.kiri[1].bo);
        const n = Math.min(R.e, 4);
        for (let i = 0; i < n; i++) {
          const t = Sim.clamp(a * 1.5 - i * 0.14, 0, 1);
          const px = Sim.lerp(xKiri, xKanan, t);
          const py = Sim.lerp(y1, y2, t) - Math.sin(t * Math.PI) * 22;
          D.circle(c, px, py, 6, P.amber, 'rgba(0,0,0,.3)', 1);
          D.text(c, 'e⁻', px, py, { size: 8, weight: 800, color: '#06201d', align: 'c', base: 'middle' });
        }
        if (a > 0.6) {
          D.text(c, R.e + ' elektron berpindah', (xKiri + xKanan) / 2, DY + 128,
            { size: 11.5, weight: 700, color: P.amber, align: 'c', base: 'middle' });
        }
      }

      /* ---------- oksidator & reduktor ---------- */
      const OY = 346;
      [['REDUKTOR', R.teroks, 'Zat yang mengalami OKSIDASI.\nIa mereduksi zat lain dengan memberi elektron.', '#ef6a52'],
       ['OKSIDATOR', R.tered, 'Zat yang mengalami REDUKSI.\nIa mengoksidasi zat lain dengan mengambil elektron.', '#5b9bf5']
      ].forEach(function (q, i) {
        const x = 40 + i * ((W - 80) / 2 + 8);
        const w = (W - 80) / 2 - 8;
        D.roundRect(c, x, OY, w, 92, 12, D.alpha(q[3], 0.1), q[3], 1.5);
        D.text(c, q[0], x + 18, OY + 22,
          { size: 12.5, weight: 800, color: q[3], base: 'middle' });
        D.text(c, q[1], x + 18, OY + 48,
          { size: 20, weight: 700, color: P.text, base: 'middle' });
        q[2].split('\n').forEach(function (s, k) {
          D.text(c, s, x + 18, OY + 68 + k * 15,
            { size: 11, weight: 500, color: P.dim, base: 'middle' });
        });
      });

      /* ---------- latihan bilangan oksidasi ---------- */
      const LY = 452;
      D.roundRect(c, 40, LY, 360, 100, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'LATIHAN: TENTUKAN BILANGAN OKSIDASI', 58, LY + 20,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
      const s = SENYAWA_UJI[parseInt(sim.get('senyawa'), 10) || 0];
      D.text(c, Sim.formula(s.r), 58, LY + 48,
        { size: 24, weight: 700, color: P.accent2, base: 'middle' });
      s.atom.forEach(function (at, i) {
        const x = 170 + i * 70;
        D.text(c, at, x, LY + 40,
          { size: 13, weight: 700, color: C.warnaAtom(at), align: 'c', base: 'middle' });
        D.roundRect(c, x - 22, LY + 52, 44, 26, 5,
          sim.get('kunci') ? D.alpha(P.accent, 0.16) : 'rgba(255,255,255,.04)',
          sim.get('kunci') ? P.accent : 'rgba(255,255,255,.16)', 1.3);
        D.text(c, sim.get('kunci') ? (s.bo[i] > 0 ? '+' : '') + s.bo[i] : '?',
          x, LY + 65, {
            size: 15, weight: 700, align: 'c', base: 'middle',
            color: sim.get('kunci') ? P.accent2 : P.faint
          });
      });
      D.text(c, sim.get('kunci')
        ? 'Jumlah b.o. × jumlah atom = 0 untuk senyawa netral.'
        : 'Hitung sendiri, lalu nyalakan "Tampilkan jawaban".',
        58, LY + 90, { size: 11, weight: 500, color: P.faint, base: 'middle' });

      /* ---------- aturan ---------- */
      if (sim.get('aturan')) {
        D.roundRect(c, 412, LY, 346, 100, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
        D.text(c, 'ATURAN BILANGAN OKSIDASI', 430, LY + 20,
          { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
        const at = [
          'Unsur bebas = 0  (Fe, O₂, H₂, Cl₂)',
          'H = +1 (kecuali hidrida logam, −1)',
          'O = −2 (kecuali peroksida, −1)',
          'Logam gol. IA = +1, IIA = +2',
          'Jumlah b.o. senyawa netral = 0, ion = muatannya'
        ];
        at.forEach(function (q, i) {
          D.text(c, '• ' + q, 430, LY + 38 + i * 14,
            { size: 10.5, weight: 500, color: P.dim, base: 'middle' });
        });
      }
    },

    readoutsUpdate: function (sim) {
      const R = reaksiAktif(sim);
      sim.readout('oksidasi', R.teroks);
      sim.readout('reduksi', R.tered);
      sim.readout('oksidator', R.tered);
      sim.readout('reduktor', R.teroks);
    },

    notes: `
      <p>Dulu "oksidasi" hanya berarti pengikatan oksigen. Pengertiannya kemudian
      diperluas, dan definisi yang berlaku sekarang adalah
      <strong>perpindahan elektron</strong> — yang dilacak lewat
      <strong>bilangan oksidasi</strong>.</p>

      <h3>Tiga sudut pandang yang sama</h3>
      <table>
        <thead><tr><th>Dasar</th><th>Oksidasi</th><th>Reduksi</th></tr></thead>
        <tbody>
          <tr><td>Oksigen</td><td>mengikat O</td><td>melepas O</td></tr>
          <tr><td>Elektron</td><td>melepas e⁻</td><td>menerima e⁻</td></tr>
          <tr><td>Bilangan oksidasi</td><td>b.o. naik</td><td>b.o. turun</td></tr>
        </tbody>
      </table>

      <p>Cara mengingat: <strong>OKSIDASI NAIK, REDUKSI TURUN</strong>.</p>

      <h3>Oksidator dan reduktor</h3>
      <p>Bagian ini paling sering tertukar, karena namanya terasa terbalik:</p>
      <ul>
        <li><strong>Oksidator</strong> (pengoksidasi) — zat yang <em>mengalami reduksi</em>.
            Ia mengambil elektron, sehingga zat lain teroksidasi.</li>
        <li><strong>Reduktor</strong> (pereduksi) — zat yang <em>mengalami oksidasi</em>.
            Ia memberi elektron, sehingga zat lain tereduksi.</li>
      </ul>
      <p>Logikanya: oksidator <em>membuat zat lain</em> teroksidasi, bukan dirinya sendiri.</p>

      <h3>Aturan menentukan bilangan oksidasi</h3>
      <ol>
        <li>Unsur bebas (Fe, O₂, H₂, Cl₂, P₄) selalu <strong>0</strong>.</li>
        <li>Ion monoatom = muatannya. Na⁺ → +1, S²⁻ → −2.</li>
        <li><strong>H = +1</strong>, kecuali dalam hidrida logam (NaH, CaH₂) → −1.</li>
        <li><strong>O = −2</strong>, kecuali dalam peroksida (H₂O₂) → −1, dan dalam OF₂ → +2.</li>
        <li>Logam golongan IA = +1, IIA = +2, Al = +3.</li>
        <li>Jumlah seluruh b.o. dalam senyawa netral = <strong>0</strong>;
            dalam ion poliatom = <strong>muatan ionnya</strong>.</li>
      </ol>

      <p>Contoh H₂SO₄: H berjumlah 2 (2 × +1 = +2), O berjumlah 4 (4 × −2 = −8).
      Agar jumlahnya nol: +2 + x + (−8) = 0, sehingga b.o. S = <strong>+6</strong>.</p>

      <h3>Redoks ada di mana-mana</h3>
      <p>Pembakaran bahan bakar, perkaratan besi, fotosintesis, pernapasan sel, baterai
      ponsel, dan pemutihan pakaian — semuanya reaksi redoks. Reaksi yang mendukung
      kehidupan dan reaksi yang merusak logam ternyata mengikuti aturan yang sama.</p>

      <div class="callout" data-tone="tip">
        <strong>Selalu berpasangan</strong>
        Tidak ada oksidasi tanpa reduksi. Elektron tidak bisa hilang begitu saja — kalau
        satu zat melepasnya, pasti ada zat lain yang menerimanya. Karena itu namanya
        reaksi <em>redoks</em>, gabungan reduksi dan oksidasi.
      </div>
    `,

    explore: [
      'Pilih <strong>Fe + CuSO₄</strong>. Bilangan oksidasi besi berubah dari berapa ke berapa? Naik atau turun?',
      'Pada reaksi yang sama, tembaga berubah dari +2 ke 0. Siapa oksidatornya?',
      'Lihat <strong>Fotosintesis</strong>. Karbon turun dari +4 ke 0 — artinya karbon mengalami apa?',
      'Buka latihan dan tentukan b.o. mangan dalam KMnO₄ sebelum melihat kunci jawaban.'
    ],

    quiz: [
      {
        q: 'Dalam reaksi Zn + 2HCl → ZnCl₂ + H₂, yang bertindak sebagai reduktor adalah…',
        options: ['Zn', 'HCl', 'ZnCl₂', 'H₂'],
        answer: 0,
        explain: 'Zn berubah dari b.o. 0 menjadi +2, berarti melepas elektron dan mengalami oksidasi. Zat yang mengalami oksidasi disebut reduktor, karena ia mereduksi zat lain.'
      },
      {
        q: 'Bilangan oksidasi mangan dalam KMnO₄ adalah…',
        options: ['+2', '+4', '+6', '+7'],
        answer: 3,
        explain: 'K = +1, O = −2 dengan 4 atom sehingga −8. Agar jumlahnya nol: +1 + x − 8 = 0, maka x = +7.'
      },
      {
        q: 'Suatu zat mengalami penurunan bilangan oksidasi dalam reaksi. Zat tersebut…',
        options: [
          'Mengalami oksidasi dan bertindak sebagai reduktor',
          'Mengalami reduksi dan bertindak sebagai oksidator',
          'Mengalami oksidasi dan bertindak sebagai oksidator',
          'Tidak mengalami redoks'
        ],
        answer: 1,
        explain: 'Bilangan oksidasi turun berarti zat menerima elektron, yaitu mengalami reduksi. Zat yang mengalami reduksi berperan sebagai oksidator terhadap zat lain.'
      },
      {
        q: 'Bilangan oksidasi oksigen dalam H₂O₂ adalah −1, bukan −2. Senyawa semacam ini disebut…',
        options: ['Oksida', 'Peroksida', 'Hidrida', 'Superoksida'],
        answer: 1,
        explain: 'H₂O₂ adalah peroksida, yaitu senyawa dengan ikatan O—O. Dalam peroksida, bilangan oksidasi oksigen menjadi −1, menyimpang dari aturan umum −2.'
      }
    ]
  });
})();
