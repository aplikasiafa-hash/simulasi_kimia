/* Bentuk Molekul (VSEPR) dan Kepolaran — Fase E
   Atur jumlah pasangan elektron ikatan dan bebas; bentuk ruang dan resultan
   momen dipol dihitung ulang seketika. */

(function () {
  'use strict';

  const D = Sim.Draw, P = Sim.P;
  const C = Chem;

  const W = 790, H = 560;

  const MOLEKUL = [
    { n: 'CH₄ — metana',      x: 4, e: 0, pusat: 'C', luar: 'H', polar: false },
    { n: 'NH₃ — amonia',      x: 3, e: 1, pusat: 'N', luar: 'H', polar: true },
    { n: 'H₂O — air',         x: 2, e: 2, pusat: 'O', luar: 'H', polar: true },
    { n: 'CO₂ — karbon dioksida', x: 2, e: 0, pusat: 'C', luar: 'O', polar: false },
    { n: 'BF₃ — boron trifluorida', x: 3, e: 0, pusat: 'B', luar: 'F', polar: false },
    { n: 'PCl₅ — fosforus pentaklorida', x: 5, e: 0, pusat: 'P', luar: 'Cl', polar: false },
    { n: 'SF₆ — belerang heksafluorida', x: 6, e: 0, pusat: 'S', luar: 'F', polar: false },
    { n: 'SO₂ — belerang dioksida', x: 2, e: 1, pusat: 'S', luar: 'O', polar: true },
    { n: 'XeF₄ — xenon tetrafluorida', x: 4, e: 2, pusat: 'Xe', luar: 'F', polar: false },
    { n: 'SF₄ — belerang tetrafluorida', x: 4, e: 1, pusat: 'S', luar: 'F', polar: true },
    { n: 'ClF₃ — klorin trifluorida', x: 3, e: 2, pusat: 'Cl', luar: 'F', polar: true }
  ];

  /** Arah pasangan elektron untuk tiap bentuk (dalam 2D, sudut derajat). */
  function arahDomain(x, e) {
    const total = x + e;
    const baku = {
      2: [180, 0],
      3: [90, 210, 330],
      4: [90, 200, 340, 270],
      5: [90, 270, 0, 130, 230],
      6: [90, 270, 0, 180, 45, 225]
    }[total];
    if (baku) return baku;
    // Susunan di luar daftar baku: sebarkan merata agar tetap tergambar.
    const n = Math.max(1, total);
    const out = [];
    for (let i = 0; i < n; i++) out.push(90 + i * 360 / n);
    return out;
  }

  function siapkan(sim) {
    sim.data.putar = 0;
  }

  Sim.create({
    title: 'Bentuk Molekul (VSEPR) dan Kepolaran',
    subtitle: 'Pasangan elektron saling tolak dan mengatur diri sejauh mungkin. Dari susunan itulah bentuk molekul — dan kepolarannya — ditentukan.',
    fase: 'E', jenjang: 'SMA Kelas 10',
    topik: ['Bentuk Molekul', 'Kepolaran'],
    stage: { w: W, h: H },

    controls: [
      {
        title: 'Domain elektron',
        items: [
          { type: 'slider', id: 'x', value: 2, min: 2, max: 6, step: 1,
            label: 'Pasangan elektron ikatan (X)', dec: 0,
            hint: 'Jumlah atom yang terikat pada atom pusat.' },
          { type: 'slider', id: 'e', value: 2, min: 0, max: 3, step: 1,
            label: 'Pasangan elektron bebas (E)', dec: 0,
            hint: 'Pasangan yang tidak dipakai berikatan. Tolakannya lebih kuat.' }
        ]
      },
      {
        title: 'Molekul contoh',
        items: [
          { type: 'select', id: 'contoh', value: 2, label: 'Muat molekul',
            options: MOLEKUL.map(function (m, i) { return { value: i, label: m.n }; }) },
          { type: 'buttons', label: '', items: [
            { label: 'Muat molekul ini', primary: true, onClick: function (sim) {
              const m = MOLEKUL[parseInt(sim.get('contoh'), 10) || 0];
              sim.set('x', m.x); sim.set('e', m.e);
            } }
          ] }
        ]
      },
      {
        title: 'Tampilan',
        items: [
          { type: 'toggle', id: 'peb', value: true, label: 'Tampilkan pasangan bebas' },
          { type: 'toggle', id: 'dipol', value: true, label: 'Tampilkan momen dipol' },
          { type: 'toggle', id: 'putar', value: false, label: 'Putar molekul' }
        ]
      }
    ],

    readouts: [
      { id: 'notasi', label: 'Notasi VSEPR', tone: 'accent' },
      { id: 'bentuk', label: 'Bentuk molekul' },
      { id: 'sudut', label: 'Sudut ikatan' },
      { id: 'polar', label: 'Kepolaran' }
    ],

    setup: siapkan,
    reset: siapkan,

    update: function (sim, dt) {
      if (sim.get('putar')) sim.data.putar += dt * 0.5;
    },

    draw: function (c, sim) {
      const x = Math.round(sim.get('x'));
      const e = Math.round(sim.get('e'));
      const total = x + e;
      const v = C.cariVSEPR(x, e);
      const contoh = MOLEKUL[parseInt(sim.get('contoh'), 10) || 0];
      const cocok = contoh.x === x && contoh.e === e;
      const pusatSym = cocok ? contoh.pusat : 'A';
      const luarSym = cocok ? contoh.luar : 'X';

      const cx = 260, cy = 258, R = 100;
      const arah = arahDomain(x, e);
      const putar = sim.data.putar * 57.3;

      /* ---------- molekul ---------- */
      D.text(c, 'BENTUK RUANG MOLEKUL', 40, 50,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });

      // ikatan
      for (let i = 0; i < x; i++) {
        const ang = (arah[i] + putar) * Math.PI / 180;
        const px = cx + Math.cos(ang) * R, py = cy - Math.sin(ang) * R;
        D.line(c, cx, cy, px, py, 'rgba(255,255,255,.35)', 5);
        D.line(c, cx, cy, px, py, 'rgba(255,255,255,.15)', 2);
      }

      // pasangan elektron bebas
      if (sim.get('peb')) {
        for (let i = x; i < total; i++) {
          const ang = (arah[i] + putar) * Math.PI / 180;
          const px = cx + Math.cos(ang) * 52, py = cy - Math.sin(ang) * 52;
          // awan berbentuk balon
          c.save();
          c.translate(px, py); c.rotate(-ang);
          c.beginPath();
          c.ellipse(10, 0, 30, 19, 0, 0, Math.PI * 2);
          c.fillStyle = D.alpha('#f0a94a', 0.2); c.fill();
          c.strokeStyle = D.alpha('#f0a94a', 0.5); c.lineWidth = 1.4; c.stroke();
          c.restore();
          D.circle(c, px + Math.cos(ang) * 6 - Math.sin(ang) * 6,
            py - Math.sin(ang) * 6 - Math.cos(ang) * 6, 3.6, P.amber);
          D.circle(c, px + Math.cos(ang) * 6 + Math.sin(ang) * 6,
            py - Math.sin(ang) * 6 + Math.cos(ang) * 6, 3.6, P.amber);
        }
      }

      // atom luar
      for (let i = 0; i < x; i++) {
        const ang = (arah[i] + putar) * Math.PI / 180;
        const px = cx + Math.cos(ang) * R, py = cy - Math.sin(ang) * R;
        const warna = C.warnaAtom(luarSym);
        D.atom(c, px, py, 20, warna, luarSym, { size: 14 });
      }

      // atom pusat
      D.atom(c, cx, cy, 28, C.warnaAtom(pusatSym), pusatSym, { size: 19 });

      // momen dipol
      if (sim.get('dipol') && cocok) {
        let sx = 0, sy = 0;
        for (let i = 0; i < x; i++) {
          const ang = (arah[i] + putar) * Math.PI / 180;
          const enP = C.bySym[pusatSym] ? C.bySym[pusatSym].en : 2.5;
          const enL = C.bySym[luarSym] ? C.bySym[luarSym].en : 2.5;
          const kuat = (enL - enP);
          if (Math.abs(kuat) < 0.1) continue;
          const px = cx + Math.cos(ang) * 60, py = cy - Math.sin(ang) * 60;
          D.arrow(c, cx, cy, px, py, D.alpha('#5b9bf5', 0.75), 2, 7);
          sx += Math.cos(ang) * kuat; sy += -Math.sin(ang) * kuat;
        }
        // pasangan bebas juga menyumbang dipol
        for (let i = x; i < total; i++) {
          const ang = (arah[i] + putar) * Math.PI / 180;
          sx += Math.cos(ang) * 0.9; sy += -Math.sin(ang) * 0.9;
        }
        const besar = Math.hypot(sx, sy);
        if (besar > 0.25) {
          const nx = sx / besar, ny = sy / besar;
          D.arrow(c, cx - nx * 70, cy - ny * 70, cx + nx * 86, cy + ny * 86, P.rose, 3.4, 11);
          D.text(c, 'resultan dipol μ ≠ 0', cx + nx * 100, cy + ny * 100,
            { size: 11.5, weight: 700, color: P.rose, align: 'c', base: 'middle' });
        } else {
          D.roundRect(c, cx - 66, cy + 122, 132, 24, 12,
            'rgba(111,207,127,.15)', P.green, 1.3);
          D.text(c, 'resultan dipol μ = 0', cx, cy + 134,
            { size: 11.5, weight: 700, color: P.green, align: 'c', base: 'middle' });
        }
      }

      /* ---------- panel keterangan ---------- */
      const RX = 440, RW = 320;
      D.roundRect(c, RX, 92, RW, 206, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'HASIL RAMALAN VSEPR', RX + 16, 112,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });

      if (v) {
        D.text(c, v.notasi, RX + 16, 142,
          { size: 26, weight: 700, color: P.accent2, base: 'middle' });
        D.text(c, v.nama, RX + 16, 174,
          { size: 18, weight: 650, color: P.text, base: 'middle' });
        const baris = [
          ['Domain elektron', String(total)],
          ['Pasangan ikatan (X)', String(x)],
          ['Pasangan bebas (E)', String(e)],
          ['Sudut ikatan', v.sudut],
          ['Contoh molekul', v.contoh]
        ];
        baris.forEach(function (b, i) {
          const y = 200 + i * 19;
          D.text(c, b[0], RX + 16, y, { size: 11.5, weight: 500, color: P.faint, base: 'middle' });
          D.text(c, b[1], RX + RW - 16, y,
            { size: 11.5, weight: 650, color: P.dim, align: 'r', base: 'middle' });
        });
      } else {
        D.text(c, 'Susunan AX' + Sim.sub(x) + (e ? 'E' + Sim.sub(e) : '') +
          ' tidak lazim ditemui.', RX + 16, 150,
          { size: 14, weight: 600, color: P.amber, base: 'middle' });
        D.text(c, 'Coba kurangi pasangan bebas atau pasangan ikatannya.',
          RX + 16, 174, { size: 12, weight: 500, color: P.dim, base: 'middle' });
      }

      /* ---------- aturan tolakan ---------- */
      D.roundRect(c, RX, 312, RW, 110, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'URUTAN KEKUATAN TOLAKAN', RX + 16, 332,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
      D.text(c, 'PEB–PEB  >  PEB–PEI  >  PEI–PEI', RX + 16, 358,
        { size: 15, weight: 700, color: P.amber, base: 'middle' });
      D.text(c, 'Pasangan elektron bebas lebih dekat ke inti sehingga', RX + 16, 382,
        { size: 11.5, weight: 500, color: P.dim, base: 'middle' });
      D.text(c, 'menolak lebih kuat dan memperkecil sudut ikatan.', RX + 16, 398,
        { size: 11.5, weight: 500, color: P.dim, base: 'middle' });

      /* ---------- perbandingan sudut ---------- */
      const CX = 40, CY = 404;
      D.roundRect(c, CX, CY, 372, 120, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'PENGARUH PASANGAN BEBAS PADA SUDUT IKATAN', CX + 16, CY + 20,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
      const banding = [
        { n: 'CH₄', x: 4, e: 0, s: '109,5°' },
        { n: 'NH₃', x: 3, e: 1, s: '107°' },
        { n: 'H₂O', x: 2, e: 2, s: '104,5°' }
      ];
      banding.forEach(function (b, i) {
        const bx = CX + 28 + i * 118;
        const aktif = b.x === x && b.e === e;
        D.roundRect(c, bx - 12, CY + 34, 106, 70, 8,
          aktif ? 'rgba(79,209,192,.14)' : 'rgba(255,255,255,.03)',
          aktif ? P.accent : 'rgba(255,255,255,.1)', aktif ? 1.8 : 1.2);
        D.text(c, b.n, bx + 41, CY + 54,
          { size: 15, weight: 700, color: aktif ? P.accent2 : P.text, align: 'c', base: 'middle' });
        D.text(c, b.s, bx + 41, CY + 76,
          { size: 17, weight: 700, color: aktif ? P.accent2 : P.dim, align: 'c', base: 'middle', mono: true });
        D.text(c, b.e + ' PEB', bx + 41, CY + 94,
          { size: 10.5, weight: 500, color: P.faint, align: 'c', base: 'middle' });
      });
      D.text(c, 'Makin banyak pasangan bebas, makin kecil sudutnya.',
        CX + 16, CY + 114, { size: 11, weight: 500, color: P.faint, base: 'middle' });
    },

    readoutsUpdate: function (sim) {
      const x = Math.round(sim.get('x'));
      const e = Math.round(sim.get('e'));
      const v = C.cariVSEPR(x, e);
      const contoh = MOLEKUL[parseInt(sim.get('contoh'), 10) || 0];
      const cocok = contoh.x === x && contoh.e === e;
      sim.readout('notasi', v ? v.notasi : 'AX' + Sim.sub(x) + (e ? 'E' + Sim.sub(e) : ''));
      sim.readout('bentuk', v ? v.nama : 'tidak lazim');
      sim.readout('sudut', v ? v.sudut : '—');
      sim.readout('polar', cocok ? (contoh.polar ? 'Polar' : 'Nonpolar') : 'pilih contoh',
        cocok ? (contoh.polar ? 'warn' : 'accent') : null);
    },

    notes: `
      <p>Teori VSEPR (<em>Valence Shell Electron Pair Repulsion</em>) berangkat dari satu
      gagasan: <strong>pasangan elektron di sekitar atom pusat saling tolak</strong>,
      sehingga mengatur diri sejauh mungkin satu sama lain. Susunan yang terbentuk itulah
      bentuk molekulnya.</p>

      <h3>Cara menentukan bentuk molekul</h3>
      <ol>
        <li>Gambar struktur Lewis molekulnya.</li>
        <li>Hitung <strong>domain elektron</strong> di sekitar atom pusat. Satu domain
            bisa berupa ikatan tunggal, rangkap, atau pasangan bebas. Ikatan rangkap
            tetap dihitung satu domain.</li>
        <li>Tentukan jumlah pasangan ikatan (X) dan pasangan bebas (E).</li>
        <li>Cocokkan dengan notasi AXₙEₘ.</li>
      </ol>

      <h3>Mengapa pasangan bebas memperkecil sudut?</h3>
      <p>Pasangan elektron bebas hanya ditarik oleh <strong>satu inti</strong>, sedangkan
      pasangan ikatan ditarik <strong>dua inti</strong>. Akibatnya awan elektron bebas
      lebih gemuk dan lebih dekat ke atom pusat, sehingga menolak lebih kuat.</p>

      <p>Perhatikan deret berikut, semuanya berdomain empat:</p>
      <ul>
        <li>CH₄ (4 ikatan, 0 bebas) → tetrahedral, sudut 109,5°</li>
        <li>NH₃ (3 ikatan, 1 bebas) → piramida segitiga, sudut 107°</li>
        <li>H₂O (2 ikatan, 2 bebas) → bentuk V, sudut 104,5°</li>
      </ul>
      <p>Susunan domainnya sama, tetapi bentuk molekulnya berbeda — karena yang kita
      sebut "bentuk molekul" hanya memperhitungkan posisi <strong>atom</strong>, bukan
      pasangan bebas.</p>

      <h3>Kepolaran molekul</h3>
      <p>Molekul bersifat polar bila memenuhi dua syarat:</p>
      <ol>
        <li>Ikatannya polar (ada selisih keelektronegatifan), <strong>dan</strong></li>
        <li>Bentuknya <strong>tidak simetris</strong>, sehingga momen dipolnya tidak saling meniadakan.</li>
      </ol>

      <p>Contoh yang sering mengecoh: CO₂ memiliki dua ikatan C=O yang sangat polar,
      tetapi bentuknya linear dan simetris. Kedua momen dipol berlawanan arah dan
      <strong>saling meniadakan</strong>, sehingga CO₂ bersifat nonpolar. Sebaliknya
      H₂O berbentuk V, sehingga dipolnya menjumlah dan air bersifat sangat polar.</p>

      <div class="callout" data-tone="tip">
        <strong>Inilah sebabnya air melarutkan garam</strong>
        Sifat polar air membuat molekulnya dapat mengelilingi dan menstabilkan ion Na⁺
        dan Cl⁻. Minyak yang nonpolar tidak bisa melakukannya — dari sinilah muncul
        kaidah "like dissolves like".
      </div>
    `,

    explore: [
      'Muat <strong>CH₄</strong>, lalu ubah pasangan bebas menjadi 1 dan 2. Amati sudutnya mengecil.',
      'Bandingkan <strong>CO₂</strong> dan <strong>H₂O</strong>. Keduanya punya dua atom luar — mengapa kepolarannya berbeda?',
      'Muat <strong>XeF₄</strong>. Ada dua pasangan bebas, tetapi molekulnya nonpolar. Mengapa?',
      'Atur X = 5, E = 0 lalu X = 4, E = 1. Bagaimana satu pasangan bebas mengubah bentuknya?'
    ],

    quiz: [
      {
        q: 'Molekul NH₃ memiliki 3 pasangan elektron ikatan dan 1 pasangan elektron bebas. Bentuk molekulnya adalah…',
        options: ['Tetrahedral', 'Segitiga datar', 'Piramida segitiga', 'Bentuk V'],
        answer: 2,
        explain: 'Empat domain elektron tersusun tetrahedral, tetapi karena satu domain berupa pasangan bebas, bentuk molekul yang teramati (hanya posisi atom) adalah piramida segitiga.'
      },
      {
        q: 'Mengapa sudut ikatan H₂O (104,5°) lebih kecil daripada CH₄ (109,5°)?',
        options: [
          'Karena oksigen lebih kecil daripada karbon',
          'Karena dua pasangan elektron bebas pada oksigen menolak lebih kuat',
          'Karena H₂O memiliki lebih sedikit atom',
          'Karena ikatan O—H lebih pendek'
        ],
        answer: 1,
        explain: 'Pasangan elektron bebas hanya ditarik satu inti sehingga awannya lebih gemuk dan menolak lebih kuat. Dua pasangan bebas pada oksigen menekan sudut H—O—H menjadi lebih sempit.'
      },
      {
        q: 'CO₂ memiliki ikatan C=O yang sangat polar, tetapi molekulnya bersifat nonpolar. Alasannya adalah…',
        options: [
          'Karbon dan oksigen punya keelektronegatifan sama',
          'Bentuknya linear dan simetris sehingga kedua momen dipol saling meniadakan',
          'CO₂ berwujud gas',
          'Ikatan rangkap selalu nonpolar'
        ],
        answer: 1,
        explain: 'Dua momen dipol C=O menunjuk ke arah berlawanan dengan besar yang sama. Resultannya nol, sehingga molekul secara keseluruhan nonpolar meski ikatannya polar.'
      },
      {
        q: 'Suatu molekul memiliki notasi AX₂E₃. Bentuk molekulnya adalah…',
        options: ['Bentuk T', 'Linear', 'Bentuk V', 'Piramida segitiga'],
        answer: 1,
        explain: 'Lima domain tersusun bipiramida segitiga. Tiga pasangan bebas menempati bidang khatulistiwa, sehingga kedua atom tersisa berada pada sumbu dan membentuk susunan linear. Contohnya XeF₂.'
      }
    ]
  });
})();
