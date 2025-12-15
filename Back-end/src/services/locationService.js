/**
 * Service untuk memuat referensi lokasi pekerjaan dari data backend.
 */

import { readFile } from 'fs/promises';
import { DATA_PATHS } from '../config/pathConfig.js';

async function readJsonFile(filePath) {
  const raw = await readFile(filePath, 'utf-8');
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

/**
 * Fetch lokasi dari file JSON backend.
 * @returns {Promise<Array<{ nama: string, kode: string }>>}
 */
export async function fetchLocations() {
  return readJsonFile(DATA_PATHS.lokasi);
}

/**
 * Bangun map lokasi untuk lookup cepat.
 * @param {Array<{ nama: string, kode: string }>} locations
 * @returns {Record<string, { nama: string, kode: string }>}
 */
export function buildLokasiMap(locations = []) {
  const map = {};
  locations.forEach((item) => {
    if (!item) return;
    const nameKey = normalizeString(item.nama);
    const codeKey = normalizeString(item.kode);
    if (nameKey) {
      map[nameKey] = item;
    }
    if (codeKey) {
      map[codeKey] = item;
    }
  });
  return map;
}

function normalizeString(value) {
  if (value === undefined || value === null) return '';
  return value.toString().trim().toUpperCase();
}

