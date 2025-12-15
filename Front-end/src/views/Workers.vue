<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import ContentContainer from "../components/base/ContentContainer.vue";
import Button from "../components/base/Button.vue";
import Dialog from "../components/Dialog.vue";
import SuccessModal from "../components/modals/SuccessModal.vue";
import TextField from "../components/TextField.vue";
import TextArea from "../components/TextArea.vue";
import SearchBar from "../components/base/SearchBar.vue";
import Table from "../components/base/Table.vue";
import Pagination from "../components/base/Pagination.vue";
import Chip from "../components/base/Chip.vue";
import { api } from "../services/api.js";
import { convertPeriodeToKey } from "../utils/dataTransform.js";
import { navigateToReport } from "../utils/routerHelpers.js";

const router = useRouter();
const route = useRoute();

// Modal BPJS Ketenagakerjaan
const showBPJSModal = ref(false);
const hasBPJSCard = ref(null); // null = belum pilih, true = sudah, false = belum
const kpjNumber = ref("");
const showApprovalModal = ref(false);

// Peringatan inline (tanpa popup baru)
const bpjsWarning = ref("");
const showSuccessModal = ref(false);
const successMessage = ref("");
const submissionError = ref("");
const isSavingWorker = ref(false);

// Step control
const currentStep = ref(1); // 1 = Form singkat, 2 = Form rinci

// Form 1: Pendaftaran singkat
const simpleForm = ref({
  nik: "",
  noPasspor: "",
  masaBerlaku: "",
  namaLengkap: "",
  tanggalLahir: "",
  kewarganegaraan: "WNI",
  captchaInput: "",
});

// Captcha sederhana (dummy)
const captcha = ref(String(Math.floor(1000 + Math.random() * 9000)));
function refreshCaptcha() {
  captcha.value = String(Math.floor(1000 + Math.random() * 9000));
  simpleForm.value.captchaInput = "";
}

// Validasi sederhana form 1
const simpleErrors = ref({});
function validateSimple() {
  const errs = {};
  // Validasi berdasarkan kewarganegaraan
  if (simpleForm.value.kewarganegaraan === "WNI") {
    if (!simpleForm.value.nik || simpleForm.value.nik.length < 8) {
      errs.nik = "Wajib diisi";
    }
  } else if (simpleForm.value.kewarganegaraan === "WNA") {
    if (!simpleForm.value.noPasspor) {
      errs.noPasspor = "Wajib diisi";
    }
    if (!simpleForm.value.masaBerlaku) {
      errs.masaBerlaku = "Wajib diisi";
    }
  }
  if (!simpleForm.value.namaLengkap) {
    errs.namaLengkap = "Wajib diisi";
  }
  if (!simpleForm.value.tanggalLahir) {
    errs.tanggalLahir = "Wajib diisi";
  }
  if (!simpleForm.value.captchaInput || simpleForm.value.captchaInput !== captcha.value) {
    errs.captcha = "Captcha tidak sesuai";
  }
  simpleErrors.value = errs;
  return Object.keys(errs).length === 0;
}

function handleSimpleSubmit() {
  if (!validateSimple()) return;
  showApprovalModal.value = true;
}

function handleBack() {
  if (currentStep.value > 1) {
    currentStep.value = 1;
  } else {
    const periode = route.query && route.query.periode ? route.query.periode : "";
    navigateToReport(router, periode);
  }
}

// Form 2: Form rinci tenaga kerja
const detailForm = ref({
  statusPegawai: "",
  tanggalAwalKerja: "",
  tanggalAkhirKontrak: "",
  tempatLahir: "",
  lokasiPekerjaan: "",
  upah: "",
  alamat: "",
  kpj: "",
  kabupaten: "",
  noPegawai: "",
  kodePos: "",
  ibuKandung: "",
  noTelpRumah: "",
  golDarah: "",
  handphone: "",
  jenisKelamin: "",
  npwp: "",
  statusKawin: "",
  email: "",
});

