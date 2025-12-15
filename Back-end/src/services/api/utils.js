/**
 * Utils Module
 * Helper functions untuk ID generation dan logging
 */

/**
 * Generate ID_PEGAWAI otomatis
 * Format: TK-YYYYMMDD-XXXX (contoh: TK-20250115-0001)
 * @returns {string} Generated ID Pegawai
 */
export function generateIdPegawai() {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `TK-${dateStr}-${random}`;
}

/**
 * Generate KODE_TK (alternatif format)
 * Format: TK-XXXXX (contoh: TK-00001)
 * @param {number|null} sequence - Sequence number (optional)
 * @returns {string} Generated Kode TK
 */
export function generateKodeTk(sequence = null) {
    if (sequence !== null) {
        return `TK-${String(sequence).padStart(5, '0')}`;
    }
    const random = String(Math.floor(Math.random() * 99999)).padStart(5, '0');
    return `TK-${random}`;
}

/**
 * Log riwayat nonaktif
 * @param {Object} worker - Worker object
 * @param {string} sebabNa - Sebab nonaktif
 * @param {string} tglKejadian - Tanggal kejadian
 * @param {string} keterangan - Keterangan tambahan
 * @returns {Object} History entry object
 */
export function logNonaktifHistory(worker, sebabNa, tglKejadian, keterangan) {
    const historyEntry = {
        kpj: worker.kpj,
        nama: worker.nama,
        nik: worker.nik,
        sebabNa: sebabNa,
        tglKejadian: tglKejadian,
        keterangan: keterangan || "",
        tanggalNonaktif: new Date().toISOString().split('T')[0],
        statusSebelumnya: worker.status,
        idPegawai: worker.idPegawai || worker.noPegawai || null,
        kodeTk: worker.kodeTk || null
    };

    return historyEntry;
}
