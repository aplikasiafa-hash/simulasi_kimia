/* Konfigurasi Elektron dan Aturan Pengisian — Fase E
   Isi orbital satu per satu mengikuti Aufbau, Hund, dan larangan Pauli. */

(function () {
  'use strict';

  const D = Sim.Draw, P = Sim.P;
  const C = Chem;

  const W = 790, H = 560;

  const SUBKULIT = { s: 1, p: 3, d: 5, f: 7 };
  const WARNA_SUB = { s: '#5b9bf5', p: '#6fcf7f', d: '#f0a94a', f: '#b795f0' };

  function siapkan(sim) {
    sim.data.terisi = 0;      // berapa elektron yang sudah digambar
    sim.data.isiOtomatis = false;
  }

  /** Daftar kotak orbital beserta pengisiannya untuk Z elektron. */
  function petaOrbital(Z) {
    const konf = C.konfigurasi(Z);
    const kotak = [];
    konf.forEach(function (pasang) {
      const nama = pasang[0], jml = pasang[1];
      const jenis = nama[1];
      const nOrbital = SUBKULIT[jenis];
      // aturan Hund: isi satu per satu dulu, baru berpasangan
      const isi = new Array(nOrbital).fill(0);
      for (let i = 0; i < jml; i++) {
        if (i < nOrbital) isi[i] = 1;
        else isi[i - nOrbital] = 2;
      }
      kotak.push({ nama: nama, jenis: jenis, isi: isi, jml: jml });
    });
    return kotak;
  }

  Sim.create({
    title: 'Konfigurasi Elektron dan Aturan Pengisian',
    subtitle: 'Elektron tidak diletakkan sembarangan. Tiga aturan menentukan urutannya: Aufbau mengatur urutan energi, Hund mengatur penyebaran, Pauli membatasi isi tiap orbital.',
    fase: 'E', jenjang: 'SMA Kelas 10',
    topik: ['Konfigurasi Elektron', 'Orbital'],
    stage: { w: W, h: H },

    controls: [
      {
        title: 'Unsur',
        items: [
          { type: 'slider', id: 'Z', value: 17, min: 1, max: 118, step: 1,
            label: 'Nomor atom (Z)', dec: 0,
            format: function (v) {
              const e = C.byZ[Math.round(v)];
              return e ? e.sym + ' (' + Math.round(v) + ')' : String(Math.round(v));
            } },
          { type: 'buttons', label: 'Lompat ke', items: [
            { label: 'Na (11)', onClick: function (sim) { sim.set('Z', 11); } },
            { label: 'Fe (26)', onClick: function (sim) { sim.set('Z', 26); } },
            { label: 'Br (35)', onClick: function (sim) { sim.set('Z', 35); } }
          ] }
        ]
      },
      {
        title: 'Tampilan',
        items: [
          { type: 'segment', id: 'bentuk', value: 'penuh', label: 'Bentuk penulisan',
            options: [
              { value: 'penuh', label: 'Penuh' },
              { value: 'singkat', label: 'Gas mulia' },
              { value: 'kulit', label: 'Per kulit' }
            ] },
          { type: 'toggle', id: 'diagram', value: true, label: 'Diagram orbital (kotak)' },
          { type: 'toggle', id: 'tangga', value: true, label: 'Diagram tingkat energi' },
          { type: 'toggle', id: 'animasi', value: true, label: 'Isi satu per satu',
            hint: 'Elektron muncul berurutan sesuai aturan Aufbau.' }
        ]
      }
    ],

    readouts: [
      { id: 'unsur', label: 'Unsur', tone: 'accent' },
      { id: 'valensi', label: 'Elektron valensi' },
      { id: 'gol', label: 'Golongan' },
      { id: 'periode', label: 'Periode' }
    ],

    setup: siapkan,
    reset: siapkan,
    onChange: function (sim, id) { if (id === 'Z') sim.data.terisi = 0; },

    update: function (sim, dt) {
      const Z = Math.round(sim.get('Z'));
      if (sim.get('animasi')) {
        sim.data.terisi = Math.min(Z, sim.data.terisi + dt * 26);
      } else {
        sim.data.terisi = Z;
      }
    },

    draw: function (c, sim) {
      const Z = Math.round(sim.get('Z'));
      const unsur = C.byZ[Z];
      const kotak = petaOrbital(Z);
      const tampil = Math.floor(sim.data.terisi);

      /* ---------- judul unsur ---------- */
      D.text(c, 'KONFIGURASI ELEKTRON', 40, 38,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
      if (unsur) {
        D.text(c, unsur.sym, 40, 70, { size: 34, weight: 700, color: P.accent2, base: 'middle' });
        D.text(c, unsur.nama + '  ·  Z = ' + Z, 40 + D.measure(c, unsur.sym, { size: 34, weight: 700 }) + 14, 62,
          { size: 15, weight: 600, color: P.text, base: 'middle' });
        D.text(c, C.KATEGORI_NAMA[unsur.kategori],
          40 + D.measure(c, unsur.sym, { size: 34, weight: 700 }) + 14, 82,
          { size: 11.5, weight: 600, color: C.KATEGORI_WARNA[unsur.kategori], base: 'middle' });
      }

      /* ---------- tulisan konfigurasi ---------- */
      const bentuk = sim.get('bentuk');
      let teks;
      if (bentuk === 'kulit') {
        teks = C.kulit(Z).map(function (n, i) { return 'KLMNOPQ'[i] + ' = ' + n; }).join('   ');
      } else if (bentuk === 'singkat') {
        const inti = C.intiGasMulia(Z);
        const Zinti = inti ? C.bySym[inti.slice(1, -1)].Z : 0;
        const sisa = C.konfigurasi(Z).filter(function (p, i) {
          // ambil subkulit setelah inti gas mulia
          let total = 0;
          for (let k = 0; k <= i; k++) total += C.konfigurasi(Z)[k][1];
          return total > Zinti;
        });
        teks = (inti ? inti + ' ' : '') + sisa.map(function (p) {
          return p[0] + Sim.sup(p[1]); }).join(' ');
      } else {
        teks = C.konfigurasi(Z).map(function (p) { return p[0] + Sim.sup(p[1]); }).join(' ');
      }

      D.roundRect(c, 40, 100, W - 80, 48, 10, 'rgba(79,209,192,.1)', 'rgba(79,209,192,.3)', 1.3);
      D.text(c, teks, 58, 124, { size: 17, weight: 650, color: P.accent2, base: 'middle', mono: true });

      if (C.PENYIMPANGAN[Z]) {
        D.text(c, '⚠ Unsur ini menyimpang dari aturan Aufbau demi kestabilan subkulit setengah/penuh.',
          58, 160, { size: 11.5, weight: 600, color: P.amber, base: 'middle' });
      }

      /* ---------- diagram orbital ---------- */
      if (sim.get('diagram')) {
        const OX = 40, OY = 184;
        D.text(c, 'DIAGRAM ORBITAL', OX, OY - 10,
          { size: 10.5, weight: 700, color: P.faint, base: 'middle' });

        let x = OX, y = OY + 14, dihitung = 0;
        const lebarKotak = 19, celah = 2;

        kotak.forEach(function (sub) {
          const lebarTotal = sub.isi.length * (lebarKotak + celah) + 40;
          if (x + lebarTotal > W - 40) { x = OX; y += 46; }

          D.text(c, sub.nama, x, y + 10,
            { size: 12, weight: 700, color: WARNA_SUB[sub.jenis], base: 'middle' });

          sub.isi.forEach(function (isi, i) {
            const kx = x + 26 + i * (lebarKotak + celah);
            D.roundRect(c, kx, y, lebarKotak, 20, 3,
              'rgba(255,255,255,.04)', 'rgba(255,255,255,.2)', 1.1);

            // panah elektron
            if (isi >= 1 && dihitung < tampil) {
              D.line(c, kx + 6, y + 15, kx + 6, y + 5, P.text, 1.6);
              D.line(c, kx + 6, y + 5, kx + 3.4, y + 8, P.text, 1.6);
              D.line(c, kx + 6, y + 5, kx + 8.6, y + 8, P.text, 1.6);
            }
            if (isi >= 1) dihitung++;
          });
          // elektron berpasangan (panah ke bawah)
          sub.isi.forEach(function (isi, i) {
            const kx = x + 26 + i * (lebarKotak + celah);
            if (isi >= 2) {
              const urut = sub.isi.length + i;  // kira-kira urutan pengisian
              if (dihitung - sub.jml + urut < tampil) {
                D.line(c, kx + 13, y + 5, kx + 13, y + 15, P.text, 1.6);
                D.line(c, kx + 13, y + 15, kx + 10.4, y + 12, P.text, 1.6);
                D.line(c, kx + 13, y + 15, kx + 15.6, y + 12, P.text, 1.6);
              }
            }
          });
          D.text(c, String(sub.jml), x + 26 + sub.isi.length * (lebarKotak + celah) + 4, y + 10,
            { size: 10.5, weight: 600, color: P.faint, base: 'middle' });
          x += lebarTotal;
        });

        sim.data.diagramBawah = y + 42;
      } else {
        sim.data.diagramBawah = 200;
      }

      /* ---------- tangga tingkat energi (diagram Moeller) ---------- */
      if (sim.get('tangga')) {
        const TY = Math.max(sim.data.diagramBawah, 300);
        const TX = 40;
        D.text(c, 'URUTAN PENGISIAN MENURUT AUFBAU', TX, TY,
          { size: 10.5, weight: 700, color: P.faint, base: 'middle' });

        const urutan = C.AUFBAU;
        const sudahTerisi = {};
        C.konfigurasi(Z).forEach(function (p) { sudahTerisi[p[0]] = p[1]; });

        const perBaris = 10;
        urutan.forEach(function (u, i) {
          const bx = TX + (i % perBaris) * 48;
          const by = TY + 20 + Math.floor(i / perBaris) * 34;
          const isi = sudahTerisi[u[0]] || 0;
          const penuh = isi === u[1];
          const sebagian = isi > 0 && !penuh;
          D.roundRect(c, bx, by, 42, 26, 5,
            penuh ? D.alpha(WARNA_SUB[u[0][1]], 0.3)
              : sebagian ? D.alpha(WARNA_SUB[u[0][1]], 0.15) : 'rgba(255,255,255,.03)',
            isi > 0 ? WARNA_SUB[u[0][1]] : 'rgba(255,255,255,.1)', isi > 0 ? 1.5 : 1);
          D.text(c, u[0], bx + 21, by + 10,
            { size: 11.5, weight: 700, align: 'c', base: 'middle',
              color: isi > 0 ? P.text : P.faint });
          D.text(c, isi + '/' + u[1], bx + 21, by + 20,
            { size: 9, weight: 500, align: 'c', base: 'middle',
              color: isi > 0 ? P.dim : P.faint });
          if (i % perBaris < perBaris - 1 && i < urutan.length - 1) {
            D.text(c, '›', bx + 45, by + 13,
              { size: 12, weight: 700, color: 'rgba(255,255,255,.2)', align: 'c', base: 'middle' });
          }
        });
      }

      /* ---------- tiga aturan ---------- */
      const AY = H - 96;
      D.roundRect(c, 40, AY, W - 80, 82, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      const aturan = [
        ['AUFBAU', 'Orbital berenergi terendah diisi lebih dulu', '#5b9bf5'],
        ['HUND', 'Dalam subkulit sama, elektron menyebar dulu sebelum berpasangan', '#6fcf7f'],
        ['PAULI', 'Tiap orbital maksimal 2 elektron dengan arah putar berlawanan', '#f0a94a']
      ];
      aturan.forEach(function (a, i) {
        const x = 58 + i * ((W - 116) / 3);
        D.text(c, a[0], x, AY + 22, { size: 12.5, weight: 800, color: a[2], base: 'middle' });
        const kata = a[1].split(' ');
        let baris = [''];
        kata.forEach(function (w) {
          const coba = baris[baris.length - 1] ? baris[baris.length - 1] + ' ' + w : w;
          if (D.measure(c, coba, { size: 11 }) > (W - 116) / 3 - 20) baris.push(w);
          else baris[baris.length - 1] = coba;
        });
        baris.slice(0, 3).forEach(function (b, bi) {
          D.text(c, b, x, AY + 42 + bi * 14,
            { size: 11, weight: 500, color: P.dim, base: 'middle' });
        });
      });
    },

    readoutsUpdate: function (sim) {
      const Z = Math.round(sim.get('Z'));
      const unsur = C.byZ[Z];
      sim.readout('unsur', unsur ? unsur.sym : '—');
      sim.readout('valensi', C.valensi(Z));
      if (unsur) {
        const gol = unsur.gol;
        sim.readout('gol', gol ? (gol <= 2 ? gol + 'A' : gol >= 13 ? (gol - 10) + 'A' : (gol - 2) + 'B')
          : (unsur.kategori === 'lantanida' ? 'Lantanida' : 'Aktinida'));
        sim.readout('periode', unsur.periode);
      } else {
        sim.readout('gol', '—'); sim.readout('periode', '—');
      }
    },

    notes: `
      <p>Elektron tidak berkumpul sembarangan. Letaknya diatur tiga aturan yang bekerja
      bersama-sama, dan dari susunan itulah seluruh sifat kimia unsur dapat diramalkan.</p>

      <h3>1. Asas Aufbau — urutan energi</h3>
      <p>Elektron mengisi orbital dengan <strong>energi terendah lebih dulu</strong>.
      Urutannya tidak selalu sesuai nomor kulit, karena energi 4s ternyata lebih rendah
      daripada 3d:</p>
      <span class="formula">1s 2s 2p 3s 3p 4s 3d 4p 5s 4d 5p 6s 4f 5d 6p 7s 5f 6d 7p</span>

      <h3>2. Kaidah Hund — menyebar dulu</h3>
      <p>Dalam subkulit yang sama (misalnya tiga orbital 2p), elektron <strong>mengisi
      satu per satu dengan arah putar sejajar</strong> sebelum mulai berpasangan.
      Alasannya sederhana: elektron bermuatan sejenis saling tolak, jadi lebih stabil
      bila menempati orbital terpisah.</p>

      <h3>3. Larangan Pauli — maksimal dua</h3>
      <p>Satu orbital hanya boleh diisi <strong>dua elektron</strong>, dan keduanya harus
      berlawanan arah putar (digambar sebagai panah atas dan bawah). Akibatnya daya
      tampung tiap subkulit menjadi: s = 2, p = 6, d = 10, f = 14.</p>

      <h3>Menentukan letak unsur dari konfigurasi</h3>
      <ul>
        <li><strong>Periode</strong> = nomor kulit terbesar.</li>
        <li><strong>Golongan utama (A)</strong> = jumlah elektron pada kulit terluar.</li>
        <li><strong>Golongan transisi (B)</strong> = jumlah elektron ns + (n−1)d.</li>
      </ul>

      <p>Contoh klorin (Z = 17): 1s² 2s² 2p⁶ 3s² 3p⁵. Kulit terbesar adalah 3 →
      periode 3. Elektron di kulit terluar = 2 + 5 = 7 → golongan VIIA.</p>

      <h3>Penyimpangan yang perlu diingat</h3>
      <p>Beberapa unsur menyimpang dari Aufbau karena subkulit d yang <strong>setengah
      penuh (d⁵)</strong> atau <strong>penuh (d¹⁰)</strong> lebih stabil:</p>
      <ul>
        <li>Kromium: [Ar] 4s¹ 3d⁵, bukan 4s² 3d⁴</li>
        <li>Tembaga: [Ar] 4s¹ 3d¹⁰, bukan 4s² 3d⁹</li>
      </ul>

      <div class="callout" data-tone="tip">
        <strong>Mengapa ini penting?</strong>
        Elektron valensi menentukan hampir semua sifat kimia unsur. Dua unsur dengan
        jumlah elektron valensi sama akan bersifat mirip — itulah alasan tabel periodik
        tersusun seperti sekarang.
      </div>
    `,

    explore: [
      'Atur Z = 17 (klorin). Hitung elektron valensinya dari diagram, lalu cek dengan pembacaan golongan.',
      'Bandingkan Z = 9 (F), 17 (Cl), dan 35 (Br). Apa persamaan konfigurasi kulit terluarnya?',
      'Atur Z = 24 (kromium). Perhatikan peringatan penyimpangan. Mengapa 4s¹3d⁵ lebih stabil?',
      'Nyalakan <strong>Isi satu per satu</strong> dan amati orbital 2p. Perhatikan elektron menyebar dulu — itulah kaidah Hund.'
    ],

    quiz: [
      {
        q: 'Konfigurasi elektron atom belerang (Z = 16) adalah…',
        options: [
          '1s² 2s² 2p⁶ 3s² 3p⁴',
          '1s² 2s² 2p⁶ 3s² 3p⁶',
          '1s² 2s² 2p⁶ 3s¹ 3p⁵',
          '1s² 2s² 2p⁸ 3s² 3p⁴'
        ],
        answer: 0,
        explain: 'Mengikuti Aufbau: 1s² (2) + 2s² (4) + 2p⁶ (10) + 3s² (12) + 3p⁴ (16). Perhatikan bahwa daya tampung 2p adalah 6, bukan 8.'
      },
      {
        q: 'Mengapa elektron pada orbital 2p mengisi tiga kotak satu per satu sebelum berpasangan?',
        options: [
          'Karena asas Aufbau',
          'Karena larangan Pauli',
          'Karena kaidah Hund — elektron bermuatan sejenis saling tolak',
          'Karena orbital p lebih besar daripada s'
        ],
        answer: 2,
        explain: 'Kaidah Hund menyatakan elektron dalam subkulit yang sama mengisi orbital terpisah dengan arah putar sejajar lebih dulu, karena susunan itu lebih stabil.'
      },
      {
        q: 'Unsur dengan konfigurasi [Ne] 3s² 3p³ terletak pada…',
        options: ['Periode 3, golongan IIIA', 'Periode 3, golongan VA', 'Periode 5, golongan IIIA', 'Periode 2, golongan VA'],
        answer: 1,
        explain: 'Kulit terbesar adalah 3 sehingga periode 3. Elektron kulit terluar = 2 + 3 = 5, sehingga golongan VA. Unsur ini adalah fosforus.'
      },
      {
        q: 'Konfigurasi elektron tembaga (Z = 29) adalah [Ar] 4s¹ 3d¹⁰, bukan [Ar] 4s² 3d⁹. Alasannya adalah…',
        options: [
          'Terjadi kesalahan pengukuran',
          'Subkulit d yang terisi penuh lebih stabil',
          'Orbital 4s tidak boleh terisi penuh',
          'Tembaga adalah logam transisi'
        ],
        answer: 1,
        explain: 'Susunan d¹⁰ (penuh) dan d⁵ (setengah penuh) memiliki kestabilan tambahan. Satu elektron 4s berpindah ke 3d untuk mencapai susunan yang lebih stabil itu.'
      }
    ]
  });
})();
