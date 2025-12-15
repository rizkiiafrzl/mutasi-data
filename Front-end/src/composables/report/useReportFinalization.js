import { ref } from 'vue';
import { api } from '../../services/api.js';
import { convertPeriodeToKey } from '../../utils/dataTransform.js';

/**
 * Composable untuk mengelola proses finalisasi laporan
 * Ekstrak dari Report.vue lines 59-70, 390-434
 */
export function useReportFinalization() {
    // Checklist finalisasi
    const checklist = ref({
        dataTkLengkap: false,
        dataUpahBenar: false,
        perhitunganIuran: false,
        totalIuranDiverifikasi: false,
        tidakAdaPerubahan: false,
    });

    const error = ref('');
    const isLoading = ref(false);

    /**
     * Reset checklist ke nilai default
     */
    function resetChecklist() {
        Object.keys(checklist.value).forEach((key) => {
            checklist.value[key] = false;
        });
        error.value = '';
    }

    /**
     * Validasi checklist sebelum finalisasi
     * @returns {boolean} - true jika semua checklist tercentang
     */
    function validateChecklist() {
        const allChecked = Object.values(checklist.value).every((checked) => checked === true);
        if (!allChecked) {
            error.value = 'Harap centang semua checklist terlebih dahulu!';
            return false;
        }
        return true;
    }

    /**
     * Finalisasi laporan periode
     * @param {string} periode - Periode laporan (format: "MM/YYYY")
     * @returns {Promise<Object>} - Result dengan property success
     */
    async function finalize(periode) {
        if (!validateChecklist()) {
            return { success: false };
        }

        isLoading.value = true;
        error.value = '';

        try {
            // Convert periode format: "11/2025" -> "2025-11"
            const periodeKey = convertPeriodeToKey(periode);

            const result = await api.finalizeReport(periodeKey, checklist.value);

            if (result.success) {
                resetChecklist();
            }

            return result;
        } catch (err) {
            error.value = err.message || 'Gagal melakukan finalisasi';
            return { success: false };
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Clear error message
     */
    function clearError() {
        error.value = '';
    }

    return {
        checklist,
        error,
        isLoading,
        finalize,
        resetChecklist,
        validateChecklist,
        clearError
    };
}
