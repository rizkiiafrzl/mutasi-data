/**
 * Service untuk memuat referensi bank di lingkungan Node.
 */

import { readFile } from 'fs/promises';
import { DATA_PATHS } from '../config/pathConfig.js';

async function readJsonFile(filePath) {
  const raw = await readFile(filePath, 'utf-8');
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

/**
 * Fetch bank dari file JSON backend.
 * @returns {Promise<Array<{ nama_bank: string, kode_bank: string }>>}
 */
export async function fetchBanks() {
  return readJsonFile(DATA_PATHS.bank);
}

/**
 * Bangun map bank untuk lookup cepat.
 * @param {Array<{ nama_bank: string, kode_bank: string }>} banks
 * @returns {Record<string, { nama_bank: string, kode_bank: string }>}
 */
export function buildBankMap(banks = []) {
  const map = {};
  banks.forEach((item) => {
    if (!item) return;
    const nameKey = normalizeString(item.nama_bank);
    const codeKey = normalizeString(item.kode_bank);
    if (nameKey) {
      map[nameKey] = item;
    }
    if (codeKey) {
      map[codeKey] = item;
    }
  });
  return map;
}

/**
 * Validasi apakah nama bank dan kode bank match.
 * @param {string} namaBank
 * @param {string} kodeBank
 * @param {Array<{ nama_bank: string, kode_bank: string }>} banks
 * @returns {boolean}
 */
export function validateBankMatch(namaBank, kodeBank, banks = []) {
  const normalizedNama = normalizeString(namaBank);
  const normalizedKode = normalizeString(kodeBank);

  const bank = banks.find(
    (b) =>
      normalizeString(b?.nama_bank) === normalizedNama ||
      normalizeString(b?.kode_bank) === normalizedKode
  );

  if (!bank) return false;

  return (
    normalizeString(bank.nama_bank) === normalizedNama &&
    normalizeString(bank.kode_bank) === normalizedKode
  );
}

function normalizeString(value) {
  if (value === undefined || value === null) return '';
  return value.toString().trim().toUpperCase();
}






