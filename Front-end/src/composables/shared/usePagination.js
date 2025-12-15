/**
 * Composable untuk pagination handlers
 * Mengurangi duplikasi kode pagination di berbagai view
 */

import { ref } from "vue";

/**
 * Composable untuk pagination
 * @param {Object} options - Options untuk pagination
 * @param {Function} options.loadDataFunction - Function untuk load data saat page berubah (opsional)
 * @param {number} options.initialPage - Halaman awal (default: 1)
 * @param {number} options.initialTotalPages - Total halaman awal (default: 1)
 * @returns {Object} Object berisi currentPage, totalPages, handlePrevPage, handleNextPage
 */
export function usePagination(options = {}) {
  const {
    loadDataFunction = null,
    initialPage = 1,
    initialTotalPages = 1,
  } = options;

  const currentPage = ref(initialPage);
  const totalPages = ref(initialTotalPages);

  function handlePrevPage() {
    if (currentPage.value > 1) {
      currentPage.value--;
      if (loadDataFunction) {
        loadDataFunction();
      }
    }
  }

  function handleNextPage() {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
      if (loadDataFunction) {
        loadDataFunction();
      }
    }
  }

  return {
    currentPage,
    totalPages,
    handlePrevPage,
    handleNextPage,
  };
}

