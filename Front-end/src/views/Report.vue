<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <div class="text-sm text-gray-500">Memuat data...</div>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="flex justify-center items-center py-12">
        <div class="text-sm text-red-500">{{ error }}</div>
      </div>
      
      <!-- Content -->
      <template v-else-if="isDetailMode">
        <ContentContainer>
          <template #body>
            <div class="space-y-6">
              <!-- Summary Cards Component -->
              <SummaryCards 
                :summary-data="editSummaryData"
                :rincian-iuran="rincianIuran"
              />

              <!-- Toolbar & Action Buttons Component -->
              <WorkerToolbar
                v-model:search-query="searchQuery"
                v-model:status-filter="statusFilter"
                v-model:items-per-page="itemsPerPage"
                v-model:show-upload-dropdown="showUploadMassalDropdown"
                :items-per-page-options="itemsPerPageOptions"
                :is-recalculating="isRecalculatingContributions"
                :upload-options="uploadMassalOptions"
                :show-countdown="showContributionCountdown"
                :countdown-value="contributionCountdownValue"
                @add-worker="handleAddWorker"
                @upload-select="handleUploadMassalSelect"
                @recalculate="handleRecalculateContributions"
                @finalize="handleFinalisasiClick"
                @refresh="loadWorkersData"
              />

              <!-- Worker Table Component -->
              <WorkerTable
                :headers="employeeTableHeaders"
                :workers="employeeRows"
                :is-loading="isLoadingWorkers"
                :current-page="currentPage"
                :total-pages="totalPages"
                @worker-action="handleWorkerAction"
                @prev-page="handlePrevPage"
                @next-page="handleNextPage"
              />
            </div>
          </template>
        </ContentContainer>
      </template>
    </div>
  </div>

  <!-- Overlay untuk menutup dropdown saat klik di luar -->
  <div
    v-if="showUploadMassalDropdown"
    @click="showUploadMassalDropdown = false"
    class="fixed inset-0 z-40"
  ></div>

  <!-- Modals menggunakan components -->
  <Dialog
    header="Tambah Tenaga Kerja Individu"
    :isDialogOpen="showAddWorkerModal"
    @close="handleCancelAddWorker"
  >
    <template #body>
      <div class="flex gap-4 mb-6">
        <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-sm text-gray-700 leading-relaxed">
          Pekerja Baru yang didaftarkan setelah kejadian meninggal dunia atau kecelakaan kerja, maka biaya obat/rawat dan manfaat JKK-JKM lainnya menjadi tanggung jawab pemberi kerja.
        </p>
      </div>
      <CheckBox id="agree-statement" v-model="agreeStatement" @change="showWarning = false">
        Saya setuju dengan pernyataan di atas
      </CheckBox>
      <div v-if="showWarning" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
        Anda harus menyetujui pernyataan terlebih dahulu
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-3">
        <button @click="handleCancelAddWorker" class="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Batal</button>
        <button @click="() => handleContinueAddWorker(router, selectedPeriode)" class="px-5 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700">Lanjutkan</button>
      </div>
    </template>
  </Dialog>

  <WorkerDetailModal
    :show="showWorkerDetailModal"
    :worker="selectedWorkerDisplay"
    :contribution="selectedWorkerContribution"
    :active-tab="activeDetailTab"
    @close="handleCloseWorkerDetail"
    @nonaktifkan="handleOpenNonaktifConfirm"
  />

  <ConfirmationModal
    :is-open="showNonaktifConfirmModal"
    title="Konfirmasi Nonaktifkan"
    message="Apakah Anda yakin ingin menonaktifkan pekerja ini?"
    @confirm="handleConfirmNonaktifWorker"
    @close="handleCloseNonaktifConfirm"
  />

  <SuccessModal
    :is-open="showNonaktifSuccessModal"
    title="Berhasil"
    message="Pekerja berhasil dinonaktifkan"
    @close="() => handleCloseNonaktifSuccess(clearSelectedWorker)"
  />

  <SuccessModal
    :is-open="showNotificationModal"
    title="Pemberitahuan"
    message="Selamat datang di halaman Report"
    @close="handleNotificationOK"
  />

  <ConfirmationModal
    :is-open="showConfirmationModal"
    title="Konfirmasi"
    message="Apakah PK/BU ada perubahan data?"
    confirm-text="Ya"
    cancel-text="Tidak"
    @confirm="handleConfirmationYes"
    @cancel="handleConfirmationNo"
    @close="handleConfirmationNo"
  />

  <SuccessModal
    :is-open="showContributionSuccessModal"
    title="Berhasil"
    :message="contributionSuccessMessage"
    @close="handleCloseContributionSuccess"
  />

  <FinalisasiModal
    :show="showFinalisasiModal"
    :checklist="finalisasiChecklist"
    :error="finalisasiError"
    :periode="selectedPeriode"
    @close="handleFinalisasiCancel"
    @confirm="handleFinalisasiConfirm"
    @checklist-change="handleChecklistChange"
  />

  <SuccessModal
    :is-open="showFinalisasiSuccess"
    title="Finalisasi Berhasil"
    :message="`Laporan periode ${lastFinalisasiPeriode} berhasil difinalisasi.`"
    @close="() => handleCloseFinalisasiSuccess(router)"
  />
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

