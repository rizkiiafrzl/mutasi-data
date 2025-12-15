import { ref, computed } from 'vue';
import { formatCurrency } from '../../utils/formatters.js';
import { transformJenisKelamin } from '../../utils/dataTransform.js';

/**
 * Composable untuk mengelola table display workers
 * Menggabungkan filtering + pagination + formatting
 */
export function useWorkerTable(filterWorkers, itemsPerPage) {
    const currentPage = ref(1);
    const totalPages = ref(1);

    const employeeRows = computed(() => {
        const filteredWorkers = filterWorkers();

        // Update totalPages
        const totalFiltered = filteredWorkers.length;
        totalPages.value = Math.max(1, Math.ceil(totalFiltered / itemsPerPage.value));

        // Ensure currentPage does not exceed totalPages
        if (currentPage.value > totalPages.value) {
            currentPage.value = totalPages.value;
        }

        // Pagination
        const start = (currentPage.value - 1) * itemsPerPage.value;
        const end = start + itemsPerPage.value;
        const paginated = filteredWorkers.slice(start, end);

        // Map to table format
        return paginated.map((worker, idx) => ({
            _original: worker,
            _index: start + idx + 1,
            no: start + idx + 1,
            nik: worker.nik || '-',
            nama: worker.nama || '-',
            jk: transformJenisKelamin(worker.jk) || '-',
            kpj: worker.kpj || '-',
            upahPokok: formatCurrency(worker.upahPokok || 0),
            rapel: formatCurrency(worker.rapel || 0),
            totalUpah: formatCurrency(worker.totalUpah || 0),
            status: worker.status || 'AKTIF',
        }));
    });

    function handlePrevPage() {
        if (currentPage.value > 1) {
            currentPage.value--;
        }
    }

    function handleNextPage() {
        if (currentPage.value < totalPages.value) {
            currentPage.value++;
        }
    }

    function resetToFirstPage() {
        currentPage.value = 1;
    }

    return {
        employeeRows,
        currentPage,
        totalPages,
        handlePrevPage,
        handleNextPage,
        resetToFirstPage
    };
}
