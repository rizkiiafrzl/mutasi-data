# 🔑 CARA MENDAPATKAN KODE UNTUK KOREKSI MASSAL

## ❓ **KODE di Template Koreksi Massal - Dari Mana?**

**KODE** di template Koreksi Massal adalah **identifier untuk mencari tenaga kerja** yang akan diupdate. KODE bisa berupa salah satu dari:

1. ✅ **ID_PEGAWAI** (prioritas utama)
2. ✅ **KODE_TK**
3. ✅ **NO_PEGAWAI**
4. ✅ **KPJ** (fallback)
5. ✅ **NIK** (fallback)

---

## 📍 **Dari Mana KODE Didapat?**

### **1. ID_PEGAWAI & KODE_TK - Auto-Generate**

**Kapan di-generate?**
- ✅ Saat upload **TK Baru** (sheet BARU)
- ✅ Di-generate otomatis oleh sistem
- ✅ Tidak perlu input user

**Format:**
- **ID_PEGAWAI:** `TK-YYYYMMDD-XXXX` (contoh: `TK-20250115-0001`)
- **KODE_TK:** `TK-XXXXX` (contoh: `TK-00001`)

**Contoh:**
```javascript
// Saat insert TK Baru
const newWorker = {
  idPegawai: "TK-20250115-0001",  // ← Auto-generate
  kodeTk: "TK-00001",              // ← Auto-generate
  nik: "3201234567890123",
  nama: "Ahmad Wijaya",
  // ...
};
```

### **2. NO_PEGAWAI - Input User atau Sistem**

**Kapan didapat?**
- ✅ Bisa diisi user saat upload TK Baru/Lanjutan
- ✅ Atau di-generate sistem
- ✅ Bisa bervariasi format

**Contoh:**
```excel
// Di template TK Baru/Lanjutan
NO_PEGAWAI: 1001
// atau
NO_PEGAWAI: EMP-001
```

### **3. KPJ & NIK - Input User**

**Kapan didapat?**
- ✅ **KPJ:** Diisi saat upload TK Lanjutan
- ✅ **NIK:** Diisi saat upload TK Baru (NOMOR_IDENTITAS)

---

## 🔍 **Cara Mencari KODE untuk Koreksi Massal**

### **Metode 1: Dari Data yang Sudah Ada di Sistem**

**Cara:**
1. Buka halaman **Report** (daftar tenaga kerja)
2. Cari tenaga kerja yang akan diupdate
3. Lihat kolom **ID_PEGAWAI** atau **KODE_TK**
4. Copy KODE tersebut ke template Koreksi Massal

**Contoh:**
```
Report → Daftar TK
┌─────┬──────────────────┬───────────────┬──────────┐
│ No  │ Nama             │ ID_PEGAWAI    │ KODE_TK  │
├─────┼──────────────────┼───────────────┼──────────┤
│ 1   │ Ahmad Wijaya     │ TK-20250115-0001 │ TK-00001 │
└─────┴──────────────────┴───────────────┴──────────┘

→ Copy "TK-20250115-0001" atau "TK-00001" ke kolom KODE
```

### **Metode 2: Dari Export Data**

**Cara:**
1. Export data tenaga kerja dari sistem
2. Ambil kolom **ID_PEGAWAI** atau **KODE_TK**
3. Paste ke template Koreksi Massal

### **Metode 3: Menggunakan KPJ atau NIK**

**Cara:**
1. Jika tidak punya ID_PEGAWAI, bisa gunakan **KPJ** atau **NIK**
2. Sistem akan mencari worker berdasarkan KPJ/NIK
3. Pastikan KPJ/NIK sudah terdaftar di sistem

**Contoh:**
```excel
// Template Koreksi Massal
KODE          | EMAIL
1234567890123 | ahmad@email.com  ← KPJ sebagai KODE
```

---

## 📋 **Template Koreksi Massal**

### **Kolom yang Ada:**

```excel
KODE              | ID_PEGAWAI        | NOMOR_PEGAWAI | EMAIL
TK-20250115-0001  | TK-20250115-0001  | TK-00001      | ahmad@email.com
```

**Penjelasan:**
- **KODE** (wajib) = ID_PEGAWAI, KODE_TK, KPJ, atau NIK
- **ID_PEGAWAI** (kolom merah) = Referensi, tidak boleh diubah
- **NOMOR_PEGAWAI** (kolom merah) = Referensi, tidak boleh diubah

**Yang Boleh Diubah (kolom kuning):**
- ✅ ALAMAT_LENGKAP_DOMISILI
- ✅ HANDPHONE
- ✅ EMAIL
- ✅ LOKASI_PEKERJAAN
- ✅ NAMA_BANK, KODE_BANK
- ✅ NOMOR_REKENING, NAMA_REKENING

---

## 🔧 **Bagaimana Sistem Mencari Worker dengan KODE?**

### **File: `src/composables/useMassUpload.js`**

```javascript
function getExistingWorkerByKode(kode) {
  if (!kode) return null;
  // Cari berdasarkan ID_PEGAWAI, KODE_TK, atau noPegawai
  return existingWorkers.value.find(w => 
    (w.idPegawai && w.idPegawai === kode) ||      // ← Prioritas 1
    (w.kodeTk && w.kodeTk === kode) ||            // ← Prioritas 2
    (w.noPegawai && w.noPegawai === kode) ||      // ← Prioritas 3
    (w.kpj && w.kpj === kode) ||                   // ← Prioritas 4
    (w.nik && w.nik === kode)                      // ← Prioritas 5
  ) || null;
}
```

