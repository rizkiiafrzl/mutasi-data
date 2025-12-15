/**
 * Service untuk memuat referensi sebab nonaktif (lingkungan Node).
 */

import { readFile } from 'fs/promises';
import { DATA_PATHS } from '../config/pathConfig.js';

async function readJsonFile(filePath) {
  const raw = await readFile(filePath, 'utf-8');
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

/**
 * Fetch sebab nonaktif dari file JSON backend.
 * @returns {Promise<Array<{ sebab_na: string, kode_na: string }>>}
 */
export async function fetchSebab() {
  return readJsonFile(DATA_PATHS.sebab);
}

/**
 * Bangun map sebab untuk lookup cepat.
 * @param {Array<{ sebab_na: string, kode_na: string }>} sebabList
 * @returns {Record<string, { sebab_na: string, kode_na: string }>}
 */
export function buildSebabMap(sebabList = []) {
  const map = {};
  sebabList.forEach((item) => {
    if (!item) return;
    const nameKey = normalizeString(item.sebab_na);
    const codeKey = normalizeString(item.kode_na);
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















