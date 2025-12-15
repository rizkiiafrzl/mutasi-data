/**
 * Composable untuk mengelola upload massal
 * Menangani logika upload, validasi, dan integrasi data
 */

import { ref, computed } from "vue";
import { useMassUploadValidator } from "./useMassUploadValidator.js";
import { fetchLocations, buildLokasiMap } from "../services/locationService.js";
import { fetchSebab, buildSebabMap } from "../services/sebabService.js";
import { fetchBanks, buildBankMap } from "../services/bankService.js";
import { uploadTypes, getTemplateConfig } from "../config/uploadConfig.js";
import { api } from "../services/api.js";

export function useMassUpload(selectedUploadType, tkMassalSubType) {
  // State untuk file dan validasi
  const selectedFile = ref(null);
  const validationSummary = ref(null);
  const invalidRows = ref([]);
  const validRows = ref([]);
  const isProcessingUpload = ref(false);
  const isUploading = ref(false);

  // Referensi data
  const lokasiOptions = ref([]);
  const lokasiMap = ref({});
  const sebabOptions = ref([]);
  const sebabMap = ref({});
  const bankOptions = ref([]);
  const bankMap = ref({});
  
  // Existing workers untuk validasi
  const existingWorkers = ref([]);

  // Computed untuk mendapatkan konfigurasi template
  const currentTemplateConfig = computed(() => {
    return getTemplateConfig(selectedUploadType.value, tkMassalSubType.value);
  });

  // Load existing workers untuk validasi
  async function loadExistingWorkers(periode = null) {
    try {
      // Ambil periode saat ini jika tidak ada
      if (!periode) {
        periode = await api.getCurrentPeriod();
      }
      
      if (!periode) {
        // Jika tidak ada periode, gunakan data dari getWorkers
        const workers = await api.getWorkers({ status: "AKTIF" });
        existingWorkers.value = workers || [];
        return;
      }
      
      // Ambil semua workers dari report periode tersebut
      const report = await api.getReportByPeriode(periode);
      if (report && report.workers && report.workers.data) {
        existingWorkers.value = report.workers.data || [];
      } else {
        existingWorkers.value = [];
      }
    } catch (error) {
      console.warn("Gagal memuat existing workers:", error);
      existingWorkers.value = [];
    }
  }

  // Helper functions untuk mencari existing workers
  function getExistingWorkerByNik(nik) {
    if (!nik || nik === "-") return null;
    return existingWorkers.value.find(w => 
      w.nik && w.nik !== "-" && w.nik === nik
    ) || null;
  }

  function getExistingWorkerByKpj(kpj) {
    if (!kpj || kpj === "-") return null;
    return existingWorkers.value.find(w => 
      w.kpj && w.kpj !== "-" && w.kpj === kpj
    ) || null;
  }

  function getExistingWorkerByKode(kode) {
    if (!kode) return null;
    // Cari berdasarkan ID_PEGAWAI, KODE_TK, atau noPegawai
    return existingWorkers.value.find(w => 
      (w.idPegawai && w.idPegawai === kode) ||
      (w.kodeTk && w.kodeTk === kode) ||
      (w.noPegawai && w.noPegawai === kode) ||
      (w.kpj && w.kpj === kode) ||
      (w.nik && w.nik === kode)
    ) || null;
  }

  // Validator config
  const getValidatorConfig = () => {
    const isTkBaru = selectedUploadType.value === "tk-massal" && tkMassalSubType.value === "mendaftar";
    const isTkLanjutan = selectedUploadType.value === "tk-massal" && tkMassalSubType.value === "lanjutan";
    const isKoreksi = selectedUploadType.value === "koreksi-massal";
    const isUpah = selectedUploadType.value === "upah-massal";
    const isTkNonaktif = selectedUploadType.value === "tk-nonaktif";
    
    return {
      templateHeaders: currentTemplateConfig.value.headers,
      requiredFields: currentTemplateConfig.value.requiredFields,
      dateFields: currentTemplateConfig.value.dateFields,
      getLokasiByKey: (key) => {
        const normalizedKey = normalizeString(key);
        return lokasiMap.value[normalizedKey];
      },
      getSebabByKey: (key) => {
        const normalizedKey = normalizeString(key);
        return sebabMap.value[normalizedKey];
      },
      getBankByKey: (key) => {
        const normalizedKey = normalizeString(key);
        return bankMap.value[normalizedKey];
      },
      isKoreksiMode: isKoreksi,
      isTkBaruMode: isTkBaru,
      isTkLanjutanMode: isTkLanjutan,
      isUpahMode: isUpah,
      isTkNonaktifMode: isTkNonaktif,
      existingWorkers: existingWorkers.value,
      getExistingWorkerByNik,
      getExistingWorkerByKpj,
      getExistingWorkerByKode,
    };
  };

  // Load referensi data
  async function loadLokasiData() {
    try {
      const data = await fetchLocations();
      lokasiOptions.value = data;
      lokasiMap.value = buildLokasiMap(data);
    } catch (error) {
      throw new Error(error.message || "Tidak dapat memuat lokasi pekerjaan.");
    }
  }

  async function loadSebabData() {
    try {
      const data = await fetchSebab();
      sebabOptions.value = data;
      sebabMap.value = buildSebabMap(data);
    } catch (error) {
      throw new Error(error.message || "Tidak dapat memuat referensi sebab nonaktif.");
    }
  }

  async function loadBankData() {
    try {
      const data = await fetchBanks();
      bankOptions.value = data;
      bankMap.value = buildBankMap(data);
    } catch (error) {
      throw new Error(error.message || "Tidak dapat memuat referensi bank.");
    }
  }

  // Load semua referensi yang diperlukan
  async function loadRequiredReferences() {
    await loadLokasiData();
    
    if (selectedUploadType.value === "tk-nonaktif") {
      await loadSebabData();
    }
    
    if (selectedUploadType.value === "koreksi-massal") {
      await loadBankData();
    }
  }

  // Get sheet name berdasarkan upload type
  function getSheetName() {
    if (selectedUploadType.value === "koreksi-massal") {
      return "update_data_tk";
    } else if (selectedUploadType.value === "upah-massal") {
      return "data_upah";
    } else if (selectedUploadType.value === "tk-nonaktif") {
      return "data_tk_na";
    } else if (selectedUploadType.value === "tk-massal" && tkMassalSubType.value === "lanjutan") {
      return "data_tk_lanjutan";
    }
    return "data_tk_baru";
  }

  // Process upload file
  async function processUpload(file, periode = null) {
    if (isProcessingUpload.value) return;
    if (!file) {
      throw new Error("Pilih file terlebih dahulu!");
    }

    // Load referensi data jika belum dimuat
    await loadRequiredReferences();
    
    // Load existing workers untuk validasi duplicate dan relasi
    await loadExistingWorkers(periode);

    try {
      isProcessingUpload.value = true;
      
      const validator = useMassUploadValidator(getValidatorConfig());
      const sheetName = getSheetName();
      
      const result = await validator.parseAndValidateFile(file, sheetName);
      
      validationSummary.value = result.summary;
      invalidRows.value = result.invalidRows;
      validRows.value = result.validRows;

      return result;
    } catch (error) {
      throw error;
    } finally {
      isProcessingUpload.value = false;
    }
  }

  // Reset validation state
  function resetValidation() {
    validationSummary.value = null;
    invalidRows.value = [];
    validRows.value = [];
  }

  // Reset file selection
  function resetFile() {
    selectedFile.value = null;
    resetValidation();
  }

  // Helper untuk normalize string
  function normalizeString(value) {
    if (value === undefined || value === null) return "";
    return value.toString().trim().toUpperCase();
  }

  return {
    // State
    selectedFile,
    validationSummary,
    invalidRows,
    validRows,
    isProcessingUpload,
    isUploading,
    existingWorkers,
    
    // Methods
    processUpload,
    resetValidation,
    resetFile,
    loadRequiredReferences,
    loadExistingWorkers,
    getValidatorConfig,
    getSheetName,
    getExistingWorkerByNik,
    getExistingWorkerByKpj,
    getExistingWorkerByKode,
  };
}

