# 🔍 CARA CEK ERROR VALIDASI - PENJELASAN LENGKAP

## 📍 **Dimana Validasi Dilakukan?**

### **1. Saat Upload File (Frontend)**
**File:** `src/composables/useMassUploadValidator.js`

Validasi dilakukan **SEBELUM** upload ke server:
- ✅ Parse file Excel
- ✅ Validasi header template
- ✅ Validasi required fields
- ✅ Validasi format data
- ✅ Validasi master data (lokasi, bank, sebab)
- ✅ Validasi business logic (duplicate, relasi, status)

### **2. Tampilan Hasil Validasi**
**File:** `src/views/Massal.vue`

Setelah upload, akan muncul section **"Hasil Validasi"** yang menampilkan:
- ✅ Total baris
- ✅ Jumlah valid
- ✅ Jumlah tidak valid
- ✅ **Detail error per baris** ← INI YANG PENTING!

---

## 🔍 **Cara Melihat Detail Error**

### **1. Setelah Upload File**

Setelah klik tombol **"UPLOAD"**, akan muncul:

#### **A. Modal Warning (jika ada error)**
```
⚠️ Ditemukan 3 baris yang perlu diperbaiki sebelum upload.
   Silakan lihat detail error di bawah.
```

#### **B. Section "Hasil Validasi" (di bawah form upload)**

**Summary Cards:**
```
┌─────────────┬─────────────┬─────────────┐
│ Total Baris │    Valid    │ Tidak Valid │
│     10      │      7      │      3      │
└─────────────┴─────────────┴─────────────┘
```

**Detail Error Per Baris:**
```
┌─────────────────────────────────────────────┐
│ Detail Baris yang Tidak Valid:              │
├─────────────────────────────────────────────┤
│ [5]  Baris 5 - Error:                       │
│      • SEBAB_NA "A99" tidak ditemukan...     │
│      • KPJ wajib diisi                      │
├─────────────────────────────────────────────┤
│ [8]  Baris 8 - Error:                       │
│      • TGL_LAHIR harus berformat...         │
├─────────────────────────────────────────────┤
│ [12] Baris 12 - Error:                      │
│      • Tenaga kerja dengan KPJ 123...       │
│        sudah nonaktif                        │
└─────────────────────────────────────────────┘
```

---

## 📋 **Format Error Message**

### **Struktur Error:**
```javascript
{
  rowNumber: 5,  // Nomor baris di Excel (baris 5 = row 5)
  errors: [
    "SEBAB_NA 'A99' tidak ditemukan pada referensi sebab nonaktif",
    "KPJ wajib diisi"
  ]
}
```

### **Contoh Error Messages:**

#### **1. SEBAB_NA tidak ditemukan**
```
Error: SEBAB_NA "A99" tidak ditemukan pada referensi sebab nonaktif. 
       Pastikan menggunakan kode (contoh: A4) atau nama sebab yang valid.
```
**Solusi:**
- Gunakan kode yang valid: `A1`, `A2`, `A3`, `A4`, dll
- Atau nama yang valid: `Usia Pensiun`, `Mengundurkan Diri`, dll
- Cek master data di `public/mock-api/sebab.json`

#### **2. KPJ wajib diisi**
```
Error: KPJ wajib diisi
```
**Solusi:**
- Pastikan kolom KPJ terisi
- Tidak boleh kosong atau "-"

#### **3. Format tanggal salah**
```
Error: TGL_LAHIR harus berformat dd-mm-yyyy atau yyyy-mm-dd
```
**Solusi:**
- Gunakan format: `1995-01-12` atau `12-01-1995`
- Pastikan format Excel adalah text, bukan date

#### **4. KPJ sudah nonaktif**
```
Error: Tenaga kerja dengan KPJ 12345678 sudah nonaktif. 
       Hanya TK dengan status AKTIF yang bisa dinonaktifkan.
```
**Solusi:**
- Cek status worker di sistem
- Pastikan KPJ yang akan dinonaktifkan masih AKTIF

#### **5. Duplicate dalam file**
```
Error: NOMOR_IDENTITAS 3201234567890123 duplikat dalam file yang sama (baris 3)
```
**Solusi:**
- Hapus baris duplikat
- Pastikan setiap NIK/KPJ hanya muncul sekali

---

## 🔧 **Dimana Validasi Dilakukan?**

### **File: `src/composables/useMassUploadValidator.js`**

#### **1. Validasi Header Template** (baris 106-156)
```javascript
// Cek apakah semua header template ada
const missingHeaders = templateHeaders.filter((header) => {
  // Cek header ada atau tidak
});
```

#### **2. Validasi Required Fields** (baris 293-361)
```javascript
requiredFields.forEach((field) => {
  if (!value) {
    errors.push(`${field} wajib diisi`);
  }
});
```

