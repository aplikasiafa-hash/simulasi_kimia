# SimKimia

Kumpulan **39 simulasi kimia interaktif berbahasa Indonesia** untuk Kurikulum Merdeka,
dari Fase A (SD kelas 1–2) sampai Fase F (SMA kelas 11–12).

Terinspirasi pendekatan [PhET Interactive Simulations](https://phet.colorado.edu),
tetapi ditulis dari nol dalam bahasa Indonesia dan dipetakan ke capaian pembelajaran
Kurikulum Merdeka. SimKimia adalah karya mandiri dan tidak berafiliasi dengan PhET.

---

## Sorotan

- **39 simulasi** menyeluruh dari Fase A sampai F
- **Tanpa pemasangan, tanpa akun, tanpa pelacakan** — HTML, CSS, dan JavaScript murni
- **Tanpa proses build** — unggah apa adanya ke GitHub Pages, selesai
- **Berjalan luring** setelah berkasnya ada di komputer, bahkan lewat `file://`
- **Mode terang dan gelap** mengikuti pengaturan sistem
- **Dapat dipakai di ponsel** — tata letaknya menyesuaikan lebar layar
- Setiap halaman memuat panggung interaktif, panel kontrol, penjelasan konsep,
  ajakan bereksperimen, dan latihan berpembahasan

---

## Mencoba secara lokal

Cara tercepat — cukup buka berkasnya:

```bash
# buka index.html dengan klik ganda, atau:
open index.html        # macOS
xdg-open index.html    # Linux
start index.html       # Windows
```

Disarankan memakai server lokal agar perilakunya sama persis dengan di GitHub Pages:

```bash
python3 -m http.server 8000
# lalu buka http://localhost:8000
```

---

## Memasang di GitHub Pages

1. Buat repositori baru di GitHub, misalnya `simkimia`.
2. Unggah seluruh berkas proyek ini:

   ```bash
   git init
   git add .
   git commit -m "SimKimia: 39 simulasi kimia Fase A-F"
   git branch -M main
   git remote add origin https://github.com/<nama-pengguna>/simkimia.git
   git push -u origin main
   ```

3. Buka **Settings → Pages** pada repositori tersebut.
4. Pada bagian *Source*, pilih **Deploy from a branch**, cabang `main`, folder `/ (root)`.
5. Tekan **Save**. Setelah satu sampai dua menit situs tersedia di:

   ```
   https://<nama-pengguna>.github.io/simkimia/
   ```

> **Penting:** jangan hapus berkas `.nojekyll` di akar proyek. Berkas kosong itu
> memberi tahu GitHub Pages agar menyajikan berkas apa adanya tanpa diproses Jekyll.

Seluruh tautan di dalam proyek bersifat relatif, sehingga situs berjalan baik di
subfolder (`/simkimia/`) maupun di akar domain.

---

## Daftar simulasi

### Fase A — SD kelas 1–2
| Simulasi | Topik |
|---|---|
| Wujud Benda di Sekitar Kita | Wujud zat, pengamatan |
| Mengenal Sifat Benda | Sifat materi, massa jenis |

### Fase B — SD kelas 3–4
| Simulasi | Topik |
|---|---|
| Perubahan Wujud Benda | Wujud zat, kalor laten |
| Larut atau Tidak Larut? | Larutan, kelarutan, kejenuhan |
| Memilih Bahan yang Tepat | Konduktor, isolator, daya serap |

### Fase C — SD kelas 5–6
| Simulasi | Topik |
|---|---|
| Campuran dan Cara Memisahkannya | Filtrasi, penguapan, magnet |
| Perubahan Fisika atau Kimia? | Perubahan materi |
| Asam, Basa, dan Indikator Alami | Asam-basa, indikator |

### Fase D — SMP kelas 7–9
| Simulasi | Topik |
|---|---|
| Partikel Materi: Atom, Molekul, Ion | Partikel penyusun materi |
| Teori Kinetik: Gerak Partikel dan Suhu | Teori kinetik, tekanan, difusi |
| Unsur, Senyawa, dan Campuran | Klasifikasi materi |
| Teknik Pemisahan Campuran | Destilasi, kromatografi, sublimasi |
| Reaksi Kimia dan Hukum Kekekalan Massa | Hukum Lavoisier |
| Skala pH dan Kekuatan Asam-Basa | pH, indikator, ion H⁺ |

### Fase E — SMA kelas 10
| Simulasi | Topik |
|---|---|
| Perkembangan Model Atom | Dalton sampai mekanika kuantum |
| Struktur Atom, Isotop, dan Ion | Proton, neutron, elektron |
| Konfigurasi Elektron dan Aturan Pengisian | Aufbau, Hund, Pauli |
| Tabel Periodik dan Keperiodikan Sifat | 118 unsur, peta panas sifat |
| Ikatan Ion dan Ikatan Kovalen | Struktur Lewis, keelektronegatifan |
| Bentuk Molekul (VSEPR) dan Kepolaran | Domain elektron, momen dipol |
| Hukum-Hukum Dasar Kimia | Lavoisier, Proust, Dalton, Gay-Lussac |
| Konsep Mol dan Stoikiometri | Mol, pereaksi pembatas, tabel MRS |
| Larutan Elektrolit dan Nonelektrolit | Derajat ionisasi, daya hantar |
| Reaksi Redoks dan Bilangan Oksidasi | Oksidator, reduktor |
| Hidrokarbon dan Minyak Bumi | Deret homolog, isomer, distilasi |
| Kimia Hijau dan Jejak Karbon | Ekonomi atom, keberlanjutan |

### Fase F — SMA kelas 11–12
| Simulasi | Topik |
|---|---|
| Termokimia: Entalpi dan Kalorimetri | ΔH, kalorimeter, hukum Hess |
| Laju Reaksi dan Faktor-Faktornya | Teori tumbukan, energi aktivasi, orde |
| Kesetimbangan Kimia dan Le Châtelier | Kc, pergeseran kesetimbangan |
| Asam-Basa: Teori dan Perhitungan pH | Arrhenius, Brønsted, Lewis, Ka, Kb |
| Titrasi Asam-Basa dan Kurva Titrasi | Titik ekuivalen, pemilihan indikator |
| Larutan Penyangga (Buffer) | Henderson-Hasselbalch, kapasitas |
| Hidrolisis Garam | Empat jenis garam, Kh |
| Kelarutan dan Hasil Kali Kelarutan | Ksp, Qc, pengendapan |
| Sifat Koligatif Larutan | ΔTb, ΔTf, osmosis, faktor van 't Hoff |
| Sistem Koloid | Efek Tyndall, gerak Brown, koagulasi |
| Sel Volta dan Sel Elektrolisis | E°sel, Nernst, hukum Faraday |
| Polimer dan Biomolekul | Adisi, kondensasi, uji biomolekul |
| Kimia Inti dan Peluruhan Radioaktif | Alfa, beta, gama, waktu paruh |

---

## Susunan berkas

```
simkimia/
├── index.html              Halaman katalog dengan penyaring fase, topik, pencarian
├── panduan.html            Panduan guru dan pemetaan capaian pembelajaran
├── .nojekyll               Wajib ada untuk GitHub Pages
├── assets/
│   ├── css/
│   │   ├── base.css        Token warna, tipografi, komponen bersama
│   │   ├── beranda.css     Tata letak halaman katalog
│   │   └── sim.css         Tata letak halaman simulasi
│   └── js/
│       ├── core.js         Kerangka kerja simulasi (kontrol, kanvas, gelung animasi)
│       ├── chem.js         Data kimia: 118 unsur, Ka, Ksp, E°, entalpi, VSEPR
│       ├── plot.js         Pustaka grafik di atas kanvas
│       ├── particles.js    Sistem partikel untuk teori kinetik
│       ├── katalog.js      Daftar seluruh simulasi
│       └── beranda.js      Logika penyaring dan kartu katalog
├── sims/
│   └── <slug>/
│       ├── index.html      Kerangka halaman (dihasilkan otomatis)
│       └── sim.js          Logika simulasi
└── tools/
    ├── buat-shell.js       Menghasilkan kerangka HTML dari katalog
    └── uji.js              Penguji seluruh simulasi tanpa peramban
```

---

## Pengembangan

Tidak ada dependensi dan tidak ada proses build. Hanya Node.js yang diperlukan untuk
menjalankan dua alat bantu di folder `tools/`.

**Menambah simulasi baru:**

```bash
# 1. tambahkan entri baru ke assets/js/katalog.js
# 2. hasilkan kerangka HTML-nya
node tools/buat-shell.js
# 3. tulis logikanya di sims/<slug>/sim.js
# 4. uji
node tools/uji.js
```

**Menguji seluruh simulasi:**

```bash
node tools/uji.js              # semua simulasi
node tools/uji.js laju-reaksi  # satu simulasi saja
RINCI=1 node tools/uji.js      # tampilkan jejak galat lengkap
```

Alat uji menyediakan DOM dan kanvas tiruan, lalu benar-benar menjalankan setiap
simulasi: membangun panel kontrol, menjalankan 40 bingkai animasi, menggeser setiap
kontrol ke nilai ekstremnya, menekan setiap tombol, mengklik 35 titik di seluruh
panggung, dan mengulang setelah atur ulang. Nilai `NaN` yang masuk ke kanvas akan
terdeteksi sebagai kegagalan.

---

## Membuat simulasi

Setiap `sim.js` memanggil `Sim.create()` dengan sebuah objek konfigurasi:

```js
Sim.create({
  title: 'Judul Simulasi',
  subtitle: 'Satu kalimat pengantar.',
  fase: 'E', jenjang: 'SMA Kelas 10',
  topik: ['Topik Satu', 'Topik Dua'],
  stage: { w: 790, h: 540 },

  controls: [
    { title: 'Kelompok kontrol', items: [
      { type: 'slider',  id: 'suhu', value: 25, min: 0, max: 100, step: 1,
        label: 'Suhu', unit: '°C' },
      { type: 'toggle',  id: 'tampil', value: true, label: 'Tampilkan partikel' },
      { type: 'segment', id: 'mode', value: 'a', options: [...] },
      { type: 'buttons', items: [{ label: 'Jalankan', onClick: fn }] }
    ]}
  ],

  readouts: [{ id: 'hasil', label: 'Hasil' }],

  setup(sim)  { /* keadaan awal */ },
  update(sim, dt) { /* satu langkah waktu */ },
  draw(ctx, sim)  { /* menggambar panggung */ },
  readoutsUpdate(sim) { sim.readout('hasil', '…'); },

  notes: `<p>Penjelasan konsep…</p>`,
  explore: ['Kegiatan satu…'],
  quiz: [{ q: 'Pertanyaan?', options: [...], answer: 1, explain: '…' }]
});
```

Seluruh pembangunan halaman, panel kontrol, penskalaan kanvas untuk layar beresolusi
tinggi, gelung animasi, penanganan sentuh, dan panel belajar ditangani oleh `core.js`.

---

## Lisensi

Dilepas ke domain publik dengan [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/deed.id).
Silakan dipakai, diubah, diterjemahkan, dan dibagikan ulang untuk keperluan apa pun,
termasuk komersial, tanpa perlu meminta izin.

Jika bermanfaat di kelas Anda, membagikan tautannya kepada guru lain sudah lebih dari cukup.
