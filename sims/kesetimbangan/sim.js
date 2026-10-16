/* Kesetimbangan Kimia dan Asas Le Châtelier — Fase F
   Ganggu kesetimbangan dengan konsentrasi, tekanan, dan suhu; amati arah
   pergeserannya dan nilai Kc yang tetap kecuali suhunya diubah. */

(function () {
  'use strict';

  const D = Sim.Draw, P = Sim.P;
  const C = Chem;

  const W = 800, H = 590;

  const SISTEM = [
    {
      id: 'haber', nama: 'N₂(g) + 3H₂(g) ⇌ 2NH₃(g)',
      kiri: [{ z: 'N₂', k: 1, w: '#5b9bf5' }, { z: 'H₂', k: 3, w: '#f0f2f4' }],
      kanan: [{ z: 'NH₃', k: 2, w: '#4fd1c0' }],
      dH: -92, molKiri: 4, molKanan: 2, Kc25: 6.0e5,
      catatan: 'Proses Haber-Bosch, pembuatan pupuk. Eksoterm dan mol gas berkurang.'
    },
    {
      id: 'ester', nama: 'CH₃COOH + C₂H₅OH ⇌ ester + H₂O',
      kiri: [{ z: 'asam', k: 1, w: '#f0a94a' }, { z: 'alkohol', k: 1, w: '#b795f0' }],
      kanan: [{ z: 'ester', k: 1, w: '#4fd1c0' }, { z: 'air', k: 1, w: '#5b9bf5' }],
      dH: -2, molKiri: 2, molKanan: 2, Kc25: 4.0,
      catatan: 'Esterifikasi. Jumlah mol kedua ruas sama, sehingga tekanan tidak berpengaruh.'
    },
    {
      id: 'no2', nama: '2NO₂(g) ⇌ N₂O₄(g)',
      kiri: [{ z: 'NO₂', k: 2, w: '#c4703a' }],
      kanan: [{ z: 'N₂O₄', k: 1, w: '#f0f2f4' }],
      dH: -57, molKiri: 2, molKanan: 1, Kc25: 8.8,
      catatan: 'NO₂ berwarna cokelat, N₂O₄ tidak berwarna. Pergeserannya terlihat langsung.'
    },
    {
      id: 'kapur', nama: 'CaCO₃(s) ⇌ CaO(s) + CO₂(g)',
      kiri: [{ z: 'CaCO₃', k: 1, w: '#f0f0ea' }],
      kanan: [{ z: 'CaO', k: 1, w: '#e8e8e0' }, { z: 'CO₂', k: 1, w: '#9aa4ae' }],
      dH: 178, molKiri: 0, molKanan: 1, Kc25: 1.1e-23,
      catatan: 'Endoterm. Zat padat tidak masuk dalam ungkapan Kc.'
    }
  ];

  function sistemAktif(sim) {
    return SISTEM.find(function (s) { return s.id === sim.get('sistem'); }) || SISTEM[0];
  }

  /** Kc pada suhu terpilih memakai persamaan van 't Hoff. */
  function Kc(sim) {
    const S = sistemAktif(sim);
    const T = sim.get('suhu') + 273;
    return C.vantHoff(S.Kc25, S.dH, 298, T);
  }

  /** Posisi kesetimbangan: 0 = seluruhnya kiri, 1 = seluruhnya kanan. */
  function posisi(sim) {
    const S = sistemAktif(sim);
    let p = 0.5;

    // pengaruh suhu lewat Kc
    const k = Kc(sim);
    p = k / (k + 1);
    p = Sim.clamp(0.12 + p * 0.76, 0.05, 0.95);

    // gangguan konsentrasi
    p += sim.get('tambahKiri') * 0.16;
    p -= sim.get('tambahKanan') * 0.16;

    // gangguan tekanan: bergeser ke ruas dengan mol gas lebih sedikit
    const beda = S.molKiri - S.molKanan;
    p += (sim.get('tekanan') - 1) * beda * 0.1;

    return Sim.clamp(p, 0.03, 0.97);
  }

  function siapkan(sim) {
    sim.data.p = posisi(sim);
    sim.data.jejak = new Plot.Buffer(700);
    sim.data.gangguan = '';
    sim.data.gangguanWaktu = 0;
  }

  function catatGangguan(sim, teks) {
    sim.data.gangguan = teks;
    sim.data.gangguanWaktu = 3.4;
  }

  Sim.create({
    title: 'Kesetimbangan Kimia dan Asas Le Châtelier',
    subtitle: 'Kesetimbangan bersifat dinamis — reaksi maju dan balik tetap berjalan dengan laju sama. Bila diganggu, sistem bergeser untuk mengurangi pengaruh gangguan itu.',
    fase: 'F', jenjang: 'SMA Kelas 11',
    topik: ['Kesetimbangan', 'Le Châtelier', 'Kc dan Kp'],
    stage: { w: W, h: H },

    controls: [
      {
        title: 'Sistem kesetimbangan',
        items: [
          { type: 'select', id: 'sistem', value: 'haber', label: 'Pilih sistem',
            options: SISTEM.map(function (s) { return { value: s.id, label: s.nama }; }) }
        ]
      },
      {
        title: 'Gangguan',
        items: [
          { type: 'slider', id: 'tambahKiri', value: 0, min: -1, max: 2, step: 0.1,
            label: 'Konsentrasi pereaksi', dec: 1,
            minLabel: 'dikurangi', maxLabel: 'ditambah',
            format: function (v) { return v > 0.05 ? '+' + Sim.fmt(v, 1) : v < -0.05 ? Sim.fmt(v, 1) : 'tetap'; } },
          { type: 'slider', id: 'tambahKanan', value: 0, min: -1, max: 2, step: 0.1,
            label: 'Konsentrasi hasil', dec: 1,
            minLabel: 'dikurangi', maxLabel: 'ditambah',
            format: function (v) { return v > 0.05 ? '+' + Sim.fmt(v, 1) : v < -0.05 ? Sim.fmt(v, 1) : 'tetap'; } },
          { type: 'slider', id: 'tekanan', value: 1, min: 0.3, max: 3, step: 0.1,
            label: 'Tekanan', unit: '×', dec: 1,
            hint: 'Hanya berpengaruh bila jumlah mol gas kedua ruas berbeda.' },
          { type: 'slider', id: 'suhu', value: 25, min: -50, max: 500, step: 10,
            label: 'Suhu', unit: '°C', dec: 0,
            hint: 'Hanya suhu yang dapat mengubah nilai Kc.' }
        ]
      },
      {
        title: 'Pengaturan',
        items: [
          { type: 'toggle', id: 'katalis', value: false, label: 'Tambahkan katalis',
            hint: 'Perhatikan: katalis mempercepat tercapainya kesetimbangan, tetapi tidak menggesernya.' },
          { type: 'buttons', label: '', items: [
            { label: 'Kembalikan semua', onClick: function (sim) {
              sim.set('tambahKiri', 0); sim.set('tambahKanan', 0);
              sim.set('tekanan', 1); sim.set('suhu', 25);
            } }
          ] }
        ]
      }
    ],

    readouts: [
      { id: 'arah', label: 'Arah pergeseran', tone: 'accent' },
      { id: 'kc', label: 'Nilai Kc' },
      { id: 'hasil', label: 'Kadar hasil' },
      { id: 'dh', label: 'Sifat reaksi' }
    ],

    setup: siapkan,
    reset: siapkan,

    onChange: function (sim, id) {
      const S = sistemAktif(sim);
      if (id === 'tambahKiri') catatGangguan(sim,
        sim.get('tambahKiri') > 0
          ? 'Pereaksi ditambah → sistem bergeser ke KANAN untuk menguranginya.'
          : 'Pereaksi dikurangi → sistem bergeser ke KIRI untuk menggantinya.');
      else if (id === 'tambahKanan') catatGangguan(sim,
        sim.get('tambahKanan') > 0
          ? 'Hasil ditambah → sistem bergeser ke KIRI.'
          : 'Hasil dikurangi → sistem bergeser ke KANAN untuk menggantinya.');
      else if (id === 'tekanan') {
        const beda = S.molKiri - S.molKanan;
        catatGangguan(sim, beda === 0
          ? 'Jumlah mol gas kedua ruas sama — tekanan TIDAK menggeser kesetimbangan.'
          : (sim.get('tekanan') > 1
              ? 'Tekanan diperbesar → bergeser ke ruas dengan mol gas lebih SEDIKIT.'
              : 'Tekanan diperkecil → bergeser ke ruas dengan mol gas lebih BANYAK.'));
      } else if (id === 'suhu') {
        catatGangguan(sim, S.dH < 0
          ? 'Reaksi eksoterm: suhu naik menggeser ke KIRI dan memperkecil Kc.'
          : 'Reaksi endoterm: suhu naik menggeser ke KANAN dan memperbesar Kc.');
      } else if (id === 'katalis') {
        catatGangguan(sim, 'Katalis mempercepat tercapainya kesetimbangan, tetapi TIDAK menggeser posisinya.');
      } else if (id === 'sistem') {
        sim.data.jejak.clear();
      }
    },

    update: function (sim, dt) {
      const target = posisi(sim);
      const cepat = sim.get('katalis') ? 2.4 : 0.9;
      sim.data.p += (target - sim.data.p) * Math.min(1, dt * cepat);
      sim.data.jejak.push(sim.t, sim.data.p);
      if (sim.data.gangguanWaktu > 0) sim.data.gangguanWaktu -= dt;
    },

    draw: function (c, sim) {
      const S = sistemAktif(sim);
      const p = sim.data.p;
      const target = posisi(sim);
      const k = Kc(sim);

      /* ---------- persamaan ---------- */
      D.text(c, 'SISTEM KESETIMBANGAN', 40, 44,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
      D.text(c, S.nama, 40, 72, { size: 23, weight: 700, color: P.accent2, base: 'middle', mono: true });
      D.text(c, S.catatan, 40, 96, { size: 12, weight: 500, color: P.faint, base: 'middle' });

      /* ---------- neraca kesetimbangan ---------- */
      const BX = 60, BY = 140, BW = 680;
      D.text(c, 'POSISI KESETIMBANGAN', BX, BY - 14,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });

      // batang terbagi
      D.roundRect(c, BX, BY, BW, 44, 8, 'rgba(255,255,255,.06)');
      D.roundRect(c, BX, BY, BW * (1 - p), 44, 8, D.alpha(P.blue, 0.5));
      D.roundRect(c, BX + BW * (1 - p), BY, BW * p, 44, 8, D.alpha(P.accent, 0.5));
      D.roundRect(c, BX, BY, BW, 44, 8, null, 'rgba(255,255,255,.2)', 1.4);

      D.text(c, 'PEREAKSI ' + Math.round((1 - p) * 100) + '%', BX + 14, BY + 22,
        { size: 13, weight: 800, color: P.blue, base: 'middle' });
      D.text(c, Math.round(p * 100) + '% HASIL', BX + BW - 14, BY + 22,
        { size: 13, weight: 800, color: P.accent, align: 'r', base: 'middle' });

      // penanda posisi
      const px = BX + BW * (1 - p);
      c.beginPath();
      c.moveTo(px, BY - 6); c.lineTo(px - 8, BY - 18); c.lineTo(px + 8, BY - 18);
      c.closePath(); c.fillStyle = P.text; c.fill();

      // panah arah pergeseran
      const geser = target - p;
      if (Math.abs(geser) > 0.004) {
        const arah = geser > 0 ? 1 : -1;
        D.arrow(c, px + arah * 10, BY + 62, px + arah * 70, BY + 62,
          arah > 0 ? P.accent : P.blue, 3, 10);
        D.text(c, arah > 0 ? 'bergeser ke KANAN' : 'bergeser ke KIRI',
          px + arah * 80, BY + 62, {
            size: 12.5, weight: 700, base: 'middle',
            align: arah > 0 ? 'left' : 'right',
            color: arah > 0 ? P.accent : P.blue
          });
      } else {
        D.text(c, 'setimbang — laju maju = laju balik', px, BY + 62,
          { size: 12.5, weight: 650, color: P.dim, align: 'c', base: 'middle' });
      }

      /* ---------- gambaran partikel ---------- */
      const WY = 236, WH = 110;
      D.roundRect(c, BX, WY, BW, WH, 10, 'rgba(255,255,255,.03)', 'rgba(255,255,255,.12)', 1.2);

      // warna isi untuk NO2 (perubahan warna nyata)
      if (S.id === 'no2') {
        c.save();
        c.beginPath(); c.rect(BX + 2, WY + 2, BW - 4, WH - 4); c.clip();
        c.fillStyle = D.alpha('#c4703a', (1 - p) * 0.45);
        c.fillRect(BX, WY, BW, WH);
        c.restore();
        D.text(c, (1 - p) > 0.5 ? 'warna cokelat pekat' : 'warna memudar',
          BX + BW - 14, WY + 16,
          { size: 11, weight: 600, color: P.amber, align: 'r', base: 'middle' });
      }

      // partikel pereaksi (kiri) dan hasil (kanan), jumlah mengikuti p
      const nTotal = 46;
      for (let i = 0; i < nTotal; i++) {
        const hasil = (i / nTotal) < p;
        const kel = hasil ? S.kanan : S.kiri;
        const z = kel[i % kel.length];
        const seed = i * 97.3;
        const x = BX + 20 + ((seed * 7.1) % (BW - 40));
        const y = WY + 18 + ((seed * 3.7) % (WH - 36));
        const wob = Math.sin(sim.t * 1.4 + i) * 3;
        D.atom(c, x + wob, y + Math.cos(sim.t * 1.2 + i) * 3, 9, z.w, '', {});
      }
      Plot.legenda(c, BX + 14, WY + WH - 14,
        S.kiri.map(function (z) { return { label: z.z, warna: z.w }; })
          .concat(S.kanan.map(function (z) { return { label: z.z, warna: z.w }; })));

      /* ---------- Kc & ungkapan ---------- */
      const KX2 = 60, KW2 = 330;
      D.roundRect(c, KX2, 368, KW2, 128, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'TETAPAN KESETIMBANGAN', KX2 + 16, 388,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });

      const ungkapKanan = S.kanan.filter(function (z) { return S.id !== 'kapur' || z.z === 'CO₂'; })
        .map(function (z) { return '[' + z.z + ']' + (z.k > 1 ? Sim.sup(z.k) : ''); }).join('·') || '1';
      const ungkapKiri = S.id === 'kapur' ? '1'
        : S.kiri.map(function (z) { return '[' + z.z + ']' + (z.k > 1 ? Sim.sup(z.k) : ''); }).join('·');

      D.text(c, 'Kc = ' + ungkapKanan + ' / ' + ungkapKiri, KX2 + 16, 414,
        { size: 14, weight: 700, color: P.accent2, base: 'middle', mono: true });
      if (S.id === 'kapur') {
        D.text(c, 'Zat padat tidak dimasukkan — konsentrasinya tetap.', KX2 + 16, 434,
          { size: 10.5, weight: 500, color: P.amber, base: 'middle' });
      }
      D.text(c, 'Pada ' + Math.round(sim.get('suhu')) + ' °C:', KX2 + 16, 456,
        { size: 11, weight: 500, color: P.faint, base: 'middle' });
      D.text(c, 'Kc = ' + Sim.sci(k, 2), KX2 + 16, 478,
        { size: 19, weight: 700, color: P.accent2, base: 'middle', mono: true });
      D.text(c, k > 1 ? 'Kc > 1 → hasil mendominasi' : 'Kc < 1 → pereaksi mendominasi',
        KX2 + 170, 478, { size: 11, weight: 600, color: P.dim, base: 'middle' });

      /* ---------- grafik posisi ---------- */
      const g = { x: 450, y: 390, w: 290, h: 106 };
      const tMax = Math.max(14, sim.t);
      const map = Plot.axes(c, {
        x: g.x, y: g.y, w: g.w, h: g.h,
        xmin: Math.max(0, tMax - 30), xmax: tMax, ymin: 0, ymax: 1,
        xlabel: 'waktu', ylabel: 'kadar hasil',
        judul: 'Pergeseran kesetimbangan', yticks: 3, xticks: 4
      });
      Plot.line(c, map, sim.data.jejak.data, { color: P.accent, lw: 2.4, isi: true });

      /* ---------- pesan gangguan ---------- */
      if (sim.data.gangguanWaktu > 0) {
        c.save(); c.globalAlpha = Math.min(1, sim.data.gangguanWaktu / 0.7);
        const tw = D.measure(c, sim.data.gangguan, { size: 13, weight: 650 }) + 36;
        D.roundRect(c, W / 2 - tw / 2, 512, tw, 34, 17,
          'rgba(79,209,192,.14)', P.accent, 1.5);
        D.text(c, sim.data.gangguan, W / 2, 529,
          { size: 13, weight: 650, color: P.accent2, align: 'c', base: 'middle' });
        c.restore();
      } else {
        D.roundRect(c, 60, 512, BW, 34, 10, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.1)', 1.1);
        D.text(c, 'Asas Le Châtelier: bila sistem setimbang diganggu, sistem bergeser ke arah yang mengurangi pengaruh gangguan itu.',
          76, 529, { size: 12.5, weight: 500, color: P.dim, base: 'middle' });
      }
    },

    readoutsUpdate: function (sim) {
      const S = sistemAktif(sim);
      const p = sim.data.p;
      const target = posisi(sim);
      const geser = target - p;
      sim.readout('arah', Math.abs(geser) < 0.004 ? 'setimbang'
        : geser > 0 ? 'ke kanan →' : '← ke kiri');
      sim.readout('kc', Sim.sci(Kc(sim), 2));
      sim.readout('hasil', Math.round(p * 100) + '<span class="unit">%</span>');
      sim.readout('dh', S.dH < 0 ? 'Eksoterm (ΔH ' + S.dH + ')' : 'Endoterm (ΔH +' + S.dH + ')',
        S.dH < 0 ? 'warn' : 'accent');
    },

    notes: `
      <p>Reaksi bolak-balik tidak pernah benar-benar berhenti. Pada keadaan setimbang,
      <strong>laju reaksi maju sama dengan laju reaksi balik</strong>, sehingga
      konsentrasi semua zat tampak tetap meski reaksinya terus berlangsung. Inilah yang
      disebut <strong>kesetimbangan dinamis</strong>.</p>

      <h3>Tetapan kesetimbangan</h3>
      <span class="formula">Untuk  aA + bB ⇌ cC + dD
Kc = [C]ᶜ[D]ᵈ ÷ [A]ᵃ[B]ᵇ</span>

      <p>Aturan penting: <strong>zat padat murni dan zat cair murni tidak dimasukkan</strong>
      ke dalam ungkapan Kc, karena konsentrasinya tetap. Pada CaCO₃ ⇌ CaO + CO₂, ungkapannya
      hanya Kc = [CO₂].</p>

      <ul>
        <li><strong>Kc &gt; 1</strong> → kesetimbangan condong ke kanan, hasil mendominasi.</li>
        <li><strong>Kc &lt; 1</strong> → condong ke kiri, pereaksi mendominasi.</li>
      </ul>

      <h3>Asas Le Châtelier</h3>
      <p>Bila sistem setimbang diberi gangguan, sistem akan <strong>bergeser ke arah yang
      mengurangi pengaruh gangguan</strong> tersebut.</p>

      <table>
        <thead><tr><th>Gangguan</th><th>Arah pergeseran</th><th>Kc berubah?</th></tr></thead>
        <tbody>
          <tr><td>Pereaksi ditambah</td><td>ke kanan</td><td>tidak</td></tr>
          <tr><td>Hasil ditambah</td><td>ke kiri</td><td>tidak</td></tr>
          <tr><td>Hasil diambil terus</td><td>ke kanan</td><td>tidak</td></tr>
          <tr><td>Tekanan diperbesar</td><td>ke ruas dengan mol gas lebih sedikit</td><td>tidak</td></tr>
          <tr><td>Suhu dinaikkan</td><td>ke arah endoterm</td><td><strong>ya</strong></td></tr>
          <tr><td>Katalis ditambah</td><td>tidak bergeser</td><td>tidak</td></tr>
        </tbody>
      </table>

      <p>Dua baris terakhir paling sering keliru. <strong>Hanya suhu</strong> yang dapat
      mengubah nilai Kc. Katalis mempercepat tercapainya kesetimbangan dari kedua arah
      sekaligus, sehingga posisinya tidak bergeser sama sekali.</p>

      <h3>Pengaruh suhu bergantung pada ΔH</h3>
      <ul>
        <li>Reaksi <strong>eksoterm</strong> (ΔH negatif): suhu naik → bergeser ke kiri, Kc mengecil.</li>
        <li>Reaksi <strong>endoterm</strong> (ΔH positif): suhu naik → bergeser ke kanan, Kc membesar.</li>
      </ul>
      <p>Cara mengingatnya: anggap kalor sebagai salah satu zat dalam persamaan. Pada reaksi
      eksoterm, kalor berada di ruas kanan, sehingga menambah kalor menggeser ke kiri.</p>

      <h3>Penerapan: proses Haber-Bosch</h3>
      <p>Pembuatan amonia untuk pupuk menghadapi pertentangan. Reaksinya eksoterm dan mol
      gas berkurang, sehingga hasil terbaik diperoleh pada <strong>suhu rendah dan tekanan
      tinggi</strong>. Namun pada suhu rendah reaksinya terlalu lambat.</p>

      <p>Jalan tengah yang dipakai industri: suhu sedang (sekitar 450 °C), tekanan sangat
      tinggi (200 atm), dan <strong>katalis besi</strong> untuk mempercepat tercapainya
      kesetimbangan. Amonia yang terbentuk terus diambil agar kesetimbangan terus bergeser
      ke kanan.</p>

      <div class="callout" data-tone="tip">
        <strong>Kompromi antara dua ilmu</strong>
        Kesetimbangan memberi tahu <em>berapa banyak</em> hasil yang mungkin, kinetika
        memberi tahu <em>seberapa cepat</em>. Rancangan pabrik selalu merupakan kompromi
        antara keduanya.
      </div>
    `,

    explore: [
      'Pilih sistem <strong>Haber</strong>. Tambahkan pereaksi dan amati arah pergeserannya. Apakah Kc berubah?',
      'Naikkan suhu dari 25 °C ke 500 °C. Perhatikan nilai Kc dan arah pergeserannya. Hubungkan dengan ΔH yang negatif.',
      'Pilih sistem <strong>esterifikasi</strong> dan ubah tekanan. Mengapa tidak terjadi pergeseran?',
      'Nyalakan <strong>katalis</strong>. Perhatikan grafik mencapai nilai tetap lebih cepat, tetapi nilai akhirnya sama.'
    ],

    quiz: [
      {
        q: 'Pada kesetimbangan N₂ + 3H₂ ⇌ 2NH₃ (ΔH = −92 kJ), bila suhu dinaikkan maka…',
        options: [
          'Bergeser ke kanan dan Kc membesar',
          'Bergeser ke kiri dan Kc mengecil',
          'Bergeser ke kanan dan Kc tetap',
          'Tidak terjadi pergeseran'
        ],
        answer: 1,
        explain: 'Reaksi ini eksoterm, jadi kalor berada di ruas kanan. Menambah kalor berarti menambah "zat" di kanan, sehingga sistem bergeser ke kiri. Karena yang diubah adalah suhu, nilai Kc ikut mengecil.'
      },
      {
        q: 'Pada kesetimbangan 2NO₂(g) ⇌ N₂O₄(g), tekanan diperbesar. Sistem akan bergeser ke…',
        options: [
          'Kiri, karena mol gas di kiri lebih banyak',
          'Kanan, karena mol gas di kanan lebih sedikit',
          'Tidak bergeser',
          'Bergantung pada suhu'
        ],
        answer: 1,
        explain: 'Memperbesar tekanan membuat sistem bergeser ke ruas dengan jumlah mol gas lebih sedikit untuk mengurangi tekanan. Di sini ruas kanan punya 1 mol gas, ruas kiri 2 mol, sehingga bergeser ke kanan.'
      },
      {
        q: 'Katalis ditambahkan ke sistem yang sudah setimbang. Apa yang terjadi?',
        options: [
          'Kesetimbangan bergeser ke kanan',
          'Nilai Kc membesar',
          'Posisi kesetimbangan tidak berubah, hanya dicapai lebih cepat',
          'Reaksi berhenti'
        ],
        answer: 2,
        explain: 'Katalis menurunkan energi aktivasi reaksi maju dan reaksi balik dengan besar yang sama. Kedua laju meningkat seimbang, sehingga posisi kesetimbangan dan nilai Kc tidak berubah sama sekali.'
      },
      {
        q: 'Dalam ungkapan Kc untuk CaCO₃(s) ⇌ CaO(s) + CO₂(g), yang ditulis adalah…',
        options: [
          'Kc = [CaO][CO₂] / [CaCO₃]',
          'Kc = [CO₂]',
          'Kc = [CaCO₃] / [CO₂]',
          'Kc = [CaO] / [CaCO₃]'
        ],
        answer: 1,
        explain: 'Zat padat murni memiliki konsentrasi tetap sehingga tidak dimasukkan ke dalam ungkapan tetapan kesetimbangan. Hanya CO₂ yang berwujud gas yang ditulis.'
      }
    ]
  });
})();
