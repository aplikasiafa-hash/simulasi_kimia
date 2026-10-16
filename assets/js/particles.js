/* ==========================================================================
   SimKimia — particles.js
   Sistem partikel untuk teori kinetik: wujud padat/cair/gas, difusi,
   tumbukan lenting, dan pengukuran tekanan dari impuls dinding.
   ========================================================================== */

(function (global) {
  'use strict';

  function rnd(a, b) { return a + Math.random() * (b - a); }

  /**
   * Partikel tunggal.
   * jenis: label bebas yang dipakai simulasi untuk membedakan zat.
   */
  function Partikel(x, y, r, warna, opt) {
    opt = opt || {};
    this.x = x; this.y = y;
    this.vx = opt.vx || 0; this.vy = opt.vy || 0;
    this.r = r;
    this.warna = warna;
    this.label = opt.label || '';
    this.jenis = opt.jenis || 'A';
    this.massa = opt.massa || 1;
    this.hx = x; this.hy = y;       // titik jangkar (untuk wujud padat)
    this.fase = 0;                  // sudut untuk getaran
    this.hidup = true;
    this.data = {};
  }

  /**
   * Kotak berisi partikel.
   * opt: {x, y, w, h, gravitasi, tumbukan, redam}
   */
  function Sistem(opt) {
    opt = opt || {};
    this.x = opt.x || 0; this.y = opt.y || 0;
    this.w = opt.w || 400; this.h = opt.h || 300;
    this.partikel = [];
    this.gravitasi = opt.gravitasi || 0;
    this.tumbukan = opt.tumbukan !== false;
    this.redam = opt.redam === undefined ? 1 : opt.redam;
    this.impuls = 0;           // akumulasi impuls dinding (untuk tekanan)
    this.jendelaImpuls = 0;    // waktu akumulasi
    this.tekanan = 0;
    this.wujud = 'gas';
    this.suhu = 1;             // faktor laju relatif
    this.levelCair = 0.45;     // tinggi relatif permukaan cairan
  }

  Sistem.prototype.tambah = function (p) { this.partikel.push(p); return p; };

  Sistem.prototype.kosongkan = function () { this.partikel.length = 0; };

  /** Isi kotak dengan n partikel acak. */
  Sistem.prototype.isiAcak = function (n, r, warna, laju, opt) {
    for (let i = 0; i < n; i++) {
      const a = rnd(0, Math.PI * 2);
      const v = laju * rnd(0.72, 1.3);
      this.tambah(new Partikel(
        rnd(this.x + r, this.x + this.w - r),
        rnd(this.y + r, this.y + this.h - r),
        r, warna,
        Object.assign({ vx: Math.cos(a) * v, vy: Math.sin(a) * v }, opt || {})
      ));
    }
    return this;
  };

  /** Susun partikel dalam kisi teratur (wujud padat). */
  Sistem.prototype.susunKisi = function (n, r, warna, opt) {
    opt = opt || {};
    const kolom = opt.kolom || Math.ceil(Math.sqrt(n * this.w / this.h));
    const baris = Math.ceil(n / kolom);
    const sx = this.w / (kolom + 1), sy = Math.min(this.h / (baris + 1), sx);
    const y0 = this.y + this.h - baris * sy - sy * 0.5;
    let k = 0;
    for (let j = 0; j < baris; j++) {
      for (let i = 0; i < kolom && k < n; i++, k++) {
        const px = this.x + sx * (i + 1) + (opt.selangSeling && j % 2 ? sx * 0.5 : 0);
        const py = y0 + sy * (j + 0.5);
        const p = new Partikel(px, py, r, warna, opt);
        p.hx = px; p.hy = py;
        p.fase = Math.random() * Math.PI * 2;
        this.tambah(p);
      }
    }
    return this;
  };

  /**
   * Atur wujud zat. Ini model pengajaran, bukan dinamika molekul sungguhan:
   * padat → bergetar di tempat, cair → bergerak tapi tetap rapat di bawah,
   * gas → bebas memenuhi ruang.
   */
  Sistem.prototype.setWujud = function (wujud, suhu) {
    this.wujud = wujud;
    this.suhu = suhu === undefined ? this.suhu : suhu;
    const s = this;
    if (wujud === 'gas') {
      this.partikel.forEach(function (p) {
        if (Math.abs(p.vx) + Math.abs(p.vy) < 1) {
          const a = rnd(0, Math.PI * 2), v = 60 * s.suhu;
          p.vx = Math.cos(a) * v; p.vy = Math.sin(a) * v;
        }
      });
    }
    return this;
  };

  /** Satu langkah waktu. */
  Sistem.prototype.langkah = function (dt) {
    const s = this;
    dt = Math.min(dt, 0.05);

    if (this.wujud === 'padat') {
      // Partikel bergetar di sekitar jangkarnya; amplitudo naik dengan suhu.
      const amp = 1.1 + this.suhu * 3.4;
      this.partikel.forEach(function (p) {
        p.fase += dt * (5 + s.suhu * 9) * (0.8 + (p.data.jitter || 0.2));
        p.x = p.hx + Math.cos(p.fase * 1.7) * amp * 0.9;
        p.y = p.hy + Math.sin(p.fase * 2.3) * amp;
      });
      return;
    }

    const batasBawah = this.wujud === 'cair'
      ? this.y + this.h * (1 - this.levelCair) : this.y;

    this.partikel.forEach(function (p) {
      if (!p.hidup) return;

      if (s.wujud === 'cair') {
        // gaya kohesi lemah menarik partikel ke badan cairan
        if (p.y < batasBawah) p.vy += 220 * dt;
        else p.vy += (s.gravitasi * 0.18) * dt;
        // gerak acak termal
        p.vx += rnd(-1, 1) * 90 * s.suhu * dt;
        p.vy += rnd(-1, 1) * 90 * s.suhu * dt;
        const v = Math.hypot(p.vx, p.vy);
        const vmaks = 26 + 95 * s.suhu;
        if (v > vmaks) { p.vx *= vmaks / v; p.vy *= vmaks / v; }
        p.vx *= 0.985; p.vy *= 0.985;
      } else {
        p.vy += s.gravitasi * dt;
        p.vx *= s.redam; p.vy *= s.redam;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // pantulan dinding (lenting sempurna) + catat impuls untuk tekanan
      if (p.x - p.r < s.x) { p.x = s.x + p.r; p.vx = Math.abs(p.vx); s.impuls += 2 * p.massa * Math.abs(p.vx); }
      else if (p.x + p.r > s.x + s.w) { p.x = s.x + s.w - p.r; p.vx = -Math.abs(p.vx); s.impuls += 2 * p.massa * Math.abs(p.vx); }

      const atas = s.wujud === 'cair' ? batasBawah : s.y;
      if (p.y - p.r < atas) { p.y = atas + p.r; p.vy = Math.abs(p.vy); s.impuls += 2 * p.massa * Math.abs(p.vy); }
      else if (p.y + p.r > s.y + s.h) { p.y = s.y + s.h - p.r; p.vy = -Math.abs(p.vy); s.impuls += 2 * p.massa * Math.abs(p.vy); }
    });

    if (this.tumbukan) this.tumbukanPasangan();

    // tekanan = impuls per satuan waktu per keliling
    this.jendelaImpuls += dt;
    if (this.jendelaImpuls >= 0.25) {
      const keliling = 2 * (this.w + this.h);
      this.tekanan = this.impuls / this.jendelaImpuls / keliling;
      this.impuls = 0; this.jendelaImpuls = 0;
    }
  };

  /** Tumbukan lenting antarpartikel memakai kisi ruang sederhana. */
  Sistem.prototype.tumbukanPasangan = function () {
    const ps = this.partikel;
    const n = ps.length;
    if (n < 2) return;
    let rmaks = 0;
    for (let i = 0; i < n; i++) if (ps[i].r > rmaks) rmaks = ps[i].r;
    const sel = Math.max(rmaks * 2.2, 8);
    const kol = Math.max(1, Math.ceil(this.w / sel));
    const bar = Math.max(1, Math.ceil(this.h / sel));
    const kisi = new Array(kol * bar);

    for (let i = 0; i < n; i++) {
      const p = ps[i];
      if (!p.hidup) continue;
      const cx = Math.min(kol - 1, Math.max(0, Math.floor((p.x - this.x) / sel)));
      const cy = Math.min(bar - 1, Math.max(0, Math.floor((p.y - this.y) / sel)));
      const k = cy * kol + cx;
      (kisi[k] || (kisi[k] = [])).push(i);
      p.data._cx = cx; p.data._cy = cy;
    }

    for (let i = 0; i < n; i++) {
      const a = ps[i];
      if (!a.hidup) continue;
      for (let dy = 0; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dy === 0 && dx < 0) continue;
          const cx = a.data._cx + dx, cy = a.data._cy + dy;
          if (cx < 0 || cy < 0 || cx >= kol || cy >= bar) continue;
          const sel2 = kisi[cy * kol + cx];
          if (!sel2) continue;
          for (let q = 0; q < sel2.length; q++) {
            const j = sel2[q];
            if (j <= i) continue;
            const b = ps[j];
            if (!b.hidup) continue;
            const ddx = b.x - a.x, ddy = b.y - a.y;
            const d2 = ddx * ddx + ddy * ddy;
            const rr = a.r + b.r;
            if (d2 >= rr * rr || d2 < 1e-9) continue;
            const d = Math.sqrt(d2);
            const nx = ddx / d, ny = ddy / d;
            // pisahkan agar tidak saling menembus
            const tumpang = rr - d;
            const ma = a.massa, mb = b.massa, mt = ma + mb;
            a.x -= nx * tumpang * (mb / mt); a.y -= ny * tumpang * (mb / mt);
            b.x += nx * tumpang * (ma / mt); b.y += ny * tumpang * (ma / mt);
            // kecepatan relatif sepanjang garis normal
            const rvx = b.vx - a.vx, rvy = b.vy - a.vy;
            const vn = rvx * nx + rvy * ny;
            if (vn > 0) continue;
            const imp = -2 * vn / mt;
            a.vx -= imp * mb * nx; a.vy -= imp * mb * ny;
            b.vx += imp * ma * nx; b.vy += imp * ma * ny;
          }
        }
      }
    }
  };

  /** Laju rata-rata (ukuran suhu). */
  Sistem.prototype.lajuRata = function () {
    if (!this.partikel.length) return 0;
    let s = 0;
    this.partikel.forEach(function (p) { s += Math.hypot(p.vx, p.vy); });
    return s / this.partikel.length;
  };

  /** Energi kinetik total. */
  Sistem.prototype.energiKinetik = function () {
    let s = 0;
    this.partikel.forEach(function (p) { s += 0.5 * p.massa * (p.vx * p.vx + p.vy * p.vy); });
    return s;
  };

  /** Skala ulang seluruh kecepatan (mengubah suhu). */
  Sistem.prototype.skalaLaju = function (f) {
    this.partikel.forEach(function (p) { p.vx *= f; p.vy *= f; });
  };

  /** Hitung partikel pada separuh kiri kotak (untuk simulasi difusi). */
  Sistem.prototype.hitungKiri = function (jenis) {
    const tengah = this.x + this.w / 2;
    let n = 0;
    this.partikel.forEach(function (p) {
      if (p.hidup && (!jenis || p.jenis === jenis) && p.x < tengah) n++;
    });
    return n;
  };

  /** Gambar seluruh partikel. */
  Sistem.prototype.gambar = function (ctx, opt) {
    opt = opt || {};
    const Draw = global.Sim && global.Sim.Draw;
    this.partikel.forEach(function (p) {
      if (!p.hidup) return;
      if (opt.jejak && p.r > 3) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 1.9, 0, Math.PI * 2);
        ctx.fillStyle = (Draw ? Draw.alpha(p.warna, 0.1) : 'rgba(255,255,255,.07)');
        ctx.fill();
      }
      if (Draw) Draw.atom(ctx, p.x, p.y, p.r, p.warna, opt.label === false ? '' : p.label, { size: p.r * 1.05 });
      else {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.warna; ctx.fill();
      }
    });
  };

  /** Gambar kotak wadah. */
  Sistem.prototype.gambarKotak = function (ctx, opt) {
    opt = opt || {};
    ctx.save();
    ctx.strokeStyle = opt.warna || 'rgba(255,255,255,.34)';
    ctx.lineWidth = opt.lw || 2;
    if (opt.dash) ctx.setLineDash(opt.dash);
    ctx.strokeRect(this.x, this.y, this.w, this.h);
    ctx.restore();
  };

  global.Partikel = Partikel;
  global.SistemPartikel = Sistem;

})(window);
