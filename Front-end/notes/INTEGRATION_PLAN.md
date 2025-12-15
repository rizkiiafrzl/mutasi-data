# 📋 Rencana Integrasi data.json ke Aplikasi

## 🎯 Tujuan
Mengintegrasikan data dari `public/mock-api/data.json` ke dalam komponen Vue yang ada, menggantikan data dummy/hardcoded dengan data dari JSON.

---

## 📁 1. PENAMBAHAN FILE & STRUKTUR

### A. Service Layer (API Service)
**File Baru:** `src/services/mockApi.js`

**Fungsi:**
- Fetch data dari `data.json`
- Transform data ke format yang digunakan komponen
- Error handling
- Loading states management

**Struktur:**
```javascript
export const api = {
  // Dashboard endpoints
  getDashboardSummary(),
  getDashboardHistory(page, perPage, statusFilter),
  
  // Reports endpoints
  getReportByPeriode(periode),
  getReportWorkers(periode, page, perPage, search, statusFilter),
  finalizeReport(periode, checklist),
  
  // Workers endpoints
  getWorkers(options),
  getWorkerOptions(),
  
  // Uploads endpoints
  getUploadOptions(),
  getUploadHistory(page, perPage)
}
```

### B. Utils/Helpers
**File Baru:** `src/utils/dataTransform.js`

**Fungsi:**
- Transform data dari JSON ke format komponen
- Mapping actions (EDIT → "Edit", dll)
- Format periode (2025-11 → 11/2025)
- Mapping status (AKTIF → "Aktif")

### C. Composables (Opsional - untuk reusability)
**File Baru:** `src/composables/useApi.js` atau `src/composables/useDashboard.js`

**Fungsi:**
- Reusable logic untuk fetch data
- State management untuk data
- Caching mechanism

---

## 🔄 2. PERUBAHAN PADA KOMPONEN YANG ADA

### A. Dashboard.vue

#### Data yang Perlu Diubah:
1. **`reportHistoryDataRaw`** → Load dari `dashboard.history.data`
2. **`summaryData`** → Load dari `dashboard.summary`
3. **Pagination** → Gunakan `dashboard.history.pagination`

#### Mapping yang Diperlukan:
```javascript
// JSON → Component Format
{
  periodeDisplay: "11/2025" → periode: "11/2025" ✓
  actions: ["EDIT", "CETAK", "HAPUS"] → actions: ["Edit", "Cetak", "Hapus"]
  status: "DRAFT" → status: "DRAFT" ✓
}
```

#### Perubahan Kode:
- Ganti hardcoded data dengan `ref()` yang diisi dari API
- Tambah `onMounted()` untuk fetch data
- Implementasi filter status (sudah ada, perlu disesuaikan)
- Implementasi pagination dari JSON

#### Field Mapping:
| JSON Field | Component Field | Transform |
|------------|----------------|-----------|
| `periodeDisplay` | `periode` | Direct |
| `jumlahTk` | `jumlahTk` | Direct |
| `nominalIuran` | `nominalIuran` | Direct |
| `nominalDenda` | `nominalDenda` | Direct |
| `status` | `status` | Direct |
| `actions` | `actions` | Transform array |

### B. Report.vue

#### Data yang Perlu Diubah:
1. **`editSummaryData`** → Load dari `reports[periode].summary`
2. **`rincianIuran`** → Load dari `reports[periode].rincianIuran`
3. **`employeeRowsRaw`** → Load dari `reports[periode].workers.data`
4. **`finalisasiChecklist`** → Load dari `reports[periode].finalisasi.checklist`
5. **Pagination** → Gunakan `reports[periode].workers.pagination`

#### Mapping yang Diperlukan:
```javascript
// JSON → Component Format
{
  status: "AKTIF" → status: "Aktif" (atau tetap "AKTIF")
  jk: "Laki-laki" → jk: "Laki-laki" ✓
  nama → nama ✓
}
```

#### Perubahan Kode:
- Load data berdasarkan `periode` dari query parameter
- Tambah `onMounted()` untuk fetch data report
- Handle loading state
- Handle error jika periode tidak ditemukan
- Implementasi search & filter untuk workers
- Load finalisasi checklist dari JSON

