# ⚓ Media Harbor (Codec & Steganography Web App)

![Media Harbor Banner](https://img.shields.io/badge/Status-Completed-success?style=for-the-badge)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![FFmpeg](https://img.shields.io/badge/FFmpeg-007808?style=for-the-badge&logo=ffmpeg&logoColor=white)

**Media Harbor** adalah aplikasi web modern murni (_Client-Side_) yang dibangun untuk memproses media digital. Aplikasi ini memfokuskan pada penerapan algoritma **Kompresi (Codec)** dan penyembunyian pesan rahasia **(Steganografi)** pada tiga jenis media utama: Gambar, Audio, dan Video.

Proyek ini dikembangkan sebagai pemenuhan Tugas Akhir Project Sistem Multimedia.

---

## ✨ Fitur Utama

### 🖼️ Image Studio

- **Kompresi:** Menurunkan ukuran file gambar (JPG/PNG) menggunakan standar _WebP Encoding_ melalui Canvas API.
- **Steganografi (LSB):** Menyembunyikan pesan teks ke dalam piksel gambar menggunakan algoritma _Least Significant Bit_ murni tanpa merusak visual asli, dan mengekstraknya kembali.

### 🎵 Audio Studio

- **Kompresi (Downsampling):** Mengecilkan ukuran file audio (MP3/WAV) dengan memanipulasi _Sample Rate_ menggunakan Web Audio API.
- **Steganografi (16-bit PCM LSB):** Menyisipkan pesan ke dalam gelombang suara pada level desimal (Float32) dan mengemasnya secara aman (_lossless_) ke dalam file `.WAV`.

### 🎥 Video Studio

- **Kompresi:** Menurunkan resolusi dan _bitrate_ video (H.264 / AVC codec) di dalam browser menggunakan **FFmpeg.wasm**.
- **Steganografi (Metadata Injection):** Menyuntikkan teks rahasia ke dalam _header metadata_ file video tanpa merusak _frame_ ataupun memberatkan memori _browser_.

---

## 🧠 Algoritma Inti

### 1. Kompresi (Lossy Compression)

- **Gambar:** Menggunakan prinsip **DCT (Discrete Cosine Transform)** melalui _WebP VP8 Encoding_. Frekuensi detail tinggi yang tidak terlalu terlihat oleh mata manusia dibuang secara matematis (kuantisasi) untuk menghemat ukuran file.
- **Audio:** Menggunakan **Decimation / Downsampling** berdasarkan _Teori Nyquist_. Algoritma memotong laju sampel suara (contoh dari 44.100 Hz ke 16.000 Hz) dengan membuang sampel ekstra, mengurangi ukuran array secara linear tanpa menghilangkan kejelasan vokal.
- **Video:** Menggunakan **Inter-frame Prediction (Motion Compensation)** via codec H.264/AVC. Daripada menyimpan setiap _frame_ gambar utuh, algoritma ini hanya menyimpan _key-frames_ lalu menghitung vektor pergerakan untuk _frame_ berikutnya untuk membuang redundansi visual (pengulangan gambar).

### 2. Steganografi

- **Gambar & Audio:** Menggunakan algoritma **LSB (Least Significant Bit)**. Pesan rahasia dibongkar menjadi biner (0 dan 1) lalu disisipkan dengan menimpa bit paling kanan (bit ke-8) dari setiap byte warna piksel atau nilai gelombang suara. Karena perubahannya sangat kecil (senilai $2^0$), mustahil disadari oleh mata atau telinga manusia.
- **Video:** Menggunakan **Metadata Injection**. Alih-alih merusak piksel video yang berat diproses _browser_, algoritma ini menyuntikkan _string_ rahasia langsung ke dalam lapisan struktur tersembunyi (_Header Container_) dari file MP4 tersebut.

---

## 🛠️ Teknologi yang Digunakan

- **Frontend Framework:** React.js + Vite
- **Desain UI/UX:** Vanilla CSS (Glassmorphism & Custom Animations), `lucide-react` icons.
- **Pemrosesan Gambar:** HTML5 `<canvas>` API
- **Pemrosesan Audio:** Web Audio API (`AudioContext`, `OfflineAudioContext`)
- **Pemrosesan Video:** `@ffmpeg/ffmpeg` (WebAssembly)

---

## 🚀 Cara Menjalankan Aplikasi di Komputer Lokal

1. **Clone repository ini**

   ```bash
   git clone https://github.com/USERNAME/multimedia-codec-stego.git
   cd multimedia-codec-stego
   ```

2. **Instal dependensi (packages)**
   Pastikan Anda sudah menginstal [Node.js](https://nodejs.org/).

   ```bash
   npm install
   ```

3. **Jalankan _Development Server_**
   ```bash
   npm run dev
   ```
   Aplikasi dapat diakses melalui browser pada `http://localhost:5173`.

> **⚠️ Penting untuk FFmpeg.wasm:**
> Karena aplikasi ini menggunakan FFmpeg.wasm (SharedArrayBuffer), Vite telah dikonfigurasi secara khusus dengan _header_ `Cross-Origin-Embedder-Policy: require-corp` dan `Cross-Origin-Opener-Policy: same-origin`.

---

## 👥 Tim Pengembang (Kelompok 10 - IF-C)

- **Muhammad Fauzan Ashshidiq** - 1237050051
- **Muhammad Ikhsan Hazamy** - 1237050138
- **Fadil Mubarok** - 1237050144

**Mata Kuliah:** Sistem Multimedia  
**Universitas:** UIN Sunan Gunung Djati Bandung
