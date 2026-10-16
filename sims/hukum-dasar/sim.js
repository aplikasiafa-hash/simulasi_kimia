/* Hukum-Hukum Dasar Kimia — Fase E
   Empat percobaan virtual: Lavoisier, Proust, Dalton, dan Gay-Lussac.
   Tiap percobaan dapat diulang dengan angka berbeda dan ditabulasikan. */

(function () {
  'use strict';

  const D = Sim.Draw, P = Sim.P;
  const C = Chem;

  const W = 790, H = 560;

  const HUKUM = {
    lavoisier: {
      nama: 'Hukum Kekekalan Massa',
      tokoh: 'Antoine Lavoisier, 1789',
      bunyi: 'Massa zat sebelum dan sesudah reaksi selalu sama, asalkan reaksi berlangsung dalam sistem tertutup.',
      rumus: 'massa pereaksi = massa hasil reaksi'
    },
    proust: {
      nama: 'Hukum Perbandingan Tetap',
      tokoh: 'Joseph Proust, 1799',
      bunyi: 'Perbandingan massa unsur penyusun suatu senyawa selalu tetap, dari mana pun senyawa itu berasal.',
      rumus: 'massa A : massa B = tetap'
    },
    dalton: {
      nama: 'Hukum Perbandingan Berganda',
      tokoh: 'John Dalton, 1803',
      bunyi: 'Bila dua unsur membentuk lebih dari satu senyawa, massa salah satu unsur yang bersenyawa dengan massa tetap unsur lain berbanding sebagai bilangan bulat sederhana.',
      rumus: 'massa O pada CO : CO₂ = 1 : 2'
    },
    gaylussac: {
      nama: 'Hukum Perbandingan Volume',
      tokoh: 'Joseph Gay-Lussac, 1808',
      bunyi: 'Pada suhu dan tekanan sama, volume gas yang bereaksi dan hasil reaksi berbanding sebagai bilangan bulat sederhana.',
      rumus: 'V₁ : V₂ = koefisien₁ : koefisien₂'
    }
  };

  /* --- percobaan Proust: pembentukan air dari H dan O --- */
  function hitungProust(mH, mO) {
    // H2O: 2 g H bereaksi dengan 16 g O → perbandingan 1 : 8
    const butuhO = mH * 8;
    const butuhH = mO / 8;
    let pakaiH, pakaiO, sisaH = 0, sisaO = 0, pembatas;
    if (butuhO <= mO) {
      pakaiH = mH; pakaiO = butuhO; sisaO = mO - butuhO; pembatas = 'H₂';
    } else {
      pakaiO = mO; pakaiH = butuhH; sisaH = mH - butuhH; pembatas = 'O₂';
    }
    return { pakaiH: pakaiH, pakaiO: pakaiO, air: pakaiH + pakaiO, sisaH: sisaH, sisaO: sisaO, pembatas: pembatas };
  }

  const SENYAWA_DALTON = [
    { n: 'CO',  mC: 12, mO: 16,  rasio: 1 },
    { n: 'CO₂', mC: 12, mO: 32,  rasio: 2 }
  ];

  const REAKSI_GL = [
    { n: 'N₂ + 3H₂ → 2NH₃', v: [1, 3, 2], label: ['N₂', 'H₂', 'NH₃'] },
    { n: '2H₂ + O₂ → 2H₂O', v: [2, 1, 2], label: ['H₂', 'O₂', 'H₂O'] },
    { n: 'N₂ + O₂ → 2NO',   v: [1, 1, 2], label: ['N₂', 'O₂', 'NO'] }
  ];

  function siapkan(sim) {
    sim.data.catatan = [];
    sim.data.a = 0;
    sim.data.jalan = false;
  }

  function catat(sim) {
    const h = sim.get('hukum');
    if (h === 'proust') {
      const mH = sim.get('mH'), mO = sim.get('mO');
      const r = hitungProust(mH, mO);
      sim.data.catatan.push({
        kiri: Sim.fmt(mH, 1) + ' g H₂ + ' + Sim.fmt(mO, 1) + ' g O₂',
        hasil: Sim.fmt(r.air, 1) + ' g H₂O',
        rasio: Sim.fmt(r.pakaiH, 2) + ' : ' + Sim.fmt(r.pakaiO, 2),
        sederhana: '1 : 8'
      });
    } else if (h === 'gaylussac') {
      const idx = parseInt(sim.get('reaksiGL'), 10) || 0;
      const rg = REAKSI_GL[idx];
      const v = sim.get('volume');
      sim.data.catatan.push({
        kiri: Sim.fmt(v * rg.v[0], 1) + ' L ' + rg.label[0] + ' + ' + Sim.fmt(v * rg.v[1], 1) + ' L ' + rg.label[1],
        hasil: Sim.fmt(v * rg.v[2], 1) + ' L ' + rg.label[2],
        rasio: (v * rg.v[0]) + ' : ' + (v * rg.v[1]) + ' : ' + (v * rg.v[2]),
        sederhana: rg.v.join(' : ')
      });
    }
    if (sim.data.catatan.length > 6) sim.data.catatan.shift();
  }

  Sim.create({
    title: 'Hukum-Hukum Dasar Kimia',
    subtitle: 'Empat hukum yang menjadi fondasi seluruh perhitungan kimia. Ulangi percobaannya dengan angka berbeda — perbandingannya selalu kembali ke bilangan yang sama.',
    fase: 'E', jenjang: 'SMA Kelas 10',
    topik: ['Hukum Dasar', 'Stoikiometri'],
    stage: { w: W, h: H },

    controls: [
      {
        title: 'Hukum yang diuji',
        items: [
          { type: 'select', id: 'hukum', value: 'proust', label: 'Pilih hukum',
            options: Object.keys(HUKUM).map(function (k) {
              return { value: k, label: HUKUM[k].nama }; }) }
        ]
      },
      {
        title: 'Pengaturan percobaan',
        items: [
          { type: 'slider', id: 'mH', value: 4, min: 0.5, max: 12, step: 0.5,
            label: 'Massa H₂ (Proust)', unit: 'g', dec: 1 },
          { type: 'slider', id: 'mO', value: 32, min: 4, max: 96, step: 2,
            label: 'Massa O₂ (Proust)', unit: 'g', dec: 0 },
          { type: 'select', id: 'reaksiGL', value: 0, label: 'Reaksi gas (Gay-Lussac)',
            options: REAKSI_GL.map(function (r, i) { return { value: i, label: r.n }; }) },
          { type: 'slider', id: 'volume', value: 2, min: 1, max: 6, step: 1,
            label: 'Faktor volume (Gay-Lussac)', unit: '×', dec: 0 }
        ]
      },
      {
        title: 'Jalankan',
        items: [
          { type: 'buttons', label: '', items: [
            { label: '▶ Reaksikan', primary: true, onClick: function (sim) {
              sim.data.jalan = true; sim.data.a = 0; catat(sim);
            } },
            { label: 'Hapus tabel', onClick: function (sim) { sim.data.catatan = []; } }
          ] }
        ]
      }
    ],

    readouts: [
      { id: 'hasil', label: 'Hasil reaksi', tone: 'accent' },
      { id: 'rasio', label: 'Perbandingan' },
      { id: 'pembatas', label: 'Pereaksi pembatas' },
      { id: 'sisa', label: 'Sisa' }
    ],

    setup: siapkan,
    reset: siapkan,
    onChange: function (sim, id) { if (id === 'hukum') { sim.data.a = 0; sim.data.catatan = []; } },

    update: function (sim, dt) {
      if (sim.data.jalan) {
        sim.data.a += dt * 0.7;
        if (sim.data.a >= 1) { sim.data.a = 1; sim.data.jalan = false; }
      }
    },

    draw: function (c, sim) {
      const h = sim.get('hukum');
      const H_ = HUKUM[h];
      const a = sim.data.a;

      /* ---------- kepala hukum ---------- */
      D.text(c, H_.tokoh.toUpperCase(), 40, 44,
        { size: 10.5, weight: 700, color: P.faint, base: 'middle' });
      D.text(c, H_.nama, 40, 70, { size: 23, weight: 700, color: P.accent2, base: 'middle' });

      // bunyi hukum, dipenggal
      const kata = H_.bunyi.split(' ');
      let baris = [''];
      kata.forEach(function (w) {
        const coba = baris[baris.length - 1] ? baris[baris.length - 1] + ' ' + w : w;
        if (D.measure(c, coba, { size: 13 }) > W - 90) baris.push(w);
        else baris[baris.length - 1] = coba;
      });
      baris.forEach(function (b, i) {
        D.text(c, b, 40, 96 + i * 18, { size: 13, weight: 500, color: P.dim, base: 'middle' });
      });
      const yMulai = 96 + baris.length * 18 + 14;

      /* ================================================== LAVOISIER ==== */
      if (h === 'lavoisier') {
        const bx = 90, by = yMulai + 20;
        D.text(c, 'Sistem tertutup: tidak ada zat yang masuk atau keluar', bx, by - 10,
          { size: 11.5, weight: 600, color: P.faint, base: 'middle' });

        [['SEBELUM', 0], ['SESUDAH', 1]].forEach(function (q, i) {
          const x = bx + i * 340;
          D.roundRect(c, x, by + 10, 280, 150, 12,
            'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
          D.text(c, q[0], x + 16, by + 32,
            { size: 10.5, weight: 700, color: P.faint, base: 'middle' });

          // partikel: sama jumlah, susunan berbeda
          for (let k = 0; k < 12; k++) {
            const warna = k % 2 === 0 ? '#e0533d' : '#5b9bf5';
            let px, py;
            if (i === 0) {
              px = x + 40 + (k % 4) * 52; py = by + 70 + Math.floor(k / 4) * 34;
            } else {
              // berpasangan
              const pas = Math.floor(k / 2);
              px = x + 56 + (pas % 3) * 76 + (k % 2) * 20;
              py = by + 76 + Math.floor(pas / 3) * 46;
              if (k % 2 === 1) {
                D.line(c, px - 20, py, px, py, 'rgba(255,255,255,.3)', 3);
              }
            }
            D.circle(c, px, py, 9, warna, 'rgba(255,255,255,.26)', 1);
          }
          D.text(c, '12 atom · 58,5 g', x + 16, by + 140,
            { size: 13, weight: 700, color: i === 0 ? P.blue : P.amber, base: 'middle' });
        });
        D.arrow(c, bx + 292, by + 85, bx + 332, by + 85, P.accent, 2.6, 10);

        D.roundRect(c, bx, by + 178, 620, 56, 10, 'rgba(111,207,127,.1)', P.green, 1.4);
        D.text(c, 'Jumlah dan jenis atom tidak berubah — hanya susunannya.',
          bx + 18, by + 200, { size: 14, weight: 650, color: P.green, base: 'middle' });
        D.text(c, 'Itulah sebabnya persamaan reaksi harus disetarakan.',
          bx + 18, by + 220, { size: 12, weight: 500, color: P.dim, base: 'middle' });

      /* ===================================================== PROUST ==== */
      } else if (h === 'proust') {
        const mH = sim.get('mH'), mO = sim.get('mO');
        const r = hitungProust(mH, mO);
        const bx = 46, by = yMulai + 10;

        // tiga tabung: H2, O2, H2O
        const tabung = [
          { n: 'H₂', m: mH, pakai: r.pakaiH, sisa: r.sisaH, w: '#f0f2f4', maks: 12 },
          { n: 'O₂', m: mO, pakai: r.pakaiO, sisa: r.sisaO, w: '#e0533d', maks: 96 },
          { n: 'H₂O', m: r.air, pakai: r.air, sisa: 0, w: '#4a9fd0', maks: 108 }
        ];
        tabung.forEach(function (t, i) {
          const x = bx + i * 150;
          const hasil = i === 2;
          const tinggi = 130;
          const isi = hasil ? (t.m / t.maks) * a : (t.m / t.maks);
          D.tube(c, x, by, 58, tinggi, Sim.clamp(isi, 0, 1), D.alpha(t.w, 0.8));
          // bagian yang bereaksi
          if (!hasil && t.m > 0) {
            const fPakai = t.pakai / t.maks;
            D.line(c, x - 6, by + tinggi - tinggi * fPakai, x + 64, by + tinggi - tinggi * fPakai,
              P.amber, 1.6, [4, 3]);
          }
          D.text(c, t.n, x + 29, by - 16,
            { size: 15, weight: 700, color: P.text, align: 'c', base: 'middle' });
          D.text(c, Sim.fmt(hasil ? t.m * a : t.m, 1) + ' g', x + 29, by + tinggi + 18,
            { size: 13, weight: 700, color: t.w === '#f0f2f4' ? P.dim : t.w, align: 'c', base: 'middle', mono: true });
          if (!hasil && t.sisa > 0.01 && a > 0.5) {
            D.text(c, 'sisa ' + Sim.fmt(t.sisa, 1) + ' g', x + 29, by + tinggi + 36,
              { size: 10.5, weight: 600, color: P.amber, align: 'c', base: 'middle' });
          }
          if (i < 2) D.text(c, i === 0 ? '+' : '→', x + 104, by + tinggi / 2,
            { size: 22, weight: 700, color: P.faint, align: 'c', base: 'middle' });
        });

        // panel perbandingan
        const px = bx + 470;
        D.roundRect(c, px, by - 20, 272, 180, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
        D.text(c, 'PERBANDINGAN MASSA YANG BEREAKSI', px + 16, by,
          { size: 10, weight: 700, color: P.faint, base: 'middle' });
        D.text(c, Sim.fmt(r.pakaiH, 2) + ' g H  :  ' + Sim.fmt(r.pakaiO, 2) + ' g O',
          px + 16, by + 28, { size: 15, weight: 650, color: P.text, base: 'middle', mono: true });
        D.text(c, 'disederhanakan menjadi', px + 16, by + 52,
          { size: 11, weight: 500, color: P.faint, base: 'middle' });
        D.text(c, '1 : 8', px + 16, by + 80,
          { size: 30, weight: 700, color: P.accent2, base: 'middle', mono: true });
        D.text(c, 'Berapa pun jumlah awalnya, perbandingan', px + 16, by + 112,
          { size: 11.5, weight: 500, color: P.dim, base: 'middle' });
        D.text(c, 'massa H : O dalam air selalu 1 : 8.', px + 16, by + 128,
          { size: 11.5, weight: 500, color: P.dim, base: 'middle' });
        D.text(c, 'Pereaksi pembatas: ' + r.pembatas, px + 16, by + 150,
          { size: 12.5, weight: 700, color: P.amber, base: 'middle' });

      /* ===================================================== DALTON ==== */
      } else if (h === 'dalton') {
        const bx = 46, by = yMulai + 14;
        SENYAWA_DALTON.forEach(function (s, i) {
          const x = bx + i * 360;
          D.roundRect(c, x, by, 330, 130, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
          D.text(c, s.n, x + 16, by + 24, { size: 20, weight: 700, color: P.accent2, base: 'middle' });

          // gambar molekul
          const mx = x + 230, my = by + 62;
          D.atom(c, mx, my, 20, C.warnaAtom('C'), 'C', { size: 14 });
          for (let k = 0; k < (i === 0 ? 1 : 2); k++) {
            const ox = mx + (k === 0 ? -46 : 46);
            D.line(c, mx, my, ox, my, 'rgba(255,255,255,.3)', 4);
            D.atom(c, ox, my, 17, C.warnaAtom('O'), 'O', { size: 12 });
          }

          D.text(c, 'massa C tetap', x + 16, by + 54,
            { size: 11, weight: 500, color: P.faint, base: 'middle' });
          D.text(c, Sim.fmt(s.mC, 0) + ' g', x + 16, by + 72,
            { size: 16, weight: 700, color: P.dim, base: 'middle', mono: true });
          D.text(c, 'massa O', x + 110, by + 54,
            { size: 11, weight: 500, color: P.faint, base: 'middle' });
          D.text(c, Sim.fmt(s.mO, 0) + ' g', x + 110, by + 72,
            { size: 16, weight: 700, color: '#e0533d', base: 'middle', mono: true });
          D.text(c, 'perbandingan ke senyawa lain: ' + s.rasio, x + 16, by + 106,
            { size: 11.5, weight: 600, color: P.amber, base: 'middle' });
        });

        D.roundRect(c, bx, by + 152, 690, 76, 12, 'rgba(79,209,192,.1)', P.accent, 1.5);
        D.text(c, 'Untuk 12 g karbon yang sama, massa oksigen berbanding 16 : 32',
          bx + 18, by + 178, { size: 15, weight: 650, color: P.accent2, base: 'middle' });
        D.text(c, 'Disederhanakan: 1 : 2 — bilangan bulat sederhana, persis seperti ramalan Dalton.',
          bx + 18, by + 202, { size: 12.5, weight: 500, color: P.dim, base: 'middle' });
        D.text(c, 'Inilah bukti kuat bahwa materi tersusun dari satuan diskret, yaitu atom.',
          bx + 18, by + 220, { size: 12, weight: 500, color: P.faint, base: 'middle' });

      /* ================================================= GAY-LUSSAC ==== */
      } else {
        const idx = parseInt(sim.get('reaksiGL'), 10) || 0;
        const rg = REAKSI_GL[idx];
        const v = sim.get('volume');
        const bx = 60, by = yMulai + 20;

        D.text(c, rg.n, bx, by - 8, { size: 19, weight: 700, color: P.accent2, base: 'middle' });

        const maks = Math.max.apply(null, rg.v) * v;
        rg.v.forEach(function (koef, i) {
          const x = bx + i * 220;
          const vol = koef * v;
          const tinggi = 150;
          const isi = i === 2 ? (vol / maks) * a : (vol / maks);
          // silinder gas
          D.roundRect(c, x, by + 20 + tinggi - tinggi * isi, 110, tinggi * isi, 5,
            D.alpha(['#5b9bf5', '#f0a94a', '#4fd1c0'][i], 0.55));
          D.roundRect(c, x, by + 20, 110, tinggi, 5, null, 'rgba(255,255,255,.3)', 1.8);
          // partikel gas
          for (let k = 0; k < Math.round(vol * 2 * (i === 2 ? a : 1)); k++) {
            D.circle(c, x + 12 + (k * 37) % 86,
              by + 20 + tinggi - 10 - (k * 23) % Math.max(10, tinggi * isi - 10),
              4, ['#5b9bf5', '#f0a94a', '#4fd1c0'][i]);
          }
          D.text(c, rg.label[i], x + 55, by + 6,
            { size: 15, weight: 700, color: P.text, align: 'c', base: 'middle' });
          D.text(c, Sim.fmt(i === 2 ? vol * a : vol, 0) + ' L', x + 55, by + 190,
            { size: 16, weight: 700, color: ['#5b9bf5', '#f0a94a', '#4fd1c0'][i],
              align: 'c', base: 'middle', mono: true });
          D.text(c, 'koefisien ' + koef, x + 55, by + 210,
            { size: 10.5, weight: 500, color: P.faint, align: 'c', base: 'middle' });
          if (i < 2) D.text(c, i === 0 ? '+' : '→', x + 165, by + 95,
            { size: 24, weight: 700, color: P.faint, align: 'c', base: 'middle' });
        });

        D.roundRect(c, bx, by + 230, 670, 56, 10, 'rgba(79,209,192,.1)', P.accent, 1.4);
        D.text(c, 'Perbandingan volume ' + (v * rg.v[0]) + ' : ' + (v * rg.v[1]) + ' : ' + (v * rg.v[2]) +
          '  =  ' + rg.v.join(' : ') + '  (persis sama dengan koefisien reaksinya)',
          bx + 18, by + 252, { size: 14, weight: 650, color: P.accent2, base: 'middle' });
        D.text(c, 'Berlaku hanya untuk gas, pada suhu dan tekanan yang sama.',
          bx + 18, by + 272, { size: 12, weight: 500, color: P.dim, base: 'middle' });
      }

      /* ---------- tabel catatan ---------- */
      if ((h === 'proust' || h === 'gaylussac') && sim.data.catatan.length) {
        const ty = H - 128;
        D.roundRect(c, 40, ty, W - 80, 116, 12, 'rgba(255,255,255,.04)', 'rgba(255,255,255,.12)', 1.3);
        D.text(c, 'CATATAN PERCOBAAN — PERHATIKAN KOLOM TERAKHIR', 58, ty + 18,
          { size: 10, weight: 700, color: P.faint, base: 'middle' });
        ['Pereaksi', 'Hasil', 'Perbandingan', 'Disederhanakan'].forEach(function (hh, i) {
          D.text(c, hh, 58 + i * 190, ty + 36,
            { size: 10, weight: 700, color: P.faint, base: 'middle' });
        });
        sim.data.catatan.slice(-4).forEach(function (r, i) {
          const y = ty + 56 + i * 16;
          [r.kiri, r.hasil, r.rasio, r.sederhana].forEach(function (s, k) {
            D.text(c, s, 58 + k * 190, y, {
              size: 10.5, weight: k === 3 ? 700 : 500,
              color: k === 3 ? P.accent2 : P.dim, base: 'middle', mono: k >= 2
            });
          });
        });
      }
    },

    readoutsUpdate: function (sim) {
      const h = sim.get('hukum');
      if (h === 'proust') {
        const r = hitungProust(sim.get('mH'), sim.get('mO'));
        sim.readout('hasil', Sim.fmt(r.air, 1) + '<span class="unit"> g H₂O</span>');
        sim.readout('rasio', '1 : 8');
        sim.readout('pembatas', r.pembatas, 'warn');
        sim.readout('sisa', r.sisaH > 0.01 ? Sim.fmt(r.sisaH, 1) + ' g H₂'
          : r.sisaO > 0.01 ? Sim.fmt(r.sisaO, 1) + ' g O₂' : 'habis');
      } else if (h === 'gaylussac') {
        const rg = REAKSI_GL[parseInt(sim.get('reaksiGL'), 10) || 0];
        const v = sim.get('volume');
        sim.readout('hasil', Sim.fmt(v * rg.v[2], 0) + '<span class="unit"> L</span>');
        sim.readout('rasio', rg.v.join(' : '));
        sim.readout('pembatas', '—');
        sim.readout('sisa', '—');
      } else if (h === 'dalton') {
        sim.readout('hasil', 'CO dan CO₂');
        sim.readout('rasio', '1 : 2');
        sim.readout('pembatas', '—');
        sim.readout('sisa', '—');
      } else {
        sim.readout('hasil', '58,5 g');
        sim.readout('rasio', 'massa tetap');
        sim.readout('pembatas', '—');
        sim.readout('sisa', 'tidak ada');
      }
    },

    notes: `
      <p>Empat hukum ini disusun pada akhir abad ke-18 dan awal abad ke-19, sebelum
      orang tahu atom itu ada. Justru keteraturan angka dalam hukum-hukum inilah yang
      kemudian <strong>memaksa kesimpulan bahwa materi tersusun dari atom</strong>.</p>

      <h3>1. Hukum Lavoisier — kekekalan massa</h3>
      <p>Massa total tidak berubah dalam reaksi kimia. Kuncinya adalah melakukan
      percobaan dalam <strong>sistem tertutup</strong>, karena gas yang lepas sering
      membuat massa tampak berkurang.</p>

      <h3>2. Hukum Proust — perbandingan tetap</h3>
      <p>Setiap senyawa memiliki perbandingan massa unsur yang <strong>selalu sama</strong>.
      Air dari sungai, air hujan, dan air hasil laboratorium semuanya memiliki
      perbandingan massa H : O = 1 : 8.</p>

      <p>Akibat penting: bila salah satu unsur diberikan berlebih, kelebihannya
      <strong>tidak akan bereaksi</strong> dan tersisa. Dari sinilah lahir gagasan
      <strong>pereaksi pembatas</strong>.</p>

      <h3>3. Hukum Dalton — perbandingan berganda</h3>
      <p>Bila dua unsur dapat membentuk lebih dari satu senyawa, maka untuk massa salah
      satu unsur yang tetap, massa unsur lainnya berbanding sebagai
      <strong>bilangan bulat sederhana</strong>.</p>

      <p>Untuk 12 g karbon: CO mengandung 16 g oksigen, CO₂ mengandung 32 g. Perbandingan
      16 : 32 = 1 : 2. Angka bulat seperti ini sulit dijelaskan kecuali bila materi
      tersusun dari satuan yang tidak dapat dibagi — yaitu atom.</p>

      <h3>4. Hukum Gay-Lussac — perbandingan volume</h3>
      <p>Pada suhu dan tekanan sama, volume gas yang bereaksi berbanding sebagai bilangan
      bulat sederhana — dan bilangan itu <strong>persis sama dengan koefisien</strong>
      persamaan reaksinya.</p>

      <span class="formula">N₂ + 3H₂ → 2NH₃
1 L N₂ + 3 L H₂ → 2 L NH₃</span>

      <p>Avogadro kemudian menjelaskan alasannya: pada suhu dan tekanan sama, gas dengan
      volume sama mengandung <strong>jumlah molekul yang sama</strong>. Inilah
      <strong>hipotesis Avogadro</strong>, yang menjembatani volume gas dengan jumlah mol.</p>

      <div class="callout" data-tone="warn">
        <strong>Perhatikan batasannya</strong>
        Hukum Gay-Lussac hanya berlaku untuk <em>gas</em>, dan hanya pada suhu dan tekanan
        yang sama. Perbandingan volume zat cair atau padat tidak mengikuti koefisien reaksi.
      </div>
    `,

    explore: [
      'Pilih <strong>Proust</strong>. Atur 4 g H₂ dengan 32 g O₂, lalu reaksikan. Habis keduanya?',
      'Masih di Proust, naikkan O₂ menjadi 96 g tanpa mengubah H₂. Berapa yang tersisa? Apakah perbandingannya berubah?',
      'Ulangi lima kali dengan angka berbeda-beda dan baca kolom terakhir tabel. Apa yang kamu temukan?',
      'Pilih <strong>Gay-Lussac</strong> dan ubah faktor volume. Apakah perbandingannya ikut berubah?'
    ],

    quiz: [
      {
        q: 'Sebanyak 10 g hidrogen direaksikan dengan 100 g oksigen membentuk air. Berapa gram air yang terbentuk?',
        options: ['110 g', '90 g', '100 g', '80 g'],
        answer: 1,
        explain: 'Perbandingan massa H : O dalam air adalah 1 : 8. Untuk 10 g H dibutuhkan 80 g O. Oksigen tersisa 20 g, sehingga air yang terbentuk 10 + 80 = 90 g.'
      },
      {
        q: 'Karbon dan oksigen membentuk CO dan CO₂. Untuk massa karbon yang sama, perbandingan massa oksigen dalam kedua senyawa adalah 1 : 2. Ini merupakan contoh hukum…',
        options: ['Lavoisier', 'Proust', 'Dalton', 'Gay-Lussac'],
        answer: 2,
        explain: 'Hukum Dalton (perbandingan berganda) berlaku saat dua unsur membentuk lebih dari satu senyawa. Perbandingan massa salah satu unsur untuk massa tetap unsur lain selalu berupa bilangan bulat sederhana.'
      },
      {
        q: 'Pada suhu dan tekanan sama, 4 L gas nitrogen direaksikan dengan hidrogen berlebih menurut N₂ + 3H₂ → 2NH₃. Volume NH₃ yang terbentuk adalah…',
        options: ['4 L', '8 L', '12 L', '2 L'],
        answer: 1,
        explain: 'Perbandingan volume sama dengan perbandingan koefisien, yaitu N₂ : NH₃ = 1 : 2. Jadi 4 L N₂ menghasilkan 8 L NH₃.'
      },
      {
        q: 'Air yang berasal dari sungai, air hujan, dan air hasil reaksi di laboratorium semuanya memiliki perbandingan massa H : O = 1 : 8. Hal ini sesuai dengan hukum…',
        options: ['Kekekalan massa', 'Perbandingan tetap', 'Perbandingan berganda', 'Perbandingan volume'],
        answer: 1,
        explain: 'Hukum Proust menyatakan bahwa perbandingan massa unsur penyusun suatu senyawa selalu tetap, tidak bergantung pada asal atau cara pembuatannya.'
      }
    ]
  });
})();