// Base Components
import ContentContainer from "../components/base/ContentContainer.vue";
import Dialog from "../components/base/Dialog.vue";
import CheckBox from "../components/base/CheckBox.vue";

// Modal Components
import SuccessModal from "../components/modals/SuccessModal.vue";
import ConfirmationModal from "../components/modals/ConfirmationModal.vue";

// Domain Components
import SummaryCards from "../components/domain/report/SummaryCards.vue";
import WorkerToolbar from "../components/domain/report/WorkerToolbar.vue";
import WorkerTable from "../components/domain/report/WorkerTable.vue";
import WorkerDetailModal from "../components/domain/report/WorkerDetailModal.vue";
import FinalisasiModal from "../components/domain/report/FinalisasiModal.vue";

// Services & Utils
import { api } from "../services/api.js";
import { DEFAULT_RISK_LEVEL } from "../utils/contributionCalculator.js";
import { convertPeriodeToKey } from "../utils/dataTransform.js";
import { navigateToMassal, getPeriodeFromRoute } from "../utils/routerHelpers.js";

// Composables
import { useReportData } from "../composables/report/useReportData.js";
import { useReportSummary } from "../composables/report/useReportSummary.js";
import { useReportFinalization } from "../composables/report/useReportFinalization.js";
import { useReportModals } from "../composables/report/useReportModals.js";
import { useReportRecalculation } from "../composables/report/useReportRecalculation.js";
import { useReportWatchers } from "../composables/report/useReportWatchers.js";
import { useWorkerList } from "../composables/workers/useWorkerList.js";
import { useWorkerDetail } from "../composables/workers/useWorkerDetail.js";
import { useWorkerTable } from "../composables/workers/useWorkerTable.js";

const route = useRoute();
const router = useRouter();

// State
const currentRiskLevel = ref(DEFAULT_RISK_LEVEL);
const selectedPeriode = ref("");
const isDetailMode = ref(false);
const showUploadMassalDropdown = ref(false);
const showFinalisasiModal = ref(false);
const itemsPerPage = ref(10);
const itemsPerPageOptions = [5, 10, 25, 50, 100];
const searchQuery = ref("");
const statusFilter = ref("all");
const editSummaryData = ref({ totalTenagaKerja: 0, totalUpahRapel: 0, totalIuran: 0, totalDenda: 0 });
const rincianIuran = ref([]);
const isLoading = ref(false);
const error = ref(null);

const uploadMassalOptions = [
  { id: "tk-massal", title: "TK Massal", description: "Upload TK Aktif Massal", icon: "mdi-account-multiple-plus" },
  { id: "koreksi-massal", title: "Koreksi Massal", description: "Upload Koreksi Data TK Massal", icon: "mdi-file-document-edit" },
  { id: "tk-nonaktif", title: "TK Nonaktif", description: "Upload Tenaga Kerja Nonaktif", icon: "mdi-account-minus" },
  { id: "upah-massal", title: "Upah Massal", description: "Upload Upah Massal dengan Preview & Log", icon: "mdi-cash-multiple" },
];

const employeeTableHeaders = ref(["NO", "NIK", "NAMA", "JK", "KPJ", "UPAH POKOK", "RAPEL", "TOTAL UPAH", "STATUS", "AKSI"]);

// Composables
const { calculateSummary } = useReportSummary();
const { checklist: finalisasiChecklist, error: finalisasiError, finalize: performFinalization, clearError: clearFinalisasiError } = useReportFinalization();
const { workers: employeeRowsRaw, isLoading: isLoadingWorkers, loadWorkers, filterWorkers: getFilteredWorkers } = useWorkerList();
const { selectedWorker, activeTab: activeDetailTab, workerDisplay: selectedWorkerDisplay, workerContribution: selectedWorkerContribution, setSelectedWorker, clearSelectedWorker } = useWorkerDetail();
const { showAddWorkerModal, agreeStatement, showWarning, showWorkerDetailModal, showNonaktifConfirmModal, showNonaktifSuccessModal, showNotificationModal, showConfirmationModal, showContributionSuccessModal, contributionSuccessMessage, showFinalisasiSuccess, lastFinalisasiPeriode, handleAddWorker, handleCancelAddWorker, handleContinueAddWorker, handleNotificationOK, handleConfirmationNo, handleOpenNonaktifConfirm, handleCloseNonaktifConfirm, handleConfirmNonaktifWorker, handleCloseNonaktifSuccess, handleCloseContributionSuccess, showContributionSuccess, handleCloseFinalisasiSuccess, showFinalisasiSuccessModal } = useReportModals();
const { isRecalculating: isRecalculatingContributions, showCountdown: showContributionCountdown, countdownValue: contributionCountdownValue, handleRecalculate } = useReportRecalculation();

