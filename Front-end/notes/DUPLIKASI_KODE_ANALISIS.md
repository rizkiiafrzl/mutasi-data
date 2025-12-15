# Analisis Duplikasi Kode

## Ringkasan
Setelah membaca semua file views, components, composables, services, dan utils, berikut adalah temuan duplikasi kode:

---

## ✅ **TIDAK ADA DUPLIKASI** (Sudah Terorganisir dengan Baik)

### 1. **Format Currency**
- ✅ Semua views menggunakan `formatCurrency` dari `utils/formatters.js`
- ✅ Tidak ada duplikasi

### 2. **Router Navigation**
- ✅ Semua views menggunakan helper functions dari `utils/routerHelpers.js`
- ✅ Tidak ada duplikasi

### 3. **Data Transformation**
- ✅ Semua views menggunakan functions dari `utils/dataTransform.js`
- ✅ Tidak ada duplikasi

### 4. **Contribution Calculator**
- ✅ Semua views menggunakan `contributionCalculator.js`
- ✅ Tidak ada duplikasi

### 5. **Worker Filters**
- ✅ Semua views menggunakan `workerFilters.js`
- ✅ Tidak ada duplikasi

---

## ⚠️ **DUPLIKASI YANG DITEMUKAN**

### 1. **Pagination Logic** 🔴 **DUPLIKASI TINGGI**

**Lokasi Duplikasi:**
- `src/views/Dashboard.vue` (lines 149-161)
- `src/views/Massal.vue` (lines 252-262)
- `src/views/Report.vue` (lines 234-246)

**Kode yang Terduplikasi:**
```javascript
function handlePrevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
    // loadData() atau tidak ada
  }
}

function handleNextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    // loadData() atau tidak ada
  }
}
```

**Status:**
- ❌ Ada composable `usePagination.js` yang sudah dibuat tapi **TIDAK DIGUNAKAN** di views
- ❌ Setiap view mengimplementasikan logic yang sama secara manual

**Rekomendasi:**
- Gunakan composable `usePagination.js` yang sudah ada di semua views
- Atau refactor composable untuk lebih fleksibel

---

### 2. **Filter Status & Items Per Page** 🟡 **DUPLIKASI SEDANG**

**Lokasi Duplikasi:**
- `src/views/Dashboard.vue` (lines 59-68, 201-204)
- `src/views/Report.vue` (lines 28-31, 511-519)

**Kode yang Terduplikasi:**
```javascript
// State
const itemsPerPage = ref(10);
const itemsPerPageOptions = [5, 10, 25, 50, 100];
const statusFilter = ref("all");

// Watch
watch([statusFilter, itemsPerPage], () => {
  currentPage.value = 1; // Reset ke halaman pertama
  loadData();
});
```

**Status:**
- ⚠️ Logic serupa tapi tidak identik (ada variasi di setiap view)
- ⚠️ Bisa dibuat composable untuk mengurangi duplikasi

**Rekomendasi:**
- Buat composable `useTableFilters.js` untuk handle filter, search, dan pagination bersama
- Atau biarkan jika variasi logic cukup signifikan

---

### 3. **Loading & Error States** 🟢 **DUPLIKASI RENDAH (Wajar)**

**Lokasi:**
- Semua views memiliki `isLoading` dan `error` state

**Status:**
- ✅ Ini adalah pattern yang wajar di Vue
- ✅ Setiap view punya loading/error state sendiri yang spesifik
- ⚠️ Bisa dibuat composable jika ingin konsistensi

**Rekomendasi:**
- Bisa dibuat composable `useAsyncState.js` untuk konsistensi, tapi tidak wajib

---

### 4. **Modal State Management** 🟢 **DUPLIKASI RENDAH (Wajar)**

**Lokasi:**
- Setiap view memiliki state management untuk modal sendiri

**Status:**
- ✅ Ini adalah pattern yang wajar
- ✅ Setiap modal punya logika berbeda
- ⚠️ Tidak perlu di-refactor kecuali ada banyak modal dengan pattern yang sama

**Rekomendasi:**
- Biarkan seperti sekarang, sudah cukup terorganisir

---

## 📊 **STATISTIK DUPLIKASI**

| Kategori | Tingkat Duplikasi | Prioritas Refactor |
|----------|-------------------|-------------------|
| Pagination Logic | 🔴 Tinggi | ⭐⭐⭐ Wajib |
| Filter & Search | 🟡 Sedang | ⭐⭐ Opsional |
| Loading/Error States | 🟢 Rendah | ⭐ Opsional |
| Modal Management | 🟢 Rendah | - Tidak perlu |

---

## 🎯 **REKOMENDASI REFACTORING**

### **PRIORITAS TINGGI** ⭐⭐⭐

1. **Gunakan `usePagination.js` di semua views**
   - Dashboard.vue
   - Massal.vue
   - Report.vue

### **PRIORITAS SEDANG** ⭐⭐

2. **Buat composable untuk filter & search** (opsional)
   - `useTableFilters.js` untuk handle filter, search, itemsPerPage bersama

### **PRIORITAS RENDAH** ⭐

3. **Buat composable untuk async state** (opsional)
   - `useAsyncState.js` untuk konsistensi loading/error handling

---

## ✅ **KESIMPULAN**

**Duplikasi yang ditemukan:**
- ✅ **1 duplikasi tinggi**: Pagination logic (ada composable tapi tidak digunakan)
- ⚠️ **1 duplikasi sedang**: Filter & search logic
- ✅ **2 duplikasi rendah**: Loading/error states dan modal management (wajar)

**Overall:**
- ✅ Kodebase sudah cukup terorganisir
- ✅ Sebagian besar logic sudah di-extract ke composables/utils
- ⚠️ Ada 1 composable yang sudah dibuat tapi tidak digunakan (`usePagination.js`)

**Action Items:**
1. Refactor views untuk menggunakan `usePagination.js`
2. (Opsional) Buat composable untuk filter/search jika ingin lebih konsisten

