# Backend Service - TK Management System

Backend service untuk sistem manajemen Tenaga Kerja (TK). Service ini mengelola data, business logic, dan API endpoints untuk aplikasi frontend.

## Struktur Folder

```
Back-end/
├── index.js                 # Entry point utama + HTTP server
├── package.json
├── src/
│   ├── services/           # Business services
│   │   ├── api/           # API modules
│   │   │   ├── cache.js
│   │   │   ├── dashboard.js
│   │   │   ├── reports.js
│   │   │   ├── uploads.js
│   │   │   ├── utils.js
│   │   │   ├── workers.js
│   │   │   └── index.js
│   │   ├── bankService.js
│   │   ├── locationService.js
│   │   ├── sebabService.js
│   │   └── templateService.js
│   ├── config/            # Konfigurasi
│   │   ├── pathConfig.js
│   │   └── uploadConfig.js
│   ├── utils/             # Business logic utilities
│   │   ├── contributionCalculator.js
│   │   ├── dataTransform.js
│   │   ├── formatters.js
│   │   ├── reportExport.js
│   │   └── workerFilters.js
│   ├── data/              # Mock data (JSON)
│   │   ├── bank.json
│   │   ├── data.json
│   │   ├── lokasi.json
│   │   └── sebab.json
│   └── templates/         # Excel templates
│       ├── template_koreksi_tk.xlsx
│       ├── template_tk_baru.xlsx
│       ├── template_tk_lanjutan.xlsx
│       ├── template_tk_na.xlsx
│       └── template_upah.xlsx
```

## Instalasi

```bash
npm install
```

## Dependencies

- **express**: HTTP server untuk mengekspose API
- **cors**: Mengizinkan akses frontend (dev/prod) ke API
- **xlsx**: Library untuk membaca dan menulis file Excel

## Penggunaan

### Menjalankan HTTP API

```
npm start        # production mode
npm run dev      # menggunakan node --watch
```

Server default berjalan pada `http://localhost:5000` dengan endpoint utama:

- `GET /health` – pengecekan cepat
- `GET /api/dashboard/summary`
- `GET /api/dashboard/history?page=&perPage=&status=&forceReload=`
- `GET /api/reports/:periode`
- `GET /api/reports/:periode/workers`
- `POST /api/reports/:periode/finalize`
- `POST /api/reports/:periode/workers`
- `POST /api/uploads` – payload mengikuti struktur `integrateUploadData`
- `POST /api/reports` / `DELETE /api/reports/:periode`
- `GET /api/workers/options`, `GET /api/workers`
- `GET /api/uploads/options`, `GET /api/uploads/history`
- `GET /api/reports/current` – periode aktif

Template Excel juga tersedia langsung di `http://localhost:5000/templates/<nama-file>.xlsx`.

Data mock dibaca/ditulis dari `src/data/data.json`. Simpanan akan dipertahankan selama file tersebut tidak direset.

### Import sebagai Module

```javascript
import {
  // API Services
  loadMockData,
  getDashboardStats,
  getWorkers,
  integrateUploadData,
  
  // Standalone Services
  fetchBanks,
  fetchLocations,
  fetchSebab,
  
  // Config
  uploadTypes,
  getTemplateConfig,
  
  // Utils
  calculateTotalContributions,
  convertPeriodeToKey,
  exportToExcel,
  
  // Data Paths
  DATA_PATHS
} from './index.js';
```

### Menjalankan Tests

Belum tersedia test otomatis. Jalankan `npm start` lalu gunakan tool seperti Postman/Thunder Client atau `curl` untuk melakukan smoke test endpoint.

## File yang Dipindahkan dari Frontend

Semua file backend-related sudah dipindahkan dari folder Frontend/src:

- ✅ Services API modules (cache, dashboard, reports, uploads, utils, workers)
- ✅ Standalone services (bank, location, sebab, template)
- ✅ Configuration (uploadConfig)
- ✅ Business logic utilities (contributionCalculator, dataTransform, workerFilters, reportExport)
- ✅ Mock data (JSON files)
- ✅ Excel templates

## Catatan

- Backend menggunakan ES Modules (`"type": "module"` di package.json)
- Semua file sudah menggunakan `.js` extension dengan import/export ES6
- Data mock disimpan di folder `src/data/`
- Template Excel disimpan di folder `src/templates/`

## Next Steps

Frontend perlu diupdate untuk menggunakan backend service ini dengan:
1. Setup API endpoints atau shared module access
2. Update import paths di Frontend
3. Test integrasi antara Frontend dan Backend
