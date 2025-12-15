<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import Button from "../components/base/Button.vue";
import ContentContainer from "../components/base/ContentContainer.vue";
import SearchBar from "../components/base/SearchBar.vue";
import Table from "../components/base/Table.vue";
import Pagination from "../components/base/Pagination.vue";
import Chip from "../components/base/Chip.vue";
import Dialog from "../components/base/Dialog.vue";
import SuccessModal from "../components/modals/SuccessModal.vue";
import WarningModal from "../components/modals/WarningModal.vue";
import ConfirmationModal from "../components/modals/Confirmation.vue";
import { navigateToReport } from "../utils/routerHelpers.js";
import { downloadTemplateFile } from "../services/templateService.js";
import { uploadTypes } from "../config/uploadConfig.js";
import { useMassUpload } from "../composables/useMassUpload.js";
import { useUploadHandler } from "../composables/useUploadHandler.js";
import { useUploadHistory } from "../composables/useUploadHistory.js";
import { usePagination } from "../composables/shared/usePagination.js";

const router = useRouter();
const route = useRoute();

// State untuk jenis upload yang dipilih
const selectedUploadType = ref("tk-massal");
const fileInputRef = ref(null);
// State untuk pilihan TK Massal (Mendaftar atau Lanjutan)
const tkMassalSubType = ref("mendaftar"); // "mendaftar" atau "lanjutan"

// Modal states
const showWarningModal = ref(false);
const showSuccessModal = ref(false);
const showConfirmModal = ref(false);
const warningMessage = ref("");
const successMessage = ref("");
const confirmMessage = ref("");
const confirmAction = ref(null);
const confirmTitle = ref("");

// Gunakan uploadTypes dari config

// Gunakan composables untuk upload logic
const massUpload = useMassUpload(selectedUploadType, tkMassalSubType);
const uploadHandler = useUploadHandler();
const uploadHistory = useUploadHistory();

// Expose state dari composables
const selectedFile = massUpload.selectedFile;
const validationSummary = massUpload.validationSummary;
const invalidRows = massUpload.invalidRows;
const validRows = massUpload.validRows;
const isProcessingUpload = massUpload.isProcessingUpload;
const isUploading = uploadHandler.isUploading;
const recentUploadKey = uploadHandler.recentUploadKey;

// Gunakan history dari composable
const historyTableHeaders = uploadHistory.historyTableHeaders;
const historyTableData = uploadHistory.historyTableData;

// Pagination menggunakan composable
const { currentPage, totalPages, handlePrevPage, handleNextPage } = usePagination();

// Computed untuk mendapatkan upload type yang aktif
const activeUploadType = computed(() => {
  return uploadTypes.find((type) => type.id === selectedUploadType.value) || uploadTypes[0];
});

// Load referensi data menggunakan composable
async function loadRequiredReferences() {
  try {
    await massUpload.loadRequiredReferences();
  } catch (error) {
    warningMessage.value = error.message || "Gagal memuat referensi data.";
    showWarningModal.value = true;
  }
}

// Methods
function handleBack() {
  // Ambil periode dari query parameter jika ada
  const periode = route.query && route.query.periode ? route.query.periode : "";
  navigateToReport(router, periode);
}

function handleSuccessModalClose() {
  showSuccessModal.value = false;
  
  // Jika ada recentUploadKey, redirect ke Report dengan parameter
  if (recentUploadKey.value) {
    const periode = route.query && route.query.periode ? route.query.periode : "";
    navigateToReport(router, periode, {
      newUpload: 'true',
      uploadKey: recentUploadKey.value,
      uploadType: selectedUploadType.value
    });
    recentUploadKey.value = null; // Reset setelah redirect
  } else {
    // Jika tidak ada upload key, tetap redirect ke Report
    const periode = route.query && route.query.periode ? route.query.periode : "";
    navigateToReport(router, periode);
  }
}


function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    massUpload.resetValidation();
  }
}

function handleClearFile() {
  selectedFile.value = null;
  massUpload.resetFile();
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
}

// Watch untuk reset file saat sub-type berubah
watch(tkMassalSubType, () => {
  if (selectedFile.value) {
    massUpload.resetFile();
    if (fileInputRef.value) {
      fileInputRef.value.value = "";
    }
  }
});

async function handleUpload() {
  if (isProcessingUpload.value) return;
  if (!selectedFile.value) {
    warningMessage.value = "Pilih file terlebih dahulu!";
    showWarningModal.value = true;
    return;
  }

  try {
    // Ambil periode dari query parameter jika ada
    const periode = route.query && route.query.periode ? route.query.periode : null;
    const result = await massUpload.processUpload(selectedFile.value, periode);
    
    if (result.invalidRows.length) {
      // Tampilkan detail error di UI, tidak perlu modal
      // User bisa lihat detail error di section Validation Result
      warningMessage.value = `Ditemukan ${result.invalidRows.length} baris yang perlu diperbaiki sebelum upload. Silakan lihat detail error di bawah.`;
      showWarningModal.value = true;
    } else if (result.validRows.length) {
      await handleSubmitUpload();
    } else {
      warningMessage.value = "Tidak ada baris data yang dapat diproses.";
      showWarningModal.value = true;
    }
  } catch (error) {
    warningMessage.value = error.message || "Gagal memproses file upload.";
    showWarningModal.value = true;
  }
}

