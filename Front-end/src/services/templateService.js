const DEFAULT_BASE_URL = 'http://localhost:5000';
const API_BASE_URL = normalizeBaseUrl(import.meta.env?.VITE_API_BASE_URL || DEFAULT_BASE_URL);

function normalizeBaseUrl(url) {
  if (!url) return DEFAULT_BASE_URL;
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export async function downloadTemplateFile(templateFileName) {
  if (!templateFileName) {
    throw new Error('Nama file template tidak valid.');
  }

  const templateUrl = `${API_BASE_URL}/templates/${templateFileName}`;
  const response = await fetch(templateUrl);

  if (!response.ok) {
    throw new Error(`File template tidak ditemukan: ${templateFileName}`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = templateFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

