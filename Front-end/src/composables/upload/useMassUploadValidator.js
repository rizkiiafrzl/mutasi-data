import * as XLSX from "xlsx";

/**
 * Composable untuk mem-parse dan memvalidasi file upload massal.
 * @param {Object} options
 * @param {Array<string>} options.templateHeaders - Header wajib template.
 * @param {Array<string>} options.requiredFields - Kolom wajib diisi.
 * @param {Array<string>} options.dateFields - Kolom yang harus bertipe tanggal.
 * @param {Function} options.getLokasiByKey - Fungsi untuk mendapatkan data lokasi berdasarkan nama/kode.
 */
// Konstanta untuk field yang locked dan allowed
// Kolom merah: Boleh diisi untuk referensi, tapi tidak akan diupdate
const LOCKED_FIELDS_KOREKSI = [
  'KODE',
  'NOMOR_PEGAWAI',
  'ID_PEGAWAI',
  'KPJ',
  'NIK',
  'NOMOR_IDENTITAS',
  'NAMA_LENGKAP',
  'NAMA',
  'NAMA_TENAGA_KERJA',  // Alias untuk NAMA_LENGKAP
  'TGL_LAHIR',
  'TANGGAL_LAHIR',
  'TEMPAT_LAHIR',       // Kolom referensi, tidak akan diupdate
  'JENIS_KELAMIN',      // Kolom referensi, tidak akan diupdate
  'NAMA_IBU_KANDUNG',   // Kolom referensi, tidak akan diupdate
  'NOMOR_IDENTITAS_KPJ', // Kolom referensi (alias KPJ)
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

const ALLOWED_FIELDS_UPAH = ['UPAH', 'RAPEL'];
const REFERENCE_FIELDS_UPAH = ['NIK', 'NOMOR_IDENTITAS', 'KPJ', 'NOMOR_IDENTITAS_KPJ', 'KODE_TK', 'NAMA_LENGKAP', 'NAMA', 'NAMA_TENAGA_KERJA', 'TGL_LAHIR', 'TANGGAL_LAHIR', 'BLTH', 'NPP', 'NO_PEGAWAI', 'ID_PEGAWAI', 'KODE'];

export function useMassUploadValidator({
  templateHeaders = [],
  requiredFields = [],
  dateFields = [],
  getLokasiByKey,
  getSebabByKey,
  getBankByKey,
  isKoreksiMode = false,
  isTkBaruMode = false,
  isTkLanjutanMode = false,
  isUpahMode = false,
  isTkNonaktifMode = false,
  existingWorkers = [],
  getExistingWorkerByNik = null,
  getExistingWorkerByKpj = null,
  getExistingWorkerByKode = null,
} = {}) {
  async function parseAndValidateFile(file, sheetName = null) {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    
    // Tentukan sheet name berdasarkan parameter atau auto-detect
    let targetSheetName = sheetName;
    if (!targetSheetName) {
      if (workbook.SheetNames.includes("data_tk_baru")) {
        targetSheetName = "data_tk_baru";
      } else if (workbook.SheetNames.includes("data_tk_lanjutan")) {
        targetSheetName = "data_tk_lanjutan";
      } else if (workbook.SheetNames.includes("data_tk_na")) {
        targetSheetName = "data_tk_na";
      } else if (workbook.SheetNames.includes("data_upah")) {
        targetSheetName = "data_upah";
      } else if (workbook.SheetNames.includes("update_data_tk")) {
        targetSheetName = "update_data_tk";
      } else {
        targetSheetName = workbook.SheetNames[0];
      }
    }
    
    const worksheet = workbook.Sheets[targetSheetName];

    if (!worksheet) {
      throw new Error("Sheet data tidak ditemukan pada file template.");
    }

    const headerRows = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: "",
    });
    const headerRow =
      headerRows.find((row) => Array.isArray(row) && row.some(Boolean)) || [];
    // Normalisasi header: handle spasi vs underscore, case insensitive
    const normalizedHeader = headerRow.map((header) => {
      if (!header) return "";
      // Normalisasi: ubah spasi menjadi underscore, uppercase
      return header.toString().trim()
        .replace(/\s+/g, "_")  // Spasi menjadi underscore
        .toUpperCase();
    });

    // Mapping alias untuk kolom (untuk kompatibilitas)
    // Untuk TK Lanjutan: KPJ bisa digunakan sebagai alias untuk NOMOR_IDENTITAS_KPJ
    // Juga handle kasus dimana NOMOR_IDENTITAS dan KPJ terpisah
    // Untuk Upah Massal: ID_PEGAWAI bisa digunakan sebagai alias untuk NO_PEGAWAI
    const columnAliases = {
      "KPJ": "NOMOR_IDENTITAS_KPJ",
      "NOMOR_IDENTITAS_KPJ": "KPJ",
      "NO_PEGAWAI": "ID_PEGAWAI",
      "ID_PEGAWAI": "NO_PEGAWAI"
    };

    // Cek missing headers dengan mempertimbangkan alias dan normalisasi
    // Untuk Koreksi Massal, ID_PEGAWAI dan NOMOR_PEGAWAI adalah optional
    const optionalHeaders = isKoreksiMode ? ["ID_PEGAWAI", "NOMOR_PEGAWAI"] : [];
    
    const missingHeaders = templateHeaders.filter((header) => {
      // Skip optional headers untuk Koreksi Massal
      if (optionalHeaders.includes(header)) {
        return false;
      }
      
      // Normalisasi header untuk perbandingan
      const normalizedTemplateHeader = header.replace(/\s+/g, "_").toUpperCase();
      
      // Cek apakah header ada langsung (setelah normalisasi)
      if (normalizedHeader.includes(normalizedTemplateHeader)) {
        return false;
      }
      
      // Cek apakah header ada langsung (original)
      if (normalizedHeader.includes(header)) {
        return false;
      }
      
      // Cek apakah ada alias yang tersedia
      const alias = columnAliases[header];
      if (alias && normalizedHeader.includes(alias)) {
        return false;
      }
      
      // Khusus untuk NOMOR_IDENTITAS_KPJ: cek apakah ada KPJ atau variasi dengan spasi
      if (header === "NOMOR_IDENTITAS_KPJ") {
        if (normalizedHeader.includes("KPJ") || 
            normalizedHeader.includes("NOMOR_IDENTITAS_KPJ") ||
            normalizedHeader.some(h => h.includes("NOMOR_IDENTITAS") && h.includes("KPJ"))) {
          return false;
        }
      }
      
      // Khusus untuk NO_PEGAWAI: cek apakah ada ID_PEGAWAI (untuk kompatibilitas template lama)
      if (header === "NO_PEGAWAI" && normalizedHeader.includes("ID_PEGAWAI")) {
        return false;
      }
      
      // Khusus untuk ID_PEGAWAI: cek apakah ada NO_PEGAWAI (untuk kompatibilitas template baru)
      if (header === "ID_PEGAWAI" && normalizedHeader.includes("NO_PEGAWAI")) {
        return false;
      }
      
      return true;
    });

    if (missingHeaders.length) {
      throw new Error(
        `Kolom berikut tidak ditemukan pada template: ${missingHeaders.join(", ")}`
      );
    }

    const rows = XLSX.utils.sheet_to_json(worksheet, {
      defval: "",
      raw: false,
    });
    
    // Normalisasi rows dengan mapping alias kolom dan normalisasi header
    const normalizedRows = rows.map((row) => {
      const normalizedRow = {};
      
      // Normalisasi semua key dari row (handle spasi vs underscore)
      Object.keys(row).forEach(key => {
        const normalizedKey = key.toString().trim()
          .replace(/\s+/g, "_")  // Spasi menjadi underscore
          .toUpperCase();
        normalizedRow[normalizedKey] = row[key];
      });
      
      // Map alias kolom: jika ada KPJ tapi tidak ada NOMOR_IDENTITAS_KPJ, copy ke NOMOR_IDENTITAS_KPJ
      // Handle kasus dimana template punya NOMOR_IDENTITAS dan KPJ terpisah
      if (normalizedHeader.includes("KPJ") && !normalizedHeader.includes("NOMOR_IDENTITAS_KPJ")) {
        // Ambil nilai dari KPJ (bukan dari NOMOR_IDENTITAS yang biasanya ID internal)
        if (row.KPJ !== undefined && row.KPJ !== null && String(row.KPJ).trim() !== "") {
          normalizedRow.NOMOR_IDENTITAS_KPJ = String(row.KPJ).trim();
        }
      }
      // Map alias kolom: jika ada NOMOR_IDENTITAS_KPJ tapi tidak ada KPJ, copy ke KPJ
      if (normalizedHeader.includes("NOMOR_IDENTITAS_KPJ") && !normalizedHeader.includes("KPJ")) {
        if (row.NOMOR_IDENTITAS_KPJ !== undefined && row.NOMOR_IDENTITAS_KPJ !== null && String(row.NOMOR_IDENTITAS_KPJ).trim() !== "") {
          normalizedRow.KPJ = String(row.NOMOR_IDENTITAS_KPJ).trim();
        }
      }
      // Map alias kolom: jika ada ID_PEGAWAI tapi tidak ada NO_PEGAWAI, copy ke NO_PEGAWAI
      if (normalizedHeader.includes("ID_PEGAWAI") && !normalizedHeader.includes("NO_PEGAWAI")) {
        if (row.ID_PEGAWAI !== undefined && row.ID_PEGAWAI !== null && String(row.ID_PEGAWAI).trim() !== "") {
          normalizedRow.NO_PEGAWAI = String(row.ID_PEGAWAI).trim();
        }
      }
      // Map alias kolom: jika ada NO_PEGAWAI tapi tidak ada ID_PEGAWAI, copy ke ID_PEGAWAI (untuk kompatibilitas)
      if (normalizedHeader.includes("NO_PEGAWAI") && !normalizedHeader.includes("ID_PEGAWAI")) {
        if (row.NO_PEGAWAI !== undefined && row.NO_PEGAWAI !== null && String(row.NO_PEGAWAI).trim() !== "") {
          normalizedRow.ID_PEGAWAI = String(row.NO_PEGAWAI).trim();
        }
      }
      return normalizedRow;
    });
    
    const meaningfulRows = normalizedRows.filter((row) =>
      templateHeaders.some((header) => {
        // Cek langsung atau melalui alias
        const value = row[header] || (columnAliases[header] ? row[columnAliases[header]] : null);
        return String(value || "").trim() !== "";
      })
    );

    const invalidRows = [];
    const validRows = [];

    meaningfulRows.forEach((row, index) => {
      const rowNumber = index + 2;
      const { errors, normalizedRow } = validateRow(row, columnAliases, normalizedHeader);
      if (errors.length) {
        invalidRows.push({ rowNumber, errors });
      } else {
        validRows.push(normalizedRow);
      }
    });

    // Validasi cross-row (duplicate dalam file yang sama)
    validateDuplicateInFile(validRows, invalidRows);

    return {
      summary: {
        totalRows: meaningfulRows.length,
        validCount: validRows.length,
        invalidCount: invalidRows.length,
        sheetName: targetSheetName,
      },
      validRows,
      invalidRows,
    };
  }

  // Validasi duplicate dalam file yang sama
  function validateDuplicateInFile(validRows, invalidRows) {
    const seenNiks = new Map();
    const seenKpjs = new Map();
    
    // Buat copy array untuk iterasi (karena kita akan memodifikasi validRows)
    const rowsToCheck = [...validRows];
    
    rowsToCheck.forEach((row, index) => {
      // Cari rowNumber dari original index (index + 2 karena header + 1-based)
      // Kita perlu track original index dari meaningfulRows
      const originalIndex = validRows.indexOf(row);
      const rowNumber = originalIndex !== -1 ? originalIndex + 2 : index + 2;
      
      const nik = normalizeIdentifierValue(row.NOMOR_IDENTITAS || row.NIK);
      const kpj = normalizeIdentifierValue(row.KPJ || row.NOMOR_IDENTITAS_KPJ);
      
      if (nik && nik !== "-") {
        if (seenNiks.has(nik)) {
          invalidRows.push({
            rowNumber,
            errors: [`NOMOR_IDENTITAS ${nik} duplikat dalam file yang sama (baris ${seenNiks.get(nik)})`]
          });
          // Hapus dari validRows
          const validIndex = validRows.indexOf(row);
          if (validIndex > -1) {
            validRows.splice(validIndex, 1);
          }
        } else {
          seenNiks.set(nik, rowNumber);
        }
      }
      
      if (kpj && kpj !== "-") {
        if (seenKpjs.has(kpj)) {
          invalidRows.push({
            rowNumber,
            errors: [`KPJ ${kpj} duplikat dalam file yang sama (baris ${seenKpjs.get(kpj)})`]
          });
          // Hapus dari validRows
          const validIndex = validRows.indexOf(row);
          if (validIndex > -1) {
            validRows.splice(validIndex, 1);
          }
        } else {
          seenKpjs.set(kpj, rowNumber);
        }
      }
    });
  }

  function validateRow(row, columnAliases = {}, normalizedHeader = []) {
    const errors = [];
    const normalizedRow = { ...row };

    // Normalisasi nilai identifier agar tidak gagal karena tipe data Number dari Excel
    const identifierFields = [
      "KPJ",
      "NOMOR_IDENTITAS_KPJ",
      "NIK",
      "NOMOR_IDENTITAS",
      "NO_PEGAWAI",
      "ID_PEGAWAI",
      "KODE_TK",
    ];
    identifierFields.forEach((field) => {
      if (
        normalizedRow[field] !== undefined &&
        normalizedRow[field] !== null &&
        String(normalizedRow[field]).trim() !== ""
      ) {
        normalizedRow[field] = normalizeIdentifierValue(normalizedRow[field]);
      }
    });
    
    // Normalisasi kolom alias sebelum validasi
    // Jika template menggunakan KPJ tapi required field adalah NOMOR_IDENTITAS_KPJ
    if (normalizedHeader.includes("KPJ") && !normalizedHeader.includes("NOMOR_IDENTITAS_KPJ")) {
      if (row.KPJ !== undefined && row.KPJ !== null && row.KPJ !== "") {
        normalizedRow.NOMOR_IDENTITAS_KPJ = row.KPJ;
      }
    }
    // Jika template menggunakan NOMOR_IDENTITAS_KPJ tapi ada yang mencari KPJ
    if (normalizedHeader.includes("NOMOR_IDENTITAS_KPJ") && !normalizedHeader.includes("KPJ")) {
      if (row.NOMOR_IDENTITAS_KPJ !== undefined && row.NOMOR_IDENTITAS_KPJ !== null && row.NOMOR_IDENTITAS_KPJ !== "") {
        normalizedRow.KPJ = row.NOMOR_IDENTITAS_KPJ;
      }
    }
    // Jika template menggunakan ID_PEGAWAI tapi required field adalah NO_PEGAWAI
    if (normalizedHeader.includes("ID_PEGAWAI") && !normalizedHeader.includes("NO_PEGAWAI")) {
      if (row.ID_PEGAWAI !== undefined && row.ID_PEGAWAI !== null && row.ID_PEGAWAI !== "") {
        normalizedRow.NO_PEGAWAI = row.ID_PEGAWAI;
      }
    }
    // Jika template menggunakan NO_PEGAWAI tapi ada yang mencari ID_PEGAWAI
    if (normalizedHeader.includes("NO_PEGAWAI") && !normalizedHeader.includes("ID_PEGAWAI")) {
      if (row.NO_PEGAWAI !== undefined && row.NO_PEGAWAI !== null && row.NO_PEGAWAI !== "") {
        normalizedRow.ID_PEGAWAI = row.NO_PEGAWAI;
      }
    }

    requiredFields.forEach((field) => {
      // Cek value dari field langsung atau dari alias
      let value = String(normalizedRow[field] ?? "").trim();
      
      // Khusus untuk NOMOR_IDENTITAS_KPJ: cek juga dari KPJ jika ada
      if (!value && field === "NOMOR_IDENTITAS_KPJ" && normalizedHeader.includes("KPJ")) {
        const kpjValue = row.KPJ || normalizedRow.KPJ;
        if (kpjValue !== undefined && kpjValue !== null && String(kpjValue).trim() !== "") {
          value = String(kpjValue).trim();
          normalizedRow.NOMOR_IDENTITAS_KPJ = value;
        }
      }
      // Khusus untuk NO_PEGAWAI: cek juga dari ID_PEGAWAI jika ada
      if (!value && field === "NO_PEGAWAI" && normalizedHeader.includes("ID_PEGAWAI")) {
        const idPegawaiValue = row.ID_PEGAWAI || normalizedRow.ID_PEGAWAI;
        if (idPegawaiValue !== undefined && idPegawaiValue !== null && String(idPegawaiValue).trim() !== "") {
          value = String(idPegawaiValue).trim();
          normalizedRow.NO_PEGAWAI = value;
        }
      }
      // Khusus untuk ID_PEGAWAI: cek juga dari NO_PEGAWAI jika ada
      if (!value && field === "ID_PEGAWAI" && normalizedHeader.includes("NO_PEGAWAI")) {
        const noPegawaiValue = row.NO_PEGAWAI || normalizedRow.NO_PEGAWAI;
        if (noPegawaiValue !== undefined && noPegawaiValue !== null && String(noPegawaiValue).trim() !== "") {
          value = String(noPegawaiValue).trim();
          normalizedRow.ID_PEGAWAI = value;
        }
      }
      
      // Cek alias umum
      if (!value && columnAliases[field]) {
        // Jika tidak ada value, cek alias
        const aliasValue = normalizedRow[columnAliases[field]];
        if (aliasValue !== undefined && aliasValue !== null) {
          value = String(aliasValue).trim();
          // Copy alias value ke field utama
          normalizedRow[field] = value;
        }
      }
      
      if (!value) {
        errors.push(`${field} wajib diisi`);
      }
      // Validasi khusus untuk NOMOR_IDENTITAS_KPJ atau KPJ (format KPJ)
      if ((field === "NOMOR_IDENTITAS_KPJ" || field === "KPJ") && value) {
        // KPJ biasanya berformat 13 digit angka, tapi bisa juga 8-13 digit untuk kompatibilitas
        const kpjPattern = /^\d{8,13}$/;
        if (!kpjPattern.test(value)) {
          errors.push(`${field} harus berupa 8-13 digit angka`);
        }
      }
      // Validasi khusus untuk NIK atau NOMOR_IDENTITAS (format NIK)
      // NOMOR_IDENTITAS digunakan untuk referensi/pencarian di semua mode
      // Tidak perlu validasi format ketat karena hanya digunakan untuk mencari data yang sudah ada
      // Format bisa bervariasi tergantung sumber data
      // Skip validasi format untuk semua mode - NIK/NOMOR_IDENTITAS hanya untuk referensi
    });

    dateFields.forEach((field) => {
      // Handle both TANGGAL_LAHIR and TGL_LAHIR (alias untuk kompatibilitas)
      let fieldValue = row[field];
      if (!fieldValue && field === "TANGGAL_LAHIR") {
        fieldValue = row["TGL_LAHIR"];
      } else if (!fieldValue && field === "TGL_LAHIR") {
        fieldValue = row["TANGGAL_LAHIR"];
      }
      
      if (fieldValue) {
        const parsed = parseDateValue(fieldValue);
        if (!parsed) {
          errors.push(`${field} harus berformat dd-mm-yyyy atau yyyy-mm-dd`);
        } else {
          normalizedRow[field] = parsed;
          // Jika field adalah TGL_LAHIR atau TANGGAL_LAHIR, simpan juga ke field alias
          if (field === "TANGGAL_LAHIR") {
            normalizedRow["TGL_LAHIR"] = parsed;
          } else if (field === "TGL_LAHIR") {
            normalizedRow["TANGGAL_LAHIR"] = parsed;
          }
        }
      }
    });

    // Validasi UPAH
    if (row.UPAH) {
      const cleaned = Number(
        row.UPAH.toString().replace(/[^0-9,.-]/g, "").replace(",", ".")
      );
      if (Number.isNaN(cleaned) || cleaned <= 0) {
        errors.push("UPAH harus berupa angka dan lebih besar dari 0");
      } else {
        normalizedRow.UPAH = cleaned;
      }
    } else if (requiredFields.includes("UPAH")) {
      errors.push("UPAH wajib diisi");
    }

    // Validasi RAPEL (untuk Upah Massal)
    if (row.RAPEL !== undefined && row.RAPEL !== null && row.RAPEL !== "") {
      const cleaned = Number(
        row.RAPEL.toString().replace(/[^0-9,.-]/g, "").replace(",", ".")
      );
      if (Number.isNaN(cleaned) || cleaned < 0) {
        errors.push("RAPEL harus berupa angka dan tidak boleh negatif");
      } else {
        normalizedRow.RAPEL = cleaned;
      }
    } else if (requiredFields.includes("RAPEL")) {
      errors.push("RAPEL wajib diisi");
    }

    // Validasi BLTH (format bulan/tahun)
    if (row.BLTH) {
      const blthValue = String(row.BLTH).trim();
      // Format: MM/YYYY atau YYYY-MM atau YYYYMM
      const blthPattern1 = /^\d{2}\/\d{4}$/; // MM/YYYY
      const blthPattern2 = /^\d{4}-\d{2}$/; // YYYY-MM
      const blthPattern3 = /^\d{6}$/; // YYYYMM
      
      if (!blthPattern1.test(blthValue) && !blthPattern2.test(blthValue) && !blthPattern3.test(blthValue)) {
        errors.push("BLTH harus berformat MM/YYYY, YYYY-MM, atau YYYYMM");
      } else {
        // Normalisasi ke format YYYY-MM
        let normalizedBLTH = "";
        if (blthPattern1.test(blthValue)) {
          const [mm, yyyy] = blthValue.split("/");
          normalizedBLTH = `${yyyy}-${mm}`;
        } else if (blthPattern2.test(blthValue)) {
          normalizedBLTH = blthValue;
        } else if (blthPattern3.test(blthValue)) {
          const yyyy = blthValue.substring(0, 4);
          const mm = blthValue.substring(4, 6);
          normalizedBLTH = `${yyyy}-${mm}`;
        }
        normalizedRow.BLTH = normalizedBLTH;
      }
    } else if (requiredFields.includes("BLTH")) {
      errors.push("BLTH wajib diisi");
    }

    // Validasi LOKASI_PEKERJAAN (kecuali untuk mode koreksi yang sudah dihandle khusus)
    if (!isKoreksiMode) {
      // Cek dari normalizedRow dulu, jika tidak ada cek dari row asli
      const lokasiRaw = normalizedRow.LOKASI_PEKERJAAN || row.LOKASI_PEKERJAAN || "";
      const lokasiValue = normalizeString(lokasiRaw);
      
      if (lokasiValue) {
        const lokasi = getLokasiByKey ? getLokasiByKey(lokasiValue) : null;
        if (!lokasi) {
          errors.push("LOKASI_PEKERJAAN tidak ditemukan pada referensi lokasi");
        } else {
          normalizedRow.LOKASI_PEKERJAAN_KODE = lokasi.kode;
          normalizedRow.LOKASI_PEKERJAAN_NAMA = lokasi.nama;
        }
      } else if (requiredFields.includes("LOKASI_PEKERJAAN")) {
        errors.push("LOKASI_PEKERJAAN wajib diisi");
      }
    }

    // Validasi SEBAB_NA untuk TK Nonaktif
    const sebabValue = row.SEBAB_NA ? String(row.SEBAB_NA).trim() : "";
    if (sebabValue) {
      // Normalisasi untuk pencarian (bisa kode atau nama)
      const normalizedSebabValue = normalizeString(sebabValue);
      const sebab = getSebabByKey ? getSebabByKey(normalizedSebabValue) : null;
      if (!sebab) {
        // Coba cari dengan value asli (tanpa normalize) untuk handle case sensitive
        const sebabByOriginal = getSebabByKey ? getSebabByKey(sebabValue.toUpperCase()) : null;
        if (!sebabByOriginal) {
          errors.push(`SEBAB_NA "${sebabValue}" tidak ditemukan pada referensi sebab nonaktif. Pastikan menggunakan kode (contoh: A4) atau nama sebab yang valid.`);
        } else {
          normalizedRow.SEBAB_NA_KODE = sebabByOriginal.kode_na;
          normalizedRow.SEBAB_NA_NAMA = sebabByOriginal.sebab_na;
        }
      } else {
        normalizedRow.SEBAB_NA_KODE = sebab.kode_na;
        normalizedRow.SEBAB_NA_NAMA = sebab.sebab_na;
      }
    } else if (requiredFields.includes("SEBAB_NA")) {
      errors.push("SEBAB_NA wajib diisi");
    }

    // Validasi khusus untuk mode Koreksi
    if (isKoreksiMode) {
      // Validasi HANDPHONE (jika diisi)
      if (row.HANDPHONE !== undefined && row.HANDPHONE !== null && String(row.HANDPHONE).trim() !== "") {
        const handphone = String(row.HANDPHONE).trim().replace(/[^0-9]/g, "");
        // Format: 08xxx atau 628xxx, 9-14 digit
        const handphonePattern = /^(08|628)\d{7,12}$/;
        if (!handphonePattern.test(handphone)) {
          errors.push("HANDPHONE harus nomor Indonesia (08xxx atau 628xxx) dengan 9-14 digit");
        } else {
          normalizedRow.HANDPHONE = handphone;
        }
      }

      // Validasi EMAIL (jika diisi)
      if (row.EMAIL !== undefined && row.EMAIL !== null && String(row.EMAIL).trim() !== "") {
        const email = String(row.EMAIL).trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
          errors.push("EMAIL harus berformat valid (mengandung @ dan domain)");
        } else {
          normalizedRow.EMAIL = email.toLowerCase();
        }
      }

      // Validasi LOKASI_PEKERJAAN (jika diisi)
      if (row.LOKASI_PEKERJAAN !== undefined && row.LOKASI_PEKERJAAN !== null && String(row.LOKASI_PEKERJAAN).trim() !== "") {
        const lokasiValue = normalizeString(row.LOKASI_PEKERJAAN);
        const lokasi = getLokasiByKey ? getLokasiByKey(lokasiValue) : null;
        if (!lokasi) {
          errors.push("LOKASI_PEKERJAAN tidak ditemukan pada referensi lokasi");
        } else {
          normalizedRow.LOKASI_PEKERJAAN_KODE = lokasi.kode;
          normalizedRow.LOKASI_PEKERJAAN_NAMA = lokasi.nama;
        }
      }

      // Validasi NAMA_BANK dan KODE_BANK (jika diisi)
      const namaBankValue = row.NAMA_BANK !== undefined && row.NAMA_BANK !== null ? String(row.NAMA_BANK).trim() : "";
      const kodeBankValue = row.KODE_BANK !== undefined && row.KODE_BANK !== null ? String(row.KODE_BANK).trim() : "";
      
      if (namaBankValue || kodeBankValue) {
        // Jika salah satu diisi, keduanya harus diisi
        if (!namaBankValue) {
          errors.push("NAMA_BANK wajib diisi jika KODE_BANK diisi");
        }
        if (!kodeBankValue) {
          errors.push("KODE_BANK wajib diisi jika NAMA_BANK diisi");
        }
        
        if (namaBankValue && kodeBankValue) {
          const bankByNama = getBankByKey ? getBankByKey(normalizeString(namaBankValue)) : null;
          const bankByKode = getBankByKey ? getBankByKey(normalizeString(kodeBankValue)) : null;
          
          if (!bankByNama && !bankByKode) {
            errors.push("NAMA_BANK atau KODE_BANK tidak ditemukan pada referensi bank");
          } else {
            // Validasi match antara NAMA_BANK dan KODE_BANK
            const matchedBank = bankByNama || bankByKode;
            const normalizedNama = normalizeString(namaBankValue);
            const normalizedKode = normalizeString(kodeBankValue);
            
            if (normalizeString(matchedBank.nama_bank) !== normalizedNama || 
                normalizeString(matchedBank.kode_bank) !== normalizedKode) {
              errors.push("NAMA_BANK dan KODE_BANK tidak sesuai dengan referensi bank");
            } else {
              normalizedRow.NAMA_BANK = matchedBank.nama_bank;
              normalizedRow.KODE_BANK = matchedBank.kode_bank;
            }
          }
        }
      }

      // Validasi NOMOR_REKENING (jika diisi)
      if (row.NOMOR_REKENING !== undefined && row.NOMOR_REKENING !== null && String(row.NOMOR_REKENING).trim() !== "") {
        const rekening = String(row.NOMOR_REKENING).trim().replace(/[^0-9]/g, "");
        if (rekening.length < 5 || rekening.length > 20) {
          errors.push("NOMOR_REKENING harus 5-20 digit angka");
        } else {
          normalizedRow.NOMOR_REKENING = rekening;
        }
      }

      // Validasi NAMA_REKENING (jika diisi)
      if (row.NAMA_REKENING !== undefined && row.NAMA_REKENING !== null && String(row.NAMA_REKENING).trim() !== "") {
        const namaRekening = String(row.NAMA_REKENING).trim();
        if (namaRekening.length < 2) {
          errors.push("NAMA_REKENING minimal 2 karakter");
        } else {
          normalizedRow.NAMA_REKENING = namaRekening;
        }
      }

      // Validasi lock kolom merah - hanya untuk referensi, tidak boleh diubah
      LOCKED_FIELDS_KOREKSI.forEach(field => {
        if (normalizedHeader.includes(field) && row[field]) {
          // Field ini hanya untuk referensi pencarian, tidak akan diupdate
          // Tidak perlu error, hanya warning di log
        }
      });

      // Validasi bahwa hanya kolom kuning yang boleh diubah
      // Kolom merah (LOCKED_FIELDS_KOREKSI) boleh diisi untuk referensi, tapi tidak akan diupdate
      // Hanya kolom yang tidak ada di daftar allowed atau locked yang error
      const filledFields = Object.keys(row).filter(key => {
        const value = row[key];
        // Skip jika kosong atau hanya whitespace
        if (!value || String(value).trim() === "") return false;
        // Skip kolom yang sudah dinormalisasi (internal fields)
        if (key.startsWith('_')) return false;
        return true;
      });
      
      // Filter kolom yang tidak boleh diisi (selain kolom merah dan kuning)
      const invalidFields = filledFields.filter(field => {
        // Kolom merah boleh diisi (untuk referensi), tidak error
        if (LOCKED_FIELDS_KOREKSI.includes(field)) return false;
        // Kolom kuning boleh diisi, tidak error
        if (ALLOWED_FIELDS_KOREKSI.includes(field)) return false;
        // Kolom lain yang tidak dikenal = error
        return true;
      });
      
      if (invalidFields.length > 0) {
        errors.push(`Kolom berikut tidak boleh diisi dalam mode Koreksi Massal: ${invalidFields.join(', ')}. Hanya kolom kuning yang boleh diubah. Kolom merah (KODE, ID_PEGAWAI, dll) boleh diisi untuk referensi.`);
      }

      // Validasi KODE harus ada untuk mencari TK
      if (!row.KODE && !row.ID_PEGAWAI && !row.NOMOR_PEGAWAI) {
        errors.push("KODE, ID_PEGAWAI, atau NOMOR_PEGAWAI wajib diisi untuk mencari tenaga kerja");
      } else {
        // Validasi bahwa TK dengan KODE tersebut ada
        const kode = row.KODE || row.ID_PEGAWAI || row.NOMOR_PEGAWAI;
        if (getExistingWorkerByKode) {
          const existingWorker = getExistingWorkerByKode(kode);
          if (!existingWorker) {
            errors.push(`Tenaga kerja dengan KODE/ID_PEGAWAI ${kode} tidak ditemukan`);
          } else {
            // Simpan data referensi untuk validasi
            normalizedRow._EXISTING_WORKER = existingWorker;
          }
        }
      }
    }

    // Validasi TK Baru - cek duplicate NOMOR_IDENTITAS
    if (isTkBaruMode) {
      const nik = normalizedRow.NOMOR_IDENTITAS || normalizedRow.NIK;
      if (nik && nik !== "-") {
        if (getExistingWorkerByNik) {
          const existingWorker = getExistingWorkerByNik(nik);
          if (existingWorker) {
            errors.push(`NOMOR_IDENTITAS ${nik} sudah terdaftar. Gunakan sheet Lanjutan untuk melengkapi data atau Koreksi Massal untuk update.`);
          }
        }
      }
    }

    // Validasi TK Lanjutan - harus match dengan TK Baru
    if (isTkLanjutanMode) {
      // TK Lanjutan menggunakan KPJ atau NO_PEGAWAI untuk mencari, bukan NIK
      const kpj = normalizeIdentifierValue(
        normalizedRow.NOMOR_IDENTITAS_KPJ || normalizedRow.KPJ
      );
      const noPegawai = normalizeIdentifierValue(
        normalizedRow.NO_PEGAWAI || normalizedRow.ID_PEGAWAI
      );
      
      let existingWorker = null;
      
      // Prioritas: Cari berdasarkan KPJ dulu, lalu NO_PEGAWAI
      if (kpj && kpj !== "-" && getExistingWorkerByKpj) {
        existingWorker = getExistingWorkerByKpj(kpj);
      } else if (noPegawai && getExistingWorkerByKode) {
        existingWorker = getExistingWorkerByKode(noPegawai);
      }
      
      if (!existingWorker) {
        // Jika tidak ditemukan, coba cari berdasarkan NIK (jika ada)
        const nik = normalizedRow.NOMOR_IDENTITAS || normalizedRow.NIK;
        if (nik && nik !== "-" && getExistingWorkerByNik) {
          existingWorker = getExistingWorkerByNik(nik);
        }
      }
      
      if (!existingWorker) {
        const identifier = kpj || noPegawai || normalizedRow.NOMOR_IDENTITAS || normalizedRow.NIK || "N/A";
        errors.push(`Tenaga kerja dengan KPJ/NO_PEGAWAI ${identifier} tidak ditemukan di TK Baru. Pastikan TK sudah diupload melalui sheet BARU terlebih dahulu.`);
      } else {
        // Validasi bahwa TK belum punya KPJ (jika KPJ baru diisi)
        if (kpj && kpj !== "-" && existingWorker.kpj && existingWorker.kpj !== "-") {
          errors.push(`Tenaga kerja dengan KPJ ${kpj} sudah memiliki KPJ. Gunakan Koreksi Massal untuk update data.`);
        } else {
          // Simpan data referensi
          normalizedRow._EXISTING_WORKER = existingWorker;
        }
      }
    }

    // Validasi Upah - TK harus AKTIF dan sudah ada
    if (isUpahMode) {
      const kpj = normalizeIdentifierValue(
        normalizedRow.KPJ || normalizedRow.NOMOR_IDENTITAS_KPJ
      );
      const nik = normalizeIdentifierValue(
        normalizedRow.NIK || normalizedRow.NOMOR_IDENTITAS
      );
      const kode = normalizedRow.KODE || normalizedRow.ID_PEGAWAI || normalizedRow.NOMOR_PEGAWAI || normalizedRow.NO_PEGAWAI;
      
      // Validasi: minimal salah satu dari KPJ, NIK, atau KODE harus diisi
      if ((!kpj || kpj === "-") && (!nik || nik === "-") && !kode) {
        errors.push("Minimal salah satu dari KPJ, NIK, atau KODE harus diisi untuk mengidentifikasi tenaga kerja.");
      } else {
      let existingWorker = null;
      
        // Prioritas pencarian: KPJ > NIK > KODE
      if (kpj && kpj !== "-" && getExistingWorkerByKpj) {
        existingWorker = getExistingWorkerByKpj(kpj);
        }
        
        if (!existingWorker && nik && nik !== "-" && getExistingWorkerByNik) {
        existingWorker = getExistingWorkerByNik(nik);
      }
        
        if (!existingWorker && kode && getExistingWorkerByKode) {
          existingWorker = getExistingWorkerByKode(kode);
        }
      
      if (!existingWorker) {
          const identifier = kpj && kpj !== "-" ? `KPJ ${kpj}` : 
                            nik && nik !== "-" ? `NIK ${nik}` : 
                            kode ? `KODE ${kode}` : "identitas";
          errors.push(`Tenaga kerja dengan ${identifier} tidak ditemukan. Pastikan TK sudah terdaftar dan aktif.`);
      } else if (existingWorker.status !== "AKTIF") {
          const identifier = kpj && kpj !== "-" ? `KPJ ${kpj}` : 
                            nik && nik !== "-" ? `NIK ${nik}` : 
                            kode ? `KODE ${kode}` : "identitas";
          errors.push(`Tenaga kerja dengan ${identifier} tidak aktif. Hanya TK dengan status AKTIF yang bisa diupdate upahnya.`);
      } else {
        normalizedRow._EXISTING_WORKER = existingWorker;
        }
      }

      // Validasi bahwa hanya UPAH dan RAPEL yang boleh diubah
      // Kolom referensi (NIK, KPJ, NOMOR_IDENTITAS_KPJ, dll) boleh diisi untuk validasi, tapi tidak akan di-update
      // Hanya UPAH dan RAPEL yang akan di-update
      const allFields = { ...row, ...normalizedRow };
      const filledFields = Object.keys(allFields).filter(key => {
        const value = allFields[key];
        // Skip jika kosong atau null
        if (!value || String(value).trim() === "") return false;
        // Skip jika adalah kolom referensi (boleh diisi untuk validasi)
        if (REFERENCE_FIELDS_UPAH.includes(key)) return false;
        // Skip jika adalah kolom yang akan di-update
        if (ALLOWED_FIELDS_UPAH.includes(key)) return false;
        // Skip field internal
        if (key.startsWith('_')) return false;
        return true;
      });
      
      if (filledFields.length > 0) {
        errors.push(`Kolom berikut tidak boleh diubah dalam mode Upah Massal: ${filledFields.join(', ')}. Hanya UPAH dan RAPEL yang boleh diubah. Kolom referensi (NIK, KPJ, NOMOR_IDENTITAS_KPJ, dll) boleh diisi untuk validasi.`);
      }
    }

    // Validasi TK Nonaktif - KPJ harus AKTIF (tapi lebih fleksibel)
    if (isTkNonaktifMode) {
      const kpj = normalizeIdentifierValue(
        normalizedRow.KPJ || normalizedRow.NOMOR_IDENTITAS_KPJ
      );
      if (kpj && kpj !== "-") {
        if (getExistingWorkerByKpj) {
          const existingWorker = getExistingWorkerByKpj(kpj);
          if (!existingWorker) {
            // Tidak error - data mungkin belum ada di periode ini atau akan dibuat baru
            // Hanya warning di console, tetap lanjutkan proses
            console.warn(`Tenaga kerja dengan KPJ ${kpj} tidak ditemukan di periode ini. Akan tetap diproses.`);
            // Tidak perlu error, karena mungkin data akan dibuat atau ada di periode lain
          } else if (existingWorker.status !== "AKTIF") {
            // Hanya error jika sudah nonaktif (double nonaktif)
            errors.push(`Tenaga kerja dengan KPJ ${kpj} sudah nonaktif. Hanya TK dengan status AKTIF yang bisa dinonaktifkan.`);
          } else {
            // Worker ditemukan dan AKTIF - OK
            normalizedRow._EXISTING_WORKER = existingWorker;
          }
        }
        // Jika getExistingWorkerByKpj tidak ada, skip validasi (tidak error)
      } else {
        // KPJ wajib diisi untuk TK Nonaktif
        if (requiredFields.includes("KPJ") || requiredFields.includes("NOMOR_IDENTITAS_KPJ")) {
          errors.push("KPJ wajib diisi untuk TK Nonaktif");
        }
      }
    }

    return { errors, normalizedRow };
  }

  function parseDateValue(value) {
    const raw = value ? value.toString().trim() : "";
    if (!raw) return "";
    if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
      const [dd, mm, yyyy] = raw.split("-");
      return `${yyyy}-${mm}-${dd}`;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      return raw;
    }
    return "";
  }

  function normalizeIdentifierValue(value) {
    if (value === undefined || value === null) return "";
    if (typeof value === "number" && Number.isFinite(value)) {
      return value.toLocaleString("fullwide", { useGrouping: false }).trim();
    }
    return value.toString().trim();
  }

  function normalizeString(value) {
    if (value === undefined || value === null) return "";
    return value.toString().trim().toUpperCase();
  }

  return {
    parseAndValidateFile,
  };
}

