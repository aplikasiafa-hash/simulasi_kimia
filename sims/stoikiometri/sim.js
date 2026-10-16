/* Konsep Mol dan Stoikiometri — Fase E
   Reaksikan zat dengan jumlah mol pilihan sendiri, temukan pereaksi pembatas,
   dan baca diagram batang mol sebelum/sesudah reaksi. */

(function () {
  'use strict';

  const D = Sim.Draw, P = Sim.P;
  const C = Chem;

  const W = 790, H = 570;

  const REAKSI = [
    { id: 'air', nama: '2H₂ + O₂ → 2H₂O',
      kiri: [{ r: 'H2', k: 2 }, { r: 'O2', k: 1 }],
      kanan: [{ r: 'H2O', k: 2 }] },
    { id: 'amonia', nama: 'N₂ + 3H₂ → 2NH₃',
      kiri: [{ r: 'N2', k: 1 }, { r: 'H2', k: 3 }],
      kanan: [{ r: 'NH3', k: 2 }] },
    { id: 'metana', nama: 'CH₄ + 2O₂ → CO₂ + 2H₂O',
      kiri: [{ r: 'CH4', k: 1 }, { r: 'O2', k: 2 }],
      kanan: [{ r: 'CO2', k: 1 }, { r: 'H2O', k: 2 }] },
    { id: 'besi', nama: '4Fe + 3O₂ → 2Fe₂O₃',
      kiri: [{ r: 'Fe', k: 4 }, { r: 'O2', k: 3 }],
      kanan: [{ r: 'Fe2O3', k: 2 }] },
    { id: 'kapur', nama: 'CaCO₃ → CaO + CO₂',
      kiri: [{ r: 'CaCO3', k: 1 }],
      kanan: [{ r: 'CaO', k: 1 }, { r: 'CO2', k: 1 }] },
    { id: 'netral', nama: 'H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O',
      kiri: [{ r: 'H2SO4', k: 1 }, { r: 'NaOH', k: 2 }],
      kanan: [{ r: 'Na2SO4', k: 1 }, { r: 'H2O', k: 2 }] }
  ];

  const WARNA = ['#5b9bf5', '#f0a94a', '#4fd1c0', '#b795f0', '#6fcf7f', '#f0718f'];

  function reaksiAktif(sim) {
    return REAKSI.find(function (r) { return r.id === sim.get('reaksi'); }) || REAKSI[0];
  }

  function hitung(sim) {
    const R = reaksiAktif(sim);
    const molAwal = [sim.get('n1'), sim.get('n2')];

    // berapa kali reaksi dapat berlangsung
    let kali = Infinity, pembatas = null;
    R.kiri.forEach(function (z, i) {
      const k = molAwal[i] / z.k;
      if (k < kali) { kali = k; pembatas = z.r; }
    });
    if (!isFinite(kali)) kali = 0;

    const hasil = R.kanan.map(function (z) {
      return { r: z.r, mol: kali * z.k, massa: kali * z.k * C.massaMolar(z.r) };
    });
    const sisa = R.kiri.map(function (z, i) {
      const terpakai = kali * z.k;
      return {
        r: z.r, awal: molAwal[i], pakai: terpakai, sisa: molAwal[i] - terpakai,
        MrZ: C.massaMolar(z.r)
      };
    });
    return { kali: kali, pembatas: pembatas, hasil: hasil, sisa: sisa };
  }

  function siapkan(sim) {
    sim.data.a = 0;
    sim.data.jalan = false;
  }

  Sim.create({
    title: 'Konsep Mol dan Stoikiometri',
    subtitle: 'Mol adalah satuan hitung kimia: 6,022 × 10²³ partikel. Koefisien reaksi menyatakan perbandingan mol — dan dari sanalah seluruh perhitungan dimulai.',
    fase: 'E', jenjang: 'SMA Kelas 10',
    topik: ['Mol', 'Stoikiometri', 'Pereaksi Pembatas'],
    stage: { w: W, h: H },

    controls: [
      {
        title: 'Reaksi',
        items: [
          { type: 'select', id: 'reaksi', value: 'air', label: 'Pilih reaksi',
            options: REAKSI.map(function (r) { return { value: r.id, label: r.nama }; }) }
        ]
      },
      {
        title: 'Jumlah pereaksi',
        items: [
          { type: 'slider', id: 'n1', value: 4, min: 0, max: 12, step: 0.5,
            label: 'Mol pereaksi pertama', unit: 'mol', dec: 1 },
          { type: 'slider', id: 'n2', value: 3, min: 0, max: 12, step: 0.5,
            label: 'Mol pereaksi kedua', unit: 'mol', dec: 1,
            hint: 'Abaikan bila reaksinya hanya punya satu pereaksi.' },
          { type: 'buttons', label: '', items: [
            { label: '▶ Reaksikan', primary: true, onClick: function (sim) {
              sim.data.jalan = true; sim.data.a = 0;
            } },
            { label: 'Buat pas (stoikiometris)', onClick: function (sim) {
              const R = reaksiAktif(sim);
              const n1 = sim.get('n1');
              const kali = n1 / R.kiri[0].k;
              if (R.kiri[1]) sim.set('n2', Math.round(kali * R.kiri[1].k * 2) / 2);
            } }
          ] }
        ]
      },
      {
        title: 'Tampilan',
        items: [
          { type: 'toggle', id: 'massa', value: true, label: 'Tampilkan massa (gram)' },
          { type: 'toggle', id: 'partikel', value: true, label: 'Tampilkan jumlah partikel' },
          { type: 'toggle', id: 'langkah', value: true, label: 'Tampilkan langkah hitungan' }
        ]
      }
    ],

    readouts: [
      { id: 'pembatas', label: 'Pereaksi pembatas', tone: 'warn' },
      { id: 'hasil', label: 'Hasil utama' },
      { id: 'massaHasil', label: 'Massa hasil' },
      { id: 'sisa', label: 'Pereaksi sisa' }
    ],

    setup: siapkan,
    reset: siapkan,
    onChange: function (sim, id) { if (id === 'reaksi') { sim.data.a = 0; sim.data.jalan = false; } },

    update: function (sim, dt) {
      if (sim.data.jalan) {
        sim.data.a += dt * 0.6;
        if (sim.data.a >= 1) { sim.data.a = 1; sim.data.jalan = false; }
      }
    },

    draw: function (c, sim) {
      const R = reaksiAktif(sim);
      const h = hitung(sim);
      const a = sim.data.a;

      /* ---------- persamaan reaksi ---------- */
      D.text(c, 'PERSAMAAN REAKSI SETARA', 40, 44,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
      D.text(c, R.nama, 40, 74, { size: 24, weight: 700, color: P.accent2, base: 'middle', mono: true });

      /* ---------- diagram batang mol ---------- */
      const GX = 60, GY = 130, GW = 400, GH = 150;
      const semua = R.kiri.map(function (z, i) {
        return { r: z.r, mol: h.sisa[i].awal, warna: WARNA[i], kelompok: 'pereaksi' };
      }).concat(R.kanan.map(function (z, i) {
        return { r: z.r, mol: 0, warna: WARNA[R.kiri.length + i], kelompok: 'hasil' };
      }));

      // nilai saat animasi berjalan
      const data = semua.map(function (z, i) {
        if (z.kelompok === 'pereaksi') {
          const s = h.sisa[i];
          return { label: Sim.formula(z.r), nilai: s.awal - (s.pakai * a), warna: z.warna,
            teks: Sim.fmt(s.awal - s.pakai * a, 2) };
        }
        const hh = h.hasil[i - R.kiri.length];
        return { label: Sim.formula(z.r), nilai: hh.mol * a, warna: z.warna,
          teks: Sim.fmt(hh.mol * a, 2) };
      });

      const maksMol = Math.max(1, Math.max.apply(null,
        h.sisa.map(function (s) { return s.awal; })
          .concat(h.hasil.map(function (q) { return q.mol; }))));

      D.text(c, 'JUMLAH MOL', GX, GY - 12,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
      Plot.batang(c, {
        x: GX, y: GY, w: GW, h: GH, data: data,
        max: maksMol * 1.15, min: 0, celah: 18
      });

      // garis pembatas pereaksi/hasil
      const lebarBatang = (GW - 18 * (data.length - 1)) / data.length;
      const batasX = GX + R.kiri.length * (lebarBatang + 18) - 9;
      D.line(c, batasX, GY - 4, batasX, GY + GH + 4, 'rgba(255,255,255,.22)', 1.4, [5, 4]);
      D.text(c, 'PEREAKSI', GX + 4, GY + GH + 34,
        { size: 10, weight: 700, color: P.blue, base: 'middle' });
      D.text(c, 'HASIL', batasX + 10, GY + GH + 34,
        { size: 10, weight: 700, color: P.accent, base: 'middle' });

      /* ---------- tabel MRS (mula-mula, reaksi, sisa) ---------- */
      const TX = 492, TW = 266;
      D.roundRect(c, TX, GY - 24, TW, 196, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'TABEL MRS', TX + 16, GY - 4,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });

      const kolX = [TX + 16, TX + 110, TX + 170, TX + 228];
      ['Zat', 'Mula²', 'Reaksi', 'Sisa'].forEach(function (hh, i) {
        D.text(c, hh, kolX[i], GY + 18,
          { size: 10, weight: 700, color: P.faint, base: 'middle' });
      });
      D.line(c, TX + 14, GY + 28, TX + TW - 14, GY + 28, 'rgba(255,255,255,.14)', 1);

      let baris = 0;
      h.sisa.forEach(function (s, i) {
        const y = GY + 46 + baris * 24;
        const batas = s.r === h.pembatas;
        if (batas) D.roundRect(c, TX + 10, y - 11, TW - 20, 22, 4, 'rgba(240,169,74,.12)');
        D.circle(c, kolX[0] + 4, y, 4.5, WARNA[i]);
        D.text(c, Sim.formula(s.r), kolX[0] + 14, y,
          { size: 11.5, weight: batas ? 700 : 500, color: batas ? P.amber : P.dim, base: 'middle' });
        D.text(c, Sim.fmt(s.awal, 2), kolX[1] + 40, y,
          { size: 11, weight: 600, color: P.dim, align: 'r', base: 'middle', mono: true });
        D.text(c, '−' + Sim.fmt(s.pakai * a, 2), kolX[2] + 40, y,
          { size: 11, weight: 600, color: P.rose, align: 'r', base: 'middle', mono: true });
        D.text(c, Sim.fmt(s.awal - s.pakai * a, 2), kolX[3] + 30, y,
          { size: 11, weight: 700, color: P.text, align: 'r', base: 'middle', mono: true });
        baris++;
      });
      h.hasil.forEach(function (q, i) {
        const y = GY + 46 + baris * 24;
        D.circle(c, kolX[0] + 4, y, 4.5, WARNA[R.kiri.length + i]);
        D.text(c, Sim.formula(q.r), kolX[0] + 14, y,
          { size: 11.5, weight: 500, color: P.dim, base: 'middle' });
        D.text(c, '0', kolX[1] + 40, y,
          { size: 11, weight: 600, color: P.faint, align: 'r', base: 'middle', mono: true });
        D.text(c, '+' + Sim.fmt(q.mol * a, 2), kolX[2] + 40, y,
          { size: 11, weight: 600, color: P.green, align: 'r', base: 'middle', mono: true });
        D.text(c, Sim.fmt(q.mol * a, 2), kolX[3] + 30, y,
          { size: 11, weight: 700, color: P.accent2, align: 'r', base: 'middle', mono: true });
        baris++;
      });

      if (h.pembatas) {
        D.text(c, '⬤ ' + Sim.formula(h.pembatas) + ' habis lebih dulu — inilah pereaksi pembatas.',
          TX + 16, GY + 160, { size: 11, weight: 600, color: P.amber, base: 'middle' });
      }

      /* ---------- langkah hitungan ---------- */
      if (sim.get('langkah')) {
        const LX = 40, LY = 324;
        D.roundRect(c, LX, LY, W - 80, 136, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
        D.text(c, 'LANGKAH PERHITUNGAN', LX + 18, LY + 20,
          { size: 10.5, weight: 700, color: P.faint, base: 'middle' });

        const p = h.sisa.find(function (s) { return s.r === h.pembatas; }) || h.sisa[0];
        const hUtama = h.hasil[0];
        const koefP = R.kiri.find(function (z) { return z.r === p.r; });
        const koefH = R.kanan[0];

        const langkah = [
          '1.  Tentukan perbandingan mol dari koefisien: ' +
            R.kiri.map(function (z) { return z.k + ' ' + Sim.formula(z.r); }).join(' : ') +
            ' → ' + R.kanan.map(function (z) { return z.k + ' ' + Sim.formula(z.r); }).join(' : '),
          '2.  Bagi mol tiap pereaksi dengan koefisiennya, ambil yang terkecil → pereaksi pembatas = ' +
            Sim.formula(h.pembatas || '—') + '  (' + Sim.fmt(h.kali, 2) + ' kali reaksi)',
          '3.  Mol hasil = koefisien hasil × banyaknya reaksi = ' + koefH.k + ' × ' +
            Sim.fmt(h.kali, 2) + ' = ' + Sim.fmt(hUtama.mol, 2) + ' mol ' + Sim.formula(hUtama.r),
          '4.  Massa hasil = mol × Mr = ' + Sim.fmt(hUtama.mol, 2) + ' × ' +
            Sim.fmt(C.massaMolar(hUtama.r), 2) + ' = ' + Sim.fmt(hUtama.massa, 2) + ' gram'
        ];
        langkah.forEach(function (s, i) {
          D.text(c, s, LX + 18, LY + 46 + i * 24,
            { size: 12, weight: i === 3 ? 650 : 500, color: i === 3 ? P.accent2 : P.dim, base: 'middle' });
        });
      }

      /* ---------- massa & partikel ---------- */
      const MY = 476;
      D.roundRect(c, 40, MY, W - 80, 76, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'TIGA CARA MENYATAKAN JUMLAH ZAT', 58, MY + 18,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });

      const hUtama = h.hasil[0];
      const kolom = [
        ['Jumlah mol', Sim.fmt(hUtama.mol * a, 3) + ' mol', P.accent2],
        ['Massa', Sim.fmt(hUtama.massa * a, 2) + ' g', P.amber],
        ['Jumlah partikel', Sim.sci(hUtama.mol * a * C.NA, 2) + ' butir', P.blue],
        ['Volume (STP)', Sim.fmt(hUtama.mol * a * 22.4, 2) + ' L', P.violet]
      ];
      kolom.forEach(function (k, i) {
        const x = 58 + i * 178;
        D.text(c, k[0], x, MY + 42, { size: 10.5, weight: 500, color: P.faint, base: 'middle' });
        D.text(c, k[1], x, MY + 62, { size: 14, weight: 700, color: k[2], base: 'middle', mono: true });
      });
      D.text(c, '(volume STP hanya berlaku bila zatnya berupa gas)', W - 58, MY + 18,
        { size: 10, weight: 500, color: P.faint, align: 'r', base: 'middle' });
    },

    readoutsUpdate: function (sim) {
      const h = hitung(sim);
      const hUtama = h.hasil[0];
      sim.readout('pembatas', h.pembatas ? Sim.formula(h.pembatas) : '—');
      sim.readout('hasil', Sim.fmt(hUtama.mol, 2) + '<span class="unit"> mol</span>');
      sim.readout('massaHasil', Sim.fmt(hUtama.massa, 1) + '<span class="unit"> g</span>');
      const sisa = h.sisa.filter(function (s) { return s.sisa > 0.005; });
      sim.readout('sisa', sisa.length
        ? Sim.fmt(sisa[0].sisa, 2) + ' mol ' + Sim.formula(sisa[0].r)
        : 'habis semua');
    },

    notes: `
      <p>Atom terlalu kecil untuk dihitung satu per satu. Kimiawan memakai satuan
      <strong>mol</strong>: satu mol berisi <strong>6,022 × 10²³</strong> partikel —
      bilangan Avogadro. Satu mol zat apa pun massanya sama dengan massa molekul
      relatifnya dalam gram.</p>

      <h3>Empat besaran yang saling terhubung</h3>
      <span class="formula">n = massa ÷ Mr          <span class="cmt">// mol dari gram</span>
n = jumlah partikel ÷ 6,022×10²³
n = volume ÷ 22,4 L     <span class="cmt">// khusus gas pada STP</span>
n = M × V               <span class="cmt">// untuk larutan</span></span>

      <h3>Mengapa koefisien reaksi penting?</h3>
      <p>Koefisien persamaan reaksi menyatakan <strong>perbandingan mol</strong>, bukan
      perbandingan massa. Pada 2H₂ + O₂ → 2H₂O, dua mol hidrogen bereaksi dengan satu mol
      oksigen. Dalam massa, angkanya menjadi 4 g berbanding 32 g — tidak lagi 2 : 1.</p>

      <p>Karena itu alur perhitungan stoikiometri selalu melewati mol:</p>
      <span class="formula">gram zat A → mol A → (perbandingan koefisien) → mol B → gram B</span>

      <h3>Pereaksi pembatas</h3>
      <p>Dalam praktiknya, pereaksi jarang dicampur tepat sesuai perbandingan koefisien.
      Zat yang <strong>habis lebih dulu</strong> disebut <strong>pereaksi pembatas</strong>,
      dan dialah yang menentukan banyaknya hasil reaksi. Zat lain yang bersisa disebut
      <strong>pereaksi berlebih</strong>.</p>

      <p>Cara menemukannya: bagi mol tiap pereaksi dengan koefisiennya, lalu ambil hasil
      bagi <strong>terkecil</strong>.</p>

      <h3>Tabel MRS</h3>
      <p>Tabel Mula-mula, Reaksi, Sisa adalah cara paling rapi mengerjakan soal
      stoikiometri. Baris "Reaksi" selalu mengikuti perbandingan koefisien, dan baris
      "Sisa" adalah hasil penjumlahannya.</p>

      <div class="callout" data-tone="tip">
        <strong>Analogi roti lapis</strong>
        Untuk membuat satu roti lapis perlu 2 lembar roti dan 1 potong keju. Bila tersedia
        10 lembar roti tetapi hanya 3 potong keju, yang bisa dibuat hanya 3 roti lapis.
        Keju adalah pereaksi pembatas, dan 4 lembar roti tersisa.
      </div>
    `,

    explore: [
      'Pilih reaksi air. Atur H₂ = 4 mol dan O₂ = 2 mol. Habis keduanya? Berapa mol air terbentuk?',
      'Naikkan O₂ menjadi 6 mol tanpa mengubah H₂. Siapa pereaksi pembatasnya sekarang? Apakah hasilnya bertambah?',
      'Pakai tombol <strong>Buat pas</strong> dan perhatikan baris Sisa pada tabel MRS menjadi nol semua.',
      'Pilih reaksi <strong>CaCO₃ → CaO + CO₂</strong>. Mengapa tidak ada pereaksi pembatas di sini?'
    ],

    quiz: [
      {
        q: 'Sebanyak 4 mol H₂ direaksikan dengan 1 mol O₂ menurut 2H₂ + O₂ → 2H₂O. Pereaksi pembatasnya adalah…',
        options: ['H₂', 'O₂', 'Keduanya habis bersamaan', 'Tidak dapat ditentukan'],
        answer: 1,
        explain: 'Bagi mol dengan koefisien: H₂ = 4/2 = 2, O₂ = 1/1 = 1. Nilai terkecil ada pada O₂, sehingga oksigen habis lebih dulu dan menjadi pereaksi pembatas. H₂ tersisa 2 mol.'
      },
      {
        q: 'Berapa jumlah partikel dalam 0,5 mol gas nitrogen?',
        options: ['3,011 × 10²³', '6,022 × 10²³', '1,204 × 10²⁴', '0,5 × 10²³'],
        answer: 0,
        explain: 'Jumlah partikel = n × 6,022 × 10²³ = 0,5 × 6,022 × 10²³ = 3,011 × 10²³ molekul.'
      },
      {
        q: 'Massa dari 2 mol CO₂ (Ar C = 12, O = 16) adalah…',
        options: ['44 g', '88 g', '22 g', '66 g'],
        answer: 1,
        explain: 'Mr CO₂ = 12 + (2 × 16) = 44. Massa = n × Mr = 2 × 44 = 88 gram.'
      },
      {
        q: 'Mengapa perhitungan stoikiometri harus melewati satuan mol, tidak bisa langsung dari gram ke gram?',
        options: [
          'Karena gram tidak dapat diukur dengan tepat',
          'Karena koefisien reaksi menyatakan perbandingan mol, bukan perbandingan massa',
          'Karena mol lebih mudah dihitung',
          'Karena massa tidak kekal dalam reaksi'
        ],
        answer: 1,
        explain: 'Koefisien menunjukkan berapa banyak partikel yang bereaksi, dan mol adalah satuan jumlah partikel. Karena massa tiap jenis partikel berbeda, perbandingan massa tidak sama dengan perbandingan koefisien.'
      }
    ]
  });
})();
