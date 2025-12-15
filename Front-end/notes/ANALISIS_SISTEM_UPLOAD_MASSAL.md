# 📊 ANALISIS SISTEM UPLOAD MASSAL - MUTASI DATA

## 🎯 GAMBARAN BESAR ALUR SISTEM

Berdasarkan analisis kode dan requirement, berikut adalah temuan dan rekomendasi peningkatan:

---

## ✅ YANG SUDAH ADA (Current Implementation)

### 1. **Struktur Upload Types** ✅
- ✅ TK Massal (Mendaftar & Lanjutan)
- ✅ Koreksi Massal
- ✅ Upah Massal
- ✅ TK Nonaktif

### 2. **Validasi File Excel** ✅
- ✅ Validasi header template
- ✅ Validasi required fields
- ✅ Validasi format tanggal
- ✅ Validasi format NIK (16 digit)
- ✅ Validasi format KPJ (8-13 digit)
- ✅ Validasi format HP Indonesia
- ✅ Validasi format email
- ✅ Validasi lokasi pekerjaan (master data)
- ✅ Validasi bank (master data)
- ✅ Validasi sebab NA (master data)

### 3. **Integrasi Data** ✅
- ✅ Integrasi ke mock data
- ✅ Update summary otomatis
- ✅ Handling TK Mendaftar vs Lanjutan

---

## ⚠️ YANG PERLU DITINGKATKAN

### 🔴 **1. DATA_TK_BARU (Sheet Baru)**

#### ❌ **Masalah yang Ditemukan:**

1. **Validasi Duplicate NOMOR_IDENTITAS tidak ada di frontend**
   - **Current:** Hanya validasi format, tidak cek duplicate
   - **Required:** Cek apakah NOMOR_IDENTITAS sudah ada di database
   - **Impact:** Bisa terjadi duplicate entry

2. **Generate ID_PEGAWAI/KODE_TK tidak ada**
   - **Current:** Tidak ada generate ID otomatis
   - **Required:** Generate ID_PEGAWAI/KODE_TK setelah insert
   - **Impact:** Data tidak punya identifier unik

3. **Status awal tidak eksplisit**
   - **Current:** Status langsung AKTIF
   - **Required:** Status AKTIF tapi belum punya KPJ dan upah
   - **Impact:** Tidak jelas state data setelah insert

#### ✅ **Rekomendasi Perbaikan:**

```javascript
// Di useMassUploadValidator.js - Tambahkan validasi duplicate
async function validateDuplicateNIK(nik, existingWorkers) {
  if (!nik || nik === "-") return null;
  const duplicate = existingWorkers.find(w => w.nik === nik && w.nik !== "-");
  if (duplicate) {
    return {
      error: `NOMOR_IDENTITAS ${nik} sudah terdaftar`,
      existingWorker: duplicate
    };
  }
  return null;
}

// Di api.js - Tambahkan generate ID
function generateIdPegawai() {
  // Format: TK-YYYYMMDD-XXXX (contoh: TK-20250115-0001)
  const date = new Date();
  const dateStr = date.toISOString().slice(0,10).replace(/-/g, '');
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `TK-${dateStr}-${random}`;
}
```

---

### 🟡 **2. DATA_TK_LANJUTAN (Sheet Lanjutan)**

#### ❌ **Masalah yang Ditemukan:**

1. **Validasi relasi dengan TK Baru tidak ketat**
   - **Current:** Cari berdasarkan NO_PEGAWAI, tapi tidak validasi bahwa TK harus dari sheet BARU
   - **Required:** Harus cek NOMOR_IDENTITAS match dengan sheet BARU
   - **Impact:** Bisa update TK yang tidak seharusnya

2. **Logic update KPJ tidak jelas**
   - **Current:** Update jika tidak punya KPJ
   - **Required:** Hanya update yang belum punya KPJ (dari TK Baru)
   - **Impact:** Bisa overwrite KPJ yang sudah ada

3. **Validasi bahwa TK harus sudah ada tidak ada**
   - **Current:** Hanya cek di report workers
   - **Required:** Validasi di frontend sebelum upload
   - **Impact:** Error hanya muncul setelah upload

#### ✅ **Rekomendasi Perbaikan:**

```javascript
// Di useMassUploadValidator.js - Tambahkan validasi relasi
async function validateTkLanjutanRelation(nik, existingWorkers) {
  // Cari TK berdasarkan NOMOR_IDENTITAS
  const tkBaru = existingWorkers.find(w => 
    w.nik === nik && 
    w.nik !== "-" &&
    (!w.kpj || w.kpj === "-") // Harus belum punya KPJ
  );
  
  if (!tkBaru) {
    return {
      error: `NOMOR_IDENTITAS ${nik} tidak ditemukan di TK Baru atau sudah memiliki KPJ`,
      suggestion: "Pastikan TK sudah diupload melalui sheet BARU terlebih dahulu"
    };
  }
  
  return { valid: true, tkBaru };
}
```