const filterWorkers = () => getFilteredWorkers(searchQuery.value, statusFilter.value);
const { employeeRows, currentPage, totalPages, handlePrevPage, handleNextPage, resetToFirstPage } = useWorkerTable(filterWorkers, itemsPerPage);

const reportData = useReportData();
const newUploadData = reportData.newUploadData;

// Functions
function recalculateSummaryFromRows() {
  const summary = calculateSummary(employeeRowsRaw.value, currentRiskLevel.value, editSummaryData.value.totalDenda || 0);
  Object.assign(editSummaryData.value, summary);
  rincianIuran.value = summary.rincianIuran;
}

function handleUploadMassalSelect(uploadType) {
  showUploadMassalDropdown.value = false;
  navigateToMassal(router, uploadType, selectedPeriode.value || getPeriodeFromRoute(route));
}

async function handleConfirmationYes() {
  showConfirmationModal.value = false;
  try {
    await loadReportData(true);
    await loadWorkersData();
  } catch (err) {
    console.warn('Gagal memuat ulang data:', err);
  }
}

function handleFinalisasiClick() {
  showFinalisasiModal.value = true;
}

function handleFinalisasiCancel() {
  showFinalisasiModal.value = false;
  clearFinalisasiError();
}

async function handleFinalisasiConfirm() {
  const result = await performFinalization(selectedPeriode.value);
  if (result.success) {
    showFinalisasiModal.value = false;
    showFinalisasiSuccessModal(selectedPeriode.value);
    await loadReportData();
  }
}

function handleWorkerAction(worker) {
  setSelectedWorker(worker);
  showWorkerDetailModal.value = true;
}

function handleCloseWorkerDetail() {
  showWorkerDetailModal.value = false;
  clearSelectedWorker();
}

function handleChecklistChange() {
  clearFinalisasiError();
}

function handleRecalculateContributions() {
  handleRecalculate(loadReportData, loadWorkersData, recalculateSummaryFromRows, showContributionSuccess);
}

async function loadReportData(forceReload = false) {
  if (!selectedPeriode.value) return;
  isLoading.value = true;
  error.value = null;
  
  try {
    const periodeKey = convertPeriodeToKey(selectedPeriode.value);
    const shouldForceReload = forceReload || route.query.newUpload === 'true';
    const data = await api.getReportByPeriode(periodeKey, shouldForceReload);
    
    currentRiskLevel.value = data.riskLevel || DEFAULT_RISK_LEVEL;
    editSummaryData.value = { totalTenagaKerja: data.summary.totalTenagaKerja || 0, totalUpahRapel: data.summary.totalUpahRapel || 0, totalIuran: data.summary.totalIuran || 0, totalDenda: data.summary.totalDenda || 0 };
    rincianIuran.value = data.rincianIuran || [];
    
    if (data.finalisasi?.checklist) Object.assign(finalisasiChecklist.value, data.finalisasi.checklist);
    
    await loadWorkersData();
    recalculateSummaryFromRows();
  } catch (err) {
    error.value = err.message || 'Gagal memuat data laporan';
    router.push({ path: "/dashboard" });
  } finally {
    isLoading.value = false;
  }
}

async function loadWorkersData() {
  if (!selectedPeriode.value) return;
  await loadWorkers(selectedPeriode.value, employeeRowsRaw.value || []);
  resetToFirstPage();
  recalculateSummaryFromRows();
}

function loadNewUploadData() {
  if (reportData.newUploadData.value?.workers) {
    employeeRowsRaw.value = reportData.newUploadData.value.workers;
    recalculateSummaryFromRows();
  }
}

// Setup watchers
useReportWatchers(searchQuery, statusFilter, itemsPerPage, selectedPeriode, route, employeeRowsRaw, loadWorkersData, loadReportData, loadNewUploadData, resetToFirstPage, showNotificationModal);

// Initialize
onMounted(() => {
  const periode = getPeriodeFromRoute(route);
  if (periode) {
    selectedPeriode.value = periode;
    isDetailMode.value = true;
    loadReportData();
  }
});
</script>
