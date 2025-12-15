/**
 * Workers Module
 * Handles worker management operations
 */

import { loadMockData, persistMockData } from './cache.js';
import { convertPeriodeToKey } from '../../utils/dataTransform.js';
import { filterActiveWorkers } from '../../utils/workerFilters.js';
import { calculateTotalContributions } from '../../utils/contributionCalculator.js';

/**
 * Tambah tenaga kerja ke laporan periode
 * @param {string} periode - Periode (format "2025-11" atau "11/2025")
 * @param {Object} workerPayload - Data tenaga kerja
 * @returns {Promise<Object>} Data pekerja yang ditambahkan
 */
export async function addWorkerToReport(periode, workerPayload) {
    const data = await loadMockData();

    if (!periode) {
        throw new Error("Periode laporan tidak ditemukan");
    }

    // Convert periode format
    const periodeKey = convertPeriodeToKey(periode);

    const report = data.reports && data.reports[periodeKey];
    if (!report) {
        throw new Error(`Report untuk periode ${periode} tidak ditemukan`);
    }

    if (!report.workers) {
        report.workers = {
            data: [],
            pagination: { page: 1, per_page: 10, total: 0, totalPages: 0 },
        };
    }

    const workers = report.workers.data || [];

    const newWorker = {
        no: workers.length + 1,
        nik:
            workerPayload.nik && workerPayload.nik.trim()
                ? workerPayload.nik.trim()
                : "-",
        nama: workerPayload.nama || "Tenaga Kerja Baru",
        jk: workerPayload.jk || "Laki-laki",
        kpj:
            workerPayload.kpj && workerPayload.kpj.trim()
                ? workerPayload.kpj.trim()
                : "-",
        upahPokok: Number(workerPayload.upahPokok) || 0,
        rapel: Number(workerPayload.rapel) || 0,
        totalUpah:
            Number(
                workerPayload.totalUpah ||
                (Number(workerPayload.upahPokok) || 0) +
                (Number(workerPayload.rapel) || 0)
            ) || 0,
        status: workerPayload.status || "AKTIF",
        riskLevel: workerPayload.riskLevel || report.riskLevel || "Rendah",
    };

    workers.push(newWorker);
    report.workers.data = workers;

    // Update pagination
    report.workers.pagination.total = workers.length;
    report.workers.pagination.totalPages = Math.max(
        1,
        Math.ceil(
            workers.length / (report.workers.pagination.per_page || workers.length)
        )
    );

    // Update summary hanya dari workers yang AKTIF
    const activeWorkers = filterActiveWorkers(workers);
    report.summary.totalTenagaKerja = activeWorkers.length;
    report.summary.totalUpahRapel = activeWorkers.reduce(
        (sum, worker) => sum + (Number(worker.totalUpah) || 0),
        0
    );

    // Recalculate rincian iuran dari active workers
    const reportRiskLevel = report.riskLevel || 'Rendah';
    const contributions = calculateTotalContributions(activeWorkers, {
        defaultRiskLevel: reportRiskLevel,
    });

    report.summary.totalIuran = contributions.totals.overall;
    report.rincianIuran = [
        {
            program: "JKK",
            label: "IURAN JKK",
            amount: contributions.company.jkk,
            color: "blue",
        },
        {
            program: "JKM",
            label: "IURAN JKM",
            amount: contributions.company.jkm,
            color: "pink",
        },
        {
            program: "JHT",
            label: "IURAN JHT",
            amount: contributions.company.jht + contributions.employee.jht,
            color: "orange",
        },
        {
            program: "JP",
            label: "IURAN JP",
            amount: contributions.company.jp + contributions.employee.jp,
            color: "purple",
        },
    ];

    // Reset status finalisasi ke draft karena ada perubahan data
    if (report.finalisasi) {
        report.finalisasi.status = "DRAFT";
        report.finalisasi.tanggalFinalisasi = undefined;
        if (report.finalisasi.checklist) {
            Object.keys(report.finalisasi.checklist).forEach((key) => {
                report.finalisasi.checklist[key] = false;
            });
        }
    }

    // Update dashboard history
    if (
        data.dashboard &&
        data.dashboard.history &&
        Array.isArray(data.dashboard.history.data)
    ) {
        const historyItem = data.dashboard.history.data.find(
            (item) => item.periode === periodeKey
        );
        if (historyItem) {
            historyItem.jumlahTk = workers.length;
            historyItem.status = "DRAFT";
            historyItem.canFinalize = true;
            historyItem.isEditable = true;
            if (!historyItem.actions.includes("EDIT")) {
                historyItem.actions.unshift("EDIT");
            }
        }
    }

    persistMockData();

    return {
        success: true,
        worker: newWorker,
        total: workers.length,
    };
}

/**
 * Get Worker Options (untuk dropdowns)
 * @returns {Promise<Object>} Options untuk form worker
 */
export async function getWorkerOptions() {
    const data = await loadMockData();

    if (!data.workers || !data.workers.options) {
        throw new Error('Data worker options tidak ditemukan');
    }

    return data.workers.options;
}

/**
 * Get Workers List dengan filter
 * @param {Object} filters - Filter object { status, kategori }
 * @returns {Promise<Array>} List of workers
 */
export async function getWorkers(filters = {}) {
    const data = await loadMockData();

    if (!data.workers || !data.workers.data) {
        return [];
    }

    let workers = [...data.workers.data];

    // Apply filters
    if (filters.status) {
        workers = workers.filter(w => w.status === filters.status);
    }
    if (filters.kategori) {
        workers = workers.filter(w => w.kategori === filters.kategori);
    }

    return workers;
}

/**
 * Get Upload Options
 * @returns {Promise<Array>} List of upload options
 */
export async function getUploadOptions() {
    const data = await loadMockData();

    if (!data.uploads || !data.uploads.options) {
        throw new Error('Data upload options tidak ditemukan');
    }

    return data.uploads.options;
}

/**
 * Get Upload History dengan pagination
 * @param {number} page - Halaman saat ini (default: 1)
 * @param {number} perPage - Item per halaman (default: 10)
 * @returns {Promise<Object>} Upload history dengan pagination
 */
export async function getUploadHistory(page = 1, perPage = 10) {
    const data = await loadMockData();

    if (!data.uploads || !data.uploads.history) {
        throw new Error('Data upload history tidak ditemukan');
    }

    const history = [...data.uploads.history.data];

    // Pagination
    const total = history.length;
    const totalPages = Math.ceil(total / perPage);
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedData = history.slice(start, end);

    return {
        data: paginatedData,
        pagination: {
            page,
            per_page: perPage,
            total,
            totalPages
        }
    };
}

/**
 * Get Current Period
 * @returns {Promise<string>} Current period
 */
export async function getCurrentPeriod() {
    const data = await loadMockData();
    return data.currentPeriod || null;
}
