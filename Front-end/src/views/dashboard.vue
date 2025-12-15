<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import ContentContainer from "../components/base/ContentContainer.vue";
import Table from "../components/Table.vue";
import Pagination from "../components/Pagination.vue";
import Chip from "../components/Chip.vue";
import Dialog from "../components/Dialog.vue";
import Button from "../components/base/Button.vue";
import Card from "../components/base/Card.vue";
import ConfirmationModal from "../components/modals/ConfirmationModal.vue";
import { api } from "../services/api.js";
import { formatCurrency } from "../utils/formatters.js";
import { openReportPrintPreview, downloadReportWorkbook } from "../utils/reportExport.js";
import { usePagination } from "../composables/usePagination.js";

// Data untuk Riwayat Laporan (dari API)
const reportHistoryDataRaw = ref([]);

// Loading & Error states
const isLoading = ref(false);
const error = ref(null);

// Header untuk tabel
const tableHeaders = ref([
  "PERIODE",
  "JUMLAH TK",
  "NOMINAL IURAN (Rp)",
  "NOMINAL DENDA (Rp)",
  "STATUS",
  "AKSI",
]);

// Format data untuk tabel dengan mapping ke header
const reportHistoryData = computed(() => {
  if (!reportHistoryDataRaw.value || reportHistoryDataRaw.value.length === 0) {
    return [];
  }
  return reportHistoryDataRaw.value.map((row) => ({
    periode: row.periode,
    periodeKey: row.periodeRaw || row.original?.periode || row.periode,
    "jumlah tk": row.jumlahTk,
    "nominal iuran (rp)": formatCurrency(row.nominalIuran),
    "nominal denda (rp)": formatCurrency(row.nominalDenda),
    status: row.status,
    aksi: row.actions, // Untuk slot
    actions: row.actions, // Untuk akses di template
  }));
});

// Pagination menggunakan composable
// loadHistoryData akan didefinisikan di bawah, jadi kita gunakan arrow function
let loadHistoryDataRef = null;
const { currentPage, totalPages, handlePrevPage, handleNextPage } = usePagination({
  loadDataFunction: () => {
    if (loadHistoryDataRef) {
      loadHistoryDataRef();
    }
  },
});

// Data untuk summary card (dari API)
const summaryData = ref({
  kodeTagihan: "",
  totalIuranDanDenda: 0,
  sisaPembayaran: 0, // Note: JSON menggunakan 'sisaPembayaran' bukan 'sisaPembayaranIuranSebelumnya'
  totalTagihan: 0,
});

// Data untuk dropdown sorting dan filter
const itemsPerPage = ref(10);
const itemsPerPageOptions = [5, 10, 25, 50, 100];
const statusFilter = ref("all");
const statusFilterOptions = [
  { value: "all", label: "Semua" },
  { value: "DRAFT", label: "Draft" },
  { value: "APPROVAL", label: "Approval" },
  { value: "FINAL", label: "Final" },
  { value: "POSTING", label: "Posting" },
];

// Router
const router = useRouter();

// Modal states
const showCetakModal = ref(false);
const showHapusModal = ref(false);
const showDownloadModal = ref(false);
const selectedPeriode = ref("");
const selectedPeriodeKey = ref("");
const isCreatingReport = ref(false);
const isDeletingReport = ref(false);
const isPrintingReport = ref(false);
const isDownloadingReport = ref(false);

/* ================================
   ⚙️ METHODS
   ================================ */
async function handleNewReport() {
  if (isCreatingReport.value) return;
  isCreatingReport.value = true;
  try {
    const result = await api.createNewReport();
    await loadHistoryData();
    // Arahkan langsung ke halaman report periode baru
    router.push({
      path: "/report",
      query: { periode: result.periodeDisplay, from: "dashboard", newlyCreated: "true" },
    });
  } catch (err) {
    error.value = err.message || "Gagal membuat laporan baru";
  } finally {
    isCreatingReport.value = false;
  }
}

