/**
 * Worker Filter Utilities
 * Helper functions untuk filter dan filter workers berdasarkan status
 */

/**
 * Filter hanya workers dengan status AKTIF
 * @param {Array} workers - Array of worker objects
 * @returns {Array} Filtered array dengan hanya workers yang status AKTIF
 */
export function filterActiveWorkers(workers = []) {
  return workers.filter((worker) => worker.status === "AKTIF");
}

/**
 * Check apakah worker aktif
 * @param {Object} worker - Worker object
 * @returns {boolean} True jika worker status AKTIF
 */
export function isActiveWorker(worker) {
  return worker && worker.status === "AKTIF";
}