---

### 🔧 **3. KOREKSI MASSAL (Sheet Update Data TK)**

#### ❌ **Masalah yang Ditemukan:**

1. **Lock kolom merah tidak ada validasi di frontend**
   - **Current:** Tidak ada validasi bahwa kolom merah tidak boleh diubah
   - **Required:** Validasi bahwa KODE, KPJ, NIK, Nama, Tgl Lahir, NPWP tidak boleh diubah
   - **Impact:** Bisa mengubah data yang seharusnya locked

2. **Validasi bahwa hanya kolom kuning yang boleh diubah tidak ada**
   - **Current:** Semua kolom bisa diupdate
   - **Required:** Hanya kolom kuning yang boleh diupdate
   - **Impact:** Bisa mengubah data yang tidak seharusnya

3. **Validasi KODE untuk mencari TK tidak ketat**
   - **Current:** Cari berdasarkan KODE (bisa KPJ, NIK, atau no)
   - **Required:** KODE harus jelas (ID_PEGAWAI atau KODE_TK)
   - **Impact:** Bisa update TK yang salah

#### ✅ **Rekomendasi Perbaikan:**

```javascript
// Di useMassUploadValidator.js - Tambahkan validasi lock fields
const LOCKED_FIELDS_KOREKSI = [
  'KODE',
  'NOMOR_PEGAWAI',
  'ID_PEGAWAI',
  'KPJ',
  'NIK',
  'NOMOR_IDENTITAS',
  'NAMA_LENGKAP',
  'TGL_LAHIR',
  'TANGGAL_LAHIR',
  'NPWP'
];

const ALLOWED_FIELDS_KOREKSI = [
  'ALAMAT_LENGKAP_DOMISILI',
  'HANDPHONE',
  'EMAIL',
  'LOKASI_PEKERJAAN',
  'NAMA_BANK',
  'KODE_BANK',
  'NOMOR_REKENING',
  'NAMA_REKENING'
];

function validateKoreksiFields(row, normalizedHeader) {
  const errors = [];
  
  // Cek apakah ada field locked yang diubah
  LOCKED_FIELDS_KOREKSI.forEach(field => {
    if (normalizedHeader.includes(field) && row[field]) {
      // Field ini hanya untuk referensi, tidak boleh diubah
      // Tapi tidak error, hanya warning
    }
  });
  
  // Pastikan hanya allowed fields yang diisi
  const filledFields = Object.keys(row).filter(key => 
    row[key] && String(row[key]).trim() !== ""
  );
  
  const invalidFields = filledFields.filter(field => 
    !ALLOWED_FIELDS_KOREKSI.includes(field) && 
    !LOCKED_FIELDS_KOREKSI.includes(field)
  );
  
  if (invalidFields.length > 0) {
    errors.push(`Kolom berikut tidak boleh diubah: ${invalidFields.join(', ')}`);
  }
  
  return errors;
}
```

---

### 💰 **4. DATA_UPAH (Sheet Upah)**

#### ❌ **Masalah yang Ditemukan:**

1. **Validasi bahwa TK harus sudah ada tidak ada**
   - **Current:** Hanya update jika ditemukan
   - **Required:** Validasi di frontend bahwa TK harus AKTIF dan sudah ada
   - **Impact:** Error hanya muncul setelah upload

2. **Validasi bahwa hanya UPAH dan RAPEL yang boleh diubah tidak ada**
   - **Current:** Semua kolom bisa diupdate
   - **Required:** Hanya UPAH dan RAPEL yang boleh diubah
   - **Impact:** Bisa mengubah data referensi

3. **Validasi BLTH format tidak konsisten**
   - **Current:** Menerima MM/YYYY, YYYY-MM, YYYYMM
   - **Required:** Format harus jelas dan konsisten
   - **Impact:** Bisa terjadi kesalahan periode

#### ✅ **Rekomendasi Perbaikan:**

