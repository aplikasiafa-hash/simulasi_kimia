/* ==========================================================================
   SimKimia — katalog.js
   Daftar seluruh simulasi. Sengaja ditulis sebagai berkas JavaScript (bukan
   JSON yang diambil lewat fetch) supaya situs tetap berjalan ketika dibuka
   langsung dari berkas lokal (file://), bukan hanya dari server.
   ========================================================================== */

window.KATALOG = [

  /* ================================================== FASE A — SD 1–2 === */
  {
    slug: 'wujud-benda',
    judul: 'Wujud Benda di Sekitar Kita',
    fase: 'A', jenjang: 'SD Kelas 1–2',
    ringkas: 'Kelompokkan benda menjadi padat, cair, dan gas, lalu intip susunan partikelnya.',
    topik: ['Wujud Zat', 'Pengamatan'],
    cp: 'Peserta didik mengidentifikasi benda-benda di sekitar berdasarkan wujudnya.',
    warna: '#e8713c'
  },
  {
    slug: 'sifat-benda',
    judul: 'Mengenal Sifat Benda',
    fase: 'A', jenjang: 'SD Kelas 1–2',
    ringkas: 'Uji benda: keras atau lunak, kasar atau halus, berat atau ringan, tenggelam atau terapung.',
    topik: ['Sifat Materi', 'Pengamatan'],
    cp: 'Peserta didik mendeskripsikan sifat benda melalui pengamatan dan percobaan sederhana.',
    warna: '#e8713c'
  },

  /* ================================================== FASE B — SD 3–4 === */
  {
    slug: 'perubahan-wujud',
    judul: 'Perubahan Wujud Benda',
    fase: 'B', jenjang: 'SD Kelas 3–4',
    ringkas: 'Panaskan dan dinginkan air: melebur, menguap, mengembun, membeku, dan menyublim.',
    topik: ['Wujud Zat', 'Kalor'],
    cp: 'Peserta didik mendeskripsikan perubahan wujud zat akibat pemanasan dan pendinginan.',
    warna: '#d9951f'
  },
  {
    slug: 'larut-tak-larut',
    judul: 'Larut atau Tidak Larut?',
    fase: 'B', jenjang: 'SD Kelas 3–4',
    ringkas: 'Masukkan gula, garam, pasir, dan minyak ke air. Mana yang larut? Apa pengaruh suhu dan aduk?',
    topik: ['Larutan', 'Campuran'],
    cp: 'Peserta didik mengidentifikasi zat yang dapat dan tidak dapat larut dalam air.',
    warna: '#d9951f'
  },
  {
    slug: 'sifat-bahan',
    judul: 'Memilih Bahan yang Tepat',
    fase: 'B', jenjang: 'SD Kelas 3–4',
    ringkas: 'Uji empat bahan untuk hantaran panas, hantaran listrik, kelenturan, dan daya serap air.',
    topik: ['Sifat Materi', 'Teknologi'],
    cp: 'Peserta didik menghubungkan sifat bahan dengan kegunaannya dalam kehidupan sehari-hari.',
    warna: '#d9951f'
  },

  /* ================================================== FASE C — SD 5–6 === */
  {
    slug: 'campuran-pemisahan',
    judul: 'Campuran dan Cara Memisahkannya',
    fase: 'C', jenjang: 'SD Kelas 5–6',
    ringkas: 'Buat campuran lalu pisahkan dengan penyaringan, penguapan, magnet, dan pengendapan.',
    topik: ['Campuran', 'Pemisahan'],
    cp: 'Peserta didik merancang cara memisahkan campuran berdasarkan sifat komponennya.',
    warna: '#68922b'
  },
  {
    slug: 'perubahan-fisika-kimia',
    judul: 'Perubahan Fisika atau Kimia?',
    fase: 'C', jenjang: 'SD Kelas 5–6',
    ringkas: 'Amati delapan peristiwa dan putuskan: apakah terbentuk zat baru atau tidak?',
    topik: ['Perubahan Materi'],
    cp: 'Peserta didik membedakan perubahan fisika dan perubahan kimia melalui ciri-cirinya.',
    warna: '#68922b'
  },
  {
    slug: 'indikator-alami',
    judul: 'Asam, Basa, dan Indikator Alami',
    fase: 'C', jenjang: 'SD Kelas 5–6',
    ringkas: 'Teteskan ekstrak kubis ungu ke berbagai larutan rumah tangga dan baca perubahan warnanya.',
    topik: ['Asam Basa', 'Indikator'],
    cp: 'Peserta didik mengidentifikasi sifat asam dan basa larutan menggunakan indikator alami.',
    warna: '#68922b'
  },

  /* ================================================== FASE D — SMP ====== */
  {
    slug: 'partikel-materi',
    judul: 'Partikel Materi: Atom, Molekul, dan Ion',
    fase: 'D', jenjang: 'SMP Kelas 7–9',
    ringkas: 'Bangun atom, molekul unsur, molekul senyawa, dan ion. Lihat bedanya secara langsung.',
    topik: ['Partikel Materi', 'Atom'],
    cp: 'Peserta didik menjelaskan konsep atom, molekul, dan ion sebagai partikel penyusun materi.',
    warna: '#0f8a7e'
  },
  {
    slug: 'teori-kinetik',
    judul: 'Teori Kinetik: Gerak Partikel dan Suhu',
    fase: 'D', jenjang: 'SMP Kelas 7–9',
    ringkas: 'Ubah suhu dan volume, amati gerak partikel, tekanan, dan laju difusi secara waktu-nyata.',
    topik: ['Teori Kinetik', 'Wujud Zat', 'Gas'],
    cp: 'Peserta didik menjelaskan sifat zat berdasarkan susunan dan gerak partikelnya.',
    warna: '#0f8a7e'
  },
  {
    slug: 'unsur-senyawa-campuran',
    judul: 'Unsur, Senyawa, dan Campuran',
    fase: 'D', jenjang: 'SMP Kelas 7–9',
    ringkas: 'Klasifikasikan dua belas materi lewat pohon keputusan, sambil melihat gambaran partikelnya.',
    topik: ['Klasifikasi Materi'],
    cp: 'Peserta didik mengklasifikasikan materi menjadi unsur, senyawa, dan campuran.',
    warna: '#0f8a7e'
  },
  {
    slug: 'pemisahan-lanjut',
    judul: 'Teknik Pemisahan Campuran',
    fase: 'D', jenjang: 'SMP Kelas 7–9',
    ringkas: 'Jalankan destilasi, kromatografi kertas, filtrasi, sublimasi, dan kristalisasi secara utuh.',
    topik: ['Pemisahan', 'Campuran'],
    cp: 'Peserta didik menerapkan prinsip pemisahan campuran berdasarkan perbedaan sifat fisika.',
    warna: '#0f8a7e'
  },
  {
    slug: 'kekekalan-massa',
    judul: 'Reaksi Kimia dan Hukum Kekekalan Massa',
    fase: 'D', jenjang: 'SMP Kelas 7–9',
    ringkas: 'Timbang zat sebelum dan sesudah reaksi di wadah terbuka maupun tertutup.',
    topik: ['Reaksi Kimia', 'Hukum Dasar'],
    cp: 'Peserta didik membuktikan hukum kekekalan massa pada reaksi kimia.',
    warna: '#0f8a7e'
  },
  {
    slug: 'skala-ph',
    judul: 'Skala pH dan Kekuatan Asam-Basa',
    fase: 'D', jenjang: 'SMP Kelas 7–9',
    ringkas: 'Uji dua puluh larutan dengan pH meter, kertas lakmus, dan indikator universal.',
    topik: ['Asam Basa', 'pH'],
    cp: 'Peserta didik menentukan sifat asam, basa, dan netral larutan menggunakan indikator dan skala pH.',
    warna: '#0f8a7e'
  },

  /* ============================================ FASE E — SMA KELAS 10 === */
  {
    slug: 'model-atom',
    judul: 'Perkembangan Model Atom',
    fase: 'E', jenjang: 'SMA Kelas 10',
    ringkas: 'Telusuri model Dalton, Thomson, Rutherford, Bohr, dan mekanika kuantum — termasuk percobaan hamburan.',
    topik: ['Struktur Atom', 'Sejarah Sains'],
    cp: 'Peserta didik menjelaskan perkembangan model atom berdasarkan bukti eksperimen.',
    warna: '#2563c9'
  },
  {
    slug: 'struktur-atom',
    judul: 'Struktur Atom, Isotop, dan Ion',
    fase: 'E', jenjang: 'SMA Kelas 10',
    ringkas: 'Susun inti dan elektron sendiri, lalu baca nomor atom, nomor massa, muatan, dan kestabilannya.',
    topik: ['Struktur Atom', 'Isotop'],
    cp: 'Peserta didik menganalisis hubungan nomor atom, nomor massa, isotop, dan ion.',
    warna: '#2563c9'
  },
  {
    slug: 'konfigurasi-elektron',
    judul: 'Konfigurasi Elektron dan Aturan Pengisian',
    fase: 'E', jenjang: 'SMA Kelas 10',
    ringkas: 'Isi orbital mengikuti Aufbau, Hund, dan larangan Pauli untuk seluruh 118 unsur.',
    topik: ['Konfigurasi Elektron', 'Orbital'],
    cp: 'Peserta didik menuliskan konfigurasi elektron dan menentukan letak unsur dalam tabel periodik.',
    warna: '#2563c9'
  },
  {
    slug: 'tabel-periodik',
    judul: 'Tabel Periodik dan Keperiodikan Sifat',
    fase: 'E', jenjang: 'SMA Kelas 10',
    ringkas: 'Tabel periodik interaktif 118 unsur dengan peta panas jari-jari, keelektronegatifan, dan energi ionisasi.',
    topik: ['Tabel Periodik', 'Sifat Periodik'],
    cp: 'Peserta didik menganalisis kecenderungan sifat keperiodikan unsur dalam satu golongan dan periode.',
    warna: '#2563c9'
  },
  {
    slug: 'ikatan-kimia',
    judul: 'Ikatan Ion dan Ikatan Kovalen',
    fase: 'E', jenjang: 'SMA Kelas 10',
    ringkas: 'Pasangkan dua unsur dan lihat elektron berpindah atau dipakai bersama, lengkap dengan struktur Lewis.',
    topik: ['Ikatan Kimia', 'Struktur Lewis'],
    cp: 'Peserta didik menjelaskan pembentukan ikatan ion dan kovalen berdasarkan konfigurasi elektron.',
    warna: '#2563c9'
  },
  {
    slug: 'bentuk-molekul',
    judul: 'Bentuk Molekul (VSEPR) dan Kepolaran',
    fase: 'E', jenjang: 'SMA Kelas 10',
    ringkas: 'Atur pasangan elektron ikatan dan bebas, amati bentuk ruang molekul dan resultan momen dipolnya.',
    topik: ['Bentuk Molekul', 'Kepolaran'],
    cp: 'Peserta didik meramalkan bentuk molekul berdasarkan teori domain elektron.',
    warna: '#2563c9'
  },
  {
    slug: 'hukum-dasar',
    judul: 'Hukum-Hukum Dasar Kimia',
    fase: 'E', jenjang: 'SMA Kelas 10',
    ringkas: 'Uji hukum Lavoisier, Proust, Dalton, dan Gay-Lussac lewat percobaan virtual yang bisa diulang.',
    topik: ['Hukum Dasar', 'Stoikiometri'],
    cp: 'Peserta didik menerapkan hukum-hukum dasar kimia dalam perhitungan sederhana.',
    warna: '#2563c9'
  },
  {
    slug: 'stoikiometri',
    judul: 'Konsep Mol dan Stoikiometri',
    fase: 'E', jenjang: 'SMA Kelas 10',
    ringkas: 'Reaksikan zat dengan jumlah mol pilihan sendiri, temukan pereaksi pembatas dan hitung hasilnya.',
    topik: ['Mol', 'Stoikiometri', 'Pereaksi Pembatas'],
    cp: 'Peserta didik menerapkan konsep mol dalam perhitungan kimia dan menentukan pereaksi pembatas.',
    warna: '#2563c9'
  },
  {
    slug: 'larutan-elektrolit',
    judul: 'Larutan Elektrolit dan Nonelektrolit',
    fase: 'E', jenjang: 'SMA Kelas 10',
    ringkas: 'Celupkan elektrode ke berbagai larutan; nyala lampu dan gelembung gas menunjukkan derajat ionisasinya.',
    topik: ['Elektrolit', 'Daya Hantar'],
    cp: 'Peserta didik membedakan larutan elektrolit kuat, elektrolit lemah, dan nonelektrolit.',
    warna: '#2563c9'
  },
  {
    slug: 'redoks',
    judul: 'Reaksi Redoks dan Bilangan Oksidasi',
    fase: 'E', jenjang: 'SMA Kelas 10',
    ringkas: 'Tentukan bilangan oksidasi tiap atom, kenali oksidator dan reduktor, lalu setarakan persamaannya.',
    topik: ['Redoks', 'Bilangan Oksidasi'],
    cp: 'Peserta didik menganalisis reaksi redoks berdasarkan perubahan bilangan oksidasi.',
    warna: '#2563c9'
  },
  {
    slug: 'hidrokarbon',
    judul: 'Hidrokarbon dan Minyak Bumi',
    fase: 'E', jenjang: 'SMA Kelas 10',
    ringkas: 'Bangun rantai karbon, temukan isomer, dan jalankan menara distilasi bertingkat minyak bumi.',
    topik: ['Hidrokarbon', 'Isomer', 'Minyak Bumi'],
    cp: 'Peserta didik menganalisis struktur senyawa hidrokarbon dan proses pengolahan minyak bumi.',
    warna: '#2563c9'
  },
  {
    slug: 'kimia-hijau',
    judul: 'Kimia Hijau dan Jejak Karbon',
    fase: 'E', jenjang: 'SMA Kelas 10',
    ringkas: 'Rancang ulang sebuah proses produksi: hitung ekonomi atom, limbah, energi, dan emisi karbonnya.',
    topik: ['Kimia Hijau', 'Keberlanjutan'],
    cp: 'Peserta didik menerapkan prinsip kimia hijau dalam menilai dampak suatu proses kimia.',
    warna: '#2563c9'
  },

  /* ========================================= FASE F — SMA KELAS 11–12 === */
  {
    slug: 'termokimia',
    judul: 'Termokimia: Entalpi dan Kalorimetri',
    fase: 'F', jenjang: 'SMA Kelas 11',
    ringkas: 'Jalankan kalorimeter, gambar diagram tingkat energi, dan hitung ΔH lewat hukum Hess.',
    topik: ['Termokimia', 'Entalpi', 'Hukum Hess'],
    cp: 'Peserta didik menganalisis perubahan entalpi reaksi berdasarkan data kalorimetri dan hukum Hess.',
    warna: '#7b3fc4'
  },
  {
    slug: 'laju-reaksi',
    judul: 'Laju Reaksi dan Faktor-Faktornya',
    fase: 'F', jenjang: 'SMA Kelas 11',
    ringkas: 'Ubah konsentrasi, suhu, luas permukaan, dan katalis; amati grafik laju serta diagram energi aktivasi.',
    topik: ['Laju Reaksi', 'Katalis', 'Energi Aktivasi'],
    cp: 'Peserta didik menganalisis faktor-faktor yang memengaruhi laju reaksi dan orde reaksi.',
    warna: '#7b3fc4'
  },
  {
    slug: 'kesetimbangan',
    judul: 'Kesetimbangan Kimia dan Asas Le Châtelier',
    fase: 'F', jenjang: 'SMA Kelas 11',
    ringkas: 'Ganggu kesetimbangan dengan konsentrasi, tekanan, dan suhu; lihat arah pergeserannya seketika.',
    topik: ['Kesetimbangan', 'Le Châtelier', 'Kc dan Kp'],
    cp: 'Peserta didik menganalisis pergeseran arah kesetimbangan akibat berbagai gangguan.',
    warna: '#7b3fc4'
  },
  {
    slug: 'asam-basa-lanjut',
    judul: 'Asam-Basa: Teori dan Perhitungan pH',
    fase: 'F', jenjang: 'SMA Kelas 11',
    ringkas: 'Bandingkan Arrhenius, Brønsted-Lowry, dan Lewis; hitung pH asam-basa kuat maupun lemah.',
    topik: ['Asam Basa', 'pH', 'Ka dan Kb'],
    cp: 'Peserta didik menghitung pH larutan asam dan basa serta menjelaskan teori asam-basa.',
    warna: '#7b3fc4'
  },
  {
    slug: 'titrasi',
    judul: 'Titrasi Asam-Basa dan Kurva Titrasi',
    fase: 'F', jenjang: 'SMA Kelas 11',
    ringkas: 'Teteskan titran setetes demi setetes, baca kurva pH membentuk diri, dan tentukan titik ekuivalen.',
    topik: ['Titrasi', 'Stoikiometri', 'Indikator'],
    cp: 'Peserta didik menganalisis data titrasi asam-basa untuk menentukan konsentrasi larutan.',
    warna: '#7b3fc4'
  },
  {
    slug: 'larutan-penyangga',
    judul: 'Larutan Penyangga (Buffer)',
    fase: 'F', jenjang: 'SMA Kelas 11',
    ringkas: 'Tambahkan asam atau basa kuat ke buffer dan ke air biasa, lalu bandingkan goyangan pH-nya.',
    topik: ['Buffer', 'Henderson-Hasselbalch'],
    cp: 'Peserta didik menganalisis kerja larutan penyangga dalam mempertahankan pH.',
    warna: '#7b3fc4'
  },
  {
    slug: 'hidrolisis',
    judul: 'Hidrolisis Garam',
    fase: 'F', jenjang: 'SMA Kelas 11',
    ringkas: 'Larutkan dua belas garam dan telusuri mengapa sebagiannya bersifat asam, basa, atau netral.',
    topik: ['Hidrolisis', 'Garam', 'pH'],
    cp: 'Peserta didik menganalisis sifat larutan garam yang mengalami hidrolisis.',
    warna: '#7b3fc4'
  },
  {
    slug: 'kelarutan-ksp',
    judul: 'Kelarutan dan Hasil Kali Kelarutan',
    fase: 'F', jenjang: 'SMA Kelas 11',
    ringkas: 'Campurkan dua larutan, bandingkan Qc dengan Ksp, dan saksikan endapan muncul tepat pada saatnya.',
    topik: ['Ksp', 'Kelarutan', 'Pengendapan'],
    cp: 'Peserta didik memprediksi terbentuknya endapan berdasarkan perbandingan Qc dan Ksp.',
    warna: '#7b3fc4'
  },
  {
    slug: 'sifat-koligatif',
    judul: 'Sifat Koligatif Larutan',
    fase: 'F', jenjang: 'SMA Kelas 12',
    ringkas: 'Larutkan zat elektrolit dan nonelektrolit, amati empat sifat koligatif beserta diagram fasenya.',
    topik: ['Koligatif', 'Faktor van \'t Hoff'],
    cp: 'Peserta didik menganalisis sifat koligatif larutan elektrolit dan nonelektrolit.',
    warna: '#7b3fc4'
  },
  {
    slug: 'koloid',
    judul: 'Sistem Koloid',
    fase: 'F', jenjang: 'SMA Kelas 12',
    ringkas: 'Bandingkan larutan, koloid, dan suspensi; uji efek Tyndall, gerak Brown, dan koagulasi.',
    topik: ['Koloid', 'Efek Tyndall'],
    cp: 'Peserta didik mengelompokkan jenis koloid dan menjelaskan sifat-sifatnya.',
    warna: '#7b3fc4'
  },
  {
    slug: 'sel-volta',
    judul: 'Sel Volta dan Sel Elektrolisis',
    fase: 'F', jenjang: 'SMA Kelas 12',
    ringkas: 'Rakit sel dari dua elektrode pilihan, baca potensial sel, lalu balikkan arah dengan elektrolisis.',
    topik: ['Elektrokimia', 'Sel Volta', 'Elektrolisis'],
    cp: 'Peserta didik menganalisis proses pada sel volta dan sel elektrolisis serta penerapannya.',
    warna: '#7b3fc4'
  },
  {
    slug: 'makromolekul',
    judul: 'Polimer dan Biomolekul',
    fase: 'F', jenjang: 'SMA Kelas 12',
    ringkas: 'Rangkai monomer menjadi polimer adisi dan kondensasi, lalu uji karbohidrat, protein, dan lemak.',
    topik: ['Polimer', 'Biomolekul'],
    cp: 'Peserta didik menganalisis struktur dan sifat polimer serta makromolekul hayati.',
    warna: '#7b3fc4'
  },
  {
    slug: 'kimia-inti',
    judul: 'Kimia Inti dan Peluruhan Radioaktif',
    fase: 'F', jenjang: 'SMA Kelas 12',
    ringkas: 'Amati peluruhan alfa, beta, dan gama; ukur waktu paruh dan gunakan untuk penanggalan karbon.',
    topik: ['Radioaktivitas', 'Waktu Paruh'],
    cp: 'Peserta didik menganalisis peluruhan radioaktif dan pemanfaatan radioisotop.',
    warna: '#7b3fc4'
  }
];

