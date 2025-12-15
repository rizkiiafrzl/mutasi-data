# Sistem Manajemen Tenaga Kerja (TK)

Sistem manajemen untuk mengelola data tenaga kerja, laporan, dan upload data massal. Aplikasi ini terdiri dari backend API (Express.js) dan frontend (Vue.js 3).

## 📋 Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Persyaratan Sistem](#persyaratan-sistem)
- [Instalasi](#instalasi)
- [Konfigurasi](#konfigurasi)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Struktur Project](#struktur-project)
- [API Endpoints](#api-endpoints)
- [Penggunaan](#penggunaan)
- [Troubleshooting](#troubleshooting)
- [Kontribusi](#kontribusi)

## ✨ Fitur Utama

- 📊 **Dashboard**: Ringkasan data dan riwayat laporan
- 📝 **Laporan**: Manajemen laporan per periode dengan finalisasi
- 👥 **Data Pekerja**: Manajemen data pekerja dengan filter dan pencarian
- 📤 **Upload Massal**: Upload data dari file Excel dengan berbagai template
- 🔍 **Validasi Data**: Validasi otomatis untuk data yang diupload
- 📥 **Export Excel**: Export laporan ke format Excel
- 🏦 **Referensi Data**: Data bank, lokasi, dan sebab

## 🖥️ Persyaratan Sistem

### Backend
- **Node.js**: Versi 16.0.0 atau lebih tinggi
- **npm**: Versi 7.0.0 atau lebih tinggi

### Frontend
- **Node.js**: Versi 16.0.0 atau lebih tinggi
- **npm**: Versi 7.0.0 atau lebih tinggi
- Browser modern (Chrome, Firefox, Edge, Safari)

## 📦 Instalasi

### 1. Clone Repository

```bash
git clone <url-repository>
cd "New folder"
```

### 2. Install Dependencies Backend

```bash
cd Back-end
npm install
```

### 3. Install Dependencies Frontend

```bash
cd ../Front-end
npm install
```

## ⚙️ Konfigurasi

### Backend Configuration

Backend menggunakan konfigurasi default:
- **Port**: 5000 (dapat diubah dengan environment variable `PORT`)
- **Data Storage**: File JSON di `Back-end/src/data/`
- **Templates**: File Excel di `Back-end/src/templates/`

Untuk mengubah port, buat file `.env` di folder `Back-end/`:

```env
PORT=5000
NODE_ENV=development
```

### Frontend Configuration

Frontend menggunakan environment variable untuk konfigurasi API:

Buat file `.env` di folder `Front-end/`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Untuk production, sesuaikan dengan URL backend Anda:

```env
VITE_API_BASE_URL=https://api.example.com
```

## 🚀 Menjalankan Aplikasi

### Development Mode

#### 1. Jalankan Backend

```bash
cd Back-end
npm run dev
```

Backend akan berjalan di `http://localhost:5000`

#### 2. Jalankan Frontend (Terminal Baru)

```bash
cd Front-end
npm run dev
```

Frontend akan berjalan di `http://localhost:5173` (atau port yang tersedia)

### Production Mode

#### 1. Build Frontend

```bash
cd Front-end
npm run build
```

File hasil build akan ada di folder `Front-end/dist/`

#### 2. Jalankan Backend

```bash
cd Back-end
npm start
```

#### 3. Serve Frontend

Anda dapat menggunakan web server seperti:
- **Nginx**: Serve folder `Front-end/dist/`
- **Apache**: Serve folder `Front-end/dist/`
- **Node.js**: Gunakan `serve` atau `http-server`

Contoh dengan `serve`:

```bash
npm install -g serve
cd Front-end
serve -s dist -l 3000
```

## 📁 Struktur Project

```
.
├── Back-end/                 # Backend API Server
│   ├── index.js             # Entry point + HTTP server
│   ├── package.json
│   ├── src/
│   │   ├── config/          # Konfigurasi
│   │   │   ├── pathConfig.js
│   │   │   └── uploadConfig.js
│   │   ├── data/            # Data storage (JSON)
│   │   │   ├── bank.json
│   │   │   ├── data.json
│   │   │   ├── lokasi.json
│   │   │   └── sebab.json
│   │   ├── services/        # Business services
│   │   │   ├── api/        # API modules
│   │   │   ├── bankService.js
│   │   │   ├── locationService.js
│   │   │   ├── sebabService.js
│   │   │   └── templateService.js
│   │   ├── templates/       # Excel templates
│   │   │   ├── template_koreksi_tk.xlsx
│   │   │   ├── template_tk_baru.xlsx
│   │   │   ├── template_tk_lanjutan.xlsx
│   │   │   ├── template_tk_na.xlsx
│   │   │   └── template_upah.xlsx
│   │   └── utils/           # Utilities
│   │       ├── contributionCalculator.js
│   │       ├── dataTransform.js
│   │       ├── formatters.js
│   │       ├── reportExport.js
│   │       └── workerFilters.js
│   └── README.md
│
├── Front-end/               # Frontend Vue.js Application
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│   │   ├── main.js         # Entry point
│   │   ├── App.vue         # Root component
│   │   ├── components/     # Vue components
│   │   │   ├── base/      # Base components
│   │   │   └── domain/    # Domain-specific components
│   │   ├── composables/   # Vue composables
│   │   ├── services/      # API services
│   │   ├── utils/         # Utilities
│   │   ├── views/         # Page views
│   │   ├── router/        # Vue Router
│   │   └── config/        # Configuration
│   └── public/            # Static assets
│
└── README.md              # Dokumentasi utama (file ini)
```

## 🔌 API Endpoints

### Dashboard
- `GET /api/dashboard/summary` - Ringkasan dashboard
- `GET /api/dashboard/history` - Riwayat laporan dengan pagination

### Reports
- `GET /api/reports/current` - Periode aktif saat ini
- `POST /api/reports` - Membuat laporan baru
- `GET /api/reports/:periode` - Mendapatkan laporan berdasarkan periode
- `GET /api/reports/:periode/workers` - Daftar pekerja dalam laporan
- `POST /api/reports/:periode/workers` - Menambahkan pekerja ke laporan
- `POST /api/reports/:periode/finalize` - Finalisasi laporan
- `DELETE /api/reports/:periode` - Menghapus laporan

### Workers
- `GET /api/workers` - Daftar pekerja dengan filter
- `GET /api/workers/options` - Opsi untuk dropdown/form

### Uploads
- `GET /api/uploads/options` - Opsi tipe upload
- `GET /api/uploads/history` - Riwayat upload
- `POST /api/uploads` - Upload data massal

### References
- `GET /api/references/locations` - Data lokasi
- `GET /api/references/banks` - Data bank
- `GET /api/references/sebab` - Data sebab

### Health Check
- `GET /health` - Status server

### Templates
- `GET /templates/:filename` - Download template Excel

## 📖 Penggunaan

### 1. Akses Aplikasi

Setelah menjalankan backend dan frontend, buka browser dan akses:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

### 2. Dashboard

Halaman utama menampilkan:
- Ringkasan total laporan
- Statistik pekerja
- Riwayat laporan terbaru

### 3. Membuat Laporan Baru

1. Klik tombol "Buat Laporan Baru" di dashboard
2. Sistem akan membuat laporan untuk periode saat ini
3. Anda akan diarahkan ke halaman laporan

### 4. Upload Data Massal

1. Buka halaman "Upload Massal"
2. Pilih tipe upload (TK Baru, TK Lanjutan, dll)
3. Download template Excel yang sesuai
4. Isi template dengan data
5. Upload file Excel yang sudah diisi
6. Sistem akan memvalidasi dan memproses data

### 5. Mengelola Pekerja

1. Buka halaman "Pekerja"
2. Gunakan filter untuk mencari pekerja
3. Tambah/edit/hapus data pekerja
4. Data akan tersimpan di backend

### 6. Finalisasi Laporan

1. Buka halaman laporan
2. Pastikan semua data sudah benar
3. Klik tombol "Finalisasi"
4. Isi checklist yang diperlukan
5. Laporan akan difinalisasi dan tidak bisa diubah lagi

## 🔧 Troubleshooting

### Backend tidak bisa dijalankan

**Masalah**: Port sudah digunakan
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill
```

**Solusi**: Ubah port di file `.env` atau environment variable `PORT`

### Frontend tidak bisa connect ke Backend

**Masalah**: CORS error atau connection refused

**Solusi**:
1. Pastikan backend sudah berjalan
2. Periksa `VITE_API_BASE_URL` di file `.env` frontend
3. Pastikan URL backend benar (tanpa trailing slash)

### Error saat upload file Excel

**Masalah**: Format file tidak sesuai

**Solusi**:
1. Download template yang sesuai dari sistem
2. Pastikan kolom sesuai dengan template
3. Periksa format data (tanggal, angka, dll)
4. Pastikan tidak ada sel yang kosong di kolom wajib

### Data tidak tersimpan

**Masalah**: File JSON tidak bisa ditulis

**Solusi**:
1. Pastikan folder `Back-end/src/data/` ada
2. Pastikan aplikasi memiliki permission untuk menulis file
3. Periksa disk space

## 🤝 Kontribusi

1. Fork repository
2. Buat branch untuk fitur baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📝 Catatan Penting

- **Data Storage**: Saat ini menggunakan file JSON. Untuk production, pertimbangkan menggunakan database (PostgreSQL, MySQL, MongoDB)
- **Security**: Pastikan untuk menambahkan autentikasi dan autorisasi untuk production
- **Backup**: Lakukan backup rutin pada folder `Back-end/src/data/`
- **Environment Variables**: Jangan commit file `.env` ke repository

## 📄 License

ISC

## 👤 Author

[Rizki Afrizal/Magang Berdampak]

## 🙏 Acknowledgments

- Vue.js team
- Express.js team
- Semua kontributor open source yang digunakan dalam project ini

---

**Catatan**: Dokumentasi ini akan terus diperbarui. Jika ada pertanyaan atau masalah, silakan buat issue di repository.

