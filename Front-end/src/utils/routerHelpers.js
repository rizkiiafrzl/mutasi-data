/**
 * Router Helper Utilities
 * Helper functions untuk navigasi router dengan periode
 */

/**
 * Navigate ke halaman report dengan periode
 * @param {Object} router - Vue router instance
 * @param {string} periode - Periode dalam format "11/2025" atau ""
 * @param {Object} additionalQuery - Query parameters tambahan
 */
export function navigateToReport(router, periode, additionalQuery = {}) {
  const query = { ...additionalQuery };
  if (periode) {
    query.periode = periode;
  }
  router.push({ path: "/report", query });
}

/**
 * Navigate ke halaman massal dengan type dan periode
 * @param {Object} router - Vue router instance
 * @param {string} uploadType - Type upload (tk-massal, koreksi-massal, dll)
 * @param {string} periode - Periode dalam format "11/2025" atau ""
 */
export function navigateToMassal(router, uploadType, periode = "") {
  const query = { type: uploadType };
  if (periode) {
    query.periode = periode;
  }
  router.push({ path: "/massal", query });
}

/**
 * Navigate ke halaman workers dengan periode
 * @param {Object} router - Vue router instance
 * @param {string} periode - Periode dalam format "11/2025" atau ""
 */
export function navigateToWorkers(router, periode = "") {
  const query = {};
  if (periode) {
    query.periode = periode;
  }
  router.push({ path: "/workers", query });
}

/**
 * Get periode dari route query atau fallback value
 * @param {Object} route - Vue route instance
 * @param {string} fallback - Fallback value jika tidak ada di query
 * @returns {string} Periode atau fallback
 */
export function getPeriodeFromRoute(route, fallback = "") {
  return (route.query && route.query.periode) ? route.query.periode : fallback;
}

