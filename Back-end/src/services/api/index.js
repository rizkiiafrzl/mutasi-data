/**
 * API Service - Main Export
 * Barrel export pattern untuk backward compatibility
 */

// Re-export semua fungsi dari modul-modul
export * from './cache.js';
export * from './dashboard.js';
export * from './reports.js';
export * from './workers.js';
export * from './uploads.js';
// utils.js tidak di-export karena internal use only

// Import untuk api object (backward compatibility)
import * as cache from './cache.js';
import * as dashboard from './dashboard.js';
import * as reports from './reports.js';
import * as workers from './workers.js';
import * as uploads from './uploads.js';

/**
 * API Service Object
 * Untuk backward compatibility dengan kode existing: import { api } from '@/services/api'
 */
export const api = {
    // Cache operations
    clearCache: cache.clearCache,

    // Dashboard operations
    getDashboardSummary: dashboard.getDashboardSummary,
    getDashboardHistory: dashboard.getDashboardHistory,

    // Report operations
    getReportByPeriode: reports.getReportByPeriode,
    getReportWorkers: reports.getReportWorkers,
    finalizeReport: reports.finalizeReport,
    createNewReport: reports.createNewReport,
    deleteReport: reports.deleteReport,

    // Worker operations
    addWorkerToReport: workers.addWorkerToReport,
    getWorkerOptions: workers.getWorkerOptions,
    getWorkers: workers.getWorkers,
    getUploadOptions: workers.getUploadOptions,
    getUploadHistory: workers.getUploadHistory,
    getCurrentPeriod: workers.getCurrentPeriod,

    // Upload operations
    integrateUploadData: uploads.integrateUploadData,
};

// Default export
export default api;
