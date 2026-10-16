/* ==========================================================================
   SimKimia — core.js
   Kerangka kerja simulasi: membangun halaman, panel kontrol, panggung kanvas,
   gelung animasi, pembacaan nilai, dan panel belajar.

   Sebuah simulasi cukup memanggil Sim.create({...}) dan seluruh halaman
   terbentuk. Lihat berkas sim.js di dalam tiap folder sims/ untuk contoh.
   ========================================================================== */

(function (global) {
  'use strict';

  /* ---------------------------------------------------------------- DOM -- */

  function el(tag, attrs, kids) {
    const n = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v === null || v === undefined || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'html') n.innerHTML = v;
      else if (k === 'text') n.textContent = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(n.style, v);
      else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2).toLowerCase(), v);
      else n.setAttribute(k, v === true ? '' : v);
    }
    if (kids) (Array.isArray(kids) ? kids : [kids]).forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return n;
  }

  /* -------------------------------------------------------------- tema --- */

  const Theme = {
    key: 'simkimia-tema',
    get: function () {
      try { return localStorage.getItem(Theme.key); } catch (e) { return null; }
    },
    set: function (v) {
      try { localStorage.setItem(Theme.key, v); } catch (e) { /* mode privat */ }
      document.documentElement.setAttribute('data-theme', v);
    },
    init: function () {
      const v = Theme.get();
      if (v) document.documentElement.setAttribute('data-theme', v);
    },
    toggle: function () {
      const cur = document.documentElement.getAttribute('data-theme');
      const sysDark = global.matchMedia && global.matchMedia('(prefers-color-scheme: dark)').matches;
      const now = cur ? cur : (sysDark ? 'dark' : 'light');
      Theme.set(now === 'dark' ? 'light' : 'dark');
    }
  };
  Theme.init();

  function themeButton() {
    const b = el('button', {
      class: 'btn btn-ghost theme-toggle',
      type: 'button',
      title: 'Ganti mode terang/gelap',
      'aria-label': 'Ganti mode terang atau gelap',
      onclick: Theme.toggle
    });
    b.innerHTML = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.6v2M12 19.4v2M2.6 12h2M19.4 12h2M5.4 5.4l1.4 1.4M17.2 17.2l1.4 1.4M18.6 5.4l-1.4 1.4M6.8 17.2l-1.4 1.4"/></svg>';
    return b;
  }

  /* ------------------------------------------------------------ topbar --- */

  function buildTopbar(root) {
    const brand = el('a', { class: 'brand', href: root + 'index.html' }, [
      el('span', { class: 'brand-mark', 'aria-hidden': 'true', text: 'K' }),
      el('span', { text: 'SimKimia' })
    ]);
    return el('header', { class: 'topbar' }, [
      el('div', { class: 'wrap topbar-inner' }, [
        brand,
        el('div', { class: 'topbar-spacer' }),
        el('a', { class: 'btn btn-ghost btn-sm', href: root + 'index.html', text: 'Semua simulasi' }),
        themeButton()
      ])
    ]);
  }

  /* ------------------------------------------------------- warna kanvas -- */

  // Panggung selalu gelap, jadi paletnya tetap — tak perlu baca CSS variable.
  const P = {
    bg:       '#11161c',
    panel:    'rgba(255,255,255,.045)',
    panelEdge:'rgba(255,255,255,.11)',
    grid:     'rgba(255,255,255,.075)',
    gridBold: 'rgba(255,255,255,.16)',
    text:     '#e9edf0',
    dim:      '#97a2ad',
    faint:    '#5d6872',
    accent:   '#4fd1c0',
    accent2:  '#7fe3d6',
    blue:     '#5b9bf5',
    amber:    '#f0a94a',
    rose:     '#f0718f',
    violet:   '#b795f0',
    green:    '#6fcf7f',
    red:      '#ef6a52',
    proton:   '#e0533d',
    neutron:  '#8793a0',
    electron: '#5b9bf5',
    air:      '#4a8fd0',
    panas:    '#ef7a44',
    dingin:   '#4a90d9',
    white:    '#ffffff'
  };

  /* --------------------------------------------------- bantuan gambar ---- */

  const Draw = {
    clear: function (c, w, h, fill) {
      c.clearRect(0, 0, w, h);
      if (fill !== false) { c.fillStyle = fill || P.bg; c.fillRect(0, 0, w, h); }
    },

    circle: function (c, x, y, r, fill, stroke, lw) {
      c.beginPath(); c.arc(x, y, Math.max(0, r), 0, Math.PI * 2);
      if (fill) { c.fillStyle = fill; c.fill(); }
      if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 1.5; c.stroke(); }
    },

    roundRect: function (c, x, y, w, h, r, fill, stroke, lw) {
      r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
      c.beginPath();
      if (c.roundRect) c.roundRect(x, y, w, h, r);
      else {
        c.moveTo(x + r, y);
        c.arcTo(x + w, y, x + w, y + h, r);
        c.arcTo(x + w, y + h, x, y + h, r);
        c.arcTo(x, y + h, x, y, r);
        c.arcTo(x, y, x + w, y, r);
        c.closePath();
      }
      if (fill) { c.fillStyle = fill; c.fill(); }
      if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 1.5; c.stroke(); }
    },

    /** Teks dengan penyelarasan ringkas. align: 'l'|'c'|'r', base: 'top'|'middle'|'bottom'|'alphabetic' */
    text: function (c, s, x, y, opt) {
      opt = opt || {};
      c.save();
      c.font = (opt.weight || 400) + ' ' + (opt.size || 13) + 'px ' +
        (opt.mono ? '"JetBrains Mono", ui-monospace, monospace' : '"Inter", system-ui, sans-serif');
      c.fillStyle = opt.color || P.text;
      c.textAlign = opt.align === 'c' ? 'center' : opt.align === 'r' ? 'right' : 'left';
      c.textBaseline = opt.base || 'alphabetic';
      if (opt.alpha !== undefined) c.globalAlpha = opt.alpha;
      c.fillText(s, x, y);
      c.restore();
    },

    /** Mengukur lebar teks tanpa menggambar. */
    measure: function (c, s, opt) {
      opt = opt || {};
      c.save();
      c.font = (opt.weight || 400) + ' ' + (opt.size || 13) + 'px ' +
        (opt.mono ? '"JetBrains Mono", ui-monospace, monospace' : '"Inter", system-ui, sans-serif');
      const w = c.measureText(s).width;
      c.restore();
      return w;
    },

    line: function (c, x1, y1, x2, y2, color, lw, dash) {
      c.save();
      if (dash) c.setLineDash(dash);
      c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2);
      c.strokeStyle = color || P.grid; c.lineWidth = lw || 1; c.stroke();
      c.restore();
    },

    arrow: function (c, x1, y1, x2, y2, color, lw, head) {
      head = head || 8; lw = lw || 2;
      const a = Math.atan2(y2 - y1, x2 - x1);
      const bx = x2 - Math.cos(a) * head * 0.85, by = y2 - Math.sin(a) * head * 0.85;
      c.beginPath(); c.moveTo(x1, y1); c.lineTo(bx, by);
      c.strokeStyle = color; c.lineWidth = lw; c.lineCap = 'round'; c.stroke();
      c.beginPath();
      c.moveTo(x2, y2);
      c.lineTo(x2 - Math.cos(a - 0.42) * head, y2 - Math.sin(a - 0.42) * head);
      c.lineTo(x2 - Math.cos(a + 0.42) * head, y2 - Math.sin(a + 0.42) * head);
      c.closePath(); c.fillStyle = color; c.fill();
    },

    /** Kotak panel semi-transparan di atas panggung. */
    panel: function (c, x, y, w, h, title) {
      Draw.roundRect(c, x, y, w, h, 8, P.panel, P.panelEdge, 1);
      if (title) Draw.text(c, title, x + 11, y + 15, { size: 11, weight: 700, color: P.dim, base: 'middle' });
    },

    /** Gelas kimia (beaker) dengan isi cairan setinggi `level` (0..1). */
    beaker: function (c, x, y, w, h, level, liquid, opt) {
      opt = opt || {};
      const lh = h * Math.max(0, Math.min(1, level));
      c.save();
      // isi cairan
      if (lh > 0) {
        c.beginPath();
        c.rect(x, y + h - lh, w, lh);
        c.fillStyle = liquid; c.fill();
        // permukaan sedikit lebih terang
        c.globalAlpha = 0.28;
        c.fillStyle = '#ffffff';
        c.fillRect(x, y + h - lh, w, 3);
        c.globalAlpha = 1;
      }
      c.restore();
      // dinding gelas
      c.beginPath();
      c.moveTo(x - 3, y);
      c.lineTo(x, y);
      c.lineTo(x, y + h);
      c.lineTo(x + w, y + h);
      c.lineTo(x + w, y);
      c.lineTo(x + w + 3, y);
      c.strokeStyle = opt.edge || 'rgba(255,255,255,.42)';
      c.lineWidth = opt.lw || 2.5;
      c.lineJoin = 'round'; c.lineCap = 'round';
      c.stroke();
      // garis takar
      if (opt.ticks !== false) {
        for (let i = 1; i < 5; i++) {
          const ty = y + h - (h * i / 5);
          Draw.line(c, x + w - 13, ty, x + w - 2, ty, 'rgba(255,255,255,.3)', 1.2);
        }
      }
    },

    /** Tabung reaksi vertikal. */
    tube: function (c, x, y, w, h, level, liquid) {
      const r = w / 2, lh = h * Math.max(0, Math.min(1, level));
      c.save();
      c.beginPath();
      c.moveTo(x, y); c.lineTo(x, y + h - r);
      c.arc(x + r, y + h - r, r, Math.PI, 0, true);
      c.lineTo(x + w, y);
      c.closePath();
      c.clip();
      if (lh > 0) { c.fillStyle = liquid; c.fillRect(x, y + h - lh, w, lh); }
      c.restore();
      c.beginPath();
      c.moveTo(x, y); c.lineTo(x, y + h - r);
      c.arc(x + r, y + h - r, r, Math.PI, 0, true);
      c.lineTo(x + w, y);
      c.strokeStyle = 'rgba(255,255,255,.42)'; c.lineWidth = 2.2; c.stroke();
    },

    /** Nyala api pembakar bunsen, intensitas 0..1. */
    flame: function (c, x, y, intensity, t) {
      if (intensity <= 0.01) return;
      const n = 7;
      for (let i = 0; i < n; i++) {
        const p = i / n;
        const wob = Math.sin(t * 7 + i * 1.7) * 2.6 * intensity;
        const hgt = (16 + 30 * intensity) * (1 - p * 0.55);
        const wid = (11 - p * 7) * (0.55 + intensity * 0.6);
        c.beginPath();
        c.ellipse(x + wob, y - hgt * 0.5 - p * 7, wid, hgt * 0.5, 0, 0, Math.PI * 2);
        c.fillStyle = p < 0.35 ? 'rgba(90,160,255,' + (0.5 * intensity) + ')'
          : 'rgba(' + (255) + ',' + Math.round(170 - p * 70) + ',60,' + (0.34 * intensity) + ')';
        c.fill();
      }
    },

    /** Lingkaran berlabel (dipakai untuk atom/ion). */
    atom: function (c, x, y, r, color, label, opt) {
      opt = opt || {};
      const g = c.createRadialGradient(x - r * 0.33, y - r * 0.36, r * 0.1, x, y, r);
      g.addColorStop(0, Draw.lighten(color, 0.42));
      g.addColorStop(1, color);
      Draw.circle(c, x, y, r, g, opt.edge || 'rgba(0,0,0,.28)', 1.2);
      if (label) Draw.text(c, label, x, y + 0.5, {
        size: opt.size || Math.max(8, r * 0.95),
        weight: 700, color: opt.ink || Draw.readable(color),
        align: 'c', base: 'middle'
      });
    },

    /** Campur warna hex menuju putih. */
    lighten: function (hex, amt) {
      const c = Draw.hex2rgb(hex);
      return 'rgb(' + Math.round(c[0] + (255 - c[0]) * amt) + ',' +
        Math.round(c[1] + (255 - c[1]) * amt) + ',' +
        Math.round(c[2] + (255 - c[2]) * amt) + ')';
    },
    darken: function (hex, amt) {
      const c = Draw.hex2rgb(hex);
      return 'rgb(' + Math.round(c[0] * (1 - amt)) + ',' +
        Math.round(c[1] * (1 - amt)) + ',' + Math.round(c[2] * (1 - amt)) + ')';
    },
    hex2rgb: function (h) {
      if (h[0] !== '#') {
        const m = h.match(/\d+/g);
        return m ? [+m[0], +m[1], +m[2]] : [128, 128, 128];
      }
      h = h.slice(1);
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    },
    alpha: function (color, a) {
      const c = Draw.hex2rgb(color);
      return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';
    },
    /** Pilih hitam atau putih agar kontras di atas `color`. */
    readable: function (color) {
      const c = Draw.hex2rgb(color);
      const l = (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255;
      return l > 0.58 ? '#12181d' : '#ffffff';
    },
    /** Interpolasi dua warna hex, t = 0..1 */
    mix: function (a, b, t) {
      const x = Draw.hex2rgb(a), y = Draw.hex2rgb(b);
      t = Math.max(0, Math.min(1, t));
      return 'rgb(' + Math.round(x[0] + (y[0] - x[0]) * t) + ',' +
        Math.round(x[1] + (y[1] - x[1]) * t) + ',' +
        Math.round(x[2] + (y[2] - x[2]) * t) + ')';
    },
    /** Gradien dari daftar warna, t = 0..1 */
    ramp: function (stops, t) {
      t = Math.max(0, Math.min(0.9999, t));
      const n = stops.length - 1;
      const i = Math.floor(t * n);
      return Draw.mix(stops[i], stops[i + 1], t * n - i);
    }
  };

  /* ---------------------------------------------------------- pembulatan -- */

  function fmt(v, dec) {
    if (!isFinite(v)) return '—';
    if (dec === undefined) dec = Math.abs(v) >= 100 ? 0 : Math.abs(v) >= 10 ? 1 : 2;
    return v.toFixed(dec).replace('.', ',');
  }

  /** Notasi ilmiah rapi untuk angka sangat kecil/besar. */
  function sci(v, dec) {
    if (v === 0) return '0';
    if (!isFinite(v)) return '—';
    const e = Math.floor(Math.log10(Math.abs(v)));
    if (e >= -3 && e <= 4) return fmt(v, dec === undefined ? Math.max(0, 3 - e) : dec);
    const m = v / Math.pow(10, e);
    return fmt(m, dec === undefined ? 2 : dec) + '×10' + sup(e);
  }

  const SUB = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉' };
  const SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻', '+': '⁺' };

  function sub(s) { return String(s).replace(/[0-9]/g, function (d) { return SUB[d]; }); }
  function sup(s) { return String(s).replace(/[0-9+\-]/g, function (d) { return SUP[d]; }); }

  /**
   * Mengubah rumus biasa menjadi bentuk berindeks untuk kanvas.
   * "H2SO4" → "H₂SO₄";  "Ca^2+" → "Ca²⁺";  "SO4^2-" → "SO₄²⁻"
   */
  function formula(s) {
    return String(s).replace(/\^([0-9]*[+\-])/g, function (_, g) { return sup(g); })
      .replace(/([A-Za-z\)\]])([0-9]+)/g, function (_, a, d) { return a + sub(d); });
  }

  const clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  const lerp = function (a, b, t) { return a + (b - a) * t; };

  /* ------------------------------------------------------------- kontrol -- */

  function buildControl(c, sim) {
    const id = c.id;

    if (c.type === 'slider') {
      const valueEl = el('span', { class: 'ctl-value' });
      const input = el('input', {
        type: 'range', min: c.min, max: c.max,
        step: c.step === undefined ? (c.max - c.min) / 100 : c.step,
        value: sim.state[id], 'aria-label': c.label
      });
      const render = function () {
        const v = sim.state[id];
        valueEl.textContent = (c.format ? c.format(v, sim) : fmt(v, c.dec)) + (c.unit ? ' ' + c.unit : '');
      };
      input.addEventListener('input', function () {
        sim.set(id, parseFloat(input.value));
      });
      sim._sync[id] = function () {
        if (document.activeElement !== input) input.value = sim.state[id];
        render();
      };
      render();
      const ticks = c.ticks !== false ? el('div', { class: 'ctl-ticks' }, [
        el('span', { text: (c.minLabel !== undefined ? c.minLabel : fmt(c.min, c.dec)) }),
        el('span', { text: (c.maxLabel !== undefined ? c.maxLabel : fmt(c.max, c.dec)) })
      ]) : null;
      return el('div', { class: 'ctl' }, [
        el('div', { class: 'ctl-label' }, [el('span', { text: c.label }), valueEl]),
        input, ticks,
        c.hint ? el('div', { class: 'ctl-hint', html: c.hint }) : null
      ]);
    }

    if (c.type === 'toggle') {
      const input = el('input', { type: 'checkbox' });
      input.checked = !!sim.state[id];
      input.addEventListener('change', function () { sim.set(id, input.checked); });
      sim._sync[id] = function () { input.checked = !!sim.state[id]; };
      return el('div', { class: 'ctl' }, [
        el('label', { class: 'ctl-toggle' }, [
          el('span', { text: c.label }), input, el('span', { class: 'ctl-switch', 'aria-hidden': 'true' })
        ]),
        c.hint ? el('div', { class: 'ctl-hint', html: c.hint }) : null
      ]);
    }

    if (c.type === 'select') {
      const select = el('select', { 'aria-label': c.label });
      c.options.forEach(function (o) {
        const val = (typeof o === 'object') ? o.value : o;
        const lab = (typeof o === 'object') ? o.label : o;
        select.appendChild(el('option', { value: val, text: lab }));
      });
      select.value = sim.state[id];
      select.addEventListener('change', function () { sim.set(id, select.value); });
      sim._sync[id] = function () { select.value = sim.state[id]; };
      return el('div', { class: 'ctl' }, [
        c.label ? el('div', { class: 'ctl-label' }, [el('span', { text: c.label })]) : null,
        select,
        c.hint ? el('div', { class: 'ctl-hint', html: c.hint }) : null
      ]);
    }

    if (c.type === 'segment') {
      const name = 'seg-' + id + '-' + Math.random().toString(36).slice(2, 7);
      const box = el('div', { class: 'ctl-seg', role: 'radiogroup', 'aria-label': c.label || id });
      const inputs = [];
      c.options.forEach(function (o) {
        const val = (typeof o === 'object') ? o.value : o;
        const lab = (typeof o === 'object') ? o.label : o;
        const input = el('input', { type: 'radio', name: name, value: val });
        input.checked = String(sim.state[id]) === String(val);
        input.addEventListener('change', function () {
          if (input.checked) sim.set(id, c.numeric ? parseFloat(val) : val);
        });
        inputs.push([input, val]);
        box.appendChild(el('label', {}, [input, el('span', { text: lab })]));
      });
      sim._sync[id] = function () {
        inputs.forEach(function (p) { p[0].checked = String(sim.state[id]) === String(p[1]); });
      };
      return el('div', { class: 'ctl' }, [
        c.label ? el('div', { class: 'ctl-label' }, [el('span', { text: c.label })]) : null,
        box,
        c.hint ? el('div', { class: 'ctl-hint', html: c.hint }) : null
      ]);
    }

    if (c.type === 'buttons') {
      return el('div', { class: 'ctl' }, [
        c.label ? el('div', { class: 'ctl-label' }, [el('span', { text: c.label })]) : null,
        el('div', { class: 'ctl-actions' }, c.items.map(function (b) {
          return el('button', {
            class: 'btn btn-sm' + (b.primary ? ' btn-primary' : ''),
            type: 'button', text: b.label,
            onclick: function () { b.onClick(sim); sim.sync(); sim.render(); }
          });
        }))
      ]);
    }

    if (c.type === 'html') {
      return el('div', { class: 'ctl', html: c.html });
    }

    return el('div');
  }

  /* --------------------------------------------------------------- kuis -- */

  function buildQuiz(items) {
    const box = el('div');
    items.forEach(function (q, qi) {
      const opts = el('div', { class: 'quiz-opts' });
      const explain = el('div', { class: 'quiz-explain', style: { display: 'none' }, html: q.explain || '' });
      const buttons = [];
      q.options.forEach(function (text, i) {
        const b = el('button', { class: 'quiz-opt', type: 'button' }, [
          el('span', { class: 'mark', text: String.fromCharCode(65 + i) + '.' }),
          el('span', { html: text })
        ]);
        b.addEventListener('click', function () {
          buttons.forEach(function (bb, bi) {
            bb.disabled = true;
            if (bi === q.answer) bb.dataset.state = 'benar';
            else if (bi === i) bb.dataset.state = 'salah';
          });
          explain.style.display = '';
        });
        buttons.push(b);
        opts.appendChild(b);
      });
      box.appendChild(el('div', { class: 'quiz-item' }, [
        el('div', { class: 'quiz-q', html: (qi + 1) + '. ' + q.q }),
        opts, explain
      ]));
    });
    return box;
  }

  /* ---------------------------------------------------- pembuat simulasi -- */

  function create(cfg) {
    const root = cfg.root || '../../';
    const W = (cfg.stage && cfg.stage.w) || 760;
    const H = (cfg.stage && cfg.stage.h) || 470;

    document.body.appendChild(buildTopbar(root));
    const main = el('main', { class: 'sim-page' });
    document.body.appendChild(main);

    /* ----- kepala ----- */
    const head = el('div', { class: 'wrap sim-head' }, [
      el('nav', { class: 'sim-crumb' }, [
        el('a', { href: root + 'index.html', text: 'Semua simulasi' }),
        el('span', { class: 'sep', text: '›' }),
        el('span', { text: 'Fase ' + cfg.fase })
      ]),
      el('h1', { class: 'sim-title', text: cfg.title }),
      cfg.subtitle ? el('p', { class: 'sim-sub', html: cfg.subtitle }) : null,
      el('div', { class: 'sim-tags' }, [
        el('span', { class: 'badge badge-fase', 'data-fase': cfg.fase, text: 'Fase ' + cfg.fase })
      ].concat((cfg.jenjang ? [el('span', { class: 'badge', text: cfg.jenjang })] : []))
        .concat((cfg.topik || []).map(function (t) { return el('span', { class: 'badge', text: t }); }))
      )
    ]);
    main.appendChild(head);

    /* ----- panggung + kontrol ----- */
    const canvas = el('canvas', { 'aria-label': cfg.title + ' — panggung simulasi', role: 'img' });
    const stageBar = el('div', { class: 'sim-stage-bar' });
    const stage = el('div', { class: 'sim-stage' }, [canvas, stageBar]);
    const controlsBox = el('aside', { class: 'sim-controls', 'aria-label': 'Panel kontrol' });
    const shell = el('div', { class: 'wrap' }, [
      el('div', { class: 'sim-shell' }, [stage, controlsBox])
    ]);
    main.appendChild(shell);

    /* ----- objek sim ----- */
    const ctx = canvas.getContext('2d');
    const sim = {
      cfg: cfg, W: W, H: H, ctx: ctx, canvas: canvas,
      state: {}, data: {}, t: 0, playing: cfg.autoplay !== false,
      P: P, Draw: Draw,
      _sync: {}, _readouts: {}, _dirty: true
    };

    /* ----- keadaan awal dari kontrol ----- */
    const groups = cfg.controls || [];
    groups.forEach(function (g) {
      (g.items || []).forEach(function (c) {
        if (c.id !== undefined && c.value !== undefined) sim.state[c.id] = c.value;
      });
    });
    if (cfg.state) Object.assign(sim.state, cfg.state);
    const initialState = JSON.parse(JSON.stringify(sim.state));

    /* ----- API ----- */
    sim.get = function (id) { return sim.state[id]; };
    sim.set = function (id, v) {
      if (sim.state[id] === v) return;
      sim.state[id] = v;
      if (sim._sync[id]) sim._sync[id]();
      if (cfg.onChange) cfg.onChange(sim, id, v);
      sim._dirty = true;
      if (!sim.playing) sim.render();
    };
    sim.sync = function () { for (const k in sim._sync) sim._sync[k](); };
    sim.readout = function (id, value, tone) {
      const r = sim._readouts[id];
      if (!r) return;
      r.value.innerHTML = value;
      if (tone !== undefined) {
        if (tone) r.box.dataset.tone = tone; else delete r.box.dataset.tone;
      }
    };
    sim.reset = function () {
      Object.assign(sim.state, JSON.parse(JSON.stringify(initialState)));
      sim.t = 0;
      if (cfg.reset) cfg.reset(sim);
      sim.sync();
      sim._dirty = true;
      sim.render();
    };
    sim.render = function () { frame(0, true); };

    /* ----- panel kontrol ----- */
    groups.forEach(function (g) {
      const box = el('div', { class: 'ctl-group' });
      if (g.title) box.appendChild(el('div', { class: 'ctl-group-title', text: g.title }));
      (g.items || []).forEach(function (c) { box.appendChild(buildControl(c, sim)); });
      controlsBox.appendChild(box);
    });

    /* ----- pembacaan nilai ----- */
    if (cfg.readouts && cfg.readouts.length) {
      const box = el('div', { class: 'ctl-group' });
      box.appendChild(el('div', { class: 'ctl-group-title', text: cfg.readoutsTitle || 'Pembacaan' }));
      const grid = el('div', { class: 'readouts' });
      cfg.readouts.forEach(function (r) {
        const value = el('div', { class: 'readout-value', text: '—' });
        const b = el('div', { class: 'readout' }, [
          el('div', { class: 'readout-label', html: r.label }), value
        ]);
        if (r.tone) b.dataset.tone = r.tone;
        sim._readouts[r.id] = { box: b, value: value };
        grid.appendChild(b);
      });
      box.appendChild(grid);
      controlsBox.appendChild(box);
    }

    /* ----- bilah panggung ----- */
    if (cfg.update && cfg.showPlay !== false) {
      const playBtn = el('button', { class: 'btn btn-sm btn-primary', type: 'button' });
      const setLabel = function () { playBtn.textContent = sim.playing ? '❚❚ Jeda' : '▶ Jalan'; };
      playBtn.addEventListener('click', function () {
        sim.playing = !sim.playing; setLabel();
        if (sim.playing) { last = performance.now(); requestAnimationFrame(loop); }
      });
      setLabel();
      stageBar.appendChild(playBtn);
      const stepBtn = el('button', { class: 'btn btn-sm', type: 'button', text: '⏭ Langkah' });
      stepBtn.addEventListener('click', function () { if (cfg.update) cfg.update(sim, 1 / 30); sim.t += 1 / 30; sim.render(); });
      stageBar.appendChild(stepBtn);
    }
    const resetBtn = el('button', { class: 'btn btn-sm', type: 'button', text: '↺ Atur ulang' });
    resetBtn.addEventListener('click', function () { sim.reset(); });
    stageBar.appendChild(resetBtn);
    (cfg.stageButtons || []).forEach(function (b) {
      stageBar.appendChild(el('button', {
        class: 'btn btn-sm', type: 'button', text: b.label,
        onclick: function () { b.onClick(sim); sim.sync(); sim.render(); }
      }));
    });
    if (cfg.stageNote) stageBar.appendChild(el('span', { class: 'sim-stage-note', html: cfg.stageNote }));

    /* ----- ukuran kanvas (DPR) ----- */
    function resize() {
      const cssW = stage.clientWidth;
      const dpr = Math.min(global.devicePixelRatio || 1, 2.5);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = '100%';
      canvas.style.height = (cssW * H / W) + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sim.cssScale = cssW / W;
      sim._dirty = true;
      sim.render();
    }

    /* ----- penunjuk (mouse/sentuh) ----- */
    sim.pointer = { x: -1, y: -1, down: false, inside: false };
    function toLocal(ev) {
      const r = canvas.getBoundingClientRect();
      return { x: (ev.clientX - r.left) * W / r.width, y: (ev.clientY - r.top) * H / r.height };
    }
    canvas.addEventListener('pointerdown', function (ev) {
      canvas.setPointerCapture(ev.pointerId);
      const p = toLocal(ev);
      sim.pointer.x = p.x; sim.pointer.y = p.y; sim.pointer.down = true; sim.pointer.inside = true;
      if (cfg.onPointerDown) cfg.onPointerDown(sim, p.x, p.y, ev);
      sim._dirty = true; if (!sim.playing) sim.render();
    });
    canvas.addEventListener('pointermove', function (ev) {
      const p = toLocal(ev);
      sim.pointer.x = p.x; sim.pointer.y = p.y; sim.pointer.inside = true;
      if (cfg.onPointerMove) cfg.onPointerMove(sim, p.x, p.y, ev);
      sim._dirty = true; if (!sim.playing) sim.render();
    });
    const up = function (ev) {
      const p = toLocal(ev);
      sim.pointer.down = false;
      if (cfg.onPointerUp) cfg.onPointerUp(sim, p.x, p.y, ev);
      sim._dirty = true; if (!sim.playing) sim.render();
    };
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
    canvas.addEventListener('pointerleave', function () {
      sim.pointer.inside = false; sim.pointer.down = false;
      sim._dirty = true; if (!sim.playing) sim.render();
    });

    /* ----- gelung animasi ----- */
    let last = performance.now();
    function frame(dt, forced) {
      if (cfg.update && dt > 0) { cfg.update(sim, dt); sim.t += dt; }
      ctx.save();
      Draw.clear(ctx, W, H, cfg.stageFill);
      if (cfg.draw) cfg.draw(ctx, sim);
      ctx.restore();
      if (cfg.readoutsUpdate) cfg.readoutsUpdate(sim);
      sim._dirty = false;
    }
    function loop(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (sim.playing) { frame(dt); requestAnimationFrame(loop); }
    }

    /* ----- panel belajar ----- */
    const learn = el('div', { class: 'wrap' });
    const learnGrid = el('div', { class: 'sim-learn' });
    if (cfg.notes) {
      learnGrid.appendChild(el('section', { class: 'panel' }, [
        el('div', { class: 'panel-eyebrow', text: 'Konsep kunci' }),
        el('h2', { text: cfg.notesTitle || 'Apa yang sedang terjadi?' }),
        el('div', { html: cfg.notes })
      ]));
    }
    const side = el('div', { class: 'stack', style: { '--gap': '18px' } });
    if (cfg.explore && cfg.explore.length) {
      side.appendChild(el('section', { class: 'panel' }, [
        el('div', { class: 'panel-eyebrow', text: 'Coba ini' }),
        el('h2', { text: 'Ajakan bereksperimen' }),
        el('ol', {}, cfg.explore.map(function (s) { return el('li', { html: s }); }))
      ]));
    }
    if (cfg.quiz && cfg.quiz.length) {
      side.appendChild(el('section', { class: 'panel' }, [
        el('div', { class: 'panel-eyebrow', text: 'Uji pemahaman' }),
        el('h2', { text: 'Latihan cepat' }),
        el('p', { text: 'Klik jawaban untuk melihat pembahasannya.' }),
        buildQuiz(cfg.quiz)
      ]));
    }
    if (side.children.length) learnGrid.appendChild(side);
    if (learnGrid.children.length) { learn.appendChild(learnGrid); main.appendChild(learn); }

    /* ----- navigasi bawah ----- */
    main.appendChild(el('div', { class: 'wrap' }, [
      el('div', { class: 'sim-nav' }, [
        el('a', { class: 'btn', href: root + 'index.html', text: '← Semua simulasi' }),
        el('div', { class: 'spacer' }),
        el('span', { class: 'badge', text: 'Kurikulum Merdeka · Fase ' + cfg.fase })
      ])
    ]));

    document.body.appendChild(el('footer', { class: 'site-footer' }, [
      el('div', { class: 'wrap' }, [
        el('p', { html: '<strong>SimKimia</strong> — simulasi kimia interaktif untuk Fase A sampai F.' }),
        el('p', { style: { marginBottom: '0' }, html: 'Terinspirasi pendekatan PhET Interactive Simulations. Dibuat agar bisa dijalankan sepenuhnya di peramban, tanpa server.' })
      ])
    ]));

    /* ----- mulai ----- */
    if (cfg.setup) cfg.setup(sim);
    sim.sync();
    resize();
    if (global.ResizeObserver) new ResizeObserver(resize).observe(stage);
    else global.addEventListener('resize', resize);
    if (sim.playing && cfg.update) { last = performance.now(); requestAnimationFrame(loop); }
    else frame(0, true);

    global.__sim = sim;
    return sim;
  }

  /* ---------------------------------------------------------- vektor 2D -- */

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function rndi(a, b) { return Math.floor(rnd(a, b + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  global.Sim = {
    create: create, el: el, Draw: Draw, P: P,
    fmt: fmt, sci: sci, sub: sub, sup: sup, formula: formula,
    clamp: clamp, lerp: lerp, rnd: rnd, rndi: rndi, pick: pick,
    Theme: Theme, buildTopbar: buildTopbar, themeButton: themeButton
  };

})(window);
