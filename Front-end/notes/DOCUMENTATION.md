# Dokumentasi Backend dan Vue Components

## 📁 STRUKTUR BACKEND

### 1. **src/services/api.js** - Main API Service
**Fungsi Utama:** Mock API service yang menangani semua operasi data menggunakan localStorage dan file JSON.

#### Fungsi-fungsi Utama:

**Dashboard Operations:**
- `getDashboardSummary()` - Mengambil data summary dashboard (kode tagihan, total iuran, dll)
- `getDashboardHistory(page, perPage, statusFilter)` - Mengambil riwayat laporan dengan pagination dan filter status
- `createNewReport()` - Membuat laporan bulanan baru (auto-increment periode)
- `deleteReport(periode)` - Menghapus laporan berdasarkan periode

**Report Operations:**
- `getReportByPeriode(periode)` - Mengambil data laporan untuk periode tertentu
- `getReportWorkers(periode, page, perPage, search, statusFilter)` - Mengambil daftar tenaga kerja dengan pagination, search, dan filter
- `finalizeReport(periode, checklist)` - Finalisasi laporan dengan validasi checklist
- `addWorkerToReport(periode, workerPayload)` - Menambahkan tenaga kerja baru ke laporan

**Upload & Integration:**
- `integrateUploadData(uploadData, periode)` - Mengintegrasikan data upload ke mock data
  - Support untuk: TK Massal (Mendaftar/Lanjutan), TK Nonaktif, Upah Massal, Koreksi Massal
  - Auto-generate ID_PEGAWAI dan KODE_TK
  - Update summary dan rincian iuran otomatis

**Data Management:**
- `loadMockData(forceReload)` - Load data dari JSON dengan caching
- `persistMockData()` - Simpan data ke localStorage
- `clearCache()` - Clear cache untuk development/testing

### 2. **src/services/bankService.js**
**Fungsi:** Service untuk referensi data bank
- `fetchBanks()` - Fetch daftar bank dari mock API
- `buildBankMap(banks)` - Membuat map bank untuk lookup cepat
- `validateBankMatch(namaBank, kodeBank, banks)` - Validasi kecocokan nama dan kode bank

### 3. **src/services/locationService.js**
**Fungsi:** Service untuk referensi lokasi pekerjaan
- `fetchLocations()` - Fetch daftar lokasi dari mock API
- `buildLokasiMap(locations)` - Membuat map lokasi untuk lookup cepat

### 4. **src/services/sebabService.js**
**Fungsi:** Service untuk referensi sebab nonaktif
- Fetch dan validasi data sebab nonaktif

### 5. **src/services/templateService.js**
**Fungsi:** Service untuk download template Excel
- `downloadTemplateFile(templateType)` - Download template file untuk upload

---

## 📄 FILE VUE DENGAN SCRIPT SETUP

### **VIEWS (Halaman Utama)**

#### 1. **src/views/dashboard.vue**
**Fungsi:** Halaman dashboard utama untuk melihat summary dan riwayat laporan

**Script Setup:**
- **Imports:**
  - Vue composables: `ref`, `computed`, `onMounted`, `watch`
  - Router: `useRouter`
  - Components: ContentContainer, Table, Pagination, Chip, Dialog, Button
  - Services: `api`
  - Utils: `formatCurrency`, `openReportPrintPreview`, `downloadReportWorkbook`
  - Composables: `usePagination`

- **State Management:**
  - `reportHistoryDataRaw` - Data riwayat laporan dari API
  - `summaryData` - Data summary (kode tagihan, total iuran, dll)
  - `isLoading`, `error` - Loading dan error states
  - `tableHeaders` - Header untuk tabel riwayat
  - `statusFilter`, `itemsPerPage` - Filter dan pagination
  - Modal states: `showCetakModal`, `showHapusModal`, `showDownloadModal`
  - `selectedPeriode`, `selectedPeriodeKey` - Periode yang dipilih untuk aksi

- **Methods:**
  - `handleNewReport()` - Membuat laporan bulanan baru
  - `handleCetak(row)` - Handler untuk cetak laporan
  - `handleHapus(row)` - Handler untuk hapus laporan
  - `handleDownload(row)` - Handler untuk download laporan
  - `handleEdit(periode)` - Navigasi ke halaman edit laporan
  - `loadSummaryData()` - Load data summary dari API
  - `loadHistoryData(forceReload)` - Load data riwayat dengan pagination dan filter

- **Computed:**
  - `reportHistoryData` - Transform data untuk tabel dengan format currency

- **Lifecycle:**
  - `onMounted()` - Load summary dan history data saat component mount
  - `watch()` - Watch filter changes untuk reload data

---

#### 2. **src/views/Report.vue**
**Fungsi:** Halaman detail laporan untuk melihat dan mengelola data tenaga kerja per periode

**Script Setup:**
- **Imports:**
  - Vue composables: `ref`, `computed`, `onMounted`, `watch`, `onUnmounted`
  - Router: `useRoute`, `useRouter`
  - Components: Button, ContentContainer, CheckBox, SearchBar, Table, Pagination, Chip, Dialog
  - Services: `api`
  - Utils: `calculateWorkerContribution`, `calculateTotalContributions`, `formatCurrency`, `convertPeriodeToKey`
  - Composables: `useReportData`, `usePagination`