```javascript
// Di useMassUploadValidator.js - Tambahkan validasi upah
async function validateUpahWorker(kpj, nik, existingWorkers) {
  // Cari worker berdasarkan KPJ atau NIK
  const worker = existingWorkers.find(w => 
    (kpj && w.kpj === kpj && w.kpj !== "-") ||
    (nik && w.nik === nik && w.nik !== "-")
  );
  
  if (!worker) {
    return {
      error: `Tenaga kerja dengan KPJ ${kpj || 'N/A'} atau NIK ${nik || 'N/A'} tidak ditemukan`,
      suggestion: "Pastikan TK sudah terdaftar dan aktif"
    };
  }
  
  if (worker.status !== "AKTIF") {
    return {
      error: `Tenaga kerja dengan KPJ ${kpj} tidak aktif`,
      suggestion: "Hanya TK dengan status AKTIF yang bisa diupdate upahnya"
    };
  }
  
  return { valid: true, worker };
}

// Validasi bahwa hanya UPAH dan RAPEL yang boleh diubah
const ALLOWED_FIELDS_UPAH = ['UPAH', 'RAPEL'];
const REFERENCE_FIELDS_UPAH = ['NIK', 'KPJ', 'KODE_TK', 'NAMA_LENGKAP', 'TGL_LAHIR', 'BLTH', 'NPP'];

function validateUpahFields(row, normalizedHeader) {
  const errors = [];
  
  // Pastikan reference fields tidak diubah (hanya untuk pencarian)
  // Tidak perlu error, tapi pastikan tidak diupdate
}
```

---

### 🔴 **5. DATA_TK_NA (Sheet Nonaktif)**

#### ❌ **Masalah yang Ditemukan:**

1. **Validasi KPJ harus aktif tidak ada**
   - **Current:** Hanya cek apakah KPJ ada
   - **Required:** Validasi bahwa KPJ harus AKTIF sebelum dinonaktifkan
   - **Impact:** Bisa nonaktifkan yang sudah nonaktif

2. **Logging riwayat nonaktif tidak ada**
   - **Current:** Hanya update status
   - **Required:** Simpan riwayat nonaktif (SEBAB_NA, TGL_KEJADIAN, dll)
   - **Impact:** Tidak ada audit trail

3. **Validasi SEBAB_NA harus ada di master tidak ada di frontend**
   - **Current:** Validasi format ada, tapi tidak cek di master
   - **Required:** Validasi bahwa SEBAB_NA harus ada di master sebab
   - **Impact:** Bisa menggunakan sebab yang tidak valid

#### ✅ **Rekomendasi Perbaikan:**

```javascript
// Di useMassUploadValidator.js - Tambahkan validasi nonaktif
async function validateTkNonaktif(kpj, existingWorkers, sebabMap) {
  // Cari worker berdasarkan KPJ
  const worker = existingWorkers.find(w => 
    w.kpj === kpj && w.kpj !== "-"
  );
  
  if (!worker) {
    return {
      error: `Tenaga kerja dengan KPJ ${kpj} tidak ditemukan`,
      suggestion: "Pastikan KPJ sudah terdaftar"
    };
  }
  
  if (worker.status !== "AKTIF") {
    return {
      error: `Tenaga kerja dengan KPJ ${kpj} sudah nonaktif`,
      suggestion: "Hanya TK dengan status AKTIF yang bisa dinonaktifkan"
    };
  }
  
  return { valid: true, worker };
}

// Di api.js - Tambahkan logging riwayat
async function logNonaktifHistory(worker, sebabNa, tglKejadian, keterangan) {
  const historyEntry = {
    kpj: worker.kpj,
    nama: worker.nama,
    sebabNa: sebabNa,
    tglKejadian: tglKejadian,
    keterangan: keterangan || "",
    tanggalNonaktif: new Date().toISOString().split('T')[0],
    statusSebelumnya: worker.status
  };
  
  // Simpan ke tabel tenaga_kerja_nonaktif
  // (di mock data, bisa simpan ke array terpisah)
}
```

---

## 🏗️ **STRUKTUR DATABASE YANG IDEAL**

Berdasarkan requirement, berikut struktur tabel yang seharusnya:

### 1. **tenaga_kerja**
```sql
- id_pegawai (PK, auto-increment)
- kode_tk (UNIQUE, generated)
- nomor_identitas (NIK, UNIQUE)
- nama_lengkap
- tgl_lahir
- jenis_identitas
- surat_menyurat_ke
- status_pegawai
- kode_negara
- lokasi_pekerjaan_id (FK)
- tgl_awal_bekerja
- tgl_akhir_kontrak
- status (AKTIF/NONAKTIF)
- created_at
- updated_at
```

### 2. **tenaga_kerja_kpj**
```sql
- id (PK)
- tenaga_kerja_id (FK)
- kpj (UNIQUE)
- tgl_kepesertaan
- created_at
- updated_at
```

