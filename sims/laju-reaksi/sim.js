/* Laju Reaksi dan Faktor-Faktornya — Fase F
   Ubah konsentrasi, suhu, luas permukaan, dan katalis; amati tumbukan
   partikel, grafik konsentrasi, dan diagram energi aktivasi. */

(function () {
  'use strict';

  const D = Sim.Draw, P = Sim.P;
  const C = Chem;

  const W = 800, H = 590;
  const KX = 46, KY = 118, KW = 290, KH = 190;

  function siapkan(sim) {
    const sys = new SistemPartikel({ x: KX, y: KY, w: KW, h: KH, tumbukan: true });
    sim.data.sys = sys;
    sim.data.konsenSisa = 1;
    sim.data.jejak = new Plot.Buffer(800);
    sim.data.jejakLaju = new Plot.Buffer(800);
    sim.data.tumbukan = 0;
    sim.data.efektif = 0;
    isiPartikel(sim);
  }

  function isiPartikel(sim) {
    const sys = sim.data.sys;
    sys.kosongkan();
    const n = Math.round(10 + sim.get('konsentrasi') * 22);
    const laju = 24 + sim.get('suhu') * 0.5;
    const r = sim.get('serbuk') ? 5 : 9;
    for (let i = 0; i < n; i++) {
      const a = Sim.rnd(0, Math.PI * 2);
      const v = laju * Sim.rnd(0.6, 1.5);
      sys.tambah(new Partikel(
        Sim.rnd(KX + 12, KX + KW - 12), Sim.rnd(KY + 12, KY + KH - 12),
        r, i % 2 === 0 ? '#5b9bf5' : '#f0a94a',
        { vx: Math.cos(a) * v, vy: Math.sin(a) * v, jenis: i % 2 === 0 ? 'A' : 'B' }
      ));
    }
  }

  /** Energi aktivasi efektif (kJ/mol). */
  function Ea(sim) {
    return sim.get('katalis') ? 32 : 58;
  }

  /** Laju reaksi relatif menurut faktor-faktornya. */
  function lajuReaksi(sim) {
    const konsen = sim.get('konsentrasi') * sim.data.konsenSisa;
    const orde = sim.get('orde');
    const T = sim.get('suhu') + 273;
    const k = C.arrhenius(2.6e7, Ea(sim), T);
    const luas = sim.get('serbuk') ? 2.1 : 1;
    return k * Math.pow(Math.max(konsen, 0), orde) * luas * 42;
  }

  Sim.create({
    title: 'Laju Reaksi dan Faktor-Faktornya',
    subtitle: 'Reaksi terjadi saat partikel bertumbukan dengan arah tepat dan energi cukup. Setiap faktor yang mempercepat reaksi bekerja lewat salah satu dari dua syarat itu.',
    fase: 'F', jenjang: 'SMA Kelas 11',
    topik: ['Laju Reaksi', 'Katalis', 'Energi Aktivasi'],
    stage: { w: W, h: H },

    controls: [
      {
        title: 'Faktor yang diubah',
        items: [
          { type: 'slider', id: 'konsentrasi', value: 1, min: 0.2, max: 2, step: 0.1,
            label: 'Konsentrasi awal', unit: 'M', dec: 1,
            hint: 'Lebih pekat berarti lebih banyak partikel per satuan volume.' },
          { type: 'slider', id: 'suhu', value: 25, min: 0, max: 100, step: 5,
            label: 'Suhu', unit: '°C', dec: 0,
            hint: 'Naik 10 °C umumnya melipatgandakan laju reaksi.' },
          { type: 'toggle', id: 'serbuk', value: false, label: 'Zat padat dihaluskan',
            hint: 'Serbuk punya luas permukaan sentuh jauh lebih besar.' },
          { type: 'toggle', id: 'katalis', value: false, label: 'Tambahkan katalis',
            hint: 'Katalis menyediakan jalan reaksi dengan energi aktivasi lebih rendah.' }
        ]
      },
      {
        title: 'Persamaan laju',
        items: [
          { type: 'segment', id: 'orde', value: 1, numeric: true, label: 'Orde reaksi terhadap A',
            options: [{ value: 0, label: 'Orde 0' }, { value: 1, label: 'Orde 1' }, { value: 2, label: 'Orde 2' }] }
        ]
      },
      {
        title: 'Tampilan',
        items: [
          { type: 'toggle', id: 'diagram', value: true, label: 'Diagram energi aktivasi' },
          { type: 'buttons', label: '', items: [
            { label: '↺ Ulangi reaksi', onClick: function (sim) {
              sim.data.konsenSisa = 1; sim.data.jejak.clear();
              sim.data.jejakLaju.clear(); sim.t = 0; isiPartikel(sim);
            } }
          ] }
        ]
      }
    ],

    readouts: [
      { id: 'laju', label: 'Laju reaksi', tone: 'accent' },
      { id: 'sisa', label: 'Sisa pereaksi' },
      { id: 'ea', label: 'Energi aktivasi' },
      { id: 'k', label: 'Tetapan laju k' }
    ],

    setup: siapkan,
    reset: siapkan,
    onChange: function (sim, id) {
      if (id === 'konsentrasi' || id === 'serbuk') isiPartikel(sim);
      if (id === 'suhu') {
        const target = 24 + sim.get('suhu') * 0.5;
        const sek = sim.data.sys.lajuRata();
        if (sek > 1) sim.data.sys.skalaLaju(Sim.clamp(target / sek, 0.4, 2.4));
      }
    },

    update: function (sim, dt) {
      const sys = sim.data.sys;
      sys.langkah(dt);

      // jaga laju partikel sesuai suhu
      const target = 24 + sim.get('suhu') * 0.5;
      const sek = sys.lajuRata();
      if (sek > 1) sys.skalaLaju(Sim.lerp(1, target / sek, Math.min(1, dt * 1.4)));

      // pereaksi berkurang menurut laju
      const v = lajuReaksi(sim);
      sim.data.konsenSisa = Math.max(0, sim.data.konsenSisa - v * dt * 0.09);

      // perkiraan tumbukan efektif
      const pecahanEfektif = Math.exp(-Ea(sim) * 1000 / (C.R * (sim.get('suhu') + 273)));
      sim.data.tumbukan += dt * sys.partikel.length * 2.2;
      sim.data.efektif += dt * sys.partikel.length * 2.2 * pecahanEfektif * 1e9;

      // sebagian partikel memudar seiring reaksi
      const hidup = Math.ceil(sys.partikel.length * (0.25 + sim.data.konsenSisa * 0.75));
      sys.partikel.forEach(function (p, i) { p.hidup = i < hidup; });

      sim.data.jejak.push(sim.t, sim.get('konsentrasi') * sim.data.konsenSisa);
      sim.data.jejakLaju.push(sim.t, v);
    },

    draw: function (c, sim) {
      const sys = sim.data.sys;
      const v = lajuReaksi(sim);
      const T = sim.get('suhu');

      /* ---------- wadah partikel ---------- */
      D.text(c, 'TUMBUKAN PARTIKEL', KX, 100,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
      D.roundRect(c, KX - 3, KY - 3, KW + 6, KH + 6, 5,
        'rgba(255,255,255,.03)', 'rgba(255,255,255,.3)', 2);
      sys.gambar(c, { label: false });

      // keterangan suhu & kondisi
      const info = [];
      info.push(Math.round(T) + ' °C');
      info.push(Sim.fmt(sim.get('konsentrasi'), 1) + ' M');
      if (sim.get('serbuk')) info.push('serbuk');
      if (sim.get('katalis')) info.push('+ katalis');
      D.roundRect(c, KX + 6, KY + 6, D.measure(c, info.join(' · '), { size: 11, weight: 600 }) + 20, 22, 11,
        'rgba(0,0,0,.45)');
      D.text(c, info.join(' · '), KX + 16, KY + 17,
        { size: 11, weight: 600, color: P.dim, base: 'middle' });

      // bilah sisa pereaksi
      D.text(c, 'Sisa pereaksi', KX, KY + KH + 24,
        { size: 10.5, weight: 600, color: P.faint, base: 'middle' });
      D.roundRect(c, KX, KY + KH + 32, KW, 14, 7, 'rgba(255,255,255,.07)');
      D.roundRect(c, KX, KY + KH + 32, KW * sim.data.konsenSisa, 14, 7,
        D.ramp(['#ef6a52', '#f0a94a', '#4fd1c0'], sim.data.konsenSisa));
      D.text(c, Math.round(sim.data.konsenSisa * 100) + '%', KX + KW + 10, KY + KH + 39,
        { size: 12, weight: 700, color: P.dim, base: 'middle', mono: true });

      /* ---------- diagram energi aktivasi ---------- */
      if (sim.get('diagram')) {
        const DX = 390, DY = 118, DW = 370, DH = 190;
        D.roundRect(c, DX, DY, DW, DH, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
        D.text(c, 'DIAGRAM ENERGI REAKSI', DX + 16, DY + 20,
          { size: 10.5, weight: 700, color: P.faint, base: 'middle' });

        const gx = DX + 40, gy = DY + 40, gw = DW - 70, gh = DH - 76;
        const yPereaksi = gy + gh - 36;
        const yHasil = gy + gh - 12;

        // lengkung tanpa katalis
        function lengkung(ea, warna, lw, dash) {
          c.save();
          if (dash) c.setLineDash(dash);
          c.beginPath();
          const puncak = yPereaksi - (ea / 70) * (gh - 40);
          c.moveTo(gx, yPereaksi);
          c.bezierCurveTo(gx + gw * 0.26, yPereaksi, gx + gw * 0.34, puncak, gx + gw * 0.5, puncak);
          c.bezierCurveTo(gx + gw * 0.66, puncak, gx + gw * 0.74, yHasil, gx + gw, yHasil);
          c.strokeStyle = warna; c.lineWidth = lw; c.stroke();
          c.restore();
          return puncak;
        }

        const puncakTanpa = lengkung(58, sim.get('katalis') ? 'rgba(255,255,255,.22)' : P.amber,
          sim.get('katalis') ? 1.8 : 2.6, sim.get('katalis') ? [5, 4] : null);
        if (sim.get('katalis')) {
          const puncakKat = lengkung(32, P.accent, 2.8);
          D.arrow(c, gx + gw * 0.5 + 44, puncakTanpa, gx + gw * 0.5 + 44, puncakKat, P.accent, 2, 7);
          D.text(c, 'Ea turun', gx + gw * 0.5 + 50, (puncakTanpa + puncakKat) / 2,
            { size: 10.5, weight: 700, color: P.accent, base: 'middle' });
        }

        // garis pereaksi/hasil
        D.line(c, gx, yPereaksi, gx + 44, yPereaksi, P.blue, 2.4);
        D.text(c, 'pereaksi', gx, yPereaksi - 10,
          { size: 10, weight: 650, color: P.blue, base: 'middle' });
        D.line(c, gx + gw - 44, yHasil, gx + gw, yHasil, P.rose, 2.4);
        D.text(c, 'hasil', gx + gw, yHasil + 14,
          { size: 10, weight: 650, color: P.rose, align: 'r', base: 'middle' });

        // Ea
        const puncakAktif = sim.get('katalis')
          ? yPereaksi - (32 / 70) * (gh - 40)
          : puncakTanpa;
        D.arrow(c, gx + gw * 0.5 - 56, yPereaksi, gx + gw * 0.5 - 56, puncakAktif,
          sim.get('katalis') ? P.accent : P.amber, 2, 7);
        D.text(c, 'Ea = ' + Ea(sim) + ' kJ/mol', gx + gw * 0.5 - 52, (yPereaksi + puncakAktif) / 2,
          { size: 10.5, weight: 700, color: sim.get('katalis') ? P.accent : P.amber, base: 'middle' });

        D.text(c, 'energi', DX + 16, gy + 10,
          { size: 10, weight: 600, color: P.faint, base: 'middle' });
        D.text(c, 'jalannya reaksi →', DX + DW - 16, gy + gh + 22,
          { size: 10, weight: 600, color: P.faint, align: 'r', base: 'middle' });
      }

      /* ---------- grafik konsentrasi & laju ---------- */
      const tMax = Math.max(10, sim.t);
      const g1 = { x: 80, y: 376, w: 300, h: 110 };
      const map1 = Plot.axes(c, {
        x: g1.x, y: g1.y, w: g1.w, h: g1.h,
        xmin: 0, xmax: Math.max(20, tMax), ymin: 0, ymax: sim.get('konsentrasi') * 1.15,
        xlabel: 'waktu (detik)', ylabel: '[A] (M)',
        judul: 'Konsentrasi pereaksi', yticks: 3, xticks: 4
      });
      Plot.line(c, map1, sim.data.jejak.data, { color: P.blue, lw: 2.4, isi: true });

      const g2 = { x: 450, y: 376, w: 300, h: 110 };
      const lajuMaks = Math.max(1, Math.max.apply(null,
        sim.data.jejakLaju.data.map(function (p) { return p[1]; }).concat([v, 1])));
      const map2 = Plot.axes(c, {
        x: g2.x, y: g2.y, w: g2.w, h: g2.h,
        xmin: 0, xmax: Math.max(20, tMax), ymin: 0, ymax: lajuMaks * 1.15,
        xlabel: 'waktu (detik)', ylabel: 'laju',
        judul: 'Laju reaksi', yticks: 3, xticks: 4
      });
      Plot.line(c, map2, sim.data.jejakLaju.data, { color: P.accent, lw: 2.4, isi: true });

      /* ---------- empat faktor ---------- */
      const FY = 508;
      D.roundRect(c, 40, FY, W - 80, 66, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'EMPAT FAKTOR DAN CARA KERJANYA', 58, FY + 18,
        { size: 10, weight: 700, color: P.faint, base: 'middle' });
      const faktor = [
        ['Konsentrasi', 'partikel lebih rapat → tumbukan lebih sering', sim.get('konsentrasi') > 1.2],
        ['Suhu', 'partikel lebih cepat → lebih banyak yang berenergi cukup', T > 50],
        ['Luas permukaan', 'serbuk → bidang sentuh lebih luas', sim.get('serbuk')],
        ['Katalis', 'menurunkan Ea → lebih banyak tumbukan efektif', sim.get('katalis')]
      ];
      faktor.forEach(function (f, i) {
        const x = 58 + i * ((W - 140) / 4);
        D.text(c, f[0], x, FY + 38, {
          size: 11.5, weight: 700, base: 'middle',
          color: f[2] ? P.accent2 : P.dim
        });
        const kata = f[1].split(' ');
        let baris = [''];
        kata.forEach(function (w) {
          const coba = baris[baris.length - 1] ? baris[baris.length - 1] + ' ' + w : w;
          if (D.measure(c, coba, { size: 10 }) > (W - 140) / 4 - 16) baris.push(w);
          else baris[baris.length - 1] = coba;
        });
        baris.slice(0, 2).forEach(function (b, bi) {
          D.text(c, b, x, FY + 52 + bi * 12,
            { size: 10, weight: 500, color: P.faint, base: 'middle' });
        });
      });
    },

    readoutsUpdate: function (sim) {
      const v = lajuReaksi(sim);
      const T = sim.get('suhu') + 273;
      sim.readout('laju', Sim.fmt(v, 2) + '<span class="unit"> M/s</span>');
      sim.readout('sisa', Math.round(sim.data.konsenSisa * 100) + '<span class="unit">%</span>',
        sim.data.konsenSisa < 0.2 ? 'warn' : null);
      sim.readout('ea', Ea(sim) + '<span class="unit"> kJ/mol</span>',
        sim.get('katalis') ? 'accent' : null);
      sim.readout('k', Sim.sci(C.arrhenius(2.6e7, Ea(sim), T), 2));
    },

    notes: `
      <p>Laju reaksi menyatakan <strong>cepatnya pereaksi berkurang atau hasil
      bertambah</strong> per satuan waktu.</p>
      <span class="formula">v = −Δ[pereaksi] ÷ Δt = +Δ[hasil] ÷ Δt</span>

      <h3>Teori tumbukan</h3>
      <p>Reaksi terjadi bila partikel bertumbukan, tetapi tidak semua tumbukan
      menghasilkan reaksi. Tumbukan disebut <strong>efektif</strong> bila memenuhi dua
      syarat:</p>
      <ol>
        <li>Energinya <strong>melebihi energi aktivasi (Ea)</strong>, yaitu energi minimum
            untuk memutus ikatan lama.</li>
        <li><strong>Arahnya tepat</strong> (orientasi yang sesuai).</li>
      </ol>

      <p>Semua faktor yang mempercepat reaksi bekerja dengan menambah jumlah tumbukan
      efektif per satuan waktu.</p>

      <h3>Empat faktor</h3>
      <table>
        <thead><tr><th>Faktor</th><th>Pengaruh</th><th>Alasannya</th></tr></thead>
        <tbody>
          <tr><td>Konsentrasi ↑</td><td>laju ↑</td><td>partikel lebih rapat, tumbukan lebih sering</td></tr>
          <tr><td>Suhu ↑</td><td>laju ↑↑</td><td>partikel lebih cepat dan lebih banyak yang berenergi ≥ Ea</td></tr>
          <tr><td>Luas permukaan ↑</td><td>laju ↑</td><td>bidang sentuh antarzat lebih luas</td></tr>
          <tr><td>Katalis</td><td>laju ↑↑</td><td>menyediakan jalan dengan Ea lebih rendah</td></tr>
        </tbody>
      </table>

      <p>Perhatikan bahwa suhu berpengaruh paling kuat. Kenaikan 10 °C umumnya
      <strong>melipatgandakan</strong> laju reaksi, karena pengaruhnya bersifat
      eksponensial lewat persamaan Arrhenius:</p>
      <span class="formula">k = A · e^(−Ea/RT)</span>

      <h3>Katalis</h3>
      <p>Katalis mempercepat reaksi tanpa ikut habis. Yang perlu ditekankan: katalis
      <strong>tidak menurunkan ΔH</strong> dan <strong>tidak menggeser kesetimbangan</strong>.
      Ia hanya menurunkan Ea, sehingga reaksi mencapai kesetimbangan lebih cepat — baik
      ke arah maju maupun balik.</p>

      <h3>Orde reaksi</h3>
      <p>Persamaan laju v = k[A]ᵐ[B]ⁿ. Pangkat m dan n adalah orde reaksi, dan
      <strong>hanya dapat ditentukan lewat percobaan</strong>, bukan dari koefisien
      persamaan reaksi.</p>
      <ul>
        <li><strong>Orde 0</strong> — laju tidak bergantung konsentrasi. Grafik [A] terhadap
            waktu berupa garis lurus menurun.</li>
        <li><strong>Orde 1</strong> — laju sebanding dengan konsentrasi. Grafiknya
            melengkung menurun (peluruhan eksponensial).</li>
        <li><strong>Orde 2</strong> — konsentrasi digandakan, laju menjadi empat kali.</li>
      </ul>

      <div class="callout" data-tone="tip">
        <strong>Mengapa makanan disimpan di kulkas?</strong>
        Pembusukan adalah reaksi kimia. Menurunkan suhu dari 25 °C ke 4 °C memperlambat
        lajunya beberapa kali lipat, sehingga makanan bertahan jauh lebih lama.
      </div>
    `,

    explore: [
      'Mulai pada 25 °C, catat lajunya. Naikkan ke 35 °C. Kira-kira berapa kali lipat lajunya?',
      'Kembalikan suhu, lalu nyalakan <strong>katalis</strong>. Perhatikan diagram energi — apa yang berubah dan apa yang tidak?',
      'Nyalakan <strong>Zat padat dihaluskan</strong>. Bandingkan ukuran partikel dan kecepatan pereaksi berkurang.',
      'Ganti orde reaksi dari 1 ke 2, lalu gandakan konsentrasi. Berapa kali lipat lajunya naik?'
    ],

    quiz: [
      {
        q: 'Mengapa kenaikan suhu mempercepat reaksi jauh lebih kuat daripada kenaikan konsentrasi?',
        options: [
          'Karena suhu menambah jumlah partikel',
          'Karena suhu menambah laju partikel sekaligus memperbesar pecahan partikel yang berenergi di atas Ea',
          'Karena suhu menurunkan energi aktivasi',
          'Karena suhu mengubah orde reaksi'
        ],
        answer: 1,
        explain: 'Suhu bekerja lewat dua jalur sekaligus: tumbukan menjadi lebih sering dan, yang lebih penting, pecahan partikel berenergi ≥ Ea naik secara eksponensial sesuai persamaan Arrhenius.'
      },
      {
        q: 'Katalis mempercepat reaksi dengan cara…',
        options: [
          'Menaikkan energi pereaksi',
          'Menurunkan energi aktivasi dengan menyediakan jalan reaksi alternatif',
          'Menurunkan ΔH reaksi',
          'Menambah jumlah pereaksi'
        ],
        answer: 1,
        explain: 'Katalis menyediakan mekanisme lain dengan energi aktivasi lebih rendah, sehingga lebih banyak tumbukan menjadi efektif. ΔH reaksi tidak berubah karena keadaan awal dan akhir tetap sama.'
      },
      {
        q: 'Suatu reaksi berorde 2 terhadap A. Bila konsentrasi A digandakan, lajunya menjadi…',
        options: ['2 kali', '4 kali', '8 kali', 'tetap'],
        answer: 1,
        explain: 'Pada orde 2, v = k[A]². Bila [A] menjadi 2×, maka lajunya menjadi 2² = 4 kali lipat.'
      },
      {
        q: 'Serbuk kapur bereaksi dengan asam jauh lebih cepat daripada bongkahan kapur yang massanya sama. Penjelasannya adalah…',
        options: [
          'Serbuk memiliki energi aktivasi lebih rendah',
          'Serbuk memiliki luas permukaan sentuh yang jauh lebih besar',
          'Serbuk lebih pekat',
          'Serbuk memiliki suhu lebih tinggi'
        ],
        answer: 1,
        explain: 'Reaksi zat padat dengan larutan hanya terjadi di permukaan. Menghaluskan bongkahan menjadi serbuk memperbesar luas bidang sentuh secara drastis, sehingga tumbukan per detik jauh lebih banyak.'
      }
    ]
  });
})();