function getUploadJenisLabel() {
  if (selectedUploadType.value !== "tk-massal") {
    return activeUploadType.value ? activeUploadType.value.title : "Upload";
  }
  return tkMassalSubType.value === "lanjutan"
    ? "TK Lanjutan"
    : "TK Mendaftar";
}

async function handleSubmitUpload() {
  if (isUploading.value) return;
  if (!validationSummary.value || !validRows.value.length) {
    warningMessage.value = "Tidak ada data valid untuk diunggah.";
    showWarningModal.value = true;
    return;
  }
  if (invalidRows.value.length) {
    warningMessage.value =
      "Masih ada baris invalid. Mohon perbaiki sebelum mengunggah.";
    showWarningModal.value = true;
    return;
  }

  try {
    const periode = route.query && route.query.periode ? route.query.periode : null;
    const result = await uploadHandler.submitUpload(
      selectedUploadType.value,
      tkMassalSubType.value,
      validRows.value,
      getUploadJenisLabel,
      periode
    );

    // Tambahkan ke history
    uploadHistory.addHistoryEntry(result.uploadHistory);

    successMessage.value = result.successMessage;
    showSuccessModal.value = true;
    
    // Simpan upload data key untuk redirect
    recentUploadKey.value = result.uploadKey;
  } catch (error) {
    warningMessage.value =
      error.message || "Terjadi kesalahan saat mengunggah data.";
    showWarningModal.value = true;
  }
}

async function handleDownloadTemplate() {
  // Tentukan file template berdasarkan jenis upload
  let templateFileName = "";
  
  if (selectedUploadType.value === "tk-massal") {
    // Untuk TK Massal, pilih template berdasarkan sub-type
    templateFileName = tkMassalSubType.value === "lanjutan" 
      ? activeUploadType.value.templateLanjutanFile 
      : activeUploadType.value.templateFile;
  } else {
    templateFileName = activeUploadType.value.templateFile;
  }
  
  if (!templateFileName) {
    warningMessage.value = "Template tidak ditemukan untuk jenis upload ini.";
    showWarningModal.value = true;
    return;
  }
  
  try {
    await downloadTemplateFile(templateFileName);
    successMessage.value = `Template ${templateFileName} berhasil diunduh.`;
    showSuccessModal.value = true;
  } catch (error) {
    warningMessage.value = `Gagal mengunduh template: ${error.message}`;
    showWarningModal.value = true;
  }
}

function handleDownloadHistory(row) {
  // Logika download history di sini
  confirmTitle.value = "Download History";
  confirmMessage.value = `Apakah Anda yakin ingin mengunduh history untuk ${row.jenis}?`;
  confirmAction.value = () => {
    // TODO: Implement download history logic
    successMessage.value = `History untuk ${row.jenis} berhasil diunduh.`;
    showSuccessModal.value = true;
  };
  showConfirmModal.value = true;
}

function handleConfirmOK() {
  if (confirmAction.value) {
    confirmAction.value();
  }
  showConfirmModal.value = false;
  confirmAction.value = null;
}

// Pagination handlers sudah di-handle oleh composable usePagination

// Inisialisasi berdasarkan query parameter
onMounted(() => {
  if (route.query.type) {
    const validTypes = uploadTypes.map(t => t.id);
    if (validTypes.includes(route.query.type)) {
      selectedUploadType.value = route.query.type;
    }
  }
  // Load referensi data yang diperlukan
  loadRequiredReferences();
});

// History sudah dihandle di composable useUploadHistory
</script>

