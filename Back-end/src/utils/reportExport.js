import * as XLSX from "xlsx";
import { formatCurrency } from "./formatters.js";

function ensureClientEnvironment() {
  if (typeof window === "undefined") {
    throw new Error("Fitur ini hanya tersedia di browser.");
  }
}

export function openReportPrintPreview(report, periodeLabel = "") {
  ensureClientEnvironment();

  if (!report) {
    throw new Error("Data laporan tidak ditemukan.");
  }

  const workers = report.workers?.data ?? [];
  const summary = report.summary ?? {};
  const periodeDisplay = periodeLabel || report.periodeDisplay || report.periode || "-";

  const rowsHtml = workers
    .map(
      (worker) => `
        <tr>
          <td>${worker.no ?? "-"}</td>
          <td>${worker.nik ?? "-"}</td>
          <td>${worker.nama ?? "-"}</td>
          <td>${worker.kpj ?? "-"}</td>
          <td style="text-align:right;">${formatCurrency(worker.upahPokok || 0)}</td>
          <td style="text-align:right;">${formatCurrency(worker.rapel || 0)}</td>
          <td style="text-align:right;">${formatCurrency(worker.totalUpah || 0)}</td>
          <td>${worker.status ?? "-"}</td>
        </tr>
      `
    )
    .join("");

  const printWindow = window.open("", "_blank", "noopener,noreferrer");
  if (!printWindow) {
    throw new Error("Pop-up diblokir oleh browser. Izinkan pop-up untuk melanjutkan.");
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Laporan ${periodeDisplay}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #111; }
          h1 { text-align: center; margin-bottom: 8px; }
          h2 { text-align: center; margin-top: 0; color: #555; }
          table { width: 100%; border-collapse: collapse; margin-top: 24px; }
          th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
          th { background: #f3f4f6; text-transform: uppercase; letter-spacing: 0.05em; font-size: 11px; }
          .summary { margin-top: 16px; display: flex; gap: 16px; justify-content: space-between; }
          .summary-item { flex: 1; background: #f9fafb; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb; }
          .summary-label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
          .summary-value { font-size: 18px; font-weight: bold; color: #111827; margin-top: 4px; }
        </style>
      </head>
      <body>
        <h1>Mutasi Data</h1>
        <h2>Periode ${periodeDisplay}</h2>

        <div class="summary">
          <div class="summary-item">
            <div class="summary-label">Total Tenaga Kerja</div>
            <div class="summary-value">${summary.totalTenagaKerja ?? 0}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Total Upah + Rapel</div>
            <div class="summary-value">${formatCurrency(summary.totalUpahRapel || 0)}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Total Iuran</div>
            <div class="summary-value">${formatCurrency(summary.totalIuran || 0)}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Total Denda</div>
            <div class="summary-value">${formatCurrency(summary.totalDenda || 0)}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>NIK</th>
              <th>Nama</th>
              <th>KPJ</th>
              <th>Upah Pokok</th>
              <th>Rapel</th>
              <th>Total Upah</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || '<tr><td colspan="8" style="text-align:center;padding:16px;">Tidak ada data tenaga kerja.</td></tr>'}
          </tbody>
        </table>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

export function downloadReportWorkbook(report, filename = "laporan-mutasi.xlsx") {
  ensureClientEnvironment();

  if (!report) {
    throw new Error("Data laporan tidak ditemukan.");
  }

  const workbook = XLSX.utils.book_new();
  const workers = report.workers?.data ?? [];
  const summary = report.summary ?? {};
  const periodeDisplay = report.periodeDisplay || report.periode || "-";

  const workerSheetData = workers.map((worker) => ({
    No: worker.no ?? "",
    NIK: worker.nik ?? "",
    Nama: worker.nama ?? "",
    KPJ: worker.kpj ?? "",
    "Upah Pokok": worker.upahPokok ?? 0,
    Rapel: worker.rapel ?? 0,
    "Total Upah": worker.totalUpah ?? 0,
    Status: worker.status ?? "",
  }));

  const summarySheetData = [
    { Keterangan: "Periode", Nilai: periodeDisplay },
    { Keterangan: "Total Tenaga Kerja", Nilai: summary.totalTenagaKerja ?? 0 },
    { Keterangan: "Total Upah + Rapel", Nilai: summary.totalUpahRapel ?? 0 },
    { Keterangan: "Total Iuran", Nilai: summary.totalIuran ?? 0 },
    { Keterangan: "Total Denda", Nilai: summary.totalDenda ?? 0 },
  ];

  const workerSheet = XLSX.utils.json_to_sheet(workerSheetData.length ? workerSheetData : [{ Pesan: "Tidak ada data tenaga kerja" }]);
  const summarySheet = XLSX.utils.json_to_sheet(summarySheetData);

  XLSX.utils.book_append_sheet(workbook, summarySheet, "Ringkasan");
  XLSX.utils.book_append_sheet(workbook, workerSheet, "Tenaga Kerja");

  const safeFilename = filename || `laporan-${periodeDisplay}.xlsx`;
  XLSX.writeFile(workbook, safeFilename);
}

