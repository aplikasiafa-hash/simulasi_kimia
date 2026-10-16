/* Tabel Periodik dan Keperiodikan Sifat — Fase E
   Tabel 118 unsur yang dapat diklik, dengan pewarnaan menurut kategori atau
   peta panas sifat, plus grafik kecenderungan sepanjang periode dan golongan. */

(function () {
  'use strict';

  const D = Sim.Draw, P = Sim.P;
  const C = Chem;

  const W = 800, H = 580;

  /* --- data sifat periodik (nilai perkiraan untuk pengajaran) --- */
  // jari-jari atom (pm)
  const JARI_ATOM = {};
  C.ELEMENTS.forEach(function (e) {
    // model sederhana: naik dalam golongan, turun dalam periode
    const dasar = 40 + e.periode * 46;
    const gol = e.gol || 3;
    JARI_ATOM[e.Z] = Math.max(28, dasar - (gol <= 2 ? gol * 4 : (gol - 2) * 5.2));
  });
  // energi ionisasi pertama (kJ/mol), perkiraan
  const EI = {};
  C.ELEMENTS.forEach(function (e) {
    const gol = e.gol || 3;
    EI[e.Z] = Math.round(Math.max(370, 1400 - e.periode * 125 + (gol <= 2 ? gol * 50 : (gol - 2) * 95)));
  });

  const SIFAT = {
    kategori: { nama: 'Kategori unsur', satuan: '', nilai: null },
    jari:     { nama: 'Jari-jari atom', satuan: 'pm', nilai: function (e) { return JARI_ATOM[e.Z]; }, balik: true },
    en:       { nama: 'Keelektronegatifan', satuan: '', nilai: function (e) { return e.en; } },
    ei:       { nama: 'Energi ionisasi', satuan: 'kJ/mol', nilai: function (e) { return EI[e.Z]; } },
    massa:    { nama: 'Massa atom', satuan: 'g/mol', nilai: function (e) { return e.massa; } }
  };

  const SEL = 38, CELAH = 2;
  const TX = 24, TY = 96;

  function siapkan(sim) {
    sim.data.pilih = 17;
    sim.data.sorot = null;
  }

  function kotakSel(e) {
    const g = C.gridPos(e);
    if (!g.col) return null;
    let row = g.row;
    if (row >= 8) row += 0.5;   // beri jarak untuk lantanida/aktinida
    return {
      x: TX + (g.col - 1) * (SEL + CELAH),
      y: TY + (row - 1) * (SEL + CELAH),
      w: SEL, h: SEL
    };
  }

  function warnaSel(sim, e) {
    const s = sim.get('sifat');
    if (s === 'kategori') return C.KATEGORI_WARNA[e.kategori];
    const f = SIFAT[s].nilai;
    const v = f(e);
    if (v === null || v === undefined) return '#3a4248';
    let lo = Infinity, hi = -Infinity;
    C.ELEMENTS.forEach(function (q) {
      const x = f(q);
      if (x === null || x === undefined) return;
      if (x < lo) lo = x; if (x > hi) hi = x;
    });
    let t = (v - lo) / (hi - lo);
    if (SIFAT[s].balik) t = 1 - t;
    return D.ramp(['#1d3f6e', '#2f7fa8', '#4fd1c0', '#f0d04a', '#ef6a52'], t);
  }

  Sim.create({
    title: 'Tabel Periodik dan Keperiodikan Sifat',
    subtitle: 'Tabel periodik bukan sekadar daftar. Letak setiap unsur meramalkan sifatnya — dan sifat itu berubah dengan pola yang teratur.',
    fase: 'E', jenjang: 'SMA Kelas 10',
    topik: ['Tabel Periodik', 'Sifat Periodik'],
    stage: { w: W, h: H },
    showPlay: false,
    stageNote: 'Klik unsur mana pun untuk melihat rinciannya',

    controls: [
      {
        title: 'Pewarnaan tabel',
        items: [
          { type: 'select', id: 'sifat', value: 'kategori', label: 'Warnai menurut',
            options: Object.keys(SIFAT).map(function (k) {
              return { value: k, label: SIFAT[k].nama }; }),
            hint: 'Peta panas memperlihatkan pola perubahan sifat di seluruh tabel.' }
        ]
      },
      {
        title: 'Sorot kelompok',
        items: [
          { type: 'segment', id: 'sorot', value: 'tidak', label: '',
            options: [
              { value: 'tidak', label: 'Tidak' },
              { value: 'golongan', label: 'Golongan' },
              { value: 'periode', label: 'Periode' }
            ],
            hint: 'Menyorot golongan atau periode dari unsur yang sedang dipilih.' },
          { type: 'toggle', id: 'grafik', value: true, label: 'Tampilkan grafik kecenderungan' },
          { type: 'toggle', id: 'panah', value: true, label: 'Tampilkan arah kecenderungan' }
        ]
      },
      {
        title: 'Lompat ke unsur',
        items: [
          { type: 'slider', id: 'Z', value: 17, min: 1, max: 118, step: 1,
            label: 'Nomor atom', dec: 0,
            format: function (v) {
              const e = C.byZ[Math.round(v)];
              return e ? e.sym : String(Math.round(v));
            } }
        ]
      }
    ],

    readouts: [
      { id: 'unsur', label: 'Unsur', tone: 'accent' },
      { id: 'konf', label: 'Konfigurasi' },
      { id: 'gol', label: 'Golongan' },
      { id: 'periode', label: 'Periode' }
    ],

    setup: siapkan,
    reset: siapkan,
    onChange: function (sim, id) {
      if (id === 'Z') sim.data.pilih = Math.round(sim.get('Z'));
    },

    onPointerMove: function (sim, x, y) {
      sim.data.sorotSel = null;
      for (let i = 0; i < C.ELEMENTS.length; i++) {
        const k = kotakSel(C.ELEMENTS[i]);
        if (!k) continue;
        if (x >= k.x && x <= k.x + k.w && y >= k.y && y <= k.y + k.h) {
          sim.data.sorotSel = C.ELEMENTS[i].Z;
          return;
        }
      }
    },

    onPointerDown: function (sim, x, y) {
      for (let i = 0; i < C.ELEMENTS.length; i++) {
        const k = kotakSel(C.ELEMENTS[i]);
        if (!k) continue;
        if (x >= k.x && x <= k.x + k.w && y >= k.y && y <= k.y + k.h) {
          sim.data.pilih = C.ELEMENTS[i].Z;
          sim.set('Z', C.ELEMENTS[i].Z);
          return;
        }
      }
    },

    draw: function (c, sim) {
      const pilihZ = sim.data.pilih;
      const dipilih = C.byZ[pilihZ];
      const sorotMode = sim.get('sorot');
      const sifatKunci = sim.get('sifat');

      /* ---------- tabel ---------- */
      C.ELEMENTS.forEach(function (e) {
        const k = kotakSel(e);
        if (!k) return;

        let redup = false;
        if (sorotMode === 'golongan' && dipilih) {
          redup = !(e.gol && dipilih.gol && e.gol === dipilih.gol);
        } else if (sorotMode === 'periode' && dipilih) {
          redup = e.periode !== dipilih.periode;
        }

        const warna = warnaSel(sim, e);
        c.globalAlpha = redup ? 0.2 : 1;
        D.roundRect(c, k.x, k.y, k.w, k.h, 3, warna, null, 0);
        D.text(c, e.sym, k.x + k.w / 2, k.y + k.h / 2 + 1,
          { size: 12.5, weight: 700, color: D.readable(warna), align: 'c', base: 'middle' });
        D.text(c, String(e.Z), k.x + 3, k.y + 8,
          { size: 7.5, weight: 600, color: D.alpha(D.readable(warna), 0.75), base: 'middle' });
        c.globalAlpha = 1;

        if (e.Z === pilihZ) {
          D.roundRect(c, k.x - 2, k.y - 2, k.w + 4, k.h + 4, 4, null, '#ffffff', 2.4);
        } else if (e.Z === sim.data.sorotSel) {
          D.roundRect(c, k.x - 1, k.y - 1, k.w + 2, k.h + 2, 4, null, 'rgba(255,255,255,.6)', 1.6);
        }
      });

      // nomor golongan di atas
      for (let g = 1; g <= 18; g++) {
        D.text(c, String(g), TX + (g - 1) * (SEL + CELAH) + SEL / 2, TY - 10,
          { size: 9.5, weight: 600, color: P.faint, align: 'c', base: 'middle' });
      }
      // nomor periode di kiri
      for (let p = 1; p <= 7; p++) {
        D.text(c, String(p), TX - 10, TY + (p - 1) * (SEL + CELAH) + SEL / 2,
          { size: 9.5, weight: 600, color: P.faint, align: 'c', base: 'middle' });
      }

      /* ---------- panah kecenderungan ---------- */
      if (sim.get('panah') && sifatKunci !== 'kategori') {
        const naikKanan = sifatKunci === 'en' || sifatKunci === 'ei' || sifatKunci === 'massa';
        const lebarTabel = 18 * (SEL + CELAH);
        const bawah = TY + 7.5 * (SEL + CELAH) + 18;
        D.arrow(c, TX + 10, bawah, TX + lebarTabel - 14, bawah,
          naikKanan ? P.accent : P.amber, 2, 8);
        D.text(c, (naikKanan ? 'makin besar →' : 'makin kecil →'),
          TX + lebarTabel / 2, bawah - 12,
          { size: 10.5, weight: 700, color: naikKanan ? P.accent : P.amber, align: 'c', base: 'middle' });

        const kananX = TX + lebarTabel + 16;
        D.arrow(c, kananX, TY + 6, kananX, TY + 7 * (SEL + CELAH),
          naikKanan ? P.amber : P.accent, 2, 8);
      }

      /* ---------- kartu unsur ---------- */
      const KX = 24, KY = 404, KW = 268;
      if (dipilih) {
        const warna = C.KATEGORI_WARNA[dipilih.kategori];
        D.roundRect(c, KX, KY, KW, 150, 12, 'rgba(255,255,255,.04)', warna, 1.8);
        D.roundRect(c, KX + 16, KY + 16, 62, 62, 7, warna);
        D.text(c, dipilih.sym, KX + 47, KY + 44,
          { size: 26, weight: 700, color: D.readable(warna), align: 'c', base: 'middle' });
        D.text(c, String(dipilih.Z), KX + 22, KY + 26,
          { size: 10, weight: 700, color: D.alpha(D.readable(warna), 0.8), base: 'middle' });

        D.text(c, dipilih.nama, KX + 90, KY + 32,
          { size: 18, weight: 700, color: P.text, base: 'middle' });
        D.text(c, C.KATEGORI_NAMA[dipilih.kategori], KX + 90, KY + 54,
          { size: 11.5, weight: 600, color: warna, base: 'middle' });
        D.text(c, 'Ar = ' + Sim.fmt(dipilih.massa, 3), KX + 90, KY + 72,
          { size: 11.5, weight: 500, color: P.dim, base: 'middle' });

        const info = [
          ['Konfigurasi', C.intiGasMulia(dipilih.Z) + ' ' +
            C.konfigurasi(dipilih.Z).filter(function (p, i) {
              const inti = C.intiGasMulia(dipilih.Z);
              if (!inti) return true;
              const Zi = C.bySym[inti.slice(1, -1)].Z;
              let tot = 0;
              for (let k = 0; k <= i; k++) tot += C.konfigurasi(dipilih.Z)[k][1];
              return tot > Zi;
            }).map(function (p) { return p[0] + Sim.sup(p[1]); }).join(' ')],
          ['Elektron valensi', String(C.valensi(dipilih.Z))],
          ['Keelektronegatifan', dipilih.en !== null ? Sim.fmt(dipilih.en, 2) : 'tidak lazim'],
          ['Jari-jari atom', Math.round(JARI_ATOM[dipilih.Z]) + ' pm']
        ];
        info.forEach(function (b, i) {
          const y = KY + 96 + i * 15;
          D.text(c, b[0], KX + 16, y, { size: 10.5, weight: 500, color: P.faint, base: 'middle' });
          D.text(c, b[1], KX + KW - 16, y,
            { size: 10.5, weight: 650, color: P.dim, align: 'r', base: 'middle', mono: true });
        });
      }

      /* ---------- grafik kecenderungan ---------- */
      if (sim.get('grafik') && dipilih) {
        const GX = 320, GY = 420, GW = 450, GH = 120;
        const sifat = SIFAT[sifatKunci === 'kategori' ? 'en' : sifatKunci];
        const f = sifat.nilai;

        // data sepanjang periode unsur terpilih
        const periode = C.ELEMENTS.filter(function (e) {
          return e.periode === dipilih.periode && e.gol;
        }).sort(function (a, b) { return a.gol - b.gol; });

        const nilai = periode.map(function (e) { return f(e); })
          .filter(function (v) { return v !== null && v !== undefined; });
        if (nilai.length > 1) {
          const lo = Math.min.apply(null, nilai), hi = Math.max.apply(null, nilai);
          const map = Plot.axes(c, {
            x: GX, y: GY, w: GW, h: GH,
            xmin: 0.5, xmax: 18.5, ymin: lo - (hi - lo) * 0.14, ymax: hi + (hi - lo) * 0.14,
            xlabel: 'golongan', ylabel: sifat.satuan || sifat.nama,
            judul: sifat.nama + ' sepanjang periode ' + dipilih.periode,
            xticks: 9, yticks: 3
          });
          const titik = periode.map(function (e) { return [e.gol, f(e)]; })
            .filter(function (t) { return t[1] !== null && t[1] !== undefined; });
          Plot.line(c, map, titik, { color: P.accent, lw: 2.2 });
          titik.forEach(function (t) {
            const e = periode.find(function (q) { return q.gol === t[0]; });
            Plot.titik(c, map, t[0], t[1], {
              r: e && e.Z === dipilih.Z ? 5.5 : 3,
              color: e && e.Z === dipilih.Z ? '#ffffff' : P.accent,
              halo: e && e.Z === dipilih.Z,
              label: e && e.Z === dipilih.Z ? e.sym : null
            });
          });
        }
      }

      /* ---------- keterangan warna ---------- */
      if (sifatKunci === 'kategori') {
        const LX = 320, LY = 424;
        D.text(c, 'KATEGORI UNSUR', LX, LY - 8,
          { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
        const kat = Object.keys(C.KATEGORI_NAMA);
        kat.forEach(function (k, i) {
          const x = LX + (i % 2) * 230;
          const y = LY + 14 + Math.floor(i / 2) * 23;
          D.roundRect(c, x, y - 6, 13, 13, 3, C.KATEGORI_WARNA[k]);
          D.text(c, C.KATEGORI_NAMA[k], x + 20, y,
            { size: 11.5, weight: 500, color: P.dim, base: 'middle' });
        });
      }
    },

    readoutsUpdate: function (sim) {
      const e = C.byZ[sim.data.pilih];
      if (!e) return;
      sim.readout('unsur', e.sym + ' — ' + e.nama);
      sim.readout('konf', C.intiGasMulia(e.Z) + ' …');
      const gol = e.gol;
      sim.readout('gol', gol ? (gol <= 2 ? gol + 'A' : gol >= 13 ? (gol - 10) + 'A' : (gol - 2) + 'B')
        : (e.kategori === 'lantanida' ? 'Lantanida' : 'Aktinida'));
      sim.readout('periode', e.periode);
    },

    notes: `
      <p>Tabel periodik disusun berdasarkan <strong>kenaikan nomor atom</strong>, dan
      unsur dengan jumlah elektron valensi sama diletakkan dalam satu kolom. Karena
      elektron valensi menentukan sifat kimia, unsur dalam satu golongan memiliki sifat
      yang mirip.</p>

      <h3>Membaca peta tabel</h3>
      <ul>
        <li><strong>Golongan</strong> (kolom, 1–18) — menunjukkan jumlah elektron valensi.</li>
        <li><strong>Periode</strong> (baris, 1–7) — menunjukkan jumlah kulit elektron.</li>
        <li><strong>Blok</strong> — s (golongan 1–2), p (13–18), d (3–12), f (lantanida & aktinida).</li>
      </ul>

      <h3>Empat kecenderungan utama</h3>
      <table>
        <thead><tr><th>Sifat</th><th>Dalam satu periode (→)</th><th>Dalam satu golongan (↓)</th></tr></thead>
        <tbody>
          <tr><td>Jari-jari atom</td><td>makin kecil</td><td>makin besar</td></tr>
          <tr><td>Energi ionisasi</td><td>makin besar</td><td>makin kecil</td></tr>
          <tr><td>Keelektronegatifan</td><td>makin besar</td><td>makin kecil</td></tr>
          <tr><td>Sifat logam</td><td>makin berkurang</td><td>makin bertambah</td></tr>
        </tbody>
      </table>

      <h3>Mengapa jari-jari mengecil ke kanan?</h3>
      <p>Dalam satu periode, jumlah kulit tetap tetapi <strong>muatan inti bertambah</strong>.
      Inti yang makin positif menarik elektron lebih kuat, sehingga awan elektron mengerut.
      Perhatikan: natrium (Z = 11) jauh lebih besar daripada klorin (Z = 17) walaupun
      keduanya berada di periode yang sama.</p>

      <h3>Mengapa jari-jari membesar ke bawah?</h3>
      <p>Setiap turun satu periode, <strong>bertambah satu kulit</strong>. Kulit baru ini
      jauh lebih jauh dari inti, dan kulit dalam juga menghalangi tarikan inti
      (efek perisai). Pertambahan ukuran ini mengalahkan pertambahan muatan inti.</p>

      <h3>Energi ionisasi dan keelektronegatifan</h3>
      <p><strong>Energi ionisasi</strong> adalah energi untuk melepaskan satu elektron.
      Atom kecil dengan inti kuat sulit melepas elektron, jadi energi ionisasinya besar.
      <strong>Keelektronegatifan</strong> adalah kecenderungan menarik elektron dalam
      ikatan. Keduanya mengikuti pola yang sama.</p>

      <p>Fluorin memiliki keelektronegatifan tertinggi (3,98) karena atomnya kecil dan
      hanya butuh satu elektron untuk stabil. Fransium paling rendah (0,7).</p>

      <div class="callout" data-tone="tip">
        <strong>Gas mulia adalah pengecualian</strong>
        Gas mulia sudah memiliki susunan elektron penuh, sehingga tidak tertarik menerima
        atau melepas elektron. Sebagian besar tidak memiliki nilai keelektronegatifan
        yang lazim.
      </div>
    `,

    explore: [
      'Warnai menurut <strong>Jari-jari atom</strong>. Ke arah mana warnanya berubah? Sesuai dugaanmu?',
      'Klik natrium (Na), lalu sorot <strong>Periode</strong>. Baca grafiknya — apa yang terjadi dari Na ke Ar?',
      'Klik fluorin (F), lalu sorot <strong>Golongan</strong>. Bandingkan keelektronegatifan F, Cl, Br, dan I.',
      'Warnai menurut <strong>Energi ionisasi</strong>. Unsur mana yang paling sulit melepas elektron? Mengapa masuk akal?'
    ],

    quiz: [
      {
        q: 'Dari natrium (Na) ke klorin (Cl) dalam periode 3, jari-jari atomnya…',
        options: [
          'Bertambah, karena jumlah elektron bertambah',
          'Berkurang, karena muatan inti bertambah sementara jumlah kulit tetap',
          'Tetap, karena berada dalam periode yang sama',
          'Bertambah, karena massa atom bertambah'
        ],
        answer: 1,
        explain: 'Jumlah kulit tetap tiga, tetapi proton bertambah dari 11 menjadi 17. Tarikan inti yang makin kuat menarik awan elektron lebih dekat, sehingga atomnya mengecil.'
      },
      {
        q: 'Unsur dengan keelektronegatifan tertinggi dalam tabel periodik adalah…',
        options: ['Oksigen', 'Fluorin', 'Klorin', 'Helium'],
        answer: 1,
        explain: 'Fluorin memiliki keelektronegatifan 3,98 — tertinggi di antara semua unsur. Atomnya kecil dan hanya memerlukan satu elektron untuk mencapai susunan gas mulia.'
      },
      {
        q: 'Mengapa jari-jari atom bertambah dari atas ke bawah dalam satu golongan?',
        options: [
          'Karena muatan inti berkurang',
          'Karena jumlah kulit elektron bertambah',
          'Karena keelektronegatifannya bertambah',
          'Karena massanya berkurang'
        ],
        answer: 1,
        explain: 'Setiap turun satu periode, atom memperoleh satu kulit elektron baru yang lebih jauh dari inti. Kulit dalam juga memerisai tarikan inti terhadap kulit terluar.'
      },
      {
        q: 'Unsur X memiliki konfigurasi [Ne] 3s². Unsur ini terletak pada golongan dan periode…',
        options: ['IIA, periode 3', 'IIIA, periode 2', 'IIA, periode 2', 'VIIIA, periode 3'],
        answer: 0,
        explain: 'Kulit terbesar adalah 3, sehingga periode 3. Elektron valensi berjumlah 2, sehingga golongan IIA. Unsur ini adalah magnesium.'
      }
    ]
  });
})();
