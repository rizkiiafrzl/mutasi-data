# 🔍 VALIDASI TK NONAKTIF - PENJELASAN LENGKAP

## 📋 **Validasi yang Dilakukan untuk TK Nonaktif**

### **1. Validasi Header Template** ✅
- Cek apakah kolom sesuai template:
  - `KPJ` ✅
  - `NAMA_LENGKAP` ✅
  - `TGL_LAHIR` ✅
  - `SEBAB_NA` ✅
  - `TGL_KEJADIAN` ✅
  - `KETERANGAN` (opsional)

### **2. Validasi Required Fields** ✅
- Kolom wajib diisi:
  - `KPJ` - Wajib
  - `NAMA_LENGKAP` - Wajib
  - `TGL_LAHIR` - Wajib
  - `SEBAB_NA` - Wajib
  - `TGL_KEJADIAN` - Wajib
  - `KETERANGAN` - Opsional

### **3. Validasi Format Tanggal** ✅
- `TGL_LAHIR` harus format: `dd-mm-yyyy` atau `yyyy-mm-dd`
- `TGL_KEJADIAN` harus format: `dd-mm-yyyy` atau `yyyy-mm-dd`

### **4. Validasi SEBAB_NA** ✅
- **Menerima:** Kode (contoh: `A4`) atau Nama (contoh: `Usia Pensiun`)
- **Cek di master data:** Harus ada di `sebab.json`
- **Error jika:** SEBAB_NA tidak ditemukan di master data

**Master Data SEBAB_NA:**
```json
[
  { "kode_na": "A4", "sebab_na": "Usia Pensiun" },
  { "kode_na": "A1", "sebab_na": "Mengundurkan Diri" },
  // ... dll
]
```

**Contoh yang Valid:**
- `A4` ✅ (kode)
- `Usia Pensiun` ✅ (nama)
- `USIA PENSIUN` ✅ (case insensitive)

### **5. Validasi KPJ** ⚠️ (Fleksibel)
- **Jika KPJ ditemukan:**
  - ✅ Status AKTIF → OK, bisa dinonaktifkan
  - ❌ Status NONAKTIF → Error (tidak bisa nonaktifkan yang sudah nonaktif)
  
- **Jika KPJ tidak ditemukan:**
  - ⚠️ Warning di console (tidak error)
  - ✅ Tetap diproses (mungkin data belum ada di periode ini)

---

## 🔧 **Sumber Validasi**

### **File: `src/composables/useMassUploadValidator.js`**

```javascript
// Validasi SEBAB_NA (baris 485-506)
const sebabValue = row.SEBAB_NA ? String(row.SEBAB_NA).trim() : "";
if (sebabValue) {
  const normalizedSebabValue = normalizeString(sebabValue);
  const sebab = getSebabByKey ? getSebabByKey(normalizedSebabValue) : null;
  if (!sebab) {
    errors.push(`SEBAB_NA "${sebabValue}" tidak ditemukan...`);
  }
}

// Validasi KPJ (baris 727-753)
if (isTkNonaktifMode) {
  const kpj = normalizedRow.KPJ || normalizedRow.NOMOR_IDENTITAS_KPJ;
  if (kpj && kpj !== "-") {
    const existingWorker = getExistingWorkerByKpj(kpj);
    if (!existingWorker) {
      // Warning, tidak error
      console.warn(`Tenaga kerja dengan KPJ ${kpj} tidak ditemukan...`);
    } else if (existingWorker.status !== "AKTIF") {
      errors.push(`Tenaga kerja dengan KPJ ${kpj} sudah nonaktif...`);
    }
  }
}
```

### **File: `src/config/uploadConfig.js`**

```javascript
// Template headers untuk TK Nonaktif
export const templateHeadersNonaktif = [
  "KPJ",
  "NAMA_LENGKAP",
  "TGL_LAHIR",
  "SEBAB_NA",
  "TGL_KEJADIAN",
  "KETERANGAN",
];

// Required fields
export const requiredFieldsNonaktif = [
  "KPJ",
  "NAMA_LENGKAP",
  "TGL_LAHIR",
  "SEBAB_NA",
  "TGL_KEJADIAN",
];
```

