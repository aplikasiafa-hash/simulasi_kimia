/* Skala pH dan Kekuatan Asam-Basa — Fase D
   Uji dua puluh larutan dengan pH meter, lakmus, dan indikator universal.
   Skala pH ditampilkan sebagai garis bilangan dengan hubungan ke [H⁺]. */

(function () {
  'use strict';

  const D = Sim.Draw, P = Sim.P;
  const C = Chem;

  const LARUTAN = [
    { n: 'Asam lambung',      pH: 1.5, w: '#e8e0d0', k: 'Asam kuat' },
    { n: 'Air aki',           pH: 0.8, w: '#eceef0', k: 'Asam sangat kuat' },
    { n: 'Air jeruk lemon',   pH: 2.3, w: '#f0e860', k: 'Asam lemah pekat' },
    { n: 'Cuka dapur',        pH: 2.9, w: '#f0e8c8', k: 'Asam lemah' },
    { n: 'Minuman bersoda',   pH: 3.4, w: '#5a3a28', k: 'Asam lemah' },
    { n: 'Jus tomat',         pH: 4.2, w: '#e05030', k: 'Asam lemah' },
    { n: 'Air kopi',          pH: 5.0, w: '#5a3a24', k: 'Asam lemah' },
    { n: 'Air hujan normal',  pH: 5.6, w: '#dfe8ee', k: 'Sedikit asam' },
    { n: 'Air hujan asam',    pH: 4.0, w: '#d8e0e4', k: 'Asam (pencemaran)' },
    { n: 'Susu sapi',         pH: 6.6, w: '#f4f0e8', k: 'Hampir netral' },
    { n: 'Air murni',         pH: 7.0, w: '#dfe8ee', k: 'Netral' },
    { n: 'Air liur',          pH: 7.2, w: '#eef2f4', k: 'Hampir netral' },
    { n: 'Darah manusia',     pH: 7.4, w: '#b02828', k: 'Sedikit basa' },
    { n: 'Air laut',          pH: 8.1, w: '#2f7fa8', k: 'Sedikit basa' },
    { n: 'Pasta gigi',        pH: 8.6, w: '#f0f4f0', k: 'Basa lemah' },
    { n: 'Larutan soda kue',  pH: 9.0, w: '#f4f4ee', k: 'Basa lemah' },
    { n: 'Air sabun',         pH: 10.0, w: '#e0eef0', k: 'Basa lemah' },
    { n: 'Obat maag',         pH: 10.4, w: '#f4f4ec', k: 'Basa lemah' },
    { n: 'Air kapur',         pH: 12.4, w: '#f0f0ea', k: 'Basa kuat' },
    { n: 'Pembersih saluran', pH: 13.5, w: '#dcecf4', k: 'Basa sangat kuat' }
  ];

  const W = 790, H = 540;

  function larutanAktif(sim) { return LARUTAN[parseInt(sim.get('larutan'), 10) || 0]; }

  function siapkan(sim) {
    sim.data.celup = 0;
    sim.data.turun = false;
    sim.data.dicatat = {};
  }

  Sim.create({
    title: 'Skala pH dan Kekuatan Asam-Basa',
    subtitle: 'Skala pH berjalan dari 0 sampai 14. Setiap turun satu angka berarti keasaman menjadi sepuluh kali lipat — bukan sekadar sedikit lebih asam.',
    fase: 'D', jenjang: 'SMP Kelas 7–9',
    topik: ['Asam Basa', 'pH'],
    stage: { w: W, h: H },

    controls: [
      {
        title: 'Larutan yang diuji',
        items: [
          { type: 'select', id: 'larutan', value: 10, label: 'Pilih larutan',
            options: LARUTAN.map(function (l, i) { return { value: i, label: l.n }; }) },
          { type: 'buttons', label: '', items: [
            { label: '↓ Celupkan alat ukur', primary: true, onClick: function (sim) {
              sim.data.turun = true;
              sim.data.dicatat[larutanAktif(sim).n] = true;
            } },
            { label: '↑ Angkat & bilas', onClick: function (sim) {
              sim.data.turun = false;
            } }
          ] }
        ]
      },
      {
        title: 'Alat ukur',
        items: [
          { type: 'segment', id: 'alat', value: 'meter', label: '',
            options: [
              { value: 'meter', label: 'pH meter' },
              { value: 'universal', label: 'Indikator universal' },
              { value: 'lakmus', label: 'Lakmus' }
            ] }
        ]
      },
      {
        title: 'Tampilan',
        items: [
          { type: 'toggle', id: 'ion', value: true, label: 'Tampilkan konsentrasi ion',
            hint: 'Hubungan antara pH, ion H⁺, dan ion OH⁻.' },
          { type: 'toggle', id: 'semua', value: true, label: 'Tandai semua larutan di skala' },
          { type: 'buttons', label: '', items: [
            { label: 'Hapus catatan', onClick: function (sim) { sim.data.dicatat = {}; } }
          ] }
        ]
      }
    ],

    readouts: [
      { id: 'ph', label: 'Nilai pH', tone: 'accent' },
      { id: 'sifat', label: 'Sifat' },
      { id: 'h', label: '[H⁺] mol/L' },
      { id: 'oh', label: '[OH⁻] mol/L' }
    ],

    setup: siapkan,
    reset: siapkan,
    onChange: function (sim, id) { if (id === 'larutan') sim.data.turun = false; },

    update: function (sim, dt) {
      const target = sim.data.turun ? 1 : 0;
      sim.data.celup += (target - sim.data.celup) * Math.min(1, dt * 5);
    },

    draw: function (c, sim) {
      const l = larutanAktif(sim);
      const alat = sim.get('alat');
      const terbaca = sim.data.celup > 0.75;
      const pH = l.pH;
      const sifat = pH < 6.5 ? 'Asam' : pH > 7.5 ? 'Basa' : 'Netral';
      const warnaSifat = pH < 6.5 ? '#ef6a52' : pH > 7.5 ? '#5b9bf5' : '#6fcf7f';

      /* ---------- gelas + alat ukur ---------- */
      const GX = 70, GY = 180, GW = 120, GH = 130;
      D.beaker(c, GX, GY, GW, GH, 0.7,
        D.alpha(alat === 'universal' && terbaca ? C.warnaPH(pH) : l.w, 0.88));
      D.text(c, l.n, GX + GW / 2, GY + GH + 28,
        { size: 14, weight: 700, color: P.text, align: 'c', base: 'middle' });
      D.text(c, l.k, GX + GW / 2, GY + GH + 46,
        { size: 11, weight: 500, color: P.faint, align: 'c', base: 'middle' });

      const turun = sim.data.celup;
      const ujungY = GY - 60 + turun * 110;

      if (alat === 'meter') {
        // batang elektrode
        D.roundRect(c, GX + GW / 2 - 6, ujungY - 92, 12, 96, 3, '#4a5057', 'rgba(255,255,255,.3)', 1.3);
        D.circle(c, GX + GW / 2, ujungY + 6, 7, '#8d939a', 'rgba(255,255,255,.3)', 1.2);
        // layar
        D.roundRect(c, GX + GW / 2 - 52, ujungY - 146, 104, 50, 7, '#2a3036', 'rgba(255,255,255,.26)', 1.5);
        D.roundRect(c, GX + GW / 2 - 42, ujungY - 138, 84, 32, 4, '#0e1418');
        D.text(c, terbaca ? 'pH ' + Sim.fmt(pH, 1) : 'pH --.-',
          GX + GW / 2, ujungY - 122,
          { size: 17, weight: 700, color: terbaca ? P.accent2 : P.faint, align: 'c', base: 'middle', mono: true });

      } else if (alat === 'lakmus') {
        // dua kertas lakmus
        const warnaMerah = pH > 8 ? '#3a6fd0' : '#e0442b';
        const warnaBiru = pH < 5 ? '#e0442b' : '#3a6fd0';
        [[-18, warnaMerah, 'lakmus merah'], [18, warnaBiru, 'lakmus biru']].forEach(function (m) {
          const x = GX + GW / 2 + m[0];
          const asli = m[2] === 'lakmus merah' ? '#e0442b' : '#3a6fd0';
          D.roundRect(c, x - 9, ujungY - 76, 18, 86, 2,
            terbaca ? m[1] : asli, 'rgba(255,255,255,.3)', 1.1);
          if (terbaca) {
            D.roundRect(c, x - 9, ujungY - 26, 18, 36, 2, m[1]);
          }
        });
        D.text(c, 'merah', GX + GW / 2 - 18, ujungY - 88,
          { size: 9.5, weight: 600, color: '#e0442b', align: 'c', base: 'middle' });
        D.text(c, 'biru', GX + GW / 2 + 18, ujungY - 88,
          { size: 9.5, weight: 600, color: '#3a6fd0', align: 'c', base: 'middle' });

      } else {
        // kertas indikator universal
        D.roundRect(c, GX + GW / 2 - 11, ujungY - 80, 22, 92, 3,
          '#f0ead8', 'rgba(255,255,255,.3)', 1.2);
        if (terbaca) {
          D.roundRect(c, GX + GW / 2 - 11, ujungY - 30, 22, 42, 3, C.warnaPH(pH));
        }
        D.text(c, 'kertas universal', GX + GW / 2, ujungY - 92,
          { size: 10, weight: 600, color: P.dim, align: 'c', base: 'middle' });
      }

      if (!terbaca) {
        D.text(c, 'tekan ↓ Celupkan alat ukur', GX + GW / 2, GY + GH + 74,
          { size: 11.5, weight: 500, color: P.faint, align: 'c', base: 'middle' });
      }

      /* ---------- skala pH besar ---------- */
      const SX = 250, SY = 92, SW = 500, SH = 48;
      D.text(c, 'SKALA pH', SX, SY - 18,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
      for (let i = 0; i < SW; i++) {
        c.fillStyle = C.warnaPH(i / SW * 14);
        c.fillRect(SX + i, SY, 1.6, SH);
      }
      D.roundRect(c, SX, SY, SW, SH, 6, null, 'rgba(255,255,255,.22)', 1.4);
      for (let p = 0; p <= 14; p++) {
        const x = SX + p / 14 * SW;
        D.line(c, x, SY + SH, x, SY + SH + 5, 'rgba(255,255,255,.35)', 1.2);
        if (p % 2 === 0) {
          D.text(c, String(p), x, SY + SH + 16,
            { size: 11, weight: 600, color: P.dim, align: 'c', base: 'middle' });
        }
      }
      D.text(c, '← makin ASAM', SX + 4, SY - 18,
        { size: 10.5, weight: 700, color: '#ef6a52', base: 'middle' });
      D.text(c, 'makin BASA →', SX + SW - 4, SY - 18,
        { size: 10.5, weight: 700, color: '#5b9bf5', align: 'r', base: 'middle' });
      D.text(c, 'NETRAL', SX + SW / 2, SY - 18,
        { size: 10.5, weight: 700, color: '#6fcf7f', align: 'c', base: 'middle' });

      // penanda semua larutan yang pernah diukur
      if (sim.get('semua')) {
        LARUTAN.forEach(function (ll) {
          if (!sim.data.dicatat[ll.n]) return;
          const x = SX + ll.pH / 14 * SW;
          D.circle(c, x, SY + SH + 28, 3.4, 'rgba(255,255,255,.5)');
        });
      }

      // penanda larutan aktif
      if (terbaca) {
        const x = SX + pH / 14 * SW;
        c.beginPath();
        c.moveTo(x, SY - 4); c.lineTo(x - 8, SY - 15); c.lineTo(x + 8, SY - 15);
        c.closePath(); c.fillStyle = P.text; c.fill();
        D.line(c, x, SY, x, SY + SH, '#ffffff', 2.4);
        D.roundRect(c, x - 30, SY + SH + 34, 60, 22, 11, D.alpha(warnaSifat, 0.25), warnaSifat, 1.4);
        D.text(c, Sim.fmt(pH, 1), x, SY + SH + 45,
          { size: 13, weight: 800, color: warnaSifat, align: 'c', base: 'middle' });
      }

      /* ---------- hubungan pH dengan ion ---------- */
      if (sim.get('ion')) {
        const IX = 250, IY = 192, IW = 500;
        D.roundRect(c, IX, IY, IW, 124, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
        D.text(c, 'APA ARTI ANGKA pH?', IX + 16, IY + 18,
          { size: 10.5, weight: 700, color: P.faint, base: 'middle' });

        const H = Math.pow(10, -pH);
        const OH = C.Kw / H;

        // batang perbandingan ion
        const fH = Sim.clamp((14 - pH) / 14, 0, 1);
        D.text(c, 'ion H⁺ (pembawa sifat asam)', IX + 16, IY + 42,
          { size: 11.5, weight: 600, color: '#ef6a52', base: 'middle' });
        D.roundRect(c, IX + 16, IY + 52, 300, 14, 7, 'rgba(255,255,255,.07)');
        D.roundRect(c, IX + 16, IY + 52, 300 * fH, 14, 7, '#ef6a52');
        D.text(c, terbaca ? Sim.sci(H) + ' mol/L' : '—', IX + 326, IY + 59,
          { size: 12, weight: 700, color: '#ef6a52', base: 'middle', mono: true });

        D.text(c, 'ion OH⁻ (pembawa sifat basa)', IX + 16, IY + 82,
          { size: 11.5, weight: 600, color: '#5b9bf5', base: 'middle' });
        D.roundRect(c, IX + 16, IY + 92, 300, 14, 7, 'rgba(255,255,255,.07)');
        D.roundRect(c, IX + 16, IY + 92, 300 * (1 - fH), 14, 7, '#5b9bf5');
        D.text(c, terbaca ? Sim.sci(OH) + ' mol/L' : '—', IX + 326, IY + 99,
          { size: 12, weight: 700, color: '#5b9bf5', base: 'middle', mono: true });
      }

      /* ---------- perbandingan kekuatan ---------- */
      const KX = 250, KY = 334, KW = 500;
      D.roundRect(c, KX, KY, KW, 96, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
      D.text(c, 'SETIAP SATU ANGKA = SEPULUH KALI LIPAT', KX + 16, KY + 18,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });

      const acuan = 7;
      const beda = acuan - pH;
      const lipat = Math.pow(10, Math.abs(beda));
      if (terbaca) {
        const arah = beda > 0 ? 'lebih asam' : beda < 0 ? 'lebih basa' : 'sama';
        D.text(c, beda === 0 ? 'Larutan ini netral, sama seperti air murni.'
          : 'Larutan ini ' + Sim.sci(lipat, 0) + '× ' + arah + ' daripada air murni (pH 7).',
          KX + 16, KY + 44, { size: 14.5, weight: 650, color: P.accent2, base: 'middle' });
      } else {
        D.text(c, 'Celupkan alat ukur untuk melihat perbandingannya.',
          KX + 16, KY + 44, { size: 13.5, weight: 500, color: P.faint, base: 'middle' });
      }

      // tangga 10×
      for (let i = 0; i < 8; i++) {
        const x = KX + 20 + i * 58;
        const tinggi = 6 + i * 4;
        D.roundRect(c, x, KY + 82 - tinggi, 44, tinggi, 2,
          D.alpha(C.warnaPH(7 - i), 0.75));
        D.text(c, i === 0 ? 'pH 7' : 'pH ' + (7 - i), x + 22, KY + 90,
          { size: 9.5, weight: 600, color: P.faint, align: 'c', base: 'middle' });
      }

      /* ---------- jumlah larutan diuji ---------- */
      D.text(c, 'Larutan sudah diuji: ' + Object.keys(sim.data.dicatat).length + ' dari ' + LARUTAN.length,
        70, 470, { size: 12, weight: 600, color: P.dim, base: 'middle' });
    },

    readoutsUpdate: function (sim) {
      const l = larutanAktif(sim);
      const terbaca = sim.data.celup > 0.75;
      const pH = l.pH;
      sim.readout('ph', terbaca ? Sim.fmt(pH, 1) : '—');
      const sifat = pH < 6.5 ? 'Asam' : pH > 7.5 ? 'Basa' : 'Netral';
      sim.readout('sifat', terbaca ? sifat : '—',
        terbaca ? (sifat === 'Asam' ? 'danger' : sifat === 'Basa' ? 'accent' : null) : null);
      sim.readout('h', terbaca ? Sim.sci(Math.pow(10, -pH)) : '—');
      sim.readout('oh', terbaca ? Sim.sci(C.Kw / Math.pow(10, -pH)) : '—');
    },

    notes: `
      <p>Di Fase C kita hanya membedakan asam, basa, dan netral. Skala pH membuat
      perbandingan itu menjadi <strong>angka yang bisa diukur</strong>.</p>

      <h3>Membaca skala pH</h3>
      <ul>
        <li><strong>pH &lt; 7</strong> → asam. Makin kecil angkanya, makin kuat asamnya.</li>
        <li><strong>pH = 7</strong> → netral.</li>
        <li><strong>pH &gt; 7</strong> → basa. Makin besar angkanya, makin kuat basanya.</li>
      </ul>

      <h3>Ini bukan skala biasa</h3>
      <p>Skala pH bersifat <strong>logaritmik</strong>. Turun satu angka berarti
      keasaman naik <strong>sepuluh kali lipat</strong>, bukan sedikit demi sedikit.</p>
      <ul>
        <li>pH 4 adalah 10× lebih asam daripada pH 5</li>
        <li>pH 3 adalah 100× lebih asam daripada pH 5</li>
        <li>pH 2 adalah 1.000× lebih asam daripada pH 5</li>
      </ul>
      <p>Karena itu air hujan asam dengan pH 4 jauh lebih merusak daripada air hujan
      normal dengan pH 5,6 — selisihnya tampak kecil, padahal sekitar 40 kali lipat.</p>

      <h3>Apa yang diukur pH?</h3>
      <p>pH mengukur banyaknya <strong>ion H⁺</strong> dalam larutan. Makin banyak ion H⁺,
      makin asam dan makin kecil pH-nya. Ion H⁺ dan ion OH⁻ selalu berlawanan: bila yang
      satu banyak, yang lain pasti sedikit.</p>

      <span class="formula">pH = −log [H⁺]   <span class="cmt">// dipelajari lebih dalam di Fase F</span></span>

      <h3>Memilih alat ukur</h3>
      <table>
        <thead><tr><th>Alat</th><th>Yang diperoleh</th><th>Ketelitian</th></tr></thead>
        <tbody>
          <tr><td>Kertas lakmus</td><td>Asam atau basa saja</td><td>kasar</td></tr>
          <tr><td>Indikator universal</td><td>Perkiraan pH ±1</td><td>sedang</td></tr>
          <tr><td>pH meter</td><td>Angka pH sampai satu desimal</td><td>tinggi</td></tr>
        </tbody>
      </table>

      <div class="callout" data-tone="tip">
        <strong>pH darah sangat terjaga</strong>
        pH darah manusia dipertahankan antara 7,35 dan 7,45. Pergeseran sedikit saja
        sudah berbahaya. Tubuh memakai sistem penyangga untuk menjaganya — topik yang
        akan dipelajari di Fase F.
      </div>
    `,

    explore: [
      'Ukur <strong>Air murni</strong>, lalu <strong>Air lemon</strong>. Berapa kali lipat perbedaan keasamannya?',
      'Bandingkan <strong>Air hujan normal</strong> (pH 5,6) dan <strong>Air hujan asam</strong> (pH 4,0). Mengapa selisih 1,6 itu besar?',
      'Ganti alat ke <strong>Lakmus</strong>, lalu uji <strong>Susu sapi</strong> (pH 6,6) dan <strong>Air liur</strong> (pH 7,2). Dapatkah lakmus membedakannya?',
      'Ukur seluruh dua puluh larutan, lalu perhatikan sebarannya pada skala. Lebih banyak yang asam atau basa?'
    ],

    quiz: [
      {
        q: 'Larutan A memiliki pH 3 dan larutan B memiliki pH 5. Berapa kali lebih asam larutan A?',
        options: ['2 kali', '10 kali', '100 kali', '1.000 kali'],
        answer: 2,
        explain: 'Selisih pH adalah 2, dan setiap satu angka berarti sepuluh kali lipat. Jadi 10 × 10 = 100 kali lebih asam.'
      },
      {
        q: 'Suatu larutan memiliki pH 11. Sifat larutan tersebut adalah…',
        options: ['Asam kuat', 'Asam lemah', 'Netral', 'Basa kuat'],
        answer: 3,
        explain: 'pH di atas 7 menunjukkan sifat basa. Angka 11 sudah cukup jauh dari netral, sehingga tergolong basa yang kuat.'
      },
      {
        q: 'Kertas lakmus merah dan biru dicelupkan ke suatu larutan. Keduanya tidak berubah warna. Larutan itu bersifat…',
        options: ['Asam', 'Basa', 'Netral', 'Tidak dapat ditentukan'],
        answer: 2,
        explain: 'Asam mengubah lakmus biru menjadi merah; basa mengubah lakmus merah menjadi biru. Bila keduanya tetap, larutan bersifat netral.'
      },
      {
        q: 'Mengapa pH meter lebih dipilih daripada kertas lakmus untuk penelitian?',
        options: [
          'Karena harganya lebih murah',
          'Karena memberi angka pH yang teliti, bukan sekadar asam atau basa',
          'Karena lebih mudah dibawa',
          'Karena tidak perlu dicelupkan'
        ],
        answer: 1,
        explain: 'Lakmus hanya membedakan asam dan basa. pH meter memberikan nilai pH sampai satu desimal, sehingga perbedaan kecil antarlarutan tetap terdeteksi.'
      }
    ]
  });
})();
