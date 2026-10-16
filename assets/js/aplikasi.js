/* ============================================================================
   SimKimia 3D — kerangka aplikasi satu halaman
   Mengurus: renderer, pemuatan simulasi secara dinamis, HUD kendali,
   bacaan angka, layar penuh, dan pemilih simulasi.
   ========================================================================= */

(function (global) {
  'use strict';

  const T = global.THREE;
  const S3 = global.S3;
  const $ = (s, r) => (r || document).querySelector(s);
  const el = function (tag, attrs, kids) {
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
  };

  /* ============================================================ RENDERER = */

  const kanvas = $('#panggung');
  const renderer = new T.WebGLRenderer({
    canvas: kanvas, antialias: true, alpha: false, powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = T.SRGBColorSpace;

  const kamera = new T.PerspectiveCamera(42, 1, 0.1, 400);
  const orbit = new S3.Orbit(kamera, kanvas, { jarak: 9 });

  let scene = null;
  let def = null;            // definisi simulasi aktif
  let sesi = null;           // objek sesi yang diberikan ke simulasi
  let slugAktif = null;
  let jalan = true;
  const jam = new T.Clock();

  /* =============================================================== LAYOUT */

  function ukur() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    kamera.aspect = w / h;
    kamera.updateProjectionMatrix();
    document.body.classList.toggle('sempit', w < 900);
  }
  addEventListener('resize', ukur);

  /* ========================================================= PANEL KENDALI */

  const panelKendali = $('#kendali-isi');
  const barisBaca = $('#baca');
  const nilai = {};
  const sinkron = {};   // id -> fungsi yang menyegarkan tampilan kendali

  function bangunKendali(daftar) {
    panelKendali.innerHTML = '';
    for (const k in nilai) delete nilai[k];
    for (const k in sinkron) delete sinkron[k];
    if (!daftar || !daftar.length) {
      panelKendali.appendChild(el('p', { class: 'kosong', text: 'Simulasi ini tanpa kendali — putar dan perbesar saja.' }));
      return;
    }
    daftar.forEach(function (grup) {
      const kotak = el('div', { class: 'grup' });
      if (grup.judul) kotak.appendChild(el('h3', { text: grup.judul }));
      (grup.isi || []).forEach(function (c) { kotak.appendChild(bangunSatu(c)); });
      panelKendali.appendChild(kotak);
    });
  }

  function bangunSatu(c) {
    if (c.type === 'slider') {
      nilai[c.id] = c.value;
      const nilaiTeks = el('span', { class: 'nilai' });
      const input = el('input', {
        type: 'range', min: c.min, max: c.max, step: c.step || 0.01, value: c.value,
        oninput: function () {
          nilai[c.id] = parseFloat(input.value);
          tulisNilai();
          panggil('ubah', c.id);
        }
      });
      function tulisNilai() {
        const v = nilai[c.id];
        nilaiTeks.textContent = c.format ? c.format(v)
          : (c.dec !== undefined ? v.toFixed(c.dec).replace('.', ',') : String(v)) + (c.unit || '');
      }
      tulisNilai();
      sinkron[c.id] = function (v) {
        input.value = v; nilai[c.id] = parseFloat(input.value); tulisNilai();
      };
      return el('div', { class: 'ctl ctl-slider' }, [
        el('div', { class: 'ctl-kepala' }, [el('label', { text: c.label }), nilaiTeks]),
        input
      ]);
    }

    if (c.type === 'toggle') {
      nilai[c.id] = !!c.value;
      const inp = el('input', {
        type: 'checkbox', checked: !!c.value,
        onchange: function () { nilai[c.id] = inp.checked; panggil('ubah', c.id); }
      });
      sinkron[c.id] = function (v) { inp.checked = !!v; nilai[c.id] = !!v; };
      return el('label', { class: 'ctl ctl-toggle' }, [
        inp, el('span', { class: 'sakelar' }), el('span', { text: c.label })
      ]);
    }

    if (c.type === 'select') {
      nilai[c.id] = c.value;
      const sel = el('select', {
        onchange: function () {
          const o = c.options[sel.selectedIndex];
          nilai[c.id] = o.value;
          panggil('ubah', c.id);
        }
      }, c.options.map(function (o) {
        return el('option', { value: String(o.value), text: o.label, selected: o.value === c.value });
      }));
      sinkron[c.id] = function (v) {
        const i = c.options.findIndex(function (o) { return String(o.value) === String(v); });
        if (i >= 0) { sel.selectedIndex = i; nilai[c.id] = c.options[i].value; }
      };
      return el('div', { class: 'ctl ctl-select' }, [
        el('label', { text: c.label }), sel
      ]);
    }

    if (c.type === 'segment') {
      nilai[c.id] = c.value;
      const tombol = c.options.map(function (o) {
        return el('button', {
          type: 'button', class: o.value === c.value ? 'aktif' : '', text: o.label,
          onclick: function () {
            nilai[c.id] = o.value;
            Array.from(bar.children).forEach(function (b) { b.classList.remove('aktif'); });
            this.classList.add('aktif');
            panggil('ubah', c.id);
          }
        });
      });
      const bar = el('div', { class: 'seg' }, tombol);
      sinkron[c.id] = function (v) {
        const i = c.options.findIndex(function (o) { return String(o.value) === String(v); });
        if (i < 0) return;
        nilai[c.id] = c.options[i].value;
        Array.from(bar.children).forEach(function (b, j) { b.classList.toggle('aktif', j === i); });
      };
      return el('div', { class: 'ctl ctl-seg' }, [
        c.label ? el('label', { text: c.label }) : null, bar
      ]);
    }

    if (c.type === 'buttons') {
      return el('div', { class: 'ctl ctl-btn' }, [
        c.label ? el('label', { text: c.label }) : null,
        el('div', { class: 'tombol-baris' }, c.items.map(function (b) {
          return el('button', {
            type: 'button', class: b.utama ? 'utama' : '', text: b.label,
            onclick: function () { b.klik && b.klik(sesi); }
          });
        }))
      ]);
    }
    return el('div');
  }

  function bangunBaca(daftar) {
    barisBaca.innerHTML = '';
    if (!daftar || !daftar.length) { barisBaca.style.display = 'none'; return; }
    barisBaca.style.display = '';
    daftar.forEach(function (b) {
      barisBaca.appendChild(el('div', { class: 'baca-sel', 'data-id': b.id }, [
        el('span', { class: 'baca-label', text: b.label }),
        el('span', { class: 'baca-nilai', text: '—' })
      ]));
    });
  }

  /* =============================================================== SESI = */

  function buatSesi() {
    return {
      T: T, S3: S3,
      scene: scene,
      kamera: kamera,
      renderer: renderer,
      orbit: orbit,
      data: {},
      waktu: 0,
      get: function (id) { return nilai[id]; },
      set: function (id, v) {
        if (sinkron[id]) sinkron[id](v); else nilai[id] = v;
        panggil('ubah', id);
      },
      /** Setel tanpa memicu ubah() — berguna di dalam ubah() sendiri. */
      setDiam: function (id, v) {
        if (sinkron[id]) sinkron[id](v); else nilai[id] = v;
      },
      tambah: function (o) { scene.add(o); return o; },
      hapus: function (o) { scene.remove(o); S3.buangObjek(o); },
      baca: function (id, teks, nada) {
        const sel = barisBaca.querySelector('[data-id="' + id + '"]');
        if (!sel) return;
        sel.querySelector('.baca-nilai').textContent = teks;
        sel.className = 'baca-sel' + (nada ? ' nada-' + nada : '');
      },
      pesan: function (teks, lama) {
        const t = $('#pesan');
        t.textContent = teks;
        t.classList.add('tampil');
        clearTimeout(t._jam);
        t._jam = setTimeout(function () { t.classList.remove('tampil'); }, (lama || 2.6) * 1000);
      },
      jeda: function (v) { jalan = !v; perbaruiTombolJalan(); }
    };
  }

  function panggil(nama, arg) {
    if (!def || !def[nama]) return;
    try { def[nama](sesi, arg); }
    catch (e) { console.error('[' + slugAktif + '.' + nama + ']', e); }
  }

  /* ====================================================== MUAT SIMULASI = */

  const sudahDimuat = {};

  function muatBerkas(slug) {
    return new Promise(function (ok, gagal) {
      if (sudahDimuat[slug] || global.Sim3D.ambil(slug)) { ok(); return; }
      const s = document.createElement('script');
      s.src = 'sims/' + slug + '/sim.js';
      s.onload = function () { sudahDimuat[slug] = true; ok(); };
      s.onerror = function () { gagal(new Error('Gagal memuat sims/' + slug + '/sim.js')); };
      document.head.appendChild(s);
    });
  }

  function bersihkanScene() {
    if (!scene) return;
    panggil('bersih');
    for (let i = scene.children.length - 1; i >= 0; i--) {
      const o = scene.children[i];
      scene.remove(o);
      S3.buangObjek(o);
    }
  }

  let memuatSedang = false;

  async function mulai(slug, diamDiam) {
    const entri = (global.KATALOG || []).find(function (s) { return s.slug === slug; });
    if (!entri) { console.warn('slug tak dikenal:', slug); return; }
    if (memuatSedang) return;
    memuatSedang = true;
    $('#memuat').classList.add('tampil');

    try {
      await muatBerkas(slug);
    } catch (e) {
      $('#memuat').classList.remove('tampil');
      memuatSedang = false;
      alert('Tidak bisa memuat simulasi ini: ' + e.message);
      return;
    }

    const d = global.Sim3D.ambil(slug);
    if (!d) {
      $('#memuat').classList.remove('tampil');
      memuatSedang = false;
      console.warn('sim.js tidak mendaftarkan apa pun:', slug);
      return;
    }

    bersihkanScene();
    scene = new T.Scene();
    scene.background = new T.Color(d.latar !== undefined ? d.latar : 0x0b1016);
    if (d.kabut !== false) {
      scene.fog = new T.Fog(d.latar !== undefined ? d.latar : 0x0b1016, 16, 54);
    }

    def = d;
    slugAktif = slug;
    sesi = buatSesi();
    sesi.entri = entri;

    scene.environment = S3.lingkungan(renderer);
    scene.environmentIntensity = d.lingkunganKuat !== undefined ? d.lingkunganKuat : 1;
    S3.rigCahaya(scene, d.cahaya || {});

    bangunKendali(d.kendali);
    bangunBaca(d.baca);

    const k = d.kamera || {};
    orbit.set({
      jarak: k.jarak || 9,
      theta: k.theta !== undefined ? k.theta : 0.62,
      phi: k.phi !== undefined ? k.phi : 1.16,
      target: k.target || [0, k.targetY || 0, 0],
      jarakMin: k.jarakMin || 1.6,
      jarakMaks: k.jarakMaks || 44,
      putarOtomatis: k.putarOtomatis !== undefined ? k.putarOtomatis : true,
      lajuPutar: k.lajuPutar !== undefined ? k.lajuPutar : 0.1
    });
    orbit.simpanAwal();
    $('#btn-putar').classList.toggle('aktif', orbit.putarOtomatis);

    sesi.waktu = 0;
    panggil('bangun');
    panggil('bacaUbah');

    // kepala
    $('#judul').textContent = entri.judul;
    const lencana = $('#fase-lencana');
    lencana.textContent = 'Fase ' + entri.fase;
    lencana.style.background = (global.FASE_INFO[entri.fase] || {}).warna || '#4fd1c0';
    $('#jenjang').textContent = entri.jenjang || '';
    document.title = entri.judul + ' — SimKimia 3D';

    // simpan di hash tanpa memuat ulang halaman
    if (!diamDiam) {
      history.replaceState(null, '', '#' + slug);
    }
    try { localStorage.setItem('simkimia3d-terakhir', slug); } catch (e) { /* mode privat */ }

    jalan = true;
    perbaruiTombolJalan();
    $('#memuat').classList.remove('tampil');
    memuatSedang = false;
    tandaiPemilih();
  }

  /* ========================================================= GELUNG UTAMA */

  function bingkai() {
    requestAnimationFrame(bingkai);
    const dt = Math.min(jam.getDelta(), 0.05);
    orbit.perbarui(dt);
    if (scene) {
      if (jalan && def) {
        sesi.waktu += dt;
        panggil('langkah', dt);
        panggil('bacaUbah');
      }
      hadapkanPanel();
      renderer.render(scene, kamera);
    }
  }

  /* Panel grafik dibuat sejajar bidang pandang kamera supaya sisinya tetap
     lurus dan terbaca dari sudut pandang mana pun — bukan sekadar menoleh,
     sebab bidang yang hanya menoleh masih tampak miring di tepi layar. */
  function hadapkanPanel() {
    scene.traverse(function (o) {
      if (!o.userData || !o.userData.hadapKamera || !o.visible) return;
      // halus, agar tidak menyentak saat kamera bergerak cepat
      o.quaternion.slerp(kamera.quaternion, 0.22);
    });
  }

  /* ============================================================== KENDALI */

  function perbaruiTombolJalan() {
    const b = $('#btn-jalan');
    b.classList.toggle('jeda', !jalan);
    b.title = jalan ? 'Jeda (Spasi)' : 'Jalan (Spasi)';
    b.querySelector('.ikon').innerHTML = jalan
      ? '<rect x="6" y="5" width="4" height="14" rx="1.2"/><rect x="14" y="5" width="4" height="14" rx="1.2"/>'
      : '<path d="M7 4.6 19 12 7 19.4z"/>';
  }

  function layarPenuh() {
    const d = document;
    if (!d.fullscreenElement && !d.webkitFullscreenElement) {
      const e = d.documentElement;
      (e.requestFullscreen || e.webkitRequestFullscreen).call(e).catch(function () {});
    } else {
      (d.exitFullscreen || d.webkitExitFullscreen).call(d);
    }
  }
  document.addEventListener('fullscreenchange', function () {
    const penuh = !!document.fullscreenElement;
    document.body.classList.toggle('layar-penuh', penuh);
    $('#btn-penuh').classList.toggle('aktif', penuh);
  });

  /* ======================================================= PEMILIH SIM = */

  const pemilih = $('#pemilih');
  let pemilihTerbuka = false;

  function bangunPemilih() {
    const isi = $('#pemilih-isi');
    isi.innerHTML = '';
    const fase = ['A', 'B', 'C', 'D', 'E', 'F'];
    fase.forEach(function (f) {
      const info = global.FASE_INFO[f];
      const daftar = global.KATALOG.filter(function (s) { return s.fase === f; });
      if (!daftar.length) return;
      isi.appendChild(el('div', { class: 'pem-fase', 'data-fase': f }, [
        el('span', { class: 'pem-lencana', style: { background: info.warna }, text: f }),
        el('span', { class: 'pem-fase-nama', text: info.label + ' · ' + info.jenjang }),
        el('span', { class: 'pem-jml', text: daftar.length + ' simulasi' })
      ]));
      const kisi = el('div', { class: 'pem-kisi' });
      daftar.forEach(function (s) {
        kisi.appendChild(el('button', {
          type: 'button', class: 'pem-kartu', 'data-slug': s.slug,
          'data-cari': (s.judul + ' ' + (s.topik || []).join(' ') + ' ' + (s.ringkas || '')).toLowerCase(),
          onclick: function () { pilih(s.slug); }
        }, [
          el('span', { class: 'pem-garis', style: { background: info.warna } }),
          el('span', { class: 'pem-judul', text: s.judul }),
          el('span', { class: 'pem-topik', text: (s.topik || []).join(' · ') })
        ]));
      });
      isi.appendChild(kisi);
    });
  }

  function pilih(slug) {
    tutupPemilih();
    mulai(slug);
  }

  function tandaiPemilih() {
    pemilih.querySelectorAll('.pem-kartu').forEach(function (k) {
      k.classList.toggle('sekarang', k.dataset.slug === slugAktif);
    });
  }

  function bukaPemilih() {
    pemilihTerbuka = true;
    pemilih.classList.add('tampil');
    orbit.aktif = false;
    tandaiPemilih();
    const c = $('#pem-cari');
    c.value = '';
    saringPemilih('');
    setTimeout(function () { c.focus(); }, 60);
  }
  function tutupPemilih() {
    pemilihTerbuka = false;
    pemilih.classList.remove('tampil');
    orbit.aktif = true;
  }
  function togglePemilih() { pemilihTerbuka ? tutupPemilih() : bukaPemilih(); }

  function saringPemilih(q) {
    q = (q || '').trim().toLowerCase();
    const kisi = pemilih.querySelectorAll('.pem-kisi');
    const kepala = pemilih.querySelectorAll('.pem-fase');
    kisi.forEach(function (g, i) {
      let ada = 0;
      g.querySelectorAll('.pem-kartu').forEach(function (k) {
        const cocok = !q || k.dataset.cari.indexOf(q) >= 0;
        k.style.display = cocok ? '' : 'none';
        if (cocok) ada++;
      });
      g.style.display = ada ? '' : 'none';
      if (kepala[i]) kepala[i].style.display = ada ? '' : 'none';
    });
  }

  /* ==================================================== LANGKAH BERIKUT = */

  function geserSim(arah) {
    const i = global.KATALOG.findIndex(function (s) { return s.slug === slugAktif; });
    if (i < 0) return;
    const j = (i + arah + global.KATALOG.length) % global.KATALOG.length;
    mulai(global.KATALOG[j].slug);
  }

  /* ============================================================== PAPAN = */

  addEventListener('keydown', function (e) {
    const diKolom = /^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName);

    if (e.key === 'Escape') {
      if (pemilihTerbuka) { tutupPemilih(); e.preventDefault(); }
      else if (!document.fullscreenElement) { bukaPemilih(); e.preventDefault(); }
      return;
    }
    if (pemilihTerbuka && diKolom && e.key !== 'Enter') return;
    if (pemilihTerbuka && e.key === 'Enter') {
      const pertama = pemilih.querySelector('.pem-kartu:not([style*="none"])');
      if (pertama) pilih(pertama.dataset.slug);
      e.preventDefault();
      return;
    }
    if (diKolom) return;

    const k = e.key.toLowerCase();
    if (k === 'f') { layarPenuh(); e.preventDefault(); }
    else if (k === 's' || k === 'o') { togglePemilih(); e.preventDefault(); }
    else if (k === ' ') { jalan = !jalan; perbaruiTombolJalan(); e.preventDefault(); }
    else if (k === 'c') { document.body.classList.toggle('sembunyi-kendali'); e.preventDefault(); }
    else if (k === 'h') { document.body.classList.toggle('sembunyi-ui'); e.preventDefault(); }
    else if (k === 'r') { orbit.pulihkan(); e.preventDefault(); }
    else if (k === 'p') {
      orbit.putarOtomatis = !orbit.putarOtomatis;
      $('#btn-putar').classList.toggle('aktif', orbit.putarOtomatis);
      e.preventDefault();
    }
    else if (k === 'arrowright' || k === 'pagedown') { geserSim(1); e.preventDefault(); }
    else if (k === 'arrowleft' || k === 'pageup') { geserSim(-1); e.preventDefault(); }
  });

  /* ================================================================ IKAT = */

  $('#btn-penuh').onclick = layarPenuh;
  $('#btn-pemilih').onclick = togglePemilih;
  $('#btn-pemilih-2').onclick = togglePemilih;
  $('#btn-jalan').onclick = function () { jalan = !jalan; perbaruiTombolJalan(); };
  $('#btn-ulang').onclick = function () { if (slugAktif) mulai(slugAktif, true); };
  $('#btn-kamera').onclick = function () { orbit.pulihkan(); };
  $('#btn-putar').onclick = function () {
    orbit.putarOtomatis = !orbit.putarOtomatis;
    $('#btn-putar').classList.toggle('aktif', orbit.putarOtomatis);
  };
  $('#btn-sembunyi').onclick = function () {
    document.body.classList.toggle('sembunyi-kendali');
  };
  $('#btn-tutup-pemilih').onclick = tutupPemilih;
  $('#btn-sebelum').onclick = function () { geserSim(-1); };
  $('#btn-sesudah').onclick = function () { geserSim(1); };
  $('#pem-cari').addEventListener('input', function () { saringPemilih(this.value); });
  pemilih.addEventListener('click', function (e) { if (e.target === pemilih) tutupPemilih(); });

  /* ============================================================== MULAI = */

  ukur();
  bangunPemilih();
  perbaruiTombolJalan();
  bingkai();

  let awal = (location.hash || '').replace('#', '');
  if (!awal) { try { awal = localStorage.getItem('simkimia3d-terakhir') || ''; } catch (e) {} }
  if (!awal || !global.KATALOG.some(function (s) { return s.slug === awal; })) {
    awal = global.KATALOG[0].slug;
  }
  mulai(awal);

  addEventListener('hashchange', function () {
    const s = (location.hash || '').replace('#', '');
    if (s && s !== slugAktif && global.KATALOG.some(function (k) { return k.slug === s; })) mulai(s);
  });

  global.App = { mulai: mulai, bukaPemilih: bukaPemilih, geserSim: geserSim };

})(window);