#### Field Mapping:
| JSON Field | Component Field | Transform |
|------------|----------------|-----------|
| `summary.totalTenagaKerja` | `totalTenagaKerja` | Direct |
| `summary.totalUpahRapel` | `totalUpahRapel` | Direct |
| `summary.totalIuran` | `totalIuran` | Direct |
| `summary.totalDenda` | `totalDenda` | Direct |
| `workers.data[].status` | `status` | "AKTIF" → "Aktif" |
| `finalisasi.checklist` | `finalisasiChecklist` | Direct |

### C. Workers.vue (jika ada)

#### Data yang Perlu Diubah:
1. **Options** → Load dari `workers.options`
2. **Data** → Load dari `workers.data`

### D. Massal.vue (jika ada)

#### Data yang Perlu Diubah:
1. **Upload options** → Load dari `uploads.options`
2. **History** → Load dari `uploads.history`

---

## 🛠️ 3. IMPLEMENTASI API SERVICE

### Struktur Service (`src/services/mockApi.js`):

```javascript
// Load data.json
let mockData = null;

async function loadMockData() {
  if (!mockData) {
    const response = await fetch('/mock-api/data.json');
    mockData = await response.json();
  }
  return mockData;
}

export const api = {
  // Dashboard
  async getDashboardSummary() {
    const data = await loadMockData();
    return data.dashboard.summary;
  },
  
  async getDashboardHistory(page = 1, perPage = 10, statusFilter = 'all') {
    const data = await loadMockData();
    let history = data.dashboard.history.data;
    
    // Filter by status
    if (statusFilter !== 'all') {
      history = history.filter(item => item.status === statusFilter);
    }
    
    // Pagination
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedData = history.slice(start, end);
    
    return {
      data: paginatedData,
      pagination: {
        ...data.dashboard.history.pagination,
        page,
        per_page: perPage,
        total: history.length,
        totalPages: Math.ceil(history.length / perPage)
      }
    };
  },
  
  // Reports
  async getReportByPeriode(periode) {
    const data = await loadMockData();
    const report = data.reports[periode];
    if (!report) {
      throw new Error(`Report untuk periode ${periode} tidak ditemukan`);
    }
    return report;
  },
  
  async getReportWorkers(periode, page = 1, perPage = 10, search = '', statusFilter = 'all') {
    const report = await this.getReportByPeriode(periode);
    let workers = report.workers.data || [];
    
    // Filter by status
    if (statusFilter !== 'all') {
      workers = workers.filter(w => w.status === statusFilter);
    }
    
    // Search
    if (search) {
      const searchLower = search.toLowerCase();
      workers = workers.filter(w => 
        w.nama.toLowerCase().includes(searchLower) ||
        w.nik.includes(search) ||
        w.kpj.includes(search)
      );
    }
    
    // Pagination
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedData = workers.slice(start, end);
    
    return {
      data: paginatedData,
      pagination: {
        ...report.workers.pagination,
        page,
        per_page: perPage,
        total: workers.length,
        totalPages: Math.ceil(workers.length / perPage)
      }
    };
  },
  
  async finalizeReport(periode, checklist) {
    // Simulasi POST request
    // Di production, ini akan POST ke API
    const report = await this.getReportByPeriode(periode);
    return {
      success: true,
      message: "Finalisasi berhasil dilakukan!",
      data: {
        ...report.finalisasi,
        status: "FINAL",
        tanggalFinalisasi: new Date().toISOString().split('T')[0]
      }
    };
  },
  
  // Workers
  async getWorkerOptions() {
    const data = await loadMockData();
    return data.workers.options;
  },
  
  async getWorkers(filters = {}) {
    const data = await loadMockData();
    let workers = data.workers.data;
    
    // Apply filters
    if (filters.status) {
      workers = workers.filter(w => w.status === filters.status);
    }
    if (filters.kategori) {
      workers = workers.filter(w => w.kategori === filters.kategori);
    }
    
    return workers;
  },
  
  // Uploads
  async getUploadOptions() {
    const data = await loadMockData();
    return data.uploads.options;
  },
  
  async getUploadHistory(page = 1, perPage = 10) {
    const data = await loadMockData();
    const history = data.uploads.history.data;
    
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedData = history.slice(start, end);
    
    return {
      data: paginatedData,
      pagination: {
        ...data.uploads.history.pagination,
        page,
        per_page: perPage,
        total: history.length,
        totalPages: Math.ceil(history.length / perPage)
      }
    };
  }
};
```

---

## 🔀 4. DATA TRANSFORMATION

### A. Dashboard History Transformation

**File:** `src/utils/dataTransform.js`