### 3. **tenaga_kerja_upah**
```sql
- id (PK)
- tenaga_kerja_id (FK)
- upah
- rapel
- blth (bulan-tahun)
- npp
- created_at
- updated_at
```

### 4. **tenaga_kerja_nonaktif**
```sql
- id (PK)
- tenaga_kerja_id (FK)
- sebab_na_id (FK)
- tgl_kejadian
- keterangan
- tanggal_nonaktif
- created_at
```

### 5. **tenaga_kerja_koreksi** (untuk audit)
```sql
- id (PK)
- tenaga_kerja_id (FK)
- field_name
- old_value
- new_value
- updated_by
- updated_at
```

---

## 🔄 **ALUR YANG HARUS DIPERBAIKI**

### **STEP 1: TK Baru**
```
✅ Upload file
✅ Validasi format
❌ Validasi duplicate NOMOR_IDENTITAS → PERLU DITAMBAHKAN
✅ Insert ke database
❌ Generate ID_PEGAWAI/KODE_TK → PERLU DITAMBAHKAN
✅ Status = AKTIF, KPJ = null, Upah = null
```

### **STEP 2: TK Lanjutan**
```
✅ Upload file
✅ Validasi format
❌ Validasi relasi dengan TK Baru → PERLU DIPERBAIKI
❌ Validasi TK belum punya KPJ → PERLU DITAMBAHKAN
✅ Update KPJ, upah, lokasi
✅ Status tetap AKTIF
```

### **STEP 3: Koreksi Massal**
```
✅ Upload file
✅ Validasi format
❌ Validasi lock kolom merah → PERLU DITAMBAHKAN
❌ Validasi hanya kolom kuning yang boleh diubah → PERLU DITAMBAHKAN
✅ Update field yang diizinkan
✅ Status tidak berubah
```

### **STEP 4: Data Upah**
```
✅ Upload file
✅ Validasi format
❌ Validasi TK harus AKTIF → PERLU DITAMBAHKAN
❌ Validasi hanya UPAH dan RAPEL yang boleh diubah → PERLU DITAMBAHKAN
✅ Update upah dan rapel
✅ Status tidak berubah
```

### **STEP 5: TK Nonaktif**
```
✅ Upload file
✅ Validasi format
❌ Validasi KPJ harus AKTIF → PERLU DITAMBAHKAN
❌ Validasi SEBAB_NA di master → PERLU DIPERBAIKI
✅ Update status = NONAKTIF
❌ Logging riwayat nonaktif → PERLU DITAMBAHKAN
```

---

## 📋 **PRIORITAS PERBAIKAN**

### **🔴 HIGH PRIORITY (Critical)**
1. ✅ Validasi duplicate NOMOR_IDENTITAS untuk TK Baru
2. ✅ Generate ID_PEGAWAI/KODE_TK otomatis
3. ✅ Validasi relasi TK Lanjutan dengan TK Baru
4. ✅ Validasi lock kolom merah di Koreksi Massal
5. ✅ Validasi KPJ harus AKTIF untuk TK Nonaktif

### **🟡 MEDIUM PRIORITY (Important)**
6. ✅ Validasi hanya kolom kuning yang boleh diubah (Koreksi)
7. ✅ Validasi hanya UPAH dan RAPEL yang boleh diubah (Upah)
8. ✅ Logging riwayat nonaktif
9. ✅ Validasi SEBAB_NA harus ada di master

### **🟢 LOW PRIORITY (Nice to Have)**
10. ✅ Audit trail untuk semua perubahan
11. ✅ Preview data sebelum upload
12. ✅ Rollback mechanism
13. ✅ Batch processing untuk file besar

---

## 📝 **KESIMPULAN**

### **Yang Sudah Bagus:**
- ✅ Struktur upload types sudah lengkap
- ✅ Validasi format file sudah baik
- ✅ Integrasi data sudah berjalan
- ✅ Handling berbagai jenis upload sudah ada

### **Yang Perlu Ditingkatkan:**
- ❌ Validasi business logic (duplicate, relasi, status)
- ❌ Validasi field locking (kolom merah/kuning)
- ❌ Generate identifier otomatis
- ❌ Audit trail dan logging
- ❌ Validasi relasi antar sheet

### **Rekomendasi Implementasi:**
1. **Tambah validasi business logic di frontend** sebelum upload
2. **Tambah validasi field locking** untuk Koreksi Massal
3. **Implementasi generate ID** untuk TK Baru
4. **Tambah logging dan audit trail** untuk semua perubahan
5. **Perbaiki validasi relasi** antar sheet upload

---

**Dokumen ini dibuat untuk brainstorming dan dapat dijadikan referensi untuk pengembangan selanjutnya.**