function setSelectedPeriodeContext(row, fallbackPeriode = "") {
  if (row) {
    selectedPeriode.value = row.periode || row.periodeDisplay || fallbackPeriode || "";
    selectedPeriodeKey.value = row.periodeKey || row.original?.periode || row.periode || fallbackPeriode || "";
  } else {
    selectedPeriode.value = fallbackPeriode || "";
    selectedPeriodeKey.value = fallbackPeriode || "";
  }
}

function handleCetak(row) {
  setSelectedPeriodeContext(row);
  showCetakModal.value = true;
} 

function handleHapus(row) {
  setSelectedPeriodeContext(row);
  showHapusModal.value = true;
}

function handleDownload(row) {
  setSelectedPeriodeContext(row);
  showDownloadModal.value = true;
}

async function handleCetakConfirm() {
  if (isPrintingReport.value) return;
  try {
    isPrintingReport.value = true;
    const periode = selectedPeriodeKey.value || selectedPeriode.value;
    if (!periode) {
      throw new Error("Periode laporan tidak ditemukan.");
    }
    const report = await api.getReportByPeriode(periode);
    openReportPrintPreview(report, selectedPeriode.value);
  } catch (err) {
    console.error(err);
    error.value = err.message || "Gagal mencetak laporan";
  } finally {
    isPrintingReport.value = false;
    showCetakModal.value = false;
  }
}

async function handleHapusConfirm() {
  if (isDeletingReport.value || !selectedPeriodeKey.value) return;
  try {
    isDeletingReport.value = true;
    await api.deleteReport(selectedPeriodeKey.value);
    showHapusModal.value = false;
    await loadHistoryData();
  } catch (err) {
    error.value = err.message || "Gagal menghapus laporan";
  } finally {
    isDeletingReport.value = false;
  }
}

async function handleDownloadConfirm() {
  if (isDownloadingReport.value) return;
  try {
    isDownloadingReport.value = true;
    const periode = selectedPeriodeKey.value || selectedPeriode.value;
    if (!periode) {
      throw new Error("Periode laporan tidak ditemukan.");
    }
    const report = await api.getReportByPeriode(periode);
    const fileName = `laporan-${periode.replace('/', '-')}.xlsx`;
    downloadReportWorkbook(report, fileName);
  } catch (err) {
    console.error(err);
    error.value = err.message || "Gagal mengunduh laporan";
  } finally {
    isDownloadingReport.value = false;
    showDownloadModal.value = false;
  }
}

function handleEdit(periode) {
  router.push({ path: "/report", query: { periode, from: 'dashboard' } });
}

// Pagination handlers sudah di-handle oleh composable usePagination

// Load summary data dari API
async function loadSummaryData() {
  try {
    const summary = await api.getDashboardSummary();
    summaryData.value = {
      kodeTagihan: summary.kodeTagihan || "",
      totalIuranDanDenda: summary.totalIuranDanDenda || 0,
      sisaPembayaran: summary.sisaPembayaran || 0,
      totalTagihan: summary.totalTagihan || 0,
    };
  } catch (err) {
    error.value = err.message || 'Gagal memuat data summary';
  }
}

// Load history data dari API
async function loadHistoryData(forceReload = false) {
  isLoading.value = true;
  error.value = null;
  try {
    const historyData = await api.getDashboardHistory(
      currentPage.value,
      itemsPerPage.value,
      statusFilter.value,
      forceReload
    );
    reportHistoryDataRaw.value = historyData.data || [];
    currentPage.value = historyData.pagination?.page || 1;
    totalPages.value = historyData.pagination?.totalPages || 1;
  } catch (err) {
    error.value = err.message || 'Gagal memuat data history';
    reportHistoryDataRaw.value = [];
  } finally {
    isLoading.value = false;
  }
}

// Assign function reference untuk pagination
loadHistoryDataRef = loadHistoryData;