```javascript
// Transform actions dari JSON ke format component
export function transformActions(jsonActions) {
  const actionMap = {
    "EDIT": "Edit",
    "CETAK": "Cetak",
    "HAPUS": "Hapus",
    "BATAL": "Batal"
  };
  
  return jsonActions.map(action => actionMap[action] || action);
}

// Transform history item
export function transformHistoryItem(item) {
  return {
    periode: item.periodeDisplay || item.periode,
    jumlahTk: item.jumlahTk,
    nominalIuran: item.nominalIuran,
    nominalDenda: item.nominalDenda,
    status: item.status,
    actions: transformActions(item.actions || []),
    // Keep original data for reference
    original: item
  };
}

// Transform worker status
export function transformWorkerStatus(status) {
  const statusMap = {
    "AKTIF": "Aktif",
    "NONAKTIF": "Nonaktif"
  };
  return statusMap[status] || status;
}

// Transform worker data
export function transformWorker(worker) {
  return {
    no: worker.no,
    nik: worker.nik,
    nama: worker.nama,
    jk: worker.jk,
    kpj: worker.kpj,
    upahPokok: worker.upahPokok,
    rapel: worker.rapel || 0,
    totalUpah: worker.totalUpah,
    status: transformWorkerStatus(worker.status),
    actions: worker.actions || ["menu"]
  };
}
```

### B. Action Mapping

```javascript
const ACTION_MAP = {
  "EDIT": "Edit",
  "CETAK": "Cetak",
  "HAPUS": "Hapus",
  "BATAL": "Batal",
  "LIHAT": "Lihat"
};
```

### C. Status Mapping

```javascript
const STATUS_MAP = {
  "AKTIF": "Aktif",
  "NONAKTIF": "Nonaktif"
};
```

---

## 📊 5. STATE MANAGEMENT

### Loading States
Setiap komponen perlu memiliki:
```javascript
const isLoading = ref(false);
const error = ref(null);
```

### Reactive Data
```javascript
// Dashboard
const summaryData = ref({});
const reportHistoryDataRaw = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);

// Report
const editSummaryData = ref({});
const rincianIuran = ref([]);
const employeeRowsRaw = ref([]);
const finalisasiChecklist = ref({});
```

---

## 🔄 6. LIFECYCLE HOOKS

### Dashboard.vue
```javascript
onMounted(async () => {
  isLoading.value = true;
  try {
    // Load summary
    summaryData.value = await api.getDashboardSummary();
    
    // Load history
    const historyData = await api.getDashboardHistory(
      currentPage.value,
      itemsPerPage.value,
      statusFilter.value
    );
    reportHistoryDataRaw.value = historyData.data.map(transformHistoryItem);
    currentPage.value = historyData.pagination.page;
    totalPages.value = historyData.pagination.totalPages;
  } catch (err) {
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
});
```

### Report.vue
```javascript
onMounted(async () => {
  const periode = route.query.periode;
  if (!periode) {
    router.push({ path: "/dashboard" });
    return;
  }
  
  isLoading.value = true;
  try {
    // Load report data
    const reportData = await api.getReportByPeriode(periode);
    
    // Set summary
    editSummaryData.value = reportData.summary;
    rincianIuran.value = reportData.rincianIuran;
    
    // Set finalisasi checklist
    finalisasiChecklist.value = reportData.finalisasi.checklist;
    
    // Load workers
    const workersData = await api.getReportWorkers(
      periode,
      currentPage.value,
      itemsPerPage.value,
      searchQuery.value,
      statusFilter.value
    );
    employeeRowsRaw.value = workersData.data.map(transformWorker);
    currentPage.value = workersData.pagination.page;
    totalPages.value = workersData.pagination.totalPages;
    
    selectedPeriode.value = reportData.periodeDisplay;
    isDetailMode.value = true;
    
    // Show notification if from dashboard
    if (route.query.from === 'dashboard') {
      showNotificationModal.value = true;
    }
  } catch (err) {
    error.value = err.message;
    router.push({ path: "/dashboard" });
  } finally {
    isLoading.value = false;
  }
});
```

---

## ⚠️ 7. ERROR HANDLING

### Scenarios:
1. **File JSON tidak ditemukan**
   ```javascript
   catch (error) {
     console.error('Failed to load data:', error);
     error.value = 'Gagal memuat data. Silakan refresh halaman.';
   }
   ```