const detailErrors = ref({});
function validateDetail() {
  const errs = {};
  // Minimal required fields based on screenshot
  const requiredFields = [
    "statusPegawai",
    "tanggalAwalKerja",
    "tempatLahir",
    "lokasiPekerjaan",
    "upah",
    "alamat",
    "kabupaten",
    "kodePos",
    "ibuKandung",
    "golDarah",
    "jenisKelamin",
    "statusKawin",
  ];
  requiredFields.forEach((key) => {
    if (!detailForm.value[key]) errs[key] = "Wajib diisi";
  });
  if (detailForm.value.upah && Number(detailForm.value.upah) < 1) {
    errs.upah = "Wajib diisi";
  }
  detailErrors.value = errs;
  return Object.keys(errs).length === 0;
}

async function handleDetailSubmit() {
  submissionError.value = "";
  if (!validateDetail()) return;
  if (isSavingWorker.value) return;

  let periode = route.query && route.query.periode ? route.query.periode : "";

  if (!periode) {
    try {
      periode = await api.getCurrentPeriod();
    } catch (err) {
      // Abaikan, akan ditangani oleh validasi di bawah
    }
  }

  if (!periode) {
    submissionError.value = "Periode laporan tidak ditemukan.";
    return;
  }

  const jk =
    detailForm.value.jenisKelamin && detailForm.value.jenisKelamin.toLowerCase().includes("perempuan")
      ? "Perempuan"
      : "Laki-laki";

  const upahPokok = Number(detailForm.value.upah) || 0;
  const rapel = Number(detailForm.value.rapel || 0);
  const totalUpah = upahPokok + rapel;

  const nikValue =
    simpleForm.value.kewarganegaraan === "WNI"
      ? simpleForm.value.nik
      : simpleForm.value.noPasspor || "-";

  const workerPayload = {
    nik: nikValue,
    nama: simpleForm.value.namaLengkap || "Tenaga Kerja Baru",
    jk,
    kpj: detailForm.value.kpj,
    upahPokok,
    rapel,
    totalUpah,
    status: "AKTIF",
  };

  try {
    isSavingWorker.value = true;
    const result = await api.addWorkerToReport(periode, workerPayload);
    successMessage.value = `Tenaga kerja ${result.worker.nama} berhasil ditambahkan ke laporan periode ${periode}.`;
    showSuccessModal.value = true;
  } catch (err) {
    submissionError.value = err.message || "Gagal menyimpan data tenaga kerja.";
  } finally {
    isSavingWorker.value = false;
  }
}

function handleSuccessOK() {
  showSuccessModal.value = false;
  const periode = route.query && route.query.periode ? route.query.periode : "";
  navigateToReport(router, periode);
}

function handleBPJSCardSelect(hasCard) {
  hasBPJSCard.value = hasCard;
  bpjsWarning.value = "";
  if (hasCard) {
    // Jika sudah punya, fokus ke input KPJ
    setTimeout(() => {
      document.getElementById("kpj-input")?.focus();
    }, 100);
  }
}

function handleContinueBPJS() {
  if (hasBPJSCard.value === null) {
    bpjsWarning.value = "Pilih terlebih dahulu apakah tenaga kerja sudah memiliki kartu BPJS Ketenagakerjaan";
    return;
  }
  if (hasBPJSCard.value && !kpjNumber.value.trim()) {
    bpjsWarning.value = "Masukkan nomor KPJ terlebih dahulu";
    return;
  }
  // Simpan data KPJ ke form jika ada
  if (hasBPJSCard.value && kpjNumber.value) {
    detailForm.value.kpj = kpjNumber.value;
  }
  bpjsWarning.value = "";
  showBPJSModal.value = false;
}

function handleCloseBPJS() {
  showBPJSModal.value = false;
}

function handleApprovalAccept() {
  showApprovalModal.value = false;
  currentStep.value = 2;
}

function handleApprovalDecline() {
  showApprovalModal.value = false;
}

// Tampilkan modal saat component mount
onMounted(() => {
  showBPJSModal.value = true;
});
</script>

