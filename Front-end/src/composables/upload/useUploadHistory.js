/**
 * Composable untuk mengelola history upload
 */

import { ref, computed } from "vue";

const HISTORY_STORAGE_KEY = "massalUploadHistory";

const defaultUploadHistory = [
  {
    totalValid: 150,
    totalInvalid: 5,
    totalData: 155,
    statusValidasi: "Selesai",
    tanggalSelesai: "2025-01-15 10:30:00",
    sumberData: "File Upload",
    jenis: "TK Mendaftar",
    action: "download",
  },
  {
    totalValid: 200,
    totalInvalid: 0,
    totalData: 200,
    statusValidasi: "Selesai",
    tanggalSelesai: "2025-01-14 14:20:00",
    sumberData: "File Upload",
    jenis: "TK Lanjutan",
    action: "download",
  },
];

export function useUploadHistory() {
  const savedHistory = loadHistoryFromStorage();
  const uploadHistory = ref(savedHistory || defaultUploadHistory);
  
  if (!savedHistory) {
    saveHistoryToStorage(uploadHistory.value);
  }

  // Header untuk tabel history
  const historyTableHeaders = ref([
    "Total Valid (disimpan)",
    "Total Tidak Valid",
    "Total Data",
    "Status Validasi",
    "Tanggal Selesai Validasi",
    "Sumber Data",
    "Jenis",
    "Action",
  ]);

  // Format data untuk tabel history
  const historyTableData = computed(() => {
    return uploadHistory.value.map((row) => ({
      "total valid (disimpan)": row.totalValid,
      "total tidak valid": row.totalInvalid,
      "total data": row.totalData,
      "status validasi": row.statusValidasi,
      "tanggal selesai validasi": row.tanggalSelesai,
      "sumber data": row.sumberData,
      jenis: row.jenis,
      action: row.action,
    }));
  });

  // Add new history entry
  function addHistoryEntry(entry) {
    uploadHistory.value = [entry, ...uploadHistory.value];
    saveHistoryToStorage(uploadHistory.value);
  }

  function loadHistoryFromStorage() {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : null;
    } catch (error) {
      console.warn("Gagal memuat history upload:", error);
      return null;
    }
  }

  function saveHistoryToStorage(history) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        HISTORY_STORAGE_KEY,
        JSON.stringify(history ?? [])
      );
    } catch (error) {
      console.warn("Gagal menyimpan history upload:", error);
    }
  }

  return {
    uploadHistory,
    historyTableHeaders,
    historyTableData,
    addHistoryEntry,
  };
}

















