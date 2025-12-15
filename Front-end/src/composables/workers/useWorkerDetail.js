import { ref, computed } from 'vue';
import { formatCurrency } from '../../utils/formatters.js';
import { calculateWorkerContribution } from '../../utils/contributionCalculator.js';
import { transformWorkerStatus } from '../../utils/dataTransform.js';

/**
 * Composable untuk mengelola detail pekerja
 * Ekstrak dari Report.vue lines 76-104
 */
export function useWorkerDetail() {
    const selectedWorker = ref(null);
    const activeTab = ref('data'); // 'data' atau 'rincian'

    /**
     * Data pekerja yang sudah di-format untuk tampilan
     */
    const workerDisplay = computed(() => {
        if (!selectedWorker.value) {
            return {
                upahPokokDisplay: formatCurrency(0),
                rapelDisplay: formatCurrency(0),
                totalUpahDisplay: formatCurrency(0),
            };
        }

        return {
            ...selectedWorker.value,
            // Transform status untuk tampilan (AKTIF -> Aktif, NONAKTIF -> Nonaktif)
            status: transformWorkerStatus(selectedWorker.value.status || 'AKTIF'),
            upahPokokDisplay: formatCurrency(selectedWorker.value.upahPokok || 0),
            rapelDisplay: formatCurrency(selectedWorker.value.rapel || 0),
            totalUpahDisplay: formatCurrency(selectedWorker.value.totalUpah || 0),
        };
    });

    /**
     * Perhitungan kontribusi iuran pekerja
     */
    const workerContribution = computed(() => {
        if (!selectedWorker.value) return null;

        return calculateWorkerContribution({
            baseSalary: selectedWorker.value.upahPokok || 0,
            totalSalary: selectedWorker.value.totalUpah || 0,
            riskLevel: selectedWorker.value.riskLevel,
        });
    });

    /**
     * Set pekerja yang dipilih
     * @param {Object} worker - Data pekerja
     */
    function setSelectedWorker(worker) {
        selectedWorker.value = worker;
        activeTab.value = 'data'; // Reset ke tab data
    }

    /**
     * Clear pekerja yang dipilih
     */
    function clearSelectedWorker() {
        selectedWorker.value = null;
        activeTab.value = 'data';
    }

    /**
     * Switch tab
     * @param {string} tab - 'data' atau 'rincian'
     */
    function switchTab(tab) {
        if (tab === 'data' || tab === 'rincian') {
            activeTab.value = tab;
        }
    }

    return {
        selectedWorker,
        activeTab,
        workerDisplay,
        workerContribution,
        setSelectedWorker,
        clearSelectedWorker,
        switchTab,
    };
}