<template>
  <div class="bg-[#f8f9fa] text-[#1a1a1a] min-h-screen p-4">
    <div class="max-w-7xl mx-auto">
      <div class="mb-6 flex items-center justify-between">
        <Button
            @click="handleBack"
            use-custom-class
            custom-class="flex items-center gap-2 px-1 py-1 h-[42px] text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
        >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 md" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span class="hidden md:inline">Kembali</span>
        </Button>
        <h1 class="text-2xl md:text-3xl font-bold text-gray-800">Form Tenaga Kerja</h1>
      </div>

      <!-- STEP 1: FORM PENDAFTARAN SINGKAT -->
      <ContentContainer v-if="currentStep === 1">
        <template #body>
          <div class="space-y-6">
            <p class="text-sm text-gray-700">Silakan masukkan data sesuai dengan KTP!</p>
            
            <!-- Sub-label berdasarkan kewarganegaraan -->
            <p class="text-gray-600 text-sm font-medium mb-2">
              {{ simpleForm.kewarganegaraan === 'WNI' ? 'Data Identitas' : 'Data Dokumen Keimigrasian' }}
            </p>
            
            <!-- Baris 1: NIK/No Passpor dan Nama Lengkap (2 kolom) -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- NIK (muncul jika WNI) -->
              <div v-if="simpleForm.kewarganegaraan === 'WNI'">
                <label class="block text-sm font-medium text-gray-600 mb-1.5">NIK</label>
                <TextField
                  v-model="simpleForm.nik"
                  use-custom-class
                  custom-class="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md bg-white shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400 transition-all duration-150"
                  placeholder="NIK"
                />
                <p v-if="simpleErrors.nik" class="text-xs text-red-600 mt-1">{{ simpleErrors.nik }}</p>
              </div>
              
              <!-- No Passpor (muncul jika WNA) -->
              <div v-if="simpleForm.kewarganegaraan === 'WNA'">
                <label class="block text-sm font-medium text-gray-600 mb-1.5">No Passpor</label>
                <TextField
                  v-model="simpleForm.noPasspor"
                  use-custom-class
                  custom-class="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md bg-white shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400 transition-all duration-150"
                  placeholder="No Passpor"
                />
                <p v-if="simpleErrors.noPasspor" class="text-xs text-red-600 mt-1">{{ simpleErrors.noPasspor }}</p>
              </div>
              
              <!-- Nama Lengkap (selalu muncul) -->
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1.5">Nama Lengkap</label>
                <TextField
                  v-model="simpleForm.namaLengkap"
                  use-custom-class
                  custom-class="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md bg-white shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400 transition-all duration-150"
                  placeholder="Nama Lengkap"
                />
                <p v-if="simpleErrors.namaLengkap" class="text-xs text-red-600 mt-1">{{ simpleErrors.namaLengkap }}</p>
              </div>
            </div>

            <!-- Baris 2: Masa Berlaku (jika WNA) dan Tanggal Lahir (2 kolom) -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Masa Berlaku (muncul jika WNA) -->
              <div v-if="simpleForm.kewarganegaraan === 'WNA'">
                <label class="block text-sm font-medium text-gray-600 mb-1.5">Masa Berlaku</label>
                <div class="relative">
                  <input
                    v-model="simpleForm.masaBerlaku"
                    type="date"
                    class="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400 transition-all duration-150"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p v-if="simpleErrors.masaBerlaku" class="text-xs text-red-600 mt-1">{{ simpleErrors.masaBerlaku }}</p>
              </div>
              
              <!-- Tanggal Lahir (selalu muncul, col-span jika WNI) -->
              <div :class="simpleForm.kewarganegaraan === 'WNI' ? 'md:col-span-1' : ''">
                <label class="block text-sm font-medium text-gray-600 mb-1.5">Tanggal Lahir</label>
                <div class="relative">
                  <input
                    v-model="simpleForm.tanggalLahir"
                    type="date"
                    class="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400 transition-all duration-150"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p v-if="simpleErrors.tanggalLahir" class="text-xs text-red-600 mt-1">{{ simpleErrors.tanggalLahir }}</p>
              </div>
            </div>

            <!-- Baris 3: Kewarganegaraan (1 kolom, kiri) -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1.5">Kewarganegaraan</label>
                <div class="relative">
                  <select
                    v-model="simpleForm.kewarganegaraan"
                    class="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400 transition-all duration-150 appearance-none pr-10"
                  >
                    <option>WNI</option>
                    <option>WNA</option>
                  </select>
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Kode Captcha / Verifikasi -->
            <div class="grid grid-cols-[140px_1fr] md:grid-cols-[180px_240px] gap-3 items-center">
              <div class="relative select-none">
                <div class="bg-white border border-gray-300 rounded-md h-[44px] flex items-center justify-center text-lg tracking-widest">
                  {{ captcha }}
                </div>
                <button
                  class="absolute -right-2 -top-2 bg-white border border-gray-300 rounded-full w-7 h-7 grid place-items-center shadow-sm hover:bg-gray-50 transition-colors"
                  @click="refreshCaptcha"
                  title="Refresh"
                >
                  ⟳
                </button>
              </div>
              <div>
                <TextField
                  v-model="simpleForm.captchaInput"
                  use-custom-class
                  custom-class="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md bg-white shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400 transition-all duration-150"
                  placeholder="Masukkan angka"
                />
                <p v-if="simpleErrors.captcha" class="text-xs text-red-600 mt-1">{{ simpleErrors.captcha }}</p>
              </div>
            </div>

            <!-- Tombol Daftar (diratakan kanan bawah) -->
            <div class="flex justify-end mt-4">
              <Button
                @click="handleSimpleSubmit"
                use-custom-class
                custom-class="h-[42px] bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-6 rounded-md shadow-md text-sm transition-colors duration-200"
              >
                DAFTAR
              </Button>
            </div>
          </div>
        </template>
      </ContentContainer>

      <!-- STEP 2: FORM RINCI -->
      <ContentContainer v-if="currentStep === 2">
        <template #body>
          <div class="space-y-6">
            <!-- Data Pekerjaan Section -->
            <h3 class="text-sm font-semibold text-gray-700 mt-2 mb-3 border-b border-gray-200 pb-2">
              💼 Data Pekerjaan
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1.5">
                  No. Identitas {{ simpleForm.kewarganegaraan === 'WNI' ? '(NIK)' : '(No Passpor)' }}:
                </label>
                <input 
                  disabled 
                  :value="simpleForm.kewarganegaraan === 'WNI' ? simpleForm.nik : simpleForm.noPasspor" 
                  class="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-100" 
                />
              </div>
              <!-- Masa Berlaku Passpor (muncul jika WNA) -->
              <div v-if="simpleForm.kewarganegaraan === 'WNA'">
                <label class="block text-sm font-medium text-gray-600 mb-1.5">Masa Berlaku Passpor:</label>
                <input disabled :value="simpleForm.masaBerlaku" class="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-100" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1.5">Status Pegawai: *</label>
                <div class="relative">
                  <select v-model="detailForm.statusPegawai" class="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400 transition-all duration-150 appearance-none pr-10">
                    <option value="" disabled>-Pilih-</option>
                    <option>PKWT</option>
                    <option>PKWTT</option>
                    <option>Magang</option>
                  </select>
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <p v-if="detailErrors.statusPegawai" class="text-xs text-red-600 mt-1">{{ detailErrors.statusPegawai }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1.5">Nama Lengkap:</label>
                <input disabled :value="simpleForm.namaLengkap" class="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-100" />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-600 mb-1.5">Tanggal Awal Bekerja: *</label>
                  <div class="relative">
                    <input v-model="detailForm.tanggalAwalKerja" type="date" class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400 transition-all duration-150" />
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p v-if="detailErrors.tanggalAwalKerja" class="text-xs text-red-600 mt-1">{{ detailErrors.tanggalAwalKerja }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-600 mb-1.5">Tanggal Akhir Kontrak:</label>
                  <div class="relative">
                    <input   v-model="detailForm.tanggalAkhirKontrak"
                     type="date"
                     :readonly="detailForm.statusPegawai === 'PKWTT'"
                     :class="['w-full px-3 py-2.5 text-sm border rounded-md',detailForm.statusPegawai === 'PKWTT' ? 'bg-gray-100' : 'bg-white']" />
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1.5">Lokasi Pekerjaan: *</label>
                <TextField
                  v-model="detailForm.lokasiPekerjaan"
                  use-custom-class
                  custom-class="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400 transition-all duration-150"
                  placeholder="Masukkan lokasi pekerjaan"
                />
                <p v-if="detailErrors.lokasiPekerjaan" class="text-xs text-red-600 mt-1">{{ detailErrors.lokasiPekerjaan }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1.5">Upah: *</label>
                <input v-model="detailForm.upah" type="number" min="0" class="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400 transition-all duration-150" />
                <p class="text-xs text-gray-500 mt-0.5">Contoh: 5000000</p>
                <p v-if="detailErrors.upah" class="text-xs text-red-600 mt-1">{{ detailErrors.upah }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1.5">KPJ</label>
                <TextField
                  v-model="detailForm.kpj"
                  :readonly="hasBPJSCard === true"
                  use-custom-class
                  :custom-class="['w-full px-4 py-2.5 text-sm border rounded-md transition-all duration-150 focus:outline-none',
                  hasBPJSCard ? 'bg-gray-200 border-gray-300 text-gray-700 cursor-not-allowed' : 'bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400'
                  ].join(' ')"
                  placeholder="Masukkan nomor KPJ"
                />
                <p class="text-xs text-gray-500 mt-0.5">Nomor Kartu Peserta Jaminan</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1.5">No Pegawai</label>
                <TextField
                  v-model="detailForm.noPegawai"
                  use-custom-class
                  custom-class="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400 transition-all duration-150"
                  placeholder="Masukkan nomor pegawai"
                />
              </div>
            </div>

            <!-- Data Pribadi Section -->
            <h3 class="text-sm font-semibold text-gray-700 mt-6 mb-3 border-b border-gray-200 pb-2">
              🧍 Data Pribadi
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1.5">Tempat Lahir: *</label>
                <TextField
                  v-model="detailForm.tempatLahir"
                  use-custom-class
                  custom-class="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400 transition-all duration-150"
                  placeholder="Masukkan tempat lahir"
                />
                <p v-if="detailErrors.tempatLahir" class="text-xs text-red-600 mt-1">{{ detailErrors.tempatLahir }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1.5">Tanggal Lahir:</label>
                <input disabled :value="simpleForm.tanggalLahir" class="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-100" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1.5">Ibu Kandung: *</label>
                <TextField
                  v-model="detailForm.ibuKandung"
                  use-custom-class
                  custom-class="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400 transition-all duration-150"
                  placeholder="Masukkan nama ibu kandung"
                />
                <p v-if="detailErrors.ibuKandung" class="text-xs text-red-600 mt-1">{{ detailErrors.ibuKandung }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1.5">Gol Darah: *</label>
                <div class="relative">
                  <select v-model="detailForm.golDarah" class="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400 transition-all duration-150 appearance-none pr-10">
                    <option value="" disabled>-Pilih-</option>
                    <option>A</option>
                    <option>B</option>
                    <option>AB</option>
                    <option>O</option>
                  </select>
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <p v-if="detailErrors.golDarah" class="text-xs text-red-600 mt-1">{{ detailErrors.golDarah }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1.5">Jenis Kelamin: *</label>
                <div class="relative">
                  <select v-model="detailForm.jenisKelamin" class="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400 transition-all duration-150 appearance-none pr-10">
                    <option value="" disabled>-Pilih-</option>
                    <option>Laki-laki</option>
                    <option>Perempuan</option>
                  </select>
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <p v-if="detailErrors.jenisKelamin" class="text-xs text-red-600 mt-1">{{ detailErrors.jenisKelamin }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1.5">Status Kawin: *</label>
                <div class="relative">
                  <select v-model="detailForm.statusKawin" class="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400 transition-all duration-150 appearance-none pr-10">
                    <option value="" disabled>-Pilih-</option>
                    <option>Belum Kawin</option>
                    <option>Kawin</option>
                    <option>Cerai</option>
                  </select>
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <p v-if="detailErrors.statusKawin" class="text-xs text-red-600 mt-1">{{ detailErrors.statusKawin }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1.5">Nomor Telepon Rumah</label>
                <TextField
                  v-model="detailForm.noTelpRumah"
                  use-custom-class
                  custom-class="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400 transition-all duration-150"
                  placeholder="Masukkan nomor telepon rumah"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1.5">Handphone</label>
                <TextField
                  v-model="detailForm.handphone"
                  use-custom-class
                  custom-class="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400 transition-all duration-150"
                  placeholder="Masukkan nomor handphone"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1.5">NPWP</label>
                <TextField
                  v-model="detailForm.npwp"
                  use-custom-class
                  custom-class="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400 transition-all duration-150"
                  placeholder="Masukkan NPWP"
                />
                <p class="text-xs text-gray-500 mt-0.5">Format: XX.XXX.XXX.X-XXX.XXX</p>
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-600 mb-1.5">Email</label>
                <input v-model="detailForm.email" type="email" class="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400 transition-all duration-150" />
              </div>
            </div>

            <!-- Data Alamat Section -->
            <h3 class="text-sm font-semibold text-gray-700 mt-6 mb-3 border-b border-gray-200 pb-2">
              🏠 Data Alamat
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <TextArea
                  v-model="detailForm.alamat"
                  label="Alamat: *"
                  :rows="3"
                  use-custom-class
                  custom-class="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400 transition-all duration-150 resize-none"
                  placeholder="Masukkan alamat lengkap"
                />
                <p v-if="detailErrors.alamat" class="text-xs text-red-600 mt-1">{{ detailErrors.alamat }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1.5">Kabupaten: *</label>
                <TextField
                  v-model="detailForm.kabupaten"
                  use-custom-class
                  custom-class="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400 transition-all duration-150"
                  placeholder="Masukkan kabupaten"
                />
                <p v-if="detailErrors.kabupaten" class="text-xs text-red-600 mt-1">{{ detailErrors.kabupaten }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1.5">Kode Pos: *</label>
                <TextField
                  v-model="detailForm.kodePos"
                  use-custom-class
                  custom-class="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400 transition-all duration-150"
                  placeholder="Masukkan kode pos"
                />
                <p v-if="detailErrors.kodePos" class="text-xs text-red-600 mt-1">{{ detailErrors.kodePos }}</p>
              </div>
            </div>

            <div class="flex items-center justify-between">
                <Button
                @click="handleDetailSubmit"
                use-custom-class
                :disabled="isSavingWorker"
                custom-class="h-[42px] bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-6 rounded-md shadow-md text-sm transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed">
                SIMPAN
                </Button>
            </div>
            <p v-if="submissionError" class="text-sm text-red-600 mt-3">
              {{ submissionError }}
            </p>
          </div>
        </template>
      </ContentContainer>
    </div>

    <!-- Modal Persetujuan -->
    <Dialog
      header="Persetujuan"
      :isDialogOpen="showApprovalModal"
      @close="handleApprovalDecline"
      :dialogClass="'bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden flex flex-col'"
      :bodyClass="'px-6 py-6 text-center'"
      :showCloseButton="false"
    >
      <template #header>
        <h2 class="text-xl font-bold text-gray-800 px-6 pt-6">Persetujuan</h2>
      </template>
      <template #body>
        <p class="text-sm text-gray-700 leading-relaxed">
          Dengan ini saya menyatakan bahwa data yang disampaikan merupakan data yang sebenarnya dan bersedia jika data yang didaftarkan disimpan BPJS Ketenagakerjaan sebagai data peserta.
        </p>
      </template>
      <template #footer>
        <div class="px-6 pb-6 flex items-center justify-center gap-3">
          <button
            @click="handleApprovalAccept"
            class="px-6 py-2 text-sm font-semibold bg-green-600 text-white rounded-md shadow hover:bg-green-700 transition-colors"
          >
            SETUJU
          </button>
          <button
            @click="handleApprovalDecline"
            class="px-6 py-2 text-sm font-semibold border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition-colors"
          >
            TIDAK
          </button>
        </div>
      </template>
    </Dialog>

    <!-- Modal BPJS Ketenagakerjaan -->
    <Dialog
      :isDialogOpen="showBPJSModal"
      @close="handleCloseBPJS"
      :dialogClass="'bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden flex flex-col'"
      :bodyClass="'px-6 py-6'"
      :showCloseButton="false"
    >
      <template #header>
        <div class="bg-green-600 px-6 py-4 rounded-t-lg">
          <h2 class="text-lg font-bold text-white">
            Apakah tenaga kerja sudah memiliki kartu BPJS Ketenagakerjaan?
          </h2>
        </div>
      </template>
      <template #body>
        <div class="flex gap-4 mb-6">
          <button
            @click="handleBPJSCardSelect(true)"
            :class="[
              'flex-1 flex flex-col items-center justify-center gap-2 py-4 px-4 rounded-lg border-2 transition-all',
              hasBPJSCard === true 
                ? 'bg-green-600 border-green-600 text-white' 
                : 'bg-white border-gray-300 text-gray-700 hover:border-green-500'
            ]"
          >
            <i class="mdi mdi-account-multiple text-2xl"></i>
            <span class="font-semibold text-sm uppercase">SUDAH</span>
          </button>
          <button
            @click="handleBPJSCardSelect(false)"
            :class="[
              'flex-1 flex flex-col items-center justify-center gap-2 py-4 px-4 rounded-lg border-2 transition-all',
              hasBPJSCard === false 
                ? 'bg-red-600 border-red-600 text-white' 
                : 'bg-white border-gray-300 text-gray-700 hover:border-red-500'
            ]"
          >
            <i class="mdi mdi-clock-outline text-2xl"></i>
            <span class="font-semibold text-sm uppercase">BELUM</span>
          </button>
        </div>

        <div v-if="bpjsWarning" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div class="flex items-start gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-sm text-red-700">{{ bpjsWarning }}</p>
          </div>
        </div>

        <div v-if="hasBPJSCard === true" class="mb-6">
          <TextField
            id="kpj-input"
            v-model="kpjNumber"
            use-custom-class
            custom-class="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400 transition-all duration-150"
            placeholder="Input No KPJ"
          />
        </div>

        <div v-if="hasBPJSCard === false" class="space-y-3 mb-6">
          <div class="flex items-center gap-2">
            <input
              type="radio"
              id="wni"
              v-model="simpleForm.kewarganegaraan"
              value="WNI"
              class="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
            />
            <label for="wni" class="text-sm text-gray-700 cursor-pointer">
              Warga Negara Indonesia (WNI)
            </label>
          </div>
          <div class="flex items-center gap-2">
            <input
              type="radio"
              id="wna"
              v-model="simpleForm.kewarganegaraan"
              value="WNA"
              class="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
            />
            <label for="wna" class="text-sm text-gray-700 cursor-pointer">
              Warga Negara Asing (WNA)
            </label>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="px-6 py-4 border-t border-gray-200 flex justify-center">
          <button
            @click="handleContinueBPJS"
            class="px-6 py-2 text-sm font-semibold text-green-600 hover:text-green-700 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            LANJUT
          </button>
        </div>
      </template>
    </Dialog>

    <!-- Modal Peringatan -->
    
    <!-- Modal Success -->
    <SuccessModal
      :is-open="showSuccessModal"
      :message="successMessage"
      @close="showSuccessModal = false"
    />
  </div>
</template>
