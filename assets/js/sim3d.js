/* ============================================================================
   SimKimia 3D — mesin presentasi
   Satu halaman, satu kanvas WebGL. Simulasi dimuat dan ditukar di tempat,
   sehingga mode layar penuh tidak pernah terputus.
   ========================================================================= */

(function (global) {
  'use strict';

  const T = global.THREE;

  /* ========================================================= WARNA UNSUR = */
  /* Skema CPK, dengan jari-jari relatif untuk tampilan bola-dan-tongkat. */
  const UNSUR = {
    H:  { w: 0xf4f6f8, r: 0.30, n: 'Hidrogen' },
    C:  { w: 0x3a4149, r: 0.52, n: 'Karbon' },
    N:  { w: 0x3b63d0, r: 0.50, n: 'Nitrogen' },
    O:  { w: 0xe0432f, r: 0.49, n: 'Oksigen' },
    F:  { w: 0x6fd07a, r: 0.44, n: 'Fluor' },
    Na: { w: 0x9a5fe0, r: 0.72, n: 'Natrium' },
    Mg: { w: 0x5fd06a, r: 0.66, n: 'Magnesium' },
    Al: { w: 0xb8a0a0, r: 0.64, n: 'Aluminium' },
    Si: { w: 0xd0a070, r: 0.62, n: 'Silikon' },
    P:  { w: 0xf0902a, r: 0.58, n: 'Fosforus' },
    S:  { w: 0xe8d048, r: 0.56, n: 'Belerang' },
    Cl: { w: 0x4fd06a, r: 0.54, n: 'Klorin' },
    K:  { w: 0x8040d0, r: 0.80, n: 'Kalium' },
    Ca: { w: 0x40c060, r: 0.74, n: 'Kalsium' },
    Fe: { w: 0xd06028, r: 0.66, n: 'Besi' },
    Cu: { w: 0xc87838, r: 0.64, n: 'Tembaga' },
    Zn: { w: 0x7c8fa0, r: 0.64, n: 'Seng' },
    Ag: { w: 0xc8ccd0, r: 0.70, n: 'Perak' },
    Au: { w: 0xe0b020, r: 0.70, n: 'Emas' },
    Br: { w: 0xa03020, r: 0.60, n: 'Brom' },
    I:  { w: 0x8030c0, r: 0.68, n: 'Iodin' },
    He: { w: 0x7fe3d6, r: 0.36, n: 'Helium' },
    Ne: { w: 0x5fd0e0, r: 0.38, n: 'Neon' },
    Ar: { w: 0x5fb0e0, r: 0.42, n: 'Argon' },
    Pb: { w: 0x60707c, r: 0.76, n: 'Timbal' },
    U:  { w: 0x40a060, r: 0.82, n: 'Uranium' },
    X:  { w: 0x8d939a, r: 0.55, n: 'Lain' }
  };

  const PALET = {
    aksen:   0x4fd1c0,
    aksen2:  0x7fe3d6,
    biru:    0x5b9bf5,
    jingga:  0xf0a94a,
    merah:   0xef6a52,
    hijau:   0x6fcf7f,
    ungu:    0xb795f0,
    kuning:  0xf0c04a,
    merahMuda: 0xf0718f,
    putih:   0xf2f5f7,
    kelabu:  0x8d939a,
    gelap:   0x1b2228,
    panas:   0xef7a44,
    dingin:  0x4a90d9,
    asam:    0xef4e4e,
    basa:    0x4f7ce0,
    netral:  0x6fcf7f
  };

  /* ================================================================ UTIL = */

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const acak = (a, b) => a + Math.random() * (b - a);
  const pilihAcak = (arr) => arr[Math.floor(Math.random() * arr.length)];

  function fmt(v, d) {
    if (!isFinite(v)) return '—';
    d = d === undefined ? 2 : d;
    return v.toFixed(d).replace('.', ',');
  }
  function fmtRapi(v) {
    if (!isFinite(v)) return '—';
    const a = Math.abs(v);
    if (a !== 0 && (a < 0.001 || a >= 1e6)) {
      const e = v.toExponential(2).split('e');
      return e[0].replace('.', ',') + '×10' + sup(e[1].replace('+', ''));
    }
    if (Number.isInteger(v)) return String(v);
    return v.toFixed(a < 1 ? 3 : a < 10 ? 2 : 1).replace('.', ',');
  }
  const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
  const SUB = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉' };
  const sup = (s) => String(s).split('').map(c => SUP[c] || c).join('');
  const sub = (s) => String(s).split('').map(c => SUB[c] || c).join('');

  /* ========================================================= BAHAN (MAT) = */

  const _cacheBola = {};
  function matBola(warna, o) {
    o = o || {};
    const kunci = warna + '|' + JSON.stringify(o);
    if (_cacheBola[kunci] && !o.unik) return _cacheBola[kunci];
    const m = new T.MeshPhysicalMaterial({
      color: warna,
      roughness: o.roughness !== undefined ? o.roughness : 0.24,
      metalness: o.metalness !== undefined ? o.metalness : 0.05,
      // clearcoat + pantulan lingkungan kuat = kilau kecil tajam di bola,
      // seperti model molekul plastik yang dipotret di studio
      clearcoat: o.clearcoat !== undefined ? o.clearcoat : 0.85,
      clearcoatRoughness: 0.12,
      sheen: 0.25,
      sheenRoughness: 0.6,
      sheenColor: new T.Color(0xffffff),
      emissive: o.emissive !== undefined ? o.emissive : warna,
      emissiveIntensity: o.emissiveIntensity !== undefined ? o.emissiveIntensity : 0.035,
      envMapIntensity: o.envMapIntensity !== undefined ? o.envMapIntensity : 1.45,
      transparent: o.opacity !== undefined && o.opacity < 1,
      opacity: o.opacity !== undefined ? o.opacity : 1
    });
    if (!o.unik) _cacheBola[kunci] = m;
    return m;
  }

  /**
   * Kaca alat laboratorium.
   *
   * Memakai pantulan lingkungan yang kuat dengan kekasaran sangat rendah,
   * bukan `transmission`. Hasilnya: tepi wadah menyala seperti kaca sungguhan
   * (efek Fresnel pada sudut lewat), sementara isinya tetap terlihat jelas —
   * dan tetap ringan sehingga lancar di komputer sekolah.
   * `{ bias: true }` memakai transmission three.js bila memang diinginkan
   * pembiasan sungguhan (lebih berat, isi wadah sedikit terdistorsi).
   */
  function matKaca(o) {
    o = o || {};
    if (o.bias) {
      return new T.MeshPhysicalMaterial({
        color: o.color !== undefined ? o.color : 0xffffff,
        roughness: o.roughness !== undefined ? o.roughness : 0.04,
        metalness: 0,
        transmission: o.transmission !== undefined ? o.transmission : 1,
        thickness: o.thickness !== undefined ? o.thickness : 0.22,
        ior: 1.5,
        transparent: true, opacity: 1,
        clearcoat: 1, clearcoatRoughness: 0.02,
        specularIntensity: 1,
        envMapIntensity: o.envMapIntensity !== undefined ? o.envMapIntensity : 1.1,
        side: T.DoubleSide, depthWrite: false
      });
    }
    return new T.MeshPhysicalMaterial({
      color: o.color !== undefined ? o.color : 0xffffff,
      roughness: o.roughness !== undefined ? o.roughness : 0.02,
      metalness: 0,
      // pembiasan sungguhan: dinding kaca jadi bening di tengah dan
      // menyala di tepi, persis perilaku kaca laboratorium
      transmission: o.transmission !== undefined ? o.transmission : 1,
      thickness: o.thickness !== undefined ? o.thickness : 0.05,
      attenuationColor: new T.Color(0xcfeaff),
      attenuationDistance: 2.4,
      ior: 1.5,
      transparent: true,
      opacity: o.opacity !== undefined ? o.opacity : 1,
      specularIntensity: 1,
      // tanpa clearcoat: satu lapis kilau saja, supaya pantulannya berupa
      // garis terang yang tegas — bukan sapuan abu-abu selebar dinding
      clearcoat: 0,
      envMapIntensity: o.envMapIntensity !== undefined ? o.envMapIntensity : 1.05,
      side: T.DoubleSide,
      depthWrite: false
    });
  }

  /**
   * Opasitas zat cair yang menyesuaikan warnanya.
   * Larutan yang warnanya sangat pucat (mis. 0xeaf2f6 untuk larutan tak
   * berwarna) dibuat jauh lebih bening, sehingga terlihat seperti air —
   * bukan seperti susu. Larutan pekat tetap pekat.
   */
  const _hsl = { h: 0, s: 0, l: 0 };
  function opasitasCair(warna, dasar) {
    dasar = dasar === undefined ? 0.78 : dasar;
    new T.Color(warna).getHSL(_hsl);
    // makin terang dan makin pucat → makin bening
    const dariTerang = clamp(1 - (_hsl.l - 0.72) / 0.26, 0, 1);
    const dariPekat = clamp(_hsl.s * 1.8, 0, 1);
    const f = clamp(Math.max(dariTerang, dariPekat * 0.9), 0.3, 1);
    return dasar * f;
  }

  function matCairan(warna, o) {
    o = o || {};
    return new T.MeshPhysicalMaterial({
      color: warna,
      roughness: o.roughness !== undefined ? o.roughness : 0.08,
      metalness: 0,
      transmission: o.transmission !== undefined ? o.transmission : 0,
      thickness: 1.2,
      ior: 1.333,
      transparent: true,
      opacity: o.opacity !== undefined ? o.opacity : opasitasCair(warna),
      clearcoat: 0.65,
      clearcoatRoughness: 0.06,
      specularIntensity: 1,
      envMapIntensity: o.envMapIntensity !== undefined ? o.envMapIntensity : 1.35,
      side: T.DoubleSide
    });
  }

  /** Permukaan atas zat cair: lebih mengilap dan sedikit lebih terang. */
  function matPermukaanCair(warna, o) {
    o = o || {};
    return new T.MeshPhysicalMaterial({
      color: new T.Color(warna).lerp(new T.Color(0xffffff), 0.05),
      // cukup kasar dan tipis: permukaan hanya memberi kilau lembut,
      // warna larutan di bawahnya tetap yang dominan terlihat
      roughness: 0.38,
      metalness: 0,
      transparent: true,
      opacity: o.opacity !== undefined ? o.opacity : 0.26,
      ior: 1.333,
      clearcoat: 0,
      specularIntensity: 0.35,
      envMapIntensity: 0.22,
      side: T.DoubleSide
    });
  }

  /* Peta kekasaran bergaris halus — memberi kesan logam yang disikat,
     jauh lebih meyakinkan daripada logam bening sempurna. */
  let _petaSikat = null;
  function petaSikat() {
    if (_petaSikat) return _petaSikat;
    const n = 256;
    const cv = document.createElement('canvas');
    cv.width = n; cv.height = n;
    const ct = cv.getContext('2d');
    ct.fillStyle = '#808080';
    ct.fillRect(0, 0, n, n);
    for (let i = 0; i < 1400; i++) {
      const y = Math.random() * n;
      const a = 0.04 + Math.random() * 0.09;
      ct.strokeStyle = 'rgba(' + (Math.random() < 0.5 ? '255,255,255,' : '0,0,0,') + a + ')';
      ct.lineWidth = 0.5 + Math.random() * 1.4;
      ct.beginPath();
      ct.moveTo(0, y);
      ct.lineTo(n, y + (Math.random() - 0.5) * 2);
      ct.stroke();
    }
    _petaSikat = new T.CanvasTexture(cv);
    _petaSikat.wrapS = _petaSikat.wrapT = T.RepeatWrapping;
    _petaSikat.repeat.set(3, 3);
    return _petaSikat;
  }

  function matLogam(warna, o) {
    o = o || {};
    const m = new T.MeshPhysicalMaterial({
      color: warna,
      roughness: o.roughness !== undefined ? o.roughness : 0.26,
      metalness: o.metalness !== undefined ? o.metalness : 0.95,
      clearcoat: o.clearcoat !== undefined ? o.clearcoat : 0.18,
      clearcoatRoughness: 0.3,
      envMapIntensity: o.envMapIntensity !== undefined ? o.envMapIntensity : 1.5
    });
    if (o.sikat !== false) m.roughnessMap = petaSikat();
    return m;
  }

  function matNyala(warna, opacity) {
    return new T.MeshBasicMaterial({
      color: warna, transparent: true, opacity: opacity,
      blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide
    });
  }

  /* ====================================================== GEOMETRI DASAR = */

  const _geoBola = {};
  function geoBola(seg) {
    seg = seg || 32;
    if (!_geoBola[seg]) _geoBola[seg] = new T.SphereGeometry(1, seg, Math.round(seg * 0.75));
    return _geoBola[seg];
  }
  let _geoSilinder = null;
  function geoSilinder() {
    if (!_geoSilinder) _geoSilinder = new T.CylinderGeometry(1, 1, 1, 24, 1, true);
    return _geoSilinder;
  }

  /** Bola berlabel unsur. */
  function atom(simbol, pos, opt) {
    opt = opt || {};
    const u = UNSUR[simbol] || UNSUR.X;
    const r = (opt.r !== undefined ? opt.r : u.r) * (opt.skala || 1);
    const m = new T.Mesh(geoBola(opt.seg || 32),
      matBola(opt.warna !== undefined ? opt.warna : u.w, opt));
    m.scale.setScalar(r);
    if (pos) m.position.set(pos[0] || 0, pos[1] || 0, pos[2] || 0);
    m.castShadow = true; m.receiveShadow = true;
    m.userData.simbol = simbol;
    m.userData.r = r;
    return m;
  }

  /** Tongkat ikatan antara dua titik. orde 1/2/3 menggambar 1/2/3 batang. */
  function ikatan(a, b, opt) {
    opt = opt || {};
    const g = new T.Group();
    const va = a.isVector3 ? a : new T.Vector3(a[0], a[1], a[2]);
    const vb = b.isVector3 ? b : new T.Vector3(b[0], b[1], b[2]);
    const arah = new T.Vector3().subVectors(vb, va);
    const panjang = arah.length();
    const orde = opt.orde || 1;
    const tebal = opt.tebal || 0.085;
    const pisah = opt.pisah || tebal * 2.4;
    const mat = opt.mat || new T.MeshPhysicalMaterial({
      color: opt.warna !== undefined ? opt.warna : 0x9fabb8,
      roughness: 0.3, metalness: 0.3,
      clearcoat: 0.5, clearcoatRoughness: 0.2,
      envMapIntensity: 1.3
    });
    // sumbu tegak lurus untuk menyebar ikatan rangkap
    const normal = new T.Vector3(0, 1, 0);
    if (Math.abs(arah.clone().normalize().dot(normal)) > 0.95) normal.set(1, 0, 0);
    const samping = new T.Vector3().crossVectors(arah, normal).normalize();

    for (let i = 0; i < orde; i++) {
      const off = (i - (orde - 1) / 2) * pisah;
      const batang = new T.Mesh(geoSilinder(), mat);
      batang.scale.set(tebal, panjang, tebal);
      batang.position.copy(va).add(vb).multiplyScalar(0.5)
        .add(samping.clone().multiplyScalar(off));
      batang.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), arah.clone().normalize());
      batang.castShadow = true;
      g.add(batang);
    }
    g.userData.perbarui = function (na, nb) {
      const v1 = na.isVector3 ? na : new T.Vector3(na[0], na[1], na[2]);
      const v2 = nb.isVector3 ? nb : new T.Vector3(nb[0], nb[1], nb[2]);
      const d = new T.Vector3().subVectors(v2, v1);
      const p = d.length();
      const nn = new T.Vector3(0, 1, 0);
      if (Math.abs(d.clone().normalize().dot(nn)) > 0.95) nn.set(1, 0, 0);
      const sp = new T.Vector3().crossVectors(d, nn).normalize();
      g.children.forEach(function (c, i) {
        const off = (i - (g.children.length - 1) / 2) * pisah;
        c.scale.set(tebal, p, tebal);
        c.position.copy(v1).add(v2).multiplyScalar(0.5).add(sp.clone().multiplyScalar(off));
        c.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d.clone().normalize());
      });
    };
    return g;
  }

  /**
   * Molekul dari definisi ringkas.
   * def = { atom: [['O',0,0,0], ['H',0.76,0.59,0]], ikatan: [[0,1,1]] }
   */
  function molekul(def, opt) {
    opt = opt || {};
    const g = new T.Group();
    const pos = [];
    g.userData.atom = [];
    def.atom.forEach(function (a) {
      const p = new T.Vector3(a[1], a[2], a[3] || 0);
      pos.push(p);
      const m = atom(a[0], [p.x, p.y, p.z],
        { skala: opt.skalaAtom || (opt.tongkat ? 0.42 : 1) });
      g.add(m);
      g.userData.atom.push(m);
    });
    (def.ikatan || []).forEach(function (b) {
      g.add(ikatan(pos[b[0]], pos[b[1]], { orde: b[2] || 1, tebal: opt.tebal }));
    });
    g.userData.pos = pos;
    return g;
  }

  /* ===================================================== ALAT LABORATORIUM */

  /** Gelas kimia: dinding kaca + cairan yang tingginya bisa diatur. */
  function gelas(opt) {
    opt = opt || {};
    const R = opt.r || 1.1, H = opt.h || 1.8, tebal = 0.045;
    const g = new T.Group();
    if (opt.bayangan !== false) g.add(bayanganKontak({ r: R * 1.7, y: -0.03, kuat: 0.72 }));

    const profil = [];
    profil.push(new T.Vector2(0, 0));
    profil.push(new T.Vector2(R, 0));
    profil.push(new T.Vector2(R, H));
    profil.push(new T.Vector2(R + tebal, H));
    profil.push(new T.Vector2(R + tebal, 0 - tebal));
    profil.push(new T.Vector2(0, 0 - tebal));
    const dinding = new T.Mesh(new T.LatheGeometry(profil, 56), matKaca());
    dinding.renderOrder = 2;
    g.add(dinding);

    // cairan
    const cair = new T.Mesh(
      new T.CylinderGeometry(R - 0.012, R - 0.012, 1, 48, 1, false),
      matCairan(opt.warna !== undefined ? opt.warna : 0x4a8fd0,
        { opacity: opt.opacity, transmission: opt.transmission })
    );
    cair.renderOrder = 1;
    g.add(cair);

    // permukaan atas + meniskus: dua bagian kecil yang paling menentukan
    // apakah zat cair terbaca sebagai cairan sungguhan
    const atas = permukaanCair(R - 0.012,
      opt.warna !== undefined ? opt.warna : 0x4a8fd0);
    atas.userData.ikutWarna(cair.material);
    g.add(atas);

    g.userData.R = R; g.userData.H = H;
    g.userData.cair = cair;
    g.userData.atas = atas;
    /** Atur kebeningan zat cair; permukaan atasnya ikut menyesuaikan. */
    g.userData.setOpasitas = function (o) {
      cair.userData.opasitasTetap = true;
      cair.material.opacity = o;
      atas.userData.setOpasitas(o);
    };
    /** level 0..1 */
    g.userData.setLevel = function (level, warna) {
      const t = clamp(level, 0, 1) * H;
      const ada = t > 0.012;
      cair.visible = ada;
      atas.visible = ada;
      cair.scale.y = Math.max(0.001, t);
      cair.position.y = t / 2;
      atas.position.y = t;
      if (warna !== undefined) {
        cair.material.color.setHex(warna);
        if (!cair.userData.opasitasTetap) cair.material.opacity = opasitasCair(warna);
        atas.userData.setWarna(warna);
      }
    };
    g.userData.setLevel(opt.level !== undefined ? opt.level : 0.6);
    return g;
  }

  /**
   * Permukaan atas zat cair: cakram mengilap + cincin meniskus yang sedikit
   * naik di tepi, persis seperti air yang membasahi dinding kaca.
   */
  function permukaanCair(r, warna) {
    const g = new T.Group();
    const cakram = new T.Mesh(
      new T.CircleGeometry(r, 48),
      matPermukaanCair(warna, { opacity: 0.92 })
    );
    cakram.rotation.x = -Math.PI / 2;
    g.add(cakram);

    // meniskus: cincin tipis sedikit lebih terang di tepi
    const men = new T.Mesh(
      new T.TorusGeometry(r * 0.99, r * 0.016, 8, 48),
      new T.MeshPhysicalMaterial({
        color: new T.Color(warna).lerp(new T.Color(0xffffff), 0.22),
        roughness: 0.05, metalness: 0,
        transparent: true, opacity: 0.45,
        envMapIntensity: 1.1
      })
    );
    men.rotation.x = Math.PI / 2;
    men.position.y = r * 0.008;
    g.add(men);

    g.userData.setWarna = function (w) {
      cakram.material.color.set(w);
      men.material.color.set(new T.Color(w).lerp(new T.Color(0xffffff), 0.22));
    };
    /**
     * Pakai objek warna milik material cairan secara langsung. Dengan begitu
     * permukaan ikut berubah walau simulasi mengubah warna cairan sendiri
     * (mis. `cair.material.color.setHex(...)`), bukan lewat setLevel.
     */
    g.userData.setOpasitas = function (o) {
      // permukaan selalu sedikit lebih kasat daripada badan cairannya,
      // karena ada pantulan cahaya di permukaan
      cakram.material.opacity = clamp(o * 0.34 + 0.05, 0.03, 0.55);
      men.material.opacity = clamp(o * 0.3, 0.02, 0.4);
    };
    g.userData.ikutWarna = function (matCair) {
      cakram.material.color = matCair.color;
      men.material.color = matCair.color;
      men.material.opacity = 0.32;
      g.userData.setWarna = function () {};
    };
    return g;
  }

  /** Labu erlenmeyer. */
  function labu(opt) {
    opt = opt || {};
    const R = opt.r || 1.05, H = opt.h || 1.9, leher = opt.leher || 0.34;
    const g = new T.Group();
    if (opt.bayangan !== false) g.add(bayanganKontak({ r: R * 1.75, y: -0.035, kuat: 0.72 }));
    const p = [
      new T.Vector2(0, 0), new T.Vector2(R, 0),
      new T.Vector2(leher, H * 0.74), new T.Vector2(leher, H),
      new T.Vector2(leher + 0.05, H), new T.Vector2(R + 0.05, 0 - 0.04),
      new T.Vector2(0, 0 - 0.04)
    ];
    const kaca = new T.Mesh(new T.LatheGeometry(p, 56), matKaca());
    kaca.renderOrder = 2;
    g.add(kaca);

    // cairan mengikuti bentuk kerucut labu
    const cairGeo = new T.CylinderGeometry(leher, R - 0.02, 1, 48, 1, false);
    const cair = new T.Mesh(cairGeo, matCairan(opt.warna !== undefined ? opt.warna : 0x4a8fd0));
    cair.renderOrder = 1;
    g.add(cair);

    // permukaan atas menyempit mengikuti kerucut labu
    const atas = permukaanCair(R - 0.02, opt.warna !== undefined ? opt.warna : 0x4a8fd0);
    atas.userData.ikutWarna(cair.material);
    g.add(atas);

    g.userData.setLevel = function (level, warna) {
      const t = clamp(level, 0, 1) * H * 0.72;
      const ada = t > 0.01;
      cair.visible = ada;
      atas.visible = ada;
      cair.scale.y = Math.max(0.001, t);
      cair.position.y = t / 2;
      // jari-jari permukaan mengecil ke arah leher
      const f = clamp(t / (H * 0.72), 0, 1);
      const rAtas = lerp(R - 0.02, leher, f);
      atas.scale.setScalar(Math.max(0.02, rAtas / Math.max(0.0001, R - 0.02)));
      atas.position.y = t;
      if (warna !== undefined) {
        cair.material.color.setHex(warna);
        if (!cair.userData.opasitasTetap) cair.material.opacity = opasitasCair(warna);
        atas.userData.setWarna(warna);
      }
    };
    g.userData.cair = cair;
    g.userData.atas = atas;
    /** Atur kebeningan zat cair; permukaan atasnya ikut menyesuaikan. */
    g.userData.setOpasitas = function (o) {
      cair.userData.opasitasTetap = true;
      cair.material.opacity = o;
      atas.userData.setOpasitas(o);
    };
    g.userData.setLevel(opt.level !== undefined ? opt.level : 0.5);
    return g;
  }

  /** Tabung reaksi. */
  function tabung(opt) {
    opt = opt || {};
    const R = opt.r || 0.3, H = opt.h || 1.5;
    const g = new T.Group();
    if (opt.bayangan !== false) g.add(bayanganKontak({ r: R * 2.6, y: -0.012, kuat: 0.6 }));
    const p = [];
    for (let i = 0; i <= 10; i++) {
      const a = Math.PI / 2 * (i / 10);
      p.push(new T.Vector2(Math.sin(a) * R, R - Math.cos(a) * R));
    }
    p.push(new T.Vector2(R, H));
    p.push(new T.Vector2(R + 0.03, H));
    for (let i = 10; i >= 0; i--) {
      const a = Math.PI / 2 * (i / 10);
      p.push(new T.Vector2(Math.sin(a) * (R + 0.03), R - Math.cos(a) * (R + 0.03)));
    }
    const kaca = new T.Mesh(new T.LatheGeometry(p, 40), matKaca({ thickness: 0.2 }));
    kaca.renderOrder = 2;
    g.add(kaca);
    const cair = new T.Mesh(new T.CylinderGeometry(R - 0.01, R - 0.01, 1, 32),
      matCairan(opt.warna !== undefined ? opt.warna : 0x4a8fd0));
    cair.renderOrder = 1;
    g.add(cair);
    const atas = permukaanCair(R - 0.012, opt.warna !== undefined ? opt.warna : 0x4a8fd0);
    atas.userData.ikutWarna(cair.material);
    g.add(atas);

    g.userData.setLevel = function (level, warna) {
      const t = clamp(level, 0, 1) * (H - R);
      const ada = t > 0.01;
      cair.visible = ada;
      atas.visible = ada;
      cair.scale.y = Math.max(0.001, t);
      cair.position.y = R + t / 2;
      atas.position.y = R + t;
      if (warna !== undefined) {
        cair.material.color.setHex(warna);
        if (!cair.userData.opasitasTetap) cair.material.opacity = opasitasCair(warna);
        atas.userData.setWarna(warna);
      }
    };
    g.userData.cair = cair;
    g.userData.atas = atas;
    /** Atur kebeningan zat cair; permukaan atasnya ikut menyesuaikan. */
    g.userData.setOpasitas = function (o) {
      cair.userData.opasitasTetap = true;
      cair.material.opacity = o;
      atas.userData.setOpasitas(o);
    };
    g.userData.setLevel(opt.level !== undefined ? opt.level : 0.5);
    return g;
  }

  /** Buret dengan keran. */
  function buret(opt) {
    opt = opt || {};
    const R = opt.r || 0.17, H = opt.h || 3.2;
    const g = new T.Group();
    const p = [
      new T.Vector2(0.03, 0), new T.Vector2(0.03, 0.26),
      new T.Vector2(R, 0.5), new T.Vector2(R, H),
      new T.Vector2(R + 0.028, H), new T.Vector2(R + 0.028, 0.5),
      new T.Vector2(0.052, 0.24), new T.Vector2(0.052, 0)
    ];
    const kaca = new T.Mesh(new T.LatheGeometry(p, 40), matKaca({ thickness: 0.18 }));
    kaca.renderOrder = 2;
    g.add(kaca);
    const cair = new T.Mesh(new T.CylinderGeometry(R - 0.012, R - 0.012, 1, 28),
      matCairan(opt.warna !== undefined ? opt.warna : 0xf0718f, { opacity: 0.82 }));
    cair.renderOrder = 1;
    g.add(cair);
    // keran
    const keran = new T.Mesh(new T.CylinderGeometry(0.075, 0.075, 0.34, 20),
      matLogam(0xcfd6dc, { roughness: 0.35 }));
    keran.rotation.z = Math.PI / 2;
    keran.position.y = 0.37;
    g.add(keran);
    const peg = new T.Mesh(new T.BoxGeometry(0.05, 0.05, 0.3), matLogam(0xef6a52, { metalness: 0.3 }));
    peg.position.set(0, 0.37, 0.16);
    g.add(peg);
    g.userData.keranPeg = peg;
    const atas = permukaanCair(R - 0.012, opt.warna !== undefined ? opt.warna : 0xf0718f);
    atas.userData.ikutWarna(cair.material);
    g.add(atas);

    g.userData.setLevel = function (level, warna) {
      const t = clamp(level, 0, 1) * (H - 0.6);
      const ada = t > 0.01;
      cair.visible = ada;
      atas.visible = ada;
      cair.scale.y = Math.max(0.001, t);
      cair.position.y = 0.55 + t / 2;
      atas.position.y = 0.55 + t;
      if (warna !== undefined) {
        cair.material.color.setHex(warna);
        if (!cair.userData.opasitasTetap) cair.material.opacity = opasitasCair(warna);
        atas.userData.setWarna(warna);
      }
    };
    g.userData.cair = cair;
    g.userData.atas = atas;
    /** Atur kebeningan zat cair; permukaan atasnya ikut menyesuaikan. */
    g.userData.setOpasitas = function (o) {
      cair.userData.opasitasTetap = true;
      cair.material.opacity = o;
      atas.userData.setOpasitas(o);
    };
    g.userData.setLevel(opt.level !== undefined ? opt.level : 0.8);
    return g;
  }

  /** Nyala pembakar. intensitas 0..1 — panggil perbarui(t, intensitas) tiap bingkai. */
  function nyala(opt) {
    opt = opt || {};
    const g = new T.Group();
    const lapis = [];
    const n = 5;
    for (let i = 0; i < n; i++) {
      const m = new T.Mesh(new T.ConeGeometry(1, 1, 18, 1, true),
        matNyala(i < 2 ? 0x4e94ff : 0xff8c2e, 0.2 - i * 0.025));
      lapis.push(m); g.add(m);
    }
    const cahaya = new T.PointLight(0xff8a3c, 0, 5, 2);
    cahaya.position.y = 0.4;
    g.add(cahaya);
    g.userData.perbarui = function (t, k) {
      k = clamp(k, 0, 1);
      g.visible = k > 0.02;
      lapis.forEach(function (m, i) {
        const p = i / n;
        const goy = Math.sin(t * 7 + i * 1.6) * 0.04 * k;
        const tinggi = (0.32 + 0.85 * k) * (1 - p * 0.42);
        const lebar = (0.145 - p * 0.075) * (0.55 + k * 0.55);
        m.scale.set(lebar, tinggi, lebar);
        m.position.set(goy, tinggi / 2 + p * 0.1, goy * 0.6);
        m.material.opacity = (0.2 - p * 0.03) * k;
      });
      cahaya.intensity = k * 3.4;
    };
    g.userData.perbarui(0, opt.k !== undefined ? opt.k : 0);
    return g;
  }

  /** Pancaran gelembung naik. */
  function gelembung(opt) {
    opt = opt || {};
    const n = opt.n || 36;
    const mat = new T.MeshPhysicalMaterial({
      color: opt.warna !== undefined ? opt.warna : 0xdff2ff,
      roughness: 0.05, metalness: 0, transmission: 0.9, thickness: 0.1,
      transparent: true, opacity: 0.55
    });
    const mesh = new T.InstancedMesh(geoBola(12), mat, n);
    mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
    const data = [];
    for (let i = 0; i < n; i++) {
      data.push({
        x: acak(-1, 1) * (opt.sebar || 0.5),
        z: acak(-1, 1) * (opt.sebar || 0.5),
        y: acak(0, opt.tinggi || 1.4),
        v: acak(0.35, 0.95),
        r: acak(0.025, 0.07)
      });
    }
    const M = new T.Matrix4();
    mesh.userData.perbarui = function (dt, laju) {
      laju = laju === undefined ? 1 : laju;
      mesh.visible = laju > 0.02;
      if (!mesh.visible) return;
      for (let i = 0; i < n; i++) {
        const d = data[i];
        d.y += d.v * dt * laju;
        if (d.y > (opt.tinggi || 1.4)) {
          d.y = 0; d.x = acak(-1, 1) * (opt.sebar || 0.5); d.z = acak(-1, 1) * (opt.sebar || 0.5);
        }
        const r = d.r * (0.6 + 0.4 * laju);
        M.makeScale(r, r, r);
        M.setPosition(d.x + Math.sin(d.y * 6 + i) * 0.03, d.y, d.z);
        mesh.setMatrixAt(i, M);
      }
      mesh.instanceMatrix.needsUpdate = true;
    };
    return mesh;
  }

  /**
   * Awan partikel ber-instance. Dipakai untuk gas, zat cair, larutan.
   * Kembalikan mesh dengan userData.p = array {pos, vel, ...}
   */
  function partikel(n, opt) {
    opt = opt || {};
    const mat = matBola(opt.warna !== undefined ? opt.warna : PALET.aksen,
      { unik: true, roughness: 0.3, emissiveIntensity: 0.1 });
    const mesh = new T.InstancedMesh(geoBola(opt.seg || 16), mat, n);
    mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
    mesh.castShadow = true;
    const p = [];
    const kotak = opt.kotak || { x: 2, y: 2, z: 2 };
    for (let i = 0; i < n; i++) {
      p.push({
        pos: new T.Vector3(acak(-kotak.x, kotak.x), acak(-kotak.y, kotak.y), acak(-kotak.z, kotak.z)),
        vel: new T.Vector3(acak(-1, 1), acak(-1, 1), acak(-1, 1)).normalize().multiplyScalar(acak(0.5, 1.2)),
        r: opt.r || 0.1,
        warna: null,
        aktif: true
      });
    }
    mesh.userData.p = p;
    mesh.userData.kotak = kotak;
    mesh.count = n;
    if (opt.warnaPer) {
      mesh.instanceColor = new T.InstancedBufferAttribute(new Float32Array(n * 3), 3);
      mat.vertexColors = false;
    }
    const M = new T.Matrix4();
    const Q = new T.Quaternion();
    const S = new T.Vector3();
    mesh.userData.tulis = function () {
      for (let i = 0; i < p.length; i++) {
        const d = p[i];
        const r = d.aktif ? d.r : 0.0001;
        S.set(r, r, r);
        M.compose(d.pos, Q, S);
        mesh.setMatrixAt(i, M);
        if (mesh.instanceColor && d.warna !== null) {
          const c = new T.Color(d.warna);
          mesh.setColorAt(i, c);
        }
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    };
    /** Gerak bebas dalam kotak, memantul di dinding. */
    mesh.userData.gerak = function (dt, laju) {
      const k = mesh.userData.kotak;
      for (let i = 0; i < p.length; i++) {
        const d = p[i];
        if (!d.aktif) continue;
        d.pos.addScaledVector(d.vel, dt * laju);
        ['x', 'y', 'z'].forEach(function (s) {
          const b = k[s] - d.r;
          if (d.pos[s] > b) { d.pos[s] = b; d.vel[s] *= -1; }
          if (d.pos[s] < -b) { d.pos[s] = -b; d.vel[s] *= -1; }
        });
      }
      mesh.userData.tulis();
    };
    mesh.userData.tulis();
    return mesh;
  }

  /** Teks melayang sebagai sprite (selalu menghadap kamera). */
  function teks(str, opt) {
    opt = opt || {};
    const ukuran = opt.ukuran || 64;
    const padX = 26, padY = 16;
    const DPR = 2;                       // kanvas beresolusi ganda → huruf tajam
    const cv = document.createElement('canvas');
    const ct = cv.getContext('2d');
    const keluarga = '"Segoe UI", system-ui, -apple-system, Roboto, sans-serif';
    const fontUtk = function (uk) { return (opt.tebal || 700) + ' ' + uk + 'px ' + keluarga; };

    ct.font = fontUtk(ukuran);
    // sediakan ruang untuk teks pengganti yang lebih panjang
    const ukur = opt.lebar ? 'M'.repeat(opt.lebar) : str;
    const wTeks = Math.ceil(Math.max(ct.measureText(str).width, ct.measureText(ukur).width));
    const w = wTeks + padX * 2;
    const h = ukuran + padY * 2;
    cv.width = w * DPR; cv.height = h * DPR;

    /* Latar digambar hanya selebar teks yang sedang tampil, bukan selebar
       kanvas. Kanvas sengaja dibuat lebih lebar agar teks pengganti yang
       panjang tetap muat, tetapi pilnya ikut menyusut mengikuti isinya —
       sehingga label tidak pernah tampak sebagai pita hitam melayang. */
    function gambar(isi, warnaIsi) {
      ct.setTransform(DPR, 0, 0, DPR, 0, 0);
      ct.clearRect(0, 0, w, h);
      let uk = ukuran;
      ct.font = fontUtk(uk);
      while (ct.measureText(isi).width > w - padX * 1.5 && uk > 10) {
        uk -= 2;
        ct.font = fontUtk(uk);
      }
      const lebarIsi = ct.measureText(isi).width;
      if (opt.latar !== false) {
        const pw = Math.min(w - 4, lebarIsi + padX * 1.7);
        const ph = uk + padY * 1.5;
        const px = (w - pw) / 2, py = (h - ph) / 2;
        const r = Math.min(ph / 2, 16);
        ct.fillStyle = typeof opt.latar === 'string' ? opt.latar : 'rgba(10,15,20,.78)';
        ct.beginPath();
        if (ct.roundRect) ct.roundRect(px, py, pw, ph, r); else ct.rect(px, py, pw, ph);
        ct.fill();
        ct.strokeStyle = opt.garis || 'rgba(255,255,255,.14)';
        ct.lineWidth = 2;
        ct.stroke();
      }
      ct.fillStyle = warnaIsi || opt.warna || '#eaf0f4';
      ct.textAlign = 'center'; ct.textBaseline = 'middle';
      ct.fillText(isi, w / 2, h / 2 + 1);
    }
    gambar(str);

    const tex = new T.CanvasTexture(cv);
    tex.anisotropy = 8;
    tex.colorSpace = T.SRGBColorSpace;
    const sp = new T.Sprite(new T.SpriteMaterial({
      map: tex, transparent: true, depthTest: opt.depthTest !== false,
      depthWrite: false
    }));
    let skala = opt.skala || 0.5;
    const maks = opt.maksLebar || 7.5;          // batas lebar di ruang dunia
    if (skala * w / h > maks) skala = maks * h / w;
    sp.scale.set(skala * w / h, skala, 1);
    sp.userData.ganti = function (isiBaru, warnaBaru) {
      gambar(isiBaru, warnaBaru);
      tex.needsUpdate = true;
    };
    return sp;
  }

  /** Panah 3D. */
  /**
   * Label penunjuk: pil teks + garis tipis + titik kecil yang menempel pada
   * bagian alat. Jauh lebih jelas daripada teks mengambang, karena siswa
   * langsung tahu bagian mana yang sedang dinamai.
   *
   * penunjuk('pengaduk magnet', [0, 0.5, 0], [2.2, 1.6, 0.6], { warna: '#9fe8ad' })
   *   titik  = letak bagian yang ditunjuk
   *   label  = letak pil teksnya
   */
  function penunjuk(isi, titik, label, opt) {
    opt = opt || {};
    const g = new T.Group();
    const a = new T.Vector3(titik[0], titik[1], titik[2]);
    const b = new T.Vector3(label[0], label[1], label[2]);
    const warna = opt.warna || '#cfdbe6';

    // garis penunjuk dengan sedikit lengkungan supaya tidak kaku
    const tengah = new T.Vector3().lerpVectors(a, b, 0.55);
    tengah.y += opt.lengkung !== undefined ? opt.lengkung : 0.18;
    const kurva = new T.QuadraticBezierCurve3(a, tengah, b);
    const garis = new T.Mesh(
      new T.TubeGeometry(kurva, 24, opt.tebal || 0.012, 6, false),
      new T.MeshBasicMaterial({
        color: new T.Color(warna), transparent: true, opacity: 0.55, depthWrite: false
      })
    );
    g.add(garis);

    // titik penanda di ujung yang ditunjuk
    const bulat = new T.Mesh(geoBola(14), new T.MeshBasicMaterial({
      color: new T.Color(warna), transparent: true, opacity: 0.9, depthWrite: false
    }));
    bulat.scale.setScalar(opt.titik || 0.045);
    bulat.position.copy(a);
    g.add(bulat);

    const t = teks(isi, {
      skala: opt.skala || 0.3,
      lebar: opt.lebar,
      warna: warna,
      maksLebar: opt.maksLebar || 4.5
    });
    t.position.copy(b);
    g.add(t);

    g.userData.teks = t;
    g.userData.ganti = function (baru, warnaBaru) { t.userData.ganti(baru, warnaBaru); };
    return g;
  }

  /**
   * Cincin sorotan berdenyut. Dipakai untuk menarik perhatian ke bagian yang
   * sedang berubah — panggil `userData.perbarui(waktu)` tiap bingkai.
   */
  function sorot(opt) {
    opt = opt || {};
    const r = opt.r || 0.8;
    const warna = opt.warna !== undefined ? opt.warna : 0xf0d040;
    const g = new T.Group();
    const cincin = [];
    for (let i = 0; i < 2; i++) {
      const m = new T.Mesh(
        new T.TorusGeometry(r, opt.tebal || r * 0.045, 8, 56),
        new T.MeshBasicMaterial({
          color: warna, transparent: true, opacity: 0.8, depthWrite: false
        })
      );
      m.rotation.x = opt.tegak ? 0 : Math.PI / 2;
      g.add(m);
      cincin.push(m);
    }
    g.userData.perbarui = function (waktu, kuat) {
      kuat = kuat === undefined ? 1 : kuat;
      g.visible = kuat > 0.02;
      if (!g.visible) return;
      for (let i = 0; i < cincin.length; i++) {
        const u = ((waktu * 0.7 + i * 0.5) % 1);
        cincin[i].scale.setScalar(1 + u * 0.45);
        cincin[i].material.opacity = (1 - u) * 0.75 * kuat;
      }
    };
    g.userData.perbarui(0, 1);
    return g;
  }

  function panah(dari, ke, opt) {
    opt = opt || {};
    const a = dari.isVector3 ? dari : new T.Vector3(dari[0], dari[1], dari[2]);
    const b = ke.isVector3 ? ke : new T.Vector3(ke[0], ke[1], ke[2]);
    const d = new T.Vector3().subVectors(b, a);
    const L = d.length();
    const tebal = opt.tebal || 0.05;
    const kepala = opt.kepala || Math.min(0.26, L * 0.3);
    const g = new T.Group();
    const mat = new T.MeshStandardMaterial({
      color: opt.warna !== undefined ? opt.warna : PALET.kuning,
      roughness: 0.4, metalness: 0.1,
      emissive: opt.warna !== undefined ? opt.warna : PALET.kuning, emissiveIntensity: 0.25
    });
    const batang = new T.Mesh(new T.CylinderGeometry(tebal, tebal, Math.max(0.001, L - kepala), 16), mat);
    batang.position.y = (L - kepala) / 2;
    g.add(batang);
    const ujung = new T.Mesh(new T.ConeGeometry(tebal * 2.4, kepala, 18), mat);
    ujung.position.y = L - kepala / 2;
    g.add(ujung);
    g.position.copy(a);
    g.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d.clone().normalize());
    return g;
  }

  /** Bidang datar untuk grafik 2D di dalam ruang 3D. */
  function panelGrafik(opt) {
    opt = opt || {};
    const W = opt.px || 640, H = opt.py || 400;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ct = cv.getContext('2d');
    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.SRGBColorSpace;
    tex.anisotropy = 8;
    const geo = new T.PlaneGeometry(opt.w || 3.2, (opt.w || 3.2) * H / W);
    const mesh = new T.Mesh(geo, new T.MeshBasicMaterial({
      map: tex, transparent: true, depthWrite: false, side: T.DoubleSide
    }));
    mesh.userData.ct = ct;
    mesh.userData.W = W;
    mesh.userData.H = H;
    // kerangka aplikasi memutar panel ini agar selalu menghadap kamera
    mesh.userData.hadapKamera = opt.hadapKamera !== false;
    mesh.userData.selesai = function () { tex.needsUpdate = true; };
    mesh.userData.bersih = function (warna) {
      ct.clearRect(0, 0, W, H);
      ct.fillStyle = warna || 'rgba(10,15,20,.82)';
      ct.beginPath();
      ct.roundRect ? ct.roundRect(0, 0, W, H, 18) : ct.rect(0, 0, W, H);
      ct.fill();
      ct.strokeStyle = 'rgba(255,255,255,.14)'; ct.lineWidth = 2; ct.stroke();
    };
    return mesh;
  }

  /**
   * Gambar grafik garis di atas panel dari panelGrafik().
   * opt: { xMin,xMax,yMin,yMax, xLabel,yLabel, judul,
   *        seri: [{ titik:[[x,y],…], warna:'#…', nama:'…', tebal, putus }],
   *        garisX: [{ v, warna, label }], garisY: [{ v, warna, label }],
   *        titikTebal: [{ x, y, warna }] }
   */
  function gambarGrafik(panel, opt) {
    const ct = panel.userData.ct, W = panel.userData.W, H = panel.userData.H;
    const kiri = 64, kanan = W - 18, atas = opt.judul ? 40 : 20, bawah = H - 46;
    const xMin = opt.xMin || 0, xMax = opt.xMax === undefined ? 1 : opt.xMax;
    const yMin = opt.yMin || 0, yMax = opt.yMax === undefined ? 1 : opt.yMax;
    const px = function (x) { return kiri + (x - xMin) / (xMax - xMin || 1) * (kanan - kiri); };
    const py = function (y) { return bawah - (y - yMin) / (yMax - yMin || 1) * (bawah - atas); };

    panel.userData.bersih();

    // kisi
    ct.strokeStyle = 'rgba(255,255,255,.075)'; ct.lineWidth = 1;
    ct.font = '18px system-ui, sans-serif'; ct.fillStyle = 'rgba(190,205,218,.72)';
    ct.textAlign = 'right'; ct.textBaseline = 'middle';
    for (let i = 0; i <= 4; i++) {
      const y = yMin + (yMax - yMin) * i / 4, Y = py(y);
      ct.beginPath(); ct.moveTo(kiri, Y); ct.lineTo(kanan, Y); ct.stroke();
      ct.fillText(fmtRapi(y), kiri - 10, Y);
    }
    ct.textAlign = 'center'; ct.textBaseline = 'top';
    for (let i = 0; i <= 4; i++) {
      const x = xMin + (xMax - xMin) * i / 4, X = px(x);
      ct.beginPath(); ct.moveTo(X, atas); ct.lineTo(X, bawah); ct.stroke();
      ct.fillText(fmtRapi(x), X, bawah + 8);
    }

    // sumbu
    ct.strokeStyle = 'rgba(255,255,255,.3)'; ct.lineWidth = 2;
    ct.beginPath();
    ct.moveTo(kiri, atas); ct.lineTo(kiri, bawah); ct.lineTo(kanan, bawah);
    ct.stroke();

    if (opt.judul) {
      ct.fillStyle = '#dce7f0'; ct.font = '600 22px system-ui, sans-serif';
      ct.textAlign = 'left'; ct.textBaseline = 'alphabetic';
      ct.fillText(opt.judul, kiri - 46, 28);
    }
    if (opt.xLabel) {
      ct.fillStyle = 'rgba(190,205,218,.9)'; ct.font = '18px system-ui, sans-serif';
      ct.textAlign = 'right'; ct.textBaseline = 'alphabetic';
      ct.fillText(opt.xLabel, kanan, H - 8);
    }
    if (opt.yLabel) {
      ct.save(); ct.translate(18, atas + 4); ct.rotate(-Math.PI / 2);
      ct.fillStyle = 'rgba(190,205,218,.9)'; ct.font = '18px system-ui, sans-serif';
      ct.textAlign = 'right'; ct.textBaseline = 'alphabetic';
      ct.fillText(opt.yLabel, 0, 0); ct.restore();
    }

    // garis bantu
    (opt.garisY || []).forEach(function (g) {
      const Y = py(g.v);
      if (Y < atas || Y > bawah) return;
      ct.save(); ct.setLineDash([7, 6]);
      ct.strokeStyle = g.warna || 'rgba(240,169,74,.8)'; ct.lineWidth = 2;
      ct.beginPath(); ct.moveTo(kiri, Y); ct.lineTo(kanan, Y); ct.stroke(); ct.restore();
      if (g.label) {
        ct.fillStyle = g.warna || 'rgba(240,169,74,.95)';
        ct.font = '17px system-ui, sans-serif';
        ct.textAlign = 'left'; ct.textBaseline = 'bottom';
        ct.fillText(g.label, kiri + 8, Y - 4);
      }
    });
    (opt.garisX || []).forEach(function (g) {
      const X = px(g.v);
      if (X < kiri || X > kanan) return;
      ct.save(); ct.setLineDash([7, 6]);
      ct.strokeStyle = g.warna || 'rgba(240,169,74,.8)'; ct.lineWidth = 2;
      ct.beginPath(); ct.moveTo(X, atas); ct.lineTo(X, bawah); ct.stroke(); ct.restore();
      if (g.label) {
        ct.fillStyle = g.warna || 'rgba(240,169,74,.95)';
        ct.font = '17px system-ui, sans-serif';
        ct.textAlign = 'left'; ct.textBaseline = 'top';
        ct.fillText(g.label, X + 6, atas + 4);
      }
    });

    // seri
    (opt.seri || []).forEach(function (sr) {
      if (!sr.titik || sr.titik.length < 2) return;
      ct.save();
      if (sr.putus) ct.setLineDash([8, 6]);
      ct.strokeStyle = sr.warna || '#4fd1c0';
      ct.lineWidth = sr.tebal || 3;
      ct.lineJoin = 'round'; ct.lineCap = 'round';
      ct.beginPath();
      for (let i = 0; i < sr.titik.length; i++) {
        const X = px(sr.titik[i][0]), Y = clamp(py(sr.titik[i][1]), atas - 20, bawah + 20);
        if (i === 0) ct.moveTo(X, Y); else ct.lineTo(X, Y);
      }
      ct.stroke();
      ct.restore();
    });

    // penanda titik
    (opt.titikTebal || []).forEach(function (t) {
      const X = px(t.x), Y = py(t.y);
      if (X < kiri - 4 || X > kanan + 4 || Y < atas - 4 || Y > bawah + 4) return;
      ct.fillStyle = t.warna || '#ffffff';
      ct.beginPath(); ct.arc(X, Y, t.r || 6, 0, Math.PI * 2); ct.fill();
    });

    // legenda
    const sri = (opt.seri || []).filter(function (x) { return x.nama; });
    if (sri.length) {
      ct.font = '18px system-ui, sans-serif';
      ct.textAlign = 'left'; ct.textBaseline = 'middle';
      let X = kiri + 6;
      const Y = atas + 14;
      sri.forEach(function (sr) {
        ct.fillStyle = sr.warna || '#4fd1c0';
        ct.fillRect(X, Y - 3, 22, 6);
        ct.fillStyle = 'rgba(214,228,240,.95)';
        ct.fillText(sr.nama, X + 28, Y);
        X += 34 + ct.measureText(sr.nama).width;
      });
    }
    panel.userData.selesai();
  }

  /** Gambar diagram batang di panel. bar: [{nama, v, warna}] */
  function gambarBatang(panel, opt) {
    const ct = panel.userData.ct, W = panel.userData.W, H = panel.userData.H;
    panel.userData.bersih();
    const bar = opt.bar || [];
    const kiri = 56, kanan = W - 18, atas = opt.judul ? 44 : 22, bawah = H - 44;
    let maks = opt.maks;
    if (maks === undefined) {
      maks = 0.0001;
      bar.forEach(function (b) { maks = Math.max(maks, Math.abs(b.v)); });
      maks *= 1.18;
    }
    const nol = opt.nolTengah ? (atas + bawah) / 2 : bawah;
    const skala = (nol - atas) / maks;
    if (opt.judul) {
      ct.fillStyle = '#dce7f0'; ct.font = '600 22px system-ui, sans-serif';
      ct.textAlign = 'left'; ct.textBaseline = 'alphabetic';
      ct.fillText(opt.judul, kiri - 38, 30);
    }
    ct.strokeStyle = 'rgba(255,255,255,.28)'; ct.lineWidth = 2;
    ct.beginPath(); ct.moveTo(kiri - 6, nol); ct.lineTo(kanan, nol); ct.stroke();
    const w = (kanan - kiri) / Math.max(1, bar.length);
    bar.forEach(function (b, i) {
      const h = b.v * skala;
      const X = kiri + i * w + w * 0.18, Wb = w * 0.64;
      ct.fillStyle = b.warna || 'rgba(79,209,192,.85)';
      ct.fillRect(X, h >= 0 ? nol - h : nol, Wb, Math.abs(h));
      ct.fillStyle = 'rgba(214,228,240,.95)';
      ct.font = '17px system-ui, sans-serif';
      ct.textAlign = 'center'; ct.textBaseline = h >= 0 ? 'bottom' : 'top';
      ct.fillText(fmtRapi(b.v), X + Wb / 2, h >= 0 ? nol - h - 5 : nol - h + 5);
      ct.fillStyle = 'rgba(160,176,190,.9)';
      ct.font = '17px system-ui, sans-serif';
      ct.textBaseline = 'top';
      ct.fillText(b.nama, X + Wb / 2, bawah + 6);
    });
    panel.userData.selesai();
  }

  /** Lantai lembut dengan bayangan. */
  /* Tekstur meja: bintik halus seperti permukaan epoksi meja laboratorium,
     ditambah pudar gelap ke arah tepi supaya adegan terasa berujung lembut. */
  let _texMeja = null;
  function texMeja() {
    if (_texMeja) return _texMeja;
    const n = 512;
    const cv = document.createElement('canvas');
    cv.width = n; cv.height = n;
    const ct = cv.getContext('2d');
    ct.fillStyle = '#20282f';
    ct.fillRect(0, 0, n, n);
    // bintik halus
    for (let i = 0; i < 26000; i++) {
      const x = Math.random() * n, y = Math.random() * n;
      const t = Math.random();
      ct.fillStyle = t < 0.55 ? 'rgba(255,255,255,.035)'
        : t < 0.85 ? 'rgba(0,0,0,.05)' : 'rgba(120,170,200,.03)';
      ct.fillRect(x, y, 1.4, 1.4);
    }
    _texMeja = new T.CanvasTexture(cv);
    _texMeja.wrapS = _texMeja.wrapT = T.RepeatWrapping;
    _texMeja.repeat.set(4, 4);
    _texMeja.colorSpace = T.SRGBColorSpace;
    return _texMeja;
  }

  /* Bayangan kontak: cakram gelap membaur di bawah objek. Inilah yang
     membuat alat terasa benar-benar menempel di meja, bukan melayang. */
  let _texBayang = null;
  function texBayang() {
    if (_texBayang) return _texBayang;
    const n = 256;
    const cv = document.createElement('canvas');
    cv.width = n; cv.height = n;
    const ct = cv.getContext('2d');
    const g = ct.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
    g.addColorStop(0.00, 'rgba(0,0,0,.72)');
    g.addColorStop(0.35, 'rgba(0,0,0,.42)');
    g.addColorStop(0.70, 'rgba(0,0,0,.12)');
    g.addColorStop(1.00, 'rgba(0,0,0,0)');
    ct.fillStyle = g;
    ct.fillRect(0, 0, n, n);
    _texBayang = new T.CanvasTexture(cv);
    return _texBayang;
  }

  /* Cincin pudar: bening di tengah, menggelap halus ke tepi. */
  let _texPudar = null;
  function texPudarTepi() {
    if (_texPudar) return _texPudar;
    const n = 256;
    const cv = document.createElement('canvas');
    cv.width = n; cv.height = n;
    const ct = cv.getContext('2d');
    const g = ct.createRadialGradient(n / 2, n / 2, n * 0.18, n / 2, n / 2, n * 0.5);
    g.addColorStop(0.00, 'rgba(0,0,0,0)');
    g.addColorStop(0.52, 'rgba(0,0,0,.25)');
    g.addColorStop(0.78, 'rgba(0,0,0,.72)');
    g.addColorStop(1.00, 'rgba(0,0,0,1)');
    ct.fillStyle = g;
    ct.fillRect(0, 0, n, n);
    _texPudar = new T.CanvasTexture(cv);
    return _texPudar;
  }

  /**
   * Bayangan kontak lembut di bawah sebuah alat.
   * bayanganKontak({ r: 1.6, x: 0, z: 0, y: 0.01, kuat: 0.8 })
   */
  function bayanganKontak(opt) {
    opt = opt || {};
    const r = opt.r || 1.5;
    const m = new T.Mesh(
      new T.PlaneGeometry(r * 2, r * 2),
      new T.MeshBasicMaterial({
        map: texBayang(), transparent: true, depthWrite: false,
        opacity: opt.kuat !== undefined ? opt.kuat : 0.8,
        color: 0x000000
      })
    );
    m.rotation.x = -Math.PI / 2;
    m.position.set(opt.x || 0, opt.y !== undefined ? opt.y : 0.012, opt.z || 0);
    m.renderOrder = -1;
    return m;
  }

  /**
   * Latar bergradasi untuk scene.background. Warna dasar simulasi dipakai di
   * bagian bawah, lalu menerang sedikit ke atas seperti dinding ruangan.
   */
  const _cacheLatar = {};
  function latarGradasi(warnaDasar) {
    const kunci = String(warnaDasar);
    if (_cacheLatar[kunci]) return _cacheLatar[kunci];
    const c = new T.Color(warnaDasar);
    // Dinding ruangan dibuat jelas lebih terang daripada lantai. Selain
    // memberi kesan ruang, inilah yang "ditembus" oleh kaca: tanpa latar
    // yang punya isi, alat gelas akan tampak hitam pekat.
    const atas = c.clone().lerp(new T.Color(0x5d7488), 0.72);
    const tengah = c.clone().lerp(new T.Color(0x35485a), 0.58);
    const cv = document.createElement('canvas');
    cv.width = 16; cv.height = 256;
    const ct = cv.getContext('2d');
    const g = ct.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0.00, '#' + atas.getHexString());
    g.addColorStop(0.40, '#' + tengah.getHexString());
    g.addColorStop(0.62, '#' + c.clone().lerp(new T.Color(0x1b2733), 0.5).getHexString());
    g.addColorStop(1.00, '#' + c.getHexString());
    ct.fillStyle = g;
    ct.fillRect(0, 0, 16, 256);
    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.SRGBColorSpace;
    tex.mapping = T.EquirectangularReflectionMapping;
    _cacheLatar[kunci] = tex;
    return tex;
  }

  /**
   * Panggung untuk adegan molekul/atom yang tidak berdiri di atas meja.
   * Sebuah cahaya lembut di belakang objek plus bayangan samar di bawahnya —
   * cukup untuk memberi kedalaman, tanpa mengalihkan perhatian dari molekulnya.
   */
  function panggungMolekul(opt) {
    opt = opt || {};
    const g = new T.Group();
    const R = opt.r || 6;

    // semburat cahaya di belakang objek
    const semburat = new T.Mesh(
      new T.PlaneGeometry(R * 2.4, R * 2.4),
      new T.MeshBasicMaterial({
        map: texSemburat(),
        color: opt.warna !== undefined ? opt.warna : 0x2a4a63,
        transparent: true, opacity: opt.kuat !== undefined ? opt.kuat : 0.5,
        depthWrite: false, blending: T.AdditiveBlending
      })
    );
    semburat.position.set(0, opt.y !== undefined ? opt.y : 0, -(opt.z || R * 0.9));
    semburat.renderOrder = -3;
    g.add(semburat);

    // bayangan samar di bawah, memberi acuan "bawah"
    if (opt.bayangan !== false) {
      const b = bayanganKontak({
        r: R * 0.42, y: (opt.yBayang !== undefined ? opt.yBayang : -R * 0.42),
        kuat: 0.45
      });
      g.add(b);
    }
    return g;
  }

  /* Semburat lembut: terang di tengah, lenyap ke tepi. */
  let _texSemburat = null;
  function texSemburat() {
    if (_texSemburat) return _texSemburat;
    const n = 256;
    const cv = document.createElement('canvas');
    cv.width = n; cv.height = n;
    const ct = cv.getContext('2d');
    const g = ct.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
    g.addColorStop(0.00, 'rgba(255,255,255,.85)');
    g.addColorStop(0.30, 'rgba(255,255,255,.34)');
    g.addColorStop(0.62, 'rgba(255,255,255,.09)');
    g.addColorStop(1.00, 'rgba(255,255,255,0)');
    ct.fillStyle = g;
    ct.fillRect(0, 0, n, n);
    _texSemburat = new T.CanvasTexture(cv);
    return _texSemburat;
  }

  /** Permukaan meja laboratorium. */
  function lantai(opt) {
    opt = opt || {};
    const g = new T.Group();
    const R = opt.r || 9;
    const y = opt.y !== undefined ? opt.y : 0;

    const m = new T.Mesh(
      new T.CircleGeometry(R, 80),
      new T.MeshPhysicalMaterial({
        color: opt.warna !== undefined ? opt.warna : 0x151c23,
        map: texMeja(),
        // kasar dan hampir tanpa clearcoat: meja memantulkan cahaya secara
        // merata, tidak menimbulkan bercak terang besar di tengah adegan
        roughness: 0.86,
        metalness: 0.0,
        clearcoat: 0.06,
        clearcoatRoughness: 0.6,
        envMapIntensity: 0.22
      })
    );
    m.rotation.x = -Math.PI / 2;
    m.position.y = y;
    m.receiveShadow = true;
    g.add(m);

    // tepi meja memudar halus ke latar, tanpa garis batas yang terlihat
    const pudar = new T.Mesh(
      new T.CircleGeometry(R * 1.02, 72),
      new T.MeshBasicMaterial({
        map: texPudarTepi(), color: 0x05080b,
        transparent: true, opacity: 0.95,
        depthWrite: false, side: T.DoubleSide
      })
    );
    pudar.rotation.x = -Math.PI / 2;
    pudar.position.y = y + 0.006;
    pudar.renderOrder = -2;
    g.add(pudar);

    if (opt.kisi !== false) {
      const kisi = new T.GridHelper(R * 2, opt.kisiN || 24, 0x33414c, 0x27333c);
      kisi.position.y = y + 0.004;
      kisi.material.opacity = 0.16;
      kisi.material.transparent = true;
      kisi.material.depthWrite = false;
      g.add(kisi);
    }
    return g;
  }

  /* ====================================================== PETA LINGKUNGAN =
     Tanpa peta lingkungan, bahan kaca dan logam terlihat datar. Kita bangun
     studio kecil berisi bidang-bidang bercahaya, lalu saring dengan PMREM
     sehingga pantulannya lembut. Dibuat sekali, dipakai seluruh simulasi. */

  let _env = null;
  /* Tekstur softbox: terang di tengah, meredup halus ke tepi.
     Pantulan dari bidang seperti ini terlihat seperti lampu studio sungguhan,
     bukan kotak terang bertepi tajam. */
  let _texSoftbox = null;
  function texSoftbox() {
    if (_texSoftbox) return _texSoftbox;
    const n = 256;
    const cv = document.createElement('canvas');
    cv.width = n; cv.height = n;
    const ct = cv.getContext('2d');
    const g = ct.createRadialGradient(n / 2, n / 2, n * 0.05, n / 2, n / 2, n * 0.52);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.45, '#e2e2e2');
    g.addColorStop(0.78, '#6a6a6a');
    g.addColorStop(1, '#000000');
    ct.fillStyle = g;
    ct.fillRect(0, 0, n, n);
    _texSoftbox = new T.CanvasTexture(cv);
    return _texSoftbox;
  }

  /* Tekstur langit studio: gelap di bawah, terang di atas — memberi gradasi
     Fresnel yang wajar pada kaca dan logam. */
  let _texLangit = null;
  function texLangit() {
    if (_texLangit) return _texLangit;
    const cv = document.createElement('canvas');
    cv.width = 8; cv.height = 256;
    const ct = cv.getContext('2d');
    const g = ct.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0.00, '#9fb4c6');   // langit-langit
    g.addColorStop(0.42, '#55646f');
    g.addColorStop(0.56, '#2d363d');   // garis cakrawala
    g.addColorStop(1.00, '#10161b');   // lantai
    ct.fillStyle = g;
    ct.fillRect(0, 0, 8, 256);
    _texLangit = new T.CanvasTexture(cv);
    return _texLangit;
  }

  function lingkungan(renderer) {
    if (_env) return _env;
    const st = new T.Scene();

    /* kubah bergradasi sebagai cahaya dasar */
    const kubah = new T.Mesh(
      new T.SphereGeometry(30, 32, 24),
      new T.MeshBasicMaterial({ map: texLangit(), side: T.BackSide })
    );
    st.add(kubah);

    /* softbox: bidang bergradasi lembut, seperti lampu studio */
    const bidangGeo = new T.PlaneGeometry(1, 1);
    function softbox(w, h, pos, lihatKe, warna, kuat) {
      const m = new T.Mesh(bidangGeo, new T.MeshBasicMaterial({
        map: texSoftbox(),
        color: new T.Color(warna).multiplyScalar(kuat),
        transparent: true, side: T.DoubleSide, depthWrite: false
      }));
      m.scale.set(w, h, 1);
      m.position.set(pos[0], pos[1], pos[2]);
      m.lookAt(lihatKe[0], lihatKe[1], lihatKe[2]);
      st.add(m);
      return m;
    }

    // lampu utama dari atas-depan-kanan (kunci)
    softbox(11, 8, [5.5, 11, 7], [0, 0, 0], 0xffffff, 6.0);
    // pengisi dingin dari kiri
    softbox(12, 10, [-12, 4.5, 3], [0, 2, 0], 0x9ac8ff, 1.1);
    // tepi hangat dari belakang-kanan
    softbox(8, 9, [9, 4, -9], [0, 2, 0], 0xffc08a, 1.4);
    // pantulan meja dari bawah
    softbox(16, 16, [0, -5, 0], [0, 1, 0], 0x8fa4b4, 0.35);
    // DUA GARIS SEMPIT YANG SANGAT TERANG.
    // Inilah sumber kilau memanjang khas tabung kaca: sempit supaya
    // pantulannya berupa garis tegas, terang supaya tetap terlihat.
    softbox(0.55, 17, [-4.2, 6.5, 6.5], [0, 1.5, 0], 0xffffff, 26);
    softbox(0.40, 15, [5.2, 5.5, 6.0], [0, 1.5, 0], 0xffffff, 16);
    softbox(0.35, 13, [-6.5, 5, -3], [0, 1.5, 0], 0xcfe6ff, 10);

    const pmrem = new T.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    _env = pmrem.fromScene(st, 0.02).texture;
    pmrem.dispose();
    st.traverse(function (o) { if (o.material) o.material.dispose(); });
    bidangGeo.dispose();
    kubah.geometry.dispose();
    return _env;
  }

  /* ========================================================== RIG CAHAYA = */

  function rigCahaya(scene, opt) {
    opt = opt || {};
    const g = new T.Group();

    const hemi = new T.HemisphereLight(0xaed0ee, 0x1a222a, opt.hemi !== undefined ? opt.hemi : 0.62);
    g.add(hemi);

    const kunci = new T.DirectionalLight(0xfff4e8, opt.kunci !== undefined ? opt.kunci : 2.1);
    kunci.position.set(5, 8.5, 6);
    kunci.castShadow = opt.bayangan !== false;
    if (kunci.castShadow) {
      // peta bayangan besar + radius membuat tepi bayangan melembut,
      // seperti bayangan di bawah lampu ruangan sungguhan
      kunci.shadow.mapSize.set(2048, 2048);
      kunci.shadow.camera.near = 1;
      kunci.shadow.camera.far = 34;
      const s = opt.luasBayangan || 8;
      kunci.shadow.camera.left = -s; kunci.shadow.camera.right = s;
      kunci.shadow.camera.top = s; kunci.shadow.camera.bottom = -s;
      kunci.shadow.bias = -0.0008;
      kunci.shadow.normalBias = 0.02;
      kunci.shadow.radius = 3.5;
      kunci.shadow.blurSamples = 12;
    }
    g.add(kunci);

    // cahaya pengisi dingin dari kiri — melunakkan sisi gelap
    const isi = new T.DirectionalLight(0x9fd0ff, opt.isi !== undefined ? opt.isi : 0.74);
    isi.position.set(-6.5, 3, 3.5);
    g.add(isi);

    // cahaya tepi hangat dari belakang — menghasilkan garis cahaya pada
    // siluet alat, trik lama fotografi produk
    const tepi = new T.DirectionalLight(0xffd8a8, opt.tepi !== undefined ? opt.tepi : 1.0);
    tepi.position.set(-3, 4.5, -7);
    g.add(tepi);

    // kilau kecil dari depan supaya label dan angka tetap terbaca
    const depan = new T.DirectionalLight(0xffffff, opt.depan !== undefined ? opt.depan : 0.28);
    depan.position.set(0.5, 2, 9);
    g.add(depan);

    g.add(new T.AmbientLight(0xffffff, opt.ambien !== undefined ? opt.ambien : 0.2));

    scene.add(g);
    g.userData.kunci = kunci;
    return g;
  }

  /* ============================================== KENDALI ORBIT SEDERHANA */

  function Orbit(kamera, elemen, opt) {
    opt = opt || {};
    const self = this;
    this.target = new T.Vector3(0, opt.targetY || 0, 0);
    this.jarak = opt.jarak || 8;
    this.jarakMin = opt.jarakMin || 1.6;
    this.jarakMaks = opt.jarakMaks || 40;
    this.theta = opt.theta !== undefined ? opt.theta : 0.6;      // azimut
    this.phi = opt.phi !== undefined ? opt.phi : 1.18;           // polar
    this.putarOtomatis = !!opt.putarOtomatis;
    this.lajuPutar = opt.lajuPutar || 0.18;
    this.aktif = true;

    let tTheta = this.theta, tPhi = this.phi, tJarak = this.jarak;
    const tTarget = this.target.clone();
    let seret = false, geser = false, lx = 0, ly = 0;
    let sentuhJarak = 0;

    function turun(e) {
      if (!self.aktif) return;
      seret = true;
      geser = e.button === 2 || e.shiftKey;
      lx = e.clientX; ly = e.clientY;
      elemen.setPointerCapture && e.pointerId !== undefined && elemen.setPointerCapture(e.pointerId);
    }
    function gerak(e) {
      if (!seret || !self.aktif) return;
      const dx = e.clientX - lx, dy = e.clientY - ly;
      lx = e.clientX; ly = e.clientY;
      if (geser) {
        const k = tJarak * 0.0016;
        const kanan = new T.Vector3(Math.cos(tTheta), 0, -Math.sin(tTheta));
        const atas = new T.Vector3(0, 1, 0);
        tTarget.addScaledVector(kanan, -dx * k);
        tTarget.addScaledVector(atas, dy * k);
      } else {
        tTheta -= dx * 0.0062;
        tPhi = clamp(tPhi - dy * 0.0062, 0.08, Math.PI - 0.08);
      }
    }
    function naik(e) { seret = false; }
    function roda(e) {
      if (!self.aktif) return;
      e.preventDefault();
      tJarak = clamp(tJarak * (1 + Math.sign(e.deltaY) * 0.1), self.jarakMin, self.jarakMaks);
    }
    function sentuhMulai(e) {
      if (e.touches && e.touches.length === 2) {
        sentuhJarak = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY);
      }
    }
    function sentuhGerak(e) {
      if (e.touches && e.touches.length === 2 && sentuhJarak) {
        const d = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY);
        tJarak = clamp(tJarak * (sentuhJarak / d), self.jarakMin, self.jarakMaks);
        sentuhJarak = d;
        e.preventDefault();
      }
    }

    elemen.addEventListener('pointerdown', turun);
    window.addEventListener('pointermove', gerak);
    window.addEventListener('pointerup', naik);
    elemen.addEventListener('wheel', roda, { passive: false });
    elemen.addEventListener('touchstart', sentuhMulai, { passive: true });
    elemen.addEventListener('touchmove', sentuhGerak, { passive: false });
    elemen.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    this.set = function (o) {
      if (o.jarak !== undefined) tJarak = this.jarak = o.jarak;
      if (o.theta !== undefined) tTheta = this.theta = o.theta;
      if (o.phi !== undefined) tPhi = this.phi = o.phi;
      if (o.target) { tTarget.set(o.target[0], o.target[1], o.target[2]); }
      if (o.targetY !== undefined) tTarget.y = o.targetY;
      if (o.jarakMin !== undefined) this.jarakMin = o.jarakMin;
      if (o.jarakMaks !== undefined) this.jarakMaks = o.jarakMaks;
      if (o.putarOtomatis !== undefined) this.putarOtomatis = o.putarOtomatis;
      if (o.lajuPutar !== undefined) this.lajuPutar = o.lajuPutar;
    };
    this.awal = null;
    this.simpanAwal = function () {
      this.awal = { jarak: tJarak, theta: tTheta, phi: tPhi, target: tTarget.clone() };
    };
    this.pulihkan = function () {
      if (!this.awal) return;
      tJarak = this.awal.jarak; tTheta = this.awal.theta; tPhi = this.awal.phi;
      tTarget.copy(this.awal.target);
    };
    this.perbarui = function (dt) {
      if (this.putarOtomatis && !seret) tTheta += dt * this.lajuPutar;
      const k = 1 - Math.pow(0.0016, dt);
      this.theta = lerp(this.theta, tTheta, k);
      this.phi = lerp(this.phi, tPhi, k);
      this.jarak = lerp(this.jarak, tJarak, k);
      this.target.lerp(tTarget, k);
      const sp = Math.sin(this.phi);
      kamera.position.set(
        this.target.x + this.jarak * sp * Math.sin(this.theta),
        this.target.y + this.jarak * Math.cos(this.phi),
        this.target.z + this.jarak * sp * Math.cos(this.theta)
      );
      kamera.lookAt(this.target);
    };
    this.buang = function () {
      elemen.removeEventListener('pointerdown', turun);
      window.removeEventListener('pointermove', gerak);
      window.removeEventListener('pointerup', naik);
      elemen.removeEventListener('wheel', roda);
      elemen.removeEventListener('touchstart', sentuhMulai);
      elemen.removeEventListener('touchmove', sentuhGerak);
    };
  }

  /* ================================================ PEMBUANGAN SUMBER DAYA */

  function buangObjek(obj) {
    obj.traverse(function (o) {
      if (o.geometry && !o.geometry.userData.dipakaiBersama) {
        const g = o.geometry;
        // jangan buang geometri yang di-cache bersama
        let bersama = false;
        for (const k in _geoBola) if (_geoBola[k] === g) bersama = true;
        if (g === _geoSilinder) bersama = true;
        if (!bersama) g.dispose();
      }
      if (o.material) {
        const daftar = Array.isArray(o.material) ? o.material : [o.material];
        daftar.forEach(function (m) {
          let bersama = false;
          for (const k in _cacheBola) if (_cacheBola[k] === m) bersama = true;
          if (bersama) return;
          if (m.map) m.map.dispose();
          m.dispose();
        });
      }
    });
  }

  /* ===================================================== EKSPOR NAMESPACE */

  const S3 = {
    T: T, UNSUR: UNSUR, PALET: PALET,
    clamp: clamp, lerp: lerp, acak: acak, pilihAcak: pilihAcak,
    fmt: fmt, fmtRapi: fmtRapi, sup: sup, sub: sub,
    matBola: matBola, matKaca: matKaca, matCairan: matCairan,
    matLogam: matLogam, matNyala: matNyala,
    geoBola: geoBola,
    atom: atom, ikatan: ikatan, molekul: molekul,
    gelas: gelas, labu: labu, tabung: tabung, buret: buret,
    nyala: nyala, gelembung: gelembung, partikel: partikel,
    teks: teks, panah: panah, panelGrafik: panelGrafik, lantai: lantai,
    penunjuk: penunjuk, sorot: sorot, panggungMolekul: panggungMolekul,
    gambarGrafik: gambarGrafik, gambarBatang: gambarBatang,
    matPermukaanCair: matPermukaanCair, permukaanCair: permukaanCair,
    opasitasCair: opasitasCair,
    latarGradasi: latarGradasi, bayanganKontak: bayanganKontak,
    rigCahaya: rigCahaya, lingkungan: lingkungan, Orbit: Orbit, buangObjek: buangObjek,
    V: function (x, y, z) { return new T.Vector3(x, y, z); },
    warna: function (h) { return new T.Color(h); }
  };

  global.S3 = S3;

  /* =========================================================== PENDAFTAR = */

  const daftarSim = {};
  global.Sim3D = {
    S3: S3,
    daftar: function (slug, def) { daftarSim[slug] = def; },
    ambil: function (slug) { return daftarSim[slug]; },
    semua: daftarSim
  };

})(window);
