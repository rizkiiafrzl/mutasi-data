const DEFAULT_BASE_URL = 'http://localhost:5000';
const API_BASE_URL = normalizeBaseUrl(import.meta.env?.VITE_API_BASE_URL || DEFAULT_BASE_URL);

function normalizeBaseUrl(url) {
  if (!url) return DEFAULT_BASE_URL;
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export async function fetchBanks() {
  const response = await fetch(`${API_BASE_URL}/api/references/banks`);
  if (!response.ok) {
    throw new Error('Tidak dapat memuat referensi bank.');
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

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

