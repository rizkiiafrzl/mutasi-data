# Analisis Komponen yang Tidak Terpakai

## 📊 HASIL ANALISIS

### ✅ Komponen yang DIGUNAKAN:
1. **Button.vue** - Digunakan di: dashboard, Report, Massal, Workers
2. **ContentContainer.vue** - Digunakan di: dashboard, Report, Workers
3. **Table.vue** - Digunakan di: dashboard, Report, Massal
4. **Pagination.vue** - Digunakan di: dashboard, Report, Massal
5. **Chip.vue** - Digunakan di: dashboard, Report
6. **Dialog.vue** - Digunakan di: dashboard, Report, Massal, Workers
7. **CheckBox.vue** - Digunakan di: Report
8. **SearchBar.vue** - Digunakan di: Report
9. **TextField.vue** - Digunakan di: Workers
10. **TextArea.vue** - Digunakan di: Workers

### ❌ Komponen yang TIDAK TERPAKAI:
1. **AppBar.vue** - ❌ Tidak digunakan sama sekali
2. **NavBar.vue** - ❌ Tidak digunakan sama sekali
3. **Card.vue** - ❌ Tidak digunakan sama sekali

---

## 🔍 DETAIL ANALISIS

### 1. **AppBar.vue**
**Status:** ❌ TIDAK TERPAKAI
**Fungsi:** Komponen untuk menampilkan bar navigasi aplikasi
**Props:** 
- `bar` (String) - Teks untuk ditampilkan
- `variantClass` (String, default: "blue") - Variant styling

**Analisis:**
- Tidak ada import di file manapun
- Tidak digunakan di App.vue, router, atau view manapun
- Komponen ini sepertinya untuk layout aplikasi yang belum diimplementasikan

**Rekomendasi:**
- ✅ **HAPUS** jika tidak akan digunakan
- ⚠️ **PERTAHANKAN** jika rencana akan digunakan untuk layout aplikasi di masa depan

---

### 2. **NavBar.vue**
**Status:** ❌ TIDAK TERPAKAI
**Fungsi:** Komponen untuk menampilkan tab navigation
**Props:**
- `tabs` (Array) - Array tab untuk ditampilkan
- `activeTab` (String) - Tab yang aktif

**Analisis:**
- Tidak ada import di file manapun
- Tidak digunakan di App.vue, router, atau view manapun
- Komponen ini untuk tab navigation yang belum diimplementasikan

**Rekomendasi:**
- ✅ **HAPUS** jika tidak akan digunakan
- ⚠️ **PERTAHANKAN** jika rencana akan digunakan untuk tab navigation di masa depan

---

### 3. **Card.vue**
**Status:** ❌ TIDAK TERPAKAI
**Fungsi:** Komponen card untuk menampilkan data user/pegawai
**Props:**
- `user` (Object) - Data user dengan properties: Tipe, Nama, Kantor, Kode, Jabatan

**Analisis:**
- Tidak ada import di file manapun
- Hanya ada kata "Card" di komentar view (bukan komponen Card.vue)
- Komponen ini sepertinya untuk fitur yang belum diimplementasikan (mungkin untuk menampilkan daftar pegawai/kantor)

**Rekomendasi:**
- ✅ **HAPUS** jika tidak akan digunakan
- ⚠️ **PERTAHANKAN** jika rencana akan digunakan untuk menampilkan card pegawai/kantor

---

## 💡 REKOMENDASI UMUM

### **Bisa Dipindahkan ke View?**
**TIDAK PERLU** - Karena komponen-komponen ini **TIDAK DIGUNAKAN** sama sekali.

### **Opsi yang Tersedia:**

#### **Opsi 1: HAPUS (Recommended)**
Jika komponen-komponen ini tidak akan digunakan:
```bash
# Hapus file yang tidak terpakai
rm src/components/AppBar.vue
rm src/components/NavBar.vue
rm src/components/Card.vue
```

**Keuntungan:**
- ✅ Codebase lebih bersih
- ✅ Tidak ada file yang membingungkan
- ✅ Ukuran project lebih kecil

#### **Opsi 2: PERTAHANKAN**
Jika komponen-komponen ini akan digunakan di masa depan:
- Biarkan di folder `components/`
- Tambahkan komentar di file: `// TODO: Belum digunakan, akan digunakan untuk [fitur X]`

**Keuntungan:**
- ✅ Siap digunakan saat dibutuhkan
- ⚠️ Tapi bisa membingungkan developer lain

#### **Opsi 3: Pindahkan ke Folder Terpisah**
Jika ingin menyimpan untuk referensi:
```bash
# Buat folder untuk komponen yang tidak terpakai
mkdir src/components/unused
mv src/components/AppBar.vue src/components/unused/
mv src/components/NavBar.vue src/components/unused/
mv src/components/Card.vue src/components/unused/
```

**Keuntungan:**
- ✅ Tidak mengganggu komponen aktif
- ✅ Masih tersedia untuk referensi
- ✅ Bisa dihapus kapan saja

---

## 🎯 KESIMPULAN

**Komponen yang tidak terpakai TIDAK PERLU dipindahkan ke view** karena:
1. Tidak digunakan di view manapun
2. Tidak ada kode yang bergantung padanya
3. Lebih baik dihapus atau dipindahkan ke folder terpisah

**Rekomendasi Final:**
- ✅ **HAPUS** komponen yang tidak terpakai untuk menjaga codebase tetap bersih
- ⚠️ Jika akan digunakan, **PERTAHANKAN** dengan menambahkan TODO comment
- 📁 Jika ingin menyimpan untuk referensi, **PINDAHKAN** ke folder `unused/`

---

## 📝 CATATAN

Jika Anda ingin menggunakan komponen-komponen ini di masa depan:

1. **AppBar.vue** - Bisa digunakan untuk:
   - Header aplikasi global
   - Breadcrumb navigation
   - Top bar dengan informasi aplikasi

2. **NavBar.vue** - Bisa digunakan untuk:
   - Tab navigation di dalam view
   - Switch antara mode tampilan
   - Filter tabs

3. **Card.vue** - Bisa digunakan untuk:
   - Menampilkan daftar pegawai/kantor
   - Card informasi user
   - Dashboard cards





