/* Perkembangan Model Atom — Fase E
   Lima model atom berturut-turut, lengkap dengan percobaan hamburan sinar alfa
   Rutherford yang dapat dijalankan sendiri. */

(function () {
  'use strict';

  const D = Sim.Draw, P = Sim.P;

  const MODEL = [
    {
      id: 'dalton', nama: 'Dalton', tahun: '1803',
      julukan: 'Bola pejal',
      pokok: [
        'Atom adalah partikel terkecil yang tidak dapat dibagi',
        'Atom unsur sejenis memiliki sifat dan massa yang sama',
        'Senyawa terbentuk dari gabungan atom dengan perbandingan tetap',
        'Reaksi kimia hanyalah penataan ulang atom'
      ],
      bukti: 'Hukum kekekalan massa (Lavoisier) dan hukum perbandingan tetap (Proust).',
      lemah: 'Tidak dapat menjelaskan mengapa ada zat yang bermuatan listrik.'
    },
    {
      id: 'thomson', nama: 'Thomson', tahun: '1897',
      julukan: 'Roti kismis',
      pokok: [
        'Atom berupa bola bermuatan positif',
        'Elektron bermuatan negatif tersebar di dalamnya seperti kismis pada roti',
        'Secara keseluruhan atom bersifat netral',
        'Elektron jauh lebih ringan daripada atom'
      ],
      bukti: 'Percobaan tabung sinar katode yang menemukan elektron.',
      lemah: 'Tidak sesuai dengan hasil percobaan hamburan sinar alfa.'
    },
    {
      id: 'rutherford', nama: 'Rutherford', tahun: '1911',
      julukan: 'Inti atom',
      pokok: [
        'Massa atom terpusat pada inti yang sangat kecil dan bermuatan positif',
        'Sebagian besar atom berupa ruang kosong',
        'Elektron bergerak mengelilingi inti',
        'Jari-jari atom sekitar 10.000 kali jari-jari intinya'
      ],
      bukti: 'Percobaan hamburan sinar alfa pada lempeng emas tipis.',
      lemah: 'Menurut fisika klasik, elektron yang berputar akan kehilangan energi dan jatuh ke inti.'
    },
    {
      id: 'bohr', nama: 'Bohr', tahun: '1913',
      julukan: 'Lintasan tetap',
      pokok: [
        'Elektron bergerak pada lintasan dengan energi tertentu (kulit)',
        'Selama berada di lintasannya, elektron tidak memancarkan energi',
        'Elektron dapat berpindah kulit dengan menyerap atau melepas energi',
        'Energi yang dilepas muncul sebagai cahaya dengan panjang gelombang khas'
      ],
      bukti: 'Spektrum garis atom hidrogen yang terputus-putus, bukan menyambung.',
      lemah: 'Hanya berhasil menjelaskan atom hidrogen; gagal untuk atom berelektron banyak.'
    },
    {
      id: 'kuantum', nama: 'Mekanika kuantum', tahun: '1926',
      julukan: 'Awan elektron',
      pokok: [
        'Kedudukan elektron tidak dapat dipastikan, hanya kebolehjadiannya',
        'Daerah dengan kebolehjadian terbesar disebut orbital',
        'Orbital memiliki bentuk khas: s bulat, p seperti balon kembar',
        'Keadaan elektron dinyatakan dengan empat bilangan kuantum'
      ],
      bukti: 'Asas ketidakpastian Heisenberg dan persamaan gelombang Schrödinger.',
      lemah: 'Sulit digambarkan secara sederhana, tetapi paling sesuai dengan seluruh data percobaan.'
    }
  ];

  const W = 790, H = 540;

  function siapkan(sim) {
    sim.data.putar = 0;
    sim.data.alfa = [];
    sim.data.tembak = false;
    sim.data.statistik = { lurus: 0, belok: 0, pantul: 0 };
    sim.data.awan = [];
    for (let i = 0; i < 900; i++) {
      // sebaran kebolehjadian menyerupai orbital 1s
      const r = -Math.log(Math.random()) * 26;
      const a = Math.random() * Math.PI * 2;
      sim.data.awan.push({ x: Math.cos(a) * r, y: Math.sin(a) * r * 0.92 });
    }
  }

  function tembakAlfa(sim) {
    const m = sim.get('model');
    sim.data.alfa.push({
      x: 70, y: 250 + Sim.rnd(-58, 58),
      vx: 150, vy: 0, hidup: 3.2, dihitung: false
    });
  }

  Sim.create({
    title: 'Perkembangan Model Atom',
    subtitle: 'Model atom bukan tebakan, melainkan hasil pembacaan bukti percobaan. Setiap kali ada hasil yang tidak cocok, modelnya diperbaiki.',
    fase: 'E', jenjang: 'SMA Kelas 10',
    topik: ['Struktur Atom', 'Sejarah Sains'],
    stage: { w: W, h: H },

    controls: [
      {
        title: 'Model atom',
        items: [
          { type: 'segment', id: 'model', value: 'rutherford', label: '',
            options: MODEL.map(function (m) { return { value: m.id, label: m.nama }; }) },
          { type: 'html', html: '<div class="ctl-hint">Model disusun menurut urutan waktu. ' +
              'Perhatikan bukti apa yang memaksa perubahan.</div>' }
        ]
      },
      {
        title: 'Percobaan hamburan sinar alfa',
        items: [
          { type: 'toggle', id: 'percobaan', value: false, label: 'Mode percobaan',
            hint: 'Tembakkan partikel alfa dan amati pembelokannya pada model yang dipilih.' },
          { type: 'slider', id: 'laju', value: 4, min: 0, max: 20, step: 1,
            label: 'Tembakan per detik', dec: 0 },
          { type: 'buttons', label: '', items: [
            { label: 'Tembak satu', onClick: tembakAlfa },
            { label: 'Hapus hitungan', onClick: function (sim) {
              sim.data.statistik = { lurus: 0, belok: 0, pantul: 0 };
              sim.data.alfa = [];
            } }
          ] }
        ]
      },
      {
        title: 'Tampilan',
        items: [
          { type: 'toggle', id: 'putar', value: true, label: 'Animasi elektron' },
          { type: 'toggle', id: 'skala', value: false, label: 'Tampilkan perbandingan ukuran' }
        ]
      }
    ],

    readouts: [
      { id: 'tahun', label: 'Tahun', tone: 'accent' },
      { id: 'julukan', label: 'Julukan model' },
      { id: 'lurus', label: 'Lurus' },
      { id: 'pantul', label: 'Terpantul' }
    ],

    setup: siapkan,
    reset: siapkan,

    update: function (sim, dt) {
      if (sim.get('putar')) sim.data.putar += dt * 0.9;

      if (sim.get('percobaan')) {
        const laju = sim.get('laju');
        if (laju > 0 && Math.random() < laju * dt) tembakAlfa(sim);
      }

      const m = sim.get('model');
      const ix = 300, iy = 250;

      sim.data.alfa.forEach(function (p) {
        if (p.hidup <= 0) return;
        if (sim.get('percobaan')) {
          const dx = p.x - ix, dy = p.y - iy;
          const d = Math.hypot(dx, dy);
          if (m === 'thomson') {
            // muatan positif tersebar: gaya sangat lemah dan merata
            if (d < 96) {
              const g = 7 / Math.max(d, 20);
              p.vx += dx / d * g * 60 * dt;
              p.vy += dy / d * g * 60 * dt;
            }
          } else {
            // inti sangat kecil tetapi sangat pekat: gaya Coulomb ~ 1/r²
            if (d < 220) {
              const g = 46000 / Math.max(d * d, 36);
              p.vx += dx / d * g * dt;
              p.vy += dy / d * g * dt;
            }
          }
        }
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.hidup -= dt;

        if (!p.dihitung && p.x > 470) {
          p.dihitung = true;
          const sudut = Math.abs(Math.atan2(p.vy, p.vx));
          if (sudut < 0.1) sim.data.statistik.lurus++;
          else sim.data.statistik.belok++;
        }
        if (!p.dihitung && p.vx < 0 && p.x < 240) {
          p.dihitung = true;
          sim.data.statistik.pantul++;
        }
      });
      sim.data.alfa = sim.data.alfa.filter(function (p) {
        return p.hidup > 0 && p.x > -60 && p.x < 900 && p.y > -120 && p.y < 660;
      });
    },

    draw: function (c, sim) {
      const m = MODEL.find(function (q) { return q.id === sim.get('model'); });
      const ix = 300, iy = 250;
      const putar = sim.data.putar;

      /* ---------- garis waktu ---------- */
      D.line(c, 50, 68, W - 50, 68, 'rgba(255,255,255,.12)', 2);
      MODEL.forEach(function (q, i) {
        const x = 70 + i * (W - 140) / (MODEL.length - 1);
        const aktif = q.id === m.id;
        D.circle(c, x, 68, aktif ? 9 : 5.5,
          aktif ? P.accent : 'rgba(255,255,255,.3)');
        D.text(c, q.nama, x, 48,
          { size: aktif ? 12.5 : 11, weight: aktif ? 700 : 500,
            color: aktif ? P.accent2 : P.faint, align: 'c', base: 'middle' });
        D.text(c, q.tahun, x, 86,
          { size: 10, weight: 500, color: aktif ? P.dim : P.faint, align: 'c', base: 'middle' });
      });

      /* ---------- panggung atom ---------- */
      D.roundRect(c, 40, 108, 420, 300, 14, 'rgba(255,255,255,.035)', 'rgba(255,255,255,.1)', 1.2);

      if (sim.get('percobaan')) {
        // sumber alfa + lempeng emas + layar
        D.roundRect(c, 46, 228, 34, 44, 5, '#4a5057', 'rgba(255,255,255,.3)', 1.3);
        D.text(c, 'sumber α', 63, 286,
          { size: 10, weight: 600, color: P.faint, align: 'c', base: 'middle' });
        D.line(c, 290, 150, 290, 350, 'rgba(216,171,53,.45)', 7);
        D.text(c, 'lempeng emas', 290, 138,
          { size: 10, weight: 600, color: '#d8ab35', align: 'c', base: 'middle' });
        c.save();
        c.setLineDash([4, 5]);
        c.beginPath(); c.arc(ix, iy, 168, 0, Math.PI * 2);
        c.strokeStyle = 'rgba(255,255,255,.14)'; c.lineWidth = 1.4; c.stroke();
        c.restore();
        D.text(c, 'layar pendeteksi', ix, iy + 184,
          { size: 10, weight: 600, color: P.faint, align: 'c', base: 'middle' });
      }

      // --- gambar model ---
      if (m.id === 'dalton') {
        D.atom(c, ix, iy, 76, '#5b9bf5', '', {});
        D.text(c, 'bola pejal, tak terbagi', ix, iy + 104,
          { size: 12.5, weight: 600, color: P.dim, align: 'c', base: 'middle' });

      } else if (m.id === 'thomson') {
        D.circle(c, ix, iy, 84, D.alpha('#ef6a52', 0.26), D.alpha('#ef6a52', 0.6), 2);
        for (let i = 0; i < 9; i++) {
          const a = i / 9 * Math.PI * 2 + putar * 0.2;
          const r = 28 + (i % 3) * 22;
          D.circle(c, ix + Math.cos(a) * r, iy + Math.sin(a) * r, 8, '#5b9bf5', 'rgba(0,0,0,.3)', 1);
          D.text(c, '−', ix + Math.cos(a) * r, iy + Math.sin(a) * r,
            { size: 11, weight: 800, color: '#fff', align: 'c', base: 'middle' });
        }
        D.text(c, '+', ix + 62, iy - 62,
          { size: 22, weight: 800, color: '#ef6a52', align: 'c', base: 'middle' });
        D.text(c, 'muatan positif tersebar merata', ix, iy + 112,
          { size: 12.5, weight: 600, color: P.dim, align: 'c', base: 'middle' });

      } else if (m.id === 'rutherford') {
        // orbit elektron acak
        for (let i = 0; i < 4; i++) {
          c.save();
          c.translate(ix, iy); c.rotate(i * 0.8 + putar * 0.1);
          c.beginPath(); c.ellipse(0, 0, 88, 34, 0, 0, Math.PI * 2);
          c.strokeStyle = 'rgba(91,155,245,.2)'; c.lineWidth = 1.2; c.stroke();
          const a = putar * (1.3 + i * 0.35);
          D.circle(c, Math.cos(a) * 88, Math.sin(a) * 34, 5.5, '#5b9bf5');
          c.restore();
        }
        D.circle(c, ix, iy, 13, '#ef6a52', 'rgba(255,255,255,.3)', 1.4);
        D.text(c, '+', ix, iy, { size: 14, weight: 800, color: '#fff', align: 'c', base: 'middle' });
        D.text(c, 'inti kecil dan pekat, sisanya ruang kosong', ix, iy + 122,
          { size: 12.5, weight: 600, color: P.dim, align: 'c', base: 'middle' });

      } else if (m.id === 'bohr') {
        const kulit = [2, 8, 8];
        kulit.forEach(function (n, k) {
          const r = 34 + k * 30;
          c.beginPath(); c.arc(ix, iy, r, 0, Math.PI * 2);
          c.strokeStyle = 'rgba(91,155,245,.28)'; c.lineWidth = 1.3; c.stroke();
          D.text(c, 'K L M'.split(' ')[k], ix + r + 8, iy - 6,
            { size: 10, weight: 700, color: P.faint, base: 'middle' });
          for (let i = 0; i < n; i++) {
            const a = i / n * Math.PI * 2 + putar * (1.1 - k * 0.25);
            D.circle(c, ix + Math.cos(a) * r, iy + Math.sin(a) * r, 5, '#5b9bf5');
          }
        });
        D.circle(c, ix, iy, 15, '#ef6a52', 'rgba(255,255,255,.3)', 1.4);
        D.text(c, '+', ix, iy, { size: 15, weight: 800, color: '#fff', align: 'c', base: 'middle' });
        // lompatan elektron
        const lompat = (Math.sin(putar * 0.7) + 1) / 2;
        if (lompat > 0.85) {
          D.arrow(c, ix + 34, iy - 34, ix + 64, iy - 64, P.amber, 2, 7);
          D.text(c, 'menyerap energi', ix + 72, iy - 72,
            { size: 10.5, weight: 600, color: P.amber, base: 'middle' });
        }
        D.text(c, 'elektron hanya boleh berada di kulit tertentu', ix, iy + 124,
          { size: 12.5, weight: 600, color: P.dim, align: 'c', base: 'middle' });

      } else {
        // awan elektron
        c.save();
        sim.data.awan.forEach(function (p, i) {
          const wob = Math.sin(putar * 0.4 + i) * 0.8;
          c.globalAlpha = 0.12;
          c.fillStyle = '#5b9bf5';
          c.fillRect(ix + p.x + wob, iy + p.y, 1.8, 1.8);
        });
        c.restore();
        D.circle(c, ix, iy, 9, '#ef6a52', 'rgba(255,255,255,.3)', 1.3);
        c.save();
        c.setLineDash([3, 4]);
        [30, 55, 80].forEach(function (r, i) {
          c.beginPath(); c.arc(ix, iy, r, 0, Math.PI * 2);
          c.strokeStyle = 'rgba(255,255,255,' + (0.14 - i * 0.03) + ')';
          c.lineWidth = 1.1; c.stroke();
        });
        c.restore();
        D.text(c, '90% kebolehjadian', ix + 86, iy - 70,
          { size: 10.5, weight: 600, color: P.faint, base: 'middle' });
        D.text(c, 'kedudukan elektron hanya berupa kebolehjadian', ix, iy + 122,
          { size: 12.5, weight: 600, color: P.dim, align: 'c', base: 'middle' });
      }

      // partikel alfa
      sim.data.alfa.forEach(function (p) {
        c.globalAlpha = Math.min(1, p.hidup);
        D.circle(c, p.x, p.y, 4, '#f0d04a');
        c.globalAlpha = 0.3;
        D.line(c, p.x - p.vx * 0.045, p.y - p.vy * 0.045, p.x, p.y, '#f0d04a', 2);
        c.globalAlpha = 1;
      });

      /* ---------- panel keterangan ---------- */
      const RX = 476, RW = 282;
      D.roundRect(c, RX, 108, RW, 300, 14, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'MODEL ' + m.nama.toUpperCase() + '  ·  ' + m.tahun, RX + 18, 130,
        { size: 11, weight: 700, color: P.accent, base: 'middle' });
      D.text(c, '"' + m.julukan + '"', RX + 18, 154,
        { size: 18, weight: 700, color: P.text, base: 'middle' });

      D.text(c, 'POKOK GAGASAN', RX + 18, 182,
        { size: 10, weight: 700, color: P.faint, base: 'middle' });
      let y = 200;
      m.pokok.forEach(function (s) {
        const kata = s.split(' ');
        let baris = [''];
        kata.forEach(function (w) {
          const coba = baris[baris.length - 1] ? baris[baris.length - 1] + ' ' + w : w;
          if (D.measure(c, coba, { size: 11.5 }) > RW - 54) baris.push(w);
          else baris[baris.length - 1] = coba;
        });
        D.circle(c, RX + 24, y, 2.6, P.accent);
        baris.forEach(function (b, bi) {
          D.text(c, b, RX + 34, y + bi * 14, { size: 11.5, weight: 500, color: P.dim, base: 'middle' });
        });
        y += baris.length * 14 + 7;
      });

      D.line(c, RX + 18, 326, RX + RW - 18, 326, 'rgba(255,255,255,.1)', 1);
      D.text(c, 'BUKTI PENDUKUNG', RX + 18, 342,
        { size: 10, weight: 700, color: P.green, base: 'middle' });
      D.text(c, m.bukti.length > 52 ? m.bukti.slice(0, 50) + '…' : m.bukti, RX + 18, 358,
        { size: 11, weight: 500, color: P.dim, base: 'middle' });
      D.text(c, 'KELEMAHAN', RX + 18, 380,
        { size: 10, weight: 700, color: P.amber, base: 'middle' });
      D.text(c, m.lemah.length > 54 ? m.lemah.slice(0, 52) + '…' : m.lemah, RX + 18, 396,
        { size: 11, weight: 500, color: P.dim, base: 'middle' });

      /* ---------- hasil percobaan ---------- */
      if (sim.get('percobaan')) {
        const s = sim.data.statistik;
        const total = s.lurus + s.belok + s.pantul;
        D.roundRect(c, 40, 422, W - 80, 100, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
        D.text(c, 'HASIL HAMBURAN SINAR ALFA  (' + total + ' partikel)', 58, 442,
          { size: 10.5, weight: 700, color: P.faint, base: 'middle' });

        Plot.batang(c, {
          x: 58, y: 458, w: 300, h: 44,
          data: [
            { label: 'lurus', nilai: s.lurus, warna: P.accent },
            { label: 'dibelokkan', nilai: s.belok, warna: P.amber },
            { label: 'terpantul', nilai: s.pantul, warna: P.red }
          ],
          max: Math.max(5, total), kisi: false, nilaiDiAtas: true
        });

        const tafsir = sim.get('model') === 'thomson'
          ? 'Model Thomson meramalkan semua partikel lewat hampir lurus — tidak cocok dengan hasil nyata Rutherford.'
          : 'Sebagian kecil partikel terpantul keras. Hanya mungkin bila massa dan muatan positif terpusat di inti yang sangat kecil.';
        D.text(c, tafsir, 384, 470, { size: 12, weight: 500, color: P.dim, base: 'middle' });
        D.text(c, '"Seolah menembakkan peluru ke kertas tisu, lalu peluru itu memantul balik."',
          384, 492, { size: 11.5, weight: 500, color: P.faint, base: 'middle' });
      } else if (sim.get('skala')) {
        D.roundRect(c, 40, 422, W - 80, 100, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
        D.text(c, 'PERBANDINGAN UKURAN', 58, 442,
          { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
        D.text(c, 'Bila inti atom sebesar bola sepak di tengah lapangan,', 58, 466,
          { size: 13, weight: 500, color: P.dim, base: 'middle' });
        D.text(c, 'elektron terdekat berada sekitar 3 kilometer jauhnya.', 58, 486,
          { size: 13, weight: 500, color: P.dim, base: 'middle' });
        D.text(c, 'Sisanya? Ruang kosong.', 58, 506,
          { size: 13, weight: 700, color: P.accent2, base: 'middle' });
        D.circle(c, 600, 476, 4, '#ef6a52');
        c.save(); c.setLineDash([3, 4]);
        c.beginPath(); c.arc(600, 476, 44, 0, Math.PI * 2);
        c.strokeStyle = 'rgba(91,155,245,.4)'; c.lineWidth = 1.2; c.stroke();
        c.restore();
        D.circle(c, 644, 476, 3, '#5b9bf5');
        D.text(c, 'inti', 600, 496, { size: 10, weight: 600, color: P.faint, align: 'c', base: 'middle' });
      }
    },

    readoutsUpdate: function (sim) {
      const m = MODEL.find(function (q) { return q.id === sim.get('model'); });
      sim.readout('tahun', m.tahun);
      sim.readout('julukan', m.julukan);
      sim.readout('lurus', sim.data.statistik.lurus);
      sim.readout('pantul', sim.data.statistik.pantul,
        sim.data.statistik.pantul > 0 ? 'warn' : null);
    },

    notes: `
      <p>Model atom berubah lima kali dalam seratus tahun. Setiap perubahan bukan karena
      model lama "salah secara konyol", melainkan karena muncul <strong>hasil percobaan
      baru yang tidak dapat dijelaskan</strong> model sebelumnya. Inilah cara ilmu
      pengetahuan bekerja.</p>

      <h3>Percobaan Rutherford dan kejutannya</h3>
      <p>Rutherford menembakkan partikel alfa (bermuatan positif) ke lempeng emas yang
      sangat tipis. Menurut model Thomson, semua partikel seharusnya menembus lurus,
      karena muatan positif tersebar merata dan lemah.</p>

      <p>Yang terjadi berbeda: sebagian besar memang lurus, tetapi <strong>sekitar satu
      dari delapan ribu partikel terpantul balik</strong>. Rutherford menyebutnya sama
      mengejutkannya seperti peluru yang memantul dari kertas tisu.</p>

      <p>Satu-satunya penjelasan: massa dan muatan positif atom <strong>terpusat pada
      inti yang sangat kecil</strong>. Partikel alfa yang kebetulan mendekati inti
      ditolak sangat kuat, sedangkan sisanya melewati ruang kosong.</p>

      <h3>Mengapa model Bohr diperlukan?</h3>
      <p>Menurut fisika klasik, elektron yang mengelilingi inti akan terus memancarkan
      energi dan jatuh ke inti dalam waktu sepersekian detik. Kenyataannya atom stabil.
      Bohr mengusulkan bahwa elektron hanya boleh berada pada <strong>tingkat energi
      tertentu</strong> dan tidak memancarkan energi selama berada di sana.</p>

      <p>Bukti pendukungnya adalah <strong>spektrum garis</strong>: gas hidrogen yang
      dipanaskan memancarkan cahaya pada panjang gelombang tertentu saja, bukan seluruh
      warna. Garis-garis terputus itu menunjukkan tingkat energi yang terputus pula.</p>

      <h3>Model mekanika kuantum</h3>
      <p>Heisenberg menunjukkan bahwa kedudukan dan kecepatan elektron tidak dapat
      diketahui bersamaan dengan tepat. Schrödinger kemudian merumuskan persamaan
      gelombang yang memberikan <strong>kebolehjadian</strong> menemukan elektron di
      suatu tempat. Daerah dengan kebolehjadian terbesar disebut <strong>orbital</strong>.</p>

      <div class="callout" data-tone="tip">
        <strong>Model mana yang benar?</strong>
        Semua model masih dipakai sesuai keperluan. Model Bohr cukup untuk menjelaskan
        konfigurasi elektron dan ikatan kimia di SMA. Model kuantum dipakai bila kita
        perlu menjelaskan bentuk orbital dan sifat spektrum yang rinci.
      </div>
    `,

    explore: [
      'Pilih model <strong>Thomson</strong>, nyalakan <strong>Mode percobaan</strong>, dan tembakkan banyak partikel. Berapa yang terpantul?',
      'Ganti ke model <strong>Rutherford</strong> tanpa mengubah apa pun. Bandingkan hasil hamburannya.',
      'Nyalakan <strong>Perbandingan ukuran</strong>. Seberapa kosong sebenarnya sebuah atom?',
      'Telusuri kelima model berurutan. Untuk tiap model, catat bukti apa yang memaksa perubahan berikutnya.'
    ],

    quiz: [
      {
        q: 'Kesimpulan utama percobaan hamburan sinar alfa Rutherford adalah…',
        options: [
          'Atom bermuatan negatif merata',
          'Massa dan muatan positif atom terpusat pada inti yang sangat kecil',
          'Elektron bergerak pada lintasan tetap',
          'Atom tidak dapat dibagi lagi'
        ],
        answer: 1,
        explain: 'Sebagian kecil partikel alfa terpantul dengan sudut besar. Ini hanya mungkin bila ada pusat bermuatan positif yang sangat pekat dan bermassa besar, yaitu inti atom.'
      },
      {
        q: 'Kelemahan utama model atom Rutherford adalah…',
        options: [
          'Tidak dapat menjelaskan adanya elektron',
          'Tidak dapat menjelaskan mengapa atom stabil dan elektron tidak jatuh ke inti',
          'Tidak sesuai dengan hukum kekekalan massa',
          'Tidak dapat menjelaskan adanya inti atom'
        ],
        answer: 1,
        explain: 'Menurut fisika klasik, muatan yang bergerak melingkar terus memancarkan energi. Elektron seharusnya kehilangan energi dan jatuh ke inti, tetapi kenyataannya atom stabil. Bohr kemudian menjawab masalah ini.'
      },
      {
        q: 'Bukti percobaan yang mendasari model atom Bohr adalah…',
        options: [
          'Hamburan sinar alfa',
          'Percobaan tabung sinar katode',
          'Spektrum garis atom hidrogen',
          'Hukum perbandingan tetap'
        ],
        answer: 2,
        explain: 'Gas hidrogen memancarkan cahaya hanya pada panjang gelombang tertentu, membentuk garis-garis terputus. Hal ini menunjukkan elektron hanya boleh menempati tingkat energi tertentu.'
      },
      {
        q: 'Menurut model mekanika kuantum, orbital adalah…',
        options: [
          'Lintasan berbentuk lingkaran yang dilalui elektron',
          'Daerah dengan kebolehjadian terbesar menemukan elektron',
          'Kulit tempat elektron berkumpul',
          'Inti atom beserta elektronnya'
        ],
        answer: 1,
        explain: 'Karena kedudukan elektron tidak dapat dipastikan, yang dapat dinyatakan hanyalah kebolehjadiannya. Orbital adalah daerah di sekitar inti dengan peluang terbesar menemukan elektron.'
      }
    ]
  });
})();
