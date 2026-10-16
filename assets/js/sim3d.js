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
      roughness: o.roughness !== undefined ? o.roughness : 0.34,
      metalness: o.metalness !== undefined ? o.metalness : 0.06,
      clearcoat: o.clearcoat !== undefined ? o.clearcoat : 0.55,
      clearcoatRoughness: 0.22,
      emissive: o.emissive !== undefined ? o.emissive : warna,
      emissiveIntensity: o.emissiveIntensity !== undefined ? o.emissiveIntensity : 0.06,
      envMapIntensity: o.envMapIntensity !== undefined ? o.envMapIntensity : 0.85,
      transparent: o.opacity !== undefined && o.opacity < 1,
      opacity: o.opacity !== undefined ? o.opacity : 1
    });
    if (!o.unik) _cacheBola[kunci] = m;
    return m;
  }

  /**
   * Kaca. Dua gaya:
   *  - baku: transparan sederhana. Isi wadah terlihat jernih, murah, dan
   *    tidak memantulkan dinding studio — paling cocok untuk alat peraga.
   *  - { bias: true }: memakai transmission three.js, lebih mewah tetapi
   *    membuat isi wadah agak terdistorsi.
   */
  function matKaca(o) {
    o = o || {};
    if (o.bias) {
      return new T.MeshPhysicalMaterial({
        color: o.color !== undefined ? o.color : 0xffffff,
        roughness: o.roughness !== undefined ? o.roughness : 0.06,
        metalness: 0,
        transmission: o.transmission !== undefined ? o.transmission : 1,
        thickness: o.thickness !== undefined ? o.thickness : 0.14,
        ior: 1.46,
        transparent: true, opacity: 1,
        clearcoat: 1, clearcoatRoughness: 0.03,
        envMapIntensity: o.envMapIntensity !== undefined ? o.envMapIntensity : 0.55,
        side: T.DoubleSide, depthWrite: false
      });
    }
    return new T.MeshPhysicalMaterial({
      color: o.color !== undefined ? o.color : 0xcfe6f2,
      roughness: o.roughness !== undefined ? o.roughness : 0.1,
      metalness: 0,
      transparent: true,
      opacity: o.opacity !== undefined ? o.opacity : 0.17,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      envMapIntensity: o.envMapIntensity !== undefined ? o.envMapIntensity : 0.6,
      side: T.DoubleSide,
      depthWrite: false
    });
  }

  function matCairan(warna, o) {
    o = o || {};
    return new T.MeshPhysicalMaterial({
      color: warna,
      roughness: o.roughness !== undefined ? o.roughness : 0.16,
      metalness: 0,
      transmission: o.transmission !== undefined ? o.transmission : 0.45,
      thickness: 1.2,
      ior: 1.33,
      transparent: true,
      opacity: o.opacity !== undefined ? o.opacity : 0.9,
      clearcoat: 0.8,
      envMapIntensity: 1.1,
      side: T.DoubleSide
    });
  }

  function matLogam(warna, o) {
    o = o || {};
    return new T.MeshStandardMaterial({
      color: warna,
      roughness: o.roughness !== undefined ? o.roughness : 0.28,
      metalness: o.metalness !== undefined ? o.metalness : 0.92,
      envMapIntensity: o.envMapIntensity !== undefined ? o.envMapIntensity : 1.25
    });
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
    const mat = opt.mat || new T.MeshStandardMaterial({
      color: opt.warna !== undefined ? opt.warna : 0xb8c2cc,
      roughness: 0.4, metalness: 0.15
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

    g.userData.R = R; g.userData.H = H;
    g.userData.cair = cair;
    /** level 0..1 */
    g.userData.setLevel = function (level, warna) {
      const t = clamp(level, 0, 1) * H;
      cair.visible = t > 0.012;
      cair.scale.y = Math.max(0.001, t);
      cair.position.y = t / 2;
      if (warna !== undefined) cair.material.color.setHex(warna);
    };
    g.userData.setLevel(opt.level !== undefined ? opt.level : 0.6);
    return g;
  }

  /** Labu erlenmeyer. */
  function labu(opt) {
    opt = opt || {};
    const R = opt.r || 1.05, H = opt.h || 1.9, leher = opt.leher || 0.34;
    const g = new T.Group();
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

    g.userData.setLevel = function (level, warna) {
      const t = clamp(level, 0, 1) * H * 0.72;
      cair.visible = t > 0.01;
      cair.scale.y = Math.max(0.001, t);
      cair.position.y = t / 2;
      if (warna !== undefined) cair.material.color.setHex(warna);
    };
    g.userData.cair = cair;
    g.userData.setLevel(opt.level !== undefined ? opt.level : 0.5);
    return g;
  }

  /** Tabung reaksi. */
  function tabung(opt) {
    opt = opt || {};
    const R = opt.r || 0.3, H = opt.h || 1.5;
    const g = new T.Group();
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
    g.userData.setLevel = function (level, warna) {
      const t = clamp(level, 0, 1) * (H - R);
      cair.visible = t > 0.01;
      cair.scale.y = Math.max(0.001, t);
      cair.position.y = R + t / 2;
      if (warna !== undefined) cair.material.color.setHex(warna);
    };
    g.userData.cair = cair;
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
    g.userData.setLevel = function (level, warna) {
      const t = clamp(level, 0, 1) * (H - 0.6);
      cair.visible = t > 0.01;
      cair.scale.y = Math.max(0.001, t);
      cair.position.y = 0.55 + t / 2;
      if (warna !== undefined) cair.material.color.setHex(warna);
    };
    g.userData.cair = cair;
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
    const pad = 18;
    const cv = document.createElement('canvas');
    const ct = cv.getContext('2d');
    const font = (opt.tebal || 700) + ' ' + ukuran + 'px "Inter", system-ui, sans-serif';
    ct.font = font;
    // sediakan ruang untuk teks pengganti yang lebih panjang
    const ukur = opt.lebar ? 'M'.repeat(opt.lebar) : str;
    const w = Math.ceil(Math.max(ct.measureText(str).width, ct.measureText(ukur).width)) + pad * 2;
    const h = ukuran + pad * 2;
    cv.width = w; cv.height = h;
    ct.font = font;
    if (opt.latar !== false) {
      ct.fillStyle = opt.latar || 'rgba(12,17,22,.72)';
      const r = 14;
      ct.beginPath();
      ct.roundRect ? ct.roundRect(2, 2, w - 4, h - 4, r) : ct.rect(2, 2, w - 4, h - 4);
      ct.fill();
      if (opt.garis) { ct.strokeStyle = opt.garis; ct.lineWidth = 3; ct.stroke(); }
    }
    ct.fillStyle = opt.warna || '#eaf0f4';
    ct.textAlign = 'center'; ct.textBaseline = 'middle';
    ct.fillText(str, w / 2, h / 2 + 2);

    const tex = new T.CanvasTexture(cv);
    tex.anisotropy = 4;
    tex.colorSpace = T.SRGBColorSpace;
    const sp = new T.Sprite(new T.SpriteMaterial({
      map: tex, transparent: true, depthTest: opt.depthTest !== false,
      depthWrite: false
    }));
    let skala = opt.skala || 0.5;
    const maks = opt.maksLebar || 7.5;          // batas lebar di ruang dunia
    if (skala * w / h > maks) skala = maks * h / w;
    sp.scale.set(skala * w / h, skala, 1);
    sp.userData.ganti = function (baru, warnaBaru) {
      ct.clearRect(0, 0, w, h);
      if (opt.latar !== false) {
        ct.fillStyle = opt.latar || 'rgba(12,17,22,.72)';
        ct.beginPath();
        ct.roundRect ? ct.roundRect(2, 2, w - 4, h - 4, 14) : ct.rect(2, 2, w - 4, h - 4);
        ct.fill();
      }
      // kecilkan huruf bila teks baru terlalu panjang
      let uk = ukuran;
      ct.font = (opt.tebal || 700) + ' ' + uk + 'px "Inter", system-ui, sans-serif';
      while (ct.measureText(baru).width > w - pad * 1.4 && uk > 10) {
        uk -= 2;
        ct.font = (opt.tebal || 700) + ' ' + uk + 'px "Inter", system-ui, sans-serif';
      }
      ct.fillStyle = warnaBaru || opt.warna || '#eaf0f4';
      ct.textAlign = 'center'; ct.textBaseline = 'middle';
      ct.fillText(baru, w / 2, h / 2 + 2);
      tex.needsUpdate = true;
    };
    return sp;
  }

  /** Panah 3D. */
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
  function lantai(opt) {
    opt = opt || {};
    const g = new T.Group();
    const m = new T.Mesh(
      new T.CircleGeometry(opt.r || 9, 64),
      new T.MeshStandardMaterial({
        color: opt.warna !== undefined ? opt.warna : 0x151c23,
        roughness: 0.92, metalness: 0.0, envMapIntensity: 0.22
      })
    );
    m.rotation.x = -Math.PI / 2;
    m.position.y = opt.y !== undefined ? opt.y : 0;
    m.receiveShadow = true;
    g.add(m);
    if (opt.kisi !== false) {
      const kisi = new T.GridHelper(opt.r ? opt.r * 2 : 18, opt.kisiN || 24, 0x2e3a44, 0x24303a);
      kisi.position.y = (opt.y !== undefined ? opt.y : 0) + 0.004;
      kisi.material.opacity = 0.28; kisi.material.transparent = true;
      g.add(kisi);
    }
    return g;
  }

  /* ====================================================== PETA LINGKUNGAN =
     Tanpa peta lingkungan, bahan kaca dan logam terlihat datar. Kita bangun
     studio kecil berisi bidang-bidang bercahaya, lalu saring dengan PMREM
     sehingga pantulannya lembut. Dibuat sekali, dipakai seluruh simulasi. */

  let _env = null;
  function lingkungan(renderer) {
    if (_env) return _env;
    const st = new T.Scene();
    const kotak = new T.BoxGeometry(1, 1, 1);
    kotak.deleteAttribute('uv');

    function bidang(w, h, d, x, y, z, warna, kuat) {
      const m = new T.Mesh(kotak, new T.MeshBasicMaterial({
        color: new T.Color(warna).multiplyScalar(kuat), side: T.BackSide
      }));
      m.scale.set(w, h, d); m.position.set(x, y, z);
      st.add(m);
      return m;
    }
    // ruangan
    bidang(26, 16, 26, 0, 4, 0, 0x2a363f, 0.22);
    // langit-langit terang (cahaya utama pantulan)
    const lampu = new T.Mesh(kotak, new T.MeshBasicMaterial({ color: new T.Color(0xffffff).multiplyScalar(5.5) }));
    lampu.scale.set(9, 0.4, 9); lampu.position.set(0, 10.6, 0);
    st.add(lampu);
    // sisi dingin dan sisi hangat agar pantulan punya arah
    const kiri = new T.Mesh(kotak, new T.MeshBasicMaterial({ color: new T.Color(0x6fb6ff).multiplyScalar(0.9) }));
    kiri.scale.set(0.4, 9, 12); kiri.position.set(-11, 4, 0);
    st.add(kiri);
    const kanan = new T.Mesh(kotak, new T.MeshBasicMaterial({ color: new T.Color(0xffc98a).multiplyScalar(0.7) }));
    kanan.scale.set(0.4, 9, 12); kanan.position.set(11, 4, 0);
    st.add(kanan);
    const belakang = new T.Mesh(kotak, new T.MeshBasicMaterial({ color: new T.Color(0xffffff).multiplyScalar(0.45) }));
    belakang.scale.set(14, 7, 0.4); belakang.position.set(0, 4, -9);
    st.add(belakang);

    const pmrem = new T.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    _env = pmrem.fromScene(st, 0.035).texture;
    pmrem.dispose();
    st.traverse(function (o) { if (o.material) o.material.dispose(); });
    kotak.dispose();
    return _env;
  }

  /* ========================================================== RIG CAHAYA = */

  function rigCahaya(scene, opt) {
    opt = opt || {};
    const g = new T.Group();

    const hemi = new T.HemisphereLight(0x9fc4e8, 0x141b22, opt.hemi !== undefined ? opt.hemi : 0.45);
    g.add(hemi);

    const kunci = new T.DirectionalLight(0xffffff, opt.kunci !== undefined ? opt.kunci : 1.9);
    kunci.position.set(4.5, 7, 5.5);
    kunci.castShadow = opt.bayangan !== false;
    if (kunci.castShadow) {
      kunci.shadow.mapSize.set(1024, 1024);
      kunci.shadow.camera.near = 1;
      kunci.shadow.camera.far = 28;
      const s = opt.luasBayangan || 7;
      kunci.shadow.camera.left = -s; kunci.shadow.camera.right = s;
      kunci.shadow.camera.top = s; kunci.shadow.camera.bottom = -s;
      kunci.shadow.bias = -0.0012;
      kunci.shadow.normalBias = 0.022;
    }
    g.add(kunci);

    const isi = new T.DirectionalLight(0x9fd0ff, opt.isi !== undefined ? opt.isi : 0.75);
    isi.position.set(-6, 2.5, 3);
    g.add(isi);

    const tepi = new T.DirectionalLight(0xffe0bd, opt.tepi !== undefined ? opt.tepi : 0.7);
    tepi.position.set(-2.5, 3.5, -6.5);
    g.add(tepi);

    g.add(new T.AmbientLight(0xffffff, opt.ambien !== undefined ? opt.ambien : 0.18));

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
    gambarGrafik: gambarGrafik, gambarBatang: gambarBatang,
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
