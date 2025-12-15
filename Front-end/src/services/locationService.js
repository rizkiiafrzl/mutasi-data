const DEFAULT_BASE_URL = 'http://localhost:5000';
const API_BASE_URL = normalizeBaseUrl(import.meta.env?.VITE_API_BASE_URL || DEFAULT_BASE_URL);

function normalizeBaseUrl(url) {
  if (!url) return DEFAULT_BASE_URL;
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export async function fetchLocations() {
  const response = await fetch(`${API_BASE_URL}/api/references/locations`);
  if (!response.ok) {
    throw new Error('Tidak dapat memuat referensi lokasi pekerjaan.');
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

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

