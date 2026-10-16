/* Struktur Atom, Isotop, dan Ion — Fase E
   Susun inti dan elektron sendiri; nomor atom, nomor massa, muatan, dan
   identitas unsur dihitung ulang seketika. */

(function () {
  'use strict';

  const D = Sim.Draw, P = Sim.P;
  const C = Chem;

  const W = 790, H = 540;

  const PRASET = [
    { n: 'Hidrogen-1', p: 1, nn: 0, e: 1 },
    { n: 'Deuterium (H-2)', p: 1, nn: 1, e: 1 },
    { n: 'Helium-4', p: 2, nn: 2, e: 2 },
    { n: 'Karbon-12', p: 6, nn: 6, e: 6 },
    { n: 'Karbon-14', p: 6, nn: 8, e: 6 },
    { n: 'Oksigen-16', p: 8, nn: 8, e: 8 },
    { n: 'Ion O²⁻', p: 8, nn: 8, e: 10 },
    { n: 'Natrium-23', p: 11, nn: 12, e: 11 },
    { n: 'Ion Na⁺', p: 11, nn: 12, e: 10 },
    { n: 'Klorin-35', p: 17, nn: 18, e: 17 },
    { n: 'Klorin-37', p: 17, nn: 20, e: 17 },
    { n: 'Ion Cl⁻', p: 17, nn: 18, e: 18 },
    { n: 'Kalsium-40', p: 20, nn: 20, e: 20 },
    { n: 'Ion Ca²⁺', p: 20, nn: 20, e: 18 }
  ];

  function siapkan(sim) {
    sim.data.putar = 0;
    sim.data.inti = [];
    susunInti(sim);
  }

  /** Atur letak proton dan neutron di dalam inti secara rapat. */
  function susunInti(sim) {
    const p = Math.round(sim.get('proton'));
    const n = Math.round(sim.get('neutron'));
    const total = p + n;
    const list = [];
    for (let i = 0; i < total; i++) {
      // spiral Fermat agar nukleon tersebar merata
      const a = i * 2.39996;
      const r = 5.6 * Math.sqrt(i);
      list.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, jenis: i < p ? 'p' : 'n' });
    }
    sim.data.inti = list;
  }

  Sim.create({
    title: 'Struktur Atom, Isotop, dan Ion',
    subtitle: 'Tambah atau kurangi proton, neutron, dan elektron. Perhatikan mana yang mengubah jenis unsur, mana yang hanya mengubah massa, dan mana yang mengubah muatan.',
    fase: 'E', jenjang: 'SMA Kelas 10',
    topik: ['Struktur Atom', 'Isotop'],
    stage: { w: W, h: H },

    controls: [
      {
        title: 'Susunan partikel',
        items: [
          { type: 'slider', id: 'proton', value: 6, min: 1, max: 30, step: 1,
            label: 'Proton (p⁺)', dec: 0,
            hint: 'Jumlah proton menentukan jenis unsur. Ubah ini, unsurnya berganti.' },
          { type: 'slider', id: 'neutron', value: 6, min: 0, max: 44, step: 1,
            label: 'Neutron (n⁰)', dec: 0,
            hint: 'Mengubah neutron menghasilkan isotop — unsur sama, massa berbeda.' },
          { type: 'slider', id: 'elektron', value: 6, min: 0, max: 36, step: 1,
            label: 'Elektron (e⁻)', dec: 0,
            hint: 'Mengubah elektron menghasilkan ion — muatan berubah.' }
        ]
      },
      {
        title: 'Contoh siap pakai',
        items: [
          { type: 'select', id: 'praset', value: 3, label: 'Muat contoh',
            options: PRASET.map(function (q, i) { return { value: i, label: q.n }; }) },
          { type: 'buttons', label: '', items: [
            { label: 'Muat contoh ini', primary: true, onClick: function (sim) {
              const q = PRASET[parseInt(sim.get('praset'), 10) || 0];
              sim.set('proton', q.p); sim.set('neutron', q.nn); sim.set('elektron', q.e);
              susunInti(sim);
            } },
            { label: 'Jadikan netral', onClick: function (sim) {
              sim.set('elektron', Math.round(sim.get('proton')));
            } }
          ] }
        ]
      },
      {
        title: 'Tampilan',
        items: [
          { type: 'toggle', id: 'kulit', value: true, label: 'Tampilkan kulit elektron' },
          { type: 'toggle', id: 'putar', value: true, label: 'Animasi elektron' },
          { type: 'toggle', id: 'lambang', value: true, label: 'Tampilkan notasi unsur' }
        ]
      }
    ],

    readouts: [
      { id: 'unsur', label: 'Unsur', tone: 'accent' },
      { id: 'z', label: 'Nomor atom (Z)' },
      { id: 'a', label: 'Nomor massa (A)' },
      { id: 'muatan', label: 'Muatan' }
    ],

    setup: siapkan,
    reset: siapkan,
    onChange: function (sim, id) {
      if (id === 'proton' || id === 'neutron') susunInti(sim);
    },

    update: function (sim, dt) {
      if (sim.get('putar')) sim.data.putar += dt * 0.55;
    },

    draw: function (c, sim) {
      const p = Math.round(sim.get('proton'));
      const n = Math.round(sim.get('neutron'));
      const e = Math.round(sim.get('elektron'));
      const A = p + n;
      const muatan = p - e;
      const unsur = C.byZ[p];
      const putar = sim.data.putar;

      const cx = 250, cy = 272;

      /* ---------- kulit elektron ---------- */
      const kulitIsi = [];
      let sisa = e;
      const kapasitas = [2, 8, 18, 32];
      // pengisian sederhana gaya Bohr, dibatasi 8 untuk kulit ke-3 dan seterusnya
      const batas = [2, 8, 8, 18, 18];
      for (let k = 0; k < 5 && sisa > 0; k++) {
        const isi = Math.min(sisa, batas[k]);
        kulitIsi.push(isi);
        sisa -= isi;
      }

      if (sim.get('kulit')) {
        kulitIsi.forEach(function (jml, k) {
          const r = 62 + k * 34;
          c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2);
          c.strokeStyle = 'rgba(91,155,245,.22)'; c.lineWidth = 1.2; c.stroke();
          D.text(c, 'KLMNO'[k], cx + r + 9, cy - 8,
            { size: 10, weight: 700, color: P.faint, base: 'middle' });
          D.text(c, String(jml), cx + r + 9, cy + 6,
            { size: 10.5, weight: 600, color: '#5b9bf5', base: 'middle' });
          for (let i = 0; i < jml; i++) {
            const a = i / jml * Math.PI * 2 + putar * (1.2 - k * 0.2);
            D.circle(c, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 5.5,
              '#5b9bf5', 'rgba(0,0,0,.3)', 1);
          }
        });
      }

      /* ---------- inti ---------- */
      const jariInti = 7 + Math.sqrt(A) * 5.4;
      D.circle(c, cx, cy, jariInti + 7, D.alpha('#ef6a52', 0.08));
      sim.data.inti.forEach(function (q, i) {
        const wob = Math.sin(putar * 2.4 + i) * 0.9;
        D.circle(c, cx + q.x + wob, cy + q.y + Math.cos(putar * 2 + i) * 0.9, 5.4,
          q.jenis === 'p' ? '#ef6a52' : '#8793a0', 'rgba(0,0,0,.25)', 0.8);
      });

      /* ---------- notasi unsur ---------- */
      if (sim.get('lambang') && unsur) {
        const nx = 452, ny = 150;
        D.text(c, String(A), nx, ny - 14,
          { size: 15, weight: 600, color: P.dim, align: 'r', base: 'middle', mono: true });
        D.text(c, String(p), nx, ny + 12,
          { size: 15, weight: 600, color: P.dim, align: 'r', base: 'middle', mono: true });
        D.text(c, unsur.sym, nx + 8, ny,
          { size: 42, weight: 700, color: P.accent2, base: 'middle' });
        if (muatan !== 0) {
          const tanda = (Math.abs(muatan) > 1 ? Math.abs(muatan) : '') + (muatan > 0 ? '+' : '−');
          D.text(c, tanda, nx + 14 + D.measure(c, unsur.sym, { size: 42, weight: 700 }), ny - 14,
            { size: 20, weight: 700, color: muatan > 0 ? '#ef6a52' : '#5b9bf5', base: 'middle' });
        }
        D.text(c, unsur.nama, nx + 8, ny + 36,
          { size: 15, weight: 600, color: P.text, base: 'middle' });
        D.text(c, C.KATEGORI_NAMA[unsur.kategori], nx + 8, ny + 56,
          { size: 11.5, weight: 500, color: C.KATEGORI_WARNA[unsur.kategori], base: 'middle' });
      }

      /* ---------- hitungan partikel ---------- */
      const HX = 452, HY = 226, HW = 306;
      D.roundRect(c, HX, HY, HW, 118, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'HITUNGAN PARTIKEL', HX + 16, HY + 18,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });

      [['Proton', p, '#ef6a52', 'menentukan jenis unsur'],
       ['Neutron', n, '#8793a0', 'menentukan isotop'],
       ['Elektron', e, '#5b9bf5', 'menentukan muatan dan sifat kimia']].forEach(function (b, i) {
        const y = HY + 42 + i * 26;
        D.circle(c, HX + 26, y, 6, b[2]);
        D.text(c, b[0], HX + 40, y, { size: 12.5, weight: 600, color: P.text, base: 'middle' });
        D.text(c, String(b[1]), HX + 118, y,
          { size: 14, weight: 700, color: b[2], align: 'r', base: 'middle', mono: true });
        D.text(c, b[3], HX + 132, y, { size: 10.5, weight: 500, color: P.faint, base: 'middle' });
      });

      /* ---------- status: isotop / ion ---------- */
      const SX = 452, SY = 360;
      const netral = muatan === 0;
      const unsurNetralMassa = unsur ? Math.round(unsur.massa) : 0;
      const isotopLazim = unsur && Math.abs(A - unsurNetralMassa) <= 1;

      D.roundRect(c, SX, SY, HW, 70, 12,
        netral ? 'rgba(111,207,127,.1)' : 'rgba(240,169,74,.1)',
        netral ? P.green : P.amber, 1.4);
      D.text(c, netral ? 'ATOM NETRAL' : (muatan > 0 ? 'KATION (ion positif)' : 'ANION (ion negatif)'),
        SX + 16, SY + 20, { size: 13.5, weight: 700, color: netral ? P.green : P.amber, base: 'middle' });
      D.text(c, netral
        ? 'Jumlah proton sama dengan jumlah elektron.'
        : (muatan > 0 ? 'Melepas ' + Math.abs(muatan) + ' elektron dari keadaan netral.'
                      : 'Menerima ' + Math.abs(muatan) + ' elektron dari keadaan netral.'),
        SX + 16, SY + 42, { size: 11.5, weight: 500, color: P.dim, base: 'middle' });
      D.text(c, isotopLazim ? 'Susunan inti mendekati isotop yang paling melimpah di alam.'
        : 'Isotop ini menyimpang jauh dari massa rata-rata unsurnya.',
        SX + 16, SY + 58, { size: 10.5, weight: 500, color: P.faint, base: 'middle' });

      /* ---------- isotop sejenis ---------- */
      D.roundRect(c, 40, 440, 380, 82, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'ISOTOP: UNSUR SAMA, NEUTRON BERBEDA', 58, 460,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
      for (let d = -2; d <= 2; d++) {
        const nn = n + d;
        if (nn < 0) continue;
        const x = 70 + (d + 2) * 70;
        const aktif = d === 0;
        D.roundRect(c, x - 28, 474, 56, 36, 7,
          aktif ? 'rgba(79,209,192,.16)' : 'rgba(255,255,255,.04)',
          aktif ? P.accent : 'rgba(255,255,255,.1)', aktif ? 1.8 : 1.2);
        D.text(c, (unsur ? unsur.sym : '?') + '-' + (p + nn), x, 486,
          { size: 12, weight: 700, color: aktif ? P.accent2 : P.dim, align: 'c', base: 'middle' });
        D.text(c, nn + ' n', x, 501,
          { size: 10, weight: 500, color: P.faint, align: 'c', base: 'middle' });
      }

      /* ---------- keterangan sisi kiri ---------- */
      D.text(c, 'MODEL ATOM BOHR', 58, 118,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
      D.text(c, unsur ? unsur.nama : 'Unsur tidak dikenal', 58, 144,
        { size: 20, weight: 700, color: P.text, base: 'middle' });
      Plot.legenda(c, 58, 170, [
        { label: 'proton', warna: '#ef6a52' },
        { label: 'neutron', warna: '#8793a0' },
        { label: 'elektron', warna: '#5b9bf5' }
      ]);

      if (!unsur) {
        D.text(c, 'Belum ada unsur dengan ' + p + ' proton.', cx, cy + 150,
          { size: 13, weight: 600, color: P.amber, align: 'c', base: 'middle' });
      }
    },

    readoutsUpdate: function (sim) {
      const p = Math.round(sim.get('proton'));
      const n = Math.round(sim.get('neutron'));
      const e = Math.round(sim.get('elektron'));
      const unsur = C.byZ[p];
      const muatan = p - e;
      sim.readout('unsur', unsur ? unsur.sym + ' — ' + unsur.nama : '—');
      sim.readout('z', p);
      sim.readout('a', p + n);
      sim.readout('muatan', muatan === 0 ? 'netral' : (muatan > 0 ? '+' + muatan : String(muatan)),
        muatan === 0 ? null : 'warn');
    },

    notes: `
      <p>Atom tersusun dari tiga partikel dasar. Masing-masing punya peran yang
      sangat berbeda, dan memahami perbedaan itu adalah kunci seluruh bab ini.</p>

      <table>
        <thead><tr><th>Partikel</th><th>Muatan</th><th>Massa (sma)</th><th>Letak</th></tr></thead>
        <tbody>
          <tr><td>Proton</td><td>+1</td><td>1</td><td>inti</td></tr>
          <tr><td>Neutron</td><td>0</td><td>1</td><td>inti</td></tr>
          <tr><td>Elektron</td><td>−1</td><td>1/1836</td><td>kulit</td></tr>
        </tbody>
      </table>

      <h3>Nomor atom dan nomor massa</h3>
      <span class="formula">Z = jumlah proton          <span class="cmt">// nomor atom</span>
A = jumlah proton + neutron   <span class="cmt">// nomor massa</span>
jumlah neutron = A − Z</span>

      <p>Notasinya ditulis <strong>ᴬ<sub>Z</sub>X</strong>, misalnya ³⁵₁₇Cl berarti klorin
      dengan 17 proton dan 18 neutron.</p>

      <h3>Tiga perubahan, tiga akibat berbeda</h3>
      <ul>
        <li><strong>Ubah proton</strong> → unsurnya berganti. Karbon dengan 7 proton
            bukan lagi karbon, melainkan nitrogen.</li>
        <li><strong>Ubah neutron</strong> → terbentuk <strong>isotop</strong>. Unsurnya
            tetap sama, hanya massanya berbeda. Sifat kimianya hampir tidak berubah.</li>
        <li><strong>Ubah elektron</strong> → terbentuk <strong>ion</strong>. Unsurnya
            tetap sama, tetapi muatan dan sifat kimianya berubah.</li>
      </ul>

      <h3>Isotop dan massa atom relatif</h3>
      <p>Massa atom klorin di tabel periodik tertulis 35,45 — bukan bilangan bulat.
      Hal ini karena klorin di alam adalah campuran isotop: sekitar 75% Cl-35 dan
      25% Cl-37. Massa yang tercantum adalah <strong>rata-rata tertimbang</strong>
      menurut kelimpahannya.</p>

      <span class="formula">Ar = (%₁ × A₁ + %₂ × A₂) ÷ 100</span>

      <h3>Mengapa ion terbentuk?</h3>
      <p>Atom cenderung mencapai susunan elektron yang stabil seperti gas mulia.
      Logam cenderung <strong>melepas</strong> elektron membentuk kation (Na → Na⁺),
      sedangkan nonlogam cenderung <strong>menerima</strong> elektron membentuk anion
      (Cl → Cl⁻). Perhatikan bahwa Na⁺ dan Cl⁻ sama-sama punya 10 dan 18 elektron —
      persis seperti neon dan argon.</p>

      <div class="callout" data-tone="tip">
        <strong>Isotop punya kegunaan nyata</strong>
        Karbon-14 dipakai untuk penanggalan fosil, iodin-131 untuk mengobati kelenjar
        tiroid, dan kobalt-60 untuk terapi kanker. Semuanya memanfaatkan sifat inti,
        bukan sifat kimia.
      </div>
    `,

    explore: [
      'Mulai dari Karbon-12. Tambah satu proton. Unsurnya menjadi apa? Lalu kembalikan.',
      'Dari Karbon-12, tambah dua neutron menjadi Karbon-14. Apakah unsurnya berubah? Apa yang berubah?',
      'Muat <strong>Natrium-23</strong>, lalu kurangi satu elektron. Bandingkan susunan kulitnya dengan neon (10 elektron).',
      'Muat <strong>Ion Cl⁻</strong>. Mengapa klorin cenderung menerima satu elektron, bukan melepas?'
    ],

    quiz: [
      {
        q: 'Suatu atom memiliki 17 proton, 20 neutron, dan 17 elektron. Notasi yang tepat adalah…',
        options: ['³⁷₁₇Cl', '³⁵₁₇Cl', '¹⁷₃₇Cl', '²⁰₁₇Cl'],
        answer: 0,
        explain: 'Nomor atom Z = jumlah proton = 17. Nomor massa A = proton + neutron = 17 + 20 = 37. Unsur dengan Z = 17 adalah klorin.'
      },
      {
        q: 'Dua atom disebut isotop apabila memiliki…',
        options: [
          'Nomor massa sama, nomor atom berbeda',
          'Nomor atom sama, jumlah neutron berbeda',
          'Jumlah elektron sama, jumlah proton berbeda',
          'Massa dan muatan yang sama'
        ],
        answer: 1,
        explain: 'Isotop adalah atom dari unsur yang sama (jumlah proton sama) tetapi jumlah neutronnya berbeda, sehingga nomor massanya berbeda.'
      },
      {
        q: 'Ion Ca²⁺ terbentuk dari atom kalsium (Z = 20). Berapa jumlah elektron ion tersebut?',
        options: ['22', '20', '18', '16'],
        answer: 2,
        explain: 'Muatan +2 berarti atom melepaskan 2 elektron. Dari 20 elektron menjadi 18 elektron, sama seperti susunan elektron argon yang stabil.'
      },
      {
        q: 'Massa atom relatif klorin adalah 35,45 sma, bukan bilangan bulat. Hal ini karena…',
        options: [
          'Pengukurannya tidak teliti',
          'Klorin di alam merupakan campuran isotop dengan kelimpahan berbeda',
          'Elektron juga memiliki massa yang diperhitungkan',
          'Klorin selalu berbentuk molekul Cl₂'
        ],
        answer: 1,
        explain: 'Massa atom relatif adalah rata-rata tertimbang dari seluruh isotop menurut kelimpahannya di alam. Klorin terdiri dari sekitar 75% Cl-35 dan 25% Cl-37.'
      }
    ]
  });
})();