- **State Management:**
  - `currentRiskLevel` - Level risiko untuk perhitungan iuran
  - `isRecalculatingContributions` - Flag untuk recalculate iuran
  - `itemsPerPage`, `searchQuery`, `statusFilter` - Pagination dan filter
  - `isDetailMode`, `selectedPeriode` - Mode tampilan detail
  - `showUploadMassalDropdown` - Dropdown untuk upload massal
  - `showAddWorkerModal` - Modal tambah tenaga kerja
  - `showFinalisasiModal`, `finalisasiChecklist` - Modal dan checklist finalisasi
  - `showWorkerDetailModal`, `selectedWorker` - Modal detail worker
  - `editSummaryData`, `rincianIuran` - Data summary dan rincian iuran
  - `employeeRowsRaw` - Data raw tenaga kerja

- **Methods:**
  - `recalculateSummaryFromRows()` - Recalculate summary dari data workers
  - `handleRiskLevelChange()` - Handler perubahan risk level
  - `handleFinalisasi()` - Proses finalisasi laporan
  - `handleAddWorker()` - Tambah tenaga kerja baru
  - `handleWorkerDetail(row)` - Tampilkan detail worker
  - `handleNonaktifWorker()` - Nonaktifkan worker
  - `loadReportData()` - Load data laporan dari API
  - `loadWorkersData()` - Load data workers dengan pagination

- **Computed:**
  - `selectedWorkerDisplay` - Format display untuk worker yang dipilih
  - `selectedWorkerContribution` - Perhitungan kontribusi untuk worker yang dipilih

- **Lifecycle:**
  - `onMounted()` - Load data saat mount
  - `watch()` - Watch route changes untuk reload data
  - `onUnmounted()` - Cleanup timers

---

#### 3. **src/views/Massal.vue**
**Fungsi:** Halaman upload data massal (TK Massal, Koreksi, TK Nonaktif, Upah Massal)

**Script Setup:**
- **Imports:**
  - Vue composables: `ref`, `computed`, `onMounted`, `watch`
  - Router: `useRouter`, `useRoute`
  - Components: Table, Pagination, Dialog, Button
  - Services: `downloadTemplateFile` dari templateService
  - Config: `uploadTypes` dari uploadConfig
  - Composables: `useMassUpload`, `useUploadHandler`, `useUploadHistory`, `usePagination`

- **State Management:**
  - `selectedUploadType` - Jenis upload yang dipilih (tk-massal, koreksi-massal, dll)
  - `tkMassalSubType` - Sub-type untuk TK Massal (mendaftar/lanjutan)
  - `fileInputRef` - Reference untuk file input
  - Modal states: `showWarningModal`, `showSuccessModal`, `showConfirmModal`
  - `warningMessage`, `successMessage`, `confirmMessage` - Pesan untuk modal

- **Methods:**
  - `handleBack()` - Kembali ke halaman Report
  - `handleFileSelect(event)` - Handler pemilihan file
  - `handleClearFile()` - Clear file yang dipilih
  - `handleUpload()` - Proses validasi file upload
  - `handleSubmitUpload()` - Submit data yang sudah divalidasi
  - `handleSuccessModalClose()` - Handler setelah upload berhasil
  - `loadRequiredReferences()` - Load referensi data (bank, lokasi, sebab)
  - `downloadTemplate()` - Download template Excel

- **Computed:**
  - `activeUploadType` - Upload type yang aktif berdasarkan selection

- **Lifecycle:**
  - `onMounted()` - Load referensi data saat mount
  - `watch()` - Watch perubahan sub-type untuk reset file

---

#### 4. **src/views/Workers.vue**
**Fungsi:** Halaman form pendaftaran tenaga kerja baru (2 step: form singkat + form rinci)

**Script Setup:**
- **Imports:**
  - Vue composables: `ref`, `onMounted`
  - Router: `useRouter`, `useRoute`
  - Components: ContentContainer, Button, Dialog, TextField, TextArea
  - Services: `api`
  - Utils: `convertPeriodeToKey`, `navigateToReport`

- **State Management:**
  - `showBPJSModal`, `hasBPJSCard` - Modal dan status kartu BPJS
  - `kpjNumber` - Nomor KPJ
  - `showApprovalModal` - Modal persetujuan
  - `showSuccessModal`, `successMessage` - Modal sukses
  - `submissionError`, `isSavingWorker` - Error dan loading state
  - `currentStep` - Step form saat ini (1 = singkat, 2 = rinci)
  - `simpleForm` - Data form singkat (NIK, nama, tanggal lahir, dll)
  - `detailForm` - Data form rinci (status pegawai, upah, alamat, dll)
  - `simpleErrors`, `detailErrors` - Error validation
  - `captcha` - Captcha untuk form singkat

