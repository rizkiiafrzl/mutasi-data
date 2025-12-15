/**
 * Data Transformation Utilities
 * Helper functions untuk transform data dari JSON ke format component
 */

/**
 * Transform actions dari JSON format ke component format
 * @param {string[]} jsonActions - Array actions dari JSON (contoh: ["EDIT", "CETAK"])
 * @returns {string[]} Array actions untuk component (contoh: ["Edit", "Cetak"])
 */
export function transformActions(jsonActions) {
  const actionMap = {
    "EDIT": "Edit",
    "CETAK": "Cetak",
    "HAPUS": "Hapus",
    "BATAL": "Batal",
    "LIHAT": "Lihat"
  };
  
  return (jsonActions || []).map(action => actionMap[action] || action);
}

/**
 * Transform worker status dari JSON ke format component
 * @param {string} status - Status dari JSON (contoh: "AKTIF")
 * @returns {string} Status untuk component (contoh: "Aktif")
 */
export function transformWorkerStatus(status) {
  const statusMap = {
    "AKTIF": "Aktif",
    "NONAKTIF": "Nonaktif"
  };
  return statusMap[status] || status;
}

/**
 * Transform jenis kelamin dari berbagai format ke format display
 * @param {string} jk - Jenis kelamin dari input (contoh: "L", "P", "LAKI-LAKI", "PEREMPUAN", "Laki-laki", "Perempuan")
 * @returns {string} Jenis kelamin untuk display (contoh: "Laki-laki" atau "Perempuan")
 */
export function transformJenisKelamin(jk) {
  if (!jk) return "Laki-laki"; // Default
  
  const jkUpper = String(jk).trim().toUpperCase();
  
  // Mapping untuk berbagai format input
  if (jkUpper === "L" || jkUpper === "LAKI-LAKI" || jkUpper === "LAKI LAKI") {
    return "Laki-laki";
  }
  if (jkUpper === "P" || jkUpper === "PEREMPUAN") {
    return "Perempuan";
  }
  
  // Jika sudah dalam format yang benar, return as is
  if (jk === "Laki-laki" || jk === "Perempuan") {
    return jk;
  }
  
  // Default fallback
  return "Laki-laki";
}

/**
 * Transform history item dari JSON ke format component
 * @param {Object} item - History item dari JSON
 * @returns {Object} Transformed history item
 */
export function transformHistoryItem(item) {
  return {
    periode: item.periodeDisplay || item.periode,
    periodeRaw: item.periode, // Keep original for reference
    jumlahTk: item.jumlahTk,
    nominalIuran: item.nominalIuran,
    nominalDenda: item.nominalDenda,
    status: item.status,
    actions: transformActions(item.actions || []),
    // Keep additional fields
    isEditable: item.isEditable,
    isCurrentPeriod: item.isCurrentPeriod,
    canFinalize: item.canFinalize,
    tanggalFinalisasi: item.tanggalFinalisasi,
    original: item // Keep original for reference
  };
}

/**
 * Transform worker data dari JSON ke format component
 * @param {Object} worker - Worker data dari JSON
 * @returns {Object} Transformed worker data
 */
export function transformWorker(worker) {
  return {
    no: worker.no,
    nik: worker.nik,
    nama: worker.nama,
    jk: transformJenisKelamin(worker.jk),
    kpj: worker.kpj,
    upahPokok: worker.upahPokok,
    rapel: worker.rapel || 0,
    totalUpah: worker.totalUpah,
    status: transformWorkerStatus(worker.status),
    actions: worker.actions || ["menu"],
    original: worker // Keep original for reference
  };
}

/**
 * Convert periode format dari "11/2025" ke "2025-11"
 * @param {string} periode - Periode dalam format "11/2025"
 * @returns {string} Periode dalam format "2025-11"
 */
export function convertPeriodeToKey(periode) {
  if (periode.includes('/')) {
    const [month, year] = periode.split('/');
    return `${year}-${month.padStart(2, '0')}`;
  }
  return periode;
}

/**
 * Convert periode format dari "2025-11" ke "11/2025"
 * @param {string} periodeKey - Periode dalam format "2025-11"
 * @returns {string} Periode dalam format "11/2025"
 */
export function convertPeriodeToDisplay(periodeKey) {
  if (periodeKey.includes('-')) {
    const [year, month] = periodeKey.split('-');
    return `${parseInt(month)}/${year}`;
  }
  return periodeKey;
}


