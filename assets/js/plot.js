/* ==========================================================================
   SimKimia — plot.js
   Grafik ringan di atas kanvas panggung: sumbu, kisi, garis, batang, titik.
   Semua koordinat memakai sistem logis panggung (bukan piksel perangkat).
   ========================================================================== */

(function (global) {
  'use strict';

  const P = {
    grid:  'rgba(255,255,255,.075)',
    axis:  'rgba(255,255,255,.3)',
    text:  '#e9edf0',
    dim:   '#97a2ad',
    faint: '#5d6872'
  };

  function font(c, size, weight, mono) {
    c.font = (weight || 400) + ' ' + (size || 11) + 'px ' +
      (mono ? '"JetBrains Mono", ui-monospace, monospace' : '"Inter", system-ui, sans-serif');
  }

  /** Pilih selang centang yang "bulat" mendekati target jumlah centang. */
  function langkahBagus(span, target) {
    const kasar = span / Math.max(1, target);
    const pangkat = Math.pow(10, Math.floor(Math.log10(kasar)));
    const sisa = kasar / pangkat;
    const bagus = sisa <= 1 ? 1 : sisa <= 2 ? 2 : sisa <= 2.5 ? 2.5 : sisa <= 5 ? 5 : 10;
    return bagus * pangkat;
  }

  function labelAngka(v, langkah) {
    const dec = Math.max(0, -Math.floor(Math.log10(langkah) + 1e-9));
    if (Math.abs(v) >= 10000 || (v !== 0 && Math.abs(v) < 0.001)) {
      return v.toExponential(1).replace('e', '·10^').replace('+', '');
    }
    return v.toFixed(Math.min(dec, 4)).replace('.', ',');
  }

  /**
   * Menggambar kerangka grafik dan mengembalikan pemeta koordinat.
   * opt: {x, y, w, h, xmin, xmax, ymin, ymax, xlabel, ylabel, judul,
   *       xticks, yticks, kisi, xfmt, yfmt, bgPanel}
   */
  function axes(ctx, opt) {
    const x = opt.x, y = opt.y, w = opt.w, h = opt.h;
    const xmin = opt.xmin, xmax = opt.xmax, ymin = opt.ymin, ymax = opt.ymax;

    const map = {
      x: x, y: y, w: w, h: h,
      xmin: xmin, xmax: xmax, ymin: ymin, ymax: ymax,
      sx: function (v) { return x + (v - xmin) / (xmax - xmin) * w; },
      sy: function (v) { return y + h - (v - ymin) / (ymax - ymin) * h; },
      ix: function (px) { return xmin + (px - x) / w * (xmax - xmin); },
      iy: function (py) { return ymin + (y + h - py) / h * (ymax - ymin); },
      clip: function (c) { c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); },
      unclip: function (c) { c.restore(); }
    };

    if (opt.bgPanel !== false) {
      ctx.fillStyle = opt.bg || 'rgba(255,255,255,.035)';
      ctx.fillRect(x, y, w, h);
    }

    // kisi + centang
    const xl = opt.xstep || langkahBagus(xmax - xmin, opt.xticks || 6);
    const yl = opt.ystep || langkahBagus(ymax - ymin, opt.yticks || 5);

    ctx.save();
    font(ctx, 10.5, 500);
    ctx.fillStyle = P.faint;

    if (opt.kisi !== false) {
      ctx.strokeStyle = P.grid;
      ctx.lineWidth = 1;
      for (let v = Math.ceil(xmin / xl) * xl; v <= xmax + 1e-9; v += xl) {
        const px = Math.round(map.sx(v)) + 0.5;
        ctx.beginPath(); ctx.moveTo(px, y); ctx.lineTo(px, y + h); ctx.stroke();
      }
      for (let v = Math.ceil(ymin / yl) * yl; v <= ymax + 1e-9; v += yl) {
        const py = Math.round(map.sy(v)) + 0.5;
        ctx.beginPath(); ctx.moveTo(x, py); ctx.lineTo(x + w, py); ctx.stroke();
      }
    }

    // label sumbu-x
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    for (let v = Math.ceil(xmin / xl) * xl; v <= xmax + 1e-9; v += xl) {
      const s = opt.xfmt ? opt.xfmt(v) : labelAngka(v, xl);
      ctx.fillText(s, map.sx(v), y + h + 6);
    }
    // label sumbu-y
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    for (let v = Math.ceil(ymin / yl) * yl; v <= ymax + 1e-9; v += yl) {
      const s = opt.yfmt ? opt.yfmt(v) : labelAngka(v, yl);
      ctx.fillText(s, x - 7, map.sy(v));
    }

    // bingkai
    ctx.strokeStyle = P.axis; ctx.lineWidth = 1.2;
    ctx.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(w), Math.round(h));

    // judul & nama sumbu
    font(ctx, 11.5, 600);
    ctx.fillStyle = P.dim;
    if (opt.xlabel) {
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(opt.xlabel, x + w / 2, y + h + 22);
    }
    if (opt.ylabel) {
      ctx.save();
      ctx.translate(x - 38, y + h / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText(opt.ylabel, 0, 0);
      ctx.restore();
    }
    if (opt.judul) {
      font(ctx, 12.5, 700);
      ctx.fillStyle = P.text;
      ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
      ctx.fillText(opt.judul, x, y - 8);
    }
    ctx.restore();
    return map;
  }

  /** Garis dari daftar titik [[x,y], ...] atau {x,y}. */
  function line(ctx, map, pts, opt) {
    opt = opt || {};
    if (!pts || pts.length < 1) return;
    ctx.save();
    map.clip(ctx);
    if (opt.dash) ctx.setLineDash(opt.dash);
    ctx.beginPath();
    let mulai = true;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const vx = Array.isArray(p) ? p[0] : p.x;
      const vy = Array.isArray(p) ? p[1] : p.y;
      if (!isFinite(vx) || !isFinite(vy)) { mulai = true; continue; }
      const px = map.sx(vx), py = map.sy(vy);
      if (mulai) { ctx.moveTo(px, py); mulai = false; } else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = opt.color || '#4fd1c0';
    ctx.lineWidth = opt.lw || 2.2;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.stroke();

    if (opt.isi) {
      const dasar = map.sy(opt.isiDasar !== undefined ? opt.isiDasar : Math.max(map.ymin, 0));
      const last = pts[pts.length - 1], first = pts[0];
      ctx.lineTo(map.sx(Array.isArray(last) ? last[0] : last.x), dasar);
      ctx.lineTo(map.sx(Array.isArray(first) ? first[0] : first.x), dasar);
      ctx.closePath();
      ctx.fillStyle = opt.isi === true ? (opt.color || '#4fd1c0') + '28' : opt.isi;
      ctx.fill();
    }
    map.unclip(ctx);
    ctx.restore();
  }

  /** Fungsi matematis y = f(x) digambar langsung. */
  function fungsi(ctx, map, f, opt) {
    opt = opt || {};
    const n = opt.n || 220;
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const vx = map.xmin + (map.xmax - map.xmin) * i / n;
      pts.push([vx, f(vx)]);
    }
    line(ctx, map, pts, opt);
  }

  /** Titik penanda. */
  function titik(ctx, map, vx, vy, opt) {
    opt = opt || {};
    const px = map.sx(vx), py = map.sy(vy);
    ctx.save();
    if (opt.halo) {
      ctx.beginPath(); ctx.arc(px, py, (opt.r || 4) + 4, 0, Math.PI * 2);
      ctx.fillStyle = (opt.color || '#4fd1c0') + '33'; ctx.fill();
    }
    ctx.beginPath(); ctx.arc(px, py, opt.r || 4, 0, Math.PI * 2);
    ctx.fillStyle = opt.color || '#4fd1c0'; ctx.fill();
    if (opt.edge !== false) { ctx.strokeStyle = opt.edge || '#11161c'; ctx.lineWidth = 1.6; ctx.stroke(); }
    if (opt.label) {
      font(ctx, opt.size || 11, 600);
      ctx.fillStyle = opt.labelColor || opt.color || '#e9edf0';
      ctx.textAlign = opt.align || 'left'; ctx.textBaseline = 'bottom';
      ctx.fillText(opt.label, px + (opt.align === 'right' ? -7 : 7), py - 5);
    }
    ctx.restore();
  }

  /** Garis acuan mendatar/tegak dengan label. */
  function acuan(ctx, map, opt) {
    ctx.save();
    map.clip(ctx);
    ctx.setLineDash(opt.dash || [5, 4]);
    ctx.strokeStyle = opt.color || 'rgba(255,255,255,.3)';
    ctx.lineWidth = opt.lw || 1.3;
    ctx.beginPath();
    if (opt.y !== undefined) {
      const py = map.sy(opt.y);
      ctx.moveTo(map.x, py); ctx.lineTo(map.x + map.w, py);
    } else {
      const px = map.sx(opt.x);
      ctx.moveTo(px, map.y); ctx.lineTo(px, map.y + map.h);
    }
    ctx.stroke();
    map.unclip(ctx);
    if (opt.label) {
      font(ctx, 10.5, 600);
      ctx.fillStyle = opt.color || P.dim;
      if (opt.y !== undefined) {
        ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
        ctx.fillText(opt.label, map.x + map.w - 4, map.sy(opt.y) - 3);
      } else {
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText(opt.label, map.sx(opt.x) + 4, map.y + 3);
      }
    }
    ctx.restore();
  }

  /** Diagram batang vertikal. data: [{label, nilai, warna}] */
  function batang(ctx, opt) {
    const x = opt.x, y = opt.y, w = opt.w, h = opt.h;
    const data = opt.data;
    const max = opt.max !== undefined ? opt.max : Math.max.apply(null, data.map(function (d) { return d.nilai; }).concat([1e-9]));
    const min = opt.min !== undefined ? opt.min : Math.min(0, Math.min.apply(null, data.map(function (d) { return d.nilai; })));
    const n = data.length;
    const celah = opt.celah !== undefined ? opt.celah : 8;
    const bw = (w - celah * (n - 1)) / n;
    const sy = function (v) { return y + h - (v - min) / (max - min) * h; };
    const nol = sy(0);

    ctx.save();
    if (opt.kisi !== false) {
      const yl = langkahBagus(max - min, 4);
      ctx.strokeStyle = P.grid; ctx.lineWidth = 1;
      font(ctx, 10, 500); ctx.fillStyle = P.faint;
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      for (let v = Math.ceil(min / yl) * yl; v <= max + 1e-9; v += yl) {
        const py = Math.round(sy(v)) + 0.5;
        ctx.beginPath(); ctx.moveTo(x, py); ctx.lineTo(x + w, py); ctx.stroke();
        ctx.fillText(labelAngka(v, yl), x - 6, py);
      }
    }
    data.forEach(function (d, i) {
      const bx = x + i * (bw + celah);
      const by = Math.min(sy(d.nilai), nol);
      const bh = Math.abs(sy(d.nilai) - nol);
      ctx.fillStyle = d.warna || '#4fd1c0';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(bx, by, bw, Math.max(bh, 0.6), [3, 3, 0, 0]);
      else ctx.rect(bx, by, bw, Math.max(bh, 0.6));
      ctx.fill();
      if (d.label) {
        font(ctx, 10.5, 600); ctx.fillStyle = P.dim;
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillText(d.label, bx + bw / 2, y + h + 5);
      }
      if (opt.nilaiDiAtas !== false) {
        font(ctx, 10.5, 700); ctx.fillStyle = d.warna || '#e9edf0';
        ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
        const s = d.teks !== undefined ? d.teks : labelAngka(d.nilai, (max - min) / 50);
        ctx.fillText(s, bx + bw / 2, by - 3);
      }
    });
    // sumbu nol
    ctx.strokeStyle = P.axis; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(x, Math.round(nol) + 0.5); ctx.lineTo(x + w, Math.round(nol) + 0.5); ctx.stroke();
    if (opt.judul) {
      font(ctx, 12.5, 700); ctx.fillStyle = P.text;
      ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
      ctx.fillText(opt.judul, x, y - 8);
    }
    ctx.restore();
    return { sy: sy, bw: bw, celah: celah };
  }

  /** Keterangan (legenda) mendatar. items: [{label, warna, dash}] */
  function legenda(ctx, x, y, items, opt) {
    opt = opt || {};
    ctx.save();
    font(ctx, 11, 600);
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    let cx = x;
    items.forEach(function (it) {
      ctx.beginPath();
      ctx.setLineDash(it.dash || []);
      ctx.moveTo(cx, y); ctx.lineTo(cx + 16, y);
      ctx.strokeStyle = it.warna; ctx.lineWidth = opt.lw || 2.6; ctx.lineCap = 'round';
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = opt.color || P.dim;
      ctx.fillText(it.label, cx + 21, y + 0.5);
      cx += 21 + ctx.measureText(it.label).width + (opt.celah || 16);
    });
    ctx.restore();
  }

  /** Penyangga data bergulir untuk grafik waktu-nyata. */
  function Buffer(maks) {
    this.maks = maks || 600;
    this.data = [];
  }
  Buffer.prototype.push = function (x, y) {
    this.data.push([x, y]);
    if (this.data.length > this.maks) this.data.shift();
  };
  Buffer.prototype.clear = function () { this.data.length = 0; };
  Buffer.prototype.last = function () { return this.data[this.data.length - 1]; };
  Buffer.prototype.rentangY = function (pad) {
    if (!this.data.length) return [0, 1];
    let lo = Infinity, hi = -Infinity;
    this.data.forEach(function (p) { if (p[1] < lo) lo = p[1]; if (p[1] > hi) hi = p[1]; });
    const d = (hi - lo) || 1;
    const m = (pad === undefined ? 0.12 : pad) * d;
    return [lo - m, hi + m];
  };

  global.Plot = {
    axes: axes, line: line, fungsi: fungsi, titik: titik, acuan: acuan,
    batang: batang, legenda: legenda, Buffer: Buffer,
    langkahBagus: langkahBagus, labelAngka: labelAngka
  };

})(window);