- **Methods:**
  - `refreshCaptcha()` - Refresh captcha
  - `validateSimple()` - Validasi form singkat
  - `validateDetail()` - Validasi form rinci
  - `handleSimpleSubmit()` - Submit form singkat
  - `handleDetailSubmit()` - Submit form rinci dan simpan ke API
  - `handleBack()` - Kembali ke step sebelumnya atau ke Report
  - `handleBPJSModalClose()` - Handler tutup modal BPJS

- **Lifecycle:**
  - `onMounted()` - Setup initial state

---

### **COMPONENTS (Komponen Reusable)**

#### 5. **src/components/AppBar.vue**
**Fungsi:** Komponen navigation bar aplikasi

#### 6. **src/components/NavBar.vue**
**Fungsi:** Komponen sidebar navigation

#### 7. **src/components/Button.vue**
**Fungsi:** Komponen button reusable dengan berbagai variant

#### 8. **src/components/Card.vue**
**Fungsi:** Komponen card container

#### 9. **src/components/ContentContainer.vue**
**Fungsi:** Komponen container untuk konten dengan header dan action slot

#### 10. **src/components/Table.vue**
**Fungsi:** Komponen tabel dengan support custom columns dan slots

#### 11. **src/components/Pagination.vue**
**Fungsi:** Komponen pagination dengan prev/next buttons

#### 12. **src/components/Chip.vue**
**Fungsi:** Komponen badge/chip untuk status (Draft, Final, Approval, dll)

#### 13. **src/components/Dialog.vue**
**Fungsi:** Komponen modal dialog reusable

#### 14. **src/components/SearchBar.vue**
**Fungsi:** Komponen search bar dengan debounce

#### 15. **src/components/TextField.vue**
**Fungsi:** Komponen input text field dengan label dan error handling

#### 16. **src/components/TextArea.vue**
**Fungsi:** Komponen textarea dengan label dan error handling

#### 17. **src/components/CheckBox.vue**
**Fungsi:** Komponen checkbox dengan label

---

### **COMPOSABLES (Reusable Logic)**

#### 18. **src/composables/usePagination.js**
**Fungsi:** Composable untuk handle pagination logic
- `currentPage`, `totalPages` - State pagination
- `handlePrevPage()`, `handleNextPage()` - Handler navigation

#### 19. **src/composables/useMassUpload.js**
**Fungsi:** Composable untuk handle upload massal logic
- Validasi file Excel
- Parse dan transform data
- Error handling dan reporting

#### 20. **src/composables/useMassUploadValidator.js**
**Fungsi:** Composable untuk validasi data upload
- Validasi format data
- Validasi referensi (bank, lokasi, sebab)
- Generate error messages

#### 21. **src/composables/useReportData.js**
**Fungsi:** Composable untuk manage data laporan
- Load report data
- Update report data
- Recalculate contributions

#### 22. **src/composables/useUploadHandler.js**
**Fungsi:** Composable untuk handle submit upload
- Integrate data ke API
- Generate upload history
- Error handling

#### 23. **src/composables/useUploadHistory.js**
**Fungsi:** Composable untuk manage upload history
- Load history data
- Add history entry
- Format history untuk tabel

---

## 🔄 ALUR KERJA BACKEND

### 1. **Data Flow:**
```
JSON File (public/mock-api/data.json)
    ↓
loadMockData() → Cache di memory
    ↓
persistMockData() → localStorage
    ↓
API Methods → Transform & Return Data
```

### 2. **Upload Flow:**
```
User Upload File Excel
    ↓
useMassUpload → Parse & Validate
    ↓
useUploadHandler → Submit to API
    ↓
api.integrateUploadData() → Update mockData
    ↓
persistMockData() → Save to localStorage
    ↓
Return Success/Error
```

### 3. **Report Flow:**
```
User Select Periode
    ↓
api.getReportByPeriode() → Load Report Data
    ↓
api.getReportWorkers() → Load Workers with Filter
    ↓
Display in Table with Pagination
    ↓
User Action (Edit/Add/Delete)
    ↓
API Update → persistMockData()
```

---

## 📊 DATA STRUCTURE

### Mock Data Structure:
```javascript
{
  dashboard: {
    summary: { kodeTagihan, totalIuranDanDenda, sisaPembayaran, totalTagihan },
    history: { data: [...], pagination: {...} }
  },
  reports: {
    "2025-11": {
      periode, periodeDisplay,
      summary: { totalTenagaKerja, totalUpahRapel, totalIuran, totalDenda },
      riskLevel, useTotalUpahForContribution,
      rincianIuran: [...],
      workers: { data: [...], pagination: {...} },
      finalisasi: { checklist: {...}, status, tanggalFinalisasi }
    }
  },
  currentPeriod: "2025-11",
  tenagaKerjaNonaktif: [...]
}
```

---

## 🎯 KESIMPULAN

**Backend:**
- Menggunakan Mock API dengan localStorage untuk persistence
- Semua operasi CRUD dilakukan melalui `api.js`
- Data disimpan di localStorage dengan key `mutasiDataCache`
- Support untuk berbagai jenis upload dengan validasi

**Vue Components:**
- Semua views menggunakan `<script setup>` untuk Composition API
- State management menggunakan `ref()` dan `computed()`
- Reusable logic dipisahkan ke composables
- Components menggunakan props dan slots untuk flexibility