<template>
  <div class="bg-[#f8f9fa] text-[#1a1a1a] min-h-screen">
    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-6 py-6">
      <div class="space-y-6">
        <!-- Upload Section -->
        <div class="bg-white border border-gray-300 rounded-lg shadow-md">
          <!-- Header dengan background abu-abu -->
          <div class="bg-gray-200 border-b border-gray-300 px-6 py-3 rounded-t-lg">
            <div class="flex items-center justify-between">
              <!-- Tombol Kembali di Kiri -->
              <button @click="handleBack" class="text-gray-700 hover:text-gray-900 font-medium flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 md" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                <span class="hidden md:inline">Kembali</span>
              </button>
              
              <!-- Judul di Kanan -->
              <h2 class="text-lg font-semibold text-gray-800 uppercase">UPLOAD {{ activeUploadType.type.toUpperCase() }}</h2>
            </div>
          </div>
          <div class="px-6 pb-6 bg-white">
            <div class="mt-4 space-y-6">
              <!-- Instructions -->
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 class="font-semibold text-blue-900 mb-3">Petunjuk Upload:</h3>
                <ol class="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li v-for="(instruction, index) in activeUploadType.instructions" :key="index" class="leading-relaxed">
                    <span v-if="instruction.includes('tidak dalam status meninggal')" class="text-red-600 font-semibold">{{ instruction }}</span>
                    <span v-else-if="instruction.includes('bertanggungjawab')" class="text-red-600 font-semibold">{{ instruction }}</span>
                    <span v-else>{{ instruction }}</span>
                  </li>
                </ol>
              </div>

              <div class="flex flex-col md:flex-row gap-6">
                <!-- Pilihan Upload -->
                <div v-if="selectedUploadType === 'tk-massal'" class="flex-1">
                  <label class="block text-xs text-gray-500 mb-1 font-medium">Pilihan Upload</label>

                  <div class="relative">
                    <select
                      v-model="tkMassalSubType"
                      class="w-full flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-md bg-white shadow-sm 
                            focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none pr-10"
                    >
                      <option value="mendaftar">Upload TK Mendaftar</option>
                      <option value="lanjutan">Upload TK Lanjutan</option>
                    </select>

                    <!-- Custom dropdown icon (tidak mepet) -->
                    <svg xmlns="http://www.w3.org/2000/svg"
                      class="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <!-- File Input -->
                <div class="flex-1">
                  <label class="block text-xs text-gray-500 mb-1 font-medium">File Upload</label>
                  <div class="flex items-center gap-3">
                    <div class="flex-1 relative">
                      <input ref="fileInputRef" type="file" accept=".xls,.xlsx" @change="handleFileSelect" class="hidden" id="file-upload" />
                      <label
                        for="file-upload"
                        class="flex items-center gap-2 w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                <span class="text-gray-500">{{ selectedFile?.value?.name || selectedFile?.name || "Choose files To Upload" }}</span>
                      </label>
                    </div>

                    <button
                      v-if="selectedFile?.value || selectedFile"
                      @click="handleClearFile"
                      class="px-3 py-2.5 text-gray-600 hover:text-gray-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <!-- Action Buttons -->
                <div class="flex flex-col sm:flex-row gap-3">
                  <button
                @click="handleUpload"
                :disabled="isProcessingUpload"
                class="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-md shadow-md hover:shadow-lg transition-all duration-200 text-sm uppercase disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                <span>{{ isProcessingUpload ? "MENGUNGGAH..." : "UPLOAD" }}</span>
                  </button>
                  <button
                    @click="handleDownloadTemplate"
                    class="flex items-center justify-center gap-2 bg-white border-2 border-green-600 text-green-600 hover:bg-green-50 font-semibold py-3 px-6 rounded-md shadow-sm hover:shadow-md transition-all duration-200 text-sm uppercase"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>DOWNLOAD TEMPLATE{{ selectedUploadType === 'tk-massal' && tkMassalSubType === 'mendaftar' ? ' MENDAFTAR' : selectedUploadType === 'tk-massal' && tkMassalSubType === 'lanjutan' ? ' LANJUTAN' : '' }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- History Section (untuk TK Massal dan Upah Massal) -->
        <div v-if="activeUploadType.showHistory" class="bg-white border border-gray-300 rounded-lg shadow-md">
          <!-- Header dengan background abu-abu -->
          <div class="bg-gray-200 border-b border-gray-300 px-6 py-3 rounded-t-lg">
            <div class="flex items-center justify-between">
              <!-- Judul di Kanan -->
              <h2 class="text-lg font-semibold text-gray-800 uppercase">List History Upload TK</h2>
            </div>
          </div>
          <div class="px-6 pb-6 bg-white">
            <div class="mt-4 space-y-4">
              <!-- Warning Box -->
              <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p class="text-sm text-orange-800">
                  Untuk melihat daftar upload yang gagal, klik tombol "Download" pada tabel history upload di bawah ini. Upload ulang file menggunakan form di atas.
                </p>
              </div>

              <!-- Table Controls -->
              <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div class="flex items-center gap-2">
                  <label class="text-sm text-gray-600">Show entries</label>
                  <select class="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white">
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                    <option>100</option>
                  </select>
                </div>
                <div class="w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Q Search:"
                    class="w-full px-4 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <!-- Table -->
              <Table :header="historyTableHeaders" :data="historyTableData" :customColumns="['action']">
                <template #cell-action="{ row }">
                  <div class="flex justify-center">
                    <button
                      @click="handleDownloadHistory(row)"
                      class="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 rounded-md transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>Download</span>
                    </button>
                  </div>
                </template>
              </Table>

              <Pagination
                :currentPage="currentPage"
                :totalPages="totalPages"
                @prev="handlePrevPage"
                @next="handleNextPage"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Peringatan -->
    <WarningModal
      :is-open="showWarningModal"
      :message="warningMessage"
      @close="showWarningModal = false"
    />

    <!-- Modal Konfirmasi -->
    <ConfirmationModal
      :is-open="showConfirmModal"
      :title="confirmTitle"
      :message="confirmMessage"
      icon="info"
      @confirm="handleConfirmOK"
      @close="showConfirmModal = false"
    />

    <!-- Modal Berhasil -->
    <SuccessModal
      :is-open="showSuccessModal"
      :message="successMessage"
      @close="handleSuccessModalClose"
    />
  </div>
</template>

