/**
 * Cache Module
 * Handles data loading from JSON file untuk lingkungan Node
 */

import { readFile } from 'fs/promises';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { DATA_PATHS } from '../../config/pathConfig.js';

// Shared state untuk mock data
let mockData = null;
const DATA_FILE = DATA_PATHS.mainData;

async function ensureDataFile() {
    if (!existsSync(DATA_FILE)) {
        const dir = dirname(DATA_FILE);
        mkdirSync(dir, { recursive: true });
        throw new Error(`File data.json tidak ditemukan pada ${DATA_FILE}`);
    }
}

/**
 * Load data dari data.json (dengan caching)
 * @param {boolean} forceReload - Force reload from disk
 * @returns {Promise<Object>} Data dari JSON
 */
export async function loadMockData(forceReload = false) {
    if (!mockData || forceReload) {
        try {
            await ensureDataFile();
            const raw = await readFile(DATA_FILE, 'utf-8');
            mockData = JSON.parse(raw);
        } catch (error) {
            throw new Error(`Gagal memuat data backend: ${error.message}`);
        }
    }
    return mockData;
}

/**
 * Simpan data ke file JSON
 */
export function persistMockData() {
    if (!mockData) return;
    try {
        const dir = dirname(DATA_FILE);
        mkdirSync(dir, { recursive: true });
        writeFileSync(DATA_FILE, JSON.stringify(mockData, null, 2), 'utf-8');
    } catch (error) {
        console.warn('Gagal menyimpan data backend:', error);
    }
}

/**
 * Get current mock data (untuk akses shared state)
 * @returns {Object|null} Current mock data
 */
export function getMockData() {
    return mockData;
}

/**
 * Set mock data (untuk update shared state)
 * @param {Object} data - New data to set
 */
export function setMockData(data) {
    mockData = data;
}

/**
 * Clear cache (untuk development/testing)
 */
export function clearCache() {
    mockData = null;
}
