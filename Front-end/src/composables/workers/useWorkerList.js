import { ref } from 'vue';
import { api } from '../../services/api.js';
import { convertPeriodeToKey } from '../../utils/dataTransform.js';

/**
 * Composable untuk mengelola daftar pekerja
 * Ekstrak dari Report.vue lines 568-655
 */
export function useWorkerList() {
    const workers = ref([]);
    const isLoading = ref(false);
    const error = ref(null);

    /**
     * Load data pekerja dari API
     * @param {string} periode - Periode laporan (format: "MM/YYYY")
     * @param {Array} existingData - Data existing dari upload (opsional)
     * @returns {Promise<Array>} - Data pekerja
     */
    async function loadWorkers(periode, existingData = []) {
        if (!periode) {
            return [];
        }

        isLoading.value = true;
        error.value = null;

        try {
            // Convert periode format: "11/2025" -> "2025-11"
            const periodeKey = convertPeriodeToKey(periode);

            const workersData = await api.getReportWorkers(
                periodeKey,
                1, // Always load from page 1 to get all data
                10000, // Load all data, not paginated
                '', // No search filter when loading
                'all' // No status filter when loading
            );

            const apiData = workersData.data || [];

            // Jika tidak ada data existing, langsung gunakan data dari API
            if (!existingData || existingData.length === 0) {
                workers.value = apiData;
                return apiData;
            }

            // Merge data: ambil dari API sebagai base, lalu tambahkan/update dengan data dari upload
            let mergedData = [...apiData];

            // Tambahkan data dari existing yang belum ada di API (data baru yang diupload)
            existingData.forEach((existingWorker) => {
                const existsInApi = mergedData.find((w) => {
                    // Cek berdasarkan KPJ (jika ada dan tidak kosong)
                    if (w.kpj && existingWorker.kpj && w.kpj !== '-' && existingWorker.kpj !== '-') {
                        return w.kpj === existingWorker.kpj;
                    }
                    // Cek berdasarkan NIK (jika ada dan tidak kosong)
                    if (w.nik && existingWorker.nik && w.nik !== '-' && existingWorker.nik !== '-') {
                        return w.nik === existingWorker.nik;
                    }
                    return false;
                });

                if (!existsInApi) {
                    // Data baru dari upload yang belum ada di API
                    mergedData.push(existingWorker);
                } else {
                    // Update data existing dengan data dari upload jika ada perubahan
                    const index = mergedData.indexOf(existsInApi);
                    const updatedWorker = { ...existsInApi };

                    // Hanya update field yang ada di existingWorker dan bukan field referensi
                    Object.keys(existingWorker).forEach((key) => {
                        // Jangan timpa nama jika existing tidak punya nama
                        if (key === 'nama' && (!existingWorker.nama || existingWorker.nama === '')) {
                            return;
                        }
                        if (
                            existingWorker[key] !== undefined &&
                            existingWorker[key] !== null &&
                            existingWorker[key] !== ''
                        ) {
                            updatedWorker[key] = existingWorker[key];
                        }
                    });

                    mergedData[index] = updatedWorker;
                }
            });

            workers.value = mergedData;
            return mergedData;
        } catch (err) {
            error.value = err.message || 'Gagal memuat data pekerja';
            // Jika error, gunakan existing data jika ada
            if (existingData && existingData.length > 0) {
                workers.value = existingData;
                return existingData;
            }
            workers.value = [];
            return [];
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Filter pekerja berdasarkan query dan status
     * @param {string} searchQuery - Query pencarian
     * @param {string} statusFilter - Filter status
     * @returns {Array} - Data pekerja yang sudah difilter
     */
    function filterWorkers(searchQuery = '', statusFilter = 'all') {
        let filtered = [...workers.value];

        // Filter by status
        if (statusFilter && statusFilter !== 'all') {
            if (statusFilter === 'Baru') {
                // Filter "Baru" = hanya yang tidak punya KPJ
                filtered = filtered.filter((w) => !w.kpj || w.kpj === '-' || w.kpj.trim() === '');
            } else {
                // Convert filter to match data format
                const statusMap = {
                    Aktif: ['AKTIF', 'Aktif'],
                    Nonaktif: ['NONAKTIF', 'Nonaktif'],
                };
                const statusValues = statusMap[statusFilter] || [statusFilter];
                filtered = filtered.filter((w) => {
                    const workerStatus = w.status || w._original?.status || w.original?.status || '';
                    return statusValues.some((s) => workerStatus.toUpperCase() === s.toUpperCase());
                });
            }
        }

        // Search filter
        if (searchQuery && searchQuery.trim()) {
            const searchLower = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(
                (w) =>
                    (w.nama && w.nama.toLowerCase().includes(searchLower)) ||
                    (w.nik && w.nik.includes(searchQuery)) ||
                    (w.kpj && w.kpj.includes(searchQuery))
            );
        }

        return filtered;
    }

    return {
        workers,
        isLoading,
        error,
        loadWorkers,
        filterWorkers,
    };
}
