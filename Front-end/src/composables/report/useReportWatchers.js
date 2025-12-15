import { watch } from 'vue';

/**
 * Composable untuk mengelola semua watchers di Report page
 */
export function useReportWatchers(
    searchQuery,
    statusFilter,
    itemsPerPage,
    selectedPeriode,
    route,
    employeeRowsRaw,
    loadWorkersData,
    loadReportData,
    loadNewUploadData,
    resetToFirstPage,
    showNotificationModal
) {
    // Watch untuk search, filter, dan items per page
    watch([searchQuery, statusFilter, itemsPerPage], () => {
        resetToFirstPage();

        // Hanya reload jika belum ada data atau tidak ada data dari upload
        if (employeeRowsRaw.value.length === 0 || !route.query.newUpload) {
            loadWorkersData();
        }
    });

    // Watch untuk periode (jika berubah)
    watch(selectedPeriode, () => {
        if (selectedPeriode.value) {
            loadReportData();
        }
    });

    // Watch untuk route query (untuk reload saat ada newUpload)
    watch(() => route.query.newUpload, async (newVal) => {
        if (newVal === 'true' && selectedPeriode.value) {
            await loadReportData(true);
            loadNewUploadData();
        }
    });

    // Watch untuk route path - tampilkan modal
    let previousPath = route.path;
    watch(() => route.path, (newPath) => {
        if (newPath === '/report' && newPath !== previousPath && selectedPeriode.value) {
            showNotificationModal.value = true;
        }
        previousPath = newPath;
    }, { immediate: false });
}
