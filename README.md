# SimKimia 3D

**39 simulasi kimia 3D interaktif berbahasa Indonesia** untuk Kurikulum Merdeka,
dari Fase A (SD kelas 1–2) sampai Fase F (SMA kelas 11–12).

Seluruhnya berjalan di dalam **satu halaman** dengan WebGL (three.js). Tidak ada
teks penjelasan maupun soal di dalamnya — murni simulasi: panggung 3D, panel kontrol,
dan angka hasil pengukuran. Berpindah simulasi **tidak keluar dari mode layar penuh**,
sehingga nyaman dipakai untuk mengajar di depan kelas.

Terinspirasi pendekatan [PhET Interactive Simulations](https://phet.colorado.edu),
tetapi ditulis dari nol dalam bahasa Indonesia dan dipetakan ke capaian pembelajaran
Kurikulum Merdeka. SimKimia adalah karya mandiri dan tidak berafiliasi dengan PhET.

---

## Sorotan

- **39 simulasi 3D** menyeluruh dari Fase A sampai F
- **Mode layar penuh** sejati, dan pemilih simulasi yang bekerja **di dalam** mode itu
- **Satu halaman (SPA)** — modul simulasi dimuat sesuai kebutuhan, tanpa pindah halaman
- **Tanpa pemasangan, tanpa akun, tanpa pelacakan** — HTML, CSS, JavaScript murni
- **Tanpa proses build** — unggah apa adanya ke GitHub Pages, selesai
- **Berjalan luring**, bahkan ketika dibuka langsung lewat `file://`
- **three.js disertakan** di `assets/vendor/` — tidak ada permintaan ke internet
- Kamera orbit penuh: putar, geser, dan zum pada setiap adegan
- Beberapa simulasi menyertakan panel grafik 3D (kurva titrasi, diagram fase,
  tingkat energi, kurva peluruhan, dan lainnya)

### Tampilan yang dibuat semirip aslinya

- **Kaca laboratorium sungguhan** — dinding wadah membiaskan cahaya, bening di
  tengah dan menyala di tepi, dengan garis kilau memanjang khas tabung kaca
- **Zat cair punya permukaan** — cakram mengilap dengan cincin meniskus di
  tepinya, naik-turun mengikuti isi wadah
- **Larutan tak berwarna terlihat bening seperti air**, larutan pekat tetap
  pekat: kebeningannya dihitung dari warna larutannya sendiri
- **Logam tampak disikat**, bukan cermin sempurna
- **Pencahayaan studio**: lampu utama, pengisi dingin, dan cahaya tepi hangat,
  dengan bayangan bertepi lembut serta bayangan kontak di bawah tiap alat
- **Ruangan bergradasi dan meja laboratorium bertekstur** — alat tidak lagi
  tampak melayang di ruang hampa

### Yang membantu siswa cepat menangkap maksudnya

- **Legenda warna** di atas adegan menjawab "bola merah itu apa?" tanpa perlu
  membaca teks panjang
- **Label penunjuk** (`S3.penunjuk`) menamai bagian alat lengkap dengan garis
  penunjuk ke bendanya
- **Label tidak pernah tersembunyi**: kerangka aplikasi memeriksa setiap label
  dan menurunkannya bila tertutup bilah judul
- **Panel grafik selalu menghadap kamera** sehingga tetap lurus dan terbaca
  dari sudut pandang mana pun
- Angka hasil pengukuran membungkus kalimat panjang dan tak tertutup bilah alat

---

## Mencoba secara lokal

Cukup buka berkasnya:

```bash
# klik ganda index.html, atau:
open index.html        # macOS
xdg-open index.html    # Linux
start index.html       # Windows
```

Boleh juga memakai server lokal agar perilakunya sama persis dengan di GitHub Pages:

```bash
python3 -m http.server 8000
# lalu buka http://localhost:8000
```

Perangkat yang dipakai perlu mendukung **WebGL2** — semua peramban modern
(Chrome, Edge, Firefox, Safari) sudah mendukungnya.

---

## Memasang di GitHub Pages

1. Buat repositori baru di GitHub, misalnya `simkimia`.
2. Unggah seluruh isi folder ini ke cabang `main` (boleh lewat tombol
   *Add file → Upload files*, atau lewat `git push`).
3. Buka **Settings → Pages**.
4. Pada *Source* pilih **Deploy from a branch**, cabang `main`, folder `/ (root)`.
5. Simpan. Beberapa menit kemudian situsnya hidup di
   `https://<nama-pengguna>.github.io/simkimia/`.

Tidak ada langkah build, tidak ada dependensi yang perlu dipasang, dan
`node_modules/` tidak perlu diunggah (hanya dipakai untuk pengujian).

---

## Cara memakai

**Tetikus / papan sentuh**

| Tindakan | Hasil |
| --- | --- |
| Seret | memutar kamera |
| Roda tetikus | mendekat / menjauh |
| Shift + seret, atau seret kanan | menggeser titik pandang |
| Dua jari (sentuh) | zum dan geser |

**Papan tuan (pintasan)**

| Tombol | Fungsi |
| --- | --- |
| `F` | masuk / keluar layar penuh |
| `S` atau `O` | buka pemilih simulasi (tetap di layar penuh) |
| `←` `→` | simulasi sebelumnya / berikutnya |
| `Spasi` | jalan / jeda animasi |
| `C` | sembunyikan panel kontrol |
| `H` | sembunyikan seluruh antarmuka (tampilan bersih untuk proyektor) |
| `R` | kembalikan kamera ke posisi awal |
| `P` | putar kamera otomatis |
| `Esc` | tutup pemilih (atau buka pemilih bila sedang tertutup) |
| `Enter` | pilih hasil pencarian pertama di pemilih |

Tautan langsung ke satu simulasi memakai tanda pagar, misalnya
`index.html#titrasi` atau `.../simkimia/#tabel-periodik`.

---

## Daftar simulasi

| Fase | Jenjang | Simulasi |
| --- | --- | --- |
| **A** | SD 1–2 | Wujud Benda di Sekitar Kita · Mengenal Sifat Benda |
| **B** | SD 3–4 | Perubahan Wujud Zat · Larut dan Tak Larut · Sifat Bahan · Campuran dan Pemisahan |
| **C** | SD 5–6 | Perubahan Fisika dan Kimia · Indikator Alami Asam Basa · Partikel Materi · Teori Kinetik Sederhana |
| **D** | SMP 7–9 | Unsur, Senyawa, dan Campuran · Pemisahan Campuran Lanjut · Hukum Kekekalan Massa · Skala pH · Model Atom · Struktur Atom |
| **E** | SMA 10 | Konfigurasi Elektron · Tabel Periodik · Ikatan Kimia · Bentuk Molekul · Hukum Dasar Kimia · Stoikiometri · Larutan Elektrolit · Reaksi Redoks · Hidrokarbon dan Minyak Bumi · Kimia Hijau |
| **F** | SMA 11–12 | Termokimia · Laju Reaksi · Kesetimbangan Kimia · Teori Asam–Basa · Titrasi · Larutan Penyangga · Hidrolisis Garam · Kelarutan dan Ksp · Sifat Koligatif · Sistem Koloid · Sel Volta dan Elektrolisis · Makromolekul · Kimia Inti |

---

## Susunan berkas

```
index.html                 satu-satunya halaman — kerangka aplikasi
assets/
  css/app.css              gaya antarmuka melayang di atas kanvas
  js/
    katalog.js             daftar 39 simulasi (berkas .js agar jalan dari file://)
    sim3d.js               mesin 3D: materi, alat laboratorium, partikel,
                           teks, grafik, pencahayaan, kamera orbit
    aplikasi.js            kerangka SPA: pemuat modul, kontrol, layar penuh,
                           pemilih, pintasan papan tuan
  vendor/
    three.min.js           three.js r160 (UMD) — MIT
    three.LICENSE
sims/<slug>/sim.js         satu berkas per simulasi
tools/uji3d.mjs            pengujian otomatis (Playwright + Chromium)
tools/periksa-bingkai.mjs  pemeriksa tata letak label di setiap simulasi
tools/lihat.mjs            penangkap layar satu atau beberapa adegan
```

### Menambah simulasi baru

1. Tambahkan satu entri pada `assets/js/katalog.js`
   (`slug`, `judul`, `fase`, `jenjang`, `ringkas`, `topik`, `cp`, `warna`).
2. Buat `sims/<slug>/sim.js` yang memanggil `Sim3D.daftar('<slug>', { … })`
   dengan kunci: `latar`, `kamera`, `kendali`, `baca`, lalu fungsi
   `bangun(s)`, `ubah(s, id)`, `langkah(s, dt)`, `bacaUbah(s)`, dan `bersih(s)`.
3. Semua pembantu 3D tersedia lewat `S3` (singkatan `window.S3`), misalnya
   `S3.gelas()`, `S3.molekul()`, `S3.partikel()`, `S3.gambarGrafik()`,
   `S3.penunjuk()` untuk label berpenunjuk, dan `S3.panggungMolekul()` untuk
   adegan molekul yang tidak berdiri di atas meja.
4. Tambahkan `legenda: [{ warna, label }]` pada definisi simulasi bila
   adegannya memakai kode warna — legendanya muncul otomatis di atas adegan.

> Catatan: seluruh `const`/`let` tingkat modul harus ditulis **di atas**
> `return { … }` di dalam IIFE simulasi. Yang ditulis setelah `return`
> tidak pernah dijalankan dan akan melempar `ReferenceError`.
> `tools/uji3d.mjs` memeriksa hal ini sebelum membuka peramban.

---

## Pengujian

```bash
npm run uji                 # jalankan seluruh 39 simulasi
node tools/uji3d.mjs titrasi redoks     # hanya beberapa
npm run foto                # jalankan + simpan tangkapan layar ke tools/foto/
npm run bingkai             # periksa label yang tertutup bilah judul
npm run lihat -- titrasi    # tangkap satu adegan saja, untuk memeriksa tampilan
```

Pengujian menyapu **setiap** kontrol di setiap simulasi (geser ke nilai minimum,
maksimum, tengah, lalu kembali; setiap sakelar dua kali; setiap pilihan dan segmen;
setiap tombol), menyeret dan menzum kanvas, memastikan konteks WebGL tetap hidup,
dan menangkap setiap `pageerror` maupun `console.error`. Ditambah pemeriksaan
kerangka aplikasi: jumlah kartu pemilih, penyaringan pencarian, berpindah simulasi
tanpa memuat ulang halaman, dan setiap pintasan papan tuan.

---

## Lisensi

Kode dan materi SimKimia dilisensikan **MIT** — lihat [LICENSE](LICENSE).
Bebas dipakai, diubah, dan disebarkan, termasuk untuk keperluan sekolah.

three.js disertakan di `assets/vendor/` dengan lisensi MIT miliknya sendiri
(lihat `assets/vendor/three.LICENSE`).
