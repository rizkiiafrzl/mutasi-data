/**
 * Reports Module
 * Handles all report CRUD operations
 */

import { loadMockData, persistMockData, setMockData } from './cache.js';
import { convertPeriodeToKey, transformWorkerStatus } from '../../utils/dataTransform.js';
import { filterActiveWorkers } from '../../utils/workerFilters.js';
import { calculateTotalContributions } from '../../utils/contributionCalculator.js';

/**
 * Get Report Data by Periode
 * @param {string} periode - Periode dalam format "2025-11" atau "11/2025"
 * @param {boolean} forceReload - Force reload dari server
 * @returns {Promise<Object>} Report data untuk periode tertentu
 */
export async function getReportByPeriode(periode, forceReload = false) {
    // Jika forceReload, clear cache dulu
    if (forceReload) {
        setMockData(null);
    }
    const data = await loadMockData(forceReload);

    if (!data.reports) {
        throw new Error('Data reports tidak ditemukan');
    }

    // Convert periode format jika perlu (11/2025 → 2025-11)
    const periodeKey = convertPeriodeToKey(periode);

    const report = data.reports[periodeKey];

    if (!report) {
        throw new Error(`Report untuk periode ${periode} tidak ditemukan`);
    }

    // Calculate summary hanya dari workers yang AKTIF
    const allWorkers = report.workers?.data || [];
    const activeWorkers = filterActiveWorkers(allWorkers);

    // Recalculate summary dari active workers saja
    const recalculatedSummary = {
        totalTenagaKerja: activeWorkers.length,
        totalUpahRapel: activeWorkers.reduce(
            (sum, worker) => sum + (Number(worker.totalUpah) || 0),
            0
        ),
        totalIuran: 0, // Akan dihitung dari rincian iuran
        totalDenda: report.summary?.totalDenda || 0,
    };

    // Calculate rincian iuran hanya dari active workers
    const reportRiskLevel = report.riskLevel || 'Rendah';
    const contributions = calculateTotalContributions(activeWorkers, {
        defaultRiskLevel: reportRiskLevel,
    });

    const recalculatedRincianIuran = [
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

    recalculatedSummary.totalIuran = contributions.totals.overall;

    return {
        ...report,
        periodeKey, // Keep original key for reference
        riskLevel: report.riskLevel || 'Rendah',
        useTotalUpahForContribution: report.useTotalUpahForContribution ?? false,
        summary: recalculatedSummary,
        rincianIuran: recalculatedRincianIuran,
    };
}

/**
 * Get Report Workers dengan pagination, search, dan filter
 * @param {string} periode - Periode dalam format "2025-11" atau "11/2025"
 * @param {number} page - Halaman saat ini (default: 1)
 * @param {number} perPage - Item per halaman (default: 10)
 * @param {string} search - Search query (default: '')
 * @param {string} statusFilter - Filter status (default: 'all')
 * @returns {Promise<Object>} Workers data dengan pagination
 */
export async function getReportWorkers(periode, page = 1, perPage = 10, search = '', statusFilter = 'all') {
    // Reload mock data untuk mendapatkan data terbaru (termasuk yang baru diupload)
    const report = await getReportByPeriode(periode, true);

    if (!report.workers || !report.workers.data) {
        return {
            data: [],
            pagination: {
                page: 1,
                per_page: perPage,
                total: 0,
                totalPages: 0
            }
        };
    }

    let workers = [...report.workers.data];

    // Filter by status
    if (statusFilter && statusFilter !== 'all') {
        if (statusFilter === 'Baru') {
            // Filter "Baru" = hanya yang tidak punya KPJ (KPJ = "-" atau kosong/null)
            workers = workers.filter(w => !w.kpj || w.kpj === '-' || w.kpj.trim() === '');
        } else {
            // Convert filter to match JSON format untuk status lainnya
            const statusMap = {
                'Aktif': 'AKTIF',
                'Nonaktif': 'NONAKTIF'
            };
            const jsonStatus = statusMap[statusFilter] || statusFilter;
            workers = workers.filter(w => w.status === jsonStatus);
        }
    }

    // Search filter
    if (search && search.trim()) {
        const searchLower = search.toLowerCase().trim();
        workers = workers.filter(w =>
            (w.nama && w.nama.toLowerCase().includes(searchLower)) ||
            (w.nik && w.nik.includes(search)) ||
            (w.kpj && w.kpj.includes(search))
        );
    }

    // Pagination
    const total = workers.length;
    const totalPages = Math.ceil(total / perPage);
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedData = workers.slice(start, end);

    // Transform data untuk component
    const reportRiskLevel = report.riskLevel || 'Rendah';

    const transformedData = paginatedData.map(worker => ({
        no: worker.no,
        nik: worker.nik,
        nama: worker.nama,
        jk: worker.jk,
        kpj: worker.kpj,
        upahPokok: worker.upahPokok,
        rapel: worker.rapel || 0,
        totalUpah: worker.totalUpah,
        status: transformWorkerStatus(worker.status),
        actions: worker.actions || ["menu"],
        riskLevel: worker.riskLevel || reportRiskLevel,
        original: {
            ...worker,
            riskLevel: worker.riskLevel || reportRiskLevel
        } // Keep original for reference
    }));

    return {
        data: transformedData,
        pagination: {
            page,
            per_page: perPage,
            total,
            totalPages
        }
    };
}

/**
 * Finalize Report (simulasi POST request)
 * @param {string} periode - Periode dalam format "2025-11" atau "11/2025"
 * @param {Object} checklist - Checklist object
 * @returns {Promise<Object>} Response dari finalisasi
 */
export async function finalizeReport(periode, checklist) {
    const data = await loadMockData();

    if (!data.reports) {
        throw new Error("Data reports tidak ditemukan");
    }

    // Convert periode format jika perlu (11/2025 → 2025-11)
    const periodeKey = convertPeriodeToKey(periode);

    const report = data.reports[periodeKey];

    // Validate checklist
    const requiredFields = [
        'dataTkLengkap',
        'dataUpahBenar',
        'perhitunganIuran',
        'totalIuranDiverifikasi',
        'tidakAdaPerubahan'
    ];

    const allChecked = requiredFields.every(field => checklist[field] === true);

    if (!allChecked) {
        throw new Error('Harap centang semua checklist terlebih dahulu!');
    }

    if (!report) {
        throw new Error(`Report untuk periode ${periode} tidak ditemukan`);
    }

    // Simulasi POST request & update data mock agar konsisten sepanjang sesi
    const today = new Date().toISOString().split('T')[0];

    if (!report.finalisasi) {
        report.finalisasi = {};
    }

    report.finalisasi.checklist = { ...checklist };
    report.finalisasi.status = "FINAL";
    report.finalisasi.tanggalFinalisasi = today;

    // Update dashboard history agar status konsisten
    if (data.dashboard && data.dashboard.history && Array.isArray(data.dashboard.history.data)) {
        const historyItem = data.dashboard.history.data.find(item => item.periode === periodeKey);
        if (historyItem) {
            historyItem.status = "FINAL";
            historyItem.tanggalFinalisasi = today;
            historyItem.isEditable = false;
            historyItem.canFinalize = false;
            historyItem.actions = ["CETAK"];
        }
    }

    persistMockData();

    return {
        success: true,
        message: "Finalisasi berhasil dilakukan!",
        data: {
            ...report.finalisasi,
            checklist,
            status: "FINAL",
            tanggalFinalisasi: today
        }
    };
}

/**
 * Create new monthly report
 * @returns {Promise<Object>} Data laporan yang baru dibuat
 */
export async function createNewReport() {
    const data = await loadMockData();

    if (!data.dashboard || !data.dashboard.history) {
        throw new Error("Data history laporan tidak tersedia");
    }

    // Tentukan periode terbaru berdasarkan history
    const historyData = data.dashboard.history.data || [];
    const parsePeriode = (periode) => {
        if (!periode) return null;
        const [year, month] = periode.split("-");
        if (!year || !month) return null;
        return new Date(Number(year), Number(month) - 1, 1);
    };

    let latestPeriodeDate = null;
    let latestPeriodeKey = data.currentPeriod || null;

    historyData.forEach((item) => {
        const date = parsePeriode(item.periode);
        if (date && (!latestPeriodeDate || date > latestPeriodeDate)) {
            latestPeriodeDate = date;
            latestPeriodeKey = item.periode;
        }
    });

    const baseDate = latestPeriodeDate ? new Date(latestPeriodeDate) : new Date();
    // Increment satu bulan
    baseDate.setMonth(baseDate.getMonth() + 1);
    const newYear = baseDate.getFullYear();
    const newMonth = String(baseDate.getMonth() + 1).padStart(2, "0");
    const periodeKey = `${newYear}-${newMonth}`;
    const periodeDisplay = `${newMonth}/${newYear}`;

    // Hindari duplikasi periode
    const alreadyExists = historyData.some((item) => item.periode === periodeKey);
    if (alreadyExists) {
        throw new Error(`Laporan untuk periode ${periodeDisplay} sudah tersedia`);
    }

    // Reset status currentPeriod pada history lama
    historyData.forEach((item) => {
        if (item.isCurrentPeriod) {
            item.isCurrentPeriod = false;
        }
    });

    // Tambahkan history baru
    const newHistoryEntry = {
        periode: periodeKey,
        periodeDisplay,
        jumlahTk: 0,
        nominalIuran: 0,
        nominalDenda: 0,
        status: "DRAFT",
        actions: ["EDIT", "CETAK", "HAPUS"],
        isEditable: true,
        isCurrentPeriod: true,
        canFinalize: true,
    };

    historyData.unshift(newHistoryEntry);

    // Perbarui pagination metadata sederhana
    if (data.dashboard.history.pagination) {
        const pagination = data.dashboard.history.pagination;
        pagination.total = historyData.length;
        pagination.totalPages = Math.max(
            1,
            Math.ceil(historyData.length / (pagination.per_page || historyData.length))
        );
        pagination.page = 1;
    }

    // Perbarui current period
    data.currentPeriod = periodeKey;

    // Buat data report default
    if (!data.reports) {
        data.reports = {};
    }

    // Ambil data dari bulan sebelumnya untuk di-copy
    let previousWorkers = [];
    let previousRiskLevel = "Rendah";
    let previousUseTotalUpahForContribution = false;

    if (latestPeriodeKey && data.reports[latestPeriodeKey]) {
        const previousReport = data.reports[latestPeriodeKey];

        // Copy riskLevel dan useTotalUpahForContribution dari bulan sebelumnya
        previousRiskLevel = previousReport.riskLevel || "Rendah";
        previousUseTotalUpahForContribution = previousReport.useTotalUpahForContribution ?? false;

        // Copy workers dari bulan sebelumnya (hanya yang status AKTIF)
        if (previousReport.workers && previousReport.workers.data) {
            // Filter hanya karyawan dengan status AKTIF
            const activeWorkers = previousReport.workers.data.filter(
                (worker) => worker.status === "AKTIF"
            );

            previousWorkers = activeWorkers.map((worker, index) => {
                // Copy data worker, tapi reset rapel ke 0 dan recalculate totalUpah
                return {
                    ...worker,
                    no: index + 1, // Reset nomor urut
                    rapel: 0, // Reset rapel untuk bulan baru
                    totalUpah: worker.upahPokok || 0, // Recalculate totalUpah = upahPokok + rapel (0)
                    // Keep: nik, nama, jk, kpj, upahPokok, status, riskLevel
                };
            });
        }
    }

    // Calculate summary dari workers yang di-copy
    const totalTenagaKerja = previousWorkers.length;
    const totalUpahRapel = previousWorkers.reduce(
        (sum, worker) => sum + (Number(worker.totalUpah) || 0),
        0
    );

    // Update history entry dengan jumlah TK yang di-copy
    newHistoryEntry.jumlahTk = totalTenagaKerja;
    newHistoryEntry.nominalIuran = 0; // Akan dihitung ulang setelah perhitungan iuran
    newHistoryEntry.nominalDenda = 0;

    data.reports[periodeKey] = {
        periode: periodeKey,
        periodeDisplay,
        summary: {
            totalTenagaKerja,
            totalUpahRapel,
            totalIuran: 0, // Akan dihitung ulang setelah perhitungan iuran
            totalDenda: 0,
        },
        riskLevel: previousRiskLevel,
        useTotalUpahForContribution: previousUseTotalUpahForContribution,
        rincianIuran: [], // Akan dihitung ulang setelah perhitungan iuran
        workers: {
            data: previousWorkers,
            pagination: {
                page: 1,
                per_page: 10,
                total: totalTenagaKerja,
                totalPages: Math.max(1, Math.ceil(totalTenagaKerja / 10)),
            },
        },
        finalisasi: {
            checklist: {
                dataTkLengkap: false,
                dataUpahBenar: false,
                perhitunganIuran: false,
                totalIuranDiverifikasi: false,
                tidakAdaPerubahan: false,
            },
            status: "DRAFT",
        },
    };

    persistMockData();

    return {
        success: true,
        periode: periodeKey,
        periodeDisplay,
    };
}

/**
 * Hapus laporan berdasarkan periode
 * @param {string} periode - Periode (boleh dalam format display atau YYYY-MM)
 * @returns {Promise<Object>} Response dari delete operation
 */
export async function deleteReport(periode) {
    const data = await loadMockData();
    if (!periode) {
        throw new Error("Periode laporan tidak ditemukan.");
    }

    const periodeKey = convertPeriodeToKey(periode);

    if (!data.dashboard || !data.dashboard.history || !Array.isArray(data.dashboard.history.data)) {
        throw new Error("Data history laporan tidak tersedia.");
    }

    const history = data.dashboard.history.data;
    const index = history.findIndex((item) => item.periode === periodeKey);

    if (index === -1) {
        throw new Error(`Laporan untuk periode ${periodeKey} tidak ditemukan.`);
    }

    // Hapus dari history
    history.splice(index, 1);

    // Perbarui pagination metadata sederhana
    if (data.dashboard.history.pagination) {
        const pagination = data.dashboard.history.pagination;
        pagination.total = history.length;
        pagination.totalPages = Math.max(
            1,
            Math.ceil(history.length / (pagination.per_page || history.length || 1))
        );
        pagination.page = Math.min(pagination.page, pagination.totalPages);
    }

    // Hapus data report terkait jika ada
    if (data.reports && data.reports[periodeKey]) {
        delete data.reports[periodeKey];
    }

    // Jika currentPeriod terhapus, set ke periode terbaru yang tersisa
    if (data.currentPeriod === periodeKey) {
        data.currentPeriod = history.length ? history[0].periode : null;
    }

    persistMockData();

    return {
        success: true,
        periode: periodeKey,
    };
}
