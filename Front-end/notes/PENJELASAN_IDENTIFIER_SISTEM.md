# 📋 PENJELASAN IDENTIFIER SISTEM - MUTASI DATA

## ❓ **NOMOR_IDENTITAS vs ID_PEGAWAI - Apakah Sama?**

**Jawaban: TIDAK SAMA!** Berikut penjelasan lengkapnya:

---

## 🔑 **IDENTIFIER DALAM SISTEM**

### 1. **NOMOR_IDENTITAS** (NIK)
- **Apa itu?** Nomor Induk Kependudukan dari KTP
- **Sumber:** Input dari user (data dari KTP)
- **Format:** 16 digit angka (contoh: `3201234567890123`)
- **Kapan digunakan?**
  - ✅ Di template **TK Baru** (required field)
  - ✅ Untuk validasi duplicate
  - ✅ Untuk relasi antara TK Baru dan TK Lanjutan
- **Bisa diubah?** ❌ Tidak bisa diubah (data resmi dari KTP)
- **Contoh di kode:**
  ```javascript
  // Di uploadConfig.js - TK Barux`
  "NOMOR_IDENTITAS",  // Required field
  
  // Di validator
  const nik = row.NOMOR_IDENTITAS || row.NIK;
  ```

### 2. **ID_PEGAWAI**
- **Apa itu?** Identifier unik internal sistem
- **Sumber:** Di-generate otomatis oleh sistem
- **Format:** `TK-YYYYMMDD-XXXX` (contoh: `TK-20250115-0001`)
- **Kapan digunakan?**
  - ✅ Di-generate saat insert **TK Baru**
  - ✅ Untuk pencarian di **Koreksi Massal** (kolom KODE)
  - ✅ Identifier unik di database
- **Bisa diubah?** ❌ Tidak bisa diubah (auto-generated)
- **Contoh di kode:**
  ```javascript
  // Di api.js - Generate ID
  function generateIdPegawai() {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `TK-${dateStr}-${random}`;
  }
  
  // Saat insert TK Baru
  const idPegawai = generateIdPegawai(); // TK-20250115-0001
  ```

### 3. **NO_PEGAWAI**
- **Apa itu?** Nomor pegawai (bisa dari input atau sistem)
- **Sumber:** Bisa input user atau dari sistem
- **Format:** Bervariasi (bisa angka, string, dll)
- **Kapan digunakan?**
  - ✅ Di template **TK Lanjutan** (opsional)
  - ✅ Untuk pencarian worker
  - ✅ Bisa sama dengan ID_PEGAWAI atau berbeda
- **Bisa diubah?** ✅ Bisa diubah (jika dari input user)
- **Contoh di kode:**
  ```javascript
  // Di uploadConfig.js - TK Lanjutan
  "NO_PEGAWAI",  // Ada di template tapi tidak required
  
  // Alias mapping
  "NO_PEGAWAI": "ID_PEGAWAI",  // Bisa digunakan sebagai alias
  ```

### 4. **KODE_TK**
- **Apa itu?** Kode tenaga kerja (alternatif identifier)
- **Sumber:** Di-generate otomatis oleh sistem
- **Format:** `TK-XXXXX` (contoh: `TK-00001`)
- **Kapan digunakan?**
  - ✅ Di-generate saat insert **TK Baru**
  - ✅ Untuk pencarian di **Upah Massal** (kolom KODE_TK)
  - ✅ Identifier alternatif
- **Bisa diubah?** ❌ Tidak bisa diubah (auto-generated)
- **Contoh di kode:**
  ```javascript
  // Di api.js - Generate KODE_TK
  function generateKodeTk(sequence = null) {
    if (sequence !== null) {
      return `TK-${String(sequence).padStart(5, '0')}`;
    }
    return `TK-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
  }
  ```

### 5. **KPJ** (NOMOR_IDENTITAS_KPJ)
- **Apa itu?** Nomor Kartu Peserta Jaminan (BPJS Ketenagakerjaan)
- **Sumber:** Input dari user atau diisi di TK Lanjutan
- **Format:** 8-13 digit angka (contoh: `1234567890123`)
- **Kapan digunakan?**
  - ✅ Di template **TK Lanjutan** (required)
  - ✅ Untuk pencarian di **Upah Massal** dan **TK Nonaktif**
  - ✅ Untuk relasi dengan data BPJS
- **Bisa diubah?** ⚠️ Hanya bisa diisi sekali (di TK Lanjutan)
- **Contoh di kode:**
  ```javascript
  // Di uploadConfig.js - TK Lanjutan
  "NOMOR_IDENTITAS_KPJ",  // Required field
  
  // Alias mapping
  "KPJ": "NOMOR_IDENTITAS_KPJ",  // KPJ = alias untuk NOMOR_IDENTITAS_KPJ
  ```

---

## 📊 **PERBANDINGAN IDENTIFIER**

| Identifier | Sumber | Format | Bisa Diubah? | Digunakan Untuk |
|------------|--------|--------|--------------|-----------------|
| **NOMOR_IDENTITAS** | Input user (KTP) | 16 digit angka | ❌ Tidak | Validasi duplicate, relasi TK |
| **ID_PEGAWAI** | Auto-generate sistem | TK-YYYYMMDD-XXXX | ❌ Tidak | Identifier unik, pencarian |
| **NO_PEGAWAI** | Input user atau sistem | Bervariasi | ✅ Bisa | Pencarian, relasi |
| **KODE_TK** | Auto-generate sistem | TK-XXXXX | ❌ Tidak | Identifier alternatif |
| **KPJ** | Input user (BPJS) | 8-13 digit angka | ⚠️ Sekali | Pencarian, relasi BPJS |

---

## 🔍 **CARA MENGETAHUI PERBEDAANNYA**

### **1. Dari Template Excel**

#### **Template TK Baru:**
```excel
NOMOR_IDENTITAS  |  ID_PEGAWAI  |  NO_PEGAWAI
3201234567890123 |  (kosong)    |  (kosong)
```
- ✅ **NOMOR_IDENTITAS** = Diisi user (NIK dari KTP)
- ❌ **ID_PEGAWAI** = Tidak ada di template (auto-generate)
- ❌ **NO_PEGAWAI** = Opsional (bisa diisi atau tidak)

#### **Template TK Lanjutan:**
```excel
NOMOR_IDENTITAS_KPJ  |  NO_PEGAWAI
1234567890123        |  TK-00001
```
- ✅ **NOMOR_IDENTITAS_KPJ** = KPJ (diisi user)
- ✅ **NO_PEGAWAI** = Bisa diisi untuk referensi

#### **Template Koreksi Massal:**
```excel
KODE  |  ID_PEGAWAI  |  NOMOR_PEGAWAI
TK-20250115-0001 |  TK-20250115-0001  |  TK-00001
```
- ✅ **KODE** = ID_PEGAWAI atau KODE_TK (untuk pencarian)
- ✅ **ID_PEGAWAI** = Identifier sistem (kolom merah - tidak boleh diubah)
- ✅ **NOMOR_PEGAWAI** = Referensi (kolom merah - tidak boleh diubah)

### **2. Dari Kode**

#### **Di `uploadConfig.js`:**
```javascript
// TK Baru - Required fields
export const requiredFieldsMendaftar = [
  "NOMOR_IDENTITAS",  // ← NIK dari KTP (required)
  // ID_PEGAWAI tidak ada karena auto-generate
];

// TK Lanjutan
export const templateHeadersLanjutan = [
  "NOMOR_IDENTITAS_KPJ",  // ← KPJ (required)
  "NO_PEGAWAI",           // ← Opsional
];

// Koreksi Massal
export const templateHeadersKoreksi = [
  "KODE",           // ← Untuk pencarian
  "ID_PEGAWAI",     // ← Identifier sistem (kolom merah)
  "NOMOR_PEGAWAI",  // ← Referensi (kolom merah)
];
```

#### **Di `api.js`:**
```javascript
// Generate ID_PEGAWAI saat insert TK Baru
const idPegawai = generateIdPegawai(); // TK-20250115-0001
const kodeTk = generateKodeTk(report.workers.data.length + 1); // TK-00001

const newWorker = {
  idPegawai: idPegawai,      // ← Auto-generate
  kodeTk: kodeTk,            // ← Auto-generate
  nik: nikValue,             // ← Dari input (NOMOR_IDENTITAS)
  noPegawai: noPegawaiValue, // ← Dari input (jika ada)
  // ...
};
```

#### **Di `useMassUploadValidator.js`:**
```javascript
// Alias mapping - menunjukkan bahwa NO_PEGAWAI dan ID_PEGAWAI bisa saling menggantikan
const columnAliases = {
  "NO_PEGAWAI": "ID_PEGAWAI",
  "ID_PEGAWAI": "NO_PEGAWAI"
};

// Validasi TK Baru - cek duplicate berdasarkan NOMOR_IDENTITAS (NIK)
if (isTkBaruMode) {
  const nik = normalizedRow.NOMOR_IDENTITAS || normalizedRow.NIK;
  if (getExistingWorkerByNik) {
    const existingWorker = getExistingWorkerByNik(nik);
    if (existingWorker) {
      errors.push(`NOMOR_IDENTITAS ${nik} sudah terdaftar`);
    }
  }
}
```

---

## 🎯 **KESIMPULAN**

### **NOMOR_IDENTITAS ≠ ID_PEGAWAI**

1. **NOMOR_IDENTITAS (NIK)**
   - ✅ Data dari KTP (input user)
   - ✅ 16 digit angka
   - ✅ Untuk validasi duplicate dan relasi
   - ❌ Tidak bisa diubah

2. **ID_PEGAWAI**
   - ✅ Di-generate otomatis oleh sistem
   - ✅ Format: `TK-YYYYMMDD-XXXX`
   - ✅ Identifier unik sistem
   - ❌ Tidak bisa diubah

3. **Hubungan:**
   - Satu **NOMOR_IDENTITAS** (NIK) bisa punya satu **ID_PEGAWAI**
   - **ID_PEGAWAI** di-generate saat insert TK Baru
   - **NOMOR_IDENTITAS** digunakan untuk mencari worker yang sudah ada
   - **ID_PEGAWAI** digunakan untuk update data (Koreksi Massal)

---

## 📝 **CONTOH ALUR**

### **Scenario: Upload TK Baru**

1. **User upload file dengan:**
   ```
   NOMOR_IDENTITAS: 3201234567890123
   NAMA_LENGKAP: Ahmad Wijaya
   ```

2. **Sistem validasi:**
   - ✅ Cek apakah NOMOR_IDENTITAS sudah ada → Tidak ada
   - ✅ Format valid (16 digit)

3. **Sistem generate:**
   ```javascript
   ID_PEGAWAI: "TK-20250115-0001"  // Auto-generate
   KODE_TK: "TK-00001"              // Auto-generate
   ```

4. **Data yang tersimpan:**
   ```javascript
   {
     idPegawai: "TK-20250115-0001",      // ← Auto-generate
     kodeTk: "TK-00001",                 // ← Auto-generate
     nik: "3201234567890123",            // ← Dari input (NOMOR_IDENTITAS)
     nama: "Ahmad Wijaya",
     kpj: "-",                           // ← Belum punya KPJ
     status: "AKTIF"
   }
   ```

### **Scenario: Upload TK Lanjutan**

1. **User upload file dengan:**
   ```
   NOMOR_IDENTITAS: 3201234567890123  // ← Harus match dengan TK Baru
   NOMOR_IDENTITAS_KPJ: 1234567890123 // ← KPJ baru
   ```

2. **Sistem validasi:**
   - ✅ Cek apakah NOMOR_IDENTITAS ada di TK Baru → Ada
   - ✅ Cek apakah sudah punya KPJ → Belum punya

3. **Sistem update:**
   ```javascript
   // Update worker yang sudah ada
   {
     idPegawai: "TK-20250115-0001",      // ← Tidak berubah
     kodeTk: "TK-00001",                 // ← Tidak berubah
     nik: "3201234567890123",            // ← Tidak berubah
     kpj: "1234567890123",               // ← Diupdate (dari "-" menjadi KPJ)
     status: "AKTIF"
   }
   ```

### **Scenario: Koreksi Massal**

1. **User upload file dengan:**
   ```
   KODE: TK-20250115-0001  // ← ID_PEGAWAI untuk pencarian
   EMAIL: ahmad@email.com   // ← Kolom kuning (boleh diubah)
   ```

2. **Sistem validasi:**
   - ✅ Cek apakah KODE (ID_PEGAWAI) ada → Ada
   - ✅ Cek apakah EMAIL adalah kolom yang boleh diubah → Ya

3. **Sistem update:**
   ```javascript
   // Update hanya kolom yang diizinkan
   {
     idPegawai: "TK-20250115-0001",      // ← Tidak berubah (kolom merah)
     nik: "3201234567890123",            // ← Tidak berubah (kolom merah)
     email: "ahmad@email.com",           // ← Diupdate (kolom kuning)
     // ...
   }
   ```

---

## 🔧 **CARA CEK DI KODE**

### **1. Cek di Template Config**
```bash
# File: src/config/uploadConfig.js
# Lihat kolom yang ada di setiap template
```

### **2. Cek di Validator**
```bash
# File: src/composables/useMassUploadValidator.js
# Lihat bagaimana NOMOR_IDENTITAS dan ID_PEGAWAI digunakan
```

### **3. Cek di API**
```bash
# File: src/services/api.js
# Lihat bagaimana ID_PEGAWAI di-generate dan NOMOR_IDENTITAS digunakan
```

### **4. Cek di Database/Data**
```javascript
// Di browser console atau di kode
const worker = {
  idPegawai: "TK-20250115-0001",  // ← ID_PEGAWAI (auto-generate)
  nik: "3201234567890123",         // ← NOMOR_IDENTITAS (dari input)
  kpj: "1234567890123",            // ← KPJ (dari input)
  // ...
};
```

---

**Dokumen ini menjelaskan perbedaan dan cara mengetahui identifier dalam sistem.**

