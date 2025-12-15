import { ref } from 'vue';

/**
 * Composable untuk mengelola recalculation countdown & logic
 */
export function useReportRecalculation() {
    const isRecalculating = ref(false);
    const showCountdown = ref(false);
    const countdownValue = ref(3);
    let countdownTimer = null;

    function resetCountdown() {
        if (countdownTimer) {
            clearInterval(countdownTimer);
            countdownTimer = null;
        }
        showCountdown.value = false;
    }

    async function handleRecalculate(loadReportData, loadWorkersData, recalculateSummary, showSuccessCallback) {
        if (isRecalculating.value) return;

        isRecalculating.value = true;
        countdownValue.value = 3;
        showCountdown.value = true;

        countdownTimer = setInterval(async () => {
            if (countdownValue.value > 1) {
                countdownValue.value -= 1;
            } else {
                clearInterval(countdownTimer);
                countdownTimer = null;

                try {
                    await loadReportData(true);
                    await loadWorkersData();
                    recalculateSummary();

                    const message = `Perhitungan iuran berhasil diperbarui pada ${new Date().toLocaleString('id-ID')}.`;
                    showSuccessCallback(message);
                } catch (error) {
                    console.warn('Gagal menghitung ulang iuran:', error);
                } finally {
                    resetCountdown();
                    isRecalculating.value = false;
                }
            }
        }, 1000);
    }

    return {
        isRecalculating,
        showCountdown,
        countdownValue,
        handleRecalculate,
        resetCountdown
    };
}