### **File: `src/services/sebabService.js`**

```javascript
// Load master data SEBAB_NA
export async function fetchSebab() {
  const response = await fetch("/mock-api/sebab.json");
  const data = await response.json();
  return data;
}

// Build map untuk lookup cepat
export function buildSebabMap(sebabList = []) {
  const map = {};
  sebabList.forEach((item) => {
    const nameKey = normalizeString(item.sebab_na);  // "USIA PENSIUN"
    const codeKey = normalizeString(item.kode_na);   // "A4"
    map[nameKey] = item;
    map[codeKey] = item;
  });
  return map;
}
```

---

## ❌ **Kemungkinan Penyebab Error**

### **1. SEBAB_NA tidak ditemukan**
**Error:** `SEBAB_NA "X" tidak ditemukan pada referensi sebab nonaktif`

**Penyebab:**
- SEBAB_NA di Excel tidak match dengan master data
- Format salah (spasi, typo, dll)

**Solusi:**
- Pastikan SEBAB_NA adalah kode (A4, A1, dll) atau nama yang valid
- Cek master data di `public/mock-api/sebab.json`
- Pastikan tidak ada spasi tambahan

### **2. KPJ sudah nonaktif**
**Error:** `Tenaga kerja dengan KPJ X sudah nonaktif`

**Penyebab:**
- KPJ sudah pernah dinonaktifkan sebelumnya

**Solusi:**
- Cek status worker di sistem
- Pastikan KPJ yang akan dinonaktifkan masih AKTIF

### **3. Format tanggal salah**
**Error:** `TGL_LAHIR harus berformat dd-mm-yyyy atau yyyy-mm-dd`

**Penyebab:**
- Format tanggal tidak sesuai

**Solusi:**
- Gunakan format: `1995-01-12` atau `12-01-1995`
- Pastikan format Excel adalah text, bukan date

### **4. Required field kosong**
**Error:** `KPJ wajib diisi` atau `SEBAB_NA wajib diisi`

**Penyebab:**
- Kolom wajib tidak diisi

**Solusi:**
- Pastikan semua kolom wajib terisi
- Jangan ada baris kosong

---

## ✅ **Cara Debug Error**

### **1. Cek Browser Console (F12)**
```javascript
// Lihat error message detail
console.error("Error validasi:", error);
```

### **2. Cek Network Tab**
- Lihat request ke `sebab.json` - apakah berhasil?
- Status 200 atau 304 = OK
- Status 404 = File tidak ditemukan

### **3. Cek Data Excel**
- Pastikan format sesuai template
- Pastikan tidak ada karakter aneh
- Pastikan format text, bukan formula

### **4. Cek Master Data**
```javascript
// Di browser console
fetch('/mock-api/sebab.json')
  .then(r => r.json())
  .then(data => console.log('Master SEBAB_NA:', data));
```

---

## 🔧 **Perbaikan yang Sudah Dilakukan**

1. ✅ **Validasi SEBAB_NA lebih fleksibel**
   - Menerima kode (A4) atau nama (Usia Pensiun)
   - Case insensitive
   - Error message lebih jelas

2. ✅ **Validasi KPJ lebih fleksibel**
   - Jika tidak ditemukan → Warning (tidak error)
   - Tetap diproses meskipun tidak ditemukan
   - Hanya error jika sudah nonaktif

3. ✅ **Normalisasi header**
   - Handle spasi vs underscore
   - Case insensitive

---

## 📝 **Contoh Data yang Valid**

### **Sheet TK Nonaktif:**
```
KPJ        | NAMA_LENGKAP | TGL_LAHIR  | SEBAB_NA | TGL_KEJADIAN | KETERANGAN
12345678   | Andi Pratama | 1995-01-12 | A4       | 2027-01-01   | (kosong)
12345679   | Budi Santoso | 1989-02-20 | A4       | 2027-01-01   | (kosong)
```

**SEBAB_NA bisa:**
- `A4` ✅
- `Usia Pensiun` ✅
- `USIA PENSIUN` ✅
- `usia pensiun` ✅

---

**Jika masih error, cek error message di console untuk detail masalahnya!**

