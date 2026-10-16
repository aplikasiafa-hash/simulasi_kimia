/* Titrasi Asam-Basa dan Kurva Titrasi — Fase F
   Teteskan titran dari buret, amati kurva pH terbentuk, dan tentukan
   titik ekuivalen beserta konsentrasi larutan yang dititrasi. */

(function () {
  'use strict';

  const D = Sim.Draw, P = Sim.P;
  const C = Chem;

  const W = 800, H = 600;

  const PASANGAN = [
    { id: 'kk', n: 'Asam kuat dititrasi basa kuat', analit: 'HCl', titran: 'NaOH',
      analitKuat: true, titranKuat: true, Ka: Infinity, pHEkiv: 7.0,
      indikator: ['fenolftalein', 'bromtimol', 'metil-jingga'] },
    { id: 'lk', n: 'Asam lemah dititrasi basa kuat', analit: 'CH₃COOH', titran: 'NaOH',
      analitKuat: false, titranKuat: true, Ka: 1.8e-5, pHEkiv: 8.7,
      indikator: ['fenolftalein'] },
    { id: 'kl', n: 'Basa kuat dititrasi asam kuat', analit: 'NaOH', titran: 'HCl',
      analitKuat: true, titranKuat: true, basa: true, pHEkiv: 7.0,
      indikator: ['fenolftalein', 'bromtimol', 'metil-jingga'] },
    { id: 'll', n: 'Basa lemah dititrasi asam kuat', analit: 'NH₃', titran: 'HCl',
      analitKuat: false, titranKuat: true, basa: true, Kb: 1.8e-5, pHEkiv: 5.3,
      indikator: ['metil-jingga'] }
  ];

  function pasanganAktif(sim) {
    return PASANGAN.find(function (p) { return p.id === sim.get('pasangan'); }) || PASANGAN[0];
  }

  /** pH larutan setelah volume titran tertentu ditambahkan. */
  function pHpada(sim, V) {
    const Pg = pasanganAktif(sim);
    const Ma = sim.get('Ma'), Va = sim.get('Va'), Mt = sim.get('Mt');
    const molA = Ma * Va / 1000;
    const molT = Mt * V / 1000;
    const Vtot = (Va + V) / 1000;
    if (Vtot <= 0) return 7;

    if (!Pg.basa) {
      // asam dititrasi basa
      if (Pg.analitKuat) {
        if (molT < molA) return -Math.log10(Math.max((molA - molT) / Vtot, 1e-14));
        if (Math.abs(molT - molA) < 1e-12) return 7;
        return 14 + Math.log10(Math.max((molT - molA) / Vtot, 1e-14));
      }
      // asam lemah
      if (molT <= 1e-12) return C.pHAsam(molA / Vtot, Pg.Ka, 1);
      if (molT < molA) {
        return C.pHBuffer((molA - molT) / Vtot, molT / Vtot, Pg.Ka);
      }
      if (Math.abs(molT - molA) < 1e-9) {
        // hidrolisis garam basa konjugasi
        const Kb = C.Kw / Pg.Ka;
        const Cg = molA / Vtot;
        return 14 + Math.log10(Math.max(Math.sqrt(Kb * Cg), 1e-14));
      }
      return 14 + Math.log10(Math.max((molT - molA) / Vtot, 1e-14));
    }

    // basa dititrasi asam
    if (Pg.analitKuat) {
      if (molT < molA) return 14 + Math.log10(Math.max((molA - molT) / Vtot, 1e-14));
      if (Math.abs(molT - molA) < 1e-12) return 7;
      return -Math.log10(Math.max((molT - molA) / Vtot, 1e-14));
    }
    if (molT <= 1e-12) return C.pHBasa(molA / Vtot, Pg.Kb, 1);
    if (molT < molA) {
      const pOH = C.pHBuffer((molA - molT) / Vtot, molT / Vtot, Pg.Kb);
      return 14 - pOH;
    }
    if (Math.abs(molT - molA) < 1e-9) {
      const Ka = C.Kw / Pg.Kb;
      const Cg = molA / Vtot;
      return -Math.log10(Math.max(Math.sqrt(Ka * Cg), 1e-14));
    }
    return -Math.log10(Math.max((molT - molA) / Vtot, 1e-14));
  }

  function Vekiv(sim) {
    return sim.get('Ma') * sim.get('Va') / sim.get('Mt');
  }

  function siapkan(sim) {
    sim.data.V = 0;
    sim.data.mengalir = false;
    sim.data.kurva = [];
    sim.data.tetes = [];
    rekam(sim);
  }

  function rekam(sim) {
    sim.data.kurva.push([sim.data.V, pHpada(sim, sim.data.V)]);
  }

  Sim.create({
    title: 'Titrasi Asam-Basa dan Kurva Titrasi',
    subtitle: 'Titrasi menentukan konsentrasi larutan yang tidak diketahui. Kurvanya mendatar di awal, melonjak tajam di titik ekuivalen, lalu mendatar lagi.',
    fase: 'F', jenjang: 'SMA Kelas 11',
    topik: ['Titrasi', 'Stoikiometri', 'Indikator'],
    stage: { w: W, h: H },

    controls: [
      {
        title: 'Rancangan titrasi',
        items: [
          { type: 'select', id: 'pasangan', value: 'kk', label: 'Jenis titrasi',
            options: PASANGAN.map(function (p) { return { value: p.id, label: p.n }; }) },
          { type: 'slider', id: 'Ma', value: 0.1, min: 0.02, max: 0.5, step: 0.01,
            label: 'Konsentrasi analit', unit: 'M', dec: 2 },
          { type: 'slider', id: 'Va', value: 25, min: 10, max: 50, step: 5,
            label: 'Volume analit', unit: 'mL', dec: 0 },
          { type: 'slider', id: 'Mt', value: 0.1, min: 0.02, max: 0.5, step: 0.01,
            label: 'Konsentrasi titran', unit: 'M', dec: 2 }
        ]
      },
      {
        title: 'Jalankan titrasi',
        items: [
          { type: 'buttons', label: '', items: [
            { label: '▼ Alirkan titran', primary: true, onClick: function (sim) {
              sim.data.mengalir = true;
            } },
            { label: '■ Hentikan', onClick: function (sim) { sim.data.mengalir = false; } },
            { label: '↺ Ulangi', onClick: function (sim) { siapkan(sim); } }
          ] },
          { type: 'slider', id: 'kecepatan', value: 1, min: 0.2, max: 4, step: 0.2,
            label: 'Kecepatan penetesan', unit: '×', dec: 1 }
        ]
      },
      {
        title: 'Indikator',
        items: [
          { type: 'select', id: 'indikator', value: 'fenolftalein', label: 'Pilih indikator',
            options: ['fenolftalein', 'bromtimol', 'metil-jingga', 'lakmus'].map(function (k) {
              return { value: k, label: C.INDIKATOR[k].nama }; }) },
          { type: 'toggle', id: 'trayek', value: true, label: 'Tampilkan trayek indikator' }
        ]
      }
    ],

    readouts: [
      { id: 'volume', label: 'Volume titran', tone: 'accent' },
      { id: 'ph', label: 'pH larutan' },
      { id: 'ekiv', label: 'Titik ekuivalen' },
      { id: 'hasil', label: 'Konsentrasi terhitung' }
    ],

    setup: siapkan,
    reset: siapkan,
    onChange: function (sim, id) {
      if (id !== 'indikator' && id !== 'trayek' && id !== 'kecepatan') siapkan(sim);
    },

    update: function (sim, dt) {
      const Ve = Vekiv(sim);
      if (sim.data.mengalir) {
        // melambat drastis di sekitar titik ekuivalen agar lonjakan terlihat
        const dekat = Math.abs(sim.data.V - Ve) < Ve * 0.08;
        const laju = sim.get('kecepatan') * (dekat ? 0.9 : 6);
        sim.data.V += laju * dt;
        if (sim.data.V > Ve * 2.2) { sim.data.V = Ve * 2.2; sim.data.mengalir = false; }
        rekam(sim);
        if (Math.random() < dt * 14) sim.data.tetes.push({ y: 0, v: 0 });
      }
      sim.data.tetes.forEach(function (t) { t.v += 520 * dt; t.y += t.v * dt; });
      sim.data.tetes = sim.data.tetes.filter(function (t) { return t.y < 150; });
    },

    draw: function (c, sim) {
      const Pg = pasanganAktif(sim);
      const V = sim.data.V;
      const pH = pHpada(sim, V);
      const Ve = Vekiv(sim);
      const ind = sim.get('indikator');
      const warnaL = C.warnaIndikator(ind, pH);

      /* ---------- buret ---------- */
      const BX = 110, BY = 60, BH = 190;
      const isiBuret = Sim.clamp(1 - V / (Ve * 2.4), 0, 1);
      D.roundRect(c, BX - 11, BY, 22, BH, 4, 'rgba(255,255,255,.05)', 'rgba(255,255,255,.3)', 1.6);
      D.roundRect(c, BX - 9, BY + BH - BH * isiBuret, 18, BH * isiBuret, 3,
        D.alpha('#8fd0ff', 0.6));
      // skala buret
      for (let i = 0; i <= 10; i++) {
        const y = BY + BH * i / 10;
        D.line(c, BX + 11, y, BX + (i % 5 === 0 ? 20 : 16), y, 'rgba(255,255,255,.3)', 1.1);
      }
      D.roundRect(c, BX - 5, BY + BH, 10, 18, 2, '#6b7580', 'rgba(255,255,255,.3)', 1.2);
      D.text(c, Pg.titran, BX, BY - 16,
        { size: 13, weight: 700, color: P.text, align: 'c', base: 'middle' });
      D.text(c, Sim.fmt(sim.get('Mt'), 2) + ' M', BX, BY - 34,
        { size: 11, weight: 600, color: P.faint, align: 'c', base: 'middle' });
      D.text(c, Sim.fmt(V, 2) + ' mL', BX + 30, BY + BH / 2,
        { size: 14, weight: 700, color: P.accent2, base: 'middle', mono: true });

      // tetesan
      sim.data.tetes.forEach(function (t) {
        D.circle(c, BX, BY + BH + 22 + t.y * 0.45, 3.4, D.alpha('#8fd0ff', 0.9));
      });

      /* ---------- labu erlenmeyer ---------- */
      const EX = BX, EY = BY + BH + 86, EW = 108, EH = 92;
      const isi = Sim.clamp(0.5 + V / 120, 0.4, 0.92);
      c.save();
      c.beginPath();
      c.moveTo(EX - 14, EY - 36); c.lineTo(EX + 14, EY - 36);
      c.lineTo(EX + EW / 2, EY + EH); c.lineTo(EX - EW / 2, EY + EH);
      c.closePath();
      c.clip();
      c.fillStyle = D.alpha(warnaL, 0.85);
      c.fillRect(EX - EW / 2, EY + EH - EH * isi, EW, EH * isi);
      c.restore();
      c.beginPath();
      c.moveTo(EX - 14, EY - 36); c.lineTo(EX + 14, EY - 36);
      c.lineTo(EX + EW / 2, EY + EH); c.lineTo(EX - EW / 2, EY + EH);
      c.closePath();
      c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 2.2; c.stroke();

      D.text(c, Pg.analit, EX, EY + EH + 22,
        { size: 13, weight: 700, color: P.text, align: 'c', base: 'middle' });
      D.text(c, Sim.fmt(sim.get('Va'), 0) + ' mL  ·  pH ' + Sim.fmt(pH, 2), EX, EY + EH + 40,
        { size: 11.5, weight: 600, color: P.dim, align: 'c', base: 'middle' });

      // penanda titik akhir
      const indInfo = C.INDIKATOR[ind];
      const berubah = pH >= indInfo.lo && pH <= indInfo.hi;
      if (berubah || (pH > indInfo.hi && V > 0)) {
        D.roundRect(c, EX - 62, EY + EH + 52, 124, 24, 12,
          'rgba(240,169,74,.18)', P.amber, 1.4);
        D.text(c, berubah ? 'perubahan warna!' : 'titik akhir terlewati',
          EX, EY + EH + 64,
          { size: 11.5, weight: 700, color: P.amber, align: 'c', base: 'middle' });
      }

      /* ---------- kurva titrasi ---------- */
      const g = { x: 300, y: 80, w: 460, h: 300 };
      const map = Plot.axes(c, {
        x: g.x, y: g.y, w: g.w, h: g.h,
        xmin: 0, xmax: Math.max(Ve * 2.2, 5), ymin: 0, ymax: 14,
        xlabel: 'volume titran (mL)', ylabel: 'pH',
        judul: 'Kurva titrasi', yticks: 7, xticks: 6
      });

      // trayek indikator
      if (sim.get('trayek')) {
        map.clip(c);
        c.fillStyle = D.alpha(P.amber, 0.12);
        c.fillRect(map.x, map.sy(indInfo.hi), map.w, map.sy(indInfo.lo) - map.sy(indInfo.hi));
        map.unclip(c);
        D.text(c, indInfo.nama + '  ' + Sim.fmt(indInfo.lo, 1) + '–' + Sim.fmt(indInfo.hi, 1),
          map.x + 8, map.sy((indInfo.lo + indInfo.hi) / 2),
          { size: 10.5, weight: 700, color: P.amber, base: 'middle' });
      }

      // kurva teoretis penuh (samar)
      const penuh = [];
      for (let v = 0; v <= Ve * 2.2; v += Ve * 2.2 / 300) {
        penuh.push([v, pHpada(sim, v)]);
      }
      Plot.line(c, map, penuh, { color: 'rgba(255,255,255,.18)', lw: 1.4, dash: [4, 4] });

      // kurva yang sudah dilalui
      Plot.line(c, map, sim.data.kurva, { color: P.accent, lw: 2.6 });

      // titik ekuivalen
      Plot.acuan(c, map, { x: Ve, color: P.rose, label: 'V ekuivalen' });
      Plot.titik(c, map, Ve, Pg.pHEkiv, { r: 5, color: P.rose, halo: true,
        label: 'pH ' + Sim.fmt(Pg.pHEkiv, 1) });

      // posisi sekarang
      if (V > 0) {
        Plot.titik(c, map, V, pH, { r: 5, color: '#ffffff', halo: true });
      }

      /* ---------- perhitungan ---------- */
      const HX = 300, HY = 420;
      D.roundRect(c, HX, HY, 230, 152, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'PERHITUNGAN TITRASI', HX + 16, HY + 20,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
      D.text(c, 'Ma × Va × va = Mb × Vb × vb', HX + 16, HY + 44,
        { size: 12.5, weight: 700, color: P.accent2, base: 'middle', mono: true });
      const rows = [
        ['Volume analit (Va)', Sim.fmt(sim.get('Va'), 0) + ' mL'],
        ['Konsentrasi titran', Sim.fmt(sim.get('Mt'), 2) + ' M'],
        ['Volume ekuivalen', Sim.fmt(Ve, 2) + ' mL'],
        ['Mol analit', Sim.sci(sim.get('Ma') * sim.get('Va') / 1000, 2) + ' mol']
      ];
      rows.forEach(function (r, i) {
        const y = HY + 70 + i * 20;
        D.text(c, r[0], HX + 16, y, { size: 10.5, weight: 500, color: P.faint, base: 'middle' });
        D.text(c, r[1], HX + 214, y,
          { size: 11, weight: 650, color: P.dim, align: 'r', base: 'middle', mono: true });
      });
      D.line(c, HX + 16, HY + 154 - 18, HX + 214, HY + 154 - 18, 'rgba(255,255,255,.14)', 1);
      D.text(c, 'Ma = ' + Sim.fmt(sim.get('Mt') * Ve / sim.get('Va'), 3) + ' M',
        HX + 16, HY + 146, { size: 13, weight: 700, color: P.accent2, base: 'middle', mono: true });

      /* ---------- empat tahap kurva ---------- */
      const TX = 548, TW = 212;
      D.roundRect(c, TX, HY, TW, 152, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'EMPAT TAHAP KURVA', TX + 16, HY + 20,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
      const tahap = [
        ['Awal', 'pH ditentukan analit saja'],
        ['Sebelum ekuivalen', Pg.analitKuat ? 'sisa analit menentukan pH' : 'terbentuk larutan penyangga'],
        ['Titik ekuivalen', 'mol asam = mol basa, lonjakan tajam'],
        ['Setelah ekuivalen', 'kelebihan titran menentukan pH']
      ];
      const tahapAktif = V < 0.02 ? 0 : V < Ve * 0.97 ? 1 : V < Ve * 1.03 ? 2 : 3;
      tahap.forEach(function (t, i) {
        const y = HY + 44 + i * 28;
        const aktif = i === tahapAktif;
        if (aktif) D.roundRect(c, TX + 10, y - 12, TW - 20, 26, 5, 'rgba(79,209,192,.12)');
        D.text(c, (i + 1) + '. ' + t[0], TX + 18, y - 3,
          { size: 11, weight: 700, color: aktif ? P.accent2 : P.dim, base: 'middle' });
        D.text(c, t[1], TX + 18, y + 10,
          { size: 10, weight: 500, color: P.faint, base: 'middle' });
      });

      /* ---------- indikator yang sesuai ---------- */
      const cocok = Pg.indikator.indexOf(ind) >= 0;
      D.roundRect(c, 40, 560, 240, 28, 8,
        cocok ? 'rgba(111,207,127,.14)' : 'rgba(239,106,82,.14)',
        cocok ? P.green : P.red, 1.3);
      D.text(c, cocok ? '✓ Indikator ini sesuai' : '✗ Indikator kurang sesuai',
        56, 574, { size: 11.5, weight: 700, color: cocok ? P.green : P.red, base: 'middle' });
    },

    readoutsUpdate: function (sim) {
      const V = sim.data.V;
      const Ve = Vekiv(sim);
      sim.readout('volume', Sim.fmt(V, 2) + '<span class="unit"> mL</span>');
      sim.readout('ph', Sim.fmt(pHpada(sim, V), 2));
      sim.readout('ekiv', Sim.fmt(Ve, 2) + '<span class="unit"> mL</span>');
      sim.readout('hasil', Sim.fmt(sim.get('Mt') * Ve / sim.get('Va'), 3) + '<span class="unit"> M</span>');
    },

    notes: `
      <p>Titrasi adalah cara menentukan konsentrasi larutan yang tidak diketahui
      (<strong>analit</strong>) dengan menambahkan larutan yang konsentrasinya sudah
      diketahui (<strong>titran</strong>) sedikit demi sedikit sampai tepat habis bereaksi.</p>

      <h3>Dasar perhitungan</h3>
      <span class="formula">mol H⁺ = mol OH⁻
Ma × Va × va = Mb × Vb × vb
<span class="cmt">// va dan vb adalah valensi asam dan basa</span></span>

      <h3>Dua titik yang sering tertukar</h3>
      <ul>
        <li><strong>Titik ekuivalen</strong> — titik teoretis saat mol asam tepat sama
            dengan mol basa.</li>
        <li><strong>Titik akhir titrasi</strong> — titik saat indikator berubah warna,
            yaitu yang benar-benar kita amati.</li>
      </ul>
      <p>Indikator yang tepat adalah indikator yang titik akhirnya <strong>sedekat mungkin
      dengan titik ekuivalen</strong>, sehingga kesalahan titrasi menjadi kecil.</p>

      <h3>Empat tahap kurva titrasi</h3>
      <ol>
        <li><strong>Sebelum penambahan</strong> — pH ditentukan oleh analit saja.</li>
        <li><strong>Menuju ekuivalen</strong> — pH naik perlahan. Pada asam lemah, daerah
            ini membentuk <strong>larutan penyangga</strong> sehingga kurvanya sangat landai.</li>
        <li><strong>Titik ekuivalen</strong> — pH melonjak tajam hanya dengan satu-dua tetes.</li>
        <li><strong>Setelah ekuivalen</strong> — pH ditentukan kelebihan titran, kurva
            mendatar lagi.</li>
      </ol>

      <h3>pH di titik ekuivalen tidak selalu 7</h3>
      <table>
        <thead><tr><th>Jenis titrasi</th><th>pH ekuivalen</th><th>Indikator yang cocok</th></tr></thead>
        <tbody>
          <tr><td>Asam kuat + basa kuat</td><td>7 (netral)</td><td>PP, BTB, MO</td></tr>
          <tr><td>Asam lemah + basa kuat</td><td>&gt; 7 (basa)</td><td>fenolftalein</td></tr>
          <tr><td>Basa lemah + asam kuat</td><td>&lt; 7 (asam)</td><td>metil jingga</td></tr>
        </tbody>
      </table>

      <p>Penyebabnya adalah <strong>hidrolisis garam</strong> yang terbentuk. Titrasi
      asam asetat dengan NaOH menghasilkan natrium asetat, yaitu garam dari asam lemah
      dan basa kuat, yang terhidrolisis menghasilkan larutan bersifat basa.</p>

      <h3>Mengapa fenolftalein tidak cocok untuk basa lemah?</h3>
      <p>Trayek fenolftalein adalah pH 8,3–10,0. Pada titrasi NH₃ dengan HCl, titik
      ekuivalennya berada di sekitar pH 5,3. Fenolftalein sudah berubah warna jauh
      sebelum titik ekuivalen tercapai, sehingga hasil titrasinya salah besar.</p>

      <div class="callout" data-tone="tip">
        <strong>Mengapa lonjakannya begitu tajam?</strong>
        Di dekat titik ekuivalen hampir semua asam sudah habis. Satu tetes titran
        berikutnya tidak lagi dinetralkan oleh apa pun, sehingga langsung mengubah
        konsentrasi H⁺ ribuan kali lipat.
      </div>
    `,

    explore: [
      'Jalankan titrasi <strong>asam kuat–basa kuat</strong>. Pada volume berapa kurvanya melonjak? Bandingkan dengan V ekuivalen.',
      'Ganti ke <strong>asam lemah–basa kuat</strong>. Perhatikan daerah landai di awal — itulah daerah penyangga.',
      'Pada titrasi basa lemah, pilih indikator <strong>fenolftalein</strong>. Perhatikan peringatan yang muncul. Mengapa tidak sesuai?',
      'Ubah konsentrasi titran dari 0,1 M ke 0,2 M. Bagaimana volume ekuivalennya berubah?'
    ],

    quiz: [
      {
        q: 'Sebanyak 25 mL larutan HCl dititrasi dengan NaOH 0,1 M dan memerlukan 20 mL untuk mencapai titik ekuivalen. Konsentrasi HCl adalah…',
        options: ['0,08 M', '0,10 M', '0,125 M', '0,20 M'],
        answer: 0,
        explain: 'Ma × Va = Mb × Vb → Ma × 25 = 0,1 × 20 → Ma = 2/25 = 0,08 M.'
      },
      {
        q: 'Mengapa pH titik ekuivalen titrasi asam lemah dengan basa kuat lebih besar dari 7?',
        options: [
          'Karena basa kuat berlebih',
          'Karena garam yang terbentuk terhidrolisis menghasilkan ion OH⁻',
          'Karena asam lemah tidak habis bereaksi',
          'Karena indikatornya salah'
        ],
        answer: 1,
        explain: 'Garam yang terbentuk berasal dari asam lemah dan basa kuat. Anion sisa asam lemah bereaksi dengan air (hidrolisis) menghasilkan OH⁻, sehingga larutan bersifat basa.'
      },
      {
        q: 'Perbedaan antara titik ekuivalen dan titik akhir titrasi adalah…',
        options: [
          'Keduanya sama persis',
          'Titik ekuivalen adalah titik teoretis, titik akhir adalah saat indikator berubah warna',
          'Titik akhir selalu lebih dulu tercapai',
          'Titik ekuivalen hanya ada pada asam kuat'
        ],
        answer: 1,
        explain: 'Titik ekuivalen adalah keadaan mol asam tepat sama dengan mol basa. Titik akhir adalah yang teramati lewat perubahan warna indikator. Pemilihan indikator yang tepat membuat keduanya hampir berimpit.'
      },
      {
        q: 'Pada titrasi NH₃ dengan HCl, indikator yang paling sesuai adalah…',
        options: ['Fenolftalein (8,3–10,0)', 'Metil jingga (3,1–4,4)', 'Lakmus (5,0–8,0)', 'Semua sama baiknya'],
        answer: 1,
        explain: 'Titik ekuivalen titrasi basa lemah dengan asam kuat berada di daerah asam, sekitar pH 5. Metil jingga dengan trayek 3,1–4,4 paling mendekati, sedangkan fenolftalein akan berubah jauh terlalu awal.'
      }
    ]
  });
})();