**Urutan Pencarian:**
1. **ID_PEGAWAI** (contoh: `TK-20250115-0001`)
2. **KODE_TK** (contoh: `TK-00001`)
3. **NO_PEGAWAI** (contoh: `1001`)
4. **KPJ** (contoh: `1234567890123`)
5. **NIK** (contoh: `3201234567890123`)

---

## 📝 **Contoh Penggunaan**

### **Scenario 1: Menggunakan ID_PEGAWAI**

```excel
// Template Koreksi Massal
KODE              | EMAIL           | HANDPHONE
TK-20250115-0001  | ahmad@email.com | 081234567890
```

**Sistem akan:**
1. Cari worker dengan `idPegawai = "TK-20250115-0001"`
2. Jika ditemukan → Update EMAIL dan HANDPHONE
3. Jika tidak ditemukan → Error

### **Scenario 2: Menggunakan KPJ**

```excel
// Template Koreksi Massal
KODE          | EMAIL
1234567890123 | ahmad@email.com
```

**Sistem akan:**
1. Cari worker dengan `kpj = "1234567890123"`
2. Jika ditemukan → Update EMAIL
3. Jika tidak ditemukan → Error

### **Scenario 3: Menggunakan NIK**

```excel
// Template Koreksi Massal
KODE              | EMAIL
3201234567890123  | ahmad@email.com
```

**Sistem akan:**
1. Cari worker dengan `nik = "3201234567890123"`
2. Jika ditemukan → Update EMAIL
3. Jika tidak ditemukan → Error

---

## 🎯 **Cara Mendapatkan KODE dari Sistem**

### **1. Dari Halaman Report**

**Langkah:**
1. Buka halaman **Report** (daftar tenaga kerja)
2. Cari tenaga kerja yang akan diupdate
3. Lihat kolom **ID_PEGAWAI** atau **KODE_TK**
4. Copy ke template Koreksi Massal

**Jika kolom tidak terlihat:**
- Tambahkan kolom ID_PEGAWAI/KODE_TK di tabel
- Atau export data untuk melihat semua kolom

### **2. Dari Export Data**

**Langkah:**
1. Export data tenaga kerja (jika ada fitur export)
2. Buka file Excel hasil export
3. Ambil kolom **ID_PEGAWAI** atau **KODE_TK**
4. Copy ke template Koreksi Massal

### **3. Menggunakan KPJ atau NIK**

**Langkah:**
1. Gunakan **KPJ** atau **NIK** yang sudah terdaftar
2. Paste ke kolom **KODE** di template Koreksi Massal
3. Sistem akan mencari berdasarkan KPJ/NIK

---

## ⚠️ **Catatan Penting**

### **1. KODE Harus Terdaftar di Sistem**
- ✅ KODE harus sudah ada (dari TK Baru/Lanjutan)
- ❌ Tidak bisa menggunakan KODE yang belum terdaftar
- ⚠️ Jika KODE tidak ditemukan → Error

### **2. KODE Tidak Bisa Diubah**
- ✅ KODE adalah kolom merah (hanya untuk referensi)
- ❌ Tidak boleh diubah di template Koreksi Massal
- ✅ Hanya kolom kuning yang boleh diubah

### **3. Prioritas Pencarian**
- ✅ **ID_PEGAWAI** = Paling direkomendasikan (paling unik)
- ✅ **KODE_TK** = Alternatif yang baik
- ✅ **KPJ** = Bisa digunakan jika tidak punya ID_PEGAWAI
- ✅ **NIK** = Bisa digunakan sebagai fallback

---

## 🔧 **Perbaikan yang Bisa Dilakukan**

### **Saran: Tambahkan Fitur Export KODE**

Bisa ditambahkan fitur untuk:
1. **Export daftar KODE** dari halaman Report
2. **Download template dengan KODE** yang sudah terisi
3. **Search KODE** berdasarkan nama/NIK/KPJ

**Contoh implementasi:**
```javascript
// Di Report.vue - Tambahkan tombol export
function exportKodeForKoreksi() {
  const kodeList = workers.value.map(w => ({
    KODE: w.idPegawai || w.kodeTk || w.kpj || w.nik,
    ID_PEGAWAI: w.idPegawai,
    NOMOR_PEGAWAI: w.noPegawai,
    NAMA_LENGKAP: w.nama,
    KPJ: w.kpj,
    NIK: w.nik
  }));
  // Export ke Excel
}
```

---

## 📊 **Ringkasan**

| KODE Type | Sumber | Format | Kapan Didapat |
|-----------|--------|--------|---------------|
| **ID_PEGAWAI** | Auto-generate | `TK-YYYYMMDD-XXXX` | Saat upload TK Baru |
| **KODE_TK** | Auto-generate | `TK-XXXXX` | Saat upload TK Baru |
| **NO_PEGAWAI** | Input user/sistem | Bervariasi | Saat upload TK Baru/Lanjutan |
| **KPJ** | Input user | 8-13 digit | Saat upload TK Lanjutan |
| **NIK** | Input user | 16 digit | Saat upload TK Baru |

**Rekomendasi:**
- ✅ Gunakan **ID_PEGAWAI** jika tersedia (paling unik)
- ✅ Atau gunakan **KODE_TK** sebagai alternatif
- ✅ Atau gunakan **KPJ** jika tidak punya ID_PEGAWAI

---

**KODE didapat dari data yang sudah terdaftar di sistem, bukan di-generate baru!** 🎯