// Watch untuk filter dan items per page
watch([statusFilter, itemsPerPage], () => {
  currentPage.value = 1; // Reset ke halaman pertama saat filter berubah
  loadHistoryData();
});

// Watch untuk route changes (untuk refresh setelah upload)
watch(() => router.currentRoute.value.path, (newPath) => {
  if (newPath === '/dashboard') {
    // Refresh data ketika kembali ke dashboard
    loadHistoryData(true);
    loadSummaryData();
  }
}, { immediate: false });

// Load data saat component mount
onMounted(async () => {
  isLoading.value = true;
  error.value = null;
  try {
    await Promise.all([
      loadSummaryData(),
      loadHistoryData(true) // Force reload saat mount untuk mendapatkan data terbaru
    ]);
  } catch (err) {
    error.value = err.message || 'Gagal memuat data';
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="bg-[#f8f9fa] text-[#1a1a1a] min-h-screen p-4">
    <!-- Container untuk semua card dengan spacing konsisten -->
    <div class="max-w-7xl mx-auto">
      <!-- Judul di tengah paling atas -->
      <div class="text-center mb-6">
        <h1 class="text-4xl font-bold text-gray-800">Mutasi Data</h1>
      </div>

      <!-- Layout stacked: Card Mutasi Data di atas, Table di bawah -->
      <div class="space-y-4">
        <!-- Card Summary Data -->
          <ContentContainer>
            <template #body>
              <div class="space-y-0">
                <div class="flex justify-between items-center py-3 border-b border-gray-200">
                  <span class="text-sm font-medium text-gray-600">Kode Tagihan</span>
                  <span class="text-base font-medium text-gray-900">{{ summaryData.kodeTagihan }}</span>
                </div>
                <div class="flex justify-between items-center py-3 border-b border-gray-200">
                  <span class="text-sm font-medium text-gray-600">Total Iuran dan Denda</span>
                  <span class="text-base font-medium text-gray-900">{{ formatCurrency(summaryData.totalIuranDanDenda) }}</span>
                </div>
                <div class="flex justify-between items-center py-3 border-b border-gray-200">
                  <span class="text-sm font-medium text-gray-600">Sisa Pembayaran Iuran Sebelumnya</span>
                  <span class="text-base font-medium text-gray-900">{{ formatCurrency(summaryData.sisaPembayaran) }}</span>
                </div>
                <div class="flex justify-between items-center py-3">
                  <span class="text-sm font-medium text-gray-600">Total Tagihan</span>
                  <span class="text-base font-medium text-gray-900">{{ formatCurrency(summaryData.totalTagihan) }}</span>
                </div>
              </div>
            </template>
          </ContentContainer>
          <!-- Tabel Riwayat Laporan -->
          <ContentContainer>
            <template #action>
              <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between w-full">
                <button
                  @click="handleNewReport"
                  class="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-5 rounded-md shadow-md hover:shadow-lg transition-all duration-200 text-base uppercase whitespace-nowrap"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span>BUAT LAPORAN BULANAN</span>
                </button>

                <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  <div class="relative">
                    <label class="block text-[10px] text-gray-500 mb-1 font-medium">Filter Status</label>
                    <div class="relative">
                      <select
                        v-model="statusFilter"
                        class="w-full px-4 py-2.5 text-md border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none pr-10"
                      >
                        <option
                          v-for="option in statusFilterOptions"
                          :key="option.value"
                          :value="option.value"
                        >
                          {{ option.label }}
                        </option>
                      </select>
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  <div class="relative">
                    <label class="block text-[10px] text-gray-500 mb-1 font-medium">Items Per Page</label>
                    <div class="relative">
                      <select
                        v-model="itemsPerPage"
                        class="w-full px-4 py-2.5 text-md border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none pr-10"
                      >
                        <option
                          v-for="option in itemsPerPageOptions"
                          :key="option"
                          :value="option"
                        >
                          {{ option }}
                        </option>
                      </select>
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <template #body>
              <!-- Loading State -->
              <div v-if="isLoading" class="flex justify-center items-center py-12">
                <div class="text-sm text-gray-500">Memuat data...</div>
              </div>
              
              <!-- Error State -->
              <div v-else-if="error" class="flex justify-center items-center py-12">
                <div class="text-sm text-red-500">{{ error }}</div>
              </div>
              
              <!-- Empty State -->
              <div v-else-if="!isLoading && reportHistoryData.length === 0" class="flex justify-center items-center py-12">
                <div class="text-sm text-gray-500">Tidak ada data laporan</div>
              </div>
              
              <!-- Table -->
              <template v-else-if="!isLoading && reportHistoryData.length > 0">
              <Table
                :header="tableHeaders"
                :data="reportHistoryData"
                :customColumns="[ 'status', 'aksi']"
                :column-widths="{
                  'periode': 'w-24',
                  'jumlah tk': 'w-24',
                  'nominal iuran (rp)': 'w-44',
                  'nominal denda (rp)': 'w-40',
                  'status': 'w-28',
                  'aksi': 'w-56'
                }"
              >
                <template #cell-status="{ row }">
                  <div class="flex justify-center">
                    <Chip
                      :label="row.status"
                      :variant="row.status === 'FINAL' ? 'final' : row.status === 'APPROVAL' ? 'approval' : row.status === 'POSTING' ? 'posting' : 'draft'"
                    />
                  </div>
                </template>

                <template #cell-aksi="{ row }">
                  <div class="flex justify-center items-center gap-3">
                    <button
                      v-if="row.actions && row.actions.includes('Edit')"
                      @click="handleEdit(row.periode)"
                      class="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 rounded-md transition-colors"
                      title="Edit"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      <span>EDIT</span>
                    </button>
                    
                    <button
                      v-if="row.actions && row.actions.includes('Cetak')"
                      @click="handleCetak(row)"
                      class="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 rounded-md transition-colors"
                      title="Cetak"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                        />
                      </svg>
                      <span>CETAK</span>
                    </button>

                    <button
                      v-if="row.actions && row.actions.includes('Hapus')"
                      @click="handleHapus(row)"
                      class="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 rounded-md transition-colors"
                      title="Hapus"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>HAPUS</span>
                    </button>

                    <button
                      v-if="row.actions && row.actions.includes('download')"
                      @click="handleDownload(row)"
                      class="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 rounded-md transition-colors"
                      title="Download"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      <span>DOWNLOAD</span>
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
              </template>
            </template>
          </ContentContainer>
      </div>
    </div>

    <!-- Modal Cetak -->
    <ConfirmationModal
      :is-open="showCetakModal"
      title="Cetak Laporan"
      :message="`Apakah Anda yakin ingin mencetak laporan periode <strong>${selectedPeriode}</strong>?`"
      icon="print"
      confirm-text="Cetak"
      variant="blue"
      :loading="isPrintingReport"
      @confirm="handleCetakConfirm"
      @close="showCetakModal = false"
    />

    <!-- Modal Hapus -->
    <ConfirmationModal
      :is-open="showHapusModal"
      title="Hapus Laporan"
      :message="`Apakah Anda yakin ingin menghapus laporan periode <strong>${selectedPeriode}</strong>? Tindakan ini tidak dapat dibatalkan.`"
      icon="danger"
      confirm-text="Hapus"
      variant="red"
      :loading="isDeletingReport"
      loading-text="Menghapus..."
      @confirm="handleHapusConfirm"
      @close="showHapusModal = false"
    />

    <!-- Modal Download -->
    <ConfirmationModal
      :is-open="showDownloadModal"
      title="Download Laporan"
      :message="`Apakah Anda yakin ingin mengunduh laporan periode <strong>${selectedPeriode}</strong>?`"
      icon="download"
      confirm-text="Download"
      variant="blue"
      :loading="isDownloadingReport"
      loading-text="Menyiapkan..."
      @confirm="handleDownloadConfirm"
      @close="showDownloadModal = false"
    />
  </div>
</template>
