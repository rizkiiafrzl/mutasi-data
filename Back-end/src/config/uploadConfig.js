/**
 * Konfigurasi untuk semua jenis upload massal
 * Template headers, required fields, dan date fields untuk setiap jenis upload
 */

// Konfigurasi untuk TK Mendaftar
export const templateHeadersMendaftar = [
  "NO_PEGAWAI",
  "NAMA_LENGKAP",
  "GELAR",
  "TELEPON_AREA_RUMAH",
  "TELEPON_RUMAH",
  "TELEPON_AREA_KANTOR",
  "TELEPON_KANTOR",
  "TELEPON_EXT_KANTOR",
  "HP",
  "EMAIL",
  "TEMPAT_LAHIR",
  "TANGGAL_LAHIR",
  "NAMA_IBU_KANDUNG",
  "JENIS_IDENTITAS",
  "NOMOR_IDENTITAS",
  "MASA_LAKU_IDENTITAS",
  "JENIS_KELAMIN",
  "SURAT_MENYURAT_KE",
  "TANGGAL_KEPESERTAAN",
  "STATUS_KAWIN",
  "GOLONGAN_DARAH",
  "NPWP",
  "KODE_NEGARA",
  "UPAH",
  "ALAMAT",
  "KODE_POS",
  "LOKASI_PEKERJAAN",
  "STATUS_PEGAWAI",
  "TGL_AWAL_BEKERJA",
  "TGL_AKHIR_KONTRAK",
];

export const requiredFieldsMendaftar = [
  "NAMA_LENGKAP",
  "NOMOR_IDENTITAS",
  "TANGGAL_LAHIR",
  "JENIS_KELAMIN",
  "STATUS_KAWIN",
  "STATUS_PEGAWAI",
  "UPAH",
  "LOKASI_PEKERJAAN",
  "TGL_AWAL_BEKERJA",
];

// Konfigurasi untuk TK Lanjutan
export const templateHeadersLanjutan = [
  "NOMOR_IDENTITAS_KPJ",
  "NO_PEGAWAI",
  "NAMA_LENGKAP",
  "TGL_LAHIR",
  "UPAH",
  "LOKASI_PEKERJAAN",
  "STATUS_PEGAWAI",
  "TGL_AWAL_BEKERJA",
  "TGL_AKHIR_KONTRAK",
];

export const requiredFieldsLanjutan = [
  "NOMOR_IDENTITAS_KPJ",
  "NAMA_LENGKAP",
  "TGL_LAHIR",
  "UPAH",
  "LOKASI_PEKERJAAN",
  "STATUS_PEGAWAI",
  "TGL_AWAL_BEKERJA",
];

// Konfigurasi untuk TK Nonaktif
export const templateHeadersNonaktif = [
  "KPJ",
  "NAMA_LENGKAP",
  "TGL_LAHIR",
  "SEBAB_NA",
  "TGL_KEJADIAN",
  "KETERANGAN",
];

export const requiredFieldsNonaktif = [
  "KPJ",
  "NAMA_LENGKAP",
  "TGL_LAHIR",
  "SEBAB_NA",
  "TGL_KEJADIAN",
];

// Konfigurasi untuk Upah Massal
export const templateHeadersUpah = [
  "NIK",
  "NO_PEGAWAI",
  "KPJ",
  "KODE_TK",
  "NAMA_LENGKAP",
  "TGL_LAHIR",
  "UPAH",
  "RAPEL",
  "BLTH",
  "NPP",
];

export const requiredFieldsUpah = [
  "NIK",
  // KPJ tidak wajib - bisa menggunakan NIK atau KODE jika tidak punya KPJ
  "NAMA_LENGKAP",
  "TGL_LAHIR",
  "UPAH",
  "RAPEL",
  "BLTH",
];

// Konfigurasi untuk Koreksi Data TK
// KODE adalah required, ID_PEGAWAI dan NOMOR_PEGAWAI adalah optional (untuk referensi)
export const templateHeadersKoreksi = [
  "KODE",
  "ALAMAT_LENGKAP_DOMISILI",
  "HANDPHONE",
  "LOKASI_PEKERJAAN",
  "EMAIL",
  "NAMA_BANK",
  "KODE_BANK",
  "NOMOR_REKENING",
  "NAMA_REKENING",
  // Optional fields (untuk referensi, tidak wajib ada di template)
  "NOMOR_PEGAWAI",
  "ID_PEGAWAI",
];

export const requiredFieldsKoreksi = [
  "KODE",
];

// Date fields untuk semua jenis upload
export const dateFields = [
  "TANGGAL_LAHIR",
  "TGL_LAHIR",
  "MASA_LAKU_IDENTITAS",
  "TANGGAL_KEPESERTAAN",
  "TGL_AWAL_BEKERJA",
  "TGL_AKHIR_KONTRAK",
  "TGL_KEJADIAN",
];

