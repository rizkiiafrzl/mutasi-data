/**
 * Service untuk mengunduh template upload.
 */

/**
 * Unduh file template dari folder public/templates.
 * @param {string} templateFileName
 */
export async function downloadTemplateFile(templateFileName) {
  if (!templateFileName) {
    throw new Error("Nama file template tidak valid.");
  }

  const templatePath = `/templates/${templateFileName}`;
  const response = await fetch(templatePath);

  if (!response.ok) {
    throw new Error(`File template tidak ditemukan: ${templateFileName}`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = templateFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

