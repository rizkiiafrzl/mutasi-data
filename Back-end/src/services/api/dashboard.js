/**
 * Dashboard Module
 * Handles dashboard operations (summary & history)
 */

import { loadMockData, setMockData } from './cache.js';
import { transformActions } from '../../utils/dataTransform.js';

/**
 * Get Dashboard Summary
 * @returns {Promise<Object>} Summary data untuk dashboard
 */
export async function getDashboardSummary() {
    const data = await loadMockData();
    if (!data.dashboard || !data.dashboard.summary) {
        throw new Error('Data dashboard summary tidak ditemukan');
    }
    return data.dashboard.summary;
}

/**
 * Get Dashboard History dengan pagination dan filter
 * @param {number} page - Halaman saat ini (default: 1)
 * @param {number} perPage - Item per halaman (default: 10)
 * @param {string} statusFilter - Filter status (default: 'all')
 * @param {boolean} forceReload - Force reload data dari server
 * @returns {Promise<Object>} History data dengan pagination
 */
export async function getDashboardHistory(page = 1, perPage = 10, statusFilter = 'all', forceReload = false) {
    // Jika forceReload, clear cache dulu
    if (forceReload) {
        setMockData(null);
    }
    const data = await loadMockData(forceReload);

    if (!data.dashboard || !data.dashboard.history) {
        throw new Error('Data dashboard history tidak ditemukan');
    }

    let history = [...(data.dashboard.history.data || [])];

    // Filter by status
    if (statusFilter && statusFilter !== 'all') {
        history = history.filter(item => item.status === statusFilter);
    }

    // Pagination
    const total = history.length;
    const totalPages = Math.ceil(total / perPage);
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedData = history.slice(start, end);

    // Transform data untuk component
    const transformedData = paginatedData.map(item => ({
        periode: item.periodeDisplay || item.periode,
        periodeRaw: item.periode, // Keep original for reference
        jumlahTk: item.jumlahTk,
        nominalIuran: item.nominalIuran,
        nominalDenda: item.nominalDenda,
        status: item.status,
        actions: transformActions(item.actions || []),
        // Keep additional fields
        isEditable: item.isEditable,
        isCurrentPeriod: item.isCurrentPeriod,
        canFinalize: item.canFinalize,
        tanggalFinalisasi: item.tanggalFinalisasi,
        original: item // Keep original for reference
    }));

    const result = {
        data: transformedData,
        pagination: {
            page,
            per_page: perPage,
            total,
            totalPages
        }
    };
    return result;
}
