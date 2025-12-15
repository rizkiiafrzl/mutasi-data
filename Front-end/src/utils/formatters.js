/**
 * Formatter Utilities
 * Helper functions untuk format data
 */

/**
 * Format currency ke format Rupiah Indonesia
 * @param {number} value - Nilai yang akan diformat
 * @returns {string} String yang sudah diformat (contoh: "Rp 1.000.000")
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

