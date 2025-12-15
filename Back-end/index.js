/**
 * Backend Service Entry Point + HTTP Server
 * Mengekspor semua modul sekaligus men-serve API HTTP untuk konsumsi frontend
 */

import express from 'express';
import cors from 'cors';
import { join } from 'path';

// Re-export modules untuk kompatibilitas
export * from './src/services/api/index.js';
export * from './src/services/bankService.js';
export * from './src/services/locationService.js';
export * from './src/services/sebabService.js';
export * from './src/services/templateService.js';
export * from './src/config/uploadConfig.js';
export * from './src/utils/contributionCalculator.js';
export * from './src/utils/dataTransform.js';
export * from './src/utils/reportExport.js';

import { DATA_PATHS } from './src/config/pathConfig.js';
import {
    getDashboardSummary,
    getDashboardHistory,
} from './src/services/api/dashboard.js';
import {
    getReportByPeriode,
    getReportWorkers,
    finalizeReport,
    createNewReport,
    deleteReport,
} from './src/services/api/reports.js';
import {
    addWorkerToReport,
    getWorkerOptions,
    getWorkers,
    getUploadOptions,
    getUploadHistory,
    getCurrentPeriod,
} from './src/services/api/workers.js';
import { integrateUploadData } from './src/services/api/uploads.js';
import { fetchLocations } from './src/services/locationService.js';
import { fetchBanks } from './src/services/bankService.js';
import { fetchSebab } from './src/services/sebabService.js';

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));

// Serve template files statically untuk kebutuhan unduhan
app.use('/templates', express.static(DATA_PATHS.templates));

const asyncHandler = (handler) => async (req, res, next) => {
    try {
        await handler(req, res);
    } catch (error) {
        next(error);
    }
};

app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
});

app.get('/api/dashboard/summary', asyncHandler(async (_req, res) => {
    const summary = await getDashboardSummary();
    res.json(summary);
}));

app.get('/api/dashboard/history', asyncHandler(async (req, res) => {
    const { page = 1, perPage = 10, status = 'all', forceReload = 'false' } = req.query;
    const history = await getDashboardHistory(
        Number(page),
        Number(perPage),
        status,
        forceReload === 'true'
    );
    res.json(history);
}));

app.get('/api/reports/current', asyncHandler(async (_req, res) => {
    const periode = await getCurrentPeriod();
    res.json({ currentPeriod: periode });
}));

app.post('/api/reports', asyncHandler(async (_req, res) => {
    const result = await createNewReport();
    res.status(201).json(result);
}));

app.delete('/api/reports/:periode', asyncHandler(async (req, res) => {
    const result = await deleteReport(req.params.periode);
    res.json(result);
}));

app.get('/api/reports/:periode', asyncHandler(async (req, res) => {
    const report = await getReportByPeriode(req.params.periode);
    res.json(report);
}));

app.get('/api/reports/:periode/workers', asyncHandler(async (req, res) => {
    const {
        page = 1,
        perPage = 10,
        search = '',
        status = 'all',
    } = req.query;
    const workers = await getReportWorkers(
        req.params.periode,
        Number(page),
        Number(perPage),
        search,
        status,
    );
    res.json(workers);
}));

app.post('/api/reports/:periode/finalize', asyncHandler(async (req, res) => {
    const { checklist = {} } = req.body || {};
    const result = await finalizeReport(req.params.periode, checklist);
    res.json(result);
}));

app.post('/api/reports/:periode/workers', asyncHandler(async (req, res) => {
    const worker = await addWorkerToReport(req.params.periode, req.body || {});
    res.status(201).json(worker);
}));

app.get('/api/workers/options', asyncHandler(async (_req, res) => {
    const options = await getWorkerOptions();
    res.json(options);
}));

app.get('/api/workers', asyncHandler(async (req, res) => {
    const { status, kategori } = req.query;
    const data = await getWorkers({ status, kategori });
    res.json(data);
}));

app.get('/api/references/locations', asyncHandler(async (_req, res) => {
    const locations = await fetchLocations();
    res.json(locations);
}));

app.get('/api/references/banks', asyncHandler(async (_req, res) => {
    const banks = await fetchBanks();
    res.json(banks);
}));

app.get('/api/references/sebab', asyncHandler(async (_req, res) => {
    const sebab = await fetchSebab();
    res.json(sebab);
}));

app.get('/api/uploads/options', asyncHandler(async (_req, res) => {
    const options = await getUploadOptions();
    res.json(options);
}));

app.get('/api/uploads/history', asyncHandler(async (req, res) => {
    const { page = 1, perPage = 10 } = req.query;
    const history = await getUploadHistory(Number(page), Number(perPage));
    res.json(history);
}));

app.post('/api/uploads', asyncHandler(async (req, res) => {
    if (!req.body || !req.body.uploadType) {
        res.status(400).json({ error: 'uploadType wajib diisi' });
        return;
    }
    const result = await integrateUploadData(req.body, req.body.periode);
    res.status(201).json(result);
}));

app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({
        error: err.message || 'Terjadi kesalahan pada server',
    });
});

export { app };

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Backend service berjalan di http://localhost:${PORT}`);
        console.log('Data paths:', DATA_PATHS);
        console.log('Templates served from:', join(DATA_PATHS.templates));
    });
}
