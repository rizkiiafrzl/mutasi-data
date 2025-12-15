import { ref } from 'vue';

/**
 * Composable untuk mengelola semua modal states di Report page
 */
export function useReportModals() {
    // Add Worker Modal
    const showAddWorkerModal = ref(false);
    const agreeStatement = ref(false);
    const showWarning = ref(false);

    // Worker Detail Modal
    const showWorkerDetailModal = ref(false);

    // Nonaktif Modals
    const showNonaktifConfirmModal = ref(false);
    const showNonaktifSuccessModal = ref(false);

    // Notification & Confirmation
    const showNotificationModal = ref(false);
    const showConfirmationModal = ref(false);

    // Contribution Success
    const showContributionSuccessModal = ref(false);
    const contributionSuccessMessage = ref('');

    // Finalisasi Success
    const showFinalisasiSuccess = ref(false);
    const lastFinalisasiPeriode = ref('');

    // Add Worker Handlers
    function handleAddWorker() {
        showAddWorkerModal.value = true;
        agreeStatement.value = false;
        showWarning.value = false;
    }

    function handleCancelAddWorker() {
        showAddWorkerModal.value = false;
        agreeStatement.value = false;
        showWarning.value = false;
    }

    function handleContinueAddWorker(router, selectedPeriode) {
        if (!agreeStatement.value) {
            showWarning.value = true;
            return;
        }
        showAddWorkerModal.value = false;
        router.push({
            path: '/workers',
            query: { periode: selectedPeriode }
        });
    }

    // Notification Handlers
    function handleNotificationOK() {
        showNotificationModal.value = false;
        setTimeout(() => {
            showConfirmationModal.value = true;
        }, 300);
    }

    function handleConfirmationNo() {
        showConfirmationModal.value = false;
    }

    // Nonaktif Handlers
    function handleOpenNonaktifConfirm() {
        showNonaktifConfirmModal.value = true;
    }

    function handleCloseNonaktifConfirm() {
        showNonaktifConfirmModal.value = false;
    }

    function handleConfirmNonaktifWorker() {
        showNonaktifConfirmModal.value = false;
        showWorkerDetailModal.value = false;
        showNonaktifSuccessModal.value = true;
    }

    function handleCloseNonaktifSuccess(clearSelectedWorker) {
        showNonaktifSuccessModal.value = false;
        clearSelectedWorker();
    }

    // Contribution Success Handlers  
    function handleCloseContributionSuccess() {
        showContributionSuccessModal.value = false;
    }

    function showContributionSuccess(message) {
        contributionSuccessMessage.value = message;
        showContributionSuccessModal.value = true;
    }

    // Finalisasi Success Handlers
    function handleCloseFinalisasiSuccess(router) {
        showFinalisasiSuccess.value = false;
        lastFinalisasiPeriode.value = '';
        router.push({ path: '/dashboard' });
    }

    function showFinalisasiSuccessModal(periode) {
        showFinalisasiSuccess.value = true;
        lastFinalisasiPeriode.value = periode;
    }

    return {
        // States
        showAddWorkerModal,
        agreeStatement,
        showWarning,
        showWorkerDetailModal,
        showNonaktifConfirmModal,
        showNonaktifSuccessModal,
        showNotificationModal,
        showConfirmationModal,
        showContributionSuccessModal,
        contributionSuccessMessage,
        showFinalisasiSuccess,
        lastFinalisasiPeriode,

        // Handlers
        handleAddWorker,
        handleCancelAddWorker,
        handleContinueAddWorker,
        handleNotificationOK,
        handleConfirmationNo,
        handleOpenNonaktifConfirm,
        handleCloseNonaktifConfirm,
        handleConfirmNonaktifWorker,
        handleCloseNonaktifSuccess,
        handleCloseContributionSuccess,
        showContributionSuccess,
        handleCloseFinalisasiSuccess,
        showFinalisasiSuccessModal
    };
}
