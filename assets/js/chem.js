/* ==========================================================================
   SimKimia — chem.js
   Data dan perhitungan kimia yang dipakai bersama oleh seluruh simulasi:
   tabel periodik 118 unsur, konfigurasi elektron, massa molar, tetapan
   kesetimbangan, potensial elektrode, dan fungsi bantu lainnya.
   ========================================================================== */

(function (global) {
  'use strict';

  /* ======================================================= TABEL PERIODIK = */
  /* [Z, lambang, nama Indonesia, massa (g/mol), golongan, periode,
      kategori, keelektronegatifan (Pauling, null bila tak lazim)]           */

  const RAW = [
    [1,'H','Hidrogen',1.008,1,1,'nonlogam',2.20],
    [2,'He','Helium',4.003,18,1,'gas-mulia',null],
    [3,'Li','Litium',6.94,1,2,'alkali',0.98],
    [4,'Be','Berilium',9.012,2,2,'alkali-tanah',1.57],
    [5,'B','Boron',10.81,13,2,'metaloid',2.04],
    [6,'C','Karbon',12.011,14,2,'nonlogam',2.55],
    [7,'N','Nitrogen',14.007,15,2,'nonlogam',3.04],
    [8,'O','Oksigen',15.999,16,2,'nonlogam',3.44],
    [9,'F','Fluorin',18.998,17,2,'halogen',3.98],
    [10,'Ne','Neon',20.180,18,2,'gas-mulia',null],
    [11,'Na','Natrium',22.990,1,3,'alkali',0.93],
    [12,'Mg','Magnesium',24.305,2,3,'alkali-tanah',1.31],
    [13,'Al','Aluminium',26.982,13,3,'pasca-transisi',1.61],
    [14,'Si','Silikon',28.085,14,3,'metaloid',1.90],
    [15,'P','Fosforus',30.974,15,3,'nonlogam',2.19],
    [16,'S','Belerang',32.06,16,3,'nonlogam',2.58],
    [17,'Cl','Klorin',35.45,17,3,'halogen',3.16],
    [18,'Ar','Argon',39.948,18,3,'gas-mulia',null],
    [19,'K','Kalium',39.098,1,4,'alkali',0.82],
    [20,'Ca','Kalsium',40.078,2,4,'alkali-tanah',1.00],
    [21,'Sc','Skandium',44.956,3,4,'transisi',1.36],
    [22,'Ti','Titanium',47.867,4,4,'transisi',1.54],
    [23,'V','Vanadium',50.942,5,4,'transisi',1.63],
    [24,'Cr','Kromium',51.996,6,4,'transisi',1.66],
    [25,'Mn','Mangan',54.938,7,4,'transisi',1.55],
    [26,'Fe','Besi',55.845,8,4,'transisi',1.83],
    [27,'Co','Kobalt',58.933,9,4,'transisi',1.88],
    [28,'Ni','Nikel',58.693,10,4,'transisi',1.91],
    [29,'Cu','Tembaga',63.546,11,4,'transisi',1.90],
    [30,'Zn','Seng',65.38,12,4,'transisi',1.65],
    [31,'Ga','Galium',69.723,13,4,'pasca-transisi',1.81],
    [32,'Ge','Germanium',72.630,14,4,'metaloid',2.01],
    [33,'As','Arsen',74.922,15,4,'metaloid',2.18],
    [34,'Se','Selenium',78.971,16,4,'nonlogam',2.55],
    [35,'Br','Bromin',79.904,17,4,'halogen',2.96],
    [36,'Kr','Kripton',83.798,18,4,'gas-mulia',3.00],
    [37,'Rb','Rubidium',85.468,1,5,'alkali',0.82],
    [38,'Sr','Stronsium',87.62,2,5,'alkali-tanah',0.95],
    [39,'Y','Itrium',88.906,3,5,'transisi',1.22],
    [40,'Zr','Zirkonium',91.224,4,5,'transisi',1.33],
    [41,'Nb','Niobium',92.906,5,5,'transisi',1.60],
    [42,'Mo','Molibdenum',95.95,6,5,'transisi',2.16],
    [43,'Tc','Teknesium',98,7,5,'transisi',1.90],
    [44,'Ru','Rutenium',101.07,8,5,'transisi',2.20],
    [45,'Rh','Rodium',102.91,9,5,'transisi',2.28],
    [46,'Pd','Paladium',106.42,10,5,'transisi',2.20],
    [47,'Ag','Perak',107.87,11,5,'transisi',1.93],
    [48,'Cd','Kadmium',112.41,12,5,'transisi',1.69],
    [49,'In','Indium',114.82,13,5,'pasca-transisi',1.78],
    [50,'Sn','Timah',118.71,14,5,'pasca-transisi',1.96],
    [51,'Sb','Antimon',121.76,15,5,'metaloid',2.05],
    [52,'Te','Telurium',127.60,16,5,'metaloid',2.10],
    [53,'I','Iodin',126.90,17,5,'halogen',2.66],
    [54,'Xe','Xenon',131.29,18,5,'gas-mulia',2.60],
    [55,'Cs','Sesium',132.91,1,6,'alkali',0.79],
    [56,'Ba','Barium',137.33,2,6,'alkali-tanah',0.89],
    [57,'La','Lantanum',138.91,3,6,'lantanida',1.10],
    [58,'Ce','Serium',140.12,null,6,'lantanida',1.12],
    [59,'Pr','Praseodimium',140.91,null,6,'lantanida',1.13],
    [60,'Nd','Neodimium',144.24,null,6,'lantanida',1.14],
    [61,'Pm','Prometium',145,null,6,'lantanida',1.13],
    [62,'Sm','Samarium',150.36,null,6,'lantanida',1.17],
    [63,'Eu','Europium',151.96,null,6,'lantanida',1.20],
    [64,'Gd','Gadolinium',157.25,null,6,'lantanida',1.20],
    [65,'Tb','Terbium',158.93,null,6,'lantanida',1.10],
    [66,'Dy','Disprosium',162.50,null,6,'lantanida',1.22],
    [67,'Ho','Holmium',164.93,null,6,'lantanida',1.23],
    [68,'Er','Erbium',167.26,null,6,'lantanida',1.24],
    [69,'Tm','Tulium',168.93,null,6,'lantanida',1.25],
    [70,'Yb','Iterbium',173.05,null,6,'lantanida',1.10],
    [71,'Lu','Lutesium',174.97,null,6,'lantanida',1.27],
    [72,'Hf','Hafnium',178.49,4,6,'transisi',1.30],
    [73,'Ta','Tantalum',180.95,5,6,'transisi',1.50],
    [74,'W','Wolfram',183.84,6,6,'transisi',2.36],
    [75,'Re','Renium',186.21,7,6,'transisi',1.90],
    [76,'Os','Osmium',190.23,8,6,'transisi',2.20],
    [77,'Ir','Iridium',192.22,9,6,'transisi',2.20],
    [78,'Pt','Platina',195.08,10,6,'transisi',2.28],
    [79,'Au','Emas',196.97,11,6,'transisi',2.54],
    [80,'Hg','Raksa',200.59,12,6,'transisi',2.00],
    [81,'Tl','Talium',204.38,13,6,'pasca-transisi',1.62],
    [82,'Pb','Timbal',207.2,14,6,'pasca-transisi',2.33],
    [83,'Bi','Bismut',208.98,15,6,'pasca-transisi',2.02],
    [84,'Po','Polonium',209,16,6,'metaloid',2.00],
    [85,'At','Astatin',210,17,6,'halogen',2.20],
    [86,'Rn','Radon',222,18,6,'gas-mulia',2.20],
    [87,'Fr','Fransium',223,1,7,'alkali',0.70],
    [88,'Ra','Radium',226,2,7,'alkali-tanah',0.90],
    [89,'Ac','Aktinium',227,3,7,'aktinida',1.10],
    [90,'Th','Torium',232.04,null,7,'aktinida',1.30],
    [91,'Pa','Protaktinium',231.04,null,7,'aktinida',1.50],
    [92,'U','Uranium',238.03,null,7,'aktinida',1.38],
    [93,'Np','Neptunium',237,null,7,'aktinida',1.36],
    [94,'Pu','Plutonium',244,null,7,'aktinida',1.28],
    [95,'Am','Amerisium',243,null,7,'aktinida',1.13],
    [96,'Cm','Kurium',247,null,7,'aktinida',1.28],
    [97,'Bk','Berkelium',247,null,7,'aktinida',1.30],
    [98,'Cf','Kalifornium',251,null,7,'aktinida',1.30],
    [99,'Es','Einsteinium',252,null,7,'aktinida',1.30],
    [100,'Fm','Fermium',257,null,7,'aktinida',1.30],
    [101,'Md','Mendelevium',258,null,7,'aktinida',1.30],
    [102,'No','Nobelium',259,null,7,'aktinida',1.30],
    [103,'Lr','Lawrensium',266,null,7,'aktinida',1.30],
    [104,'Rf','Ruterfordium',267,4,7,'transisi',null],
    [105,'Db','Dubnium',268,5,7,'transisi',null],
    [106,'Sg','Seaborgium',269,6,7,'transisi',null],
    [107,'Bh','Bohrium',270,7,7,'transisi',null],
    [108,'Hs','Hasium',269,8,7,'transisi',null],
    [109,'Mt','Meitnerium',278,9,7,'transisi',null],
    [110,'Ds','Darmstadtium',281,10,7,'transisi',null],
    [111,'Rg','Rontgenium',282,11,7,'transisi',null],
    [112,'Cn','Kopernisium',285,12,7,'transisi',null],
    [113,'Nh','Nihonium',286,13,7,'pasca-transisi',null],
    [114,'Fl','Flerovium',289,14,7,'pasca-transisi',null],
    [115,'Mc','Moskovium',290,15,7,'pasca-transisi',null],
    [116,'Lv','Livermorium',293,16,7,'pasca-transisi',null],
    [117,'Ts','Tenesin',294,17,7,'halogen',null],
    [118,'Og','Oganeson',294,18,7,'gas-mulia',null]
  ];

  const ELEMENTS = RAW.map(function (r) {
    return { Z: r[0], sym: r[1], nama: r[2], massa: r[3], gol: r[4], periode: r[5], kategori: r[6], en: r[7] };
  });

  const byZ = {}, bySym = {};
  ELEMENTS.forEach(function (e) { byZ[e.Z] = e; bySym[e.sym] = e; });

  /** Posisi sel di kisi 18 kolom (baris 8 & 9 untuk lantanida/aktinida). */
  function gridPos(e) {
    if (e.Z >= 57 && e.Z <= 71) return { col: e.Z - 57 + 3, row: 8 };
    if (e.Z >= 89 && e.Z <= 103) return { col: e.Z - 89 + 3, row: 9 };
    return { col: e.gol, row: e.periode };
  }

  const KATEGORI_WARNA = {
    'alkali':          '#ef6a52',
    'alkali-tanah':    '#f0a94a',
    'transisi':        '#e8c84a',
    'pasca-transisi':  '#6fcf7f',
    'metaloid':        '#4fd1c0',
    'nonlogam':        '#5b9bf5',
    'halogen':         '#8e7af0',
    'gas-mulia':       '#d67ae0',
    'lantanida':       '#f0718f',
    'aktinida':        '#e85a9e'
  };

  const KATEGORI_NAMA = {
    'alkali':         'Logam alkali',
    'alkali-tanah':   'Logam alkali tanah',
    'transisi':       'Logam transisi',
    'pasca-transisi': 'Logam pasca-transisi',
    'metaloid':       'Metaloid',
    'nonlogam':       'Nonlogam',
    'halogen':        'Halogen',
    'gas-mulia':      'Gas mulia',
    'lantanida':      'Lantanida',
    'aktinida':       'Aktinida'
  };

  /* =============================================== KONFIGURASI ELEKTRON == */

  // Urutan pengisian menurut aturan Aufbau (diagram Moeller).
  const AUFBAU = [
    ['1s',2],['2s',2],['2p',6],['3s',2],['3p',6],['4s',2],['3d',10],['4p',6],
    ['5s',2],['4d',10],['5p',6],['6s',2],['4f',14],['5d',10],['6p',6],
    ['7s',2],['5f',14],['6d',10],['7p',6]
  ];

  // Unsur yang menyimpang dari Aufbau (penstabilan subkulit setengah/penuh).
  const PENYIMPANGAN = {
    24: '1s2 2s2 2p6 3s2 3p6 4s1 3d5',       // Cr
    29: '1s2 2s2 2p6 3s2 3p6 4s1 3d10',      // Cu
    41: '[Kr] 5s1 4d4', 42: '[Kr] 5s1 4d5', 44: '[Kr] 5s1 4d7',
    45: '[Kr] 5s1 4d8', 46: '[Kr] 4d10', 47: '[Kr] 5s1 4d10',
    78: '[Xe] 6s1 4f14 5d9', 79: '[Xe] 6s1 4f14 5d10'
  };

  /** Konfigurasi elektron penuh sebagai daftar [subkulit, jumlah]. */
  function konfigurasi(Z) {
    const out = [];
    let sisa = Z;
    for (let i = 0; i < AUFBAU.length && sisa > 0; i++) {
      const n = Math.min(sisa, AUFBAU[i][1]);
      out.push([AUFBAU[i][0], n]);
      sisa -= n;
    }
    return out;
  }

  /** Konfigurasi sebagai teks, mis. "1s2 2s2 2p6 3s2 3p4". */
  function konfigurasiTeks(Z) {
    return konfigurasi(Z).map(function (p) { return p[0] + p[1]; }).join(' ');
  }

  /** Jumlah elektron per kulit (n = 1, 2, 3, ...) — untuk model Bohr. */
  function kulit(Z) {
    const sh = [];
    konfigurasi(Z).forEach(function (p) {
      const n = parseInt(p[0][0], 10);
      sh[n - 1] = (sh[n - 1] || 0) + p[1];
    });
    for (let i = 0; i < sh.length; i++) if (!sh[i]) sh[i] = 0;
    while (sh.length && sh[sh.length - 1] === 0) sh.pop();
    return sh;
  }

  /** Elektron valensi (kulit terluar; untuk logam transisi ns + (n−1)d). */
  function valensi(Z) {
    const e = byZ[Z];
    if (!e) return 0;
    const sh = kulit(Z);
    if (e.kategori === 'transisi') {
      const k = konfigurasi(Z);
      let v = 0;
      const nMax = sh.length;
      k.forEach(function (p) {
        const n = parseInt(p[0][0], 10), jenis = p[0][1];
        if (n === nMax && jenis === 's') v += p[1];
        if (n === nMax - 1 && jenis === 'd') v += p[1];
      });
      return v;
    }
    return sh[sh.length - 1] || 0;
  }

  /** Lambang gas mulia terdekat di bawahnya, mis. 17 → "[Ne]". */
  function intiGasMulia(Z) {
    const mulia = [2, 10, 18, 36, 54, 86];
    for (let i = mulia.length - 1; i >= 0; i--) if (mulia[i] < Z) return '[' + byZ[mulia[i]].sym + ']';
    return '';
  }

  /* ================================================= PENGURAI RUMUS KIMIA = */

  /**
   * Mengurai rumus kimia menjadi {unsur: jumlah}.
   * Mendukung tanda kurung bertingkat dan hidrat: "CuSO4.5H2O", "Ca(OH)2".
   */
  function urai(rumus) {
    const bagian = String(rumus).split(/[·.]/);
    const total = {};
    bagian.forEach(function (b) {
      b = b.trim();
      if (!b) return;
      // koefisien hidrat di depan, mis. "5H2O"
      const m = b.match(/^(\d+)(.*)$/);
      let mult = 1;
      if (m) { mult = parseInt(m[1], 10); b = m[2]; }
      const sub = uraiSatu(b);
      for (const k in sub) total[k] = (total[k] || 0) + sub[k] * mult;
    });
    return total;
  }

  function uraiSatu(s) {
    const tumpukan = [{}];
    let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (c === '(' || c === '[') { tumpukan.push({}); i++; continue; }
      if (c === ')' || c === ']') {
        const atas = tumpukan.pop();
        i++;
        let n = '';
        while (i < s.length && /\d/.test(s[i])) n += s[i++];
        const mult = n ? parseInt(n, 10) : 1;
        const bawah = tumpukan[tumpukan.length - 1];
        for (const k in atas) bawah[k] = (bawah[k] || 0) + atas[k] * mult;
        continue;
      }
      if (/[A-Z]/.test(c)) {
        let sym = c; i++;
        while (i < s.length && /[a-z]/.test(s[i])) sym += s[i++];
        let n = '';
        while (i < s.length && /\d/.test(s[i])) n += s[i++];
        const mult = n ? parseInt(n, 10) : 1;
        const atas = tumpukan[tumpukan.length - 1];
        atas[sym] = (atas[sym] || 0) + mult;
        continue;
      }
      i++; // lewati karakter lain (spasi, muatan, dsb.)
    }
    return tumpukan[0];
  }

  /** Massa molar (g/mol) dari rumus kimia. */
  function massaMolar(rumus) {
    const u = urai(rumus);
    let m = 0;
    for (const k in u) {
      if (!bySym[k]) return NaN;
      m += bySym[k].massa * u[k];
    }
    return m;
  }

  /** Jumlah total atom dalam satu satuan rumus. */
  function jumlahAtom(rumus) {
    const u = urai(rumus);
    let n = 0;
    for (const k in u) n += u[k];
    return n;
  }

  /* ====================================================== ION & SENYAWA == */

  const KATION = [
    { rumus: 'Na^+', nama: 'natrium', muatan: 1, warna: '#a5b4c8' },
    { rumus: 'K^+', nama: 'kalium', muatan: 1, warna: '#b89fe0' },
    { rumus: 'Li^+', nama: 'litium', muatan: 1, warna: '#d8a0a0' },
    { rumus: 'NH4^+', nama: 'amonium', muatan: 1, warna: '#8fb8d8' },
    { rumus: 'Mg^2+', nama: 'magnesium', muatan: 2, warna: '#c9d6a0' },
    { rumus: 'Ca^2+', nama: 'kalsium', muatan: 2, warna: '#d4d4a8' },
    { rumus: 'Ba^2+', nama: 'barium', muatan: 2, warna: '#c4cf8e' },
    { rumus: 'Fe^2+', nama: 'besi(II)', muatan: 2, warna: '#8fae7a' },
    { rumus: 'Fe^3+', nama: 'besi(III)', muatan: 3, warna: '#c08a4a' },
    { rumus: 'Cu^2+', nama: 'tembaga(II)', muatan: 2, warna: '#4a9fd0' },
    { rumus: 'Zn^2+', nama: 'seng', muatan: 2, warna: '#b0b8c0' },
    { rumus: 'Ag^+', nama: 'perak', muatan: 1, warna: '#cfd4d8' },
    { rumus: 'Pb^2+', nama: 'timbal(II)', muatan: 2, warna: '#9aa0a8' },
    { rumus: 'Al^3+', nama: 'aluminium', muatan: 3, warna: '#c0c6cc' }
  ];

  const ANION = [
    { rumus: 'Cl^-', nama: 'klorida', muatan: -1, warna: '#86d47a' },
    { rumus: 'Br^-', nama: 'bromida', muatan: -1, warna: '#c08050' },
    { rumus: 'I^-', nama: 'iodida', muatan: -1, warna: '#9a6fd0' },
    { rumus: 'F^-', nama: 'fluorida', muatan: -1, warna: '#a8e088' },
    { rumus: 'OH^-', nama: 'hidroksida', muatan: -1, warna: '#6aa8e0' },
    { rumus: 'NO3^-', nama: 'nitrat', muatan: -1, warna: '#88c0d8' },
    { rumus: 'CH3COO^-', nama: 'asetat', muatan: -1, warna: '#d0b088' },
    { rumus: 'SO4^2-', nama: 'sulfat', muatan: -2, warna: '#e0c860' },
    { rumus: 'CO3^2-', nama: 'karbonat', muatan: -2, warna: '#a0a8b0' },
    { rumus: 'S^2-', nama: 'sulfida', muatan: -2, warna: '#d8c050' },
    { rumus: 'PO4^3-', nama: 'fosfat', muatan: -3, warna: '#d08858' },
    { rumus: 'CrO4^2-', nama: 'kromat', muatan: -2, warna: '#e8c020' }
  ];

  /** Gabungkan kation + anion menjadi rumus senyawa netral (silang muatan). */
  function senyawaIon(kation, anion) {
    const a = Math.abs(kation.muatan), b = Math.abs(anion.muatan);
    const g = pembagiTerbesar(a, b);
    const nK = b / g, nA = a / g;
    const inti = function (r) { return r.replace(/\^.*$/, ''); };
    const poliK = /[A-Z].*[A-Z]|\d/.test(inti(kation.rumus));
    const poliA = /[A-Z].*[A-Z]/.test(inti(anion.rumus));
    const K = nK > 1 && poliK ? '(' + inti(kation.rumus) + ')' + nK : inti(kation.rumus) + (nK > 1 ? nK : '');
    const A = nA > 1 && poliA ? '(' + inti(anion.rumus) + ')' + nA : inti(anion.rumus) + (nA > 1 ? nA : '');
    return { rumus: K + A, nK: nK, nA: nA, nama: namaSenyawaIon(kation, anion) };
  }

  function namaSenyawaIon(k, a) {
    const romawi = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV' };
    let nk = k.nama;
    // nama sudah memuat angka romawi untuk logam bermuatan ganda
    return a.nama + ' ' + nk;
  }

  function pembagiTerbesar(a, b) { return b === 0 ? a : pembagiTerbesar(b, a % b); }

  /* ======================================================= ASAM & BASA === */

  /** Tetapan ionisasi asam lemah pada 25 °C. */
  const ASAM = {
    'HCl':        { nama: 'asam klorida',  Ka: Infinity, kuat: true,  valensi: 1 },
    'HBr':        { nama: 'asam bromida',  Ka: Infinity, kuat: true,  valensi: 1 },
    'HNO3':       { nama: 'asam nitrat',   Ka: Infinity, kuat: true,  valensi: 1 },
    'H2SO4':      { nama: 'asam sulfat',   Ka: Infinity, kuat: true,  valensi: 2 },
    'CH3COOH':    { nama: 'asam asetat',   Ka: 1.8e-5,   kuat: false, valensi: 1 },
    'HCOOH':      { nama: 'asam format',   Ka: 1.8e-4,   kuat: false, valensi: 1 },
    'HF':         { nama: 'asam fluorida', Ka: 6.8e-4,   kuat: false, valensi: 1 },
    'HCN':        { nama: 'asam sianida',  Ka: 6.2e-10,  kuat: false, valensi: 1 },
    'H2CO3':      { nama: 'asam karbonat', Ka: 4.3e-7,   kuat: false, valensi: 2 },
    'H3PO4':      { nama: 'asam fosfat',   Ka: 7.5e-3,   kuat: false, valensi: 3 },
    'C6H8O7':     { nama: 'asam sitrat',   Ka: 7.4e-4,   kuat: false, valensi: 3 },
    'H2S':        { nama: 'asam sulfida',  Ka: 9.1e-8,   kuat: false, valensi: 2 }
  };

  const BASA = {
    'NaOH':       { nama: 'natrium hidroksida',   Kb: Infinity, kuat: true,  valensi: 1 },
    'KOH':        { nama: 'kalium hidroksida',    Kb: Infinity, kuat: true,  valensi: 1 },
    'Ca(OH)2':    { nama: 'kalsium hidroksida',   Kb: Infinity, kuat: true,  valensi: 2 },
    'Ba(OH)2':    { nama: 'barium hidroksida',    Kb: Infinity, kuat: true,  valensi: 2 },
    'NH3':        { nama: 'amonia',               Kb: 1.8e-5,   kuat: false, valensi: 1 },
    'CH3NH2':     { nama: 'metilamina',           Kb: 4.4e-4,   kuat: false, valensi: 1 },
    'Mg(OH)2':    { nama: 'magnesium hidroksida', Kb: 2.5e-3,   kuat: false, valensi: 2 }
  };

  const Kw = 1.0e-14;

  /** pH larutan asam: kuat → langsung, lemah → akar Ka·C (eksak kuadrat). */
  function pHAsam(C, Ka, valensi) {
    valensi = valensi || 1;
    if (C <= 0) return 7;
    if (!isFinite(Ka)) return -Math.log10(C * valensi);
    // Ka = x²/(C − x)  →  x² + Ka·x − Ka·C = 0
    const x = (-Ka + Math.sqrt(Ka * Ka + 4 * Ka * C)) / 2;
    return -Math.log10(Math.max(x, 1e-14));
  }

  function pHBasa(C, Kb, valensi) {
    valensi = valensi || 1;
    if (C <= 0) return 7;
    let oh;
    if (!isFinite(Kb)) oh = C * valensi;
    else oh = (-Kb + Math.sqrt(Kb * Kb + 4 * Kb * C)) / 2;
    return 14 + Math.log10(Math.max(oh, 1e-14));
  }

  /** pH larutan penyangga (persamaan Henderson–Hasselbalch). */
  function pHBuffer(Ca, Cg, Ka) {
    if (Ca <= 0 || Cg <= 0) return NaN;
    return -Math.log10(Ka) + Math.log10(Cg / Ca);
  }

  /** Warna larutan menurut pH (skala indikator universal). */
  function warnaPH(pH) {
    const skala = [
      [0, '#d2232a'], [2, '#e8442b'], [3, '#f07c26'], [4, '#f5a623'],
      [5, '#f2d024'], [6, '#c8d32a'], [7, '#54b64c'], [8, '#2fa58c'],
      [9, '#2f86b8'], [10, '#2a5fae'], [11, '#3f3f9e'], [12, '#5a2f92'],
      [14, '#43206e']
    ];
    pH = Math.max(0, Math.min(14, pH));
    for (let i = 0; i < skala.length - 1; i++) {
      if (pH >= skala[i][0] && pH <= skala[i + 1][0]) {
        const t = (pH - skala[i][0]) / (skala[i + 1][0] - skala[i][0]);
        return campurHex(skala[i][1], skala[i + 1][1], t);
      }
    }
    return skala[skala.length - 1][1];
  }

  function campurHex(a, b, t) {
    const pa = [parseInt(a.slice(1, 3), 16), parseInt(a.slice(3, 5), 16), parseInt(a.slice(5, 7), 16)];
    const pb = [parseInt(b.slice(1, 3), 16), parseInt(b.slice(3, 5), 16), parseInt(b.slice(5, 7), 16)];
    return 'rgb(' + Math.round(pa[0] + (pb[0] - pa[0]) * t) + ',' +
      Math.round(pa[1] + (pb[1] - pa[1]) * t) + ',' +
      Math.round(pa[2] + (pb[2] - pa[2]) * t) + ')';
  }

  /** Indikator asam-basa: trayek pH dan warna. */
  const INDIKATOR = {
    'lakmus':        { nama: 'Kertas lakmus',    lo: 5.0, hi: 8.0, warnaAsam: '#e0442b', warnaBasa: '#3a6fd0' },
    'fenolftalein':  { nama: 'Fenolftalein (PP)', lo: 8.3, hi: 10.0, warnaAsam: '#f2f2f0', warnaBasa: '#e05a9e' },
    'metil-jingga':  { nama: 'Metil jingga (MO)', lo: 3.1, hi: 4.4, warnaAsam: '#e0442b', warnaBasa: '#f0b020' },
    'bromtimol':     { nama: 'Bromtimol biru (BTB)', lo: 6.0, hi: 7.6, warnaAsam: '#e8d030', warnaBasa: '#2a6fc0' },
    'kubis-ungu':    { nama: 'Ekstrak kubis ungu', lo: 0, hi: 14, warnaAsam: '#d2232a', warnaBasa: '#43206e' },
    'universal':     { nama: 'Indikator universal', lo: 0, hi: 14, warnaAsam: '#d2232a', warnaBasa: '#43206e' }
  };

  function warnaIndikator(kunci, pH) {
    const ind = INDIKATOR[kunci];
    if (!ind) return warnaPH(pH);
    if (kunci === 'kubis-ungu' || kunci === 'universal') return warnaPH(pH);
    if (pH <= ind.lo) return ind.warnaAsam;
    if (pH >= ind.hi) return ind.warnaBasa;
    return campurHex(ind.warnaAsam, ind.warnaBasa, (pH - ind.lo) / (ind.hi - ind.lo));
  }

  /* ======================================================== KELARUTAN === */

  /** Hasil kali kelarutan pada 25 °C. */
  const KSP = {
    'AgCl':    { Ksp: 1.8e-10, n: [1, 1], nama: 'perak klorida', warna: '#e8e8e8' },
    'AgBr':    { Ksp: 5.0e-13, n: [1, 1], nama: 'perak bromida', warna: '#f0e0b0' },
    'AgI':     { Ksp: 8.5e-17, n: [1, 1], nama: 'perak iodida', warna: '#f0d878' },
    'BaSO4':   { Ksp: 1.1e-10, n: [1, 1], nama: 'barium sulfat', warna: '#ffffff' },
    'CaCO3':   { Ksp: 3.3e-9,  n: [1, 1], nama: 'kalsium karbonat', warna: '#f4f4f0' },
    'CaSO4':   { Ksp: 4.9e-5,  n: [1, 1], nama: 'kalsium sulfat', warna: '#f8f8f4' },
    'PbI2':    { Ksp: 9.8e-9,  n: [1, 2], nama: 'timbal(II) iodida', warna: '#f0d040' },
    'PbCl2':   { Ksp: 1.7e-5,  n: [1, 2], nama: 'timbal(II) klorida', warna: '#ffffff' },
    'Mg(OH)2': { Ksp: 5.6e-12, n: [1, 2], nama: 'magnesium hidroksida', warna: '#f2f6f2' },
    'Fe(OH)3': { Ksp: 2.8e-39, n: [1, 3], nama: 'besi(III) hidroksida', warna: '#b06a30' },
    'CuS':     { Ksp: 8.0e-37, n: [1, 1], nama: 'tembaga(II) sulfida', warna: '#241c18' },
    'ZnS':     { Ksp: 1.6e-24, n: [1, 1], nama: 'seng sulfida', warna: '#f0f0ea' }
  };

  /** Kelarutan molar s dari Ksp untuk rumus MₐXᵦ. */
  function kelarutan(Ksp, a, b) {
    const k = Math.pow(a, a) * Math.pow(b, b);
    return Math.pow(Ksp / k, 1 / (a + b));
  }

  /* ====================================================== ELEKTROKIMIA == */

  /** Potensial reduksi standar E° (volt) pada 25 °C. */
  const E_STANDAR = [
    { pasangan: 'Li^+/Li',   E: -3.04, logam: 'Li', warna: '#d8a0a0' },
    { pasangan: 'K^+/K',     E: -2.92, logam: 'K',  warna: '#b89fe0' },
    { pasangan: 'Ca^2+/Ca',  E: -2.87, logam: 'Ca', warna: '#d4d4a8' },
    { pasangan: 'Na^+/Na',   E: -2.71, logam: 'Na', warna: '#a5b4c8' },
    { pasangan: 'Mg^2+/Mg',  E: -2.37, logam: 'Mg', warna: '#c9d6a0' },
    { pasangan: 'Al^3+/Al',  E: -1.66, logam: 'Al', warna: '#c0c6cc' },
    { pasangan: 'Zn^2+/Zn',  E: -0.76, logam: 'Zn', warna: '#aab4bd' },
    { pasangan: 'Fe^2+/Fe',  E: -0.44, logam: 'Fe', warna: '#8d8176' },
    { pasangan: 'Ni^2+/Ni',  E: -0.25, logam: 'Ni', warna: '#b6b8a8' },
    { pasangan: 'Sn^2+/Sn',  E: -0.14, logam: 'Sn', warna: '#c3c6c9' },
    { pasangan: 'Pb^2+/Pb',  E: -0.13, logam: 'Pb', warna: '#8d939a' },
    { pasangan: 'H^+/H2',    E:  0.00, logam: 'H',  warna: '#dfe4e8' },
    { pasangan: 'Cu^2+/Cu',  E: +0.34, logam: 'Cu', warna: '#c4703a' },
    { pasangan: 'Ag^+/Ag',   E: +0.80, logam: 'Ag', warna: '#cfd4d8' },
    { pasangan: 'Au^3+/Au',  E: +1.50, logam: 'Au', warna: '#d8ab35' }
  ];

  const F = 96485;      // tetapan Faraday, C/mol
  const R = 8.314;      // tetapan gas, J/(mol·K)
  const NA = 6.022e23;  // bilangan Avogadro

  /** Persamaan Nernst: E = E° − (RT/nF)·ln Q */
  function nernst(E0, n, Q, T) {
    T = T || 298.15;
    return E0 - (R * T / (n * F)) * Math.log(Q);
  }

  /* ========================================================= TERMOKIMIA == */

  /** Entalpi pembentukan standar ΔH°f (kJ/mol) pada 25 °C. */
  const DHF = {
    'H2O(l)': -285.8, 'H2O(g)': -241.8, 'CO2(g)': -393.5, 'CO(g)': -110.5,
    'CH4(g)': -74.8, 'C2H6(g)': -84.7, 'C3H8(g)': -103.8, 'C4H10(g)': -126.1,
    'C2H5OH(l)': -277.7, 'C6H12O6(s)': -1273.3, 'C(s)': 0, 'O2(g)': 0,
    'H2(g)': 0, 'N2(g)': 0, 'NH3(g)': -46.1, 'NO(g)': 90.3, 'NO2(g)': 33.2,
    'SO2(g)': -296.8, 'SO3(g)': -395.7, 'NaCl(s)': -411.2, 'CaCO3(s)': -1206.9,
    'CaO(s)': -635.1, 'HCl(g)': -92.3, 'C8H18(l)': -250.1
  };

  /** Energi ikatan rata-rata (kJ/mol). */
  const ENERGI_IKATAN = {
    'H-H': 436, 'C-H': 413, 'C-C': 347, 'C=C': 614, 'C≡C': 839,
    'O=O': 498, 'C=O': 799, 'O-H': 467, 'N≡N': 941, 'N-H': 391,
    'Cl-Cl': 243, 'H-Cl': 431, 'C-O': 358, 'C-Cl': 339, 'Br-Br': 193,
    'H-Br': 366, 'F-F': 159, 'H-F': 567, 'N-N': 160, 'C-N': 305
  };

  const KALOR_JENIS = { air: 4.18, etanol: 2.44, aluminium: 0.90, besi: 0.45, tembaga: 0.39, timbal: 0.13 };

  /* ======================================================== GAS & LARUTAN */

  const RGAS = 0.08206;   // L·atm/(mol·K)

  /** Hukum gas ideal: beri tiga dari empat, kembalikan yang keempat. */
  function gasIdeal(opt) {
    const P = opt.P, V = opt.V, n = opt.n, T = opt.T;
    if (P === undefined) return n * RGAS * T / V;
    if (V === undefined) return n * RGAS * T / P;
    if (n === undefined) return P * V / (RGAS * T);
    if (T === undefined) return P * V / (n * RGAS);
    return NaN;
  }

  /** Tetapan sifat koligatif air. */
  const AIR = { Kb: 0.52, Kf: 1.86, Tb: 100, Tf: 0, Mr: 18.015, rho: 1.0 };

  /* ===================================================== LAJU & KESETIMBANGAN */

  /** Persamaan Arrhenius: k = A·e^(−Ea/RT) */
  function arrhenius(A, Ea, T) {
    return A * Math.exp(-(Ea * 1000) / (R * T));
  }

  /** Pergeseran tetapan kesetimbangan terhadap suhu (van 't Hoff). */
  function vantHoff(K1, dH, T1, T2) {
    return K1 * Math.exp(-(dH * 1000 / R) * (1 / T2 - 1 / T1));
  }

  /* ================================================== KELOMPOK SENYAWA === */

  /** Deret homolog hidrokarbon untuk simulasi Fase E. */
  const ALKANA = [
    { n: 1, nama: 'metana', rumus: 'CH4', td: -161.5, tl: -182.5 },
    { n: 2, nama: 'etana', rumus: 'C2H6', td: -88.6, tl: -183.3 },
    { n: 3, nama: 'propana', rumus: 'C3H8', td: -42.1, tl: -187.7 },
    { n: 4, nama: 'butana', rumus: 'C4H10', td: -0.5, tl: -138.4 },
    { n: 5, nama: 'pentana', rumus: 'C5H12', td: 36.1, tl: -129.7 },
    { n: 6, nama: 'heksana', rumus: 'C6H14', td: 68.7, tl: -95.3 },
    { n: 7, nama: 'heptana', rumus: 'C7H16', td: 98.4, tl: -90.6 },
    { n: 8, nama: 'oktana', rumus: 'C8H18', td: 125.7, tl: -56.8 },
    { n: 9, nama: 'nonana', rumus: 'C9H20', td: 150.8, tl: -53.5 },
    { n: 10, nama: 'dekana', rumus: 'C10H22', td: 174.1, tl: -29.7 }
  ];

  const GUGUS_FUNGSI = [
    { nama: 'Alkana', gugus: '—', umum: 'CnH2n+2', contoh: 'CH3CH3' },
    { nama: 'Alkena', gugus: 'C=C', umum: 'CnH2n', contoh: 'CH2=CH2' },
    { nama: 'Alkuna', gugus: 'C≡C', umum: 'CnH2n-2', contoh: 'CH≡CH' },
    { nama: 'Alkohol', gugus: '—OH', umum: 'R—OH', contoh: 'CH3CH2OH' },
    { nama: 'Eter', gugus: '—O—', umum: 'R—O—R′', contoh: 'CH3OCH3' },
    { nama: 'Aldehida', gugus: '—CHO', umum: 'R—CHO', contoh: 'CH3CHO' },
    { nama: 'Keton', gugus: '—CO—', umum: 'R—CO—R′', contoh: 'CH3COCH3' },
    { nama: 'Asam karboksilat', gugus: '—COOH', umum: 'R—COOH', contoh: 'CH3COOH' },
    { nama: 'Ester', gugus: '—COO—', umum: 'R—COO—R′', contoh: 'CH3COOCH3' },
    { nama: 'Amina', gugus: '—NH2', umum: 'R—NH2', contoh: 'CH3NH2' }
  ];

  /* =============================================== JARI-JARI & WARNA ATOM */

  /** Jari-jari kovalen (pm) untuk menggambar molekul. */
  const JARI = {
    H: 31, C: 76, N: 71, O: 66, F: 57, P: 107, S: 105, Cl: 102,
    Br: 120, I: 139, Na: 166, Mg: 141, Al: 121, Si: 111, K: 203,
    Ca: 176, Fe: 132, Cu: 132, Zn: 122, Ag: 145, Pb: 146, He: 28,
    Ne: 58, Ar: 106, Kr: 116, Xe: 140, B: 84, Li: 128, Be: 96, Ba: 215, Sr: 195
  };

  /** Warna atom gaya CPK untuk visualisasi molekul. */
  const WARNA_ATOM = {
    H: '#f0f2f4', C: '#3a4248', N: '#4a7fd8', O: '#e0533d', F: '#7fd86a',
    Cl: '#5fcf5a', Br: '#a04a28', I: '#8a4fc0', S: '#e8c84a', P: '#f08a30',
    Na: '#8f72d8', K: '#7a5fd0', Mg: '#4fb84a', Ca: '#5fa83f', Fe: '#d08030',
    Cu: '#c4703a', Zn: '#9aa4ae', Al: '#b0b8c0', Si: '#c8a070', B: '#f0a090',
    He: '#d67ae0', Ne: '#d67ae0', Ar: '#d67ae0', Li: '#c06ad0', Ba: '#4fa03f',
    Ag: '#c0c6cc', Pb: '#8d939a', default: '#9aa4ae'
  };

  function warnaAtom(sym) { return WARNA_ATOM[sym] || WARNA_ATOM.default; }
  function jariAtom(sym) { return JARI[sym] || 100; }

  /* ================================================= GEOMETRI MOLEKUL === */

  /** Bentuk molekul menurut teori VSEPR, berdasar PEI (X) dan PEB (E). */
  const VSEPR = [
    { x: 2, e: 0, nama: 'Linear', sudut: '180°', notasi: 'AX₂', contoh: 'CO2, BeCl2' },
    { x: 3, e: 0, nama: 'Segitiga datar', sudut: '120°', notasi: 'AX₃', contoh: 'BF3, SO3' },
    { x: 2, e: 1, nama: 'Bentuk V (bengkok)', sudut: '~118°', notasi: 'AX₂E', contoh: 'SO2, O3' },
    { x: 4, e: 0, nama: 'Tetrahedral', sudut: '109,5°', notasi: 'AX₄', contoh: 'CH4, CCl4' },
    { x: 3, e: 1, nama: 'Piramida segitiga', sudut: '~107°', notasi: 'AX₃E', contoh: 'NH3, PCl3' },
    { x: 2, e: 2, nama: 'Bentuk V (bengkok)', sudut: '~104,5°', notasi: 'AX₂E₂', contoh: 'H2O, H2S' },
    { x: 5, e: 0, nama: 'Bipiramida segitiga', sudut: '120° & 90°', notasi: 'AX₅', contoh: 'PCl5' },
    { x: 4, e: 1, nama: 'Jungkat-jungkit', sudut: '~117° & 90°', notasi: 'AX₄E', contoh: 'SF4' },
    { x: 3, e: 2, nama: 'Bentuk T', sudut: '~90°', notasi: 'AX₃E₂', contoh: 'ClF3' },
    { x: 2, e: 3, nama: 'Linear', sudut: '180°', notasi: 'AX₂E₃', contoh: 'XeF2, I3⁻' },
    { x: 6, e: 0, nama: 'Oktahedral', sudut: '90°', notasi: 'AX₆', contoh: 'SF6' },
    { x: 5, e: 1, nama: 'Piramida segiempat', sudut: '~90°', notasi: 'AX₅E', contoh: 'BrF5' },
    { x: 4, e: 2, nama: 'Segiempat datar', sudut: '90°', notasi: 'AX₄E₂', contoh: 'XeF4' }
  ];

  function cariVSEPR(x, e) {
    return VSEPR.find(function (v) { return v.x === x && v.e === e; }) || null;
  }

  /* ============================================================ EKSPOR === */

  global.Chem = {
    ELEMENTS: ELEMENTS, byZ: byZ, bySym: bySym, gridPos: gridPos,
    KATEGORI_WARNA: KATEGORI_WARNA, KATEGORI_NAMA: KATEGORI_NAMA,
    AUFBAU: AUFBAU, PENYIMPANGAN: PENYIMPANGAN,
    konfigurasi: konfigurasi, konfigurasiTeks: konfigurasiTeks,
    kulit: kulit, valensi: valensi, intiGasMulia: intiGasMulia,
    urai: urai, massaMolar: massaMolar, jumlahAtom: jumlahAtom,
    KATION: KATION, ANION: ANION, senyawaIon: senyawaIon,
    ASAM: ASAM, BASA: BASA, Kw: Kw,
    pHAsam: pHAsam, pHBasa: pHBasa, pHBuffer: pHBuffer,
    warnaPH: warnaPH, INDIKATOR: INDIKATOR, warnaIndikator: warnaIndikator,
    KSP: KSP, kelarutan: kelarutan,
    E_STANDAR: E_STANDAR, F: F, R: R, NA: NA, nernst: nernst,
    DHF: DHF, ENERGI_IKATAN: ENERGI_IKATAN, KALOR_JENIS: KALOR_JENIS,
    RGAS: RGAS, gasIdeal: gasIdeal, AIR: AIR,
    arrhenius: arrhenius, vantHoff: vantHoff,
    ALKANA: ALKANA, GUGUS_FUNGSI: GUGUS_FUNGSI,
    JARI: JARI, WARNA_ATOM: WARNA_ATOM, warnaAtom: warnaAtom, jariAtom: jariAtom,
    VSEPR: VSEPR, cariVSEPR: cariVSEPR
  };

})(window);
