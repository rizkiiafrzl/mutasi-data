/**
 * Composable untuk menangani proses upload dan integrasi data
 */

import { ref } from "vue";
import { api } from "../services/api.js";

export function useUploadHandler() {
  const isUploading = ref(false);
  const recentUploadKey = ref(null);

  /**
   * Get upload configuration berdasarkan upload type
   */
  function getUploadConfig(uploadType, subType = "mendaftar") {
    let config = {
      apiEndpoint: "",
      actionType: "",
      successMessage: "",
    };

    if (uploadType === "tk-massal") {
      const subTypeValue = subType === "lanjutan" ? "lanjutan" : "mendaftar";
      config.apiEndpoint = subTypeValue === "lanjutan" ? "/api/tk/lanjutan" : "/api/tk/mendaftar";
      config.actionType = "INSERT";
      config.successMessage = (count) => `Berhasil menambahkan ${count} tenaga kerja baru ke sistem. Status: AKTIF`;
    } else if (uploadType === "tk-nonaktif") {
      config.apiEndpoint = "/api/tk/nonaktif";
      config.actionType = "UPDATE_STATUS";
      config.successMessage = (count) => `Berhasil menonaktifkan ${count} tenaga kerja. Status: NONAKTIF`;
    } else if (uploadType === "upah-massal") {
      config.apiEndpoint = "/api/upah/massal";
      config.actionType = "UPDATE_UPAH";
      config.successMessage = (count) => `Berhasil mengupdate upah untuk ${count} tenaga kerja.`;
    } else if (uploadType === "koreksi-massal") {
      config.apiEndpoint = "/api/tk/koreksi";
      config.actionType = "UPDATE_DATA";
      config.successMessage = (count) => `Berhasil mengupdate data untuk ${count} tenaga kerja.`;
    }

    return config;
  }

  /**
   * Submit upload data
   */
  async function submitUpload(uploadType, subType, validRows, getUploadJenisLabel, periode = null) {
    if (isUploading.value) return;
    if (!validRows || validRows.length === 0) {
      throw new Error("Tidak ada data valid untuk diunggah.");
    }

    try {
      isUploading.value = true;
      
      const config = getUploadConfig(uploadType, subType);
      const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);
      
      // TODO: Ganti dengan panggilan API yang sebenarnya saat backend siap
      // const response = await fetch(config.apiEndpoint, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     data: validRows,
      //     actionType: config.actionType,
      //     uploadType: uploadType
      //   })
      // });
      // const result = await response.json();
      
      // Integrasikan data upload ke mock data agar langsung muncul di Report
      try {
        await api.integrateUploadData({
          uploadType: uploadType,
          subType: subType, // Tambahkan subType untuk membedakan TK Mendaftar dan TK Lanjutan
          actionType: config.actionType,
          data: validRows,
          timestamp: timestamp,
          totalRows: validRows.length,
          jenis: getUploadJenisLabel(),
        }, periode);
      } catch (err) {
        console.warn('Gagal mengintegrasikan data upload:', err);
      }
      
      // Simulasi panggilan API upload
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Simpan data upload ke localStorage
      const uploadDataKey = `recentUpload_${Date.now()}`;
      const uploadData = {
        uploadType: uploadType,
        actionType: config.actionType,
        data: validRows,
        timestamp: timestamp,
        totalRows: validRows.length,
        jenis: getUploadJenisLabel(),
      };
      
      saveUploadToLocalStorage(uploadDataKey, uploadData);

      // Create upload history entry
      const uploadHistory = {
        totalValid: validRows.length,
        totalInvalid: 0,
        totalData: validRows.length,
        statusValidasi: "Selesai",
        tanggalSelesai: timestamp,
        sumberData: "File Upload",
        jenis: getUploadJenisLabel(),
        action: "download",
        actionType: config.actionType,
      };

      return {
        uploadHistory,
        successMessage: config.successMessage(validRows.length),
        uploadKey: uploadDataKey,
      };
    } catch (error) {
      throw error;
    } finally {
      isUploading.value = false;
    }
  }

  /**
   * Save upload data to localStorage
   */
  function saveUploadToLocalStorage(key, uploadData) {
    try {
      const recentUploads = JSON.parse(localStorage.getItem('recentUploads') || '[]');
      recentUploads.unshift({
        key: key,
        ...uploadData
      });
      // Simpan maksimal 5 upload terakhir
      localStorage.setItem('recentUploads', JSON.stringify(recentUploads.slice(0, 5)));
    } catch (err) {
      console.warn('Gagal menyimpan data upload ke localStorage:', err);
    }
  }

  return {
    isUploading,
    recentUploadKey,
    submitUpload,
    getUploadConfig,
  };
}






