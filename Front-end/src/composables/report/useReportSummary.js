import { calculateTotalContributions, DEFAULT_RISK_LEVEL } from '../../utils/contributionCalculator.js';

/**
 * Composable untuk menghitung ringkasan laporan
 * Ekstrak dari Report.vue lines 165-244
 */
export function useReportSummary() {
    /**
     * Normalize status pekerja ke uppercase
     */
    function normalizeStatus(value) {
        if (!value) return '';
        return value.toString().trim().toUpperCase();
    }

    /**
     * Hitung ringkasan dari daftar pekerja
     * @param {Array} workers - Daftar pekerja
     * @param {number} currentRiskLevel - Risk level saat ini
     * @param {number} currentDenda - Total denda saat ini (opsional)
     * @returns {Object} - Summary data dan rincian iuran
     */
    function calculateSummary(workers, currentRiskLevel, currentDenda = 0) {
        const rows = Array.isArray(workers) ? workers : [];

        if (rows.length === 0) {
            return {
                totalTenagaKerja: 0,
                totalUpahRapel: 0,
                totalIuran: 0,
                totalDenda: currentDenda,
                rincianIuran: []
            };
        }

        const activeWorkers = rows
            .filter((worker) => normalizeStatus(worker.status || worker.original?.status) === 'AKTIF')
            .map((worker) => ({
                ...worker,
                upahPokok: Number(worker.upahPokok) || 0,
                totalUpah:
                    Number(worker.totalUpah) ||
                    Number(worker.upahPokok || 0) + Number(worker.rapel || 0),
                riskLevel: worker.riskLevel || worker.original?.riskLevel || currentRiskLevel,
            }));

        const totalTenagaKerja = activeWorkers.length;
        const totalUpahRapel = activeWorkers.reduce(
            (sum, worker) => sum + (worker.totalUpah || 0),
            0
        );

        const contributions = calculateTotalContributions(activeWorkers, {
            defaultRiskLevel: currentRiskLevel || DEFAULT_RISK_LEVEL,
            salaryAccessor: (worker) => worker.upahPokok || worker.totalUpah || 0,
            totalSalaryAccessor: (worker) => worker.totalUpah || worker.upahPokok || 0,
            riskLevelAccessor: (worker) => worker.riskLevel || currentRiskLevel,
        });

        const rincianIuran = [
            {
                program: 'JKK',
                label: 'IURAN JKK',
                amount: contributions.company.jkk,
                color: 'blue',
            },
            {
                program: 'JKM',
                label: 'IURAN JKM',
                amount: contributions.company.jkm,
                color: 'pink',
            },
            {
                program: 'JHT',
                label: 'IURAN JHT',
                amount: contributions.company.jht + contributions.employee.jht,
                color: 'orange',
            },
            {
                program: 'JP',
                label: 'IURAN JP',
                amount: contributions.company.jp + contributions.employee.jp,
                color: 'purple',
            },
        ];

        return {
            totalTenagaKerja,
            totalUpahRapel,
            totalIuran: contributions.totals.overall,
            totalDenda: currentDenda,
            rincianIuran
        };
    }

    return {
        calculateSummary,
        normalizeStatus
    };
}
