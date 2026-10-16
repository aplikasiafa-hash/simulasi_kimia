/* Ikatan Ion dan Ikatan Kovalen — Fase E
   Pasangkan dua unsur, amati elektron berpindah atau dipakai bersama,
   lengkap dengan struktur Lewis dan ramalan jenis ikatan dari selisih
   keelektronegatifan. */

(function () {
  'use strict';

  const D = Sim.Draw, P = Sim.P;
  const C = Chem;

  const W = 790, H = 560;

  const PILIHAN = [3, 4, 6, 7, 8, 9, 11, 12, 13, 15, 16, 17, 19, 20, 35, 53, 1];

  function siapkan(sim) {
    sim.data.a = 0;
    sim.data.jalan = false;
  }

  /** Perkiraan jenis ikatan dari selisih keelektronegatifan. */
  function jenisIkatan(a, b) {
    if (!a.en || !b.en) return { jenis: 'tidak lazim', d: 0, warna: P.faint };
    const d = Math.abs(a.en - b.en);
    const logamA = ['alkali', 'alkali-tanah', 'transisi', 'pasca-transisi'].indexOf(a.kategori) >= 0;
    const logamB = ['alkali', 'alkali-tanah', 'transisi', 'pasca-transisi'].indexOf(b.kategori) >= 0;
    if (logamA && logamB) return { jenis: 'Ikatan logam', d: d, warna: '#f0a94a' };
    if (d >= 1.7) return { jenis: 'Ikatan ion', d: d, warna: '#ef6a52' };
    if (d >= 0.4) return { jenis: 'Kovalen polar', d: d, warna: '#5b9bf5' };
    return { jenis: 'Kovalen nonpolar', d: d, warna: '#6fcf7f' };
  }

  /** Berapa elektron yang perlu dilepas (+) atau diterima (−) agar stabil. */
  function kebutuhan(e) {
    const v = C.valensi(e.Z);
    if (e.kategori === 'gas-mulia') return 0;
    if (v <= 3) return v;          // cenderung melepas v elektron
    return -(8 - v);               // cenderung menerima (8 − v) elektron
  }

  /** Rumus senyawa dari dua unsur dengan penyilangan muatan. */
  function rumusSenyawa(a, b) {
    const ka = kebutuhan(a), kb = kebutuhan(b);
    if (ka === 0 || kb === 0) return null;
    if ((ka > 0) === (kb > 0)) return null;    // keduanya melepas atau keduanya menerima
    const pa = Math.abs(ka), pb = Math.abs(kb);
    const g = (function fpb(x, y) { return y === 0 ? x : fpb(y, x % y); })(pa, pb);
    const na = pb / g, nb = pa / g;
    const kation = ka > 0 ? a : b;
    const anion = ka > 0 ? b : a;
    const nK = ka > 0 ? na : nb;
    const nA = ka > 0 ? nb : na;
    return {
      rumus: kation.sym + (nK > 1 ? nK : '') + anion.sym + (nA > 1 ? nA : ''),
      kation: kation, anion: anion, nK: nK, nA: nA,
      muatanK: Math.abs(kebutuhan(kation)), muatanA: Math.abs(kebutuhan(anion))
    };
  }

  /** Gambar titik elektron valensi di sekeliling lambang unsur (Lewis). */
  function lewis(c, x, y, sym, nVal, warna, r, sorotTerakhir) {
    D.text(c, sym, x, y, { size: 19, weight: 700, color: warna, align: 'c', base: 'middle' });
    const posisi = [[0, -1], [1, 0], [0, 1], [-1, 0]];   // atas, kanan, bawah, kiri
    for (let i = 0; i < nVal; i++) {
      const sisi = posisi[i % 4];
      const kedua = i >= 4;
      const geser = kedua ? 5 : -5;
      const px = x + sisi[0] * r + (sisi[0] === 0 ? geser : 0);
      const py = y + sisi[1] * r + (sisi[1] === 0 ? geser : 0);
      const terakhir = sorotTerakhir && i === nVal - 1;
      D.circle(c, px, py, terakhir ? 4 : 3, terakhir ? P.amber : warna);
    }
  }

  Sim.create({
    title: 'Ikatan Ion dan Ikatan Kovalen',
    subtitle: 'Atom berikatan untuk mencapai susunan elektron stabil seperti gas mulia. Yang membedakan jenis ikatannya adalah apakah elektron berpindah atau dipakai bersama.',
    fase: 'E', jenjang: 'SMA Kelas 10',
    topik: ['Ikatan Kimia', 'Struktur Lewis'],
    stage: { w: W, h: H },

    controls: [
      {
        title: 'Pasangan unsur',
        items: [
          { type: 'select', id: 'a', value: 11, label: 'Unsur pertama',
            options: PILIHAN.map(function (z) {
              return { value: z, label: C.byZ[z].sym + ' — ' + C.byZ[z].nama }; }) },
          { type: 'select', id: 'b', value: 17, label: 'Unsur kedua',
            options: PILIHAN.map(function (z) {
              return { value: z, label: C.byZ[z].sym + ' — ' + C.byZ[z].nama }; }) },
          { type: 'buttons', label: 'Contoh terkenal', items: [
            { label: 'NaCl', onClick: function (sim) { sim.set('a', '11'); sim.set('b', '17'); sim.data.a = 0; } },
            { label: 'H₂O', onClick: function (sim) { sim.set('a', '1'); sim.set('b', '8'); sim.data.a = 0; } },
            { label: 'MgO', onClick: function (sim) { sim.set('a', '12'); sim.set('b', '8'); sim.data.a = 0; } }
          ] }
        ]
      },
      {
        title: 'Proses',
        items: [
          { type: 'buttons', label: '', items: [
            { label: '▶ Bentuk ikatan', primary: true, onClick: function (sim) {
              sim.data.jalan = true; if (sim.data.a >= 1) sim.data.a = 0;
            } },
            { label: '↺ Pisahkan', onClick: function (sim) { sim.data.a = 0; sim.data.jalan = false; } }
          ] },
          { type: 'toggle', id: 'lewis', value: true, label: 'Struktur Lewis' },
          { type: 'toggle', id: 'kulit', value: true, label: 'Gambar kulit elektron' },
          { type: 'toggle', id: 'skala', value: true, label: 'Skala keelektronegatifan' }
        ]
      }
    ],

    readouts: [
      { id: 'jenis', label: 'Jenis ikatan', tone: 'accent' },
      { id: 'rumus', label: 'Rumus senyawa' },
      { id: 'selisih', label: 'Selisih EN' },
      { id: 'sifat', label: 'Sifat khas' }
    ],

    setup: siapkan,
    reset: siapkan,
    onChange: function (sim, id) {
      if (id === 'a' || id === 'b') { sim.data.a = 0; sim.data.jalan = false; }
    },

    update: function (sim, dt) {
      if (sim.data.jalan) {
        sim.data.a += dt * 0.45;
        if (sim.data.a >= 1) { sim.data.a = 1; sim.data.jalan = false; }
      }
    },

    draw: function (c, sim) {
      const A = C.byZ[parseInt(sim.get('a'), 10)];
      const B = C.byZ[parseInt(sim.get('b'), 10)];
      const a = sim.data.a;
      const ik = jenisIkatan(A, B);
      const senyawa = rumusSenyawa(A, B);
      const ion = ik.jenis === 'Ikatan ion';

      const vA = C.valensi(A.Z), vB = C.valensi(B.Z);
      const kA = kebutuhan(A), kB = kebutuhan(B);

      /* ---------- panggung atom ---------- */
      const cy = 230;
      const jarakAwal = 200, jarakAkhir = ion ? 130 : 96;
      const jarak = Sim.lerp(jarakAwal, jarakAkhir, a);
      const xA = 300 - jarak / 2, xB = 300 + jarak / 2;

      D.text(c, 'PEMBENTUKAN IKATAN', 40, 50,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });

      // kulit elektron
      if (sim.get('kulit')) {
        [[A, xA, kA], [B, xB, kB]].forEach(function (q) {
          const e = q[0], x = q[1], keb = q[2];
          const kulitList = C.kulit(e.Z);
          kulitList.forEach(function (n, k) {
            const r = 20 + k * 15;
            c.beginPath(); c.arc(x, cy, r, 0, Math.PI * 2);
            c.strokeStyle = 'rgba(91,155,245,.18)'; c.lineWidth = 1; c.stroke();
            let jml = n;
            // elektron valensi berpindah saat ikatan ion terbentuk
            if (ion && k === kulitList.length - 1) {
              if (keb > 0) jml = Math.max(0, n - Math.round(keb * a));
              else jml = n + Math.round(Math.abs(keb) * a);
            }
            for (let i = 0; i < jml; i++) {
              const ang = i / Math.max(jml, 1) * Math.PI * 2 + k * 0.4 + sim.t * 0.25;
              D.circle(c, x + Math.cos(ang) * r, cy + Math.sin(ang) * r, 3.6, '#5b9bf5');
            }
          });
          D.circle(c, x, cy, 13, C.warnaAtom(e.sym), 'rgba(255,255,255,.3)', 1.3);
          D.text(c, e.sym, x, cy,
            { size: 12, weight: 700, color: D.readable(C.warnaAtom(e.sym)), align: 'c', base: 'middle' });
        });
      }

      // elektron yang berpindah (ikatan ion)
      if (ion && a > 0 && a < 1) {
        const dari = kA > 0 ? xA : xB;
        const ke = kA > 0 ? xB : xA;
        const n = Math.abs(kA > 0 ? kA : kB);
        for (let i = 0; i < n; i++) {
          const t = Sim.clamp(a * 1.6 - i * 0.18, 0, 1);
          const px = Sim.lerp(dari, ke, t);
          const py = cy - Math.sin(t * Math.PI) * 48;
          D.circle(c, px, py, 5.5, P.amber, 'rgba(0,0,0,.3)', 1);
          D.text(c, '−', px, py, { size: 9, weight: 800, color: '#06201d', align: 'c', base: 'middle' });
        }
      }

      // pasangan elektron bersama (kovalen)
      if (!ion && a > 0.3) {
        const mid = (xA + xB) / 2;
        const nPas = Math.min(Math.abs(kA), Math.abs(kB)) || 1;
        for (let i = 0; i < nPas; i++) {
          const oy = (i - (nPas - 1) / 2) * 13;
          D.circle(c, mid - 5, cy + oy, 4, P.amber);
          D.circle(c, mid + 5, cy + oy, 4, P.amber);
        }
        D.roundRect(c, mid - 20, cy - nPas * 8 - 6, 40, nPas * 16 + 12, 9,
          null, D.alpha(P.amber, 0.5), 1.4, [4, 3]);
        D.text(c, 'dipakai bersama', mid, cy + nPas * 10 + 22,
          { size: 10.5, weight: 600, color: P.amber, align: 'c', base: 'middle' });
      }

      // label muatan ion
      if (ion && a > 0.65) {
        [[A, xA, kA], [B, xB, kB]].forEach(function (q) {
          const muatan = q[2];
          if (!muatan) return;
          const tanda = (Math.abs(muatan) > 1 ? Math.abs(muatan) : '') + (muatan > 0 ? '+' : '−');
          D.text(c, tanda, q[1] + 46, cy - 46,
            { size: 20, weight: 800, align: 'c', base: 'middle',
              color: muatan > 0 ? '#ef6a52' : '#5b9bf5' });
        });
        D.text(c, 'tarik-menarik elektrostatis', 300, cy + 86,
          { size: 11.5, weight: 600, color: '#ef6a52', align: 'c', base: 'middle' });
      }

      /* ---------- struktur Lewis ---------- */
      if (sim.get('lewis')) {
        const LX = 560, LY = 130, LW = 200;
        D.roundRect(c, LX, LY, LW, 160, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
        D.text(c, 'STRUKTUR LEWIS', LX + 16, LY + 18,
          { size: 10.5, weight: 700, color: P.faint, base: 'middle' });

        D.text(c, 'sebelum', LX + 16, LY + 42,
          { size: 10.5, weight: 600, color: P.faint, base: 'middle' });
        lewis(c, LX + 56, LY + 72, A.sym, vA, P.text, 17, true);
        lewis(c, LX + 142, LY + 72, B.sym, vB, P.text, 17, true);

        D.text(c, 'sesudah', LX + 16, LY + 108,
          { size: 10.5, weight: 600, color: P.faint, base: 'middle' });
        if (ion && senyawa) {
          lewis(c, LX + 50, LY + 136, A.sym, kA > 0 ? vA - Math.abs(kA) : vA + Math.abs(kA), P.text, 15);
          D.text(c, kA > 0 ? '⁺' : '⁻', LX + 68, LY + 126,
            { size: 13, weight: 700, color: kA > 0 ? '#ef6a52' : '#5b9bf5', base: 'middle' });
          lewis(c, LX + 142, LY + 136, B.sym, kB > 0 ? vB - Math.abs(kB) : vB + Math.abs(kB), P.text, 15);
          D.text(c, kB > 0 ? '⁺' : '⁻', LX + 160, LY + 126,
            { size: 13, weight: 700, color: kB > 0 ? '#ef6a52' : '#5b9bf5', base: 'middle' });
        } else {
          lewis(c, LX + 66, LY + 136, A.sym, vA, P.text, 15);
          D.line(c, LX + 84, LY + 136, LX + 112, LY + 136, P.amber, 2.4);
          lewis(c, LX + 130, LY + 136, B.sym, vB, P.text, 15);
        }
      }

      /* ---------- skala keelektronegatifan ---------- */
      if (sim.get('skala')) {
        const SX = 60, SY = 334, SW = 660;
        D.text(c, 'SELISIH KEELEKTRONEGATIFAN MENENTUKAN JENIS IKATAN', SX, SY - 14,
          { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
        const zona = [
          { lo: 0, hi: 0.4, n: 'Kovalen nonpolar', w: '#6fcf7f' },
          { lo: 0.4, hi: 1.7, n: 'Kovalen polar', w: '#5b9bf5' },
          { lo: 1.7, hi: 3.3, n: 'Ikatan ion', w: '#ef6a52' }
        ];
        zona.forEach(function (z) {
          const x1 = SX + z.lo / 3.3 * SW, x2 = SX + z.hi / 3.3 * SW;
          D.roundRect(c, x1, SY, x2 - x1 - 2, 26, 4, D.alpha(z.w, 0.25), z.w, 1.2);
          D.text(c, z.n, (x1 + x2) / 2, SY + 13,
            { size: 11, weight: 700, color: z.w, align: 'c', base: 'middle' });
        });
        for (let v = 0; v <= 3; v += 0.5) {
          const x = SX + v / 3.3 * SW;
          D.text(c, Sim.fmt(v, 1), x, SY + 38,
            { size: 9.5, weight: 500, color: P.faint, align: 'c', base: 'middle' });
        }
        if (ik.d) {
          const x = SX + Math.min(ik.d, 3.3) / 3.3 * SW;
          c.beginPath();
          c.moveTo(x, SY - 4); c.lineTo(x - 7, SY - 14); c.lineTo(x + 7, SY - 14);
          c.closePath(); c.fillStyle = P.text; c.fill();
          D.line(c, x, SY, x, SY + 26, '#ffffff', 2.2);
        }
        D.text(c, A.sym + ' (' + Sim.fmt(A.en, 2) + ')   −   ' + B.sym + ' (' + Sim.fmt(B.en, 2) +
          ')   =   ' + Sim.fmt(ik.d, 2), SX, SY + 58,
          { size: 13, weight: 650, color: P.dim, base: 'middle', mono: true });
      }

      /* ---------- kesimpulan ---------- */
      D.roundRect(c, 40, 416, W - 80, 118, 12,
        D.alpha(ik.warna, 0.1), ik.warna, 1.6);
      D.text(c, ik.jenis.toUpperCase(), 60, 442,
        { size: 18, weight: 800, color: ik.warna, base: 'middle' });
      if (senyawa) {
        D.text(c, 'Rumus senyawa: ' + Sim.formula(senyawa.rumus), 60, 468,
          { size: 15, weight: 650, color: P.text, base: 'middle' });
        D.text(c, senyawa.kation.sym + Sim.sup(senyawa.muatanK > 1 ? senyawa.muatanK + '+' : '+') +
          ' dan ' + senyawa.anion.sym + Sim.sup(senyawa.muatanA > 1 ? senyawa.muatanA + '-' : '-') +
          ' bergabung dengan perbandingan ' + senyawa.nK + ' : ' + senyawa.nA,
          60, 490, { size: 12, weight: 500, color: P.dim, base: 'middle' });
      } else {
        D.text(c, 'Pasangan ini tidak membentuk senyawa ion sederhana.', 60, 468,
          { size: 14, weight: 600, color: P.dim, base: 'middle' });
      }

      const sifat = ion
        ? 'Titik leleh tinggi · rapuh · menghantar listrik bila dilelehkan atau dilarutkan'
        : ik.jenis === 'Ikatan logam'
          ? 'Mengkilap · menghantar listrik dan panas · dapat ditempa'
          : 'Titik leleh rendah · umumnya tidak menghantar listrik';
      D.text(c, sifat, 60, 514, { size: 12, weight: 500, color: P.faint, base: 'middle' });
    },

    readoutsUpdate: function (sim) {
      const A = C.byZ[parseInt(sim.get('a'), 10)];
      const B = C.byZ[parseInt(sim.get('b'), 10)];
      const ik = jenisIkatan(A, B);
      const senyawa = rumusSenyawa(A, B);
      sim.readout('jenis', ik.jenis);
      sim.readout('rumus', senyawa ? Sim.formula(senyawa.rumus) : '—');
      sim.readout('selisih', Sim.fmt(ik.d, 2));
      sim.readout('sifat', ik.jenis === 'Ikatan ion' ? 'Titik leleh tinggi'
        : ik.jenis === 'Ikatan logam' ? 'Menghantar listrik' : 'Titik leleh rendah');
    },

    notes: `
      <p>Atom berikatan karena satu alasan: mencapai <strong>susunan elektron yang
      stabil</strong> seperti gas mulia — delapan elektron di kulit terluar
      (<strong>aturan oktet</strong>), atau dua untuk atom kecil seperti hidrogen
      (<strong>aturan duplet</strong>).</p>

      <h3>Ikatan ion</h3>
      <p>Terjadi antara <strong>logam dan nonlogam</strong>. Logam melepas elektron
      menjadi kation, nonlogam menerima elektron menjadi anion. Keduanya lalu
      <strong>tarik-menarik secara elektrostatis</strong>.</p>

      <p>Pada NaCl, natrium (2 8 1) melepas satu elektron menjadi Na⁺ (2 8), sedangkan
      klorin (2 8 7) menerima elektron itu menjadi Cl⁻ (2 8 8). Keduanya kini stabil.</p>

      <p>Sifat senyawa ion: titik leleh dan titik didih tinggi, berbentuk kristal keras
      tetapi rapuh, tidak menghantar listrik dalam wujud padat, tetapi
      <strong>menghantar bila dilelehkan atau dilarutkan</strong> karena ionnya bebas bergerak.</p>

      <h3>Ikatan kovalen</h3>
      <p>Terjadi antara <strong>sesama nonlogam</strong>. Karena keduanya sama-sama ingin
      menerima elektron, tidak ada yang mau melepas. Jalan keluarnya: elektron
      <strong>dipakai bersama</strong>.</p>

      <ul>
        <li><strong>Kovalen tunggal</strong> — satu pasang elektron bersama (H—H, H—Cl)</li>
        <li><strong>Kovalen rangkap dua</strong> — dua pasang (O=O, O=C=O)</li>
        <li><strong>Kovalen rangkap tiga</strong> — tiga pasang (N≡N)</li>
        <li><strong>Kovalen koordinasi</strong> — pasangan elektron berasal dari satu atom
            saja, misalnya pada NH₄⁺</li>
      </ul>

      <h3>Polar atau nonpolar?</h3>
      <p>Bila kedua atom sama (H₂, O₂), elektron ditarik sama kuat → <strong>kovalen
      nonpolar</strong>. Bila berbeda (HCl, H₂O), elektron tertarik lebih ke atom yang
      lebih elektronegatif → <strong>kovalen polar</strong>, dan muncul kutub muatan
      parsial δ⁺ dan δ⁻.</p>

      <h3>Memperkirakan jenis ikatan</h3>
      <table>
        <thead><tr><th>Selisih keelektronegatifan</th><th>Jenis ikatan</th></tr></thead>
        <tbody>
          <tr><td>0 – 0,4</td><td>Kovalen nonpolar</td></tr>
          <tr><td>0,4 – 1,7</td><td>Kovalen polar</td></tr>
          <tr><td>lebih dari 1,7</td><td>Ikatan ion</td></tr>
        </tbody>
      </table>

      <div class="callout" data-tone="warn">
        <strong>Batas ini tidak kaku</strong>
        Angka 1,7 hanyalah pedoman. Dalam kenyataan, peralihan antara kovalen polar dan
        ion berlangsung berangsur-angsur. HF memiliki selisih 1,78 tetapi tetap bersifat
        kovalen polar yang sangat kuat, bukan ion murni.
      </div>
    `,

    explore: [
      'Pilih <strong>Na</strong> dan <strong>Cl</strong>, lalu tekan Bentuk ikatan. Hitung elektron valensi masing-masing sebelum dan sesudah.',
      'Ganti ke <strong>H</strong> dan <strong>O</strong>. Perhatikan: elektronnya tidak berpindah, tetapi dipakai bersama. Mengapa?',
      'Coba <strong>Mg</strong> dan <strong>O</strong>. Berapa elektron yang berpindah? Bagaimana rumus senyawanya?',
      'Pilih dua unsur yang sama-sama logam, misalnya <strong>Na</strong> dan <strong>Mg</strong>. Ikatan apa yang terbentuk?'
    ],

    quiz: [
      {
        q: 'Natrium (Z = 11) berikatan dengan klorin (Z = 17). Jenis ikatan yang terbentuk adalah…',
        options: ['Kovalen nonpolar', 'Kovalen polar', 'Ikatan ion', 'Ikatan logam'],
        answer: 2,
        explain: 'Natrium adalah logam yang mudah melepas elektron, klorin adalah nonlogam yang mudah menerima. Selisih keelektronegatifannya 2,23 — jauh di atas 1,7 — sehingga terbentuk ikatan ion.'
      },
      {
        q: 'Mengapa senyawa ion tidak menghantarkan listrik dalam wujud padat, tetapi menghantar saat dilelehkan?',
        options: [
          'Karena saat padat tidak ada ion',
          'Karena ion terkunci pada kisi kristal saat padat, dan baru bebas bergerak saat meleleh',
          'Karena pelelehan mengubah ion menjadi atom',
          'Karena panas menghasilkan elektron bebas'
        ],
        answer: 1,
        explain: 'Hantaran listrik memerlukan muatan yang dapat bergerak. Dalam kristal padat, ion terkunci pada tempatnya. Saat dilelehkan atau dilarutkan, ion dapat bergerak bebas sehingga arus mengalir.'
      },
      {
        q: 'Dalam molekul HCl, elektron ikatan tertarik lebih kuat ke arah klorin. Akibatnya molekul HCl bersifat…',
        options: ['Kovalen nonpolar', 'Kovalen polar', 'Ionik', 'Netral tanpa kutub'],
        answer: 1,
        explain: 'Klorin lebih elektronegatif daripada hidrogen, sehingga elektron ikatan lebih dekat ke klorin. Terbentuk kutub δ⁻ di klorin dan δ⁺ di hidrogen — inilah kovalen polar.'
      },
      {
        q: 'Atom magnesium (2 8 2) berikatan dengan atom oksigen (2 6). Rumus senyawa yang terbentuk adalah…',
        options: ['MgO', 'Mg₂O', 'MgO₂', 'Mg₂O₃'],
        answer: 0,
        explain: 'Magnesium melepas 2 elektron menjadi Mg²⁺, oksigen menerima 2 elektron menjadi O²⁻. Karena muatannya sama besar, perbandingannya 1 : 1 sehingga rumusnya MgO.'
      }
    ]
  });
})();
