/* Sel Volta dan Sel Elektrolisis — Fase F
   Rakit sel dari dua elektrode pilihan, baca potensial sel, lalu balikkan
   arahnya dengan elektrolisis dan hitung massa endapan lewat hukum Faraday. */

(function () {
  'use strict';

  const D = Sim.Draw, P = Sim.P;
  const C = Chem;

  const W = 800, H = 600;

  const ELEKTRODE = C.E_STANDAR.filter(function (e) { return e.logam !== 'H'; });

  function cari(sym) {
    return ELEKTRODE.find(function (e) { return e.logam === sym; }) || ELEKTRODE[0];
  }

  function selVolta(sim) {
    const A = cari(sim.get('kiri'));
    const B = cari(sim.get('kanan'));
    // yang E° lebih besar menjadi katode (tereduksi)
    const katode = A.E >= B.E ? A : B;
    const anode = A.E >= B.E ? B : A;
    const E0 = katode.E - anode.E;
    const T = sim.get('suhu') + 273;
    // persamaan Nernst dengan Q = [anion]/[kation] sederhana
    const Q = sim.get('cAnode') / Math.max(sim.get('cKatode'), 1e-6);
    const Esel = C.nernst(E0, 2, Q, T);
    return { katode: katode, anode: anode, E0: E0, Esel: Esel, spontan: E0 > 0, sama: A.logam === B.logam };
  }

  function faraday(sim) {
    const i = sim.get('arus');
    const t = sim.get('waktu') * 60;
    const n = sim.get('valensi');
    const logam = cari(sim.get('kanan'));
    const Ar = C.bySym[logam.logam] ? C.bySym[logam.logam].massa : 63.5;
    const Q = i * t;
    const mol = Q / (n * C.F);
    return { Q: Q, mol: mol, massa: mol * Ar, Ar: Ar, logam: logam };
  }

  function siapkan(sim) { sim.data.t = 0; }

  Sim.create({
    title: 'Sel Volta dan Sel Elektrolisis',
    subtitle: 'Sel volta mengubah reaksi kimia spontan menjadi listrik; sel elektrolisis melakukan kebalikannya. Keduanya memakai elektrode dan larutan yang sama.',
    fase: 'F', jenjang: 'SMA Kelas 12',
    topik: ['Elektrokimia', 'Sel Volta', 'Elektrolisis'],
    stage: { w: W, h: H },

    controls: [
      {
        title: 'Jenis sel',
        items: [
          { type: 'segment', id: 'mode', value: 'volta', label: '',
            options: [{ value: 'volta', label: 'Sel volta' }, { value: 'elektrolisis', label: 'Elektrolisis' }] }
        ]
      },
      {
        title: 'Elektrode',
        items: [
          { type: 'select', id: 'kiri', value: 'Zn', label: 'Elektrode kiri',
            options: ELEKTRODE.map(function (e) {
              return { value: e.logam, label: e.logam + '  (E° = ' + Sim.fmt(e.E, 2) + ' V)' }; }) },
          { type: 'select', id: 'kanan', value: 'Cu', label: 'Elektrode kanan',
            options: ELEKTRODE.map(function (e) {
              return { value: e.logam, label: e.logam + '  (E° = ' + Sim.fmt(e.E, 2) + ' V)' }; }) }
        ]
      },
      {
        title: 'Keadaan larutan (Nernst)',
        items: [
          { type: 'slider', id: 'cKatode', value: 1, min: 0.001, max: 2, step: 0.001,
            label: 'Konsentrasi di katode', unit: 'M', dec: 3 },
          { type: 'slider', id: 'cAnode', value: 1, min: 0.001, max: 2, step: 0.001,
            label: 'Konsentrasi di anode', unit: 'M', dec: 3 },
          { type: 'slider', id: 'suhu', value: 25, min: 0, max: 100, step: 5,
            label: 'Suhu', unit: '°C', dec: 0 }
        ]
      },
      {
        title: 'Elektrolisis (hukum Faraday)',
        items: [
          { type: 'slider', id: 'arus', value: 2, min: 0.1, max: 10, step: 0.1,
            label: 'Kuat arus', unit: 'A', dec: 1 },
          { type: 'slider', id: 'waktu', value: 30, min: 1, max: 120, step: 1,
            label: 'Waktu', unit: 'menit', dec: 0 },
          { type: 'slider', id: 'valensi', value: 2, min: 1, max: 3, step: 1,
            label: 'Perubahan bilangan oksidasi (n)', dec: 0 }
        ]
      }
    ],

    readouts: [
      { id: 'esel', label: 'Potensial sel', tone: 'accent' },
      { id: 'katode', label: 'Katode' },
      { id: 'anode', label: 'Anode' },
      { id: 'hasil', label: 'Hasil' }
    ],

    setup: siapkan,
    reset: siapkan,

    update: function (sim, dt) { sim.data.t += dt; },

    draw: function (c, sim) {
      const mode = sim.get('mode');
      const V = selVolta(sim);
      const F = faraday(sim);
      const elektrolisis = mode === 'elektrolisis';

      /* ---------- rangkaian sel ---------- */
      const BX = 70, BY = 180, BW = 150, BH = 140;
      const CX = 300;

      // dua bejana
      const kiri = cari(sim.get('kiri'));
      const kanan = cari(sim.get('kanan'));
      const kiriKatode = !elektrolisis && V.katode.logam === kiri.logam;

      [[BX, kiri, kiriKatode], [BX + 230, kanan, !kiriKatode]].forEach(function (q) {
        const x = q[0], e = q[1], isKatode = q[2];
        D.beaker(c, x, BY, BW, BH, 0.7, D.alpha(e.warna, 0.3));
        // elektrode
        D.roundRect(c, x + BW / 2 - 9, BY - 50, 18, 130, 3, e.warna, 'rgba(255,255,255,.3)', 1.4);
        D.text(c, e.logam, x + BW / 2, BY - 66,
          { size: 16, weight: 700, color: e.warna, align: 'c', base: 'middle' });

        const peran = elektrolisis
          ? (x === BX ? 'ANODE (+)' : 'KATODE (−)')
          : (isKatode ? 'KATODE (+)' : 'ANODE (−)');
        D.roundRect(c, x + BW / 2 - 50, BY + BH + 12, 100, 22, 11,
          D.alpha(peran.indexOf('KATODE') === 0 ? P.accent : P.amber, 0.18),
          peran.indexOf('KATODE') === 0 ? P.accent : P.amber, 1.3);
        D.text(c, peran, x + BW / 2, BY + BH + 23, {
          size: 11, weight: 800, align: 'c', base: 'middle',
          color: peran.indexOf('KATODE') === 0 ? P.accent : P.amber
        });

        // reaksi setengah sel
        const Zi = C.bySym[e.logam];
        const n = 2;
        const reaksi = peran.indexOf('KATODE') === 0
          ? e.logam + Sim.sup(n + '+') + ' + ' + n + 'e⁻ → ' + e.logam
          : e.logam + ' → ' + e.logam + Sim.sup(n + '+') + ' + ' + n + 'e⁻';
        D.text(c, reaksi, x + BW / 2, BY + BH + 48,
          { size: 11, weight: 650, color: P.dim, align: 'c', base: 'middle', mono: true });

        // endapan / pelarutan
        if (peran.indexOf('KATODE') === 0) {
          const tebal = Math.min(10, 2 + (sim.data.t % 8));
          D.roundRect(c, x + BW / 2 - 9 - tebal / 2, BY + 20, 18 + tebal, 56, 3,
            D.alpha(e.warna, 0.75));
        }
      });

      // jembatan garam
      c.beginPath();
      c.moveTo(BX + BW - 20, BY + 24);
      c.bezierCurveTo(BX + BW + 40, BY - 36, BX + 190, BY - 36, BX + 250, BY + 24);
      c.strokeStyle = 'rgba(255,255,255,.3)'; c.lineWidth = 16; c.lineCap = 'round'; c.stroke();
      c.strokeStyle = 'rgba(140,200,240,.3)'; c.lineWidth = 11; c.stroke();
      D.text(c, 'jembatan garam (KNO₃)', BX + 190, BY - 44,
        { size: 10.5, weight: 600, color: P.faint, align: 'c', base: 'middle' });

      // rangkaian luar
      const topY = 108;
      D.line(c, BX + BW / 2, BY - 50, BX + BW / 2, topY, 'rgba(230,236,240,.5)', 2.4);
      D.line(c, BX + 230 + BW / 2, BY - 50, BX + 230 + BW / 2, topY, 'rgba(230,236,240,.5)', 2.4);
      D.line(c, BX + BW / 2, topY, BX + 230 + BW / 2, topY, 'rgba(230,236,240,.5)', 2.4);

      // voltmeter atau sumber arus
      const MX = BX + 190;
      D.circle(c, MX, topY, 26, '#2a3036', 'rgba(255,255,255,.3)', 1.8);
      if (elektrolisis) {
        D.text(c, '⚡', MX, topY - 4, { size: 18, align: 'c', base: 'middle', color: P.amber });
        D.text(c, Sim.fmt(sim.get('arus'), 1) + ' A', MX, topY + 10,
          { size: 10, weight: 700, color: P.amber, align: 'c', base: 'middle', mono: true });
        D.text(c, 'sumber arus searah', MX, topY - 40,
          { size: 10.5, weight: 600, color: P.faint, align: 'c', base: 'middle' });
      } else {
        D.text(c, 'V', MX, topY - 5,
          { size: 15, weight: 800, color: P.accent2, align: 'c', base: 'middle' });
        D.text(c, Sim.fmt(V.Esel, 2), MX, topY + 10,
          { size: 11, weight: 700, color: P.accent2, align: 'c', base: 'middle', mono: true });
        D.text(c, 'voltmeter', MX, topY - 40,
          { size: 10.5, weight: 600, color: P.faint, align: 'c', base: 'middle' });
      }

      // aliran elektron
      if (elektrolisis || V.E0 > 0.001) {
        const arahKiriKeKanan = elektrolisis ? true : !kiriKatode;
        for (let i = 0; i < 5; i++) {
          const f = ((sim.data.t * 0.4 + i * 0.2) % 1);
          const t = arahKiriKeKanan ? f : 1 - f;
          const ex = Sim.lerp(BX + BW / 2, BX + 230 + BW / 2, t);
          if (Math.abs(ex - MX) < 28) continue;
          D.circle(c, ex, topY, 5, P.amber);
          D.text(c, 'e', ex, topY, { size: 8, weight: 800, color: '#06201d', align: 'c', base: 'middle' });
        }
        D.text(c, 'aliran elektron ' + (arahKiriKeKanan ? '→' : '←'),
          MX, topY + 44, { size: 10.5, weight: 600, color: P.amber, align: 'c', base: 'middle' });
      }

      /* ---------- panel potensial ---------- */
      const PX = 540, PW = 230;
      if (!elektrolisis) {
        D.roundRect(c, PX, 92, PW, 196, 12,
          V.spontan ? 'rgba(79,209,192,.1)' : 'rgba(239,106,82,.1)',
          V.spontan ? P.accent : P.red, 1.5);
        D.text(c, 'POTENSIAL SEL', PX + 16, 112,
          { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
        D.text(c, 'E°sel = E°katode − E°anode', PX + 16, 134,
          { size: 11, weight: 650, color: P.dim, base: 'middle', mono: true });
        D.text(c, Sim.fmt(V.katode.E, 2) + ' − (' + Sim.fmt(V.anode.E, 2) + ')',
          PX + 16, 154, { size: 12, weight: 600, color: P.dim, base: 'middle', mono: true });
        D.text(c, 'E°sel = ' + Sim.fmt(V.E0, 2) + ' V', PX + 16, 182,
          { size: 24, weight: 700, color: V.spontan ? P.accent2 : P.red, base: 'middle', mono: true });

        D.line(c, PX + 16, 200, PX + PW - 16, 200, 'rgba(255,255,255,.12)', 1);
        D.text(c, 'Persamaan Nernst', PX + 16, 216,
          { size: 10, weight: 700, color: P.faint, base: 'middle' });
        D.text(c, 'E = E° − (RT/nF) ln Q', PX + 16, 234,
          { size: 11, weight: 650, color: P.dim, base: 'middle', mono: true });
        D.text(c, 'E = ' + Sim.fmt(V.Esel, 3) + ' V', PX + 16, 258,
          { size: 16, weight: 700, color: P.accent2, base: 'middle', mono: true });
        D.text(c, V.sama ? 'Kedua elektrode sama — tidak ada beda potensial.'
          : V.spontan ? 'E° positif → reaksi berlangsung spontan.'
          : 'E° negatif → tidak spontan.',
          PX + 16, 278, { size: 10.5, weight: 600, base: 'middle',
            color: V.spontan ? P.accent : P.red });
      } else {
        D.roundRect(c, PX, 92, PW, 196, 12, 'rgba(240,169,74,.1)', P.amber, 1.5);
        D.text(c, 'HUKUM FARADAY', PX + 16, 112,
          { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
        D.text(c, 'm = (e × i × t) / 96.500', PX + 16, 134,
          { size: 11.5, weight: 650, color: P.dim, base: 'middle', mono: true });
        const rows = [
          ['Muatan Q = i × t', Sim.fmt(F.Q, 0) + ' C'],
          ['mol elektron', Sim.sci(F.Q / C.F, 3)],
          ['n (valensi)', String(sim.get('valensi'))],
          ['mol logam', Sim.sci(F.mol, 3)],
          ['Ar ' + F.logam.logam, Sim.fmt(F.Ar, 2)]
        ];
        rows.forEach(function (r, i) {
          const y = 158 + i * 18;
          D.text(c, r[0], PX + 16, y, { size: 10.5, weight: 500, color: P.faint, base: 'middle' });
          D.text(c, r[1], PX + PW - 16, y,
            { size: 10.5, weight: 650, color: P.dim, align: 'r', base: 'middle', mono: true });
        });
        D.line(c, PX + 16, 254, PX + PW - 16, 254, 'rgba(255,255,255,.12)', 1);
        D.text(c, 'massa = ' + Sim.fmt(F.massa, 4) + ' g', PX + 16, 274,
          { size: 16, weight: 700, color: P.amber, base: 'middle', mono: true });
      }

      /* ---------- deret volta ---------- */
      const DY = 364;
      D.roundRect(c, 40, DY, W - 80, 108, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'DERET VOLTA — MAKIN KE KANAN MAKIN MUDAH TEREDUKSI', 58, DY + 20,
        { size: 10, weight: 700, color: P.faint, base: 'middle' });

      const lebar = (W - 130) / ELEKTRODE.length;
      ELEKTRODE.forEach(function (e, i) {
        const x = 58 + i * lebar;
        const aktif = e.logam === kiri.logam || e.logam === kanan.logam;
        D.roundRect(c, x, DY + 34, lebar - 6, 44, 6,
          aktif ? D.alpha(e.warna, 0.22) : 'rgba(255,255,255,.04)',
          aktif ? e.warna : 'rgba(255,255,255,.1)', aktif ? 1.8 : 1);
        D.text(c, e.logam, x + (lebar - 6) / 2, DY + 50,
          { size: 13, weight: 700, color: aktif ? P.text : P.dim, align: 'c', base: 'middle' });
        D.text(c, Sim.fmt(e.E, 2), x + (lebar - 6) / 2, DY + 68,
          { size: 10, weight: 600, color: aktif ? e.warna : P.faint, align: 'c', base: 'middle', mono: true });
      });
      D.arrow(c, 58, DY + 92, W - 72, DY + 92, 'rgba(255,255,255,.22)', 1.8, 8);
      D.text(c, 'reduktor makin kuat (mudah teroksidasi)', 60, DY + 92 - 12,
        { size: 10, weight: 600, color: P.faint, base: 'middle' });
      D.text(c, 'oksidator makin kuat (mudah tereduksi)', W - 72, DY + 92 - 12,
        { size: 10, weight: 600, color: P.faint, align: 'r', base: 'middle' });

      /* ---------- perbandingan dua sel ---------- */
      const CY = 488;
      D.roundRect(c, 40, CY, W - 80, 86, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'PERBEDAAN SEL VOLTA DAN SEL ELEKTROLISIS', 58, CY + 18,
        { size: 10, weight: 700, color: P.faint, base: 'middle' });
      const kol = [
        ['', 'Sel volta', 'Sel elektrolisis'],
        ['Perubahan energi', 'kimia → listrik', 'listrik → kimia'],
        ['Reaksi', 'spontan (E° positif)', 'tidak spontan, perlu arus'],
        ['Katode', 'kutub positif (+)', 'kutub negatif (−)'],
        ['Anode', 'kutub negatif (−)', 'kutub positif (+)']
      ];
      kol.forEach(function (r, i) {
        const y = CY + 36 + i * 13;
        [0, 1, 2].forEach(function (k) {
          D.text(c, r[k], 58 + k * 250, y, {
            size: 10.5, weight: i === 0 ? 700 : 500,
            color: i === 0 ? (k === 1 ? P.accent : k === 2 ? P.amber : P.faint)
              : (k === 0 ? P.faint : P.dim),
            base: 'middle'
          });
        });
      });
      D.text(c, 'Pada keduanya, reduksi selalu di katode dan oksidasi selalu di anode.',
        58 + 500, CY + 36, { size: 10.5, weight: 600, color: P.accent2, base: 'middle' });
    },

    readoutsUpdate: function (sim) {
      const V = selVolta(sim);
      const F = faraday(sim);
      const elektrolisis = sim.get('mode') === 'elektrolisis';
      if (elektrolisis) {
        sim.readout('esel', Sim.fmt(sim.get('arus'), 1) + '<span class="unit"> A</span>');
        sim.readout('katode', cari(sim.get('kanan')).logam + ' (−)');
        sim.readout('anode', cari(sim.get('kiri')).logam + ' (+)');
        sim.readout('hasil', Sim.fmt(F.massa, 3) + '<span class="unit"> g</span>', 'warn');
      } else {
        sim.readout('esel', Sim.fmt(V.Esel, 3) + '<span class="unit"> V</span>',
          V.spontan ? 'accent' : 'danger');
        sim.readout('katode', V.katode.logam + ' (+)');
        sim.readout('anode', V.anode.logam + ' (−)');
        sim.readout('hasil', V.spontan ? 'Spontan' : V.sama ? 'Tidak ada arus' : 'Tidak spontan',
          V.spontan ? 'accent' : 'danger');
      }
    },

    notes: `
      <p>Elektrokimia mempelajari hubungan antara <strong>reaksi redoks dan energi
      listrik</strong>. Ada dua arah: reaksi menghasilkan listrik (sel volta), atau
      listrik memaksa reaksi terjadi (sel elektrolisis).</p>

      <h3>Aturan yang berlaku di keduanya</h3>
      <p>Berapa pun jenis selnya, berlaku dua hal tetap:</p>
      <ul>
        <li><strong>Katode</strong> — tempat terjadinya <strong>reduksi</strong></li>
        <li><strong>Anode</strong> — tempat terjadinya <strong>oksidasi</strong></li>
      </ul>
      <p>Yang berbeda hanyalah kutubnya. Pada sel volta katode bermuatan positif, sedangkan
      pada sel elektrolisis katode bermuatan negatif. Cara mengingat: KaRe (Katode Reduksi)
      dan AnOks (Anode Oksidasi).</p>

      <h3>Sel volta</h3>
      <p>Mengubah energi kimia menjadi listrik melalui reaksi redoks spontan.</p>
      <span class="formula">E°sel = E°katode − E°anode</span>
      <p>Logam dengan E° <strong>lebih besar</strong> bertindak sebagai katode (tereduksi),
      sedangkan yang lebih kecil menjadi anode (teroksidasi). Bila E°sel bernilai
      <strong>positif</strong>, reaksi berlangsung spontan.</p>

      <p>Penulisan notasi sel: <strong>anode | ion anode || ion katode | katode</strong>,
      misalnya Zn | Zn²⁺ || Cu²⁺ | Cu.</p>

      <p><strong>Jembatan garam</strong> diperlukan untuk menjaga kenetralan muatan kedua
      larutan. Tanpa jembatan garam, penumpukan muatan akan segera menghentikan aliran arus.</p>

      <h3>Deret volta</h3>
      <span class="formula">Li K Ca Na Mg Al Zn Fe Ni Sn Pb (H) Cu Ag Au</span>
      <p>Makin ke kiri, logam makin mudah teroksidasi (reduktor makin kuat). Makin ke
      kanan, makin mudah tereduksi. Akibat praktisnya: <strong>logam di sebelah kiri dapat
      mendesak logam di sebelah kanan</strong> dari larutannya. Besi dapat mendesak
      tembaga, tetapi tembaga tidak dapat mendesak besi.</p>

      <h3>Persamaan Nernst</h3>
      <p>Potensial sel berubah bila konsentrasi tidak berada pada keadaan standar 1 M:</p>
      <span class="formula">E = E° − (RT/nF) ln Q</span>
      <p>Memperbesar konsentrasi di katode menaikkan E, sedangkan memperbesar konsentrasi
      di anode menurunkannya.</p>

      <h3>Sel elektrolisis dan hukum Faraday</h3>
      <p>Arus listrik memaksa reaksi tidak spontan berlangsung. Massa zat yang dihasilkan
      sebanding dengan jumlah muatan yang dialirkan:</p>
      <span class="formula">m = (e × i × t) ÷ 96.500
e = Ar ÷ n   <span class="cmt">// massa ekuivalen</span></span>

      <p>Penerapannya sangat luas: penyepuhan logam (<em>electroplating</em>), pemurnian
      tembaga, dan pembuatan aluminium lewat proses Hall-Héroult.</p>

      <h3>Korosi dan pencegahannya</h3>
      <p>Perkaratan besi adalah sel volta mini yang terbentuk sendiri di permukaan logam.
      Pencegahannya memanfaatkan deret volta: besi dilapisi atau dihubungkan dengan logam
      yang <strong>lebih mudah teroksidasi</strong>, seperti seng atau magnesium. Logam
      pelindung inilah yang berkorban lebih dulu — disebut
      <strong>perlindungan katodik</strong>.</p>

      <div class="callout" data-tone="tip">
        <strong>Mengapa pipa bawah tanah dipasangi balok magnesium?</strong>
        Magnesium jauh di kiri besi dalam deret volta, sehingga magnesium teroksidasi lebih
        dulu dan pipa besi terlindungi. Balok itu disebut anode korban dan diganti berkala.
      </div>
    `,

    explore: [
      'Rakit sel <strong>Zn–Cu</strong>. Berapa E°sel-nya? Elektrode mana yang menjadi katode?',
      'Tukar posisi kedua elektrode. Apakah nilai E°sel berubah? Mengapa?',
      'Pilih <strong>Ag</strong> dan <strong>Au</strong>. Apakah selnya spontan? Hubungkan dengan deret volta.',
      'Beralih ke <strong>Elektrolisis</strong>, atur arus 5 A selama 60 menit. Berapa gram logam yang mengendap?'
    ],

    quiz: [
      {
        q: 'Diketahui E° Zn²⁺/Zn = −0,76 V dan E° Cu²⁺/Cu = +0,34 V. Potensial sel volta Zn–Cu adalah…',
        options: ['+0,42 V', '+1,10 V', '−1,10 V', '−0,42 V'],
        answer: 1,
        explain: 'Cu memiliki E° lebih besar sehingga menjadi katode. E°sel = E°katode − E°anode = 0,34 − (−0,76) = +1,10 V. Nilai positif berarti reaksi spontan.'
      },
      {
        q: 'Pada sel volta, katode merupakan kutub positif, tetapi pada sel elektrolisis katode merupakan kutub negatif. Namun pada keduanya katode selalu menjadi tempat…',
        options: ['Oksidasi', 'Reduksi', 'Pelarutan elektrode', 'Pembentukan gas oksigen'],
        answer: 1,
        explain: 'Definisi katode selalu sama: tempat terjadinya reduksi. Yang berbeda hanyalah kutubnya, karena sumber arus pada elektrolisis memaksa elektron masuk dari luar.'
      },
      {
        q: 'Arus 2 A dialirkan selama 965 detik ke larutan CuSO₄ (Ar Cu = 63,5; n = 2). Massa tembaga yang mengendap adalah…',
        options: ['0,635 g', '1,27 g', '2,54 g', '0,32 g'],
        answer: 0,
        explain: 'Q = i × t = 2 × 965 = 1.930 C. m = (Ar × i × t)/(n × 96.500) = (63,5 × 1.930)/(2 × 96.500) = 0,635 gram.'
      },
      {
        q: 'Pipa besi bawah tanah dihubungkan dengan balok magnesium untuk mencegah korosi. Prinsip yang dipakai adalah…',
        options: [
          'Magnesium melapisi besi secara fisik',
          'Magnesium lebih mudah teroksidasi sehingga berkorban lebih dulu',
          'Magnesium menghalangi oksigen mencapai besi',
          'Magnesium menetralkan air tanah'
        ],
        answer: 1,
        explain: 'Magnesium berada jauh di kiri besi dalam deret volta, sehingga potensial oksidasinya lebih besar. Magnesium teroksidasi lebih dulu dan besi terlindungi. Inilah perlindungan katodik dengan anode korban.'
      }
    ]
  });
})();
