/**
 * Composable untuk mengelola data report dan upload notification
 */

import { ref } from "vue";
import { transformJenisKelamin } from "../utils/dataTransform.js";

export function useReportData() {
  const showNewUploadNotification = ref(false);
  const newUploadData = ref(null);
  const summary = ref({
    totalTenagaKerja: 0,
    totalUpahRapel: 0,
    totalIuran: 0,
    totalDenda: 0,
  });
  const rincianIuran = ref([]);
  const finalisasi = ref({
    checklist: {
      dataTkLengkap: false,
      dataUpahBenar: false,
      perhitunganIuran: false,
      totalIuranDiverifikasi: false,
      tidakAdaPerubahan: false,
    }
  });

  /**
   * Load data upload terbaru dari localStorage dan update ke employeeRowsRaw
   * @param {Object} route - Vue router route object
   * @param {Ref} employeeRowsRaw - Ref untuk menyimpan data workers
   * @param {Ref} editSummaryData - Ref untuk summary data
   * @param {Ref} statusFilter - Ref untuk status filter
   * @param {Ref} searchQuery - Ref untuk search query
   */
  function loadNewUploadData(route, employeeRowsRaw, editSummaryData, statusFilter, searchQuery) {
    try {
      const uploadKey = route.query?.uploadKey;
      if (!uploadKey) return;

      const recentUploads = JSON.parse(localStorage.getItem('recentUploads') || '[]');
      const uploadData = recentUploads.find(upload => upload.key === uploadKey);

      if (uploadData && uploadData.data) {
        newUploadData.value = uploadData;
        showNewUploadNotification.value = true;

        // Update employeeRowsRaw dengan data upload
        if (Array.isArray(uploadData.data)) {
          // Transform data upload ke format worker
          const transformedData = uploadData.data.map((row, index) => {
            const kpjValue = row.NOMOR_IDENTITAS_KPJ || row.KPJ || row.KODE || "-";
            const nikValue = row.NIK || row.NOMOR_IDENTITAS || "-";
            
            return {
              no: employeeRowsRaw.value.length + index + 1,
              nik: nikValue,
              nama: row.NAMA_LENGKAP || row.NAMA || "",
              jk: transformJenisKelamin(row.JENIS_KELAMIN),
              kpj: kpjValue,
              upahPokok: row.UPAH || 0,
              rapel: row.RAPEL || 0,
              totalUpah: (row.UPAH || 0) + (row.RAPEL || 0),
              status: uploadData.actionType === "UPDATE_STATUS" ? "NONAKTIF" : "AKTIF"
            };
          });

          // Merge dengan data existing atau replace
          if (uploadData.actionType === "INSERT") {
            // Untuk INSERT, tambahkan data baru
            employeeRowsRaw.value = [...employeeRowsRaw.value, ...transformedData];
          } else if (uploadData.actionType === "UPDATE_STATUS") {
            // Untuk UPDATE_STATUS, update status worker yang sesuai
            transformedData.forEach(newWorker => {
              const existingIndex = employeeRowsRaw.value.findIndex(
                w => w.kpj === newWorker.kpj && w.kpj !== "-"
              );
              if (existingIndex !== -1) {
                employeeRowsRaw.value[existingIndex].status = "NONAKTIF";
              }
            });
          } else if (uploadData.actionType === "UPDATE_UPAH") {
            // Untuk UPDATE_UPAH, update upah worker yang sesuai
            transformedData.forEach(newWorker => {
              const existingIndex = employeeRowsRaw.value.findIndex(
                w => w.kpj === newWorker.kpj && w.kpj !== "-"
              );
              if (existingIndex !== -1) {
                employeeRowsRaw.value[existingIndex].upahPokok = newWorker.upahPokok;
                employeeRowsRaw.value[existingIndex].rapel = newWorker.rapel;
                employeeRowsRaw.value[existingIndex].totalUpah = newWorker.totalUpah;
              }
            });
          } else if (uploadData.actionType === "UPDATE_DATA") {
            // Untuk UPDATE_DATA (koreksi massal), data sudah ter-update di backend
            // Jangan update dari localStorage karena data dari API sudah lebih lengkap dan terbaru
            // Data akan ter-refresh otomatis dari API melalui loadWorkersData()
            // Hanya update field yang benar-benar di-update dan ada di data upload
            transformedData.forEach(newWorker => {
              const existingIndex = employeeRowsRaw.value.findIndex(
                w => w.kpj === newWorker.kpj || w.nik === newWorker.nik
              );
              if (existingIndex !== -1) {
                // Hanya update field yang ada di newWorker dan bukan field referensi
                // Field yang boleh di-update: alamat, handphone, email, lokasi, bank, rekening
                const allowedUpdateFields = [
                  'alamatLengkapDomisili', 'handphone', 'email', 'lokasiPekerjaan',
                  'namaBank', 'kodeBank', 'nomorRekening', 'namaRekening'
                ];
                
                // Update hanya field yang diizinkan dan ada nilainya
                allowedUpdateFields.forEach(field => {
                  if (newWorker[field] !== undefined && newWorker[field] !== null && newWorker[field] !== '') {
                    employeeRowsRaw.value[existingIndex][field] = newWorker[field];
                  }
                });
                
                // Update upah dan rapel jika ada (untuk koreksi massal yang mengupdate gaji)
                // Jika ada UPAH di file upload, update upah pokok
                if (newWorker.upahPokok !== undefined && newWorker.upahPokok !== null && newWorker.upahPokok !== '') {
                  const parsedUpah = Number(newWorker.upahPokok);
                  if (!Number.isNaN(parsedUpah) && parsedUpah > 0) {
                    employeeRowsRaw.value[existingIndex].upahPokok = parsedUpah;
                    // Update totalUpah jika rapel tidak diubah
                    if (newWorker.rapel === undefined || newWorker.rapel === null || newWorker.rapel === '') {
                      employeeRowsRaw.value[existingIndex].totalUpah = parsedUpah + (Number(employeeRowsRaw.value[existingIndex].rapel) || 0);
                }
                  }
                }
                
                // Jika ada RAPEL di file upload, update rapel
                if (newWorker.rapel !== undefined && newWorker.rapel !== null && newWorker.rapel !== '') {
                  const parsedRapel = Number(newWorker.rapel);
                  if (!Number.isNaN(parsedRapel) && parsedRapel >= 0) {
                    employeeRowsRaw.value[existingIndex].rapel = parsedRapel;
                    // Update totalUpah jika upah tidak diubah
                    if (newWorker.upahPokok === undefined || newWorker.upahPokok === null || newWorker.upahPokok === '') {
                      employeeRowsRaw.value[existingIndex].totalUpah = (Number(employeeRowsRaw.value[existingIndex].upahPokok) || 0) + parsedRapel;
                }
                  }
                }
                
                // Jika kedua UPAH dan RAPEL diupdate, hitung ulang totalUpah
                if ((newWorker.upahPokok !== undefined && newWorker.upahPokok !== null && newWorker.upahPokok !== '') &&
                    (newWorker.rapel !== undefined && newWorker.rapel !== null && newWorker.rapel !== '')) {
                  const parsedUpah = Number(newWorker.upahPokok);
                  const parsedRapel = Number(newWorker.rapel);
                  if (!Number.isNaN(parsedUpah) && parsedUpah > 0 && !Number.isNaN(parsedRapel) && parsedRapel >= 0) {
                    employeeRowsRaw.value[existingIndex].upahPokok = parsedUpah;
                    employeeRowsRaw.value[existingIndex].rapel = parsedRapel;
                    employeeRowsRaw.value[existingIndex].totalUpah = parsedUpah + parsedRapel;
                  }
                }
              }
            });
          }

          // Update summary jika ada
          if (editSummaryData.value) {
            const activeWorkers = employeeRowsRaw.value.filter(w => w.status === "AKTIF");
            editSummaryData.value.totalTenagaKerja = activeWorkers.length;
            editSummaryData.value.totalUpahRapel = activeWorkers.reduce(
              (sum, w) => sum + (w.totalUpah || 0),
              0
            );
          }
        }
      }
    } catch (err) {
      console.warn('Gagal memuat data upload terbaru:', err);
    }
  }

  return {
    showNewUploadNotification,
    newUploadData,
    summary,
    rincianIuran,
    finalisasi,
    loadNewUploadData,
  };
}