window.FASE_INFO = {
  'A': { label: 'Fase A', jenjang: 'SD Kelas 1–2', warna: '#e8713c',
         catatan: 'Pengenalan benda dan wujudnya lewat pengamatan langsung.' },
  'B': { label: 'Fase B', jenjang: 'SD Kelas 3–4', warna: '#d9951f',
         catatan: 'Perubahan wujud, pelarutan, dan sifat bahan.' },
  'C': { label: 'Fase C', jenjang: 'SD Kelas 5–6', warna: '#68922b',
         catatan: 'Campuran, pemisahan, perubahan materi, dan asam-basa sederhana.' },
  'D': { label: 'Fase D', jenjang: 'SMP Kelas 7–9', warna: '#0f8a7e',
         catatan: 'Partikel materi, teori kinetik, reaksi kimia, dan skala pH.' },
  'E': { label: 'Fase E', jenjang: 'SMA Kelas 10', warna: '#2563c9',
         catatan: 'Struktur atom, ikatan, stoikiometri, redoks, dan kimia hijau.' },
  'F': { label: 'Fase F', jenjang: 'SMA Kelas 11–12', warna: '#7b3fc4',
         catatan: 'Termokimia, kinetika, kesetimbangan, elektrokimia, dan makromolekul.' }
};