2. **Data tidak lengkap**
   ```javascript
   if (!data.dashboard || !data.dashboard.summary) {
     throw new Error('Data dashboard tidak lengkap');
   }
   ```

3. **Invalid periode**
   ```javascript
   if (!report) {
     throw new Error(`Report untuk periode ${periode} tidak ditemukan`);
   }
   ```

4. **Network error**
   ```javascript
   catch (error) {
     if (error.name === 'TypeError' && error.message.includes('fetch')) {
       error.value = 'Tidak dapat terhubung ke server.';
     }
   }
   ```

---

## 🎨 8. UI/UX IMPROVEMENTS

### Loading States
```vue
<template>
  <div v-if="isLoading" class="flex justify-center items-center min-h-[400px]">
    <div class="text-gray-500">Memuat data...</div>
  </div>
  <div v-else-if="error" class="text-red-500">
    {{ error }}
  </div>
  <div v-else>
    <!-- Content -->
  </div>
</template>
```

### Empty States
```vue
<template v-if="reportHistoryDataRaw.length === 0 && !isLoading">
  <div class="text-center py-8 text-gray-500">
    Tidak ada data laporan
  </div>
</template>
```

---

## ✅ 9. CHECKLIST IMPLEMENTASI

### Phase 1: Setup
- [ ] Buat `src/services/mockApi.js`
- [ ] Buat `src/utils/dataTransform.js`
- [ ] Test fetch data.json berhasil

### Phase 2: Dashboard Integration
- [ ] Update Dashboard.vue untuk fetch dari API
- [ ] Implementasi summary data
- [ ] Implementasi history data dengan pagination
- [ ] Implementasi filter status
- [ ] Mapping actions dari JSON
- [ ] Test semua fitur dashboard

### Phase 3: Report Integration
- [ ] Update Report.vue untuk fetch berdasarkan periode
- [ ] Implementasi summary data
- [ ] Implementasi rincian iuran
- [ ] Implementasi workers data dengan pagination
- [ ] Implementasi search & filter workers
- [ ] Implementasi finalisasi checklist
- [ ] Handle status finalisasi
- [ ] Test semua fitur report

### Phase 4: Error Handling & Polish
- [ ] Error handling di semua komponen
- [ ] Loading states
- [ ] Empty states
- [ ] Testing dengan berbagai skenario
- [ ] Code review

---

## 🔧 10. PERTIMBANGAN TEKNIS

### A. Fetch Method
- **Native `fetch()`** ✅ (Tidak perlu install, sudah built-in)
- **Axios** (Perlu install, lebih mudah tapi menambah dependency)

**Rekomendasi:** Gunakan native `fetch()` untuk mengurangi dependency.

### B. Data Format
- **Static JSON file** ✅ (Saat ini)
- **Mock server** (json-server) - untuk development lebih advanced

**Rekomendasi:** Mulai dengan static file, upgrade ke mock server jika diperlukan.

### C. State Management
- **Local state** ✅ (Saat ini - ref/computed di komponen)
- **Pinia/Vuex** (Jika aplikasi semakin kompleks)

**Rekomendasi:** Tetap pakai local state untuk saat ini.

### D. Type Safety (Opsional)
- **TypeScript** (Type safety)
- **JSDoc comments** (Documentation)

**Rekomendasi:** Tambahkan JSDoc untuk dokumentasi.

---

## 📝 11. CATATAN PENTING

### Data Mapping Issues:
1. **Actions:** JSON menggunakan uppercase ("EDIT"), component menggunakan title case ("Edit")
2. **Status:** JSON menggunakan "AKTIF", component mungkin perlu "Aktif"
3. **Periode:** JSON punya `periode` (2025-11) dan `periodeDisplay` (11/2025)

### Backward Compatibility:
- Pastikan semua komponen yang sudah ada tetap berfungsi
- Lakukan perubahan secara bertahap
- Test setiap perubahan

### Performance:
- Cache data yang sudah di-fetch
- Lazy load data yang tidak langsung diperlukan
- Implementasi pagination dengan benar

---

## 🚀 12. NEXT STEPS

1. **Review** dokumen ini dengan tim
2. **Setup** service layer (Phase 1)
3. **Implement** Dashboard integration (Phase 2)
4. **Implement** Report integration (Phase 3)
5. **Polish** dan testing (Phase 4)

---

**Dibuat:** $(date)
**Versi:** 1.0
**Status:** Draft - Ready for Implementation