#### **3. Validasi Format** (baris 336-343)
```javascript
// Validasi format KPJ (8-13 digit)
if (field === "KPJ" && value) {
  const kpjPattern = /^\d{8,13}$/;
  if (!kpjPattern.test(value)) {
    errors.push(`${field} harus berupa 8-13 digit angka`);
  }
}
```

#### **4. Validasi Master Data** (baris 485-506)
```javascript
// Validasi SEBAB_NA
const sebab = getSebabByKey ? getSebabByKey(normalizedSebabValue) : null;
if (!sebab) {
  errors.push(`SEBAB_NA "${sebabValue}" tidak ditemukan...`);
}
```

#### **5. Validasi Business Logic** (baris 727-753)
```javascript
// Validasi TK Nonaktif
if (isTkNonaktifMode) {
  const existingWorker = getExistingWorkerByKpj(kpj);
  if (!existingWorker) {
    // Warning, tidak error
  } else if (existingWorker.status !== "AKTIF") {
    errors.push(`Tenaga kerja dengan KPJ ${kpj} sudah nonaktif...`);
  }
}
```

---

## 📊 **Alur Validasi**

```
1. User Upload File Excel
   ↓
2. Parse File (XLSX)
   ↓
3. Validasi Header Template
   ↓ (jika header tidak sesuai → ERROR)
4. Validasi Required Fields
   ↓ (jika required field kosong → ERROR)
5. Validasi Format Data
   ↓ (jika format salah → ERROR)
6. Validasi Master Data
   ↓ (jika tidak ada di master → ERROR)
7. Validasi Business Logic
   ↓ (jika duplicate/relasi salah → ERROR)
8. Tampilkan Hasil Validasi
   ↓
9. Jika semua valid → Upload ke Server
   Jika ada error → Tampilkan detail error
```

---

## 🎯 **Cara Debug Error**

### **1. Lihat di Browser Console (F12)**
```javascript
// Buka Console tab
// Lihat error message detail
console.log("Invalid rows:", invalidRows);
```

### **2. Lihat di UI (Section Hasil Validasi)**
- Scroll ke bawah setelah upload
- Lihat section **"Hasil Validasi"**
- Baca detail error per baris

### **3. Cek Data Excel**
- Buka file Excel
- Cek baris yang disebutkan di error
- Perbaiki sesuai error message

### **4. Cek Master Data**
```javascript
// Di browser console
fetch('/mock-api/sebab.json')
  .then(r => r.json())
  .then(data => console.log('Master SEBAB_NA:', data));
```

---

## ✅ **Checklist Perbaikan Error**

### **Untuk TK Nonaktif:**

- [ ] **KPJ terisi?** → Pastikan kolom KPJ tidak kosong
- [ ] **NAMA_LENGKAP terisi?** → Pastikan kolom nama tidak kosong
- [ ] **TGL_LAHIR format benar?** → Format: `yyyy-mm-dd` atau `dd-mm-yyyy`
- [ ] **SEBAB_NA valid?** → Gunakan kode (A4) atau nama yang ada di master
- [ ] **TGL_KEJADIAN format benar?** → Format: `yyyy-mm-dd` atau `dd-mm-yyyy`
- [ ] **Tidak ada duplicate?** → Pastikan KPJ tidak duplikat dalam file
- [ ] **KPJ masih AKTIF?** → Pastikan worker belum dinonaktifkan sebelumnya

---

## 📝 **Contoh Error dan Solusi**

### **Error 1: SEBAB_NA tidak ditemukan**
```
Baris 5 - Error:
• SEBAB_NA "A99" tidak ditemukan pada referensi sebab nonaktif
```

**Solusi:**
1. Cek master data: `public/mock-api/sebab.json`
2. Gunakan kode yang valid: `A1`, `A2`, `A3`, `A4`, `A5`, `A6`, `A7`, `A8`, `A9`, `A10`
3. Atau gunakan nama: `Usia Pensiun`, `Mengundurkan Diri`, dll

### **Error 2: Format tanggal salah**
```
Baris 8 - Error:
• TGL_LAHIR harus berformat dd-mm-yyyy atau yyyy-mm-dd
```

**Solusi:**
1. Ubah format di Excel menjadi text
2. Gunakan format: `1995-01-12` atau `12-01-1995`
3. Jangan gunakan format Excel date (bisa jadi angka)

### **Error 3: KPJ sudah nonaktif**
```
Baris 12 - Error:
• Tenaga kerja dengan KPJ 12345678 sudah nonaktif
```

**Solusi:**
1. Cek status worker di sistem
2. Hapus baris tersebut dari file upload
3. Atau pastikan KPJ yang benar masih AKTIF

---

**Sekarang Anda bisa melihat detail error per baris di UI!** 🎉