// Opsi jenis upload dengan mapping template
export const uploadTypes = [
  {
    id: "tk-massal",
    title: "Upload Tenaga Kerja Massal",
    subtitle: "Upload data tenaga kerja baru secara massal",
    type: "TK Massal",
    description: "Upload TK Aktif Massal",
    icon: "👥",
    templateFile: "template_tk_baru.xlsx",
    templateLanjutanFile: "template_tk_lanjutan.xlsx",
    instructions: [
      "File upload adalah microsoft excel (.xls / .xlsx) dengan maksimum 10.000 baris.",
      "Dua pilihan upload:",
      "  • Upload TK Mendaftar untuk tenaga kerja baru",
      "  • Upload TK Lanjutan untuk peserta yang sudah memiliki kartu BPJS Ketenagakerjaan (KPJ)",
      "File upload harus berdasarkan dari template yang telah di download, nama file tidak boleh diubah.",
      "Format data pada file excel harus berupa text.",
    ],
    showHistory: true,
  },
  {
    id: "koreksi-massal",
    title: "Koreksi Data Tenaga Kerja",
    subtitle: "Update data tenaga kerja yang sudah ada",
    type: "Koreksi Massal",
    description: "Upload Koreksi Data TK Massal",
    icon: "✏️",
    templateFile: "template_koreksi_tk.xlsx",
    instructions: [
      "File upload adalah microsoft excel (xls / xlsx) dengan maksimum 10.001 baris.",
      "Susunan tombol: download template - choose file - upload.",
      "File upload harus berdasarkan dari template upah yang telah di download, nama file tidak boleh diubah.",
      "Format data pada file excel harus berupa text.",
      "Perusahaan bertanggungjawab atas file excel yang telah didownload. Apabila di kemudian hari ditemukan bahwa data tersebut disalahgunakan, maka perusahaan bersedia bertanggungjawab sesuai ketentuan perundang-undangan yang berlaku.",
    ],
    showHistory: false,
  },
  {
    id: "tk-nonaktif",
    title: "Upload Tenaga Kerja Nonaktif",
    subtitle: "Upload data tenaga kerja yang dinonaktifkan",
    type: "TK Nonaktif",
    description: "Upload Tenaga Kerja Nonaktif",
    icon: "❌",
    templateFile: "template_tk_na.xlsx",
    instructions: [
      "Mohon diperiksa kembali bahwa tenaga kerja yang akan dinonaktifkan tidak dalam status meninggal dalam bulan pelaporan.",
      "File upload adalah microsoft excel (xls / xlsx) dengan maksimum 10.000 baris.",
      "Susunan tombol: download template - choose file - upload.",
      "File upload harus berdasarkan dari template upah yang telah di download, nama file tidak boleh diubah.",
      "Format data pada file excel harus berupa text.",
    ],
    showHistory: false,
  },
  {
    id: "upah-massal",
    title: "Upload Upah Massal",
    subtitle: "Upload data upah tenaga kerja secara massal",
    type: "Upah Massal",
    description: "Upload Upah Massal dengan Preview & Log",
    icon: "💰",
    templateFile: "template_upah.xlsx",
    instructions: [
      "File upload adalah microsoft excel (xls / xlsx) dengan maksimum 10.000 baris.",
      "Susunan tombol: download template - choose file - upload.",
      "File upload harus berdasarkan dari template upah yang telah di download, nama file tidak boleh diubah.",
      "Format data pada file excel harus berupa text.",
    ],
    showHistory: false,
  },
];

/**
 * Get template configuration berdasarkan upload type dan sub-type
 */
export function getTemplateConfig(uploadType, subType = "mendaftar") {
  if (uploadType === "koreksi-massal") {
    return {
      headers: templateHeadersKoreksi,
      requiredFields: requiredFieldsKoreksi,
      dateFields,
    };
  }
  
  if (uploadType === "upah-massal") {
    return {
      headers: templateHeadersUpah,
      requiredFields: requiredFieldsUpah,
      dateFields,
    };
  }
  
  if (uploadType === "tk-nonaktif") {
    return {
      headers: templateHeadersNonaktif,
      requiredFields: requiredFieldsNonaktif,
      dateFields,
    };
  }
  
  if (uploadType === "tk-massal" && subType === "lanjutan") {
    return {
      headers: templateHeadersLanjutan,
      requiredFields: requiredFieldsLanjutan,
      dateFields,
    };
  }
  
  // Default: TK Mendaftar
  return {
    headers: templateHeadersMendaftar,
    requiredFields: requiredFieldsMendaftar,
    dateFields,
  };
}








